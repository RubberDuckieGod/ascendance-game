// Ascendance v10.59: named First Visit feature registry + bounded shared reducer.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascFirstVisit1061=api})(globalThis,()=>{
'use strict';
const dep=(path,key)=>typeof module==='object'&&module.exports?require(path):globalThis[key];
const catalog=dep('./first-visit-catalog-v1061.js','ascFirstVisitCatalog1061');
const status=()=>dep('./status-rules-33627.js','ascStatusRules33627');
const healRules=()=>dep('./healing-summons-rules-33627.js','ascHealingSummonsRules33627');
const resource=()=>dep('./party-resources-v1058.js','ascPartyResources1058');
const rawPlans={"100":"s:M2,x1","101":"s:y2","102":"s:rWeakened/Vulnerable|s:gRegrouped@l","103":"s:gBraced@r|s:gShielded@l","104":"h:h2|h:x1,d2","105":"h:gEntrenched@l","106":"s:gFocused@l|s:gProtected@l","107":"s:gWard@l|s:x1,RMana Burn/Hexed","108":"s:cShaken@n,d1|s:x1,rShaken","109":"s:gCountering@l","110":"s:rScorched/Burning|s:x1,h1","111":"s:gElevated@l|s:gShielded@l","112":"h:x1,rCracked Armor|h:d1,x1","113":"s:b1,V1","114":"h:h2|h:rBurning","115":"s:N3","116":"h:gShielded@l","117":"h:u?1,x1,ZU","118":"s:rDazed|s:gFocused@l","119":"s:x1,gInspired@l|s:x1,gGuarded@l","120":"s:rBleeding/Crippled","121":"s:a1,d1|s:gFocused@l","122":"s:gShielded@l|s:gProtected@l","123":"s:q2","124":"s:x1,d1,gFocused@l","125":"h:kL125","126":"h:kL126","127":"h:kL127","128":"h:kL128","129":"h:kL129","130":"h:kL130","131":"h:kL131","132":"s:gFocused@l|s:gProtected@l","133":"h:h1|h:rBleeding","134":"h:u1,d2,x1","135":"f:d1|z:d1,x1","136":"h:X1,rSlowed/Crippled","137":"h:a1,P3","138":"h:rPoisoned/Weakened","139":"s:b1,d2,x1","140":"h:a1,G10|h:x1,G5","141":"s:rBleeding|s:gProtected@l","142":"s:T2","143":"s:gEvasive@l|s:gElevated@l","144":"h:u1,V1","145":"o:X1,d1|l:d1,x1","146":"s:gShielded@l|s:gShielded@l,t1,gGuarded@l","147":"s:rShaken/Frightened","148":"s:x2,h3","149":"h:O3","150":"h:rBlinded|h:gCamouflaged@l","151":"h:B1,h1","152":"h:x1,rVulnerable/Cracked Armor","153":"s:h2|s:b1,d1","154":"s:rSilenced/Weakened","155":"s:gFocused@l|s:gShielded@l","156":"s:gFortified@l","157":"s:u?1,ZH","158":"s:h1|o:U1,h2","159":"s:rDazed/Staggered","160":"s:d2,t1,x1","161":"s:a1,d1,oShaken|s:gProtected@l","162":"h:kL162","163":"h:kL163","164":"h:kL164","165":"h:kL165","166":"h:kL166","167":"h:kL167","168":"s:rChilled|s:gEvasive@l","169":"s:gBraced@rl|s:gFocused@l","170":"h:a1,G5|h:u1,G10","171":"h:h2|h:rChilled","172":"h:gHidden@l","173":"h:a1,YD:LT004|h:p5,rBleeding","174":"s:x1,rChilled|s:h1,gWet@r","175":"s:x1,gSteadfast@l","176":"s:n3","177":"s:p5,gWard@l|h:rWet","178":"h:a1,E2","179":"j:d1,x1|s:h1","180":"h:rBurning,gWet@r|h:x1,rCorroded","181":"s:b1,Vrand","182":"h:x1,G10|h:p5,rCracked Armor","183":"s:cSilenced@l,d1","184":"h:F1|h:G5","185":"s:cRooted@r,gProtected@l","186":"s:u1,d2,x1","187":"h:p5,rBlinded/Exposed,J1","188":"h:m2,d1,x1","189":"s:p5,rDisarmed/Cracked Armor/Corroded","190":"s:h2|s:d1,x1","191":"s:x1,gUnstoppable@l","192":"h:h2|h:h1,H1","193":"h:gElevated@l","194":"s:t1,h2","195":"h:rChilled/Wet,h1","196":"h:p5,rFrightened/Panicked|h:p5,rFrightened/Panicked,b1,d1","197":"h:X1,rKnocked Down/Grappled/Restrained","198":"s:w3","199":"h:kL199","200":"h:kL200","201":"h:kL201","202":"h:kL202","203":"h:kL203","204":"h:kL204","205":"h:kL205","206":"h:kL206","207":"h:i207","208":"s:oScorched,h2","209":"s:W1","210":"h:x1,Q2","211":"h:p5,rPoisoned/Burning,gWet@r","212":"h:a1,G10","213":"s:x1,rBleeding|s:x1,gGuarded@l","214":"s:!Blinded,cBlinded@l,eConfused/Frightened","215":"h:rShaken|s:gProtected@l","216":"s:u2,Vtop","217":"s:x1,rBlinded|s:x1,gTrue Sight@l","218":"h:F1|h:F1,p5,d1","219":"h:a1,d1|h:a1,i219","220":"h:gRegrouped@l","221":"s:a1,gElevated@l,gTrue Sight@l","222":"s:t1,gProtected@l","223":"s:rInspired,gBarrier@l","224":"s:x1,gCamouflaged@l","225":"h:rBurning/Scorched,gWet@r","226":"s:i226","227":"h:U1,rCursed/Hexed","228":"s:x1,rSlowed/Crippled,gExhausted@n","229":"s:x2,V1","230":"s:!Scorched,rBurning,gScorched@d|s:rWet","231":"s:gEvasive@l|s:rDazed","232":"h:X1,gShielded@l","233":"o:X1,d1|l:d1,x1","234":"s:u1,rSilenced|s:x1,rWeakened","235":"h:d1,x1|h:CInspired,h2|h:CInspired,d1","001":"s:d1,x1","002":"s:gFocused@l","003":"h:h1|h:d1,x1","004":"s:rBurning/Corroded,gWet@r","005":"h:I2","006":"s:K1","007":"h:x1,h2|h:x1,rBleeding","008":"s:gVenomproof@l","009":"s:gUnstoppable@l","011":"s:rFrightened|s:x1,gWard@l","012":"s:gTrue Sight@l|s:I2","014":"s:gSteadfast@l","015":"s:rBleeding|s:gProtected@l","016":"h:rBurning/Corroded,h1","017":"s:gEvasive@l","018":"h:x1,rCracked Armor/Corroded","019":"s:gBraced@r|s:x1,rMarked","020":"s:gShielded@l","021":"s:x1,gInspired@l","022":"h:rPoisoned|h:h1","023":"h:d1,x1","024":"s:x1,rHexed|s:x1,gWard@l","025":"h:d2,x2","026":"s:x1,gEmpowered@l","027":"s:gColdproof@l","028":"h:x1,rPoisoned/Weakened","030":"s:x1,rPoisoned/Bleeding","031":"h:rCorroded|h:gProtected@n","032":"s:gConsecrated@l","033":"s:gFireproof@l","034":"s:I2","036":"h:F1","037":"s:gProtected@l","039":"h:rShaken|h:gInspired@n","040":"s:gFocused@l|s:gWard@l","041":"h:K2","042":"s:x1,gGuarded@l","043":"s:b1,d1","044":"s:gEntrenched@l","045":"h:gRegrouped@n","046":"s:b1,d2,x1","048":"h:x1,RBleeding/Burning","050":"s:x1,gSteadfast@l,gProtected@l","053":"s:K1|s:rShaken","054":"h:p5,RCracked Armor/Corroded|h:p5,gShielded@n","056":"s:u1,d2,x1","057":"s:rBurning/Corroded,gWet@r","058":"h:p5,h3|h:x1,h1","059":"s:p5,gSteadfast@l|s:p5,gConsecrated@l","060":"h:a1,G10|h:x1,h2","061":"s:gElevated@l|s:gEvasive@l","062":"h:p10,h2,d1","063":"s:rSilenced|s:gBlessed@l","064":"s:x1,RMarked/Exposed|s:gBraced@r","066":"s:b1,d1|s:rShaken","076":"s:p5,rPoisoned|s:gVenomproof@l","077":"s:gWet@rl,gEvasive@rl","078":"h:p5,Z0/0/5/5/5/15","080":"s:gSteadfast@l|s:gTrue Sight@l","081":"s:gUnstoppable@l","085":"s:rFrightened/Shaken|s:gInspired@l","092":"s:rSilenced/Mana Burn|s:gConsecrated@l","094":"s:x1,rSlowed|s:gProtected@l","096":"s:gCountering@l|s:gEvasive@l","098":"s:K2","099":"s:rChilled/Frozen|s:gRegenerating@l","079":"h:a1,h2,jFrightened","082":"o:X1,d1|l:d1,x1","083":"s:gShielded@l|s:gShielded@l,x1,h1","084":"h:v2","086":"s:x1,gTrue Sight@l|s:cExposed@d,d1","087":"s:q2|s:rFrightened/Shaken","097":"h:D3","069":"s:x1,gHidden@l|s:p5,d1","013":"s:A0|s:d1,x1","070":"h:A1|h:h1","072":"s:S2","074":"j:rFrightened/Shaken|j:!Frightened,!Shaken,d1,x1","095":"h:a1,YL:LT031","047":"h:kL047","051":"h:kL051","065":"h:kL065","067":"h:kL067","068":"h:kL068","073":"h:kL073","075":"h:kL075","088":"h:kL088","089":"h:kL089","091":"h:kL091","093":"h:kL093","010":"h:i010","029":"h:gProtected@n","035":"h:i035","038":"s:gSurefooted@n","049":"h:I3","052":"s:i052","055":"h:i055","071":"h:i071","090":"h:b1,h2|h:gShielded@n"};
const plans=Object.fromEntries(Object.entries(rawPlans).map(([id,raw])=>['L'+id,raw.split('|').map(s=>({target:s[0],steps:s.slice(2).split(',')}))]));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const merchant=()=>dep('./merchant-terrain-rules-33627.js','ascMerchantTerrainRules33627');
const crafting=()=>dep('./downtime-rules-33622.js','ascDowntimeRules33622');
const encounterRules=()=>dep('./encounter-deck-rules-33624.js','ascEncounterDeckRules33624');
const HUBS=new Set(['L051','L088','L125','L162','L199']);
const factions={L067:'crownWatch',L068:'archiveSeven',L073:'crownWatch',L075:'lanternConsortium',L088:'forgeCouncil',L089:'forgeCouncil',L091:'deepdelver',L093:'stoneSinger',L126:'eldergroveCircle',L127:'lanternApothecary',L128:'rootwardens',L129:'spiritCourt',L130:'eldergroveCircle',L163:'ashenportAdmiralty',L164:'tidewardens',L165:'freewake',L166:'beaconOrder',L200:'sunspireConcord',L202:'duneWardens',L203:'glasswrights',L204:'firstDawn',L206:'duneWardens'};
const crisisSites={c4SavedSites:['L126','L127','L129','L130'],c5SavedSites:['L163','L164','L165','L166'],c6SavedSites:['L200','L202','L203','L204']};
const instance=g=>String(g?.campaign?.instanceId32537||'legacy');
const siteKey=(g,h,rec)=>catalog[rec?.id]?.campaign&&!rec.deferred&&g.campaign?.downtime&&rec.key==='0,0'?'0,0':keyOf(g,h);
const siteHere=(g,rec)=>(g.partyHeroes||[]).filter(h=>live(g,h)&&siteKey(g,h,rec)===rec.key);
const facilityOK=(g,rec)=>{const t=g.tiles?.[rec.key],c=g.campaign||{};return !!t&&!t.damaged&&!t.destroyed&&!t.locked&&!t.sealed&&t.functional!==false&&!t.servicesSuspended&&c.facilityChanges?.[rec.id]?.disabledAll!==true&&c.c3SavedFacilities?.[rec.id]!==false&&!c.damagedSites?.includes?.(rec.id)&&!c.disabledServices?.includes?.(rec.id)};
function gateNeeded(t){return t?.id==='L029'&&!t.passageCleared1063&&!t.passageCleared||t?.id==='L049'&&!t.gatewayActivated1063&&!t.gatewayActivated}
function gateOptions(g,h,env={}){const k=keyOf(g,h),t=g.tiles?.[k],b=status().body(g,h);if(!t||!gateNeeded(t)||terminal(g)||!live(g,h)||!clear(t)||status().actionError(b)||Number(b.actions||0)-Number(b.attackOnlyActions||0)<1||env.requireActive&&env.turnHero!==h)return [];
 return [{id:t.id,label:t.id==='L029'?'Clear Blocked Passage — 1 Action':'Activate Dormant Gateway — 1 Action'}]}
function gateInteract(g,h,id,env){if(!gateOptions(g,h,env).some(x=>x.id===id))return {error:'The gate interaction is not currently legal.'};const t=g.tiles[keyOf(g,h)],b=status().body(g,h);b.actions--;if(id==='L029'){t.passageCleared1063=true;t.passageCleared=true}else{t.gatewayActivated1063=true;t.gatewayActivated=true}log(g,'FIRST VISIT: '+(id==='L029'?'Blocked Passage cleared.':'Dormant Gateway activated.'));return {resolved:true,gate:true}}
function availableMove(g,h,key,mode,env={}){
 const b=status().body(g,h),from=g.tiles?.[keyOf(g,h)],to=g.tiles?.[key];if(!live(g,h)||!from||!to||!legalNeighbor(g,h,key)||!clear(from)||status().movementError(b)||status().has(b,'Suppressed')||b.movementEndedRound===g.round||b.locationMovementEndedRound===g.round||b.partyMoveBlocked1058?.round===g.round||from.id==='L029'&&gateNeeded(from)||from.id==='L008'||from.c34Choked||from.c56Crushed||to.c56Crushed||from.movementBlocked||to.movementBlocked)return null;
 if(mode==='052'&&!/\bRoad\b/i.test([to.terrain,to.type,...(to.traits||[])].join(' ')))return null;
 if(mode==='207'&&!to.visited)return null;
 const difficult=from.id==='L038'||(from.traits||[]).includes('Difficult Terrain')||from.difficultTerrain||from.rubble1058;
 let cost=mode==='rope'?0:Number(!!difficult&&!b.difficultPrepared),ignore=null;
 if(mode!=='rope'){cost+=Math.max(0,Number(b.nextMoveExtraAction||b.nextMoveExtraActions||0));if(cost>0&&merchant()?.terrainFree?.(g,h,from,false)){cost--;ignore='terrain'}else if(cost>0&&from.id==='L052'&&from.royalHighwayRound1063!==g.round){cost--;ignore='road'}}
 if(Number(b.actions||0)-Number(b.attackOnlyActions||0)<cost)return null;
 return {hero:h,to:key,from:keyOf(g,h),cost,ignore,mode}
}
function moveChoices(g,h,rec,mode,env){const choices=[];if(mode==='219'){for(const who of adjacentHeroes(g,h,rec)){const m=availableMove(g,who,rec.key,mode,env);if(m)choices.push({...m,label:who+' moves here'+(m.cost?' (pays '+m.cost+' extra Action)':'')})}}else for(const dest of healRules().neighbors(g,h)){const m=availableMove(g,h,dest.key,mode,env);if(m)choices.push({...m,label:'Move to '+(dest.t.name||dest.key)+(m.cost?' — '+m.cost+' additional Action':'')})}return choices}
function performMove(g,rec,m,env){const next=availableMove(g,m.hero,m.to,m.mode,env);if(!next)return {error:'The Move is no longer legal.'};const b=status().body(g,m.hero),p=status().position(g,m.hero),from=g.tiles[next.from];b.actions-=next.cost;if(next.ignore==='terrain')merchant().terrainFree(g,m.hero,from,true);if(next.ignore==='road')from.royalHighwayRound1063=g.round;if(next.mode!=='rope'){delete b.nextMoveExtraAction;delete b.nextMoveExtraActions}b.difficultPrepared=false;const [x,y]=next.to.split(',').map(Number);p.x=x;p.y=y;rec.outcome={...(rec.outcome||{}),fvMove:{hero:m.hero,from:next.from,to:next.to}};return {resolved:true}}
const stableCard=(c,i)=>String(c?.uid||c?.id||cardLabel(c))+':'+i;
function eligibleStatus(g,h,n){const b=status().body(g,h),m=b?.statusDurations33628?.[n];if(status().definitions.byName[n]?.Type!=='Beneficial'||!flag(b,n))return false;
 const sources=m?.sources||[m||{}];if(sources.some(s=>/equipment|^EQ\d/i.test(String(s?.source||s?.sourceToken||'')))||b.equipmentGrantedStatuses?.includes?.(n)||b.equipmentStatuses?.includes?.(n))return false;
 // A legacy untagged Status that is also explicitly granted by currently equipped gear is not safe to spend.
 if(!m?.sources?.length&&Object.values(g.equipped?.[h]||{}).flat().some(id=>(EQUIPMENT_STATUS_GRANTS[id]||[]).includes(n)))return false;return true}
function isBroken(r){return !!(r?.broken||r?.status==='Broken'||r?.conditions?.some(c=>status().name(c)==='Broken')||r?.statuses?.some(c=>status().name(c)==='Broken'))}
function repairRow(r){delete r.broken;if(r.status==='Broken')delete r.status;if(Array.isArray(r.conditions))r.conditions=r.conditions.filter(c=>status().name(c)!=='Broken');if(Array.isArray(r.statuses))r.statuses=r.statuses.filter(c=>status().name(c)!=='Broken')}
function canHeal(g,h){const b=status().body(g,h);return live(g,h)&&Number(b.hp)<status().maxHp(g,h)&&!b.noHealUntilTurnEnd&&b.noHealUntilRound!==g.round}
function consumableChoices(g,rec,h,env){const out=[],b=status().body(g,h),t=g.tiles?.[rec.key],add=(id,target,label,extra={})=>out.push({key:id+':'+String(target)+':'+String(extra.enemyIndex??extra.to??''),label:commonDef(id).name+' — '+label,type:'consume',id,target,...extra});
 for(const id of [...new Set(cards(g.inventory?.[h]).filter(r=>r.kind==='loot'&&r.qty>0&&!r.quest&&!r.bound).map(r=>r.id))]){const def=commonDef(id);if(!def?.consumable)continue;
 if(['LT001','LT002'].includes(id)&&canHeal(g,h))add(id,h,'Recover '+(id==='LT001'?2:4)+' Health');
 if(['LT004','LT005','LT006'].includes(id)){const n={LT004:'Bleeding',LT005:'Poisoned',LT006:'Burning'}[id];for(const who of here(g,rec.key))if(flag(status().body(g,who),n))add(id,who,'Remove '+n+' from '+who,{status:n})}
 if(id==='LT013'&&(canHeal(g,h)||flag(b,'Bleeding')))add(id,h,'Recover 1 Health and remove Bleeding');
 if(id==='LT015')add(id,h,'Smoke at this Location until end of turn');
 if(id==='LT019'){const keys=[rec.key,...healRules().neighbors(g,h).map(x=>x.key).filter(k=>legalNeighbor(g,h,k))];for(const k of keys)cards(g.tiles?.[k]?.enemies).forEach((en,i)=>{if(Number(en.hp)>0)add(id,k,'Deal 2 damage to '+(en.name||en.id),{enemyIndex:i,enemyId:en.roomEnemyId3301||en.uid||en.id||String(i)})})}
 if(id==='LT021')add(id,h,'Place a Caltrops token');
 if(id==='LT023')add(id,h,'Ignore one Dark/visibility restriction until end of round');
 if(id==='LT024'){if(Number(b.ignoreVisibilityThroughRound||0)>=g.round)add(id,h,'Extend the active Torch');if(t.burning===true||t.extinguishableBurning===true)add(id,rec.key,'Extinguish Burning at this Location',{extinguish:true})}
 if(id==='LT025')for(const m of moveChoices(g,h,rec,'rope',env))add(id,m.hero,m.label,{to:m.to,move:m});
 if(id==='LT028'&&g.equipped?.[h]?.Weapon)add(id,h,'Give equipped Weapon +1 on next Attack');
 // Rations are not an independent immediate use: the printed trigger is Rest.
 }return out}
function ordinaryChoices(g,rec,h,env={}){const b=status().body(g,h),zz=z(g,h)||{},out=[],id=rec.id,add=(key,label,extra={})=>out.push({key,label,...extra});
 if(id==='L010'||id==='L071')return consumableChoices(g,rec,h,env);
 if(id==='L035'&&facilityOK(g,rec))for(const [ri,r]of cards(g.inventory?.[h]).entries()){const d=r.kind==='equipment'&&commonDef(r.id,'equipment');if(!d||!isBroken(r)||r.quest)continue;cards(zz.hand).forEach((c,i)=>add('repair:'+r.id+':'+ri+':'+stableCard(c,i),'Repair '+d.name+'; discard '+cardLabel(c),{type:'repair',row:ri,item:r.id,card:i}))}
 if(['L052','L207','L219'].includes(id))for(const m of moveChoices(g,h,rec,id.slice(1),env))add('move:'+m.hero+':'+m.to,m.label,{type:'move',move:m});
 if(id==='L055'){if(canHeal(g,h))add('heal','Recover 2 Health',{type:'coach'});if(flag(b,'Bleeding'))for(const who of here(g,rec.key).filter(x=>x!==h))cards(z(g,who)?.hand).forEach((c,i)=>add('coach:'+who+':'+stableCard(c,i),'Recover 2; '+who+' discards '+cardLabel(c)+' to remove Bleeding',{type:'coach',payer:who,card:i}))}
 if(id==='L226'&&drawCount(g,h)>0)for(const n of status().conditions(b).map(status().name).filter(n=>eligibleStatus(g,h,n)))add('status:'+n,'Remove '+n+'; draw 1 Hero card',{type:'status',status:n});
 return out
}
function discardHand(g,h,i){const q=z(g,h);if(!q||!q.hand?.[i])return false;q.discard.push(q.hand.splice(i,1)[0]);return true}
function applyOrdinary(g,rec,h,q,env){const b=status().body(g,h),t=g.tiles?.[rec.key],recover=(who,n)=>healRules().heal(g,who,n,{random:env.random},rec.owner||h);
 if(q.type==='repair'){const row=g.inventory[h][q.row];if(row?.id!==q.item||!isBroken(row)||!discardHand(g,h,q.card))return {error:'The repair is no longer available.'};repairRow(row)}
 else if(q.type==='coach'){if(q.payer){if(!discardHand(g,q.payer,q.card))return {error:'The other Hero’s hand changed.'};status().remove(b,'Bleeding')}recover(h,2)}
 else if(q.type==='status'){if(!eligibleStatus(g,h,q.status))return {error:'Status cannot pay this cost.'};status().remove(b,q.status);healRules().draw(g,h,1,{random:env.random})}
 else if(q.type==='move'){if(rec.id==='L219'){if(status().actionError(b)||Number(b.actions||0)-Number(b.attackOnlyActions||0)<1||env.requireActive&&env.turnHero!==h)return {error:'This option requires one general Action on your turn.'};b.actions--}const r=performMove(g,rec,q.move,env);if(r.error)return r}
 else if(q.type==='consume'){
  if(!removeLoot(g,h,q.id))return {error:'Consumable no longer owned.'};const n=q.id;
  if(n==='LT001'||n==='LT002')recover(h,n==='LT001'?2:4);
  else if(q.status)status().remove(status().body(g,q.target),q.status);
  else if(n==='LT013'){recover(h,1);status().remove(b,'Bleeding')}
  else if(n==='LT015')t.smokeBombRound=g.round;
  else if(n==='LT019'){const dest=g.tiles[q.target],en=dest?.enemies?.[q.enemyIndex];if(!en||Number(en.hp)<=0||String(en.roomEnemyId3301||en.uid||en.id||q.enemyIndex)!==String(q.enemyId))return {error:'Enemy target changed.'};const hpBefore=Number(en.hp),eid=en.roomEnemyId3301||en.uid||en.id;status().damage(en,2,{damageType:'physical'});const hpAfter=Number(en.hp),killed=hpAfter<=0;if(killed){dest.enemies.splice(q.enemyIndex,1);g.heroKills3259??={};g.heroKills3259[h]=Number(g.heroKills3259[h]||0)+1;if(h==='Aldric')g.kills=Number(g.kills||0)+1;const benefit=status().killEffects(b,{round:g.round,token:status().activationToken(g,h)});if(benefit.heal)recover(h,benefit.heal)}rec.outcome={...(rec.outcome||{}),fvDamage:[{enemyId:eid,hpBefore,hpAfter,tileBefore:q.target,tileAfter:q.target,removed:killed}]}}
  else if(n==='LT021')t.caltrops=Number(t.caltrops||0)+1;
  else if(n==='LT023')b.ignoreVisibilityThroughRound=g.round;
  else if(n==='LT024'){if(q.extinguish){delete t.burning;delete t.extinguishableBurning}else b.ignoreVisibilityThroughRound=g.round+1}
  else if(n==='LT025'){const r=performMove(g,rec,q.move,env);if(r.error)return r}
  else if(n==='LT028')b.firstVisitWhetstone1063={weapon:g.equipped[h].Weapon,round:g.round};
  (g.lootDiscard??=[]).push(n);if(rec.id==='L071')recover(h,1)
 }
 return {resolved:true}
}

function campaignState(g,create=true){if(g.firstVisitCampaign1063?.instance===instance(g))return g.firstVisitCampaign1063;if(!create)return null;return g.firstVisitCampaign1063={instance:instance(g),used:{},deferred:{},returns:{}}}
function campaignUsed(g,id){return !!campaignState(g,false)?.used?.[id]}
function markUsed(g,rec){if(catalog[rec.id]?.campaign&&!rec.deferred){const st=campaignState(g);st.used[rec.id]={hero:rec.target||rec.owner||rec.hero,quest:g.campaign?.currentQuest,day:g.campaign?.day,declined:!!rec.declined}}}
function serviceAvailable(g,rec){const t=g.tiles?.[rec.key],c=g.campaign||{},id=rec.id;if(!t||t.id!==id||!clear(t)||c.campaignEnded||t.locked||t.sealed||t.serviceDisabled||t.servicesSuspended||t.servicesAvailable===false||t.damaged||t.destroyed||t.functional===false||c.servicesSuspended===true||c.serviceAccess?.[id]===false||c.facilityChanges?.[id]?.disabledAll)return false;
 if(c.disabledServices?.includes?.(id)||c.damagedSites?.includes?.(id)||c.destroyedSites?.includes?.(id))return false;
 if(HUBS.has(id)&&!c.downtime&&t.hubServicesAvailable!==true&&c.hubServicesAvailable!==true&&c.serviceAccess?.[id]!==true)return false;
 if((id==='L088'||id==='L129')&&c.downtime!==true)return false;
 const faction=factions[id],score=Number(c.factionReputation3342?.[faction]||0);
 if(faction&&score<=-3||id==='L129'&&score<1)return false;
 if(c.tradeDisabled===true||c.commercePermitted===false||t.tradeDisabled===true||t.commercePermitted===false){if(['L047','L065','L073','L075','L089','L093','L127','L130','L131','L164','L165','L166','L167','L201','L202','L205'].includes(id))return false}
 if(id==='L073'&&score<1&&t.tradingPermitted!==true&&c.serviceAccess?.[id]!==true)return false;
 for(const [field,ids] of Object.entries(crisisSites))if(ids.includes(id)&&Array.isArray(c[field])&&!c[field].includes(id))return false;
 if(['L089','L090','L093'].includes(id)&&c.c3SavedFacilities?.[id]===false)return false;
 if(id==='L047'&&(!merchant()?.access(g,rec.hero||here(g,rec.key)[0])||c.currentQuest==='Q001'&&t.tradingPermitted===false))return false;
 return true
}
const commonDef=(id,kind='loot')=>{const d=merchant()?.definition(id,kind);return d?.rarity==='Common'&&!d.quest?d:null};
const listed=d=>Number(String(d?.value??0).match(/\d+/)?.[0]||0);
function stockArrays(g,rec,kind){const t=g.tiles?.[rec.key],site=g.campaign?.merchantStock?.[rec.id]??g.merchantStock?.[rec.id]??t?.merchantStock;const explicit=Array.isArray(site)?site:Array.isArray(site?.[kind])?site[kind]:null;
 if(explicit)return [explicit];
 const active=g.activeMerchant;if(active?.locationKey===rec.key&&active.closed)return [];
 if(active?.locationKey===rec.key&&Array.isArray(active.stock))return [active.stock];
 const ret=campaignState(g,false)?.returns?.[rec.id]?.[kind],supply=kind==='equipment'?g.equipmentDecks?.Common:g.lootDeck;
 return [ret,supply].filter(Array.isArray)
}
function stocked(g,rec,kind){return [...new Set(stockArrays(g,rec,kind).flatMap(a=>a.filter(x=>(typeof x==='string'||Number(x?.qty??1)>0&&!x?.sealed&&!x?.scripted&&!x?.fixed)).map(lootId)))].filter(id=>commonDef(id,kind))}
function takeStock(g,rec,kind,id){for(const arr of stockArrays(g,rec,kind)){const i=arr.findIndex(x=>lootId(x)===id&&(typeof x==='string'||Number(x.qty??1)>0&&!x?.sealed&&!x?.scripted&&!x?.fixed));if(i<0)continue;const x=arr[i];if(typeof x==='object'&&Number(x.qty)>1)x.qty--;else arr.splice(i,1);return true}return false}
function returnStock(g,rec,kind,id){const t=g.tiles?.[rec.key],site=g.campaign?.merchantStock?.[rec.id]??g.merchantStock?.[rec.id]??t?.merchantStock;
 const explicit=Array.isArray(site)?site:Array.isArray(site?.[kind])?site[kind]:null;if(explicit){explicit.push(id);return}
 if(g.activeMerchant?.locationKey===rec.key&&Array.isArray(g.activeMerchant.stock)){g.activeMerchant.stock.push(id);return}
 const rows=campaignState(g).returns[rec.id]??={loot:[],equipment:[]};rows[kind].push(id)
}
function eqCount(g,h,id){return cards(g.inventory?.[h]).filter(x=>x.kind==='equipment'&&x.id===id).reduce((n,x)=>n+Number(x.qty||0),0)+Object.values(g.equipped?.[h]||{}).flat().filter(x=>x===id).length}
function canTake(g,h,id,kind){return kind==='loot'?canCarry(g,h,id):!!commonDef(id,kind)&&eqCount(g,h,id)===0}
function addKind(g,h,id,kind){if(kind==='loot')return addLoot(g,h,id);if(!canTake(g,h,id,kind))return false;g.inventory??={};(g.inventory[h]??=[]).push({key:'equipment:'+id,kind,id,qty:1});return true}
function removeKind(g,h,id,kind){if(kind==='loot')return removeLoot(g,h,id);const rows=cards(g.inventory?.[h]),i=rows.findIndex(x=>x.kind===kind&&x.id===id&&x.qty>0&&!x.broken&&!x.quest&&!x.cursed&&!x.bound);if(i<0)return false;if(--rows[i].qty===0)rows.splice(i,1);return true}
function priceFor(g,rec,h,id,kind,off,min){const d=commonDef(id,kind),c=g.campaign||{};let cost=listed(d),marks=[];
 const key=[c.activeEvent||'NONE',c.day||0,c.currentQuest||'NONE',c.history?.length||0].join(':'),used=c.repPerks3360?.downtime?.[key]||{},scores=c.factionReputation3342||{};
 if(c.downtime){for(const [yes,mark]of [[Number(g.reputation||0)>=1,'generalFriendlyBuy'],[Number(scores.freewake||0)>=1&&Number(rec.id.slice(1))>=162&&Number(rec.id.slice(1))<=167,'freewakeFriendlyBuy'],[Number(scores.sunspireConcord||0)>=1&&Number(rec.id.slice(1))>=199,'concordFriendlyService'],[Number(scores.lanternApothecary||0)>=1&&Number(rec.id.slice(1))>=125&&Number(rec.id.slice(1))<=131&&d?.consumable,'lanternFriendlyBuy']])if(yes&&!used[mark]){cost=Math.max(0,cost-5);marks.push(mark)}}
 const active=merchant()?.offer(g,h);let travelMark=null;if(active?.freeItem&&!active.freeUsed&&kind==='loot'){cost=0;travelMark='freeUsed'}else if(active?.discount>0&&!active.discountUsed){cost=Math.max(0,cost-active.discount);travelMark='discountUsed'}
 return {price:Math.max(min,cost-off),marks,key,travelMark}
}
function applyPriceMarks(g,h,q){if(q.marks?.length){const p=g.campaign.repPerks3360??={quest:{},event:{},downtime:{}};p.downtime??={};const used=p.downtime[q.key]??={};for(const m of q.marks)used[m]=true}const active=merchant()?.offer(g,h);if(active){if(q.travelMark)active[q.travelMark]=true;if(active.onePurchase)active.closed=true}}
function serviceChoices(g,rec,h){if(!serviceAvailable(g,rec)||!live(g,h)||siteKey(g,h,rec)!==rec.key||campaignUsed(g,rec.id))return [];
 const out=[],gold=Number(g.gold||0),id=rec.id,b=status().body(g,h),st=stocked(g,rec,'loot'),eq=stocked(g,rec,'equipment'),add=(key,label,extra={})=>out.push({key,label,...extra}),can=(x,k='loot')=>stocked(g,rec,k).includes(x)&&canTake(g,h,x,k);
 const buy=(x,k,price)=>{const q=typeof price==='number'?{price}:price;if(can(x,k)&&gold>=q.price)add('buy:'+k+':'+x,'Take '+merchant().definition(x,k).name+' — '+q.price+' Gold',{type:'buy',id:x,kind:k,...q})};
 const sell=(x,price)=>{if(countItem(g,h,x)>0&&commonDef(x)&&!cards(g.inventory?.[h]).find(r=>r.id===x&&(r.quest||r.bound||r.cursed)))add('sell:'+x,'Sell '+commonDef(x).name+' for '+price+' Gold',{type:'sell',id:x,kind:'loot',price})};
 const exchange=(x,y,kind='loot')=>{const owned=cards(g.inventory?.[h]).some(r=>r.id===x&&r.kind===kind&&r.qty>0&&!r.broken&&!r.cursed&&!r.bound&&!r.quest);if(x!==y&&owned&&can(y,kind))add('exchange:'+kind+':'+x+':'+y,'Exchange '+commonDef(x,kind).name+' for '+commonDef(y,kind).name,{type:'exchange',give:x,id:y,kind})};
 const defer=(who=h)=>add('defer','Record benefit for the immediately next Quest',{type:'defer',hero:who});
 const grantGold=n=>add('gold','Gain '+n+' Party Gold',{type:'gold',amount:n});
 const cleanse=(names,cost,all=false)=>{const have=names.filter(x=>flag(b,x));if(gold<cost||!have.length)return;if(all)add('cleanse:all','Remove '+have.join(' and ')+' — '+cost+' Gold',{type:'cleanse',statuses:have,price:cost});else for(const x of have)add('cleanse:'+x,'Remove '+x+' — '+cost+' Gold',{type:'cleanse',statuses:[x],price:cost})};
 switch(id){
 case'L047':for(const r of cards(g.inventory?.[h])){const d=r.kind==='loot'&&commonDef(r.id);if(d?.consumable)for(const y of st){const q=commonDef(y);if(q.consumable&&listed(q)<=listed(d))exchange(r.id,y)}}break;
 case'L051':case'L125':case'L200':grantGold(10);break;
 case'L065':for(const x of st.filter(x=>commonDef(x).consumable))buy(x,'loot',priceFor(g,rec,h,x,'loot',5,5));break;
 case'L067':case'L166':case'L199':buy('LT004','loot',0);break;
 case'L068':case'L128':case'L163':defer();break;
 case'L073':for(const x of eq.filter(x=>commonDef(x,'equipment').slot==='Armor'))buy(x,'equipment',priceFor(g,rec,h,x,'equipment',10,5));break;
 case'L075':sell('LT038',10);sell('LT031',5);break;
 case'L088':case'L129':for(const q of crafting()?.firstVisitRecipes?.(g,h,id)||[])add('craft:'+q.recipeId,'Craft '+q.resultName+' — '+q.goldSpent+' Gold',{type:'craft',recipeId:q.recipeId});break;
 case'L089':if(countItem(g,h,'LT031')&&countItem(g,h,'LT034')&&can('LT038'))add('smelt','Exchange Iron Ore and Coal for Refined Iron',{type:'smelt'});break;
 case'L091':buy('LT012','loot',0);break;
 case'L093':buy('LT001','loot',10);break;
 case'L126':if(gold>=5)add('defer','Pay 5 Gold; this Hero draws next Quest',{type:'defer',hero:h,price:5});break;
 case'L127':buy('LT005','loot',10);buy('LT006','loot',10);break;
 case'L130':sell('LT055',15);sell('LT056',15);break;
 case'L131':case'L202':exchange('LT004','LT012');exchange('LT012','LT004');break;
 case'L162':grantGold(5);buy('LT012','loot',0);break;
 case'L164':for(const r of cards(g.inventory?.[h])){const d=r.kind==='equipment'&&commonDef(r.id,'equipment');if(d?.slot==='Weapon')for(const y of eq){const q=commonDef(y,'equipment');if(q.slot==='Weapon'&&listed(q)<=listed(d))exchange(r.id,y,'equipment')}}break;
 case'L165':case'L205':if(gold>=5)add('gamble','Pay 5 Gold and roll 1d6',{type:'gamble',price:5});break;
 case'L167':if(gold>=15&&can('LT004')&&can('LT012'))add('bundle','Bandage Roll + Traveler’s Rations — 15 Gold',{type:'bundle',price:15});break;
 case'L201':for(const x of ['LT004','LT006'])buy(x,'loot',priceFor(g,rec,h,x,'loot',5,0));break;
 case'L203':cleanse(['Cracked Armor','Corroded'],10,true);break;
 case'L204':cleanse(['Cursed','Hexed'],10);break;
 case'L206':cleanse(['Crippled','Slowed'],5);break;
 }
 return out.sort((a,b)=>a.label.localeCompare(b.label))
}
function applyService(g,rec,h,q,env){const s=campaignState(g),pay=n=>{g.gold=Number(g.gold||0)-Number(n||0)};
 switch(q.type){
 case'gold':g.gold=Number(g.gold||0)+q.amount;break;
 case'buy':if(!takeStock(g,rec,q.kind,q.id)||!addKind(g,h,q.id,q.kind))return {error:'Stock changed.'};pay(q.price);if(q.price>0||q.travelMark)applyPriceMarks(g,h,q);break;
 case'sell':if(!removeKind(g,h,q.id,q.kind))return {error:'Inventory changed.'};returnStock(g,rec,q.kind,q.id);g.gold=Number(g.gold||0)+q.price;break;
 case'exchange':if(!removeKind(g,h,q.give,q.kind)||!takeStock(g,rec,q.kind,q.id)||!addKind(g,h,q.id,q.kind))return {error:'Exchange is no longer legal.'};returnStock(g,rec,q.kind,q.give);break;
 case'smelt':if(!removeLoot(g,h,'LT031')||!removeLoot(g,h,'LT034')||!takeStock(g,rec,'loot','LT038')||!addLoot(g,h,'LT038'))return {error:'Smelting stock or materials changed.'};returnStock(g,rec,'loot','LT031');returnStock(g,rec,'loot','LT034');break;
 case'bundle':if(!takeStock(g,rec,'loot','LT004')||!takeStock(g,rec,'loot','LT012')||!addLoot(g,h,'LT004')||!addLoot(g,h,'LT012'))return {error:'Bundle unavailable.'};pay(15);break;
 case'gamble':{pay(5);const die=1+Math.floor(rand(env)()*6),gain=rec.id==='L165'?die>=6?15:die>=3?10:0:die>=4?10:0;g.gold+=gain;log(g,'FIRST VISIT: rolled '+die+'; gained '+gain+' Gold.');break}
 case'cleanse':pay(q.price);for(const x of q.statuses)status().remove(status().body(g,h),x);break;
 case'defer':pay(q.price);s.deferred[rec.id]={hero:q.hero,acceptedScope:scope(g),state:'pending'};break;
 case'craft':{const result=crafting()?.firstVisitCraft?.(g,h,q.recipeId,rec.id);if(!result||result.error)return {error:result?.error||'Crafting is no longer legal.'};break}
 default:return {error:'Unknown service.'}
 }return {resolved:true}
}
function setupDeferred(before,g,env={}){const old=campaignState(before,false);if(!old||instance(before)!==instance(g))return false;g.firstVisitCampaign1063=clone(old);const st=campaignState(g),all=store(g).entries;let changed=false;
 for(const [id,v]of Object.entries(st.deferred||{})){if(v.state!=='pending'||v.acceptedScope===scope(g))continue;v.state='consumed';v.resolvedScope=scope(g);changed=true;
 const selected=live(g,v.hero)?v.hero:null,h=selected||(g.partyHeroes||[]).find(x=>live(g,x));if(!h)continue;
 if(id==='L126'){if(selected)healRules().draw(g,selected,1,{random:env.random});continue}
 let deck,kind;if(id==='L068'&&selected){deck=z(g,selected)?.deck;kind='deferredHero'}else if(id==='L128'&&canInspect(g,'P')){deck=g.pool;kind='deferredPool'}else if(id==='L163'&&canInspect(g,'E')&&encounterRules()?.campaign(g)===5&&cards(g.encDeck).every(c=>encounterRules().cardCampaign(c)===5)){deck=g.encDeck;kind='deferredEnc'}else continue;
 if(!cards(deck).length)continue;const n=Math.min(kind==='deferredEnc'?2:3,deck.length),list=deck.slice(0,n);
 const rec={id,key:keyOf(g,h),hero:h,owner:h,target:h,deferred:true,stage:'steps',round:1,starting:true,steps:['kDeferred'],pending:{kind,count:n,order:true,options:list.map(cardLabel),...(kind==='deferredEnc'?{allowBottom:true}:{}),}};all[id]=rec;
 }return changed
}

const EQUIPMENT_STATUS_GRANTS={"EQ084":["Hidden"],"EQ108":["Hidden"],"EQ118":["Hidden"]};
const commonMaterials=new Set(["LT015","LT021","LT023","LT024","LT025","LT028","LT031","LT032","LT033","LT034","LT038","LT041","LT042","LT047","LT048","LT049","LT052","LT053","LT055","LT056","LT057","LT071","LT072","LT073","LT075","LT077","LT079","LT080"]),rangedWeapons=new Set(["EQ045","EQ046","EQ047","EQ048","EQ049","EQ050","EQ051","EQ052","EQ053","EQ054","EQ055","EQ056","EQ057","EQ058","EQ059","EQ060","EQ069","EQ070","EQ071","EQ072","EQ073","EQ074","EQ075","EQ076","EQ113","EQ114","EQ116","EQ120"]);
const lootId=c=>typeof c==='string'?c:c?.id;
const countItem=(g,h,id)=>cards(g.inventory?.[h]).filter(x=>x.kind==='loot'&&x.id===id).reduce((n,x)=>n+Number(x.qty||0),0);
function canCarry(g,h,id){const d=merchant().definition(id,'loot');return !!d&&!d.quest&&countItem(g,h,id)<Number(d.stack||1)}
function addLoot(g,h,id){if(!canCarry(g,h,id))return false;g.inventory??={};const rows=g.inventory[h]??=[],x=rows.find(x=>x.kind==='loot'&&x.id===id);if(x)x.qty++;else rows.push({key:'loot:'+id,kind:'loot',id,qty:1});return true}
function removeLoot(g,h,id){const rows=cards(g.inventory?.[h]),i=rows.findIndex(x=>x.kind==='loot'&&x.id===id&&x.qty>0);if(i<0)return false;if(--rows[i].qty===0)rows.splice(i,1);return true}
function legalNeighbor(g,h,key){const dest=healRules().neighbors(g,h).find(q=>q.key===key),from=g.tiles?.[keyOf(g,h)];if(!dest||!from)return false;const to=dest.t;
 // A normal open connection is required; do not use a blocked or sealed route.
 if(from.id==='L029'&&gateNeeded(from)||[from,to].some(t=>t.locked||t.gateLocked||t.blockedPassage&&!t.passageCleared||t.sealed||t.revealed===false))return false;
 const a=keyOf(g,h),b=key;return ![a+'>'+b,b+'>'+a,a+'|'+b,b+'|'+a].some(k=>g.blockedConnections?.[k]||g.campaign?.blockedConnections?.[k])}
function adjacentHeroes(g,actor,rec){return (g.partyHeroes||[]).filter(h=>h!==actor&&live(g,h)&&legalNeighbor(g,actor,keyOf(g,h)))}
function transferOptions(g,h,materials){if(!clear(g.tiles?.[keyOf(g,h)]))return [];const items=cards(g.inventory?.[h]).filter(x=>{const d=x.kind==='loot'&&merchant().definition(x.id,'loot');return x.qty>0&&d?.rarity==='Common'&&!d.quest&&(d.consumable||materials&&commonMaterials.has(x.id))});const out=[];
 for(const target of adjacentHeroes(g,h,{})){if(!clear(g.tiles?.[keyOf(g,target)]))continue;for(const x of items)if(canCarry(g,target,x.id))out.push({target,id:x.id,label:merchant().definition(x.id,'loot').name+' → '+target})}return out}
function namedCards(g,h){const zz=z(g,h)||{};return [...new Set([...cards(zz.deck),...cards(zz.hand),...cards(zz.discard)].map(cardLabel))].sort((a,b)=>a.localeCompare(b))}
function exactLootSource(g,v){const [src,id]=v.split(':');if(src==='L'&&(g.fixedLootDeck||g.sealedLootDeck||g.scriptedLootDeck))return null;const deck=src==='L'?g.lootDeck:src==='D'?g.lootDiscard:null;return Array.isArray(deck)?{deck,id,src}:null}
function remoteRecipient(g,rec,actor,target){if(rec.id==='L074')return keyOf(g,target)===rec.key||legalNeighbor(g,actor,keyOf(g,target))&&/urban/i.test([g.tiles?.[keyOf(g,target)]?.terrain,...(g.tiles?.[keyOf(g,target)]?.traits||[])].join(' '));if(rec.id==='L179')return target!==actor&&legalNeighbor(g,actor,keyOf(g,target));return false}
function selectedTargetLegal(g,rec){return live(g,rec.target)&&(rec.remoteTarget?keyOf(g,rec.owner)===rec.key&&remoteRecipient(g,rec,rec.owner,rec.target):siteKey(g,rec.target,rec)===rec.key)}
function searchPermitted(g,rec){const t=g.tiles?.[rec.key];return !!t&&clear(t)&&Number(t.searchLimit||0)>Number(t.searchCount||0)&&!t.noSearch&&!t.searchBlocked&&!t.locked&&!t.sealed}

const live=(g,h)=>(g?.partyHeroes||[]).includes(h)&&Number(status().body(g,h)?.hp)>0;
const keyOf=(g,h)=>{const p=status().position(g,h);return p?String(p.x)+','+String(p.y):null};
const here=(g,k)=>(g?.partyHeroes||[]).filter(h=>live(g,h)&&keyOf(g,h)===k);
const clear=t=>!!t&&!(t.enemies||[]).some(e=>Number(e.hp)>0);
const scope=g=>resource().scope(g);
const terminal=g=>!g?.campaign?.currentQuest||g.campaign.campaignEnded||resource().terminal(g);
function store(g){const id=scope(g);if(g.firstVisit1061?.scope!==id)g.firstVisit1061={scope:id,entries:{}};return g.firstVisit1061}
function rows(g){return g?.firstVisit1061?.scope===scope(g)?g.firstVisit1061.entries||{}:{}}
function entry(g,k,h,{waiting=false,starting=false,roomEntry=false}={}){
 const t=g?.tiles?.[k],f=catalog[t?.id];
 if(!f?.title||!plans[t.id]||g.campaign?.campaignEnded||(!f.campaign&&terminal(g))||f.campaign&&campaignUsed(g,f.id)||!clear(t)||!live(g,h)||(!roomEntry&&keyOf(g,h)!==k&&!(f.campaign&&g.campaign?.downtime&&k==='0,0')))return false;
 // A legacy save with visited=true must never retroactively award a new benefit.
 if(t.visited&&!starting&&!f.campaign)return false;
 const all=store(g).entries;if(all[t.id]&&!(f.campaign&&all[t.id].stage==='expired'))return false;
 all[t.id]={id:t.id,key:k,hero:h,stage:waiting?'waiting':'ready',round:Number(g.round||1),starting:!!starting,arrived:keyOf(g,h)===k};return true
}
function finish(g,k){const t=g?.tiles?.[k],row=rows(g)[t?.id];if(row?.stage==='waiting'){row.stage='ready';return true}return false}
function seed(g){if(!g||terminal(g)||Number(g.round)!==1)return false;const k='0,0',h=here(g,k)[0];return h?entry(g,k,h,{starting:true}):false}
function log(g,text){g.adventureLog??=[];g.adventureLog.unshift(text);if(g.adventureLog.length>1000)g.adventureLog.length=1000}
function z(g,h){return resource().zones(g,h)}
function cards(a){return Array.isArray(a)?a:[]}
const cardLabel=c=>String(c?.name||c?.Name||c?.title||c?.id||c||'Hero card');
const handCount=(g,h)=>cards(z(g,h)?.hand).length;
const drawCount=(g,h)=>cards(z(g,h)?.deck).length+cards(z(g,h)?.discard).length;
const flag=(u,n)=>status().has(u,n);
const split=s=>s.split('/');
function duration(s){return s==='r'||s==='rl'?'Until end of round.':'Until the end of your next turn.'}
function grant(g,h,token,rec,env){
 const [n,d]=token.split('@'),b=status().body(g,h),was=flag(b,n),a=status().application(b,n,{random:env.random});
 if(!a.allowed)return false;
 if(!was)healRules().grant(g,h,n,{actor:rec.owner,random:env.random},rec.owner);
 if(!flag(b,n))return false;
 const source='FirstVisit1061:'+scope(g)+':'+rec.id;
 status().recordTemporaryApplication(b,n,{source,wasPresent:was,round:g.round,duration:d==='d'?status().definitions.byName[n].Duration:duration(d)});
 if(d==='l'||d==='rl'){
  const meta=b.statusDurations33628?.[n];for(const s of meta?.sources||[])if(s.source===source)s.firstVisitLocation1061=rec.key;
 }
 return true
}
// Expire only the temporary source, preserving unrelated permanent grants.
function expireLocation(g){let changed=false;for(const h of g?.partyHeroes||[]){const b=status().body(g,h);for(const [n,m] of Object.entries(b?.statusDurations33628||{})){if(!Array.isArray(m.sources))continue;const remain=m.sources.filter(s=>!s.firstVisitLocation1061||live(g,h)&&keyOf(g,h)===s.firstVisitLocation1061);if(remain.length===m.sources.length)continue;changed=true;if(remain.length)b.statusDurations33628[n]={...remain[remain.length-1],sources:remain};else status().remove(b,n)}}return changed}
function reconcile(g){
 if(!g)return false;let changed=expireLocation(g);if(g.campaign?.downtime&&catalog[g.tiles?.['0,0']?.id]?.campaign){const h=(g.partyHeroes||[]).find(h=>live(g,h));if(h&&entry(g,'0,0',h,{starting:true}))changed=true}
 const rs=rows(g);for(const rec of Object.values(rs)){
  if(['used','expired'].includes(rec.stage))continue;
  if((terminal(g)&&!catalog[rec.id]?.campaign)||g.campaign?.campaignEnded||rec.deferred&&(terminal(g)||Number(g.round)!==1)){rec.stage='expired';delete rec.steps;changed=true;continue}
  if(rec.deferred)continue;
  if(catalog[rec.id]?.campaign&&rec.stage==='ready'&&!siteHere(g,rec).length&&rec.arrived){rec.stage='expired';changed=true;continue}
  if(rec.stage==='reserved'&&(!live(g,rec.target)||keyOf(g,rec.target)!==rec.key||Number(g.round)>Number(rec.reserveRound)+1)){rec.stage='expired';changed=true}
  if(keyOf(g,rec.hero)===rec.key&&!rec.arrived){rec.arrived=true;changed=true} if(rec.stage==='ready'&&catalog[rec.id].timing==='arrival'&&!rec.starting&&(!live(g,rec.hero)||(rec.arrived||Number(g.round||1)>rec.round)&&keyOf(g,rec.hero)!==rec.key)){rec.stage='expired';changed=true} if(rec.stage==='steps'&&!selectedTargetLegal(g,rec)){rec.stage='expired';delete rec.steps;delete rec.pending;changed=true}
 }
 return changed
}
function expireReserved(g,h){for(const row of Object.values(rows(g)))if(row.stage==='reserved'&&row.target===h&&Number(g.round)>Number(row.reserveRound)){row.stage='expired';delete row.steps}}
function preserve(before,next){if(!before||!next)return;if(instance(before)===instance(next)&&campaignState(before,false))next.firstVisitCampaign1063=clone(before.firstVisitCampaign1063);else delete next.firstVisitCampaign1063;if(scope(before)===scope(next)&&before.firstVisit1061?.scope===scope(before))next.firstVisit1061=clone(before.firstVisit1061);else delete next.firstVisit1061}
function ready(g,rec){
 if(!rec)return false;if(rec.deferred)return !terminal(g)&&Number(g.round)===1&&live(g,rec.owner)&&rec.stage==='steps';
 if(!plans[rec.id]||!g.tiles?.[rec.key]||g.tiles[rec.key].id!==rec.id)return false;
 const f=catalog[rec.id];if(f.campaign){if(campaignUsed(g,rec.id)||!serviceAvailable(g,rec))return false}else if(terminal(g))return false;
 if(f.timing==='clear'&&!clear(g.tiles[rec.key]))return false;
 if(gateNeeded(g.tiles[rec.key]))return false;
 return rec.starting||f.timing==='clear'?siteHere(g,rec).length>0:live(g,rec.hero)&&keyOf(g,rec.hero)===rec.key
}
function recipient(g,rec,opt,actor,target){
 if(!live(g,actor)||!live(g,target)||(opt.target==='j'?!remoteRecipient(g,rec,actor,target):siteKey(g,target,rec)!==rec.key))return false;
 const f=catalog[rec.id];
 // Arrival actor owns the choice; Once clear can be settled by a living Hero here.
 if(rec.stage==='reserved'||rec.stage==='steps')return actor===rec.owner&&target===rec.target;
 if(rec.id==='L179'&&opt.target!=='j'&&adjacentHeroes(g,actor,rec).length)return false;
 if(rec.id==='L070'&&!clear(g.tiles?.[rec.key]))return false;
 if(f.timing==='arrival'&&!rec.starting&&actor!==rec.hero)return false;
 if(f.timing==='clear'&&siteKey(g,actor,rec)!==rec.key)return false;
 if(opt.target==='s'&&target!==(rec.starting?actor:rec.hero))return false;
 if(opt.steps.some(x=>x.startsWith('a'))&&target!==actor)return false;
 const present=siteHere(g,rec);
 if(opt.target==='o'&&target===actor)return false;
 if(opt.target==='l'&&(target!==actor||present.some(h=>h!==actor)))return false;
 if(opt.target==='f'&&(target===actor||handCount(g,target)>=handCount(g,actor)))return false;
 if(opt.target==='z'&&(target!==actor||present.some(h=>h!==actor&&handCount(g,h)<handCount(g,actor))))return false;
 return true
}
function canInspect(g,kind){
 const d=kind==='K'||kind==='E'?g.encDeck:['P','T'].includes(kind)?g.pool:g.searchDeck;
 if(!Array.isArray(d)||!d.length)return false;
 // Never expose explicitly fixed, scripted, sealed cards or a suppressed stack.
 if((kind==='K'||kind==='E')&&g.campaign?.activeEvent==='WE008')return false;
 if(['P','T'].includes(kind)&&(g.fixedExplorationDeck||g.sealedExplorationDeck||g.scriptedExplorationDeck))return false;
 if(['S','Q'].includes(kind)&&(g.fixedSearchDeck||g.sealedSearchDeck||g.scriptedSearchDeck))return false;
 return !d.some(c=>c?.sealed||c?.scripted||c?.fixed===true||c?.fixedSeverity!=null&&c.fixedSeverity!==''||c?.fixedOrder===true)&&!g.fixedEncounterDeck&&!g.sealedEncounterDeck&&!g.scriptedEncounterDeck
}
function label(s){const c=s[0],v=s.slice(1);switch(c){case'i':return 'Choose a printed effect';case'k':return 'Choose a printed service';case'A':return 'Transfer eligible '+(v==='1'?'Consumable or Crafting Material':'Consumable')+' to an adjacent Hero';case'Y':return 'Take '+v.split(':')[1]+' from '+(v[0]==='L'?'Loot deck':'Loot discard');case'W':return 'Name a Hero card before revealing the top card';case'e':return 'Remove '+v.replaceAll('/',' or ')+' if present';case'd':return 'Draw '+v+' Hero card(s)';case'x':case'X':return (c==='X'?'Entering Hero discards ':'Discard ')+v+' Hero card(s)';case'b':return 'Put '+v+' hand card(s) on bottom';case't':return 'Put '+v+' hand card(s) on top';case'r':return 'Remove '+v.replaceAll('/',' or ');case'R':return 'Remove '+v.replaceAll('/',' and ');case'o':return 'Optionally remove '+v.replaceAll('/',' or ');case'j':return 'Remove '+v+' if present';case'g':case'c':return 'Gain '+v.split('@')[0];case'h':return 'Recover '+v+' Health';case'p':return 'Pay '+v+' Gold';case'G':return 'Gain '+v+' Gold';case'a':return 'Spend '+v+' Action';case'u':case'U':return v.startsWith('?')?'Must have at least 2 Health':(c==='U'?'Entering Hero pays ':'Pay ')+v+' Health';case'S':return 'Inspect top Search cards without moving them';case'Q':return 'Inspect and reorder top Search cards';case'P':return 'Inspect top Exploration cards, discard one and reorder remaining';case'T':return 'Inspect top Exploration cards and keep or move to bottom';case'J':return 'Inspect top Hero card and choose top or bottom';case'I':return 'Inspect/reorder up to '+v+' Hero cards';case'K':return 'Inspect '+v+' Encounter card(s) without moving them';case'F':return 'Put a card from discard on top of Hero deck';case'V':return 'Return a card from discard to hand';case'Z':return 'Roll 1d6 for the printed result';case'q':return 'Cycle up to '+v+' hand cards through bottom of deck';case'w':return 'Discard up to '+v+' then draw that many';case'y':return 'Discard up to '+v+' to recover that much Health';case'v':return 'Choose a card from discard, discard '+v+' from hand, recover chosen card';case'D':return 'Inspect top '+v+', discard any, reorder rest';case'N':case'n':return 'Inspect top '+v+', '+(c==='n'?'optionally ':'')+'move one to bottom, reorder rest';case'M':return 'Take one of top '+v+', rest to bottom';case'O':return 'Inspect bottom '+v+', one to top, reorder rest';case'm':return 'Shuffle 1–'+v+' chosen discard cards into deck';case'H':return 'A second Hero here recovers '+v+' Health';case'C':return 'Entering Hero removes '+v;case'B':return 'Entering Hero puts one discard card on bottom';case'!':return 'Must not already have '+v;default:return s}}
function available(g,rec,opt,h,env={}){
 const actor=env.actor||rec.owner||rec.hero,b=status().body(g,h),payer=status().body(g,actor),zs=z(g,h)||{},za=z(g,actor)||{},actions=Number(b?.actions||0)-Number(b?.attackOnlyActions||0);
 let hand=cards(zs.hand).length,deck=cards(zs.deck).length,discard=cards(zs.discard).length,gold=Number(g.gold||0),hp=Number(b?.hp||0),actorHand=cards(za.hand).length,actorDiscard=cards(za.discard).length;
 if(!live(g,h)||!live(g,actor))return false;
 if(rec.id==='L072'&&!searchPermitted(g,rec))return false;
 if(rec.id==='L090'&&opt.steps[0].startsWith('g')&&!facilityOK(g,rec))return false;
 if(rec.id==='L090'&&opt.steps[0].startsWith('b')&&!canHeal(g,h))return false;
 if(rec.id==='L178'&&(encounterRules()?.campaign(g)!==5||!cards(g.encDeck).every(c=>encounterRules().cardCampaign(c)===5)))return false;
 for(const step of opt.steps){
  const c=step[0],v=step.slice(1),n=Number(v);
  if(c==='d'){if(deck+discard<n)return false;if(deck<n){deck+=discard;discard=0}deck-=n;hand+=n}
  else if(['x','b','t'].includes(c)){if(hand<n)return false;hand-=n;if(c==='x')discard+=n;else deck+=n}
  else if(c==='X'){if(actor===h){if(hand<n)return false;hand-=n;discard+=n}else{if(actorHand<n)return false;actorHand-=n;actorDiscard+=n}}
  else if(c==='h'){const max=status().maxHp(g,h);if(hp>=max&&opt.steps.length===1||b.noHealUntilTurnEnd||b.noHealUntilRound===g.round)return false}
  else if(c==='p'){if(gold<n)return false;gold-=n}
  else if(c==='u'||c==='U'){if(v.startsWith('?')){if(hp<=Number(v.slice(1)))return false}else if(c==='U'){if(Number(payer.hp)<=n)return false}else{if(hp<=n)return false;hp-=n}}
  else if(c==='r'||c==='R'){if(!split(v).some(n=>flag(b,n)))return false}
  else if(c==='C'){if(!flag(payer,v))return false}
  else if(c==='!'){if(flag(b,v))return false}
  else if(c==='a'){if(status().actionError(b))return false;if(!env.allowReservation&&((env.requireActive&&env.turnHero!==h)||(env.turnHero&&env.turnHero!==h)||actions<n))return false}
  else if(['I','J','D','N','n','M','O'].includes(c)&&deck<1||['K','E','P','T','S','Q'].includes(c)&&!canInspect(g,c))return false;
  else if(c==='q'||c==='w'||c==='y'){if(hand<1)return false}
  else if(c==='v'){if(discard<1||hand<n)return false}
  else if(c==='F'||c==='V'||c==='m'){if(discard<1)return false;if(c==='V'){discard--;hand++}else if(c==='F'){discard--;deck++}else{deck+=Math.min(n,discard);discard-=Math.min(n,discard)}}
  else if(c==='B'){if(actorDiscard<1)return false}
  else if(c==='H'){if(!here(g,rec.key).some(x=>x!==h))return false}
  else if(c==='g'||c==='c'){if(!status().definitions.byName[v.split('@')[0]]||c==='c'&&flag(b,v.split('@')[0]))return false;if(rec.id==='L143'&&v.startsWith('Elevated@')&&!rangedWeapons.has(g.equipped?.[h]?.Weapon))return false}
  else if(c==='i'){if(!ordinaryChoices(g,rec,h,env).length)return false}
  else if(c==='k'){if(!serviceChoices(g,rec,h).length)return false}
  else if(c==='A'){if(!transferOptions(g,h,v==='1').length)return false}
  else if(c==='Y'){const q=exactLootSource(g,v);if(!q||!q.deck.some(x=>lootId(x)===q.id&&(typeof x==='string'||(!x?.sealed&&!x?.fixed&&!x?.scripted)))||!canCarry(g,h,q.id))return false}
  else if(c==='W'){if(!deck||!namedCards(g,h).length)return false}
  else if(c==='S'){if(!searchPermitted(g,rec)||!canInspect(g,c))return false}
  else if(!['d','x','b','t','X','h','p','u','U','r','R','o','j','C','!','a','I','J','K','E','P','T','S','Q','F','V','g','c','G','Z','q','w','y','v','D','N','n','M','O','m','B','H','A','Y','W','e'].includes(c))return false;
 }
 return true
}
function offers(g,actor,env={}){
 reconcile(g);const out=[];
 for(const rec of Object.values(rows(g))){
  if(!['ready','reserved','steps'].includes(rec.stage)||!ready(g,rec))continue;
  if(rec.stage==='steps'||rec.stage==='reserved'){if(rec.owner===actor)out.push({id:rec.id,key:rec.key,stage:rec.stage,target:rec.target,title:catalog[rec.id].title,pending:clone(rec.pending),option:rec.option,description:catalog[rec.id].description});continue}
  const options=[];plans[rec.id].forEach((opt,index)=>{for(const target of (opt.target==='j'?g.partyHeroes||[]:siteHere(g,rec))){if(!recipient(g,rec,opt,actor,target)||!available(g,rec,opt,target,{...env,actor,allowReservation:true}))continue;options.push({index,target,label:opt.steps.map(label).join(' · ')})}});
  if(catalog[rec.id]?.campaign&&!options.length)continue;
  if((catalog[rec.id].timing==='arrival'&&(rec.hero===actor||rec.starting&&here(g,rec.key).includes(actor)))||catalog[rec.id].timing==='clear'&&siteHere(g,rec).includes(actor))out.push({id:rec.id,key:rec.key,stage:'ready',title:catalog[rec.id].title,description:catalog[rec.id].description,options})
 }
 return out
}
function promptFor(rec,kind,options,extra={}){rec.pending={kind,options,...extra};return {pending:clone(rec.pending)}}
const rand=env=>env.random||Math.random;
function shuffled(a,env){for(let i=a.length-1;i>0;i--){const j=Math.floor(rand(env)()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function advance(g,rec,env={}){
 const h=rec.target,b=status().body(g,h),zs=z(g,h)||{},owner=rec.owner,za=z(g,owner)||{};
 while(rec.steps.length){
  const step=rec.steps[0],c=step[0],v=step.slice(1),n=Number(v);
  if(['x','b','t','X'].includes(c))return promptFor(rec,c,cards(c==='X'?za.hand:zs.hand).map(cardLabel),{count:n});
  if(c==='F'||c==='V'||c==='B'){
   if(c==='V'&&(v==='rand'||v==='top')){const i=v==='rand'?Math.floor(rand(env)()*zs.discard.length):zs.discard.length-1;if(i>=0)zs.hand.push(zs.discard.splice(i,1)[0])}
   else if(v==='chosen'){const i=rec.discardIndex;if(zs.discard[i]===undefined)return {error:'The reserved discard card is no longer present.'};zs.hand.push(zs.discard.splice(i,1)[0]);delete rec.discardIndex}
   else return promptFor(rec,c,cards(c==='B'?za.discard:zs.discard).map(cardLabel),{count:1})
  }
  if(c==='v')return promptFor(rec,'v',cards(zs.discard).map(cardLabel),{count:1,cost:n});
  if(['q','w','y'].includes(c))return promptFor(rec,c,cards(zs.hand).map(cardLabel),{min:0,max:Math.min(n,zs.hand.length)});
  if(c==='m')return promptFor(rec,c,cards(zs.discard).map(cardLabel),{min:1,max:Math.min(n,zs.discard.length)});
  if(['I','D','N','n','M','O'].includes(c)){const list=c==='O'?cards(zs.deck).slice(-n):cards(zs.deck).slice(0,n);if(list.length)return promptFor(rec,c,list.map(cardLabel),c==='D'?{min:0,max:list.length,order:true}:{count:c==='M'?1:list.length,order:c!=='M',...(c==='n'?{allowBottom:true}:{})})}
  if(['P','T','S','Q'].includes(c)){const deck=['P','T'].includes(c)?g.pool:g.searchDeck,list=deck.slice(0,n);if(c==='S')return promptFor(rec,c,list.map(cardLabel),{count:0});if(c==='T')return promptFor(rec,c,['Keep on top: '+list.map(cardLabel).join(' / '),'Move to bottom: '+list.map(cardLabel).join(' / ')],{count:1,length:list.length});if(c==='P')return promptFor(rec,c,list.map(cardLabel),{count:list.length,order:true});return promptFor(rec,c,list.map(cardLabel),{count:list.length,order:true})}
  if(c==='i'){const list=ordinaryChoices(g,rec,h,env);if(!list.length)return {error:'No eligible choice remains.'};return promptFor(rec,c,list.map(q=>q.label),{count:1,choices:list.map(q=>q.key)})}
  if(c==='k'){const list=serviceChoices(g,rec,h);if(!list.length)return {error:'No eligible service remains.'};return promptFor(rec,c,list.map(x=>x.label),{count:1,choices:list.map(x=>x.key)})}
  if(c==='A'){const list=transferOptions(g,h,v==='1');return promptFor(rec,c,list.map(x=>x.label),{count:1,choices:list})}
  if(c==='Y'){const q=exactLootSource(g,v),i=q?.deck.findIndex(x=>lootId(x)===q.id&&(typeof x==='string'||(!x?.sealed&&!x?.fixed&&!x?.scripted)));if(!q||i<0||!canCarry(g,h,q.id))return {error:'The exact Loot copy is no longer available.'};q.deck.splice(i,1);if(q.src==='L')shuffled(q.deck,env);addLoot(g,h,q.id)}
  if(c==='W')return promptFor(rec,c,namedCards(g,h),{count:1});
  if(c==='e'){const list=split(v).filter(n=>flag(b,n));if(list.length>1)return promptFor(rec,c,list,{count:1});if(list.length)status().remove(b,list[0])}
  if(c==='J'){return promptFor(rec,'J',['Keep '+cardLabel(zs.deck[0])+' on top','Move '+cardLabel(zs.deck[0])+' to bottom'],{count:1})}
  if(c==='K'||c==='E'){const list=cards(g.encDeck).slice(0,n);if(list.length)return promptFor(rec,c,list.map(cardLabel),{count:c==='K'?0:list.length,order:c==='E'})}
  if(c==='H'){const list=here(g,rec.key).filter(x=>x!==h);return promptFor(rec,'H',list,{count:1,amount:n})}
  if(c==='r'||c==='o'){const list=split(v).filter(n=>flag(b,n));if(list.length>1)return promptFor(rec,c,list,{count:1,optional:c==='o'});if(list.length===1){if(c==='o')return promptFor(rec,c,list,{count:1,optional:true});status().remove(b,list[0]);}}
  if(c==='j')status().remove(b,v);
  if(c==='R')for(const x of split(v))status().remove(b,x);
  if(c==='C')status().remove(status().body(g,owner),v);
  if(c==='d')healRules().draw(g,h,n,{random:env.random});
  if(c==='h')healRules().heal(g,h,n,{random:env.random},owner);
  if(c==='p')g.gold=Number(g.gold||0)-n;
  if(c==='G')g.gold=Number(g.gold||0)+n;
  if(c==='a'&&!(rec.id==='L219'&&rec.steps[1]?.startsWith('i')))b.actions=Number(b.actions||0)-n;
  if(c==='u'&&!v.startsWith('?'))b.hp=Number(b.hp)-n;
  if(c==='U')status().body(g,owner).hp-=n;
  if(c==='g')grant(g,h,v,rec,env);
  if(c==='c'&&!grant(g,h,v,rec,env)){rec.steps=[];break}
  if(c==='Z'){const die=1+Math.floor(rand(env)()*6);if(v==='U'){if(die<=2)b.hp=Math.max(1,Number(b.hp)-1);else healRules().draw(g,h,2,{random:env.random})}else if(v==='H'){if(die<=2)b.hp=Math.max(1,Number(b.hp)-1);else healRules().heal(g,h,die<=4?2:3,{random:env.random},owner)}else{const amount=Number(split(v)[die-1])||0;g.gold=Number(g.gold||0)+amount;log(g,'FIRST VISIT: gained '+amount+' Gold.')}log(g,'FIRST VISIT: rolled '+die+'.')}
  rec.steps.shift()
 }
 rec.stage='used';markUsed(g,rec);delete rec.pending;delete rec.steps;const outcome=rec.outcome||{};delete rec.outcome;log(g,'FIRST VISIT — '+catalog[rec.id].title+' resolved by '+h+'.');return {resolved:true,...outcome}
}
function execute(g,actor,cmd={},env={}){
 reconcile(g);
 if(cmd.action==='gate')return gateInteract(g,actor,String(cmd.feature||''),env);
 const rec=rows(g)[String(cmd.feature||'')];if(!rec||!ready(g,rec))return {error:'This First Visit feature is not available.'};
 const opt=plans[rec.id]?.[Number(cmd.option)],operation=String(cmd.action||'');
 if(rec.stage==='ready'){
  const offer=offers(g,actor,env).find(x=>x.id===rec.id);
  if(!offer)return {error:'Only an eligible Hero may choose this feature.'};
  if(operation==='decline'){rec.stage='used';rec.declined=true;rec.owner=actor;markUsed(g,rec);log(g,'FIRST VISIT — '+catalog[rec.id].title+' declined.');return {resolved:true,declined:true}}
  if(operation!=='choose'||!Number.isInteger(cmd.option)||!offer.options.some(x=>x.index===cmd.option&&x.target===cmd.target)||!opt)return {error:'Choose an available printed option.'};
  const target=cmd.target;
  rec.option=cmd.option;rec.owner=actor;rec.target=target;rec.remoteTarget=opt.target==='j';rec.steps=opt.steps.slice();
  if(!available(g,rec,opt,target,{...env,actor})){
   if(!opt.steps.some(x=>x.startsWith('a')))return {error:'The option is no longer legal.'};
   rec.stage='reserved';rec.reserveRound=Number(g.round);return {reserved:true}
  }
  rec.stage='steps';return advance(g,rec,env)
 }
 if(rec.owner!==actor)return {error:'Another Hero owns this First Visit choice.'};
 if(!rec.deferred&&!selectedTargetLegal(g,rec))return {error:'The selected Hero is no longer eligible at the feature.'};
 if(rec.stage==='reserved'){
  if(operation!=='resume')return {error:'Resume the reserved printed Action on its Hero turn.'};
  const option=plans[rec.id][rec.option];if(!available(g,rec,option,rec.target,{...env,actor}))return {error:'Reserved option is not yet legal or affordable.'};
  rec.stage='steps';return advance(g,rec,env)
 }
 if(rec.stage!=='steps'||operation!=='pick'||!rec.pending)return {error:'The First Visit choice is already resolved.'};
 const p=rec.pending,step=rec.steps[0],v=step.slice(1),idx=cmd.indices,source=rec.target,zs=z(g,source),za=z(g,rec.owner),b=status().body(g,source);
 const min=p.min??(p.optional?0:p.count),max=p.max??p.count;
 if(!Array.isArray(idx)||idx.some(i=>!Number.isInteger(i)||i<0||i>=p.options.length)||new Set(idx).size!==idx.length||idx.length<min||idx.length>max)return {error:'Select the required number of distinct cards or conditions.'};
 if(rec.deferred){
  const deck=p.kind==='deferredHero'?zs.deck:p.kind==='deferredPool'?g.pool:g.encDeck,original=cards(deck).slice(0,p.count);
  if(original.length!==p.count||original.some((c,i)=>cardLabel(c)!==p.options[i]))return {error:'The setup deck changed.'};
  const order=idx.map(i=>original[i]);
  if(p.kind==='deferredHero'){const picked=order.shift();deck.splice(0,p.count,...order);zs.hand.push(picked)}
  else if(p.kind==='deferredPool'){const bottom=order.pop();deck.splice(0,p.count,...order);deck.push(bottom)}
  else if(p.kind==='deferredEnc'){if(cmd.bottom===true){const bottom=order.pop();deck.splice(0,p.count,...order);deck.push(bottom)}else if(idx.some((v,i)=>v!==i))return {error:'Keep the Encounter order or move one card to the bottom.'}}
  rec.stage='used';delete rec.pending;delete rec.steps;log(g,'FIRST VISIT: deferred '+catalog[rec.id].title+' resolved.');return {resolved:true}
 }
 if(p.kind==='i'){const wanted=p.choices?.[idx[0]],q=ordinaryChoices(g,rec,source,env).find(x=>x.key===wanted);if(!q)return {error:'The choice is no longer available.'};const result=applyOrdinary(g,rec,source,q,env);if(result.error)return result}
 else if(p.kind==='k'){const wanted=p.choices?.[idx[0]],q=serviceChoices(g,rec,source).find(x=>x.key===wanted);if(!q)return {error:'The service is no longer available.'};const result=applyService(g,rec,source,q,env);if(result.error)return result}
 else if(['x','b','t','X','q','w','y'].includes(p.kind)){
  const zz=p.kind==='X'?za:zs,selected=idx.map(i=>zz.hand[i]);if(selected.some(x=>x===undefined))return {error:'The hand changed.'};for(const i of [...idx].sort((a,b)=>b-a))zz.hand.splice(i,1);
  if(['x','X','w','y'].includes(p.kind))zz.discard.push(...selected);else if(['b','q'].includes(p.kind))zz.deck.push(...selected);else zz.deck.unshift(...selected);
  if(p.kind==='q'||p.kind==='w')healRules().draw(g,source,selected.length,{random:env.random});
  if(p.kind==='y')healRules().heal(g,source,selected.length,{random:env.random},rec.owner)
 }else if(p.kind==='F'||p.kind==='V'||p.kind==='B'){
  const zz=p.kind==='B'?za:zs,chosen=zz.discard[idx[0]];if(chosen===undefined)return {error:'The discard pile changed.'};zz.discard.splice(idx[0],1);if(p.kind==='F')zz.deck.unshift(chosen);else if(p.kind==='B')zz.deck.push(chosen);else zz.hand.push(chosen)
 }else if(p.kind==='v'){
  rec.discardIndex=idx[0];rec.steps.splice(1,0,'x'+p.cost,'Vchosen');
 }else if(p.kind==='m'){
  const selected=idx.map(i=>zs.discard[i]);if(selected.some(x=>x===undefined))return {error:'The discard pile changed.'};for(const i of [...idx].sort((a,b)=>b-a))zs.discard.splice(i,1);zs.deck.push(...selected);shuffled(zs.deck,env)
 }else if(['I','D','N','n','M','O'].includes(p.kind)){
  const length=p.options.length,original=p.kind==='O'?zs.deck.slice(-length):zs.deck.slice(0,length);
  if(original.length!==length)return {error:'The deck changed.'};
  if(p.kind==='D'){const keep=idx.map(i=>original[i]),discard=original.filter((_,i)=>!idx.includes(i));zs.deck.splice(0,length,...keep);zs.discard.push(...discard)}
  else if(p.kind==='N'||p.kind==='n'){const order=idx.map(i=>original[i]),bottom=p.kind==='N'||cmd.bottom===true;if(bottom){const last=order.pop();zs.deck.splice(0,length,...order);zs.deck.push(last)}else zs.deck.splice(0,length,...order)}
  else if(p.kind==='M'){const chosen=original[idx[0]],rest=original.filter((_,i)=>i!==idx[0]);zs.deck.splice(0,length);zs.hand.push(chosen);zs.deck.push(...rest)}
  else if(p.kind==='O'){const order=idx.map(i=>original[i]),top=order.shift();zs.deck.splice(zs.deck.length-length,length,...order);zs.deck.unshift(top)}
  else zs.deck.splice(0,length,...idx.map(i=>original[i]))
 }else if(p.kind==='A'){const q=p.choices?.[idx[0]],options=transferOptions(g,source,v==='1');if(!q||!options.some(x=>x.target===q.target&&x.id===q.id))return {error:'The transfer is no longer legal.'};if(!removeLoot(g,source,q.id)||!addLoot(g,q.target,q.id))return {error:'The inventory changed.'}
 }else if(p.kind==='W'){if(!zs.deck.length)return {error:'Hero deck is empty.'};if(cardLabel(zs.deck[0])===p.options[idx[0]])healRules().draw(g,source,1,{random:env.random});else{zs.deck.push(zs.deck.shift());grant(g,source,'Dazed@n',rec,env)}}
 else if(p.kind==='e'){if(idx.length)status().remove(b,p.options[idx[0]])}
 else if(p.kind==='Q'){const original=g.searchDeck.slice(0,p.count);if(!canInspect(g,'Q')||original.length!==p.count)return {error:'Search deck is no longer eligible.'};g.searchDeck.splice(0,p.count,...idx.map(i=>original[i]))
 }else if(p.kind==='T'){if(!canInspect(g,'T'))return {error:'Exploration deck is no longer eligible.'};if(idx[0]===1)g.pool.push(...g.pool.splice(0,p.length))
 }else if(p.kind==='P'){if(!canInspect(g,'P'))return {error:'Exploration deck is no longer eligible.'};const list=g.pool.slice(0,p.count);if(list.length!==p.count)return {error:'Exploration deck changed.'};const order=idx.map(i=>list[i]),discard=order.pop();g.pool.splice(0,p.count,...order);(store(g).explorationDiscard??=[]).push(discard)
 }else if(p.kind==='J'){if(!zs.deck.length)return {error:'The deck changed.'};if(idx[0]===1)zs.deck.push(zs.deck.shift())
 }else if(p.kind==='E'){const original=g.encDeck.slice(0,p.count);g.encDeck.splice(0,p.count,...idx.map(i=>original[i]))}
 else if(p.kind==='r'||p.kind==='o'){if(idx.length)status().remove(b,p.options[idx[0]])}
 else if(p.kind==='H'){const target=p.options[idx[0]];if(!live(g,target)||keyOf(g,target)!==rec.key)return {error:'The second Hero is no longer here.'};healRules().heal(g,target,p.amount,{random:env.random},rec.owner)}
 rec.steps.shift();delete rec.pending;return advance(g,rec,env)
}
function blocking(g,h){return Object.values(rows(g)).some(rec=>rec.stage==='steps'&&(rec.deferred||rec.owner===h)&&ready(g,rec))}
function audit(){return {catalog:Object.keys(catalog).length,named:Object.values(catalog).filter(x=>x.title).length,automated:Object.keys(plans).length,referenceOnly:Object.values(catalog).filter(x=>x.title&&!plans[x.id]).map(x=>x.id)}}
return {catalog,plans,scope,rows,store,entry,finish,seed,setupDeferred,campaignState,campaignUsed,serviceChoices,serviceAvailable,ordinaryChoices,gateOptions,gateNeeded,reconcile,expireReserved,expireLocation,preserve,offers,execute,audit,clear,here,blocking};
});
