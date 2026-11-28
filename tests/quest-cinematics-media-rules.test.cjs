'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const M=require('../server/quest-cinematics-1059.cjs');
function mockVideo(){const b=Buffer.alloc(2048);b.writeUInt32BE(24,0);b.write('ftyp',4);b.write('isom',8);return b}
const source='https://dnznrvs05pmza.cloudfront.net/fixture.mp4';
async function fixture(fn){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'asc-cinematic-'));try{return await fn(path.join(dir,'cinematics','Q001.mp4'))}finally{await fs.rm(dir,{recursive:true,force:true})}}
test('server only accepts explicit approved HTTPS media source and valid MP4 header',()=>{assert.ok(M.validSource(source));assert.equal(M.validSource('http://dnznrvs05pmza.cloudfront.net/a'),null);assert.equal(M.validSource('https://evil.example/'),null);assert.equal(M.validSource('https://a@dnznrvs05pmza.cloudfront.net/'),null);assert.equal(M.mp4Header(mockVideo()),true);assert.equal(M.mp4Header(Buffer.from('<html>unavailable</html>')),false)});
test('download persists atomically and a restart does not need the original signed URL',()=>fixture(async file=>{let calls=0;const fetcher=async()=>{calls++;return new Response(mockVideo(),{headers:{'content-length':'2048'}})};const a=await M.importVideo(file,source,fetcher);assert.equal(a.ready,true);assert.equal(a.bytes,2048);assert.equal(await M.fileReady(file),true);const b=await M.importVideo(file,'',fetcher);assert.equal(b.existing,true);assert.equal(calls,1);assert.deepEqual(await fs.readFile(file),mockVideo())}));
test('invalid or partial downloads never publish and clean up the temporary file',()=>fixture(async file=>{for(const response of [new Response('bad'),new Response(mockVideo(),{headers:{'content-length':'3000'}}),new Response('',{status:403})]){const a=await M.importVideo(file,source,async()=>response);assert.equal(a.ready,false);assert.equal(await M.fileReady(file),false);assert.deepEqual(await fs.readdir(path.dirname(file)),[])}}));
test('configured status is public metadata only and no video source secret is returned',()=>fixture(async file=>{const routes={};const app={get:(p,fn)=>{routes[p]=fn}},secret=source+'?signed=secret';const dataDir=path.dirname(path.dirname(file));const a=M.mountQuestCinematics(app,{dataDir,source:secret,fetcher:async()=>new Response(mockVideo()),logger:{log(){},warn(){}}});assert.equal(a.status().entries.Q001.configured,true);assert.equal(a.status().entries.Q001.available,false);assert.ok((await a.task).ready);await a.allTask;assert.equal(a.status().entries.Q001.available,true);assert.ok(!JSON.stringify(a.status()).includes('secret'));assert.equal(typeof routes['/cinematics/Q001.mp4'],'function')}));

test('expanded route catalog imports configured quests and keeps unconfigured entries nonblocking',()=>fixture(async file=>{const routes={},app={get:(p,fn)=>{routes[p]=fn}},dataDir=path.dirname(path.dirname(file));const a=M.mountQuestCinematics(app,{dataDir,source:'',sources:{Q002:'https://dnznrvs05pmza.cloudfront.net/wan_3_0/fixture.mp4?signed=secret',Q072:source},fetcher:async()=>new Response(mockVideo()),logger:{log(){},warn(){}}});assert.equal(Object.keys(a.status().entries).length,72);assert.equal(a.status().entries.Q002.streamingFallback,true);assert.equal(a.status().entries.Q003.configured,false);assert.equal(typeof routes['/cinematics/Q072.mp4'],'function');const end=await a.allTask;assert.equal(end.ready,2);assert.equal(a.status().entries.Q002.available,true);assert.equal(a.status().entries.Q072.available,true);assert.equal(a.status().entries.Q002.duration,30);assert.ok(!JSON.stringify(a.status()).includes('secret'));assert.equal(await M.fileReady(path.join(dataDir,'cinematics','Q072.mp4')),true)}));

const remakeSource='https://dnznrvs05pmza.cloudfront.net/wan_3_0/new.mp4?token=secret';
test('23 revision-specific remakes do not resolve to obsolete stitched filenames',()=>{
 assert.equal(M.REMAKES.size,23);
 for(let i=1;i<=72;i++){const q='Q'+String(i).padStart(3,'0'),r=i>=2&&i<=24;
  assert.equal(M.REMAKES.has(q),r);assert.equal(M.mediaName(q),r?q+'-remake-1.mp4':q+'.mp4');
  assert.equal(!!M.sourceFor(q,source),!r);assert.ok(M.sourceFor(q,remakeSource));
 }
});
test('new Q002 imports instead of reusing old file; subsequent restart reuses only new revision',()=>fixture(async file=>{
 const dir=path.dirname(file),dataDir=path.dirname(dir),old=path.join(dir,'Q002.mp4'),fresh=path.join(dir,M.mediaName('Q002')),later=path.join(dir,'Q025.mp4');
 await fs.mkdir(dir,{recursive:true});const obsolete=mockVideo();obsolete.write('OLD',32);const replacement=mockVideo();replacement.write('NEW',32);
 await fs.writeFile(old,obsolete);await fs.writeFile(later,obsolete);
 const routes={},app={get:(p,fn)=>{routes[p]=fn}};let calls=0;
 const a=M.mountQuestCinematics(app,{dataDir,source:'',sources:{Q002:remakeSource},fetcher:async()=>{calls++;assert.equal(await M.fileReady(old),true);return new Response(replacement)},logger:{log(){},warn(){}}});
 assert.equal(a.status().entries.Q002.available,false);assert.equal(a.status().entries.Q002.revision,'single-generation-1');assert.equal(a.status().entries.Q002.src,'/cinematics/Q002-remake-1.mp4');
 assert.equal(routes['/cinematics/Q002.mp4'],routes['/cinematics/Q002-remake-1.mp4']);
 const done=await a.allTask;assert.equal(done.remakesReady,1);assert.equal(calls,1);assert.deepEqual(await fs.readFile(fresh),replacement);assert.equal(await M.fileReady(old),false);assert.deepEqual(await fs.readFile(later),obsolete);
 assert.equal(a.status().entries.Q025.available,true);
 const b=M.mountQuestCinematics(app,{dataDir,source:'',sources:{},fetcher:async()=>{throw Error('must not download')},logger:{log(){},warn(){}}});await b.allTask;assert.equal(b.status().entries.Q002.available,true);assert.equal(b.status().entries.Q002.streamingFallback,false);
}));
test('failed remake preserves old local file but never advertises it as the new movie',()=>fixture(async file=>{
 const dir=path.dirname(file),old=path.join(dir,'Q002.mp4');await fs.mkdir(dir,{recursive:true});await fs.writeFile(old,mockVideo());
 const a=M.mountQuestCinematics({get(){}},{dataDir:path.dirname(dir),source:'',sources:{Q002:remakeSource},fetcher:async()=>new Response('',{status:403}),logger:{log(){},warn(){}}});
 const done=await a.allTask;assert.equal(done.remakesReady,0);assert.equal(a.status().entries.Q002.available,false);assert.equal(await M.fileReady(old),true);assert.equal(await M.fileReady(path.join(dir,M.mediaName('Q002'))),false);
}));
