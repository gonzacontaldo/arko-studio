import {addonAvailable,completeCatalog,PRICING_VERSION,ADJUSTMENTS,HOSTING_INCLUDED,HOSTING_RENEWAL,HOSTING_EXPIRY} from '../../src/components/pricingData.js';
import {estimateProduction,selectionFor,quoteSummary} from '../../src/lib/productionQuote.js';
import {PROPERTY_TYPES} from '../../src/lib/propertyPricing.js';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export const TIMINGS = ['Esta semana', 'En las próximas 2 semanas', 'Dentro de un mes', 'Más adelante', 'Todavía no tengo fecha'];
export const VIDEO_IDS = ['cine', 'fpv', 'reel'];
export class FlowError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export const money = n => `$ ${Number(n).toLocaleString('es-AR')}`;
export function cleanText(value,max,label) {
 if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u0008\u000b-\u001f]/.test(value))throw new FlowError(`Revisá ${label}.`);
 return value.trim();
}
export function validateRequest(input,catalogInput){
 const catalog=completeCatalog(catalogInput);
 const name=cleanText(input.name,120,'tu nombre'),email=cleanText(input.email,254,'tu email').toLowerCase();
 if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email))throw new FlowError('Ingresá un email válido.');
 const zone=cleanText(input.zone,200,'la zona'),timing=input.timing==null||input.timing===''?'A definir al reservar':cleanText(input.timing,80,'el plazo');
 if(timing!=='A definir al reservar'&&!TIMINGS.includes(timing))throw new FlowError('Seleccioná un plazo de producción.');
 const m2=Number(input.m2);if(!Number.isFinite(m2)||m2<1||m2>100000)throw new FlowError('Ingresá una superficie entre 1 y 100.000 m².');
 const propertyType=input.propertyType||'Casa';if(!PROPERTY_TYPES.includes(propertyType))throw new FlowError('Seleccioná un tipo de propiedad válido.');
 const rawServices=input.services||[],rawVideos=input.videos||[],addons=input.addons||[];
 if(!Array.isArray(rawServices)||new Set(rawServices).size!==rawServices.length||rawServices.some(id=>!catalog.services.some(row=>row.id===id)))throw new FlowError('Revisá los servicios.');
 if(!Array.isArray(rawVideos)||new Set(rawVideos).size!==rawVideos.length||rawVideos.some(id=>!VIDEO_IDS.includes(id)))throw new FlowError('Revisá los formatos de video.');
 if(rawServices.includes('tour')&&rawServices.includes('matterport'))throw new FlowError('Elegí una sola plataforma de tour.');
 const s=selectionFor({...input,propertyType,m2,zone,locationCategory:input.locationCategory||(/\bCABA\b|ciudad aut[oó]noma de buenos aires/i.test(zone)?'caba':'other')});
 if(!['caba','other'].includes(s.locationCategory))throw new FlowError('Indicá si la propiedad está en CABA o en otra zona.');
 if(!['kuula','matterport'].includes(s.tourPlatform)||![3,6,12].includes(s.hostingMonths))throw new FlowError('Revisá la plataforma y el hosting.');
 if(s.pack!=='custom'&&!catalog.packs.some(row=>row.id===s.pack))throw new FlowError('Seleccioná un pack válido.');
 if(s.pack==='custom'&&!s.services.length)throw new FlowError('Elegí al menos un servicio.');
 if(!['fpv','cine'].includes(s.variant))throw new FlowError('Revisá la variante de Destacado.');
 const videos=s.pack==='custom'?s.services.filter(id=>VIDEO_IDS.includes(id)):s.videos;
 const cineCount=videos.filter(id=>['cine','reel'].includes(id)).length;
 if((s.pack==='base'&&videos.length)||(s.pack==='destacado'&&(videos.length!==1||(s.variant==='fpv'?!videos.includes('fpv'):cineCount!==1)))||(s.pack==='completo'&&(videos.length!==2||!videos.includes('fpv')||cineCount!==1)))throw new FlowError('Elegí FPV o un cinematográfico/reel en Destacado; Completo incluye FPV + un cinematográfico o un reel.');
 const serviceIds=s.pack==='custom'?s.services:catalog.packs.find(p=>p.id===s.pack).services;
 if(!serviceIds.includes('tour')&&s.hostingMonths!==3)throw new FlowError('El hosting extendido requiere contratar un tour.');
 if(!Array.isArray(addons)||new Set(addons).size!==addons.length||addons.some(name=>!catalog.addons.some(a=>a.name===name&&addonAvailable(a,serviceIds,videos))))throw new FlowError('Revisá los adicionales compatibles con tu selección.');
 if(input.message&&(typeof input.message!=='string'||input.message.length>2000))throw new FlowError('El comentario es demasiado largo.');
 const e=estimateProduction({...s,addons},catalog);
 if(e.knownSubtotal!=null&&(!Number.isSafeInteger(e.knownSubtotal)||e.knownSubtotal<=0))throw new FlowError('El precio requiere revisión.',503);
 const allDetails=[...e.services,...e.videos].map(row=>({name:row.name,description:row.desc}));
 const serviceNames=e.services.filter(row=>!VIDEO_IDS.includes(row.id)).map(row=>row.name);
 const videoNames=e.videoIds.map(id=>catalog.services.find(row=>row.id===id).name);
 const commercialConditions=[ADJUSTMENTS,...(e.hasTour?[HOSTING_INCLUDED,HOSTING_RENEWAL,HOSTING_EXPIRY]:[]),'Precios en pesos argentinos.','El tiempo en la propiedad depende de la superficie y los servicios. La edición se realiza después de la producción.'].join('\n');
 return {name,email,zone,timing,m2,pack:s.pack,variant:s.variant,videos,addons,tourPlatform:e.tourPlatform,hostingMonths:e.hostingMonths,locationCategory:s.locationCategory,message:(input.message||'').trim(),snapshot:{pricingVersion:PRICING_VERSION,propertyType,requiresReview:e.requiresReview,pack:e.pack?.name||'A la carta',variant:s.variant,services:serviceNames,videos:videoNames,serviceDetails:allDetails,lineItems:e.requiresReview?[]:e.lineItems,knownLineItems:e.lineItems,addons:e.extras.map(a=>({name:a.name,price:a.price,description:a.desc})),tourPlatform:e.tourPlatform,hostingMonths:e.hostingMonths,hostingPending:e.hasTour&&e.hostingMonths>3,locationCategory:s.locationCategory,travel:e.travel,productionSubtotal:e.productionSubtotal,knownSubtotal:e.knownSubtotal,pendingReasons:e.reasons,summary:quoteSummary(e),commercialConditions,total:e.total}};
}
export function validateCatalog(c){
 if(!c||c.pricingVersion!==PRICING_VERSION||!Array.isArray(c.services)||!Array.isArray(c.packs)||!Array.isArray(c.addons))throw new FlowError('Actualizá el catálogo a las nuevas reglas de precios.');
 if(c.packs.length!==3||['base','destacado','completo'].some(id=>!c.packs.some(p=>p.id===id)))throw new FlowError('El catálogo debe tener Base, Destacado y Completo.');
 if(c.services.some(row=>!Number.isSafeInteger(row.base)||row.base<1||(!Number.isSafeInteger(row.per100)||row.per100<0)))throw new FlowError('Revisá la tarifa base y el incremento por bloque de los individuales.');
 const ids=c.services.map(row=>row.id);if(new Set(ids).size!==ids.length||['foto','fpv','cine','reel','tour','matterport','planos'].some(id=>!ids.includes(id)))throw new FlowError('Revisá los servicios del catálogo.');
 const validPrice=row=>row&&Number.isSafeInteger(row.base)&&row.base>0&&Number.isSafeInteger(row.per100)&&row.per100>=0;
 for(const p of c.packs)if(!validPrice(p)||!Array.isArray(p.services)||['foto','planos','tour'].some(id=>!p.services.includes(id))||(p.videos||0)!==({base:0,destacado:1,completo:2})[p.id]||(p.id==='destacado'&&(!validPrice(p.variants?.fpv)||!validPrice(p.variants?.cine))))throw new FlowError('Revisá los paquetes y las variantes.');
 if(c.addons.some(a=>!a.name||!Number.isSafeInteger(a.price)||a.price<0||a.name==='Tour en Matterport')||new Set(c.addons.map(a=>a.name)).size!==c.addons.length)throw new FlowError('Revisá los adicionales. Matterport se elige por separado.');
 return c;
}
function secret(){const s=process.env.QUOTE_LINK_SECRET;if(!s||s.length<32)throw new FlowError('Falta configurar los enlaces privados.',503);return s;}
export const quoteToken=id=>`${id}.${createHmac('sha256',secret()).update(`quote:${id}`).digest('base64url')}`;
export function quoteId(token){
 if(typeof token!=='string'||!/^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(token))throw new FlowError('Enlace inválido.',401);
 const id=token.split('.')[0],expected=quoteToken(id);
 if(expected.length!==token.length||!timingSafeEqual(Buffer.from(expected),Buffer.from(token)))throw new FlowError('Enlace inválido.',401);return id;
}
export const hash=v=>createHash('sha256').update(v).digest('hex');
export const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
export function renderTemplate(template,vars){const fill=t=>t.replace(/\{([a-z_]+)\}/g,(_,k)=>String(vars[k]??''));return {subject:fill(template.subject).replace(/[\r\n]/g,' '),text:fill(template.body)};}
export function verifyMpSignature({signature,requestId,dataId},key){
 if(!key||typeof signature!=='string'||!requestId||!dataId)return false;
 const p=Object.fromEntries(signature.split(',').map(x=>x.trim().split('=')));
 if(!/^\d+$/.test(p.ts||'')||!/^[0-9a-f]{64}$/i.test(p.v1||''))return false;
 return timingSafeEqual(createHmac('sha256',key).update(`id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${p.ts};`).digest(),Buffer.from(p.v1,'hex'));
}
export function paymentMatches(p,r,collectorId,isTest){return String(p.external_reference)===r.id&&Number(p.transaction_amount)===Number(r.deposit)&&p.currency_id==='ARS'&&String(p.collector_id)===String(collectorId)&&p.live_mode===!isTest;}
