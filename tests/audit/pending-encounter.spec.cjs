const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-encounter-prompt-'));
 const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';for(const s of[child.stdout,child.stderr])s.on('data',v=>log=(log+v).slice(-30000));
 const url=`http://127.0.0.1:${port}/`;
 const close=async()=>{if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})};
 try{await expect.poll(async()=>{try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return{url,dir,close,log:()=>log}}catch(e){await close();throw e}
}
async function open(page,server,errors){page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto(server.url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascEncounterDeck33624&&window.ascRoomTurn33618);await page.evaluate(()=>{window.promptPackets=[];const prior=mpHandleMessage;mpHandleMessage=function(m){promptPackets.push(m);return prior.apply(this,arguments)}})}
async function seed(page,server,room,{stale=false}={}){
 const snapshot=await page.evaluate(stale=>{
  init('Q003',['Garruk','Rowan']);const tile=g.tiles['0,0'];tile.enemies=[];tile.searchCount=0;tile.searchLimit=2;tile.traits=[...(tile.traits||[]),'Settlement'];
  g.round=10;g.phase='Hero Phase';g.activeHero='Garruk';g.turnHero='Garruk';g.encDeck=[structuredClone(ENCS.find(c=>c.id==='EN030'))];g.encDiscard=[];g.gold=23;
  g.searchDeck=[structuredClone(SEARCH.find(c=>c.id==='SD057'))];
  runtimeHeroState('Garruk').hp=heroMaxHp('Garruk')-2;runtimeHeroState('Garruk').actions=3;runtimeHeroState('Rowan').actions=0;
  const save=serializableGameState();save.adventureStarted32723=true;save.game.adventureStarted32723=true;
  save.game.roomAuthority3300={version:'3.36.21',round:10,phase:'Hero Phase',turnHero:'Garruk',started:{Garruk:true,Rowan:false},actions:{Garruk:3,Rowan:0},startSeqByHero:{Garruk:1,Rowan:0},passed:{Garruk:false,Rowan:false},activationSeq:1,seq:4};
  save.explorationAuthority3305={version:'3.30.7',seq:6,pendingByHero:{}};
  if(stale)save.pending.pEnc={roomWaiting3305:true,roomHero3300:'Garruk',source:'Search Card',origin:{hero:'Garruk',x:0,y:0},text:'Waiting for room Encounter draw…'};
  return save;
 },stale);
 fs.writeFileSync(path.join(server.dir,room+'.json'),JSON.stringify({room,state:snapshot}));return snapshot;
}
async function join(page,room,hero){await page.evaluate(({room,hero})=>{lobbySetMultiplayerControls('remote',room,hero);mpConnect()},{room,hero});await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1',null,{timeout:15000})}
async function canonical(page){const at=await page.evaluate(()=>{const n=promptPackets.length;mpSend('REQUEST_STATE',{});return n});await page.waitForFunction(n=>promptPackets.slice(n).some(m=>m.type==='ROOM_STATE'),at);return page.evaluate(n=>promptPackets.slice(n).find(m=>m.type==='ROOM_STATE').data.game,at)}

test('Encounter prompt: authoritative restore clears a foreign waiting placeholder and leaves peer able to continue',async({browser},info)=>{
 const server=await isolatedServer(),context=await browser.newContext(),page=await context.newPage(),errors=[];const room=`PROMPT${Date.now()}`;
 try{await open(page,server,errors);await seed(page,server,room,{stale:true});await join(page,room,'Rowan');await page.evaluate(()=>mpSend('REQUEST_EXPLORATION_STATE',{}));await page.waitForFunction(()=>promptPackets.some(m=>m.type==='EXPLORATION_STATE'));
  await expect.poll(()=>page.evaluate(()=>({pending:pEnc&&{waiting:!!pEnc.roomWaiting3305,owner:pEnc.roomHero3300},hidden:document.querySelector('#encPanel').classList.contains('hidden')}))).toEqual({pending:null,hidden:true});
  const before=await canonical(page);expect(before.gold).toBe(23);expect(before.encDeck.map(c=>c.id)).toEqual(['EN030']);expect(before.encDiscard).toEqual([]);expect(errors).toEqual([]);
 }finally{await info.attach('encounter-prompt-server',{body:server.log(),contentType:'text/plain'});await context.close();await server.close()}
});

test('Encounter prompt: delayed draw cannot resolve a cardless placeholder and the real encounter still heals exactly once',async({browser},info)=>{
 const server=await isolatedServer(),context=await browser.newContext(),page=await context.newPage(),errors=[];const room=`DRAW${Date.now()}`;
 try{await open(page,server,errors);const initial=await seed(page,server,room);await join(page,room,'Garruk');await page.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Garruk');
  await page.evaluate(()=>{window.holdPromptPackets=true;window.heldPromptPackets=[];const before=mpHandleMessage;window.releasePromptPackets=()=>{holdPromptPackets=false;for(const m of heldPromptPackets.splice(0))before(m)};mpHandleMessage=function(m){if(holdPromptPackets&&['EXPLORATION_STATE','EXPLORATION_COMMAND_ACK'].includes(m.type)){heldPromptPackets.push(m);return}return before.apply(this,arguments)};startEncounter('Search Card',{x:0,y:0,hero:'Garruk',fixedSeverity:2})});
  await page.waitForFunction(()=>pEnc?.roomWaiting3305&&heldPromptPackets.some(m=>m.type==='EXPLORATION_COMMAND_ACK'));
  const early=await page.evaluate(async()=>{try{await resolveEnc();return {error:null,waiting:!!pEnc?.roomWaiting3305,actions:heroActionCount('Garruk'),hp:runtimeHeroState('Garruk').hp,gold:g.gold}}catch(e){return{error:e.message}}});
  expect(early).toEqual({error:null,waiting:true,actions:3,hp:initial.game.heroRuntimeStates.Garruk.hp,gold:23});
  await page.evaluate(()=>releasePromptPackets());await page.waitForFunction(()=>pEnc?.card?.id==='EN030'&&pEnc.roomAuthority3305);
  await page.locator('#resolveEnc').click();await expect.poll(()=>page.evaluate(()=>({pending:!!pEnc,resolving:ascendance3305().resolvingEncounter,hp:runtimeHeroState('Garruk').hp}))).toEqual({pending:false,resolving:false,hp:initial.game.heroRuntimeStates.Garruk.hp+1});
  const saved=await canonical(page);expect(saved.encDiscard.map(c=>c.id)).toEqual(['EN030']);expect(saved.heroRuntimeStates.Garruk.hp).toBe(initial.game.heroRuntimeStates.Garruk.hp+1);expect(saved.gold).toBe(23);expect(errors).toEqual([]);
 }finally{await info.attach('encounter-prompt-server',{body:server.log(),contentType:'text/plain'});await context.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero','online two clients'])test(`Encounter prompt: ${mode}, Garruk's paid Search completes its Gold and healing encounter exactly once`,async({browser},info)=>{
 const server=await isolatedServer(),contexts=[],pages=[],errors=[],room=`SEARCH${Date.now()}${Math.floor(Math.random()*1000)}`;let initial;
 try{
  const count=mode==='online two clients'?2:1;
  for(let i=0;i<count;i++){const c=await browser.newContext();contexts.push(c);const p=await c.newPage();pages.push(p);await open(p,server,errors)}
  const actor=pages[0];initial=await seed(actor,server,room);
  if(mode==='offline solo')await actor.evaluate(()=>{lobbySetMultiplayerControls('local','LOCAL-PROMPT','Garruk');lobbyClose()});
  else{await join(actor,room,'Garruk');if(count===2)await join(pages[1],room,'Rowan');await actor.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Garruk')}
  await actor.evaluate(()=>{const before=startEncounter;startEncounter=function(source,origin){return before.call(this,source,{...(origin||{}),fixedSeverity:2})}});
  await expect(actor.locator('#search')).toBeEnabled();await actor.locator('#search').click();await actor.waitForFunction(()=>pSearch?.card?.id==='SD057');
  await expect.poll(()=>actor.evaluate(()=>heroActionCount('Garruk'))).toBe(2);
  await actor.locator('#resolveSearch').click();await actor.waitForFunction(()=>pEnc?.card?.id==='EN030'&&pEnc.severity===2);
  await actor.locator('#resolveEnc').click();await expect.poll(()=>actor.evaluate(()=>({search:!!pSearch,encounter:!!pEnc,searchCount:g.tiles['0,0'].searchCount,gold:g.gold,hp:runtimeHeroState('Garruk').hp,actions:heroActionCount('Garruk')}))).toEqual({search:false,encounter:false,searchCount:1,gold:33,hp:initial.game.heroRuntimeStates.Garruk.hp+1,actions:2});
  await actor.evaluate(async()=>{await resolveEnc();await resolveEnc()});
  if(mode!=='offline solo'){
   const saved=await canonical(actor);expect(saved.gold).toBe(33);expect(saved.heroRuntimeStates.Garruk.hp).toBe(initial.game.heroRuntimeStates.Garruk.hp+1);expect(saved.tiles['0,0'].searchCount).toBe(1);expect(saved.encDiscard.map(c=>c.id)).toEqual(['EN030']);
   for(const peer of pages)await expect.poll(()=>peer.evaluate(()=>({gold:g.gold,hp:runtimeHeroState('Garruk').hp,search:g.tiles['0,0'].searchCount}))).toEqual({gold:33,hp:initial.game.heroRuntimeStates.Garruk.hp+1,search:1});
   expect(await actor.evaluate(()=>ascendance3305().pending)).toEqual({});
  }
  expect(await actor.evaluate(()=>({gold:g.gold,hp:runtimeHeroState('Garruk').hp,actions:heroActionCount('Garruk'),encDiscard:g.encDiscard.map(c=>c.id)}))).toEqual({gold:33,hp:initial.game.heroRuntimeStates.Garruk.hp+1,actions:2,encDiscard:['EN030']});
  expect(errors).toEqual([]);
  await info.attach('garruk-search-encounter-measurement',{body:JSON.stringify({mode,expected:{gold:33,hp:initial.game.heroRuntimeStates.Garruk.hp+1,actions:2,searchCount:1,discard:['EN030']},actual:await actor.evaluate(()=>({gold:g.gold,hp:runtimeHeroState('Garruk').hp,actions:heroActionCount('Garruk'),searchCount:g.tiles['0,0'].searchCount,discard:g.encDiscard.map(c=>c.id)}))}),contentType:'application/json'});
 }finally{for(const [i,p]of pages.entries())if(!p.isClosed())await info.attach('prompt-search-client-'+i,{body:JSON.stringify(await p.evaluate(()=>({pending:{encounter:pEnc&&{id:pEnc.card?.id,waiting:pEnc.roomWaiting3305},search:pSearch?.card?.id},turn:window.ascRoomTurn33618?.state?.(),debug:ascDebug3271.events.slice(-45)})).catch(e=>({error:e.message}))),contentType:'application/json'});await Promise.allSettled(contexts.map(c=>c.close()));await server.close()}
});

test('Encounter prompt: a failed local resolver releases the room lock and the pending encounter can be retried once',async({browser})=>{
 const server=await isolatedServer(),context=await browser.newContext(),page=await context.newPage(),errors=[],room=`RETRY${Date.now()}`;
 try{await open(page,server,errors);const initial=await seed(page,server,room);await join(page,room,'Garruk');await page.evaluate(()=>startEncounter('Search Card',{x:0,y:0,hero:'Garruk',fixedSeverity:2}));await page.waitForFunction(()=>pEnc?.card?.id==='EN030'&&pEnc.roomAuthority3305);
  const failure=await page.evaluate(async()=>{const beforeText=encounterText320,beforeSchedule=mpScheduleState;encounterText320=()=>{throw Error('Isolated encounter resolver failure')};let message;try{await resolveEnc()}catch(e){message=e.message}finally{encounterText320=beforeText}return{message,locked:ascendance3305().resolvingEncounter,scheduleRestored:mpScheduleState===beforeSchedule,pending:pEnc?.card?.id,discard:g.encDiscard.map(c=>c.id),gold:g.gold,hp:runtimeHeroState('Garruk').hp}});
  expect(failure).toEqual({message:'Isolated encounter resolver failure',locked:false,scheduleRestored:true,pending:'EN030',discard:[],gold:23,hp:initial.game.heroRuntimeStates.Garruk.hp});
  await page.locator('#resolveEnc').click();await expect.poll(()=>page.evaluate(()=>({pending:!!pEnc,locked:ascendance3305().resolvingEncounter,hp:runtimeHeroState('Garruk').hp,discard:g.encDiscard.map(c=>c.id)}))).toEqual({pending:false,locked:false,hp:initial.game.heroRuntimeStates.Garruk.hp+1,discard:['EN030']});expect(errors).toEqual([]);
 }finally{await context.close();await server.close()}
});

test('Encounter prompt: canonical card identity replaces a stale restored card even when the Severity roll matches',async({browser})=>{
 const server=await isolatedServer(),context=await browser.newContext(),page=await context.newPage(),errors=[],room=`IDENTITY${Date.now()}`;
 try{await open(page,server,errors);await seed(page,server,room);await join(page,room,'Garruk');await page.evaluate(()=>startEncounter('Search Card',{x:0,y:0,hero:'Garruk',fixedSeverity:2}));await page.waitForFunction(()=>pEnc?.card?.id==='EN030'&&pEnc.roomAuthority3305);
  await page.evaluate(()=>{const save=serializableGameState();save.pending.pEnc.card=structuredClone(ENCS.find(c=>c.id==='EN029'));applySerializedGameState(save);window.beforeIdentityRefresh=promptPackets.length;mpSend('REQUEST_EXPLORATION_STATE',{})});
  await page.waitForFunction(()=>promptPackets.slice(beforeIdentityRefresh).some(m=>m.type==='EXPLORATION_STATE'));
  await expect.poll(()=>page.evaluate(()=>({card:pEnc?.card?.id,severity:pEnc?.severity,authoritative:pEnc?.roomAuthority3305,discard:g.encDiscard.map(c=>c.id)}))).toEqual({card:'EN030',severity:2,authoritative:true,discard:[]});expect(errors).toEqual([]);
 }finally{await context.close();await server.close()}
});
