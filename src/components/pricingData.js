// Servicios à la carte. base = precio hasta 100 m²; per100 = suma por cada 100 m² adicional.
export const SERVICES = [
  { id: 'foto',   icon: 'photo_camera',   name: 'Fotografía HDR',  desc: 'Interiores y exteriores con edición HDR premium.',        base: 125000, per100: 25000 },
  { id: 'tour',   icon: 'vrpano',         name: 'Tour virtual 360° 4K',  desc: 'Desarrollado en Kuula. Incluye 3 meses de hosting.',      base: 50000,  per100: 25000 },
  { id: 'cine',   icon: 'movie',          name: 'Video cinematográfico', desc: 'Recorrido audiovisual profesional de 1 a 2 minutos.',     base: 125000, per100: 25000 },
  { id: 'fpv',    icon: 'flight_takeoff', name: 'Video FPV',             desc: 'Vuelo inmersivo con drone FPV: recorrido continuo y dinámico.', base: 125000, per100: 25000 },
  { id: 'reel',   icon: 'smartphone',     name: 'Reel para redes',       desc: 'Video vertical de la propiedad para Instagram y TikTok.',      base: 125000, per100: 25000 },
  { id: 'planos', icon: 'architecture',   name: 'Planos 2D',             desc: 'Plano esquemático de la propiedad. Dentro de un pack, a menor precio.', base: 50000, per100: 25000 },
];

export const SERVICE_BY_ID = Object.fromEntries(SERVICES.map(s => [s.id, s]));

// Packs con precio fijo. base = precio hasta 100 m²; per100 = suma por cada 100 m² adicional.
export const PACKS = [
  { id: 'base',      name: 'Base',      tagline: 'Lo esencial para publicar.',            services: ['foto', 'planos', 'tour'],                 base: 175000, per100: 25000 },
  { id: 'destacado', name: 'Destacado', tagline: 'Sumá un video en el formato que elijas.', services: ['foto', 'tour', 'planos'], videos: 1, base: 285000, per100: 50000, highlight: true },
  { id: 'completo',  name: 'Completo',  tagline: 'Mostrá la propiedad con dos formatos de video.', services: ['foto', 'tour', 'planos'], videos: 2, base: 395000, per100: 50000 },
];

export const ADDONS = [
  { name: 'Transición día a noche', desc: 'Edición crepuscular del exterior.', price: 50000 },
  { name: 'Tour en Matterport', desc: 'Genera un modelo 3D interactivo de la propiedad.', price: 50000 },
  { name: 'Participación del broker inmobiliario', desc: 'El broker aparece en el video para presentar la propiedad.', price: 50000 },
];

// Complete older saved catalogs while preserving their configured prices.
export function completeCatalog(saved = {}) {
  const merge = (defaults, rows, key) => defaults.map(row => ({ ...row, ...(rows || []).find(value => value[key] === row[key]) })).concat((rows || []).filter(row => !defaults.some(value => value[key] === row[key])));
  return {
    services: merge(SERVICES, saved.services, 'id'),
    addons: merge(ADDONS, saved.addons, 'name'),
    packs: merge(PACKS, saved.packs, 'id').map(pack => ({ ...pack, services: [...new Set([...(pack.services || []), 'planos', 'tour'])] })),
  };
}
export function addonAvailable(addon, services, videos) {
  return addon.name === 'Tour en Matterport' ? services.includes('tour') : videos.some(id => id === 'cine' || id === 'reel');
}
