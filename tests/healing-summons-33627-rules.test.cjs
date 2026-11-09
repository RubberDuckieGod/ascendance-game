const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../public/healing-summons-rules-33627.js');
function game(){return {round:1,phase:'Hero Phase',partyHeroes:['Elara','Aldric'],hero:{x:0,y:0},hp:5,conditions:[],equipped:{},campaign:{currentQuest:'Q003'},heroRuntimeStates:{Elara:{x:0,y:0,hp:5,maxHp:10,actions:3,conditions:[],hand:[{id:'H003-016',name:'Shepherd the Faithful',uid:'shepherd',cost:1}],discard:[]}},tiles:{'0,0':{name:'Origin',edges:{E:true},enemies:[]},'1,0':{name:'Destination',edges:{W:true},enemies:[]}}}}
const shepherd=healHero=>({cardId:'H003-016',cardUid:'shepherd',allyHero:'Aldric',tileKey:'1,0',healHero});
function wolf(){const g=game();g.partyHeroes=['Thorne','Aldric'];g.heroRuntimeStates.Thorne={x:0,y:0,hp:8,maxHp:10,actions:3,hand:[{id:'H007-006',uid:'wolf',name:'Spirit Wolf',cost:2}],discard:[]};g.tiles['0,0'].enemies=[{id:'E001',roomEnemyId3301:'enemy-1',hp:6,armor:9}];return g}
const summon={cardId:'H007-006',cardUid:'wolf',enemyIndex:0,enemyId:'enemy-1'};
for(const recipient of ['Elara','Aldric'])test(`Shepherd: exact injured ${recipient} choice, both moves, one cost/discard`,()=>{
 const g=game(),result=R.playCard(g,'Elara',shepherd(recipient));assert.equal(result.error,undefined);assert.equal(g.hp,recipient==='Aldric'?6:5);assert.equal(g.heroRuntimeStates.Elara.hp,recipient==='Elara'?6:5);assert.equal(g.hero.x,1);assert.equal(g.heroRuntimeStates.Elara.x,1);assert.equal(g.heroRuntimeStates.Elara.actions,2);assert.equal(g.heroRuntimeStates.Elara.hand.length,0);assert.equal(g.heroRuntimeStates.Elara.discard.length,1);
});
for(const kind of ['recipient','ally','destination','actor','hand','generalActions','engaged','rooted'])test(`Shepherd: invalid ${kind} refuses before any mutation`,()=>{
 const g=game(),args=shepherd('Aldric');let actor='Elara';
 if(kind==='recipient')args.healHero='Thorne';if(kind==='ally')args.allyHero='Elara';if(kind==='destination')args.tileKey='2,0';if(kind==='actor')actor='Aldric';if(kind==='hand')args.cardUid='wrong';if(kind==='generalActions')g.heroRuntimeStates.Elara.attackOnlyActions=3;if(kind==='engaged')g.tiles['0,0'].enemies.push({hp:1});if(kind==='rooted')g.conditions.push('Rooted');
 const before=JSON.stringify(g);assert.ok(R.playCard(g,actor,args).error);assert.equal(JSON.stringify(g),before);
});
test('Shepherd: Health cap and no-healing lock are retained',()=>{
 const capped=game();capped.hp=14;assert.equal(R.playCard(capped,'Elara',shepherd('Aldric')).heal,0);assert.equal(capped.hp,14);
 const locked=game();locked.noHealUntilTurnEnd=true;assert.equal(R.playCard(locked,'Elara',shepherd('Aldric')).heal,0);assert.equal(locked.hp,5);
});
test('Shepherd: shared Life stance and Staff of Renewal apply to the chosen ally only',()=>{
 const g=game();g.equipped.Elara={Weapon:'EQ068',Offhand:'EQ065'};
 const mechanics=require('../public/mechanics-rules-33621.js');g.mechanics33621={heroes:{Elara:{stance:'Life',stanceEncounter:mechanics.encounter(g)}}};
 const r=R.playCard(g,'Elara',shepherd('Aldric'));assert.equal(r.heal,5);assert.equal(g.hp,10);assert.equal(g.heroRuntimeStates.Elara.hp,5);
 const self=game();self.equipped.Elara={Weapon:'EQ065'};assert.equal(R.playCard(self,'Elara',shepherd('Elara')).heal,1);
});
test('Shepherd: Pilgrim symbol adds the chosen healed ally’s next-damage Armor receipt',()=>{
 const g=game();g.equipped.Elara={Accessory:['EQ142']};R.playCard(g,'Elara',shepherd('Aldric'));
 assert.equal(g.equipmentLoot33612.steadfastPrayerRound,1);assert.equal(g.heroRuntimeStates.Elara.equipmentLoot33612['eq142:round'],1);
});
test('Shepherd: Verdant first-heal Reputation bonus is consumed once in shared state',()=>{
 const g=game();g.campaign.currentQuest='Q037';g.campaign.factionReputation3342={eldergroveCircle:1};assert.equal(R.playCard(g,'Elara',shepherd('Aldric')).heal,2);assert.equal(g.campaign.repPerks3360.quest.Q037.elderFirstHeal,true);
});
test('Shepherd: Sunfall and active Encounter recovery penalties use their authored shared receipts',()=>{
 const g=game();g.campaign.currentQuest='Q067';g.campaign.c6Sunfall=6;g.tiles['1,0'].terrain='Desert';assert.equal(R.playCard(g,'Elara',shepherd('Aldric')).heal,0);assert.equal(g.campaign.parity3360.round['sunHeal:1:Aldric'],true);
 const encounter=game();encounter.activeEncounter320={token:'penalty',healPenalty:true};assert.equal(R.playCard(encounter,'Elara',shepherd('Aldric')).heal,0);assert.equal(encounter.campaign.parity3360.round['encHeal:penalty'],true);
});
test('Shepherd: Blight suppression records the destination’s first recovery without modifying the other Hero',()=>{
 const g=game();g.campaign.activeEvent='WE014';g.tiles['1,0'].blightPatches33624=1;assert.equal(R.playCard(g,'Elara',shepherd('Aldric')).heal,0);assert.equal(g.hp,5);assert.equal(g.tiles['1,0'].blightHealingSuppressedRound33624,'1');assert.equal(g.heroRuntimeStates.Elara.hp,5);
});
test('Spirit Wolf: two direct damage ignores Armor, exact cost, one durable piece',()=>{
 const g=wolf(),r=R.playCard(g,'Thorne',summon);assert.equal(r.damage,2);assert.equal(g.tiles['0,0'].enemies[0].hp,4);assert.equal(g.heroRuntimeStates.Thorne.actions,1);assert.equal(g.heroRuntimeStates.Thorne.discard.length,1);assert.equal(g.heroCreatedPieces3294.length,1);
 for(let i=0;i<3;i++)R.reconcile(g);const restored=JSON.parse(JSON.stringify(g));R.reconcile(restored);assert.equal(restored.heroCreatedPieces3294.length,1);assert.equal(restored.heroCreatedPieces3294[0].locationKey,'0,0');
});
test('Spirit Wolf: lethal immediate damage credits exactly one kill and returns the defeated target for quest hooks',()=>{
 const g=wolf();g.tiles['0,0'].enemies[0].hp=2;const r=R.playCard(g,'Thorne',summon);assert.equal(r.killed,true);assert.equal(r.beforeHp,2);assert.equal(r.defeatedEnemy.roomEnemyId3301,'enemy-1');assert.equal(r.defeatedEnemy.hp,0);assert.equal(g.heroKills3259.Thorne,1);assert.equal(g.tiles['0,0'].enemies.length,0);
});
test('Spirit Wolf: other Hero cannot defeat it; owner removal cannot resurrect through compatibility snapshots',()=>{
 const g=wolf(),r=R.playCard(g,'Thorne',summon),stale=JSON.parse(JSON.stringify(g));assert.ok(R.defeat(g,'Aldric',{pieceId:r.pieceId}).error);assert.equal(R.defeat(g,'Thorne',{pieceId:r.pieceId}).removed,true);R.preserveCanonical(g,stale);R.reconcile(stale);assert.equal(stale.heroCreatedPieces3294.length,0);assert.equal(stale.heroRuntimeStates.Thorne.spiritWolf32526,undefined);
});
test('Spirit Wolf: compatibility snapshots cannot remove a living summon, while a fresh Quest may reset it',()=>{
 const g=wolf();R.playCard(g,'Thorne',summon);const incoming=wolf();R.preserveCanonical(g,incoming);assert.equal(incoming.heroCreatedPieces3294.length,1);
 const fresh=wolf();fresh.campaign.currentQuest='Q004';R.preserveCanonical(g,fresh);assert.equal(fresh.heroCreatedPieces3294,undefined);
});
test('Spirit Wolf: no legal Enemy leaves Actions and card untouched',()=>{
 const g=wolf();g.tiles['0,0'].enemies=[];const before=JSON.stringify(g);assert.ok(R.playCard(g,'Thorne',summon).error);assert.equal(JSON.stringify(g),before);
});
function elaraCard(id){const g=game(),b=g.heroRuntimeStates.Elara;b.supportInnateRound=g.round;b.hand=[{id,uid:'extra',name:R.CARDS[id].name,cost:R.CARDS[id].cost}];return g}
test('Prayer of Restoration: two selected Heroes each receive their own choice, including Consecrated both for exactly one',()=>{
 const g=elaraCard('H003-013');g.tiles['0,0'].consecratedUntilRound=2;g.conditions=['Bleeding'];g.heroRuntimeStates.Elara.conditions=['Poisoned'];
 const r=R.playCard(g,'Elara',{cardId:'H003-013',cardUid:'extra',selections:[{hero:'Elara',options:['heal']},{hero:'Aldric',options:['heal','cleanse'],condition:'Bleeding'}]});
 assert.equal(r.error,undefined);assert.equal(g.hp,7);assert.equal(g.heroRuntimeStates.Elara.hp,7);assert.deepEqual(g.conditions,[]);assert.deepEqual(g.heroRuntimeStates.Elara.conditions,['Poisoned']);assert.equal(g.heroRuntimeStates.Elara.actions,2);
});
test('Prayer of Restoration: two double choices are rejected without spending',()=>{
 const g=elaraCard('H003-013');g.tiles['0,0'].consecratedUntilRound=2;const before=JSON.stringify(g),r=R.playCard(g,'Elara',{cardId:'H003-013',selections:[{hero:'Elara',options:['heal','cleanse']},{hero:'Aldric',options:['heal','cleanse']}]});assert.ok(r.error);assert.equal(JSON.stringify(g),before);
});
test('Divine Communion: each Hero can select two different options on Consecrated ground',()=>{
 const g=elaraCard('H003-014');g.tiles['0,0'].consecratedUntilRound=2;g.conditions=['Bleeding'];
 const r=R.playCard(g,'Elara',{cardId:'H003-014',selections:[{hero:'Elara',options:['heal','inspired']},{hero:'Aldric',options:['cleanse','inspired'],condition:'Bleeding'}]});
 assert.equal(r.error,undefined);assert.equal(g.heroRuntimeStates.Elara.hp,8);assert.equal(g.hp,5);assert.deepEqual(g.conditions,['Inspired']);assert.deepEqual(g.heroRuntimeStates.Elara.conditions,['Inspired']);assert.equal(g.heroRuntimeStates.Elara.actions,1);
});
test('Divine Communion: duplicate options and missing allied Hero refuse before mutation',()=>{
 for(const selections of [[{hero:'Elara',options:['heal','heal']},{hero:'Aldric',options:['heal']}],[{hero:'Elara',options:['heal']}]] ){
  const g=elaraCard('H003-014');g.tiles['0,0'].consecratedUntilRound=2;const before=JSON.stringify(g);assert.ok(R.playCard(g,'Elara',{cardId:'H003-014',selections}).error);assert.equal(JSON.stringify(g),before);
 }
});
test('Guided Path: selected Condition removal, movement, Consecrated draw and exact one Action',()=>{
 const g=elaraCard('H003-015'),b=g.heroRuntimeStates.Elara;b.conditions=['Bleeding','Poisoned'];b.deck=[{id:'drawn',uid:'drawn'}];g.tiles['1,0'].consecratedUntilRound=2;
 const r=R.playCard(g,'Elara',{cardId:'H003-015',tileKey:'1,0',mode:'cleanse',condition:'Bleeding'});
 assert.equal(r.error,undefined);assert.equal(b.x,1);assert.equal(b.hp,5);assert.deepEqual(b.conditions,['Poisoned']);assert.equal(b.hand[0].uid,'drawn');assert.equal(b.actions,2);
});
test('Wings of Mercy: moves while Engaged, heals only chosen destination ally and Consecrates destination',()=>{
 const g=elaraCard('H003-017');g.hero.x=1;g.tiles['0,0'].enemies=[{hp:5}];
 const r=R.playCard(g,'Elara',{cardId:'H003-017',tileKey:'1,0',mode:'heal',healHero:'Aldric'});
 assert.equal(r.error,undefined);assert.equal(g.hp,7);assert.equal(g.heroRuntimeStates.Elara.hp,5);assert.equal(g.heroRuntimeStates.Elara.x,1);assert.equal(g.heroRuntimeStates.Elara.actions,1);assert.equal(g.tiles['1,0'].consecratedBy,'Elara');
});
test('Wings of Mercy: cleanse removes one selected Condition per destination ally',()=>{
 const g=elaraCard('H003-017');g.hero.x=1;g.conditions=['Bleeding','Poisoned'];
 const r=R.playCard(g,'Elara',{cardId:'H003-017',tileKey:'1,0',mode:'cleanse',cleanse:{Aldric:'Poisoned'}});assert.equal(r.error,undefined);assert.deepEqual(g.conditions,['Bleeding']);assert.equal(g.hp,5);
});
test('Support card: Divine Grace is a separate acting-Hero recipient choice for the printed 1 Health',()=>{
 const g=elaraCard('H003-013');delete g.heroRuntimeStates.Elara.supportInnateRound;
 const r=R.playCard(g,'Elara',{cardId:'H003-013',selections:[{hero:'Elara',options:['heal']}],graceHero:'Aldric'});assert.equal(r.error,undefined);assert.equal(g.heroRuntimeStates.Elara.hp,6);assert.equal(g.hp,6);assert.equal(g.heroRuntimeStates.Elara.supportInnateRound,1);
});
test('Shepherd entry: both Foggy Meadow choices and movement passives apply once in shared state',()=>{
 const g=game();g.tiles['1,0'].id='L043';R.playCard(g,'Elara',{...shepherd('Aldric'),entryChoices:{Elara:{fog:'Hidden'},Aldric:{fog:'Armor'}}});assert.deepEqual(g.heroRuntimeStates.Elara.conditions,['Hidden']);assert.equal(g.locationArmorBuff,1);assert.equal(g.heroRuntimeStates.Elara.equipmentLoot33612.moveCount,1);assert.equal(g.equipmentAutoHit33613.movedRound.Aldric,1);
});
test('Shepherd entry: Asha Spirit Passage draws for both Heroes, once each per Round',()=>{
 const g=game();g.partyHeroes.push('Asha');g.heroRuntimeStates.Asha={x:0,y:0,hp:8};g.levels={Asha:5};g.asc329={totem:{'1,0':1}};g.heroDeck=[{uid:'aldric-draw'}];g.heroRuntimeStates.Elara.deck=[{uid:'elara-draw'}];
 R.playCard(g,'Elara',shepherd('Aldric'));assert.equal(g.heroHand[0].uid,'aldric-draw');assert.equal(g.heroRuntimeStates.Elara.hand[0].uid,'elara-draw');assert.equal(g.heroAbilityRuntime3362.round['Asha::Spirit Passage:Elara'],1);assert.equal(g.heroAbilityRuntime3362.round['Asha::Spirit Passage:Aldric'],1);
});
test('Shepherd entry: exact actor receipt is required and ordinary snapshots cannot erase it',()=>{
 const g=game();g.tiles['1,0'].enc=true;g.encDeck=[{id:'EN001'}];const r=R.playCard(g,'Elara',shepherd('Aldric'),{commandId:'card-1'});assert.equal(r.entryReceipt.actor,'Elara');assert.ok(R.completeEntry(g,'Elara',{tileKey:'0,0'}).error);assert.ok(R.completeEntry(g,'Elara',{tileKey:'1,0',entryId:'wrong'}).error);assert.ok(R.completeEntry(g,'Elara',{tileKey:'1,0'}).error);
 const stale=game();R.preserveCanonical(g,stale);assert.equal(stale.healingEntries33627.Elara.id,'card-1');assert.equal(R.completeEntry(g,'Elara',{tileKey:'1,0'},{authoritativeFirstVisit:true}).completed,true);assert.equal(g.healingEntries33627.Elara,undefined);
});
test('Divine Communion Inspired sets the legacy attack-consumer flags for Aldric and Lyra',()=>{
 const g=elaraCard('H003-014');g.partyHeroes.push('Lyra');g.lyra={x:0,y:0,hp:5,maxHp:8,conditions:[]};
 const r=R.playCard(g,'Elara',{cardId:'H003-014',selections:[{hero:'Elara',options:['inspired']},{hero:'Aldric',options:['inspired']},{hero:'Lyra',options:['inspired']}]});assert.equal(r.error,undefined);assert.equal(g.inspired,true);assert.equal(g.lyra.inspired,true);
});
test('Improved Divine Grace unlocks at Elara level 3 and Blessed Presence at level 2, once per Round',()=>{
 for(const [level,expected, inspired]of [[1,6,false],[2,6,true],[3,7,true]]){
  const g=elaraCard('H003-013');g.levels={Elara:level};delete g.heroRuntimeStates.Elara.supportInnateRound;
  R.playCard(g,'Elara',{cardId:'H003-013',selections:[{hero:'Elara',options:['cleanse']}],graceHero:'Aldric'});assert.equal(g.hp,expected);assert.equal(!!g.inspired,inspired);
  if(inspired)assert.equal(g.heroAbilityRuntime3362.round['Elara::Blessed Presence'],1);
 }
});
test('Fatal Tempest entry leaves a correct Lost fate and creates no unfinishable entry receipt',()=>{
 const g=elaraCard('H003-015');g.heroRuntimeStates.Elara.hp=1;g.campaign.currentQuest='Q055';g.campaign.c5Doomtide=6;g.tiles['1,0'].terrain='Coast';g.tiles['1,0'].enc=true;
 const r=R.playCard(g,'Elara',{cardId:'H003-015',tileKey:'1,0',mode:'cleanse'},{random:()=>0});assert.equal(g.heroRuntimeStates.Elara.hp,0);assert.equal(g.campaign.heroFates.Elara.status,'Lost');assert.equal(r.entryReceipt,null);assert.equal(g.healingEntries33627?.Elara,undefined);
});
test('Canonical compatibility merge preserves only consumed receipts, while allowing one-use Armor to clear',()=>{
 const current=game();current.equipped.Elara={Accessory:['EQ142']};R.playCard(current,'Elara',shepherd('Aldric'));current.heroRuntimeStates.Elara.supportInnateRound=1;current.oathboundRound=1;
 const next=JSON.parse(JSON.stringify(current));delete next.heroRuntimeStates.Elara.supportInnateRound;delete next.oathboundRound;delete next.heroRuntimeStates.Elara.equipmentLoot33612['eq142:round'];delete next.equipmentLoot33612.steadfastPrayerRound;
 current.heroAbilityRuntime3362.round['Elara::Blessed Presence']=1;next.heroAbilityRuntime3362.round={};R.preserveCanonical(current,next);
 assert.equal(next.heroRuntimeStates.Elara.supportInnateRound,1);assert.equal(next.oathboundRound,1);assert.equal(next.heroRuntimeStates.Elara.equipmentLoot33612['eq142:round'],1);assert.equal(next.heroAbilityRuntime3362.round['Elara::Blessed Presence'],1);assert.equal(next.equipmentLoot33612.steadfastPrayerRound,undefined);
});

test('Spirit Wolf uses workbook 3 Health, 0 Armor and expires with its source encounter without resurrection',()=>{
 const g=wolf();g.activeEncounter320={id:'EN001',token:'encounter-one'};R.playCard(g,'Thorne',summon);
 const piece=g.heroCreatedPieces3294[0];assert.equal(piece.hp,3);assert.equal(piece.maxHp,3);assert.equal(piece.armor,0);
 R.reconcile(g);assert.equal(g.heroCreatedPieces3294.length,1);
 g.activeEncounter320=null;R.reconcile(g);assert.equal(g.heroCreatedPieces3294.length,0);assert.equal(g.heroRuntimeStates.Thorne.spiritWolf32526,undefined);
 R.reconcile(g);assert.equal(g.heroCreatedPieces3294.length,0);
});
test('Spirit Wolf migration preserves damage while using the workbook maximum',()=>{
 const g=wolf();g.heroRuntimeStates.Thorne.spiritWolf32526={x:0,y:0,hp:1};R.reconcile(g);assert.equal(g.heroCreatedPieces3294[0].hp,1);assert.equal(g.heroCreatedPieces3294[0].maxHp,3);
});

test('canonical encounter closure removes its Spirit Wolf before a stale snapshot can restore it',()=>{
 const C=require('../encounter-completion-rules-33627.js'),g=wolf();
 g.activeEncounter320={id:'EN001',token:'encounter-one'};g.tiles['0,0'].enemies[0].encounterToken='encounter-one';
 R.playCard(g,'Thorne',summon);const stale=JSON.parse(JSON.stringify(g)),before=C.capture(g);g.tiles['0,0'].enemies=[];
 assert.equal(C.closeDefeated(g,before,{actor:'Thorne',applied:[{enemyId:'enemy-1',removed:true,hpBefore:4,hpAfter:0}]}).closed,true);
 assert.equal(g.heroCreatedPieces3294.length,0);assert.equal(g.heroRuntimeStates.Thorne.spiritWolf32526,undefined);
 C.preserve(g,stale);R.preserveCanonical(g,stale);R.reconcile(stale);assert.equal(stale.heroCreatedPieces3294.length,0);
});
