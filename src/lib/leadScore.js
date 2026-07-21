// Score 0-100 de "chances de que acepten el servicio".
// Se calcula a partir de la metadata que trae OpenClaw del aviso scrapeado.
// Cuanto más necesita el servicio (pocos medios) y más puede pagarlo (valor
// alto, zona premium), más alto el score. Si no hay señales, devuelve null.
//
// Campos de metadata usados (todos opcionales):
//   precio (number USD), cantidad_fotos (number), tiene_video (bool),
//   tiene_tour (bool), dias_publicado (number), visitas (number),
//   zona (string), tipo (string)

const ZONA_PREMIUM = /nordelta|villanueva|puertos|cardales|pilar|tigre|san isidro|bahia|los lagos/i;
const TIPO_PREMIUM = /casa|duplex|desarrollo|complejo|lote|terreno|chacra|quinta/i;

export function scoreLead(lead) {
  const m = (lead && lead.metadata) || {};
  const hasSignal =
    m.precio != null || m.cantidad_fotos != null || m.tiene_video != null ||
    m.tiene_tour != null || m.dias_publicado != null || m.visitas != null;
  if (!hasSignal) return null;

  let s = 0;

  // 1. Déficit de medios (0-40) — el driver principal
  if (m.tiene_video === false) s += 15;
  if (m.tiene_tour === false)  s += 10;
  if (m.cantidad_fotos != null) {
    if (m.cantidad_fotos < 5)      s += 15;
    else if (m.cantidad_fotos <= 8) s += 7;
  } else {
    s += 8; // desconocido → asumimos déficit parcial
  }

  // 2. Valor de la propiedad (0-25)
  if (m.precio != null) {
    if (m.precio > 500000)      s += 25;
    else if (m.precio > 300000) s += 18;
    else if (m.precio > 150000) s += 10;
    else                        s += 4;
  } else {
    s += 10;
  }

  // 3. Tiempo publicado (0-15) — más viejo, más motivado
  if (m.dias_publicado != null) {
    if (m.dias_publicado > 90)      s += 15;
    else if (m.dias_publicado > 30) s += 8;
    else                            s += 3;
  } else {
    s += 6;
  }

  // 4. Bajas visitas (0-10)
  if (m.visitas != null) {
    if (m.visitas < 100)      s += 10;
    else if (m.visitas < 500) s += 5;
  } else {
    s += 4;
  }

  // 5. Zona / tipo premium (0-10)
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
