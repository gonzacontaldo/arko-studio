import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ESTADOS = ['nuevo', 'contactado', 'presupuestado', 'ganado', 'perdido'];
const ESTADO_COLOR = {
  nuevo:         'bg-blue-100 text-blue-700',
  contactado:    'bg-amber-100 text-amber-700',
  presupuestado: 'bg-purple-100 text-purple-700',
  ganado:        'bg-green-100 text-green-700',
  perdido:       'bg-stone-200 text-stone-500',
};

export default function Leads() {
  const [leads, setLeads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', contacto: '', propiedad: '', mensaje: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addLead = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;
    await supabase.from('leads').insert({ ...form, fuente: 'manual' });
    setForm({ nombre: '', contacto: '', propiedad: '', mensaje: '' });
    setShowForm(false);
    load();
  };

  const setEstado = async (id, estado) => {
    await supabase.from('leads').update({ estado }).eq('id', id);
    setLeads(ls => ls.map(l => (l.id === id ? { ...l, estado } : l)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline font-bold text-xl text-on-surface">Leads</h2>
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-sm font-headline font-bold uppercase tracking-widest text-secondary hover:opacity-70"
        >
          {showForm ? 'Cancelar' : '+ Nuevo lead'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addLead} className="grid sm:grid-cols-2 gap-3 mb-6 bg-surface-container-low rounded-xl p-4">
          <input placeholder="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="input" />
          <input placeholder="Contacto (tel/email)" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} className="input" />
          <input placeholder="Propiedad / dirección" value={form.propiedad} onChange={e => setForm({ ...form, propiedad: e.target.value })} className="input" />
          <input placeholder="Mensaje" value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} className="input" />
          <button className="editorial-gradient text-on-secondary font-bold text-sm uppercase tracking-widest py-2.5 rounded-lg sm:col-span-2">Guardar</button>
        </form>
      )}

      {loading ? (
        <p className="text-on-surface-variant text-sm">Cargando…</p>
      ) : leads.length === 0 ? (
        <p className="text-on-surface-variant text-sm">Todavía no hay leads.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant/40">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Contacto</th>
                <th className="py-2 pr-4 font-medium">Propiedad</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.id} className="border-b border-outline-variant/20">
                  <td className="py-3 pr-4 font-medium text-on-surface">{l.nombre}</td>
                  <td className="py-3 pr-4 text-on-surface-variant">{l.contacto}</td>
                  <td className="py-3 pr-4 text-on-surface-variant">{l.propiedad}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={l.estado}
                      onChange={e => setEstado(l.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${ESTADO_COLOR[l.estado] || ''}`}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="py-3 text-on-surface-variant whitespace-nowrap">
                    {new Date(l.created_at).toLocaleDateString('es-AR')}
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
