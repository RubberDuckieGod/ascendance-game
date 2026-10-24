const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
let server;
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-blight-patch-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-40000)});
 const url=`http://127.0.0.1:${port}/`;
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated Blight server exited');try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,close,log:()=>log}}
 catch(error){await close();throw error}
}
async function open(page,errors=[]){
 page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.dismiss());
 await page.goto(server.url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascBlightPatch33624?.ready&&window.ascBlightEncounterRules33624);
 await page.evaluate(()=>{window.patchPackets=[];const before=mpHandleMessage;mpHandleMessage=function(message){patchPackets.push(message);return before.apply(this,arguments)}});
}
function fixture(enemy=false,staff=false,recovery=false){
 const tile=g.tiles['0,0'];tile.blightPatches33624=1;delete tile.blightHealingSuppressedRound33624;tile.enemies=[];
 if(enemy)tile.enemies.push(encounterEnemy320('E069'));
 for(const hero of partyHeroes()){const st=searchHeroState(hero);st.hp=(st.maxHp||9)-4;st.x=0;st.y=0}
 if(staff){g.equipped.Vaelis.Weapon='EQ066';g.equipped.Vaelis.Offhand=null;g.equipped.Vaelis.Shield=null;runtimeHeroState('Vaelis').hp=5}
 if(recovery){const st=runtimeHeroState('Rowan');st.hp=1;g.campaign.c4Blight=2;g.inventory.Rowan.push({key:'loot:LT157',kind:'loot',id:'LT157',qty:1});g.encDeck=[structuredClone(ENCS.find(c=>c.id==='EN061'))];g.encDiscard=[];}
 g.gold=47;render();
}
async function offline(page,quest='Q040'){
 await open(page);await page.evaluate(({quest,prepare})=>{init(quest,['Rowan','Lyra']);lobbySetMultiplayerControls('local','PATCH-OFFLINE','Rowan');lobbyClose();(0,eval)('('+prepare+')')()}, {quest,prepare:fixture.toString()});
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=patchPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>patchPackets.slice(at).some(message=>message.type==='ROOM_STATE'),at);
 return page.evaluate(at=>patchPackets.slice(at).find(message=>message.type==='ROOM_STATE').data.game,at);
}
async function nativeRoom(browser,{count=1,enemy=false,hero='Rowan',staff=false,recovery=false}={}){
 const errors=[],contexts=[],pages=[],code=`PATCH${Date.now()}${Math.floor(Math.random()*10000)}`;
 for(let i=0;i<count;i++){const context=await browser.newContext();contexts.push(context);const page=await context.newPage();pages.push(page);await open(page,errors)}
 await pages[0].evaluate(({code,enemy,hero,staff,recovery,prepare})=>{
  const before=init;init=function(){const out=before.apply(this,arguments);(0,eval)('('+prepare+')')(enemy,staff,recovery);return out};
  init('Q040',[hero]);lobbySetMultiplayerControls('remote',code,hero);mpFreshNewGame32529=true;mpConnect();
 },{code,enemy,hero,staff,recovery,prepare:fixture.toString()});
 await pages[0].waitForFunction(hero=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(player=>player.hero===hero),hero);
 if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(player=>player.hero==='Lyra'))}
 for(const page of pages)await page.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(player=>player.ready).length)).toBe(count);
 await pages[0].evaluate(()=>partyStart32716());
 for(const page of pages)await page.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
 await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(hero=>ascRoomTurn33618.state()?.turnHero===hero,hero);
 return {pages,contexts,code,errors,close:()=>Promise.allSettled(contexts.map(context=>context.close()))};
}
async function command(page,op,hero){
 const id=`PATCH-TEST-${Date.now()}-${Math.random()}`,at=await page.evaluate(({id,op,hero})=>{const at=patchPackets.length;mpSend('MECHANICS_COMMAND',{id,op,hero,round:g.round});return at},{id,op,hero});
 await page.waitForFunction(({id,at})=>patchPackets.slice(at).some(message=>message.data?.id===id&&/_(ACK|REJECTED)$/.test(message.type)),{id,at});
 return page.evaluate(({id,at})=>patchPackets.slice(at).find(message=>message.data?.id===id&&/_(ACK|REJECTED)$/.test(message.type)),{id,at});
}
test.beforeAll(async()=>{server=await isolatedServer()});
test.afterAll(async()=>{await server?.close()});

for(const online of [false,true])test(`Blight Patch: ${online?'online':'offline'} fatal Phoenix recovery respects the existing patch before the next heal`,async({browser})=>{
 let room,context,page;
 try{
  if(online){room=await nativeRoom(browser,{recovery:true});page=room.pages[0]}
  else{context=await browser.newContext();page=await context.newPage();await offline(page);await page.evaluate(prepare=>(0,eval)('('+prepare+')')(false,false,true),fixture.toString())}
  page.removeAllListeners('dialog');page.on('dialog',dialog=>dialog.type()==='confirm'?dialog.accept():dialog.dismiss());
  await page.evaluate(()=>startEncounter('Search Card',{x:0,y:0,hero:'Rowan',fixedSeverity:4}));
  await page.waitForFunction(()=>pEnc?.card?.id==='EN061'&&pEnc.severity===4);
  await page.locator('#resolveEnc').click();await page.waitForFunction(()=>!pEnc);
  const after=online?await canonical(page):await page.evaluate(()=>structuredClone(g));
  expect(after.heroRuntimeStates.Rowan.hp).toBe(8);expect(after.campaign.phoenixHeartSpent33612).toBe(true);
  expect(after.tiles['0,0'].blightHealingSuppressedRound33624).toBe(String(after.round));expect(after.tiles['0,0'].blightPatches33624).toBe(1);
  await page.evaluate(()=>{healHeroBy('Rowan',1,'Recovery after Phoenix');mpScheduleState()});
  await expect.poll(async()=>online?(await canonical(page)).heroRuntimeStates.Rowan.hp:page.evaluate(()=>runtimeHeroState('Rowan').hp)).toBe(9);
 }finally{if(room)await room.close();if(context)await context.close()}
});

test('Blight Patch: a visible graphic follows the exact Location and disappears after cleansing its last patch',async({page})=>{
 await offline(page);
 await page.evaluate(()=>{
  const original=g.tiles['0,0'];original.blightPatches33624=0;
  g.tiles['1,0']={...structuredClone(original),blightPatches33624:2};
  const hero=runtimeHeroState('Rowan');hero.x=1;hero.y=0;hero.actions=3;render();
 });
 const target=page.locator('#board .tile[data-key="1,0"] .ascBlightMarker33624');
 await expect(target).toBeVisible();await expect(target).toContainText('×2');await expect(target.locator('svg')).toBeVisible();
 const clear=await target.evaluate(el=>el.getBoundingClientRect().bottom<=el.parentElement.querySelector('.tname').getBoundingClientRect().top);expect(clear).toBe(true);
 await expect(page.locator('#board .tile[data-key="0,0"] .ascBlightMarker33624')).toHaveCount(0);
 await page.locator('#cleanseBlight33624').click();await expect(target).toContainText('×1');
 await page.locator('#cleanseBlight33624').click();await expect(target).toHaveCount(0);
 expect(await page.evaluate(()=>heroActionCount('Rowan'))).toBe(1);
});

test('Blight Patch WE014: actual healing loses one Health only once per Location per Round across both healing paths',async({page},info)=>{
 await offline(page);
 const actual=await page.evaluate(()=>{
  const st=runtimeHeroState('Rowan'),before=st.hp;healHeroBy('Rowan',2,'Patch first heal');const first=st.hp;
  searchHeal('Rowan',2,'Patch second heal');const second=st.hp,round=g.round;g.round++;
  st.hp-=2;const nextBefore=st.hp;healHeroBy('Rowan',2,'Patch next Round');const nextAfter=st.hp;
  // The Chalice modifies the real Rest healing pipeline before the Patch removes
  // one point from the resulting recovery. It is not a separate heal attempt.
  g.round++;addInventoryItem('Lyra','LT141','loot',1);const lyraBefore=g.lyra.hp;healHeroBy('Lyra',2,'Rest with Chalice');
  return {before,first,second,round,nextBefore,nextAfter,buffedRest:g.lyra.hp-lyraBefore,meter:g.tiles['0,0'].blightHealingSuppressedRound33624,patches:g.tiles['0,0'].blightPatches33624};
 });
 expect(actual.first-actual.before).toBe(1);expect(actual.second-actual.first).toBe(2);expect(actual.nextAfter-actual.nextBefore).toBe(1);expect(actual.buffedRest).toBe(2);expect(actual.meter).toBe(String(actual.round+2));expect(actual.patches).toBe(1);
 await info.attach('blight-patch-healing-measurement',{body:JSON.stringify({expected:{first:1,second:2,nextRoundFirst:1},actual}),contentType:'application/json'});
});

test('Blight Patch WE014: healing at maximum Health does not spend the Location suppression',async({page},info)=>{
 await offline(page);
 const actual=await page.evaluate(()=>{
  const st=runtimeHeroState('Rowan');st.hp=st.maxHp;healHeroBy('Rowan',2,'Capped patch healing');const capped={hp:st.hp,max:st.maxHp,meter:g.tiles['0,0'].blightHealingSuppressedRound33624??null};
  st.hp-=4;const before=st.hp;searchHeal('Rowan',2,'First actual patch healing');const after=st.hp,meter=g.tiles['0,0'].blightHealingSuppressedRound33624,round=g.round;
  init('Q040',['Rowan','Seraphine']);lobbySetMultiplayerControls('local','PATCH-BLOCKED','Rowan');lobbyClose();const tile=g.tiles['0,0'];tile.blightPatches33624=1;tile.enemies=[];delete tile.blightHealingSuppressedRound33624;
  const rowan=runtimeHeroState('Rowan');rowan.hp=rowan.maxHp-4;const blockedBefore=rowan.hp,handBefore=structuredClone(g.seraphineHand);healHeroBy('Rowan',1,'Fully suppressed Patch heal');
  const blocked={hpBefore:blockedBefore,hpAfter:rowan.hp,seraphineHandBefore:handBefore,seraphineHandAfter:g.seraphineHand};
  return {capped,before,after,meter,round,blocked};
 });
 expect(actual.capped.hp).toBe(actual.capped.max);expect(actual.capped.meter).toBeNull();expect(actual.after-actual.before).toBe(1);expect(actual.meter).toBe(String(actual.round));expect(actual.blocked.hpAfter).toBe(actual.blocked.hpBefore);expect(actual.blocked.seraphineHandAfter).toEqual(actual.blocked.seraphineHandBefore);
 await info.attach('blight-patch-capped-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
});

test('Blight Patch event scope: a Patch outside WE014 leaves actual healing unchanged',async({page},info)=>{
 await offline(page,'Q037');
 const actual=await page.evaluate(()=>{const st=runtimeHeroState('Rowan'),before=st.hp;healHeroBy('Rowan',2,'WE013 patch heal');return {event:g.campaign.activeEvent,before,after:st.hp,meter:g.tiles['0,0'].blightHealingSuppressedRound33624??null,patches:g.tiles['0,0'].blightPatches33624}});
 expect(actual.event).toBe('WE013');expect(actual.after-actual.before).toBe(2);expect(actual.meter).toBeNull();expect(actual.patches).toBe(1);
 await info.attach('blight-patch-event-scope-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
});

test('Blight Patch offline cleanse: an Enemy or zero Actions prevents payment; a legal cleanse removes one Patch for one Action',async({page},info)=>{
 await offline(page);
 const actual=await page.evaluate(async()=>{
  const st=runtimeHeroState('Rowan'),tile=g.tiles['0,0'];tile.blightPatches33624=2;tile.enemies=[encounterEnemy320('E069')];const before=st.actions;
  await ascBlightPatch33624.cleanse('Rowan');const enemy={actions:st.actions,patches:tile.blightPatches33624};tile.enemies=[];st.actions=0;
  await ascBlightPatch33624.cleanse('Rowan');const empty={actions:st.actions,patches:tile.blightPatches33624};st.actions=before;render();return {before,enemy,empty};
 });
 expect(actual.enemy).toEqual({actions:actual.before,patches:2});expect(actual.empty).toEqual({actions:0,patches:2});
 await expect(page.locator('#cleanseBlight33624')).toBeEnabled();await page.locator('#cleanseBlight33624').click();
 expect(await page.evaluate(()=>({actions:heroActionCount('Rowan'),patches:g.tiles['0,0'].blightPatches33624}))).toEqual({actions:actual.before-1,patches:1});
 await info.attach('blight-patch-offline-cleanse-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
});

test('Blight Patch online solo: canonical healing applies suppression once and button cleanse costs one Action across reconnect',async({browser},info)=>{
 test.setTimeout(60000);const room=await nativeRoom(browser);let page=room.pages[0];
 try{
  const before=await canonical(page),hp=before.heroRuntimeStates.Rowan.hp;
  await page.evaluate(()=>{healHeroBy('Rowan',2,'Online patch healing');mpScheduleState()});
  await expect.poll(async()=>{const saved=await canonical(page);return {hp:saved.heroRuntimeStates.Rowan.hp,meter:saved.tiles['0,0'].blightHealingSuppressedRound33624}}).toEqual({hp:hp+1,meter:String(before.round)});
  await expect.poll(()=>page.evaluate(()=>runtimeHeroState('Rowan').hp)).toBe(hp+1);
  await expect(page.locator('#cleanseBlight33624')).toBeEnabled();await page.locator('#cleanseBlight33624').click();
  await expect.poll(async()=>{const saved=await canonical(page);return {actions:saved.roomAuthority3300.actions.Rowan,patches:saved.tiles['0,0'].blightPatches33624}}).toEqual({actions:2,patches:0});
  await page.close();page=await room.contexts[0].newPage();room.pages[0]=page;await open(page,room.errors);await page.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);
  await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');
  const rejoined=await canonical(page);expect(rejoined.heroRuntimeStates.Rowan.hp).toBe(hp+1);expect(rejoined.roomAuthority3300.actions.Rowan).toBe(2);expect(rejoined.tiles['0,0'].blightPatches33624).toBe(0);expect(rejoined.tiles['0,0'].blightHealingSuppressedRound33624).toBe(String(before.round));expect(room.errors).toEqual([]);
  await info.attach('blight-patch-online-solo-measurement',{body:JSON.stringify({beforeHp:hp,rejoinedHp:rejoined.heroRuntimeStates.Rowan.hp,actions:rejoined.roomAuthority3300.actions.Rowan,patches:rejoined.tiles['0,0'].blightPatches33624}),contentType:'application/json'});
 }finally{await room.close()}
});

test('Blight Patch two clients: co-located Heroes share one suppression and unauthorized or Enemy-blocked cleanses preserve resources',async({browser},info)=>{
 test.setTimeout(60000);const room=await nativeRoom(browser,{count:2,enemy:true}),host=room.pages[0],peer=room.pages[1];
 try{
  const before=await canonical(host),hp=before.heroRuntimeStates.Rowan.hp,lyraHp=before.lyra.hp;
  await host.evaluate(()=>{healHeroBy('Rowan',2,'Shared patch first healing');mpScheduleState()});
  await expect.poll(async()=>{const saved=await canonical(host);return saved.heroRuntimeStates.Rowan.hp}).toBe(hp+1);
  const foreign=await command(peer,'CLEANSE_BLIGHT','Rowan');expect(foreign.type).toBe('MECHANICS_COMMAND_REJECTED');expect(foreign.data.reason).toMatch(/own Hero/i);
  const blocked=await command(host,'CLEANSE_BLIGHT','Rowan');expect(blocked.type).toBe('MECHANICS_COMMAND_REJECTED');expect(blocked.data.reason).toMatch(/Enemies/i);
  const unchanged=await canonical(host);expect(unchanged.tiles['0,0'].blightPatches33624).toBe(1);expect(unchanged.roomAuthority3300.actions.Rowan).toBe(3);
  await host.evaluate(()=>ascRoomTurn33618.end());await peer.evaluate(()=>ascRoomTurn33618.claim());await peer.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Lyra');
  await peer.evaluate(()=>{searchHeal('Lyra',2,'Shared patch second Hero healing');mpScheduleState()});
  await expect.poll(async()=>{const saved=await canonical(peer);return saved.lyra.hp}).toBe(lyraHp+2);
  for(const client of room.pages)await expect.poll(()=>client.evaluate(()=>({rowan:runtimeHeroState('Rowan').hp,lyra:g.lyra.hp,patches:g.tiles['0,0'].blightPatches33624,meter:g.tiles['0,0'].blightHealingSuppressedRound33624}))).toEqual({rowan:hp+1,lyra:lyraHp+2,patches:1,meter:String(before.round)});
  expect(room.errors).toEqual([]);await info.attach('blight-patch-two-client-measurement',{body:JSON.stringify({expected:{rowanGain:1,lyraGain:2,patches:1,rowanActions:3},foreignReason:foreign.data?.reason,enemyReason:blocked.data?.reason}),contentType:'application/json'});
 }finally{await room.close()}
});

test('Blight Patch online Rest: the real two-Action Rest commits exactly one suppressed recovery',async({browser},info)=>{
 test.setTimeout(60000);const room=await nativeRoom(browser),page=room.pages[0];
 try{
  const before=await canonical(page),hp=before.heroRuntimeStates.Rowan.hp;
  expect(before.inventory.Rowan.some(row=>row.id==='LT012'&&row.qty>0)).toBe(false);
  await page.locator('#mechanicsActions33621').getByRole('button',{name:'Rest · 2 Actions',exact:true}).click();
  await expect.poll(async()=>{const saved=await canonical(page);return {hp:saved.heroRuntimeStates.Rowan.hp,actions:saved.roomAuthority3300.actions.Rowan,meter:saved.tiles['0,0'].blightHealingSuppressedRound33624}}).toEqual({hp:hp+1,actions:1,meter:String(before.round)});
  expect(room.errors).toEqual([]);await info.attach('blight-patch-online-rest-measurement',{body:JSON.stringify({beforeHp:hp,expectedHp:hp+1,expectedActions:1}),contentType:'application/json'});
 }finally{await room.close()}
});

test('Blight Patch real round worker: EQ066 Nature’s Blessing is suppressed once, then recovers Health after a legal cleanse',async({browser},info)=>{
 test.setTimeout(90000);const room=await nativeRoom(browser,{hero:'Vaelis',staff:true}),page=room.pages[0];
 try{
  const before=await canonical(page),hp=before.heroRuntimeStates.Vaelis.hp;expect(hp).toBe(5);expect(before.equipped.Vaelis.Weapon).toBe('EQ066');expect(before.tiles['0,0'].terrain).toMatch(/Forest|Grove/i);
  await page.evaluate(()=>ascRoomTurn33618.end());await page.waitForFunction(round=>g.round===round+1&&g.phase==='Hero Phase',before.round,{timeout:15000});
  const suppressed=await canonical(page);expect(suppressed.heroRuntimeStates.Vaelis.hp).toBe(hp);expect(suppressed.tiles['0,0'].blightPatches33624).toBe(1);expect(suppressed.tiles['0,0'].blightHealingSuppressedRound33624).toBe(String(before.round+1));
  const messages=await page.evaluate(()=>g.adventureLog.map(row=>typeof row==='string'?row:JSON.stringify(row)));expect(messages.some(row=>row.includes('Nature’s Blessing')&&/recovers? 0/.test(row))).toBe(true);expect(messages.some(row=>row.includes('Blight Patch')&&row.includes('reduced by 1'))).toBe(true);
  await page.evaluate(()=>ascRoomTurn33618.claim());await page.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Vaelis');
  await page.locator('#cleanseBlight33624').click();await expect.poll(async()=>{const saved=await canonical(page);return {patches:saved.tiles['0,0'].blightPatches33624,actions:saved.roomAuthority3300.actions.Vaelis}}).toEqual({patches:0,actions:2});
  await page.evaluate(()=>ascRoomTurn33618.end());await page.waitForFunction(round=>g.round===round+2&&g.phase==='Hero Phase',before.round,{timeout:15000});
  const cleansed=await canonical(page);expect(cleansed.heroRuntimeStates.Vaelis.hp).toBe(hp+1);expect(cleansed.tiles['0,0'].blightPatches33624).toBe(0);expect(room.errors).toEqual([]);
  await info.attach('blight-patch-real-phase-worker-measurement',{body:JSON.stringify({before:{hp,round:before.round},suppressed:{hp:suppressed.heroRuntimeStates.Vaelis.hp,round:suppressed.round,meter:suppressed.tiles['0,0'].blightHealingSuppressedRound33624},cleansed:{hp:cleansed.heroRuntimeStates.Vaelis.hp,round:cleansed.round,patches:cleansed.tiles['0,0'].blightPatches33624}}),contentType:'application/json'});
 }finally{await room.close()}
});
