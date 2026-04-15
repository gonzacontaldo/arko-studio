// ─── Paquetes ─────────────────────────────────────────────────────────────────
// Precios orientativos basados en tarifas de mercado Buenos Aires / GBA (2026).
// Ajustá los valores según tus costos y la zona donde operás.

const packages = [
  {
    name:     'Básico',
    tagline:  'Para publicar bien en portales',
    price:    '$220.000',
    featured: false,
    includes: [
      'Fotografía inmobiliaria (20 fotos editadas)',
      'Retoque HDR y corrección de color',
      'Tour virtual 360° con Kuula',
      'Plano 2D con medición láser',
      'Galería privada en la nube',
      'Entrega en 48 hs',
    ],
    notIncluded: [
      'Video para redes sociales',
      'Video horizontal para portales',
    ],
  },
  {
    name:     'Full Publicación',
    tagline:  'Ideal para agentes activos',
    price:    '$255.000',
    featured: true,
    badge:    'Más elegido',
    includes: [
      'Fotografía inmobiliaria (20 fotos editadas)',
      'Retoque HDR y corrección de color',
      'Video horizontal para portales (60 s)',
      'Tour virtual 360° con Kuula',
      'Edición profesional premium',
      'Música licenciada incluida',
      'Galería privada en la nube',
      'Entrega en 72 hs',
    ],
    notIncluded: [
      'Videos verticales para redes',
    ],
  },
  {
    name:     'Redes',
    tagline:  'Para generar consultas en redes',
    price:    '$195.000',
    featured: false,
    includes: [
      'Fotografía inmobiliaria (15 fotos editadas)',
      'Retoque HDR y corrección de color',
      '2 Reels verticales para Instagram / TikTok',
      'Edición creativa y música licenciada',
      'Galería privada en la nube',
      'Entrega en 48 hs',
    ],
    notIncluded: [
      'Tour virtual 360°',
      'Video horizontal para portales',
      'Plano 2D',
    ],
  },
  {
    name:     'Full Package',
    tagline:  'Para propiedades de alto valor',
    price:    '$590.000',
    featured: false,
    includes: [
      'Fotografía inmobiliaria (25 fotos editadas)',
      'Retoque HDR + sesión al atardecer',
      'Video vertical (Reel) + Video horizontal',
      'Tour virtual 360° con Matterport',
      'Video 360° interactivo con Dron DJI Avata',
      'Plano 2D con medición láser',
      'Edición profesional premium',
      'Música licenciada incluida',
      'Entrega en 72 hs',
    ],
    notIncluded: [],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Pricing({ onOpenModal }) {
  return (
    <section id="precios" className="py-32 px-8 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block font-headline">
            Paquetes
          </span>
          <h2 className="font-headline font-extrabold text-4xl text-locked mb-4">
            Elegí el paquete que mejor se adapta
          </h2>
          <p className="text-on-surface-variant text-base max-w-xl mx-auto leading-relaxed">
            Precios orientativos para una propiedad estándar en CABA / GBA.
            Consultanos para presupuestos a medida.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col rounded-xl border transition-shadow duration-200 ${
                pkg.featured
                  ? 'bg-on-surface border-secondary shadow-2xl'
                  : 'bg-white border-outline-variant/40 hover:shadow-lg hover:border-secondary/40'
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="editorial-gradient text-on-secondary text-[10px] font-headline font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow whitespace-nowrap">
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">

                {/* Nombre y tagline */}
                <div className="mb-5">
                  <h3 className={`font-headline font-extrabold text-xl text-locked mb-1 ${
                    pkg.featured ? 'text-white' : 'text-on-surface'
                  }`}>
                    {pkg.name}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    pkg.featured ? 'text-surface-dim' : 'text-on-surface-variant'
                  }`}>
                    {pkg.tagline}
                  </p>
                </div>

                {/* Precio */}
                <div className={`mb-6 pb-6 border-b ${
                  pkg.featured ? 'border-white/10' : 'border-outline-variant/30'
                }`}>
                  <p className={`font-headline font-extrabold text-3xl text-locked ${
                    pkg.featured ? 'text-[#C5A059]' : 'text-secondary'
                  }`}>
                    {pkg.price}
                  </p>
                  <p className={`text-xs mt-1 ${
                    pkg.featured ? 'text-surface-dim' : 'text-on-surface-variant'
                  }`}>
                    Por propiedad · Precios orientativos
                  </p>
                </div>

                {/* Lista de incluidos */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed">
                      <span className={`material-symbols-outlined text-sm mt-0.5 flex-shrink-0 ${
                        pkg.featured ? 'text-[#C5A059]' : 'text-secondary'
                      }`}>
                        check_circle
                      </span>
                      <span className={pkg.featured ? 'text-surface-variant' : 'text-on-surface-variant'}>
                        {item}
                      </span>
                    </li>
                  ))}
                  {pkg.notIncluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs leading-relaxed opacity-30">
                      <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0">
                        remove
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={onOpenModal}
                  className={`w-full py-3.5 rounded-lg font-headline font-bold text-xs uppercase tracking-widest transition-all duration-150 active:scale-[0.98] ${
                    pkg.featured
                      ? 'editorial-gradient text-on-secondary shadow-lg hover:opacity-90'
                      : 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-on-secondary'
                  }`}
                >
                  Consultar precio
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Nota al pie */}
        <p className="text-center text-on-surface-variant text-xs mt-10 leading-relaxed">
          ¿Tenés un desarrollo inmobiliario o proyecto de gran volumen?{' '}
          <button
            onClick={onOpenModal}
            className="text-secondary font-semibold hover:underline"
          >
            Consultanos por tarifas especiales.
          </button>
        </p>

      </div>
    </section>
  );
}
