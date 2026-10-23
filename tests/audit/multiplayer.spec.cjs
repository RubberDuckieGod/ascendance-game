const {test,expect}=require('@playwright/test');
// Two isolated browser contexts connect to the actual local WebSocket protocol.
// Deliberately bypasses UI handlers: this is server authority coverage.
async function connect(page,hero,room,snapshot,token){
 if(page.url()==='about:blank')await page.goto('/',{waitUntil:'domcontentloaded'});await page.evaluate(async({hero,room,snapshot,token})=>{
 window.auditMessages=[];window.auditSocket=new WebSocket(`ws://${location.host}/ws`);
 auditSocket.onmessage=e=>auditMessages.push(JSON.parse(e.data));
 await new Promise((ok,no)=>{auditSocket.onopen=ok;auditSocket.onerror=no});
 window.auditSend=(type,data)=>auditSocket.send(JSON.stringify({type,room,from:hero,data}));
 auditSend(snapshot?'NEW_GAME_JOIN':'JOIN',snapshot||{rejoinToken3321:token});
 },{hero,room,snapshot,token});
 await page.waitForFunction(()=>auditMessages.some(m=>m.type==='REJOIN_CREDENTIAL'||m.type==='CAMPAIGN_REJOIN_TOKEN'||/REJOIN/.test(m.type)));
}
async function send(page,type,data){await page.evaluate(({type,data})=>auditSend(type,data),{type,data})}
async function command(page,op,hero,extra={}){const id=`audit-${op}-${Date.now()}-${Math.random()}`;await send(page,'TURN_COMMAND',{id,op,hero,round:1,...extra});await page.waitForFunction(id=>auditMessages.some(m=>m.data?.id===id&&['TURN_COMMAND_ACK','TURN_COMMAND_REJECTED'].includes(m.type)),id);return page.evaluate(id=>auditMessages.find(m=>m.data?.id===id&&['TURN_COMMAND_ACK','TURN_COMMAND_REJECTED'].includes(m.type)),id)}
test('two browser clients: turn grants, rejects, hold, synchronization and reconnect',async({browser},info)=>{
 const a=await browser.newContext(),b=await browser.newContext();const p=await a.newPage(),q=await b.newPage();const room=`AUDIT${Date.now()}`;p.on('dialog',d=>d.dismiss());q.on('dialog',d=>d.dismiss());
 try{
 await p.goto('/',{waitUntil:'domcontentloaded'});const snapshot=await p.evaluate(()=>{init('Q001',['Aldric','Lyra']);return {game:g}});
 await connect(p,'Aldric',room,snapshot);await connect(q,'Lyra',room);
 await send(p,'LOBBY_READY',{ready:true});await send(q,'LOBBY_READY',{ready:true});
 await p.waitForFunction(()=>auditMessages.some(m=>m.type==='PARTY_LOBBY'&&m.data.players.length===2&&m.data.players.every(p=>p.ready)));
 await send(p,'START_ADVENTURE',{});await q.waitForFunction(()=>auditMessages.some(m=>m.type==='ADVENTURE_START'));
 let r=await command(p,'CLAIM_TURN','Aldric');expect(r.type).toBe('TURN_COMMAND_ACK');expect(r.data.turn.actions.Aldric).toBe(3);
 const first=r.data.turn; r=await command(p,'CLAIM_TURN','Aldric');expect(r.data.heroTurnStarted).toBe(false);expect(r.data.turn.actions.Aldric).toBe(3);
 r=await command(q,'CLAIM_TURN','Lyra');expect(r.type).toBe('TURN_COMMAND_REJECTED');
 r=await command(q,'ADJUST_ACTIONS','Lyra',{delta:-1});expect(r.type).toBe('TURN_COMMAND_REJECTED');
 r=await command(p,'ADJUST_ACTIONS','Aldric',{delta:-1});expect(r.data.turn.actions.Aldric).toBe(2);
 r=await command(p,'PASS','Aldric');expect(r.data.turn.actions.Aldric).toBe(2);expect(r.data.turn.turnHero).toBeNull();
 r=await command(p,'CLAIM_TURN','Aldric');expect(r.type).toBe('TURN_COMMAND_REJECTED');
 r=await command(q,'CLAIM_TURN','Lyra');expect(r.data.turn.actions.Lyra).toBe(3);
 await p.waitForFunction(()=>auditMessages.some(m=>m.type==='TURN_STATE'&&m.data.turnHero==='Lyra'&&m.data.actions.Aldric===2));
 const messages=await q.evaluate(()=>auditMessages);await info.attach('protocol-evidence',{body:JSON.stringify({first,messages:messages.filter(m=>!/REJOIN/.test(m.type))},null,2),contentType:'application/json'});
 const credential=messages.find(m=>/REJOIN/.test(m.type));const token=credential?.data?.token||credential?.data?.rejoinToken3321;
 expect(token,'server must supply rejoin credential').toBeTruthy();
 await q.evaluate(()=>auditSocket.close());await q.waitForFunction(()=>auditSocket.readyState===3);
 await connect(q,'Lyra',room,null,token);await q.waitForFunction(()=>auditMessages.some(m=>m.type==='ROOM_STATE'));
 const restored=await q.evaluate(()=>auditMessages.find(m=>m.type==='ROOM_STATE').data.game);
 expect(restored.roomAuthority3300.actions.Aldric).toBe(2);expect(restored.partyHeroes).toEqual(expect.arrayContaining(['Aldric','Lyra']));
 }finally{await a.close();await b.close()}
});
