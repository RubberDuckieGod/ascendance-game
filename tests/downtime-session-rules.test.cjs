'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function registerTests(test,assert,runtime,server,html,rules){
 const clone=x=>JSON.parse(JSON.stringify(x));
 const heroes=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
 const begin=server.indexOf("  if(m.type==='DOWNTIME_COMMAND'){"),end=server.indexOf("  if(m.type==='MECHANICS_COMMAND'){",begin);
 assert.ok(begin>=0&&end>begin);
 const handler=new Function('env','with(env){'+server.slice(begin,end)+'}');
 const markBegin=server.indexOf("function rememberDowntime33622("),markEnd=server.indexOf("\n}",markBegin)+2;
 const remember=new Function(server.slice(markBegin,markEnd)+";return rememberDowntime33622")();
 const afStart=html.indexOf(" function qid32920(){"),afEnd=html.indexOf(" function hasMap32920(){",afStart);
 const proceedStart=html.indexOf(" window.proceedAfterQuest32920=function(){"),proceedEnd=html.indexOf(" // Completion still awards",proceedStart);
 assert.ok(afStart>=0&&afEnd>afStart&&proceedStart>=0&&proceedEnd>proceedStart);
 const initProceed=new Function('env','with(env){'+html.slice(afStart,afEnd)+html.slice(proceedStart,proceedEnd)+'}');
 const game=(party=['Mordren'])=>({gold:100,phase:'End Phase',partyHeroes:party,activeHero:party[0],inventory:Object.fromEntries(party.map(h=>[h,[]])),partyQuestItems:[],campaign:{activeEvent:'WE001',currentQuest:'Q001',day:2,downtime:false,lastQuestOutcome:{quest:'Q001',day:1,outcome:'Completed'},questStatus:{Q001:'Completed'},history:[{quest:'Q001',outcome:'Completed',day:1,event:'WE001'}],afterQuestExplore32920:{active:true,quest:'Q001'},afterQuestExploreDismissed32920:{}}});
 function boot({g=game(),room='',role='Mordren',socket=null,joined=true,transport=null}={}){
  const notices=[],sent=[],buttons=g.partyHeroes.map(()=>({disabled:false})),cards=buttons.map(b=>({dataset:{},querySelectorAll:()=>[b],appendChild(){}}));
  const panel={querySelectorAll:q=>q==='.invCard'?cards:[],appendChild(){}};
  const env={g,mpRoom:room,mpMode:'remote',mpRole:role,mpSocket:socket,mpJoinReady:joined,mpLastSent:'',document:{readyState:'complete',getElementById:id=>id==='downtimeActivityStatus'?panel:null,createElement:()=>({dataset:{},setAttribute(){}})},ascDowntimeRules33622:rules,
   mpConnected(){return !!env.mpSocket},mpCanControl(h){return !env.mpConnected()||env.mpRole===h},
   chooseDowntimeActivity3252(){throw Error('Unpatched legacy activity called')},craftRecipe(){throw Error('Unpatched legacy craft called')},recipeState(){return {ok:false,reasons:['legacy']}},
   mpHandleMessage(m){if(m.type==='RESOURCE_STATE')Object.assign(env.g,clone(m.data.resources));if(m.type==='STATE')env.g=clone(m.data.game)},
   mpSend(type,data){sent.push({type,data:clone(data)});if(transport)transport(type,data)},renderInventory(){},renderDowntimeActivities3252(){buttons.forEach(b=>b.disabled=false)},render(){env.renderDowntimeActivities3252()},mpScheduleState(){},inventoryHero(){return env.g.activeHero},controlledHero(){return env.g.activeHero},partyHeroes(){return env.g.partyHeroes},showLootNotice(t,m){notices.push([t,m])},log(){},setTimeout(){return 1},clearTimeout(){}};
  env.window=env;new Function('env','with(env){'+runtime+'}')(env);initProceed(env);
  return {env,buttons,notices,sent,proceed(){env.proceedAfterQuest32920();assert.equal(env.g.campaign.downtime,true);assert.equal(env.g.campaign.afterQuestExplore32920.active,false)},choose(h,t,p){return env.chooseDowntimeActivity3252(h,t,p)}};
 }
 function network(){
  const g=game(['Mordren','Aldric']);const r={latestState:{game:g},adventureStarted:true,resourceSeq3310:0,revision:1,clients:[]};
  let saved=clone(r.latestState);const packets=[],peers={};
  function send(ws,packet){packets.push({role:ws.role,...clone(packet)});peers[ws.role]?.env.mpHandleMessage(clone(packet))}
  function command(role,data){handler({m:{type:'DOWNTIME_COMMAND',data},ws:{role},rn:'DT-REGRESSION',r,gameFromRoom3300:r=>r.latestState.game,party3300:g=>g.partyHeroes,downtime33622:rules,downtimePublic33622:r=>({downtime:rules.state(r.latestState.game),resource:{seq:r.resourceSeq3310,resources:{gold:r.latestState.game.gold,inventory:clone(r.latestState.game.inventory)}}}),send,ensureTurnAuthority3300:()=>({turnHero:'Aldric',resolving:r.resolving||false}),clone3301:clone,rememberDowntime33622:remember,ensureResourceStore3310(){},ROOM_RESOURCE_VERSION_3310:'test',saveRoomState(rn,state){saved=clone(state)},debugEvent(){},crypto:{randomInt:()=>0}})}
  for(const role of g.partyHeroes){r.clients.push({role});peers[role]=boot({g:clone(g),room:'DT-REGRESSION',role,socket:{readyState:1},transport:(type,data)=>{if(type==='DOWNTIME_COMMAND')command(role,data)}})}
  // Exercise the real Proceed handler for each client; canonical server state is a fixture,
  // not a simulated compatibility-patch commit.
  for(const p of Object.values(peers))p.proceed();r.latestState.game.campaign.downtime=true;r.latestState.game.campaign.afterQuestExplore32920.active=false;
  return {r,peers,packets,command,saved:()=>clone(saved)};
 }
 test('new solo game defaults to remote preference but enables Mordren Work after Proceed',async()=>{
  const p=boot();assert.equal(p.env.mpMode,'remote');assert.equal(p.env.mpRoom,'');
  assert.ok((await p.choose('Mordren','Work')).error);p.proceed();assert.equal(p.buttons[0].disabled,false);
  const result=await p.choose('Mordren','Work');assert.equal(result.gold,25);assert.equal(p.env.g.gold,125);
  assert.equal(p.sent.length,0);assert.ok((await p.choose('Mordren','Work')).error);assert.equal(p.env.g.gold,125);
 });
 test('all sixteen solo heroes can choose their own downtime activity',async()=>{
  for(const hero of heroes){const p=boot({g:game([hero]),role:hero});p.proceed();assert.equal((await p.choose(hero,'Work')).gold,25);assert.equal(p.env.g.gold,125)}
 });
 test('Mordren solo Gather, Research and actual Craft use shared rules and save choices',async()=>{
  const p=boot();p.proceed();let res=await p.choose('Mordren','Gather','Blacksmithing');assert.equal(res.materialIds.length,2);assert.equal(p.env.g.inventory.Mordren.reduce((n,x)=>n+x.qty,0),2);
  const restored=boot({g:clone(p.env.g)});assert.ok((await restored.choose('Mordren','Work')).error);
  restored.env.g.campaign.lastQuestOutcome={quest:'Q002',day:2,outcome:'Completed'};restored.env.g.campaign.currentQuest='Q002';
  assert.equal((await restored.choose('Mordren','Research','Blacksmithing')).discount,25);
  restored.env.g.campaign.lastQuestOutcome={quest:'Q003',day:3,outcome:'Completed'};restored.env.g.campaign.currentQuest='Q003';
  assert.equal((await restored.choose('Mordren','Craft')).type,'Craft');
  restored.env.g.inventory.Mordren=rules.recipe('CR001').materials.map(m=>({key:'loot:'+m.id,kind:'loot',id:m.id,qty:m.qty}));
  const craft=await restored.env.craftRecipe('CR001');assert.equal(craft.resultName,'Iron Shortsword');assert.equal(craft.goldSpent,0);assert.equal(craft.researchDiscount,10);assert.equal(restored.env.g.campaign.researchPrep3252.Mordren.Blacksmithing,0);assert.ok(restored.env.g.inventory.Mordren.some(x=>x.id==='EQ002'));assert.equal(restored.sent.length,0);
 });
 test('disconnected, opening or not-yet-joined remote room never applies local rewards',async()=>{
  for(const [socket,joined]of [[null,true],[{readyState:0},true],[{readyState:1},false]]){
   const p=boot({room:'STILL-IN-ROOM',socket,joined});p.proceed();assert.equal(p.buttons[0].disabled,true);
   assert.match((await p.choose('Mordren','Work')).error,/Reconnect/);assert.equal(p.env.g.gold,100);assert.equal(p.sent.length,0);
  }
  const p=boot({room:'STILL-IN-ROOM'});p.proceed();p.env.mpRoom='';p.env.renderDowntimeActivities3252();assert.equal(p.buttons[0].disabled,false);assert.equal((await p.choose('Mordren','Work')).gold,25);
 });
 test('connected Mordren off-turn Work commits once on actual server command path and syncs both clients',async()=>{
  const n=network(),p=n.peers.Mordren;assert.equal(p.buttons[0].disabled,false);assert.equal(p.buttons[1].disabled,true);
  assert.ok((await p.choose('Aldric','Work')).error);assert.equal(p.sent.length,0);
  assert.equal((await p.choose('Mordren','Work')).gold,25);assert.equal(n.r.latestState.game.gold,125);
  for(const peer of Object.values(n.peers)){assert.equal(peer.env.g.gold,125);assert.equal(peer.env.g.campaign.downtimeActivities3252.Mordren.type,'Work')}
  const command=p.sent[0].data;n.command('Mordren',command);assert.equal(n.r.latestState.game.gold,125);assert.ok(n.packets.some(m=>m.type==='DOWNTIME_COMMAND_ACK'&&m.data.duplicate));
  n.command('Aldric',{...command,id:'forged'});assert.ok(n.packets.some(m=>m.type==='DOWNTIME_COMMAND_REJECTED'&&m.data.id==='forged'));assert.equal(n.r.latestState.game.gold,125);
  n.command('Mordren',{...command,id:'stale',token:'old'});assert.ok(n.packets.some(m=>m.type==='DOWNTIME_COMMAND_REJECTED'&&m.data.id==='stale'));
  assert.equal(n.saved().game.gold,125);assert.equal(n.saved().game.campaign.downtimeActivities3252.Mordren.type,'Work');
  assert.equal((await n.peers.Aldric.choose('Aldric','Work')).gold,25);assert.equal(n.r.latestState.game.gold,150);
 });
 test('connected Mordren Gather, Research and Craft use actual server handler and synchronize',async()=>{
  for(const [type,profession]of [['Gather','Blacksmithing'],['Research','Alchemy'],['Craft','']]){
   const n=network(),p=n.peers.Mordren;const result=await p.choose('Mordren',type,profession);assert.equal(result.type,type);
   for(const peer of Object.values(n.peers))assert.equal(peer.env.g.campaign.downtimeActivities3252.Mordren.type,type);
   if(type==='Gather')assert.equal(n.r.latestState.game.inventory.Mordren.reduce((sum,x)=>sum+x.qty,0),2);
   if(type==='Research')assert.equal(n.r.latestState.game.campaign.researchPrep3252.Mordren.Alchemy,1);
   if(type==='Craft'){
    const materials=rules.recipe('CR001').materials.map(m=>({key:'loot:'+m.id,kind:'loot',id:m.id,qty:m.qty}));
    n.r.latestState.game.inventory.Mordren=clone(materials);for(const peer of Object.values(n.peers))peer.env.g.inventory.Mordren=clone(materials);
    const craft=await p.env.craftRecipe('CR001');assert.equal(craft.resultName,'Iron Shortsword');assert.equal(n.r.latestState.game.gold,90);
    for(const peer of Object.values(n.peers))assert.ok(peer.env.g.inventory.Mordren.some(x=>x.id==='EQ002'));
   }
  }
 });
 test('remote server rejects activity while phase resolution is active without spending',async()=>{
  const n=network();n.r.resolving=true;const result=await n.peers.Mordren.choose('Mordren','Work');assert.match(result.error,/phase resolution/);assert.equal(n.r.latestState.game.gold,100);assert.equal(rules.state(n.r.latestState.game).activities.Mordren,undefined);
 });
}
registerTests(test,assert,read('public/downtime-runtime-33622.js'),read('server.js'),read('public/index.html'),require('../public/downtime-rules-33622.js'));
