import {useCallback,useMemo,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Seo from '../components/Seo';
import BudgetModal from '../components/BudgetModal';
import WhatsAppFAB from '../components/WhatsAppFAB';
import VideoExample from '../components/video/VideoExample';
import {CommercialConditions} from '../components/QuoteOptions';
import {seoGuides} from '../data/seoGuides';
import {useServiceMedia} from '../lib/serviceMedia';
import {videoFormats} from '../data/videoFormats';
import {useCommercialConfig} from '../lib/commercial';
import {completeCatalog} from '../components/pricingData';
import {money} from '../lib/productionQuote';
import './photography.css';
import './video.css';
import './contentGuide.css';

export default function ContentGuidePage({slug:givenSlug}){
 const params=useParams(),slug=givenSlug||params.guideSlug||'contenido-inmobiliario',guide=seoGuides[slug],fpv=slug==='fpv-inmobiliario';
 const [open,setOpen]=useState(false),[active,setActive]=useState(null);
 const openBudget=useCallback(()=>setOpen(true),[]),closeBudget=useCallback(()=>setOpen(false),[]),closePlayer=useCallback(()=>setActive(null),[]);
 const media=useServiceMedia('video-inmobiliario'),config=useCommercialConfig(),catalog=completeCatalog(config.catalog),service=catalog.services.find(s=>s.id==='fpv');
 const video={...videoFormats.find(v=>v.id==='fpv'),videoId:media.fpvVideo,poster:media.fpvPoster,project:media.fpvProject};
 const selection=useMemo(()=>fpv?{pack:'custom',services:['fpv'],m2:100}:null,[fpv]);
 return <div className="photography-page font-body content-guide"><Seo title={guide.title} description={guide.description} path={`/${slug}`}/><Navbar onOpenModal={openBudget}/><main>
 <section className="photo-section guide-hero"><nav aria-label="Ubicación en el sitio" className="guide-crumbs"><Link to="/">Inicio</Link><span aria-hidden="true">/</span>{fpv?<><Link to="/video-inmobiliario">Video inmobiliario</Link><span aria-hidden="true">/</span><span>FPV</span></>:<span>Contenido inmobiliario</span>}</nav><p className="photo-kicker">{guide.eyebrow}</p><h1>{guide.h1}<br/><em>{guide.lead}</em></h1><p className="guide-intro">{guide.intro}</p><div className="photo-hero-actions"><button className="photo-button" onClick={openBudget}>{fpv?'Consultar por un recorrido FPV':'Armar mi producción'}</button><a href={fpv?'#fpv-ejemplo':'#contenido-servicios'} className="photo-text-link">{fpv?'Ver un recorrido real':'Elegir los servicios'}</a></div></section>
 {fpv?<section id="fpv-ejemplo" className="photo-section guide-example"><div><p className="photo-kicker">UN TRABAJO REAL</p><h2>Recorré la propiedad<br/><em>en movimiento.</em></h2><p>{video.project}. Este ejemplo muestra el tipo de recorrido; la ruta se planifica según cada inmueble.</p></div><VideoExample format={video} playerKey="fpv-guide" activePlayer={active} onPlay={setActive} onClose={closePlayer}/></section>:<nav id="contenido-servicios" className="photo-section guide-links" aria-label="Servicios de contenido inmobiliario">{guide.links.map(([href,label])=><Link key={href} to={href}>{label}<span aria-hidden="true">↗</span></Link>)}</nav>}
 <section className="photo-section guide-editorial" aria-label={fpv?'Cómo realizamos el video FPV':'Elegir contenido para propiedades'}>{guide.sections.map(([title,copy],i)=><article key={title}><span className="photo-kicker">{String(i+1).padStart(2,'0')}</span><div><h2>{title}</h2><p>{copy}</p></div></article>)}</section>
 {fpv&&<section className="photo-section guide-price"><div><p className="photo-kicker">VIDEO FPV / PRECIO DE REFERENCIA</p><h2>Desde {money(service.base)}.</h2><p>Hasta 100 m². +{money(service.per100)} por cada bloque adicional iniciado de 100 m². Precios en pesos argentinos; traslado y adicionales compatibles aparte.</p><p>También podés elegir Destacado con FPV o combinarlo con un cinematográfico/reel en Completo.</p><button className="photo-button" onClick={openBudget}>Calcular mi recorrido FPV</button></div><details><summary>Superficie, viabilidad, traslado y ajustes</summary><CommercialConditions tour={false}/></details></section>}
 <section className="photo-faq photo-section"><div><p className="photo-kicker">ANTES DE COORDINAR</p><h2>{fpv?'Preguntas sobre FPV.':'Una producción bien definida.'}</h2></div><div>{guide.questions.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
 <section className="photo-section guide-closing"><h2>{fpv?'Elegí cómo contar la propiedad.':'Armemos el contenido de tu próxima propiedad.'}</h2><p>Compartinos el tipo de inmueble, la superficie y la ubicación. Coordinamos el alcance por WhatsApp.</p><button className="photo-button" onClick={openBudget}>Consultar mi producción</button><nav className="guide-related" aria-label="Explorar servicios relacionados">{guide.links.map(([href,label])=><Link key={href} to={href}>{label} <span aria-hidden="true">↗</span></Link>)}<Link to="/portfolio">Ver trabajos de ARKO Studio ↗</Link><Link to="/#precios">Consultar paquetes y precios ↗</Link></nav></section>
 </main><Footer/><WhatsAppFAB/><BudgetModal isOpen={open} onClose={closeBudget} initialSelection={selection}/></div>;
}
