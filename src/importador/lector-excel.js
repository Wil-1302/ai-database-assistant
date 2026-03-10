'use strict';

// ============================================================
// Lector de archivos Excel (.xlsx, .xls) usando la librería xlsx.
// Devuelve todas las hojas como tablas independientes.
// ============================================================

const path = require('path');
const XLSX = require('xlsx');
const { inferirEsquema } = require('./detector-esquema');

/**
 * Lee un archivo Excel y devuelve todas sus hojas como tablas.
 * @param {string} rutaArchivo  Ruta absoluta al archivo .xlsx / .xls
 * @returns {{
 *   tablas: {
 *     nombreTabla: string,
 *     columnas: { nombre: string, tipo: string, muestra: string[] }[],
 *     filas: Record<string, string>[],
 *     totalFilas: number
 *   }[]
 * }}
 */
function leerExcel(rutaArchivo) {
  let workbook;
  try {
    workbook = XLSX.readFile(rutaArchivo, {
      type: 'file',
      cellText: true,
      cellDates: true,
    });
  } catch (err) {
    throw new Error(`No se pudo abrir el archivo Excel: ${err.message}`);
  }

  const nombreBase = path.basename(rutaArchivo, path.extname(rutaArchivo));
  const tablas = [];

  for (const nombreHoja of workbook.SheetNames) {
    const hoja = workbook.Sheets[nombreHoja];

    // sheet_to_json convierte la hoja a array de objetos usando la primera fila como cabecera
    const filas = XLSX.utils.sheet_to_json(hoja, {
      defval: '',       // Valor por defecto para celdas vacías
      raw: false,       // Valores como texto (mejor para detección de tipos)
    });

    if (filas.length === 0) continue; // Saltar hojas vacías

    // Limpiar nombres de columna (espacios, BOM)
    const filasLimpias = filas.map((fila) => {
      const limpia = {};
      for (const [clave, valor] of Object.entries(fila)) {
        limpia[String(clave).replace(/^\uFEFF/, '').trim()] = String(valor ?? '');
      }
      return limpia;
    });

    // Usar "NombreArchivo_NombreHoja" si hay varias hojas, solo el nombre base si hay una
    const nombreTabla = workbook.SheetNames.length > 1
      ? `${nombreBase}_${nombreHoja}`
      : nombreBase;

    tablas.push({
      nombreTabla,
      columnas: inferirEsquema(filasLimpias),
      filas: filasLimpias,
      totalFilas: filasLimpias.length,
    });
  }

  if (tablas.length === 0) {
    throw new Error('El archivo Excel no contiene hojas con datos.');
  }

  return { tablas };
}

module.exports = { leerExcel };
