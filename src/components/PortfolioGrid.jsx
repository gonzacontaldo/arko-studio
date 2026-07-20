import { useState } from 'react';
import PropertyModal from './PropertyModal';
import TextLogo from '../assets/TextLogo.png';

// Grilla de propiedades reutilizable — usada tanto en la portada (destacadas)
// como en la página de portfolio completo. Maneja el modal internamente.
export default function PortfolioGrid({ items }) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  if (items.length === 0) {
    return (
      <div className="px-8 max-w-7xl mx-auto text-on-surface-variant text-sm text-center py-16">
        No hay propiedades cargadas aún.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
        {items.map((property) => (
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
