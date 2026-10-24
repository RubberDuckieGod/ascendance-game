// Downtime choices and their rewards are one room transaction, independent of Hero turns.
(()=>{
'use strict';
const requests=new Map();
let sequence=0,roomKey='',lastSequence=-1,installed=false,receiveBefore=null;
const G=()=>typeof g==='undefined'?null:g;
const R=()=>window.ascDowntimeRules33622;
const clone=value=>JSON.parse(JSON.stringify(value));
const remoteMode=()=>typeof mpMode!=='undefined'&&mpMode==='remote';
const connected=()=>remoteMode()&&typeof mpConnected==='function'&&mpConnected()&&!!mpJoinReady;
const currentRoom=()=>typeof mpRoom==='undefined'?'':String(mpRoom||'');
const name=hero=>typeof heroDisplayName==='function'?heroDisplayName(hero):hero;
function notice(title,message){if(typeof showLootNotice==='function')showLootNotice(title,message)}
function fail(message){notice('Downtime activity unavailable',message);return {error:message}}
function redraw(){
 if(typeof renderInventory==='function')renderInventory();
 if(typeof renderDowntimeActivities3252==='function')renderDowntimeActivities3252();
 if(typeof render==='function')render();
}
function finish(entry,result,announceResult=true){
 if(!requests.has(entry.id))return;
 requests.delete(entry.id);clearTimeout(entry.timer);
 if(announceResult){if(result?.error)fail(result.error);else announce(entry.hero,entry.type,entry.profession,result)}
 entry.resolve(result);redraw();
}
function resetRoom(){
 const next=remoteMode()?currentRoom():'';
 if(next===roomKey)return;
 roomKey=next;lastSequence=-1;
 for(const entry of [...requests.values()])finish(entry,{error:'The active game changed.'},false);
}
function announce(hero,type,profession,result={}){
 const row=result.activity||result.row||result;
 if(type==='Work'){
  if(typeof log==='function')log(`DOWNTIME: ${hero} works in Stonebrook and earns 25 Gold.`);
  notice(`${name(hero)} worked`,'Party gains 25 Gold.');
 }else if(type==='Gather'){
  const gained=(row.gained||result.gained||[]).map(value=>typeof value==='string'?value:value.name||value.id);
  if(typeof log==='function')log(`DOWNTIME: ${hero} gathers for ${profession} and gains ${gained.join(' + ')}.`);
  notice(`${name(hero)} gathered materials`,gained.join(' · '));
 }else if(type==='Research'){
  if(typeof log==='function')log(`DOWNTIME: ${hero} researches ${profession}. Next ${profession} craft receives up to 25 Gold discount.`);
  notice(`${name(hero)} researched ${profession}`,`Next ${profession} craft: up to 25 Gold discount.`);
 }else if(type==='Craft'){
  if(typeof log==='function')log(`DOWNTIME: ${hero} chooses Craft. Downtime crafting is enabled for this Hero.`);
  notice(`${name(hero)} chose Craft`,'Crafting is enabled for this Downtime. Profession progress still comes only from successful crafts.');
 }else if(type==='CraftRecipe'){
  const resultName=result.resultName||result.recipeId||'item';
  if(typeof log==='function')log(`CRAFTING: ${hero} crafts ${result.recipeId} — ${resultName} during Campaign Downtime${result.goldSpent?` · Spent ${result.goldSpent} Gold`:''}${result.researchDiscount?` · Research saves ${result.researchDiscount} Gold`:''}.`);
  notice(`${name(hero)} crafted ${resultName}`,`${result.profession||'Crafting'}${result.goldSpent?` · Spent ${result.goldSpent} Gold`:''}${result.researchDiscount?` · Research saves ${result.researchDiscount} Gold`:''}`);
 }
}
function applyCanonical(packet){
 const game=G(),state=packet?.downtime,resource=packet?.resource;
 if(!game||!state)return false;
 const incoming=Number(resource?.seq);
 const resourceSequence=Number(window.ascendance3312?.().resourceSeq??-1);
 if(!Number.isInteger(incoming)||incoming<Math.max(lastSequence,resourceSequence))return false;
 lastSequence=incoming;
 const applyingBefore=window.ascApplyingRoom33621;
 window.ascApplyingRoom33621=true;
 try{
  game.campaign=game.campaign||{};
  game.campaign.downtimeActivityToken3252=String(state.token||'');
  game.campaign.downtimeActivities3252=clone(state.activities||{});
  game.campaign.researchPrep3252=clone(state.research||{});
  if(state.craftFlags!==undefined)game.campaign.professionCraftedThisDowntime3280=clone(state.craftFlags);
  if(state.craftedSpecials!==undefined)game.craftedSpecials=clone(state.craftedSpecials);
  if(state.mastery!==undefined)game.campaign.professionMastery3280=clone(state.mastery);
  if(state.repPerks!==undefined)game.campaign.repPerks3360=clone(state.repPerks);
  if(resource?.resources)receiveBefore.call(window,{type:'RESOURCE_STATE',room:currentRoom(),from:'SERVER',data:resource});
  window.ascResourceLedger33621?.rebase?.();
 }finally{window.ascApplyingRoom33621=applyingBefore}
 return true;
}
function reconcileTimedOut(state,confirmed=false,receipts={}){
 if(!state)return;
 for(const entry of [...requests.values()]){
  if(!entry.timedOut)continue;
  if(entry.op==='CRAFT_RECIPE'){
   const result=receipts[entry.id]?.result;
   if(result)finish(entry,result);
   else if(confirmed)finish(entry,{error:'No craft was committed. Try crafting again.'});
   continue;
  }
  const row=state.token===entry.token?state.activities?.[entry.hero]:null;
  if(!row&&!confirmed)continue;
  finish(entry,row?{activity:row}:{error:'No activity was committed. Choose an activity again.'});
 }
}
function request(hero,type,profession='',extra={}){
 const token=R().token(G()),id=`DOWNTIME-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2,8)}`;
 return new Promise(resolve=>{
  const entry={id,hero,type,profession,token,...extra,resolve,timedOut:false};
  requests.set(id,entry);
  entry.timer=setTimeout(()=>{
   if(!requests.has(id))return;
   entry.timedOut=true;redraw();
   if(connected()){mpSend('REQUEST_DOWNTIME_STATE',{});mpSend('REQUEST_STATE',{})}
  },8000);
  redraw();
  try{mpSend('DOWNTIME_COMMAND',{id,hero,token,type,profession,...extra})}
  catch(_){finish(entry,{error:'Connection lost. Reconnect to confirm your activity.'})}
 });
}
async function choose(hero,type,profession=''){
 resetRoom();
 if(!R()||!G())return fail('Activities are still loading. Try again.');
 if(typeof mpCanControl==='function'&&!mpCanControl(hero))return fail('Choose an activity for your own Hero.');
 if([...requests.values()].some(entry=>entry.hero===hero))return {pending:true};
 if(remoteMode()){
  if(!connected())return fail('Reconnect to the party before choosing an activity.');
  const error=R().validate?.(G(),hero,type,profession);
  if(error)return fail(error);
  return request(hero,type,profession);
 }
 const result=R().act(G(),hero,type,profession);
 if(result?.error)return fail(result.error);
 announce(hero,type,profession,result);redraw();
 if(typeof mpScheduleState==='function')mpScheduleState();
 return result;
}
async function craft(recipeId){
 resetRoom();
 const hero=typeof inventoryHero==='function'?inventoryHero():controlledHero();
 if(!R()?.craft||!G())return fail('Crafting is still loading. Try again.');
 if(typeof mpCanControl==='function'&&!mpCanControl(hero))return fail('Craft with your own Hero.');
 if([...requests.values()].some(entry=>entry.hero===hero))return {pending:true};
 if(remoteMode()&&!connected())return fail('Reconnect to the party before crafting.');
 const preview=R().craftState?.(G(),hero,recipeId);
 if(preview?.error)return fail(preview.error);
 if(remoteMode())return request(hero,'CraftRecipe','',{op:'CRAFT_RECIPE',recipeId});
 const result=R().craft(G(),hero,recipeId);
 if(result?.error)return fail(result.error);
 announce(hero,'CraftRecipe',result.profession||'',result);redraw();
 if(typeof mpScheduleState==='function')mpScheduleState();
 return result;
}
function renderPending(){
 resetRoom();
 const panel=document.getElementById('downtimeActivityStatus');
 if(!panel||!G())return;
 const owed=G().campaign?.questRewardEquipmentOwed33622||[];
 for(const old of panel.querySelectorAll('[data-quest-equipment-owed]'))old.remove();
 if(owed.length){const status=document.createElement('div');status.dataset.questEquipmentOwed='1';status.setAttribute('role','status');status.className='craftReq';status.textContent='Unclaimed Quest rewards: '+owed.map(row=>`${row.quest}: ${name(row.hero)} is owed ${row.count||1} ${row.rarity} Equipment (no card available).`).join(' ');panel.appendChild(status)}
 const heroes=typeof partyHeroes==='function'?partyHeroes():G().partyHeroes||[];
 const cards=[...panel.querySelectorAll('.invCard')];
 cards.forEach((card,index)=>{
  const hero=heroes[index],entry=[...requests.values()].find(row=>row.hero===hero);
  if(!hero)return;
  card.dataset.downtimeHero33622=hero;
  const allowed=typeof mpCanControl!=='function'||mpCanControl(hero);
  for(const button of card.querySelectorAll('button'))button.disabled=!allowed||!!entry||(remoteMode()&&!connected());
  if(entry){
   const status=document.createElement('div');status.className='craftReq';status.dataset.downtimePending33622=entry.id;
   status.textContent=entry.timedOut?'Confirming with the party…':entry.op==='CRAFT_RECIPE'?'Crafting…':'Choosing activity…';
   status.setAttribute('role','status');card.appendChild(status);
  }
 });
}
function install(){
 if(installed)return;
 if(!R()||typeof window.chooseDowntimeActivity3252!=='function'||typeof window.mpHandleMessage!=='function')return;
 installed=true;window.chooseDowntimeActivity3252=choose;
 receiveBefore=window.mpHandleMessage;
 window.mpHandleMessage=function(message){
  resetRoom();
  if(message?.room===currentRoom()&&['DOWNTIME_COMMAND_ACK','DOWNTIME_COMMAND_REJECTED','DOWNTIME_STATE'].includes(message.type)){
   const packet=message.data||{};applyCanonical(packet);
   const entry=requests.get(String(packet.id||''));
   if(entry)finish(entry,message.type==='DOWNTIME_COMMAND_REJECTED'?{error:packet.reason||'The activity was refused.'}:packet.result||(entry.op==='CRAFT_RECIPE'?{error:'Reconnect to confirm the crafting result.'}:{activity:packet.downtime?.activities?.[entry.hero]}));
   else reconcileTimedOut(packet.downtime);
   redraw();return;
  }
  const out=receiveBefore.apply(this,arguments);
  if(message?.room===currentRoom()&&message.type==='RESOURCE_COMMAND_REJECTED'&&G()?.campaign?.downtime===true){
   // The legacy handler reapplies a queued optimistic snapshot after its rollback.
   // A refused downtime change must end at the server state before that queued flush.
   const applyingBefore=window.ascApplyingRoom33621;window.ascApplyingRoom33621=true;
   try{
    if(message.data?.resource)receiveBefore.call(this,{type:'RESOURCE_STATE',room:currentRoom(),from:'SERVER',data:message.data.resource});
    window.ascResourceLedger33621?.rebase?.();
   }finally{window.ascApplyingRoom33621=applyingBefore}
   notice('Downtime change was refused',message.data?.reason||'The party state changed. Try again.');redraw();
  }
  if(message?.room===currentRoom()&&['ROOM_STATE','STATE','STATE_REJECTED','ADVENTURE_START','ADVENTURE_RESUME'].includes(message.type)){
   const game=message.data?.game||message.data?.state?.game;
   if(game?.campaign){
    const campaign=game.campaign;
    reconcileTimedOut({token:campaign.downtimeActivityToken3252,activities:campaign.downtimeActivities3252||{}},true,game.downtimeAuthority33622?.commands||{});
   }
   renderPending();
  }
  return out;
 };
 const renderBefore=window.renderDowntimeActivities3252;
 window.renderDowntimeActivities3252=function(){const out=renderBefore.apply(this,arguments);renderPending();return out};
 const craftBefore=window.craftRecipe;
 if(typeof craftBefore==='function')window.craftRecipe=function(recipeId){return G()?.campaign?.downtime===true?craft(recipeId):craftBefore.apply(this,arguments)};
 const recipeBefore=window.recipeState;
 if(typeof recipeBefore==='function')window.recipeState=function(recipe,hero){
  if(G()?.campaign?.downtime!==true||!R()?.craftState)return recipeBefore.apply(this,arguments);
  const state=R().craftState(G(),hero,recipe.id),pending=[...requests.values()].some(entry=>entry.hero===hero);
  const error=state.error||(pending?'Wait for your current Downtime activity to finish.':remoteMode()&&!connected()?'Reconnect to the party before crafting.':typeof mpCanControl==='function'&&!mpCanControl(hero)?'Craft with your own Hero.':null);
  return {ok:!error,reasons:error?[error]:[],researchDiscount3252:state.researchDiscount||0,downtimeCraft33622:state};
 };
 window.ascDowntime33622={choose,craft,pending:()=>[...requests.values()].map(({id,hero,type,profession,token,timedOut,op,recipeId})=>({id,hero,type,profession,token,timedOut,op,recipeId})),version:'3.36.22'};
 renderPending();
}
install();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
})();
