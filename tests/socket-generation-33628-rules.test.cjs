'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
const connect=html.slice(html.indexOf('function mpConnect(){'),html.indexOf('let mpWatchTimer='));
const disconnect=html.slice(html.indexOf('function mpDisconnect(){'),html.indexOf("const ASC_STATE_VERSION="));
const reliability=html.match(/<script id="multiplayerReliability32722">([\s\S]*?)<\/script>/)[1];
function fixture(openOnly=false){
 const timers=new Map(),sockets=[],controls=new Map(),messages=[],statuses=[];let sequence=0,finishes=0;
 const defaults={'#mpRoom':{value:'SOCKET-TEST'},'#mpRole':{value:'Rowan'},'#mpMode':{value:'remote'}};
 const ctx={console,location:{protocol:'http:',host:'localhost'},mpSocket:null,mpChannel:null,mpRoom:'',mpRole:'Rowan',mpMode:'remote',mpJoinReady:false,mpSendTimer:null,mpLastSent:'',mpRoomRevision:0,mpFreshNewGame32529:false,
  $:key=>{if(!controls.has(key))controls.set(key,{disabled:false,...defaults[key]});return controls.get(key)},
  alert:message=>{throw Error(message)},render:()=>{},mpStopRestoreRetry:()=>{},mpStopWatcher:()=>{},mpSetStatus:message=>statuses.push(message),heroDisplayName:h=>h,
  setTimeout:(fn,delay=0)=>{const id=++sequence;timers.set(id,{fn,delay});return id},clearTimeout:id=>timers.delete(id),
  sessionStorage:{setItem:()=>{},removeItem:()=>{}},mpHandleMessage:message=>messages.push(message),
  WebSocket:class{constructor(){this.readyState=0;this.closed=0;sockets.push(this)}close(){this.closed++;this.readyState=3}}
 };
 ctx.window=ctx;ctx.mpConnected=()=>!!ctx.mpChannel||!!ctx.mpSocket&&(!openOnly||ctx.mpSocket.readyState===1);ctx.mpFinishConnect=()=>{finishes++;ctx.mpJoinReady=true};
 vm.runInNewContext(connect+'\n'+disconnect+'\n'+reliability,ctx);
 function wire(){for(const [id,timer]of [...timers])if(timer.delay===0){timers.delete(id);timer.fn()}}
 function start(){ctx.mpConnect();wire();const socket=ctx.mpSocket;socket.readyState=1;socket.onopen();return socket}
 return {ctx,timers,sockets,messages,statuses,wire,start,finishes:()=>finishes};
}
for(const openOnly of [false,true])test('late old socket events cannot replace the new connection; openOnly='+openOnly,()=>{
 const f=fixture(openOnly),old=f.start(),current=f.start(),before=f.finishes();assert.equal(old.closed,1);
 old.onclose({});old.onopen();old.onerror();old.onmessage({data:JSON.stringify({type:'STALE'})});
 assert.equal(f.ctx.mpSocket,current);assert.equal(current.readyState,1);assert.equal(f.finishes(),before);assert.equal(f.ctx.mpJoinReady,true);assert.equal(f.messages.length,0);assert.equal(f.timers.size,0);
 current.onmessage({data:JSON.stringify({type:'CURRENT'})});assert.deepEqual(f.messages.map(m=>m.type),['CURRENT']);
});
test('replacing a still-connecting socket closes it and ignores its later open/close events',()=>{
 const f=fixture(true);f.ctx.mpConnect();f.wire();const old=f.ctx.mpSocket;assert.equal(old.readyState,0);
 const current=f.start();assert.equal(old.closed,1);const before=f.finishes();old.onopen();old.onclose({});
 assert.equal(f.ctx.mpSocket,current);assert.equal(f.finishes(),before);assert.equal(f.timers.size,0);
});
test('unexpected current close schedules one retry; manual reconnect cancels it; intentional close never retries',()=>{
 const f=fixture(),first=f.start();first.readyState=3;first.onclose({});assert.equal(f.ctx.mpSocket,null);assert.equal(f.timers.size,1);
 const current=f.start();assert.equal(f.timers.size,0);f.ctx.mpDisconnect();current.onclose({});assert.equal(f.ctx.mpSocket,null);assert.equal(f.timers.size,0);
});
test('an automatic retry remains able to reconnect again after its own unexpected close',()=>{
 const f=fixture(),first=f.start();first.readyState=3;first.onclose({});const [id,timer]=[...f.timers][0];f.timers.delete(id);timer.fn();f.wire();const current=f.ctx.mpSocket;assert.notEqual(current,first);current.readyState=1;current.onopen();current.readyState=3;current.onclose({});assert.equal(f.ctx.mpSocket,null);assert.equal(f.timers.size,1);
});
