'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path');
const R=require('../public/audio-33617.js'),S=require('../server/audio-scenes-v1060.cjs');
test('mixer migrates existing settings without overwriting preferences; all five sliders clamp',()=>{
 const s=R.normalize({enabled:false,master:.42,sfx:.9,ambience:2,music:-1,cinematic:1.5,uiClicks:true,ambienceMode:'verdant',musicMode:'invalid'});
 assert.deepEqual([s.enabled,s.master,s.sfx,s.ambience,s.music,s.cinematic,s.uiClicks,s.ambienceMode,s.musicMode],[false,.42,.9,1,0,1,true,'verdant','auto']);
 assert.equal(R.normalize({master:'bad'}).master,R.DEFAULTS.master);
});
test('menu, exploration, combat and downtime select distinct scores; auto menu has no ambience',()=>{
 const s=R.normalize();assert.deepEqual(R.sceneFor(s,{menu:true,hostile:true,downtime:true}),{music:'menu',ambience:null});
 assert.deepEqual(R.sceneFor(s,{game:{campaign:{currentQuest:'Q032'}}}),{music:'exploration',ambience:'ironspine'});
 assert.deepEqual(R.sceneFor(s,{hostile:true,tile:{id:'L181'}}),{music:'combat',ambience:'stormcoast'});
 assert.deepEqual(R.sceneFor(s,{downtime:true,hostile:true}),{music:'downtime',ambience:null});
});
test('all 72 quests fall into the correct regional fallback and underground overrides region',()=>{
 const names=['stonebrook','crownlands','ironspine','verdant','stormcoast','sunscar'];
 for(let n=1;n<=72;n++)assert.equal(R.regionFor(null,{campaign:{currentQuest:'Q'+String(n).padStart(3,'0')}}),names[Math.floor((n-1)/12)]);
 assert.equal(R.regionFor({id:'L083',name:'Ancient crypt'},{}),'underground');
});
test('mute, channel toggles, manual previews and cinematic ducking are independent',()=>{
 const s=R.normalize({musicMode:'downtime',ambienceMode:'sunscar',master:.6,cinematic:.8});
 assert.deepEqual(R.sceneFor(s,{menu:true}),{music:'downtime',ambience:'sunscar'});
 assert.deepEqual(R.sceneFor({...s,musicEnabled:false},{menu:true}),{music:null,ambience:'sunscar'});
 assert.deepEqual(R.sceneFor({...s,enabled:false},{}),{music:null,ambience:null});
 const l=R.levels(s,true);assert.deepEqual(l,{master:.6,music:0,ambience:0,sfx:0,cinematic:.8});assert.equal(R.levels({...s,enabled:false}).master,0);
});
function buffer(){const d=Float32Array.from({length:100},(_,i)=>i/100);return {length:100,sampleRate:10,duration:10,numberOfChannels:1,getChannelData:()=>d}}
test('loop seam blends into the opening without changing the recorded length',()=>{const b=buffer(),d=b.getChannelData(0),p=R.softenLoop(b,1);assert.equal(p,1);assert.ok(Math.abs(d[99]-.09)<1e-5);assert.ok(Math.abs(d[10]-.1)<1e-5);assert.equal(b.length,100)});
function fakeContext(){
 const nodes=[];const c={state:'running',currentTime:0,createBufferSource(){const n={connect(){},disconnect(){},start(){n.started=true},stop(){n.stopped=true}};nodes.push(n);return n},createGain(){return {connect(){},disconnect(){},gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},cancelScheduledValues(){}}}}};return {c,nodes}
}
test('same scene repeated or concurrent requests do not reload or restart music',async()=>{
 const {c,nodes}=fakeContext();let count=0,release;const P=R.createLayer({context:()=>c,bus:()=>({}),load:()=>{count++;return new Promise(resolve=>release=()=>resolve(buffer()))}});
 const a=P.set('menu'),b=P.set('menu');assert.equal(a,b);assert.equal(count,1);release();assert.equal(await a,true);await P.set('menu');await P.set('menu');assert.equal(count,1);assert.equal(nodes.length,1);assert.equal(P.snapshot().current,'menu');
});
test('switches crossfade; stale pending download never becomes the active scene',async()=>{
 const {c,nodes}=fakeContext(),wait={};const P=R.createLayer({context:()=>c,bus:()=>({}),load:(k,signal)=>new Promise(resolve=>wait[k]={resolve,signal})});
 const a=P.set('menu');wait.menu.resolve(buffer());await a;const b=P.set('exploration'),d=P.set('combat');assert.equal(wait.exploration.signal.aborted,true);wait.exploration.resolve(buffer());assert.equal(await b,false);wait.combat.resolve(buffer());assert.equal(await d,true);assert.equal(P.snapshot().current,'combat');assert.equal(nodes.length,2);assert.equal(nodes[0].stopped,true);await P.stop();assert.equal(P.snapshot().current,null);assert.equal(nodes[1].stopped,true);
});
test('failed assets retry only after backoff; old layer is preserved',async()=>{
 const {c}=fakeContext();let count=0,t=0;const P=R.createLayer({context:()=>c,bus:()=>({}),now:()=>t,load:async k=>{count++;if(k==='combat')throw Error('offline');return buffer()}});
 await P.set('menu');assert.equal(await P.set('combat'),false);assert.equal(await P.set('combat'),false);assert.equal(count,2);assert.equal(P.snapshot().current,'menu');t=15001;await P.set('combat');assert.equal(count,3)
});
const good=Buffer.alloc(4096);good.write('ID3');
const music='https://dnznrvs05pmza.cloudfront.net/lyria3-pro/fixture.mp3?secret=1',amb='https://dnznrvs05pmza.cloudfront.net/audio_sfx/fixture.mp3?secret=2';
test('server source allowlist separates music/ambience and refuses arbitrary URLs',()=>{assert.ok(S.sourceFor('menu',music));assert.ok(S.sourceFor('stonebrook',amb));assert.equal(S.sourceFor('menu',amb),'');assert.equal(S.sourceFor('stonebrook',music),'');assert.equal(S.sourceFor('menu','https://evil.test/a.mp3'),'');assert.equal(S.sourceFor('unknown',music),'');assert.equal(S.mp3Header(good),true);assert.equal(S.mp3Header(Buffer.from('<html>')),false)});
async function fixture(fn){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'asc-score-'));try{return await fn(dir)}finally{await fs.rm(dir,{recursive:true,force:true})}}
test('11 routes are allowlisted, durable imports survive restart without signed URL, and metadata never exposes credentials',()=>fixture(async dir=>{
 const routes={},app={get:(p,fn)=>routes[p]=fn},logger={log(){},warn(){}};let calls=0;
 const m=S.mountAudioScenes(app,{dataDir:dir,sources:{menu:music,stonebrook:amb},fetcher:async()=>{calls++;return new Response(good)},logger});
 assert.equal(Object.keys(m.status().entries).length,11);assert.equal(m.status().entries.menu.available,false);assert.equal(typeof routes[S.route('menu')],'function');assert.equal((await m.task).ready,2);assert.equal(m.status().entries.menu.available,true);assert.equal(calls,2);assert.ok(!JSON.stringify(m.status()).includes('secret'));
 const restarted=S.mountAudioScenes(app,{dataDir:dir,sources:{},fetcher:async()=>{throw Error('do not download')},logger});assert.equal((await restarted.task).ready,2);
}));
test('invalid/truncated audio never persists',()=>fixture(async dir=>{const f=path.join(dir,'broken.mp3');assert.equal((await S.importTrack(f,music,async()=>new Response(good,{headers:{'content-length':'5000'}}))).ready,false);assert.equal(await S.fileReady(f),false);assert.equal((await S.importTrack(f,music,async()=>new Response('not mp3'))).ready,false);assert.equal(await S.fileReady(f),false);assert.deepEqual(await fs.readdir(dir),[])}));
