import {useEffect,useState} from 'react';
import {supabase} from './supabase';
import {mediaDefaults,normalizeServiceMedia} from '../data/serviceMedia';

// Store only public page media in the existing public portfolio bucket.
// The server checks administrator membership before writing with server credentials.
const entries=new Map();
function entry(id){if(!entries.has(id))entries.set(id,{data:{},loaded:false,promise:null,listeners:new Set()});return entries.get(id);}
const path=id=>`service-pages/${id}.json`;
export async function loadServiceMedia(id,{refresh=false}={}){
 const e=entry(id);if(e.promise)return e.promise;if(e.loaded&&!refresh)return e.data;
 e.promise=(async()=>{
  if(!supabase){e.loaded=true;return e.data;}
  const {data:{publicUrl}}=supabase.storage.from('portfolio').getPublicUrl(path(id));
  const response=await fetch(`${publicUrl}?v=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!response.ok){
   const body=await response.json().catch(()=>({}));
   if(response.status!==404&&!(response.status===400&&String(body.statusCode)==='404'))throw new Error('No pudimos cargar las imágenes guardadas. Intentá nuevamente.');
   e.data={};
  }else{
   const doc=await response.json();if(doc.version!==1)throw new Error('La configuración de esta página no es compatible.');
   e.data=normalizeServiceMedia(id,doc.media);
  }
  e.loaded=true;e.listeners.forEach(fn=>fn());return e.data;
 })().finally(()=>{e.promise=null;});
 return e.promise;
}
export async function saveServiceMedia(id,values){
 if(!supabase)throw new Error('Falta conectar el almacenamiento del sitio.');
 const normalized=normalizeServiceMedia(id,values),defaults=normalizeServiceMedia(id,mediaDefaults(id));
 // Save only overrides: build-generated asset URLs must keep following each deployment.
 const media=Object.fromEntries(Object.entries(normalized).filter(([key,value])=>JSON.stringify(value)!==JSON.stringify(defaults[key])));
 await mediaApi(id,'save',{body:JSON.stringify({media}),contentType:'application/json'});
 const e=entry(id);e.data=media;e.loaded=true;e.listeners.forEach(fn=>fn());return media;
}
export function useServiceMedia(id){
 const [,render]=useState(0);
 useEffect(()=>{const e=entry(id),update=()=>render(n=>n+1);e.listeners.add(update);loadServiceMedia(id).catch(()=>{});
 const refresh=()=>{if(document.visibilityState==='visible')loadServiceMedia(id,{refresh:true}).catch(()=>{});};
 document.addEventListener('visibilitychange',refresh);
 return()=>{e.listeners.delete(update);document.removeEventListener('visibilitychange',refresh);};},[id]);
 return {...mediaDefaults(id),...entry(id).data};
}
export async function uploadServiceImage(id,file){
 if(!supabase)throw new Error('Falta conectar el almacenamiento del sitio.');
 if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))throw new Error('Usá una imagen JPG, PNG, WebP o AVIF.');
 if(file.size>15*1024*1024)throw new Error('La imagen debe pesar menos de 15 MB.');
 return (await mediaApi(id,'upload',{body:file,contentType:file.type})).url;
}

async function mediaApi(id,action,{body,contentType}){
 const {data:{session}}=await supabase.auth.getSession();
 if(!session)throw new Error('Iniciá sesión en el administrador para guardar.');
 const response=await fetch(`/api/service-media?service=${encodeURIComponent(id)}&action=${action}`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':contentType},body});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||'No pudimos guardar. Volvé a intentar.');
 return data;
}
