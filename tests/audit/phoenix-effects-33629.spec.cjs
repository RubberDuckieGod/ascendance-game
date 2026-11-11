const {test,expect}=require('@playwright/test');
const reference=require('../../audit/workbook-reference-v10.52.json');
const harmful=reference.sheets['Status Effects'].filter(row=>row.Type==='Harmful').map(row=>row.Name);
async function open(page,answer='2'){page.on('dialog',d=>d.type()==='prompt'?d.accept(answer):d.type()==='confirm'?d.accept():d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
test('LT030 Phoenix Ash removes all 40 authored harmful Conditions before recovering 3 Health and consumes one item',async({page})=>{
 await open(page);
 const actual=await page.evaluate(async harmful=>{
  init('Q003',['Aldric','Elara']);lobbyClose();g.activeHero='Aldric';
  for(const h of g.partyHeroes)g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};
  const b=ascStatusRules33627.body(g,'Elara');b.hp=1;b.conditions=[...harmful.map(name=>({name})), 'Guarded','Inspired','Wet','Exhausted'];g.actions=3;
  g.inventory.Aldric=[{kind:'loot',id:'LT030',key:'ash-oracle',qty:2}];render();await useConsumable('Aldric','ash-oracle');
  return {hp:b.hp,conditions:b.conditions.map(ascStatusRules33627.name).sort(),actions:g.actions,qty:g.inventory.Aldric[0]?.qty};
 },harmful);
 expect(harmful).toHaveLength(40);expect(actual).toEqual({hp:4,conditions:['Exhausted','Guarded','Inspired','Wet'],actions:2,qty:1});
});
test('EQ075 Rebirth cleanses harmful Conditions and stands while discarding the usable Wand',async({page})=>{
 await open(page);
 const actual=await page.evaluate(harmful=>{
  init('Q003',['Elara']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:'EQ075',Armor:null,Accessory:[]};
  const b=ascStatusRules33627.body(g,'Elara');b.hp=1;b.conditions=[...harmful.filter(name=>name!=='Disarmed').map(name=>({name})),'Guarded','Wet'];
  damageHeroBy('Elara',30,'Oracle physical damage');
  return {hp:b.hp,max:heroMaxHp('Elara'),conditions:b.conditions.map(ascStatusRules33627.name).sort(),weapon:g.equipped.Elara.Weapon,spent:b.equipmentLoot33612.eq075CampaignSpent};
 },harmful);
 expect(actual.hp).toBe(Math.ceil(actual.max/2));expect(actual.conditions).toEqual(['Guarded','Wet']);expect(actual.weapon).toBe(null);expect(actual.spent).toBe(true);
});
test('LT157 Phoenix Heart restores full Health once per Campaign without an unprinted cleanse',async({page})=>{
 await open(page);
 const actual=await page.evaluate(()=>{
  init('Q003',['Elara']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:null,Armor:null,Accessory:[]};
  const b=ascStatusRules33627.body(g,'Elara');b.hp=1;b.conditions=['Bleeding','Weakened','Knocked Down'];g.inventory.Elara=[{kind:'loot',id:'LT157',key:'heart-oracle',qty:1}];
  damageHeroBy('Elara',30,'Oracle physical damage');const first={hp:b.hp,max:heroMaxHp('Elara'),conditions:[...b.conditions],spent:g.campaign.phoenixHeartSpent33612};
  damageHeroBy('Elara',30,'Oracle physical damage');return {first,secondHp:b.hp,qty:g.inventory.Elara[0]?.qty};
 });
 expect(actual.first.hp).toBe(actual.first.max);expect(actual.first.conditions).toEqual(['Bleeding','Weakened','Knocked Down']);expect(actual.first.spent).toBe(true);expect(actual.secondHp).toBe(0);expect(actual.qty).toBe(1);
});

test('Disarmed prevents the Phoenix Wand weapon ability from firing or being spent',async({page})=>{
 await open(page);
 const result=await page.evaluate(()=>{
  init('Q003',['Elara']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:'EQ075',Armor:null,Accessory:[]};
  const b=ascStatusRules33627.body(g,'Elara');b.hp=1;b.conditions=['Disarmed','Knocked Down'];damageHeroBy('Elara',30,'Oracle physical damage');
  return {hp:b.hp,weapon:g.equipped.Elara.Weapon,spent:!!b.equipmentLoot33612?.eq075CampaignSpent};
 });expect(result).toEqual({hp:0,weapon:'EQ075',spent:false});
});
