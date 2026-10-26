import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export const TIMINGS = ['Esta semana', 'En las próximas 2 semanas', 'Dentro de un mes', 'Más adelante', 'Todavía no tengo fecha'];
export const VIDEO_IDS = ['cine', 'fpv', 'reel'];
export class FlowError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export const money = n => `$ ${Number(n).toLocaleString('es-AR')}`;
export function cleanText(value,max,label) {
 if(typeof value!=='string'||!value.trim()||value.length>max||/[\u0000-\u0008\u000b-\u001f]/.test(value))throw new FlowError(`Revisá ${label}.`);
 return value.trim();
}
export function validateRequest(input,catalog) {
 const name=cleanText(input.name,120,'tu nombre'),email=cleanText(input.email,254,'tu email').toLowerCase();
 if(!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email))throw new FlowError('Ingresá un email válido.');
 const zone=cleanText(input.zone,200,'la zona'),timing=cleanText(input.timing,80,'el plazo');
 if(!TIMINGS.includes(timing))throw new FlowError('Seleccioná un plazo de producción.');
 const m2=Number(input.m2);if(!Number.isFinite(m2)||m2<1||m2>100000)throw new FlowError('Ingresá una superficie entre 1 y 100.000 m².');
 const pack=catalog.packs.find(p=>p.id===input.pack);if(!pack)throw new FlowError('Seleccioná un pack válido.');
 const videos=input.videos||[],addons=input.addons||[];
 if(!Array.isArray(videos)||new Set(videos).size!==videos.length||videos.length!==(pack.videos||0)||videos.some(v=>!VIDEO_IDS.includes(v)))throw new FlowError(`Elegí ${pack.videos||0} videos para este pack.`);
 if(!Array.isArray(addons)||new Set(addons).size!==addons.length||addons.some(a=>!catalog.addons.some(x=>x.name===a)))throw new FlowError('Revisá los adicionales.');
 if(addons.length&&!videos.some(v=>v==='cine'||v==='reel'))throw new FlowError('Los adicionales requieren video cinematográfico o reel.');
 if(input.message&&(typeof input.message!=='string'||input.message.length>2000))throw new FlowError('El comentario es demasiado largo.');
 const extras=catalog.addons.filter(a=>addons.includes(a.name));
 const total=pack.base+pack.per100*Math.max(0,Math.ceil((m2-100)/100))+extras.reduce((sum,a)=>sum+a.price,0);
 if(!Number.isSafeInteger(total)||total<=0)throw new FlowError('El precio requiere revisión.',503);
 return {name,email,zone,timing,m2,pack:pack.id,videos,addons,message:(input.message||'').trim(),snapshot:{pack:pack.name,services:pack.services.map(id=>catalog.services.find(s=>s.id===id)?.name||id),videos:videos.map(id=>catalog.services.find(s=>s.id===id)?.name||id),addons:extras.map(a=>({name:a.name,price:a.price})),total}};
}
export function validateCatalog(c) {
 if(!c||!Array.isArray(c.packs)||!Array.isArray(c.services)||!Array.isArray(c.addons))throw new FlowError('Catálogo inválido.');
 if(c.packs.length!==3||['base','destacado','completo'].some(id=>!c.packs.some(p=>p.id===id)))throw new FlowError('El catálogo debe tener Base, Destacado y Completo.');
 const ids=c.services.map(s=>s.id);if(new Set(ids).size!==ids.length)throw new FlowError('Servicios duplicados.');
 for(const p of c.packs)if(!p.name||!Array.isArray(p.services)||p.services.some(id=>!ids.includes(id))||!Number.isInteger(p.base)||p.base<1||!Number.isInteger(p.per100)||p.per100<0||(p.videos||0)!==({base:0,destacado:1,completo:2})[p.id])throw new FlowError('Revisá los packs y sus precios.');
 if(c.addons.some(a=>!a.name||!Number.isInteger(a.price)||a.price<0)||new Set(c.addons.map(a=>a.name)).size!==c.addons.length)throw new FlowError('Revisá los adicionales.');
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
