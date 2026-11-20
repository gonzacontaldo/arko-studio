import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BudgetModal from '../components/BudgetModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import Seo, { SITE_URL } from '../components/Seo';
import VideoExample from '../components/video/VideoExample';
import VideoProcess from '../components/video/VideoProcess';
import { videoFormats, videoFormatById } from '../data/videoFormats';
import { services, serviceLinks } from '../data/services';
import { SERVICE_BY_ID } from '../components/pricingData';
import { useCommercialConfig } from '../lib/commercial';
import { propertyPrice } from '../lib/propertyPricing';
// Reuse the editorial typography and layout established on the photography page.
import './photography.css';
import './video.css';

const service = services['video-inmobiliario'];
const money = value => `$ ${Math.round(value).toLocaleString('es-AR')}`;
const videoExtras = [
  { name: 'Participación del agente inmobiliario', description: 'Presentación de la propiedad frente a cámara.', price: 50000 },
  { name: 'Sesión al atardecer', description: 'Grabación coordinada para aprovechar la luz del atardecer.', price: 50000 },
];
const preparation = [
  ['Una propiedad lista para grabar', 'Limpieza y orden terminados. Camas hechas, mesadas despejadas, espejos limpios y objetos personales guardados.'],
  ['Tiempo y tranquilidad', 'Coordiná un bloque sin visitas ni interrupciones. Cada movimiento puede necesitar ensayos, varias pasadas y revisión.'],
  ['Accesos y recorridos despejados', 'Prepará llaves, permisos de acceso y puertas que vayamos a usar. Para FPV, coordinamos la ruta y mantenemos personas y mascotas fuera del recorrido.'],
  ['El mensaje y dónde va a publicarse', 'Contanos si el objetivo es presentar la propiedad, generar consultas o acompañar una campaña. Si vas a hablar en cámara, definimos el mensaje antes de la sesión.'],
];
const questions = [
  ['¿Qué formato me conviene?', 'El cinematográfico es una buena opción para presentar la propiedad con detalle; el reel prioriza una pieza vertical y ágil para redes; el FPV ayuda a entender la conexión entre los espacios con un recorrido inmersivo. También pueden complementarse. Elegimos según el objetivo y las características del inmueble.'],
  ['¿Por qué necesitan tiempo para grabar?', 'Primero recorremos y planificamos. Después ajustamos la cámara, estabilizamos, ensayamos movimientos y hacemos las pasadas necesarias. Un recorrido FPV también requiere revisar la ruta. Trabajar con tranquilidad permite elegir buenas tomas y cuidar la continuidad. La duración de la sesión se acuerda según superficie y alcance; una producción completa que combine varios servicios puede llevar entre 4 y 5 horas.'],
  ['¿Qué son los speed ramps?', 'Son cambios graduales de velocidad dentro de una toma. Permiten acelerar un desplazamiento y volver a una velocidad más pausada para destacar un ambiente o un detalle. Se usan cuando ayudan al ritmo del video y al objetivo de la pieza.'],
  ['¿La música se puede usar en redes y publicidad?', 'Ofrecemos música licenciada para los usos acordados de la pieza. Antes de elegir la pista, definimos las cuentas, los canales y si la publicación incluye campañas pagas, para contemplarlos en la licencia. Si después querés ampliar el uso, consultanos para revisar el alcance.'],
  ['¿Puedo aparecer presentando la propiedad?', 'Sí. Podemos planificar tu participación como broker o representante, con una guía breve de lo que querés contar. Se cotiza como adicional y se organiza antes del rodaje para reservar el tiempo necesario.'],
  ['¿Me entregan versiones horizontales y verticales?', 'Se entrega el formato contratado. Si necesitás horizontal y vertical, lo planificamos y cotizamos desde el inicio: los encuadres y la edición de cada formato tienen necesidades diferentes.'],
  ['¿Cuándo y cómo recibo el video?', 'La referencia habitual es de 72 horas después de la producción. Confirmamos el plazo según la duración, los formatos y la complejidad de la edición. Recibís un enlace privado para descargar el archivo de entrega; evitá reenviarlo como video comprimido si necesitás conservar su calidad.'],
  ['¿Se puede hacer FPV en cualquier propiedad?', 'Primero revisamos los espacios, los accesos, el recorrido posible y las condiciones de la jornada. Si una ruta no es viable, buscamos una alternativa de producción que permita mostrar el inmueble de forma cuidada.'],
];

export default function VideoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formatId, setFormatId] = useState('cine');
  const [area, setArea] = useState(100);
  const [activePlayer, setActivePlayer] = useState(null);
  const config = useCommercialConfig();
  const format = videoFormatById[formatId];
  const catalogItem = id => config.catalog?.services?.find(item => item.id === id) || SERVICE_BY_ID[id];
  const selectedService = catalogItem(formatId);
  const startingPrice = Math.min(...videoFormats.map(item => catalogItem(item.id).base));
  const price = propertyPrice(selectedService, area, 'Casa');
  const broker = videoExtras[0];
  const openBudget = useCallback(() => setModalOpen(true), []);
  const closeBudget = useCallback(() => setModalOpen(false), []);
  const closePlayer = useCallback(() => setActivePlayer(null), []);
  const budgetSelection = useMemo(() => ({m2:area}),[area]);
  useEffect(() => { window.scrollTo(0,0); }, []);

  const schema = {
    '@context':'https://schema.org','@type':'Service',name:service.h1,description:service.description,
    url:`${SITE_URL}/video-inmobiliario`,areaServed:['CABA','Zona Norte de Buenos Aires'],
    provider:{'@type':'LocalBusiness',name:'ARKO Studio',url:SITE_URL,telephone:'+54 9 11 7649-8888'},
  };
  const playerProps = {activePlayer,onPlay:setActivePlayer,onClose:closePlayer};

  return (
    <div className="photography-page video-service-page font-body">
      <Seo {...service} path="/video-inmobiliario" image={`${SITE_URL}/portfolio-web/Virazon/Portada.jpg`} schema={schema} />
      <Navbar onOpenModal={openBudget} />
      <main>
        <section className="photo-hero photo-section video-hero">
          <div className="photo-hero-copy"><Link to="/" className="photo-back">ARKO STUDIO / SERVICIOS</Link><p className="photo-kicker">PRODUCCIÓN DE VIDEO INMOBILIARIO</p><h1>Video<br />inmobiliario.<br /><em>Con otro ritmo.</em></h1><p className="photo-hero-description">Una mirada que recorre, conecta y pone en valor tu propiedad. Cinematográfico, reel o FPV: elegimos el formato según lo que querés contar y dónde lo vas a publicar.</p><div className="photo-hero-actions"><a className="photo-button" href="#video-formatos">Ver los tres formatos</a><button className="photo-text-link" onClick={openBudget}>Coordinar una producción</button></div><p className="photo-hero-price">Desde <strong>{money(startingPrice)}</strong><span>Por formato · hasta 100 m² · IVA incluido</span></p></div>
          <div className="video-hero-art"><VideoExample format={videoFormats[0]} playerKey="hero-cine" {...playerProps} hero /><div className="video-hero-footnote"><span>PROPIEDADES REALES. HISTORIAS EN MOVIMIENTO.</span><a href={`https://www.youtube.com/watch?v=${videoFormats[0].videoId}`} target="_blank" rel="noreferrer">Ver en YouTube</a></div></div>
        </section>
        <nav className="photo-page-nav photo-section" aria-label="Secciones de video"><a href="#video-formatos">Ejemplos y formatos</a><a href="#video-objetivo">Cuál te conviene</a><a href="#video-proceso">Cómo lo hacemos</a><a href="#video-preparacion">Qué preparar</a><a href="#video-precio">Precio</a></nav>

        <section id="video-formatos" className="photo-section video-formats" aria-labelledby="video-formats-title"><div className="video-section-heading"><div><p className="photo-kicker">PRIMERO, MIRÁ LA DIFERENCIA</p><h2 id="video-formats-title">Tres maneras de mostrar.<br /><em>Una intención para cada una.</em></h2></div><p>Ejemplos reales de nuestro trabajo. Mirá cómo cambia la experiencia y elegí según lo que buscás conseguir.</p></div><div className="video-format-grid">{videoFormats.map(item=><article className={`video-format-card ${formatId===item.id?'is-selected':''}`} key={item.id}><VideoExample format={item} playerKey={`format-${item.id}`} {...playerProps} /><div className="video-format-copy"><p className="photo-kicker">{item.label}</p><h3>{item.name}</h3><p className="video-format-title">{item.title}</p><p>{item.description}</p><ul>{item.benefits.map(benefit=><li key={benefit}><span aria-hidden="true">✓</span>{benefit}</li>)}</ul><div className="video-format-bottom"><span>{item.channels}</span><a className="photo-text-link" href="#video-precio" onClick={()=>setFormatId(item.id)}>Ver precio de {item.name.toLowerCase()}</a></div></div></article>)}</div><p className="video-format-notice">Los ejemplos muestran trabajos completos. La duración, los ambientes y el formato de tu pieza se definen al presupuestar.</p></section>

        <section id="video-objetivo" className="photo-section video-recommendation" aria-labelledby="video-goal-title"><div><p className="photo-kicker">EMPECEMOS POR TU OBJETIVO</p><h2 id="video-goal-title">¿Qué querés<br /><em>que se lleven al verlo?</em></h2><p>Un mismo inmueble puede necesitar más de un formato. Esta guía te ayuda a elegir por dónde empezar.</p></div><div><div className="video-goal-options" role="group" aria-label="Objetivo del video">{videoFormats.map(item=><button key={item.id} type="button" aria-pressed={formatId===item.id} onClick={()=>setFormatId(item.id)}><span className="video-option-indicator" aria-hidden="true" />{item.goal}</button>)}</div><div className="video-recommendation-result" aria-live="polite"><span className="photo-kicker">{format.name.toUpperCase()}</span><h3>{format.recommendation}</h3><p>{format.reason}</p><p className="video-recommendation-requirement"><strong>Qué necesitamos:</strong> {format.requirement}</p></div></div></section>

        <VideoProcess />

        <section className="video-craft-section"><div className="photo-section video-craft-inner"><div><p className="photo-kicker">EL OFICIO ESTÁ EN LOS DETALLES</p><h2>Equipamiento profesional.<br /><em>Decisiones cuidadas.</em></h2><p>La cámara y el gimbal son el punto de partida. La elección de las tomas, el montaje, el color y el sonido construyen el resultado.</p></div><div className="video-craft-grid"><article><span className="material-symbols-outlined" aria-hidden="true">videocam</span><h3>Cámara y gimbal</h3><p>Estabilización y movimientos controlados para cinematográficos y reels. Para FPV, un recorrido planificado con drone.</p></article><article><span className="material-symbols-outlined" aria-hidden="true">speed</span><h3>Speed ramps</h3><p>Cambios graduales de velocidad para conectar tomas y dirigir la atención, cuando el ritmo de la pieza lo pide.</p></article><article><span className="material-symbols-outlined" aria-hidden="true">palette</span><h3>Color grading</h3><p>Una terminación coherente de luz, contraste y color, cuidando la apariencia de los materiales y los ambientes.</p></article><article><span className="material-symbols-outlined" aria-hidden="true">graphic_eq</span><h3>Diseño sonoro</h3><p>Música licenciada para el uso acordado, ambientes, efectos de sonido y una mezcla que acompaña la imagen.</p></article></div></div></section>

        <section id="video-preparacion" className="photo-preparation photo-section" aria-labelledby="video-prep-title"><div className="photo-prep-intro"><p className="photo-kicker">ANTES DEL DÍA DE GRABACIÓN</p><h2 id="video-prep-title">La tranquilidad<br /><em>también se prepara.</em></h2><p>Un buen video necesita tiempo para elegir las tomas. Llegar con el inmueble listo y la logística resuelta nos permite dedicar la sesión a producir.</p><p className="photo-small-note">La limpieza, el orden y el movimiento de objetos pesados, frágiles o personales quedan a cargo del propietario. La duración del rodaje se acuerda antes de reservar.</p><button className="photo-text-link" type="button" onClick={()=>window.print()}>Imprimir la checklist</button></div><div className="photo-checklist">{preparation.map(([title,copy])=><label key={title}><input type="checkbox" /><span><strong>{title}</strong><span>{copy}</span></span></label>)}</div></section>

        <section className="video-broker-section photo-section"><div><p className="photo-kicker">TAMBIÉN PUEDE TENER TU VOZ</p><h2>Presentá la propiedad.<br /><em>Contá lo que la hace especial.</em></h2></div><div><p>Podemos sumar tu participación en cámara como broker o representante. Definimos el mensaje, preparamos una guía breve y reservamos el tiempo para grabarlo.</p><p className="photo-small-note">Es un adicional que se coordina antes del rodaje.{broker ? ` Valor de referencia: ${money(broker.price)}, IVA incluido.` : ' Lo incluimos en la propuesta si lo necesitás.'}</p></div></section>

        <section id="video-precio" className="photo-pricing photo-section" aria-labelledby="video-price-title"><div><p className="photo-kicker">ELEGÍ EL FORMATO, DEFINAMOS EL ALCANCE</p><h2 id="video-price-title">Tu próxima pieza.<br /><em>Desde una propuesta clara.</em></h2><p>El precio se calcula por formato y superficie. Definimos duración, espacios, identidad y canales de publicación al armar tu propuesta.</p><ul className="photo-price-includes"><li>Planificación y producción profesional</li><li>Montaje y edición de la pieza</li><li>Color grading y diseño sonoro</li><li>Música licenciada para el uso acordado</li><li>Archivo final mediante enlace privado</li></ul><Link className="photo-text-link" to="/#precios">Conocé los packs con fotografía y tour virtual</Link></div><div className="photo-price-panel"><label className="video-price-format-label" htmlFor="video-price-format">Formato de video</label><select id="video-price-format" value={formatId} onChange={event=>setFormatId(event.target.value)}>{videoFormats.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><label htmlFor="video-area">Superficie de la propiedad <strong>{area} m²</strong></label><input id="video-area" type="range" min="100" max="500" step="100" value={area} onChange={event=>setArea(Number(event.target.value))} /><div className="photo-area-limits"><span>Hasta 100 m²</span><span>500 m²</span></div><output className="photo-price-total" htmlFor="video-area video-price-format" aria-live="polite">{money(price)}<span>{format.name} · IVA incluido · pesos argentinos</span></output><p className="photo-price-detail">Estimación para una casa o departamento de hasta {area} m². Cada tramo adicional de 100 m² suma {money(selectedService.per100)}.</p><section className="video-price-extras" aria-labelledby="video-extras-title"><h3 id="video-extras-title">Adicionales opcionales</h3><dl>{videoExtras.map(extra=><div key={extra.name}><dt>{extra.name}<span>{extra.description}</span></dt><dd>+ {money(extra.price)}</dd></div>)}</dl><p>Se suman al precio del video. IVA incluido.</p></section><button className="photo-button" onClick={openBudget}>Solicitar mi presupuesto</button><p className="photo-price-footnote">El valor final se confirma según ubicación y alcance. Para inmuebles especiales o superficies mayores, consultanos.</p></div></section>

        <section className="video-delivery-section photo-section"><div><p className="photo-kicker">DESPUÉS DE GRABAR, SEGUIMOS TRABAJANDO</p><h2>Seleccionar. Montar.<br /><em>Dar la terminación.</em></h2><p>El video pasa por selección de tomas, edición, color y sonido antes de exportarse. Acordamos la fecha de entrega según el trabajo que necesita tu pieza.</p></div><div><span className="video-delivery-time">72 h</span><p>Plazo habitual de referencia después de la producción. Confirmamos la fecha al presupuestar.</p><div className="video-delivery-files"><span className="material-symbols-outlined" aria-hidden="true">download</span><p>Descargá el archivo desde el enlace privado para conservar la calidad de entrega.</p></div></div></section>

        <section className="photo-faq photo-section" id="video-preguntas" aria-labelledby="video-faq-title"><div><p className="photo-kicker">ANTES DE COORDINAR</p><h2 id="video-faq-title">Las preguntas,<br /><em>resueltas.</em></h2></div><div>{questions.map(([question,answer])=><details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
        <section className="photo-final-cta photo-section"><p className="photo-kicker">UNA PROPIEDAD. MUCHAS FORMAS DE CONTARLA.</p><h2>Encontrémosle<br /><em>su propio ritmo.</em></h2><button className="photo-button" onClick={openBudget}>Coordinar mi producción</button><p>CABA y Zona Norte · Otras zonas, a consultar</p></section>
        <nav className="photo-other-services photo-section" aria-label="Otros servicios"><span>Completá la perspectiva</span>{serviceLinks.filter(item=>item.slug!=='video-inmobiliario').map(item=><Link key={item.slug} to={`/${item.slug}`}>{services[item.slug].eyebrow}</Link>)}</nav>
      </main>
      <Footer /><WhatsAppFAB />
      <BudgetModal isOpen={modalOpen} onClose={closeBudget} initialSelection={budgetSelection} />
    </div>
  );
}
