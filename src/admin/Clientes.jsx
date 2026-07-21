import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const TIPOS = [
  { value: 'directo',      label: 'Dueño directo' },
  { value: 'inmobiliaria', label: 'Inmobiliaria' },
  { value: 'constructora', label: 'Constructora' },
];
const TIPO_LABEL = Object.fromEntries(TIPOS.map(t => [t.value, t.label]));
const TIPO_COLOR = {
  directo:      'bg-blue-100 text-blue-700',
  inmobiliaria: 'bg-purple-100 text-purple-700',
  constructora: 'bg-amber-100 text-amber-700',
};

// Edad a partir de la fecha de nacimiento.
export function edadDe(fecha) {
  if (!fecha) return null;
  const n = new Date(fecha), h = new Date();
  let e = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
  return e;
}
// Días hasta el próximo cumpleaños (0 = hoy).
export function diasHastaCumple(fecha) {
  if (!fecha) return null;
  const n = new Date(fecha), h = new Date();
  const prox = new Date(h.getFullYear(), n.getMonth(), n.getDate());
  if (prox < new Date(h.getFullYear(), h.getMonth(), h.getDate())) prox.setFullYear(h.getFullYear() + 1);
  return Math.round((prox - new Date(h.getFullYear(), h.getMonth(), h.getDate())) / 86400000);
}

const EMPTY = { nombre: '', empresa: '', tipo: 'directo', contacto: '', origen: '', fecha_nacimiento: '', notas: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [counts, setCounts]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('producciones').select('cliente_id'),
    ]);
    const map = {};
    (p.data || []).forEach(r => { if (r.cliente_id) map[r.cliente_id] = (map[r.cliente_id] || 0) + 1; });
    setClientes(c.data || []);
    setCounts(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline font-bold text-xl text-on-surface">Clientes</h2>
        <button onClick={() => setEditing({ ...EMPTY })} className="text-sm font-headline font-bold uppercase tracking-widest text-secondary hover:opacity-70">
          + Nuevo cliente
        </button>
      </div>

      {loading ? (
        <p className="text-on-surface-variant text-sm">Cargando…</p>
      ) : clientes.length === 0 ? (
        <p className="text-on-surface-variant text-sm">Todavía no hay clientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant/40">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Tipo</th>
                <th className="py-2 pr-4 font-medium">Contacto</th>
                <th className="py-2 pr-4 font-medium">Prod.</th>
                <th className="py-2 pr-4 font-medium">Edad</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => {
                const dias = diasHastaCumple(c.fecha_nacimiento);
                const cumpleProximo = dias !== null && dias <= 15;
                return (
                  <tr key={c.id} className="border-b border-outline-variant/20">
                    <td className="py-3 pr-4 font-medium text-on-surface">
                      <div className="flex items-center gap-2">
                        <span>{c.nombre}</span>
                        {c.empresa && <span className="text-xs text-on-surface-variant">· {c.empresa}</span>}
                        {cumpleProximo && <span title={dias === 0 ? '¡Hoy cumple!' : `Cumple en ${dias} días`}>🎂</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium rounded-full px-2 py-1 ${TIPO_COLOR[c.tipo] || ''}`}>{TIPO_LABEL[c.tipo] || c.tipo}</span>
                    </td>
                    <td className="py-3 pr-4 text-on-surface-variant">{c.contacto}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{counts[c.id] || 0}</td>
                    <td className="py-3 pr-4 text-on-surface-variant">{edadDe(c.fecha_nacimiento) ?? '—'}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => setEditing({ ...EMPTY, ...c, fecha_nacimiento: c.fecha_nacimiento || '' })} className="text-secondary text-sm font-medium hover:underline">Editar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && <Editor value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function Editor({ value, onClose, onSaved }) {
  const [form, setForm] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!form.id;
  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.nombre.trim()) { setError('Poné un nombre.'); return; }
    setSaving(true); setError('');
    const payload = {
      nombre: form.nombre, empresa: form.empresa || null, tipo: form.tipo,
      contacto: form.contacto || null, origen: form.origen || null,
      fecha_nacimiento: form.fecha_nacimiento || null, notas: form.notas || null,
    };
    const res = isEdit
      ? await supabase.from('clientes').update(payload).eq('id', form.id)
      : await supabase.from('clientes').insert(payload);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    onSaved();
  };

  const remove = async () => {
    if (!confirm('¿Eliminar este cliente? Sus producciones quedan sin cliente asignado.')) return;
    await supabase.from('clientes').delete().eq('id', form.id);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-on-surface/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-xl bg-surface rounded-2xl shadow-2xl my-8 p-6 md:p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline font-bold text-lg text-on-surface">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <input className="input sm:col-span-2" placeholder="Nombre del dueño / contacto *" value={form.nombre} onChange={e => set({ nombre: e.target.value })} />
          <input className="input" placeholder="Empresa (inmobiliaria / constructora)" value={form.empresa || ''} onChange={e => set({ empresa: e.target.value })} />
          <select className="input" value={form.tipo} onChange={e => set({ tipo: e.target.value })}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input className="input" placeholder="Contacto (tel / email / WhatsApp)" value={form.contacto || ''} onChange={e => set({ contacto: e.target.value })} />
          <input className="input" placeholder="Origen (cómo lo conseguí)" value={form.origen || ''} onChange={e => set({ origen: e.target.value })} />
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-on-surface-variant mb-1">Fecha de nacimiento</label>
            <input className="input" type="date" value={form.fecha_nacimiento || ''} onChange={e => set({ fecha_nacimiento: e.target.value })} />
          </div>
          <textarea className="input sm:col-span-2" rows={3} placeholder="Notas — qué le gusta, cómo tratarlo, detalles personales…" value={form.notas || ''} onChange={e => set({ notas: e.target.value })} />
        </div>

        {error && <p className="text-error text-sm mb-3">{error}</p>}

        <div className="flex items-center justify-between">
          {isEdit ? <button onClick={remove} className="text-error text-sm font-medium hover:underline">Eliminar</button> : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface">Cancelar</button>
            <button onClick={save} disabled={saving} className="editorial-gradient text-on-secondary font-bold text-sm uppercase tracking-widest px-6 py-2.5 rounded-lg disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
