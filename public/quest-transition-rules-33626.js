// Ascendance 3.36.26 — validated, atomic next-Quest setup contract.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascQuestTransitionRules33626=api})(globalThis,()=>{
'use strict';
const HEROES={"Elara":{"maxHp":10,"equipment":{"Weapon":"EQ021","Armor":"EQ086","Shield":null,"Offhand":null,"Accessory":["EQ105"]}},"Vaelis":{"maxHp":7,"equipment":{"Weapon":"EQ061","Armor":"EQ095","Shield":null,"Offhand":null,"Accessory":["EQ106"]}},"Rowan":{"maxHp":9,"equipment":{"Weapon":"EQ045","Armor":"EQ082","Shield":null,"Offhand":null,"Accessory":["EQ100"]}},"Thorne":{"maxHp":9,"equipment":{"Weapon":"EQ061","Armor":"EQ095","Shield":null,"Offhand":null,"Accessory":["EQ098"]}},"Cassian":{"maxHp":9,"equipment":{"Weapon":"EQ037","Armor":"EQ081","Shield":null,"Offhand":null,"Accessory":["EQ098"]}},"Kael":{"maxHp":9,"equipment":{"Weapon":null,"Armor":null,"Shield":null,"Offhand":null,"Accessory":["EQ098"]}},"Mira":{"maxHp":9,"equipment":{"Weapon":"EQ053","Armor":"EQ083","Shield":null,"Offhand":null,"Accessory":["EQ100"]}},"Malachar":{"maxHp":7,"equipment":{"Weapon":"EQ121","Armor":"EQ136","Shield":null,"Offhand":null,"Accessory":["EQ139","EQ140"]}},"Garruk":{"maxHp":12,"equipment":{"Weapon":"EQ130","Armor":"EQ137","Shield":null,"Offhand":null,"Accessory":["EQ140"]}},"Veyra":{"maxHp":8,"equipment":{"Weapon":"EQ123","Armor":"EQ135","Shield":null,"Offhand":null,"Accessory":["EQ141"]}},"Mordren":{"maxHp":8,"equipment":{"Weapon":"EQ123","Armor":"EQ135","Shield":null,"Offhand":null,"Accessory":["EQ139"]}},"Lucien":{"maxHp":9,"equipment":{"Weapon":"EQ133","Armor":"EQ138","Shield":null,"Offhand":null,"Accessory":["EQ143"]}},"Asha":{"maxHp":9,"equipment":{"Weapon":"EQ124","Armor":"EQ137","Shield":null,"Offhand":null,"Accessory":["EQ141"]}},"Aldric":{"maxHp":14,"equipment":{"Weapon":"EQ003","Armor":"EQ086","Shield":"EQ078","Offhand":null,"Accessory":[]}},"Lyra":{"maxHp":8,"equipment":{"Weapon":"EQ037","Armor":"EQ082","Shield":null,"Offhand":"EQ037","Accessory":["EQ098"]}},"Seraphine":{"maxHp":11,"equipment":{"Weapon":"EQ003","Armor":"EQ086","Shield":"EQ078","Offhand":null,"Accessory":["EQ105"]}}};
const EVENTS={"WE001":{"dayLimit":5,"next":"WE002","firstQuest":"Q001"},"WE002":{"dayLimit":6,"next":"WE003","firstQuest":"Q004"},"WE003":{"dayLimit":6,"next":"WE004","firstQuest":"Q007"},"WE004":{"dayLimit":null,"next":null,"firstQuest":"Q010"},"WE005":{"dayLimit":5,"next":"WE006","firstQuest":"Q013"},"WE006":{"dayLimit":6,"next":"WE007","firstQuest":"Q016"},"WE007":{"dayLimit":6,"next":"WE008","firstQuest":"Q019"},"WE008":{"dayLimit":null,"next":null,"firstQuest":"Q022"},"WE009":{"dayLimit":5,"next":"WE010","firstQuest":"Q025"},"WE010":{"dayLimit":6,"next":"WE011","firstQuest":"Q028"},"WE011":{"dayLimit":6,"next":"WE012","firstQuest":"Q031"},"WE012":{"dayLimit":null,"next":"WE013","firstQuest":"Q034"},"WE013":{"dayLimit":5,"next":"WE014","firstQuest":"Q037"},"WE014":{"dayLimit":6,"next":"WE015","firstQuest":"Q040"},"WE015":{"dayLimit":6,"next":"WE016","firstQuest":"Q043"},"WE016":{"dayLimit":null,"next":null,"firstQuest":"Q046"},"WE017":{"dayLimit":5,"next":"WE018","firstQuest":"Q049"},"WE018":{"dayLimit":6,"next":"WE019","firstQuest":"Q052"},"WE019":{"dayLimit":6,"next":"WE020","firstQuest":"Q055"},"WE020":{"dayLimit":null,"next":null,"firstQuest":"Q058"},"WE021":{"dayLimit":5,"next":"WE022","firstQuest":"Q061"},"WE022":{"dayLimit":6,"next":"WE023","firstQuest":"Q064"},"WE023":{"dayLimit":6,"next":"WE024","firstQuest":"Q067"},"WE024":{"dayLimit":null,"next":null,"firstQuest":"Q070"}};
const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
const own=(v,k)=>Object.prototype.hasOwnProperty.call(v||{},k);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];
const party=g=>Array.isArray(g?.partyHeroes)?g.partyHeroes:[];
const isObject=v=>v&&typeof v==='object'&&!Array.isArray(v);
function unsafe(v,depth=0){if(depth>60)return true;if(v&&typeof v==='object')for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k)||unsafe(v[k],depth+1))return true}return false}
function available(g,quest){const c=g?.campaign,n=Number(String(quest).slice(1)),event='WE'+String(Math.floor((n-1)/3)+1).padStart(3,'0');return /^Q\d{3}$/.test(String(quest))&&n>=1&&n<=72&&String(c?.activeEvent)===event&&String(c?.questStatus?.[quest]||'Available')==='Available'&&!c?.campaignEnded}
function worldEventAdvance(before,after,questSpec){
 const a=before?.campaign,b=after?.campaign,event=EVENTS[a?.activeEvent],next=event?.next&&EVENTS[event.next];
 if(!a||!b||!next||b.activeEvent!==event.next||b.currentQuest!==next.firstQuest||Number(b.day)!==1||String(a.instanceId32537||'')!==String(b.instanceId32537||''))return false;
 if(!equal(a.history,b.history))return false;
 const start=Number(event.firstQuest.slice(1)),required=Array.from({length:3},(_,i)=>'Q'+String(start+i).padStart(3,'0')).filter(id=>questSpec(id)?.type!=='Optional');
 return required.length>0&&required.every(id=>a.questStatus?.[id]==='Completed')&&['Completed','Failed'].includes(a.questStatus?.[a.currentQuest]);
}
function starting(hero){return copy(HEROES[hero]||null)}
function maxHealth(g,hero){const spec=HEROES[hero];if(!spec)return 0;const gear=g.equipped?.[hero]||{};return spec.maxHp+(Object.values(gear).flat().includes('EQ097')?2:0)}
const persistent=['gold','reputation','xp','levels','inventory','equipped','partyQuestItems','lootDeck','lootDiscard','equipmentDecks','craftedSpecials','heroKills3259','partySupplies33615','professions','professionState3250','crafting','craftingState3250','downtimeAuthority33622','lootAcquired321'];
const resourceGuard=['gold','reputation','xp','levels','inventory','equipped','partyQuestItems','lootDeck','lootDiscard','equipmentDecks'];
function canonicalResources(before,quest){
 const out={};for(const k of persistent)if(own(before,k))out[k]=copy(before[k]);
 out.xp??={};out.levels??={};out.inventory??={};out.equipped??={};
 const replacements=[];
 for(const hero of party(before))if(before.campaign?.heroFates?.[hero]?.status==='Lost'){
  const spec=starting(hero);if(!spec)return {error:'Unknown Hero replacement specification.'};
  out.xp[hero]=0;out.levels[hero]=1;out.inventory[hero]=[{key:'loot:LT002',kind:'loot',id:'LT002',qty:1}];out.equipped[hero]=spec.equipment;replacements.push(hero);
 }
 return {values:out,replacements};
}
// Rebuild only benefits already implemented by the equipment and Reputation
// runtimes. Derive them from the pre-transaction campaign, so client preparation
// and server validation can both call this without awarding a second Token.
function applySetupBenefits(before,g,quest,choices={}){
 const c=before.campaign||{},nc=g.campaign,carry=canonicalResources(before,quest);
 if(carry.error)return carry;
 const n=Number(String(quest).slice(1)),score=key=>Math.max(-5,Math.min(6,Number(c.factionReputation3342?.[key])||0));
 const already=!!c.repPerks3360?.quest?.[quest]?.startPerks3360;
 if(!already&&n>=43&&n<=48&&score('spiritCourt')>=5&&!['Guarded','Inspired'].includes(choices?.spiritCourt))return {error:'Choose the Spirit Court Exalted opening blessing.'};
 const owner=party(before).find(h=>(carry.values.inventory?.[h]||[]).some(x=>x.kind==='loot'&&x.id==='LT149'&&Number(x.qty||0)>0));
 const shardKey=`${quest}:${c.day??0}:${c.questAttempt??c.attempt??0}`,shardMarks=isObject(before.relicShardQuest33612)?copy(before.relicShardQuest33612):{};
 const shardNew=!!owner&&/^Q\d+/i.test(String(quest))&&!shardMarks[shardKey];
 const count=Number(c.ascendanceTokens||0);
 if(shardNew&&c.usesAscendanceTokens&&(!Number.isSafeInteger(count)||count<0))return {error:'The campaign Ascendance Token count is invalid.'};
 for(const key of ['usesAscendanceTokens','ascendanceTokens']){if(own(c,key))nc[key]=copy(c[key]);else delete nc[key]}
 if(shardNew){
  shardMarks[shardKey]=true;
  if(c.usesAscendanceTokens)nc.ascendanceTokens=count+1;
 }
 if(Object.keys(shardMarks).length)g.relicShardQuest33612=shardMarks;else delete g.relicShardQuest33612;
 // The no-Token-system alternative draws one card in the existing LT149 setup
 // hook. Keep that prepared card layout; this helper never draws another card.
 const perks=isObject(c.repPerks3360)?copy(c.repPerks3360):{};
 for(const key of ['quest','event','downtime'])if(!isObject(perks[key]))perks[key]={};
 const q=isObject(perks.quest[quest])?perks.quest[quest]:(perks.quest[quest]={});let blessing=null,spiritChoice=null;
 if(!already){
  if(n>=49&&n<=60&&score('beaconOrder')>=5)blessing='Guarded';
  else if(n>=43&&n<=48&&score('spiritCourt')>=5){
   spiritChoice=choices.spiritCourt;blessing=spiritChoice;
  }else if(n>=67&&n<=72&&score('firstDawn')>=5)blessing='Inspired';
 }
 q.startPerks3360=true;nc.repPerks3360=perks;
 g.questSetupChoices33626=spiritChoice?{spiritCourt:spiritChoice}:{};
 const first=party(before)[0];
 if(blessing&&first){const target=body(g,first);target.conditions??=[];if(!target.conditions.includes(blessing))target.conditions.push(blessing)}
 return {shardOwner:owner||null,shardToken:shardNew&&!!c.usesAscendanceTokens,factionBlessing:blessing};
}
function validate(before,proposed,command={}){
 if(!isObject(before)||!isObject(before.campaign)||!isObject(proposed)||!isObject(proposed.game))return {error:'Missing next-Quest game state.'};
 if(unsafe(proposed)||unsafe(command))return {error:'Unsafe Quest transition data.'};
 const quest=String(command.quest||''),from=String(command.fromQuest||''),c=before.campaign,next=proposed.game,nc=next.campaign;
 if(from!==String(c.currentQuest||''))return {error:'Quest transition no longer matches the current Quest.'};
 if(!available(before,quest))return {error:'The next Quest is not available in the active World Event.'};
 if(!isObject(nc)||nc.currentQuest!==quest||String(nc.activeEvent)!==String(c.activeEvent)||Number(nc.day)!==Number(c.day)||String(nc.instanceId32537||'')!==String(c.instanceId32537||''))return {error:'Quest transition changed campaign identity, World Event or Day.'};
 if(!equal(party(before),party(next))||!party(next).length||party(next).some(h=>!HEROES[h]))return {error:'Quest transition cannot change the party roster.'};
 if(next.round!==1||next.phase!=='Hero Phase'||nc.downtime!==false)return {error:'A new Quest must begin at Round 1 in Hero Phase.'};
 if(!isObject(next.tiles)||Object.keys(next.tiles).length!==1||next.tiles['0,0']?.id!=='L000')return {error:'The next Quest must rebuild a fresh Stonebrook board.'};
 if(!Array.isArray(next.pool)||!next.pool.length||next.pool.length>100||next.pool.some(t=>!/^L\d{3}$/.test(String(t?.id||''))||Number(String(t.id).slice(1))<1||Number(String(t.id).slice(1))>235)||new Set(next.pool.map(t=>t.id)).size!==next.pool.length)return {error:'The next Quest Location Pool is invalid.'};
 if(quest!=='Q001'&&(next.tiles['0,0'].enemies||[]).length)return {error:'This Quest has no opening enemies in Stonebrook.'};
 const expected=canonicalResources(before,quest);if(expected.error)return expected;
 for(const key of resourceGuard){if(own(before,key)||own(next,key)){if(!equal(next[key],expected.values[key]))return {error:'Quest setup cannot change campaign '+key+' except the authored Lost Hero replacement.'}}}
 for(const key of ['history','questStatus','lastQuestOutcome','questRewardReceipts33622','questRewardEquipmentOwed33622','factionReputation3342'])if(!equal(key==='factionReputation3342'?(c[key]||{}):c[key],key==='factionReputation3342'?(nc[key]||{}):nc[key]))return {error:'Quest setup cannot grant completion rewards or alter campaign '+key+'.'};
 for(const hero of party(before)){
  const st=body(next,hero);if(!isObject(st))return {error:'The next Quest is missing a party Hero.'};
  const pos=hero==='Aldric'?next.hero:st;if(Number(pos?.x)!==0||Number(pos?.y)!==0)return {error:'Every Hero must begin the next Quest in Stonebrook.'};
  if(!Number.isFinite(st.hp)||st.hp<1||st.hp>99)return {error:'The next Quest Hero Health is invalid.'};
 }
 const state=copy(proposed),g=state.game;
 for(const k of persistent){if(own(expected.values,k))g[k]=copy(expected.values[k]);else delete g[k]}
 // The campaign record is canonical. Only the new scenario's runtime and scaling
 // context may be rebuilt; starting a Quest never settles the previous Quest.
 const preserved=copy(c);
 const questRuntimeKey=({Q001:'q001',Q002:'q002',Q003:'q003'})[quest];
 if(questRuntimeKey&&own(nc,questRuntimeKey))preserved[questRuntimeKey]=copy(nc[questRuntimeKey]);
 for(const key of ['genericQuest','c34Quest','c56Quest'])if(nc[key]?.id===quest)preserved[key]=copy(nc[key]);
 if(nc.playerScaling32761?.current?.id===quest)preserved.playerScaling32761=copy(nc.playerScaling32761);
 preserved.currentQuest=quest;preserved.downtime=false;preserved.heroFates=copy(c.heroFates||{});
 // Match level-progression root(): these are per-Quest/round counters, not
 // permanent progression. Old Round10 cooldown stamps cannot enter Round1.
 if(own(c,'levelRuntime3360'))preserved.levelRuntime3360={quest,hero:{},groupDamage:{},round:0,roundStart:{}};
 for(const hero of party(before)){
  const lost=expected.replacements.includes(hero),fate=preserved.heroFates[hero];
  if(lost)preserved.heroFates[hero]={status:'Replacement',quest,day:c.day};
  else if(fate?.status==='Downed')preserved.heroFates[hero]={...fate,status:'Survived',quest,day:c.day};
  const st=body(g,hero);st.hp=maxHealth(g,hero);st.maxHp=HEROES[hero].maxHp;st.actions=0;st.conditions=[];st.reactionsUsed=0;
  if(hero==='Aldric'){g.hero={x:0,y:0};g.conditions=[]}else{st.x=0;st.y=0;st.maxHp=HEROES[hero].maxHp}
  if(lost&&preserved.levelRuntime3360?.hero)delete preserved.levelRuntime3360.hero[hero];
 }
 // Battle Ready is a fresh, authored setup benefit, never an old Status carry.
 if(party(before).includes('Aldric')&&Number(g.levels?.Aldric||1)>=2)g.conditions=['Guarded'];
 g.campaign=preserved;
 const setup=applySetupBenefits(before,g,quest,next.questSetupChoices33626);if(setup.error)return setup;
 g.round=1;g.phase='Hero Phase';g.passedHeroes32521={};g.activeHero=party(before).includes(g.activeHero)?g.activeHero:party(before)[0];
 for(const key of ['roomAuthority3300','heroAuthority3303','resourceAuthority3310','phaseAuthority3311','explorationAuthority3305','legacyPatchAuthority3322']){delete g[key];delete state[key]}
 delete state.pending;state.pending={pLoc:null,pSearch:null,pEnc:null,selected:null};
 return {state,replacements:expected.replacements,quest,fromQuest:from};
}
return {version:'3.36.26',available,worldEventAdvance,starting,maxHealth,canonicalResources,applySetupBenefits,validate,persistent:[...persistent]};
});
