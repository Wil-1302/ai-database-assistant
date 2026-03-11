'use strict';

// ============================================================
// Exportador CSV — v0.6
// Convierte columnas + filas a formato CSV (RFC 4180) y lo
// escribe en disco. Incluye BOM UTF-8 para compatibilidad con Excel.
// ============================================================

const fs = require('fs');

/**
 * Escapa un valor para CSV según RFC 4180.
 * Si contiene coma, comilla doble o salto de línea, lo rodea con comillas dobles.
 * Las comillas dobles internas se duplican ("").
 *
 * @param {any} valor
 * @returns {string}
 */
function escaparValorCSV(valor) {
  if (valor === null || valor === undefined) return '';
  const str = String(valor);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Genera el contenido CSV como string.
 *
 * @param {string[]} columnas
 * @param {object[]} filas
 * @returns {string}
 */
function generarCSV(columnas, filas) {
  const lineas = [];
  lineas.push(columnas.map(escaparValorCSV).join(','));
  for (const fila of filas) {
    lineas.push(columnas.map((col) => escaparValorCSV(fila[col])).join(','));
  }
  return lineas.join('\r\n');
}

/**
 * Escribe un CSV en la ruta indicada.
 * El archivo incluye BOM UTF-8 para que Excel lo abra correctamente.
 *
 * @param {string}   ruta
 * @param {string[]} columnas
 * @param {object[]} filas
 */
function exportarCSV(ruta, columnas, filas) {
  const contenido = generarCSV(columnas, filas);
  // \uFEFF = BOM UTF-8
  fs.writeFileSync(ruta, '\uFEFF' + contenido, 'utf8');
  console.log(`[exportarCSV] Exportado: ${ruta} (${filas.length} filas, ${columnas.length} columnas)`);
}

module.exports = { exportarCSV, generarCSV };
