/* System 031: all five Lore abilities share the authoritative room rules; solo uses the same rules locally. */
(()=>{
 'use strict';
 const R=globalThis.ascPartyResources1058,S=globalThis.ascPartyResourceSources1058,C=globalThis.ascPartyResourceExtras1058,pending=new Map();
 if(!R||!S||!C||window.ascPartyLoreLive1058)return;
 window.ascPartyLoreLive1058='1058-lore-live-1';
 let busy=false, serial=0, lastExploration=null,lastRoom='';
 const game=()=>typeof g==='undefined'?null:g;
 const hero=()=>typeof controlledHero==='function'?controlledHero():'';
 // The mode preference defaults to remote even in solo. A room survives a
 // dropped socket, but is cleared by explicit disconnect/new solo game.
 const roomName=()=>typeof mpRoom==='undefined'?'':String(mpRoom||'');
 const remote=()=>typeof mpMode!=='undefined'&&mpMode==='remote'&&!!roomName();
 const ready=()=>!remote()||typeof mpConnected==='function'&&mpConnected()&&typeof mpJoinReady!=='undefined'&&mpJoinReady&&typeof mpSocket!=='undefined'&&mpSocket?.readyState===1;
 const witness=gg=>gg?.partyResourceSources1058?.scope===R.scope(gg)&&!gg.partyResourceSources1058.witness?.resolved?gg.partyResourceSources1058.witness:null;
 const localPending=()=>{const gg=game();if(C.pending(gg)?.actor===hero())return C.pending(gg);if(witness(gg)?.actor===hero())return witness(gg);return typeof pEnc!=='undefined'&&pEnc?.card?{...pEnc,kind:'encounter'}:null;};
 let localPeek=null,localSearch=null;
 function resetRoom(){const key=remote()?roomName():'';if(key!==lastRoom){lastRoom=key;lastExploration=null;localPeek=null;localSearch=null;}}
 function currentPending(gg,h){
  const hazard=C.pending(gg),w=witness(gg);
  if(hazard)return hazard;
  if(w)return w;
  if(remote()){
   if(lastExploration)return lastExploration.pendingByHero?.[h]||null;
   return typeof pEnc!=='undefined'&&pEnc?.roomAuthority3305&&pEnc.roomHero3300===h?{...pEnc,kind:'encounter'}:null;
  }
  return localPending()||localSearch||(typeof pSearch!=='undefined'&&pSearch?{kind:'search'}:null)||(typeof pLoc!=='undefined'&&pLoc?{kind:'location'}:null);
 }
 function loreError(gg,use){
  const q=R.checkLore(gg,use);if(q.error)return q.error;
  if(!ready())return 'Reconnect to the party before spending Lore.';
  const h=hero(),t=remote()?window.ascRoomTurn33618?.state?.():null;
  if(!gg.partyHeroes?.includes(h)||gg.phase!=='Hero Phase'||(remote()?(!t||t.phase!=='Hero Phase'||t.turnHero!==h||t.passed?.[h]||t.resolving):(gg.activeHero!==h||gg.passedHeroes32521?.[h]||gg.autoRoundResolving3259)))return 'Use Lore during your active Hero turn.';
  if(typeof heroDefeated==='function'&&heroDefeated(h))return 'Downed Heroes cannot spend Lore.';
  if(typeof heroHasCondition==='function'&&heroHasCondition(h,'Stunned'))return 'Stunned Heroes cannot spend Lore.';
  const p=currentPending(gg,h),owner=p?.actor||p?.hero||p?.roomHero3300;
  if(use==='FOREWARNED')return p?.kind==='encounter'&&p.severityMode==='rolled'&&Number.isInteger(p.baseRoll)&&!p.resolved&&!p.forewarned1058&&p.truePaths33621?.chosen!==null&&(!owner||owner===h)?null:'Requires your unresolved ordinary rolled Encounter Severity.';
  if(use==='SECOND_INTERPRETATION')return ['hazard','quest-roll'].includes(p?.kind)&&owner===h&&!p.combat&&!p.resolved&&!p.rerolled1058?'': 'Requires your unresolved noncombat hazard or Quest die roll.';
  if(p)return 'Resolve the current prompt first.';
  return null;
 }
 const copy=v=>JSON.parse(JSON.stringify(v));
 const die=s=>1+Math.floor(Math.random()*s);
 const enemyFactory=id=>{const e=typeof encounterEnemy320==='function'?encounterEnemy320(id):null;return e?copy(e):null;};
 const rollEnv={roll:die,spawn:(t,id,n)=>{const es=Array.from({length:n},()=>enemyFactory(id)).filter(Boolean);(t.enemies??=[]).push(...es);return es.length;}};
 const shuffleLocal=a=>typeof shuffle==='function'?shuffle(a):a;
 function localSearchUi(p){const [x,y]=p.tileKey.split(',').map(Number);pSearch={...p,x,y};skipSearch=copy(p.skipped||[]);const el=id=>document.getElementById(id);el('searchDraw')?.classList.remove('hidden');if(el('searchName'))el('searchName').textContent=p.card.name;if(el('elig'))el('elig').textContent=(p.card.elig||[]).join(' / ');if(el('searchEffect'))el('searchEffect').textContent=p.card.text||'';if(el('searchSkipped'))el('searchSkipped').textContent='Free authored Search reward; no normal Search consumed.';window.render?.();}
 async function explore(op,args={}){if(remote()){const ack=await window.ascExplorationCommand33615?.(op,args,true);if(!ack||ack.rejected||ack.error){window.alert(ack?.reason||ack?.error||'Room rejected the Search choice.');return null}if(ack.exploration){lastExploration=ack.exploration;window.ascExplorationApply33615?.(ack.exploration,'resource-choice')}return ack.result||ack;}const gg=game(),h=hero();let out;if(op==='LOST_HISTORY_DRAW1058')out=C.drawTwo(gg,h,args.tileKey,shuffleLocal);else if(op==='LOST_HISTORY_CHOOSE1058')out=C.chooseSearch(gg,localSearch,h,args.index);else out=C.directSearch(gg,h,args.rewardId,shuffleLocal);if(out?.error){alert(out.error);return null}localSearch=out?.pending||null;if(localSearch?.kind==='search')localSearchUi(localSearch);show();return out;}
 function encounterChoice(gg,p){const k=p.card.id,n=Number(p.severity??p.roll);if(!C.choiceNeeded(p))return {kind:'immediate'};if(k==='EN067'){if(confirm('Salvage: gain 1 Party Supply? Cancel to inspect the top three Locations.'))return {kind:'supply'};const cards=(gg.pool||[]).slice(0,3);alert(cards.map(c=>c.name||c.id).join('\n')||'No unrevealed Locations.');return {kind:'inspect',fingerprint:JSON.stringify(cards)};}if(k==='EN053'){if(!confirm('Clan Memory: every living Hero discards one Hero card to avoid combat?'))return {kind:'fight'};const cards={};for(const h of gg.partyHeroes||[]){if(typeof searchHeroState==='function'&&Number(searchHeroState(h)?.hp)<=0)continue;const hand=R.zones(gg,h)?.hand||[];const i=promptIndex(h+': choose a card to discard',hand.map(c=>c.name||c.id));if(i===null)return null;cards[h]=i;}return {kind:'discard',cards};}if(k==='EN045')return {kind:confirm('Escort the civilians to an Urban Hub?')?'escort':'decline'};if(k==='EN065'&&n>=5&&n<=6)return {kind:'fight'};return {kind:confirm('Pacify the eligible Spirit rather than fight?')?'pacify':'fight'};}
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;return e};
 function promptIndex(title,rows){const answer=window.prompt(title+'\n'+rows.map((x,i)=>`${i+1}: ${x}`).join('\n'),'1');if(answer===null||!/^\d+$/.test(answer.trim()))return null;const i=Number(answer)-1;return i>=0&&i<rows.length?i:null;}
 function chooseHero(){const heroes=game()?.partyHeroes||[];const i=promptIndex('Choose a party Hero:',heroes);return i===null?null:heroes[i];}
 function request(use,op,extra={}){
  resetRoom();const gg=game(),cmd={id:`PR1058-${Date.now()}-${++serial}-${Math.random().toString(36).slice(2)}`,hero:hero(),round:gg.round,scope:R.scope(gg),op,use,...extra};
  if(!ready())return Promise.resolve({error:'Reconnect to the party before using resources.'});
  if(op!=='CANCEL'&&Object.hasOwn(R.LORE_USES,use)){const error=loreError(gg,use);if(error)return Promise.resolve({error});}
  if(!remote()){
   const rand=sides=>1+Math.floor(Math.random()*sides);
   if(op==='PEEK'){const p=R.preview(gg,cmd,{shuffle:shuffleLocal});if(!p.error)localPeek={...p,token:cmd.id,scope:cmd.scope,round:cmd.round,actor:cmd.hero,use};return Promise.resolve(p.error?p:{...p,token:cmd.id});}
   if(op==='CANCEL'){if(localPeek?.token===cmd.token)localPeek=null;return Promise.resolve({cancelled:true});}
   if(['READ_AHEAD','DECIPHER','ARCHIVE_RECALL','PREPARED_PACK'].includes(use)&&(!localPeek||localPeek.token!==cmd.token||localPeek.scope!==cmd.scope||localPeek.round!==cmd.round||localPeek.actor!==cmd.hero||localPeek.use!==use))return Promise.resolve({error:'Choice changed. Open a fresh preview.'});
   const p=localPending();
   if(use==='WITNESS_KEEP'){const r=S.witnessResolve(gg,hero());if(!r.error){window.render?.();window.mpScheduleState?.();}return Promise.resolve(r);}
   const trial=copy(gg),extraPending=C.pending(trial),trialPending=extraPending||((p?.kind==='quest-roll'&&p?.source==='Q015_HUNTERS')?trial.partyResourceSources1058.witness:p?copy(p):null);
   if(['ATTUNE_TONE','PACIFY_SPIRIT','HAZARD_KEEP'].includes(use)){if(use!=='HAZARD_KEEP'&&heroActionCount(hero())<1)return Promise.resolve({error:'One Action is required.'});const out=use==='ATTUNE_TONE'?C.attune(gg,hero(),rand):use==='PACIFY_SPIRIT'?C.pacify(gg,hero(),extra.enemyId):C.finishRoll(gg,hero(),rollEnv);if(!out?.error&&out){if(use!=='HAZARD_KEEP'){const st=searchHeroState(hero());if(st)st.actions=Math.max(0,Number(st.actions||0)-1);}window.render?.();window.mpScheduleState?.();}return Promise.resolve(out||{error:'No eligible effect.'});}
   const r=R.execute(trial,cmd,{actor:hero(),peek:localPeek,pending:trialPending,maxHealth:(x,h)=>typeof heroMaxHp==='function'?heroMaxHp(h):undefined,roll:rand});
   if(!r.error){if(use==='SECOND_INTERPRETATION'&&(extraPending||trialPending?.kind==='quest-roll')){const out=extraPending?C.finishRoll(trial,hero(),rollEnv):S.witnessResolve(trial,hero());if(out.error)return Promise.resolve(out);Object.assign(r,out);}
    Object.assign(gg,trial);if(use==='FOREWARNED'&&typeof pEnc!=='undefined'&&pEnc){Object.assign(pEnc,trialPending,{roll:trialPending.severity});const a=document.getElementById('severity'),b=document.getElementById('encEffect');if(a)a.textContent=String(pEnc.severity)+' (Forewarned)';if(b)b.textContent=pEnc.text;}
    localPeek=null;window.render?.();window.mpScheduleState?.();}
   return Promise.resolve(r);
  }
  return new Promise(resolve=>{const timer=setTimeout(()=>{pending.delete(cmd.id);resolve({error:'No server reply. Refresh the room before retrying.'})},11000);pending.set(cmd.id,x=>{clearTimeout(timer);resolve(x)});try{mpSend('PARTY_LORE_COMMAND',cmd)}catch(e){clearTimeout(timer);pending.delete(cmd.id);resolve({error:String(e.message||e)})}});
 }
 async function useAbility(use){
  resetRoom();if(busy||!ready()||!game())return;
  if(Object.hasOwn(R.LORE_USES,use)){const error=loreError(game(),use);if(error){window.alert(error);return;}}
  busy=true;show();
  try{
   const extra={};
   if(use==='PACIFY_SPIRIT'){const es=(S.tileAt(game(),hero())?.enemies||[]).filter(e=>e.hp>0&&(e.workbookId||e.enemyId||e.type)==='E081'&&e.roomEnemyId3301);const i=promptIndex('Choose a Bound Dryad to pacify',es.map(e=>e.name||e.roomEnemyId3301));if(i===null)return;extra.enemyId=es[i].roomEnemyId3301;}
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
   const out=await request(use,'COMMIT',extra);if(out.error)throw Error(out.error);if(['WITNESS_KEEP','HAZARD_KEEP','SECOND_INTERPRETATION','QUESTION_SUSPECT','ATTUNE_TONE','PACIFY_SPIRIT'].includes(use))window.checkGenericQuestObjective?.();
  }catch(e){window.alert(String(e.message||e));}finally{busy=false;show();}
 }
 function show(){
  resetRoom();const gg=game(),anchor=document.getElementById('mechanicsActions33621')||document.getElementById('partySupply33615');if(!anchor||!gg)return;
  let panel=document.getElementById('partyResourcesPanel1058');if(!panel){panel=make('section');panel.id='partyResourcesPanel1058';panel.style.cssText='margin:8px 0;padding:10px;border:1px solid #997d45;border-radius:8px;background:#211d27;color:#f2ebd7';anchor.parentElement.appendChild(panel);}
  const b=R.balances(gg),row=make('div',`Party resources · Lore ${b.lore}/${R.limit(gg,'lore')} · Evidence ${b.evidence} · Supply ${b.supply}/${R.limit(gg,'supply')}`);row.style.fontWeight='bold';
  const detail=make('div',gg.partyResourceSetupOpen1058?`Quest preparation: ${gg.partySupplySetupSpent1058||0}/${R.setupLimit(gg)} Supply spent. Start the first Hero turn to close preparation.`:'Lore and Supply persist. Ordinary Evidence clears at Quest end.');detail.style.cssText='font-size:12px;margin:6px 0';
  const w=witness(gg),hazard=C.pending(gg);const controls=make('div');controls.style.cssText='display:flex;flex-wrap:wrap;gap:5px';
  for(const [use,spec] of [...Object.entries(R.LORE_USES),...Object.entries(R.SUPPLY_USES)]){
   const supply=Object.hasOwn(R.SUPPLY_USES,use),q=supply?R.canUseSupplyAtSetup(gg,use):R.checkLore(gg,use),btn=make('button',`${spec.label} · ${spec.cost} ${supply?'Supply':'Lore'}`);
   const error=supply?q.error:loreError(gg,use);
   btn.type='button';btn.dataset.resourceUse1058=use;btn.disabled=busy||!ready()||!!error;
   btn.title=error||spec.effect;btn.onclick=()=>useAbility(use);controls.appendChild(btn);
  }
  panel.dataset.loreRuntime='1058-lore-live-1';
  const loreNote=make('div','All five Lore abilities available · once per party per Quest · Lore costs no Hero Actions. Roll abilities activate only before the eligible result resolves.');
  loreNote.style.cssText='font-size:11px;opacity:.85;margin:5px 0';
  panel.replaceChildren(row,detail,loreNote,controls);
  if(hazard?.actor===hero()){const keep=make('button','Keep '+hazard.source.replaceAll('_',' ')+' roll: '+hazard.result);keep.disabled=busy||!ready();keep.onclick=()=>useAbility('HAZARD_KEEP');panel.append(keep);}
  const add=(label,fn)=>{const b=make('button',label);b.disabled=busy||!ready();b.onclick=fn;panel.append(b);};
  const extra=gg.partyResourceSources1058?.extra1058||{},search=remote()?lastExploration?.pendingByHero?.[hero()]:localSearch;
  if(search?.kind==='search-choice1058')search.cards.forEach((c,i)=>add('Choose '+(c.name||c.id),()=>explore('LOST_HISTORY_CHOOSE1058',{index:i})));
  else if(extra.lostHistory?.status==='available'&&!search){const tile=Object.entries(gg.tiles||{}).find(([,t])=>t.id==='L084');if(tile)add('Draw two Lost History Search cards',()=>explore('LOST_HISTORY_DRAW1058',{tileKey:tile[0]}));}
  for(const [id,r] of Object.entries(extra.searchRewards||{}))if(r.status==='available'&&r.actor===hero()&&!search)add('Resolve '+r.source+' Search reward',()=>explore('RESOURCE_SEARCH_REWARD1058',{rewardId:id}));
  if((S.tileAt(gg,hero())?.enemies||[]).some(e=>e.hp>0&&(e.workbookId||e.enemyId||e.type)==='E081'&&e.roomEnemyId3301))add('Pacify Bound Dryad · 1 Action',()=>useAbility('PACIFY_SPIRIT'));
  if(w?.actor===hero()){const d=make('div','Witness Hunters: d6 '+w.result+' (1–2 Hunters; 3–4 no effect; 5–6 Evidence). Keep or use Second Interpretation.');const keep=make('button','Keep Witness roll');keep.disabled=busy||!ready();keep.onclick=()=>useAbility('WITNESS_KEEP');panel.append(d,keep);}
 }
 function install(){
  if(typeof window.mpHandleMessage!=='function'||typeof window.render!=='function')return setTimeout(install,80);
  const old=window.mpHandleMessage;window.mpHandleMessage=function(m){
   resetRoom();const mine=remote()&&m?.room===roomName();
   const remember=p=>{if(p&&(!lastExploration||!Number.isInteger(p.seq)||!Number.isInteger(lastExploration.seq)||p.seq>=lastExploration.seq))lastExploration=p;};
   if(mine&&m.type==='EXPLORATION_STATE')remember(m.data);
   if(mine&&m.type==='EXPLORATION_COMMAND_ACK'&&m.data?.exploration)remember(m.data.exploration);
   if(mine&&['ADVENTURE_START','ADVENTURE_RESUME','ROOM_STATE'].includes(m.type))lastExploration=null;
   if(mine&&['PARTY_LORE_ACK','PARTY_LORE_REJECTED'].includes(m.type)){const cb=pending.get(m.data?.id);if(cb){pending.delete(m.data.id);cb(m.type==='PARTY_LORE_REJECTED'?{error:m.data.reason}:m.data);}return;}
   const result=old.apply(this,arguments);show();return result;
  };
  const entry=window.enterHeroLocation;if(typeof entry==='function')window.enterHeroLocation=function(h,x,y){const gg=game(),from=!remote()&&gg&&typeof heroPos==='function'?{...heroPos(h)}:null;const out=entry.apply(this,arguments);if(from&&gg===game()&&typeof heroPos==='function'){S.migrate(gg);S.witnessStart(gg,h,from,heroPos(h),die);C.entry(gg,h,from,heroPos(h),die);C.escortArrival(gg,h);show()}return out};
  const enc=window.resolveEnc;window.resolveEnc=async function(){const gg=game(),raw=typeof pEnc!=='undefined'?pEnc:null,room=remote()?lastExploration?.pendingByHero?.[hero()]:null,p=room||raw;if(!p||!C.special(p))return enc.apply(this,arguments);if(busy)return;busy=true;try{const choice=encounterChoice(gg,p);if(!choice)return;if(remote()){await explore('ENCOUNTER_RESOLVE',{resourceChoice1058:choice,spawnedEnemies:[]});}else{const trial=copy(gg),prepared={...p,hero:hero(),severity:Number(p.severity??p.roll),encounterSerial33621:p.encounterSerial33621||((trial.mechanics33621??={}).encounterSerial=Number(trial.mechanics33621?.encounterSerial||0)+1)};const r=C.resolveSpecial(trial,prepared,choice,hero(),{makeEnemy:enemyFactory});if(r.error){alert(r.error);return}Object.assign(gg,trial);pEnc=null;document.getElementById('encPanel')?.classList.add('hidden');window.render?.();window.mpScheduleState?.();}}finally{busy=false;show()}};
  const resolve=window.resolveSearch;window.resolveSearch=async function(){if(remote()||!localSearch||localSearch.kind!=='search')return resolve.apply(this,arguments);const p=localSearch,gg=game(),deck=copy(gg.searchDeck||[]);const out=await resolve.apply(this,arguments);if(typeof pSearch==='undefined'||!pSearch){gg.searchDeck=deck;const r=C.settleSearch(gg,p,false,shuffleLocal)||C.settleDirect(gg,p,false,shuffleLocal);if(r?.error)alert(r.error);localSearch=null;window.render?.();}return out};
  const cancel=window.cancelSearch;window.cancelSearch=function(){if(remote()||!localSearch||localSearch.kind!=='search')return cancel.apply(this,arguments);const r=C.settleSearch(game(),localSearch,true,shuffleLocal)||C.settleDirect(game(),localSearch,true,shuffleLocal);if(r?.error){alert(r.error);return}localSearch=r.pending||null;pSearch=null;skipSearch=[];document.getElementById('searchDraw')?.classList.add('hidden');window.render?.();};
  const render=window.render;window.render=function(){const out=render.apply(this,arguments);show();return out};show();
 }
 window.ascPartyResourceCommand1058=useAbility;
 if(R&&S&&C)install();
})();
