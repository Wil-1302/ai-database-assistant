'use strict';

// ============================================================
// Exportador JSON — v0.6
// Escribe resultados de consulta o datasets completos como
// archivos JSON formateados.
// ============================================================

const fs = require('fs');

/**
 * Exporta un array de filas (resultados SQL) como JSON formateado.
 *
 * @param {string}   ruta
 * @param {object[]} filas
 */
function exportarResultadosJSON(ruta, filas) {
  const contenido = JSON.stringify(filas, null, 2);
  fs.writeFileSync(ruta, contenido, 'utf8');
  console.log(`[exportarResultadosJSON] Exportado: ${ruta} (${filas.length} filas)`);
}

/**
 * Exporta un dataset completo (varias tablas) como un objeto JSON
 * con la forma: { nombre_tabla: [ ...filas ] }.
 *
 * @param {string} ruta
 * @param {Array<{ nombre: string, filas: object[] }>} tablas
 */
function exportarDatasetJSON(ruta, tablas) {
  const datos = {};
  for (const tabla of tablas) {
    datos[tabla.nombre] = tabla.filas;
  }
  const contenido = JSON.stringify(datos, null, 2);
  fs.writeFileSync(ruta, contenido, 'utf8');
  console.log(`[exportarDatasetJSON] Exportado: ${ruta} (${tablas.length} tablas)`);
}

module.exports = { exportarResultadosJSON, exportarDatasetJSON };
