import { useState } from 'react';
import PropertyModal from './PropertyModal';
import TextLogo from '../assets/TextLogo.png';

// ─── SantaAnaPerimetral ───────────────────────────────────────────────────────
import SantaAnaPortada from '../assets/portfolio/SantaAnaPerimetral/Portada.jpg';
import SantaAnaFoto1   from '../assets/portfolio/SantaAnaPerimetral/Foto1.jpg';
import SantaAnaFoto2   from '../assets/portfolio/SantaAnaPerimetral/Foto2.jpg';
import SantaAnaFoto3   from '../assets/portfolio/SantaAnaPerimetral/Foto3.jpg';
import SantaAnaFoto4   from '../assets/portfolio/SantaAnaPerimetral/Foto4.jpg';
import SantaAnaFoto5   from '../assets/portfolio/SantaAnaPerimetral/Foto5.jpg';

// ─── PuertasDelNorte113 ───────────────────────────────────────────────────────
import PuertasPortada from '../assets/portfolio/PuertasDelNorte113/Portada.jpg';
import PuertasFoto1   from '../assets/portfolio/PuertasDelNorte113/Foto1.jpg';
import PuertasFoto2   from '../assets/portfolio/PuertasDelNorte113/Foto2.jpg';
import PuertasFoto3   from '../assets/portfolio/PuertasDelNorte113/Foto3.jpg';

// ─── PuertasDelNorte113 ───────────────────────────────────────────────────────
import Puertas115Portada from '../assets/portfolio/PuertasDelNorte115/Portada.jpg';
import Puertas115Foto1   from '../assets/portfolio/PuertasDelNorte115/Foto1.jpg';
import Puertas115Foto2   from '../assets/portfolio/PuertasDelNorte115/Foto2.jpg';
import Puertas115Foto3   from '../assets/portfolio/PuertasDelNorte115/Foto3.jpg';

// ─── PuertasDelNorte113 ───────────────────────────────────────────────────────
import OlivosPortada from '../assets/portfolio/DuplexOlivos/Portada.jpg';
import OlivosFoto1 from '../assets/portfolio/DuplexOlivos/Foto1.jpg';
import OlivosFoto2 from '../assets/portfolio/DuplexOlivos/Foto2.jpg';
import OlivosFoto3 from '../assets/portfolio/DuplexOlivos/Foto3.jpg';
import OlivosFoto4 from '../assets/portfolio/DuplexOlivos/Foto4.jpg';
import OlivosFoto5 from '../assets/portfolio/DuplexOlivos/Foto5.jpg';

// ─── Virazon ───────────────────────────────────────────────────────
import VirazonPortada from '../assets/portfolio/Virazon/Portada.jpg';
import VirazonFoto1 from '../assets/portfolio/Virazon/Foto1.jpg';
import VirazonFoto2 from '../assets/portfolio/Virazon/Foto2.jpg';
import VirazonFoto3 from '../assets/portfolio/Virazon/Foto3.jpg'
import VirazonFoto4 from '../assets/portfolio/Virazon/Foto4.jpg';
import VirazonFoto5 from '../assets/portfolio/Virazon/Foto5.jpg';

// ─── Terrazas3erPiso ───────────────────────────────────────────────────────
import TerrazasPortada from '../assets/portfolio/Terrazas3erPiso/Portada.jpg';
import TerrazasFoto1 from '../assets/portfolio/Terrazas3erPiso/Foto1.jpg';
import TerrazasFoto2 from '../assets/portfolio/Terrazas3erPiso/Foto2.jpg';
import TerrazasFoto3 from '../assets/portfolio/Terrazas3erPiso/Foto3.jpg';

// ─── Propiedades ──────────────────────────────────────────────────────────────
// Para agregar una propiedad nueva:
//   1. Importá las fotos: import foto1 from '../assets/portfolio/nombre/foto1.jpg';
//   2. Agregá un objeto al array con el formato de abajo.
//
// types: qué tabs va a tener la propiedad en el modal.
//   'foto' = galería de fotos
//   'video' = video de YouTube
//   'tour'  = tour 360°
//   'dron'  = para el filtro, puede combinarse con cualquiera

const portfolioItems = [
  // ── Ejemplo de propiedad completa (reemplazá con tus datos) ──────────────
  {
    id: 'SantaAnaPerimetral',
    title: 'Santa Ana — 3 Dormitorios',
    cover: SantaAnaPortada,
    fotos: [SantaAnaPortada, SantaAnaFoto1, SantaAnaFoto2, SantaAnaFoto3, SantaAnaFoto4, SantaAnaFoto5],
    tourUrl: 'https://doormann.viewin360.co/share/collection/7156d?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
    types: ['foto', 'tour', 'dron'],
  },
  // {
  //   id: 'Virazon',
  //   title: 'Casa Al Lago - Virazón',
  //   cover: VirazonPortada,
  //   fotos: [VirazonPortada, VirazonFoto1, VirazonFoto2, VirazonFoto3, VirazonFoto4, VirazonFoto5],
  //   videoId: '9ivVAjKi58s',
  //   tourUrl: 'https://doormann.viewin360.co/share/collection/7MSq5?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
  //   types: ['foto', 'video', 'tour', 'dron'],
  // },
  {
    id: 'PuertasDelNorte113',
    title: 'Oficina - Puerta Norte',
    cover: PuertasPortada,
    fotos: [PuertasPortada, PuertasFoto1, PuertasFoto2, PuertasFoto3],
    videoId: '_I57bl9c1R4',
    vertical: true,
    tourUrl: 'https://doormann.viewin360.co/share/collection/7MyD4?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
    types: ['foto', 'video', 'tour'],
  },
  {
    id: 'PuertasDelNorte115',
    title: 'Oficina - Puerta Norte',
    cover: Puertas115Portada,
    fotos: [Puertas115Portada, Puertas115Foto1, Puertas115Foto2, Puertas115Foto3],
    videoId: 'qTd6yig9AMM',
    tourUrl: 'https://doormann.viewin360.co/share/collection/7Myx8?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
    types: ['foto', 'video', 'tour', 'dron'],
  },
  {
    id: 'DuplexOlivos',
    title: 'Duplex - Olivos',
    cover: OlivosPortada,
    fotos: [OlivosPortada, OlivosFoto1, OlivosFoto2, OlivosFoto3, OlivosFoto4, OlivosFoto5],
    videoId: 'UjWrEYrJnhU',
    vertical: true,
    tourUrl: 'https://doormann.viewin360.co/share/collection/7Mzql?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
    types: ['foto', 'video', 'tour', 'dron'],
  },
  
  {
    id: 'Terrazas3erPiso',
    title: 'Departamento - Terrazas Santa Maria',
    cover: TerrazasPortada,
    fotos: [TerrazasPortada, TerrazasFoto1, TerrazasFoto2, TerrazasFoto3],
    videoId: 'pN1s8p24mrQ',
    tourUrl: 'https://doormann.viewin360.co/share/collection/7MBrd?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
    types: ['foto', 'video', 'tour', 'dron'],
  },
  
];

// ─── Filtros ──────────────────────────────────────────────────────────────────

const FILTERS = [
  { label: 'Todo',       value: 'all'  },
  { label: 'Fotografía', value: 'foto' },
  { label: 'Video',      value: 'video'},
  { label: '360°',       value: 'tour' },
  { label: 'Dron',       value: 'dron' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Portfolio() {
  const [activeFilter, setActiveFilter]         = useState('all');
  const [selectedProperty, setSelectedProperty] = useState(null);

  const filtered = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.types.includes(activeFilter));

  return (
    <>
      <section id="portfolio" className="py-24 bg-surface-container-low">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="px-8 mb-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block">Portfolio</span>
            <h2 className="font-headline font-extrabold text-4xl text-locked">Nuestros Trabajos</h2>
          </div>
          <p className="text-on-surface-variant text-sm max-w-sm">
            Una selección de nuestros trabajos más recientes: fotografía, video, tours virtuales y tomas aéreas.
          </p>
        </div>

        {/* ── Tabs de filtro ────────────────────────────────────────────── */}
        <div className="px-8 mb-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={`font-headline font-bold text-xs uppercase tracking-widest px-5 py-2 rounded-full border transition-all duration-200 ${
                  activeFilter === value
                    ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                    : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-secondary hover:text-secondary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grilla ────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="px-8 max-w-7xl mx-auto text-on-surface-variant text-sm text-center py-16">
            No hay propiedades cargadas aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
            {filtered.map((property) => (
              <div
                key={property.id}
                className="group relative aspect-[4/3] overflow-hidden bg-stone-200 cursor-pointer"
                onClick={() => setSelectedProperty(property)}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={property.cover}
                  alt={property.title}
                  loading="lazy"
                />

                {/* Watermark fijo */}
                <img
                  src={TextLogo}
                  alt=""
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10"
                  style={{ width: '60%', maxWidth: '220px', opacity: 0.45, filter: 'brightness(0) invert(1)' }}
                />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-white text-3xl opacity-80">open_in_full</span>
                  {property.title && (
                    <span className="text-white font-headline font-bold text-sm tracking-wide px-4 text-center">
                      {property.title}
                    </span>
                  )}
                  <div className="flex gap-2">
                    {property.types.includes('foto')  && <MediaBadge icon="photo_library" label="Fotos" />}
                    {property.types.includes('video') && <MediaBadge icon="play_circle"   label="Video" />}
                    {property.types.includes('tour')  && <MediaBadge icon="view_in_ar"    label="360°"  />}
                    {property.types.includes('dron')  && <MediaBadge icon="flight"        label="Dron"  />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
}

function MediaBadge({ icon, label }) {
  return (
    <span className="flex items-center gap-1 bg-white/20 text-white text-[10px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </span>
  );
}
