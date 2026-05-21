import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import TextLogo from '../assets/TextLogo.png';

const TAB_CONFIG = {
  foto:  { label: 'Fotos',    icon: 'photo_library' },
  video: { label: 'Video',    icon: 'play_circle'   },
  tour:  { label: 'Tour 360°',icon: 'view_in_ar'    },
};

export default function PropertyModal({ property, onClose }) {
  const mediaTabs = property.types.filter(t => t !== 'dron' || property.fotos?.length);
  // Solo mostramos tabs con contenido real
  const visibleTabs = property.types.filter(t => {
    if (t === 'foto') return property.fotos?.length > 0;
    if (t === 'video') return !!(property.videoSrc || property.videoId);
    if (t === 'tour')  return !!property.tourUrl;
    return false;
  });

  const [activeTab,  setActiveTab]  = useState(visibleTabs[0]);
  const [photoIndex, setPhotoIndex] = useState(0);

  const fotos   = property.fotos  ?? [];
  const hasMany = fotos.length > 1;

  const prevPhoto = useCallback(() =>
    setPhotoIndex(i => (i - 1 + fotos.length) % fotos.length), [fotos.length]);
  const nextPhoto = useCallback(() =>
    setPhotoIndex(i => (i + 1) % fotos.length), [fotos.length]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (activeTab === 'foto') {
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft')  prevPhoto();
    }
  }, [onClose, activeTab, nextPhoto, prevPhoto]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setPhotoIndex(0);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-on-surface/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-surface rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header con tabs y cierre ──────────────────────────────────── */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-outline-variant bg-surface-container">
          {property.title && (
            <span className="font-headline font-bold text-sm mr-3 shrink-0">{property.title}</span>
          )}
          <div className="flex gap-1 flex-wrap flex-1">
            {visibleTabs.map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? 'bg-secondary text-white'
                    : 'text-on-surface-variant hover:text-secondary hover:bg-secondary/10'
                }`}
              >
                <span className="material-symbols-outlined text-base leading-none">{TAB_CONFIG[tab].icon}</span>
                {TAB_CONFIG[tab].label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="ml-2 w-8 h-8 rounded-full bg-surface-container-high hover:bg-outline-variant flex items-center justify-center transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        {/* ── Contenido ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden bg-black relative" style={{ minHeight: '300px' }}>

          {/* Watermark — centrado sobre la foto */}
          {activeTab === 'foto' && (
            <img
              src={TextLogo}
              alt=""
              draggable={false}
              onContextMenu={e => e.preventDefault()}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{ width: '55%', maxWidth: '480px', minWidth: '200px', opacity: 0.35, filter: 'brightness(0) invert(1)', zIndex: 20 }}
            />
          )}

          {/* Fotos  */}
          {(activeTab === 'foto') && fotos.length > 0 && (
            <div className="w-full h-full flex items-center justify-center" style={{ minHeight: '400px' }}>
              <img
                key={photoIndex}
                src={fotos[photoIndex]}
                alt={property.title}
                className="max-w-full max-h-[75vh] object-contain select-none"
                style={{ animation: 'fadeIn .2s ease' }}
                onContextMenu={e => e.preventDefault()}
                draggable={false}
              />
              {hasMany && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                    aria-label="Anterior"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                    aria-label="Siguiente"
                  >
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                    <span className="text-white/50 text-xs font-headline">{photoIndex + 1} / {fotos.length}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Video local o YouTube */}
          {activeTab === 'video' && (
            <>
              {property.videoSrc && (
                <div className="flex items-center justify-center w-full h-full" style={{ minHeight: '400px' }}>
                  <video
                    key={property.videoSrc}
                    className="max-w-full max-h-[75vh]"
                    controls
                    autoPlay
                    playsInline
                  >
                    <source src={property.videoSrc} type="video/mp4" />
                  </video>
                </div>
              )}
              {!property.videoSrc && property.videoId && (
                property.vertical ? (
                  /* Shorts / video vertical 9:16 */
                  <div className="flex items-center justify-center w-full h-full py-4" style={{ minHeight: '400px' }}>
                    <div className="relative w-full max-w-xs" style={{ paddingTop: 'min(177.78%, 75vh)' }}>
                      <iframe
                        className="absolute inset-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${property.videoId}?autoplay=1&rel=0`}
                        title={property.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  /* Video horizontal 16:9 */
                  <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${property.videoId}?autoplay=1&rel=0`}
                      title={property.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )
              )}
            </>
          )}

          {/* Tour 360 */}
          {activeTab === 'tour' && property.tourUrl && (
            <iframe
              src={property.tourUrl}
              title={`Tour 360° — ${property.title}`}
              allow="fullscreen; xr-spatial-tracking"
              allowFullScreen
              style={{ width: '100%', height: 'clamp(400px, 70vh, 700px)', display: 'block', border: 'none' }}
            />
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
