const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-exploration-actions-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-40000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated exploration server exited');try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,close,log:()=>log}}
 catch(error){await close();throw error}
}
function prepare(kind){
 const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};origin.searchCount=0;origin.searchLimit=1;origin.traits=[...(origin.traits||[]),'Settlement'];
 const location=g.pool.find(tile=>legal(tile,{x:0,y:0}).length);
 if(!location)throw Error('Fixture requires a legal Location from the actual Quest pool');
 const next=structuredClone(location);Object.assign(next,{id:'ACTION-REGRESSION-LOCATION',name:'Action Regression Location',special:'None',reveal:'None',ongoing:'None',enc:null,enemies:[],searchCount:0,searchLimit:1});g.pool=[next];
 g.searchDeck=[structuredClone(SEARCH.find(card=>card.id===(kind==='gain'?'SD044':'SD049')))];g.searchDiscard=[];
 render();
}
async function open(page,url,errors){
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.type()==='prompt'?dialog.accept('1'):dialog.dismiss());
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascMechanics33621&&window.ascDowntime33622);
 await page.evaluate(()=>{window.actionPackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){actionPackets.push(m);return before.apply(this,arguments)}});
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=actionPackets.length;mpSend('REQUEST_STATE',{});return at});await page.waitForFunction(at=>actionPackets.slice(at).some(m=>m.type==='ROOM_STATE'),at);
 return page.evaluate(at=>actionPackets.slice(at).find(m=>m.type==='ROOM_STATE').data.game,at);
}
async function setup(browser,server,mode,kind){
 const errors=[],contexts=[],pages=[],online=mode!=='offline solo',count=mode==='online two clients'?2:1,code=`ACTIONS${Date.now()}${Math.floor(Math.random()*10000)}`;
 try{
 for(let i=0;i<count;i++){const c=await browser.newContext();contexts.push(c);const p=await c.newPage();pages.push(p);await open(p,server.url,errors)}
 await pages[0].evaluate(({prepare,online,code,kind})=>{
  const original=init;init=function(){const out=original.apply(this,arguments);(0,eval)('('+prepare+')')(kind);return out};
  init('Q003',['Rowan']);lobbySetMultiplayerControls(online?'remote':'local',code,'Rowan');lobbyClose();if(online){mpFreshNewGame32529=true;mpConnect()}
 },{prepare:prepare.toString(),online,code,kind});
 if(online){
  await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Rowan'),null,{timeout:15000});
  if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'))}
  for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
  await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(count);
  await pages[0].evaluate(()=>partyStart32716());for(const p of pages)await p.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
  await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
 }
 for(const page of pages)await page.evaluate(()=>{actionPackets=[];ascDebug3271.events=[]});
 return {errors,contexts,pages,online,code,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
 }catch(error){
  for(const [i,p]of pages.entries())if(!p.isClosed())await test.info().attach('exploration-setup-client-'+i,{body:JSON.stringify(await p.evaluate(()=>({url:location.href,ready:mpJoinReady,socket:mpSocket?.readyState,mode:mpMode,role:mpRole,packets:actionPackets.map(m=>({type:m.type,reason:m.data?.reason}))})).catch(e=>({error:String(e)}))),contentType:'application/json'});
  await Promise.allSettled(contexts.map(c=>c.close()));throw error;
 }
}
const cases=[{kind:'loss',name:'Rotten Floorboards loses one additional Action and one Health',actions:1,hp:8},{kind:'gain',name:'Lucky Break grants one additional Action',actions:3,hp:9},{kind:'cancel',name:'paid Search cancellation refunds exactly one Action',actions:3,hp:9},{kind:'explore',name:'Explore draw and placement spend exactly one Action',actions:2,hp:9}];
for(const mode of ['offline solo','online one Hero','online two clients'])for(const scenario of cases)test(`Exploration Actions: ${mode}, ${scenario.name}`,async({browser},info)=>{
 test.setTimeout(75000);const server=await isolatedServer();let room;const measured={mode,scenario:scenario.kind,expected:{actions:scenario.actions,hp:scenario.hp,unauthorizedDeltas:0,turnRejections:0}};
 try{
  room=await setup(browser,server,mode,scenario.kind);let page=room.pages[0];expect(await page.evaluate(()=>({actions:heroActionCount('Rowan'),hp:runtimeHeroState('Rowan').hp}))).toEqual({actions:3,hp:9});
  if(scenario.kind==='explore'){
   await expect(page.locator('#explore')).toBeEnabled();await page.locator('#explore').click();await page.waitForFunction(()=>pLoc?.id==='ACTION-REGRESSION-LOCATION');
   await expect.poll(()=>page.evaluate(()=>heroActionCount('Rowan'))).toBe(2);measured.afterDraw=await page.evaluate(()=>({actions:heroActionCount('Rowan'),pool:g.pool.length,pending:pLoc.id}));
   await page.locator('#placements button').first().click();await page.waitForFunction(()=>!pLoc&&Object.values(g.tiles).some(t=>t.id==='ACTION-REGRESSION-LOCATION'));
  }else{
   await expect(page.locator('#search')).toBeEnabled();await page.locator('#search').click();await page.waitForFunction(id=>pSearch?.card?.id===id,scenario.kind==='gain'?'SD044':'SD049');
   await expect.poll(()=>page.evaluate(()=>heroActionCount('Rowan'))).toBe(2);measured.afterDraw=await page.evaluate(()=>({actions:heroActionCount('Rowan'),hp:runtimeHeroState('Rowan').hp,pending:pSearch.card.id}));
   await page.locator(scenario.kind==='cancel'?'#cancelSearch':'#resolveSearch').click();await page.waitForFunction(()=>!pSearch);
  }
  await expect.poll(()=>page.evaluate(()=>({actions:heroActionCount('Rowan'),hp:runtimeHeroState('Rowan').hp,searchCount:g.tiles['0,0'].searchCount}))).toEqual({actions:scenario.actions,hp:scenario.hp,searchCount:['loss','gain'].includes(scenario.kind)?1:0});
  if(room.online){
   // Observe the actual effect commit before requesting a snapshot, so a stale
   // read cannot hide an uncommitted local hazard or Action reward.
   if(['loss','gain'].includes(scenario.kind))await page.waitForFunction(expected=>actionPackets.some(m=>m.type==='TURN_COMMAND_ACK'&&m.data?.turn?.actions?.Rowan===expected),scenario.actions);
   if(scenario.kind==='loss')await page.waitForFunction(()=>actionPackets.some(m=>m.type==='HERO_COMMAND_ACK'));
   const saved=await canonical(page);measured.saved={actions:saved.roomAuthority3300.actions.Rowan,hp:saved.heroRuntimeStates.Rowan.hp,searchCount:saved.tiles['0,0'].searchCount,placed:Object.values(saved.tiles).filter(t=>t.id==='ACTION-REGRESSION-LOCATION').length};
   expect(measured.saved).toEqual({actions:scenario.actions,hp:scenario.hp,searchCount:['loss','gain'].includes(scenario.kind)?1:0,placed:scenario.kind==='explore'?1:0});
   for(const client of room.pages)await expect.poll(()=>client.evaluate(()=>({actions:heroActionCount('Rowan'),hp:runtimeHeroState('Rowan').hp,searchCount:g.tiles['0,0'].searchCount,placed:Object.values(g.tiles).filter(t=>t.id==='ACTION-REGRESSION-LOCATION').length}))).toEqual(measured.saved);
  }
  measured.diagnostics=await Promise.all(room.pages.map(p=>p.evaluate(()=>({unauthorizedDeltas:ascDebug3271.events.filter(e=>e.type==='STATE_INVARIANT_FAILED_33621'&&e.detail?.rule==='UNAUTHORIZED_ACTION_DELTA').map(e=>e.detail),turnRejections:actionPackets.filter(m=>m.type==='TURN_COMMAND_REJECTED').map(m=>m.data?.reason),adjustments:ascDebug3271.events.filter(e=>e.type==='TURN_COMMAND_SENT_3300'&&e.detail?.op==='ADJUST_ACTIONS').map(e=>e.detail.delta),pendingActions:ascActionGuard33621.pending()}))));
  for(const [index,d]of measured.diagnostics.entries()){expect(d.unauthorizedDeltas).toEqual([]);expect(d.turnRejections).toEqual([]);expect(d.pendingActions).toEqual({});expect(d.adjustments).toEqual(room.online&&index===0&&['loss','gain'].includes(scenario.kind)?[scenario.kind==='loss'?-1:1]:[])}
  if(room.online&&['loss','gain'].includes(scenario.kind)){
   await page.close();page=await room.contexts[0].newPage();room.pages[0]=page;await open(page,server.url,room.errors);
   await page.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');
   await expect.poll(()=>page.evaluate(()=>({actions:heroActionCount('Rowan'),hp:runtimeHeroState('Rowan').hp,searchCount:g.tiles['0,0'].searchCount}))).toEqual({actions:scenario.actions,hp:scenario.hp,searchCount:1});
   const restored=await canonical(page);measured.rejoined={actions:restored.roomAuthority3300.actions.Rowan,hp:restored.heroRuntimeStates.Rowan.hp,searchCount:restored.tiles['0,0'].searchCount};expect(measured.rejoined).toEqual({actions:scenario.actions,hp:scenario.hp,searchCount:1});
  }
  expect(room.errors).toEqual([]);
 }finally{
  await info.attach('exploration-action-measurement',{body:JSON.stringify(measured),contentType:'application/json'});
  if(room)for(const [i,page]of room.pages.entries())if(!page.isClosed())await info.attach('exploration-action-client-'+i,{body:JSON.stringify(await page.evaluate(()=>({turn:ascRoomTurn33618.state(),actions:heroActionCount('Rowan'),hp:runtimeHeroState('Rowan')?.hp,pending:{loc:pLoc?.id,search:pSearch?.card?.id},debug:ascDebug3271.events.slice(-100)})).catch(e=>({error:String(e)}))),contentType:'application/json'});
  await info.attach('isolated-exploration-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close();
 }
});
