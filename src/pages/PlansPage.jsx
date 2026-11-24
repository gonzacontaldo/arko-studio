import {money} from '../lib/productionQuote';
import {CommercialConditions} from '../components/QuoteOptions';
import {useServiceMedia} from '../lib/serviceMedia';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BudgetModal from '../components/BudgetModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import Seo, { SITE_URL } from '../components/Seo';
import FloorPlanIllustration, { planRooms } from '../components/plans/FloorPlanIllustration';
import PlanProcess from '../components/plans/PlanProcess';
import { services, serviceLinks } from '../data/services';
import { SERVICE_BY_ID } from '../components/pricingData';
import { useCommercialConfig } from '../lib/commercial';
import { propertyPrice } from '../lib/propertyPricing';
import './photography.css';
import './plans.css';

const service=services['planos-2d'];
const questions=[
  ['¿Es un plano arquitectónico?', 'No. Es un plano esquemático para publicaciones inmobiliarias: muestra la distribución y la relación entre los ambientes a partir del relevamiento. No incluye proyecto arquitectónico ni documentación de obra.'],
  ['¿Un plano esquemático también se mide?', 'Sí. Tomamos las medidas con un medidor láser en el inmueble. La palabra esquemático se refiere a la forma de presentar la información y a su finalidad: ayudar a entender la distribución de la propiedad.'],
  ['¿Cuándo toman las medidas?', 'Realizamos el relevamiento presencial el día del servicio. Necesitamos acceso a los ambientes incluidos y condiciones que permitan tomar las medidas. Si contrataste otros servicios, coordinamos el relevamiento dentro de la visita prevista.'],
  ['¿El plano se hace durante la visita?', 'Durante la visita relevamos las medidas y la disposición de los espacios. Después elaboramos el plano esquemático. El formato y la fecha de entrega se confirman al coordinar, según la superficie y el alcance del trabajo.'],
  ['¿Necesito tener un plano anterior?', 'Si tenés un plano o alguna referencia, podés compartirlo al consultar. El trabajo que ofrecemos se basa en el relevamiento con medición láser que realizamos en el inmueble.'],
  ['¿Qué tengo que preparar?', 'Coordiná el acceso a todos los espacios que vayamos a incluir, prepará las llaves y despejá los puntos necesarios para medir. Avisanos si hay ambientes cerrados, sectores ocupados o restricciones de ingreso.'],
  ['¿Cómo se entrega y para qué lo uso?', 'Entregamos un archivo digital del plano esquemático para acompañar publicaciones y presentaciones de la propiedad. Acordamos el formato de entrega al coordinar el servicio. Complementa las fotos, el video y el tour virtual mostrando la distribución en una sola imagen.'],
];

export default function PlansPage(){
  const media=useServiceMedia('planos-2d');
  const [modalOpen,setModalOpen]=useState(false),[area,setArea]=useState(100),[roomId,setRoomId]=useState('living');
  const dialog=useRef(null);
  const config=useCommercialConfig();
  const planService=config.catalog?.services?.find(item=>item.id==='planos')||SERVICE_BY_ID.planos;
  const price=propertyPrice(planService,area,'Casa');
  const room=planRooms.find(item=>item.id===roomId);
  const openBudget=useCallback(()=>setModalOpen(true),[]),closeBudget=useCallback(()=>setModalOpen(false),[]);
  const budgetSelection=useMemo(()=>({pack:'custom',services:['planos'],m2:area}),[area]);
  useEffect(()=>{window.scrollTo(0,0);},[]);
  const schema={
    '@context':'https://schema.org','@type':'Service',name:service.h1,description:service.description,
    url:`${SITE_URL}/planos-2d`,areaServed:['CABA','Zona Norte de Buenos Aires'],
    provider:{'@type':'LocalBusiness',name:'ARKO Studio',url:SITE_URL,telephone:'+54 9 11 7649-8888'},
  };
  return <div className="photography-page plan-service-page font-body">
    <Seo {...service} path="/planos-2d" image={`${SITE_URL}/favicon.png`} schema={schema}/>
    <Navbar onOpenModal={openBudget}/>
    <main>
      <section className="photo-hero photo-section plan-hero"><div className="photo-hero-copy"><Link to="/" className="photo-back">ARKO STUDIO / SERVICIOS</Link><p className="photo-kicker">PLANOS 2D CON MEDICIÓN LÁSER</p><h1>Planos 2D.<br /><em>Tu propiedad,<br/>de un vistazo.</em></h1><p className="photo-hero-description">Elaboramos planos 2D para inmobiliarias y propiedades en CABA y Zona Norte de Buenos Aires. Relevamos las medidas con láser el día del servicio y después preparamos un plano esquemático para mostrar su distribución.</p><p className="plan-hero-scope">Plano esquemático para publicaciones inmobiliarias. No es un plano arquitectónico.</p><div className="photo-hero-actions"><a className="photo-button" href="#plan-proceso">Conocé cómo lo hacemos</a><button className="photo-text-link" onClick={openBudget}>Coordinar el servicio</button></div><p className="photo-hero-price">Desde <strong>{money(planService.base)}</strong><span>Hasta 100 m² · Precios en pesos argentinos</span></p></div><div className="plan-hero-art"><div className="plan-hero-paper"><div className="plan-paper-heading"><span>ARKO STUDIO</span><span>PLANO ESQUEMÁTICO / 2D</span></div><FloorPlanIllustration/><div className="plan-paper-footer"><span>Distribución y relación entre ambientes</span><span>EJEMPLO ILUSTRATIVO</span></div></div><p className="plan-illustration-note">{media.planCaption}</p></div></section>
      <nav className="photo-page-nav photo-section" aria-label="Secciones de planos 2D"><a href="#plan-proceso">El proceso</a><a href="#plan-ejemplo">Explorá el esquema</a><a href="#plan-alcance">Qué incluye</a><a href="#plan-preparacion">Qué preparar</a><a href="#plan-precio">Precio</a></nav>
      <PlanProcess/>

      <section className="photo-section plan-explorer" id="plan-ejemplo" aria-labelledby="plan-example-title"><div className="plan-section-heading"><div><p className="photo-kicker">UN COMPLEMENTO PARA MOSTRAR LA PROPIEDAD</p><h2 id="plan-example-title">Las fotos muestran.<br /><em>El plano ubica.</em></h2></div><p>{media.planImage?'Explorá el ejemplo y amplialo para ver la distribución de los ambientes.':'Elegí un ambiente en este ejemplo para ver cómo una representación simple ayuda a entender su relación con el resto.'}</p></div><div className="plan-explorer-layout"><div className="plan-example-image"><FloorPlanIllustration selected={roomId}/><button className="plan-expand" onClick={()=>dialog.current?.showModal()} type="button"><span className="material-symbols-outlined" aria-hidden="true">open_in_full</span>Ampliar esquema</button></div><div className="plan-explorer-controls"><p className="photo-kicker">LEÉ LA DISTRIBUCIÓN</p>{!media.planImage&&<><div role="group" aria-label="Ambientes del ejemplo">{planRooms.map(item=><button key={item.id} aria-pressed={roomId===item.id} onClick={()=>setRoomId(item.id)}>{item.label}<span aria-hidden="true">{roomId===item.id?'—':'+'}</span></button>)}</div><div className="plan-room-description" aria-live="polite"><h3>{room.label}</h3><p>{room.description}</p></div></>}<p className="plan-illustration-note">{media.planCaption}</p></div></div></section>

      <section className="plan-scope-section" id="plan-alcance" aria-labelledby="plan-scope-title"><div className="photo-section plan-scope-inner"><div><p className="photo-kicker">EL ALCANCE, DESDE EL PRINCIPIO</p><h2 id="plan-scope-title">Medido en el lugar.<br /><em>Pensado para entenderlo.</em></h2><p>Tomar medidas con láser y entregar un esquema son dos partes del mismo servicio. La medición alimenta una representación clara para la presentación inmobiliaria.</p></div><div><article><span className="material-symbols-outlined" aria-hidden="true">grid_view</span><h3>Lo que muestra el plano</h3><p>La distribución general, los ambientes identificados y la relación entre los espacios, con la información de referencia acordada del relevamiento.</p></article><article><span className="material-symbols-outlined" aria-hidden="true">description</span><h3>Un esquema, no un proyecto arquitectónico</h3><p>Su finalidad es acompañar la publicación de la propiedad. No incluye diseño arquitectónico ni documentación de obra.</p></article></div></div></section>

      <section className="photo-preparation photo-section" id="plan-preparacion" aria-labelledby="plan-prep-title"><div className="photo-prep-intro"><p className="photo-kicker">ANTES DEL RELEVAMIENTO</p><h2 id="plan-prep-title">Prepará el acceso.<br /><em>Nosotros tomamos las medidas.</em></h2><p>Con los espacios disponibles y los puntos de medición despejados, podemos aprovechar mejor el tiempo en el inmueble.</p><p className="photo-small-note">Si hay sectores a los que no se puede ingresar, avisalo al coordinar para definir el alcance del relevamiento.</p></div><div className="photo-checklist">{[
        ['Todos los ambientes incluidos, accesibles','Prepará llaves y coordiná el ingreso a los espacios que necesitemos relevar.'],
        ['Puntos de medición despejados','Dejá disponibles los puntos y las referencias necesarias para tomar medidas.'],
        ['Una persona que facilite el acceso','Coordiná quién nos recibe y puede resolver el ingreso a los distintos sectores.'],
        ['La información del inmueble, compartida','Contanos la superficie estimada y qué ambientes querés incluir en el plano.'],
      ].map(([title,copy])=><label key={title}><input type="checkbox"/><span><strong>{title}</strong><span>{copy}</span></span></label>)}</div></section>

      <section className="photo-pricing photo-section" id="plan-precio" aria-labelledby="plan-price-title"><div><p className="photo-kicker">RELEVAMIENTO + ELABORACIÓN</p><h2 id="plan-price-title">Un plano claro.<br /><em>Un alcance acordado.</em></h2><p>El servicio contempla la toma de medidas con láser en el inmueble y la elaboración posterior del plano esquemático.</p><ul className="photo-price-includes"><li>Relevamiento presencial con medición láser</li><li>Elaboración posterior del esquema 2D</li><li>Identificación y distribución de ambientes</li><li>Archivo digital para tu publicación</li></ul><Link className="photo-text-link" to="/#precios">Combiná planos, fotografías y tour virtual en un pack</Link></div><div className="photo-price-panel"><p className="photo-kicker">PLANOS 2D ESQUEMÁTICOS</p><label htmlFor="plan-area">Superficie de la propiedad <strong>{area} m²</strong></label><input id="plan-area" type="range" min="100" max="500" step="1" value={area} onChange={event=>setArea(Number(event.target.value))}/><div className="photo-area-limits"><span>Hasta 100 m²</span><span>500 m²</span></div><output className="photo-price-total" htmlFor="plan-area" aria-live="polite">{money(price)}<span>Precios en pesos argentinos</span></output><p className="photo-price-detail">{`Precio base hasta 100 m². + ${money(planService.per100)} por cada bloque adicional iniciado de 100 m².`}</p><button className="photo-button" onClick={openBudget}>Solicitar mi presupuesto</button><details className="photo-price-footnote"><summary>Superficie, traslado y ajustes</summary><CommercialConditions tour={false}/></details></div></section>

      <section className="photo-section plan-delivery"><div><p className="photo-kicker">DESPUÉS DE LA VISITA</p><h2>Medir primero.<br /><em>Elaborar y entregar después.</em></h2></div><div><p>El plano se prepara a partir de la información relevada. Confirmamos la fecha y el formato de entrega al coordinar el servicio, según la superficie y los espacios incluidos.</p><p className="photo-small-note">Si tenés una fecha prevista para publicar, contanos al consultar para organizar la entrega.</p></div></section>
      <section className="photo-faq photo-section" id="plan-preguntas" aria-labelledby="plan-faq-title"><div><p className="photo-kicker">ANTES DE COORDINAR</p><h2 id="plan-faq-title">El servicio,<br /><em>bien definido.</em></h2></div><div>{questions.map(([question,answer])=><details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <section className="photo-final-cta photo-section"><p className="photo-kicker">AYUDEMOS A ENTENDER TU PROPIEDAD</p><h2>Cada ambiente,<br /><em>en su lugar.</em></h2><button className="photo-button" onClick={openBudget}>Coordinar el relevamiento</button><p>CABA y Zona Norte · Otras zonas, a consultar</p></section>
      <nav className="photo-other-services photo-section" aria-label="Otros servicios"><span>Completá la perspectiva</span>{serviceLinks.filter(item=>item.slug!=='planos-2d').map(item=><Link key={item.slug} to={`/${item.slug}`}>{services[item.slug].eyebrow}</Link>)}</nav>
    </main>
    <Footer/><WhatsAppFAB/>
    <BudgetModal isOpen={modalOpen} onClose={closeBudget} initialSelection={budgetSelection}/>
    <dialog ref={dialog} className="plan-example-dialog" aria-labelledby="plan-dialog-title" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}><div className="plan-dialog-content"><header><h2 id="plan-dialog-title">Ejemplo ilustrativo de plano esquemático</h2><button type="button" onClick={()=>dialog.current?.close()} aria-label="Cerrar esquema ampliado">×</button></header><div className="plan-dialog-viewport" tabIndex="0" role="region" aria-label="Plano ampliado"><FloorPlanIllustration selected={roomId}/></div><p><span className="plan-zoom-tip">Deslizá el esquema para ver todos los ambientes. </span>{media.planCaption}</p></div></dialog>
  </div>;
}
