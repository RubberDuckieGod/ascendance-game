const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');
const fs=require('fs');

const app=express();
app.use(express.static(path.join(__dirname,'public'),{etag:false,lastModified:false,setHeaders:(res)=>{res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0')}}));
const server=http.createServer(app);
const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();
const debugEvents=[];
function debugEvent(kind,detail={}){debugEvents.push({at:new Date().toISOString(),kind,...detail});if(debugEvents.length>500)debugEvents.shift()}
app.get('/api/debug/events',(req,res)=>res.json({version:'3.27.4-debug',events:debugEvents.slice(-300)}));

const DATA_DIR=process.env.ASCENDANCE_DATA_DIR || '/var/data/ascendance';
const persistenceEnabled=(()=>{try{fs.mkdirSync(DATA_DIR,{recursive:true});fs.accessSync(DATA_DIR,fs.constants.W_OK);return true}catch(e){console.warn(`Persistent room saves unavailable at ${DATA_DIR}: ${e.message}`);return false}})();
function safeRoomName(name){return String(name).trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,64)}
function roomFile(name){return path.join(DATA_DIR,`${safeRoomName(name)}.json`)}
function persistLog(message){console.log(`[PERSIST] ${message}`);debugEvent('SERVER',{message})}
function loadRoomState(name){
 if(!persistenceEnabled){persistLog(`LOAD ${name} -> persistence disabled`);return null}
 const f=roomFile(name);persistLog(`LOAD ${name} -> ${f}`);
 try{if(!fs.existsSync(f)){persistLog(`LOAD ${name} -> NOT FOUND`);return null}const raw=fs.readFileSync(f,'utf8');const saved=JSON.parse(raw);const state=saved&&saved.state?saved.state:null;persistLog(`LOAD ${name} -> ${state?'FOUND':'INVALID'} (${raw.length} bytes)`);return state}catch(e){console.warn(`[PERSIST] LOAD ${name} -> ERROR: ${e.message}`);return null}
}
function saveRoomState(name,state){
 if(!persistenceEnabled||!state)return;const f=roomFile(name),tmp=f+'.tmp';
 try{const raw=JSON.stringify({room:name,savedAt:new Date().toISOString(),state});fs.writeFileSync(tmp,raw,'utf8');fs.renameSync(tmp,f);persistLog(`SAVE ${name} -> ${f} (${raw.length} bytes)`)}catch(e){console.warn(`[PERSIST] SAVE ${name} -> ERROR: ${e.message}`)}
}
function room(name){if(!rooms.has(name))rooms.set(name,{clients:new Set(),latestState:null,host:null,revision:0});return rooms.get(name)}
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj))}

function shuffleCopy(arr){
 const a=arr.slice();
 for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
function buildCustomDeck(def){
 const out=[];
 for(const x of (def?.deck||[])){
   const copies=Math.max(0,Number(x?.copies||1));
   for(let i=0;i<copies;i++)out.push({
     id:x.id,copies,hero:def.name,name:x.name||x.id,category:x.category||'Card',cost:Number(x.cost||0),
     speed:x.speed||'Action',range:x.range||x['Target Range']||'Self',target:x.target||x.Target||'Self',
     traits:x.traits||'',keywords:x.keywords||'',rules:x.rules||'',flavor:x.flavor||'',uid:`${x.id}-${i}`,impl:(x.speed||'Action')==='Action'
   });
 }
 return shuffleCopy(out);
}
function ensureCustomHeroInRoomState(r, role, def){
 if(!r?.latestState?.game||!def?.id||def.id!==role)return false;
 const g=r.latestState.game;
 g.customHeroDefinitions32624=g.customHeroDefinitions32624||{};
 g.customHeroDefinitions32616=g.customHeroDefinitions32616||{};
 g.customHeroDefinitions32615=g.customHeroDefinitions32615||{};
 g.customHeroDefinitions32624[role]=def;
 g.customHeroDefinitions32616[role]=def;
 g.customHeroDefinitions32615[role]=def;
 g.partyHeroes=Array.isArray(g.partyHeroes)?g.partyHeroes:[];
 g.extraHeroes=g.extraHeroes||{};g.inventory=g.inventory||{};g.equipped=g.equipped||{};g.xp=g.xp||{};g.levels=g.levels||{};
 g.campaignRoster32534=Array.isArray(g.campaignRoster32534)?g.campaignRoster32534:[];
 const isNew=!g.partyHeroes.includes(role);
 if(!g.partyHeroes.includes(role))g.partyHeroes.push(role);
 if(!g.campaignRoster32534.includes(role))g.campaignRoster32534.push(role);
 if(g.campaign)g.campaign.roster=[...g.campaignRoster32534];
 let st=g.extraHeroes[role];
 if(!st){
   const deck=buildCustomDeck(def),hand=deck.splice(0,5);
   st=g.extraHeroes[role]={name:def.name,hp:Number(def.maxHp||9),maxHp:Number(def.maxHp||9),actions:3,x:0,y:0,conditions:[],difficultPrepared:false,deck,hand,discard:[],playedSpellRound:0,supportInnateRound:0,flowingStepRound:0};
 } else {
   st.name=def.name;st.maxHp=Number(def.maxHp||st.maxHp||9);if(st.hp==null)st.hp=st.maxHp;if(st.actions==null)st.actions=3;if(st.x==null)st.x=0;if(st.y==null)st.y=0;
   st.conditions=Array.isArray(st.conditions)?st.conditions:[];st.deck=Array.isArray(st.deck)?st.deck:[];st.hand=Array.isArray(st.hand)?st.hand:[];st.discard=Array.isArray(st.discard)?st.discard:[];
   if(st.deck.length===0&&st.hand.length===0&&st.discard.length===0){st.deck=buildCustomDeck(def);st.hand=st.deck.splice(0,5)}
 }
 if(!Array.isArray(g.inventory[role]))g.inventory[role]=[];
 if(!g.equipped[role])g.equipped[role]={Weapon:null,Armor:null,Shield:null,Offhand:null,Accessory:[]};
 if(g.xp[role]==null)g.xp[role]=0;if(g.levels[role]==null)g.levels[role]=1;
 return isNew;
}

function listSavedRooms(){
  if(!fs.existsSync(DATA_DIR)) return [];
  return fs.readdirSync(DATA_DIR)
    .filter(f=>f.toLowerCase().endsWith('.json'))
    .map(f=>{
      const full=path.join(DATA_DIR,f);
      let savedAt=null;
      try{
        const parsed=JSON.parse(fs.readFileSync(full,'utf8'));
        savedAt=parsed?.savedAt || parsed?.state?.savedAt || fs.statSync(full).mtime.toISOString();
      }catch(e){
        try{ savedAt=fs.statSync(full).mtime.toISOString(); }catch(_){}
      }
      return {room:path.basename(f,'.json'),savedAt};
    })
    .sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));
}
app.get('/api/saves',(req,res)=>{
  try{ res.json({rooms:listSavedRooms()}); }
  catch(e){ res.status(500).json({error:'Could not list saved games.'}); }
});
app.delete('/api/saves/:room',(req,res)=>{
  try{
    const room=String(req.params.room||'').trim().toUpperCase();
    if(!room) return res.status(400).json({error:'Invalid room.'});

    // Use the exact same persisted filename convention as loadRoomState/saveRoomState.
    const file=path.join(DATA_DIR, `${room}.json`);
    const tmp=`${file}.tmp`;

    if(!fs.existsSync(file)) return res.status(404).json({error:'Saved game not found.'});

    fs.unlinkSync(file);
    // Clean up an abandoned atomic-write temp file too, if one exists.
    try{ if(fs.existsSync(tmp)) fs.unlinkSync(tmp); }catch(_){}

    // Prevent a currently-known room from immediately reusing stale authoritative state.
    const active=rooms.get(room);
    if(active) active.latestState=null;

    res.json({ok:true,room});
  }catch(e){
    console.error('[DELETE SAVE ERROR]', req.params.room, e);
    res.status(500).json({error:e?.message || 'Could not delete saved game.'});
  }
});

app.get('/health',(req,res)=>res.json({ok:true,version:'3.27.4-debug',authority:'room',persistence:persistenceEnabled}));

wss.on('connection',ws=>{
 ws.room=null;ws.joinReady=false;
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw)}catch{return}
  if(!m.room||!m.type)return;const rn=safeRoomName(m.room);if(!rn)return;
  if(m.type==='JOIN'||m.type==='HELLO'||m.type==='NEW_GAME_JOIN'){
   if(ws.room&&rooms.has(ws.room))rooms.get(ws.room).clients.delete(ws);
   ws.room=rn;ws.role=m.from||null;ws.heroDefinition=m.data?.heroDefinition||null;ws.joinReady=false;const r=room(rn);r.clients.add(ws);
   if(m.type==='NEW_GAME_JOIN'||!r.host||r.host.readyState!==1)r.host=ws;
   if(m.type==='NEW_GAME_JOIN'&&m.data?.game){
     // 3.25.29: explicit New Game is authoritative. Never restore an older persisted snapshot into it.
     r.latestState=m.data;
     r.revision=Math.max(1,(r.revision||0)+1);
     if(persistenceEnabled){try{const f=roomFile(rn),tmp=f+'.tmp';if(fs.existsSync(f))fs.unlinkSync(f);if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch(e){console.warn(`[PERSIST] RESET ${rn} -> ERROR: ${e.message}`)}}
     saveRoomState(rn,r.latestState);
     persistLog(`HANDSHAKE ${rn} NEW_GAME_JOIN -> fresh authoritative state`);
     send(ws,{type:'ROOM_STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
     for(const peer of r.clients)if(peer!==ws)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   }else{
     const diskState=loadRoomState(rn);if(diskState)r.latestState=diskState;
     if(r.latestState){
       if(!r.revision)r.revision=1;
       // 3.27.3: the ROOM, not a browser, creates a joining custom Hero in canonical state.
       // This happens BEFORE ROOM_STATE is sent, so no client-side addPartyHero race is possible.
       if(ws.heroDefinition?.id===ws.role){
         const added=ensureCustomHeroInRoomState(r,ws.role,ws.heroDefinition);
         if(added){r.revision++;saveRoomState(rn,r.latestState);persistLog(`CUSTOM JOIN ${rn} hero=${ws.role} -> room-created Stonebrook + opening hand rev=${r.revision}`)}
       }
       persistLog(`HANDSHAKE ${rn} ${m.type} -> ROOM_STATE room-authoritative restore rev=${r.revision}`);send(ws,{type:'ROOM_STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState})}
     else{persistLog(`HANDSHAKE ${rn} ${m.type} -> ROOM_EMPTY new room`);send(ws,{type:'ROOM_EMPTY',room:rn,from:'SERVER',data:null})}
   }
   ws.joinReady=true;
   const heroes=[...new Set([...r.clients].map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}})}
   return;
  }
  if(ws.room!==rn||!ws.joinReady){persistLog(`REJECT ${rn} ${m.type} -> join handshake incomplete`);return}
  const r=room(rn);
  if(m.type==='LEAVE_PARTY'||m.type==='SET_AWAY'){
   const hostAction=m.type==='SET_AWAY';
   if(hostAction&&ws!==r.host){send(ws,{type:'KICK_DENIED',room:rn,from:'SERVER',data:{reason:'Only the room host can set another Hero Away.'}});return}
   const target=hostAction?String(m.data?.hero||''):String(ws.role||'');
   if(!target||(hostAction&&target===ws.role)){send(ws,{type:'KICK_DENIED',room:rn,from:'SERVER',data:{reason:'Invalid Away target.'}});return}
   // The sender supplies the already-updated authoritative game snapshot. Preserve it before closing sockets.
   if(m.data?.state?.game){r.latestState=m.data.state;saveRoomState(rn,r.latestState)}
   else if(r.latestState?.game){
     r.latestState.game.campaignRoster32534=Array.isArray(r.latestState.game.campaignRoster32534)?r.latestState.game.campaignRoster32534:[];
     if(!r.latestState.game.campaignRoster32534.includes(target))r.latestState.game.campaignRoster32534.push(target);
     r.latestState.game.awayHeroes32534=r.latestState.game.awayHeroes32534||{};
     r.latestState.game.awayHeroes32534[target]={away:true,questLeft:r.latestState.game.campaign?.currentQuest||null};
     r.latestState.game.partyHeroes=(r.latestState.game.partyHeroes||[]).filter(h=>h!==target);saveRoomState(rn,r.latestState);
   }
   const victims=[...r.clients].filter(c=>c.role===target);
   for(const peer of r.clients)if(!victims.includes(peer)){send(peer,{type:'SET_AWAY_NOTICE',room:rn,from:'SERVER',data:{hero:target}});if(r.latestState)send(peer,{type:'STATE',room:rn,from:'SERVER',data:r.latestState})}
   for(const v of victims){send(v,{type:'LEFT_PARTY',room:rn,from:'SERVER',data:{hero:target,away:true}});try{v.close(4002,'Hero set Away')}catch{}}
   const heroes=[...new Set([...r.clients].filter(c=>!victims.includes(c)).map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients)if(!victims.includes(peer))send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});
   persistLog(`AWAY ${rn} by=${ws.role} target=${target} sockets=${victims.length}`);return;
  }
  if(m.type==='KICK_PLAYER'){
   if(ws!==r.host){send(ws,{type:'KICK_DENIED',room:rn,from:'SERVER',data:{reason:'Only the room host can remove players.'}});return}
   const target=String(m.data?.hero||'');
   if(!target||target===ws.role){send(ws,{type:'KICK_DENIED',room:rn,from:'SERVER',data:{reason:'The host cannot remove their own Hero.'}});return}
   const victims=[...r.clients].filter(c=>c.role===target);
   if(r.latestState?.game&&Array.isArray(r.latestState.game.partyHeroes)){
     r.latestState.game.partyHeroes=r.latestState.game.partyHeroes.filter(h=>h!==target);
     if(r.latestState.game.activeHero===target)r.latestState.game.activeHero=r.latestState.game.partyHeroes[0]||ws.role;
     saveRoomState(rn,r.latestState);
   }
   for(const v of victims){send(v,{type:'KICKED',room:rn,from:'SERVER',data:{hero:target,by:ws.role}});try{v.close(4001,'Removed by host')}catch{}}
   const heroes=[...new Set([...r.clients].filter(c=>!victims.includes(c)).map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients)if(!victims.includes(peer)){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}});if(r.latestState)send(peer,{type:'STATE',room:rn,from:'SERVER',data:r.latestState})}
   persistLog(`KICK ${rn} host=${ws.role} target=${target} sockets=${victims.length}`);return;
  }
  if(m.type==='STATE'&&m.data){
   // 3.27.0: the ROOM owns the canonical snapshot. A client may propose a new snapshot
   // only from the revision it most recently received. Stale whole-game snapshots are
   // rejected instead of overwriting newer Hero/deck/position state from another player.
   const base=Number(m.baseRevision);
   if(r.latestState && (!Number.isInteger(base) || base!==r.revision)){
     persistLog(`REJECT STALE STATE ${rn} from=${ws.role} base=${m.baseRevision} roomRev=${r.revision}`);
     send(ws,{type:'STATE_REJECTED',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
     return;
   }
   r.latestState=m.data;r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   persistLog(`COMMIT ${rn} rev=${r.revision} from=${ws.role}`);
   // Server broadcasts the committed canonical snapshot to EVERY client, including sender.
   for(const peer of r.clients)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   return;
  }
  // Legacy request remains supported only after JOIN; disk remains authoritative.
  if(m.type==='REQUEST_STATE'){
   const diskState=loadRoomState(rn);if(diskState){r.latestState=diskState;if(!r.revision)r.revision=1}
   send(ws,{type:r.latestState?'ROOM_STATE':'ROOM_EMPTY',room:rn,from:'SERVER',revision:r.revision||0,data:r.latestState||null});return;
  }
  for(const peer of r.clients)if(peer!==ws)send(peer,m);
 });
 ws.on('close',()=>{if(ws.room&&rooms.has(ws.room)){const rn=ws.room,r=rooms.get(rn);r.clients.delete(ws);if(!r.clients.size)setTimeout(()=>{const current=rooms.get(rn);if(current?.clients.size===0)rooms.delete(rn)},3600000)}});
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>{console.log(`Ascendance 3.27.3 DEBUG ROOM-AUTHORITATIVE running on port ${PORT}; persistent saves ${persistenceEnabled?'ENABLED':'DISABLED'} at ${DATA_DIR}`);persistLog(`START directory=${DATA_DIR} exists=${fs.existsSync(DATA_DIR)}`);if(persistenceEnabled){try{persistLog(`START files=${fs.readdirSync(DATA_DIR).join(',')||'(none)'}`)}catch(e){console.warn(`[PERSIST] START directory listing error: ${e.message}`)}}});
