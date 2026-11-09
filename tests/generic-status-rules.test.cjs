const {test}=require('node:test'),assert=require('node:assert/strict');
const R=require('../public/status-rules-33627.js');
for(const object of [false,true])for(const [immune,blocked]of [['Wet','Burning'],['Fireproof','Burning'],['Coldproof','Frozen'],['Coldproof','Chilled'],['Shockproof','Shocked'],['Shockproof','Electrified'],['Venomproof','Poisoned'],['Consecrated','Cursed'],['Consecrated','Hexed'],['Steadfast','Frightened'],['Steadfast','Panicked'],['Steadfast','Shaken']])test(immune+' rejects '+blocked+'; named-object='+object,()=>{
 const b={conditions:[object?{name:immune}:immune]};const out=R.application(b,object?{name:blocked}:blocked);assert.equal(out.allowed,false);assert.equal(out.blockedBy,immune);assert.equal(R.has(b,immune),true);
});
test('Ward ignores exactly the next harmful application and preserves beneficial effects',()=>{
 const b={conditions:[{name:'Ward'}]};assert.equal(R.application(b,'Inspired').allowed,true);assert.equal(R.has(b,'Ward'),true);assert.equal(R.application(b,'Bleeding').allowed,false);assert.equal(R.has(b,'Ward'),false);assert.equal(R.application(b,'Bleeding').allowed,true);
});
test('permanent immunity is checked before spending Ward or Unstoppable',()=>{
 const b={conditions:['Coldproof','Ward','Unstoppable']};assert.equal(R.application(b,'Frozen').blockedBy,'Coldproof');assert.equal(R.has(b,'Ward'),true);assert.equal(R.has(b,'Unstoppable'),true);
});
test('Unstoppable consumes only for the printed movement-affecting Conditions',()=>{
 const b={conditions:['Unstoppable']};assert.equal(R.application(b,'Poisoned').allowed,true);assert.equal(R.has(b,'Unstoppable'),true);assert.equal(R.application(b,'Restrained').allowed,false);assert.equal(R.has(b,'Unstoppable'),false);
});
test('Sanctified ignores only a 6, with one actual roll per harmful application',()=>{
 for(let face=1;face<=6;face++){let calls=0;const b={conditions:['Sanctified']},out=R.application(b,'Burning',{random:()=>{calls++;return (face-0.5)/6}});assert.equal(out.allowed,face!==6);assert.equal(calls,1);assert.equal(R.has(b,'Sanctified'),true)}
});
test('speculative room application never rolls Sanctified before the server',()=>{
 let calls=0;const out=R.application({conditions:['Sanctified']},'Burning',{rollSanctified:false,random:()=>{calls++;return 0.99}});assert.equal(out.allowed,true);assert.equal(calls,0);
});
test('Armor penalties stack, clamp at zero and never consume Conditions during a preview',()=>{
 const b={conditions:['Vulnerable','Cracked Armor','Berserk']};assert.equal(R.armorValue(b,5),2);assert.equal(R.armorValue(b,1),0);assert.equal(R.armorValue(b,5),2);assert.equal(b.conditions.length,3);
});

for(const status of ['Frozen','Restrained'])test(status+' also blocks shared card-based movement before any spending',()=>{
 const H=require('../public/healing-summons-rules-33627.js');
 const g={round:1,phase:'Hero Phase',partyHeroes:['Elara','Thorne'],campaign:{},levels:{},equipped:{},heroRuntimeStates:{Elara:{x:0,y:0,hp:5,actions:3,conditions:[status],hand:[{id:'H003-016',uid:'move'}]},Thorne:{x:0,y:0,hp:5,conditions:[]}},tiles:{'0,0':{edges:{E:true},enemies:[]},'1,0':{edges:{W:true},enemies:[]}}},before=structuredClone(g);
 assert.ok(H.playCard(g,'Elara',{cardId:'H003-016',cardUid:'move',allyHero:'Thorne',healHero:'Thorne',tileKey:'1,0'}).error);assert.deepEqual(g,before);
});
