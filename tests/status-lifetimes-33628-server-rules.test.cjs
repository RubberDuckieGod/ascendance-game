'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),net=require('node:net'),{spawn}=require('node:child_process'),{once}=require('node:events'),WebSocket=require('ws');
const clone=x=>structuredClone(x);
function fixture({entry=false,prayer=false,passage=false,passive=false,focusTonic=false,statuses=[]}={}){
 const card=(id,uid)=>({id,uid,name:id==='H003-016'?'Shepherd the Faithful':'Prayer of Restoration',cost:1,category:id==='H003-016'?'Movement':'Support',speed:'Action'});
 const g={round:1,phase:'Hero Phase',activeHero:'Elara',partyHeroes:['Elara','Aldric'],hero:{x:0,y:0},hp:5,actions:0,conditions:[],inspired:false,heroDeck:[{id:'H001-001',uid:'aldric-entry-draw',name:'Audit draw'}],heroHand:[{id:'H001-002',uid:'aldric-initial',name:'Audit initial'}],heroDiscard:[],heroRuntimeStates:{Elara:{hp:5,maxHp:10,actions:3,x:0,y:0,conditions:[],deck:[1,2,3].map(n=>({id:'H003-001',uid:'elara-draw-'+n,name:'Audit draw '+n})),hand:prayer?[card('H003-013','prayer-1'),card('H003-013','prayer-2')]:[card('H003-016','shepherd')],discard:[]}},equipped:{Elara:{Weapon:null,Armor:null,Accessory:['EQ142']},Aldric:{Weapon:'EQ003',Armor:'EQ086',Shield:'EQ078',Accessory:[]}},inventory:{Elara:[],Aldric:[]},partyQuestItems:[],lootDeck:[],lootDiscard:[],equipmentDecks:{Common:['EQ001']},gold:100,reputation:0,xp:{Elara:500,Aldric:0},levels:{Elara:3,Aldric:1},heroKills3259:{Elara:0,Aldric:0},tiles:{'0,0':{id:'L001',name:'Origin',terrain:'Road',traits:['Outdoor'],edges:{E:true},visited:true,revealResolved:true,enc:false,enemies:[],searchLimit:1,searchCount:0},'1,0':{id:'L003',name:'Destination',terrain:'Road',traits:['Outdoor'],edges:{W:true},visited:!entry,revealResolved:true,enc:entry,enemies:[],searchLimit:1,searchCount:0}},pool:[],searchDeck:[],encDeck:[{id:'EN029',name:'Traveling Merchant',type:'Merchant',a:'Buy/sell Common Equipment',b:'Buy/sell Common or Uncommon Equipment',c:'Buy/sell up to Rare Equipment; one Item is free',d:'Buy/sell any non-Unique Equipment; one purchase costs 25 Gold less',reward:'Merchant access'}],encDiscard:[],campaign:{currentQuest:'Q002',activeEvent:'WE001',instanceId32537:'HEALING-SERVER-33627',day:1,downtime:false,questStatus:{Q002:'Available'},history:[],heroFates:{},q002:{resolved:false,wagons:[]}}};
 if(passage){g.partyHeroes.push('Asha');g.heroRuntimeStates.Asha={hp:10,maxHp:10,actions:0,x:0,y:0,conditions:[],deck:[],hand:[],discard:[]};g.equipped.Asha={Accessory:[]};g.inventory.Asha=[];g.levels.Asha=5;g.asc329={totem:{'1,0':1}}}
 if(prayer){g.partyHeroes.push('Seraphine');g.seraphine={hp:11,maxHp:11,actions:0,x:0,y:0,conditions:[],oathboundRound:0};g.seraphineDeck=[];g.seraphineHand=[];g.seraphineDiscard=[];g.equipped.Seraphine={Accessory:[]};g.inventory.Seraphine=[];g.levels.Seraphine=1}
 if(passive){g.partyHeroes.push('Thorne');g.heroRuntimeStates.Thorne={hp:10,maxHp:10,actions:0,x:0,y:0,conditions:[],deck:[],hand:[],discard:[]};g.equipped.Thorne={Accessory:[]};g.inventory.Thorne=[];g.levels.Thorne=7;g.tiles['0,0'].vineTerrain32526={owner:'Thorne'}}
 g.heroRuntimeStates.Elara.conditions=statuses;g.inventory.Elara=[{kind:'loot',id:'LT150',qty:1},...(focusTonic?[{kind:'loot',id:'LT009',qty:2}]:[])];return g;
}
async function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})})}
async function server(dir,p){const child=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(p),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});let log='';for(const s of[child.stdout,child.stderr])s.on('data',d=>log=(log+d).slice(-9000));for(let n=0;n<150;n++){if(child.exitCode!==null)throw Error(log);try{if((await fetch(`http://127.0.0.1:${p}/health`)).ok)return {child,log:()=>log}}catch(_){}await new Promise(r=>setTimeout(r,40))}child.kill();throw Error(log||'Isolated server did not start')}
async function stop(host){if(host?.child.exitCode===null){const ended=once(host.child,'exit');host.child.kill('SIGTERM');await ended}}
async function client(p,room,hero){const ws=new WebSocket(`ws://127.0.0.1:${p}/ws`),messages=[];ws.on('message',raw=>messages.push(JSON.parse(String(raw))));await once(ws,'open');return {ws,messages,send(type,data){const at=messages.length;ws.send(JSON.stringify({type,room,from:hero,data}));return at},async wait(at,predicate){for(let n=0;n<350;n++){const found=messages.slice(at).find(predicate);if(found)return found;await new Promise(r=>setTimeout(r,10))}throw Error('Missing reply; got '+messages.slice(at).map(m=>m.type+':'+(m.data?.reason||'')).join(','))},async rpc(type,op,args={}){const id=args.id||`HEAL-WS-${Date.now()}-${Math.random()}`,at=this.send(type,{hero,round:1,op,...args,id});return this.wait(at,m=>m.data?.id===id&&/_(ACK|REJECTED)$/.test(m.type))},async canonical(){const at=this.send('REQUEST_STATE',{});return this.wait(at,m=>m.type==='ROOM_STATE')},async turn(){const at=this.send('REQUEST_TURN_STATE',{});return (await this.wait(at,m=>m.type==='TURN_STATE')).data},close(){ws.close()}}}
async function room(options={}){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-heal-server-33627-')),p=await port(),name='HEALING-LOCAL',clients=[];let host;try{host=await server(dir,p);const a=await client(p,name,'Elara');clients.push(a);let at=a.send('NEW_GAME_JOIN',{game:fixture(options)});await a.wait(at,m=>m.type==='PARTY_LOBBY');const b=await client(p,name,'Aldric');clients.push(b);at=b.send('JOIN',{});await b.wait(at,m=>m.type==='PARTY_LOBBY');a.send('LOBBY_READY',{ready:true});b.send('LOBBY_READY',{ready:true});await a.wait(0,m=>m.type==='PARTY_LOBBY'&&m.data.players.length===2&&m.data.players.every(p=>p.ready));at=a.send('START_ADVENTURE',{});await a.wait(at,m=>m.type==='ADVENTURE_START');const claimed=await a.rpc('TURN_COMMAND','CLAIM_TURN');assert.equal(claimed.type,'TURN_COMMAND_ACK');return {a,b,dir,name,host,close:async()=>{for(const c of clients)c.close();await stop(host);fs.rmSync(dir,{recursive:true,force:true})}}}catch(e){for(const c of clients)c.close();await stop(host);fs.rmSync(dir,{recursive:true,force:true});throw e}}
const shepherd={cardId:'H003-016',cardUid:'shepherd',allyHero:'Aldric',healHero:'Aldric',tileKey:'1,0'};
const uids=rows=>(rows||[]).map(c=>c.uid);



test('Hasted supplies four canonical Actions and ends at the next affected activation end',{timeout:20000},async()=>{
 const r=await room({statuses:['Hasted']});try{assert.equal((await r.a.turn()).actions.Elara,4);await r.a.rpc('TURN_COMMAND','PASS');assert.equal((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions.includes('Hasted'),false)}finally{await r.close()}
});
test('server-owned duration survives a stale snapshot and expires only after the distinct extra activation',{timeout:20000},async()=>{
 const r=await room();try{
  await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',addConditions:['Frozen']}]});let packet=await r.a.canonical(),state=structuredClone(packet.data);assert.ok(state.game.heroRuntimeStates.Elara.statusDurations33628.Frozen);delete state.game.heroRuntimeStates.Elara.statusDurations33628;
  let at=r.a.send('GAME_PATCH_3322',{baseRevision:packet.revision,state});await r.a.wait(at,m=>m.type==='STATE');assert.ok((await r.a.canonical()).data.game.heroRuntimeStates.Elara.statusDurations33628.Frozen);
  const extra=await r.a.rpc('MECHANICS_COMMAND','EXTRA_TURN',{args:{}});assert.equal(extra.type,'MECHANICS_COMMAND_ACK');assert.equal((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions.includes('Frozen'),true);
  await r.a.rpc('TURN_COMMAND','PASS');assert.equal((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions.includes('Frozen'),false);
 }finally{await r.close()}
});
test('Shocked blocks the next canonical additional Action and then permits later gains',{timeout:20000},async()=>{
 const r=await room();try{
  await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',addConditions:['Shocked']}]});const before=(await r.a.turn()).actions.Elara;
  await r.a.rpc('TURN_COMMAND','ADJUST_ACTIONS',{delta:1});assert.equal((await r.a.turn()).actions.Elara,before);assert.equal((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions.includes('Shocked'),false);
  await r.a.rpc('TURN_COMMAND','ADJUST_ACTIONS',{delta:1});assert.equal((await r.a.turn()).actions.Elara,before+1);
 }finally{await r.close()}
});

test('Barrier remainder survives canonical receipts and cannot be reset by an old compatibility snapshot',{timeout:20000},async()=>{
 const r=await room({statuses:['Barrier']});try{
  const old=structuredClone((await r.a.canonical()).data);
  const receipt=await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',removeConditions:['Barrier'],addConditions:[{name:'Barrier',remaining:1}]}]});assert.equal(receipt.type,'HERO_COMMAND_ACK');
  let packet=await r.a.canonical();assert.deepEqual(packet.data.game.heroRuntimeStates.Elara.conditions,[{name:'Barrier',remaining:1}]);
  const at=r.a.send('GAME_PATCH_3322',{baseRevision:packet.revision,state:old});await r.a.wait(at,m=>m.type==='STATE');
  packet=await r.a.canonical();assert.deepEqual(packet.data.game.heroRuntimeStates.Elara.conditions,[{name:'Barrier',remaining:1}]);
  await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',removeConditions:[{name:'Barrier',remaining:1}]}]});
  assert.deepEqual((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions,[]);
 }finally{await r.close()}
});

test('Knocked Down requires canonical Stand before spending Actions and removes it for exactly one Action',{timeout:20000},async()=>{
 const r=await room({statuses:['Knocked Down']});try{
  const denied=await r.a.rpc('TURN_COMMAND','ADJUST_ACTIONS',{delta:-1});assert.equal(denied.type,'TURN_COMMAND_REJECTED');assert.match(denied.data.reason,/Stand/);
  assert.equal((await r.a.rpc('MECHANICS_COMMAND','REST')).type,'MECHANICS_COMMAND_REJECTED');
  const stood=await r.a.rpc('MECHANICS_COMMAND','STAND');assert.equal(stood.type,'MECHANICS_COMMAND_ACK');assert.equal(stood.data.result.cost,1);assert.equal((await r.a.turn()).actions.Elara,2);assert.equal((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions.includes('Knocked Down'),false);
 }finally{await r.close()}
});

test('updating an existing Shaken usage receipt does not spend Ward as though Shaken were newly applied',{timeout:20000},async()=>{
 const r=await room({statuses:['Shaken','Ward']});try{
  const out=await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',removeConditions:['Shaken'],addConditions:[{name:'Shaken',usedRound:1}]}]});
  assert.equal(out.type,'HERO_COMMAND_ACK');assert.deepEqual((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions,['Ward',{name:'Shaken',usedRound:1}]);
 }finally{await r.close()}
});

test('Focus Tonic commits cost and expiry once; stale snapshots cannot erase or resurrect its timer',{timeout:20000},async()=>{
 const r=await room({focusTonic:true});try{
  const used=await r.a.rpc('MECHANICS_COMMAND','FOCUS_TONIC',{id:'FOCUS-ONCE'});
  assert.equal(used.type,'MECHANICS_COMMAND_ACK');assert.equal((await r.a.turn()).actions.Elara,2);
  let packet=await r.a.canonical(),g=packet.data.game,b=g.heroRuntimeStates.Elara;
  assert.ok(b.conditions.includes('Inspired'));assert.equal(g.inventory.Elara.find(x=>x.id==='LT009').qty,1);
  assert.equal(b.statusDurations33628.Inspired.duration,'Until the end of your next turn.');
  const appliedToken=b.statusDurations33628.Inspired.appliedToken;
  await r.a.rpc('MECHANICS_COMMAND','FOCUS_TONIC',{id:'FOCUS-ONCE'});
  assert.equal((await r.a.turn()).actions.Elara,2);assert.equal((await r.a.canonical()).data.game.inventory.Elara.find(x=>x.id==='LT009').qty,1);
  packet=await r.a.canonical();const stale=structuredClone(packet.data);delete stale.game.heroRuntimeStates.Elara.statusDurations33628;
  let at=r.a.send('GAME_PATCH_3322',{baseRevision:packet.revision,state:stale});await r.a.wait(at,m=>m.type==='STATE');
  assert.equal((await r.a.canonical()).data.game.heroRuntimeStates.Elara.statusDurations33628.Inspired.appliedToken,appliedToken);
  const extra=await r.a.rpc('MECHANICS_COMMAND','EXTRA_TURN');assert.equal(extra.type,'MECHANICS_COMMAND_ACK');
  packet=await r.a.canonical();assert.ok(packet.data.game.heroRuntimeStates.Elara.conditions.includes('Inspired'));
  const beforeExpiry=structuredClone(packet.data);
  await r.a.rpc('TURN_COMMAND','PASS');packet=await r.a.canonical();assert.equal(packet.data.game.heroRuntimeStates.Elara.conditions.includes('Inspired'),false);
  at=r.a.send('GAME_PATCH_3322',{baseRevision:packet.revision,state:beforeExpiry});await r.a.wait(at,m=>m.type==='STATE');
  packet=await r.a.canonical();assert.equal(packet.data.game.heroRuntimeStates.Elara.conditions.includes('Inspired'),false);
  assert.equal(packet.data.game.inventory.Elara.find(x=>x.id==='LT009').qty,1);
 }finally{await r.close()}
});
test('Focus Tonic never shortens permanent canonical Inspired',{timeout:20000},async()=>{
 const r=await room({focusTonic:true,statuses:['Inspired']});try{
  assert.equal((await r.a.rpc('MECHANICS_COMMAND','FOCUS_TONIC')).type,'MECHANICS_COMMAND_ACK');
  assert.equal((await r.a.rpc('MECHANICS_COMMAND','EXTRA_TURN')).type,'MECHANICS_COMMAND_ACK');
  await r.a.rpc('TURN_COMMAND','PASS');assert.ok((await r.a.canonical()).data.game.heroRuntimeStates.Elara.conditions.includes('Inspired'));
 }finally{await r.close()}
});

test('canonical Ward preserves itself for neutral Wet and Exhausted, then blocks harmful Exposed',{timeout:20000},async()=>{
 const r=await room({statuses:['Ward']});try{
  assert.equal((await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',addConditions:['Wet','Exhausted']}]})).type,'HERO_COMMAND_ACK');
  let b=(await r.a.canonical()).data.game.heroRuntimeStates.Elara;assert.deepEqual(b.conditions,['Ward','Wet','Exhausted']);
  assert.equal((await r.a.rpc('HERO_COMMAND','',{changes:[{hero:'Elara',addConditions:['Exposed']}]})).type,'HERO_COMMAND_ACK');
  b=(await r.a.canonical()).data.game.heroRuntimeStates.Elara;assert.deepEqual(b.conditions,['Wet','Exhausted']);
 }finally{await r.close()}
});
