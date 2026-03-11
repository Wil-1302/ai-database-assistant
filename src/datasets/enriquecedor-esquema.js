'use strict';

// ============================================================
// Enriquecedor de esquema — v0.6.3
//
// Mejoras sobre v0.6.2:
// - Plantillas divididas en tablas_base (por defecto) y tablas_extra
//   (solo cuando el usuario pide más detalle)
// - 8 nuevos dominios: farmacia, banco, universidad, fabrica,
//   prision, mineria, logistica, turismo
// - enriquecimientoGenerico(): resuelve _id colgantes y añade
//   tabla de detalle cuando existe tabla de transacciones sin ella
// ============================================================

const MIN_COLUMNAS_UTILES = 3;

// -----------------------------------------------
// Helpers de columna
// -----------------------------------------------

const col  = (nombre, tipo)  => ({ nombre, tipo });
const txt  = (nombre)        => col(nombre, 'texto');
const num  = (nombre)        => col(nombre, 'numero');
const fec  = (nombre)        => col(nombre, 'fecha');
const bool = (nombre)        => col(nombre, 'booleano');
const fk   = (nombre)        => col(nombre, 'numero');
const id   = ()              => num('id');

// -----------------------------------------------
// Plantillas de dominio
// Cada dominio define:
//   keywords:    palabras clave que activan el dominio (normalizadas sin acentos)
//   tablas_base: estructura por defecto (4-6 tablas, útil y equilibrada)
//   tablas_extra: tablas adicionales solo cuando el usuario pide más detalle
// -----------------------------------------------

const DOMINIOS = [

  // ── Ferretería ──────────────────────────────────────────────
  {
    nombre: 'ferreteria',
    keywords: ['ferreteria', 'ferretera', 'herramienta', 'tornillo', 'clavo', 'pintura', 'ceramica', 'sanitario', 'plomeria'],
    tablas_base: [
      { nombre: 'categorias',     columnas: [id(), txt('nombre'), txt('descripcion')] },
      { nombre: 'proveedores',    columnas: [id(), txt('nombre_empresa'), txt('telefono'), txt('email'), txt('ciudad'), txt('ruc')] },
      { nombre: 'productos',      columnas: [id(), txt('nombre_producto'), txt('descripcion'), num('precio'), num('stock'), txt('sku'), fk('categoria_id'), fk('proveedor_id')] },
      { nombre: 'clientes',       columnas: [id(), txt('nombre_completo'), txt('telefono'), txt('email'), txt('ciudad'), fec('fecha_registro')] },
      { nombre: 'ventas',         columnas: [id(), fk('cliente_id'), fec('fecha'), num('total'), txt('estado'), txt('tipo_pago')] },
      { nombre: 'detalle_ventas', columnas: [id(), fk('venta_id'), fk('producto_id'), num('cantidad'), num('precio_unitario'), num('subtotal')] },
    ],
  },

  // ── Tienda / Comercio general ────────────────────────────────
  {
    nombre: 'tienda',
    keywords: ['tienda', 'comercio', 'mercado', 'almacen', 'minimarket', 'bazar', 'boutique', 'libreria', 'supermercado', 'hipermercado'],
    tablas_base: [
      { nombre: 'categorias',     columnas: [id(), txt('nombre'), txt('descripcion')] },
      { nombre: 'proveedores',    columnas: [id(), txt('nombre_empresa'), txt('telefono'), txt('email'), txt('ciudad')] },
      { nombre: 'productos',      columnas: [id(), txt('nombre_producto'), num('precio'), num('stock'), fk('categoria_id'), fk('proveedor_id')] },
      { nombre: 'clientes',       columnas: [id(), txt('nombre_completo'), txt('telefono'), txt('email'), txt('ciudad')] },
      { nombre: 'ventas',         columnas: [id(), fk('cliente_id'), fec('fecha'), num('total'), txt('estado')] },
      { nombre: 'detalle_ventas', columnas: [id(), fk('venta_id'), fk('producto_id'), num('cantidad'), num('precio_unitario')] },
    ],
    tablas_extra: [
      { nombre: 'empleados', columnas: [id(), txt('nombre_completo'), txt('cargo'), txt('turno'), txt('email'), num('salario')] },
      { nombre: 'ofertas',   columnas: [id(), fk('producto_id'), num('descuento'), fec('fecha_inicio'), fec('fecha_fin'), bool('activa')] },
    ],
  },

  // ── Vuelos ───────────────────────────────────────────────────
  {
    nombre: 'vuelo',
    keywords: ['vuelo', 'aerolinea', 'aeropuerto', 'avion', 'pasajero', 'boleto', 'ticket', 'aeronavegacion'],
    tablas_base: [
      { nombre: 'destinos',   columnas: [id(), txt('ciudad'), txt('pais'), txt('aeropuerto'), txt('codigo_iata')] },
      { nombre: 'vuelos',     columnas: [id(), txt('numero_vuelo'), fk('origen_id'), fk('destino_id'), fec('fecha_salida'), num('duracion'), txt('estado'), txt('aerolinea')] },
      { nombre: 'pasajeros',  columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), txt('pais'), fec('fecha_nacimiento')] },
      { nombre: 'boletos',    columnas: [id(), fk('pasajero_id'), fk('vuelo_id'), txt('clase'), txt('asiento'), num('precio'), fec('fecha_compra'), txt('estado')] },
      { nombre: 'equipajes',  columnas: [id(), fk('boleto_id'), num('peso'), txt('tipo'), txt('estado')] },
    ],
  },

  // ── Hospital / Salud ─────────────────────────────────────────
  {
    nombre: 'hospital',
    keywords: ['hospital', 'clinica', 'medico', 'salud', 'paciente', 'doctor', 'enfermera', 'farmacia hospital', 'ambulatorio'],
    tablas_base: [
      { nombre: 'especialidades', columnas: [id(), txt('nombre'), txt('descripcion')] },
      { nombre: 'medicamentos',   columnas: [id(), txt('nombre'), txt('principio_activo'), txt('laboratorio'), txt('presentacion'), num('precio'), num('stock')] },
      { nombre: 'doctores',       columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), fk('especialidad_id'), txt('matricula')] },
      { nombre: 'pacientes',      columnas: [id(), txt('nombre_completo'), fec('fecha_nacimiento'), txt('telefono'), txt('email'), txt('direccion'), txt('grupo_sanguineo')] },
      { nombre: 'citas',          columnas: [id(), fk('paciente_id'), fk('doctor_id'), fec('fecha'), txt('motivo'), txt('diagnostico'), txt('estado')] },
      { nombre: 'tratamientos',   columnas: [id(), fk('cita_id'), txt('tipo'), txt('descripcion'), fec('fecha_inicio'), num('duracion')] },
    ],
    tablas_extra: [
      { nombre: 'salas',       columnas: [id(), txt('nombre'), txt('area'), num('piso'), num('capacidad')] },
      { nombre: 'enfermedades',columnas: [id(), txt('nombre'), txt('categoria'), txt('descripcion')] },
      { nombre: 'recetas',     columnas: [id(), fk('tratamiento_id'), fk('medicamento_id'), txt('dosis'), txt('frecuencia'), txt('duracion')] },
    ],
  },

  // ── Restaurante ──────────────────────────────────────────────
  {
    nombre: 'restaurante',
    keywords: ['restaurante', 'restaurant', 'comida', 'cocina', 'menu', 'chef', 'plato', 'cafeteria', 'gastronomia', 'bar'],
    tablas_base: [
      { nombre: 'categorias',      columnas: [id(), txt('nombre'), txt('descripcion')] },
      { nombre: 'platos',          columnas: [id(), txt('nombre'), txt('descripcion'), num('precio'), fk('categoria_id'), bool('disponible')] },
      { nombre: 'clientes',        columnas: [id(), txt('nombre_completo'), txt('telefono'), txt('email')] },
      { nombre: 'mesas',           columnas: [id(), num('numero_mesa'), num('capacidad'), txt('zona'), txt('estado')] },
      { nombre: 'pedidos',         columnas: [id(), fk('cliente_id'), fk('mesa_id'), fec('fecha'), num('total'), txt('estado')] },
      { nombre: 'detalle_pedidos', columnas: [id(), fk('pedido_id'), fk('plato_id'), num('cantidad'), num('precio_unitario')] },
    ],
    tablas_extra: [
      { nombre: 'empleados', columnas: [id(), txt('nombre_completo'), txt('cargo'), txt('turno'), txt('email'), num('salario')] },
      { nombre: 'reservas',  columnas: [id(), fk('cliente_id'), fk('mesa_id'), fec('fecha'), num('personas'), txt('estado')] },
    ],
  },

  // ── Escuela / Colegio ────────────────────────────────────────
  {
    nombre: 'escuela',
    keywords: ['escuela', 'colegio', 'academia', 'educacion', 'alumno', 'estudiante', 'docente'],
    tablas_base: [
      { nombre: 'cursos',     columnas: [id(), txt('nombre'), txt('descripcion'), num('creditos'), txt('nivel')] },
      { nombre: 'profesores', columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), txt('especialidad')] },
      { nombre: 'alumnos',    columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), fec('fecha_nacimiento'), txt('ciudad')] },
      { nombre: 'matriculas', columnas: [id(), fk('alumno_id'), fk('curso_id'), fk('profesor_id'), fec('fecha_inicio'), txt('estado')] },
    ],
    tablas_extra: [
      { nombre: 'notas',    columnas: [id(), fk('matricula_id'), num('nota'), txt('tipo'), fec('fecha'), txt('observacion')] },
      { nombre: 'horarios', columnas: [id(), fk('curso_id'), txt('dia'), txt('hora_inicio'), txt('hora_fin'), txt('aula')] },
    ],
  },

  // ── Empresa ──────────────────────────────────────────────────
  {
    nombre: 'empresa',
    // Nota: 'empleado' se omite porque es demasiado genérico e interfiere con
    // otros dominios como minería, prisión o fábrica que también tienen empleados.
    keywords: ['empresa', 'negocio', 'corporacion', 'organizacion', 'rrhh', 'recursos humanos', 'departamento corporativo', 'oficina corporativa'],
    tablas_base: [
      { nombre: 'departamentos', columnas: [id(), txt('nombre'), txt('descripcion'), txt('responsable')] },
      { nombre: 'empleados',     columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), txt('cargo'), num('salario'), fk('departamento_id'), fec('fecha_ingreso')] },
      { nombre: 'clientes',      columnas: [id(), txt('nombre_empresa'), txt('contacto'), txt('email'), txt('telefono'), txt('ciudad')] },
      { nombre: 'proyectos',     columnas: [id(), txt('nombre'), txt('descripcion'), fk('cliente_id'), fec('fecha_inicio'), txt('estado'), num('presupuesto')] },
    ],
    tablas_extra: [
      { nombre: 'contratos',   columnas: [id(), fk('cliente_id'), fk('proyecto_id'), fec('fecha_inicio'), fec('fecha_fin'), num('valor'), txt('tipo'), txt('estado')] },
      { nombre: 'asignaciones',columnas: [id(), fk('empleado_id'), fk('proyecto_id'), txt('rol'), fec('fecha_inicio'), num('horas_semanales')] },
    ],
  },

  // ── Farmacia ─────────────────────────────────────────────────
  {
    nombre: 'farmacia',
    keywords: ['farmacia', 'drogueria', 'botica', 'medicamento', 'farmaceutico', 'dispensario'],
    tablas_base: [
      { nombre: 'categorias',     columnas: [id(), txt('nombre'), txt('descripcion')] },
      { nombre: 'proveedores',    columnas: [id(), txt('nombre_empresa'), txt('telefono'), txt('email'), txt('ciudad'), txt('ruc')] },
      { nombre: 'medicamentos',   columnas: [id(), txt('nombre'), txt('principio_activo'), txt('laboratorio'), txt('presentacion'), num('precio'), num('stock'), fk('categoria_id'), fk('proveedor_id'), bool('requiere_receta')] },
      { nombre: 'clientes',       columnas: [id(), txt('nombre_completo'), txt('telefono'), txt('email'), fec('fecha_nacimiento')] },
      { nombre: 'ventas',         columnas: [id(), fk('cliente_id'), fec('fecha'), num('total'), txt('tipo_pago'), txt('estado')] },
      { nombre: 'detalle_ventas', columnas: [id(), fk('venta_id'), fk('medicamento_id'), num('cantidad'), num('precio_unitario')] },
    ],
    tablas_extra: [
      { nombre: 'empleados',       columnas: [id(), txt('nombre_completo'), txt('cargo'), txt('turno'), txt('email'), num('salario')] },
      { nombre: 'recetas_medicas', columnas: [id(), fk('cliente_id'), txt('medico'), fec('fecha'), txt('diagnostico'), txt('estado')] },
    ],
  },

  // ── Banco / Entidad financiera ───────────────────────────────
  {
    nombre: 'banco',
    keywords: ['banco', 'bancario', 'financiero', 'credito', 'prestamo', 'cuenta bancaria', 'entidad financiera', 'cooperativa'],
    tablas_base: [
      { nombre: 'clientes',       columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), txt('documento'), txt('tipo_cliente'), fec('fecha_apertura')] },
      { nombre: 'cuentas',        columnas: [id(), fk('cliente_id'), txt('numero_cuenta'), txt('tipo_cuenta'), num('saldo'), txt('estado'), fec('fecha_apertura')] },
      { nombre: 'tarjetas',       columnas: [id(), fk('cuenta_id'), txt('numero_tarjeta'), txt('tipo'), num('limite'), txt('estado'), fec('fecha_vencimiento')] },
      { nombre: 'transacciones',  columnas: [id(), fk('cuenta_id'), txt('tipo'), num('monto'), txt('descripcion'), fec('fecha'), txt('estado')] },
    ],
    tablas_extra: [
      { nombre: 'prestamos',   columnas: [id(), fk('cliente_id'), num('monto'), num('tasa_interes'), num('plazo_meses'), txt('estado'), fec('fecha_inicio'), num('cuota_mensual')] },
      { nombre: 'sucursales',  columnas: [id(), txt('nombre'), txt('ciudad'), txt('direccion'), txt('telefono'), txt('horario')] },
      { nombre: 'empleados',   columnas: [id(), txt('nombre_completo'), txt('cargo'), fk('sucursal_id'), txt('email'), num('salario')] },
    ],
  },

  // ── Universidad ──────────────────────────────────────────────
  {
    nombre: 'universidad',
    keywords: ['universidad', 'facultad', 'carrera universitaria', 'ingenieria', 'licenciatura', 'postgrado', 'maestria', 'doctorado'],
    tablas_base: [
      { nombre: 'facultades',   columnas: [id(), txt('nombre'), txt('descripcion'), txt('decano')] },
      { nombre: 'cursos',       columnas: [id(), txt('nombre'), num('creditos'), fk('facultad_id'), txt('descripcion'), txt('nivel')] },
      { nombre: 'profesores',   columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), txt('especialidad'), fk('facultad_id')] },
      { nombre: 'estudiantes',  columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), fec('fecha_nacimiento'), txt('carrera'), num('semestre')] },
      { nombre: 'matriculas',   columnas: [id(), fk('estudiante_id'), fk('curso_id'), fk('profesor_id'), txt('periodo'), txt('estado')] },
    ],
    tablas_extra: [
      { nombre: 'notas',   columnas: [id(), fk('matricula_id'), num('nota_final'), num('nota_parcial'), txt('periodo'), txt('estado')] },
      { nombre: 'aulas',   columnas: [id(), txt('nombre'), num('capacidad'), txt('edificio'), num('piso'), txt('tipo')] },
    ],
  },

  // ── Fábrica / Manufactura ────────────────────────────────────
  {
    nombre: 'fabrica',
    keywords: ['fabrica', 'manufactura', 'produccion', 'planta', 'industria', 'manufactura', 'ensamble', 'proceso industrial'],
    tablas_base: [
      { nombre: 'productos',           columnas: [id(), txt('nombre'), txt('codigo'), txt('unidad'), num('precio_unitario'), txt('categoria')] },
      { nombre: 'materias_primas',     columnas: [id(), txt('nombre'), txt('unidad'), num('stock'), num('costo_unitario'), txt('proveedor')] },
      { nombre: 'empleados',           columnas: [id(), txt('nombre_completo'), txt('cargo'), txt('area'), txt('turno'), num('salario')] },
      { nombre: 'ordenes_produccion',  columnas: [id(), fk('producto_id'), num('cantidad_planificada'), num('cantidad_producida'), fec('fecha_inicio'), fec('fecha_fin'), txt('estado')] },
      { nombre: 'produccion_detalle',  columnas: [id(), fk('orden_id'), fk('materia_prima_id'), num('cantidad_usada'), fec('fecha')] },
    ],
    tablas_extra: [
      { nombre: 'maquinaria',    columnas: [id(), txt('nombre'), txt('modelo'), txt('area'), txt('estado'), fec('fecha_adquisicion')] },
      { nombre: 'mantenimiento', columnas: [id(), fk('maquina_id'), txt('tipo'), txt('descripcion'), fec('fecha'), num('costo'), txt('tecnico')] },
    ],
  },

  // ── Prisión / Reclusorio ─────────────────────────────────────
  {
    nombre: 'prision',
    keywords: ['prision', 'carcel', 'penitenciaria', 'penitenciario', 'recluso', 'presidiario', 'penado', 'interno', 'reclusorio', 'centro penitenciario', 'sistema carcelario'],
    tablas_base: [
      { nombre: 'bloques',     columnas: [id(), txt('nombre'), txt('tipo'), num('capacidad'), txt('estado')] },
      { nombre: 'celdas',      columnas: [id(), fk('bloque_id'), txt('numero'), num('capacidad'), txt('tipo'), txt('estado')] },
      { nombre: 'guardias',    columnas: [id(), txt('nombre_completo'), txt('rango'), txt('turno'), fk('bloque_id'), txt('telefono')] },
      { nombre: 'prisioneros', columnas: [id(), txt('nombre_completo'), txt('documento'), fk('celda_id'), txt('delito'), txt('categoria_delito'), fec('fecha_ingreso'), fec('fecha_salida_estimada'), txt('estado')] },
      { nombre: 'incidentes',  columnas: [id(), fk('prisionero_id'), fk('guardia_id'), txt('tipo'), txt('descripcion'), txt('gravedad'), fec('fecha'), txt('estado')] },
    ],
    tablas_extra: [
      { nombre: 'visitas',   columnas: [id(), fk('prisionero_id'), txt('visitante_nombre'), txt('parentesco'), fec('fecha'), num('duracion_minutos'), txt('estado')] },
      { nombre: 'sanciones', columnas: [id(), fk('prisionero_id'), txt('tipo'), txt('motivo'), fec('fecha'), num('duracion_dias'), txt('estado')] },
    ],
  },

  // ── Minería ──────────────────────────────────────────────────
  {
    nombre: 'mineria',
    keywords: ['mineria', 'mina', 'mineral', 'yacimiento', 'cantera', 'extraccion', 'minero', 'explotacion minera'],
    tablas_base: [
      { nombre: 'minas',      columnas: [id(), txt('nombre'), txt('ubicacion'), txt('mineral_principal'), txt('tipo_extraccion'), txt('estado')] },
      { nombre: 'minerales',  columnas: [id(), txt('nombre'), txt('simbolo'), txt('unidad'), num('precio_tonelada'), txt('pureza_minima')] },
      { nombre: 'empleados',  columnas: [id(), txt('nombre_completo'), txt('cargo'), txt('especialidad'), fk('mina_id'), txt('turno'), num('salario')] },
      { nombre: 'turnos',     columnas: [id(), fk('empleado_id'), fk('mina_id'), fec('fecha'), txt('hora_inicio'), txt('hora_fin'), txt('tipo')] },
      { nombre: 'produccion', columnas: [id(), fk('mina_id'), fk('mineral_id'), fec('fecha'), num('cantidad_toneladas'), num('pureza'), txt('calidad')] },
    ],
    tablas_extra: [
      { nombre: 'maquinaria',    columnas: [id(), txt('nombre'), txt('tipo'), fk('mina_id'), txt('modelo'), txt('estado'), fec('fecha_adquisicion')] },
      { nombre: 'mantenimiento', columnas: [id(), fk('maquina_id'), txt('tipo'), txt('tecnico'), fec('fecha'), txt('descripcion'), num('costo')] },
    ],
  },

  // ── Logística / Transporte ───────────────────────────────────
  {
    nombre: 'logistica',
    keywords: ['logistica', 'envio', 'distribucion', 'flota', 'transporte', 'courier', 'mensajeria', 'cadena suministro'],
    tablas_base: [
      { nombre: 'clientes',     columnas: [id(), txt('nombre_completo'), txt('empresa'), txt('telefono'), txt('email'), txt('direccion'), txt('ciudad')] },
      { nombre: 'pedidos',      columnas: [id(), fk('cliente_id'), fec('fecha'), txt('estado'), num('peso_total'), num('valor_declarado'), txt('direccion_entrega')] },
      { nombre: 'repartidores', columnas: [id(), txt('nombre_completo'), txt('telefono'), txt('vehiculo'), txt('zona'), bool('activo')] },
      { nombre: 'envios',       columnas: [id(), fk('pedido_id'), fk('repartidor_id'), fec('fecha_salida'), fec('fecha_llegada_estimada'), txt('estado'), txt('codigo_seguimiento')] },
      { nombre: 'rutas',        columnas: [id(), txt('origen'), txt('destino'), num('distancia_km'), num('tiempo_estimado_horas'), txt('tipo')] },
    ],
    tablas_extra: [
      { nombre: 'almacenes', columnas: [id(), txt('nombre'), txt('ciudad'), txt('direccion'), num('capacidad_m3'), txt('responsable')] },
      { nombre: 'vehiculos', columnas: [id(), txt('placa'), txt('tipo'), num('capacidad_kg'), fk('repartidor_id'), txt('estado'), fec('ultimo_mantenimiento')] },
    ],
  },

  // ── Turismo / Hotelería ──────────────────────────────────────
  {
    nombre: 'turismo',
    keywords: ['turismo', 'hotel', 'hostal', 'viaje', 'reserva', 'huesped', 'hospedaje', 'resort', 'agencia viajes'],
    tablas_base: [
      { nombre: 'destinos',     columnas: [id(), txt('nombre'), txt('pais'), txt('ciudad'), txt('descripcion'), txt('categoria')] },
      { nombre: 'hoteles',      columnas: [id(), txt('nombre'), fk('destino_id'), num('categoria_estrellas'), txt('telefono'), txt('email'), num('precio_noche')] },
      { nombre: 'habitaciones', columnas: [id(), fk('hotel_id'), txt('numero'), txt('tipo'), num('capacidad'), num('precio_noche'), txt('estado')] },
      { nombre: 'clientes',     columnas: [id(), txt('nombre_completo'), txt('email'), txt('telefono'), txt('pais'), txt('documento')] },
      { nombre: 'reservas',     columnas: [id(), fk('cliente_id'), fk('habitacion_id'), fec('fecha_entrada'), fec('fecha_salida'), num('total'), txt('estado'), txt('tipo_pago')] },
    ],
    tablas_extra: [
      { nombre: 'tours',  columnas: [id(), fk('destino_id'), txt('nombre'), txt('descripcion'), num('precio'), num('duracion_horas'), num('cupo')] },
      { nombre: 'pagos',  columnas: [id(), fk('reserva_id'), num('monto'), txt('metodo'), fec('fecha'), txt('estado')] },
    ],
  },
];

// -----------------------------------------------
// Columnas típicas por tipo de tabla
// Usadas en enriquecimiento genérico y completarConTipicas()
// -----------------------------------------------

const COLUMNAS_TIPICAS = {
  // Genérico / comercio
  clientes:      [txt('nombre_completo'), txt('email'), txt('telefono'), txt('ciudad')],
  productos:     [txt('nombre_producto'), num('precio'), num('stock'), txt('descripcion')],
  ventas:        [fec('fecha'), num('total'), txt('estado'), txt('tipo_pago')],
  pedidos:       [fec('fecha'), num('total'), txt('estado'), txt('direccion_entrega')],
  categorias:    [txt('nombre'), txt('descripcion')],
  proveedores:   [txt('nombre_empresa'), txt('telefono'), txt('email'), txt('ciudad')],
  empleados:     [txt('nombre_completo'), txt('email'), txt('cargo'), num('salario')],
  // Hospital
  doctores:      [txt('nombre_completo'), txt('email'), txt('telefono')],
  pacientes:     [txt('nombre_completo'), txt('telefono'), fec('fecha_nacimiento')],
  medicamentos:  [txt('nombre'), txt('principio_activo'), num('precio'), num('stock')],
  especialidades:[txt('nombre'), txt('descripcion')],
  salas:         [txt('nombre'), txt('area'), num('capacidad')],
  enfermedades:  [txt('nombre'), txt('categoria'), txt('descripcion')],
  tratamientos:  [txt('tipo'), txt('descripcion'), fec('fecha_inicio')],
  recetas:       [txt('dosis'), txt('frecuencia'), txt('duracion')],
  citas:         [fec('fecha'), txt('motivo'), txt('estado')],
  // Escuela/Universidad
  alumnos:       [txt('nombre_completo'), txt('email'), txt('telefono')],
  profesores:    [txt('nombre_completo'), txt('email'), txt('especialidad')],
  matriculas:    [fec('fecha_inicio'), txt('estado')],
  notas:         [num('nota'), txt('tipo'), fec('fecha')],
  cursos:        [txt('nombre'), txt('descripcion'), num('creditos')],
  facultades:    [txt('nombre'), txt('descripcion')],
  estudiantes:   [txt('nombre_completo'), txt('email'), txt('carrera')],
  // Vuelos
  pasajeros:     [txt('nombre_completo'), txt('email'), txt('telefono')],
  vuelos:        [txt('numero_vuelo'), fec('fecha_salida'), txt('estado')],
  boletos:       [txt('clase'), num('precio'), fec('fecha_compra')],
  destinos:      [txt('ciudad'), txt('pais'), txt('codigo_iata')],
  // Restaurante
  platos:        [txt('nombre'), num('precio'), txt('descripcion')],
  mesas:         [num('numero_mesa'), num('capacidad'), txt('estado')],
  // Empresa
  departamentos: [txt('nombre'), txt('descripcion')],
  proyectos:     [txt('nombre'), txt('estado'), fec('fecha_inicio')],
  // Banco
  cuentas:       [txt('numero_cuenta'), txt('tipo_cuenta'), num('saldo'), txt('estado')],
  transacciones: [txt('tipo'), num('monto'), fec('fecha'), txt('estado')],
  tarjetas:      [txt('tipo'), num('limite'), txt('estado')],
  prestamos:     [num('monto'), num('tasa_interes'), txt('estado')],
  sucursales:    [txt('nombre'), txt('ciudad'), txt('direccion')],
  // Logística
  repartidores:  [txt('nombre_completo'), txt('telefono'), txt('vehiculo'), txt('zona')],
  envios:        [fec('fecha_salida'), txt('estado'), txt('codigo_seguimiento')],
  rutas:         [txt('origen'), txt('destino'), num('distancia_km')],
  almacenes:     [txt('nombre'), txt('ciudad'), num('capacidad_m3')],
  // Turismo
  hoteles:       [txt('nombre'), num('categoria_estrellas'), num('precio_noche')],
  habitaciones:  [txt('numero'), txt('tipo'), num('precio_noche'), txt('estado')],
  reservas:      [fec('fecha_entrada'), fec('fecha_salida'), num('total'), txt('estado')],
  // Fábrica
  maquinaria:    [txt('nombre'), txt('modelo'), txt('estado'), txt('area')],
  mantenimiento: [txt('tipo'), fec('fecha'), num('costo'), txt('descripcion')],
  // Minería
  minas:         [txt('nombre'), txt('ubicacion'), txt('mineral_principal'), txt('estado')],
  minerales:     [txt('nombre'), txt('simbolo'), num('precio_tonelada')],
  turnos:        [fec('fecha'), txt('hora_inicio'), txt('hora_fin'), txt('tipo')],
  produccion:    [fec('fecha'), num('cantidad_toneladas'), txt('calidad')],
  // Prisión
  prisioneros:   [txt('nombre_completo'), txt('documento'), txt('delito'), fec('fecha_ingreso')],
  guardias:      [txt('nombre_completo'), txt('rango'), txt('turno')],
  celdas:        [txt('numero'), num('capacidad'), txt('tipo'), txt('estado')],
  bloques:       [txt('nombre'), txt('tipo'), num('capacidad')],
  incidentes:    [txt('tipo'), txt('descripcion'), fec('fecha'), txt('gravedad')],
  visitas:       [txt('visitante_nombre'), txt('parentesco'), fec('fecha')],
};

// -----------------------------------------------
// Utilidades de normalización
// -----------------------------------------------

function norm(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// -----------------------------------------------
// Detección de dominio
// -----------------------------------------------

function detectarDominio(descripcion) {
  const desc = norm(descripcion);
  let mejorDominio  = null;
  let mejorPuntuacion = 0;

  for (const dominio of DOMINIOS) {
    // Contar cuántas keywords del dominio aparecen en la descripción.
    // Además, las keywords más largas (más específicas) puntúan más.
    let puntuacion = 0;
    for (const kw of dominio.keywords) {
      if (desc.includes(norm(kw))) {
        // Bonus por especificidad: keyword más larga = más específica
        puntuacion += 1 + kw.length * 0.01;
      }
    }
    if (puntuacion > mejorPuntuacion) {
      mejorPuntuacion = puntuacion;
      mejorDominio    = dominio;
    }
  }

  return mejorDominio;
}

// -----------------------------------------------
// Detección de pedido de mayor riqueza
// -----------------------------------------------

function pideMasRiqueza(descripcion) {
  const desc = norm(descripcion);
  const tieneKeywords = /completo|mas tabla|mas atributo|mas clas|mas relacion|rico|detallado|amplio|exhaustivo|extendido|todos los campos|muchos campos|con todo|bien estructurado|muy completo|muy detallado|tipo sistema|normalizado/.test(desc);
  // Descripción > 100 caracteres sugiere que el usuario quiere algo más elaborado
  const descripcionLarga = descripcion.trim().length > 100;
  return tieneKeywords || descripcionLarga;
}

// -----------------------------------------------
// Completar columnas desde plantilla
// -----------------------------------------------

function buscarEnPlantilla(nombreTabla, tablasPlantilla) {
  const n = norm(nombreTabla);
  return tablasPlantilla.find((pt) => {
    const pn = norm(pt.nombre);
    return pn === n ||
      pn === n + 's' || pn === n + 'es' ||
      n === pn + 's' || n === pn + 'es';
  });
}

function completarConPlantilla(tabla, plantillaTabla) {
  const existentes = new Set(tabla.columnas.map((c) => c.nombre));
  for (const col of plantillaTabla.columnas) {
    if (!existentes.has(col.nombre)) {
      tabla.columnas.push({ ...col });
      existentes.add(col.nombre);
    }
  }
}

function completarConTipicas(tabla) {
  const tn = norm(tabla.nombre);
  for (const [tipo, columnas] of Object.entries(COLUMNAS_TIPICAS)) {
    if (tn === norm(tipo) || tn === norm(tipo) + 's' || norm(tipo) === tn + 's') {
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
// Enriquecimiento genérico para dominios desconocidos
// -----------------------------------------------

/**
 * Aplica heurísticas estructurales cuando no se detecta un dominio conocido.
 *
 * 1. Resuelve referencias _id colgantes: si existe "empleado_id" pero no
 *    hay tabla "empleados", crea una tabla mínima con columnas estándar.
 * 2. Si hay una tabla de transacciones (ventas, pedidos...) sin tabla de
 *    detalle correspondiente, la añade.
 */
function enriquecimientoGenerico(esquema) {
  const filasPorDefecto = esquema.tablas[0]?.filas || 50;
  const tablasNombre    = new Set(esquema.tablas.map((t) => t.nombre));

  // ── 1. Resolver _id colgantes ────────────────────────────────
  const tablasAAgregar = new Map(); // nombreTablaACrear → columnas

  for (const tabla of [...esquema.tablas]) {
    for (const colDef of tabla.columnas) {
      if (colDef.nombre === 'id' || !colDef.nombre.endsWith('_id')) continue;

      const ref        = colDef.nombre.slice(0, -3); // "empleado" de "empleado_id"
      const candidatos = [ref, ref + 's', ref + 'es'];
      const existe     = candidatos.some((c) => tablasNombre.has(c));

      if (!existe && !tablasAAgregar.has(ref + 's')) {
        const columnas = columnasPorDefectoParaReferencia(ref + 's');
        tablasAAgregar.set(ref + 's', columnas);
      }
    }
  }

  for (const [nombre, columnas] of tablasAAgregar) {
    esquema.tablas.push({ nombre, filas: filasPorDefecto, columnas });
    tablasNombre.add(nombre);
    console.log(`[enriquecimientoGenerico] Tabla referenciada añadida: ${nombre}`);
  }

  // ── 2. Tabla de detalle para transacciones sin detalle ───────
  const tablaTransac = esquema.tablas.find(
    (t) => /^(venta|pedido|compra|orden)/.test(t.nombre)
  );
  const tieneDetalle = esquema.tablas.some((t) => /detalle/.test(t.nombre));

  if (tablaTransac && !tieneDetalle) {
    const nombreDetalle   = 'detalle_' + tablaTransac.nombre;
    const tieneProductos  = esquema.tablas.some((t) => /producto|articulo|item/.test(t.nombre));
    const colExtra        = tieneProductos
      ? [col('producto_id', 'numero')]
      : [col('descripcion', 'texto')];

    esquema.tablas.push({
      nombre:   nombreDetalle,
      filas:    filasPorDefecto,
      columnas: [
        id(),
        col(tablaTransac.nombre + '_id', 'numero'),
        ...colExtra,
        num('cantidad'),
        num('precio_unitario'),
        num('subtotal'),
      ],
    });
    console.log(`[enriquecimientoGenerico] Tabla de detalle añadida: ${nombreDetalle}`);
  }
}

/**
 * Devuelve columnas mínimas estándar para una tabla referenciada
 * que no existe en el esquema. Usa COLUMNAS_TIPICAS si hay match.
 */
function columnasPorDefectoParaReferencia(nombre) {
  const n     = norm(nombre).replace(/s$/, ''); // quitar plural para buscar en típicas
  const extra = COLUMNAS_TIPICAS[nombre] || COLUMNAS_TIPICAS[n];
  if (extra) {
    return [id(), ...extra];
  }
  return [id(), txt('nombre'), txt('descripcion'), txt('estado')];
}

// -----------------------------------------------
// Función principal pública
// -----------------------------------------------

/**
 * Enriquece el esquema devuelto por la IA aplicando heurísticas de dominio.
 *
 * Paso 1: amplía columnas de tablas existentes con pocas columnas.
 * Paso 2: añade tablas faltantes del dominio detectado.
 *         - tablas_base: siempre (si el esquema tiene menos tablas que la plantilla base)
 *         - tablas_extra: solo cuando el usuario pide más riqueza
 * Paso 3: si no hay dominio detectado, aplica enriquecimientoGenerico()
 *         para resolver _id colgantes y añadir tablas de detalle.
 *
 * @param {{ tablas: Array }} esquema
 * @param {string} descripcion
 * @returns {{ tablas: Array }}
 */
function enriquecerEsquema(esquema, descripcion) {
  const dominio          = detectarDominio(descripcion);
  const quiereMasRiqueza = pideMasRiqueza(descripcion);

  console.log(`[enriquecerEsquema] Dominio: ${dominio ? dominio.nombre : 'ninguno'} | masRiqueza: ${quiereMasRiqueza}`);

  // Recopilar todas las tablas de plantilla disponibles para enriquecimiento de columnas
  const todasLasTablasDominio = dominio
    ? [...dominio.tablas_base, ...(dominio.tablas_extra || [])]
    : [];

  // Tablas objetivo para añadir al esquema según nivel de detalle pedido
  const tablasObjetivo = dominio
    ? (quiereMasRiqueza
        ? todasLasTablasDominio
        : dominio.tablas_base)
    : [];

  // ── Paso 1: enriquecer columnas de tablas existentes ────────
  // Si hay dominio detectado, siempre completa con la plantilla cuando hay match.
  // Si no hay dominio, solo completa cuando la tabla tiene pocas columnas.
  for (const tabla of esquema.tablas) {
    const utiles = tabla.columnas.filter((c) => c.nombre !== 'id').length;
    let enriquecida = false;

    if (dominio) {
      const plantillaTabla = buscarEnPlantilla(tabla.nombre, todasLasTablasDominio);
      if (plantillaTabla) {
        // Aplicar plantilla del dominio siempre (añade columnas que falten)
        completarConPlantilla(tabla, plantillaTabla);
        enriquecida = true;
      } else if (utiles < MIN_COLUMNAS_UTILES) {
        // No hay match en la plantilla, pero la tabla es escasa → usar típicas
        completarConTipicas(tabla);
        enriquecida = true;
      }
    } else if (utiles < MIN_COLUMNAS_UTILES) {
      completarConTipicas(tabla);
      enriquecida = true;
    }

    if (enriquecida) {
      console.log(`[enriquecerEsquema] Tabla "${tabla.nombre}" → ${tabla.columnas.length} col.`);
    }
  }

  // ── Paso 2: añadir tablas faltantes del dominio ──────────────
  if (tablasObjetivo.length > 0) {
    const pocasTablas       = esquema.tablas.length < tablasObjetivo.length;
    const filasPorDefecto   = esquema.tablas[0]?.filas || 50;
    const nombresExistentes = new Set(esquema.tablas.map((t) => norm(t.nombre)));

    if (pocasTablas || quiereMasRiqueza) {
      for (const plantillaTabla of tablasObjetivo) {
        const pn = norm(plantillaTabla.nombre);
        const yaExiste = [...nombresExistentes].some((n) =>
          n === pn || n === pn + 's' || n === pn + 'es' ||
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
  } else {
    // Dominio desconocido: enriquecimiento estructural genérico
    enriquecimientoGenerico(esquema);
  }

  return esquema;
}

module.exports = { enriquecerEsquema, detectarDominio, pideMasRiqueza };
