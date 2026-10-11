(()=>{
'use strict';
const V='3.36.1';
function G(){try{return typeof g!=='undefined'?g:(globalThis.g||null)}catch(_){return globalThis.g||null}}
function heroLevel(h){try{return Number(globalThis.ascLevel3360?.level?.(h)||G()?.levels?.[h]||1)}catch(_){return Number(G()?.levels?.[h]||1)}}
function display(h){try{return typeof heroDisplayName==='function'?heroDisplayName(h):h}catch(_){return h}}
function isRowan(h){return h==='Rowan'}
function pool(){let gg=G();return Array.isArray(gg?.pool)?gg.pool:null}
function cardLabel(t){return `${t?.id||'Location'} — ${t?.name||'Unknown Location'}`}
function syncPool(){
  try{
    if(typeof mpConnected==='function'&&mpConnected()&&typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof sendCommand==='function'){
      const order=(pool()||[]).map(t=>typeof cardKey==='function'?cardKey(t):(t?.id||t?.name||''));
      sendCommand('EXPLORE_REORDER_POOL',{order},false);
    }else if(typeof mpScheduleState==='function')mpScheduleState();
  }catch(e){try{diag('TRAILBLAZER_SYNC_ERROR_3361',{error:String(e?.stack||e)})}catch(_){}}
}
function currentRevealHero(){
  let gg=G();
  try{
    if(gg?.specialLocationReveal?.hero)return gg.specialLocationReveal.hero;
    if(gg?.pendingExploreHero3257)return gg.pendingExploreHero3257;
    if(gg?.oldRangerSignalReveal32562&&typeof controlledHero==='function')return controlledHero();
    return typeof controlledHero==='function'?controlledHero():gg?.activeHero;
  }catch(_){return gg?.activeHero}
}
function usedThisRound(){let gg=G();return Number(gg?.heroAbilityRuntime3361?.rowanTrailblazerRound||0)===Number(gg?.round||0)}
function markUsed(){let gg=G();if(!gg)return;gg.heroAbilityRuntime3361=gg.heroAbilityRuntime3361||{};gg.heroAbilityRuntime3361.rowanTrailblazerRound=Number(gg.round||0)}
function triggerTrailblazer(){
  const gg=G(),deck=pool();if(!gg||!deck||!deck.length||usedThisRound())return false;
  const L=heroLevel('Rowan'),name=L>=5?'Master Trailblazer':L>=3?'Improved Trailblazer':'Trailblazer';
  const use=confirm(`${name} — after Rowan Explores or Reveals a Location, inspect the top of the Exploration Deck?`);
  if(!use)return false;
  markUsed();
  if(L<3){
    const top=deck[0];
    const leave=confirm(`${name}\n\nTop Location: ${cardLabel(top)}\n\nOK = leave it on top\nCancel = place it on the bottom`);
    if(!leave&&deck.length>1){deck.push(deck.shift());log(`HERO ABILITY — ${name}: Rowan inspects ${top.name} and places it on the bottom of the Exploration Deck.`)}
    else log(`HERO ABILITY — ${name}: Rowan inspects ${top.name} and leaves it on top of the Exploration Deck.`);
  }else{
    const a=deck[0],b=deck[1];
    if(!b){log(`HERO ABILITY — ${name}: Rowan inspects ${a.name}; it is the only Location remaining and stays on top.`)}
    else{
      let raw=prompt(`${name} — inspect the top 2 Locations:\n\n1. ${cardLabel(a)}\n2. ${cardLabel(b)}\n\nChoose which Location stays on TOP (1 or 2). The other goes to the bottom.`,`1`);
      let pick=String(raw||'1').trim()==='2'?2:1;
      if(pick===2){deck.splice(0,2,b);deck.push(a);log(`HERO ABILITY — ${name}: Rowan places ${b.name} on top and ${a.name} on the bottom of the Exploration Deck.`)}
      else {deck.splice(0,2,a);deck.push(b);log(`HERO ABILITY — ${name}: Rowan leaves ${a.name} on top and places ${b.name} on the bottom of the Exploration Deck.`)}
    }
  }
  syncPool();
  try{render()}catch(_){}
  return true;
}
function wrapPlace(){
  const old=window.place;if(typeof old!=='function'||String(old).includes('TRAILBLAZER3361'))return;
  window.place=async function(){/* TRAILBLAZER3361 */
    const h=currentRevealHero();
    const gg=G(),beforeTiles=Object.keys(gg?.tiles||{}).length;
    const out=await old.apply(this,arguments);
    try{
      // Only a committed placement may trigger the innate. Rejected/cancelled placement must not consume it.
      const afterTiles=Object.keys(G()?.tiles||{}).length;
      if(isRowan(h)&&afterTiles>beforeTiles&&pool()&&G()?.phase==='Hero Phase')triggerTrailblazer();
    }catch(e){try{diag('TRAILBLAZER_ERROR_3361',{hero:h,error:String(e?.stack||e)})}catch(_){}}
    return out;
  };
  // Keep lexical/global references aligned for older inline handlers that call `place(...)` directly.
  try{place=window.place}catch(_){}
}
function install(){wrapPlace();globalThis.ascHeroAbilityRuntime3361={version:V,triggerTrailblazer,usedThisRound};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,120));else setTimeout(install,120);
setTimeout(install,1200);setTimeout(install,2600);
})();
