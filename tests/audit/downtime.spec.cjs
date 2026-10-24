const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

async function load(page,url='/'){
 page.on('dialog',d=>d.dismiss());await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ascDowntimeRules33622&&window.ascDowntime33622);
 await page.evaluate(()=>{window.downtimeTestPackets=[];const before=mpHandleMessage;mpHandleMessage=function(m){downtimeTestPackets.push(m);return before.apply(this,arguments)}});
}
async function request(page,type,data={}){
 const id=data.id||`DT-TEST-${Date.now()}-${Math.random()}`;
 const count=await page.evaluate(({type,data,id})=>{const n=downtimeTestPackets.length;mpSend(type,{id,...data});return n},{type,data,id});
 await page.waitForFunction(({id,count})=>downtimeTestPackets.slice(count).some(m=>m.data?.id===id&&/_(ACK|REJECTED)$/.test(m.type)),{id,count});
 return page.evaluate(({id,count})=>downtimeTestPackets.slice(count).find(m=>m.data?.id===id&&/_(ACK|REJECTED)$/.test(m.type)),{id,count});
}
async function command(page,type='Work',extra={}){
 const data=await page.evaluate(type=>({hero:mpRole,token:ascDowntimeRules33622.token(g),type}),type);
 return request(page,'DOWNTIME_COMMAND',{...data,...extra});
}
async function canonical(page){
 const count=await page.evaluate(()=>{const n=downtimeTestPackets.length;mpSend('REQUEST_STATE',{});return n});
 await page.waitForFunction(count=>downtimeTestPackets.slice(count).some(m=>m.type==='ROOM_STATE'),count);
 return page.evaluate(count=>downtimeTestPackets.slice(count).find(m=>m.type==='ROOM_STATE').data.game,count);
}
async function nativeRoom(browser,url='/',{craftLyra=false,inventoryLyra=false,fixtureItem=null}={}){
 const contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage()));
 const code=`DOWNTIME${Date.now()}${Math.floor(Math.random()*10000)}`,frames=[];
 for(const [i,page]of pages.entries()){
  page.on('websocket',ws=>ws.on('framesent',f=>{try{const m=JSON.parse(String(f.payload));if(m.type==='DOWNTIME_COMMAND')frames.push({client:i,...m})}catch(_){}}));
  await load(page,url);
 }
 await pages[0].evaluate(({code,craftLyra,inventoryLyra,fixtureItem})=>{
  if(craftLyra||inventoryLyra||fixtureItem){const before=init;init=function(){const out=before.apply(this,arguments);if(craftLyra||inventoryLyra)g.gold=inventoryLyra?500:100;if(craftLyra){addInventoryItem('Lyra','LT031','loot',4);addInventoryItem('Lyra','LT034','loot',2);g.campaign.researchPrep3252={Lyra:{Blacksmithing:1}}}if(inventoryLyra)addInventoryItem('Lyra','EQ002','equipment',3);if(fixtureItem)addInventoryItem('Aldric',fixtureItem,'loot',1);return out}}
  init('Q001',['Aldric']);lobbySetMultiplayerControls('remote',code,'Aldric');mpFreshNewGame32529=true;mpConnect()
 },{code,craftLyra,inventoryLyra,fixtureItem});
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'));
 await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);
 await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Lyra'));
 for(const page of pages)await page.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
 await pages[0].evaluate(()=>partyStart32716());
 for(const page of pages)await page.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
 return {contexts,pages,code,frames,close:()=>Promise.allSettled(contexts.map(c=>c.close()))};
}
async function completeAndProceed(pages){
 const host=pages[0];await host.evaluate(()=>ascRoomTurn33618.claim());
 await host.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');
 const before=await canonical(host);
 // Fixture the printed objective prerequisites, then execute the real objective and
 // quest-resolution path. The test never writes downtime or a completion record.
 await host.evaluate(()=>{const q=q001State();q.captainSpawned=true;q.captainDefeated=true;q.rescued=2;q.villagers=2;checkQ001Objective()});
 for(const page of pages)await page.waitForFunction(()=>g.campaign.lastQuestOutcome?.outcome==='Completed'&&questStatus('Q001')==='Completed');
 const completed=await canonical(host);
 expect(completed.gold).toBe(before.gold+75);expect(completed.reputation).toBe(before.reputation+1);
 for(const hero of ['Aldric','Lyra'])expect(completed.xp[hero]).toBe((before.xp[hero]||0)+100);
 const rewardId=before.equipmentDecks.Common[0];expect(rewardId).toBeTruthy();
 expect(await host.evaluate(id=>equipmentById(id)?.rarity,rewardId)).toBe('Common');
 expect(completed.equipmentDecks.Common).toEqual(before.equipmentDecks.Common.slice(1));
 expect(completed.inventory.Aldric).toEqual([...before.inventory.Aldric,{key:`equipment:${rewardId}`,kind:'equipment',id:rewardId,qty:1}]);
 expect(completed.inventory.Lyra).toEqual(before.inventory.Lyra);
 const receipts=Object.values(completed.campaign.questRewardReceipts33622||{}).filter(row=>row.quest==='Q001');expect(receipts).toHaveLength(1);
 expect(receipts[0].gold).toBe(75);expect(receipts[0].xpByHero).toEqual({Aldric:100,Lyra:100});expect(receipts[0].reputation).toBe(1);
 await host.getByRole('button',{name:'Proceed to Downtime →',exact:true}).click();
 for(const page of pages)await page.waitForFunction(()=>g.campaign.downtime===true&&!g.campaign.afterQuestExplore32920?.active);
 for(const page of pages)await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(completed.gold);
 await canonical(host);
}
async function openActivities(page){
 await page.getByRole('button',{name:'Downtime: Shop / Sell / Trade / Craft / Equipment',exact:true}).click();
 await page.locator('#invTabDowntime').click();
}
function heroActivities(page,hero){return page.locator('#downtimeActivityStatus .invCard').filter({hasText:hero})}
function work(page,hero){return heroActivities(page,hero).getByRole('button',{name:'Work · +25 Gold',exact:true})}

async function isolatedNativeRoom(browser,options={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-downtime-cost-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const selected=socket.address().port;socket.close(()=>resolve(selected))})});
 const url=`http://127.0.0.1:${port}/`,child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='',room;
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-50000)});
 async function close(){if(room)await room.close();if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated cost server exited');try{return(await fetch(`${url}health`)).ok}catch(_){return false}},{timeout:15000}).toBe(true);room=await nativeRoom(browser,url,options);return {...room,serverLog:()=>log,close}}
 catch(error){await close();throw error}
}

test('Quest completion: an actual pending consumable cost commits while authored rewards pay once on both clients',async({browser},info)=>{
 test.setTimeout(60000);const r=await isolatedNativeRoom(browser),host=r.pages[0];
 try{
  await host.evaluate(()=>ascRoomTurn33618.claim());await host.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');
  const before=await canonical(host);expect(before.inventory.Aldric.find(row=>row.id==='LT002')?.qty).toBe(1);
  const immediate=await host.evaluate(()=>{
   // Use the actual consumable path, then complete the objective in the same JS
   // task so its resource ACK cannot arrive between the cost and resolution.
   damageHeroBy('Aldric',4,'Quest completion cost fixture');useConsumable('Aldric','loot:LT002');
   const cost={potionQty:heroInventory('Aldric').filter(row=>row.id==='LT002').reduce((sum,row)=>sum+row.qty,0),actions:heroActionCount('Aldric'),resourceInFlight:!!ascendance3312().inFlight};
   const q=q001State();q.captainSpawned=true;q.captainDefeated=true;q.rescued=2;q.villagers=2;checkQ001Objective();
   return {cost,pending:ascQuestRewards33622.pending()};
  });
  expect(immediate.cost).toEqual({potionQty:0,actions:before.actions-1,resourceInFlight:true});expect(immediate.pending?.quest).toBe('Q001');
  for(const page of r.pages)await page.waitForFunction(()=>g.campaign.questStatus.Q001==='Completed'&&Object.values(g.campaign.questRewardReceipts33622||{}).some(row=>row.quest==='Q001'));
  const after=await canonical(host);
  expect(after.gold).toBe(before.gold+75);expect(after.reputation).toBe(before.reputation+1);expect(after.actions).toBe(before.actions-1);
  expect(after.xp.Aldric).toBe(before.xp.Aldric+100);expect(after.xp.Lyra).toBe(before.xp.Lyra+100);
  expect(after.inventory.Aldric.some(row=>row.id==='LT002')).toBe(false);expect(after.equipmentDecks.Common).toEqual(before.equipmentDecks.Common.slice(1));
  expect(Object.values(after.campaign.questRewardReceipts33622||{}).filter(row=>row.quest==='Q001')).toHaveLength(1);
  for(const page of r.pages){await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(after.gold);await expect.poll(()=>page.evaluate(()=>g.inventory.Aldric)).toEqual(after.inventory.Aldric)}
  // Replaying legacy reward counters and pre-cost resource data cannot erase the
  // consumed item or obtain another Quest reward from the accepted completion.
  await host.evaluate(before=>{const replay=serializableGameState();replay.game.gold=before.gold;replay.game.xp=before.xp;replay.game.inventory=before.inventory;replay.game.equipmentDecks=before.equipmentDecks;replay.game.campaign.q001RewardClaimed=false;replay.game.campaign.questStatus.Q001='Available';replay.game.campaign.questRewardReceipts33622={};mpSend('STATE',replay)},before);
  const replayed=await canonical(host);expect(replayed.gold).toBe(after.gold);expect(replayed.xp).toEqual(after.xp);expect(replayed.inventory).toEqual(after.inventory);expect(replayed.equipmentDecks).toEqual(after.equipmentDecks);expect(replayed.campaign.questStatus.Q001).toBe('Completed');expect(replayed.campaign.questRewardReceipts33622).toEqual(after.campaign.questRewardReceipts33622);
  await info.attach('pending-consumable-cost',{body:JSON.stringify({immediate,gold:after.gold,actions:after.actions,receipts:after.campaign.questRewardReceipts33622}),contentType:'application/json'});
 }finally{await info.attach('isolated-cost-server',{body:r.serverLog(),contentType:'text/plain'});await r.close()}
});

test('Quest completion guard: synthetic stale and rejected packets release masking only after canonical rollback',async({browser},info)=>{
 test.setTimeout(60000);const r=await isolatedNativeRoom(browser),host=r.pages[0];
 try{
  await host.evaluate(()=>ascRoomTurn33618.claim());await host.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');await canonical(host);
  const actual=await host.evaluate(()=>{
   const originalSend=mpSend,canonical=serializableGameState(),sent=[];
   // Keep this fixture local: the packet handler is real, while proposed network
   // snapshots are held so the synthetic rejection cannot race an accepted one.
   mpSend=function(type){sent.push(type);return false};
   const complete=()=>{const q=q001State();q.captainSpawned=true;q.captainDefeated=true;q.rescued=2;q.villagers=2;checkQ001Objective();return !!ascQuestRewards33622.pending()};
   try{
    const stalePending=complete();mpHandleMessage({type:'STATE_REJECTED',room:mpRoom,from:'SERVER',revision:mpRoomRevision,data:structuredClone(canonical)});
    const stale={pending:ascQuestRewards33622.pending(),gold:g.gold,status:g.campaign.questStatus.Q001,maskedGold:ascQuestRewards33622.resources({gold:321}).gold};
    const rejectedPending=complete();mpHandleMessage({type:'GAME_PATCH_REJECTED_3322',room:mpRoom,from:'SERVER',data:{reason:'Synthetic invalid completion evidence'}});
    const reasonOnly={pending:!!ascQuestRewards33622.pending(),requestedState:sent.includes('REQUEST_STATE')};
    mpHandleMessage({type:'ROOM_STATE',room:mpRoom,from:'SERVER',revision:mpRoomRevision,data:structuredClone(canonical)});
    const rolledBack={pending:ascQuestRewards33622.pending(),gold:g.gold,status:g.campaign.questStatus.Q001,maskedGold:ascQuestRewards33622.resources({gold:654}).gold};
    return {stalePending,stale,rejectedPending,reasonOnly,rolledBack,canonicalGold:canonical.game.gold};
   }finally{mpSend=originalSend}
  });
  expect(actual.stalePending).toBe(true);expect(actual.stale).toEqual({pending:null,gold:actual.canonicalGold,status:'Available',maskedGold:321});
  expect(actual.rejectedPending).toBe(true);expect(actual.reasonOnly).toEqual({pending:true,requestedState:true});
  expect(actual.rolledBack).toEqual({pending:null,gold:actual.canonicalGold,status:'Available',maskedGold:654});
  await info.attach('synthetic-quest-rejections',{body:JSON.stringify(actual),contentType:'application/json'});
 }finally{await r.close()}
});

for(const itemId of ['LT016','LT019','LT020'])test(`Quest completion: lethal ${itemId} consumes its item and Action before Q001 rewards on both clients`,async({browser},info)=>{
 test.setTimeout(60000);const r=await isolatedNativeRoom(browser,{fixtureItem:itemId}),host=r.pages[0];
 try{
  await host.evaluate(()=>ascRoomTurn33618.claim());await host.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');
  let current=await canonical(host);
  const changes=Object.values(current.tiles).flatMap(tile=>tile.enemies||[]).map(enemy=>({enemyId:enemy.roomEnemyId3301,remove:true}));
  expect((await request(host,'COMBAT_COMMAND',{hero:'Aldric',round:current.round,changes})).type).toBe('COMBAT_COMMAND_ACK');
  for(const page of r.pages)await page.waitForFunction(()=>Object.values(g.tiles).every(tile=>!tile.enemies?.length));
  await host.evaluate(()=>{
   // Establish the printed Q001 prerequisites and its final low-Health Captain,
   // then let the real consumable defeat/credit/objective chain resolve the Quest.
   const q=q001State();q.captainSpawned=true;q.captainDefeated=false;q.rescued=2;q.villagers=2;q.fires=0;
   const captain=encounterEnemy320('E006');captain.hp=2;g.tiles['0,0'].enemies.push(captain);render();mpScheduleState();
  });
  for(const page of r.pages)await page.waitForFunction(()=>g.tiles['0,0'].enemies.some(enemy=>enemy.name==='Goblin Captain'&&enemy.hp===2&&enemy.roomEnemyId3301));
  const before=await canonical(host);expect(before.inventory.Aldric.find(row=>row.id===itemId)?.qty).toBe(1);
  const immediate=await host.evaluate(itemId=>{useConsumable('Aldric','loot:'+itemId);return {count:heroInventory('Aldric').filter(row=>row.id===itemId).reduce((n,row)=>n+row.qty,0),actions:heroActionCount('Aldric'),completed:g.campaign.questStatus.Q001==='Completed'}},itemId);
  expect(immediate).toEqual({count:0,actions:before.actions-1,completed:true});
  for(const page of r.pages)await page.waitForFunction(()=>Object.values(g.campaign.questRewardReceipts33622||{}).some(row=>row.quest==='Q001'));
  const after=await canonical(host);expect(after.gold).toBe(before.gold+75);expect(after.xp.Aldric).toBe(before.xp.Aldric+100);expect(after.xp.Lyra).toBe(before.xp.Lyra+100);expect(after.reputation).toBe(before.reputation+1);
  expect(after.actions).toBe(before.actions-1);expect(after.inventory.Aldric.some(row=>row.id===itemId)).toBe(false);expect(after.equipmentDecks.Common).toEqual(before.equipmentDecks.Common.slice(1));
  expect(Object.values(after.tiles).flatMap(tile=>tile.enemies||[]).some(enemy=>enemy.name==='Goblin Captain')).toBe(false);
  for(const page of r.pages){await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(after.gold);await expect.poll(()=>page.evaluate(()=>g.inventory.Aldric)).toEqual(after.inventory.Aldric)}
  await info.attach('lethal-consumable-cost',{body:JSON.stringify({itemId,immediate,gold:after.gold,actions:after.actions,inventory:after.inventory.Aldric}),contentType:'application/json'});
 }finally{await info.attach('isolated-lethal-item-server',{body:r.serverLog(),contentType:'text/plain'});await r.close()}
});

test('Downtime: two actual clients earn both Work rewards once, without claiming the other Hero turn',async({browser},info)=>{
 test.setTimeout(60000);const r=await nativeRoom(browser);
 try{
  await completeAndProceed(r.pages);const before=await canonical(r.pages[0]),gold=before.gold;
  for(const page of r.pages)await openActivities(page);
  await Promise.all([work(r.pages[0],'Aldric').click(),work(r.pages[1],'Lyra').click()]);
  for(const page of r.pages){
   await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(gold+50);
   await expect.poll(()=>page.evaluate(()=>Object.keys(g.campaign.downtimeActivities3252||{}).sort())).toEqual(['Aldric','Lyra']);
   expect(await page.evaluate(()=>Object.values(g.campaign.downtimeActivities3252).map(x=>x.type))).toEqual(['Work','Work']);
  }
  const sent=r.frames.find(m=>m.client===0);expect(sent).toBeTruthy();
  const duplicate=await request(r.pages[0],'DOWNTIME_COMMAND',sent.data);
  expect(duplicate.type).toBe('DOWNTIME_COMMAND_ACK');
  expect((await command(r.pages[0])).type).toBe('DOWNTIME_COMMAND_REJECTED');
  expect((await canonical(r.pages[0])).gold).toBe(gold+50);
  // A legacy snapshot from the current room revision cannot erase committed choices
  // or replace the ledger's Gold, even though it is accepted as a compatibility patch.
  await r.pages[1].evaluate(gold=>{const stale=serializableGameState();stale.game.gold=gold;stale.game.campaign.downtimeActivities3252={};stale.game.campaign.researchPrep3252={};mpSend('STATE',stale)},gold);
  const after=await canonical(r.pages[0]);expect(after.gold).toBe(gold+50);expect(Object.keys(after.campaign.downtimeActivities3252).sort()).toEqual(['Aldric','Lyra']);
 }finally{await info.attach('downtime-commands',{body:JSON.stringify(r.frames,null,2),contentType:'application/json'});await r.close()}
});

test('Downtime: rejected requests do not spend a choice or change resources',async({browser})=>{
 test.setTimeout(60000);const r=await nativeRoom(browser);
 try{
  const before=await canonical(r.pages[0]);expect((await command(r.pages[0])).type).toBe('DOWNTIME_COMMAND_REJECTED');
  expect((await canonical(r.pages[0])).gold).toBe(before.gold);
  await completeAndProceed(r.pages);const earned=await canonical(r.pages[0]);
  for(const extra of [{hero:'Lyra'},{token:'expired-downtime'},{type:'Invented'},{type:'Gather',profession:'Invented'}])expect((await command(r.pages[0],'Work',extra)).type).toBe('DOWNTIME_COMMAND_REJECTED');
  const after=await canonical(r.pages[0]);expect(after.gold).toBe(earned.gold);expect(after.campaign.downtimeActivities3252||{}).toEqual({});
  await openActivities(r.pages[1]);await heroActivities(r.pages[1],'Lyra').getByRole('button',{name:'Craft',exact:true}).click();
  for(const page of r.pages)await expect.poll(()=>page.evaluate(()=>g.campaign.downtimeActivities3252?.Lyra?.type)).toBe('Craft');
  await openActivities(r.pages[0]);await work(r.pages[0],'Aldric').click();await expect.poll(()=>r.pages[0].evaluate(()=>g.gold)).toBe(earned.gold+25);
 }finally{await r.close()}
});

test('Downtime: native Gather and Research commit materials, preparation and both choices together',async({browser})=>{
 test.setTimeout(60000);const r=await nativeRoom(browser);
 try{
  await completeAndProceed(r.pages);const before=await canonical(r.pages[0]);
  const eligible=await r.pages[0].evaluate(()=>[...new Set(CRAFTING_RECIPES.filter(r=>coreProfession325(r)==='Blacksmithing'&&r.tier==='I').flatMap(r=>r.materials.map(m=>m.id)))]);
  for(const page of r.pages)await openActivities(page);
  await Promise.all([
   heroActivities(r.pages[0],'Aldric').locator('button[onclick*="Gather"][onclick*="Blacksmithing"]').click(),
   heroActivities(r.pages[1],'Lyra').locator('button[onclick*="Research"][onclick*="Alchemy"]').click()
  ]);
  for(const page of r.pages){
   await expect.poll(()=>page.evaluate(()=>g.campaign.downtimeActivities3252?.Aldric?.type)).toBe('Gather');
   await expect.poll(()=>page.evaluate(()=>g.campaign.researchPrep3252?.Lyra?.Alchemy)).toBe(1);
  }
  const after=await canonical(r.pages[0]);expect(after.gold).toBe(before.gold);
  expect(after.campaign.downtimeActivities3252.Lyra.type).toBe('Research');expect(after.campaign.downtimeActivities3252.Aldric.gained).toHaveLength(2);
  const quantities=new Map((before.inventory.Aldric||[]).map(x=>[x.key,x.qty]));let gained=0;
  for(const row of after.inventory.Aldric){const delta=row.qty-(quantities.get(row.key)||0);if(delta>0){expect(eligible).toContain(row.id);gained+=delta}}
  expect(gained).toBe(2);
  for(const page of r.pages)expect(await page.evaluate(()=>g.inventory.Aldric)).toEqual(after.inventory.Aldric);
 }finally{await r.close()}
});

test('Downtime: solo UI awards Work, two eligible Gather materials, Research and Craft once each',async({page})=>{
 await load(page);await page.evaluate(()=>{mpMode='local';init('Q001',['Aldric','Lyra','Seraphine','Rowan']);lobbyClose();const q=q001State();q.captainSpawned=true;q.captainDefeated=true;q.rescued=2;q.villagers=2;checkQ001Objective()});
 await page.getByRole('button',{name:'Proceed to Downtime →',exact:true}).click();await openActivities(page);
 const before=await page.evaluate(()=>({gold:g.gold,materials:heroInventory('Lyra').filter(x=>x.kind==='loot').reduce((n,x)=>n+x.qty,0),eligible:[...new Set(CRAFTING_RECIPES.filter(r=>coreProfession325(r)==='Blacksmithing'&&r.tier==='I').flatMap(r=>r.materials.map(m=>m.id)))],inventory:JSON.parse(JSON.stringify(g.inventory.Lyra||[]))}));
 await work(page,'Aldric').click();expect(await page.evaluate(()=>g.gold)).toBe(before.gold+25);
 await heroActivities(page,'Lyra').locator('button[onclick*="Gather"][onclick*="Blacksmithing"]').click();
 const gathered=await page.evaluate(()=>({inventory:g.inventory.Lyra,choice:g.campaign.downtimeActivities3252.Lyra}));
 expect(gathered.choice.type).toBe('Gather');expect(gathered.choice.gained).toHaveLength(2);
 const quantities=new Map(before.inventory.map(x=>[x.key,x.qty]));let gained=0;
 for(const row of gathered.inventory){const delta=row.qty-(quantities.get(row.key)||0);if(delta>0){expect(before.eligible).toContain(row.id);gained+=delta}}
 expect(gained).toBe(2);
 await heroActivities(page,'Seraphine').locator('button[onclick*="Research"][onclick*="Alchemy"]').click();
 expect(await page.evaluate(()=>g.campaign.researchPrep3252.Seraphine.Alchemy)).toBe(1);
 await heroActivities(page,'Rowan').getByRole('button',{name:'Craft',exact:true}).click();
 expect(await page.evaluate(()=>g.campaign.downtimeActivities3252.Rowan.type)).toBe('Craft');
 await page.evaluate(()=>chooseDowntimeActivity3252('Aldric','Work'));expect(await page.evaluate(()=>g.gold)).toBe(before.gold+25);
});

test('Downtime: off-turn native crafting consumes materials, one Research credit and then the printed Gold cost',async({browser})=>{
 test.setTimeout(60000);const r=await nativeRoom(browser,'/',{craftLyra:true});
 try{
  await completeAndProceed(r.pages);const page=r.pages[1],before=await canonical(r.pages[0]);
  expect(before.campaign.researchPrep3252.Lyra.Blacksmithing).toBe(1);
  expect(await page.evaluate(()=>ascRoomTurn33618.state().turnHero)).toBe('Aldric');
  await openActivities(page);await heroActivities(page,'Lyra').getByRole('button',{name:'Craft',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>g.campaign.downtimeActivities3252?.Lyra?.type)).toBe('Craft');
  await page.locator('#invTabCrafting').click();await page.locator('#craftSearch').fill('CR001');
  const button=page.locator('#craftingList .craftRecipe').filter({hasText:'CR001 — Iron Shortsword'}).getByRole('button',{name:'Craft',exact:true});
  const count=(game,id)=>(game.inventory.Lyra||[]).filter(row=>row.id===id).reduce((n,row)=>n+row.qty,0);
  const actions=before.roomAuthority3300.actions.Lyra;
  await expect(button).toBeEnabled();await button.click();
  for(const client of r.pages)await expect.poll(()=>client.evaluate(()=>g.campaign.researchPrep3252.Lyra.Blacksmithing)).toBe(0);
  const first=await canonical(r.pages[0]);expect(first.gold).toBe(before.gold);expect(count(first,'LT031')).toBe(count(before,'LT031')-2);expect(count(first,'LT034')).toBe(count(before,'LT034')-1);expect(count(first,'EQ002')).toBe(count(before,'EQ002')+1);expect(first.campaign.professionCraftedThisDowntime3280.Blacksmithing).toBe(true);expect(first.roomAuthority3300.actions.Lyra).toBe(actions);
  const sent=r.frames.find(m=>m.client===1&&m.data.op==='CRAFT_RECIPE');expect(sent).toBeTruthy();
  expect((await request(page,'DOWNTIME_COMMAND',sent.data)).type).toBe('DOWNTIME_COMMAND_ACK');
  const replay=await canonical(r.pages[0]);expect(replay.gold).toBe(first.gold);expect(replay.inventory.Lyra).toEqual(first.inventory.Lyra);
  await expect(button).toBeEnabled();await button.click();
  await expect.poll(async()=>count(await canonical(r.pages[0]),'EQ002')).toBe(count(before,'EQ002')+2);
  const second=await canonical(r.pages[0]);expect(second.gold).toBe(before.gold-10);expect(count(second,'LT031')).toBe(count(before,'LT031')-4);expect(count(second,'LT034')).toBe(count(before,'LT034')-2);expect(second.campaign.researchPrep3252.Lyra.Blacksmithing).toBe(0);expect(second.roomAuthority3300.actions.Lyra).toBe(actions);
  for(const client of r.pages){await expect.poll(()=>client.evaluate(()=>g.gold)).toBe(second.gold);expect(await client.evaluate(()=>g.inventory.Lyra)).toEqual(second.inventory.Lyra)}
  const missing=await command(page,'Craft',{op:'CRAFT_RECIPE',recipeId:'CR001'});expect(missing.type).toBe('DOWNTIME_COMMAND_REJECTED');expect((await canonical(r.pages[0])).gold).toBe(second.gold);
 }finally{await r.close()}
});

test('Downtime: off-turn native shopping, equipping, trading and selling preserve resources and reject forged Gold',async({browser},info)=>{
 test.setTimeout(60000);const r=await nativeRoom(browser,'/',{inventoryLyra:true});
 try{
  await completeAndProceed(r.pages);const page=r.pages[1],before=await canonical(r.pages[0]);
  const count=(game,hero,id)=>(game.inventory[hero]||[]).filter(row=>row.id===id).reduce((n,row)=>n+row.qty,0);
  await openActivities(page);await page.locator('#invTabMerchant').click();await page.locator('#merchantSearch3351').fill('EQ002');
  const shop=page.locator('#merchantList .invCard').filter({hasText:'EQ002'});const buy=shop.getByRole('button',{name:/^Buy \d+$/});const buyPrice=Number((await buy.textContent()).match(/\d+/)[0]);
  await buy.click();await expect.poll(async()=>count(await canonical(r.pages[0]),'Lyra','EQ002')).toBe(count(before,'Lyra','EQ002')+1);
  expect((await canonical(r.pages[0])).gold).toBe(before.gold-buyPrice);
  await page.locator('#invTabInventory').click();
  await page.locator('#inventoryList .invCard').filter({hasText:'EQ002'}).first().getByRole('button',{name:'Equip',exact:true}).click();
  for(const client of r.pages)await expect.poll(()=>client.evaluate(()=>g.equipped.Lyra.Weapon)).toBe('EQ002');
  await page.locator('#equippedList .invCard').filter({hasText:/^Weapon: Iron Shortsword/}).getByRole('button',{name:'Unequip',exact:true}).click();
  for(const client of r.pages)await expect.poll(()=>client.evaluate(()=>g.equipped.Lyra.Weapon)).toBe(null);
  await page.locator('#tradeList .invCard').filter({hasText:'Iron Shortsword'}).first().getByRole('button',{name:'Give to Aldric',exact:true}).click();
  await expect.poll(async()=>count(await canonical(r.pages[0]),'Aldric','EQ002')).toBe(count(before,'Aldric','EQ002')+1);
  const sell=page.locator('#inventoryList .invCard').filter({hasText:'EQ002'}).first().getByRole('button',{name:/^Sell \d+$/});const sellPrice=Number((await sell.textContent()).match(/\d+/)[0]);await sell.click();
  await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(before.gold-buyPrice+sellPrice);
  const after=await canonical(r.pages[0]);expect(after.campaign.downtimeActivities3252||{}).toEqual({});expect(count(after,'Lyra','EQ002')).toBe(count(before,'Lyra','EQ002')-1);expect(after.roomAuthority3300.actions.Lyra).toBe(before.roomAuthority3300.actions.Lyra);
  await page.locator('#invTabDowntime').click();await work(page,'Lyra').click();await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(after.gold+25);
  const n=await page.evaluate(()=>{const n=downtimeTestPackets.length;mpSend('REQUEST_RESOURCE_STATE',{});return n});
  await page.waitForFunction(n=>downtimeTestPackets.slice(n).some(m=>m.type==='RESOURCE_STATE'),n);
  const packet=await page.evaluate(n=>downtimeTestPackets.slice(n).find(m=>m.type==='RESOURCE_STATE').data,n);
  const forged=await request(page,'RESOURCE_COMMAND',{hero:'Lyra',round:after.round,baseSeq:packet.seq,resources:{...packet.resources,gold:packet.resources.gold+999}});expect(forged.type).toBe('RESOURCE_COMMAND_REJECTED');
  const final=await canonical(r.pages[0]);expect(final.gold).toBe(after.gold+25);expect(final.campaign.downtimeActivities3252.Lyra.type).toBe('Work');expect(final.inventory.Lyra).toEqual(after.inventory.Lyra);
 }finally{await info.attach('shopping-packets',{body:JSON.stringify(await Promise.all(r.pages.map(page=>page.evaluate(()=>({packets:downtimeTestPackets.filter(m=>/RESOURCE_COMMAND_(ACK|REJECTED)/.test(m.type)),gold:g.gold,inventory:g.inventory.Lyra})))),null,2),contentType:'application/json'});await r.close()}
});

test('Downtime: accepted choices and rewards survive an isolated server restart and native rejoin',async({browser},info)=>{
 test.setTimeout(90000);const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-downtime-restart-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const port=socket.address().port;socket.close(()=>resolve(port))})});
 const url=`http://127.0.0.1:${port}/`;let child,r,serverLog='';
 async function start(){child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{serverLog=(serverLog+data).slice(-50000)});await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated downtime server exited');try{return (await fetch(`${url}health`)).ok}catch(_){return false}},{timeout:15000}).toBe(true)}
 async function stop(){if(child&&child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}}
 try{
  await start();r=await nativeRoom(browser,url);await completeAndProceed(r.pages);
  const before=await canonical(r.pages[0]);await openActivities(r.pages[0]);await work(r.pages[0],'Aldric').click();
  for(const page of r.pages)await expect.poll(()=>page.evaluate(()=>g.gold)).toBe(before.gold+25);
  const saved=await canonical(r.pages[0]);const sent=r.frames.find(m=>m.client===0);expect(sent).toBeTruthy();
  const persisted=JSON.parse(fs.readFileSync(path.join(dir,`${r.code}.json`),'utf8'));
  expect(persisted.state.adventureStarted32723).toBe(true);expect(persisted.state.game.adventureStarted32723).toBe(true);
  for(const page of r.pages)await page.close();await stop();await start();
  const rejoined=[];
  for(const [i,context]of r.contexts.entries()){
   const page=await context.newPage();rejoined.push(page);await load(page,url);
   await page.evaluate(({code,hero})=>{lobbySetMultiplayerControls('remote',code,hero);mpConnect()},{code:r.code,hero:i?'Lyra':'Aldric'});
   await expect.poll(()=>page.evaluate(()=>({joined:mpJoinReady,socketOpen:mpSocket?.readyState===WebSocket.OPEN,downtime:g?.campaign?.downtime===true,active:document.body.dataset.ascAdventureActive==='1'})),{timeout:15000,message:'Native rejoin must restore the saved active adventure and Downtime'}).toEqual({joined:true,socketOpen:true,downtime:true,active:true});
   expect(await page.evaluate(()=>g.gold)).toBe(saved.gold);expect(await page.evaluate(()=>g.campaign.downtimeActivities3252.Aldric.type)).toBe('Work');
  }
  expect((await request(rejoined[0],'DOWNTIME_COMMAND',sent.data)).type).toBe('DOWNTIME_COMMAND_ACK');
  expect((await command(rejoined[0])).type).toBe('DOWNTIME_COMMAND_REJECTED');
  const after=await canonical(rejoined[0]);expect(after.gold).toBe(saved.gold);expect(after.campaign.downtimeActivities3252).toEqual(saved.campaign.downtimeActivities3252);
 }finally{await info.attach('isolated-downtime-server',{body:serverLog,contentType:'text/plain'});if(r)await r.close();await stop();fs.rmSync(dir,{recursive:true,force:true})}
});
