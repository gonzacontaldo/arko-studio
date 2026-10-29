import {quoteTokenFromHash} from '../src/lib/quoteLink.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,randomUUID} from 'node:crypto';
import {PACKS,SERVICES,ADDONS} from '../src/components/pricingData.js';
import {validateRequest,validateCatalog,quoteToken,quoteId,verifyMpSignature,paymentMatches,renderTemplate,escapeHtml} from '../server/commercial/domain.js';
import {jobEligible} from '../server/commercial/jobs.js';
import handler from '../api/commercial.js';
const catalog={packs:PACKS,services:SERVICES,addons:ADDONS};
const request={name:'Martín',email:'MARTIN@example.com',zone:'Palermo',m2:150,timing:'En las próximas 2 semanas',pack:'destacado',videos:['cine'],addons:[ADDONS[0].name]};
process.env.QUOTE_LINK_SECRET='test-only-secret-with-more-than-32-characters';
process.env.COMMERCIAL_MODE='test';
process.env.COMMERCIAL_SITE_URL='https://www.arkostudio.com.ar';
test('server recalculates prices and snapshots against its own catalog',()=>{
 const q=validateRequest({...request,total:1},catalog);assert.equal(q.snapshot.total,385000);assert.equal(q.email,'martin@example.com');
 assert.equal(validateRequest({...request,m2:100,addons:[]},catalog).snapshot.total,285000);
 assert.equal(validateRequest({...request,m2:100.1,addons:[]},catalog).snapshot.total,335000);
});
test('invalid emails, area, duplicated/unknown videos and extras are rejected',()=>{
 for(const patch of [{email:'a@b.com,attacker@x.com'},{m2:0},{m2:Infinity},{videos:['cine','cine']},{videos:['unknown']},{videos:['fpv']},{addons:['Inventado']},{addons:[ADDONS[0].name,ADDONS[0].name]},{pack:'fake'},{timing:'whatever'}])assert.throws(()=>validateRequest({...request,...patch},catalog));
 assert.throws(()=>validateCatalog({...catalog,packs:PACKS.map(p=>({...p,base:-1}))}));
});
test('private quote token rejects alterations and cannot be used without server secret',()=>{
 const id=randomUUID(),token=quoteToken(id);assert.equal(quoteId(token),id);assert.throws(()=>quoteId(token.slice(0,-3)+'ABC'));
 const key=process.env.QUOTE_LINK_SECRET;delete process.env.QUOTE_LINK_SECRET;assert.throws(()=>quoteToken(id));process.env.QUOTE_LINK_SECRET=key;
});
test('templates escape hostile HTML and do not recursively expand customer input',()=>{
 const result=renderTemplate({subject:'Hola {nombre}',body:'{nombre} / {enlace}'},{nombre:'<img src=x onerror=alert(1)> {enlace}',enlace:'https://example.com'});
 assert.ok(escapeHtml(result.text).includes('&lt;img'));assert.ok(result.text.includes('{enlace} / https://example.com'));
});
test('Mercado Pago signature and payment identity checks fail closed',()=>{
 const key='secret',dataId='1234',requestId='request',ts='123456';
 const digest=createHmac('sha256',key).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest('hex');
 assert.equal(verifyMpSignature({signature:`ts=${ts},v1=${digest}`,requestId,dataId},key),true);
 assert.equal(verifyMpSignature({signature:`ts=${ts},v1=${digest}`,requestId,dataId:'999'},key),false);
 assert.equal(verifyMpSignature({signature:'bad',requestId,dataId},key),false);
 const reservation={id:randomUUID(),deposit:15000};
 const payment={external_reference:reservation.id,transaction_amount:15000,currency_id:'ARS',collector_id:123,live_mode:false};
 assert.ok(paymentMatches(payment,reservation,123,true));
 for(const patch of [{transaction_amount:1},{collector_id:999},{currency_id:'USD'},{live_mode:true},{external_reference:randomUUID()}])assert.equal(paymentMatches({...payment,...patch},reservation,123,true),false);
});
test('messages stop on payment, expiry, reply, unsubscribe and mode mismatch',()=>{
 const now=Date.now(),q={stage:'reserved',approved_at:new Date().toISOString(),is_test:true,valid_until:new Date(now+100000).toISOString()},r={status:'held',hold_until:new Date(now+100000).toISOString()};
 const j={template_key:'reminder'};assert.ok(jobEligible(j,q,r,now));
 for(const patch of [{paused:true},{unsubscribed:true},{stage:'confirmed'},{stage:'closed'},{is_test:false}])assert.equal(jobEligible(j,{...q,...patch},r,now),false);
 assert.equal(jobEligible(j,q,{...r,hold_until:new Date(now-1).toISOString()},now),false);
 assert.ok(jobEligible({template_key:'confirmed'},{...q,stage:'confirmed',paused:true},{status:'confirmed'},now));
 assert.equal(jobEligible({template_key:'recovery'},{...q,stage:'ready'},{status:'confirmed'},now),false);
});
async function call(action,body={},headers={}){
 const req={method:'POST',query:{action},body,headers};let status;let data;const res={setHeader(){},status(s){status=s;return this;},json(v){data=v;return this;}};await handler(req,res);return {status,data};
}
test('public API cannot mutate admin settings or process forged payment notifications',async()=>{
 const a=await call('admin_mutate',{operation:'settings'});assert.equal(a.status,401);
 const b=await call('mp_webhook',{type:'payment',data:{id:1}});assert.equal(b.status,401);
 const c=await call('jobs');assert.equal(c.status,401);
 const d=await call('reserve',{}, {origin:'https://evil.example'});assert.equal(d.status,403);
});
test('submissions fail while environment is in test mode',async()=>{
 const before=globalThis.fetch;process.env.SUPABASE_URL='https://db.test';process.env.SUPABASE_SERVICE_ROLE_KEY='test';
 globalThis.fetch=async()=>new Response(JSON.stringify([{enabled:true,catalog}]),{status:200});
 try{const result=await call('submit',{...request,requestKey:randomUUID()});assert.equal(result.status,503);}finally{globalThis.fetch=before;}
});
test('Zoho reply webhook verifies the original bytes and pauses only the matching sender/quote',async()=>{
 const {Readable}=await import('node:stream');
 const before=globalThis.fetch,id=randomUUID(),key='zoho-signing-key';process.env.ZOHO_INBOUND_SECRET='shared-secret-long-enough-for-tests';
 const raw=Buffer.from(JSON.stringify({subject:`Re: Tu propuesta [${id}]`,fromAddress:'martin@example.com',messageId:'reply-1'},null,2));
 const writes=[];
 globalThis.fetch=async(url,options={})=>{
  if(String(url).includes('com_secrets?'))return new Response(JSON.stringify([{key:'zoho_signature',value:key}]));
  if(String(url).includes('com_quotes?')&&options.method!=='PATCH')return new Response(JSON.stringify([{id,email:'martin@example.com'}]));
  writes.push({url:String(url),body:JSON.parse(options.body)});return new Response('[]');
 };
 async function invoke(signature){const req=Readable.from([raw]);req.method='POST';req.query={action:'zoho_webhook',verify:process.env.ZOHO_INBOUND_SECRET};req.headers={'x-hook-signature':signature};let code;const res={setHeader(){},status(v){code=v;return this;},json(){return this;}};await handler(req,res);return code;}
 try{
  assert.equal(await invoke('forged'),401);assert.equal(writes.length,0);
  assert.equal(await invoke(createHmac('sha256',key).update(raw).digest('base64')),200);
  assert.ok(writes.some(w=>w.url.includes('com_quotes?')&&w.body.paused===true));
 }finally{globalThis.fetch=before;}
});
test('Zoho test mode routes email to the configured test inbox and escapes HTML',async()=>{
 const {sendZoho}=await import('../server/commercial/providers.js');const before=globalThis.fetch;
 Object.assign(process.env,{ZOHO_CLIENT_ID:'test',ZOHO_CLIENT_SECRET:'test',ZOHO_REFRESH_TOKEN:'test',ZOHO_ACCOUNT_ID:'123',ZOHO_FROM_ADDRESS:'arko@example.com',COMMERCIAL_TEST_EMAIL:'owner@example.com'});
 let sent;
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/oauth/'))return new Response(JSON.stringify({access_token:'test',expires_in:3600}));
  sent=JSON.parse(options.body);return new Response(JSON.stringify({status:{code:200},data:{messageId:'test-message'}}));
 };
 try{await sendZoho({to:'customer@example.com',subject:'Prueba',text:'<script>alert(1)</script>',link:'https://arkostudio.com.ar/presupuesto#test'});assert.equal(sent.fromAddress,'contacto@arkostudio.com.ar');assert.equal(sent.toAddress,'owner@example.com');assert.ok(sent.subject.startsWith('[PRUEBA]'));assert.ok(sent.content.includes('&lt;script&gt;'));assert.ok(!sent.content.includes('<script>'));}finally{globalThis.fetch=before;}
});

test('manual reply handling is explicit and defaults to webhook',async()=>{
 const {readiness}=await import('../server/commercial/providers.js');
 const previous=process.env.COMMERCIAL_REPLY_MODE;
 try{delete process.env.COMMERCIAL_REPLY_MODE;assert.equal(readiness().replyMode,'webhook');process.env.COMMERCIAL_REPLY_MODE='manual';assert.equal(readiness().replyMode,'manual');process.env.COMMERCIAL_REPLY_MODE='typo';assert.equal(readiness().replyMode,'webhook');}
 finally{if(previous===undefined)delete process.env.COMMERCIAL_REPLY_MODE;else process.env.COMMERCIAL_REPLY_MODE=previous;}
});

test('Mercado Pago return parameters do not alter the private quote token',async()=>{
 const {quoteTokenFromHash}=await import('../src/lib/quoteLink.js');
 const token=quoteToken(randomUUID());
 for(const suffix of ['', '?collection_id=null&status=null', '&baja=1', '?payment_id=123&status=approved'])assert.equal(quoteId(quoteTokenFromHash('#'+token+suffix)),quoteId(token));
 assert.equal(quoteTokenFromHash(''),'');
});

test('quote submission does not require a production date before choosing a week',()=>{
 const {timing,...withoutTiming}=request;
 assert.equal(validateRequest(withoutTiming,catalog).timing,'A definir al reservar');
 assert.equal(validateRequest({...withoutTiming,timing:''},catalog).timing,'A definir al reservar');
 assert.equal(validateRequest(request,catalog).timing,timing);
});

test('a la carte uses catalog prices, saves property type and separates video deliverables',()=>{
 const q=validateRequest({...request,pack:'custom',propertyType:'Lote / terreno',services:['foto','cine'],videos:[]},catalog);
 assert.equal(q.snapshot.total,300000);assert.equal(q.snapshot.propertyType,'Lote / terreno');
 assert.deepEqual(q.snapshot.services,['Fotografía HDR']);assert.deepEqual(q.snapshot.videos,['Video cinematográfico']);
 for(const services of [[],['fake'],['foto','foto']])assert.throws(()=>validateRequest({...request,pack:'custom',services},catalog));
 assert.throws(()=>validateRequest({...request,pack:'custom',services:['foto'],addons:[ADDONS[0].name]},catalog));
 assert.throws(()=>validateRequest({...request,propertyType:'invalid'},catalog));
});


test('reservation links preserve private tokens across new popup and legacy email links',()=>{
 const token='12345678-1234-4123-8123-123456789abc.signature';
 assert.equal(quoteTokenFromHash('#reserva='+token),token);
 assert.equal(quoteTokenFromHash('#reserva='+token+'&baja=1'),token);
 assert.equal(quoteTokenFromHash('#reserva='+token+'?collection_status=approved'),token);
 assert.equal(quoteTokenFromHash('#'+token),token);
});
