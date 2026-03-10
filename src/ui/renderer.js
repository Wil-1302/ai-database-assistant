'use strict';

// =============================================
// Asistente IA de Bases de Datos — v0.3
// Lógica del proceso renderer
// =============================================

// -----------------------------------------------
// Sistema de temas
// -----------------------------------------------

const CLAVE_TEMA = 'asistente-tema';
const html      = document.documentElement;
const btnTema   = document.getElementById('btnTema');
const iconoTema = document.getElementById('iconoTema');
const textoTema = document.getElementById('textoTema');

function aplicarTema(tema) {
  html.setAttribute('data-tema', tema);
  if (tema === 'oscuro') {
    iconoTema.textContent = '☀️';
    textoTema.textContent = 'Tema claro';
  } else {
    iconoTema.textContent = '🌙';
    textoTema.textContent = 'Tema oscuro';
  }
  localStorage.setItem(CLAVE_TEMA, tema);
}

function alternarTema() {
  const temaActual = html.getAttribute('data-tema') || 'claro';
  aplicarTema(temaActual === 'oscuro' ? 'claro' : 'oscuro');
}

// Restaurar tema guardado al iniciar
const temaGuardado = localStorage.getItem(CLAVE_TEMA) || 'claro';
aplicarTema(temaGuardado);
btnTema.addEventListener('click', alternarTema);

// -----------------------------------------------
// Chat: auto-expandir textarea
// -----------------------------------------------

const chatEntrada = document.getElementById('chatEntrada');
const btnEnviar   = document.getElementById('btnEnviar');

chatEntrada.addEventListener('input', () => {
  chatEntrada.style.height = 'auto';
  chatEntrada.style.height = Math.min(chatEntrada.scrollHeight, 120) + 'px';
  btnEnviar.disabled = chatEntrada.value.trim() === '';
});

// Enviar con Enter (Shift+Enter inserta salto de línea)
chatEntrada.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!btnEnviar.disabled) enviarMensaje();
  }
});

btnEnviar.addEventListener('click', enviarMensaje);

// -----------------------------------------------
// Chat: ejemplos de consulta
// -----------------------------------------------

document.querySelectorAll('.chat-bienvenida__ejemplo').forEach((btn) => {
  btn.addEventListener('click', () => {
    chatEntrada.value = btn.dataset.ejemplo;
    chatEntrada.dispatchEvent(new Event('input'));
    chatEntrada.focus();
  });
});

// -----------------------------------------------
// Chat: mensajes
// -----------------------------------------------

const chatMensajes   = document.getElementById('chatMensajes');
const chatBienvenida = document.getElementById('chatBienvenida');

/**
 * Agrega un mensaje al chat.
 * @param {string} texto - Contenido del mensaje
 * @param {'usuario'|'ia'|'error'} tipo - Tipo de mensaje
 * @returns {HTMLElement} El elemento creado (útil para eliminarlo después)
 */
function agregarMensaje(texto, tipo) {
  if (!chatBienvenida.classList.contains('oculto')) {
    chatBienvenida.classList.add('oculto');
  }

  const avatarIcono = tipo === 'usuario' ? '👤' : tipo === 'error' ? '⚠️' : '🤖';
  const div = document.createElement('div');
  div.classList.add('mensaje', `mensaje--${tipo === 'error' ? 'ia mensaje--error' : tipo}`);
  div.innerHTML = `
    <div class="mensaje__avatar">${avatarIcono}</div>
    <div class="mensaje__burbuja">${escaparHTML(texto)}</div>
  `;

  chatMensajes.appendChild(div);
  chatMensajes.scrollTop = chatMensajes.scrollHeight;
  return div;
}

/**
 * Muestra un indicador de "generando..." en el chat.
 * @returns {HTMLElement} El elemento del indicador (para eliminarlo al terminar)
 */
function mostrarIndicadorGenerando() {
  if (!chatBienvenida.classList.contains('oculto')) {
    chatBienvenida.classList.add('oculto');
  }

  const div = document.createElement('div');
  div.classList.add('mensaje', 'mensaje--ia');
  div.id = 'mensajeGenerando';
  div.innerHTML = `
    <div class="mensaje__avatar">🤖</div>
    <div class="mensaje__burbuja mensaje__burbuja--generando">
      <span class="generando-punto"></span>
      <span class="generando-punto"></span>
      <span class="generando-punto"></span>
    </div>
  `;

  chatMensajes.appendChild(div);
  chatMensajes.scrollTop = chatMensajes.scrollHeight;
  return div;
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}

// -----------------------------------------------
// Chat: lógica de envío con Ollama
// -----------------------------------------------

/** Indica si hay una generación en curso (evita envíos simultáneos) */
let generandoSQL = false;

async function enviarMensaje() {
  const consulta = chatEntrada.value.trim();
  if (!consulta || generandoSQL) return;

  agregarMensaje(consulta, 'usuario');
  chatEntrada.value = '';
  chatEntrada.style.height = 'auto';
  btnEnviar.disabled = true;
  generandoSQL = true;

  // Mostrar indicador de escritura
  const indicador = mostrarIndicadorGenerando();

  let resultado;
  try {
    resultado = await window.api.generarSQL(consulta);
  } catch (err) {
    indicador.remove();
    generandoSQL = false;
    btnEnviar.disabled = chatEntrada.value.trim() === '';
    agregarMensaje(
      `Error inesperado al contactar con el proceso principal: ${err.message}`,
      'error'
    );
    return;
  }

  // Quitar indicador de escritura
  indicador.remove();
  generandoSQL = false;
  btnEnviar.disabled = chatEntrada.value.trim() === '';

  if (!resultado.ok) {
    // Error devuelto desde el proceso principal (Ollama no disponible, etc.)
    agregarMensaje(resultado.error, 'error');
    return;
  }

  // Mostrar la explicación en el chat
  agregarMensaje(resultado.explicacion, 'ia');

  // Si el SQL se generó pero falló al ejecutarse, avisar con un toast
  if (resultado.errorSQL) {
    mostrarNotificacion(`Error al ejecutar SQL: ${resultado.errorSQL}`, 'error', 7000);
  }

  // Mostrar SQL, explicación y tabla de resultados en el panel derecho
  mostrarResultados(resultado.sql, resultado.explicacion, resultado.resultados || null);
}

// -----------------------------------------------
// Panel derecho: SQL generado y explicación
// -----------------------------------------------

const resultadosVacio             = document.getElementById('resultadosVacio');
const resultadosContenido         = document.getElementById('resultadosContenido');
const sqlGenerado                 = document.getElementById('sqlGenerado');
const explicacionSQL              = document.getElementById('explicacionSQL');
const btnCopiarSQL                = document.getElementById('btnCopiarSQL');
const resultadosTablaContenedor   = document.getElementById('resultadosTablaContenedor');
const tablaEncabezados            = document.getElementById('tablaEncabezados');
const tablaCuerpo                 = document.getElementById('tablaCuerpo');
const resultadosContador          = document.getElementById('resultadosContador');

/**
 * Muestra el SQL, la explicación y (si hay) la tabla de resultados en el panel derecho.
 * @param {string} sql
 * @param {string} explicacion
 * @param {{ columnas: string[], filas: object[], totalFilas: number, truncado: boolean } | null} resultados
 */
function mostrarResultados(sql, explicacion, resultados) {
  sqlGenerado.textContent    = sql;
  explicacionSQL.textContent = explicacion;

  if (resultados && resultados.columnas && resultados.columnas.length > 0) {
    renderizarTablaResultados(resultados);
  } else {
    // Ocultar tabla si no hay resultados ejecutables
    resultadosTablaContenedor.classList.add('oculto');
  }

  resultadosVacio.classList.add('oculto');
  resultadosContenido.classList.remove('oculto');
}

/**
 * Construye dinámicamente la tabla de resultados con las filas devueltas por SQLite.
 * @param {{ columnas: string[], filas: object[], totalFilas: number, truncado: boolean }} param0
 */
function renderizarTablaResultados({ columnas, filas, totalFilas, truncado }) {
  // --- Encabezados ---
  tablaEncabezados.innerHTML = '';
  const trHead = document.createElement('tr');
  for (const col of columnas) {
    const th = document.createElement('th');
    th.textContent = col;
    trHead.appendChild(th);
  }
  tablaEncabezados.appendChild(trHead);

  // --- Cuerpo ---
  tablaCuerpo.innerHTML = '';

  if (filas.length === 0) {
    const trVacio = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columnas.length;
    td.className = 'tabla-sin-resultados';
    td.textContent = 'La consulta no devolvió filas.';
    trVacio.appendChild(td);
    tablaCuerpo.appendChild(trVacio);
  } else {
    for (const fila of filas) {
      const tr = document.createElement('tr');
      for (const col of columnas) {
        const td = document.createElement('td');
        const val = fila[col];
        td.textContent = (val === null || val === undefined) ? '—' : String(val);
        tr.appendChild(td);
      }
      tablaCuerpo.appendChild(tr);
    }
  }

  // --- Contador de filas ---
  if (truncado) {
    resultadosContador.textContent =
      `${filas.length} de ${totalFilas.toLocaleString('es')} filas (limitado)`;
  } else {
    const txt = totalFilas === 1 ? '1 fila' : `${totalFilas.toLocaleString('es')} filas`;
    resultadosContador.textContent = txt;
  }

  resultadosTablaContenedor.classList.remove('oculto');
}

// Botón copiar SQL al portapapeles
btnCopiarSQL.addEventListener('click', () => {
  const sql = sqlGenerado.textContent;
  if (!sql) return;

  navigator.clipboard.writeText(sql).then(() => {
    btnCopiarSQL.textContent = 'Copiado ✓';
    setTimeout(() => {
      btnCopiarSQL.textContent = 'Copiar';
    }, 2000);
  }).catch(() => {
    mostrarNotificacion('No se pudo copiar al portapapeles.', 'error');
  });
});

// -----------------------------------------------
// Notificaciones (toast)
// -----------------------------------------------

let timerNotificacion = null;

function mostrarNotificacion(mensaje, tipo = 'info', duracion = 4000) {
  // Eliminar notificación previa si existe
  const previa = document.querySelector('.notificacion');
  if (previa) previa.remove();
  clearTimeout(timerNotificacion);

  const el = document.createElement('div');
  el.className = `notificacion notificacion--${tipo}`;
  el.textContent = mensaje;
  document.body.appendChild(el);

  timerNotificacion = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, duracion);
}

// -----------------------------------------------
// Panel izquierdo: árbol de esquema
// -----------------------------------------------

const esquemaVacio    = document.getElementById('esquemaVacio');
const esquemaCargando = document.getElementById('esquemaCargando');
const arbolEsquema    = document.getElementById('arbolEsquema');
const estadoPunto     = document.getElementById('estadoPunto');
const estadoTexto     = document.getElementById('estadoTexto');

function mostrarEstadoCarga(visible) {
  esquemaVacio.classList.toggle('oculto', visible);
  esquemaCargando.classList.toggle('oculto', !visible);
  arbolEsquema.classList.add('oculto');
}

/**
 * Construye y muestra el árbol de tablas/columnas en el panel izquierdo.
 * @param {{ tablas: { nombre: string, columnas: any[], totalFilas: number }[], archivoNombre: string }} esquema
 */
function renderizarEsquema(esquema) {
  arbolEsquema.innerHTML = '';

  // Cabecera con nombre del archivo y botón para cargar otro
  const cabeceraArchivo = document.createElement('div');
  cabeceraArchivo.className = 'esquema-archivo';
  cabeceraArchivo.innerHTML = `
    <span class="esquema-archivo__icono">📄</span>
    <span title="${escaparHTML(esquema.archivoNombre)}">${escaparHTML(esquema.archivoNombre)}</span>
    <button class="btn-cargar-otro" id="btnCargarOtro">Cambiar</button>
  `;
  arbolEsquema.appendChild(cabeceraArchivo);

  // Una sección por cada tabla
  for (const tabla of esquema.tablas) {
    const seccion = document.createElement('div');
    seccion.className = 'esquema-tabla';

    const filasTxt = tabla.totalFilas === 1 ? '1 fila' : `${tabla.totalFilas.toLocaleString('es')} filas`;

    seccion.innerHTML = `
      <div class="esquema-tabla__cabecera" role="button" tabindex="0"
           title="Mostrar/ocultar columnas de ${escaparHTML(tabla.nombre)}">
        <span>🗃️</span>
        <span class="esquema-tabla__nombre">${escaparHTML(tabla.nombre)}</span>
        <span class="esquema-tabla__info">${filasTxt}</span>
        <span class="esquema-tabla__flecha">▼</span>
      </div>
      <ul class="esquema-tabla__columnas">
        ${tabla.columnas.map((col) => `
          <li class="esquema-columna" title="${escaparHTML(col.muestra.join(' · ') || '—')}">
            <span class="esquema-columna__nombre">${escaparHTML(col.nombre)}</span>
            <span class="tipo-badge tipo-badge--${col.tipo}">${etiquetaTipo(col.tipo)}</span>
          </li>
        `).join('')}
      </ul>
    `;

    // Toggle plegar/desplegar tabla
    const cabecera = seccion.querySelector('.esquema-tabla__cabecera');
    cabecera.addEventListener('click', () => {
      seccion.classList.toggle('esquema-tabla--plegada');
    });
    cabecera.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seccion.classList.toggle('esquema-tabla--plegada');
      }
    });

    arbolEsquema.appendChild(seccion);
  }

  // Mostrar árbol, ocultar estados vacío y cargando
  esquemaVacio.classList.add('oculto');
  esquemaCargando.classList.add('oculto');
  arbolEsquema.classList.remove('oculto');

  // Registrar botón "Cambiar archivo"
  document.getElementById('btnCargarOtro').addEventListener('click', iniciarCargaArchivo);
}

/** Devuelve la etiqueta corta para un tipo de dato. */
function etiquetaTipo(tipo) {
  const etiquetas = { numero: 'núm', fecha: 'fecha', booleano: 'bool', texto: 'txt' };
  return etiquetas[tipo] || tipo;
}

// -----------------------------------------------
// Barra de estado inferior
// -----------------------------------------------

function actualizarEstado(mensaje, activo = false) {
  estadoTexto.textContent = mensaje;
  estadoPunto.classList.toggle('estado-punto--activo', activo);
}

// -----------------------------------------------
// Carga de archivos
// -----------------------------------------------

async function iniciarCargaArchivo() {
  // 1. Abrir diálogo nativo
  let dialogoResultado;
  try {
    dialogoResultado = await window.api.abrirDialogo();
  } catch (err) {
    mostrarNotificacion('No se pudo abrir el diálogo de selección de archivo.', 'error');
    return;
  }

  if (dialogoResultado.cancelado) return; // El usuario canceló

  const ruta = dialogoResultado.ruta;

  // 2. Mostrar spinner
  mostrarEstadoCarga(true);
  actualizarEstado('Cargando archivo…');

  // 3. Llamar al proceso principal
  let resultado;
  try {
    resultado = await window.api.cargarArchivo(ruta);
  } catch (err) {
    mostrarEstadoCarga(false);
    actualizarEstado('Error al cargar el archivo.');
    mostrarNotificacion(`Error inesperado: ${err.message}`, 'error');
    return;
  }

  if (!resultado.ok) {
    mostrarEstadoCarga(false);
    // Volver a mostrar el estado vacío
    esquemaVacio.classList.remove('oculto');
    actualizarEstado('Sin base de datos cargada.');
    mostrarNotificacion(resultado.error, 'error', 6000);
    return;
  }

  // 4. Obtener y mostrar el esquema
  let esquema;
  try {
    esquema = await window.api.obtenerEsquema();
  } catch (err) {
    mostrarEstadoCarga(false);
    esquemaVacio.classList.remove('oculto');
    actualizarEstado('Error al leer el esquema.');
    mostrarNotificacion(`No se pudo obtener el esquema: ${err.message}`, 'error');
    return;
  }

  renderizarEsquema(esquema);

  const totalTablas   = esquema.tablas.length;
  const totalColumnas = esquema.tablas.reduce((s, t) => s + t.columnas.length, 0);
  const resumen = `${resultado.archivoNombre} · ${totalTablas} tabla${totalTablas !== 1 ? 's' : ''} · ${totalColumnas} columna${totalColumnas !== 1 ? 's' : ''}`;
  actualizarEstado(resumen, true);

  mostrarNotificacion(
    `Archivo cargado: ${totalTablas} tabla${totalTablas !== 1 ? 's' : ''} detectada${totalTablas !== 1 ? 's' : ''}.`,
    'exito'
  );

  // Informar al chat
  agregarMensaje(
    `Archivo "${resultado.archivoNombre}" cargado correctamente. ` +
    `Se detectaron ${totalTablas} tabla${totalTablas !== 1 ? 's' : ''} con ${totalColumnas} columna${totalColumnas !== 1 ? 's' : ''} en total. ` +
    'Ahora puedes hacerme preguntas en español y generaré el SQL correspondiente.',
    'ia'
  );
}

// -----------------------------------------------
// Botón principal de carga (estado vacío)
// -----------------------------------------------

document.getElementById('btnCargarArchivo').addEventListener('click', iniciarCargaArchivo);

// -----------------------------------------------
// Generador de dataset con IA — v0.5
// -----------------------------------------------

const modalDataset      = document.getElementById('modalDataset');
const modalDescripcion  = document.getElementById('modalDescripcion');
const modalConfirmar    = document.getElementById('modalConfirmar');
const modalCancelar     = document.getElementById('modalCancelar');

/** Abre el modal de generación de dataset */
function abrirModalDataset() {
  modalDescripcion.value = '';
  modalConfirmar.disabled = true;
  modalDataset.classList.remove('oculto');
  modalDescripcion.focus();
}

/** Cierra el modal sin generar */
function cerrarModalDataset() {
  modalDataset.classList.add('oculto');
}

// Habilitar/deshabilitar botón Generar según texto
modalDescripcion.addEventListener('input', () => {
  modalConfirmar.disabled = modalDescripcion.value.trim().length < 5;
});

// Cerrar con Escape
modalDataset.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModalDataset();
});

// Cerrar al hacer clic en el overlay (fuera del modal-contenido)
modalDataset.addEventListener('click', (e) => {
  if (e.target === modalDataset) cerrarModalDataset();
});

modalCancelar.addEventListener('click', cerrarModalDataset);

// Ejemplos rápidos del modal
document.querySelectorAll('.modal-ejemplo').forEach((btn) => {
  btn.addEventListener('click', () => {
    modalDescripcion.value = btn.dataset.ejemplo;
    modalDescripcion.dispatchEvent(new Event('input'));
    modalDescripcion.focus();
  });
});

// Confirmar: iniciar generación
modalConfirmar.addEventListener('click', async () => {
  const descripcion = modalDescripcion.value.trim();
  if (!descripcion || descripcion.length < 5) return;

  cerrarModalDataset();
  await generarDataset(descripcion);
});

/**
 * Flujo completo de generación de dataset desde descripción.
 * @param {string} descripcion
 */
async function generarDataset(descripcion) {
  // Mostrar en el chat que vamos a generar
  agregarMensaje(`Generando dataset: "${descripcion}"…`, 'usuario');
  const indicador = mostrarIndicadorGenerando();

  mostrarEstadoCarga(true);
  actualizarEstado('Generando dataset con IA…');

  let resultado;
  try {
    resultado = await window.api.generarDataset(descripcion);
  } catch (err) {
    indicador.remove();
    mostrarEstadoCarga(false);
    esquemaVacio.classList.remove('oculto');
    actualizarEstado('Sin base de datos cargada.');
    agregarMensaje(`Error inesperado al generar el dataset: ${err.message}`, 'error');
    return;
  }

  indicador.remove();

  if (!resultado.ok) {
    mostrarEstadoCarga(false);
    esquemaVacio.classList.remove('oculto');
    actualizarEstado('Sin base de datos cargada.');
    agregarMensaje(resultado.error, 'error');
    return;
  }

  // Renderizar el esquema en el panel izquierdo
  renderizarEsquema(resultado.esquema);

  const { totalTablas, totalFilas } = resultado;
  const resumen =
    `Dataset generado · ${totalTablas} tabla${totalTablas !== 1 ? 's' : ''} · ${totalFilas.toLocaleString('es')} filas`;
  actualizarEstado(resumen, true);

  mostrarNotificacion(
    `Dataset listo: ${totalTablas} tabla${totalTablas !== 1 ? 's' : ''}, ${totalFilas.toLocaleString('es')} filas generadas.`,
    'exito',
    5000
  );

  agregarMensaje(
    `Dataset "${descripcion}" generado correctamente. ` +
    `Se crearon ${totalTablas} tabla${totalTablas !== 1 ? 's' : ''} con ${totalFilas.toLocaleString('es')} filas en total. ` +
    'Ahora puedes hacer preguntas en español sobre estos datos.',
    'ia'
  );
}

// Botón "✨ Generar" en la cabecera del panel izquierdo
document.getElementById('btnGenerarDataset').addEventListener('click', abrirModalDataset);
