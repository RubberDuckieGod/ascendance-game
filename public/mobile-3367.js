(()=>{
'use strict';
const V='3.36.7';
const MOBILE='(max-width:760px)',LAND='(orientation:landscape) and (max-height:500px) and (max-width:950px)';
const isMobile=()=>matchMedia(MOBILE).matches||matchMedia(LAND).matches;
let cardIndex=0, cardUid=null, logObserver=null, touchStartX=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function controlled(){try{return typeof controlledHero==='function'?controlledHero():(g?.activeHero||'Aldric')}catch(_){return 'Aldric'}}
function handInfo(){
  const h=controlled(); let hand=[],summary='',container=null;
  try{
    if(h==='Aldric'){hand=g?.heroHand||[];summary=document.getElementById('deckSummary')?.textContent||'';container=document.getElementById('hand')}
    else if(h==='Lyra'){hand=g?.lyraHand||[];summary=document.getElementById('lyraDeckSummary')?.textContent||'';container=document.getElementById('lyraHand')}
    else if(h==='Seraphine'){hand=g?.seraphineHand||[];summary=document.getElementById('seraphineDeckSummary')?.textContent||'';container=document.getElementById('seraphineHand')}
    else {const st=typeof runtimeHeroState==='function'?runtimeHeroState(h):g?.heroRuntimeStates?.[h];hand=st?.hand||[];summary=document.getElementById('extraDeckSummary')?.textContent||'';container=document.getElementById('runtimeHeroHand')}
  }catch(_){}
  return {hero:h,hand,summary,container};
}
function rulesFor(c){
  if(c?.rules)return c.rules;
  try{if(typeof cardTooltipText==='function')return cardTooltipText(c)||''}catch(_){}
  return c?.text||c?.effect||'No rules text available.';
}
function metaFor(h,c){
  let cost=Number(c?.cost||0);
  try{if(h!=='Aldric'&&h!=='Lyra'&&h!=='Seraphine'&&typeof extraCardActionCost32611==='function')cost=extraCardActionCost32611(h,c,typeof runtimeHeroState==='function'?runtimeHeroState(h):null)}catch(_){}
  const bits=[]; if(c?.category)bits.push(c.category); if(c?.speed)bits.push(c.speed); bits.push(`Cost ${cost}`); if(c?.target)bits.push(c.target);
  return {cost,bits};
}
function originalButton(info,idx){try{return info.container?.querySelectorAll('button')?.[idx]||null}catch(_){return null}}
function ensureOverlays(){
  if(!document.getElementById('ascMobileCardsOverlay3367')){
    const el=document.createElement('section'); el.id='ascMobileCardsOverlay3367'; el.className='ascMobileFullOverlay3367'; el.setAttribute('aria-label','Hero cards');
    el.innerHTML=`<header class="ascMobileFullHead3367"><div><div class="ascMobileEyebrow3367">HERO HAND</div><h2 id="ascMobileCardsTitle3367">Cards</h2><div id="ascMobileCardsSummary3367" class="ascMobileSub3367"></div></div><button class="ascMobileClose3367" id="ascMobileCardsClose3367">Close</button></header>
    <main class="ascMobileCardsMain3367"><div class="ascMobileCardPicker3367"><label for="ascMobileCardSelect3367">Card</label><select id="ascMobileCardSelect3367"></select></div><article class="ascMobileCard3367" id="ascMobileCard3367"><div class="ascMobileEmpty3367">No cards in hand.</div></article></main>
    <footer class="ascMobileCardNav3367"><button id="ascMobileCardPrev3367">← Previous</button><div id="ascMobileCardCount3367">0 / 0</div><button class="primary" id="ascMobileCardPlay3367">Play</button><button id="ascMobileCardNext3367">Next →</button></footer>`;
    document.body.appendChild(el);
    el.querySelector('#ascMobileCardsClose3367').onclick=closeFull;
    el.querySelector('#ascMobileCardPrev3367').onclick=()=>stepCard(-1);
    el.querySelector('#ascMobileCardNext3367').onclick=()=>stepCard(1);
    el.querySelector('#ascMobileCardSelect3367').onchange=e=>{cardIndex=Math.max(0,Number(e.target.value)||0);cardUid=null;renderCards()};
    el.querySelector('#ascMobileCardPlay3367').onclick=playCurrent;
    el.addEventListener('touchstart',e=>{touchStartX=e.changedTouches?.[0]?.clientX??null},{passive:true});
    el.addEventListener('touchend',e=>{if(touchStartX==null)return;const dx=(e.changedTouches?.[0]?.clientX??touchStartX)-touchStartX;touchStartX=null;if(Math.abs(dx)>55)stepCard(dx<0?1:-1)},{passive:true});
  }
  if(!document.getElementById('ascMobileLogOverlay3367')){
    const el=document.createElement('section');el.id='ascMobileLogOverlay3367';el.className='ascMobileFullOverlay3367';el.setAttribute('aria-label','Adventure log');
    el.innerHTML=`<header class="ascMobileFullHead3367"><div><div class="ascMobileEyebrow3367">ADVENTURE</div><h2>Adventure Log</h2><div class="ascMobileSub3367">Newest entries appear first</div></div><button class="ascMobileClose3367" id="ascMobileLogClose3367">Close</button></header><main id="ascMobileLogContent3367" class="ascMobileLogContent3367" aria-live="polite"></main>`;
    document.body.appendChild(el);el.querySelector('#ascMobileLogClose3367').onclick=closeFull;
  }
}
function updateDock(){
  const openCards=document.body.classList.contains('ascMobileCardsFull3367'),openLog=document.body.classList.contains('ascMobileLogFull3367');
  document.querySelectorAll('.ascMobileDock3361 button[data-pane]').forEach(b=>{if(b.dataset.pane==='cards')b.classList.toggle('active',openCards);else if(b.dataset.pane==='log')b.classList.toggle('active',openLog);else if(openCards||openLog)b.classList.remove('active')});
}
function openCards(){if(!isMobile())return;ensureOverlays();try{window.ascMobile3361?.closeDrawers?.()}catch(_){};document.body.classList.remove('ascMobileLogFull3367');document.body.classList.add('ascMobileFull3367','ascMobileCardsFull3367');cardIndex=0;cardUid=null;renderCards();updateDock()}
function openLog(){if(!isMobile())return;ensureOverlays();try{window.ascMobile3361?.closeDrawers?.()}catch(_){};document.body.classList.remove('ascMobileCardsFull3367');document.body.classList.add('ascMobileFull3367','ascMobileLogFull3367');syncLog();updateDock()}
function closeFull(){document.body.classList.remove('ascMobileFull3367','ascMobileCardsFull3367','ascMobileLogFull3367');updateDock()}
function stepCard(delta){const n=handInfo().hand.length;if(!n)return;cardIndex=(cardIndex+delta+n)%n;cardUid=null;renderCards()}
function renderCards(){
  const overlay=document.getElementById('ascMobileCardsOverlay3367');if(!overlay)return;const info=handInfo(),hand=info.hand||[];
  if(cardUid){const idx=hand.findIndex(c=>c?.uid===cardUid);if(idx>=0)cardIndex=idx}
  if(cardIndex>=hand.length)cardIndex=Math.max(0,hand.length-1);
  const select=overlay.querySelector('#ascMobileCardSelect3367');select.innerHTML=hand.map((c,i)=>`<option value="${i}"${i===cardIndex?' selected':''}>${esc(c.name||`Card ${i+1}`)}</option>`).join('');
  overlay.querySelector('#ascMobileCardsTitle3367').textContent=`${info.hero} — Cards`;
  overlay.querySelector('#ascMobileCardsSummary3367').textContent=info.summary||`${hand.length} card${hand.length===1?'':'s'} in hand`;
  overlay.querySelector('#ascMobileCardCount3367').textContent=hand.length?`${cardIndex+1} / ${hand.length}`:'0 / 0';
  const prev=overlay.querySelector('#ascMobileCardPrev3367'),next=overlay.querySelector('#ascMobileCardNext3367'),play=overlay.querySelector('#ascMobileCardPlay3367');prev.disabled=next.disabled=hand.length<2;
  const box=overlay.querySelector('#ascMobileCard3367'); if(!hand.length){box.innerHTML='<div class="ascMobileEmpty3367">No cards in hand.</div>';play.disabled=true;play.textContent='No Card';return}
  const c=hand[cardIndex],meta=metaFor(info.hero,c),orig=originalButton(info,cardIndex);cardUid=c?.uid||null;
  const rules=rulesFor(c),traits=c?.traits||c?.keywords||'';
  box.innerHTML=`<div class="ascMobileCardTop3367"><div><div class="ascMobileCardName3367">${esc(c?.name||'Hero Card')}</div><div class="ascMobileCardMeta3367">${meta.bits.map(esc).join(' · ')}</div></div><div class="ascMobileCost3367">${meta.cost}</div></div><div class="ascMobileRulesLabel3367">RULES</div><div class="ascMobileRules3367">${esc(rules)}</div>${traits?`<div class="ascMobileTraits3367">${esc(traits)}</div>`:''}`;
  const reaction=String(c?.speed||'').toLowerCase()==='reaction';const disabled=!!orig?.disabled||reaction||!orig;
  play.disabled=disabled; play.textContent=reaction?'Reaction · triggers when legal':disabled?'Cannot Play Now':`Play · ${meta.cost} Action${meta.cost===1?'':'s'}`;
}
function playCurrent(){const info=handInfo(),hand=info.hand||[];if(!hand.length)return;const orig=originalButton(info,cardIndex);if(!orig||orig.disabled)return;orig.click();setTimeout(()=>{const next=handInfo().hand||[];if(cardIndex>=next.length)cardIndex=Math.max(0,next.length-1);cardUid=null;renderCards()},80)}
function syncLog(){const src=document.getElementById('log'),dst=document.getElementById('ascMobileLogContent3367');if(!src||!dst)return;dst.innerHTML=src.innerHTML;if(dst.scrollTop>8)dst.scrollTop=0}
function watchLog(){const src=document.getElementById('log');if(!src||logObserver)return;logObserver=new MutationObserver(()=>{if(document.body.classList.contains('ascMobileLogFull3367'))syncLog()});logObserver.observe(src,{childList:true,subtree:true,characterData:true})}
function watchHands(){['hand','lyraHand','seraphineHand','runtimeHeroHand'].forEach(id=>{const el=document.getElementById(id);if(!el)return;new MutationObserver(()=>{if(document.body.classList.contains('ascMobileCardsFull3367'))renderCards()}).observe(el,{childList:true,subtree:true})})}
function wireDock(){const dock=document.getElementById('ascMobileDock3361');if(!dock)return false;const cards=dock.querySelector('[data-pane="cards"]'),log=dock.querySelector('[data-pane="log"]'),map=dock.querySelector('[data-pane="map"]'),hero=dock.querySelector('[data-pane="hero"]'),menu=dock.querySelector('[data-pane="menu"]');if(cards)cards.onclick=e=>{e.preventDefault();openCards()};if(log)log.onclick=e=>{e.preventDefault();openLog()};if(map){const old=map.onclick;map.onclick=e=>{closeFull();old?.call(map,e)}}if(hero){const old=hero.onclick;hero.onclick=e=>{closeFull();old?.call(hero,e)}}if(menu){const old=menu.onclick;menu.onclick=e=>{closeFull();old?.call(menu,e)}}return true}
function install(){if(!isMobile()&&document.body)return;ensureOverlays();if(!wireDock())setTimeout(wireDock,120);watchLog();watchHands();addEventListener('resize',()=>{if(!isMobile())closeFull();else renderCards()});addEventListener('orientationchange',()=>setTimeout(()=>{if(document.body.classList.contains('ascMobileCardsFull3367'))renderCards();if(document.body.classList.contains('ascMobileLogFull3367'))syncLog()},160));globalThis.ascMobile3367={version:V,openCards,openLog,close:closeFull,renderCards,isMobile}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
