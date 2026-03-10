'use strict';

// ============================================================
// Detector de esquema: infiere nombres y tipos de columnas
// a partir de una muestra de filas de datos.
// ============================================================

// Patrones para detectar tipos
const RE_NUMERO    = /^-?[\d]+([.,][\d]+)?$/;
const RE_FECHA     = /^\d{4}[-/]\d{2}[-/]\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$|^\d{2}[-/]\d{2}[-/]\d{4}$/;
const RE_BOOLEANO  = /^(true|false|sí|si|no|verdadero|falso|1|0)$/i;

/**
 * Infiere el tipo de un valor individual.
 * @param {string} valor
 * @returns {'numero'|'fecha'|'booleano'|'texto'}
 */
function detectarTipo(valor) {
  const v = String(valor ?? '').trim();
  if (v === '') return 'texto';
  if (RE_BOOLEANO.test(v)) return 'booleano';
  if (RE_FECHA.test(v)) return 'fecha';
  if (RE_NUMERO.test(v.replace(',', '.'))) return 'numero';
  return 'texto';
}

/**
 * Cuenta cuántas veces aparece cada tipo en un array de valores.
 * @param {string[]} valores
 * @returns {{ numero: number, fecha: number, booleano: number, texto: number }}
 */
function contarTipos(valores) {
  const conteo = { numero: 0, fecha: 0, booleano: 0, texto: 0 };
  for (const v of valores) {
    conteo[detectarTipo(v)]++;
  }
  return conteo;
}

/**
 * Elige el tipo dominante en una columna.
 * Si hay empate o el tipo más frecuente es <50%, devuelve 'texto'.
 * @param {string[]} valores
 * @returns {'numero'|'fecha'|'booleano'|'texto'}
 */
function tipoDominante(valores) {
  const valoresNoVacios = valores.filter((v) => String(v ?? '').trim() !== '');
  if (valoresNoVacios.length === 0) return 'texto';

  const conteo = contarTipos(valoresNoVacios);
  const [tipoPrincipal] = Object.entries(conteo).sort((a, b) => b[1] - a[1]);

  const porcentaje = tipoPrincipal[1] / valoresNoVacios.length;
  return porcentaje >= 0.5 ? tipoPrincipal[0] : 'texto';
}

/**
 * Genera el esquema completo para un conjunto de filas.
 * @param {Record<string, string>[]} filas  Array de objetos con los datos.
 * @param {number} [muestraMax=200]         Máximo de filas a analizar para inferir tipos.
 * @returns {{ nombre: string, tipo: string, muestra: string[] }[]}
 */
function inferirEsquema(filas, muestraMax = 200) {
  if (!filas || filas.length === 0) return [];

  const columnas = Object.keys(filas[0]);
  const muestra = filas.slice(0, muestraMax);

  return columnas.map((nombre) => {
    const valores = muestra.map((fila) => String(fila[nombre] ?? ''));
    const tipo = tipoDominante(valores);

    // Hasta 3 valores de muestra no vacíos para mostrar en la UI
    const muestraValores = valores
      .filter((v) => v.trim() !== '')
      .slice(0, 3);

    return { nombre, tipo, muestra: muestraValores };
  });
}

module.exports = { detectarTipo, inferirEsquema };
