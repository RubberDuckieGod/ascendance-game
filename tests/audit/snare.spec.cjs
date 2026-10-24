const {test,expect}=require('@playwright/test');

async function open(page){
 page.snareErrors=[];page.on('pageerror',e=>page.snareErrors.push(e.message));
 page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascSnare33622);
}
function prepareSnare(){
 const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};
 const tile=structuredClone(origin);tile.id='L006';tile.name='Snare Test Glade';tile.edges={N:true,E:true,S:true,W:true};tile.enemies=[];
 delete tile.snare32526;g.tiles['1,0']=tile;
 const h=runtimeHeroState('Rowan');h.hp=Math.max(1,h.hp);h.actions=3;
 h.hand=[{...HERO_RUNTIME_CARDS.Rowan.find(c=>c.id==='H005-009'),uid:'snare-regression-card'}];
 h.deck=h.deck.filter(c=>c.id!=='H005-009');h.discard=[];render();
}
async function solo(page){await open(page);await page.evaluate(prepare=>{init('Q003',['Rowan']);(0,eval)('('+prepare+')')();lobbyClose()},prepareSnare.toString())}
async function place(page){
 const result=await page.evaluate(async()=>playExtraCard(runtimeHeroState('Rowan').hand.find(c=>c.uid==='snare-regression-card')));
 expect(result?.error).toBeFalsy();await expect(page.locator('.ascSnareMarker33622 svg')).toHaveCount(1);await expect(page.locator('.ascSnareMarker33622')).toBeVisible();
}
test('Set Snare: actual card spends one Action, discards once, targets a connected Location and renders a graphic',async({page},info)=>{
 await solo(page);const before=await page.evaluate(()=>runtimeHeroState('Rowan').hand.map(c=>c.uid).sort());await place(page);
 const actual=await page.evaluate(()=>({actions:runtimeHeroState('Rowan').actions,hand:runtimeHeroState('Rowan').hand.map(c=>c.uid).sort(),discard:runtimeHeroState('Rowan').discard.filter(c=>c.uid==='snare-regression-card').length,owner:g.tiles['1,0'].snare32526.owner,ownTrap:!!g.tiles['0,0'].snare32526}));
 const expected={actions:2,hand:before.filter(id=>id!=='snare-regression-card'),discard:1,owner:'Rowan',ownTrap:false};
 await info.attach('snare-placement',{body:JSON.stringify({expected,actual}),contentType:'application/json'});
 expect(actual).toEqual(expected);expect(page.snareErrors).toEqual([]);
 await page.locator('.ascSnareMarker33622').scrollIntoViewIfNeeded();await info.attach('snare-map',{body:await page.screenshot(),contentType:'image/png'});
});
for(const pathway of ['encounter','quest','legacy'])test(`Set Snare: ${pathway} spawn triggers first Enemy only, with exact damage and no ghost marker`,async({page},info)=>{
 await solo(page);await place(page);
 const actual=await page.evaluate(pathway=>{
  const t=g.tiles['1,0'];
  if(pathway==='encounter')encSpawn320('E001',2,{x:1,y:0},'snare-regression');
  if(pathway==='quest')spawnQuestEnemies(t,[['E001',2]]);
  if(pathway==='legacy'){spawn('E001',{x:1,y:0});spawn('E001',{x:1,y:0})}
  render();return {enemies:t.enemies.map(e=>({hp:e.hp,rooted:e.conditions.includes('Rooted')})),armed:!!t.snare32526,pieces:(g.heroCreatedPieces3294||[]).filter(p=>p.type==='snare').length};
 },pathway);
 await info.attach('spawn-measurement',{body:JSON.stringify({expected:{firstHp:4,firstRooted:true,secondHp:6,secondRooted:false,armed:false,pieces:0},actual}),contentType:'application/json'});
 expect(actual.enemies).toEqual([{hp:4,rooted:true},{hp:6,rooted:false}]);expect(actual.armed).toBe(false);expect(actual.pieces).toBe(0);
 await expect(page.locator('.ascSnareMarker33622')).toHaveCount(0);expect(page.snareErrors).toEqual([]);
});
test('Set Snare: does not hit an existing Enemy; forced movement entering later triggers once',async({page})=>{
 await solo(page);
 await page.evaluate(()=>{const e=encounterEnemy320('E001');g.tiles['0,0'].enemies=[e];g.tiles['1,0'].enemies=[encounterEnemy320('E001')];render()});
 await place(page);expect(await page.evaluate(()=>g.tiles['1,0'].enemies[0].hp)).toBe(6);
 const actual=await page.evaluate(()=>{const from=g.tiles['0,0'],e=from.enemies[0];moveDamagedEnemyPrompt('Rowan',{name:'Forced movement'},[{en:e,t:from}],1);render();return {source:from.enemies.length,target:g.tiles['1,0'].enemies.map(e=>({hp:e.hp,rooted:e.conditions.includes('Rooted')})),armed:!!g.tiles['1,0'].snare32526}});
 expect(actual).toEqual({source:0,target:[{hp:6,rooted:false},{hp:4,rooted:true}],armed:false});expect(page.snareErrors).toEqual([]);
});
test('Set Snare: lethal spawn credits its owner once and survives save/load without a stale graphic',async({page})=>{
 await solo(page);await place(page);
 await page.evaluate(()=>{const saved=serializableGameState();init('Q003',['Rowan']);applySerializedGameState(saved);render()});
 await expect(page.locator('.ascSnareMarker33622 svg')).toHaveCount(1);
 const actual=await page.evaluate(()=>{const before=Number(g.heroKills3259?.Rowan||0);encSpawn320('E001',1,{x:1,y:0},'snare-lethal',5);render();const consumed=serializableGameState();applySerializedGameState(consumed);render();render();return {kills:Number(g.heroKills3259?.Rowan||0)-before,enemies:g.tiles['1,0'].enemies.length,armed:!!g.tiles['1,0'].snare32526,pieces:g.heroCreatedPieces3294.filter(p=>p.type==='snare').length}});
 expect(actual).toEqual({kills:1,enemies:0,armed:false,pieces:0});await expect(page.locator('.ascSnareMarker33622')).toHaveCount(0);expect(page.snareErrors).toEqual([]);
});
test('Set Snare: no connected target leaves both Action and card unspent',async({page})=>{
 await solo(page);await page.evaluate(()=>{delete g.tiles['1,0'];render()});
 const actual=await page.evaluate(async()=>{const h=runtimeHeroState('Rowan'),before=JSON.stringify({actions:h.actions,hand:h.hand,discard:h.discard});const result=await playExtraCard(h.hand.find(c=>c.uid==='snare-regression-card'));return {error:result.error,before,after:JSON.stringify({actions:h.actions,hand:h.hand,discard:h.discard})}});
 expect(actual.error).toBeTruthy();expect(actual.after).toBe(actual.before);expect(page.snareErrors).toEqual([]);
});

test('Set Snare: a snared spawned Enemy cannot pursue during its next activation, then Rooted expires',async({page})=>{
 await solo(page);await place(page);
 await page.evaluate(()=>{for(const t of Object.values(g.tiles))t.enemies=[];encSpawn320('E001',1,{x:1,y:0},'snare-pursuit');g.tiles['1,0'].enemies[0].range=0;g.tiles['1,0'].enemies[0].move=1;render()});
 const first=await page.evaluate(async()=>{
  const en=g.tiles['1,0'].enemies[0],before=runtimeHeroState('Rowan').hp;
  const oldRandom=Math.random;Math.random=()=>0;
  const decline=setInterval(()=>{const el=document.querySelector('#declineReaction');if(el&&!document.querySelector('#reactionOverlay').classList.contains('hidden'))el.click()},10);
  try{await endTurn()}finally{Math.random=oldRandom;clearInterval(decline)}
  const where=findE(en);return {hp:en.hp,heroHp:runtimeHeroState('Rowan').hp,before,pos:where?{x:where.x,y:where.y}:null,rooted:en.conditions.includes('Rooted')};
 });
 expect(first.hp).toBe(4);expect(first.heroHp).toBe(first.before);expect(first.pos).toEqual({x:1,y:0});expect(first.rooted).toBe(false);expect(page.snareErrors).toEqual([]);
});

async function nativeRoom(browser){
 const contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage())),code='SNARE'+Date.now()+Math.floor(Math.random()*10000);
 for(const p of pages)await open(p);
 await pages[0].evaluate(({code,prepare})=>{const old=init;init=function(){const result=old.apply(this,arguments);(0,eval)('('+prepare+')')();return result};init('Q003',['Rowan']);lobbySetMultiplayerControls('remote',code,'Rowan');mpFreshNewGame32529=true;mpConnect()},{code,prepare:prepareSnare.toString()});
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Rowan'));
 await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);
 await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'));
 for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
 await pages[0].evaluate(()=>partyStart32716());await pages[0].waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
 await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
 return {contexts,pages,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
}
test('Set Snare: two actual clients synchronize placement, spawn damage, Rooted and graphic removal',async({browser},info)=>{
 test.setTimeout(45000);const room=await nativeRoom(browser),[a,b]=room.pages;
 try{
  await place(a);await expect(b.locator('.ascSnareMarker33622 svg')).toHaveCount(1);
  await a.evaluate(()=>{spawnQuestEnemies(g.tiles['1,0'],[['E001',2]]);render();mpScheduleState()});
  for(const p of [a,b]){
   await expect.poll(()=>p.evaluate(()=>g.tiles['1,0'].enemies.map(e=>({hp:e.hp,rooted:e.conditions.includes('Rooted')})))).toEqual([{hp:4,rooted:true},{hp:6,rooted:false}]);
   await expect(p.locator('.ascSnareMarker33622')).toHaveCount(0);expect(p.snareErrors).toEqual([]);
  }
  await info.attach('native-snare-effects',{body:JSON.stringify(await Promise.all(room.pages.map(p=>p.evaluate(()=>({actions:heroActionCount('Rowan'),armed:!!g.tiles['1,0'].snare32526,enemies:g.tiles['1,0'].enemies.map(e=>({id:e.roomEnemyId3301,hp:e.hp,conditions:e.conditions}))}))))),contentType:'application/json'});
 }finally{await room.close()}
});

test('Set Snare: multiplayer lethal entry credits Rowan once and a stale peer cannot restore the trap or erase the kill',async({browser})=>{
 test.setTimeout(45000);const room=await nativeRoom(browser),[a,b]=room.pages;
 try{
  await place(a);const before=await a.evaluate(()=>Number(g.heroKills3259?.Rowan||0));
  const stale=await b.evaluate(()=>serializableGameState());
  await a.evaluate(()=>{encSpawn320('E001',1,{x:1,y:0},'snare-native-lethal',5);render();mpScheduleState()});
  for(const p of [a,b]){await expect.poll(()=>p.evaluate(()=>Number(g.heroKills3259?.Rowan||0))).toBe(before+1);await expect(p.locator('.ascSnareMarker33622')).toHaveCount(0)}
  await b.evaluate(stale=>{window.snareStalePackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){snareStalePackets.push(m);return before.apply(this,arguments)};mpSend('STATE',stale);mpSend('REQUEST_STATE',{})},stale);
  await b.waitForFunction(()=>snareStalePackets.some(m=>m.type==='ROOM_STATE'));
  const committed=await b.evaluate(()=>snareStalePackets.find(m=>m.type==='ROOM_STATE').data.game);expect(committed.heroKills3259.Rowan).toBe(before+1);expect(committed.tiles['1,0'].snare32526).toBeUndefined();
  for(const p of [a,b]){await expect.poll(()=>p.evaluate(()=>Number(g.heroKills3259?.Rowan||0))).toBe(before+1);expect(await p.evaluate(()=>g.tiles['1,0'].enemies.length)).toBe(0);expect(await p.evaluate(()=>!!g.tiles['1,0'].snare32526)).toBe(false)}
 }finally{await room.close()}
});
