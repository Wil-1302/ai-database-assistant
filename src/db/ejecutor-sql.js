'use strict';

// ============================================================
// Ejecutor SQL en memoria — v0.4
// Convierte los datos cargados en tablas SQLite en memoria y
// ejecuta consultas SQL retornando un array de objetos.
// ============================================================

const Database = require('better-sqlite3');

// Número máximo de filas que se devuelven al renderer
const MAX_FILAS_RESULTADO = 500;

/**
 * Mapea los tipos detectados por detector-esquema a tipos SQLite.
 * @param {string} tipo  'numero' | 'fecha' | 'booleano' | 'texto'
 * @returns {string}
 */
function mapearTipoSQL(tipo) {
  switch (tipo) {
    case 'numero':   return 'REAL';
    case 'booleano': return 'INTEGER';
    case 'fecha':    return 'TEXT';
    default:         return 'TEXT';
  }
}

/**
 * Convierte un valor crudo al tipo adecuado para SQLite.
 * @param {*} valor
 * @param {string} tipo
 * @returns {string|number|null}
 */
function convertirValor(valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return null;

  switch (tipo) {
    case 'numero': {
      // Acepta tanto punto como coma decimal
      const n = parseFloat(String(valor).replace(',', '.'));
      return isNaN(n) ? null : n;
    }
    case 'booleano': {
      const v = String(valor).toLowerCase().trim();
      if (['1', 'true', 'sí', 'si', 'yes', 'verdadero'].includes(v)) return 1;
      if (['0', 'false', 'no', 'falso'].includes(v)) return 0;
      return null;
    }
    default:
      return String(valor);
  }
}

/**
 * Envuelve un nombre de tabla o columna en comillas dobles para
 * manejar espacios, tildes y otros caracteres especiales.
 * @param {string} nombre
 * @returns {string}
 */
function citarNombre(nombre) {
  return `"${String(nombre).replace(/"/g, '""')}"`;
}

/**
 * Crea una base de datos SQLite en memoria a partir de los datos cargados
 * en el gestor de datos.
 *
 * @param {Array<{
 *   nombre:   string,
 *   columnas: { nombre: string, tipo: string }[],
 *   filas:    Record<string, string>[]
 * }>} datos  Lista de tablas con columnas y filas.
 *
 * @returns {import('better-sqlite3').Database}
 */
function crearDBDesdeDatos(datos) {
  const db = new Database(':memory:');

  for (const tabla of datos) {
    if (!tabla.columnas || tabla.columnas.length === 0) continue;

    // --- Crear tabla ---
    const definicionesCol = tabla.columnas
      .map(col => `${citarNombre(col.nombre)} ${mapearTipoSQL(col.tipo)}`)
      .join(', ');

    db.exec(`CREATE TABLE IF NOT EXISTS ${citarNombre(tabla.nombre)} (${definicionesCol})`);

    if (!tabla.filas || tabla.filas.length === 0) continue;

    // --- Preparar inserción ---
    const nombresCol   = tabla.columnas.map(col => citarNombre(col.nombre)).join(', ');
    const placeholders = tabla.columnas.map(() => '?').join(', ');

    const stmt = db.prepare(
      `INSERT INTO ${citarNombre(tabla.nombre)} (${nombresCol}) VALUES (${placeholders})`
    );

    // Insertar todas las filas en una transacción (mucho más rápido)
    const insertarTodas = db.transaction((filas) => {
      for (const fila of filas) {
        const valores = tabla.columnas.map(col => convertirValor(fila[col.nombre], col.tipo));
        stmt.run(valores);
      }
    });

    insertarTodas(tabla.filas);
  }

  return db;
}

/**
 * Ejecuta una consulta SQL sobre la base de datos en memoria.
 * Solo acepta sentencias SELECT (las generadas por Ollama siempre lo son).
 *
 * @param {import('better-sqlite3').Database} db
 * @param {string} sql
 * @returns {{
 *   columnas:     string[],
 *   filas:        Record<string, *>[],
 *   totalFilas:   number,
 *   truncado:     boolean
 * }}
 * @throws {Error} Si el SQL es inválido o no es una consulta SELECT.
 */
function ejecutarConsulta(db, sql) {
  const stmt = db.prepare(sql);

  // better-sqlite3 expone stmt.reader = true para SELECT, false para DML
  if (!stmt.reader) {
    throw new Error(
      'Solo se permiten consultas SELECT. ' +
      'La sentencia generada modifica datos (INSERT/UPDATE/DELETE/DROP).'
    );
  }

  const todasLasFilas = stmt.all();
  // Obtener nombres de columna aunque el resultado esté vacío
  const columnas = stmt.columns().map(c => c.name);

  const truncado  = todasLasFilas.length > MAX_FILAS_RESULTADO;
  const filas     = truncado ? todasLasFilas.slice(0, MAX_FILAS_RESULTADO) : todasLasFilas;

  return {
    columnas,
    filas,
    totalFilas: todasLasFilas.length,
    truncado,
  };
}

module.exports = { crearDBDesdeDatos, ejecutarConsulta };
