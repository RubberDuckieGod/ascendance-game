/* Ascendance v10.58 — small, optional read-only party resource HUD
   with one fully server-authoritative Lore ability (Read Ahead). */
(()=>{
 'use strict';
 const pending=new Map();
 const game=()=>typeof g==='undefined'?null:g;
 const isRemote=()=>typeof mpMode!=='undefined'&&mpMode==='remote';
 const ready=()=>isRemote()&&typeof mpConnected==='function'&&mpConnected()&&typeof mpJoinReady!=='undefined'&&mpJoinReady;
 const n=x=>Number.isFinite(Number(x))?Math.max(0,Math.trunc(Number(x))):0;
 const el=(tag,text)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x};
 function show(){
  const actions=document.getElementById('mechanicsActions33621');if(!actions)return;
  let box=document.getElementById('partyResourcesPanel1058');
  if(!box){box=el('section');box.id='partyResourcesPanel1058';box.style.cssText='margin:10px 0;padding:10px;border:1px solid #997d45;border-radius:8px;background:#211d27;color:#f2ebd7;';actions.parentNode.appendChild(box)}
  const gg=game();if(!gg){box.replaceChildren();return}
  const lore=n(gg.partyLore1058),evidence=n(gg.partyEvidence1058),supply=n(gg.partySupplies33615);
  const row=el('div');row.style.cssText='font-weight:700;font-size:13px;margin-bottom:7px';row.textContent='Party Resources · Lore '+lore+' / 12 · Evidence '+evidence+' · Supply '+supply+' / 9';
  const detail=el('div','Lore persists. Evidence is Quest-bound; story Quest Items remain separate. Wagon Supply Tokens are not party Supply.');
  detail.style.cssText='font-size:11px;opacity:.83;margin-bottom:7px;line-height:1.5';
  const btn=el('button','Read Ahead · Spend 1 Lore');
  const active=ready()&&gg.phase==='Hero Phase'&&typeof controlledHero==='function'&&typeof heroDefeated==='function'&&!heroDefeated(controlledHero())&&lore>=1;
  btn.disabled=!active;btn.type='button';btn.onclick=readAhead;
  btn.style.cssText='padding:7px 10px;border:1px solid #c8a965;border-radius:6px;background:#514225;color:#fff;cursor:pointer';
  if(!active)btn.title='Requires at least 1 Lore and your active, connected Hero turn.';
  const hint=el('div','Other Lore options (Decipher, Second Interpretation, Forewarned, Archive Recall) remain documented playtest rules; their online actions are not enabled here yet.');
  hint.style.cssText='font-size:11px;opacity:.75;margin-top:6px';
  box.replaceChildren(row,detail,btn,hint);
 }
 function rpc(op,extra={}){
  return new Promise(resolve=>{
   const id='L1058-'+Date.now()+'-'+Math.random().toString(36).slice(2);
   const timer=setTimeout(()=>{pending.delete(id);resolve({error:'No server reply. Reconnect and try again.'})},11000);
   pending.set(id,message=>{clearTimeout(timer);resolve(message)});
   try{mpSend('PARTY_LORE_COMMAND',{id,op,hero:controlledHero(),round:Number(game()?.round||0),...extra})}
   catch(e){clearTimeout(timer);pending.delete(id);resolve({error:String(e.message||e)})}
  });
 }
 async function readAhead(){
  if(!ready())return;
  const peek=await rpc('READ_AHEAD_PEEK');
  if(peek.error){window.alert('Read Ahead: '+peek.error);return}
  if(!peek.cards||peek.cards.length!==2)return;
  const names=peek.cards.map((x,i)=>String(x.id||'')+' · '+String(x.name||'Encounter'));
  const chosen=window.prompt('Read Ahead: choose the top Encounter order (1 or 2)\n\n1 — '+names[0]+' then '+names[1]+'\n2 — '+names[1]+' then '+names[0]+'\n\nCancel spends no Lore.','1');
  if(!['1','2'].includes(String(chosen||''))){await rpc('READ_AHEAD_CANCEL');return}
  const out=await rpc('READ_AHEAD_COMMIT',{token:peek.token,reverse:String(chosen)==='2'});
  if(out.error)window.alert('Read Ahead: '+out.error);
  else if(typeof render==='function')render();
 }
 function install(){
  if(typeof window.mpHandleMessage!=='function'||typeof window.render!=='function')return setTimeout(install,80);
  const previous=window.mpHandleMessage;
  window.mpHandleMessage=function(message){
   const out=previous.apply(this,arguments);
   if(message?.room===mpRoom&&['PARTY_LORE_ACK','PARTY_LORE_REJECTED'].includes(message.type)){
    const id=String(message.data?.id||''),resolve=pending.get(id);
    if(resolve){pending.delete(id);resolve(message.type==='PARTY_LORE_REJECTED'?{error:message.data?.reason||'Lore action rejected.'}:message.data)}
   }
   if(['STATE','ROOM_STATE','RESOURCE_STATE','PARTY_LORE_ACK','ADVENTURE_START','ADVENTURE_RESUME'].includes(message?.type))show();
   return out;
  };
  const old=window.render;
  window.render=function(){const out=old.apply(this,arguments);show();return out};
  show();
 }
 install();
})();
