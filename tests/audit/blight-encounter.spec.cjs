const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');

// Only initial conditions are supplied by the fixture. Drawing, choosing a card,
// resolving, syncing and reconnecting use the game's real browser/room paths.
function prepareBlight({emptyHand=false,scope=false,apart=false,armor=null,actorHero='Rowan',reaction=false,blight=2,fatal=false}={}){
 g.campaign.c4Blight=blight;g.round=2;
 const row=structuredClone(ENCS.find(c=>c.id==='EN061'));if(!row)throw Error('Missing authored EN061');
 g.encDeck=[row];g.encDiscard=[];
 const tile=g.tiles['0,0'];Object.assign(tile,{id:'BLIGHT-AUDIT-FOREST',name:'Blight Test Forest',terrain:'Forest',type:'Outdoor',traits:['Forest'],visited:false,enc:true,enemies:[],special:'None',ongoing:'None',edges:{N:true,E:true,S:true,W:true}});
 g.tiles['1,0']={...structuredClone(tile),id:'BLIGHT-AUDIT-ROAD',name:'Blight Test Road',terrain:'Road',traits:['Road'],visited:true,enc:false};
 const actor=runtimeHeroState(actorHero),cards=[...actor.hand,...actor.deck,...actor.discard];
 // A spent card makes this a real in-progress hand rather than the pristine
 // five-card opening-hand repair case. All 30 authored cards are conserved.
 actor.hand=emptyHand?[]:cards.slice(0,5);actor.deck=emptyHand?cards.slice(0,-1):cards.slice(5,-1);actor.discard=cards.slice(-1);actor.hp=7;actor.maxHp=9;actor.actions=3;actor.x=actor.y=0;actor.conditions=[];
 if(armor)g.equipped[actorHero].Armor=armor;
 if(reaction){const shield=cards.find(c=>c.id==='H012-013');if(!shield)throw Error('Missing authored H012-013');const rest=cards.filter(c=>c.uid!==shield.uid);actor.hand=[shield];actor.deck=rest.slice(0,-1);actor.discard=rest.slice(-1);g.equipped[actorHero].Armor='EQ082';g.levels[actorHero]=1;g.xp[actorHero]=0}
 if(fatal){actor.hp=1;g.equipped[actorHero].Armor='EQ082'}
 g.hp=10;g.actions=3;g.hero.x=apart?1:0;g.hero.y=0;
 g.lyra.hp=6;g.lyra.x=1;g.lyra.y=0;g.seraphine.hp=0;g.seraphine.x=g.seraphine.y=0;
 for(const h of partyHeroes())g.inventory[h]=(g.inventory[h]||[]).filter(x=>!['LT055','LT056','LT058','LT059','LT060'].includes(x.id));
 render();
}
function inspectBlight(game){
 const heroes={};
 for(const h of game.partyHeroes||[]){
  let s,hand,discard,actions;
  if(h==='Aldric'){s={hp:game.hp,x:game.hero.x,y:game.hero.y};hand=game.heroHand;discard=game.heroDiscard;actions=game.actions}
  else if(h==='Lyra'){s=game.lyra;hand=game.lyraHand;discard=game.lyraDiscard;actions=s.actions}
  else if(h==='Seraphine'){s=game.seraphine;hand=game.seraphineHand;discard=game.seraphineDiscard;actions=s.actions}
  else{s=game.heroRuntimeStates[h];hand=s.hand;discard=s.discard;actions=s.actions}
  heroes[h]={hp:s.hp,x:s.x,y:s.y,actions:game.roomAuthority3300?.actions?.[h]??actions,hand:(hand||[]).map(c=>c.uid),discard:(discard||[]).map(c=>c.uid)};
 }
 const herbs=Object.values(game.inventory||{}).flat().filter(x=>x.id==='LT055');
 const tile=game.tiles['0,0'];
 return {heroes,herbs:herbs.map(x=>({id:x.id,qty:x.qty})),herbCount:herbs.reduce((n,x)=>n+Number(x.qty||0),0),discard:(game.encDiscard||[]).filter(c=>c.id==='EN061').length,visited:tile.visited,patches:tile.blightPatches33624??0};
}
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-blight-'));
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
 let child,log='';
 function start(){child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});for(const stream of [child.stdout,child.stderr])stream.on('data',data=>{log=(log+data).slice(-30000)})}
 start();
 const url=`http://127.0.0.1:${port}/`;
 async function stop(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}}
 async function ready(){await expect.poll(async()=>{if(child.exitCode!==null)throw Error('Isolated Blight server exited');try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true)}
 async function close(){await stop();fs.rmSync(dir,{recursive:true,force:true})}
 try{await ready();return {url,close,log:()=>log,savedState:room=>JSON.parse(fs.readFileSync(path.join(dir,`${room}.json`),'utf8')).state,restart:async()=>{await stop();start();await ready()}}}
 catch(error){await close();throw error}
}
async function open(page,url,room){
 page.on('pageerror',e=>room.errors.push(e.message));
 page.on('dialog',d=>{room.dialogs.push({type:d.type(),message:d.message()});if(d.type()==='prompt')return room.cancelPrompt?d.dismiss():d.accept(room.promptAnswer??'2');if(d.type()==='confirm'&&room.acceptReaction&&/Stonehide Endurance|Ironhide|Reduce|damage/i.test(d.message()))return d.accept();return d.dismiss()});
 page.on('websocket',ws=>ws.on('framesent',frame=>{try{const m=JSON.parse(String(frame.payload));if(m.type==='EXPLORATION_COMMAND'&&m.data?.op==='ENCOUNTER_RESOLVE')room.resolveCommands.push(m.data)}catch(_){}}));
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascMechanics33621);
 await page.evaluate(()=>{window.blightPackets=[];const old=mpHandleMessage;mpHandleMessage=function(m){blightPackets.push(structuredClone(m));return old.apply(this,arguments)}});
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=blightPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>blightPackets.slice(at).some(m=>m.type==='ROOM_STATE'),at);
 return page.evaluate(at=>blightPackets.slice(at).find(m=>m.type==='ROOM_STATE').data.game,at);
}
async function setup(browser,server,mode,options={}){
 const online=mode!=='offline solo',count=mode==='online two clients'?2:1,actorHero=options.actorHero||'Rowan';
 const room={errors:[],dialogs:[],resolveCommands:[],contexts:[],pages:[],online,actorHero,code:`BLIGHT${Date.now()}${Math.floor(Math.random()*10000)}`};
 room.close=()=>Promise.allSettled(room.contexts.map(c=>c.close()));
 for(let i=0;i<count;i++){const c=await browser.newContext();room.contexts.push(c);const p=await c.newPage();room.pages.push(p);await open(p,server.url,room)}
 await room.pages[0].evaluate(({prepare,online,code,options})=>{
  const old=init;init=function(){const result=old.apply(this,arguments);(0,eval)('('+prepare+')')(options);return result};
  init('Q037',options.scope?['Rowan','Aldric','Lyra','Seraphine']:[options.actorHero||'Rowan']);lobbySetMultiplayerControls(online?'remote':'local',code,options.actorHero||'Rowan');lobbyClose();
  if(online){mpFreshNewGame32529=true;mpConnect()}
 },{prepare:prepareBlight.toString(),online,code:room.code,options});
 if(online){
  await room.pages[0].waitForFunction(hero=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero===hero),actorHero);
  if(count===2){await room.pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Aldric');mpConnect()},room.code);await room.pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Aldric'))}
  for(const p of room.pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
  await expect.poll(()=>room.pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(count);
  await room.pages[0].evaluate(()=>partyStart32716());
  for(const p of room.pages)await p.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
  await room.pages[0].evaluate(()=>ascRoomTurn33618.claim());await room.pages[0].waitForFunction(hero=>ascRoomTurn33618.state()?.turnHero===hero,actorHero);
  if(options.emptyHand){
   // Starting a new room correctly draws its opening five. The empty-hand
   // scenario begins after those cards have been spent; conserve every UID and
   // establish that fixture through the actual room resource ledger.
   await room.pages[0].evaluate(hero=>{const st=runtimeHeroState(hero);st.discard.push(...st.hand.splice(0));mpScheduleState()},actorHero);
   await expect.poll(async()=>{const saved=await canonical(room.pages[0]);return saved.heroRuntimeStates[actorHero].hand.length}).toBe(0);
  }
 }
 return room;
}
async function draw(page,severity){
 await page.evaluate(severity=>startEncounter('First Visit',{x:0,y:0,hero:controlledHero(),fixedSeverity:severity,firstVisitTileKey:'0,0'}),severity);
 await page.waitForFunction(severity=>pEnc?.card?.id==='EN061'&&pEnc.severity===severity,severity);
}
async function drawAndResolve(page,severity){
 await draw(page,severity);
 await expect(page.locator('#resolveEnc')).toBeEnabled();await page.locator('#resolveEnc').click();
 try{await page.waitForFunction(()=>!pEnc,null,{timeout:10000})}
 catch(error){const detail=await page.evaluate(()=>({runtime:!!window.ascBlightEncounter33624,pending:pEnc?.card?.id,log:g.adventureLog.slice(0,4),rejections:blightPackets.filter(m=>m.type.endsWith('_REJECTED')).slice(-4).map(m=>({type:m.type,reason:m.data?.reason}))}));throw Error(`${error.message}\nBlight resolution diagnostic: ${JSON.stringify(detail)}`)}
}
async function snapshot(page){return page.evaluate(impl=>(0,eval)('('+impl+')')(g),inspectBlight.toString())}
async function savedSnapshot(page){return inspectBlight(await canonical(page))}
async function rejoin(room,server){
 await room.pages[0].close();const page=await room.contexts[0].newPage();room.pages[0]=page;await open(page,server.url,room);
 await page.evaluate(({code,hero})=>{lobbySetMultiplayerControls('remote',code,hero);mpConnect()},{code:room.code,hero:room.actorHero||'Rowan'});
 await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');return page;
}

for(const mode of ['offline solo','online one Hero','online two clients'])for(const severity of [2,4,6,7])test(`Blight Spores: ${mode}, Severity ${severity} applies its actual effects and Herb reward`,async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={mode,severity};
 try{
  room=await setup(browser,server,mode);const page=room.pages[0],before=await snapshot(page);measured.before=before;
  // Native room activation draws its normal two start-turn cards before the
  // Encounter. The offline in-progress fixture already represents that turn.
  expect(before.heroes.Rowan.hand).toHaveLength(room.online?7:5);expect(before.herbCount).toBe(0);
  await drawAndResolve(page,severity);
  const expected=structuredClone(before);if(severity<=2){expected.heroes.Rowan.hand.splice(1,1);expected.heroes.Rowan.discard.push(before.heroes.Rowan.hand[1])}else{expected.heroes.Rowan.hp--;if(severity>=5&&expected.heroes.Aldric)expected.heroes.Aldric.hp--}
  expected.herbCount=1;expected.discard=1;expected.visited=true;expected.patches=severity>=5?1:0;
  for(const client of room.pages){await expect.poll(async()=>{const s=await snapshot(client);return {heroes:s.heroes,herbCount:s.herbCount,discard:s.discard,visited:s.visited,patches:s.patches}}).toEqual({heroes:expected.heroes,herbCount:1,discard:1,visited:true,patches:expected.patches})}
  measured.after=await snapshot(page);expect(measured.after.herbs).toEqual([{id:'LT055',qty:1}]);
  expect(room.dialogs.filter(d=>d.type==='confirm'||/not automated|manually/i.test(d.message))).toEqual([]);
  if(severity<=2)expect(room.dialogs.filter(d=>d.type==='prompt')).toHaveLength(1);
  if(room.online){
   const saved=await savedSnapshot(page);measured.canonical=saved;expect(saved).toEqual(measured.after);
   const command=room.resolveCommands.at(-1);expect(command?.op).toBe('ENCOUNTER_RESOLVE');
   // The exact same command must not grant a second material, damage twice,
   // duplicate the discarded card or consume a second encounter.
   const at=await page.evaluate(()=>blightPackets.length);await page.evaluate(cmd=>mpSend('EXPLORATION_COMMAND',cmd),command);
   await page.waitForFunction(({at,id})=>blightPackets.slice(at).some(m=>m.data?.id===id&&['EXPLORATION_COMMAND_ACK','EXPLORATION_COMMAND_REJECTED'].includes(m.type)),{at,id:command.id});
   expect(await savedSnapshot(page)).toEqual(saved);
   const restored=await rejoin(room,server);await expect.poll(()=>snapshot(restored)).toEqual(saved);expect(await savedSnapshot(restored)).toEqual(saved);
  }
  expect(room.errors).toEqual([]);
 }finally{if(room){measured.dialogs=room.dialogs;measured.errors=room.errors;measured.finalClients=await Promise.all(room.pages.map(p=>snapshot(p).catch(e=>({error:e.message}))))}await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});await info.attach('isolated-blight-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])test(`Blight Spores: ${mode}, empty hand resolves low severity without inventing a discard`,async({browser})=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;
 try{room=await setup(browser,server,mode,{emptyHand:true});const page=room.pages[0],before=await snapshot(page);await drawAndResolve(page,1);const after=room.online?await savedSnapshot(page):await snapshot(page);expect(after.heroes).toEqual(before.heroes);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(after.visited).toBe(true);expect(room.dialogs).toEqual([]);expect(room.errors).toEqual([])}
 finally{if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])test(`Blight Spores: ${mode}, explicit no-effect choice preserves the hand and still grants its reward`,async({browser})=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;
 try{room=await setup(browser,server,mode);room.promptAnswer='0';const page=room.pages[0],before=await snapshot(page);await drawAndResolve(page,2);const after=room.online?await savedSnapshot(page):await snapshot(page);expect(after.heroes).toEqual(before.heroes);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(room.dialogs.map(d=>d.type)).toEqual(['prompt']);expect(room.errors).toEqual([])}
 finally{if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])test(`Blight Spores: ${mode}, cancelling the card choice keeps the Encounter pending without a reward`,async({browser})=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;
 try{room=await setup(browser,server,mode);room.cancelPrompt=true;const page=room.pages[0],before=await snapshot(page);await draw(page,2);await page.locator('#resolveEnc').click();await expect.poll(()=>page.evaluate(()=>!!pEnc&&pEnc.card?.id==='EN061')).toBe(true);expect(await snapshot(page)).toEqual(before);if(room.online)expect(await savedSnapshot(page)).toEqual(before);expect(room.dialogs.map(d=>d.type)).toEqual(['prompt']);room.cancelPrompt=false;await page.locator('#resolveEnc').click();await page.waitForFunction(()=>!pEnc);const after=room.online?await savedSnapshot(page):await snapshot(page);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(after.heroes.Rowan.hand).toHaveLength(before.heroes.Rowan.hand.length-1);expect(room.errors).toEqual([])}
 finally{if(room)await room.close();await server.close()}
});

for(const severity of [6,7])test(`Blight Spores: Severity ${severity} damages only living Heroes at the origin`,async({browser})=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;
 try{room=await setup(browser,server,'offline solo',{scope:true});const page=room.pages[0],before=await snapshot(page);expect(Object.keys(before.heroes)).toHaveLength(4);await drawAndResolve(page,severity);const after=await snapshot(page);expect(after.heroes.Rowan.hp).toBe(before.heroes.Rowan.hp-1);expect(after.heroes.Aldric.hp).toBe(before.heroes.Aldric.hp-1);expect(after.heroes.Lyra).toEqual(before.heroes.Lyra);expect(after.heroes.Seraphine).toEqual(before.heroes.Seraphine);expect(after.herbCount).toBe(1);expect(after.patches).toBe(1);expect(room.errors).toEqual([])}
 finally{if(room)await room.close();await server.close()}
});

test('Blight Spores: two-client high severity does not damage a Hero at another Location',async({browser})=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;
 try{room=await setup(browser,server,'online two clients',{apart:true});const page=room.pages[0],before=await snapshot(page);expect(before.heroes.Aldric.x).toBe(1);await drawAndResolve(page,7);for(const client of room.pages)await expect.poll(async()=>{const after=await snapshot(client);return {rowan:after.heroes.Rowan.hp,aldric:after.heroes.Aldric.hp,herbs:after.herbCount}}).toEqual({rowan:before.heroes.Rowan.hp-1,aldric:before.heroes.Aldric.hp,herbs:1});expect((await savedSnapshot(page)).heroes.Aldric).toEqual(before.heroes.Aldric);expect(room.errors).toEqual([])}
 finally{if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])for(const armor of ['EQ083','EQ085'])for(const severity of [4,7])test(`Blight Spores: ${mode}, ${armor} ${severity===7?'cannot prevent unavoidable':'prevents normal Hazard'} damage`,async({browser})=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;
 try{room=await setup(browser,server,mode,{armor});const page=room.pages[0],before=await snapshot(page);await drawAndResolve(page,severity);const after=room.online?await savedSnapshot(page):await snapshot(page);expect(after.heroes.Rowan.hp).toBe(before.heroes.Rowan.hp-(severity===7?1:0));expect(after.heroes.Rowan.actions).toBe(before.heroes.Rowan.actions);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(after.patches).toBe(severity>=5?1:0);expect(room.dialogs).toEqual([]);expect(room.errors).toEqual([])}
 finally{if(room)await room.close();await server.close()}
});

async function explorationRpc(page,command){
 const at=await page.evaluate(()=>blightPackets.length);await page.evaluate(cmd=>mpSend('EXPLORATION_COMMAND',cmd),command);
 await page.waitForFunction(({at,id})=>blightPackets.slice(at).some(m=>m.data?.id===id&&['EXPLORATION_COMMAND_ACK','EXPLORATION_COMMAND_REJECTED'].includes(m.type)),{at,id:command.id});
 return page.evaluate(({at,id})=>blightPackets.slice(at).find(m=>m.data?.id===id&&['EXPLORATION_COMMAND_ACK','EXPLORATION_COMMAND_REJECTED'].includes(m.type)),{at,id:command.id});
}

test('Blight Spores: server process restart preserves resolution and rejects a new-ID replay',async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={};
 try{room=await setup(browser,server,'online one Hero');let page=room.pages[0];await drawAndResolve(page,7);const saved=await savedSnapshot(page),command=room.resolveCommands.at(-1);measured.beforeRestart=saved;expect(saved.herbCount).toBe(1);expect(saved.discard).toBe(1);expect(saved.heroes.Rowan.hp).toBe(6);await page.close();await server.restart();page=await rejoin(room,server);await expect.poll(()=>snapshot(page)).toEqual(saved);expect(await savedSnapshot(page)).toEqual(saved);const ack=await explorationRpc(page,{...command,id:command.id+'-after-process-restart'});expect(ack.type).toBe('EXPLORATION_COMMAND_REJECTED');expect(await savedSnapshot(page)).toEqual(saved);measured.afterRestart=await snapshot(page);expect(room.errors).toEqual([])}
 finally{await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});if(room)await room.close();await server.close()}
});

test('Blight Spores: stale sequences, mismatched encounter and a forged reward cannot partially commit',async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={attempts:[]};
 try{room=await setup(browser,server,'online one Hero');const page=room.pages[0];await draw(page,4);const before=await savedSnapshot(page);measured.before=before;
  for(const kind of ['stale resources','wrong encounter','forged Gold']){
   const command=await page.evaluate(kind=>{const staged=ascBlightEncounter33624.stage(pEnc,{});if(staged.error)throw Error(staged.error);const data={id:`BLIGHT-CAS-${Date.now()}-${Math.random()}`,op:'ENCOUNTER_RESOLVE',hero:'Rowan',round:g.round,encounterSerial33621:pEnc.encounterSerial33621||g.mechanics33621?.encounterSerial,baseExploreSeq:ascendance3305().exploreSeq,baseResourceSeq:ascendance3312().resourceSeq,baseHeroSeq:ascendance3303().heroSeq,blightChoice:{},blightOutcome:{game:staged.trial}};if(kind==='stale resources')data.baseResourceSeq++;if(kind==='wrong encounter')data.encounterSerial33621+=100;if(kind==='forged Gold')data.blightOutcome.game.gold=Number(data.blightOutcome.game.gold||0)+100;return data},kind);
   const ack=await explorationRpc(page,command);measured.attempts.push({kind,type:ack.type,reason:ack.data?.reason});expect(ack.type).toBe('EXPLORATION_COMMAND_REJECTED');expect(await savedSnapshot(page)).toEqual(before);expect(await page.evaluate(()=>pEnc?.card?.id)).toBe('EN061');
  }
  await page.locator('#resolveEnc').click();await page.waitForFunction(()=>!pEnc);const after=await savedSnapshot(page);expect(after.heroes.Rowan.hp).toBe(before.heroes.Rowan.hp-1);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(after.patches).toBe(0);measured.after=after;expect(room.errors).toEqual([]);
 }finally{await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])test(`Blight Spores: ${mode}, first Spore pressure strengthens fixed Severity once per Quest`,async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={};
 try{room=await setup(browser,server,mode,{blight:3});const page=room.pages[0],before=await snapshot(page);measured.before=before;
  await draw(page,2);expect(await page.evaluate(()=>({mode:pEnc.severityMode,base:pEnc.baseRoll,severity:pEnc.severity}))).toEqual({mode:'fixed',base:null,severity:2});await expect(page.locator('#blightSeverityNote33624')).toContainText('Severity 3–4');await expect(page.locator('#blightSeverityNote33624')).toContainText('one band stronger');await page.locator('#resolveEnc').click();await page.waitForFunction(()=>!pEnc);const first=room.online?await savedSnapshot(page):await snapshot(page);measured.first=first;expect(first.heroes.Rowan.hp).toBe(before.heroes.Rowan.hp-1);expect(first.heroes.Rowan.hand).toEqual(before.heroes.Rowan.hand);expect(first.herbCount).toBe(1);expect(first.discard).toBe(1);expect(room.dialogs).toEqual([]);
  // Its only EN061 naturally moves from the discard back into the empty deck.
  await page.evaluate(()=>startEncounter('Search Card',{x:0,y:0,hero:controlledHero(),fixedSeverity:2}));await page.waitForFunction(()=>pEnc?.card?.id==='EN061'&&pEnc.severity===2);await expect(page.locator('#blightSeverityNote33624')).toContainText('Severity 1–2');await expect(page.locator('#blightSeverityNote33624')).not.toContainText('one band stronger');await page.locator('#resolveEnc').click();await page.waitForFunction(()=>!pEnc);const second=room.online?await savedSnapshot(page):await snapshot(page);measured.second=second;expect(second.heroes.Rowan.hp).toBe(first.heroes.Rowan.hp);expect(second.heroes.Rowan.hand).toEqual(first.heroes.Rowan.hand.filter((_,i)=>i!==1));expect(second.heroes.Rowan.discard).toEqual([...first.heroes.Rowan.discard,first.heroes.Rowan.hand[1]]);expect(second.herbCount).toBe(2);expect(second.discard).toBe(1);expect(room.dialogs.map(d=>d.type)).toEqual(['prompt']);expect(room.errors).toEqual([]);
 }finally{await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])test(`Blight Spores: ${mode}, Garruk's authored damage Reaction conserves its card and pays its Action`,async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={};
 try{
  room=await setup(browser,server,mode,{actorHero:'Garruk',reaction:true});room.acceptReaction=true;const page=room.pages[0],before=await snapshot(page);
  const card=await page.evaluate(()=>runtimeHeroState('Garruk').hand.find(c=>c.id==='H012-013'));expect(card).toBeTruthy();measured.before=before;measured.card={id:card.id,uid:card.uid,cost:card.cost};
  await drawAndResolve(page,4);const after=room.online?await savedSnapshot(page):await snapshot(page);measured.after=after;
  expect(after.heroes.Garruk.hp).toBe(before.heroes.Garruk.hp);expect(after.heroes.Garruk.actions).toBe(before.heroes.Garruk.actions-card.cost);expect(after.heroes.Garruk.hand).not.toContain(card.uid);expect(after.heroes.Garruk.discard).toContain(card.uid);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);
  expect(room.dialogs.filter(d=>d.type==='confirm'&&d.message.includes(card.name))).toHaveLength(1);
  if(room.online){const restored=await rejoin(room,server);await expect.poll(()=>snapshot(restored)).toEqual(after);expect(await savedSnapshot(restored)).toEqual(after)}
  expect(room.errors).toEqual([]);
 }finally{if(room){measured.dialogs=room.dialogs;measured.errors=room.errors}await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});if(room)await room.close();await server.close()}
});

for(const mode of ['offline solo','online one Hero'])test(`Blight Spores: ${mode}, lethal Hazard commits the lone Hero fate before the normal Quest failure transition`,async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={};
 try{
  room=await setup(browser,server,mode,{fatal:true});const page=room.pages[0];measured.before=await snapshot(page);expect(measured.before.heroes.Rowan.hp).toBe(1);
  await drawAndResolve(page,4);
  if(room.online){
   const committed=await page.evaluate(()=>blightPackets.find(m=>m.type==='EXPLORATION_COMMAND_ACK'&&m.data?.op==='ENCOUNTER_RESOLVE'&&m.data?.result?.blight)?.data?.state?.game);expect(committed).toBeTruthy();const after=inspectBlight(committed);measured.committed=after;expect(after.heroes.Rowan.hp).toBe(0);expect(after.heroes.Rowan.actions).toBe(0);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(committed.campaign.heroFates.Rowan.status).toBe('Lost');
  }else{
   const after=await snapshot(page);measured.after=after;expect(after.heroes.Rowan.hp).toBe(0);expect(after.herbCount).toBe(1);expect(after.discard).toBe(1);expect(await page.evaluate(()=>g.campaign.heroFates.Rowan.status)).toBe('Lost');
  }
  expect(await page.evaluate(()=>pEnc)).toBeNull();expect(room.errors).toEqual([]);
 }finally{if(room){measured.dialogs=room.dialogs;measured.errors=room.errors}await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});if(room)await room.close();await server.close()}
});

test('Blight Spores: the same browser can resolve another Encounter after a server restart',async({browser},info)=>{
 test.setTimeout(90000);const server=await isolatedServer();let room;const measured={};
 try{
  room=await setup(browser,server,'online one Hero');const page=room.pages[0],identity=`same-page-${Date.now()}`;
  await page.evaluate(identity=>window.blightPageIdentity33624=identity,identity);
  await drawAndResolve(page,4);const before=await savedSnapshot(page);expect(before.heroes.Rowan.hp).toBe(6);expect(before.herbCount).toBe(1);
  const beforeSeq=await page.evaluate(()=>ascendance3303().heroSeq);expect(beforeSeq).toBeGreaterThan(0);
  const disk=server.savedState(room.code);expect(disk.heroAuthority3303.seq).toBe(beforeSeq);expect(disk.game.heroAuthority3303.seq).toBe(beforeSeq);
  measured.beforeRestart={heroSeq:beforeSeq,state:before,diskHeroSeq:disk.heroAuthority3303.seq};
  await server.restart();
  // Keep this Page and its JS ledger alive. Reopening a page resets heroSeq to
  // zero and cannot detect the old restart regression.
  await page.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);
  await page.waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&document.body.dataset.ascAdventureActive==='1');
  expect(await page.evaluate(()=>window.blightPageIdentity33624)).toBe(identity);
  const at=await page.evaluate(()=>{const at=blightPackets.length;mpSend('REQUEST_HERO_STATE',{});return at});
  await page.waitForFunction(at=>blightPackets.slice(at).some(m=>m.type==='HERO_STATE'),at);
  const reconnect=await page.evaluate(at=>({browser:ascendance3303().heroSeq,server:blightPackets.slice(at).find(m=>m.type==='HERO_STATE').data.seq}),at);measured.reconnect=reconnect;
  expect(reconnect).toEqual({browser:beforeSeq,server:beforeSeq});expect(await savedSnapshot(page)).toEqual(before);
  // Refill the actual exhausted Encounter Deck from its discard through the
  // normal draw path. The consumed First Visit must not be retriggered.
  await page.evaluate(()=>startEncounter('Search Card',{x:0,y:0,hero:controlledHero(),fixedSeverity:4}));await page.waitForFunction(()=>pEnc?.card?.id==='EN061'&&pEnc.severity===4);
  const commandAt=await page.evaluate(()=>blightPackets.length);await page.locator('#resolveEnc').click();await page.waitForFunction(()=>!pEnc);
  const after=await savedSnapshot(page);measured.after=after;expect(after.heroes.Rowan.hp).toBe(5);expect(after.herbCount).toBe(2);expect(after.discard).toBe(1);
  const rejected=await page.evaluate(at=>blightPackets.slice(at).filter(m=>m.type==='EXPLORATION_COMMAND_REJECTED').map(m=>m.data.reason),commandAt);expect(rejected).toEqual([]);
  expect(await page.evaluate(()=>window.blightPageIdentity33624)).toBe(identity);
  const afterSeq=await page.evaluate(()=>ascendance3303().heroSeq),savedAfter=server.savedState(room.code);expect(afterSeq).toBeGreaterThan(beforeSeq);expect(savedAfter.heroAuthority3303.seq).toBe(afterSeq);expect(savedAfter.game.heroAuthority3303.seq).toBe(afterSeq);expect(inspectBlight(savedAfter.game)).toEqual(after);
  expect(room.errors).toEqual([]);
 }finally{await info.attach('blight-actual-effects',{body:JSON.stringify(measured),contentType:'application/json'});await info.attach('isolated-blight-server',{body:server.log(),contentType:'text/plain'});if(room)await room.close();await server.close()}
});
