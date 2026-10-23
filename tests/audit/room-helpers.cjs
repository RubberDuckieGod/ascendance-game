const {expect}=require('@playwright/test');
async function room(browser,setup){
 const contexts=[await browser.newContext(),await browser.newContext()];const pages=await Promise.all(contexts.map(c=>c.newPage()));const code=`MECH${Date.now()}${Math.floor(Math.random()*10000)}`;
 for(const p of pages){p.on('dialog',d=>d.dismiss());await p.goto('/',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.ascMechanics33621)}
 const snapshot=await pages[0].evaluate(setup);
 for(let i=0;i<2;i++){
  await pages[i].evaluate(async({code,hero,snapshot})=>{window.roomMessages=[];window.roomSocket=new WebSocket(`ws://${location.host}/ws`);roomSocket.onmessage=e=>roomMessages.push(JSON.parse(e.data));await new Promise((resolve,reject)=>{roomSocket.onopen=resolve;roomSocket.onerror=reject});window.roomSend=(type,data)=>roomSocket.send(JSON.stringify({type,room:code,from:hero,data}));roomSend(snapshot?'NEW_GAME_JOIN':'JOIN',snapshot||{})},{code,hero:i?'Lyra':'Aldric',snapshot:i?null:snapshot});
  await pages[i].waitForFunction(()=>roomMessages.some(m=>m.type==='REJOIN_CREDENTIAL'));
 }
 async function send(p,type,data){await p.evaluate(({type,data})=>roomSend(type,data),{type,data})}
 async function rpc(p,type,op,extra={}){const id=`TEST-${Date.now()}-${Math.random()}`,hero=p===pages[0]?'Aldric':'Lyra';await send(p,type,{id,hero,round:1,op,...extra});await p.waitForFunction(id=>roomMessages.some(m=>m.data?.id===id&&/_(ACK|REJECTED)$/.test(m.type)),id);return p.evaluate(id=>roomMessages.find(m=>m.data?.id===id&&/_(ACK|REJECTED)$/.test(m.type)),id)}
 await send(pages[0],'LOBBY_READY',{ready:true});await send(pages[1],'LOBBY_READY',{ready:true});await pages[0].waitForFunction(()=>roomMessages.some(m=>m.type==='PARTY_LOBBY'&&m.data.players.length===2&&m.data.players.every(p=>p.ready)));await send(pages[0],'START_ADVENTURE',{});await pages[1].waitForFunction(()=>roomMessages.some(m=>m.type==='ADVENTURE_START'));const claim=await rpc(pages[0],'TURN_COMMAND','CLAIM_TURN');expect(claim.type).toBe('TURN_COMMAND_ACK');
 async function game(){await pages[0].evaluate(()=>roomMessages=roomMessages.filter(m=>m.type!=='ROOM_STATE'));await send(pages[0],'REQUEST_STATE',{});await pages[0].waitForFunction(()=>roomMessages.some(m=>m.type==='ROOM_STATE'));return pages[0].evaluate(()=>roomMessages.find(m=>m.type==='ROOM_STATE').data.game)}
 return {pages,rpc,send,game,close:()=>Promise.all(contexts.map(c=>c.close()))};
}
module.exports={room};
