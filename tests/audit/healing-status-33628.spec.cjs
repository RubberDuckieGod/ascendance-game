const {test,expect}=require('@playwright/test');
async function open(page){page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
for(const [status,heal]of [['Withered',1],['Diseased',2],['Scorched',2]])test(status+' changes actual Health recovery for all 16 Heroes',async({page})=>{
 await open(page);const rows=await page.evaluate(({status})=>['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'].map(h=>{
  init('Q003',[h]);lobbyClose();g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};const b=ascStatusRules33627.body(g,h);b.hp=1;b.conditions=[{name:status}];healHeroBy(h,3,'Recovery oracle');return {h,hp:b.hp,remains:ascStatusRules33627.has(b,status)};
 }),{status});for(const row of rows){expect(row.hp,row.h).toBe(1+heal);expect(row.remains,row.h).toBe(status!=='Scorched')}
});
test('Withered caps real Staff of Renewal healing including its extra two Health',async({page})=>{
 await open(page);const out=await page.evaluate(()=>{
  init('Q003',['Elara','Aldric']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:'EQ065',Armor:null,Accessory:[]};g.equipped.Aldric={Weapon:null,Armor:null,Accessory:[]};g.hp=1;g.conditions=['Withered'];healHeroBy('Aldric',3,'Healing effect');return g.hp;
 });expect(out).toBe(2);
});
