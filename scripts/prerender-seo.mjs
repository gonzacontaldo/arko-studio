import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'vite';
import {services} from '../src/data/services.js';
import {seoGuides} from '../src/data/seoGuides.js';
import {SITE_URL,DEFAULT_IMAGE,absoluteImage,pageSchema} from '../src/lib/seo.js';

const root=resolve('dist'),serverDir=resolve('.prerender');
const template=await readFile(resolve(root,'index.html'),'utf8');
const manifest=JSON.parse(await readFile(resolve(root,'.vite/manifest.json'),'utf8'));
const routes=[
 {path:'/',file:'src/pages/HomePage.jsx',title:'Fotografía y Video Inmobiliario en Buenos Aires | ARKO Studio',description:'Fotografía profesional, video, drone, planos y tours virtuales 360° para propiedades, inmobiliarias y desarrolladoras en Buenos Aires y Zona Norte.'},
 {path:'/portfolio',file:'src/pages/PortfolioPage.jsx',title:'Portfolio de Fotografía y Video Inmobiliario | ARKO Studio',description:'Una selección de producciones de ARKO Studio. Arquitectura, fotografía, video y recorridos inmobiliarios, presentados desde una mirada editorial.'},
 ...Object.entries(services).map(([slug,service])=>({path:`/${slug}`,file:`src/pages/${({'fotografia-inmobiliaria':'Photography','video-inmobiliario':'Video','drone-inmobiliario':'Aerial','tour-virtual-360':'Tours','planos-2d':'Plans'})[slug]}Page.jsx`,...service})),
 ...Object.entries(seoGuides).map(([slug,guide])=>({path:`/${slug}`,file:'src/pages/ContentGuidePage.jsx',...guide})),
];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const replace=(html,regex,value)=>html.replace(regex,(_,start,_old,end)=>`${start}${esc(value)}${end}`);
function routeStyles(file,seen=new Set()){
 if(seen.has(file))return [];seen.add(file);
 const chunk=manifest[file];if(!chunk)throw new Error(`Missing CSS manifest entry: ${file}`);
 return [...(chunk.css||[]),...(chunk.imports||[]).flatMap(key=>routeStyles(key,seen))];
}
try{
 await build({build:{ssr:'src/entry-server.jsx',outDir:serverDir,emptyOutDir:true,manifest:false,minify:false}});
 const {render}=await import(pathToFileURL(resolve(serverDir,'entry-server.js')).href);
 for(const route of routes){
  const url=`${SITE_URL}${route.path}`,image=absoluteImage(route.heroImage||DEFAULT_IMAGE);
  let html=template.replace(/<title>.*?<\/title>/,`<title>${esc(route.title)}</title>`);
  html=replace(html,/(<meta name="description" content=")(.*?)("\s*\/>)/,route.description);
  html=replace(html,/(<link rel="canonical" href=")(.*?)("\s*\/>)/,url);
  for(const [key,value] of Object.entries({'og:url':url,'og:title':route.title,'og:description':route.description,'og:image':image}))html=replace(html,new RegExp(`(<meta property="${key}" content=")(.*?)("\\s*\\/>)`),value);
  for(const [key,value] of Object.entries({'twitter:title':route.title,'twitter:description':route.description,'twitter:image':image}))html=replace(html,new RegExp(`(<meta name="${key}" content=")(.*?)("\\s*\\/>)`),value);
  const styles=[...new Set(routeStyles(route.file))].filter(css=>!html.includes(`href="/${css}"`)).map(css=>`<link rel="stylesheet" href="/${esc(css)}" />`).join('');
  const schema=pageSchema(route);
  html=html.replace('</head>',`${styles}<script id="page-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head>`);
  html=html.replace('<div id="root"></div>',()=>`<div id="root">${render(route.path)}</div>`);
  if(html.includes('<div id="root"></div>'))throw new Error(`Empty prerender: ${route.path}`);
  const output=route.path==='/'?resolve(root,'index.html'):resolve(root,route.path.slice(1),'index.html');
  await mkdir(dirname(output),{recursive:true});await writeFile(output,html);
 }
 const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${SITE_URL}${r.path}</loc></url>`).join('\n')}\n</urlset>\n`;
 await writeFile(resolve(root,'sitemap.xml'),sitemap);
 console.log(`Prerendered full HTML for ${routes.length} public routes and generated canonical sitemap.`);
}finally{await rm(serverDir,{recursive:true,force:true});}
