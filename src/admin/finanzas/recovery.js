import { costServiceId, groupedConfigs } from './serviceGroups.js';
export function recoveryPlan(equipment, configs, months) {
  if (!Number.isInteger(Number(months)) || Number(months) < 1 || Number(months) > 600) return null;
  const groups = groupedConfigs(configs).filter(c => c.servicio_id !== 'planos');
  const services = groups.map(c => ({ id: c.servicio_id, count: Number(c.trabajos_mes), perJob: 0, monthly: 0, equipment: [] }));
  let invested = 0, recovered = 0, pending = 0, unallocated = 0;
  const rows = equipment.filter(e => e.activo).map(e => {
    const value = Number(e.valor_usd);
    const paid = Math.min(value, Math.max(0, Number(e.recuperado_usd || 0)));
    const remaining = value - paid;
    invested += value; recovered += paid; pending += remaining;
    const linked = services.filter(s => {
      const config = groups.find(c => c.servicio_id === s.id);
      return config.equipos?.includes(e.id) || e.servicios.some(id => costServiceId(id) === s.id);
    });
    const uses = linked.reduce((sum, s) => sum + (s.count > 0 ? s.count : 0), 0);
    const monthly = remaining / Number(months);
    const perUse = uses > 0 ? monthly / uses : null;
    if (uses === 0) unallocated += monthly;
    for (const s of linked) {
      if (s.count <= 0) continue;
      s.perJob += perUse;
      s.monthly += perUse * s.count;
      s.equipment.push({ id: e.id, name: e.nombre, amount: perUse });
    }
    return { id: e.id, name: e.nombre, value, recovered: paid, remaining, monthly, uses, perUse, services: linked.map(s => s.id) };
  });
  return { invested, recovered, pending, monthly: pending / Number(months), unallocated, services, equipment: rows };
}
