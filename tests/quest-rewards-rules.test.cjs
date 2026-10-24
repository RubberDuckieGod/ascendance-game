const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const rewards=require('../quest-rewards-rules-33622.js');

function game(qid='Q001',heroes=['Aldric','Lyra']){
 const g={round:2,phase:'Hero Phase',partyHeroes:heroes,hp:12,lyra:{hp:8},seraphine:{hp:11},extraHeroes:{Rowan:{hp:9}},gold:0,reputation:0,xp:{},levels:{},inventory:{},partyQuestItems:[],equipmentDecks:{Common:['EQ002','EQ003','EQ014'],Rare:['EQ004'],Legendary:[]},tiles:{},campaign:{currentQuest:qid,activeEvent:'WE-TEST',instanceId32537:'CAMPAIGN-A',day:1,history:[],questStatus:{[qid]:'Available'}}};
 for(const hero of heroes){g.xp[hero]=0;g.levels[hero]=1;g.inventory[hero]=[]}
 return g;
}
function completed(g){
 const proposed=structuredClone(g),c=proposed.campaign,qid=c.currentQuest;
 c.lastQuestOutcome={quest:qid,outcome:'Completed',day:c.day};
 c.history.push({event:c.activeEvent,quest:qid,outcome:'Completed',day:c.day,at:'2026-10-24T00:00:00Z'});
 c.day++;c.questStatus[qid]='Completed';
 if(qid==='Q001')c.q001={resolved:true,captainDefeated:true,captainSpawned:true,rescued:2,fires:0};
 return proposed;
}
function unchangedError(g,proposed){const before=structuredClone(g);assert.ok(rewards.awardTransition(g,proposed).error);assert.deepEqual(g,before)}

test('Q001 canonical completion pays the authored Gold, surviving-Hero XP, Reputation and one canonical Common Equipment',()=>{
 const g=game(),proposed=completed(g);proposed.gold=999999;proposed.xp.Aldric=999999;proposed.inventory.Aldric=[{key:'equipment:EQ068',kind:'equipment',id:'EQ068',qty:99}];
 const result=rewards.awardTransition(g,proposed,{actor:'Aldric',turnHero:'Aldric'});
 assert.equal(result.changed,true);assert.equal(g.gold,75);assert.deepEqual(g.xp,{Aldric:100,Lyra:100});assert.equal(g.reputation,1);
 assert.deepEqual(g.inventory.Aldric,[{key:'equipment:EQ002',kind:'equipment',id:'EQ002',qty:1}]);assert.deepEqual(g.inventory.Lyra,[]);assert.deepEqual(g.equipmentDecks.Common,['EQ003','EQ014']);
 assert.equal(result.receipt.key,'CAMPAIGN-A|WE-TEST|Q001|1|Completed');assert.deepEqual(result.unavailableEquipment,[]);
});

test('Q001 scales only base Gold by party size and keeps the all-four-villager bonus fixed',()=>{
 for(const [heroes,gold]of [[['Aldric'],70],[['Aldric','Lyra'],90],[['Aldric','Lyra','Rowan'],110],[['Aldric','Lyra','Rowan','Seraphine'],130]]){
  const g=game('Q001',heroes),proposed=completed(g);proposed.campaign.q001.rescued=4;
  const result=rewards.awardTransition(g,proposed);assert.equal(g.gold,gold);assert.equal(result.receipt.equipment.length,1);
 }
});

test('Downed Heroes do not gain XP and the first surviving Hero receives party Equipment',()=>{
 const g=game();g.hp=0;const result=rewards.awardTransition(g,completed(g));
 assert.deepEqual(g.xp,{Aldric:0,Lyra:100});assert.equal(result.receipt.equipment[0].hero,'Lyra');assert.deepEqual(g.inventory.Aldric,[]);
});

test('Receipt replays and save/load reconnects never duplicate payouts or canonical deck draws',()=>{
 const g=game(),proposed=completed(g);rewards.awardTransition(g,proposed);
 const before=structuredClone(g);assert.equal(rewards.awardTransition(g,proposed).duplicate,true);assert.deepEqual(g,before);
 const restored=JSON.parse(JSON.stringify(g));assert.equal(rewards.awardTransition(restored,proposed).duplicate,true);assert.deepEqual(restored,before);
});

test('Quest identity, instance, day, status, roster and attempt history must match without mutation on rejection',()=>{
 for(const configure of [p=>{p.campaign.currentQuest='Q002'},p=>{p.campaign.instanceId32537='OTHER'},p=>{p.campaign.lastQuestOutcome.day=2},p=>{p.campaign.questStatus.Q001='Available'},p=>{p.partyHeroes=['Aldric']},p=>{p.campaign.history=[]},p=>{p.campaign.history[0].event='OTHER'},p=>{p.campaign.history.push(structuredClone(p.campaign.history[0]))}]){
  const g=game(),proposed=completed(g);configure(proposed);unchangedError(g,proposed);
 }
 const g=game(),p=completed(g),before=structuredClone(g);assert.ok(rewards.awardTransition(g,p,{actor:'Lyra',turnHero:'Aldric'}).error);assert.deepEqual(g,before);
});

test('Q001 requires objective evidence and refuses a Captain still alive in canonical combat state',()=>{
 for(const configure of [p=>{p.campaign.q001.rescued=1},p=>{p.campaign.q001.fires=5},p=>{delete p.campaign.q001.fires},p=>{p.campaign.q001.captainDefeated=false},p=>{p.campaign.q001.resolved=false}]){
  const g=game(),p=completed(g);configure(p);unchangedError(g,p);
 }
 const g=game();g.tiles['0,0']={enemies:[{enemyId:'E006',name:'Goblin Captain',hp:1}]};unchangedError(g,completed(g));
});

test('Failures and unrelated snapshots never create reward receipts',()=>{
 const g=game(),failed=completed(g);failed.campaign.lastQuestOutcome.outcome='Failed';const before=structuredClone(g);
 assert.equal(rewards.awardTransition(g,failed).ignored,true);assert.deepEqual(g,before);
 assert.equal(rewards.awardTransition(g,structuredClone(g)).ignored,true);assert.deepEqual(g,before);
});

test('A last-day completion may advance to the authored next World Event without losing the old Quest reward scope',()=>{
 const g=game();g.campaign.activeEvent='WE001';g.campaign.day=5;
 const p=completed(g);p.campaign.activeEvent='WE002';p.campaign.currentQuest='Q004';p.campaign.day=1;
 const result=rewards.awardTransition(g,p);
 assert.equal(result.changed,true);assert.equal(result.receipt.quest,'Q001');assert.equal(result.receipt.event,'WE001');assert.equal(result.receipt.day,5);assert.equal(g.gold,75);
});

test('Day-limit advancement rejects early, wrong-event, wrong-Quest, and wrong-day transitions atomically',()=>{
 for(const invalid of ['early','event','quest','day']){
  const g=game();g.campaign.activeEvent='WE001';g.campaign.day=invalid==='early'?4:5;
  const p=completed(g);p.campaign.activeEvent=invalid==='event'?'WE003':'WE002';p.campaign.currentQuest=invalid==='quest'?'Q005':'Q004';p.campaign.day=invalid==='day'?2:1;
  unchangedError(g,p);
 }
});

test('Canonical receipts and owed Equipment survive attempted stale-patch erasure and status reset',()=>{
 const g=game();g.equipmentDecks.Common=[];rewards.awardTransition(g,completed(g));
 const stale=completed(game());stale.campaign.questRewardReceipts33622={forged:{quest:'Q099'}};stale.campaign.questRewardEquipmentOwed33622=[];stale.campaign.questStatus.Q001='Available';
 rewards.preserve(g,stale);assert.deepEqual(stale.campaign.questRewardReceipts33622,g.campaign.questRewardReceipts33622);assert.deepEqual(stale.campaign.questRewardEquipmentOwed33622,g.campaign.questRewardEquipmentOwed33622);assert.equal(stale.campaign.questStatus.Q001,'Completed');
});

test('Empty Equipment decks create a durable owed reward while Gold/XP pay once',()=>{
 const g=game();g.equipmentDecks.Common=[];const proposed=completed(g),result=rewards.awardTransition(g,proposed);
 assert.equal(g.gold,75);assert.equal(result.receipt.equipment.length,0);assert.equal(result.unavailableEquipment.length,1);assert.equal(g.campaign.questRewardEquipmentOwed33622[0].rarity,'Common');
 const before=structuredClone(g);assert.equal(rewards.awardTransition(g,proposed).duplicate,true);assert.deepEqual(g,before);
});

test('Actual authored Q010/Q012 rewards exist despite their missing legacy payout branches',()=>{
 const g=game('Q010');g.equipmentDecks.Epic=[Object.keys(rewards.equipmentCatalog).find(id=>rewards.equipmentCatalog[id].rarity==='Epic')];
 rewards.awardTransition(g,completed(g));assert.equal(g.gold,200);assert.equal(g.xp.Aldric,225);assert.equal(g.levels.Aldric,2);assert.equal(g.inventory.Aldric.length,1);
 const final=game('Q012');final.equipmentDecks.Legendary=Object.keys(rewards.equipmentCatalog).filter(id=>rewards.equipmentCatalog[id].rarity==='Legendary').slice(0,2);
 const result=rewards.awardTransition(final,completed(final));assert.equal(final.gold,0);assert.equal(final.xp.Lyra,300);assert.equal(final.reputation,3);assert.equal(result.receipt.equipment.length,2);
});

test('General and named faction Reputation use authored values once, including conditional survivor rewards',()=>{
 const g=game('Q014');rewards.awardTransition(g,completed(g));assert.equal(g.reputation,1);
 const named=game('Q015');rewards.awardTransition(named,completed(named));assert.equal(named.campaign.factionReputation3342.crownWatch,1);assert.ok(named.partyQuestItems.includes('LT162'));
 for(const rescued of [false,true]){const conditional=game('Q026'),p=completed(conditional);p.campaign.c34Quest={flags:{optional:{survivor:rescued}}};rewards.awardTransition(conditional,p);assert.equal(conditional.campaign.factionReputation3342.deepdelver||0,Number(rescued))}
});

test('Campaign party Equipment counts follow authored scaling and AnyParty cannot inject a client choice',()=>{
 const g=game('Q013',['Aldric','Lyra','Rowan']),p=completed(g);p.inventory.Aldric=[{id:'EQ068',kind:'equipment',qty:1}];
 const result=rewards.awardTransition(g,p,{random:()=>0});assert.equal(result.receipt.equipment.length,2);assert.deepEqual(result.receipt.equipment.map(row=>row.hero),['Aldric','Lyra']);assert.deepEqual(result.receipt.equipment.map(row=>row.id),['EQ002','EQ003']);
});

test('Unknown canonical Equipment and failed random selection roll back the entire reward transaction',()=>{
 const g=game();g.equipmentDecks.Common=['EQ-UNKNOWN'];unchangedError(g,completed(g));
 const random=game('Q013'),before=structuredClone(random);assert.ok(rewards.awardTransition(random,completed(random),{random:()=>1}).error);assert.deepEqual(random,before);
});

test('Trusted phase results adopt a receipt without paying their already committed resources again',()=>{
 const before=game(),resolved=completed(before);resolved.gold=75;resolved.xp={Aldric:100,Lyra:100};resolved.reputation=1;
 const resources={gold:resolved.gold,xp:structuredClone(resolved.xp),inventory:structuredClone(resolved.inventory)};
 const result=rewards.adoptPhaseResult(before,resolved,{actor:'Aldric'});assert.equal(result.adopted,true);assert.equal(result.receipt.source,'phase-result');
 assert.equal(resolved.gold,resources.gold);assert.deepEqual(resolved.xp,resources.xp);assert.deepEqual(resolved.inventory,resources.inventory);
 const snapshot=structuredClone(resolved);assert.equal(rewards.awardTransition(resolved,completed(resolved)).duplicate,true);assert.deepEqual(resolved,snapshot);
});

test('Canonical phase rewards use the post-resolution survivors for XP and Equipment recipients',()=>{
 const before=game(),resolved=completed(before);resolved.hp=0;
 const result=rewards.awardTransition(before,resolved,{phaseResult:true,survivorGame:resolved});
 assert.deepEqual(result.receipt.xpByHero,{Lyra:100});assert.equal(before.xp.Aldric,0);assert.equal(before.xp.Lyra,100);assert.equal(result.receipt.equipment[0].hero,'Lyra');
});

test('Adopting a phase completion retains only the existing canonical owed Equipment budget',()=>{
 const before=game('Q002'),owed={quest:'Q001',receipt:'EARLIER-RECEIPT',hero:'Aldric',rarity:'Common',count:1};
 before.campaign.questRewardEquipmentOwed33622=[owed];
 const resolved=completed(before);resolved.campaign.questRewardEquipmentOwed33622=[{quest:'Q999',hero:'Lyra',rarity:'Mythic',count:99}];
 const result=rewards.adoptPhaseResult(before,resolved,{actor:'Aldric'});
 assert.equal(result.adopted,true);assert.deepEqual(resolved.campaign.questRewardEquipmentOwed33622,[owed]);
 resolved.campaign.questRewardEquipmentOwed33622[0].count=2;
 assert.equal(before.campaign.questRewardEquipmentOwed33622[0].count,1);
 const missing=completed(before);delete missing.campaign.questRewardEquipmentOwed33622;
 rewards.adoptPhaseResult(before,missing,{actor:'Aldric'});assert.deepEqual(missing.campaign.questRewardEquipmentOwed33622,[owed]);
});

test('Mythic requests remain explicitly owed when the room lacks that deck; no rarity fallback is invented',()=>{
 const g=game('Q060');g.equipmentDecks.Legendary=Object.keys(rewards.equipmentCatalog).filter(id=>rewards.equipmentCatalog[id].rarity==='Legendary').slice(0,2);
 const untouched=structuredClone(g.equipmentDecks.Legendary),result=rewards.awardTransition(g,completed(g));
 assert.equal(g.xp.Aldric,450);assert.equal(g.reputation,3);assert.deepEqual(g.equipmentDecks.Legendary,untouched);assert.equal(result.unavailableEquipment.length,2);assert.ok(result.unavailableEquipment.every(row=>row.rarity==='Mythic'));
});

test('Static reward catalog enumerates all 72 authored Quest numbers and mirrors the browser module',()=>{
 assert.deepEqual(rewards.questIds,Array.from({length:72},(_,i)=>'Q'+String(i+1).padStart(3,'0')));
 for(const [file,name]of [['campaign2-3330.js','C2_REWARDS'],['campaign34-3340.js','C34_REWARDS'],['campaign56-3350.js','C56_REWARDS']]){
  const source=fs.readFileSync(path.join(__dirname,'../public',file),'utf8'),table=JSON.parse(source.match(new RegExp('const '+name+'=(\\{.*?\\});'))[1]);
  for(const [id,row]of Object.entries(table)){const expected=Array.isArray(row)?row:[row.xp,row.gold,row.equip||null,row.item||null],actual=rewards.spec(id);assert.equal(actual.xp,expected[0]);assert.equal(actual.gold,expected[1]);assert.equal(actual.equip,expected[2]);assert.equal(actual.item,expected[3])}
 }
 assert.equal(fs.readFileSync(path.join(__dirname,'../quest-rewards-rules-33622.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../public/quest-rewards-rules-33622.js'),'utf8'));
});
