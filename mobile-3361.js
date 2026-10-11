(()=>{
'use strict';
const V='3.36.1';
const isMobile=()=>matchMedia('(max-width:760px)').matches;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isiOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function lsGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(_){}}
function closeDrawers(){document.body.classList.remove('ascMobileHero3361','ascMobileCards3361');syncDock()}
function openDrawer(which){closeDrawers();document.body.classList.add(which==='cards'?'ascMobileCards3361':'ascMobileHero3361');syncDock()}
function syncDock(){document.querySelectorAll('.ascMobileDock3361 button[data-pane]').forEach(b=>b.classList.toggle('active',(b.dataset.pane==='hero'&&document.body.classList.contains('ascMobileHero3361'))||(b.dataset.pane==='cards'&&document.body.classList.contains('ascMobileCards3361'))||(b.dataset.pane==='map'&&!document.body.classList.contains('ascMobileHero3361')&&!document.body.classList.contains('ascMobileCards3361'))))}
function fitMap(){let z=Math.max(.52,Math.min(1,(innerWidth-20)/760));document.documentElement.style.setProperty('--asc-mobile-map-zoom',z.toFixed(3));lsSet('ascMapZoom3361',String(z))}
function setZoom(delta){let raw=getComputedStyle(document.documentElement).getPropertyValue('--asc-mobile-map-zoom')||lsGet('ascMapZoom3361')||'1',z=Math.max(.5,Math.min(1.35,Number(raw)+delta));document.documentElement.style.setProperty('--asc-mobile-map-zoom',z.toFixed(2));lsSet('ascMapZoom3361',String(z))}
function showLog(){openDrawer('hero');setTimeout(()=>{const p=document.getElementById('adventureLogPanel');if(p){p.scrollIntoView({behavior:'smooth',block:'start'});const l=document.getElementById('log');if(l)l.style.maxHeight='55dvh'}},50)}
function installDock(){if(document.getElementById('ascMobileDock3361'))return;let d=document.createElement('div');d.id='ascMobileDock3361';d.className='ascMobileDock3361';d.innerHTML=`<button data-pane="map">🗺️<br>Map</button><button data-pane="hero">🛡️<br>Hero</button><button data-pane="cards">🃏<br>Cards</button><button data-pane="log">📜<br>Log</button><button data-pane="menu">☰<br>Menu</button>`;document.body.appendChild(d);d.querySelector('[data-pane="map"]').onclick=closeDrawers;d.querySelector('[data-pane="hero"]').onclick=()=>openDrawer('hero');d.querySelector('[data-pane="cards"]').onclick=()=>openDrawer('cards');d.querySelector('[data-pane="log"]').onclick=showLog;d.querySelector('[data-pane="menu"]').onclick=()=>{closeDrawers();let btn=document.getElementById('mainMenuBtn')||[...document.querySelectorAll('button')].find(x=>/main menu/i.test(x.textContent||''));if(btn)btn.click();else openDrawer('hero')};
 let close=document.createElement('button');close.className='ascMobileDrawerClose3361';close.textContent='Close';close.onclick=closeDrawers;document.body.appendChild(close);
 let zoom=document.createElement('div');zoom.className='ascMapZoom3361';zoom.innerHTML='<button aria-label="Zoom in">＋</button><button aria-label="Fit map">Fit</button><button aria-label="Zoom out">−</button>';document.body.appendChild(zoom);let z=zoom.querySelectorAll('button');z[0].onclick=()=>setZoom(.1);z[1].onclick=fitMap;z[2].onclick=()=>setZoom(-.1);
 let saved=Number(lsGet('ascMapZoom3361'));if(saved)document.documentElement.style.setProperty('--asc-mobile-map-zoom',saved);else fitMap();syncDock();
}
function wireTouchTips(){
 document.addEventListener('click',ev=>{
   if(!isMobile())return;
   const s=ev.target.closest?.('.statusHover,.enemyCondHover');if(s&&typeof statusTip==='function'){ev.preventDefault();let r=s.getBoundingClientRect();statusTip({clientX:r.left,clientY:r.top},s.dataset.status||s.textContent,s.dataset.detail||'');return}
   if(!ev.target.closest?.('.cardTip')&&!ev.target.closest?.('.statusHover,.enemyCondHover')){try{hideCardTip()}catch(_){}}
 },true);
}
function installHint(){if(!isMobile()||!isiOS()||standalone()||lsGet('ascInstallHint3361')==='dismissed'||document.getElementById('ascInstallHint3361'))return;let h=document.createElement('div');h.id='ascInstallHint3361';h.className='ascInstallHint3361';h.innerHTML='<button>×</button><b>Install Ascendance on iPhone</b><div style="margin-top:5px;font-size:13px;line-height:1.35">In Safari, tap <b>Share</b> → <b>Add to Home Screen</b>. It will launch in its own full-screen window.</div>';document.body.appendChild(h);h.querySelector('button').onclick=()=>{lsSet('ascInstallHint3361','dismissed');h.remove()}}
function registerSW(){if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw-3361.js').catch(()=>{})}}
function mobileClass(){document.documentElement.classList.toggle('ascMobile3361',isMobile());if(!isMobile())closeDrawers()}
function install(){mobileClass();installDock();wireTouchTips();installHint();registerSW();addEventListener('resize',mobileClass);addEventListener('orientationchange',()=>setTimeout(()=>{mobileClass();if(!lsGet('ascMapZoom3361'))fitMap()},150));globalThis.ascMobile3361={version:V,fitMap,openDrawer,closeDrawers}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
