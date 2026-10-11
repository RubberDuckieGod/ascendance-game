/* Ascendance 3.34.3 — High Fantasy World Map Reskin
   Presentation enhancement layered on the working 3.34.2 World Map logic. */
(()=>{
'use strict';
const V='3.34.3';
const ART='assets/ascendance-world-map-3343.png';
function ensureStyle(){
 if(document.getElementById('worldMapStyles3343')) return;
 const s=document.createElement('style');
 s.id='worldMapStyles3343';
 s.textContent=`
 #worldMapOverlay3342{background:radial-gradient(circle at 50% 40%,rgba(32,24,13,.45),rgba(0,0,0,.96) 75%);padding:10px;backdrop-filter:blur(10px) saturate(.82)}
 .wmShell3342{width:min(1680px,99vw);height:min(970px,98vh);border:1px solid #9b7635;border-radius:7px;background:#090a08;box-shadow:0 0 0 2px #251b0e,0 28px 100px #000,0 0 48px rgba(190,139,54,.15);position:relative}
 .wmShell3342:before{content:'';position:absolute;inset:0;pointer-events:none;z-index:20;border:7px solid transparent;border-image:linear-gradient(135deg,#b68b42,#37240f,#d0aa5b,#37240f,#a87b31) 1;box-shadow:inset 0 0 22px rgba(0,0,0,.8)}
 .wmHead3342{min-height:58px;padding:9px 18px 9px 24px;background:linear-gradient(180deg,#21180f 0%,#0d0d0b 56%,#181109 100%);border-bottom:2px solid #8f6b31;box-shadow:0 4px 16px rgba(0,0,0,.72);position:relative;z-index:15}
 .wmHead3342:after{content:'✦';position:absolute;left:50%;bottom:-12px;transform:translateX(-50%);width:24px;height:24px;border:1px solid #a57b37;background:#151008;color:#d5af62;display:grid;place-items:center;rotate:45deg;font-size:10px}
 .wmHead3342 h2{font:700 28px Georgia,serif;color:#f1d58d;letter-spacing:.13em;text-shadow:0 2px 4px #000,0 0 16px rgba(226,178,88,.28)}
 .wmHead3342 .muted{color:#9d8b67;font:italic 12px Georgia,serif;letter-spacing:.05em}
 .wmHead3342 button,#wmClose3342{background:linear-gradient(#312719,#17130d);border:1px solid #8b6a36;color:#e5c77f;border-radius:4px;padding:9px 16px;font:700 11px Georgia,serif;letter-spacing:.07em;text-transform:uppercase;box-shadow:inset 0 0 12px rgba(230,188,99,.08)}
 .wmBody3342{grid-template-columns:minmax(720px,1.85fr) minmax(355px,.68fr);background:#080a09}
 .wmMapWrap3342{padding:10px;background:radial-gradient(circle at 50% 50%,#2c2114,#090b0a 82%);display:flex;align-items:center;justify-content:center;overflow:auto}
 .wmMap3342{width:100%;height:auto;aspect-ratio:4/3;min-width:720px;min-height:540px;max-height:100%;border:2px solid #795b2b;border-radius:3px;background-image:linear-gradient(rgba(8,5,2,.06),rgba(8,5,2,.12)),url('${ART}')!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;box-shadow:inset 0 0 55px rgba(0,0,0,.52),0 0 0 1px #211607,0 12px 36px rgba(0,0,0,.55)}
 .wmMap3342:before{opacity:1;background:radial-gradient(ellipse at 50% 48%,transparent 48%,rgba(12,7,2,.18) 78%,rgba(9,5,1,.42) 100%);z-index:1;pointer-events:none}
 .wmSea3342,.wmRoute3342,.wmHub3342,.wmHubLabel3342{display:none!important}
 .wmRegion3342{z-index:3;background:rgba(15,12,7,.015)!important;border:1px solid rgba(248,214,125,.06)!important;color:transparent!important;padding:0!important;box-shadow:none!important;transition:filter .18s ease,box-shadow .18s ease,background .18s ease,transform .18s ease;overflow:visible}
 .wmRegion3342 b,.wmRegion3342 span,.wmRegion3342 em{position:absolute;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease}
 .wmRegion3342 b{left:50%;bottom:7%;transform:translate(-50%,7px);white-space:nowrap;display:block!important;padding:7px 12px;background:linear-gradient(180deg,rgba(30,22,12,.96),rgba(9,8,6,.96));border:1px solid #c19443;border-radius:3px;color:#f2d58a!important;font:700 13px Georgia,serif!important;letter-spacing:.04em;text-shadow:0 2px 2px #000;box-shadow:0 5px 14px rgba(0,0,0,.65)}
 .wmRegion3342:hover{transform:none!important;filter:brightness(1.08) saturate(1.12)!important;z-index:8;background:rgba(231,191,92,.06)!important;box-shadow:inset 0 0 28px rgba(255,224,125,.16),0 0 18px rgba(244,203,103,.22)!important}
 .wmRegion3342:hover b,.wmRegion3342.selected b{opacity:1;transform:translate(-50%,0)}
 .wmRegion3342.selected{outline:none!important;filter:brightness(1.10) saturate(1.16)!important;background:rgba(245,207,105,.075)!important;box-shadow:inset 0 0 32px rgba(255,225,128,.26),0 0 8px rgba(255,219,117,.6),0 0 26px rgba(230,184,74,.42)!important}
 .wmRegion3342.future{opacity:.9!important;filter:saturate(.65) brightness(.85)!important}
 .wmStonebrook3342{left:4%;top:28%;width:34%;height:35%;clip-path:polygon(1% 14%,88% 0,100% 33%,87% 95%,20% 100%,0 67%)}
 .wmCrownlands3342{left:30%;top:29%;width:34%;height:34%;clip-path:polygon(6% 11%,52% 0,98% 15%,100% 76%,68% 100%,15% 92%,0 48%)}
 .wmIronspine3342{left:16%;top:3%;width:39%;height:31%;clip-path:polygon(0 36%,15% 3%,35% 22%,49% 0,66% 24%,84% 6%,100% 47%,80% 100%,16% 88%)}
 .wmVerdant3342{right:4%;top:5%;width:38%;height:42%;clip-path:polygon(6% 7%,76% 0,100% 23%,90% 88%,50% 100%,0 73%,2% 30%)}
 .wmSunscar3342{left:30%;bottom:3%;width:43%;height:38%;clip-path:polygon(10% 0,82% 5%,100% 42%,77% 100%,16% 92%,0 48%)}
 .wmStorm3342{right:2%;bottom:3%;width:34%;height:35%;clip-path:polygon(0 8%,82% 0,100% 24%,92% 100%,21% 91%,8% 61%)}
 .wmDetails3342{position:relative;padding:22px 20px 22px 21px;background:linear-gradient(90deg,rgba(57,36,13,.22),transparent 8%),radial-gradient(circle at 50% -10%,rgba(255,237,187,.96),rgba(225,202,150,.97) 48%,rgba(187,153,95,.98) 120%);border-left:2px solid #765622;color:#24190e;box-shadow:inset 9px 0 22px rgba(56,31,7,.18)}
 .wmDetails3342:before{content:'';position:absolute;inset:8px;pointer-events:none;border:1px solid rgba(92,61,24,.42);box-shadow:inset 0 0 0 2px rgba(255,245,209,.25)}
 .wmKicker3342{color:#76501d;font:700 10px Georgia,serif;letter-spacing:.17em;position:relative}.wmDetails3342 h3{color:#3f2a12;font:700 31px/1.02 Georgia,serif;text-shadow:0 1px rgba(255,255,255,.55);position:relative}.wmCampaign3342{color:#60441f;font:italic 15px Georgia,serif;position:relative}.wmFlavor3342{color:#4a3924;border-bottom:1px solid rgba(91,60,24,.38);font:13px/1.55 Georgia,serif;position:relative}
 .wmStats3342{position:relative}.wmStat3342{border:1px solid rgba(91,61,29,.35);background:rgba(255,248,218,.36);border-radius:3px;box-shadow:inset 0 0 8px rgba(87,57,20,.06)}.wmStat3342 small{color:#7b6041}.wmStat3342 b{color:#30200f;font-family:Georgia,serif}
 .wmSectionTitle3342{color:#664214;border-bottom:1px solid rgba(91,60,24,.42);padding-bottom:5px;position:relative}.wmFaction3342{background:rgba(255,249,222,.38);border:1px solid rgba(89,59,24,.33);border-radius:3px;position:relative}.wmFaction3342 button{color:#342410;font-family:Georgia,serif}.wmFaction3342 .muted{color:#745d41!important}
 .wmRepBadge3342{background:rgba(38,28,15,.08);font-family:Georgia,serif}.wmRepBadge3342.neutral{color:#65594c;border-color:#796a57}.wmRepBadge3342.friendly{color:#365c2e;border-color:#537d49}.wmRepBadge3342.trusted{color:#365676;border-color:#587695}.wmRepBadge3342.exalted{color:#7b5712;border-color:#9b7727}.wmRepBadge3342.distrusted{color:#8a4e1e;border-color:#9c6537}.wmRepBadge3342.hostile{color:#8d2626;border-color:#9f3e3e}
 .wmPerk3342{background:rgba(68,45,20,.08);color:#4b3822;border-left:3px solid #8d652a;border-radius:2px;position:relative}
 .wmActions3342{position:relative}.wmActions3342 button,.wmQuestGrid3342 button{background:linear-gradient(180deg,#46341c,#20180f);border:1px solid #9f7938!important;color:#edd292;border-radius:3px;font-family:Georgia,serif;box-shadow:inset 0 0 12px rgba(255,225,151,.08),0 2px 5px rgba(43,24,7,.25)}.wmActions3342 button:hover,.wmQuestGrid3342 button:hover{filter:brightness(1.17);border-color:#d0a751!important}.wmActions3342 button.primary{background:linear-gradient(180deg,#355426,#1c3119);border-color:#9a8d43!important}.wmActions3342 button:disabled{filter:grayscale(.6);opacity:.45}.wmQuestGrid3342 button.completed{background:linear-gradient(180deg,#2d4630,#1d2c20)}
 .wmFuture3342{position:relative;background:rgba(72,54,30,.11);border:1px solid rgba(96,65,29,.4);color:#4e3a23;font-family:Georgia,serif}
 @media(max-width:1100px){.wmBody3342{grid-template-columns:1fr}.wmMapWrap3342{min-height:52vh}.wmMap3342{min-width:760px;min-height:570px}.wmDetails3342{max-height:39vh;border-left:0;border-top:2px solid #765622}}
 `;
 document.head.appendChild(s);
}
function decorate(){
 const map=document.getElementById('wmMap3342');
 if(map){
   map.setAttribute('aria-label','Illustrated interactive world map of Ascendance');
   const names={stonebrook:'Stonebrook Marches',crownlands:'Crownlands',ironspine:'Ironspine Mountains',verdant:'Verdant Reach',sunscar:'Sunscar Expanse',stormcoast:'Storm Coast'};
   map.querySelectorAll('.wmRegion3342').forEach(b=>{b.title=`Explore ${names[b.dataset.region]||b.dataset.region}`;b.setAttribute('aria-label',b.title)});
 }
 const h=document.getElementById('wmTitle3342'); if(h)h.textContent='THE WORLD OF ASCENDANCE';
 const sub=document.querySelector('.wmHead3342 .muted'); if(sub)sub.textContent='Choose a realm · inspect its factions · continue your legend';
}
function boot(){
 ensureStyle();
 decorate();
 window.ASCENDANCE_BUILD=V;
 window.ASCENDANCE_WORLD_MAP_VERSION=V;
 window.ASCENDANCE_WORLD_MAP_ART=ART;
 const v=document.querySelector('.frontVersion32714');if(v)v.textContent='v'+V;
 window.ascendance3343=()=>({build:V,baseMap:window.ascendance3342?.(),art:ART,interactiveRegions:document.querySelectorAll('.wmRegion3342').length});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,40));else setTimeout(boot,40);
setTimeout(boot,500);setTimeout(boot,1600);setTimeout(boot,2800);
})();
