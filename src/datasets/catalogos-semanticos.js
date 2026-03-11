'use strict';

// ============================================================
// Catálogos semánticos por dominio — v0.6.2
// Proporciona valores realistas y coherentes para cada tipo de
// entidad. La función principal es obtenerGeneradorSemantico(),
// que devuelve un generador (indice) => valor o null.
// ============================================================

const { faker } = require('@faker-js/faker');

// -----------------------------------------------
// Catálogos de valores reales por dominio
// -----------------------------------------------

const CAT = {

  // ── Hospital / Salud ──────────────────────────────────────
  medicamentos: [
    'Paracetamol 500mg', 'Ibuprofeno 400mg', 'Amoxicilina 875mg', 'Omeprazol 20mg',
    'Metformina 850mg', 'Atorvastatina 40mg', 'Losartán 50mg', 'Enalapril 10mg',
    'Amlodipino 5mg', 'Diclofenaco 75mg', 'Azitromicina 500mg', 'Ciprofloxacino 500mg',
    'Metronidazol 500mg', 'Salbutamol 100mcg', 'Insulina Glargina 100UI',
    'Warfarina 5mg', 'Levotiroxina 50mcg', 'Alprazolam 0.5mg', 'Tramadol 50mg',
    'Prednisona 20mg', 'Cetirizina 10mg', 'Ranitidina 150mg', 'Clonazepam 2mg',
    'Metoclopramida 10mg', 'Captopril 25mg', 'Furosemida 40mg', 'Espironolactona 25mg',
  ],
  principios_activos: [
    'Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Omeprazol', 'Metformina',
    'Atorvastatina', 'Losartán', 'Enalapril', 'Amlodipino', 'Diclofenaco',
    'Azitromicina', 'Ciprofloxacino', 'Metronidazol', 'Salbutamol', 'Warfarina',
    'Levotiroxina', 'Alprazolam', 'Tramadol', 'Prednisona', 'Cetirizina',
  ],
  laboratorios: [
    'Pfizer', 'Bayer', 'Roche', 'Novartis', 'MSD', 'Abbott', 'Sanofi',
    'AstraZeneca', 'Glenmark', 'Genomma Lab', 'Siegfried', 'Farmindustria',
    'GlaxoSmithKline', 'Boehringer Ingelheim', 'Grünenthal',
  ],
  presentaciones_medicamento: [
    'Tabletas', 'Cápsulas', 'Jarabe 120ml', 'Ampolla 5ml', 'Suspensión 100ml',
    'Crema 30g', 'Gotas oftálmicas 10ml', 'Parche transdérmico', 'Supositorios',
    'Aerosol nasal', 'Solución inyectable', 'Gel tópico 50g',
  ],
  especialidades_medicas: [
    'Cardiología', 'Neurología', 'Pediatría', 'Oncología', 'Traumatología',
    'Dermatología', 'Ginecología y Obstetricia', 'Psiquiatría', 'Radiología',
    'Anestesiología', 'Gastroenterología', 'Urología', 'Oftalmología',
    'Otorrinolaringología', 'Endocrinología', 'Reumatología', 'Nefrología',
    'Infectología', 'Medicina Interna', 'Cirugía General',
  ],
  salas_hospital: [
    'Urgencias', 'UCI Adultos', 'UCI Pediátrica', 'Neonatología',
    'Quirófano 1', 'Quirófano 2', 'Quirófano 3', 'Sala Pediátrica A',
    'Medicina Interna A', 'Medicina Interna B', 'Traumatología y Ortopedia',
    'Oncología Clínica', 'Cardiología Intervencionista', 'Consulta Externa 1',
    'Consulta Externa 2', 'Radiología', 'Laboratorio Clínico', 'Terapia Física',
    'Hematología', 'Geriatría', 'Maternidad',
  ],
  areas_hospital: [
    'Urgencias', 'Hospitalización', 'Cirugía', 'Consulta Externa',
    'Diagnóstico por Imágenes', 'Laboratorio', 'Terapia Intensiva',
    'Pediatría', 'Neonatología', 'Rehabilitación', 'Farmacia',
  ],
  enfermedades: [
    'Hipertensión arterial', 'Diabetes mellitus tipo 2', 'Insuficiencia cardíaca congestiva',
    'Neumonía adquirida en la comunidad', 'Fractura de fémur', 'Infarto agudo de miocardio',
    'Accidente cerebrovascular isquémico', 'Anemia ferropénica', 'Lumbalgia crónica',
    'Artritis reumatoide', 'Asma bronquial', 'Gastritis crónica activa',
    'Migraña sin aura', 'Epilepsia focal', 'Hipotiroidismo primario',
    'EPOC moderado', 'Insuficiencia renal crónica estadio 3', 'Apendicitis aguda',
    'Colecistitis calculosa', 'Hernia inguinal directa', 'Fibrilación auricular',
    'Depresión mayor recurrente', 'Ansiedad generalizada', 'Obesidad grado II',
  ],
  categorias_enfermedad: [
    'Cardiovascular', 'Metabólica', 'Respiratoria', 'Digestiva', 'Musculoesquelética',
    'Neurológica', 'Infecciosa', 'Endocrina', 'Mental', 'Neoplásica', 'Renal',
  ],
  tipos_tratamiento: [
    'Medicación oral', 'Medicación intravenosa', 'Fisioterapia', 'Cirugía programada',
    'Cirugía de urgencia', 'Radioterapia', 'Quimioterapia', 'Hemodiálisis',
    'Rehabilitación', 'Oxigenoterapia', 'Psicoterapia', 'Observación hospitalaria',
    'Tratamiento ambulatorio', 'Inmovilización', 'Endoscopia terapéutica',
  ],
  motivos_cita: [
    'Control periódico', 'Primera consulta', 'Seguimiento de tratamiento',
    'Dolor torácico', 'Fiebre persistente', 'Control de presión arterial',
    'Revisión de análisis', 'Dolor abdominal', 'Cefalea severa',
    'Control diabetes', 'Revisión post-operatoria', 'Chequeo anual',
    'Dolor articular', 'Dificultad respiratoria', 'Control de peso',
  ],
  gravedades: ['Leve', 'Moderada', 'Grave', 'Crítica'],
  grupos_sanguineos: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  dosis_medicas: ['500mg', '250mg', '100mg', '20mg', '10mg', '5mg', '1g', '250mcg', '40mg', '75mg'],
  frecuencias_medicas: [
    'Cada 8 horas', 'Cada 12 horas', 'Una vez al día', 'Cada 6 horas',
    'Dos veces al día', 'Una vez a la semana', 'Cada 24 horas',
  ],
  duraciones_tratamiento: [
    '5 días', '7 días', '10 días', '14 días', '21 días', '30 días', 'Indefinido',
  ],

  // ── Ferretería / Comercio ─────────────────────────────────
  categorias_ferreteria: [
    'Herramientas manuales', 'Herramientas eléctricas', 'Tornillería y fijaciones',
    'Pinturas y recubrimientos', 'Material eléctrico', 'Fontanería y saneamiento',
    'Construcción y obras', 'Jardín y exterior', 'Seguridad laboral',
    'Madera y tableros', 'Cerrajería', 'Soldadura', 'Adhesivos y sellantes',
  ],
  productos_ferreteria: [
    'Taladro percutor 800W', 'Amoladora angular 125mm', 'Sierra circular 1400W',
    'Destornillador eléctrico 30W', 'Llave combinada 12mm', 'Alicate universal 8"',
    'Nivel láser autonivelante', 'Metro plegable 3m', 'Cinta métrica 5m',
    'Martillo de carpintero 500g', 'Tornillos M6×50 caja 100u', 'Broca HSS 8mm',
    'Clavos galvanizados 3" (1kg)', 'Cinta americana 48mm', 'Pintura esmalte blanco 4L',
    'Cemento rápido 5kg', 'Arena fina saco 25kg', 'Tubo PVC DN25 3m',
    'Grifo de cocina cromado', 'Manguera 20m con pistola', 'Guantes de cuero talla L',
    'Casco seguridad amarillo', 'Mascarilla FFP2 (5u)', 'Lija al agua G80 (5u)',
    'Cola blanca 1kg', 'Silicona blanca 280ml', 'Llave inglesa ajustable',
  ],
  unidades_medida: ['ud', 'kg', 'L', 'm', 'm²', 'm³', 'caja', 'rollo', 'par', 'set', 'pack'],

  // ── Vuelos / Aeropuertos ──────────────────────────────────
  aeropuertos: [
    { ciudad: 'Madrid',          pais: 'España',      aeropuerto: 'Adolfo Suárez Madrid-Barajas',     codigo_iata: 'MAD' },
    { ciudad: 'Barcelona',       pais: 'España',      aeropuerto: 'Josep Tarradellas El Prat',         codigo_iata: 'BCN' },
    { ciudad: 'Ciudad de México',pais: 'México',      aeropuerto: 'Benito Juárez Internacional',       codigo_iata: 'MEX' },
    { ciudad: 'Bogotá',          pais: 'Colombia',    aeropuerto: 'El Dorado Internacional',           codigo_iata: 'BOG' },
    { ciudad: 'Lima',            pais: 'Perú',        aeropuerto: 'Jorge Chávez',                      codigo_iata: 'LIM' },
    { ciudad: 'Buenos Aires',    pais: 'Argentina',   aeropuerto: 'Ezeiza Ministro Pistarini',         codigo_iata: 'EZE' },
    { ciudad: 'Miami',           pais: 'EE.UU.',      aeropuerto: 'Miami International',               codigo_iata: 'MIA' },
    { ciudad: 'Nueva York',      pais: 'EE.UU.',      aeropuerto: 'John F. Kennedy',                   codigo_iata: 'JFK' },
    { ciudad: 'São Paulo',       pais: 'Brasil',      aeropuerto: 'Governador André Guarulhos',        codigo_iata: 'GRU' },
    { ciudad: 'Santiago',        pais: 'Chile',       aeropuerto: 'Arturo Merino Benítez',             codigo_iata: 'SCL' },
    { ciudad: 'Quito',           pais: 'Ecuador',     aeropuerto: 'Mariscal Sucre',                    codigo_iata: 'UIO' },
    { ciudad: 'Medellín',        pais: 'Colombia',    aeropuerto: 'José María Córdova',                codigo_iata: 'MDE' },
    { ciudad: 'Cancún',          pais: 'México',      aeropuerto: 'Cancún Internacional',              codigo_iata: 'CUN' },
    { ciudad: 'Panamá',          pais: 'Panamá',      aeropuerto: 'Tocumen Internacional',             codigo_iata: 'PTY' },
    { ciudad: 'Caracas',         pais: 'Venezuela',   aeropuerto: 'Simón Bolívar',                     codigo_iata: 'CCS' },
    { ciudad: 'Montevideo',      pais: 'Uruguay',     aeropuerto: 'Carrasco',                          codigo_iata: 'MVD' },
    { ciudad: 'Asunción',        pais: 'Paraguay',    aeropuerto: 'Silvio Pettirossi',                 codigo_iata: 'ASU' },
    { ciudad: 'La Paz',          pais: 'Bolivia',     aeropuerto: 'El Alto',                           codigo_iata: 'LPB' },
  ],
  aerolineas: [
    'Iberia', 'Aeromexico', 'LATAM Airlines', 'Avianca', 'Copa Airlines',
    'Volaris', 'JetSmart', 'Sky Airline', 'Wingo', 'Viva Air',
  ],
  clases_vuelo:  ['Económica', 'Económica Plus', 'Business', 'Primera Clase'],
  estados_vuelo: ['A tiempo', 'Retrasado', 'Cancelado', 'En vuelo', 'Aterrizado', 'Embarcando'],
  tipos_equipaje: [
    'Sin equipaje', 'Solo equipaje de mano', 'Facturado 23kg',
    'Facturado 32kg', 'Pieza extra 23kg',
  ],
  estados_boleto: ['Emitido', 'Check-in realizado', 'Embarcado', 'Cancelado', 'Utilizado'],

  // ── Restaurante ───────────────────────────────────────────
  categorias_restaurante: [
    'Entradas y aperitivos', 'Sopas y cremas', 'Ensaladas', 'Carnes y parrillas',
    'Aves y pollo', 'Mariscos y pescados', 'Pastas y arroces', 'Pizzas',
    'Platos vegetarianos', 'Postres', 'Bebidas calientes', 'Bebidas frías',
    'Cócteles y licores', 'Menú del día',
  ],
  platos: [
    'Ceviche mixto', 'Causa rellena de atún', 'Sopa de mariscos', 'Caldo de gallina',
    'Ensalada César con pollo', 'Lomo saltado', 'Ají de gallina', 'Seco de cordero',
    'Tiradito de corvina', 'Trucha a la plancha', 'Salmón al horno con alcaparras',
    'Pasta carbonara', 'Risotto de hongos', 'Filete de res al vino tinto',
    'Pollo a la brasa 1/2', 'Pizza margarita', 'Pizza pepperoni', 'Costillas BBQ',
    'Brownie con helado', 'Cheesecake de frutos rojos', 'Tiramisú', 'Flan casero',
    'Tacos de pastor (3u)', 'Burrito de res', 'Paella valenciana',
  ],
  zonas_restaurante: ['Interior', 'Terraza', 'Privado', 'Barra', 'VIP', 'Jardín'],
  estados_mesa: ['Libre', 'Ocupada', 'Reservada', 'En limpieza'],

  // ── Escuela / Universidad ─────────────────────────────────
  materias: [
    'Matemáticas I', 'Cálculo Diferencial', 'Álgebra Lineal', 'Estadística Descriptiva',
    'Física General', 'Química Orgánica', 'Biología Celular', 'Historia Universal',
    'Lengua y Literatura', 'Inglés Técnico B1', 'Educación Física',
    'Fundamentos de Programación', 'Bases de Datos', 'Redes de Computadoras',
    'Contabilidad General', 'Administración de Empresas', 'Derecho Civil',
    'Filosofía', 'Ética Profesional', 'Marketing Digital', 'Economía General',
  ],
  tipos_nota: ['Examen parcial', 'Examen final', 'Trabajo práctico', 'Exposición', 'Quiz', 'Laboratorio'],
  estados_matricula: ['Activa', 'Retirada', 'Aprobada', 'Reprobada', 'En proceso'],
  turnos: ['Mañana', 'Tarde', 'Noche', 'En línea'],

  // ── Empresa ───────────────────────────────────────────────
  cargos: [
    'Gerente General', 'Director Financiero', 'Director Comercial', 'Director de RRHH',
    'Jefe de Ventas', 'Jefe de Contabilidad', 'Analista de Sistemas',
    'Desarrollador Senior', 'Desarrollador Junior', 'Diseñador UX/UI',
    'Coordinador de Proyectos', 'Auditora Senior', 'Ejecutivo de Cuentas',
    'Asistente Administrativo', 'Técnico de Soporte', 'Especialista en Marketing',
    'Analista Financiero', 'Gerente de Operaciones', 'Ingeniero de Calidad',
  ],
  departamentos: [
    'Tecnología e Innovación', 'Finanzas y Contabilidad', 'Recursos Humanos',
    'Marketing y Comunicación', 'Ventas y Comercial', 'Operaciones',
    'Logística', 'Administración', 'Legal y Cumplimiento', 'Producción', 'I+D',
  ],
  estados_proyecto: ['En planificación', 'En desarrollo', 'En revisión', 'Completado', 'Pausado', 'Cancelado'],

  // ── Prisión ────────────────────────────────────────────────
  delitos: [
    'Robo con violencia', 'Tráfico de drogas', 'Homicidio', 'Fraude bancario',
    'Estafa', 'Secuestro', 'Extorsión', 'Robo de vehículo', 'Asociación ilícita',
    'Posesión de armas', 'Lavado de activos', 'Tráfico de personas',
    'Falsificación de documentos', 'Corrupción', 'Agresión grave',
  ],
  categorias_delito: ['Delito menor', 'Delito grave', 'Crimen organizado', 'Delito económico', 'Delito violento'],
  rangos_guardia: ['Guardia raso', 'Suboficial', 'Oficial', 'Teniente', 'Capitán', 'Mayor', 'Jefe de seguridad'],
  turnos_guardia: ['Mañana 06:00-14:00', 'Tarde 14:00-22:00', 'Noche 22:00-06:00', 'Rotativo'],
  tipos_bloque: ['Mínima seguridad', 'Media seguridad', 'Máxima seguridad', 'Aislamiento', 'Módulo femenino', 'Módulo juvenil'],
  tipos_celda: ['Individual', 'Doble', 'Múltiple', 'Custodia especial'],
  tipos_incidente: ['Pelea entre internos', 'Intento de fuga', 'Agresión a guardia', 'Autolesión', 'Incendio', 'Posesión de objetos prohibidos', 'Motín', 'Tráfico interno'],
  gravedades_incidente: ['Leve', 'Moderada', 'Grave', 'Crítica'],
  tipos_sancion: ['Amonestación', 'Restricción de visitas', 'Aislamiento temporal', 'Traslado de celda', 'Traslado de módulo'],
  estados_prisionero: ['Activo', 'Libertad condicional', 'Libertad definitiva', 'Traslado', 'Fallecido'],
  estados_celda: ['Ocupada', 'Libre', 'En mantenimiento', 'Reservada'],
  parentescos: ['Padre/Madre', 'Cónyuge', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Abogado/a', 'Otro'],

  // ── Minería ────────────────────────────────────────────────
  minerales: ['Cobre', 'Oro', 'Plata', 'Hierro', 'Zinc', 'Plomo', 'Molibdeno', 'Litio', 'Cobalto', 'Níquel', 'Estaño', 'Tungsteno', 'Titanio', 'Manganeso'],
  simbolos_mineral: ['Cu', 'Au', 'Ag', 'Fe', 'Zn', 'Pb', 'Mo', 'Li', 'Co', 'Ni', 'Sn', 'W', 'Ti', 'Mn'],
  tipos_extraccion: ['Subterránea', 'A cielo abierto', 'Mixta', 'Por lixiviación', 'Aluvial'],
  cargos_mineria: ['Operador de maquinaria', 'Ingeniero de minas', 'Técnico de explosivos', 'Jefe de turno', 'Supervisor de seguridad', 'Geólogo', 'Metalurgista', 'Mecánico industrial', 'Electricista industrial', 'Capataz'],
  tipos_turno_mineria: ['Diurno', 'Nocturno', 'Rotativo 12h', 'Continuo'],
  calidades_mineral: ['A', 'B', 'C', 'Premium', 'Estándar', 'Bajo grado'],
  tipos_maquinaria: ['Excavadora', 'Cargador frontal', 'Camión de acarreo', 'Perforadora', 'Trituradora', 'Cintas transportadoras', 'Bomba de agua', 'Compresor', 'Grúa torre'],
  estados_maquinaria: ['Operativa', 'En mantenimiento', 'Fuera de servicio', 'En reparación'],
  tipos_mantenimiento: ['Preventivo', 'Correctivo', 'Predictivo', 'Emergencia'],

  // ── Banco / Finanzas ───────────────────────────────────────
  tipos_cuenta: ['Cuenta corriente', 'Cuenta de ahorro', 'Cuenta de inversión', 'Cuenta empresarial', 'Cuenta nómina'],
  tipos_transaccion: ['Depósito', 'Retiro', 'Transferencia entrante', 'Transferencia saliente', 'Pago de servicio', 'Pago de tarjeta', 'Débito automático', 'Cargo por servicio'],
  tipos_tarjeta: ['Débito Visa', 'Débito Mastercard', 'Crédito Visa', 'Crédito Mastercard', 'Crédito Amex', 'Prepago'],
  tipos_prestamo: ['Préstamo personal', 'Préstamo hipotecario', 'Préstamo vehicular', 'Préstamo estudiantil', 'Préstamo empresarial', 'Línea de crédito'],
  estados_cuenta: ['Activa', 'Bloqueada', 'Cerrada', 'Suspendida'],
  estados_prestamo: ['Vigente', 'Al día', 'En mora', 'Cancelado', 'En reestructuración'],
  tipos_cliente_banco: ['Natural', 'Jurídico', 'Premium', 'Pyme'],

  // ── Logística / Transporte ─────────────────────────────────
  tipos_vehiculo: ['Furgoneta', 'Camión ligero', 'Camión pesado', 'Motocicleta', 'Bicicleta eléctrica', 'Minibús de carga'],
  estados_envio: ['Pendiente', 'Recogido', 'En tránsito', 'En depósito', 'En camino al destino', 'Entregado', 'Devuelto', 'Perdido'],
  tipos_ruta: ['Urbana', 'Interurbana', 'Internacional', 'Zona industrial', 'Zona residencial'],
  estados_pedido_logistica: ['Recibido', 'Preparando', 'Listo para envío', 'En ruta', 'Entregado', 'Devolución'],
  codigos_seguimiento_prefijos: ['LOG', 'ENV', 'PKG', 'SHP', 'TRK'],

  // ── Turismo ────────────────────────────────────────────────
  tipos_habitacion: ['Individual', 'Doble', 'Suite', 'Suite ejecutiva', 'Familiar', 'Ático', 'Cabaña'],
  categorias_destino: ['Playa', 'Montaña', 'Ciudad cultural', 'Aventura', 'Ecoturismo', 'Gastronomía', 'Crucero'],
  estados_reserva: ['Confirmada', 'Pendiente de pago', 'Cancelada', 'Check-in realizado', 'Check-out realizado'],
  metodos_pago: ['Tarjeta de crédito', 'Transferencia bancaria', 'Efectivo', 'PayPal', 'Criptomoneda'],

  // ── Fábrica ────────────────────────────────────────────────
  areas_fabrica: ['Producción', 'Ensamble', 'Control de calidad', 'Almacén', 'Mantenimiento', 'Logística interna', 'Fundición', 'Pintura', 'Empaque'],
  turnos_fabrica: ['Mañana 06:00-14:00', 'Tarde 14:00-22:00', 'Noche 22:00-06:00'],
  estados_orden: ['Planificada', 'En producción', 'En control de calidad', 'Completada', 'Suspendida', 'Cancelada'],
  cargos_fabrica: ['Operario', 'Técnico de mantenimiento', 'Supervisor de planta', 'Ingeniero de producción', 'Jefe de turno', 'Inspector de calidad', 'Mecánico', 'Electricista'],
};

// -----------------------------------------------
// Ayudas internas
// -----------------------------------------------

/** Selecciona un elemento de un array de forma aleatoria. */
const azar = (arr) => faker.helpers.arrayElement(arr);

/**
 * Retorna un generador que selecciona el elemento del array
 * de forma determinista por índice (coherencia entre columnas de la misma fila).
 */
const porIndice = (arr) => (i) => arr[i % arr.length];

/** Retorna un generador de elemento aleatorio (ignora el índice). */
const aleatorio = (fn) => () => fn();

// -----------------------------------------------
// Función principal pública
// -----------------------------------------------

/**
 * Devuelve un generador semántico específico para la combinación (tabla, columna),
 * o null si no hay un generador específico para ese par.
 *
 * El generador devuelto tiene la firma: (indice: number) => any
 * Algunos generadores usan el índice para ser coherentes entre columnas de la misma fila
 * (ej: ciudad/aeropuerto/iata para la misma fila de la tabla destinos).
 * La mayoría ignora el índice y devuelve un valor aleatorio.
 *
 * @param {string} nombreTabla
 * @param {string} nombreColumna
 * @returns {((indice: number) => any) | null}
 */
function obtenerGeneradorSemantico(nombreTabla, nombreColumna) {
  const t = nombreTabla.toLowerCase();
  const c = nombreColumna.toLowerCase();

  // ── HOSPITAL / SALUD ─────────────────────────────────────────────────

  // Tabla: medicamentos / farmacos
  if (/medicamento|farmaco/.test(t)) {
    if (/^nombre$|^nombre_medicamento$/.test(c)) return porIndice(CAT.medicamentos);
    if (/principio_activo|principio/.test(c))   return aleatorio(() => azar(CAT.principios_activos));
    if (/laboratorio|fabricante/.test(c))        return aleatorio(() => azar(CAT.laboratorios));
    if (/presentacion|forma_farmac/.test(c))     return aleatorio(() => azar(CAT.presentaciones_medicamento));
    if (/descripcion/.test(c))
      return aleatorio(() => `${azar(CAT.principios_activos)} — uso ${azar(['analgésico', 'antiinflamatorio', 'antibiótico', 'antihipertensivo', 'antidiabético', 'broncodilatador'])}`);
  }

  // Tabla: especialidades
  if (/^especialidad/.test(t)) {
    if (/^nombre$|^nombre_especialidad$/.test(c)) return porIndice(CAT.especialidades_medicas);
    if (/descripcion/.test(c))
      return aleatorio(() => `Área médica especializada en ${azar(CAT.especialidades_medicas).toLowerCase()}`);
  }

  // Tabla: salas / areas
  if (/^sala|^area_hospital/.test(t) || t === 'salas') {
    if (/^nombre$|^nombre_sala$/.test(c)) return porIndice(CAT.salas_hospital);
    if (/^area$/.test(c))                 return aleatorio(() => azar(CAT.areas_hospital));
    if (/piso|floor/.test(c))             return aleatorio(() => faker.number.int({ min: 1, max: 8 }));
    if (/capacidad|camas/.test(c))        return aleatorio(() => faker.number.int({ min: 4, max: 30 }));
  }

  // Tabla: enfermedades / patologias / diagnosticos
  if (/^enfermedad|^patologia/.test(t)) {
    if (/^nombre$|^nombre_enfermedad$/.test(c)) return porIndice(CAT.enfermedades);
    if (/categoria|tipo/.test(c))               return aleatorio(() => azar(CAT.categorias_enfermedad));
    if (/descripcion/.test(c))                  return aleatorio(() => azar(CAT.enfermedades));
  }

  // Tabla: tratamientos
  if (/^tratamiento/.test(t)) {
    if (/^tipo$|^tipo_tratamiento$/.test(c)) return aleatorio(() => azar(CAT.tipos_tratamiento));
    if (/^nombre$/.test(c))                  return aleatorio(() => azar(CAT.tipos_tratamiento));
    if (/descripcion|indicacion|detalle/.test(c))
      return aleatorio(() => `${azar(CAT.tipos_tratamiento)} indicado por evaluación clínica`);
    if (/duracion/.test(c))  return aleatorio(() => faker.number.int({ min: 3, max: 90 }));
  }

  // Tabla: recetas
  if (/^receta/.test(t)) {
    if (/^dosis$/.test(c))      return aleatorio(() => azar(CAT.dosis_medicas));
    if (/frecuencia/.test(c))   return aleatorio(() => azar(CAT.frecuencias_medicas));
    if (/duracion/.test(c))     return aleatorio(() => azar(CAT.duraciones_tratamiento));
    if (/indicacion|nota/.test(c))
      return aleatorio(() => `Tomar con abundante agua. ${faker.helpers.arrayElement(['Con alimentos.', 'En ayunas.', 'Antes de dormir.'])}`);
  }

  // Tabla: citas / consultas
  if (/^cita|^consulta/.test(t)) {
    if (/^motivo$|razon/.test(c))   return aleatorio(() => azar(CAT.motivos_cita));
    if (/^diagnostico$/.test(c))    return aleatorio(() => azar(CAT.enfermedades));
    if (/^estado$/.test(c))
      return aleatorio(() => azar(['Pendiente', 'Confirmada', 'Realizada', 'Cancelada', 'No asistió']));
  }

  // Columnas de salud transversales (cualquier tabla)
  if (/^especialidad$/.test(c) && /doctor|medico/.test(t))
    return aleatorio(() => azar(CAT.especialidades_medicas));
  if (/^diagnostico$/.test(c))
    return aleatorio(() => azar(CAT.enfermedades));
  if (/matricula/.test(c) && /doctor|medico/.test(t))
    return aleatorio(() => 'MP-' + faker.string.numeric(6));
  if (/grupo_sanguineo|tipo_sangre/.test(c))
    return aleatorio(() => azar(CAT.grupos_sanguineos));

  // ── FERRETERÍA / COMERCIO ────────────────────────────────────────────

  // Nombre de producto en tabla productos
  if (c === 'nombre_producto') return aleatorio(() => azar(CAT.productos_ferreteria));

  // Columna "nombre" en tabla categorias → categorías de ferretería/tienda
  if (/^categoria/.test(t) && /^nombre$/.test(c))
    return aleatorio(() => azar(CAT.categorias_ferreteria));

  // Unidad de medida
  if (/^unidad$|unidad_medida/.test(c))
    return aleatorio(() => azar(CAT.unidades_medida));

  // ── VUELOS / AEROPUERTOS ─────────────────────────────────────────────

  // Tabla: destinos / aeropuertos — coherencia por fila usando porIndice
  if (/^destino|^aeropuerto/.test(t) || t === 'destinos') {
    if (/codigo_iata|iata/.test(c)) return (i) => CAT.aeropuertos[i % CAT.aeropuertos.length].codigo_iata;
    if (/^aeropuerto$/.test(c))     return (i) => CAT.aeropuertos[i % CAT.aeropuertos.length].aeropuerto;
    if (/^ciudad$/.test(c))         return (i) => CAT.aeropuertos[i % CAT.aeropuertos.length].ciudad;
    if (/^pais$/.test(c))           return (i) => CAT.aeropuertos[i % CAT.aeropuertos.length].pais;
  }

  // Tabla: vuelos
  if (/^vuelo$|^vuelos$/.test(t)) {
    if (/numero_vuelo|num_vuelo|codigo_vuelo/.test(c))
      return aleatorio(() => azar(['IB', 'AM', 'LA', 'AV', 'CM', 'Y4', 'VB', 'SK']).toUpperCase() + faker.string.numeric(4));
    if (/aerolinea|airline/.test(c))
      return aleatorio(() => azar(CAT.aerolineas));
    if (/^estado$/.test(c))
      return aleatorio(() => azar(CAT.estados_vuelo));
    if (/duracion|tiempo_vuelo/.test(c))
      return aleatorio(() => faker.number.int({ min: 60, max: 720 })); // minutos
  }

  // Tabla: boletos / tickets
  if (/boleto|ticket/.test(t)) {
    if (/^clase$/.test(c))
      return aleatorio(() => azar(CAT.clases_vuelo));
    if (/^asiento$|seat/.test(c))
      return aleatorio(() => String.fromCharCode(65 + faker.number.int({ min: 0, max: 5 })) + faker.number.int({ min: 1, max: 40 }));
    if (/^estado$/.test(c))
      return aleatorio(() => azar(CAT.estados_boleto));
  }

  // Tabla: equipajes
  if (/equipaje|bagaje/.test(t)) {
    if (/^tipo$/.test(c))
      return aleatorio(() => azar(CAT.tipos_equipaje));
    if (/^peso$/.test(c))
      return aleatorio(() => parseFloat(faker.number.float({ min: 5, max: 32, fractionDigits: 1 })));
    if (/^estado$/.test(c))
      return aleatorio(() => azar(['Facturado', 'En tránsito', 'Entregado', 'Extraviado', 'Dañado']));
  }

  // ── RESTAURANTE ───────────────────────────────────────────────────────

  // Tabla: platos / menu
  if (/^plato|^menu/.test(t)) {
    if (/^nombre$|^nombre_plato$/.test(c))
      return aleatorio(() => azar(CAT.platos));
  }

  // Tabla: mesas
  if (/^mesa/.test(t)) {
    if (/^estado$/.test(c))
      return aleatorio(() => azar(CAT.estados_mesa));
    if (/^capacidad$/.test(c))
      return aleatorio(() => azar([2, 4, 4, 6, 6, 8, 10]));
    if (/numero_mesa|num_mesa/.test(c))
      return aleatorio(() => faker.number.int({ min: 1, max: 30 }));
    if (/zona|sector/.test(c))
      return aleatorio(() => azar(CAT.zonas_restaurante));
  }

  // ── ESCUELA / UNIVERSIDAD ─────────────────────────────────────────────

  // Tabla: cursos / materias / asignaturas
  if (/^curso|^materia|^asignatura/.test(t)) {
    if (/^nombre$|^nombre_curso$|^nombre_materia$/.test(c))
      return porIndice(CAT.materias);
    if (/credito|credit/.test(c))
      return aleatorio(() => faker.number.int({ min: 2, max: 6 }));
    if (/descripcion/.test(c))
      return aleatorio(() => `Asignatura de ${faker.helpers.arrayElement(['formación básica', 'especialización', 'formación profesional'])} — ${azar(CAT.materias)}`);
  }

  // Tabla: notas / calificaciones
  if (/^nota|^calificacion/.test(t)) {
    if (/^nota$|^calificacion$|^puntaje$|^valor$/.test(c))
      return aleatorio(() => parseFloat(faker.number.float({ min: 5, max: 20, fractionDigits: 1 })));
    if (/^tipo$/.test(c))
      return aleatorio(() => azar(CAT.tipos_nota));
    if (/observacion|comentario/.test(c))
      return aleatorio(() => azar(['Excelente rendimiento', 'Aprobado con mérito', 'Necesita mejorar', 'Reprobado', 'Pendiente de revisión']));
  }

  // Tabla: matriculas / inscripciones
  if (/^matricula|^inscripcion/.test(t)) {
    if (/^estado$/.test(c))
      return aleatorio(() => azar(CAT.estados_matricula));
    if (/^turno$|^horario$/.test(c))
      return aleatorio(() => azar(CAT.turnos));
  }

  // Columna especialidad en profesores
  if (/^especialidad$/.test(c) && /profesor|docente/.test(t))
    return aleatorio(() => azar(CAT.materias));

  // ── EMPRESA ───────────────────────────────────────────────────────────

  // Tabla: empleados / trabajadores
  if (/^empleado|^trabajador|^personal/.test(t)) {
    if (/^cargo$|^puesto$|^rol$|^posicion$/.test(c))
      return aleatorio(() => azar(CAT.cargos));
  }

  // Tabla: departamentos / areas (empresa)
  if (/^departamento/.test(t)) {
    if (/^nombre$|^nombre_departamento$/.test(c))
      return porIndice(CAT.departamentos);
  }

  // Tabla: proyectos
  if (/^proyecto/.test(t)) {
    if (/^estado$/.test(c))
      return aleatorio(() => azar(CAT.estados_proyecto));
    if (/^nombre$|^nombre_proyecto$/.test(c))
      return aleatorio(() =>
        `Proyecto ${azar(['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Nexus', 'Phoenix', 'Titan'])} ` +
        faker.string.alpha(1).toUpperCase() + faker.string.numeric(2)
      );
  }

  // ── COLUMNAS TRANSVERSALES (estado contextual) ────────────────────────

  if (/^estado$/.test(c)) {
    if (/venta|pedido|orden|compra/.test(t))
      return aleatorio(() => azar(['Pendiente', 'Procesando', 'Completada', 'Cancelada', 'Devuelta']));
    if (/empleado|trabajador/.test(t))
      return aleatorio(() => azar(['Activo', 'Inactivo', 'Suspendido', 'De vacaciones']));
    if (/vuelo/.test(t))
      return aleatorio(() => azar(CAT.estados_vuelo));
    if (/matricula|inscripcion/.test(t))
      return aleatorio(() => azar(CAT.estados_matricula));
    if (/proyecto/.test(t))
      return aleatorio(() => azar(CAT.estados_proyecto));
    if (/producto|articulo/.test(t))
      return aleatorio(() => azar(['Disponible', 'Sin stock', 'Descontinuado', 'En pedido']));
  }

  if (/^cargo$/.test(c))       return aleatorio(() => azar(CAT.cargos));
  if (/^departamento$/.test(c)) return aleatorio(() => azar(CAT.departamentos));

  // ── PRISIÓN ───────────────────────────────────────────────────────────

  if (/^prisionero|^recluso|^interno|^penado/.test(t)) {
    if (/^delito$/.test(c))               return aleatorio(() => azar(CAT.delitos));
    if (/categoria_delito|tipo_delito/.test(c)) return aleatorio(() => azar(CAT.categorias_delito));
    if (/^estado$/.test(c))               return aleatorio(() => azar(CAT.estados_prisionero));
    if (/condena|pena|sentencia/.test(c)) return aleatorio(() => faker.number.int({ min: 1, max: 30 }) + ' años');
  }

  if (/^guardia/.test(t)) {
    if (/^rango$/.test(c))  return aleatorio(() => azar(CAT.rangos_guardia));
    if (/^turno$/.test(c))  return aleatorio(() => azar(CAT.turnos_guardia));
  }

  if (/^bloque/.test(t)) {
    if (/^nombre$/.test(c)) return aleatorio(() => `Bloque ${faker.string.alpha(1).toUpperCase()}`);
    if (/^tipo$/.test(c))   return aleatorio(() => azar(CAT.tipos_bloque));
    if (/capacidad/.test(c)) return aleatorio(() => faker.number.int({ min: 20, max: 80 }));
    if (/^estado$/.test(c)) return aleatorio(() => azar(['Operativo', 'En renovación', 'Cerrado']));
  }

  if (/^celda/.test(t)) {
    if (/^numero$|^num_celda$/.test(c)) return aleatorio(() => faker.string.alpha(1).toUpperCase() + '-' + faker.number.int({ min: 1, max: 50 }));
    if (/^tipo$/.test(c))   return aleatorio(() => azar(CAT.tipos_celda));
    if (/^estado$/.test(c)) return aleatorio(() => azar(CAT.estados_celda));
    if (/capacidad/.test(c)) return aleatorio(() => faker.number.int({ min: 1, max: 4 }));
  }

  if (/^incidente/.test(t)) {
    if (/^tipo$/.test(c))      return aleatorio(() => azar(CAT.tipos_incidente));
    if (/gravedad/.test(c))    return aleatorio(() => azar(CAT.gravedades_incidente));
    if (/descripcion/.test(c)) return aleatorio(() => `${azar(CAT.tipos_incidente)} — ${faker.lorem.sentence(6)}`);
    if (/^estado$/.test(c))    return aleatorio(() => azar(['Reportado', 'Investigado', 'Resuelto', 'Cerrado']));
  }

  if (/^sancion/.test(t)) {
    if (/^tipo$/.test(c))   return aleatorio(() => azar(CAT.tipos_sancion));
    if (/^motivo$/.test(c)) return aleatorio(() => azar(CAT.tipos_incidente));
    if (/^estado$/.test(c)) return aleatorio(() => azar(['Vigente', 'Cumplida', 'Apelada', 'Anulada']));
  }

  if (/^visita/.test(t)) {
    if (/visitante_nombre|nombre_visitante/.test(c)) return aleatorio(() => faker.person.fullName());
    if (/parentesco/.test(c))  return aleatorio(() => azar(CAT.parentescos));
    if (/duracion/.test(c))    return aleatorio(() => faker.number.int({ min: 15, max: 120 }));
    if (/^estado$/.test(c))    return aleatorio(() => azar(['Aprobada', 'Realizada', 'Cancelada', 'Denegada']));
  }

  // ── MINERÍA ───────────────────────────────────────────────────────────

  if (/^mina/.test(t)) {
    if (/^nombre$|^nombre_mina$/.test(c)) return aleatorio(() => `Mina ${azar(['El Roble', 'La Esperanza', 'San Cristóbal', 'Las Pampas', 'El Teniente', 'La Escondida', 'Cerro Verde', 'Don Luis'])}`);
    if (/mineral_principal/.test(c))      return aleatorio(() => azar(CAT.minerales));
    if (/tipo_extraccion|metodo/.test(c)) return aleatorio(() => azar(CAT.tipos_extraccion));
    if (/^estado$/.test(c))               return aleatorio(() => azar(['Activa', 'En exploración', 'En pausa', 'Agotada', 'En cierre']));
  }

  if (/^mineral/.test(t)) {
    if (/^nombre$|^nombre_mineral$/.test(c)) return porIndice(CAT.minerales);
    if (/^simbolo$/.test(c))                 return porIndice(CAT.simbolos_mineral);
    if (/pureza/.test(c))                    return aleatorio(() => parseFloat(faker.number.float({ min: 60, max: 99, fractionDigits: 1 })));
    if (/precio_tonelada|precio/.test(c))    return aleatorio(() => faker.number.int({ min: 500, max: 80000 }));
  }

  if (/^produccion/.test(t) && !/detalle/.test(t)) {
    if (/cantidad_toneladas|cantidad|volumen/.test(c))
      return aleatorio(() => parseFloat(faker.number.float({ min: 10, max: 5000, fractionDigits: 1 })));
    if (/^pureza$/.test(c))
      return aleatorio(() => parseFloat(faker.number.float({ min: 60, max: 99, fractionDigits: 1 })));
    if (/^calidad$/.test(c)) return aleatorio(() => azar(CAT.calidades_mineral));
  }

  // Empleados en contexto de minería
  if (/^empleado/.test(t) && /^cargo$|^especialidad$|^puesto$/.test(c)) {
    return aleatorio(() => azar(CAT.cargos_mineria));
  }

  // Turnos en minería
  if (/^turno/.test(t) && t !== 'turnos_guardia') {
    if (/^tipo$/.test(c)) return aleatorio(() => azar(CAT.tipos_turno_mineria));
  }

  // Maquinaria (fabrica + mineria)
  if (/^maquinaria|^maquina/.test(t)) {
    if (/^nombre$|^tipo$/.test(c)) return aleatorio(() => azar(CAT.tipos_maquinaria));
    if (/^estado$/.test(c))        return aleatorio(() => azar(CAT.estados_maquinaria));
  }

  if (/^mantenimiento/.test(t)) {
    if (/^tipo$/.test(c)) return aleatorio(() => azar(CAT.tipos_mantenimiento));
  }

  // ── BANCO / FINANZAS ──────────────────────────────────────────────────

  if (/^cuenta/.test(t)) {
    if (/tipo_cuenta|^tipo$/.test(c))    return aleatorio(() => azar(CAT.tipos_cuenta));
    if (/^estado$/.test(c))              return aleatorio(() => azar(CAT.estados_cuenta));
    if (/^saldo$/.test(c))               return aleatorio(() => parseFloat(faker.number.float({ min: 0, max: 50000, fractionDigits: 2 })));
    if (/numero_cuenta/.test(c))         return aleatorio(() => faker.string.numeric(12));
  }

  if (/^transaccion|^movimiento/.test(t)) {
    if (/^tipo$/.test(c))      return aleatorio(() => azar(CAT.tipos_transaccion));
    if (/^monto$|^importe$/.test(c)) return aleatorio(() => parseFloat(faker.number.float({ min: 5, max: 10000, fractionDigits: 2 })));
    if (/descripcion/.test(c)) return aleatorio(() => azar(CAT.tipos_transaccion));
    if (/^estado$/.test(c))    return aleatorio(() => azar(['Completada', 'Pendiente', 'Rechazada', 'Reversada']));
  }

  if (/^tarjeta/.test(t)) {
    if (/^tipo$/.test(c))           return aleatorio(() => azar(CAT.tipos_tarjeta));
    if (/^estado$/.test(c))         return aleatorio(() => azar(['Activa', 'Bloqueada', 'Vencida', 'Cancelada']));
    if (/numero_tarjeta/.test(c))   return aleatorio(() => '**** **** **** ' + faker.string.numeric(4));
    if (/limite/.test(c))           return aleatorio(() => faker.number.int({ min: 500, max: 20000 }));
  }

  if (/^prestamo/.test(t)) {
    if (/^tipo$/.test(c))        return aleatorio(() => azar(CAT.tipos_prestamo));
    if (/^estado$/.test(c))      return aleatorio(() => azar(CAT.estados_prestamo));
    if (/tasa_interes/.test(c))  return aleatorio(() => parseFloat(faker.number.float({ min: 5, max: 30, fractionDigits: 2 })));
    if (/plazo_meses/.test(c))   return aleatorio(() => faker.helpers.arrayElement([6, 12, 24, 36, 48, 60, 120]));
    if (/cuota_mensual/.test(c)) return aleatorio(() => parseFloat(faker.number.float({ min: 50, max: 2000, fractionDigits: 2 })));
  }

  // Clientes de banco
  if (/^cliente/.test(t) && /tipo_cliente/.test(c))
    return aleatorio(() => azar(CAT.tipos_cliente_banco));

  // ── LOGÍSTICA ─────────────────────────────────────────────────────────

  if (/^repartidor|^conductor|^mensajero/.test(t)) {
    if (/^vehiculo$/.test(c)) return aleatorio(() => azar(CAT.tipos_vehiculo));
    if (/^zona$/.test(c))     return aleatorio(() => `Zona ${faker.string.alpha(1).toUpperCase()}${faker.number.int({ min: 1, max: 9 })}`);
    if (/^estado$/.test(c))   return aleatorio(() => azar(['Activo', 'En ruta', 'Disponible', 'Inactivo']));
  }

  if (/^envio|^despacho|^paquete/.test(t)) {
    if (/^estado$/.test(c))               return aleatorio(() => azar(CAT.estados_envio));
    if (/codigo_seguimiento|tracking/.test(c))
      return aleatorio(() => azar(CAT.codigos_seguimiento_prefijos) + faker.string.numeric(10));
  }

  if (/^ruta/.test(t)) {
    if (/^tipo$/.test(c))    return aleatorio(() => azar(CAT.tipos_ruta));
    if (/distancia/.test(c)) return aleatorio(() => faker.number.int({ min: 5, max: 800 }));
    if (/tiempo/.test(c))    return aleatorio(() => parseFloat(faker.number.float({ min: 0.5, max: 24, fractionDigits: 1 })));
  }

  if (/^pedido/.test(t)) {
    if (/^estado$/.test(c)) return aleatorio(() => azar(CAT.estados_pedido_logistica));
  }

  if (/^vehiculo/.test(t)) {
    if (/^tipo$/.test(c))     return aleatorio(() => azar(CAT.tipos_vehiculo));
    if (/^estado$/.test(c))   return aleatorio(() => azar(['Disponible', 'En ruta', 'En mantenimiento', 'Fuera de servicio']));
    if (/capacidad/.test(c))  return aleatorio(() => faker.number.int({ min: 100, max: 5000 }));
    if (/^placa$/.test(c))    return aleatorio(() => faker.string.alpha(3).toUpperCase() + '-' + faker.string.numeric(4));
  }

  // ── TURISMO ───────────────────────────────────────────────────────────

  if (/^hotel/.test(t)) {
    if (/categoria_estrellas|estrellas/.test(c)) return aleatorio(() => faker.number.int({ min: 1, max: 5 }));
    if (/precio_noche/.test(c))                  return aleatorio(() => faker.number.int({ min: 30, max: 800 }));
    if (/^estado$/.test(c))                      return aleatorio(() => azar(['Activo', 'Temporalmente cerrado', 'En renovación']));
  }

  if (/^habitacion/.test(t)) {
    if (/^tipo$/.test(c))       return aleatorio(() => azar(CAT.tipos_habitacion));
    if (/^estado$/.test(c))     return aleatorio(() => azar(['Disponible', 'Ocupada', 'En limpieza', 'En mantenimiento', 'Reservada']));
    if (/precio_noche/.test(c)) return aleatorio(() => faker.number.int({ min: 30, max: 600 }));
  }

  if (/^reserva/.test(t)) {
    if (/^estado$/.test(c))      return aleatorio(() => azar(CAT.estados_reserva));
    if (/tipo_pago|metodo/.test(c)) return aleatorio(() => azar(CAT.metodos_pago));
  }

  if (/^destino/.test(t) && !/aeropuerto/.test(t)) {
    if (/^categoria$/.test(c)) return aleatorio(() => azar(CAT.categorias_destino));
  }

  if (/^tour/.test(t)) {
    if (/^nombre$/.test(c))
      return aleatorio(() => `Tour ${azar(['cultural', 'de aventura', 'gastronómico', 'histórico', 'ecológico', 'nocturno'])} por ${faker.location.city()}`);
    if (/duracion/.test(c)) return aleatorio(() => faker.number.int({ min: 2, max: 12 }));
    if (/^cupo$/.test(c))   return aleatorio(() => faker.number.int({ min: 5, max: 30 }));
  }

  // ── FÁBRICA ───────────────────────────────────────────────────────────

  if (/^orden_produccion|^orden/.test(t)) {
    if (/^estado$/.test(c)) return aleatorio(() => azar(CAT.estados_orden));
    if (/cantidad/.test(c)) return aleatorio(() => faker.number.int({ min: 50, max: 5000 }));
  }

  if (/^materia_prima/.test(t)) {
    if (/^nombre$/.test(c)) return aleatorio(() => faker.helpers.arrayElement(['Acero laminado', 'Aluminio 6061', 'Plástico ABS', 'Cobre electrolítico', 'Resina epóxica', 'Caucho sintético', 'Fibra de vidrio', 'Poliuretano']));
    if (/^unidad$/.test(c)) return aleatorio(() => faker.helpers.arrayElement(['kg', 'ton', 'm', 'm²', 'L', 'ud']));
    if (/^proveedor$/.test(c)) return aleatorio(() => faker.company.name());
  }

  // Empleados en fabrica
  if (/^empleado/.test(t) && /^area$/.test(c))
    return aleatorio(() => azar(CAT.areas_fabrica));
  if (/^turno$/.test(c) && /fabrica|planta|manufactura/.test(t))
    return aleatorio(() => azar(CAT.turnos_fabrica));

  // ── UNIVERSIDAD ───────────────────────────────────────────────────────

  if (/^facultad/.test(t)) {
    if (/^nombre$/.test(c))  return porIndice(['Ingeniería', 'Medicina', 'Derecho', 'Economía', 'Ciencias Exactas', 'Humanidades', 'Arquitectura', 'Ciencias Sociales', 'Educación', 'Artes']);
    if (/^decano$/.test(c))  return aleatorio(() => `Dr. ${faker.person.fullName()}`);
  }

  if (/^estudiante/.test(t)) {
    if (/^carrera$/.test(c))  return aleatorio(() => faker.helpers.arrayElement(['Ingeniería de Sistemas', 'Medicina', 'Administración de Empresas', 'Derecho', 'Contabilidad', 'Arquitectura', 'Ingeniería Civil', 'Psicología', 'Enfermería', 'Economía']));
    if (/^semestre$/.test(c)) return aleatorio(() => faker.number.int({ min: 1, max: 10 }));
  }

  if (/^aula/.test(t)) {
    if (/^nombre$|^numero$/.test(c)) return aleatorio(() => `Aula ${faker.string.alpha(1).toUpperCase()}-${faker.number.int({ min: 100, max: 999 })}`);
    if (/^tipo$/.test(c))            return aleatorio(() => faker.helpers.arrayElement(['Teórica', 'Laboratorio', 'Taller', 'Anfiteatro', 'Sala virtual']));
    if (/^edificio$/.test(c))        return aleatorio(() => `Edificio ${faker.string.alpha(1).toUpperCase()}`);
    if (/capacidad/.test(c))         return aleatorio(() => faker.number.int({ min: 20, max: 200 }));
  }

  if (/^nota$|^calificacion/.test(t)) {
    if (/nota_final|nota_parcial|^nota$/.test(c)) return aleatorio(() => parseFloat(faker.number.float({ min: 0, max: 20, fractionDigits: 1 })));
    if (/^estado$/.test(c)) return aleatorio(() => faker.helpers.arrayElement(['Aprobado', 'Reprobado', 'Pendiente', 'Sin calificar']));
  }

  // ── FARMACIA ──────────────────────────────────────────────────────────

  if (/receta_medica|receta_farmacia/.test(t)) {
    if (/^medico$/.test(c))     return aleatorio(() => `Dr. ${faker.person.fullName()}`);
    if (/diagnostico/.test(c))  return aleatorio(() => azar(CAT.enfermedades));
    if (/^estado$/.test(c))     return aleatorio(() => azar(['Vigente', 'Dispensada', 'Vencida', 'Cancelada']));
  }

  // Medicamentos con requiere_receta
  if (/^medicamento/.test(t) && /requiere_receta/.test(c))
    return null; // booleano lo maneja el tipo

  // ── COLUMNAS TRANSVERSALES (estado contextual) ────────────────────────

  if (/^cargo$/.test(c))       return aleatorio(() => azar(CAT.cargos));
  if (/^departamento$/.test(c)) return aleatorio(() => azar(CAT.departamentos));

  return null;
}

module.exports = { CAT, obtenerGeneradorSemantico };
