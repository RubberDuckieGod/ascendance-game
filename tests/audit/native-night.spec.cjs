const {test,expect}=require('@playwright/test');
test('actual game clients: Night’s Whisper starts exactly one full extra turn after a lethal Basic Attack',async({browser},info)=>{
 test.setTimeout(45000);const contexts=[await browser.newContext(),await browser.newContext()],pages=await Promise.all(contexts.map(c=>c.newPage())),code=`NATIVE-NIGHT${Date.now()}`,errors=[],frames=[],volleys=[];
 try{
 for(const p of pages){p.on('websocket',ws=>{for(const [event,dir]of [['framesent','sent'],['framereceived','received']])ws.on(event,f=>{try{const m=JSON.parse(String(f.payload));if(/MECHANICS|COMBAT|TURN_COMMAND_REJECTED/.test(m.type))frames.push({client:pages.indexOf(p),dir,...m})}catch(_){}})});p.on('dialog',d=>d.dismiss());p.on('pageerror',e=>errors.push(e.message));await p.goto('/');await p.waitForFunction(()=>window.ascMechanics33621)}
 await pages[0].evaluate(code=>{const originalInit=init;init=function(){const out=originalInit.apply(this,arguments);g.equipped.Aldric={Weapon:'EQ044',Armor:null,Shield:null,Offhand:null,Accessory:[]};const en=encounterEnemy320('E001');en.hp=1;en.max=1;en.armor=0;g.tiles['0,0'].enemies=[en];return out};init('Q003',['Aldric']);lobbySetMultiplayerControls('remote',code,'Aldric');mpFreshNewGame32529=true;mpConnect()},code);
 await pages[0].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero===mpRole));
 await pages[1].evaluate(code=>{lobbySetMultiplayerControls('remote',code,'Lyra');mpConnect()},code);await pages[1].waitForFunction(()=>mpJoinReady&&mpSocket?.readyState===WebSocket.OPEN&&ascendancePartyLobby32759().players.some(p=>p.hero===mpRole));
 for(const p of pages)await p.evaluate(()=>mpSend('LOBBY_READY',{ready:true}));await expect.poll(()=>pages[0].evaluate(()=>ascendancePartyLobby32759().players.filter(p=>p.ready).length)).toBe(2);
 await pages[0].evaluate(()=>partyStart32716());await pages[0].waitForFunction(()=>document.body.dataset.ascAdventureActive==='1'&&ascRoomTurn33618.state()?.phase==='Hero Phase');await pages[0].evaluate(()=>ascRoomTurn33618.claim());await pages[0].waitForFunction(()=>ascRoomTurn33618.state()?.turnHero==='Aldric');
 for(const p of pages)await expect(p.locator('#reactionOverlay')).toBeHidden();
 const before=await pages[0].evaluate(()=>g.heroHand.length);
 await expect(pages[0].locator('#attack')).toBeEnabled();await pages[0].locator('#attack').click();
 for(const p of pages){await expect.poll(()=>p.evaluate(()=>g.tiles['0,0'].enemies.length)).toBe(0);await expect.poll(()=>p.evaluate(()=>ascRoomTurn33618.state()?.startSeqByHero.Aldric)).toBe(2)}
 await expect.poll(()=>pages[0].evaluate(()=>heroActionCount('Aldric'))).toBe(3);expect(await pages[0].evaluate(()=>g.heroHand.length)).toBe(before+2);expect(errors).toEqual([]);
 }finally{await info.attach('room-combat-trace',{body:JSON.stringify({errors,volleys,frames,states:await Promise.all(pages.map(p=>p.evaluate(()=>({hp:g?.tiles['0,0']?.enemies[0]?.hp,log:g?.adventureLog?.slice(-30),turn:ascRoomTurn33618.state(),debug:ascDebug3271.events.slice(-50)})).catch(e=>String(e))))},null,2),contentType:'application/json'});await Promise.race([Promise.allSettled(contexts.map(c=>c.close())),new Promise(r=>setTimeout(r,1000))])}
});
