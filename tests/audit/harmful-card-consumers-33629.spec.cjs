const {test,expect}=require('@playwright/test');
const rows=require('../../audit/workbook-reference-v10.52.json').sheets['Status Effects'];
async function open(page){page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
for(const row of rows.filter(r=>r.Type==='Harmful').concat(rows.filter(r=>['Wet','Exhausted'].includes(r.Name))))test('H013-016 Cruel Insight recognizes '+row.Name+' as '+row.Type,async({page})=>{
 await open(page);
 const result=await page.evaluate(async row=>{
  init('Q003',['Veyra']);lobbyClose();g.activeHero='Veyra';g.levels.Veyra=1;g.equipped.Veyra={Weapon:null,Armor:null,Accessory:[]};
  const b=runtimeHeroState('Veyra'),card={...HERO_RUNTIME_CARDS.Veyra.find(c=>c.id==='H013-016'),uid:'played'};
  b.actions=3;b.conditions=[];b.hand=[card,{...HERO_RUNTIME_CARDS.Veyra[0],uid:'keep'}];b.deck=[{...HERO_RUNTIME_CARDS.Veyra[0],uid:'draw1'},{...HERO_RUNTIME_CARDS.Veyra[0],uid:'draw2'}];b.discard=[];
  g.tiles['0,0'].enemies=[{id:'E001',type:'E001',name:'Afflicted oracle',hp:99,max:99,attack:0,armor:0,conditions:[{name:row['Status ID']}]}];render();
  await playExtraCard(card);return {hand:b.hand.map(c=>c.uid).sort(),discard:b.discard.map(c=>c.uid).sort(),actions:b.actions,hp:b.hp};
 },row);
 expect(result.hand).toEqual(row.Type==='Harmful'?['draw1','draw2','keep']:['draw1','draw2']);
 expect(result.discard).toEqual(row.Type==='Harmful'?['played']:['keep','played']);expect(result.actions).toBe(2);
});
test('H013-016 an afflicted Enemy in a different Location does not waive the discard',async({page})=>{
 await open(page);const result=await page.evaluate(async()=>{
  init('Q003',['Veyra']);lobbyClose();g.activeHero='Veyra';g.equipped.Veyra={Weapon:null,Armor:null,Accessory:[]};
  const b=runtimeHeroState('Veyra'),card={...HERO_RUNTIME_CARDS.Veyra.find(c=>c.id==='H013-016'),uid:'played'};
  b.actions=3;b.hand=[card,{...HERO_RUNTIME_CARDS.Veyra[0],uid:'keep'}];b.deck=[{...HERO_RUNTIME_CARDS.Veyra[0],uid:'draw1'},{...HERO_RUNTIME_CARDS.Veyra[0],uid:'draw2'}];b.discard=[];
  g.tiles['0,0'].enemies=[];g.tiles['1,0']={...structuredClone(g.tiles['0,0']),enemies:[{id:'E001',name:'Distant afflicted',hp:99,conditions:['Vulnerable']}]};render();
  await playExtraCard(card);return {hand:b.hand.map(c=>c.uid).sort(),discard:b.discard.map(c=>c.uid).sort()};
 });expect(result).toEqual({hand:['draw1','draw2'],discard:['keep','played']});
});
