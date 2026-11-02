const {test,expect}=require('@playwright/test');

async function open(page){
 page.on('dialog',dialog=>dialog.dismiss());
 await page.goto('/');await page.waitForFunction(()=>window.ascMechanics33621&&window.ascPhaseSync33625?.ready()&&window.ascStatus33627?.ready());
}

for(const [condition,expected]of [['Bleeding',5],['Regenerating',7]]){
 test(`${condition}: a real Enemy activation changes HP before target selection and retains the status`,async({page},info)=>{
  await open(page);
  const actual=await page.evaluate(async condition=>{
   init('Q003',['Rowan']);for(const tile of Object.values(g.tiles))tile.enemies=[];
   const en={type:'status-audit-enemy',name:'Status audit Enemy',hp:6,max:10,armor:0,attack:0,move:0,range:0,conditions:[condition],traits:[]};
   g.tiles['99,99']={id:'STATUS-AUDIT',name:'Status audit location',edges:{N:0,E:0,S:0,W:0},enemies:[en]};
   const before=chooseEnemyTarget;window.statusTargetMeasurements=[];
   chooseEnemyTarget=function(enemy){if(enemy===en)statusTargetMeasurements.push({hp:enemy.hp,phase:g.phase});return before.apply(this,arguments)};
   try{await endTurn();return {hp:en.hp,conditions:en.conditions,measurements:statusTargetMeasurements,round:g.round}}
   finally{chooseEnemyTarget=before}
  },condition);
  expect(actual.measurements).toHaveLength(1);
  expect(actual.measurements[0].hp).toBe(expected);
  expect(actual.hp).toBe(expected);
  expect(actual.conditions).toContain(condition);
  expect(actual.round).toBe(2);
  await info.attach('actual-enemy-start-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
 });
}

test('fatal Enemy Bleeding resolves before AI and removes the defeated piece',async({page})=>{
 await open(page);
 const actual=await page.evaluate(async()=>{
  init('Q003',['Rowan']);for(const tile of Object.values(g.tiles))tile.enemies=[];
  const en={type:'status-audit-enemy',name:'Status audit Enemy',hp:1,max:10,armor:0,attack:99,move:0,range:0,conditions:['Bleeding'],traits:[]};
  g.tiles['0,0'].enemies=[en];const before=chooseEnemyTarget;let targetCalls=0;
  chooseEnemyTarget=function(enemy){if(enemy===en)targetCalls++;return before.apply(this,arguments)};
  const hp=heroCurrentHp('Rowan');try{await endTurn();return {targetCalls,hpBefore:hp,hpAfter:heroCurrentHp('Rowan'),enemyHp:en.hp,enemyPresent:Object.values(g.tiles).some(tile=>(tile.enemies||[]).includes(en))}}
  finally{chooseEnemyTarget=before}
 });
 expect(actual).toEqual({targetCalls:0,hpBefore:9,hpAfter:9,enemyHp:0,enemyPresent:false});
});

test('Q002 solo: Hero start effects apply to the Hero actually beginning an activation, once per round',async({page},info)=>{
 await open(page);
 const actual=await page.evaluate(async()=>{
  init('Q002',['Rowan','Lyra']);for(const tile of Object.values(g.tiles))tile.enemies=[];
  runtimeHeroState('Rowan').hp=6;g.lyra.hp=4;
  addHeroCondition('Rowan','Bleeding');addHeroCondition('Lyra','Regenerating');render();
  const before={rowan:heroCurrentHp('Rowan'),lyra:heroCurrentHp('Lyra')};
  await endTurn();
  const first={hero:g.activeHero,rowan:heroCurrentHp('Rowan'),lyra:heroCurrentHp('Lyra'),round:g.round};
  switchHero('Lyra');const second={hero:g.activeHero,rowan:heroCurrentHp('Rowan'),lyra:heroCurrentHp('Lyra')};
  switchHero('Rowan');switchHero('Lyra');render();
  const repeated={rowan:heroCurrentHp('Rowan'),lyra:heroCurrentHp('Lyra')};
  return {before,first,second,repeated,conditions:{rowan:runtimeHeroState('Rowan').conditions,lyra:g.lyra.conditions}};
 });
 expect(actual.before).toEqual({rowan:6,lyra:4});
 expect(actual.first).toEqual({hero:'Rowan',rowan:5,lyra:4,round:2});
 expect(actual.second).toEqual({hero:'Lyra',rowan:5,lyra:5});
 expect(actual.repeated).toEqual({rowan:5,lyra:5});
 expect(actual.conditions.rowan).toContain('Bleeding');expect(actual.conditions.lyra).toContain('Regenerating');
 await info.attach('actual-q002-hero-activation-measurement',{body:JSON.stringify(actual),contentType:'application/json'});
});
