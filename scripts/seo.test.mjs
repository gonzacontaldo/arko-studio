import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {SITE_URL,pageSchema} from '../src/lib/seo.js';
const paths=['/','/portfolio','/fotografia-inmobiliaria','/video-inmobiliario','/drone-inmobiliario','/planos-2d','/tour-virtual-360','/fpv-inmobiliario','/contenido-inmobiliario'];
const html=path=>readFile(`dist${path==='/'?'':path}/index.html`,'utf8');
test('each public route delivers full content, one canonical and matching social metadata before JavaScript',async()=>{
 const titles=new Set();
 for(const path of paths){const s=await html(path),url=`${SITE_URL}${path}`;
  assert.equal((s.match(/<h1[ >]/g)||[]).length,1,path);
  assert.equal((s.match(/rel="canonical"/g)||[]).length,1,path);
  assert.ok(s.includes(`rel="canonical" href="${url}"`),path);
  assert.ok(s.includes(`property="og:url" content="${url}"`),path);
  assert.ok(!s.includes('https://www.arkostudio.com.ar'),path);
  assert.equal((s.match(/id="page-schema"/g)||[]).length,1,path);
  const title=s.match(/<title>(.*?)<\/title>/)[1];assert.ok(!titles.has(title),title);titles.add(title);
  assert.ok((s.match(/<h2[ >]/g)||[]).length>=(path==='/portfolio'?1:2),path);
  assert.ok(s.includes('href="/fpv-inmobiliario"'),path);
  assert.ok(s.includes('href="/contenido-inmobiliario"'),path);
  const graph=JSON.parse(s.match(/<script id="page-schema" type="application\/ld\+json">(.*?)<\/script>/)[1]);assert.ok(graph['@graph'].some(node=>node['@type']==='BreadcrumbList'));
 }
 assert.ok((await html('/video-inmobiliario')).includes('¿Me entregan versiones horizontales y verticales?'));
 assert.ok((await html('/tour-virtual-360')).includes('¿Qué pasa después de los tres meses?'));
});
test('rendered asset and CSS references exist in the deployable client build',async()=>{
 for(const path of paths){const s=await html(path);for(const file of new Set([...s.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(m=>m[1]))){await assert.doesNotReject(()=>access('dist'+file),`${path}: ${file}`);}}
});
test('all canonical public routes have sitemap entries and explicit Vercel static rewrites',async()=>{
 const sitemap=await readFile('dist/sitemap.xml','utf8'),config=JSON.parse(await readFile('vercel.json','utf8'));
 for(const path of paths){assert.ok(sitemap.includes(`<loc>${SITE_URL}${path}</loc>`),path);if(path!=='/')assert.ok(config.rewrites.some(r=>r.source===path&&r.destination===path+'/index.html'),path);}
 assert.ok(!sitemap.includes('/admin'));assert.ok(!sitemap.includes('/presupuesto'));
});
test('FPV is a distinct service guide linked to its broader video category',()=>{
 const graph=pageSchema({path:'/fpv-inmobiliario',title:'Drone FPV inmobiliario | ARKO Studio',description:'Recorridos con drone'});
 const crumbs=graph['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement;
 assert.equal(crumbs[1].item,SITE_URL+'/video-inmobiliario');assert.equal(crumbs[2].item,SITE_URL+'/fpv-inmobiliario');
});
