// Score 0-100 de "chances de que acepten el servicio".
// Se calcula a partir de la metadata que trae OpenClaw del aviso scrapeado.
// Cuanto más necesita el servicio (medios malos) y más puede pagarlo (valor
// alto, zona premium), más alto el score. Si no hay señales, devuelve null.
//
// Campos de metadata usados (todos opcionales):
//   precio (number USD), foto_mala (1-3: 1=malísimas → prospect más caliente),
//   cantidad_fotos (number, fallback si no hay foto_mala),
//   tiene_video (bool), tiene_tour (bool), visitas (number),
//   tiempo_publicado (string, ej "hace 3 meses"), zona (string), tipo (string)

const ZONA_PREMIUM = /nordelta|villanueva|puertos|cardales|pilar|tigre|san isidro|benavidez|bahia|los lagos/i;
const TIPO_PREMIUM = /casa|duplex|desarrollo|complejo|lote|terreno|chacra|quinta/i;

// Convierte "hace 3 meses" / "ayer" / "hace 2 años" a días. null si no parsea.
export function diasDesdeTexto(t) {
  if (t == null) return null;
  const s = String(t).toLowerCase();
  if (/hoy/.test(s)) return 0;
  if (/ayer/.test(s)) return 1;
  const m = s.match(/(\d+)\s*(d[íi]a|semana|mes|a[ñn]o)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const u = m[2];
  if (u.startsWith('d')) return n;
  if (u.startsWith('s')) return n * 7;
  if (u.startsWith('m')) return n * 30;
  return n * 365; // año
}

export function scoreLead(lead) {
  const m = (lead && lead.metadata) || {};
  const dias = diasDesdeTexto(m.tiempo_publicado);
  const hasSignal =
    m.precio != null || m.foto_mala != null || m.cantidad_fotos != null ||
    m.tiene_video != null || m.tiene_tour != null || m.visitas != null || dias != null;
  if (!hasSignal) return null;

  let s = 0;

  // 1. Déficit de medios (0-40) — el driver principal
  //    calidad de fotos: foto_mala 1=malísimas (más caliente) .. 3=aceptables
  if (m.foto_mala != null) {
    if (m.foto_mala <= 1)      s += 18;
    else if (m.foto_mala === 2) s += 10;
    else                        s += 3;
  } else if (m.cantidad_fotos != null) {
    if (m.cantidad_fotos < 5)      s += 15;
    else if (m.cantidad_fotos <= 8) s += 7;
  } else {
    s += 9; // desconocido → déficit parcial
  }
  if (m.tiene_video === false) s += 12;
  if (m.tiene_tour === false)  s += 10;

  // 2. Valor de la propiedad (0-25)
  if (m.precio != null) {
    if (m.precio > 500000)      s += 25;
    else if (m.precio > 300000) s += 18;
    else if (m.precio > 150000) s += 10;
    else                        s += 4;
  } else {
    s += 10;
  }

  // 3. Antigüedad del aviso (0-15) — más viejo, más motivado a probar algo nuevo
  if (dias != null) {
    if (dias > 90)      s += 15;
    else if (dias > 30) s += 8;
    else                s += 3;
  } else {
    s += 6;
  }

  // 4. Bajas visitas (0-10) — el aviso no atrae
  if (m.visitas != null) {
    if (m.visitas < 100)      s += 10;
    else if (m.visitas < 500) s += 5;
  } else {
    s += 4;
  }

  // 5. Zona / tipo premium (0-10) — donde el dron y el video brillan
  const premium = ZONA_PREMIUM.test(m.zona || '') || TIPO_PREMIUM.test(m.tipo || '');
  s += premium ? 10 : 4;

  return Math.max(0, Math.min(100, Math.round(s)));
}

export function scoreColor(score) {
  if (score == null) return 'text-on-surface-variant/50';
  if (score >= 70)   return 'text-green-700 bg-green-100';
  if (score >= 40)   return 'text-amber-700 bg-amber-100';
  return 'text-stone-600 bg-stone-200';
}
