import test from 'node:test';
import assert from 'node:assert/strict';
import { totals, accountStatus, annualSeries, toArs } from '../src/admin/finanzas/model.js';

test('el balance cuenta solo pagos confirmados y conserva centavos', () => {
 const rows = [
  { estado: 'pagado', tipo: 'entrada', importe_ars: 0.1 },
  { estado: 'pagado', tipo: 'entrada', importe_ars: 0.2 },
  { estado: 'pagado', tipo: 'salida', importe_ars: 0.15 },
  { estado: 'pendiente', tipo: 'salida', importe_ars: 9999 },
  { estado: 'anulado', tipo: 'entrada', importe_ars: 9999 },
 ];
 assert.deepEqual(totals(rows), { entrada: 0.3, salida: 0.15, balance: 0.15 });
});
test('el gráfico separa años y meses, incluyendo meses vacíos', () => {
 const rows = [{ estado: 'pagado', tipo: 'entrada', importe_ars: 500, fecha: '2025-12-31' }, { estado: 'pagado', tipo: 'salida', importe_ars: 20, fecha: '2026-01-01' }];
 const months = annualSeries(rows, '2026');
 assert.equal(months.length, 12);
 assert.equal(months[0].balance, -20);
 assert.equal(months[11].balance, 0);
});
test('anticipo, pagos menores, saldo y anulación recalculan la deuda', () => {
 const account = { id: 'a', total: 1000, vencimiento: '2026-10-01' };
 const payment = amount => ({ cobro_id: 'a', estado: 'pagado', importe_ars: amount });
 assert.equal(accountStatus(account, [], '2026-09-01').next, 500);
 assert.equal(accountStatus(account, [payment(200)], '2026-09-01').next, 300);
 assert.equal(accountStatus(account, [payment(500)], '2026-09-01').status, 'Pago parcial');
 assert.equal(accountStatus(account, [payment(500)], '2026-10-02').status, 'Vencido');
 assert.equal(accountStatus(account, [payment(500), payment(500)], '2026-10-02').remaining, 0);
 assert.equal(accountStatus(account, [payment(500), payment(500)], '2026-10-02').status, 'Pagado');
 assert.equal(accountStatus(account, [payment(500), { ...payment(500), estado: 'anulado' }], '2026-09-01').remaining, 500);
 assert.equal(accountStatus({ ...account, total: 100.01 }, [], '2026-09-01').next, 50.01);
});
test('la conversión requiere cotización válida y redondea a centavos', () => {
 assert.equal(toArs(10.99, 'USD', 1234.56), 13567.81);
 assert.equal(toArs(100, 'ARS', null), 100);
 assert.equal(toArs(100, 'USD', null), null);
 assert.equal(toArs(100, 'USD', -1), null);
});
