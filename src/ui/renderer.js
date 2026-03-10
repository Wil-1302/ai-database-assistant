'use strict';

// =============================================
// Asistente IA de Bases de Datos — v0.1
// Lógica del proceso renderer
// =============================================

// --- Sistema de temas ---

const CLAVE_TEMA = 'asistente-tema';
const html = document.documentElement;
const btnTema = document.getElementById('btnTema');
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

// --- Chat: auto-expandir textarea ---

const chatEntrada = document.getElementById('chatEntrada');
const btnEnviar = document.getElementById('btnEnviar');

chatEntrada.addEventListener('input', () => {
  // Resetea la altura para medir el contenido real
  chatEntrada.style.height = 'auto';
  chatEntrada.style.height = Math.min(chatEntrada.scrollHeight, 120) + 'px';

  // Habilitar botón solo si hay texto
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

// --- Chat: ejemplos de consulta ---

document.querySelectorAll('.chat-bienvenida__ejemplo').forEach((btn) => {
  btn.addEventListener('click', () => {
    chatEntrada.value = btn.dataset.ejemplo;
    chatEntrada.dispatchEvent(new Event('input'));
    chatEntrada.focus();
  });
});

// --- Chat: lógica de mensajes ---

const chatMensajes = document.getElementById('chatMensajes');
const chatBienvenida = document.getElementById('chatBienvenida');

function agregarMensaje(texto, tipo) {
  // Ocultar bienvenida al primer mensaje
  if (!chatBienvenida.classList.contains('oculto')) {
    chatBienvenida.classList.add('oculto');
  }

  const avatarIcono = tipo === 'usuario' ? '👤' : '🤖';

  const div = document.createElement('div');
  div.classList.add('mensaje', `mensaje--${tipo}`);
  div.innerHTML = `
    <div class="mensaje__avatar">${avatarIcono}</div>
    <div class="mensaje__burbuja">${escaparHTML(texto)}</div>
  `;

  chatMensajes.appendChild(div);
  chatMensajes.scrollTop = chatMensajes.scrollHeight;
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}

async function enviarMensaje() {
  const consulta = chatEntrada.value.trim();
  if (!consulta) return;

  // Mostrar mensaje del usuario
  agregarMensaje(consulta, 'usuario');

  // Limpiar entrada
  chatEntrada.value = '';
  chatEntrada.style.height = 'auto';
  btnEnviar.disabled = true;

  // Mostrar respuesta placeholder (en v0.2 se conectará con Ollama)
  agregarMensaje(
    'La integración con IA estará disponible en la siguiente versión. Asegúrate de cargar una base de datos primero.',
    'ia'
  );
}

// --- Botón cargar archivo (stub v0.1) ---

const btnCargarArchivo = document.getElementById('btnCargarArchivo');

btnCargarArchivo.addEventListener('click', () => {
  // TODO v0.2: abrir diálogo de selección de archivo y llamar a window.api.cargarArchivo()
  agregarMensaje(
    'La carga de archivos estará disponible en la siguiente versión (v0.2).',
    'ia'
  );
});
