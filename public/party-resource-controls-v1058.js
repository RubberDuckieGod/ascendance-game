/* Shared party controls for the v10.58 room ledger. No client balance writes. */
(()=>{
 'use strict';
 const R=globalThis.ascPartyResources1058,S=globalThis.ascPartyResourceSources1058,pending=new Map();
 let busy=false, serial=0, lastExploration=null;
 const game=()=>typeof g==='undefined'?null:g;
 const hero=()=>typeof controlledHero==='function'?controlledHero():'';
 const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote';
 const ready=()=>!remote()||typeof mpConnected==='function'&&mpConnected()&&typeof mpJoinReady!=='undefined'&&mpJoinReady;
 const witness=gg=>gg?.partyResourceSources1058?.scope===R.scope(gg)&&!gg.partyResourceSources1058.witness?.resolved?gg.partyResourceSources1058.witness:null;
 const localPending=()=>{const gg=game();if(witness(gg)?.actor===hero())return witness(gg);return typeof pEnc!=='undefined'&&pEnc?.card?{...pEnc,kind:'encounter'}:null;};
 let localPeek=null;
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;return e};
 function promptIndex(title,rows){const answer=window.prompt(title+'\n'+rows.map((x,i)=>`${i+1}: ${x}`).join('\n'),'1');if(answer===null||!/^\d+$/.test(answer.trim()))return null;const i=Number(answer)-1;return i>=0&&i<rows.length?i:null;}
 function chooseHero(){const heroes=game()?.partyHeroes||[];const i=promptIndex('Choose a party Hero:',heroes);return i===null?null:heroes[i];}
 function request(use,op,extra={}){
  const gg=game(),cmd={id:`PR1058-${Date.now()}-${++serial}-${Math.random().toString(36).slice(2)}`,hero:hero(),round:gg.round,scope:R.scope(gg),op,use,...extra};
  if(!remote()){
   const rand=sides=>1+Math.floor(Math.random()*sides);
   if(op==='PEEK'){const p=R.preview(gg,cmd,{shuffle:a=>shuffle(a)});if(!p.error)localPeek={...p,token:cmd.id};return Promise.resolve(p.error?p:{...p,token:cmd.id});}
   if(op==='CANCEL'){localPeek=null;return Promise.resolve({cancelled:true});}
   const p=localPending();
   if(use==='WITNESS_KEEP'){const r=S.witnessResolve(gg,hero());if(!r.error){window.render?.();window.mpScheduleState?.();}return Promise.resolve(r);}
   const trial=JSON.parse(JSON.stringify(gg)),trialPending=p?.kind==='quest-roll'?trial.partyResourceSources1058.witness:p?JSON.parse(JSON.stringify(p)):null;
   const r=R.execute(trial,cmd,{actor:hero(),peek:localPeek,pending:trialPending,maxHealth:(x,h)=>typeof heroMaxHp==='function'?heroMaxHp(h):undefined,roll:rand});
   if(!r.error){if(use==='SECOND_INTERPRETATION'&&trialPending?.kind==='quest-roll'){const out=S.witnessResolve(trial,hero());if(out.error)return Promise.resolve(out);Object.assign(r,out);}
    Object.assign(gg,trial);if(use==='FOREWARNED'&&typeof pEnc!=='undefined'&&pEnc){Object.assign(pEnc,trialPending,{roll:trialPending.severity});const a=document.getElementById('severity'),b=document.getElementById('encEffect');if(a)a.textContent=String(pEnc.severity)+' (Forewarned)';if(b)b.textContent=pEnc.text;}
    localPeek=null;window.render?.();window.mpScheduleState?.();}
   return Promise.resolve(r);
  }
  return new Promise(resolve=>{const timer=setTimeout(()=>{pending.delete(cmd.id);resolve({error:'No server reply. Refresh the room before retrying.'})},11000);pending.set(cmd.id,x=>{clearTimeout(timer);resolve(x)});try{mpSend('PARTY_LORE_COMMAND',cmd)}catch(e){clearTimeout(timer);pending.delete(cmd.id);resolve({error:String(e.message||e)})}});
 }
 async function useAbility(use){
  if(busy||!ready()||!game())return;busy=true;show();
  try{
   const extra={};
   if(use==='DECIPHER'){const i=promptIndex('Decipher which stack?',['Search Deck','Location stack']);if(i===null)return;extra.deck=i===0?'search':'location';}
   if(['ARCHIVE_RECALL','FIELD_DRESSING','PREPARED_PACK'].includes(use)){extra.target=chooseHero();if(!extra.target)return;}
   if(use==='SHARED_PROVISIONS'){const first=chooseHero();if(!first)return;const others=(game().partyHeroes||[]).filter(x=>x!==first),idx=promptIndex('Choose a second Hero, or only the first:',['Only '+first,...others]);if(idx===null)return;extra.targets=idx===0?[first]:[first,others[idx-1]];}
   if(['READ_AHEAD','DECIPHER','ARCHIVE_RECALL','PREPARED_PACK'].includes(use)){
    const peek=await request(use,'PEEK',extra);if(peek.error)throw Error(peek.error);extra.token=peek.token;
    const rows=peek.cards.map(c=>`${c.id} ${c.name}`);
    if(use==='READ_AHEAD'||use==='DECIPHER'){
     const order=window.prompt('Return cards in order (e.g. '+rows.map((_,i)=>i+1).join(',')+').\n'+rows.map((s,i)=>`${i+1}: ${s}`).join('\n'),rows.map((_,i)=>i+1).join(','));
     if(order!==null&&/^\s*\d+(\s*,\s*\d+)*\s*$/.test(order))extra.order=order.split(',').map(x=>Number(x.trim())-1);
     if(!extra.order||extra.order.length!==rows.length||new Set(extra.order).size!==rows.length||extra.order.some(i=>i<0||i>=rows.length)){await request(use,'CANCEL',extra);return;}
    }else{const i=promptIndex(use==='ARCHIVE_RECALL'?'Return which discard card to hand?':'Discard which card after drawing?',rows);if(i===null){await request(use,'CANCEL',extra);return;}extra.index=peek.cards[i].index;}
   }
   const out=await request(use,'COMMIT',extra);if(out.error)throw Error(out.error);if(['WITNESS_KEEP','SECOND_INTERPRETATION','QUESTION_SUSPECT'].includes(use))window.checkGenericQuestObjective?.();
  }catch(e){window.alert(String(e.message||e));}finally{busy=false;show();}
 }
 function show(){
  const gg=game(),anchor=document.getElementById('mechanicsActions33621')||document.getElementById('partySupply33615');if(!anchor||!gg)return;
  let panel=document.getElementById('partyResourcesPanel1058');if(!panel){panel=make('section');panel.id='partyResourcesPanel1058';panel.style.cssText='margin:8px 0;padding:10px;border:1px solid #997d45;border-radius:8px;background:#211d27;color:#f2ebd7';anchor.parentElement.appendChild(panel);}
  const b=R.balances(gg),row=make('div',`Party resources · Lore ${b.lore}/${R.limit(gg,'lore')} · Evidence ${b.evidence} · Supply ${b.supply}/${R.limit(gg,'supply')}`);row.style.fontWeight='bold';
  const detail=make('div',gg.partyResourceSetupOpen1058?`Quest preparation: ${gg.partySupplySetupSpent1058||0}/${R.setupLimit(gg)} Supply spent. Start the first Hero turn to close preparation.`:'Lore and Supply persist. Ordinary Evidence clears at Quest end.');detail.style.cssText='font-size:12px;margin:6px 0';
  const w=witness(gg);const p=w?.actor===hero()?w:remote()?lastExploration?.pendingByHero?.[hero()]:localPending();const controls=make('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:5px';
  for(const [use,spec] of [...Object.entries(R.LORE_USES),...Object.entries(R.SUPPLY_USES)]){
   const supply=Object.hasOwn(R.SUPPLY_USES,use),q=supply?R.canUseSupplyAtSetup(gg,use):R.checkLore(gg,use),btn=make('button',`${spec.label} · ${spec.cost} ${supply?'Supply':'Lore'}`);
   btn.type='button';btn.disabled=busy||!ready()||!!q.error||(!supply&&gg.phase!=='Hero Phase')||(use==='FOREWARNED'&&!(p?.kind==='encounter'&&p.severityMode==='rolled'))||(use==='SECOND_INTERPRETATION'&&!['hazard','quest-roll'].includes(p?.kind));
   btn.title=q.error||spec.effect;btn.onclick=()=>useAbility(use);controls.appendChild(btn);
  }
  panel.replaceChildren(row,detail,controls);
  if(w?.actor===hero()){const d=make('div','Witness Hunters: d6 '+w.result+' (1–2 Hunters; 3–4 no effect; 5–6 Evidence). Keep or use Second Interpretation.');const keep=make('button','Keep Witness roll');keep.disabled=busy||!ready();keep.onclick=()=>useAbility('WITNESS_KEEP');panel.append(d,keep);}
 }
 function install(){
  if(typeof window.mpHandleMessage!=='function'||typeof window.render!=='function')return setTimeout(install,80);
  const old=window.mpHandleMessage;window.mpHandleMessage=function(m){
   const mine=m?.room===mpRoom;
   if(mine&&m.type==='EXPLORATION_STATE')lastExploration=m.data;
   if(mine&&m.type==='EXPLORATION_COMMAND_ACK'&&m.data?.exploration)lastExploration=m.data.exploration;
   if(mine&&['ADVENTURE_START','ADVENTURE_RESUME','ROOM_STATE'].includes(m.type))lastExploration=null;
   if(mine&&['PARTY_LORE_ACK','PARTY_LORE_REJECTED'].includes(m.type)){const cb=pending.get(m.data?.id);if(cb){pending.delete(m.data.id);cb(m.type==='PARTY_LORE_REJECTED'?{error:m.data.reason}:m.data);}return;}
   const result=old.apply(this,arguments);show();return result;
  };
  const entry=window.enterHeroLocation;if(typeof entry==='function')window.enterHeroLocation=function(h,x,y){const gg=game(),from=!remote()&&gg&&typeof heroPos==='function'?{...heroPos(h)}:null;const out=entry.apply(this,arguments);if(from&&gg===game()&&typeof heroPos==='function'){S.migrate(gg);S.witnessStart(gg,h,from,heroPos(h),sides=>1+Math.floor(Math.random()*sides));show()}return out};
  const render=window.render;window.render=function(){const out=render.apply(this,arguments);show();return out};show();
 }
 window.ascPartyResourceCommand1058=useAbility;
 if(R&&S)install();
})();
