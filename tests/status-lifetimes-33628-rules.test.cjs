const {test}=require('node:test'),assert=require('node:assert/strict');
const R=require('../public/status-rules-33627.js');
for(const status of ['Exhausted','Disarmed','Frightened','Panicked','Chilled','Frozen','Hasted'])test(status+' expires at the end of the next distinct activation, including an extra turn',()=>{
 const b={hp:10,maxHp:10,conditions:[status],statusActivation33627:{start:'current'}};
 R.recordApplication(b,status,{round:1});R.end(b,{token:'current'});assert.equal(R.has(b,status),true);
 R.start(b,{token:'extra',baseActions:3,round:1,random:()=>0.9});R.end(b,{token:'extra',round:1});assert.equal(R.has(b,status),false);assert.equal(b.statusDurations33628[status],undefined);
});
for(const status of ['Dazed','Quickened','Prepared','Berserk','Frenzied','Channeling'])test(status+' expires at the end of the affected current turn if unused',()=>{
 const b={hp:10,conditions:[{name:status}],statusActivation33627:{start:'current'}};R.recordApplication(b,status,{round:1});R.end(b,{token:'current',round:1});assert.equal(R.has(b,status),false);
});
for(const status of ['Suppressed','Wet','Shocked','Electrified','Linked','Braced','Overwatch'])test(status+' expires at round end for Heroes and Enemies without deleting a new-round application',()=>{
 const old={hp:10,conditions:[status]},enemy={hp:10,conditions:[status]},fresh={hp:10,conditions:[status]};R.recordApplication(old,status,{round:1});R.recordApplication(enemy,status,{round:1});R.recordApplication(fresh,status,{round:2});
 const g={partyHeroes:['Elara','Thorne'],heroRuntimeStates:{Elara:old,Thorne:fresh},tiles:{'0,0':{enemies:[enemy]}}};R.expireRound(g,1);assert.equal(R.has(old,status),false);assert.equal(R.has(enemy,status),false);assert.equal(R.has(fresh,status),true);
});
test('refreshing a next-turn duration during the next activation extends to the following activation',()=>{
 const b={hp:10,conditions:['Frozen'],statusActivation33627:{start:'first'}};R.recordApplication(b,'Frozen',{round:1});R.start(b,{token:'second'});R.recordApplication(b,'Frozen',{round:1});R.end(b,{token:'second'});assert.equal(R.has(b,'Frozen'),true);R.start(b,{token:'third'});R.end(b,{token:'third'});assert.equal(R.has(b,'Frozen'),false);
});
test('persistent statuses survive activation and round boundaries',()=>{
 const b={hp:10,maxHp:20,conditions:['Weakened','Vulnerable','Inspired','Rooted','Regenerating']};R.start(b,{token:'one',round:1});R.end(b,{token:'one',round:1});R.expireRound({partyHeroes:['Elara'],heroRuntimeStates:{Elara:b}},1);assert.deepEqual(b.conditions,['Weakened','Vulnerable','Inspired','Rooted','Regenerating']);
});
test('Hasted grants an actual fourth Action, while Exhausted or Shocked prevent the bonus',()=>{
 for(const conditions of [['Hasted'],['Hasted','Exhausted'],['Hasted','Shocked']]){const b={hp:10,conditions:[...conditions]},out=R.start(b,{token:'start',baseActions:3});assert.equal(out.actions,conditions.length===1?4:3);assert.equal(R.has(b,'Shocked'),false)}
});
test('Exhausted prevents gains without consuming Shocked; Shocked consumes only on a positive allowed gain',()=>{
 const b={conditions:['Exhausted','Shocked']};assert.equal(R.additionalActions(b,1),0);assert.equal(R.has(b,'Shocked'),true);R.remove(b,'Exhausted');assert.equal(R.additionalActions(b,0),0);assert.equal(R.has(b,'Shocked'),true);assert.equal(R.additionalActions(b,2),0);assert.equal(R.has(b,'Shocked'),false);assert.equal(R.additionalActions(b,2),2);
});
for(let face=1;face<=6;face++)test('Confused rolls exactly once at activation start: face '+face,()=>{
 let calls=0;const b={hp:10,conditions:['Confused']},opts={token:'first',baseActions:3,random:()=>{calls++;return (face-0.5)/6}};assert.equal(R.start(b,opts).actions,face<=2?2:3);assert.equal(calls,1);assert.equal(R.start(b,opts).duplicate,true);assert.equal(calls,1);R.end(b,{token:'first'});R.start(b,{...opts,token:'extra'});assert.equal(calls,2);
});
