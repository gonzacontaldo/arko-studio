import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceEstimate, validateService } from '../src/admin/finanzas/serviceCosts.js';
const config = () => ({ tiempos: { preparacion: 15, captura: 60, edicion: 90, entrega: 15 }, valor_hora_usd: 10, trabajos_mes: 5, costos: [{ nombre: 'Editor', importe_usd: 20, periodo: 'trabajo', porcentaje: 100 }, { nombre: 'Software compartido', importe_usd: 100, periodo: 'mensual', porcentaje: 25 }, { nombre: 'Hosting', importe_usd: 120, periodo: 'anual', porcentaje: 100 }] });
test('separa remuneración, costos directos y gastos periódicos compartidos', () => {
  assert.deepEqual(serviceEstimate(config()), { minutes: 180, labor: 30, direct: 20, monthly: 35, allocated: 7, total: 57 });
});
test('el volumen afecta solo el reparto de gastos periódicos', () => {
  const value = config(); value.trabajos_mes = 10;
  assert.equal(serviceEstimate(value).total, 53.5);
  value.trabajos_mes = 0;
  assert.equal(serviceEstimate(value).total, null);
  value.costos = [];
  assert.equal(serviceEstimate(value).total, 30);
});
test('rechaza tiempos vacíos, importes inválidos y porcentajes fuera de rango', () => {
  assert.equal(validateService(config()), '');
  for (const change of [c => c.valor_hora_usd = 0, c => c.trabajos_mes = 1.5, c => c.tiempos.captura = -1, c => c.costos[0].importe_usd = 'NaN', c => c.costos[0].porcentaje = 101, c => c.costos[0].periodo = 'otro', c => c.tiempos = { preparacion: 0, captura: 0, edicion: 0, entrega: 0 }]) {
    const c = config(); change(c); assert.ok(validateService(c));
  }
});
test('vincula el gasto actual sin copiarlo y convierte ARS a USD', () => {
  const c = config(); c.costos = [{ recurrente_id: 'r1', porcentaje: 50 }];
  const recurring = [{ id: 'r1', descripcion: 'Software', moneda: 'ARS', importe: 120000, frecuencia: 'mensual', activa: true, inicio: '2026-01-01' }];
  const options = { recurring, rate: 1200, now: '2026-11-19' };
  assert.equal(serviceEstimate(c, options).total, 40);
  recurring[0].importe = 240000;
  assert.equal(serviceEstimate(c, options).total, 50);
  assert.equal(serviceEstimate(c, { ...options, rate: null }).total, null);
  recurring[0].activa = false;
  assert.equal(serviceEstimate(c, { ...options, rate: null }).total, 30);
  assert.equal(serviceEstimate(c).total, null);
  assert.equal(validateService(c), '');
});
test('normaliza anualidades y excluye recurrentes futuros y finalizados', () => {
  const c = config(); c.costos = [{ recurrente_id: 'r1', porcentaje: 100 }];
  const row = { id: 'r1', descripcion: 'Hosting', moneda: 'USD', importe: 120, frecuencia: 'anual', activa: true, inicio: '2026-01-01', cuotas: 1 };
  const estimate = now => serviceEstimate(c, { recurring: [row], now });
  assert.equal(estimate('2026-11-19').total, 32);
  assert.equal(estimate('2027-01-01').total, 30);
  assert.equal(estimate('2025-12-01').total, 30);
  row.fin = '2026-10-31';
  assert.equal(estimate('2026-11-19').total, 30);
});
