'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const rules=require('../public/status-rules-33627.js');
test('canonical start/end timing applies persistent damage and recovery once per actual activation',()=>{
 const unit={hp:6,max:10,conditions:['Bleeding','Poisoned','Burning','Regenerating']};
 const first=rules.start(unit,{token:'round1'});assert.equal(unit.hp,5);assert.deepEqual(first.events,[{status:'Bleeding',kind:'damage',amount:1},{status:'Poisoned',kind:'damage',amount:1},{status:'Regenerating',kind:'heal',amount:1}]);
 assert.equal(rules.start(unit,{token:'round1'}).duplicate,true);assert.equal(unit.hp,5);
 rules.end(unit,{token:'round1'});assert.equal(unit.hp,4);rules.end(unit,{token:'round1'});assert.equal(unit.hp,4);
 rules.start(unit,{token:'extra-activation'});assert.equal(unit.hp,3);
 assert.deepEqual(unit.conditions,['Bleeding','Poisoned','Burning','Regenerating']);
});
test('Regenerating caps recovery and does not bypass prohibitions or revive 0-HP figures',()=>{
 const unit={hp:10,maxHp:10,conditions:['Regenerating']};rules.start(unit,{token:'full'});assert.equal(unit.hp,10);
 unit.hp=4;rules.start(unit,{token:'prohibited',noHeal:true});assert.equal(unit.hp,4);
 unit.hp=0;rules.start(unit,{token:'downed'});assert.equal(unit.hp,0);
});
test('fatal start damage stops recovery, reports defeat exactly once, and applies no Actions',()=>{
 const unit={hp:1,maxHp:10,conditions:[{name:'Bleeding'},{name:'Poisoned'},{name:'Regenerating'}]},deaths=[];
 const actual=rules.start(unit,{token:'fatal',onDefeat:(unit,status)=>deaths.push(status)});
 assert.equal(unit.hp,0);assert.equal(actual.actions,0);assert.deepEqual(deaths,['Bleeding']);
 rules.start(unit,{token:'fatal',onDefeat:()=>deaths.push('duplicate')});assert.deepEqual(deaths,['Bleeding']);
});
test('Stunned prevents Actions and Reactions, expires after an activation, and still receives start/end damage',()=>{
 const unit={hp:7,conditions:[{name:'Stunned'},'Poisoned','Burning','Slowed']};
 const start=rules.start(unit,{token:'stunned'});assert.equal(start.actions,0);assert.equal(unit.hp,6);assert.match(rules.actionError(unit),/Stunned/);
 const end=rules.end(unit,{token:'stunned'});assert.equal(unit.hp,5);assert.equal(end.stunned,false);assert.equal(rules.actionError(unit),null);assert.equal(end.actions,2);
});
test('Hero start uses each state layout, equipment Health cap and existing no-heal flags',()=>{
 const g={partyHeroes:['Aldric','Lyra','Seraphine','Rowan'],round:1,hp:13,conditions:['Regenerating'],lyra:{hp:7,maxHp:8,conditions:['Regenerating']},seraphine:{hp:7,maxHp:11,noHealUntilRound:1,conditions:['Regenerating']},heroRuntimeStates:{Rowan:{hp:8,maxHp:9,conditions:['Regenerating']}},equipped:{Aldric:{Armor:'EQ097'}},campaign:{currentQuest:'Q002'}};
 for(const h of g.partyHeroes)rules.heroStart(g,h,{token:h});
 assert.equal(g.hp,14);assert.equal(g.lyra.hp,8);assert.equal(g.seraphine.hp,7);assert.equal(g.heroRuntimeStates.Rowan.hp,9);
});
test('status defeats preserve the actual Downed-versus-Lost campaign distinction',()=>{
 const g={partyHeroes:['Rowan','Garruk'],round:2,heroRuntimeStates:{Rowan:{hp:1,x:0,y:0,conditions:['Bleeding']},Garruk:{hp:5,x:0,y:0,conditions:[]}},campaign:{currentQuest:'Q002',day:3}};
 rules.heroStart(g,'Rowan',{token:'with-companion'});assert.deepEqual(g.campaign.heroFates.Rowan,{status:'Downed',quest:'Q002',day:3});
 g.heroRuntimeStates.Rowan.hp=1;delete g.campaign.heroFates.Rowan;g.heroRuntimeStates.Garruk.x=1;
 rules.heroStart(g,'Rowan',{token:'alone'});assert.deepEqual(g.campaign.heroFates.Rowan,{status:'Lost',quest:'Q002',day:3});
});
