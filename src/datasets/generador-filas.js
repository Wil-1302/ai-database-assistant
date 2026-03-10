'use strict';

// ============================================================
// Generador de filas falsas con faker — v0.5
// A partir de un esquema JSON estructurado, genera filas con
// datos coherentes y resuelve relaciones por sufijo _id.
// ============================================================

const { faker } = require('@faker-js/faker');

// -----------------------------------------------
// Función principal pública
// -----------------------------------------------

/**
 * Genera todas las tablas del esquema con filas falsas.
 * Las tablas con dependencias (_id) se generan después de sus referencias.
 *
 * @param {{ tablas: Array<{ nombre: string, filas: number, columnas: Array<{ nombre: string, tipo: string }> }> }} esquema
 * @returns {Array<{ nombre: string, columnas: Array<{ nombre: string, tipo: string, muestra: string[] }>, filas: Array<Record<string,any>> }>}
 */
function generarTablasDesdeEsquema(esquema) {
  const tablasOrdenadas = ordenarPorDependencias(esquema.tablas);
  const resultado = [];

  for (const tablaEsquema of tablasOrdenadas) {
    const filas = generarFilas(tablaEsquema, resultado);

    // Extraer muestra de valores (hasta 3 por columna, para el árbol de esquema de la UI)
    const columnas = tablaEsquema.columnas.map((col) => {
      const muestraValores = filas
        .slice(0, 5)
        .map((f) => {
          const v = f[col.nombre];
          return v === null || v === undefined ? '' : String(v);
        })
        .filter((v) => v !== '')
        .slice(0, 3);

      return { nombre: col.nombre, tipo: col.tipo, muestra: muestraValores };
    });

    resultado.push({ nombre: tablaEsquema.nombre, columnas, filas });
  }

  return resultado;
}

// -----------------------------------------------
// Ordenar tablas por dependencias (topológico simple)
// -----------------------------------------------

/**
 * Pone primero las tablas que no dependen de otras,
 * para que las _id se puedan resolver correctamente.
 */
function ordenarPorDependencias(tablas) {
  const nombres = new Set(tablas.map((t) => t.nombre));
  const sinDeps = [];
  const conDeps = [];

  for (const tabla of tablas) {
    const tieneDep = tabla.columnas.some((col) => {
      if (!col.nombre.endsWith('_id')) return false;
      const ref = col.nombre.slice(0, -3);
      return nombres.has(ref) || nombres.has(ref + 's') || nombres.has(ref + 'es');
    });
    (tieneDep ? conDeps : sinDeps).push(tabla);
  }

  return [...sinDeps, ...conDeps];
}

// -----------------------------------------------
// Generación de filas para una tabla
// -----------------------------------------------

function generarFilas(tablaEsquema, tablasYaGeneradas) {
  const filas = [];
  for (let i = 0; i < tablaEsquema.filas; i++) {
    const fila = {};
    for (const col of tablaEsquema.columnas) {
      fila[col.nombre] = generarValor(col.nombre, col.tipo, i, tablasYaGeneradas);
    }
    filas.push(fila);
  }
  return filas;
}

// -----------------------------------------------
// Generación de valor por columna
// -----------------------------------------------

function generarValor(nombre, tipo, indice, tablasGeneradas) {
  const n = nombre.toLowerCase();

  // ID propio siempre es secuencial
  if (n === 'id') return indice + 1;

  // Referencia foránea: resolver contra tabla relacionada
  if (n.endsWith('_id')) return resolverIdForaneo(n, tablasGeneradas);

  if (tipo === 'booleano') return faker.datatype.boolean() ? 1 : 0;
  if (tipo === 'fecha')    return generarFecha(n);
  if (tipo === 'numero')   return generarNumero(n);

  return generarTextoSegunNombre(n);
}

function resolverIdForaneo(nombreCol, tablasGeneradas) {
  const ref = nombreCol.slice(0, -3);
  const tablaRef = tablasGeneradas.find(
    (t) => t.nombre === ref || t.nombre === ref + 's' || t.nombre === ref + 'es' ||
           ref === t.nombre + 's' || ref === t.nombre + 'es'
  );
  if (tablaRef && tablaRef.filas.length > 0) {
    return faker.number.int({ min: 1, max: tablaRef.filas.length });
  }
  return faker.number.int({ min: 1, max: 50 });
}

// -----------------------------------------------
// Generadores por tipo
// -----------------------------------------------

function generarNumero(n) {
  if (/precio|price|costo|cost|importe|monto|valor|tarifa/.test(n))
    return parseFloat(faker.commerce.price({ min: 1, max: 999 }));
  if (/salario|sueldo|ingreso/.test(n))
    return faker.number.int({ min: 800, max: 5000 });
  if (/cantidad|qty|stock|existencia|inventario/.test(n))
    return faker.number.int({ min: 0, max: 500 });
  if (/edad|age/.test(n))
    return faker.number.int({ min: 18, max: 80 });
  if (/peso|weight/.test(n))
    return parseFloat(faker.number.float({ min: 1, max: 150, fractionDigits: 1 }));
  if (/altura|height/.test(n))
    return parseFloat(faker.number.float({ min: 1.4, max: 2.0, fractionDigits: 2 }));
  if (/descuento|discount/.test(n))
    return faker.number.int({ min: 0, max: 50 });
  if (/calificacion|rating|puntuacion|nota/.test(n))
    return parseFloat(faker.number.float({ min: 1, max: 10, fractionDigits: 1 }));
  if (/duracion|dias|horas/.test(n))
    return faker.number.int({ min: 1, max: 365 });
  return faker.number.int({ min: 1, max: 1000 });
}

function generarFecha(n) {
  let fecha;
  if (/nacimiento|birth/.test(n))
    fecha = faker.date.birthdate({ min: 18, max: 70, mode: 'age' });
  else if (/vencimiento|expira|vence/.test(n))
    fecha = faker.date.future({ years: 2 });
  else if (/creacion|creado|registro|alta/.test(n))
    fecha = faker.date.past({ years: 3 });
  else if (/actualizacion|modificado/.test(n))
    fecha = faker.date.recent({ days: 365 });
  else
    fecha = faker.date.past({ years: 2 });

  return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
}

function generarTextoSegunNombre(n) {
  // Persona
  if (/^nombre$|^first_name$/.test(n))                         return faker.person.firstName();
  if (/^apellido|^last_name/.test(n))                          return faker.person.lastName();
  if (/nombre_completo|full_name|nombre_paciente|nombre_cliente|nombre_empleado|nombre_proveedor|nombre_pasajero/.test(n))
    return faker.person.fullName();

  // Contacto
  if (/email|correo/.test(n))               return faker.internet.email();
  if (/telefono|phone|tel|celular/.test(n)) return faker.phone.number();
  if (/web|url|website/.test(n))            return faker.internet.url();

  // Ubicación
  if (/ciudad|city/.test(n))               return faker.location.city();
  if (/pais|country/.test(n))              return faker.location.country();
  if (/estado|provincia|region/.test(n))   return faker.location.state();
  if (/direccion|address|domicilio/.test(n)) return faker.location.streetAddress();
  if (/codigo_postal|zip|cp/.test(n))      return faker.location.zipCode();

  // Producto / comercio
  if (/^producto$|nombre_producto|^articulo$/.test(n)) return faker.commerce.productName();
  if (/descripcion|description|detalle/.test(n))        return faker.commerce.productDescription();
  if (/categoria|category/.test(n))                     return faker.commerce.department();
  if (/marca|brand/.test(n))                            return faker.company.name();
  if (/modelo|model/.test(n))                           return faker.vehicle.model();
  if (/color/.test(n))                                  return faker.color.human();
  if (/sku|codigo_producto|referencia/.test(n))         return faker.string.alphanumeric(8).toUpperCase();
  if (/unidad/.test(n))                                 return faker.helpers.arrayElement(['kg', 'litro', 'unidad', 'caja', 'm2']);

  // Empresa
  if (/empresa|company|compania|proveedor|organizacion/.test(n)) return faker.company.name();
  if (/ruc|nit|rfc|cif|documento/.test(n))                       return faker.string.numeric(11);

  // Vuelos / transporte
  if (/destino|origen|aeropuerto/.test(n)) return faker.helpers.arrayElement(['MAD', 'BCN', 'MEX', 'BOG', 'LIM', 'BUE', 'MIA', 'LAX', 'JFK']);
  if (/clase/.test(n))                     return faker.helpers.arrayElement(['Económica', 'Business', 'Primera']);
  if (/asiento|seat/.test(n))              return faker.string.alpha(1).toUpperCase() + faker.number.int({ min: 1, max: 40 });
  if (/equipaje|baggage/.test(n))          return faker.helpers.arrayElement(['Sin equipaje', '23kg', '32kg']);
  if (/vuelo|flight/.test(n))              return faker.string.alpha(2).toUpperCase() + faker.string.numeric(4);

  // Salud
  if (/diagnostico|diagnosis/.test(n))     return faker.helpers.arrayElement(['Hipertensión', 'Diabetes', 'Anemia', 'Gripe', 'Lumbalgia', 'Migraña']);
  if (/especialidad|specialty/.test(n))    return faker.helpers.arrayElement(['Cardiología', 'Pediatría', 'Traumatología', 'Neurología']);
  if (/medicamento|medicina/.test(n))      return faker.helpers.arrayElement(['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Omeprazol']);
  if (/sala|room/.test(n))                return faker.helpers.arrayElement(['Urgencias', 'UCI', 'Consulta 1', 'Consulta 2']);

  // Estado / tipo
  if (/^estado$|^status$/.test(n))  return faker.helpers.arrayElement(['activo', 'inactivo', 'pendiente', 'completado']);
  if (/^tipo$|^type$/.test(n))      return faker.helpers.arrayElement(['A', 'B', 'C']);

  // Texto libre
  if (/nota|observacion|comment/.test(n)) return faker.lorem.sentence();
  if (/titulo|title/.test(n))             return faker.lorem.words(3);

  // Nombre genérico
  if (/nombre/.test(n)) return faker.person.firstName() + ' ' + faker.person.lastName();

  return faker.lorem.word();
}

module.exports = { generarTablasDesdeEsquema };
