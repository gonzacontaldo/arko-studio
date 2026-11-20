import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { costServiceId, groupedServices } from './serviceGroups';
import { completeCatalog } from '../../components/pricingData';
import { Field } from './FinanceEditor';
import { STAGES, PERIODS, serviceEstimate, validateService, recurringStatus, recurringUsd, allocationUsed } from './serviceCosts';

const usd = n => `USD ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
async function all(table) {
  const rows = [];
  for (let start = 0; ; start += 1000) {
    const { data, error } = await supabase.from(table).select('*').order(table === 'fin_servicios_config' ? 'servicio_id' : 'id').range(start, start + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}
export default function ServiceConfiguration({ quote }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [configs, equipment, recurring, settings] = await Promise.all([all('fin_servicios_config'), all('fin_equipos'), all('fin_recurrentes'), supabase.from('com_settings').select('catalog').eq('id', 1).single()]);
      if (settings.error) throw settings.error;
      const catalog = completeCatalog(settings.data.catalog || {});
      const services = groupedServices(catalog.services);
      if (!services.some(s => s.id === 'dron')) services.push({ id: 'dron', name: 'Fotografía / video aéreo' });
      for (const config of configs) if (costServiceId(config.servicio_id) === config.servicio_id && !services.some(s => s.id === config.servicio_id)) services.push({ id: config.servicio_id, name: `${config.servicio_id} (fuera del catálogo)` });
      setData({ configs, equipment, recurring, services });
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const missing = error && ['PGRST205', '42P01'].includes(error.code);
  return <>
    <div className="fin-heading"><div><h3>Costos y tiempos por servicio</h3><p className="fin-muted">Definí cuánto trabajo lleva cada servicio y qué recursos necesitás.</p></div></div>
    {loading ? <div className="fin-empty">Cargando servicios…</div> : error ? <div className="fin-empty" role="alert"><h3>{missing ? 'Falta activar la configuración de servicios' : 'No se pudieron cargar los servicios'}</h3><p className="mt-2">{missing ? 'Ejecutá supabase/14_costos_servicios.sql después del script de Inventario y volvé a intentar.' : 'Revisá la conexión y los permisos e intentá nuevamente.'}</p>
          <button className="fin-button mt-4" onClick={load}>Reintentar</button></div> : <>
      <p className="fin-note mb-5">Cinematográfico, reels y FPV comparten una sola configuración de Video. La cantidad mensual de Video incluye todos esos formatos. Supabase y otros gastos generales quedan fuera de estos costos. Coordinación y traslado compartidos se registrarán una sola vez por producción. Los costos de equipos se calcularán en la recuperación de inversión; no están incluidos en estos totales.</p>
      <div className="grid md:grid-cols-2 gap-4">{data.services.map(service => {
        const config = data.configs.find(c => c.servicio_id === service.id);
        const estimate = config && serviceEstimate(config, { recurring: data.recurring, rate: quote?.rate });
        if (service.id === 'planos') return <div className="fin-panel" key={service.id}><h3>Planos 2D</h3><span className="fin-badge">Sin costo por ahora</span><p className="fin-muted">Costo considerado: USD 0,00. Excluidos del reparto de recuperación de equipos.</p></div>;
        return <div className="fin-panel" key={service.id}><div className="fin-heading"><h3>{service.name}</h3><span className={`fin-badge ${config ? 'income' : 'pending'}`}>{config ? 'Configurado' : 'Por configurar'}</span></div>
          {config ? <><p className="fin-muted mb-3">{config.alcance}</p><div className="fin-list-row"><span>Tiempo estimado</span><strong>{estimate.minutes} min</strong></div><div className="fin-list-row"><span>Tu trabajo · {usd(config.valor_hora_usd)} / h</span><strong>{usd(estimate.labor)}</strong></div><div className="fin-list-row"><span>Costos directos</span><strong>{usd(estimate.direct)}</strong></div><div className="fin-list-row"><span>Gastos periódicos asignados / trabajo</span><strong>{usd(estimate.allocated)}</strong></div><div className="fin-list-row"><span>Costo estimado / trabajo</span><strong>{estimate.total === null ? 'Pendiente de completar o convertir' : usd(estimate.total)}</strong></div><p className="fin-muted mt-3">Calculado con {config.trabajos_mes} trabajos / mes · {config.equipos.length} equipos asociados. Excluye gastos generales y recuperación de equipos.</p></> : <p className="fin-muted">Cargá tiempos, tu valor hora, costos y equipos para calcular una primera estimación.</p>}
          {estimate?.issues?.map(message => <p role="alert" className="text-error text-sm mt-2" key={message}>{message}</p>)}
          <button className="fin-button mt-4" onClick={() => setEditor({ service, config })}>{config ? 'Editar configuración' : 'Configurar servicio'}</button>
        </div>;
      })}</div>
    </>}
    {editor && <ServiceEditor {...editor} equipment={data.equipment} recurring={data.recurring} configs={data.configs} rate={quote?.rate} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); load(); }} />}
  </>;
}
function ServiceEditor({ service, config, equipment, recurring, configs, rate, onClose, onSaved }) {
  const [form, setForm] = useState(() => config ? { ...config, tiempos: { ...config.tiempos }, costos: config.costos.map(c => ({ ...c })) } : { servicio_id: service.id, alcance: 'Propiedad de hasta 100 m². Un servicio individual.', tiempos: Object.fromEntries(Object.keys(STAGES).map(key => [key, 0])), valor_hora_usd: '', trabajos_mes: '', costos: [], equipos: equipment.filter(e => e.activo && e.servicios.some(id => costServiceId(id) === service.id)).map(e => e.id), notas: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  const set = patch => setForm(f => ({ ...f, ...patch }));
  const estimate = serviceEstimate(form, { recurring, rate });
  const cost = (index, patch) => setForm(f => ({ ...f, costos: f.costos.map((c, i) => i === index ? { ...c, ...patch } : c) }));
  const save = async event => {
    event.preventDefault(); if (saving) return;
    const validation = validateService(form);
    if (validation) { setError(validation); return; }
    if (!form.alcance.trim()) { setError('Describí el alcance de esta estimación.'); return; }
    for (const c of form.costos.filter(c => c.recurrente_id)) {
      if (form.costos.filter(other => other.recurrente_id === c.recurrente_id).length > 1) { setError('El gasto recurrente ya está vinculado a este servicio.'); return; }
      if (allocationUsed(configs, c.recurrente_id, service.id) + Number(c.porcentaje) > 100.00001) { setError('La asignación de un recurrente supera el 100% entre servicios.'); return; }
    }
    setError(''); setSaving(true);
    try {
      const payload = { servicio_id: service.id, alcance: form.alcance.trim(), tiempos: Object.fromEntries(Object.entries(form.tiempos).map(([k, v]) => [k, Number(v)])), valor_hora_usd: Number(form.valor_hora_usd), trabajos_mes: Number(form.trabajos_mes), costos: form.costos.map(c => c.recurrente_id ? { recurrente_id: c.recurrente_id, porcentaje: Number(c.porcentaje) } : { nombre: c.nombre.trim(), importe_usd: Number(c.importe_usd), porcentaje: Number(c.porcentaje), periodo: c.periodo }), equipos: form.equipos, notas: form.notas.trim() };
      const result = await supabase.from('fin_servicios_config').upsert(payload, { onConflict: 'servicio_id' }).select('servicio_id').single();
      if (result.error) throw result.error;
      onSaved();
    } catch (err) { setError(err.message || 'No se pudo guardar la configuración.'); }
    finally { setSaving(false); }
  };
  return <dialog className="fin-dialog fin-service-dialog" ref={dialog} aria-labelledby="service-config-title" onCancel={e => { e.preventDefault(); if (!saving) onClose(); }}><form onSubmit={save}>
    <div className="flex justify-between items-center mb-6"><h3 id="service-config-title" className="font-headline font-bold text-xl">{service.name}</h3><button type="button" className="fin-icon" aria-label="Cerrar" disabled={saving} onClick={onClose}>×</button></div>
    <fieldset disabled={saving} className="grid sm:grid-cols-2 gap-4">
      <Field label="¿Qué incluye esta estimación?" wide><textarea className="input" required maxLength={1000} rows={2} value={form.alcance} onChange={e => set({ alcance: e.target.value })} /></Field>
      <p className="fin-note sm:col-span-2">Ingresá tus minutos de trabajo activo. No incluyas exportaciones que corren solas ni repitas traslados compartidos entre servicios.</p>
      {Object.entries(STAGES).map(([key, name]) => <Field key={key} label={`${name} · minutos`}><input className="input" type="number" min="0" max="100000" step="1" required value={form.tiempos[key]} onChange={e => set({ tiempos: { ...form.tiempos, [key]: e.target.value } })} /></Field>)}
      <Field label="Tu valor hora objetivo · USD"><input className="input" type="number" required min="0.01" max="9999999999.99" step="0.01" value={form.valor_hora_usd} onChange={e => set({ valor_hora_usd: e.target.value })} /></Field>
      <Field label="Trabajos estimados de este servicio / mes"><input className="input" type="number" min="1" max="100000" step="1" required value={form.trabajos_mes} onChange={e => set({ trabajos_mes: e.target.value })} /></Field>
      <div className="sm:col-span-2"><h4 className="font-semibold mb-2">Costos asociados en USD</h4><p className="fin-muted mb-3">Para un gasto compartido, cargá el importe total y el porcentaje que corresponde a este servicio. Repartí el 100% entre los servicios que lo usan. Estos importes son estimaciones y no generan pagos.</p>
        {form.costos.map((c, i) => <fieldset className="fin-cost-item" key={i}><legend className="fin-muted">Costo {i + 1}</legend>{c.recurrente_id ? <>
          {(() => { const row = recurring.find(r => r.id === c.recurrente_id); const used = allocationUsed(configs, c.recurrente_id, service.id); return <><strong>{row?.descripcion || 'Recurrente no disponible'}</strong><p className="fin-muted">{row ? `${row.moneda} ${row.importe} · ${PERIODS[row.frecuencia]}${recurringStatus(row) ? ` · ${recurringStatus(row)} (excluido de la estimación)` : ''}` : 'Revisá el gasto en Recurrentes.'}</p>{row && <p className="fin-muted">Equivalente actual: {recurringUsd(row, rate) === null ? 'Falta cotización' : usd(recurringUsd(row, rate))}</p>}<p className="fin-muted">{used}% asignado a otros servicios. Importe y frecuencia se actualizan desde Recurrentes.</p></>; })()}
          <Field label="Porcentaje asignado al servicio"><input className="input" type="number" required min="0.01" max="100" step="0.01" value={c.porcentaje} onChange={e => cost(i, { porcentaje: e.target.value })} /></Field>
        </> : <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Concepto"><input className="input" required maxLength={200} placeholder="Ej. Kuula / edición externa" value={c.nombre} onChange={e => cost(i, { nombre: e.target.value })} /></Field>
          <Field label="Frecuencia"><select className="input" value={c.periodo} onChange={e => cost(i, { periodo: e.target.value })}>{Object.entries(PERIODS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field>
          <Field label="Importe total · USD"><input className="input" type="number" required min="0.01" max="999999999" step="0.01" value={c.importe_usd} onChange={e => cost(i, { importe_usd: e.target.value })} /></Field>
          <Field label="Porcentaje asignado al servicio"><input className="input" type="number" required min="0.01" max="100" step="0.01" value={c.porcentaje} onChange={e => cost(i, { porcentaje: e.target.value })} /></Field>
        </div>}<button type="button" className="fin-link mt-3" onClick={() => set({ costos: form.costos.filter((_, index) => index !== i) })}>Quitar costo {i + 1}</button></fieldset>)}
        <Field label="Usar un gasto de Recurrentes"><select className="input mb-3" value="" disabled={form.costos.length >= 100} onChange={e => { if (e.target.value) set({ costos: [...form.costos, { recurrente_id: e.target.value, porcentaje: Math.max(0.01, 100 - allocationUsed(configs, e.target.value, service.id)) }] }); }}><option value="">Elegir gasto existente…</option>{recurring.filter(r => !form.costos.some(c => c.recurrente_id === r.id)).map(r => { const used = allocationUsed(configs, r.id, service.id); return <option key={r.id} value={r.id} disabled={used >= 100}>{r.descripcion} · {r.moneda} {r.importe} · {PERIODS[r.frecuencia]}{used >= 100 ? ' · 100% asignado' : ''}{recurringStatus(r) ? ` · ${recurringStatus(r)}` : ''}</option>; })}</select></Field>
        <p className="fin-muted mb-3">Los recurrentes en pesos se convierten a USD con el dólar oficial venta mostrado en Finanzas. Es una estimación actual. Si ya cargaste una copia manual de este gasto, quitala para evitar contarlo dos veces.</p>
        <button type="button" className="fin-button" disabled={form.costos.length >= 100} onClick={() => set({ costos: [...form.costos, { nombre: '', periodo: 'trabajo', importe_usd: '', porcentaje: 100 }] })}>+ Añadir costo manual</button>
      </div>
      <fieldset className="sm:col-span-2 fin-note"><legend className="font-semibold">Equipos que usás</legend><p className="fin-muted mb-3">Se vinculan con el inventario. Su inversión todavía no se suma al costo estimado.</p><div className="grid sm:grid-cols-2 gap-3">{equipment.filter(e => e.activo || form.equipos.includes(e.id)).map(e => <label key={e.id} className="flex items-center gap-2"><input type="checkbox" checked={form.equipos.includes(e.id)} onChange={event => set({ equipos: event.target.checked ? [...form.equipos, e.id] : form.equipos.filter(id => id !== e.id) })} />{e.nombre}{!e.activo && ' (archivado)'}</label>)}</div>{!equipment.some(e => e.activo) && <p className="fin-muted">Podés añadir equipos desde Inventario y vincularlos después.</p>}</fieldset>
      <Field label="Notas (opcional)" wide><textarea className="input" rows={2} maxLength={2000} value={form.notas} onChange={e => set({ notas: e.target.value })} /></Field>
    </fieldset>
    <div className="fin-note mt-5" aria-live="polite"><strong>Estimación por trabajo</strong><p>{estimate.minutes} min · Tu trabajo: {usd(estimate.labor)} · Costos directos: {usd(estimate.direct)}</p><p>Gastos periódicos asignados: {estimate.allocated === null ? 'Completá trabajos / mes' : usd(estimate.allocated)}</p>{estimate.issues?.map(message => <p className="text-error" key={message}>{message}</p>)}<p className="font-semibold mt-2">Total: {estimate.total === null ? 'Pendiente de completar o convertir' : usd(estimate.total)}</p><p>Excluye gastos generales, traslados compartidos y recuperación de equipos. Tu valor hora representa remuneración objetivo, no un retiro realizado.</p></div>
    {error && <p className="text-error text-sm mt-4" role="alert">{error}</p>}
    <div className="flex justify-end gap-3 mt-6"><button type="button" className="fin-button" disabled={saving} onClick={onClose}>Cancelar</button><button className="fin-button fin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar configuración'}</button></div>
  </form></dialog>;
}
