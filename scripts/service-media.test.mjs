import {test} from 'node:test';
import assert from 'node:assert/strict';
import {youtubeId,normalizeMediaValue} from '../src/lib/serviceMediaValidation.js';
const field=type=>({type,label:'Ejemplo'});
test('accepts real YouTube URL formats and rejects spoofed providers',()=>{
 for(const url of ['ni3x6uBh2ZA','https://youtu.be/ni3x6uBh2ZA?t=10','https://www.youtube.com/watch?v=ni3x6uBh2ZA','https://youtube.com/shorts/ni3x6uBh2ZA','https://www.youtube-nocookie.com/embed/ni3x6uBh2ZA'])assert.equal(youtubeId(url),'ni3x6uBh2ZA');
 for(const url of ['https://youtube.com.evil.test/watch?v=ni3x6uBh2ZA','javascript:alert(1)','https://example.com/ni3x6uBh2ZA','invalid'])assert.equal(youtubeId(url),null);
});
test('tour iframes are reduced to provider URLs; arbitrary embedded code is rejected',()=>{
 assert.equal(normalizeMediaValue(field('kuula'),'<iframe src="https://kuula.co/share/collection/7Mzql?fs=1&amp;vr=0" allowfullscreen></iframe>'),'https://kuula.co/share/collection/7Mzql?fs=1&vr=0');
 assert.equal(normalizeMediaValue(field('kuula'),'https://doormann.viewin360.co/share/abc'),'https://doormann.viewin360.co/share/abc');
 assert.equal(normalizeMediaValue(field('matterport'),'https://my.matterport.com/show/?m=coM5kSn424q'),'https://my.matterport.com/show/?m=coM5kSn424q');
 for(const type of ['kuula','matterport'])for(const url of ['https://evil.test/show/?m=abc','https://kuula.co.evil.test/share/abc','javascript:alert(1)','<iframe src="https://evil.test/"></iframe>'])assert.throws(()=>normalizeMediaValue(field(type),url));
 assert.throws(()=>normalizeMediaValue(field('matterport'),'https://my.matterport.com/'));
});
test('image URLs allow local assets or HTTPS and reject executable or ambiguous schemes',()=>{
 for(const url of ['/assets/photo.jpg','https://example.com/photo.webp'])assert.equal(normalizeMediaValue(field('image'),url),url);
 for(const url of ['//evil.test/a.jpg','javascript:alert(1)','data:image/svg+xml,test','http://example.com/a.jpg','https://user:pass@example.com/a.jpg','/\\evil.test/a.jpg'])assert.throws(()=>normalizeMediaValue(field('image'),url));
});

test('service defaults and client persistence preserve defaults and errors',async()=>{
 const {createServer}=await import('vite');
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 const originalFetch=globalThis.fetch;
 try{
  const {supabase}=await server.ssrLoadModule('/src/lib/supabase.js');
  const {normalizeServiceMedia,mediaDefaults,SERVICE_MEDIA}=await server.ssrLoadModule('/src/data/serviceMedia.js');
  const {SERVICE_MEDIA_FIELDS}=await server.ssrLoadModule('/src/lib/serviceMediaSchema.js');
  const store=await server.ssrLoadModule('/src/lib/serviceMedia.js');
  for(const service of SERVICE_MEDIA){
   assert.doesNotThrow(()=>normalizeServiceMedia(service.id,mediaDefaults(service.id)));
   assert.deepEqual(Object.fromEntries(service.fields.map(f=>[f.key,f.type])),SERVICE_MEDIA_FIELDS[service.id]);
  }
  assert.deepEqual(normalizeServiceMedia('fotografia-inmobiliaria',{portfolioIds:['a','','b','a']}),{portfolioIds:['a','b']});
  let stored={version:1,media:{}},failWrite=false;
  supabase.auth.getSession=async()=>({data:{session:{access_token:'test-token'}}});
  supabase.storage.from=()=>({getPublicUrl:p=>({data:{publicUrl:`https://storage.test/${p}`}})});
  globalThis.fetch=async(url,options)=>{
   if(String(url).startsWith('/api/service-media')){
    assert.equal(options.headers.Authorization,'Bearer test-token');
    if(failWrite)return new Response(JSON.stringify({error:'Access denied'}),{status:403});
    if(String(url).includes('action=upload'))return new Response(JSON.stringify({url:'https://storage.test/upload.jpg'}),{status:201});
    stored={version:1,media:JSON.parse(options.body).media};return new Response(JSON.stringify({media:stored.media}),{status:200});
   }
   return new Response(JSON.stringify(stored),{status:200});
  };
  const values={...mediaDefaults('video-inmobiliario'),heroVideo:'https://youtu.be/SAIckW_n0g0',unexpected:'discard'};
  const saved=await store.saveServiceMedia('video-inmobiliario',values);
  assert.equal(saved.heroVideo,'SAIckW_n0g0');assert.equal(stored.media.unexpected,undefined);assert.equal(stored.media.processImage,undefined);
  failWrite=true;await assert.rejects(store.saveServiceMedia('video-inmobiliario',{...values,heroVideo:'ni3x6uBh2ZA'}),/Access denied/);
  assert.equal((await store.loadServiceMedia('video-inmobiliario',{refresh:true})).heroVideo,'SAIckW_n0g0');
  failWrite=false;
  assert.equal(await store.uploadServiceImage('planos-2d',new File(['content'],'image.jpg',{type:'image/jpeg'})),'https://storage.test/upload.jpg');
  await assert.rejects(store.uploadServiceImage('planos-2d',new File(['<svg/>'],'image.svg',{type:'image/svg+xml'})),/JPG/);
  await store.saveServiceMedia('video-inmobiliario',mediaDefaults('video-inmobiliario'));assert.deepEqual(stored.media,{});
 }finally{globalThis.fetch=originalFetch;await server.close();}
});

test('server requires an administrator and validates media and uploaded images',async()=>{
 const {default:handler}=await import('../api/service-media.js');
 const {Readable}=await import('node:stream');
 const originalFetch=globalThis.fetch,originalUrl=process.env.SUPABASE_URL,originalKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 process.env.SUPABASE_URL='https://storage.test';process.env.SUPABASE_SERVICE_ROLE_KEY='test-server-key';
 let isAdmin=true,uploaded;
 globalThis.fetch=async(url,options={})=>{
  if(url.includes('/auth/v1/user'))return new Response(JSON.stringify({id:'test-user'}),{status:200});
  if(url.includes('/rest/v1/com_admins'))return new Response(JSON.stringify(isAdmin?[{user_id:'test-user'}]:[]),{status:200});
  if(url.includes('/storage/v1/object/portfolio/')){uploaded={url,body:options.body};return new Response('{}',{status:200});}
  throw new Error('Unexpected request');
 };
 const call=async({auth=true,service='video-inmobiliario',action='save',body='{}',type='application/json'}={})=>{
  const req=Readable.from([Buffer.from(body)]);req.method='POST';req.headers={host:'localhost:5173','content-type':type,...auth?{authorization:'Bearer test-token'}:{}};req.query={service,action};
  const res={code:200,setHeader(){},status(code){this.code=code;return this;},json(data){this.body=data;return this;}};await handler(req,res);return res;
 };
 try{
  assert.equal((await call({auth:false})).code,401);
  isAdmin=false;assert.equal((await call()).code,403);isAdmin=true;
  assert.equal((await call({service:'../../private'})).code,400);
  assert.equal((await call({body:JSON.stringify({media:{heroVideo:'https://evil.test/video'}})})).code,400);
  assert.equal((await call({body:JSON.stringify({media:{heroVideo:'https://youtu.be/SAIckW_n0g0',unexpected:'discard'}})})).code,200);
  assert.deepEqual(JSON.parse(uploaded.body.toString()).media,{heroVideo:'SAIckW_n0g0'});
  assert.equal((await call({action:'upload',type:'image/png',body:'<svg/>'})).code,400);
  const png=Buffer.from([137,80,78,71,13,10,26,10]);
  const result=await call({action:'upload',type:'image/png',body:png});assert.equal(result.code,201);assert.match(result.body.url,/service-pages\/images\/video-inmobiliario\/[\w-]+\.png$/);
  assert.equal((await call({body:'x'.repeat(65537)})).code,413);
 }finally{globalThis.fetch=originalFetch;if(originalUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=originalUrl;if(originalKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=originalKey;}
});
