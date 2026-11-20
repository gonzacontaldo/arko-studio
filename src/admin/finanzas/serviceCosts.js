export const STAGES = { preparacion: 'Preparación', captura: 'Captura / relevamiento', edicion: 'Edición / armado', entrega: 'Revisiones y entrega' };
export const PERIODS = { trabajo: 'Por trabajo', mensual: 'Mensual', anual: 'Anual' };
export function recurringStatus(row, now = new Date().toISOString().slice(0, 10)) {
  if (!row.activa) return 'Pausado';
  if (row.inicio > now) return 'Aún no comenzó';
  if (row.fin && row.fin < now) return 'Finalizado';
  if (row.cuotas) {
    const [year, month, day] = row.inicio.split('-').map(Number);
    const last = new Date(Date.UTC(year, month - 1 + (row.cuotas - 1) * (row.frecuencia === 'anual' ? 12 : 1), 1));
    const lastDay = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + 1, 0)).getUTCDate();
    last.setUTCDate(Math.min(day, lastDay));
    // El último período sigue aportando al costo hasta terminar su cobertura.
    const end = new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth() + (row.frecuencia === 'anual' ? 12 : 1), 1));
    if (now >= end.toISOString().slice(0, 10)) return 'Finalizado';
  }
  return '';
}
export function recurringUsd(row, rate) {
  if (row.moneda === 'USD') return Number(row.importe);
  return Number(rate) > 0 ? Number(row.importe) / Number(rate) : null;
}
export function allocationUsed(configs, recurringId, exceptService) {
  return configs.filter(c => c.servicio_id !== exceptService).reduce((sum, c) => sum + (c.costos || []).filter(cost => cost.recurrente_id === recurringId).reduce((n, cost) => n + Number(cost.porcentaje), 0), 0);
}
export function serviceEstimate(config, { recurring = [], rate, now } = {}) {
  const minutes = Object.keys(STAGES).reduce((sum, key) => sum + Number(config.tiempos?.[key] || 0), 0);
  const count = Number(config.trabajos_mes || 0);
  let direct = 0, monthly = 0;
  const issues = [];
  for (const saved of config.costos || []) {
    let cost = saved;
    if (saved.recurrente_id) {
      const row = recurring.find(r => r.id === saved.recurrente_id);
      if (!row) { issues.push('No se encontró un gasto recurrente vinculado.'); continue; }
      if (recurringStatus(row, now)) continue;
      const value = recurringUsd(row, rate);
      if (value === null) { issues.push(`Falta cotización para convertir ${row.descripcion} a USD.`); continue; }
      cost = { importe_usd: value, porcentaje: saved.porcentaje, periodo: row.frecuencia };
    }
    const amount = Number(cost.importe_usd) * Number(cost.porcentaje) / 100;
    if (cost.periodo === 'trabajo') direct += amount;
    else monthly += amount / (cost.periodo === 'anual' ? 12 : 1);
  }
  const labor = minutes / 60 * Number(config.valor_hora_usd || 0);
  const allocated = monthly === 0 ? 0 : count > 0 ? monthly / count : null;
  return { minutes, direct, monthly, labor, allocated, total: allocated === null || issues.length ? null : direct + allocated + labor, ...(issues.length ? { issues } : {}) };
}
export function validateService(config) {
  if (!(Number(config.valor_hora_usd) > 0)) return 'Ingresá el valor en USD que querés cobrar por hora.';
  if (!Number.isInteger(Number(config.trabajos_mes)) || Number(config.trabajos_mes) < 1) return 'Ingresá al menos un trabajo estimado al mes.';
  if (Object.keys(STAGES).some(key => !Number.isFinite(Number(config.tiempos[key])) || Number(config.tiempos[key]) < 0)) return 'Los tiempos deben ser minutos válidos, mayores o iguales a cero.';
  if (serviceEstimate(config).minutes <= 0) return 'Ingresá tiempo estimado para al menos una tarea.';
  if (config.costos.some(c => c.recurrente_id ? !Number.isFinite(Number(c.porcentaje)) || Number(c.porcentaje) <= 0 || Number(c.porcentaje) > 100 : !c.nombre.trim() || !Object.hasOwn(PERIODS, c.periodo) || !Number.isFinite(Number(c.importe_usd)) || Number(c.importe_usd) <= 0 || !Number.isFinite(Number(c.porcentaje)) || Number(c.porcentaje) <= 0 || Number(c.porcentaje) > 100)) return 'Completá cada costo con nombre, importe positivo y una asignación entre 0 y 100%.';
  return '';
}
