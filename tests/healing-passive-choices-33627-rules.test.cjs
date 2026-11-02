const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../public/healing-summons-rules-33627.js');
function game(id='H003-014'){
 return {phase:'Hero Phase',round:1,partyHeroes:['Elara','Aldric'],hp:5,hero:{x:0,y:0},conditions:[],heroHand:[],heroDeck:[{uid:'aldric-draw',id:'A-draw'}],heroDiscard:[],equipped:{},campaign:{currentQuest:'Q003'},levels:{Elara:1},heroRuntimeStates:{Elara:{x:0,y:0,hp:5,maxHp:10,actions:3,supportInnateRound:1,conditions:[],hand:[{id,uid:'played',name:R.CARDS[id].name}],deck:[{uid:'elara-draw',id:'E-draw'},{uid:'elara-next',id:'E-next'}],discard:[]}},tiles:{'0,0':{visited:true,edges:{E:true},enemies:[]},'1,0':{visited:true,edges:{W:true},enemies:[]}}};
}
function add(g,h,level,x=0){g.partyHeroes.push(h);g.levels[h]=level;const b={x,y:0,hp:8,maxHp:11,conditions:[],hand:[],deck:[],discard:[]};if(h==='Seraphine')g.seraphine=b;else g.heroRuntimeStates[h]=b;return b}
const commune=options=>({cardId:'H003-014',cardUid:'played',selections:[{hero:'Elara',options:[options]},{hero:'Aldric',options:[options]}]});
const shepherd={cardId:'H003-016',cardUid:'played',tileKey:'1,0',allyHero:'Aldric',healHero:'Aldric'};
test('Spirit Conclave reveals a canonical card first, then requires an actual hand UID to discard',()=>{
 const g=game();add(g,'Asha',9,1);g.asc329={totem:{'0,0':1}};
 const played=R.playCard(g,'Elara',commune('inspired'));assert.equal(played.error,undefined);assert.equal(played.pendingChoices,true);
 const offer=R.passiveChoices(g,'Elara')[0];assert.equal(offer.label,'Spirit Conclave');assert.equal(offer.hero,'Elara');
 const drawn=R.resolveChoice(g,'Elara',{choiceId:offer.id,accept:true});assert.equal(drawn.draw,1);assert.equal(g.heroRuntimeStates.Elara.hand[0].uid,'elara-draw');assert.equal(offer.type,'discard');
 const before=JSON.stringify(g);assert.ok(R.resolveChoice(g,'Elara',{choiceId:offer.id,discardUid:'not-in-hand'}).error);assert.equal(JSON.stringify(g),before);
 assert.equal(R.resolveChoice(g,'Elara',{choiceId:offer.id,discardUid:'elara-draw'}).discarded,true);assert.equal(g.heroRuntimeStates.Elara.hand.length,0);assert.equal(g.heroRuntimeStates.Elara.discard.at(-1).uid,'elara-draw');
 const next=R.passiveChoices(g,'Elara')[0];assert.equal(R.resolveChoice(g,'Elara',{choiceId:next.id,accept:true}).skipped,true);assert.equal(g.heroHand.length,0);assert.equal(g.heroRuntimeStates.Elara.actions,1);
});
test('Spirit Chorus benefits each Hero at a Totem once, while Ancestral Aid remains once per Asha Round',()=>{
 const g=game();add(g,'Asha',9,1);g.asc329={totem:{'0,0':1}};R.playCard(g,'Elara',commune('inspired'));
 assert.equal(g.hp,6);assert.equal(g.heroRuntimeStates.Elara.hp,6);assert.equal(g.heroAbilityRuntime3362.round['Asha::Spirit Chorus:Elara'],1);assert.equal(g.heroAbilityRuntime3362.round['Asha::Spirit Chorus:Aldric'],1);
});
test('Verdant Reach keeps the selected newly drawn card when the player discards a previous card',()=>{
 const g=game('H003-016');add(g,'Thorne',7);g.tiles['1,0'].vineTerrain32526={owner:'Thorne'};g.heroHand=[{uid:'previous',id:'previous'}];
 const played=R.playCard(g,'Elara',shepherd);assert.equal(played.error,undefined);const offer=R.passiveChoices(g,'Elara')[0];assert.equal(offer.label,'Verdant Reach');assert.equal(offer.hero,'Aldric');
 assert.equal(R.resolveChoice(g,'Elara',{choiceId:offer.id,accept:true}).draw,1);assert.equal(R.resolveChoice(g,'Elara',{choiceId:offer.id,discardUid:'previous'}).discarded,true);
 assert.deepEqual(g.heroHand.map(c=>c.uid),['aldric-draw']);assert.equal(g.heroDiscard.at(-1).uid,'previous');assert.equal(g.heroAbilityRuntime3362.round['Thorne::Verdant Reach'],1);
 R.heal(g,'Aldric',1,{actor:'Elara'},'Elara');assert.equal(R.passiveChoices(g,'Elara').length,0);
});
test('Declining a draw/discard offer draws nothing and leaves its optional once-Round use available',()=>{
 const g=game('H003-016');add(g,'Thorne',7);g.tiles['1,0'].vineTerrain32526={owner:'Thorne'};R.playCard(g,'Elara',shepherd);const offer=R.passiveChoices(g,'Elara')[0];
 assert.equal(R.resolveChoice(g,'Elara',{choiceId:offer.id,accept:false}).declined,true);assert.equal(g.heroHand.length,0);assert.equal(g.heroDeck.length,1);assert.equal(g.heroAbilityRuntime3362.round['Thorne::Verdant Reach'],undefined);
});
test('Sanctified Vanguard requires another Hero at Seraphine’s Location and grants real Guarded state',()=>{
 const g=game();add(g,'Seraphine',11);const args=commune('heal');args.selections.push({hero:'Seraphine',options:['cleanse']});R.playCard(g,'Elara',args);const offer=R.passiveChoices(g,'Elara').find(q=>q.label==='Sanctified Vanguard');assert.ok(offer);assert.ok(g.seraphine.conditions.includes('Guarded'));
 const before=JSON.stringify(g);assert.ok(R.resolveChoice(g,'Elara',{choiceId:offer.id,targetHero:'Seraphine'}).error);assert.equal(JSON.stringify(g),before);
 assert.equal(R.resolveChoice(g,'Elara',{choiceId:offer.id,targetHero:'Aldric'}).guarded,true);assert.ok(g.conditions.includes('Guarded'));assert.equal(g.heroAbilityRuntime3362.round['Seraphine::Sanctified Vanguard'],1);
});
for(const mode of ['heal','draw'])test(`Ancestor’s Circle at level 14 uses its authored ${mode} choice without an undefined Totem function`,()=>{
 const g=game('H003-016');add(g,'Asha',14);g.asc329={totem:{'1,0':1}};R.playCard(g,'Elara',shepherd);
 const offer=R.passiveChoices(g,'Elara')[0];assert.equal(offer.label,'Ancestor’s Circle');const before=g.hp;
 const out=R.resolveChoice(g,'Elara',{choiceId:offer.id,targetHero:mode==='heal'?'Aldric':'Elara',mode});assert.equal(out.error,undefined);
 if(mode==='heal')assert.equal(g.hp,before+1);else assert.equal(g.heroRuntimeStates.Elara.hand.at(-1).uid,'elara-next');assert.equal(g.heroAbilityRuntime3362.round["Asha::Ancestor's Circle"],1);assert.equal(R.hasPending(g,'Elara'),false);
});
test('A passive choice is owned by its exact acting Hero and persists through compatibility snapshots',()=>{
 const g=game('H003-016');add(g,'Thorne',7);g.tiles['1,0'].vineTerrain32526={owner:'Thorne'};R.playCard(g,'Elara',shepherd);const q=R.passiveChoices(g,'Elara')[0];
 assert.ok(R.resolveChoice(g,'Aldric',{choiceId:q.id,accept:true}).error);const stale=game('H003-016');R.preserveCanonical(g,stale);assert.equal(R.passiveChoices(stale,'Elara')[0].id,q.id);
});
