import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultPortfolioIds,selectedPortfolio,validatePortfolioSelection} from '../src/lib/portfolioSelection.js';
const items=[{id:'a',destacado:false},{id:'b',destacado:true},{id:'c',destacado:true},{id:'d',destacado:true},{id:'e',destacado:true}];
test('initial magazine uses at most three featured works',()=>{
 assert.deepEqual(defaultPortfolioIds(items),['b','c','d']);
 assert.deepEqual(defaultPortfolioIds(items.map(item=>({...item,destacado:false}))),['a','b','c']);
});
test('only chosen properties appear, in their selected order',()=>{
 assert.deepEqual(selectedPortfolio(items,{selectedIds:['d','a']}).map(item=>item.id),['d','a']);
 assert.deepEqual(selectedPortfolio(items,{selectedIds:['a','missing','a','c']}).map(item=>item.id),['a','c']);
});
test('saving no selections never restores the full gallery',()=>{
 assert.deepEqual(validatePortfolioSelection({selectedIds:[]}),{selectedIds:[]});
 assert.deepEqual(selectedPortfolio(items,{selectedIds:[]}),[]);
 assert.deepEqual(validatePortfolioSelection({}),{});
});
test('invalid selections are rejected and duplicates removed',()=>{
 for(const selectedIds of ['a',[null],[''],Array.from({length:101},(_,i)=>String(i))])assert.throws(()=>validatePortfolioSelection({selectedIds}));
 assert.deepEqual(validatePortfolioSelection({selectedIds:['b','a','b']}),{selectedIds:['b','a']});
});
