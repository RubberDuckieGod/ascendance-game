/* Ascendance — Quest Cinematics and Briefings. Presentation only: never changes room state. */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else{root.ascQuestCinematicsRules1059=api;api.install(root);}
})(globalThis,function(){
 'use strict';
 const VERSION='1059-cinematics-1',STORAGE='ascendance-quest-cinematics-1059';
 const catalog=Object.freeze({
  Q001:Object.freeze({
   id:'Q001',event:'WE001 · Goblin Raids',title:'Defend Stonebrook',video:'/cinematics/Q001.mp4',duration:30,
   story:'Stonebrook comes under attack. Rescue villagers, extinguish fires, and discover the source of the assault.',
   objectives:['Defeat the Goblin Captain.','Rescue at least 2 of the 4 Villagers.','Keep Stonebrook below 5 Fire Tokens.'],
   mechanics:['Reveal Goblin Lookout (L006) to bring the Goblin Captain into play and change the reinforcement pattern.','Spend 1 Action to escort 1 Villager Token. Spend 1 Action to extinguish 1 Fire Token.','Goblins prioritize Villagers. Enemy numbers and reinforcement frequency scale with party size; the victory thresholds do not.'],
   failure:['All Heroes are defeated.','All Villagers are lost.','Stonebrook reaches 5 Fire Tokens.'],
   reward:'100 XP per eligible Hero, 75 Party Gold, 1 Common Equipment Card, and +1 General Reputation. Gain an additional 15 Gold if all 4 Villagers survive. Gold and other printed rewards follow the existing game rules and party-size scaling.',
   script:'Across the frontier, goblin tribes attack farms, caravans, and villages. Refugees crowd the roads, while local lords struggle to protect their people. These attacks are not random. Someone is coordinating the raids. Unless they are stopped, the kingdom faces an invasion. Your journey begins in Stonebrook. The frontier needs heroes. It needs you.'
  })
 });
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
 const qid=g=>String(g?.campaign?.currentQuest||'');
 const campaignKey=(g,room='')=>String(g?.campaign?.instanceId32537||g?.campaign?.createdAt32537||(room?'room:'+room:'legacy'));
 const completedAttempts=(g,q)=>Array.isArray(g?.campaign?.history)?g.campaign.history.filter(x=>x?.quest===q&&['Completed','Failed','Retreated','Abandoned'].includes(x.outcome)).length:0;
 function describe(g,room=''){
  if(!g?.campaign||!qid(g))return null;
  const q=qid(g),campaign=campaignKey(g,room),n=completedAttempts(g,q),day=Number(g.campaign.day||0);
  return {quest:q,campaign,attempt:n,day,key:JSON.stringify([campaign,q,n,day]),active:!g.campaign.downtime&&!g.campaign.campaignEnded&&!['Completed','Failed','Retreated','Unavailable','Abandoned'].includes(g.campaign.questStatus?.[q]),round:Number(g.round||1)};
 }
 function createController(storage){
  let data={attempts:{},seen:{}},previous=null;
  try{const parsed=JSON.parse(storage?.getItem(STORAGE)||'null');if(parsed&&typeof parsed==='object'){if(parsed.attempts&&typeof parsed.attempts==='object')data.attempts=parsed.attempts;if(parsed.seen&&typeof parsed.seen==='object')data.seen=parsed.seen}}catch(_){}
  function save(){try{const rows=Object.entries(data.attempts).slice(-300);data.attempts=Object.fromEntries(rows);storage?.setItem(STORAGE,JSON.stringify(data))}catch(_){}}
  function record(desc,outcome){if(!desc||!own(catalog,desc.quest)||!['watched','skipped'].includes(outcome))return false;data.attempts[desc.key]=outcome;data.seen[desc.quest]=true;save();return true}
  function offer(desc){return desc&&desc.active&&desc.round===1&&own(catalog,desc.quest)&&!own(data.attempts,desc.key)?{...desc,repeating:desc.attempt>0||data.seen[desc.quest]===true}:null}
  function observe(g,{kind='observe',room=''}={}){
   const next=describe(g,room),prior=previous;previous=next;
   if(!next||kind==='resume')return null;
   if(kind==='begin')return offer(next);
   if(prior&&prior.campaign===next.campaign&&(prior.key!==next.key||!prior.active&&next.active))return offer(next);
   return null;
  }
  function library(g){const history=Array.isArray(g?.campaign?.history)?g.campaign.history:[];return Object.values(catalog).filter(x=>qid(g)===x.id||history.some(h=>h.quest===x.id)||data.seen[x.id]===true)}
  return {observe,record,library,seen:q=>data.seen[q]===true,wasHandled:key=>own(data.attempts,key),resetObservation(){previous=null}};
 }
 function install(w){
  if(w.ascQuestCinematics1059)return;
  const d=w.document;if(!d?.body)return;
  let storage;try{storage=w.localStorage}catch(_){}
  const controller=createController(storage);
  const game=()=>{try{return typeof g==='undefined'?null:g}catch(_){return null}};
  const room=()=>{try{return typeof mpMode!=='undefined'&&mpMode==='remote'&&typeof mpRoom!=='undefined'?String(mpRoom||''):''}catch(_){return ''}};
  const by=id=>d.getElementById(id);
  const isHidden=el=>!el||el.classList.contains('hidden')||el.style.display==='none';
  const menuVisible=()=>!isHidden(by('gameLobby'));
  const inAdventure=()=>!menuVisible()&&(!room()||d.body.dataset.ascAdventureActive==='1');
  let waitingRemote=false,scheduled=false,queuedKind='observe',modal=null,video=null,presentation=null,loadTimer=null,opening=null;
  let media={known:false,entries:{}};
  const make=(tag,text,cls)=>{const e=d.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
  function button(label,fn,primary=false){const e=make('button',label,primary?'primary':'');e.type='button';e.onclick=fn;return e}
  function setAudio(on){w.ascendanceAudio33617?.setCinematicActive?.(!!on)}
  function refreshMedia(){
   if(media.promise)return media.promise;
   media.promise=w.fetch('/api/quest-cinematics',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('media manifest unavailable');return r.json()}).then(x=>{media={known:true,entries:x.entries||{}};return media}).catch(()=>{media={known:true,entries:{}};return media});
   return media.promise;
  }
  function releaseVideo(){
   clearTimeout(loadTimer);loadTimer=null;
   if(video){try{video.pause();video.removeAttribute('src');video.load()}catch(_){}video=null}
   setAudio(false);
  }
  function close(){
   releaseVideo();opening=null;presentation=null;
   if(modal?.open)modal.close();if(modal){modal.remove();modal=null}
  }
  function style(){
   if(by('questCinematicsStyle1059'))return;
   const el=make('style');el.id='questCinematicsStyle1059';
   el.textContent='#questCinematics1059{box-sizing:border-box;width:min(880px,calc(100% - 28px));max-width:880px;max-height:calc(100dvh - 28px);overflow:auto;padding:0;color:#efe8d9;background:#151a1c;border:1px solid #8a7144;border-radius:13px;box-shadow:0 24px 90px #000c;font:inherit}#questCinematics1059::backdrop{background:#030506d9}#questCinematics1059 .qcBody{padding:clamp(15px,3vw,26px)}#questCinematics1059 h2{margin:.25em 0 .5em;font-size:clamp(21px,3.3vw,30px);color:#e2c188}#questCinematics1059 h3{font-size:15px;margin:16px 0 6px;color:#e2c188}#questCinematics1059 p,#questCinematics1059 li{line-height:1.48}#questCinematics1059 ul{margin:0;padding-left:22px}#questCinematics1059 video{width:100%;max-height:60dvh;background:#000;border-radius:7px;display:block;aspect-ratio:16/9}#questCinematics1059 .qcActions{display:flex;justify-content:flex-end;gap:9px;flex-wrap:wrap;margin-top:17px}#questCinematics1059 .qcNote{font-size:13px;opacity:.86;margin:8px 0}#questCinematics1059 .qcLibraryRow{padding:10px;border:1px solid #544b36;border-radius:8px;margin:8px 0;display:flex;align-items:center;gap:10px;justify-content:space-between}#questCinematicsButtons1059{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0}';
   d.head.appendChild(el);
  }
  function shell(){
   style();if(!modal){modal=make('dialog');modal.id='questCinematics1059';modal.setAttribute('aria-labelledby','questCinematicTitle1059');
    modal.addEventListener('cancel',e=>{e.preventDefault();if(presentation?.stage==='video')finishVideo('skipped');else if(presentation?.automatic&&presentation.stage==='briefing')close();else close()});
    d.body.appendChild(modal);
   }
   if(!modal.open)modal.showModal();
   const body=make('div',undefined,'qcBody');modal.replaceChildren(body);return body;
  }
  function heading(body,entry){body.append(make('div',entry.event,'qcNote'));const h=make('h2',entry.title);h.id='questCinematicTitle1059';body.append(h)}
  function section(body,title,items){body.append(make('h3',title));const ul=make('ul');for(const item of items)ul.append(make('li',item));body.append(ul)}
  function finishVideo(outcome){
   if(!presentation||presentation.stage!=='video')return;
   const p=presentation;releaseVideo();
   if(p.automatic&&p.desc)controller.record(p.desc,outcome);
   showBriefing(p.entry,p.automatic,p.desc);
  }
  function showBriefing(entry,automatic=false,desc=null){
   releaseVideo();presentation={entry,automatic,desc,stage:'briefing'};
   const body=shell();heading(body,entry);body.append(make('p',entry.story));
   section(body,'Objectives — complete all three',entry.objectives);
   section(body,'Quest mechanics',entry.mechanics);
   section(body,'Failure conditions',entry.failure);
   body.append(make('h3','Quest rewards'),make('p',entry.reward));
   const row=make('div',undefined,'qcActions');
   row.append(button('Replay cinematic',()=>showVideo(entry,automatic,desc,true)),button(automatic?'Begin Quest':'Return to game',close,true));
   body.append(row);
  }
  function showVideo(entry,automatic=false,desc=null,replay=false){
   releaseVideo();presentation={entry,automatic,desc,stage:'video'};
   const body=shell();heading(body,entry);
   const note=make('p',desc?.repeating?'You have seen this Quest before. Watch again or skip to the objectives.':'Watch the cinematic before reviewing the Quest objectives.','qcNote');
   body.append(note);
   const v=make('video');video=v;v.controls=true;v.playsInline=true;v.preload='metadata';v.setAttribute('aria-label',entry.title+' cinematic');v.src=entry.video+'?v='+VERSION;
   const status=make('p','Loading cinematic…','qcNote');status.setAttribute('role','status');
   const row=make('div',undefined,'qcActions');
   const play=button('Play cinematic',()=>{setAudio(true);Promise.resolve(v.play()).catch(()=>{status.textContent='Playback did not start. Use the video controls or continue to the objectives.';setAudio(false)})},true);
   const skip=button(desc?.repeating?'Skip cinematic — objectives':'Continue to objectives',()=>finishVideo('skipped'));
   const retry=button('Retry video',()=>showVideo(entry,automatic,desc,true));retry.hidden=true;
   row.append(play,skip,retry);
   const transcript=make('details');transcript.append(make('summary','Narration script'),make('p',entry.script));
   body.append(v,status,row,transcript);
   const still=()=>video===v&&presentation?.stage==='video';
   v.addEventListener('playing',()=>{if(!still())return;clearTimeout(loadTimer);setAudio(true);status.textContent='Playing cinematic';play.hidden=true;retry.hidden=true});
   v.addEventListener('pause',()=>{if(still()&&!v.ended){setAudio(false);play.hidden=false;status.textContent='Paused — resume or continue to objectives.'}});
   v.addEventListener('canplay',()=>{if(still()&&v.paused){clearTimeout(loadTimer);status.textContent='Ready — select Play if your browser blocks automatic audio.'}});
   v.addEventListener('ended',()=>{if(still())finishVideo('watched')});
   const unavailable=()=>{if(!still())return;clearTimeout(loadTimer);setAudio(false);status.textContent='Video is unavailable right now. Retry or continue to the Quest objectives.';retry.hidden=false;play.hidden=true};
   v.addEventListener('error',unavailable);
   loadTimer=setTimeout(unavailable,15000);
   // A user-initiated replay can start with sound. Browsers may block autoplay
   // following a remote event; the real Play button is the reliable fallback.
   setAudio(true);
   try{Promise.resolve(v.play()).catch(()=>{if(still()&&!v.error){setAudio(false);status.textContent='Select Play cinematic to start with sound, or continue to objectives.';play.hidden=false}})}catch(_){unavailable()}
  }
  function openLibrary(){
   releaseVideo();presentation={stage:'library'};
   const body=shell();body.append(make('div','ASCENDANCE · STORY ARCHIVE','qcNote'));const h=make('h2','Quest cinematics');h.id='questCinematicTitle1059';body.append(h);
   const rows=controller.library(game());
   if(!rows.length)body.append(make('p','No Quest cinematics have been unlocked yet.'));
   for(const entry of rows){
    const row=make('div',undefined,'qcLibraryRow'),title=make('div');title.append(make('strong',entry.id+' — '+entry.title),make('div',entry.event+' · '+entry.duration+' sec','qcNote'));
    const actions=make('div',undefined,'qcActions');actions.append(button('Watch',()=>showVideo(entry)),button('Objectives',()=>showBriefing(entry)));
    row.append(title,actions);body.append(row);
   }
   const actions=make('div',undefined,'qcActions');actions.append(button('Return to game',close,true));body.append(actions);
  }
  function installButtons(){
   const panel=by('questObjectivePanel');if(!panel)return;
   const entries=controller.library(game()),entry=catalog[qid(game())];
   let row=by('questCinematicsButtons1059');if(!row){row=make('div');row.id='questCinematicsButtons1059';panel.append(row)}
   row.replaceChildren();
   if(entry){row.append(button('Replay quest cinematic',()=>showVideo(entry)),button('Quest briefing',()=>showBriefing(entry)))}
   if(entries.length)row.append(button('Quest cinematics',openLibrary));
   row.hidden=!entries.length&&!entry;
  }
  function autoOffer(desc){
   if(!desc||opening===desc.key||presentation?.automatic&&presentation.desc?.key===desc.key)return;
   opening=desc.key;
   // Do not lock unrelated fixtures or older deployments with no published
   // cinematic. Once published, an unavailable video still offers the briefing.
   refreshMedia().then(info=>{
    const now=describe(game(),room());
    if(opening!==desc.key||!inAdventure()||!now?.active||now.key!==desc.key||now.round!==1||controller.wasHandled(desc.key)){if(opening===desc.key)opening=null;return}
    opening=null;const m=info.entries[desc.quest];if(!m?.configured&&!m?.available)return;
    if(presentation)close();
    showVideo(catalog[desc.quest],true,desc);
   });
  }
  function scan(kind='observe'){
   installButtons();
   if(waitingRemote||!inAdventure())return;
   const current=describe(game(),room());
   if(presentation?.automatic&&presentation.desc&&current?.key!==presentation.desc.key)close();
   const next=controller.observe(game(),{kind,room:room()});
   if(next)autoOffer(next);
  }
  function schedule(kind='observe'){
   if(kind!=='observe')queuedKind=kind;
   if(scheduled)return;scheduled=true;
   queueMicrotask(()=>{scheduled=false;const k=queuedKind;queuedKind='observe';scan(k)});
  }
  // Real new adventure, not init(), which is also used by save restores and
  // speculative Quest transitions. Observe only the committed state.
  const begin=w.lobbyBeginNew;
  if(typeof begin==='function')w.lobbyBeginNew=function(){
   const before=campaignKey(game(),room()),mode=by('lobbyNewMode')?.value||'solo';
   waitingRemote=mode==='remote';
   const out=begin.apply(this,arguments);
   const changed=campaignKey(game(),room())!==before;
   if(!changed){waitingRemote=false;return out}
   close();controller.resetObservation();
   if(mode!=='remote'){waitingRemote=false;schedule('begin')}
   return out;
  };
  for(const name of ['lobbyJoinGame','lobbyLoadServerRoom']){
   const prev=w[name];if(typeof prev==='function')w[name]=function(){close();controller.resetObservation();waitingRemote=true;return prev.apply(this,arguments)};
  }
  const apply=w.applySerializedGameState;
  if(typeof apply==='function')w.applySerializedGameState=function(){
   const loadingLocal=!room()&&menuVisible();const out=apply.apply(this,arguments);
   if(loadingLocal){waitingRemote=false;close();schedule('resume')}
   return out;
  };
  const receive=w.mpHandleMessage;
  if(typeof receive==='function')w.mpHandleMessage=function(m){
   const mine=!!room()&&m?.room===room(),start=mine&&m.type==='ADVENTURE_START',resume=mine&&m.type==='ADVENTURE_RESUME';
   const out=receive.apply(this,arguments);
   if(start||resume){waitingRemote=false;schedule(resume?'resume':'begin')}
   else if(mine&&['QUEST_TRANSITION_ACK_33626','QUEST_TRANSITION_STATE_33626','ROOM_STATE','STATE'].includes(m.type))schedule();
   return out;
  };
  const render=w.render;
  if(typeof render==='function')w.render=function(){const out=render.apply(this,arguments);schedule();return out};
  w.ascQuestCinematics1059={version:VERSION,openLibrary,replay:q=>{if(own(catalog,q))showVideo(catalog[q])},briefing:q=>{if(own(catalog,q))showBriefing(catalog[q])},observe:()=>schedule(),close,state:()=>({stage:presentation?.stage||null,quest:presentation?.entry?.id||null,automatic:!!presentation?.automatic,available:media.entries,opening})};
  // Menu state may change outside render. Local media presentation must never
  // survive a return to the menu or consume game Actions.
  const menu=by('gameLobby');if(menu&&typeof MutationObserver==='function')new MutationObserver(()=>{if(menuVisible())close();else schedule()}).observe(menu,{attributes:true,attributeFilter:['class','style']});
  refreshMedia();schedule('resume');
 }
 return {VERSION,catalog,describe,createController,install};
});
