# CLAUDE.md

Guía para Claude Code al trabajar con este repositorio.

## Descripción del proyecto

Asistente de escritorio con IA para consultar bases de datos, construido con Electron + Node.js.
Todo el texto de interfaz, comentarios y mensajes al usuario **deben estar en español**.

## Versión actual: v0.2

Carga de archivos CSV y Excel, detección de esquema y árbol de tablas/columnas en panel izquierdo.

## Comandos

```bash
# Iniciar la aplicación
npm start

# Modo desarrollo (con inspector de Node)
npm run dev

# Instalar dependencias
npm install
```

## Estructura de archivos

```
main.js          — Proceso principal: ventana, IPC real (carga + esquema), diálogo nativo
preload.js       — contextBridge: expone window.api al renderer
package.json     — Dependencias y scripts (main: "main.js", version: "0.1.0")

src/
  ui/
    index.html   — Layout 3 paneles (esquema | chat | resultados), v0.2
    renderer.js  — UI: temas, chat, carga de archivos, árbol de esquema, toasts
    styles.css   — Temas claro/oscuro + árbol de esquema + notificaciones + spinner

  importador/
    detector-esquema.js — Infiere tipos de columna (numero, fecha, booleano, texto)
    lector-csv.js       — Lee CSV con detección automática de separador (,  ;  \t)
    lector-excel.js     — Lee todas las hojas de .xlsx / .xls como tablas
    lector-sqlite.js    — Stub descriptivo (pendiente v0.3)
    gestor-datos.js     — Singleton en memoria: orquesta carga y expone esquema
```

## Arquitectura IPC

El renderer se comunica con el proceso principal via `window.api` (contextBridge):

| Método en renderer                  | Canal IPC              | Estado    |
|-------------------------------------|------------------------|-----------|
| `window.api.abrirDialogo()`         | `db:abrir-dialogo`     | ✅ v0.2   |
| `window.api.cargarArchivo(ruta)`    | `db:cargar-archivo`    | ✅ v0.2   |
| `window.api.obtenerEsquema()`       | `db:obtener-esquema`   | ✅ v0.2   |
| `window.api.ejecutarConsulta(sql)`  | `db:ejecutar-consulta` | stub v0.3 |
| `window.api.generarSQL(consulta)`   | `ai:generar-sql`       | stub v0.3 |
| `window.api.generarDatosFalsos(tipo)` | `datos:generar-falsos` | stub v0.4 |

## Detección de esquema

- `detectarTipo(valor)` → `'numero' | 'fecha' | 'booleano' | 'texto'`
- `inferirEsquema(filas)` → analiza hasta 200 filas de muestra; elige el tipo dominante (≥50%)
- CSV: detecta automáticamente separador (coma, punto y coma, tabulación) leyendo las primeras líneas
- Excel: convierte cada hoja con datos en una tabla independiente

## Sistema de temas

- Variables CSS en `:root` / `[data-tema="claro"]` y `[data-tema="oscuro"]`
- Toggle via botón en cabecera → atributo `data-tema` en `<html>`
- Persiste en `localStorage` con clave `asistente-tema`

## Restricciones clave

- `"type": "commonjs"` — usar `require()`, no `import`
- `node:sqlite` requerirá Node.js 22.5+ / Electron 36+ (para v0.3+)
- Context isolation activo: renderer no puede usar APIs de Node directamente
- Todo texto, mensajes de error y comentarios útiles deben estar en **español**

## Hoja de ruta por versiones

| Versión | Objetivo |
|---------|----------|
| **v0.1** ✅ | Estructura Electron base, interfaz 3 paneles, toggle tema |
| **v0.2** ✅ | Diálogo nativo, carga CSV/Excel, detección de esquema, árbol de tablas |
| v0.3 | Integración Ollama: NL → SQL, ejecución de consultas, mostrar resultados |
| v0.4 | Datos de prueba con faker (hospital, pacientes, doctores) |
| v0.5 | Pulido UX, exportación de resultados, historial de consultas |
