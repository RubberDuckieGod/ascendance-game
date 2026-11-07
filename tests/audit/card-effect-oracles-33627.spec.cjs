const {test,expect}=require('@playwright/test');
const catalog=require('../../audit/catalog.json')['Hero Deck Cards'];
const row=id=>catalog.find(card=>card['Card ID']===id);

async function open(page,{answers=[],confirm=false}={}){
 page.oracleErrors=[];page.oraclePrompts=[];
 page.on('pageerror',error=>page.oracleErrors.push(error.message));
 page.on('dialog',dialog=>{page.oraclePrompts.push(dialog.message());if(dialog.type()==='prompt')return dialog.accept(dialog.message().startsWith('Masterwork:')?'1':String(answers.length?answers.shift():'1'));return confirm?dialog.accept():dialog.dismiss()});
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascMechanics33621&&window.ascHeroCardParity33611&&window.ascHeroRuntime3362);
}
function prepare({hero,id,party=[hero]}){
 init('Q003',party);lobbyClose();g.activeHero=hero;g.round=2;g.phase='Hero Phase';
 const origin=g.tiles['0,0'];Object.assign(origin,{enemies:[],traits:[],special:'None.',reveal:'None.',ongoing:'None.',edges:{N:true,E:true,S:true,W:true},firstVisitTriggered:true,firstVisitUsed:true});
 delete origin.arcaneUntilRound;delete origin.arcaneSources32521;delete origin.consecratedUntilRound;g.arcaneWard3259=null;
 g.tiles['1,0']={...structuredClone(origin),id:'L001',name:'Oracle adjacent location',enemies:[]};
 g.heroAbilityRuntime3362={round:{},quest:{},turn:{},buffs:{},counters:{},flags:{}};
 for(const name of party){
  g.xp[name]=0;g.levels[name]=1;g.equipped[name]={Weapon:null,Armor:null,Shield:null,Offhand:null,Accessory:[]};
  const body=runtimeHeroState(name);Object.assign(body,{hp:4,actions:10,x:0,y:0,conditions:[],hand:[],discard:[],nextAttackBonus:0});
  body.deck=[1,2,3,4].map(number=>({...HERO_RUNTIME_CARDS[name][0],uid:name+'-draw-'+number,name:'Oracle draw '+number}));
 }
 const body=runtimeHeroState(hero),card={...HERO_RUNTIME_CARDS[hero].find(card=>card.id===id),uid:'oracle-played'};if(!card.id)throw Error('Missing production card '+id);body.hand=[card];
 render();return {cost:card.cost,card:{id:card.id,name:card.name,rules:card.rules},base:extraAttack(hero)};
}
async function fixture(page,config){const result=await page.evaluate(({config,prepare})=>(0,eval)('('+prepare+')')(config),{config,prepare:prepare.toString()});expect(result.cost,'Production card cost must match the independent printed reference').toBe(Number(row(config.id).Cost));return result}
async function attach(info,id,actual,extra={}){await info.attach('card-effect-oracle',{body:JSON.stringify({id,printed:row(id),actual,...extra}),contentType:'application/json'})}
test.afterEach(async({page},info)=>{
 const actual=await page.evaluate(()=>typeof g==='undefined'?null:{hero:controlledHero(),heroes:Object.fromEntries((g.partyHeroes||[]).map(hero=>{const body=runtimeHeroState(hero);return [hero,{hp:body?.hp,actions:body?.actions,hand:body?.hand?.map(card=>card.uid),discard:body?.discard?.map(card=>card.uid),conditions:body?.conditions}]})),enemies:Object.values(g.tiles||{}).flatMap(tile=>(tile.enemies||[]).map(enemy=>({name:enemy.name,hp:enemy.hp,conditions:enemy.conditions}))),log:g.adventureLog?.slice(-12)}).catch(error=>({readError:error.message}));
 await info.attach('card-effect-oracle-runtime',{body:JSON.stringify({actual,prompts:page.oraclePrompts,errors:page.oracleErrors}),contentType:'application/json'});
});

const drawCases=[
 {hero:'Kael',id:'H009-009',draw:2,discard:1,selfDamage:0},
 {hero:'Mira',id:'H010-014',draw:2,discard:1,selfDamage:0},
 {hero:'Malachar',id:'H011-019',draw:2,discard:1,selfDamage:0,overcharge:false},
 {hero:'Malachar',id:'H011-019',draw:3,discard:1,selfDamage:1,overcharge:true},
 {hero:'Garruk',id:'H012-012',draw:2,discard:1,selfDamage:1},
 {hero:'Veyra',id:'H013-012',draw:3,discard:1,selfDamage:1},
 {hero:'Veyra',id:'H013-016',draw:2,discard:1,selfDamage:0,afflicted:false},
 {hero:'Veyra',id:'H013-016',draw:2,discard:0,selfDamage:0,afflicted:true}
];
for(const spec of drawCases)test(`Card effect oracle ${spec.id}: ${row(spec.id).Name}${spec.overcharge!==undefined?' Overcharge '+spec.overcharge:spec.afflicted!==undefined?' afflicted '+spec.afflicted:''} exact card UIDs and Health`,async({page},info)=>{
 await open(page,{confirm:!!spec.overcharge});const setup=await fixture(page,spec);
 const actual=await page.evaluate(async spec=>{
  const body=runtimeHeroState(spec.hero);body.hand.unshift({...HERO_RUNTIME_CARDS[spec.hero][0],uid:'oracle-discard-choice',name:'Oracle discard choice'});
  if(spec.afflicted)g.tiles['0,0'].enemies=[{id:'E001',name:'Afflicted oracle Enemy',hp:100,max:100,attack:0,armor:0,conditions:['Weakened'],traits:[]}];
  const card=body.hand.find(card=>card.uid==='oracle-played');await playExtraCard(card);
  return {hand:body.hand.map(card=>card.uid),deck:body.deck.map(card=>card.uid),discard:body.discard.map(card=>card.uid),hp:body.hp,actions:body.actions};
 },spec);
 const expectedDrawn=Array.from({length:spec.draw},(_,index)=>`${spec.hero}-draw-${index+1}`);
 expect(actual.hand).toEqual(spec.discard?expectedDrawn:['oracle-discard-choice',...expectedDrawn]);
 expect(actual.deck).toEqual(Array.from({length:4-spec.draw},(_,index)=>`${spec.hero}-draw-${index+spec.draw+1}`));
 expect(actual.discard.sort()).toEqual((spec.discard?['oracle-discard-choice','oracle-played']:['oracle-played']).sort());
 expect(actual.hp).toBe(4-spec.selfDamage);expect(actual.actions).toBe(10-setup.cost);expect(page.oracleErrors).toEqual([]);await attach(info,spec.id,actual,{expected:{draw:spec.draw,discard:spec.discard,selfDamage:spec.selfDamage,cost:setup.cost}});
});

test('Card effect oracle H007-014: Ancient Wisdom draws two exact cards only for the chosen co-located ally',async({page},info)=>{
 await open(page,{answers:['2']});const setup=await fixture(page,{hero:'Thorne',id:'H007-014',party:['Thorne','Rowan','Asha']});
 const actual=await page.evaluate(async()=>{runtimeHeroState('Asha').x=1;await playExtraCard(runtimeHeroState('Thorne').hand[0]);return Object.fromEntries(['Thorne','Rowan','Asha'].map(hero=>{const b=runtimeHeroState(hero);return [hero,{hand:b.hand.map(card=>card.uid),deck:b.deck.map(card=>card.uid),discard:b.discard.map(card=>card.uid),actions:b.actions}]}))});
 expect(actual.Rowan.hand).toEqual(['Rowan-draw-1','Rowan-draw-2']);expect(actual.Rowan.deck).toEqual(['Rowan-draw-3','Rowan-draw-4']);expect(actual.Asha.hand).toEqual([]);expect(actual.Thorne.hand).toEqual([]);expect(actual.Thorne.discard).toEqual(['oracle-played']);expect(actual.Thorne.actions).toBe(10-setup.cost);expect(actual.Rowan.actions).toBe(10);expect(page.oracleErrors).toEqual([]);await attach(info,'H007-014',actual);
});

for(const id of ['H008-012','H008-013'])test(`Card effect oracle ${id}: ${row(id).Name} affects each living co-located Hero and excludes the adjacent Hero`,async({page},info)=>{
 await open(page);const setup=await fixture(page,{hero:'Cassian',id,party:['Cassian','Rowan','Asha']});
 const actual=await page.evaluate(async id=>{runtimeHeroState('Asha').x=1;await playExtraCard(runtimeHeroState('Cassian').hand[0]);return Object.fromEntries(['Cassian','Rowan','Asha'].map(hero=>{const b=runtimeHeroState(hero);return [hero,{hp:b.hp,hand:b.hand.map(card=>card.uid),discard:b.discard.map(card=>card.uid),actions:b.actions}]}))},id);
 for(const hero of ['Cassian','Rowan']){expect(actual[hero].hp).toBe(id==='H008-012'?5:4);expect(actual[hero].hand).toEqual(id==='H008-013'?[hero+'-draw-1']:[])}
 expect(actual.Asha.hp).toBe(4);expect(actual.Asha.hand).toEqual([]);expect(actual.Cassian.discard).toEqual(['oracle-played']);expect(actual.Cassian.actions).toBe(10-setup.cost);expect(actual.Rowan.actions).toBe(10);expect(page.oracleErrors).toEqual([]);await attach(info,id,actual);
});

test('Card effect oracle H008-011: Encore returns the selected ally Support UID and leaves its Attack discard untouched',async({page},info)=>{
 await open(page,{answers:['2']});const setup=await fixture(page,{hero:'Cassian',id:'H008-011',party:['Cassian','Rowan']});
 const actual=await page.evaluate(async()=>{const ally=runtimeHeroState('Rowan');ally.discard=[{id:'H005-011',uid:'ally-support',name:'Beast Lore',category:'Support'},{id:'H005-001',uid:'ally-attack',name:"Hunter's Shot",category:'Attack'}];await playExtraCard(runtimeHeroState('Cassian').hand[0]);return {allyHand:ally.hand.map(card=>card.uid),allyDiscard:ally.discard.map(card=>card.uid),actorDiscard:runtimeHeroState('Cassian').discard.map(card=>card.uid),actions:runtimeHeroState('Cassian').actions}});
 expect(actual).toEqual({allyHand:['ally-support'],allyDiscard:['ally-attack'],actorDiscard:['oracle-played'],actions:10-setup.cost});expect(page.oracleErrors).toEqual([]);await attach(info,'H008-011',actual);
});

for(const spec of [{hero:'Asha',id:'H016-010',heal:2,condition:null},{hero:'Thorne',id:'H007-012',heal:1,condition:'Burning'}])test(`Card effect oracle ${spec.id}: ${row(spec.id).Name} changes only its selected eligible recipient`,async({page},info)=>{
 await open(page,{answers:['2']});const setup=await fixture(page,{...spec,party:[spec.hero,'Rowan']});
 const actual=await page.evaluate(async spec=>{const ally=runtimeHeroState('Rowan');if(spec.condition)ally.conditions=['Burning','Inspired'];await playExtraCard(runtimeHeroState(spec.hero).hand[0]);return {self:runtimeHeroState(spec.hero).hp,ally:ally.hp,conditions:ally.conditions,discard:runtimeHeroState(spec.hero).discard.map(card=>card.uid),actions:runtimeHeroState(spec.hero).actions}},spec);
 expect(actual).toEqual({self:4,ally:4+spec.heal,conditions:spec.condition?['Inspired']:[],discard:['oracle-played'],actions:10-setup.cost});expect(page.oracleErrors).toEqual([]);await attach(info,spec.id,actual);
});

for(const spec of [{hero:'Asha',id:'H016-012',conditions:['Poisoned','Inspired'],expected:['Inspired']},{hero:'Garruk',id:'H012-016',conditions:['Rooted','Burning','Inspired'],expected:['Burning','Inspired']}])test(`Card effect oracle ${spec.id}: ${row(spec.id).Name} removes an eligible harmful Status and preserves other Statuses`,async({page},info)=>{
 await open(page);const setup=await fixture(page,spec);
 const actual=await page.evaluate(async spec=>{const body=runtimeHeroState(spec.hero);body.conditions=[...spec.conditions];await playExtraCard(body.hand[0]);return {conditions:body.conditions,hp:body.hp,actions:body.actions,hand:body.hand.map(card=>card.uid),discard:body.discard.map(card=>card.uid)}},spec);
 expect(actual).toEqual({conditions:spec.expected,hp:4,actions:10-setup.cost,hand:[],discard:['oracle-played']});expect(page.oracleErrors).toEqual([]);await attach(info,spec.id,actual);
});

test('Card effect oracle H012-016: Break Free with no printed removable Status preserves card, Health and Actions',async({page},info)=>{
 await open(page);await fixture(page,{hero:'Garruk',id:'H012-016'});
 const actual=await page.evaluate(async()=>{const body=runtimeHeroState('Garruk');body.conditions=['Burning','Inspired'];await playExtraCard(body.hand[0]);return {conditions:body.conditions,hp:body.hp,actions:body.actions,hand:body.hand.map(card=>card.uid),discard:body.discard.map(card=>card.uid)}});
 expect(actual).toEqual({conditions:['Burning','Inspired'],hp:4,actions:10,hand:['oracle-played'],discard:[]});expect(page.oracleErrors).toEqual([]);await attach(info,'H012-016',actual);
});

const buffs=[
 {hero:'Mira',id:'H010-013',recipient:'Rowan',bonus:2},
 {hero:'Kael',id:'H009-011',bonus:2},
 {hero:'Malachar',id:'H011-011',bonus:2},
 {hero:'Malachar',id:'H011-015',bonus:3,selfDamage:1},
 {hero:'Malachar',id:'H011-016',bonus:3,locked:true},
 {hero:'Garruk',id:'H012-017',bonus:2,locked:true,marked:true},
 {hero:'Veyra',id:'H013-018',bonus:1,locked:true,heal:1},
 {hero:'Lucien',id:'H015-015',bonus:1,locked:true,marked:true}
];
for(const spec of buffs)test(`Card effect oracle ${spec.id}: ${row(spec.id).Name} changes the real Basic Attack consumer${spec.locked?' only against its chosen Enemy':''} exactly once`,async({page},info)=>{
 const answers=[...(spec.recipient?['2']:spec.locked?['1']:[]),'2','1','1'];await open(page,{answers});const setup=await fixture(page,{...spec,party:spec.recipient?[spec.hero,spec.recipient]:[spec.hero]});
 const actual=await page.evaluate(async spec=>{
  const enemy=(id,name)=>({id,name,hp:100,max:100,armor:0,attack:0,move:0,range:0,conditions:[],traits:[]});
  const first=enemy('E001','Chosen target'),other=enemy('E002','Other target');if(spec.heal)first.conditions=['Weakened'];g.tiles['0,0'].enemies=[first,other];
  const recipient=spec.recipient||spec.hero;g.activeHero=recipient;render();const base=activeAttackValue();g.activeHero=spec.hero;render();await playExtraCard(runtimeHeroState(spec.hero).hand[0]);g.activeHero=recipient;render();
  const damages=[];for(const target of [other,first,first]){const before=target.hp;await attack();damages.push(before-target.hp)}
  return {base,damages,actorActions:runtimeHeroState(spec.hero).actions,recipientActions:runtimeHeroState(recipient).actions,actorHp:runtimeHeroState(spec.hero).hp,marked:first.conditions.some(value=>(typeof value==='string'?value:value.name)==='Marked'),actorHand:runtimeHeroState(spec.hero).hand.map(card=>card.uid),actorDiscard:runtimeHeroState(spec.hero).discard.map(card=>card.uid)};
 },spec);
 expect(actual.damages).toEqual(spec.locked?[actual.base,actual.base+spec.bonus,actual.base]:[actual.base+spec.bonus,actual.base,actual.base]);
 expect(actual.actorActions).toBe(10-setup.cost-(spec.recipient?0:3));expect(actual.recipientActions).toBe(10-3-(spec.recipient?0:setup.cost));expect(actual.actorHp).toBe(4+(spec.heal||0)-(spec.selfDamage||0));if(spec.marked)expect(actual.marked).toBe(true);expect(actual.actorHand).toEqual([]);expect(actual.actorDiscard).toEqual(['oracle-played']);expect(page.oracleErrors).toEqual([]);await attach(info,spec.id,actual,{expectedBonus:spec.bonus,expectedCost:setup.cost,scope:'Printed buff application and three real Basic Attack consumers; full duration/range/multiplayer certification remains separate.'});
});
