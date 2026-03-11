'use strict';

// ============================================================
// Interpretador de esquema desde lenguaje natural — v0.5
// Usa Ollama para convertir una descripción en español a un
// esquema JSON estructurado con tablas, columnas y tipos.
// ============================================================

const { generarTexto } = require('../ia/cliente-ollama');
const { MODELO_POR_DEFECTO } = require('../ia/generador-sql');

// Tipos de columna válidos en el sistema
const TIPOS_VALIDOS = new Set(['texto', 'numero', 'fecha', 'booleano']);

// Número de filas por defecto si el modelo no especifica
const FILAS_POR_DEFECTO = 50;
const FILAS_MIN = 20;
const FILAS_MAX = 100;

// Instrucción de sistema: exige JSON puro, sin texto adicional
const INSTRUCCION_SISTEMA = `Eres un experto en modelado de bases de datos relacionales.
Tu única tarea es interpretar una descripción en español y devolver un esquema JSON.

RESPONDE ÚNICAMENTE con JSON válido. Sin texto adicional. Sin bloques de código. Sin explicaciones.

El formato exacto es:
{"tablas":[{"nombre":"nombre_tabla","filas":50,"columnas":[{"nombre":"id","tipo":"numero"},{"nombre":"nombre_columna","tipo":"texto"}]}]}

Tipos válidos: "texto", "numero", "fecha", "booleano"

Reglas obligatorias:
- Los nombres de tabla y columna deben ser en minúsculas con guiones bajos, sin acentos ni caracteres especiales
- Cada tabla DEBE tener una columna "id" de tipo "numero" como primera columna
- Si hay relaciones entre tablas (ej: una venta tiene un cliente), usa sufijo "_id" en la columna de referencia (ej: cliente_id, producto_id)
- Las filas deben estar entre ${FILAS_MIN} y ${FILAS_MAX}
- Elige columnas realistas y coherentes con el dominio descrito
- No uses palabras reservadas SQL como nombre de tabla/columna (order, table, group, select, etc.)

Reglas de riqueza estructural (OBLIGATORIAS):
- Genera SIEMPRE entre 3 y 6 tablas salvo que el dominio solo tenga sentido con menos
- Cada tabla debe tener al menos 5 columnas útiles además del id
- Incluye SIEMPRE tablas de entidades principales Y tablas de relación (ej: ventas + detalle_ventas, pedidos + detalle_pedidos)
- Modela las entidades más importantes del dominio: clientes, productos, categorías, proveedores, empleados, etc.
- Si el dominio implica transacciones (ventas, pedidos, reservas, compras), incluye la tabla de transacción Y su tabla de detalle
- Usa relaciones _id coherentes: si existe tabla "clientes" e "id", la tabla "ventas" debe tener "cliente_id"
- NO generes una sola tabla mínima; eso no es útil para el usuario`;

/**
 * Interpreta una descripción en lenguaje natural y devuelve un esquema estructurado.
 *
 * @param {string} descripcion - Descripción del dataset en español
 * @param {string} [modelo]    - Modelo de Ollama a usar (opcional)
 * @returns {Promise<{ tablas: Array<{ nombre: string, filas: number, columnas: Array<{ nombre: string, tipo: string }> }> }>}
 */
async function interpretarEsquema(descripcion, modelo) {
  const modeloFinal = modelo || MODELO_POR_DEFECTO;

  const prompt =
    `Descripción del dataset: ${descripcion}\n\n` +
    'Genera el esquema JSON para esta base de datos. Responde solo con el JSON.';

  console.log('[interpretarEsquema] Enviando descripción a Ollama:', descripcion);
  const respuestaRaw = await generarTexto(modeloFinal, prompt, INSTRUCCION_SISTEMA);
  console.log('[interpretarEsquema] Respuesta raw:', respuestaRaw.slice(0, 300));

  return parsearYValidarEsquema(respuestaRaw);
}

// -----------------------------------------------
// Parsing y validación del JSON
// -----------------------------------------------

/**
 * Extrae y valida el esquema JSON de la respuesta del modelo.
 * Es tolerante a bloques de código markdown y texto adicional.
 *
 * @param {string} respuesta
 * @returns {{ tablas: Array }}
 */
function parsearYValidarEsquema(respuesta) {
  let texto = respuesta.trim();

  // Eliminar posibles bloques de código markdown
  texto = texto.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();

  let esquema;

  // Intento 1: parsear directamente
  try {
    esquema = JSON.parse(texto);
  } catch {
    // Intento 2: extraer el primer objeto JSON de la respuesta
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(
        'La IA no devolvió un JSON válido. ' +
        'Intenta describir el dataset de forma más clara y concreta.'
      );
    }
    try {
      esquema = JSON.parse(match[0]);
    } catch {
      throw new Error(
        'No se pudo interpretar el esquema devuelto por la IA. ' +
        'Intenta con una descripción más sencilla.'
      );
    }
  }

  return normalizarEsquema(esquema);
}

/**
 * Valida y normaliza el esquema JSON.
 * Lanza error si la estructura es inválida.
 *
 * @param {object} esquema
 * @returns {{ tablas: Array }}
 */
function normalizarEsquema(esquema) {
  if (!esquema || !Array.isArray(esquema.tablas) || esquema.tablas.length === 0) {
    throw new Error('El esquema no contiene tablas. Describe mejor las tablas que necesitas.');
  }

  const nombresTabla = new Set();

  const tablas = esquema.tablas.map((tabla, idx) => {
    if (!tabla.nombre || typeof tabla.nombre !== 'string') {
      throw new Error(`La tabla #${idx + 1} no tiene nombre válido.`);
    }

    // Normalizar nombre: minúsculas, sin acentos, guiones → guiones bajos
    const nombre = normalizarIdentificador(tabla.nombre);

    if (nombresTabla.has(nombre)) {
      // Si hay duplicados, renombrar con sufijo
      const nombreUnico = `${nombre}_${idx}`;
      nombresTabla.add(nombreUnico);
      return procesarTabla({ ...tabla, nombre: nombreUnico });
    }

    nombresTabla.add(nombre);
    return procesarTabla({ ...tabla, nombre });
  });

  return { tablas };
}

/**
 * Procesa una tabla individual: normaliza nombre, columnas y filas.
 */
function procesarTabla(tabla) {
  const nombre = normalizarIdentificador(tabla.nombre);

  // Número de filas: respetar lo que dijo el modelo dentro del rango permitido
  let filas = FILAS_POR_DEFECTO;
  if (typeof tabla.filas === 'number' && tabla.filas > 0) {
    filas = Math.max(FILAS_MIN, Math.min(FILAS_MAX, Math.round(tabla.filas)));
  }

  if (!Array.isArray(tabla.columnas) || tabla.columnas.length === 0) {
    throw new Error(`La tabla "${nombre}" no tiene columnas definidas.`);
  }

  const nombresCol = new Set();

  // Asegurar que siempre haya columna "id" como primera columna
  let columnasBruto = tabla.columnas.map((col) => ({
    nombre: normalizarIdentificador(col.nombre || ''),
    tipo:   TIPOS_VALIDOS.has(col.tipo) ? col.tipo : 'texto',
  })).filter((col) => col.nombre !== '');

  const tieneId = columnasBruto.some((c) => c.nombre === 'id');
  if (!tieneId) {
    columnasBruto = [{ nombre: 'id', tipo: 'numero' }, ...columnasBruto];
  }

  const columnas = [];
  for (const col of columnasBruto) {
    if (nombresCol.has(col.nombre)) continue; // omitir duplicados
    nombresCol.add(col.nombre);
    columnas.push(col);
  }

  return { nombre, filas, columnas };
}

/**
 * Normaliza un identificador SQL:
 * minúsculas, sin acentos, espacios y guiones → guiones bajos.
 *
 * @param {string} nombre
 * @returns {string}
 */
function normalizarIdentificador(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[\s\-]+/g, '_')        // espacios y guiones → _
    .replace(/[^a-z0-9_]/g, '')      // solo alfanumérico y _
    .replace(/^(\d)/, '_$1')         // no puede empezar por dígito
    .slice(0, 60);                    // límite razonable de longitud
}

module.exports = { interpretarEsquema };
