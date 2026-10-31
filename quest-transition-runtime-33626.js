// A Quest setup is one room transaction, never a collection of Hero Actions.
(()=>{
 'use strict';
 const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
 const mutating=new Set(['STATE','GAME_PATCH_3322','TURN_COMMAND','HERO_COMMAND','COMBAT_COMMAND','RESOURCE_COMMAND','EXPLORATION_COMMAND','MECHANICS_COMMAND','MECHANICS_COMMAND_33621','DOWNTIME_COMMAND','DOWNTIME_COMMAND_33622','ROUND_RESOLVE_RESULT','ROUND_RESOLVE_ERROR','LEAVE_PARTY','SET_AWAY']);
 const snapshots=new Set(['STATE','ROOM_STATE','STATE_REJECTED','ADVENTURE_START','ADVENTURE_RESUME','HERO_STATE','COMBAT_STATE','RESOURCE_STATE','EXPLORATION_STATE','PHASE_STATE','TURN_STATE','DOWNTIME_STATE','TURN_COMMAND_ACK','TURN_COMMAND_REJECTED','HERO_COMMAND_ACK','HERO_COMMAND_REJECTED','COMBAT_COMMAND_ACK','COMBAT_COMMAND_REJECTED','RESOURCE_COMMAND_ACK','RESOURCE_COMMAND_REJECTED','EXPLORATION_COMMAND_ACK','EXPLORATION_COMMAND_REJECTED','MECHANICS_COMMAND_ACK','MECHANICS_COMMAND_REJECTED','DOWNTIME_COMMAND_ACK','DOWNTIME_COMMAND_REJECTED']);
 let installed=false,preparing=false,applying=false,pending=null,recoveryError=null,retryTimer=null,lastResult=null,lastTransitionEpoch=0;
 const retryLimit=4,retryDelay=2500,retryTimeout=45000;
 const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof mpConnected==='function'&&mpConnected();
 const epoch=()=>Number(g?.questTransitionAuthority33626?.epoch||0);
 function diag(type,detail){try{window.ascDebug3271?.events?.push({t:new Date().toISOString().slice(11,23),dir:'QUEST',type,detail,s:window.ascDebug3271.snap()})}catch(_){}}
 function settleResources(){const id=window.ascendance3312?.().inFlight;if(id)window.ascResourceLedger33621?.settlePhaseReply?.(id)}
 function rebase(){window.ascHeroLedger33621?.rebase?.();window.ascCombat33621?.rebase?.();window.ascResourceLedger33621?.rebase?.();window.ascActionGuard33621?.reset?.()}
 function stopRetry(){clearTimeout(retryTimer);retryTimer=null}
 function sendPending(){
  if(!pending)return;
  pending.attempts++;pending.lastSent=Date.now();
  diag('QUEST_TRANSITION_ATTEMPT_33626',{id:pending.id,attempt:pending.attempts});
  // Keep the same random setup, request ID and revision after reconnect. The
  // persisted server receipt returns the first commit instead of starting twice.
  window.mpSend('QUEST_TRANSITION_33626',clone(pending.command));
 }
 function retryPending(){
  stopRetry();if(!pending)return;
  if(pending.room!==mpRoom){pending=null;return}
  const now=Date.now();
  if(now-pending.started>=retryTimeout||pending.attempts>=retryLimit&&now-pending.lastSent>=5000){
   recoveryError={id:pending.id,room:pending.room,quest:pending.quest};pending=null;
   lastResult={accepted:false,uncertain:true,id:recoveryError.id,reason:'The connection did not confirm the new Quest. Refresh the room to load its saved state.'};
   diag('QUEST_TRANSITION_CONFIRMATION_TIMEOUT_33626',lastResult);log(lastResult.reason);window.render?.();return;
  }
  if(mpMode==='remote'&&mpSocket?.readyState===WebSocket.OPEN&&mpJoinReady&&pending.attempts<retryLimit&&now-pending.lastSent>=retryDelay)sendPending();
  retryTimer=setTimeout(retryPending,250);
 }
 function normalizeSetup(before,quest,choices={}){
  const rules=window.ascQuestTransitionRules33626,carry=rules.canonicalResources(before,quest);
  if(carry.error)throw new Error(carry.error);
  for(const name of rules.persistent){if(Object.prototype.hasOwnProperty.call(carry.values,name))g[name]=clone(carry.values[name]);else delete g[name]}
  g.campaign.heroFates=clone(before.campaign?.heroFates||{});
  for(const hero of partyHeroes()){
   const state=searchHeroState(hero);state.hp=rules.maxHealth(g,hero);if(hero==='Aldric')g.conditions=[];else state.conditions=[];
   if(carry.replacements.includes(hero)){g.campaign.heroFates[hero]={status:'Replacement',quest,day:g.campaign.day};log(`HERO REPLACEMENT: ${heroDisplayName(hero)} begins ${quest} at Level 1 with starting Equipment and 1 Common Healing Potion.`)}
   else if(g.campaign.heroFates[hero]?.status==='Downed')g.campaign.heroFates[hero]={...g.campaign.heroFates[hero],status:'Survived',quest,day:g.campaign.day};
  }
  // Per-Quest cooldowns and temporary progression buffs belong to the new setup.
  g.campaign.levelRuntime3360={quest,hero:{},groupDamage:{},round:0,roundStart:{}};
  // init ran before persistent XP was restored. Apply the central Quest-start
  // hooks at the correct Level, retaining choices already made in this setup.
  const addBefore=window.addHeroCondition;let seraphineTrigger=0;
  window.addHeroCondition=function(hero,condition){
   const source=hero==='Seraphine'&&condition==='Guarded';if(source)seraphineTrigger++;
   try{
    if(seraphineTrigger&&hero!=='Seraphine'&&condition==='Guarded'&&g.heroAbilityRuntime3362?.round?.['Seraphine::Sanctified Vanguard']===g.round)choices.sanctifiedVanguard=hero;
    return addBefore.apply(this,arguments);
   }finally{if(source)seraphineTrigger--}
  };
  try{
   window.ascHeroRuntime3362?.questStart?.({reuseChoices:true});
   const first=partyHeroes()[0],guardedBefore=first&&heroHasCondition(first,'Guarded');
   let benefits=rules.applySetupBenefits(before,g,quest,choices);
   if(benefits.error==='Choose the Spirit Court Exalted opening blessing.'){
    choices.spiritCourt=confirm('Spirit Court Exalted: OK = begin Guarded; Cancel = begin Inspired.')?'Guarded':'Inspired';
    benefits=rules.applySetupBenefits(before,g,quest,choices);
   }
   if(benefits.error)throw new Error(benefits.error);
   if(benefits.factionBlessing==='Guarded'&&first&&!guardedBefore){
    const body=searchHeroState(first);body.conditions=body.conditions.filter(n=>n!=='Guarded');
    addHeroCondition(first,'Guarded');
   }
  }finally{window.addHeroCondition=addBefore}
  const propagation=rules.applySetupPropagation(before,g,quest,choices);if(propagation.error)throw new Error(propagation.error);
  return carry;
 }
 function runSetup(delegate,receiver,args,choices){
  const previous=window.confirm,previousPrompt=window.prompt;
  // Older scenario wrappers render before persistent Levels/Health are restored.
  // Defer this trigger's choice until normalizeSetup applies the fresh setup.
  window.prompt=function(text){if(String(text).startsWith('Sanctified Vanguard:'))return null;return previousPrompt.apply(this,arguments)};
  window.confirm=function(text){
   if(String(text).startsWith('Spirit Court Exalted:')){
    if(!choices.spiritCourt)choices.spiritCourt=previous.apply(this,arguments)?'Guarded':'Inspired';
    return choices.spiritCourt==='Guarded';
   }
   return previous.apply(this,arguments);
  };
  try{return delegate.apply(receiver,args)}finally{window.confirm=previous;window.prompt=previousPrompt}
 }
 function localPointers(){return {pLoc,skipLoc,pEnc,pSearch,skipSearch,selected}}
 function restorePointers(saved){pLoc=saved.pLoc;skipLoc=saved.skipLoc;pEnc=saved.pEnc;pSearch=saved.pSearch;skipSearch=saved.skipSearch;selected=saved.selected}
 function prepare(delegate,quest,args){
  const original=g,pointers=localPointers(),oldRender=window.render,oldSchedule=window.mpScheduleState,oldSend=window.mpSend,oldApplying=window.ascApplyingRoom33621,oldMpApplying=mpApplying;
  preparing=true;window.ascApplyingRoom33621=true;mpApplying=true;g=clone(original);
  window.render=()=>{};window.mpScheduleState=()=>{};window.mpSend=()=>false;
  try{
   const choices={},out=runSetup(delegate,window,args,choices);
   if(out&&typeof out.then==='function')throw new Error('Quest setup did not finish before its transaction was prepared.');
   if(g?.campaign?.currentQuest!==quest||g.campaign.downtime)throw new Error('That Quest could not be started.');
   normalizeSetup(original,quest,choices);
   return serializableGameState();
  }finally{
   g=original;restorePointers(pointers);window.render=oldRender;window.mpScheduleState=oldSchedule;window.mpSend=oldSend;window.ascApplyingRoom33621=oldApplying;mpApplying=oldMpApplying;preparing=false;
  }
 }
 function pendingUi(){
  const box=document.getElementById('questTransition');if(!box)return;
  const notice=box.querySelector('[data-quest-transition-33626]');if(notice)notice.remove();
  const current=pending||recoveryError;if(!current)return;
  const text=document.createElement('div');text.dataset.questTransition33626='1';text.className='muted';text.textContent=recoveryError?'The connection did not confirm the new Quest. Refresh the room to load its saved state.':`Starting ${pending.quest}… waiting for the room to confirm the new board.`;
  if(recoveryError){const refresh=document.createElement('button');refresh.textContent='Refresh room';refresh.onclick=()=>location.reload();text.append(' ',refresh)}
  box.prepend(text);
  for(const button of box.querySelectorAll('button'))if(/^Begin Q\d{3}/.test(button.textContent||''))button.disabled=true;
 }
 function startWrapper(delegate){
  const wrapper=function(qid){/* QUEST_TRANSITION_33626 */
   if(preparing)return delegate.apply(this,arguments);
   // Failed-Quest cleanup already belongs to the authenticated round worker's
   // atomic result. Keep that established path, including its room epoch.
   if(remote()&&window.ascRoomPhaseWorker33625?.executing?.()&&g?.campaign?.downtime&&g.campaign.lastQuestOutcome?.outcome==='Failed'&&g.campaign.lastQuestOutcome.quest===qid){
    const authority=clone(g.questTransitionAuthority33626),out=delegate.apply(this,arguments);
    if(authority)g.questTransitionAuthority33626=authority;
    return out;
   }
   if(pending||recoveryError){pendingUi();return false}
   if(!remote()){
    const before=clone(g),choices={},out=runSetup(delegate,this,arguments,choices);
    if(g?.campaign?.currentQuest===qid&&!g.campaign.downtime&&window.ascQuestTransitionRules33626?.available(before,qid)){normalizeSetup(before,qid,choices);window.render?.()}
    return out;
   }
   const host=window.ascendancePartyLobby32759?.().players?.find(player=>player.hero===mpRole);
   if(host&&host.isHost===false){log('Only the party host may begin the next Quest.');window.render?.();return false}
   const turn=window.ascRoomTurn33618?.state?.();
   if(!g?.campaign?.downtime||turn?.resolving||window.ascRoomPhaseWorker33625?.pending?.()){
    log('Finish the current Quest and proceed to Downtime before starting another Quest.');window.render?.();return false;
   }
   if(!window.ascQuestTransitionRules33626.available(g,qid)){log('That Quest is not available in the current World Event.');window.render?.();return false}
   const command={id:`${mpRoom}-${mpRole}-QUEST-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,baseRevision:Number(mpRoomRevision||0),fromQuest:g.campaign.currentQuest,quest:qid};
   try{command.state=prepare(delegate,qid,arguments)}catch(error){log(`Quest not started: ${error.message}`);window.render?.();return false}
   const checked=window.ascQuestTransitionRules33626.validate(g,command.state,command);
   if(checked.error){log(`Quest not started: ${checked.error}`);window.render?.();return false}
   command.state=checked.state;pending={id:command.id,quest:qid,fromQuest:command.fromQuest,command:clone(command),room:mpRoom,attempts:0,lastSent:0,started:Date.now()};lastResult=null;
   diag('QUEST_TRANSITION_SENT_33626',{id:command.id,quest:qid,fromQuest:command.fromQuest,baseRevision:command.baseRevision});
   sendPending();retryTimer=setTimeout(retryPending,250);pendingUi();return true;
  };
  return wrapper;
 }
 let wrappedStart=null;
 function installStart(){if(window.startCampaignQuest!==wrappedStart){wrappedStart=startWrapper(window.startCampaignQuest);window.startCampaignQuest=wrappedStart}}
 function install(){
  if(installed)return;
  if(!window.ascQuestTransitionRules33626||!window.ascMechanics33621||!window.ascPhaseSync33625?.ready?.()){setTimeout(install,25);return}
  installed=true;installStart();
  const renderBefore=window.render,scheduleBefore=window.mpScheduleState,sendBefore=window.mpSend,receiveBefore=window.mpHandleMessage;
  window.render=function(){installStart();const out=renderBefore.apply(this,arguments);pendingUi();return out};
  window.mpScheduleState=function(){if(preparing||applying||pending||recoveryError)return false;return scheduleBefore.apply(this,arguments)};
  window.mpSend=function(type,data={}){
   if(window.ascQuestTransition33626.suppressesWire(type))return false;
   if(mutating.has(type)&&data&&typeof data==='object')data={...data,questEpoch33626:epoch()};
   return sendBefore.call(this,type,data);
  };
  function applyCanonical(message){
   const packet=message.data||{},state=packet.state;if(!state?.game)return false;
   recoveryError=null;
   const oldApplying=window.ascApplyingRoom33621;applying=true;window.ascApplyingRoom33621=true;
   try{
    settleResources();pLoc=null;pSearch=null;pEnc=null;skipLoc=[];skipSearch=[];selected=null;
    const feed=(type,data)=>{if(data)receiveBefore.call(window,{type,room:mpRoom,from:'SERVER',revision:message.revision,data})};
    feed('TURN_STATE',packet.turn);feed('STATE',state);
    feed('COMBAT_STATE',packet.combat);feed('HERO_STATE',packet.heroState);feed('EXPLORATION_STATE',packet.exploration);
    feed('RESOURCE_STATE',packet.resource);feed('PHASE_STATE',packet.phase);feed('TURN_STATE',packet.turn);
    lastTransitionEpoch=Math.max(lastTransitionEpoch,epoch());rebase();
    mpLastSent='';
   }finally{window.ascApplyingRoom33621=oldApplying;applying=false}
   window.render?.();return true;
  }
  window.mpHandleMessage=function(message){
   if(message?.room!==mpRoom)return receiveBefore.apply(this,arguments);
   if(pending&&pending.room!==mpRoom){pending=null;stopRetry()}
   if(recoveryError&&recoveryError.room!==mpRoom)recoveryError=null;
   if(['QUEST_TRANSITION_ACK_33626','QUEST_TRANSITION_REJECTED_33626','QUEST_TRANSITION_STATE_33626'].includes(message.type)){
    const packet=message.data||{},mine=packet.id===(pending||recoveryError)?.id,rejected=message.type==='QUEST_TRANSITION_REJECTED_33626';
    if(message.type!=='QUEST_TRANSITION_STATE_33626'&&!mine)return;
    if(mine){pending=null;recoveryError=null;stopRetry()}
    if(rejected&&window.ascRoomPhaseWorker33625?.pending?.()){
     lastResult={accepted:false,id:packet.id,reason:packet.reason};log(`Quest not started: ${packet.reason||'The room changed. Please try again.'}`);setTimeout(()=>window.mpSend('REQUEST_STATE',{}),0);return;
    }
    const incomingEpoch=Number(packet.state?.game?.questTransitionAuthority33626?.epoch||0);
    if(!rejected&&incomingEpoch<Math.max(lastTransitionEpoch,epoch()))return;
    applyCanonical(message);lastResult={accepted:!rejected,id:packet.id,reason:packet.reason||null,quest:packet.state?.game?.campaign?.currentQuest};
    diag(rejected?'QUEST_TRANSITION_REJECTED_33626':'QUEST_TRANSITION_APPLIED_33626',{...lastResult,epoch:epoch()});
    if(rejected){log(`Quest not started: ${packet.reason||'The room changed. Please try again.'}`);window.render?.()}
    return;
   }
   if((pending||preparing)&&snapshots.has(message.type)){
    if(pending&&message.type==='ROOM_STATE'&&mpSocket?.readyState===WebSocket.OPEN){
     // JOIN succeeded. Its ordinary snapshot remains suppressed until the
     // receipt replay atomically rebases every domain of the pending Quest.
     mpJoinReady=true;mpStopRestoreRetry();
    }
    if(/^RESOURCE_COMMAND_(ACK|REJECTED)$/.test(message.type))window.ascResourceLedger33621?.settlePhaseReply?.(message.data?.id);
    diag('QUEST_TRANSITION_STALE_REPLY_SUPPRESSED_33626',{type:message.type,id:pending?.id||null});return;
   }
   if(recoveryError&&message.type==='ROOM_STATE'){
    const out=receiveBefore.apply(this,arguments);recoveryError=null;rebase();window.render?.();return out;
   }
   const snapshotGame=message.data?.game?.game||message.data?.game;
   if(snapshots.has(message.type)&&snapshotGame?.campaign&&Number(snapshotGame.questTransitionAuthority33626?.epoch||0)<epoch()){
    diag('QUEST_TRANSITION_OLD_EPOCH_SUPPRESSED_33626',{type:message.type,incoming:Number(snapshotGame.questTransitionAuthority33626?.epoch||0),current:epoch()});return;
   }
   return receiveBefore.apply(this,arguments);
  };
 }
 window.ascQuestTransition33626={build:'atomic-next-quest-33626',ready:()=>installed,pending:()=>pending?{id:pending.id,quest:pending.quest,fromQuest:pending.fromQuest,attempts:pending.attempts}:null,result:()=>clone(lastResult),suppressesWire:type=>preparing||applying||!!(pending||recoveryError)&&mutating.has(type)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else install();
})();
