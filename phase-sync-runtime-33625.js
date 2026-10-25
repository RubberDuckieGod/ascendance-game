// Keep an active room's seeded Enemy/World/End worker isolated from read replies.
// The committed phase STATE (identified by its revision and phase receipt) is the
// only snapshot allowed to replace the worker's in-progress game.
(()=>{
 'use strict';
 let active=null,installed=false,suppressed=0;
 const snapshots=new Set(['ROOM_STATE','STATE','STATE_REJECTED','ADVENTURE_START','ADVENTURE_RESUME']);
 const ledgers=new Set(['HERO_STATE','COMBAT_STATE','EXPLORATION_STATE','RESOURCE_STATE','PHASE_STATE','TURN_STATE','TURN_COMMAND_ACK','TURN_COMMAND_REJECTED','STATE_IGNORED_RESOLVING','HERO_COMMAND_ACK','HERO_COMMAND_REJECTED','COMBAT_COMMAND_ACK','COMBAT_COMMAND_REJECTED','EXPLORATION_COMMAND_ACK','EXPLORATION_COMMAND_REJECTED','RESOURCE_COMMAND_ACK','RESOURCE_COMMAND_REJECTED']);
 function diag(type,detail){try{window.ascDebug3271?.events?.push({t:new Date().toISOString().slice(11,23),dir:'ROOM',type,detail,s:window.ascDebug3271.snap()})}catch(_){}}
 function suppress(message){
  if(!active||message?.room!==active.room||message.room!==mpRoom)return false;
  if(!window.ascRoomPhaseWorker33625.pending()&&message.type!=='ROUND_RESOLVE'){active=null;return false}
  if(active.commitSeen||!snapshots.has(message.type)&&!ledgers.has(message.type))return false;
  const receipt=message.data?.phaseAuthority3311||message.data?.game?.phaseAuthority3311;
  const committed=message.type==='STATE'&&message.from==='SERVER'&&!window.ascRoomPhaseWorker33625.executing()&&Number(message.revision||0)>active.revision&&Number(receipt?.seq||0)>active.phaseSeq&&Number(receipt?.fromRound)===active.round;
  if(committed){active.commitSeen=true;diag('PHASE_COMMIT_ACCEPTED_33625',{round:active.round,revision:message.revision,phaseSeq:receipt.seq});return false}
  if(/^RESOURCE_COMMAND_(ACK|REJECTED)$/.test(message.type))window.ascResourceLedger33621?.settlePhaseReply?.(message.data?.id);
  suppressed++;diag('PHASE_STALE_REPLY_SUPPRESSED_33625',{type:message.type,round:active.round,revision:message.revision??null,executing:window.ascRoomPhaseWorker33625.executing()});return true;
 }
 function install(){
  if(installed)return;
  if(!window.ascRoomPhaseWorker33625){setTimeout(install,25);return}
  installed=true;
  const before=window.mpHandleMessage;
  window.mpHandleMessage=function(message){
   if(message?.room!==mpRoom)return before.apply(this,arguments);
   if(active&&active.room!==mpRoom)active=null;
   if(message.type==='ROUND_RESOLVE'&&message.data?.token&&!active){
    active={room:mpRoom,round:Number(message.data.round||g?.round||0),revision:Number(mpRoomRevision||0),phaseSeq:Number(window.ascendance3312?.().phase?.seq||0),commitSeen:false};
   }
   if(active&&['ROUND_RESOLVE_ACK','ROUND_RESOLVE_REJECTED'].includes(message.type)){
    const rejected=message.type==='ROUND_RESOLVE_REJECTED';active=null;
    const out=before.apply(this,arguments);
    if(rejected)setTimeout(()=>{if(mpConnected())mpSend('REQUEST_STATE',{})},0);
    return out;
   }
   if(suppress(message))return;
   return before.apply(this,arguments);
  };
 }
 window.ascPhaseSync33625={build:'phase-and-exploration-33625',ready:()=>installed,state:()=>active?{round:active.round,revision:active.revision,phaseSeq:active.phaseSeq,commitSeen:active.commitSeen}:null,suppressed:()=>suppressed,suppress};
 if(window.ascDebug3271?.report){const report=window.ascDebug3271.report;window.ascDebug3271.report=function(){return {...report.apply(this,arguments),synchronizationBuild:'phase-and-exploration-33625',phaseSynchronization:{pending:window.ascPhaseSync33625.state(),suppressed}}}}
 install();
})();
