import {randomUUID} from 'node:crypto';
import {requireAdmin} from '../server/commercial/db.js';
import {SERVICE_MEDIA_FIELDS,validateServiceMedia} from '../src/lib/serviceMediaSchema.js';
export const config={api:{bodyParser:false},maxDuration:60};
async function read(req,limit){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>limit)throw Object.assign(new Error('El archivo o contenido es demasiado grande.'),{status:413});chunks.push(chunk);}return Buffer.concat(chunks);}
async function upload(path,body,type,upsert){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const response=await fetch(`${url}/storage/v1/object/portfolio/${path}`,{method:'POST',signal:AbortSignal.timeout(30000),headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':type,'cache-control':upsert?'max-age=0':'max-age=31536000','x-upsert':String(upsert)},body});
 if(!response.ok)throw Object.assign(new Error('No pudimos guardar el contenido en el almacenamiento.'),{status:503});
 return `${url}/storage/v1/object/public/portfolio/${path}`;
}
function validImage(bytes,type){
 if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(type==='image/png')return bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(type==='image/webp')return bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 if(type==='image/avif')return bytes.toString('ascii',4,8)==='ftyp'&&/avif|avis/.test(bytes.toString('ascii',8,32));
 return false;
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  if(req.method!=='POST')return res.status(405).json({error:'Método no permitido.'});
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'Origen no permitido.'});
  await requireAdmin(req);
  const id=String(req.query?.service||''),action=String(req.query?.action||'save');
  if(!Object.hasOwn(SERVICE_MEDIA_FIELDS,id))return res.status(400).json({error:'Servicio desconocido.'});
  if(action==='upload'){
   const type=String(req.headers['content-type']||'').split(';')[0],ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[type];
   if(!ext)return res.status(400).json({error:'Usá una imagen JPG, PNG, WebP o AVIF.'});
   const bytes=await read(req,15*1024*1024);if(!validImage(bytes,type))return res.status(400).json({error:'El archivo no es una imagen válida del tipo indicado.'});
   const url=await upload(`service-pages/images/${id}/${randomUUID()}.${ext}`,bytes,type,false);
   return res.status(201).json({url});
  }
  if(action!=='save')return res.status(400).json({error:'Operación desconocida.'});
  let media;try{const body=JSON.parse((await read(req,65536)).toString());media=validateServiceMedia(id,body.media);}catch(err){if(err.status)throw err;return res.status(400).json({error:err instanceof SyntaxError?'Contenido inválido.':err.message});}
  const updatedAt=new Date().toISOString();
  await upload(`service-pages/${id}.json`,Buffer.from(JSON.stringify({version:1,media,updatedAt})),'application/json',true);
  return res.status(200).json({media,updatedAt});
 }catch(err){return res.status(err.status||503).json({error:err.status?err.message:'No pudimos completar la operación. Volvé a intentar.'});}
}
