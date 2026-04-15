import { useEffect, useCallback } from 'react';

export default function PortfolioLightbox({ items, index, onClose, onPrev, onNext }) {
  const item    = items[index];
  const hasMany = items.length > 1;

  // ── Teclado ───────────────────────────────────────────────────────────────
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape')      onClose();
    if (e.key === 'ArrowRight')  onNext();
    if (e.key === 'ArrowLeft')   onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-on-surface/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ── Contador y cierre (top) ──────────────────────────────────────── */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-5 z-10">
        <span className="text-white/60 font-headline text-xs uppercase tracking-widest font-bold">
          {index + 1} / {items.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      {/* ── Imagen ──────────────────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center w-full h-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          className="max-w-full max-h-[82vh] w-auto h-auto object-contain rounded-md shadow-2xl select-none"
          style={{ animation: 'fadeIn .2s ease' }}
        />
      </div>

      {/* ── Flechas ─────────────────────────────────────────────────────── */}
      {hasMany && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="Anterior"
          >
            <span className="material-symbols-outlined text-2xl">chevron_left</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            aria-label="Siguiente"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>
        </>
      )}

      {/* ── Caption (bottom) ─────────────────────────────────────────────── */}
      {item.alt && (
        <div className="absolute bottom-5 left-0 right-0 text-center px-8 pointer-events-none">
          <p className="text-white/60 text-xs font-body tracking-wide">{item.alt}</p>
        </div>
      )}
    </div>
  );
}
