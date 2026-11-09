'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../public/mechanics-rules-33621.js'),S=require('../public/status-rules-33627.js');
function game(){return {phase:'Hero Phase',partyHeroes:['Aldric'],round:1,hp:4,actions:3,hero:{x:0,y:0},conditions:[{name:'Knocked Down'}],tiles:{'0,0':{enemies:[]}}}}
test('Stand costs one general Action and clears Knocked Down before other Actions',()=>{
 const g=game();assert.match(S.actionError(g),/Stand/);assert.match(R.action(g,'Aldric','REST').error,/Stand/);assert.deepEqual(R.action(g,'Aldric','STAND'),{cost:1,stood:true});assert.equal(g.actions,2);assert.equal(S.has(g,'Knocked Down'),false);assert.equal(S.actionError(g),null);assert.ok(R.action(g,'Aldric','STAND').error);
});
test('Stand cannot spend Attack-only Actions or resolve while Stunned',()=>{
 const g=game();g.actions=1;g.attackOnlyActions=1;const before=JSON.stringify(g);assert.ok(R.action(g,'Aldric','STAND').error);assert.equal(JSON.stringify(g),before);
 assert.match(S.actionError({conditions:['Stunned','Knocked Down']}),/Stunned/);assert.equal(S.actionError({conditions:['Knocked Down']},{duringTurn:false}),null);
});
