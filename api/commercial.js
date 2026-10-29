import {randomUUID,createHmac,timingSafeEqual} from 'node:crypto';
import {PACKS,SERVICES,ADDONS} from '../src/components/pricingData.js';
import {db,rpc,settings,requireAdmin} from '../server/commercial/db.js';
import {FlowError,validateRequest,validateCatalog,quoteToken,quoteId,hash,verifyMpSignature,paymentMatches} from '../server/commercial/domain.js';
import {isTestMode,readiness,siteUrl,mp,sendZoho} from '../server/commercial/providers.js';
import {processJobs,prepareEmail} from '../server/commercial/jobs.js';
export const config={api:{bodyParser:false},maxDuration:60};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const defaultCatalog={packs:PACKS,services:SERVICES,addons:ADDONS};
const bearer=req=>String(req.headers.authorization||'').replace(/^Bearer /,'');
const catalog=s=>s.catalog?.packs?s.catalog:defaultCatalog;
const assertUuid=id=>{if(!UUID.test(id||''))throw new FlowError('Identificador inválido.');return id;};
function constantEquals(a,b){return !!a&&!!b&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
async function readBody(req){
 if(typeof req[Symbol.asyncIterator]!=='function' && req.body!==undefined){const raw=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));return {raw,data:JSON.parse(raw.toString()||'{}')};}
 const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>65536)throw new FlowError('Solicitud demasiado grande.',413);chunks.push(c);}const raw=Buffer.concat(chunks);
 try{return {raw,data:raw.length?JSON.parse(raw.toString()):{}};}catch{throw new FlowError('Solicitud inválida.');}
}
function sameOrigin(req){const origin=req.headers.origin;if(origin&&origin!==siteUrl())throw new FlowError('Origen no permitido.',403);}
async function getQuote(req){const id=quoteId(bearer(req));const [q]=await db(`com_quotes?id=eq.${assertUuid(id)}`);if(!q||q.is_test!==isTestMode())throw new FlowError('Propuesta no disponible.',404);return q;}
async function publicView(q){
 const rs=await db(`com_reservations?quote_id=eq.${q.id}&order=created_at.desc&limit=1`);
 const weeks=await rpc('com_available_weeks',{p_test:isTestMode()});
 let reservation=rs[0]||null;
 if(reservation?.status==='held'&&new Date(reservation.hold_until)<=new Date())reservation={...reservation,status:'expired'};
 return {quote:{id:q.id,name:q.name,email:q.email,zone:q.zone,m2:q.m2,timing:q.timing,snapshot:q.snapshot,total:q.total,deposit:q.deposit,terms:q.terms,stage:q.stage,valid_until:q.valid_until,approved:!!q.approved_at,unsubscribed:q.unsubscribed},reservation:reservation?{id:reservation.id,week_start:reservation.week_start,hold_until:reservation.hold_until,status:reservation.status}:null,weeks,paymentsEnabled:(await settings()).payments_enabled&&readiness().payments,testMode:isTestMode()};
}
async function createCheckout(q){
 const s=await settings();if(!s.payments_enabled||!readiness().payments)throw new FlowError('La reserva online todavía no está habilitada.',503);
 const rows=await db(`com_reservations?quote_id=eq.${q.id}&status=eq.held&order=created_at.desc&limit=1`),r=rows[0];
 if(!r||new Date(r.hold_until)<=new Date())throw new FlowError('Elegí una semana disponible para reservar.',409);
 if(r.checkout_url)return {url:r.checkout_url};
 const attempt=randomUUID(),now=new Date().toISOString();
 const locked=await db(`com_reservations?id=eq.${r.id}&or=(checkout_lock_until.is.null,checkout_lock_until.lt.${encodeURIComponent(now)})`,{method:'PATCH',body:{checkout_lock_until:new Date(Date.now()+60000).toISOString(),checkout_attempt:attempt}});
 if(!locked.length)throw new FlowError('Estamos preparando el pago. Volvé a intentar en un momento.',409);
 const preference=await mp('checkout/preferences','POST',{
  items:[{id:r.id,title:'Reserva de producción ARKO Studio',quantity:1,currency_id:'ARS',unit_price:r.deposit}],
  external_reference:r.id,notification_url:`${siteUrl()}/api/commercial?action=mp_webhook`,
  back_urls:{success:`${siteUrl()}/#reserva=${quoteToken(q.id)}`,pending:`${siteUrl()}/#reserva=${quoteToken(q.id)}`,failure:`${siteUrl()}/#reserva=${quoteToken(q.id)}`},
  expires:true,expiration_date_from:new Date(r.created_at).toISOString(),expiration_date_to:new Date(r.hold_until).toISOString(),
  payment_methods:{installments:1,excluded_payment_types:[{id:'ticket'},{id:'atm'}]},
  metadata:{reservation_id:r.id,quote_id:q.id},auto_return:'approved'
 });
 const url=isTestMode()?preference.sandbox_init_point:preference.init_point;
 if(!url||!/^https:\/\/[^/]*mercadopago\.(com|com\.ar)\//.test(url))throw new FlowError('Mercado Pago no devolvió un enlace válido.',502);
 await db(`com_reservations?id=eq.${r.id}&checkout_attempt=eq.${attempt}`,{method:'PATCH',body:{preference_id:String(preference.id),checkout_url:url,checkout_lock_until:null}});
 return {url};
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
 const action=String(req.query?.action||'config');
 try{
  if(!['GET','POST'].includes(req.method))throw new FlowError('Método no permitido.',405);
  const {data:body,raw}=req.method==='POST'?await readBody(req):{data:{},raw:Buffer.alloc(0)};
  if(req.method==='POST'&&!['mp_webhook','zoho_webhook'].includes(action))sameOrigin(req);
  if(action==='config'&&req.method==='GET'){
   if(!readiness().database)return res.status(200).json({enabled:false});
   let s;try{s=await settings();}catch{return res.status(200).json({enabled:false});}
   let manualQuotes=false;try{manualQuotes=(await rpc('com_property_quotes_version',{}))===1;}catch{}
   const ready=readiness();return res.status(200).json({manualQuotes,enabled:s.enabled&&!ready.testMode&&ready.links,catalog:catalog(s),deposit:s.deposit});
  }
  if(action==='submit'&&req.method==='POST'){
   const s=await settings();if(!s.enabled||isTestMode())throw new FlowError('Las consultas automáticas todavía no están habilitadas.',503);
   const data=validateRequest(body,catalog(s)),key=assertUuid(body.requestKey),id=randomUUID();
   if(body.website)throw new FlowError('No pudimos validar tu consulta.');
   const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0].trim();
   const result=await rpc('com_create_quote',{p_id:id,p_request_key:key,p_data:data,p_ip:hash(ip+(process.env.QUOTE_LINK_SECRET||'')),p_test:false});
   return res.status(201).json({token:quoteToken(result.id),stage:result.stage});
  }
  if(action==='quote'&&req.method==='GET')return res.status(200).json(await publicView(await getQuote(req)));
  if(action==='reserve'&&req.method==='POST'){
   const q=await getQuote(req),s=await settings();if(!s.enabled&&!q.is_test)throw new FlowError('Las reservas están pausadas.',503);
   if(!/^\d{4}-\d{2}-\d{2}$/.test(body.week))throw new FlowError('Seleccioná una semana.');
   await rpc('com_hold',{p_quote:q.id,p_week:body.week});return res.status(200).json(await publicView(q));
  }
  if(action==='checkout'&&req.method==='POST')return res.status(200).json(await createCheckout(await getQuote(req)));
  if(action==='unsubscribe'&&req.method==='POST'){
   const q=await getQuote(req);await db(`com_quotes?id=eq.${q.id}`,{method:'PATCH',body:{unsubscribed:true}});
   await db('com_events',{method:'POST',body:{quote_id:q.id,kind:'unsubscribed'}});return res.status(200).json({ok:true});
  }
  if(action==='mp_webhook'&&req.method==='POST'){
   const dataId=String(req.query?.['data.id']||'');
   if(!verifyMpSignature({signature:req.headers['x-signature'],requestId:req.headers['x-request-id'],dataId},process.env.MP_WEBHOOK_SECRET))throw new FlowError('Firma inválida.',401);
   if(body.type!=='payment')return res.status(200).json({ignored:true});
   if(String(body.data?.id)!==dataId||!/^\d+$/.test(dataId))throw new FlowError('Notificación inválida.');
   const payment=await mp(`v1/payments/${encodeURIComponent(dataId)}`);
   if(!UUID.test(payment.external_reference||''))return res.status(200).json({ignored:true});
   const [r]=await db(`com_reservations?id=eq.${payment.external_reference}`);
   if(!r)return res.status(200).json({ignored:true});
   const [q]=await db(`com_quotes?id=eq.${r.quote_id}`);
   if(!paymentMatches(payment,r,process.env.MP_COLLECTOR_ID,q.is_test))throw new FlowError('El pago no coincide.',409);
   const result=await rpc('com_apply_payment',{p_payment:{id:String(payment.id),reservation_id:r.id,status:payment.status,amount:payment.transaction_amount,currency:payment.currency_id,is_test:q.is_test,approved_at:payment.date_approved}});
   return res.status(200).json(result);
  }
  if(action==='jobs'&&['GET','POST'].includes(req.method)){
   if(!constantEquals(bearer(req),process.env.COMMERCIAL_JOB_SECRET))throw new FlowError('No autorizado.',401);
   return res.status(200).json(await processJobs());
  }
  if(action==='zoho_webhook'&&req.method==='POST'){
   if(!constantEquals(String(req.query?.verify||''),process.env.ZOHO_INBOUND_SECRET))throw new FlowError('No autorizado.',401);
   let [saved]=await db('com_secrets?key=eq.zoho_signature');
   if(!saved){
    const signing=req.headers['x-hook-secret'];if(typeof signing!=='string'||signing.length<8)throw new FlowError('Falta la verificación inicial de Zoho.',401);
    await db('com_secrets?on_conflict=key',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates'},body:{key:'zoho_signature',value:signing}});return res.status(200).json({registered:true});
   }
   const expected=createHmac('sha256',saved.value).update(raw).digest('base64');
   if(!constantEquals(expected,req.headers['x-hook-signature']))throw new FlowError('Firma inválida.',401);
   const id=String(body.subject||'').match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)?.[0];
   const from=String(body.fromAddress||'').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]?.toLowerCase();
   if(id&&from){
    const [q]=await db(`com_quotes?id=eq.${id}`);
    if(q&&q.email===from){await db(`com_quotes?id=eq.${id}`,{method:'PATCH',body:{paused:true}});await db('com_events',{method:'POST',body:{quote_id:id,kind:'email_reply',detail:{subject:String(body.subject||'').slice(0,300),provider_id:String(body.messageId||'')}}});}
   }
   return res.status(200).json({ok:true});
  }
  if(action.startsWith('admin')){
   const user=await requireAdmin(req);
   if(action==='admin'&&req.method==='GET'){
    const [s,quotes,weeks,reservations,templates,jobs,payments]=await Promise.all([settings(),db('com_quotes?order=created_at.desc&limit=200'),db('com_weeks?order=week_start'),db('com_reservations?order=created_at.desc&limit=500'),db('com_templates?order=key'),db('com_jobs?order=due_at.desc&limit=500'),db('com_payments?order=updated_at.desc&limit=500')]);
    return res.status(200).json({settings:{...s,catalog:catalog(s)},quotes,weeks,reservations,templates,jobs,payments,readiness:readiness()});
   }
   if(action==='admin_detail'&&req.method==='GET'){
    const id=assertUuid(req.query.id);const [events,jobs]=await Promise.all([db(`com_events?quote_id=eq.${id}&order=created_at.desc&limit=100`),db(`com_jobs?quote_id=eq.${id}&order=due_at`)]);return res.status(200).json({events,jobs});
   }
   if(action==='admin_link'&&req.method==='POST')return res.status(200).json({url:`${siteUrl()}/#reserva=${quoteToken(assertUuid(body.id))}`});
   if(action==='admin_test_quote'&&req.method==='POST'){
    if(!isTestMode())throw new FlowError('Creá pruebas en el entorno de pruebas.');
    const s=await settings(),data=validateRequest(body,catalog(s));const result=await rpc('com_create_quote',{p_id:randomUUID(),p_request_key:randomUUID(),p_data:data,p_ip:hash(user.id),p_test:true});
    return res.status(201).json({url:`${siteUrl()}/#reserva=${quoteToken(result.id)}`});
   }
   if(action==='admin_test_email'&&req.method==='POST'){
    const key=String(body.key||''),[t]=await db(`com_templates?key=eq.${encodeURIComponent(key)}`);if(!t)throw new FlowError('Plantilla inexistente.');
    const s=await settings(),data=validateRequest({name:'Cliente de prueba',email:user.email,zone:'Palermo',propertyType:'Casa',m2:150,pack:'destacado',videos:['cine'],addons:[]},catalog(s));
    const sample={...data,id:randomUUID(),total:data.snapshot.total,deposit:s.deposit,created_at:new Date().toISOString(),is_test:true,valid_until:new Date(Date.now()+s.quote_days*86400000).toISOString(),terms:s.terms};
    const rendered=await prepareEmail(key,sample,{week_start:'2026-11-09',hold_until:new Date(Date.now()+72*3600000).toISOString()},{subject:t.draft_subject??t.subject,body:t.draft_body??t.body});
    await sendZoho({to:process.env.COMMERCIAL_TEST_EMAIL||user.email,...rendered,subject:`PRUEBA DE PLANTILLA: ${rendered.subject}`});
    return res.status(200).json({ok:true});
   }
   if(action==='admin_mutate'&&req.method==='POST'){
    const op=String(body.operation||''),data=body.data||{};
    if(op==='settings'){
     for(const key of ['enabled','emails_enabled','payments_enabled','auto_quote','recovery_enabled'])if(typeof data[key]!=='boolean')throw new FlowError('Configuración inválida.');
     for(const [key,min,max] of [['deposit',1,1000000],['hold_hours',1,168],['quote_days',1,90]])if(!Number.isInteger(data[key])||data[key]<min||data[key]>max)throw new FlowError(`Revisá ${key}.`);
     validateCatalog(data.catalog);if(data.deposit>Math.min(...data.catalog.packs.map(p=>p.base)))throw new FlowError('La reserva no puede superar el precio del pack más económico.');if(typeof data.terms!=='string'||data.terms.trim().length<30||data.terms.length>5000)throw new FlowError('Completá las condiciones comerciales.');
     const ready=readiness();if(data.enabled&&(!ready.links||!ready.scheduler||!ready.email||!data.emails_enabled))throw new FlowError('Conectá enlaces, tareas y Zoho antes de activar el formulario.');
     if(data.emails_enabled&&(!ready.email||(!ready.testMode&&ready.replyMode!=='manual'&&!ready.replies)))throw new FlowError('Conectá Zoho y las respuestas antes de activar los mails.');
     if(data.payments_enabled&&!ready.payments)throw new FlowError('Conectá Mercado Pago primero.');
    }else if(op==='week'){
     if(!/^\d{4}-\d{2}-\d{2}$/.test(data.week_start)||new Date(`${data.week_start}T12:00:00Z`).getUTCDay()!==1||!Number.isInteger(data.capacity)||data.capacity<0||data.capacity>100||typeof data.enabled!=='boolean')throw new FlowError('Elegí un lunes y una capacidad válida.');
    }else if(op==='template_draft'){
     if(typeof data.subject!=='string'||!data.subject.trim()||data.subject.length>300||typeof data.body!=='string'||!data.body.trim()||data.body.length>10000)throw new FlowError('Revisá el asunto y el mensaje.');
    }else if(['template_publish','template_toggle'].includes(op)){if(typeof data.enabled!=='boolean')throw new FlowError('Revisá la plantilla.');}
    else if(op==='notes'){if(typeof data.notes!=='string'||data.notes.length>10000)throw new FlowError('Notas inválidas.');}
    else if(op==='pause'){if(typeof data.paused!=='boolean')throw new FlowError('Estado inválido.');}
    else if(op==='quote_draft'){
     if(!Array.isArray(data.lineItems)||!data.lineItems.length||data.lineItems.length>30)throw new FlowError('Agregá entre 1 y 30 conceptos.');
     for(const item of data.lineItems)if(typeof item.description!=='string'||!item.description.trim()||item.description.length>300||!Number.isSafeInteger(item.quantity)||item.quantity<1||!Number.isSafeInteger(item.unitPrice)||item.unitPrice<1||item.total!==item.quantity*item.unitPrice)throw new FlowError('Revisá los conceptos y sus importes.');
     const total=data.lineItems.reduce((sum,item)=>sum+item.total,0);if(!Number.isSafeInteger(total)||total>2000000000||data.total!==total)throw new FlowError('Total inválido.');
     if(typeof data.scopeOfWork!=='string'||data.scopeOfWork.trim().length<10||data.scopeOfWork.length>3000)throw new FlowError('Describí el alcance acordado.');
    }
    else if(!['approve' ,'close','retry_job'].includes(op))throw new FlowError('Acción desconocida.');
    const result=await rpc('com_admin_action',{p_action:op,p_id:body.id?assertUuid(body.id):null,p_data:data,p_actor:user.id});return res.status(200).json(result);
   }
  }
  throw new FlowError('Ruta no encontrada.',404);
 }catch(error){const status=error instanceof FlowError?error.status:500;if(status===500)console.error('commercial_error',error.name);return res.status(status).json({error:status===500?'No pudimos completar la operación. Volvé a intentar.':error.message});}
}
