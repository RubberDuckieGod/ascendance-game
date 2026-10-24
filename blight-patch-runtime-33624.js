// WE014 Blight Patches: shared healing suppression and a one-Action cleanse.
(()=>{
'use strict';
const R=globalThis.ascBlightEncounterRules33624;if(!R)return;
const wrapped=new Set();
const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&(mpConnected()||document.querySelector('#mpMode')?.value!=='local');
function phaseWorker(){const turn=globalThis.ascRoomTurn33618?.state?.(),job=globalThis.ascendance3322?.()?.phaseJob;return remote()&&!!turn?.resolving&&(turn.resolverRole||job?.resolverRole)===mpRole}
function healingWindow(h,fn){
 const b=R.body(g,h),p=R.position(g,h),t=p&&g.tiles?.[p.x+','+p.y];
 if(!b||g.campaign?.activeEvent!=='WE014'||!(Number(t?.blightPatches33624)>0)||wrapped.has(b)||(remote()&&!phaseWorker()))return fn();
 const descriptor=Object.getOwnPropertyDescriptor(b,'hp');
 if(descriptor?.configurable===false)return fn();
 let value=b.hp;const read=()=>descriptor?.get?descriptor.get.call(b):value;
 const write=n=>{if(descriptor?.set)descriptor.set.call(b,n);else value=n};
 wrapped.add(b);
 try{
  Object.defineProperty(b,'hp',{configurable:true,enumerable:descriptor?.enumerable!==false,get:read,set(next){
   const before=Number(read()),requested=Number(next),actual=Math.max(0,requested-before),allowed=R.reduceHealing(g,h,actual);
   write(actual>0?before+allowed:next);
   if(allowed<actual)log(`Blight Patch: the first Health recovered here this Round is reduced by 1 (${heroDisplayName(h)} recovers ${allowed}).`);
  }});
  return fn();
 }finally{
  const final=read();if(descriptor){if('value'in descriptor)Object.defineProperty(b,'hp',{...descriptor,value:final});else Object.defineProperty(b,'hp',descriptor)}else{delete b.hp;b.hp=final}
  wrapped.delete(b);
 }
}
function permitted(h){
 if(!g||h!==controlledHero()||!partyHeroes().includes(h)||heroDefeated(h)||g.phase!=='Hero Phase'||g.campaign?.downtime||pLoc||pSearch||pEnc||!mpCanControl(h))return false;
 if(!remote())return true;if(!mpConnected()||!mpJoinReady)return false;const turn=globalThis.ascRoomTurn33618?.state?.();return !!turn&&turn.turnHero===h&&!turn.resolving&&!turn.passed?.[h];
}
async function cleanse(h=controlledHero()){
 if(!permitted(h)){const error='Start your own living Hero’s turn without a pending prompt before cleansing a Blight Patch.';log(error);return {error}}
 if(remote())return globalThis.ascMechanics33621.command('CLEANSE_BLIGHT',{},h);
 const result=R.cleanse(g,h,{log});if(result.error)log(result.error);render();mpScheduleState();return result;
}
function controls(){
 const panel=document.getElementById('mechanicsActions33621');if(!panel||!g)return;
 document.getElementById('cleanseBlight33624')?.remove();
 const h=controlledHero(),p=R.position(g,h),t=p&&g.tiles?.[p.x+','+p.y];if(!(Number(t?.blightPatches33624)>0))return;
 const button=document.createElement('button');button.id='cleanseBlight33624';button.textContent='Cleanse Blight Patch · 1 Action';
 button.disabled=!permitted(h)||heroActionCount(h)<1||(t.enemies||[]).some(e=>Number(e.hp)>0);button.onclick=()=>cleanse(h);panel.appendChild(button);
}
function markers(){
 for(const old of document.querySelectorAll('.ascBlightMarker33624'))old.remove();
 for(const tile of document.querySelectorAll('#board .tile[data-key]')){
  const count=Number(g?.tiles?.[tile.dataset.key]?.blightPatches33624)||0;if(count<=0)continue;
  const badge=document.createElement('span');badge.className='ascBlightMarker33624';
  badge.style.cssText='position:absolute;right:3px;top:2px;z-index:3;display:inline-flex;align-items:center;gap:1px;padding:0 2px;border:1px solid #b3c66c;border-radius:5px;background:#25351e;color:#e3edb9;font-size:10px;line-height:12px;pointer-events:auto';
  badge.innerHTML='<svg viewBox="0 0 20 16" width="14" height="12" aria-hidden="true"><path d="M2 10C2 3 16 1 18 10Z" fill="currentColor"/><path d="M8 10v5h4v-5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="3" cy="2" r="1" fill="currentColor"/><circle cx="17" cy="2" r="1" fill="currentColor"/></svg>';
  const label=document.createElement('span');label.textContent=`×${count}`;badge.appendChild(label);
  const text=`${count} Blight Patch${count===1?'':'es'}. During WE014, the first Health recovered here each Round is reduced by 1. Cleanse one patch for 1 Action when no Enemy is here.`;
  badge.setAttribute('role','img');badge.setAttribute('aria-label',text);badge.title=text;tile.appendChild(badge);
 }
}
function install(){
 if(!globalThis.ascMechanics33621?.render){setTimeout(install,10);return}
 for(const name of ['healHeroBy','searchHeal','damageHeroBy']){const before=window[name];if(typeof before==='function')window[name]=function(h){const args=arguments;return healingWindow(h,()=>before.apply(this,args))}}
 const mechanics=globalThis.ascMechanicsRules33621;if(mechanics){const before=mechanics.action;mechanics.action=function(game,h,op){const args=arguments;return game===g&&op==='REST'?healingWindow(h,()=>{const hp=Number(R.body(g,h)?.hp||0),result=before.apply(this,args);if(!result.error)result.heal=Math.max(0,Number(R.body(g,h)?.hp||0)-hp);return result}):before.apply(this,args)}}
 const beforeRender=window.render;window.render=function(){const out=beforeRender.apply(this,arguments);controls();markers();return out};controls();markers();globalThis.ascBlightPatch33624.ready=true;
}
globalThis.ascBlightPatch33624={cleanse,render:controls,phaseWorker};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>queueMicrotask(install),{once:true});else install();
})();
