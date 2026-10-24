// The browser is the authored reaction worker, as it is for room phase jobs.
// The room checks ledger sequences before accepting this scoped outcome. This
// boundary conserves resources; it does not independently certify every reaction.
'use strict';
const same=require('node:util').isDeepStrictEqual;
const clone=v=>JSON.parse(JSON.stringify(v)),own=(x,k)=>Object.prototype.hasOwnProperty.call(x||{},k);
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];
const pos=(g,h)=>h==='Aldric'?g.hero:body(g,h);
const zones=(g,h)=>h==='Aldric'?{deck:g.heroDeck||[],hand:g.heroHand||[],discard:g.heroDiscard||[]}:h==='Lyra'?{deck:g.lyraDeck||[],hand:g.lyraHand||[],discard:g.lyraDiscard||[]}:h==='Seraphine'?{deck:g.seraphineDeck||[],hand:g.seraphineHand||[],discard:g.seraphineDiscard||[]}:{deck:body(g,h)?.deck||[],hand:body(g,h)?.hand||[],discard:body(g,h)?.discard||[]};
const reactionIds=new Set(['H003-008','H003-010','H003-020','H004-011','H010-017','H012-013','H012-014','H013-015','H014-012','H014-013','H015-018','H016-015']);
const bodyFields=['hp','actions','conditions','equipmentLoot33612','attackedSinceTurn','bloodrageBonus','bloodrageRound','lastEnemyAttacker329','noHealEnemyTurn33611','temporalStasis33611'];
function bounded(v,d=0){if(d>9)return false;if(v===null||typeof v==='boolean')return true;if(typeof v==='number')return Number.isFinite(v)&&Math.abs(v)<=1e13;if(typeof v==='string')return v.length<=500&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);if(Array.isArray(v))return v.length<=128&&v.every(x=>bounded(x,d+1));return !!v&&typeof v==='object'&&Object.keys(v).length<=256&&Object.entries(v).every(([k,x])=>!['__proto__','constructor','prototype'].includes(k)&&k.length<=180&&bounded(x,d+1))}
function copyField(to,from,k){if(own(from,k))to[k]=clone(from[k]);else delete to[k]}
function differencePaths(a,b,path='game',out=[],depth=0){if(out.length>=40||same(a,b))return out;if(depth>20||a===null||b===null||typeof a!=='object'||typeof b!=='object'){out.push(path);return out}for(const key of new Set([...Object.keys(a),...Object.keys(b)])){differencePaths(a[key],b[key],path+'.'+key,out,depth+1);if(out.length>=40)break}return out}
const cardKey=c=>c?.uid?String(c.uid):JSON.stringify(c);
const cardSet=z=>['deck','hand','discard'].flatMap(k=>z[k]||[]).map(c=>JSON.stringify(c)).sort();
function newDiscard(b,a){const held=new Set((b.hand||[]).map(cardKey));return (a.discard||[]).filter(c=>held.has(cardKey(c))&&!(b.discard||[]).some(x=>cardKey(x)===cardKey(c)))}
const equip=(g,h,id)=>Object.values(g.equipped?.[h]||{}).flat().includes(id);
const hasItem=(g,id)=>(g.partyHeroes||[]).some(h=>(g.inventory?.[h]||[]).some(r=>r.id===id&&r.qty>0));
function validate(g,p,choice,outcome){
 try{
  const R=require('./blight-encounter-rules-33624.js');let out=outcome?.game;
  if(!g||p?.card?.id!=='EN061'||!out||typeof out!=='object'||Array.isArray(out))return {error:'Missing Blight encounter outcome.'};
  if(JSON.stringify(out).length>8*1024*1024)return {error:'Blight outcome is too large.'};
  const expected=clone(g),party=g.partyHeroes||[],affected=[];
  const result=R.apply(expected,p,choice,{damage:(h,n,unavoidable)=>{affected.push({hero:h,n,unavoidable:!!unavoidable});return 0}});
  if(result?.error||result?.ok===false)return {error:result.error||result.reason||'Invalid Blight choice.'};
  // Optimistic STATUS messages can make these cached client envelopes newer or
  // older than the room. They are never worker-authored game effects.
  out=clone(out);for(const key of ['roomAuthority3300','resourceAuthority3310','heroAuthority3303','explorationAuthority3305','campaignAuthority3321','combatAuthority3301','phaseAuthority3311','adventureLog'])copyField(out,expected,key);
  // Rendering the profession panel lazily inserts its four zero counters. Their
  // absence on the room means the same zero progress, not a gameplay mutation.
  const mastery=out.campaign?.professionMastery3280,canonicalMastery=expected.campaign?.professionMastery3280;
  if(mastery)for(const key of ['Blacksmithing','Alchemy','Enchanting','Artificing'])if(!own(canonicalMastery,key)&&mastery[key]===0)delete mastery[key];
  if(!own(expected.campaign,'professionMastery3280')&&mastery&&Object.keys(mastery).length===0)delete out.campaign.professionMastery3280;
  for(const key of ['professionCraftedThisDowntime3280','downtimeActivities3252','researchPrep3252'])if(!own(expected.campaign,key)&&same(out.campaign?.[key],{}))delete out.campaign[key];
  const c=expected.campaign||{},last=c.lastQuestOutcome||{},downtimeToken=`${last.quest||c.currentQuest||'NONE'}:${last.day||c.day||0}:${last.outcome||'NONE'}`;
  if(out.campaign?.downtimeActivityToken3252===downtimeToken&&same(out.campaign?.downtimeActivities3252||{},expected.campaign?.downtimeActivities3252||{}))copyField(out.campaign,expected.campaign||{},'downtimeActivityToken3252');
  if(!own(expected,'extraTurns33621')&&same(out.extraTurns33621,{used:{},active:{}}))delete out.extraTurns33621;
  const professions=out.heroProfessions;
  if(professions){
   const heroes=new Set(['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha']);
   for(const [h,row]of Object.entries(professions))if(heroes.has(h)){
    for(const key of ['Blacksmithing','Alchemy','Enchanting','Artificing'])if(!own(expected.heroProfessions?.[h],key)&&same(row[key],{tier:'I',progress:0}))delete row[key];
    if(!own(expected.heroProfessions,h)&&Object.keys(row).length===0)delete professions[h];
   }
   if(!own(expected,'heroProfessions')&&Object.keys(professions).length===0)delete out.heroProfessions;
  }
  const accepted=clone(expected),targets=new Set(affected.map(row=>row.hero)),spent=new Map();
  // Full card identities, including UIDs and printed rules, remain conserved.
  for(const h of party){
   const b=zones(expected,h),a=zones(out,h);
   if(!['deck','hand','discard'].every(k=>Array.isArray(a[k]||[])&&(a[k]||[]).length<=5000)||!same(cardSet(b),cardSet(a)))return {error:'Blight reactions must conserve every Hero card and UID.'};
   const cards=newDiscard(b,a);if(cards.length>4||cards.some(c=>!reactionIds.has(c.id)))return {error:'Only damage-window Reaction cards may be spent by Blight.'};
   spent.set(h,{cards,cost:cards.reduce((n,c)=>n+Math.max(0,Number(c.cost)||0),0)});
  }
  const used=id=>party.some(h=>spent.get(h).cards.some(c=>c.id===id));
  const anyReaction=party.some(h=>spent.get(h).cards.length>0);
  for(const h of party){
   const before=zones(expected,h),after=zones(out,h);
   if(!anyReaction&&!same(before,after))return {error:'Blight cannot draw or reorder Hero cards without a Reaction.'};
   if(anyReaction){
    const prefix=before.deck||[],rest=after.deck||[],drawn=prefix.length-rest.length;
    if(drawn>=0&&drawn<=prefix.length){
     if(drawn>2||!same(prefix.slice(drawn),rest))return {error:'Blight Reaction draws must consume at most two cards from the top of the Hero Deck.'};
    }else if(prefix.length>=2)return {error:'Blight cannot reshuffle a nonempty Hero Deck.'};
    const newHand=(after.hand||[]).filter(c=>!(before.hand||[]).some(old=>cardKey(old)===cardKey(c)));
    if(newHand.length>2)return {error:'Blight Reaction draws exceeded their supported window.'};
   }
  }
  for(const h of party){
   const b=body(expected,h),a=body(out,h),d=body(accepted,h);if(!b||!a||!d)return {error:'Blight cannot change the party bodies.'};
   const actionCount=Number(a.actions??b.actions??0),priorActions=Number(b.actions??0);
   if(!Number.isInteger(actionCount)||actionCount!==Math.max(0,priorActions-spent.get(h).cost))return {error:'Blight Reaction Action costs do not match the discarded cards.'};
   for(const key of bodyFields)if(!same(b[key],a[key])){if(!bounded(a[key]))return {error:'Invalid Blight reaction tracking data.'};copyField(d,a,key)}
   const bp=pos(expected,h)||{},ap=pos(out,h)||{},dp=pos(accepted,h);
   if(!same({x:bp.x,y:bp.y},{x:ap.x,y:ap.y})){
    const stasis=ap.x===9999&&ap.y===9999&&used('H004-011');
    const move=Number.isInteger(ap.x)&&Number.isInteger(ap.y)&&!!g.tiles?.[`${ap.x},${ap.y}`]&&(used('H003-020')||spent.get(h).cards.some(c=>c.id==='H015-018'));
    if(!stasis&&!move)return {error:'Blight cannot move this Hero without a legal Reaction.'};dp.x=ap.x;dp.y=ap.y;
   }
   const cond=a.conditions||[],priorCond=b.conditions||[];
   if(!Array.isArray(cond)||cond.length>32||!bounded(cond)||cond.some(c=>!priorCond.some(x=>same(x,c))&&(typeof c==='string'?c:c?.name)!=='Inspired'))return {error:'Blight cannot add an unrelated Status.'};
   const z=zones(out,h);
   if(h==='Aldric'){accepted.heroDeck=clone(z.deck||[]);accepted.heroHand=clone(z.hand||[]);accepted.heroDiscard=clone(z.discard||[])}
   else if(h==='Lyra'){accepted.lyraDeck=clone(z.deck||[]);accepted.lyraHand=clone(z.hand||[]);accepted.lyraDiscard=clone(z.discard||[])}
   else if(h==='Seraphine'){accepted.seraphineDeck=clone(z.deck||[]);accepted.seraphineHand=clone(z.hand||[]);accepted.seraphineDiscard=clone(z.discard||[])}
   else for(const key of ['deck','hand','discard'])d[key]=clone(z[key]||[]);
  }
  for(const h of party){
   const b=body(g,h),before=Number(b?.hp||0),after=Number(body(out,h)?.hp||0),hit=affected.find(row=>row.hero===h);
   if(!Number.isInteger(after)||after<0||after>99)return {error:'Invalid Blight Health.'};
   const floor=targets.has(h)?Math.max(0,before-1):before;
   const oath=h==='Seraphine'&&Number(g.levels?.Seraphine||1)>=12&&out.heroAbilityRuntime3362?.quest?.['Seraphine::Immortal Oath'];
   if(after<floor&&!(oath&&after>=Math.max(0,before-3)))return {error:'Blight dealt damage to an unrelated Hero or exceeded its authored damage.'};
   if(hit?.unavoidable&&after!==Math.max(0,before-1))return {error:'Unavoidable Blight damage cannot be reduced or prevented.'};
   if(after>before){
    const fatal=targets.has(h)&&before===1,max=Math.max(1,Number(b?.maxHp||({Aldric:14,Lyra:8,Seraphine:11}[h])||before));
    const phoenix=fatal&&hasItem(g,'LT157')&&!g.campaign?.phoenixHeartSpent33612&&out.campaign?.phoenixHeartSpent33612===true&&after<=max;
    const meter=pos(g,h),tile=meter&&g.tiles?.[`${meter.x},${meter.y}`],suppressed=g.campaign?.activeEvent==='WE014'&&Number(tile?.blightPatches33624)>0&&tile.blightHealingSuppressedRound33624!==String(g.round)&&out.tiles?.[`${meter.x},${meter.y}`]?.blightHealingSuppressedRound33624===String(g.round);
    const wand=fatal&&equip(g,h,'EQ075')&&!equip(out,h,'EQ075')&&after===Math.ceil(max/2)-Number(suppressed);
    const miracle=fatal&&party.includes('Elara')&&Number(g.levels?.Elara||1)>=6&&after<=3;
    const immortal=fatal&&party.includes('Seraphine')&&Number(g.levels?.Seraphine||1)>=12&&after<=3&&out.heroAbilityRuntime3362?.quest?.['Seraphine::Immortal Oath'];
    if(!phoenix&&!wand&&!miracle&&!immortal)return {error:'Blight cannot grant unrelated healing.'};
   }
  }
  // Damage protections consume their existing bounded runtime namespaces. The
  // authored worker remains responsible for choosing the applicable reactions.
  if(!same(expected.heroAbilityRuntime3362,out.heroAbilityRuntime3362)){
   const state=out.heroAbilityRuntime3362;if(!bounded(state)||Object.keys(state||{}).some(k=>!['round','quest','turn','buffs','counters','flags'].includes(k)))return {error:'Invalid Blight Ability state.'};accepted.heroAbilityRuntime3362=clone(state);
  }
  const ec=expected.campaign||{},sc=out.campaign||{},ac=accepted.campaign||(accepted.campaign={});
  if(!same(ec.levelRuntime3360,sc.levelRuntime3360)){
   const state=sc.levelRuntime3360;if(!bounded(state)||!state||state.quest!==g.campaign?.currentQuest||Object.keys(state.hero||{}).some(h=>!party.includes(h)))return {error:'Invalid Blight level Ability state.'};
   for(const k of ['quest','round','roundStart'])if(ec.levelRuntime3360&&own(ec.levelRuntime3360,k)&&!same(ec.levelRuntime3360[k],state[k]))return {error:'Blight cannot reset level progression tracking.'};ac.levelRuntime3360=clone(state);
  }
  if(!same(ec.heroFates,sc.heroFates)){
   const fates=sc.heroFates;if(!bounded(fates))return {error:'Invalid Blight Hero fate.'};
   for(const h of new Set([...Object.keys(ec.heroFates||{}),...Object.keys(fates||{})])){const f=fates?.[h];if(same(ec.heroFates?.[h],f))continue;if(!targets.has(h)||Number(body(out,h)?.hp)!==0||!['Downed','Lost'].includes(f?.status)||f.quest!==g.campaign.currentQuest||f.day!==g.campaign.day)return {error:'Blight cannot replace an unrelated Hero fate.'};}ac.heroFates=clone(fates);
  }
  if(!same(ec.phoenixHeartSpent33612,sc.phoenixHeartSpent33612)){if(sc.phoenixHeartSpent33612!==true||!hasItem(g,'LT157')||ec.phoenixHeartSpent33612)return {error:'Invalid Phoenix Heart use.'};ac.phoenixHeartSpent33612=true}
  if(!same(expected.asc329,out.asc329)){
   const pieces=out.asc329;if(!bounded(pieces))return {error:'Invalid Blight piece state.'};const copy=clone(expected.asc329||{});
   for(const type of ['bone','used'])if(!same(copy[type],pieces?.[type])){if(type==='bone')for(const k of new Set([...Object.keys(copy.bone||{}),...Object.keys(pieces?.bone||{})])){const before=Number(copy.bone?.[k]||0),after=Number(pieces?.bone?.[k]||0);if(!Number.isInteger(after)||after<0||after>before)return {error:'Blight may only consume existing Bone Servants.'};}copy[type]=clone(pieces?.[type]||{})}
   if(!same(copy,pieces))return {error:'Blight cannot change unrelated summoned pieces.'};accepted.asc329=copy;
  }
  if(!same(expected.equipped,out.equipped)){
   const gear=clone(expected.equipped||{});for(const h of party)if(equip(g,h,'EQ075')&&!equip(out,h,'EQ075')){const row=gear[h]||{};for(const k of ['Weapon','Offhand','Shield','Armor'])if(row[k]==='EQ075')row[k]=null;if(Array.isArray(row.Accessory))row.Accessory=row.Accessory.filter(id=>id!=='EQ075')}
   if(!same(gear,out.equipped))return {error:'Blight cannot change unrelated Equipment.'};accepted.equipped=gear;
  }
  if(!same(expected.equipmentAutoHit33613,out.equipmentAutoHit33613)){
   const prior=expected.equipmentAutoHit33613||{lastRound:Number(g.round||1),encounterUsed:{},roundUsed:{},movedRound:{},lastEmber:{}},state=out.equipmentAutoHit33613;
   if(!state||!bounded(state)||Object.keys(state).some(k=>!['lastRound','encounterUsed','roundUsed','movedRound','lastEmber'].includes(k))||state.lastRound!==Number(g.round||1)||!same(prior.roundUsed,state.roundUsed)||!same(prior.movedRound,state.movedRound))return {error:'Invalid Blight Equipment trigger state.'};
   const expectedState=clone(prior);
   for(const h of party){const key=h+':EQ119:LastEmber';if(!same(prior.encounterUsed?.[key],state.encounterUsed?.[key])||!same(prior.lastEmber?.[h],state.lastEmber?.[h])){
    const hp=Number(body(out,h)?.hp||0),max=Number(body(g,h)?.maxHp||({Aldric:14,Lyra:8,Seraphine:11}[h])||99);
    if(!targets.has(h)||!equip(g,h,'EQ119')||hp<=0||hp>max/2||hp>=Number(body(g,h)?.hp||0)||state.encounterUsed?.[key]!==true||!same(state.lastEmber?.[h],{expiresRound:Number(g.round||0)+1}))return {error:'Invalid Last Ember damage trigger.'};
    expectedState.encounterUsed[key]=true;expectedState.lastEmber[h]=clone(state.lastEmber[h]);
   }}
   if(!same(expectedState,state))return {error:'Blight cannot change unrelated Equipment triggers.'};accepted.equipmentAutoHit33613=clone(state);
  }
  for(const [key,tile]of Object.entries(g.tiles||{})){
   const after=out.tiles?.[key],prior=tile.blightHealingSuppressedRound33624;
   if(same(prior,after?.blightHealingSuppressedRound33624))continue;
   const healing=party.some(h=>{
    const p=pos(out,h),hp=Number(body(g,h)?.hp||0);if(!p||`${p.x},${p.y}`!==key||!targets.has(h))return false;
    const fatal=hp===1,phoenix=fatal&&hasItem(g,'LT157')&&!g.campaign?.phoenixHeartSpent33612&&out.campaign?.phoenixHeartSpent33612===true;
    const wand=fatal&&equip(g,h,'EQ075')&&!equip(out,h,'EQ075');
    const miracle=fatal&&((Number(g.levels?.Elara||1)>=6&&party.includes('Elara'))||(Number(g.levels?.Seraphine||1)>=12&&out.heroAbilityRuntime3362?.quest?.['Seraphine::Immortal Oath']));
    const escape=spent.get(h).cards.some(c=>c.id==='H015-018')&&Number(g.levels?.Thorne||1)>=13;
    return phoenix||wand||miracle||escape;
   });
   if(g.campaign?.activeEvent!=='WE014'||Number(tile.blightPatches33624)<=0||after?.blightHealingSuppressedRound33624!==String(g.round)||prior===String(g.round)||!healing)return {error:'Blight healing suppression changed without a legal healing Reaction.'};
   accepted.tiles[key].blightHealingSuppressedRound33624=String(g.round);
  }
  // Economy, map, Enemies, progression and all other state must match the pure
  // encounter transition. Only it may grant the Herb or place the Blight Patch.
  if(!same(accepted,out))return {error:'Blight outcome changed state outside its authored effect and reaction window at '+differencePaths(accepted,out).join(', ')+'.'};
  return {trial:accepted,result:{...result,damage:affected.map(row=>({...row,dealt:Math.max(0,Number(body(g,row.hero)?.hp||0)-Number(body(accepted,row.hero)?.hp||0))}))}};
 }catch(error){return {error:`Invalid Blight outcome: ${String(error?.message||error)}`}}
}
module.exports={validate};
