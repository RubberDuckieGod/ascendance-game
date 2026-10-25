const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
let server;
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-phase-sync-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-20000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error(log);try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,dir,close}}
 catch(error){await close();throw error}
}
function fixture(fatal){
 for(const tile of Object.values(g.tiles))tile.enemies=[];
 Object.assign(g.campaign.q001,{villagers:0,rescued:4,lost:0});
 const tile=g.tiles['0,0'];tile.enemies=[{type:'audit-attacker',name:'Audit attacker',hp:10,max:10,armor:0,attack:fatal?20:3,move:0,range:0,conditions:['Burning']}];
 const rowan=runtimeHeroState('Rowan');rowan.hp=fatal?1:9;rowan.conditions=[];
 const cards=[...rowan.deck,...rowan.hand,...rowan.discard],normal=cards.filter(card=>card.speed!=='Reaction'&&card.category!=='Reaction');rowan.hand=normal.slice(0,5);rowan.deck=normal.slice(5);rowan.discard=cards.filter(card=>card.speed==='Reaction'||card.category==='Reaction');
 if(g.partyHeroes.includes('Lyra')){
  g.tiles['2,0']={...structuredClone(tile),id:'AUDIT-SAFE',name:'Audit safe location',enemies:[],edges:{N:0,E:0,S:0,W:0}};g.lyra.x=2;g.lyra.y=0;
 }
 g.gold=37;g.encDeck=g.encDeck.filter(card=>card.id!=='EN061');render();
}
async function open(page){
 page.on('dialog',dialog=>dialog.dismiss());
 await page.goto(server.url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascPhaseSync33625?.ready()&&window.ascMechanics33621&&window.ascBlightPatch33624?.ready);
 await page.evaluate(()=>{window.phasePackets=[];const before=mpHandleMessage;mpHandleMessage=function(message){phasePackets.push(message);return before.apply(this,arguments)}});
}
async function nativeRoom(browser,{fatal=false,count=1}={}){
 const contexts=[],pages=[],code=`PHASE${Date.now()}${Math.floor(Math.random()*10000)}`;
 for(let i=0;i<count;i++){const context=await browser.newContext();contexts.push(context);const page=await context.newPage();pages.push(page);await open(page)}
 await pages[0].evaluate(({code,fatal,prepare})=>{
  const before=init;init=function(){const out=before.apply(this,arguments);(0,eval)('('+prepare+')')(fatal);return out};
  init('Q001',['Rowan']);lobbySetMultiplayerControls('remote',code,'Rowan');mpFreshNewGame32529=true;mpConnect();
 },{code,fatal,prepare:fixture.toString()});
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(player=>player.hero==='Rowan'));
 if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&ascendancePartyLobby32759().players.some(player=>player.hero==='Lyra'))}
 for(const page of pages)await page.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(player=>player.ready).length)).toBe(count);
 await pages[0].evaluate(()=>partyStart32716());
 for(const page of pages)await page.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
 return {pages,contexts,code,close:()=>Promise.allSettled(contexts.map(context=>context.close()))};
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=phasePackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>phasePackets.slice(at).some(message=>message.type==='ROOM_STATE'),at);
 return page.evaluate(at=>phasePackets.slice(at).find(message=>message.type==='ROOM_STATE').data.game,at);
}
async function pauseAfterDamage(page){
 await page.evaluate(()=>{
  window.phaseGate={paused:false,released:false,before:null,after:null};
  const timer=window.setTimeout;window.setTimeout=function(callback,ms,...args){
   if(ms===150&&ascRoomPhaseWorker33625.executing()&&!phaseGate.paused&&runtimeHeroState('Rowan').hp<phaseGate.initialHp){
    phaseGate.paused=true;phaseGate.release=()=>{phaseGate.released=true;timer(callback,0,...args)};return -1;
   }
   return timer(callback,ms,...args);
  };
  phaseGate.initialHp=runtimeHeroState('Rowan').hp;
  const reaction=runtimeHeroReactionWindow;runtimeHeroReactionWindow=async function(en,target,die,attack,raw,range){
   const before=heroCurrentHp(target.id),armor=heroArmorValue(target.id),out=await reaction.apply(this,arguments);
   phaseGate.measure={hero:target.id,before,die,attack,armor,reaction:out,expected:Math.max(0,before-Math.max(0,die+attack-armor-(out.armor||0)-(out.reduce||0)))};return out;
  };
  window.phaseAuditSnapshot=()=>({hp:runtimeHeroState('Rowan').hp,conditions:structuredClone(runtimeHeroState('Rowan').conditions),fate:structuredClone(g.campaign.heroFates?.Rowan||null),gold:g.gold,hand:runtimeHeroState('Rowan').hand.map(card=>card.uid),discard:runtimeHeroState('Rowan').discard.map(card=>card.uid),enemies:Object.values(g.tiles).flatMap(tile=>(tile.enemies||[]).filter(enemy=>enemy.type==='audit-attacker').map(enemy=>({hp:enemy.hp,conditions:enemy.conditions,activatedRound:enemy.activatedRound}))),round:g.round});
 });
}
async function finishHero(page,hero){
 await page.evaluate(()=>ascRoomTurn33618.claim());await page.waitForFunction(hero=>ascRoomTurn33618.state()?.turnHero===hero,hero);
 await page.evaluate(()=>ascRoomTurn33618.end());
}
test.beforeAll(async()=>{server=await isolatedServer()});
test.afterAll(async()=>{await server?.close()});

for(const count of [1,2])test(`Phase sync: ${count===1?'one online Hero':'two native clients'} retain real Enemy damage and Burning changes through concurrent state refresh and reconnect`,async({browser},info)=>{
 const room=await nativeRoom(browser,{count}),page=room.pages[0];
 try{
  await pauseAfterDamage(page);await finishHero(page,'Rowan');
  if(count===2)await finishHero(room.pages[1],'Lyra');
  await page.waitForFunction(()=>phaseGate.paused,null,{timeout:10000});
  const before=await page.evaluate(()=>({actual:phaseAuditSnapshot(),measure:phaseGate.measure}));
  expect(before.actual.hp).toBe(before.measure.expected);expect(before.actual.hp).toBeLessThan(9);expect(before.actual.enemies).toEqual([{hp:9,conditions:[],activatedRound:1}]);
  const at=await page.evaluate(()=>{const at=phasePackets.length;for(const type of ['REQUEST_STATE','REQUEST_HERO_STATE','REQUEST_COMBAT_STATE','REQUEST_RESOURCE_STATE','REQUEST_EXPLORATION_STATE','REQUEST_PHASE_STATE','REQUEST_TURN_STATE'])mpSend(type,{});return at});
  await page.waitForFunction(at=>['ROOM_STATE','HERO_STATE','COMBAT_STATE','RESOURCE_STATE','EXPLORATION_STATE','PHASE_STATE','TURN_STATE'].every(type=>phasePackets.slice(at).some(message=>message.type===type)),at);
  expect(await page.evaluate(()=>phaseAuditSnapshot())).toEqual(before.actual);
  await page.evaluate(()=>phaseGate.release());await page.waitForFunction(()=>phasePackets.some(message=>message.type==='ROUND_RESOLVE_ACK'));
  const saved=await canonical(page);expect(saved.heroRuntimeStates.Rowan.hp).toBe(before.actual.hp);expect(saved.campaign.heroFates?.Rowan?.status).not.toBe('Lost');
  expect(Object.values(saved.tiles).flatMap(tile=>tile.enemies||[]).find(enemy=>enemy.type==='audit-attacker')).toMatchObject({hp:9,conditions:[]});
  for(const peer of room.pages)await expect.poll(()=>peer.evaluate(()=>runtimeHeroState('Rowan').hp)).toBe(before.actual.hp);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascPhaseSync33625?.ready()&&window.ascMechanics33621&&window.ascBlightPatch33624?.ready);
  await page.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);
  await page.waitForFunction(()=>mpJoinReady&&document.body.dataset.ascAdventureActive==='1');expect(await page.evaluate(()=>runtimeHeroState('Rowan').hp)).toBe(before.actual.hp);
  await info.attach('phase-damage-and-refresh-measurement',{body:JSON.stringify({expected:before.measure.expected,beforeRefresh:before.actual,canonicalHp:saved.heroRuntimeStates.Rowan.hp,canonicalRound:saved.round,clients:count}),contentType:'application/json'});
 }finally{await room.close()}
});

test('Phase sync: fatal Enemy damage survives concurrent refresh and commits the actual all-down quest failure reset',async({browser},info)=>{
 const room=await nativeRoom(browser,{fatal:true}),page=room.pages[0];
 try{
  await pauseAfterDamage(page);await finishHero(page,'Rowan');await page.waitForFunction(()=>phaseGate.paused,null,{timeout:10000});
  const before=await page.evaluate(()=>phaseAuditSnapshot());expect(before.hp).toBe(0);expect(before.fate.status).toBe('Lost');
  const at=await page.evaluate(()=>{const at=phasePackets.length;mpSend('REQUEST_STATE',{});mpSend('REQUEST_HERO_STATE',{});return at});
  await page.waitForFunction(at=>phasePackets.slice(at).some(message=>message.type==='HERO_STATE')&&phasePackets.slice(at).some(message=>message.type==='ROOM_STATE'),at);
  expect(await page.evaluate(()=>phaseAuditSnapshot())).toEqual(before);
  await page.evaluate(()=>phaseGate.release());await page.waitForFunction(()=>phasePackets.some(message=>message.type==='ROUND_RESOLVE_ACK'));
  const saved=await canonical(page);expect(saved.campaign.lastQuestOutcome).toMatchObject({quest:'Q001',outcome:'Failed'});expect(saved.campaign.downtime).toBe(true);expect(saved.round).toBe(1);expect(saved.phase).toBe('Hero Phase');
  expect(await page.evaluate(()=>ascPhaseSync33625.state())).toBeNull();
  await info.attach('fatal-phase-refresh-measurement',{body:JSON.stringify({beforeRefresh:before,expectedOutcome:'Failed',actual:saved.campaign.lastQuestOutcome,downtime:saved.campaign.downtime,round:saved.round}),contentType:'application/json'});
 }finally{await room.close()}
});

test('Phase sync: stale replies after worker completion cannot erase damage, and a late resource acknowledgement does not block the next Potion',async({browser},info)=>{
 const room=await nativeRoom(browser),page=room.pages[0];
 try{
  await page.evaluate(()=>ascRoomTurn33618.claim());await page.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan'&&!ascendance3312().inFlight);
  await page.evaluate(()=>{
   window.heldPhaseResource=[];window.holdPhaseResource=true;
   const before=mpHandleMessage;window.releasePhaseResource=()=>{holdPhaseResource=false;for(const message of heldPhaseResource)before(message)};
   mpHandleMessage=function(message){if(holdPhaseResource&&/^RESOURCE_COMMAND_(ACK|REJECTED)$/.test(message.type)){heldPhaseResource.push(message);return}return before.apply(this,arguments)};
   g.gold++;mpScheduleState();
  });
  await page.waitForFunction(()=>heldPhaseResource.length>0&&!!ascendance3312().inFlight);
  await pauseAfterDamage(page);
  await page.evaluate(()=>{
   const send=WebSocket.prototype.send;WebSocket.prototype.send=function(text){let message;try{message=JSON.parse(text)}catch(_){}if(message?.type==='ROUND_RESOLVE_RESULT'){window.heldPhaseResult=()=>send.call(this,text);return}return send.apply(this,arguments)};
   ascRoomTurn33618.end();
  });
  await page.waitForFunction(()=>phaseGate.paused);
  const damaged=await page.evaluate(()=>phaseAuditSnapshot());expect(damaged.hp).toBeLessThan(9);
  await page.evaluate(()=>releasePhaseResource());expect(await page.evaluate(()=>ascendance3312().inFlight)).toBeNull();expect(await page.evaluate(()=>phaseAuditSnapshot())).toEqual(damaged);
  await page.evaluate(()=>phaseGate.release());await page.waitForFunction(()=>typeof heldPhaseResult==='function'&&!ascRoomPhaseWorker33625.executing()&&ascRoomPhaseWorker33625.pending());
  const completed=await page.evaluate(()=>phaseAuditSnapshot());expect(completed.round).toBe(2);
  const at=await page.evaluate(()=>{const at=phasePackets.length;mpSend('REQUEST_STATE',{});mpSend('REQUEST_HERO_STATE',{});mpSend('REQUEST_RESOURCE_STATE',{});return at});
  await page.waitForFunction(at=>['ROOM_STATE','HERO_STATE','RESOURCE_STATE'].every(type=>phasePackets.slice(at).some(message=>message.type===type)),at);
  expect(await page.evaluate(()=>phaseAuditSnapshot())).toEqual(completed);
  await page.evaluate(()=>heldPhaseResult());await page.waitForFunction(()=>phasePackets.some(message=>message.type==='ROUND_RESOLVE_ACK'));
  await page.evaluate(()=>ascRoomTurn33618.claim());await page.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
  const potion=await page.evaluate(()=>{const item=heroInventory('Rowan').find(item=>item.id==='LT002');return {key:item?.key,hp:runtimeHeroState('Rowan').hp,qty:item?.qty||0}});expect(potion.qty).toBe(1);
  await page.evaluate(key=>useConsumable('Rowan',key),potion.key);
  await expect.poll(async()=>{const saved=await canonical(page);return {hp:saved.heroRuntimeStates.Rowan.hp,qty:(saved.inventory.Rowan||[]).filter(item=>item.id==='LT002').reduce((sum,item)=>sum+item.qty,0),gold:saved.gold}}).toEqual({hp:Math.min(9,potion.hp+4),qty:0,gold:38});
  expect(await page.evaluate(()=>ascendance3312().inFlight)).toBeNull();
  await info.attach('pending-phase-and-next-resource-measurement',{body:JSON.stringify({duringWorker:damaged,completedBeforeCommit:completed,potionExpectedHp:Math.min(9,potion.hp+4),potionConsumed:1,canonicalGold:38}),contentType:'application/json'});
 }finally{await room.close()}
});
