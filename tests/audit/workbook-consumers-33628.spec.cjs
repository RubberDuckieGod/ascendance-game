const {test,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
const ref=JSON.parse(fs.readFileSync(path.join(__dirname,'../../audit/workbook-reference-v10.52.json'),'utf8'));
async function open(page){page.on('dialog',d=>d.message().includes(': choose Enemy ')?d.accept('1'):d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
test('all 323 card definitions use the workbook copy counts, costs and printed targets',async({page})=>{
 await open(page);const actual=await page.evaluate(()=>[...ALDRIC_CARDS,...LYRA_CARDS,...SERAPHINE_CARDS,...Object.values(HERO_RUNTIME_CARDS).flat()].map(c=>({id:c.id,copies:c.copies,cost:c.cost,target:c.target})));
 const expected=ref.sheets['Hero Deck Cards'].map(r=>({id:r['Card ID'],copies:r.Copies,cost:r.Cost,target:r.Target}));expect(actual.sort((a,b)=>a.id.localeCompare(b.id))).toEqual(expected.sort((a,b)=>a.id.localeCompare(b.id)));
});
test('newly built Hero decks contain the workbook copies without changing saved card instances',async({page})=>{
 await open(page);const actual=await page.evaluate(()=>{
  const out={};for(const h of ['Aldric','Lyra','Seraphine','Elara','Vaelis','Rowan','Thorne','Cassian','Kael','Mira']){init('Q003',[h]);lobbyClose();const b=ascStatusRules33627.body(g,h),zones=h==='Aldric'?[g.heroDeck,g.heroHand,g.heroDiscard]:h==='Lyra'?[g.lyraDeck,g.lyraHand,g.lyraDiscard]:h==='Seraphine'?[g.seraphineDeck,g.seraphineHand,g.seraphineDiscard]:[b.deck,b.hand,b.discard];for(const c of zones.flat())out[c.id]=(out[c.id]||0)+1}return out;
 });
 for(const row of ref.sheets['Hero Deck Cards'].filter(r=>Number(r['Card ID'].slice(1,4))<=10))expect(actual[row['Card ID']],row['Card ID']).toBe(row.Copies);
});
test('all 125 spawned Enemy chassis use workbook Health, Attack and Armor',async({page})=>{
 await open(page);const actual=await page.evaluate(()=>Object.values(ENEMY_WORKBOOK_320).map(r=>{const en=encounterEnemy320(r.id);return {id:r.id,hp:en.hp,attack:en.attack,armor:en.armor}}));
 const expected=ref.sheets.Enemies.map(r=>({id:r['Card ID'],hp:r.Health,attack:typeof r.Attack==='string'?Number(r.Attack.split('/')[0]):r.Attack,armor:r.Armor}));expect(actual.sort((a,b)=>a.id.localeCompare(b.id))).toEqual(expected.sort((a,b)=>a.id.localeCompare(b.id)));
});
test('all 102 status definitions are available by ID and retain the user Bleeding override',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Aldric']);g.conditions=[];addHeroCondition('Aldric','SE007');return {count:ascStatusRules33627.definitions.rows.length,exposed:ascStatusRules33627.definitions.byId.SE101.Name,stealth:ascStatusRules33627.definitions.byId.SE102.Name,bleeding:ascStatusRules33627.TEXT.Bleeding,idWorks:heroHasCondition('Aldric','Weakened')}});
 expect(out.count).toBe(102);expect(out.exposed).toBe('Exposed');expect(out.stealth).toBe('Stealth');expect(out.bleeding).toContain('start of your activation');expect(out.idWorks).toBe(true);
});
for(const id of ['H004-003','H004-006'])test(id+' makes actual Attacks against at most three selected Enemies',async({page})=>{
 await open(page);const out=await page.evaluate(id=>{
  init('Q003',['Vaelis']);lobbyClose();const b=runtimeHeroState('Vaelis');b.actions=3;b.playedSpellRound=g.round;g.equipped.Vaelis={Weapon:null,Armor:null,Accessory:[]};
  const t=g.tiles['0,0'];t.traits=[];t.name='Ordinary clearing';t.ongoing=t.special='None.';delete t.arcaneUntilRound;
  t.enemies=Array.from({length:4},(_,i)=>({id:'ORACLE-'+i,name:'Target '+i,hp:100,max:100,armor:0,attack:0,conditions:[],traits:[]}));
  const card={...HERO_RUNTIME_CARDS.Vaelis.find(c=>c.id===id),uid:'target-cap'};b.hand=[card];playExtraCard(card);
  return {damaged:t.enemies.filter(en=>en.hp<100).length,last:t.enemies[3].hp,actions:b.actions,cost:card.cost,discard:b.discard.filter(c=>c.uid==='target-cap').length};
 },id);expect(out.damaged).toBe(3);expect(out.last).toBe(100);expect(out.actions).toBe(3-out.cost);expect(out.discard).toBe(1);
});
test('Perfect Form never makes a paid Attack card cost less than one Action',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Kael']);const b=runtimeHeroState('Kael');g.equipped.Kael={Accessory:[]};b.perfectFormRound33611=g.round;return extraCardActionCost32611('Kael',{id:'H009-001',cost:1,category:'Attack',traits:'Martial'},b)});expect(out).toBe(1);
});

test('actual base Attack and Armor getters match all 256 Hero rows with the user balance overrides',async({page})=>{
 await open(page);const rows=await page.evaluate(()=>{
  const out=[];for(const h of Object.keys(ascHeroStats33628.table)){init('Q003',[h]);lobbyClose();g.equipped[h]={Weapon:null,Armor:null,Shield:null,Offhand:null,Accessory:[]};const b=ascStatusRules33627.body(g,h);b.conditions=[];b.inspired=false;const t=g.tiles['0,0'];t.ongoing=t.special='None.';t.traits=[];
   for(let level=1;level<=16;level++){g.levels[h]=level;g.xp[h]=HERO_LEVEL_XP[level-1];ascWorkbookParity33628.catalogs();const attack=h==='Aldric'?aldricBaseAttackValue():h==='Lyra'?lyraBaseAttackValue():h==='Seraphine'?seraphineBaseAttackValue():extraBaseAttack(h);const armor=h==='Aldric'?aldricArmor():h==='Lyra'?lyraArmor():h==='Seraphine'?seraphineArmor():extraArmor(h);out.push({hero:h,level,attack:attack-equipmentAttack(h),armor:armor-equipmentArmor(h),maxHp:heroMaxHp(h)})}
  }return out;
 });const names=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
 for(const row of ref.sheets.Heroes){const match=row['Card ID'].match(/^H(\d+)-L(\d+)$/);const hero=names[Number(match[1])-1],actual=rows.find(r=>r.hero===hero&&r.level===Number(match[2]));expect(actual.attack,hero+' L'+row.Level).toBe(hero==='Garruk'?2:hero==='Lucien'?3:row.Attack);expect(actual.armor,hero+' Armor L'+row.Level).toBe(row.Armor);expect(actual.maxHp,hero+' Health L'+row.Level).toBe(row.Health)}
});

test('Lyra card text retains the explicitly approved deck inspection and 1-damage reactions',async({page})=>{
 await open(page);const actual=await page.evaluate(()=>Object.fromEntries(WORKBOOK_DATABASE['Hero Deck Cards'].filter(r=>['H002-009','H002-010','H002-018'].includes(r['Card ID'])).map(r=>[r['Card ID'],r['Rules Text']])));
 expect(actual).toEqual(ref.userOverrides.HeroCardRules);
});

test('Wolf Rider charge grants +2 Attack after two moves without fabricated Armor ignore',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Aldric']);const en=encounterEnemy320('E013'),t=g.tiles['0,0'];t.enemies=[en];const p={x:0,y:0,t};
  return [0,1,2,3].map(m=>{en.movedThisActivation322=m;return {attack:enemyAttackValue322(en,p,{id:'Aldric'}),ignore:enemyArmorIgnore322(en,p)}})});
 expect(out).toEqual([{attack:4,ignore:0},{attack:4,ignore:0},{attack:6,ignore:0},{attack:6,ignore:0}]);
});
test('Bodyguard gains one Armor near its leader without substituting extra Attack',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Aldric']);const guard=encounterEnemy320('E018'),chief=encounterEnemy320('E010'),t=g.tiles['0,0'];t.enemies=[guard,chief];const p={x:0,y:0,t};
 const near={armor:effArmor(guard),attack:enemyAttackValue322(guard,p,{id:'Aldric'})};t.enemies=[guard];const alone={armor:effArmor(guard),attack:enemyAttackValue322(guard,p,{id:'Aldric'})};return {near,alone,chiefIgnore:enemyArmorIgnore322(chief,p)}});
 expect(out).toEqual({near:{armor:4,attack:5},alone:{armor:3,attack:4},chiefIgnore:0});
});
test('Forest Spirit supports only a nearby Beast with recovery and phase-limited Armor',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Aldric']);const t=g.tiles['0,0'],spirit=encounterEnemy320('E031'),near=encounterEnemy320('E020'),far=encounterEnemy320('E020');near.hp=3;far.hp=1;t.enemies=[spirit,near];g.tiles['3,0']={...structuredClone(t),enemies:[far]};g.phase='World Phase';const attack=effAttack(near);enemyStartActivation322(spirit,{x:0,y:0,t});const during={hp:near.hp,armor:effArmor(near),attack:effAttack(near),farHp:far.hp};g.phase='Hero Phase';return {during,after:effArmor(near),base:near.armor,attack}});
 expect(out.during).toEqual({hp:5,armor:out.base+1,attack:out.attack,farHp:1});expect(out.after).toBe(out.base);
});
test('condition removal handles named objects and Status IDs through actual Hero and Enemy consumers',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Elara']);const b=runtimeHeroState('Elara'),en={hp:10,conditions:[{name:'Burning'}]};b.conditions=[{name:'Poisoned'}];removeCond(en,'SE002');removeHeroCondition('Elara','SE001');return {enemy:en.conditions,hero:b.conditions}});expect(out).toEqual({enemy:[],hero:[]});
});

test('all 125 real spawned Enemy identities reach their workbook-specific ability handlers',async({page})=>{
 await open(page);const actual=await page.evaluate(()=>Object.keys(ENEMY_WORKBOOK_320).map(id=>({id,identity:enemyId322(encounterEnemy320(id))})));
 expect(actual).toHaveLength(125);for(const row of actual)expect(row.identity,row.id).toBe(row.id);
});

test('all 16 actual Hero damage paths consume Protected and Barrier and resolve Resolute before defeat',async({page})=>{
 await open(page);const rows=await page.evaluate(()=>{
  return Object.keys(ascHeroStats33628.table).map(h=>{init('Q003',[h]);lobbyClose();g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};const b=ascStatusRules33627.body(g,h);b.hp=6;b.conditions=['Protected'];damageHeroBy(h,3,'Status oracle');const protectedHp=b.hp;
   b.hp=6;b.conditions=['Barrier'];damageHeroBy(h,1,'Status oracle');const afterOne=b.hp,remaining=structuredClone(b.conditions);damageHeroBy(h,3,'Status oracle');const barrierHp=b.hp;
   b.hp=2;b.conditions=['Resolute'];damageHeroBy(h,9,'Status oracle');return {h,protectedHp,afterOne,remaining,barrierHp,resoluteHp:b.hp,resolute:heroHasCondition(h,'Resolute'),fate:g.campaign.heroFates?.[h]?.status||null};
  });
 });for(const r of rows){expect(r.protectedHp,r.h).toBe(4);expect(r.afterOne,r.h).toBe(6);expect(r.remaining,r.h).toEqual([{name:'Barrier',remaining:1}]);expect(r.barrierHp,r.h).toBe(4);expect(r.resoluteHp,r.h).toBe(1);expect(r.resolute,r.h).toBe(false);expect(['Downed','Lost']).not.toContain(r.fate)}
});
test('actual Hero attacks honor Enemy Protected, Barrier and Resolute before defeat or kill credit',async({page})=>{
 await open(page);const rows=await page.evaluate(()=>{
  return ['Protected','Barrier','Resolute'].map(status=>{init('Q003',['Elara']);lobbyClose();g.equipped.Elara={Weapon:'EQ055',Armor:null,Accessory:[]};const t=g.tiles['0,0'];t.traits=[];t.ongoing='None.';const en={id:'E-ORACLE',name:'Protected target',hp:100,max:100,armor:0,conditions:[],traits:[]};t.enemies=[en];heroBasicAttackFor('Elara',en,'Basic Attack');const base=100-en.hp;en.hp=status==='Resolute'?1:100;en.conditions=[status];heroBasicAttackFor('Elara',en,'Basic Attack');return {status,base,hp:en.hp,remaining:en.conditions,present:t.enemies.includes(en)};});
 });for(const r of rows){expect(r.hp,r.status).toBe(r.status==='Resolute'?1:100-Math.max(0,r.base-(r.status==='Barrier'?2:1)));expect(r.present,r.status).toBe(true);expect(r.remaining.some(c=>(typeof c==='string'?c:c.name)===r.status),r.status).toBe(false)}
});

test('Knocked Down blocks actual Hero attacks until the one-Action Stand command resolves for every Hero',async({page})=>{
 await open(page);const rows=await page.evaluate(async()=>{
  const out=[];for(const h of Object.keys(ascHeroStats33628.table)){init('Q003',[h]);lobbyClose();const b=ascStatusRules33627.body(g,h);b.actions=3;b.conditions=['Knocked Down'];g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};const t=g.tiles['0,0'];t.ongoing='None.';t.traits=[];const en={id:'stand-oracle',hp:100,max:100,name:'Stand oracle',armor:0,conditions:[],traits:[]};t.enemies=[en];
   heroBasicAttackFor(h,en,'Basic Attack');const blocked=en.hp;const result=await ascMechanics33621.command('STAND',{},h);heroBasicAttackFor(h,en,'Basic Attack');out.push({h,blocked,error:result?.error||null,actions:b.actions,down:heroHasCondition(h,'Knocked Down'),after:en.hp});
  }return out;
 });for(const r of rows){expect(r.blocked,r.h).toBe(100);expect(r.error,r.h).toBeNull();expect(r.actions,r.h).toBe(2);expect(r.down,r.h).toBe(false);expect(r.after,r.h).toBeLessThan(100)}
});
test('Goblin Scout uses its printed melee 1 / ranged 2 Attack',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Aldric']);const t=g.tiles['0,0'],en=encounterEnemy320('E004');t.enemies=[en];g.tiles['1,0']={...structuredClone(t),enemies:[]};t.edges={E:true};g.tiles['1,0'].edges={W:true};return {melee:enemyAttackValue322(en,{x:0,y:0,t},{x:0,y:0}),ranged:enemyAttackValue322(en,{x:0,y:0,t},{x:1,y:0})}});expect(out).toEqual({melee:1,ranged:2});
});

for(const [status,firstBonus,secondBonus]of [['Blessed',1,0],['Shaken',-1,0],['Empowered',2,0]])test(status+' modifies the actual next/first Attacks for all 16 Heroes',async({page})=>{
 await open(page);const rows=await page.evaluate(({status})=>{
  return Object.keys(ascHeroStats33628.table).map(h=>{init('Q003',[h]);lobbyClose();g.equipped[h]={Weapon:'EQ055',Armor:null,Accessory:[]};const b=ascStatusRules33627.body(g,h),t=g.tiles['0,0'];b.conditions=[];t.ongoing='None.';t.traits=[];const en={id:'attack-oracle',name:'Attack oracle',hp:100,max:100,armor:0,conditions:[],traits:[]};t.enemies=[en];
   heroBasicAttackFor(h,en,'Basic Attack');const base=100-en.hp;en.hp=100;b.conditions=[status];heroBasicAttackFor(h,en,'Basic Attack');const first=100-en.hp;en.hp=100;heroBasicAttackFor(h,en,'Basic Attack');const second=100-en.hp;return {h,base,first,second};
  });
 },{status});for(const r of rows){expect(r.first,r.h).toBe(Math.max(0,r.base+firstBonus));expect(r.second,r.h).toBe(Math.max(0,r.base+secondBonus))}
});
test('Focused ignores only one actual Attack penalty and remains when no penalty exists',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{init('Q003',['Elara']);lobbyClose();g.equipped.Elara={Weapon:'EQ055',Armor:null,Accessory:[]};const b=runtimeHeroState('Elara'),t=g.tiles['0,0'];t.ongoing='None.';t.traits=[];const en={id:'focused-oracle',name:'Focused oracle',hp:100,max:100,armor:0,conditions:[],traits:[]};t.enemies=[en];b.conditions=[];heroBasicAttackFor('Elara',en,'Basic Attack');const base=100-en.hp;en.hp=100;b.conditions=['Focused','Weakened'];heroBasicAttackFor('Elara',en,'Basic Attack');const damage=100-en.hp,consumed=!heroHasCondition('Elara','Focused');b.conditions=['Focused'];heroBasicAttackFor('Elara',en,'Basic Attack');return {base,damage,consumed,kept:heroHasCondition('Elara','Focused')}});expect(out.damage).toBe(out.base);expect(out.consumed).toBe(true);expect(out.kept).toBe(true);
});
