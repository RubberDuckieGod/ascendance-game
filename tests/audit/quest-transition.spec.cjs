const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events');
let server;
async function isolatedServer(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-quest-transition-'));
 const port=await new Promise((resolve,reject)=>{const listener=net.createServer();listener.on('error',reject);listener.listen(0,'127.0.0.1',()=>{const p=listener.address().port;listener.close(()=>resolve(p))})});
 const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let logs='';
 for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>logs=(logs+chunk).slice(-18000));
 const url=`http://127.0.0.1:${port}/`;child.on('exit',code=>{if(code)console.error('Isolated Quest server failed:',logs)});
 async function close(){if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}fs.rmSync(dir,{recursive:true,force:true})}
 try{await expect.poll(async()=>{if(child.exitCode!==null)throw Error(logs);try{return(await fetch(url+'health')).ok}catch(_){return false}},{timeout:15000}).toBe(true);return {url,close}}
 catch(error){await close();throw error}
}
async function open(page){
 page.on('dialog',dialog=>dialog.dismiss());await page.goto(server.url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ascQuestTransition33626?.ready()&&window.ascPhaseSync33625?.ready());
 await page.evaluate(()=>{window.questPackets=[];const before=mpHandleMessage;mpHandleMessage=function(message){questPackets.push(message);return before.apply(this,arguments)}});
}
function setup(){
 g.round=10;g.phase='Hero Phase';g.gold=37;g.reputation=4;
 g.campaign.currentQuest='Q001';g.campaign.activeEvent='WE001';g.campaign.day=2;g.campaign.questStatus.Q001='Completed';g.campaign.questStatus.Q002='Available';g.campaign.downtime=true;
 g.campaign.lastQuestOutcome={quest:'Q001',outcome:'Completed',event:'WE001',day:1};
 g.campaign.usesAscendanceTokens=true;g.campaign.ascendanceTokens=4;
 g.campaign.history=[{quest:'Q001',outcome:'Completed',event:'WE001',day:1}];
 g.campaign.afterQuestExploreDismissed32920={Q001:true};g.campaign.afterQuestExplore32920={active:false,quest:'Q001'};
 g.campaign.heroFates.Rowan={status:'Lost',quest:'Q001',day:1};runtimeHeroState('Rowan').hp=0;g.xp.Rowan=3000;g.levels.Rowan=heroLevel('Rowan');
 g.inventory.Rowan=[{key:'loot:LT001',kind:'loot',id:'LT001',qty:4}];g.equipped.Rowan={...startingEquipmentFor('Rowan'),Accessory:['EQ097']};
 if(g.partyHeroes.includes('Lyra')){g.lyra.hp=2;g.xp.Lyra=900;g.levels.Lyra=heroLevel('Lyra');g.inventory.Lyra=[{key:'loot:LT001',kind:'loot',id:'LT001',qty:3},{key:'loot:LT149',kind:'loot',id:'LT149',qty:1}]}
 g.tiles['0,0'].enemies=[];
 g.tiles['1,0']={...structuredClone(g.tiles['0,0']),id:'L006',name:'Previous Quest board',searchCount:1,enemies:[{type:'audit-old-enemy',name:'Previous Quest Enemy',hp:6,max:6,attack:0,armor:0,move:0,range:0,conditions:[]}]};
 g.pool=[];render();
}
async function room(browser,count=2){
 const contexts=[],pages=[],code=`QUEST${Date.now()}${Math.floor(Math.random()*10000)}`;
 for(let i=0;i<count;i++){const context=await browser.newContext();contexts.push(context);const page=await context.newPage();pages.push(page);await open(page)}
 await pages[0].evaluate(({code,prepare})=>{
  const prior=init;window.questOriginalInit33626=prior;init=function(){const out=prior.apply(this,arguments);(0,eval)('('+prepare+')')();return out};
  init('Q001',['Rowan']);lobbySetMultiplayerControls('remote',code,'Rowan');mpFreshNewGame32529=true;mpConnect();
 },{code,prepare:setup.toString()});
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(player=>player.hero==='Rowan'));
 if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&ascendancePartyLobby32759().players.some(player=>player.hero==='Lyra'))}
 for(const page of pages)await page.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(player=>player.ready).length)).toBe(count);
 await pages[0].evaluate(()=>partyStart32716());
 for(const page of pages)await page.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.round===10,null,{timeout:10000}).catch(async error=>{throw new Error('Native Quest fixture did not start: '+JSON.stringify(await page.evaluate(()=>({active:document.body.dataset.ascAdventureActive,turn:ascRoomTurn33618.state(),types:questPackets.slice(-12).map(p=>p.type)})))+' '+error.message)});
 // The fixture hook is for the original server seed only, not the next-Quest builder.
 await pages[0].evaluate(()=>{init=window.questOriginalInit33626;delete window.questOriginalInit33626});
 return {pages,contexts,code,close:()=>Promise.allSettled(contexts.map(context=>context.close()))};
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=questPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>questPackets.slice(at).some(message=>message.type==='ROOM_STATE'),at,{timeout:10000}).catch(async error=>{throw new Error('Canonical Quest reply missing: '+JSON.stringify(await page.evaluate(()=>({connected:mpSocket?.readyState,types:questPackets.slice(-15).map(p=>p.type)})))+' '+error.message)});
 return page.evaluate(at=>questPackets.slice(at).find(message=>message.type==='ROOM_STATE').data.game,at);
}
test.beforeAll(async()=>{server=await isolatedServer()});test.afterAll(async()=>{await server?.close()});

test('Quest transition: every solo Lost Hero returns at Level 1 on a clean next-Quest board',async({page},info)=>{
 await open(page);
 const results=await page.evaluate(()=>{
  const heroes=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
  return heroes.map(hero=>{
   init('Q001',[hero]);lobbyClose();const initial=searchHeroState(hero),initialZones=hero==='Aldric'?[g.heroDeck,g.heroHand,g.heroDiscard]:hero==='Lyra'?[g.lyraDeck,g.lyraHand,g.lyraDiscard]:hero==='Seraphine'?[g.seraphineDeck,g.seraphineHand,g.seraphineDiscard]:[initial.deck,initial.hand,initial.discard],expectedCards=initialZones.reduce((n,z)=>n+z.length,0);g.campaign.day=2;g.campaign.questStatus.Q001='Completed';g.campaign.questStatus.Q002='Available';g.campaign.downtime=true;
   g.campaign.heroFates[hero]={status:'Lost',quest:'Q001',day:1};searchHeroState(hero).hp=0;g.xp[hero]=3000;g.levels[hero]=heroLevel(hero);g.inventory[hero]=[{key:'loot:LT001',kind:'loot',id:'LT001',qty:4}];
   g.round=10;g.tiles['9,9']={...structuredClone(g.tiles['0,0']),id:'AUDIT-OLD',enemies:[]};g.gold=37;g.reputation=4;
   startCampaignQuest('Q002');const body=searchHeroState(hero),zones=hero==='Aldric'?[g.heroDeck,g.heroHand,g.heroDiscard]:hero==='Lyra'?[g.lyraDeck,g.lyraHand,g.lyraDiscard]:hero==='Seraphine'?[g.seraphineDeck,g.seraphineHand,g.seraphineDiscard]:[body.deck,body.hand,body.discard];
   return {hero,level:heroLevel(hero),xp:g.xp[hero],hp:body.hp,max:ascQuestTransitionRules33626.maxHealth(g,hero),fate:g.campaign.heroFates[hero],board:Object.keys(g.tiles),round:g.round,quest:g.campaign.currentQuest,inventory:g.inventory[hero],equipment:g.equipped[hero],expectedEquipment:ascQuestTransitionRules33626.starting(hero).equipment,gold:g.gold,reputation:g.reputation,cards:zones.map(z=>z.length),expectedCards,position:heroPos(hero)};
  });
 });
 await info.attach('all-hero-death-replacement-measurement',{body:JSON.stringify(results),contentType:'application/json'});
 for(const result of results){expect(result.quest,result.hero).toBe('Q002');expect(result.level,result.hero).toBe(1);expect(result.xp,result.hero).toBe(0);expect(result.hp,result.hero).toBe(result.max);expect(result.fate).toMatchObject({status:'Replacement',quest:'Q002'});expect(result.board).toEqual(['0,0']);expect(result.round).toBe(1);expect(result.inventory).toEqual([{key:'loot:LT002',kind:'loot',id:'LT002',qty:1}]);expect(result.equipment).toEqual(result.expectedEquipment);expect(result.gold).toBe(37);expect(result.reputation).toBe(4);expect(result.cards.reduce((a,b)=>a+b,0),result.hero).toBe(result.expectedCards);expect(result.cards[1]).toBe(5);expect(result.position).toEqual({x:0,y:0})}
});

test('Quest transition: a solo Downed survivor keeps progression and gear, recovers setup Health and gets no replacement Potion',async({page},info)=>{
 await open(page);const result=await page.evaluate(()=>{
  init('Q001',['Rowan']);lobbyClose();g.campaign.day=2;g.campaign.questStatus.Q001='Completed';g.campaign.questStatus.Q002='Available';g.campaign.downtime=true;
  g.campaign.heroFates.Rowan={status:'Downed',quest:'Q001',day:1};runtimeHeroState('Rowan').hp=0;g.xp.Rowan=3000;g.levels.Rowan=heroLevel('Rowan');g.inventory.Rowan=[{key:'loot:LT001',kind:'loot',id:'LT001',qty:4}];g.equipped.Rowan={...startingEquipmentFor('Rowan'),Accessory:['EQ097']};
  const before={xp:g.xp.Rowan,level:heroLevel('Rowan'),inventory:structuredClone(g.inventory.Rowan),gear:structuredClone(g.equipped.Rowan)};startCampaignQuest('Q002');
  return {before,after:{xp:g.xp.Rowan,level:heroLevel('Rowan'),inventory:g.inventory.Rowan,gear:g.equipped.Rowan},hp:runtimeHeroState('Rowan').hp,max:ascQuestTransitionRules33626.maxHealth(g,'Rowan'),fate:g.campaign.heroFates.Rowan};
 });
 expect(result.after).toEqual(result.before);expect(result.hp).toBe(result.max);expect(result.fate).toMatchObject({status:'Survived',quest:'Q002'});
 await info.attach('downed-survivor-measurement',{body:JSON.stringify(result),contentType:'application/json'});
});

test('Quest transition: retained-Level Quest-start abilities refresh without repeating Mira\'s setup choice',async({page},info)=>{
 await open(page);const result=await page.evaluate(()=>{
  init('Q001',['Aldric']);lobbyClose();g.xp.Aldric=3000;g.levels.Aldric=heroLevel('Aldric');g.campaign.questStatus.Q001='Completed';g.campaign.questStatus.Q002='Available';g.campaign.downtime=true;
  g.campaign.levelRuntime3360={quest:'Q001',hero:{Aldric:{used:{oldQuest:true},round:{},buff:{}}},round:9};
  startCampaignQuest('Q002');const aldric={level:heroLevel('Aldric'),guarded:heroHasCondition('Aldric','Guarded'),quest:g.campaign.levelRuntime3360.quest,oldUse:g.campaign.levelRuntime3360.hero?.Aldric?.used?.oldQuest||false};
  const priorPrompt=window.prompt;let masterworkPrompts=0;window.prompt=function(text,...rest){if(String(text).startsWith('Masterwork:')){masterworkPrompts++;return '2'}return priorPrompt.call(this,text,...rest)};
  try{
   init('Q001',['Mira']);g.xp.Mira=3000;g.levels.Mira=heroLevel('Mira');g.campaign.questStatus.Q001='Completed';g.campaign.questStatus.Q002='Available';g.campaign.downtime=true;masterworkPrompts=0;
   startCampaignQuest('Q002');return {aldric,mira:{prompts:masterworkPrompts,choice:g.heroAbilityRuntime3362?.flags?.['Mira::Masterwork'],level:heroLevel('Mira')}};
  }finally{window.prompt=priorPrompt}
 });
 expect(result.aldric.level).toBeGreaterThanOrEqual(2);expect(result.aldric.guarded).toBe(true);expect(result.aldric.quest).toBe('Q002');expect(result.aldric.oldUse).toBe(false);expect(result.mira.prompts).toBe(1);expect(result.mira.choice).toBe('Armor');expect(result.mira.level).toBeGreaterThanOrEqual(2);
 await info.attach('quest-start-ability-measurement',{body:JSON.stringify(result),contentType:'application/json'});
});

test('Quest transition: existing relic and faction setup effects survive the new board without duplicate benefits',async({page},info)=>{
 await open(page);const result=await page.evaluate(()=>{
  const effects=[];
  for(const spec of [{quest:'Q043',faction:'spiritCourt',condition:'Inspired'},{quest:'Q049',faction:'beaconOrder',condition:'Guarded'},{quest:'Q067',faction:'firstDawn',condition:'Inspired'}]){
   init('Q001',['Rowan']);lobbyClose();g.campaign.activeEvent='WE'+String(Math.floor((Number(spec.quest.slice(1))-1)/3)+1).padStart(3,'0');g.campaign.currentQuest='Q001';g.campaign.questStatus[spec.quest]='Available';g.campaign.questStatus.Q001='Completed';g.campaign.downtime=true;g.campaign.factionReputation3342={[spec.faction]:5};
   const previous=window.confirm;let prompts=0;window.confirm=function(text,...rest){if(String(text).startsWith('Spirit Court Exalted:')){prompts++;return false}return previous.call(this,text,...rest)};
   try{startCampaignQuest(spec.quest);effects.push({...spec,actualQuest:g.campaign.currentQuest,conditions:[...searchHeroState('Rowan').conditions],prompts,marked:g.campaign.repPerks3360?.quest?.[spec.quest]?.startPerks3360,choices:g.questSetupChoices33626})}finally{window.confirm=previous}
  }
  init('Q001',['Rowan']);g.campaign.questStatus.Q001='Completed';g.campaign.questStatus.Q002='Available';g.campaign.downtime=true;g.inventory.Rowan.push({key:'loot:LT149',kind:'loot',id:'LT149',qty:1});g.campaign.usesAscendanceTokens=false;startCampaignQuest('Q002');
  return {effects,noTokenRelic:{hand:searchHeroState('Rowan').hand.length,tokens:g.campaign.ascendanceTokens||0,marked:g.relicShardQuest33612?.['Q002:1:0']}};
 });
 for(const effect of result.effects){expect(effect.actualQuest).toBe(effect.quest);expect(effect.conditions).toContain(effect.condition);expect(effect.marked).toBe(true);expect(effect.prompts).toBe(effect.faction==='spiritCourt'?1:0);expect(effect.choices).toEqual(effect.faction==='spiritCourt'?{spiritCourt:'Inspired'}:{})}
 expect(result.noTokenRelic).toEqual({hand:6,tokens:0,marked:true});
 await info.attach('quest-setup-existing-benefits-measurement',{body:JSON.stringify(result),contentType:'application/json'});
});

for(const count of [1,2])test(`Quest transition: ${count===1?'one online Hero':'two native browser clients'} atomically reset the board and replace a dead host without resource rollback`,async({browser},info)=>{
 const connected=await room(browser,count),host=connected.pages[0];
 try{
  const before=await canonical(host);expect(before.campaign.currentQuest).toBe('Q001');expect(before.round).toBe(10);expect(before.heroRuntimeStates.Rowan.hp).toBe(0);expect(before.campaign.heroFates.Rowan.status).toBe('Lost');
  await host.evaluate(()=>{window.oldQuestRead33626=structuredClone([...questPackets].reverse().find(message=>message.type==='ROOM_STATE'))});
  await host.evaluate(()=>startCampaignQuest('Q002'));
  await host.waitForFunction(()=>!!ascQuestTransition33626.result()&&!ascQuestTransition33626.pending(),null,{timeout:10000}).catch(async error=>{throw new Error('Quest transition did not commit: '+JSON.stringify(await host.evaluate(()=>({result:ascQuestTransition33626.result(),pending:ascQuestTransition33626.pending(),quest:g.campaign.currentQuest,round:g.round,log:g.adventureLog?.slice(-5),types:questPackets.slice(-15).map(p=>p.type)})))+' '+error.message)});
  const transitionResult=await host.evaluate(()=>ascQuestTransition33626.result());expect(transitionResult.accepted,transitionResult.reason||'Server confirmed the next Quest').toBe(true);
  const saved=await canonical(host);expect(saved.campaign.currentQuest).toBe('Q002');expect(saved.round).toBe(1);expect(saved.phase).toBe('Hero Phase');expect(Object.keys(saved.tiles)).toEqual(['0,0']);expect(saved.pool.length).toBeGreaterThan(0);expect(saved.heroRuntimeStates.Rowan.hp).toBe(9);expect(saved.xp.Rowan).toBe(0);expect(saved.levels.Rowan).toBe(1);expect(saved.campaign.heroFates.Rowan).toMatchObject({status:'Replacement',quest:'Q002'});expect(saved.inventory.Rowan).toEqual([{key:'loot:LT002',kind:'loot',id:'LT002',qty:1}]);expect(saved.gold).toBe(before.gold);expect(saved.reputation).toBe(before.reputation);
  expect(saved.campaign.ascendanceTokens).toBe(count===2?5:4);
  if(count===2){expect(saved.inventory.Lyra).toEqual(before.inventory.Lyra);expect(saved.xp.Lyra).toBe(before.xp.Lyra);expect(saved.lyra.hp).toBe(8);expect(saved.lyraHand).toHaveLength(5);expect(saved.relicShardQuest33612['Q002:2:0']).toBe(true)}
  for(const page of connected.pages){await expect.poll(()=>page.evaluate(()=>({quest:g.campaign.currentQuest,round:g.round,hp:runtimeHeroState('Rowan').hp,tiles:Object.keys(g.tiles)}))).toEqual({quest:'Q002',round:1,hp:9,tiles:['0,0']});await page.evaluate(()=>{mpSend('REQUEST_HERO_STATE',{});mpSend('REQUEST_EXPLORATION_STATE',{});mpSend('REQUEST_RESOURCE_STATE',{});mpSend('REQUEST_PHASE_STATE',{});mpSend('REQUEST_TURN_STATE',{})})}
  await host.waitForTimeout(200);const afterReads=await canonical(host);expect(afterReads.heroRuntimeStates.Rowan.hp).toBe(9);expect(afterReads.round).toBe(1);expect(Object.keys(afterReads.tiles)).toEqual(['0,0']);
  await host.evaluate(()=>mpHandleMessage(oldQuestRead33626));expect(await host.evaluate(()=>({quest:g.campaign.currentQuest,round:g.round,hp:runtimeHeroState('Rowan').hp,tiles:Object.keys(g.tiles)}))).toEqual({quest:'Q002',round:1,hp:9,tiles:['0,0']});
  await host.reload({waitUntil:'domcontentloaded'});await host.waitForFunction(()=>window.ascQuestTransition33626?.ready());
  await host.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},connected.code);
  await host.waitForFunction(()=>mpJoinReady&&document.body.dataset.ascAdventureActive==='1'&&g.campaign.currentQuest==='Q002');
  expect(await host.evaluate(()=>({round:g.round,hp:runtimeHeroState('Rowan').hp,level:heroLevel('Rowan'),tiles:Object.keys(g.tiles),tokens:g.campaign.ascendanceTokens}))).toEqual({round:1,hp:9,level:1,tiles:['0,0'],tokens:count===2?5:4});
  await host.evaluate(()=>ascRoomTurn33618.claim());await host.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');
  expect(await host.evaluate(()=>heroActionCount('Rowan'))).toBe(3);
  await info.attach('atomic-quest-transition-measurement',{body:JSON.stringify({clients:count,before:{quest:before.campaign.currentQuest,round:before.round,hp:before.heroRuntimeStates.Rowan.hp,gold:before.gold},after:{quest:saved.campaign.currentQuest,round:saved.round,hp:saved.heroRuntimeStates.Rowan.hp,gold:saved.gold,level:saved.levels.Rowan,tiles:Object.keys(saved.tiles),epoch:saved.questTransitionAuthority33626.epoch}}),contentType:'application/json'});
 }finally{await connected.close()}
});

test('Quest transition: reconnect replays the same request after the commit reply is lost without a second setup reward',async({browser},info)=>{
 const connected=await room(browser,2),host=connected.pages[0];
 try{
  await host.evaluate(()=>{
   window.questRetryCommands33626=[];const priorSend=mpSend,priorReceive=mpHandleMessage;let lostSocket=null;
   mpSend=function(type,data){if(type==='QUEST_TRANSITION_33626')questRetryCommands33626.push(JSON.stringify(data));return priorSend.apply(this,arguments)};
   mpHandleMessage=function(message){
    if(['QUEST_TRANSITION_ACK_33626','QUEST_TRANSITION_STATE_33626'].includes(message.type)){
     if(!lostSocket){lostSocket=mpSocket;window.questLostReply33626={type:message.type,id:message.data.id};lostSocket.close();return}
     if(mpSocket===lostSocket)return;
    }
    return priorReceive.apply(this,arguments);
   };
   startCampaignQuest('Q002');
  });
  await host.waitForFunction(()=>window.questLostReply33626&&ascQuestTransition33626.result()?.accepted&&!ascQuestTransition33626.pending(),null,{timeout:20000});
  const attempts=await host.evaluate(()=>({commands:questRetryCommands33626,lost:questLostReply33626,result:ascQuestTransition33626.result(),joined:mpJoinReady}));
  expect(attempts.commands.length).toBeGreaterThanOrEqual(2);expect(new Set(attempts.commands).size).toBe(1);expect(JSON.parse(attempts.commands[0]).id).toBe(attempts.lost.id);expect(attempts.result.id).toBe(attempts.lost.id);expect(attempts.joined).toBe(true);
  const saved=await canonical(host);expect(saved.questTransitionAuthority33626.epoch).toBe(1);expect(saved.campaign.currentQuest).toBe('Q002');expect(saved.round).toBe(1);expect(Object.keys(saved.tiles)).toEqual(['0,0']);expect(saved.campaign.ascendanceTokens).toBe(5);expect(saved.gold).toBe(37);expect(saved.reputation).toBe(4);expect(saved.levels.Rowan).toBe(1);expect(saved.xp.Rowan).toBe(0);expect(saved.heroRuntimeStates.Rowan.hp).toBe(9);expect(saved.inventory.Rowan).toEqual([{key:'loot:LT002',kind:'loot',id:'LT002',qty:1}]);expect(Object.keys(saved.questTransitionAuthority33626.commands)).toHaveLength(1);
  await expect.poll(()=>connected.pages[1].evaluate(()=>({quest:g.campaign.currentQuest,epoch:g.questTransitionAuthority33626.epoch,tokens:g.campaign.ascendanceTokens}))).toEqual({quest:'Q002',epoch:1,tokens:5});
  await info.attach('quest-transition-reconnect-measurement',{body:JSON.stringify({attempts:attempts.commands.length,sameRequest:true,epoch:saved.questTransitionAuthority33626.epoch,quest:saved.campaign.currentQuest,tokens:saved.campaign.ascendanceTokens,level:saved.levels.Rowan,hp:saved.heroRuntimeStates.Rowan.hp}),contentType:'application/json'});
 }finally{await connected.close()}
});

test('Quest transition: repeated lost confirmations stop retrying, show safe recovery and preserve the single committed Quest',async({browser},info)=>{
 const connected=await room(browser,1),host=connected.pages[0];
 try{
  await host.evaluate(()=>{
   window.questRetryCommands33626=[];const priorSend=mpSend,priorReceive=mpHandleMessage;
   mpSend=function(type,data){if(type==='QUEST_TRANSITION_33626')questRetryCommands33626.push(JSON.stringify(data));return priorSend.apply(this,arguments)};
   mpHandleMessage=function(message){if(['QUEST_TRANSITION_ACK_33626','QUEST_TRANSITION_STATE_33626'].includes(message.type))return;return priorReceive.apply(this,arguments)};
   startCampaignQuest('Q002');
  });
  await host.waitForFunction(()=>ascQuestTransition33626.result()?.uncertain&&!ascQuestTransition33626.pending(),null,{timeout:20000});
  await expect(host.getByRole('button',{name:'Refresh room',exact:true})).toBeVisible();
  const failure=await host.evaluate(()=>({commands:questRetryCommands33626,result:ascQuestTransition33626.result(),quest:g.campaign.currentQuest,guarded:ascQuestTransition33626.suppressesWire('STATE')}));
  expect(failure.commands).toHaveLength(4);expect(new Set(failure.commands).size).toBe(1);expect(failure.quest).toBe('Q001');expect(failure.guarded).toBe(true);expect(failure.result.reason).toContain('Refresh the room');
  // A later canonical read is safe even when every specialized reply was lost.
  const saved=await canonical(host);expect(saved.campaign.currentQuest).toBe('Q002');expect(saved.questTransitionAuthority33626.epoch).toBe(1);expect(saved.campaign.ascendanceTokens).toBe(4);expect(saved.inventory.Rowan).toEqual([{key:'loot:LT002',kind:'loot',id:'LT002',qty:1}]);expect(saved.gold).toBe(37);expect(saved.reputation).toBe(4);
  expect(await host.evaluate(()=>({quest:g.campaign.currentQuest,guarded:ascQuestTransition33626.suppressesWire('STATE')}))).toEqual({quest:'Q002',guarded:false});await expect(host.getByRole('button',{name:'Refresh room',exact:true})).toHaveCount(0);
  await host.evaluate(()=>ascRoomTurn33618.claim());await host.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Rowan');expect(await host.evaluate(()=>({actions:heroActionCount('Rowan'),round:g.round,hp:runtimeHeroState('Rowan').hp}))).toEqual({actions:3,round:1,hp:9});
  await info.attach('quest-transition-bounded-recovery-measurement',{body:JSON.stringify({attempts:failure.commands.length,sameRequest:true,actionableRecovery:true,epoch:saved.questTransitionAuthority33626.epoch,quest:saved.campaign.currentQuest,nextTurnActions:3}),contentType:'application/json'});
 }finally{await connected.close()}
});
