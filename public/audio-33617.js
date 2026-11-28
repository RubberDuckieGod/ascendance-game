// Ascendance — adaptive score, natural soundscapes and device-local mixer (v10.60).
(()=>{
  'use strict';
  const V='3.36.17',REV='1060-audio-1',KEY='ascendance-audio-settings-v1';
  const DEFAULTS=Object.freeze({enabled:true,master:.70,music:.32,sfx:.60,ambience:.20,cinematic:1,musicEnabled:true,ambienceEnabled:true,uiClicks:false,musicMode:'auto',ambienceMode:'auto'});
  const MUSIC=Object.freeze({
    menu:{label:'The Oath of the Frontier',src:'audio/score-v1060/music/menu.mp3'},
    exploration:{label:'Roads of the Six Realms',src:'audio/score-v1060/music/exploration.mp3'},
    combat:{label:'The Shadow Draws Near',src:'audio/score-v1060/music/combat.mp3'},
    downtime:{label:'Hearth and Haven',src:'audio/score-v1060/music/downtime.mp3'}
  });
  const AMBIENCE=Object.freeze({
    stonebrook:{label:'Stonebrook — Frontier woodland',src:'audio/score-v1060/ambience/stonebrook.mp3'},
    crownlands:{label:'Valewatch — Medieval city',src:'audio/score-v1060/ambience/crownlands.mp3'},
    ironspine:{label:'Ironspine — Mountains and distant forge',src:'audio/score-v1060/ambience/ironspine.mp3'},
    verdant:{label:'Verdant Reach — Ancient forest',src:'audio/score-v1060/ambience/verdant.mp3'},
    stormcoast:{label:'Stormcoast — Waves and sea wind',src:'audio/score-v1060/ambience/stormcoast.mp3'},
    sunscar:{label:'Sunscar — Desert ruins',src:'audio/score-v1060/ambience/sunscar.mp3'},
    underground:{label:'The Deep — Caverns and catacombs',src:'audio/score-v1060/ambience/underground.mp3'}
  });
  const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const clamp=(n,a=0,b=1)=>Number.isFinite(Number(n))?Math.max(a,Math.min(b,Number(n))):a;
  function normalize(raw={}){
    const s={...DEFAULTS};
    for(const k of ['master','music','sfx','ambience','cinematic'])if(raw[k]!==undefined&&raw[k]!==null&&Number.isFinite(Number(raw[k])))s[k]=clamp(raw[k]);
    for(const k of ['enabled','musicEnabled','ambienceEnabled','uiClicks'])if(typeof raw[k]==='boolean')s[k]=raw[k];
    if(raw.musicMode==='auto'||has(MUSIC,raw.musicMode))s.musicMode=raw.musicMode;
    if(raw.ambienceMode==='auto'||has(AMBIENCE,raw.ambienceMode))s.ambienceMode=raw.ambienceMode;
    return s
  }
  const regionByNumber=(n,bounds)=>{for(const [lo,hi,key] of bounds)if(n>=lo&&n<=hi)return key;return null};
  const REGIONS=['stonebrook','crownlands','ironspine','verdant','stormcoast','sunscar'];
  function regionFor(tile,game){
    const t=tile||{},loc=t.location||t.card||t.def||{},raw=t.id||t.locationId||t.locId||loc.id||'',n=Number(String(raw).match(/^L(\d+)$/i)?.[1]||0);
    const txt=[t.name,t.terrain,t.type,t.locationType,t.traits,t.keywords,loc.name,loc.terrain,loc.traits].flat().filter(Boolean).join(' ');
    if(/underground|catacomb|crypt|ossuary|sewer|mine|cavern|cave|tunnel|heartshaft/i.test(txt))return 'underground';
    const r=regionByNumber(n,[[1,50,'stonebrook'],[51,87,'crownlands'],[88,124,'ironspine'],[125,161,'verdant'],[162,198,'stormcoast'],[199,235,'sunscar']]);if(r)return r;
    const q=Number(String(game?.campaign?.currentQuest||game?.scenario||'').match(/^Q(\d+)/i)?.[1]||0);
    return q>=1&&q<=72?REGIONS[Math.floor((q-1)/12)]:'stonebrook'
  }
  function musicFor({menu=false,downtime=false,hostile=false}={}){return menu?'menu':downtime?'downtime':hostile?'combat':'exploration'}
  function sceneFor(s,{menu=false,downtime=false,hostile=false,tile=null,game=null}={}){
    return {music:s.enabled&&s.musicEnabled?(s.musicMode==='auto'?musicFor({menu,downtime,hostile}):s.musicMode):null,
      ambience:s.enabled&&s.ambienceEnabled?(s.ambienceMode==='auto'?(menu||downtime?null:regionFor(tile,game)):s.ambienceMode):null}
  }
  function levels(s,cinematic=false){
    return {master:s.enabled?s.master:0,music:s.musicEnabled&&!cinematic?s.music:0,ambience:s.ambienceEnabled&&!cinematic?s.ambience:0,sfx:cinematic?0:s.sfx,cinematic:s.cinematic}
  }
  // Blend the tail into the opening in-place; loop past the already blended
  // head. No extra long-track allocation, no hard seam, no repeated downloads.
  function softenLoop(buffer,seconds){
    const n=Math.min(Math.floor(seconds*buffer.sampleRate),Math.floor(buffer.length/4));if(n<2)return 0;
    for(let ch=0;ch<buffer.numberOfChannels;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<n;i++){const w=i/(n-1),j=buffer.length-n+i;d[j]=d[j]*(1-w)+d[i]*w}}
    return n/buffer.sampleRate
  }
  function createLayer({context,bus,load,fade=1.6,loopFade=.5,notify=()=>{},now=()=>Date.now()}){
    let current=null,pending=null,wanted=null,failure=null;
    const snapshot=()=>({current:current?.key||null,loading:pending?.key||null,wanted,failed:failure?.key===wanted?failure.key:null});
    function tell(){notify(snapshot())}
    function cancel(){if(pending){const old=pending;pending=null;old.abort.abort()}}
    function retire(old,duration){if(!old)return;const c=context();if(!c)return;const t=c.currentTime;
      try{const gain=old.gain.gain;if(typeof gain.cancelAndHoldAtTime==='function')gain.cancelAndHoldAtTime(t);else{gain.cancelScheduledValues(t);gain.setValueAtTime(gain.value,t)}gain.linearRampToValueAtTime(0,t+duration);old.src.onended=()=>{try{old.src.disconnect();old.gain.disconnect();old.src.buffer=null}catch(_){}};old.src.stop(t+duration+.04)}catch(_){try{old.src.disconnect();old.gain.disconnect()}catch(_){}}
    }
    function set(key){
      wanted=key||null;
      if(!wanted){cancel();if(current){retire(current,.4);current=null}failure=null;tell();return Promise.resolve(true)}
      if(current?.key===wanted){if(pending&&pending.key!==wanted)cancel();tell();return Promise.resolve(true)}
      if(pending?.key===wanted)return pending.promise;
      if(pending)cancel();
      if(failure?.key===wanted&&now()<failure.retryAt)return Promise.resolve(false);
      const c=context();if(!c||c.state!=='running'){tell();return Promise.resolve(false)}
      const job={key:wanted,abort:new AbortController(),promise:null};pending=job;tell();
      job.promise=(async()=>{
        try{
          const b=await load(job.key,job.abort.signal);if(pending!==job||job.abort.signal.aborted)return false;
          if(!b)throw Error('asset unavailable');
          if(c.state!=='running')throw Error('audio paused');
          const src=c.createBufferSource(),gain=c.createGain(),t=c.currentTime;src.buffer=b;src.loop=true;src.loopStart=softenLoop(b,loopFade);src.loopEnd=b.duration;
          gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(1,t+fade);src.connect(gain);gain.connect(bus());src.start(t);
          const previous=current;current={key:job.key,src,gain};pending=null;failure=null;retire(previous,fade);tell();return true
        }catch(e){if(pending!==job)return false;pending=null;if(!job.abort.signal.aborted)failure={key:job.key,retryAt:now()+15000};tell();return false}
      })();return job.promise
    }
    return {set,snapshot,stop:()=>set(null)}
  }
  const rules={DEFAULTS,MUSIC,AMBIENCE,normalize,regionFor,musicFor,sceneFor,levels,softenLoop,createLayer};
  if(typeof module==='object'&&module.exports){module.exports=rules;return}
  if(window.ascendanceAudio33617?.revision===REV)return;
  const state={...DEFAULTS};try{Object.assign(state,normalize(JSON.parse(localStorage.getItem(KEY)||'{}')||{}))}catch(_){}
  const history=[],bufferCache=new Map(),lastEvents=new Map();
  const SFX={
    click:'audio/sfx/click.ogg',card:'audio/sfx/card.ogg',discard:'audio/sfx/discard.ogg',attack:'audio/sfx/attack.ogg',enemy:'audio/sfx/enemy.ogg',
    hit:'audio/sfx/hit.ogg',heal:'audio/sfx/heal.ogg',reveal:'audio/sfx/reveal.ogg',explore:'audio/sfx/explore.ogg',search:'audio/sfx/search.ogg',
    reward:'audio/sfx/reward.ogg',phase:'audio/sfx/phase.ogg',defeat:'audio/sfx/defeat.ogg',victory:'audio/sfx/victory.ogg',fail:'audio/sfx/fail.ogg',
    status:'audio/sfx/status.ogg',warning:'audio/sfx/warning.ogg'
  };

  let ctx=null,masterGain=null,sfxGain=null,ambBus=null,musicBus=null,cinematicBus=null,unlocking=null,preloaded=false,cinematicActive=false,activeVideo=null,videoRoute=null,menuObserver=null,observedMenu=null,regionTimer=null,combatUntil=0;
  function record(name,detail={}){history.push({name,at:Date.now(),...detail});if(history.length>160)history.shift()}
  function AC(){return window.AudioContext||window.webkitAudioContext}
  function ensure(){
    if(ctx)return ctx;const C=AC();if(!C)return null;
    try{ctx=new C();masterGain=ctx.createGain();sfxGain=ctx.createGain();ambBus=ctx.createGain();musicBus=ctx.createGain();cinematicBus=ctx.createGain();
      for(const node of [sfxGain,ambBus,musicBus,cinematicBus])node.connect(masterGain);masterGain.connect(ctx.destination);syncGains();return ctx
    }catch(_){return null}
  }
  function syncGains(){if(!ctx||!masterGain)return;const l=levels(state,cinematicActive),t=ctx.currentTime;masterGain.gain.setTargetAtTime(l.master,t,.025);sfxGain.gain.setTargetAtTime(l.sfx,t,.04);ambBus.gain.setTargetAtTime(l.ambience,t,.10);musicBus.gain.setTargetAtTime(l.music,t,.12);cinematicBus.gain.setTargetAtTime(l.cinematic,t,.025)}
  function applyVideoSettings(){
    const v=activeVideo;if(!v)return;const value=state.enabled?state.master*state.cinematic:0;
    if(!videoRoute&&ctx?.state==='running'&&typeof ctx.createMediaElementSource==='function'){
      try{const src=ctx.createMediaElementSource(v);src.connect(cinematicBus);videoRoute={src};v.volume=1;v.muted=false}catch(_){}
    }
    if(!videoRoute){try{v.volume=value;v.muted=value===0}catch(_){}}
  }
  function detachCinematic(v){if(!activeVideo||v&&activeVideo!==v)return;try{videoRoute?.src.disconnect()}catch(_){}activeVideo=null;videoRoute=null}
  function attachCinematic(v){if(!v)return;if(activeVideo!==v){detachCinematic();activeVideo=v}applyVideoSettings()}
  async function loadTrack(url,signal){const r=await fetch(url,{cache:'force-cache',signal});if(!r.ok)throw Error('Audio HTTP '+r.status);const bytes=await r.arrayBuffer();if(signal.aborted)return null;return await ctx.decodeAudioData(bytes)}
  const musicLayer=createLayer({context:()=>ctx,bus:()=>musicBus,load:(key,signal)=>loadTrack(MUSIC[key].src,signal),fade:2.2,loopFade:2,notify:()=>syncNowPlaying()});
  const ambLayer=createLayer({context:()=>ctx,bus:()=>ambBus,load:(key,signal)=>loadTrack(AMBIENCE[key].src,signal),fade:1.6,loopFade:.45,notify:()=>syncNowPlaying()});
  function menuVisible(){
    const el=document.getElementById('gameLobby');if(!el)return !gameState();if(el.hidden||el.classList.contains('hidden')||el.style.display==='none')return false;
    try{const cs=window.getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'}catch(_){return true}
  }
  function gameState(){try{return typeof g!=='undefined'?g:globalThis.g||null}catch(_){return null}}
  function currentTile(){try{const game=gameState(),hero=typeof controlledHero==='function'?controlledHero():game?.activeHero||'Aldric';return typeof currentHeroTile==='function'?currentHeroTile(hero):null}catch(_){return null}}
  function sceneContext(){
    const menu=menuVisible(),game=gameState(),tile=menu?null:currentTile(),downtime=!menu&&!!game?.campaign?.downtime;
    const local=Array.isArray(tile?.enemies)&&tile.enemies.some(e=>Number(e?.hp)>0);
    const enemyPhase=!menu&&!downtime&&/enemy phase/i.test(String(game?.phase||''))&&Object.values(game?.tiles||{}).some(t=>Array.isArray(t?.enemies)&&t.enemies.some(e=>Number(e?.hp)>0));
    if(menu||downtime)combatUntil=0;else if(local||enemyPhase)combatUntil=Date.now()+7000;
    return {menu,downtime,hostile:!menu&&!downtime&&(local||enemyPhase||Date.now()<combatUntil),tile,game}
  }
  function desired(){return sceneFor(state,sceneContext())}
  function updateScene(){if(!ctx||ctx.state!=='running')return Promise.resolve(false);const want=desired();return Promise.all([musicLayer.set(want.music),ambLayer.set(want.ambience)]).then(a=>a.every(Boolean))}
  async function unlock(){
    if(!state.enabled)return false;const c=ensure();if(!c)return false;
    if(c.state==='running'){if(!preloaded){preloaded=true;void preloadSfx()}applyVideoSettings();void updateScene();return true}
    if(!unlocking)unlocking=(async()=>{try{await c.resume();if(c.state==='running'){if(!preloaded){preloaded=true;void preloadSfx()}applyVideoSettings();void updateScene();return true}}catch(_){}return false})().finally(()=>unlocking=null);
    return unlocking
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){}syncGains();applyVideoSettings();syncButtons();syncNowPlaying()}
  function change(k,value){state[k]=value;save();if(!state.enabled){void musicLayer.stop();void ambLayer.stop()}else{void unlock().then(()=>updateScene())}}
  async function loadBuffer(url){
    if(bufferCache.has(url))return bufferCache.get(url);const promise=(async()=>{try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw Error(String(r.status));return await ctx.decodeAudioData(await r.arrayBuffer())}catch(e){record('asset-error',{url,error:String(e?.message||e)});return null}})();bufferCache.set(url,promise);return promise
  }
  function playBuffer(buffer,dest,volume=1){if(!ctx||ctx.state!=='running'||!buffer)return false;const src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buffer;gain.gain.value=volume;src.connect(gain);gain.connect(dest);src.onended=()=>{try{src.disconnect();gain.disconnect()}catch(_){}};src.start();return true}
  async function preloadSfx(){await Promise.all(Object.values(SFX).map(loadBuffer));return true}
  // Live procedural fallbacks remain only for a failed/missing bundled asset.
  function gainNode(value,dest=sfxGain){const g=ctx.createGain();g.gain.value=value;g.connect(dest);return g}
  function osc({freq=440,to=null,duration=.12,type='sine',gain=.08,delay=0,dest=sfxGain}){if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=gainNode(gain,dest);o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);o.start(t);o.stop(t+duration+.02)}
  function noise({duration=.10,gain=.05,delay=0,highpass=0,lowpass=0,dest=sfxGain}){if(!ctx||ctx.state!=='running')return;const len=Math.max(1,Math.floor(ctx.sampleRate*duration)),buf=ctx.createBuffer(1,len,ctx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const src=ctx.createBufferSource();src.buffer=buf;let node=src;if(highpass){const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=highpass;node.connect(f);node=f}if(lowpass){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=lowpass;node.connect(f);node=f}const g=gainNode(gain,dest),t=ctx.currentTime+delay;node.connect(g);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.start(t);src.stop(t+duration+.01)}
  function chord(notes,d=.14,g=.035,type='sine',step=.045){notes.forEach((n,i)=>osc({freq:n,duration:d,type,gain:g,delay:i*step}))}
  const fallback={
    click(){osc({freq:520,to:430,duration:.035,type:'triangle',gain:.025})},card(){noise({duration:.07,gain:.026,highpass:900});osc({freq:760,to:980,duration:.06,type:'triangle',gain:.018,delay:.02})},discard(){noise({duration:.08,gain:.03,highpass:600});osc({freq:430,to:250,duration:.08,type:'triangle',gain:.022})},attack(){noise({duration:.085,gain:.06,highpass:120});osc({freq:180,to:62,duration:.11,type:'sawtooth',gain:.065})},enemy(){noise({duration:.12,gain:.055,lowpass:850});osc({freq:120,to:72,duration:.16,type:'square',gain:.045})},hit(){noise({duration:.10,gain:.07,lowpass:1200});osc({freq:92,to:48,duration:.095,type:'triangle',gain:.07})},heal(){chord([523.25,659.25,783.99],.16,.035,'sine',.055)},reveal(){chord([392,523.25,659.25],.17,.034,'triangle',.06)},explore(){noise({duration:.11,gain:.018,highpass:1200});chord([293.66,392],.12,.025,'triangle',.05)},search(){noise({duration:.09,gain:.025,highpass:700});osc({freq:620,to:820,duration:.095,type:'triangle',gain:.025})},reward(){chord([659.25,830.61,1046.5],.13,.032,'sine',.045)},phase(){chord([261.63,392],.16,.028,'triangle',.08)},defeat(){osc({freq:150,to:52,duration:.32,type:'sawtooth',gain:.055});noise({duration:.24,gain:.035,lowpass:700})},victory(){chord([523.25,659.25,783.99,1046.5],.28,.045,'triangle',.09)},fail(){[329.63,277.18,220].forEach((n,i)=>osc({freq:n,to:n*.92,duration:.28,type:'triangle',gain:.038,delay:i*.10}))},status(){osc({freq:700,to:530,duration:.08,type:'sine',gain:.025})},warning(){osc({freq:220,duration:.09,type:'square',gain:.025});osc({freq:220,duration:.09,type:'square',gain:.025,delay:.13})}
  };


  async function play(name,opts={}){
    if(!state.enabled||cinematicActive||state.sfx===0||!SFX[name])return false;
    const ok=await unlock();if(!ok||cinematicActive||!state.enabled)return false;
    const path=SFX[name];record(name,{...opts,asset:path});
    try{const b=await loadBuffer(path);if(cinematicActive||!state.enabled)return false;if(b)return playBuffer(b,sfxGain,opts.volume??(name==='click'?.35:1));fallback[name]?.(opts);return true}catch(_){if(!cinematicActive&&state.enabled)fallback[name]?.(opts);return false}
  }
  function playThrottled(name,detail={}){const t=Date.now();if(!state.enabled||cinematicActive||t-(lastEvents.get(name)||0)<(name==='click'?170:140))return false;lastEvents.set(name,t);void play(name,detail);return true}
  function classify(text){const s=String(text||''),u=s.toUpperCase();if(/^\d+\.\d+\.\d+\s/.test(s))return null;if(/QUEST (COMPLETE|COMPLETED)|VICTORY|ADVENTURE WON|CAMPAIGN COMPLETE/.test(u))return 'victory';if(/QUEST (FAIL|FAILED)|DEFEAT|GAME OVER|HERO LOST/.test(u))return 'fail';if(/ IS DOWNED| IS DEFEATED|ENEMY DEFEATED|DEFEATS /.test(u))return 'defeat';if(/ENEMY ATTACK|GOBLIN .*ATTACK|WORLD PHASE/.test(u))return u.includes('WORLD PHASE')?'phase':'enemy';if(/\bATTACK\b/.test(u))return 'attack';if(/SUFFERS? \d+|TAKES? \d+|DAMAGE —|DAMAGE:/.test(u))return 'hit';if(/RECOVERS? .*HEALTH|HEAL|RESTORE.*HEALTH/.test(u))return 'heal';if(/REVEAL EFFECT|LOCATION REVEAL|REVEALED LOCATION|REVEAL —/.test(u))return 'reveal';if(/^EXPLORE| EXPLORE|PLACED LOCATION/.test(u))return 'explore';if(/^SEARCH|SEARCH CARD|FREE SEARCH/.test(u))return 'search';if(/\bDRAW\b.*CARD|DRAWS? \d+.*CARD/.test(u))return 'card';if(/DISCARD/.test(u))return 'discard';if(/LOOT|GAINS? \d+ GOLD|\+\d+ GOLD|SUPPLY|REWARD/.test(u))return 'reward';if(/GAINS? (INSPIRED|GUARDED|STEALTH|HIDDEN)|STATUS/.test(u))return 'status';if(/WARNING|ALERT/.test(u))return 'warning';if(/HERO PHASE|END PHASE|ROUND \d+/.test(u))return 'phase';return null}
  function wrapLog(){if(typeof window.log!=='function'||window.log.__audio33617)return false;const prev=window.log;function wrapped(x){const out=prev.apply(this,arguments);const ev=classify(x);if(ev)playThrottled(ev,{source:'log',text:String(x).slice(0,180)});return out}wrapped.__audio33617=true;wrapped.__previous=prev;window.log=wrapped;return true}


  function injectStyle(){
    if(document.getElementById('audioStyle33617'))return;const st=document.createElement('style');st.id='audioStyle33617';st.textContent=[
      '#audioBtn33617,#audioMenuBtn33617{white-space:nowrap}',
      '#audioMenuBtn33617{position:fixed;z-index:2147480000;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));min-height:44px;border:1px solid #987b4e;border-radius:9px;background:#1b211f;color:#edd8ae;box-shadow:0 4px 20px #0009;padding:10px 16px;font-weight:600}',
      '#audioMenuBtn33617[hidden],#audioBtn33617[hidden]{display:none!important}',
      '#audioOverlay33617{color:#ede5d3;background:#171d1d;border:1px solid #987b4e;border-radius:14px;padding:0;box-shadow:0 20px 80px #000b;width:min(560px,calc(100% - 24px));max-height:90dvh;overflow:auto;z-index:2147481000}',
      '#audioOverlay33617::backdrop{background:rgba(5,7,8,.83)}.audioPanel33617{padding:20px}.audioHead33617{display:flex;justify-content:space-between;align-items:center;gap:10px}',
      '.audioRow33617{display:grid;grid-template-columns:minmax(100px,132px) 1fr 44px;align-items:center;gap:10px;margin:12px 0}.audioRow33617 input[type=range]{width:100%;accent-color:#bc9b60}.audioChecks33617{display:flex;gap:12px 18px;flex-wrap:wrap;margin:14px 0}.audioChecks33617 label{display:flex;align-items:center;gap:6px}',
      '.audioRegion33617{display:grid;grid-template-columns:132px 1fr;gap:10px;align-items:center;margin:10px 0}.audioRegion33617 select{width:100%;min-width:0}.audioNow33617{padding:10px 12px;border:1px solid #4c493c;border-radius:9px;background:#111716;margin:12px 0;font-size:.9em;line-height:1.5;white-space:pre-line}.audioActions33617{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.audioHint33617{font-size:.83em;opacity:.78;line-height:1.5}',
      '@media(max-width:650px){.audioPanel33617{padding:15px}.audioRow33617{grid-template-columns:108px 1fr 38px;gap:7px}.audioRegion33617{grid-template-columns:108px 1fr}.audioRow33617 output{text-align:right}}'
    ].join('\n');document.head.appendChild(st)
  }
  function syncButtons(){
    const menu=menuVisible();for(const [id,show] of [['audioBtn33617',!menu],['audioMenuBtn33617',menu]]){const b=document.getElementById(id);if(!b)continue;b.hidden=!show;b.textContent=(state.enabled?'🔊':'🔇')+' Sound Settings';b.title='Open sound settings';b.setAttribute('aria-label','Sound settings'+(state.enabled?'':' — muted'))}
  }
  function layerText(layer,table,enabled){
    if(!state.enabled||!enabled)return 'Off';const l=layer.snapshot();if(l.loading)return (table[l.loading]?.label||l.loading)+' — loading';if(l.failed)return 'Temporarily unavailable';if(l.current)return table[l.current]?.label||l.current;if(!l.wanted)return 'Off in this scene';return ctx?.state==='running'?'Preparing':'Tap to enable sound'
  }
  function syncNowPlaying(){const e=document.getElementById('audioNow33617');if(!e)return;e.textContent=(cinematicActive?'Cinematic playing — background audio paused\n':'')+'Music: '+layerText(musicLayer,MUSIC,state.musicEnabled)+'\nAmbience: '+layerText(ambLayer,AMBIENCE,state.ambienceEnabled)}
  function slider(label,key,value){const n=Math.round(value*100);return '<div class="audioRow33617"><label for="audio_'+key+'_33617">'+label+'</label><input id="audio_'+key+'_33617" type="range" min="0" max="100" value="'+n+'"><output id="audio_'+key+'_out33617" for="audio_'+key+'_33617">'+n+'%</output></div>'}
  function options(table,selected,automatic){return [['auto',automatic],...Object.entries(table).map(([k,v])=>[k,v.label])].map(([k,l])=>'<option value="'+k+'" '+(k===selected?'selected':'')+'>'+l+'</option>').join('')}
  function showSettings(){
    void unlock();const existing=document.getElementById('audioOverlay33617');if(existing){try{existing.focus()}catch(_){}return}
    const o=document.createElement('dialog');o.id='audioOverlay33617';o.setAttribute('aria-labelledby','audioTitle33617');
    o.innerHTML='<div class="audioPanel33617"><div class="audioHead33617"><div class="muted">ASCENDANCE · SOUND MIXER<h2 id="audioTitle33617" style="margin:4px 0">Sound Settings</h2></div><button type="button" id="audioClose33617">Close</button></div>'+
    '<div class="audioChecks33617">'+[['enabled','Sound enabled'],['musicEnabled','Music'],['ambienceEnabled','Regional ambience'],['uiClicks','UI clicks']].map(([k,l])=>'<label><input type="checkbox" id="audioToggle_'+k+'" '+(state[k]?'checked':'')+'> '+l+'</label>').join('')+'</div>'+
    slider('Master volume','master',state.master)+slider('Music','music',state.music)+slider('Ambience','ambience',state.ambience)+slider('Sound effects','sfx',state.sfx)+slider('Cinematics','cinematic',state.cinematic)+
    '<div class="audioRegion33617"><label for="audioMusicMode33617">Music theme</label><select id="audioMusicMode33617">'+options(MUSIC,state.musicMode,'Auto — menu, exploration, combat, downtime')+'</select></div>'+
    '<div class="audioRegion33617"><label for="audioRegion33617">Ambience region</label><select id="audioRegion33617">'+options(AMBIENCE,state.ambienceMode,'Auto — follow current location')+'</select></div>'+
    '<div id="audioNow33617" class="audioNow33617" role="status"></div><p class="audioHint33617">Sound settings are saved on this device and apply to the main menu, solo and multiplayer games. Music and environmental audio fade out during quest films so narration stays clear. Some browsers require a tap before sound can begin.</p>'+
    '<div class="audioActions33617"><button type="button" id="audioTest33617">Test effects</button><button type="button" id="audioPreview33617">Enable / preview sound</button><button type="button" id="audioMute33617">'+(state.enabled?'Mute all':'Unmute')+'</button><button type="button" id="audioReset33617">Reset defaults</button></div></div>';
    document.body.appendChild(o);try{o.showModal()}catch(_){o.setAttribute('open','')};syncNowPlaying();
    function close(){try{o.close()}catch(_){}o.remove()}o.querySelector('#audioClose33617').onclick=close;o.addEventListener('close',()=>o.remove());o.addEventListener('cancel',e=>{e.preventDefault();close()});
    for(const k of ['enabled','musicEnabled','ambienceEnabled','uiClicks']){const el=o.querySelector('#audioToggle_'+k);el.onchange=()=>{change(k,el.checked);o.querySelector('#audioMute33617').textContent=state.enabled?'Mute all':'Unmute'}}
    o.querySelector('#audioMusicMode33617').onchange=e=>change('musicMode',e.target.value);o.querySelector('#audioRegion33617').onchange=e=>change('ambienceMode',e.target.value);
    for(const k of ['master','music','ambience','sfx','cinematic']){const input=o.querySelector('#audio_'+k+'_33617'),out=o.querySelector('#audio_'+k+'_out33617');input.oninput=()=>{state[k]=clamp(Number(input.value)/100);out.textContent=Math.round(state[k]*100)+'%';save()}}
    o.querySelector('#audioMute33617').onclick=()=>{change('enabled',!state.enabled);o.querySelector('#audioToggle_enabled').checked=state.enabled;o.querySelector('#audioMute33617').textContent=state.enabled?'Mute all':'Unmute'};
    o.querySelector('#audioReset33617').onclick=()=>{Object.assign(state,DEFAULTS);save();void updateScene();close();showSettings()};
    o.querySelector('#audioPreview33617').onclick=()=>{if(!state.enabled)change('enabled',true);o.querySelector('#audioToggle_enabled').checked=state.enabled;o.querySelector('#audioMute33617').textContent='Mute all';void unlock().then(()=>updateScene())};
    o.querySelector('#audioTest33617').onclick=async()=>{if(await unlock())['card','attack','heal','reward'].forEach((n,i)=>setTimeout(()=>play(n,{source:'test',volume:.75}),i*410))};
  }
  function installButtons(){
    const previous=document.getElementById('audioBtn33616');if(previous)previous.remove();
    if(!document.getElementById('audioMenuBtn33617')){const b=document.createElement('button');b.type='button';b.id='audioMenuBtn33617';b.onclick=showSettings;document.body.appendChild(b)}
    if(!document.getElementById('audioBtn33617')){const b=document.createElement('button');b.type='button';b.id='audioBtn33617';b.onclick=showSettings;const target=document.querySelector('#campaignHubBtn32538')?.parentElement||document.querySelector('#restart')?.parentElement||document.querySelector('.topbar')||document.body;target.appendChild(b)}
    syncButtons()
  }
  function installClicks(){if(document.documentElement.dataset.audioClicks33617)return;document.documentElement.dataset.audioClicks33617='1';
    const wake=()=>{if(state.enabled)void unlock()};document.addEventListener('pointerdown',wake,{capture:true,passive:true});document.addEventListener('keydown',wake,true);
    document.addEventListener('click',e=>{if(!state.enabled||!state.uiClicks||cinematicActive)return;const el=e.target?.closest?.('button,[role="button"],.tab,.heroChip');if(!el||el.disabled||el.closest('#audioOverlay33617')||el.id==='audioMenuBtn33617'||el.id==='audioBtn33617')return;playThrottled('click',{source:'ui'})},true)
  }
  function boot(){
    injectStyle();installButtons();installClicks();wrapLog();
    const menu=document.getElementById('gameLobby');if(menu&&menu!==observedMenu&&typeof MutationObserver==='function'){menuObserver?.disconnect();observedMenu=menu;menuObserver=new MutationObserver(()=>{syncButtons();void updateScene()});menuObserver.observe(menu,{attributes:true,attributeFilter:['class','style','hidden']})}
    if(!regionTimer)regionTimer=setInterval(()=>{wrapLog();syncButtons();if(ctx?.state==='running')void updateScene()},1100);
    if(ctx?.state==='running')void updateScene()
  }
  const regionLabel=k=>AMBIENCE[k]?.label||'Off';
  window.ascendanceAudio33617={build:V,revision:REV,state,history,assets:{sfx:{...SFX},ambience:AMBIENCE,music:MUSIC},play,playEvent:playThrottled,classify,unlock,showSettings,
    autoRegion:()=>regionFor(currentTile(),gameState()),requestedRegion:()=>desired().ambience,regionLabel,updateAmbience:()=>updateScene(),updateScene,previewRegion(k){if(!has(AMBIENCE,k))return false;change('ambienceMode',k);return true},preloadSfx,
    attachCinematic,detachCinematic,setCinematicActive(v){cinematicActive=!!v;syncGains();syncNowPlaying()},
    setEnabled(v){change('enabled',!!v)},setAmbience(v){change('ambienceEnabled',!!v)},setMusic(v){change('musicEnabled',!!v)},
    setAmbienceMode(v){if(v!=='auto'&&!has(AMBIENCE,v))return false;change('ambienceMode',v);return true},setMusicMode(v){if(v!=='auto'&&!has(MUSIC,v))return false;change('musicMode',v);return true},
    setVolume(k,v){if(!['master','music','sfx','ambience','cinematic'].includes(k))return false;state[k]=clamp(v);save();return true},
    audit(){return {build:V,revision:REV,context:ctx?.state||'not-created',webAudio:!!AC(),...state,menu:menuVisible(),menuButton:!!document.getElementById('audioMenuBtn33617'),button:!!document.getElementById('audioBtn33617'),requestedRegion:desired().ambience,currentRegion:ambLayer.snapshot().current,currentRegionLabel:regionLabel(ambLayer.snapshot().current),musicScene:musicLayer.snapshot(),ambienceScene:ambLayer.snapshot(),cinematicActive,cinematicAttached:!!activeVideo,levels:levels(state,cinematicActive),assetCount:Object.keys(SFX).length+Object.keys(AMBIENCE).length+Object.keys(MUSIC).length,loadedAssets:bufferCache.size,events:history.slice(-16)}}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();[100,600,1800,4200,7600,12000].forEach(ms=>setTimeout(boot,ms));
})();
