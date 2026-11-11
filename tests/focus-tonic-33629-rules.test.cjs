'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('../public/mechanics-rules-33621.js'),S=require('../public/status-rules-33627.js');
function fixture(conditions=[]){return {partyHeroes:['Aldric','Lyra'],round:1,phase:'Hero Phase',hp:12,actions:3,hero:{x:0,y:0},conditions:structuredClone(conditions),statusActivation33627:{start:'current'},lyra:{hp:8,actions:0,x:0,y:0,conditions:['Inspired']},inventory:{Aldric:[{id:'LT009',kind:'loot',qty:2}]},tiles:{'0,0':{enemies:[]}}}}
test('Focus Tonic spends one Action and one item; survives current end and expires at next distinct same-round turn end',()=>{
 const g=fixture();assert.deepEqual(M.action(g,'Aldric','FOCUS_TONIC'),{cost:1,inspired:true,preservedExisting:false});
 assert.equal(g.actions,2);assert.equal(g.inventory.Aldric[0].qty,1);assert.equal(S.has(g,'Inspired'),true);
 S.heroEnd(g,'Aldric',{token:'current'});assert.equal(S.has(g,'Inspired'),true);
 S.heroStart(g,'Aldric',{token:'extra'});assert.equal(S.has(g,'Inspired'),true);
 const restored=structuredClone(g);S.heroEnd(restored,'Aldric',{token:'extra'});assert.equal(S.has(restored,'Inspired'),false);
 assert.equal(S.has(restored.lyra,'Inspired'),true);S.heroEnd(restored,'Aldric',{token:'extra'});assert.equal(S.has(restored,'Inspired'),false);
});
test('Focus Tonic preserves pre-existing permanent Inspired and its absence of expiry',()=>{
 const g=fixture(['Inspired']);assert.equal(M.action(g,'Aldric','FOCUS_TONIC').preservedExisting,true);
 S.heroEnd(g,'Aldric',{token:'current'});S.heroStart(g,'Aldric',{token:'next'});S.heroEnd(g,'Aldric',{token:'next'});
 assert.equal(S.has(g,'Inspired'),true);assert.equal(g.statusDurations33628.Inspired.duration,'Until removed.');
});
for(const [label,patch]of [['no item',g=>g.inventory.Aldric=[]],['no Actions',g=>g.actions=0],['attack-only Action',g=>{g.actions=1;g.attackOnlyActions=1}],['Stunned',g=>g.conditions=['Stunned']],['Knocked Down',g=>g.conditions=['Knocked Down']],['defeated',g=>g.hp=0],['World Phase',g=>g.phase='World Phase']])test('Focus Tonic rejects '+label+' without spending resources or granting Inspired',()=>{
 const g=fixture();patch(g);const before={actions:g.actions,inventory:structuredClone(g.inventory),conditions:structuredClone(g.conditions)};
 assert.ok(M.action(g,'Aldric','FOCUS_TONIC').error);assert.deepEqual({actions:g.actions,inventory:g.inventory,conditions:g.conditions},before);
});

test('reapplying Focus Tonic refreshes its own non-stacking grant through the following distinct turn',()=>{
 const g=fixture();M.action(g,'Aldric','FOCUS_TONIC');S.heroEnd(g,'Aldric',{token:'current'});
 S.heroStart(g,'Aldric',{token:'extra'});M.action(g,'Aldric','FOCUS_TONIC');assert.equal(g.conditions.filter(c=>S.name(c)==='Inspired').length,1);
 S.heroEnd(g,'Aldric',{token:'extra'});assert.equal(S.has(g,'Inspired'),true);
 const restored=structuredClone(g);S.heroStart(restored,'Aldric',{token:'third'});S.heroEnd(restored,'Aldric',{token:'third'});assert.equal(S.has(restored,'Inspired'),false);
});
for(const sequence of [['end','round'],['round','end']])test('Focus Tonic preserves an independent Round-end grant when expiries occur in '+sequence.join(' then ')+' order',()=>{
 const g=fixture(['Inspired']);S.recordApplication(g,'Inspired',{token:'current',round:1,duration:'Until end of round.'});M.action(g,'Aldric','FOCUS_TONIC');
 for(let i=0;i<sequence.length;i++){S.expire(g,sequence[i],{token:'extra',round:1});assert.equal(S.has(g,'Inspired'),i===0);}
});
