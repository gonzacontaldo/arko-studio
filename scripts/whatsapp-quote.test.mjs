import {test} from 'node:test';
import assert from 'node:assert/strict';
import {whatsappQuote} from '../src/lib/whatsappQuote.js';
import {completeCatalog} from '../src/components/pricingData.js';
const catalog=completeCatalog();
const input={propertyType:'Casa',m2:201,zone:'Palermo, CABA',locationCategory:'caba',pack:'destacado',variant:'cine',videos:['reel'],tourPlatform:'matterport',hostingMonths:12,addons:['Participación del broker inmobiliario']};
test('WhatsApp draft carries complete selection and pending amounts without requiring contact data',()=>{
 const q=whatsappQuote(input,catalog),url=new URL(q.url);
 assert.deepEqual(q.errors,{});assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/5491176498888');assert.equal(url.searchParams.get('text'),q.text);
 assert.equal(q.estimate.knownSubtotal,725000);assert.equal(q.estimate.total,null);
 for(const value of ['201 m²','Palermo, CABA','Destacado Cine','Reel para redes','Matterport (reemplaza Kuula)','12 meses','Hosting extendido pendiente','Participación del broker','725.000','25.000'])assert.ok(q.text.includes(value),value);
 assert.ok(!q.text.includes('Nombre:'));assert.ok(!q.text.includes('Email:'));assert.ok(!q.text.includes('Tour Kuula'));
});
test('required essentials prevent an incomplete draft, without name or email fields',()=>{
 const q=whatsappQuote({m2:0,zone:' ',pack:'custom',services:[]},catalog);
 assert.equal(q.url,null);assert.deepEqual(Object.keys(q.errors).sort(),['locationCategory','m2','pack','propertyType','zone']);
});
test('special properties and other locations can be consulted without an invented final amount',()=>{
 const q=whatsappQuote({...input,propertyType:'Lote / terreno',zone:'Escobar',locationCategory:'other',hostingMonths:3},catalog);
 assert.ok(q.url);assert.equal(q.estimate.total,null);assert.ok(q.text.includes('Producción especial'));assert.ok(q.text.includes('Traslado pendiente'));assert.ok(!q.text.includes('Total estimado:'));
});
test('individual service increments and final CABA estimate agree in the draft',()=>{
 const q=whatsappQuote({...input,pack:'custom',services:['fpv'],videos:[],addons:[],hostingMonths:3,m2:101},catalog);
 assert.equal(q.estimate.total,175000);assert.ok(q.text.includes('Total estimado: $ 175.000'));assert.ok(!q.text.includes('Hosting solicitado'));
});
