// Browser adapters for shared status rules. Room Hero activation ticks are owned
// by the server; this adapter owns solo Hero and seeded Enemy-worker ticks.
(()=>{
'use strict';
const R=window.ascStatusRules33627;let installed=false,syncing=false;
function G(){try{return window.__ascGetGame?.()||g}catch(_){return null}}
// A bound room owns activation effects even while its socket is reconnecting.
function online(){try{return !!(mpMode==='remote'&&typeof mpRoom!=='undefined'&&mpRoom)}catch(_){return false}}
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
 const init0=window.init;window.init=function(){const out=init0.apply(this,arguments);if(!online()){delete G().statusHeroes33627;syncSolo()}return out};
 const render0=window.render;window.render=function(){syncSolo();return render0.apply(this,arguments)};
 const end0=window.endTurn;window.endTurn=async function(){beforeRoundEnd();const out=await end0.apply(this,arguments);syncSolo();return out};
 const pass0=window.passHero32521;window.passHero32521=function(){if(!online())heroEnd(controlledHero());return pass0.apply(this,arguments)};
 for(const name of ['attack','explore','search','playExtraCard'])wrap(name,()=>controlledHero());
 for(const [name,h]of [['playHandCard','Aldric'],['playLyraCard','Lyra'],['playSeraphineCard','Seraphine'],['spendLyraReaction','Lyra'],['spendSeraphineReaction','Seraphine']])wrap(name,h);
 wrap('spendExtraReaction',h=>h);wrap('spendHeroActions',h=>h);
 for(const [name,h]of [['move','Aldric'],['moveLyra','Lyra'],['moveSeraphine','Seraphine'],['runtimeHeroMove',()=>controlledHero()]])wrap(name,h,true);
 const entry0=window.enterHeroLocation;if(typeof entry0==='function')window.enterHeroLocation=function(h,x,y,label='Move'){const forced=/push|pull|forced|knockback|enemy/i.test(String(label));if(!forced&&deny(h,true))return false;return entry0.apply(this,arguments)};
 const remove0=window.removeHeroCondition;if(typeof remove0==='function')window.removeHeroCondition=function(h,status){const out=remove0.apply(this,arguments);if(status==='Regenerating'&&!R.has(R.body(G(),h),'Regenerating'))delete R.body(G(),h).wildGrowthRegenerating33627;return out};
 const reaction0=window.runtimeHeroReactionWindow;if(typeof reaction0==='function')window.runtimeHeroReactionWindow=async function(en,target){if(deny(target?.id))return {};return reaction0.apply(this,arguments)};
 syncSolo();
}
window.ascStatus33627={ready:()=>installed,rules:R,heroStart,heroEnd,syncSolo,beforeRoundEnd,enemyStart,enemyEnd,deny};
install();
})();
