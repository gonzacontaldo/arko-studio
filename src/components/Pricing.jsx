import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

const MIN_M2  = 100;
const MAX_M2  = 500;
const STEP_M2 = 100;
const WA_NUMBER = '5491176498888';

// Servicios à la carte. base = precio hasta 100 m²; per100 = suma por cada 100 m² adicional.
const SERVICES = [
  { id: 'foto',   icon: 'photo_camera',   name: 'Fotografía editorial',  desc: 'Interiores y exteriores con edición HDR premium.',        base: 125000, per100: 25000 },
  { id: 'tour',   icon: 'vrpano',         name: 'Tour virtual 360° 4K',  desc: 'Desarrollado en Kuula. Incluye 3 meses de hosting.',      base: 50000,  per100: 25000 },
  { id: 'cine',   icon: 'movie',          name: 'Video cinematográfico', desc: 'Recorrido audiovisual profesional de 1 a 2 minutos.',     base: 125000, per100: 25000 },
  { id: 'fpv',    icon: 'flight_takeoff', name: 'Video FPV',             desc: 'Vuelo inmersivo con drone FPV: recorrido continuo y dinámico.', base: 125000, per100: 25000 },
  { id: 'reel',   icon: 'smartphone',     name: 'Reel para redes',       desc: 'Video vertical con agente inmobiliario para Instagram y TikTok.',      base: 125000, per100: 25000 },
  { id: 'planos', icon: 'architecture',   name: 'Planos 2D',             desc: 'Plano esquemático de la propiedad. Dentro de un pack, a menor precio.', base: 50000, per100: 25000 },
];

const SERVICE_BY_ID = Object.fromEntries(SERVICES.map(s => [s.id, s]));

// Packs con precio fijo. base = precio hasta 100 m²; per100 = suma por cada 100 m² adicional.
const PACKS = [
  { id: 'base',      name: 'Base',      tagline: 'Lo esencial para publicar.',            services: ['foto', 'planos', 'tour'],                 base: 175000, per100: 25000 },
  { id: 'destacado', name: 'Destacado', tagline: 'Sumá impacto aéreo inmersivo.',         services: ['foto', 'planos', 'tour', 'fpv'],          base: 285000, per100: 50000, highlight: true },
  { id: 'redes',     name: 'Redes',     tagline: 'Pensado para performance en redes.',    services: ['foto', 'planos', 'reel', 'cine'],         base: 350000, per100: 50000 },
  { id: 'completo',  name: 'Completo',  tagline: 'La producción integral, sin dejar nada afuera.', services: ['foto', 'planos', 'tour', 'fpv', 'cine'], base: 395000, per100: 50000 },
];

const ADDONS = [
  { name: 'Transición día a noche',                 desc: 'Edición crepuscular del exterior.' },
  { name: 'Tour en Matterport',        desc: 'Genera un modelo 3D interactivo de la propiedad.' },
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

function fmt(n) {
  return Math.round(n).toLocaleString('es-AR');
}

// Cantidad de tramos de 100 m² por encima del primero.
function stepsFor(m2) {
  return Math.max(0, Math.round((m2 - MIN_M2) / STEP_M2));
}

function priceFor(item, m2) {
  return item.base + item.per100 * stepsFor(m2);
}

export default function Pricing({ onOpenModal }) {
  const [m2, setM2] = useState(MIN_M2);

  const [tipsOpen, setTipsOpen] = useState(false);
  const [logModal, setLogModal] = useState(null);
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

  const m2Label = m2 >= MAX_M2 ? `${fmt(MAX_M2)}+ m²` : `${fmt(m2)} m²`;

  const packLink = (pack) => {
    const text = `Hola, me interesa el pack ${pack.name} para una propiedad de ${m2Label}. ¿Me pasás un presupuesto?`;
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
    <section id="precios" className="py-16 md:py-32 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-4 block font-headline">
            Servicios y packs
          </span>
          <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-locked mb-4">
            Armá tu producción
          </h2>
          <p className="text-on-surface-variant text-base max-w-2xl mx-auto leading-relaxed">
            Elegí servicios sueltos a la carta o combinálos en un pack con mejor precio. Todo escala según la superficie de la propiedad. Precios finales, IVA incluido.
          </p>
        </div>

        {/* Selector de superficie */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 shadow-sm p-6 md:p-8 mb-10">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-on-surface-variant w-40 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">straighten</span>
              Superficie
            </span>
            <input
              type="range"
              min={MIN_M2} max={MAX_M2} step={STEP_M2}
              value={m2}
              onChange={e => setM2(+e.target.value)}
              className="flex-1 min-w-[180px] accent-secondary"
            />
            <span className="text-lg font-bold text-on-surface w-28 text-right font-headline">
              {m2Label}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant/60 mt-3">
            El precio escala cada 100 m². Deslizá hasta la superficie de tu propiedad.
          </p>
        </div>

        {/* Bloque 1 — Menú à la carte */}
        <div className="mb-16">
          <div className="flex items-baseline gap-3 mb-6">
            <h3 className="font-headline font-extrabold text-xl md:text-2xl text-locked">A la carta</h3>
            <span className="text-xs text-on-surface-variant">Servicios individuales</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-outline-variant/40 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">{s.icon}</span>
                  <span className="text-lg font-bold text-secondary font-headline whitespace-nowrap">
                    $ {fmt(priceFor(s, m2))}
                  </span>
                </div>
                <p className="text-sm font-semibold text-on-surface mb-1">{s.name}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bloque 2 — Packs */}
        <div>
          <div className="flex items-baseline gap-3 mb-6">
            <h3 className="font-headline font-extrabold text-xl md:text-2xl text-locked">Packs</h3>
            <span className="text-xs text-on-surface-variant">Combinaciones con mejor precio</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS.map(pack => (
              <div
                key={pack.id}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  pack.highlight
                    ? 'bg-white border-2 border-secondary shadow-xl'
                    : 'bg-white border border-outline-variant/40 shadow-sm'
                }`}
              >
                {pack.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 editorial-gradient text-on-secondary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Más elegido
                  </span>
                )}
                <p className="font-headline font-extrabold text-lg text-on-surface mb-1">{pack.name}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-4 min-h-[32px]">{pack.tagline}</p>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-secondary font-headline">$ {fmt(priceFor(pack, m2))}</p>
                  <p className="text-[10px] text-on-surface-variant/60">para {m2Label} · IVA incluido</p>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {pack.services.map(id => (
                    <li key={id} className="flex items-center gap-2 text-xs text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-base">check</span>
                      {SERVICE_BY_ID[id].name}
                    </li>
                  ))}
                </ul>

                <a
                  href={packLink(pack)}
                  target="_blank" rel="noopener noreferrer"
                  className={`w-full py-3 font-headline font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 ${
                    pack.highlight
                      ? 'editorial-gradient text-on-secondary shadow-md hover:opacity-90'
                      : 'border border-secondary text-secondary hover:bg-secondary/5'
                  }`}
                >
                  Solicitar
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons + Logística */}
        <div className="mt-16 bg-white rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
          {/* Add-ons */}
          <div className="p-8 md:p-12 border-b border-outline-variant/20">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-medium mb-6">Add-ons opcionales</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ADDONS.map(addon => (
                <div key={addon.name} className="px-5 py-4 bg-surface-container-low/60 rounded-xl">
                  <p className="text-sm font-medium text-on-surface mb-0.5">{addon.name}</p>
                  <p className="text-xs text-on-surface-variant">{addon.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logística + CTA */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant font-medium">Logística</p>
                <button
                  onClick={() => setTipsOpen(true)}
                  className="text-xs text-secondary hover:opacity-70 hover:underline transition-colors font-medium"
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
                La tarifa final puede variar según terreno, amenities, requerimientos aéreos y locación.
              </p>
            </div>
            <div className="md:w-72 flex-shrink-0">
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, me interesa una producción. ¿Me pasás un presupuesto?')}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full py-4 editorial-gradient text-on-secondary font-headline font-bold text-sm uppercase tracking-widest rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] shadow-md mb-3 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Quiero mi presupuesto
              </a>
              <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
                Te respondemos en menos de 24 hs.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-on-surface-variant text-xl mt-10 leading-relaxed">
          ¿Tenés otros requerimientos o querés un paquete a medida?{' '}
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola, quisiera consultar por un paquete a medida.')}`}
            target="_blank" rel="noopener noreferrer"
            className="text-secondary font-bold hover:underline"
          >
            Consultanos.
          </a>
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
