'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../public/status-rules-33627.js');
test('Protected reduces precisely the next positive damage and expires',()=>{
 const b={hp:8,conditions:['Protected']};assert.equal(R.damage(b,0),0);assert.equal(R.has(b,'Protected'),true);assert.equal(R.damage(b,3),2);assert.equal(b.hp,6);assert.equal(R.has(b,'Protected'),false);assert.equal(R.damage(b,3),3);
});
test('Barrier depletes two damage across hits, retaining its remainder in serialized Condition state',()=>{
 const b={hp:8,conditions:['Barrier']};assert.equal(R.damage(b,1),0);assert.deepEqual(b.conditions,[{name:'Barrier',remaining:1}]);const saved=JSON.parse(JSON.stringify(b));assert.equal(R.damage(saved,3),2);assert.equal(saved.hp,6);assert.equal(R.has(saved,'Barrier'),false);assert.equal(R.damage(saved,1),1);
});
test('Resolute prevents the first actual defeat, including fatal status damage, and never revives the already defeated',()=>{
 const b={hp:2,conditions:['Resolute']};assert.equal(R.damage(b,1),1);assert.equal(R.has(b,'Resolute'),true);assert.equal(R.damage(b,4),0);assert.equal(b.hp,1);assert.equal(R.has(b,'Resolute'),false);assert.equal(R.damage(b,2),1);assert.equal(b.hp,0);
 const c={hp:1,conditions:['Resolute','Poisoned']};R.start(c,{token:'one'});assert.equal(c.hp,1);assert.equal(R.has(c,'Resolute'),false);
 const dead={hp:0,conditions:['Resolute']};assert.equal(R.damage(dead,3),0);assert.equal(dead.hp,0);
});
test('typed elemental protections and Electrified follow their printed triggers',()=>{
 const b={hp:10,conditions:['Fireproof','Arcane Shield']};assert.equal(R.damage(b,1,{damageType:'Fire'}),0);assert.equal(R.has(b,'Arcane Shield'),true);assert.equal(R.damage(b,4,{damageType:'Cold'}),2);assert.equal(R.has(b,'Arcane Shield'),false);
 const e={hp:6,conditions:['Electrified']};assert.equal(R.damage(e,1,{damageType:'Physical'}),1);assert.equal(R.has(e,'Electrified'),true);assert.equal(R.damage(e,1,{damageType:'Lightning'}),2);assert.equal(R.has(e,'Electrified'),false);
 const fire={hp:6,conditions:['Burning','Fireproof']};R.end(fire,{token:'one'});assert.equal(fire.hp,6);assert.equal(R.has(fire,'Burning'),true);
});
