'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

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

// --- Manejadores IPC (stubs para v0.1, se implementarán en versiones siguientes) ---

// Cargar archivo de base de datos (CSV, Excel, SQLite)
ipcMain.handle('db:cargar-archivo', async (_evento, rutaArchivo) => {
  // TODO v0.2: implementar carga real con csv-parser / xlsx / node:sqlite
  console.log('[IPC] db:cargar-archivo →', rutaArchivo);
  return { ok: false, error: 'No implementado en v0.1' };
});

// Obtener esquema detectado de la base de datos cargada
ipcMain.handle('db:obtener-esquema', async () => {
  // TODO v0.2: devolver tablas y columnas reales
  return { tablas: [] };
});

// Ejecutar consulta SQL sobre la base de datos en memoria
ipcMain.handle('db:ejecutar-consulta', async (_evento, sql) => {
  // TODO v0.2: ejecutar con node:sqlite
  console.log('[IPC] db:ejecutar-consulta →', sql);
  return { ok: false, error: 'No implementado en v0.1' };
});

// Generar SQL desde lenguaje natural usando Ollama
ipcMain.handle('ai:generar-sql', async (_evento, consulta) => {
  // TODO v0.2: conectar con Ollama en localhost:11434
  console.log('[IPC] ai:generar-sql →', consulta);
  return { ok: false, error: 'No implementado en v0.1' };
});

// Generar datos de prueba con faker
ipcMain.handle('datos:generar-falsos', async (_evento, tipo) => {
  // TODO v0.2: usar @faker-js/faker para datasets de hospital
  console.log('[IPC] datos:generar-falsos →', tipo);
  return { ok: false, error: 'No implementado en v0.1' };
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
