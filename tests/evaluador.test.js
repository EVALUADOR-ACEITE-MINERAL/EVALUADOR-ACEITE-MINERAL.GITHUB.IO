'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluar, parsearNumero } = require('../src/evaluador.js');

// Muestra base de categoría C con todos los ensayos del 8.2.2 en Grupo I.
function base(sobre = {}, valores = {}) {
  return {
    categoria: 'C',
    metodoRuptura: 'D877',
    ...sobre,
    valores: { ruptura: '40', agua: '20', nn: '0,05', fdd25: '0,5', aspecto: 'claro', ...valores }
  };
}
const param = (r, id) => r.parametros.find((p) => p.id === id);
const estado = (r, id) => param(r, id).estado.clave;

// ------------------------------------------------------------ parseo de entradas
test('parsea coma y punto decimal', () => {
  assert.equal(parsearNumero('0,05').valor, 0.05);
  assert.equal(parsearNumero('0.05').valor, 0.05);
  assert.equal(parsearNumero(' 26 ').valor, 26);
  assert.equal(parsearNumero(',5').valor, 0.5);
  assert.equal(parsearNumero('-30').valor, -30);
});

test('detecta vacío, texto, unidades y separadores de miles', () => {
  assert.ok(parsearNumero('').vacio);
  assert.ok(parsearNumero('   ').vacio);
  assert.ok(parsearNumero(undefined).vacio);
  assert.match(parsearNumero('abc').error, /número válido/);
  assert.match(parsearNumero('30 kV').error, /unidad/);
  assert.match(parsearNumero('35ppm').error, /unidad/);
  assert.ok(parsearNumero('1.000,5').error);
  assert.ok(parsearNumero('1,2,3').error);
  assert.ok(parsearNumero('NaN').error);
  assert.ok(parsearNumero('1e3').error);
});

// ------------------------------------------------------------ validación
test('exige categoría', () => {
  const r = evaluar(base({ categoria: '' }));
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === 'categoria'));
});

test('categoría F redirige a la del transformador asociado', () => {
  const r = evaluar(base({ categoria: 'F' }));
  assert.equal(r.valido, false);
  assert.match(r.errores[0].mensaje, /transformador asociado/);
});

test('exige método de ruptura cuando se ingresa tensión de ruptura', () => {
  const r = evaluar(base({ metodoRuptura: '' }));
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === 'metodoRuptura'));
});

test('rechaza no numéricos, negativos y porcentajes > 100', () => {
  const r = evaluar(base({}, { agua: 'veinte', nn: '-0,1', fdd25: '150' }));
  assert.equal(r.valido, false);
  const campos = r.errores.map((e) => e.campo).sort();
  assert.deepEqual(campos, ['agua', 'fdd25', 'nn']);
});

test('rechaza formulario sin ningún valor', () => {
  const r = evaluar({ categoria: 'C', metodoRuptura: 'D877', valores: {} });
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === 'general'));
});

test('acepta punto de fluidez negativo', () => {
  const r = evaluar(base({}, { puntoFluidez: '-40' }));
  assert.equal(r.valido, true);
  assert.equal(estado(r, 'puntoFluidez'), 'AMBIGUO');
});

// ------------------------------------------------------------ resultado general
test('muestra completa en Grupo I => condición favorable', () => {
  const r = evaluar(base());
  assert.equal(r.valido, true);
  assert.equal(r.general.estado.clave, 'FAVORABLE');
});

test('faltan ensayos del núcleo => no determinado (nunca favorable)', () => {
  const r = evaluar(base({}, { fdd25: '' }));
  assert.equal(r.general.estado.clave, 'NO_DETERMINADO');
  assert.match(r.general.motivos.join(' '), /Factor de potencia a 25/);
});

test('un parámetro en Grupo III => crítica', () => {
  const r = evaluar(base({}, { tensionInterfasial: '14' }));
  assert.equal(estado(r, 'tensionInterfasial'), 'GRUPO_III');
  assert.equal(r.general.estado.clave, 'CRITICA');
});

test('un parámetro en Grupo II => alerta', () => {
  const r = evaluar(base({}, { ruptura: '25' }));
  assert.equal(estado(r, 'ruptura'), 'GRUPO_II');
  assert.equal(r.general.estado.clave, 'ALERTA');
  assert.match(r.general.notas.join(' '), /8\.4 b\)/);
});

test('alerta con datos faltantes advierte evaluación incompleta', () => {
  const r = evaluar(base({}, { ruptura: '25', agua: '', fdd25: '' }));
  assert.equal(r.general.estado.clave, 'ALERTA');
  assert.match(r.general.notas.join(' '), /incompleta/);
});

test('resistividad ingresada (ambigua) impide condición favorable', () => {
  const r = evaluar(base({}, { resistividad90: '5' }));
  assert.equal(estado(r, 'resistividad90'), 'AMBIGUO');
  assert.equal(r.general.estado.clave, 'NO_DETERMINADO');
});

test('categorías D, E y G no cubiertas => no determinado', () => {
  for (const cat of ['D', 'E', 'G']) {
    const r = evaluar(base({ categoria: cat }));
    assert.equal(r.valido, true);
    assert.equal(r.general.estado.clave, 'NO_DETERMINADO');
    assert.equal(estado(r, 'ruptura'), 'NO_CUBIERTO');
  }
});

// ------------------------------------------------------------ límites: tensión de ruptura
test('ruptura ASTM D877 cat. C: 26 es Grupo I (≥ inclusivo), 25,9 es Grupo II (< exclusivo)', () => {
  assert.equal(estado(evaluar(base({}, { ruptura: '26' })), 'ruptura'), 'GRUPO_I');
  assert.equal(estado(evaluar(base({}, { ruptura: '25,9' })), 'ruptura'), 'GRUPO_II');
});

test('ruptura ASTM D877 cat. O: límite 30', () => {
  assert.equal(estado(evaluar(base({ categoria: 'O' }, { ruptura: '30' })), 'ruptura'), 'GRUPO_I');
  assert.equal(estado(evaluar(base({ categoria: 'O' }, { ruptura: '29,9' })), 'ruptura'), 'GRUPO_II');
});

test('ruptura ASTM D1816 bajo el límite => fuera de Grupo I sin grupo (Grupo II ambiguo)', () => {
  const r = evaluar(base({ metodoRuptura: 'D1816_004' }, { ruptura: '22' }));
  assert.equal(estado(r, 'ruptura'), 'FUERA_GRUPO_I');
  assert.match(param(r, 'ruptura').notas.join(' '), /ambiguo/);
  assert.equal(r.general.estado.clave, 'ALERTA');
  assert.equal(estado(evaluar(base({ metodoRuptura: 'D1816_004' }, { ruptura: '23' })), 'ruptura'), 'GRUPO_I');
});

test('ruptura IEC 156 cat. A: límite 40', () => {
  assert.equal(estado(evaluar(base({ categoria: 'A', metodoRuptura: 'IEC156' }, { ruptura: '40', agua: '10' })), 'ruptura'), 'GRUPO_I');
  assert.equal(estado(evaluar(base({ categoria: 'A', metodoRuptura: 'IEC156' }, { ruptura: '39,9', agua: '10' })), 'ruptura'), 'FUERA_GRUPO_I');
});

// ------------------------------------------------------------ límites: agua
test('agua cat. C: 35 Grupo I (≤ explícito gana sobre extremo de rango)', () => {
  const r = evaluar(base({}, { agua: '35' }));
  assert.equal(estado(r, 'agua'), 'GRUPO_I');
  assert.match(param(r, 'agua').notas.join(' '), /extremo de un rango/);
});

test('agua cat. C: 37 Grupo II; 40 ambiguo (extremo); 41 fuera de Grupo I sin grupo', () => {
  assert.equal(estado(evaluar(base({}, { agua: '37' })), 'agua'), 'GRUPO_II');
  assert.equal(estado(evaluar(base({}, { agua: '40' })), 'agua'), 'AMBIGUO');
  const r = evaluar(base({}, { agua: '41' }));
  assert.equal(estado(r, 'agua'), 'FUERA_GRUPO_I');
  assert.equal(r.general.estado.clave, 'ALERTA');
});

test('agua no aplicable si acidez > 0,1 (Tabla 2, nota 1)', () => {
  const r = evaluar(base({}, { nn: '0,15', agua: '10' }));
  assert.equal(estado(r, 'nn'), 'GRUPO_I');
  assert.equal(estado(r, 'agua'), 'NO_APLICABLE');
  assert.equal(r.general.estado.clave, 'NO_DETERMINADO');
});

test('agua con acidez exactamente 0,1 sí aplica ("no sobrepase")', () => {
  assert.equal(estado(evaluar(base({}, { nn: '0,1', agua: '10' })), 'agua'), 'GRUPO_I');
});

test('agua sin índice de neutralización => datos insuficientes', () => {
  const r = evaluar(base({}, { nn: '' }));
  assert.equal(estado(r, 'agua'), 'DATOS_INSUFICIENTES');
  assert.equal(r.general.estado.clave, 'NO_DETERMINADO');
});

test('agua: advierte si la temperatura de muestreo está fuera de >40–60 °C', () => {
  const r = evaluar(base({}, { temperaturaMuestra: '25' }));
  assert.match(param(r, 'agua').notas.join(' '), /25 °C/);
  const r2 = evaluar(base({}, { temperaturaMuestra: '50' }));
  assert.doesNotMatch(param(r2, 'agua').notas.join(' '), /4\.3/);
});

// ------------------------------------------------------------ límites: índice de neutralización
test('NN cat. C: 0,3 Grupo I; 0,31 Grupo II; 0,5 Grupo II; 0,51 Grupo III (solapamiento => más severo)', () => {
  assert.equal(estado(evaluar(base({}, { nn: '0,3', agua: '' })), 'nn'), 'GRUPO_I');
  assert.equal(estado(evaluar(base({}, { nn: '0,31', agua: '' })), 'nn'), 'GRUPO_II');
  assert.equal(estado(evaluar(base({}, { nn: '0,5', agua: '' })), 'nn'), 'GRUPO_II');
  const r = evaluar(base({}, { nn: '0,51', agua: '' }));
  assert.equal(estado(r, 'nn'), 'GRUPO_III');
  assert.match(param(r, 'nn').notas.join(' '), /más severo/);
  assert.equal(r.general.estado.clave, 'CRITICA');
});

test('NN cat. O: 0,1 Grupo I; 0,15 Grupo II; 0,2 ambiguo; 0,3 sin grupo (vacío entre 0,2 y 0,4); 0,41 Grupo III', () => {
  const o = (nn) => estado(evaluar(base({ categoria: 'O' }, { nn, agua: '', ruptura: '40' })), 'nn');
  assert.equal(o('0,1'), 'GRUPO_I');
  assert.equal(o('0,15'), 'GRUPO_II');
  assert.equal(o('0,2'), 'AMBIGUO');
  assert.equal(o('0,3'), 'FUERA_GRUPO_I');
  assert.equal(o('0,4'), 'FUERA_GRUPO_I');
  assert.equal(o('0,41'), 'GRUPO_III');
});

test('NN > 0,3 agrega nota de mayor frecuencia (Tabla 2)', () => {
  const r = evaluar(base({}, { nn: '0,35', agua: '' }));
  assert.match(param(r, 'nn').notas.join(' '), /más frecuencia/);
});

// ------------------------------------------------------------ límites: tensión interfasial
test('tensión interfasial cat. C: 24 Grupo I; 23,9 Grupo II; 15 Grupo II; 14,9 Grupo III', () => {
  const t = (v) => estado(evaluar(base({}, { tensionInterfasial: v })), 'tensionInterfasial');
  assert.equal(t('24'), 'GRUPO_I');
  assert.equal(t('23,9'), 'GRUPO_II');
  assert.equal(t('15'), 'GRUPO_II');
  assert.equal(t('14,9'), 'GRUPO_III');
});

test('tensión interfasial cat. A: 25 queda sin grupo (entre <24 y ≥26)', () => {
  assert.equal(estado(evaluar(base({ categoria: 'A' }, { tensionInterfasial: '25', agua: '10' })), 'tensionInterfasial'), 'FUERA_GRUPO_I');
});

// ------------------------------------------------------------ otros parámetros
test('FDD 25 °C: 1,0 Grupo I; 1,01 fuera de Grupo I', () => {
  assert.equal(estado(evaluar(base({}, { fdd25: '1' })), 'fdd25'), 'GRUPO_I');
  assert.equal(estado(evaluar(base({}, { fdd25: '1,01' })), 'fdd25'), 'FUERA_GRUPO_I');
});

test('color y FDD 100 °C: no cubiertos en servicio y no alteran el semáforo', () => {
  const r = evaluar(base({}, { color: '3,5', fdd100: '2' }));
  assert.equal(estado(r, 'color'), 'NO_CUBIERTO');
  assert.equal(estado(r, 'fdd100'), 'NO_CUBIERTO');
  assert.equal(r.general.estado.clave, 'FAVORABLE');
  assert.match(r.general.notas.join(' '), /sin criterio para aceite en servicio/);
});

test('aspecto turbio => fuera de Grupo I => alerta', () => {
  const r = evaluar(base({}, { aspecto: 'no_claro' }));
  assert.equal(estado(r, 'aspecto'), 'FUERA_GRUPO_I');
  assert.equal(r.general.estado.clave, 'ALERTA');
});

test('propiedades físicas: informativas, límites inclusivos de mín./máx.', () => {
  const r = evaluar(base({}, { puntoInflamacion: '145', gravedadEspecifica: '0,91', viscosidad40: '12' }));
  assert.equal(estado(r, 'puntoInflamacion'), 'REF_CUMPLE');
  assert.equal(estado(r, 'gravedadEspecifica'), 'REF_CUMPLE');
  assert.equal(estado(r, 'viscosidad40'), 'REF_CUMPLE');
  const r2 = evaluar(base({}, { puntoInflamacion: '144', viscosidad40: '12,1' }));
  assert.equal(estado(r2, 'puntoInflamacion'), 'REF_NO_CUMPLE');
  assert.equal(estado(r2, 'viscosidad40'), 'REF_NO_CUMPLE');
  assert.equal(r2.general.estado.clave, 'FAVORABLE');
  assert.match(r2.general.notas.join(' '), /NTC 1465/);
});

test('cada resultado incluye referencia a la norma y explicación', () => {
  const r = evaluar(base());
  for (const p of r.parametros) {
    assert.ok(p.referencia && p.referencia.length > 0, p.id);
    assert.ok(p.explicacion.length > 0, p.id);
  }
});
