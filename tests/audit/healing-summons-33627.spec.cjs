const {test,expect}=require('@playwright/test');

async function open(page){
 page.healSummonErrors=[];page.on('pageerror',e=>page.healSummonErrors.push(e.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascHealingSummons33627);
}
function prepare({hero,id}){
 const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};
 origin.visited=true;origin.enc=false;origin.firstVisitTriggered=true;origin.firstVisitUsed=true;origin.reveal='None.';origin.ongoing='None.';origin.special='None.';origin.traits=[];
 const tile=structuredClone(origin);tile.id='L006';tile.name='Healing Summons Test Glade';tile.enemies=[];g.tiles['1,0']=tile;
 const b=runtimeHeroState(hero);b.actions=3;b.hp=5;b.maxHp=10;b.x=0;b.y=0;b.conditions=[];b.discard=[];
 b.hand=[{...HERO_RUNTIME_CARDS[hero].find(c=>c.id===id),uid:'healing-summon-card'}];b.deck=b.deck.filter(c=>c.id!==id);
 g.equipped[hero]={Weapon:null,Armor:null,Accessory:[]};
 if(g.partyHeroes.includes('Aldric')){g.hp=5;g.hero.x=0;g.hero.y=0;g.conditions=[];g.equipped.Aldric={Weapon:null,Armor:null,Accessory:[]}}
 if(hero==='Thorne'){const en=encounterEnemy320('E001');en.name='Spirit Wolf Test Enemy';en.hp=6;en.maxHp=6;en.armor=9;origin.enemies=[en]}
 render();lobbyClose();
}
async function solo(page,hero,id,party=[hero,'Aldric']){
 await open(page);await page.evaluate(({hero,id,party,prepare})=>{init('Q003',party);(0,eval)('('+prepare+')')({hero,id})},{hero,id,party,prepare:prepare.toString()});
}
async function play(page){return page.evaluate(async()=>playExtraCard(runtimeHeroState(controlledHero()).hand.find(c=>c.uid==='healing-summon-card')))}
for(const recipient of ['Elara','Aldric'])test(`Shepherd the Faithful: acting Elara chooses ${recipient} for the exact 1 Health after moving both Heroes`,async({page},info)=>{
 await solo(page,'Elara','H003-016');const prompts=[];
 page.on('dialog',d=>{prompts.push(d.message());return d.accept(d.message().includes('recovers 1 Health')?(recipient==='Elara'?'1':'2'):'1')});
 const result=await play(page);expect(result?.error).toBeFalsy();
 const actual=await page.evaluate(()=>({elara:{x:runtimeHeroState('Elara').x,y:runtimeHeroState('Elara').y,hp:runtimeHeroState('Elara').hp,actions:runtimeHeroState('Elara').actions},aldric:{...g.hero,hp:g.hp},discard:runtimeHeroState('Elara').discard.filter(c=>c.uid==='healing-summon-card').length,hand:runtimeHeroState('Elara').hand.some(c=>c.uid==='healing-summon-card')}));
 await info.attach('authored-shepherd-effects',{body:JSON.stringify({recipient,result,actual,prompts}),contentType:'application/json'});
 expect(actual.elara).toEqual({x:1,y:0,hp:recipient==='Elara'?6:5,actions:2});expect(actual.aldric.x).toBe(1);expect(actual.aldric.y).toBe(0);expect(actual.aldric.hp).toBe(recipient==='Aldric'?6:5);expect(actual.discard).toBe(1);expect(actual.hand).toBe(false);
 expect(prompts.filter(p=>p.includes('recovers 1 Health'))).toHaveLength(1);expect(page.healSummonErrors).toEqual([]);
});
test('Shepherd the Faithful: canceling the healing choice preserves positions, Health, Actions and card',async({page})=>{
 await solo(page,'Elara','H003-016');page.on('dialog',d=>d.message().includes('recovers 1 Health')?d.dismiss():d.accept('1'));
 const before=await page.evaluate(()=>JSON.stringify({elara:runtimeHeroState('Elara'),hero:g.hero,hp:g.hp}));const result=await play(page);
 expect(result).toEqual({cancelled:true});expect(await page.evaluate(()=>JSON.stringify({elara:runtimeHeroState('Elara'),hero:g.hero,hp:g.hp}))).toBe(before);expect(page.healSummonErrors).toEqual([]);
});
test('Shepherd the Faithful: a one-Hero party has no legal ally and spends nothing',async({page})=>{
 await solo(page,'Elara','H003-016',['Elara']);const before=await page.evaluate(()=>JSON.stringify(runtimeHeroState('Elara')));const result=await play(page);
 expect(result.error).toBeTruthy();expect(await page.evaluate(()=>JSON.stringify(runtimeHeroState('Elara')))).toBe(before);
});
for(const blocked of ['Elara','Aldric'])test(`Shepherd the Faithful: Rooted ${blocked} prevents both moves and spending`,async({page})=>{
 await solo(page,'Elara','H003-016');page.on('dialog',d=>d.accept('1'));await page.evaluate(blocked=>{g.round=2;(blocked==='Aldric'?g.conditions:runtimeHeroState(blocked).conditions).push('Rooted');render()},blocked);
 const snapshot=()=>({actions:runtimeHeroState('Elara').actions,x:runtimeHeroState('Elara').x,allyX:g.hero.x,hp:runtimeHeroState('Elara').hp,allyHp:g.hp,hand:runtimeHeroState('Elara').hand.map(c=>c.uid),discard:runtimeHeroState('Elara').discard.map(c=>c.uid)}),before=await page.evaluate(snapshot);
 const result=await play(page);expect(result.error).toContain('cannot Move');expect(await page.evaluate(snapshot)).toEqual(before);expect(before.actions).toBe(3);expect(before.x).toBe(0);expect(before.allyX).toBe(0);
});
test('Spirit Wolf: direct 2 damage, exact cost, one discarded card and visible token after migration',async({page},info)=>{
 await solo(page,'Thorne','H007-006');expect(await page.evaluate(()=>g.heroCreatedPiecesMigrated3294)).toBe(true);
 const result=await play(page);expect(result?.error).toBeFalsy();
 const actual=await page.evaluate(()=>({actions:runtimeHeroState('Thorne').actions,enemyHp:g.tiles['0,0'].enemies[0].hp,discard:runtimeHeroState('Thorne').discard.filter(c=>c.uid==='healing-summon-card').length,pieces:g.heroCreatedPieces3294.filter(p=>p.type==='wolf').map(p=>({owner:p.owner,locationKey:p.locationKey,hp:p.hp}))}));
 expect(actual).toEqual({actions:1,enemyHp:4,discard:1,pieces:[{owner:'Thorne',locationKey:'0,0',hp:3}]});await expect(page.locator('.ascSpiritWolfMarker33627 svg')).toHaveCount(1);await expect(page.locator('.ascSpiritWolfMarker33627')).toBeVisible();
 await info.attach('spirit-wolf-effects',{body:JSON.stringify({expectedDamage:2,actual,result}),contentType:'application/json'});expect(page.healSummonErrors).toEqual([]);
});
test('Spirit Wolf: remains at its placed Location through owner movement, renders and local save/load until defeated',async({page})=>{
 await solo(page,'Thorne','H007-006');await play(page);
 await page.evaluate(()=>{enterHeroLocation('Thorne',1,0,'Audit owner move');render();render();const saved=serializableGameState();applySerializedGameState(saved);render()});
 expect(await page.evaluate(()=>({ownerX:runtimeHeroState('Thorne').x,pieces:g.heroCreatedPieces3294.filter(p=>p.type==='wolf').map(p=>p.locationKey)}))).toEqual({ownerX:1,pieces:['0,0']});await expect(page.locator('.ascSpiritWolfMarker33627')).toHaveCount(1);
 await page.locator('#defeatSpiritWolf33627').click();await expect(page.locator('.ascSpiritWolfMarker33627')).toHaveCount(0);
 await page.evaluate(()=>{const saved=serializableGameState();applySerializedGameState(saved);render();render()});
 expect(await page.evaluate(()=>({legacy:!!runtimeHeroState('Thorne').spiritWolf32526,pieces:g.heroCreatedPieces3294.filter(p=>p.type==='wolf').length}))).toEqual({legacy:false,pieces:0});expect(page.healSummonErrors).toEqual([]);
});
async function nativeRoom(browser,hero,id,configure=null){
 const contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage())),code='HEALSUMMON'+Date.now()+Math.floor(Math.random()*10000);
 for(const p of pages)await open(p);
 await pages[0].evaluate(({code,hero,id,prepare,configure})=>{const old=init;init=function(){const result=old.apply(this,arguments);(0,eval)('('+prepare+')')({hero,id});if(configure)(0,eval)('('+configure+')')();return result};init('Q003',[hero]);lobbySetMultiplayerControls('remote',code,hero);mpFreshNewGame32529=true;mpConnect()},{code,hero,id,prepare:prepare.toString(),configure:configure?.toString()||null});
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero===mpRole));
 await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);
 await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'));
 for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
 await pages[0].evaluate(()=>partyStart32716());await pages[0].waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
 await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(hero=>ascRoomTurn33618.state()?.turnHero===hero,hero);
 return {pages,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
}
test('Shepherd the Faithful: two native clients share only the acting Hero’s chosen recipient, movement, cost and discard',async({browser},info)=>{
 test.setTimeout(45000);const room=await nativeRoom(browser,'Elara','H003-016'),[a,b]=room.pages,actingPrompts=[],otherPrompts=[];
 a.on('dialog',d=>{actingPrompts.push(d.message());return d.accept(d.message().includes('recovers 1 Health')?'2':'1')});b.on('dialog',d=>{otherPrompts.push(d.message());return d.dismiss()});
 try{const result=await play(a);expect(result?.error).toBeFalsy();for(const page of room.pages){await expect.poll(()=>page.evaluate(()=>({elaraX:runtimeHeroState('Elara').x,allyX:g.hero.x,elaraHp:runtimeHeroState('Elara').hp,allyHp:g.hp,actions:heroActionCount('Elara'),discard:runtimeHeroState('Elara').discard.filter(c=>c.uid==='healing-summon-card').length}))).toEqual({elaraX:1,allyX:1,elaraHp:5,allyHp:6,actions:2,discard:1});expect(page.healSummonErrors).toEqual([])}expect(otherPrompts).toEqual([]);expect(actingPrompts.some(p=>p.includes('recovers 1 Health'))).toBe(true);await info.attach('two-client-healing',{body:JSON.stringify({result,actingPrompts,otherPrompts}),contentType:'application/json'})}finally{await room.close()}
});
test('Spirit Wolf: two native clients share placement and exact damage, and removal cannot revive after save/load',async({browser},info)=>{
 test.setTimeout(45000);const room=await nativeRoom(browser,'Thorne','H007-006'),[a,b]=room.pages;
 try{const result=await play(a);expect(result?.error).toBeFalsy();for(const page of room.pages){await expect(page.locator('.ascSpiritWolfMarker33627')).toHaveCount(1);await expect.poll(()=>page.evaluate(()=>({hp:g.tiles['0,0'].enemies[0].hp,actions:heroActionCount('Thorne'),pieces:g.heroCreatedPieces3294.filter(p=>p.type==='wolf').length}))).toEqual({hp:4,actions:1,pieces:1})}await a.locator('#defeatSpiritWolf33627').click();for(const page of room.pages){await expect(page.locator('.ascSpiritWolfMarker33627')).toHaveCount(0);await page.evaluate(()=>{applySerializedGameState(serializableGameState());render()});expect(await page.evaluate(()=>!!runtimeHeroState('Thorne').spiritWolf32526)).toBe(false);expect(page.healSummonErrors).toEqual([])}await info.attach('two-client-wolf',{body:JSON.stringify(result),contentType:'application/json'})}finally{await room.close()}
});
test('Shepherd: final Action queues one actor-owned First Visit, preserves both Heroes through peer reconnect, then commits one Encounter reward',async({browser},info)=>{
 test.setTimeout(60000);
 const configure=()=>{const t=g.tiles['1,0'];t.visited=false;t.enc=true;t.encounterLevel=1;g.encDeck=[{...ENCS.find(c=>c.id==='EN009')}];g.encDiscard=[]};
 const room=await nativeRoom(browser,'Elara','H003-016',configure),[a,b]=room.pages;
 a.on('dialog',d=>d.accept(d.message().includes('recovers 1 Health')?'2':'1'));b.on('dialog',d=>d.dismiss());
 try{
  await a.evaluate(()=>ascRoomTurn33618.adjust(-2,{reason:'entry-final-action-test'}));for(const page of room.pages)await expect.poll(()=>page.evaluate(()=>heroActionCount('Elara'))).toBe(1);
  const beforeGold=await a.evaluate(()=>g.gold),result=await play(a);expect(result.error).toBeFalsy();
  await a.waitForFunction(()=>pEnc?.roomAuthority3305&&pEnc.card?.id==='EN009');
  for(const page of room.pages)await expect.poll(()=>page.evaluate(()=>({actorX:runtimeHeroState('Elara').x,allyX:g.hero.x,allyHp:g.hp,actions:heroActionCount('Elara'),round:g.round}))).toEqual({actorX:1,allyX:1,allyHp:6,actions:0,round:1});
  expect(await a.evaluate(()=>({hero:pEnc.roomHero3300,tile:pEnc.firstVisitTileKey,visited:g.tiles['1,0'].visited,deck:g.encDeck.filter(c=>c.id==='EN009').length}))).toEqual({hero:'Elara',tile:'1,0',visited:false,deck:0});
  await b.evaluate(()=>mpSocket.close());await b.waitForFunction(()=>!mpConnected());await b.evaluate(()=>mpConnect());await b.waitForFunction(()=>mpJoinReady&&mpConnected());
  await expect.poll(()=>b.evaluate(()=>({actorX:runtimeHeroState('Elara').x,allyX:g.hero.x,allyHp:g.hp,round:g.round}))).toEqual({actorX:1,allyX:1,allyHp:6,round:1});
  await a.locator('#resolveEnc').click();
  for(const page of room.pages){await expect.poll(()=>page.evaluate(()=>({gold:g.gold,visited:g.tiles['1,0'].visited,count:g.encDiscard.filter(c=>c.id==='EN009').length,entry:!!g.healingEntries33627?.Elara}))).toEqual({gold:beforeGold+10,visited:true,count:1,entry:false});expect(page.healSummonErrors).toEqual([])}
  expect(await a.evaluate(()=>triggerFirstVisitIfEligible(g.tiles['1,0'],1,0,'Elara'))).toBe(false);
  expect(await a.evaluate(()=>g.gold)).toBe(beforeGold+10);expect(await a.evaluate(()=>g.encDiscard.filter(c=>c.id==='EN009').length)).toBe(1);
  await info.attach('canonical-card-entry',{body:JSON.stringify({result,final:await a.evaluate(()=>({round:g.round,visited:g.tiles['1,0'].visited,gold:g.gold,encounters:g.encDiscard.filter(c=>c.id==='EN009').length}))}),contentType:'application/json'});
 }finally{await room.close()}
});
test('Prayer of Restoration: exactly two eligible Heroes both receive their own healing choice',async({page})=>{
 await solo(page,'Elara','H003-013');await page.evaluate(()=>runtimeHeroState('Elara').supportInnateRound=g.round);page.on('dialog',d=>d.accept('1'));
 const result=await play(page);expect(result.error).toBeFalsy();expect(await page.evaluate(()=>({elara:runtimeHeroState('Elara').hp,aldric:g.hp,actions:heroActionCount('Elara'),discard:runtimeHeroState('Elara').discard.filter(c=>c.uid==='healing-summon-card').length}))).toEqual({elara:6,aldric:6,actions:2,discard:1});
});
test('Prayer of Restoration: Consecrated ground allows one chosen Hero both recovery and one selected Condition removal',async({page})=>{
 await solo(page,'Elara','H003-013');await page.evaluate(()=>{runtimeHeroState('Elara').supportInnateRound=g.round;runtimeHeroState('Elara').conditions=['Bleeding','Poisoned'];g.tiles['0,0'].consecratedUntilRound=g.round+1});
 page.on('dialog',d=>d.type()==='confirm'?d.accept():d.accept('1'));const result=await play(page);expect(result.error).toBeFalsy();
 expect(await page.evaluate(()=>({elara:runtimeHeroState('Elara').hp,aldric:g.hp,conditions:runtimeHeroState('Elara').conditions,actions:heroActionCount('Elara')}))).toEqual({elara:7,aldric:7,conditions:['Poisoned'],actions:2});
});
test('Divine Communion: every Hero chooses two distinct options on Consecrated ground',async({page})=>{
 await solo(page,'Elara','H003-014');await page.evaluate(()=>{runtimeHeroState('Elara').supportInnateRound=g.round;g.tiles['0,0'].consecratedUntilRound=g.round+1});
 page.on('dialog',d=>d.accept(d.message().includes('second different')?'2':'1'));const result=await play(page);expect(result.error).toBeFalsy();
 expect(await page.evaluate(()=>({elara:runtimeHeroState('Elara').hp,aldric:g.hp,elaraInspired:runtimeHeroState('Elara').conditions.includes('Inspired'),allyInspired:g.conditions.includes('Inspired'),actions:heroActionCount('Elara')}))).toEqual({elara:8,aldric:8,elaraInspired:true,allyInspired:true,actions:1});
});
test('Guided Path: movement, one chosen Condition removal and Consecrated card draw all resolve',async({page})=>{
 await solo(page,'Elara','H003-015');await page.evaluate(()=>{const h=runtimeHeroState('Elara');h.conditions=['Bleeding','Poisoned'];h.deck=[{id:'H003-001',uid:'guided-draw',name:'Radiant Strike',cost:1,speed:'Action',category:'Attack'}];g.tiles['1,0'].consecratedUntilRound=g.round+1});
 page.on('dialog',d=>d.accept(d.message().includes('effect after moving')?'2':'1'));const result=await play(page);expect(result.error).toBeFalsy();
 expect(await page.evaluate(()=>({x:runtimeHeroState('Elara').x,hp:runtimeHeroState('Elara').hp,conditions:runtimeHeroState('Elara').conditions,drawn:runtimeHeroState('Elara').hand.some(c=>c.uid==='guided-draw'),actions:heroActionCount('Elara')}))).toEqual({x:1,hp:5,conditions:['Poisoned'],drawn:true,actions:2});
});
for(const id of ['H003-015','H003-017'])test(`${id}: canceled movement preserves the card, Actions and all later effects`,async({page})=>{
 await solo(page,'Elara',id);page.on('dialog',d=>d.dismiss());const before=await page.evaluate(()=>JSON.stringify({state:runtimeHeroState('Elara'),tiles:g.tiles,hp:g.hp}));expect(await play(page)).toEqual({cancelled:true});expect(await page.evaluate(()=>JSON.stringify({state:runtimeHeroState('Elara'),tiles:g.tiles,hp:g.hp}))).toBe(before);
});
test('Wings of Mercy: ignores Engagement, heals the selected destination ally and Consecrates the destination',async({page})=>{
 await solo(page,'Elara','H003-017');await page.evaluate(()=>{g.hero.x=1;g.tiles['0,0'].enemies=[encounterEnemy320('E001')]});page.on('dialog',d=>d.accept('1'));const result=await play(page);expect(result.error).toBeFalsy();
 expect(await page.evaluate(()=>({x:runtimeHeroState('Elara').x,hp:runtimeHeroState('Elara').hp,allyHp:g.hp,holy:g.tiles['1,0'].consecratedUntilRound,actions:heroActionCount('Elara')}))).toEqual({x:1,hp:5,allyHp:7,holy:2,actions:1});
});
