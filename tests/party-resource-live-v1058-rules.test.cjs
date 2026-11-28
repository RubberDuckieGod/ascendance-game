'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function registerTests(test,assert,api){
 const {R,S,C,Room,controls,legacy,sw}=api;
 const clone=x=>JSON.parse(JSON.stringify(x));
 const card=(id,extra={})=>({id,name:id,category:'Attack',...extra});
 function game(q='Q013'){
  return {partyHeroes:['Mordren','Aldric'],activeHero:'Mordren',round:1,phase:'Hero Phase',campaign:{currentQuest:q,instanceId32537:'lore-live',questStatus:{[q]:'Available'},genericQuest:{id:q,flags:{},counters:{}}},partyLore1058:12,partySupplies33615:4,partyEvidence1058:0,hp:12,maxHp:12,actions:3,hero:{x:0,y:0},heroDeck:[],heroHand:[],heroDiscard:[],heroRuntimeStates:{Mordren:{hp:8,maxHp:8,actions:3,x:0,y:0,deck:[card('draw')],hand:[card('hand')],discard:[card('ordinary'),card('spell',{traits:'Arcane; Spell'}),card('ult',{keywords:'Ultimate'}),card('spellUpper',{Traits:'Divine; Spell'})]}},tiles:{'0,0':{id:'L025',enemies:[]}},searchDeck:['S1','S2','S3','S4'].map(x=>card(x)),pool:['L1','L2','L3','L4'].map(x=>card(x)),encDeck:['E1','E2','E3'].map(x=>card(x))};
 }
 const turn=()=>({phase:'Hero Phase',turnHero:'Mordren',started:{Mordren:true},actions:{Mordren:3,Aldric:3},passed:{},activationSeq:1});
 const pendingEncounter=(n=5,mode='rolled')=>({kind:'encounter',hero:'Mordren',round:1,card:{id:'EN001',name:'Test Encounter',a:'low',b:'medium',c:'high',d:'extreme'},severity:n,roll:n,baseRoll:n,severityMode:mode,text:n<=2?'low':n<=4?'medium':'high'});
 function boot({g=game(),remote=false,disconnected=false,pEnc=null,roll=6,answers=[]}={}){
  const notices=[],prompts=[],sent=[],queue=answers.slice();
  function el(tag){return {tag,children:[],style:{},dataset:{},disabled:false,textContent:'',appendChild(x){x.parentElement=this;this.children.push(x);return x},append(...xs){xs.forEach(x=>this.appendChild(x))},replaceChildren(...xs){this.children=[];this.append(...xs)},classList:{add(){},remove(){}}}}
  const root=el('main'),anchor=el('div');anchor.id='mechanicsActions33621';root.appendChild(anchor);
  const byId=(e,id)=>e.id===id?e:e.children.map(c=>byId(c,id)).find(Boolean);
  const doc={createElement:el,getElementById:id=>byId(root,id)||null};
  const t=turn();
  const r={latestState:{game:clone(g)},adventureStarted:true,resourceSeq3310:0,exploreSeq3305:0,explorePending3305:pEnc?{Mordren:clone(pEnc)}:{}};
  const other=clone(g);
  const env={g,mpMode:'remote',mpRoom:remote?'LORE-TEST':'',mpSocket:remote&&!disconnected?{readyState:1}:null,mpJoinReady:true,pEnc,pLoc:null,pSearch:null,skipSearch:[],document:doc,ascPartyResources1058:R,ascPartyResourceSources1058:S,ascPartyResourceExtras1058:C,ascRoomTurn33618:{state:()=>t},Math:Object.assign(Object.create(Math),{random:()=>((roll-0.5)/6)}),setTimeout:()=>1,clearTimeout(){},
   controlledHero:()=>env.g.activeHero,heroDefeated:h=>h==='Mordren'?env.g.heroRuntimeStates.Mordren.hp<=0:env.g.hp<=0,heroHasCondition:()=>false,mpConnected:()=>!!env.mpSocket,heroMaxHp:()=>12,shuffle:a=>a,render(){},mpHandleMessage(){},mpScheduleState(){},alert:m=>notices.push(String(m)),prompt:(m)=>{prompts.push(m);return queue.length?queue.shift():null},
   mpSend(type,cmd){sent.push({type,cmd:clone(cmd)});const result=Room.handle(r,cmd,{actor:'Mordren',turn:t,downed:()=>false,stunned:()=>false,roll:()=>roll,shuffle:a=>a,maxHealth:()=>12});
    if(result.changed){r.resourceSeq3310++;if(result.exploration)r.exploreSeq3305++;env.g=clone(r.latestState.game);Object.assign(other,clone(r.latestState.game));if(result.exploration)env.mpHandleMessage({room:env.mpRoom,type:'EXPLORATION_STATE',data:{seq:r.exploreSeq3305,pendingByHero:clone(r.explorePending3305)}})}
    env.mpHandleMessage({room:env.mpRoom,type:result.error?'PARTY_LORE_REJECTED':'PARTY_LORE_ACK',data:result.error?{id:cmd.id,reason:result.error}:{id:cmd.id,...result}});
   }
  };
  env.window=env;env.globalThis=env;
  new Function('env','with(env){'+controls+'}')(env);
  if(remote&&pEnc)env.mpHandleMessage({room:env.mpRoom,type:'EXPLORATION_STATE',data:{seq:0,pendingByHero:clone(r.explorePending3305)}});
  function find(e,use){if(e.dataset.resourceUse1058===use)return e;return e.children.map(x=>find(x,use)).find(Boolean)}
  return {env,r,t,other,notices,prompts,sent,button:use=>find(root,use),use:use=>env.ascPartyResourceCommand1058(use),board:()=>env.g};
 }
 test('fresh solo session with remote preference enables all ordinary Lore buttons and does not use network',async()=>{
  const b=boot({answers:['1','3,1,2']});assert.equal(b.button('DECIPHER').disabled,false);assert.equal(b.button('ARCHIVE_RECALL').disabled,false);
  await b.use('DECIPHER');assert.equal(b.board().partyLore1058,10);assert.deepEqual(b.board().searchDeck.map(x=>x.id),['S3','S1','S2','S4']);assert.equal(b.board().heroRuntimeStates.Mordren.actions,3);assert.equal(b.sent.length,0);assert.equal(b.button('DECIPHER').disabled,true);
 });
 test('Decipher can reorder the Location stack; cancel and invalid order spend no Lore',async()=>{
  for(const remote of [false,true]){
   const b=boot({remote,answers:['2','2,3,1']});await b.use('DECIPHER');assert.equal(b.board().partyLore1058,10);assert.deepEqual(b.board().pool.map(x=>x.id),['L2','L3','L1','L4']);
   for(const choice of [null,'1,1,2']){const n=boot({remote,answers:['1',choice]});await n.use('DECIPHER');assert.equal(n.board().partyLore1058,12);assert.deepEqual(n.board().searchDeck.map(x=>x.id),['S1','S2','S3','S4'])}
  }
 });
 test('Archive Recall recognizes real Spell Traits and Ultimate metadata in both modes',async()=>{
  for(const remote of [false,true]){
   const b=boot({remote,answers:['1','1']});await b.use('ARCHIVE_RECALL');
   const z=R.zones(b.board(),'Mordren');assert.equal(b.board().partyLore1058,9);assert.deepEqual(z.hand.map(x=>x.id),['hand','ordinary']);assert.deepEqual(z.discard.map(x=>x.id),['spell','ult','spellUpper']);assert.equal(z.actions,3);assert.ok(!b.prompts.at(-1).includes('spell'));assert.ok(!b.prompts.at(-1).includes('ult'));
  }
  const g=game(),cmd={id:'forged',use:'ARCHIVE_RECALL',target:'Mordren',index:1};const peek=R.preview(g,cmd);assert.deepEqual(peek.cards.map(c=>c.id),['ordinary']);assert.ok(R.execute(g,cmd,{actor:'Mordren',peek}).error);assert.equal(g.partyLore1058,12);
 });
 test('Forewarned reduces ordinary rolled Severity and changes the printed band, never the die',async()=>{
  for(const remote of [false,true]){
   const b=boot({remote,pEnc:pendingEncounter()});assert.equal(b.button('FOREWARNED').disabled,false);await b.use('FOREWARNED');
   const p=remote?b.r.explorePending3305.Mordren:b.env.pEnc;
   assert.equal(p.severity,4);assert.equal(p.baseRoll,5);assert.equal(p.text,'medium');assert.equal(b.board().partyLore1058,9);assert.equal(b.button('FOREWARNED').disabled,true);
   const low=boot({remote,pEnc:pendingEncounter(1)});await low.use('FOREWARNED');assert.equal((remote?low.r.explorePending3305.Mordren:low.env.pEnc).severity,1);
   const fixed=boot({remote,pEnc:pendingEncounter(3,'fixed')});assert.equal(fixed.button('FOREWARNED').disabled,true);await fixed.use('FOREWARNED');assert.equal(fixed.board().partyLore1058,12);
  }
 });
 test('Second Interpretation rerolls a real queued hazard before damage and keeps the new result',async()=>{
  for(const remote of [false,true]){
   const g=game();C.enqueue(g,'Mordren','L025_TRAP','0,0','test',()=>2);const b=boot({g,remote,roll:6});
   assert.equal(b.button('SECOND_INTERPRETATION').disabled,false);await b.use('SECOND_INTERPRETATION');
   assert.equal(b.board().partyLore1058,10);assert.equal(b.board().heroRuntimeStates.Mordren.hp,8);assert.equal(C.pending(b.board()),null);
   const roll=b.board().partyResourceSources1058.extra1058.rolls[0];assert.equal(roll.result,6);assert.equal(roll.resolved,true);assert.equal(roll.rerolled1058,true);assert.equal(b.board().heroRuntimeStates.Mordren.actions,3);
  }
 });
 test('Second Interpretation rerolls Q015 Witness Hunters and resolves only the replacement result',async()=>{
  for(const remote of [false,true]){
   const g=game('Q015');S.store(g).witness={kind:'quest-roll',source:'Q015_HUNTERS',actor:'Mordren',tileKey:'0,0',round:1,scope:R.scope(g),sides:6,result:2,resolved:false};const b=boot({g,remote,roll:6});
   await b.use('SECOND_INTERPRETATION');assert.equal(b.board().partyLore1058,10);assert.equal(b.board().partyEvidence1058,1);assert.equal(b.board().partyResourceSources1058.witness.result,6);assert.equal(b.board().partyResourceSources1058.witness.resolved,true);
  }
 });
 test('Read Ahead remains available and reorders only two cards',async()=>{
  for(const remote of [false,true]){const b=boot({remote,answers:['2,1']});await b.use('READ_AHEAD');assert.equal(b.board().partyLore1058,11);assert.deepEqual(b.board().encDeck.map(x=>x.id),['E2','E1','E3'])}
 });
 test('remote actions update both clients, reject foreign Hero and stale scope, and replay cannot spend twice',async()=>{
  const b=boot({remote:true,answers:['1','3,1,2']});await b.use('DECIPHER');assert.equal(b.sent.length,2);assert.equal(b.other.partyLore1058,10);assert.deepEqual(b.other.searchDeck,b.board().searchDeck);
  const cmd=b.sent.at(-1).cmd,env={actor:'Mordren',turn:b.t,downed:()=>false,shuffle:x=>x,roll:()=>6};
  assert.equal(Room.handle(b.r,cmd,env).duplicate,true);
  assert.ok(Room.handle(b.r,{...cmd,id:'wrong',hero:'Aldric'},env).error);
  assert.ok(Room.handle(b.r,{...cmd,id:'stale',scope:'old'},env).error);
  assert.equal(b.r.latestState.game.partyLore1058,10);
 });
 test('off-turn, passed and dropped remote sessions never fall back to local spending',async()=>{
  const d=boot({remote:true,disconnected:true,answers:['1','1,2,3']});assert.equal(d.button('DECIPHER').disabled,true);await d.use('DECIPHER');assert.equal(d.board().partyLore1058,12);assert.equal(d.sent.length,0);
  const b=boot({remote:true,answers:['1','1,2,3']});b.t.turnHero='Aldric';b.env.render();assert.equal(b.button('DECIPHER').disabled,true);await b.use('DECIPHER');assert.equal(b.sent.length,0);
  const g=game();g.passedHeroes32521={Mordren:true};const solo=boot({g,answers:['1','1,2,3']});assert.equal(solo.button('DECIPHER').disabled,true);await solo.use('DECIPHER');assert.equal(solo.board().partyLore1058,12);
 });
 test('new Quest resets once-per-party use; balance persists and same-attempt reload cannot reset',()=>{
  const g=game();R.beginQuest(g,1);const cmd={id:'read1',use:'READ_AHEAD',order:[1,0]};assert.equal(R.execute(g,cmd,{actor:'Mordren',peek:R.preview(g,cmd)}).spent,1);assert.ok(R.checkLore(clone(g),'READ_AHEAD').error);assert.equal(R.beginQuest(g,1),false);R.beginQuest(g,2);assert.equal(g.partyLore1058,11);assert.equal(R.checkLore(g,'READ_AHEAD').cost,1);
 });
 test('combat rolls and resolved rolls cannot be modified',()=>{
  const g=game();for(const p of [{kind:'hazard',combat:true,sides:6,result:2},{kind:'quest-roll',resolved:true,sides:6,result:2}])assert.ok(R.execute(g,{id:'bad',use:'SECOND_INTERPRETATION'},{actor:'Mordren',pending:p,roll:()=>6}).error);
  assert.ok(R.execute(g,{id:'bad2',use:'FOREWARNED'},{actor:'Mordren',pending:{...pendingEncounter(),resolved:true}}).error);assert.equal(g.partyLore1058,12);
 });
 test('legacy HUD is a compatibility loader and updated service worker caches canonical controls',()=>{
  assert.ok(!legacy.includes('online actions are not enabled'));assert.ok(legacy.includes('party-resource-controls-v1058.js'));assert.ok(sw.includes('v1058-lore-live-1'));assert.ok(sw.includes('./party-resources-runtime-v1058.js'));assert.ok(controls.includes('1058-lore-live-1'));
 });
}
registerTests(test,assert,{R:require('../public/party-resources-v1058.js'),S:require('../public/party-resource-sources-v1058.js'),C:require('../public/party-resource-extras-v1058.js'),Room:require('../server/party-resource-room-v1058.js'),controls:read('public/party-resource-controls-v1058.js'),legacy:read('public/party-resources-runtime-v1058.js'),sw:read('public/sw-3365.js')});
