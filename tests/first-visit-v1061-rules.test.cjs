const test=require('node:test');
const assert=require('node:assert/strict');
const F=require('../public/first-visit-rules-v1061.js');
const S=require('../public/status-rules-33627.js');
const R=require('../public/party-resources-v1058.js');
const M=require('../public/mechanics-rules-33621.js');
const fresh=(id='L001')=>({round:1,phase:'Hero Phase',campaign:{currentQuest:'Q001',instanceId32537:'test',questStatus:{Q001:'Active'}},partyResourceEpoch1058:1,partyHeroes:['Aldric','Lyra'],hero:{x:0,y:0},hp:8,maxHp:12,actions:3,conditions:[],heroDeck:[{name:'Deck 1'},{name:'Deck 2'}],heroHand:[{name:'Hand 1'}],heroDiscard:[],lyra:{x:0,y:0,hp:6,maxHp:8,conditions:[],actions:3},lyraDeck:[{name:'Lyra card'}],lyraHand:[],lyraDiscard:[],tiles:{'0,0':{id,visited:false,enemies:[]}},gold:25,adventureLog:[]});
const run=(g,action,args={},actor='Aldric')=>F.execute(g,actor,{feature:g.tiles['0,0'].id,action,...args},{turnHero:actor,random:()=>0.5,requireActive:true});
test('exact registry includes all 235 printed named features and labels unsupported entries',()=>{
 const a=F.audit();assert.equal(a.catalog,236);assert.equal(a.named,235);assert.equal(a.automated,235);assert.equal(a.referenceOnly.length,0);
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

test('L142 can keep or bottom the top exploration cards without resolving them',()=>{const g=fresh('L142');g.pool=[{name:'A'},{name:'B'},{name:'C'}];F.entry(g,'0,0','Aldric');assert.equal(run(g,'choose',{option:0,target:'Aldric'}).pending.kind,'T');assert.ok(run(g,'pick',{indices:[1]}).resolved);assert.deepEqual(g.pool.map(c=>c.name),['C','A','B'])});
test('WE003 wound marker caps Health without damage, survives JSON and cannot reapply',()=>{const g=fresh();g.campaign.activeEvent='WE003';g.campaign.questStatus={Q007:'Completed',Q008:'Failed',Q009:'Failed'};assert.ok(S.woundPending(g));const next=fresh();next.campaign={currentQuest:'Q010',activeEvent:'WE004',questStatus:{Q010:'Available'},downtime:false};next.hp=12;next.lyra.hp=8;assert.ok(S.woundSetup(g,next,'Q010'));assert.equal(next.hp,11);assert.equal(next.lyra.hp,7);assert.equal(S.maxHp(next,'Aldric'),11);const restored=JSON.parse(JSON.stringify(next));assert.equal(S.maxHp(restored,'Aldric'),11);S.remove(restored,'Bleeding');assert.equal(S.maxHp(restored,'Aldric'),11);restored.campaign.questStatus.Q010='Completed';assert.ok(S.woundReconcile(restored));assert.equal(restored.hp,11);assert.equal(S.maxHp(restored,'Aldric'),12);const retry=fresh();retry.campaign={currentQuest:'Q010',questStatus:{Q010:'Available'}};assert.equal(S.woundSetup(restored,retry,'Q010'),false);assert.equal(S.woundActive(retry,'Aldric'),false)});
test('two completed WE003 quests do not queue wound',()=>{const g=fresh();g.campaign.activeEvent='WE003';g.campaign.questStatus={Q007:'Completed',Q009:'Completed'};assert.equal(S.woundPending(g),false)});

test('Wound token survives Rest and ordinary recovery cannot exceed cap',()=>{const before=fresh();before.campaign={currentQuest:'Q009',activeEvent:'WE003',questStatus:{Q007:'Completed'}};S.woundPending(before);const g=fresh();g.campaign={currentQuest:'Q010',questStatus:{Q010:'Available'}};g.hp=10;S.woundSetup(before,g,'Q010');const result=M.action(g,'Aldric','REST');assert.equal(result.heal,1);assert.equal(g.hp,11);assert.ok(S.woundActive(g,'Aldric'))});

test('L013 transfers one actual Common consumable across an open connection and respects stack limits',()=>{const g=fresh('L013');g.tiles['0,0'].edges={E:1};g.tiles['1,0']={id:'L003',edges:{W:1},enemies:[]};g.lyra.x=1;g.inventory={Aldric:[{kind:'loot',id:'LT004',key:'loot:LT004',qty:2}],Lyra:[]};F.entry(g,'0,0','Aldric');assert.equal(run(g,'choose',{option:0,target:'Aldric'}).pending.kind,'A');assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.inventory.Aldric[0].qty,1);assert.equal(g.inventory.Lyra[0].qty,1)});
test('L095 takes an exact Ore copy only from an eligible Loot deck',()=>{const g=fresh('L095');g.lootDeck=['LT004','LT031'];g.inventory={Aldric:[]};F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:0,target:'Aldric'}).resolved);assert.deepEqual(g.lootDeck,['LT004']);assert.equal(g.inventory.Aldric[0].id,'LT031');assert.equal(g.actions,2)});
test('L209 name prediction does not reveal deck order and wrong prediction bottoms top',()=>{const g=fresh('L209');F.entry(g,'0,0','Aldric');const p=run(g,'choose',{option:0,target:'Aldric'}).pending;assert.equal(p.kind,'W');assert.ok(run(g,'pick',{indices:[p.options.indexOf('Deck 2')]}).resolved);assert.equal(g.heroDeck[0].name,'Deck 2');assert.ok(S.has(g,'Dazed'))});
test('L072 inspection unavailable when Search limit reached, without spending',()=>{const g=fresh('L072');g.searchDeck=[{name:'S1'},{name:'S2'}];g.tiles['0,0'].searchLimit=1;g.tiles['0,0'].searchCount=1;F.entry(g,'0,0','Aldric');assert.equal(F.offers(g,'Aldric')[0].options.length,0);assert.equal(g.actions,3)});

function campaignVisit(id,h='Aldric'){const g=fresh(id);g.campaign.downtime=true;g.campaign.currentQuest='Q013';g.campaign.questStatus={Q013:'Completed'};g.lootDeck=['LT004','LT012','LT005','LT006'];g.equipmentDecks={Common:['EQ081']};g.inventory={Aldric:[],Lyra:[]};F.entry(g,'0,0',h);return g}
test('campaign first visit receipt survives Quest transition and prevents duplicate treasury award',()=>{const g=campaignVisit('L051');assert.equal(run(g,'choose',{option:0,target:'Aldric'}).pending.kind,'k');assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.gold,35);assert.ok(F.campaignUsed(g,'L051'));const next=campaignVisit('L051');next.partyResourceEpoch1058=2;F.preserve(g,next);assert.equal(F.entry(next,'0,0','Aldric'),false)});
test('merchant offer transfers finite copies, refuses stack overflow and retains campaign opportunity',()=>{const g=campaignVisit('L067');g.inventory.Aldric=[{key:'loot:LT004',kind:'loot',id:'LT004',qty:4}];assert.ok(!F.offers(g,'Aldric').some(o=>o.options?.some(x=>x.target==='Aldric')));g.inventory.Aldric=[];const out=run(g,'choose',{option:0,target:'Aldric'});assert.equal(out.pending.kind,'k');assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.inventory.Aldric[0].id,'LT004');assert.ok(!g.lootDeck.includes('LT004'));assert.ok(F.campaignUsed(g,'L067'))});
test('next Quest boon is accepted once, then resolved at setup, not at acceptance',()=>{const g=campaignVisit('L126');g.campaign.currentQuest='Q037';assert.ok(run(g,'choose',{option:0,target:'Aldric'}).pending);assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.gold,20);assert.equal(g.heroHand.length,1);const next=fresh();next.campaign.currentQuest='Q038';next.partyResourceEpoch1058=2;F.setupDeferred(g,next,{random:()=>0});assert.equal(next.heroHand.length,2);assert.equal(next.firstVisitCampaign1063.deferred.L126.state,'consumed');const retry=fresh();retry.campaign.currentQuest='Q039';retry.partyResourceEpoch1058=3;F.setupDeferred(next,retry);assert.equal(retry.heroHand.length,1)});

test('L029 waits for the paid gate and grants Protected only afterwards',()=>{const g=fresh('L029');F.entry(g,'0,0','Aldric');assert.equal(F.offers(g,'Aldric').length,0);assert.equal(F.gateOptions(g,'Aldric',{turnHero:'Aldric',requireActive:true})[0].id,'L029');assert.ok(run(g,'gate').resolved);assert.equal(g.actions,2);assert.ok(run(g,'choose',{option:0,target:'Aldric'}).resolved);assert.ok(S.has(g,'Protected'))});
test('L049 requires activation before Hero deck inspection',()=>{const g=fresh('L049');F.entry(g,'0,0','Aldric');assert.equal(F.offers(g,'Aldric').length,0);assert.ok(run(g,'gate').resolved);assert.equal(run(g,'choose',{option:0,target:'Aldric'}).pending.kind,'I')});
test('L010 consumes real potion with no base Action and discards it',()=>{const g=fresh('L010');g.inventory={Aldric:[{key:'loot:LT001',kind:'loot',id:'LT001',qty:1}]};F.entry(g,'0,0','Aldric');assert.equal(run(g,'choose',{option:0,target:'Aldric'}).pending.kind,'i');assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.hp,10);assert.equal(g.actions,3);assert.deepEqual(g.lootDiscard,['LT001']);assert.equal(g.inventory.Aldric.length,0)});
test('L035 repairs one carried Common Broken Equipment without refreshing anything',()=>{const g=fresh('L035');g.inventory={Aldric:[{key:'equipment:EQ001',kind:'equipment',id:'EQ001',qty:1,broken:true}]};F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:0,target:'Aldric'}).pending);assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.equal(g.inventory.Aldric[0].broken,undefined);assert.equal(g.heroHand.length,0);assert.equal(g.heroDiscard.length,1)});
test('L052 moves only to a revealed Road using no base Action',()=>{const g=fresh('L052');g.tiles['0,0'].edges={E:1};g.tiles['1,0']={id:'L001',terrain:'Road',edges:{W:1},enemies:[]};F.entry(g,'0,0','Aldric');assert.ok(run(g,'choose',{option:0,target:'Aldric'}).pending);assert.equal(run(g,'pick',{indices:[0]}).fvMove.to,'1,0');assert.equal(g.hero.x,1);assert.equal(g.actions,3)});
test('L207 excludes unvisited destination',()=>{const g=fresh('L207');g.tiles['0,0'].edges={E:1};g.tiles['1,0']={id:'L003',terrain:'Road',edges:{W:1},enemies:[],visited:false};F.entry(g,'0,0','Aldric');assert.equal(F.offers(g,'Aldric')[0].options.length,0);g.tiles['1,0'].visited=true;assert.ok(F.offers(g,'Aldric')[0].options.some(o=>o.target==='Aldric'&&o.index===0));assert.ok(F.offers(g,'Aldric')[0].options.some(o=>o.target==='Lyra'&&o.index===0))});
test('L226 cannot spend explicitly Equipment-granted Status',()=>{const g=fresh('L226');g.conditions=['Focused','Inspired'];g.statusDurations33628={Focused:{sources:[{source:'equipment:EQ001'}]},Inspired:{sources:[{source:'Hero Card'}]}};F.entry(g,'0,0','Aldric');const r=run(g,'choose',{option:0,target:'Aldric'});assert.deepEqual(r.pending.options,['Remove Inspired; draw 1 Hero card']);assert.ok(run(g,'pick',{indices:[0]}).resolved);assert.ok(S.has(g,'Focused'));assert.ok(!S.has(g,'Inspired'))});
