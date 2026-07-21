import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const ESTADOS = ['agendado', 'filmado', 'edicion', 'terminado'];
const ESTADO_COLOR = {
  agendado:  'bg-blue-100 text-blue-700',
  filmado:   'bg-amber-100 text-amber-700',
  edicion:   'bg-purple-100 text-purple-700',
  terminado: 'bg-green-100 text-green-700',
};

const VIDEO_FIELDS = [
  { key: 'video_horizontal', label: 'Video Horizontal' },
  { key: 'video_reel',       label: 'Reel' },
  { key: 'video_vertical',   label: 'Video Vertical' },
  { key: 'video_fpv',        label: 'Video FPV' },
];

const EMPTY = {
  titulo: '', cliente_id: '', fecha_sesion: '', estado: 'agendado',
  fotos: [], cover: null,
  video_horizontal: '', video_reel: '', video_vertical: '', video_fpv: '',
  tour_url: '', es_dron: false, destacado: false, publicado: false,
};

export default function Producciones() {
  const [items, setItems]   = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // objeto en edición o null

  // filtros / orden
  const [q, setQ]             = useState('');
  const [estadoF, setEstadoF] = useState('all'); // all | terminado | pendiente
  const [clienteF, setClienteF] = useState('all');
  const [sortDir, setSortDir] = useState('desc'); // por fecha

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      supabase.from('producciones').select('*'),
      supabase.from('clientes').select('id,nombre'),
    ]);
    setItems(p.data || []);
    setClientes(c.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const clienteNombre = useMemo(() => Object.fromEntries(clientes.map(c => [c.id, c.nombre])), [clientes]);

  const setEstado = async (id, estado) => {
    await supabase.from('producciones').update({ estado }).eq('id', id);
    setItems(its => its.map(i => (i.id === id ? { ...i, estado } : i)));
  };

  const view = useMemo(() => {
    let arr = [...items];
    const term = q.trim().toLowerCase();
    if (term) arr = arr.filter(i => `${i.titulo || i.propiedad || ''}`.toLowerCase().includes(term));
    if (estadoF === 'terminado') arr = arr.filter(i => i.estado === 'terminado');
    else if (estadoF === 'pendiente') arr = arr.filter(i => i.estado !== 'terminado');
    if (clienteF !== 'all') arr = arr.filter(i => i.cliente_id === clienteF);
    // Orden por fecha (fecha_sesion; si falta, created_at).
    const fecha = (i) => new Date(i.fecha_sesion || i.created_at).getTime();
    arr.sort((a, b) => sortDir === 'desc' ? fecha(b) - fecha(a) : fecha(a) - fecha(b));
    return arr;
  }, [items, q, estadoF, clienteF, sortDir]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-headline font-bold text-xl text-on-surface">Producción / Portfolio <span className="text-on-surface-variant font-body font-normal text-sm">({view.length})</span></h2>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="text-sm font-headline font-bold uppercase tracking-widest text-secondary hover:opacity-70"
        >
          + Nueva producción
        </button>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input placeholder="Buscar por nombre…" value={q} onChange={e => setQ(e.target.value)} className="input flex-1 min-w-[200px]" />
        <select value={estadoF} onChange={e => setEstadoF(e.target.value)} className="input w-auto">
          <option value="all">Todas</option>
          <option value="pendiente">Sin terminar</option>
          <option value="terminado">Terminadas</option>
        </select>
        <select value={clienteF} onChange={e => setClienteF(e.target.value)} className="input w-auto">
          <option value="all">Todos los clientes</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')} className="input w-auto flex items-center gap-1 cursor-pointer">
          Fecha
          <span className="material-symbols-outlined text-base">{sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>
        </button>
      </div>

      {loading ? (
        <p className="text-on-surface-variant text-sm">Cargando…</p>
      ) : view.length === 0 ? (
        <p className="text-on-surface-variant text-sm">No hay producciones que coincidan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant/40">
                <th className="py-2 pr-4 font-medium">Título</th>
                <th className="py-2 pr-4 font-medium">Cliente</th>
                <th className="py-2 pr-4 font-medium">Fecha</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 pr-4 font-medium">Público</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {view.map(i => (
                <tr key={i.id} className="border-b border-outline-variant/20">
                  <td className="py-3 pr-4 font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      {i.cover && <img src={i.cover} alt="" className="w-10 h-8 object-cover rounded" />}
                      <span>{i.titulo || i.propiedad}</span>
                      {i.destacado && <span className="text-[10px] font-bold uppercase bg-secondary/10 text-secondary rounded-full px-2 py-0.5">home</span>}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-on-surface-variant">{clienteNombre[i.cliente_id] || '—'}</td>
                  <td className="py-3 pr-4 text-on-surface-variant whitespace-nowrap">
                    {i.fecha_sesion ? new Date(i.fecha_sesion + 'T00:00:00').toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={i.estado}
                      onChange={e => setEstado(i.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${ESTADO_COLOR[i.estado] || ''}`}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    {i.publicado
                      ? <span className="text-xs text-green-700">✓ visible</span>
                      : <span className="text-xs text-on-surface-variant/60">oculto</span>}
                  </td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditing({ ...EMPTY, ...i, cliente_id: i.cliente_id || '', fecha_sesion: i.fecha_sesion || '', fotos: i.fotos || [] })} className="text-secondary text-sm font-medium hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Editor
          value={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Editor (modal) ───────────────────────────────────────────────────────────
function Editor({ value, onClose, onSaved }) {
  const [form, setForm]   = useState(value);
  const [clientes, setClientes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!form.id;

  useEffect(() => {
    supabase.from('clientes').select('id,nombre,empresa').order('nombre').then(({ data }) => setClientes(data || []));
  }, []);

  const set = (patch) => setForm(f => ({ ...f, ...patch }));

  const uploadFotos = async (fileList) => {
    setUploading(true);
    const nuevas = [];
    for (const file of Array.from(fileList)) {
      const clean = file.name.replace(/[^\w.-]/g, '_');
      const path = `${crypto.randomUUID()}-${clean}`;
      const { error } = await supabase.storage.from('portfolio').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) { setError('Error subiendo ' + file.name + ': ' + error.message); continue; }
      const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
      nuevas.push(data.publicUrl);
    }
    setUploading(false);
    setForm(f => {
      const fotos = [...f.fotos, ...nuevas];
      return { ...f, fotos, cover: f.cover || fotos[0] || null };
    });
  };

  const removeFoto = (url) => setForm(f => {
    const fotos = f.fotos.filter(u => u !== url);
    return { ...f, fotos, cover: f.cover === url ? (fotos[0] || null) : f.cover };
  });

  const save = async () => {
    if (!form.titulo.trim()) { setError('Poné un título.'); return; }
    setSaving(true); setError('');
    const payload = {
      titulo: form.titulo,
      propiedad: form.titulo,           // requerido por el esquema original
      cliente_id: form.cliente_id || null,
      fecha_sesion: form.fecha_sesion || null,
      estado: form.estado,
      fotos: form.fotos,
      cover: form.cover || form.fotos[0] || null,
      video_horizontal: form.video_horizontal || null,
      video_reel: form.video_reel || null,
      video_vertical: form.video_vertical || null,
      video_fpv: form.video_fpv || null,
      tour_url: form.tour_url || null,
      es_dron: form.es_dron,
      destacado: form.destacado,
      publicado: form.publicado,
    };
    const res = isEdit
      ? await supabase.from('producciones').update(payload).eq('id', form.id)
      : await supabase.from('producciones').insert(payload);
    setSaving(false);
    if (res.error) { setError(res.error.message); return; }
    onSaved();
  };

  const remove = async () => {
    if (!confirm('¿Eliminar esta producción?')) return;
    await supabase.from('producciones').delete().eq('id', form.id);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-on-surface/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-2xl my-8 p-6 md:p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-headline font-bold text-lg text-on-surface">{isEdit ? 'Editar producción' : 'Nueva producción'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <input className="input sm:col-span-2" placeholder="Título *" value={form.titulo} onChange={e => set({ titulo: e.target.value })} />
          <select className="input" value={form.cliente_id || ''} onChange={e => set({ cliente_id: e.target.value })}>
            <option value="">— Sin cliente —</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}{c.empresa ? ` · ${c.empresa}` : ''}</option>)}
          </select>
          <input className="input" type="date" value={form.fecha_sesion || ''} onChange={e => set({ fecha_sesion: e.target.value })} />
          <select className="input sm:col-span-2" value={form.estado} onChange={e => set({ estado: e.target.value })}>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Fotos */}
        <div className="mb-4">
          <label className="block text-xs font-headline uppercase tracking-widest text-on-surface-variant mb-2">Fotos</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.fotos.map(url => (
              <div key={url} className="relative group">
                <img src={url} alt="" className={`w-20 h-16 object-cover rounded border-2 ${form.cover === url ? 'border-secondary' : 'border-transparent'}`} />
                <button onClick={() => set({ cover: url })} title="Marcar como portada" className="absolute bottom-0 left-0 bg-black/60 text-white text-[9px] px-1 rounded-tr">{form.cover === url ? 'portada' : 'portada'}</button>
                <button onClick={() => removeFoto(url)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-white text-xs flex items-center justify-center">×</button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-secondary font-medium cursor-pointer">
            <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
            {uploading ? 'Subiendo…' : 'Agregar fotos'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => uploadFotos(e.target.files)} />
          </label>
        </div>

        {/* Videos */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {VIDEO_FIELDS.map(v => (
            <div key={v.key}>
              <label className="block text-[11px] text-on-surface-variant mb-1">{v.label} <span className="opacity-50">(ID de YouTube)</span></label>
              <input className="input" placeholder="ej: dQw4w9WgXcQ" value={form[v.key] || ''} onChange={e => set({ [v.key]: e.target.value.trim() })} />
            </div>
          ))}
        </div>

        {/* Tour */}
        <div className="mb-4">
          <label className="block text-[11px] text-on-surface-variant mb-1">URL del Tour 360°</label>
          <input className="input" placeholder="https://…" value={form.tour_url || ''} onChange={e => set({ tour_url: e.target.value.trim() })} />
        </div>

        {/* Flags */}
        <div className="flex flex-wrap gap-5 mb-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.es_dron}   onChange={e => set({ es_dron: e.target.checked })} /> Incluye dron</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.destacado} onChange={e => set({ destacado: e.target.checked })} /> Destacar en la home</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.publicado} onChange={e => set({ publicado: e.target.checked })} /> Publicar en el sitio</label>
        </div>

        {error && <p className="text-error text-sm mb-3">{error}</p>}

        <div className="flex items-center justify-between">
          {isEdit
            ? <button onClick={remove} className="text-error text-sm font-medium hover:underline">Eliminar</button>
            : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface">Cancelar</button>
            <button onClick={save} disabled={saving || uploading} className="editorial-gradient text-on-secondary font-bold text-sm uppercase tracking-widest px-6 py-2.5 rounded-lg disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
