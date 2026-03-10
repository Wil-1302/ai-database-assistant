'use strict';

// ============================================================
// Cliente para la API local de Ollama
// Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
// ============================================================

const http = require('http');

/** Puerto y host de Ollama por defecto */
const OLLAMA_HOST = 'localhost';
const OLLAMA_PORT = 11434;

/** Tiempo máximo de espera para la generación (ms) */
const TIMEOUT_GENERACION_MS = 120_000; // 2 minutos

/** Tiempo máximo para el chequeo de disponibilidad (ms) */
const TIMEOUT_PING_MS = 3_000;

/**
 * Genera texto a partir de un prompt usando la API de Ollama.
 *
 * @param {string} modelo  - Nombre del modelo instalado en Ollama (ej: "llama3.2")
 * @param {string} prompt  - Texto del prompt del usuario
 * @param {string} sistema - Instrucción del sistema (system prompt)
 * @returns {Promise<string>} Respuesta completa del modelo
 */
function generarTexto(modelo, prompt, sistema) {
  return new Promise((resolve, reject) => {
    const cuerpo = JSON.stringify({
      model:  modelo,
      prompt,
      system: sistema || '',
      stream: false,
    });

    const opciones = {
      hostname: OLLAMA_HOST,
      port:     OLLAMA_PORT,
      path:     '/api/generate',
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(cuerpo),
      },
    };

    const solicitud = http.request(opciones, (respuesta) => {
      let datos = '';

      respuesta.on('data', (fragmento) => {
        datos += fragmento;
      });

      respuesta.on('end', () => {
        try {
          const json = JSON.parse(datos);
          if (json.error) {
            reject(new Error(`Ollama devolvió un error: ${json.error}`));
          } else {
            resolve(json.response || '');
          }
        } catch {
          reject(new Error(
            'La respuesta de Ollama no es JSON válido. ' +
            'Es posible que el modelo haya devuelto una respuesta inesperada.'
          ));
        }
      });
    });

    // Tiempo límite para la generación completa
    solicitud.setTimeout(TIMEOUT_GENERACION_MS, () => {
      solicitud.destroy();
      reject(new Error(
        `La generación superó el tiempo límite (${TIMEOUT_GENERACION_MS / 1000}s). ` +
        'Prueba con un modelo más ligero o simplifica la pregunta.'
      ));
    });

    solicitud.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        reject(new Error(
          'No se pudo conectar con Ollama. ' +
          `Asegúrate de que Ollama esté ejecutándose en http://${OLLAMA_HOST}:${OLLAMA_PORT}. ` +
          'Puedes iniciarlo con el comando: ollama serve'
        ));
      } else {
        reject(new Error(`Error de red al contactar con Ollama: ${err.message}`));
      }
    });

    solicitud.write(cuerpo);
    solicitud.end();
  });
}

/**
 * Comprueba si el servidor Ollama está disponible y responde.
 * @returns {Promise<boolean>}
 */
function verificarDisponibilidad() {
  return new Promise((resolve) => {
    const opciones = {
      hostname: OLLAMA_HOST,
      port:     OLLAMA_PORT,
      path:     '/',
      method:   'GET',
    };

    const solicitud = http.request(opciones, () => {
      resolve(true);
    });

    solicitud.setTimeout(TIMEOUT_PING_MS, () => {
      solicitud.destroy();
      resolve(false);
    });

    solicitud.on('error', () => resolve(false));
    solicitud.end();
  });
}

module.exports = { generarTexto, verificarDisponibilidad };
