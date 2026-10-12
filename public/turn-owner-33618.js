// Ascendance 3.36.18 — room-authoritative Hero turn ownership.
// Activation order remains player-chosen. Between turns turnHero is null; any unfinished Hero may claim next.
(()=>{
  const V='3.36.18';
  let turn=null, claimPending=false, passPending=false, lastNotice='', autoPassKey='';
  const ROSTER=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
  function remote(){try{return mpMode==='remote'&&mpConnected()&&!!mpRoom&&!!mpJoinReady}catch(_){return false}}
  function activeAdventure(){try{return document.body.dataset.ascAdventureActive==='1'}catch(_){return false}}
  function me(){try{return String(mpRole||'')}catch(_){return ''}}
  function heroName(h){try{return heroDisplayName(h)}catch(_){return h||'Hero'}}
  function actions(h){try{return Math.max(0,Number(heroActionCount(h)||0))}catch(_){return 0}}
  function pending(){try{return !!(pLoc||pSearch||pEnc||g?.activeEncounter320||g?.specialLocationReveal)}catch(_){return false}}
  function heroPhase(){return !!(g&&g.phase==='Hero Phase'&&!turn?.resolving)}
  function passed(h=me()){return !!turn?.passed?.[h]}
  function owner(){return turn?.turnHero||null}
  function mine(){return !!(remote()&&activeAdventure()&&heroPhase()&&owner()===me()&&!passed())}
  function eligible(){const h=me();return !!(remote()&&activeAdventure()&&heroPhase()&&ROSTER.includes(h)&&!passed(h)&&actions(h)>0)}
  function diag(type,detail={}){try{window.ascDebug3271?.events?.push({t:new Date().toISOString().slice(11,23),dir:'TURN',type,detail,s:window.ascDebug3271.snap()})}catch(_){}}
  function cmdId(op){return `${mpRoom||'ROOM'}-R${turn?.round??g?.round??0}-${me()||'H'}-${op}-33618-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}
  function send(op,extra={}){
    if(!remote()||!activeAdventure()||!turn)return false;
    const data={id:cmdId(op),op,hero:me(),round:Number(turn.round||g?.round||0),clientVersion:V,...extra};
    mpSend('TURN_COMMAND',data);diag('TURN_OWNER_COMMAND_33618',data);return true;
  }
  function claim(){
    if(!eligible()||claimPending)return false;
    if(owner()===me())return true;
    if(owner()){notice(`It is ${heroName(owner())}'s turn.`);return false}
    claimPending=true;send('CLAIM_TURN',{reason:'player-claim'});renderTurn();return false;
  }
  function endMine(reason='player-end'){
    if(!mine()||passPending)return false;
    passPending=true;send('PASS',{reason,heldActions:actions(me())});renderTurn();return true;
  }
  function notice(msg){
    if(msg===lastNotice)return;lastNotice=msg;
    try{log(msg)}catch(_){}
    try{mpSetStatus(`Connected · ${me()} · ${msg}`)}catch(_){}
  }
  function allowNormal(h=me(),action='take that Action'){
    if(!remote()||!activeAdventure()||!heroPhase())return true;
    if(passed(h)){notice(`${heroName(h)} already completed their Hero turn. Held Actions are reserved for Reactions.`);return false}
    const o=owner();
    if(o===h)return true;
    if(o){notice(`It is ${heroName(o)}'s turn. ${heroName(h)} may still use valid Reactions.`);return false}
    claim();notice(`${heroName(h)} is claiming the next turn. Use ${action} after the TURN banner shows YOUR TURN.`);return false;
  }
  function isReactionElement(el){
    if(!el)return false;const txt=((el.textContent||'')+' '+(el.id||'')+' '+(el.className||'')).toLowerCase();
    return /reaction|raise shield|brace|interpose|shield escort|veteran.?s resolve|dodge roll|divine shield|arcane barrier|barkskin|deflect|warding hex|ignore the pain|too angry to fall|soul shield|bone shield|dead interpose|protective ancestor|spirit warning|en garde|sidestep|acrobatic escape|blood for blood|static reprisal/.test(txt);
  }
  function isManagement(el){
    if(!el)return true;const txt=((el.textContent||'')+' '+(el.id||'')+' '+(el.className||'')).toLowerCase();
    return /turn33618|sound|debug|log|inventory|merchant|craft|profile|close|settings|help|leave game|campaign|world map|save/.test(txt);
  }
  function looksNormalAction(el){
    if(!el)return false;const txt=((el.textContent||'')+' '+(el.id||'')+' '+(el.className||'')).toLowerCase();
    if(el.classList?.contains('tile'))return true;
    return /attack|move|search|explore|extinguish|escort|wagon|strongbox|beacon|play card|hero card|heal|potion|destroy|free prisoner|sabotage|open sealed|interact|use ability|spend .*action|action card/.test(txt);
  }
  document.addEventListener('click',ev=>{
    if(!remote()||!activeAdventure()||!heroPhase())return;
    const el=ev.target?.closest?.('button,.tile,.handCard,.card');if(!el||isManagement(el)||isReactionElement(el)||!looksNormalAction(el))return;
    if(!allowNormal(me(),(el.textContent||'that Action').trim().slice(0,60))){ev.preventDefault();ev.stopImmediatePropagation();renderTurn()}
  },true);
  function wrap(name,heroFn,cardAware=false){
    const old=window[name];if(typeof old!=='function'||old.__turnOwner33618)return;
    const f=function(){
      const h=heroFn?heroFn.apply(this,arguments):me();
      if(cardAware&&arguments[0]?.speed==='Reaction')return old.apply(this,arguments);
      if(!allowNormal(h,name))return false;
      return old.apply(this,arguments)
    };
    f.__turnOwner33618=true;window[name]=f;
  }
  function installGuards(){
    ['attack','explore','search','runtimeHeroMove','spendActiveAction'].forEach(n=>wrap(n));
    wrap('move',()=> 'Aldric');wrap('playHandCard',()=> 'Aldric');
    wrap('moveLyra',()=> 'Lyra');wrap('playLyraCard',()=> 'Lyra');
    wrap('moveSeraphine',()=> 'Seraphine');wrap('playSeraphineCard',()=> 'Seraphine');
    wrap('playExtraCard',()=>me(),true);
    wrap('q001SpendAction');
  }
  function ensureUi(){
    let box=document.getElementById('turnOwner33618');if(box)return box;
    box=document.createElement('div');box.id='turnOwner33618';box.innerHTML='<span id="turnLabel33618"></span><button id="turnAction33618" type="button"></button>';
    document.body.appendChild(box);
    box.querySelector('#turnAction33618').onclick=()=>{if(owner()===me())endMine('player-end-turn');else claim()};
    return box;
  }
  function renderTurn(){
    const box=ensureUi(),lab=box.querySelector('#turnLabel33618'),btn=box.querySelector('#turnAction33618');
    const show=remote()&&activeAdventure()&&g?.phase==='Hero Phase'&&turn;box.style.display=show?'flex':'none';if(!show)return;
    const o=owner(),h=me(),a=actions(h),done=passed(h);
    if(turn.resolving){lab.textContent='ROUND RESOLVING';btn.style.display='none';return}
    btn.style.display='';
    if(o){lab.textContent=o===h?`YOUR TURN · ${heroName(h)} · ${a} Action${a===1?'':'s'}`:`TURN · ${heroName(o)}`;btn.textContent=o===h?(a?`End Turn · Hold ${a}`:'End Turn'):'Waiting…';btn.disabled=o!==h||passPending}
    else if(done){lab.textContent='TURN · Waiting for another Hero';btn.textContent='Turn Complete';btn.disabled=true}
    else if(a<=0){lab.textContent=`${heroName(h)} · 0 Actions`;btn.textContent='No Actions';btn.disabled=true}
    else {lab.textContent='TURN · Choose next Hero';btn.textContent=claimPending?'Claiming…':'Start My Turn';btn.disabled=claimPending}
    try{document.body.dataset.ascTurnHero33618=o||'';document.body.classList.toggle('notMyTurn33618',!!o&&o!==h)}catch(_){}
  }
  function patchDebug(){
    const dbg=window.ascDebug3271;if(!dbg||dbg.__turnOwner33618)return;
    const snap0=typeof dbg.snap==='function'?dbg.snap.bind(dbg):null,report0=typeof dbg.report==='function'?dbg.report.bind(dbg):null;
    if(snap0)dbg.snap=function(){const s=snap0()||{};return {...s,turnHero:owner(),turnOwnerVersion:V}};
    if(report0)dbg.report=function(){const r=report0()||{};return {...r,version:V,turn:turn?JSON.parse(JSON.stringify(turn)):null,state:{...(r.state||{}),turnHero:owner(),turnOwnerVersion:V}}};
    dbg.__turnOwner33618=true;
  }
  function apply(t,why='server'){
    if(!t||typeof t!=='object')return;turn={...t,actions:{...(t.actions||{})},passed:{...(t.passed||{})}};
    claimPending=false;passPending=false;if(g)g.turnHero33618=turn.turnHero||null;
    diag('TURN_OWNER_STATE_33618',{why,round:turn.round,turnHero:turn.turnHero||null,passed:turn.passed,actions:turn.actions});renderTurn();
  }
  const handle0=window.mpHandleMessage;
  window.mpHandleMessage=function(m){
    if(m?.room===mpRoom){
      if(m.type==='TURN_STATE')apply(m.data,'turn-state');
      else if(['TURN_COMMAND_ACK','TURN_COMMAND_REJECTED'].includes(m.type)&&m.data?.turn)apply(m.data.turn,m.type.toLowerCase());
      if(m.type==='TURN_COMMAND_REJECTED'&&m.data?.reason)notice(m.data.reason);
    }
    const out=handle0.apply(this,arguments);setTimeout(renderTurn,0);return out;
  };
  const render0=window.render;window.render=function(){const r=render0.apply(this,arguments);installGuards();patchDebug();renderTurn();return r};
  setInterval(()=>{
    installGuards();patchDebug();renderTurn();
    if(!mine()||actions(me())>0||pending())return;
    const k=`${turn?.round}|${me()}`;if(autoPassKey===k)return;autoPassKey=k;endMine('zero-actions-auto-end');
  },250);
  window.ascendanceTurnOwner33618=()=>({build:V,room:String(mpRoom||''),hero:me(),turnHero:owner(),mine:mine(),eligible:eligible(),turn:turn?JSON.parse(JSON.stringify(turn)):null,localActions:actions(me()),pending:pending()});
  window.ASCENDANCE_BUILD=V;
  function boot(){installGuards();patchDebug();ensureUi();renderTurn();window.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;const e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,200);setTimeout(boot,1600);setTimeout(boot,5000);
})();
