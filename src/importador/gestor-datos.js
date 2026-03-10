'use strict';

// ============================================================
// Gestor de datos en memoria — singleton del proceso principal.
// Almacena las tablas cargadas y expone métodos para accederlas.
// ============================================================

const path = require('path');
const { leerCSV }    = require('./lector-csv');
const { leerExcel }  = require('./lector-excel');
const { leerSQLite } = require('./lector-sqlite');

// Estado interno: tablas cargadas en memoria
// Estructura: Map<nombreTabla, { columnas, filas, totalFilas, origen }>
const tablas = new Map();

// Metadatos del archivo cargado actualmente
let infoArchivo = null;

/**
 * Carga un archivo en memoria según su extensión.
 * @param {string} rutaArchivo  Ruta absoluta al archivo.
 * @returns {Promise<{ tablas: string[], archivoNombre: string }>}
 */
async function cargarArchivo(rutaArchivo) {
  const extension = path.extname(rutaArchivo).toLowerCase();
  const nombreArchivo = path.basename(rutaArchivo);

  // Limpiar estado anterior
  tablas.clear();
  infoArchivo = null;

  let tablasNuevas = [];

  if (extension === '.csv') {
    const resultado = await leerCSV(rutaArchivo);
    tablasNuevas.push(resultado);
  } else if (extension === '.xlsx' || extension === '.xls') {
    const resultado = leerExcel(rutaArchivo);
    tablasNuevas = resultado.tablas;
  } else if (extension === '.sqlite' || extension === '.db' || extension === '.sqlite3') {
    leerSQLite(rutaArchivo); // Lanzará un error descriptivo
  } else {
    throw new Error(
      `Formato de archivo no compatible: "${extension}". ` +
      'Se aceptan archivos CSV (.csv) o Excel (.xlsx, .xls).'
    );
  }

  // Guardar todas las tablas en memoria
  for (const tabla of tablasNuevas) {
    tablas.set(tabla.nombreTabla, {
      columnas:   tabla.columnas,
      filas:      tabla.filas,
      totalFilas: tabla.totalFilas,
      origen:     rutaArchivo,
    });
  }

  infoArchivo = {
    ruta:       rutaArchivo,
    nombre:     nombreArchivo,
    extension,
    cargadoEn:  new Date().toISOString(),
  };

  return {
    tablas: [...tablas.keys()],
    archivoNombre: nombreArchivo,
  };
}

/**
 * Devuelve el esquema completo: todas las tablas con sus columnas.
 * @returns {{
 *   tablas: {
 *     nombre: string,
 *     columnas: { nombre: string, tipo: string, muestra: string[] }[],
 *     totalFilas: number
 *   }[],
 *   archivoNombre: string | null
 * }}
 */
function obtenerEsquema() {
  const resultado = [];
  for (const [nombre, datos] of tablas.entries()) {
    resultado.push({
      nombre,
      columnas:   datos.columnas,
      totalFilas: datos.totalFilas,
    });
  }
  return {
    tablas:        resultado,
    archivoNombre: infoArchivo ? infoArchivo.nombre : null,
  };
}

/**
 * Devuelve las filas de una tabla específica.
 * @param {string} nombreTabla
 * @returns {{ filas: Record<string, string>[] } | null}
 */
function obtenerFilas(nombreTabla) {
  const datos = tablas.get(nombreTabla);
  if (!datos) return null;
  return { filas: datos.filas };
}

/**
 * Devuelve todas las tablas con sus columnas y filas completas.
 * Usado por el ejecutor SQL para construir la base de datos en memoria.
 * @returns {{ nombre: string, columnas: { nombre: string, tipo: string }[], filas: Record<string,string>[] }[]}
 */
function obtenerTodosLosDatos() {
  const resultado = [];
  for (const [nombre, datos] of tablas.entries()) {
    resultado.push({
      nombre,
      columnas: datos.columnas,
      filas:    datos.filas,
    });
  }
  return resultado;
}

/**
 * Indica si hay algún archivo cargado.
 * @returns {boolean}
 */
function hayDatosCargados() {
  return tablas.size > 0;
}

/**
 * Carga un dataset generado programáticamente (sin archivo físico).
 * Reemplaza cualquier dato previo en memoria.
 *
 * @param {Array<{ nombre: string, columnas: Array<{ nombre: string, tipo: string, muestra: string[] }>, filas: Array<Record<string,any>> }>} tablasGeneradas
 * @param {string} [etiqueta] - Nombre descriptivo para mostrar en la UI (ej: "Ferretería")
 * @returns {{ tablas: string[] }}
 */
function cargarDataset(tablasGeneradas, etiqueta) {
  tablas.clear();
  infoArchivo = {
    ruta:      null,
    nombre:    etiqueta || 'Dataset generado',
    extension: '',
    cargadoEn: new Date().toISOString(),
  };

  for (const tabla of tablasGeneradas) {
    tablas.set(tabla.nombre, {
      columnas:   tabla.columnas,
      filas:      tabla.filas,
      totalFilas: tabla.filas.length,
      origen:     'generado',
    });
  }

  return { tablas: [...tablas.keys()] };
}

module.exports = { cargarArchivo, obtenerEsquema, obtenerFilas, obtenerTodosLosDatos, hayDatosCargados, cargarDataset };
