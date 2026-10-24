const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
async function state(page){const start=await page.evaluate(()=>{const count=packets.length;mpSend('REQUEST_STATE',{});return count});await page.waitForFunction(start=>packets.slice(start).some(m=>m.type==='ROOM_STATE'),start);return page.evaluate(start=>packets.slice(start).find(m=>m.type==='ROOM_STATE').data.game,start)}
function prepare(){
 const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};
 const target=structuredClone(origin);target.id='SNARE-CAPTAIN-TEST';target.name='Captain Snare Glade';target.edges={N:true,E:true,S:true,W:true};target.enemies=[];delete target.snare32526;g.tiles['1,0']=target;
 const rowan=runtimeHeroState('Rowan');rowan.hp=Math.max(1,rowan.hp);rowan.actions=3;rowan.hand=[{...HERO_RUNTIME_CARDS.Rowan.find(c=>c.id==='H005-009'),uid:'captain-snare-card'}];rowan.discard=[];render();
}
test('Set Snare: native lethal Captain immediately completes Q001 and pays rewards once',async({browser},info)=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-snare-captain-data-'));
 const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';for(const stream of [child.stdout,child.stderr])stream.on('data',x=>log=(log+x).slice(-50000));
 const contexts=[],pages=[],url=`http://127.0.0.1:${port}/`,code=`SNARECAPTAIN${Date.now()}`;
 try{
  await expect.poll(async()=>{try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);
  for(let i=0;i<2;i++){const context=await browser.newContext();contexts.push(context);const page=await context.newPage();pages.push(page);page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascSnare33622&&window.ascQuestRewards33622);await page.evaluate(()=>{window.packets=[];const before=mpHandleMessage;mpHandleMessage=function(m){packets.push(m);return before.apply(this,arguments)}})}
  await pages[0].evaluate(({code,prepare})=>{const before=init;init=function(){const out=before.apply(this,arguments);(0,eval)('('+prepare+')')();return out};init('Q001',['Rowan']);lobbySetMultiplayerControls('remote',code,'Rowan');mpFreshNewGame32529=true;mpConnect()},{code,prepare:prepare.toString()});
  await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Rowan'));
  await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'));
  for(const page of pages)await page.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
  await pages[0].evaluate(()=>partyStart32716());for(const page of pages)await page.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
  await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
  const before=await state(pages[0]);
  const placement=await pages[0].evaluate(()=>playExtraCard(runtimeHeroState('Rowan').hand.find(c=>c.uid==='captain-snare-card')));expect(placement?.error).toBeFalsy();
  for(const page of pages)await expect(page.locator('.ascSnareMarker33622 svg')).toHaveCount(1);
  await pages[0].evaluate(()=>{const q=q001State();q.captainSpawned=true;q.captainDefeated=false;q.rescued=2;q.villagers=2;q.fires=0;const captain=encounterEnemy320('E006');captain.hp=2;g.tiles['0,0'].enemies.push(captain);render();mpScheduleState()});
  for(const page of pages)await page.waitForFunction(()=>g.tiles['0,0'].enemies.some(e=>e.name==='Goblin Captain'&&e.hp===2&&e.roomEnemyId3301));
  await expect.poll(async()=>{const saved=await state(pages[0]);return {spawned:saved.campaign.q001.captainSpawned,rescued:saved.campaign.q001.rescued,fires:saved.campaign.q001.fires}}).toEqual({spawned:true,rescued:2,fires:0});
  const armed=await state(pages[0]);
  await pages[0].evaluate(()=>{const t=g.tiles['0,0'],captain=t.enemies.find(e=>e.name==='Goblin Captain');moveDamagedEnemyPrompt('Rowan',{name:'Snare Captain forced entry'},[{en:captain,t}],1);render();mpScheduleState()});
  for(const page of pages)await expect.poll(()=>page.evaluate(()=>Number(g.heroKills3259?.Rowan||0)),{timeout:10000}).toBe(Number(armed.heroKills3259?.Rowan||0)+1);
  for(const page of pages)await expect(page.locator('.ascSnareMarker33622')).toHaveCount(0);
  for(const page of pages)await page.waitForFunction(()=>g.campaign.questStatus.Q001==='Completed'&&Object.values(g.campaign.questRewardReceipts33622||{}).filter(r=>r.quest==='Q001').length===1,null,{timeout:10000});
  const canonical=await state(pages[0]),clients=await Promise.all(pages.map(page=>page.evaluate(()=>({role:mpRole,phase:g.phase,turn:ascRoomTurn33618.state()?.turnHero,quest:g.campaign.questStatus.Q001,captainDefeated:g.campaign.q001.captainDefeated,killCredit:g.heroKills3259?.Rowan||0,gold:g.gold,receiptCount:Object.values(g.campaign.questRewardReceipts33622||{}).filter(r=>r.quest==='Q001').length}))));
  const actual={canonical:{status:canonical.campaign.questStatus.Q001,captainDefeated:canonical.campaign.q001.captainDefeated,gold:canonical.gold,kills:canonical.heroKills3259?.Rowan||0,receiptCount:Object.values(canonical.campaign.questRewardReceipts33622||{}).filter(r=>r.quest==='Q001').length,enemies:Object.values(canonical.tiles).flatMap(t=>t.enemies||[]).map(e=>({name:e.name,hp:e.hp}))},clients};
 await info.attach('canonical-captain-objective',{body:JSON.stringify(actual,null,2),contentType:'application/json'});
  expect(actual.canonical).toMatchObject({status:'Completed',captainDefeated:true,gold:before.gold+75,kills:Number(armed.heroKills3259?.Rowan||0)+1,receiptCount:1});
  expect(canonical.xp.Rowan).toBe((before.xp.Rowan||0)+100);expect(canonical.xp.Aldric).toBe((before.xp.Aldric||0)+100);expect(canonical.reputation).toBe(before.reputation+1);expect(canonical.equipmentDecks.Common).toEqual(before.equipmentDecks.Common.slice(1));
  for(const client of clients)expect(client).toMatchObject({quest:'Completed',captainDefeated:true,gold:before.gold+75,receiptCount:1});
 }finally{await info.attach('isolated-server-log',{body:log,contentType:'text/plain'});await Promise.allSettled(contexts.map(c=>c.close()));if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
});
