import { supabase } from './supabase';
import { portfolioItems } from '../data/portfolioItems';

// Etiquetas de cada tipo de video para el modal público.
export const VIDEO_LABELS = {
  horizontal: 'Video',
  reel:       'Reel',
  vertical:   'Vertical',
  fpv:        'FPV',
};

// Normaliza una fila de la base (producciones) al shape que usan los componentes.
function fromRow(r) {
  const videos = [];
  if (r.video_horizontal) videos.push({ kind: 'horizontal', id: r.video_horizontal });
  if (r.video_reel)       videos.push({ kind: 'reel',       id: r.video_reel });
  if (r.video_vertical)   videos.push({ kind: 'vertical',   id: r.video_vertical });
  if (r.video_fpv)        videos.push({ kind: 'fpv',        id: r.video_fpv });

  const types = [];
  if (r.fotos?.length)          types.push('foto');
  if (videos.length)            types.push('video');
  if (r.tour_url)               types.push('tour');
  if (r.es_dron || r.video_fpv) types.push('dron');

  return {
    id: r.id,
    title: r.titulo,
    cover: r.cover,
    fotos: r.fotos || [],
    tourUrl: r.tour_url,
    videos,
    types,
    destacado: r.destacado,
  };
}

// Normaliza un item del portfolio estático (fallback) al mismo shape.
function fromStatic(it) {
  const videos = it.videoId
    ? [{ kind: it.vertical ? 'vertical' : 'horizontal', id: it.videoId }]
    : [];
  return {
    id: it.id,
    title: it.title,
    cover: it.cover,
    fotos: it.fotos || [],
    tourUrl: it.tourUrl,
    videos,
    types: it.types || [],
    destacado: !!it.featured,
  };
}

// Trae la propiedad marcada como "ficha de ejemplo" (es_ejemplo=true).
// Devuelve el shape que usa la página /ejemplo, o null si no hay ninguna.
export async function fetchEjemplo() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('producciones')
      .select('id,titulo,cover,fotos,video_horizontal,video_reel,video_vertical,video_fpv,tour_url,es_dron,ficha_precio,ficha_ubicacion,ficha_descripcion,ficha_specs')
      .eq('es_ejemplo', true)
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const base = fromRow(data);
    return {
      ...base,
      precio: data.ficha_precio || null,
      ubicacion: data.ficha_ubicacion || null,
      descripcion: data.ficha_descripcion || null,
      specs: data.ficha_specs || null,
    };
  } catch {
    return null;
  }
}

// Trae el portfolio publicado desde Supabase. Si la base no está lista o está
// vacía, cae al portfolio estático — así la landing nunca queda sin contenido.
export async function fetchPortfolio() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('producciones')
        .select('id,created_at,titulo,cover,fotos,video_horizontal,video_reel,video_vertical,video_fpv,tour_url,es_dron,destacado,orden')
        .eq('publicado', true)
        .order('orden', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (!error && data && data.length) return data.map(fromRow);
    } catch { /* cae al fallback */ }
  }
  return portfolioItems.map(fromStatic);
}
