const {test,expect}=require('@playwright/test');
const heroes=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
for(const [status,attackDelta,armorDelta]of [['Weakened',-1,0],['Inspired',1,0],['Vulnerable',0,-1],['Cracked Armor',0,-1],['Berserk',2,-1],['Restrained',-1,0]])test('actual attacks and Armor consume '+status+' for all 16 Heroes',async({page})=>{
 page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascStatus33627?.ready());
 const rows=await page.evaluate(({heroes,status})=>heroes.map(h=>{
  init('Q003',[h]);lobbyClose();g.equipped[h]={Weapon:'EQ055',Armor:'EQ086',Shield:null,Offhand:null,Accessory:[]};g.levels[h]=1;g.xp[h]=0;
  const b=ascStatusRules33627.body(g,h);b.conditions=[];b.inspired=false;
  const t=g.tiles['0,0'];t.enemies=[];t.ongoing='None.';t.traits=[];
  const en={id:'E001',name:'Status oracle',hp:100,max:100,maxHp:100,armor:0,attack:0,conditions:[],traits:[]};t.enemies=[en];
  const armor=()=>h==='Aldric'?aldricArmor():h==='Lyra'?lyraArmor():h==='Seraphine'?seraphineArmor():extraArmor(h);
  const beforeArmor=armor();heroBasicAttackFor(h,en,'Basic Attack');const beforeDamage=100-en.hp;
  en.hp=100;b.conditions=[status];heroBasicAttackFor(h,en,'Basic Attack');return {hero:h,beforeDamage,damage:100-en.hp,beforeArmor,armor:armor()};
 }),{heroes,status});
 for(const row of rows){expect(row.damage,row.hero+' '+status).toBe(Math.max(0,row.beforeDamage+attackDelta));expect(row.armor,row.hero+' '+status).toBe(Math.max(0,row.beforeArmor+armorDelta))}
});
for(const status of ['Frozen','Restrained'])test(status+' blocks an actual ordinary Move without spending Actions',async({page})=>{
 page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascStatus33627?.ready());
 const result=await page.evaluate(status=>{
  init('Q003',['Elara']);lobbyClose();const b=runtimeHeroState('Elara');b.actions=3;b.conditions=[status];
  const t=g.tiles['0,0'];t.enemies=[];t.edges={N:true,E:true,S:true,W:true};t.enc=false;t.visited=true;t.firstVisitUsed=true;t.firstVisitTriggered=true;t.reveal=t.ongoing=t.special='None.';t.traits=[];
  g.tiles['1,0']={...structuredClone(t),id:'L006'};runtimeHeroMove(1,0);return {x:b.x,actions:b.actions};
 },status);expect(result).toEqual({x:0,actions:3});
});
test('named-object statuses produce the same combat modifiers as strings',async({page})=>{
 page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascStatus33627?.ready());
 const result=await page.evaluate(()=>{
  init('Q003',['Elara']);lobbyClose();const b=runtimeHeroState('Elara');g.equipped.Elara={Weapon:'EQ055',Armor:'EQ086',Accessory:[]};b.conditions=['Berserk','Vulnerable'];const string={attack:extraAttack('Elara'),armor:extraArmor('Elara')};b.conditions=[{name:'Berserk'},{name:'Vulnerable'}];return {string,objects:{attack:extraAttack('Elara'),armor:extraArmor('Elara')}};
 });expect(result.objects).toEqual(result.string);
});
