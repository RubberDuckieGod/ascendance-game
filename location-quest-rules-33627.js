// Shared first-Reveal receipts and the authored Q003 Vault Key / sealed armory.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascLocationQuestRules33627=api})(globalThis,()=>{
'use strict';
const keyId='LT118',questId='Q003',locationId='L017';
const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g?.lyra:h==='Seraphine'?g?.seraphine:g?.heroRuntimeStates?.[h]||g?.extraHeroes?.[h];
const pos=(g,h)=>h==='Aldric'?g?.hero:body(g,h);
const party=g=>Array.isArray(g?.partyHeroes)?g.partyHeroes:[];
const raider=en=>!!en&&(en.type==='Raider'||en.enemyId==='E001'||en.id==='E001'||/\bGoblin Raider\b/i.test(String(en.name||'')));
const qstate=g=>g?.campaign?.q003;
function active(g){
 const c=g?.campaign;if(!c||c.currentQuest!==questId||c.downtime===true||c.campaignEnded)return false;
 const status=c.questStatus?.[questId]||'Available',victory=c.afterQuestExplore32920;
 return status==='Available'||status==='Completed'&&victory?.active===true&&victory.quest===questId;
}
function append(g,message){g.adventureLog??=[];g.adventureLog.unshift(message);if(g.adventureLog.length>1000)g.adventureLog.length=1000}
function awardRaiderKey(g,hero,en,context={}){
 if(!active(g)||!raider(en))return {awarded:false};
 if(context.beforeHp!=null&&!(Number(context.beforeHp)>0)||Number(en.hp)>0&&!context.removed)return {awarded:false};
 g.campaign.q003??={};const q=qstate(g);
 if(q.vaultKeyClaimed3304||q.armoryOpened3304)return {awarded:false};
 g.partyQuestItems=Array.isArray(g.partyQuestItems)?g.partyQuestItems:[];
 const already=g.partyQuestItems.includes(keyId);
 if(!already)g.partyQuestItems.push(keyId);
 g.lootDeck=Array.isArray(g.lootDeck)?g.lootDeck.filter(id=>id!==keyId):[];
 g.lootDiscard=Array.isArray(g.lootDiscard)?g.lootDiscard.filter(id=>id!==keyId):[];
 q.vaultKeyClaimed3304=true;
 q.vaultKeyReceipt33627={item:keyId,hero:party(g).includes(hero)?hero:null,enemy:String(en.roomEnemyId3301||en.uid||en.locationQuestEnemyId33627||en.id||en.type||'E001'),round:Number(g.round||1)};
 append(g,'QUEST ITEM FOUND — LT118 Watchtower Vault Key. At Fallen Watchtower, spend 1 Action to open the sealed armory and draw 1 Equipment Card.');
 return {awarded:!already,item:keyId,receipt:copy(q.vaultKeyReceipt33627)};
}
function captureRaiders(g){return Object.values(g?.tiles||{}).flatMap(t=>(t.enemies||[]).filter(en=>raider(en)&&Number(en.hp)>0).map(en=>{if(!en.roomEnemyId3301&&!en.uid&&!en.locationQuestEnemyId33627){g.locationQuestEnemySeq33627=Number(g.locationQuestEnemySeq33627||0)+1;en.locationQuestEnemyId33627='LQE33627-'+g.locationQuestEnemySeq33627}return copy(en)}))}
function reconcileDefeats(before,after,hero){
 if(!before||!after||before.campaign?.currentQuest!==after.campaign?.currentQuest||String(before.campaign?.instanceId32537||'')!==String(after.campaign?.instanceId32537||''))return {awarded:false};
 const identity=en=>String(en.roomEnemyId3301||en.uid||en.locationQuestEnemyId33627||en.snareEnemyId33622||'');
 const live=Object.values(after.tiles||{}).flatMap(t=>(t.enemies||[]).filter(en=>Number(en.hp)>0));
 for(const en of captureRaiders(before))if(identity(en)&&!live.some(next=>identity(next)===identity(en))){const result=awardRaiderKey(after,hero,{...en,hp:0},{beforeHp:en.hp,removed:true});if(result.awarded)return result}
 return {awarded:false};
}
function armoryEligibility(g,h){
 if(!active(g))return {ok:false,reason:'The sealed armory is available during Q003 and its Victory Exploration.'};
 if(!party(g).includes(h)||!body(g,h))return {ok:false,reason:'A participating Hero is required.'};
 const q=qstate(g)||{};
 if(q.armoryOpened3304)return {ok:false,reason:'The sealed armory is already open.',opened:true,reward:copy(q.armoryReward33627||null)};
 if(Number(body(g,h).hp||0)<=0)return {ok:false,reason:'A Downed Hero cannot open the sealed armory.'};
 if(g.phase!=='Hero Phase'||g.passedHeroes32521?.[h])return {ok:false,reason:'Open the sealed armory during your Hero turn.'};
 const p=pos(g,h),at=Object.entries(g.tiles||{}).find(([,t])=>t.id===locationId);
 if(!at||!p||at[0]!==`${Number(p.x)||0},${Number(p.y)||0}`)return {ok:false,reason:'Move to Fallen Watchtower to open the sealed armory.'};
 if(!(g.partyQuestItems||[]).includes(keyId))return {ok:false,reason:'Defeat a Goblin Raider to find LT118 Watchtower Vault Key.'};
 if(Number(body(g,h).actions||0)-Number(body(g,h).attackOnlyActions||0)<1)return {ok:false,reason:'Opening the sealed armory requires 1 general Action.'};
 const choices=Object.entries(g.equipmentDecks||{}).flatMap(([rarity,ids])=>Array.isArray(ids)?ids.map((id,index)=>({id,rarity,index})):[]).filter(x=>/^EQ\d{3}$/.test(String(x.id)));
 if(!choices.length)return {ok:false,reason:'No Equipment Card remains. The key and Action are preserved.'};
 return {ok:true,tileKey:at[0],choices};
}
function openArmory(g,h,context={}){
 const allowed=armoryEligibility(g,h);if(!allowed.ok)return {error:allowed.reason,opened:!!allowed.opened};
 const roll=Number((context.random||Math.random)()),choice=allowed.choices[Math.min(allowed.choices.length-1,Math.max(0,Math.floor((Number.isFinite(roll)?roll:0)*allowed.choices.length)))];
 const def=typeof context.equipmentById==='function'?context.equipmentById(choice.id):null;
 if(typeof context.equipmentById==='function'&&!def)return {error:'The selected Equipment Card is unavailable. The key and Action are preserved.'};
 const q=qstate(g),s=body(g,h);s.actions=Number(s.actions||0)-1;
 g.partyQuestItems=g.partyQuestItems.filter(id=>id!==keyId);
 g.lootDeck=Array.isArray(g.lootDeck)?g.lootDeck.filter(id=>id!==keyId):[];g.lootDeck.push(keyId);
 g.lootDiscard=Array.isArray(g.lootDiscard)?g.lootDiscard.filter(id=>id!==keyId):[];
 g.equipmentDecks[choice.rarity].splice(choice.index,1);
 g.inventory??={};g.inventory[h]??=[];g.inventory[h].push({key:'equipment:'+choice.id,kind:'equipment',id:choice.id,qty:1});
 q.vaultKeyClaimed3304=true;q.armoryOpened3304=true;
 q.armoryReward33627={hero:h,item:choice.id,name:def?.name||choice.id,rarity:choice.rarity,round:Number(g.round||1),cost:1};
 append(g,`SEALED ARMORY OPENED — ${h} spends 1 Action, returns LT118 Watchtower Vault Key to the Loot Deck, and gains ${choice.id} — ${q.armoryReward33627.name}. Open Inventory to equip it.`);
 return {opened:true,cost:1,item:choice.id,reward:copy(q.armoryReward33627),resourceChanged:true,heroChanged:true,patchChanged:true};
}
function markReveal(g,k,h){
 const t=g?.tiles?.[k];if(!t)return null;
 t.revealResolved=true;
 if(!t.firstReveal33627)t.firstReveal33627={location:String(t.id||''),hero:party(g).includes(h)?h:null,round:Number(g.round||1)};
 return copy(t.firstReveal33627);
}
function metadata(g){
 if(g?.campaign?.currentQuest!==questId)return null;
 const q=qstate(g)||{},out={quest:questId};
 for(const flag of ['vaultKeyClaimed3304','armoryOpened3304'])out[flag]=!!q[flag];
 for(const receipt of ['vaultKeyReceipt33627','armoryReward33627'])if(q[receipt])out[receipt]=copy(q[receipt]);
 return out;
}
function constrainKeyResources(g,res){
 if(g?.campaign?.currentQuest!==questId||!res)return res;
 const q=qstate(g)||{},owned=!!q.vaultKeyClaimed3304&&!q.armoryOpened3304;
 res.partyQuestItems=(Array.isArray(res.partyQuestItems)?res.partyQuestItems:[]).filter(id=>id!==keyId);if(owned)res.partyQuestItems.push(keyId);
 res.lootDeck=(Array.isArray(res.lootDeck)?res.lootDeck:[]).filter(id=>id!==keyId);if(q.armoryOpened3304)res.lootDeck.push(keyId);
 res.lootDiscard=(Array.isArray(res.lootDiscard)?res.lootDiscard:[]).filter(id=>id!==keyId);
 return res;
}
function preserve(before,next,context={}){
 if(!before||!next||before.campaign?.currentQuest!==next.campaign?.currentQuest||String(before.campaign?.instanceId32537||'')!==String(next.campaign?.instanceId32537||''))return next;
 for(const [k,t]of Object.entries(next.tiles||{})){
  const old=before.tiles?.[k];if(!old||old.id!==t.id)continue;
  for(const field of ['revealingHero33627','revealedRound33627']){if(Object.prototype.hasOwnProperty.call(old,field))t[field]=copy(old[field]);else delete t[field]}
  if(old.revealResolved||old.firstReveal33627){t.revealResolved=true;if(old.firstReveal33627)t.firstReveal33627=copy(old.firstReveal33627);else delete t.firstReveal33627}
  else{delete t.firstReveal33627;if(Object.prototype.hasOwnProperty.call(old,'revealResolved'))t.revealResolved=!!old.revealResolved;else delete t.revealResolved}
 }
 if(before.campaign?.currentQuest===questId){
  const old=qstate(before)||{};next.campaign.q003??={};const q=qstate(next);for(const flag of ['vaultKeyClaimed3304','armoryOpened3304'])q[flag]=!!old[flag];for(const receipt of ['vaultKeyReceipt33627','armoryReward33627']){if(old[receipt])q[receipt]=copy(old[receipt]);else delete q[receipt]}
  if(context.phaseResult===true)reconcileDefeats(before,next,context.actor);
 }
 return next;
}
return {keyId,questId,locationId,body,pos,active,raider,awardRaiderKey,captureRaiders,reconcileDefeats,armoryEligibility,openArmory,markReveal,metadata,constrainKeyResources,preserve};
});
