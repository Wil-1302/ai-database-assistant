'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Expone una API segura al proceso renderer sin dar acceso directo a Node.js
contextBridge.exposeInMainWorld('api', {
  // Diálogo nativo del sistema operativo para seleccionar archivo
  abrirDialogo: () => ipcRenderer.invoke('db:abrir-dialogo'),

  // Base de datos
  cargarArchivo: (rutaArchivo) => ipcRenderer.invoke('db:cargar-archivo', rutaArchivo),
  obtenerEsquema: () => ipcRenderer.invoke('db:obtener-esquema'),
  ejecutarConsulta: (sql) => ipcRenderer.invoke('db:ejecutar-consulta', sql),

  // Inteligencia artificial (v0.3)
  generarSQL:        (consulta) => ipcRenderer.invoke('ai:generar-sql', consulta),
  verificarOllama:   ()         => ipcRenderer.invoke('ai:verificar-ollama'),

  // Generar dataset desde lenguaje natural (v0.5)
  // v0.5.1: acepta filasPorTabla como segundo argumento opcional
  generarDataset: (descripcion, filasPorTabla) => ipcRenderer.invoke('datos:generar-dataset', descripcion, filasPorTabla),

  // Vista previa de tabla — primeras 20 filas (v0.5.1)
  obtenerVistaTabla: (nombreTabla) => ipcRenderer.invoke('datos:obtener-vista-tabla', nombreTabla),

  // Exportación (v0.6)
  exportarResultadosCSV:  (datos)  => ipcRenderer.invoke('exportar:resultados-csv',  datos),
  exportarResultadosJSON: (datos)  => ipcRenderer.invoke('exportar:resultados-json', datos),
  exportarDatasetJSON:    ()       => ipcRenderer.invoke('exportar:dataset-json'),
});
