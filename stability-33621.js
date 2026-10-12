// Ascendance 3.36.21 — Stability / regression foundation.
// Loaded last. It does not own game rules; it prevents older layers from silently mutating
// authoritative Action state and continuously audits critical cross-system invariants.
(()=>{
 'use strict';
 const V='3.36.21';
 let depth=0,outer=null,authorized={};
 const actionCount=h=>{try{return Number(heroActionCount(h)||0)}catch(_){return 0}};
 const remote=()=>{try{return mpMode==='remote'&&mpConnected()&&!!mpRoom&&!!mpJoinReady}catch(_){return false}};
 const display=h=>{try{return heroDisplayName(h)||h}catch(_){return h||'Hero'}};
 function diag(type,detail={}){try{window.ascDebug3271?.events?.push({t:new Date().toISOString().slice(11,23),dir:'STABILITY',type,detail,s:window.ascDebug3271.snap()})}catch(_){} }
 function authorize(hero,delta,label){if(!delta)return;authorized[hero]=(Number(authorized[hero]||0)+Number(delta));diag('ACTION_TRANSACTION_AUTHORIZED_33621',{hero,delta,label,pending:authorized[hero]})}
 function begin(hero,label){if(depth===0)outer={hero,before:actionCount(hero),label:String(label||'Action')};depth++;return outer}
 function finish(){if(depth<=0)return;depth--;if(depth!==0||!outer)return;const x=outer;outer=null;const after=actionCount(x.hero),delta=after-x.before;if(delta&&remote())authorize(x.hero,delta,x.label);if(remote()&&delta){try{mpScheduleState()}catch(_){}}}
 function consume(hero,delta,reason){let p=Number(authorized[hero]||0),d=Number(delta||0);if(!d)return true;if(!p||Math.sign(p)!==Math.sign(d)||Math.abs(p)<Math.abs(d))return false;authorized[hero]=p-d;if(Math.abs(authorized[hero])<1e-9)delete authorized[hero];diag('ACTION_TRANSACTION_COMMIT_33621',{hero,delta:d,reason,remaining:Number(authorized[hero]||0)});return true}
 function reset(){depth=0;outer=null;authorized={};diag('ACTION_TRANSACTION_RESET_33621',{})}
 window.ascActionGuard33621={depth:()=>depth,begin,finish,consume,pending:()=>({...authorized}),reset};
 function wrap(name,heroFn){
  const old=window[name];if(typeof old!=='function'||old.__stability33621)return;
  const w=function(){let hero;try{hero=heroFn?heroFn.apply(this,arguments):controlledHero()}catch(_){hero=''};begin(hero,name);let out;
   try{out=old.apply(this,arguments)}catch(e){finish();throw e}
   if(out&&typeof out.then==='function')return Promise.resolve(out).finally(finish);finish();return out};
  w.__stability33621=true;w.__stabilityOriginal33621=old;window[name]=w;
 }
 function installActionTransactions(){
  wrap('attack');wrap('move',()=> 'Aldric');wrap('moveLyra',()=> 'Lyra');wrap('moveSeraphine',()=> 'Seraphine');wrap('runtimeHeroMove');
  wrap('playHandCard',()=> 'Aldric');wrap('playLyraCard',()=> 'Lyra');wrap('playSeraphineCard',()=> 'Seraphine');wrap('playExtraCard');
  wrap('q001SpendAction');wrap('q002MoveWagon');wrap('q002OpenStrongbox');wrap('q003OpenArmory3304');wrap('q010ObjectiveAttack3231');wrap('q012BannerAction3231');
  wrap('genericQuestHeroAction');wrap('genericQuestAction');wrap('useConsumable',(hero)=>hero);wrap('activateEquipment33612');wrap('craftRecipe');
 }
 function heroState(h){try{if(h==='Aldric')return {hp:Number(g.hp||0),actions:Number(g.actions||0)};if(h==='Lyra')return g.lyra;if(h==='Seraphine')return g.seraphine;return runtimeHeroState(h)}catch(_){return null}}
 function sameLoc(a,b){try{const x=heroPos(a),y=heroPos(b);return x&&y&&x.x===y.x&&x.y===y.y}catch(_){return false}}
 function audit(){
  const issues=[],t=window.ascRoomTurn33618?.state?.()||null,party=typeof partyHeroes==='function'?partyHeroes():[];
  for(const hero of party){const st=heroState(hero),a=actionCount(hero);if(!Number.isInteger(a)||a<0||a>6)issues.push({rule:'ACTION_RANGE',hero,actions:a});
   const fate=g?.campaign?.heroFates?.[hero]?.status;if(fate==='Downed'&&Number(st?.hp||0)!==0)issues.push({rule:'DOWNED_HP_ZERO',hero,hp:st?.hp});
   if(fate==='Dead'&&Number(st?.hp||0)>0)issues.push({rule:'DEAD_HP',hero,hp:st?.hp});
  }
  if(remote()&&t){
   if(String(t.serverBuild||'')!=='3.36.21'||String(t.turnProtocol||'')!=='room-turn-owner-v2')issues.push({rule:'SERVER_PROTOCOL',serverBuild:t.serverBuild,turnProtocol:t.turnProtocol});
   if(t.turnHero&&(!party.includes(t.turnHero)||t.passed?.[t.turnHero]||!t.started?.[t.turnHero]||Number(heroState(t.turnHero)?.hp||0)<=0))issues.push({rule:'TURN_OWNER_INVALID',turnHero:t.turnHero});
   for(const hero of party){const auth=Number(t.actions?.[hero]||0),local=actionCount(hero);if(!t.started?.[hero]&&auth!==0)issues.push({rule:'UNSTARTED_HAS_ACTIONS',hero,actions:auth});if(auth!==local&&depth===0)issues.push({rule:'ACTION_DESYNC',hero,authoritative:auth,local});}
  }
  try{const q=g?.campaign?.q001,lookout=Object.values(g?.tiles||{}).some(x=>x?.id==='L006');if(g?.campaign?.currentQuest==='Q001'&&lookout&&q&&!q.lookoutRevealed)issues.push({rule:'Q001_LOOKOUT_FLAG',lookout:true,flag:false})}catch(_){}
  try{for(const hero of party){const zones=hero==='Aldric'?[g.heroDeck,g.heroHand,g.heroDiscard]:hero==='Lyra'?[g.lyraDeck,g.lyraHand,g.lyraDiscard]:hero==='Seraphine'?[g.seraphineDeck,g.seraphineHand,g.seraphineDiscard]:(()=>{const s=runtimeHeroState(hero);return [s?.deck,s?.hand,s?.discard]})();const ids=zones.flatMap(x=>Array.isArray(x)?x:[]).map(x=>x?.uid).filter(Boolean);if(ids.length!==new Set(ids).size)issues.push({rule:'DUPLICATE_HERO_CARD_UID',hero})}}catch(_){}
  return {build:V,ok:issues.length===0,issues,turn:t,party};
 }
 function enforce(context='runtime'){const a=audit();if(!a.ok){for(const issue of a.issues){diag('STATE_INVARIANT_FAILED_33621',{context,...issue});try{console.warn('[ASCENDANCE 3.36.21 INVARIANT]',context,issue)}catch(_){}}}return a}
 window.ascendanceStability33621={audit,enforce,transactions:()=>({depth,pending:{...authorized}}),version:V};
 function mark(){window.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;const e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}
 function installReset(){const old=window.init;if(typeof old!=='function'||old.__stabilityReset33621)return;const w=function(){reset();return old.apply(this,arguments)};w.__stabilityReset33621=true;window.init=w}
 function boot(){installReset();installActionTransactions();mark();try{enforce('boot')}catch(_){} }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
 [100,700,1800,3200,5200,8000,12000,15000].forEach(ms=>setTimeout(()=>{installReset();installActionTransactions();mark()},ms));
 setInterval(()=>{try{installReset();installActionTransactions();if(!remote()&&Object.keys(authorized).length)authorized={};enforce('periodic')}catch(_){}},5000);
})();
