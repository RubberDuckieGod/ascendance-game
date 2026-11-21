'use strict';

// Closing an Encounter is separate from awarding its printed rewards. Only a
// verified room Combat removal can create one of these server-owned tombstones.
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value||{},key);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
function scope(g){
 const epoch=Number(g?.questTransitionAuthority33626?.epoch||0);
 return {instance:String(g?.campaign?.instanceId32537||'legacy'),quest:String(g?.campaign?.currentQuest||''),epoch:Number.isSafeInteger(epoch)&&epoch>=0?epoch:0};
}
const sameScope=(a,b)=>!!a&&!!b&&a.instance===b.instance&&a.quest===b.quest&&a.epoch===b.epoch;
const enemies=g=>Object.values(g?.tiles||{}).flatMap(tile=>Array.isArray(tile?.enemies)?tile.enemies:[]);
const livingToken=(g,token)=>enemies(g).filter(enemy=>Number(enemy?.hp)>0&&String(enemy.encounterToken||'')===token);
function capture(g){
 const active=g?.activeEncounter320,token=typeof active?.token==='string'?active.token:'';
 if(!token)return null;
 const living=livingToken(g,token);
 return {scope:scope(g),token,id:String(active.id||''),aliveCount:living.length,enemyIds:[...new Set(living.map(enemy=>String(enemy.roomEnemyId3301||'')).filter(Boolean))]};
}
function metadata(g){
 const authority=g?.encounterCompletionAuthority33627;
 return record(authority)&&sameScope(authority.scope,scope(g))&&record(authority.closed)?clone(authority):null;
}
function closeDefeated(g,before,options={}){
 if(!g||!before?.token||!sameScope(before.scope,scope(g))||!(before.aliveCount>0)||!Array.isArray(before.enemyIds)||!before.enemyIds.length)return {closed:false};
 const active=g.activeEncounter320;
 if(active?.token!==before.token||String(active.id||'')!==before.id||livingToken(g,before.token).length)return {closed:false};
 const ids=new Set(before.enemyIds),applied=Array.isArray(options.applied)?options.applied:[];
 const defeated=applied.filter(change=>ids.has(String(change?.enemyId||''))&&change.removed===true&&Number(change.hpBefore)>0&&Number(change.hpAfter)===0);
 if(!defeated.length)return {closed:false};
 let authority=metadata(g);
 if(!authority)authority={version:'3.36.27',scope:scope(g),closed:{}};
 const prior=own(authority.closed,before.token)?authority.closed[before.token]:null;
 if(prior)return {closed:false,duplicate:true,receipt:clone(prior)};
 const receipt={token:before.token,id:before.id,actor:(g.partyHeroes||[]).includes(options.actor)?options.actor:null,commandId:typeof options.commandId==='string'?options.commandId:null,round:Number(g.round||1),enemyIds:defeated.map(change=>String(change.enemyId))};
 // Define a data property even for an unusual legacy token such as __proto__.
 Object.defineProperty(authority.closed,before.token,{value:receipt,enumerable:true,writable:true,configurable:true});
 g.encounterCompletionAuthority33627=authority;g.activeEncounter320=null;
 const expired=new Set((g.heroCreatedPieces3294||[]).filter(p=>['wolf','turret'].includes(p.type)&&p.data?.encounterToken===before.token).map(p=>p.id));
 if(expired.size){g.heroCreatedPieces3294=g.heroCreatedPieces3294.filter(p=>!expired.has(p.id));const thorne=g.heroRuntimeStates?.Thorne||g.extraHeroes?.Thorne;if(expired.has(thorne?.spiritWolf32526?.pieceId33627))delete thorne.spiritWolf32526;const mira=g.heroRuntimeStates?.Mira||g.extraHeroes?.Mira;if(expired.has(mira?.turret?.pieceId33628))delete mira.turret}
 return {closed:true,token:before.token,id:before.id,receipt:clone(receipt)};
}
function preserve(before,next,options={}){
 if(!next)return next;
 if(options.freshAttempt===true||!sameScope(scope(before),scope(next))){delete next.encounterCompletionAuthority33627;return next}
 const authority=metadata(before);
 if(!authority){delete next.encounterCompletionAuthority33627;return next}
 next.encounterCompletionAuthority33627=authority;
 const token=next.activeEncounter320?.token;
 if(typeof token==='string'&&own(authority.closed,token))next.activeEncounter320=null;
 return next;
}
module.exports={version:'3.36.27',scope,capture,metadata,closeDefeated,preserve};
