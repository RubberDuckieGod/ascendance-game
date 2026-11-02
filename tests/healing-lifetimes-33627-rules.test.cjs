const {test}=require('node:test');
const assert=require('node:assert/strict');
const H=require('../public/healing-summons-rules-33627.js'),S=require('../public/status-rules-33627.js');
function game(level=1){return {round:1,phase:'Hero Phase',partyHeroes:['Elara','Thorne'],heroRuntimeStates:{Elara:{x:0,y:0,hp:5,maxHp:10,actions:3,conditions:[],statusActivation33627:{start:'current'},hand:[{id:'H003-016',uid:'shepherd',name:'Shepherd the Faithful'}],deck:[],discard:[]},Thorne:{x:0,y:0,hp:8,maxHp:9,actions:3,conditions:[]}},equipped:{},levels:{Thorne:level},campaign:{currentQuest:'Q003'},tiles:{'0,0':{visited:true,edges:{E:true},enemies:[]},'1,0':{visited:true,edges:{W:true},enemies:[]}}}}
const shepherd={cardId:'H003-016',cardUid:'shepherd',allyHero:'Thorne',tileKey:'1,0',healHero:'Thorne',entryChoices:{Elara:{wildGrowth:true}}};
test('Wild Growth level 1 grants temporary Regenerating through the end of the next distinct activation',()=>{
 const g=game();assert.equal(H.playCard(g,'Elara',shepherd).error,undefined);const b=g.heroRuntimeStates.Elara;assert.equal(b.wildGrowthRegenerating33627.appliedToken,'current');assert.equal(g.heroAbilityRuntime3362.flags['Elara::Wild Growth Boost'],undefined);
 S.heroEnd(g,'Elara',{token:'current'});assert.equal(S.has(b,'Regenerating'),true);S.heroStart(g,'Elara',{token:'next'});assert.equal(b.hp,6);S.heroEnd(g,'Elara',{token:'next'});assert.equal(S.has(b,'Regenerating'),false);assert.equal(b.wildGrowthRegenerating33627,undefined);
});
test('Wild Growth preserves pre-existing permanent Regenerating and explicit cleansing clears its own temporary metadata',()=>{
 const permanent=game();permanent.heroRuntimeStates.Elara.conditions=['Regenerating'];H.playCard(permanent,'Elara',shepherd);assert.equal(permanent.heroRuntimeStates.Elara.wildGrowthRegenerating33627,undefined);S.heroEnd(permanent,'Elara',{token:'next'});assert.equal(S.has(permanent.heroRuntimeStates.Elara,'Regenerating'),true);
 const temporary=game();H.playCard(temporary,'Elara',shepherd);S.remove(temporary.heroRuntimeStates.Elara,'Regenerating');assert.equal(temporary.heroRuntimeStates.Elara.wildGrowthRegenerating33627,undefined);
});
for(const [level,expected]of [[1,6],[2,7]])test(`Nature Renewal owner level ${level}: actual Regenerating recovery reaches exactly ${expected}`,()=>{
 const g=game(level),b=g.heroRuntimeStates.Elara;b.conditions=['Regenerating'];const out=S.heroStart(g,'Elara',{token:'start'});assert.equal(b.hp,expected);assert.equal(out.events.find(e=>e.status==='Regenerating').amount,expected-5);assert.equal(b.natureRenewalRound33627,level===2?1:undefined);
});
test('Nature Renewal is once per Hero per Round across duplicate and extra activations',()=>{
 const g=game(2),b=g.heroRuntimeStates.Elara;b.conditions=['Regenerating'];S.heroStart(g,'Elara',{token:'first'});assert.equal(b.hp,7);assert.equal(S.heroStart(g,'Elara',{token:'first'}).duplicate,true);assert.equal(b.hp,7);S.heroStart(g,'Elara',{token:'extra'});assert.equal(b.hp,8);assert.equal(g.heroAbilityRuntime3362.round['Thorne::Nature Renewal:Elara'],1);
});
test('Nature Renewal respects maximum Health, no-healing locks and actual positive recovery before consuming use',()=>{
 const g=game(2),b=g.heroRuntimeStates.Elara;b.conditions=['Regenerating'];b.hp=10;S.heroStart(g,'Elara',{token:'full'});assert.equal(b.natureRenewalRound33627,undefined);b.hp=8;b.noHealUntilTurnEnd=true;S.heroStart(g,'Elara',{token:'locked'});assert.equal(b.hp,8);assert.equal(b.natureRenewalRound33627,undefined);delete b.noHealUntilTurnEnd;b.hp=9;S.heroStart(g,'Elara',{token:'cap'});assert.equal(b.hp,10);assert.equal(b.natureRenewalRound33627,1);
});
test('Nature Renewal applies Blight reduction to the capped recovery and preserves the once-Round receipt',()=>{
 const g=game(2),b=g.heroRuntimeStates.Elara;b.conditions=['Regenerating'];g.campaign.activeEvent='WE014';g.tiles['0,0'].blightPatches33624=1;S.heroStart(g,'Elara',{token:'blight'});assert.equal(b.hp,6);assert.equal(b.natureRenewalRound33627,1);assert.equal(g.tiles['0,0'].blightHealingSuppressedRound33624,'1');
 const stale=game(2);stale.heroRuntimeStates.Elara.conditions=['Regenerating'];H.preserveCanonical(g,stale);assert.equal(stale.heroRuntimeStates.Elara.natureRenewalRound33627,1);S.heroStart(stale,'Elara',{token:'extra'});assert.equal(stale.heroRuntimeStates.Elara.hp,6);
});
test('Nature Renewal requires a living co-located Thorne; unrelated base Regenerating stays unchanged',()=>{
 for(const mode of ['away','defeated','absent']){const g=game(2),b=g.heroRuntimeStates.Elara;b.conditions=['Regenerating'];if(mode==='away')g.heroRuntimeStates.Thorne.x=1;if(mode==='defeated')g.heroRuntimeStates.Thorne.hp=0;if(mode==='absent')g.partyHeroes=['Elara'];S.heroStart(g,'Elara',{token:mode});assert.equal(b.hp,6);assert.equal(b.natureRenewalRound33627,undefined)}
});
test('Wings Consecrated ground survives stale snapshots, ignores same-activation replay and expires before the next own turn',()=>{
 const g=game(),b=g.heroRuntimeStates.Elara;b.hand=[{id:'H003-017',uid:'wings',name:'Wings of Mercy'}];g.heroRuntimeStates.Thorne.x=1;const stale=JSON.parse(JSON.stringify(g));H.playCard(g,'Elara',{cardId:'H003-017',cardUid:'wings',tileKey:'1,0',mode:'heal',healHero:'Thorne'},{commandId:'wings-1'});
 H.preserveCanonical(g,stale);assert.equal(H.consecrated(stale,'1,0'),true);const active=JSON.parse(JSON.stringify(g));assert.equal(H.expireOnHeroStart(g,'Elara',{token:'current'}).duplicate,true);assert.equal(H.consecrated(g,'1,0'),true);assert.equal(H.expireOnHeroStart(g,'Elara',{token:'extra-same-round'}).expired,1);assert.equal(g.round,1);assert.equal(H.consecrated(g,'1,0'),false);H.preserveCanonical(g,active);assert.equal(H.consecrated(active,'1,0'),false);assert.equal(active.tiles['1,0'].consecratedAuthority33627.active,false);
});
