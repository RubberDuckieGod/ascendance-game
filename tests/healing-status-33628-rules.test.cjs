const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('../public/status-rules-33627.js'),M=require('../public/mechanics-rules-33621.js'),H=require('../public/healing-summons-rules-33627.js');
test('Diseased and Scorched reduce a recovery before the Health cap, then Scorched is consumed once',()=>{
 const b={hp:8,maxHp:10,conditions:['Diseased','Scorched']};assert.equal(S.withRecovery(b,()=>S.recoveryAmount(b,4,{capacity:2})),2);assert.equal(S.has(b,'Scorched'),false);assert.equal(S.has(b,'Diseased'),true);assert.equal(S.recoveryAmount(b,3,{capacity:2}),2);
});
test('Withered caps the entire recovery effect including a second Equipment healing rider',()=>{
 const b={conditions:[{name:'Withered'}]};const amounts=S.withRecovery(b,()=>[S.recoveryAmount(b,3,{capacity:9}),S.recoveryAmount(b,2,{capacity:8})]);assert.deepEqual(amounts,[1,0]);assert.equal(S.withRecovery(b,()=>S.recoveryAmount(b,3,{capacity:9})),1);
});
test('full Health, zero recovery and healing prohibition never consume Scorched',()=>{
 const b={conditions:['Scorched']};assert.equal(S.recoveryAmount(b,3,{capacity:0}),0);assert.equal(S.recoveryAmount(b,0,{capacity:3}),0);b.noHealUntilTurnEnd=true;assert.equal(S.recoveryAmount(b,3,{capacity:3}),0);assert.equal(S.has(b,'Scorched'),true);
});
test('actual Regenerating recovery consumes healing modifiers and respects Withered',()=>{
 for(const [conditions,expected]of [[['Regenerating','Diseased'],5],[['Regenerating','Scorched'],5],[['Regenerating','Withered'],6]]){
  const g={round:1,partyHeroes:['Elara'],heroRuntimeStates:{Elara:{hp:5,maxHp:10,conditions}},equipped:{},campaign:{},tiles:{}};S.heroStart(g,'Elara',{token:'one'});assert.equal(g.heroRuntimeStates.Elara.hp,expected);
 }
});
test('shared card healing caps Staff of Renewal plus its initial recovery to one effect while Withered',()=>{
 const g={round:1,partyHeroes:['Elara','Thorne'],phase:'Hero Phase',heroRuntimeStates:{Elara:{x:0,y:0,hp:5,maxHp:10,conditions:[]},Thorne:{x:0,y:0,hp:1,maxHp:9,conditions:['Withered']}},equipped:{Elara:{Weapon:'EQ065'}},levels:{},campaign:{},tiles:{'0,0':{}}};assert.equal(H.heal(g,'Thorne',3,{},'Elara'),1);assert.equal(g.heroRuntimeStates.Thorne.hp,2);
});
test('Rest uses named Prepared/Regrouped and does not resurrect consumed Scorched',()=>{
 const g={round:1,phase:'Hero Phase',partyHeroes:['Elara'],campaign:{},heroRuntimeStates:{Elara:{x:0,y:0,hp:1,maxHp:10,actions:3,conditions:[{name:'Prepared'},{name:'Regrouped'},'Scorched']}},equipped:{},inventory:{Elara:[]},tiles:{'0,0':{enemies:[]}}};
 const out=M.action(g,'Elara','REST');assert.equal(out.error,undefined);assert.equal(out.cost,0);assert.equal(out.draw,1);assert.equal(out.heal,2);assert.equal(g.heroRuntimeStates.Elara.actions,3);assert.deepEqual(g.heroRuntimeStates.Elara.conditions,[]);
});
