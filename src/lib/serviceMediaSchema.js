import {normalizeMediaValue} from './serviceMediaValidation.js';
export const SERVICE_MEDIA_FIELDS={
 'fotografia-inmobiliaria':{heroImage:'image',heroAlt:'text',detailImage:'image',detailAlt:'text',processImage:'image',finishImage:'image'},
 'video-inmobiliario':{heroVideo:'youtube',heroPoster:'image',heroProject:'text',cineVideo:'youtube',cinePoster:'image',cineProject:'text',reelVideo:'youtube',reelPoster:'image',reelProject:'text',fpvVideo:'youtube',fpvPoster:'image',fpvProject:'text',processImage:'image'},
 'planos-2d':{planImage:'image',planCaption:'text'},
 'tour-virtual-360':{kuulaUrl:'kuula',kuulaPoster:'image',kuulaProject:'text',matterportUrl:'matterport',matterportPoster:'image',matterportProject:'text',processImage:'image'},
 'drone-inmobiliario':{heroImage:'image',heroAlt:'text',heroCaption:'text',exampleImage:'image',exampleAlt:'text',processImage:'image',exampleVideo:'youtube',videoPoster:'image',videoProject:'text'},
};
export function validateServiceMedia(id,values){
 const fields=SERVICE_MEDIA_FIELDS[id];if(!fields)throw new Error('Servicio desconocido.');
 if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('Contenido inválido.');
 const media={};
 for(const [key,type] of Object.entries(fields))if(Object.hasOwn(values,key)){
  if(typeof values[key]!=='string')throw new Error('El contenido debe ser texto o un enlace.');
  media[key]=normalizeMediaValue({type,label:key},values[key]);
 }
 if(id==='fotografia-inmobiliaria'){
  if(!Array.isArray(values.portfolioIds||[])||(values.portfolioIds||[]).some(v=>typeof v!=='string'||v.length>100))throw new Error('Selección de trabajos inválida.');
  media.portfolioIds=[...new Set((values.portfolioIds||[]).filter(Boolean))].slice(0,3);
 }
 return media;
}
