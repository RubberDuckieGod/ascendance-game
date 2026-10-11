/* Ascendance 3.35.0 — Party Faction Reputation Engine */
(()=>{
'use strict';
const V='3.35.0';
const FACTIONS={
 stonebrook:'Stonebrook',crownWatch:'Crown Watch',nightglass:'Nightglass',archiveSeven:'Archive of Seven',
 deepdelver:'Deepdelver Guild',forgeCouncil:'Ironhaven Forge Council',stoneSinger:'Stone-Singer Circle',
 eldergroveCircle:'Eldergrove Circle',rootwardens:'Rootwardens',lanternApothecary:'Lantern Apothecary',spiritCourt:'Spirit Court',
 ashenportAdmiralty:'Ashenport Admiralty',tidewardens:'Tidewarden Order',freewake:'Freewake Consortium',beaconOrder:'Beacon Order',
 sunspireConcord:'Sunspire Concord',duneWardens:'Dune Wardens',glasswrights:'Glasswright Enclave',firstDawn:'Order of First Dawn'
};
const ALIASES={
 'stonebrook':'stonebrook','crown watch':'crownWatch','nightglass':'nightglass','archive of seven':'archiveSeven',
 'deepdelver guild':'deepdelver','deepdelver':'deepdelver','ironhaven forge council':'forgeCouncil','forge council':'forgeCouncil',
 'stone-singer circle':'stoneSinger','stone singer circle':'stoneSinger','eldergrove circle':'eldergroveCircle','rootwardens':'rootwardens','rootwarden':'rootwardens',
 'lantern apothecary':'lanternApothecary','spirit court':'spiritCourt','ashenport admiralty':'ashenportAdmiralty',
 'tidewarden order':'tidewardens','tidewarden':'tidewardens','tidewardens':'tidewardens','freewake consortium':'freewake','freewake':'freewake',
 'beacon order':'beaconOrder','sunspire concord':'sunspireConcord','dune wardens':'duneWardens','dune warden':'duneWardens',
 'glasswright enclave':'glasswrights','glasswright':'glasswrights','glasswrights':'glasswrights','order of first dawn':'firstDawn','first dawn':'firstDawn'
};
function logRep(s){try{log('[REP] '+s)}catch(_){console.log('[REP]',s)}}
function ensure(){if(!g)return {};g.campaign=g.campaign||{};return g.campaign.factionReputation3342||(g.campaign.factionReputation3342={})}
function clamp(v){return Math.max(-5,Math.min(6,Number(v)||0))}
function score(key){if(key==='general')return clamp(g?.reputation||0);return clamp(ensure()[key]||0)}
function standing(v){v=Number(v)||0;if(v<=-3)return'Hostile';if(v<=-1)return'Distrusted';if(v===0)return'Neutral';if(v<=2)return'Friendly';if(v<=4)return'Trusted';return'Exalted'}
function add(key,delta,source='Campaign'){delta=Number(delta)||0;if(!delta)return score(key);if(key==='general'){let old=clamp(g.reputation||0),n=clamp(old+delta);g.reputation=n;if(old!==n)announce(key,old,n,delta,source);return n}if(!FACTIONS[key])return 0;let m=ensure(),old=clamp(m[key]||0),n=clamp(old+delta);m[key]=n;if(old!==n)announce(key,old,n,delta,source);return n}
function announce(key,old,n,delta,source){let name=key==='general'?'General Reputation':FACTIONS[key],a=standing(old),b=standing(n);logRep(`${source}: ${delta>0?'+':''}${delta} ${name} (${old} → ${n})${a!==b?' — '+b:''}.`);if(a!==b)try{recordCampaignEffect?.(`${name}: ${b} standing unlocked.`)}catch(_){};try{mpScheduleState?.()}catch(_){} }
function keyForName(name){let s=String(name||'').toLowerCase().replace(/[–—]/g,'-').trim();if(/general/.test(s))return'general';for(const [a,k] of Object.entries(ALIASES))if(s.includes(a))return k;return null}
function parse(text,opts={}){let out=[],s=String(text||'');let re=/([+-]\d+)\s+([A-Za-z][A-Za-z '\-]+?)\s+Reputation\b/gi,m;while((m=re.exec(s))){let k=keyForName(m[2]);if(k)out.push([k,Number(m[1])])}if(opts.allowBareGeneral){let bare=/([+-]\d+)\s+Reputation\b/gi;while((m=bare.exec(s)))out.push(['general',Number(m[1])])}return out}
function qid(){return g?.campaign?.currentQuest||''}
function questText(id){try{return QUEST_RUNTIME_DATA?.[id]?.rewardText||WORKBOOK_DATABASE?.Quests?.find(r=>r?.['Card ID']===id)?.Rewards||''}catch(_){return''}}
function eventText(ev){return String(ev?.allReward||ev?.['Campaign Rewards']||'')}
function conditionalOkay(id,key){let c=g?.campaign||{};if(id==='Q026'&&key==='deepdelver')return !!c.c34Quest?.flags?.optional?.survivor;if(id==='Q038'&&key==='lanternApothecary')return !!c.c34Quest?.flags?.optional?.nemi;if(id==='Q050'&&key==='freewake')return !!c.c56Quest?.flags?.optional?.survivor;if(id==='Q062'&&key==='glasswrights')return !!c.c56Quest?.flags?.optional?.survivor;return true}
function awardQuest(id){let c=g.campaign||(g.campaign={}),mark='rep3350Quest_'+id;if(c[mark])return;c[mark]=true;let n=Number(String(id).slice(1))||0,arr=parse(questText(id),{allowBareGeneral:n>=25});for(const [k,d] of arr)if(conditionalOkay(id,k))add(k,d,id)}
function awardEvent(ev){if(!ev?.id)return;let c=g.campaign||(g.campaign={}),mark='rep3350Event_'+ev.id;if(c[mark])return;c[mark]=true;for(const [k,d] of parse(eventText(ev),{allowBareGeneral:true}))add(k,d,ev.id)}
function regionForQuest(id=qid()){let n=Number(String(id).slice(1))||0;if(n<=12)return'stonebrook';if(n<=24)return'crownlands';if(n<=36)return'ironspine';if(n<=48)return'verdant';if(n<=60)return'stormcoast';if(n<=72)return'sunscar';return''}
function uses(){let c=g?.campaign||(g.campaign={});let id=qid()||'NONE';c.repUses3350=c.repUses3350||{};return c.repUses3350[id]||(c.repUses3350[id]={})}
function unused(key,tier){return !uses()[key+':'+tier]}
function consume(key,tier,label){uses()[key+':'+tier]=true;logRep(`${FACTIONS[key]||key} ${tier} perk used${label?': '+label:''}.`);try{mpScheduleState?.()}catch(_){} }
function activeTier(key,min){return score(key)>=min}
// Automatically enforce low-risk perks whose trigger is unambiguous in the existing engine.
function installHealing(){if(typeof window.searchHeal!=='function'||String(window.searchHeal).includes('REP_HEAL_3350'))return;const b=window.searchHeal;window.searchHeal=function(h,n,label='Search'){/* REP_HEAL_3350 */let r=regionForQuest(),bonus=0,key=null;if(r==='verdant'&&activeTier('eldergroveCircle',1)&&unused('eldergroveCircle','friendly')){bonus=1;key='eldergroveCircle'}if(r==='sunscar'&&activeTier('firstDawn',1)&&unused('firstDawn','friendly')){bonus=1;key='firstDawn'}if(bonus){n+=bonus;consume(key,'friendly','first healing effect this Quest +1 Health')}return b.call(this,h,n,label)}}
function installSeaBeast(){if(typeof window.encounterEnemy320!=='function'||String(window.encounterEnemy320).includes('REP_TIDE_3350'))return;const b=window.encounterEnemy320;window.encounterEnemy320=function(id){/* REP_TIDE_3350 */let e=b.apply(this,arguments);try{if(e&&regionForQuest()==='stormcoast'&&activeTier('tidewardens',1)&&unused('tidewardens','friendly')){let d=ENEMY_WORKBOOK_320?.[id],txt=(d?.enemyType||'')+' '+(d?.traits||'');if(/Sea Beast/i.test(txt)){e.hp=Math.max(1,Number(e.hp||1)-2);consume('tidewardens','friendly','first Sea Beast starts with 2 damage')}}}catch(_){}return e}}
function installQuestHooks(){if(typeof window.resolveQuestAttempt==='function'&&!String(window.resolveQuestAttempt).includes('rep3350Quest_')){const b=window.resolveQuestAttempt;window.resolveQuestAttempt=function(outcome){let id=qid(),done=outcome==='Completed',already=!!g?.campaign?.['rep3350Quest_'+id],r=b.apply(this,arguments);if(done&&!already)awardQuest(id);return r}}
 if(typeof window.applyWorldEventResolution==='function'&&!String(window.applyWorldEventResolution).includes('rep3350Event_')){const b=window.applyWorldEventResolution;window.applyWorldEventResolution=function(ev,forced){let all=ev?.quests?.every(q=>questStatus(q.id)==='Completed'),already=!!g?.campaign?.['rep3350Event_'+ev?.id],r=b.apply(this,arguments);if(all&&!already)awardEvent(ev);return r}}}
function install(){installHealing();installSeaBeast();installQuestHooks();window.ASCENDANCE_BUILD=V;window.ASCENDANCE_REPUTATION_VERSION=V;let e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}
window.ascRep3350={score,standing,add,parse,regionForQuest,unused,consume,factions:{...FACTIONS}};
window.ascendanceReputation3350=()=>({build:V,region:regionForQuest(),scores:Object.fromEntries(Object.keys(FACTIONS).map(k=>[k,score(k)])),general:score('general'),uses:JSON.parse(JSON.stringify(g?.campaign?.repUses3350||{}))});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);setTimeout(install,400);setTimeout(install,1400);
})();
