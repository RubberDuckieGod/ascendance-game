'use strict';
// Read-only hashes of every top-level public JavaScript file and the game HTML.
const {createHash}=require('node:crypto');
const ref=process.env.EXPECTED_COMMIT,target='https://ascendance-game.onrender.com';
if(!/^[a-f0-9]{40}$/.test(ref||''))throw Error('EXPECTED_COMMIT must be a full source commit SHA.');
const hash=data=>createHash('sha256').update(data).digest('hex');
async function read(url,api=false){
 const headers={'Cache-Control':'no-cache'};if(api&&process.env.GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.GITHUB_TOKEN;
 const response=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(response.status+' '+url);return Buffer.from(await response.arrayBuffer());
}
async function batches(items,fn){const out=[];for(let i=0;i<items.length;i+=8)out.push(...await Promise.all(items.slice(i,i+8).map(fn)));return out}
(async()=>{
 const tree=JSON.parse((await read('https://api.github.com/repos/RubberDuckieGod/ascendance-game/git/trees/'+ref+'?recursive=1',true)).toString('utf8'));
 if(tree.truncated||!Array.isArray(tree.tree))throw Error('Cannot enumerate the complete expected public tree.');
 const files=tree.tree.filter(e=>e.type==='blob'&&/^public\/(?:[^/]+\.js|index\.html)$/.test(e.path)).map(e=>e.path.slice(7)).sort();
 if(!files.includes('index.html')||files.length<10)throw Error('Unexpected public asset manifest.');
 const expected=new Map(await batches(files,async file=>[file,await read('https://raw.githubusercontent.com/RubberDuckieGod/ascendance-game/'+ref+'/public/'+file)]));
 const deadline=Date.now()+Math.max(0,Math.min(600000,Number(process.env.VERIFY_WAIT_MS||0)));let attempts=0,results=[];
 do{
  attempts++;results=await batches(files,async file=>{try{const actual=await read(target+'/'+file+'?verify='+ref);return {file,expectedSha256:hash(expected.get(file)),actualSha256:hash(actual),match:expected.get(file).equals(actual)}}catch(error){return {file,match:false,error:error.message}}});
  if(results.every(r=>r.match)||Date.now()>=deadline)break;
  console.log(JSON.stringify({attempt:attempts,matching:results.filter(r=>r.match).length,total:files.length,waitingForDeployment:true}));
  await new Promise(resolve=>setTimeout(resolve,10000));
 }while(true);
 console.log(JSON.stringify({target,expectedCommit:ref,checkedAt:new Date().toISOString(),attempts,results},null,2));
 if(results.some(r=>!r.match))process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1});
