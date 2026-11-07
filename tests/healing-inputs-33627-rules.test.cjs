const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../public/healing-summons-rules-33627.js');
function game(id='H003-013'){
 return {phase:'Hero Phase',round:1,partyHeroes:['Elara','Aldric'],hero:{x:0,y:0},hp:5,conditions:[],equipped:{},campaign:{currentQuest:'Q003'},heroRuntimeStates:{Elara:{x:0,y:0,hp:5,maxHp:10,actions:3,supportInnateRound:1,conditions:[],hand:[{id,uid:'playing',name:R.CARDS[id].name}],deck:[],discard:[]}},tiles:{'0,0':{visited:true,edges:{E:true},enemies:[]},'1,0':{visited:true,edges:{W:true},enemies:[],consecratedUntilRound:2}}};
}
test('Malformed card arguments and restoration selections return errors without throwing or mutating',()=>{
 const cases=[null,[],1,'invalid',{cardId:{toString:null}},{cardId:'H003-013',selections:[null]},{cardId:'H003-013',selections:[[]]},{cardId:'H003-013',selections:[1]},{cardId:'H003-013',selections:[{hero:'Elara',options:'heal'}]},{cardId:'H003-013',selections:[{hero:'Elara',options:[{}]}]},{cardId:'H003-013',selections:[{hero:'Elara',options:['heal'],condition:[]}]}];
 for(const args of cases){const g=game(),before=JSON.stringify(g);let result;assert.doesNotThrow(()=>{result=R.playCard(g,'Elara',args)});assert.ok(result.error);assert.equal(JSON.stringify(g),before)}
});
test('Guided Path cannot redraw its currently resolving card from an otherwise empty deck',()=>{
 const g=game('H003-015'),r=R.playCard(g,'Elara',{cardId:'H003-015',cardUid:'playing',tileKey:'1,0',mode:'heal'}),b=g.heroRuntimeStates.Elara;
 assert.equal(r.error,undefined);assert.equal(b.x,1);assert.equal(b.actions,2);assert.deepEqual(b.hand,[]);assert.deepEqual(b.discard.map(c=>c.uid),['playing']);
});
test('A successful support card still discards its played UID exactly once',()=>{
 const g=game(),r=R.playCard(g,'Elara',{cardId:'H003-013',cardUid:'playing',selections:[{hero:'Elara',options:['heal']}]}),b=g.heroRuntimeStates.Elara;
 assert.equal(r.error,undefined);assert.equal(b.hp,6);assert.equal(b.actions,2);assert.equal(b.hand.length,0);assert.deepEqual(b.discard.map(c=>c.uid),['playing']);
});
for(const whole of [false,true])test(`Malformed ${whole?'whole containers':'nested maps'} cannot erase consumed receipts through JSON serialization`,()=>{
 const current=game(),b=current.heroRuntimeStates.Elara;
 b.equipmentLoot33612={'eq142:round':1};current.heroAbilityRuntime3362={round:{'Elara::Blessed Presence':1},quest:{'Elara::Worldroot Entry':true},turn:{'Elara::Living Wilds Draw':'1:Elara:1'}};
 current.tiles['1,0'].consecratedHealing33627={Aldric:1};current.tiles['1,0'].hiddenMovementByHero33627={Aldric:1};
 current.campaign.repPerks3360={quest:{Q003:{elderFirstHeal:true}}};current.campaign.parity3360={round:{'sunHeal:1:Aldric':true},tempest:{'tempest:1:Aldric':true}};current.campaign.levelRuntime3360={natureHealed:{'Thorne:1,0':true}};
 const incoming=JSON.parse(JSON.stringify(current));incoming.heroRuntimeStates.Elara.equipmentLoot33612=[];
 incoming.heroAbilityRuntime3362=whole?[]:{round:[],quest:[],turn:[],buffs:[],counters:[],flags:[]};incoming.tiles['1,0'].consecratedHealing33627=[];incoming.tiles['1,0'].hiddenMovementByHero33627=[];
 incoming.campaign.repPerks3360=whole?[]:{quest:{Q003:[]}};incoming.campaign.parity3360=whole?[]:{round:[],tempest:[]};incoming.campaign.levelRuntime3360=whole?[]:{natureHealed:[]};
 R.preserveCanonical(current,incoming);const restored=JSON.parse(JSON.stringify(incoming));
 assert.equal(Array.isArray(restored.heroAbilityRuntime3362),false);assert.equal(Array.isArray(restored.heroAbilityRuntime3362.round),false);assert.equal(restored.heroAbilityRuntime3362.round['Elara::Blessed Presence'],1);assert.equal(restored.heroAbilityRuntime3362.quest['Elara::Worldroot Entry'],true);assert.equal(restored.heroAbilityRuntime3362.turn['Elara::Living Wilds Draw'],'1:Elara:1');
 assert.equal(restored.heroRuntimeStates.Elara.equipmentLoot33612['eq142:round'],1);assert.equal(restored.tiles['1,0'].consecratedHealing33627.Aldric,1);assert.equal(restored.tiles['1,0'].hiddenMovementByHero33627.Aldric,1);
 assert.equal(restored.campaign.repPerks3360.quest.Q003.elderFirstHeal,true);assert.equal(restored.campaign.parity3360.round['sunHeal:1:Aldric'],true);assert.equal(restored.campaign.parity3360.tempest['tempest:1:Aldric'],true);assert.equal(restored.campaign.levelRuntime3360.natureHealed['Thorne:1,0'],true);
});
