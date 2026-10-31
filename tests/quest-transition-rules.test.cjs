'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const rules=require('../quest-transition-rules-33626.js');
const clone=v=>structuredClone(v);
function fixture(){
 const before={partyHeroes:['Rowan','Garruk'],round:10,phase:'Hero Phase',gold:75,reputation:3,xp:{Rowan:250,Garruk:175},levels:{Rowan:3,Garruk:2},inventory:{Rowan:[{id:'LT001',key:'loot:LT001',kind:'loot',qty:1}],Garruk:[]},equipped:{Rowan:{Weapon:'EQ999',Accessory:[]},Garruk:{Weapon:'EQ130',Armor:'EQ137',Accessory:['EQ140']}},partyQuestItems:['LT030'],lootDeck:['LT001'],lootDiscard:[],equipmentDecks:{Common:['EQ003']},heroKills3259:{Rowan:9,Garruk:8},heroRuntimeStates:{Rowan:{hp:0,actions:0,x:2,y:1,conditions:[]},Garruk:{hp:4,actions:0,x:1,y:0,conditions:[]}},campaign:{currentQuest:'Q001',activeEvent:'WE001',day:2,instanceId32537:'TEST-CAMPAIGN',downtime:true,questStatus:{Q001:'Completed',Q002:'Available'},history:[{quest:'Q001',outcome:'Completed'}],lastQuestOutcome:{quest:'Q001',outcome:'Completed'},heroFates:{Rowan:{status:'Lost'},Garruk:{status:'Active'}},q001:{resolved:true,captainDefeated:true}}};
 const next=clone(before);Object.assign(next,rules.canonicalResources(before,'Q002').values);next.round=1;next.tiles={'0,0':{id:'L000',name:'Stonebrook',enemies:[]}};next.pool=[{id:'L001'},{id:'L004'}];next.campaign.currentQuest='Q002';next.campaign.downtime=false;next.campaign.q002={resolved:false,wagons:[]};
 for(const [h,st]of Object.entries(next.heroRuntimeStates)){st.x=0;st.y=0;st.hp=rules.starting(h).maxHp;st.actions=3}
 return {before,state:{game:next,pending:{pEnc:{card:{id:'EN004'}}}},cmd:{id:'TEST-NEXT-QUEST',fromQuest:'Q001',quest:'Q002',baseRevision:10}};
}
test('Lost runtime Hero restarts at Level1 with authored gear/potion; survivor progression and resources stay canonical',()=>{
 const {before,state,cmd}=fixture(),original=clone(before),result=rules.validate(before,state,cmd);assert.equal(result.error,undefined);const g=result.state.game;
 assert.deepEqual(before,original);assert.equal(g.round,1);assert.deepEqual(Object.keys(g.tiles),['0,0']);assert.equal(g.heroRuntimeStates.Rowan.hp,9);assert.equal(g.heroRuntimeStates.Garruk.hp,12);assert.equal(g.heroRuntimeStates.Rowan.actions,0);assert.equal(g.heroRuntimeStates.Garruk.actions,0);
 assert.equal(g.levels.Rowan,1);assert.equal(g.xp.Rowan,0);assert.equal(g.levels.Garruk,2);assert.equal(g.xp.Garruk,175);assert.equal(g.gold,75);assert.equal(g.reputation,3);assert.deepEqual(g.inventory.Rowan,[{key:'loot:LT002',kind:'loot',id:'LT002',qty:1}]);assert.deepEqual(g.inventory.Garruk,[]);assert.equal(g.equipped.Rowan.Weapon,'EQ045');assert.equal(g.campaign.heroFates.Rowan.status,'Replacement');assert.equal(g.campaign.heroFates.Rowan.quest,'Q002');assert.equal(result.state.pending.pEnc,null);
});
test('authored full Health setup keeps survivor EQ097 maximum without inventing a new Potion',()=>{
 const {before,state,cmd}=fixture();before.equipped.Garruk.Accessory=['EQ097'];state.game.equipped.Garruk.Accessory=['EQ097'];state.game.heroRuntimeStates.Garruk.maxHp=999;
 const g=rules.validate(before,state,cmd).state.game;assert.equal(g.heroRuntimeStates.Garruk.hp,14);assert.equal(g.heroRuntimeStates.Garruk.maxHp,12);assert.deepEqual(g.inventory.Garruk,[]);
});
test('starting a Quest cannot mint Gold/Reputation/progression/items/gear or consume persistent decks',()=>{
 for(const change of [g=>g.gold++,g=>g.reputation++,g=>g.xp.Garruk++,g=>g.levels.Garruk++,g=>g.inventory.Garruk.push({key:'loot:LT002',id:'LT002',kind:'loot',qty:1}),g=>g.equipped.Garruk.Weapon='EQ001',g=>g.partyQuestItems.push('LT031'),g=>g.lootDeck.pop(),g=>g.equipmentDecks.Common.pop()]){const {before,state,cmd}=fixture();change(state.game);assert.match(rules.validate(before,state,cmd).error,/cannot change campaign/)}
});
test('campaign identity, quest availability, party, board and setup phase are validated before mutation',()=>{
 for(const change of [g=>g.campaign.instanceId32537='OTHER',g=>g.campaign.activeEvent='WE002',g=>g.campaign.day++,g=>g.partyHeroes.push('Aldric'),g=>g.round=10,g=>g.phase='Enemy Phase',g=>g.tiles['1,0']={id:'L004'},g=>g.tiles['0,0'].enemies.push({hp:1}),g=>g.pool.push({id:'L001'})]){const {before,state,cmd}=fixture();change(state.game);assert.ok(rules.validate(before,state,cmd).error)}
 const {before,state,cmd}=fixture();before.campaign.questStatus.Q002='Completed';assert.ok(rules.validate(before,state,cmd).error);before.campaign.questStatus.Q002='Available';cmd.fromQuest='Q003';assert.ok(rules.validate(before,state,cmd).error);
});
test('new Quest cannot forge completion history/reward receipts or change previous quest objectives',()=>{
 for(const field of ['history','questStatus','lastQuestOutcome','questRewardReceipts33622','questRewardEquipmentOwed33622','factionReputation3342']){const {before,state,cmd}=fixture();state.game.campaign[field]={forged:true};assert.ok(rules.validate(before,state,cmd).error)}
 const {before,state,cmd}=fixture();state.game.campaign.q001={resolved:false,captainDefeated:false};const result=rules.validate(before,state,cmd);assert.deepEqual(result.state.game.campaign.q001,before.campaign.q001);
});
test('all16 authored starting loadouts are independent values and HP cannot be client-inflated',()=>{
 const names=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
 for(const hero of names){const spec=rules.starting(hero);assert.ok(spec.maxHp>0);spec.equipment.Accessory.push('FORGED');assert.ok(!rules.starting(hero).equipment.Accessory.includes('FORGED'));assert.equal(rules.maxHealth({equipped:{}},hero),spec.maxHp)}
});
test('prototype keys and excessive depth are refused and browser mirror is byte-identical',()=>{
 const {before,state,cmd}=fixture();state.game.bad=JSON.parse('{"__proto__":{"admin":true}}');assert.ok(rules.validate(before,state,cmd).error);delete state.game.bad;let nested=state.game;for(let i=0;i<65;i++)nested=nested.deep={};assert.match(rules.validate(before,state,cmd).error,/Unsafe/);assert.equal(fs.readFileSync('quest-transition-rules-33626.js','utf8'),fs.readFileSync('public/quest-transition-rules-33626.js','utf8'));
});

test('new Quest clears scoped cooldown stamps and permits only authored completed World Event advances',()=>{
 const {before,state,cmd}=fixture();before.campaign.levelRuntime3360={quest:'Q001',hero:{Garruk:{round:{bloodrage:10},used:{old:true}}}};state.game.campaign.levelRuntime3360=clone(before.campaign.levelRuntime3360);const g=rules.validate(before,state,cmd).state.game;assert.deepEqual(g.campaign.levelRuntime3360,{quest:'Q002',hero:{},groupDamage:{},round:0,roundStart:{}});
 before.campaign.questStatus.Q002='Completed';const advanced=clone(before);advanced.campaign.activeEvent='WE002';advanced.campaign.currentQuest='Q004';advanced.campaign.day=1;const spec=id=>({type:id==='Q003'?'Optional':'Main'});assert.equal(rules.worldEventAdvance(before,advanced,spec),true);before.campaign.questStatus.Q002='Available';assert.equal(rules.worldEventAdvance(before,advanced,spec),false);
});

test('Aldric Battle Ready is derived after persistent level restoration and old harmful statuses are removed',()=>{
 const {before,state,cmd}=fixture();before.partyHeroes.push('Aldric');state.game.partyHeroes.push('Aldric');before.hp=2;before.xp.Aldric=100;before.levels.Aldric=2;before.inventory.Aldric=[];before.equipped.Aldric=rules.starting('Aldric').equipment;state.game.xp.Aldric=100;state.game.levels.Aldric=2;state.game.inventory.Aldric=[];state.game.equipped.Aldric=rules.starting('Aldric').equipment;state.game.hero={x:0,y:0};state.game.hp=14;state.game.conditions=['Poisoned'];const g=rules.validate(before,state,cmd).state.game;assert.deepEqual(g.conditions,['Guarded']);assert.equal(g.hp,14);assert.equal(g.actions,0);
});

test('browser empty faction-map normalization is allowed but nonzero faction changes are refused',()=>{
 const {before,state,cmd}=fixture();state.game.campaign.factionReputation3342={};assert.equal(rules.validate(before,state,cmd).error,undefined);state.game.campaign.factionReputation3342={stonebrook:1};assert.ok(rules.validate(before,state,cmd).error);
});

test('LT149 grants one canonical Ascendance Token, including repeated preparation, with its existing receipt',()=>{
 const {before,state,cmd}=fixture();before.inventory.Garruk=[{kind:'loot',id:'LT149',qty:2}];state.game.inventory.Garruk=clone(before.inventory.Garruk);before.campaign.usesAscendanceTokens=true;before.campaign.ascendanceTokens=7;state.game.campaign.ascendanceTokens=999;
 const first=rules.validate(before,state,cmd);assert.equal(first.error,undefined);assert.equal(first.state.game.campaign.ascendanceTokens,8);assert.equal(first.state.game.relicShardQuest33612['Q002:2:0'],true);
 const second=rules.validate(before,first.state,cmd);assert.equal(second.state.game.campaign.ascendanceTokens,8);
 before.relicShardQuest33612={'Q002:2:0':true};const used=rules.validate(before,state,cmd);assert.equal(used.state.game.campaign.ascendanceTokens,7);
});

test('LT149 requires retained party loot ownership and never grants both the card and Token alternatives',()=>{
 for(const source of ['none','Lost','zero','not-loot']){
  const {before,state,cmd}=fixture();before.campaign.usesAscendanceTokens=true;before.campaign.ascendanceTokens=7;
  if(source==='Lost')before.inventory.Rowan=[{kind:'loot',id:'LT149',qty:1}];
  if(source==='zero')before.inventory.Garruk=[{kind:'loot',id:'LT149',qty:0}];
  if(source==='not-loot')before.inventory.Garruk=[{kind:'equipment',id:'LT149',qty:1}];
  state.game.inventory=clone(rules.canonicalResources(before,cmd.quest).values.inventory);const out=rules.validate(before,state,cmd);assert.equal(out.error,undefined);assert.equal(out.state.game.campaign.ascendanceTokens,7,source);assert.equal(out.state.game.relicShardQuest33612,undefined,source);
 }
 const {before,state,cmd}=fixture();before.inventory.Garruk=[{kind:'loot',id:'LT149',qty:1}];state.game.inventory.Garruk=clone(before.inventory.Garruk);before.campaign.usesAscendanceTokens=false;before.campaign.ascendanceTokens=7;state.game.heroRuntimeStates.Garruk.hand=['a','b','c','d','e','existing-shard-card'];
 const out=rules.validate(before,state,cmd).state.game;assert.equal(out.campaign.ascendanceTokens,7);assert.deepEqual(out.heroRuntimeStates.Garruk.hand,state.game.heroRuntimeStates.Garruk.hand);assert.equal(out.relicShardQuest33612['Q002:2:0'],true);
});

function regionalFixture(quest){
 const f=fixture(),previous='Q'+String(Number(quest.slice(1))-1).padStart(3,'0'),event='WE'+String(Math.floor((Number(quest.slice(1))-1)/3)+1).padStart(3,'0');
 f.before.campaign.currentQuest=previous;f.before.campaign.activeEvent=event;f.before.campaign.questStatus={[previous]:'Completed',[quest]:'Available'};f.state.game.campaign=clone(f.before.campaign);f.state.game.campaign.currentQuest=quest;f.state.game.campaign.downtime=false;f.cmd.fromQuest=previous;f.cmd.quest=quest;f.state.game.tiles['0,0'].id=rules.startingLocation(quest);return f;
}

test('Exalted opening blessings use canonical faction score, region and exact Quest gates',()=>{
 for(const [quest,faction,score,expected]of [['Q050','beaconOrder',5,'Guarded'],['Q050','beaconOrder',4,null],['Q044','beaconOrder',6,null],['Q068','firstDawn',5,'Inspired'],['Q065','firstDawn',6,null],['Q050','firstDawn',6,null]]){
  const {before,state,cmd}=regionalFixture(quest);before.campaign.factionReputation3342={[faction]:score};state.game.campaign.factionReputation3342=clone(before.campaign.factionReputation3342);state.game.heroRuntimeStates.Rowan.conditions=['Poisoned','Inspired'];
  const out=rules.validate(before,state,cmd);assert.equal(out.error,undefined);assert.deepEqual(out.state.game.heroRuntimeStates.Rowan.conditions,expected?[expected]:[],`${quest} ${faction} ${score}`);assert.deepEqual(out.state.game.heroRuntimeStates.Garruk.conditions,[]);assert.equal(out.state.game.campaign.repPerks3360.quest[quest].startPerks3360,true);
 }
});

test('Spirit Court requires one allowed choice and consumed opening perks do not apply again',()=>{
 for(const choice of ['Guarded','Inspired']){
  const {before,state,cmd}=regionalFixture('Q044');before.campaign.factionReputation3342={spiritCourt:5};state.game.campaign.factionReputation3342={spiritCourt:5};state.game.questSetupChoices33626={spiritCourt:choice};const out=rules.validate(before,state,cmd);assert.equal(out.error,undefined);assert.deepEqual(out.state.game.heroRuntimeStates.Rowan.conditions,[choice]);assert.deepEqual(out.state.game.questSetupChoices33626,{spiritCourt:choice});
 }
 const {before,state,cmd}=regionalFixture('Q044');before.campaign.factionReputation3342={spiritCourt:5};state.game.campaign.factionReputation3342={spiritCourt:5};const untouched=clone(state.game);assert.match(rules.applySetupBenefits(before,state.game,cmd.quest).error,/Choose the Spirit Court/);assert.deepEqual(state.game,untouched);assert.match(rules.validate(before,state,cmd).error,/Choose the Spirit Court/);
 before.campaign.repPerks3360={quest:{Q044:{startPerks3360:true,otherUsed:true}},event:{WE015:{spent:true}},downtime:{prior:{used:true}}};state.game.campaign.repPerks3360={quest:{Q044:{startPerks3360:false}},event:{},downtime:{}};
 const out=rules.validate(before,state,cmd);assert.equal(out.error,undefined);assert.deepEqual(out.state.game.heroRuntimeStates.Rowan.conditions,[]);assert.deepEqual(out.state.game.campaign.repPerks3360,before.campaign.repPerks3360);assert.deepEqual(out.state.game.questSetupChoices33626,{});
});

test('Sanctified Vanguard setup derives only a new Seraphine Guarded trigger at canonical Level11, with one eligible ally and one round use',()=>{
 function vanguard(level=11){
  const f=regionalFixture('Q050');f.before.partyHeroes=['Seraphine','Garruk'];f.state.game.partyHeroes=[...f.before.partyHeroes];
  for(const g of [f.before,f.state.game]){g.seraphine={hp:11,maxHp:11,actions:0,x:0,y:0,conditions:[]};g.xp.Seraphine=level===11?6500:5700;g.levels.Seraphine=level;g.inventory.Seraphine=[];g.equipped.Seraphine=rules.starting('Seraphine').equipment;g.campaign.factionReputation3342={beaconOrder:5}}
  Object.assign(f.state.game,rules.canonicalResources(f.before,f.cmd.quest).values);return f;
 }
 const mark='Seraphine::Sanctified Vanguard';
 for(const level of [10,11]){const {before,state,cmd}=vanguard(level);state.game.heroAbilityRuntime3362={round:{[mark]:99}};const out=rules.validate(before,state,cmd);assert.equal(out.error,undefined);assert.deepEqual(out.state.game.seraphine.conditions,['Guarded']);assert.deepEqual(out.state.game.heroRuntimeStates.Garruk.conditions,level===11?['Guarded']:[]);assert.equal(out.state.game.heroAbilityRuntime3362.round[mark],level===11?1:undefined);if(level===11){assert.equal(out.state.game.questSetupChoices33626.sanctifiedVanguard,'Garruk');assert.deepEqual(rules.validate(before,out.state,cmd).state.game.heroRuntimeStates.Garruk.conditions,['Guarded'])}}
 const {before,state,cmd}=vanguard();before.partyHeroes.reverse();state.game.partyHeroes.reverse();const other=rules.validate(before,state,cmd).state.game;assert.deepEqual(other.heroRuntimeStates.Garruk.conditions,['Guarded']);assert.deepEqual(other.seraphine.conditions,[]);assert.equal(other.heroAbilityRuntime3362?.round?.[mark],undefined);
 for(const target of ['Seraphine','Outsider']){const f=vanguard();f.state.game.questSetupChoices33626={sanctifiedVanguard:target};assert.match(rules.validate(f.before,f.state,f.cmd).error,/Vanguard setup target/)}
 const low=vanguard(10);low.state.game.questSetupChoices33626={sanctifiedVanguard:'Garruk'};assert.ok(rules.validate(low.before,low.state,low.cmd).error);
 const lost=vanguard();lost.before.campaign.heroFates.Seraphine={status:'Lost'};Object.assign(lost.state.game,rules.canonicalResources(lost.before,lost.cmd.quest).values);const replacement=rules.validate(lost.before,lost.state,lost.cmd).state.game;assert.equal(replacement.levels.Seraphine,1);assert.deepEqual(replacement.heroRuntimeStates.Garruk.conditions,[]);
 const chosen=vanguard();chosen.before.partyHeroes.push('Rowan');chosen.state.game.partyHeroes.push('Rowan');Object.assign(chosen.state.game,rules.canonicalResources(chosen.before,chosen.cmd.quest).values);chosen.state.game.questSetupChoices33626={sanctifiedVanguard:'Rowan'};const selected=rules.validate(chosen.before,chosen.state,chosen.cmd);assert.equal(selected.error,undefined);assert.deepEqual(selected.state.game.heroRuntimeStates.Rowan.conditions,['Guarded']);assert.deepEqual(selected.state.game.heroRuntimeStates.Garruk.conditions,[]);
 chosen.state.game.questSetupChoices33626={};const declined=rules.validate(chosen.before,chosen.state,chosen.cmd).state.game;assert.equal(declined.heroAbilityRuntime3362?.round?.[mark],undefined);assert.deepEqual(declined.heroRuntimeStates.Rowan.conditions,[]);
 for(const choice of ['Guarded','Inspired']){const f=vanguard();f.cmd.quest='Q044';f.cmd.fromQuest='Q043';for(const g of [f.before,f.state.game]){g.campaign.activeEvent='WE015';g.campaign.currentQuest=g===f.before?'Q043':'Q044';g.campaign.questStatus={Q043:'Completed',Q044:'Available'};g.campaign.factionReputation3342={spiritCourt:5}}f.state.game.tiles['0,0'].id=rules.startingLocation('Q044');f.state.game.questSetupChoices33626={spiritCourt:choice};const out=rules.validate(f.before,f.state,f.cmd);assert.equal(out.error,undefined);assert.deepEqual(out.state.game.heroRuntimeStates.Garruk.conditions,choice==='Guarded'?['Guarded']:[])}
});

test('fresh regional Quest board identity matches the existing authored campaign start data',()=>{
 for(const [file,prefix]of [['campaign2-3330.js','C2'],['campaign34-3340.js','C34'],['campaign56-3350.js','C56']]){
  const source=fs.readFileSync(file,'utf8'),data=JSON.parse(source.match(new RegExp('const '+prefix+'_QUESTS=(.*?);\\n'))[1]);for(const [quest,spec]of Object.entries(data))assert.equal(rules.startingLocation(quest),spec.start,quest);
 }
 const f=regionalFixture('Q049');f.state.game.tiles['0,0'].id='L000';assert.match(rules.validate(f.before,f.state,f.cmd).error,/authored starting/);f.state.game.tiles['0,0'].id='L162';assert.equal(rules.validate(f.before,f.state,f.cmd).error,undefined);
});
