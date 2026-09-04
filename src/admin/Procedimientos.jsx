import { useEffect, useMemo, useState } from 'react';
import { marked } from 'marked';
import { supabase } from '../lib/supabase';

const CATEGORIAS = [
  {
    key: 'operaciones',
    label: 'Operaciones',
    servicios: [
      { slug: 'onboarding-cliente', label: 'Onboarding del Cliente' },
      { slug: 'reserva-shooting', label: 'Reserva de Shooting' },
      { slug: 'preparacion-previa', label: 'Preparación Previa al Shooting' },
      { slug: 'preparar-propiedad', label: 'Preparar la Propiedad' },
      { slug: 'llegada-propiedad', label: 'Llegada a la Propiedad' },
      { slug: 'reprogramaciones-cancelaciones', label: 'Reprogramaciones y Cancelaciones' },
      { slug: 'contingencias', label: 'Contingencias' },
    ],
  },

  {
    key: 'produccion',
    label: 'Producción',
    servicios: [
      { slug: 'fotografia-profesional', label: 'Fotografía Profesional' },
      { slug: 'video-cinematografico', label: 'Video Cinematográfico' },
      { slug: 'reel-agente', label: 'Reel con Agente' },
      { slug: 'planos', label: 'Planos' },
      { slug: 'tour-360', label: 'Tour 360°' },
      { slug: 'drone', label: 'Drone' },
    ],
  },

  {
    key: 'postproduccion',
    label: 'Post-Producción',
    servicios: [
      { slug: 'organizacion-archivos', label: 'Organización de Archivos' },
      { slug: 'edicion-fotografia', label: 'Edición de Fotografía' },
      { slug: 'edicion-video', label: 'Edición de Video' },
      { slug: 'edicion-planos', label: 'Edición de Planos' },
      { slug: 'edicion-tour-360', label: 'Edición de Tour 360°' },
      { slug: 'edicion-drone', label: 'Edición de Drone' },
      { slug: 'seleccion-musica', label: 'Selección de Música' },
    ],
  },

  {
    key: 'calidad-entrega',
    label: 'Calidad y Entrega',
    servicios: [
      { slug: 'control-calidad-fotografia', label: 'Control de Calidad — Fotografía' },
      { slug: 'control-calidad-video', label: 'Control de Calidad — Video' },
      { slug: 'control-calidad-general', label: 'Control de Calidad General' },
      { slug: 'entrega-cliente', label: 'Entrega al Cliente' },
      { slug: 'modificaciones-revisiones', label: 'Modificaciones y Revisiones' },
    ],
  },

  {
    key: 'empresa',
    label: 'Empresa',
    servicios: [
      { slug: 'estandar-visual', label: 'Estándar Visual' },
      { slug: 'estandar-servicio', label: 'Estándar de Servicio' },
      { slug: 'equipamiento', label: 'Equipamiento' },
      { slug: 'mantenimiento-equipo', label: 'Mantenimiento del Equipo' },
      { slug: 'presupuestos', label: 'Presupuestos' },
    ],
  },
];

const ALL_SERVICIOS = CATEGORIAS.flatMap(
  c => c.servicios.map(s => ({ ...s, categoria: c.key }))
);

const ALL_SERVICIOS = CATEGORIAS.flatMap(c => c.servicios.map(s => ({ ...s, categoria: c.key })));

export default function Procedimientos() {
  const [guias, setGuias]   = useState({});   // slug → fila
  const [sel, setSel]       = useState(ALL_SERVICIOS[0].slug);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('procedimientos').select('*');
    const map = {};
    (data || []).forEach(r => { map[r.servicio] = r; });
    setGuias(map);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const servicio = ALL_SERVICIOS.find(s => s.slug === sel);
  const guia = guias[sel];

  return (
    <div>
      <h2 className="font-headline font-bold text-xl text-on-surface mb-5">Procedimientos</h2>

      <div className="grid md:grid-cols-[240px_1fr] gap-6">
        {/* Navegación */}
        <nav className="space-y-5">
          {CATEGORIAS.map(cat => (
            <div key={cat.key}>
              <div className="text-[11px] font-headline uppercase tracking-widest text-on-surface-variant mb-2">{cat.label}</div>
              <ul className="space-y-0.5">
                {cat.servicios.map(s => (
                  <li key={s.slug}>
                    <button
                      onClick={() => { setSel(s.slug); setEditing(false); }}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
                        sel === s.slug ? 'bg-secondary/10 text-secondary font-medium' : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span>{s.label}</span>
                      {guias[s.slug]
                        ? <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" title="Tiene guía" />
                        : <span className="w-1.5 h-1.5 rounded-full bg-outline-variant flex-shrink-0" title="Sin guía" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Contenido */}
        <div className="min-w-0">
          {loading ? (
            <p className="text-on-surface-variant text-sm">Cargando…</p>
          ) : editing ? (
            <GuiaEditor
              servicio={servicio}
              guia={guia}
              onCancel={() => setEditing(false)}
              onSaved={() => { setEditing(false); load(); }}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-lg text-on-surface">{guia?.titulo || servicio.label}</h3>
                <button onClick={() => setEditing(true)} className="text-sm font-headline font-bold uppercase tracking-widest text-secondary hover:opacity-70">
                  {guia ? 'Editar' : '+ Crear guía'}
                </button>
              </div>
              {guia?.contenido
                ? <div className="markdown" dangerouslySetInnerHTML={{ __html: marked.parse(guia.contenido) }} />
                : <p className="text-on-surface-variant text-sm">Todavía no hay una guía para <strong>{servicio.label}</strong>. Creá una o subí un archivo .md.</p>}
              {guia?.updated_at && (
                <p className="text-xs text-on-surface-variant/60 mt-6">Última edición: {new Date(guia.updated_at).toLocaleDateString('es-AR')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GuiaEditor({ servicio, guia, onCancel, onSaved }) {
  const [titulo, setTitulo]     = useState(guia?.titulo || servicio.label);
  const [contenido, setContenido] = useState(guia?.contenido || '');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [preview, setPreview]   = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContenido(text);
    if (!guia?.titulo) setTitulo(file.name.replace(/\.md$/i, '') || servicio.label);
  };

  const save = async () => {
    setSaving(true); setError('');
    const payload = {
      categoria: servicio.categoria,
      servicio: servicio.slug,
      titulo,
      contenido,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('procedimientos').upsert(payload, { onConflict: 'servicio' });
    setSaving(false);
    if (error) { setError(error.message); return; }
    onSaved();
  };

  const remove = async () => {
    if (!guia || !confirm('¿Eliminar esta guía?')) return;
    await supabase.from('procedimientos').delete().eq('id', guia.id);
    onSaved();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input className="input flex-1 min-w-[200px]" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la guía" />
        <label className="inline-flex items-center gap-2 text-sm text-secondary font-medium cursor-pointer px-3 py-2 rounded-lg hover:bg-secondary/10">
          <span className="material-symbols-outlined text-lg">upload_file</span>
          Subir .md
          <input type="file" accept=".md,.markdown,text/markdown,text/plain" className="hidden" onChange={onFile} />
        </label>
        <button onClick={() => setPreview(p => !p)} className="text-sm px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface-variant">
          {preview ? 'Editar' : 'Vista previa'}
        </button>
      </div>

      {preview ? (
        <div className="markdown border border-outline-variant/40 rounded-lg p-4 min-h-[300px]" dangerouslySetInnerHTML={{ __html: marked.parse(contenido || '_Nada para previsualizar._') }} />
      ) : (
        <textarea
          className="input font-mono text-xs leading-relaxed"
          style={{ minHeight: '360px' }}
          value={contenido}
          onChange={e => setContenido(e.target.value)}
          placeholder={'# Título\n\n## Paso 1\n- Hacé esto\n- Después esto\n\n## Paso 2\n1. Primero\n2. Segundo'}
        />
      )}

      {error && <p className="text-error text-sm mt-3">{error}</p>}

      <div className="flex items-center justify-between mt-4">
        {guia ? <button onClick={remove} className="text-error text-sm font-medium hover:underline">Eliminar</button> : <span />}
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface">Cancelar</button>
          <button onClick={save} disabled={saving} className="editorial-gradient text-on-secondary font-bold text-sm uppercase tracking-widest px-6 py-2.5 rounded-lg disabled:opacity-50">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
