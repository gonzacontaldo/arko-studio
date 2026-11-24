import {estimateProduction,quoteSummary} from './productionQuote.js';
import {PROPERTY_TYPES} from './propertyPricing.js';

export function whatsappQuote(form,catalog){
 const estimate=estimateProduction(form,catalog),errors={};
 if(!PROPERTY_TYPES.includes(form.propertyType))errors.propertyType='Elegí el tipo de propiedad.';
 if(!estimate.validArea)errors.m2='Ingresá una superficie entre 1 y 100.000 m².';
 if(!form.zone?.trim())errors.zone='Indicá el barrio o localidad.';
 if(!['caba','other'].includes(form.locationCategory))errors.locationCategory='Indicá si es CABA u otra zona.';
 if(!form.pack||!estimate.hasSelection)errors.pack='Elegí un paquete o al menos un servicio.';
 const text=['¡Hola! Quiero consultar por una producción.',`Tipo de propiedad: ${form.propertyType||'A definir'}`,`Ubicación: ${form.zone?.trim()||'A definir'}`,...quoteSummary(estimate)].join('\n');
 return {estimate,errors,text,url:Object.keys(errors).length?null:`https://wa.me/5491176498888?text=${encodeURIComponent(text)}`};
}
