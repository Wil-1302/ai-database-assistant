'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const gestor    = require('./src/importador/gestor-datos');
const generador = require('./src/ia/generador-sql');
const { verificarDisponibilidad } = require('./src/ia/cliente-ollama');
const { crearDBDesdeDatos, ejecutarConsulta, escaparIdentificador, necesitaEscape } = require('./src/db/ejecutor-sql');
const { interpretarEsquema } = require('./src/datasets/interpretador-esquema');
const { generarTablasDesdeEsquema } = require('./src/datasets/generador-filas');
const { enriquecerEsquema } = require('./src/datasets/enriquecedor-esquema');
const { exportarCSV } = require('./src/exportador/exportar-csv');
const { exportarResultadosJSON, exportarDatasetJSON } = require('./src/exportador/exportar-json');

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

// --- Postprocesado defensivo de SQL generado por IA ---

/**
 * Escapa caracteres especiales de una cadena para usarla como patrón regex literal.
 * @param {string} str
 * @returns {string}
 */
function escaparRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Postprocesa el SQL generado por la IA para escapar identificadores conocidos
 * (tablas y columnas del esquema) que contengan caracteres especiales y que
 * la IA haya omitido citar correctamente.
 *
 * Es conservador: solo actúa sobre nombres que (a) pertenecen al esquema cargado,
 * (b) necesitan comillas según las reglas de SQLite, y (c) aparecen sin comillas
 * dobles en el SQL. No toca identificadores ya escapados ni transforma SQL válido.
 *
 * @param {string} sql    - SQL devuelto por Ollama
 * @param {object} esquema - Esquema de gestor.obtenerEsquema()
 * @returns {string}       - SQL corregido
 */
function postprocesarSQL(sql, esquema) {
  if (!sql || !esquema || !Array.isArray(esquema.tablas)) return sql;

  let resultado = sql;

  // Recopilar todos los identificadores del esquema que necesitan escape
  const identificadores = [];
  for (const tabla of esquema.tablas) {
    if (necesitaEscape(tabla.nombre)) identificadores.push(tabla.nombre);
    for (const col of tabla.columnas) {
      if (necesitaEscape(col.nombre)) identificadores.push(col.nombre);
    }
  }

  // Para cada identificador especial, reemplazar ocurrencias sin escapar.
  // Patrón: no precedido por " y no seguido por "
  // \b marca el límite de palabra al inicio y al final del nombre; funciona
  // porque SQLite separa identificadores por espacios/comas/paréntesis.
  for (const nombre of identificadores) {
    const escapado = escaparIdentificador(nombre);
    const patron = new RegExp(
      `(?<!")\\b${escaparRegExp(nombre)}\\b(?!")`,
      'gi'
    );
    const sqlAntes = resultado;
    resultado = resultado.replace(patron, escapado);
    if (resultado !== sqlAntes) {
      console.log(`[postprocesarSQL] Escapado identificador: ${nombre} → ${escapado}`);
    }
  }

  return resultado;
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

// Ejecutar consulta SQL directa sobre los datos cargados — v0.4
ipcMain.handle('db:ejecutar-consulta', async (_evento, sql) => {
  console.log('[IPC] db:ejecutar-consulta →', sql);

  if (!gestor.hayDatosCargados()) {
    return { ok: false, error: 'No hay datos cargados. Carga un archivo primero.' };
  }

  let db;
  try {
    db = crearDBDesdeDatos(gestor.obtenerTodosLosDatos());
    const resultados = ejecutarConsulta(db, sql);
    return { ok: true, resultados };
  } catch (err) {
    console.error('[IPC] db:ejecutar-consulta — error:', err.message);
    return { ok: false, error: err.message };
  } finally {
    if (db) db.close();
  }
});

// Verificar disponibilidad de Ollama
ipcMain.handle('ai:verificar-ollama', async () => {
  const disponible = await verificarDisponibilidad();
  return { disponible };
});

// Generar SQL desde lenguaje natural usando Ollama — v0.3
ipcMain.handle('ai:generar-sql', async (_evento, consulta) => {
  console.log('[IPC] ai:generar-sql →', consulta);

  // Verificar que Ollama esté disponible antes de intentar la generación
  const disponible = await verificarDisponibilidad();
  if (!disponible) {
    return {
      ok: false,
      error:
        'No se pudo conectar con Ollama. ' +
        'Asegúrate de que Ollama esté en ejecución (ollama serve) ' +
        'y de que tengas al menos un modelo descargado.',
    };
  }

  // Obtener el esquema actual para usarlo como contexto
  const esquema = gestor.obtenerEsquema();

  let sql, explicacion;
  try {
    ({ sql, explicacion } = await generador.generarSQL(consulta, esquema));
  } catch (err) {
    console.error('[IPC] ai:generar-sql — error generando SQL:', err.message);
    return { ok: false, error: err.message };
  }

  // Postprocesado defensivo: escapa identificadores especiales que la IA
  // haya olvidado citar. Opera solo sobre nombres conocidos del esquema.
  sql = postprocesarSQL(sql, esquema);
  console.log('[IPC] ai:generar-sql — SQL final:', sql);

  // Ejecutar el SQL sobre los datos cargados en memoria
  if (!gestor.hayDatosCargados()) {
    // Sin datos cargados: devolver solo el SQL y la explicación
    return { ok: true, sql, explicacion, resultados: null };
  }

  let db;
  try {
    db = crearDBDesdeDatos(gestor.obtenerTodosLosDatos());
    const resultados = ejecutarConsulta(db, sql);
    console.log(`[IPC] ai:generar-sql — ${resultados.totalFilas} fila(s) devuelta(s)`);
    return { ok: true, sql, explicacion, resultados };
  } catch (errSQL) {
    console.error('[IPC] ai:generar-sql — error al ejecutar SQL:', errSQL.message);
    // Devolver el SQL y la explicación aunque la ejecución haya fallado
    return { ok: true, sql, explicacion, resultados: null, errorSQL: errSQL.message };
  } finally {
    if (db) db.close();
  }
});

// Obtener vista previa de una tabla cargada (primeras N filas) — v0.5.1
ipcMain.handle('datos:obtener-vista-tabla', async (_evento, nombreTabla) => {
  console.log('[IPC] datos:obtener-vista-tabla →', nombreTabla);

  if (!gestor.hayDatosCargados()) {
    return { ok: false, error: 'No hay datos cargados.' };
  }

  const datos = gestor.obtenerFilas(nombreTabla);
  if (!datos) {
    return { ok: false, error: `Tabla "${nombreTabla}" no encontrada.` };
  }

  const LIMITE = 20;
  const todasLasFilas = datos.filas;

  // Obtener columnas del esquema para preservar el orden original
  const esquema = gestor.obtenerEsquema();
  const infoTabla = esquema.tablas.find((t) => t.nombre === nombreTabla);
  const columnas = infoTabla
    ? infoTabla.columnas.map((c) => c.nombre)
    : Object.keys(todasLasFilas[0] || {});

  return {
    ok:         true,
    nombre:     nombreTabla,
    columnas,
    filas:      todasLasFilas.slice(0, LIMITE),
    totalFilas: todasLasFilas.length,
    truncado:   todasLasFilas.length > LIMITE,
  };
});

// Generar dataset desde descripción en lenguaje natural — v0.5
// v0.5.1: acepta filasPorTabla como segundo argumento para sobreescribir el número de filas
ipcMain.handle('datos:generar-dataset', async (_evento, descripcion, filasPorTabla) => {
  console.log('[IPC] datos:generar-dataset →', descripcion, '| filas:', filasPorTabla);

  if (!descripcion || typeof descripcion !== 'string' || descripcion.trim().length < 5) {
    return { ok: false, error: 'Escribe una descripción más detallada del dataset que quieres generar.' };
  }

  // Verificar que Ollama esté disponible
  const disponible = await verificarDisponibilidad();
  if (!disponible) {
    return {
      ok: false,
      error:
        'No se pudo conectar con Ollama. ' +
        'Asegúrate de que esté en ejecución (ollama serve) antes de generar datasets.',
    };
  }

  // Capa 1: interpretar la descripción y obtener esquema JSON estructurado
  let esquema;
  try {
    esquema = await interpretarEsquema(descripcion.trim());
    console.log('[IPC] datos:generar-dataset — esquema interpretado:', JSON.stringify(esquema, null, 2));
  } catch (err) {
    console.error('[IPC] datos:generar-dataset — error al interpretar esquema:', err.message);
    return { ok: false, error: `No se pudo interpretar el esquema: ${err.message}` };
  }

  // Capa 1b: enriquecer el esquema con heurísticas de dominio
  // Añade tablas faltantes y amplía columnas escasas sin depender solo de la IA
  esquema = enriquecerEsquema(esquema, descripcion.trim());
  console.log('[IPC] datos:generar-dataset — esquema enriquecido:', esquema.tablas.map((t) => `${t.nombre}(${t.columnas.length}cols)`).join(', '));

  // Sobreescribir filas por tabla si el usuario eligió un valor específico
  const filasValidas = Number.isInteger(filasPorTabla) && filasPorTabla >= 10 && filasPorTabla <= 200;
  if (filasValidas) {
    for (const tabla of esquema.tablas) {
      tabla.filas = filasPorTabla;
    }
    console.log('[IPC] datos:generar-dataset — filas sobreescritas a:', filasPorTabla);
  }

  // Capa 2: generar filas falsas coherentes con faker
  let tablasGeneradas;
  try {
    tablasGeneradas = generarTablasDesdeEsquema(esquema);
    const resumen = tablasGeneradas.map((t) => `${t.nombre}(${t.filas.length})`).join(', ');
    console.log('[IPC] datos:generar-dataset — tablas generadas:', resumen);
  } catch (err) {
    console.error('[IPC] datos:generar-dataset — error al generar filas:', err.message);
    return { ok: false, error: `Error al generar datos: ${err.message}` };
  }

  // Extraer una etiqueta legible de la descripción: hasta 50 chars, sin cortar palabras
  const MAX_ETIQUETA = 50;
  const descTrim = descripcion.trim();
  const etiqueta = descTrim.length <= MAX_ETIQUETA
    ? descTrim
    : descTrim.slice(0, MAX_ETIQUETA).replace(/\s+\S*$/, '') + '…';

  // Cargar en el gestor de datos (reemplaza datos previos)
  gestor.cargarDataset(tablasGeneradas, etiqueta);

  // Devolver el esquema actualizado para que la UI lo renderice
  const esquemaFinal = gestor.obtenerEsquema();

  return {
    ok:         true,
    esquema:    esquemaFinal,
    totalTablas:  tablasGeneradas.length,
    totalFilas:   tablasGeneradas.reduce((s, t) => s + t.filas.length, 0),
  };
});

// Exportar resultados SQL a CSV — v0.6
ipcMain.handle('exportar:resultados-csv', async (_evento, { columnas, filas }) => {
  if (!ventanaPrincipal) return { ok: false, error: 'Sin ventana activa.' };

  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: 'Exportar resultados a CSV',
    defaultPath: 'resultados.csv',
    filters: [{ name: 'CSV', extensions: ['csv'] }],
  });

  if (resultado.canceled || !resultado.filePath) return { ok: false, cancelado: true };

  try {
    exportarCSV(resultado.filePath, columnas, filas);
    return { ok: true, ruta: resultado.filePath };
  } catch (err) {
    console.error('[IPC] exportar:resultados-csv — error:', err.message);
    return { ok: false, error: err.message };
  }
});

// Exportar resultados SQL a JSON — v0.6
ipcMain.handle('exportar:resultados-json', async (_evento, { filas }) => {
  if (!ventanaPrincipal) return { ok: false, error: 'Sin ventana activa.' };

  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: 'Exportar resultados a JSON',
    defaultPath: 'resultados.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (resultado.canceled || !resultado.filePath) return { ok: false, cancelado: true };

  try {
    exportarResultadosJSON(resultado.filePath, filas);
    return { ok: true, ruta: resultado.filePath };
  } catch (err) {
    console.error('[IPC] exportar:resultados-json — error:', err.message);
    return { ok: false, error: err.message };
  }
});

// Exportar dataset completo a JSON — v0.6
ipcMain.handle('exportar:dataset-json', async () => {
  if (!ventanaPrincipal) return { ok: false, error: 'Sin ventana activa.' };

  if (!gestor.hayDatosCargados()) {
    return { ok: false, error: 'No hay datos cargados para exportar.' };
  }

  const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
    title: 'Exportar dataset a JSON',
    defaultPath: 'dataset.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });

  if (resultado.canceled || !resultado.filePath) return { ok: false, cancelado: true };

  try {
    const tablas = gestor.obtenerTodosLosDatos();
    exportarDatasetJSON(resultado.filePath, tablas);
    return { ok: true, ruta: resultado.filePath };
  } catch (err) {
    console.error('[IPC] exportar:dataset-json — error:', err.message);
    return { ok: false, error: err.message };
  }
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
