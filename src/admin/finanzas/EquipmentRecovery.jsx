import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { financeRows, costServiceName } from './serviceGroups';
import { recoveryPlan } from './recovery';
import { Field } from './FinanceEditor';

const NAMES = { foto: 'Fotografía HDR', tour: 'Tour 360°', cine: costServiceName({ id: 'cine' }), dron: 'Fotografía / video aéreo' };
const usd = value => `USD ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
export default function Recovery() {
  const [data, setData] = useState(null);
  const [months, setMonths] = useState(24);
  const [savedMonths, setSavedMonths] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [equipment, configs, settings] = await Promise.all([financeRows(supabase, 'fin_equipos'), financeRows(supabase, 'fin_servicios_config'), supabase.from('fin_recuperacion_config').select('*').eq('id', 1).maybeSingle()]);
      if (settings.error) throw settings.error;
      setData({ equipment, configs });
      setMonths(settings.data?.plazo_meses ?? 24);
      setSavedMonths(settings.data?.plazo_meses ?? null);
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const plan = data && recoveryPlan(data.equipment, data.configs, months);
  const save = async () => {
    if (!plan || saving) return;
    setSaving(true); setNotice('');
    try {
      const { error } = await supabase.from('fin_recuperacion_config').upsert({ id: 1, plazo_meses: Number(months) }).select('id').single();
      if (error) throw error;
      setSavedMonths(Number(months)); setNotice('Objetivo guardado. No se generaron movimientos ni recuperaciones de cobros.');
    } catch (err) { setNotice(`No se pudo guardar: ${err.message}`); }
    finally { setSaving(false); }
  };
  const missing = error && ['PGRST205', '42P01', '42703'].includes(error.code);
  return <>
    <div className="fin-heading"><div><h3>Recuperación de inversión · USD</h3><p className="fin-muted">Cuánto debería aportar cada servicio para recuperar lo que invertiste en equipos.</p></div></div>
    {loading ? <div className="fin-empty">Cargando inversión…</div> : error ? <div className="fin-empty" role="alert"><h3>{missing ? 'Falta activar la recuperación de equipos' : 'No se pudo cargar la recuperación'}</h3><p>{missing ? 'Ejecutá supabase/16_recuperacion_equipos.sql después de las migraciones anteriores.' : 'Revisá la conexión e intentá nuevamente.'}</p><button className="fin-button mt-4" onClick={load}>Reintentar</button></div> : <>
      <p className="fin-note mb-5">Este es un objetivo de recuperación del dinero invertido. Está separado de tu remuneración, los gastos de cada servicio y los gastos generales de Arko, como Supabase. No representa dinero ya apartado ni descuenta automáticamente cobros.</p>
      <div className="fin-panel mb-5"><div className="fin-toolbar !mt-0"><Field label="Plazo para recuperar el saldo pendiente · meses"><input className="input" type="number" min="1" max="600" step="1" value={months} disabled={saving} onChange={e => { setMonths(e.target.value); setNotice(''); }} /></Field><button className="fin-button fin-primary" disabled={!plan || saving || Number(months) === savedMonths} onClick={save}>{saving ? 'Guardando…' : 'Guardar objetivo'}</button></div><p className="fin-muted">{savedMonths === null ? 'Ejemplo inicial: 24 meses. Todavía no elegiste ni guardaste un plazo.' : Number(months) !== savedMonths ? `Simulación sin guardar. Objetivo guardado: ${savedMonths} meses.` : `Objetivo guardado: recuperar el saldo pendiente en ${savedMonths} meses.`} El plazo se aplica al saldo actual; no calcula meses transcurridos ni garantiza que los precios alcancen.</p>{notice && <p className="fin-note mt-3" role="status">{notice}</p>}</div>
      {!plan ? <p className="fin-empty">Elegí un plazo entero entre 1 y 600 meses.</p> : <>
        <div className="fin-stats mb-5">{[['Inversión activa',plan.invested],['Pendiente de recuperar',plan.pending],['Objetivo mensual',plan.monthly]].map(([label,amount]) => <div className="fin-stat" key={label}><p>{label}</p><strong>{usd(amount)}</strong><span>{label === 'Objetivo mensual' ? `${months} meses de objetivo` : label === 'Pendiente de recuperar' ? `Recuperado manualmente: ${usd(plan.recovered)}` : 'Solo equipos activos; los archivados quedan en Inventario'}</span></div>)}</div>
        <div className="fin-heading"><div><h3>Cuánto reservar por servicio cobrado</h3><p className="fin-muted">Con las cantidades mensuales de Costos por servicio. Video suma cinematográficos, reels y FPV; planos queda en USD 0 por ahora.</p></div></div>
        {!plan.services.length ? <div className="fin-empty">Configurá los servicios y su cantidad mensual para repartir la inversión.</div> : <div className="grid md:grid-cols-2 gap-4 mb-5">{plan.services.map(s => <div className="fin-panel" key={s.id}><h3>{NAMES[s.id] || s.id}</h3><p className="fin-muted">{s.count} servicios / mes</p><div className="fin-list-row"><span>Aporte objetivo por servicio</span><strong>{usd(s.perJob)}</strong></div><div className="fin-list-row"><span>Aporte mensual esperado</span><strong>{usd(s.monthly)}</strong></div><details className="mt-3"><summary className="fin-link cursor-pointer">Ver equipos incluidos</summary>{s.equipment.length ? s.equipment.map(e => <div className="fin-list-row" key={e.id}><span>{e.name}</span><strong>{usd(e.amount)}</strong></div>) : <p className="fin-muted">No hay equipos activos asociados.</p>}</details></div>)}</div>}
        {plan.unallocated > 0 && <p className="fin-note mb-5" role="alert">Falta repartir {usd(plan.unallocated)} por mes: hay equipos pendientes sin un servicio configurado que los use. Vinculalos en Inventario o Costos por servicio.</p>}
        <p className="fin-note mb-5">Cada equipo reparte su objetivo mensual entre todos los usos estimados de los servicios vinculados, contando cada equipo una sola vez por servicio. Los equipos compartidos no se recuperan al 100% en cada categoría. Un pack suma los aportes de sus servicios; dos formatos de video son dos servicios bajo este modelo.</p>
        <div className="overflow-x-auto"><table className="fin-table"><thead><tr><th>Equipo</th><th>Inversión</th><th>Recuperado</th><th>Pendiente</th><th>Objetivo / mes</th><th>Acciones</th></tr></thead><tbody>{plan.equipment.map(e => <tr key={e.id}><td><strong>{e.name}</strong><p className="fin-muted">{e.uses} usos estimados / mes</p></td><td>{usd(e.value)}</td><td>{usd(e.recovered)}</td><td>{usd(e.remaining)}</td><td>{usd(e.monthly)}</td><td><button className="fin-link" onClick={() => setEditor(data.equipment.find(row => row.id === e.id))}>Registrar recuperado · {e.name}</button></td></tr>)}</tbody></table></div>
        <p className="fin-muted mt-3">Registrar recuperado actualiza un total manual por equipo. No crea un cobro ni mueve dinero. Los importes mostrados se redondean a centavos; el reparto se calcula sin redondeos intermedios.</p>
      </>}
    </>}
    {editor && <RecoveredEditor equipment={editor} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); load(); }} />}
  </>;
}
function RecoveredEditor({ equipment, onClose, onSaved }) {
  const [amount, setAmount] = useState(equipment.recuperado_usd || 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  const save = async event => {
    event.preventDefault(); if (saving) return;
    if (amount === '' || !Number.isFinite(Number(amount)) || Number(amount) < 0 || Number(amount) > Number(equipment.valor_usd)) { setError('El total recuperado debe estar entre cero y el valor invertido.'); return; }
    setSaving(true); setError('');
    try {
      const result = await supabase.from('fin_equipos').update({ recuperado_usd: Number(amount) }).eq('id', equipment.id).select('id').single();
      if (result.error) throw result.error;
      onSaved();
    } catch (err) { setError(err.message || 'No se pudo guardar.'); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} className="fin-dialog" aria-labelledby="recovered-title" onCancel={e => { e.preventDefault(); if (!saving) onClose(); }}><form onSubmit={save}><h3 id="recovered-title" className="font-semibold mb-4">Recuperación de {equipment.nombre}</h3><p className="fin-note mb-4">Ingresá el total acumulado que considerás recuperado, no un importe a sumar. Inversión: {usd(equipment.valor_usd)}.</p><Field label="Total recuperado · USD"><input className="input" type="number" min="0" max={equipment.valor_usd} step="0.01" required disabled={saving} value={amount} onChange={e => setAmount(e.target.value)} /></Field>{error && <p className="text-error mt-3" role="alert">{error}</p>}<div className="flex justify-end gap-3 mt-6"><button type="button" className="fin-button" disabled={saving} onClick={onClose}>Cancelar</button><button className="fin-button fin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar total recuperado'}</button></div></form></dialog>;
}
