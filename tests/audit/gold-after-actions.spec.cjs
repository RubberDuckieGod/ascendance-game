const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

function prepareGoldSearch(savedTracking=true){
 g.gold=25;
 // A legitimate restored current-round record: action tracking is authored data,
 // not a cooldown stamp. Still perform real movement before resolving the reward.
 const levels=g.campaign.levelRuntime3360||(g.campaign.levelRuntime3360={quest:g.campaign.currentQuest,hero:{},groupDamage:{},round:g.round,roundStart:{}});levels.round=g.round;levels.hero.Rowan??={used:{},round:{},buff:{},turnStart:null};if(savedTracking)levels.hero.Rowan.round.actionTypes=['Move'];else delete levels.hero.Rowan.round.actionTypes;
 const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};origin.searchCount=0;origin.searchLimit=1;
 const road=structuredClone(origin);Object.assign(road,{id:'GOLD-REGRESSION-ROAD',name:'Gold Regression Road',terrain:'Road',type:'Outdoor',traits:['Road'],enemies:[],special:'None',ongoing:'None',searchCount:0,searchLimit:1,edges:{N:true,E:true,S:true,W:true}});g.tiles['1,0']=road;
 g.searchDeck=[structuredClone(SEARCH.find(card=>card.id==='SD004'))];g.searchDiscard=[];
 render();
}
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-gold-actions-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-40000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated Gold server exited');try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,close,log:()=>log}}
 catch(error){await close();throw error}
}
async function open(page,url,errors){
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',dialog=>dialog.type()==='prompt'?dialog.accept('1'):dialog.type()==='confirm'?dialog.accept():dialog.dismiss());
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascMechanics33621&&window.ascDowntime33622);
 await page.evaluate(()=>{window.goldPackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){goldPackets.push(m);return before.apply(this,arguments)}});
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=goldPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>goldPackets.slice(at).some(m=>m.type==='ROOM_STATE'),at);
 return page.evaluate(at=>goldPackets.slice(at).find(m=>m.type==='ROOM_STATE').data.game,at);
}
async function setup(browser,server,mode,savedTracking=true){
 const errors=[],contexts=[],pages=[],online=mode!=='offline solo',count=mode==='online two clients'?2:1,code=`GOLD${Date.now()}${Math.floor(Math.random()*10000)}`;
 for(let i=0;i<count;i++){const c=await browser.newContext();contexts.push(c);const p=await c.newPage();pages.push(p);await open(p,server.url,errors)}
 await pages[0].evaluate(({prepare,online,code,savedTracking})=>{
  const original=init;init=function(){const out=original.apply(this,arguments);(0,eval)('('+prepare+')')(savedTracking);return out};
  init('Q003',['Rowan']);lobbySetMultiplayerControls(online?'remote':'local',code,'Rowan');lobbyClose();
  if(online){mpFreshNewGame32529=true;mpConnect()}
 },{prepare:prepareGoldSearch.toString(),online,code,savedTracking});
 if(online){
  await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Rowan'));
  if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'))}
  for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
  await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(count);
  await pages[0].evaluate(()=>partyStart32716());
  for(const p of pages)await p.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
  await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
  await pages[0].evaluate(()=>goldPackets=[]);
 }
 return {errors,contexts,pages,online,code,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
}

const goldCases=['offline solo','online one Hero','online two clients'].flatMap(mode=>[false,true].map(finalAction=>({mode,finalAction,savedTracking:true})));goldCases.push({mode:'online one Hero',finalAction:false,savedTracking:false});
for(const {mode,finalAction,savedTracking} of goldCases)test(`Gold after actions: ${mode}, ${finalAction?'final-Action':'mid-turn'} SD004 Search retains 20 Gold after real movement in a ${savedTracking?'restored':'fresh'} round`,async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={expected:{initialGold:25,reward:20,finalGold:45,resourceRejections:0},moves:[]};
 try{
  room=await setup(browser,server,mode,savedTracking);let page=room.pages[0];const before=await page.evaluate(()=>({gold:g.gold,round:g.round,actions:heroActionCount('Rowan')}));expect(before.gold).toBe(25);expect(before.actions).toBe(3);
  if(!savedTracking){expect(await page.evaluate(()=>g.campaign.levelRuntime3360?.hero?.Rowan?.round?.actionTypes)).toBeUndefined();if(room.online)expect((await canonical(page)).campaign.levelRuntime3360?.hero?.Rowan?.round?.actionTypes).toBeUndefined()}
  for(const [index,destination]of (finalAction?[[1,0],[0,0]]:[[1,0]]).entries()){
   const move=await page.evaluate(([x,y])=>{const before=heroActionCount('Rowan');runtimeHeroMove(x,y);return {before,after:heroActionCount('Rowan'),x:runtimeHeroState('Rowan').x,y:runtimeHeroState('Rowan').y,actionTypes:g.campaign.levelRuntime3360?.hero?.Rowan?.round?.actionTypes}},destination);
   measured.moves.push(move);expect(move).toMatchObject({before:3-index,after:2-index,x:destination[0],y:destination[1]});expect(move.actionTypes).toContain('Move');
   if(room.online)await expect.poll(async()=>{const saved=await canonical(page),rowan=saved.heroRuntimeStates?.Rowan||saved.extraHeroes?.Rowan;return {x:rowan.x,y:rowan.y,actions:saved.roomAuthority3300.actions.Rowan,tracksMove:Array.isArray(saved.campaign.levelRuntime3360?.hero?.Rowan?.round?.actionTypes)&&saved.campaign.levelRuntime3360.hero.Rowan.round.actionTypes.includes('Move')}}).toEqual({x:destination[0],y:destination[1],actions:2-index,tracksMove:true});
  }
  const actionCount=finalAction?1:2;expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(actionCount);
  await expect(page.locator('#search')).toBeEnabled();await page.locator('#search').click();await page.waitForFunction(()=>pSearch?.card?.id==='SD004');
  const packetAt=await page.evaluate(()=>goldPackets.length);
  await page.locator('#resolveSearch').click();await page.waitForFunction(()=>!pSearch);
  if(room.online){
   await page.waitForFunction(at=>goldPackets.slice(at).some(m=>['RESOURCE_COMMAND_ACK','RESOURCE_COMMAND_REJECTED'].includes(m.type)),packetAt);
   const searchState=await canonical(page);measured.canonicalAfterSearch={gold:searchState.gold,round:searchState.round,tracking:searchState.campaign.levelRuntime3360?.hero?.Rowan?.round,actions:searchState.roomAuthority3300.actions.Rowan,searchCount:searchState.tiles[finalAction?'0,0':'1,0'].searchCount};measured.rejections=await page.evaluate(()=>goldPackets.filter(m=>m.type==='RESOURCE_COMMAND_REJECTED').map(m=>({reason:m.data?.reason,seq:m.data?.resource?.seq})));
   expect(measured.canonicalAfterSearch.gold).toBe(45);expect(measured.canonicalAfterSearch.actions).toBe(finalAction?0:1);expect(measured.canonicalAfterSearch.searchCount).toBe(1);expect(measured.rejections).toEqual([]);
  }else expect(await page.evaluate(()=>g.gold)).toBe(45);
  for(const client of room.pages)await expect.poll(()=>client.evaluate(()=>g.gold)).toBe(45);
  if(room.online){
   if(!finalAction)await page.evaluate(()=>ascRoomTurn33618.end());
   if(mode==='online two clients')await page.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero!=='Rowan');
   if(mode==='online two clients'){const peer=room.pages[1];await peer.evaluate(()=>ascRoomTurn33618.claim());await peer.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');await peer.evaluate(()=>ascRoomTurn33618.end())}
  }else if(!finalAction)await page.evaluate(async()=>await endTurn());
  for(const client of room.pages)await client.waitForFunction(round=>g.round===round+1&&g.phase==='Hero Phase',before.round,{timeout:15000});
  for(const client of room.pages)expect(await client.evaluate(()=>g.gold)).toBe(45);
  if(room.online){
   const roundState=await canonical(page);measured.afterRound={gold:roundState.gold,round:roundState.round};expect(measured.afterRound.gold).toBe(45);
   await page.close();page=await room.contexts[0].newPage();room.pages[0]=page;await open(page,server.url,room.errors);
   await page.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);
   await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');
   await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(45);const rejoined=await canonical(page);measured.afterRejoin={gold:rejoined.gold,round:rejoined.round};expect(measured.afterRejoin.gold).toBe(45);
  }
  expect(room.errors).toEqual([]);
 }finally{
  await info.attach('gold-after-actions-measurement',{body:JSON.stringify(measured),contentType:'application/json'});await info.attach('isolated-gold-server',{body:server.log(),contentType:'text/plain'});
  if(room)await room.close();await server.close();
 }
});
