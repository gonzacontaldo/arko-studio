export const PRICING_VERSION=3;
export const HOSTING_INCLUDED='Incluye 3 meses de hosting desde la entrega del tour.';
export const HOSTING_RENEWAL='Para mantener el recorrido online después del período incluido, podés solicitar una renovación. También ofrecemos hosting por 6 o 12 meses, con cotización adicional.';
export const HOSTING_EXPIRY='Al finalizar el período contratado, la continuidad online requiere renovación. Si no se renueva, el tour dejará de estar disponible públicamente. No se garantiza la conservación indefinida de archivos.';
export const ADJUSTMENTS='Incluye una ronda de ajustes sobre el material entregado. Cambios de alcance o nuevas tomas se cotizan aparte.';
export const PACK_AREA_NOTE='Los paquetes se calculan por bloques de hasta 100 m² de superficie a relevar. El presupuesto final se confirma según el tipo de inmueble, ambientes, exteriores, amenities y ubicación.';
export const MATTERPORT_UPGRADE=75000;
export const CABA_TRAVEL=25000;
export const SERVICES=[
 {id:'foto',icon:'photo_camera',name:'Fotografía HDR',desc:'Interiores y exteriores con edición HDR profesional.',base:125000,per100:50000},
 {id:'fpv',icon:'flight_takeoff',name:'Video FPV',desc:'Recorrido dinámico con drone por interiores y exteriores, sujeto a viabilidad del lugar.',base:125000,per100:25000},
 {id:'cine',icon:'movie',name:'Video cinematográfico',desc:'Video horizontal para presentar la propiedad. Duración de referencia: 1 a 2 minutos; alcance acordado al coordinar.',base:175000,per100:50000},
 {id:'reel',icon:'smartphone',name:'Reel para redes',desc:'Un video vertical para redes. Se contrata y entrega por separado del cinematográfico.',base:175000,per100:50000},
 {id:'tour',icon:'vrpano',name:'Tour Kuula',desc:`Recorrido de vistas panorámicas conectadas. ${HOSTING_INCLUDED}`,base:75000,per100:50000},
 {id:'matterport',icon:'view_in_ar',name:'Tour Matterport',desc:`Recorrido inmersivo con modelo 3D, según las vistas disponibles del recorrido contratado. ${HOSTING_INCLUDED}`,base:150000,per100:50000},
 {id:'planos',icon:'architecture',name:'Planos 2D',desc:'Plano esquemático elaborado después del relevamiento con medición láser. No es arquitectónico.',base:60000,per100:25000},
];
export const SERVICE_BY_ID=Object.fromEntries(SERVICES.map(s=>[s.id,s]));
export const PACKS=[
 {id:'base',name:'Base',tagline:'Fotografía, planos y tour Kuula.',services:['foto','planos','tour'],videos:0,base:225000,per100:75000},
 {id:'destacado',name:'Destacado',tagline:'Con FPV o con un cinematográfico / reel.',services:['foto','planos','tour'],videos:1,base:335000,per100:100000,highlight:true,variants:{fpv:{name:'Destacado FPV',base:335000,per100:100000},cine:{name:'Destacado Cine',base:375000,per100:100000}}},
 {id:'completo',name:'Completo',tagline:'FPV + un cinematográfico horizontal o un reel vertical.',services:['foto','planos','tour'],videos:2,base:485000,per100:125000},
];
export const ADDONS=[
 {name:'Transición día a noche',desc:'Edición crepuscular del exterior.',price:50000,appliesTo:['cine','reel']},
 {name:'Participación del broker inmobiliario',desc:'Presentación de la propiedad frente a cámara.',price:50000,appliesTo:['cine','reel']},
 {name:'Sesión al atardecer',desc:'Grabación coordinada para aprovechar la luz del atardecer.',price:50000,appliesTo:['cine','reel']},
 {name:'Fotos aéreas',desc:'Fotos aéreas dentro de la entrega fotográfica, sujetas a viabilidad.',price:50000,appliesTo:['foto']},
 {name:'Tomas aéreas en video',desc:'Tomas integradas en un cinematográfico o reel. FPV no lleva este extra.',price:50000,appliesTo:['cine','reel']},
];
// A saved catalog from before this pricing revision cannot reinstate an old scale.
export function completeCatalog(saved={}){
 const current=[2,PRICING_VERSION].includes(saved.pricingVersion);
 const services=SERVICES.map(s=>({...s,...(current?saved.services?.find(row=>row.id===s.id):{}),per100:saved.pricingVersion===PRICING_VERSION?(saved.services?.find(row=>row.id===s.id)?.per100??s.per100):s.per100}));
 const packs=PACKS.map(p=>{const row=current?saved.packs?.find(row=>row.id===p.id):null;return {...p,...row,services:[...p.services],...(p.variants?{variants:{fpv:{...p.variants.fpv,...row?.variants?.fpv},cine:{...p.variants.cine,...row?.variants?.cine}}}:{} )};});
 const addons=ADDONS.map(a=>{const row=saved.addons?.find(row=>row.name===a.name);return {...a,...(Number.isSafeInteger(row?.price)&&row.price>=0?{price:row.price}:{})};});
 return {pricingVersion:PRICING_VERSION,services,packs,addons};
}
export function addonAvailable(addon,services=[],videos=[]){return (addon.appliesTo||[]).some(id=>services.includes(id)||videos.includes(id));}
export function packVariant(pack,variant='fpv'){
 return pack?.variants?{...pack,...pack.variants[variant==='cine'?'cine':'fpv']}:pack;
}
