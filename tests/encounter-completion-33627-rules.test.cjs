'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../encounter-completion-rules-33627.js');

function game(){return {round:3,partyHeroes:['Aldric'],gold:37,reputation:0,xp:{Aldric:500},inventory:{Aldric:[]},lootDeck:['LT001'],lootDiscard:[],campaign:{instanceId32537:'ISOLATED-ENCOUNTER-CLOSE',currentQuest:'Q003',day:1},questTransitionAuthority33626:{epoch:2},activeEncounter320:{token:'ENC-ONE',id:'EN008',reward:'15 Gold and 1 Reputation'},tiles:{'0,0':{id:'L000',enemies:[{roomEnemyId3301:'room-enc-one',encounterToken:'ENC-ONE',hp:2},{roomEnemyId3301:'room-unrelated',encounterToken:'OTHER',hp:4}]}}}}
const lethal=(id='room-enc-one')=>({enemyId:id,hpBefore:2,hpAfter:0,removed:true});
function remove(g,id='room-enc-one'){for(const tile of Object.values(g.tiles))tile.enemies=tile.enemies.filter(enemy=>enemy.roomEnemyId3301!==id)}
function close(g){const before=R.capture(g);remove(g);return R.closeDefeated(g,before,{actor:'Aldric',commandId:'ACTUAL-ATTACK',applied:[lethal()]})}

test('capture records only living canonical IDs for the actual active Encounter token',()=>{
 const g=game();g.tiles['1,0']={enemies:[{roomEnemyId3301:'room-dead',encounterToken:'ENC-ONE',hp:0}]};
 assert.deepEqual(R.capture(g),{scope:{instance:'ISOLATED-ENCOUNTER-CLOSE',quest:'Q003',epoch:2},token:'ENC-ONE',id:'EN008',aliveCount:1,enemyIds:['room-enc-one']});assert.equal(R.capture({...g,activeEncounter320:null}),null);
});
test('a verified final Combat defeat closes the canonical Encounter without awarding or changing any resources',()=>{
 const g=game(),before=R.capture(g);remove(g);const expected=structuredClone(g),result=R.closeDefeated(g,before,{actor:'Aldric',commandId:'ATTACK-1',applied:[lethal()]});
 assert.equal(result.closed,true);assert.equal(g.activeEncounter320,null);assert.equal(g.encounterCompletionAuthority33627.closed['ENC-ONE'].commandId,'ATTACK-1');
 const actual=structuredClone(g);delete actual.encounterCompletionAuthority33627;actual.activeEncounter320=expected.activeEncounter320;assert.deepEqual(actual,expected,'Gold, Reputation, XP, items and decks remain entirely outside this closing operation');
 assert.equal(g.tiles['0,0'].enemies[0].roomEnemyId3301,'room-unrelated');
});
test('unrelated, nonlethal, missing or unvalidated removal evidence cannot close the Encounter',()=>{
 const invalid=[[],[lethal('room-unrelated')],[{...lethal(),hpBefore:0}],[{...lethal(),hpAfter:1}],[{...lethal(),removed:false}],[{enemyId:'room-enc-one',removed:true}]];
 for(const applied of invalid){const g=game(),before=R.capture(g);remove(g);const expected=structuredClone(g);assert.equal(R.closeDefeated(g,before,{applied}).closed,false);assert.deepEqual(g,expected)}
});
test('one valid removal cannot close a token group while another matching enemy remains alive',()=>{
 const g=game();g.tiles['1,0']={enemies:[{roomEnemyId3301:'room-enc-two',encounterToken:'ENC-ONE',hp:3}]};const before=R.capture(g);remove(g);const expected=structuredClone(g);
 assert.equal(R.closeDefeated(g,before,{applied:[lethal()]}).closed,false);assert.deepEqual(g,expected);
});
test('an empty or already dead token group cannot acquire a fabricated completion tombstone',()=>{
 const g=game();g.tiles['0,0'].enemies[0].hp=0;const before=R.capture(g),expected=structuredClone(g);
 assert.equal(before.aliveCount,0);assert.equal(R.closeDefeated(g,before,{applied:[lethal()]}).closed,false);assert.deepEqual(g,expected);
});
test('a changed active token, Encounter ID or Quest epoch cannot be closed using an older capture',()=>{
 for(const mutate of [g=>g.activeEncounter320.token='NEW-TOKEN',g=>g.activeEncounter320.id='EN019',g=>g.questTransitionAuthority33626.epoch++,g=>g.campaign.currentQuest='Q004',g=>g.campaign.instanceId32537='OTHER']){
  const g=game(),before=R.capture(g);remove(g);mutate(g);const expected=structuredClone(g);assert.equal(R.closeDefeated(g,before,{applied:[lethal()]}).closed,false);assert.deepEqual(g,expected);
 }
});
test('an accepted stale snapshot cannot resurrect the exact closed Encounter token or erase its receipt',()=>{
 const old=game(),stale=structuredClone(old);assert.equal(close(old).closed,true);delete stale.encounterCompletionAuthority33627;const resources={gold:stale.gold,reputation:stale.reputation,inventory:structuredClone(stale.inventory)};
 R.preserve(old,stale);assert.equal(stale.activeEncounter320,null);assert.deepEqual(stale.encounterCompletionAuthority33627,old.encounterCompletionAuthority33627);assert.deepEqual({gold:stale.gold,reputation:stale.reputation,inventory:stale.inventory},resources);
 const next=structuredClone(stale);next.activeEncounter320=game().activeEncounter320;next.encounterCompletionAuthority33627.closed={};R.preserve(stale,next);assert.equal(next.activeEncounter320,null);assert.deepEqual(R.metadata(next),R.metadata(old));
});
test('a genuinely different Encounter token remains allowed while canonical closed receipts survive',()=>{
 const old=game();close(old);const next=structuredClone(old);next.activeEncounter320={token:'ENC-TWO',id:'EN019'};next.encounterCompletionAuthority33627={scope:R.scope(old),closed:{forged:{}}};
 R.preserve(old,next);assert.deepEqual(next.activeEncounter320,{token:'ENC-TWO',id:'EN019'});assert.deepEqual(R.metadata(next),R.metadata(old));assert.equal(next.encounterCompletionAuthority33627.closed.forged,undefined);
});
test('completion Day advancement retains the tombstone within the same campaign, Quest and epoch',()=>{
 const old=game();close(old);const next=structuredClone(old);next.campaign.day++;next.campaign.questStatus={Q003:'Completed'};next.activeEncounter320=game().activeEncounter320;
 R.preserve(old,next);assert.equal(next.activeEncounter320,null);assert.deepEqual(R.metadata(next),R.metadata(old));
});
test('fresh failed attempts and real campaign, Quest or epoch changes cannot inherit old token tombstones',()=>{
 for(const mutate of [g=>{},g=>g.campaign.instanceId32537='OTHER',g=>g.campaign.currentQuest='Q004',g=>g.questTransitionAuthority33626.epoch++]){
  const old=game();close(old);const next=structuredClone(old);next.activeEncounter320=game().activeEncounter320;mutate(next);const changed=JSON.stringify(R.scope(old))!==JSON.stringify(R.scope(next));
  R.preserve(old,next,{freshAttempt:!changed});assert.equal(next.encounterCompletionAuthority33627,undefined);assert.deepEqual(next.activeEncounter320,game().activeEncounter320);
 }
});
test('incoming completion metadata cannot forge server-owned tombstones when none exists canonically',()=>{
 const old=game(),next=structuredClone(old);next.encounterCompletionAuthority33627={version:'3.36.27',scope:R.scope(old),closed:{'ENC-ONE':{id:'EN008'}}};R.preserve(old,next);assert.equal(next.encounterCompletionAuthority33627,undefined);assert.deepEqual(next.activeEncounter320,old.activeEncounter320);
});
test('unusual token names remain data properties and round-trip safely through persistence',()=>{
 const g=game();g.activeEncounter320.token='__proto__';g.tiles['0,0'].enemies[0].encounterToken='__proto__';const before=R.capture(g);remove(g);assert.equal(R.closeDefeated(g,before,{applied:[lethal()]}).closed,true);
 const saved=JSON.parse(JSON.stringify(g));assert.equal(Object.prototype.hasOwnProperty.call(saved.encounterCompletionAuthority33627.closed,'__proto__'),true);const stale=structuredClone(saved);stale.activeEncounter320={token:'__proto__',id:'EN008'};R.preserve(saved,stale);assert.equal(stale.activeEncounter320,null);
});
