const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const reference=JSON.parse(fs.readFileSync(path.join(__dirname,'../../audit/catalog.json'),'utf8')).Heroes;
const early=JSON.parse(fs.readFileSync(path.join(__dirname,'../../hero-abilities-1-12-3360.json'),'utf8'));

async function open(page){
 page.passiveErrors=[];page.on('pageerror',error=>page.passiveErrors.push(error.message));page.on('dialog',dialog=>page.passiveDialogHandler?page.passiveDialogHandler(dialog):dialog.dismiss());
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.ascMechanics33621&&window.ascHeroRuntime3362&&window.ascLevelParity3360&&window.ascLevel3360);
}
function prepare({hero,unlock,below,party=[hero],armor=0,enemyCount=1}){
 init('Q003',party);lobbyClose();g.round=1;
 for(const h of party){g.xp[h]=0;g.levels[h]=1;g.equipped[h]={Weapon:null,Armor:null,Shield:null,Offhand:null,Accessory:[]};const state=searchHeroState(h);state.hp=heroMaxHp(h);state.actions=6;state.conditions=[];if(h!=='Aldric'){state.x=0;state.y=0}}
 g.xp[hero]=HERO_LEVEL_XP[unlock-1]-(below?1:0);g.levels[hero]=heroLevel(hero);g.activeHero=hero;
 const tile=g.tiles['0,0'];tile.id='L000';tile.name='Passive consumer fixture';tile.terrain='Settlement';tile.traits=[];tile.special=tile.reveal=tile.ongoing='None.';tile.edges={N:true,E:true,S:true,W:true};tile.firstVisitUsed=true;tile.firstVisitTriggered=true;
 tile.enemies=Array.from({length:enemyCount},(_,i)=>({id:'PASSIVE-'+i,type:'audit',name:'Passive target '+i,hp:100,max:100,maxHp:100,armor,attack:0,move:0,range:0,conditions:[],traits:[]}));g.tiles={'0,0':tile};
 return {hero,unlock,below,actualLevel:heroLevel(hero)};
}
async function samples(page,spec,run){
 const values=[];for(const below of [true,false])values.push(await page.evaluate(({spec,below,prepare,run})=>{
  const context=(0,eval)('('+prepare+')')({...spec,below});const actual=(0,eval)('('+run+')')();return {...context,...actual};
 },{spec,below,prepare:prepare.toString(),run:run.toString()}));return values;
}
async function evidence(info,spec,actual,expected){
 const printed=spec.unlock<=12?(early[spec.hero]?.[String(spec.unlock)]||[]).filter(row=>row.name===spec.ability):reference.filter(row=>(row['Hero Name']||'').includes(spec.hero)&&Number(row.Level)===spec.unlock);
 expect(printed.length,'The independent authored ability reference must exist').toBeGreaterThan(0);
 await info.attach('hero-passive-actual-consumer',{body:JSON.stringify({ability:spec.ability,hero:spec.hero,unlock:spec.unlock,printed,expected,actual}),contentType:'application/json'});
}

test('Hero passive: Garruk Level 4 Greater Bloodrage adds exactly 3 to the next actual Attack only',async({page},info)=>{
 await open(page);const spec={hero:'Garruk',unlock:4,ability:'Greater Bloodrage'};
 const actual=await samples(page,spec,()=>{
  damageHeroBy('Garruk',1,'Passive damage fixture');const tile=g.tiles['0,0'],en=tile.enemies[0],hit=()=>{const before=en.hp;runtimeHeroAttackEnemy('Garruk',{id:'PASSIVE',name:'Passive Attack',category:'Attack',rules:'',traits:''},{en,t:tile});return before-en.hp};
  return {hp:heroCurrentHp('Garruk'),first:hit(),second:hit()};
 });
 const expected=[{level:3,hp:11,first:5,second:3},{level:4,hp:11,first:6,second:3}];await evidence(info,spec,actual,expected);
 expect(actual.map(row=>({level:row.actualLevel,hp:row.hp,first:row.first,second:row.second}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Lucien Level 3 Single Combat changes only the first isolated Attack of the turn',async({page},info)=>{
 await open(page);const spec={hero:'Lucien',unlock:3,ability:'Single Combat'};
 const actual=await samples(page,spec,()=>{
  const tile=g.tiles['0,0'],en=tile.enemies[0],hit=()=>{const before=en.hp;runtimeHeroAttackEnemy('Lucien',{id:'PASSIVE',name:'Passive Attack',category:'Attack',rules:'',traits:''},{en,t:tile});return before-en.hp};return {first:hit(),second:hit()};
 });
 const expected=[{level:2,first:4,second:4},{level:3,first:6,second:4}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,first:row.first,second:row.second}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Veyra Level 4 Greater Malefic Hex is target-locked and consumed by one real Attack',async({page},info)=>{
 await open(page);const spec={hero:'Veyra',unlock:4,ability:'Greater Malefic Hex',enemyCount:2};
 const actual=await samples(page,spec,()=>{
  const tile=g.tiles['0,0'],[marked,other]=tile.enemies;addCond(marked,'Rooted');
  const hit=en=>{const before=en.hp;runtimeHeroAttackEnemy('Veyra',{id:'PASSIVE',name:'Passive Attack',category:'Attack',rules:'',traits:''},{en,t:tile});return before-en.hp};return {unrelated:hit(other),selected:hit(marked),again:hit(marked)};
 });
 const expected=[{level:3,unrelated:2,selected:4,again:2},{level:4,unrelated:2,selected:5,again:2}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,unrelated:row.unrelated,selected:row.selected,again:row.again}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Malachar Level 13 Elemental Dominion ignores exactly 1 Armor in actual Fire Attack damage',async({page},info)=>{
 await open(page);const spec={hero:'Malachar',unlock:13,ability:'Elemental Dominion',armor:2};
 const actual=await samples(page,spec,()=>{
  const tile=g.tiles['0,0'],en=tile.enemies[0];runtimeHeroAttackEnemy('Malachar',{id:'PASSIVE',name:'Passive Fire Attack',category:'Attack',rules:'',traits:'Fire; Spell'},{en,t:tile});return {damage:100-en.hp};
 });
 const expected=[{level:12,damage:0},{level:13,damage:1}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,damage:row.damage}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Veyra Level 14 Doom Script reduces actual target Armor only with two harmful statuses',async({page},info)=>{
 await open(page);const spec={hero:'Veyra',unlock:14,ability:'Doom Script',armor:2};
 const actual=await samples(page,spec,()=>{
  const tile=g.tiles['0,0'],en=tile.enemies[0];en.conditions=['Rooted'];const hit=()=>{const before=en.hp;runtimeHeroAttackEnemy('Veyra',{id:'PASSIVE',name:'Passive Attack',category:'Attack',rules:'',traits:''},{en,t:tile});return before-en.hp};const one=hit();en.conditions.push('Poisoned');return {one,two:hit()};
 });
 const expected=[{level:13,one:0,two:0},{level:14,one:0,two:1}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,one:row.one,two:row.two}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Asha Level 14 Ancestors Shelter blocks exactly the first harmful status at a Totem each Round',async({page},info)=>{
 await open(page);const spec={hero:'Asha',unlock:14,ability:"Ancestor's Shelter"};
 const actual=await samples(page,spec,()=>{
  g.asc329??={};g.asc329.totem={'0,0':1};addHeroCondition('Asha','Rooted');addHeroCondition('Asha','Weakened');const firstRound={rooted:heroHasCondition('Asha','Rooted'),weakened:heroHasCondition('Asha','Weakened')};g.round++;addHeroCondition('Asha','Burning');return {...firstRound,nextRoundBurning:heroHasCondition('Asha','Burning')};
 });
 const expected=[{level:13,rooted:true,weakened:true,nextRoundBurning:true},{level:14,rooted:false,weakened:true,nextRoundBurning:false}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,rooted:row.rooted,weakened:row.weakened,nextRoundBurning:row.nextRoundBurning}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

// Source inspection predicts failures in the following consumer mappings.
// They are normal independent assertions, never expected-failure/no-op passes.
test('Hero passive: Asha Level 3 Ancestral Aid heals a Level 1 ally once when that ally gains a beneficial status',async({page},info)=>{
 await open(page);const spec={hero:'Asha',unlock:3,ability:'Ancestral Aid',party:['Asha','Rowan']};
 const actual=await samples(page,spec,()=>{
  const ally=runtimeHeroState('Rowan');ally.hp=5;addHeroCondition('Rowan','Inspired');const first=ally.hp;addHeroCondition('Rowan','Guarded');return {allyLevel:heroLevel('Rowan'),first,second:ally.hp};
 });
 const expected=[{level:2,allyLevel:1,first:5,second:5},{level:3,allyLevel:1,first:6,second:6}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,allyLevel:row.allyLevel,first:row.first,second:row.second}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Thorne Level 11 Elder Canopy reduces the first actual Enemy Attack damage to a Level 1 ally',async({page},info)=>{
 await open(page);const spec={hero:'Thorne',unlock:11,ability:'Elder Canopy',party:['Thorne','Rowan']};
 const actual=await samples(page,spec,()=>{
  const ally=runtimeHeroState('Rowan');ally.hp=9;g.tiles['0,0'].vineTerrain32526=true;damageHeroBy('Rowan',3,'Enemy Attack — passive consumer fixture');const first=ally.hp;damageHeroBy('Rowan',3,'Enemy Attack — passive consumer fixture');return {allyLevel:heroLevel('Rowan'),first,second:ally.hp};
 });
 const expected=[{level:10,allyLevel:1,first:6,second:3},{level:11,allyLevel:1,first:7,second:4}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,allyLevel:row.allyLevel,first:row.first,second:row.second}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Asha Level 2 Totemic Presence changes an allied Heros first actual Attack only',async({page},info)=>{
 await open(page);const spec={hero:'Asha',unlock:2,ability:'Totemic Presence',party:['Asha','Rowan']};
 const actual=await samples(page,spec,()=>{
  g.asc329??={};g.asc329.totem={'0,0':1};const tile=g.tiles['0,0'],en=tile.enemies[0],hit=()=>{const before=en.hp;runtimeHeroAttackEnemy('Rowan',{id:'PASSIVE',name:'Passive Attack',category:'Attack',rules:'',traits:''},{en,t:tile});return before-en.hp};return {allyLevel:heroLevel('Rowan'),first:hit(),second:hit()};
 });
 const expected=[{level:1,allyLevel:1,first:3,second:3},{level:2,allyLevel:1,first:4,second:3}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,allyLevel:row.allyLevel,first:row.first,second:row.second}))).toEqual(expected);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Elara Level 13 Mercy Unbound draws exactly one actual card for healing a low-Health Hero once per Round',async({page},info)=>{
 await open(page);const spec={hero:'Elara',unlock:13,ability:'Mercy Unbound'};
 const actual=await samples(page,spec,()=>{
  const state=runtimeHeroState('Elara');state.hp=1;state.hand=[];state.discard=[];state.deck=Array.from({length:5},(_,i)=>({id:'PASSIVE-DRAW-'+i,uid:'passive-draw-'+i,name:'Passive draw '+i,category:'Support',speed:'Action',cost:1,rules:'None.'}));
  healHeroBy('Elara',1,'Passive recovery fixture');const first={hp:state.hp,hand:state.hand.length,deck:state.deck.length};healHeroBy('Elara',1,'Passive recovery fixture');return {first,second:{hp:state.hp,hand:state.hand.length,deck:state.deck.length},uids:state.hand.map(card=>card.uid)};
 });
 const expected=[{level:12,first:{hp:2,hand:0,deck:5},second:{hp:3,hand:0,deck:5}},{level:13,first:{hp:2,hand:1,deck:4},second:{hp:3,hand:1,deck:4}}];await evidence(info,spec,actual,expected);expect(actual.map(row=>({level:row.actualLevel,first:row.first,second:row.second}))).toEqual(expected);for(const row of actual)expect(new Set(row.uids).size).toBe(row.uids.length);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Cassian Level 3 Improved Rousing Verse draws two, discards the selected UID and triggers once per Round',async({page},info)=>{
 await open(page);const prompts=[];page.passiveDialogHandler=dialog=>{prompts.push(dialog.message());return dialog.type()==='prompt'?dialog.accept(/discard/i.test(dialog.message())?'2':'1'):dialog.accept()};
 const spec={hero:'Cassian',unlock:3,ability:'Improved Rousing Verse',party:['Cassian','Rowan','Asha'],enemyCount:0};
 const actual=await samples(page,spec,()=>{
  g.round=2;const actor=runtimeHeroState('Cassian'),ally=runtimeHeroState('Rowan'),other=runtimeHeroState('Asha');
  actor.actions=6;actor.hand=[1,2].map(n=>({...HERO_RUNTIME_CARDS.Cassian.find(c=>c.id==='H008-012'),uid:'verse-support-'+n}));actor.deck=[];actor.discard=[];
  ally.hand=[{...HERO_RUNTIME_CARDS.Rowan[0],uid:'verse-reserve'}];ally.deck=[1,2,3,4].map(n=>({...HERO_RUNTIME_CARDS.Rowan[0],uid:'verse-draw-'+n}));ally.discard=[];other.hand=[];
  playExtraCard(actor.hand.find(c=>c.uid==='verse-support-1'));const first={hand:ally.hand.map(c=>c.uid),discard:ally.discard.map(c=>c.uid),deck:ally.deck.map(c=>c.uid),other:other.hand.length};
  playExtraCard(actor.hand.find(c=>c.uid==='verse-support-2'));return {first,second:{hand:ally.hand.map(c=>c.uid),discard:ally.discard.map(c=>c.uid),deck:ally.deck.map(c=>c.uid),other:other.hand.length},actor:{hand:actor.hand.map(c=>c.uid),discard:actor.discard.map(c=>c.uid),actions:actor.actions}};
 });
 const below={hand:['verse-reserve'],discard:[],deck:['verse-draw-1','verse-draw-2','verse-draw-3','verse-draw-4'],other:0},at={hand:['verse-reserve','verse-draw-2'],discard:['verse-draw-1'],deck:['verse-draw-3','verse-draw-4'],other:0};
 const expected=[{level:2,first:below,second:below},{level:3,first:at,second:at}];await evidence(info,spec,actual,expected);expect(actual.map(value=>({level:value.actualLevel,first:value.first,second:value.second}))).toEqual(expected);for(const sample of actual)expect(sample.actor).toEqual({hand:[],discard:['verse-support-1','verse-support-2'],actions:4});expect(prompts.filter(message=>message.startsWith('Rousing Verse:'))).toHaveLength(2);expect(page.passiveErrors).toEqual([]);
});

test('Hero passive: Cassian Level 5 Maestro draws only after an Inspired ally resolves an actual Attack, once per Round',async({page},info)=>{
 await open(page);page.passiveDialogHandler=dialog=>dialog.type()==='prompt'?dialog.accept('1'):dialog.accept();
 const spec={hero:'Cassian',unlock:5,ability:'Maestro',party:['Cassian','Rowan']};
 const actual=await samples(page,spec,()=>{
  g.round=2;const actor=runtimeHeroState('Cassian'),ally=runtimeHeroState('Rowan');actor.hand=[];actor.discard=[];actor.deck=[1,2,3,4].map(n=>({...HERO_RUNTIME_CARDS.Cassian[0],uid:'maestro-draw-'+n}));ally.conditions=['Inspired'];
  const en=g.tiles['0,0'].enemies[0],hit=()=>runtimeHeroAttackEnemy('Rowan',{id:'PASSIVE',name:'Inspired ally Attack',category:'Attack',rules:'',traits:''},{en,t:g.tiles['0,0']});
  const before=actor.hand.length;hit();const first=actor.hand.map(c=>c.uid);hit();const repeated=actor.hand.map(c=>c.uid);g.round++;hit();return {before,first,repeated,nextRound:actor.hand.map(c=>c.uid),enemyHp:en.hp};
 });
 const expected=[{level:4,before:0,first:[],repeated:[],nextRound:[]},{level:5,before:0,first:['maestro-draw-1'],repeated:['maestro-draw-1'],nextRound:['maestro-draw-1','maestro-draw-2']}];await evidence(info,spec,actual,expected);expect(actual.map(value=>({level:value.actualLevel,before:value.before,first:value.first,repeated:value.repeated,nextRound:value.nextRound}))).toEqual(expected);for(const sample of actual)expect(sample.enemyHp).toBe(88);expect(page.passiveErrors).toEqual([]);
});

for(const level of [1,2,3])test(`Hero passive: Elara Level ${level} Bless uses the printed Divine Grace Health and Blessed Presence gate once per Round`,async({page},info)=>{
 await open(page);const answers=['1','0','3','1','0'],prompts=[];page.passiveDialogHandler=dialog=>{prompts.push(dialog.message());return dialog.type()==='prompt'?dialog.accept(answers.shift()||'0'):dialog.dismiss()};
 const spec={hero:'Elara',unlock:level,ability:level===3?'Improved Divine Grace':level===2?'Blessed Presence':'Divine Grace',party:['Elara','Rowan','Thorne'],enemyCount:0};
 const actual=await page.evaluate(({spec,prepare})=>{
  (0,eval)('('+prepare+')')({...spec,below:false});g.round=2;const actor=runtimeHeroState('Elara'),recipient=runtimeHeroState('Thorne');recipient.hp=3;actor.actions=6;actor.hand=[1,2].map(n=>({...HERO_RUNTIME_CARDS.Elara.find(c=>c.id==='H003-012'),uid:'grace-bless-'+n}));actor.deck=[];actor.discard=[];
  playExtraCard(actor.hand.find(c=>c.uid==='grace-bless-1'));const first={hp:recipient.hp,inspired:heroHasCondition('Thorne','Inspired'),receipt:g.heroAbilityRuntime3362.round['Elara::Blessed Presence']??null};
  playExtraCard(actor.hand.find(c=>c.uid==='grace-bless-2'));return {level:heroLevel('Elara'),first,second:{hp:recipient.hp,inspired:heroHasCondition('Thorne','Inspired'),receipt:g.heroAbilityRuntime3362.round['Elara::Blessed Presence']??null},actions:actor.actions,hand:actor.hand.map(c=>c.uid),discard:actor.discard.map(c=>c.uid),cardCost:HERO_RUNTIME_CARDS.Elara.find(c=>c.id==='H003-012').cost};
 },{spec,prepare:prepare.toString()});
 const expected={hp:3+(level>=3?2:1),inspired:level>=2,receipt:level>=2?2:null};await evidence(info,spec,actual,{level,first:expected,second:expected});expect(actual.level).toBe(level);expect(actual.first).toEqual(expected);expect(actual.second).toEqual(expected);expect(actual.actions).toBe(6-2*actual.cardCost);expect(actual.hand).toEqual([]);expect(actual.discard).toEqual(['grace-bless-1','grace-bless-2']);expect(prompts.filter(message=>message.startsWith('Divine Grace:'))).toHaveLength(1);expect(page.passiveErrors).toEqual([]);
});
