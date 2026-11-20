import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Local adapter for the same authenticated handler Vercel runs in production.
function serviceMediaApi(){
 return {name:'service-media-api',configureServer(server){
  server.middlewares.use('/api/service-media',async(req,res)=>{
   try{
    const url=new URL(req.url,'http://localhost');req.query=Object.fromEntries(url.searchParams);
    res.status=code=>{res.statusCode=code;return res;};
    res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));return res;};
    const {default:handler}=await server.ssrLoadModule('/api/service-media.js');await handler(req,res);
   }catch{res.statusCode=503;res.end(JSON.stringify({error:'El servidor local no está configurado para guardar.'}));}
  });
 }};
}
export default defineConfig({plugins:[react(),serviceMediaApi()]});
