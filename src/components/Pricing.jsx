import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const BNA_FALLBACK = 1425;
const RATE = 0.0015;

const INCLUDES = [
  { icon: 'photo_camera',   name: 'Fotografía editorial',  desc: 'Interiores y exteriores con edición HDR premium.' },
  { icon: 'vrpano',         name: 'Tour virtual 360° 4K',  desc: 'Desarrollado en Kuula. Incluye 3 meses de hosting.' },
  { icon: 'movie',          name: 'Video cinemático',       desc: 'Recorrido audiovisual profesional de 1 a 2 minutos.' },
  { icon: 'flight_takeoff', name: 'Dron 4K',               desc: 'Hasta 10 fotos aéreas + video cinematográfico.' },
];

const LOGISTICS = [
  {
    label: '⏱ 4 a 5 horas de producción',
    title: '¿Por qué 4 a 5 horas?',
    body: 'Una producción premium no se improvisa. Necesitamos tiempo para el recorrido inicial del espacio, fotografía por ambiente con configuración de luz, grabación de video cinemático con múltiples pasadas, tomas de drone y captura del tour virtual 360°. Apresurarse compromete la calidad. Este tiempo garantiza que cada espacio quede documentado en su mejor versión.',
  },
  {
    label: '☀️ Luz natural óptima',
    title: '¿Por qué luz natural?',
    body: 'La luz natural es el elemento más importante en fotografía inmobiliaria. El rango ideal es de 10:00 a 14:00 hs, cuando la luz es difusa, cálida y envuelve los ambientes sin crear sombras duras. Hace que los espacios se vean más amplios y acogedores, evita el color artificial de la iluminación eléctrica y captura la verdadera paleta de colores de materiales y terminaciones. En días con lluvia intensa podemos reprogramar sin costo.',
  },
  {
    label: '📍 CABA y GBA',
    title: 'Cobertura CABA y GBA',
    body: 'Operamos en Ciudad Autónoma de Buenos Aires y el Gran Buenos Aires (Norte, Sur, Oeste), incluyendo zonas como Nordelta, Tigre, Pilar y Cardales. Esto nos permite garantizar puntualidad en el traslado del equipo y conocimiento del contexto urbano de cada zona. Para propiedades fuera de esta área, consultanos disponibilidad y tarifa de traslado.',
  },
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

  const [tipsOpen,     setTipsOpen]     = useState(false);
  const [logModal,     setLogModal]     = useState(null); // guarda el objeto LOGISTICS seleccionado
  const closeTips = useCallback(() => setTipsOpen(false), []);

  useEffect(() => {
    const isOpen = tipsOpen || !!logModal;
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { closeTips(); setLogModal(null); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [tipsOpen, logModal, closeTips]);

  const fee = Math.round(propVal * RATE);

  return (
    <>
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
            <div className="flex flex-wrap items-center gap-4 mb-2">
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
            <p className="text-[10px] text-on-surface-variant/50 mb-6">
              Deslizá el slider hasta el valor de tu propiedad
            </p>
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
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">Logística</p>
                <button
                  onClick={() => setTipsOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                >
                  ¿Cómo preparar el inmueble?
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {LOGISTICS.map(item => (
                  <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-on-surface border border-outline-variant/50 rounded-full px-4 py-2">
                    {item.label}
                    <button
                      onClick={() => setLogModal(item)}
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-outline-variant/70 text-on-surface-variant hover:bg-secondary hover:text-white hover:border-secondary transition-colors text-[10px] font-bold flex-shrink-0"
                      aria-label={`Más info: ${item.label}`}
                    >!</button>
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

    {tipsOpen && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
          onClick={closeTips}
        />

        {/* Panel */}
        <div
          className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl border-t-4 border-secondary shadow-2xl p-8 md:p-10"
          style={{ animation: 'fadeInUp .22s cubic-bezier(.2,.8,.25,1)' }}
        >
          <button
            onClick={closeTips}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors text-xl"
            aria-label="Cerrar"
          >×</button>

          <h2 className="font-headline font-extrabold text-2xl text-on-surface text-locked mb-3">
            Cómo preparar el inmueble
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            El éxito de la producción es un trabajo conjunto. Nuestro rol es relevar y fotografiar el espacio:{' '}
            <strong className="text-on-surface">no realizamos limpieza, no ordenamos ni movemos objetos pesados, frágiles o de uso personal.</strong>{' '}
            Esa preparación queda a cargo del propietario.
          </p>

          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">Generales</p>
          <ul className="mb-6">
            {[
              'Persianas y cortinas abiertas; reemplazar lámparas quemadas.',
              'Mascotas fuera de cuadro; retirar insignias religiosas y políticas.',
              'Sin ropa colgada a la vista.',
            ].map(tip => (
              <li key={tip} className="flex items-start gap-3 py-2.5 border-b border-outline-variant/20 text-sm text-on-surface">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>

          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">Por ambiente</p>
          <ul>
            {[
              { room: 'Comedor',     tip: 'Mesa despejada, TV apagada, poca decoración.' },
              { room: 'Dormitorios', tip: 'Camas estiradas, pocos almohadones, colchas claras, mesas de luz y pisos despejados.' },
              { room: 'Baños',       tip: 'Sin artículos de aseo personal, cepillos ni tachos; solo toallas decorativas; espejos y vidrios limpios.' },
              { room: 'Cocina',      tip: 'Mesadas libres; guardar vajilla, trapos, productos de limpieza y comida; poca decoración.' },
            ].map(({ room, tip }) => (
              <li key={room} className="flex items-start gap-3 py-2.5 border-b border-outline-variant/20 last:border-b-0 text-sm text-on-surface">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
                <span><strong className="font-semibold">{room}:</strong> {tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>,
      document.body
    )}
    {logModal && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
        <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={() => setLogModal(null)} />
        <div
          className="relative z-10 w-full max-w-md bg-white rounded-2xl border-t-4 border-secondary shadow-2xl p-8"
          style={{ animation: 'fadeInUp .22s cubic-bezier(.2,.8,.25,1)' }}
        >
          <button
            onClick={() => setLogModal(null)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors text-xl"
            aria-label="Cerrar"
          >×</button>
          <h2 className="font-headline font-extrabold text-xl text-on-surface text-locked mb-4">
            {logModal.title}
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {logModal.body}
          </p>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
