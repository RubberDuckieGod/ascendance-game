const {test,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
const ref=JSON.parse(fs.readFileSync(path.join(__dirname,'../../audit/workbook-reference-v10.52.json'),'utf8'));
test('collect all runtime card definitions for workbook source review (metadata only)',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascStatus33627?.ready()&&window.ascEquipmentLootParity33612);await page.waitForTimeout(1800);
 const snapshot=await page.evaluate(()=>({
  heroCards:[...ALDRIC_CARDS,...LYRA_CARDS,...SERAPHINE_CARDS,...Object.values(HERO_RUNTIME_CARDS).flat()],
  equipment:EQUIPMENT_CARDS,loot:LOOT_CARDS,enemies:Object.values(ENEMY_WORKBOOK_320),locations:LOCS,search:SEARCH,encounters:ENCS,statuses:WORKBOOK_DATABASE['Status Effects']
 }));
 console.log('ASC_RUNTIME_SNAPSHOT '+JSON.stringify(snapshot));
 const expected=ref.sheets['Hero Deck Cards'].map(r=>r['Card ID']);expect([...new Set(snapshot.heroCards.map(c=>c.id))].sort()).toEqual(expected.sort());
});
