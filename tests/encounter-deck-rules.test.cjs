const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const rules=require('../encounter-deck-rules-33624.js');
const clone=x=>structuredClone(x),game=q=>({campaign:{currentQuest:q},encDeck:[],encDiscard:[],gold:47,hp:9,actions:2,tiles:{'0,0':{visited:false,enemies:[{type:'E111',hp:20}]}}});
function authored(name,file){const text=fs.readFileSync(path.join(__dirname,'..',file),'utf8'),line=text.split('const '+name+'=',2)[1].split('\n',1)[0];return JSON.parse(line.slice(0,line.lastIndexOf(';')))}
const catalogs=[authored('ENCS','index.html'),authored('C2_ENCOUNTERS','campaign2-3330.js'),authored('C34_ENCOUNTERS','campaign34-3340.js'),authored('C56_ENCOUNTERS','campaign56-3350.js')].flat();

test('Regional shared catalog exactly preserves all 110 authored copies and browser mirror',()=>{
 assert.deepEqual(rules.catalog({}),catalogs);assert.equal(catalogs.length,110);assert.equal(new Set(catalogs.map(c=>c.id)).size,105);
 assert.equal(fs.readFileSync(path.join(__dirname,'../encounter-deck-rules-33624.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../public/encounter-deck-rules-33624.js'),'utf8'));
});
for(let n=1;n<=6;n++)test(`Campaign ${n}: every Quest uses its authored regional Encounter range`,()=>{
 const [lo,hi]=rules.ranges[n-1];
 for(let q=(n-1)*12+1;q<=n*12;q++){
  const g=game('Q'+String(q).padStart(3,'0'));g.encDeck=clone(catalogs);
  const result=rules.repair(g,{random:()=>0});assert.equal(result.campaign,n);
  assert.equal(g.encDeck.length,n===1?35:15);assert.ok(g.encDeck.every(c=>Number(c.id.slice(2))>=lo&&Number(c.id.slice(2))<=hi));
  assert.equal(g.gold,47);assert.equal(g.hp,9);assert.equal(g.actions,2);assert.equal(g.tiles['0,0'].enemies[0].hp,20);
 }
});
test('Regional repair preserves legal deck/discard order, duplicate copies, and is idempotent',()=>{
 const g=game('Q001');g.encDeck=[{id:'EN003',uid:'a'},{id:'EN097'},{id:'EN003',uid:'b'},{id:'EN002'}];g.encDiscard=[{id:'EN061'},{id:'EN001'}];
 const first=rules.repair(g);assert.deepEqual(g.encDeck.map(c=>c.uid||c.id),['a','b','EN002']);assert.deepEqual(g.encDiscard,[{id:'EN001'}]);
 const snapshot=clone(g);assert.equal(first.changed,true);assert.equal(rules.repair(g).changed,false);assert.deepEqual(g,snapshot);
});
test('A clean legitimately exhausted deck remains empty',()=>{
 const g=game('Q001');assert.equal(rules.repair(g).changed,false);assert.deepEqual(g.encDeck,[]);assert.deepEqual(g.encDiscard,[]);
});
test('An all-foreign legacy deck reconstructs only the current region',()=>{
 const g=game('Q001');g.encDeck=[{id:'EN097'}];g.encDiscard=[{id:'EN061'}];
 rules.repair(g,{random:()=>0});assert.equal(g.encDeck.length,35);assert.ok(g.encDeck.every(c=>rules.cardCampaign(c)===1));assert.deepEqual(g.encDiscard,[]);
});
test('Foreign pending Encounter is visibly replaced without new Severity, Action, reward, or First Visit',()=>{
 const g=game('Q001');g.encDeck=[{id:'EN002',a:'low',b:'mid',c:'high',d:'top'},{id:'EN003'}];
 const p={kind:'encounter',hero:'Rowan',card:{id:'EN097'},severity:2,baseRoll:null,fixedSeverity:2,severityMode:'fixed',origin:{x:0,y:0},firstVisitTileKey:'0,0',round:13};
 const pending={Rowan:p},before=clone({...g,encDeck:null});
 const result=rules.repair(g,{pendingByHero:pending});
 assert.equal(p.card.id,'EN002');assert.equal(p.text,'low');assert.equal(p.severity,2);assert.equal(p.baseRoll,null);assert.equal(p.firstVisitTileKey,'0,0');assert.equal(p.round,13);
 assert.deepEqual(result.replaced,[{hero:'Rowan',previous:'EN097',replacement:'EN002'}]);assert.equal(g.gold,before.gold);assert.equal(g.actions,before.actions);assert.deepEqual(g.tiles,before.tiles);assert.deepEqual(g.encDeck,[{id:'EN003'}]);
});
test('Snapshot alias of one pending Encounter consumes exactly one replacement',()=>{
 const g=game('Q001');g.encDeck=[{id:'EN001',a:'one'},{id:'EN002',a:'two'}];
 const p={kind:'encounter',hero:'Rowan',card:{id:'EN097'},severity:1,origin:{x:0,y:0}},local=clone(p);
 const result=rules.repair(g,{pendingByHero:{Rowan:p},localPending:local});assert.equal(result.replaced.length,1);assert.equal(local.card.id,p.card.id);assert.deepEqual(g.encDeck.map(c=>c.id),['EN002']);
});
test('All-foreign reconstruction reserves one held card without removing its other authored copies',()=>{
 const g=game('Q001');g.encDeck=[{id:'EN097'}];const duplicated=rules.catalog(g).find((c,i,a)=>a.filter(x=>x.id===c.id).length>1);
 const p={kind:'encounter',card:duplicated,severity:1};rules.repair(g,{pendingByHero:{Rowan:p},random:()=>0});
 assert.equal(g.encDeck.length,34);assert.equal(g.encDeck.filter(c=>c.id===duplicated.id).length,rules.catalog(g).filter(c=>c.id===duplicated.id).length-1);assert.equal(p.card.id,duplicated.id);
});
test('A foreign pending Encounter can refill the existing legal discard once',()=>{
 const g=game('Q001');g.encDiscard=[{id:'EN003',a:'three'}];const p={card:{id:'EN097'},severity:1};
 rules.repair(g,{localPending:p,random:()=>0});assert.equal(p.card.id,'EN003');assert.deepEqual(g.encDeck,[]);assert.deepEqual(g.encDiscard,[]);assert.equal(rules.repair(g,{localPending:p}).changed,false);
});
test('Regional repair retains non-authored extension cards and does not guess unknown campaigns',()=>{
 const g=game('Q001');g.encDeck=[{id:'EN-AUDIT'},{id:'EN999'}];assert.equal(rules.repair(g).changed,false);assert.equal(g.encDeck.length,2);
 g.campaign={currentQuest:'CUSTOM'};g.encDeck=clone(catalogs);assert.equal(rules.repair(g).changed,false);assert.equal(g.encDeck.length,110);
});
test('World Event fallback and explicit Quest campaign take precedence over stale event',()=>{
 assert.equal(rules.campaign({campaign:{activeEvent:'WE024'}}),6);assert.equal(rules.campaign({campaign:{currentQuest:'Q001',activeEvent:'WE024'}}),1);
});
