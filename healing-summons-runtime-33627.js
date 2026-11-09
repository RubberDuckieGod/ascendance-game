// Acting-player choices and visible, saved Spirit Wolf pieces.
(()=>{
'use strict';
const R=globalThis.ascHealingSummonsRules33627;
if(!R)return;
let pending=false;
const entryInFlight=new Set();
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof mpRoom!=='undefined'&&!!mpRoom;
function permitted(h){
 if(!g||h!==controlledHero()||!R.alive(g,h)||g.phase!=='Hero Phase'||g.campaign?.downtime||pLoc||pSearch||pEnc||!mpCanControl(h))return false;
 if(!remote())return true;
 const t=globalThis.ascRoomTurn33618?.state?.();return mpConnected()&&mpJoinReady&&t?.turnHero===h&&!t.resolving&&!t.passed?.[h];
}
function choose(options,label,format,always=false){
 if(!options.length)return null;if(options.length===1&&!always)return options[0];
 const answer=prompt(label+'\n'+options.map((x,i)=>`${i+1}. ${format(x)}`).join('\n'));
 if(answer===null||!/^\d+$/.test(answer.trim()))return null;
 return options[Number(answer)-1]??null;
}
function markers(){
 for(const el of document.querySelectorAll('.ascHeroPiece3294.piece-wolf')){
  el.classList.add('ascSpiritWolfMarker33627');
  const text=el.textContent;el.textContent='';
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 32 28');icon.setAttribute('width','24');icon.setAttribute('height','22');icon.setAttribute('aria-hidden','true');
  const path=document.createElementNS(icon.namespaceURI,'path');path.setAttribute('d','M5 2 12 7h8l7-5-1 15-5 9H11l-5-9Zm6 10 3 3m7-3-3 3m-5 5h6l-3 3Z');path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');icon.appendChild(path);el.appendChild(icon);
  const label=document.createElement('span');label.textContent=text.replace(/^🐺\s*/,'');el.appendChild(label);
  el.style.color='#d3eaf8';el.style.display='flex';el.style.alignItems='center';el.style.justifyContent='center';el.style.gap='3px';
  el.setAttribute('role','img');el.setAttribute('aria-label',text);el.title='Spirit Wolf remains at this Location until Defeated.';
 }
 const h=controlledHero(),wolf=(g?.heroCreatedPieces3294||[]).find(p=>p.type==='wolf'&&p.owner===h),choice=R.passiveChoices(g,h)[0];
 let panel=document.getElementById('healingSummonActions33627');
 if(!panel&&(wolf||choice)){const attack=document.getElementById('attack');if(attack){panel=document.createElement('div');panel.id='healingSummonActions33627';panel.className='mechanicsActions';panel.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:8px';attack.parentElement.appendChild(panel)}}
 if(panel){panel.replaceChildren();panel.hidden=!(wolf||choice);panel.style.display=wolf||choice?'flex':'none'}
 if(panel&&wolf){const button=document.createElement('button');button.id='defeatSpiritWolf33627';button.textContent='Remove Defeated Spirit Wolf';button.disabled=pending||!permitted(h);button.onclick=()=>defeat(wolf.id,h);panel.appendChild(button)}
 if(panel&&choice){const button=document.createElement('button');button.id='resolveHealingPassive33627';button.textContent='Resolve '+choice.label;button.disabled=pending||!permitted(h);button.onclick=async()=>{pending=true;try{await resolvePassives(h);await processEntry(g.healingEntries33627?.[h])}finally{pending=false;render()}};panel.appendChild(button)}
}
async function defeat(pieceId,h=controlledHero()){
 if(pending||!permitted(h))return {error:'Remove your Spirit Wolf during your own turn without a pending prompt.'};
 pending=true;
 try{return await globalThis.ascMechanics33621.command('DEFEAT_SPIRIT_WOLF',{pieceId},h)}finally{pending=false;render()}
}
async function processEntry(receipt){
 if(!receipt||entryInFlight.has(receipt.id)||receipt.actor!==controlledHero()||R.passiveChoices(g,receipt.actor).length||pLoc||pSearch||pEnc)return;
 if(remote()&&(!mpConnected()||!mpJoinReady||globalThis.ascRoomTurn33618?.state?.()?.turnHero!==receipt.actor))return;
 const t=g.tiles?.[receipt.tileKey];if(!t)return;entryInFlight.add(receipt.id);
 try{
  const [x,y]=receipt.tileKey.split(',').map(Number),triggered=triggerFirstVisitIfEligible(t,x,y,receipt.actor);
  if(!remote())R.completeEntry(g,receipt.actor,{tileKey:receipt.tileKey,entryId:receipt.id},{authoritativeFirstVisit:true});
  else if(!triggered&&!pEnc)await globalThis.ascMechanics33621.command('CARD_ENTRY_COMPLETE',{tileKey:receipt.tileKey,entryId:receipt.id},receipt.actor);
 }finally{entryInFlight.delete(receipt.id)}
}
async function resolvePassives(h){
 for(let count=0;count<100;count++){
  const q=R.passiveChoices(g,h)[0];if(!q)return true;const args={choiceId:q.id};
  if(q.type==='drawDiscard'||q.type==='draw')args.accept=confirm(`${q.label}: ${heroDisplayName(q.hero)} may draw 1 card${q.type==='drawDiscard'?', then discard 1 card':''}. Use this ability?`);
  else if(q.type==='cleanseHero'){const list=R.harmful(g,q.hero);if(!list.length)args.accept=false;else{args.condition=choose(list,`${q.label}: choose a harmful Condition on ${heroDisplayName(q.hero)} (Cancel declines)`,x=>x,true);if(!args.condition)args.accept=false}}
  else if(q.type==='discard'){
   const hand=q.hero==='Aldric'?g.heroHand:q.hero==='Lyra'?g.lyraHand:q.hero==='Seraphine'?g.seraphineHand:R.body(g,q.hero).hand;
   const card=choose(hand||[],`${q.label}: choose a card in ${heroDisplayName(q.hero)}’s hand to discard`,c=>c.name||c.id,true);if(!card)return false;args.discardUid=String(card.uid||card.id||'');
  }else{
   const targets=g.partyHeroes.filter(w=>R.alive(g,w)&&`${R.position(g,w).x},${R.position(g,w).y}`===q.tileKey&&(q.type!=='guardedHero'||w!==q.owner));
   args.targetHero=choose(targets,`${q.label}: choose the Hero to benefit`,heroDisplayName,true);if(!args.targetHero){args.accept=false}else if(q.type==='totemAid'){args.mode=choose(['heal','draw'],`${q.label}: choose the benefit`,x=>x==='heal'?'Recover 1 Health':'Draw 1 card',true);if(!args.mode)args.accept=false}
  }
  const out=await globalThis.ascMechanics33621.command('RESOLVE_HEAL_PASSIVE',args,h);if(out?.error)return false;
 }
 return false;
}
function conditionChoice(h,label){const list=R.removable(g,h);if(!list.length)return undefined;return choose(list,label,x=>x,true)}
function chooseOptions(h,label,options,max){
 const first=choose(options,label,x=>x==='heal'?'Recover Health':x==='cleanse'?'Remove one Condition':'Gain Inspired',true);if(!first)return null;
 const out=[first];if(max>1){const rest=options.filter(x=>x!==first),raw=prompt(label+': choose a second different option (0 = Done)\n'+rest.map((x,i)=>`${i+1}. ${x}`).join('\n')+'\n0. Done');if(raw===null)return null;if(raw!=='0'){const selected=rest[Number(raw)-1];if(!selected)return null;out.push(selected)}}
 const condition=out.includes('cleanse')?conditionChoice(h,label+': choose Condition'):undefined;if(condition===null)return null;return {hero:h,options:out,condition};
}
async function play(card){
 const h=controlledHero();if(pending||!permitted(h)){const error='Start your own living Hero’s turn without a pending prompt before playing this card.';log(error);return {error}}
 const args={cardId:card.id,cardUid:card.uid||null},options=R.choices(g,h,card.id);
 if(card.id==='H007-012'){
  args.targetHero=choose(options.heroes,card.name+': choose one Hero',heroDisplayName,true);if(!args.targetHero)return {cancelled:true};
  const eligible=R.removable(g,args.targetHero).filter(n=>['Bleeding','Burning'].includes(n));
  if(eligible.length){args.condition=choose(eligible,card.name+': choose exactly one Condition to remove',x=>x);if(!args.condition)return {cancelled:true}}
 }else if(['H003-013','H003-014'].includes(card.id)){
  const holy=R.consecrated(g,`${R.position(g,h).x},${R.position(g,h).y}`),prayer=card.id==='H003-013';args.selections=[];
  let selected=[];
  if(prayer){const pool=[...options.heroes];for(let i=0;i<2&&pool.length;i++){const answer=prompt(`${card.name}: choose Hero ${i+1} of up to 2 (0 = Done)\n`+pool.map((who,j)=>`${j+1}. ${heroDisplayName(who)}`).join('\n')+'\n0. Done');if(answer===null)return {cancelled:true};if(answer==='0')break;const who=pool[Number(answer)-1];if(!who)return {cancelled:true};selected.push(who);pool.splice(pool.indexOf(who),1)}}else selected=[...options.heroes];
  if(!selected.length)return {cancelled:true};let prayerBothUsed=false;
  for(const who of selected){const both=holy&&(!prayer||!prayerBothUsed)&&(!prayer||confirm(`${card.name}: let ${heroDisplayName(who)} both recover 1 Health and remove one Condition?`));
   let selection;if(prayer&&both){const condition=conditionChoice(who,card.name+': choose Condition');if(condition===null)return {cancelled:true};selection={hero:who,options:['heal','cleanse'],condition};prayerBothUsed=true}else selection=chooseOptions(who,`${card.name} — ${heroDisplayName(who)}`,prayer?['heal','cleanse']:['heal','cleanse','inspired'],both?2:1);
   if(!selection)return {cancelled:true};args.selections.push(selection);
  }
  if(R.body(g,h).supportInnateRound!==g.round){args.graceHero=choose(options.heroes,'Divine Grace: choose the Hero here to recover 1 Health',heroDisplayName,true);if(!args.graceHero)return {cancelled:true}}
 }else if(['H003-015','H003-017'].includes(card.id)){
  const destination=choose(options.locations,card.name+': choose connected Location (Cancel keeps the card)',q=>q.t.name||q.key,true);if(!destination)return {cancelled:true};args.tileKey=destination.key;
  args.mode=choose(['heal','cleanse'],card.name+': choose the effect after moving',x=>x==='heal'?'Recover Health':'Remove Condition',true);if(!args.mode)return {cancelled:true};
  if(card.id==='H003-015'&&args.mode==='cleanse'){args.condition=conditionChoice(h,card.name+': choose your Condition');if(args.condition===null)return {cancelled:true}}
  if(card.id==='H003-017'){
   const allies=g.partyHeroes.filter(w=>w!==h&&R.alive(g,w)&&`${R.position(g,w).x},${R.position(g,w).y}`===destination.key);
   if(args.mode==='heal'){args.healHero=choose(allies,card.name+': choose allied Hero in the destination to recover 2 Health',heroDisplayName,true);if(!args.healHero)return {cancelled:true}}
   else{args.cleanse={};for(const who of allies){const condition=conditionChoice(who,card.name+': choose Condition on '+heroDisplayName(who));if(condition===null)return {cancelled:true};if(condition)args.cleanse[who]=condition}}
  }
 }else if(card.id==='H003-016'){
  if(!options.allies.length||!options.locations.length){const error='Shepherd the Faithful needs an allied Hero here and a connected revealed Location.';log(error);return {error}}
  args.allyHero=choose(options.allies,'Shepherd the Faithful: choose the allied Hero to move with Elara',heroDisplayName);
  if(!args.allyHero)return {cancelled:true};
  const destination=choose(options.locations,'Shepherd the Faithful: choose the same connected Location for both Heroes',q=>q.t.name||q.key,true);
  if(!destination)return {cancelled:true};args.tileKey=destination.key;
  args.healHero=choose([h,args.allyHero],'Shepherd the Faithful: after moving, choose who recovers 1 Health',who=>`${heroDisplayName(who)} (${R.body(g,who).hp} Health)`,true);
  if(!args.healHero)return {cancelled:true};
 }else{
  if(!options.enemies.length){const error='Spirit Wolf needs an Enemy in Thorne’s Location for its immediate damage.';log(error);return {error}}
  const target=choose(options.enemies,'Spirit Wolf: choose the Enemy here that suffers 2 damage',q=>`${q.en.name} (${q.en.hp} Health)`);
  if(!target)return {cancelled:true};args.enemyIndex=target.index;args.enemyId=String(target.en.roomEnemyId3301||target.en.uid||target.en.id||'');
 }
 if(args.tileKey){args.entryChoices={};const moved=card.id==='H003-016'?[h,args.allyHero]:[h],t=g.tiles[args.tileKey],thorneAt=R.alive(g,'Thorne')&&(moved.includes('Thorne')||`${R.position(g,'Thorne').x},${R.position(g,'Thorne').y}`===args.tileKey);
  for(const who of moved){const entry=args.entryChoices[who]={};if(t.id==='L043'){entry.fog=choose(['Hidden','Armor'],`Foggy Meadow: choose ${heroDisplayName(who)}’s Hidden Movement benefit`,x=>x==='Hidden'?'Gain Hidden':'Gain +1 Armor',true);if(!entry.fog)return {cancelled:true}}if(thorneAt&&g.heroAbilityRuntime3362?.round?.['Thorne::Wild Growth']!==g.round)entry.wildGrowth=confirm(`Wild Growth: give ${heroDisplayName(who)} Regenerating?`)}
 }
 const preview=R.preview(g,h,args);if(preview.error){log(preview.error);return preview}
 pending=true;
 try{
  const result=await globalThis.ascMechanics33621.command('PLAY_HEAL_SUMMON',args,h);
  if(!result?.error&&card.id==='H007-006'&&result.killed)window.q001AfterEnemyDefeat?.();
  if(!result?.error){await resolvePassives(h);if(result.entryReceipt)await processEntry(result.entryReceipt)}
  return result;
 }finally{pending=false;render()}
}
function install(){
 const mechanics=globalThis.ascMechanicsRules33621;
 if(!globalThis.ascMechanics33621||!mechanics){setTimeout(install,15);return}
 if(globalThis.ascHealingSummons33627)return;
 const actionBefore=mechanics.action;
 mechanics.action=function(game,h,op,args={}){
  if(op==='PLAY_HEAL_SUMMON')return R.playCard(game,h,args,game===g?{log,kill:(...a)=>window.recordKill32521?.(...a)}:{});
  if(op==='CARD_ENTRY_COMPLETE')return R.completeEntry(game,h,args);
  if(op==='RESOLVE_HEAL_PASSIVE')return R.resolveChoice(game,h,args,game===g?{log}:{});
  if(op==='DEFEAT_SPIRIT_WOLF')return R.defeat(game,h,args);
  return actionBefore.apply(this,arguments);
 };
 const playBefore=window.playExtraCard;window.playExtraCard=function(card){if(R.CARDS[card?.id])return play(card);return playBefore.apply(this,arguments)};
 const renderBefore=window.render;window.render=function(){if(g)R.reconcile(g);const out=renderBefore.apply(this,arguments);markers();const entry=g?.healingEntries33627?.[controlledHero()];if(entry&&!pending&&!pLoc&&!pSearch&&!pEnc)setTimeout(()=>processEntry(entry),0);return out};
 globalThis.ascHealingSummons33627={play,defeat,processEntry,resolvePassives,render:markers,pending:()=>pending};if(g)render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,160),{once:true});else install();
})();
