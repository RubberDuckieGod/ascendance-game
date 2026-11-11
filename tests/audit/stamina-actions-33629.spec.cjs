const {test,expect}=require('@playwright/test');
async function open(page){page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
for(const [statuses,after,remaining]of [[[],4,[]],[['Exhausted'],3,['Exhausted']],[['Shocked'],3,[]],[['Exhausted','Shocked'],3,['Exhausted','Shocked']]])test('LT011 actual control respects '+(statuses.join(' and ')||'more than 3 available Actions'),async({page})=>{
 await open(page);const result=await page.evaluate(async statuses=>{
  init('Q003',['Elara']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:null,Armor:null,Accessory:[]};
  const b=ascStatusRules33627.body(g,'Elara');b.actions=4;b.conditions=[...statuses];g.inventory.Elara=[{kind:'loot',id:'LT011',key:'stamina-oracle',qty:2}];render();
  await useConsumable('Elara','stamina-oracle');return {actions:b.actions,conditions:b.conditions.map(ascStatusRules33627.name),qty:g.inventory.Elara[0]?.qty};
 },statuses);expect(result).toEqual({actions:after,conditions:remaining,qty:1});
});
test('cancelled throwable refunds the fourth Action without triggering Shocked or Exhausted',async({page})=>{
 await open(page);const result=await page.evaluate(async()=>{
  init('Q003',['Elara']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:null,Armor:null,Accessory:[]};
  const b=ascStatusRules33627.body(g,'Elara');b.actions=4;b.conditions=['Shocked','Exhausted'];g.inventory.Elara=[{kind:'loot',id:'LT016',key:'cancel-oracle',qty:2}];for(const t of Object.values(g.tiles))t.enemies=[];render();
  await useConsumable('Elara','cancel-oracle');return {actions:b.actions,conditions:b.conditions.map(ascStatusRules33627.name),qty:g.inventory.Elara[0]?.qty};
 });expect(result).toEqual({actions:4,conditions:['Shocked','Exhausted'],qty:2});
});
