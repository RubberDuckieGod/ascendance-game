// Ascendance 3.36.21 — stabilized room/server turn-owner protocol V2 (filename retained for deployment compatibility).
// Players choose activation order each Round. No Hero is preselected between turns.
(()=>{
  'use strict';
  const V='3.36.21', REQUIRED_SERVER='3.36.21', REQUIRED_PROTOCOL='room-turn-owner-v2';
  let lastTurnSig='', claimPending=false, lastDeniedAt=0, reactionDepth33618=0;
  const $=id=>document.getElementById(id);
  function api(){return window.ascRoomTurn33618||null}
  function online(){try{return !!api()?.online?.()}catch(_){return false}}
  function state(){try{return api()?.state?.()||null}catch(_){return null}}
  function serverBuild(){try{return String(state()?.serverBuild||'')}catch(_){return ''}}
  function serverCompatible(){const t=state();return !online()||(serverBuild()===REQUIRED_SERVER&&String(t?.turnProtocol||'')===REQUIRED_PROTOCOL)}
  function serverMismatchMessage(){const b=serverBuild();return b?`SERVER UPDATE REQUIRED · browser ${V} / server ${b}`:`SERVER UPDATE REQUIRED · browser ${V} / old server protocol`}
  function me(){try{return String(mpRole||controlledHero?.()||'')}catch(_){return ''}}
  function display(h){try{return heroDisplayName(h)||h}catch(_){return h||'Hero'}}
  function inHeroPhase(){try{return g?.phase==='Hero Phase'}catch(_){return false}}
  function myPassed(){const t=state(),h=me();return !!t?.passed?.[h]}
  function myDefeated(){try{return typeof heroDefeated==='function'&&heroDefeated(me())}catch(_){return false}}
  function myActions(){try{return Number(heroActionCount(me())||0)}catch(_){return 0}}
  function myTurn(){const t=state();return !online()||!!(t&&t.phase==='Hero Phase'&&!t.resolving&&t.turnHero===me())}
  function waitingForClaim(){const t=state();return !!(online()&&t&&t.phase==='Hero Phase'&&!t.resolving&&!t.turnHero)}
  function diag(type,detail={}){try{window.ascDebug3271?.events?.push({t:new Date().toISOString().slice(11,23),dir:'TURN',type,detail,s:window.ascDebug3271.snap()})}catch(_){}}
  function deny(action='take a Hero Phase Action'){
    if(!online()||!inHeroPhase())return false;
    const t=state(),h=me();
    if(!serverCompatible()){const now=Date.now();if(now-lastDeniedAt>500){try{log(serverMismatchMessage())}catch(_){}lastDeniedAt=now}return true}
    if(t?.resolving)return false;
    if(t?.turnHero===h)return false;
    const now=Date.now();
    if(now-lastDeniedAt>500){
      const msg=t?.turnHero?`TURN: ${display(t.turnHero)} is acting. ${display(h)} cannot ${action} yet.`:`TURN: no Hero is acting. Choose Start My Turn before ${action}.`;
      try{log(msg);renderTurnUi()}catch(_){}
      diag('TURN_ACTION_BLOCKED_33618',{hero:h,action,turnHero:t?.turnHero||null});
      lastDeniedAt=now;
    }
    return true;
  }
  function startTurn(){
    if(!online())return false;
    if(!serverCompatible()){try{log(serverMismatchMessage())}catch(_){}renderTurnUi();return false}
    const t=state(),h=me();
    if(!t||t.phase!=='Hero Phase'||t.resolving||t.turnHero||t.passed?.[h]||myDefeated())return false;
    claimPending=true;renderTurnUi();diag('TURN_CLAIM_SENT_33618',{hero:h,round:t.round});
    const ok=api()?.claim?.();
    if(!ok){claimPending=false;renderTurnUi()}
    setTimeout(()=>{claimPending=false;renderTurnUi()},1800);
    return !!ok;
  }
  function endMyTurn(){
    if(!online())return false;
    if(!serverCompatible()){try{log(serverMismatchMessage())}catch(_){}renderTurnUi();return false}
    const t=state(),h=me();
    if(!t||t.phase!=='Hero Phase'||t.resolving||t.turnHero!==h)return false;
    diag('TURN_END_SENT_33618',{hero:h,round:t.round,heldActions:myActions()});
    return !!api()?.end?.();
  }
  function ensureStyle(){
    if($('turnOwnerStyle33618'))return;
    const st=document.createElement('style');st.id='turnOwnerStyle33618';st.textContent=`
      #turnOwnerBadge33618{position:fixed;top:8px;right:10px;z-index:9998;max-width:min(72vw,390px);padding:7px 10px;border:1px solid #6b5736;border-radius:9px;background:rgba(9,13,14,.94);color:#e6d3a0;font:700 11px/1.25 system-ui,-apple-system,sans-serif;letter-spacing:.035em;box-shadow:0 5px 18px #0008;text-align:center}
      #turnOwnerBadge33618.mine33618{border-color:#8fae70;color:#dff3c6}#turnOwnerBadge33618.wait33618{border-color:#8d7a4e;color:#ffe09a}#turnOwnerBadge33618.other33618{border-color:#704e4e;color:#f0c2b4}
      #startTurn33618{margin-right:7px}.turnOwnerMini33618{display:inline-block;margin-left:6px;padding:1px 5px;border:1px solid #82704d;border-radius:999px;color:#e8cb84;font-size:9px;letter-spacing:.06em;vertical-align:1px}
      body.turnLocked33618 #attack,body.turnLocked33618 #explore,body.turnLocked33618 #search{filter:saturate(.35);opacity:.48}
      @media(max-width:700px){#turnOwnerBadge33618{top:6px;right:6px;max-width:64vw;font-size:9px;padding:5px 7px}}
    `;document.head.appendChild(st);
  }
  function ensureBadge(){
    ensureStyle();let b=$('turnOwnerBadge33618');if(!b){b=document.createElement('div');b.id='turnOwnerBadge33618';document.body.appendChild(b)}return b;
  }
  function markPartyTurn(turnHero){
    try{
      const panel=$('partyPanel');if(!panel)return;
      for(const tag of panel.querySelectorAll('.turnOwnerMini33618'))tag.remove();
      if(!turnHero)return;
      const full=display(turnHero),short=String(turnHero);
      for(const b of panel.querySelectorAll('b')){
        const txt=b.textContent||'';
        if(txt.includes(full)||txt.includes(short)){
          const s=document.createElement('span');s.className='turnOwnerMini33618';s.textContent='TURN';b.appendChild(s);break;
        }
      }
    }catch(_){}
  }
  function patchTurnButtons(t){
    const pass=$('pass32521');
    if(pass){
      if(online()){
        pass.onclick=ev=>{ev?.preventDefault?.();endMyTurn()};
        pass.textContent=t?.turnHero===me()?'End Turn / Hold Actions':(myPassed()?'Turn Complete':'End Turn / Hold Actions');
        pass.disabled=!(t&&t.phase==='Hero Phase'&&!t.resolving&&t.turnHero===me()&&!myPassed());
        pass.style.display=t?.phase==='Hero Phase'?'':'none';
      }
    }
    if(!online())return;
    let start=$('startTurn33618');
    if(!start&&pass?.parentNode){start=document.createElement('button');start.id='startTurn33618';start.className='primary';pass.parentNode.insertBefore(start,pass)}
    if(start){
      const legal=!!(t&&t.phase==='Hero Phase'&&!t.resolving&&!t.turnHero&&!t.passed?.[me()]&&!myDefeated());
      start.style.display=(t?.phase==='Hero Phase'&&!t?.resolving&&!myPassed())?'':'none';
      start.disabled=!legal||claimPending;
      start.textContent=claimPending?'Claiming Turn…':'Start My Turn';
      start.onclick=ev=>{ev.preventDefault();startTurn()};
    }
  }
  function gateButtons(t){
    const locked=!!(online()&&t?.phase==='Hero Phase'&&!t?.resolving&&t.turnHero!==me());
    document.body.classList.toggle('turnLocked33618',locked);
    const selectors=['#attack','#explore','#search','#q001Fire','#q001Villager','#q002MoveWagon','#q002Strongbox','#lightBeacon','#hand button','#lyraHand button','#seraphineHand button','#runtimeHeroHand button'];
    if(locked){
      for(const el of document.querySelectorAll(selectors.join(','))){if(el.id==='startTurn33618'||el.id==='pass32521')continue;el.disabled=true;el.dataset.turnLocked33618='1'}
    }else{
      // Core render runs before this function and restores native disabled state. Only remove our marker.
      for(const el of document.querySelectorAll('[data-turn-locked33618]'))delete el.dataset.turnLocked33618;
    }
  }
  function renderTurnUi(){
    if(!document.body)return;
    const b=ensureBadge(),t=state(),h=me();
    if(!online()){
      b.style.display='none';document.body.classList.remove('turnLocked33618');return;
    }
    b.style.display='block';b.className='';
    if(!t){b.textContent='TURN · syncing room authority…';b.classList.add('wait33618');return}
    if(!serverCompatible()){b.textContent=serverMismatchMessage();b.classList.add('other33618');patchTurnButtons(t);const st=$('startTurn33618');if(st)st.disabled=true;const ps=$('pass32521');if(ps)ps.disabled=true;return}
    if(t.resolving||t.phase!=='Hero Phase'){
      b.textContent=t.resolving?`ROUND ${t.round} · ROOM RESOLVING`:`ROUND ${t.round} · ${String(t.phase||'PHASE').toUpperCase()}`;b.classList.add('wait33618');
    }else if(t.turnHero===h){
      b.textContent=`YOUR TURN · ${display(h)} · ${myActions()} ACTION${myActions()===1?'':'S'}`;b.classList.add('mine33618');
    }else if(t.turnHero){
      b.textContent=`${display(t.turnHero).toUpperCase()}'S TURN · WAIT FOR YOUR TURN`;b.classList.add('other33618');
    }else if(myPassed()){
      b.textContent=`ROUND ${t.round} · YOUR TURN IS COMPLETE · WAITING FOR NEXT HERO`;b.classList.add('wait33618');
    }else{
      b.textContent=`ROUND ${t.round} · CHOOSE NEXT HERO · START MY TURN`;b.classList.add('wait33618');
    }
    const sig=`${t.round}|${t.phase}|${t.turnHero||'-'}|${t.activationSeq||0}|${!!t.resolving}`;
    if(sig!==lastTurnSig){diag('TURN_OWNER_UI_33618',{round:t.round,phase:t.phase,turnHero:t.turnHero||null,activationSeq:t.activationSeq||0,resolving:!!t.resolving});lastTurnSig=sig;claimPending=false}
    patchTurnButtons(t);gateButtons(t);markPartyTurn(t.turnHero||null);
  }
  function wrapNormal(name,heroFn){
    const old=window[name];if(typeof old!=='function'||old.__turnOwner33618)return;
    const wrapped=function(){const hero=heroFn?heroFn.apply(this,arguments):me();if(online()&&hero===me()&&deny(name))return false;return old.apply(this,arguments)};
    wrapped.__turnOwner33618=true;wrapped.__turnOwnerOriginal33618=old;window[name]=wrapped;
  }
  function reactionVisible33618(){
    try{const ov=document.getElementById('reactionOverlay');return reactionDepth33618>0||!!(ov&&!ov.classList.contains('hidden'))}catch(_){return reactionDepth33618>0}
  }
  function wrapReaction33618(name){
    const old=window[name];if(typeof old!=='function'||old.__turnReaction33618)return;
    const wrapped=function(){
      reactionDepth33618++;renderTurnUi();let out;
      try{out=old.apply(this,arguments)}catch(e){reactionDepth33618=Math.max(0,reactionDepth33618-1);renderTurnUi();throw e}
      const finish=()=>{try{if(typeof mpScheduleState==='function')mpScheduleState()}catch(_){}reactionDepth33618=Math.max(0,reactionDepth33618-1);renderTurnUi()};
      if(out&&typeof out.then==='function')return Promise.resolve(out).finally(finish);
      finish();return out;
    };
    wrapped.__turnReaction33618=true;wrapped.__turnReactionOriginal33618=old;window[name]=wrapped;
  }
  function installReactionGates33618(){
    ['reactionWindow','allyProtectionWindow','lyraDeclaredReactionWindow','lyraAfterAttackWindow','lyraEnemyEntryReactionWindow','runtimeHeroReactionWindow','extraEnemyEntryReactionWindow'].forEach(wrapReaction33618);
  }
  function installFunctionGates(){
    wrapNormal('attack');wrapNormal('explore');wrapNormal('search');wrapNormal('runtimeHeroMove');
    wrapNormal('move',()=> 'Aldric');wrapNormal('moveLyra',()=> 'Lyra');wrapNormal('moveSeraphine',()=> 'Seraphine');
    wrapNormal('playHandCard',()=> 'Aldric');wrapNormal('playLyraCard',()=> 'Lyra');wrapNormal('playSeraphineCard',()=> 'Seraphine');wrapNormal('playExtraCard');
    wrapNormal('q001SpendAction');wrapNormal('q002MoveWagon');wrapNormal('q002OpenStrongbox');
    wrapNormal('craftRecipe');wrapNormal('activateEquipment33612');
  }
  function safeControl(el){
    if(!el)return true;
    const id=String(el.id||'').toLowerCase(),txt=String(el.textContent||'').toLowerCase();
    if(el.closest?.('#reactionOverlay'))return true;
    if(el.closest?.('.enemy'))return true; // inspection only
    if(id==='startturn33618'||id==='pass32521')return true;
    if(/sound|log|debug|inventory|merchant|crafting|profile|close|mute|volume|tab|help|save|leave|kick/.test(id+' '+txt))return true;
    return false;
  }
  document.addEventListener('click',ev=>{
    if(!online()||!inHeroPhase()||myTurn())return;
    const el=ev.target?.closest?.('button,.tile,.handCard,.card');if(!el||safeControl(el))return;
    const id=String(el.id||'').toLowerCase(),txt=String(el.textContent||'').toLowerCase();
    const actionish=el.classList.contains('tile')||el.closest?.('#hand,#lyraHand,#seraphineHand,#runtimeHeroHand')||/attack|move|search|explore|extinguish|escort|wagon|strongbox|beacon|play|potion|heal|destroy|sabotage|ability|totem|craft/.test(id+' '+txt);
    if(!actionish)return;
    ev.preventDefault();ev.stopImmediatePropagation();deny('take that Action');
  },true);
  const render0=window.render;
  if(typeof render0==='function')window.render=function(){const out=render0.apply(this,arguments);installFunctionGates();installReactionGates33618();renderTurnUi();return out};
  installFunctionGates();installReactionGates33618();
  function boot(){
    window.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;
    const e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V;
    installFunctionGates();installReactionGates33618();renderTurnUi();
  }
  // Extend copied diagnostics so the product build and room turn owner are unambiguous.
  try{const dbg=window.ascDebug3271;if(dbg&&typeof dbg.report==='function'&&!dbg.__turnOwnerReport33618){const report0=dbg.report.bind(dbg);dbg.report=function(){const x=report0();x.productBuild=V;x.serverBuild33619=serverBuild();x.turnAuthority33618=state();return x};dbg.__turnOwnerReport33618=true}}catch(_){}
  window.ascTurnReaction33618={pending:reactionVisible33618,depth:()=>reactionDepth33618};
  window.ascendance33618=()=>({build:V,serverBuild:serverBuild(),serverCompatible:serverCompatible(),protocol:state()?.turnProtocol||'',online:online(),hero:me(),turn:state(),myTurn:myTurn(),passed:myPassed(),started:!!state()?.started?.[me()],actions:myActions()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  [100,900,2500,6000,8000,9800,12500,14000].forEach(ms=>setTimeout(boot,ms));const marker33618=setInterval(boot,500);setTimeout(()=>clearInterval(marker33618),15000);
})();
