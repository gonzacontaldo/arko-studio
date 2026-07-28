import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/Logo.png';
import PropertyModal from '../components/PropertyModal';
import { fetchEjemplo } from '../lib/portfolio';

const WHATSAPP = 'https://wa.me/5491144340580?text=Hola%2C%20vi%20la%20ficha%20de%20ejemplo%20y%20quiero%20este%20tipo%20de%20contenido%20para%20mis%20propiedades.';

// Fallback: se usa si todavía no marcaste ninguna propiedad como ejemplo en el hub.
const DEMO = {
  title: 'Casa al Lago — Virazón',
  fotos: [
    '/portfolio-web/Virazon/Portada.jpg', '/portfolio-web/Virazon/Foto1.jpg',
    '/portfolio-web/Virazon/Foto2.jpg', '/portfolio-web/Virazon/Foto3.jpg',
    '/portfolio-web/Virazon/Foto4.jpg', '/portfolio-web/Virazon/Foto5.jpg',
  ],
  videos: [{ kind: 'horizontal', id: 'ni3x6uBh2ZA' }],
  tourUrl: 'https://doormann.viewin360.co/share/collection/7MSq5?logo=0&card=1&info=1&logosize=200&fs=1&vr=0&zoom=1&thumbs=1&inst=es',
  types: ['foto', 'video', 'tour', 'dron'],
  precio: 'USD 890.000',
  ubicacion: 'Virazón, Nordelta · Tigre, Buenos Aires',
  descripcion: 'Excepcional residencia sobre el lago en Virazón, Nordelta. Diseño contemporáneo de líneas puras, con grandes paños vidriados que integran el interior con el paisaje y salida directa al agua.\n\nPlanta baja con living-comedor de doble altura, cocina premium integrada y dependencia. En planta alta, suite principal con vestidor más tres dormitorios en suite. Amplios decks, piscina desbordante, parrilla y muelle privado con amarra.',
  specs: ['4 dormitorios', '4 baños', '2 cocheras', '320 m² cubiertos', 'Lote 850 m²', 'Amarra propia'],
};

const CARACTERISTICAS = [
  'Piscina desbordante con deck', 'Parrilla y quincho', 'Jardín al lago',
  'Living con doble altura', 'Cocina integrada premium', 'Suite con vestidor',
  'Domótica integrada', 'Muelle privado', 'Seguridad 24 hs',
];

// Ícono según la palabra clave del spec.
function specIcon(s) {
  const t = s.toLowerCase();
  if (/dormit|amb/.test(t)) return 'bed';
  if (/baño/.test(t))       return 'bathtub';
  if (/coch|garage/.test(t))return 'directions_car';
  if (/m²|m2|cubie/.test(t))return 'square_foot';
  if (/lote|terren/.test(t))return 'crop_landscape';
  if (/amarra|muelle/.test(t)) return 'sailing';
  return 'check_circle';
}

// Video principal: preferimos el horizontal; si no, el primero.
const isVertical = (k) => k === 'vertical' || k === 'reel';

export default function EjemploPage() {
  const [prop, setProp] = useState(DEMO);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEjemplo().then(p => {
      if (p && p.fotos?.length) {
        setProp({
          ...p,
          precio: p.precio || 'Consultar',
          ubicacion: p.ubicacion || '',
          descripcion: p.descripcion || '',
          specs: (p.specs && p.specs.length) ? p.specs : [],
        });
      }
    });
  }, []);

  const fotos = prop.fotos || [];
  const videos = prop.videos || [];
  const video = videos.find(v => !isVertical(v.kind)) || videos[0];
  const specs = prop.specs && prop.specs.length ? prop.specs : DEMO.specs;

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
        {fotos.length > 0 && (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[16/9] mb-6">
            <button onClick={() => setModal(true)} className="col-span-2 row-span-2 relative group">
              <img src={fotos[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
            </button>
            {fotos.slice(1, 5).map((f, i) => (
              <button key={i} onClick={() => setModal(true)} className="relative group overflow-hidden">
                <img src={f} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                {i === Math.min(fotos.length - 2, 3) && (
                  <div className="absolute inset-0 bg-on-surface/50 flex items-center justify-center text-white font-headline font-bold text-sm">
                    <span className="material-symbols-outlined mr-1">photo_library</span> Ver todas
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Encabezado de la ficha ───────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-8 border-b border-outline-variant/30">
          <div>
            {prop.ubicacion && (
              <div className="flex items-center gap-2 text-on-surface-variant text-sm mb-2">
                <span className="material-symbols-outlined text-base">location_on</span>
                {prop.ubicacion}
              </div>
            )}
            <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-locked">{prop.title}</h1>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs uppercase tracking-widest text-on-surface-variant">Precio de venta</div>
            <div className="font-headline font-extrabold text-3xl text-secondary">{prop.precio}</div>
          </div>
        </div>

        {/* ── Specs ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {specs.map(s => (
            <div key={s} className="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-secondary">{specIcon(s)}</span>
              <span className="text-sm text-on-surface">{s}</span>
            </div>
          ))}
        </div>

        {/* ── Contenido: media (izq) + contacto (der) ──────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">

            {/* Video */}
            {video && (
              <section>
                <SectionTitle icon="movie" label="Video cinematográfico" />
                {isVertical(video.kind) ? (
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-xs rounded-2xl overflow-hidden shadow-lg" style={{ paddingTop: 'min(177.78%, 70vh)' }}>
                      <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ paddingTop: '56.25%' }}>
                    <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                )}
              </section>
            )}

            {/* Tour 360 */}
            {prop.tourUrl && (
              <section>
                <SectionTitle icon="view_in_ar" label="Recorrido virtual 360°" />
                <div className="rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20">
                  <iframe src={prop.tourUrl} title="Tour 360°" allow="fullscreen; xr-spatial-tracking" allowFullScreen
                    style={{ width: '100%', height: 'clamp(360px, 55vh, 560px)', display: 'block', border: 'none' }} />
                </div>
                <p className="text-xs text-on-surface-variant mt-2 italic">Recorré cada ambiente como si estuvieras ahí. Navegable desde cualquier dispositivo.</p>
              </section>
            )}

            {/* Descripción */}
            {prop.descripcion && (
              <section>
                <SectionTitle icon="description" label="Descripción" />
                <div className="space-y-4 text-on-surface-variant leading-relaxed">
                  {prop.descripcion.split('\n').filter(Boolean).map((par, i) => <p key={i}>{par}</p>)}
                </div>
              </section>
            )}

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
                <button className="w-full bg-surface border border-outline-variant rounded-lg py-3 text-sm font-medium text-on-surface mb-2 hover:border-secondary transition-colors">Consultar disponibilidad</button>
                <button className="w-full bg-surface border border-outline-variant rounded-lg py-3 text-sm font-medium text-on-surface hover:border-secondary transition-colors">Agendar visita</button>
                <p className="text-[10px] text-on-surface-variant/60 mt-3 text-center">Datos de contacto de ejemplo</p>
              </div>

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

      {modal && <PropertyModal property={{ title: prop.title, cover: fotos[0], fotos, videos, tourUrl: prop.tourUrl, types: prop.types || ['foto'] }} onClose={() => setModal(false)} />}
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
