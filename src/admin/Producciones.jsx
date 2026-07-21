import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ESTADOS = ['agendado', 'filmado', 'edicion', 'entregado'];
const ESTADO_COLOR = {
  agendado:  'bg-blue-100 text-blue-700',
  filmado:   'bg-amber-100 text-amber-700',
  edicion:   'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
};

export default function Producciones() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ propiedad: '', cliente: '', fecha_sesion: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('producciones').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!form.propiedad.trim()) return;
    await supabase.from('producciones').insert({
      propiedad: form.propiedad,
      cliente: form.cliente,
      fecha_sesion: form.fecha_sesion || null,
    });
    setForm({ propiedad: '', cliente: '', fecha_sesion: '' });
    setShowForm(false);
    load();
  };

  const setEstado = async (id, estado) => {
    await supabase.from('producciones').update({ estado }).eq('id', id);
    setItems(its => its.map(i => (i.id === id ? { ...i, estado } : i)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline font-bold text-xl text-on-surface">Producción</h2>
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-sm font-headline font-bold uppercase tracking-widest text-secondary hover:opacity-70"
        >
          {showForm ? 'Cancelar' : '+ Nuevo trabajo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addItem} className="grid sm:grid-cols-3 gap-3 mb-6 bg-surface-container-low rounded-xl p-4">
          <input placeholder="Propiedad *" value={form.propiedad} onChange={e => setForm({ ...form, propiedad: e.target.value })} className="input" />
          <input placeholder="Cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} className="input" />
          <input type="date" value={form.fecha_sesion} onChange={e => setForm({ ...form, fecha_sesion: e.target.value })} className="input" />
          <button className="editorial-gradient text-on-secondary font-bold text-sm uppercase tracking-widest py-2.5 rounded-lg sm:col-span-3">Guardar</button>
        </form>
      )}

      {loading ? (
        <p className="text-on-surface-variant text-sm">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-on-surface-variant text-sm">Todavía no hay trabajos en producción.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant/40">
                <th className="py-2 pr-4 font-medium">Propiedad</th>
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Sesión</th>
                <th className="py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-b border-outline-variant/20">
                  <td className="py-3 pr-4 font-medium text-on-surface">{i.propiedad}</td>
                  <td className="py-3 pr-4 text-on-surface-variant">{i.cliente}</td>
                  <td className="py-3 pr-4 text-on-surface-variant whitespace-nowrap">
                    {i.fecha_sesion ? new Date(i.fecha_sesion).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="py-3">
                    <select
                      value={i.estado}
                      onChange={e => setEstado(i.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${ESTADO_COLOR[i.estado] || ''}`}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
