import assert from 'node:assert/strict';
import {propertyPrice,questionsFor} from '../src/lib/propertyPricing.js';
import {validateRequest} from '../server/commercial/domain.js';
import {PACKS,SERVICES,ADDONS} from '../src/components/pricingData.js';
const catalog={packs:PACKS,services:SERVICES,addons:ADDONS};
const input={name:'Test',email:'test@example.com',zone:'Palermo',propertyType:'Casa',m2:100,pack:'base',videos:[],addons:[]};
assert.equal(propertyPrice(PACKS[0],500,'Lote / terreno'),175000);
assert.equal(propertyPrice(PACKS[0],501,'Lote / terreno'),225000);
assert.equal(propertyPrice(PACKS[0],1001,'Lote / terreno'),275000);
assert.equal(propertyPrice(PACKS[1],101,'Casa'),335000);
assert.equal(propertyPrice(PACKS[1],101,'Departamento / oficina'),310000);
for(const type of ['Complejo de departamentos / oficinas','Campo / establecimiento rural','Otra propiedad']){
 assert.throws(()=>validateRequest({...input,propertyType:type},catalog));
 const quote=validateRequest({...input,propertyType:type,phone:'+54 11 12345678',scope:Object.fromEntries(questionsFor(type).map(([key])=>[key,'Detalle del alcance']))},catalog);
 assert.equal(quote.snapshot.total,null);assert.equal(quote.snapshot.requiresReview,true);assert.deepEqual(quote.snapshot.lineItems,[]);
}
for(const type of ['Casa','Departamento / oficina','Lote / terreno','Galpón / nave industrial / hangar']){
 const q=validateRequest({...input,propertyType:type,m2:501},catalog);
 assert.equal(q.snapshot.lineItems.reduce((sum,row)=>sum+row.total,0),q.snapshot.total);
}
console.log('Property pricing and manual intake tests passed.');
