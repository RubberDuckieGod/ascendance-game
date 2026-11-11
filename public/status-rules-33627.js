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
const definitions=typeof module==='object'&&module.exports?require('./status-reference-33628.js'):globalThis.ascStatusDefinitions33628;
for(const row of definitions.rows)if(!['Bleeding','Stunned','Slowed'].includes(row.Name))TEXT[row.Name]=row.Effect;
const name=c=>{const raw=typeof c==='string'?c:c?.name;return definitions.byId[raw]?.Name||raw};
const conditions=unit=>Array.isArray(unit?.conditions)?unit.conditions:[];
const has=(unit,status)=>conditions(unit).some(c=>name(c)===status);
function remove(unit,status){if(!unit)return false;status=name(status);const before=conditions(unit),next=before.filter(c=>name(c)!==status);unit.conditions=next;if(status==='Regenerating')delete unit.wildGrowthRegenerating33627;if(unit.statusDurations33628)delete unit.statusDurations33628[name(status)];return next.length!==before.length}
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g?.lyra:h==='Seraphine'?g?.seraphine:g?.heroRuntimeStates?.[h]||g?.extraHeroes?.[h];
const position=(g,h)=>h==='Aldric'?g?.hero:body(g,h);
function maxHp(g,h){const b=body(g,h),base=Number(b?.maxHp||({Aldric:12,Lyra:8,Seraphine:11}[h])||b?.hp||0),equipped=Object.values(g?.equipped?.[h]||{}).flat();return base+(equipped.includes('EQ097')?2:0)}
function activationToken(g,h){return `${g?.campaign?.instanceId32537||''}:${g?.campaign?.currentQuest||''}:${Number(g?.round||1)}:${h}:${Number(g?.roomAuthority3300?.startSeqByHero?.[h]||g?.heroAbilityRuntime3362?.counters?.['turn:'+h]||1)}`}
function receipt(unit,stage,token){
 if(!unit||token==null||token==='')throw Error('A unit and activation token are required for status resolution.');
 const ledger=unit.statusActivation33627??={};if(ledger[stage]===String(token))return false;
 ledger[stage]=String(token);return true;
}
function recordApplication(unit,status,options={}){
 const n=name(status),definition=definitions.byName[n];if(!unit||!definition)return false;
 const value={appliedToken:options.token??unit.statusActivation33627?.start??null,round:Number(options.round??0),duration:String(options.duration||definition.Duration||'')};
 if(options.sourceHero)value.sourceHero=options.sourceHero;if(options.sourceToken!=null)value.sourceToken=options.sourceToken;
 const all=unit.statusDurations33628??={},changed=JSON.stringify(all[n])!==JSON.stringify(value);all[n]=value;return changed;
}
function ensureDurations(unit,options={}){
 for(const c of conditions(unit)){const n=name(c);if(!unit.statusDurations33628?.[n])recordApplication(unit,n,options)}
}
function expire(unit,stage,options={}){
 const removed=[];for(const c of [...conditions(unit)]){
  const n=name(c),meta=unit.statusDurations33628?.[n];if(!meta)continue;const duration=meta.duration.toLowerCase().replace(/\s+/g,' ');
  let ends=false;
  if(stage==='start'&&/until (?:the )?start of (?:your )?next (?:turn|activation)/.test(duration))ends=String(meta.appliedToken??'')!==String(options.token??'');
  if(stage==='end'&&/until (?:the )?end of (?:your )?next (?:turn|activation)/.test(duration))ends=String(meta.appliedToken??'')!==String(options.token??'');
  if(stage==='end'&&/(?:until|or) (?:the )?end of (?:your )?(?:current )?turn/.test(duration)&&!duration.includes('next'))ends=true;
  if(stage==='round'&&/(?:until|or) (?:the )?end of (?:the )?round/.test(duration)&&meta.round<=Number(options.round))ends=true;
  if(ends){remove(unit,n);removed.push({status:n,kind:'remove'})}
 }return removed;
}
function expireRound(g,round){
 const events=[];for(const h of g.partyHeroes||[])events.push(...expire(body(g,h),'round',{round}));
 for(const t of Object.values(g.tiles||{}))for(const en of t.enemies||[])events.push(...expire(en,'round',{round}));return events;
}
const recoveryScopes=new WeakMap();
function withRecovery(unit,callback){
 const previous=recoveryScopes.get(unit),scope={remaining:has(unit,'Withered')?1:Infinity};recoveryScopes.set(unit,scope);
 try{return callback()}finally{if(previous)recoveryScopes.set(unit,previous);else recoveryScopes.delete(unit)}
}
function recoveryAmount(unit,amount,options={}){
 let value=Math.max(0,Number(amount)||0),capacity=Math.max(0,Number(options.capacity??Infinity));
 if(!value||!capacity||unit?.noHealUntilTurnEnd||options.round!=null&&unit?.noHealUntilRound===options.round)return 0;
 if(has(unit,'Diseased'))value=Math.max(0,value-1);
 if(has(unit,'Scorched')){value=Math.max(0,value-1);remove(unit,'Scorched')}
 const scope=recoveryScopes.get(unit);if(has(unit,'Withered'))value=Math.min(value,scope?.remaining??1);
 value=Math.min(value,capacity);if(scope&&has(unit,'Withered'))scope.remaining-=value;return value;
}
function additionalActions(unit,amount){
 const n=Math.max(0,Number(amount)||0);if(!n||has(unit,'Exhausted'))return 0;if(has(unit,'Shocked')){remove(unit,'Shocked');return 0}return n;
}
function result(unit,options,events=[],duplicate=false){const hp=Math.max(0,Number(unit?.hp)||0),stunned=has(unit,'Stunned');return {duplicate,events,hp,alive:hp>0,stunned,actions:hp<=0||stunned?0:Math.max(1,Number(options.baseActions??3)-Number(has(unit,'Slowed'))+Number(options.startActionDelta||0))}}
function stampCondition(unit,status,patch){
 unit.conditions=conditions(unit).map(c=>name(c)===status?{...(typeof c==='object'?c:{}),name:status,...patch}:c);
}
function attackEffects(unit,options={}){
 const mods={bonus:0,post:0},round=Number(options.round||0),token=String(options.token||'round:'+round),get=n=>conditions(unit).find(c=>name(c)===n);
 const shaken=get('Shaken'),blessed=get('Blessed'),rallied=get('Rallied');
 if(shaken&&(typeof shaken!=='object'||shaken.usedRound!==round)){mods.bonus--;stampCondition(unit,'Shaken',{usedRound:round})}
 if(blessed&&(typeof blessed!=='object'||blessed.usedRound!==round)){mods.bonus++;stampCondition(unit,'Blessed',{usedRound:round})}
 if(rallied&&options.alliedHere&&(typeof rallied!=='object'||rallied.usedToken!==token)){mods.bonus++;stampCondition(unit,'Rallied',{usedToken:token})}
 if(has(unit,'Empowered')){mods.bonus+=2;remove(unit,'Empowered')}
 if(has(unit,'Focused')&&(has(unit,'Weakened')||has(unit,'Restrained')||has(unit,'Staggered')||shaken&&(typeof shaken!=='object'||shaken.usedRound!==round))){mods.bonus++;remove(unit,'Focused')}
 const frenzy=get('Frenzied');if(frenzy&&typeof frenzy==='object'&&frenzy.ready){mods.bonus++;remove(unit,'Frenzied')}
 remove(unit,'Hidden');remove(unit,'Camouflaged');return mods;
}
function killEffects(unit,options={}){
 if(has(unit,'Frenzied'))stampCondition(unit,'Frenzied',{ready:true});
 const blood=conditions(unit).find(c=>name(c)==='Bloodthirsty'),token=String(options.token||'round:'+Number(options.round||0));
 if(blood&&(typeof blood!=='object'||blood.usedToken!==token)){stampCondition(unit,'Bloodthirsty',{usedToken:token});return {heal:1}}return {heal:0};
}
function damage(unit,amount,options={}){
 if(!unit||Number(unit.hp)<=0)return 0;let value=Math.max(0,Number(amount)||0);if(!value)return 0;
 const type=String(options.damageType||'').toLowerCase();
 if(type==='lightning'&&has(unit,'Electrified')){value++;remove(unit,'Electrified')}
 if(type==='fire'&&has(unit,'Fireproof'))value=Math.max(0,value-1);
 if(value&&['arcane','fire','cold','lightning'].includes(type)&&has(unit,'Arcane Shield')){value=Math.max(0,value-2);remove(unit,'Arcane Shield')}
 if(value&&has(unit,'Protected')){value=Math.max(0,value-1);remove(unit,'Protected')}
 if(value&&has(unit,'Barrier')){
  const condition=conditions(unit).find(c=>name(c)==='Barrier'),remaining=Math.max(0,Math.min(2,Number(typeof condition==='object'?condition.remaining??2:2))),blocked=Math.min(value,remaining),left=remaining-blocked;value-=blocked;
  if(left===0)remove(unit,'Barrier');else unit.conditions=conditions(unit).map(c=>name(c)==='Barrier'?{name:'Barrier',remaining:left}:c);
 }
 const before=Number(unit.hp);let after=Math.max(0,before-value);
 if(after===0&&has(unit,'Resolute')){after=1;remove(unit,'Resolute')}
 unit.hp=after;return before-after;
}
function tickDamage(unit,status,options,events){
 if(!has(unit,status)||Number(unit.hp)<=0)return;
 const amount=damage(unit,1,{damageType:status==='Burning'?'Fire':status==='Poisoned'?'Poison':'Physical'});events.push({status,kind:'damage',amount});
 if(unit.hp===0)options.onDefeat?.(unit,status);
}
function start(unit,options={}){
 if(unit?.statusActivation33627?.start===String(options.token))return result(unit,{...options,startActionDelta:unit.statusActivation33627.startActionDelta||0},[],true);
 ensureDurations(unit,{token:unit?.statusActivation33627?.start||null,round:options.round});
 const events=expire(unit,'start',options);
 if(!receipt(unit,'start',options.token))return result(unit,options,[],true);
 options={...options,startActionDelta:0};
 if(Number(unit.hp)<=0){unit.statusActivation33627.startActionDelta=0;return result(unit,options,events)}
 if(has(unit,'Hasted'))options.startActionDelta+=additionalActions(unit,1);
 if(has(unit,'Confused')){const roll=1+Math.floor((options.random||Math.random)()*6);if(roll<=2)options.startActionDelta--;events.push({status:'Confused',kind:'roll',roll})}
 unit.statusActivation33627.startActionDelta=options.startActionDelta;
 // Damage precedes recovery. Recovery never brings a figure back from 0 Health.
 tickDamage(unit,'Bleeding',options,events);tickDamage(unit,'Poisoned',options,events);
 if(has(unit,'Regenerating')&&Number(unit.hp)>0&&!options.noHeal){
  const cap=Math.max(0,Number(options.maxHp??unit.maxHp??unit.max??unit.hp)||0),before=Number(unit.hp);
  let amount=recoveryAmount(unit,Number(options.regeneratingAmount||1),{capacity:cap-before,round:options.round});if(options.reduceHealing)amount=Math.max(0,Math.min(amount,Number(options.reduceHealing(amount))||0));
  unit.hp=before+amount;events.push({status:'Regenerating',kind:'heal',amount});
 }
 return result(unit,options,events);
}
function end(unit,options={}){
 if(!receipt(unit,'end',options.token))return result(unit,options,[],true);
 ensureDurations(unit,{token:unit?.statusActivation33627?.start||null,round:options.round});const events=[];tickDamage(unit,'Burning',options,events);
 if(has(unit,'Stunned')){if(options.removeStatus)options.removeStatus('Stunned');else remove(unit,'Stunned');events.push({status:'Stunned',kind:'remove'})}
 events.push(...expire(unit,'end',options));
 return result(unit,options,events);
}
function markHeroDefeated(g,h){
 const b=body(g,h);if(!b||Number(b.hp)>0||!(g.partyHeroes||[]).includes(h))return null;
 g.campaign??={};g.campaign.heroFates??={};const old=g.campaign.heroFates[h];if(['Downed','Lost'].includes(old?.status))return old;
 const p=position(g,h),companion=(g.partyHeroes||[]).some(w=>{const q=position(g,w);return w!==h&&Number(body(g,w)?.hp)>0&&p&&q&&p.x===q.x&&p.y===q.y});
 return g.campaign.heroFates[h]={status:companion?'Downed':'Lost',quest:g.campaign.currentQuest,day:g.campaign.day};
}
function heroOptions(g,h,options){const b=body(g,h);return {round:g.round,token:options.token??activationToken(g,h),maxHp:options.maxHp??maxHp(g,h),...options,noHeal:!!(options.noHeal||b?.noHealUntilTurnEnd||b?.noHealUntilRound===g.round||b?.noHealEnemyTurn33611&&g.phase==='World Phase'),onDefeat:()=>{markHeroDefeated(g,h);options.onDefeat?.(h)}}}
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
const HARMFUL=new Set(definitions.rows.filter(row=>row.Type==='Harmful').map(row=>row.Name));
function application(unit,status,options={}){
 const n=name(status),blocked=by=>({allowed:false,blockedBy:by});
 if(n==='Burning'&&(has(unit,'Wet')||has(unit,'Fireproof')))return blocked(has(unit,'Wet')?'Wet':'Fireproof');
 for(const [immune,names]of [['Coldproof',['Chilled','Frozen']],['Shockproof',['Shocked','Electrified']],['Venomproof',['Poisoned']],['Consecrated',['Cursed','Hexed']],['Steadfast',['Frightened','Panicked','Shaken']]])if(names.includes(n)&&has(unit,immune))return blocked(immune);
 for(const [immune,eligible]of [['Unstoppable',['Rooted','Knocked Down','Grappled','Restrained'].includes(n)],['Ward',HARMFUL.has(n)]])if(eligible&&has(unit,immune)){remove(unit,immune);return {...blocked(immune),consumed:immune}}
 if(HARMFUL.has(n)&&has(unit,'Sanctified')&&options.rollSanctified!==false){const face=1+Math.floor((options.random||Math.random)()*6);if(face===6)return {...blocked('Sanctified'),roll:face};return {allowed:true,roll:face}}
 return {allowed:true};
}
function attackModifier(unit){return (has(unit,'Berserk')?2:0)+Number(has(unit,'Enraged'))-(has(unit,'Restrained')?1:0)}
function armorValue(unit,base,options={}){let value=Number(base||0)-Number(has(unit,'Vulnerable'))-Number(has(unit,'Cracked Armor'))-Number(has(unit,'Berserk'));if(has(unit,'Corroded'))value=Math.min(value-1,Number(options.printedArmor??unit?.armor??base));return Math.max(0,value)}
function movementError(unit){if(has(unit,'Frozen')||has(unit,'Restrained'))return 'Frozen or Restrained figures cannot Move.';if(has(unit,'Stunned'))return 'Stunned figures cannot Move.';if(has(unit,'Rooted')||has(unit,'Knocked Down'))return 'Rooted or Knocked Down figures cannot voluntarily Move.';return null}
function actionError(unit,options={}){if(has(unit,'Stunned'))return 'Stunned figures cannot perform Actions or Reactions.';if(options.duringTurn!==false&&has(unit,'Knocked Down'))return 'Your first Action must be Stand while Knocked Down.';return null}
return {TEXT,definitions,name,conditions,has,remove,body,position,maxHp,activationToken,application,recordApplication,expire,expireRound,withRecovery,recoveryAmount,additionalActions,attackModifier,armorValue,attackEffects,killEffects,damage,start,end,heroStart,heroEnd,markHeroDefeated,movementError,actionError};
});
