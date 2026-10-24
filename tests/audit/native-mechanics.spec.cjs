const {test,expect}=require('@playwright/test');
test('actual game clients: Rest synchronizes Health/Actions and preserves the Action guard',async({browser})=>{
 test.setTimeout(45000);const contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage())),code=`NATIVE${Date.now()}`;
 try{
 for(const p of pages){p.on('dialog',d=>d.dismiss());await p.goto('/');await p.waitForFunction(()=>window.ascMechanics33621)}
 await pages[0].evaluate(code=>{const originalInit=init;init=function(){const out=originalInit.apply(this,arguments);g.hp=heroMaxHp('Aldric')-4;g.tiles['0,0'].enemies=[];addInventoryItem('Aldric','LT012','loot',1);return out};init('Q003',['Aldric']);lobbySetMultiplayerControls('remote',code,'Aldric');mpFreshNewGame32529=true;mpConnect()},code);
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero===mpRole));
 await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero===mpRole));
 for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));
 await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
 await pages[0].evaluate(()=>partyStart32716());await pages[0].waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&window.ascRoomTurn33618?.state()?.phase==='Hero Phase');
 await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');
 const before=await pages[0].evaluate(()=>g.hp);
 await expect.poll(()=>pages[1].evaluate(()=>g.hp)).toBe(before);
 await pages[0].evaluate(()=>restHero33621('Aldric'));
 await expect.poll(()=>pages[0].evaluate(()=>heroActionCount('Aldric'))).toBe(1);await expect.poll(()=>pages[1].evaluate(()=>g.hp)).toBe(before+3);
 expect(await pages[0].evaluate(()=>g.hp)).toBe(before+3);
 expect(await pages[0].evaluate(()=>ascActionGuard33621.pending().Aldric||0)).toBe(0);
 }finally{await Promise.race([Promise.allSettled(contexts.map(c=>c.close())),new Promise(r=>setTimeout(r,1000))])}
});
