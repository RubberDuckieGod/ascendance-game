const {test,expect}=require('@playwright/test');
const healing={LT001:2,LT002:4,LT003:6,LT013:1,LT029:2,LT030:3};
const cleanses={LT004:'Bleeding',LT005:'Poisoned',LT006:'Burning',LT008:'Stunned',LT014:'Poisoned'};
async function setup(page){page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');await page.waitForFunction(()=>window.ascMechanics33621);await page.evaluate(()=>init('Q001',['Elara']));}
for(const [id,heal]of Object.entries(healing))test(`${id}: printed healing, action and inventory consumption`,async({page})=>{
 await setup(page);const r=await page.evaluate(id=>{const h='Elara',s=searchHeroState(h);s.hp=1;addInventoryItem(h,id,'loot',1);const row=heroInventory(h).find(x=>x.id===id);const before={qty:row.qty,actions:heroActionCount(h),hand:s.hand.length};useConsumable(h,row.key);return {hp:heroCurrentHp(h),qty:heroInventory(h).find(x=>x.key===row.key)?.qty||0,actions:heroActionCount(h),before}},id);
 expect(r.hp).toBe(1+heal);expect(r.actions).toBe(r.before.actions-1);expect(r.qty).toBe(r.before.qty-1);
});
for(const [id,condition]of Object.entries(cleanses))test(`${id}: removes ${condition}, consumes one action and item`,async({page})=>{
 await setup(page);const r=await page.evaluate(({id,condition})=>{addHeroCondition('Elara',condition);addInventoryItem('Elara',id,'loot',1);const row=heroInventory('Elara').find(x=>x.id===id),before=heroActionCount('Elara');useConsumable('Elara',row.key);return {condition:heroHasCondition('Elara',condition),actions:heroActionCount('Elara'),before,remaining:heroInventory('Elara').find(x=>x.key===row.key)?.qty||0}},{id,condition});
 expect(r.condition).toBe(false);expect(r.actions).toBe(r.before-1);expect(r.remaining).toBe(0);
});
for(const id of ['LT012','LT026'])test(`${id}: no valid recovery/lock target preserves item and actions`,async({page})=>{
 await setup(page);const r=await page.evaluate(id=>{addInventoryItem('Elara',id,'loot',1);const row=heroInventory('Elara').find(x=>x.id===id);const before={actions:heroActionCount('Elara'),qty:row.qty};useConsumable('Elara',row.key);return {before,actions:heroActionCount('Elara'),qty:heroInventory('Elara').find(x=>x.key===row.key)?.qty||0}},id);
 expect(r.actions).toBe(r.before.actions);expect(r.qty).toBe(r.before.qty);
});
for(const [id,damage,condition]of [['LT016',2,'Burning'],['LT017',0,'Slowed'],['LT018',0,'Stunned'],['LT019',2,null],['LT020',3,null]])test(`${id}: target damage and status`,async({page})=>{
 await setup(page);const r=await page.evaluate(id=>{const t=g.tiles['0,0'],en={id:'E001',name:'Audit',hp:20,maxHp:20,armor:9,conditions:[],traits:[]};t.enemies=[en];addInventoryItem('Elara',id,'loot',1);const row=heroInventory('Elara').find(x=>x.id===id);useConsumable('Elara',row.key);return {hp:en.hp,conditions:en.conditions}},id);
 expect(r.hp).toBe(20-damage);if(condition)expect(r.conditions).toContain(condition);
});
