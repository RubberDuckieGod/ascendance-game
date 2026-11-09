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
