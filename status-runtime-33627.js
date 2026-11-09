// Browser adapters for shared status rules. Room Hero activation ticks are owned
// by the server; this adapter owns solo Hero and seeded Enemy-worker ticks.
(()=>{
'use strict';
const R=window.ascStatusRules33627;let installed=false,syncing=false;
function G(){try{return window.__ascGetGame?.()||g}catch(_){return null}}
// A bound room owns activation effects even while its socket is reconnecting.
function online(){try{return !!(mpMode==='remote'&&typeof mpRoom!=='undefined'&&mpRoom)}catch(_){return false}}
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value||{},key);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
function roomScope(gg){return {instance:String(gg?.campaign?.instanceId32537||'legacy'),quest:String(gg?.campaign?.currentQuest||''),epoch:Number(gg?.questTransitionAuthority33626?.epoch||0)}}
function sameScope(a,b){return !!a&&!!b&&a.instance===b.instance&&a.quest===b.quest&&a.epoch===b.epoch}
// Activation receipts and Encounter closure are server-owned metadata. Their
// notifications must not replace unrelated callbacks that are still waiting for
// the compatibility snapshot, including the actual Hero's kill credit.
function applyRoomMetadata(message){
 if(!online()||message?.room!==mpRoom||message.type!=='STATE'||message.from!=='SERVER'||message.statusOnly33627!==true&&message.encounterClosedOnly33627!==true)return false;
 const gg=G(),source=message.data?.game;
 if(!gg||!source||!sameScope(roomScope(gg),roomScope(source)))return true;
 if(Number.isInteger(message.revision)&&message.revision<Number(mpRoomRevision||0))return true;
 if(window.ascPhaseSync33625?.suppress?.(message))return true;
 if(message.statusOnly33627===true){
  for(const h of gg.partyHeroes||[]){
   if(!(source.partyHeroes||[]).includes(h))continue;
   const target=R.body(gg,h),from=R.body(source,h);if(!target||!from)continue;
   for(const field of ['statusActivation33627','wildGrowthRegenerating33627','natureRenewalRound33627','statusDurations33628']){if(own(from,field))target[field]=clone(from[field]);else delete target[field]}
   if(own(source.campaign?.heroFates,h)){gg.campaign.heroFates??={};gg.campaign.heroFates[h]=clone(source.campaign.heroFates[h])}
   else if(gg.campaign?.heroFates)delete gg.campaign.heroFates[h];
  }
  for(const [key,from]of Object.entries(source.tiles||{})){
   const target=gg.tiles?.[key];if(!target||target.id!==from.id)continue;
   if(from.consecratedAuthority33627&&typeof from.consecratedAuthority33627==='object')for(const field of ['consecratedAuthority33627','consecratedUntilRound','consecratedBy']){if(own(from,field))target[field]=clone(from[field]);else delete target[field]}
   if(own(from,'blightHealingSuppressedRound33624'))target.blightHealingSuppressedRound33624=clone(from.blightHealingSuppressedRound33624);
  }
 }
 if(message.encounterClosedOnly33627===true){
  const authority=source.encounterCompletionAuthority33627;
  if(authority&&sameScope(authority.scope,roomScope(gg))&&authority.closed&&typeof authority.closed==='object'){
   gg.encounterCompletionAuthority33627=clone(authority);
   const token=gg.activeEncounter320?.token;
   if(typeof token==='string'&&own(authority.closed,token))gg.activeEncounter320=null;
  }
 }
 if(Number.isInteger(message.revision))mpRoomRevision=Math.max(Number(mpRoomRevision||0),message.revision);
 try{render()}catch(_){}
 return true;
}
function scope(){const gg=G();return `${gg?.campaign?.instanceId32537||''}:${gg?.campaign?.currentQuest||''}:${gg?.campaign?.day||0}:${gg?.round||1}`}
function logEvents(label,out){for(const event of out?.events||[]){if(event.kind==='damage')log(`${label} suffers ${event.amount} ${event.status} damage.`);else if(event.kind==='heal')log(`${label} recovers ${event.amount} Health from ${event.status}.`);else if(event.kind==='remove')log(`${event.status} ends on ${label}.`)}}
function ledger(){const gg=G();if(!gg)return null;const value=gg.statusHeroes33627??={};if(value.scope!==scope()){value.scope=scope();value.started={};value.ended={};value.tokens={};value.serial={}}return value}
function heroStart(h,{extra=false}={}){
 const gg=G(),state=ledger(),b=R.body(gg,h);if(!gg||!state||!b||online())return null;
 if(state.started[h]&&!extra)return null;
 const token=`${scope()}:${h}:${state.serial[h]=Number(state.serial[h]||0)+1}`;state.tokens[h]=token;state.started[h]=true;delete state.ended[h];
 window.ascHealingSummonsRules33627?.expireOnHeroStart?.(gg,h,{token});
 const out=R.heroStart(gg,h,{token,maxHp:heroMaxHp(h),baseActions:Number(b.actions||3),onDefeat:()=>handleHeroZero(h)});logEvents(heroDisplayName(h),out);
 b.actions=out.actions;
 if(!out.alive||out.stunned){b.actions=0;(gg.passedHeroes32521??={})[h]=true;heroEnd(h)}
 return out;
}
function heroEnd(h){
 const gg=G(),state=ledger(),b=R.body(gg,h);if(!state?.started?.[h]||state.ended[h]||!b||online())return null;
 state.ended[h]=true;const out=R.heroEnd(gg,h,{token:state.tokens[h],onDefeat:()=>handleHeroZero(h)});logEvents(heroDisplayName(h),out);if(!out.alive)b.actions=0;return out;
}
function syncSolo(){
 const gg=G();if(syncing||online()||!gg||gg.phase!=='Hero Phase'||gg.campaign?.downtime)return;
 syncing=true;try{const h=controlledHero();if((gg.partyHeroes||[]).includes(h)){
  heroStart(h);const b=R.body(gg,h),state=ledger();
  if(R.has(b,'Stunned')&&!state.ended[h]){b.actions=0;(gg.passedHeroes32521??={})[h]=true;heroEnd(h)}
  else if(Number(b?.actions)<=0&&!state.ended[h])heroEnd(h);
 }}finally{syncing=false}
}
function beforeRoundEnd(){
 if(online()||G()?.phase!=='Hero Phase')return;
 // Ending the round finalizes real activations only. Selecting another Hero is
 // what starts that Hero's activation; a round boundary must not invent one.
 for(const h of partyHeroes())heroEnd(h);
}
function enemyStart(en,p){
 const gg=G();en.statusEnemyToken33627=`${scope()}:enemy:${en.statusEnemySerial33627=Number(en.statusEnemySerial33627||0)+1}`;
 const out=R.start(en,{token:en.statusEnemyToken33627,maxHp:en.max||en.maxHp});logEvents(en.name,out);
 if(!out.alive){const ref=findE(en)||p;if(ref?.t)ref.t.enemies=(ref.t.enemies||[]).filter(e=>e!==en);log(`${en.name} is Defeated by a start-of-activation status.`)}
 return out;
}
function enemyEnd(en,p){
 if(!en.statusEnemyToken33627)return;
 const out=R.end(en,{token:en.statusEnemyToken33627,removeStatus:status=>removeCond(en,status)});logEvents(en.name,out);
 if(hasCond(en,'Slowed')&&en.slowedUntilActivation){removeCond(en,'Slowed');delete en.slowedUntilActivation}
 // Rooted persists unless its source explicitly limits it to this activation.
 if(R.has(en,'Rooted')&&en.rootedUntilActivation33627){removeCond(en,'Rooted');delete en.rootedUntilActivation33627}
 if(!out.alive){const ref=findE(en)||p;if(ref?.t)ref.t.enemies=(ref.t.enemies||[]).filter(e=>e!==en);log(`${en.name} is Defeated by an end-of-activation status.`)}
 return out;
}
function deny(h,movement=false){const b=R.body(G(),h),error=movement?R.movementError(b):R.actionError(b);if(error){log(error);return true}return false}
function wrap(name,hero,movement=false){const old=window[name];if(typeof old!=='function')return;window[name]=function(){const h=typeof hero==='function'?hero(...arguments):hero;if(deny(h,movement))return false;return old.apply(this,arguments)}}
function install(){
 if(installed)return;if(!R||!window.ascMechanics33621||!window.ascPhaseSync33625?.ready()){setTimeout(install,20);return}installed=true;
 if(typeof STATUS_RULES!=='undefined')Object.assign(STATUS_RULES,R.TEXT);
 if(typeof WORKBOOK_DATABASE!=='undefined'){const row=WORKBOOK_DATABASE['Status Effects']?.find(row=>row.Name==='Bleeding');if(row)row.Effect='Suffer 1 damage at the start of your activation.'}
 const receive=window.mpHandleMessage;window.mpHandleMessage=function(message){if(applyRoomMetadata(message))return;return receive.apply(this,arguments)};
 const init0=window.init;window.init=function(){const out=init0.apply(this,arguments);if(!online()){delete G().statusHeroes33627;syncSolo()}return out};
 const render0=window.render;window.render=function(){syncSolo();return render0.apply(this,arguments)};
 const end0=window.endTurn;window.endTurn=async function(){const gg=G(),round=gg?.round;beforeRoundEnd();const out=await end0.apply(this,arguments);if(G()===gg&&Number(gg.round)>Number(round))R.expireRound(gg,round);syncSolo();return out};
 const pass0=window.passHero32521;window.passHero32521=function(){if(!online())heroEnd(controlledHero());return pass0.apply(this,arguments)};
 for(const name of ['attack','explore','search','playExtraCard'])wrap(name,()=>controlledHero());
 for(const [name,h]of [['playHandCard','Aldric'],['playLyraCard','Lyra'],['playSeraphineCard','Seraphine'],['spendLyraReaction','Lyra'],['spendSeraphineReaction','Seraphine']])wrap(name,h);
 wrap('spendExtraReaction',h=>h);wrap('spendHeroActions',h=>h);
 for(const [name,h]of [['move','Aldric'],['moveLyra','Lyra'],['moveSeraphine','Seraphine'],['runtimeHeroMove',()=>controlledHero()]])wrap(name,h,true);
 const entry0=window.enterHeroLocation;if(typeof entry0==='function')window.enterHeroLocation=function(h,x,y,label='Move'){const forced=/push|pull|forced|knockback|enemy/i.test(String(label));if(!forced&&deny(h,true))return false;return entry0.apply(this,arguments)};
 const remove0=window.removeHeroCondition;if(typeof remove0==='function')window.removeHeroCondition=function(h,status){const out=remove0.apply(this,arguments);if(status==='Regenerating'&&!R.has(R.body(G(),h),'Regenerating'))delete R.body(G(),h).wildGrowthRegenerating33627;return out};
 const reaction0=window.runtimeHeroReactionWindow;if(typeof reaction0==='function')window.runtimeHeroReactionWindow=async function(en,target){if(deny(target?.id))return {};return reaction0.apply(this,arguments)};
 const gainHero=window.addHeroCondition;if(typeof gainHero==='function')window.addHeroCondition=function(h,status){
  status=R.name(status);const out=R.application(R.body(G(),h),status,{rollSanctified:!online()});if(!out.allowed){log(`${heroDisplayName(h)} ignores ${R.name(status)} because of ${out.blockedBy}.`);render();return false}const value=gainHero.apply(this,arguments);if(R.has(R.body(G(),h),status))R.recordApplication(R.body(G(),h),status,{round:G().round});return value;
 };
 const gainEnemy=window.addCond;if(typeof gainEnemy==='function')window.addCond=function(en,status){
  status=R.name(status);const out=R.application(en,status,{rollSanctified:!online()});if(!out.allowed){log(`${en.name} ignores ${R.name(status)} because of ${out.blockedBy}.`);render();return false}const value=gainEnemy.apply(this,arguments);if(R.has(en,status))R.recordApplication(en,status,{round:G().round});return value;
 };
 const healBefore=window.healHeroBy;if(typeof healBefore==='function')window.healHeroBy=function(h,n,label){const unit=R.body(G(),h);return unit?R.withRecovery(unit,()=>healBefore.call(this,h,n,label)):0};
 const searchStateBefore=window.searchHeroState;if(typeof searchStateBefore==='function')window.searchHeroState=function(h){const out=searchStateBefore.apply(this,arguments);if(h==='Aldric'&&out)Object.defineProperty(out,'conditions',{configurable:true,enumerable:true,get:()=>G().conditions||(G().conditions=[]),set:value=>{G().conditions=value}});return out};
 const freeMoveBefore=window.heroMayMoveFree33621;if(typeof freeMoveBefore==='function')window.heroMayMoveFree33621=function(h){if(R.has(R.body(G(),h),'Suppressed')){log('Suppressed Heroes cannot gain a free Move.');return false}return freeMoveBefore.apply(this,arguments)};
 const weaponIds33628=new Set(["EQ001","EQ002","EQ003","EQ004","EQ005","EQ006","EQ007","EQ008","EQ009","EQ010","EQ011","EQ012","EQ013","EQ014","EQ015","EQ016","EQ017","EQ018","EQ019","EQ020","EQ021","EQ022","EQ023","EQ024","EQ025","EQ026","EQ027","EQ028","EQ029","EQ030","EQ031","EQ032","EQ033","EQ034","EQ035","EQ036","EQ037","EQ038","EQ039","EQ040","EQ041","EQ042","EQ043","EQ044","EQ045","EQ046","EQ047","EQ048","EQ049","EQ050","EQ051","EQ052","EQ053","EQ054","EQ055","EQ056","EQ057","EQ058","EQ059","EQ060","EQ061","EQ062","EQ063","EQ064","EQ065","EQ066","EQ067","EQ068","EQ069","EQ070","EQ071","EQ072","EQ073","EQ074","EQ075","EQ076","EQ111","EQ112","EQ113","EQ114","EQ115","EQ116","EQ117","EQ118","EQ119","EQ120","EQ121","EQ122","EQ123","EQ124","EQ125","EQ126","EQ127","EQ128","EQ129","EQ130","EQ131","EQ132","EQ133","EQ134"]);
 const disarmedWeapon=(h,id)=>weaponIds33628.has(id)&&R.has(R.body(G(),h),'Disarmed');
 const definitionsBefore=window.equippedDefinitions;if(typeof definitionsBefore==='function')window.equippedDefinitions=function(h){return definitionsBefore.apply(this,arguments).filter(item=>!disarmedWeapon(h,item.id))};
 const equippedBefore=window.heroHasEquipped;if(typeof equippedBefore==='function')window.heroHasEquipped=function(h,id){return !disarmedWeapon(h,id)&&equippedBefore.apply(this,arguments)};
 const weaponBefore=window.heroWeaponDef;if(typeof weaponBefore==='function')window.heroWeaponDef=function(h){return R.has(R.body(G(),h),'Disarmed')?null:weaponBefore.apply(this,arguments)};
 const rangeBefore=window.equipmentRange;if(typeof rangeBefore==='function')window.equipmentRange=function(h){return R.has(R.body(G(),h),'Disarmed')?0:rangeBefore.apply(this,arguments)};
 // Shared stat consumers cover the four Hero storage layouts and Enemy stats.
 // Keep the legacy Inspired flag compatible without adding its bonus twice.
 for(const [name,who]of [['aldricBaseAttackValue','Aldric'],['lyraBaseAttackValue','Lyra'],['seraphineBaseAttackValue','Seraphine'],['extraBaseAttack',null]]){
  const old=window[name];if(typeof old!=='function')continue;
  window[name]=function(h){const hero=who||h,b=R.body(G(),hero);let delta=R.attackModifier(b);
   if(hero==='Aldric'){delta-=Number(R.has(b,'Weakened'));if(R.has(b,'Inspired')&&!b.inspired)delta++}
   if(hero==='Seraphine')delta-=Number(R.has(b,'Weakened'));
   return Number(old.apply(this,arguments)||0)+delta;
  };
 }
 for(const [name,who]of [['aldricArmor','Aldric'],['lyraArmor','Lyra'],['seraphineArmor','Seraphine'],['extraArmor',null]]){
  const old=window[name];if(typeof old!=='function')continue;
  window[name]=function(h){const hero=who||h,printed=globalThis.ascHeroStats33628?.get(hero,Number(G()?.levels?.[hero]||1))?.armor;return R.armorValue(R.body(G(),hero),old.apply(this,arguments),{printedArmor:printed==null?undefined:printed+Number(window.equipmentArmor?.(hero)||0)})};
 }
 const enemyAttack=window.effAttack;if(typeof enemyAttack==='function')window.effAttack=function(en){return Math.max(0,Number(enemyAttack.apply(this,arguments)||0)+R.attackModifier(en))};
 const enemyArmor=window.effArmor;if(typeof enemyArmor==='function')window.effArmor=function(en){
  let armor=enemyArmor.apply(this,arguments);const ref=window.findE?.(en),id=window.enemyId322?.(en);
  if(id==='E018'&&(ref?.t?.enemies||[]).some(other=>other!==en&&other.hp>0&&(/\b(?:leader|boss)\b/i.test([other.traits,other.enemyType,other.type].flat().join(' '))||/^(?:Boss|Leader)$/i.test(other.difficulty||''))))armor++;
  if(en.forestArmorRound33628===G()?.round&&en.forestArmorPhase33628===G()?.phase)armor++;
  return R.armorValue(en,armor);
 };
 const removeEnemyBefore=window.removeCond;if(typeof removeEnemyBefore==='function')window.removeCond=function(en,status){status=R.name(status);const out=removeEnemyBefore.call(this,en,status);R.remove(en,status);return out};
 const removeHeroBefore=window.removeHeroCondition;if(typeof removeHeroBefore==='function')window.removeHeroCondition=function(h,status){status=R.name(status);const out=removeHeroBefore.call(this,h,status);R.remove(R.body(G(),h),status);return out};
 // These low-level readers have no mutation or timing semantics.
 window.heroHasCondition=(h,status)=>R.has(R.body(G(),h),status);
 window.hasCond=(unit,status)=>R.has(unit,status);window.heroHasCond=(unit,status)=>R.has(unit,status);
 const conditionHtml=window.enemyConditionHtml;if(typeof conditionHtml==='function')window.enemyConditionHtml=function(list){return conditionHtml.call(this,(list||[]).map(R.name).filter(n=>typeof n==='string'))};
 syncSolo();
}
window.ascStatus33627={ready:()=>installed,rules:R,heroStart,heroEnd,syncSolo,beforeRoundEnd,enemyStart,enemyEnd,deny,applyRoomMetadata};
install();
})();
