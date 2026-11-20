export const VIDEO_IDS = ['cine', 'reel', 'fpv'];
export const costServiceId = id => VIDEO_IDS.includes(id) ? 'cine' : id;
export const costServiceName = service => service.id === 'cine' ? 'Video · cinematográfico, reels y FPV' : service.name;
export function groupedServices(services) {
  const seen = new Set();
  return services.flatMap(service => {
    const id = costServiceId(service.id);
    if (seen.has(id)) return [];
    seen.add(id);
    return [{ ...service, id, name: costServiceName({ ...service, id }) }];
  });
}
export function groupedConfigs(configs) {
  return configs.filter(c => costServiceId(c.servicio_id) === c.servicio_id);
}
export async function financeRows(supabase, table) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from(table).select('*').order(table === 'fin_servicios_config' ? 'servicio_id' : 'id').range(start, start + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}
