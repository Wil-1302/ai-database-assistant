# CLAUDE.md

Guía para Claude Code al trabajar con este repositorio.

## Descripción del proyecto

Asistente de escritorio con IA para consultar bases de datos, construido con Electron + Node.js.
Todo el texto de interfaz, comentarios y mensajes al usuario **deben estar en español**.

## Versión actual: v0.1

Estructura base funcional con interfaz de 3 paneles y sistema de temas.

## Comandos

```bash
# Iniciar la aplicación
npm start

# Modo desarrollo (con inspector de Node)
npm run dev

# Instalar dependencias
npm install
```

## Archivos existentes

```
main.js          — Proceso principal de Electron (ventana + handlers IPC stub)
preload.js       — Puente contextBridge: expone window.api al renderer
package.json     — Dependencias y scripts (main: "main.js", version: "0.1.0")

src/
  ui/
    index.html   — Layout principal: 3 paneles (esquema | chat | resultados)
    renderer.js  — Lógica UI: toggle de tema, chat básico, textarea auto-expand
    styles.css   — Sistema de temas claro/oscuro con variables CSS
```

## Arquitectura IPC

El renderer se comunica con el proceso principal via `window.api` (contextBridge):

| Método en renderer       | Canal IPC              | Estado en v0.1 |
|--------------------------|------------------------|----------------|
| `window.api.cargarArchivo(ruta)` | `db:cargar-archivo`  | stub (TODO v0.2) |
| `window.api.obtenerEsquema()`    | `db:obtener-esquema` | stub (TODO v0.2) |
| `window.api.ejecutarConsulta(sql)` | `db:ejecutar-consulta` | stub (TODO v0.2) |
| `window.api.generarSQL(consulta)` | `ai:generar-sql`    | stub (TODO v0.2) |
| `window.api.generarDatosFalsos(tipo)` | `datos:generar-falsos` | stub (TODO v0.2) |

## Sistema de temas

- Variables CSS en `:root` / `[data-tema="claro"]` y `[data-tema="oscuro"]`
- Toggle via botón en cabecera → atributo `data-tema` en `<html>`
- Persiste en `localStorage` con clave `asistente-tema`

## Restricciones clave

- `"type": "commonjs"` — usar `require()`, no `import`
- `node:sqlite` requerirá Node.js 22.5+ / Electron 36+ (para v0.2+)
- Context isolation activo: renderer no puede usar APIs de Node directamente
- Todo texto, mensajes de error y comentarios útiles deben estar en **español**

## Hoja de ruta por versiones

| Versión | Objetivo |
|---------|----------|
| **v0.1** ✅ | Estructura Electron base, interfaz 3 paneles, toggle tema |
| v0.2 | Carga de archivos CSV/Excel/SQLite, detección de esquema, árbol de tablas |
| v0.3 | Integración Ollama: NL → SQL, mostrar explicación |
| v0.4 | Datos de prueba con faker (hospital, pacientes, doctores) |
| v0.5 | Pulido UX, exportación de resultados, historial de consultas |
