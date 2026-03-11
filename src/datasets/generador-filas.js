'use strict';

// ============================================================
// Generador de filas — v0.6.2
// A partir de un esquema JSON estructurado, genera filas con
// datos coherentes y semánticamente correctos por dominio.
// Usa catalogos-semanticos.js para lookups por (tabla, columna).
// ============================================================

const { faker } = require('@faker-js/faker');
const { obtenerGeneradorSemantico } = require('./catalogos-semanticos');

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
  // Dominio detectado por el enriquecedor — evita contaminación semántica entre dominios
  const dominio = esquema._dominio || null;
  const resultado = [];

  for (const tablaEsquema of tablasOrdenadas) {
    const filas = generarFilas(tablaEsquema, resultado, dominio);

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
// Ordenar tablas por dependencias — Kahn's algorithm
// -----------------------------------------------

/**
 * Ordena tablas topológicamente: las tablas referenciadas por _id van primero.
 * Usa Kahn's algorithm para un sort topológico real que maneja cadenas de N niveles.
 * Si hay ciclos (raro pero posible), los nodos del ciclo se añaden al final.
 */
function ordenarPorDependencias(tablas) {
  const nombres = tablas.map((t) => t.nombre);
  const indice  = new Map(tablas.map((t, i) => [t.nombre, i]));

  // Construir grafo de dependencias: tabla → set de tablas de las que depende
  const deps = new Map(tablas.map((t) => [t.nombre, new Set()]));

  for (const tabla of tablas) {
    for (const col of tabla.columnas) {
      if (!col.nombre.endsWith('_id')) continue;
      const ref = col.nombre.slice(0, -3);
      // Buscar tabla referenciada (igual, plural con s, plural con es, o raíz sin s)
      const candidatos = [ref, ref + 's', ref + 'es'];
      for (const candidato of candidatos) {
        if (nombres.includes(candidato) && candidato !== tabla.nombre) {
          deps.get(tabla.nombre).add(candidato);
          break;
        }
      }
    }
  }

  // Kahn's algorithm: grado de entrada = número de tablas de las que depende esta
  const gradoEntrada = new Map(tablas.map((t) => [t.nombre, deps.get(t.nombre).size]));
  const cola = tablas.filter((t) => gradoEntrada.get(t.nombre) === 0).map((t) => t.nombre);
  const resultado = [];

  while (cola.length > 0) {
    const actual = cola.shift();
    resultado.push(tablas[indice.get(actual)]);
    // Reducir grado de entrada de las tablas que dependen de ésta
    for (const tabla of tablas) {
      if (deps.get(tabla.nombre).has(actual)) {
        const nuevo = gradoEntrada.get(tabla.nombre) - 1;
        gradoEntrada.set(tabla.nombre, nuevo);
        if (nuevo === 0) cola.push(tabla.nombre);
      }
    }
  }

  // Si quedaron tablas (ciclo), añadirlas al final en orden original
  if (resultado.length < tablas.length) {
    const procesadas = new Set(resultado.map((t) => t.nombre));
    for (const tabla of tablas) {
      if (!procesadas.has(tabla.nombre)) resultado.push(tabla);
    }
  }

  return resultado;
}

// -----------------------------------------------
// Generación de filas para una tabla
// -----------------------------------------------

function generarFilas(tablaEsquema, tablasYaGeneradas, dominio) {
  const filas = [];
  for (let i = 0; i < tablaEsquema.filas; i++) {
    const fila = {};
    for (const col of tablaEsquema.columnas) {
      fila[col.nombre] = generarValor(col.nombre, col.tipo, i, tablasYaGeneradas, tablaEsquema.nombre, dominio);
    }
    filas.push(fila);
  }
  return filas;
}

// -----------------------------------------------
// Generación de valor por columna
// -----------------------------------------------

/**
 * Genera el valor de una columna para la fila `indice`.
 *
 * Prioridad:
 *   1. id propio → secuencial
 *   2. _id foráneo → resolver FK
 *   3. Generador semántico (tabla + columna) → valor del catálogo de dominio
 *   4. Tipo fecha / booleano → generadores genéricos por patrón de nombre
 *   5. Tipo numero → generadores genéricos por patrón de nombre
 *   6. Tipo texto → generadores genéricos por patrón de nombre
 */
function generarValor(nombre, tipo, indice, tablasGeneradas, nombreTabla, dominio) {
  const n = nombre.toLowerCase();

  // 1. ID propio → siempre secuencial
  if (n === 'id') return indice + 1;

  // 2. Referencia foránea → resolver contra tabla ya generada
  if (n.endsWith('_id')) return resolverIdForaneo(n, tablasGeneradas);

  // 3. Generador semántico específico por (tabla, columna, dominio)
  const genSemantico = obtenerGeneradorSemantico(nombreTabla, n, dominio);
  if (genSemantico !== null) return genSemantico(indice);

  // 4–6. Fallback: generadores genéricos por tipo y patrón de nombre
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
  // Fallback: la tabla referenciada no se ha generado todavía o no existe
  console.warn(`[generador-filas] FK no resuelta para "${nombreCol}" (referencia "${ref}" no encontrada). Usando rango genérico.`);
  return faker.number.int({ min: 1, max: 50 });
}

// -----------------------------------------------
// Generadores genéricos por tipo
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
  if (/presupuesto|budget/.test(n))
    return faker.number.int({ min: 1000, max: 100000 });
  if (/credito|credit/.test(n))
    return faker.number.int({ min: 2, max: 6 });
  if (/capacidad/.test(n))
    return faker.number.int({ min: 2, max: 50 });
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
  else if (/inicio|start/.test(n))
    fecha = faker.date.past({ years: 1 });
  else if (/fin$|end$/.test(n))
    fecha = faker.date.future({ years: 1 });
  else
    fecha = faker.date.past({ years: 2 });

  return fecha.toISOString().split('T')[0]; // YYYY-MM-DD
}

function generarTextoSegunNombre(n) {
  // Persona
  if (/^nombre$|^first_name$/.test(n))
    return faker.person.firstName();
  if (/^apellido|^last_name/.test(n))
    return faker.person.lastName();
  if (/nombre_completo|full_name|nombre_paciente|nombre_cliente|nombre_empleado|nombre_proveedor|nombre_pasajero/.test(n))
    return faker.person.fullName();

  // Contacto
  if (/email|correo/.test(n))               return faker.internet.email();
  if (/telefono|phone|tel|celular/.test(n)) return faker.phone.number();
  if (/web|url|website/.test(n))            return faker.internet.url();

  // Ubicación
  if (/ciudad|city/.test(n))                return faker.location.city();
  if (/pais|country/.test(n))               return faker.location.country();
  if (/estado|provincia|region/.test(n))    return faker.location.state();
  if (/direccion|address|domicilio/.test(n)) return faker.location.streetAddress();
  if (/codigo_postal|zip|cp/.test(n))       return faker.location.zipCode();

  // Producto / comercio
  if (/^producto$|nombre_producto|^articulo$/.test(n))
    return faker.commerce.productName();
  if (/descripcion|description|detalle/.test(n))
    return faker.commerce.productDescription();
  if (/categoria|category/.test(n))
    return faker.commerce.department();
  if (/^marca$|brand/.test(n))
    return faker.company.name();
  if (/^modelo$|model/.test(n))
    return faker.vehicle.model();
  if (/^color$/.test(n))
    return faker.color.human();
  if (/^sku$|codigo_producto|^referencia$/.test(n))
    return faker.string.alphanumeric(8).toUpperCase();
  if (/^unidad$/.test(n))
    return faker.helpers.arrayElement(['kg', 'L', 'unidad', 'caja', 'm', 'm²']);

  // Empresa / organización
  if (/nombre_empresa|^compania$|^organizacion$/.test(n))
    return faker.company.name();
  if (/^ruc$|^nit$|^rfc$|^cif$|^documento$/.test(n))
    return faker.string.numeric(11);

  // Identificadores con prefijo
  if (/^matricula$/.test(n))
    return faker.string.alphanumeric(8).toUpperCase();
  if (/^codigo$|^codigo_/.test(n))
    return faker.string.alphanumeric(6).toUpperCase();

  // Estado / tipo genérico (sólo si no fue capturado por semántico)
  if (/^estado$|^status$/.test(n))
    return faker.helpers.arrayElement(['activo', 'inactivo', 'pendiente', 'completado']);
  if (/^tipo$|^type$/.test(n))
    return faker.helpers.arrayElement(['Tipo A', 'Tipo B', 'Tipo C']);

  // Texto libre
  if (/nota|observacion|comment/.test(n))  return faker.lorem.sentence();
  if (/^titulo$|^title$/.test(n))          return faker.lorem.words(3);
  if (/descripcion|description/.test(n))   return faker.lorem.sentence();

  // Nombre genérico: SOLO si la columna se llama exactamente "nombre" o "nombre_*" sin mejor match
  // Se hace al final para no capturar nombres de dominio (medicamento, especialidad, etc.)
  if (/^nombre_/.test(n) || n === 'nombre')
    return faker.commerce.productName();

  return faker.lorem.word();
}

module.exports = { generarTablasDesdeEsquema };
