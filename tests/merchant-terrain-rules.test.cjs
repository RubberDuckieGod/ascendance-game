const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const R=require('../merchant-terrain-rules-33627.js');
const heroes=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture(h='Aldric'){
 const g={partyHeroes:[h],phase:'Hero Phase',round:4,gold:100,reputation:0,hero:{x:0,y:0},hp:10,actions:3,lyra:{hp:8,actions:3,x:0,y:0},seraphine:{hp:11,actions:3,x:0,y:0},heroRuntimeStates:{},inventory:{[h]:[]},equipped:{[h]:{Accessory:['EQ098']}},campaign:{currentQuest:'Q002'},tiles:{'0,0':{id:'L001',traits:['Outdoor'],enemies:[]}}};
 for(const hero of heroes)g.heroRuntimeStates[hero]={hp:10,actions:3,x:0,y:0};
 return g;
}
const encounter=(id,severity)=>({hero:'Aldric',card:{id,name:id==='EN011'?'Merchant Under Guard':'Traveling Merchant'},severity,origin:{x:0,y:0}});
for(const h of heroes)test(`${h}: equipped Sure Footing is once per Round, survives same-Round extra turn and resets by Round`,()=>{
 const g=fixture(h);assert.equal(R.useCharm(g,h),true);assert.equal(R.body(g,h).travelersCharmRound,4);assert.equal(R.useCharm(g,h),false);R.body(g,h).actions=3;assert.equal(R.useCharm(g,h),false);g.round++;assert.equal(R.useCharm(g,h),true);g.equipped[h].Accessory=[];g.round++;assert.equal(R.useCharm(g,h),false);
});
test('EN011 permits a discounted purchase; resolving it does not award free Equipment',()=>{
 const g=fixture();R.encounterOffer(g,encounter('EN011',2));assert.deepEqual(g.inventory.Aldric,[]);assert.equal(R.quote(g,'Aldric','EQ097').price,55);const r=R.purchase(g,'Aldric','EQ097');assert.equal(r.purchased,true);assert.equal(g.gold,45);assert.deepEqual(g.inventory.Aldric,[{key:'equipment:EQ097',kind:'equipment',id:'EQ097',qty:1}]);assert.equal(g.activeMerchant.discountUsed,true);assert.equal(g.activeMerchant.closed,true);assert.ok(R.quote(g,'Aldric','EQ097').error);
});
test('an Encounter merchant discount takes precedence over ordinary Settlement and Caravan access',()=>{
 for(const id of ['L000','L047']){const g=fixture();g.tiles['0,0']={id,traits:['Settlement'],enemies:[]};R.encounterOffer(g,encounter('EN011',2));assert.equal(R.access(g,'Aldric').source,'Traveling Merchant');assert.equal(R.quote(g,'Aldric','EQ097').price,55)}
});
test('insufficient Gold, wrong Location and unknown items preserve every resource',()=>{
 const g=fixture();R.encounterOffer(g,encounter('EN011',2));g.gold=54;const before=clone(g);assert.match(R.purchase(g,'Aldric','EQ097').error,/55 Gold/);assert.deepEqual(g,before);g.hero.x=1;assert.ok(R.purchase(g,'Aldric','EQ097').error);g.hero.x=0;assert.ok(R.purchase(g,'Aldric','FAKE').error);assert.equal(g.activeMerchant.discountUsed,false);
});
test('guarded merchant benefits wait for every canonical guard enemy and activate once',()=>{
 const g=fixture(),enemies=[{roomEnemyId3301:'a',encounterToken:'guards',hp:1},{roomEnemyId3301:'b',encounterToken:'guards',hp:1},{roomEnemyId3301:'c',encounterToken:'guards',hp:1}];g.tiles['0,0'].enemies=enemies;assert.equal(R.encounterOffer(g,encounter('EN011',5),enemies).pending,true);assert.equal(g.activeMerchant,undefined);enemies[0].hp=0;enemies[1].hp=0;assert.equal(R.completeGuardedOffer(g),false);enemies[2].hp=0;assert.equal(R.completeGuardedOffer(g),true);assert.equal(g.activeMerchant.discount,20);assert.deepEqual(g.activeMerchant.rarities,['Common','Uncommon']);assert.equal(R.completeGuardedOffer(g),false);assert.equal(R.quote(g,'Aldric','EQ097').price,45);
});
test('invalid or missing guarded enemy group never opens merchant benefits',()=>{
 const g=fixture();assert.ok(R.encounterOffer(g,encounter('EN011',5),[{encounterToken:'guard',hp:1}]).error);assert.equal(g.pendingMerchant320,undefined);assert.equal(R.completeGuardedOffer(g),false);
});
test('SD080 offers a Common Consumable or Equipment at its printed 10 Gold discount',()=>{
 const g=fixture();R.searchOffer(g,{card:{id:'SD080'},tileKey:'0,0'});assert.equal(R.quote(g,'Aldric','EQ097').price,55);assert.equal(R.quote(g,'Aldric','LT001','loot').price,10);assert.equal(R.purchase(g,'Aldric','LT001','loot').price,10);assert.equal(g.gold,90);assert.equal(g.inventory.Aldric[0].id,'LT001');assert.equal(g.activeMerchant.closed,true);assert.ok(R.quote(g,'Aldric','EQ097').error);assert.ok(R.quote(g,'Aldric','LT003','loot').error);
});
test('Traveling Merchant Severity 7+ includes purchasable Legendary non-Unique stock',()=>{
 const g=fixture();R.encounterOffer(g,encounter('EN029',7));assert.ok(R.access(g,'Aldric').rarities.includes('Legendary'));assert.equal(g.activeMerchant.discount,25);
});
test('preserving canonical merchant flags prevents stale compatibility snapshots from replaying discounts',()=>{
 const g=fixture();R.encounterOffer(g,encounter('EN011',2));R.purchase(g,'Aldric','EQ097');const proposed={activeMerchant:{discount:999,discountUsed:false},pendingMerchant320:{fake:true}};R.preserveOffers(g,proposed);assert.deepEqual(proposed.activeMerchant,g.activeMerchant);assert.equal(proposed.pendingMerchant320,undefined);
});
test('merchant module metadata matches final authored Equipment and Loot IDs/prices',()=>{
 const html=fs.readFileSync('public/index.html','utf8'),eq=JSON.parse(html.match(/const EQ3280=(\[[^\n]+\]);/)[1]),loot=JSON.parse(html.match(/const LOOT_CARDS=(\[[^\n]+\]);/)[1]);for(const [kind,rows]of [['equipment',eq],['loot',loot]])for(const def of rows){const actual=R.definition(def.id,kind);assert.ok(actual,def.id);for(const field of ['name','value','rarity'])assert.equal(actual[field],def[field],`${def.id}.${field}`)}
 assert.equal(eq.find(e=>e.id==='EQ098').ability1,'Sure Footing — once per Round, ignore the additional Move Action required to leave Difficult Terrain.');assert.equal(eq.find(e=>e.id==='EQ097').ability1,'Vigor — increase Maximum Health by 2.');
});
test('new root/public modules compile and match byte for byte',()=>{const vm=require('node:vm');for(const name of ['merchant-terrain-rules-33627.js','merchant-terrain-runtime-33627.js']){const source=fs.readFileSync(name,'utf8');assert.equal(source,fs.readFileSync('public/'+name,'utf8'));new vm.Script(source,{filename:name})}});

test('Traveling Merchant free Item is a Consumable while Equipment remains paid',()=>{const g=fixture();R.encounterOffer(g,encounter('EN029',5));assert.equal(R.quote(g,'Aldric','EQ097').price,65);assert.equal(R.purchase(g,'Aldric','LT001','loot').price,0);assert.equal(g.gold,100);assert.equal(g.activeMerchant.freeUsed,true);assert.equal(R.quote(g,'Aldric','EQ097').price,65);assert.ok(R.quote(g,'Aldric','LT001','loot').error)});
test('a consumed one-purchase privilege falls back to an ordinary Settlement shop',()=>{const g=fixture();g.tiles['0,0'].traits=['Settlement'];R.encounterOffer(g,encounter('EN011',2));R.purchase(g,'Aldric','EQ097');assert.equal(g.activeMerchant.closed,true);assert.equal(R.access(g,'Aldric').source,'Settlement Shop');assert.equal(R.quote(g,'Aldric','EQ097').price,65)});
test('zero-Action attempted movement preserves the equipped Charm privilege',()=>{const vm=require('node:vm'),source=fs.readFileSync('merchant-terrain-runtime-33627.js','utf8'),at=source.indexOf('function spendDifficultMove('),end=source.indexOf('\nfunction install(',at),g=fixture(),context={R,g,isDifficult:()=>true};g.actions=0;vm.createContext(context);vm.runInContext(source.slice(at,end),context);assert.equal(context.spendDifficultMove('Aldric',g.tiles['0,0']),false);assert.equal(g.travelersCharmRound,undefined)});
