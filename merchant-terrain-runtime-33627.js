// Keep printed merchant outcomes and Sure Footing connected to actual state changes.
(()=>{
'use strict';
const R=globalThis.ascMerchantTerrainRules33627;
if(!R)return;
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof mpConnected==='function'&&mpConnected();
let installed=false,purchasePending=false;
function redraw(){window.renderInventory?.();window.render?.();window.mpScheduleState?.()}
function fail(message){log(message);window.showLootNotice?.('Purchase not completed',message);return {error:message}}
function spendDifficultMove(h,from){
 const b=R.body(g,h);if(!b||Number(b.actions)<1)return false;
 if(!isDifficult(from)||b.difficultPrepared)return true;
 if(R.useCharm(g,h)){log(`TRAVELER'S CHARM — Sure Footing: ${heroDisplayName(h)} ignores the additional Move Action required to leave ${from.name} this Round.`);return true}
 if(Number(b.actions)<2){log(`DIFFICULT TERRAIN: ${heroDisplayName(h)} needs 2 Move Actions available to leave ${from.name}.`);window.render?.();return false}
 b.actions--;b.difficultPrepared=true;log(`DIFFICULT TERRAIN: ${heroDisplayName(h)} spends 1 Move Action overcoming ${from.name} and does not move. A second Move Action is required to leave.`);window.render?.();window.mpScheduleState?.();return false;
}
function install(){
 if(installed)return;installed=true;
 window.spendDifficultMove33627=spendDifficultMove;
 const access=window.merchantAccess;
 window.merchantAccess=function(h){const legacy=access.apply(this,arguments);if(g?.campaign?.downtime&&legacy?.ok===false)return legacy;if(g?.activeMerchant?.closed){const p=R.position(g,h);if(p&&g.activeMerchant.locationKey===`${p.x},${p.y}`)return R.access(g,h)||{ok:false,reason:'This merchant offer has been used.',rarities:[]}}return R.offer(g,h)?R.access(g,h):legacy};
 const price=window.merchantPrice;
 window.merchantPrice=function(a,def){if(g?.campaign?.downtime!==true&&R.offer(g,inventoryHero())){const quote=R.quote(g,inventoryHero(),def.id);if(!quote.error)return quote.price}return price.apply(this,arguments)};
 const buy=window.merchantBuyEquipment;
 async function purchase(h,id,kind='equipment'){
  // Downtime's existing Resource transaction validates optional-shop Reputation perks.
  if(g?.campaign?.downtime===true)return kind==='equipment'?buy.call(this,h,id):fail('This Item offer is available during the adventure.');
  if(purchasePending)return {pending:true};
  if(!mpCanControl(h)||h!==controlledHero()||heroDefeated(h)||g?.phase!=='Hero Phase')return fail('Use your living Hero during Hero Phase to buy Equipment.');
  if(pLoc||pSearch||pEnc)return fail('Resolve the current prompt before buying Equipment.');
  const quoted=R.quote(g,h,id,kind);if(quoted.error)return fail(quoted.error);
  if(Number(g.gold||0)<quoted.price)return fail(`The party needs ${quoted.price} Gold to buy ${quoted.name}.`);
  purchasePending=true;
  try{
   const result=remote()?await window.ascMechanics33621.command('MERCHANT_BUY',{itemId:id,kind,baseResourceSeq:Number(window.ascendance3312?.().resourceSeq??-1),quotedPrice:quoted.price},h):R.purchase(g,h,id,kind);
   if(!result||result.error)return fail(result?.error||'The room did not confirm this purchase.');
   log(`SHOP: ${heroDisplayName(h)} buys ${result.name||quoted.name} for ${result.price??quoted.price} Party Gold.`);
   redraw();return result;
  }finally{purchasePending=false}
 }
 window.merchantBuyEquipment=(h,id)=>purchase(h,id,'equipment');
 window.merchantBuyLoot33627=(h,id)=>purchase(h,id,'loot');
 const merchantRender=window.renderMerchant;
 window.renderMerchant=function(){
  const out=merchantRender.apply(this,arguments),h=inventoryHero(),a=R.offer(g,h),list=document.querySelector('#merchantList'),filter=window.merchantFilter3351||{};
  if(!(a?.sourceCard==='SD080'||a?.sourceCard==='EN029'&&a.freeItem&&!a.freeUsed)||!list||!['All','Consumable'].includes(filter.type||'All'))return out;
  const query=String(filter.q||'').trim().toLowerCase();
  const rows=LOOT_CARDS.filter(d=>d.consumable&&(a.rarities||['Common']).includes(d.rarity)&&!d.quest&&(!query||[d.id,d.name,d.effect].join(' ').toLowerCase().includes(query))&&(!filter.rarity||filter.rarity==='All'||d.rarity===filter.rarity)&&(!filter.family||filter.family==='All')).map(d=>({d,q:R.quote(g,h,d.id,'loot')})).filter(({q})=>!q.error&&(!filter.affordable||Number(g.gold||0)>=q.price));
  if(!rows.length)return out;
  list.querySelector('.merchantEmpty3351')?.remove();
  for(const {d,q}of rows){const card=document.createElement('div');card.className='invCard';const name=document.createElement('b');name.textContent=d.name;const detail=document.createElement('div');detail.className='muted';detail.textContent=`${d.id} · Consumable · ${d.rarity} · Buy ${q.price} Gold`;const text=document.createElement('div');text.className='merchantAbility3351';text.textContent=d.effect;const button=document.createElement('button');button.textContent=q.price?`Buy ${q.price}`:'Buy FREE';button.disabled=Number(g.gold||0)<q.price;button.onclick=()=>window.merchantBuyLoot33627(h,d.id);card.append(name,detail,text,button);list.appendChild(card)}
  const count=document.querySelector('#merchantResultCount3351');if(count)count.textContent=`Showing ${list.querySelectorAll('.invCard').length} available items`;
  return out;
 };
 // The solo resolver owns its local offer; the room constructs its own from the
 // canonical pending card when ENCOUNTER_RESOLVE/SEARCH_RESOLVE commits.
 const resolve=window.resolveEnc;
 window.resolveEnc=async function(){
  const p=pEnc,network=remote();const result=await resolve.apply(this,arguments);
  if(!network&&p&&pEnc!==p&&['EN011','EN029'].includes(p.card?.id)){
   const active=g.activeEncounter320,token=active?.id===p.card.id?active.token:null;
   const enemies=token?Object.values(g.tiles||{}).flatMap(t=>t.enemies||[]).filter(e=>e.encounterToken===token):[];
   const offer=R.encounterOffer(g,p,enemies);if(offer?.error)log(offer.error);redraw();
  }
  if(p&&pEnc!==p&&(p.card?.id==='EN029'||p.card?.id==='EN011'&&Number(p.severity??p.roll)<=2)){log('Merchant access is available. Choose an available item in the shop and press Buy to purchase it.');window.openInventoryScreen?.('merchant')}
  return result;
 };
 const search=window.searchResolveWorkbook;
 if(typeof search==='function')window.searchResolveWorkbook=function(state,card,tile){const result=search.apply(this,arguments);if(card?.id==='SD080'){if(!remote())R.searchOffer(g,{...state,card,tileKey:`${state.x},${state.y}`});setTimeout(()=>{if(!pSearch&&!pEnc)window.openInventoryScreen?.('merchant')},0)}return result};
 const complete=window.encounterCompletion320;
 if(typeof complete==='function')window.encounterCompletion320=function(){const opened=!remote()&&R.completeGuardedOffer(g),result=complete.apply(this,arguments);if(opened){log('Merchant Under Guard: all listed Enemies are Defeated. Merchant access and the printed discount are available here.');redraw()}return result};
 const statuses=window.heroStatuses;
 window.heroStatuses=function(h){const out=statuses.apply(this,arguments).filter(s=>!String(s).startsWith("Traveler's Charm (Sure Footing used"));if(Number(R.body(g,h)?.travelersCharmRound??-1)===Number(g?.round))out.push("Traveler's Charm (Sure Footing used this Round)");return out};
 window.ascMerchantTerrain33627={version:R.version,rules:R,pending:()=>purchasePending,spendDifficultMove};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>queueMicrotask(install),{once:true});else install();
})();
