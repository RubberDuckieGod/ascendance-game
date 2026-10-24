const {test}=require('node:test');
const assert=require('node:assert/strict');
const traps=require('../snare-rules-33622.js');
const mechanics=require('../mechanics-rules-33621.js');

function fixture(){
 const rowan={hp:9,actions:3,attackOnlyActions:0,x:0,y:0,hand:[{id:'H005-009',uid:'SNARE-CARD-1',name:'Set Snare',cost:1,speed:'Action'}],discard:[]};
 return {round:1,phase:'Hero Phase',partyHeroes:['Rowan'],campaign:{currentQuest:'Q003',downtime:false},extraHeroes:{Rowan:rowan},mechanics33621:{heroes:{Rowan:{}}},tiles:{
  '0,0':{id:'ORIGIN',name:'Origin',edges:{E:true},enemies:[]},
  '1,0':{id:'TARGET',name:'Forest Trail',edges:{W:true,E:true},enemies:[]},
  '2,0':{id:'DISTANT',name:'Distant Woods',edges:{W:true},enemies:[]},
  '0,1':{id:'DISCONNECTED',name:'Unconnected Ruins',edges:{N:true},enemies:[]}
 }};
}
const enemy=(id='EN-1',hp=6)=>({roomEnemyId3301:id,name:'Armored Raider',hp,max:hp,armor:99,conditions:[]});
const place=(g,tileKey='1,0',extra={})=>mechanics.action(g,'Rowan','PLACE_SNARE',{tileKey,cardUid:'SNARE-CARD-1',...extra});
function unchangedAfterError(g,action){const before=structuredClone(g);assert.ok(action().error);assert.deepEqual(g,before)}
function armed(owner='Rowan'){
 const g=fixture();assert.equal(traps.arm(g,'1,0',owner,'TRAP-TEST').error,undefined);return g;
}

test('Set Snare atomically spends its printed general Action, discards the owned card, and arms a visible piece',()=>{
 const g=fixture(),card=g.extraHeroes.Rowan.hand[0],result=place(g);
 assert.equal(result.error,undefined);assert.equal(result.cardId,'H005-009');assert.equal(result.cost,1);
 assert.equal(g.extraHeroes.Rowan.actions,2);assert.deepEqual(g.extraHeroes.Rowan.hand,[]);assert.deepEqual(g.extraHeroes.Rowan.discard,[card]);
 assert.equal(g.tiles['1,0'].snare32526.owner,'Rowan');assert.equal(g.tiles['1,0'].snare32526.id,result.snareId);
 assert.deepEqual(g.heroCreatedPieces3294.map(piece=>[piece.type,piece.owner,piece.locationKey]),[['snare','Rowan','1,0']]);
});

test('Set Snare finds the actual runtime Hero body and preserves unrelated Hero card zones',()=>{
 const g=fixture();g.heroRuntimeStates={Rowan:g.extraHeroes.Rowan};delete g.extraHeroes;
 g.lyra={hp:8,actions:3,hand:[{id:'H005-009',uid:'LYRA-OTHER-CARD',cost:1}],discard:[]};
 const lyra=structuredClone(g.lyra);assert.equal(place(g).error,undefined);
 assert.equal(g.heroRuntimeStates.Rowan.actions,2);assert.deepEqual(g.lyra,lyra);
});

test('Set Snare permits only a different connected revealed Location, with no mutation on refusal',()=>{
 for(const target of ['0,0','2,0','0,1','9,9']){const g=fixture();unchangedAfterError(g,()=>place(g,target))}
 const hidden=fixture();hidden.tiles['1,0'].revealed=false;unchangedAfterError(hidden,()=>place(hidden));
 const closed=fixture();closed.tiles['1,0'].edges.W=false;unchangedAfterError(closed,()=>place(closed));
});

test('Set Snare requires the requested owned hand card and a general Action',()=>{
 const missing=fixture();missing.extraHeroes.Rowan.hand=[];unchangedAfterError(missing,()=>place(missing));
 const discarded=fixture();discarded.extraHeroes.Rowan.discard.push(discarded.extraHeroes.Rowan.hand.pop());unchangedAfterError(discarded,()=>place(discarded));
 const wrongUid=fixture();unchangedAfterError(wrongUid,()=>place(wrongUid,'1,0',{cardUid:'SOMEONE-ELSES-CARD'}));
 const empty=fixture();empty.extraHeroes.Rowan.actions=0;unchangedAfterError(empty,()=>place(empty));
 const attackOnly=fixture();attackOnly.extraHeroes.Rowan.actions=1;attackOnly.extraHeroes.Rowan.attackOnlyActions=1;unchangedAfterError(attackOnly,()=>place(attackOnly));
});

test('Invalid phase, downtime, and Downed placement refuse without spending or arming',()=>{
 for(const configure of [g=>{g.phase='World Phase'},g=>{g.campaign.downtime=true},g=>{g.extraHeroes.Rowan.hp=0}]){
  const g=fixture();configure(g);unchangedAfterError(g,()=>place(g));
 }
});

test('A rejected placement does not initialize an unrelated mechanics ledger',()=>{
 const g=fixture();delete g.mechanics33621;
 unchangedAfterError(g,()=>place(g,'2,0'));
});

test('A Hero outside the participating party cannot place Set Snare or create state',()=>{
 const g=fixture();g.partyHeroes=['Lyra'];delete g.mechanics33621;
 unchangedAfterError(g,()=>place(g));
});

test('An occupied Snare target refuses another placement atomically and keeps its original owner and marker',()=>{
 const g=fixture();traps.arm(g,'1,0','Asha','OLD-TRAP');
 unchangedAfterError(g,()=>place(g));
 assert.equal(g.tiles['1,0'].snare32526.id,'OLD-TRAP');assert.equal(g.tiles['1,0'].snare32526.owner,'Asha');
 assert.equal(g.heroCreatedPieces3294.filter(piece=>piece.type==='snare').length,1);
});

test('The first newly spawned Enemy takes 2 direct damage through Armor and gains Rooted, consuming the Snare once',()=>{
 const g=armed(),before=traps.capture(g),first=enemy(),second=enemy('EN-2');g.tiles['1,0'].enemies.push(first,second);
 const events=traps.resolveEntries(g,before);
 assert.equal(events.length,1);assert.equal(events[0].beforeHp,6);assert.equal(events[0].afterHp,4);assert.equal(events[0].owner,'Rowan');
 assert.equal(first.hp,4);assert.deepEqual(first.conditions,['Rooted']);assert.equal(second.hp,6);assert.deepEqual(second.conditions,[]);
 assert.equal(g.tiles['1,0'].snare32526,undefined);assert.equal(g.heroCreatedPieces3294.some(piece=>piece.type==='snare'),false);
 assert.equal(traps.enter(g,'1,0',first,{fromKey:'0,0'}).triggered,false);assert.equal(first.hp,4);
});

test('A moved Enemy triggers on a genuine entry and existing Rooted is not duplicated',()=>{
 const g=armed(),en=enemy();en.conditions=[{name:'Rooted'}];g.tiles['0,0'].enemies.push(en);
 const before=traps.capture(g);g.tiles['0,0'].enemies=[];g.tiles['1,0'].enemies.push(en);
 const [event]=traps.resolveEntries(g,before);
 assert.equal(event.triggered,true);assert.equal(en.hp,4);assert.deepEqual(en.conditions,[{name:'Rooted'}]);
});

test('Dead entry does not consume an armed Snare or invoke the lethal callback',()=>{
 const g=armed(),en=enemy('DEAD-ENEMY',0);g.tiles['1,0'].enemies.push(en);let kills=0;
 const before=structuredClone(g),result=traps.enter(g,'1,0',en,{fromKey:'0,0',onKilled:()=>kills++});
 assert.equal(result.triggered,false);assert.equal(kills,0);assert.deepEqual(g,before);
});

test('Placing a Snare is not retroactive for an Enemy already present at that Location',()=>{
 const g=fixture(),en=enemy();g.tiles['1,0'].enemies.push(en);const before=traps.capture(g);
 assert.equal(place(g).error,undefined);assert.deepEqual(traps.resolveEntries(g,before),[]);
 assert.equal(traps.enter(g,'1,0',en,{fromKey:'1,0'}).triggered,false);assert.equal(en.hp,6);assert.ok(g.tiles['1,0'].snare32526);
});

test('An Enemy present at placement can leave and later reenter to trigger the Snare',()=>{
 const g=fixture(),en=enemy();g.tiles['1,0'].enemies.push(en);place(g);
 let before=traps.capture(g);g.tiles['1,0'].enemies=[];g.tiles['0,0'].enemies.push(en);assert.deepEqual(traps.resolveEntries(g,before),[]);
 before=traps.capture(g);g.tiles['0,0'].enemies=[];g.tiles['1,0'].enemies.push(en);
 assert.equal(traps.resolveEntries(g,before).length,1);assert.equal(en.hp,4);assert.deepEqual(en.conditions,['Rooted']);
});

test('A lethal entry credits the actual Snare owner once and invokes the tombstone callback once',()=>{
 const g=armed('Asha'),en=enemy('CANONICAL-LETHAL',2),tombstones=[],calls=[];g.tiles['1,0'].enemies.push(en);
 const onKilled=(dead,owner,key)=>{calls.push({owner,key});tombstones.push(dead.roomEnemyId3301)};
 const event=traps.enter(g,'1,0',en,{fromKey:'0,0',onKilled});
 assert.equal(event.killed,true);assert.equal(en.hp,0);assert.equal(event.owner,'Asha');assert.equal(g.heroKills3259.Asha,1);assert.equal(g.heroKills3259.Rowan,undefined);
 assert.equal(en._killOwner32521,'Asha');assert.equal(en._heroKillCredited32519,'Asha');assert.deepEqual(g.tiles['1,0'].enemies,[]);
 assert.deepEqual(tombstones,['CANONICAL-LETHAL']);assert.deepEqual(calls,[{owner:'Asha',key:'1,0'}]);
 traps.enter(g,'1,0',en,{fromKey:'0,0',onKilled});assert.equal(g.heroKills3259.Asha,1);assert.equal(calls.length,1);
});

test('JSON save/load preserves an armed Snare, its present-Enemy baseline, and its one visible marker',()=>{
 const g=fixture(),existing=enemy();g.tiles['1,0'].enemies.push(existing);place(g);
 const restored=JSON.parse(JSON.stringify(g));traps.reconcilePieces(restored);
 assert.equal(restored.tiles['1,0'].snare32526.owner,'Rowan');assert.deepEqual(restored.tiles['1,0'].snare32526.presentEnemyIds,['EN-1']);
 assert.equal(restored.heroCreatedPieces3294.filter(piece=>piece.type==='snare').length,1);
 assert.equal(traps.enter(restored,'1,0',restored.tiles['1,0'].enemies[0],{fromKey:'1,0'}).triggered,false);
 const added=enemy('NEW-AFTER-LOAD');restored.tiles['1,0'].enemies.push(added);assert.equal(traps.enter(restored,'1,0',added).triggered,true);assert.equal(added.hp,4);
});

test('Removing or consuming a Snare cannot retain a ghost marker after save/load or reconciliation',()=>{
 const g=armed();g.heroCreatedPieces3294.push({id:'BONE',type:'bone',owner:'Mordren',locationKey:'0,0'});
 delete g.tiles['1,0'].snare32526;
 const restored=JSON.parse(JSON.stringify(g));traps.reconcilePieces(restored);traps.reconcilePieces(restored);
 assert.deepEqual(restored.heroCreatedPieces3294,[{id:'BONE',type:'bone',owner:'Mordren',locationKey:'0,0'}]);
});
