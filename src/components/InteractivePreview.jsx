import { useEffect, useRef, useState } from 'react';

const MATTERPORT_URL = 'https://doormann.viewin360.co/share/collection/71Y1x?logo=1&info=0&logosize=112&fs=1&vr=0&zoom=1&autorotate=0.08&autop=5&autopalt=1&thumbs=1&inst=es';

// ─── Pegá el ID de YouTube de cada video (lo que va después de ?v= en la URL) ──
// Ejemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  'dQw4w9WgXcQ'
const YT_HORIZONTAL = 'GhFOs5FXXLA'; // Video landscape — portales y sitio web
const YT_VERTICAL   = '_I57bl9c1R4'; // Reel vertical    — Instagram / TikTok

// ─── Reemplazá esta URL con tu imagen de plano real ───────────────────────────
const FLOOR_PLAN_IMAGE = 'https://static.tokkobroker.com/pictures/6811203_16941810600148600011027949836947230498386497061057409250758090562184505248578.jpg';

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block font-headline">
      {children}
    </span>
  );
}

function VideoPlaceholder({ icon, label }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-900/80 z-10">
      <span className="material-symbols-outlined text-4xl text-white/30">{icon}</span>
      <p className="text-[10px] uppercase tracking-widest font-headline font-bold text-white/30">{label}</p>
    </div>
  );
}

function YoutubeEmbed({ videoId, title }) {
  return (
    <iframe
      className="absolute inset-0 w-full h-full"
      src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function VideoVertical({ videoId }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="aspect-[9/16] w-[180px] sm:w-[220px] max-w-full bg-stone-900 rounded-[2rem] relative flex items-center justify-center overflow-hidden border-[7px] border-stone-800 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-stone-700 rounded-full z-20 pointer-events-none" />
        {videoId ? (
          <YoutubeEmbed videoId={videoId} title="Reel vertical" />
        ) : (
          <VideoPlaceholder icon="videocam" label="Reel vertical" />
        )}
      </div>
      <p className="text-xs text-on-surface-variant text-center italic">Reel para Instagram / TikTok</p>
    </div>
  );
}

function VideoHorizontal({ videoId }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-video w-full bg-stone-900 rounded-2xl relative flex items-center justify-center overflow-hidden border-[7px] border-stone-800 shadow-2xl">
        {/* Cámara frontal */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-stone-700 rounded-full z-20 pointer-events-none" />
        {videoId ? (
          <YoutubeEmbed videoId={videoId} title="Video horizontal" />
        ) : (
          <VideoPlaceholder icon="movie" label="Video horizontal" />
        )}
      </div>
      <p className="text-xs text-on-surface-variant italic">Video completo para portales y sitio web</p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function InteractivePreview() {
  // Lazy-load del iframe: solo asigna src cuando el contenedor entra en viewport
  const iframeContainerRef = useRef(null);
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    const el = iframeContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIframeSrc(MATTERPORT_URL);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' } // empieza a cargar 300px antes de ser visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-32 px-4 md:px-8 bg-surface-container-lowest space-y-16 md:space-y-24">
      <div className="max-w-7xl mx-auto">

        {/* ── Tour Virtual 360° ──────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <SectionLabel>Tour virtual</SectionLabel>
            <h3 className="font-headline font-extrabold text-2xl md:text-3xl text-locked">Experiencia Interactiva 360°</h3>
          </div>
          <div
            ref={iframeContainerRef}
            className="w-full h-[320px] sm:h-[440px] md:h-[560px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg bg-surface-container-high"
          >
            {iframeSrc ? (
              <iframe
                src={iframeSrc}
                title="Tour virtual 360° — ARKO Studio"
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="xr-spatial-tracking; gyroscope; accelerometer"
              />
            ) : (
              /* Placeholder visible mientras no cargó */
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-30">360</span>
                <p className="text-xs uppercase tracking-widest font-headline font-bold opacity-40">Cargando tour…</p>
              </div>
            )}
          </div>
          <p className="text-sm text-on-surface-variant italic">
            Recorrido real con Kuula/Matterport. Navegable desde cualquier dispositivo, compatible con VR.
          </p>
        </div>

        {/* ── Videos ────────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          <div>
            <SectionLabel>Videos</SectionLabel>
            <h3 className="font-headline font-extrabold text-2xl md:text-3xl text-locked">Videos Cinematográficos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <VideoHorizontal videoId={YT_HORIZONTAL} />
            <VideoVertical   videoId={YT_VERTICAL} />
          </div>
        </div>

        {/* ── Planos 2D ─────────────────────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <SectionLabel>Planos 2D</SectionLabel>
            <h3 className="font-headline font-extrabold text-2xl md:text-3xl text-locked">Planos con Medición Láser</h3>
          </div>

          {FLOOR_PLAN_IMAGE ? (
            <div className="rounded-xl overflow-hidden border border-outline-variant/20 shadow-md">
              <img
                src={FLOOR_PLAN_IMAGE}
                alt="Plano 2D con medidas"
                className="w-full object-contain bg-white"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] max-w-3xl mx-auto rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-4 bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-40">architecture</span>
              <div className="text-center space-y-1">
                <p className="font-headline font-bold text-sm uppercase tracking-widest opacity-50">Plano 2D</p>
                <p className="text-xs opacity-40">Reemplazá <code className="font-mono">FLOOR_PLAN_IMAGE</code> con la URL de tu plano</p>
              </div>
            </div>
          )}

          <p className="text-sm text-on-surface-variant italic max-w-3xl mx-auto">
            Planos a escala con medición láser. Distribuidos junto a las fotos para que los compradores
            entiendan cada ambiente antes de visitar.
          </p>
        </div>

      </div>
    </section>
  );
}
