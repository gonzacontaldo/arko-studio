import {db,rpc,settings} from './db.js';
import {money,quoteToken,renderTemplate} from './domain.js';
import {sendZoho,siteUrl,isTestMode} from './providers.js';
import {createQuotePdf} from './quotePdf.js';
import {QUOTE_EMAIL_BODY} from '../../src/lib/quoteEmail.js';

export const ADMIN_NOTICE_TO='contacto@arkostudio.com.ar';
export const jobRecipient=(job,q)=>job.template_key==='admin_notice'?ADMIN_NOTICE_TO:q.email;
export async function prepareEmail(key,q,r,template){
 if(key==='admin_notice')return {
  subject:`Nueva consulta web ARKO${q.snapshot.requiresReview?' — Presupuesto a medida':''}`,
  text:[`Ingresó una solicitud de ${q.name}.`,`Email: ${q.email}`,`Propiedad: ${q.snapshot.propertyType||'A confirmar'}`,`Zona: ${q.zone}`,`Superficie: ${q.m2} m²`,`Selección: ${q.snapshot.pack}`,
   `Servicios: ${[...q.snapshot.services,...q.snapshot.videos].join(', ')}`,
   ...(q.snapshot.addons||[]).map(a=>`Adicional: ${a.name}`),
   q.total==null?'Importe pendiente: preparar cotización a medida desde el admin.':`Presupuesto: ${money(q.total)}`,
   q.message?`Comentarios: ${q.message}`:'',`Consulta: ${q.id}`].filter(Boolean).join('\n'),
  link:`${siteUrl()}/admin?tab=commercial&quote=${encodeURIComponent(q.id)}`,linkLabel:'Ver consulta en el admin'
 };
 if(key==='received')return {subject:template.subject,text:`Hola ${q.name}, recibimos tu solicitud para ${q.zone}.\n\nUna persona de nuestro equipo se va a poner en contacto con vos para preparar un presupuesto a medida.\n\nARKO Studio`};
 const vars=messageVariables(q,r);
 const rendered=renderTemplate({...template,body:key==='quote'?QUOTE_EMAIL_BODY:template.body},vars);
 return {...rendered,link:vars.enlace,...(key==='quote'?{attachments:[await createQuotePdf(q,{link:vars.enlace})],linkLabel:'Elegir semana y reservar'}:{})};
}

export function messageVariables(q,r){
 const date=v=>v?new Date(v).toLocaleString('es-AR',{timeZone:'America/Argentina/Buenos_Aires',dateStyle:'medium',timeStyle:'short'}):'Sin elegir';
 const link=`${siteUrl()}/#reserva=${quoteToken(q.id)}`;
 return {codigo:q.id,nombre:q.name,zona:q.zone,total:money(q.total),reserva:money(q.deposit),saldo:money(q.total-q.deposit),vigencia:date(q.valid_until),semana:r?.week_start||'Sin elegir',vencimiento:date(r?.hold_until),condiciones:q.terms,enlace:link,baja:`${link}&baja=1`,detalle:[`Pack ${q.snapshot.pack} · ${q.m2} m²`,...q.snapshot.services,...q.snapshot.videos,...q.snapshot.addons.map(a=>`${a.name}: ${money(a.price)}`)].join('\n')};
}
export function jobEligible(job,q,r,now=Date.now()){
 if(!q||q.is_test!==isTestMode())return false;
 if(job.template_key==='admin_notice')return true;
 if(q.stage==='closed')return false;
 const commercial=['choose_week','reminder','recovery','expired'];
 if(commercial.includes(job.template_key)&&(q.paused||q.unsubscribed))return false;
 if(job.template_key==='received')return !!q.snapshot.requiresReview;
 if(job.template_key==='quote')return !!q.approved_at;
 if(job.template_key==='choose_week')return q.stage==='ready'&&new Date(q.valid_until).getTime()>now&&!r;
 if(['hold','reminder'].includes(job.template_key))return q.stage==='reserved'&&r?.status==='held'&&new Date(r.hold_until).getTime()>now;
 if(job.template_key==='confirmed')return r?.status==='confirmed';
 if(['expired','recovery'].includes(job.template_key))return q.stage==='ready'&&r?.status==='expired';
 return false;
}
export async function processJobs(limit=2){
 const started=Date.now();
 const s=await settings();await rpc('com_expire',{p_test:isTestMode()});
 if(!s.emails_enabled)return {sent:0,disabled:true};
 let sent=0;
 for(let i=0;i<limit && Date.now()-started<35000;i++){
  const j=await rpc('com_claim_job',{p_test:isTestMode()});if(!j)break;
  const where=`id=eq.${j.id}&claim_id=eq.${j.claim_id}&status=eq.processing`;
  const patch=body=>db(`com_jobs?${where}`,{method:'PATCH',body});
  try{
   const [q]=await db(`com_quotes?id=eq.${j.quote_id}`);
   const rs=await db(`com_reservations?quote_id=eq.${j.quote_id}&order=created_at.desc&limit=1`);
   const r=j.reservation_id?rs.find(x=>x.id===j.reservation_id):rs[0];
   const [t]=await db(`com_templates?key=eq.${j.template_key}`);
   if(!t?.enabled||!jobEligible(j,q,r)){await patch({status:'cancelled'});continue;}
   // Collapse overdue daily reminders: one message per customer per 18 hours.
   if(j.template_key==='reminder'){
    const since=new Date(Date.now()-18*3600000).toISOString();
    const recent=await db(`com_jobs?quote_id=eq.${q.id}&template_key=eq.reminder&status=eq.sent&sent_at=gte.${encodeURIComponent(since)}&select=id&limit=1`);
    if(recent.length){await patch({status:'cancelled'});continue;}
   }
   const vars=messageVariables(q,r),rendered=await prepareEmail(j.template_key,q,r,t);
   if(!rendered.subject.includes(q.id))rendered.subject += ' ['+q.id+']';
   if(['choose_week','reminder','expired','recovery'].includes(j.template_key)&&!rendered.text.includes(vars.baja))rendered.text+='\n\nDetener recordatorios: '+vars.baja;
   await patch({rendered_subject:rendered.subject,rendered_body:rendered.text});
   // Re-read immediately before dispatch; a payment or reply may have arrived while rendering.
   const [freshQ]=await db(`com_quotes?id=eq.${q.id}`);
   const freshR=r?(await db(`com_reservations?id=eq.${r.id}`))[0]:null;
   if(!jobEligible(j,freshQ,freshR)){await patch({status:'cancelled'});continue;}
   const providerId=await sendZoho({to:jobRecipient(j,q),...rendered,unsubscribe:['choose_week','reminder','expired','recovery'].includes(j.template_key)?vars.baja:undefined});
   await patch({status:'sent',last_error:null,sent_at:new Date().toISOString(),provider_id:providerId});sent++;
  }catch(error){
   // An ambiguous provider response must be reviewed, not retried automatically.
   await patch({status:error.message==='EMAIL_UNCERTAIN'?'uncertain':j.attempts>=3?'failed':'pending',last_error:error.message.slice(0,250),due_at:new Date(Date.now()+j.attempts*15*60000).toISOString()});
  }
 }
 return {sent};
}
