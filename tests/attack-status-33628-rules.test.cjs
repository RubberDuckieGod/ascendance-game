'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../public/status-rules-33627.js');
test('Blessed and Shaken trigger on the first actual Attack of each round and preserve serialized usage',()=>{
 const b={conditions:['Blessed','Shaken']};assert.deepEqual(R.attackEffects(b,{round:1}),{bonus:0,post:0});assert.deepEqual(R.attackEffects(b,{round:1}),{bonus:0,post:0});assert.deepEqual(b.conditions,[{name:'Blessed',usedRound:1},{name:'Shaken',usedRound:1}]);assert.deepEqual(R.attackEffects(b,{round:2}),{bonus:0,post:0});
});
test('Empowered and Focused consume exactly their printed next-Attack/penalty uses',()=>{
 const b={conditions:['Empowered','Focused','Weakened']};assert.equal(R.attackEffects(b,{round:1}).bonus,3);assert.equal(R.has(b,'Empowered'),false);assert.equal(R.has(b,'Focused'),false);assert.equal(R.attackEffects(b,{round:1}).bonus,0);
 const c={conditions:['Focused']};assert.equal(R.attackEffects(c,{round:1}).bonus,0);assert.equal(R.has(c,'Focused'),true);
});
test('Rallied waits for an allied Hero and refreshes on each distinct turn, including same-round extra turns',()=>{
 const b={conditions:['Rallied']};assert.equal(R.attackEffects(b,{token:'one',alliedHere:false}).bonus,0);assert.equal(R.attackEffects(b,{token:'one',alliedHere:true}).bonus,1);assert.equal(R.attackEffects(b,{token:'one',alliedHere:true}).bonus,0);assert.equal(R.attackEffects(b,{token:'extra',alliedHere:true}).bonus,1);
});
test('Frenzied and Bloodthirsty trigger on real kills, with one recovery per turn and one next-Attack bonus',()=>{
 const b={conditions:['Frenzied','Bloodthirsty']};assert.equal(R.attackEffects(b,{token:'one'}).bonus,0);assert.equal(R.killEffects(b,{token:'one'}).heal,1);assert.equal(R.killEffects(b,{token:'one'}).heal,0);assert.equal(R.attackEffects(b,{token:'one'}).bonus,1);assert.equal(R.attackEffects(b,{token:'one'}).bonus,0);assert.equal(R.killEffects(b,{token:'extra'}).heal,1);
});
test('attacking removes Hidden and Camouflaged',()=>{
 const b={conditions:['Hidden','Camouflaged']};R.attackEffects(b,{round:1});assert.equal(R.has(b,'Hidden'),false);assert.equal(R.has(b,'Camouflaged'),false);
});
