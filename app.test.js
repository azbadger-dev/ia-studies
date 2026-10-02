const test = require('node:test');
const assert = require('node:assert');

// Mockear el entorno del DOM para poder requerir app.js sin errores
global.window = {};
global.document = {
  getElementById: () => ({
    addEventListener: () => {},
    textContent: '',
    innerHTML: '',
    value: '',
    style: {},
    reset: () => {}
  }),
  createElement: () => ({
    innerHTML: '',
    textContent: '',
    appendChild: () => {}
  })
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

// Ahora podemos importar la lógica pura de app.js
const { generarDatosMapaCalor, validateObjectiveMinutes, calculateProgressPercent } = require('./app.js');

test('Estructura base de generarDatosMapaCalor', (t) => {
  assert.strictEqual(typeof generarDatosMapaCalor, 'function', 'generarDatosMapaCalor debe ser una función');
  const resultado = generarDatosMapaCalor([], new Date());
  assert.ok(Array.isArray(resultado), 'Debe devolver un array vacío o poblado');
});

test('Lógica de padding y rango (RF-1)', (t) => {
  // Miércoles 14 de octubre de 2026
  const hoy = new Date(2026, 9, 14);
  const resultado = generarDatosMapaCalor([], hoy);
  
  // 83 días atrás desde un miércoles cae en un jueves.
  // Padding hasta el lunes = 3 días (lunes, martes, miércoles).
  // Total = 3 + 84 = 87 celdas.
  assert.strictEqual(resultado.length, 87, 'El array debe contener exactamente el padding + 84 días');
  assert.strictEqual(resultado[0].esRelleno, true, 'El primer día (Lunes) es relleno');
  assert.strictEqual(resultado[1].esRelleno, true, 'El segundo día (Martes) es relleno');
  assert.strictEqual(resultado[2].esRelleno, true, 'El tercer día (Miércoles) es relleno');
  assert.strictEqual(resultado[3].esRelleno, false, 'El cuarto día (Jueves) es el primer día real');
});

test('Agrupación e intensidad (RF-2)', (t) => {
  const hoy = new Date(2026, 9, 14);
  const sesionesMock = [
    { date: '2026-10-14', minutes: 15 },
    { date: '2026-10-14', minutes: 15 }, // Mismo día -> Suma 30 (Nivel 2)
    { date: '2026-10-13', minutes: 120 }, // Nivel 4
    { date: '2026-10-12', minutes: 60 } // Nivel 3
  ];
  
  const resultado = generarDatosMapaCalor(sesionesMock, hoy);
  const celdas = resultado.filter(c => !c.esRelleno);
  
  const celdaHoy = celdas[celdas.length - 1]; 
  const celdaAyer = celdas[celdas.length - 2];
  const celdaAnteayer = celdas[celdas.length - 3];
  
  assert.strictEqual(celdaHoy.nivel, 2, '30 mins totales = Nivel 2');
  assert.strictEqual(celdaAyer.nivel, 4, '120 mins totales = Nivel 4');
  assert.strictEqual(celdaAnteayer.nivel, 3, '60 mins totales = Nivel 3');
});

test('Tooltips localizados (RF-3)', (t) => {
  const hoy = new Date(2026, 9, 14);
  const sesionesMock = [
    { date: '2026-10-14', minutes: 130 }
  ];
  
  const resultado = generarDatosMapaCalor(sesionesMock, hoy);
  const celdas = resultado.filter(c => !c.esRelleno);
  const celdaHoy = celdas[celdas.length - 1];
  
  assert.strictEqual(celdaHoy.tooltip, '14 de octubre de 2026: 130 min (2h 10m)');
});

test('validateObjectiveMinutes valid cases', (t) => {
  assert.strictEqual(validateObjectiveMinutes("100"), 100);
  assert.strictEqual(validateObjectiveMinutes(" 50 "), 50);
  assert.strictEqual(validateObjectiveMinutes("1"), 1);
  assert.strictEqual(validateObjectiveMinutes("10000"), 10000);
  assert.strictEqual(validateObjectiveMinutes(100), 100);
});

test('validateObjectiveMinutes invalid cases', (t) => {
  assert.strictEqual(validateObjectiveMinutes(""), null);
  assert.strictEqual(validateObjectiveMinutes("abc"), null);
  assert.strictEqual(validateObjectiveMinutes("0"), null);
  assert.strictEqual(validateObjectiveMinutes("-10"), null);
  assert.strictEqual(validateObjectiveMinutes("10001"), null);
  assert.strictEqual(validateObjectiveMinutes(null), null);
  assert.strictEqual(validateObjectiveMinutes(undefined), null);
});

test('calculateProgressPercent correct calculations', (t) => {
  assert.strictEqual(calculateProgressPercent(50, 100), 50);
  assert.strictEqual(calculateProgressPercent(120, 100), 100, 'Debe limitar a 100');
  assert.strictEqual(calculateProgressPercent(0, 100), 0);
  assert.strictEqual(calculateProgressPercent(50, 0), 0, 'Objetivo 0 debe devolver 0');
  assert.strictEqual(calculateProgressPercent(50, null), 0, 'Objetivo null debe devolver 0');
  assert.strictEqual(calculateProgressPercent(50, undefined), 0, 'Objetivo undefined debe devolver 0');
  assert.strictEqual(calculateProgressPercent(33.3, 100), 33, 'Debe usar Math.floor');
});
