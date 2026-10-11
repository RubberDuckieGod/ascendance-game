(()=>{
'use strict';
const V='3.36.9';
const MOBILE='(max-width:760px)',LAND='(orientation:landscape) and (max-height:500px) and (max-width:950px)';
const isMobile=()=>matchMedia(MOBILE).matches||matchMedia(LAND).matches;
let searchObs=null,encObs=null,lastSearchVisible=false,lastEncVisible=false;
const by=id=>document.getElementById(id);
function visiblePanel(id){const e=by(id);return !!(e&&!e.classList.contains('hidden'))}
function searchPending(){return visiblePanel('searchDraw')&&!!by('searchName')?.textContent?.trim()}
function encounterPending(){return visiblePanel('encPanel')&&!!by('encName')?.textContent?.trim()}
function closeOlder(){
 try{window.ascMobile3367?.close?.()}catch(_){}
 try{window.ascMobile3368?.closeExplore?.()}catch(_){}
 try{window.ascMobile3361?.closeDrawers?.()}catch(_){}
 document.body.classList.remove('ascMobileSearchFull3369','ascMobileEncounterFull3369');
}
function ensure(){
 if(!by('ascMobileSearchOverlay3369')){
  const s=document.createElement('section');s.id='ascMobileSearchOverlay3369';s.className='ascMobileResolveOverlay3369';s.setAttribute('aria-label','Search card resolution');
  s.innerHTML=`<header class="ascMobileResolveHead3369"><div><div class="ascMobileResolveEyebrow3369">SEARCH</div><h2 id="ascMobileSearchTitle3369">Search Card</h2><div id="ascMobileSearchSub3369" class="ascMobileResolveSub3369">Resolve this card before taking another Action.</div></div><button id="ascMobileSearchMap3369">View Map</button></header><main class="ascMobileResolveMain3369"><section class="ascMobileResolveCard3369"><div id="ascMobileSearchName3369" class="ascMobileResolveName3369"></div><div class="ascMobileResolveMeta3369"><span>ELIGIBILITY</span><b id="ascMobileSearchElig3369"></b></div><div class="ascMobileResolveLabel3369">EFFECT</div><div id="ascMobileSearchEffect3369" class="ascMobileResolveText3369"></div><div id="ascMobileSearchSkipped3369" class="ascMobileResolveSkipped3369"></div></section></main><footer class="ascMobileResolveFoot3369"><button id="ascMobileSearchCancel3369">Cancel Search</button><button class="primary" id="ascMobileSearchResolve3369">Resolve Search Card</button></footer>`;
  document.body.appendChild(s);
  by('ascMobileSearchMap3369').onclick=()=>closeSearch(true);
  by('ascMobileSearchResolve3369').onclick=()=>{const b=by('resolveSearch');if(b&&!b.disabled)b.click();setTimeout(syncAll,50);setTimeout(syncAll,180)};
  by('ascMobileSearchCancel3369').onclick=()=>{const b=by('cancelSearch');if(b&&!b.disabled)b.click();setTimeout(syncAll,50);setTimeout(syncAll,180)};
 }
 if(!by('ascMobileEncounterOverlay3369')){
  const e=document.createElement('section');e.id='ascMobileEncounterOverlay3369';e.className='ascMobileResolveOverlay3369';e.setAttribute('aria-label','Travel encounter resolution');
  e.innerHTML=`<header class="ascMobileResolveHead3369"><div><div class="ascMobileResolveEyebrow3369">ENCOUNTER</div><h2 id="ascMobileEncounterTitle3369">Travel Encounter</h2><div class="ascMobileResolveSub3369">Resolve the encounter before continuing.</div></div><button id="ascMobileEncounterMap3369">View Map</button></header><main class="ascMobileResolveMain3369"><section class="ascMobileResolveCard3369 ascMobileEncounterCard3369"><div id="ascMobileEncounterName3369" class="ascMobileResolveName3369"></div><div class="ascMobileResolveMeta3369"><span>SEVERITY</span><b id="ascMobileEncounterSeverity3369"></b></div><div class="ascMobileResolveLabel3369">EFFECT</div><div id="ascMobileEncounterEffect3369" class="ascMobileResolveText3369"></div></section></main><footer class="ascMobileResolveFoot3369 ascMobileResolveFootSingle3369"><button class="primary" id="ascMobileEncounterResolve3369">Resolve Encounter</button></footer>`;
  document.body.appendChild(e);
  by('ascMobileEncounterMap3369').onclick=()=>closeEncounter(true);
  by('ascMobileEncounterResolve3369').onclick=()=>{const b=by('resolveEnc');if(b&&!b.disabled)b.click();setTimeout(syncAll,50);setTimeout(syncAll,180)};
 }
 if(!by('ascMobileSearchResume3369')){
  const b=document.createElement('button');b.id='ascMobileSearchResume3369';b.className='ascMobilePendingResume3369';b.textContent='🔎 Return to Search Card';b.onclick=openSearch;document.body.appendChild(b);
 }
 if(!by('ascMobileEncounterResume3369')){
  const b=document.createElement('button');b.id='ascMobileEncounterResume3369';b.className='ascMobilePendingResume3369 ascMobileEncounterResume3369';b.textContent='⚔ Return to Encounter';b.onclick=openEncounter;document.body.appendChild(b);
 }
}
function syncSearch(){
 ensure(); const has=searchPending();
 if(has){
  by('ascMobileSearchName3369').textContent=by('searchName')?.textContent?.trim()||'Search Card';
  by('ascMobileSearchElig3369').textContent=by('elig')?.textContent?.trim()||'Any';
  by('ascMobileSearchEffect3369').textContent=by('searchEffect')?.textContent?.trim()||'Resolve this Search card.';
  by('ascMobileSearchSkipped3369').textContent=by('searchSkipped')?.textContent?.trim()||'';
  const origCancel=by('cancelSearch');
  by('ascMobileSearchCancel3369').textContent=origCancel?.textContent?.trim()||'Cancel Search';
  by('ascMobileSearchCancel3369').disabled=!!origCancel?.disabled;
  by('ascMobileSearchResolve3369').disabled=!!by('resolveSearch')?.disabled;
 }
 const full=document.body.classList.contains('ascMobileSearchFull3369');
 by('ascMobileSearchResume3369')?.classList.toggle('show',isMobile()&&has&&!full&&!document.body.classList.contains('ascMobileEncounterFull3369'));
 if(!has)document.body.classList.remove('ascMobileSearchFull3369');
 return has;
}
function syncEncounter(){
 ensure(); const has=encounterPending();
 if(has){
  by('ascMobileEncounterName3369').textContent=by('encName')?.textContent?.trim()||'Travel Encounter';
  by('ascMobileEncounterSeverity3369').textContent=by('severity')?.textContent?.trim()||'—';
  by('ascMobileEncounterEffect3369').textContent=by('encEffect')?.textContent?.trim()||'Resolve this Encounter.';
  by('ascMobileEncounterResolve3369').disabled=!!by('resolveEnc')?.disabled;
 }
 const full=document.body.classList.contains('ascMobileEncounterFull3369');
 by('ascMobileEncounterResume3369')?.classList.toggle('show',isMobile()&&has&&!full);
 if(!has)document.body.classList.remove('ascMobileEncounterFull3369');
 return has;
}
function openSearch(){if(!isMobile()||!searchPending())return;closeOlder();syncSearch();document.body.classList.add('ascMobileSearchFull3369')}
function closeSearch(toMap=false){document.body.classList.remove('ascMobileSearchFull3369');syncSearch();if(toMap)try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){}}
function openEncounter(){if(!isMobile()||!encounterPending())return;closeOlder();syncEncounter();document.body.classList.add('ascMobileEncounterFull3369')}
function closeEncounter(toMap=false){document.body.classList.remove('ascMobileEncounterFull3369');syncEncounter();if(toMap)try{window.scrollTo({top:0,behavior:'smooth'})}catch(_){}}
function syncAll(){
 const s=syncSearch(),e=syncEncounter();
 if(!isMobile()){closeSearch();closeEncounter();lastSearchVisible=s;lastEncVisible=e;return}
 // Auto-open only on the transition from hidden -> pending. Encounter wins if Search resolution launches it.
 if(e&&!lastEncVisible)openEncounter(); else if(s&&!lastSearchVisible&&!e)openSearch();
 lastSearchVisible=s;lastEncVisible=e;
}
function observe(){
 const s=by('searchDraw'),e=by('encPanel');
 if(s&&!searchObs){searchObs=new MutationObserver(syncAll);searchObs.observe(s,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true})}
 if(e&&!encObs){encObs=new MutationObserver(syncAll);encObs.observe(e,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true})}
 return !!(s&&e);
}
function wireSearch(){const b=by('search');if(!b||b.dataset.mobileSearch3369)return !!b;b.dataset.mobileSearch3369='1';b.addEventListener('click',()=>{setTimeout(syncAll,35);setTimeout(()=>{if(searchPending())openSearch()},120)});return true}
function install(){
 ensure(); observe(); wireSearch(); syncAll();
 if(!searchObs||!encObs)setTimeout(()=>{observe();syncAll()},180);
 if(!by('search')?.dataset.mobileSearch3369)setTimeout(wireSearch,180);
 addEventListener('resize',()=>{if(!isMobile()){closeSearch();closeEncounter()}else syncAll()});
 addEventListener('orientationchange',()=>setTimeout(syncAll,160));
 globalThis.ascMobile3369={version:V,isMobile,searchPending,encounterPending,openSearch,closeSearch,openEncounter,closeEncounter,sync:syncAll};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
