import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { scoreLead, scoreColor } from '../lib/leadScore';

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

  // filtros / orden
  const [q, setQ]           = useState('');
  const [estadoF, setEstadoF] = useState('all');
  const [fuenteF, setFuenteF] = useState('all');
  const [sortBy, setSortBy]   = useState('fecha');

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

  const view = useMemo(() => {
    let arr = leads.map(l => ({ ...l, _score: scoreLead(l) }));
    const term = q.trim().toLowerCase();
    if (term) arr = arr.filter(l => `${l.nombre} ${l.propiedad || ''}`.toLowerCase().includes(term));
    if (estadoF !== 'all') arr = arr.filter(l => l.estado === estadoF);
    if (fuenteF !== 'all') arr = arr.filter(l => fuenteF === 'auto' ? l.fuente === 'openclaw' : l.fuente !== 'openclaw');
    const num = (v) => (v == null ? -Infinity : v);
    arr.sort((a, b) => {
      if (sortBy === 'score') return num(b._score) - num(a._score);
      if (sortBy === 'precio') return num(b.metadata?.precio) - num(a.metadata?.precio);
      return new Date(b.created_at) - new Date(a.created_at); // fecha
    });
    return arr;
  }, [leads, q, estadoF, fuenteF, sortBy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline font-bold text-xl text-on-surface">Leads <span className="text-on-surface-variant font-body font-normal text-sm">({view.length})</span></h2>
        <button onClick={() => setShowForm(s => !s)} className="text-sm font-headline font-bold uppercase tracking-widest text-secondary hover:opacity-70">
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

      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input placeholder="Buscar por nombre o propiedad…" value={q} onChange={e => setQ(e.target.value)} className="input flex-1 min-w-[200px]" />
        <select value={estadoF} onChange={e => setEstadoF(e.target.value)} className="input w-auto">
          <option value="all">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={fuenteF} onChange={e => setFuenteF(e.target.value)} className="input w-auto">
          <option value="all">Todas las fuentes</option>
          <option value="auto">Auto (OpenClaw)</option>
          <option value="manual">Manuales</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input w-auto">
          <option value="fecha">Ordenar: fecha</option>
          <option value="score">Ordenar: score</option>
          <option value="precio">Ordenar: precio</option>
        </select>
      </div>

      {loading ? (
        <p className="text-on-surface-variant text-sm">Cargando…</p>
      ) : view.length === 0 ? (
        <p className="text-on-surface-variant text-sm">No hay leads que coincidan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant/40">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Contacto</th>
                <th className="py-2 pr-4 font-medium">Propiedad</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {view.map(l => (
                <tr key={l.id} className="border-b border-outline-variant/20">
                  <td className="py-3 pr-4 font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      {l.nombre}
                      {l.fuente === 'openclaw' && (
                        <span className="text-[10px] font-headline font-bold uppercase tracking-wider bg-secondary/10 text-secondary rounded-full px-2 py-0.5">auto</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-on-surface-variant">{l.contacto}</td>
                  <td className="py-3 pr-4 text-on-surface-variant">
                    {l.url ? (
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline inline-flex items-center gap-1">
                        {l.propiedad || 'Ver aviso'}
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                    ) : (l.propiedad)}
                  </td>
                  <td className="py-3 pr-4">
                    {l._score == null
                      ? <span className="text-on-surface-variant/40 text-xs">—</span>
                      : <span className={`text-xs font-bold rounded-full px-2 py-1 ${scoreColor(l._score)}`}>{l._score}</span>}
                  </td>
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
