# CLAUDE.md

Guía para Claude Code al trabajar con este repositorio.

## Descripción del proyecto

Asistente de escritorio con IA para consultar bases de datos, construido con Electron + Node.js.
Todo el texto de interfaz, comentarios y mensajes al usuario **deben estar en español**.

## Versión actual: v0.6.3

Generalización a nuevos dominios, base/extra split y fallback genérico. Cambios sobre v0.6.2:
- 8 nuevos dominios: farmacia, banco, universidad, fabrica, prision, mineria, logistica, turismo (total: 15)
- Cada dominio dividido en `tablas_base` (por defecto, 4-6 tablas) y `tablas_extra` (solo con masRiqueza)
- Hospital: base=6 tablas, extra=3 (salas/enfermedades/recetas). Antes: siempre 9 tablas
- `detectarDominio` ahora usa puntuación por matches (mejor vs. peor keyword match), no primer match
- Dominio 'empresa' ya no captura 'empleado' para evitar colisión con minería/fábrica/prisión
- Paso 1 de enriquecimiento: aplica plantilla de dominio SIEMPRE cuando hay match (no solo si pocas col.)
- `enriquecimientoGenerico()`: para dominios no reconocidos, resuelve _id colgantes (crea tabla mínima referenciada) y añade tabla de detalle si hay tabla de transacciones sin ella
- Catálogos nuevos: delitos, cargos_minería, minerales, rangos_guardia, tipos_cuenta, tipos_transacción, tipos_habitación, estados_envío, etc.
- Lookups semánticos para: prisión, minería, banco, logística, turismo, fábrica, universidad

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
main.js          — Proceso principal: ventana, IPC real (carga + esquema + Ollama + SQL + dataset + exportación), diálogo nativo
preload.js       — contextBridge: expone window.api al renderer
package.json     — Dependencias y scripts (main: "main.js", version: "0.6.0")

src/
  datasets/
    interpretador-esquema.js  — Interpreta descripción en español → esquema JSON (via Ollama)
    generador-filas.js        — Genera filas faker a partir del esquema; resuelve relaciones _id; usa catalogos-semanticos (v0.6.2)
    enriquecedor-esquema.js   — Enriquece el esquema con heurísticas de dominio (v0.6); hospital 9 tablas (v0.6.2)
    catalogos-semanticos.js   — Catálogos reales por dominio + obtenerGeneradorSemantico(tabla, columna) → (i)=>valor (v0.6.2)

  exportador/
    exportar-csv.js   — Genera y escribe archivos CSV (RFC 4180, BOM UTF-8) (v0.6)
    exportar-json.js  — Exporta resultados SQL y datasets completos a JSON (v0.6)

  db/
    ejecutor-sql.js    — Crea DB SQLite en memoria, inserta datos y ejecuta consultas (v0.4)

  ia/
    cliente-ollama.js  — Cliente HTTP nativo para la API local de Ollama (localhost:11434)
    generador-sql.js   — Construye prompt con esquema, llama a Ollama, parsea SQL + explicación

  ui/
    index.html   — Layout 3 paneles (esquema | chat | resultados) + modal generar dataset, v0.6
    renderer.js  — UI: temas, chat, carga de archivos, árbol de esquema, tabla resultados, modal dataset, exportación
    styles.css   — Temas claro/oscuro + árbol + notificaciones + tabla + modal dataset + botones exportación

  importador/
    detector-esquema.js — Infiere tipos de columna (numero, fecha, booleano, texto)
    lector-csv.js       — Lee CSV con detección automática de separador (,  ;  \t)
    lector-excel.js     — Lee todas las hojas de .xlsx / .xls como tablas
    lector-sqlite.js    — Stub descriptivo (pendiente)
    gestor-datos.js     — Singleton en memoria: orquesta carga, expone esquema y datos completos
```

## Arquitectura IPC

El renderer se comunica con el proceso principal via `window.api` (contextBridge):

| Método en renderer                    | Canal IPC                | Estado    |
|---------------------------------------|--------------------------|-----------|
| `window.api.abrirDialogo()`           | `db:abrir-dialogo`       | ✅ v0.2   |
| `window.api.cargarArchivo(ruta)`      | `db:cargar-archivo`      | ✅ v0.2   |
| `window.api.obtenerEsquema()`         | `db:obtener-esquema`     | ✅ v0.2   |
| `window.api.generarSQL(consulta)`     | `ai:generar-sql`         | ✅ v0.4   |
| `window.api.verificarOllama()`        | `ai:verificar-ollama`    | ✅ v0.3   |
| `window.api.ejecutarConsulta(sql)`    | `db:ejecutar-consulta`   | ✅ v0.4   |
| `window.api.generarDataset(desc, n)`      | `datos:generar-dataset`      | ✅ v0.5.1 |
| `window.api.obtenerVistaTabla(nombre)`    | `datos:obtener-vista-tabla`  | ✅ v0.5.1 |
| `window.api.exportarResultadosCSV(datos)` | `exportar:resultados-csv`    | ✅ v0.6   |
| `window.api.exportarResultadosJSON(datos)`| `exportar:resultados-json`   | ✅ v0.6   |
| `window.api.exportarDatasetJSON()`        | `exportar:dataset-json`      | ✅ v0.6   |

## Módulo Enriquecedor de esquema (v0.6)

### enriquecedor-esquema.js
- `enriquecerEsquema(esquema, descripcion)` → esquema enriquecido con tablas y columnas adicionales
- `detectarDominio(descripcion)` → detecta dominio (ferreteria, tienda, vuelo, hospital, restaurante, escuela, empresa)
- `pideMasRiqueza(descripcion)` → true si el usuario pidió "completo", "más tablas", etc.
- Plantillas de 7 dominios con tablas y columnas típicas
- Amplía columnas de tablas existentes si tienen < 3 columnas útiles
- Añade tablas faltantes del dominio si hay < 3 tablas o el usuario pide más riqueza

## Módulo Exportador (v0.6)

### exportar-csv.js
- `exportarCSV(ruta, columnas, filas)` → escribe CSV con BOM UTF-8 (compatible con Excel)
- Formato RFC 4180: valores con coma/comilla/salto de línea rodeados con comillas dobles

### exportar-json.js
- `exportarResultadosJSON(ruta, filas)` → array de filas como JSON formateado
- `exportarDatasetJSON(ruta, tablas)` → objeto `{ nombre_tabla: [...filas] }` como JSON

## Módulo Datasets (v0.5)

### interpretador-esquema.js
- `interpretarEsquema(descripcion, modelo?)` → `{ tablas: [{ nombre, filas, columnas: [{ nombre, tipo }] }] }`
- Usa Ollama con prompt especializado que exige JSON puro (sin markdown, sin texto extra)
- Tolerante a respuestas con bloques de código markdown o texto adicional
- Normaliza identificadores: minúsculas, sin acentos, espacios/guiones → `_`
- Garantiza columna `id` en cada tabla; valida tipos válidos (texto/numero/fecha/booleano)
- Rango de filas: 20–100 por tabla

### generador-filas.js
- `generarTablasDesdeEsquema(esquema)` → array de tablas con columnas+muestra+filas
- Ordena tablas por dependencias antes de generar (las referenciadas primero)
- Resuelve `_id` buscando la tabla relacionada por nombre (con/sin plural)
- Mapea ~50 patrones de nombre de columna a generadores faker específicos
- Devuelve columnas con campo `muestra` (hasta 3 valores) para el árbol de esquema

### gestor-datos.js (extensión)
- `cargarDataset(tablasGeneradas, etiqueta)` → carga sin archivo físico; limpia estado previo

## Módulo DB — Ejecución SQL (v0.4)

### ejecutor-sql.js
- `crearDBDesdeDatos(datos)` → crea una instancia `better-sqlite3` en `:memory:` con todas las tablas del gestor
- `ejecutarConsulta(db, sql)` → ejecuta un SELECT y devuelve `{ columnas, filas, totalFilas, truncado }`
- Mapeo de tipos: `numero → REAL`, `booleano → INTEGER`, `fecha/texto → TEXT`
- Límite de visualización: 500 filas (configurable con `MAX_FILAS_RESULTADO`)
- Solo acepta sentencias SELECT; otras operaciones lanzan error con mensaje claro
- Los nombres de tabla/columna se citan con comillas dobles para soportar espacios y tildes

### Flujo completo v0.4 en `ai:generar-sql`
1. Verificar Ollama disponible
2. Generar SQL con `generador-sql.js`
3. Obtener todos los datos del gestor (`obtenerTodosLosDatos()`)
4. Crear DB en memoria con `crearDBDesdeDatos()`
5. Ejecutar SQL con `ejecutarConsulta()`
6. Cerrar DB y devolver `{ ok, sql, explicacion, resultados }`
7. Si falla la ejecución SQL: devolver `{ ok: true, sql, explicacion, resultados: null, errorSQL }`

## Módulo IA (v0.3)

### cliente-ollama.js
- `generarTexto(modelo, prompt, sistema)` → llama a `POST /api/generate` en Ollama
- `verificarDisponibilidad()` → ping rápido (3s timeout) a `GET /`
- Manejo de errores: `ECONNREFUSED` → mensaje claro de "Ollama no está ejecutándose"
- Timeout de generación: 120s

### generador-sql.js
- `MODELO_POR_DEFECTO = 'llama3.2'` → cambiar aquí para usar otro modelo
- `generarSQL(pregunta, esquema, modelo?)` → devuelve `{ sql, explicacion }`
- `formatearEsquema(esquema)` → convierte el esquema a texto legible para el prompt
- `parsearRespuesta(texto)` → extrae bloque ` ```sql ``` ` y línea `EXPLICACIÓN:`

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
- Context isolation activo: renderer no puede usar APIs de Node directamente
- Todo texto, mensajes de error y comentarios útiles deben estar en **español**
- Ollama debe estar instalado y ejecutándose localmente (`ollama serve`)

## Hoja de ruta por versiones

| Versión | Objetivo |
|---------|----------|
| **v0.1** ✅ | Estructura Electron base, interfaz 3 paneles, toggle tema |
| **v0.2** ✅ | Diálogo nativo, carga CSV/Excel, detección de esquema, árbol de tablas |
| **v0.3** ✅ | Integración Ollama: NL → SQL, SQL generado + explicación en panel derecho |
| **v0.4** ✅ | Ejecución SQL con better-sqlite3 en memoria, tabla de resultados en UI |
| **v0.5** ✅ | Generación de datasets desde lenguaje natural: Ollama + faker + modal UI |
| **v0.5.1** ✅ | Refinamiento UX: vista previa de tabla, selector de filas, botón regenerar, resumen dataset |
| **v0.6** ✅ | Generación de datasets enriquecida (heurísticas de dominio) + exportación CSV/JSON |
| **v0.6.1** ✅ | Reparación y endurecimiento: textarea sin límite, sort topológico, enriquecedor más agresivo |
| **v0.6.2** ✅ | Calidad semántica: catálogos reales, hospital 9 tablas, aeropuertos coherentes, generación table-aware |
| **v0.6.3** ✅ | 15 dominios, base/extra split, enriquecimientoGenerico(), detección por puntuación, farmacia/banco/prisión/minería/universidad/logística/turismo/fábrica |
| v0.7 | Historial de consultas, pulido UX, soporte SQLite real |
