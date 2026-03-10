'use strict';

// ============================================================
// Generador de SQL desde lenguaje natural usando Ollama
// Construye el prompt con el esquema como contexto y parsea
// la respuesta para extraer SQL y explicación por separado.
// ============================================================

const { generarTexto } = require('./cliente-ollama');

/**
 * Modelo de Ollama que se usará por defecto.
 * Cámbialo aquí para usar otro modelo instalado en tu Ollama
 * (ej: "mistral", "codellama", "qwen2.5-coder", "phi3").
 */
const MODELO_POR_DEFECTO = 'llama3.2';

// Instrucción de sistema: le da rol y reglas claras al modelo
const INSTRUCCION_SISTEMA = `Eres un asistente experto en SQL y bases de datos relacionales.
Tu única tarea es convertir preguntas en español a consultas SQL correctas.

RESPONDE SIEMPRE con este formato exacto — sin texto adicional antes ni después:

\`\`\`sql
[CONSULTA SQL AQUÍ]
\`\`\`

EXPLICACIÓN: [Una o dos frases en español explicando qué hace la consulta]

Reglas obligatorias:
- Usa SOLO las tablas y columnas del esquema proporcionado.
- No inventes columnas ni tablas que no existan en el esquema.
- No uses punto y coma al final a menos que sea necesario para múltiples sentencias.
- Si la pregunta no se puede responder con el esquema dado, explícalo en EXPLICACIÓN sin inventar SQL.
- No uses características específicas de un motor de base de datos concreto; prefiere SQL estándar.`;

/**
 * Genera una consulta SQL y su explicación a partir de una pregunta en español.
 *
 * @param {string} pregunta - Pregunta del usuario en lenguaje natural
 * @param {object} esquema  - Esquema devuelto por gestor-datos.obtenerEsquema()
 * @param {string} [modelo] - Modelo de Ollama a usar (usa MODELO_POR_DEFECTO si se omite)
 * @returns {Promise<{ sql: string, explicacion: string }>}
 */
async function generarSQL(pregunta, esquema, modelo) {
  const modeloFinal = modelo || MODELO_POR_DEFECTO;
  const contextoEsquema = formatearEsquema(esquema);

  const prompt =
    `Esquema de la base de datos:\n${contextoEsquema}\n\n` +
    `Pregunta del usuario: ${pregunta}\n\n` +
    'Genera la consulta SQL correspondiente y explícala brevemente en español.';

  const respuestaRaw = await generarTexto(modeloFinal, prompt, INSTRUCCION_SISTEMA);
  return parsearRespuesta(respuestaRaw);
}

// -----------------------------------------------
// Funciones auxiliares
// -----------------------------------------------

/**
 * Convierte el esquema de tablas a texto legible para el prompt.
 * @param {{ tablas: Array }} esquema
 * @returns {string}
 */
function formatearEsquema(esquema) {
  if (!esquema || !Array.isArray(esquema.tablas) || esquema.tablas.length === 0) {
    return '(Sin esquema cargado — no se ha importado ningún archivo todavía)';
  }

  return esquema.tablas.map((tabla) => {
    const columnas = tabla.columnas
      .map((col) => `  - ${col.nombre} [${col.tipo}]`)
      .join('\n');
    return `Tabla "${tabla.nombre}" (${tabla.totalFilas} filas):\n${columnas}`;
  }).join('\n\n');
}

/**
 * Extrae el bloque SQL y la explicación de la respuesta del modelo.
 * Es tolerante a variaciones menores en el formato.
 *
 * @param {string} respuesta - Texto completo devuelto por Ollama
 * @returns {{ sql: string, explicacion: string }}
 */
function parsearRespuesta(respuesta) {
  // Extraer bloque SQL entre ```sql ... ``` o ``` ... ```
  const regexSQL = /```(?:sql)?\s*([\s\S]*?)```/i;
  const coincidenciaSQL = respuesta.match(regexSQL);
  const sql = coincidenciaSQL ? coincidenciaSQL[1].trim() : '';

  // Extraer texto de explicación
  let explicacion = '';
  const regexExplicacion = /EXPLICACI[OÓ]N\s*:\s*([\s\S]+?)(?:\n\n|$)/i;
  const coincidenciaExp = respuesta.match(regexExplicacion);

  if (coincidenciaExp) {
    explicacion = coincidenciaExp[1].trim();
  } else {
    // Tomar todo el texto fuera del bloque SQL como explicación
    const textoDespuesSQL = respuesta.replace(regexSQL, '').trim();
    explicacion = textoDespuesSQL
      .replace(/^EXPLICACI[OÓ]N\s*:\s*/i, '')
      .trim();
  }

  return {
    // Si no se detectó bloque SQL, devolver toda la respuesta como SQL
    sql:         sql || respuesta.trim(),
    explicacion: explicacion || 'Consulta generada a partir de tu pregunta.',
  };
}

module.exports = { generarSQL, MODELO_POR_DEFECTO };
