// Shared activation rules. Bleeding's timing is the user's explicit 3.36.27 rule;
// Poisoned, Burning and Regenerating follow the authored Status Effects sheet.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascStatusRules33627=api})(globalThis,()=>{
'use strict';
const TEXT={
 Bleeding:'Suffer 1 damage at the start of your activation. Bleeding remains until removed.',
 Poisoned:'Suffer 1 damage at the start of your activation. Poisoned remains until removed.',
 Burning:'Suffer 1 damage at the end of your activation. Burning remains until removed.',
 Regenerating:'Recover 1 Health at the start of your activation, up to maximum Health. Regenerating remains until removed.',
 Stunned:'You cannot perform Actions or Reactions. Your activation ends immediately. Remove Stunned at the end of the affected activation.',
 Slowed:'Lose 1 Action during your activation, minimum 1 Action. Enemies have 1 less Movement.'
};
const name=c=>typeof c==='string'?c:c?.name;
const conditions=unit=>Array.isArray(unit?.conditions)?unit.conditions:[];
const has=(unit,status)=>conditions(unit).some(c=>name(c)===status);
function remove(unit,status){if(!unit)return false;const before=conditions(unit),next=before.filter(c=>name(c)!==status);unit.conditions=next;if(status==='Regenerating')delete unit.wildGrowthRegenerating33627;return next.length!==before.length}
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g?.lyra:h==='Seraphine'?g?.seraphine:g?.heroRuntimeStates?.[h]||g?.extraHeroes?.[h];
const position=(g,h)=>h==='Aldric'?g?.hero:body(g,h);
function maxHp(g,h){const b=body(g,h),base=Number(b?.maxHp||({Aldric:14,Lyra:8,Seraphine:11}[h])||b?.hp||0),equipped=Object.values(g?.equipped?.[h]||{}).flat();return base+(equipped.includes('EQ097')?2:0)}
function activationToken(g,h){return `${g?.campaign?.instanceId32537||''}:${g?.campaign?.currentQuest||''}:${Number(g?.round||1)}:${h}:${Number(g?.roomAuthority3300?.startSeqByHero?.[h]||g?.heroAbilityRuntime3362?.counters?.['turn:'+h]||1)}`}
function receipt(unit,stage,token){
 if(!unit||token==null||token==='')throw Error('A unit and activation token are required for status resolution.');
 const ledger=unit.statusActivation33627??={};if(ledger[stage]===String(token))return false;
 ledger[stage]=String(token);return true;
}
function result(unit,options,events=[],duplicate=false){const hp=Math.max(0,Number(unit?.hp)||0),stunned=has(unit,'Stunned');return {duplicate,events,hp,alive:hp>0,stunned,actions:hp<=0||stunned?0:Math.max(1,Number(options.baseActions??3)-Number(has(unit,'Slowed')))}}
function tickDamage(unit,status,options,events){
 if(!has(unit,status)||Number(unit.hp)<=0)return;
 const before=Number(unit.hp);unit.hp=Math.max(0,before-1);events.push({status,kind:'damage',amount:before-unit.hp});
 if(unit.hp===0)options.onDefeat?.(unit,status);
}
function start(unit,options={}){
 if(!receipt(unit,'start',options.token))return result(unit,options,[],true);
 const events=[];if(Number(unit.hp)<=0)return result(unit,options,events);
 // Damage precedes recovery. Recovery never brings a figure back from 0 Health.
 tickDamage(unit,'Bleeding',options,events);tickDamage(unit,'Poisoned',options,events);
 if(has(unit,'Regenerating')&&Number(unit.hp)>0&&!options.noHeal){
  const cap=Math.max(0,Number(options.maxHp??unit.maxHp??unit.max??unit.hp)||0),before=Number(unit.hp);
  let amount=Math.max(0,Math.min(Number(options.regeneratingAmount||1),cap-before));if(options.reduceHealing)amount=Math.max(0,Math.min(amount,Number(options.reduceHealing(amount))||0));
  unit.hp=before+amount;events.push({status:'Regenerating',kind:'heal',amount});
 }
 return result(unit,options,events);
}
function end(unit,options={}){
 if(!receipt(unit,'end',options.token))return result(unit,options,[],true);
 const events=[];tickDamage(unit,'Burning',options,events);
 if(has(unit,'Stunned')){if(options.removeStatus)options.removeStatus('Stunned');else remove(unit,'Stunned');events.push({status:'Stunned',kind:'remove'})}
 return result(unit,options,events);
}
function markHeroDefeated(g,h){
 const b=body(g,h);if(!b||Number(b.hp)>0||!(g.partyHeroes||[]).includes(h))return null;
 g.campaign??={};g.campaign.heroFates??={};const old=g.campaign.heroFates[h];if(['Downed','Lost'].includes(old?.status))return old;
 const p=position(g,h),companion=(g.partyHeroes||[]).some(w=>{const q=position(g,w);return w!==h&&Number(body(g,w)?.hp)>0&&p&&q&&p.x===q.x&&p.y===q.y});
 return g.campaign.heroFates[h]={status:companion?'Downed':'Lost',quest:g.campaign.currentQuest,day:g.campaign.day};
}
function heroOptions(g,h,options){const b=body(g,h);return {token:options.token??activationToken(g,h),maxHp:options.maxHp??maxHp(g,h),...options,noHeal:!!(options.noHeal||b?.noHealUntilTurnEnd||b?.noHealUntilRound===g.round||b?.noHealEnemyTurn33611&&g.phase==='World Phase'),onDefeat:()=>{markHeroDefeated(g,h);options.onDefeat?.(h)}}}
function heroStart(g,h,options={}){
 const b=body(g,h),opts=heroOptions(g,h,options),p=position(g,h),thorn=position(g,'Thorne'),stamp=`Thorne::Nature Renewal:${h}`;
 const renewal=(g.partyHeroes||[]).includes('Thorne')&&Number(body(g,'Thorne')?.hp)>0&&Number(g.levels?.Thorne||1)>=2&&p&&thorn&&p.x===thorn.x&&p.y===thorn.y&&b?.natureRenewalRound33627!==g.round&&g.heroAbilityRuntime3362?.round?.[stamp]!==g.round;
 if(renewal){opts.regeneratingAmount=2;if(!opts.reduceHealing){const blight=typeof module==='object'&&module.exports?require('./blight-encounter-rules-33624.js'):globalThis.ascBlightEncounterRules33624;if(blight)opts.reduceHealing=n=>blight.reduceHealing(g,h,n)}}
 const out=start(b,opts);
 if(renewal&&!out.duplicate&&out.events.some(e=>e.status==='Regenerating'&&e.kind==='heal'&&e.amount>0)){
  b.natureRenewalRound33627=g.round;if(!g.heroAbilityRuntime3362||Array.isArray(g.heroAbilityRuntime3362))g.heroAbilityRuntime3362={};if(!g.heroAbilityRuntime3362.round||Array.isArray(g.heroAbilityRuntime3362.round))g.heroAbilityRuntime3362.round={};g.heroAbilityRuntime3362.round[stamp]=g.round;
 }
 return out;
}
function heroEnd(g,h,options={}){
 const b=body(g,h),opts=heroOptions(g,h,options),out=end(b,opts),temp=b?.wildGrowthRegenerating33627;
 if(!out.duplicate&&temp&&String(temp.appliedToken??'')!==String(opts.token)){remove(b,'Regenerating');out.events.push({status:'Regenerating',kind:'remove',source:'Wild Growth'})}
 return out;
}
function movementError(unit){if(has(unit,'Stunned'))return 'Stunned figures cannot Move.';if(has(unit,'Rooted')||has(unit,'Knocked Down'))return 'Rooted or Knocked Down figures cannot voluntarily Move.';return null}
function actionError(unit){return has(unit,'Stunned')?'Stunned figures cannot perform Actions or Reactions.':null}
return {TEXT,name,conditions,has,remove,body,position,maxHp,activationToken,start,end,heroStart,heroEnd,markHeroDefeated,movementError,actionError};
});
