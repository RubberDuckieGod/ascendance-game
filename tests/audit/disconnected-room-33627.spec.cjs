const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-disconnected-33627-'));
 const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
 let child,log='';const url=`http://127.0.0.1:${port}/`;
 async function start(){
  child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
  for(const stream of[child.stdout,child.stderr])stream.on('data',chunk=>log=(log+chunk).slice(-20000));
  await expect.poll(async()=>{if(child.exitCode!==null)throw Error(log);try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);
 }
 async function stop(){if(child?.exitCode===null){const done=once(child,'exit');child.kill('SIGTERM');await done}}
 try{await start();return {url,dir,start,stop,log:()=>log,close:async()=>{await stop();fs.rmSync(dir,{recursive:true,force:true})}}}
 catch(error){await stop();fs.rmSync(dir,{recursive:true,force:true});throw error}
}
async function open(page,server){
 page.errors33627=[];page.on('pageerror',error=>page.errors33627.push(error.message));page.on('dialog',dialog=>dialog.dismiss());
 await page.goto(server.url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ascStatus33627?.ready()&&window.ascHealingSummons33627&&window.ascMerchantTerrain33627&&window.ascLocationQuest33627&&window.ascQuestTransition33626?.ready());
 await page.evaluate(()=>{window.disconnectPackets33627=[];const before=mpHandleMessage;mpHandleMessage=function(message){disconnectPackets33627.push(message);return before.apply(this,arguments)}});
}
async function seed(page,server,room,kind){
 const snapshot=await page.evaluate(kind=>{
  const actor=kind==='status'?'Rowan':'Aldric';init(kind==='status'?'Q002':'Q003',[actor,kind==='status'?'Aldric':'Rowan']);
  lobbySetMultiplayerControls('local','DISCONNECT-FIXTURE',actor);lobbyClose();
  for(const t of Object.values(g.tiles))t.enemies=[];
  g.round=10;g.phase='Hero Phase';g.activeHero=actor;g.gold=100;g.reputation=0;g.campaign.downtime=false;g.campaign.heroFates={};
  const tile={id:kind==='status'?'L000':'L017',name:kind==='status'?'Stonebrook':'Fallen Watchtower',terrain:'Road',traits:[],edges:{N:true,E:true,S:true,W:true},visited:true,revealResolved:true,enc:false,enemies:[],searchLimit:1,searchCount:0,reveal:'None.',ongoing:'None.',special:'None.'};
  g.tiles={'0,0':tile};g.hero={x:0,y:0};g.hp=kind==='status'?14:10;g.actions=0;g.conditions=[];g.inventory.Aldric=[];
  const rowan=runtimeHeroState('Rowan');Object.assign(rowan,{x:0,y:0,hp:kind==='status'?6:9,actions:0,conditions:kind==='status'?['Bleeding','Burning']:[]});
  delete g.statusHeroes33627;delete rowan.statusActivation33627;delete g.statusActivation33627;
  if(kind==='commerce'){
   g.campaign.q003={watchtowerRevealed:true,beaconLit:false,resolved:false,vaultKeyClaimed3304:true,armoryOpened3304:false};g.partyQuestItems=['LT118'];g.equipmentDecks.Common=['EQ001'];
   g.activeMerchant={name:'Traveling Merchant',sourceCard:'EN011',locationKey:'0,0',rarities:['Common'],discount:10,discountUsed:false,onePurchase:true};
  }
  const snapshot=serializableGameState();snapshot.adventureStarted32723=true;snapshot.game.adventureStarted32723=true;
  const heroes=g.partyHeroes;snapshot.game.roomAuthority3300={version:'3.36.21',round:10,phase:'Hero Phase',turnHero:null,started:Object.fromEntries(heroes.map(h=>[h,false])),actions:Object.fromEntries(heroes.map(h=>[h,0])),startSeqByHero:Object.fromEntries(heroes.map(h=>[h,0])),passed:Object.fromEntries(heroes.map(h=>[h,false])),activationSeq:0,seq:4};
  return snapshot;
 },kind);
 fs.writeFileSync(path.join(server.dir,room+'.json'),JSON.stringify({room,state:snapshot}));
}
async function join(page,room,hero){
 await page.evaluate(({room,hero})=>{lobbySetMultiplayerControls('remote',room,hero);mpConnect()},{room,hero});
 await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1',null,{timeout:15000});
}
async function claim(page,hero){await page.evaluate(()=>ascRoomTurn33618.claim());await page.waitForFunction(hero=>ascRoomTurn33618.state()?.turnHero===hero,hero)}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=disconnectPackets33627.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>disconnectPackets33627.slice(at).some(message=>message.type==='ROOM_STATE'),at);
 return page.evaluate(at=>disconnectPackets33627.slice(at).find(message=>message.type==='ROOM_STATE').data.game,at);
}
async function nativeRoom(browser,kind){
 const server=await isolatedServer(),contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(context=>context.newPage())),room=`DISCONNECTED${kind.toUpperCase()}${Date.now()}`;
 try{for(const page of pages)await open(page,server);await seed(pages[0],server,room,kind);await join(pages[0],room,kind==='status'?'Rowan':'Aldric');await join(pages[1],room,kind==='status'?'Aldric':'Rowan');await claim(pages[0],kind==='status'?'Rowan':'Aldric');return {server,contexts,pages,room,close:async()=>{await Promise.allSettled(contexts.map(context=>context.close()));await server.close()}}}
 catch(error){await Promise.allSettled(contexts.map(context=>context.close()));await server.close();throw error}
}

test('Disconnected room: rendering and activation helpers cannot apply another status tick while the server is unavailable',{timeout:60000},async({browser},info)=>{
 const r=await nativeRoom(browser,'status'),actor=r.pages[0];
 try{
  const before=await canonical(actor),hero=before.heroRuntimeStates.Rowan;expect(hero.hp).toBe(5);expect(before.roomAuthority3300.actions.Rowan).toBe(3);expect(before.roomAuthority3300.startSeqByHero.Rowan).toBe(1);
  const receipt=structuredClone(hero.statusActivation33627);await r.server.stop();await actor.waitForFunction(()=>!mpConnected()||!mpJoinReady);
  const disconnected=await actor.evaluate(()=>{
   const started=ascStatus33627.heroStart('Rowan'),ended=ascStatus33627.heroEnd('Rowan');ascStatus33627.beforeRoundEnd();render();render();
   const rowan=runtimeHeroState('Rowan');return {room:mpRoom,mode:mpMode,started,ended,hp:rowan.hp,actions:rowan.actions,conditions:rowan.conditions,receipt:rowan.statusActivation33627};
  });
  expect(disconnected).toEqual({room:r.room,mode:'remote',started:null,ended:null,hp:5,actions:3,conditions:['Bleeding','Burning'],receipt});
  await r.server.start();await join(actor,r.room,'Rowan');await claim(actor,'Rowan');await join(r.pages[1],r.room,'Aldric');const after=await canonical(actor);
  expect(after.heroRuntimeStates.Rowan.hp).toBe(5);expect(after.heroRuntimeStates.Rowan.statusActivation33627).toEqual(receipt);expect(after.roomAuthority3300.actions.Rowan).toBe(3);expect(after.roomAuthority3300.startSeqByHero.Rowan).toBe(1);
  for(const page of r.pages){await expect.poll(()=>page.evaluate(()=>runtimeHeroState('Rowan').hp)).toBe(5);expect(page.errors33627).toEqual([])}
  await info.attach('disconnected-status-authority',{body:JSON.stringify({before:{hp:hero.hp,receipt},disconnected,after:{hp:after.heroRuntimeStates.Rowan.hp,receipt:after.heroRuntimeStates.Rowan.statusActivation33627,actions:after.roomAuthority3300.actions.Rowan,startSeq:after.roomAuthority3300.startSeqByHero.Rowan}}),contentType:'application/json'});
 }finally{await r.close()}
});

test('Disconnected room: purchases, generic mechanics and the Q003 armory refuse local fallback and survive reconnect unchanged',{timeout:60000},async({browser},info)=>{
 const r=await nativeRoom(browser,'commerce'),actor=r.pages[0];
 try{
  const before=await canonical(actor);expect(before.hp).toBe(10);expect(before.gold).toBe(100);expect(before.partyQuestItems).toContain('LT118');
  await r.server.stop();await actor.waitForFunction(()=>!mpConnected()||!mpJoinReady);
  const disconnected=await actor.evaluate(async()=>{
   const purchase=await merchantBuyEquipment('Aldric','EQ097'),mechanics=await ascMechanics33621.command('REST',{},'Aldric'),armory=await q003OpenArmory3304();
   g.campaign.downtime=true;const downtimePurchase=await merchantBuyEquipment('Aldric','EQ097');g.campaign.downtime=false;
   return {purchase,mechanics,armory,downtimePurchase,room:mpRoom,hp:g.hp,gold:g.gold,actions:g.actions,inventory:structuredClone(g.inventory.Aldric),key:structuredClone(g.partyQuestItems),opened:g.campaign.q003.armoryOpened3304,deck:structuredClone(g.equipmentDecks.Common),offer:structuredClone(g.activeMerchant)};
  });
  for(const field of['purchase','mechanics','armory','downtimePurchase'])expect(disconnected[field].error).toMatch(/Reconnect.*room/i);
  expect(disconnected).toMatchObject({room:r.room,hp:10,gold:100,actions:3,inventory:before.inventory.Aldric,key:before.partyQuestItems,opened:false,deck:before.equipmentDecks.Common,offer:before.activeMerchant});
  await r.server.start();await join(actor,r.room,'Aldric');await claim(actor,'Aldric');await join(r.pages[1],r.room,'Rowan');const after=await canonical(actor);
  expect(after.hp).toBe(10);expect(after.gold).toBe(100);expect(after.inventory.Aldric).toEqual(before.inventory.Aldric);expect(after.partyQuestItems).toEqual(before.partyQuestItems);expect(after.equipmentDecks.Common).toEqual(before.equipmentDecks.Common);expect(after.campaign.q003.armoryOpened3304).toBe(false);expect(after.roomAuthority3300.actions.Aldric).toBe(3);
  for(const page of r.pages){await expect.poll(()=>page.evaluate(()=>({hp:g.hp,gold:g.gold,inventory:g.inventory.Aldric,key:g.partyQuestItems,opened:g.campaign.q003.armoryOpened3304}))).toEqual({hp:10,gold:100,inventory:before.inventory.Aldric,key:before.partyQuestItems,opened:false});expect(page.errors33627).toEqual([])}
  await info.attach('disconnected-commerce-authority',{body:JSON.stringify({disconnected,after:{hp:after.hp,gold:after.gold,inventory:after.inventory.Aldric,key:after.partyQuestItems,opened:after.campaign.q003.armoryOpened3304,actions:after.roomAuthority3300.actions.Aldric}}),contentType:'application/json'});
 }finally{await r.close()}
});
