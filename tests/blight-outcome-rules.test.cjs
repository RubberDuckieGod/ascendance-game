const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../blight-encounter-rules-33624.js'),O=require('../blight-outcome-rules-33624.js');
function fixture(severity=4){
 const g={partyHeroes:['Rowan','Aldric'],activeHero:'Rowan',round:1,phase:'Hero Phase',hp:9,actions:3,conditions:[],hero:{x:1,y:0},heroDeck:[],heroHand:[],heroDiscard:[],heroRuntimeStates:{Rowan:{hp:7,maxHp:9,actions:3,x:0,y:0,conditions:[],hand:[{id:'H005-001',uid:'rowan-1',name:'Bow',cost:1}],discard:[],deck:[{id:'H005-002',uid:'rowan-2',name:'Step',cost:1}]}},campaign:{currentQuest:'Q037',day:1,c4Blight:2},tiles:{'0,0':{name:'Grove',terrain:'Forest',enemies:[],revealed:true},'1,0':{name:'Road',terrain:'Road',enemies:[],revealed:true}},inventory:{Rowan:[],Aldric:[]},equipped:{},gold:25,xp:{Rowan:0,Aldric:0},levels:{Rowan:1,Aldric:1}};
 const p={card:{id:'EN061'},hero:'Rowan',origin:{x:0,y:0},severity,encounterSerial33621:1},choice=severity===2?{discardUid:'rowan-1'}:{};
 return {g,p,choice};
}
function stage({g,p,choice},damage){const game=structuredClone(g);const result=R.apply(game,p,choice,{damage:damage?((...args)=>damage(game,...args)):((h,n)=>{const st=R.heroState(game,h),hp=st.hp;st.hp=Math.max(0,hp-n);return hp-st.hp})});assert.equal(result.ok,true);return {game};}
for(const severity of [2,4,6,7])test(`Blight outcome accepts the exact authored Severity ${severity} transition without mutating its input`,()=>{
 const f=fixture(severity),before=structuredClone(f.g),out=stage(f),result=O.validate(f.g,f.p,f.choice,out);assert.equal(result.error,undefined);assert.deepEqual(result.trial,out.game);assert.deepEqual(f.g,before);assert.notEqual(result.trial,out.game);
});
test('Blight outcome accepts a consumed equipment Hazard protection with conserved resources',()=>{
 const f=fixture(),out=stage(f,(g,h)=>{g.heroRuntimeStates[h].equipmentLoot33612={eq085Enc:'test-encounter'};return 0});
 assert.equal(O.validate(f.g,f.p,f.choice,out).error,undefined);
});
test('Blight outcome accepts a damage Reaction with its exact card and Action cost',()=>{
 const f=fixture();f.g.heroRuntimeStates.Rowan.hand=[{id:'H003-008',uid:'reaction-1',name:'Protective Light',cost:1}];
 const out=stage(f,(g,h)=>{const st=g.heroRuntimeStates[h];st.discard.push(st.hand.shift());st.actions--;return 0});
 assert.equal(O.validate(f.g,f.p,f.choice,out).error,undefined);
});
for(const [label,mutate]of [
 ['Gold',g=>g.gold++],['XP',g=>g.xp.Rowan++],['Hero level',g=>g.levels.Rowan++],
 ['foreign Hero damage',g=>g.hp--],['excess damage',g=>g.heroRuntimeStates.Rowan.hp-=2],
 ['unrelated healing',g=>g.heroRuntimeStates.Rowan.hp=9],
 ['unpaid Actions',g=>g.heroRuntimeStates.Rowan.actions=2],
 ['Enemy spawn',g=>g.tiles['0,0'].enemies.push({id:'E001',hp:4})],
 ['unearned Patch',g=>g.tiles['0,0'].blightPatches33624=5],
 ['invented Loot',g=>g.inventory.Rowan.push({key:'loot:LT001',kind:'loot',id:'LT001',qty:1})],
 ['duplicate UID',g=>g.heroRuntimeStates.Rowan.hand.push(structuredClone(g.heroRuntimeStates.Rowan.hand[0]))],
 ['rewritten card',g=>g.heroRuntimeStates.Rowan.hand[0].cost=0],
 ['untriggered draw',g=>g.heroRuntimeStates.Rowan.hand.push(g.heroRuntimeStates.Rowan.deck.shift())],
 ['deck reorder',g=>{g.heroRuntimeStates.Rowan.deck.push(g.heroRuntimeStates.Rowan.hand.shift())}],
 ['teleport',g=>g.heroRuntimeStates.Rowan.x=1],
 ['unrelated Status',g=>g.heroRuntimeStates.Rowan.conditions.push('Guarded')]
])test(`Blight outcome rejects ${label} outside the authored transition`,()=>{const f=fixture(),out=stage(f);mutate(out.game);assert.ok(O.validate(f.g,f.p,f.choice,out).error);});
test('Blight outcome cannot prevent unavoidable damage even with equipment tracking',()=>{
 const f=fixture(7),out=stage(f,()=>0);out.game.heroRuntimeStates.Rowan.equipmentLoot33612={eq085Enc:'claimed'};assert.match(O.validate(f.g,f.p,f.choice,out).error,/Unavoidable/);
});
test('Blight outcome requires the selected hand card to remain in the discard',()=>{
 const f=fixture(2),out=stage(f),st=out.game.heroRuntimeStates.Rowan;st.hand.push(st.discard.pop());assert.ok(O.validate(f.g,f.p,f.choice,out).error);
});
test('Blight outcome does not accept a replayed receipt as a fresh encounter',()=>{
 const f=fixture(),out=stage(f);assert.match(O.validate(out.game,f.p,f.choice,out).error,/already resolved/);
});
test('Blight outcome preserves canonical authority envelopes and logs rather than accepting worker copies',()=>{
 const f=fixture();f.g.roomAuthority3300={seq:2};f.g.adventureLog=['canonical'];const out=stage(f);out.game.roomAuthority3300={seq:999,turnHero:'Aldric'};out.game.adventureLog=['local Encounter draw'];const result=O.validate(f.g,f.p,f.choice,out);assert.equal(result.error,undefined);assert.deepEqual(result.trial.roomAuthority3300,f.g.roomAuthority3300);assert.deepEqual(result.trial.adventureLog,['canonical']);
});
test('Blight outcome permits one WE014 healing suppression when an existing Phoenix Heart saves a fatal target',()=>{
 const f=fixture();f.g.heroRuntimeStates.Rowan.hp=1;f.g.campaign.activeEvent='WE014';f.g.tiles['0,0'].blightPatches33624=1;f.g.inventory.Aldric=[{key:'loot:LT157',kind:'loot',id:'LT157',qty:1}];
 const out=stage(f,(g,h)=>{g.heroRuntimeStates[h].hp=8;g.campaign.phoenixHeartSpent33612=true;g.tiles['0,0'].blightHealingSuppressedRound33624=String(g.round);return 0});
 const result=O.validate(f.g,f.p,f.choice,out);assert.equal(result.error,undefined);assert.equal(result.trial.tiles['0,0'].blightHealingSuppressedRound33624,'1');assert.equal(result.trial.heroRuntimeStates.Rowan.hp,8);
});
test('Blight outcome rejects a healing suppression meter change without any healing window',()=>{
 const f=fixture();f.g.campaign.activeEvent='WE014';f.g.tiles['0,0'].blightPatches33624=1;const out=stage(f);out.game.tiles['0,0'].blightHealingSuppressedRound33624='1';assert.match(O.validate(f.g,f.p,f.choice,out).error,/healing suppression/);
});
test('Blight outcome accepts only the known empty Equipment automatic-hit initializer',()=>{
 const f=fixture(),out=stage(f);out.game.equipmentAutoHit33613={lastRound:1,encounterUsed:{},roundUsed:{},movedRound:{},lastEmber:{}};assert.equal(O.validate(f.g,f.p,f.choice,out).error,undefined);out.game.equipmentAutoHit33613.roundUsed.invented=1;assert.match(O.validate(f.g,f.p,f.choice,out).error,/Equipment/);
});
test('Blight outcome treats authored zero and empty UI initializers as canonical defaults',()=>{
 const f=fixture(),out=stage(f);
 Object.assign(out.game.campaign,{professionMastery3280:{Blacksmithing:0,Alchemy:0,Enchanting:0,Artificing:0},professionCraftedThisDowntime3280:{},downtimeActivities3252:{},researchPrep3252:{},downtimeActivityToken3252:'Q037:1:NONE'});
 out.game.extraTurns33621={used:{},active:{}};out.game.heroProfessions={Rowan:Object.fromEntries(['Blacksmithing','Alchemy','Enchanting','Artificing'].map(key=>[key,{tier:'I',progress:0}]))};
 const result=O.validate(f.g,f.p,f.choice,out);assert.equal(result.error,undefined);assert.equal(result.trial.heroProfessions,undefined);assert.equal(result.trial.campaign.professionMastery3280,undefined);assert.equal(result.trial.extraTurns33621,undefined);
});
for(const [label,edit]of [
 ['nonzero mastery',g=>g.campaign.professionMastery3280={Blacksmithing:1}],
 ['a free craft',g=>g.campaign.professionCraftedThisDowntime3280={Blacksmithing:true}],
 ['profession progress',g=>g.heroProfessions={Rowan:{Blacksmithing:{tier:'I',progress:1}}}],
 ['a free extra turn',g=>g.extraTurns33621={used:{},active:{Rowan:'LT150'}}]
])test(`Blight outcome does not accept ${label} as a UI default`,()=>{const f=fixture(),out=stage(f);edit(out.game);assert.ok(O.validate(f.g,f.p,f.choice,out).error);});
