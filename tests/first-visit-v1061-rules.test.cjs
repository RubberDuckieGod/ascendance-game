const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../public/first-visit-rules-v1061.js');
const S=require('../public/status-rules-33627.js');
const R=require('../public/party-resources-v1058.js');
const fresh=(id='L001')=>({round:1,phase:'Hero Phase',campaign:{currentQuest:'Q001',instanceId32537:'test',questStatus:{Q001:'Active'}},partyResourceEpoch1058:1,partyHeroes:['Aldric','Lyra'],hero:{x:0,y:0},hp:8,maxHp:12,actions:3,conditions:[],heroDeck:[{name:'Deck 1'},{name:'Deck 2'}],heroHand:[{name:'Hand 1'}],heroDiscard:[],lyra:{x:0,y:0,hp:6,maxHp:8,conditions:[],actions:3},lyraDeck:[{name:'Lyra card'}],lyraHand:[],lyraDiscard:[],tiles:{'0,0':{id,visited:false,enemies:[]}},gold:25,adventureLog:[]});
const run=(g,action,args={},actor='Aldric')=>F.execute(g,actor,{feature:g.tiles['0,0'].id,action,...args},{turnHero:actor,random:()=>0.5,requireActive:true});
test('exact registry includes all 235 printed named features and labels unsupported entries',()=>{
 const a=F.audit();assert.equal(a.catalog,236);assert.equal(a.named,235);assert.equal(a.automated,175);assert.equal(a.referenceOnly.length,60);
 assert.equal(Object.values(F.catalog).filter(f=>f.timing==='arrival').length,142);
 assert.equal(Object.values(F.catalog).filter(f=>f.timing==='clear').length,93);
 assert.equal(Object.values(F.catalog).filter(f=>f.campaign).length,32);
});
test('arrival: enemies at original entry prevent consumption, qualifying arrival waits for encounter, then draws and discards exactly once',()=>{
 const g=fresh();g.tiles['0,0'].enemies=[{hp:2}];assert.equal(F.entry(g,'0,0','Aldric',{waiting:true}),false);
 g.tiles['0,0'].enemies=[];assert.equal(F.entry(g,'0,0','Aldric',{waiting:true}),true);
 assert.equal(F.offers(g,'Aldric').length,0);
 g.tiles['0,0'].enemies=[{hp:3}];assert.equal(F.finish(g,'0,0'),true);
 assert.equal(F.offers(g,'Aldric').length,1);
 assert.ok(run(g,'choose',{option:0,target:'Aldric'}).pending);
 assert.equal(g.heroHand.length,2);assert.equal(g.heroDeck.length,1);
 assert.ok(run(g,'pick',{indices:[1]}).resolved);
 assert.equal(g.heroHand.length,1);assert.equal(g.heroDiscard.length,1);
 assert.ok(run(g,'choose',{option:0,target:'Aldric'}).error);
 assert.equal(F.entry(g,'0,0','Aldric'),false);
});
test('Once Clear waits for clearance and does not open merely because enemies are defeated',()=>{
 const g=fresh('L003');g.tiles['0,0'].enemies=[{hp:2}];assert.equal(F.entry(g,'0,0','Aldric'),false);
 g.tiles['0,0'].enemies=[];assert.equal(F.offers(g,'Aldric').length,0);
 F.entry(g,'0,0','Aldric',{waiting:true});g.tiles['0,0'].enemies=[{hp:1}];F.finish(g,'0,0');assert.equal(F.offers(g,'Aldric').length,0);
 g.tiles['0,0'].enemies=[];assert.ok(F.offers(g,'Aldric')[0].options.some(x=>x.target==='Aldric'&&x.index===0));
 assert.ok(run(g,'choose',{option:0,target:'Aldric'}).resolved);assert.equal(g.hp,9);
 assert.equal(F.offers(g,'Lyra').length,0);
});
test('receipt survives serialization; once per Quest; no retrofit for already visited legacy locations',()=>{
 const g=fresh();g.tiles['0,0'].visited=true;assert.equal(F.entry(g,'0,0','Aldric'),false);
 g.tiles['0,0'].visited=false;F.entry(g,'0,0','Aldric');run(g,'decline');
 const loaded=JSON.parse(JSON.stringify(g));assert.equal(F.entry(loaded,'0,0','Aldric'),false);
 const next=fresh();next.partyResourceEpoch1058=2;F.preserve(loaded,next);assert.ok(F.entry(next,'0,0','Aldric'));
});
test('reject another hero selecting arrival and out-of-range indices; no additional draw after retry',()=>{
 const g=fresh();F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:0,target:'Lyra'},'Lyra').error);
 run(g,'choose',{option:0,target:'Aldric'});assert.ok(run(g,'pick',{indices:[20]}).error);assert.equal(g.heroHand.length,2);
 assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.heroHand.length,1);
});
test('Quest completion expires unresolved ordinary features',()=>{
 const g=fresh('L003');F.entry(g,'0,0','Aldric');g.campaign.questStatus.Q001='Completed';F.reconcile(g);
 assert.equal(F.rows(g).L003.stage,'expired');assert.equal(F.offers(g,'Aldric').length,0);
});
test('location-bound status source expires on departure',()=>{
 const g=fresh('L002');F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:0,target:'Aldric'}).resolved);
 assert.ok(S.has(g,'Focused'));g.hero.x=1;F.reconcile(g);assert.equal(S.has(g,'Focused'),false);
});
test('paid Action reserve when not active, then execute on own turn only',()=>{
 const g=fresh('L060');F.entry(g,'0,0','Aldric');const args={feature:'L060',action:'choose',option:0,target:'Aldric'};
 assert.equal(F.execute(g,'Aldric',args,{turnHero:null,requireActive:true}).reserved,true);assert.equal(g.actions,3);assert.equal(g.gold,25);
 assert.ok(F.execute(g,'Aldric',{feature:'L060',action:'resume'},{turnHero:'Lyra',requireActive:true}).error);
 assert.ok(run(g,'resume').resolved);assert.equal(g.actions,2);assert.equal(g.gold,35);
});
test('room entry received before position update is not prematurely expired',()=>{
 const g=fresh();g.hero.x=1;assert.ok(F.entry(g,'0,0','Aldric',{roomEntry:true}));F.reconcile(g);assert.equal(F.rows(g).L001.stage,'ready');assert.equal(F.offers(g,'Aldric').length,0);g.hero.x=0;assert.equal(F.offers(g,'Aldric').length,1);
});

test('new First Visit: Low Ward paid draw and no duplicate',()=>{const g=fresh('L069');F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:1,target:'Aldric'}).resolved);assert.equal(g.gold,20);assert.equal(g.heroHand.length,2);assert.ok(run(g,'choose',{option:1,target:'Aldric'}).error)});
test('new First Visit: Hidden expires when leaving',()=>{const g=fresh('L172');F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:0,target:'Aldric'}).resolved);assert.ok(S.has(g,'Hidden'));g.hero.x=1;F.reconcile(g);assert.equal(S.has(g,'Hidden'),false)});
test('new First Visit: lighthouse paid cleanse and bottom selection',()=>{const g=fresh('L187');g.conditions=['Blinded'];F.entry(g,'0,0','Aldric');assert.equal(run(g,'choose',{option:0,target:'Aldric'}).pending.kind,'J');assert.equal(g.gold,20);assert.equal(S.has(g,'Blinded'),false);assert.ok(run(g,'pick',{indices:[1]}).resolved);assert.equal(g.heroDeck[0].name,'Deck 2')});
