// A quest completion snapshot commits its authored rewards through the room hook.
// Keep card/consumable costs in the normal ledger, without sending those rewards twice.
(()=>{
'use strict';
const fields=['gold','xp','levels','reputation','inventory','equipmentDecks','partyQuestItems','factionReputation'];
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
let resolving=false,pending=null;
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&mpConnected();
function resources(game){return {gold:Number(game.gold||0),xp:clone(game.xp||{}),levels:clone(game.levels||{}),reputation:Number(game.reputation||0),inventory:clone(game.inventory||{}),equipmentDecks:clone(game.equipmentDecks||{}),partyQuestItems:clone(game.partyQuestItems||[]),factionReputation:clone(game.campaign?.factionReputation3342||{})}}
function install(){
 if(window.ascQuestRewards33622)return;
 if(!window.ascMechanics33621){setTimeout(install,25);return}
 const resolveBefore=window.resolveQuestAttempt,scheduleBefore=window.mpScheduleState,sendBefore=window.mpSend,receiveBefore=window.mpHandleMessage;
 window.resolveQuestAttempt=function(outcome){
  if(!remote()||outcome!=='Completed'||resolving||!g?.campaign||g.campaign.questStatus?.[g.campaign.currentQuest]==='Completed')return resolveBefore.apply(this,arguments);
  const before={room:mpRoom,quest:g.campaign.currentQuest,instance:String(g.campaign.instanceId32537||g.campaign.playerScaling32761?.current?.instance||'legacy'),history:g.campaign.history?.length||0,resources:resources(g)};
  resolving=true;let result;
  try{result=resolveBefore.apply(this,arguments)}finally{
   resolving=false;
   if(g?.campaign?.history?.length===before.history+1&&g.campaign.lastQuestOutcome?.quest===before.quest&&g.campaign.lastQuestOutcome?.outcome==='Completed')pending=before;
   scheduleBefore.call(window);
  }
  return result;
 };
 window.mpScheduleState=function(){if(resolving)return false;return scheduleBefore.apply(this,arguments)};
 window.mpSend=function(type){if(resolving&&['STATE','GAME_PATCH_3322'].includes(type))return false;return sendBefore.apply(this,arguments)};
 window.mpHandleMessage=function(m){
  if(pending&&pending.room!==mpRoom)pending=null;
  if(pending&&m?.room===mpRoom&&m.type==='STATE_REJECTED')pending=null;
  if(pending&&m?.room===mpRoom&&m.type==='GAME_PATCH_REJECTED_3322')pending.rejected=true;
  if(pending&&m?.room===mpRoom&&m?.data?.game){
   const game=m.data.game,c=game.campaign,receipts=Object.values(c?.questRewardReceipts33622||{});
   if((pending.rejected&&m.type==='ROOM_STATE')||receipts.some(r=>r.quest===pending.quest&&r.instance===pending.instance)||String(c?.instanceId32537||c?.playerScaling32761?.current?.instance||'legacy')!==pending.instance)pending=null;
  }
  return receiveBefore.apply(this,arguments);
 };
 window.ascQuestRewards33622={
  resolving:()=>resolving,
  pending:()=>pending?{quest:pending.quest,instance:pending.instance}:null,
  resources:now=>{if(pending?.room!==mpRoom)pending=null;if(!pending||!remote())return now;const result={...now};for(const field of fields)result[field]=clone(pending.resources[field]);return result}
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
