'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),M=require('../public/mechanics-rules-33621.js'),S=require('../public/status-rules-33627.js');
function fixture(conditions=[],actions=4){return {round:1,phase:'Hero Phase',partyHeroes:['Aldric'],hero:{x:0,y:0},hp:12,actions,conditions:[...conditions],inventory:{Aldric:[{id:'LT011',qty:2}]},tiles:{'0,0':{enemies:[]}}};}
for(const [statuses,granted,remaining]of [[[],1,[]],[['Exhausted'],0,['Exhausted']],[['Shocked'],0,[]],[['Exhausted','Shocked'],0,['Exhausted','Shocked']]])test('Stamina Draught respects '+(statuses.join(' and ')||'a turn with more than 3 Actions'),()=>{
 const g=fixture(statuses),r=M.action(g,'Aldric','STAMINA_DRAUGHT');assert.deepEqual(r,{cost:1,granted});assert.equal(g.actions,3+granted);assert.equal(g.inventory.Aldric[0].qty,1);assert.deepEqual(g.conditions,remaining);
});
test('Shocked consumes exactly one blocked Stamina gain and a second Draught can grant its Action',()=>{
 const g=fixture(['Shocked']);assert.equal(M.action(g,'Aldric','STAMINA_DRAUGHT').granted,0);assert.equal(S.has(g,'Shocked'),false);assert.equal(M.action(g,'Aldric','STAMINA_DRAUGHT').granted,1);assert.equal(g.actions,3);assert.deepEqual(g.inventory.Aldric,[]);
});
for(const [label,patch]of [['no item',g=>g.inventory.Aldric=[]],['no general Action',g=>{g.actions=1;g.attackOnlyActions=1}],['no Actions',g=>g.actions=0],['Stunned',g=>g.conditions=['Stunned']],['Knocked Down',g=>g.conditions=['Knocked Down']],['World Phase',g=>g.phase='World Phase']])test('Stamina Draught rejects '+label+' without mutation',()=>{
 const g=fixture();patch(g);const before=structuredClone({actions:g.actions,inventory:g.inventory,conditions:g.conditions});assert.ok(M.action(g,'Aldric','STAMINA_DRAUGHT').error);assert.deepEqual({actions:g.actions,inventory:g.inventory,conditions:g.conditions},before);
});
