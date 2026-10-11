(()=>{
'use strict';
const V='3.36.8';
const MOBILE='(max-width:760px)',LAND='(orientation:landscape) and (max-height:500px) and (max-width:950px)';
const isMobile=()=>matchMedia(MOBILE).matches||matchMedia(LAND).matches;
let obs=null,placeButtons=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function pending(){const d=document.getElementById('locDraw');return !!(d&&!d.classList.contains('hidden')&&document.getElementById('locName')?.textContent?.trim())}
function ensure(){
 if(!document.getElementById('ascMobileExploreOverlay3368')){
  const el=document.createElement('section');el.id='ascMobileExploreOverlay3368';el.className='ascMobileExploreOverlay3368';el.setAttribute('aria-label','Explore Location placement');
  el.innerHTML=`<header class="ascMobileExploreHead3368"><div><div class="ascMobileExploreEyebrow3368">EXPLORE</div><h2 id="ascMobileExploreTitle3368">Location Draw</h2><div class="ascMobileExploreSub3368">Choose where to place this Location.</div></div><button id="ascMobileExploreMap3368">View Map</button></header><main class="ascMobileExploreMain3368"><section class="ascMobileExploreCard3368"><div id="ascMobileExploreName3368" class="ascMobileExploreName3368"></div><div id="ascMobileExploreInfo3368" class="ascMobileExploreInfo3368"></div><div id="ascMobileExploreSkipped3368" class="ascMobileExploreSkipped3368"></div></section><section><div class="ascMobileExploreLabel3368">PLACEMENT</div><div id="ascMobileExploreChoices3368" class="ascMobileExploreChoices3368"></div></section></main>`;
  document.body.appendChild(el);
  el.querySelector('#ascMobileExploreMap3368').onclick=close;
 }
 if(!document.getElementById('ascMobileExploreResume3368')){
  const b=document.createElement('button');b.id='ascMobileExploreResume3368';b.className='ascMobileExploreResume3368';b.textContent='🌲 Place Explore Tile';b.onclick=open;document.body.appendChild(b);
 }
}
function sync(){
 ensure(); const has=pending(),resume=document.getElementById('ascMobileExploreResume3368'); if(resume)resume.classList.toggle('show',isMobile()&&has&&!document.body.classList.contains('ascMobileExploreFull3368'));
 if(!has){document.body.classList.remove('ascMobileExploreFull3368');return}
 const src=document.getElementById('locDraw'),title=document.getElementById('locName')?.textContent?.trim()||'Location Draw';
 document.getElementById('ascMobileExploreName3368').textContent=title;
 const info=document.getElementById('placeInfo');document.getElementById('ascMobileExploreInfo3368').innerHTML=info?.innerHTML||'';
 document.getElementById('ascMobileExploreSkipped3368').textContent=document.getElementById('locSkipped')?.textContent||'';
 const originals=[...(document.getElementById('placements')?.querySelectorAll('button')||[])]; placeButtons=originals;
 const dst=document.getElementById('ascMobileExploreChoices3368');dst.innerHTML='';
 originals.forEach((o,i)=>{const b=document.createElement('button');b.className='ascMobileExploreChoice3368';b.textContent=o.textContent||`Placement ${i+1}`;b.disabled=!!o.disabled;b.onclick=()=>{const current=placeButtons[i];if(current&&!current.disabled)current.click();setTimeout(sync,40)};dst.appendChild(b)});
 if(!originals.length)dst.innerHTML='<div class="ascMobileExploreWaiting3368">Finding a legal placement…</div>';
}
function open(){if(!isMobile()||!pending())return;ensure();try{window.ascMobile3367?.close?.()}catch(_){};try{window.ascMobile3361?.closeDrawers?.()}catch(_){};sync();document.body.classList.add('ascMobileExploreFull3368')}
function close(){document.body.classList.remove('ascMobileExploreFull3368');sync()}
function observe(){const d=document.getElementById('locDraw');if(!d||obs)return false;obs=new MutationObserver(()=>{const was=document.body.classList.contains('ascMobileExploreFull3368');const has=pending();sync();if(isMobile()&&has&&!was)open()});obs.observe(d,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});return true}
function wireExplore(){const b=document.getElementById('explore');if(!b||b.dataset.mobileExplore3368)return !!b;b.dataset.mobileExplore3368='1';b.addEventListener('click',()=>setTimeout(()=>{sync();if(pending())open()},40));return true}
function install(){ensure();if(!observe())setTimeout(observe,150);if(!wireExplore())setTimeout(wireExplore,150);sync();addEventListener('resize',()=>{if(!isMobile())close();else sync()});addEventListener('orientationchange',()=>setTimeout(sync,160));globalThis.ascMobile3368={version:V,openExplore:open,closeExplore:close,sync,pending};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
