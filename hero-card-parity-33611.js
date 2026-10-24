(()=>{
'use strict';
const V='3.36.11';
const HARMFUL=['Bleeding','Poisoned','Burning','Stunned','Weakened','Slowed','Rooted','Exposed','Marked','Silenced','Disarmed','Knocked Down','Shocked'];
const BENEFICIAL=['Guarded','Inspired','Regenerating','Hidden','Stealth','Consecrated','Blessed'];
const PATCHED=new Set([
'H003-009','H003-010','H003-020','H004-009','H004-011','H004-021','H005-002','H005-011','H005-013','H005-019',
'H007-016','H007-018','H008-017','H008-018','H009-010','H009-018','H009-020','H010-012','H010-013','H010-019',
'H011-007','H011-009','H011-011','H011-012','H011-014','H011-015','H011-016','H011-020',
'H012-011','H012-013','H012-014','H012-015','H012-017','H012-018','H012-020',
'H013-006','H013-008','H013-015','H013-018','H014-005','H014-006','H014-009','H014-012','H014-013','H014-014','H014-019','H014-020',
'H015-015','H015-016','H015-019','H015-020','H016-007','H016-009','H016-014','H016-015','H016-019'
]);
let installed=false;
function G(){try{return globalThis.__ascGetGame?.()||globalThis.g}catch(_){return globalThis.g}}
function st(h){try{if(h==='Aldric')return G();if(h==='Lyra')return G()?.lyra;if(h==='Seraphine')return G()?.seraphine;return globalThis.runtimeHeroState?.(h)||null}catch(_){return null}}
// Tile coordinates are serialized locally; the core lexical `key` is not a Window property.
function locationKey(x,y){return `${x},${y}`}
function pos(h){try{return globalThis.heroPos?.(h)||{x:9999,y:9999}}catch(_){return{x:9999,y:9999}}}
function setPos(h,x,y){let gg=G();if(!gg)return;if(h==='Aldric'){gg.hero=gg.hero||{};gg.hero.x=x;gg.hero.y=y}else{let s=st(h);if(s){s.x=x;s.y=y}}}
function actions(h){try{return Number(globalThis.heroActionCount?.(h)??st(h)?.actions??0)}catch(_){return Number(st(h)?.actions||0)}}
function display(h){try{return globalThis.heroDisplayName?.(h)||h}catch(_){return h}}
function hconds(h){let s=st(h);if(h==='Aldric')return (G().conditions||(G().conditions=[]));return s?(s.conditions||(s.conditions=[])):[]}
function cname(v){return typeof v==='string'?v:v?.name}
function clearAllConditions(h){let a=hconds(h);if(a)a.splice(0,a.length)}
function isAfflicted(en){return !!(en?.conditions||[]).some(x=>HARMFUL.includes(cname(x)))}
function hasBeneficialHeroAt(t){if(!t)return false;return (globalThis.partyHeroes?.()||[]).some(h=>{let p=pos(h),ref=tileRef(t);return ref&&p.x===ref.x&&p.y===ref.y&&hconds(h).some(x=>BENEFICIAL.includes(cname(x)))})}
function tileRef(t){for(const [kk,tt] of Object.entries(G()?.tiles||{}))if(tt===t){let [x,y]=kk.split(',').map(Number);return{k:kk,t:tt,x,y}}return null}
function dist(a,b){try{return globalThis.graphDistance?.(a.x,a.y,b.x,b.y)??999}catch(_){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}}
function refsWithin(h,r,enemyOnly=false){let p=pos(h),out=[];for(const [k,t] of Object.entries(G()?.tiles||{})){let [x,y]=k.split(',').map(Number),d=dist(p,{x,y});if(d<=r&&(!enemyOnly||(globalThis.livingEnemies?.(t)||[]).length))out.push({k,t,x,y,d})}return out}
function choose(list,label,allowDone=false){if(!list?.length)return null;if(list.length===1&&!allowDone)return list[0];let raw=prompt(`${label}\n`+list.map((x,i)=>`${i+1}. ${x.name||x.en?.name||x.t?.name||x.k||'Option'}`).join('\n')+(allowDone?'\n0. Done':''));if(raw===null)return null;let n=parseInt(raw,10);if(allowDone&&n===0)return null;return list[n-1]||null}
function chooseLocation(h,r,label,enemyOnly=false){return choose(refsWithin(h,r,enemyOnly),label,false)}
function enemyRefsIn(t){let tr=tileRef(t);return (globalThis.livingEnemies?.(t)||[]).map(en=>({en,t,dist:tr?dist(pos(globalThis.controlledHero?.()||''),tr):0,name:`${en.name} — ${t.name}`}))}
function chooseEnemyAt(t,label,exclude=new Set()){return choose(enemyRefsIn(t).filter(q=>!exclude.has(q.en)),label,false)}
function chooseEnemyWithin(h,r,label,filter=()=>true){let out=[];for(const q of refsWithin(h,r,true))for(const en of (globalThis.livingEnemies?.(q.t)||[]))if(filter(en,q))out.push({en,t:q.t,dist:q.d,name:`${en.name} — ${q.t.name}`});return choose(out,label,false)}
function logx(s){try{globalThis.log?.(s)}catch(_){}}
function renderx(){try{globalThis.render?.();globalThis.mpScheduleState?.()}catch(_){}}
function cardInHand(h,id){try{return globalThis.extraCardInHand?.(h,id)||st(h)?.hand?.find(c=>c.id===id)||null}catch(_){return null}}
function spendReaction(h,id,msg){let c=cardInHand(h,id);if(!c||actions(h)<Number(c.cost||0)||globalThis.heroDefeated?.(h))return false;if(!confirm(`${msg}\n\nPlay ${c.name} for ${c.cost} Action${Number(c.cost)===1?'':'s'}?`))return false;try{return !!globalThis.spendExtraReaction?.(h,c)}catch(_){return false}}
function finishManual(h,c){let s=st(h);if(!s)return false;let cost=Number(globalThis.extraCardActionCost32611?.(h,c,s)??c.cost??0);if(s.actions<cost){logx(`${c.name}: ${display(h)} needs ${cost} Actions.`);return false}s.actions=Math.max(0,s.actions-cost);globalThis.discardExtraCard?.(h,c);logx(`${c.name} resolves and enters ${display(h)}'s discard pile.`);renderx();return true}
function canManual(h,c){let s=st(h);if(!s||c?.speed!=='Action'||G()?.phase!=='Hero Phase'||globalThis.busy?.()||globalThis.heroDefeated?.(h))return false;let cost=Number(globalThis.extraCardActionCost32611?.(h,c,s)??c.cost??0);if(s.actions<cost){logx(`${c.name}: ${display(h)} needs ${cost} Actions.`);return false}return true}
function directDamage(q,n,label,owner=null){if(!q?.en||q.en.hp<=0)return 0;let before=q.en.hp;q.en.hp=Math.max(0,q.en.hp-Number(n||0));let dealt=Math.max(0,before-q.en.hp);logx(`${label}: ${q.en.name} suffers ${dealt} damage.`);if(q.en.hp<=0){try{globalThis.recordKill32521?.(owner,q.en,label)}catch(_){};try{q.t.enemies=q.t.enemies.filter(e=>e!==q.en)}catch(_){};logx(`${q.en.name} is Defeated${owner?` by ${display(owner)}`:''}.`);try{globalThis.q001AfterEnemyDefeat?.()}catch(_){}}return dealt}
function attack(h,c,q,bonus=0,ignore=0){if(!q?.en||q.en.hp<=0)return{dead:false,damage:0};let before=q.en.hp,dead=!!globalThis.runtimeHeroAttackEnemy?.(h,c,q,bonus,ignore);return{dead,damage:Math.max(0,before-q.en.hp)}}
function pieceMap(type){let gg=G();gg.asc329=gg.asc329||{};gg.asc329[type]=gg.asc329[type]||{};return gg.asc329[type]}
function pieceTotal(type){return Object.values(pieceMap(type)).reduce((a,b)=>a+Number(b||0),0)}
function boneMax(){return Number(globalThis.ascHeroRuntime3362?.boneMax?.()||1)}
function totemMax(){return Number(globalThis.ascHeroRuntime3362?.totemMax?.()||1)}
function placePiece(type,k,max,label){let m=pieceMap(type);if(pieceTotal(type)>=max){logx(`${label}: maximum already in play (${max}).`);return false}m[k]=Number(m[k]||0)+1;logx(`${label}: ${type==='bone'?'Bone Servant':'Spirit Totem'} placed at ${G()?.tiles?.[k]?.name||k}. (${pieceTotal(type)}/${max})`);return true}
function choosePiece(type,h,r,label){let m=pieceMap(type),p=pos(h),opts=Object.keys(m).filter(k=>m[k]>0).map(k=>{let [x,y]=k.split(',').map(Number);return{k,x,y,t:G().tiles[k],d:dist(p,{x,y}),name:G().tiles[k]?.name||k}}).filter(q=>q.d<=r);return choose(opts,label,false)}
function removePiece(type,k){let m=pieceMap(type);if(Number(m[k]||0)<=0)return false;m[k]--;return true}
function neighborRefs(x,y){let out=[];for(const n of globalThis.neighbors?.(x,y)||[]){let t=G()?.tiles?.[locationKey(n.x,n.y)];if(t)out.push({k:locationKey(n.x,n.y),t,x:n.x,y:n.y,name:t.name})}return out}
function moveEnemy(q,label){let tr=tileRef(q.t);if(!tr||q.en.hp<=0)return;let d=choose(neighborRefs(tr.x,tr.y),`${label}: move ${q.en.name} to which connected Location?`,false);if(!d)return;q.t.enemies=q.t.enemies.filter(e=>e!==q.en);d.t.enemies=d.t.enemies||[];d.t.enemies.push(q.en);logx(`${label}: ${q.en.name} moves to ${d.t.name}.`)}
function enemyMarkedBonus(en){return en&&globalThis.hasCond?.(en,'Marked')&&Number(en.markedUntilRound||0)>=Number(G()?.round||0)?1:0}
function beastLoreBonus(en){return en&&Number(en.beastLoreUntilRound||-1)>=Number(G()?.round||0)?1:0}
function beneficialAtEnemy(q){return hasBeneficialHeroAt(q?.t)}
function moveOutAndBack(h,label){let p=pos(h),opts=neighborRefs(p.x,p.y);if(!opts.length||!confirm(`${label}: Move to a connected revealed Location and back?`))return false;let d=choose(opts,`${label}: choose Location`,false);if(!d)return false;globalThis.enterHeroLocation?.(h,d.x,d.y,label);globalThis.enterHeroLocation?.(h,p.x,p.y,label+' — return');return true}
function currentEnemySource(){try{return globalThis.ascLevel3360?.state?.().currentEnemy3360||null}catch(_){return null}}
function sameLoc(a,b){let pa=pos(a),pb=pos(b);return pa.x===pb.x&&pa.y===pb.y}
function heroAtTile(h,t){let r=tileRef(t),p=pos(h);return !!r&&p.x===r.x&&p.y===r.y}

function manualCard(h,c){
 if(!canManual(h,c))return false;let id=c.id,s=st(h),q,t,targets=[];
 if(id==='H004-021'){
   G().campaign=G().campaign||{};G().campaign.cardCampaignUses33611=G().campaign.cardCampaignUses33611||{};if(G().campaign.cardCampaignUses33611[id]){logx(`${c.name}: limit 1 per campaign already used.`);return true}
   let pool=Object.entries(G().tiles||{}).map(([k,t])=>{let[x,y]=k.split(',').map(Number);return{k,t,x,y,name:t.name}}),picked=[];
   while(pool.length&&picked.length<3){let z=choose(pool,`${c.name}: choose Location ${picked.length+1} of up to 3`,picked.length>0);if(!z)break;picked.push(z);pool=pool.filter(x=>x!==z)}
   if(!picked.length)return true;let damaged=[];
   for(const z of picked){let already=((z.t.traits||[]).some(v=>/arcane/i.test(String(v)))||Number(z.t.arcaneUntilRound||0)>0&&Number(z.t.arcaneUntilRound)>=Number(G().round||0));for(const en of [...(globalThis.livingEnemies?.(z.t)||[])]){let before=en.hp;attack(h,c,{en,t:z.t,dist:dist(pos(h),z)},3,0);if(en.hp<before&&en.hp>0)damaged.push({en,t:z.t})}z.t.arcaneUntilRound=999999;z.t.arcaneCataclysm33611=true;if(already){for(const who of (globalThis.partyHeroes?.()||[]).filter(x=>heroAtTile(x,z.t))){globalThis.healHeroBy?.(who,2,c.name);globalThis.drawCardsForHero?.(who,1)}}}
   for(const z of damaged)moveEnemy(z,c.name);G().campaign.cardCampaignUses33611[id]=true;finishManual(h,c);return true;
 }
 if(id==='H007-016'){
   let vines=Object.entries(G().tiles||{}).filter(([k,t])=>t.vineTerrain32526).map(([k,t])=>{let[x,y]=k.split(',').map(Number);return{k,t,x,y,name:t.name}});let d=choose(vines,c.name,false);if(!d){logx(`${c.name}: no revealed Vine Terrain Location.`);return true}globalThis.enterHeroLocation?.(h,d.x,d.y,c.name);finishManual(h,c);return true;
 }
 if(id==='H009-020'){s.perfectFormRound33611=G().round;finishManual(h,c);return true}
 if(id==='H011-007'){
   t=chooseLocation(h,3,c.name,true);if(!t)return true;let pool=enemyRefsIn(t.t),used=new Set();while(pool.length&&used.size<3){q=choose(pool.filter(x=>!used.has(x.en)),`${c.name}: choose Enemy ${used.size+1} of up to 3`,used.size>0);if(!q)break;used.add(q.en);attack(h,c,q,1,0)}if(!used.size)return true;finishManual(h,c);return true;
 }
 if(id==='H011-020'){
   G().asc329=G().asc329||{};G().asc329.used=G().asc329.used||{};let once=`${G().campaign?.currentQuest||'quest'}:${id}`;if(G().asc329.used[once]){logx(`${c.name}: limit 1 per Quest already used.`);return true}let overload=confirm('Cataclysm: Overload this card for +2 Attack to every Cataclysm Attack, then Malachar suffers 1 damage?\n\nThis is allowed even if Arcane Overload was already used this Round.');let bonus=3+(overload?2:0);for(const z of refsWithin(h,2,true))for(const en of [...(globalThis.livingEnemies?.(z.t)||[])])attack(h,c,{en,t:z.t,dist:z.d},bonus,0);if(overload){s.overloadRound=G().round;globalThis.damageHeroBy?.(h,1,'Cataclysm — Arcane Overload')}G().asc329.used[once]=true;finishManual(h,c);return true;
 }
 if(id==='H013-006'){
   t=chooseLocation(h,2,c.name,true);if(!t)return true;let used=new Set();for(let i=0;i<2;i++){q=choose(enemyRefsIn(t.t).filter(x=>!used.has(x.en)),`${c.name}: choose Enemy ${i+1} of up to 2`,i>0);if(!q)break;used.add(q.en);let r=attack(h,c,q,1,0);if(r.damage>0&&q.en.hp>0)globalThis.addCond?.(q.en,'Marked')}if(!used.size)return true;finishManual(h,c);return true;
 }
 if(id==='H014-005'){
   let k=locationKey(pos(h).x,pos(h).y);if(Number(pieceMap('bone')[k]||0)<=0){logx(`${c.name}: no Bone Servant in Mordren's Location.`);return true}q=chooseEnemyAt(G().tiles[k],c.name);if(!q)return true;directDamage(q,2,c.name,h);finishManual(h,c);return true;
 }
 if(id==='H014-006'||id==='H014-020'){
   if(id==='H014-020'){G().asc329=G().asc329||{};G().asc329.used=G().asc329.used||{};let once=`${G().campaign?.currentQuest||'quest'}:${id}`;if(G().asc329.used[once]){logx(`${c.name}: limit 1 per Quest already used.`);return true}G().asc329.used[once]=true}
   let dmg=id==='H014-020'?3:2;for(const [k,n] of Object.entries(pieceMap('bone'))){if(Number(n)<=0)continue;let tt=G().tiles[k],q=chooseEnemyAt(tt,`${c.name}: Bone Servant at ${tt?.name||k} chooses an Enemy`);if(q)directDamage(q,dmg,c.name,h)}
   if(id==='H014-020'){while(pieceTotal('bone')>0&&confirm('Death Unbound: remove a Bone Servant to draw 1 card or recover 1 Health?')){let pc=choosePiece('bone',h,999,c.name);if(!pc)break;removePiece('bone',pc.k);if(confirm('OK = draw 1 card. Cancel = recover 1 Health.'))globalThis.drawCardsForHero?.(h,1);else globalThis.healHeroBy?.(h,1,c.name)}}finishManual(h,c);return true;
 }
 if(id==='H014-009'){if(!placePiece('bone',locationKey(pos(h).x,pos(h).y),boneMax(),c.name))return true;finishManual(h,c);return true}
 if(id==='H014-014'){let pc=choosePiece('bone',h,2,c.name);if(!pc){logx(`${c.name}: no Bone Servant within 2 connections.`);return true}removePiece('bone',pc.k);pieceMap('bone')[locationKey(pos(h).x,pos(h).y)]=Number(pieceMap('bone')[locationKey(pos(h).x,pos(h).y)]||0)+1;finishManual(h,c);return true}
 if(id==='H014-019'){let p=pos(h),ks=[locationKey(p.x,p.y),...neighborRefs(p.x,p.y).map(x=>x.k)],before=pieceTotal('bone');for(const k of ks){if(pieceTotal('bone')>=boneMax())break;placePiece('bone',k,boneMax(),c.name)}if(pieceTotal('bone')===before){logx(`${c.name}: no Bone Servant could be placed.`);return true}finishManual(h,c);return true}
 if(id==='H015-020'){
   G().asc329=G().asc329||{};G().asc329.used=G().asc329.used||{};let once=`${G().campaign?.currentQuest||'quest'}:${id}`;if(G().asc329.used[once]){logx(`${c.name}: limit 1 per Quest already used.`);return true}let attacked=new Set();for(let step=0;step<2;step++){let p=pos(h),d=choose(neighborRefs(p.x,p.y),`${c.name}: move ${step+1} of up to 2`,step>0);if(!d)break;globalThis.enterHeroLocation?.(h,d.x,d.y,c.name);while(attacked.size<3){let q=choose(enemyRefsIn(d.t).filter(x=>!attacked.has(x.en)),`${c.name}: choose Enemy to Attack (${attacked.size}/3 used)`,true);if(!q)break;attacked.add(q.en);attack(h,c,q,3,0)}}if(!attacked.size)logx(`${c.name}: movement resolved with no Attack targets.`);G().asc329.used[once]=true;finishManual(h,c);return true;
 }
 if(id==='H016-009'){if(!placePiece('totem',locationKey(pos(h).x,pos(h).y),totemMax(),c.name))return true;finishManual(h,c);return true}
 if(id==='H016-014'){let pc=choosePiece('totem',h,2,c.name);if(!pc){logx(`${c.name}: no Spirit Totem within 2 connections.`);return true}removePiece('totem',pc.k);pieceMap('totem')[locationKey(pos(h).x,pos(h).y)]=Number(pieceMap('totem')[locationKey(pos(h).x,pos(h).y)]||0)+1;finishManual(h,c);return true}
 if(id==='H016-019'){if(!placePiece('totem',locationKey(pos(h).x,pos(h).y),totemMax()+1,c.name))return true;for(const who of (globalThis.partyHeroes?.()||[]).filter(x=>sameLoc(x,h)))globalThis.addHeroCondition?.(who,'Inspired');finishManual(h,c);return true}
 return false;
}

function install(){
 if(installed)return;installed=true;
 // Shared runtime Attack path: consume generic next-Attack bonuses exactly once and repair target-specific effects.
 if(typeof globalThis.runtimeHeroAttackEnemy==='function'){
  const old=globalThis.runtimeHeroAttackEnemy;
  globalThis.runtimeHeroAttackEnemy=function(h,c,q,b=0,ig=0){let s=st(h),saved=Number(s?.nextAttackBonus||0);if(s&&saved)s.nextAttackBonus=0;let add=saved;
   if(q?.en&&beastLoreBonus(q.en))add+=1;
   if(c?.id==='H005-002')add-=1;
   if(h==='Veyra'&&s?.conduitTarget===q?.en&&s?.conduitBonus){add+=Number(s.conduitBonus);s.conduitTarget=null;s.conduitBonus=0}
   if(h==='Garruk'&&s?.challengeTarget===q?.en&&s?.challengeBonus){add+=Number(s.challengeBonus);s.challengeBonus=0;s.challengeTarget=null}
   if(h==='Garruk'&&Number(s?.avatarCardUntilRound33611||0)>0&&Number(s.avatarCardUntilRound33611)>=Number(G()?.round||0))add+=3;
   if(h==='Kael'&&Number(s?.perfectFormRound33611||-1)===Number(G()?.round||0)&&String(c?.category||'')==='Attack')add+=1;
   if(c?.id==='H013-008'&&isAfflicted(q?.en))add+=1;
   if(c?.id==='H016-007'&&Number(b||0)>=3&&!beneficialAtEnemy(q))add-=1;
   let out=old.call(this,h,c,q,Number(b||0)+add,ig);
   if(h==='Lucien'&&s?.duelTarget===q?.en)moveOutAndBack(h,'Master Duelist');
   return out;
  };
 }
 // Basic Attack parity hooks are called directly by the core Basic Attack path so later wrappers cannot bypass them.
 globalThis.heroCardChooseBasicTarget33611=function(h){let s=st(h);if(h==='Kael'&&s?.connectedAttackThisTurn)return chooseEnemyWithin(h,1,'Crane Stance: choose Enemy in your Location or a connected Location');return undefined};
 globalThis.heroCardBasicAttackMods33611=function(h,en,q){let s=st(h),bonus=0,ignore=0;if(!s||!en)return{bonus,ignore};
  let savedNext=Number(s.nextAttackBonus||0),marked=enemyMarkedBonus(en)?1:0,beast=beastLoreBonus(en)?1:0;if(savedNext){bonus+=savedNext;s.nextAttackBonus=0}
  bonus+=marked+beast;
  if(h==='Garruk'){bonus+=Number(s.turnAttackBonus||0);if(Number(s.avatarCardUntilRound33611||0)>0&&Number(s.avatarCardUntilRound33611)>=Number(G()?.round||0))bonus+=3;if(s.challengeTarget===en&&s.challengeBonus){bonus+=Number(s.challengeBonus);s.challengeBonus=0;s.challengeTarget=null}}
  if(h==='Malachar'&&s.conduitTarget===en&&s.conduitBonus){bonus+=Number(s.conduitBonus);s.conduitTarget=null;s.conduitBonus=0}
  if(h==='Veyra'&&s.conduitTarget===en&&s.conduitBonus){bonus+=Number(s.conduitBonus);s.conduitTarget=null;s.conduitBonus=0}
  if(h==='Lucien'){if(s.tauntTarget===en){bonus+=Number(s.tauntBonus||0);s.tauntTarget=null;s.tauntBonus=0}if(s.duelTarget===en)bonus+=2}
  let m=globalThis.ascHeroRuntime3362?.attackMods?.(h,en,{id:'BASIC',name:'Basic Attack'});if(m){bonus+=Number(m.bonus||0);ignore=Math.max(ignore,Number(m.ignore||0))}
  return{bonus,ignore};
 };
 globalThis.heroCardBasicAttackAfter33611=function(h,en,dead,q){let s=st(h);if(!s)return;
  if(h==='Malachar'&&s.volatileAfter){s.volatileAfter=false;globalThis.damageHeroBy?.(h,1,'Volatile Magic')}
  if(h==='Lucien'&&s.openingDraw){if(s.movedTurn)globalThis.drawCardsForHero?.(h,1);s.openingDraw=false}
  if(h==='Kael'&&s.connectedAttackThisTurn)s.connectedAttackThisTurn=false;
  globalThis.ascHeroRuntime3362?.afterAttack?.(h,en,!!dead,{id:'BASIC',name:'Basic Attack'});
  if(h==='Lucien'&&s.duelTarget===en)moveOutAndBack(h,'Master Duelist');
 };
 // Action-cost flags that previously had writers but no readers.
 if(typeof globalThis.extraCardActionCost32611==='function'){
  const old=globalThis.extraCardActionCost32611;
  globalThis.extraCardActionCost32611=function(h,c,s){let cost=Number(old.apply(this,arguments));if(h==='Rowan'&&s?.freeAttackCard32526&&String(c?.category)==='Attack')cost=0;if(h==='Kael'&&Number(s?.perfectFormRound33611||-1)===Number(G()?.round||0)&&String(c?.category)==='Attack')cost=Math.max(0,cost-1);let equipmentRelated=/Equipment/i.test([c?.category,c?.traits,c?.keywords,c?.rules].filter(Boolean).join(' '));if(s?.equipmentDiscount32526&&equipmentRelated&&c?.id!=='H010-012'){cost=Math.max(0,cost-1);c._equipmentDiscount33611=true}return cost};
 }
 // Hero-card action lifecycle + dedicated fixes for cards whose old state could never resolve correctly.
 if(typeof globalThis.playExtraCard==='function'){
  const old=globalThis.playExtraCard;
  globalThis.playExtraCard=function(c){let h=globalThis.controlledHero?.(),s=st(h),id=c?.id;if(!c||!s)return old.apply(this,arguments);
   if(['H004-021','H007-016','H009-020','H011-007','H011-020','H013-006','H014-005','H014-006','H014-009','H014-014','H014-019','H014-020','H015-020','H016-009','H016-014','H016-019'].includes(id))return manualCard(h,c);
   if(id==='H010-013'&&c.speed==='Action'){
    if(!canManual(h,c))return;let who=globalThis.choosePartyHero?.((globalThis.heroesAt?.(h,true)||[]),`${c.name}: choose Hero`);if(!who)return false;let ts=st(who);if(!ts)return false;if(!finishManual(h,c))return false;ts.nextAttackBonus=(Number(ts.nextAttackBonus||0)+2);logx(`${c.name}: ${display(who)}'s next Attack this turn gains +2 Attack.`);return true;
   }
   if(h==='Malachar'&&s.manaBurnRestrictedActions33611&&String(c.category)!=='Attack'&&actions(h)<=Number(s.manaBurnRestrictedActions33611)){logx(`Mana Burn: Malachar's remaining gained Action may only be spent to play an Attack card this turn.`);return false}
   let wasIn=s.hand?.includes(c),beforeA=actions(h),savedRange=c.range,crane=h==='Kael'&&!!s.connectedAttackThisTurn&&String(c.category)==='Attack';if(crane){let rr=Number((String(c.range||'').match(/(\d+)/)||[])[1]||0);if(rr<1)c.range='Within 1 Connections'}let out;try{out=old.apply(this,arguments)}finally{if(crane)c.range=savedRange}let resolved=wasIn&&!s.hand?.includes(c);
   if(resolved&&c?._equipmentDiscount33611&&s?.equipmentDiscount32526){s.equipmentDiscount32526=0;delete c._equipmentDiscount33611;logx(`Field Workshop: ${display(h)}'s Equipment-related Action discount is consumed.`)}
   if(resolved&&id==='H012-017'){let move=Math.min(2,Number(s.nextAttackBonus||0));s.nextAttackBonus=Math.max(0,Number(s.nextAttackBonus||0)-move);s.challengeBonus=Number(s.challengeBonus||0)+move;logx(`Challenge the Strongest: +${move} is locked to the chosen Marked Enemy instead of the next unrelated Attack.`)}
   if(resolved&&id==='H012-020'){s.turnAttackBonus=0;s.avatarCardUntilRound33611=Number(G().round||0)+1;logx(`Avatar of Rage: +3 Attack and 1-Health floor are active through the end of Garruk's next turn.`)}
   if(resolved&&id==='H011-012'){s.manaBurnAttackOnly=false;s.manaBurnRestrictedActions33611=1}
   if(resolved&&h==='Malachar'&&String(c.category)==='Attack'&&s.manaBurnRestrictedActions33611)s.manaBurnRestrictedActions33611=Math.max(0,Number(s.manaBurnRestrictedActions33611)-1);
   if(resolved&&h==='Rowan'&&s.freeAttackCard32526&&String(c.category)==='Attack')s.freeAttackCard32526=false;
   if(resolved&&h==='Kael'&&Number(s.perfectFormRound33611||-1)===Number(G().round||0)&&String(c.category)==='Attack')globalThis.drawCardsForHero?.(h,1);
   if(resolved&&h==='Kael'&&s.connectedAttackThisTurn&&String(c.category)==='Attack')s.connectedAttackThisTurn=false;
   return out;
  };
 }
 // Scout Ahead's free Explore now actually bypasses the Explore Action once.
 if(typeof globalThis.explore==='function'){
  const old=globalThis.explore;globalThis.explore=async function(){let h=globalThis.controlledHero?.(),s=st(h),free=h==='Rowan'&&!!s?.freeExplore32526,oldSpend=globalThis.spendActiveAction;if(free){globalThis.spendActiveAction=()=>true;s.freeExplore32526=false}try{return await old.apply(this,arguments)}finally{if(free)globalThis.spendActiveAction=oldSpend}};
 }
 // Master Engineer: the immediate Consumable granted to each local Hero is genuinely free.
 if(typeof globalThis.itemSpendAction==='function'){
  const old=globalThis.itemSpendAction;globalThis.itemSpendAction=function(h){let s=st(h);if(s?.freeConsumable32526){s.freeConsumable32526=false;logx(`Master Engineer: ${display(h)} uses this Consumable without spending an Action.`);return true}return old.apply(this,arguments)};
 }
 // Any-damage protection/lethal windows, including non-Attack hazards and self-damage.
 if(typeof globalThis.damageHeroBy==='function'){
  const old=globalThis.damageHeroBy;globalThis.damageHeroBy=function(h,n,label='Effect'){n=Math.max(0,Number(n||0));let hp=Number(globalThis.heroCurrentHp?.(h)||0),enemyAttack=String(label)==='ENEMY ATTACK',src=currentEnemySource();
   if(h==='Garruk'&&!enemyAttack&&n>0&&spendReaction('Garruk','H012-013',`${label} would make Garruk suffer ${n} damage.`))n=Math.max(0,n-2);
   if(h==='Veyra'&&!enemyAttack&&n>0){let c=cardInHand('Veyra','H013-015');if(c&&actions('Veyra')>=Number(c.cost||0)&&confirm(`${label} would damage Veyra. Play Soul Shield?`)){globalThis.spendExtraReaction?.('Veyra',c);n=Math.max(0,n-(src&&isAfflicted(src)?3:2))}}
   if(h==='Mordren'&&!enemyAttack&&n>0){let k=locationKey(pos(h).x,pos(h).y);if(Number(pieceMap('bone')[k]||0)>0&&spendReaction(h,'H014-012',`${label} would damage Mordren. Remove a Bone Servant for Bone Shield?`)){removePiece('bone',k);n=Math.max(0,n-4)}}
   if(n>0&&!enemyAttack){for(const ally of (globalThis.partyHeroes?.()||[])){if(ally==='Elara'&&dist(pos(ally),pos(h))<=1&&spendReaction(ally,'H003-008',`${label} would make ${display(h)} suffer damage.`)){let before=n;n=Math.max(0,n-2);if(before>0&&n===0)globalThis.addHeroCondition?.(h,'Inspired');break}if(ally==='Mira'&&sameLoc(ally,h)&&spendReaction(ally,'H010-017',`${label} would make ${display(h)} suffer damage.`)){n=Math.max(0,n-2);break}if(ally==='Asha'&&sameLoc(ally,h)&&spendReaction(ally,'H016-015',`${label} would make ${display(h)} suffer damage.`)){n=Math.max(0,n-2);break}if(ally==='Mordren'){let k=locationKey(pos(h).x,pos(h).y);if(Number(pieceMap('bone')[k]||0)>0&&spendReaction(ally,'H014-013',`${label} would make ${display(h)} suffer damage where a Bone Servant is present.`)){removePiece('bone',k);n=Math.max(0,n-3);break}}}}
   hp=Number(globalThis.heroCurrentHp?.(h)||0);
   if(n>=hp&&hp>0){let saved=false;if(globalThis.isPartyHero?.('Elara')&&!globalThis.heroDefeated?.('Elara')&&dist(pos('Elara'),pos(h))<=1&&spendReaction('Elara','H003-010',`${display(h)} would be defeated by ${label}.`)){n=Math.max(0,hp-1);clearAllConditions(h);st(h).noHealEnemyTurn33611=true;saved=true;logx(`Intercession: ${display(h)} remains at 1 Health and all Conditions are removed.`)}if(!saved&&globalThis.isPartyHero?.('Vaelis')&&!globalThis.heroDefeated?.('Vaelis')&&dist(pos('Vaelis'),pos(h))<=1&&spendReaction('Vaelis','H004-011',`${display(h)} would be defeated by ${label}.`)){let oldp={...pos(h)},arc=globalThis.extraArcaneHere?.('Vaelis');n=Math.max(0,hp-1);st(h).temporalStasis33611={x:oldp.x,y:oldp.y,returnRound:Number(G().round||0)+1,draw:!!arc};setPos(h,9999,9999);saved=true;logx(`Temporal Stasis: ${display(h)} remains at 1 Health and is removed from the battlefield until the start of Vaelis's next turn.`)}if(!saved&&globalThis.isPartyHero?.('Elara')&&!globalThis.heroDefeated?.('Elara')&&spendReaction('Elara','H003-020',`${display(h)} would be defeated by ${label}.`)){n=Math.max(0,hp-1);clearAllConditions(h);let p=pos(h);globalThis.enterHeroLocation?.('Elara',p.x,p.y,'Divine Intervention');saved=true;logx(`Divine Intervention: ${display(h)} remains at 1 Health; Elara moves to that Hero's Location.`)}if(!saved&&h==='Garruk'&&!enemyAttack&&spendReaction(h,'H012-014',`${label} would reduce Garruk to 0 Health.`)){n=Math.max(0,hp-1);saved=true}}
   if(h==='Garruk'&&Number(st(h)?.avatarCardUntilRound33611||0)>0&&Number(st(h).avatarCardUntilRound33611)>=Number(G()?.round||0)&&hp>0)n=Math.min(n,Math.max(0,hp-1));
   return old.call(this,h,n,label);
  };
 }
 // Effects that used to subtract HP directly now use the shared damage trigger path.
 if(typeof globalThis.searchDamage==='function'){globalThis.searchDamage=function(h,n,label='Search'){globalThis.damageHeroBy?.(h,n,label)}}
 if(typeof globalThis.encDamageAll320==='function'){globalThis.encDamageAll320=function(n,label){for(const h of (globalThis.encHeroes320?.()||[]))globalThis.damageHeroBy?.(h,n,label)}}
 // Kael Counter Strike: after all attack prevention, a 0-damage attack can trigger the printed reaction.
 if(typeof globalThis.runtimeHeroReactionWindow==='function'){
  const old=globalThis.runtimeHeroReactionWindow;globalThis.runtimeHeroReactionWindow=async function(en,target,die,atk,raw,range){let out=await old.apply(this,arguments)||{};if(target?.id==='Kael'&&!out.cancel&&range===0){let final=Math.max(0,Number(raw||0)-Number(out.reduce||0)-Number(out.armor||0));let ep=globalThis.findE?.(en),kp=pos('Kael'),local=!!ep&&ep.x===kp.x&&ep.y===kp.y;if(final===0&&en?.hp>0&&local&&spendReaction('Kael','H009-018',`${en.name}'s Attack against Kael will deal 0 damage.`))out.counter=true}return out};
 }
 // Protective Roots blocks forced movement of a Hero in Thorne's Location.
 if(typeof globalThis.enterHeroLocation==='function'){
  const old=globalThis.enterHeroLocation;globalThis.enterHeroLocation=function(h,x,y,label='Move'){let forced=/push|pull|forced|knock|enemy/i.test(String(label));if(forced&&globalThis.isPartyHero?.('Thorne')&&sameLoc(h,'Thorne')&&spendReaction('Thorne','H007-018',`${display(h)} would be moved by ${label}.`)){logx(`Protective Roots: ${display(h)} ignores the forced movement.`);return false}return old.apply(this,arguments)};
 }
 // Standing Ovation watches the real shared kill ledger and fires once per defeated Enemy.
 function standing(hero,en){if(!en||en._standingOvation33611)return;en._standingOvation33611=true;if(globalThis.isPartyHero?.('Cassian')&&!globalThis.heroDefeated?.('Cassian')&&sameLoc(hero,'Cassian')&&spendReaction('Cassian','H008-018',`${display(hero)} Defeated ${en.name} in Cassian's Location.`)){globalThis.drawCardsForHero?.(hero,1);logx(`Standing Ovation: ${display(hero)} draws 1 card.`)}}
 if(typeof globalThis.recordKill32521==='function'){const old=globalThis.recordKill32521;globalThis.recordKill32521=function(h,en,label){let r=old.apply(this,arguments);standing(h,en);return r}}
 if(typeof globalThis.creditKill3259==='function'){const old=globalThis.creditKill3259;globalThis.creditKill3259=function(h,en,label){let r=old.apply(this,arguments);standing(h,en);return r}}
 // Healing lock from Intercession and Temporal Stasis return timing.
 if(typeof globalThis.healHeroBy==='function'){
  const old=globalThis.healHeroBy;globalThis.healHeroBy=function(h,n,label='Effect'){let s=st(h);if(s?.noHealEnemyTurn33611&&G()?.phase==='World Phase'){logx(`Intercession: ${display(h)} cannot recover Health until the current Enemy turn ends.`);return 0}return old.apply(this,arguments)};
 }
 if(typeof globalThis.endTurn==='function'){
  const old=globalThis.endTurn;globalThis.endTurn=async function(){let before=Number(G()?.round||0),r=await old.apply(this,arguments);if(Number(G()?.round||0)!==before){for(const h of (globalThis.partyHeroes?.()||[])){let s=st(h);if(!s)continue;s.noHealEnemyTurn33611=false;s.manaBurnRestrictedActions33611=0;if(s.hiddenUntilTurn32526&&Number(s.hiddenUntilTurn32526)<=Number(G().round||0)){try{globalThis.removeHeroCondition?.(h,'Hidden')}catch(_){};s.hiddenUntilTurn32526=0}let z=s.temporalStasis33611;if(z&&Number(z.returnRound)<=Number(G().round||0)){setPos(h,z.x,z.y);if(globalThis.heroCurrentHp?.(h)<=0){if(h==='Aldric')G().hp=1;else s.hp=1}else if(h==='Aldric')G().hp=1;else s.hp=1;if(z.draw)globalThis.drawCardsForHero?.(h,1);delete s.temporalStasis33611;logx(`Temporal Stasis: ${display(h)} returns with 1 Health${z.draw?' and draws 1 card':''}.`)}}}return r};
 }
 // Non-Attack enemy ability hook used by scripted enemy effects. Existing attacks stay on runtimeHeroReactionWindow.
 globalThis.heroEnemyAbilityWindow33611=function(source,targets=[],label='Enemy ability'){
  let canceled=false,src=source||currentEnemySource(),sp=src?globalThis.findE?.(src):null;
  for(const h of targets){if(globalThis.isPartyHero?.('Vaelis')&&!globalThis.heroDefeated?.('Vaelis')&&dist(pos('Vaelis'),pos(h))<=1&&spendReaction('Vaelis','H004-009',`${label} targets ${display(h)}.`)){canceled=true;if(targets.length===1&&globalThis.extraArcaneHere?.('Vaelis')&&src&&sp)directDamage({en:src,t:sp.t},2,'Spell Reflection','Vaelis');break}}
  if(!canceled&&src&&sp&&globalThis.isPartyHero?.('Cassian')&&!globalThis.heroDefeated?.('Cassian')){let cp=pos('Cassian');if(cp.x===sp.x&&cp.y===sp.y&&spendReaction('Cassian','H008-017',`${label} triggers from ${src.name} in Cassian's Location.`))canceled=true}
  if(canceled)logx(`${label}: canceled by a Hero reaction.`);return{canceled};
 };
 // Wire authored Enemy non-Attack abilities into Spell Reflection / Counter Melody.
 if(typeof globalThis.enemyStartActivation322==='function'){
  const old=globalThis.enemyStartActivation322;globalThis.enemyStartActivation322=function(en,p){let id=String(en?.id||en?.enemyId||en?.cardId||''),labels={E005:'TRIBAL BLESSING',E021:"ALPHA'S HOWL",E030:'REGENERATE',E031:'BLESSING OF THE WILD'};if(labels[id]&&globalThis.heroEnemyAbilityWindow33611(en,[],labels[id]).canceled)return;return old.apply(this,arguments)};
 }
 if(typeof globalThis.enemyAfterDamage322==='function'){
  const old=globalThis.enemyAfterDamage322;globalThis.enemyAfterDamage322=function(en,p,target,dmg){let id=String(en?.id||en?.enemyId||en?.cardId||''),labels={E011:'DIRTY TRICKS',E020:'HAMSTRING BITE',E021:'SAVAGE POUNCE',E022:'VENOM',E027:'POISON',E028:'RENDING CLAWS',E029:'CRIPPLING BITE',E032:'CRUSHING COMMAND'};if(dmg>0&&labels[id]&&globalThis.heroEnemyAbilityWindow33611(en,[target?.id].filter(Boolean),labels[id]).canceled)return;return old.apply(this,arguments)};
 }
 if(typeof globalThis.enemyEndActivation322==='function'){
  const old=globalThis.enemyEndActivation322;globalThis.enemyEndActivation322=function(en,p,target){let id=String(en?.id||en?.enemyId||en?.cardId||''),labels={E010:'CALL REINFORCEMENTS',E032:"THE KING'S LAST STAND"};if(labels[id]&&globalThis.heroEnemyAbilityWindow33611(en,[],labels[id]).canceled)return;return old.apply(this,arguments)};
 }
 // Lightweight audit surface: 323-card source count is verified externally; this reports every repaired runtime pathway in-build.
 globalThis.ascHeroCardParity33611=()=>({build:V,patched:[...PATCHED],patchedCount:PATCHED.size,battleRoarBasic:true,bloodrageSharedTrigger:true,nextAttackConsumption:true,directDamageRouted:true,dynamicBoneMax:boneMax(),dynamicTotemMax:totemMax()});
 function mark(){try{globalThis.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;let e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}catch(_){}}
 mark();setTimeout(mark,250);setTimeout(mark,1800);setTimeout(mark,5200);setTimeout(mark,8200);
 logx('3.36.11 HERO CARD PARITY: full Hero-card trigger/Attack modifier audit layer loaded.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,50));else setTimeout(install,50);setTimeout(install,1200);
})();
