const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const R=require('../mechanics-rules-33621.js');
const HEROES=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
const clone=value=>JSON.parse(JSON.stringify(value));
function game(party=HEROES){
 const g={round:8,phase:'Hero Phase',partyHeroes:[...party],campaign:{currentQuest:'Q001',day:1,levelRuntime3360:{hero:{}}},heroAbilityRuntime3362:{round:{},quest:{'Aldric::Signature':true}},mechanics33621:{heroes:{}},hero:{x:0,y:0},hp:12,actions:3,heroRuntimeStates:{},equipped:{},tiles:{'0,0':{enemies:[]}}};
 for(const h of party){g.campaign.levelRuntime3360.hero[h]={round:{},used:{signature:true},buff:{retained:true},turnStart:{[h]:{x:0,y:0}}};g.heroRuntimeStates[h]={hp:9,actions:3,x:0,y:0};g.mechanics33621.heroes[h]={}}
 return g;
}
function payload(hero,round){return {round:{},levelRound:{[hero]:round}}}
function authored(g){
 const state=g.campaign.levelRuntime3360.hero;
 state.Kael.round={actionTypes:['Attack','Explore','Search']};
 state.Vaelis.round={actionTypes:['Attack','Skill'],firstSpellName:'Arcane Torrent',firstSpellRound:8,parallelUsed:8};
 state.Malachar.round={effectHits:{'H011-010-copy-1:8':1,'H011-010-copy-2:8':2},chainReaction:8};
 state.Aldric.round={bastionRetaliation:{Aldric:true,Lyra:true},commandReach:8};
 g.heroAbilityRuntime3362.round={'Aldric::Shield Wall':8,'Vaelis::Arcane Well':8};
 return g;
}
function rejected(data,g=game()){
 const before=clone(g),wireBefore=clone(data);assert.equal(typeof R.validateCooldownSnapshot(g,data),'string');assert.deepEqual(g,before);assert.deepEqual(data,wireBefore);
}

for(const hero of HEROES)test(`${hero}: ordinary action tracking remains valid resource state without being a cooldown`,()=>{
 const g=game([hero]);g.campaign.levelRuntime3360.hero[hero].round={actionTypes:['Attack','Move'],onceRound:8};
 const snapshot=R.cooldownSnapshot(g);assert.equal(R.validateCooldownSnapshot(g,snapshot),null);
 const restored=game([hero]);R.applyCooldowns(restored,JSON.parse(JSON.stringify(snapshot)),hero);
 assert.deepEqual(restored.campaign.levelRuntime3360.hero[hero].round,{actionTypes:['Attack','Move'],onceRound:8});
 assert.deepEqual(R.cooldowns(restored,hero).map(row=>row.key),['onceRound']);
});

test('all four authored tracking shapes survive a JSON resource round trip and preserve their gameplay predicates',()=>{
 const g=authored(game()),snapshot=JSON.parse(JSON.stringify(R.cooldownSnapshot(g))),restored=game();
 assert.equal(R.validateCooldownSnapshot(g,snapshot),null);R.applyCooldowns(restored,snapshot);
 assert.deepEqual(R.cooldownSnapshot(restored),snapshot);
 const states=restored.campaign.levelRuntime3360.hero;
 assert.equal(new Set(states.Kael.round.actionTypes).size,3); // Perfect Sequence's three-action prerequisite remains met.
 assert.equal(states.Vaelis.round.firstSpellRound,restored.round);assert.equal(states.Vaelis.round.firstSpellName,'Arcane Torrent');
 states.Malachar.round.effectHits['H011-010-copy-1:8']++;
 assert.equal(states.Malachar.round.effectHits['H011-010-copy-1:8'],2); // A second hit can reach Chain Reaction's trigger.
 assert.equal(snapshot.levelRound.Malachar.effectHits['H011-010-copy-1:8'],1);
 assert.equal(states.Aldric.round.bastionRetaliation.Lyra,true);assert.equal(states.Aldric.round.bastionRetaliation.Rowan,undefined);
});

test('snapshot generation and validation are pure and do not alias nested action, hit or retaliation data',()=>{
 const g=authored(game()),before=clone(g),snapshot=R.cooldownSnapshot(g),wireBefore=clone(snapshot);
 assert.equal(R.validateCooldownSnapshot(g,snapshot),null);assert.deepEqual(g,before);assert.deepEqual(snapshot,wireBefore);
 snapshot.levelRound.Kael.actionTypes.push('Skill');snapshot.levelRound.Malachar.effectHits['H011-010-copy-1:8']=99;snapshot.levelRound.Aldric.bastionRetaliation.Rowan=true;
 assert.deepEqual(g,before);
 g.campaign.levelRuntime3360.hero.Vaelis.round.actionTypes.push('Move');
 assert.deepEqual(snapshot.levelRound.Vaelis.actionTypes,['Attack','Skill']);
});

test('actor synchronization writes only the acting Hero and deep-copies all nested round metadata',()=>{
 const g=authored(game()),before=clone(g),incoming=R.cooldownSnapshot(g);
 incoming.round['Aldric::New Ability']=8;delete incoming.round['Aldric::Shield Wall'];incoming.round['Lyra::Forged']=8;
 incoming.levelRound.Aldric={actionTypes:['Attack','Search'],effectHits:{'temporary-effect:8':1},bastionRetaliation:{Lyra:true}};
 incoming.levelRound.Lyra={forgedCooldown:8,actionTypes:['Forged']};
 assert.equal(R.validateCooldownSnapshot(g,incoming),null);R.applyCooldowns(g,incoming,'Aldric');
 assert.equal(g.heroAbilityRuntime3362.round['Aldric::Shield Wall'],undefined);assert.equal(g.heroAbilityRuntime3362.round['Aldric::New Ability'],8);
 assert.equal(g.heroAbilityRuntime3362.round['Lyra::Forged'],undefined);assert.deepEqual(g.campaign.levelRuntime3360.hero.Lyra,before.campaign.levelRuntime3360.hero.Lyra);
 assert.deepEqual(g.campaign.levelRuntime3360.hero.Malachar,before.campaign.levelRuntime3360.hero.Malachar);
 assert.deepEqual(g.heroAbilityRuntime3362.quest,before.heroAbilityRuntime3362.quest);
 assert.deepEqual(g.campaign.levelRuntime3360.hero.Aldric.used,before.campaign.levelRuntime3360.hero.Aldric.used);
 assert.deepEqual(g.campaign.levelRuntime3360.hero.Aldric.buff,before.campaign.levelRuntime3360.hero.Aldric.buff);
 incoming.levelRound.Aldric.actionTypes.push('Move');incoming.levelRound.Aldric.effectHits['temporary-effect:8']=100;incoming.levelRound.Aldric.bastionRetaliation.Rowan=true;
 assert.deepEqual(g.campaign.levelRuntime3360.hero.Aldric.round,{actionTypes:['Attack','Search'],effectHits:{'temporary-effect:8':1},bastionRetaliation:{Lyra:true}});
 const current=clone(g);R.applyCooldowns(g,incoming,'Intruder');assert.deepEqual(g,current);
});

test('inactive saved Hero state is not exported as active level state or mutated, while legacy namespace stamps stay compatible',()=>{
 const g=game(['Aldric']);g.campaign.levelRuntime3360.hero.Lyra={round:{actionTypes:['Move'],onceRound:7}};g.heroAbilityRuntime3362.round={'Lyra::Historic':7};
 const before=clone(g),snapshot=R.cooldownSnapshot(g);assert.deepEqual(snapshot.levelRound,{Aldric:{}});assert.deepEqual(snapshot.round,{'Lyra::Historic':7});assert.equal(R.validateCooldownSnapshot(g,snapshot),null);assert.deepEqual(g,before);
 rejected(payload('Lyra',{actionTypes:['Move']}),g);
});

test('Worldheart refresh excludes tracking metadata and refreshes a real cooldown without erasing spell or Quest state',()=>{
 const g=authored(game());g.equipped.Vaelis={Weapon:'EQ068'};
 for(const h of ['Kael','Vaelis','Malachar','Aldric'])for(const row of R.cooldowns(g,h))assert.ok(!['actionTypes','firstSpellName','firstSpellRound','effectHits','bastionRetaliation'].includes(row.key));
 assert.ok(R.cooldowns(g,'Vaelis').some(row=>row.kind==='level'&&row.key==='parallelUsed'));
 const before=clone(g);assert.ok(R.action(g,'Vaelis','REFRESH',{key:'firstSpellRound',kind:'level'}).error);assert.deepEqual(g,before);
 assert.equal(R.action(g,'Vaelis','REFRESH',{key:'parallelUsed',kind:'level'}).refreshed,'parallelUsed');
 const round=g.campaign.levelRuntime3360.hero.Vaelis.round;assert.equal(round.parallelUsed,undefined);assert.equal(round.firstSpellRound,8);assert.equal(round.firstSpellName,'Arcane Torrent');assert.deepEqual(round.actionTypes,['Attack','Skill']);assert.equal(g.campaign.levelRuntime3360.hero.Vaelis.used.signature,true);
});

test('numeric cooldown stamps still reject future, negative, fractional, boolean and string values',()=>{
 for(const value of [9,-1,1.5,true,'8',null]){rejected({round:{'Aldric::Ability':value},levelRound:{}});rejected(payload('Aldric',{onceRound:value}));rejected(payload('Vaelis',{firstSpellRound:value}))}
 const g=game();for(const value of [0,1,8])assert.equal(R.validateCooldownSnapshot(g,{round:{'Aldric::Ability':value},levelRound:{Aldric:{onceRound:value}}}),null);
 rejected({round:{notNamespaced:8},levelRound:{}});rejected({round:{['Aldric::'+('x'.repeat(180))]:8},levelRound:{}});
});

test('action categories are bounded unique nonempty strings rather than unchecked nested state',()=>{
 for(const value of [{Attack:true},null,['Attack','Attack'],[1],[true],[''],['x'.repeat(81)],['Attack\nMove'],Array.from({length:33},(_,i)=>'Action'+i)])rejected(payload('Kael',{actionTypes:value}));
 assert.equal(R.validateCooldownSnapshot(game(),payload('Kael',{actionTypes:[]})),null);
 assert.equal(R.validateCooldownSnapshot(game(),payload('Kael',{actionTypes:Array.from({length:32},(_,i)=>'Action'+i)})),null);
});

test('Parallel Casting spell names remain strings with explicit size and text limits',()=>{
 for(const value of ['',8,true,{},[],null,'x'.repeat(181),'Arcane\u0000Torrent'])rejected(payload('Vaelis',{firstSpellName:value}));
 assert.equal(R.validateCooldownSnapshot(game(),payload('Vaelis',{firstSpellName:'Echo: The World’s Last Dawn — Arcane'})),null);
});

test('Chain Reaction hit counters accept their authored numeric map and reject malformed, excessive or unsafe data',()=>{
 for(const count of [0,-1,1.25,true,'2',null,1000001])rejected(payload('Malachar',{effectHits:{'card:8':count}}));
 for(const value of [[],null,{'card:8':{}},{['x'.repeat(181)]:1},Object.fromEntries(Array.from({length:129},(_,i)=>['card'+i,1]))])rejected(payload('Malachar',{effectHits:value}));
 for(const key of ['__proto__','constructor','prototype'])rejected(payload('Malachar',{effectHits:Object.fromEntries([[key,1]])}));
 assert.equal(R.validateCooldownSnapshot(game(),payload('Malachar',{effectHits:{'spell-uid:8':1000000}})),null);
});

test('Legendary Bastion retaliation uses true flags for current party Heroes only',()=>{
 for(const value of [[],null,{Intruder:true},{Aldric:false},{Aldric:1},{Aldric:'true'}])rejected(payload('Aldric',{bastionRetaliation:value}));
 rejected(payload('Aldric',{bastionRetaliation:{Lyra:true}}),game(['Aldric']));
 assert.equal(R.validateCooldownSnapshot(game(),payload('Aldric',{bastionRetaliation:Object.fromEntries(HEROES.map(h=>[h,true]))})),null);
});

test('containers, owner maps and unknown nested fields reject malformed or prototype-bearing state without mutation',()=>{
 for(const data of [[],true,'state',{round:[]},{round:null},{levelRound:[]},{levelRound:null},{extra:{}},payload('Intruder',{}),payload('Aldric',[]),payload('Aldric',null),payload('Aldric',{unknownNested:{used:true}}),payload('Aldric',{unknownNested:['Attack']})])rejected(data);
 for(const key of ['__proto__','constructor','prototype']){
  rejected({round:{},levelRound:Object.fromEntries([[key,{}]])});rejected(payload('Aldric',Object.fromEntries([[key,8]])));
 }
 const inherited=Object.create({inherited:8});inherited.own=8;assert.ok(R.validateCooldownSnapshot(game(),payload('Aldric',inherited)));
 const bigRound=Object.fromEntries(Array.from({length:1025},(_,i)=>['Aldric::Ability'+i,8]));rejected({round:bigRound,levelRound:{}});
 const bigHeroRound=Object.fromEntries(Array.from({length:129},(_,i)=>['ability'+i,8]));rejected(payload('Aldric',bigHeroRound));
});

test('older clients can omit optional cooldown sections without creating or changing gameplay state',()=>{
 const g=game(),before=clone(g);for(const data of [undefined,null,{}, {round:{}},{levelRound:{}}])assert.equal(R.validateCooldownSnapshot(g,data),null);assert.deepEqual(g,before);
});

test('shared browser and server round-state validation modules remain byte-identical',()=>{
 assert.equal(fs.readFileSync(path.join(__dirname,'../mechanics-rules-33621.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../public/mechanics-rules-33621.js'),'utf8'));
});
