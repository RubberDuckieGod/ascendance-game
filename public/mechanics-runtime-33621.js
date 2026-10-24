// Completes the ten item mechanics identified by the automated audit.
(()=>{
'use strict';
const R=window.ascMechanicsRules33621,requests=new Map();
const G=()=>typeof g==='undefined'?null:g;
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&mpConnected();
const owned=(h,id)=>R.owns(G(),h,id),eq=(h,id)=>R.equipped(G(),h,id),S=h=>R.hero(G(),h);
function fail(message){log(message);return {error:message}}
function canAct(h){const gg=G();if(!gg||!partyHeroes().includes(h)||heroDefeated(h)||gg.phase!=='Hero Phase'||!mpCanControl(h))return false;if(remote()){const t=ascRoomTurn33618.state();return t?.turnHero===h&&!t.passed[h]&&!t.resolving}return h===controlledHero()}
function rpc(type,op,extra={}){const id=`M33621-${Date.now()}-${Math.random().toString(36).slice(2)}`;return new Promise(resolve=>{const timer=setTimeout(()=>{requests.delete(id);resolve({error:'Room command timed out; reconnect to read the authoritative result.'})},8000);requests.set(id,r=>{clearTimeout(timer);resolve(r)});mpSend(type,{id,op,hero:controlledHero(),round:Number(g.round),...extra})})}
async function command(op,args={},h=controlledHero()){
 if(!canAct(h))return fail('Start your own living Hero’s turn before using this action.');
 if((pLoc||pSearch||pEnc)&&!['STANCE','REFRESH'].includes(op))return fail('Resolve the current prompt before taking another Action.');
 if(remote()){if(op==='LOCKPICK')args={...args,eligibleCardIds:g.searchDeck.filter(c=>valid(c,R.tile(g,h))).map(c=>String(c.id||c.uid||c.name))};const ack=await rpc('MECHANICS_COMMAND',op,args);if(ack.error)return fail(ack.error);render();return ack.result||ack}
 if(op==='LOCKPICK'&&R.restriction(R.tile(g,h))?.action!=='interact'){const t=R.tile(g,h);if(pSearch||pEnc||pLoc||t.searchCount>=t.searchLimit||!g.searchDeck.some(c=>valid(c,t)))return fail('No legal Search is available.');}
 const result=R.action(g,h,op,{...args,maxHp:heroMaxHp(h)});if(result.error)return fail(result.error);if(result.draw)drawCardsForHero(h,result.draw);
 if(result.search){const p=heroPos(h),ok=await startFreeLocationSearch(h,p.x,p.y,{source:'Lockpick Set',consumeSearch:true});if(ok===false)return fail('The Search could not start.');}
 log(`${heroDisplayName(h)}: ${op==='REST'?`Rest — recovered ${result.heal} Health${result.rations?' using Traveler’s Rations':''}`:op.toLowerCase().replaceAll('_',' ')}.`);render();mpScheduleState();return result;
}
function localExtra(h,source){
 if(!canAct(h)||pLoc||pSearch||pEnc)return fail('Only the current living Hero without a pending prompt can start an extra turn.');const extra=g.extraTurns33621??={used:{},active:{}};
 const scope=source==='LT150'?`${g.campaign?.instanceId32537||''}:${g.campaign?.currentQuest}:${g.campaign?.day}`:R.encounter(g),key=`${h}:${source}:${scope}`;
 if(extra.used[key]||(source==='LT150'&&(!owned(h,'LT150')||extra.active[h])))return fail('This extra turn is not available.');
 extra.used[key]=true;extra.active[h]=source;const b=R.body(g,h);b.actions=3;b.difficultPrepared=false;for(const n of ['turnAttackBonus','nextAttackBonus','movedTurn','connectedAttackThisTurn'])b[n]=0;
 const root=window.ascHeroRuntime3362?.root()||(g.heroAbilityRuntime3362??={round:{},quest:{},turn:{},buffs:{},counters:{},flags:{}});if(root){root.counters['turn:'+h]=Math.max(1,Number(root.counters['turn:'+h]||0))+1;for(const key of Object.keys(root.turn))if(key.startsWith(h+'::'))delete root.turn[key]}
 drawCardsForHero(h,2);delete g.passedHeroes32521?.[h];log(`${heroDisplayName(h)} starts a full extra turn from ${source}: 3 Actions and 2 cards.`);render();return {extraTurn:source};
}
function localPendingExtra(h){if(S(h).pendingNight){delete S(h).pendingNight;localExtra(h,'EQ044')}}
function attackMods(h,c,q){
 const s=S(h),enc=R.encounter(g),mods={bonus:0,post:0};s.lastAttackTurn=R.turn(g,h);s.lastAttackData={weaponAttack:true,traits:String(c?.traits||'')};g.pendingWeaponAttack33621={enemyId:q.en?.roomEnemyId3301,traits:String(c?.traits||'')};
 if(heroHasCondition(h,'Staggered')){mods.bonus--;removeHeroCondition(h,'Staggered')}
 if(eq(h,'EQ013')&&R.nearFeature(g,q.t))mods.post++;
 if(eq(h,'EQ044')&&s.nightFirstEncounter!==enc){mods.bonus+=2;s.nightFirstEncounter=enc}
 if(eq(h,'EQ068')){
  if(s.stanceEncounter!==enc){s.stance=prompt('Worldheart Staff: Flame, Frost, Storm, or Life?', 'Flame')||'Flame';if(!['Flame','Frost','Storm','Life'].includes(s.stance))s.stance='Flame';s.stanceEncounter=enc;if(remote())rpc('MECHANICS_COMMAND','STANCE',{stance:s.stance}).then(r=>{if(r.error)fail(r.error)})}
  if(s.stance==='Flame'&&/fire|flame|ember/i.test([c?.traits,c?.rules].join(' ')))mods.post+=2;
 }
 return mods;
}
function afterAttack(h,c,q,damage,dead){
 if(damage<=0)return;const s=S(h),enc=R.encounter(g);
 if(eq(h,'EQ025')&&q.en.hp>0&&s.staggerTurn!==R.turn(g,h)){
  s.staggerTurn=R.turn(g,h);if(!remote()){const die=1+Math.floor(Math.random()*6);log(`Stagger Save: ${q.en.name} rolled ${die}; 4+ succeeds.`);if(die<4)addCond(q.en,'Stunned')}
 }
 if(eq(h,'EQ068')&&s.stanceEncounter===enc){
  if(s.stance==='Frost'&&/cold|frost|ice/i.test([c?.traits,c?.rules].join(' '))&&q.en.hp>0){addCond(q.en,'Slowed');q.en.slowedUntilActivation=true}
  if(s.stance==='Storm'&&/lightning|storm|thunder/i.test([c?.traits,c?.rules].join(' '))){const other=(q.t.enemies||[]).find(en=>en!==q.en&&en.hp>0);if(other){other.hp=Math.max(0,other.hp-1);log(`Worldheart Storm: ${other.name} suffers 1 Lightning chain damage.`);if(!other.hp){q.t.enemies=q.t.enemies.filter(en=>en!==other);recordKill32521?.(h,other,'Worldheart Storm')}}}
 }
 if(dead&&eq(h,'EQ044')&&!remote()&&!g.extraTurns33621?.used?.[`${h}:EQ044:${enc}`])s.pendingNight=true;
}
function freeMoveAllowed(h){const allowed=!eq(h,'EQ025')||S(h).lastAttackTurn===R.turn(g,h);if(!allowed)log('Skullcrusher — Heavy Swing: make an Attack before taking a free Move.');return allowed}
async function rapidFire(h=controlledHero()){
 if(!canAct(h)||!eq(h,'EQ055'))return fail('Equip Repeating Crossbow and start your turn.');const s=S(h);
 if((s.rapidUses||0)>=3)return fail('Reload before using Rapid Fire again.');if(heroActionCount(h)<1)return fail('Rapid Fire needs 1 Action.');
 let q=chooseWeaponTarget(h);if(!q)return {cancelled:true};
 if(remote()){const targetId=q.en.roomEnemyId3301,r=await command('RAPID_FIRE',{},h);if(r.error)return r;let refreshed=null;for(const t of Object.values(g.tiles||{})){const en=(t.enemies||[]).find(en=>en.roomEnemyId3301===targetId&&en.hp>0);if(en){refreshed={...q,en,t};break}}q=refreshed||chooseWeaponTarget(h)}else{spendHeroActions(h,1);s.rapidUses=(s.rapidUses||0)+1}
 try{const fire=ref=>window.equipmentGrantedAttack33621(h,ref,'Rapid Fire',-1);if(q)fire(q);const next=chooseWeaponTarget(h);if(next)fire(next);render();mpScheduleState();return {shots:2}}finally{if(remote()){window.ascCombat33621?.flush('rapid-fire-finished');mpScheduleState();await command('FINISH_RAPID',{},h)}}
}
function craftPlan(recipe,h){return R.craftPlan(recipe,heroInventory(h),lootById,owned(h,'LT159'))}
function encounterUI(p){if(!pEnc)return;Object.assign(pEnc,p);pEnc.roll=p.severity;pEnc.roomAuthority3305=remote();document.querySelector('#severity').textContent=`${p.severity} (d6 ${p.baseRoll})`;document.querySelector('#encEffect').textContent=p.text||''}
async function truePaths(){
 const h=controlledHero();if(!canAct(h)||!eq(h,'EQ103')||!pEnc||pEnc.severityMode!=='rolled')return fail('True Paths needs a rolled Travel Encounter.');
 let offer=pEnc.truePaths33621;
 if(offer&&offer.chosen!==null)return fail('True Paths was already used for this Encounter.');
 if(offer){}
 else if(remote()){const a=await rpc('EXPLORATION_COMMAND','ENCOUNTER_REROLL');if(a.error)return fail(a.error);offer=a.result.pending.truePaths33621;encounterUI(a.result.pending)}
 else{offer=pEnc.truePaths33621={original:pEnc.baseRoll,reroll:1+Math.floor(Math.random()*6),chosen:null}}
 const keep=confirm(`True Paths: original ${offer.original}, reroll ${offer.reroll}. OK keeps the reroll; Cancel keeps the original.`)?'reroll':'original';
 if(remote()){const a=await rpc('EXPLORATION_COMMAND','ENCOUNTER_KEEP',{keep});if(a.error)return fail(a.error);encounterUI(a.result.pending)}else{offer.chosen=keep;pEnc.baseRoll=offer[keep];pEnc.severity=Math.max(1,pEnc.baseRoll+(pEnc.worldModifier||0));pEnc.text=encResult(pEnc.card,pEnc.severity);encounterUI(pEnc)}render();return {keep};
}
function refreshWorldheart(){const h=controlledHero(),options=R.cooldowns(g,h);if(!options.length)return fail('No Ability is on cooldown.');const i=options.length===1?0:Number(prompt('Refresh which Ability?\n'+options.map((q,i)=>`${i+1}. ${q.name}`).join('\n')))-1;return options[i]?command('REFRESH',options[i]):{cancelled:true}}
function renderControls(){
 const attack=document.querySelector('#attack');if(!attack||!G())return;let panel=document.querySelector('#mechanicsActions33621');if(!panel){panel=document.createElement('div');panel.id='mechanicsActions33621';panel.className='mechanicsActions';attack.parentElement.appendChild(panel)}panel.replaceChildren();
 const h=controlledHero(),add=(label,fn,allowPending=false)=>{const b=document.createElement('button');b.textContent=label;b.disabled=!canAct(h)||(!allowPending&&!!(pLoc||pSearch||pEnc))||!!(S(h).rapidPendingId&&label!=='Finish Rapid Fire');b.onclick=()=>Promise.resolve(fn()).catch(e=>fail(e.message));panel.appendChild(b)};
 add('Rest · 2 Actions',()=>window.restHero33621(h));
 if(R.restriction(R.tile(g,h)))add('Unlock · 1 Action',()=>command('UNLOCK'));
 if(R.tile(g,h)?.interaction&&!R.tile(g,h).interactionResolved33621&&!R.restriction(R.tile(g,h)))add('Interact · 1 Action',()=>command('INTERACT'));
 if(owned(h,'LT026')&&R.restriction(R.tile(g,h)))add('Use Lockpick Set',()=>command('LOCKPICK',{},h));
 if(S(h).rapidPendingId)add('Finish Rapid Fire',()=>command('FINISH_RAPID'));
 if(eq(h,'EQ055')){add('Rapid Fire · 1 Action',()=>window.rapidFire33621(h));add('Reload · 1 Action',()=>command('RELOAD',{},h))}
 if(eq(h,'EQ068')){if(S(h).stanceEncounter!==R.encounter(g))add('Choose Worldheart Stance',()=>{const stance=prompt('Flame, Frost, Storm, or Life?','Flame');return stance?command('STANCE',{stance}):null},true);add('Worldheart’s Gift',refreshWorldheart,true)}
 if(eq(h,'EQ103')&&pEnc?.severityMode==='rolled'&&(!pEnc.truePaths33621||pEnc.truePaths33621.chosen===null))add(pEnc.truePaths33621?'Choose True Paths Roll':'True Paths · Reroll',truePaths,true);
 if(owned(h,'LT150')&&!g.extraTurns33621?.active?.[h])add('End turn / Orb of Ages',()=>window.extraTurn33621(h));
 globalThis.ascBlightPatch33624?.render?.();
}
function install(){
 if(!window.ascHeroRuntime3362||!window.ascHeroCardParity33611||!window.equipmentGrantedAttack33621){setTimeout(install,10);return}
 const whisper=equipmentById('EQ044');if(whisper)whisper.ability1='Invisible Death — the first Attack each encounter gains +2 Attack (automatic-hit combat).';
 const repeating=equipmentById('EQ055');if(repeating){repeating.ability1='Rapid Fire — 1 Action: make up to two Weapon Attacks, each dealing -1 Damage.';repeating.ability2='Magazine — three Rapid Fire uses per reload. Reload costs 1 Action.'}
 window.restHero33621=h=>command('REST',{},h||controlledHero());window.rapidFire33621=rapidFire;window.extraTurn33621=(h=controlledHero())=>remote()?command('EXTRA_TURN',{},h):localExtra(h,'LT150');
 window.craftingMaterialPlan33621=craftPlan;window.consumeCraftingCrystal33621=h=>R.consume(g,h,'LT159');window.heroMayMoveFree33621=freeMoveAllowed;
 window.ascMechanics33621={commandPending:()=>requests.size>0,command,attackMods,afterAttack,freeMoveAllowed,localPendingExtra,truePaths,refreshWorldheart,craftPlan,rapidFire,render:renderControls,rules:R};
 const search0=window.search;window.search=function(){if(R.restriction(R.tile(g,controlledHero())))return fail('Unlock this Location or use a Lockpick Set before Searching.');return search0.apply(this,arguments)};
 const use=window.useConsumable;window.useConsumable=function(h,key){const row=heroInventory(h).find(r=>r.key===key);if(row?.id==='LT012')return window.restHero33621(h);if(row?.id==='LT026')return command('LOCKPICK',{},h);return use.apply(this,arguments)};
 const heal=window.healHeroBy;window.healHeroBy=function(h,n,label){const healer=G()?.equipmentLootActingHero33612||controlledHero();if(n>0&&eq(healer,'EQ068')&&S(healer).stanceEncounter===R.encounter(g)&&S(healer).stance==='Life')n+=2;return heal.call(this,h,n,label)};
 const draw=window.startEncounter;window.startEncounter=function(){if(!remote())R.state(g).encounterSerial=Number(R.state(g).encounterSerial||0)+1;const r=draw.apply(this,arguments);for(const h of partyHeroes())if(eq(h,'EQ068')){delete S(h).stanceEncounter;delete S(h).giftEncounter}return r};
 for(const name of ['attack','playHandCard','playLyraCard','playSeraphineCard','playExtraCard','heroBasicAttackFor']){const old=window[name];if(typeof old!=='function')continue;window[name]=function(){const out=old.apply(this,arguments);if(out&&typeof out.then==='function')return out.then(r=>{if(!remote())localPendingExtra(controlledHero());return r});if(!remote())localPendingExtra(controlledHero());return out}}
 let legacyDepth=0;
 for(const [name,h,bonusIndex]of [['aldricCardAttack','Aldric',null],['lyraAttackEnemy','Lyra',2],['seraphineAttackEnemy','Seraphine',2],['playCard','Aldric',null]]){
  const old=window[name];if(typeof old!=='function')continue;window[name]=function(){
   if(legacyDepth)return old.apply(this,arguments);const args=[...arguments],en=name==='playCard'?args[1]:args[0],ref=en&&findE(en);if(!ref)return old.apply(this,arguments);
   const label=name==='playCard'?args[0]:args[1],row=WORKBOOK_DATABASE['Hero Deck Cards'].find(c=>c.Name===label),card={id:row?.['Card ID']||'BASIC',name:label||'Basic Attack',traits:row?.Traits||'',rules:row?.['Rules Text']||'',category:'Attack'},q={en,t:ref.t},mods=attackMods(h,card,q),before=en.hp,base=window.aldricBaseAttackValue;
   if(bonusIndex!==null)args[bonusIndex]=Number(args[bonusIndex]||0)+mods.bonus;else window.aldricBaseAttackValue=function(){return base.apply(this,arguments)+mods.bonus};
   legacyDepth++;let out;try{out=old.apply(this,args)}finally{legacyDepth--;if(bonusIndex===null)window.aldricBaseAttackValue=base}
   if(mods.post&&en.hp>0){en.hp=Math.max(0,en.hp-mods.post);if(!en.hp){q.t.enemies=q.t.enemies.filter(e=>e!==en);recordKill32521?.(h,en,'Weapon damage');q001AfterEnemyDefeat?.()}}
   afterAttack(h,card,q,Math.max(0,before-en.hp),en.hp<=0);return out;
  };
 }
 const end=window.endTurn;window.endTurn=function(){if(!remote()&&g?.extraTurns33621)g.extraTurns33621.active={};return end.apply(this,arguments)};
 const schedule0=window.mpScheduleState;window.mpScheduleState=function(){if(window.ascApplyingRoom33621)return;return schedule0.apply(this,arguments)};
 const before=window.mpHandleMessage;window.mpHandleMessage=function(m){
  if(m?.room===mpRoom&&/^(MECHANICS|EXPLORATION)_COMMAND_(ACK|REJECTED)$/.test(m.type)){const out=before.apply(this,arguments);const resolve=requests.get(m.data?.id);if(resolve){requests.delete(m.data.id);if(m.type==='MECHANICS_COMMAND_ACK')window.ascActionGuard33621?.reconcileServer(controlledHero());resolve(m.type.endsWith('REJECTED')?{error:m.data.reason}:m.data)}return out}
  let out;const snapshot=m?.room===mpRoom&&['ROOM_STATE','STATE','STATE_REJECTED','ADVENTURE_START','ADVENTURE_RESUME','ROUND_RESOLVE_ACK'].includes(m.type);if(snapshot){window.ascApplyingRoom33621=true;try{out=before.apply(this,arguments)}finally{window.ascCombat33621?.rebase('authoritative-snapshot');window.ascHeroLedger33621?.rebase('authoritative-snapshot');window.ascResourceLedger33621?.rebase();window.ascApplyingRoom33621=false}}else out=before.apply(this,arguments);if(m?.room===mpRoom&&m.type==='RESOURCE_STATE'&&g){if(m.data?.resources?.mechanics33621)g.mechanics33621=structuredClone(m.data.resources.mechanics33621);if(m.data?.resources?.extraTurns33621)g.extraTurns33621=structuredClone(m.data.resources.extraTurns33621);renderControls()}return out;
 };
 const render0=window.render;window.render=function(){const r=render0.apply(this,arguments);renderControls();return r};
 renderControls();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,90));else setTimeout(install,90);
})();
