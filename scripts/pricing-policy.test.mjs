import test from 'node:test';
import assert from 'node:assert/strict';
import {completeCatalog,PACKS,SERVICES,MATTERPORT_UPGRADE,CABA_TRAVEL} from '../src/components/pricingData.js';
import {estimateProduction,defaultVideos,quoteSummary} from '../src/lib/productionQuote.js';
import {propertyPrice} from '../src/lib/propertyPricing.js';
import {validateRequest} from '../server/commercial/domain.js';
import {savedQuoteSummary} from '../src/lib/quotePresentation.js';
const catalog=completeCatalog();
const choices=[['base','fpv'],['destacado','fpv'],['destacado','cine'],['completo','cine']];
const rows={100:[225000,335000,375000,485000],101:[300000,435000,475000,610000],200:[300000,435000,475000,610000],201:[375000,535000,575000,735000],300:[375000,535000,575000,735000],500:[525000,735000,775000,985000]};
const selection=(pack,variant,m2=100)=>({pack,variant,m2,propertyType:'Casa',videos:defaultVideos(pack,variant),tourPlatform:'kuula',hostingMonths:3});
for(const [m2,prices] of Object.entries(rows))test(`approved pack prices at ${m2} m²`,()=>{
 choices.forEach(([pack,variant],i)=>assert.equal(estimateProduction(selection(pack,variant,Number(m2)),catalog).productionSubtotal,prices[i]));
});
test('Matterport and CABA are each charged exactly once regardless of area or video count',()=>{
 for(const m2 of [100,101,200,201,300,500])for(const [pack,variant] of choices){
  const base=estimateProduction(selection(pack,variant,m2),catalog);
  const upgraded=estimateProduction({...selection(pack,variant,m2),tourPlatform:'matterport',locationCategory:'caba'},catalog);
  assert.equal(upgraded.total,base.productionSubtotal+75000+25000);
  assert.equal(upgraded.lineItems.filter(row=>row.description.includes('Matterport')).length,1);
  assert.equal(upgraded.lineItems.filter(row=>row.description.includes('Traslado')).length,1);
  assert.ok(upgraded.services.some(row=>row.name==='Tour Matterport'));assert.ok(!upgraded.services.some(row=>row.name==='Tour Kuula'));
 }
});
test('individual services use approved increments for each started 100 m² block',()=>{
 assert.deepEqual(Object.fromEntries(SERVICES.map(row=>[row.id,row.base])),{foto:125000,fpv:125000,cine:175000,reel:175000,tour:75000,matterport:150000,planos:60000});
 for(const row of SERVICES){assert.equal(propertyPrice(row,100,'Casa'),row.base);for(const [m2,blocks] of [[101,1],[200,1],[201,2],[300,2],[500,4]]){const increment=['fpv','planos'].includes(row.id)?25000:50000;assert.equal(row.per100,increment);assert.equal(propertyPrice(row,m2,'Casa'),row.base+blocks*increment);const e=estimateProduction({pack:'custom',services:[row.id],m2,propertyType:'Casa',locationCategory:'caba'},catalog);assert.equal(e.total,row.base+blocks*increment+25000);const q=validateRequest({...e.selection,name:'QA',email:'qa@example.com',zone:'CABA'},catalog);assert.equal(q.snapshot.total,e.total);assert.equal(q.snapshot.lineItems.reduce((sum,r)=>sum+r.total,0),e.total);}}
 const e=estimateProduction({pack:'custom',services:['matterport'],m2:100,propertyType:'Casa',locationCategory:'caba'},catalog);assert.equal(e.productionSubtotal,150000);assert.equal(e.total,175000);
});
test('extended hosting preserves a known subtotal but never implies a final total',()=>{
 for(const hostingMonths of [6,12])for(const tourPlatform of ['kuula','matterport']){
  const e=estimateProduction({...selection('base','fpv'),hostingMonths,tourPlatform,locationCategory:'caba'},catalog);
  assert.equal(e.total,null);assert.equal(e.knownSubtotal,225000+(tourPlatform==='matterport'?75000:0)+25000);
  assert.ok(quoteSummary(e).some(line=>line.includes(`${hostingMonths} meses`)&&line.includes('pendiente')));
 }
});
test('special properties and unspecified logistics require a quote',()=>{
 for(const propertyType of ['Lote / terreno','Campo / establecimiento rural','Complejo de departamentos / oficinas','Galpón / nave industrial / hangar','Otra propiedad']){const e=estimateProduction({...selection('base','fpv',500),propertyType},catalog);assert.equal(e.productionSubtotal,null);assert.equal(e.total,null);}
 const e=estimateProduction({...selection('base','fpv'),locationCategory:'other'},catalog);assert.equal(e.total,null);assert.equal(e.knownSubtotal,225000);
});
test('cine and reel are separate deliverables and unsupported combinations require a quote',()=>{
 const e=estimateProduction({pack:'custom',services:['cine','reel'],m2:100,propertyType:'Casa'},catalog);assert.equal(e.total,null);assert.equal(e.productionSubtotal,null);
 const input={name:'Test',email:'qa@example.com',zone:'CABA',locationCategory:'caba',propertyType:'Casa',m2:100,pack:'completo',videos:['cine','reel']};
 assert.throws(()=>validateRequest(input,catalog));
 assert.equal(validateRequest({...input,videos:['fpv','reel']},catalog).snapshot.total,510000);
});
test('the server snapshot, estimator and generated summary agree without trusting a client price',()=>{
 for(const [pack,variant] of choices){const input={...selection(pack,variant,201),name:'Test',email:'qa@example.com',zone:'CABA',locationCategory:'caba',tourPlatform:'matterport',hostingMonths:12,total:1};const e=estimateProduction(input,catalog),q=validateRequest(input,catalog);assert.equal(q.snapshot.total,null);assert.equal(q.snapshot.knownSubtotal,e.knownSubtotal);assert.deepEqual(q.snapshot.summary,quoteSummary(e));assert.ok(savedQuoteSummary({...q,total:null}).some(line=>line.includes('12 meses')));assert.ok(!savedQuoteSummary({...q,total:null}).some(line=>line.includes('$ 0')));}
});
test('legacy catalogs cannot silently reinstate old prices or an individual area scale',()=>{
 const old={services:SERVICES.map(s=>({...s,base:1,per100:25000})),packs:PACKS.map(p=>({...p,base:1,per100:1})),addons:[{name:'Tour en Matterport',price:200000}]};
 const c=completeCatalog(old);assert.equal(c.packs[0].base,225000);assert.equal(c.services.find(s=>s.id==='cine').base,175000);assert.ok(c.services.every(s=>s.per100===(['fpv','planos'].includes(s.id)?25000:50000)));assert.ok(!c.addons.some(a=>a.name==='Tour en Matterport'));
});

test('version 2 catalog gains new approved increments while retaining approved base and pack prices',()=>{
 const old={...catalog,pricingVersion:2,services:catalog.services.map(s=>({...s,per100:null}))};
 const c=completeCatalog(old);assert.equal(c.pricingVersion,3);assert.deepEqual(c.services,SERVICES);assert.deepEqual(c.packs,catalog.packs);
});
