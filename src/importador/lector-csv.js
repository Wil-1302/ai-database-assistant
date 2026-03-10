'use strict';

// ============================================================
// Lector de archivos CSV usando csv-parser.
// Devuelve filas como array de objetos y el esquema inferido.
// ============================================================

const fs   = require('fs');
const path = require('path');
const csv  = require('csv-parser');
const { inferirEsquema } = require('./detector-esquema');

/**
 * Lee un archivo CSV y devuelve su estructura en memoria.
 * @param {string} rutaArchivo  Ruta absoluta al archivo .csv
 * @returns {Promise<{
 *   nombreTabla: string,
 *   columnas: { nombre: string, tipo: string, muestra: string[] }[],
 *   filas: Record<string, string>[],
 *   totalFilas: number
 * }>}
 */
function leerCSV(rutaArchivo) {
  return new Promise((resolve, reject) => {
    const filas = [];

    // Opciones: separador automático, BOM handling
    const opciones = {
      separator: detectarSeparador(rutaArchivo),
      skipLines: 0,
    };

    fs.createReadStream(rutaArchivo, { encoding: 'utf-8' })
      .on('error', (err) => {
        reject(new Error(`No se pudo leer el archivo: ${err.message}`));
      })
      .pipe(csv(opciones))
      .on('data', (fila) => {
        // Limpiar claves con BOM (U+FEFF) que a veces aparecen en la primera columna
        const filaLimpia = {};
        for (const [clave, valor] of Object.entries(fila)) {
          filaLimpia[clave.replace(/^\uFEFF/, '').trim()] = valor;
        }
        filas.push(filaLimpia);
      })
      .on('end', () => {
        if (filas.length === 0) {
          reject(new Error('El archivo CSV está vacío o no tiene datos válidos.'));
          return;
        }

        const nombreTabla = path.basename(rutaArchivo, path.extname(rutaArchivo));
        const columnas    = inferirEsquema(filas);

        resolve({
          nombreTabla,
          columnas,
          filas,
          totalFilas: filas.length,
        });
      })
      .on('error', (err) => {
        reject(new Error(`Error al procesar el CSV: ${err.message}`));
      });
  });
}

/**
 * Detecta si el separador más probable es coma o punto y coma,
 * leyendo las primeras líneas del archivo.
 * @param {string} rutaArchivo
 * @returns {string}
 */
function detectarSeparador(rutaArchivo) {
  try {
    const buffer = Buffer.alloc(2048);
    const fd     = fs.openSync(rutaArchivo, 'r');
    const bytesLeidos = fs.readSync(fd, buffer, 0, 2048, 0);
    fs.closeSync(fd);

    const texto    = buffer.slice(0, bytesLeidos).toString('utf-8');
    const lineas   = texto.split('\n').slice(0, 5);
    const primerLn = lineas.find((l) => l.trim().length > 0) || '';

    const comas          = (primerLn.match(/,/g) || []).length;
    const puntoYComas    = (primerLn.match(/;/g) || []).length;
    const tabulaciones   = (primerLn.match(/\t/g) || []).length;

    if (tabulaciones >= comas && tabulaciones >= puntoYComas) return '\t';
    if (puntoYComas > comas) return ';';
    return ',';
  } catch {
    return ',';
  }
}

module.exports = { leerCSV };
