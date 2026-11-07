const {test,expect}=require('@playwright/test');
const healing={LT001:2,LT002:4,LT003:6,LT013:1,LT029:2,LT030:3};
const cleanses={LT004:'Bleeding',LT005:'Poisoned',LT006:'Burning',LT014:'Poisoned'};
async function setup(page,party=['Elara']){page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');await page.waitForFunction(()=>window.ascMechanics33621&&window.ascStatus33627?.ready()&&window.ascEquipmentLootParity33612);await page.evaluate(party=>{init('Q001',party);lobbySetMultiplayerControls('local','ITEM-EFFECT-AUDIT','Elara');lobbyClose();g.round=2;g.activeHero='Elara';render()},party);}
for(const [id,heal]of Object.entries(healing))test(`${id}: printed healing, action and inventory consumption`,async({page})=>{
 await setup(page);const r=await page.evaluate(id=>{const h='Elara',s=searchHeroState(h);s.hp=1;addInventoryItem(h,id,'loot',1);const row=heroInventory(h).find(x=>x.id===id);const before={qty:row.qty,actions:heroActionCount(h),hand:s.hand.length};useConsumable(h,row.key);return {hp:heroCurrentHp(h),qty:heroInventory(h).find(x=>x.key===row.key)?.qty||0,actions:heroActionCount(h),before}},id);
 expect(r.hp).toBe(1+heal);expect(r.actions).toBe(r.before.actions-1);expect(r.qty).toBe(r.before.qty-1);
});
for(const [id,condition]of Object.entries(cleanses))test(`${id}: removes ${condition}, consumes one action and item`,async({page})=>{
 await setup(page);const r=await page.evaluate(({id,condition})=>{addHeroCondition('Elara',condition);addInventoryItem('Elara',id,'loot',1);const row=heroInventory('Elara').find(x=>x.id===id),before=heroActionCount('Elara');useConsumable('Elara',row.key);return {condition:heroHasCondition('Elara',condition),actions:heroActionCount('Elara'),before,remaining:heroInventory('Elara').find(x=>x.key===row.key)?.qty||0}},{id,condition});
 expect(r.condition).toBe(false);expect(r.actions).toBe(r.before-1);expect(r.remaining).toBe(0);
});
test('LT008: a healthy acting Hero removes Stunned from a co-located ally for one Action and one item',async({page},info)=>{
 await setup(page,['Elara','Rowan']);const actual=await page.evaluate(async()=>{
  const actor=runtimeHeroState('Elara'),ally=runtimeHeroState('Rowan');actor.hp=ally.hp=4;ally.x=actor.x;ally.y=actor.y;addHeroCondition('Rowan','Stunned');addInventoryItem('Elara','LT008','loot',1);
  const row=heroInventory('Elara').find(item=>item.id==='LT008'),read=()=>({actions:heroActionCount('Elara'),quantity:heroInventory('Elara').find(item=>item.key===row.key)?.qty||0,actorHp:heroCurrentHp('Elara'),allyHp:heroCurrentHp('Rowan'),actorStunned:heroHasCondition('Elara','Stunned'),allyStunned:heroHasCondition('Rowan','Stunned')});
  const before=read();await useConsumable('Elara',row.key);return {before,after:read()};
 });
 expect(actual.before).toMatchObject({actions:3,quantity:1,actorHp:4,allyHp:4,actorStunned:false,allyStunned:true});expect(actual.after).toEqual({...actual.before,actions:2,quantity:0,allyStunned:false});
 await info.attach('smelling-salts-actual-effects',{body:JSON.stringify(actual),contentType:'application/json'});
});
for(const id of ['LT008','LT002'])test(`${id}: a Stunned actor cannot activate an item; automatic activation end preserves inventory and Health`,async({page},info)=>{
 await setup(page,['Elara','Rowan']);const actual=await page.evaluate(async id=>{
  runtimeHeroState('Elara').hp=runtimeHeroState('Rowan').hp=4;addHeroCondition('Elara','Stunned');addInventoryItem('Elara',id,'loot',1);
  const row=heroInventory('Elara').find(item=>item.id===id),read=()=>({actions:heroActionCount('Elara'),quantity:heroInventory('Elara').find(item=>item.key===row.key)?.qty||0,actorHp:heroCurrentHp('Elara'),allyHp:heroCurrentHp('Rowan'),stunned:heroHasCondition('Elara','Stunned')});
  const before=read();await useConsumable('Elara',row.key);const refused=read();render();return {before,refused,ended:read(),passed:!!g.passedHeroes32521?.Elara,receipt:runtimeHeroState('Elara').statusActivation33627};
 },id);
 expect(actual.before.actions).toBe(3);expect(actual.before.stunned).toBe(true);expect(actual.refused).toEqual(actual.before);expect(actual.ended).toEqual({...actual.before,actions:0,stunned:false});expect(actual.passed).toBe(true);expect(actual.receipt.end).toBe(actual.receipt.start);
 await info.attach('stunned-item-refusal',{body:JSON.stringify({id,...actual}),contentType:'application/json'});
});
test('LT008: an afflicted Hero at another Location is not a legal target and consumes nothing',async({page})=>{
 await setup(page,['Elara','Rowan']);const actual=await page.evaluate(async()=>{
  const ally=runtimeHeroState('Rowan');ally.x=1;ally.y=0;g.tiles['1,0']={...structuredClone(g.tiles['0,0']),enemies:[]};addHeroCondition('Rowan','Stunned');addInventoryItem('Elara','LT008','loot',1);
  const row=heroInventory('Elara').find(item=>item.id==='LT008'),read=()=>({actions:heroActionCount('Elara'),quantity:heroInventory('Elara').find(item=>item.key===row.key)?.qty||0,stunned:heroHasCondition('Rowan','Stunned'),actorHp:heroCurrentHp('Elara'),allyHp:heroCurrentHp('Rowan')});const before=read();await useConsumable('Elara',row.key);return {before,after:read()};
 });
 expect(actual.before).toMatchObject({actions:3,quantity:1,stunned:true});expect(actual.after).toEqual(actual.before);
});
for(const id of ['LT012','LT026'])test(`${id}: no valid recovery/lock target preserves item and actions`,async({page})=>{
 await setup(page);const r=await page.evaluate(id=>{addInventoryItem('Elara',id,'loot',1);const row=heroInventory('Elara').find(x=>x.id===id);const before={actions:heroActionCount('Elara'),qty:row.qty};useConsumable('Elara',row.key);return {before,actions:heroActionCount('Elara'),qty:heroInventory('Elara').find(x=>x.key===row.key)?.qty||0}},id);
 expect(r.actions).toBe(r.before.actions);expect(r.qty).toBe(r.before.qty);
});
for(const [id,damage,condition]of [['LT016',2,'Burning'],['LT017',0,'Slowed'],['LT018',0,'Stunned'],['LT019',2,null],['LT020',3,null]])test(`${id}: target damage and status`,async({page})=>{
 await setup(page);const r=await page.evaluate(id=>{const t=g.tiles['0,0'],en={id:'E001',name:'Audit',hp:20,maxHp:20,armor:9,conditions:[],traits:[]};t.enemies=[en];addInventoryItem('Elara',id,'loot',1);const row=heroInventory('Elara').find(x=>x.id===id);useConsumable('Elara',row.key);return {hp:en.hp,conditions:en.conditions}},id);
 expect(r.hp).toBe(20-damage);if(condition)expect(r.conditions).toContain(condition);
});
