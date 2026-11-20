import {normalizeMediaValue} from '../lib/serviceMediaValidation';
export {youtubeId,normalizeMediaValue} from '../lib/serviceMediaValidation';
import hero from '../assets/portfolio-web/Yacht/Frente-arquitectura.jpg';
import detail from '../assets/portfolio-web/Virazon/Foto3.jpg';
import photo from '../assets/BeforeAfter/After-optimized.jpg';
import videoFrame from '../assets/portfolio-web/Virazon/Foto2.jpg';
import tourFrame from '../assets/portfolio-web/DuplexOlivos/Foto1.jpg';
import aerial from '../assets/portfolio-web/Lote/Foto1.jpg';
import panorama from '../assets/portfolio-web/Lote/Portada.jpg';
import {videoFormats} from './videoFormats';
import {tourPlatforms} from './tourPlatforms';

const image=(key,label,value='',hint='')=>({key,label,type:'image',value,hint});
const text=(key,label,value='')=>({key,label,type:'text',value});
const video=(key,label,value)=>({key,label,type:'youtube',value,hint:'Pegá el enlace de YouTube, Shorts o el ID del video.'});
export const SERVICE_MEDIA = [
 {id:'fotografia-inmobiliaria',name:'Fotografía',fields:[
  image('heroImage','Foto principal',hero),text('heroAlt','Descripción de la foto principal','Frente de una propiedad fotografiado por ARKO Studio'),
  image('detailImage','Foto pequeña del inicio',detail),text('detailAlt','Descripción de la foto pequeña','Detalle de una propiedad fotografiado por ARKO Studio'),
  image('processImage','Foto del proceso animado',photo,'Se usa una misma imagen para la demostración de edición.'),
  image('finishImage','Foto del comparador y marca de agua',photo,'La simulación se aplica sobre esta misma foto. No hace falta subir un antes y un después.'),
 ],portfolio:true},
 {id:'video-inmobiliario',name:'Video',fields:[
  video('heroVideo','Video principal',videoFormats[0].videoId),image('heroPoster','Portada del video principal',videoFormats[0].poster),text('heroProject','Nombre del trabajo principal',videoFormats[0].project),
  ...videoFormats.flatMap(f=>[video(`${f.id}Video`,`Ejemplo ${f.name}`,f.videoId),image(`${f.id}Poster`,`Portada ${f.name}`,f.poster||'', 'Vacío: se usa la miniatura de YouTube.'),text(`${f.id}Project`,`Nombre del trabajo ${f.name}`,f.project)]),
  image('processImage','Foto de la animación de edición y color',videoFrame),
 ]},
 {id:'planos-2d',name:'Planos 2D',fields:[image('planImage','Plano de ejemplo','','Vacío: se mantiene el esquema interactivo actual. Si subís una imagen, reemplaza el esquema del inicio, el proceso y el ejemplo ampliado.'),text('planCaption','Descripción del ejemplo','Distribución ficticia utilizada para ilustrar el servicio.')]},
 {id:'tour-virtual-360',name:'Tours 360°',fields:[...tourPlatforms.flatMap(p=>[
  {key:`${p.id}Url`,label:`Enlace ${p.name}`,type:p.id,value:p.embedUrl,hint:'Pegá el enlace para compartir o el código iframe de la plataforma.'},
  image(`${p.id}Poster`,`Portada ${p.name}`,p.poster),text(`${p.id}Project`,`Nombre del recorrido ${p.name}`,p.project),
 ]),image('processImage','Foto del proceso animado',tourFrame)]},
 {id:'drone-inmobiliario',name:'Tomas aéreas',fields:[image('heroImage','Foto principal',aerial),text('heroAlt','Descripción de la foto principal','Fotografía aérea de un lote y sus alrededores'),text('heroCaption','Nombre del trabajo principal','CARPINCHOS / VISTA CENITAL'),image('exampleImage','Ejemplo de fotografía aérea',aerial),text('exampleAlt','Descripción del ejemplo fotográfico','Vista aérea de un terreno y su entorno'),image('processImage','Foto del proceso animado',aerial),video('exampleVideo','Ejemplo de video aéreo','z5cWA53iPu0'),image('videoPoster','Portada del video aéreo',panorama),text('videoProject','Nombre del trabajo de video','Lote en Carpinchos')]},
];
export const mediaDefinition=id=>SERVICE_MEDIA.find(s=>s.id===id);
export const mediaDefaults=id=>Object.fromEntries((mediaDefinition(id)?.fields||[]).map(f=>[f.key,f.value]));

export function normalizeServiceMedia(id,values={}){
 const def=mediaDefinition(id);if(!def)throw new Error('Servicio desconocido.');
 const data={};for(const f of def.fields)if(Object.hasOwn(values,f.key)){const value=normalizeMediaValue(f,values[f.key]);data[f.key]=f.type==='image'&&!value&&!f.key.endsWith('Poster')&&f.key!=='planImage'?f.value:value;}
 if(def.portfolio){if(!Array.isArray(values.portfolioIds||[])||(values.portfolioIds||[]).some(v=>typeof v!=='string'||v.length>100))throw new Error('Selección de trabajos inválida.');data.portfolioIds=[...new Set((values.portfolioIds||[]).filter(Boolean))].slice(0,3);}
 return data;
}
