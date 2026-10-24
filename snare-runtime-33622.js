// One entry hook for spawned, moved and forcibly moved Enemies, with live map markers.
(()=>{
'use strict';
const S=window.ascSnareRules33622,R=window.ascMechanicsRules33621,wired=new WeakSet();
let current=null,positions=new Map(),pending=false;
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&mpConnected();
const resolver=()=>{try{return document.body.classList.contains('roomResolving3300')&&ascRoomTurn33618.state()?.resolverRole===mpRole}catch(_){return false}};
function locate(t){return Object.entries(g?.tiles||{}).find(([,value])=>value===t)?.[0]}
function entry(en,t,label='Enemy entry'){
 if(!g||!t||!en)return {triggered:false};
 const key=locate(t);if(!key)return {triggered:false};
 const id=S.identity(g,en),from=positions.get(id);
 // The room resolves ordinary remote spawn/movement transactions. Its designated
 // phase worker executes the same hook inside the server-owned phase transaction.
 if(remote()&&!resolver()){positions.set(id,key);return {triggered:false,awaitingRoom:true}}
 const result=S.enter(g,key,en,{fromKey:from,log:message=>log(message),onKilled:()=>{if(typeof q001AfterEnemyDefeat==='function')q001AfterEnemyDefeat()}});
 positions.set(id,key);if(result.triggered)S.reconcilePieces(g);return result;
}
function instrument(){
 if(typeof g==='undefined'||!g)return;
 if(current!==g){current=g;positions=S.capture(g)}
 for(const [key,t]of Object.entries(g.tiles||{})){
  if(!t.snare32526||!Array.isArray(t.enemies)||wired.has(t.enemies))continue;
  const array=t.enemies;wired.add(array);
  for(const method of ['push','unshift','splice']){
   const original=array[method];
   Object.defineProperty(array,method,{configurable:true,writable:true,value:function(...args){
    const inserted=method==='splice'?args.slice(2):args,result=original.apply(this,args);
    for(const en of inserted)entry(en,t,'Enemy enters');return result;
   }});
  }
 }
 S.reconcilePieces(g);
}
const icon='<svg viewBox="0 0 32 24" width="28" height="22" aria-hidden="true"><path d="M2 18 8 5l8 13L24 5l6 13M2 18h28M8 5v13M24 5v13" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="16" cy="19" rx="7" ry="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
function markers(){
 if(!g)return;
 for(const el of document.querySelectorAll('.ascHeroPiece3294.piece-snare')){
  el.classList.add('ascSnareMarker33622');el.style.color='#bdf7b4';el.style.borderColor='#67b45b';
  el.innerHTML=icon;const label=document.createElement('span');label.textContent=' Snare';el.appendChild(label);
  el.setAttribute('role','img');el.setAttribute('aria-label','Snare: the first Enemy entering suffers 2 damage and gains Rooted');el.title=el.getAttribute('aria-label');
 }
}
function install(){
 if(window.ascSnare33622)return;
 if(!window.ascMechanics33621){setTimeout(install,25);return}
 const renderBefore=window.render;
 window.render=function(){instrument();const result=renderBefore.apply(this,arguments);markers();if(g)positions=S.capture(g);return result};
 const playBefore=window.playExtraCard;
 window.playExtraCard=function(card){
  if(card?.id!==S.cardId)return playBefore.apply(this,arguments);
  if(pending)return Promise.resolve({error:'Set Snare is awaiting the room.'});
  const h=controlledHero(),pos=R.pos(g,h),options=pos?R.neighbors(g,pos).filter(q=>q.t?.revealed!==false&&!q.t.snare32526):[];
  if(!options.length){log('Set Snare: choose a different connected revealed Location without a Snare.');return Promise.resolve({error:'No legal Snare target.'})}
  let target=options[0];
  if(options.length>1){const answer=prompt('Set Snare: choose a connected revealed Location\n'+options.map((q,i)=>`${i+1}. ${q.t.name}`).join('\n'));target=options[Number(answer)-1];if(!target)return Promise.resolve({cancelled:true})}
  pending=true;
  return Promise.resolve(window.ascMechanics33621.command('PLACE_SNARE',{tileKey:target.key,cardUid:card.uid||null},h)).then(result=>{
   if(!result?.error){log(`Set Snare placed at ${target.t.name}. The first Enemy entering suffers 2 damage and gains Rooted.`);instrument();render()}
   return result;
  }).finally(()=>{pending=false});
 };
 // These functions can batch several inserted Enemies before their caller renders.
 for(const name of ['encSpawn320','spawnQuestEnemies','spawn']){
  const before=window[name];if(typeof before!=='function')continue;
  window[name]=function(){instrument();const result=before.apply(this,arguments);instrument();return result};
 }
 // Room entry effects commit before the active client evaluates authored objectives.
 // Peers only render the result; the designated phase worker already runs these hooks.
 const receiveBefore=window.mpHandleMessage;let objectiveQueued=false,objectivePending=null;
 window.mpHandleMessage=function(message){
  const out=receiveBefore.apply(this,arguments);
  if(message?.room===mpRoom&&message.type==='COMBAT_STATE'&&message.data?.reason==='snare-entry')objectivePending={quest:g?.campaign?.currentQuest,room:mpRoom};
  if(objectivePending&&message?.room===mpRoom&&['STATE','ROOM_STATE','STATE_REJECTED'].includes(message.type)){
   const quest=g?.campaign?.currentQuest;
   if(objectivePending.room!==mpRoom||quest!==objectivePending.quest||g?.campaign?.questStatus?.[quest]==='Completed')objectivePending=null;
  }
  if(objectivePending&&message?.room===mpRoom&&['STATE','ROOM_STATE','STATE_REJECTED','COMBAT_STATE'].includes(message.type)&&!objectiveQueued){
   objectiveQueued=true;setTimeout(()=>{
    objectiveQueued=false;
    const turn=window.ascRoomTurn33618?.state?.();
    if(!objectivePending||!remote()||turn?.resolving||turn?.turnHero!==mpRole||g?.campaign?.downtime===true)return;
    if(g?.campaign?.currentQuest==='Q001'){const q=g.campaign.q001;if(!q?.captainSpawned||Number(q.rescued)<2||Number(q.fires)>=5||Object.values(g.tiles||{}).some(t=>(t.enemies||[]).some(e=>e.hp>0&&(/captain/i.test(String(e.name||e.type||''))))))return}
    window.q001AfterEnemyDefeat?.();
    const quest=g?.campaign?.currentQuest;
    if(quest==='Q002')window.checkQ002Objective?.();
    else if(quest==='Q003')window.checkQ003Objective?.();
    else if(quest!=='Q001')window.checkGenericQuestObjective?.();
   },0);
  }
  return out;
 };
 window.ascSnare33622={entry,instrument,render:markers,pending:()=>pending};
 instrument();if(g)render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,110));else setTimeout(install,110);
})();
