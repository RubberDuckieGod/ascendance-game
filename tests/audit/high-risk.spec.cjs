const {test,expect}=require('@playwright/test');
async function open(page){page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');}
for(const [id,bonus]of [['H012-011',1],['H012-020',3]])test(`${id}: played buff changes actual attack damage by +${bonus}`,async({page},info)=>{
 await open(page);const r=await page.evaluate(id=>{init('Q003',['Garruk']);g.equipped.Garruk={Weapon:null,Armor:null,Accessory:[]};const s=searchHeroState('Garruk');const c={...HERO_RUNTIME_CARDS.Garruk.find(c=>c.id===id),uid:'audit-buff'};s.hand=[c];s.actions=6;const t=g.tiles['0,0'],en={id:'E001',name:'Audit',hp:100,maxHp:100,armor:0,conditions:[],traits:[]};t.enemies=[en];const base=extraAttack('Garruk');playExtraCard(c);runtimeHeroAttackEnemy('Garruk',{id:'H012-001',category:'Attack',name:'Audit',rules:''},{en,t});return {base,damage:100-en.hp,actions:s.actions,cardCost:c.cost}},id);
 await info.attach('measurement',{body:JSON.stringify(r),contentType:'application/json'});expect(r.damage).toBe(r.base+bonus);expect(r.actions).toBe(6-r.cardCost);
});
test('Garruk Bloodrage: taking damage grants +2 to next Attack only',async({page},info)=>{
 await open(page);const r=await page.evaluate(()=>{init('Q003',['Garruk']);const h='Garruk';g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};const s=searchHeroState(h);s.hand=[];const t=g.tiles['0,0'],en={id:'E001',name:'Audit',hp:100,maxHp:100,armor:0,conditions:[],traits:[]};t.enemies=[en];const base=extraAttack(h);damageHeroBy(h,1,'audit');const hit=()=>{const hp=en.hp;runtimeHeroAttackEnemy(h,{id:'H012-001',name:'Audit',category:'Attack',rules:''},{en,t});return hp-en.hp};return {base,first:hit(),second:hit()}});
 await info.attach('measurement',{body:JSON.stringify(r),contentType:'application/json'});expect(r.first).toBe(r.base+2);expect(r.second).toBe(r.base);
});
test('H012-020: Avatar of Rage prevents lethal damage below one Health',async({page})=>{
 await open(page);const r=await page.evaluate(()=>{init('Q003',['Garruk']);const s=searchHeroState('Garruk'),c={...HERO_RUNTIME_CARDS.Garruk.find(c=>c.id==='H012-020'),uid:'audit-avatar'};s.hand=[c];s.actions=6;playExtraCard(c);damageHeroBy('Garruk',100,'audit');return {hp:heroCurrentHp('Garruk'),defeated:heroDefeated('Garruk')}});expect(r.hp).toBe(1);expect(r.defeated).toBe(false);
});
