/* Ascendance 3.36.2 — full L1–L12 Hero progression runtime parity
   Additive compatibility layer. Keeps L13–L16 runtime in level-progression-3360.js / level-parity-3360.js. */
(()=>{
'use strict';
const V='3.36.2';
const HARMFUL=['Stunned','Rooted','Weakened','Marked','Frightened','Burning','Poisoned','Exposed','Silenced','Disarmed','Knocked Down'];
const BENEFICIAL=['Guarded','Inspired','Regenerating','Stealth','Hidden'];
function G(){try{return typeof g!=='undefined'?g:globalThis.g}catch(_){return globalThis.g}}
function lvl(h){try{return Number(globalThis.ascLevel3360?.level?.(h)||G()?.levels?.[h]||1)}catch(_){return Number(G()?.levels?.[h]||1)}}
function St(h){try{return h==='Aldric'?{get hp(){return g.hp},set hp(v){g.hp=v},get actions(){return g.actions},set actions(v){g.actions=v},get conditions(){return g.conditions||(g.conditions=[])} }:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:runtimeHeroState(h)}catch(_){return null}}
function root(){let gg=G();if(!gg)return {};gg.heroAbilityRuntime3362=gg.heroAbilityRuntime3362||{round:{},quest:{},turn:{},buffs:{},counters:{},flags:{}};for(const k of ['round','quest','turn','buffs','counters','flags'])gg.heroAbilityRuntime3362[k]=gg.heroAbilityRuntime3362[k]||{};return gg.heroAbilityRuntime3362}
function k(h,n){return `${h}::${n}`}
function usedR(h,n){return root().round[k(h,n)]===Number(G()?.round||0)}
function markR(h,n){root().round[k(h,n)]=Number(G()?.round||0)}
function usedQ(h,n){return !!root().quest[k(h,n)]}
function markQ(h,n){root().quest[k(h,n)]=true}
function usedT(h,n){return root().turn[k(h,n)]===turnToken(h)}
function markT(h,n){root().turn[k(h,n)]=turnToken(h)}
function turnToken(h){return `${Number(G()?.round||0)}:${h}:${Number(root().counters[`turn:${h}`]||0)}`}
function display(h){try{return heroDisplayName(h)}catch(_){return h}}
function party(){try{return partyHeroes().filter(h=>isPartyHero(h)&&!heroDefeated(h))}catch(_){return []}}
function pos(h){try{return heroPos(h)}catch(_){return{x:0,y:0}}}
function same(a,b){let A=pos(a),B=pos(b);return A.x===B.x&&A.y===B.y}
function tileAt(h){let p=pos(h);return G()?.tiles?.[key(p.x,p.y)]}
function enemiesAt(h){try{return livingEnemies(tileAt(h))}catch(_){return[]}}
function chooseHero(list,label){list=(list||[]).filter(Boolean);if(!list.length)return null;if(list.length===1)return list[0];let raw=prompt(`${label}\n`+list.map((h,i)=>`${i+1}. ${display(h)}`).join('\n'));if(raw===null)return null;return list[parseInt(raw,10)-1]||null}
function chooseEnemy(opts,label){opts=(opts||[]).filter(q=>q?.en&&q.en.hp>0);if(!opts.length)return null;if(opts.length===1)return opts[0];let raw=prompt(`${label}\n`+opts.map((q,i)=>`${i+1}. ${q.en.name} — ${q.t?.name||''} (${q.en.hp} HP)`).join('\n'));if(raw===null)return null;return opts[parseInt(raw,10)-1]||null}
function enemyOpts(h,dist=0){let p=pos(h),out=[];for(const [kk,t] of Object.entries(G()?.tiles||{})){let [x,y]=kk.split(',').map(Number),d=graphDistance(p.x,p.y,x,y);if(d<=dist)for(const en of livingEnemies(t))out.push({en,t,x,y,dist:d})}return out}
function drawDiscard(h,n=1){try{drawCardsForHero(h,n);if(typeof discardOne==='function')discardOne(h)}catch(_){} }
function freeMove(h,steps=1,label='Hero Ability',ignoreEngage=true){if(globalThis.heroMayMoveFree33621?.(h)===false)return 0;let moved=0;for(let i=0;i<steps;i++){let p=pos(h),ns=neighbors(p.x,p.y).filter(n=>G()?.tiles?.[key(n.x,n.y)]);if(!ns.length)break;if(!ignoreEngage&&livingEnemies(tileAt(h)).length)break;let raw=prompt(`${label}: choose connected Location${i?` (step ${i+1}/${steps})`:''}\n`+ns.map((n,j)=>`${j+1}. ${G().tiles[key(n.x,n.y)].name}`).join('\n')+(i?'\n0. Stop':''));if(raw===null||parseInt(raw,10)===0)break;let n=ns[parseInt(raw,10)-1];if(!n)break;enterHeroLocation(h,n.x,n.y,label);moved++}return moved}
function addStatus(h,n){try{addHeroCondition(h,n)}catch(_){} }
function removeHarm(h,all=false){let s=St(h),arr=(s?.conditions||[]).map(x=>typeof x==='string'?x:x.name),xs=arr.filter(x=>HARMFUL.includes(x));if(!xs.length)return 0;let list=all?xs:[xs[0]];for(const n of list)removeHeroCondition(h,n);return list.length}
function enemyStatus(en,n){try{if(typeof addEnemyStatus==='function')addEnemyStatus(en,n);else addCond(en,n)}catch(_){try{addCond(en,n)}catch(__){}}}
function sync(){try{render()}catch(_){};try{mpScheduleState()}catch(_){} }
function spend(h,n){try{let b=heroActionCount(h);let r=spendHeroActions(h,n);return r!==false&&heroActionCount(h)<=b-n}catch(_){return false}}
function basic(h,q,label,bonus=0,ignore=0){if(!q)return false;let en=q.en,b=en.hp;try{if(typeof runtimeHeroAttackEnemy==='function'&&isRuntimeHero(h))runtimeHeroAttackEnemy(h,{name:label,rules:'',traits:'',keywords:'',id:'ABILITY'},q,bonus,ignore);else {let old=root().buffs[k(h,'tempAttack')];root().buffs[k(h,'tempAttack')]=Number(old||0)+bonus;heroBasicAttackFor(h,en,label);root().buffs[k(h,'tempAttack')]=old}}catch(e){try{heroBasicAttackFor(h,en,label)}catch(_){}}return en.hp<b}
function logA(h,n,msg=''){log(`HERO ABILITY — ${display(h)} · ${n}${msg?`: ${msg}`:''}`)}
function isEnemyDamage(label){return /enemy attack|enemy phase|enemy activation|goblin|undead|beast|raider|archer|captain|boss/i.test(String(label||''))}
function half(h){try{return heroCurrentHp(h)<=Math.ceil(heroMaxHp(h)/2)}catch(_){return false}}
function isHarm(n){return HARMFUL.includes(String(n))}
function isBen(n){return BENEFICIAL.includes(String(n))}
function quarry(){return root().flags['Rowan::Quarry']||null}
function setQuarry(en){root().flags['Rowan::Quarry']=en;logA('Rowan','Quarry',`${en.name} is Rowan's Quarry.`)}
function totemMax(){let L=lvl('Asha');return L>=7?3:L>=4?2:1}
function boneMax(){let L=lvl('Mordren');return L>=11?6:L>=9?5:L>=7?4:L>=4?3:L>=2?2:1}
function pieceCount(type){let d=G()?.asc329?.[type]||{};return Object.values(d).reduce((a,b)=>a+Number(b||0),0)}
function placeBoneParity(kk,label='Raise Servant'){let gg=G();gg.asc329=gg.asc329||{};gg.asc329.bone=gg.asc329.bone||{};if(pieceCount('bone')>=boneMax()){log(`${label}: Mordren is at his Bone Servant maximum (${boneMax()}).`);return false}gg.asc329.bone[kk]=(gg.asc329.bone[kk]||0)+1;log(`${label}: Bone Servant placed at ${gg.tiles?.[kk]?.name||kk}. (${pieceCount('bone')}/${boneMax()})`);return true}
function removeBoneParity(kk){let b=G()?.asc329?.bone;if(!b||!b[kk])return false;b[kk]--;if(b[kk]<=0)delete b[kk];return true}
function totemKeys(){return Object.keys(G()?.asc329?.totem||{}).filter(x=>Number(G().asc329.totem[x])>0)}
function vineKeys(){return Object.entries(G()?.tiles||{}).filter(([_,t])=>t?.vineTerrain32526||t?.worldroot3362).map(([x])=>x)}
function heroesAtKey(kk){let [x,y]=kk.split(',').map(Number);return party().filter(h=>{let p=pos(h);return p.x===x&&p.y===y})}
function connectedKeys(h){let p=pos(h);return [key(p.x,p.y),...neighbors(p.x,p.y).map(n=>key(n.x,n.y)).filter(x=>G()?.tiles?.[x])]}

// ---------- activated L1–L12 abilities ----------
const ACT={
 'Aldric':{
  'Living Bulwark':()=>timedDefense('Aldric','Living Bulwark',1,{enemyReduce:2,noForced:true},'nextTurn'),
  'Unbreakable Line':()=>timedDefense('Aldric','Unbreakable Line',1,{armor:2,noForced:true,floorOnce:true},'nextTurn'),
  'Last Citadel':()=>timedDefense('Aldric','Last Citadel',1,{allyArmor:3,noForced:true,lastCitadel:true},'nextTurn')
 },
 'Elara':{
  'Radiant Salvation':()=>{if(!consumeQuestAction('Elara','Radiant Salvation',1))return false;let hs=party().filter(h=>same(h,'Elara')).slice(0,2);for(const h of hs){healHeroBy(h,3,'Radiant Salvation');removeHarm(h,false)}logA('Elara','Radiant Salvation',`${hs.map(display).join(', ')} are restored.`);sync();return true},
  'Radiant Ascendance':()=>{if(!consumeQuestAction('Elara','Radiant Ascendance',1))return false;for(const h of party().filter(h=>same(h,'Elara'))){healHeroBy(h,4,'Radiant Ascendance');removeHarm(h,true);addStatus(h,'Inspired')}sync();return true},
  'Dawn Without End':()=>{if(!consumeQuestAction('Elara','Dawn Without End',1))return false;for(const h of party()){healHeroBy(h,4,'Dawn Without End');if(same(h,'Elara')){removeHarm(h,true);addStatus(h,'Guarded');addStatus(h,'Inspired')}}sync();return true}
 },
 'Vaelis':{
  'Time Fracture':()=>{if(usedQ('Vaelis','Time Fracture'))return false;markQ('Vaelis','Time Fracture');let s=St('Vaelis');s.actions+=2;root().buffs[k('Vaelis','TimeFractureActions')]=2;logA('Vaelis','Time Fracture','gains 2 temporary Actions for Spells or Move Actions.');sync();return true},
  'Master of Time':()=>{if(usedQ('Vaelis','Master of Time'))return false;markQ('Vaelis','Master of Time');let s=St('Vaelis');s.actions+=2;root().buffs[k('Vaelis','MasterTime')]=true;logA('Vaelis','Master of Time','takes an immediate 2-Action extra turn.');sync();return true}
 },
 'Rowan':{
  'Perfect Quarry':()=>chooseQuarryAbility('Perfect Quarry',false),
  'No Escape':()=>{if(usedQ('Rowan','No Escape'))return false;let os=enemyOpts('Rowan',2);if(!os.length)return false;markQ('Rowan','No Escape');for(const q of os.slice(0,3)){enemyStatus(q.en,'Marked');q.en.noEscapeRow3362=G().round}logA('Rowan','No Escape',`marks ${Math.min(3,os.length)} Enemies.`);sync();return true},
  'Legendary Quarry':()=>chooseQuarryAbility('Legendary Quarry',true),
  'The Last Arrow':()=>{if(usedQ('Rowan','The Last Arrow'))return false;let q=quarry(),f=findE(q);if(!q||!f)return false;markQ('Rowan','The Last Arrow');let before=q.hp;runtimeHeroAttackEnemy('Rowan',{name:'The Last Arrow',rules:'',traits:'',keywords:'',id:'ABILITY'}, {en:q,t:f.t},5,99);if(before>0&&q.hp<=0){drawCardsForHero('Rowan',3);try{discardOne('Rowan')}catch(_){}}sync();return true}
 },
 'Seraphine':{
  'Sacred Stand':()=>{if(!consumeQuestAction('Seraphine','Sacred Stand',1))return false;for(const h of party().filter(x=>same(x,'Seraphine'))){healHeroBy(h,2,'Sacred Stand');addStatus(h,'Guarded');removeHarm(h,false)}sync();return true},
  'Oath Eternal':()=>{if(!consumeQuestAction('Seraphine','Oath Eternal',1))return false;root().buffs[k('Seraphine','Oath Eternal')]={round:G().round,until:G().round+1};for(const h of party().filter(x=>same(x,'Seraphine')))addStatus(h,'Guarded');logA('Seraphine','Oath Eternal','protects Heroes in her Location until her next turn.');sync();return true}
 },
 'Thorne':{
  "Nature's Dominion":()=>natureDominion(),
  'Worldroot':()=>worldrootBurst(),
  'Avatar of the Wilds':()=>{if(!consumeQuestAction('Thorne','Avatar of the Wilds',1))return false;root().buffs[k('Thorne','Avatar')]=G().round+1;logA('Thorne','Avatar of the Wilds','Vine Locations become mutually connected; Heroes there Regenerate and Enemies are Rooted.');sync();return true},
  'Worldroot Awakening':()=>worldrootAwakening()
 },
 'Cassian':{
  'Legendary Performance':()=>{if(!consumeQuestAction('Cassian','Legendary Performance',1))return false;let others=party().filter(h=>h!=='Cassian'&&same(h,'Cassian'));for(const h of others){addStatus(h,'Inspired');drawCardsForHero(h,1)}let x=chooseHero(others,'Legendary Performance: choose one Hero to gain 1 Action');if(x)St(x).actions++;sync();return true},
  'Song of Ascendance':()=>{if(!consumeQuestAction('Cassian','Song of Ascendance',1))return false;for(const h of party().filter(x=>same(x,'Cassian'))){if(h==='Cassian')continue;addStatus(h,'Inspired');drawCardsForHero(h,2);try{discardOne(h)}catch(_){}St(h).actions++}sync();return true},
  'Finale of Heroes':()=>{if(!consumeQuestAction('Cassian','Finale of Heroes',1))return false;for(const h of party()){if(h==='Cassian')continue;drawCardsForHero(h,2);addStatus(h,'Inspired');St(h).actions++}sync();return true}
 },
 'Kael':{
  'One With the Wind':()=>tempMoves('Kael','One With the Wind',3),
  'Wind Beyond Form':()=>{if(usedQ('Kael','Wind Beyond Form'))return false;markQ('Kael','Wind Beyond Form');root().buffs[k('Kael','Wind Beyond Form')]=G().round;logA('Kael','Wind Beyond Form','ignores Engagement/extra movement costs this turn; first Attack after each Move gains +1.');sync();return true},
  'Perfect Motion':()=>{if(usedQ('Kael','Perfect Motion'))return false;markQ('Kael','Perfect Motion');St('Kael').actions+=3;root().buffs[k('Kael','Perfect Motion Actions')]=3;logA('Kael','Perfect Motion','gains 3 temporary Actions for Move/Basic Attack and ignores Engagement this turn.');sync();return true},
  'Thousand-Step Strike':()=>thousandStep()
 },
 'Mira':{
  'Perfect Invention':()=>{if(usedQ('Mira','Perfect Invention'))return false;markQ('Mira','Perfect Invention');root().flags[k('Mira','Perfect Invention Armed')]=true;logA('Mira','Perfect Invention','the next eligible Item/Equipment/Gadget effect this Quest is duplicated.');sync();return true},
  'Supreme Artificer':()=>{if(usedQ('Mira','Supreme Artificer'))return false;markQ('Mira','Supreme Artificer');root().round[k('Mira','Masterwork')]=0;logA('Mira','Supreme Artificer','refreshes one once-per-Round Masterwork trigger.');sync();return true},
  'Masterwork Engine':()=>miraMode('Masterwork Engine',1),
  'Impossible Device':()=>miraMode('Impossible Device',1)
 },
 'Malachar':{
  'Elemental Apotheosis':()=>{if(!consumeQuestAction('Malachar','Elemental Apotheosis',1))return false;root().buffs[k('Malachar','Elemental Apotheosis')]=G().round+1;logA('Malachar','Elemental Apotheosis','damaging cards gain +2; may be Fire/Lightning; self-damage cannot reduce him below 1.');sync();return true}
 },
 'Veyra':{
  'Queen of Curses':()=>curseArea('Queen of Curses',['Weakened','Marked'],2),
  'Curse Cascade':()=>curseArea('Curse Cascade',['Weakened','Marked'],1,true),
  'Malison Eternal':()=>malison(),
  'Curse of the Last Name':()=>{if(usedQ('Veyra','Curse of the Last Name'))return false;let q=chooseEnemy(enemyOpts('Veyra',2),'Curse of the Last Name: choose Enemy');if(!q)return false;markQ('Veyra','Curse of the Last Name');q.en.curseLastName3362=true;q.en.armorMod3362=(q.en.armorMod3362||0)-2;logA('Veyra','Curse of the Last Name',`${q.en.name} suffers -2 Armor for the Quest.`);sync();return true}
 },
 'Mordren':{
  'Army of the Grave':()=>armyGrave(),
  'Lord of the Dead':()=>lordDead(),
  'Death March':()=>deathMarch()
 },
 'Lucien':{
  'Perfect Duel':()=>duelAbility('Perfect Duel'),
  'Blade Dancer':()=>{if(usedQ('Lucien','Blade Dancer'))return false;markQ('Lucien','Blade Dancer');root().buffs[k('Lucien','Blade Dancer')]=G().round;logA('Lucien','Blade Dancer','after up to two Attacks this turn, may free Move; next melee after each gains +2.');sync();return true},
  'Uncatchable Legend':()=>{if(usedQ('Lucien','Uncatchable Legend'))return false;markQ('Lucien','Uncatchable Legend');root().buffs[k('Lucien','Uncatchable Legend')]=G().round;logA('Lucien','Uncatchable Legend','free Move after each Attack; first three Attacks gain +1.');sync();return true},
  'One Against the World':()=>{if(usedQ('Lucien','One Against the World'))return false;markQ('Lucien','One Against the World');root().buffs[k('Lucien','One Against the World')]=G().round;logA('Lucien','One Against the World','isolated melee Attacks gain +3 and ignore 2 Armor, then Lucien may free Move.');sync();return true}
 },
 'Asha':{
  'Call of the Ancestors':()=>ashaArea('Call of the Ancestors',2,false),
  'Ancestral Convergence':()=>ashaArea('Ancestral Convergence',2,true),
  'Voice of the Ancestors':()=>ashaArea('Voice of the Ancestors',3,false,1,true),
  'The Spirits Answer':()=>spiritsAnswer()
 }
};
function consumeQuestAction(h,n,cost){if(usedQ(h,n))return false;if(cost&&!spend(h,cost))return false;markQ(h,n);return true}
function timedDefense(h,n,cost,data){if(!consumeQuestAction(h,n,cost))return false;root().buffs[k(h,n)]={...data,round:G().round,active:true};logA(h,n,'active until the start of the next turn.');sync();return true}
function tempMoves(h,n,steps){if(usedQ(h,n))return false;markQ(h,n);freeMove(h,steps,n,true);sync();return true}
function chooseQuarryAbility(n,legendary){if(usedQ('Rowan',n))return false;let q=chooseEnemy(enemyOpts('Rowan',2),`${n}: choose Rowan's Quarry`);if(!q)return false;markQ('Rowan',n);setQuarry(q.en);if(legendary)q.en.legendaryQuarry3362=true;sync();return true}
function natureDominion(){if(usedQ('Thorne',"Nature's Dominion"))return false;markQ('Thorne',"Nature's Dominion");for(const kk of connectedKeys('Thorne')){let t=G().tiles[kk];t.vineTerrain32526=true;for(const e of livingEnemies(t))enemyStatus(e,'Rooted');for(const h of heroesAtKey(kk))addStatus(h,'Regenerating')}logA('Thorne',"Nature's Dominion",'Nature surges through Thorne and connected Locations.');sync();return true}
function worldrootBurst(){if(usedQ('Thorne','Worldroot'))return false;markQ('Thorne','Worldroot');for(const kk of connectedKeys('Thorne').slice(0,3)){G().tiles[kk].vineTerrain32526=true;for(const h of heroesAtKey(kk))addStatus(h,'Regenerating')}logA('Thorne','Worldroot','places Vine Terrain in up to three Locations.');sync();return true}
function worldrootAwakening(){if(!consumeQuestAction('Thorne','Worldroot Awakening',1))return false;let p=pos('Thorne'),kk=key(p.x,p.y);G().tiles[kk].worldroot3362=true;G().tiles[kk].vineTerrain32526=true;logA('Thorne','Worldroot Awakening',`${G().tiles[kk].name} becomes a Worldroot for this Quest.`);sync();return true}
function thousandStep(){if(usedQ('Kael','Thousand-Step Strike'))return false;markQ('Kael','Thousand-Step Strike');let hit=new Set;for(let i=0;i<4;i++){freeMove('Kael',1,'Thousand-Step Strike',true);let opts=enemyOpts('Kael',0).filter(q=>!hit.has(q.en));let q=chooseEnemy(opts,'Thousand-Step Strike: choose Enemy for free Basic Attack');if(q){hit.add(q.en);basic('Kael',q,'Thousand-Step Strike')}}sync();return true}
function miraMode(n,cost){if(!consumeQuestAction('Mira',n,cost))return false;let modes=n==='Impossible Device'?['damage','healing','movement','protection']:['offense','defense','support'];let raw=prompt(`${n}: choose mode\n`+modes.map((x,i)=>`${i+1}. ${x}`).join('\n'));let mode=modes[parseInt(raw,10)-1]||modes[0];root().flags[k('Mira',n)]=mode;logA('Mira',n,`${mode} mode selected for the Quest.`);sync();return true}
function curseArea(n,statuses,dist,rootOne=false){if(usedQ('Veyra',n))return false;let os=enemyOpts('Veyra',dist);if(!os.length)return false;markQ('Veyra',n);for(const q of os)for(const s of statuses)enemyStatus(q.en,s);if(rootOne&&os.length){let q=chooseEnemy(os,`${n}: choose one Enemy to Root`);if(q)enemyStatus(q.en,'Rooted')}sync();return true}
function malison(){if(!consumeQuestAction('Veyra','Malison Eternal',1))return false;let os=enemyOpts('Veyra',1).slice(0,3),opts=['Weakened','Marked','Rooted'];for(const q of os){let raw=prompt(`Malison Eternal — ${q.en.name}: choose harmful Status\n1. Weakened\n2. Marked\n3. Rooted`);enemyStatus(q.en,opts[parseInt(raw,10)-1]||'Weakened');q.en.malisonIgnoreArmor3362=true}sync();return true}
function armyGrave(){if(usedQ('Mordren','Army of the Grave'))return false;markQ('Mordren','Army of the Grave');for(const kk of connectedKeys('Mordren')){if(pieceCount('bone')>=boneMax())break;placeBoneParity(kk,'Army of the Grave')}root().buffs[k('Mordren','Army of the Grave')]=G().round+1;sync();return true}
function lordDead(){if(!consumeQuestAction('Mordren','Lord of the Dead',1))return false;let p=pos('Mordren'),kk=key(p.x,p.y);while(pieceCount('bone')<boneMax())placeBoneParity(kk,'Lord of the Dead');root().buffs[k('Mordren','Lord of the Dead')]=G().round+1;sync();return true}
function deathMarch(){if(!consumeQuestAction('Mordren','Death March',1))return false;let bones=Object.entries(G()?.asc329?.bone||{}).flatMap(([kk,n])=>Array(Number(n||0)).fill(kk));for(const kk of bones){let t=G().tiles[kk],en=livingEnemies(t)[0];if(en){let dmg=2+(lvl('Mordren')>=6?1:0);en.hp=Math.max(0,en.hp-dmg);log(`Death March: Bone Servant deals ${dmg} damage to ${en.name}.`);if(en.hp<=0){t.enemies=t.enemies.filter(e=>e!==en);if(pieceCount('bone')<boneMax())placeBoneParity(kk,'Death March')}}}sync();return true}
function duelAbility(n){if(usedQ('Lucien',n))return false;let q=chooseEnemy(enemyOpts('Lucien',0),`${n}: choose duel target`);if(!q)return false;markQ('Lucien',n);root().flags[k('Lucien','Duel Target')]=q.en;root().buffs[k('Lucien',n)]=G().round+1;logA('Lucien',n,`${q.en.name} is locked in single combat.`);sync();return true}
function ashaArea(n,heal,totemsOnly=false,cost=0,strong=false){if(usedQ('Asha',n))return false;if(cost&&!spend('Asha',cost))return false;markQ('Asha',n);let keys=totemsOnly?[key(pos('Asha').x,pos('Asha').y),...totemKeys()]:connectedKeys('Asha');keys=[...new Set(keys)];for(const kk of keys){for(const h of heroesAtKey(kk)){healHeroBy(h,heal,n);addStatus(h,'Inspired');if(strong)addStatus(h,'Guarded')}for(const e of livingEnemies(G().tiles[kk]))enemyStatus(e,'Weakened')}sync();return true}
function spiritsAnswer(){if(!consumeQuestAction('Asha','The Spirits Answer',1))return false;for(const kk of totemKeys())for(const h of heroesAtKey(kk)){if(lvl('Asha')>=5)drawCardsForHero(h,1);addStatus(h,'Guarded');addStatus(h,'Inspired')}sync();return true}

// ---------- event hooks ----------
function incomingDamage(h,n,label){let amount=Number(n||0),L=lvl(h),enemy=isEnemyDamage(label),r=root();if(amount<=0)return amount;
 // Garruk prevention/last stand
 if(h==='Garruk'){
  if(L>=5&&isHarm(String(label))&&!usedR(h,'Unstoppable')){markR(h,'Unstoppable');return 0}
  if(L>=7&&half(h)&&!usedR(h,'Fury Sustained')){markR(h,'Fury Sustained');amount=Math.max(0,amount-1)}
  if(r.buffs[k(h,"Titan's Rage")]===G().round||r.buffs[k(h,'Unbreakable Rage')]===G().round)amount=Math.max(0,amount-(r.buffs[k(h,'Unbreakable Rage')]===G().round?3:2));
  if(L>=12&&!usedQ(h,'Unbreakable Rage')&&heroCurrentHp(h)>0&&heroCurrentHp(h)-amount<=0&&confirm('Unbreakable Rage: remain at 1 Health and enter Unbreakable Rage?')){markQ(h,'Unbreakable Rage');r.buffs[k(h,'Unbreakable Rage')]=G().round;amount=Math.max(0,heroCurrentHp(h)-1);logA(h,'Unbreakable Rage','Garruk remains at 1 Health.')}
 }
 // Aldric defensive actives / Last Bastion
 if(enemy&&same(h,'Aldric')){
  for(const nme of ['Living Bulwark','Unbreakable Line','Last Citadel']){let b=r.buffs[k('Aldric',nme)];if(b?.active){amount=Math.max(0,amount-Number(b.enemyReduce||0))}}
  if(L>=6&&!usedQ('Aldric','Last Bastion')&&heroCurrentHp(h)-amount<=0&&confirm(`Last Bastion: keep ${display(h)} at 1 Health?`)){markQ('Aldric','Last Bastion');amount=Math.max(0,heroCurrentHp(h)-1);logA('Aldric','Last Bastion',`${display(h)} remains at 1 Health.`);if(L>=7){let x=chooseHero(party().filter(x=>x!==h&&same(x,'Aldric')),'Fortress Commander: choose Hero to gain Guarded');if(x){addStatus(x,'Guarded');markR('Aldric','Fortress Commander')}}}
 }
 // Elara Miracle
 if(L>=6&&same(h,'Elara')&&h!=='Elara'&&!usedQ('Elara','Miracle')&&heroCurrentHp(h)-amount<=0&&confirm(`Miracle: return ${display(h)} at 3 Health instead of being Defeated?`)){markQ('Elara','Miracle');amount=Math.max(0,heroCurrentHp(h)-3);logA('Elara','Miracle',`${display(h)} remains at 3 Health.`)}
 // Seraphine floors/protection
 if(enemy&&same(h,'Seraphine')){
  if(L>=6&&heroHasCondition('Seraphine','Guarded'))amount=Math.max(0,amount-1);
  if(L>=9&&h!=='Seraphine'&&heroHasCondition('Seraphine','Guarded')&&!usedR('Seraphine','Consecrated Bulwark')){markR('Seraphine','Consecrated Bulwark');amount=Math.max(0,amount-2)}
  if(L>=6&&!usedQ('Seraphine','Unbreakable Oath')&&heroCurrentHp(h)-amount<=0&&confirm(`Unbreakable Oath: keep ${display(h)} at 1 Health?`)){markQ('Seraphine','Unbreakable Oath');amount=Math.max(0,heroCurrentHp(h)-1);addStatus(h,'Guarded');removeHarm(h,false)}
  let oe=r.buffs[k('Seraphine','Oath Eternal')];if(oe&&heroCurrentHp(h)-amount<=0)amount=Math.max(0,heroCurrentHp(h)-1);
  if(L>=12&&!usedQ('Seraphine','Immortal Oath')&&heroCurrentHp(h)-amount<=0&&confirm(`Immortal Oath: set ${display(h)} to 3 Health?`)){markQ('Seraphine','Immortal Oath');amount=Math.max(0,heroCurrentHp(h)-3);removeHarm(h,false);let sh=Math.min(2,heroCurrentHp('Seraphine'));if(h!=='Seraphine'&&sh>0)try{_damage('Seraphine',sh,'Immortal Oath — unavoidable cost')}catch(_){} }
 }
 // Thorne Elder Canopy
 if(enemy&&L>=11&&vineKeys().includes(key(pos(h).x,pos(h).y))&&!usedR(h,'Elder Canopy')){markR(h,'Elder Canopy');amount=Math.max(0,amount-1)}
 return amount}
let _damage=null;
function afterDamage(h,dealt,label){let L=lvl(h),r=root();if(dealt<=0)return;
 if(h==='Garruk'){
  // 3.36.11: the historical H012 layer also stored bloodrageBonus. Keep one authoritative Bloodrage buff here.
  let legacy=St(h);if(legacy){legacy.bloodrageBonus=0;legacy.bloodrageRound=G().round}
  let b=L>=4?3:2;if(!usedR(h,'Bloodrage')){markR(h,'Bloodrage');r.buffs[k(h,'Bloodrage')]=b;logA(h,L>=4?'Greater Bloodrage':'Bloodrage',`next Attack gains +${b}.`)}
  if(L>=6&&!usedQ(h,'Avatar of Fury')&&confirm('Avatar of Fury: activate after taking damage?')){markQ(h,'Avatar of Fury');r.buffs[k(h,'Avatar of Fury')]=G().round+1;logA(h,'Avatar of Fury','Attacks gain +2 until next turn and Garruk cannot be reduced below 1 by further damage.')}
  if(L>=8&&!usedQ(h,'Unchained Rage')&&confirm('Unchained Rage: activate after taking damage?')){markQ(h,'Unchained Rage');r.buffs[k(h,'Unchained Rage')]=G().round+1;logA(h,'Unchained Rage','Attacks gain +3 until next turn.')}
  if(L>=10&&!usedQ(h,"Titan's Rage")&&confirm("Titan's Rage: activate after taking damage?")){markQ(h,"Titan's Rage");r.buffs[k(h,"Titan's Rage")]=G().round;logA(h,"Titan's Rage",'Attacks gain +4 and Enemy Attack damage is reduced.')}
 }
 if(h==='Aldric'&&lvl('Aldric')>=5&&isEnemyDamage(label)&&!usedR('Aldric','Counterstrike')&&heroActionCount('Aldric')>=1){let q=enemyOpts('Aldric',0)[0];if(q&&confirm(`Counterstrike: spend 1 Action to Basic Attack ${q.en.name}?`)){if(spend('Aldric',1)){markR('Aldric','Counterstrike');basic('Aldric',q,'Counterstrike')}}}
}
function attackMods(h,en,c){let L=lvl(h),r=root(),bonus=0,ignore=0;
 if(h==='Rowan'){
  let q=quarry();if(q===en){if(L>=6)ignore=Math.max(ignore,1);if(L>=7)bonus++;if(L>=9&&!usedR(h,'Apex Pursuit Attack')){markR(h,'Apex Pursuit Attack');bonus+=2}if(L>=10){bonus+=2;ignore=Math.max(ignore,2)}if(L>=11)ignore=Math.max(ignore,2)}
  if(en?.noEscapeRow3362===G().round&&!en.noEscapeHit3362){en.noEscapeHit3362=true;bonus+=2}
 }
 if(h==='Garruk'){
  let bb=Number(r.buffs[k(h,'Bloodrage')]||0);if(bb){bonus+=bb;delete r.buffs[k(h,'Bloodrage')]}
  if(L>=3&&half(h)&&!usedT(h,'Pain into Power')){markT(h,'Pain into Power');bonus++}
  if(r.buffs[k(h,'Avatar of Fury')])bonus+=2;if(r.buffs[k(h,'Unchained Rage')])bonus+=3;if(r.buffs[k(h,"Titan's Rage")]===G().round)bonus+=4;if(r.buffs[k(h,'Unbreakable Rage')]===G().round)bonus+=5;
  if(r.buffs[k(h,'Warpath Attack')]){bonus+=1;delete r.buffs[k(h,'Warpath Attack')]}
 }
 if(h==='Veyra'){
  let s=St(h);if(s?.hexTarget===en){bonus+=L>=4?3:2;s.hexTarget=null;s.hexBonus=0}
  if(en?.malisonIgnoreArmor3362)ignore=Math.max(ignore,2)
 }
 if(h==='Lucien'){
  let p=pos(h),q=findE(en),isolated=enemiesAt(h).filter(e=>e.hp>0).length===1;
  let s=St(h);if(s?.nextAttackBonus){bonus+=s.nextAttackBonus;s.nextAttackBonus=0}
  if(L>=3&&isolated&&!usedT(h,'Single Combat')){markT(h,'Single Combat');bonus+=2}
  if(L>=9&&isolated&&!usedR(h,'Perfect Tempo')&&s?.movedTurn){markR(h,'Perfect Tempo');bonus+=2;ignore=Math.max(ignore,1)}
  if(L>=11&&isolated&&!usedR(h,'Perfect Duelist')){markR(h,'Perfect Duelist');bonus+=2}
  if(r.buffs[k(h,'One Against the World')]===G().round&&isolated){bonus+=3;ignore=Math.max(ignore,2)}
  if(r.buffs[k(h,'Uncatchable Legend')]===G().round){let n=Number(r.counters[k(h,'Uncatchable attacks')]||0);if(n<3){bonus++;r.counters[k(h,'Uncatchable attacks')]=n+1}}
  let duel=r.flags[k(h,'Duel Target')];if(duel===en&&r.buffs[k(h,'Perfect Duel')])bonus+=3
 }
 if(h==='Kael'){
  let s=St(h);if(s?.nextAttackBonus){bonus+=s.nextAttackBonus;s.nextAttackBonus=0}
  if(L>=7&&s?.movedTurn)ignore=Math.max(ignore,1);if(L>=9&&s?.movedTurn){bonus++;ignore=Math.max(ignore,1)};if(L>=11&&Number(r.counters[k(h,'movesTurn')]||0)>=2){bonus+=2;ignore=Math.max(ignore,2)}
 }
 if(h==='Malachar'&&r.buffs[k(h,'Elemental Apotheosis')])bonus+=2;
 if(h==='Asha'){
  let kk=key(pos(h).x,pos(h).y);if(Number(G()?.asc329?.totem?.[kk]||0)>0&&!usedR(h,'Totemic Presence Attack')){markR(h,'Totemic Presence Attack');bonus+=1}
 }
 return{bonus,ignore}
}
function afterAttack(h,en,dead,c){let L=lvl(h),r=root();
 if(h==='Rowan'&&quarry()===en&&L>=7&&!usedR(h,'Relentless Hunter')&&en.hp<=(en.maxHp||999)){markR(h,'Relentless Hunter');if(confirm('Relentless Hunter: move 1 connection without spending an Action?'))freeMove(h,1,'Relentless Hunter',true)}
 if(h==='Garruk'&&dead){if(L>=2&&!usedR(h,'Reckless Momentum')){markR(h,'Reckless Momentum');if(confirm('Reckless Momentum: free Move?'))freeMove(h,1,'Reckless Momentum',true)}if(L>=9&&!usedR(h,'Relentless Fury')&&half(h)){markR(h,'Relentless Fury');let q=chooseEnemy(enemyOpts(h,0),'Relentless Fury: choose another Enemy');if(q)basic(h,q,'Relentless Fury')}if(L>=11&&!usedR(h,'Warpath Eternal')){markR(h,'Warpath Eternal');healHeroBy(h,1,'Warpath Eternal');r.buffs[k(h,'Warpath Attack')]=1}}
 if(h==='Veyra'&&dead&&L>=3&&(en?.conditions||[]).some(x=>HARMFUL.includes(x))&&!usedR(h,'Soul Siphon')){markR(h,'Soul Siphon');if(confirm('Soul Siphon: OK = recover 1 Health; Cancel = draw 1 card'))healHeroBy(h,1,'Soul Siphon');else drawCardsForHero(h,1)}
 if(h==='Lucien'){
  if(L>=2&&!usedR(h,'Fancy Footwork')&&confirm("Fancy Footwork: free Move after dealing damage?")){markR(h,'Fancy Footwork');freeMove(h,1,'Fancy Footwork',true)}
  if(r.buffs[k(h,'Uncatchable Legend')]===G().round)freeMove(h,1,'Uncatchable Legend',true);
  if(r.buffs[k(h,'One Against the World')]===G().round)freeMove(h,1,'One Against the World',true)
 }
 if(h==='Kael'){
  let s=St(h);let max=lvl(h)>=4?2:1;let n=Number(r.counters[k(h,'Perfect Flow')]+0);if(n<max&&!livingEnemies(tileAt(h)).length&&confirm('Perfect Flow: free Move after Attack?')){r.counters[k(h,'Perfect Flow')]=n+1;freeMove(h,1,'Perfect Flow',true);s.nextAttackBonus=(s.nextAttackBonus||0)+1}
 }
 if(h==='Mordren'&&dead){let p=findE(en),kk=p?key(p.x,p.y):key(pos(h).x,pos(h).y),ms=St(h);if(ms?.raiseRound!==G().round&&!usedR(h,'Raise Servant')){markR(h,'Raise Servant');ms.raiseRound=G().round;placeBoneParity(kk,'Raise Servant')}if(L>=11&&pieceCount('bone')>0){let t=G().tiles[kk],q=livingEnemies(t)[0];if(q){q.hp=Math.max(0,q.hp-1);logA(h,'Grave Sovereign',`${q.name} suffers 1 damage.`)}}}
}
function onEnter(h,from,to,label){let L=lvl(h),r=root(),kk=key(to.x,to.y);
 if(h==='Kael'||h==='Lucien'){let s=St(h);if(s){s.movedTurn=true;r.counters[k(h,'movesTurn')]=Number(r.counters[k(h,'movesTurn')]||0)+1;if(h==='Lucien'){let max=L>=4?2:1,n=Number(r.counters[k(h,'Tempo')]+0);if(n<max){r.counters[k(h,'Tempo')]=n+1;s.nextAttackBonus=(s.nextAttackBonus||0)+1}}}}
 if(isPartyHero('Thorne')&&same(h,'Thorne')&&!usedR('Thorne','Wild Growth')){if(confirm(`Wild Growth: give ${display(h)} Regenerating?`)){markR('Thorne','Wild Growth');addStatus(h,'Regenerating');if(L>=1)root().flags[k(h,'Wild Growth Boost')]=true}}
 if(isPartyHero('Thorne')&&vineKeys().includes(kk)&&lvl('Thorne')>=6&&!usedT(h,'Living Wilds Draw')){markT(h,'Living Wilds Draw');drawCardsForHero(h,1)}
 if(isPartyHero('Thorne')&&G()?.tiles?.[kk]?.worldroot3362&&!usedQ(h,'Worldroot Entry')){markQ(h,'Worldroot Entry');healHeroBy(h,2,'Worldroot Awakening')}
 if(isPartyHero('Asha')&&Number(G()?.asc329?.totem?.[kk]||0)>0&&lvl('Asha')>=5&&!usedR('Asha',`Spirit Passage:${h}`)){markR('Asha',`Spirit Passage:${h}`);drawCardsForHero(h,1);logA('Asha','Spirit Passage',`${display(h)} draws 1 card.`)}
}
function statusApplied(h,n){let L=lvl(h),r=root();
 if(isPartyHero('Asha')&&same(h,'Asha')&&isBen(n)&&L>=3&&!usedR('Asha','Ancestral Aid')){markR('Asha','Ancestral Aid');healHeroBy(h,1,'Ancestral Aid')}
 let kk=key(pos(h).x,pos(h).y);if(isPartyHero('Asha')&&Number(G()?.asc329?.totem?.[kk]||0)>0&&isBen(n)){
  if(lvl('Asha')>=7&&!usedR('Asha','Spirit Chorus')){markR('Asha','Spirit Chorus');healHeroBy(h,1,'Spirit Chorus')}
  if(lvl('Asha')>=9&&!usedR('Asha','Spirit Conclave')){markR('Asha','Spirit Conclave');drawDiscard(h,1)}
 }
 if(isPartyHero('Seraphine')&&n==='Guarded'&&lvl('Seraphine')>=11&&same(h,'Seraphine')&&!usedR('Seraphine','Sanctified Vanguard')){let x=chooseHero(party().filter(z=>z!==h&&same(z,'Seraphine')),'Sanctified Vanguard: choose another Hero to gain Guarded');if(x){markR('Seraphine','Sanctified Vanguard');addStatus(x,'Guarded')}}
}
function onEnemyStatus(en,n){let L=lvl('Veyra');if(!isPartyHero('Veyra')||!isHarm(n))return;let vp=pos('Veyra'),ep=findE(en);if(!ep||ep.x!==vp.x||ep.y!==vp.y)return;let s=St('Veyra');if(!usedR('Veyra','Malefic Hex')){markR('Veyra','Malefic Hex');s.hexTarget=en;s.hexBonus=L>=4?3:2;logA('Veyra',L>=4?'Greater Malefic Hex':'Malefic Hex',`next Attack against ${en.name} gains +${s.hexBonus}.`)}if(L>=7&&!usedR('Veyra','Hexmaster')){markR('Veyra','Hexmaster');enemyStatus(en,'Marked')}if(L>=9&&!usedR('Veyra','Doomweaver')){let os=enemyOpts('Veyra',0).filter(q=>q.en!==en);let q=os[0];if(q&&confirm(`Doomweaver: copy ${n} to ${q.en.name}?`)){markR('Veyra','Doomweaver');enemyStatus(q.en,n)}}}
function onHeal(h,gained,label){if(gained<=0)return;let L=lvl('Elara');if(String(label)==='Divine Grace'&&isPartyHero('Elara')){if(L>=1&&gained<2)healHeroBy(h,1,'Divine Grace — Mastery');if(h!=='Elara')addStatus(h,'Inspired')}
 if(isPartyHero('Elara')&&same(h,'Elara')&&L>=9&&heroCurrentHp(h)>=heroMaxHp(h)&&!usedR('Elara',`Dawn's Embrace:${h}`)){markR('Elara',`Dawn's Embrace:${h}`);addStatus(h,'Guarded');drawCardsForHero(h,1)}
 if(isPartyHero('Elara')&&same(h,'Elara')&&half(h)&&lvl('Elara')>=13&&!usedR('Elara','Mercy Unbound')){markR('Elara','Mercy Unbound');drawCardsForHero(h,1)}
 if(isPartyHero('Thorne')&&vineKeys().includes(key(pos(h).x,pos(h).y))&&lvl('Thorne')>=7&&!usedR('Thorne','Verdant Reach')){markR('Thorne','Verdant Reach');drawDiscard(h,1)}
}
function onRoundChange(){let r=root();r.counters={};for(const h of party())r.counters[`turn:${h}`]=Number(r.counters[`turn:${h}`]||0)+1; // new round = fresh turn token
 // reset transient move flags
 for(const h of party()){let s=St(h);if(s){s.movedTurn=false;s.nextAttackBonus=0}}
}
function questStart(options={}){let r=root(),previousChoices=options.reuseChoices?{...r.flags}:{};r.quest={};r.round={};r.turn={};r.counters={};r.buffs={};r.flags={};
 for(const h of party()){
  if(h==='Aldric'&&lvl(h)>=2){addStatus(h,'Guarded');logA(h,'Battle Ready','gains Guarded at Quest start.')}
  if(h==='Mira'&&lvl(h)>=1){let slots=['Weapon','Armor','Accessory'],saved=previousChoices[k(h,'Masterwork')],raw=slots.includes(saved)?String(slots.indexOf(saved)+1):prompt('Masterwork: choose equipped slot to Masterwork this Quest\n1. Weapon\n2. Armor\n3. Accessory');r.flags[k(h,'Masterwork')]=slots[parseInt(raw,10)-1]||'Weapon';logA(h,'Masterwork',`${r.flags[k(h,'Masterwork')]} selected.`)}
 }
 sync();
}

// ---------- wrappers ----------
function install(){
 if(globalThis.__heroParity3362Installed)return;globalThis.__heroParity3362Installed=true;
 // Damage: adjust before core zero-health handling, then fire post-damage triggers.
 if(typeof damageHeroBy==='function'){
  _damage=damageHeroBy;damageHeroBy=function(h,n,label='Effect'){let before=heroCurrentHp(h),adj=incomingDamage(h,n,label);let out=_damage.call(this,h,adj,label);let dealt=Math.max(0,before-heroCurrentHp(h));afterDamage(h,dealt,label);return out};
 }
 if(typeof healHeroBy==='function'){
  const old=healHeroBy;healHeroBy=function(h,n,label='Effect'){if(String(label)==='Divine Grace'&&lvl('Elara')>=1)n=Math.max(2,Number(n||0));let out=old.call(this,h,n,label);onHeal(h,Number(out||0),label);return out};
 }
 if(typeof addHeroCondition==='function'){
  const old=addHeroCondition;addHeroCondition=function(h,n){if(h==='Seraphine'&&lvl(h)>=7&&isHarm(n)&&heroHasCondition(h,'Guarded')&&!usedR(h,'Aura of Resolve')){markR(h,'Aura of Resolve');logA(h,'Aura of Resolve',`ignores ${n}.`);return false}let had=heroHasCondition(h,n),out=old.apply(this,arguments);if(!had&&heroHasCondition(h,n))statusApplied(h,n);return out};
 }
 if(typeof addEnemyStatus==='function'){
  const old=addEnemyStatus;addEnemyStatus=function(en,n){let out=old.apply(this,arguments);onEnemyStatus(en,n);return out};
 }else if(typeof addCond==='function'){
  const old=addCond;addCond=function(en,n){let out=old.apply(this,arguments);onEnemyStatus(en,n);return out};
 }
 if(typeof enterHeroLocation==='function'){
  const old=enterHeroLocation;enterHeroLocation=function(h,x,y,label){let from={...pos(h)},out=old.apply(this,arguments),to={...pos(h)};if(from.x!==to.x||from.y!==to.y)onEnter(h,from,to,label);return out};try{globalThis.enterHeroLocation=enterHeroLocation}catch(_){}
 }
 // Shared runtime hero attack modifiers/kill triggers.
 if(typeof runtimeHeroAttackEnemy==='function'){
  const old=runtimeHeroAttackEnemy;runtimeHeroAttackEnemy=function(h,c,q,b=0,ig=0){let en=q?.en,alive=en?.hp>0,m=attackMods(h,en,c);let out=old.call(this,h,c,q,Number(b||0)+m.bonus,Math.max(Number(ig||0),m.ignore));let dead=alive&&en?.hp<=0;afterAttack(h,en,dead,c);return out};try{globalThis.runtimeHeroAttackEnemy=runtimeHeroAttackEnemy}catch(_){}
 }
 // Original-hero basic/card attack paths: lightweight post hooks and temporary bonuses.
 if(typeof heroBasicAttackFor==='function'){
  const old=heroBasicAttackFor;heroBasicAttackFor=function(h,en,label='Basic Attack'){let alive=en?.hp>0,m=attackMods(h,en,{name:label});root().buffs[k(h,'tempAttack')]=m.bonus;let out=old.apply(this,arguments);delete root().buffs[k(h,'tempAttack')];afterAttack(h,en,alive&&en?.hp<=0,{name:label});return out};
 }
 // Runtime card lifecycle: support/spell progression.
 if(typeof playExtraCard==='function'){
  const old=playExtraCard;playExtraCard=function(c){let h=controlledHero(),s=St(h),beforeA=s?.actions,spell=/Spell/i.test(String(c?.traits||'')),support=String(c?.category||'')==='Support',out=old.apply(this,arguments);let resolved=s&&s.actions!==beforeA;
    if(resolved&&h==='Cassian'&&support&&lvl(h)>=1){let others=party().filter(x=>x!==h&&same(x,h));let who=chooseHero(others,'Maestro: choose Hero');if(who){addStatus(who,'Inspired');drawDiscard(who,2);if(!usedR(h,'Maestro Draw')){markR(h,'Maestro Draw');drawCardsForHero(h,1)}}}
    if(resolved&&h==='Vaelis'&&spell){let r=root(),count=Number(r.counters[k(h,'Spells') ]||0)+1;r.counters[k(h,'Spells')]=count;if(lvl(h)>=7&&!usedR(h,'Spellweaver')){markR(h,'Spellweaver');r.flags[k(h,'Spellweaver Discount')]=true}if(lvl(h)>=9&&count===2&&!usedR(h,'Arcane Cascade')){markR(h,'Arcane Cascade');drawDiscard(h,2);r.flags[k(h,'Spellweaver Discount')]=true}if(lvl(h)>=11&&count===3&&!usedR(h,'Spell Sovereign')){markR(h,'Spell Sovereign');let d=s.discard||[],i=[...d].reverse().findIndex(x=>/Spell/i.test(String(x.traits||'')));if(i>=0){i=d.length-1-i;let x=d.splice(i,1)[0];s.hand.push(x);try{discardOne(h)}catch(_){}}}}
    sync();return out};try{globalThis.playExtraCard=playExtraCard}catch(_){}
 }
 // Vaelis progression spell-cost reductions.
 if(typeof extraCardActionCost32611==='function'){
  const old=extraCardActionCost32611;extraCardActionCost32611=function(h,c,s){let cost=old.apply(this,arguments);if(h==='Vaelis'&&/Spell/i.test(String(c?.traits||''))&&root().flags[k(h,'Spellweaver Discount')])cost=Math.max(0,cost-1);return cost};
 }
 // Enemy status direct addCond may be used by card engine even with addEnemyStatus present.
 if(typeof addCond==='function'&&!String(addCond).includes('PARITY3362_STATUS')){
  const old=addCond;addCond=function(en,n){/* PARITY3362_STATUS */let before=(en.conditions||[]).includes(n),out=old.apply(this,arguments);if(!before)onEnemyStatus(en,n);return out};
 }
 // Enemy entry into Thorne Nature terrain.
 if(typeof extraEnemyEntryReactionWindow==='function'){
  const old=extraEnemyEntryReactionWindow;extraEnemyEntryReactionWindow=async function(en,p){let kk=key(p.x,p.y);if(isPartyHero('Thorne')&&vineKeys().includes(kk)&&lvl('Thorne')>=6&&!usedR('Thorne',`Living Wilds:${kk}`)){if(confirm(`Living Wilds: Root ${en.name} for this activation?`)){markR('Thorne',`Living Wilds:${kk}`);enemyStatus(en,'Rooted')}}return old.apply(this,arguments)};
 }
 // Round transition and quest-start initialization.
 if(typeof endTurn==='function'){
  const old=endTurn;endTurn=async function(){let before=Number(G()?.round||0),out=await old.apply(this,arguments);if(Number(G()?.round||0)!==before)onRoundChange();return out};
 }
 // Quest starters differ across layers; hook common init/start function(s).
 if(typeof init==='function'){
  const old=init;init=function(){let out=old.apply(this,arguments);try{questStart()}catch(e){console.error(e)}return out};
 }
 // Override maxima used by the historical H014/H016 piece layer where possible.
 globalThis.ascHeroRuntime3362={version:V,use:(h,n)=>use(h,n),canUse:(h,n)=>canUse(h,n),status:(h,n)=>status(h,n),boneMax,totemMax,questStart,root,attackMods,afterAttack,incomingDamage,afterDamage,onEnemyStatus,coverage:()=>coverage()};
 window.ASCENDANCE_BUILD=V;try{let e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}catch(_){}
 try{log('3.36.2 HERO RUNTIME PARITY: Level 1–12 progression trigger layer loaded.')}catch(_){}
}
function canUse(h,n){if(!ACT[h]?.[n])return false;if(usedQ(h,n))return false;let text=abilityText(h,n);let cost=/spend 1 Action/i.test(text)?1:0;return !heroDefeated(h)&&G()?.phase==='Hero Phase'&&heroActionCount(h)>=cost}
function use(h,n){if(!ACT[h]?.[n]){logA(h,n,'this ability is trigger/passive and resolves at its printed timing.');return false}if(!canUse(h,n)){logA(h,n,'is not currently available.');return false}let out=ACT[h][n]();sync();return out}
function abilityText(h,n){try{let L=Math.min(12,lvl(h)),rows=globalThis.ascHeroAbilityPanel3360?.legacy?.(h)||[];return rows.find(a=>a.name===n)?.text||''}catch(_){return''}}
function status(h,n){if(usedQ(h,n))return{status:'USED THIS QUEST',used:true,ready:false};if(usedR(h,n))return{status:'USED THIS ROUND',used:true,ready:false};if(ACT[h]?.[n])return{status:canUse(h,n)?'READY':'NOT READY',used:false,ready:canUse(h,n)};return null}
function coverage(){let out={};for(const h of Object.keys(ACT))out[h]=Object.keys(ACT[h]);return out}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,180));else setTimeout(install,180);setTimeout(install,1400);setTimeout(install,3000);
})();
