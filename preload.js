'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expone una API segura al proceso renderer sin dar acceso directo a Node.js
contextBridge.exposeInMainWorld('api', {
  // Base de datos
  cargarArchivo: (rutaArchivo) => ipcRenderer.invoke('db:cargar-archivo', rutaArchivo),
  obtenerEsquema: () => ipcRenderer.invoke('db:obtener-esquema'),
  ejecutarConsulta: (sql) => ipcRenderer.invoke('db:ejecutar-consulta', sql),

  // Inteligencia artificial
  generarSQL: (consulta) => ipcRenderer.invoke('ai:generar-sql', consulta),

  // Datos de prueba
  generarDatosFalsos: (tipo) => ipcRenderer.invoke('datos:generar-falsos', tipo),
});
