'use strict';
// These assertions exercise the actual server turn commands and canonical save.
// Every room/account directory lives under this test's temporary data directory.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process'),{once}=require('node:events'),WebSocket=require('ws');
let proc,port,dir,serial=0;
const clients=[];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function body(g,h){return h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates[h]}
function game(hero,{hp=4,conditions=[],flags={}}={}){
 const state=(maxHp=12)=>({hp,maxHp,actions:0,x:0,y:0,conditions:[],deck:[],hand:[],discard:[]});
 const g={hp:4,actions:0,conditions:[],hero:{x:0,y:0},heroDeck:[],heroHand:[],heroDiscard:[],lyra:state(8),lyraDeck:[],lyraHand:[],lyraDiscard:[],seraphine:state(11),seraphineDeck:[],seraphineHand:[],seraphineDiscard:[],heroRuntimeStates:{Rowan:state(9),Garruk:state(12)},partyHeroes:[hero,'Garruk'],activeHero:hero,round:1,phase:'Hero Phase',gold:0,reputation:0,xp:{},levels:{},inventory:{[hero]:[{kind:'loot',id:'LT150',qty:1}],Garruk:[]},equipped:{[hero]:{Weapon:null,Armor:null,Accessory:[]},Garruk:{Weapon:null,Armor:null,Accessory:[]}},tiles:{'0,0':{id:'L000',name:'Stonebrook',enemies:[]}},campaign:{currentQuest:'Q002',day:1,instanceId32537:'ISOLATED-STATUS-AUDIT',downtime:false,heroFates:{},q002:{resolved:false,wagons:[]}}};
 if(!['Aldric','Lyra','Seraphine'].includes(hero))g.heroRuntimeStates[hero]??=state();
 if(hero==='Garruk')g.partyHeroes=[hero,'Rowan'];
 Object.assign(body(g,hero),flags,{hp,conditions:structuredClone(conditions)});
 return g;
}
test.before(async()=>{
 dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-status-effects-33627-'));
 port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const p=socket.address().port;socket.close(()=>resolve(p))})});
 const serverFile=process.env.ASCENDANCE_STATUS_TEST_SERVER||path.resolve(__dirname,'../server.js');
 proc=spawn(process.execPath,[serverFile],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';
 for(const stream of [proc.stdout,proc.stderr])stream.on('data',data=>{log=(log+data).slice(-10000)});
 for(let n=0;n<150;n++){if(proc.exitCode!==null)throw Error(log);try{if((await fetch(`http://127.0.0.1:${port}/health`)).ok)return}catch(_){}await pause(30)}
 throw Error('Isolated status server startup deadline: '+log);
});
test.after(async()=>{
 for(const c of clients)c.ws.terminate();
 if(proc?.exitCode===null){const ended=once(proc,'exit');proc.kill('SIGTERM');await ended}
 if(dir)fs.rmSync(dir,{recursive:true,force:true});
});
async function connect(room,hero){
 const ws=new WebSocket(`ws://127.0.0.1:${port}/ws`),messages=[];
 ws.on('message',raw=>messages.push(JSON.parse(String(raw))));await once(ws,'open');
 const c={ws,messages,send(type,data){const at=messages.length;ws.send(JSON.stringify({room,from:hero,type,data}));return at},async wait(at,type){for(let n=0;n<150;n++){const out=messages.slice(at).find(message=>message.type===type);if(out)return out;await pause(20)}throw Error(`Expected ${type}; received ${messages.slice(at).map(message=>message.type).join(', ')}`)}};
 clients.push(c);return c;
}
async function room(hero,options){
 const code=`STATUSEFFECTS${++serial}`,a=await connect(code,hero);
 let at=a.send('NEW_GAME_JOIN',{game:game(hero,options)});await a.wait(at,'PARTY_LOBBY');
 const b=await connect(code,hero==='Garruk'?'Rowan':'Garruk');at=b.send('JOIN',{});await b.wait(at,'PARTY_LOBBY');
 a.send('LOBBY_READY',{ready:true});b.send('LOBBY_READY',{ready:true});await pause(25);
 at=a.send('START_ADVENTURE',{});await a.wait(at,'ADVENTURE_START');
 const command=async(id,op='CLAIM_TURN')=>{const at=a.send('TURN_COMMAND',{id,hero,op,round:1});return a.wait(at,'TURN_COMMAND_ACK')};
 const saved=async()=>{const at=a.send('REQUEST_STATE',{});return (await a.wait(at,'ROOM_STATE')).data.game};
 return {a,b,code,command,saved};
}
for(const hero of ['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha']){
 test(`${hero}: Bleeding loses exactly 1 HP at activation start and cannot tick again on repeated claim, state read, or reconnect`,async()=>{
  const r=await room(hero,{hp:4,conditions:['Bleeding']}),before=await r.saved();
  assert.equal(body(before,hero).hp,4,'waiting to claim must not tick');
  await r.command('BLEED-START');let current=await r.saved();
  assert.equal(body(current,hero).hp,3,'first claimed activation must apply Bleeding before an Action');
  assert.deepEqual(body(current,hero).conditions,['Bleeding'],'Bleeding persists until removed');
  await r.command('BLEED-START');await r.command('BLEED-CLAIM-AGAIN');
  current=await r.saved();assert.equal(body(current,hero).hp,3,'duplicate and fresh claim requests must be idempotent');
  const disconnected=once(r.a.ws,'close');r.a.ws.terminate();await disconnected;await pause(25);
  const peer=await connect(r.code,hero);let at=peer.send('JOIN',{});await peer.wait(at,'ROOM_STATE');at=peer.send('REQUEST_STATE',{});
  assert.equal(body((await peer.wait(at,'ROOM_STATE')).data.game,hero).hp,3,'reconnect must preserve canonical tick');
  at=peer.send('TURN_COMMAND',{id:'REJOIN-RECLAIM',hero,op:'CLAIM_TURN',round:1});const resumed=await peer.wait(at,'TURN_COMMAND_ACK');
  assert.equal(resumed.data.heroTurnStarted,false,'reclaim must not begin a second activation');assert.equal(resumed.data.turn.turnHero,hero,'reconnected Hero must recover ownership of the existing turn');assert.equal(resumed.data.turn.actions[hero],3);
  at=peer.send('REQUEST_STATE',{});const reclaimed=(await peer.wait(at,'ROOM_STATE')).data.game;assert.equal(body(reclaimed,hero).hp,3);assert.equal(reclaimed.roomAuthority3300.startSeqByHero[hero],1);
  const persisted=JSON.parse(fs.readFileSync(path.join(dir,r.code+'.json'),'utf8')).state.game;
  assert.equal(body(persisted,hero).hp,3,'the exact tick must be persisted');
 });
 test(`${hero}: Regenerating recovers 1 HP at activation start and remains for later activations`,async()=>{
  const r=await room(hero,{hp:3,conditions:[{name:'Regenerating',source:'test'}]});
  assert.equal(body(await r.saved(),hero).hp,3);
  await r.command('REGEN-START');const current=await r.saved();
  assert.equal(body(current,hero).hp,4,'Regenerating must execute for each Hero state layout and named condition objects');
  assert.equal(current.roomAuthority3300.actions[hero],3,'recovery must not spend an Action');
  assert.deepEqual(body(current,hero).conditions,[{name:'Regenerating',source:'test'}],'recovery does not consume Regenerating');
  await r.command('REGEN-CLAIM-AGAIN');assert.equal(body(await r.saved(),hero).hp,4);
 });
}
test('Bleeding and Regenerating execute again for an actual extra activation, with no end-of-turn Bleeding tick',async()=>{
 const r=await room('Rowan',{hp:4,conditions:['Bleeding']});
 await r.command('EXTRA-FIRST');assert.equal(body(await r.saved(),'Rowan').hp,3);
 const at=r.a.send('MECHANICS_COMMAND',{id:'EXTRA-SECOND',hero:'Rowan',op:'EXTRA_TURN',round:1,args:{}});
 await r.a.wait(at,'MECHANICS_COMMAND_ACK');
 const current=await r.saved();assert.equal(body(current,'Rowan').hp,2,'a full extra activation receives a fresh start tick');
 assert.equal(current.roomAuthority3300.actions.Rowan,3);
 assert.equal(current.roomAuthority3300.startSeqByHero.Rowan,2);
});
test('Regenerating respects a recovery prohibition instead of bypassing the existing no-heal rule',async()=>{
 const r=await room('Rowan',{hp:3,conditions:['Regenerating'],flags:{noHealUntilRound:1}});
 await r.command('NO-HEAL-START');assert.equal(body(await r.saved(),'Rowan').hp,3);
});
test('a fatal Bleeding start grants no usable Actions or active turn, and Regenerating cannot revive a downed Hero',async()=>{
 const r=await room('Rowan',{hp:1,conditions:['Bleeding','Regenerating']});
 await r.command('FATAL-START');const current=await r.saved();
 assert.equal(body(current,'Rowan').hp,0,'damage resolves before recovery and must not resurrect a Hero');
 assert.equal(current.roomAuthority3300.actions.Rowan,0);
 assert.notEqual(current.roomAuthority3300.turnHero,'Rowan');
 assert.equal(current.campaign.heroFates.Rowan.status,'Downed');
});
for(const [condition,startHp,endHp]of [['Poisoned',3,3],['Burning',4,3]])test(`${condition}: canonical start/end timing is enforced by real CLAIM and PASS commands`,async()=>{
 const r=await room('Rowan',{hp:4,conditions:[condition]});await r.command('TIMING-START');
 assert.equal(body(await r.saved(),'Rowan').hp,startHp);
 await r.command('TIMING-END','PASS');const current=await r.saved();assert.equal(body(current,'Rowan').hp,endHp);assert.deepEqual(body(current,'Rowan').conditions,[condition]);
});
test('Stunned forfeits the actual activation and still resolves Poisoned/Burning and automatic expiry',async()=>{
 const r=await room('Rowan',{hp:4,conditions:['Stunned','Poisoned','Burning']});await r.command('STUN-START');
 const current=await r.saved();assert.equal(body(current,'Rowan').hp,2);assert.deepEqual(body(current,'Rowan').conditions,['Poisoned','Burning']);assert.equal(current.roomAuthority3300.actions.Rowan,0);assert.notEqual(current.roomAuthority3300.turnHero,'Rowan');assert.equal(current.passedHeroes32521.Rowan,true);
});
test('Slowed grants two actual Actions on a Hero activation without consuming the condition',async()=>{
 const r=await room('Rowan',{hp:4,conditions:['Slowed']});await r.command('SLOW-START');const current=await r.saved();assert.equal(current.roomAuthority3300.actions.Rowan,2);assert.deepEqual(body(current,'Rowan').conditions,['Slowed']);
});
test('spending the final Action automatically ends the actual Hero activation and resolves persistent Burning',async()=>{
 const r=await room('Rowan',{hp:4,conditions:['Burning']});await r.command('SPENT-START');
 const at=r.a.send('TURN_COMMAND',{id:'SPENT-LAST',hero:'Rowan',op:'ADJUST_ACTIONS',round:1,delta:-3});await r.a.wait(at,'TURN_COMMAND_ACK');
 const current=await r.saved();assert.equal(current.heroRuntimeStates.Rowan.hp,3,'automatic activation completion must execute end status effects');assert.equal(current.roomAuthority3300.actions.Rowan,0);assert.equal(current.roomAuthority3300.turnHero,null);assert.equal(current.passedHeroes32521.Rowan,true);
});
test('applying Stunned during a current Hero activation immediately ends it and resolves Burning once',async()=>{
 const r=await room('Rowan',{hp:4,conditions:['Burning']});await r.command('MIDSTUN-START');
 let at=r.a.send('HERO_COMMAND',{id:'MIDSTUN-APPLY',hero:'Rowan',round:1,changes:[{hero:'Rowan',addConditions:['Stunned']}]});await r.a.wait(at,'HERO_COMMAND_ACK');
 const current=await r.saved();assert.equal(body(current,'Rowan').hp,3);assert.equal(current.roomAuthority3300.actions.Rowan,0);assert.notEqual(current.roomAuthority3300.turnHero,'Rowan');assert.deepEqual(body(current,'Rowan').conditions,['Burning']);
});
test('a compatibility snapshot cannot strip or forge the canonical status activation receipt or erase its Downed fate',async()=>{
 const r=await room('Rowan',{hp:1,conditions:['Bleeding']});await r.command('RECEIPT-START');
 let at=r.a.send('REQUEST_STATE',{});const packet=await r.a.wait(at,'ROOM_STATE'),before=packet.data.game;
 const expected=structuredClone(before.heroRuntimeStates.Rowan.statusActivation33627),fate=structuredClone(before.campaign.heroFates.Rowan);
 assert.ok(expected.start);assert.equal(fate.status,'Downed');
 const stale=structuredClone(packet.data);delete stale.game.heroRuntimeStates.Rowan.statusActivation33627;delete stale.game.campaign.heroFates.Rowan;
 at=r.a.send('GAME_PATCH_3322',{baseRevision:packet.revision,state:stale});await r.a.wait(at,'STATE');
 const current=await r.saved();assert.deepEqual(current.heroRuntimeStates.Rowan.statusActivation33627,expected,'canonical receipt must survive an otherwise valid legacy snapshot');assert.deepEqual(current.campaign.heroFates.Rowan,fate,'the fatal status fate must survive the same snapshot');
 at=r.a.send('REQUEST_STATE',{});const next=await r.a.wait(at,'ROOM_STATE'),forged=structuredClone(next.data);forged.game.heroRuntimeStates.Rowan.statusActivation33627={start:'forged',end:'forged'};forged.game.campaign.heroFates.Rowan={status:'Survived'};
 at=r.a.send('GAME_PATCH_3322',{baseRevision:next.revision,state:forged});await r.a.wait(at,'STATE');
 const kept=await r.saved();assert.deepEqual(kept.heroRuntimeStates.Rowan.statusActivation33627,expected);assert.deepEqual(kept.campaign.heroFates.Rowan,fate);
});
