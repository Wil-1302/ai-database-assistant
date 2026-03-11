'use strict';

// ============================================================
// Enriquecedor de esquema — v0.6
// Analiza el esquema devuelto por la IA y lo enriquece con
// heurísticas de dominio: añade tablas faltantes, amplía
// columnas escasas y asegura relaciones cuando procede.
// ============================================================

// Número mínimo de columnas útiles (sin id) para una tabla "rica"
const MIN_COLUMNAS_UTILES = 3;

// -----------------------------------------------
// Plantillas de dominio
// Cada dominio define:
//   keywords: palabras clave que activan el dominio (sin acentos)
//   tablas:   estructura completa esperada en ese dominio
// -----------------------------------------------

const DOMINIOS = [
  {
    nombre: 'ferreteria',
    keywords: ['ferreteria', 'ferretera', 'herramienta', 'tornillo', 'clavo', 'construccion', 'pintura', 'ceramica', 'sanitario'],
    tablas: [
      { nombre: 'categorias',     columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }] },
      { nombre: 'proveedores',    columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_empresa', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'ciudad', tipo: 'texto' }, { nombre: 'ruc', tipo: 'texto' }] },
      { nombre: 'productos',      columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_producto', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'stock', tipo: 'numero' }, { nombre: 'sku', tipo: 'texto' }, { nombre: 'categoria_id', tipo: 'numero' }, { nombre: 'proveedor_id', tipo: 'numero' }] },
      { nombre: 'clientes',       columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'ciudad', tipo: 'texto' }, { nombre: 'fecha_registro', tipo: 'fecha' }] },
      { nombre: 'ventas',         columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'cliente_id', tipo: 'numero' }, { nombre: 'fecha', tipo: 'fecha' }, { nombre: 'total', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }] },
      { nombre: 'detalle_ventas', columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'venta_id', tipo: 'numero' }, { nombre: 'producto_id', tipo: 'numero' }, { nombre: 'cantidad', tipo: 'numero' }, { nombre: 'precio_unitario', tipo: 'numero' }] },
    ],
  },
  {
    nombre: 'tienda',
    keywords: ['tienda', 'comercio', 'mercado', 'supermercado', 'almacen', 'minimarket', 'bazar', 'boutique', 'libreria'],
    tablas: [
      { nombre: 'categorias',     columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }] },
      { nombre: 'proveedores',    columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_empresa', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'ciudad', tipo: 'texto' }] },
      { nombre: 'productos',      columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_producto', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'stock', tipo: 'numero' }, { nombre: 'categoria_id', tipo: 'numero' }, { nombre: 'proveedor_id', tipo: 'numero' }] },
      { nombre: 'clientes',       columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'ciudad', tipo: 'texto' }] },
      { nombre: 'ventas',         columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'cliente_id', tipo: 'numero' }, { nombre: 'fecha', tipo: 'fecha' }, { nombre: 'total', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }] },
      { nombre: 'detalle_ventas', columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'venta_id', tipo: 'numero' }, { nombre: 'producto_id', tipo: 'numero' }, { nombre: 'cantidad', tipo: 'numero' }, { nombre: 'precio_unitario', tipo: 'numero' }] },
    ],
  },
  {
    nombre: 'vuelo',
    keywords: ['vuelo', 'aerolinea', 'aeropuerto', 'avion', 'pasajero', 'boleto', 'ticket', 'aerolineas', 'aeronavegacion'],
    tablas: [
      { nombre: 'destinos',   columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'ciudad', tipo: 'texto' }, { nombre: 'pais', tipo: 'texto' }, { nombre: 'aeropuerto', tipo: 'texto' }, { nombre: 'codigo_iata', tipo: 'texto' }] },
      { nombre: 'vuelos',     columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'numero_vuelo', tipo: 'texto' }, { nombre: 'origen_id', tipo: 'numero' }, { nombre: 'destino_id', tipo: 'numero' }, { nombre: 'fecha_salida', tipo: 'fecha' }, { nombre: 'duracion', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }] },
      { nombre: 'pasajeros',  columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'pais', tipo: 'texto' }, { nombre: 'fecha_nacimiento', tipo: 'fecha' }] },
      { nombre: 'boletos',    columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'pasajero_id', tipo: 'numero' }, { nombre: 'vuelo_id', tipo: 'numero' }, { nombre: 'clase', tipo: 'texto' }, { nombre: 'asiento', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'fecha_compra', tipo: 'fecha' }] },
      { nombre: 'equipajes',  columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'boleto_id', tipo: 'numero' }, { nombre: 'peso', tipo: 'numero' }, { nombre: 'tipo', tipo: 'texto' }, { nombre: 'estado', tipo: 'texto' }] },
    ],
  },
  {
    nombre: 'hospital',
    keywords: ['hospital', 'clinica', 'medico', 'salud', 'paciente', 'doctor', 'enfermera', 'farmacia', 'ambulatorio'],
    tablas: [
      { nombre: 'especialidades', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' },
      ]},
      { nombre: 'salas', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'area', tipo: 'texto' },
        { nombre: 'piso', tipo: 'numero' }, { nombre: 'capacidad', tipo: 'numero' },
      ]},
      { nombre: 'medicamentos', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'principio_activo', tipo: 'texto' },
        { nombre: 'laboratorio', tipo: 'texto' }, { nombre: 'presentacion', tipo: 'texto' },
        { nombre: 'precio', tipo: 'numero' }, { nombre: 'stock', tipo: 'numero' },
      ]},
      { nombre: 'enfermedades', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' },
        { nombre: 'categoria', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' },
      ]},
      { nombre: 'doctores', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' },
        { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' },
        { nombre: 'especialidad_id', tipo: 'numero' }, { nombre: 'sala_id', tipo: 'numero' },
        { nombre: 'matricula', tipo: 'texto' },
      ]},
      { nombre: 'pacientes', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' },
        { nombre: 'fecha_nacimiento', tipo: 'fecha' }, { nombre: 'telefono', tipo: 'texto' },
        { nombre: 'email', tipo: 'texto' }, { nombre: 'direccion', tipo: 'texto' },
        { nombre: 'grupo_sanguineo', tipo: 'texto' },
      ]},
      { nombre: 'citas', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'paciente_id', tipo: 'numero' },
        { nombre: 'doctor_id', tipo: 'numero' }, { nombre: 'fecha', tipo: 'fecha' },
        { nombre: 'motivo', tipo: 'texto' }, { nombre: 'diagnostico', tipo: 'texto' },
        { nombre: 'estado', tipo: 'texto' },
      ]},
      { nombre: 'tratamientos', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'cita_id', tipo: 'numero' },
        { nombre: 'tipo', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' },
        { nombre: 'fecha_inicio', tipo: 'fecha' }, { nombre: 'duracion', tipo: 'numero' },
      ]},
      { nombre: 'recetas', columnas: [
        { nombre: 'id', tipo: 'numero' }, { nombre: 'tratamiento_id', tipo: 'numero' },
        { nombre: 'medicamento_id', tipo: 'numero' }, { nombre: 'dosis', tipo: 'texto' },
        { nombre: 'frecuencia', tipo: 'texto' }, { nombre: 'duracion', tipo: 'texto' },
      ]},
    ],
  },
  {
    nombre: 'restaurante',
    keywords: ['restaurante', 'restaurant', 'comida', 'cocina', 'menu', 'chef', 'plato', 'cafeteria', 'gastronomia', 'bar'],
    tablas: [
      { nombre: 'categorias',      columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }] },
      { nombre: 'platos',          columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'categoria_id', tipo: 'numero' }, { nombre: 'disponible', tipo: 'booleano' }] },
      { nombre: 'clientes',        columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }] },
      { nombre: 'mesas',           columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'numero_mesa', tipo: 'numero' }, { nombre: 'capacidad', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }] },
      { nombre: 'pedidos',         columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'cliente_id', tipo: 'numero' }, { nombre: 'mesa_id', tipo: 'numero' }, { nombre: 'fecha', tipo: 'fecha' }, { nombre: 'total', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }] },
      { nombre: 'detalle_pedidos', columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'pedido_id', tipo: 'numero' }, { nombre: 'plato_id', tipo: 'numero' }, { nombre: 'cantidad', tipo: 'numero' }, { nombre: 'precio_unitario', tipo: 'numero' }] },
    ],
  },
  {
    nombre: 'escuela',
    keywords: ['escuela', 'colegio', 'universidad', 'academia', 'educacion', 'alumno', 'estudiante', 'profesor', 'docente', 'curso', 'materia', 'facultad'],
    tablas: [
      { nombre: 'cursos',     columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }, { nombre: 'creditos', tipo: 'numero' }] },
      { nombre: 'profesores', columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'especialidad', tipo: 'texto' }] },
      { nombre: 'alumnos',    columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'fecha_nacimiento', tipo: 'fecha' }, { nombre: 'ciudad', tipo: 'texto' }] },
      { nombre: 'matriculas', columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'alumno_id', tipo: 'numero' }, { nombre: 'curso_id', tipo: 'numero' }, { nombre: 'profesor_id', tipo: 'numero' }, { nombre: 'fecha_inicio', tipo: 'fecha' }, { nombre: 'estado', tipo: 'texto' }] },
      { nombre: 'notas',      columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'matricula_id', tipo: 'numero' }, { nombre: 'nota', tipo: 'numero' }, { nombre: 'fecha', tipo: 'fecha' }, { nombre: 'tipo', tipo: 'texto' }] },
    ],
  },
  {
    nombre: 'empresa',
    keywords: ['empresa', 'negocio', 'corporacion', 'organizacion', 'empleado', 'rrhh', 'recursos humanos', 'departamento', 'oficina'],
    tablas: [
      { nombre: 'departamentos', columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }] },
      { nombre: 'empleados',     columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'cargo', tipo: 'texto' }, { nombre: 'salario', tipo: 'numero' }, { nombre: 'departamento_id', tipo: 'numero' }, { nombre: 'fecha_ingreso', tipo: 'fecha' }] },
      { nombre: 'clientes',      columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre_empresa', tipo: 'texto' }, { nombre: 'contacto', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'ciudad', tipo: 'texto' }] },
      { nombre: 'proyectos',     columnas: [{ nombre: 'id', tipo: 'numero' }, { nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }, { nombre: 'cliente_id', tipo: 'numero' }, { nombre: 'fecha_inicio', tipo: 'fecha' }, { nombre: 'estado', tipo: 'texto' }, { nombre: 'presupuesto', tipo: 'numero' }] },
    ],
  },
];

// Columnas típicas por tipo de tabla (para enriquecimiento genérico de tablas con pocas columnas)
const COLUMNAS_TIPICAS = {
  clientes:      [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'ciudad', tipo: 'texto' }],
  productos:     [{ nombre: 'nombre_producto', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'stock', tipo: 'numero' }, { nombre: 'descripcion', tipo: 'texto' }],
  ventas:        [{ nombre: 'fecha', tipo: 'fecha' }, { nombre: 'total', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }],
  pedidos:       [{ nombre: 'fecha', tipo: 'fecha' }, { nombre: 'total', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }],
  categorias:    [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }],
  proveedores:   [{ nombre: 'nombre_empresa', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }],
  empleados:     [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'cargo', tipo: 'texto' }, { nombre: 'salario', tipo: 'numero' }],
  doctores:      [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }],
  pacientes:     [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }, { nombre: 'fecha_nacimiento', tipo: 'fecha' }],
  alumnos:       [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }],
  profesores:    [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }],
  pasajeros:     [{ nombre: 'nombre_completo', tipo: 'texto' }, { nombre: 'email', tipo: 'texto' }, { nombre: 'telefono', tipo: 'texto' }],
  vuelos:        [{ nombre: 'numero_vuelo', tipo: 'texto' }, { nombre: 'fecha_salida', tipo: 'fecha' }, { nombre: 'estado', tipo: 'texto' }],
  boletos:       [{ nombre: 'clase', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'fecha_compra', tipo: 'fecha' }],
  medicamentos:  [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'principio_activo', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'stock', tipo: 'numero' }],
  especialidades:[{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }],
  salas:         [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'area', tipo: 'texto' }, { nombre: 'capacidad', tipo: 'numero' }],
  enfermedades:  [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'categoria', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }],
  tratamientos:  [{ nombre: 'tipo', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }, { nombre: 'fecha_inicio', tipo: 'fecha' }],
  recetas:       [{ nombre: 'dosis', tipo: 'texto' }, { nombre: 'frecuencia', tipo: 'texto' }, { nombre: 'duracion', tipo: 'texto' }],
  citas:         [{ nombre: 'fecha', tipo: 'fecha' }, { nombre: 'motivo', tipo: 'texto' }, { nombre: 'estado', tipo: 'texto' }],
  platos:        [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'precio', tipo: 'numero' }, { nombre: 'descripcion', tipo: 'texto' }],
  mesas:         [{ nombre: 'numero_mesa', tipo: 'numero' }, { nombre: 'capacidad', tipo: 'numero' }, { nombre: 'estado', tipo: 'texto' }],
  cursos:        [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }, { nombre: 'creditos', tipo: 'numero' }],
  notas:         [{ nombre: 'nota', tipo: 'numero' }, { nombre: 'tipo', tipo: 'texto' }, { nombre: 'fecha', tipo: 'fecha' }],
  departamentos: [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'descripcion', tipo: 'texto' }],
  proyectos:     [{ nombre: 'nombre', tipo: 'texto' }, { nombre: 'estado', tipo: 'texto' }, { nombre: 'fecha_inicio', tipo: 'fecha' }],
};

// -----------------------------------------------
// Utilidades
// -----------------------------------------------

/** Normaliza texto para comparación: minúsculas sin acentos. */
function norm(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Detecta el dominio más probable en la descripción del usuario.
 * Devuelve el objeto de dominio, o null si no hay coincidencia.
 */
function detectarDominio(descripcion) {
  const desc = norm(descripcion);
  for (const dominio of DOMINIOS) {
    if (dominio.keywords.some((kw) => desc.includes(norm(kw)))) {
      return dominio;
    }
  }
  return null;
}

/**
 * Detecta si la descripción contiene señales de que el usuario pide más riqueza.
 * También considera que una descripción larga implica que el usuario quiere algo complejo.
 */
function pideMasRiqueza(descripcion) {
  const desc = norm(descripcion);
  const tieneKeywords = /completo|mas tabla|mas atributo|mas clas|mas relacion|rico|detallado|amplio|exhaustivo|extendido|todos los campos|muchos campos|con todo|bien estructurado/.test(desc);
  // Una descripción > 100 caracteres es señal de que el usuario quiere algo complejo
  const descripcionLarga = descripcion.trim().length > 100;
  return tieneKeywords || descripcionLarga;
}

/**
 * Busca la tabla de la plantilla de dominio que mejor coincide con el nombre dado.
 * Usa igualdad exacta y variantes de pluralización simples para evitar falsos positivos
 * como emparejar "ventas" con "detalle_ventas" por substring.
 */
function buscarEnPlantilla(nombreTabla, tablasPlantilla) {
  const n = norm(nombreTabla);
  return tablasPlantilla.find((pt) => {
    const pn = norm(pt.nombre);
    return pn === n ||
      pn === n + 's' || pn === n + 'es' ||
      n === pn + 's' || n === pn + 'es';
  });
}

/**
 * Completa las columnas de una tabla añadiendo las que falten de la plantilla.
 * No elimina ni modifica columnas existentes.
 */
function completarConPlantilla(tabla, plantillaTabla) {
  const existentes = new Set(tabla.columnas.map((c) => c.nombre));
  for (const col of plantillaTabla.columnas) {
    if (!existentes.has(col.nombre)) {
      tabla.columnas.push({ ...col });
      existentes.add(col.nombre);
    }
  }
}

/**
 * Completa columnas usando el mapa de columnas típicas por tipo de tabla.
 */
function completarConTipicas(tabla) {
  const tn = norm(tabla.nombre);
  for (const [tipo, columnas] of Object.entries(COLUMNAS_TIPICAS)) {
    if (tn === norm(tipo) || tn.includes(norm(tipo)) || norm(tipo).includes(tn)) {
      const existentes = new Set(tabla.columnas.map((c) => c.nombre));
      for (const col of columnas) {
        if (!existentes.has(col.nombre)) {
          tabla.columnas.push({ ...col });
          existentes.add(col.nombre);
        }
      }
      break;
    }
  }
}

// -----------------------------------------------
// Función principal pública
// -----------------------------------------------

/**
 * Enriquece el esquema devuelto por la IA aplicando heurísticas de dominio:
 *
 * 1. Amplía columnas de tablas existentes si tienen menos de MIN_COLUMNAS_UTILES.
 * 2. Añade tablas del dominio detectado que no existan en el esquema.
 *
 * Opera de forma conservadora: no elimina ni renombra nada existente.
 *
 * @param {{ tablas: Array }} esquema   - Esquema normalizado
 * @param {string} descripcion          - Descripción original del usuario
 * @returns {{ tablas: Array }}          - Esquema enriquecido
 */
function enriquecerEsquema(esquema, descripcion) {
  const dominio         = detectarDominio(descripcion);
  const quiereMasRiqueza = pideMasRiqueza(descripcion);

  console.log(`[enriquecerEsquema] Dominio detectado: ${dominio ? dominio.nombre : 'ninguno'} | masRiqueza: ${quiereMasRiqueza}`);

  // ── Paso 1: enriquecer columnas de tablas existentes si son escasas ──
  for (const tabla of esquema.tablas) {
    const utiles = tabla.columnas.filter((c) => c.nombre !== 'id').length;
    if (utiles < MIN_COLUMNAS_UTILES) {
      // Intentar con columnas típicas genéricas
      completarConTipicas(tabla);
      // Si hay dominio, completar también con la plantilla del dominio para esa tabla
      if (dominio) {
        const plantillaTabla = buscarEnPlantilla(tabla.nombre, dominio.tablas);
        if (plantillaTabla) completarConPlantilla(tabla, plantillaTabla);
      }
      console.log(`[enriquecerEsquema] Tabla "${tabla.nombre}" ampliada a ${tabla.columnas.length} columnas`);
    }
  }

  // ── Paso 2: añadir tablas faltantes del dominio cuando procede ──
  // Se consideran "pocas tablas" si el esquema tiene menos que la plantilla del dominio
  const pocasTablas = dominio
    ? esquema.tablas.length < dominio.tablas.length
    : esquema.tablas.length < 3;
  if (dominio && (pocasTablas || quiereMasRiqueza)) {
    const filasPorDefecto = esquema.tablas[0]?.filas || 50;
    const nombresExistentes = new Set(esquema.tablas.map((t) => norm(t.nombre)));

    for (const plantillaTabla of dominio.tablas) {
      const pn = norm(plantillaTabla.nombre);
      // Verificar que no exista ya una tabla con el mismo nombre o variante plural simple.
      // Se usa igualdad exacta + pluralización para evitar falsos positivos como
      // "ventas".includes("detalle_ventas") que bloquearía añadir tablas compuestas.
      const yaExiste = [...nombresExistentes].some((n) =>
        n === pn ||
        n === pn + 's' || n === pn + 'es' ||
        pn === n + 's' || pn === n + 'es'
      );
      if (!yaExiste) {
        esquema.tablas.push({
          nombre:   plantillaTabla.nombre,
          filas:    filasPorDefecto,
          columnas: plantillaTabla.columnas.map((c) => ({ ...c })),
        });
        nombresExistentes.add(pn);
        console.log(`[enriquecerEsquema] Tabla añadida desde plantilla: ${plantillaTabla.nombre}`);
      }
    }
  }

  return esquema;
}

module.exports = { enriquecerEsquema, detectarDominio, pideMasRiqueza };
