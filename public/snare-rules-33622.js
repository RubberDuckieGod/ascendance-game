(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascSnareRules33622=api})(globalThis,()=>{
'use strict';
const cardId='H005-009';
function identity(g,en){
 if(en.roomEnemyId3301)return String(en.roomEnemyId3301);
 if(!en.snareEnemyId33622){g.snareEnemySequence33622=Number(g.snareEnemySequence33622||0)+1;en.snareEnemyId33622='SE33622-'+g.snareEnemySequence33622}
 return String(en.snareEnemyId33622);
}
function capture(g){const found=new Map();for(const [key,t]of Object.entries(g?.tiles||{}))for(const en of t.enemies||[])if(en&&typeof en==='object')found.set(identity(g,en),key);return found}
function reconcilePieces(g){
 if(!g)return;
 const live=new Map(Object.entries(g.tiles||{}).filter(([,t])=>t.snare32526));
 const pieces=Array.isArray(g.heroCreatedPieces3294)?g.heroCreatedPieces3294:[];
 const kept=pieces.filter(p=>p?.type!=='snare');
 for(const [key,t]of live){
  const trap=t.snare32526;
  const old=pieces.find(p=>p?.type==='snare'&&p.locationKey===key);
  kept.push({...old,id:old?.id||'HCP-'+(trap.id||key),type:'snare',name:'Snare',label:'Snare',owner:trap.owner||'Rowan',locationKey:key,hp:null,maxHp:null,createdRound:trap.placedRound||g.round||1,data:{...(old?.data||{}),snareId:trap.id||null}});
 }
 g.heroCreatedPieces3294=kept;
}
function arm(g,key,owner,id){
 const t=g?.tiles?.[key];if(!t)return {error:'Choose a revealed connected Location.'};
 if(t.snare32526)return {error:'That Location already has a Snare.'};
 g.snareSequence33622=Number(g.snareSequence33622||0)+1;
 t.snare32526={id:id||'SN33622-'+g.snareSequence33622,owner,placedRound:Number(g.round||1),presentEnemyIds:(t.enemies||[]).filter(e=>e.hp>0).map(e=>identity(g,e))};
 reconcilePieces(g);return {placed:true,tileKey:key,snareId:t.snare32526.id};
}
function log(g,message,context){if(context?.log)context.log(message);else{g.adventureLog??=[];g.adventureLog.push(message)}}
function enter(g,key,en,context={}){
 const t=g?.tiles?.[key],trap=t?.snare32526;
 if(!trap||!en||Number(en.hp)<=0)return {triggered:false};
 const id=identity(g,en);
 if((trap.presentEnemyIds||[]).includes(id)&&context.fromKey===key)return {triggered:false};
 const before=Number(en.hp),owner=trap.owner||'Rowan';
 en.hp=Math.max(0,before-2);en.conditions=Array.isArray(en.conditions)?en.conditions:[];
 if(!en.conditions.some(c=>(typeof c==='string'?c:c?.name)==='Rooted'))en.conditions.push('Rooted');
 delete t.snare32526;
 const killed=en.hp===0;
 if(killed){
  t.enemies=(t.enemies||[]).filter(e=>e!==en);
  if(!en._killOwner32521){
   en._killOwner32521=owner;en._heroKillCredited32519=owner;
   g.heroKills3259??={};g.heroKills3259[owner]=Number(g.heroKills3259[owner]||0)+1;
  }
  context.onKilled?.(en,owner,key);
 }
 reconcilePieces(g);
 log(g,`SET SNARE — ${en.name||'Enemy'} enters ${t.name||key}, suffers 2 damage and gains Rooted. Snare removed.`,context);
 return {triggered:true,snareId:trap.id||null,enemyId:id,owner,tileKey:key,beforeHp:before,afterHp:en.hp,killed};
}
function resolveEntries(g,before,context={}){
 const events=[];
 // Take a copy: lethal traps can remove an Enemy while this list is traversed.
 for(const [key,t]of Object.entries(g?.tiles||{}))for(const en of [...(t.enemies||[])]){
  const from=before.get(identity(g,en));
  if(from===key)continue;
  const event=enter(g,key,en,{...context,fromKey:from});if(event.triggered)events.push(event);
 }
 return events;
}
function placeCard(g,h,args,context){
 if(!(g.partyHeroes||[]).includes(h))return {error:'A participating Hero is required.'};
 if(g.campaign?.downtime===true)return {error:'Play Set Snare during a Quest.'};
 const b=context.body,targets=context.neighbors||[],target=targets.find(x=>x.key===String(args.tileKey||''));
 if(!target||target.t?.revealed===false)return {error:'Set Snare requires a different, connected, revealed Location.'};
 if(target.t.snare32526)return {error:'That Location already has a Snare.'};
 const hand=Array.isArray(b.hand)?b.hand:[],index=hand.findIndex(c=>c?.id===cardId&&(!args.cardUid||String(c.uid||'')===String(args.cardUid)));
 if(index<0)return {error:'Set Snare must be in your own hand.'};
 const card=hand[index],cost=Number.isFinite(Number(card.cost))?Number(card.cost):1;
 if(!Number.isInteger(cost)||cost<0||cost>6)return {error:'Invalid printed Set Snare cost.'};
 if(Number(b.actions||0)-Number(b.attackOnlyActions||0)<cost)return {error:'Set Snare requires a general Action.'};
 const result=arm(g,target.key,h,args.trapId);
 if(result.error)return result;
 b.actions-=cost;hand.splice(index,1);b.discard??=[];b.discard.push(card);
 return {...result,cost,cardId};
}
return {cardId,identity,capture,arm,enter,resolveEntries,reconcilePieces,placeCard};
});
