'use strict';

// ============================================================
// Lector de archivos SQLite — preparado para v0.3+
//
// Requiere Node.js 22.5+ y Electron 36+ para usar node:sqlite
// (módulo nativo sin dependencias externas).
// En v0.2 devuelve un error descriptivo para que la UI lo muestre.
// ============================================================

/**
 * Lee un archivo SQLite (pendiente de implementación en v0.3).
 * @param {string} _rutaArchivo  Ruta al archivo .sqlite / .db
 * @returns {never}
 */
function leerSQLite(_rutaArchivo) {
  throw new Error(
    'La carga de archivos SQLite estará disponible en la versión v0.3. ' +
    'Por ahora puedes cargar archivos CSV o Excel.'
  );
}

module.exports = { leerSQLite };
