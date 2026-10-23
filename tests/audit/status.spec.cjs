const {test,expect}=require('@playwright/test');
for(const [cond,attackDelta,armorDelta]of [['Weakened',-1,0],['Inspired',1,0],['Guarded',0,1]])test(`${cond}: actual enemy Attack/Armor modifiers`,async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.ascMechanics33621);const r=await page.evaluate(cond=>{init('Q003',['Aldric']);const en={attack:4,armor:3,hp:10,conditions:[]};const before={attack:effAttack(en),armor:effArmor(en)};addCond(en,cond);const after={attack:effAttack(en),armor:effArmor(en)};removeCond(en,cond);return {before,after,cleared:{attack:effAttack(en),armor:effArmor(en)}}},cond);
 expect(r.after.attack).toBe(r.before.attack+attackDelta);expect(r.after.armor).toBe(r.before.armor+armorDelta);expect(r.cleared).toEqual(r.before);
});
test('browser startup: build and uncaught JavaScript errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.waitForFunction(()=>window.ascMechanics33621);await page.evaluate(()=>init('Q003',['Aldric']));await expect.poll(()=>page.evaluate(()=>window.ASCENDANCE_BUILD)).toBe('3.36.21');expect(errors).toEqual([]);
});
