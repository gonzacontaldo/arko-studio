import { useEffect } from 'react';

export default function ServiceModal({ service, onClose, onOpenBudget }) {
  // Cerrar con Escape + bloquear scroll
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!service) return null;

  const handleBudget = () => {
    onClose();
    onOpenBudget();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-on-surface/70 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 bg-white dark:bg-stone-900 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl">{service.icon}</span>
            </div>
            <div>
              <p className="text-secondary font-headline font-bold text-xs uppercase tracking-widest">
                Ejemplos de trabajo
              </p>
              <h2 className="font-headline font-extrabold text-xl text-locked text-on-surface leading-tight">
                {service.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Gallery */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {service.examples.map(({ src, alt, label }) => (
              <div
                key={alt}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-high"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={src}
                  alt={alt}
                  loading="lazy"
                />
                {label && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-on-surface/80 to-transparent px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-semibold uppercase tracking-wider">{label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-6 pt-5 border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant text-sm">
              ¿Te interesa este servicio para tu propiedad?
            </p>
            <button
              onClick={handleBudget}
              className="editorial-gradient text-on-secondary px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 transition-all duration-150 whitespace-nowrap"
            >
              Solicitar Presupuesto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
