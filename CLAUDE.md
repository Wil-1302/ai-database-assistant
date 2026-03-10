# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop AI database assistant built with Electron + Node.js. All interface text, comments, and user-facing messages **must be in Spanish**.

## Commands

```bash
# Iniciar la aplicación en modo desarrollo
npm start

# Ejecutar Electron directamente
npx electron .

# Instalar dependencias
npm install
```

## Architecture

### Entry Points
- `main.js` — Electron main process (Node.js), handles window creation and IPC
- `src/ui/index.html` — Renderer process entry point
- `src/ui/renderer.js` — Frontend logic (runs in browser context)

### Module Structure

```
/src
  /ai
    ollama.js       — Ollama API client (POST http://localhost:11434/api/generate)
    sqlGenerator.js — Converts Spanish natural language → SQL via AI
  /database
    loader.js       — Loads CSV (csv-parser), Excel (xlsx), SQLite (node:sqlite)
    schema.js       — Auto-detects tables, columns, types from loaded data
    executor.js     — Executes SQL queries via node:sqlite
  /ui
    index.html      — Main window layout (3-panel: schema | chat | results)
    renderer.js     — IPC calls to main process, UI event handling
    styles.css      — Theming (light/dark mode via CSS variables)
  /components
    schemaPanel.js  — Left panel: tree view of tables/columns
    chatPanel.js    — Center panel: Spanish NL chat interface
    resultsPanel.js — Right panel: generated SQL + results table
  /utils
    fakeData.js     — @faker-js/faker datasets (hospital, pacientes, doctores, citas, embarazos)
```

### IPC Architecture (Electron)
The renderer communicates with main process via `ipcRenderer.invoke()` / `ipcMain.handle()`:
- `db:load-file` — Load CSV/Excel/SQLite file
- `db:get-schema` — Get detected schema
- `db:execute-query` — Run SQL query
- `ai:generate-sql` — Send NL query to Ollama, receive SQL + explanation
- `data:generate-fake` — Generate faker dataset by type

### AI Integration
- Ollama runs locally at `http://localhost:11434`
- Supported models: `deepseek-coder`, `llama3`
- Prompt must include schema context so AI generates correct SQL
- Response must include: SQL generado, explicación del SQL, explicación de JOINs

### Database Handling
- All data (CSV, Excel, fake data) is loaded into an **in-memory SQLite** database using `node:sqlite` (Node.js built-in, available in Node 22.5+)
- SQLite file databases are loaded directly
- Schema detection reads table names, column names, and inferred types

### Theme System
- CSS custom properties (variables) for colors
- Toggle between `data-theme="light"` and `data-theme="dark"` on `<body>`
- Persisted in `localStorage`

## Key Constraints
- `"type": "commonjs"` — use `require()`, not `import`
- `node:sqlite` requires Node.js 22.5+ (Electron 36+ bundles a compatible version)
- Electron context isolation: renderer cannot use Node.js APIs directly — all Node/DB/AI calls go through IPC preload bridge
- All UI text, error messages, comments, and logs must be in **Spanish**
