import assert from 'node:assert/strict';
import {propertyPrice} from '../src/lib/propertyPricing.js';
import {validateRequest} from '../server/commercial/domain.js';
import {completeCatalog} from '../src/components/pricingData.js';
const catalog=completeCatalog(),input={name:'Test',email:'test@example.com',zone:'CABA',locationCategory:'caba',propertyType:'Casa',m2:100,pack:'base',videos:[],addons:[]};
assert.equal(propertyPrice(catalog.packs[0],101,'Casa'),300000);
assert.equal(propertyPrice(catalog.packs[0],101,'Departamento / oficina'),300000);
for(const type of ['Lote / terreno','Galpón / nave industrial / hangar','Complejo de departamentos / oficinas','Campo / establecimiento rural','Otra propiedad']){
 assert.equal(propertyPrice(catalog.packs[0],500,type),null);
 const q=validateRequest({...input,propertyType:type},catalog);assert.equal(q.snapshot.total,null);assert.equal(q.snapshot.requiresReview,true);assert.deepEqual(q.snapshot.lineItems,[]);
}
for(const type of ['Casa','Departamento / oficina']){const q=validateRequest({...input,propertyType:type,m2:501},catalog);assert.equal(q.snapshot.lineItems.reduce((sum,row)=>sum+row.total,0),q.snapshot.total);}
console.log('Property pricing and manual intake tests passed.');
