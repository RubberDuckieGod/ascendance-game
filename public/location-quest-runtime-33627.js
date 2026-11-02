// Visible one-time Reveal state and Q003's authoritative, persistent armory action.
(()=>{
'use strict';
const R=window.ascLocationQuestRules33627;
let installed=false,pending=false,tracked=null,lastGame=null;
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&mpConnected();
function itemText(q){const reward=q?.armoryReward33627,def=reward&&equipmentById(reward.item);return reward?`${reward.item} — ${def?.name||reward.name||reward.item}`:''}
function renderStatus(){
 if(typeof g==='undefined'||!g)return;
 const current=activeTile?.(),labels=document.querySelectorAll('#locPanel .locationRuleTitle33614');
 for(const el of labels)if(/^(?:First )?Reveal(?: Effect)?/.test(el.textContent||'')){const home=current?.id==='L000'&&!!g.revealRuntime33615?.homeBaseStamp;el.textContent=`First Reveal · ${current?.revealResolved||current?.firstReveal33627||home?'Resolved once':'On placement only'}`;el.title='Resolve once when this Location is first revealed. Entering or revisiting does not repeat this effect.'}
 let button=document.getElementById('q003Armory3304'),panel=document.getElementById('questObjectivePanel');
 if(!panel)return;
 if(!button){button=document.createElement('button');button.id='q003Armory3304';button.className='primary';document.getElementById('lightBeacon')?.parentElement?.appendChild(button)}
 const q=g.campaign?.q003,available=R.active(g),isQ003=g.campaign?.currentQuest==='Q003';
 button.style.display=isQ003&&!g.campaign?.downtime?'':'none';button.textContent=q?.armoryOpened3304?'Sealed Armory · Opened':'Open Sealed Armory · 1 Action';button.onclick=openArmory;
 const allowed=R.armoryEligibility(g,controlledHero()),turn=window.ascRoomTurn33618?.state?.();
 button.disabled=pending||!available||!allowed.ok||remote()&&(!turn||turn.turnHero!==controlledHero()||turn.resolving||turn.passed?.[controlledHero()]);button.title=allowed.ok?'Return LT118 Watchtower Vault Key and draw 1 Equipment Card.':allowed.reason;
 let notice=document.getElementById('q003ArmoryStatus33627');
 if(!notice){notice=document.createElement('div');notice.id='q003ArmoryStatus33627';notice.setAttribute('role','status');notice.style.cssText='margin-top:8px;padding:8px 10px;border:1px solid #a98b48;border-radius:6px;background:#292316;line-height:1.5';panel.appendChild(notice)}
 notice.style.display=isQ003&&!g.campaign?.downtime?'':'none';notice.replaceChildren();
 if(!isQ003)return;
 const title=document.createElement('strong'),detail=document.createElement('div');
 if(q?.armoryOpened3304){title.textContent=`Armory reward found: ${itemText(q)}`;detail.textContent='Added to Inventory. Equip it from Inventory & Equipment.';const inv=document.createElement('button');inv.textContent='View Armory Equipment';inv.onclick=()=>openInventory();notice.append(title,detail,inv)}
 else if((g.partyQuestItems||[]).includes(R.keyId)){title.textContent='Quest Item Found · LT118 Watchtower Vault Key';detail.textContent='At Fallen Watchtower: spend 1 Action to open the sealed armory, return the key, and draw 1 Equipment Card. Available during Victory Exploration.';notice.append(title,detail)}
 else{title.textContent='Sealed Armory · Key not found';detail.textContent='Defeat a Goblin Raider to find LT118 Watchtower Vault Key. Use it at Fallen Watchtower for 1 Action to draw 1 Equipment Card.';notice.append(title,detail)}
}
function announce(result){
 if(!result)return;
 if(result.opened&&result.reward){const e=equipmentById(result.reward.item);showLootNotice(`Armory Equipment Found · ${result.reward.item} — ${e?.name||result.reward.name}`,`${heroDisplayName(result.reward.hero)} gained this Equipment. Open Inventory to equip it.`)}
}
async function openArmory(){
 if(pending)return {error:'The sealed armory is awaiting the room.'};
 const h=controlledHero(),allowed=R.armoryEligibility(g,h);if(!allowed.ok){log(allowed.reason);renderStatus();return {error:allowed.reason}}
 if(pLoc||pSearch||pEnc)return {error:'Resolve the pending prompt before opening the sealed armory.'};
 pending=true;renderStatus();
 try{
  const result=remote()?await window.ascMechanics33621.command('OPEN_Q003_ARMORY',{},h):R.openArmory(g,h,{equipmentById});
  if(!result?.error){announce(result);render();mpScheduleState()}return result;
 }finally{pending=false;renderStatus()}
}
function defeated(h,en){
 if(remote())return {awarded:false,awaitingRoom:true};
 const result=R.awardRaiderKey(g,h,en);announce(result);return result;
}
function capture(){if(typeof g==='undefined'||!g)return;lastGame=g;tracked={campaign:JSON.parse(JSON.stringify(g.campaign||{})),tiles:{previous:{enemies:R.captureRaiders(g)}}}}
function killSnapshot(){return {campaign:JSON.parse(JSON.stringify(g.campaign||{})),tiles:{previous:{enemies:R.captureRaiders(g)}}}}
function install(){
 if(installed)return;if(!R||!window.ascMechanics33621||!window.ascQuestTransition33626?.ready?.()){setTimeout(install,25);return}installed=true;
 window.q003OpenArmory3304=openArmory;
 for(const name of ['creditKill3259','recordKill32521']){const before=window[name];if(typeof before!=='function')continue;window[name]=function(h,en){const out=before.apply(this,arguments);if(Number(en?.hp)<=0)defeated(h,en);return out}}
 // Some historical attacks close over a private kill-credit function. Hold the
 // pre-action identity list until that complete action returns, including when
 // its final kill triggers Quest completion and several nested renders.
 for(const name of ['attack','playHandCard','playLyraCard','playSeraphineCard','playExtraCard','heroBasicAttackFor','extraDealDirect','aldricCardAttack','runtimeHeroAttackEnemy','lyraAttackEnemy','seraphineAttackEnemy','endTurn']){
  const before=window[name];if(typeof before!=='function')continue;
  window[name]=function(){if(remote()||typeof g==='undefined'||!g)return before.apply(this,arguments);const game=g,previous=killSnapshot(),hero=controlledHero(),finish=()=>{if(g===game){const result=R.reconcileDefeats(previous,g,hero);if(result.awarded){announce(result);renderStatus();mpScheduleState()}}};let out;try{out=before.apply(this,arguments)}catch(error){finish();throw error}if(out&&typeof out.then==='function')return out.finally(finish);finish();return out};
 }
 const reveal=window.resolveLocationReveal;
 window.resolveLocationReveal=function(tile,x,y,h){if(!tile||tile.revealResolved||tile.firstReveal33627)return;const out=reveal.apply(this,arguments);if(tile.revealResolved){R.markReveal(g,`${x},${y}`,h);if(remote())window.ascExplorationCommand33615?.('REVEAL_RESOLVE',{tileKey:`${x},${y}`},false);mpScheduleState()}return out};
 const beforeRender=window.render;
 window.render=function(){
  if(typeof g!=='undefined'&&g&&!remote()&&g===lastGame&&tracked){const result=R.reconcileDefeats(tracked,g,controlledHero());announce(result)}
  capture();const out=beforeRender.apply(this,arguments);renderStatus();return out;
 };
 const receive=window.mpHandleMessage;
 window.mpHandleMessage=function(m){const out=receive.apply(this,arguments);if(m?.room===mpRoom){const meta=m.data?.locationQuest33627;if(meta?.quest==='Q003'&&g?.campaign?.currentQuest==='Q003'){g.campaign.q003??={};for(const field of ['vaultKeyClaimed3304','armoryOpened3304','vaultKeyReceipt33627','armoryReward33627'])if(Object.prototype.hasOwnProperty.call(meta,field))g.campaign.q003[field]=JSON.parse(JSON.stringify(meta[field]))}if(['STATE','ROOM_STATE','RESOURCE_STATE','COMBAT_STATE','MECHANICS_COMMAND_ACK','ADVENTURE_RESUME'].includes(m.type))renderStatus()}return out};
 window.ascLocationQuest33627={rules:R,openArmory,defeated,render:renderStatus,pending:()=>pending};capture();renderStatus();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
