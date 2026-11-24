export const PROPERTY_TYPES=['Casa','Departamento / oficina','Lote / terreno','Local comercial','Galpón / nave industrial / hangar','Complejo de departamentos / oficinas','Campo / establecimiento rural','Otra propiedad'];
export const requiresReview=type=>!!type&&!['Casa','Departamento / oficina'].includes(type);
export const largeArea=type=>['Lote / terreno','Galpón / nave industrial / hangar'].includes(type);
export const extraBlocks=m2=>Math.max(0,Math.ceil(Number(m2)/100)-1);
export function areaRule(type,item){return {included:100,step:100,increment:item.per100};}
export function propertyPrice(item,m2,type){
 const area=Number(m2);if(!item||!Number.isFinite(area)||area<1||requiresReview(type))return null;
 if(area>100&&(item.per100==null||item.perService))return null;
 return item.base+extraBlocks(area)*(item.per100||0);
}
export const scopeQuestions=type=>type==='Complejo de departamentos / oficinas'?[
 ['units','Cantidad total de unidades'],['shownUnits','Cantidad de unidades a mostrar'],['typologies','Tipologías y unidades incluidas'],['commonAreas','Espacios comunes, amenities y exteriores'],['floors','Cantidad de edificios y pisos']
]:type==='Campo / establecimiento rural'?[
 ['hectares','Superficie total en hectáreas'],['buildings','Construcciones y superficies a mostrar'],['outdoors','Sectores exteriores e instalaciones'],['distances','Distancias y circulación entre sectores']
]:[['description','Tipo de inmueble y alcance'],['spaces','Ambientes y sectores a mostrar'],['outdoors','Exteriores e instalaciones']];
export const commonQuestions=[['access','Accesos, permisos y restricciones'],['occupancy','Ocupación y coordinación'],['delivery','Objetivo del material y fecha deseada']];
export const questionsFor=type=>requiresReview(type)?[...scopeQuestions(type),...commonQuestions]:[];
