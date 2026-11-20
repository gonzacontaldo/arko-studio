import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryPlan } from '../src/admin/finanzas/recovery.js';
import { groupedServices } from '../src/admin/finanzas/serviceGroups.js';
const gear = (id, value, services, extra={}) => ({ id, nombre:id, valor_usd:value, servicios:services, activo:true, ...extra });
const config = (id,count,ids=[])=>({ servicio_id:id,trabajos_mes:count,equipos:ids });
test('equipo compartido se reparte una sola vez y conserva objetivo mensual',()=>{
 const p=recoveryPlan([gear('camera',1200,['foto','cine','reel','fpv'])],[config('foto',4,['camera']),config('cine',2,['camera'])],24);
 assert.equal(p.monthly,50);assert.equal(p.services.length,2);
 assert.ok(Math.abs(p.services[0].perJob-50/6)<1e-10);
 assert.ok(Math.abs(p.services.reduce((sum,s)=>sum+s.monthly,0)-50)<1e-10);
});
test('video une formatos y contabiliza equipos exclusivos de reels',()=>{
 assert.deepEqual(groupedServices(['cine','reel','fpv'].map(id=>({id,name:id}))).map(s=>s.id),['cine']);
 const p=recoveryPlan([gear('mic',240,['reel'])],[config('cine',2),config('reel',2)],12);
 assert.equal(p.services.length,1);assert.equal(p.services[0].perJob,10);
});
test('descuenta recuperación manual, excluye archivados y señala equipos sin asignar',()=>{
 const p=recoveryPlan([gear('a',1200,['foto'],{recuperado_usd:600}),gear('b',300,['general']),gear('c',1000,['cine'],{activo:false}),gear('d',200,['foto'],{recuperado_usd:200})],[config('foto',4)],12);
 assert.equal(p.pending,900);assert.equal(p.monthly,75);assert.equal(p.unallocated,25);assert.equal(p.services[0].perJob,12.5);
 assert.equal(p.equipment.find(e=>e.id==='d').monthly,0);
 assert.equal(recoveryPlan([],[],0),null);assert.equal(recoveryPlan([],[],1.5),null);
});
test('escenario Arko: todos los equipos recuperan 10019 USD en 24 meses sin duplicación',()=>{
 const equipment=[gear('canon',2728,['foto','cine']),gear('rf',2000,['foto','cine']),gear('nd',300,['foto','cine']),gear('sd',500,['foto','cine','tour']),gear('360',770,['tour']),gear('dron',1000,['cine']),gear('gimbal',660,['cine']),gear('50mm',2000,['cine']),gear('mic',61,['reel'])];
 const p=recoveryPlan(equipment,[config('foto',4),config('cine',2),config('tour',1)],24);
 assert.equal(p.invested,10019);assert.equal(p.unallocated,0);
 assert.ok(Math.abs(p.services.reduce((s,c)=>s+c.monthly,0)*24-10019)<1e-8);
});
