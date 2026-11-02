// Confirm a World Event before offering the next Quest's separate setup.
(()=>{
'use strict';
const copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
const mutations=new Set(['STATE','GAME_PATCH_3322','TURN_COMMAND','HERO_COMMAND','COMBAT_COMMAND','RESOURCE_COMMAND','EXPLORATION_COMMAND','MECHANICS_COMMAND','MECHANICS_COMMAND_33621','DOWNTIME_COMMAND','DOWNTIME_COMMAND_33622','ROUND_RESOLVE_RESULT','ROUND_RESOLVE_ERROR','LEAVE_PARTY','SET_AWAY','QUEST_TRANSITION_33626']);
const snapshots=new Set(['STATE','ROOM_STATE','STATE_REJECTED','ADVENTURE_START','ADVENTURE_RESUME','HERO_STATE','COMBAT_STATE','RESOURCE_STATE','EXPLORATION_STATE','PHASE_STATE','TURN_STATE','DOWNTIME_STATE','TURN_COMMAND_ACK','TURN_COMMAND_REJECTED','HERO_COMMAND_ACK','HERO_COMMAND_REJECTED','COMBAT_COMMAND_ACK','COMBAT_COMMAND_REJECTED','RESOURCE_COMMAND_ACK','RESOURCE_COMMAND_REJECTED','EXPLORATION_COMMAND_ACK','EXPLORATION_COMMAND_REJECTED','MECHANICS_COMMAND_ACK','MECHANICS_COMMAND_REJECTED','DOWNTIME_COMMAND_ACK','DOWNTIME_COMMAND_REJECTED']);
let installed=false,pending=null,uncertain=null,applying=false,retryTimer=null,queued=false,lastResult=null,wrappedAdvance=null,lastForced='';
// The lobby defaults to remote mode even for a never-connected solo game.
// Keep a disconnected room guarded: onclose retains mpRoom, while an explicit
// leave clears it and returns control to ordinary solo progression.
const online=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof mpRoom!=='undefined'&&!!mpRoom;
const connected=()=>online()&&mpConnected()&&mpJoinReady;
const host=()=>window.ascendancePartyLobby32759?.().players?.find(player=>player.hero===mpRole)?.isHost!==false;
const epoch=()=>Number(g?.questTransitionAuthority33626?.epoch||0);
function stopRetry(){clearTimeout(retryTimer);retryTimer=null}
function rebase(){window.ascHeroLedger33621?.rebase?.();window.ascCombat33621?.rebase?.();window.ascResourceLedger33621?.rebase?.();window.ascActionGuard33621?.reset?.()}
function pendingUI(){
 const box=document.getElementById('questTransition');if(!box)return;box.querySelector('[data-world-event-pending-33627]')?.remove();
 if(!pending&&!uncertain&&!queued)return;
 const line=document.createElement('div');line.dataset.worldEventPending33627='1';line.className='muted';line.textContent=uncertain?'The connection did not confirm the World Event. Refresh the room to load its saved campaign.':queued?'Saving the final Quest outcome before advancing the World Event…':'Advancing the World Event… waiting for the room to confirm the campaign.';
 if(uncertain){const button=document.createElement('button');button.textContent='Refresh room';button.onclick=()=>location.reload();line.append(' ',button)}
 box.prepend(line);for(const button of box.querySelectorAll('button'))if(/^(?:Begin Q\d{3}|Advance to WE\d{3})/.test(button.textContent||''))button.disabled=true;
}
function sendPending(){if(!pending)return;pending.attempts++;pending.lastSent=Date.now();window.mpSend('WORLD_EVENT_ADVANCE_33627',copy(pending.command))}
function retry(){
 stopRetry();if(!pending)return;if(pending.room!==mpRoom){pending=null;return}
 if(pending.attempts>=4&&Date.now()-pending.lastSent>=5000){uncertain={id:pending.id,room:pending.room};lastResult={accepted:false,uncertain:true,id:pending.id};pending=null;window.render?.();return}
 if(connected()&&mpSocket?.readyState===WebSocket.OPEN&&pending.attempts<4&&Date.now()-pending.lastSent>=2500)sendPending();
 retryTimer=setTimeout(retry,250);
}
function request(){
 if(pending||uncertain){pendingUI();return false}
 if(!connected()){log('Reconnect to the room before advancing the World Event.');return false}
 if(!host()){log('Only the party host may advance the World Event.');queued=false;window.render?.();return false}
 if(window.ascQuestTransition33626?.pending?.()||window.ascRoomPhaseWorker33625?.pending?.()){log('Wait for the current room transaction before advancing the World Event.');return false}
 const eligible=window.ascWorldEventRules33627.eligibility(g);if(eligible.error){log(eligible.error);queued=false;window.render?.();return false}
 const command={id:`${mpRoom}-${mpRole}-WORLD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`,baseRevision:Number(mpRoomRevision||0),fromEvent:g.campaign.activeEvent,fromQuest:g.campaign.currentQuest,questEpoch33626:epoch()};
 queued=false;lastResult=null;pending={id:command.id,room:mpRoom,command,attempts:0,lastSent:0};sendPending();retryTimer=setTimeout(retry,250);window.render?.();return true;
}
function maybeForced(){
 if(!connected()||!host()||pending||uncertain||window.ascQuestRewards33622?.pending?.()||window.ascQuestRewards33622?.resolving?.()||window.ascRoomPhaseWorker33625?.pending?.())return;
 const eligible=window.ascWorldEventRules33627.eligibility(g);if(eligible.error||!eligible.forced){if(queued&&eligible.error){queued=false;window.render?.()}return}
 const key=[g.campaign.activeEvent,g.campaign.currentQuest,g.campaign.lastQuestOutcome?.day,g.campaign.history?.length].join('|');if(key===lastForced)return;lastForced=key;request();
}
function installAdvance(){
 if(window.advanceWorldEvent===wrappedAdvance)return;const delegate=window.advanceWorldEvent;
 wrappedAdvance=function(){
  if(!online())return delegate.apply(this,arguments);
  // A phase resolver's existing atomic result owns its forced-advance outcome.
  // The ordinary Hero completion path saves its Quest first, then the host
  // issues the separate World Event transaction from that confirmed baseline.
  if(window.ascRoomPhaseWorker33625?.executing?.())return delegate.apply(this,arguments);
  if(window.ascQuestRewards33622?.resolving?.()){queued=true;setTimeout(maybeForced,0);return false}
  return request();
 };
 window.advanceWorldEvent=wrappedAdvance;
}
function install(){
 if(installed)return;if(!window.ascWorldEventRules33627||!window.ascQuestTransition33626?.ready?.()){setTimeout(install,25);return}
 installed=true;installAdvance();const renderBefore=window.render,sendBefore=window.mpSend,scheduleBefore=window.mpScheduleState,receiveBefore=window.mpHandleMessage,resolveBefore=window.resolveQuestAttempt;
 window.resolveQuestAttempt=function(){
  const result=resolveBefore.apply(this,arguments);
  // The older completion wrapper reopens free exploration if the Quest id did
  // not change. A queued final-day advance must instead save a finished Quest
  // in Downtime, so the host can settle its World Event after that save.
  if(queued&&online()&&g?.campaign){const c=g.campaign;c.downtime=true;if(c.afterQuestExplore32920)c.afterQuestExplore32920.active=false;c.afterQuestExploreDismissed32920??={};c.afterQuestExploreDismissed32920[c.currentQuest]=true;mpLastSent='';window.render?.();window.mpScheduleState?.()}
  return result;
 };
 window.render=function(){installAdvance();const result=renderBefore.apply(this,arguments);pendingUI();return result};
 window.mpScheduleState=function(){if(applying||pending||uncertain)return false;return scheduleBefore.apply(this,arguments)};
 window.mpSend=function(type,data={}){if((applying||pending||uncertain)&&mutations.has(type))return false;return sendBefore.apply(this,arguments)};
 function applyCanonical(message){
  const packet=message.data||{},state=packet.state;if(!state?.game)return false;if(Number(state.game.questTransitionAuthority33626?.epoch||0)<epoch())return false;
  const old=window.ascApplyingRoom33621;applying=true;window.ascApplyingRoom33621=true;
  try{
   const inFlight=window.ascendance3312?.().inFlight;if(inFlight)window.ascResourceLedger33621?.settlePhaseReply?.(inFlight);
   const feed=(type,data)=>{if(data)receiveBefore.call(window,{type,room:mpRoom,from:'SERVER',revision:message.revision,data})};
   feed('TURN_STATE',packet.turn);feed('STATE',state);feed('COMBAT_STATE',packet.combat);feed('HERO_STATE',packet.heroState);feed('EXPLORATION_STATE',packet.exploration);feed('RESOURCE_STATE',packet.resource);feed('PHASE_STATE',packet.phase);feed('TURN_STATE',packet.turn);rebase();mpLastSent='';
  }finally{window.ascApplyingRoom33621=old;applying=false}
  window.render?.();return true;
 }
 window.mpHandleMessage=function(message){
  if(message?.room!==mpRoom)return receiveBefore.apply(this,arguments);
  if(pending&&pending.room!==mpRoom){pending=null;stopRetry()}if(uncertain&&uncertain.room!==mpRoom)uncertain=null;
  if(['WORLD_EVENT_ADVANCE_ACK_33627','WORLD_EVENT_ADVANCE_REJECTED_33627','WORLD_EVENT_ADVANCE_STATE_33627'].includes(message.type)){
   const packet=message.data||{},mine=packet.id===(pending||uncertain)?.id,rejected=message.type==='WORLD_EVENT_ADVANCE_REJECTED_33627';
   if(message.type!=='WORLD_EVENT_ADVANCE_STATE_33627'&&!mine)return;
   if(mine||!rejected){pending=null;uncertain=null;queued=false;stopRetry()}
   applyCanonical(message);lastResult={accepted:!rejected,id:packet.id,reason:packet.reason||null,event:g.campaign?.activeEvent,quest:g.campaign?.currentQuest};
   if(rejected){log('World Event not advanced: '+(packet.reason||'The room changed. Review the saved campaign.'));window.render?.()}return;
  }
  if(pending&&snapshots.has(message.type)){
   if(message.type==='ROOM_STATE'&&mpSocket?.readyState===WebSocket.OPEN){mpJoinReady=true;mpStopRestoreRetry()}
   if(/^RESOURCE_COMMAND_(?:ACK|REJECTED)$/.test(message.type))window.ascResourceLedger33621?.settlePhaseReply?.(message.data?.id);return;
  }
  if(uncertain&&message.type==='ROOM_STATE'){uncertain=null;queued=false;const result=receiveBefore.apply(this,arguments);rebase();window.render?.();return result}
  const result=receiveBefore.apply(this,arguments);if(['STATE','ROOM_STATE','ADVENTURE_RESUME','ROUND_RESOLVE_ACK'].includes(message.type))setTimeout(maybeForced,0);return result;
 };
 window.ascWorldEventChain33627={ready:()=>installed,pending:()=>pending?{id:pending.id,attempts:pending.attempts}:queued?{queued:true}:uncertain?{uncertain:true}:null,result:()=>copy(lastResult),advance:request};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else install();
})();
