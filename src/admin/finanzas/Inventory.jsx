import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { costServiceId, groupedServices } from './serviceGroups';
import { SERVICES } from '../../components/pricingData';
import { Field } from './FinanceEditor';
import { dateLabel, today } from './model';

const usd = value => `USD ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
const TYPES = { camara: 'Cámara', lente: 'Lente', dron: 'Dron', soporte: 'Trípode / monopod / gimbal', almacenamiento: 'Almacenamiento', accesorio: 'Accesorio', otro: 'Otro' };
const USES = [...groupedServices(SERVICES), { id: 'dron', name: 'Fotografía / video aéreo' }, { id: 'general', name: 'Uso general del estudio' }];
const serviceName = id => USES.find(s => s.id === costServiceId(id))?.name || id;

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('activos');
  const [service, setService] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = [];
      for (let start = 0; ; start += 1000) {
        const result = await supabase.from('fin_equipos').select('*').order('id').range(start, start + 999);
        if (result.error) throw result.error;
        items.push(...result.data);
        if (result.data.length < 1000) break;
      }
      setRows(items.sort((a, b) => a.nombre.localeCompare(b.nombre)));
    } catch (err) { setError(err); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const active = rows.filter(r => r.activo);
  const total = items => items.reduce((sum, r) => sum + Math.round(Number(r.valor_usd) * 100), 0) / 100;
  const shown = rows.filter(r => (status === 'todos' || r.activo === (status === 'activos')) && (!service || r.servicios.some(id => costServiceId(id) === service)) && `${r.nombre} ${r.uso} ${r.notas}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const missing = error && ['PGRST205', '42P01'].includes(error.code);
  return <>
    <div className="fin-heading"><div><h3>Inventario de equipos</h3><p className="fin-muted">Tu inversión en dólares y los servicios para los que usás cada equipo.</p></div><button className="fin-button fin-primary" disabled={loading || !!error} onClick={() => setEditor({})}>+ Añadir equipo</button></div>
    {loading ? <div className="fin-empty">Cargando inventario…</div> : error ? <div className="fin-empty" role="alert"><h3>{missing ? 'Falta activar el inventario' : 'No se pudo cargar el inventario'}</h3><p className="mt-2">{missing ? 'Ejecutá supabase/13_inventario.sql en el SQL Editor de Supabase y volvé a intentar.' : 'Revisá la conexión e intentá nuevamente.'}</p><button className="fin-button mt-4" onClick={load}>Reintentar</button></div> : <>
      <div className="fin-stats mb-5">{[['Equipos activos', active.length, 'Disponibles para tus producciones'], ['Inversión en equipos activos', usd(total(active)), 'Valor de compra cargado en USD'], ['Inversión histórica total', usd(total(rows)), 'Incluye equipos archivados']].map(([label, value, hint]) => <div className="fin-stat" key={label}><p>{label}</p><strong>{value}</strong><span>{hint}</span></div>)}</div>
      <p className="fin-note mb-5">Cargá el valor que invertiste en USD. Si compraste en pesos, usá el equivalente de la fecha de compra. Registrar un equipo no genera un gasto ni asigna recuperaciones de cobros.</p>
      <div className="fin-toolbar"><input className="input sm:!w-auto" aria-label="Buscar equipo" placeholder="Buscar equipo o uso…" value={search} onChange={e => setSearch(e.target.value)} /><select className="input sm:!w-auto" aria-label="Filtrar por servicio" value={service} onChange={e => setService(e.target.value)}><option value="">Todos los servicios</option>{USES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select><select className="input sm:!w-auto" aria-label="Filtrar equipos por estado" value={status} onChange={e => setStatus(e.target.value)}><option value="activos">Activos</option><option value="archivados">Archivados</option><option value="todos">Todos los equipos</option></select></div>
      {!shown.length ? <div className="fin-empty">{!rows.length ? 'Añadí tu cámara, lentes, dron y demás equipos para empezar.' : 'No hay equipos que coincidan con estos filtros.'}</div> : <div className="overflow-x-auto"><table className="fin-table"><thead><tr><th>Equipo</th><th>Inversión USD</th><th>Servicios / uso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{shown.map(r => <tr key={r.id}><td><strong>{r.nombre}</strong><p className="fin-muted">{TYPES[r.categoria]}{r.fecha_compra && ` · ${dateLabel(r.fecha_compra)}`}</p></td><td className="whitespace-nowrap">{usd(r.valor_usd)}</td><td><p>{[...new Set(r.servicios.map(serviceName))].join(' · ') || 'Sin servicios asignados'}</p>{r.uso && <p className="fin-muted whitespace-pre-wrap">{r.uso}</p>}</td><td><span className="fin-badge">{r.activo ? 'Activo' : 'Archivado'}</span></td><td><button className="fin-link" aria-label={`Editar ${r.nombre}`} onClick={() => setEditor(r)}>Editar</button></td></tr>)}</tbody></table></div>}
    </>}
    {editor && <EquipmentEditor value={editor} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); load(); }} />}
  </>;
}

function EquipmentEditor({ value, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: '', categoria: 'camara', valor_usd: '', fecha_compra: '', uso: '', notas: '', activo: true, ...value, servicios: [...new Set((value.servicios || []).map(costServiceId))] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef(null);
  const requestId = useRef(value.id || crypto.randomUUID());
  useEffect(() => { dialog.current.showModal(); }, []);
  const set = patch => setForm(f => ({ ...f, ...patch }));
  const save = async event => {
    event.preventDefault(); if (saving) return;
    setError('');
    if (!form.nombre.trim() || !Number.isFinite(Number(form.valor_usd)) || Number(form.valor_usd) <= 0) { setError('Ingresá un nombre y una inversión en USD mayor que cero.'); return; }
    if (form.fecha_compra && form.fecha_compra > today()) { setError('La compra no puede tener una fecha futura.'); return; }
    const payload = { nombre: form.nombre.trim(), categoria: form.categoria, valor_usd: Number(form.valor_usd), fecha_compra: form.fecha_compra || null, servicios: form.servicios, uso: form.uso.trim(), notas: form.notas.trim(), activo: form.activo };
    setSaving(true);
    try {
      const result = value.id ? await supabase.from('fin_equipos').update(payload).eq('id', value.id).select('id').single() : await supabase.from('fin_equipos').insert({ ...payload, id: requestId.current }).select('id').single();
      if (result.error) throw result.error;
      onSaved();
    } catch (err) { setError(err.message || 'No se pudo guardar el equipo. Intentá nuevamente.'); }
    finally { setSaving(false); }
  };
  return <dialog ref={dialog} className="fin-dialog" aria-labelledby="equipment-title" onCancel={e => { e.preventDefault(); if (!saving) onClose(); }}><form onSubmit={save}>
    <div className="flex justify-between items-center mb-6"><h3 id="equipment-title" className="font-headline font-bold text-xl">{value.id ? 'Editar equipo' : 'Añadir equipo'}</h3><button className="fin-icon" type="button" aria-label="Cerrar" disabled={saving} onClick={onClose}>×</button></div>
    <fieldset disabled={saving} className="grid sm:grid-cols-2 gap-4">
      <Field label="Nombre / marca / modelo" wide><input className="input" required maxLength={200} value={form.nombre} onChange={e => set({ nombre: e.target.value })} placeholder="Ej. Cámara Sony + modelo" /></Field>
      <Field label="Tipo de equipo"><select className="input" value={form.categoria} onChange={e => set({ categoria: e.target.value })}>{Object.entries(TYPES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field>
      <Field label="Valor invertido en USD"><input className="input" type="number" min="0.01" max="999999999999.99" step="0.01" required value={form.valor_usd} onChange={e => set({ valor_usd: e.target.value })} /></Field>
      <Field label="Fecha de compra (opcional)"><input className="input" type="date" max={today()} value={form.fecha_compra || ''} onChange={e => set({ fecha_compra: e.target.value })} /></Field>
      <Field label="Estado"><select className="input" value={String(form.activo)} onChange={e => set({ activo: e.target.value === 'true' })}><option value="true">Activo</option><option value="false">Archivado</option></select></Field>
      <fieldset className="sm:col-span-2 fin-note"><legend className="font-semibold">¿Para qué servicios lo usás?</legend><div className="grid sm:grid-cols-2 gap-3 mt-2">{USES.map(s => <label className="flex items-center gap-2" key={s.id}><input type="checkbox" checked={form.servicios.includes(s.id)} onChange={e => set({ servicios: e.target.checked ? [...form.servicios, s.id] : form.servicios.filter(id => id !== s.id) })} />{s.name}</label>)}</div></fieldset>
      <Field label="Uso específico (opcional)" wide><textarea className="input" rows={2} maxLength={2000} value={form.uso} onChange={e => set({ uso: e.target.value })} placeholder="Ej. Gran angular para interiores; también lo uso para video." /></Field>
      <Field label="Notas (opcional)" wide><textarea className="input" rows={2} maxLength={2000} value={form.notas} onChange={e => set({ notas: e.target.value })} placeholder="Número de serie, proveedor, garantía…" /></Field>
      <p className="fin-muted sm:col-span-2">Podés cargar cada lente por separado. Archivá los equipos que ya no usás para conservar la inversión histórica.</p>
    </fieldset>
    {error && <p className="text-error text-sm mt-4" role="alert">{error}</p>}
    <div className="flex justify-end gap-3 mt-6"><button className="fin-button" type="button" disabled={saving} onClick={onClose}>Cancelar</button><button className="fin-button fin-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar equipo'}</button></div>
  </form></dialog>;
}
