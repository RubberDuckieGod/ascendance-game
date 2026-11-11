const {test,expect}=require('@playwright/test');
async function open(page){page.on('dialog',d=>d.dismiss());await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascWorkbookParity33628?.ready)}
function setup({id,conditions=[],hp=10,connected=false}){
 init('Q003',['Elara']);lobbyClose();g.activeHero='Elara';g.equipped.Elara={Weapon:null,Armor:null,Accessory:[]};
 const b=ascStatusRules33627.body(g,'Elara');b.actions=3;b.conditions=[];g.inventory.Elara=[{kind:'loot',id,key:'damage-oracle',qty:2}];
 const origin=g.tiles['0,0'];Object.assign(origin,{enemies:[],edges:{N:false,E:true,S:false,W:false},firstVisitTriggered:true,visited:true});
 const en={id:'E001',type:'E001',name:'Damage oracle',hp,max:10,armor:99,attack:0,conditions:structuredClone(conditions)};
 const t=connected?(g.tiles['1,0']={...structuredClone(origin),id:'L001',name:'Connected',edges:{W:true},enemies:[]}):origin;t.enemies=[en];render();return en;
}
for(const spec of [
 {id:'LT016',conditions:[],hp:10,after:8,status:['Burning'],connected:true},
 {id:'LT016',conditions:['Protected'],hp:10,after:9,status:['Burning']},
 {id:'LT016',conditions:['Barrier'],hp:10,after:10,status:['Burning']},
 {id:'LT016',conditions:['Fireproof'],hp:10,after:9,status:['Fireproof']},
 {id:'LT016',conditions:['Arcane Shield'],hp:10,after:10,status:['Burning']},
 {id:'LT019',conditions:['Protected'],hp:10,after:9,status:[],connected:true},
 {id:'LT019',conditions:['Barrier'],hp:10,after:10,status:[]},
 {id:'LT020',conditions:['Barrier'],hp:10,after:9,status:[]},
 {id:'LT020',conditions:['Resolute'],hp:2,after:1,status:[]}
])test(spec.id+' direct damage respects '+(spec.conditions.join(',')||'printed damage')+(spec.connected?' at a connected Location':''),async({page})=>{
 await open(page);
 const result=await page.evaluate(async({spec,prepare})=>{
  const en=(0,eval)('('+prepare+')')(spec);await useConsumable('Elara','damage-oracle');
  return {hp:en.hp,status:en.conditions.map(ascStatusRules33627.name).sort(),actions:ascStatusRules33627.body(g,'Elara').actions,qty:g.inventory.Elara[0]?.qty};
 },{spec,prepare:setup.toString()});
 expect(result).toEqual({hp:spec.after,status:spec.status,actions:2,qty:1});
});
test('throwable with no legal target refunds its Action and preserves the item',async({page})=>{
 await open(page);const result=await page.evaluate(async prepare=>{
  (0,eval)('('+prepare+')')({id:'LT016'});g.tiles['0,0'].enemies=[];await useConsumable('Elara','damage-oracle');
  return {actions:ascStatusRules33627.body(g,'Elara').actions,qty:g.inventory.Elara[0]?.qty};
 },setup.toString());expect(result).toEqual({actions:3,qty:2});
});
