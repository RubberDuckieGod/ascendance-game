/* Ascendance 3.36.0 — Full Faction Reputation Perk Runtime */
(()=>{
'use strict';
const V='3.36.0';
const HARMFUL=['Bleeding','Poisoned','Burning','Stunned','Weakened','Slowed','Rooted','Exposed','Marked','Frightened','Shocked'];
const FACTION_REGIONS={
 stonebrook:'stonebrook',crownWatch:'crownlands',nightglass:'crownlands',archiveSeven:'crownlands',
 deepdelver:'ironspine',forgeCouncil:'ironspine',stoneSinger:'ironspine',
 eldergroveCircle:'verdant',rootwardens:'verdant',lanternApothecary:'verdant',spiritCourt:'verdant',
 ashenportAdmiralty:'stormcoast',tidewardens:'stormcoast',freewake:'stormcoast',beaconOrder:'stormcoast',
 sunspireConcord:'sunscar',duneWardens:'sunscar',glasswrights:'sunscar',firstDawn:'sunscar'
};
function R(){return window.ascRep3350}
function score(k){return R()?.score?.(k)??0}
function tier(k,n){return score(k)>=n}
function region(){return R()?.regionForQuest?.()||''}
function qid(){return g?.campaign?.currentQuest||'NONE'}
function logP(s){try{log('[REP PERK] '+s)}catch(_){console.log('[REP PERK]',s)}}
function state(){if(!g)return{};g.campaign=g.campaign||{};return g.campaign.repPerks3360||(g.campaign.repPerks3360={quest:{},event:{},downtime:{}})}
function qstate(){let s=state(),id=qid();return s.quest[id]||(s.quest[id]={})}
function eventKey(){return String(g?.campaign?.activeEvent||'NONE')}
function estate(){let s=state(),id=eventKey();return s.event[id]||(s.event[id]={})}
function downtimeKey(){return [eventKey(),g?.campaign?.day||0,qid(),g?.campaign?.history?.length||0].join(':')}
function dstate(){let s=state(),id=downtimeKey();return s.downtime[id]||(s.downtime[id]={})}
function use(scope,key,label){let s=scope==='event'?estate():scope==='downtime'?dstate():qstate();if(s[key])return false;s[key]=true;if(label)logP(label);try{mpScheduleState?.()}catch(_){};return true}
function unused(scope,key){let s=scope==='event'?estate():scope==='downtime'?dstate():qstate();return !s[key]}
function heroTile(h){try{let p=heroPos(h);return g.tiles[key(p.x,p.y)]}catch(_){return null}}
function isHarmful(n){return HARMFUL.includes(String(n))}
function removeOneHarmful(h){for(const n of HARMFUL)if(heroHasCondition(h,n)){removeHeroCondition(h,n);return n}return null}
function locHeroCount(loc){let e=Object.entries(g.tiles||{}).find(([k,t])=>t?.id===loc);if(!e)return[];let [x,y]=e[0].split(',').map(Number);return partyHeroes().filter(h=>!heroDefeated(h)).filter(h=>{let p=heroPos(h);return p.x===x&&p.y===y})}
function currentRegionFactionHostile(){let r=region();return Object.entries(FACTION_REGIONS).filter(([k,v])=>v===r&&score(k)<=-3).map(([k])=>k)}

// Called by campaign engines before applying a positive persistent-pressure increase.
function modifyTrackDelta(campaignNo,delta){delta=Number(delta)||0;if(delta<=0)return delta;
 let k=campaignNo===3?'stoneSinger':campaignNo===4?'eldergroveCircle':campaignNo===5?'tidewardens':campaignNo===6?'duneWardens':null;
 if(k&&tier(k,5)&&unused('event',k+':trackReduction')&&use('event',k+':trackReduction',(R()?.factions?.[k]||k)+' Exalted: reduces this campaign-track increase by 1.'))return Math.max(0,delta-1);
 return delta;
}

function installMerchant(){
 if(typeof window.merchantPrice==='function'&&!String(window.merchantPrice).includes('REP3360_PRICE')){
  const base=window.merchantPrice;
  window.merchantPrice=function(a,e){/* REP3360_PRICE */let p=base.apply(this,arguments),ds=dstate();if(!campaignDowntimeActive?.())return p;
   let r=region();
   if(tier('general',1)&&!ds.generalFriendlyBuy)p=Math.max(0,p-5);
   if(r==='stormcoast'&&tier('freewake',1)&&!ds.freewakeFriendlyBuy)p=Math.max(0,p-5);
   if(r==='sunscar'&&tier('sunspireConcord',1)&&!ds.concordFriendlyService)p=Math.max(0,p-5);
   if(r==='verdant'&&tier('lanternApothecary',1)&&/consumable/i.test(String(e?.type||e?.slot||e?.family||''))&&!ds.lanternFriendlyBuy)p=Math.max(0,p-5);
   return p;
  };
 }
 if(typeof window.merchantBuyEquipment==='function'&&!String(window.merchantBuyEquipment).includes('REP3360_BUY')){
  const base=window.merchantBuyEquipment;
  window.merchantBuyEquipment=function(hero,id){/* REP3360_BUY */let before=Number(g?.gold||0),r=region(),ds=dstate();let res=base.apply(this,arguments),after=Number(g?.gold||0);if(after<before){
    if(tier('general',1)&&!ds.generalFriendlyBuy)use('downtime','generalFriendlyBuy','General Friendly: first merchant purchase this Downtime receives -5 Gold.');
    if(r==='stormcoast'&&tier('freewake',1)&&!ds.freewakeFriendlyBuy)use('downtime','freewakeFriendlyBuy','Freewake Friendly: first merchant purchase this Downtime receives -5 Gold.');
    if(r==='sunscar'&&tier('sunspireConcord',1)&&!ds.concordFriendlyService)use('downtime','concordFriendlyService','Sunspire Concord Friendly: first civic/merchant service this Downtime receives -5 Gold.');
   }return res};
 }
 if(typeof window.merchantAccess==='function'&&!String(window.merchantAccess).includes('REP3360_ACCESS')){
  const base=window.merchantAccess;
  window.merchantAccess=function(hero){/* REP3360_ACCESS */let a=base.apply(this,arguments),r=region();if(!a?.ok)return a;let hostile=currentRegionFactionHostile();if(!hostile.length)return a;
   // Required campaign progression is never blocked. Only optional shop/service access is restricted.
   if(campaignDowntimeActive?.()&&['stormcoast','sunscar','ironspine','crownlands','verdant'].includes(r))return {...a,ok:false,reason:'Hostile local faction standing: optional merchant/service access is unavailable. Required Quest progression remains open.'};return a;
  };
 }
}

function installCrafting(){
 if(typeof window.craftRecipe!=='function'||String(window.craftRecipe).includes('REP3360_CRAFT'))return;
 const base=window.craftRecipe;
 window.craftRecipe=function(id){/* REP3360_CRAFT */let rcp=CRAFTING_RECIPES?.find?.(x=>x.id===id),r=region(),ds=dstate();if(!rcp)return base.apply(this,arguments);let discount=0,marks=[];
   let prof=String(rcp.profession||'').toLowerCase();
   if(r==='ironspine'&&tier('forgeCouncil',1)&&/blacksmith|smith|weapon|armor/.test(prof)&&!ds.forgeFriendly){discount+=5;marks.push('forgeFriendly')}
   if(r==='ironspine'&&tier('forgeCouncil',3)&&/blacksmith|smith|weapon|armor/.test(prof)&&!ds.forgeTrusted){discount+=10;marks.push('forgeTrusted')}
   if(r==='sunscar'&&tier('glasswrights',1)&&/artific|enchant/.test(prof)&&!ds.glassFriendly){discount+=5;marks.push('glassFriendly')}
   if(!discount)return base.apply(this,arguments);
   let old=Number(rcp.gold||0);rcp.gold=Math.max(0,old-discount);let gold0=Number(g.gold||0);try{return base.apply(this,arguments)}finally{let success=Number(g.gold||0)<gold0||old===0;if(success)for(const m of marks)use('downtime',m,(m==='forgeTrusted'?'Forge Council Trusted: -10 Gold service.':m==='forgeFriendly'?'Forge Council Friendly: -5 Gold service.':'Glasswright Friendly: -5 Gold craft/service.'));rcp.gold=old}
 };
}

function installExplorePerks(){
 if(typeof window.explore!=='function'||String(window.explore).includes('REP3360_EXPLORE'))return;const base=window.explore;
 window.explore=async function(){/* REP3360_EXPLORE */let r=region(),options=[];
   if(r==='ironspine'&&tier('deepdelver',1)&&unused('quest','deepdelverFriendlyExplore'))options.push(['deepdelver','deepdelverFriendlyExplore','Deepdelver Friendly']);
   if(r==='verdant'&&tier('rootwardens',1)&&unused('quest','rootwardensFriendlyExplore'))options.push(['rootwardens','rootwardensFriendlyExplore','Rootwardens Friendly']);
   if(r==='sunscar'&&tier('duneWardens',1)&&unused('quest','duneFriendlyExplore'))options.push(['duneWardens','duneFriendlyExplore','Dune Wardens Friendly']);
   if(r==='crownlands'&&tier('archiveSeven',3)&&unused('quest','archiveTrustedExplore'))options.push(['archiveSeven','archiveTrustedExplore','Archive Trusted']);
   if(options.length&&g?.pool?.length>=2){let [fk,uk,label]=options[0],a=g.pool[0],b=g.pool[1];let raw=prompt(`${label}: inspect the top 2 eligible Locations and choose which stays on top.\n1. ${a.id} — ${a.name}\n2. ${b.id} — ${b.name}`,'1');if(raw==='2'){g.pool[0]=b;g.pool[1]=a}use('quest',uk,label+' reorder used.');}
   return base.apply(this,arguments)
 };
}

function installSearchPerks(){
 if(typeof window.search!=='function'||String(window.search).includes('REP3360_SEARCH'))return;const base=window.search;
 window.search=async function(){/* REP3360_SEARCH */let r=region(),h=controlledHero(),t=heroTile(h);
   if(r==='crownlands'&&tier('archiveSeven',1)&&unused('quest','archiveFriendlySearch')&&t&&/Ancient|Archive|Crypt/i.test([t.name,t.type,t.terrain,...(t.traits||[])].join(' '))&&Array.isArray(g.searchDeck)){
     let idx=[];for(let i=0;i<g.searchDeck.length&&idx.length<2;i++)try{if(valid(g.searchDeck[i],t))idx.push(i)}catch(_){};
     if(idx.length>=2){let ca=g.searchDeck[idx[0]],cb=g.searchDeck[idx[1]],raw=prompt(`Archive Friendly: first Search here draws 2 eligible Search cards; choose which resolves.\n1. ${ca.name}\n2. ${cb.name}`,'1');if(raw==='2'){g.searchDeck.splice(idx[1],1);g.searchDeck.splice(idx[0],1);g.searchDeck.unshift(cb,ca)}use('quest','archiveFriendlySearch','Archive Friendly: draw 2 Search, keep 1 used.');}
   }
   return base.apply(this,arguments)
 };
}

function installEncounterPerks(){
 if(typeof window.startEncounter!=='function'||String(window.startEncounter).includes('REP3360_ENCOUNTER'))return;const base=window.startEncounter;
 window.startEncounter=function(source,origin){/* REP3360_ENCOUNTER */let r=region(),res=base.apply(this,arguments),can=false,k='',label='';
   if(r==='verdant'&&tier('rootwardens',3)&&unused('quest','rootTrustedEncounter')){can=true;k='rootTrustedEncounter';label='Rootwardens Trusted'}
   if(r==='stormcoast'&&tier('freewake',3)&&unused('quest','freewakeTrustedEncounter')){can=true;k='freewakeTrustedEncounter';label='Freewake Trusted'}
   if(r==='sunscar'&&tier('duneWardens',3)&&unused('quest','duneTrustedEncounter')){can=true;k='duneTrustedEncounter';label='Dune Wardens Trusted'}
   if(can&&pEnc&&confirm(`${label}: redraw this first regional Travel Encounter?\n${pEnc.card?.name||'Encounter'} — ${pEnc.text}\n\nOK = redraw; Cancel = keep it.`)){
     let old=pEnc.card;if(old)g.encDiscard.push(old);pEnc=null;document.getElementById('encPanel')?.classList.add('hidden');use('quest',k,label+' Encounter redraw used.');return base.call(this,source,origin)
   }return res
 };
}

function installHealing(){
 if(typeof window.healHeroBy!=='function'||String(window.healHeroBy).includes('REP3360_HEAL'))return;const base=window.healHeroBy;
 window.healHeroBy=function(h,n,label='Effect'){/* REP3360_HEAL */let r=region(),q=qstate(),tile=heroTile(h),bonus=0;
   if(r==='verdant'&&tier('eldergroveCircle',1)&&!q.elderFirstHeal){q.elderFirstHeal=true;bonus+=1;logP('Eldergrove Circle Friendly: first healing received this Quest +1 Health.')}
   if(r==='sunscar'&&tier('firstDawn',1)&&!q.dawnFirstHeal&&tile&&/Solar|Desert/i.test([tile.terrain,...(tile.traits||[]),...(tile.keywords||[])].join(' '))){q.dawnFirstHeal=true;bonus+=1;logP('First Dawn Friendly: first healing in Solar/Desert terrain +1 Health.')}
   if(r==='verdant'&&tier('lanternApothecary',5)&&/Potion|Consumable/i.test(String(label))&&!q.lanternExaltedPotion){q.lanternExaltedPotion=true;bonus+=2;logP('Lantern Apothecary Exalted: first healing consumable this Quest +2 Health.')}
   return base.call(this,h,Number(n||0)+bonus,label)
 };
}

function installConditions(){
 if(typeof window.addHeroCondition!=='function'||String(window.addHeroCondition).includes('REP3360_COND'))return;const base=window.addHeroCondition;
 window.addHeroCondition=function(h,n){/* REP3360_COND */let r=region(),q=qstate();if(isHarmful(n)&&r==='verdant'&&tier('spiritCourt',3)&&!q.spiritTrustedHarm&&/Spirit/i.test(String(q.lastEffectSource||''))){q.spiritTrustedHarm=true;logP('Spirit Court Trusted: first harmful non-Boss Spirit effect ignored.');return}
   let before=heroHasCondition(h,n),res=base.apply(this,arguments);if(!before&&heroHasCondition(h,n)&&r==='stormcoast'&&tier('beaconOrder',1)&&n==='Guarded'&&!q.beaconFriendlyGuard){let t=heroTile(h);if(t&&/Coast|Storm/i.test([t.terrain,...(t.traits||[])].join(' '))){q.beaconFriendlyGuard=true;healHeroBy(h,1,'Beacon Order Friendly')}}return res
 };
}

function installQuestStarts(){
 function apply(){if(!g?.campaign||campaignDowntimeActive?.())return;let id=qid(),q=qstate();if(q.startPerks3360)return;q.startPerks3360=true;let r=region();
   if(r==='stormcoast'&&tier('beaconOrder',5)){let hs=partyHeroes().filter(h=>!heroDefeated(h));if(hs.length){let h=hs[0];addHeroCondition(h,'Guarded');logP('Beacon Order Exalted: '+heroDisplayName(h)+' begins the Quest Guarded.')}}
   if(r==='verdant'&&tier('spiritCourt',5)&&/Q04[3-8]/.test(id)){let hs=partyHeroes().filter(h=>!heroDefeated(h));if(hs.length){let h=hs[0],x=confirm('Spirit Court Exalted: OK = begin Guarded; Cancel = begin Inspired.');addHeroCondition(h,x?'Guarded':'Inspired');logP('Spirit Court Exalted opening blessing applied.')}}
   if(r==='sunscar'&&tier('firstDawn',5)&&/^Q0(6[7-9]|7[0-2])$/.test(id)){let hs=partyHeroes().filter(h=>!heroDefeated(h));if(hs.length){addHeroCondition(hs[0],'Inspired');logP('Order of First Dawn Exalted: '+heroDisplayName(hs[0])+' begins Inspired.')}}
 }
 if(typeof window.render==='function'&&!String(window.render).includes('REP3360_START')){const base=window.render;window.render=function(){/* REP3360_START */let r=base.apply(this,arguments);try{apply()}catch(_){}return r}}
}

function installGroupReduction(){
 if(typeof window.spawnQuestEnemies!=='function'||String(window.spawnQuestEnemies).includes('REP3360_GROUP'))return;const base=window.spawnQuestEnemies;
 window.spawnQuestEnemies=function(t,list){/* REP3360_GROUP */let r=region(),q=qstate(),copy=(list||[]).map(x=>[x[0],x[1]]),perk=null,pred=null;
   if(r==='crownlands'&&tier('crownWatch',3)&&!q.crownTrustedGroup){perk='crownTrustedGroup';pred=/Human|Criminal/i}
   if(r==='verdant'&&tier('rootwardens',5)&&!q.rootExaltedGroup){perk='rootExaltedGroup';pred=/Beast|Blighted/i}
   if(r==='stormcoast'&&tier('ashenportAdmiralty',1)&&!q.admiraltyFriendlyGroup&&/Dock|Urban/i.test([t?.terrain,...(t?.traits||[])].join(' '))){perk='admiraltyFriendlyGroup';pred=/Drowned/i}
   if(r==='sunscar'&&tier('sunspireConcord',3)&&!q.concordTrustedGroup&&/Urban|Ruins/i.test([t?.terrain,...(t?.traits||[])].join(' '))){perk='concordTrustedGroup';pred=/Cinder Crown|Humanoid/i}
   if(perk){for(const row of copy){let d=ENEMY_WORKBOOK_320?.[row[0]],txt=(d?.enemyType||'')+' '+(d?.traits||'')+' '+(d?.difficulty||'');if(row[1]>0&&pred.test(txt)&&!/Boss|Elite|Legendary/i.test(txt)){let total=copy.reduce((a,x)=>a+Number(x[1]||0),0);if(total>1){row[1]--;q[perk]=true;logP('Faction perk removes one Standard enemy from the scripted group.');break}}}}
   return base.call(this,t,copy.filter(x=>x[1]>0))
 };
}

function installCivilianProtection(){
 // Q001 villager loss is the clearest universal civilian-loss path.
 if(typeof window.q001GoblinAttacksVillager==='function'&&!String(window.q001GoblinAttacksVillager).includes('REP3360_CIV')){const base=window.q001GoblinAttacksVillager;window.q001GoblinAttacksVillager=function(){/* REP3360_CIV */if(tier('stonebrook',5)&&unused('event','stonebrookExaltedCivilian')&&use('event','stonebrookExaltedCivilian','Stonebrook Exalted: prevent one Villager/Civilian loss this World Event.')){logP('Villager loss prevented.');return true}return base.apply(this,arguments)}}
}

function installTrackAndHazardHelpers(){
 window.ascRep3360={version:V,modifyTrackDelta,score,tier,region,use,unused,state,factions:R()?.factions||{},
   cancelStructuralHazard(kind){let r=region(),q=qstate();if(r==='ironspine'&&tier('stoneSinger',3)&&!q.stoneTrustedHazard){q.stoneTrustedHazard=true;logP('Stone-Singer Trusted: '+kind+' cancelled.');return true}if(r==='stormcoast'&&tier('tidewardens',3)&&!q.tideTrustedHazard){q.tideTrustedHazard=true;logP('Tidewarden Trusted: '+kind+' cancelled.');return true}if(r==='sunscar'&&tier('glasswrights',3)&&/Mirage|Reflection/i.test(kind)&&!q.glassTrustedHazard){q.glassTrustedHazard=true;logP('Glasswright Trusted: '+kind+' ignored.');return true}return false},
   objectiveHeadStart(kind){let r=region(),e=estate();if(r==='crownlands'&&tier('archiveSeven',5)&&!e.archiveObjective&&/Ward|Seal|Ritual/i.test(kind)){e.archiveObjective=true;return true}if(r==='sunscar'&&tier('glasswrights',5)&&!e.glassObjective&&/Ward|Seal/i.test(kind)){e.glassObjective=true;return true}return false}
 };
}

function install(){installTrackAndHazardHelpers();installMerchant();installCrafting();installExplorePerks();installSearchPerks();installEncounterPerks();installHealing();installConditions();installQuestStarts();installGroupReduction();installCivilianProtection();window.ASCENDANCE_REPUTATION_VERSION=V;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0));else setTimeout(install,0);setTimeout(install,700);setTimeout(install,1800);
})();
