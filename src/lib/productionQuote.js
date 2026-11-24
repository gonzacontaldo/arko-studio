import {completeCatalog,packVariant,addonAvailable,MATTERPORT_UPGRADE,CABA_TRAVEL,HOSTING_INCLUDED,HOSTING_RENEWAL,HOSTING_EXPIRY,ADJUSTMENTS} from '../components/pricingData.js';
import {propertyPrice,extraBlocks,requiresReview} from './propertyPricing.js';
export const VIDEO_IDS=['fpv','cine','reel'];
export const money=n=>n==null?'Solicitar cotización':`$ ${Math.round(n).toLocaleString('es-AR')}`;
export const defaultVideos=(pack,variant='fpv',format='cine')=>pack==='completo'?['fpv',format==='reel'?'reel':'cine']:pack==='destacado'?[variant==='cine'?(format==='reel'?'reel':'cine'):'fpv']:[];
export function selectionFor(input={}){
 const services=[...(input.services||[])],matterport=services.includes('matterport');
 const pack=input.pack||'custom',variant=input.variant||(input.videos?.some(v=>['cine','reel'].includes(v))?'cine':'fpv');
 return {...input,pack,variant,services:[...new Set(services.map(id=>id==='matterport'?'tour':id))],videos:input.videos||defaultVideos(pack,variant),tourPlatform:matterport?'matterport':input.tourPlatform||'kuula',hostingMonths:Number(input.hostingMonths||3),locationCategory:input.locationCategory||(/\bCABA\b|ciudad aut[oó]noma de buenos aires/i.test(input.zone||'')?'caba':'')};
}
export function estimateProduction(input,catalogInput={}){
 const catalog=completeCatalog(catalogInput),s=selectionFor(input),pack=catalog.packs.find(p=>p.id===s.pack),custom=s.pack==='custom';
 const serviceIds=custom?s.services:(pack?.services||[]),videos=custom?serviceIds.filter(id=>VIDEO_IDS.includes(id)):s.videos;
 const hasTour=serviceIds.includes('tour'),platform=hasTour?s.tourPlatform:null,hostingMonths=hasTour?s.hostingMonths:null;
 const reasons=[];const area=Number(s.m2),validArea=Number.isFinite(area)&&area>=1&&area<=100000;
 if(requiresReview(s.propertyType))reasons.push('Producción especial: alcance y superficie a cotizar.');
 if(custom&&videos.includes('cine')&&videos.includes('reel')&&!videos.includes('fpv'))reasons.push('Cinematográfico + reel sin FPV: consultar combinación a medida.');
 if(hasTour&&hostingMonths>3)reasons.push(`Hosting extendido pendiente de cotización (${hostingMonths} meses solicitados).`);
 if(s.locationCategory==='other')reasons.push('Traslado pendiente de confirmación según ubicación.');
 const item=(description,quantity,unitPrice)=>({description,quantity,unitPrice,total:quantity*unitPrice});
 const lineItems=[];let productionSubtotal=null;
 const manualProduction=requiresReview(s.propertyType)||(custom&&videos.includes('cine')&&videos.includes('reel')&&!videos.includes('fpv'));
 const chosenPack=packVariant(pack,s.variant);
 const details=serviceIds.map(id=>catalog.services.find(row=>row.id===(id==='tour'&&platform==='matterport'?'matterport':id))).filter(Boolean);
 const extraVideos=custom?[]:videos.map(id=>catalog.services.find(row=>row.id===id)).filter(Boolean);
 if(validArea&&!manualProduction&&(custom?details.length:chosenPack)){
  if(custom){productionSubtotal=details.reduce((sum,row)=>sum+propertyPrice(row,area,s.propertyType),0);for(const row of details){lineItems.push(item(`${row.name} · hasta 100 m²`,1,row.base));if(extraBlocks(area))lineItems.push(item(`${row.name} · bloque adicional iniciado de hasta 100 m²`,extraBlocks(area),row.per100));}}
  else{productionSubtotal=propertyPrice(chosenPack,area,s.propertyType);lineItems.push(item(`${chosenPack.name} · hasta 100 m²`,1,chosenPack.base));if(extraBlocks(area))lineItems.push(item('Bloque adicional iniciado de hasta 100 m²',extraBlocks(area),chosenPack.per100));if(platform==='matterport'){productionSubtotal+=MATTERPORT_UPGRADE;lineItems.push(item('Matterport reemplaza Kuula · una vez por producción',1,MATTERPORT_UPGRADE));}}
 }
 const extras=catalog.addons.filter(a=>(s.addons||[]).includes(a.name)&&addonAvailable(a,serviceIds,videos));
 if(productionSubtotal!=null){productionSubtotal+=extras.reduce((sum,a)=>sum+a.price,0);lineItems.push(...extras.map(a=>item(a.name,1,a.price)));}
 const travel=s.locationCategory==='caba'?CABA_TRAVEL:0;
 if(productionSubtotal!=null&&travel)lineItems.push(item('Traslado a CABA desde Béccar · por producción',1,travel));
 const knownSubtotal=productionSubtotal==null?null:productionSubtotal+travel;
 const needsQuote=reasons.length>0;
 return {selection:s,catalog,pack:chosenPack,services:details,videos:extraVideos,videoIds:videos,hasTour,tourPlatform:platform,hostingMonths,extras,travel,productionSubtotal,knownSubtotal,total:needsQuote?null:knownSubtotal,requiresReview:needsQuote,reasons,lineItems,validArea,hasSelection:custom?details.length>0:!!pack};
}
export function quoteSummary(estimate){
 const e=estimate,s=e.selection;
 return [e.pack?`Paquete: ${e.pack.name}`:'Servicios individuales',`Superficie a relevar: ${s.m2||'—'} m²`,...e.services.map(row=>row.name),...e.videos.map(row=>row.name),e.hasTour?`Plataforma: ${e.tourPlatform==='matterport'?'Matterport (reemplaza Kuula)':'Kuula'}`:'',e.hasTour?HOSTING_INCLUDED:'',e.hasTour&&e.hostingMonths>3?`Hosting solicitado: ${e.hostingMonths} meses. Hosting extendido pendiente de cotización.`:'',...e.extras.map(row=>`${row.name}: +${money(row.price)}`),e.travel?`Traslado a CABA desde Béccar: +${money(e.travel)} por producción`:s.locationCategory==='other'?'Traslado: a confirmar según ubicación.':'Traslado: se confirma según ubicación.',e.knownSubtotal!=null?`${e.total==null?'Subtotal conocido de producción y traslado confirmado':'Total estimado'}: ${money(e.knownSubtotal)}`:'Solicitar cotización personalizada.',...e.reasons,'Precios en pesos argentinos.',ADJUSTMENTS].filter(Boolean);
}
export const tourConditions=[HOSTING_INCLUDED,HOSTING_RENEWAL,HOSTING_EXPIRY];
