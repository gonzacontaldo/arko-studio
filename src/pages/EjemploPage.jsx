import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';
import PropertyModal from '../components/PropertyModal';

// ─── Contenido real de una propiedad producida por Arko Studio ────────────────
const FOTOS = [
  '/portfolio-web/Virazon/Portada.jpg',
  '/portfolio-web/Virazon/Foto1.jpg',
  '/portfolio-web/Virazon/Foto2.jpg',
  '/portfolio-web/Virazon/Foto3.jpg',
  '/portfolio-web/Virazon/Foto4.jpg',
  '/portfolio-web/Virazon/Foto5.jpg',
];
const VIDEO_ID = 'ni3x6uBh2ZA';
const TOUR_URL = 'https://doormann.viewin360.co/share/collection/7MSq5?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es';
const WHATSAPP = 'https://wa.me/5491144340580?text=Hola%2C%20vi%20la%20ficha%20de%20ejemplo%20y%20quiero%20este%20tipo%20de%20contenido%20para%20mis%20propiedades.';

// Objeto para el lightbox de fotos (reutiliza PropertyModal).
const ejemplo = {
  title: 'Casa al Lago — Virazón',
  cover: FOTOS[0],
  fotos: FOTOS,
  videos: [{ kind: 'horizontal', id: VIDEO_ID }],
  tourUrl: TOUR_URL,
  types: ['foto', 'video', 'tour', 'dron'],
};

const SPECS = [
  { icon: 'bed',           label: '4 dormitorios' },
  { icon: 'bathtub',       label: '4 baños' },
  { icon: 'directions_car', label: '2 cocheras' },
  { icon: 'square_foot',   label: '320 m² cubiertos' },
  { icon: 'crop_landscape', label: 'Lote 850 m²' },
  { icon: 'sailing',       label: 'Amarra propia' },
];

const CARACTERISTICAS = [
  'Piscina desbordante con deck', 'Parrilla y quincho', 'Jardín al lago',
  'Living con doble altura', 'Cocina integrada premium', 'Suite principal con vestidor',
  'Domótica integrada', 'Muelle privado', 'Sistema de seguridad 24 hs',
];

export default function EjemploPage() {
  const [modal, setModal] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass-nav border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <div className="h-8 w-8 overflow-hidden flex items-center justify-center">
              <img src={logoImg} alt="Arko Studio" className="h-8 w-8 scale-[2.8]" />
            </div>
            <span className="font-headline font-bold tracking-tighter text-lg text-stone-900 uppercase leading-none mt-px">Arko Studio</span>
          </Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="editorial-gradient text-on-secondary text-xs font-headline font-bold uppercase tracking-widest px-4 md:px-6 py-2.5 rounded-lg hover:opacity-90 transition-all">
            Quiero esto para mis propiedades
          </a>
        </div>
      </header>

      {/* ── Aviso de ejemplo ───────────────────────────────────────────── */}
      <div className="bg-secondary/10 border-b border-secondary/20">
        <p className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 text-xs md:text-sm text-secondary text-center">
          <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
          Ficha de <strong>ejemplo</strong> — así se ve una propiedad publicada con el contenido audiovisual de Arko Studio.
        </p>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* ── Galería estilo portal ────────────────────────────────────── */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9] mb-6">
          <button onClick={() => setModal(true)} className="col-span-2 row-span-2 relative group">
            <img src={FOTOS[0]} alt="Casa al Lago" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          </button>
          {FOTOS.slice(1, 5).map((f, i) => (
            <button key={i} onClick={() => setModal(true)} className="relative group overflow-hidden">
              <img src={f} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
              {i === 3 && (
                <div className="absolute inset-0 bg-on-surface/50 flex items-center justify-center text-white font-headline font-bold text-sm">
                  <span className="material-symbols-outlined mr-1">photo_library</span> Ver todas
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ── Encabezado de la ficha ───────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-8 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
              <span className="material-symbols-outlined text-base">location_on</span>
              Virazón, Nordelta · Tigre, Buenos Aires
            </div>
            <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-locked">Casa al Lago — Virazón</h1>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs uppercase tracking-widest text-on-surface-variant">Precio de venta</div>
            <div className="font-headline font-extrabold text-3xl text-secondary">USD 890.000</div>
          </div>
        </div>

        {/* ── Specs ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {SPECS.map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-secondary">{s.icon}</span>
              <span className="text-sm text-on-surface">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Contenido: media (izq) + contacto (der) ──────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">

            {/* Video */}
            <section>
              <SectionTitle icon="movie" label="Video cinematográfico" />
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
                  title="Video cinematográfico" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>

            {/* Tour 360 */}
            <section>
              <SectionTitle icon="view_in_ar" label="Recorrido virtual 360°" />
              <div className="rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20">
                <iframe src={TOUR_URL} title="Tour 360°" allow="fullscreen; xr-spatial-tracking" allowFullScreen
                  style={{ width: '100%', height: 'clamp(360px, 55vh, 560px)', display: 'block', border: 'none' }} />
              </div>
              <p className="text-xs text-on-surface-variant mt-2 italic">Recorré cada ambiente como si estuvieras ahí. Navegable desde cualquier dispositivo.</p>
            </section>

            {/* Descripción */}
            <section>
              <SectionTitle icon="description" label="Descripción" />
              <div className="space-y-4 text-on-surface-variant leading-relaxed">
                <p>Excepcional residencia sobre el lago en Virazón, Nordelta. Diseño contemporáneo de líneas puras, con grandes paños vidriados que integran el interior con el paisaje y la salida directa al agua.</p>
                <p>Planta baja con living-comedor de doble altura, cocina premium integrada, toilette y dependencia. En planta alta, suite principal con vestidor y baño en suite, más tres dormitorios con baños completos. Amplios decks, piscina desbordante, parrilla y muelle privado con amarra.</p>
              </div>
            </section>

            {/* Características */}
            <section>
              <SectionTitle icon="check_circle" label="Características" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {CARACTERISTICAS.map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm text-on-surface py-1">
                    <span className="material-symbols-outlined text-secondary text-lg">done</span>{c}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar contacto ───────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">real_estate_agent</span>
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">Tu Inmobiliaria</div>
                    <div className="text-xs text-on-surface-variant">Agente a cargo</div>
                  </div>
                </div>
                <button className="w-full bg-surface border border-outline-variant rounded-lg py-3 text-sm font-medium text-on-surface mb-2 hover:border-secondary transition-colors">
                  Consultar disponibilidad
                </button>
                <button className="w-full bg-surface border border-outline-variant rounded-lg py-3 text-sm font-medium text-on-surface hover:border-secondary transition-colors">
                  Agendar visita
                </button>
                <p className="text-[10px] text-on-surface-variant/60 mt-3 text-center">Datos de contacto de ejemplo</p>
              </div>

              {/* CTA Arko */}
              <div className="editorial-gradient rounded-2xl p-6 text-on-secondary">
                <div className="font-headline font-bold text-lg mb-1">¿Tus fichas se ven así?</div>
                <p className="text-sm opacity-90 mb-4 leading-relaxed">Este contenido lo produjo Arko Studio. Fotografía, video, tour 360° y drone para que tus propiedades se destaquen y se vendan más rápido.</p>
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-white/15 hover:bg-white/25 backdrop-blur text-center font-headline font-bold text-sm uppercase tracking-widest py-3 rounded-lg transition-colors">
                  Quiero esto para mí
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-[#211c17] text-[#F3EDE3] mt-16 py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Arko Studio" className="h-7 w-7 scale-[2.8]" style={{ filter: 'brightness(0) invert(1)' }} />
            <span className="font-headline font-bold uppercase tracking-tighter">Arko Studio</span>
          </div>
          <p className="text-sm text-[#A99C88]">Contenido audiovisual para real estate · CABA y GBA</p>
          <Link to="/" className="text-sm text-[#E7A184] hover:underline">Ver más trabajos →</Link>
        </div>
      </footer>

      {modal && <PropertyModal property={ejemplo} onClose={() => setModal(false)} />}
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="material-symbols-outlined text-secondary">{icon}</span>
      <h2 className="font-headline font-bold text-xl text-on-surface">{label}</h2>
    </div>
  );
}
