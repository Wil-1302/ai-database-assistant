'use strict';

// ============================================================
// Generador de SQL desde lenguaje natural — v0.6.4
// Usa Ollama para convertir preguntas en español a SQL correcto.
// Incluye instrucciones de nivel senior, detección de JOINs y
// patrones NL→SQL para consultas comunes de negocio.
// ============================================================

const { generarTexto } = require('./cliente-ollama');

/**
 * Modelo de Ollama que se usará por defecto.
 * Cámbialo aquí para usar otro modelo instalado en tu Ollama.
 * Recomendados: "llama3.2", "mistral", "qwen2.5-coder", "phi3"
 */
const MODELO_POR_DEFECTO = 'llama3.2';

// -----------------------------------------------
// Instrucción de sistema — nivel ingeniero senior
// -----------------------------------------------

const INSTRUCCION_SISTEMA = `Eres un ingeniero senior de bases de datos con 15 años de experiencia en SQL y SQLite.
Tu única tarea es convertir preguntas en español a consultas SQL correctas, eficientes y bien razonadas.

FORMATO DE RESPUESTA (exacto, sin variaciones):
\`\`\`sql
[CONSULTA SQL AQUÍ]
\`\`\`
EXPLICACIÓN: [1-2 frases en español explicando qué hace la consulta]

══════════════════════════════════════════════════
REGLAS SQL CRÍTICAS
══════════════════════════════════════════════════
• Usa SOLO tablas y columnas que aparezcan en el ESQUEMA proporcionado.
• No inventes columnas, tablas ni valores que no existan en el esquema.
• Cita siempre los identificadores con comillas dobles: "tabla"."columna".
• Para datos de 2 tablas distintas → usa INNER JOIN con la clave _id.
• Para rankings/el mayor/top → ORDER BY col DESC LIMIT N.
• Para sumas y totales → SUM(), COUNT(), AVG(), MAX(), MIN().
• Para agrupar por entidad → GROUP BY (agrupa por nombre, no por id).
• Fechas en SQLite → strftime('%Y-%m', "col_fecha") para agrupar por mes.
• Si la pregunta no se puede responder con el esquema → explícalo en EXPLICACIÓN.

══════════════════════════════════════════════════
PATRONES ESPAÑOL → SQL (aprende y aplica siempre)
══════════════════════════════════════════════════
"más vendido / mayor vendido / más comprado / mayor ventas tuvo"
  → INNER JOIN tabla_detalle ON ..._id = id
    GROUP BY entidad.nombre
    ORDER BY SUM(cantidad) DESC LIMIT 1

"top N / los N mejores / los N más... / los primeros N"
  → ORDER BY ... DESC LIMIT N

"cuántos / total de / cantidad de / número de"
  → COUNT(*) o SUM(columna_numerica)

"por mes / mensual / cada mes / mes a mes"
  → GROUP BY strftime('%Y-%m', "columna_fecha")

"promedio / media / en promedio"
  → AVG(columna_numerica)

"más frecuente / más registros / más usado / más aparece"
  → GROUP BY entidad ORDER BY COUNT(*) DESC LIMIT 1

"más recetado / más prescrito / más asignado"
  → JOIN + GROUP BY + ORDER BY COUNT(*) o SUM(cantidad) DESC LIMIT 1

"el que más / quien más / cuál fue el mayor / el top"
  → GROUP BY + ORDER BY ... DESC LIMIT 1

"por categoría / agrupado por / desglosado por"
  → GROUP BY categoria_col, SUM o COUNT

══════════════════════════════════════════════════
CÓMO RAZONAR CON RELACIONES (_id = clave foránea)
══════════════════════════════════════════════════
1. Toda columna que termina en "_id" referencia la tabla de ese nombre.
   Ejemplo: "medicamento_id" → tabla "medicamentos", columna "id"
2. Para responder sobre una entidad A usando datos de tabla B:
   → INNER JOIN B ON A.id = tabla_con_datos.a_id
3. Para rankings de entidades → usa las TABLAS DE DETALLE que tienen
   columnas de cantidad/precio, no las tablas maestras.
4. Usa las secciones "RELACIONES" y "TABLAS DE DETALLE" del esquema.

EJEMPLO COMPLETO RAZONADO:
Pregunta: "qué medicamento fue más vendido"
Razonamiento:
  • Cantidades vendidas → "detalle_ventas" (tiene medicamento_id, cantidad)
  • Nombre del medicamento → "medicamentos" (tiene id, nombre)
  • Unión: detalle_ventas.medicamento_id = medicamentos.id
  • Agrupación: GROUP BY medicamentos.nombre
  • Métrica: SUM(detalle_ventas.cantidad) → ordenar DESC, tomar LIMIT 1
SQL resultante:
SELECT m."nombre", SUM(dv."cantidad") AS total_vendido
FROM "detalle_ventas" dv
INNER JOIN "medicamentos" m ON dv."medicamento_id" = m."id"
GROUP BY m."nombre"
ORDER BY total_vendido DESC
LIMIT 1

Aplica el mismo patrón para:
• "doctor con más citas" → citas.doctor_id JOIN doctores, COUNT(*) DESC LIMIT 1
• "curso con más estudiantes" → matriculas.curso_id JOIN cursos, COUNT(*) DESC LIMIT 1
• "cliente con más compras" → ventas.cliente_id JOIN clientes, SUM(total) DESC LIMIT 1
• "producto más vendido" → detalle_ventas.producto_id JOIN productos, SUM(cantidad) DESC LIMIT 1
• "empleado más productivo" → produccion.empleado_id JOIN empleados, SUM(cantidad) DESC LIMIT 1`;

// -----------------------------------------------
// Función principal pública
// -----------------------------------------------

/**
 * Genera una consulta SQL y su explicación a partir de una pregunta en español.
 *
 * @param {string} pregunta - Pregunta del usuario en lenguaje natural
 * @param {object} esquema  - Esquema devuelto por gestor-datos.obtenerEsquema()
 * @param {string} [modelo] - Modelo de Ollama a usar (usa MODELO_POR_DEFECTO si se omite)
 * @returns {Promise<{ sql: string, explicacion: string }>}
 */
async function generarSQL(pregunta, esquema, modelo) {
  const modeloFinal    = modelo || MODELO_POR_DEFECTO;
  const contextoEsquema = formatearEsquema(esquema);

  const prompt =
    `ESQUEMA DE LA BASE DE DATOS:\n${contextoEsquema}\n\n` +
    `PREGUNTA DEL USUARIO: ${pregunta}\n\n` +
    'Analiza el esquema, identifica las tablas y relaciones necesarias, ' +
    'y genera la consulta SQL correcta con su explicación.';

  const respuestaRaw = await generarTexto(modeloFinal, prompt, INSTRUCCION_SISTEMA);
  return parsearRespuesta(respuestaRaw);
}

// -----------------------------------------------
// Formateo enriquecido del esquema
// -----------------------------------------------

/**
 * Convierte el esquema a texto enriquecido con anotaciones de FK,
 * sección de relaciones detectadas y consejos de consulta.
 *
 * @param {{ tablas: Array }} esquema
 * @returns {string}
 */
function formatearEsquema(esquema) {
  if (!esquema || !Array.isArray(esquema.tablas) || esquema.tablas.length === 0) {
    return '(Sin esquema cargado — importa un archivo o genera un dataset primero)';
  }

  const tablaNombres = new Set(esquema.tablas.map((t) => t.nombre));

  // ── 1. Tablas con anotaciones de tipo y FK ──────────────────
  const secTablas = esquema.tablas.map((tabla) => {
    const cols = tabla.columnas.map((col) => {
      let anotacion = '';
      if (col.nombre === 'id') {
        anotacion = ' [PK]';
      } else if (col.nombre.endsWith('_id')) {
        const ref   = col.nombre.slice(0, -3);
        const match = [ref, ref + 's', ref + 'es'].find((c) => tablaNombres.has(c));
        if (match) anotacion = ` [FK → "${match}".id]`;
      }
      return `  - ${col.nombre} [${col.tipo}]${anotacion}`;
    }).join('\n');

    return `Tabla "${tabla.nombre}" (${tabla.totalFilas} filas):\n${cols}`;
  }).join('\n\n');

  // ── 2. Mapa de relaciones entre tablas ────────────────────────
  const relaciones = [];
  for (const tabla of esquema.tablas) {
    for (const col of tabla.columnas) {
      if (!col.nombre.endsWith('_id') || col.nombre === 'id') continue;
      const ref   = col.nombre.slice(0, -3);
      const match = [ref, ref + 's', ref + 'es'].find((c) => tablaNombres.has(c));
      if (match) {
        relaciones.push(
          `  "${tabla.nombre}".${col.nombre} → "${match}".id` +
          `  (JOIN: "${tabla.nombre}" ON "${tabla.nombre}".${col.nombre} = "${match}".id)`
        );
      }
    }
  }

  // ── 3. Consejos para tablas de detalle/transacción ──────────
  const tablasDetalle = esquema.tablas.filter(
    (t) => /detalle|items?$|linea/.test(t.nombre)
  );
  const consejosDetalle = tablasDetalle.map((t) => {
    const colQty   = t.columnas.find((c) => /^cantidad$|^qty$|^unidades$|^volumen$/.test(c.nombre));
    const colPrice = t.columnas.find((c) => /precio|monto|importe|subtotal/.test(c.nombre));
    const partes   = [];
    if (colQty)   partes.push(`"${colQty.nombre}" para contar volumen`);
    if (colPrice) partes.push(`"${colPrice.nombre}" para calcular valor`);
    const refsFK = t.columnas
      .filter((c) => c.nombre.endsWith('_id') && c.nombre !== 'id')
      .map((c) => c.nombre);
    return (
      `  TABLA DE DETALLE "${t.nombre}": ` +
      `úsala para rankings y totales vía ${partes.join(' y ') || 'sus columnas numéricas'}` +
      (refsFK.length ? `; unir por ${refsFK.join(', ')}` : '')
    );
  });

  // ── Construir texto final ─────────────────────────────────────
  let resultado = secTablas;

  if (relaciones.length > 0) {
    resultado +=
      '\n\nRELACIONES ENTRE TABLAS (úsalas para construir JOINs):\n' +
      relaciones.join('\n');
  }

  if (consejosDetalle.length > 0) {
    resultado +=
      '\n\nCONSEJOS PARA CONSULTAS DE VOLUMEN Y RANKINGS:\n' +
      consejosDetalle.join('\n');
  }

  return resultado;
}

// -----------------------------------------------
// Parseo de la respuesta del modelo
// -----------------------------------------------

/**
 * Extrae el bloque SQL y la explicación de la respuesta del modelo.
 * Tolerante a variaciones menores en el formato.
 *
 * @param {string} respuesta - Texto devuelto por Ollama
 * @returns {{ sql: string, explicacion: string }}
 */
function parsearRespuesta(respuesta) {
  // Extraer bloque SQL entre ```sql ... ``` o ``` ... ```
  const regexSQL       = /```(?:sql)?\s*([\s\S]*?)```/i;
  const coincidenciaSQL = respuesta.match(regexSQL);
  const sql             = coincidenciaSQL ? coincidenciaSQL[1].trim() : '';

  // Extraer explicación
  let explicacion = '';
  const regexExp       = /EXPLICACI[OÓ]N\s*:\s*([\s\S]+?)(?:\n\n|$)/i;
  const coincidenciaExp = respuesta.match(regexExp);

  if (coincidenciaExp) {
    explicacion = coincidenciaExp[1].trim();
  } else {
    explicacion = respuesta
      .replace(regexSQL, '')
      .replace(/^EXPLICACI[OÓ]N\s*:\s*/i, '')
      .trim();
  }

  return {
    sql:         sql || respuesta.trim(),
    explicacion: explicacion || 'Consulta generada a partir de tu pregunta.',
  };
}

module.exports = { generarSQL, formatearEsquema, MODELO_POR_DEFECTO };
