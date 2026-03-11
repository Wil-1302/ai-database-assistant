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

  return null;
}

module.exports = { CAT, obtenerGeneradorSemantico };
