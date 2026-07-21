// Genera supabase/04_seed_portfolio.sql a partir de las 14 propiedades actuales.
// Lee los archivos reales de public/portfolio-web/<carpeta> para armar las fotos.
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Metadata de cada propiedad (título, videos, tour, flags). folder = carpeta en public/portfolio-web.
// vertical:true → el videoId es un reel/vertical; si no, es horizontal.
const META = [
  { folder: 'Virazon',            titulo: 'Casa Al Lago - Virazón',              videoId: 'ni3x6uBh2ZA', vertical: false, tourUrl: 'https://doormann.viewin360.co/share/collection/7MSq5?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es', dron: true,  destacado: true  },
  { folder: 'PuertasDelNorte113', titulo: 'Oficina - Puerta Norte',              videoId: '_I57bl9c1R4', vertical: true,  tourUrl: 'https://doormann.viewin360.co/share/collection/7MyD4?logo=1&card=1&info=1&logosize=74&fs=1&vr=0&zoom=1&thumbs=1&inst=es', dron: false, destacado: false },
  { folder: 'PuertasDelNorte115', titulo: 'Oficina - Puerta Norte',              videoId: 'LAEQEEsiOVg', vertical: false, tourUrl: 'https://doormann.viewin360.co/share/collection/7Myx8?logo=bWVkaWEvNTk0MjM5LzZhMTgtNDQ2NC00ZjJkLTk0NzUucG5n&info=0&logosize=112&fs=1&vr=0&zoom=1&autopalt=1&thumbs=1&inst=es', dron: false, destacado: false },
  { folder: 'PuertasDelNorte120', titulo: 'Oficina - Puerta Norte',              videoId: 'biaLcqhvHcU', vertical: false, tourUrl: null, dron: false, destacado: false },
  { folder: 'DuplexOlivos',       titulo: 'Duplex - Olivos',                     videoId: 'UjWrEYrJnhU', vertical: true,  tourUrl: 'https://kuula.co/share/collection/7Mzql?logo=bWVkaWEvNTk0MjM5LzZhMTgtNDQ2NC00ZjJkLTk0NzUucG5n&info=0&logosize=112&fs=1&vr=0&zoom=1&autorotate=0.08&autop=5&autopalt=1&thumbs=1&inst=es', dron: true,  destacado: false },
  { folder: 'Terrazas3erPiso',    titulo: 'Departamento - Terrazas Santa Maria', videoId: '97-TMfc--qc', vertical: false, tourUrl: 'https://kuula.co/share/collection/7MBrd?logo=bWVkaWEvNTk0MjM5LzZhMTgtNDQ2NC00ZjJkLTk0NzUucG5n&info=0&logosize=112&fs=1&vr=0&zoom=1&autorotate=0.08&autop=5&autopalt=1&thumbs=1&inst=', dron: true,  destacado: false },
  { folder: 'SantaAna195',        titulo: 'Casa - Santa Ana a la Laguna',        videoId: '6y7ZG6t-P3U', vertical: false, tourUrl: 'https://kuula.co/share/collection/71Y1x?logo=bWVkaWEvNTk0MjM5LzZhMTgtNDQ2NC00ZjJkLTk0NzUucG5n&info=0&logosize=112&fs=1&vr=0&zoom=1&autorotate=0.08&autop=5&autopalt=1&thumbs=1&inst=es', dron: true,  destacado: true  },
  { folder: 'Civis',              titulo: 'Complejo - Civis',                    videoId: '9pBvgShBwUA', vertical: false, tourUrl: 'https://doormann.viewin360.co/share/Lvzly?logo=1&card=1&info=1&logosize=74&fs=1&vr=0&zoom=1&thumbs=1&inst=es', dron: true,  destacado: false },
  { folder: 'PuertasDelNorte525', titulo: 'Oficina - Puerta Norte',              videoId: 'GhFOs5FXXLA', vertical: false, tourUrl: 'https://doormann.viewin360.co/share/collection/7T7sy?logo=1&card=1&info=1&logosize=74&fs=1&vr=0&zoom=1&thumbs=1&inst=es', dron: true,  destacado: false },
  { folder: 'SantaAnaPerimetral', titulo: 'Santa Ana — 3 Dormitorios',           videoId: null,          vertical: false, tourUrl: 'https://doormann.viewin360.co/share/collection/7156d?logo=1&card=1&info=1&logosize=74&fs=1&vr=0&zoom=1&thumbs=1&inst=es', dron: true,  destacado: false },
  { folder: 'carpinchos352',      titulo: 'Casa - Carpinchos',                   videoId: 'sWd10K4Mu_Y', vertical: false, tourUrl: 'https://doormann.viewin360.co/share/collection/7T9YC?logo=1&info=0&logosize=112&fs=1&vr=0&zoom=1&autopalt=1&thumbs=1&inst=es', dron: true,  destacado: true  },
  { folder: 'Lote',               titulo: 'Lote - Carpinchos',                   videoId: 'z5cWA53iPu0', vertical: true,  tourUrl: null, dron: true,  destacado: false },
  { folder: 'DeptoTigre',         titulo: 'Departamento - Tigre',                videoId: 'SAIckW_n0g0', vertical: true,  tourUrl: 'https://doormann.viewin360.co/share/collection/7TqHH?logo=bWVkaWEvNTk0MjM5LzZhMTgtNDQ2NC00ZjJkLTk0NzUucG5n&info=0&logosize=112&fs=1&vr=0&zoom=1&autopalt=1&thumbs=1&inst=es', dron: true, destacado: false },
  { folder: 'Yacht',              titulo: 'Yacht - Construccion',                videoId: 'yuDUyYOf9p0', vertical: false, tourUrl: null, dron: true,  destacado: false },
];

const BASE = 'public/portfolio-web';
const sqlEsc = (s) => s === null || s === undefined ? 'null' : `'${String(s).replace(/'/g, "''")}'`;
const arrEsc = (arr) => `array[${arr.map(u => sqlEsc(u)).join(', ')}]::text[]`;

// Orden de fotos: Portada primero, después Foto1, Foto2, …
function fotosDe(folder) {
  const files = readdirSync(join(BASE, folder)).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  files.sort((a, b) => {
    const rank = (n) => /portada/i.test(n) ? -1 : (parseInt(n.match(/\d+/)?.[0] ?? '999', 10));
    return rank(a) - rank(b);
  });
  return files.map(f => `/portfolio-web/${folder}/${f}`);
}

let rows = META.map((m, i) => {
  const fotos = fotosDe(m.folder);
  const cover = fotos[0];
  const vh = !m.vertical && m.videoId ? m.videoId : null;   // horizontal
  const vv = m.vertical && m.videoId ? m.videoId : null;    // vertical/reel
  return `(${sqlEsc(m.titulo)}, ${sqlEsc(m.titulo)}, ${sqlEsc(cover)}, ${arrEsc(fotos)}, ${sqlEsc(vh)}, ${sqlEsc(vv)}, ${sqlEsc(m.tourUrl)}, ${m.dron}, 'terminado', true, ${m.destacado}, ${i})`;
}).join(',\n  ');

const sql = `-- Seed de las 14 propiedades actuales del portfolio (generado por scripts/gen-seed.mjs).
-- Ejecutá DESPUÉS de 03_portfolio.sql. estado 'terminado' y publicado true en todas.
-- Se puede correr una sola vez (si lo corrés de nuevo, duplica). Para reiniciar:
--   delete from public.producciones where fuente_seed = true;   -- (ver columna abajo)

alter table public.producciones add column if not exists fuente_seed boolean not null default false;

insert into public.producciones
  (propiedad, titulo, cover, fotos, video_horizontal, video_vertical, tour_url, es_dron, estado, publicado, destacado, orden)
values
  ${rows};

update public.producciones set fuente_seed = true where fuente_seed = false and titulo is not null;
`;

writeFileSync('supabase/04_seed_portfolio.sql', sql);
console.log('Generado supabase/04_seed_portfolio.sql con', META.length, 'propiedades.');
