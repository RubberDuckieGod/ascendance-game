const {test,expect}=require('@playwright/test');
for(const permanent of [false,true])test('ordinary Move Wild Growth lifetime in the loaded game; permanent='+permanent,async({page})=>{
 page.on('dialog',d=>d.message().includes('Wild Growth')?d.accept():d.dismiss());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascHeroRuntime3362&&window.ascStatusRules33627);
 const result=await page.evaluate(permanent=>{
  init('Q003',['Elara','Thorne']);lobbyClose();g.activeHero='Elara';g.round=1;
  const b=runtimeHeroState('Elara'),thorne=runtimeHeroState('Thorne');
  Object.assign(b,{x:0,y:0,hp:5,maxHp:10,actions:3,conditions:permanent?['Regenerating']:[],statusActivation33627:{start:'current'}});
  Object.assign(thorne,{x:1,y:0,hp:9,conditions:[]});g.levels.Thorne=1;g.xp.Thorne=0;g.equipped.Elara={Accessory:[]};
  const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};origin.enc=false;origin.visited=true;origin.firstVisitUsed=true;origin.firstVisitTriggered=true;origin.reveal=origin.ongoing=origin.special='None.';origin.traits=[];
  g.tiles['1,0']={...structuredClone(origin),id:'L006',name:'Movement expiry test'};
  render();runtimeHeroMove(1,0);
  const S=window.ascStatusRules33627,applied={x:b.x,actions:b.actions,has:S.has(b,'Regenerating'),metadata:!!b.wildGrowthRegenerating33627};
  S.heroEnd(g,'Elara',{token:'current'});const same=S.has(b,'Regenerating');
  S.heroStart(g,'Elara',{token:'next'});const hp=b.hp;S.heroEnd(g,'Elara',{token:'next'});
  return {applied,same,hp,expired:!S.has(b,'Regenerating')};
 },permanent);
 expect(result.applied).toEqual({x:1,actions:2,has:true,metadata:!permanent});expect(result.same).toBe(true);expect(result.hp).toBe(6);expect(result.expired).toBe(!permanent);expect(errors).toEqual([]);
});

test('two native clients retain ordinary movement expiry through reconnect and a real extra activation',async({browser})=>{
 test.setTimeout(60000);
 const contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage())),[a,peer]=pages,code='WILDGROWTH'+Date.now();
 for(const p of pages){p.on('dialog',d=>d.message().includes('Wild Growth')?d.accept():d.dismiss());await p.goto('/',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.ascHeroRuntime3362&&window.ascRoomTurn33618)}
 try{
  await a.evaluate(code=>{
   const old=init;init=function(){const out=old.apply(this,arguments);g.round=1;g.levels.Thorne=1;g.xp.Thorne=0;g.equipped.Elara={Accessory:[]};g.inventory.Elara=[{kind:'loot',id:'LT150',qty:1}];
    const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};origin.enc=false;origin.visited=true;origin.firstVisitUsed=true;origin.firstVisitTriggered=true;origin.reveal=origin.ongoing=origin.special='None.';origin.traits=[];
    g.tiles['1,0']={...structuredClone(origin),id:'L006',name:'Movement expiry test'};
    Object.assign(runtimeHeroState('Elara'),{x:0,y:0,hp:5,maxHp:10,actions:3,conditions:[]});
    Object.assign(runtimeHeroState('Thorne'),{x:1,y:0,hp:9,conditions:[]});return out};
   init('Q003',['Elara','Thorne']);lobbySetMultiplayerControls('remote',code,'Elara');mpFreshNewGame32529=true;mpConnect();
  },code);
  await a.waitForFunction(()=>mpJoinReady&&mpConnected()&&ascendancePartyLobby32759().players.some(p=>p.hero==='Elara'));
  await peer.evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Thorne');mpConnect()},code);
  await peer.waitForFunction(()=>mpJoinReady&&mpConnected()&&ascendancePartyLobby32759().players.some(p=>p.hero==='Thorne'));
  for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
  await expect.poll(()=>a.evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
  await a.evaluate(()=>partyStart32716());await a.waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');
  await a.evaluate(()=>ascRoomTurn33618.claim());await a.waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Elara');
  await a.evaluate(()=>runtimeHeroMove(1,0));
  for(const p of pages)await expect.poll(()=>p.evaluate(()=>({x:runtimeHeroState('Elara').x,has:ascStatusRules33627.has(runtimeHeroState('Elara'),'Regenerating'),timer:!!runtimeHeroState('Elara').wildGrowthRegenerating33627}))).toEqual({x:1,has:true,timer:true});
  await peer.evaluate(()=>mpSocket.close());await peer.waitForFunction(()=>!mpConnected());await peer.evaluate(()=>mpConnect());await peer.waitForFunction(()=>mpJoinReady&&mpConnected());
  await expect.poll(()=>peer.evaluate(()=>!!runtimeHeroState('Elara').wildGrowthRegenerating33627)).toBe(true);
  const extra=await a.evaluate(()=>ascMechanics33621.command('EXTRA_TURN',{},'Elara'));expect(extra.error).toBeFalsy();
  for(const p of pages)await expect.poll(()=>p.evaluate(()=>runtimeHeroState('Elara').hp)).toBe(6);
  await a.evaluate(()=>ascRoomTurn33618.pass());
  for(const p of pages)await expect.poll(()=>p.evaluate(()=>({has:ascStatusRules33627.has(runtimeHeroState('Elara'),'Regenerating'),timer:!!runtimeHeroState('Elara').wildGrowthRegenerating33627}))).toEqual({has:false,timer:false});
 }finally{await Promise.allSettled(contexts.map(c=>c.close()))}
});
