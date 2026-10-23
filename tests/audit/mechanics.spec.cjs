const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const heroes=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
async function open(page){page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');await page.waitForFunction(()=>typeof init==='function'&&typeof ascendanceStability33621==='object');}
test('catalog: enumerate every authored rule without claiming effect coverage',async({page},info)=>{
 await open(page);const catalog=await page.evaluate(()=>Object.fromEntries(Object.entries(WORKBOOK_DATABASE).map(([kind,rows])=>[kind,rows.map(row=>({ ...row,auditStatus:'UNVERIFIED',reason:'No complete independent effect oracle registered for this record.'}))])));
 await info.attach('complete-rule-catalog',{body:JSON.stringify(catalog,null,2),contentType:'application/json'});
 fs.mkdirSync('audit',{recursive:true});fs.writeFileSync('audit/catalog.json',JSON.stringify(catalog,null,2));
 expect(catalog['Hero Deck Cards']).toHaveLength(323);expect(new Set(catalog['Hero Deck Cards'].map(c=>c['Card ID'].slice(0,4))).size).toBe(16);
});
for(const hero of heroes){
 test(`${hero}: damage subtracts health and healing caps at maximum`,async({page})=>{
 await open(page);const r=await page.evaluate(h=>{init('Q001',[h]);const before=heroCurrentHp(h),max=heroMaxHp(h);damageHeroBy(h,2,'audit');const damaged=heroCurrentHp(h);healHeroBy(h,1,'audit');const healed=heroCurrentHp(h);healHeroBy(h,100,'audit');return {before,max,damaged,healed,capped:heroCurrentHp(h)}},hero);
 expect(r.damaged).toBe(r.before-2);expect(r.healed).toBe(r.before-1);expect(r.capped).toBe(r.max);
 });
 test(`${hero}: all 16 XP thresholds and below-threshold boundaries`,async({page})=>{
 await open(page);const r=await page.evaluate(h=>{init('Q001',[h]);return HERO_LEVEL_XP.map((xp,i)=>{g.xp[h]=xp;const at=heroLevel(h);g.xp[h]=Math.max(0,xp-1);return {at,below:heroLevel(h),expected:i+1}})},hero);
 for(const q of r){expect(q.at).toBe(q.expected);expect(q.below).toBe(Math.max(1,q.expected-1))}
 });
}
// These call the real attack resolver, not a duplicate calculation. Armor/bonus
// expectations below are fixed inputs. This tests the shared resolver, not cards.
for(const hero of heroes.filter(h=>!['Aldric','Lyra','Seraphine'].includes(h))){
 for(const armor of [0,2,99])test(`${hero}: actual attack damage versus armor ${armor}`,async({page})=>{
 await open(page);const r=await page.evaluate(({h,armor})=>{init('Q001',[h]);g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};const p=heroPos(h),t=g.tiles[key(p.x,p.y)];const en={id:'E001',name:'Audit target',hp:100,maxHp:100,armor,attack:0,conditions:[],traits:[]};t.enemies=[en];const base=extraAttack(h);runtimeHeroAttackEnemy(h,{id:'AUDIT',name:'Audit attack',category:'Attack',rules:''},{en,t},2,0);return {damage:100-en.hp,base}}, {h:hero,armor});
 expect(r.damage).toBe(Math.max(0,r.base+2-armor));
 });
}
test('EQ116: Channel adds +1, +2 in Arcane; once per round',async({page})=>{
 await open(page);const r=await page.evaluate(()=>{
 function sample(arcane){init('Q001',['Vaelis']);g.equipped.Vaelis={Weapon:'EQ116',Armor:null,Accessory:[]};const t=g.tiles['0,0'];t.traits=arcane?['Arcane']:[];delete t.arcaneUntilRound;delete t.arcaneSources32521;g.arcaneWard3259=null;const en={id:'E001',name:'Audit target',hp:100,maxHp:100,armor:0,conditions:[],traits:[]};t.enemies=[en];const card={id:'H004-001',name:'Audit',category:'Attack',rules:'Make an Attack.'},base=extraAttack('Vaelis');const hit=()=>{const b=en.hp;runtimeHeroAttackEnemy('Vaelis',card,{en,t});return b-en.hp};return {base,first:hit(),second:hit()}}
 return {normal:sample(false),arcane:sample(true)};
 });expect(r.normal.first).toBe(r.normal.base+1);expect(r.normal.second).toBe(r.normal.base);expect(r.arcane.first).toBe(r.arcane.base+2);expect(r.arcane.second).toBe(r.arcane.base);
});
