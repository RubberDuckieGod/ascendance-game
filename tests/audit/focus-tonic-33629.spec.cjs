const {test,expect}=require('@playwright/test');
async function open(page){page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
test('LT009 actual item control uses recipient activation expiry for all 16 Heroes',async({page})=>{
 await open(page);
 const results=await page.evaluate(async()=>{
  const rows=[];
  for(const h of ['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha']){
   init('Q003',[h]);lobbyClose();g.activeHero=h;g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};
   const S=ascStatusRules33627,b=S.body(g,h);b.conditions=[];b.actions=3;
   g.inventory[h]=[{kind:'loot',id:'LT009',key:'focus-oracle',qty:2}];render();
   const current=b.statusActivation33627.start,baseAttack=heroAttackValueFor(h);
   await useConsumable(h,'focus-oracle');
   const used={actions:b.actions,qty:g.inventory[h][0]?.qty,inspired:S.has(b,'Inspired'),duration:b.statusDurations33628?.Inspired?.duration,attackGain:heroAttackValueFor(h)-baseAttack};
   S.heroEnd(g,h,{token:current});const currentEnd=S.has(b,'Inspired');
   const next=current+':extra';S.heroStart(g,h,{token:next});const nextStart=S.has(b,'Inspired');
   S.heroEnd(g,h,{token:next});rows.push({h,used,currentEnd,nextStart,nextEnd:S.has(b,'Inspired'),attackAfter:heroAttackValueFor(h)-baseAttack});
  }
  return rows;
 });
 for(const r of results){expect(r.used,r.h).toEqual({actions:2,qty:1,inspired:true,duration:'Until the end of your next turn.',attackGain:1});expect(r.currentEnd,r.h).toBe(true);expect(r.nextStart,r.h).toBe(true);expect(r.nextEnd,r.h).toBe(false);expect(r.attackAfter,r.h).toBe(0)}
});
test('round transition preserves permanent Inspired for a Hero who never drank Focus Tonic',async({page})=>{
 await open(page);
 const result=await page.evaluate(async()=>{
  init('Q003',['Aldric']);lobbyClose();g.equipped.Aldric={Weapon:null,Armor:null,Accessory:[]};
  for(const t of Object.values(g.tiles))t.enemies=[];
  g.conditions=['Inspired'];const previous=g.round;await endTurn();
  return {before:previous,after:g.round,inspired:ascStatusRules33627.has(g,'Inspired')};
 });
 expect(result.after).toBe(result.before+1);expect(result.inspired).toBe(true);
});
