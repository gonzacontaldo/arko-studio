import { useState } from 'react';
import PortfolioLightbox from './PortfolioLightbox';

// ─── Datos ────────────────────────────────────────────────────────────────────
// category: 'foto' | 'video' | 'tour' | 'dron'
// actions: botones que aparecen en el hover overlay (opcional)

const portfolioItems = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfjVaw9HAi8bHXY-ZAEzhxCN_cXJ5uIOTpDDtSW0JULQXmggxLnFBOfWAfe8Jh7N0wa9TLAFO77xdpSE1PLXylrIj0EmBb6yP83PGVgQBQktfsaIy_FovaV8urwp45eifjxUJ0n8vX1UHNWf6wS4u2_aZtHlNYBkZWGjuLLlmt6uJ70QVBiR6Gmk045_9RybxlgCxOvWN7eFrvrgnKPNwbK_jIH8L2XtxhCAtAADmaMyuw-Elko9RINp5_-_wDIOAPWOe8x0HH0iw',
    alt: 'Casa moderna minimalista con grandes ventanas durante la hora azul',
    category: 'foto',
    actions: ['tour'],
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbcGOoD1nN547lnR0ahgMx4SCJS1_fsTIGaWlF3ttMXNGeQIhiDIo3hgzcceZMR8wmYrN3CpP0W3kPbZTHwSfM_5i2KockTbJ8n1nWEeql08WArR_d-9MN95ukWJLAOYedEzNJdP9pRDMkxj4a5_uqVmXnTYVKTiGO1ztUhL5rRKGy3kyyPKzjuw_wrR2TF8e2ze1mtYEfNChl-4ZJaoyuAzobOojk-qyPxZ4y2crn5BMzxR045oJs6iYa1IX4BRtxgyTOYY89xvc',
    alt: 'Cocina moderna con isla de mármol e iluminación profesional',
    category: 'foto',
    actions: ['video'],
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRd3wJTbkixsBOu90n4AJlXxyjmt6am2Yd3DM3snY1NaT2YlOl_eVuzKgzX0bV3qNqkplHb_Ua-97e6SpI6EoQAICu_sEeapPiHrBPY9eQHJXPPP_fw2m2qxV-ws-zH7ZPE_LrN3d-og8TVav4uwB5vtdikgmrieQPlgvyaqMdJ_X4DE1hMwUf_1ost3y5D-6y3af4VhDtJt9NuBBGZ4IE9_tYJ-RaRdx94jCUXNyigInV0FFdboQHCd1TQAy_fJfwYR3-Z07i1kA',
    alt: 'Baño de lujo con bañadera independiente y ventanal al jardín',
    category: 'tour',
    actions: ['tour'],
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6NbrrO3HlakeiijaX4JiSg3u70ojkkjGfIU9R6hxDCL7eCcb86FuxTV0GgPfQLk2p93NC6xs54DJ20A3M62qMjojYmbKcTAW6oXfylAyZmKVBWfFwpndjCk1X1WQZKue6Jjr2Wshl6AcqBdGb1M5zJ_LO6iIgils1BOyg-G3S8A2knqwsskc6SBtK9jdLKYtY_b9V8VvKbcOlI8y-_aAMPxrx4V3k_INcqqM3Or4HsRmPknIkz5Q-XjFJ6tdHZOa23dMt2a99PsY',
    alt: 'Dormitorio principal con luz natural matutina',
    category: 'video',
    actions: ['video'],
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-eaQOsoNwZHcyTdaoWVtJe5R9zNjGp6SVaRkITtw9DDkwIPP8FNRUpqcjq3VfsfD7o9QXVgItaNZwZi1jAygBqfCJyYMUQQtbOitbSY-kaw8H3os5Pop2FqufwqA0bc6fXXimkn9Wm62_-DkpiLDdDfxct1qipA5eNdWyn4ypt4BiAGHsVmHf3kmgS6FDTY7AQUJm5W4mYsvgFXDvgUgoz3SvjZJsQGfQrO2g2zQeu6pBSx5srNsG-m6IK1eD39u3vtUotedyhPM',
    alt: 'Vista aérea cenital de patio con pileta geométrica y jardín',
    category: 'dron',
    actions: [],
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaYEMiH0cod3dojq_26y7_U4HsBimeHvnFcgudLVYryFdBTnSQvr-ZT8OJvIUcNN3ngyVGGte8uKZJhtvEYfWWr-nsiabZ5md8MP-ueKX1803lSdBjKQeElUupENuTXRFtATzqBFcN41FAr0GhztUi-cceLWEl7VQwmmUIzU1saDXqed36d4VG9OUNBcljkduhHODkiepgj6usBYdfhVhC-VQMhEeD8zcFh5PSDl64FQN7SHsA_bSSl-rDG59avDmgLQ_bQ-URm3U',
    alt: 'Living amplio y luminoso con diseño escandinavo',
    category: 'video',
    actions: ['video'],
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter);

  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length);
  const goNext = () => setLightboxIndex(i => (i + 1) % filtered.length);

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
                onClick={() => { setActiveFilter(value); closeLightbox(); }}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
          {filtered.map((item, i) => (
            <div
              key={item.src}
              className="group relative aspect-[4/3] overflow-hidden bg-stone-200 cursor-zoom-in"
              onClick={() => openLightbox(i)}
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={item.src}
                alt={item.alt}
                loading="lazy"
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                {/* Icono zoom en el centro */}
                <span className="material-symbols-outlined text-white text-3xl opacity-80">zoom_in</span>

                {/* Botones de acción (no propagan el click al lightbox) */}
                {item.actions.length > 0 && (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {item.actions.includes('tour') && (
                      <button className="bg-white text-on-surface px-5 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-secondary hover:text-white transition-colors">
                        Ver Tour
                      </button>
                    )}
                    {item.actions.includes('video') && (
                      <button className="bg-white text-on-surface px-5 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-secondary hover:text-white transition-colors">
                        Ver Video
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Badge de categoría */}
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-on-surface/70 text-white text-[10px] font-headline font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {FILTERS.find(f => f.value === item.category)?.label}
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <PortfolioLightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  );
}
