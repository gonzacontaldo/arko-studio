import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BudgetModal from '../components/BudgetModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import PropertyModal from '../components/PropertyModal';
import Seo, { SITE_URL } from '../components/Seo';
import PhotoStory from '../components/photography/PhotoStory';
import PhotoFinishPreview from '../components/photography/PhotoFinishPreview';
import { services, serviceLinks } from '../data/services';
import { SERVICE_BY_ID } from '../components/pricingData';
import { useCommercialConfig } from '../lib/commercial';
import { propertyPrice } from '../lib/propertyPricing';
import { fetchPortfolio } from '../lib/portfolio';
import heroPhoto from '../assets/portfolio-web/Yacht/Frente-arquitectura.jpg';
import detailPhoto from '../assets/portfolio-web/Virazon/Foto3.jpg';
import './photography.css';

const service = services['fotografia-inmobiliaria'];
const money = value => `$ ${Math.round(value).toLocaleString('es-AR')}`;
const preparation = [
  ['En toda la propiedad', 'Limpieza terminada, pisos despejados y cortinas abiertas. Revisá las lámparas y coordiná el acceso a todos los ambientes.'],
  ['Living y comedor', 'Mesas despejadas, televisión apagada y cables guardados. Dejá solo la decoración que ayude a mostrar el ambiente.'],
  ['Cocina y baños', 'Mesadas libres, espejos y vidrios limpios. Guardá vajilla, productos de limpieza y artículos de uso personal.'],
  ['Dormitorios y exteriores', 'Camas hechas, ropa y objetos personales guardados. Prepará balcones, jardín y espacios exteriores que vayamos a fotografiar.'],
];
const faqs = [
  ['¿Cuántas fotos voy a recibir?', 'Definimos la cantidad y los ambientes incluidos al preparar el presupuesto. La selección busca mostrar la propiedad completa con tomas útiles, sin repetir imágenes innecesariamente.'],
  ['¿Cuánto tiempo necesitan en el inmueble?', 'Depende de la superficie, los ambientes y la luz disponible. Te confirmamos el tiempo necesario al coordinar. Una producción completa que combine fotografía, video y otros formatos puede requerir entre 4 y 5 horas; una sesión de fotografía se planifica según su alcance.'],
  ['¿Cuándo recibo las fotos?', 'El plazo habitual es de hasta 72 horas después de la producción. Acordamos la fecha concreta antes de la sesión. Si tenés una publicación o lanzamiento con una fecha límite, contanos al consultar para confirmar disponibilidad.'],
  ['¿Cómo descargo las fotos sin perder calidad?', 'Te compartimos un enlace privado para descargar los archivos de entrega en alta resolución y sus versiones optimizadas para web. Guardalos desde ese enlace: reenviarlos como imágenes por mensajería puede comprimirlos.'],
  ['¿Pueden poner mi logo o marca de agua?', 'Sí. Nos enviás el logo o la marca que quieras usar y acordamos la ubicación y el tamaño antes de preparar los archivos finales.'],
  ['¿Qué pasa si el inmueble no está listo o el clima no acompaña?', 'Conviene avisarnos antes de la sesión para revisar la planificación. La limpieza, el orden y el movimiento de objetos personales o pesados deben estar resueltos por el propietario. Si la luz o el clima impiden las tomas previstas, coordinamos cómo continuar.'],
];

export default function PhotographyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [area, setArea] = useState(100);
  const [portfolio, setPortfolio] = useState([]);
  const [selected, setSelected] = useState(null);
  const config = useCommercialConfig();
  const photoService = config.catalog?.services?.find(item => item.id === 'foto') || SERVICE_BY_ID.foto;
  const price = propertyPrice(photoService, area, 'Casa');
  const openBudget = useCallback(() => setModalOpen(true), []);
  const closeBudget = useCallback(() => setModalOpen(false), []);
  const budgetSelection = useMemo(() => ({ m2: area }), [area]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    fetchPortfolio().then(items => {
      const featured = items.filter(item => item.destacado);
      if (active) setPortfolio((featured.length ? featured : items).slice(0, 3));
    });
    return () => { active = false; };
  }, []);

  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', name: service.h1, description: service.description,
    url: `${SITE_URL}/fotografia-inmobiliaria`, areaServed: ['CABA', 'Zona Norte de Buenos Aires'],
    provider: { '@type': 'LocalBusiness', name: 'ARKO Studio', url: SITE_URL, telephone: '+54 9 11 7649-8888' },
  };

  return (
    <div className="photography-page font-body">
      <Seo {...service} path="/fotografia-inmobiliaria" image={`${SITE_URL}${service.heroImage}`} schema={schema} />
      <Navbar onOpenModal={openBudget} />
      <main>
        <section className="photo-hero photo-section">
          <div className="photo-hero-copy"><Link to="/" className="photo-back">ARKO STUDIO / SERVICIOS</Link><p className="photo-kicker">FOTOGRAFÍA INMOBILIARIA</p><h1>Fotografía<br />inmobiliaria.<br /><em>Bien pensada.</em></h1><p className="photo-hero-description">Fotografía profesional que le hace justicia a tu propiedad. Desde la preparación del inmueble hasta las imágenes editadas, con tu marca y listas para publicar.</p><div className="photo-hero-actions"><button className="photo-button" onClick={openBudget}>Coordinar una producción</button><a className="photo-text-link" href="#proceso-fotografia">Conocé el proceso</a></div><p className="photo-hero-price">Desde <strong>{money(photoService.base)}</strong><span>Hasta 100 m² · IVA incluido</span></p></div>
          <div className="photo-hero-art"><img className="photo-hero-main" src={heroPhoto} alt="Frente de la casa terminada en Yacht, con fachada de madera y acceso vidriado, fotografiado por ARKO Studio" width="1920" height="1280" fetchpriority="high" /><div className="photo-hero-inset"><img src={detailPhoto} alt="Otra perspectiva de la propiedad en Virazón" width="1200" height="900" loading="lazy" /></div><div className="photo-hero-photo-caption"><span>ESPACIOS REALES. MIRADA PROFESIONAL.</span><span>CABA + ZONA NORTE</span></div></div>
        </section>
        <nav className="photo-page-nav photo-section" aria-label="Secciones de fotografía"><a href="#proceso-fotografia">El proceso</a><a href="#resultado-fotografia">Edición y marca</a><a href="#preparar-inmueble">Cómo prepararte</a><a href="#precio-fotografia">Precio</a><a href="#preguntas-fotografia">Preguntas frecuentes</a></nav>

        <PhotoStory />
        <PhotoFinishPreview />

        <section className="photo-preparation photo-section" id="preparar-inmueble" aria-labelledby="photo-prep-title"><div className="photo-prep-intro"><p className="photo-kicker">ANTES DE LA SESIÓN</p><h2 id="photo-prep-title">Vos preparás el lugar.<br /><em>Nosotros, la mirada.</em></h2><p>La preparación es parte del resultado. Esta checklist te ayuda a aprovechar el tiempo de producción.</p><p className="photo-small-note">El inmueble debe estar limpio y ordenado antes de nuestra llegada. No realizamos limpieza ni movemos objetos pesados, frágiles o personales.</p><button className="photo-text-link" onClick={() => window.print()} type="button">Imprimir la checklist</button></div><div className="photo-checklist">{preparation.map(([title, description]) => <label key={title}><input type="checkbox" /><span><strong>{title}</strong><span>{description}</span></span></label>)}</div></section>

        <section className="photo-time-section"><div className="photo-section photo-time-inner"><div><p className="photo-kicker">EL TIEMPO TAMBIÉN SE VE EN EL RESULTADO</p><h2>Sin apurar la toma.<br /><em>Sin hacerte esperar de más.</em></h2></div><div className="photo-time-notes"><div><span className="material-symbols-outlined" aria-hidden="true">schedule</span><h3>Un tiempo de sesión a medida</h3><p>Hay que recorrer, encuadrar, ajustar la luz y revisar. Confirmamos la duración según el inmueble y los servicios que elijas.</p></div><div><span className="photo-delivery-hours">72 h</span><h3>Después de la producción</h3><p>Es nuestro plazo habitual de entrega. Antes de reservar, acordamos la fecha y revisamos cualquier necesidad especial.</p></div></div></div></section>

        <section className="photo-pricing photo-section" id="precio-fotografia" aria-labelledby="photo-price-title"><div><p className="photo-kicker">UN SERVICIO CLARO, DE PRINCIPIO A FIN</p><h2 id="photo-price-title">La inversión en<br /><em>una buena presentación.</em></h2><p>Fotografía de interiores y exteriores, selección, edición profesional y archivos preparados para tus publicaciones.</p><ul className="photo-price-includes"><li>Fotografía y edición HDR</li><li>Marca de agua acordada</li><li>Alta resolución y versiones web</li><li>Entrega mediante enlace privado</li></ul><Link className="photo-text-link" to="/#precios">¿También necesitás video o tour? Conocé los packs</Link></div><div className="photo-price-panel"><p className="photo-kicker">FOTOGRAFÍA PROFESIONAL</p><label htmlFor="photo-area">Superficie de la propiedad <strong>{area} m²</strong></label><input id="photo-area" type="range" min="100" max="500" step="100" value={area} onChange={event => setArea(Number(event.target.value))} /><div className="photo-area-limits"><span>Hasta 100 m²</span><span>500 m²</span></div><output className="photo-price-total" htmlFor="photo-area" aria-live="polite">{money(price)}<span>IVA incluido · pesos argentinos</span></output><p className="photo-price-detail">{area === 100 ? 'Precio base para propiedades de hasta 100 m².' : `Estimación para una casa o departamento de hasta ${area} m².`} Cada tramo adicional de 100 m² suma {money(photoService.per100)}.</p><button className="photo-button" onClick={openBudget}>Solicitar mi presupuesto</button><p className="photo-price-footnote">El valor final se confirma según ubicación y alcance. Para inmuebles especiales o superficies mayores, consultanos.</p></div></section>

        <section className="photo-work photo-section" id="ejemplos" aria-labelledby="photo-work-title"><div className="photo-work-heading"><div><p className="photo-kicker">EL RESULTADO EN PROPIEDADES REALES</p><h2 id="photo-work-title">Cada lugar,<br /><em>bien contado.</em></h2></div><Link className="photo-text-link" to="/portfolio">Explorar el portfolio</Link></div><div className="photo-work-grid">{portfolio.map(item => <button key={item.id} className="photo-work-item" onClick={() => setSelected(item)} aria-label={`Ver fotografías de ${item.title}`}><img src={item.cover} alt={item.title} width="1200" height="900" loading="lazy" /><span>{item.title}<span aria-hidden="true">+</span></span></button>)}</div>{portfolio.length === 0 && <p className="photo-small-note">Cargando las fotografías del portfolio…</p>}</section>

        <section className="photo-faq photo-section" id="preguntas-fotografia" aria-labelledby="photo-faq-title"><div><p className="photo-kicker">ANTES DE COORDINAR</p><h2 id="photo-faq-title">Todo más claro.<br /><em>Desde el principio.</em></h2></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
        <section className="photo-final-cta photo-section"><p className="photo-kicker">MOSTREMOS LO MEJOR DE TU PROPIEDAD</p><h2>El próximo espacio<br /><em>puede ser el tuyo.</em></h2><button className="photo-button" onClick={openBudget}>Coordinar mi producción</button><p>CABA y Zona Norte · Otras zonas, a consultar</p></section>
        <nav className="photo-other-services photo-section" aria-label="Otros servicios"><span>Completá la perspectiva</span>{serviceLinks.filter(item => item.slug !== 'fotografia-inmobiliaria').map(item => <Link key={item.slug} to={`/${item.slug}`}>{services[item.slug].eyebrow}</Link>)}</nav>
      </main>
      <Footer /><WhatsAppFAB />
      <BudgetModal isOpen={modalOpen} onClose={closeBudget} initialSelection={budgetSelection} />
      {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
