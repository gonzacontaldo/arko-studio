import {useState,useEffect,useCallback} from 'react';
import {Link} from 'react-router-dom';
import {FILTERS} from '../data/portfolioItems';
import {fetchPortfolio} from '../lib/portfolio';
import {loadServiceMedia} from '../lib/serviceMedia';
import {selectedPortfolio} from '../lib/portfolioSelection';
import PropertyModal from '../components/PropertyModal';
import Footer from '../components/Footer';
import WhatsAppFAB from '../components/WhatsAppFAB';
import logoImg from '../assets/Logo.png';
import Seo from '../components/Seo';
import './portfolioJournal.css';

const typeNames={foto:'Fotografía',video:'Video',tour:'Tour 360°',dron:'Tomas aéreas'};
const tags=item=>item.types.map(type=>typeNames[type]).filter(Boolean);
function Story({item,index,lead=false,onOpen}){
 const detail=item.fotos.find(url=>url!==item.cover);
 return <article className={`journal-story ${lead?'journal-lead':`journal-story-${(index-1)%3}`}`}>
  <div className="journal-story-topline"><span>{String(index+1).padStart(2,'0')} / {lead?'EN PORTADA':'UNA MIRADA AL ESPACIO'}</span><span>ARKO STUDIO</span></div>
  <button className="journal-image-button" onClick={()=>onOpen(item)} aria-label={`Explorar ${item.title}`}><img src={item.cover||item.fotos[0]} alt={item.title} loading={lead?'eager':'lazy'} fetchPriority={lead?'high':'auto'}/><span className="journal-image-cta">EXPLORAR EL TRABAJO <span aria-hidden="true">↗</span></span></button>
  <div className="journal-story-copy"><div className="journal-story-heading"><p>{tags(item).join(' / ')}</p><h2><button onClick={()=>onOpen(item)}>{item.title}</button></h2></div><div className="journal-story-note"><p>{item.types.includes('tour')?'Fotografías y recorridos para conocer el espacio desde distintas perspectivas.':item.types.includes('video')?'Una producción visual que reúne la arquitectura, sus detalles y el movimiento.':'Una mirada a los espacios, la luz y los detalles de esta propiedad.'}</p><button className="journal-text-link" onClick={()=>onOpen(item)}>Ver la producción <span aria-hidden="true">↗</span></button></div></div>
  {!lead&&(index-1)%3===2&&detail&&<button className="journal-detail" onClick={()=>onOpen(item)} aria-label={`Ver otra perspectiva de ${item.title}`}><img src={detail} alt={`Otra perspectiva de ${item.title}`} loading="lazy"/><span>OTRA PERSPECTIVA / {String(index+1).padStart(2,'0')}</span></button>}
 </article>;
}
export default function PortfolioPage(){
 const [activeFilter,setActiveFilter]=useState('all'),[items,setItems]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const close=useCallback(()=>setSelected(null),[]);
 useEffect(()=>{window.scrollTo(0,0);},[]);
 useEffect(()=>{let active=true;setLoading(true);setError('');Promise.all([fetchPortfolio(),loadServiceMedia('portfolio',{refresh:true})]).then(([rows,config])=>{if(active){setItems(selectedPortfolio(rows,config));setLoading(false);}}).catch(()=>{if(active){setError('No pudimos cargar la selección. Volvé a intentar en un momento.');setLoading(false);}});return()=>{active=false;};},[retry]);
 const filtered=activeFilter==='all'?items:items.filter(item=>item.types.includes(activeFilter));
 return <div className="portfolio-journal font-body"><Seo title="Portfolio de Fotografía y Video Inmobiliario | ARKO Studio" description="Una selección de producciones de ARKO Studio. Arquitectura, fotografía, video y recorridos inmobiliarios, presentados desde una mirada editorial." path="/portfolio"/>
 <header className="journal-header"><Link to="/" className="journal-logo" aria-label="Ir al inicio de ARKO Studio"><span><img src={logoImg} alt=""/></span><strong>ARKO STUDIO</strong></Link><Link to="/" className="journal-back"><span aria-hidden="true">←</span> Volver al inicio</Link></header>
 <main><section className="journal-masthead journal-container"><div className="journal-edition"><span>ARKO STUDIO / PORTFOLIO</span><span>ARQUITECTURA · IMAGEN · ESPACIO</span></div><div className="journal-title-row"><h1>Espacios.<br/><em>Otra mirada.</em></h1><div><span className="journal-cover-mark" aria-hidden="true">↗</span><p>Una selección de producciones. <br/>Lugares que merecen <br/>una segunda mirada.</p></div></div><div className="journal-masthead-bottom"><p>Un recorrido por nuestro trabajo, contado a través de la luz, los materiales y las formas de habitar.</p><span>FOTOGRAFÍA / VIDEO / RECORRIDOS</span></div></section>
 <section className="journal-container journal-collection" aria-label="Selección de trabajos"><div className="journal-index"><p>EN ESTA SELECCIÓN <span>{String(filtered.length).padStart(2,'0')}</span></p><div role="group" aria-label="Filtrar trabajos por servicio">{FILTERS.map(({label,value})=><button key={value} aria-pressed={activeFilter===value} onClick={()=>setActiveFilter(value)}>{label}</button>)}</div></div>
 {loading?<div className="journal-loading" role="status">Preparando la selección…</div>:error?<div className="journal-empty" role="alert"><p>{error}</p><button className="journal-text-link" onClick={()=>setRetry(n=>n+1)}>Reintentar</button></div>:!filtered.length?<div className="journal-empty"><h2>{items.length?'Otra forma de mirar.':'La próxima selección está en camino.'}</h2><p>{items.length?'Esta selección no tiene trabajos de ese formato. Explorá el resto de las producciones.':'Estamos preparando los trabajos que queremos compartir en esta edición.'}</p>{items.length>0&&<button className="journal-text-link" onClick={()=>setActiveFilter('all')}>Ver toda la selección</button>}</div>:<><Story item={filtered[0]} index={0} lead onOpen={setSelected}/>{filtered.length>1&&<div className="journal-next-chapter"><span>SEGUÍ EXPLORANDO</span><p>Más espacios.<br/><em>La misma atención al detalle.</em></p><span aria-hidden="true">↓</span></div>}<div className="journal-stories">{filtered.slice(1).map((item,i)=><Story key={item.id} item={item} index={i+1} onOpen={setSelected}/>)}</div></>}
 </section><section className="journal-closing journal-container"><span>LA PRÓXIMA HISTORIA PUEDE SER LA TUYA</span><h2>Cada propiedad tiene algo<br/><em>que merece ser visto.</em></h2><Link to="/#servicios" className="journal-text-link">Conocé cómo trabajamos <span aria-hidden="true">↗</span></Link></section></main><Footer/><WhatsAppFAB/>{selected&&<PropertyModal key={selected.id} property={selected} onClose={close}/>}</div>;
}
