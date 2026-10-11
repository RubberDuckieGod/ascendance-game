(()=>{
'use strict';
const V='3.36.10', MOBILE='(max-width:760px)', LAND='(orientation:landscape) and (max-height:500px) and (max-width:950px)';
const isMobile=()=>matchMedia(MOBILE).matches||matchMedia(LAND).matches;
const by=id=>document.getElementById(id);
let questObs=null, bodyObs=null, lastTransition='', enemyHome=null, enemyNext=null;
function closeOlder(){
 try{window.ascMobile3367?.close?.()}catch(_){}
 try{window.ascMobile3368?.closeExplore?.()}catch(_){}
 try{window.ascMobile3369?.closeSearch?.()}catch(_){}
 try{window.ascMobile3369?.closeEncounter?.()}catch(_){}
 try{window.ascMobile3361?.closeDrawers?.()}catch(_){}
 document.body.classList.remove('ascMobileQuestFull33610','ascMobileMenuFull33610');
}
function visible(el){return !!(el && !el.classList.contains('hidden') && getComputedStyle(el).display!=='none')}
function ensure(){
 if(!by('ascMobileQuestOverlay33610')){
  const q=document.createElement('section');q.id='ascMobileQuestOverlay33610';q.className='ascMobileParityOverlay33610';q.setAttribute('aria-label','Quest and objective');
  q.innerHTML=`<header class="ascMobileParityHead33610"><div><div class="ascMobileParityEyebrow33610">QUEST</div><h2 id="ascMobileQuestTitle33610">Quest</h2><div id="ascMobileQuestStory33610" class="ascMobileParitySub33610"></div></div><button id="ascMobileQuestClose33610">View Map</button></header><main class="ascMobileParityMain33610"><section class="ascMobileParityCard33610"><div class="ascMobileParityLabel33610">OBJECTIVE</div><div id="ascMobileQuestStatus33610" class="ascMobileQuestStatus33610"></div><div id="ascMobileQuestActions33610" class="ascMobileQuestActions33610"></div></section><section id="ascMobileQuestTransitionCard33610" class="ascMobileParityCard33610 ascMobileQuestTransitionCard33610 hidden"><div class="ascMobileParityLabel33610">CAMPAIGN / DOWNTIME</div><div id="ascMobileQuestTransition33610"></div></section></main>`;
  document.body.appendChild(q);by('ascMobileQuestClose33610').onclick=closeQuest;
 }
 if(!by('ascMobileMenuOverlay33610')){
  const m=document.createElement('section');m.id='ascMobileMenuOverlay33610';m.className='ascMobileParityOverlay33610';m.setAttribute('aria-label','Game menu');
  m.innerHTML=`<header class="ascMobileParityHead33610"><div><div class="ascMobileParityEyebrow33610">ASCENDANCE</div><h2>Game Menu</h2><div class="ascMobileParitySub33610">Campaign, management, and session tools</div></div><button id="ascMobileMenuClose33610">Close</button></header><main class="ascMobileParityMain33610"><div class="ascMobileMenuGrid33610"><button data-go="quest">📜 Quest & Objectives</button><button data-go="inventory">🎒 Inventory</button><button data-go="merchant">🪙 Merchant</button><button data-go="crafting">⚒ Crafting</button><button data-go="downtime">⛺ Downtime</button><button data-go="worldmap">🗺 World Map</button><button data-go="campaign">🏰 Campaign Hub</button><button data-go="quests">📚 World Event / Quests</button><button data-go="saves">💾 Campaign Saves</button><button data-go="profile">🛡 Hero Profile</button><button data-go="main">↩ Main Menu</button></div></main>`;
  document.body.appendChild(m);by('ascMobileMenuClose33610').onclick=closeMenu;
  m.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
 }
 if(!by('ascMobileQuestResume33610')){
  const b=document.createElement('button');b.id='ascMobileQuestResume33610';b.className='ascMobileQuestResume33610';b.textContent='📜 Quest Update';b.onclick=openQuest;document.body.appendChild(b);
 }
}
function proxyButtons(src, dst){
 dst.innerHTML=''; if(!src)return;
 [...src.querySelectorAll('button')].forEach((o,i)=>{
  let cs;try{cs=getComputedStyle(o)}catch(_){cs=null}
  if(o.hidden||o.classList.contains('hidden')||cs?.display==='none'||cs?.visibility==='hidden')return;
  const b=document.createElement('button');b.textContent=(o.textContent||`Action ${i+1}`).trim();b.disabled=!!o.disabled;if(o.classList.contains('primary'))b.classList.add('primary');
  b.onclick=()=>{if(o.isConnected&&!o.disabled){o.click();setTimeout(syncQuest,60);setTimeout(syncQuest,220)}};dst.appendChild(b);
 });
}
function syncQuest(){
 ensure();const src=by('questObjectivePanel');if(!src)return false;
 by('ascMobileQuestTitle33610').textContent=by('questTitle')?.textContent?.trim()||'Quest';
 by('ascMobileQuestStory33610').textContent=by('questStory')?.textContent?.trim()||'';
 by('ascMobileQuestStatus33610').innerHTML=by('questObjectiveStatus')?.innerHTML||'<div class="muted">No objective status available.</div>';
 const actionSrc=document.createElement('div');
 [...src.children].forEach(ch=>{if(ch.matches?.('div')&&ch.querySelector?.('button')&&ch.id!=='questTransition')actionSrc.appendChild(ch.cloneNode(true))});
 // Proxy against originals, not clones.
 const originals=[...src.querySelectorAll(':scope > div button')].filter(o=>!o.closest('#questTransition'));
 const ad=by('ascMobileQuestActions33610');ad.innerHTML='';originals.forEach((o,i)=>{let cs=getComputedStyle(o);if(o.hidden||o.classList.contains('hidden')||cs.display==='none'||cs.visibility==='hidden')return;let b=document.createElement('button');b.textContent=(o.textContent||`Action ${i+1}`).trim();b.disabled=!!o.disabled;if(o.classList.contains('primary'))b.classList.add('primary');b.onclick=()=>{if(!o.disabled)o.click();setTimeout(syncQuest,80)};ad.appendChild(b)});
 const tr=by('questTransition'), out=by('ascMobileQuestTransition33610'), card=by('ascMobileQuestTransitionCard33610');
 const txt=(tr?.textContent||'').replace(/\s+/g,' ').trim();
 if(txt){
  out.innerHTML=tr.innerHTML; card.classList.remove('hidden');
  const ob=[...tr.querySelectorAll('button')], cb=[...out.querySelectorAll('button')];cb.forEach((b,i)=>{const o=ob[i];b.onclick=e=>{e.preventDefault();if(o&&!o.disabled)o.click();setTimeout(syncQuest,80)}});
 }else{out.innerHTML='';card.classList.add('hidden')}
 const resume=by('ascMobileQuestResume33610');const full=document.body.classList.contains('ascMobileQuestFull33610');resume?.classList.toggle('show',isMobile()&&!!txt&&!full&&!document.body.classList.contains('ascMobileMenuFull33610'));
 return !!txt;
}
function openQuest(){if(!isMobile())return;closeOlder();ensure();syncQuest();document.body.classList.add('ascMobileQuestFull33610');syncModalState()}
function closeQuest(){document.body.classList.remove('ascMobileQuestFull33610');syncQuest();syncModalState()}
function openMenu(){if(!isMobile())return;closeOlder();ensure();document.body.classList.add('ascMobileMenuFull33610');syncModalState()}
function closeMenu(){document.body.classList.remove('ascMobileMenuFull33610');syncModalState()}
function clickText(rx){const all=[...document.querySelectorAll('button')];const b=all.find(x=>rx.test((x.textContent||'').trim())&&visible(x));if(b){b.click();return true}return false}
function go(which){
 closeMenu();
 if(which==='quest')return openQuest();
 if(which==='inventory'||which==='merchant'||which==='crafting'||which==='downtime'){try{openInventoryScreen(which);setTimeout(syncModalState,30);return}catch(_){}}
 if(which==='worldmap'){try{if(typeof openWorldMap3342==='function'){openWorldMap3342();setTimeout(syncModalState,30);return}}catch(_){}}
 if(which==='campaign'){if(clickText(/^Campaign$/i)){setTimeout(syncModalState,30);return}}
 if(which==='quests'){if(clickText(/World Event\s*\/\s*Quests/i)){setTimeout(syncModalState,30);return}}
 if(which==='saves'){if(clickText(/^Campaign Saves$/i)){setTimeout(syncModalState,30);return}}
 if(which==='profile'){if(clickText(/Hero Profile/i)){setTimeout(syncModalState,30);return}}
 if(which==='main'){if(clickText(/^Main Menu$/i))return;try{returnToLobby()}catch(_){}}
}
function portalEnemy(){const e=by('enemyPanel');if(!e)return;if(!enemyHome){enemyHome=e.parentNode;enemyNext=e.nextSibling}if(isMobile()){if(e.parentNode!==document.body)document.body.appendChild(e)}else if(enemyHome&&e.parentNode!==enemyHome){enemyHome.insertBefore(e,enemyNext&&enemyNext.parentNode===enemyHome?enemyNext:null)}}
function highOverlayOpen(){
 portalEnemy();
 if(document.body.classList.contains('ascMobileQuestFull33610')||document.body.classList.contains('ascMobileMenuFull33610'))return true;
 if(visible(by('reactionOverlay'))||visible(by('inventoryOverlay'))||visible(by('enemyPanel')))return true;
 for(const id of ['campaignHubOverlay32538','saveManagerOverlay32542','questBoardOverlay32543','heroProfileOverlay32546','campaignJournalOverlay32548'])if(by(id))return true;
 const wm=by('worldMapOverlay3342');if(wm&&!wm.classList.contains('hidden'))return true;
 return false;
}
function syncModalState(){if(!document.body)return;document.body.classList.toggle('ascMobileParityModal33610',isMobile()&&highOverlayOpen())}
function wireDock(){const d=by('ascMobileDock3361');if(!d)return false;const m=d.querySelector('[data-pane="menu"]');if(m&&!m.dataset.parity33610){m.dataset.parity33610='1';m.onclick=e=>{e.preventDefault();openMenu()}}return true}
function watch(){
 const q=by('questObjectivePanel');if(q&&!questObs){questObs=new MutationObserver(()=>{const before=lastTransition;syncQuest();const now=(by('questTransition')?.textContent||'').replace(/\s+/g,' ').trim();if(isMobile()&&now&&now!==before&&!document.body.classList.contains('ascMobileQuestFull33610'))by('ascMobileQuestResume33610')?.classList.add('show');lastTransition=now;syncModalState()});questObs.observe(q,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style','disabled']});lastTransition=(by('questTransition')?.textContent||'').replace(/\s+/g,' ').trim()}
 if(document.body&&!bodyObs){bodyObs=new MutationObserver(()=>syncModalState());bodyObs.observe(document.body,{childList:true,subtree:false})}
 const reaction=by('reactionOverlay'),inv=by('inventoryOverlay'),enemy=by('enemyPanel');[reaction,inv,enemy].filter(Boolean).forEach(el=>new MutationObserver(syncModalState).observe(el,{attributes:true,attributeFilter:['class','style']}));
}
function install(){ensure();syncQuest();wireDock();watch();syncModalState();document.addEventListener('click',()=>setTimeout(syncModalState,0),true);addEventListener('resize',()=>{if(!isMobile()){closeQuest();closeMenu()}syncModalState()});addEventListener('orientationchange',()=>setTimeout(()=>{syncQuest();syncModalState()},150));globalThis.ascMobile33610={version:V,isMobile,openQuest,closeQuest,openMenu,closeMenu,sync:()=>{syncQuest();syncModalState()}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
