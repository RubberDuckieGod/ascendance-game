// Shared state transitions for the mechanics added after the 3.36.21 audit.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascMechanicsRules33621=api})(globalThis,()=>{
'use strict';
const k=(x,y)=>`${x},${y}`;
const state=g=>(g.mechanics33621??={heroes:{}});
const hero=(g,h)=>(state(g).heroes[h]??={});
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];
const pos=(g,h)=>h==='Aldric'?g.hero:body(g,h);
const tile=(g,h)=>{const p=pos(g,h);return p&&g.tiles?.[k(p.x,p.y)]};
const equipped=(g,h,id)=>Object.values(g.equipped?.[h]||{}).flat().includes(id);
const owns=(g,h,id)=>(g.inventory?.[h]||[]).some(r=>r.id===id&&r.qty>0)||(g.partyQuestItems||[]).includes(id);
const consume=(g,h,id)=>{const rows=g.inventory?.[h]||[],i=rows.findIndex(r=>r.id===id&&r.qty>0);if(i<0){const q=(g.partyQuestItems||[]).indexOf(id);if(q<0)return false;g.partyQuestItems.splice(q,1);return true}if(--rows[i].qty===0)rows.splice(i,1);return true};
const encounter=g=>String((g.mechanics33621?.encounterSerial?`${g.campaign?.currentQuest}:${g.campaign?.day}:${g.mechanics33621.encounterSerial}`:null)||g.activeEncounter320?.token||`${g.campaign?.instanceId32537||''}:${g.campaign?.currentQuest}:${g.campaign?.day}:${g.campaign?.questAttempt||0}`);
const turn=(g,h)=>`${g.round}:${g.roomAuthority3300?.startSeqByHero?.[h]||g.heroAbilityRuntime3362?.counters?.['turn:'+h]||1}`;
function neighbors(g,p){return Object.entries(g.tiles||{}).filter(([key,t])=>{const [x,y]=key.split(',').map(Number),dx=x-p.x,dy=y-p.y;if(Math.abs(dx)+Math.abs(dy)!==1)return false;const d=dx===1?'E':dx===-1?'W':dy===1?'S':'N',op={N:'S',S:'N',E:'W',W:'E'};return g.tiles[k(p.x,p.y)]?.edges?.[d]&&t.edges?.[op[d]]}).map(([key,t])=>({key,t}))}
function nearFeature(g,t){const entry=Object.entries(g.tiles||{}).find(([,v])=>v===t);if(!entry)return false;const [x,y]=entry[0].split(',').map(Number);return [t,...neighbors(g,{x,y}).map(q=>q.t)].some(z=>(z.structures||[]).length||(z.terrainFeatures||[]).length||/structure|obstacle|forest|woods|ruins?|fortress|mountain|rock/i.test([z.type,z.terrain,...(z.traits||[])].join(' ')))}
function restriction(t){if(!t||t.lockpickBypassed33621)return null;const r=(t.restrictions||[]).find(x=>/^(locked|simple trap)$/i.test(x.type));if(r)return r;if(t.locked||t.simpleTrap||/\blocked\b|\bsimple trap\b/i.test([t.special,t.ongoing].join(' ')))return {type:t.locked?'Locked':'Simple Trap',action:t.interaction?'interact':'search',cost:1};return null}
function cooldowns(g,h){const out=[];for(const [name,until]of Object.entries(hero(g,h).cooldowns||{}))if(until>g.round)out.push({key:name,kind:'generic',name});for(const [name,round]of Object.entries(g.heroAbilityRuntime3362?.round||{}))if(name.startsWith(h+'::')&&round===g.round)out.push({key:name,kind:'round',name:name.slice(h.length+2)});for(const [name,round]of Object.entries(g.campaign?.levelRuntime3360?.hero?.[h]?.round||{}))if(round===g.round)out.push({key:name,kind:'level',name});return out}
function action(g,h,op,args={}){
 const b=body(g,h),t=tile(g,h);if(!b||b.hp<=0)return {error:'A living Hero is required.'};if(g.phase!=='Hero Phase')return {error:'Use this action during Hero Phase.'};
 if(op==='PLACE_SNARE'){
  const traps=typeof module==='object'&&module.exports?require('./snare-rules-33622.js'):globalThis.ascSnareRules33622;
  if(!traps)return {error:'Snare rules are unavailable.'};
  return traps.placeCard(g,h,args,{body:b,neighbors:neighbors(g,pos(g,h))});
 }
 const s=hero(g,h);
 if(op==='REST'){
  if((t?.enemies||[]).some(e=>e.hp>0))return {error:'Cannot Rest while Engaged.'};
  const cond=h==='Aldric'?(g.conditions||[]):(b.conditions||[]),prepared=cond.includes('Prepared'),cost=prepared?0:2;
  if(b.actions<cost)return {error:'Rest needs 2 Actions.'};if(s.restTurn===turn(g,h))return {error:'Already Rested this turn.'};
  const max=Number(args.maxHp||((b.maxHp||({Aldric:14,Lyra:8,Seraphine:11}[h])||b.hp)+(equipped(g,h,'EQ097')?2:0))),rations=owns(g,h,'LT012'),regrouped=cond.includes('Regrouped');
  if(b.hp>=max&&!cond.some(c=>['Bleeding','Shaken','Mana Burn'].includes(c)))return {error:'No recovery is needed.'};
  const heal=Math.max(0,Math.min(max-b.hp,2+Number(rations)+Number(regrouped)+Number(equipped(g,h,'EQ099'))+((equipped(g,h,'EQ068')&&s.stance==='Life'&&s.stanceEncounter===encounter(g))?2:0)));b.hp+=heal;b.actions-=cost;s.restTurn=turn(g,h);
  const cleaned=cond.filter(c=>!['Bleeding','Shaken','Mana Burn','Prepared','Regrouped'].includes(c));if(h==='Aldric')g.conditions=cleaned;else b.conditions=cleaned;if(rations)consume(g,h,'LT012');return {heal,draw:Number(regrouped),cost,rations};
 }
 if(op==='RELOAD'){
  if(!equipped(g,h,'EQ055'))return {error:'Equip Repeating Crossbow first.'};if(b.actions<1)return {error:'Reload needs 1 Action.'};if((s.rapidUses||0)===0)return {error:'Magazine is already full.'};b.actions--;s.rapidUses=0;return {cost:1};
 }
 if(op==='STANCE'){
  if(!equipped(g,h,'EQ068'))return {error:'Equip Worldheart Staff first.'};if(!['Flame','Frost','Storm','Life'].includes(args.stance))return {error:'Choose a Worldheart stance.'};if(s.stanceEncounter===encounter(g))return {error:'Stance was already chosen for this encounter.'};s.stance=args.stance;s.stanceEncounter=encounter(g);return {stance:s.stance};
 }
 if(op==='REFRESH'){
  if(!equipped(g,h,'EQ068'))return {error:'Equip Worldheart Staff first.'};if(s.giftEncounter===encounter(g))return {error:'Worldheart’s Gift was already used this encounter.'};const q=cooldowns(g,h).find(x=>x.key===args.key&&x.kind===args.kind);if(!q)return {error:'Choose an Ability currently on cooldown.'};
  if(q.kind==='generic')delete s.cooldowns[q.key];else if(q.kind==='round')delete g.heroAbilityRuntime3362.round[q.key];else delete g.campaign.levelRuntime3360.hero[h].round[q.key];s.giftEncounter=encounter(g);return {refreshed:q.name};
 }
 if(op==='UNLOCK'){
  if(!restriction(t))return {error:'No Locked or simple Trap restriction here.'};if((t.enemies||[]).some(e=>e.hp>0))return {error:'Cannot unlock while Engaged.'};if(b.actions<1)return {error:'Unlock needs 1 Action.'};b.actions--;t.lockpickBypassed33621=true;t.locked=false;t.simpleTrap=false;return {cost:1,unlocked:true};
 }
 if(op==='INTERACT'){
  if(!t?.interaction||t.interactionResolved33621||restriction(t))return {error:'No unlocked interaction is available.'};if((t.enemies||[]).some(e=>e.hp>0)||b.actions<1)return {error:'Interact needs 1 Action and no Engagement.'};b.actions--;t.interactionResolved33621=true;const gold=Math.max(0,Math.min(1000,Number(t.interaction.gold||0)));g.gold=Number(g.gold||0)+gold;return {cost:1,gold};
 }
 if(op==='LOCKPICK'){
  const r=restriction(t);if(!owns(g,h,'LT026'))return {error:'A Lockpick Set is required.'};if(!r)return {error:'No Locked or simple Trap restriction here.'};if((t.enemies||[]).some(e=>e.hp>0))return {error:'Cannot unlock while Engaged.'};
  t.lockpickBypassed33621=true;t.locked=false;t.simpleTrap=false;consume(g,h,'LT026');if(r.action==='interact'){t.interactionResolved33621=true;const gold=Math.max(0,Math.min(1000,Number(t.interaction?.gold||0)));g.gold=Number(g.gold||0)+gold;return {interacted:true,gold}}return {search:true};
 }
 return {error:'Unknown mechanics action.'};
}
function cooldownSnapshot(g){return {round:{...(g.heroAbilityRuntime3362?.round||{})},levelRound:Object.fromEntries(Object.entries(g.campaign?.levelRuntime3360?.hero||{}).filter(([h])=>(g.partyHeroes||[]).includes(h)).map(([h,s])=>[h,{...(s.round||{})}]))}}
function applyCooldowns(g,data,actor){
 if(!data)return;const root=g.heroAbilityRuntime3362??={round:{},quest:{},turn:{},buffs:{},counters:{},flags:{}};root.round??={};
 for(const key of Object.keys(root.round))if(!actor||key.startsWith(actor+'::'))delete root.round[key];
 for(const [key,value]of Object.entries(data.round||{}))if(key.includes('::')&&(!actor||key.startsWith(actor+'::')))root.round[key]=value;
 g.campaign??={};const level=g.campaign.levelRuntime3360??={quest:g.campaign.currentQuest,hero:{},groupDamage:{},round:0,roundStart:{}};level.hero??={};
 for(const [h,values]of Object.entries(data.levelRound||{})){if(actor&&h!==actor)continue;if(!g.partyHeroes?.includes(h))continue;level.hero[h]??={used:{},round:{},buff:{},turnStart:null};level.hero[h].round={...values}}
}
function craftPlan(recipe,inventory,lookup,crystal){
 const materials=(recipe.materials||[]).map(m=>({...m}));let substitution=null;
 if(crystal){for(const m of materials){const have=inventory.filter(x=>x.id===m.id).reduce((n,x)=>n+Number(x.qty||0),0);if(have<m.qty&&/^(Rare|Epic)$/i.test(lookup(m.id)?.rarity||'')){m.qty--;substitution={id:m.id,qty:1};break}}}
 return {materials:materials.filter(m=>m.qty>0),substitution,consumeCrystal:!!substitution&&(recipe.consumeCrystal33621===true||(recipe.consumeCrystal33621!==false&&!/\b(?:not|never)\s+(?:consume|discard)\b/i.test(recipe.rules||recipe.special||'')&&/\b(?:consume|discard)\s+(?:the\s+)?Crystal of Creation\b/i.test(recipe.rules||recipe.special||'')))};
}
return {state,hero,body,pos,tile,equipped,owns,consume,encounter,turn,neighbors,nearFeature,restriction,cooldowns,cooldownSnapshot,applyCooldowns,action,craftPlan};
});
