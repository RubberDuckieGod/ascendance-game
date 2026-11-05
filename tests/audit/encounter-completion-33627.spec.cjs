const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-encounter-rep-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-40000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated Reputation server exited');try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,close,log:()=>log}}
 catch(error){await close();throw error}
}
async function open(page,url,errors){
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.type()==='prompt'?dialog.accept('1'):dialog.type()==='confirm'?dialog.accept():dialog.dismiss());
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascMechanics33621&&window.ascDowntime33622);
 await page.evaluate(()=>{window.reputationPackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){reputationPackets.push(m);return before.apply(this,arguments)}});
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=reputationPackets.length;mpSend('REQUEST_STATE',{});return at});await page.waitForFunction(at=>reputationPackets.slice(at).some(m=>m.type==='ROOM_STATE'),at);
 return page.evaluate(at=>reputationPackets.slice(at).find(m=>m.type==='ROOM_STATE').data.game,at);
}
function prepareEncounter(config){
 const card=structuredClone(ENCS.find(c=>c.id===config.id));
 if(!card)throw Error('Fixture requires the actual authored Encounter');
 g.gold=37;g.reputation=0;g.lootDeck=['LT001'];g.lootDiscard=[];
 for(const hero of partyHeroes())g.inventory[hero]=[];
 const origin=g.tiles['0,0'];origin.enemies=[];origin.special='None';origin.ongoing='None';origin.edges={N:true,E:true,S:true,W:true};
 const token='AUTHORED-REPUTATION-FIXTURE';
 // Restore a legitimate almost-finished combat: every authored enemy remains
 // alive at one Health. Actual Basic Attack callbacks must defeat each one.
 if(config.enemies.length&&config.id!=='EN004'){
  g.activeEncounter320={token,id:card.id,name:card.name,severity:config.severity,origin:{x:0,y:0},reward:card.reward,failure:card.failure};
  origin.enemies=config.enemies.map(id=>({...encounterEnemy320(id),hp:1,encounterToken:token}));
  g.encDiscard.push(card);
 }else{g.activeEncounter320=null;g.encDeck=[card];g.encDiscard=[]}
 render();
}
async function setup(browser,server,online,config){
 const errors=[],contexts=[],pages=[],count=online?2:1,code=`REP${Date.now()}${Math.floor(Math.random()*10000)}`;
 try{
  for(let i=0;i<count;i++){const context=await browser.newContext();contexts.push(context);const page=await context.newPage();pages.push(page);await open(page,server.url,errors)}
  await pages[0].evaluate(({prepare,online,code,config})=>{const base=init;init=function(){const out=base.apply(this,arguments);(0,eval)('('+prepare+')')(config);return out};init('Q003',['Aldric']);lobbySetMultiplayerControls(online?'remote':'local',code,'Aldric');lobbyClose();if(online){mpFreshNewGame32529=true;mpConnect()}},{prepare:prepareEncounter.toString(),online,code,config});
  if(online){
   await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'));
   await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Lyra'));
   for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
   await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(count);
   await pages[0].evaluate(()=>partyStart32716());for(const p of pages)await p.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
   await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');
  }
  for(const p of pages)await p.evaluate(()=>reputationPackets=[]);
  return {errors,contexts,pages,code,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
 }catch(error){await Promise.allSettled(contexts.map(c=>c.close()));throw error}
}

async function envelope(page){
 const at=await page.evaluate(()=>{const at=reputationPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>reputationPackets.slice(at).some(message=>message.type==='ROOM_STATE'),at);
 return page.evaluate(at=>reputationPackets.slice(at).find(message=>message.type==='ROOM_STATE'),at);
}
test('Encounter completion: a final-Action kill closes canonical combat and cannot be reopened by delayed compatibility snapshots',{timeout:90000},async({browser},info)=>{
 const server=await isolatedServer(),config={id:'EN008',severity:7,reputation:2,gold:15,loot:0,enemies:['E006','E001','E001']};let room;
 try{
  room=await setup(browser,server,true,config);let actor=room.pages[0];
  const before=await envelope(actor),original=structuredClone(before.data.game.activeEncounter320);expect(original.token).toBeTruthy();expect(before.data.game.gold).toBe(37);expect(before.data.game.reputation).toBe(0);
  // Delay only the legacy metadata snapshot channel. Real turn, combat and
  // resource commands keep their normal native browser/WebSocket paths.
  for(const page of room.pages)await page.evaluate(()=>{window.heldCompletionPatches33627=[];const before=mpSend;mpSend=function(type,data){if(type==='STATE'||type==='GAME_PATCH_3322'){heldCompletionPatches33627.push({type,active:data?.game?.activeEncounter320?.token||data?.state?.game?.activeEncounter320?.token||null});return false}return before.apply(this,arguments)}});
  for(let count=3;count>0;count--){
   await expect(actor.locator('#attack')).toBeEnabled();await actor.locator('#attack').click();
   // Inspect through the peer: an ordinary REQUEST_STATE reply to the actor
   // would intentionally replace its still-uncommitted compatibility fields.
   await expect.poll(async()=>{const saved=await canonical(room.pages[1]);return saved.tiles['0,0'].enemies.length}).toBe(count-1);
  }
  await expect.poll(()=>actor.evaluate(()=>g.heroKills3259?.Aldric||0)).toBe(3);
  const actorKillsBeforeFlush=await actor.evaluate(()=>g.heroKills3259.Aldric);
  let settled=await envelope(room.pages[1]);const game=settled.data.game;
  expect(game.activeEncounter320).toBeNull();expect(game.gold).toBe(52);expect(game.reputation).toBe(2);expect(game.lootDeck).toEqual(['LT001']);expect(game.roomAuthority3300.actions.Aldric).toBe(0);expect(game.roomAuthority3300.turnHero).toBeNull();
  for(const page of room.pages)await expect.poll(()=>page.evaluate(()=>({active:!!g.activeEncounter320,gold:g.gold,reputation:g.reputation,enemies:g.tiles['0,0'].enemies.length}))).toEqual({active:false,gold:52,reputation:2,enemies:0});
  // Release one current metadata snapshot after the canonical combat settles.
  // The server must retain the actual callback's kill credit, without inferring
  // that the command sender always owns the defeated Enemy.
  const flushedAt=await actor.evaluate(base=>{const at=reputationPackets.length;mpSocket.send(JSON.stringify({type:'GAME_PATCH_3322',room:mpRoom,from:mpRole,data:{baseRevision:base,state:serializableGameState(),questEpoch33626:Number(g.questTransitionAuthority33626?.epoch||0)}}));return at},settled.revision);
  await actor.waitForFunction(({at,base})=>reputationPackets.slice(at).some(message=>message.type==='STATE'&&Number(message.revision)>base),{at:flushedAt,base:settled.revision});
  settled=await envelope(room.pages[1]);expect(settled.data.game.heroKills3259.Aldric).toBe(3);
  for(const page of room.pages)expect(await page.evaluate(()=>g.heroKills3259.Aldric)).toBe(3);
  const stale=structuredClone(settled.data);stale.game.activeEncounter320=original;delete stale.game.encounterCompletionAuthority33627;
  const at=await actor.evaluate(({state,base})=>{const at=reputationPackets.length;mpSocket.send(JSON.stringify({type:'GAME_PATCH_3322',room:mpRoom,from:mpRole,data:{baseRevision:base,state,questEpoch33626:Number(g.questTransitionAuthority33626?.epoch||0)}}));return at},{state:stale,base:settled.revision});
  await actor.waitForFunction(({at,base})=>reputationPackets.slice(at).some(message=>message.type==='STATE'&&Number(message.revision)>base),{at,base:settled.revision});
  const protectedState=(await envelope(actor)).data.game;expect(protectedState.activeEncounter320).toBeNull();expect(protectedState.gold).toBe(52);expect(protectedState.reputation).toBe(2);expect(protectedState.tiles['0,0'].enemies).toHaveLength(0);expect(protectedState.heroKills3259.Aldric).toBe(3);
  await actor.close();actor=await room.contexts[0].newPage();room.pages[0]=actor;await open(actor,server.url,room.errors);await actor.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},room.code);await actor.waitForFunction(()=>mpJoinReady&&document.body.dataset.ascAdventureActive==='1');
  const rejoined=(await envelope(actor)).data.game;expect(rejoined.activeEncounter320).toBeNull();expect(rejoined.gold).toBe(52);expect(rejoined.reputation).toBe(2);expect(rejoined.tiles['0,0'].enemies).toHaveLength(0);expect(rejoined.heroKills3259.Aldric).toBe(3);
  const snapshot=await actor.evaluate(()=>({gold:g.gold,reputation:g.reputation}));await actor.evaluate(()=>encounterCompletion320());expect(await actor.evaluate(()=>({gold:g.gold,reputation:g.reputation}))).toEqual(snapshot);expect(room.errors).toEqual([]);
  await info.attach('encounter-completion-metadata',{body:JSON.stringify({token:original.token,settled:{active:game.activeEncounter320,gold:game.gold,reputation:game.reputation,actions:game.roomAuthority3300.actions.Aldric},killCredit:{actorBeforeFlush:actorKillsBeforeFlush,canonicalAfterFlush:settled.data.game.heroKills3259.Aldric},protected:{active:protectedState.activeEncounter320,gold:protectedState.gold,reputation:protectedState.reputation,kills:protectedState.heroKills3259.Aldric},rejoined:{active:rejoined.activeEncounter320,gold:rejoined.gold,reputation:rejoined.reputation,kills:rejoined.heroKills3259.Aldric}}),contentType:'application/json'});
 }finally{await info.attach('isolated-completion-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close()}
});
