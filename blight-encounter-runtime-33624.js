// Blight Spores uses the existing authored damage/reaction pipeline, staged in an
// isolated game clone. A connected room commits the complete outcome once.
(()=>{
'use strict';
const clone=value=>JSON.parse(JSON.stringify(value));
const rules=()=>window.ascBlightEncounterRules33624;
// The solo lobby updates the mode control without opening a connection. A
// persisted remote prompt still requires its room after a disconnect.
const remote=()=>pEnc?.roomAuthority3305===true||(typeof mpMode!=='undefined'&&mpMode==='remote'&&(mpConnected()||document.querySelector('#mpMode')?.value!=='local'));
let busy=false,installed=false;
function fail(message){log(`Blight Spores: ${message}`);if(typeof showLootNotice==='function')showLootNotice('Blight Spores not resolved',message);return {error:message}}
function heroOf(p){return p.roomHero3300||p.hero||p.origin?.hero||controlledHero()}
function cardZones(game,h){if(h==='Aldric')return {hand:game.heroHand||[],discard:game.heroDiscard||[]};if(h==='Lyra')return {hand:game.lyraHand||[],discard:game.lyraDiscard||[]};if(h==='Seraphine')return {hand:game.seraphineHand||[],discard:game.seraphineDiscard||[]};const st=game.heroRuntimeStates?.[h]||game.extraHeroes?.[h];return {hand:st?.hand||[],discard:st?.discard||[]}}
function body(game,h){return h==='Aldric'?game:h==='Lyra'?game.lyra:h==='Seraphine'?game.seraphine:game.heroRuntimeStates?.[h]||game.extraHeroes?.[h]}
function choose(p){
 const h=heroOf(p),plan=rules().preview(g,p,{}).plan,choice={};
 if(plan?.requiresChoice||plan?.band===0){
  const hand=plan?.hand||cardZones(g,h).hand;
  if(hand.length){
   const raw=prompt(`Blight Spores — choose 1 card to discard, or 0 for no effect:\n${hand.map((c,i)=>`${i+1}. ${c.name||c.id}`).join('\n')}`,'1');
   if(raw===null)return {cancelled:true};
   const n=Number(raw);if(!Number.isInteger(n)||n<0||n>hand.length)return {error:'Choose a listed card, or 0 for no effect.'};
   if(n)choice.discardUid=String(hand[n-1].uid||'');else choice.noEffect=true;
  }else choice.noEffect=true;
 }
 return choice;
}
function renderPlan(){
 const panel=document.querySelector('#encPanel');let note=document.querySelector('#blightSeverityNote33624');
 if(!pEnc||pEnc.card?.id!=='EN061'){note?.remove();return}
 const plan=rules()?.preview(g,pEnc,{}).plan;if(!plan||!panel)return;
 if(!note){note=document.createElement('div');note.id='blightSeverityNote33624';note.className='muted';note.style.marginTop='8px';panel.appendChild(note)}
 const band=['1–2','3–4','5–6','7+'][plan.band],text=pEnc.card[['a','b','c','d'][plan.band]]||'';
 const effect=document.querySelector('#encEffect');if(effect)effect.textContent=plan.cureIgnored?'First Cure Distilled ignores this Spore Hazard.':text;
 note.textContent=`Resolves the Severity ${band} effect.${plan.scaled?' Blight pressure makes the first Spore Hazard this Quest one band stronger.':''} Reward: 1 Moonleaf (Herb material).`;
}
function stage(p,choice){
 const live=g,trial=clone(g),messages=[],saved=new Map(),applying=window.ascApplyingRoom33621,mode=typeof mpMode==='undefined'?undefined:mpMode;
 const quiet=['render','renderInventory','mpScheduleState','mpSend','showLootNotice'];
 try{
  g=trial;window.ascApplyingRoom33621=true;if(mode!==undefined)mpMode='local';
  for(const key of quiet){saved.set(key,window[key]);window[key]=()=>{}}
  saved.set('log',window.log);window.log=message=>messages.push(String(message));
  const result=rules().apply(trial,p,choice,{log:message=>messages.push(String(message)),damage:(h,n,unavoidable)=>{
   const st=body(trial,h),before=Number(st?.hp||0);if(!st)return 0;
   if(unavoidable){
    st.hp=Math.max(0,before-Number(n||0));log(`Blight Spores Hazard: ${heroDisplayName(h)} suffers ${before-st.hp} unavoidable damage.`);
    handleHeroZero(h);
    // After-damage innates still trigger; prevention and refund windows do not.
    window.ascHeroRuntime3362?.afterDamage?.(h,before-st.hp,'Blight Spores Hazard — unavoidable damage');
   }else damageHeroBy(h,n,'Blight Spores Hazard');
   return Math.max(0,before-Number(st.hp||0));
  }});
  for(const key of ['roomAuthority3300','resourceAuthority3310','heroAuthority3303','explorationAuthority3305','campaignAuthority3321','combatAuthority3301','phaseAuthority3311']){if(Object.prototype.hasOwnProperty.call(live,key))trial[key]=clone(live[key]);else delete trial[key]}
  return result?.error||result?.ok===false?{error:result.error||result.reason||'The encounter could not be resolved.'}:{trial,result,messages};
 }catch(error){return {error:String(error?.message||error)}}
 finally{
  g=live;if(mode!==undefined)mpMode=mode;window.ascApplyingRoom33621=applying;
  for(const [key,value]of saved)window[key]=value;
 }
}
function applyPacket(packet){
 const applying=window.ascApplyingRoom33621;window.ascApplyingRoom33621=true;
 try{
  if(packet.state)window.mpHandleMessage({type:'STATE',room:mpRoom,from:'SERVER',data:packet.state});
  if(packet.resource)window.mpHandleMessage({type:'RESOURCE_STATE',room:mpRoom,from:'SERVER',data:packet.resource});
  if(packet.heroState)window.mpHandleMessage({type:'HERO_STATE',room:mpRoom,from:'SERVER',data:packet.heroState});
  if(packet.exploration)window.ascExplorationApply33615?.(packet.exploration,'blight-encounter-result');
  window.ascResourceLedger33621?.rebase?.();window.ascHeroLedger33621?.rebase?.('blight-encounter-result');
 }finally{window.ascApplyingRoom33621=applying}
}
async function resolve(){
 if(busy)return {pending:true};if(!pEnc||pEnc.card?.id!=='EN061')return null;
 if(!rules()?.apply)return fail('Rules are still loading. Try again.');
 if(remote()&&(!mpConnected()||!mpJoinReady))return fail('Reconnect before resolving this Encounter.');
 const pending=pEnc,choice=choose(pending);if(choice.cancelled)return choice;if(choice.error)return fail(choice.error);
 const base={encounterSerial33621:pending.encounterSerial33621||g.mechanics33621?.encounterSerial,baseExploreSeq:window.ascendance3305?.().exploreSeq,baseResourceSeq:window.ascendance3312?.().resourceSeq,baseHeroSeq:window.ascendance3303?.().heroSeq};
 const staged=stage(pending,choice);if(staged.error)return fail(staged.error);
 busy=true;
 try{
  if(remote()){
   const ack=await window.ascExplorationCommand33615('ENCOUNTER_RESOLVE',{...base,blightChoice:choice,blightOutcome:{game:staged.trial}},true);
   if(ack)applyPacket(ack);
   if(!ack||ack.rejected){if(!ack){mpSend('REQUEST_STATE',{});mpSend('REQUEST_EXPLORATION_STATE',{})}return fail(ack?.reason||'Connection timed out. Reconnect to confirm the saved result.');}
  }else{
   g=staged.trial;g.encDiscard??=[];g.encDiscard.push(clone(pending.card));
   const key=pending.firstVisitTileKey||pending.origin?.firstVisitTileKey;if(key&&g.tiles?.[key])g.tiles[key].visited=true;
  }
  if(pEnc===pending)pEnc=null;
  document.querySelector('#encPanel')?.classList.add('hidden');
  for(const message of staged.messages)log(message);
  log(`Encounter resolved: EN061 Blight Spores — ${pending.card[['a','b','c','d'][staged.result?.plan?.band]]||pending.text||''}`);
  render();if(!remote())mpScheduleState();return staged.result;
 }finally{busy=false;render()}
}
function install(){
 if(installed)return;if(!rules()?.apply||!window.ascMechanics33621||typeof window.resolveEnc!=='function'){setTimeout(install,25);return}
 installed=true;const before=window.resolveEnc;
 window.resolveEnc=function(){return pEnc?.card?.id==='EN061'?resolve():before.apply(this,arguments)};
 const button=document.querySelector('#resolveEnc');if(button)button.onclick=()=>window.resolveEnc();
 const renderBefore=window.render;window.render=function(){const out=renderBefore.apply(this,arguments);renderPlan();return out};
 window.ascBlightEncounter33624={pending:()=>busy,stage,resolve,rules:rules()};
}
install();
})();
