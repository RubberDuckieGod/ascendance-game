'use strict';
// Fixed, operator-configured audio sources. Never proxy user-provided URLs.
const fs=require('node:fs/promises'),path=require('node:path'),{Readable}=require('node:stream'),{pipeline}=require('node:stream/promises');
const HOST='dnznrvs05pmza.cloudfront.net',LIMIT=20*1024*1024,RESERVE=160*1024*1024;
const MUSIC=['menu','exploration','combat','downtime'],AMBIENCE=['stonebrook','crownlands','ironspine','verdant','stormcoast','sunscar','underground'];
const keys=[...MUSIC,...AMBIENCE],kind=k=>MUSIC.includes(k)?'music':'ambience',route=k=>'/audio/score-v1060/'+kind(k)+'/'+k+'.mp3';
function sourceFor(k,value){if(!keys.includes(k))return '';try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!==HOST||u.username||u.password||!u.pathname.endsWith('.mp3')||!u.pathname.startsWith(MUSIC.includes(k)?'/lyria3-pro/':'/audio_sfx/'))return '';return u.href}catch(_){return ''}}
function mp3Header(bytes){return bytes.length>=3&&(bytes.subarray(0,3).toString()==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224))}
async function fileReady(file){let h;try{const s=await fs.stat(file);if(!s.isFile()||s.size<512||s.size>LIMIT)return false;h=await fs.open(file,'r');const b=Buffer.alloc(10);await h.read(b,0,b.length,0);return mp3Header(b)}catch(_){return false}finally{if(h)await h.close().catch(()=>{})}}
async function importTrack(file,source,fetcher=fetch){
 if(await fileReady(file))return {ready:true,existing:true,bytes:(await fs.stat(file)).size};
 if(!source)return {ready:false,reason:'SOURCE_NOT_CONFIGURED'};const dir=path.dirname(file),tmp=file+'.'+process.pid+'.part';let h;
 try{await fs.mkdir(dir,{recursive:true});const st=await fs.statfs(dir);if(Number(st.bavail)*Number(st.bsize)<RESERVE+LIMIT)throw Error('DISK_RESERVE');
  const r=await fetcher(source,{redirect:'error',signal:AbortSignal.timeout(90000)});if(!r.ok||!r.body)throw Error('HTTP_'+r.status);const declared=Number(r.headers.get('content-length')||0);if(declared>LIMIT)throw Error('AUDIO_TOO_LARGE');
  h=await fs.open(tmp,'w',0o644);let bytes=0;for await(const chunk of r.body){const b=Buffer.from(chunk);bytes+=b.length;if(bytes>LIMIT)throw Error('AUDIO_TOO_LARGE');await h.writeFile(b)}await h.close();h=null;
  if(declared>0&&bytes!==declared||!await fileReady(tmp))throw Error('INVALID_AUDIO');await fs.rename(tmp,file);return {ready:true,existing:false,bytes}
 }catch(e){if(h)await h.close().catch(()=>{});await fs.unlink(tmp).catch(()=>{});return {ready:false,reason:/^(DISK_RESERVE|HTTP_\d+|AUDIO_TOO_LARGE|INVALID_AUDIO)$/.test(String(e?.message))?e.message:'AUDIO_IMPORT_FAILED'}}
}
async function proxy(req,res,source,fetcher){
 if(!source){res.set('Cache-Control','no-store');res.status(503).json({error:'Soundtrack not ready'});return}
 const controller=new AbortController(),close=()=>controller.abort();res.once('close',close);
 try{const headers={},range=req.headers?.range;if(range){if(!/^bytes=(?:\d+-\d*|-\d+)$/.test(range)){res.status(416).end();return}headers.Range=range}
  const r=await fetcher(source,{redirect:'error',headers,signal:AbortSignal.any([controller.signal,AbortSignal.timeout(90000)])});const type=r.headers.get('content-type')||'',size=Number(r.headers.get('content-length')||0);
  if(![200,206].includes(r.status)||!r.body||size>LIMIT||!/^(audio\/(?:mpeg|mp3|x-mpeg)|application\/octet-stream)(;|$)/i.test(type)){res.status(503).end();return}
  res.status(r.status);res.type('audio/mpeg');res.set('Cache-Control','no-store');for(const name of ['content-length','content-range','accept-ranges']){const v=r.headers.get(name);if(v)res.set(name,v)}await pipeline(Readable.fromWeb(r.body),res)
 }catch(_){if(!controller.signal.aborted){if(!res.headersSent)res.status(503).end();else res.destroy()}}finally{res.removeListener('close',close)}
}
function mountAudioScenes(app,{dataDir,sources=null,fetcher=fetch,logger=console}={}){
 const dir=path.join(dataDir,'score-v1060'),entries=Object.fromEntries(keys.map(k=>[k,{file:path.join(dir,kind(k),k+'.mp3'),source:sourceFor(k,sources?sources[k]:process.env['ASC_AUDIO_'+k.toUpperCase()+'_SOURCE']),ready:false}]));
 const status=()=>({version:'1060-audio-1',entries:Object.fromEntries(keys.map(k=>[k,{kind:kind(k),src:route(k),configured:!!entries[k].source||entries[k].ready,available:entries[k].ready}]))});
 app.get('/api/audio-scene-v1060',(_req,res)=>{res.set('Cache-Control','no-store');res.json(status())});
 for(const k of keys)app.get(route(k),(req,res)=>{const e=entries[k];if(!e.ready){void proxy(req,res,e.source,fetcher);return}res.type('audio/mpeg');res.sendFile(e.file,{acceptRanges:true,maxAge:'1d'},error=>{if(error&&!res.headersSent)res.status(error.statusCode||500).end()})});
 const task=(async()=>{for(const k of keys){const e=entries[k];try{const r=await importTrack(e.file,e.source,fetcher);e.ready=r.ready===true;if(e.ready)logger.log('[SCORE] '+k+' ready bytes='+r.bytes+' persistent='+String(r.existing));else if(e.source)logger.warn('[SCORE] '+k+' unavailable: '+r.reason)}catch(_){if(e.source)logger.warn('[SCORE] '+k+' unavailable: AUDIO_IMPORT_FAILED')}}const ready=keys.filter(k=>entries[k].ready).length;logger.log('[SCORE] persistent imports '+ready+'/'+keys.length);return {ready,total:keys.length}})();
 return {status,task}
}
module.exports={MUSIC,AMBIENCE,keys,route,sourceFor,mp3Header,fileReady,importTrack,mountAudioScenes};
