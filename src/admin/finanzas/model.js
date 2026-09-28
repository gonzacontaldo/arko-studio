export const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(value || 0);
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const dateLabel = value => value ? new Intl.DateTimeFormat('es-AR').format(new Date(`${value}T12:00:00`)) : 'Sin fecha';
export const cents = value => Math.round((Number(value) + Number.EPSILON) * 100);
export function toArs(amount, currency, rate) {
  if (currency === 'USD' && !(Number(rate) > 0)) return null;
  return Math.round((Number(amount) * (currency === 'USD' ? Number(rate) : 1) + Number.EPSILON) * 100) / 100;
}
export function totals(rows) {
  const paid = rows.filter(r => r.estado === 'pagado');
  const entrada = paid.filter(r => r.tipo === 'entrada').reduce((s, r) => s + cents(r.importe_ars), 0);
  const salida = paid.filter(r => r.tipo === 'salida').reduce((s, r) => s + cents(r.importe_ars), 0);
  return { entrada: entrada / 100, salida: salida / 100, balance: (entrada - salida) / 100 };
}
export function accountStatus(account, movements, now = today()) {
  const paid = movements.filter(r => r.cobro_id === account.id && r.estado === 'pagado').reduce((s, r) => s + cents(r.importe_ars), 0);
  const total = cents(account.total);
  const remaining = Math.max(0, total - paid);
  return {
    paid: paid / 100, remaining: remaining / 100,
    next: Math.min(remaining, paid < Math.round(total / 2) ? Math.round(total / 2) - paid : remaining) / 100,
    status: remaining === 0 ? 'Pagado' : account.vencimiento && account.vencimiento < now ? 'Vencido' : paid > 0 ? 'Pago parcial' : 'Pendiente',
  };
}
export const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
export const METHODS = { efectivo: 'Efectivo', mercado_pago: 'Mercado Pago', transferencia: 'Transferencia' };
export function annualSeries(rows, year) {
  return MONTHS.map((label, index) => ({ label, ...totals(rows.filter(r => r.fecha.startsWith(`${year}-${String(index + 1).padStart(2, '0')}`))) }));
}
