const {test,expect}=require('@playwright/test');
async function open(page){
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascHealingSummons33627&&window.ascStatus33627?.ready());
 await page.evaluate(()=>{
  init('Q003',['Thorne','Elara']);lobbyClose();g.activeHero='Thorne';g.levels.Thorne=1;g.xp.Thorne=0;g.tiles['0,0'].enemies=[];g.tiles['0,0'].ongoing='None.';g.tiles['0,0'].traits=[];
  const b=runtimeHeroState('Thorne');b.actions=3;b.hand=[{...HERO_RUNTIME_CARDS.Thorne.find(c=>c.id==='H007-012'),uid:'blessing'}];g.equipped.Thorne={Accessory:[]};
  Object.assign(runtimeHeroState('Elara'),{hp:5,maxHp:10,x:0,y:0,conditions:['Bleeding','Burning']});render();
 });
}
for(const [choice,left]of [['1','Burning'],['2','Bleeding']])test("Nature's Blessing chooses exactly one of two harmful Conditions: "+choice,async({page})=>{
 await open(page);page.on('dialog',d=>d.accept(d.message().includes('choose one Hero')?'2':choice));
 await page.evaluate(()=>playExtraCard(runtimeHeroState('Thorne').hand[0]));
 expect(await page.evaluate(()=>({hp:runtimeHeroState('Elara').hp,conditions:runtimeHeroState('Elara').conditions,actions:heroActionCount('Thorne'),discard:runtimeHeroState('Thorne').discard.filter(c=>c.uid==='blessing').length}))).toEqual({hp:6,conditions:[left],actions:2,discard:1});
});
for(const stage of ['target','condition'])test("Nature's Blessing cancellation preserves the card, Actions and Health: "+stage,async({page})=>{
 await open(page);page.on('dialog',d=>stage==='target'||!d.message().includes('choose one Hero')?d.dismiss():d.accept('2'));
 const out=await page.evaluate(()=>playExtraCard(runtimeHeroState('Thorne').hand[0]));expect(out.cancelled).toBe(true);
 expect(await page.evaluate(()=>({hp:runtimeHeroState('Elara').hp,conditions:runtimeHeroState('Elara').conditions,actions:heroActionCount('Thorne'),hand:runtimeHeroState('Thorne').hand.some(c=>c.uid==='blessing')}))).toEqual({hp:5,conditions:['Bleeding','Burning'],actions:3,hand:true});
});
