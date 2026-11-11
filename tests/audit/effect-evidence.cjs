'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function fingerprint(){
 const paths=[...fs.readdirSync('.').filter(p=>/\.(?:js|cjs|html)$/.test(p)),...files('public').filter(p=>/\.(?:js|html)$/.test(p)),...files('tests').filter(p=>/\.(?:js|cjs|py)$/.test(p)),'audit/workbook-reference-v10.52.json','audit/effect-contracts.json','package.json','package-lock.json'];
 return hash([...new Set(paths)].sort().map(p=>p+'\0'+hash(fs.readFileSync(p))).join('\n'));
}
function contracts(){return JSON.parse(fs.readFileSync('audit/effect-contracts.json','utf8'));}
function required(kind){return [...new Set(contracts().records.flatMap(r=>r.clauses.flatMap(c=>c[kind]||[])))];}
function browserPassed(report){
 const passed=[];
 function visit(s){for(const spec of s.specs||[])for(const t of spec.tests||[]){
  if(t.expectedStatus==='passed'&&t.results?.length&&t.results.every(r=>r.status==='passed'))passed.push(path.basename(spec.file||s.file||'')+' :: '+spec.title);
 }for(const child of s.suites||[])visit(child);}
 visit(report);return passed;
}
function evidenceProblem(record,evidence){
 if(!evidence||evidence.schema!==1)return 'No current full-effect evidence.';
 if(evidence.sourceFingerprint!==fingerprint())return 'Evidence source fingerprint is stale.';
 if(evidence.contractHash!==hash(JSON.stringify(contracts())))return 'Reviewed effect contracts changed.';
 if(evidence.native?.exitCode!==0||evidence.native?.command!=='npm test')return 'Foundation suite did not pass.';
 if(evidence.native?.sourceFingerprint!==evidence.sourceFingerprint)return 'Native and browser evidence refer to different sources.';
 for(const clause of record.clauses){
  if(!clause.text||!((clause.browser||[]).length+(clause.native||[]).length))return 'A clause lacks an independent oracle.';
  for(const title of clause.browser||[])if(!evidence.browserPassed?.includes(title))return 'Missing passing browser oracle: '+title;
  for(const title of clause.native||[])if(!evidence.native.passed?.includes(title))return 'Missing passing native oracle: '+title;
 }
 return null;
}
module.exports={hash,fingerprint,contracts,required,browserPassed,evidenceProblem};
if(require.main===module){
 const native=JSON.parse(fs.readFileSync('test-results/effect-native.json','utf8'));
 const report=JSON.parse(fs.readFileSync(process.argv[2]||'test-results/effect-browser.json','utf8'));
 const evidence={schema:1,sourceFingerprint:fingerprint(),contractHash:hash(JSON.stringify(contracts())),native,browserPassed:browserPassed(report),workflowRun:process.env.GITHUB_RUN_ID||null,headSha:process.env.GITHUB_SHA||null};
 for(const record of contracts().records){const problem=evidenceProblem(record,evidence);if(problem)throw Error(record.id+': '+problem);}
 fs.writeFileSync('test-results/effect-evidence.json',JSON.stringify(evidence,null,2)+'\n');
 console.log('Current full-effect evidence: '+contracts().records.map(r=>r.id).join(', '));
}
