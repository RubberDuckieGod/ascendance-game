const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const R=require('../downtime-resource-rules-33622.js');
const clone=x=>JSON.parse(JSON.stringify(x));
const equipment=id=>({key:'equipment:'+id,kind:'equipment',id,qty:1});
const loot=(id,qty=1)=>({key:'loot:'+id,kind:'loot',id,qty});
function setup(){
 const g={phase:'World Phase',gold:200,reputation:0,partyHeroes:['Aldric','Lyra'],hero:{x:0,y:0},hp:12,lyra:{x:0,y:0,hp:8},campaign:{downtime:true,currentQuest:'Q001',day:2},tiles:{'0,0':{id:'L000',traits:['Settlement'],enemies:[]}},inventory:{Aldric:[],Lyra:[]},equipped:{Aldric:{Weapon:'EQ002',Shield:null,Offhand:null,Armor:null,Accessory:[]},Lyra:{Weapon:'EQ037',Offhand:'EQ037',Shield:null,Armor:'EQ082',Accessory:['EQ098']}}};
 const current={abilityCooldowns33621:{round:{},levelRound:{}},cards:{Aldric:{deck:[],hand:[],discard:[]},Lyra:{deck:[],hand:[],discard:[]}},inventory:clone(g.inventory),equipped:clone(g.equipped),gold:200,partyQuestItems:[],lootDeck:[],lootDiscard:[],equipmentDecks:{},supplies:0,reputation:0,factionReputation:{},xp:{},levels:{},professions:null,crafting:null};
 return {g,current,next:clone(current)};
}
test('a canonical downtime purchase accepts its authored 40 Gold cost without a combat turn',()=>{
 const {g,current,next}=setup();next.inventory.Aldric.push(equipment('EQ002'));next.gold=160;
 assert.equal(R.validate(g,next,'Aldric',current),null);assert.equal(R.inspect(g,next,'Aldric',current).kind,'purchase');
 next.gold=175;assert.match(R.validate(g,next,'Aldric',current),/legal shop/);
});
test('positive Gold requires one owned sale at the authored Reputation price',()=>{
 const {g,current,next}=setup();next.gold=225;assert.ok(R.validate(g,next,'Aldric',current));
 next.equipped.Aldric.Weapon=null;next.gold=220;assert.equal(R.validate(g,next,'Aldric',current),null);
 next.gold=240;assert.ok(R.validate(g,next,'Aldric',current));
});
test('carried material stacks lose precisely one item when sold',()=>{
 const {g,current,next}=setup();current.inventory.Aldric=[loot('LT031',3)];next.inventory.Aldric=[loot('LT031',2)];
 const source=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');const catalog=JSON.parse(source.match(/const LOOT_CARDS=(\[[^\n]+\]);/)[1]);const def=catalog.find(x=>x.id==='LT031');
 next.gold+=Math.floor(Number(def.value)/2);assert.equal(R.validate(g,next,'Aldric',current),null);
 next.inventory.Aldric=[];assert.ok(R.validate(g,next,'Aldric',current));
});
test('equip, replacement and unequip preserve actor ownership and slot legality',()=>{
 const {g,current,next}=setup();current.inventory.Aldric=[equipment('EQ003')];next.inventory.Aldric=[equipment('EQ002')];next.equipped.Aldric.Weapon='EQ003';
 assert.equal(R.validate(g,next,'Aldric',current),null);
 next.equipped.Aldric.Armor='EQ003';next.equipped.Aldric.Weapon=null;assert.match(R.validate(g,next,'Aldric',current),/fit that slot/);
 next.equipped.Aldric.Armor=null;next.inventory.Aldric.push(equipment('EQ003'));assert.equal(R.validate(g,next,'Aldric',current),null);
});
test('two-handed weapons cannot be equipped beside a Shield or Offhand',()=>{
 const {g,current,next}=setup();const source=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');const rows=JSON.parse(source.match(/const EQ3280=(\[[^\n]+\]);/)[1]);const two=rows.find(x=>/two-handed/i.test(x.hands)&&x.slot==='Weapon');
 current.inventory.Aldric=[equipment(two.id),equipment('EQ078')];next.inventory.Aldric=[equipment('EQ002')];next.equipped.Aldric.Weapon=two.id;next.equipped.Aldric.Shield='EQ078';
 assert.match(R.validate(g,next,'Aldric',current),/Two-Handed/);
 next.inventory.Aldric.push(equipment('EQ078'));next.equipped.Aldric.Shield=null;assert.equal(R.validate(g,next,'Aldric',current),null);
});
test('a Hero can give exactly one owned nonquest item to a living party recipient',()=>{
 const {g,current,next}=setup();current.inventory.Aldric=[loot('LT031',2)];next.inventory.Aldric=[loot('LT031')];next.inventory.Lyra=[loot('LT031')];
 assert.equal(R.validate(g,next,'Aldric',current),null);assert.equal(R.inspect(g,next,'Aldric',current).kind,'trade');
 assert.ok(R.validate(g,next,'Lyra',current));g.lyra.hp=0;assert.ok(R.validate(g,next,'Aldric',current));
});
test('Gold, items and resources cannot be silently forged or modified for another Hero',()=>{
 const {g,current,next}=setup();next.inventory.Lyra=[equipment('EQ001')];next.gold=185;assert.ok(R.validate(g,next,'Aldric',current));
 next.inventory.Lyra=[];next.inventory.Aldric=[loot('LT031')];assert.ok(R.validate(g,next,'Aldric',current));
 next.inventory.Aldric=[];next.gold=200;next.reputation=1;assert.match(R.validate(g,next,'Aldric',current),/reputation/);
 next.reputation=0;next.cards.Aldric.hand=[{id:'FORGED'}];assert.match(R.validate(g,next,'Aldric',current),/cards/);
});
test('quest items cannot be sold or traded and unknown items cannot appear',()=>{
 const {g,current,next}=setup();current.inventory.Aldric=[loot('LT118')];next.inventory.Aldric=[];next.inventory.Lyra=[loot('LT118')];assert.ok(R.validate(g,next,'Aldric',current));
 next.inventory.Lyra=[];next.gold=1000;assert.ok(R.validate(g,next,'Aldric',current));
 next.inventory.Aldric=[loot('FAKE')];assert.match(R.validate(g,next,'Aldric',current),/Unknown items/);
});
test('downtime availability, ownership and canonical resources are required',()=>{
 const {g,current,next}=setup();g.campaign.downtime=false;assert.match(R.validate(g,next,'Aldric',current),/between Quest/);
 g.campaign.downtime=true;assert.match(R.validate(g,next,'Rowan',current),/current party/);assert.match(R.validate(g,next,'Aldric',null),/canonical/);
 assert.equal(R.validate(g,next,'Aldric',current),null);
});
test('Friendly purchase discount is committed once and repeat purchase has its full price',()=>{
 const {g,current,next}=setup();g.reputation=1;current.reputation=1;next.reputation=1;next.inventory.Aldric=[equipment('EQ002')];next.gold=165;
 assert.equal(R.validate(g,next,'Aldric',current),null);R.commit(g,next,'Aldric',current);
 assert.equal(g.campaign.repPerks3360.downtime['NONE:2:Q001:0'].generalFriendlyBuy,true);
 assert.ok(R.validate(g,next,'Aldric',current));next.gold=160;assert.equal(R.validate(g,next,'Aldric',current),null);
});
test('regional faction hostility blocks optional purchases and sales',()=>{
 const {g,current,next}=setup();g.campaign.currentQuest='Q050';g.campaign.factionReputation3342={freewake:-3};current.factionReputation={freewake:-3};next.factionReputation={freewake:-3};next.inventory.Aldric=[equipment('EQ002')];next.gold=160;
 assert.ok(R.validate(g,next,'Aldric',current));next.inventory.Aldric=[];next.equipped.Aldric.Weapon=null;next.gold=220;assert.ok(R.validate(g,next,'Aldric',current));
});
test('regional merchant discounts and travel purchase privileges follow canonical state',()=>{
 const {g,current,next}=setup();g.campaign.currentQuest='Q050';g.campaign.factionReputation3342={freewake:1};current.factionReputation={freewake:1};next.factionReputation={freewake:1};next.inventory.Aldric=[equipment('EQ002')];next.gold=165;
 assert.equal(R.validate(g,next,'Aldric',current),null);R.commit(g,next,'Aldric',current);assert.equal(g.campaign.repPerks3360.downtime['NONE:2:Q050:0'].freewakeFriendlyBuy,true);
 g.tiles['0,0']={id:'L010',traits:[],enemies:[]};g.activeMerchant={locationKey:'0,0',rarities:['Common'],freeItem:true};next.gold=200;
 assert.equal(R.validate(g,next,'Aldric',current),null);R.commit(g,next,'Aldric',current);assert.equal(g.activeMerchant.freeUsed,true);assert.ok(R.validate(g,next,'Aldric',current));
});
test('validation remains pure even for rejected partial transitions',()=>{
 const {g,current,next}=setup();const before=clone(g);next.gold=225;next.inventory.Aldric=[equipment('EQ001')];assert.ok(R.validate(g,next,'Aldric',current));assert.deepEqual(g,before);
});
test('root and browser rule modules remain byte-identical',()=>{
 assert.equal(fs.readFileSync(path.join(__dirname,'../downtime-resource-rules-33622.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../public/downtime-resource-rules-33622.js'),'utf8'));
});

test('resource snapshots exclude inactive Hero cooldown records without changing their save',()=>{
 const mechanics=require('../mechanics-rules-33621.js');
 const g={partyHeroes:['Aldric','Lyra'],campaign:{levelRuntime3360:{hero:{Aldric:{round:{shield:2}},Lyra:{round:{}},Rowan:{round:{snare:1}}}}}};
 const snapshot=mechanics.cooldownSnapshot(g);
 assert.deepEqual(snapshot.levelRound,{Aldric:{shield:2},Lyra:{}});
 assert.deepEqual(g.campaign.levelRuntime3360.hero.Rowan.round,{snare:1});
});
