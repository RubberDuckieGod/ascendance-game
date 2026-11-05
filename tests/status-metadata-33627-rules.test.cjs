'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const rules=require('../public/status-rules-33627.js');
const script=fs.readFileSync(path.join(__dirname,'../public/status-runtime-33627.js'),'utf8');
const clone=value=>JSON.parse(JSON.stringify(value));
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates[h];
const scope=g=>({instance:g.campaign.instanceId32537,quest:g.campaign.currentQuest,epoch:g.questTransitionAuthority33626.epoch});
function game(){
 const actor=()=>({hp:7,maxHp:9,actions:2,x:0,y:0,conditions:['Inspired'],hand:[{uid:'local-card'}],deck:[{uid:'local-deck'}],discard:[],statusActivation33627:{start:'local-start'},wildGrowthRegenerating33627:{appliedToken:'local-start',owner:'Thorne'},natureRenewalRound33627:2});
 return {partyHeroes:['Aldric','Lyra','Seraphine','Rowan'],round:3,phase:'Hero Phase',hp:11,actions:2,conditions:['Guarded'],hero:{x:0,y:0},heroHand:[{uid:'aldric-card'}],heroDeck:[],heroDiscard:[],statusActivation33627:{start:'local-aldric'},wildGrowthRegenerating33627:{appliedToken:'local-aldric',owner:'Thorne'},natureRenewalRound33627:2,lyra:actor(),seraphine:actor(),heroRuntimeStates:{Rowan:actor()},gold:777,reputation:2,xp:{Rowan:500},heroKills3259:{Aldric:4,Rowan:2},inventory:{Aldric:[{id:'LT002',qty:1}]},campaign:{instanceId32537:'VM-METADATA-ONLY',currentQuest:'Q003',day:2,heroFates:{Aldric:{status:'Active'},Lyra:{status:'Active'},Rowan:{status:'Active'},Uncontrolled:{status:'Lost'}}},questTransitionAuthority33626:{epoch:4},activeEncounter320:{token:'ENC-ACTIVE',id:'EN008'},tiles:{'0,0':{id:'L000',visited:true,enemies:[{id:'LOCAL-ENEMY',hp:3}],consecratedAuthority33627:{owner:'Elara',active:true},consecratedUntilRound:4,consecratedBy:'Elara',blightHealingSuppressedRound33624:'2'},'1,0':{id:'L001',enemies:[],consecratedUntilRound:4,consecratedBy:'Elara'}}};
}
function harness(){
 const ctx={g:game(),mpMode:'remote',mpRoom:'METADATA-ROOM',mpRoomRevision:10,delegated:[],renderCount:0,workerSuppress:false,suppressCalls:0};
 ctx.window=ctx;ctx.__ascGetGame=()=>ctx.g;ctx.ascStatusRules33627=rules;ctx.ascMechanics33621={};ctx.ascPhaseSync33625={ready:()=>true,suppress:()=>{ctx.suppressCalls++;return ctx.workerSuppress}};
 ctx.controlledHero=()=> 'Aldric';ctx.partyHeroes=()=>ctx.g.partyHeroes;ctx.heroMaxHp=()=>14;ctx.heroDisplayName=h=>h;ctx.log=()=>{};ctx.handleHeroZero=()=>{};
 ctx.init=()=>{};ctx.endTurn=async()=>{};ctx.passHero32521=()=>{};ctx.render=()=>{ctx.renderCount++};ctx.setTimeout=()=>0;ctx.clearTimeout=()=>{};
 ctx.mpHandleMessage=message=>{ctx.delegated.push(clone(message));if(message.type==='STATE'&&message.room===ctx.mpRoom&&message.from==='SERVER')ctx.g=clone(message.data.game);return 'legacy-result'};
 vm.createContext(ctx);vm.runInContext(script,ctx,{filename:'public/status-runtime-33627.js',timeout:1000});
 assert.equal(ctx.ascStatus33627.ready(),true);assert.equal(typeof ctx.ascStatus33627.applyRoomMetadata,'function');return ctx;
}
function packet(ctx,{tag='statusOnly33627',revision=12,source=clone(ctx.g)}={}){return {type:'STATE',from:'SERVER',room:ctx.mpRoom,revision,[tag]:true,data:{game:source}}}
function protectedState(g){return clone({gold:g.gold,reputation:g.reputation,round:g.round,phase:g.phase,hp:g.hp,actions:g.actions,conditions:g.conditions,hero:g.hero,heroHand:g.heroHand,heroDeck:g.heroDeck,heroDiscard:g.heroDiscard,heroKills:g.heroKills3259,xp:g.xp,inventory:g.inventory,heroes:Object.fromEntries(g.partyHeroes.filter(h=>h!=='Aldric').map(h=>{const b=body(g,h);return [h,{hp:b.hp,maxHp:b.maxHp,actions:b.actions,x:b.x,y:b.y,conditions:b.conditions,hand:b.hand,deck:b.deck,discard:b.discard}]})),tileCore:Object.fromEntries(Object.entries(g.tiles).map(([k,t])=>[k,{id:t.id,visited:t.visited,enemies:t.enemies}]))})}

test('the full runtime consumes status-only STATE before legacy replacement and preserves unrelated gameplay state',()=>{
 const ctx=harness(),before=protectedState(ctx.g),source=clone(ctx.g);source.gold=0;source.hp=1;source.round=99;source.heroKills3259={Aldric:0};source.heroHand=[];source.heroRuntimeStates.Rowan.hp=0;source.heroRuntimeStates.Rowan.hand=[];
 for(const h of source.partyHeroes){const b=body(source,h);b.statusActivation33627={start:'canonical-'+h,end:'canonical-'+h};b.wildGrowthRegenerating33627={appliedToken:'canonical-'+h,owner:'Thorne'};b.natureRenewalRound33627=3}
 source.campaign.heroFates.Rowan={status:'Downed',quest:'Q003',day:2};source.campaign.heroFates.Uncontrolled={status:'Active'};
 const message=packet(ctx,{source});assert.equal(ctx.mpHandleMessage(message),undefined);assert.equal(ctx.delegated.length,0);assert.deepEqual(protectedState(ctx.g),before);assert.equal(ctx.mpRoomRevision,12);
 for(const h of ctx.g.partyHeroes){assert.deepEqual(clone(body(ctx.g,h).statusActivation33627),{start:'canonical-'+h,end:'canonical-'+h});assert.equal(body(ctx.g,h).natureRenewalRound33627,3)}
 assert.deepEqual(clone(ctx.g.campaign.heroFates.Rowan),{status:'Downed',quest:'Q003',day:2});assert.deepEqual(clone(ctx.g.campaign.heroFates.Uncontrolled),{status:'Lost'});
});
test('canonical absence deletes expired party status metadata and fate without deleting unrelated Hero records',()=>{
 const ctx=harness(),source=clone(ctx.g),before=protectedState(ctx.g);for(const h of source.partyHeroes){const b=body(source,h);delete b.statusActivation33627;delete b.wildGrowthRegenerating33627;delete b.natureRenewalRound33627;delete source.campaign.heroFates[h]}
 ctx.mpHandleMessage(packet(ctx,{source}));for(const h of ctx.g.partyHeroes){for(const field of ['statusActivation33627','wildGrowthRegenerating33627','natureRenewalRound33627'])assert.equal(Object.hasOwn(body(ctx.g,h),field),false);assert.equal(Object.hasOwn(ctx.g.campaign.heroFates,h),false)}
 assert.deepEqual(clone(ctx.g.campaign.heroFates.Uncontrolled),{status:'Lost'});assert.deepEqual(protectedState(ctx.g),before);assert.equal(ctx.delegated.length,0);
});
test('status metadata updates canonical Consecrated expiry and Blight stamps only on matching tile identities',()=>{
 const ctx=harness(),source=clone(ctx.g),before=protectedState(ctx.g);source.tiles['0,0'].consecratedAuthority33627={owner:'Elara',active:false};delete source.tiles['0,0'].consecratedUntilRound;delete source.tiles['0,0'].consecratedBy;source.tiles['0,0'].blightHealingSuppressedRound33624='3';
 source.tiles['1,0']={id:'DIFFERENT-LOCATION',enemies:[],consecratedAuthority33627:{active:false},blightHealingSuppressedRound33624:'99'};source.tiles['2,0']={id:'NEW-LOCATION',consecratedAuthority33627:{active:true}};
 ctx.mpHandleMessage(packet(ctx,{source}));assert.deepEqual(clone(ctx.g.tiles['0,0'].consecratedAuthority33627),{owner:'Elara',active:false});assert.equal(ctx.g.tiles['0,0'].consecratedUntilRound,undefined);assert.equal(ctx.g.tiles['0,0'].consecratedBy,undefined);assert.equal(ctx.g.tiles['0,0'].blightHealingSuppressedRound33624,'3');
 assert.equal(ctx.g.tiles['1,0'].consecratedUntilRound,4);assert.equal(ctx.g.tiles['1,0'].blightHealingSuppressedRound33624,undefined);assert.equal(ctx.g.tiles['2,0'],undefined);assert.deepEqual(protectedState(ctx.g),before);
});
test('legacy absence of a Consecrated authority or Blight stamp cannot erase a local pending effect',()=>{
 const ctx=harness(),source=clone(ctx.g),tile=clone(ctx.g.tiles['0,0']);delete source.tiles['0,0'].consecratedAuthority33627;delete source.tiles['0,0'].consecratedUntilRound;delete source.tiles['0,0'].consecratedBy;delete source.tiles['0,0'].blightHealingSuppressedRound33624;
 ctx.mpHandleMessage(packet(ctx,{source}));assert.deepEqual(clone(ctx.g.tiles['0,0']),tile);
});
test('a closure-only STATE copies scoped tombstones and clears only the exact local active token',()=>{
 const ctx=harness(),before=protectedState(ctx.g),source=clone(ctx.g);source.gold=0;source.heroKills3259.Aldric=0;source.activeEncounter320=null;source.encounterCompletionAuthority33627={version:'3.36.27',scope:scope(source),closed:{'ENC-ACTIVE':{token:'ENC-ACTIVE',id:'EN008'}}};
 ctx.mpHandleMessage(packet(ctx,{tag:'encounterClosedOnly33627',source}));assert.equal(ctx.delegated.length,0);assert.equal(ctx.g.activeEncounter320,null);assert.deepEqual(clone(ctx.g.encounterCompletionAuthority33627),source.encounterCompletionAuthority33627);assert.deepEqual(protectedState(ctx.g),before);
});
test('closure metadata for a different token never clears the current Encounter or applies unrelated source state',()=>{
 const ctx=harness(),source=clone(ctx.g),active=clone(ctx.g.activeEncounter320),before=protectedState(ctx.g);source.activeEncounter320={token:'UNRELATED',id:'EN019'};source.encounterCompletionAuthority33627={version:'3.36.27',scope:scope(source),closed:{'OLD-TOKEN':{token:'OLD-TOKEN'}}};
 ctx.mpHandleMessage(packet(ctx,{tag:'encounterClosedOnly33627',source}));assert.deepEqual(clone(ctx.g.activeEncounter320),active);assert.deepEqual(protectedState(ctx.g),before);assert.equal(ctx.delegated.length,0);
});
test('an Encounter authority from another epoch is ignored even inside a currently scoped packet',()=>{
 const ctx=harness(),source=clone(ctx.g),active=clone(ctx.g.activeEncounter320);source.encounterCompletionAuthority33627={scope:{...scope(source),epoch:3},closed:{'ENC-ACTIVE':{token:'ENC-ACTIVE'}}};ctx.mpHandleMessage(packet(ctx,{tag:'encounterClosedOnly33627',source}));assert.equal(ctx.g.encounterCompletionAuthority33627,undefined);assert.deepEqual(clone(ctx.g.activeEncounter320),active);assert.equal(ctx.delegated.length,0);
});
test('stale tagged packets are consumed without mutation, legacy delegation or revision rollback',()=>{
 for(const tag of ['statusOnly33627','encounterClosedOnly33627']){const ctx=harness(),before=clone(ctx.g),source=clone(ctx.g);source.statusActivation33627={start:'STALE'};source.encounterCompletionAuthority33627={scope:scope(source),closed:{'ENC-ACTIVE':{token:'ENC-ACTIVE'}}};const message=packet(ctx,{tag,revision:9,source});assert.equal(ctx.ascStatus33627.applyRoomMetadata(message),true);ctx.mpHandleMessage(message);assert.deepEqual(clone(ctx.g),before);assert.equal(ctx.mpRoomRevision,10);assert.equal(ctx.delegated.length,0)}
});
test('mismatched campaign instance, Quest or epoch tags are consumed and cannot overwrite the current game',()=>{
 for(const mutate of [g=>g.campaign.instanceId32537='OTHER',g=>g.campaign.currentQuest='Q004',g=>g.questTransitionAuthority33626.epoch=5]){const ctx=harness(),before=clone(ctx.g),source=clone(ctx.g);mutate(source);source.gold=0;ctx.mpHandleMessage(packet(ctx,{revision:20,source}));assert.deepEqual(clone(ctx.g),before);assert.equal(ctx.mpRoomRevision,10);assert.equal(ctx.delegated.length,0)}
});
test('an active phase worker suppresses tagged metadata without exposing it to legacy snapshot replacement',()=>{
 const ctx=harness(),before=clone(ctx.g),source=clone(ctx.g);ctx.workerSuppress=true;source.statusActivation33627={start:'BEFORE-WORKER'};ctx.mpHandleMessage(packet(ctx,{source}));assert.deepEqual(clone(ctx.g),before);assert.equal(ctx.mpRoomRevision,10);assert.equal(ctx.suppressCalls,1);assert.equal(ctx.delegated.length,0);
});
test('ordinary STATE delegates unchanged, while foreign-room and non-SERVER tags are not consumed by this adapter',()=>{
 const ctx=harness(),source=clone(ctx.g);source.gold=123;const ordinary=packet(ctx,{source});delete ordinary.statusOnly33627;assert.equal(ctx.ascStatus33627.applyRoomMetadata(ordinary),false);assert.equal(ctx.mpHandleMessage(ordinary),'legacy-result');assert.equal(ctx.delegated.length,1);assert.equal(ctx.g.gold,123);
 for(const mutate of [m=>m.room='OTHER-ROOM',m=>m.from='OTHER-PLAYER',m=>m.type='ROOM_STATE']){const other=harness(),message=packet(other);mutate(message);const before=clone(other.g);assert.equal(other.ascStatus33627.applyRoomMetadata(message),false);assert.equal(other.mpHandleMessage(message),'legacy-result');assert.equal(other.delegated.length,1);assert.deepEqual(clone(other.g),before)}
});
test('an offline or unbound game does not treat room-tagged packets as its activation authority',()=>{
 for(const mutate of [ctx=>ctx.mpMode='local',ctx=>ctx.mpRoom='']){const ctx=harness(),message=packet(ctx),before=clone(ctx.g);mutate(ctx);assert.equal(ctx.ascStatus33627.applyRoomMetadata(message),false);assert.deepEqual(clone(ctx.g),before);assert.equal(ctx.mpRoomRevision,10)}
});
