'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),net=require('node:net'),{spawn}=require('node:child_process'),{once}=require('node:events');
const root=path.resolve(__dirname,'..'),publicDir=path.join(root,'public');
test('browser assets have one canonical home and documentation links resolve',()=>{
 for(const name of fs.readdirSync(publicDir).filter(n=>/\.(?:js|css|html|webmanifest)$/.test(n)))assert.equal(fs.existsSync(path.join(root,name)),false,'Unexpected root duplicate: '+name);
 assert.equal(fs.existsSync(path.join(root,'assets')),false);assert.ok(fs.existsSync(path.join(publicDir,'assets','aldric.jpg')));
 const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
 for(const match of readme.matchAll(/\]\(([^)]+)\)/g))assert.ok(fs.existsSync(path.join(root,match[1])),'README target: '+match[1]);
 assert.ok(fs.existsSync(path.join(root,'docs/reference/Ascendance_v10.52_Location_Ongoing_Effect_Clarification.xlsx')));
});
test('real server serves unchanged browser scripts, service workers and relocated artwork',{timeout:20000},async()=>{
 const port=await new Promise((resolve,reject)=>{const socket=net.createServer();socket.on('error',reject);socket.listen(0,'127.0.0.1',()=>{const value=socket.address().port;socket.close(()=>resolve(value))})});
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-layout-')),child=spawn(process.execPath,['server.js'],{cwd:root,env:{...process.env,PORT:String(port),ASCENDANCE_DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
 let logs='';for(const stream of [child.stdout,child.stderr])stream.on('data',data=>logs=(logs+data).slice(-10000));
 try{
  let ready=false;for(let i=0;i<150;i++){if(child.exitCode!==null)throw Error(logs);try{ready=(await fetch('http://127.0.0.1:'+port+'/health')).ok;if(ready)break}catch(_){}await new Promise(resolve=>setTimeout(resolve,40))}
  assert.ok(ready,logs||'Server startup timed out');
  const files=['index.html','manifest.webmanifest','assets/aldric.jpg','assets/enemy-e001.svg',...fs.readdirSync(publicDir).filter(n=>/\.(?:js|css)$/.test(n))];
  for(let i=0;i<files.length;i+=8)await Promise.all(files.slice(i,i+8).map(async file=>{
   const response=await fetch('http://127.0.0.1:'+port+'/'+file);assert.equal(response.status,200,file);
   assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync(path.join(publicDir,file)),file);
  }));
  const home=await fetch('http://127.0.0.1:'+port+'/');assert.equal(home.status,200);assert.equal(await home.text(),fs.readFileSync(path.join(publicDir,'index.html'),'utf8'));
 }finally{
  if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});
