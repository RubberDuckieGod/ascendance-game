'use strict';
// Isolated pilot renderer. No production state, files, or game routes are accessed.
const fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process'),{Readable,Transform}=require('node:stream'),{pipeline}=require('node:stream/promises');
const OUT=path.resolve('pilot-output'),MOVIE=path.join(OUT,'Q002-v2.mp4'),REPORT=path.join(OUT,'report.json');
const SCRIPT="Stonebrook's supplies are running dangerously low. Two merchant wagons carrying food, medicine and weapons have disappeared along the frontier road. Hidden among the trees, goblin scouts prepare to seize their cargo. With the village depending on their arrival, you must reach the caravan before the enemy strikes.";
const HOSTS=new Set(['dnznrvs05pmza.cloudfront.net','d2jqrm6oza8nb6.cloudfront.net']);
function source(value){const u=new URL(value);if(u.protocol!=='https:'||!HOSTS.has(u.hostname)||u.username||u.password)throw Error('Invalid source configuration');return u.href}
async function download(key,dest){
 const u=source(process.env[key]);let count=0;
 const r=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(120000)});
 if(!r.ok||!r.body)throw Error(key+' HTTP '+r.status);
 await pipeline(Readable.fromWeb(r.body),new Transform({transform(chunk,_,cb){count+=chunk.length;if(count>96*1024*1024)cb(Error('Media exceeds size limit'));else cb(null,chunk)}}),fs.createWriteStream(dest));
 if(count<1024)throw Error(key+' empty media');
 return count
}
function binary(){
 const candidates=[];try{candidates.push(require('ffmpeg-static'))}catch(_){}candidates.push('ffmpeg');try{candidates.push(require.resolve('@ffmpeg-installer/linux-x64/ffmpeg'))}catch(_){}
 for(const c of candidates.filter(Boolean)){const p=spawnSync(c,['-hide_banner','-filters'],{encoding:'utf8'});if(p.status===0&&/\bxfade\b/.test(p.stdout||''))return c}
 throw Error('A video encoder with dissolve support is required')
}
function duration(cmd,file){const r=spawnSync(cmd,['-hide_banner','-i',file],{encoding:'utf8'});const m=String(r.stderr).match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);if(!m)throw Error('Media duration unavailable');return +m[1]*3600+(+m[2])*60+(+m[3])}
async function build(){
 const temp=await fsp.mkdtemp(path.join(os.tmpdir(),'asc-q002-'));
 try{
  await fsp.mkdir(OUT,{recursive:true});
  const cmd=binary(),keys=['ASC_PILOT_SCENE_VILLAGE','ASC_PILOT_SCENE_CARAVAN','ASC_PILOT_SCENE_SCOUTS','ASC_PILOT_NARRATION'],files=keys.map((_,i)=>path.join(temp,i+(i===3?'.mp3':'.mp4')));
  for(let i=0;i<keys.length;i++){const bytes=await download(keys[i],files[i]);console.log('[PILOT] source '+(i+1)+' ready bytes='+bytes)}
  const lengths=files.slice(0,3).map(f=>duration(cmd,f)),voice=duration(cmd,files[3]);
  const d=lengths.map((v,i)=>Math.min(v,[9,8,8][i])),dissolve=.45,total=+(d.reduce((a,b)=>a+b,0)-2*dissolve).toFixed(3),offset1=+(d[0]-dissolve).toFixed(3),offset2=+(d[0]+d[1]-2*dissolve).toFixed(3);
  if(d.some(x=>x<6)||total<22)throw Error('Unexpected source durations');
  const rate=Math.max(1,voice/(total-.85));
  if(rate>1.2)throw Error('Narration too long for natural playback; no words were trimmed');
  const ambient=path.resolve('public/audio/ambience/stonebrook.ogg'),hasAmbient=fs.existsSync(ambient);
  const args=['-hide_banner','-loglevel','error','-y','-filter_complex_threads','1'];for(const f of files)args.push('-threads','1','-i',f);
  if(hasAmbient)args.push('-stream_loop','-1','-i',ambient);
  const filters=d.map((v,i)=>'['+i+':v]fps=24,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p,trim=duration='+v+',settb=AVTB,setpts=PTS-STARTPTS[v'+i+']');
  filters.push('[v0][v1]xfade=transition=fade:duration='+dissolve+':offset='+offset1+'[x1]');
  filters.push('[x1][v2]xfade=transition=fade:duration='+dissolve+':offset='+offset2+',fade=t=in:st=0:d=0.22,fade=t=out:st='+(total-.45)+':d=0.45,format=yuv420p[v]');
  filters.push('[3:a]aformat=sample_rates=48000:channel_layouts=stereo,atempo='+rate.toFixed(5)+',loudnorm=I=-16:TP=-2:LRA=9,aresample=48000,adelay=300|300,apad,atrim=duration='+total+'[voice]');
  if(hasAmbient){filters.push('[4:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=duration='+total+',volume=0.16,afade=t=in:d=0.5,afade=t=out:st='+(total-.7)+':d=0.7[amb]');filters.push('[voice][amb]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]')}
  else filters.push('[voice]anull[a]');
  args.push('-filter_complex',filters.join(';'),'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-threads','1','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-movflags','+faststart','-t',String(total),MOVIE);
  const r=spawnSync(cmd,args,{encoding:'utf8',timeout:240000,maxBuffer:1024*1024});
  if(r.status!==0)throw Error('Encoding failed: '+String(r.stderr||r.error?.message||'').slice(0,2000));
  const actual=duration(cmd,MOVIE);if(Math.abs(actual-total)>.35)throw Error('Unexpected final duration');
  const probe=spawnSync(cmd,['-hide_banner','-i',MOVIE],{encoding:'utf8'}).stderr;
  if(!/Video: h264/.test(probe)||!/Audio: aac/.test(probe))throw Error('Missing expected video/audio');
  const report={quest:'Q002',title:'Rescue the Merchant Caravan',duration:actual,sourceDurations:d,originalAudioUsed:false,narrationDuration:voice,narrationSpeed:rate,narrationTrackCount:1,transition:'0.45-second dissolves',ambient:hasAmbient?'Stonebrook ambience':'none',resolution:'1280x720',bytes:(await fsp.stat(MOVIE)).size,script:SCRIPT};
  await fsp.writeFile(REPORT,JSON.stringify(report,null,2));console.log('[PILOT] VERIFIED '+JSON.stringify(report))
 }finally{await fsp.rm(temp,{recursive:true,force:true})}
}
function serve(){
 const express=require('express'),app=express();const report=JSON.parse(fs.readFileSync(REPORT,'utf8'));
 app.get('/health',(_q,r)=>r.json({ready:true}));
 app.get('/status',(_q,r)=>r.json(report));
 app.get('/Q002-v2.mp4',(_q,r)=>r.type('video/mp4').sendFile(MOVIE,{acceptRanges:true,maxAge:'1h'}));
 app.get('/',(_q,r)=>r.type('html').send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ascendance | Q002 cinematic review</title><style>body{margin:0;padding:24px;background:#131615;color:#eee4d5;font:16px system-ui}main{max-width:860px;margin:auto}h1{font-family:Georgia;color:#dabe87;font-size:clamp(26px,5vw,44px);margin:.4em 0}video{width:100%;border:1px solid #7d6a46;border-radius:8px;background:#000}small{color:#bdab90}p{line-height:1.6}</style><main><small>ASCENDANCE · PRIVATE REVIEW COPY · NOT THE LIVE GAME</small><h1>Rescue the Merchant Caravan</h1><video controls playsinline preload="metadata" src="/Q002-v2.mp4"></video><p>One continuous narrator · '+report.duration.toFixed(1)+' seconds · no original clip dialogue</p><details><summary>Narration</summary><p>'+SCRIPT+'</p></details><p><a style="color:#dabe87" href="/Q002-v2.mp4">Open the MP4</a></p></main></html>'));
 app.listen(process.env.PORT||10000,()=>console.log('[PILOT] preview listening'));
}
if(process.argv.includes('--build'))build().catch(e=>{console.error('[PILOT] '+String(e.message).replace(/https?:\/\/\S+/g,'[source]'));process.exitCode=1});else serve();
