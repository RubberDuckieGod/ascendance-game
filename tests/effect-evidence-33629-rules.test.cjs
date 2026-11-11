'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),E=require('./audit/effect-evidence.cjs');
test('full-effect evidence rejects stale source, changed contracts, failed foundation, and missing clause oracles',()=>{
 const record=E.contracts().records[0],fingerprint=E.fingerprint(),contractHash=E.hash(JSON.stringify(E.contracts()));
 const valid={schema:1,sourceFingerprint:fingerprint,contractHash,native:{command:'npm test',exitCode:0,sourceFingerprint:fingerprint,passed:E.required('native')},browserPassed:E.required('browser')};
 assert.equal(E.evidenceProblem(record,valid),null);
 for(const [label,change]of [
  ['source',e=>e.sourceFingerprint='older source'],
  ['contract',e=>e.contractHash='older contract'],
  ['foundation',e=>e.native.exitCode=1],
  ['mixed source',e=>e.native.sourceFingerprint='different native source'],
  ['browser clause',e=>e.browserPassed.shift()],
  ['native clause',e=>e.native.passed.shift()]
 ]){const changed=structuredClone(valid);change(changed);assert.ok(E.evidenceProblem(record,changed),label);}
 assert.ok(E.evidenceProblem(record,null));
});
test('browser evidence excludes skipped, failed, retried-flaky, and same-title tests in another file',()=>{
 const spec=(file,title,statuses,expectedStatus='passed')=>({file,title,tests:[{expectedStatus,results:statuses.map(status=>({status}))}]});
 const report={suites:[{specs:[
  spec('focus-tonic-33629.spec.cjs','real',['passed']),
  spec('focus-tonic-33629.spec.cjs','skipped',['skipped']),
  spec('focus-tonic-33629.spec.cjs','failed',['failed']),
  spec('focus-tonic-33629.spec.cjs','flaky',['failed','passed']),
  spec('different.spec.cjs','real',['passed']),
  spec('focus-tonic-33629.spec.cjs','expected failure',['passed'],'failed')
 ]}]};
 assert.deepEqual(E.browserPassed(report),['focus-tonic-33629.spec.cjs :: real','different.spec.cjs :: real']);
});
