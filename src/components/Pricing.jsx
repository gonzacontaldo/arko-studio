import { useState, useEffect } from 'react';

const BNA_FALLBACK = 1425;
const RATE = 0.0015;

const INCLUDES = [
  { icon: 'photo_camera',   name: 'Fotografía editorial',  desc: 'Interiores y exteriores con edición HDR premium.' },
  { icon: 'vrpano',         name: 'Tour virtual 360° 4K',  desc: 'Desarrollado en Kuula. Incluye 3 meses de hosting.' },
  { icon: 'movie',          name: 'Video cinemático',       desc: 'Recorrido audiovisual profesional de 1 a 2 minutos.' },
  { icon: 'flight_takeoff', name: 'Dron 4K',               desc: 'Hasta 10 fotos aéreas + video cinematográfico.' },
];

const ADDONS = [
  { name: 'Video vertical con agente inmobiliario', desc: 'Cinematic storytelling + formatos optimizados para redes.', price: 'USD 400' },
  { name: 'Transición día a noche',                 desc: 'Edición crepuscular del exterior.',                        price: '1,5X del Premiere Package' },
  { name: 'Plano arquitectónico 2D',                desc: 'Representación digital de la planta de la propiedad.',     price: 'A consultar' },
  { name: 'Renovación tour virtual 360° 4K',        desc: 'Hosting en Kuula por 12 meses adicionales.',               price: 'USD 60 / año' },
];

function fmt(n) {
  return Math.round(n).toLocaleString('es-AR');
}

export default function Pricing({ onOpenModal }) {
  const [propVal, setPropVal] = useState(200000);
  const [bna, setBna]         = useState(BNA_FALLBACK);
  const [bnaDate, setBnaDate] = useState(null);

  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/oficial')
      .then(r => r.json())
      .then(data => {
        if (data?.venta) {
          setBna(Math.round(data.venta));
          // La API devuelve fechaActualizacion como "2026-05-27T..."
          if (data.fechaActualizacion) {
            const d = new Date(data.fechaActualizacion);
            setBnaDate(d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
          }
        }
      })
      .catch(() => {/* usa el fallback silenciosamente */});
  }, []);

  const fee = Math.round(propVal * RATE);

  return (
    <section id="precios" className="py-16 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block font-headline">
            Paquete
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-locked mb-4">
            Premiere Package
          </h2>
          <p className="text-on-surface-variant text-base max-w-2xl mx-auto leading-relaxed">
            Producción visual integral para propiedades de alto valor. Fotografía, video cinemático, dron y tecnología inmersiva en una sola sesión.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-xl overflow-hidden">

          {/* Calculadora — full width */}
          <div className="p-8 md:p-12 border-b border-outline-variant/20">
            <p className="text-xs text-on-surface-variant mb-6 tracking-wide uppercase font-medium">
              Calculá tu inversión — 0,15% del valor de publicación
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="text-sm text-on-surface-variant w-36">Valor de la propiedad</span>
              <input
                type="range"
                min="200000" max="2000000" step="10000"
                value={propVal}
                onChange={e => setPropVal(+e.target.value)}
                className="flex-1 min-w-[160px] accent-secondary"
              />
              <span className="text-base font-semibold text-on-surface w-36 text-right">
                USD {fmt(propVal)}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-1 bg-surface-container-low rounded-xl p-5">
                <p className="text-xs text-on-surface-variant mb-2">Inversión en USD</p>
                <p className="text-3xl font-bold text-secondary font-headline">USD {fmt(fee)}</p>
              </div>
              <div className="lg:col-span-1 bg-surface-container-low rounded-xl p-5">
                <p className="text-xs text-on-surface-variant mb-2">Equivalente en pesos</p>
                <p className="text-2xl font-semibold text-on-surface font-headline">$ {fmt(fee * bna)}</p>
              </div>
              <div className="lg:col-span-2 flex flex-wrap items-center gap-2 bg-surface-container-low/50 rounded-xl p-5">
                {[[300000, 450], [650000, 975], [1000000, 1500]].map(([v, f]) => (
                  <button
                    key={v}
                    onClick={() => setPropVal(v)}
                    className="text-xs text-secondary border border-secondary/30 bg-secondary/5 rounded-full px-4 py-1.5 hover:bg-secondary/10 transition-colors"
                  >
                    USD {fmt(v)} → USD {fmt(f)}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant/50">
              Conversión según dólar billete tipo vendedor BNA · ${fmt(bna)}{bnaDate ? ` · ${bnaDate}` : ''}
            </p>
          </div>

          {/* Incluye + Add-ons — dos columnas en desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant/20">

            {/* Incluye */}
            <div className="p-8 md:p-12">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-medium mb-6">Incluye</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INCLUDES.map(item => (
                  <div key={item.name} className="bg-surface-container-low rounded-xl p-5">
                    <span className="material-symbols-outlined text-secondary text-2xl mb-3 block">{item.icon}</span>
                    <p className="text-sm font-semibold text-on-surface mb-1">{item.name}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="p-8 md:p-12">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-medium mb-6">Add-ons opcionales</p>
              <div className="space-y-3">
                {ADDONS.map(addon => (
                  <div key={addon.name} className="flex items-start justify-between gap-6 px-5 py-4 bg-surface-container-low/60 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-on-surface mb-0.5">{addon.name}</p>
                      <p className="text-xs text-on-surface-variant">{addon.desc}</p>
                    </div>
                    <span className="text-sm font-semibold text-secondary whitespace-nowrap pt-0.5">{addon.price}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Logística + CTA — full width */}
          <div className="p-8 md:p-12 border-t border-outline-variant/20 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant font-medium mb-4">Logística</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['⏱ 4 a 5 horas de producción', '☀️ Luz natural óptima', '📍 CABA y GBA'].map(pill => (
                  <span key={pill} className="text-xs text-on-surface border border-outline-variant/50 rounded-full px-4 py-2">
                    {pill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant/70 leading-relaxed max-w-md">
                La tarifa final puede variar según superficie, terreno, amenities, requerimientos aéreos y locación.
              </p>
            </div>
            <div className="md:w-72 flex-shrink-0">
              <button
                onClick={onOpenModal}
                className="w-full py-4 editorial-gradient text-on-secondary font-headline font-bold text-sm uppercase tracking-widest rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-md mb-3"
              >
                Consultar por este paquete
              </button>
              <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
                Invertí el 0,15% del valor de tu propiedad. Vendela más rápido.
              </p>
            </div>
          </div>

        </div>

        <p className="text-center text-on-surface-variant text-xs mt-10 leading-relaxed">
          ¿Tenés otros requerimientos o querés un paquete a medida?{' '}
          <button onClick={onOpenModal} className="text-secondary font-semibold hover:underline">
            Consultanos.
          </button>
        </p>

      </div>
    </section>
  );
}
