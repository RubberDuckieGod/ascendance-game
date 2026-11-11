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

test('LT009 actual item control preserves Asha beneficial-status passives and resolves the queued choice',async({page})=>{
 await open(page);const result=await page.evaluate(async()=>{
  init('Q003',['Elara','Asha']);lobbyClose();g.activeHero='Elara';
  for(const h of g.partyHeroes)g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};
  g.levels.Asha=9;g.asc329={totem:{'0,0':1}};
  const b=ascStatusRules33627.body(g,'Elara');b.conditions=[];b.hp=1;b.actions=3;g.inventory.Elara=[{kind:'loot',id:'LT009',key:'focus-passive',qty:2}];render();
  await useConsumable('Elara','focus-passive');
  return {hp:b.hp,actions:b.actions,inspired:ascStatusRules33627.has(b,'Inspired'),pending:ascHealingSummonsRules33627.passiveChoices(g,'Elara').length,qty:g.inventory.Elara[0]?.qty};
 });expect(result).toEqual({hp:3,actions:2,inspired:true,pending:0,qty:1});
});

test('LT009 last Action defers Burning until its status-grant passive choice is resolved',async({page})=>{
 await open(page);const result=await page.evaluate(async()=>{
  init('Q003',['Elara','Asha']);lobbyClose();g.activeHero='Elara';
  for(const h of g.partyHeroes)g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};
  g.levels.Asha=9;g.asc329={totem:{'0,0':1}};
  const S=ascStatusRules33627,b=S.body(g,'Elara');b.conditions=['Burning'];b.hp=1;b.actions=1;g.inventory.Elara=[{kind:'loot',id:'LT009',key:'last-focus',qty:1}];render();
  const token=b.statusActivation33627.start;
  await ascMechanics33621.command('FOCUS_TONIC',{},'Elara');
  const pending={hp:b.hp,actions:b.actions,ended:b.statusActivation33627.end===token,choices:ascHealingSummonsRules33627.passiveChoices(g,'Elara').length};
  await ascHealingSummons33627.resolvePassives('Elara');render();
  return {pending,after:{hp:b.hp,ended:b.statusActivation33627.end===token,choices:ascHealingSummonsRules33627.passiveChoices(g,'Elara').length}};
 });expect(result).toEqual({pending:{hp:3,actions:0,ended:false,choices:1},after:{hp:2,ended:true,choices:0}});
});
