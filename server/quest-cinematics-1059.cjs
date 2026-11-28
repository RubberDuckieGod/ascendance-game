'use strict';
// Publish only explicit, operator-configured quest media. Never accept
// a source URL from a web request or expose its temporary signature.
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path');
const LIMIT=96*1024*1024,MIN=1024,HOST='dnznrvs05pmza.cloudfront.net';
function validSource(raw){try{const u=new URL(raw);return u.protocol==='https:'&&u.hostname===HOST&&!u.username&&!u.password?u.href:null}catch(_){return null}}
function mp4Header(bytes){return Buffer.isBuffer(bytes)&&bytes.length>=12&&bytes.subarray(4,8).toString('ascii')==='ftyp'}
async function fileReady(file){
 let h;try{const stat=await fsp.stat(file);if(!stat.isFile()||stat.size<MIN||stat.size>LIMIT)return false;h=await fsp.open(file,'r');const bytes=Buffer.alloc(16);await h.read(bytes,0,bytes.length,0);return mp4Header(bytes)}catch(_){return false}finally{if(h)await h.close().catch(()=>{})}
}
async function importVideo(file,source,fetcher=fetch){
 if(await fileReady(file))return {ready:true,existing:true,bytes:(await fsp.stat(file)).size};
 const url=validSource(source);if(!url)return {ready:false,reason:'SOURCE_NOT_CONFIGURED'};
 await fsp.mkdir(path.dirname(file),{recursive:true});const temp=file+'.'+process.pid+'.part';
 let handle;
 try{
  const r=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(90000)});
  if(!r.ok||!r.body)throw Error('DOWNLOAD_'+r.status);
  const declared=Number(r.headers.get('content-length')||0);
  if(declared>LIMIT)throw Error('VIDEO_TOO_LARGE');
  handle=await fsp.open(temp,'w',0o644);let count=0;
  for await(const chunk of r.body){
   const b=Buffer.from(chunk);count+=b.length;if(count>LIMIT)throw Error('VIDEO_TOO_LARGE');
   await handle.writeFile(b);
  }
  await handle.close();handle=null;
  if(declared>0&&declared!==count||!await fileReady(temp))throw Error('INVALID_MP4');
  await fsp.rename(temp,file);
  return {ready:true,existing:false,bytes:count};
 }catch(e){
  if(handle)await handle.close().catch(()=>{});
  await fsp.unlink(temp).catch(()=>{});
  // Do not return a network exception containing the source URL.
  const reason=/^(DOWNLOAD_\d+|VIDEO_TOO_LARGE|INVALID_MP4)$/.test(String(e?.message))?e.message:'MEDIA_IMPORT_FAILED';
  return {ready:false,reason};
 }
}

const {execFile}=require('node:child_process'),{promisify}=require('node:util'),{Readable}=require('node:stream'),{pipeline}=require('node:stream/promises');
const run=promisify(execFile),MAX_COMPACT=9*1024*1024,RESERVE=160*1024*1024;
const QUESTS=Array.from({length:72},(_,i)=>'Q'+String(i+1).padStart(3,'0'));
const duration=q=>q==='Q002'||q==='Q003'?25:30;
async function freeBytes(dir){const s=await fsp.statfs(dir);return Number(s.bavail)*Number(s.bsize)}
function encoder(){try{return require.resolve('@ffmpeg-installer/linux-x64/ffmpeg')}catch(_){return 'ffmpeg'}}
async function importCompactVideo(file,source,fetcher=fetch,{encode=run}={}){
 if(await fileReady(file))return {ready:true,existing:true,bytes:(await fsp.stat(file)).size};
 if(!validSource(source))return {ready:false,reason:'SOURCE_NOT_CONFIGURED'};
 const dir=path.dirname(file),raw=file+'.source.mp4',out=file+'.encode.mp4';
 try{
  await fsp.mkdir(dir,{recursive:true});
  // Reserve space for campaign saves, both temporary files, and the final copy.
  if(await freeBytes(dir)<RESERVE+LIMIT+MAX_COMPACT)return {ready:false,reason:'DISK_RESERVE'};
  await fsp.unlink(raw).catch(()=>{});await fsp.unlink(out).catch(()=>{});
  const original=await importVideo(raw,source,fetcher);
  if(!original.ready)return original;
  if(original.bytes<=MAX_COMPACT){await fsp.rename(raw,file);return {ready:true,existing:false,bytes:original.bytes}}
  const cmd=encoder(),args=['-nostdin','-hide_banner','-loglevel','error','-y','-threads','1','-i',raw,'-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','veryfast','-threads','1','-crf','23','-maxrate','1800k','-bufsize','3600k','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',out];
  // One low-priority encoder at a time; never perform encoding on the request path.
  await encode(process.platform==='linux'?'nice':cmd,process.platform==='linux'?['-n','10',cmd,...args]:args,{timeout:12*60*1000,maxBuffer:1024*1024});
  if(!await fileReady(out)||(await fsp.stat(out)).size>MAX_COMPACT)return {ready:false,reason:'COMPACT_MEDIA_INVALID'};
  const bytes=(await fsp.stat(out)).size;await fsp.rename(out,file);
  return {ready:true,existing:false,bytes};
 }catch(_){return {ready:false,reason:'COMPACT_IMPORT_FAILED'}}
 finally{await fsp.unlink(raw).catch(()=>{});await fsp.unlink(out).catch(()=>{})}
}
async function proxyVideo(req,res,source,fetcher=fetch){
 const url=validSource(source);
 const unavailable=()=>{if(!res.headersSent){res.set('Cache-Control','no-store');res.status(503).json({error:'Quest cinematic unavailable.'})}else res.destroy()};
 if(!url){unavailable();return}
 const headers={},range=req.headers?.range;
 if(range){if(!/^bytes=(?:\d+-\d*|-\d+)$/.test(range)){res.status(416).end();return}headers.Range=range}
 const abort=new AbortController(),close=()=>abort.abort();
 res.once('close',close);
 try{
  const upstream=await fetcher(url,{redirect:'error',headers,signal:AbortSignal.any([abort.signal,AbortSignal.timeout(120000)])});
  if(upstream.status===416){const cr=upstream.headers.get('content-range');if(cr)res.set('Content-Range',cr);res.status(416).end();return}
  if(![200,206].includes(upstream.status)||!upstream.body){unavailable();return}
  const type=upstream.headers.get('content-type')||'';
  if(!/^(video\/mp4|application\/octet-stream)(;|$)/i.test(type)){await upstream.body.cancel().catch(()=>{});unavailable();return}
  const size=Number(upstream.headers.get('content-length')||0);if(size>LIMIT){await upstream.body.cancel().catch(()=>{});unavailable();return}
  res.status(upstream.status);res.set('Content-Type','video/mp4');res.set('Cache-Control','no-store');
  for(const name of ['content-length','content-range','accept-ranges']){const value=upstream.headers.get(name);if(value)res.set(name,value)}
  await pipeline(Readable.fromWeb(upstream.body),res);
 }catch(_){if(!abort.signal.aborted)unavailable()}
 finally{res.removeListener('close',close)}
}
function mountQuestCinematics(app,{dataDir,source=process.env.ASC_Q001_INTRO_SOURCE||'',sources=null,fetcher=fetch,logger=console,compactImporter=importCompactVideo}={}){
 const entries={},dir=path.join(dataDir,'cinematics');
 for(const q of QUESTS){
  const configuredSource=q==='Q001'?source:(sources?sources[q]:process.env['ASC_'+q+'_INTRO_SOURCE']);
  const src=validSource(configuredSource)||'';
  entries[q]={file:path.join(dir,q+'.mp4'),source:src,ready:false,reason:'CHECKING'};
 }
 const status=()=>({version:'1059-cinematics-2',entries:Object.fromEntries(QUESTS.map(q=>{
  const e=entries[q];return [q,{configured:!!e.source||e.ready,available:e.ready,streamingFallback:!!e.source&&!e.ready,src:'/cinematics/'+q+'.mp4',duration:duration(q)}]
 }))});
 app.get('/api/quest-cinematics',(req,res)=>{res.set('Cache-Control','no-store');res.json(status())});
 for(const q of QUESTS)app.get('/cinematics/'+q+'.mp4',(req,res)=>{
  const e=entries[q];
  if(!e.ready){void proxyVideo(req,res,e.source,fetcher);return}
  res.type('video/mp4');res.sendFile(e.file,{acceptRanges:true,maxAge:'1h'},error=>{if(error&&!res.headersSent)res.status(error.statusCode||500).end()});
 });
 async function publish(q){
  const e=entries[q];
  try{
   const result=await(q==='Q001'?importVideo(e.file,e.source,fetcher):compactImporter(e.file,e.source,fetcher));
   e.ready=result.ready===true;e.reason=result.reason||'READY';
   if(e.ready)logger.log('[CINEMATIC] '+q+' ready bytes='+result.bytes+' persistent='+String(result.existing));
   else if(e.source)logger.warn('[CINEMATIC] '+q+' unavailable: '+e.reason);
   return result;
  }catch(_){e.reason='MEDIA_IMPORT_FAILED';if(e.source)logger.warn('[CINEMATIC] '+q+' unavailable: '+e.reason);return {ready:false,reason:e.reason}}
 }
 const task=publish('Q001');
 const allTask=task.then(async()=>{for(const q of QUESTS.slice(1))await publish(q);const ready=QUESTS.filter(q=>entries[q].ready).length;logger.log('[CINEMATIC] persistent imports '+ready+'/'+QUESTS.length);return {ready,total:QUESTS.length}});
 return {status,task,allTask};
}
module.exports={validSource,mp4Header,importVideo,fileReady,importCompactVideo,proxyVideo,mountQuestCinematics,QUESTS};
