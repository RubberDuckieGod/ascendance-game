const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-reveal-armory-33627-'));
 const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let output='';
 for(const s of [child.stdout,child.stderr])s.on('data',d=>{output=(output+d).slice(-40000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error(output);try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,close,log:()=>output}}
 catch(e){await close();throw e}
}
function fixture(kind){
 const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};
 if(kind==='reveal'){
  const tile=structuredClone(LOCS.find(t=>t.id==='L006'));
  Object.assign(tile,{enemies:[],searchCount:0,visited:false,revealResolved:false});
  if(!legal(tile,{x:0,y:0}).length)throw Error('Authored Goblin Lookout must have a legal placement from Stonebrook');
  g.pool=[tile];return;
 }
 const watch=structuredClone(LOCS.find(t=>t.id==='L017'));
 Object.assign(watch,{enemies:[],edges:{N:true,E:true,S:true,W:true},searchCount:0,visited:true,revealResolved:true,beaconToken:true,beaconLit:kind==='victory'});
 const raider=enemy('Raider');raider.hp=1;raider.armor=0;watch.enemies=[raider];g.tiles['1,0']=watch;
 for(const h of partyHeroes()){const p=h==='Aldric'?g.hero:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:runtimeHeroState(h);p.x=1;p.y=0}
 Object.assign(q003State(),{watchtowerRevealed:true,spawned:true,beaconLit:kind==='victory',resolved:false,armoryOpened3304:false,vaultKeyClaimed3304:false});
 g.partyQuestItems=[];g.lootDeck=g.lootDeck.filter(id=>id!=='LT118');g.equipmentDecks={Common:['EQ001'],Uncommon:[],Rare:[],Epic:[],Legendary:[]};
 g.pool=g.pool.filter(t=>t.id!=='L017');
}
async function open(page,url,errors){
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascMechanics33621&&window.ascQuestTransition33626);
 await page.evaluate(()=>{window.armoryPackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){armoryPackets.push(m);return before.apply(this,arguments)}});
}
async function setup(browser,server,mode,kind){
 const contexts=[],pages=[],errors=[],online=mode!=='offline solo',count=mode==='online two clients'?2:1,code=`AR33627${Date.now()}${Math.floor(Math.random()*10000)}`;
 try{
  for(let i=0;i<count;i++){const c=await browser.newContext();contexts.push(c);const p=await c.newPage();pages.push(p);await open(p,server.url,errors)}
  await pages[0].evaluate(({source,kind,online,code})=>{
   const before=init;init=function(){const r=before.apply(this,arguments);(0,eval)('('+source+')')(kind);render();return r};
   init('Q003',['Rowan']);lobbySetMultiplayerControls(online?'remote':'local',code,'Rowan');lobbyClose();if(online){mpFreshNewGame32529=true;mpConnect()}
  },{source:fixture.toString(),kind,online,code});
  if(online){
   await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Rowan'));
   if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'))}
   for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
   await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(count);
   await pages[0].evaluate(()=>partyStart32716());for(const p of pages)await p.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
   await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
  }
  for(const p of pages)await p.evaluate(()=>{armoryPackets=[];ascDebug3271.events=[]});
  return {contexts,pages,errors,online,code,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
 }catch(e){await Promise.allSettled(contexts.map(c=>c.close()));throw e}
}
async function canonical(page){
 const at=await page.evaluate(()=>{const n=armoryPackets.length;mpSend('REQUEST_STATE',{});return n});
 await page.waitForFunction(at=>armoryPackets.slice(at).some(m=>m.type==='ROOM_STATE'),at);
 return page.evaluate(at=>armoryPackets.slice(at).find(m=>m.type==='ROOM_STATE').data.game,at);
}
function summary(game){return {key:game.partyQuestItems.includes('LT118'),returned:game.lootDeck.filter(id=>id==='LT118').length,opened:!!game.campaign.q003.armoryOpened3304,equipment:(game.inventory.Rowan||[]).filter(x=>x.kind==='equipment'&&x.id==='EQ001').reduce((n,x)=>n+Number(x.qty||0),0),remaining:(game.equipmentDecks.Common||[]).filter(id=>id==='EQ001').length}}
async function rejoin(room,server){
 await room.pages[0].close();const page=await room.contexts[0].newPage();room.pages[0]=page;await open(page,server.url,room.errors);
 await page.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);
 await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');return page;
}
for(const mode of ['offline solo','online one Hero','online two clients'])for(const kind of ['armory','victory'])test(`Q003 armory: ${mode}, ${kind==='victory'?'last Raider completes Quest before opening':'open during active Quest'}`,async({browser},info)=>{
 test.setTimeout(75000);const server=await isolatedServer();let room;const measured={mode,kind};
 try{
  room=await setup(browser,server,mode,kind);let page=room.pages[0];
  expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(3);await expect(page.locator('#attack')).toBeEnabled();await page.locator('#attack').click();
  await expect.poll(()=>page.evaluate(()=>g.heroKills3259?.Rowan||0)).toBe(1);
  // A kill line alone cannot prove that the authored, usable Quest Item exists.
  await expect.poll(()=>page.evaluate(()=>g.partyQuestItems.includes('LT118'))).toBe(true);
  expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(2);
  if(kind==='victory')await expect.poll(()=>page.evaluate(()=>g.campaign.questStatus.Q003)).toBe('Completed');
  const button=page.locator('#q003Armory3304');await expect(button).toBeVisible();await expect(button).toBeEnabled();
  measured.key=room.online?summary(await canonical(page)):await page.evaluate('('+summary.toString()+')(g)');
  expect(measured.key).toEqual({key:true,returned:0,opened:false,equipment:0,remaining:1});
  // The quest panel must explain that the key is acquired and where it is usable.
  await expect(page.locator('#questObjectivePanel')).toContainText(/Watchtower Vault Key|LT118/);
  await button.click();await expect.poll(()=>page.evaluate(()=>!!g.campaign.q003.armoryOpened3304)).toBe(true);
  measured.local=await page.evaluate('('+summary.toString()+')(g)');expect(measured.local).toEqual({key:false,returned:1,opened:true,equipment:1,remaining:0});
  expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(1);
  // The reward is named where the player acts, and the Inventory contains the real item.
  await expect(page.locator('#questObjectivePanel')).toContainText(/EQ001|Shortsword/);
  await page.evaluate(()=>openInventory());await expect(page.locator('#inventoryList')).toContainText('Shortsword');await page.evaluate(()=>document.getElementById('inventoryOverlay').classList.add('hidden'));
  await page.evaluate(()=>q003OpenArmory3304());expect(await page.evaluate('('+summary.toString()+')(g)')).toEqual(measured.local);expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(1);
  if(room.online){
   await expect.poll(async()=>summary(await canonical(page))).toEqual(measured.local);
   for(const peer of room.pages)await expect.poll(()=>peer.evaluate('('+summary.toString()+')(g)')).toEqual(measured.local);
   page=await rejoin(room,server);measured.rejoined=summary(await canonical(page));expect(measured.rejoined).toEqual(measured.local);expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(1);
   await expect(page.locator('#questObjectivePanel')).toContainText(/EQ001|Shortsword/);
  }
  expect(room.errors).toEqual([]);
 }finally{
  await info.attach('reveal-armory-measurement',{body:JSON.stringify(measured),contentType:'application/json'});
  if(room)for(const [i,p]of room.pages.entries())if(!p.isClosed())await info.attach('reveal-armory-client-'+i,{body:JSON.stringify(await p.evaluate(()=>({quest:g.campaign?.q003,status:g.campaign?.questStatus?.Q003,items:g.partyQuestItems,inventory:g.inventory?.Rowan,turn:ascRoomTurn33618.state(),packets:armoryPackets.slice(-35).map(m=>({type:m.type,reason:m.data?.reason})),debug:ascDebug3271.events.slice(-60)})).catch(e=>({error:String(e)}))),contentType:'application/json'});
  await info.attach('isolated-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close();
 }
});

for(const mode of ['offline solo','online two clients'])test(`First Reveal: ${mode}, actual Gold reward remains once after both Heroes enter, re-enter and reconnect`,async({browser},info)=>{
 test.setTimeout(75000);const server=await isolatedServer();let room;const measured={mode};
 try{
  room=await setup(browser,server,mode,'reveal');let page=room.pages[0];measured.before=await page.evaluate(()=>Number(g.gold||0));
  await page.locator('#explore').click();await page.waitForFunction(()=>pLoc?.id==='L006');await page.locator('#placements button').first().click();
  await page.waitForFunction(()=>!pLoc&&Object.values(g.tiles).some(t=>t.id==='L006'&&t.revealResolved));
  const after=measured.before+10;await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(after);
  await page.evaluate(()=>{const [k,t]=Object.entries(g.tiles).find(([,t])=>t.id==='L006'),[x,y]=k.split(',').map(Number);for(const h of partyHeroes()){enterHeroLocation(h,x,y,'First Reveal audit');enterHeroLocation(h,0,0,'First Reveal audit return');enterHeroLocation(h,x,y,'First Reveal audit re-entry')}render()});
  expect(await page.evaluate(()=>g.gold)).toBe(after);
  if(room.online){
   const saved=await canonical(page),tile=Object.values(saved.tiles).find(t=>t.id==='L006');expect(saved.gold).toBe(after);expect(tile.revealResolved).toBe(true);
   for(const peer of room.pages)await expect.poll(()=>peer.evaluate(()=>({gold:g.gold,revealed:!!Object.values(g.tiles).find(t=>t.id==='L006')?.revealResolved}))).toEqual({gold:after,revealed:true});
   page=await rejoin(room,server);expect((await canonical(page)).gold).toBe(after);expect(await page.evaluate(()=>Object.values(g.tiles).find(t=>t.id==='L006').revealResolved)).toBe(true);
   await page.evaluate(()=>{const [k]=Object.entries(g.tiles).find(([,t])=>t.id==='L006'),[x,y]=k.split(',').map(Number);enterHeroLocation('Rowan',x,y,'Restored entry');render()});
   expect((await canonical(page)).gold).toBe(after);
  }
  measured.after=after;expect(room.errors).toEqual([]);
 }finally{await info.attach('first-reveal-measurement',{body:JSON.stringify(measured),contentType:'application/json'});await info.attach('isolated-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close()}
});
