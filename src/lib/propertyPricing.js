export const PROPERTY_TYPES = ['Casa', 'Departamento / oficina', 'Lote / terreno', 'Local comercial', 'Galpón / nave industrial / hangar', 'Complejo de departamentos / oficinas', 'Campo / establecimiento rural', 'Otra propiedad'];
export const requiresReview = type => PROPERTY_TYPES.slice(5).includes(type);
export const largeArea = type => ['Lote / terreno', 'Galpón / nave industrial / hangar'].includes(type);
export function areaRule(type, item) {
 return largeArea(type) ? {included:500, step:500, increment:50000} : {included:100, step:100, increment:type==='Departamento / oficina' && !item.perService ? 25000 : item.per100};
}
export function propertyPrice(item, m2, type) {
 const rule=areaRule(type,item);
 return item.base + Math.max(0,Math.ceil((Number(m2)-rule.included)/rule.step))*rule.increment;
}
export const scopeQuestions = type => type==='Complejo de departamentos / oficinas' ? [
 ['units','Cantidad total de unidades'],['shownUnits','Cantidad de unidades a mostrar'],['typologies','¿Son iguales, de distintas tipologías o todas diferentes? Detallá cuáles se muestran.'],['commonAreas','Espacios comunes a mostrar: recepción, pasillos, cocheras, amenities y exteriores'],['floors','Cantidad de edificios y pisos a recorrer']
] : type==='Campo / establecimiento rural' ? [
 ['hectares','Superficie total del campo en hectáreas'],['buildings','Construcciones a mostrar y sus superficies aproximadas'],['outdoors','Sectores exteriores, cultivos, instalaciones y puntos de interés'],['distances','Distancias entre sectores y cómo se puede circular dentro del campo']
] : type==='Otra propiedad' ? [
 ['description','¿Qué tipo de propiedad es y para qué se utiliza?'],['spaces','Cantidad y tipo de espacios a mostrar'],['outdoors','Exteriores e instalaciones especiales a incluir']
] : [];
export const commonQuestions = [['access','Accesos, permisos y restricciones de ingreso o vuelo'],['occupancy','¿Está ocupada? ¿Hay que coordinar con residentes, inquilinos o personal?'],['delivery','Objetivo del material y fecha deseada de entrega']];
export const questionsFor = type => requiresReview(type) ? [...scopeQuestions(type),...commonQuestions] : [];
