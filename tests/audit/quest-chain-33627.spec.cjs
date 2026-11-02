const {test,expect}=require('@playwright/test');

async function open(page){
 page.chainErrors=[];page.on('pageerror',error=>page.chainErrors.push(error.message));
 page.on('dialog',dialog=>dialog.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ascQuestTransition33626?.ready()&&window.ascPhaseSync33625?.ready()&&(!window.ascWorldEventRules33627||window.ascWorldEventChain33627?.ready?.()));
 await page.evaluate(()=>{window.chainPackets=[];const before=mpHandleMessage;mpHandleMessage=function(message){chainPackets.push(message);return before.apply(this,arguments)}});
}
function prepare(){
 g.round=10;g.phase='Hero Phase';g.gold=37;g.reputation=4;
 Object.assign(g.campaign,{currentQuest:'Q003',activeEvent:'WE001',day:4,downtime:true,campaignEnded:false,
  questStatus:{Q001:'Completed',Q002:'Completed',Q003:'Completed'},
  lastQuestOutcome:{quest:'Q003',outcome:'Completed',event:'WE001',day:3},
  history:[{quest:'Q001',outcome:'Completed',event:'WE001',day:1},{quest:'Q002',outcome:'Completed',event:'WE001',day:2},{quest:'Q003',outcome:'Completed',event:'WE001',day:3}]});
 g.campaign.q003.resolved=true;g.campaign.afterQuestExploreDismissed32920={Q003:true};g.campaign.afterQuestExplore32920={active:false,quest:'Q003'};
 for(const hero of g.partyHeroes){g.xp[hero]=200;g.levels[hero]=heroLevel(hero);searchHeroState(hero).hp=5}
 g.tiles['0,0'].enemies=[];g.tiles['9,9']={...structuredClone(g.tiles['0,0']),id:'L006',name:'Previous Quest board',enemies:[]};render();
}
async function nativeRoom(browser,count){
 const contexts=[],pages=[],code=`CHAIN${Date.now()}${Math.floor(Math.random()*10000)}`;
 for(let i=0;i<count;i++){const context=await browser.newContext();contexts.push(context);const page=await context.newPage();pages.push(page);await open(page)}
 await pages[0].evaluate(({code,prepare})=>{
  const before=init;window.chainInit=before;init=function(){const result=before.apply(this,arguments);(0,eval)('('+prepare+')')();return result};
  init('Q003',['Rowan']);lobbySetMultiplayerControls('remote',code,'Rowan');mpFreshNewGame32529=true;mpConnect();
 },{code,prepare:prepare.toString()});
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero==='Rowan'));
 if(count===2){await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&ascendancePartyLobby32759().players.some(p=>p.hero==='Lyra'))}
 for(const page of pages)await page.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(count);
 await pages[0].evaluate(()=>partyStart32716());for(const page of pages)await page.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&g.campaign.currentQuest==='Q003'&&g.round===10);
 await pages[0].evaluate(()=>{init=window.chainInit;delete window.chainInit});
 return {pages,code,close:()=>Promise.allSettled(contexts.map(context=>context.close()))};
}
async function canonical(page){
 const at=await page.evaluate(()=>{const at=chainPackets.length;mpSend('REQUEST_STATE',{});return at});
 await page.waitForFunction(at=>chainPackets.slice(at).some(message=>message.type==='ROOM_STATE'),at);
 return page.evaluate(at=>chainPackets.slice(at).find(message=>message.type==='ROOM_STATE').data.game,at);
}
async function advanceAndBegin(page){
 await page.locator('#questTransition button').filter({hasText:/^Advance to WE002$/}).click();
 await page.waitForFunction(()=>g.campaign.activeEvent==='WE002');
 // Both a confirmed World Event step followed by Begin and an atomic combined
 // transition satisfy the contract. No arbitrary delay is used to hide a race.
 if(await page.evaluate(()=>g.campaign.downtime)){
  const begin=page.locator('#questTransition button').filter({hasText:/^Begin Q004/});await expect(begin).toBeEnabled();await begin.click();
  const briefing=page.locator('#questNarrativeBegin3341');if(await briefing.isVisible())await briefing.click();
 }
 await expect.poll(()=>page.evaluate(()=>({quest:g.campaign.currentQuest,downtime:g.campaign.downtime,round:g.round})),{timeout:10000}).toEqual({quest:'Q004',downtime:false,round:1});
}

test('Quest chain: Q003 is optional and cannot unlock Q004 before the two Main Quests or the day limit',async({page})=>{
 await open(page);await page.evaluate(prepare=>{init('Q003',['Rowan']);lobbyClose();(0,eval)('('+prepare+')')();g.campaign.questStatus.Q002='Available';render()},prepare.toString());
 await expect(page.locator('#questTransition button').filter({hasText:/^Advance to WE002$/})).toHaveCount(0);
 expect(await page.evaluate(()=>({event:g.campaign.activeEvent,quest:g.campaign.currentQuest,day:g.campaign.day}))).toEqual({event:'WE001',quest:'Q003',day:4});
 expect(page.chainErrors).toEqual([]);
});

test('Quest chain: solo completed Q003 advances to a fresh Q004 and applies the all-three World Event XP once',async({page},info)=>{
 await open(page);await page.evaluate(prepare=>{init('Q003',['Rowan']);lobbyClose();(0,eval)('('+prepare+')')()},prepare.toString());
 await advanceAndBegin(page);
 const actual=await page.evaluate(()=>({event:g.campaign.activeEvent,quest:g.campaign.currentQuest,day:g.campaign.day,round:g.round,tiles:Object.keys(g.tiles),xp:g.xp.Rowan,gold:g.gold,reputation:g.reputation,hp:heroCurrentHp('Rowan'),history:g.campaign.history.map(row=>row.quest)}));
 expect(actual).toEqual({event:'WE002',quest:'Q004',day:1,round:1,tiles:['0,0'],xp:250,gold:37,reputation:4,hp:9,history:['Q001','Q002','Q003']});
 await page.evaluate(()=>render());expect(await page.evaluate(()=>g.xp.Rowan)).toBe(250);expect(page.chainErrors).toEqual([]);
 await info.attach('quest-chain-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
});

for(const count of [1,2])test(`Quest chain: ${count===1?'one online Hero':'two native clients'} advance Q003 to Q004 without a source-Quest race or reward rollback`,async({browser},info)=>{
 test.setTimeout(45000);const room=await nativeRoom(browser,count),host=room.pages[0];
 try{
  const before=await canonical(host);expect(before.campaign.currentQuest).toBe('Q003');
  await advanceAndBegin(host);
  const after=await canonical(host);
  expect(after.campaign).toMatchObject({activeEvent:'WE002',currentQuest:'Q004',day:1,downtime:false});
  expect(after.round).toBe(1);expect(Object.keys(after.tiles)).toEqual(['0,0']);expect(after.xp.Rowan).toBe(before.xp.Rowan+50);expect(after.gold).toBe(before.gold);expect(after.reputation).toBe(before.reputation);expect(after.campaign.history).toEqual(before.campaign.history);
  for(const page of room.pages){await expect.poll(()=>page.evaluate(()=>({event:g.campaign.activeEvent,quest:g.campaign.currentQuest,round:g.round,xp:g.xp.Rowan,tiles:Object.keys(g.tiles)}))).toEqual({event:'WE002',quest:'Q004',round:1,xp:250,tiles:['0,0']});expect(page.chainErrors).toEqual([])}
  const rejected=await host.evaluate(()=>chainPackets.filter(message=>message.type==='QUEST_TRANSITION_REJECTED_33626').map(message=>message.data.reason));expect(rejected).toEqual([]);
  await host.reload({waitUntil:'domcontentloaded'});await host.waitForFunction(()=>window.ascQuestTransition33626?.ready());await host.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Rowan');mpConnect()},room.code);
  await host.waitForFunction(()=>mpJoinReady&&document.body.dataset.ascAdventureActive==='1'&&g.campaign.currentQuest==='Q004');
  expect(await host.evaluate(()=>({quest:g.campaign.currentQuest,event:g.campaign.activeEvent,round:g.round,xp:g.xp.Rowan,gold:g.gold}))).toEqual({quest:'Q004',event:'WE002',round:1,xp:250,gold:37});
  await info.attach('quest-chain-measurement',{body:JSON.stringify({clients:count,before:{quest:before.campaign.currentQuest,xp:before.xp.Rowan},after:{quest:after.campaign.currentQuest,event:after.campaign.activeEvent,xp:after.xp.Rowan,round:after.round},rejected,rejoined:true}),contentType:'application/json'});
 }finally{await room.close()}
});
