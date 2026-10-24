(()=>{
'use strict';
const V='3.36.5',MOBILE='(max-width:760px)',LAND='(orientation:landscape) and (max-height:500px) and (max-width:950px)';
const isMobile=()=>matchMedia(MOBILE).matches||matchMedia(LAND).matches;
let installTimer=null;
function setVisualHeight(){const vv=window.visualViewport;const h=Math.max(280,Math.round(vv?.height||innerHeight));document.documentElement.style.setProperty('--asc-visual-vh',h+'px');const keyboard=!!vv&&isMobile()&&h<innerHeight*0.78;document.body?.classList.toggle('ascKeyboard3365',keyboard)}
function focusVisible(ev){if(!isMobile())return;const el=ev.target;if(!el?.matches?.('input,select,textarea'))return;setTimeout(()=>{try{el.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'})}catch(_){}},120)}
function closePanelsBeforeManagement(ev){if(!isMobile())return;const b=ev.target.closest?.('button');if(!b)return;const txt=(b.textContent||'').trim();if(/^(Inventory|Merchant|Crafting|Downtime|World Map|Campaign Saves)$/i.test(txt)){try{window.ascMobile3361?.closeDrawers?.()}catch(_){}}}
function deferInstallHint(){const hint=document.getElementById('ascInstallHint3361');if(!hint)return;hint.style.display='none';clearTimeout(installTimer);installTimer=setTimeout(()=>{if(isMobile()&&!document.body.classList.contains('ascKeyboard3365'))hint.style.display='block'},3500)}
function improveAccessibility(){document.querySelectorAll('.ascMobileDock3361 button').forEach(b=>{if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',(b.textContent||'').replace(/\s+/g,' ').trim())});document.querySelectorAll('.actions button').forEach(b=>{b.setAttribute('aria-label',(b.textContent||'').replace(/\s+/g,' ').trim());});}
function install(){setVisualHeight();improveAccessibility();deferInstallHint();document.addEventListener('focusin',focusVisible,true);document.addEventListener('click',closePanelsBeforeManagement,true);window.visualViewport?.addEventListener('resize',setVisualHeight);window.visualViewport?.addEventListener('scroll',setVisualHeight);addEventListener('resize',()=>{setVisualHeight();improveAccessibility()});addEventListener('orientationchange',()=>setTimeout(()=>{setVisualHeight();try{window.ascMobile3361?.fitMap?.()}catch(_){}},180));if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw-3365.js',{updateViaCache:'none'}).catch(()=>{});globalThis.ascMobile3365={version:V,setVisualHeight,isMobile,keyboard:()=>document.body.classList.contains('ascKeyboard3365')};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
