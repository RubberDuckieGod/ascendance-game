const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

let server;
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-regional-decks-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-40000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated Encounter server exited');try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,dir,close,log:()=>log}}
 catch(error){await close();throw error}
}
async function open(page,errors=[]){
 page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.dismiss());
 await page.goto(server.url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascEncounterDeck33624&&window.ascEncounterDeckRules33624);
 await page.evaluate(()=>{window.deckPackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){deckPackets.push(m);return before.apply(this,arguments)}});
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=deckPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>deckPackets.slice(at).some(m=>m.type==='ROOM_STATE'),at);
 return page.evaluate(at=>deckPackets.slice(at).find(m=>m.type==='ROOM_STATE').data.game,at);
}
test.beforeAll(async()=>{server=await isolatedServer()});
test.afterAll(async()=>{await server?.close()});

for(const [campaign,quest,low,high,count]of [[1,'Q001',1,30,35],[2,'Q013',31,45,15],[3,'Q025',46,60,15],[4,'Q037',61,75,15],[5,'Q049',76,90,15],[6,'Q061',91,105,15]])test(`Regional encounters: Campaign ${campaign} initializes and draws only its authored deck`,async({page},info)=>{
 const errors=[];await open(page,errors);
 const actual=await page.evaluate(({quest})=>{
  init(quest,['Rowan']);lobbySetMultiplayerControls('local','REGION-TEST','Rowan');lobbyClose();
  const initial=g.encDeck.map(card=>card.id),gold=g.gold,actions=heroActionCount('Rowan');
  // Draw through the actual final wrapper, including the legitimate refill path.
  const preserved=g.encDeck.splice(0);g.encDiscard=preserved;
  startEncounter('Regional deck regression',{x:0,y:0,fixedSeverity:2});
  return {initial,draw:pEnc?.card?.id,severity:pEnc?.severity,deck:g.encDeck.map(card=>card.id),discard:g.encDiscard.map(card=>card.id),goldBefore:gold,goldAfter:g.gold,actionsBefore:actions,actionsAfter:heroActionCount('Rowan')};
 },{quest});
 expect(actual.initial).toHaveLength(count);expect(actual.initial.every(id=>Number(id.slice(2))>=low&&Number(id.slice(2))<=high)).toBe(true);
 expect(Number(actual.draw.slice(2))).toBeGreaterThanOrEqual(low);expect(Number(actual.draw.slice(2))).toBeLessThanOrEqual(high);expect(actual.severity).toBe(2);
 expect(actual.deck).toHaveLength(count-1);expect(actual.discard).toEqual([]);expect(actual.goldAfter).toBe(actual.goldBefore);expect(actual.actionsAfter).toBe(actual.actionsBefore);expect(errors).toEqual([]);
 if(campaign===1)expect(actual.initial).not.toContain('EN097');if(campaign===6)expect(actual.initial).toContain('EN097');
 await info.attach('regional-encounter-deck-measurement',{body:JSON.stringify({campaign,quest,expected:{low,high,count},actual}),contentType:'application/json'});
});

test('Regional encounters: restored local foreign pending card is replaced visibly at the same fixed Severity',async({page},info)=>{
 const errors=[];await open(page,errors);
 const actual=await page.evaluate(()=>{
  init('Q001',['Rowan']);lobbySetMultiplayerControls('local','REGION-SAVE','Rowan');lobbyClose();
  const save=serializableGameState(),card=id=>structuredClone(ENCS.find(c=>c.id===id));
  save.game.gold=47;save.game.encDeck=[card('EN097'),card('EN003'),card('EN002')];save.game.encDiscard=[card('EN061'),card('EN001')];save.game.tiles['0,0'].enemies=[];save.game.tiles['0,0'].visited=false;
  save.pending.pEnc={card:card('EN097'),severity:2,roll:2,baseRoll:null,fixedSeverity:2,severityMode:'fixed',source:'First Visit',origin:{x:0,y:0},firstVisitTileKey:'0,0'};
  const before={gold:save.game.gold,hp:save.game.heroRuntimeStates.Rowan.hp,actions:save.game.heroRuntimeStates.Rowan.actions};
  applyLoadedSave({format:'ascendance-save',saveFileVersion:1,name:'Isolated regional regression',state:save});
  const restored={card:pEnc.card.id,text:pEnc.text,severity:pEnc.severity,baseRoll:pEnc.baseRoll,fixed:pEnc.fixedSeverity,origin:pEnc.origin,firstVisitTileKey:pEnc.firstVisitTileKey,visited:g.tiles['0,0'].visited,deck:g.encDeck.map(c=>c.id),discard:g.encDiscard.map(c=>c.id),gold:g.gold,hp:runtimeHeroState('Rowan').hp,actions:heroActionCount('Rowan'),enemies:g.tiles['0,0'].enemies.map(e=>e.type),notice:g.adventureLog.some(row=>JSON.stringify(row).includes('EN097 → EN003'))};
  return {before,restored};
 });
 expect(actual.restored).toMatchObject({card:'EN003',severity:2,baseRoll:null,fixed:2,origin:{x:0,y:0},firstVisitTileKey:'0,0',visited:false,deck:['EN002'],discard:['EN001'],enemies:[],notice:true});
 expect(actual.restored.gold).toBe(actual.before.gold);expect(actual.restored.hp).toBe(actual.before.hp);expect(actual.restored.actions).toBe(actual.before.actions);await expect(page.locator('#encName')).toHaveText('Scout Patrol');expect(errors).toEqual([]);
 await info.attach('regional-local-restore-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
});

test('Regional encounters: Campaign VI EN097 at fixed Severity 3 spawns the authored Guardian with 3 starting damage',async({page},info)=>{
 const errors=[];await open(page,errors);
 const actual=await page.evaluate(async()=>{
  init('Q061',['Aldric','Lyra']);lobbySetMultiplayerControls('local','GUARDIAN-DAMAGE','Aldric');lobbyClose();
  g.tiles['0,0'].enemies=[];g.encDeck=[structuredClone(ENCS.find(c=>c.id==='EN097'))];g.encDiscard=[];
  startEncounter('Guardian regression',{x:0,y:0,fixedSeverity:3});const pending={card:pEnc.card.id,severity:pEnc.severity,text:pEnc.text};
  await resolveEnc();return {pending,remainingPending:!!pEnc,enemies:g.tiles['0,0'].enemies.map(e=>({id:e.workbookId||e.type,hp:e.hp,max:e.max})),discard:g.encDiscard.map(c=>c.id)};
 });
 expect(actual.pending).toEqual({card:'EN097',severity:3,text:'E111 with3 damage'});expect(actual.remainingPending).toBe(false);expect(actual.enemies).toEqual([{id:'E111',hp:17,max:20}]);expect(actual.discard).toEqual(['EN097']);expect(errors).toEqual([]);
 await info.attach('guardian-starting-damage-measurement',{body:JSON.stringify({expected:{id:'E111',hp:17,max:20},actual}),contentType:'application/json'});
});

test('Regional encounters: server repairs a persisted foreign pending card once and both native clients retain the same repaired deck after reconnect',async({browser},info)=>{
 test.setTimeout(90000);const errors=[],contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage()));
 const code=`REGION${Date.now()}${Math.floor(Math.random()*10000)}`;let actual;
 try{
  for(const page of pages)await open(page,errors);
  const snapshot=await pages[0].evaluate(()=>{
   init('Q001',['Aldric','Lyra']);const save=serializableGameState(),card=id=>structuredClone(ENCS.find(c=>c.id===id));
   save.game.gold=47;save.game.encDeck=[card('EN097'),card('EN003'),card('EN002')];save.game.encDiscard=[card('EN061'),card('EN001')];save.game.tiles['0,0'].enemies=[];save.game.tiles['0,0'].visited=false;save.adventureStarted32723=true;save.game.adventureStarted32723=true;
   save.game.roomAuthority3300={version:'3.36.21',round:save.game.round,phase:'Hero Phase',turnHero:'Aldric',started:{Aldric:true,Lyra:false},actions:{Aldric:save.game.actions,Lyra:0},startSeqByHero:{Aldric:1,Lyra:0},passed:{Aldric:false,Lyra:false},activationSeq:1,seq:4};
   const pending={kind:'encounter',hero:'Aldric',round:1,card:card('EN097'),severity:2,roll:2,baseRoll:null,fixedSeverity:2,severityMode:'fixed',source:'First Visit',origin:{x:0,y:0},firstVisitTileKey:'0,0'};
   save.pending.pEnc=structuredClone(pending);save.explorationAuthority3305={version:'3.30.7',seq:6,pendingByHero:{Aldric:pending}};
   return save;
  });
  // This is a temporary legacy disk fixture. The browsers do not pre-sanitize it,
  // so the real room restore boundary must correct the canonical copy as well.
  fs.writeFileSync(path.join(server.dir,code+'.json'),JSON.stringify({room:code,state:snapshot}));
  for(const [i,page]of pages.entries()){
   await page.evaluate(({code,hero})=>{lobbySetMultiplayerControls('remote',code,hero);mpConnect()},{code,hero:i?'Lyra':'Aldric'});
   await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1',null,{timeout:15000});
  }
  for(const page of pages)await page.evaluate(()=>mpSend('REQUEST_EXPLORATION_STATE',{}));
  await pages[0].waitForFunction(()=>pEnc?.card?.id==='EN003'&&pEnc?.roomAuthority3305,null,{timeout:15000});
  for(const page of pages)await expect.poll(()=>page.evaluate(()=>({deck:g.encDeck.map(c=>c.id),discard:g.encDiscard.map(c=>c.id)}))).toEqual({deck:['EN002'],discard:['EN001']});
  const canonicalBefore=await canonical(pages[0]);
  actual=await pages[0].evaluate(()=>({card:pEnc.card.id,severity:pEnc.severity,fixed:pEnc.fixedSeverity,origin:pEnc.origin,firstVisitTileKey:pEnc.firstVisitTileKey,visited:g.tiles['0,0'].visited,gold:g.gold,hp:g.hp,actions:heroActionCount('Aldric'),enemies:g.tiles['0,0'].enemies.map(e=>e.type),notice:g.adventureLog.some(row=>JSON.stringify(row).includes('EN097 → EN003'))}));
  expect(actual).toMatchObject({card:'EN003',severity:2,fixed:2,origin:{x:0,y:0},firstVisitTileKey:'0,0',visited:false,gold:47,hp:snapshot.game.hp,actions:snapshot.game.actions,enemies:[],notice:true});
  expect(canonicalBefore.encDeck.map(c=>c.id)).toEqual(['EN002']);expect(canonicalBefore.encDiscard.map(c=>c.id)).toEqual(['EN001']);expect(canonicalBefore.gold).toBe(47);expect(canonicalBefore.tiles['0,0'].visited).toBe(false);
  await pages[0].close();await expect.poll(()=>pages[1].evaluate(()=>ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'))).toBe(false);
  pages[0]=await contexts[0].newPage();await open(pages[0],errors);await pages[0].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);
  await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1'&&pEnc?.card?.id==='EN003');
  const rejoined=await canonical(pages[0]);expect(rejoined.encDeck.map(c=>c.id)).toEqual(['EN002']);expect(rejoined.encDiscard.map(c=>c.id)).toEqual(['EN001']);expect(rejoined.gold).toBe(47);expect(rejoined.actions).toBe(snapshot.game.actions);expect(rejoined.hp).toBe(snapshot.game.hp);expect(rejoined.tiles['0,0'].enemies).toEqual([]);expect(rejoined.tiles['0,0'].visited).toBe(false);expect(errors).toEqual([]);
  await info.attach('regional-server-restore-measurement',{body:JSON.stringify({actual,canonicalDeck:canonicalBefore.encDeck.map(c=>c.id),canonicalDiscard:canonicalBefore.encDiscard.map(c=>c.id),rejoinDeck:rejoined.encDeck.map(c=>c.id),rejoinDiscard:rejoined.encDiscard.map(c=>c.id),replacement:rejoined.encounterDeckRepair33624}),contentType:'application/json'});
 }catch(error){
  for(const [i,page]of pages.entries())if(!page.isClosed())await info.attach('regional-client-'+i,{body:JSON.stringify(await page.evaluate(()=>({connected:mpSocket?.readyState,ready:mpJoinReady,active:document.body.dataset.ascAdventureActive,pending:pEnc&&{id:pEnc.card?.id,room:pEnc.roomAuthority3305,severity:pEnc.severity},deck:g.encDeck?.map(c=>c.id),packets:deckPackets.map(m=>({type:m.type,reason:m.data?.reason}))}))),contentType:'application/json'});
  throw error;
 }finally{await Promise.allSettled(contexts.map(c=>c.close()));await info.attach('isolated-regional-server',{body:server.log(),contentType:'text/plain'})}
});
