/* Ascendance v10.59 named First Visit choices. Shared reducer; room validates multiplayer. */
(()=>{
'use strict';
const R=globalThis.ascFirstVisit1061;if(!R||globalThis.ascFirstVisitRuntime1061)return;
const game=()=>typeof g==='undefined'?null:g,hero=()=>typeof controlledHero==='function'?controlledHero():'';
const online=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof mpRoom!=='undefined'&&!!mpRoom;
const connected=()=>!online()||typeof mpConnected==='function'&&mpConnected()&&typeof mpJoinReady!=='undefined'&&mpJoinReady;
const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
const waiting=new Map();let busy=false,scheduled=false,installed=false,dialog=null,lastSignature='',currentOffer=null;
function pending(){const gg=game();return !!((typeof pLoc!=='undefined'&&pLoc)||(typeof pEnc!=='undefined'&&pEnc)||(typeof pSearch!=='undefined'&&pSearch)||globalThis.ascPartyResourceExtras1058?.pending?.(gg)||globalThis.ascHealingSummonsRules33627?.hasPending?.(gg,hero())||gg?.autoRoundResolving3259||globalThis.ascRoomPhaseWorker33625?.executing?.())}
function currentTurn(){return online()?globalThis.ascRoomTurn33618?.state?.()?.turnHero||null:hero()}
function options(){const gg=game();if(!gg||!hero()||gg.phase!=='Hero Phase')return [];return R.offers(gg,hero(),{turnHero:currentTurn(),requireActive:online()})}
function msg(x){if(typeof log==='function')log(String(x))}
function send(args){
 const gg=game(),h=hero();if(!gg)return Promise.resolve({error:'No active Quest.'});
 if(!connected())return Promise.resolve({error:'Reconnect to the room first.'});
 if(!online()){
  const trial=copy(gg);let result;try{result=R.execute(trial,h,args,{turnHero:currentTurn(),random:Math.random})}catch(_){result={error:'Invalid First Visit choice.'}}
  if(!result.error){Object.assign(gg,trial);window.render?.();window.mpScheduleState?.()}return Promise.resolve(result)
 }
 const id='FV1061-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 return new Promise(resolve=>{const timer=setTimeout(()=>{waiting.delete(id);resolve({error:'Room reply timed out. Refresh the room before retrying.'})},11000);waiting.set(id,out=>{clearTimeout(timer);resolve(out)});try{mpSend('MECHANICS_COMMAND',{id,hero:h,round:gg.round,op:'FIRST_VISIT_FEATURE_1061',...args})}catch(e){clearTimeout(timer);waiting.delete(id);resolve({error:String(e.message||e)})}})
}
function make(tag,txt){const e=document.createElement(tag);if(txt!=null)e.textContent=txt;return e}
function btn(txt,fn){const e=make('button',txt);e.type='button';e.onclick=fn;return e}
function close(){if(dialog?.open)try{dialog.close()}catch(_){}dialog?.remove();dialog=null;currentOffer=null;lastSignature=''}
async function commit(o,action,extra={}){if(busy)return;busy=true;try{const out=await send({feature:o.id,action,...extra});if(out?.error){msg(out.error);if(dialog?.open){const e=dialog.querySelector('[data-fv-error]');if(e)e.textContent=out.error}return}close()}finally{busy=false;schedule()}}
function show(o){
 const signature=JSON.stringify([o.id,o.stage,o.target,o.options,o.pending]);
 if(dialog?.open&&lastSignature===signature)return;
 close();currentOffer=o;lastSignature=signature;
 const d=make('dialog');dialog=d;d.id='firstVisitDialog1061';d.style.cssText='color:#efe7d5;background:#171b1d;border:1px solid #9d8150;border-radius:12px;width:min(600px,92vw);max-height:85dvh;overflow:auto;padding:20px;box-shadow:0 15px 70px #0009';
 const f=R.catalog[o.id],title=make('h2',o.title),meta=make('p',f.name+' · '+(f.timing==='arrival'?'Arrival':'Once Clear')+' · '+o.id);title.style.color='#e1be7d';
 const description=make('p',o.description);description.style.lineHeight='1.5';d.append(title,meta,description);
 const error=make('p');error.dataset.fvError='1';error.style.color='#e9a68c';d.append(error);
 const actions=make('div');actions.style.cssText='display:grid;gap:8px;margin-top:14px';
 if(o.stage==='ready'){
  for(const opt of o.options||[])actions.append(btn(opt.target+' — '+opt.label,()=>commit(o,'choose',{option:opt.index,target:opt.target})));
  actions.append(btn((o.options||[]).length?'Decline this feature':'No eligible option — continue',()=>commit(o,'decline')));
 }else if(o.stage==='reserved'){
  actions.append(btn('Resolve reserved feature',()=>commit(o,'resume')),btn('Keep reserved until eligible',close));
 }else if(o.stage==='steps'&&o.pending){
  const p=o.pending,chosen=[];let bottom=false;
  const min=p.min??(p.optional?0:p.count),max=p.max??p.count;
  if(max===0){actions.append(make('p',p.options.join(' · ')),btn('Continue',()=>commit(o,'pick',{indices:[]})))}
  else{
   const explain=make('p',p.kind==='D'?'Select cards to KEEP, in desired top-deck order; unselected cards will be discarded.':p.kind==='N'?'Select all cards in desired order; the last selected card goes to the bottom.':p.kind==='O'?'Select all cards: first becomes the top card; the rest go to the bottom in selected order.':p.order?'Choose in the desired order.':'Choose '+(min===max?String(max):min+'–'+max)+' option(s).');actions.append(explain);
   const buttons=[];const confirmBtn=btn('Confirm selection',()=>commit(o,'pick',{indices:chosen.slice(),bottom}));
   const refresh=()=>{buttons.forEach((b,i)=>{b.textContent=(chosen.includes(i)?'['+(chosen.indexOf(i)+1)+'] ':'')+p.options[i];b.setAttribute('aria-pressed',String(chosen.includes(i)))});confirmBtn.disabled=chosen.length<min||chosen.length>max};
   p.options.forEach((name,i)=>{const b=btn(name,()=>{const at=chosen.indexOf(i);if(at>=0)chosen.splice(at,1);else if(chosen.length<max)chosen.push(i);refresh()});buttons.push(b);actions.append(b)});
   if(p.allowBottom){const l=make('label'),c=make('input');c.type='checkbox';c.onchange=()=>bottom=c.checked;l.append(c,document.createTextNode(' Move the last selected card to the bottom'));actions.append(l)}
   actions.append(confirmBtn);refresh()
  }
 }
 d.append(actions);d.addEventListener('cancel',e=>{e.preventDefault();if(o.stage==='ready')void commit(o,'decline');else if(o.stage==='reserved')close()});
 document.body.appendChild(d);try{d.showModal()}catch(_){d.setAttribute('open','')}
}
function menuOpen(){const e=document.getElementById('gameLobby');return !!e&&!e.hidden&&!e.classList.contains('hidden')&&getComputedStyle(e).display!=='none'}
function panel(gg){
 const h=hero(),pos=typeof heroPos==='function'?heroPos(h):null,t=pos&&gg?.tiles?.[pos.x+','+pos.y],f=R.catalog[t?.id],host=document.getElementById('locPanel');if(!host)return;
 host.querySelector('#firstVisitPanel1061')?.remove();if(!f?.title)return;
 const box=make('div');box.id='firstVisitPanel1061';box.style.cssText='padding:9px;margin-top:8px;border:1px solid #7a6945;border-radius:7px;background:#201f19;line-height:1.4';
 const state=R.rows(gg)[f.id],ready=options().find(x=>x.id===f.id);
 box.append(make('strong','First Visit — '+f.title),make('div',f.description));
 const note=make('div',!R.plans[f.id]?'Printed rule — specialized effect not automated yet.':state?.stage==='used'?'Resolved or declined for this Quest.':state?.stage==='expired'?'Window expired.':state?.stage==='waiting'?'Waiting for entry Encounter.':state?.stage==='reserved'?'Action-cost option reserved.':state?'Pending named First Visit.':t.visited?'Previously visited; no retroactive reward.':'Requires a qualifying entry.');
 note.className='muted';box.append(note);
 if(ready&&!pending()&&connected())box.append(btn('Resolve First Visit',()=>show(ready)));host.append(box)
}
function tick(){
 scheduled=false;const gg=game();if(!gg||menuOpen()){close();return}
 if(!online())R.reconcile(gg);
 panel(gg);if(busy||pending()||!connected())return;
 const o=options().find(x=>x.stage==='steps'||x.stage==='ready');if(o)show(o);else if(dialog&&currentOffer?.stage!=='reserved')close()
}
function schedule(){if(!scheduled){scheduled=true;setTimeout(tick,30)}}
function install(){
 if(installed)return;if(typeof window.triggerFirstVisitIfEligible!=='function'||typeof window.render!=='function'||!window.ascQuestTransition33626?.ready?.()){setTimeout(install,40);return}
 installed=true;
 try{for(const row of WORKBOOK_DATABASE.Locations||[]){const f=R.catalog[row['Card ID']];if(f)row['First Visit Effect']=f.text}}catch(_){}
 const beforeEntry=window.triggerFirstVisitIfEligible;
 window.triggerFirstVisitIfEligible=function(t,x,y,h){
  const gg=game(),k=x+','+y,qualifies=!online()&&!t?.visited&&R.clear(t);
  if(qualifies)R.entry(gg,k,h,{waiting:true});
  const out=beforeEntry.apply(this,arguments);
  if(qualifies&&gg===game()&&(!(typeof pEnc!=='undefined'&&pEnc)||!out))R.finish(gg,k);
  schedule();return out
 };
 const beforeResolve=window.resolveEnc;
 window.resolveEnc=async function(){
  const gg=game(),p=typeof pEnc==='undefined'?null:pEnc,o=p?.origin,k=p?.firstVisitTileKey||(o?o.x+','+o.y:null),fv=p?.source==='First Visit';
  const out=await beforeResolve.apply(this,arguments);
  if(!online()&&gg===game()&&fv&&k&&(!pEnc||pEnc!==p))R.finish(gg,k);
  schedule();return out
 };
 const beforeInit=window.init;
 if(typeof beforeInit==='function')window.init=function(){const out=beforeInit.apply(this,arguments);if(!online())R.seed(game());schedule();return out};
 const beforeRender=window.render;window.render=function(){const result=beforeRender.apply(this,arguments);schedule();return result};
 const receive=window.mpHandleMessage;
 window.mpHandleMessage=function(m){
  const out=receive.apply(this,arguments);
  if(m?.room===mpRoom&&['MECHANICS_COMMAND_ACK','MECHANICS_COMMAND_REJECTED'].includes(m.type)){const cb=waiting.get(m.data?.id);if(cb){waiting.delete(m.data.id);cb(m.type.endsWith('REJECTED')?{error:m.data.reason||'First Visit rejected.'}:m.data.result||{resolved:true})}}
  schedule();return out
 };
 for(const name of ['explore','search','attack','endTurn','passHero32521','move','moveLyra','moveSeraphine','runtimeHeroMove','playHandCard','playLyraCard','playSeraphineCard','playExtraCard']){
  const before=window[name];if(typeof before!=='function')continue;
  window[name]=function(){if(!online()&&!pending()&&R.blocking(game(),hero())){msg('Resolve the current First Visit selection first.');schedule();return false}if(!online()&&(name==='endTurn'||name==='passHero32521'))R.expireReserved(game(),hero());return before.apply(this,arguments)}
 }
 globalThis.ascFirstVisitRuntime1061={version:'1061-first-visit-1',ready:()=>installed,offers:options,resolve:send,audit:R.audit,schedule};
 schedule()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
