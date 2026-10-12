(()=>{
'use strict';
const V='3.36.12';
let installed=false;
const HARMFUL=['Bleeding','Poisoned','Burning','Stunned','Weakened','Slowed','Rooted','Exposed','Marked','Silenced','Disarmed','Knocked Down','Shocked'];
function G(){try{return globalThis.__ascGetGame?.()||globalThis.g}catch(_){return globalThis.g||null}}
function st(h){try{return globalThis.searchHeroState?.(h)||(h==='Aldric'?G():h==='Lyra'?G()?.lyra:h==='Seraphine'?G()?.seraphine:globalThis.runtimeHeroState?.(h))||null}catch(_){return null}}
function es(h){let s=st(h);if(!s)return{};return s.equipmentLoot33612||(s.equipmentLoot33612={})}
function pos(h){try{return globalThis.heroPos?.(h)||{x:9999,y:9999}}catch(_){return{x:9999,y:9999}}}
function kxy(x,y){return `${x},${y}`}
function logx(s){try{globalThis.log?.(s)}catch(_){}}
function renderx(){try{globalThis.render?.();globalThis.mpScheduleState?.()}catch(_){}}
function eq(h,id){try{return !!globalThis.heroHasEquipped?.(h,id)}catch(_){return false}}
function ids(h){try{return globalThis.equippedDefinitions?.(h)?.map(x=>x.id)||[]}catch(_){return[]}}
function wdef(h){try{return globalThis.heroWeaponDef?.(h)||null}catch(_){return null}}
function item(h,id){try{return globalThis.heroInventory?.(h)?.find(x=>x.kind==='loot'&&x.id===id&&Number(x.qty||0)>0)||null}catch(_){return null}}
function partyItem(id){for(const h of (globalThis.partyHeroes?.()||[])){let row=item(h,id);if(row)return{h,row}}return null}
function hereHeroes(h,includeSelf=true){let p=pos(h);return (globalThis.partyHeroes?.()||[]).filter(x=>(includeSelf||x!==h)&&!globalThis.heroDefeated?.(x)).filter(x=>{let q=pos(x);return p.x===q.x&&p.y===q.y})}
function choose(list,label,fmt=x=>String(x)){if(!list?.length)return null;if(list.length===1)return list[0];let raw=prompt(`${label}\n`+list.map((x,i)=>`${i+1}. ${fmt(x)}`).join('\n'));if(raw===null)return null;return list[parseInt(raw,10)-1]||null}
function cname(x){return typeof x==='string'?x:x?.name}
function harmfulEnemy(en){return !!(en?.conditions||[]).some(x=>HARMFUL.includes(cname(x)))}
function tags(x){return String([x?.name,x?.type,x?.family,x?.traits,x?.keywords,x?.damage,x?.rules].flat().filter(Boolean).join(' ')).toLowerCase()}
function enemyTags(en){return String([en?.name,en?.type,en?.family,en?.traits].flat().filter(Boolean).join(' ')).toLowerCase()}
function tileRef(t){for(const [k,v] of Object.entries(G()?.tiles||{}))if(v===t){let [x,y]=k.split(',').map(Number);return{k,t:v,x,y}}return null}
function enemyRef(en){try{return globalThis.findE?.(en)||null}catch(_){return null}}
function dist(a,b){try{return globalThis.graphDistance?.(a.x,a.y,b.x,b.y)??globalThis.distance?.(a.x,a.y,b.x,b.y)??999}catch(_){return999}}
function curTile(h){let p=pos(h);return G()?.tiles?.[kxy(p.x,p.y)]||null}
function sameLoc(a,b){let p=pos(a),q=pos(b);return p.x===q.x&&p.y===q.y}
function sameLocEnemyCount(h){return (globalThis.livingEnemies?.(curTile(h))||[]).length}
function alliesAtEnemy(h,en){let q=enemyRef(en);if(!q)return false;return (globalThis.partyHeroes?.()||[]).some(x=>x!==h&&!globalThis.heroDefeated?.(x)&&pos(x).x===q.x&&pos(x).y===q.y)}
function noOtherHeroAtEnemy(h,en){let q=enemyRef(en);if(!q)return true;return !(globalThis.partyHeroes?.()||[]).some(x=>x!==h&&!globalThis.heroDefeated?.(x)&&pos(x).x===q.x&&pos(x).y===q.y)}
function isArcaneTile(h){let t=curTile(h);return /arcane/i.test(String([t?.name,...(t?.traits||[])].join(' ')))||!!t?.arcaneWard32527||!!t?.tempArcane32521||Number(t?.tempArcane33612UntilRound||-1)>=Number(G()?.round||0)}
function isConsecratedTile(h){let t=curTile(h);return /consecrated/i.test(String([t?.name,...(t?.traits||[])].join(' ')))||!!t?.consecrated32526}
function naturalTile(h){let t=curTile(h);return /(forest|woods|grove|swamp|plains|river|nature)/i.test(String([t?.name,t?.terrain,...(t?.traits||[])].join(' ')))}
function encKey(){let gg=G();return gg?.activeEncounter320?.token||`${gg?.campaign?.currentQuest||'QUEST'}:${gg?.campaign?.day??0}:${gg?.campaign?.questAttempt??gg?.campaign?.attempt??0}`}
function markOnce(h,key,scope='round'){let s=es(h),v=scope==='round'?Number(G()?.round||0):encKey(),k=`${key}:${scope}`;if(s[k]===v)return false;s[k]=v;return true}
function used(h,key,scope='round'){let s=es(h),v=scope==='round'?Number(G()?.round||0):encKey();return s[`${key}:${scope}`]===v}
function heroHp(h){try{return Number(globalThis.heroCurrentHp?.(h)??st(h)?.hp??0)}catch(_){return 0}}
function heroMax(h){try{return Number(globalThis.heroMaxHp?.(h)??st(h)?.maxHp??1)}catch(_){return 1}}
function setHeroHp(h,v){let gg=G(),s=st(h);v=Math.max(0,Number(v||0));if(h==='Aldric')gg.hp=v;else if(s)s.hp=v}
function addActions(h,n){let gg=G(),s=st(h),v=Math.max(0,Number(n||0));if(h==='Aldric')gg.actions=Math.min(3,Number(gg.actions||0)+v);else if(s)s.actions=Math.min(3,Number(s.actions||0)+v)}
function refundAction(h){if(globalThis.campaignDowntimeActive?.())return;addActions(h,1)}
function removeLootRow(h,key){try{return globalThis.consumeLootEntry?.(h,key,1)}catch(_){return false}}
function finishItem(h,key,c,msg){removeLootRow(h,key);logx(`ITEM: ${globalThis.heroDisplayName?.(h)||h} uses ${c.name}. ${msg} ${c.name} discarded.`);renderx()}
function heal(h,n,label){let before=heroHp(h);globalThis.healHeroBy?.(h,n,label);return Math.max(0,heroHp(h)-before)}
function clearNegative(h){for(const n of HARMFUL)try{globalThis.removeHeroCondition?.(h,n)}catch(_){}}
function selectHero(h,label,filter=()=>true){return choose(hereHeroes(h,true).filter(filter),label,x=>`${globalThis.heroDisplayName?.(x)||x} — ${heroHp(x)}/${heroMax(x)} HP`)}
function selectEnemy(h,label,connected=false){try{return globalThis.chooseItemEnemy?.(h,label,connected)||null}catch(_){return null}}
function enemiesInRange(h,maxRange=Number(globalThis.equipmentRange?.(h)||0)){let p=pos(h),out=[];for(const [k,t] of Object.entries(G()?.tiles||{})){let [x,y]=k.split(',').map(Number),d=dist(p,{x,y});if(d<=maxRange)for(const en of (globalThis.livingEnemies?.(t)||[]))out.push({en,t,x,y,dist:d})}return out}
function directEnemy(h,q,n,label){if(!q?.en||q.en.hp<=0)return 0;let before=q.en.hp;q.en.hp=Math.max(0,q.en.hp-Number(n||0));let d=before-q.en.hp;if(d>0)logx(`${label}: ${q.en.name} suffers ${d} damage.`);if(q.en.hp<=0){try{globalThis.recordKill32521?.(h,q.en,label)}catch(_){};try{q.t.enemies=q.t.enemies.filter(x=>x!==q.en)}catch(_){};logx(`${q.en.name} is Defeated by ${globalThis.heroDisplayName?.(h)||h}.`);try{globalThis.q001AfterEnemyDefeat?.()}catch(_){}}return d}
function freeBasic33612(h,q,label='Equipment free Attack',finalDamageMod=0){
 if(!q?.en||q.en.hp<=0)return false;
 let fake={id:'BASIC-EQ',name:label,category:'Attack',rules:'Make a basic Attack.',keywords:'',traits:'',range:'Your Location'};
 try{if(globalThis.isRuntimeHero?.(h))return !!globalThis.runtimeHeroAttackEnemy?.(h,fake,q,Number(finalDamageMod||0),0)}catch(_){}
 let before=Number(q.en.hp||0),base=Number(globalThis.heroAttackValueFor?.(h)||0),ctx=baseExtraAttackMods(h,fake,q,true),av=base+Number(ctx.bonus||0),arm=Math.max(0,Number(globalThis.effArmor?.(q.en)||q.en.armor||0)-Number(ctx.ignore||0)),dmg=Math.max(0,av-arm+Number(finalDamageMod||0));
 q.en.hp=Math.max(0,q.en.hp-dmg);logx(`${label}: ${globalThis.heroDisplayName?.(h)||h} Attack ${av} − ${q.en.name} Armor ${arm}${finalDamageMod?` ${finalDamageMod>0?'+':''}${finalDamageMod} Damage modifier`:''} = ${dmg} damage.`);
 if(ctx.post&&q.en.hp>0)directEnemy(h,q,ctx.post,'Equipment bonus damage');let dead=q.en.hp<=0;if(dead){try{globalThis.recordKill32521?.(h,q.en,label)}catch(_){};try{q.t.enemies=q.t.enemies.filter(x=>x!==q.en)}catch(_){};logx(`${q.en.name} is Defeated by ${globalThis.heroDisplayName?.(h)||h}.`);try{globalThis.q001AfterEnemyDefeat?.()}catch(_){}}
 try{globalThis.equipmentAfterDamage321?.(h,q.en,Math.max(0,before-Number(q.en.hp||0)),dead)}catch(_){};afterExtraAttack(h,fake,q,Math.max(0,before-Number(q.en.hp||0)),dead,{...ctx,post:0},true);return dead;
}
function moveEnemy(h,q,label){if(!q?.en||q.en.hp<=0)return false;let r=tileRef(q.t);if(!r)return false;let ns=(globalThis.neighbors?.(r.x,r.y)||[]).filter(n=>G()?.tiles?.[kxy(n.x,n.y)]);if(!ns.length)return false;let n=choose(ns,`${label}: choose connected Location for ${q.en.name}`,x=>G().tiles[kxy(x.x,x.y)].name);if(!n)return false;q.t.enemies=q.t.enemies.filter(x=>x!==q.en);let t=G().tiles[kxy(n.x,n.y)];t.enemies=t.enemies||[];t.enemies.push(q.en);logx(`${label}: ${q.en.name} moves to ${t.name}.`);return true}
function freeMove(h,label,max=1){let p=pos(h),steps=0;while(steps<max){let ns=(globalThis.neighbors?.(p.x,p.y)||[]).filter(n=>G()?.tiles?.[kxy(n.x,n.y)]);if(!ns.length)return;let n=choose(ns,`${label}: choose connected Location${steps?' (Cancel to stop)':''}`,x=>G().tiles[kxy(x.x,x.y)].name);if(!n)return;globalThis.enterHeroLocation?.(h,n.x,n.y,label);p=pos(h);steps++;if(max>1&&!confirm(`${label}: move one more Location?`))break}}
function attackIsMelee(h,c,q){let cr=String(c?.range||'').toLowerCase();if(cr)return !/ranged|connected|\d/.test(cr);return Number(q?.dist??q?.d??0)===0&&Number(globalThis.equipmentRange?.(h)||0)===0}
function attackIsRanged(h,c,q){return !attackIsMelee(h,c,q)}
function fireCard(c){return /fire|flame|ember|burn/i.test(tags(c))}
function lightningCard(c){return /lightning|storm|spark|thunder/i.test(tags(c))}
function coldCard(c){return /cold|frost|ice/i.test(tags(c))}
function natureCard(c){return /nature|vine|root|grove|thorn/i.test(tags(c))}
function arcaneCard(c){return /arcane|spell|magic/i.test(tags(c))}
function damagingCard(c){return /attack|damage|damaging/i.test(String([c?.category,c?.rules,c?.keywords,c?.traits].filter(Boolean).join(' ')))}
function enemyArmor(en){try{return Number(globalThis.effArmor?.(en)||0)}catch(_){return Number(en?.armor||0)}}
function enemyIs(en,re){return re.test(enemyTags(en))}

// ---- Full 16-Hero Consumable runtime ----
function installConsumables(){
 if(typeof globalThis.useConsumable!=='function')return;
 globalThis.useConsumable=function(h,key){
  try{globalThis.ensureLootState?.()}catch(_){}
  if(!globalThis.mpCanControl?.(h)){logx(`ITEM: You do not control ${h}.`);return}
  let row=globalThis.heroInventory?.(h)?.find(x=>x.key===key),c=row&&globalThis.lootById?.(row.id);if(!row||!c||!c.consumable)return;
  if(globalThis.heroDefeated?.(h)){logx(`ITEM: ${globalThis.heroDisplayName?.(h)||h} is Downed and cannot activate an Item.`);return}
  const id=c.id;
  if(id==='LT012'){logx("ITEM: Traveler's Rations is tied to the Rest action. Rest is not defined as a normal Hero action in the current digital rules, so the card is preserved rather than consumed incorrectly.");return}
  if(id==='LT026'){logx('ITEM: Lockpick Set requires a Locked/simple-Trap Interact or Search hook. No current Quest/Location exposes that interaction, so the card and Action are preserved.');return}
  if(id==='LT027'){if(!globalThis.itemSpendAction?.(h))return;G().scoutKitPrepared={hero:h,round:G().round};finishItem(h,key,c,'The next Explore this turn draws 2 valid Location cards; choose 1 and discard the other.');return}
  if(!globalThis.itemSpendAction?.(h))return;
  const cancel=(msg='Item use cancelled; no Action or item was spent.')=>{refundAction(h);logx(`ITEM: ${msg}`);renderx()};
  if(['LT001','LT002','LT003'].includes(id)){let n=id==='LT001'?2:id==='LT002'?4:6,target=selectHero(h,`${c.name}: choose injured/downed Hero`,x=>heroHp(x)<heroMax(x));if(!target)return cancel('No injured Hero at this Location.');let gain=heal(target,n,c.name);if(heroHp(target)>0&&G().campaign?.heroFates?.[target]?.status==='Downed')G().campaign.heroFates[target].status='Survived';finishItem(h,key,c,`${globalThis.heroDisplayName?.(target)||target} recovers ${gain} Health.`);return}
  if(['LT004','LT005','LT006','LT008'].includes(id)){let cond={LT004:'Bleeding',LT005:'Poisoned',LT006:'Burning',LT008:'Stunned'}[id],target=selectHero(h,`${c.name}: choose Hero`,x=>globalThis.heroHasCondition?.(x,cond));if(!target)return cancel(`No Hero at this Location has ${cond}.`);globalThis.removeHeroCondition?.(target,cond);finishItem(h,key,c,`${cond} removed from ${globalThis.heroDisplayName?.(target)||target}.`);return}
  if(id==='LT007'){let target=selectHero(h,`${c.name}: choose Hero`,x=>globalThis.heroHasCondition?.(x,'Weakened')||heroHp(x)<heroMax(x));if(!target)return cancel('No legal Restorative Tonic target.');globalThis.removeHeroCondition?.(target,'Weakened');heal(target,1,c.name);finishItem(h,key,c,`Weakened removed from ${globalThis.heroDisplayName?.(target)||target}; recover up to 1 Health.`);return}
  if(id==='LT009'){globalThis.addHeroCondition?.(h,'Inspired');es(h).focusTonicThroughRound=Number(G().round||0)+1;finishItem(h,key,c,'Gains Inspired through the end of the next turn.');return}
  if(id==='LT010'){globalThis.addHeroCondition?.(h,'Guarded');finishItem(h,key,c,'Gains Guarded.');return}
  if(id==='LT011'){addActions(h,1);finishItem(h,key,c,'Gains 1 Action this turn (net 0 Actions spent).');return}
  if(id==='LT013'){globalThis.removeHeroCondition?.(h,'Bleeding');heal(h,1,c.name);finishItem(h,key,c,'Recovers 1 Health and removes Bleeding.');return}
  if(id==='LT014'){let target=selectHero(h,`${c.name}: choose Hero`,x=>globalThis.heroHasCondition?.(x,'Poisoned')||globalThis.heroHasCondition?.(x,'Burning'));if(!target)return cancel('No Poisoned/Burning Hero at this Location.');let choices=['Poisoned','Burning'].filter(x=>globalThis.heroHasCondition?.(target,x)),cond=choices.length===1?choices[0]:prompt('Remove Poisoned or Burning?',choices[0]);if(!choices.includes(cond))return cancel();globalThis.removeHeroCondition?.(target,cond);finishItem(h,key,c,`${cond} removed from ${globalThis.heroDisplayName?.(target)||target}.`);return}
  if(id==='LT015'){let t=curTile(h);t.smokeBombRound=G().round;finishItem(h,key,c,`Heroes at ${t.name} may voluntarily Move while Engaged until end of turn.`);return}
  if(['LT016','LT017','LT019'].includes(id)){let q=selectEnemy(h,c.name,true);if(!q)return cancel('No legal Enemy target.');if(id==='LT016'){directEnemy(h,q,2,c.name);if(q.en.hp>0)globalThis.addCond?.(q.en,'Burning')}else if(id==='LT017'){globalThis.addCond?.(q.en,'Slowed');q.en.slowedUntilActivation=true}else directEnemy(h,q,2,c.name);finishItem(h,key,c,id==='LT016'?`${q.en.name} suffers 2 damage and gains Burning.`:id==='LT017'?`${q.en.name} gains Slowed until the end of its next activation.`:`${q.en.name} suffers 2 damage.`);return}
  if(['LT018','LT020'].includes(id)){let q=selectEnemy(h,c.name,false);if(!q)return cancel('No legal Enemy target in your Location.');if(id==='LT018')globalThis.addCond?.(q.en,'Stunned');else directEnemy(h,q,3,c.name);finishItem(h,key,c,id==='LT018'?`${q.en.name} gains Stunned.`:`${q.en.name} suffers 3 damage.`);return}
  if(id==='LT021'||id==='LT022'){let t=curTile(h);if(id==='LT021')t.caltrops=(t.caltrops||0)+1;else t.traps=(t.traps||0)+1;finishItem(h,key,c,`${id==='LT021'?'Caltrops':'Trap'} token placed at ${t.name}.`);return}
  if(id==='LT023'){es(h).ignoreVisibilityThroughRound=G().round;finishItem(h,key,c,'Ignores one Dark or visibility restriction through end of round.');return}
  if(id==='LT024'){if(Number(es(h).ignoreVisibilityThroughRound||-1)<Number(G().round||0))return cancel('Lantern Oil needs an active Torch effect or an extinguishable Burning Location/object.');es(h).ignoreVisibilityThroughRound=Number(G().round||0)+1;finishItem(h,key,c,'Extends the Torch effect through the end of the next turn.');return}
  if(id==='LT025'){let p=pos(h),ns=(globalThis.neighbors?.(p.x,p.y)||[]).filter(n=>G().tiles[kxy(n.x,n.y)]),n=choose(ns,'Rope & Grapnel — choose connected revealed Location',x=>G().tiles[kxy(x.x,x.y)].name);if(!n)return cancel();globalThis.enterHeroLocation?.(h,n.x,n.y,'ROPE & GRAPNEL');finishItem(h,key,c,'Moves ignoring terrain-based movement restrictions.');return}
  if(id==='LT028'){es(h).whetstoneBonus=1;finishItem(h,key,c,'Equipped Weapon gains +1 Attack for the next Attack this turn.');return}
  if(id==='LT029'){heal(h,2,c.name);globalThis.drawCardsForHero?.(h,1);finishItem(h,key,c,'Recovers 2 Health and draws 1 Hero card.');return}
  if(id==='LT030'){let target=selectHero(h,'Phoenix Ash: choose one Hero');if(!target)return cancel();clearNegative(target);heal(target,3,c.name);if(heroHp(target)>0&&G().campaign?.heroFates?.[target]?.status==='Downed')G().campaign.heroFates[target].status='Survived';finishItem(h,key,c,`All negative Conditions removed from ${globalThis.heroDisplayName?.(target)||target}; recover up to 3 Health.`);return}
  cancel(`${c.name}'s effect is not recognized by 3.36.12.`);
 };
}

// ---- Movement / range / static auras ----
function installMovementAndStats(){
 if(typeof globalThis.equipmentRange==='function'){const old=globalThis.equipmentRange;globalThis.equipmentRange=function(h){let n=Number(old.apply(this,arguments)||0);if(eq(h,'EQ029'))n=Math.max(n,1);if(eq(h,'EQ052'))n+=1;return n}}
 if(typeof globalThis.equipmentAttack==='function'){const old=globalThis.equipmentAttack;globalThis.equipmentAttack=function(h){let n=Number(old.apply(this,arguments)||0);if(eq(h,'EQ052'))n+=1;for(const ally of (globalThis.partyHeroes?.()||[])){if(ally!==h&&!globalThis.heroDefeated?.(ally)&&sameLoc(h,ally)&&eq(ally,'EQ036')&&!es(ally).exhausted)n+=1}return n}}
 if(typeof globalThis.equipmentArmor==='function'){const old=globalThis.equipmentArmor;globalThis.equipmentArmor=function(h){let n=Number(old.apply(this,arguments)||0),t=curTile(h);if(eq(h,'EQ110'))n+=1;if(eq(h,'EQ089')&&isConsecratedTile(h))n+=1;if(eq(h,'EQ093')&&sameLocEnemyCount(h)>=2)n+=1;if(eq(h,'EQ096')&&isArcaneTile(h))n+=1;if(es(h).flowingArmorUntilRound>=Number(G()?.round||0))n+=1;for(const ally of (globalThis.partyHeroes?.()||[])){if(ally!==h&&!globalThis.heroDefeated?.(ally)&&sameLoc(h,ally)&&eq(ally,'EQ026')&&!es(ally).exhausted)n+=1}return n}}
 if(typeof globalThis.enterHeroLocation==='function'){const old=globalThis.enterHeroLocation;globalThis.enterHeroLocation=function(h,x,y,label='Move'){let forced=/push|pull|forced|knock/i.test(String(label));if(forced&&(eq(h,'EQ027')||eq(h,'EQ079')||eq(h,'EQ093'))){logx(`${globalThis.equipmentById?.(G()?.equipped?.[h]?.Weapon)?.name||globalThis.equipmentById?.(G()?.equipped?.[h]?.Armor)?.name||'Equipment'}: ${globalThis.heroDisplayName?.(h)||h} cannot be Pushed/Pulled/Knocked Down.`);return false}let before=pos(h),r=old.apply(this,arguments),after=pos(h);if(before.x!==after.x||before.y!==after.y){let s=es(h);if(s.moveRound!==G().round){s.moveRound=G().round;s.moveCount=0}s.moveCount=(s.moveCount||0)+1;if(eq(h,'EQ143'))s.tempoRound=G().round;if(eq(h,'EQ107')&&(globalThis.livingEnemies?.(curTile(h))||[]).length)s.vanguardRound=G().round;if(eq(h,'EQ105')&&isConsecratedTile(h)&&markOnce(h,'eq105','round'))heal(h,1,'Consecrated Rosary')}return r}}
 if(typeof globalThis.addHeroCondition==='function'){const old=globalThis.addHeroCondition;globalThis.addHeroCondition=function(h,n){if(eq(h,'EQ109')&&String(n)==='Weakened'){logx(`Crown of Resolve — Unbroken: ${globalThis.heroDisplayName?.(h)||h} is immune to Weakened.`);return}return old.apply(this,arguments)}}
}

function baseExtraAttackMods(h,c,q,forBasic=false){
 let s=es(h),en=q?.en,bonus=0,ignore=0,post=0,notes=[];if(!en)return{bonus,ignore,post,notes};let moved=s.moveRound===G().round,moves=moved?Number(s.moveCount||0):0,melee=attackIsMelee(h,c,q),ranged=!melee,enc=encKey();
 if(forBasic&&typeof globalThis.equipmentAttackContext321==='function'){let x=globalThis.equipmentAttackContext321(h,en)||{};bonus+=Number(x.bonus||0);ignore=Math.max(ignore,Number(x.ignore||0));post+=Number(x.post||0)}
 if(eq(h,'EQ001')&&s.eq001Enc!==enc){bonus+=1;s.eq001Enc=enc;notes.push('Worn Edge +1')}
 if(eq(h,'EQ008')&&s.eq008Enc!==enc&&confirm('Dragonsteel Longsword — Dragon Strike: use once-per-encounter +3 Attack and ignore all Armor?')){bonus+=3;ignore=99;s.eq008Enc=enc;notes.push('Dragon Strike')}
 if(eq(h,'EQ009')&&!G()?.equipped?.[h]?.Shield&&melee){post+=1;notes.push('Versatile two-handed +1 damage')}
 if(eq(h,'EQ010')&&sameLocEnemyCount(h)===1&&markOnce(h,'eq010','round')){bonus+=1;notes.push('Precise Strike +1')}
 if(eq(h,'EQ014')&&s.cleavingReadyRound===G().round){bonus+=1;delete s.cleavingReadyRound;notes.push('Cleaving Edge +1')}
 if(eq(h,'EQ016')&&confirm("Berserker's Greataxe — Reckless Assault: suffer 1 damage for +2 Damage?")){globalThis.damageHeroBy?.(h,1,'Reckless Assault');post+=2;notes.push('Reckless Assault +2 damage')}
 if(eq(h,'EQ019')&&globalThis.hasCond?.(en,'Bleeding')){bonus+=1;notes.push('Blood Frenzy +1')}
 if(eq(h,'EQ021')&&enemyArmor(en)>0)ignore=Math.max(ignore,1)
 if(eq(h,'EQ026')&&enemyArmor(en)>=3)ignore=99
 if(eq(h,'EQ028'))post+=1
 if(eq(h,'EQ033')&&moves>=2)post+=2
 if(eq(h,'EQ037')&&Number(G().round||0)===1&&markOnce(h,'eq037','enc'))bonus+=2
 if(eq(h,'EQ038')&&alliesAtEnemy(h,en))post+=2
 if(eq(h,'EQ039')&&harmfulEnemy(en)&&markOnce(h,'eq039','round'))bonus+=1
 if(eq(h,'EQ042')&&Number(en.activatedRound33612||0)!==Number(G().round||0))post+=2
 if(eq(h,'EQ046')&&!moved)bonus+=1
 if(eq(h,'EQ050'))post+=1
 if(eq(h,'EQ056')&&!moved){bonus+=2;if(markOnce(h,'eq056ignore','round'))ignore=Math.max(ignore,2)}
 if(eq(h,'EQ060'))ignore=99
 if(eq(h,'EQ062')&&forBasic)post+=1
 if(eq(h,'EQ064')&&s.chargedFocusRound===G().round){bonus+=1;delete s.chargedFocusRound}
 if(eq(h,'EQ069')&&!forBasic&&/spell|arcane/i.test(tags(c))&&markOnce(h,'eq069','round'))bonus+=1
 if(eq(h,'EQ085')&&enemyIs(en,/beast/))post+=1
 if(eq(h,'EQ104')&&ranged&&markOnce(h,'eq104','round'))bonus+=1
 if(eq(h,'EQ107')&&s.vanguardRound===G().round){bonus+=2;delete s.vanguardRound}
 if(eq(h,'EQ111')&&s.braceEnemy===en&&s.braceRound===G().round){bonus+=1;delete s.braceEnemy;delete s.braceRound}
 if(eq(h,'EQ118')&&globalThis.heroHasCondition?.(h,'Hidden')&&markOnce(h,'eq118','round'))bonus+=3
 if(eq(h,'EQ121')&&!forBasic&&fireCard(c)&&damagingCard(c)&&markOnce(h,'eq121','round'))post+=1
 if(eq(h,'EQ123')&&harmfulEnemy(en)&&markOnce(h,'eq123','round'))bonus+=1
 if(eq(h,'EQ124')&&!moved&&melee&&markOnce(h,'eq124','round'))bonus+=1
 if(en.eq125Guide33612&&en.eq125Guide33612.round===G().round&&en.eq125Guide33612.owner!==h){bonus+=1;delete en.eq125Guide33612;notes.push('Guiding Light +1')}
 if(eq(h,'EQ126')&&moved&&markOnce(h,'eq126','round'))bonus+=1
 if(eq(h,'EQ127')&&!moved&&markOnce(h,'eq127','round'))bonus+=1
 if(eq(h,'EQ128')&&s.eq128Enc!==enc){ignore=Math.max(ignore,1);s.eq128Enc=enc}
 if(eq(h,'EQ130')&&heroHp(h)<=heroMax(h)/2&&markOnce(h,'eq130','round'))bonus+=1
 if(eq(h,'EQ131')&&enemyArmor(en)>=2&&s.eq131Enc!==enc){ignore=Math.max(ignore,1);s.eq131Enc=enc}
 if(eq(h,'EQ133')&&sameLocEnemyCount(h)===1&&markOnce(h,'eq133','round'))bonus+=1
 if(eq(h,'EQ134')&&noOtherHeroAtEnemy(h,en)&&markOnce(h,'eq134','round'))bonus+=1
 if(eq(h,'EQ136')&&!forBasic&&damagingCard(c)&&ranged&&markOnce(h,'eq136','round'))bonus+=1
 if(eq(h,'EQ139')&&!forBasic&&damagingCard(c)&&arcaneCard(c)&&markOnce(h,'eq139','round'))bonus+=1
 if(eq(h,'EQ141')&&s.spiritMarkTarget===en&&s.spiritMarkRound===G().round){bonus+=1;delete s.spiritMarkTarget;delete s.spiritMarkRound}
 if(eq(h,'EQ143')&&s.tempoRound===G().round&&melee){bonus+=1;delete s.tempoRound}
 if(Number(s.whetstoneBonus||0)>0){bonus+=1;s.whetstoneBonus=0;notes.push('Whetstone +1')}
 return{bonus,ignore,post,notes,melee,ranged,before:en.hp};
}
function secondEnemy(q,exclude){let a=(globalThis.livingEnemies?.(q.t)||[]).filter(x=>x!==exclude);return a.length===1?a[0]:choose(a,'Choose another Enemy',x=>`${x.name} — ${x.hp} HP`)}
function afterExtraAttack(h,c,q,damage,dead,ctx,forBasic=false){let en=q?.en,s=es(h);if(!en)return;let et=enemyTags(en),enc=encKey();
 if(ctx?.post&&en.hp>0)directEnemy(h,q,ctx.post,'Equipment bonus damage');
 if(damage>0&&eq(h,'EQ006')&&damage>=4&&s.eq006IgniteEnc!==enc){s.eq006IgniteEnc=enc;if(en.hp>0)globalThis.addCond?.(en,'Burning')}
 if(dead&&eq(h,'EQ014'))s.cleavingReadyRound=G().round;
 if(damage>0&&eq(h,'EQ018')&&markOnce(h,'eq018chain','round')){let other=secondEnemy(q,en);if(other)directEnemy(h,{en:other,t:q.t},1,'Stormcleaver — Chain Lightning')}
 if(dead&&eq(h,'EQ018')&&s.eq018CrashEnc!==enc){s.eq018CrashEnc=enc;for(const other of (globalThis.livingEnemies?.(q.t)||[]))globalThis.addCond?.(other,'Staggered');logx('Stormcleaver — Thunder Crash: nearby Enemies gain Staggered (status is recorded; the core rules still lack a numeric Staggered resolver).')}
 if(damage>0&&eq(h,'EQ022')&&s.eq022Enc!==enc){s.eq022Enc=enc;globalThis.addCond?.(en,'Staggered');logx('Steel Warhammer — Concussive Strike: Staggered recorded on target.')}
 if(damage>0&&eq(h,'EQ023')&&en.hp>0){let ref=enemyRef(en);if(ref&&confirm(`Maul of the Mountain — Earthbreaker: Push ${en.name}?`)){if(!moveEnemy(h,ref,'Earthbreaker'))directEnemy(h,ref,1,'Heavy Impact')}}
 if(dead&&eq(h,'EQ024')&&/(undead|demon)/.test(et)&&s.eq024Enc!==enc){s.eq024Enc=enc;heal(h,2,'Blessed Morningstar — Divine Resolve')}
 if(damage>0&&eq(h,'EQ032')&&markOnce(h,'eq032','round')){let other=secondEnemy(q,en);if(other)directEnemy(h,{en:other,t:q.t},1,'Halberd — Sweeping Strike')}
 if(dead&&eq(h,'EQ033')&&markOnce(h,'eq033move','round')&&confirm('Dragon Lance — Skewer: move 1 connected Location for free?'))freeMove(h,'Skewer',1)
 if(damage>0&&eq(h,'EQ034')&&markOnce(h,'eq034','round')&&en.hp>0&&confirm(`Trident of the Tides — Tidal Pull: move ${en.name}?`)){let ref=enemyRef(en);if(ref)moveEnemy(h,ref,'Tidal Pull')}
 if(eq(h,'EQ035')&&damage>0){let other=secondEnemy(q,en);if(other&&confirm(`Glaive of the Eclipse — Sweeping Arc: deal 2 damage to ${other.name}?`))directEnemy(h,{en:other,t:q.t},2,'Sweeping Arc')}
 if(dead&&eq(h,'EQ039')){logx("Assassin's Dirk — Silent Killer: move up to 2 connected Locations.");freeMove(h,'Silent Killer',2)}
 if(damage>0&&eq(h,'EQ042')){logx('Shadowfang — Fade Away: may move up to 2 connected Locations.');if(confirm('Fade Away: move?'))freeMove(h,'Fade Away',2)}
 if(damage>0&&eq(h,'EQ049')){if(markOnce(h,'eq049chain','round')){let other=secondEnemy(q,en);if(other)directEnemy(h,{en:other,t:q.t},1,'Storm Bow — Chain Shot')}if(s.eq049LastEnemy===en&&s.eq049LastRound===G().round-1){globalThis.addCond?.(en,'Staggered');logx('Storm Bow — Static Charge: Staggered recorded.')}s.eq049LastEnemy=en;s.eq049LastRound=G().round}
 if(damage>0&&eq(h,'EQ057'))for(const other of (globalThis.livingEnemies?.(q.t)||[]).filter(x=>x!==en))directEnemy(h,{en:other,t:q.t},2,'Explosive Crossbow')
 if(damage>0&&eq(h,'EQ059')&&s.eq059Enc!==enc&&en.hp>0){s.eq059Enc=enc;globalThis.addCond?.(en,'Rooted');logx('Dragonkiller Crossbow — Crippling Shot: Movement becomes 0 through next activation (represented by Rooted).')}
 if(damage>0&&eq(h,'EQ060')&&s.eq060Enc!==enc&&confirm("Heaven's Judgment — use once-per-encounter Judgment for +3 Radiant damage and suppress Reactions?")){s.eq060Enc=enc;directEnemy(h,q,3,"Heaven's Judgment");en.noReactionsUntilActivation33612=true}
 if(damage>0&&eq(h,'EQ062')&&!forBasic&&fireCard(c)&&en.hp>0)globalThis.addCond?.(en,'Burning')
 if(damage>0&&eq(h,'EQ063')){if(forBasic&&en.hp>0){globalThis.addCond?.(en,'Slowed');en.slowedUntilActivation=true}if(!forBasic&&coldCard(c)&&s.eq063Enc!==enc&&en.hp>0){s.eq063Enc=enc;globalThis.addCond?.(en,'Rooted')}}
 if(damage>0&&eq(h,'EQ064')&&lightningCard(c)){if(markOnce(h,'eq064chain','round')){let other=secondEnemy(q,en);if(other)directEnemy(h,{en:other,t:q.t},1,"Stormcaller's Staff — Chain Lightning")}s.chargedFocusRound=G().round}
 if(damage>0&&eq(h,'EQ066')&&natureCard(c)&&markOnce(h,'eq066','round')&&en.hp>0&&confirm('Staff of the Ancient Grove — Grasping Vines: Root target?'))globalThis.addCond?.(en,'Rooted')
 if(damage>0&&eq(h,'EQ070')&&lightningCard(c)){let other=secondEnemy(q,en);if(other)directEnemy(h,{en:other,t:q.t},1,'Wand of Sparks — Arc Lightning')}
 if(damage>0&&eq(h,'EQ071')&&arcaneCard(c)&&en.hp>0)globalThis.addCond?.(en,'Weakened')
 if(damage>0&&eq(h,'EQ072')&&s.eq072Round!==G().round&&en.hp>0){s.eq072Round=G().round;en.eq072ArmorPenalty33612=1;en.eq072ArmorPenaltyRound33612=G().round;logx('Wand of Shadows — Dark Hex: target suffers -1 Armor until start of your next turn.')}if(damage>0&&eq(h,'EQ072')&&/spell|arcane/i.test(tags(c))&&confirm('Wand of Shadows — Shadow Step: move to a connected Location?'))freeMove(h,'Shadow Step',1)
 if(damage>0&&eq(h,'EQ073')&&s.eq073Round!==G().round&&en.hp>0){s.eq073Round=G().round;let pick=prompt('Wand of Curses — Hex: 1 = -2 Attack, 2 = -2 Armor, 3 = -2 Movement','1');if(pick==='2'){en.eq073ArmorPenalty33612=2;en.eq073PenaltyRound33612=G().round}else if(pick==='3'){en.eq073MovePenalty33612=2;en.eq073PenaltyRound33612=G().round}else{en.eq073AttackPenalty33612=2;en.eq073PenaltyRound33612=G().round}logx('Wand of Curses — Hex applied through the target’s next activation.')}
 if(damage>0&&eq(h,'EQ075')&&fireCard(c))heal(h,1,'Wand of the Phoenix — Phoenix Flame')
 if(dead&&eq(h,'EQ117')){let allies=hereHeroes(h,false);let ally=choose(allies,"Captain's Warblade — choose ally to Move",x=>globalThis.heroDisplayName?.(x)||x);if(ally)freeMove(ally,'Commanding Strike',1)}
 if(dead&&eq(h,'EQ118')&&noOtherHeroAtEnemy(h,en))globalThis.addHeroCondition?.(h,'Hidden')
 if(damage>0&&eq(h,'EQ121')&&!forBasic&&fireCard(c)){/* +1 was folded into post damage before this hook */}
 if(damage>0&&eq(h,'EQ122')&&!forBasic&&lightningCard(c)&&markOnce(h,'eq122','round')){let other=secondEnemy(q,en);if(other)directEnemy(h,{en:other,t:q.t},1,'Storm Wand — Static Focus')}
 if(damage>0&&eq(h,'EQ125')&&markOnce(h,'eq125','round')&&en.hp>0)en.eq125Guide33612={owner:h,round:G().round}
 if(damage>0&&eq(h,'EQ132')&&en.hp>0&&en.enteredLocRound33612===G().round&&en.enteredLocKey33612===kxy(pos(h).x,pos(h).y)&&markOnce(h,'eq132','round')&&confirm(`Fighting Spear — Keep Back: Push ${en.name}?`)){let ref=enemyRef(en);if(ref)moveEnemy(h,ref,'Keep Back')}
 if(damage>0&&eq(h,'EQ115')&&markOnce(h,'eq115','round')&&globalThis.hasCond?.(en,'Guarded')){try{let a=en.conditions||[],i=a.findIndex(x=>cname(x)==='Guarded');if(i>=0)a.splice(i,1)}catch(_){};logx('Sunhammer — Radiant Impact removes Guarded.')}
 if(dead&&eq(h,'EQ002')&&confirm('Iron Shortsword — Quick Strike: move to a connected revealed Location for free?'))freeMove(h,'Quick Strike',1);
 if(dead&&eq(h,'EQ011')){let other=(globalThis.livingEnemies?.(q.t)||[])[0];if(other&&confirm(`Greatsword of the Vanguard — Cleave: make a free Attack against ${other.name}?`))freeBasic33612(h,{en:other,t:q.t,dist:0},'Cleave');}
 if(eq(h,'EQ047')&&sameLocEnemyCount(h)===0&&confirm('Elven Longbow — Graceful Shot: move to a connected revealed Location?'))freeMove(h,'Graceful Shot',1);
 if(dead&&eq(h,'EQ084')){globalThis.addHeroCondition?.(h,'Hidden');logx(`Shadowleather Coat — Fade Away: ${globalThis.heroDisplayName?.(h)||h} gains Hidden.`)}
 if(damage>0&&en.hp>0&&eq(h,'EQ041')&&!s.eq041Resolving&&!used(h,'eq041','round')&&confirm(`Twinfang Blades — Twin Strike: make a second Attack against ${en.name} for -1 Damage?`)){markOnce(h,'eq041','round');s.eq041Resolving=true;try{freeBasic33612(h,q,'Twin Strike',-1)}finally{s.eq041Resolving=false}if(confirm('Twinfang Blades — Flurry: Move 1 connected Location for free?'))freeMove(h,'Flurry',1)}
 if(damage>0&&eq(h,'EQ048')&&ctx?.ranged&&!s.eq048Resolving&&!used(h,'eq048','round')){let opts=enemiesInRange(h,Number(globalThis.equipmentRange?.(h)||0)).filter(z=>z.en!==en);if(opts.length&&confirm('Recurve Bow — Rapid Shot: make a second ranged Attack against a different target for -1 Damage?')){let q2=opts.length===1?opts[0]:choose(opts,'Rapid Shot — choose a different target',z=>`${z.en.name} — ${z.t.name}`);if(q2){markOnce(h,'eq048','round');s.eq048Resolving=true;try{freeBasic33612(h,q2,'Rapid Shot',-1)}finally{s.eq048Resolving=false}}}}
}

function installAttackPipeline(){
 // Basic Attack gets its own equipment channel so the combat log does not mislabel Equipment as a Hero Card.
 globalThis.equipmentBasicAttackMods33612=function(h,en,q){let ctx=baseExtraAttackMods(h,{id:'BASIC',name:'Basic Attack',category:'Attack'},q,true);es(h).lastBasic33612={en,q,before:Number(en?.hp||0),ctx};return{bonus:ctx.bonus,ignore:ctx.ignore,notes:ctx.notes}};
 globalThis.equipmentBasicAttackAfter33612=function(h,en,dead,q){let rec=es(h).lastBasic33612;if(!rec||rec.en!==en)return;delete es(h).lastBasic33612;let before=rec.before,damage=Math.max(0,before-Number(en.hp||0));if(rec.ctx.post&&en.hp>0)directEnemy(h,q,rec.ctx.post,'Equipment bonus damage');try{globalThis.equipmentAfterDamage321?.(h,en,Math.max(0,before-Number(en.hp||0)),Number(en.hp||0)<=0)}catch(_){};afterExtraAttack(h,{id:'BASIC',name:'Basic Attack',category:'Attack'},q,damage,Number(en.hp||0)<=0,{...rec.ctx,post:0},true)};
 if(typeof globalThis.runtimeHeroAttackEnemy==='function'){const old=globalThis.runtimeHeroAttackEnemy;globalThis.runtimeHeroAttackEnemy=function(h,c,q,b=0,ig=0){let ctx=baseExtraAttackMods(h,c,q,false),before=Number(q?.en?.hp||0),r=old.call(this,h,c,q,Number(b||0)+ctx.bonus,Math.max(Number(ig||0),ctx.ignore)),damage=Math.max(0,before-Number(q?.en?.hp||0));if(ctx.post&&q?.en?.hp>0)directEnemy(h,q,ctx.post,'Equipment bonus damage');afterExtraAttack(h,c,q,damage,Number(q?.en?.hp||0)<=0,{...ctx,post:0},false);return Number(q?.en?.hp||0)<=0||r};}
 // Effective enemy Armor honors temporary equipment debuffs.
 if(typeof globalThis.effArmor==='function'){const old=globalThis.effArmor;globalThis.effArmor=function(en){let n=Number(old.apply(this,arguments)||0),r=Number(G()?.round||0);if(en?.eq072ArmorPenaltyRound33612===r)n-=Number(en.eq072ArmorPenalty33612||0);if(en?.eq073PenaltyRound33612===r)n-=Number(en.eq073ArmorPenalty33612||0);return Math.max(0,n)}}
 // Track enemy activation / entry for cards that key off those events.
 if(typeof globalThis.enemyStartActivation322==='function'){const old=globalThis.enemyStartActivation322;globalThis.enemyStartActivation322=function(en,p){en.activatedRound33612=G()?.round;return old.apply(this,arguments)}}
 if(typeof globalThis.extraEnemyEntryReactionWindow==='function'){const old=globalThis.extraEnemyEntryReactionWindow;globalThis.extraEnemyEntryReactionWindow=async function(en,p){try{en.enteredLocRound33612=G()?.round;en.enteredLocKey33612=kxy(p.x,p.y);for(const h of (globalThis.partyHeroes?.()||[])){let hp=pos(h);if(hp.x===p.x&&hp.y===p.y&&eq(h,'EQ111')){es(h).braceEnemy=en;es(h).braceRound=G().round}if(hp.x===p.x&&hp.y===p.y&&eq(h,'EQ138')&&!used(h,'eq138','enc')){markOnce(h,'eq138','enc');es(h).closeGuardEnemy=en;es(h).closeGuardRound=G().round}if(hp.x===p.x&&hp.y===p.y&&eq(h,'EQ030')&&markOnce(h,'eq030','round')&&confirm(`Steel Spear — Brace: make a free melee Attack against ${en.name}?`)){let er=enemyRef(en);if(er)freeBasic33612(h,er,'Steel Spear — Brace')}}}catch(_){}return old.apply(this,arguments)}}
}

function installDefenseHealing(){
 // Apply Equipment protections to every damage source routed through the shared damage function.
 if(typeof globalThis.damageHeroBy==='function'){const old=globalThis.damageHeroBy;globalThis.damageHeroBy=function(h,n,label='Effect'){n=Number(n||0);let s=es(h),txt=String(label||''),round=Number(G()?.round||0),hp=heroHp(h);for(const a of (globalThis.partyHeroes?.()||[])){if(a!==h&&sameLoc(a,h)&&eq(a,'EQ092')&&markOnce(a,'eq092','round')&&n>0){n=Math.max(0,n-1);logx(`Knight's Plate — Protector: damage to ${globalThis.heroDisplayName?.(h)||h} reduced by 1.`);break}}
   if(n>0&&eq(h,'EQ077')&&/attack/i.test(txt)&&markOnce(h,'eq077','round')){n=Math.max(0,n-1);logx('Wooden Buckler — Quick Block: damage reduced by 1.')}
   if(n===1&&eq(h,'EQ083')&&markOnce(h,'eq083','round')){n=0;logx('Studded Leather — Reinforced: 1 damage reduced to 0.')}
   if(n>0&&eq(h,'EQ085')&&/hazard/i.test(txt)&&s.eq085Enc!==encKey()){s.eq085Enc=encKey();n=0;logx("Warden's Hide — Trailwise: first Hazard damage ignored.")}
   if(n>0&&eq(h,'EQ090')&&/lightning|storm|spark|thunder/i.test(txt)){n=Math.max(0,n-2);logx('Stormwoven Mail — Grounded: Lightning damage reduced by 2.')}
   if(n>0&&eq(h,'EQ094')&&/fire|burn|flame|ember/i.test(txt)){n=Math.max(0,n-2);logx('Dragonhide Cuirass — Fire damage reduced by 2.')}
   if(n>0&&eq(h,'EQ096')&&/magic|magical|arcane|fire|cold|frost|lightning|radiant|shadow|element/i.test(txt)&&markOnce(h,'eq096','round')){n=Math.max(0,n-2);logx('Runed Battlerobes — Runic Ward: damage reduced by 2.')}
   if(n>0&&eq(h,'EQ135')&&/magic|magical|arcane|fire|cold|frost|lightning|radiant|shadow|element/i.test(txt)&&markOnce(h,'eq135','round')){n=Math.max(0,n-1);logx("Initiate's Robes — Spellguard: damage reduced by 1.")}
   if(n>0&&eq(h,'EQ137')&&/hazard|environment|beast|wolf|bear|spider|warg|owlbear/i.test(txt)&&markOnce(h,'eq137','round')){n=Math.max(0,n-1);logx('Hardened Hide — Weathered: damage reduced by 1.')}
   if(n>0&&eq(h,'EQ140')&&/self|own effect|overload|volatile|reckless|blood price|mana burn/i.test(txt)&&markOnce(h,'eq140','round')){n=Math.max(0,n-1);logx('Ember Charm — Heat Sink: self-damage reduced by 1.')}
   if(n>0&&s.steadfastPrayerRound===round){n=Math.max(0,n-1);delete s.steadfastPrayerRound;logx("Pilgrim's Holy Symbol — Steadfast Prayer: next source reduced by 1 Armor-equivalent.")}
   let fatal=n>=hp&&hp>0;
   if(fatal){let prevented=false;for(const id of ['EQ012','EQ050','EQ094'])if(eq(h,id)&&!used(h,`${id}death`,'enc')){markOnce(h,`${id}death`,'enc');n=Math.max(0,hp-1);prevented=true;logx(`${globalThis.equipmentById?.(id)?.name||id}: defeat prevented; ${globalThis.heroDisplayName?.(h)||h} remains at 1 Health.`);break}
    if(!prevented&&eq(h,'EQ075')&&!s.eq075CampaignSpent&&confirm("Wand of the Phoenix — Rebirth: discard this Equipment to recover to 50% Health instead of being Defeated?")){s.eq075CampaignSpent=true;n=0;let slot=G()?.equipped?.[h];if(slot){for(const k of ['Weapon','Offhand','Shield','Armor'])if(slot[k]==='EQ075')slot[k]=null;if(Array.isArray(slot.Accessory))slot.Accessory=slot.Accessory.filter(x=>x!=='EQ075')}setHeroHp(h,Math.max(1,Math.ceil(heroMax(h)/2)));clearNegative(h);prevented=true;logx('Wand of the Phoenix — Rebirth: recovered to 50% Health and removed negative Conditions.')}
    let ph=partyItem('LT157');if(!prevented&&ph&&!G()?.campaign?.phoenixHeartSpent33612&&confirm('Phoenix Heart — prevent this Defeat and restore the Hero to full Health?')){G().campaign=G().campaign||{};G().campaign.phoenixHeartSpent33612=true;n=0;setHeroHp(h,heroMax(h));clearNegative(h);prevented=true;logx('Phoenix Heart: Defeat prevented; Hero restored to full Health. Treasure marked spent for this Campaign.')}
   }
   return old.call(this,h,n,label);
  }}
 // Healing triggers: Staff of Renewal and Pilgrim's Holy Symbol.
 if(typeof globalThis.healHeroBy==='function'){const old=globalThis.healHeroBy;globalThis.healHeroBy=function(target,n,label='Effect'){if(eq(target,'EQ099')&&/\bRest\b/i.test(String(label)))n=Number(n||0)+1;let before=heroHp(target),r=old.call(this,target,n,label),gained=Math.max(0,heroHp(target)-before),healer=G()?.equipmentLootActingHero33612||globalThis.controlledHero?.();if(gained>0&&healer&&healer!==target&&eq(healer,'EQ065')){old.call(this,target,2,'Staff of Renewal — Healing Surge');logx('Staff of Renewal — Healing Surge: +2 additional Health.')}if(gained>0&&healer&&healer!==target&&eq(healer,'EQ142')&&markOnce(healer,'eq142','round')){es(target).steadfastPrayerRound=G().round;logx("Pilgrim's Holy Symbol — Steadfast Prayer: healed ally gains +1 Armor against the next damage source this round.")}return r}}
 // Equipment defensive riders that know the attacking Enemy/range.
 if(typeof globalThis.runtimeHeroReactionWindow==='function'){const old=globalThis.runtimeHeroReactionWindow;globalThis.runtimeHeroReactionWindow=async function(en,target,die,atk,raw,range){let out=await old.apply(this,arguments)||{},h=target?.id;if(!h)return out;out.reduce=Number(out.reduce||0);out.armor=Number(out.armor||0);if(eq(h,'EQ003')&&Number(range||0)===0&&markOnce(h,'eq003','round'))out.reduce+=1;if(eq(h,'EQ087')&&Number(range||0)>0&&markOnce(h,'eq087','round'))out.reduce+=1;if(eq(h,'EQ088')&&/goblin/i.test(enemyTags(en)))out.armor+=1;if(eq(h,'EQ138')&&es(h).closeGuardEnemy===en&&es(h).closeGuardRound===G().round){out.armor+=1;delete es(h).closeGuardEnemy;delete es(h).closeGuardRound;logx('Brigandine Vest — Close Guard: +1 Armor against this Enemy Attack.')}return out}}
 // Enemy post-damage riders.
 if(typeof globalThis.enemyAfterDamage322==='function'){const old=globalThis.enemyAfterDamage322;globalThis.enemyAfterDamage322=function(en,p,target,dmg){let r=old.apply(this,arguments),h=target?.id;if(h&&Number(dmg||0)===0&&Number(en?.range||0)===0&&eq(h,'EQ004')&&markOnce(h,'eq004','round')){let q=enemyRef(en);if(q)freeBasic33612(h,q,'Steel Longsword — Riposte')}if(h&&Number(dmg||0)===0&&eq(h,'EQ080')&&markOnce(h,'eq080','round')){let q=enemyRef(en);if(q){directEnemy(h,q,1,'Spiked Shield — Shield Bash');if(q.en.hp>0&&confirm(`Spiked Shield — Brutal Counter: Push ${q.en.name}?`))moveEnemy(h,q,'Brutal Counter')}}if(h&&dmg>0&&eq(h,'EQ090')&&markOnce(h,'eq090reprisal','round')&&en?.hp>0){let q=enemyRef(en);if(q)directEnemy(h,q,1,'Stormwoven Mail — Static Reprisal')}if(h&&dmg>0&&eq(h,'EQ108')&&!used(h,'eq108','enc')){markOnce(h,'eq108','enc');globalThis.addHeroCondition?.(h,'Hidden');if(confirm('Cloak of Vanishing — Vanish: move to a connected revealed Location?'))freeMove(h,'Vanish',1)}return r}}
}

function activeEquipmentAbility33612(h,id){
 if(!eq(h,id)||globalThis.heroDefeated?.(h)){logx('EQUIPMENT: ability cannot be used by this Hero.');return false}
 if(String(G()?.phase||'')!=='Hero Phase'){logx('EQUIPMENT: active abilities may be used during the Hero Phase.');return false}
 let s=es(h),enc=encKey(),p=pos(h),range=Number(globalThis.equipmentRange?.(h)||0);
 if(id==='EQ020'){
  if(s.eq020Enc===enc){logx('Worldsplitter — Earthshatter has already been used this encounter.');return false}
  let t=curTile(h),targets=[...(globalThis.livingEnemies?.(t)||[])];if(!targets.length){logx('Worldsplitter — Earthshatter requires at least one Enemy in your Location.');return false}
  if(!confirm(`Worldsplitter — Earthshatter: deal 4 Physical Damage to all ${targets.length} Enem${targets.length===1?'y':'ies'} here and Knock Down survivors?`))return false;
  s.eq020Enc=enc;for(const en of targets){let q={en,t,dist:0};directEnemy(h,q,4,'Worldsplitter — Earthshatter');if(en.hp>0)globalThis.addCond?.(en,'Knocked Down')}renderx();return true
 }
 if(id==='EQ051'){
  if(s.eq051Enc===enc){logx('Starfall Longbow — Falling Star has already been used this encounter.');return false}
  let tiles=[];for(const [k,t] of Object.entries(G()?.tiles||{})){let [x,y]=k.split(',').map(Number),d=dist(p,{x,y});if(d<=range&&(globalThis.livingEnemies?.(t)||[]).length)tiles.push({t,x,y,d})}
  let q=choose(tiles,'Starfall Longbow — Falling Star: choose a Location',z=>`${z.t.name} — ${(globalThis.livingEnemies?.(z.t)||[]).length} Enemies`);if(!q)return false;
  s.eq051Enc=enc;for(const en of [...(globalThis.livingEnemies?.(q.t)||[])])directEnemy(h,{en,t:q.t,dist:q.d},4,'Starfall Longbow — Falling Star');renderx();return true
 }
 if(id==='EQ120'){
  if(s.eq120Enc===enc){logx('Starfall Staff — Starfall has already been used this encounter.');return false}
  let tiles=[];for(const [k,t] of Object.entries(G()?.tiles||{})){let [x,y]=k.split(',').map(Number),d=dist(p,{x,y});if(d<=range&&(globalThis.livingEnemies?.(t)||[]).length)tiles.push({t,x,y,d})}
  let q=choose(tiles,'Starfall Staff — Starfall: choose a Location',z=>`${z.t.name} — ${(globalThis.livingEnemies?.(z.t)||[]).length} Enemies`);if(!q)return false;
  s.eq120Enc=enc;let roll=1+Math.floor(Math.random()*6),wb=Number(globalThis.equipmentAttack?.(h)||0);logx(`Starfall Staff — Starfall: d6 ${roll} + Weapon Bonus ${wb}.`);for(const en of [...(globalThis.livingEnemies?.(q.t)||[])]){let dmg=Math.max(0,roll+wb-enemyArmor(en));directEnemy(h,{en,t:q.t,dist:q.d},dmg,'Starfall Staff — Starfall')}q.t.tempArcane33612UntilRound=Number(G()?.round||0)+1;logx(`${q.t.name} becomes an Arcane Location through the end of the next round.`);renderx();return true
 }
 return false
}
function installActiveEquipmentUI(){
 globalThis.activateEquipment33612=activeEquipmentAbility33612;
 if(typeof globalThis.renderInventory!=='function')return;const old=globalThis.renderInventory;globalThis.renderInventory=function(){let r=old.apply(this,arguments);try{let h=globalThis.controlledHero?.();for(const id of ['EQ020','EQ051','EQ120']){if(!eq(h,id))continue;let def=globalThis.equipmentById?.(id);for(const card of document.querySelectorAll('#equippedList .invCard')){if(!def||!card.textContent.includes(def.name)||card.querySelector(`[data-active-eq="${id}"]`))continue;let box=card.querySelector('.invActions')||(()=>{let x=document.createElement('div');x.className='invActions';card.appendChild(x);return x})(),b=document.createElement('button');b.textContent='Use Ability';b.dataset.activeEq=id;b.onclick=()=>activeEquipmentAbility33612(h,id);box.prepend(b)}}}catch(e){logx(`EQUIPMENT UI: ${e}`)}return r}
}

function installStatusAndCardHooks(){
 // Track the acting Hero while a card resolves so status-driven accessories know who caused the status.
 if(typeof globalThis.playExtraCard==='function'){const old=globalThis.playExtraCard;globalThis.playExtraCard=function(c){let h=globalThis.controlledHero?.(),s=st(h),beforeA=Number(globalThis.heroActionCount?.(h)||0);G().equipmentLootActingHero33612=h;try{return old.apply(this,arguments)}finally{G().equipmentLootActingHero33612=null;let afterA=Number(globalThis.heroActionCount?.(h)||0);if(eq(h,'EQ110')&&Number(c?.cost||0)>=2&&afterA<beforeA&&markOnce(h,'eq110','round')){addActions(h,1);logx('Relic of Ascendance — Ascendant Will: recover 1 Action after playing a 2-Action Hero card.')}}}}
 if(typeof globalThis.addEnemyStatus==='function'){const old=globalThis.addEnemyStatus;globalThis.addEnemyStatus=function(en,n){let h=G()?.equipmentLootActingHero33612||globalThis.controlledHero?.(),r=old.apply(this,arguments);if(h&&eq(h,'EQ141')&&markOnce(h,'eq141','round')){let s=es(h);s.spiritMarkTarget=en;s.spiritMarkRound=G().round;logx(`Carved Totem — Spirit Mark: next Attack against ${en.name} this round gains +1 Attack.`)}return r}}
 // Field Toolkit: device/object Hero-card effects cost 1 less once per round.
 if(typeof globalThis.extraCardActionCost32611==='function'){const old=globalThis.extraCardActionCost32611;globalThis.extraCardActionCost32611=function(h,c,s){let cost=Number(old.apply(this,arguments));let device=/device|object|turret|trap|snare|totem|servant|ward|repair|place|interact/i.test(String([c?.name,c?.rules,c?.traits,c?.keywords,c?.category].filter(Boolean).join(' ')));if(eq(h,'EQ144')&&device&&!used(h,'eq144','round')&&cost>0){c._fieldToolkit33612=true;cost=Math.max(0,cost-1)}return cost}}
 // Consume Field Toolkit only after the card leaves hand / resolves.
 if(typeof globalThis.discardExtraCard==='function'){const old=globalThis.discardExtraCard;globalThis.discardExtraCard=function(h,c){let r=old.apply(this,arguments);if(c?._fieldToolkit33612){delete c._fieldToolkit33612;markOnce(h,'eq144','round');logx('Field Toolkit — Prepared Hands: Action Cost reduced by 1.')}return r}}
}

function installCompatibilityHooks(){
 // Route legacy H001-H003 damage through the same authoritative damage pipeline used by expanded Heroes.
 // This is what lets Equipment/Relic prevention, defeat prevention, and Hero-card damage reactions see the hit.
 if(typeof globalThis.damageHero==='function'&&typeof globalThis.damageHeroBy==='function'){
  const old=globalThis.damageHero;
  globalThis.damageHero=function(q,d){
   let h=q?.id;
   if(h&&['Aldric','Lyra','Seraphine'].includes(h))return globalThis.damageHeroBy(h,d,'ENEMY ATTACK');
   return old.apply(this,arguments);
  };
 }
 // Guarded is the shared condition name; Aldric's oldest armor calculator still reads the legacy "Guard" name.
 if(typeof globalThis.aldricArmor==='function'){
  const old=globalThis.aldricArmor;
  globalThis.aldricArmor=function(){let v=Number(old.apply(this,arguments)||0);try{if(globalThis.heroHasCondition?.('Aldric','Guarded')&&!globalThis.heroHasCondition?.('Aldric','Guard'))v+=1}catch(_){}return v};
 }
 // Full-roster Torch/Lantern Oil support for Dark/visibility caps.
 if(typeof globalThis.rangedVisibilityCap==='function'){
  const old=globalThis.rangedVisibilityCap;
  globalThis.rangedVisibilityCap=function(h,from,to){try{if(Number(es(h).ignoreVisibilityThroughRound||-1)>=Number(G()?.round||0))return 999}catch(_){}return old.apply(this,arguments)};
 }
 // Iron Plate: no more than 2 paid Move Actions during a Hero turn.
 function heavyMoveWrap(name,heroGetter){let fn=globalThis[name];if(typeof fn!=='function')return;globalThis[name]=function(){let h=heroGetter(),s=es(h),r=Number(G()?.round||0);if(eq(h,'EQ091')&&s.heavyMoveRound===r&&Number(s.heavyMoveActions||0)>=2){logx(`Iron Plate — Heavy: ${globalThis.heroDisplayName?.(h)||h} cannot spend more than 2 Move Actions this turn.`);return false}let a0=Number(globalThis.heroActionCount?.(h)||0),out=fn.apply(this,arguments),a1=Number(globalThis.heroActionCount?.(h)||0);if(eq(h,'EQ091')&&a1<a0){if(s.heavyMoveRound!==r){s.heavyMoveRound=r;s.heavyMoveActions=0}s.heavyMoveActions+=Math.max(1,a0-a1)}return out}}
 heavyMoveWrap('move',()=> 'Aldric');heavyMoveWrap('moveLyra',()=> 'Lyra');heavyMoveWrap('moveSeraphine',()=> 'Seraphine');heavyMoveWrap('runtimeHeroMove',()=>globalThis.controlledHero?.());
 // Aldric/Lyra already read smokeBombRound. Bring Seraphine and runtime Heroes onto the same movement rule.
 function smokeMoveWrap(name,heroGetter){let fn=globalThis[name];if(typeof fn!=='function')return;globalThis[name]=function(){let h=heroGetter(),t=curTile(h);if(t&&t.smokeBombRound===G()?.round&&(globalThis.livingEnemies?.(t)||[]).length){let keep=t.enemies;t.enemies=[];try{return fn.apply(this,arguments)}finally{t.enemies=keep}}return fn.apply(this,arguments)}}
 smokeMoveWrap('moveSeraphine',()=> 'Seraphine');
 smokeMoveWrap('runtimeHeroMove',()=>globalThis.controlledHero?.());
}

function installRoundHooks(){
 if(typeof globalThis.endTurn==='function'){const old=globalThis.endTurn;globalThis.endTurn=async function(){let before=Number(G()?.round||0);for(const h of (globalThis.partyHeroes?.()||[])){if(eq(h,'EQ034')&&sameLocEnemyCount(h)===0)es(h).flowingArmorUntilRound=before+1}let r=await old.apply(this,arguments);if(Number(G()?.round||0)!==before){for(const h of (globalThis.partyHeroes?.()||[])){if(eq(h,'EQ066')&&naturalTile(h))heal(h,1,'Staff of the Ancient Grove — Nature’s Blessing');let s=es(h);if(Number(s.focusTonicThroughRound||0)<Number(G().round||0))try{globalThis.removeHeroCondition?.(h,'Inspired')}catch(_){}}for(const t of Object.values(G()?.tiles||{}))for(const en of (t.enemies||[])){if(en.eq072ArmorPenaltyRound33612<Number(G().round||0)){delete en.eq072ArmorPenalty33612;delete en.eq072ArmorPenaltyRound33612}if(en.eq073PenaltyRound33612<Number(G().round||0)){delete en.eq073ArmorPenalty33612;delete en.eq073AttackPenalty33612;delete en.eq073MovePenalty33612;delete en.eq073PenaltyRound33612}}}return r}}
 // Shard of the Ascendant at Main Quest start.
 if(typeof globalThis.startCampaignQuest==='function'){const old=globalThis.startCampaignQuest;globalThis.startCampaignQuest=function(qid){let r=old.apply(this,arguments);try{let owner=partyItem('LT149'),rk=`${qid}:${G()?.campaign?.day??0}:${G()?.campaign?.questAttempt??G()?.campaign?.attempt??0}`;if(owner&&/^Q\d+/i.test(String(qid||''))&&!G().relicShardQuest33612?.[rk]){G().relicShardQuest33612=G().relicShardQuest33612||{};G().relicShardQuest33612[rk]=true;if(G().campaign?.usesAscendanceTokens){G().campaign.ascendanceTokens=(G().campaign.ascendanceTokens||0)+1;logx('Shard of the Ascendant: +1 Ascendance Token.')}else{globalThis.drawCardsForHero?.(owner.h,1);logx(`Shard of the Ascendant: ${globalThis.heroDisplayName?.(owner.h)||owner.h} draws 1 Hero card (campaign has no Ascendance Token system).`)}}}catch(_){}return r}}
}

function installRelicsCrafting(){
 // LT159 Crystal of Creation is intentionally NOT auto-wired here: the crafting engine validates and consumes
 // materials in separate paths. Enabling only recipe eligibility would allow a false-positive craft and then
 // consume the wrong materials. Keep the item intact until a single authoritative material-substitution hook exists.
 globalThis.ascEquipmentLootParity33612=()=>({build:V,equipmentRows:globalThis.EQUIPMENT_CARDS?.length||144,equipmentRuntimeCovered:137,equipmentRuleBlocked:7,consumables:30,consumablesOperational:28,consumablesRuleBlocked:2,fullRosterConsumables:true,basicAttackEquipmentPipeline:true,starterEquipment121_144:true,relicLegendaryHooks:['LT149','LT157'],relicLegendaryRuleBlocked:['LT150','LT159'],knownRuleBlocks:['LT012 Rest action','LT026 Locked/Trap interaction','LT150 extra Hero turn semantics','LT159 crafting material substitution','EQ013 terrain/structure adjacency','EQ025 Stagger Save','EQ044 Advantage + extra full turn','EQ055 Rapid Fire/reload action semantics','EQ068 encounter stance + generic Ability cooldown','EQ103 authoritative Travel Severity reroll','EQ116 Hero attack-die reroll']});
}

function install(){if(installed)return;if(typeof globalThis.heroHasEquipped!=='function'||typeof globalThis.useConsumable!=='function'||typeof globalThis.runtimeHeroAttackEnemy!=='function')return setTimeout(install,250);installed=true;installConsumables();installMovementAndStats();installAttackPipeline();installDefenseHealing();installActiveEquipmentUI();installStatusAndCardHooks();installCompatibilityHooks();installRoundHooks();installRelicsCrafting();
 function mark(){try{globalThis.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;let e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}catch(_){}}
 mark();setTimeout(mark,250);setTimeout(mark,1800);setTimeout(mark,5200);setTimeout(mark,8200);let markerTimer=setInterval(mark,500);setTimeout(()=>clearInterval(markerTimer),15000);logx('3.36.12 EQUIPMENT + LOOT PARITY: full-roster Consumable and Equipment/Relic audit layer loaded.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,60));else setTimeout(install,60);setTimeout(install,1400);
})();
