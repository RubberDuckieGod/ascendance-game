// Ascendance 3.36.17 — Bundled Fantasy Audio + Regional Ambience
// Custom-built audio assets with Web Audio playback and procedural fallback.
(()=>{
  'use strict';
  const V='3.36.17';
  const KEY='ascendance-audio-settings-v1';
  const DEFAULTS={enabled:true,master:.70,sfx:.78,ambience:.30,ambienceEnabled:true,uiClicks:true,ambienceMode:'auto'};
  const state={...DEFAULTS};
  const history=[];
  const SFX={
    click:'audio/sfx/click.ogg',card:'audio/sfx/card.ogg',discard:'audio/sfx/discard.ogg',attack:'audio/sfx/attack.ogg',enemy:'audio/sfx/enemy.ogg',
    hit:'audio/sfx/hit.ogg',heal:'audio/sfx/heal.ogg',reveal:'audio/sfx/reveal.ogg',explore:'audio/sfx/explore.ogg',search:'audio/sfx/search.ogg',
    reward:'audio/sfx/reward.ogg',phase:'audio/sfx/phase.ogg',defeat:'audio/sfx/defeat.ogg',victory:'audio/sfx/victory.ogg',fail:'audio/sfx/fail.ogg',
    status:'audio/sfx/status.ogg',warning:'audio/sfx/warning.ogg'
  };
  const AMBIENCE={
    stonebrook:{label:'Stonebrook Marches — Forest & Frontier',src:'audio/ambience/stonebrook.ogg'},
    crownlands:{label:'Crownlands / Valewatch — Distant City',src:'audio/ambience/crownlands.ogg'},
    ironspine:{label:'Ironspine Mountains — Wind & Forge',src:'audio/ambience/ironspine.ogg'},
    verdant:{label:'Verdant Reach — Living Forest',src:'audio/ambience/verdant.ogg'},
    stormcoast:{label:'Storm Coast — Surf & Thunder',src:'audio/ambience/stormcoast.ogg'},
    sunscar:{label:'Sunscar Expanse — Desert Wind & Glass',src:'audio/ambience/sunscar.ogg'},
    underground:{label:'Underground — Caverns & Drips',src:'audio/ambience/underground.ogg'}
  };
  const bufferCache=new Map();
  let ctx=null,masterGain=null,sfxGain=null,ambBus=null;
  let ambientCurrent=null,ambientLoading=null,ambientGeneration=0;
  let lastEvent='',lastEventAt=0,lastRegionCheck='';
  let regionTimer=null,renderWrapped=false;

  function clamp(n,a=0,b=1){n=Number(n);return Number.isFinite(n)?Math.max(a,Math.min(b,n)):a}
  function load(){try{Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){} state.master=clamp(state.master);state.sfx=clamp(state.sfx);state.ambience=clamp(state.ambience);state.enabled=state.enabled!==false;state.ambienceEnabled=state.ambienceEnabled!==false;state.uiClicks=state.uiClicks!==false;if(state.ambienceMode!=='auto'&&!AMBIENCE[state.ambienceMode])state.ambienceMode='auto'}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){}syncGains();syncButton();syncNowPlaying()}
  load();

  function AC(){return window.AudioContext||window.webkitAudioContext}
  function ensure(){
    if(ctx)return ctx;
    const C=AC();if(!C)return null;
    try{
      ctx=new C();masterGain=ctx.createGain();sfxGain=ctx.createGain();ambBus=ctx.createGain();
      sfxGain.connect(masterGain);ambBus.connect(masterGain);masterGain.connect(ctx.destination);syncGains();return ctx;
    }catch(_){return null}
  }
  function syncGains(){if(!masterGain||!ctx)return;const now=ctx.currentTime;masterGain.gain.setTargetAtTime(state.enabled?state.master:0,now,.015);sfxGain.gain.setTargetAtTime(state.sfx,now,.015);ambBus.gain.setTargetAtTime(state.ambience,now,.06)}
  async function unlock(){const c=ensure();if(!c)return false;try{if(c.state==='suspended')await c.resume()}catch(_){}if(c.state==='running'){void preloadSfx();if(state.ambienceEnabled&&state.enabled)void updateAmbience(true)}return c.state==='running'}

  function record(name,detail={}){history.push({name,at:Date.now(),...detail});if(history.length>160)history.shift()}
  async function loadBuffer(url){
    if(bufferCache.has(url))return bufferCache.get(url);
    const promise=(async()=>{try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error(String(r.status));const a=await r.arrayBuffer();const c=ensure();if(!c)throw new Error('no AudioContext');return await c.decodeAudioData(a.slice(0))}catch(e){record('asset-error',{url,error:String(e?.message||e)});return null}})();
    bufferCache.set(url,promise);return promise;
  }
  function playBuffer(buffer,dest,volume=1){if(!ctx||ctx.state!=='running'||!buffer)return false;const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=buffer;g.gain.value=volume;src.connect(g);g.connect(dest);src.start();return true}
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
    if(!state.enabled)return false;const path=SFX[name];if(!path)return false;record(name,{...opts,asset:path});const ok=await unlock();if(!ok)return false;
    try{const b=await loadBuffer(path);if(b)return playBuffer(b,sfxGain,1);fallback[name]?.(opts);return true}catch(_){fallback[name]?.(opts);return false}
  }
  function playThrottled(name,detail={}){const now=Date.now();if(name===lastEvent&&now-lastEventAt<80)return false;lastEvent=name;lastEventAt=now;void play(name,detail);return true}

  function classify(text){const s=String(text||''),u=s.toUpperCase();if(/^\d+\.\d+\.\d+\s/.test(s))return null;if(/QUEST (COMPLETE|COMPLETED)|VICTORY|ADVENTURE WON|CAMPAIGN COMPLETE/.test(u))return 'victory';if(/QUEST (FAIL|FAILED)|DEFEAT|GAME OVER|HERO LOST/.test(u))return 'fail';if(/ IS DOWNED| IS DEFEATED|ENEMY DEFEATED|DEFEATS /.test(u))return 'defeat';if(/ENEMY ATTACK|GOBLIN .*ATTACK|WORLD PHASE/.test(u))return u.includes('WORLD PHASE')?'phase':'enemy';if(/\bATTACK\b/.test(u))return 'attack';if(/SUFFERS? \d+|TAKES? \d+|DAMAGE —|DAMAGE:/.test(u))return 'hit';if(/RECOVERS? .*HEALTH|HEAL|RESTORE.*HEALTH/.test(u))return 'heal';if(/REVEAL EFFECT|LOCATION REVEAL|REVEALED LOCATION|REVEAL —/.test(u))return 'reveal';if(/^EXPLORE| EXPLORE|PLACED LOCATION/.test(u))return 'explore';if(/^SEARCH|SEARCH CARD|FREE SEARCH/.test(u))return 'search';if(/\bDRAW\b.*CARD|DRAWS? \d+.*CARD/.test(u))return 'card';if(/DISCARD/.test(u))return 'discard';if(/LOOT|GAINS? \d+ GOLD|\+\d+ GOLD|SUPPLY|REWARD/.test(u))return 'reward';if(/GAINS? (INSPIRED|GUARDED|STEALTH|HIDDEN)|STATUS/.test(u))return 'status';if(/WARNING|ALERT/.test(u))return 'warning';if(/HERO PHASE|END PHASE|ROUND \d+/.test(u))return 'phase';return null}
  function wrapLog(){if(typeof window.log!=='function'||window.log.__audio33617)return false;const prev=window.log;function wrapped(x){const out=prev.apply(this,arguments);const ev=classify(x);if(ev)playThrottled(ev,{source:'log',text:String(x).slice(0,180)});return out}wrapped.__audio33617=true;wrapped.__previous=prev;window.log=wrapped;return true}

  function currentTile(){try{const h=typeof controlledHero==='function'?controlledHero():(globalThis.g?.activeHero||'Aldric');return typeof currentHeroTile==='function'?currentHeroTile(h):null}catch(_){return null}}
  function locationNumber(id){const m=String(id||'').match(/^L(\d+)$/i);return m?Number(m[1]):-1}
  function questNumber(){try{const q=String(globalThis.g?.campaign?.currentQuest||globalThis.g?.scenario||'');const m=q.match(/^Q(\d+)/i);return m?Number(m[1]):-1}catch(_){return -1}}
  function autoRegion(){
    const t=currentTile(),id=t?.id||t?.locationId||'',n=locationNumber(id),txt=[t?.name,t?.terrain,t?.type,t?.locationType,...(Array.isArray(t?.traits)?t.traits:[t?.traits]),...(Array.isArray(t?.keywords)?t.keywords:[t?.keywords])].filter(Boolean).join(' ');
    if(/underground|catacomb|crypt|ossuary|sewer|mine|cavern|cave|tunnel|heartshaft/i.test(txt))return 'underground';
    if(n>=1&&n<=50)return 'stonebrook';if(n>=51&&n<=87)return 'crownlands';if(n>=88&&n<=124)return 'ironspine';if(n>=125&&n<=161)return 'verdant';if(n>=162&&n<=198)return 'stormcoast';if(n>=199&&n<=235)return 'sunscar';
    const q=questNumber();if(q>=1&&q<=12)return 'stonebrook';if(q>=13&&q<=24)return 'crownlands';if(q>=25&&q<=36)return 'ironspine';if(q>=37&&q<=48)return 'verdant';if(q>=49&&q<=60)return 'stormcoast';if(q>=61&&q<=72)return 'sunscar';return 'stonebrook';
  }
  function requestedRegion(){return state.ambienceMode==='auto'?autoRegion():state.ambienceMode}
  function regionLabel(key){return AMBIENCE[key]?.label||'Unknown region'}
  async function startRegion(key,force=false){
    if(!state.enabled||!state.ambienceEnabled)return false;if(!AMBIENCE[key])key='stonebrook';
    if(!force&&ambientCurrent?.key===key)return true;const c=ensure();if(!c||c.state!=='running')return false;
    const generation=++ambientGeneration;ambientLoading=key;const b=await loadBuffer(AMBIENCE[key].src);if(generation!==ambientGeneration){return false}ambientLoading=null;if(!b)return false;
    const src=ctx.createBufferSource(),g=ctx.createGain(),now=ctx.currentTime,fade=1.25;src.buffer=b;src.loop=true;g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(1,now+fade);src.connect(g);g.connect(ambBus);src.start(now);
    const old=ambientCurrent;ambientCurrent={key,src,gain:g,startedAt:Date.now()};if(old){try{old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(Math.max(.0001,old.gain.gain.value),now);old.gain.gain.linearRampToValueAtTime(.0001,now+fade);setTimeout(()=>{try{old.src.stop()}catch(_){}try{old.src.disconnect();old.gain.disconnect()}catch(_){}},Math.ceil((fade+.1)*1000))}catch(_){}}
    record('ambience-region',{region:key,label:regionLabel(key),asset:AMBIENCE[key].src});syncNowPlaying();return true;
  }
  function stopAmbience(){ambientGeneration++;ambientLoading=null;const old=ambientCurrent;ambientCurrent=null;if(old&&ctx){const now=ctx.currentTime;try{old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(Math.max(.0001,old.gain.gain.value),now);old.gain.gain.linearRampToValueAtTime(.0001,now+.35);setTimeout(()=>{try{old.src.stop()}catch(_){}try{old.src.disconnect();old.gain.disconnect()}catch(_){}},430)}catch(_){}}record('ambience-stop');syncNowPlaying()}
  async function updateAmbience(force=false){if(!state.enabled||!state.ambienceEnabled){if(ambientCurrent)stopAmbience();return false}const key=requestedRegion();lastRegionCheck=key;if(!force&&ambientCurrent?.key===key)return true;return startRegion(key,force)}
  function previewRegion(key){if(!AMBIENCE[key])return false;state.ambienceMode=key;save();void unlock().then(()=>updateAmbience(true));return true}

  function injectStyle(){if(document.getElementById('audioStyle33617'))return;const st=document.createElement('style');st.id='audioStyle33617';st.textContent=`
#audioBtn33617{white-space:nowrap}.audioOverlay33617{position:fixed;inset:0;z-index:12050;background:rgba(2,5,10,.88);display:flex;align-items:center;justify-content:center;padding:16px}.audioPanel33617{width:min(560px,96vw);max-height:90vh;overflow:auto;background:#111923;border:1px solid #40536b;border-radius:14px;padding:18px;box-shadow:0 20px 80px #000a}.audioHead33617{display:flex;align-items:center;justify-content:space-between;gap:12px}.audioRow33617{display:grid;grid-template-columns:140px 1fr 52px;align-items:center;gap:10px;margin:14px 0}.audioRow33617 input[type=range]{width:100%}.audioChecks33617{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0}.audioActions33617{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.audioHint33617{font-size:.9em;opacity:.72;line-height:1.4}.audioRegion33617{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:10px;margin:14px 0}.audioRegion33617 select{min-width:0;width:100%}.audioNow33617{padding:10px 12px;border:1px solid #30445a;border-radius:10px;background:#0c131b;margin:10px 0;font-size:.9em}@media(max-width:650px){.audioRow33617{grid-template-columns:110px 1fr 44px}.audioRegion33617{grid-template-columns:110px 1fr}.audioPanel33617{padding:14px}}
`;document.head.appendChild(st)}
  function syncButton(){const b=document.getElementById('audioBtn33617');if(b){b.textContent=state.enabled?'🔊 Sound':'🔇 Sound';b.title=state.enabled?'Sound settings':'Sound is muted — open settings'}}
  function syncNowPlaying(){const e=document.getElementById('audioNow33617');if(!e)return;const key=ambientCurrent?.key||requestedRegion();e.innerHTML=state.ambienceEnabled&&state.enabled?`<b>Regional ambience:</b> ${regionLabel(key)}${ambientLoading?' · loading…':''}`:'<b>Regional ambience:</b> Off'}
  function slider(label,key,value){return `<div class="audioRow33617"><label for="audio_${key}_33617">${label}</label><input id="audio_${key}_33617" type="range" min="0" max="100" value="${Math.round(value*100)}"><output id="audio_${key}_out33617">${Math.round(value*100)}%</output></div>`}
  function showSettings(){
    unlock();let o=document.getElementById('audioOverlay33617');if(o)o.remove();o=document.createElement('div');o.id='audioOverlay33617';o.className='audioOverlay33617';
    const options=[['auto','Auto — follow controlled Hero'],...Object.entries(AMBIENCE).map(([k,v])=>[k,v.label])].map(([k,l])=>`<option value="${k}" ${state.ambienceMode===k?'selected':''}>${l}</option>`).join('');
    o.innerHTML=`<div class="audioPanel33617 panel"><div class="audioHead33617"><div><div class="muted">ASCENDANCE AUDIO · 3.36.17</div><h2 style="margin:2px 0">Sound</h2></div><button id="audioClose33617">Close</button></div>
      <div class="audioChecks33617"><label><input id="audioEnabled33617" type="checkbox" ${state.enabled?'checked':''}> Sound enabled</label><label><input id="audioClicks33617" type="checkbox" ${state.uiClicks?'checked':''}> UI clicks</label><label><input id="audioAmbToggle33617" type="checkbox" ${state.ambienceEnabled?'checked':''}> Regional ambience</label></div>
      <div class="audioRegion33617"><label for="audioRegion33617">Ambience region</label><select id="audioRegion33617">${options}</select></div>
      <div id="audioNow33617" class="audioNow33617"></div>
      ${slider('Master','master',state.master)}${slider('Sound effects','sfx',state.sfx)}${slider('Ambience','ambience',state.ambience)}
      <div class="audioHint33617">This build includes custom bundled fantasy SFX and seven regional soundscapes. In Auto mode the ambience follows the controlled Hero's Location, with a dedicated underground soundscape for caves, mines, crypts, and tunnels. Audio remains device-local and does not affect multiplayer state.</div>
      <div class="audioActions33617"><button class="primary" id="audioTest33617">Play SFX Test</button><button id="audioPreview33617">Preview Current Region</button><button id="audioMute33617">${state.enabled?'Mute':'Unmute'}</button><button id="audioReset33617">Reset</button></div></div>`;
    document.body.appendChild(o);syncNowPlaying();o.querySelector('#audioClose33617').onclick=()=>o.remove();o.addEventListener('click',e=>{if(e.target===o)o.remove()});
    const enabled=o.querySelector('#audioEnabled33617'),clicks=o.querySelector('#audioClicks33617'),amb=o.querySelector('#audioAmbToggle33617'),region=o.querySelector('#audioRegion33617');
    enabled.onchange=()=>{state.enabled=enabled.checked;if(!state.enabled)stopAmbience();else if(state.ambienceEnabled)void updateAmbience(true);save()};clicks.onchange=()=>{state.uiClicks=clicks.checked;save()};amb.onchange=()=>{state.ambienceEnabled=amb.checked;if(state.ambienceEnabled)void unlock().then(()=>updateAmbience(true));else stopAmbience();save()};region.onchange=()=>{state.ambienceMode=region.value;save();if(state.ambienceEnabled)void unlock().then(()=>updateAmbience(true))};
    for(const k of ['master','sfx','ambience']){const input=o.querySelector(`#audio_${k}_33617`),out=o.querySelector(`#audio_${k}_out33617`);input.oninput=()=>{state[k]=clamp(Number(input.value)/100);out.textContent=Math.round(state[k]*100)+'%';syncGains();save()}}
    o.querySelector('#audioTest33617').onclick=async()=>{await unlock();['card','reveal','attack','hit','heal','reward','victory'].forEach((n,i)=>setTimeout(()=>play(n,{source:'test'}),i*440))};
    o.querySelector('#audioPreview33617').onclick=async()=>{await unlock();await updateAmbience(true)};o.querySelector('#audioMute33617').onclick=()=>{state.enabled=!state.enabled;if(!state.enabled)stopAmbience();save();showSettings()};o.querySelector('#audioReset33617').onclick=()=>{Object.assign(state,DEFAULTS);stopAmbience();save();showSettings()};
  }
  function installButton(){if(document.getElementById('audioBtn33617'))return;const old=document.getElementById('audioBtn33616');if(old)old.remove();const b=document.createElement('button');b.id='audioBtn33617';b.type='button';b.onclick=showSettings;const target=document.querySelector('#campaignHubBtn32538')?.parentElement||document.querySelector('#restart')?.parentElement||document.querySelector('.topbar')||document.body;target.appendChild(b);syncButton()}
  function installClicks(){if(document.documentElement.dataset.audioClicks33617)return;document.documentElement.dataset.audioClicks33617='1';document.addEventListener('pointerdown',()=>{void unlock()},{capture:true,passive:true});document.addEventListener('click',e=>{if(!state.enabled||!state.uiClicks)return;const el=e.target?.closest?.('button,[role="button"],.tab,.heroChip');if(!el||el.disabled)return;if(el.id==='audioTest33617')return;playThrottled('click',{source:'ui'})},true)}
  function wrapRender(){if(renderWrapped)return;try{if(typeof globalThis.render!=='function')return;const old=globalThis.render;if(old.__audio33617)return;const wrapped=function(){const out=old.apply(this,arguments);setTimeout(()=>{if(state.ambienceEnabled&&state.enabled)void updateAmbience(false)},0);return out};wrapped.__audio33617=true;wrapped.__previous=old;globalThis.render=wrapped;renderWrapped=true}catch(_){}}
  function buildMarker(){window.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;const e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}
  function boot(){injectStyle();installButton();installClicks();wrapLog();wrapRender();buildMarker();if(!regionTimer)regionTimer=setInterval(()=>{wrapLog();wrapRender();buildMarker();const r=requestedRegion();if(r!==lastRegionCheck){lastRegionCheck=r;if(state.ambienceEnabled&&state.enabled)void updateAmbience(false)}},1200);if(state.ambienceEnabled&&state.enabled&&ctx?.state==='running')void updateAmbience(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();[100,600,1800,4200,7600,9000,12000].forEach(ms=>setTimeout(()=>{boot();buildMarker()},ms));

  window.ascendanceAudio33617={
    build:V,state,history,assets:{sfx:{...SFX},ambience:Object.fromEntries(Object.entries(AMBIENCE).map(([k,v])=>[k,{...v}]))},play,playEvent:playThrottled,classify,unlock,showSettings,autoRegion,requestedRegion,regionLabel,updateAmbience,previewRegion,preloadSfx,
    setEnabled(v){state.enabled=!!v;if(!state.enabled)stopAmbience();else if(state.ambienceEnabled)void updateAmbience(true);save()},setAmbience(v){state.ambienceEnabled=!!v;if(v)void unlock().then(()=>updateAmbience(true));else stopAmbience();save()},setAmbienceMode(v){if(v!=='auto'&&!AMBIENCE[v])return false;state.ambienceMode=v;save();if(state.ambienceEnabled)void updateAmbience(true);return true},setVolume(k,v){if(!['master','sfx','ambience'].includes(k))return false;state[k]=clamp(v);save();return true},
    audit(){return {build:V,webAudio:!!AC(),context:ctx?.state||'not-created',enabled:state.enabled,master:state.master,sfx:state.sfx,ambience:state.ambience,ambienceEnabled:state.ambienceEnabled,ambienceMode:state.ambienceMode,requestedRegion:requestedRegion(),currentRegion:ambientCurrent?.key||null,currentRegionLabel:ambientCurrent?regionLabel(ambientCurrent.key):null,uiClicks:state.uiClicks,button:!!document.getElementById('audioBtn33617'),logWrapped:!!window.log?.__audio33617,assetCount:Object.keys(SFX).length+Object.keys(AMBIENCE).length,loadedAssets:[...bufferCache.keys()].length,events:history.slice(-16)}}
  };
})();
