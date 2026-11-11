'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),R=require('../public/status-rules-33627.js');
const rows=require('../audit/workbook-reference-v10.52.json').sheets['Status Effects'];
test('Ward blocks exactly the 40 authored Harmful statuses, including Exposed, and preserves itself for all other 62 definitions',()=>{
 assert.equal(rows.length,102);assert.equal(rows.filter(row=>row.Type==='Harmful').length,40);
 for(const row of rows){
  const unit={conditions:['Ward']},out=R.application(unit,row['Status ID']);
  assert.equal(out.allowed,row.Type!=='Harmful',row.Name);
  assert.equal(R.has(unit,'Ward'),row.Type!=='Harmful',row.Name);
 }
});
test('Sanctified rolls only for authored Harmful conditions, including Exposed; neutral Wet and Exhausted cannot trigger it',()=>{
 for(const row of rows){
  let rolls=0;const unit={conditions:['Sanctified']},out=R.application(unit,row.Name,{random:()=>{rolls++;return 5/6}});
  assert.equal(out.allowed,row.Type!=='Harmful',row.Name);assert.equal(rolls,Number(row.Type==='Harmful'),row.Name);
  assert.equal(R.has(unit,'Sanctified'),true,row.Name);
 }
});
test('Sanctified failed save allows Exposed; Ward prevents it without rolling Sanctified',()=>{
 let rolls=0;const unit={conditions:['Ward','Sanctified']};
 assert.equal(R.application(unit,'Exposed',{random:()=>{rolls++;return 0}}).blockedBy,'Ward');assert.equal(rolls,0);
 assert.equal(R.application(unit,'Exposed',{random:()=>{rolls++;return 0}}).allowed,true);assert.equal(rolls,1);
});
