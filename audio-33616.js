// Ascendance 3.36.16 — Web Audio Sound Foundation
// Procedural SFX + optional ambience. No external audio files required.
(()=>{
  'use strict';
  const V='3.36.16';
  const KEY='ascendance-audio-settings-v1';
  const DEFAULTS={enabled:true,master:.70,sfx:.78,ambience:.22,ambienceEnabled:false,uiClicks:true};
  const state={...DEFAULTS};
  const history=[];
  let ctx=null,masterGain=null,sfxGain=null,ambGain=null;
  let ambientNodes=[];
  let lastEvent='',lastEventAt=0;

  function clamp(n,a=0,b=1){n=Number(n);return Number.isFinite(n)?Math.max(a,Math.min(b,n)):a}
  function load(){try{Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){} state.master=clamp(state.master);state.sfx=clamp(state.sfx);state.ambience=clamp(state.ambience);state.enabled=state.enabled!==false;state.ambienceEnabled=!!state.ambienceEnabled;state.uiClicks=state.uiClicks!==false}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(_){} syncGains();syncButton();}
  load();

  function AC(){return window.AudioContext||window.webkitAudioContext}
  function ensure(){
    if(ctx)return ctx;
    const C=AC(); if(!C)return null;
    try{
      ctx=new C();
      masterGain=ctx.createGain();sfxGain=ctx.createGain();ambGain=ctx.createGain();
      sfxGain.connect(masterGain);ambGain.connect(masterGain);masterGain.connect(ctx.destination);
      syncGains();
      return ctx;
    }catch(_){return null}
  }
  function syncGains(){if(!masterGain)return;const now=ctx?.currentTime||0;masterGain.gain.setTargetAtTime(state.enabled?state.master:0,now,.015);sfxGain.gain.setTargetAtTime(state.sfx,now,.015);ambGain.gain.setTargetAtTime(state.ambience,now,.05)}
  async function unlock(){const c=ensure();if(!c)return false;try{if(c.state==='suspended')await c.resume()}catch(_){}if(state.ambienceEnabled&&state.enabled)startAmbience();return c.state==='running'}

  function record(name,detail={}){history.push({name,at:Date.now(),...detail});if(history.length>100)history.shift()}
  function gainNode(value,dest=sfxGain){const g=ctx.createGain();g.gain.value=value;g.connect(dest);return g}
  function osc({freq=440,to=null,duration=.12,type='sine',gain=.08,delay=0,dest=sfxGain}){
    if(!ctx||ctx.state!=='running')return;
    const t=ctx.currentTime+delay,o=ctx.createOscillator(),g=gainNode(gain,dest);
    o.type=type;o.frequency.setValueAtTime(Math.max(20,freq),t);
    if(to)o.frequency.exponentialRampToValueAtTime(Math.max(20,to),t+duration);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);o.start(t);o.stop(t+duration+.02);
  }
  function noise({duration=.10,gain=.05,delay=0,highpass=0,lowpass=0,dest=sfxGain}){
    if(!ctx||ctx.state!=='running')return;
    const len=Math.max(1,Math.floor(ctx.sampleRate*duration)),buf=ctx.createBuffer(1,len,ctx.sampleRate),data=buf.getChannelData(0);
    for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);
    const src=ctx.createBufferSource();src.buffer=buf;let node=src;
    if(highpass){const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=highpass;node.connect(f);node=f}
    if(lowpass){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=lowpass;node.connect(f);node=f}
    const g=gainNode(gain,dest),t=ctx.currentTime+delay;node.connect(g);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);src.start(t);src.stop(t+duration+.01);
  }
  function chord(notes,d=.14,g=.035,type='sine',step=.045){notes.forEach((n,i)=>osc({freq:n,duration:d,type,gain:g,delay:i*step}))}

  const sounds={
    click(){osc({freq:520,to:430,duration:.035,type:'triangle',gain:.025})},
    card(){noise({duration:.07,gain:.026,highpass:900});osc({freq:760,to:980,duration:.06,type:'triangle',gain:.018,delay:.02})},
    discard(){noise({duration:.08,gain:.03,highpass:600});osc({freq:430,to:250,duration:.08,type:'triangle',gain:.022})},
    attack(){noise({duration:.085,gain:.06,highpass:120});osc({freq:180,to:62,duration:.11,type:'sawtooth',gain:.065})},
    enemy(){noise({duration:.12,gain:.055,lowpass:850});osc({freq:120,to:72,duration:.16,type:'square',gain:.045})},
    hit(){noise({duration:.10,gain:.07,lowpass:1200});osc({freq:92,to:48,duration:.095,type:'triangle',gain:.07})},
    heal(){chord([523.25,659.25,783.99],.16,.035,'sine',.055)},
    reveal(){chord([392,523.25,659.25],.17,.034,'triangle',.06)},
    explore(){noise({duration:.11,gain:.018,highpass:1200});chord([293.66,392],.12,.025,'triangle',.05)},
    search(){noise({duration:.09,gain:.025,highpass:700});osc({freq:620,to:820,duration:.095,type:'triangle',gain:.025})},
    reward(){chord([659.25,830.61,1046.5],.13,.032,'sine',.045)},
    phase(){chord([261.63,392],.16,.028,'triangle',.08)},
    defeat(){osc({freq:150,to:52,duration:.32,type:'sawtooth',gain:.055});noise({duration:.24,gain:.035,lowpass:700})},
    victory(){chord([523.25,659.25,783.99,1046.5],.28,.045,'triangle',.09)},
    fail(){[329.63,277.18,220].forEach((n,i)=>osc({freq:n,to:n*.92,duration:.28,type:'triangle',gain:.038,delay:i*.10}))},
    status(){osc({freq:700,to:530,duration:.08,type:'sine',gain:.025})},
    warning(){osc({freq:220,duration:.09,type:'square',gain:.025});osc({freq:220,duration:.09,type:'square',gain:.025,delay:.13})}
  };

  async function play(name,opts={}){
    if(!state.enabled)return false;
    const fn=sounds[name];if(!fn)return false;
    record(name,opts);
    const ok=await unlock();if(!ok)return false;
    try{fn(opts);return true}catch(_){return false}
  }
  function playThrottled(name,detail={}){
    const now=Date.now();if(name===lastEvent&&now-lastEventAt<80)return false;lastEvent=name;lastEventAt=now;void play(name,detail);return true;
  }

  function classify(text){
    const s=String(text||''),u=s.toUpperCase();
    if(/^\d+\.\d+\.\d+\s/.test(s))return null;
    if(/QUEST (COMPLETE|COMPLETED)|VICTORY|ADVENTURE WON|CAMPAIGN COMPLETE/.test(u))return 'victory';
    if(/QUEST (FAIL|FAILED)|DEFEAT|GAME OVER|HERO LOST/.test(u))return 'fail';
    if(/ IS DOWNED| IS DEFEATED|ENEMY DEFEATED|DEFEATS /.test(u))return 'defeat';
    if(/ENEMY ATTACK|GOBLIN .*ATTACK|WORLD PHASE/.test(u))return u.includes('WORLD PHASE')?'phase':'enemy';
    if(/\bATTACK\b/.test(u))return 'attack';
    if(/SUFFERS? \d+|TAKES? \d+|DAMAGE —|DAMAGE:/.test(u))return 'hit';
    if(/RECOVERS? .*HEALTH|HEAL|RESTORE.*HEALTH/.test(u))return 'heal';
    if(/REVEAL EFFECT|LOCATION REVEAL|REVEALED LOCATION|REVEAL —/.test(u))return 'reveal';
    if(/^EXPLORE| EXPLORE|PLACED LOCATION/.test(u))return 'explore';
    if(/^SEARCH|SEARCH CARD|FREE SEARCH/.test(u))return 'search';
    if(/\bDRAW\b.*CARD|DRAWS? \d+.*CARD/.test(u))return 'card';
    if(/DISCARD/.test(u))return 'discard';
    if(/LOOT|GAINS? \d+ GOLD|\+\d+ GOLD|SUPPLY|REWARD/.test(u))return 'reward';
    if(/GAINS? (INSPIRED|GUARDED|STEALTH|HIDDEN)|STATUS/.test(u))return 'status';
    if(/WARNING|ALERT/.test(u))return 'warning';
    if(/HERO PHASE|END PHASE|ROUND \d+/.test(u))return 'phase';
    return null;
  }

  function wrapLog(){
    if(typeof window.log!=='function'||window.log.__audio33616)return false;
    const prev=window.log;
    function wrapped(x){const out=prev.apply(this,arguments);const ev=classify(x);if(ev)playThrottled(ev,{source:'log',text:String(x).slice(0,180)});return out}
    wrapped.__audio33616=true;wrapped.__previous=prev;window.log=wrapped;return true;
  }

  function startAmbience(){
    if(!state.enabled||!state.ambienceEnabled)return;
    if(ambientNodes.length)return;
    const c=ensure();if(!c||c.state!=='running')return;
    const base=ctx.currentTime;
    [55,82.41,110].forEach((f,i)=>{
      const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===1?'triangle':'sine';o.frequency.value=f;
      g.gain.value=[.025,.012,.008][i];o.connect(g);g.connect(ambGain);o.start(base);ambientNodes.push(o,g);
    });
    const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.08;lg.gain.value=.009;lfo.connect(lg);lg.connect(ambGain.gain);lfo.start(base);ambientNodes.push(lfo,lg);
    record('ambience-start');
  }
  function stopAmbience(){for(const n of ambientNodes){try{if(typeof n.stop==='function')n.stop()}catch(_){}try{n.disconnect?.()}catch(_){}}ambientNodes=[];record('ambience-stop')}

  function injectStyle(){if(document.getElementById('audioStyle33616'))return;const st=document.createElement('style');st.id='audioStyle33616';st.textContent=`
#audioBtn33616{white-space:nowrap}.audioOverlay33616{position:fixed;inset:0;z-index:12050;background:rgba(2,5,10,.88);display:flex;align-items:center;justify-content:center;padding:16px}.audioPanel33616{width:min(520px,96vw);max-height:88vh;overflow:auto;background:#111923;border:1px solid #40536b;border-radius:14px;padding:18px;box-shadow:0 20px 80px #000a}.audioHead33616{display:flex;align-items:center;justify-content:space-between;gap:12px}.audioRow33616{display:grid;grid-template-columns:140px 1fr 52px;align-items:center;gap:10px;margin:14px 0}.audioRow33616 input[type=range]{width:100%}.audioChecks33616{display:flex;gap:16px;flex-wrap:wrap;margin:12px 0}.audioActions33616{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.audioHint33616{font-size:.9em;opacity:.72;line-height:1.4}@media(max-width:650px){.audioRow33616{grid-template-columns:110px 1fr 44px}.audioPanel33616{padding:14px}}
`;document.head.appendChild(st)}
  function syncButton(){const b=document.getElementById('audioBtn33616');if(b){b.textContent=state.enabled?'🔊 Sound':'🔇 Sound';b.title=state.enabled?'Sound settings':'Sound is muted — open settings'}}
  function showSettings(){
    unlock();
    let o=document.getElementById('audioOverlay33616');if(o)o.remove();
    o=document.createElement('div');o.id='audioOverlay33616';o.className='audioOverlay33616';
    o.innerHTML=`<div class="audioPanel33616 panel"><div class="audioHead33616"><div><div class="muted">ASCENDANCE AUDIO</div><h2 style="margin:2px 0">Sound</h2></div><button id="audioClose33616">Close</button></div>
      <div class="audioChecks33616"><label><input id="audioEnabled33616" type="checkbox" ${state.enabled?'checked':''}> Sound enabled</label><label><input id="audioClicks33616" type="checkbox" ${state.uiClicks?'checked':''}> UI clicks</label><label><input id="audioAmbToggle33616" type="checkbox" ${state.ambienceEnabled?'checked':''}> Ambient drone</label></div>
      ${slider('Master','master',state.master)}${slider('Sound effects','sfx',state.sfx)}${slider('Ambience','ambience',state.ambience)}
      <div class="audioHint33616">Sound effects are generated in the browser with the Web Audio API, so this build needs no external audio files. Browsers require one tap/click before audio can start. Settings are saved on this device.</div>
      <div class="audioActions33616"><button class="primary" id="audioTest33616">Play Test Sounds</button><button id="audioMute33616">${state.enabled?'Mute':'Unmute'}</button><button id="audioReset33616">Reset Levels</button></div></div>`;
    document.body.appendChild(o);
    o.querySelector('#audioClose33616').onclick=()=>o.remove();
    o.addEventListener('click',e=>{if(e.target===o)o.remove()});
    const enabled=o.querySelector('#audioEnabled33616'),clicks=o.querySelector('#audioClicks33616'),amb=o.querySelector('#audioAmbToggle33616');
    enabled.onchange=()=>{state.enabled=enabled.checked;if(!state.enabled)stopAmbience();else if(state.ambienceEnabled)startAmbience();save()};
    clicks.onchange=()=>{state.uiClicks=clicks.checked;save()};
    amb.onchange=()=>{state.ambienceEnabled=amb.checked;if(state.ambienceEnabled)startAmbience();else stopAmbience();save()};
    for(const k of ['master','sfx','ambience']){const input=o.querySelector(`#audio_${k}_33616`),out=o.querySelector(`#audio_${k}_out33616`);input.oninput=()=>{state[k]=clamp(Number(input.value)/100);out.textContent=Math.round(state[k]*100)+'%';syncGains();save()}}
    o.querySelector('#audioTest33616').onclick=async()=>{await unlock();['card','reveal','attack','hit','heal','reward','victory'].forEach((n,i)=>setTimeout(()=>play(n,{source:'test'}),i*260))};
    o.querySelector('#audioMute33616').onclick=()=>{state.enabled=!state.enabled;if(!state.enabled)stopAmbience();save();showSettings()};
    o.querySelector('#audioReset33616').onclick=()=>{Object.assign(state,DEFAULTS);stopAmbience();save();showSettings()};
  }
  function slider(label,key,value){return `<div class="audioRow33616"><label for="audio_${key}_33616">${label}</label><input id="audio_${key}_33616" type="range" min="0" max="100" value="${Math.round(value*100)}"><output id="audio_${key}_out33616">${Math.round(value*100)}%</output></div>`}

  function installButton(){
    if(document.getElementById('audioBtn33616'))return;
    const b=document.createElement('button');b.id='audioBtn33616';b.type='button';b.onclick=showSettings;
    const target=document.querySelector('#campaignHubBtn32538')?.parentElement||document.querySelector('#restart')?.parentElement||document.querySelector('.topbar')||document.body;
    target.appendChild(b);syncButton();
  }

  function installClicks(){
    if(document.documentElement.dataset.audioClicks33616)return;document.documentElement.dataset.audioClicks33616='1';
    document.addEventListener('pointerdown',()=>{void unlock()},{capture:true,passive:true});
    document.addEventListener('click',e=>{if(!state.enabled||!state.uiClicks)return;const el=e.target?.closest?.('button,[role="button"],.tab,.heroChip');if(!el||el.disabled)return;if(el.id==='audioTest33616')return;playThrottled('click',{source:'ui'})},true);
  }

  function buildMarker(){window.ASCENDANCE_BUILD=V;document.documentElement.dataset.ascendanceBuild=V;const e=document.querySelector('.frontVersion32714');if(e)e.textContent='v'+V}
  function boot(){injectStyle();installButton();installClicks();wrapLog();buildMarker();if(state.ambienceEnabled&&state.enabled&&ctx?.state==='running')startAmbience()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  [100,600,1800,4200,7600,9000,12000].forEach(ms=>setTimeout(()=>{boot();buildMarker()},ms));

  window.ascendanceAudio33616={
    build:V,state,history,play,playEvent:playThrottled,classify,unlock,showSettings,
    setEnabled(v){state.enabled=!!v;if(!state.enabled)stopAmbience();save()},
    setAmbience(v){state.ambienceEnabled=!!v;if(v)startAmbience();else stopAmbience();save()},
    setVolume(k,v){if(!['master','sfx','ambience'].includes(k))return false;state[k]=clamp(v);save();return true},
    audit(){return {build:V,webAudio:!!AC(),context:ctx?.state||'not-created',enabled:state.enabled,master:state.master,sfx:state.sfx,ambience:state.ambience,ambienceEnabled:state.ambienceEnabled,uiClicks:state.uiClicks,button:!!document.getElementById('audioBtn33616'),logWrapped:!!window.log?.__audio33616,events:history.slice(-12)}}
  };
})();
