'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const gestor = require('./src/importador/gestor-datos');

// Referencia global para evitar que la ventana sea eliminada por el GC
let ventanaPrincipal = null;

function crearVentana() {
  ventanaPrincipal = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Asistente IA de Bases de Datos',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  ventanaPrincipal.loadFile(path.join(__dirname, 'src', 'ui', 'index.html'));

  ventanaPrincipal.on('closed', () => {
    ventanaPrincipal = null;
  });
}

// --- Manejadores IPC ---

// Abrir diálogo nativo de selección de archivo
ipcMain.handle('db:abrir-dialogo', async () => {
  if (!ventanaPrincipal) return { cancelado: true };

  const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
    title: 'Seleccionar archivo de datos',
    buttonLabel: 'Cargar',
    filters: [
      { name: 'Archivos de datos', extensions: ['csv', 'xlsx', 'xls', 'sqlite', 'db', 'sqlite3'] },
      { name: 'CSV',               extensions: ['csv'] },
      { name: 'Excel',             extensions: ['xlsx', 'xls'] },
      { name: 'SQLite',            extensions: ['sqlite', 'db', 'sqlite3'] },
      { name: 'Todos los archivos', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (resultado.canceled || resultado.filePaths.length === 0) {
    return { cancelado: true };
  }

  return { cancelado: false, ruta: resultado.filePaths[0] };
});

// Cargar archivo de datos en memoria y devolver resumen
ipcMain.handle('db:cargar-archivo', async (_evento, rutaArchivo) => {
  try {
    console.log('[IPC] db:cargar-archivo →', rutaArchivo);
    const info = await gestor.cargarArchivo(rutaArchivo);
    return { ok: true, ...info };
  } catch (err) {
    console.error('[IPC] db:cargar-archivo — error:', err.message);
    return { ok: false, error: err.message };
  }
});

// Devolver el esquema de las tablas cargadas
ipcMain.handle('db:obtener-esquema', async () => {
  return gestor.obtenerEsquema();
});

// Ejecutar consulta SQL — pendiente en v0.3
ipcMain.handle('db:ejecutar-consulta', async (_evento, sql) => {
  console.log('[IPC] db:ejecutar-consulta →', sql);
  return { ok: false, error: 'La ejecución de consultas SQL estará disponible en la versión v0.3.' };
});

// Generar SQL desde lenguaje natural — pendiente en v0.3
ipcMain.handle('ai:generar-sql', async (_evento, consulta) => {
  console.log('[IPC] ai:generar-sql →', consulta);
  return { ok: false, error: 'La integración con Ollama estará disponible en la versión v0.3.' };
});

// Generar datos de prueba con faker — pendiente en v0.4
ipcMain.handle('datos:generar-falsos', async (_evento, tipo) => {
  console.log('[IPC] datos:generar-falsos →', tipo);
  return { ok: false, error: 'La generación de datos de prueba estará disponible en la versión v0.4.' };
});

// --- Ciclo de vida de la app ---

app.whenReady().then(() => {
  crearVentana();

  app.on('activate', () => {
    // En macOS es normal recrear la ventana al hacer clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) crearVentana();
  });
});

app.on('window-all-closed', () => {
  // En macOS las apps permanecen activas hasta que el usuario las cierra explícitamente
  if (process.platform !== 'darwin') app.quit();
});
