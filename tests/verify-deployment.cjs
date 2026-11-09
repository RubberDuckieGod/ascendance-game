'use strict';
// Read-only deployment verification. No accounts, rooms or saved games are used.
const {createHash}=require('node:crypto');
const ref=process.env.EXPECTED_COMMIT;
if(!/^[a-f0-9]{40}$/.test(ref||''))throw Error('EXPECTED_COMMIT must be a full source commit SHA.');
const target='https://ascendance-game.onrender.com';
const files=['index.html','hero-runtime-parity-3362.js','healing-summons-rules-33627.js','healing-summons-runtime-33627.js','status-rules-33627.js','status-runtime-33627.js'];
async function read(url){
 const response=await fetch(url,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(response.status+' '+url);return Buffer.from(await response.arrayBuffer());
}
const hash=data=>createHash('sha256').update(data).digest('hex');
(async()=>{
 const results=[];
 for(const file of files){
  const expected=await read('https://raw.githubusercontent.com/RubberDuckieGod/ascendance-game/'+ref+'/public/'+file);
  const actual=await read(target+'/'+file+'?verify='+ref);
  results.push({file,expectedSha256:hash(expected),actualSha256:hash(actual),match:expected.equals(actual)});
 }
 console.log(JSON.stringify({target,expectedCommit:ref,checkedAt:new Date().toISOString(),results},null,2));
 if(results.some(r=>!r.match))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
