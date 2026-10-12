// Ascendance 3.36.13 — automatic-hit equipment alignment
// Removes all Hero attack-roll / critical-hit dependencies from the six audited weapons
// and supplies deterministic runtime mechanics for their printed rules.
(function(){
  'use strict';
  const V='3.36.13';
  function setBuild33613(){
    try{
      window.ASCENDANCE_BUILD=V;
      document.documentElement.dataset.ascendanceBuild=V;
      const e=document.querySelector('.frontVersion32714'); if(e)e.textContent='v'+V;
    }catch(_){ }
  }
  setBuild33613();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setBuild33613);
  [250,1800,5200,8000].forEach(ms=>setTimeout(setBuild33613,ms));
  const corrected={
    EQ006:{value:'560 Gold',ability1:'Blazing Strike — once each turn when you deal damage, deal +1 Fire Damage.',ability2:'Ignite — once per encounter, after an Attack with this weapon deals 4 or more Damage to an Enemy, that Enemy gains Burning.'},
    EQ008:{value:'Priceless',ability1:"Dragon's Might — ignore 2 Armor when dealing damage.",ability2:'Legendary Blade — once per encounter, when declaring an Attack with this weapon, declare Dragon Strike. That Attack gains +3 Attack and ignores all Armor.'},
    EQ010:{value:'300 Gold',ability1:'Precise Strike — once per turn, when attacking the only Enemy in your Location, gain +1 Attack.',ability2:'Riposte Master — once per Round after a melee Enemy Attack against you resolves, you may spend 1 Action to make a Basic Attack against that Enemy if it is a legal target.'},
    EQ056:{value:'375 Gold',ability1:'Deadeye — if you did not Move this turn, gain +2 Attack.',ability2:'Heartseeker — once per turn, if you did not Move this turn, an Attack with this weapon ignores 2 Armor.'},
    EQ116:{value:'335 Gold',ability1:'Channel — once per Round, when a damaging Hero Card uses your Weapon Bonus, that Attack gains +1 Attack.',ability2:'Arcane Location — while in an Arcane Location, Channel grants +2 Attack instead of +1.'},
    EQ119:{value:'Artifact',ability1:'Cinder Edge — ignore 1 Armor.',ability2:'Last Ember — once per encounter, after you suffer damage that leaves you at half your Maximum Health or less, your next Attack before the end of your next turn gains +3 Attack.'}
  };

  try{
    if(typeof EQUIPMENT_CARDS!=='undefined'){
      for(const [id,patch] of Object.entries(corrected)){
        const e=EQUIPMENT_CARDS.find(x=>x.id===id); if(e)Object.assign(e,patch);
      }
    }
  }catch(e){console.warn('3.36.13 equipment text patch failed',e)}

  function S(){
    if(typeof g==='undefined'||!g)return null;
    const s=g.equipmentAutoHit33613||(g.equipmentAutoHit33613={lastRound:Number(g.round||1),encounterUsed:{},roundUsed:{},movedRound:{},lastEmber:{}});
    const r=Number(g.round||1);
    if(r<s.lastRound){s.encounterUsed={};s.roundUsed={};s.movedRound={};s.lastEmber={};}
    s.lastRound=r; return s;
  }
  function has(h,id){try{return typeof heroHasEquipped==='function'&&heroHasEquipped(h,id)}catch(_){return false}}
  function roundUsed(key){const s=S();return !!s&&s.roundUsed[key]===Number(g.round||0)}
  function useRound(key){const s=S();if(s)s.roundUsed[key]=Number(g.round||0)}
  function encounterUsed(key){const s=S();return !!s&&!!s.encounterUsed[key]}
  function useEncounter(key){const s=S();if(s)s.encounterUsed[key]=true}
  function movedThisTurn(h){const s=S();return !!s&&s.movedRound[h]===Number(g.round||0)}
  function markMoved(h){const s=S();if(s)s.movedRound[h]=Number(g.round||0)}
  function pos(h){try{return heroPos(h)}catch(_){return null}}
  function tile(h){const p=pos(h);try{return p&&g.tiles&&g.tiles[key(p.x,p.y)]}catch(_){return null}}
  function arcaneHere(h){const t=tile(h);if(!t)return false;return !!((t.traits||[]).some(x=>/arcane/i.test(String(x)))||(t.arcaneSources32521||[]).length||Number(t.arcaneUntilRound||0)>=Number(g.round||0)||(g.arcaneWard3259&&g.arcaneWard3259.locationKey===key(pos(h).x,pos(h).y)))}
  function cardUsesWeapon(card){if(!card)return false;const cat=String(card.category||''),rules=String(card.rules||'');return /^Attack$/i.test(cat)||/\bmake (?:a|an|one|up to|two|three)?\s*Attack/i.test(rules)||/\bAttack with\b/i.test(rules)}
  function onlyEnemyInLocation(h,en){const t=tile(h);if(!t)return false;const live=typeof livingEnemies==='function'?livingEnemies(t):(t.enemies||[]).filter(x=>x.hp>0);return live.length===1&&live[0]===en}
  function removeEnemy(en){try{const q=findE(en);if(q){q.t.enemies=(q.t.enemies||[]).filter(x=>x!==en);return q.t}}catch(_){}return null}
  function credit(h,en,label){try{if(typeof creditKill3259==='function')creditKill3259(h,en,label)}catch(_){}try{q001AfterEnemyDefeat&&q001AfterEnemyDefeat()}catch(_){} }

  function prepare(h,en,opt={}){
    const c={bonus:0,ignore:0,notes:[],postBaseDamage:0};
    if(!h||!en)return c;
    if(has(h,'EQ008')){
      c.ignore=Math.max(c.ignore,2);c.notes.push("Dragon's Might: ignore 2 Armor");
      if(!encounterUsed(h+':EQ008:DragonStrike')&&confirm('Dragonsteel Longsword — declare Dragon Strike for this Attack? (+3 Attack, ignore all Armor; once per encounter)')){
        c.bonus+=3;c.ignore=99;c.notes.push('Dragon Strike +3 / ignore all Armor');useEncounter(h+':EQ008:DragonStrike');
      }
    }
    if(has(h,'EQ010')&&onlyEnemyInLocation(h,en)&&!roundUsed(h+':EQ010:Precise')){
      c.bonus+=1;c.notes.push('Precise Strike +1');useRound(h+':EQ010:Precise');
    }
    if(has(h,'EQ056')&&!movedThisTurn(h)){
      c.bonus+=2;c.notes.push('Deadeye +2');
      if(!roundUsed(h+':EQ056:Heartseeker')){c.ignore+=2;c.notes.push('Heartseeker: ignore 2 Armor');useRound(h+':EQ056:Heartseeker')}
    }
    if(has(h,'EQ116')&&opt.isHeroCard&&cardUsesWeapon(opt.card)&&!roundUsed(h+':EQ116:Channel')){
      const b=arcaneHere(h)?2:1;c.bonus+=b;c.notes.push(`Channel +${b}${b===2?' (Arcane Location)':''}`);useRound(h+':EQ116:Channel');
    }
    const s=S(),le=s?.lastEmber?.[h];
    if(has(h,'EQ119')&&le&&Number(g.round||0)<=Number(le.expiresRound||0)){
      c.bonus+=3;c.notes.push('Last Ember +3');delete s.lastEmber[h];
    }
    if(has(h,'EQ119')){c.ignore+=1;c.notes.push('Cinder Edge: ignore 1 Armor')}
    return c;
  }
  function post(h,en,beforeHp,ctx,label='Attack'){
    if(!en||beforeHp==null)return;
    const mainDamage=Math.max(0,Number(beforeHp)-Number(en.hp||0));
    if(mainDamage<=0)return;
    if(has(h,'EQ006')){
      if(!roundUsed(h+':EQ006:Blazing')){
        useRound(h+':EQ006:Blazing');
        if(en.hp>0){en.hp=Math.max(0,en.hp-1);log(`Flaming Longsword — Blazing Strike: ${en.name} suffers +1 Fire Damage.`);if(en.hp<=0){credit(h,en,'Blazing Strike');removeEnemy(en)}}
      }
      if(mainDamage>=4&&!encounterUsed(h+':EQ006:Ignite')&&en.hp>0){useEncounter(h+':EQ006:Ignite');try{addCond(en,'Burning')}catch(_){}log(`Flaming Longsword — Ignite: ${en.name} gains Burning.`)}
    }
    if(ctx?.notes?.length)log(`EQUIPMENT — ${label}: ${ctx.notes.join(' · ')}.`);
  }

  // Movement tracking for Deadeye / Heartseeker.
  if(typeof window.enterHeroLocation==='function'){
    const old=window.enterHeroLocation;window.enterHeroLocation=function(h,x,y){const b=pos(h);const r=old.apply(this,arguments);const a=pos(h);if(b&&a&&(b.x!==a.x||b.y!==a.y))markMoved(h);return r};
  }
  if(typeof window.moveSeraphine==='function'){
    const old=window.moveSeraphine;window.moveSeraphine=function(){const b=pos('Seraphine');const r=old.apply(this,arguments);const a=pos('Seraphine');if(b&&a&&(b.x!==a.x||b.y!==a.y))markMoved('Seraphine');return r};
  }

  // Mark Hero Card resolution for the three legacy controllers.
  function wrapPlay(name,h){const old=window[name];if(typeof old!=='function')return;window[name]=function(card){const prev=window.__eqHeroCard33613;window.__eqHeroCard33613={hero:h,card};try{return old.apply(this,arguments)}finally{window.__eqHeroCard33613=prev}}}
  wrapPlay('playHandCard','Aldric');wrapPlay('playLyraCard','Lyra');wrapPlay('playSeraphineCard','Seraphine');

  // Basic Attack button — all Heroes.
  if(typeof window.attack==='function'){
    const old=window.attack;window.attack=function(){
      const h=controlledHero();let q=null,before=null,ctx=null;
      const oc=window.chooseWeaponTarget,oa=window.activeAttackValue,oe=window.effArmor;
      if(typeof oc==='function')window.chooseWeaponTarget=function(){q=oc.apply(this,arguments);if(q?.en){before=q.en.hp;ctx=prepare(h,q.en,{isHeroCard:false});}return q};
      if(typeof oa==='function')window.activeAttackValue=function(){return oa.apply(this,arguments)+(ctx?.bonus||0)};
      if(typeof oe==='function')window.effArmor=function(en){return Math.max(0,oe.apply(this,arguments)-((q&&en===q.en)?(ctx?.ignore||0):0))};
      try{return old.apply(this,arguments)}finally{window.chooseWeaponTarget=oc;window.activeAttackValue=oa;window.effArmor=oe;if(q?.en&&before!=null)post(h,q.en,before,ctx,'Basic Attack')}
    };
  }

  // Expanded-roster Hero-card attacks.
  if(typeof window.runtimeHeroAttackEnemy==='function'){
    const old=window.runtimeHeroAttackEnemy;window.runtimeHeroAttackEnemy=function(h,c,q,bonus=0,ignoreArmor=0){
      if(!q?.en)return old.apply(this,arguments);const before=q.en.hp,ctx=prepare(h,q.en,{isHeroCard:!!c?.id&&/^H\d{3}-/.test(c.id),card:c});
      const r=old.call(this,h,c,q,Number(bonus||0)+ctx.bonus,Math.max(Number(ignoreArmor||0),ctx.ignore));post(h,q.en,before,ctx,c?.name||'Hero Card Attack');return r;
    };
  }

  // Legacy card attack helpers. The transient flag distinguishes Hero Cards from granted Basic Attacks.
  function wrapLegacyAttack(name,h,bonusIndex){const old=window[name];if(typeof old!=='function')return;window[name]=function(en){if(!en)return old.apply(this,arguments);const flag=window.__eqHeroCard33613,card=flag?.hero===h?flag.card:null,before=en.hp,ctx=prepare(h,en,{isHeroCard:!!card,card});const args=[...arguments];if(typeof bonusIndex==='number')args[bonusIndex]=Number(args[bonusIndex]||0)+ctx.bonus;const oe=window.effArmor;if(typeof oe==='function')window.effArmor=function(x){return Math.max(0,oe.apply(this,arguments)-(x===en?ctx.ignore:0))};let r;try{if(bonusIndex==null){const baseName=h==='Aldric'?'aldricBaseAttackValue':h==='Lyra'?'lyraBaseAttackValue':'seraphineBaseAttackValue';const ob=window[baseName];if(typeof ob==='function')window[baseName]=function(){return ob.apply(this,arguments)+ctx.bonus};try{r=old.apply(this,args)}finally{window[baseName]=ob}}else r=old.apply(this,args)}finally{window.effArmor=oe}post(h,en,before,ctx,card?.name||args[1]||'Attack');return r};}
  wrapLegacyAttack('aldricCardAttack','Aldric',null);wrapLegacyAttack('lyraAttackEnemy','Lyra',2);wrapLegacyAttack('seraphineAttackEnemy','Seraphine',2);

  // Duelist's Rapier — Riposte Master. enemyAfterDamage322 is called after each resolved Enemy attack.
  if(typeof window.enemyAfterDamage322==='function'){
    const old=window.enemyAfterDamage322;window.enemyAfterDamage322=function(en,p,target,dmg){const r=old.apply(this,arguments);try{const h=target?.id;if(!h||!has(h,'EQ010')||!en||en.hp<=0||roundUsed(h+':EQ010:Riposte'))return r;const hp=pos(h),ep=typeof findE==='function'?findE(en):null;if(!hp||!ep||hp.x!==ep.x||hp.y!==ep.y)return r;if(heroActionCount(h)<1)return r;if(confirm(`Duelist's Rapier — Riposte Master: spend 1 Action for a Basic Attack against ${en.name}?`)){spendHeroActions(h,1);useRound(h+':EQ010:Riposte');heroBasicAttackFor(h,en,"Duelist's Rapier — Riposte Master");log(`Duelist's Rapier — ${heroDisplayName(h)} ripostes ${en.name}.`)}}catch(e){console.warn('Riposte Master',e)}return r};
  }

  // Ashen Wardblade — arm Last Ember when real damage leaves the wielder at half Health or less.
  if(typeof window.damageHeroBy==='function'){
    const old=window.damageHeroBy;window.damageHeroBy=function(h,n,label){const before=typeof heroCurrentHp==='function'?heroCurrentHp(h):null;const r=old.apply(this,arguments);try{const after=heroCurrentHp(h),max=heroMaxHp(h),s=S();if(has(h,'EQ119')&&Number(n)>0&&before>after&&after>0&&after<=max/2&&!encounterUsed(h+':EQ119:LastEmber')){useEncounter(h+':EQ119:LastEmber');s.lastEmber[h]={expiresRound:Number(g.round||0)+1};log(`Ashen Wardblade — Last Ember: ${heroDisplayName(h)}'s next Attack before the end of the next turn gains +3 Attack.`)}}catch(e){console.warn('Last Ember trigger',e)}return r};
  }

  // Legacy enemy damage enters through damageHero(q,d); arm Last Ember there too because some paths do not call damageHeroBy.
  if(typeof window.damageHero==='function'){
    const old=window.damageHero;window.damageHero=function(q,d){const h=q?.id,before=h&&typeof heroCurrentHp==='function'?heroCurrentHp(h):null;const r=old.apply(this,arguments);try{if(h&&has(h,'EQ119')){const after=heroCurrentHp(h),max=heroMaxHp(h),s=S();if(Number(d)>0&&before>after&&after>0&&after<=max/2&&!encounterUsed(h+':EQ119:LastEmber')){useEncounter(h+':EQ119:LastEmber');s.lastEmber[h]={expiresRound:Number(g.round||0)+1};log(`Ashen Wardblade — Last Ember: ${heroDisplayName(h)}'s next Attack before the end of the next turn gains +3 Attack.`)}}}catch(e){console.warn('Last Ember legacy trigger',e)}return r};
  }

  window.ascendanceEquipmentAutoHitAudit33613=function(){const s=S();return {version:V,corrected:Object.keys(corrected),round:g?.round,state:s,printed:Object.fromEntries(Object.keys(corrected).map(id=>{const e=typeof EQUIPMENT_CARDS!=='undefined'?EQUIPMENT_CARDS.find(x=>x.id===id):null;return [id,e?{ability1:e.ability1,ability2:e.ability2}:null]}))}};
  try{console.info('Ascendance 3.36.13 automatic-hit equipment alignment loaded.')}catch(_){}
})();
