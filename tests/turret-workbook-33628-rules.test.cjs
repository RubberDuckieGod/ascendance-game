'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../public/healing-summons-rules-33627.js');
function game(){return {partyHeroes:['Mira','Aldric'],hero:{x:0,y:0},hp:5,conditions:[],equipped:{},phase:'Hero Phase',round:1,campaign:{currentQuest:'Q003'},heroRuntimeStates:{Mira:{x:0,y:0,hp:8,maxHp:9,actions:3,conditions:[],hand:[{id:'H010-009',uid:'deploy'}],discard:[],statusActivation33627:{start:'turn-one'}}},tiles:{'0,0':{enemies:[{id:'enemy',hp:7,armor:99}]},'1,0':{enemies:[{id:'far',hp:8}]}}}}
const deploy={cardId:'H010-009',cardUid:'deploy'};
test('Turret has 4 Health and 1 Armor, costs 2 Actions, and fires direct damage once per distinct Mira activation',()=>{
 const g=game(),out=R.playCard(g,'Mira',deploy),p=g.heroCreatedPieces3294[0];assert.equal(p.hp,4);assert.equal(p.maxHp,4);assert.equal(p.armor,1);assert.equal(g.heroRuntimeStates.Mira.actions,1);
 const args={pieceId:out.pieceId,enemyId:'enemy'};assert.equal(R.fireTurret(g,'Mira',args).damage,2);assert.equal(g.tiles['0,0'].enemies[0].hp,5);
 assert.ok(R.fireTurret(g,'Mira',args).error);g.heroRuntimeStates.Mira.statusActivation33627.start='extra-turn-same-round';assert.equal(R.fireTurret(g,'Mira',args).damage,2);assert.equal(g.tiles['0,0'].enemies[0].hp,3);
});
test('Turret rejects a second deployment, another owner and targets outside its stationary Location atomically',()=>{
 const g=game(),out=R.playCard(g,'Mira',deploy);g.heroRuntimeStates.Mira.hand.push({id:'H010-009',uid:'second'});g.heroRuntimeStates.Mira.actions=3;
 let before=JSON.stringify(g);assert.ok(R.playCard(g,'Mira',{cardId:'H010-009',cardUid:'second'}).error);assert.equal(JSON.stringify(g),before);
 assert.ok(R.fireTurret(g,'Aldric',{pieceId:out.pieceId,enemyId:'enemy'}).error);
 assert.ok(R.fireTurret(g,'Mira',{pieceId:out.pieceId,enemyId:'far'}).error);assert.equal(g.tiles['1,0'].enemies[0].hp,8);
 g.heroRuntimeStates.Mira.x=1;assert.equal(R.fireTurret(g,'Mira',{pieceId:out.pieceId,enemyId:'enemy'}).damage,2);
});
test('Emergency Repair restores exactly 2 Construct Health, caps maximum, and validates target before spending',()=>{
 const g=game();R.playCard(g,'Mira',deploy);const p=g.heroCreatedPieces3294[0],b=g.heroRuntimeStates.Mira;p.hp=1;b.hand=[{id:'H010-011',uid:'repair'}];b.actions=2;
 const before=JSON.stringify(g);assert.ok(R.playCard(g,'Mira',{cardId:'H010-011',cardUid:'repair',pieceId:'missing'}).error);assert.equal(JSON.stringify(g),before);
 assert.equal(R.playCard(g,'Mira',{cardId:'H010-011',cardUid:'repair',pieceId:p.id}).heal,2);assert.equal(p.hp,3);assert.equal(b.turret.hp,3);assert.equal(b.actions,1);
});
test('Emergency Repair also heals a chosen Hero without needing a Turret',()=>{
 const g=game(),b=g.heroRuntimeStates.Mira;b.hand=[{id:'H010-011',uid:'repair'}];assert.equal(R.playCard(g,'Mira',{cardId:'H010-011',cardUid:'repair',targetHero:'Aldric'}).heal,2);assert.equal(g.hp,7);
});
test('Turret encounter expiry and canonical snapshots preserve its removal and fired receipt',()=>{
 const g=game();g.activeEncounter320={token:'one'};const out=R.playCard(g,'Mira',deploy);R.fireTurret(g,'Mira',{pieceId:out.pieceId,enemyId:'enemy'});const stale=structuredClone(g);
 R.preserveCanonical(g,stale);assert.ok(R.fireTurret(stale,'Mira',{pieceId:out.pieceId,enemyId:'enemy'}).error);
 g.activeEncounter320=null;R.reconcile(g);R.preserveCanonical(g,stale);assert.equal(stale.heroCreatedPieces3294.filter(p=>p.type==='turret').length,0);assert.equal(stale.heroRuntimeStates.Mira.turret,undefined);
});

test('Master Engineer boosts Construct Health and damage until the next distinct Mira activation, including extra turns',()=>{
 const g=game(),b=g.heroRuntimeStates.Mira;R.playCard(g,'Mira',deploy);const p=g.heroCreatedPieces3294[0];
 g.campaign.levelRuntime3360={constructs:[{id:'grand',k:'0,0',hp:3,maxHp:8,armor:3}]};b.hand=[{id:'H010-019',uid:'master'}];b.actions=3;
 assert.equal(R.playCard(g,'Mira',{cardId:'H010-019',cardUid:'master'}).boosted,2);assert.equal(p.maxHp,6);assert.equal(p.hp,6);assert.equal(g.campaign.levelRuntime3360.constructs[0].hp,5);assert.equal(g.campaign.levelRuntime3360.constructs[0].maxHp,10);assert.equal(b.freeConsumable32526,true);assert.equal(g.freeConsumable32526,true);
 assert.equal(R.fireTurret(g,'Mira',{pieceId:p.id,enemyId:'enemy'}).damage,4);
 assert.equal(R.expireOnHeroStart(g,'Mira',{token:'turn-one'}).duplicate,true);assert.equal(p.maxHp,6);
 R.expireOnHeroStart(g,'Mira',{token:'extra-turn-same-round'});assert.equal(p.maxHp,4);assert.equal(p.hp,4);assert.equal(p.damageBonus33628,0);assert.equal(g.campaign.levelRuntime3360.constructs[0].maxHp,8);assert.equal(b.turret.damage,2);
});
