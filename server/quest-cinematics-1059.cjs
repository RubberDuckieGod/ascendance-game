'use strict';
// Publish only an explicit, operator-configured Q001 media file. Never accept
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
function mountQuestCinematics(app,{dataDir,source=process.env.ASC_Q001_INTRO_SOURCE||'',fetcher=fetch,logger=console}={}){
 const file=path.join(dataDir,'cinematics','Q001.mp4');
 let ready=false,configured=!!source,reason='CHECKING';
 const status=()=>({version:'1059-cinematics-1',entries:{Q001:{configured:configured||ready,available:ready,src:'/cinematics/Q001.mp4',duration:30}}});
 app.get('/api/quest-cinematics',(req,res)=>{res.set('Cache-Control','no-store');res.json(status())});
 app.get('/cinematics/Q001.mp4',(req,res)=>{
  if(!ready){res.set('Cache-Control','no-store');res.status(503).json({error:'Quest cinematic unavailable.'});return}
  res.type('video/mp4');res.sendFile(file,{acceptRanges:true,maxAge:'1h'},error=>{if(error&&!res.headersSent)res.status(error.statusCode||500).end()});
 });
 const task=importVideo(file,source,fetcher).then(out=>{
  ready=out.ready===true;reason=out.reason||'READY';
  if(ready)logger.log('[CINEMATIC] Q001 ready bytes='+out.bytes+' persistent='+String(out.existing));
  else if(configured)logger.warn('[CINEMATIC] Q001 unavailable: '+reason);
  return out;
 }).catch(()=>{reason='MEDIA_IMPORT_FAILED';if(configured)logger.warn('[CINEMATIC] Q001 unavailable: '+reason);return {ready:false,reason}});
 return {status,task};
}
module.exports={validSource,mp4Header,importVideo,fileReady,mountQuestCinematics};
