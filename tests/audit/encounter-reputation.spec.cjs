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
const cases=[
 {id:'EN019',severity:5,reputation:1,gold:0,loot:0,enemies:['E020']},
 {id:'EN019',severity:7,reputation:2,gold:0,loot:0,enemies:['E021','E020']},
 {id:'EN008',severity:5,reputation:1,gold:15,loot:0,enemies:['E001','E004']},
 {id:'EN008',severity:7,reputation:2,gold:15,loot:0,enemies:['E006','E001','E001']},
 {id:'EN004',severity:1,reputation:0,gold:0,loot:1,enemies:['E020']},
 {id:'EN019',severity:1,reputation:1,gold:0,loot:0,enemies:[]}
];
for(const online of [false,true])for(const config of cases)test(`Encounter Reputation: ${online?'two native clients':'offline solo'} ${config.id} Severity ${config.severity} awards authored ${config.reputation} Reputation once`,async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={expected:{reputation:config.reputation,gold:37+config.gold,loot:config.loot},config};
 try{
  room=await setup(browser,server,online,config);let actor=room.pages[0];
  const read=()=>actor.evaluate(()=>({reputation:g.reputation,gold:g.gold,loot:g.lootDeck.length,inventory:Object.values(g.inventory||{}).flat().reduce((sum,x)=>sum+Number(x.qty||1),0),active:!!g.activeEncounter320,enemies:(g.tiles['0,0'].enemies||[]).length}));
  measured.before=await read();expect(measured.before.reputation).toBe(0);
  if(!config.enemies.length||config.id==='EN004'){
   await actor.evaluate(severity=>startEncounter('Authored Reputation regression',{x:0,y:0,fixedSeverity:severity}),config.severity);await actor.waitForFunction(id=>pEnc?.card?.id===id,config.id);await actor.evaluate(async()=>await resolveEnc());await actor.waitForFunction(()=>!pEnc);
   if(config.id==='EN004'){
    measured.spawn=await actor.evaluate(()=>({reputation:g.reputation,loot:g.lootDeck.length,active:!!g.activeEncounter320,enemies:g.tiles['0,0'].enemies.map(e=>({type:e.type,hp:e.hp})),combatStarted:g.adventureLog.some(row=>JSON.stringify(row).includes('Encounter combat started: EN004')),prematureComplete:g.adventureLog.some(row=>JSON.stringify(row).includes('Encounter resolved: EN004'))}));
    expect(measured.spawn).toMatchObject({reputation:0,loot:1,active:true,enemies:[{type:'E020',hp:7}],combatStarted:true,prematureComplete:false});
   }
  }
  if(config.enemies.length){
   let remaining=config.enemies.length;
   for(let swings=0;swings<3&&remaining>0;swings++){
    const before=await actor.evaluate(()=>g.tiles['0,0'].enemies.reduce((sum,e)=>sum+e.hp,0));
    await expect(actor.locator('#attack')).toBeEnabled();await actor.locator('#attack').click();await expect.poll(()=>actor.evaluate(()=>g.tiles['0,0'].enemies.reduce((sum,e)=>sum+e.hp,0))).toBeLessThan(before);
    const current=await actor.evaluate(()=>({count:g.tiles['0,0'].enemies.length,hp:g.tiles['0,0'].enemies.reduce((sum,e)=>sum+e.hp,0)}));remaining=current.count;
    if(online)await expect.poll(async()=>{const saved=await canonical(actor),enemies=saved.tiles['0,0'].enemies||[];return {count:enemies.length,hp:enemies.reduce((sum,e)=>sum+e.hp,0)}}).toEqual(current);
   }
   expect(remaining).toBe(0);
  }
  await expect.poll(read).toMatchObject({reputation:config.reputation,gold:37+config.gold,loot:1-config.loot,inventory:measured.before.inventory+config.loot,active:false,enemies:0});
  measured.after=await read();await actor.evaluate(()=>encounterCompletion320());expect(await read()).toEqual(measured.after);
  for(const p of room.pages)await expect.poll(()=>p.evaluate(()=>({reputation:g.reputation,gold:g.gold,loot:g.lootDeck.length})) ).toEqual({reputation:config.reputation,gold:37+config.gold,loot:1-config.loot});
  if(online){
   const saved=await canonical(actor);measured.canonical={reputation:saved.reputation,gold:saved.gold,loot:saved.lootDeck.length};expect(measured.canonical).toEqual({reputation:config.reputation,gold:37+config.gold,loot:1-config.loot});
   measured.resourceRejections=await actor.evaluate(()=>reputationPackets.filter(m=>m.type==='RESOURCE_COMMAND_REJECTED').map(m=>m.data?.reason));expect(measured.resourceRejections).toEqual([]);
   await actor.close();actor=await room.contexts[0].newPage();room.pages[0]=actor;await open(actor,server.url,room.errors);await actor.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},room.code);await actor.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');
   await expect.poll(()=>actor.evaluate(()=>({reputation:g.reputation,gold:g.gold,loot:g.lootDeck.length}))).toEqual(measured.canonical);measured.rejoined=await read();expect(measured.rejoined).toMatchObject({reputation:config.reputation,gold:37+config.gold,loot:1-config.loot,active:false,enemies:0});await actor.evaluate(()=>encounterCompletion320());expect(await read()).toEqual(measured.rejoined);
  }
  expect(room.errors).toEqual([]);
 }finally{await info.attach('encounter-reputation-measurement',{body:JSON.stringify(measured),contentType:'application/json'});await info.attach('isolated-reputation-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close()}
});
