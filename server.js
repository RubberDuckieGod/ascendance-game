const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');

const app=express();
app.use(express.json({limit:'256kb'}));
app.use(express.static(path.join(__dirname,'public'),{etag:false,lastModified:false,setHeaders:(res)=>{res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0')}}));
const server=http.createServer(app);
const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();
const debugEvents=[];
function debugEvent(kind,detail={}){debugEvents.push({at:new Date().toISOString(),kind,...detail});if(debugEvents.length>500)debugEvents.shift()}
app.get('/api/debug/events',(req,res)=>res.json({version:'3.27.12-diagnostic',events:debugEvents.slice(-300)}));

const DATA_DIR=process.env.ASCENDANCE_DATA_DIR || '/var/data/ascendance';
const persistenceEnabled=(()=>{try{fs.mkdirSync(DATA_DIR,{recursive:true});fs.accessSync(DATA_DIR,fs.constants.W_OK);return true}catch(e){console.warn(`Persistent room saves unavailable at ${DATA_DIR}: ${e.message}`);return false}})();
// ===== 3.27.15 ACCOUNT AUTHENTICATION =====
const ACCOUNT_DIR=path.join(DATA_DIR,'accounts');
try{fs.mkdirSync(ACCOUNT_DIR,{recursive:true})}catch(_){}
const authSessions=new Map();
function cleanUsername(v){return String(v||'').trim().toLowerCase()}
function validUsername(v){return /^[a-z0-9_]{3,24}$/.test(v)}
function accountFile(username){return path.join(ACCOUNT_DIR,`${username}.json`)}
function hashPassword(password,salt){return crypto.scryptSync(String(password),salt,64).toString('hex')}
function safeEqualHex(a,b){try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y)}catch{return false}}
function issueSession(username){const token=crypto.randomBytes(32).toString('hex');authSessions.set(token,{username,createdAt:Date.now()});return token}
function authFromReq(req){const h=String(req.headers.authorization||'');const token=h.startsWith('Bearer ')?h.slice(7):'';return token&&authSessions.get(token)||null}
app.post('/api/auth/register',(req,res)=>{
 try{
  const username=cleanUsername(req.body?.username),displayName=String(req.body?.displayName||req.body?.username||'').trim().slice(0,32),password=String(req.body?.password||'');
  if(!validUsername(username))return res.status(400).json({error:'Username must be 3–24 characters using letters, numbers, or underscore.'});
  if(displayName.length<1)return res.status(400).json({error:'Enter a player name.'});
  if(password.length<8)return res.status(400).json({error:'Password must be at least 8 characters.'});
  const f=accountFile(username);if(fs.existsSync(f))return res.status(409).json({error:'That username already exists.'});
  const salt=crypto.randomBytes(16).toString('hex'),passwordHash=hashPassword(password,salt);
  const account={username,displayName,salt,passwordHash,createdAt:new Date().toISOString()};fs.writeFileSync(f,JSON.stringify(account,null,2),'utf8');
  const token=issueSession(username);return res.json({ok:true,token,user:{username,displayName}});
 }catch(e){console.error('[AUTH REGISTER]',e);return res.status(500).json({error:'Could not create account.'})}
});
app.post('/api/auth/login',(req,res)=>{
 try{
  const username=cleanUsername(req.body?.username),password=String(req.body?.password||''),f=accountFile(username);
  if(!validUsername(username)||!fs.existsSync(f))return res.status(401).json({error:'Invalid username or password.'});
  const a=JSON.parse(fs.readFileSync(f,'utf8')),candidate=hashPassword(password,a.salt);
  if(!safeEqualHex(candidate,a.passwordHash))return res.status(401).json({error:'Invalid username or password.'});
  const token=issueSession(username);return res.json({ok:true,token,user:{username:a.username,displayName:a.displayName}});
 }catch(e){console.error('[AUTH LOGIN]',e);return res.status(500).json({error:'Could not sign in.'})}
});
app.get('/api/auth/me',(req,res)=>{const sess=authFromReq(req);if(!sess)return res.status(401).json({error:'Not signed in.'});try{const a=JSON.parse(fs.readFileSync(accountFile(sess.username),'utf8'));res.json({ok:true,user:{username:a.username,displayName:a.displayName}})}catch{res.status(401).json({error:'Account unavailable.'})}});

// 3.27.16 — account-owned custom characters
function publicAccount(a){return {username:a.username,displayName:a.displayName}}
function readAccount(username){return JSON.parse(fs.readFileSync(accountFile(username),'utf8'))}
function writeAccount(a){fs.writeFileSync(accountFile(a.username),JSON.stringify(a,null,2),'utf8')}
function requireAuth(req,res){const sess=authFromReq(req);if(!sess){res.status(401).json({error:'Not signed in.'});return null}return sess}
app.get('/api/account/characters',(req,res)=>{const sess=requireAuth(req,res);if(!sess)return;try{const a=readAccount(sess.username);res.json({ok:true,characters:Array.isArray(a.characters)?a.characters:[]})}catch(e){res.status(500).json({error:'Could not load characters.'})}});
app.put('/api/account/characters',(req,res)=>{const sess=requireAuth(req,res);if(!sess)return;try{const list=Array.isArray(req.body?.characters)?req.body.characters:[];if(list.length>50)return res.status(400).json({error:'Too many characters.'});for(const c of list){if(!c||typeof c!=='object'||!/^CH\d+$/i.test(String(c.id||''))||!String(c.name||'').trim())return res.status(400).json({error:'Invalid character data.'});if(JSON.stringify(c).length>100000)return res.status(400).json({error:'Character data is too large.'})}const a=readAccount(sess.username);a.characters=list;a.updatedAt=new Date().toISOString();writeAccount(a);res.json({ok:true,characters:a.characters})}catch(e){console.error('[CHAR SAVE]',e);res.status(500).json({error:'Could not save characters.'})}});
app.post('/api/auth/logout',(req,res)=>{const h=String(req.headers.authorization||'');if(h.startsWith('Bearer '))authSessions.delete(h.slice(7));res.json({ok:true})});

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

// 3.27.20 — server-authoritative built-in Hero join.
// Presence in PARTY_ROSTER is not enough: the joining Hero must be committed to the
// canonical game snapshot before ROOM_STATE/STATE are broadcast.
function ensureBuiltInHeroInRoomState(r, role){
 if(!r?.latestState?.game||!['Aldric','Lyra','Seraphine'].includes(role))return false;
 const g=r.latestState.game;
 g.partyHeroes=Array.isArray(g.partyHeroes)?g.partyHeroes:[];
 const isNew=!g.partyHeroes.includes(role);
 if(!isNew)return false;
 g.partyHeroes.push(role);
 g.campaignRoster32534=Array.isArray(g.campaignRoster32534)?g.campaignRoster32534:[];
 if(!g.campaignRoster32534.includes(role))g.campaignRoster32534.push(role);
 if(g.campaign)g.campaign.roster=[...g.campaignRoster32534];
 // Built-in decks/states are created by init() even when that Hero is not initially in the party.
 // Match client addPartyHero(): deal an opening hand only when the Hero has none.
 const deckKey=role==='Aldric'?'heroDeck':role==='Lyra'?'lyraDeck':'seraphineDeck';
 const handKey=role==='Aldric'?'heroHand':role==='Lyra'?'lyraHand':'seraphineHand';
 g[deckKey]=Array.isArray(g[deckKey])?g[deckKey]:[];
 g[handKey]=Array.isArray(g[handKey])?g[handKey]:[];
 if(g[handKey].length===0&&g[deckKey].length){g[handKey].push(...g[deckKey].splice(0,Math.min(5,g[deckKey].length)))}
 // Match the campaign-start potion behavior without inventing a second copy.
 g.inventory=g.inventory||{};g.inventory[role]=Array.isArray(g.inventory[role])?g.inventory[role]:[];
 if(g.startingHealingPotionsInitialized&&!g.inventory[role].some(x=>x&&x.id==='LT002')){
   let sample=null;
   for(const items of Object.values(g.inventory)){sample=(items||[]).find(x=>x&&x.id==='LT002');if(sample)break}
   g.inventory[role].push(sample?JSON.parse(JSON.stringify(sample)):{id:'LT002',kind:'loot',qty:1});
 }
 g.xp=g.xp||{};g.levels=g.levels||{};if(g.xp[role]==null)g.xp[role]=0;if(g.levels[role]==null)g.levels[role]=1;
 return true;
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

app.get('/health',(req,res)=>res.json({ok:true,version:'3.27.24',authority:'room',persistence:persistenceEnabled}));

wss.on('connection',ws=>{
 ws.room=null;ws.joinReady=false;ws.ready32716=false;ws.account32716=null;
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw)}catch{return}
  if(!m.room||!m.type)return;const rn=safeRoomName(m.room);if(!rn)return;
  if(m.type==='JOIN'||m.type==='HELLO'||m.type==='NEW_GAME_JOIN'){
   if(ws.room&&rooms.has(ws.room))rooms.get(ws.room).clients.delete(ws);
   ws.room=rn;ws.role=m.from||null;ws.heroDefinition=m.data?.heroDefinition||null;ws.ready32716=false;const tok=String(m.data?.authToken||'');const sess32716=tok?authSessions.get(tok):null;ws.account32716=sess32716?.username||null;ws.joinReady=false;const r=room(rn);
   // 3.27.24: Hero ownership is account-bound. Connected duplicates are rejected; a returning
   // account may replace its own stale socket. Ownership is persisted in the room snapshot.
   r.heroOwners32724=r.heroOwners32724||{};
   const diskForOwners=loadRoomState(rn);
   const persistedOwners=m.type==='NEW_GAME_JOIN'?{}:(diskForOwners?.heroOwners32724||diskForOwners?.game?.heroOwners32724||{});
   if(m.type==='NEW_GAME_JOIN')r.heroOwners32724={};
   else if(!Object.keys(r.heroOwners32724).length&&persistedOwners&&typeof persistedOwners==='object')r.heroOwners32724={...persistedOwners};
   const requestedHero=String(ws.role||'');
   const owner=r.heroOwners32724[requestedHero]||null;
   const sameHeroLive=[...r.clients].filter(c=>c.readyState===1&&c.role===requestedHero);
   if(owner&&owner!==ws.account32716){
     send(ws,{type:'JOIN_DENIED',room:rn,from:'SERVER',data:{reason:`${requestedHero} is reserved for another player.`}});
     try{ws.close(4003,'Hero reserved')}catch{};return;
   }
   if(sameHeroLive.length){
     const replaceable=ws.account32716&&sameHeroLive.every(c=>c.account32716===ws.account32716);
     if(!replaceable){send(ws,{type:'JOIN_DENIED',room:rn,from:'SERVER',data:{reason:`${requestedHero} is already controlled by another connected player.`}});try{ws.close(4003,'Hero already controlled')}catch{};return}
     for(const old of sameHeroLive){send(old,{type:'SESSION_REPLACED',room:rn,from:'SERVER',data:{hero:requestedHero}});try{old.close(4004,'Reconnected from another session')}catch{}}
   }
   if(ws.account32716&&requestedHero)r.heroOwners32724[requestedHero]=ws.account32716;
   r.clients.add(ws);
   if(m.type==='NEW_GAME_JOIN'||!r.host||r.host.readyState!==1)r.host=ws;
   if(m.type==='NEW_GAME_JOIN'&&m.data?.game){
     // 3.25.29: explicit New Game is authoritative. Never restore an older persisted snapshot into it.
     r.latestState=m.data;
     r.latestState.heroOwners32724={...r.heroOwners32724};
     if(r.latestState.game)r.latestState.game.heroOwners32724={...r.heroOwners32724};
     r.adventureStarted=false;
     if(r.latestState&&typeof r.latestState==='object')r.latestState.adventureStarted32723=false;
     r.revision=Math.max(1,(r.revision||0)+1);
     if(persistenceEnabled){try{const f=roomFile(rn),tmp=f+'.tmp';if(fs.existsSync(f))fs.unlinkSync(f);if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch(e){console.warn(`[PERSIST] RESET ${rn} -> ERROR: ${e.message}`)}}
     saveRoomState(rn,r.latestState);
     persistLog(`HANDSHAKE ${rn} NEW_GAME_JOIN -> fresh authoritative state`);
     send(ws,{type:'ROOM_STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
     for(const peer of r.clients)if(peer!==ws)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   }else{
     const diskState=loadRoomState(rn);if(diskState)r.latestState=diskState;if(r.latestState?.heroOwners32724)r.heroOwners32724={...r.latestState.heroOwners32724};else if(r.latestState?.game?.heroOwners32724)r.heroOwners32724={...r.latestState.game.heroOwners32724};if(ws.account32716&&requestedHero&&!r.heroOwners32724[requestedHero])r.heroOwners32724[requestedHero]=ws.account32716;if(r.latestState){r.latestState.heroOwners32724={...r.heroOwners32724};if(r.latestState.game)r.latestState.game.heroOwners32724={...r.heroOwners32724};saveRoomState(rn,r.latestState)}if(r.latestState?.adventureStarted32723===true)r.adventureStarted=true;
     if(r.latestState){
       if(!r.revision)r.revision=1;
       // 3.27.20: the ROOM creates every joining Hero in canonical state BEFORE ROOM_STATE.
       // Previously only custom Heroes used this path; built-ins (Lyra, etc.) were added locally
       // by the joining browser, leaving the host's canonical party unchanged.
       let added=false;
       if(ws.heroDefinition?.id===ws.role)added=ensureCustomHeroInRoomState(r,ws.role,ws.heroDefinition);
       else added=ensureBuiltInHeroInRoomState(r,ws.role);
       if(added){
        r.revision++;saveRoomState(rn,r.latestState);persistLog(`CANONICAL JOIN ${rn} hero=${ws.role} -> party committed rev=${r.revision}`);
        // Broadcast the same authoritative revision to players already in the room.
        for(const peer of r.clients)if(peer!==ws)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
        debugEvent('JOIN_STATE_BROADCAST',{room:rn,hero:ws.role,revision:r.revision,peers:[...r.clients].filter(c=>c!==ws&&c.readyState===1).length});
       }
       persistLog(`HANDSHAKE ${rn} ${m.type} -> ROOM_STATE room-authoritative restore rev=${r.revision}`);send(ws,{type:'ROOM_STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState})}
     else{persistLog(`HANDSHAKE ${rn} ${m.type} -> ROOM_EMPTY new room`);send(ws,{type:'ROOM_EMPTY',room:rn,from:'SERVER',data:null})}
   }
   ws.joinReady=true;
   const heroes=[...new Set([...r.clients].map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}})}
   {const players=[...r.clients].filter(c=>c.readyState===1).map(c=>{let displayName=c.account32716||c.role;try{if(c.account32716)displayName=readAccount(c.account32716).displayName||c.account32716}catch(_){}return {hero:c.role,username:c.account32716,displayName,ready:!!c.ready32716,isHost:c===r.host}});for(const peer of r.clients)send(peer,{type:'PARTY_LOBBY',room:rn,from:'SERVER',data:{players,hostRole:r.host?.role||null}})}
   // 3.27.23: a player returning to a room whose adventure already started resumes gameplay.
   // They do NOT need to Ready and cannot be blocked by the host-only Start Adventure button.
   if(r.adventureStarted===true&&m.type!=='NEW_GAME_JOIN'&&r.latestState){
    send(ws,{type:'ADVENTURE_RESUME',room:rn,from:'SERVER',revision:r.revision,data:{started:true,game:r.latestState}});
    persistLog(`ADVENTURE RESUME ${rn} hero=${ws.role} rev=${r.revision}`);
    debugEvent('ADVENTURE_RESUME',{room:rn,hero:ws.role,revision:r.revision});
   }
   return;
  }
  if(ws.room!==rn||!ws.joinReady){persistLog(`REJECT ${rn} ${m.type} -> join handshake incomplete`);return}
  const r=room(rn);
  const broadcastLobby32716=()=>{const players=[...r.clients].filter(c=>c.readyState===1).map(c=>{let displayName=c.account32716||c.role;try{if(c.account32716)displayName=readAccount(c.account32716).displayName||c.account32716}catch(_){}return {hero:c.role,username:c.account32716,displayName,ready:!!c.ready32716,isHost:c===r.host}});for(const peer of r.clients)send(peer,{type:'PARTY_LOBBY',room:rn,from:'SERVER',data:{players,hostRole:r.host?.role||null}})};
  if(m.type==='LOBBY_READY'){ws.ready32716=!!m.data?.ready;send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'LOBBY_READY_RECEIVED',role:ws.role,ready:ws.ready32716,isHost:ws===r.host}});broadcastLobby32716();return}
  if(m.type==='START_ADVENTURE'){const live=[...r.clients].filter(c=>c.readyState===1);send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'START_RECEIVED',role:ws.role,isHost:ws===r.host,hostRole:r.host?.role||null,players:live.map(c=>({role:c.role,ready:!!c.ready32716,isHost:c===r.host})),revision:r.revision}});if(ws!==r.host){send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'START_DENIED_NOT_HOST'}});send(ws,{type:'START_DENIED',room:rn,from:'SERVER',data:{reason:'Only the host can start the adventure.'}});return}if(!live.length||live.some(c=>!c.ready32716)){send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'START_DENIED_NOT_READY',players:live.map(c=>({role:c.role,ready:!!c.ready32716}))}});send(ws,{type:'START_DENIED',room:rn,from:'SERVER',data:{reason:'Every connected player must be Ready.'}});return}r.adventureStarted=true;if(r.latestState&&typeof r.latestState==='object'){r.latestState.adventureStarted32723=true;saveRoomState(rn,r.latestState)}for(const peer of live){send(peer,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'ADVENTURE_START_SENDING',to:peer.role,revision:r.revision}});send(peer,{type:'ADVENTURE_START',room:rn,from:'SERVER',revision:r.revision,data:{started:true,game:r.latestState}})}persistLog(`ADVENTURE START ${rn} host=${ws.role} players=${live.length}`);return}
  if(m.type==='REQUEST_PARTY_LOBBY'){send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'LOBBY_REQUEST_RECEIVED',role:ws.role,isHost:ws===r.host}});broadcastLobby32716();return}
  if(m.type==='LEAVE_GAME'){
   const target=String(ws.role||'');
   if(target&&(!r.heroOwners32724?.[target]||r.heroOwners32724[target]===ws.account32716))delete r.heroOwners32724[target];
   if(r.latestState?.game){
     r.latestState.game.partyHeroes=(r.latestState.game.partyHeroes||[]).filter(h=>h!==target);
     if(r.latestState.game.activeHero===target)r.latestState.game.activeHero=r.latestState.game.partyHeroes[0]||null;
     r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};
     r.latestState.heroOwners32724={...(r.heroOwners32724||{})};
     r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   }
   send(ws,{type:'LEFT_GAME',room:rn,from:'SERVER',data:{hero:target,released:true}});
   for(const peer of r.clients)if(peer!==ws&&peer.readyState===1){send(peer,{type:'PLAYER_LEFT_GAME',room:rn,from:'SERVER',data:{hero:target}});if(r.latestState)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState})}
   persistLog(`LEAVE GAME ${rn} hero=${target} account=${ws.account32716||'?'} released=true`);
   try{ws.close(4005,'Left game')}catch{};return;
  }
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
   if(r.heroOwners32724)delete r.heroOwners32724[target];
   if(r.latestState?.game&&Array.isArray(r.latestState.game.partyHeroes)){
     r.latestState.game.partyHeroes=r.latestState.game.partyHeroes.filter(h=>h!==target);
     if(r.latestState.game.activeHero===target)r.latestState.game.activeHero=r.latestState.game.partyHeroes[0]||ws.role;
     r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};r.latestState.heroOwners32724={...(r.heroOwners32724||{})};
     r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
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
   r.latestState=m.data;
   // Never let a client snapshot erase or forge server-owned Hero reservations.
   r.latestState.heroOwners32724={...(r.heroOwners32724||{})};
   if(r.latestState.game)r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};
   r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
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
 ws.on('close',()=>{if(ws.room&&rooms.has(ws.room)){const rn=ws.room,r=rooms.get(rn);r.clients.delete(ws);const live=[...r.clients].filter(c=>c.readyState===1);if(r.host===ws||!r.host||r.host.readyState!==1)r.host=live[0]||null;const heroes=[...new Set(live.map(c=>c.role).filter(Boolean))];const customHeroDefinitions=Object.fromEntries(live.filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]));const players=live.map(c=>{let displayName=c.account32716||c.role;try{if(c.account32716)displayName=readAccount(c.account32716).displayName||c.account32716}catch(_){}return {hero:c.role,username:c.account32716,displayName,ready:!!c.ready32716,isHost:c===r.host}});for(const peer of live){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}});send(peer,{type:'PARTY_LOBBY',room:rn,from:'SERVER',data:{players,hostRole:r.host?.role||null}})}persistLog(`DISCONNECT ${rn} hero=${ws.role||'?'} remaining=${live.length} host=${r.host?.role||'none'}`);debugEvent('PLAYER_DISCONNECTED',{room:rn,hero:ws.role||null,remaining:heroes,hostRole:r.host?.role||null});if(!r.clients.size)setTimeout(()=>{const current=rooms.get(rn);if(current?.clients.size===0)rooms.delete(rn)},3600000)}});
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>{console.log(`Ascendance 3.27.24 PLAYER OWNERSHIP running on port ${PORT}; persistent saves ${persistenceEnabled?'ENABLED':'DISABLED'} at ${DATA_DIR}`);persistLog(`START directory=${DATA_DIR} exists=${fs.existsSync(DATA_DIR)}`);if(persistenceEnabled){try{persistLog(`START files=${fs.readdirSync(DATA_DIR).join(',')||'(none)'}`)}catch(e){console.warn(`[PERSIST] START directory listing error: ${e.message}`)}}});
