'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const L=require('../public/location-quest-rules-33627.js'),Q=require('../public/quest-transition-rules-33626.js'),W=require('../public/world-event-chain-rules-33627.js');
const t=id=>({id});
test('pool repair excludes all in-play, reserved, skipped and discarded physical Location IDs and keeps the first legal copy in order',()=>{
 const g={tiles:{'0,0':t('L000'),'1,0':t('L010')},pool:['L010','L047','L001','L001','L003','L004','L017','L043'].map(t),explorationDiscard3304:[t('L003')]};
 const before=structuredClone(g.tiles),pending={Rowan:{kind:'explore',tile:t('L047'),skipped:[t('L004')]}};
 const out=L.repairLocationPool(g,{pendingByHero:pending,localPending:t('L017')});
 assert.deepEqual(g.pool.map(x=>x.id),['L001','L043']);assert.equal(out.removed.length,6);assert.deepEqual(g.tiles,before);assert.equal(L.repairLocationPool(g).changed,false);
});
test('duplicate identity is illegal at both the same coordinate and a new coordinate; a different card may use a free coordinate',()=>{
 const g={tiles:{'0,0':t('L000'),'1,0':t('L047')}};
 assert.match(L.placementIssue(g,t('L047'),'2,0'),/already in play/);assert.match(L.placementIssue(g,t('L047'),'1,0'),/already in play/);
 assert.match(L.placementIssue(g,t('L010'),'1,0'),/occupied/);assert.equal(L.placementIssue(g,t('L010'),'2,0'),'');
});
test('a new attempt may use the same physical Location IDs on a rebuilt board',()=>{
 const g={tiles:{'0,0':t('L000')},pool:[t('L047'),t('L010')]};assert.equal(L.repairLocationPool(g).changed,false);
 assert.equal(L.placementIssue(g,t('L047'),'1,0'),'');
});
test('all timed events permit an attempt on the last day until that attempt resolves; cannot begin another after deadline',()=>{
 for(let i=1;i<=24;i++){const id='WE'+String(i).padStart(3,'0'),ev=W.event(id),q=ev.quests[0].id;
  if(!ev.dayLimit)continue;const c={activeEvent:id,currentQuest:q,day:ev.dayLimit,downtime:true,questStatus:{[q]:'Available'},history:[{event:id,quest:q,day:ev.dayLimit-1,outcome:'Failed'}]};
  const g={campaign:c};assert.equal(Q.deadlineSpent(g),false,id);assert.equal(Q.available(g,q),true,id);
  for(const outcome of ['Completed','Failed','Retreated']){c.history[1]={event:id,quest:q,day:ev.dayLimit,outcome};assert.equal(Q.deadlineSpent(g),true,id);assert.equal(Q.available(g,q),false,id)}
  c.history.pop();c.day++;assert.equal(Q.available(g,q),false,id);
 }
});
test('prior event final-day history does not expire the new event and untimed finales never expire',()=>{
 const history=[{event:'WE001',quest:'Q003',day:5,outcome:'Failed'}];
 assert.equal(Q.available({campaign:{activeEvent:'WE002',currentQuest:'Q004',day:1,history}},'Q004'),true);
 assert.equal(Q.available({campaign:{activeEvent:'WE004',currentQuest:'Q010',day:99,history}},'Q010'),true);
});
test('legacy Q002 repairs reserve drawn and skipped Locations, and solo legal check enforces unique IDs',()=>{
 const html=fs.readFileSync('public/index.html','utf8');
 for(const name of ['repairQ002Pool32564','repairQ002Required3267']){
  const at=html.indexOf('function '+name+'()'),body=html.slice(at,at+1100);assert.ok(at>=0);assert.ok(body.includes('pLoc'));assert.ok(body.includes('skipLoc'));assert.ok(body.includes('explorationDiscard3304'));
 }
 assert.ok(html.includes('Object.values(g.tiles||{}).some(placed=>placed?.id===t.id)'));
});
