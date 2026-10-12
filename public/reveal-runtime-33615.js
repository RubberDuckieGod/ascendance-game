// Ascendance 3.36.15 — Generic Reveal Effect Runtime Parity
// Executes every generic Reveal Effect introduced by workbook v10.52 (L000, L088–L235)
// while leaving Scenario Reveal setup to the existing quest/campaign reveal hooks.
(()=>{
'use strict';
const V='3.36.15';
const SCENARIO_SPLIT='Scenario Reveal —';
const NEW_LOCATION_IDS=new Set(['L000',...Array.from({length:148},(_,i)=>`L${String(i+88).padStart(3,'0')}`)]);
const PATTERNS={
  'Read the Route — Look at the top Location Tile of the active Quest Location Stack; leave it on top or place it on the bottom.':'poolTop1',
  'Clear Bearing — The revealing Hero may immediately Move 1 Location without spending an Action.':'freeMove',
  'Trail Signs — Inspect the top Encounter card; leave it on top or place it on the bottom.':'encTop1',
  'Working Heat — The revealing Hero chooses +1 Attack or +1 Armor until the end of the round.':'workingHeat',
  'Tempered Resolve — The revealing Hero gains +1 Armor until the start of their next turn.':'armorNextTurn',
  'Prepared Refuge — The revealing Hero may recover 1 Health.':'healSelf1',
  'Defensible Ground — The revealing Hero gains +1 Armor until the start of their next turn.':'armorNextTurn',
  "Hot Iron — The revealing Hero's next Attack this round gains +1 Attack.":'nextAttack1',
  'Seat of Power — The revealing Hero gains Inspired until the end of their next turn.':'inspired',
  'Stormbreak — The revealing Hero gains +1 Armor until the start of their next turn.':'armorNextTurn',
  "Heat Haze — The revealing Hero's next Attack this round gains +1 Attack.":'nextAttack1',
  'Hidden Seam — The revealing Hero may immediately Search this Location without spending an Action.':'freeSearch',
  'Mineral Trace — Gain 10 Gold or 1 Supply.':'goldOrSupply',
  'Sacred Echo — The revealing Hero may recover 1 Health or remove 1 harmful Condition.':'healOrCleanse',
  'Useful Wreckage — The revealing Hero may immediately Search this Location without spending an Action.':'freeSearch',
  'Clear Current — The revealing Hero may immediately Move 1 Location without spending an Action.':'freeMove',
  'Distant Landmark — Inspect the top 2 Location Tiles in the active Quest Location Stack and return them in any order.':'poolTop2',
  'Hidden Trail — Inspect the top 2 Location Tiles in the active Quest Location Stack and return them in any order.':'poolTop2',
  'Lingering Grace — One Hero chosen by the revealing Hero may recover 1 Health.':'healChosen1',
  'Living Shelter — The revealing Hero may recover 1 Health.':'healSelf1',
  'Local Counsel — Inspect the top Encounter card; leave it on top or place it on the bottom.':'encTop1',
  'Quiet Benediction — The revealing Hero gains Inspired until the end of their next turn.':'inspired',
  'Salvageable Cargo — Draw 1 Search card.':'drawSearch',
  'Clear Sightline — Inspect the top 2 Encounter cards and return them in any order.':'encTop2',
  'Cooling Waters — One Hero chosen by the revealing Hero may recover 1 Health.':'healChosen1',
  'Echoes Below — Inspect the top Encounter card; leave it on top or place it on the bottom.':'encTop1',
  "Nature's Sign — Inspect the top Location Tile; leave it on top or place it on the bottom.":'poolTop1',
  'Open Stalls — Gain 10 Gold or 1 Supply.':'goldOrSupply',
  'Relentless Sun — The revealing Hero gains +1 Armor until the start of their next turn.':'armorNextTurn',
  'Restless Memory — The revealing Hero may remove 1 harmful Condition or draw 1 Search card.':'cleanseOrSearch',
  'Shimmering Horizon — Inspect the top Location Tile and the top Encounter card; return each to the top or bottom of its deck.':'poolAndEncTop1',
  'Unsettling Spores — The revealing Hero may discard 1 card; if they do not, they suffer 1 damage.':'discardOrDamage',
  'Useful Contacts — Gain 1 Supply or inspect the top Encounter card.':'supplyOrEncounter',
  'Useful Fungi — Draw 1 Search card, then discard 1 card.':'drawSearchDiscard',
  'Washed-Ashore Supplies — Gain 1 Supply or 10 Gold.':'supplyOrGold',
  'Whispering Leaves — The revealing Hero may remove 1 harmful Condition.':'cleanseSelf',
  'Ancient Inscription — Inspect the top 2 Encounter cards and return them in any order.':'encTop2',
  'Buried Relic — Draw 1 source-matched Loot.':'loot',
  'Fresh Water — The revealing Hero may recover 1 Health or remove 1 harmful Condition.':'healOrCleanse',
  'Home Base — The first time Stonebrook is revealed each Quest, each Hero there may recover 1 Health.':'homeBase',
  'Restorative Growth — The revealing Hero may remove 1 harmful Condition.':'cleanseSelf',
  'Sealed Cache — Gain 10 Gold or draw 1 Search card.':'goldOrSearch',
  'Tide Reading — Inspect the top Encounter card; leave it on top or place it on the bottom.':'encTop1'
};
function norm(v){return String(v??'').replace(/\s+/g,' ').trim()}
function genericText(tile){return norm(String(tile?.reveal||'').split(SCENARIO_SPLIT)[0].trim())}
function state(){
  if(!g.revealRuntime33615||typeof g.revealRuntime33615!=='object')g.revealRuntime33615={heroes:{},homeBaseStamp:null};
  if(!g.revealRuntime33615.heroes)g.revealRuntime33615.heroes={};
  if(!Number.isFinite(Number(g.partySupplies33615)))g.partySupplies33615=0;
  return g.revealRuntime33615;
}
function heroBuff(h){const s=state();return s.heroes[h]||(s.heroes[h]={roundAttackBonus:0,roundAttackRound:0,roundArmorBonus:0,roundArmorRound:0,nextAttackBonus:0,nextAttackRound:0})}
function roundAttack(h){const b=heroBuff(h);return Number(b.roundAttackRound)===Number(g.round)?Number(b.roundAttackBonus||0):0}
function roundArmor(h){const b=heroBuff(h);return Number(b.roundArmorRound)===Number(g.round)?Number(b.roundArmorBonus||0):0}
function nextAttack(h){const b=heroBuff(h);return Number(b.nextAttackRound)===Number(g.round)?Number(b.nextAttackBonus||0):0}
function attackBonus(h){return roundAttack(h)+nextAttack(h)}
function consumeNextAttack(h){const b=heroBuff(h);if(Number(b.nextAttackRound)===Number(g.round)&&Number(b.nextAttackBonus||0)>0){log(`REVEAL EFFECT — ${heroDisplayName(h)} consumes +${b.nextAttackBonus} Attack from a Location Reveal Effect.`);b.nextAttackBonus=0;b.nextAttackRound=0}}
function sync(){try{render?.()}catch(_){}try{mpScheduleState?.()}catch(_){}}
function syncPool(){try{if(typeof globalThis.ascExplorationCommand33615==='function')globalThis.ascExplorationCommand33615('EXPLORE_REORDER_POOL',{order:(g.pool||[]).map(cardKey33615)},false)}catch(_){}}
function syncEncounter(){try{if(typeof globalThis.ascExplorationCommand33615==='function')globalThis.ascExplorationCommand33615('EXPLORE_REORDER_ENCOUNTER',{order:(g.encDeck||[]).map(cardKey33615)},false)}catch(_){}}
function cardKey33615(x){return String(x?.id||x?.uid||x?.name||'')}
function heroState(h){try{return searchHeroState(h)}catch(_){return null}}
function heroes(){try{return partyHeroes().filter(h=>!heroDefeated(h))}catch(_){return []}}
function chooseHero(list,label){if(!list?.length)return null;if(list.length===1)return list[0];const raw=prompt(`${label}\n${list.map((h,i)=>`${i+1}. ${heroDisplayName(h)}`).join('\n')}`);if(raw===null)return null;return list[Number.parseInt(raw,10)-1]||null}
function heal(h,n,label){if(!h)return 0;try{return healHeroBy(h,n,label)}catch(_){try{return searchHeal(h,n,label)}catch(__){return 0}}}
function cleanse(h,label){if(!h)return false;const neg=['Poisoned','Bleeding','Burning','Rooted','Weakened','Stunned','Slowed','Shaken','Knocked Down'];let found=null;try{found=neg.find(c=>heroHasCondition(h,c))}catch(_){found=neg.find(c=>(heroState(h)?.conditions||[]).some(x=>(typeof x==='string'?x:x?.name)===c))}if(!found){log(`${label}: ${heroDisplayName(h)} has no harmful Condition to remove.`);return false}try{removeHeroCondition(h,found)}catch(_){try{searchRemoveCond(h,found)}catch(__){return false}}log(`${label}: ${heroDisplayName(h)} removes ${found}.`);return true}
function suffer(h,n,label){try{damageHeroBy(h,n,label)}catch(_){let s=heroState(h);if(s){s.hp=Math.max(0,Number(s.hp||0)-n);try{handleHeroZero(h)}catch(__){};log(`${label}: ${heroDisplayName(h)} suffers ${n} damage.`)}}}
function addSupply(n=1,label='Reveal Effect'){state();g.partySupplies33615=Math.max(0,Number(g.partySupplies33615||0)+Number(n||0));log(`${label}: party gains ${n} Supply. Party Supply: ${g.partySupplies33615}.`)}
function addGold(n,label='Reveal Effect'){g.gold=Math.max(0,Number(g.gold||0)+Number(n||0));log(`${label}: party gains ${n} Gold.`)}
function addArmorNextTurn(h,n=1,label='Reveal Effect'){const b=heroBuff(h);if(Number(b.roundArmorRound)!==Number(g.round))b.roundArmorBonus=0;b.roundArmorRound=g.round;b.roundArmorBonus=Number(b.roundArmorBonus||0)+n;log(`${label}: ${heroDisplayName(h)} gains +${n} Armor until the start of their next turn.`)}
function addRoundArmor(h,n=1,label='Reveal Effect'){const b=heroBuff(h);if(Number(b.roundArmorRound)!==Number(g.round))b.roundArmorBonus=0;b.roundArmorRound=g.round;b.roundArmorBonus=Number(b.roundArmorBonus||0)+n;log(`${label}: ${heroDisplayName(h)} gains +${n} Armor until end of Round ${g.round}.`)}
function addRoundAttack(h,n=1,label='Reveal Effect'){const b=heroBuff(h);if(Number(b.roundAttackRound)!==Number(g.round))b.roundAttackBonus=0;b.roundAttackRound=g.round;b.roundAttackBonus=Number(b.roundAttackBonus||0)+n;log(`${label}: ${heroDisplayName(h)} gains +${n} Attack until end of Round ${g.round}.`)}
function addNextAttack(h,n=1,label='Reveal Effect'){const b=heroBuff(h);b.nextAttackRound=g.round;b.nextAttackBonus=Number(b.nextAttackBonus||0)+n;log(`${label}: ${heroDisplayName(h)}'s next Attack this round gains +${n} Attack.`)}
function inspire(h,label='Reveal Effect'){try{grantInspired(h)}catch(_){try{addHeroCondition(h,'Inspired')}catch(__){}}log(`${label}: ${heroDisplayName(h)} gains Inspired until the end of their next turn.`)}
function sourceTags(tile){return [tile?.terrain,tile?.type,tile?.region,...(Array.isArray(tile?.traits)?tile.traits:[])].filter(Boolean).map(String)}
function sourceLoot(h,tile,label){try{const c=drawLootForHero(h,{tags:sourceTags(tile)});if(c)log(`${label}: ${c.name} was added to ${heroDisplayName(h)}'s Inventory.`);return c}catch(_){return null}}
function inspectPoolOne(label){if(!(g.pool||[]).length){log(`${label}: no unrevealed Location remains in the active Quest Location Stack.`);return}const c=g.pool[0];if(confirm(`${label}\nTop Location: ${c.id||''} — ${c.name}.\n\nPut it on the bottom?`)){g.pool.push(g.pool.shift());log(`${label}: ${c.name} moved to the bottom of the Location Stack.`);syncPool()}else log(`${label}: ${c.name} remains on top of the Location Stack.`)}
function reorderTop(list,n,label,onChanged){if(!list?.length){log(`${label}: deck is empty.`);return}const a=list.slice(0,Math.min(n,list.length));if(a.length<2){alert(`${label}: ${a[0]?.name||'No card'}`);return}const raw=prompt(`${label}\n${a.map((c,i)=>`${i+1}. ${c.id?c.id+' — ':''}${c.name}`).join('\n')}\n\nEnter the new order (example: 2,1). Cancel keeps the current order.`);if(raw===null||!raw.trim())return;const ix=raw.split(',').map(x=>Number.parseInt(x.trim(),10)-1);if(ix.length!==a.length||new Set(ix).size!==a.length||ix.some(i=>i<0||i>=a.length)){log(`${label}: invalid order; deck was not changed.`);return}list.splice(0,a.length,...ix.map(i=>a[i]));log(`${label}: top ${a.length} cards reordered.`);onChanged?.()}
function inspectEncOne(label){if(!(g.encDeck||[]).length){log(`${label}: Encounter Deck is empty.`);return}const c=g.encDeck[0];if(confirm(`${label}\nTop Encounter: ${c.name}.\n\nPut it on the bottom?`)){g.encDeck.push(g.encDeck.shift());log(`${label}: ${c.name} moved to the bottom of the Encounter Deck.`);syncEncounter()}else log(`${label}: ${c.name} remains on top of the Encounter Deck.`)}
function connectedDestinations(h){const p=heroPosFull(h),from=g.tiles?.[key(p.x,p.y)];if(!from)return[];const dirs=[['N',0,-1,'S'],['E',1,0,'W'],['S',0,1,'N'],['W',-1,0,'E']];return dirs.map(([d,dx,dy,op])=>{const x=p.x+dx,y=p.y+dy,t=g.tiles?.[key(x,y)];return t&&from.edges?.[d]&&t.edges?.[op]?{x,y,t}:null}).filter(Boolean)}
function freeMove(h,label){const ds=connectedDestinations(h);if(!ds.length){log(`${label}: ${heroDisplayName(h)} has no connected revealed Location to Move to.`);return false}if(!confirm(`${label}: ${heroDisplayName(h)} may immediately Move 1 Location without spending an Action. Move now?`)){log(`${label}: free Move declined.`);return false}let d=ds[0];if(ds.length>1){const raw=prompt(`${label}: choose destination\n${ds.map((q,i)=>`${i+1}. ${q.t.name}`).join('\n')}`);if(raw===null)return false;d=ds[Number.parseInt(raw,10)-1];if(!d)return false}enterHeroLocation(h,d.x,d.y,label);log(`${label}: ${heroDisplayName(h)} moves to ${d.t.name} without spending an Action.`);return true}
function startRevealSearch(h,x,y,label,discardAfter=false,consumeSearch=false){
  if(discardAfter)state().searchFollowup={hero:h,discard:true,label};
  const opts={source:label,consumeSearch};
  const r=window.startFreeLocationSearch?.(h,x,y,opts);
  return r;
}
function homeBase(tile,label='Home Base'){
  const st=state(),quest=String(g?.campaign?.currentQuest||g?.currentQuest||'standalone'),stamp=`${quest}:${g?.campaign?.day??''}`;
  if(st.homeBaseStamp===stamp){log(`${label}: already resolved for this Quest.`);return}
  st.homeBaseStamp=stamp;
  const pos=Object.entries(g.tiles||{}).find(([,t])=>t?.id==='L000');if(!pos)return;
  const [x,y]=pos[0].split(',').map(Number);for(const h of heroes()){const p=heroPosFull(h);if(p.x===x&&p.y===y){const s=heroState(h);if(s&&Number(s.hp)<Number(s.maxHp??14)&&confirm(`${label}: ${heroDisplayName(h)} may recover 1 Health. Recover it?`))heal(h,1,label)}}
}
const HANDLERS={
  poolTop1:({label})=>inspectPoolOne(label),
  freeMove:({hero,label})=>freeMove(hero,label),
  encTop1:({label})=>inspectEncOne(label),
  workingHeat:({hero,label})=>{if(confirm(`${label}: choose +1 Attack until end of round?\nOK = +1 Attack\nCancel = +1 Armor`))addRoundAttack(hero,1,label);else addRoundArmor(hero,1,label)},
  armorNextTurn:({hero,label})=>addArmorNextTurn(hero,1,label),
  healSelf1:({hero,label})=>{if(confirm(`${label}: ${heroDisplayName(hero)} may recover 1 Health. Recover it?`))heal(hero,1,label)},
  nextAttack1:({hero,label})=>addNextAttack(hero,1,label),
  inspired:({hero,label})=>inspire(hero,label),
  freeSearch:({hero,x,y,label})=>{if(confirm(`${label}: immediately Search this Location without spending an Action?`))startRevealSearch(hero,x,y,label,false,true)},
  goldOrSupply:({label})=>{if(confirm(`${label}: choose reward.\nOK = 10 Gold\nCancel = 1 Supply`))addGold(10,label);else addSupply(1,label)},
  healOrCleanse:({hero,label})=>{if(confirm(`${label}: choose effect.\nOK = recover 1 Health\nCancel = remove 1 harmful Condition`))heal(hero,1,label);else cleanse(hero,label)},
  poolTop2:({label})=>reorderTop(g.pool||[],2,label,syncPool),
  healChosen1:({label})=>{if(!confirm(`${label}: one Hero may recover 1 Health. Use this effect?`)){log(`${label}: recovery declined.`);return}const h=chooseHero(heroes(),`${label}: choose one Hero to recover 1 Health`);if(h)heal(h,1,label)},
  drawSearch:({hero,x,y,label})=>startRevealSearch(hero,x,y,label,false,false),
  encTop2:({label})=>reorderTop(g.encDeck||[],2,label,syncEncounter),
  cleanseOrSearch:({hero,x,y,label})=>{if(confirm(`${label}: choose effect.\nOK = remove 1 harmful Condition\nCancel = draw 1 Search card`))cleanse(hero,label);else startRevealSearch(hero,x,y,label,false,false)},
  poolAndEncTop1:({label})=>{inspectPoolOne(`${label} — Location`);inspectEncOne(`${label} — Encounter`)},
  discardOrDamage:({hero,label})=>{let hand;try{hand=hero==='Aldric'?g.heroHand:hero==='Lyra'?g.lyraHand:hero==='Seraphine'?g.seraphineHand:runtimeHeroState(hero)?.hand}catch(_){hand=[]}if(hand?.length&&confirm(`${label}: discard 1 Hero card to avoid 1 damage?`)){if(searchDiscardHeroCard(hero))log(`${label}: ${heroDisplayName(hero)} discards 1 Hero card and suffers no damage.`);else suffer(hero,1,label)}else suffer(hero,1,label)},
  supplyOrEncounter:({label})=>{if(confirm(`${label}: choose effect.\nOK = gain 1 Supply\nCancel = inspect the top Encounter card`))addSupply(1,label);else inspectEncOne(label)},
  drawSearchDiscard:({hero,x,y,label})=>startRevealSearch(hero,x,y,label,true,false),
  supplyOrGold:({label})=>{if(confirm(`${label}: choose reward.\nOK = 1 Supply\nCancel = 10 Gold`))addSupply(1,label);else addGold(10,label)},
  cleanseSelf:({hero,label})=>{if(confirm(`${label}: ${heroDisplayName(hero)} may remove 1 harmful Condition. Remove one?`))cleanse(hero,label)},
  loot:({hero,tile,label})=>sourceLoot(hero,tile,label),
  homeBase:({tile,label})=>homeBase(tile,label),
  goldOrSearch:({hero,x,y,label})=>{if(confirm(`${label}: choose reward.\nOK = 10 Gold\nCancel = draw 1 Search card`))addGold(10,label);else startRevealSearch(hero,x,y,label,false,false)}
};
function labelFrom(text){const i=text.indexOf(' — ');return i>0?text.slice(0,i):'Reveal Effect'}
function run(tile,x,y,hero){const text=genericText(tile),kind=PATTERNS[text];if(!kind||!HANDLERS[kind])return false;const label=labelFrom(text);HANDLERS[kind]({tile,x,y,hero,label,text});sync();return true}

// New v10.52 locations use this complete generic dispatcher. Scenario Reveal suffixes remain
// owned by genericQuestReveal/campaign modules and are intentionally not re-executed here.
const revealBefore=window.resolveLocationReveal;
window.resolveLocationReveal=function(tile,x,y,hero){
  if(!tile||tile.revealResolved)return;
  if(!NEW_LOCATION_IDS.has(String(tile.id||'')))return revealBefore.apply(this,arguments);
  const text=tile.reveal||'None.';tile.revealResolved=true;log(`REVEAL EFFECT — ${tile.name}: ${text}`);
  if(!run(tile,x,y,hero))log(`REVEAL EFFECT WARNING — ${tile.id} generic effect is not mapped: ${genericText(tile)}`);
  sync();
};

// Search-card rewards created by Reveal Effects must not consume the Location's normal Search.
const resolveSearchBefore=window.resolveSearch;
window.resolveSearch=async function(){
  const pending=pSearch,follow=state().searchFollowup;
  const out=resolveSearchBefore.apply(this,arguments);if(out&&typeof out.then==='function')await out;
  if(follow&&pending&&!pSearch){state().searchFollowup=null;if(follow.discard){if(searchDiscardHeroCard(follow.hero))log(`${follow.label}: ${heroDisplayName(follow.hero)} discards 1 Hero card after resolving the Search card.`);else log(`${follow.label}: ${heroDisplayName(follow.hero)} has no Hero card to discard.`)}sync()}
  return out;
};

// Reveal Attack/Armor buffs integrate with both the legacy Heroes and all runtime Heroes.
function wrapArmor(name,heroFromArgs){const f=window[name];if(typeof f!=='function')return;window[name]=function(...args){return Number(f.apply(this,args)||0)+roundArmor(heroFromArgs(...args))}}
wrapArmor('aldricArmor',()=> 'Aldric');wrapArmor('lyraArmor',()=> 'Lyra');wrapArmor('seraphineArmor',()=> 'Seraphine');wrapArmor('extraArmor',(h)=>h);
const activeAttackBefore=window.activeAttackValue;if(typeof activeAttackBefore==='function')window.activeAttackValue=function(){const h=controlledHero();return Number(activeAttackBefore.apply(this,arguments)||0)+attackBonus(h)};
const attackBefore=window.attack;if(typeof attackBefore==='function')window.attack=function(){const h=controlledHero(),before=Number(heroActionCount?.(h)??activeActions?.()??0),had=nextAttack(h)>0,r=attackBefore.apply(this,arguments),after=Number(heroActionCount?.(h)??activeActions?.()??0);if(had&&after<before)consumeNextAttack(h);return r};
const rtAttackBefore=window.runtimeHeroAttackEnemy;if(typeof rtAttackBefore==='function')window.runtimeHeroAttackEnemy=function(h,c,q,bonus=0,ignoreArmor=0){const had=nextAttack(h)>0,r=rtAttackBefore.call(this,h,c,q,Number(bonus||0)+attackBonus(h),ignoreArmor);if(had)consumeNextAttack(h);return r};
const aldricAttackBefore=window.aldricCardAttack;if(typeof aldricAttackBefore==='function')window.aldricCardAttack=function(e,label){const b=attackBonus('Aldric'),had=nextAttack('Aldric')>0,base=window.aldricBaseAttackValue;if(b&&typeof base==='function')window.aldricBaseAttackValue=function(){return Number(base.apply(this,arguments)||0)+b};let r;try{r=aldricAttackBefore.apply(this,arguments)}finally{window.aldricBaseAttackValue=base}if(had)consumeNextAttack('Aldric');return r};
const lyraAttackBefore=window.lyraAttackEnemy;if(typeof lyraAttackBefore==='function')window.lyraAttackEnemy=function(e,label,bonus=0){const had=nextAttack('Lyra')>0,r=lyraAttackBefore.call(this,e,label,Number(bonus||0)+attackBonus('Lyra'));if(had)consumeNextAttack('Lyra');return r};
const seraAttackBefore=window.seraphineAttackEnemy;if(typeof seraAttackBefore==='function')window.seraphineAttackEnemy=function(e,label,bonus=0,ignoreArmor=false){const had=nextAttack('Seraphine')>0,r=seraAttackBefore.call(this,e,label,Number(bonus||0)+attackBonus('Seraphine'),ignoreArmor);if(had)consumeNextAttack('Seraphine');return r};

// Stonebrook is a starting tile, so its Reveal Effect does not pass through Explore placement.
function applyHomeBaseIfNeeded(){try{const entry=Object.entries(g?.tiles||{}).find(([,t])=>t?.id==='L000');if(entry){const [x,y]=entry[0].split(',').map(Number);homeBase(entry[1],'Home Base');sync()}}catch(_){}}
const initBefore=window.init;if(typeof initBefore==='function')window.init=function(){const r=initBefore.apply(this,arguments);try{state().homeBaseStamp=null;applyHomeBaseIfNeeded()}catch(_){}return r};
const startQuestBefore=window.startCampaignQuest;if(typeof startQuestBefore==='function')window.startCampaignQuest=function(){try{state().homeBaseStamp=null}catch(_){}const r=startQuestBefore.apply(this,arguments);Promise.resolve(r).finally(()=>setTimeout(applyHomeBaseIfNeeded,0));return r};

// Keep the new generic party Supply resource visible anywhere the Hero summary is rendered.
const renderBefore=window.render;if(typeof renderBefore==='function')window.render=function(){const r=renderBefore.apply(this,arguments);try{state();const gold=document.getElementById('gold');if(gold){let row=document.getElementById('partySupply33615');if(!row){row=document.createElement('div');row.id='partySupply33615';row.innerHTML='Party Supply <b class="partySupplyValue33615">0</b>';gold.parentElement?.insertAdjacentElement('afterend',row)}const v=row.querySelector('.partySupplyValue33615');if(v)v.textContent=String(g.partySupplies33615||0)}}catch(_){}return r};

function audit(){
  let rows=0,unhandled=[];const src=globalThis.ascLocationText33614||{};
  for(const id of NEW_LOCATION_IDS){const text=genericText({reveal:src[id]?.reveal||g?.tiles&&Object.values(g.tiles).find(t=>t?.id===id)?.reveal||''});if(!text)continue;rows++;if(!PATTERNS[text])unhandled.push({id,text})}
  return {build:V,workbook:'v10.52',patterns:Object.keys(PATTERNS).length,newLocationIds:NEW_LOCATION_IDS.size,rowsChecked:rows,unhandled,supplies:Number(g?.partySupplies33615||0)};
}
globalThis.ascRevealRuntime33615={version:V,patterns:{...PATTERNS},genericText,handlerFor:text=>PATTERNS[norm(text)]||null,run,audit,applyHomeBaseIfNeeded,attackBonus,roundArmor};
globalThis.ascendanceRevealRuntimeAudit33615=audit;
function boot(){try{state()}catch(_){}window.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;const e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}
boot();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);setTimeout(boot,250);setTimeout(boot,1800);setTimeout(boot,5200);setTimeout(boot,8200);
})();
