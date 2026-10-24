/* Keep Encounter draws in the authored region across setup, restore, and refills. */
(()=>{
'use strict';
const rules=globalThis.ascEncounterDeckRules33624;if(!rules)return;
let lastNotice='';
function notice(report){
 if(!report)return;const signature=JSON.stringify(report);if(signature===lastNotice)return;lastNotice=signature;
 const swaps=report.replaced||[];
 if(swaps.length)log(`ENCOUNTER DECK CORRECTED: Campaign ${report.campaign} uses its regional deck. Pending ${swaps.map(x=>x.previous+' → '+x.replacement).join(', ')}; the original Severity and First Visit remain unchanged. No extra Action was spent.`);
 else if(report.removed?.length)log(`ENCOUNTER DECK CORRECTED: removed ${report.removed.length} encounters from other Campaigns. Campaign ${report.campaign}'s remaining deck and discard order are preserved.`);
}
function repairLocal(){
 if(!g)return null;
 const result=rules.repair(g,{localPending:pEnc});
 if(result.replaced.length&&pEnc){
  document.getElementById('encName').textContent=pEnc.card.name;
  document.getElementById('encEffect').textContent=pEnc.text||'';
 }
 if(result.changed)notice(result.report);
 return result;
}
function install(){
 const beforeInit=window.init;window.init=function(){lastNotice='';const out=beforeInit.apply(this,arguments);if(repairLocal()?.changed)render();return out};
 const beforeApply=window.applySerializedGameState;window.applySerializedGameState=function(payload){
  // Repair a local save before the legacy restore renders its pending card.
  let report=null;if(payload?.game){const result=rules.repair(payload.game,{localPending:payload.pending?.pEnc,pendingByHero:payload.explorationAuthority3305?.pendingByHero});if(result.changed)report=result.report}
  const out=beforeApply.apply(this,arguments);repairLocal();if(report){lastNotice='';notice(report)}return out;
 };
 const beforeStart=window.startEncounter;window.startEncounter=function(){repairLocal();return beforeStart.apply(this,arguments)};
 const beforeSerialize=window.serializableGameState;window.serializableGameState=function(){repairLocal();return beforeSerialize.apply(this,arguments)};
 const beforeHandle=mpHandleMessage;mpHandleMessage=function(message){
  const data=message?.data,exploration=message.type==='EXPLORATION_STATE'?data:data?.exploration;
  if(message?.room===mpRoom&&exploration?.pendingByHero){
   const authoritative=exploration.pendingByHero[mpRole];
   // The original restore compared only severity/roll. An equal-severity regional
   // replacement still has a new card and must redraw the pending panel.
   const replacesLocal=authoritative?.kind==='encounter'&&pEnc&&(!pEnc.roomAuthority3305||pEnc.card?.id!==authoritative.card?.id);
   const anotherOwner=pEnc&&!pEnc.roomAuthority3305&&pEnc.hero&&pEnc.hero!==mpRole;
   if(replacesLocal||anotherOwner){pEnc=null;document.getElementById('encPanel')?.classList.add('hidden')}
  }
  const out=beforeHandle.apply(this,arguments);
  if(message?.room===mpRoom&&exploration?.encounterDeckRepair33624)notice(exploration.encounterDeckRepair33624);
  return out;
 };
 repairLocal();
}
// Install after legacy DOMContentLoaded wrappers have all registered.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>queueMicrotask(install),{once:true});else install();
globalThis.ascEncounterDeck33624={version:rules.version,repair:repairLocal};
})();
