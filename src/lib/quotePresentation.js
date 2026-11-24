import {money} from './productionQuote.js';
export function savedQuoteSummary(q){
 const s=q.snapshot||{};
 const lines=[`Selección: ${s.pack||'A confirmar'} · ${q.m2} m²`,...(s.services||[]),...(s.videos||[]),...(s.addons||[]).map(a=>`${a.name}: ${money(a.price)}`)];
 if(s.tourPlatform)lines.push(`Plataforma: ${s.tourPlatform==='matterport'?'Matterport (reemplaza Kuula)':'Kuula'}`,`Hosting solicitado: ${s.hostingMonths||3} meses desde la entrega del tour. Tres meses incluidos.`);
 if(s.travel)lines.push(`Traslado a CABA desde Béccar: ${money(s.travel)} por producción.`);
 if(q.total==null){if(s.knownSubtotal!=null)lines.push(`Subtotal conocido de producción y traslado confirmado: ${money(s.knownSubtotal)}`);lines.push(...(s.pendingReasons||[]),'Importe final pendiente de cotización.');}
 else lines.push(`Total presupuestado: ${money(q.total)}`);
 return lines;
}
