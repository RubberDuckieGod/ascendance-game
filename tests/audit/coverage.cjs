'use strict';
const fs=require('node:fs'),E=require('./effect-evidence.cjs');
const reference=JSON.parse(fs.readFileSync('audit/workbook-reference-v10.52.json','utf8'));
const contracts=E.contracts().records;
const evidencePath=process.argv[2]||'test-results/effect-evidence.json';
const evidence=fs.existsSync(evidencePath)?JSON.parse(fs.readFileSync(evidencePath,'utf8')):null;
const rows=['Hero Deck Cards','Equipment','Loot Deck'].flatMap(sheet=>reference.sheets[sheet].map(c=>{
 const id=c['Card ID'],record=contracts.find(r=>r.id===id&&r.sheet===sheet);
 const rules=reference.userOverrides?.HeroCardRules?.[id]||c['Rules Text']||c.Effect||[c['Ability 1'],c['Ability 2']].filter(Boolean).join('\n');
 const problem=!record?'No reviewed complete-effect contract.':record.rules!==rules?'Reviewed printed rules differ from the current workbook and overrides.':E.evidenceProblem(record,evidence);
 return {id,kind:sheet,name:c.Name,status:problem?'UNVERIFIED':'VERIFIED',note:problem||'All reviewed printed clauses have passing oracles for the current source fingerprint.',...(problem?{}:{sourceFingerprint:evidence.sourceFingerprint,clauses:record.clauses})};
}));
fs.writeFileSync('audit/coverage.json',JSON.stringify(rows,null,2)+'\n');
const unverified=rows.filter(r=>r.status!=='VERIFIED').length;
console.error('Full-effect item coverage: '+(rows.length-unverified)+' verified; '+unverified+' unverified; '+rows.length+' total. Status, Enemy, Location and campaign certification are separate outstanding scopes.');
process.exitCode=unverified?1:0;
