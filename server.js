const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const mechanics33621=require('./mechanics-rules-33621.js');
const SERVER_BUILD_33621='3.36.21';

const app=express();
app.use(express.json({limit:'256kb'}));
const noCacheHeaders=(res)=>{res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0')};
// 3.29.8 — GitHub/Render keeps portrait JPGs in the repository-root /assets folder.
// Explicitly expose that folder at /assets before serving the rest of the public app.
app.use('/assets',express.static(path.join(__dirname,'assets'),{etag:false,lastModified:false,setHeaders:noCacheHeaders}));
app.use(express.static(path.join(__dirname,'public'),{etag:false,lastModified:false,setHeaders:noCacheHeaders}));
const server=http.createServer(app);
const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();
const debugEvents=[];
function debugEvent(kind,detail={}){debugEvents.push({at:new Date().toISOString(),kind,...detail});if(debugEvents.length>500)debugEvents.shift()}
app.get('/api/debug/events',(req,res)=>res.json({version:SERVER_BUILD_33621,authority:'room-turn-owner',events:debugEvents.slice(-300)}));

const DATA_DIR=process.env.ASCENDANCE_DATA_DIR || '/var/data/ascendance';
const persistenceEnabled=(()=>{try{fs.mkdirSync(DATA_DIR,{recursive:true});fs.accessSync(DATA_DIR,fs.constants.W_OK);return true}catch(e){console.warn(`Persistent room saves unavailable at ${DATA_DIR}: ${e.message}`);return false}})();
// ===== 3.27.15 ACCOUNT AUTHENTICATION =====
const ACCOUNT_DIR=path.join(DATA_DIR,'accounts');
try{fs.mkdirSync(ACCOUNT_DIR,{recursive:true})}catch(_){}
const authSessions=new Map();
// 3.27.35 — persist login sessions on the Render disk so a deploy/restart does not
// make an already signed-in browser look authenticated locally while the server
// has forgotten its token.
const SESSION_FILE=path.join(DATA_DIR,'auth-sessions.json');
const SESSION_MAX_AGE_MS=30*24*60*60*1000;
function saveAuthSessions(){
 if(!persistenceEnabled)return;
 try{
  const now=Date.now(),rows=[];
  for(const [token,sess] of authSessions){if(sess?.username&&now-Number(sess.createdAt||0)<=SESSION_MAX_AGE_MS)rows.push([token,sess])}
  const tmp=SESSION_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify({savedAt:new Date().toISOString(),sessions:rows}),'utf8');fs.renameSync(tmp,SESSION_FILE)
 }catch(e){console.warn('[AUTH SESSION SAVE]',e.message)}
}
function loadAuthSessions(){
 if(!persistenceEnabled)return;
 try{
  if(!fs.existsSync(SESSION_FILE))return;
  const j=JSON.parse(fs.readFileSync(SESSION_FILE,'utf8')),now=Date.now();
  for(const row of (Array.isArray(j.sessions)?j.sessions:[])){
   const token=String(row?.[0]||''),sess=row?.[1];
   if(token&&sess?.username&&now-Number(sess.createdAt||0)<=SESSION_MAX_AGE_MS&&fs.existsSync(path.join(ACCOUNT_DIR,`${sess.username}.json`)))authSessions.set(token,sess)
  }
 }catch(e){console.warn('[AUTH SESSION LOAD]',e.message)}
}
loadAuthSessions();
function cleanUsername(v){return String(v||'').trim().toLowerCase()}
function validUsername(v){return /^[a-z0-9_]{3,24}$/.test(v)}
function accountFile(username){return path.join(ACCOUNT_DIR,`${username}.json`)}
function hashPassword(password,salt){return crypto.scryptSync(String(password),salt,64).toString('hex')}
function safeEqualHex(a,b){try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y)}catch{return false}}
function issueSession(username){const token=crypto.randomBytes(32).toString('hex');authSessions.set(token,{username,createdAt:Date.now()});saveAuthSessions();return token}
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
app.post('/api/auth/logout',(req,res)=>{const h=String(req.headers.authorization||'');if(h.startsWith('Bearer ')){authSessions.delete(h.slice(7));saveAuthSessions()}res.json({ok:true})});

function safeRoomName(name){return String(name).trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,64)}
function roomFile(name){return path.join(DATA_DIR,`${safeRoomName(name)}.json`)}
function roomBackupFile(name){return roomFile(name)+'.bak'}
const PERSISTENCE_SCHEMA_3364='3.36.4';
function persistLog(message){console.log(`[PERSIST] ${message}`);debugEvent('SERVER',{message})}
function parseSavedRoom3364(f){
 const raw=fs.readFileSync(f,'utf8'),saved=JSON.parse(raw);if(!saved||!saved.state||typeof saved.state!=='object')throw new Error('Saved room has no state object.');return {raw,saved,state:saved.state};
}
function loadRoomState(name){
 if(!persistenceEnabled){persistLog(`LOAD ${name} -> persistence disabled`);return null}
 const f=roomFile(name),bak=roomBackupFile(name);persistLog(`LOAD ${name} -> ${f}`);
 try{if(!fs.existsSync(f)){if(!fs.existsSync(bak)){persistLog(`LOAD ${name} -> NOT FOUND`);return null}throw new Error('Primary save missing.')}const parsed=parseSavedRoom3364(f);persistLog(`LOAD ${name} -> FOUND (${parsed.raw.length} bytes)`);return parsed.state}catch(e){
  console.warn(`[PERSIST] LOAD ${name} primary -> ERROR: ${e.message}`);
  try{if(!fs.existsSync(bak)){persistLog(`LOAD ${name} -> BACKUP NOT FOUND`);return null}const parsed=parseSavedRoom3364(bak);persistLog(`LOAD ${name} -> BACKUP RECOVERED (${parsed.raw.length} bytes)`);try{const heal=f+'.recover.tmp';fs.writeFileSync(heal,JSON.stringify({...parsed.saved,recoveredAt:new Date().toISOString(),persistenceSchema3364:PERSISTENCE_SCHEMA_3364}),'utf8');fs.renameSync(heal,f)}catch(healErr){console.warn(`[PERSIST] HEAL ${name} -> ERROR: ${healErr.message}`)}return parsed.state}catch(bakErr){console.warn(`[PERSIST] LOAD ${name} backup -> ERROR: ${bakErr.message}`);return null}
 }
}
function saveRoomState(name,state){
 if(!persistenceEnabled||!state)return;const f=roomFile(name),bak=roomBackupFile(name),tmp=f+'.tmp';
 try{
  const rr=rooms.get(safeRoomName(name));if(rr)syncCampaignAuthority3321(rr,name,state);
  const raw=JSON.stringify({room:name,savedAt:new Date().toISOString(),persistenceSchema3364:PERSISTENCE_SCHEMA_3364,state});
  fs.writeFileSync(tmp,raw,'utf8');parseSavedRoom3364(tmp);
  if(fs.existsSync(f)){try{parseSavedRoom3364(f);fs.copyFileSync(f,bak)}catch(prevErr){console.warn(`[PERSIST] BACKUP ${name} skipped invalid primary: ${prevErr.message}`)}}
  fs.renameSync(tmp,f);persistLog(`SAVE ${name} -> ${f} (${raw.length} bytes)`)
 }catch(e){try{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch(_){}console.warn(`[PERSIST] SAVE ${name} -> ERROR: ${e.message}`)}
}
function room(name){if(!rooms.has(name))rooms.set(name,{clients:new Set(),latestState:null,host:null,revision:0,turnAuthority3300:null,processedCommands3300:new Map(),combatSeq3301:0,enemySeq3301:0,processedCombat3301:new Map(),enemyTombstones3301:new Set(),heroSeq3303:0,processedHero3303:new Map(),exploreSeq3305:0,processedExplore3305:new Map(),explorePending3305:{},resourceSeq3310:0,processedResource3310:new Map(),phaseSeq3311:0,phaseTxn3320:null,rejoinClaims3321:{},legacyPatchSeq3322:0});return rooms.get(name)}
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj))}

// ===== 3.30.0 ROOM-AUTHORITATIVE TURN ENGINE =====
// Stage 1 of the room-authority migration: the server owns Hero Actions, Pass state,
// round-completion decisions, and the single Enemy/World/End-phase resolution token.
// Clients may still submit ordinary gameplay snapshots for movement/combat/etc., but
// those snapshots are never allowed to overwrite server-owned turn fields.
const ROOM_ENGINE_VERSION_3300='3.36.21';
const HERO_ROSTER_3300=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
function gameFromRoom3300(r){return r?.latestState?.game||null}
function heroState3300(g,h){
 if(!g)return null;
 if(h==='Aldric')return {get actions(){return Number(g.actions||0)},set actions(v){g.actions=v},get hp(){return Number(g.hp||0)}};
 if(h==='Lyra')return g.lyra||null;
 if(h==='Seraphine')return g.seraphine||null;
 return g.heroRuntimeStates?.[h]||g.extraHeroes?.[h]||null;
}
function getHeroActions3300(g,h){const st=heroState3300(g,h);return Math.max(0,Number(st?.actions||0))}
function setHeroActions3300(g,h,v){const st=heroState3300(g,h);if(!st)return false;st.actions=Math.max(0,Math.min(6,Number(v)||0));return true}
function heroDefeated3300(g,h){const st=heroState3300(g,h);return !!st&&Number(st.hp||0)<=0}
function party3300(g){return [...new Set((Array.isArray(g?.partyHeroes)?g.partyHeroes:[]).filter(h=>HERO_ROSTER_3300.includes(h)))]}
function shuffleHeroCards33621(a){
 const out=[...(Array.isArray(a)?a:[])];
 for(let i=out.length-1;i>0;i--){const j=crypto.randomInt(i+1);[out[i],out[j]]=[out[j],out[i]]}
 return out;
}
function heroCardZones33621(g,h){
 if(h==='Aldric')return {deck:g.heroDeck||(g.heroDeck=[]),hand:g.heroHand||(g.heroHand=[]),discard:g.heroDiscard||(g.heroDiscard=[])};
 if(h==='Lyra')return {deck:g.lyraDeck||(g.lyraDeck=[]),hand:g.lyraHand||(g.lyraHand=[]),discard:g.lyraDiscard||(g.lyraDiscard=[])};
 if(h==='Seraphine')return {deck:g.seraphineDeck||(g.seraphineDeck=[]),hand:g.seraphineHand||(g.seraphineHand=[]),discard:g.seraphineDiscard||(g.seraphineDiscard=[])};
 const st=g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];return st?{deck:st.deck||(st.deck=[]),hand:st.hand||(st.hand=[]),discard:st.discard||(st.discard=[])}:null;
}
function drawHeroStartCards33621(g,h,n=2){
 const z=heroCardZones33621(g,h);if(!z)return 0;let drawn=0;
 for(let i=0;i<n;i++){
  if(!z.deck.length&&z.discard.length){z.deck.push(...shuffleHeroCards33621(z.discard.splice(0)))}
  const c=z.deck.shift();if(!c)break;z.hand.push(c);drawn++;
 }
 return drawn;
}
function resetHeroTurnFlags33621(g,h){
 const st=heroState3300(g,h);if(st&&typeof st==='object')st.difficultPrepared=false;
 if(h==='Aldric'){
  g.difficultPrepared=false;g.reactionsUsed=0;g.armorBuff=0;g.holdLine=false;g.unyielding=false;g.lastBastion=false;g.shieldEscort=false;
  if(g.holdFastInspiredGranted?.Seraphine&&typeof g.seraphine==='object'){} // condition cleanup remains in authored client resolver.
  g.holdFast=false;g.holdFastHeroes=[];g.holdFastMoveProtected={};g.holdFastInspiredGranted={};
 }else if(h==='Lyra'&&g.lyra){
  g.lyra.opportunistUsedThisTurn=false;g.lyra.difficultPrepared=false;g.lyra.travelersCharmUsed=false;g.lyra.vanishUntargetable=false;g.shadowSignal=false;g.shadowSignalDefeatDrawUsed=false;
 }else if(h==='Seraphine'&&g.seraphine){
  g.seraphine.attackedSinceTurn=false;g.seraphine.difficultPrepared=false;g.seraphine.blessedAttack=0;
 }else if(st){
  st.difficultPrepared=false;
 }
}
function startHeroTurn33621(r,hero){
 const t=r?.turnAuthority3300,g=gameFromRoom3300(r);if(!t||!g||t.started?.[hero])return {started:false,drawn:0};
 t.started[hero]=true;t.startSeqByHero=t.startSeqByHero||{};t.startSeqByHero[hero]=Number(t.startSeqByHero[hero]||0)+1;
 t.actions[hero]=3;setHeroActions3300(g,hero,3);resetHeroTurnFlags33621(g,hero);
 const drawn=drawHeroStartCards33621(g,hero,2);
 ensureResourceStore3310(r);r.resourceSeq3310=Number(r.resourceSeq3310||0)+1;
 r.latestState.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};if(r.latestState.game)r.latestState.game.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};
 ensureHeroStore3303(r);r.heroSeq3303=Number(r.heroSeq3303||0)+1;
 debugEvent('ROOM_HERO_TURN_START_33621',{hero,round:t.round,actions:3,drawn,startSeq:t.startSeqByHero[hero]});
 return {started:true,drawn};
}
function buildTurnAuthority3300(r,carrySeq=0){
 const g=gameFromRoom3300(r);if(!g)return null;
 const heroes=party3300(g),saved=g.roomAuthority3300||r.latestState?.roomAuthority3300||{},sameRound=Number(saved.round)===Number(g.round),modern=sameRound&&String(saved.version||'')==='3.36.21';
 const savedHero=String(saved.turnHero||''),actions={},started={},startSeqByHero={},passed={},pendingByHero={};
 for(const h of heroes){
  passed[h]=!!g.passedHeroes32521?.[h];pendingByHero[h]=!!(g.mechanics33621?.heroes?.[h]?.rapidPendingId||g.mechanics33621?.heroes?.[h]?.combatPending);
  if(modern){started[h]=!!saved.started?.[h]||passed[h];actions[h]=started[h]?Math.max(0,Number((saved.actions?.[h]??getHeroActions3300(g,h))||0)):0;startSeqByHero[h]=Math.max(0,Number(saved.startSeqByHero?.[h]||0));}
  else if(sameRound&&Object.keys(saved).length){ // one-round migration from 3.36.19: preserve the live room, then V2 fully applies next round.
   started[h]=true;actions[h]=getHeroActions3300(g,h);startSeqByHero[h]=0;
  }else{started[h]=false;actions[h]=0;startSeqByHero[h]=0;setHeroActions3300(g,h,0)}
 }
 const turnHero=sameRound&&heroes.includes(savedHero)&&started[savedHero]&&!passed[savedHero]&&!heroDefeated3300(g,savedHero)?savedHero:null;
 return {round:Number(g.round||1),phase:String(g.phase||'Hero Phase'),actions,started,startSeqByHero,passed,pendingByHero,turnHero,activationSeq:Number(saved.activationSeq||0),seq:Number(carrySeq||0),resolving:false,resolveToken:null,resolverRole:null,resolveRequestedAt:0};
}
function extraTurnState33621(g){return g.extraTurns33621||(g.extraTurns33621={used:{},active:{}})}
function beginExtraTurn33621(r,hero,source){
 const g=gameFromRoom3300(r),t=ensureTurnAuthority3300(r),extra=extraTurnState33621(g);
 const scope=source==='LT150'?`${g.campaign?.instanceId32537||''}:${g.campaign?.currentQuest}:${g.campaign?.day}`:mechanics33621.encounter(g),key=`${hero}:${source}:${scope}`;
 if(extra.used[key])return {error:'This extra-turn effect was already used.'};
 if(source==='LT150'&&(!mechanics33621.owns(g,hero,'LT150')||extra.active[hero]))return {error:'Orb of Ages needs ownership and cannot be used during an extra turn.'};
 if(t.turnHero!==hero||t.passed[hero]||heroDefeated3300(g,hero)||t.resolving)return {error:'End your own active turn to take an extra turn.'};
 extra.used[key]=true;extra.active[hero]=source;t.started[hero]=false;t.passed[hero]=false;
 const st=heroState3300(g,hero);if(st){for(const flag of ['turnAttackBonus','nextAttackBonus','connectedAttackThisTurn','movedTurn'])st[flag]=0}
 const life=startHeroTurn33621(r,hero);t.activationSeq++;t.seq++;applyTurnAuthorityToGame3300(r);return {extraTurn:source,drawn:life.drawn};
}
function normalizeTurnHero3300(r){
 const t=r?.turnAuthority3300,g=gameFromRoom3300(r);if(!t||!g)return false;
 const h=String(t.turnHero||'');
 if(!h)return false;
 if(!party3300(g).includes(h)||heroDefeated3300(g,h)||t.passed?.[h]===true){t.turnHero=null;t.activationSeq=Number(t.activationSeq||0)+1;return true}
 return false;
}
function ensureTurnAuthority3300(r){
 const g=gameFromRoom3300(r);if(!g)return null;
 const t=r.turnAuthority3300;
 if(!t||Number(t.round)!==Number(g.round)||(!t.resolving&&String(t.phase)!==String(g.phase))){r.turnAuthority3300=buildTurnAuthority3300(r,t?.seq||0)}
 normalizeTurnHero3300(r);
 return r.turnAuthority3300;
}
function applyTurnAuthorityToGame3300(r,targetState=r.latestState){
 const t=r.turnAuthority3300,g=targetState?.game;if(!t||!g)return;
 // While a room resolution token is outstanding, the canonical gameplay snapshot stays
 // in Hero Phase until the designated resolver returns the complete result. This prevents
 // clients from independently entering World Phase.
 if(!t.resolving){g.round=t.round;g.phase=t.phase}
 g.passedHeroes32521=g.passedHeroes32521||{};
 for(const h of party3300(g)){
   if(Object.prototype.hasOwnProperty.call(t.actions,h))setHeroActions3300(g,h,t.actions[h]);
   if(t.passed?.[h])g.passedHeroes32521[h]=true;else delete g.passedHeroes32521[h];
 }
 g.roomAuthority3300={version:ROOM_ENGINE_VERSION_3300,turnProtocol:'room-turn-owner-v2',round:t.round,phase:t.phase,seq:t.seq,actions:{...t.actions},started:{...t.started},startSeqByHero:{...t.startSeqByHero},turnHero:t.turnHero||null,activationSeq:Number(t.activationSeq||0),resolving:!!t.resolving,resolverRole:t.resolverRole||null};
 targetState.roomAuthority3300={...g.roomAuthority3300};
}
function turnPublic3300(r){
 const t=ensureTurnAuthority3300(r);if(!t)return null;
 return {version:ROOM_ENGINE_VERSION_3300,serverBuild:SERVER_BUILD_33621,turnProtocol:'room-turn-owner-v2',round:t.round,phase:t.phase,actions:{...t.actions},started:{...t.started},startSeqByHero:{...t.startSeqByHero},passed:{...t.passed},pendingByHero:{...t.pendingByHero},turnHero:t.turnHero||null,activationSeq:Number(t.activationSeq||0),seq:t.seq,resolving:!!t.resolving,resolverRole:t.resolverRole||null};
}
function broadcastTurn3300(r,rn,extra={}){const data={...turnPublic3300(r),...extra};for(const peer of r.clients)send(peer,{type:'TURN_STATE',room:rn,from:'SERVER',data})}
function pruneProcessed3300(r){if(!r.processedCommands3300)r.processedCommands3300=new Map();while(r.processedCommands3300.size>1500){const first=r.processedCommands3300.keys().next().value;r.processedCommands3300.delete(first)}}
function commandSeen3300(r,id){return !!id&&r.processedCommands3300?.has(id)}
function rememberCommand3300(r,id,result){if(!id)return;if(!r.processedCommands3300)r.processedCommands3300=new Map();r.processedCommands3300.set(id,result||true);pruneProcessed3300(r)}
function autoCompleteSpentHero3300(r,settledHero=null){
 const t=ensureTurnAuthority3300(r),g=gameFromRoom3300(r);if(!t||!g||t.phase!=='Hero Phase'||t.resolving||!t.turnHero)return false;
 const h=t.turnHero,roomPending=r.explorePending3305||{};
 if(Number(t.actions?.[h]||0)>0||t.pendingByHero?.[h]||roomPending[h])return false;
 const nightKey=`${h}:EQ044:${mechanics33621.encounter(g)}`;
 if(h!==settledHero&&mechanics33621.equipped(g,h,'EQ044')&&!extraTurnState33621(g).used[nightKey])return false;
 t.passed[h]=true;g.passedHeroes32521=g.passedHeroes32521||{};g.passedHeroes32521[h]=true;t.turnHero=null;t.activationSeq=Number(t.activationSeq||0)+1;t.seq++;applyTurnAuthorityToGame3300(r);
 debugEvent('ROOM_TURN_AUTO_COMPLETE_33621',{hero:h,round:t.round,activationSeq:t.activationSeq});return true;
}
function allHeroesFinished3300(r){
 const t=ensureTurnAuthority3300(r),g=gameFromRoom3300(r);if(!t||!g||t.phase!=='Hero Phase'||t.resolving)return false;
 if(g.campaign?.downtime===true)return false;
 const heroes=party3300(g).filter(h=>!heroDefeated3300(g,h)),roomPending=r.explorePending3305||{};
 if(!heroes.length)return party3300(g).length>0&&!Object.keys(roomPending).length;
 return heroes.every(h=>t.passed?.[h]===true&&!t.pendingByHero?.[h]&&!roomPending[h]);
}
function liveResolver3300(r){
 const live=[...r.clients].filter(c=>c.readyState===1&&c.joinReady);
 if(r.host&&live.includes(r.host))return r.host;
 return live[0]||null;
}
function maybeRequestRoundResolution3300(r,rn,reason='turn-state',settledHero=null){
 const completed=autoCompleteSpentHero3300(r,settledHero);if(completed){saveRoomState(rn,r.latestState);broadcastTurn3300(r,rn,{reason:'hero-actions-spent'})}const t=ensureTurnAuthority3300(r);if(!t||!r.adventureStarted||!allHeroesFinished3300(r))return false;
 const resolver=liveResolver3300(r);if(!resolver)return false;
 t.resolving=true;t.phase='Resolving';t.resolverRole=resolver.role||null;t.resolveToken=crypto.randomBytes(18).toString('hex');t.resolveRequestedAt=Date.now();t.seq++;
 applyTurnAuthorityToGame3300(r);const phaseJob3320=beginPhaseJob3320(r,rn,resolver,reason);saveRoomState(rn,r.latestState);
 broadcastTurn3300(r,rn,{reason:'round-complete'});broadcastPhase3311(r,rn,{reason:'phase-job-start'});
 send(resolver,{type:'ROUND_RESOLVE',room:rn,from:'SERVER',data:{token:t.resolveToken,round:t.round,seq:t.seq,resolverRole:t.resolverRole,reason,phaseTxnId:phaseJob3320?.id||null,serverSeed3320:phaseJob3320?.seed??null,beforeDigest:phaseJob3320?.beforeDigest||null,phaseJobVersion:ROOM_PHASE_JOB_VERSION_3320}});
 for(const peer of r.clients)if(peer!==resolver)send(peer,{type:'ROUND_RESOLVE_WAIT',room:rn,from:'SERVER',data:{round:t.round,resolverRole:t.resolverRole,seq:t.seq,phaseTxnId:phaseJob3320?.id||null}});
 debugEvent('ROOM_PHASE_JOB_3320',{room:rn,round:t.round,resolverRole:t.resolverRole,reason,seq:t.seq,phaseTxnId:phaseJob3320?.id,beforeDigest:phaseJob3320?.beforeDigest});
 persistLog(`ROOM AUTH ${rn} round=${t.round} complete -> phaseJob=${phaseJob3320?.id||'none'} resolver=${t.resolverRole} seq=${t.seq}`);
 return true;
}
function resetResolverIfGone3300(r,rn,role){
 const t=r.turnAuthority3300;if(!t?.resolving||t.resolverRole!==role)return;
 t.resolving=false;t.phase='Hero Phase';t.resolveToken=null;t.resolverRole=null;t.resolveRequestedAt=0;t.seq++;r.phaseTxn3320=null;
 broadcastTurn3300(r,rn,{reason:'resolver-disconnected'});setTimeout(()=>maybeRequestRoundResolution3300(r,rn,'resolver-disconnected'),50);
}
function preserveServerTurnFields3300(r,incoming){
 const t=ensureTurnAuthority3300(r);if(!t||!incoming?.game)return incoming;
 applyTurnAuthorityToGame3300(r,incoming);return incoming;
}

// 3.30.2: a failed Quest intentionally rebuilds the same scenario at Round 1 while
// the room's round-resolution token is still outstanding. That is a terminal result
// of the old round, not a round regression. Only accept the reset when the returned
// state proves the Quest failed and is now in Campaign Downtime.
function failedQuestResetResolution3302(state,t,fromRound){
 const g=state?.game,c=g?.campaign,last=c?.lastQuestOutcome;
 if(!g||!c||!last||!t)return false;
 const from=Number(fromRound||0),roomRound=Number(t.round||0),to=Number(g.round||0);
 const q=String(c.currentQuest||''),lastQ=String(last.quest||'');
 return from===roomRound && to===1 && String(g.phase||'')==='Hero Phase' &&
   String(last.outcome||'')==='Failed' && c.downtime===true && !!q && q===lastQ;
}

// ===== 3.30.1 ROOM-AUTHORITATIVE SHARED COMBAT LEDGER =====
// Clients still calculate card text during this migration stage, but changes to shared Enemy
// state are committed as additive room commands. Whole-game snapshots cannot resurrect,
// heal, remove, or move an existing Enemy behind the room ledger.
const ROOM_COMBAT_VERSION_3301='3.30.3';
function clone3301(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function nextEnemyId3301(r){
 r.enemySeq3301=Number(r.enemySeq3301||0)+1;
 return `room-enemy-${r.enemySeq3301}-${crypto.randomBytes(3).toString('hex')}`;
}
function ensureCombatStore3301(r){
 if(!r.processedCombat3301)r.processedCombat3301=new Map();
 if(!r.enemyTombstones3301)r.enemyTombstones3301=new Set();
 if(!Number.isInteger(r.combatSeq3301))r.combatSeq3301=0;
 if(!Number.isInteger(r.enemySeq3301))r.enemySeq3301=0;
}
function ensureEnemyIds3301(g,r){
 if(!g?.tiles)return 0;ensureCombatStore3301(r);let added=0;
 for(const t of Object.values(g.tiles||{}))for(const e of (t?.enemies||[])){
   if(!e||typeof e!=='object')continue;
   if(!e.roomEnemyId3301){e.roomEnemyId3301=nextEnemyId3301(r);added++}
 }
 return added;
}
function enemyMap3301(g){
 const out=new Map();
 for(const [tileKey,t] of Object.entries(g?.tiles||{})){
   (t?.enemies||[]).forEach((enemy,index)=>{if(enemy?.roomEnemyId3301)out.set(enemy.roomEnemyId3301,{tileKey,tile:t,enemy,index})});
 }
 return out;
}
function combatPublic3301(r){
 const g=gameFromRoom3300(r);if(!g)return null;ensureEnemyIds3301(g,r);
 const tiles={};for(const [k,t] of Object.entries(g.tiles||{}))tiles[k]=(t?.enemies||[]).map(clone3301);
 return {version:ROOM_COMBAT_VERSION_3301,seq:Number(r.combatSeq3301||0),round:Number(g.round||1),tiles};
}
function broadcastCombat3301(r,rn,extra={}){
 const combat=combatPublic3301(r);if(!combat)return;
 const data={...combat,...extra};for(const peer of r.clients)send(peer,{type:'COMBAT_STATE',room:rn,from:'SERVER',data});
}
function pruneCombatCommands3301(r){
 ensureCombatStore3301(r);
 while(r.processedCombat3301.size>2000){const first=r.processedCombat3301.keys().next().value;r.processedCombat3301.delete(first)}
 while(r.enemyTombstones3301.size>2000){const first=r.enemyTombstones3301.values().next().value;r.enemyTombstones3301.delete(first)}
}
function rememberCombatCommand3301(r,id){if(!id)return;ensureCombatStore3301(r);r.processedCombat3301.set(id,true);pruneCombatCommands3301(r)}
function mergeCanonicalEnemies3301(r,incoming){
 if(!incoming?.game?.tiles||!r?.latestState?.game?.tiles)return incoming;
 ensureCombatStore3301(r);
 const canonical=r.latestState.game;ensureEnemyIds3301(canonical,r);
 const canon=enemyMap3301(canonical),tombs=r.enemyTombstones3301;
 for(const t of Object.values(incoming.game.tiles||{})){
   const kept=[];
   for(const raw of (Array.isArray(t?.enemies)?t.enemies:[])){
     if(!raw||typeof raw!=='object')continue;
     const id=raw.roomEnemyId3301;
     if(id&&tombs.has(id))continue;
     if(id&&canon.has(id))continue;
     if(id&&!canon.has(id))continue;
     const e=clone3301(raw);e.roomEnemyId3301=nextEnemyId3301(r);kept.push(e);
   }
   t.enemies=kept;
 }
 for(const {tileKey,enemy} of canon.values()){
   const target=incoming.game.tiles?.[tileKey];
   if(!target)continue;
   target.enemies=Array.isArray(target.enemies)?target.enemies:[];
   target.enemies.push(clone3301(enemy));
 }
 ensureEnemyIds3301(incoming.game,r);
 return incoming;
}
function applyCombatChanges3301(r,changes){
 const g=gameFromRoom3300(r);if(!g)return {changed:false,applied:[]};
 ensureEnemyIds3301(g,r);ensureCombatStore3301(r);
 let map=enemyMap3301(g),changed=false,applied=[];
 for(const c of (Array.isArray(changes)?changes:[]).slice(0,40)){
   const id=String(c?.enemyId||'');if(!id)continue;
   let q=map.get(id);if(!q){applied.push({enemyId:id,ignored:'NOT_FOUND'});continue}
   const e=q.enemy,beforeHp=Number(e.hp||0),beforeTile=q.tileKey;
   const delta=Number(c.hpDelta||0);
   if(Number.isFinite(delta)&&delta!==0){
     const max=Number(e.max||e.maxHp||9999);e.hp=Math.max(0,Math.min(max,beforeHp+Math.trunc(delta)));changed=true;
   }
   e.conditions=Array.isArray(e.conditions)?e.conditions:[];
   const k=v=>typeof v==='string'?v:JSON.stringify(v);
   for(const add of (Array.isArray(c.addConditions)?c.addConditions:[])){
     if(!e.conditions.some(x=>k(x)===k(add))){e.conditions.push(clone3301(add));changed=true}
   }
   if(Array.isArray(c.removeConditions)&&c.removeConditions.length){
     const rm=new Set(c.removeConditions.map(k)),before=e.conditions.length;
     e.conditions=e.conditions.filter(x=>!rm.has(k(x)));if(e.conditions.length!==before)changed=true;
   }
   const to=String(c.toTileKey||'');
   if(to&&to!==q.tileKey&&g.tiles?.[to]){
     q.tile.enemies=(q.tile.enemies||[]).filter(x=>x!==e);
     g.tiles[to].enemies=Array.isArray(g.tiles[to].enemies)?g.tiles[to].enemies:[];
     g.tiles[to].enemies.push(e);changed=true;
   }
   const removed=c.remove===true||Number(e.hp||0)<=0;
   if(removed){
     e.hp=0; // Removal from a resolved Attack is a lethal ledger result, including remove-only diffs.
     for(const t of Object.values(g.tiles||{}))if(Array.isArray(t.enemies))t.enemies=t.enemies.filter(x=>x?.roomEnemyId3301!==id);
     r.enemyTombstones3301.add(id);changed=true;
   }
   applied.push({enemyId:id,hpBefore:beforeHp,hpAfter:Number(e.hp||0),tileBefore:beforeTile,tileAfter:to||beforeTile,removed});
   map=enemyMap3301(g);
 }
 return {changed,applied};
}


// ===== 3.30.3 ROOM-AUTHORITATIVE HERO STATE LEDGER =====
// Hero Health, position, core Conditions, and movement-preparation/status flags are no
// longer accepted from whole-game client snapshots. Clients submit additive/targeted
// HERO_COMMAND changes; stale snapshots are merged behind the canonical room ledger.
const ROOM_HERO_VERSION_3303='3.30.3';
const HERO_FLAG_KEYS_3303=['difficultPrepared','inspired','stealth','vanishUntargetable'];
function ensureHeroStore3303(r){
 if(!r.processedHero3303)r.processedHero3303=new Map();
 if(!Number.isInteger(r.heroSeq3303))r.heroSeq3303=0;
}
function heroObj3303(g,h){
 if(!g)return null;
 if(h==='Aldric')return g;
 if(h==='Lyra')return g.lyra||null;
 if(h==='Seraphine')return g.seraphine||null;
 return g.heroRuntimeStates?.[h]||g.extraHeroes?.[h]||null;
}
function heroPosRead3303(g,h){
 if(h==='Aldric')return {x:Number(g?.hero?.x||0),y:Number(g?.hero?.y||0)};
 const st=heroObj3303(g,h);return {x:Number(st?.x||0),y:Number(st?.y||0)};
}
function heroPosWrite3303(g,h,x,y){
 x=Math.trunc(Number(x)||0);y=Math.trunc(Number(y)||0);
 if(h==='Aldric'){g.hero=g.hero||{};g.hero.x=x;g.hero.y=y;return true}
 const st=heroObj3303(g,h);if(!st)return false;st.x=x;st.y=y;return true;
}
function heroConditionsRead3303(g,h){
 const a=h==='Aldric'?(g.conditions||(g.conditions=[])):(heroObj3303(g,h)?.conditions||[]);
 return clone3301(Array.isArray(a)?a:[]);
}
function heroConditionsWrite3303(g,h,a){
 const v=clone3301(Array.isArray(a)?a:[]);
 if(h==='Aldric'){g.conditions=v;return true}
 const st=heroObj3303(g,h);if(!st)return false;st.conditions=v;return true;
}
function heroHpRead3303(g,h){return Math.max(0,Number(h==='Aldric'?g?.hp:heroObj3303(g,h)?.hp)||0)}
function heroHpWrite3303(g,h,v){
 v=Math.max(0,Math.min(99,Math.trunc(Number(v)||0)));
 if(h==='Aldric'){g.hp=v;return true}
 const st=heroObj3303(g,h);if(!st)return false;st.hp=v;return true;
}
function heroFlagsRead3303(g,h){
 const st=heroObj3303(g,h),out={};
 for(const k of HERO_FLAG_KEYS_3303){
   if(h==='Aldric'&&Object.prototype.hasOwnProperty.call(g||{},k))out[k]=!!g[k];
   else if(st&&Object.prototype.hasOwnProperty.call(st,k))out[k]=!!st[k];
 }
 return out;
}
function heroFlagsWrite3303(g,h,flags){
 if(!flags||typeof flags!=='object')return;
 const st=heroObj3303(g,h);
 for(const k of HERO_FLAG_KEYS_3303){
   if(!Object.prototype.hasOwnProperty.call(flags,k))continue;
   if(h==='Aldric')g[k]=!!flags[k];else if(st)st[k]=!!flags[k];
 }
}
function heroSnapshot3303(g,h){
 if(!g||!HERO_ROSTER_3300.includes(h))return null;
 const p=heroPosRead3303(g,h);
 return {hero:h,hp:heroHpRead3303(g,h),x:p.x,y:p.y,conditions:heroConditionsRead3303(g,h),flags:heroFlagsRead3303(g,h)};
}
function heroPublic3303(r){
 const g=gameFromRoom3300(r);if(!g)return null;ensureHeroStore3303(r);
 const heroes={};for(const h of party3300(g)){const s=heroSnapshot3303(g,h);if(s)heroes[h]=s}
 return {version:ROOM_HERO_VERSION_3303,seq:Number(r.heroSeq3303||0),round:Number(g.round||1),heroes};
}
function broadcastHero3303(r,rn,extra={}){
 const heroState=heroPublic3303(r);if(!heroState)return;
 const data={...heroState,...extra};for(const peer of r.clients)send(peer,{type:'HERO_STATE',room:rn,from:'SERVER',data});
}
function pruneHeroCommands3303(r){ensureHeroStore3303(r);while(r.processedHero3303.size>2000){const first=r.processedHero3303.keys().next().value;r.processedHero3303.delete(first)}}
function rememberHeroCommand3303(r,id){if(!id)return;ensureHeroStore3303(r);r.processedHero3303.set(id,true);pruneHeroCommands3303(r)}
function condKey3303(v){try{return typeof v==='string'?v:JSON.stringify(v)}catch(_){return String(v)}}
function mergeCanonicalHeroes3303(r,incoming){
 if(!incoming?.game||!r?.latestState?.game)return incoming;
 const canonical=r.latestState.game;
 for(const h of party3300(canonical)){
   const s=heroSnapshot3303(canonical,h);if(!s)continue;
   heroHpWrite3303(incoming.game,h,s.hp);heroPosWrite3303(incoming.game,h,s.x,s.y);
   heroConditionsWrite3303(incoming.game,h,s.conditions);heroFlagsWrite3303(incoming.game,h,s.flags);
 }
 return incoming;
}
function applyHeroChanges3303(r,changes){
 const g=gameFromRoom3300(r);if(!g)return {changed:false,applied:[]};ensureHeroStore3303(r);
 const party=new Set(party3300(g));let changed=false,applied=[];
 for(const c of (Array.isArray(changes)?changes:[]).slice(0,40)){
   const h=String(c?.hero||'');if(!party.has(h)){applied.push({hero:h,ignored:'NOT_PARTY'});continue}
   const before=heroSnapshot3303(g,h);if(!before){applied.push({hero:h,ignored:'NO_STATE'});continue}
   const delta=Number(c.hpDelta||0);
   if(Number.isFinite(delta)&&delta!==0&&Math.abs(delta)<=99){const after=Math.max(0,Math.min(99,before.hp+Math.trunc(delta)));if(after!==before.hp){heroHpWrite3303(g,h,after);changed=true}}
   if(c.to&&Number.isFinite(Number(c.to.x))&&Number.isFinite(Number(c.to.y))){const x=Math.trunc(Number(c.to.x)),y=Math.trunc(Number(c.to.y));if(x!==before.x||y!==before.y){heroPosWrite3303(g,h,x,y);changed=true}}
   let conditions=heroConditionsRead3303(g,h);const key=v=>condKey3303(v);
   for(const add of (Array.isArray(c.addConditions)?c.addConditions:[])){if(!conditions.some(x=>key(x)===key(add))){conditions.push(clone3301(add));changed=true}}
   if(Array.isArray(c.removeConditions)&&c.removeConditions.length){const rm=new Set(c.removeConditions.map(key)),n=conditions.filter(x=>!rm.has(key(x)));if(n.length!==conditions.length){conditions=n;changed=true}}
   heroConditionsWrite3303(g,h,conditions);
   if(c.flags&&typeof c.flags==='object'){
     const current=heroFlagsRead3303(g,h),next={...current};let flagChanged=false;
     for(const k of HERO_FLAG_KEYS_3303)if(Object.prototype.hasOwnProperty.call(c.flags,k)&&!!c.flags[k]!==!!current[k]){next[k]=!!c.flags[k];flagChanged=true}
     if(flagChanged){heroFlagsWrite3303(g,h,next);changed=true}
   }
   const after=heroSnapshot3303(g,h);applied.push({hero:h,hpBefore:before.hp,hpAfter:after.hp,from:{x:before.x,y:before.y},to:{x:after.x,y:after.y},conditions:after.conditions,flags:after.flags});
 }
 return {changed,applied};
}



// ===== 3.31.0 ROOM-AUTHORITATIVE CARDS / INVENTORY / LOOT =====
const ROOM_RESOURCE_VERSION_3310='3.31.0';
function ensureResourceStore3310(r){
 if(!r.processedResource3310)r.processedResource3310=new Map();
 if(!Number.isInteger(r.resourceSeq3310))r.resourceSeq3310=0;
 // A process restart creates a fresh in-memory room before the persisted snapshot is
 // loaded. Re-hydrate the monotonic resource sequence from disk so a reconnect can
 // never fall back to seq 0 and accept a pre-restart stale resource command.
 const saved=Number(r.latestState?.resourceAuthority3310?.seq??r.latestState?.game?.resourceAuthority3310?.seq??0);
 if(Number.isInteger(saved)&&saved>Number(r.resourceSeq3310||0))r.resourceSeq3310=saved;
}
function heroCardZones3310(g,h){
 if(h==='Aldric')return {deck:g.heroDeck||[],hand:g.heroHand||[],discard:g.heroDiscard||[]};
 if(h==='Lyra')return {deck:g.lyraDeck||[],hand:g.lyraHand||[],discard:g.lyraDiscard||[]};
 if(h==='Seraphine')return {deck:g.seraphineDeck||[],hand:g.seraphineHand||[],discard:g.seraphineDiscard||[]};
 const st=g.heroRuntimeStates?.[h]||g.extraHeroes?.[h]||{};return {deck:st.deck||[],hand:st.hand||[],discard:st.discard||[]};
}
function writeHeroCardZones3310(g,h,z){
 const deck=clone3301(z?.deck||[]),hand=clone3301(z?.hand||[]),discard=clone3301(z?.discard||[]);
 if(h==='Aldric'){g.heroDeck=deck;g.heroHand=hand;g.heroDiscard=discard;return}
 if(h==='Lyra'){g.lyraDeck=deck;g.lyraHand=hand;g.lyraDiscard=discard;return}
 if(h==='Seraphine'){g.seraphineDeck=deck;g.seraphineHand=hand;g.seraphineDiscard=discard;return}
 const st=g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];if(st){st.deck=deck;st.hand=hand;st.discard=discard}
}
function resourceSnapshot3310(g){
 if(!g)return null;const cards={};for(const h of party3300(g))cards[h]=clone3301(heroCardZones3310(g,h));
 return {abilityCooldowns33621:mechanics33621.cooldownSnapshot(g),mechanics33621:clone3301(g.mechanics33621||{heroes:{}}),extraTurns33621:clone3301(g.extraTurns33621||{used:{},active:{}}),cards,inventory:clone3301(g.inventory||{}),equipped:clone3301(g.equipped||{}),partyQuestItems:clone3301(g.partyQuestItems||[]),lootDeck:clone3301(g.lootDeck||[]),lootDiscard:clone3301(g.lootDiscard||[]),equipmentDecks:clone3301(g.equipmentDecks||{}),gold:Number(g.gold||0),supplies:Number(g.partySupplies33615||0),reputation:Number(g.reputation||0),factionReputation:clone3301(g.campaign?.factionReputation3342||{}),xp:clone3301(g.xp||{}),levels:clone3301(g.levels||{}),professions:clone3301(g.professions||g.professionState3250||null),crafting:clone3301(g.crafting||g.craftingState3250||null)};
}
function resourcePublic3310(r){ensureResourceStore3310(r);const x=resourceSnapshot3310(gameFromRoom3300(r));return x?{version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310,round:Number(gameFromRoom3300(r)?.round||1),resources:x}:null}
function validateResources3310(g,res){
 if(!res||typeof res!=='object')return 'Missing resource state.';
 if(res.abilityCooldowns33621){const cd=res.abilityCooldowns33621;if(!cd||typeof cd!=='object'||Array.isArray(cd))return 'Invalid Ability cooldown state.';for(const [key,value]of Object.entries(cd.round||{}))if(key.length>180||!key.includes('::')||!Number.isInteger(value)||value<0||value>Number(g.round||0))return 'Invalid Ability round cooldown.';for(const [h,values]of Object.entries(cd.levelRound||{})){if(!party3300(g).includes(h)||!values||typeof values!=='object'||Array.isArray(values))return 'Invalid Ability owner.';for(const [key,value]of Object.entries(values))if(['__proto__','constructor','prototype'].includes(key)||!Number.isInteger(value)||value<0||value>Number(g.round||0))return 'Invalid level Ability cooldown.'}}

 if(!Number.isFinite(Number(res.gold))||Number(res.gold)<0||Number(res.gold)>1e9)return 'Invalid Party Gold.';
 if(!Number.isFinite(Number(res.supplies??0))||Number(res.supplies??0)<0||Number(res.supplies??0)>9999)return 'Invalid Party Supply.';
 if(!Number.isFinite(Number(res.reputation))||Math.abs(Number(res.reputation))>10000)return 'Invalid Reputation.';
 if(res.factionReputation!==undefined){if(!res.factionReputation||typeof res.factionReputation!=='object'||Array.isArray(res.factionReputation))return 'Invalid Faction Reputation.';const ks=Object.keys(res.factionReputation);if(ks.length>32)return 'Too many Faction Reputation tracks.';for(const [k,v] of Object.entries(res.factionReputation)){if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(k))return 'Invalid Faction Reputation key.';if(!Number.isFinite(Number(v))||Number(v)<-5||Number(v)>6)return 'Faction Reputation out of range.'}}
 for(const [h,z] of Object.entries(res.cards||{})){if(!party3300(g).includes(h))continue;const seen=new Set();for(const c of [...(z.deck||[]),...(z.hand||[]),...(z.discard||[])]){const uid=String(c?.uid||'');if(uid){if(seen.has(uid))return `Duplicate Hero card UID for ${h}.`;seen.add(uid)}}}
 for(const arr of Object.values(res.inventory||{}))for(const row of (Array.isArray(arr)?arr:[])){const q=Number(row?.qty||0);if(!Number.isInteger(q)||q<1||q>99)return 'Invalid inventory quantity.'}
 if((res.lootDeck||[]).length>5000||(res.lootDiscard||[]).length>5000)return 'Loot state is too large.';
 return null;
}
function applyResources3310(g,res,actor){
 if(actor&&res.abilityCooldowns33621)mechanics33621.applyCooldowns(g,res.abilityCooldowns33621,actor);
 for(const h of party3300(g))if(res.cards?.[h])writeHeroCardZones3310(g,h,res.cards[h]);
 g.inventory=clone3301(res.inventory||{});g.equipped=clone3301(res.equipped||{});g.partyQuestItems=clone3301(res.partyQuestItems||[]);g.lootDeck=clone3301(res.lootDeck||[]);g.lootDiscard=clone3301(res.lootDiscard||[]);g.equipmentDecks=clone3301(res.equipmentDecks||{});g.gold=Math.max(0,Number(res.gold||0));g.partySupplies33615=Math.max(0,Number(res.supplies||0));g.reputation=Number(res.reputation||0);g.campaign=g.campaign||{};if(res.factionReputation!==undefined)g.campaign.factionReputation3342=clone3301(res.factionReputation||{});g.xp=clone3301(res.xp||{});g.levels=clone3301(res.levels||{});if(res.professions!==undefined){if(g.professions!==undefined)g.professions=clone3301(res.professions);else if(g.professionState3250!==undefined)g.professionState3250=clone3301(res.professions)}if(res.crafting!==undefined){if(g.crafting!==undefined)g.crafting=clone3301(res.crafting);else if(g.craftingState3250!==undefined)g.craftingState3250=clone3301(res.crafting)}
}
function mergeCanonicalResources3310(r,incoming){if(!incoming?.game||!r?.latestState?.game)return incoming;const res=resourceSnapshot3310(r.latestState.game);if(res)applyResources3310(incoming.game,res);return incoming}
function broadcastResources3310(r,rn,extra={}){const data=resourcePublic3310(r);if(!data)return;for(const peer of r.clients)send(peer,{type:'RESOURCE_STATE',room:rn,from:'SERVER',data:{...data,...extra}})}
function rememberResource3310(r,id){ensureResourceStore3310(r);if(id)r.processedResource3310.set(id,true);while(r.processedResource3310.size>2000){const k=r.processedResource3310.keys().next().value;r.processedResource3310.delete(k)}}

// ===== 3.31.1 ROOM-AUTHORITATIVE ENEMY/WORLD PHASE TRANSACTIONS =====
const ROOM_PHASE_VERSION_3311='3.31.1';
function ensurePhaseStore3311(r){if(!Number.isInteger(r.phaseSeq3311))r.phaseSeq3311=0;const saved=Number(r.latestState?.phaseAuthority3311?.seq??r.latestState?.game?.phaseAuthority3311?.seq??0);if(Number.isInteger(saved)&&saved>Number(r.phaseSeq3311||0))r.phaseSeq3311=saved}
function phasePublic3311(r){ensurePhaseStore3311(r);return {version:ROOM_PHASE_VERSION_3311,seq:Number(r.phaseSeq3311||0),round:Number(r.turnAuthority3300?.round||gameFromRoom3300(r)?.round||1),phase:String(r.turnAuthority3300?.phase||gameFromRoom3300(r)?.phase||'Hero Phase'),resolving:!!r.turnAuthority3300?.resolving,resolverRole:r.turnAuthority3300?.resolverRole||null}}
function broadcastPhase3311(r,rn,extra={}){for(const peer of r.clients)send(peer,{type:'PHASE_STATE',room:rn,from:'SERVER',data:{...phasePublic3311(r),...extra}})}
function validateRoundResult3311(r,state,t,failedReset){const g=state?.game,old=gameFromRoom3300(r);if(!g||!old)return 'Missing round result.';const before=party3300(old).slice().sort().join('|'),after=party3300(g).slice().sort().join('|');if(before!==after)return 'Round resolution cannot change the party roster.';if(!failedReset&&Number(g.round||0)>Number(t.round||0)+1)return 'Round resolution skipped more than one round.';if(!failedReset&&Number(g.round||0)<Number(t.round||0))return 'Round resolution regressed the round.';return null}


// ===== 3.32.0 SERVER-OWNED PHASE JOB =====
// The room now owns the phase transaction identity and all random entropy used during
// Enemy / World / End resolution. The designated browser is a rules worker for authored
// reaction/UI code only; it cannot start a phase, choose a seed, or commit outside this job.
const ROOM_PHASE_JOB_VERSION_3320='3.32.0';
function phaseSummary3320(g){
 if(!g)return null;
 const heroes={};for(const h of party3300(g)){const st=heroState3300(g,h);heroes[h]={hp:Number(st?.hp||0),actions:Number(st?.actions||0),x:Number(st?.x??((h==='Aldric'?g.hero?.x:0)||0)),y:Number(st?.y??((h==='Aldric'?g.hero?.y:0)||0))}}
 const enemies=[];for(const [pos,t] of Object.entries(g.tiles||{}))for(const e of (t.enemies||[]))if(Number(e?.hp||0)>0)enemies.push({id:String(e.roomEnemyId3301||e.uid||e.id||e.name||''),card:String(e.id||e.type||''),pos,hp:Number(e.hp||0),conditions:[...(e.conditions||[])].sort()});
 enemies.sort((a,b)=>String(a.id).localeCompare(String(b.id)));
 return {round:Number(g.round||1),phase:String(g.phase||'Hero Phase'),party:party3300(g),heroes,enemies,quest:String(g.campaign?.currentQuest||''),questStatus:clone3301(g.campaign?.questStatus||{}),downtime:!!g.campaign?.downtime};
}
function phaseDigest3320(g){return crypto.createHash('sha256').update(JSON.stringify(phaseSummary3320(g)||{})).digest('hex')}
function beginPhaseJob3320(r,rn,resolver,reason){
 const t=ensureTurnAuthority3300(r),g=gameFromRoom3300(r);if(!t||!g||!resolver)return null;
 const seed=crypto.randomBytes(4).readUInt32BE(0),id=crypto.randomBytes(16).toString('hex');
 const job={version:ROOM_PHASE_JOB_VERSION_3320,id,token:t.resolveToken,seed,round:Number(t.round||g.round||1),resolverRole:String(resolver.role||''),beforeDigest:phaseDigest3320(g),before:phaseSummary3320(g),reason:String(reason||'round-complete'),createdAt:Date.now()};
 r.phaseTxn3320=job;return job;
}
function phaseJobPublic3320(r){const j=r.phaseTxn3320;if(!j)return null;return {version:j.version,id:j.id,round:j.round,resolverRole:j.resolverRole,beforeDigest:j.beforeDigest,createdAt:j.createdAt}}
function validatePhaseJobResult3320(r,m,state){
 const j=r.phaseTxn3320;if(!j)return 'No server phase job is active.';
 if(String(m.data?.phaseTxnId||'')!==String(j.id))return 'Phase job identity does not match the room.';
 if(String(m.data?.beforeDigest||'')!==String(j.beforeDigest))return 'Resolver did not execute from the authoritative pre-phase state.';
 const after=phaseSummary3320(state?.game);if(!after)return 'Missing phase result summary.';
 if(after.party.slice().sort().join('|')!==j.before.party.slice().sort().join('|'))return 'Phase job cannot change the party roster.';
 return null;
}

// ===== 3.32.1 CAMPAIGN SAVE / REJOIN AUTHORITY =====
const CAMPAIGN_AUTH_VERSION_3321='3.32.1';
function hashRejoin3321(token){return crypto.createHash('sha256').update(String(token||'')).digest('hex')}
function restoreClaims3321(r){
 const saved=r.latestState?.campaignAuthority3321?.claims||r.latestState?.game?.campaignAuthority3321?.claims||{};
 if(!r.rejoinClaims3321||!Object.keys(r.rejoinClaims3321).length)r.rejoinClaims3321={...saved};
 return r.rejoinClaims3321;
}
function syncCampaignAuthority3321(r,rn,state=r.latestState){
 if(!state||typeof state!=='object')return null;restoreClaims3321(r);const g=state.game||{};
 const meta={version:CAMPAIGN_AUTH_VERSION_3321,room:safeRoomName(rn),roster:party3300(g),quest:String(g.campaign?.currentQuest||''),campaignDay:Number(g.campaign?.day||g.campaign?.campaignDay||0),downtime:!!g.campaign?.downtime,claims:{...(r.rejoinClaims3321||{})},updatedAt:new Date().toISOString()};
 state.campaignAuthority3321=meta;if(state.game)state.game.campaignAuthority3321={...meta};return meta;
}
function authorizeHeroRejoin3321(r,rn,hero,token,{fresh=false}={}){
 if(fresh)r.rejoinClaims3321={};else restoreClaims3321(r);
 const claims=r.rejoinClaims3321||(r.rejoinClaims3321={}),existing=claims[hero];
 if(existing&&!fresh&&token&&hashRejoin3321(token)===String(existing.hash||''))return {ok:true,token,existing:true};
 // A disconnected Hero can always be reclaimed with the room code. If browser storage was
 // cleared or the player changed devices, rotate the credential instead of permanently
 // locking that campaign Hero out. Live duplicate control is rejected separately above.
 const issued=crypto.randomBytes(32).toString('hex');claims[hero]={hash:hashRejoin3321(issued),claimedAt:existing?.claimedAt||new Date().toISOString(),rotatedAt:existing&&!fresh?new Date().toISOString():null};return {ok:true,token:issued,existing:!!existing,recovered:!!existing&&!fresh};
}
function sendRejoinCredential3321(ws,r,rn,token){if(!token)return;send(ws,{type:'REJOIN_CREDENTIAL',room:rn,from:'SERVER',data:{version:CAMPAIGN_AUTH_VERSION_3321,hero:ws.role,token}});syncCampaignAuthority3321(r,rn,r.latestState)}

// ===== 3.32.2 LEGACY WRITE-PATH RETIREMENT =====
const LEGACY_PATCH_VERSION_3322='3.32.2';
function commitCompatibilityPatch3322(r,rn,ws,base,proposed){
 if(r.turnAuthority3300?.resolving)return {ok:false,reason:'Room is resolving a server phase job.'};
 if(r.latestState&&(!Number.isInteger(base)||base!==r.revision))return {ok:false,reason:'stale',state:r.latestState};
 if(!proposed?.game||typeof proposed.game!=='object')return {ok:false,reason:'Missing game patch.'};
 const beforeParty=party3300(gameFromRoom3300(r)).slice().sort().join('|'),incomingParty=party3300(proposed.game).slice().sort().join('|');
 if(beforeParty&&incomingParty&&beforeParty!==incomingParty)return {ok:false,reason:'Compatibility patches cannot change the party roster.'};
 r.latestState=mergeCanonicalEnemies3301(r,mergeCanonicalHeroes3303(r,mergeCanonicalExploration3305(r,mergeCanonicalResources3310(r,preserveServerTurnFields3300(r,proposed)))));
 r.latestState.heroOwners32724={...(r.heroOwners32724||{})};if(r.latestState.game)r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};
 r.legacyPatchSeq3322=Number(r.legacyPatchSeq3322||0)+1;r.latestState.legacyPatchAuthority3322={version:LEGACY_PATCH_VERSION_3322,seq:r.legacyPatchSeq3322};if(r.latestState.game)r.latestState.game.legacyPatchAuthority3322={version:LEGACY_PATCH_VERSION_3322,seq:r.legacyPatchSeq3322};
 r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);return {ok:true,state:r.latestState};
}

// ===== 3.30.7 EXPLORATION TERMINAL-COMMIT / SEARCH DUPLICATION FIX =====
// The room owns shared map/deck progression. Clients still execute authored reveal/search
// effects locally during this migration stage, but they cannot choose a different shared
// draw, restore a consumed Search, resurrect an unrevealed tile, or disagree about First Visit.
const ROOM_EXPLORATION_VERSION_3305='3.30.7';
function ensureExploreStore3305(r){
 if(!r.processedExplore3305)r.processedExplore3305=new Map();
 if(!Number.isInteger(r.exploreSeq3305))r.exploreSeq3305=0;
 const saved=r.latestState?.explorationAuthority3305;
 if(saved&&Number(saved.seq||0)>Number(r.exploreSeq3305||0))r.exploreSeq3305=Number(saved.seq||0);
 // 3.30.7: hydrate persisted pending prompts exactly once when the room is loaded.
 // Never repopulate a live empty pending map after SEARCH_RESOLVE / SEARCH_CANCEL /
 // ENCOUNTER_RESOLVE / EXPLORE_PLACE clears the final prompt. 3.30.6 used emptiness
 // as the hydration signal, which resurrected the just-resolved prompt and allowed
 // the same Search to resolve repeatedly (Search 1/1 -> 2/1, duplicated deck cards).
 if(!r.explorePendingHydrated3307){
   if(!r.explorePending3305||typeof r.explorePending3305!=='object')r.explorePending3305=clone3301(saved?.pendingByHero||{})||{};
   else if(Object.keys(r.explorePending3305).length===0&&saved?.pendingByHero)r.explorePending3305=clone3301(saved.pendingByHero)||{};
   r.explorePendingHydrated3307=true;
 }else if(!r.explorePending3305||typeof r.explorePending3305!=='object')r.explorePending3305={};
}
function exploreCardKey3305(x){return String(x?.id||x?.uid||x?.name||'')}
function explorationTile3305(t){if(!t)return null;const x=clone3301(t);delete x.enemies;return x}
function syncExploreMeta3305(r){
 ensureExploreStore3305(r);if(!r.latestState)return;
 r.latestState.explorationAuthority3305={version:ROOM_EXPLORATION_VERSION_3305,seq:Number(r.exploreSeq3305||0),pendingByHero:clone3301(r.explorePending3305)};
 if(r.latestState.game)r.latestState.game.explorationAuthority3305={version:ROOM_EXPLORATION_VERSION_3305,seq:Number(r.exploreSeq3305||0)};
}
function explorationPublic3305(r){
 const g=gameFromRoom3300(r);if(!g)return null;ensureExploreStore3305(r);
 const tiles={};for(const [k,t] of Object.entries(g.tiles||{}))tiles[k]=explorationTile3305(t);
 return {version:ROOM_EXPLORATION_VERSION_3305,seq:Number(r.exploreSeq3305||0),round:Number(g.round||1),pool:clone3301(g.pool||[]),searchDeck:clone3301(g.searchDeck||[]),encDeck:clone3301(g.encDeck||[]),encDiscard:clone3301(g.encDiscard||[]),tiles,pendingByHero:clone3301(r.explorePending3305)};
}
function broadcastExploration3305(r,rn,extra={}){const data=explorationPublic3305(r);if(!data)return;for(const peer of r.clients)send(peer,{type:'EXPLORATION_STATE',room:rn,from:'SERVER',data:{...data,...extra}})}
function pruneExploreCommands3305(r){ensureExploreStore3305(r);while(r.processedExplore3305.size>2000){const k=r.processedExplore3305.keys().next().value;r.processedExplore3305.delete(k)}}
function rememberExploreCommand3305(r,id){if(!id)return;ensureExploreStore3305(r);r.processedExplore3305.set(id,true);pruneExploreCommands3305(r)}
function bumpExplore3305(r){ensureExploreStore3305(r);r.exploreSeq3305=Number(r.exploreSeq3305||0)+1;syncExploreMeta3305(r)}
function shuffle3305(a){return shuffleCopy(a)}
function mergeCanonicalExploration3305(r,incoming){
 if(!incoming?.game||!r?.latestState?.game)return incoming;ensureExploreStore3305(r);
 const c=r.latestState.game,ig=incoming.game;
 ig.pool=clone3301(c.pool||[]);ig.searchDeck=clone3301(c.searchDeck||[]);ig.encDeck=clone3301(c.encDeck||[]);ig.encDiscard=clone3301(c.encDiscard||[]);
 ig.tiles=ig.tiles&&typeof ig.tiles==='object'?ig.tiles:{};
 const structural=['id','name','terrain','can','traits','type','edges','required','searchLimit','searchCount','visited','enc','encounterLevel','reveal','ongoing','special'];
 for(const k of Object.keys(ig.tiles))if(!Object.prototype.hasOwnProperty.call(c.tiles||{},k))delete ig.tiles[k];
 for(const [k,ct] of Object.entries(c.tiles||{})){
   if(!ig.tiles[k])ig.tiles[k]=clone3301(ct);else for(const f of structural)if(Object.prototype.hasOwnProperty.call(ct,f))ig.tiles[k][f]=clone3301(ct[f]);
 }
 incoming.explorationAuthority3305=clone3301(r.latestState.explorationAuthority3305||{version:ROOM_EXPLORATION_VERSION_3305,seq:r.exploreSeq3305,pendingByHero:r.explorePending3305});
 ig.explorationAuthority3305={version:ROOM_EXPLORATION_VERSION_3305,seq:Number(r.exploreSeq3305||0)};
 return incoming;
}
function firstNValidPool3305(g,valid,n=2){const out=[];for(const t of (g.pool||[])){if(valid.has(exploreCardKey3305(t))){out.push(t);if(out.length>=n)break}}return out}
function drawLocation3305(r,hero,cmd){
 const g=gameFromRoom3300(r);ensureExploreStore3305(r);if(r.explorePending3305[hero])return {error:'This Hero already has a room-owned prompt pending.'};
 const valid=new Set((Array.isArray(cmd.validTileIds)?cmd.validTileIds:[]).map(String));if(!valid.size)return {error:'No legal Location IDs were supplied.'};
 const preferred=String(cmd.preferredTileId||''),firstTwo=firstNValidPool3305(g,valid,2),preferredOkay=preferred&&firstTwo.some(t=>exploreCardKey3305(t)===preferred);
 let chosen=null,skipped=[];
 if(preferredOkay){const i=g.pool.findIndex(t=>exploreCardKey3305(t)===preferred);chosen=g.pool.splice(i,1)[0]}
 else{
   while(g.pool.length){const t=g.pool.shift();if(valid.has(exploreCardKey3305(t))){chosen=t;break}skipped.push(t)}
 }
 if(!chosen){g.pool=shuffle3305([...skipped,...g.pool]);return {changed:true,noLegal:true}}
 const pending={kind:'explore',hero,round:Number(g.round||1),tile:clone3301(chosen),skipped:clone3301(skipped),origin:clone3301(cmd.origin||{}),label:String(cmd.label||'EXPLORE')};
 r.explorePending3305[hero]=pending;return {changed:true,pending:clone3301(pending)};
}
function replaceLocation3305(r,hero,cmd){
 const g=gameFromRoom3300(r),p=r.explorePending3305?.[hero];if(!p||p.kind!=='explore')return {error:'No room-owned Explore draw is pending.'};
 const id=String(cmd.tileId||''),i=(g.pool||[]).findIndex(t=>exploreCardKey3305(t)===id);if(i<0)return {error:'Replacement Location is not available in the room pool.'};
 const next=g.pool.splice(i,1)[0],old=p.tile;
 if(cmd.discardOld===true){g.explorationDiscard3304=Array.isArray(g.explorationDiscard3304)?g.explorationDiscard3304:[];g.explorationDiscard3304.push(clone3301(old))}else g.pool.unshift(clone3301(old));
 p.tile=clone3301(next);p.replaced=true;return {changed:true,pending:clone3301(p)};
}
function placeLocation3305(r,hero,cmd,direct=false){
 const g=gameFromRoom3300(r);let p=r.explorePending3305?.[hero],tile=null,skipped=[];
 if(!direct){if(!p||p.kind!=='explore')return {error:'No room-owned Explore draw is pending.'};if(String(cmd.tileId||'')!==exploreCardKey3305(p.tile))return {error:'Placement tile does not match the room draw.'};tile=clone3301(p.tile);skipped=clone3301(p.skipped||[])}
 else{
   const id=String(cmd.tileId||''),i=(g.pool||[]).findIndex(t=>exploreCardKey3305(t)===id);if(i<0)return {error:'That Location is not available in the room pool.'};tile=clone3301(g.pool.splice(i,1)[0]);
   const skipIds=new Set((Array.isArray(cmd.skippedIds)?cmd.skippedIds:[]).map(String));if(skipIds.size){const keep=[];for(const t of g.pool){if(skipIds.has(exploreCardKey3305(t)))skipped.push(t);else keep.push(t)}g.pool=keep}
 }
 const x=Math.trunc(Number(cmd.x)),y=Math.trunc(Number(cmd.y));if(!Number.isFinite(x)||!Number.isFinite(y))return {error:'Invalid placement coordinates.'};
 const k=`${x},${y}`;if(g.tiles?.[k]&&String(g.tiles[k].id||'')!==String(tile.id||''))return {error:'That map position is already occupied.'};
 tile.edges=clone3301(cmd.edges||tile.edges||{});tile.enemies=Array.isArray(tile.enemies)?tile.enemies:[];g.tiles=g.tiles||{};g.tiles[k]=tile;
 g.pool=shuffle3305([...(g.pool||[]),...skipped]);delete r.explorePending3305[hero];return {changed:true,placed:{tileKey:k,tile:explorationTile3305(tile)}};
}
function reorderPool3305(r,cmd){
 const g=gameFromRoom3300(r),ids=(Array.isArray(cmd.order)?cmd.order:[]).map(String),pool=g.pool||[];if(ids.length!==pool.length)return {error:'Pool reorder length mismatch.'};
 const m=new Map(pool.map(t=>[exploreCardKey3305(t),t]));if(new Set(ids).size!==ids.length||ids.some(id=>!m.has(id)))return {error:'Pool reorder does not match the room pool.'};g.pool=ids.map(id=>m.get(id));return {changed:true};
}
function reorderEncounter3305(r,cmd){
 const g=gameFromRoom3300(r),ids=(Array.isArray(cmd.order)?cmd.order:[]).map(String),deck=g.encDeck||[];if(ids.length!==deck.length)return {error:'Encounter reorder length mismatch.'};
 // Encounter decks can contain multiple physical copies with the same Card ID. Match
 // against per-ID queues rather than requiring globally unique IDs.
 const buckets=new Map();for(const c of deck){const k=exploreCardKey3305(c);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(c)}
 const next=[];for(const id of ids){const q=buckets.get(id);if(!q?.length)return {error:'Encounter reorder does not match the room Encounter Deck.'};next.push(q.shift())}
 if([...buckets.values()].some(q=>q.length))return {error:'Encounter reorder did not consume the full room Encounter Deck.'};g.encDeck=next;return {changed:true};
}
function drawSearch3305(r,hero,cmd){
 const g=gameFromRoom3300(r);if(r.explorePending3305?.[hero])return {error:'This Hero already has a room-owned prompt pending.'};
 const tileKey=String(cmd.tileKey||''),tile=g.tiles?.[tileKey];if(!tile)return {error:'Search Location is not revealed in the room.'};
 if(mechanics33621.restriction(tile))return {error:'Unlock this Location before Searching.'};
 const consumeSearch=cmd.consumeSearch!==false,searchCount=Math.max(0,Number(tile.searchCount||0)),searchLimit=Math.max(0,Number(tile.searchLimit||0));
 if(consumeSearch&&searchCount>=searchLimit)return {error:`${tile.name||'This Location'} has already reached its Search limit (${searchCount}/${searchLimit}).`};
 const eligible=new Set((Array.isArray(cmd.eligibleCardIds)?cmd.eligibleCardIds:[]).map(String)),skipped=[];let card=null;
 while((g.searchDeck||[]).length){const c=g.searchDeck.shift();if(eligible.has(exploreCardKey3305(c))){card=c;break}skipped.push(c)}
 if(!card){g.searchDeck=shuffle3305([...skipped,...(g.searchDeck||[])]);return {changed:true,noEligible:true}}
 const pending={kind:'search',hero,round:Number(g.round||1),tileKey,card:clone3301(card),skipped:clone3301(skipped),free:!!cmd.free,consumeSearch,source:String(cmd.source||'Search')};r.explorePending3305[hero]=pending;return {changed:true,pending:clone3301(pending)};
}
function finishSearch3305(r,hero,cancel=false){
 const g=gameFromRoom3300(r),p=r.explorePending3305?.[hero];if(!p||p.kind!=='search')return {error:'No room-owned Search is pending.'};
 if(!cancel&&p.consumeSearch!==false){const t=g.tiles?.[p.tileKey];if(t)t.searchCount=Math.min(Number(t.searchLimit??999),Number(t.searchCount||0)+1)}
 g.searchDeck=shuffle3305([...(g.searchDeck||[]),...(p.skipped||[]),p.card]);delete r.explorePending3305[hero];return {changed:true,cancelled:cancel};
}
function parseFixedSeverity3305(v){if(v===null||v===undefined||v==='')return null;const m=String(v).match(/\d+/);return m?Math.max(1,Number(m[0])):null}
function drawEncounter3305(r,hero,cmd){
 const g=gameFromRoom3300(r);if(r.explorePending3305?.[hero])return {error:'This Hero already has a room-owned prompt pending.'};
 const source=String(cmd.source||'Encounter'),origin=clone3301(cmd.origin||{}),firstVisitTileKey=source==='First Visit'?String(origin.firstVisitTileKey||`${Math.trunc(Number(origin.x)||0)},${Math.trunc(Number(origin.y)||0)}`):'';
 if(firstVisitTileKey){
   const t=g.tiles?.[firstVisitTileKey];if(!t)return {error:'First Visit Location is not revealed in the room.'};
   if(t.visited)return {error:'First Visit has already been resolved for this Location.'};
   if((t.enemies||[]).some(e=>Number(e?.hp||0)>0))return {error:'First Visit cannot begin while an Enemy is already in the Location.'};
 }
 if(!(g.encDeck||[]).length){g.encDeck=shuffle3305(g.encDiscard||[]);g.encDiscard=[]}if(!g.encDeck.length)return {error:'Encounter Deck is empty.'};
 const card=g.encDeck.shift(),fixed=parseFixedSeverity3305(cmd.fixedSeverity??card.fixedSeverity??card.severity),base=fixed===null?crypto.randomInt(1,7):null,mod=fixed===null?Math.trunc(Number(cmd.worldModifier||0)):0,severity=fixed===null?Math.max(1,base+mod):fixed;
 const text=severity<=2?card.a:severity<=4?card.b:severity<=6?card.c:card.d;
 const mechanics=mechanics33621.state(g);mechanics.encounterSerial=Number(mechanics.encounterSerial||0)+1;
 const pending={kind:'encounter',hero,encounterSerial33621:mechanics.encounterSerial,round:Number(g.round||1),card:clone3301(card),source,origin,severity,baseRoll:base,worldModifier:mod,fixedSeverity:fixed,severityMode:fixed===null?'rolled':'fixed',text};
 if(firstVisitTileKey)pending.firstVisitTileKey=firstVisitTileKey;
 r.explorePending3305[hero]=pending;return {changed:true,pending:clone3301(pending)};
}
function truePaths33621(r,hero,cmd){
 const g=gameFromRoom3300(r),p=r.explorePending3305?.[hero];
 if(!mechanics33621.equipped(g,hero,'EQ103')||p?.kind!=='encounter'||p.severityMode!=='rolled')return {error:'True Paths needs an equipped Lantern and a rolled Travel Encounter.'};
 if(cmd.op==='ENCOUNTER_REROLL'){if(p.truePaths33621)return {error:'True Paths was already used for this Encounter.'};p.truePaths33621={original:p.baseRoll,reroll:crypto.randomInt(1,7),chosen:null};return {changed:true,pending:clone3301(p)}}
 const offer=p.truePaths33621;if(!offer||offer.chosen!==null||!['original','reroll'].includes(cmd.keep))return {error:'Choose an offered True Paths roll once.'};
 offer.chosen=cmd.keep;p.baseRoll=offer[cmd.keep];p.severity=Math.max(1,p.baseRoll+p.worldModifier);p.text=p.severity<=2?p.card.a:p.severity<=4?p.card.b:p.severity<=6?p.card.c:p.card.d;return {changed:true,pending:clone3301(p)};
}
function finishEncounter3305(r,hero,cmd={}){
 const g=gameFromRoom3300(r),p=r.explorePending3305?.[hero];if(!p||p.kind!=='encounter')return {error:'No room-owned Encounter is pending.'};
 if(p.truePaths33621&&p.truePaths33621.chosen===null)return {error:'Choose which True Paths roll to keep first.'};
 // 3.35.0 First Visit safety: a pure enemy expression such as "1 E041" or
 // "2 E034 + 1 E033" must actually submit enemy spawns before the room may
 // consume the First Visit. This guards against a client resolver regression.
 const pureSpawn3350=/^\s*(?:(?:\d+\s*[xX×]?\s*)?E\d{3})(?:\s*\+\s*(?:(?:\d+\s*[xX×]?\s*)?E\d{3}))*\s*$/.test(String(p.text||''));
 if(p.firstVisitTileKey&&pureSpawn3350&&(!Array.isArray(cmd.spawnedEnemies)||cmd.spawnedEnemies.length<1))return {error:'First Visit Encounter requires its Enemy spawns before resolution.'};
 // 3.30.7: commit Encounter-created Enemies before clearing the prompt / consuming First Visit.
 // Each client spawn carries a one-shot nonce; the room returns the canonical Enemy ID so
 // the subsequent whole-state snapshot cannot duplicate the spawn.
 const spawned=[];let combatChanged=false;
 for(const raw of (Array.isArray(cmd.spawnedEnemies)?cmd.spawnedEnemies:[]).slice(0,20)){
   const tileKey=String(raw?.tileKey||''),target=g.tiles?.[tileKey],enemy=raw?.enemy;if(!target||!enemy||typeof enemy!=='object')continue;
   target.enemies=Array.isArray(target.enemies)?target.enemies:[];
   const nonce=String(enemy.roomSpawnNonce3306||raw.clientSpawnId||'');
   if(nonce&&target.enemies.some(e=>String(e?.roomSpawnNonce3306||'')===nonce)){const existing=target.enemies.find(e=>String(e?.roomSpawnNonce3306||'')===nonce);spawned.push({clientSpawnId:nonce,roomEnemyId:existing?.roomEnemyId3301||null,tileKey});continue}
   const copy=clone3301(enemy);delete copy.roomEnemyId3301;if(nonce)copy.roomSpawnNonce3306=nonce;target.enemies.push(copy);combatChanged=true;
 }
 if(combatChanged)ensureEnemyIds3301(g,r);
 if(p.firstVisitTileKey&&pureSpawn3350&&!combatChanged&&spawned.length<1)return {error:'First Visit Encounter Enemy spawns were invalid; First Visit remains pending.'};
 if(combatChanged){
   for(const t of Object.entries(g.tiles||{}))for(const e of (t[1]?.enemies||[])){const nonce=String(e?.roomSpawnNonce3306||'');if(nonce&&Array.isArray(cmd.spawnedEnemies)&&cmd.spawnedEnemies.some(x=>String(x?.clientSpawnId||x?.enemy?.roomSpawnNonce3306||'')===nonce))spawned.push({clientSpawnId:nonce,roomEnemyId:e.roomEnemyId3301,tileKey:t[0]})}
 }
 g.encDiscard=Array.isArray(g.encDiscard)?g.encDiscard:[];g.encDiscard.push(clone3301(p.card));
 if(p.firstVisitTileKey&&g.tiles?.[p.firstVisitTileKey])g.tiles[p.firstVisitTileKey].visited=true;
 delete r.explorePending3305[hero];return {changed:true,combatChanged,spawned,firstVisitTileKey:p.firstVisitTileKey||null};
}
function firstVisit3305(r,cmd){const g=gameFromRoom3300(r),k=String(cmd.tileKey||''),t=g.tiles?.[k];if(!t)return {error:'First Visit tile is not revealed.'};if(t.visited)return {changed:false,visited:true};if((t.enemies||[]).some(e=>Number(e?.hp||0)>0))return {changed:false,visited:false,blocked:true};t.visited=true;return {changed:true,visited:true}}
function resetExplorationAfterRound3305(r){ensureExploreStore3305(r);r.explorePending3305={};r.exploreSeq3305=Number(r.exploreSeq3305||0)+1;syncExploreMeta3305(r)}

function shuffleCopy(arr){
 const a=arr.slice();
 for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
 return a;
}
// 3.32.2: removed legacy custom-Hero deck builder; multiplayer is H001-H016 only.

// 3.27.20 — server-authoritative built-in Hero join.
// Presence in PARTY_ROSTER is not enough: the joining Hero must be committed to the
// canonical game snapshot before ROOM_STATE/STATE are broadcast.
function ensureBuiltInHeroInRoomState(r, role){
 const AUTHORED=new Set(['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha']);
 if(!r?.latestState?.game||!AUTHORED.has(role))return false;
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
 if(['Aldric','Lyra','Seraphine'].includes(role)){
   const deckKey=role==='Aldric'?'heroDeck':role==='Lyra'?'lyraDeck':'seraphineDeck';
   const handKey=role==='Aldric'?'heroHand':role==='Lyra'?'lyraHand':'seraphineHand';
   g[deckKey]=Array.isArray(g[deckKey])?g[deckKey]:[];
   g[handKey]=Array.isArray(g[handKey])?g[handKey]:[];
   if(g[handKey].length===0&&g[deckKey].length)g[handKey].push(...g[deckKey].splice(0,Math.min(5,g[deckKey].length)));
 }else{
   // H003-H016 are runtime Heroes. The fresh host snapshot already carries their authored deck/state.
   g.heroRuntimeStates=g.heroRuntimeStates||{};
   const st=g.heroRuntimeStates[role];
   if(!st)return false;
   st.deck=Array.isArray(st.deck)?st.deck:[];st.hand=Array.isArray(st.hand)?st.hand:[];st.discard=Array.isArray(st.discard)?st.discard:[];
   if(st.hand.length===0&&st.deck.length)st.hand.push(...st.deck.splice(0,Math.min(5,st.deck.length)));
 }
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
// 3.32.2: removed obsolete custom-Hero join state path.

// ===== 3.27.61 ROOM-BASED CAMPAIGN SAVES =====
// Campaigns are room-code saves. No account/sign-in is required.
function savedRoomMeta(full,f){
  try{
    const parsed=JSON.parse(fs.readFileSync(full,'utf8'));
    const state=parsed?.state||null, game=state?.game||null;
    return {room:path.basename(f,'.json'),savedAt:parsed?.savedAt||state?.savedAt||fs.statSync(full).mtime.toISOString(),campaignName:game?.campaign?.name32537||null,quest:game?.campaign?.currentQuest||null,roster:state?.campaignAuthority3321?.roster||game?.partyHeroes||[],saveAuthority:state?.campaignAuthority3321?.version||null};
  }catch(_){return null}
}
function listSavedRooms(){
  if(!fs.existsSync(DATA_DIR))return [];
  return fs.readdirSync(DATA_DIR).filter(f=>f.toLowerCase().endsWith('.json')&&!['auth-sessions.json'].includes(f.toLowerCase())).map(f=>savedRoomMeta(path.join(DATA_DIR,f),f)).filter(Boolean).sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));
}
app.get('/api/saves',(req,res)=>{try{res.json({rooms:listSavedRooms()})}catch(e){res.status(500).json({error:'Could not list saved games.'})}});
app.delete('/api/saves/:room',(req,res)=>{
  try{
    const room=safeRoomName(req.params.room||'');if(!room)return res.status(400).json({error:'Invalid room.'});
    const file=roomFile(room),tmp=file+'.tmp',bak=roomBackupFile(room);if(!fs.existsSync(file)&&!fs.existsSync(bak))return res.status(404).json({error:'Saved game not found.'});
    const active=rooms.get(room);if(active&&active.clients.size)return res.status(409).json({error:'Cannot delete a campaign while players are connected.'});
    if(fs.existsSync(file))fs.unlinkSync(file);try{if(fs.existsSync(tmp))fs.unlinkSync(tmp);if(fs.existsSync(bak))fs.unlinkSync(bak)}catch(_){}if(active)rooms.delete(room);res.json({ok:true,room});
  }catch(e){console.error('[DELETE SAVE ERROR]',req.params.room,e);res.status(500).json({error:e?.message||'Could not delete saved game.'})}
});

app.get('/health',(req,res)=>res.json({ok:true,version:SERVER_BUILD_33621,authority:'room-command',turnEngine:'server-turn-owner',turnProtocol:'room-turn-owner-v2',combatEngine:'server-ledger',heroStateEngine:'server-ledger',explorationEngine:'server-ledger',resourceEngine:'server-ledger',phaseEngine:'server-owned-job+seeded-worker',campaignSaveEngine:'server-rejoin-authority',persistenceSchema:'3.36.4',persistenceBackup:'validated-previous-save',legacyClientSnapshots:'write-path-retired',persistence:persistenceEnabled}));

wss.on('connection',ws=>{
 ws.room=null;ws.joinReady=false;ws.ready32716=false;ws.account32716=null;
 ws.on('message',raw=>{
  let m;try{m=JSON.parse(raw)}catch{return}
  if(!m.room||!m.type)return;const rn=safeRoomName(m.room);if(!rn)return;
  if(m.type==='JOIN'||m.type==='HELLO'||m.type==='NEW_GAME_JOIN'){
   if(ws.room&&rooms.has(ws.room))rooms.get(ws.room).clients.delete(ws);
   ws.room=rn;ws.role=m.from||null;ws.heroDefinition=null;ws.ready32716=false;ws.account32716=null;ws.joinReady=false;const r=room(rn);
   // 3.27.61: only authored H001-H016 Heroes are legal; no account-owned custom Heroes exist.
   const AUTHORED_HEROES_32758=new Set(['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha']);
   if(!AUTHORED_HEROES_32758.has(String(ws.role||''))){send(ws,{type:'JOIN_DENIED',room:rn,from:'SERVER',data:{reason:'Choose one of the sixteen authored Heroes.'}});try{ws.close(4003,'Invalid Hero')}catch{};return}
   // 3.27.61: Hero ownership is connection-based, not account-based.
   r.heroOwners32724={};
   const requestedHero=String(ws.role||'');
   const sameHeroLive=[...r.clients].filter(c=>c.readyState===1&&c.role===requestedHero);
   if(sameHeroLive.length){send(ws,{type:'JOIN_DENIED',room:rn,from:'SERVER',data:{reason:`${requestedHero} is already controlled by another connected player.`}});try{ws.close(4003,'Hero already controlled')}catch{};return}
   r.clients.add(ws);
   if((m.type==='NEW_GAME_JOIN'&&!r.adventureStarted)||!r.host||r.host.readyState!==1)r.host=ws;
   if(m.type==='NEW_GAME_JOIN'&&m.data?.game){
     // 3.25.29: explicit New Game is authoritative. Never restore an older persisted snapshot into it.
     r.latestState=m.data;
     ensureEnemyIds3301(r.latestState?.game,r);
     r.latestState.heroOwners32724={...r.heroOwners32724};
     if(r.latestState.game)r.latestState.game.heroOwners32724={...r.heroOwners32724};
     r.adventureStarted=false;
     if(r.latestState&&typeof r.latestState==='object')r.latestState.adventureStarted32723=false;
     r.turnAuthority3300=buildTurnAuthority3300(r,r.turnAuthority3300?.seq||0);applyTurnAuthorityToGame3300(r);
     r.revision=Math.max(1,(r.revision||0)+1);
     if(persistenceEnabled){try{const f=roomFile(rn),tmp=f+'.tmp';if(fs.existsSync(f))fs.unlinkSync(f);if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch(e){console.warn(`[PERSIST] RESET ${rn} -> ERROR: ${e.message}`)}}
     saveRoomState(rn,r.latestState);
     persistLog(`HANDSHAKE ${rn} NEW_GAME_JOIN -> fresh authoritative state`);
     send(ws,{type:'ROOM_STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
     for(const peer of r.clients)if(peer!==ws)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
     broadcastTurn3300(r,rn,{reason:'fresh-room'});
   }else{
     const diskState=loadRoomState(rn);if(diskState)r.latestState=diskState;r.heroOwners32724={};if(r.latestState){delete r.latestState.heroOwners32724;if(r.latestState.game)delete r.latestState.game.heroOwners32724;ensureEnemyIds3301(r.latestState.game,r);r.turnAuthority3300=buildTurnAuthority3300(r,r.turnAuthority3300?.seq||0);applyTurnAuthorityToGame3300(r);saveRoomState(rn,r.latestState)}if(r.latestState?.adventureStarted32723===true)r.adventureStarted=true;
     if(r.latestState){
       if(!r.revision)r.revision=1;
       // 3.27.20: the ROOM creates every joining Hero in canonical state BEFORE ROOM_STATE.
       // Previously only custom Heroes used this path; built-ins (Lyra, etc.) were added locally
       // by the joining browser, leaving the host's canonical party unchanged.
       const added=ensureBuiltInHeroInRoomState(r,ws.role);
       if(added){
        const t=ensureTurnAuthority3300(r);if(t){t.actions[ws.role]=getHeroActions3300(r.latestState.game,ws.role);t.passed[ws.role]=false;t.pendingByHero[ws.role]=false;t.seq++;applyTurnAuthorityToGame3300(r)}
        r.revision++;saveRoomState(rn,r.latestState);persistLog(`CANONICAL JOIN ${rn} hero=${ws.role} -> party committed rev=${r.revision}`);
        // Broadcast the same authoritative revision to players already in the room.
        for(const peer of r.clients)if(peer!==ws)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
        debugEvent('JOIN_STATE_BROADCAST',{room:rn,hero:ws.role,revision:r.revision,peers:[...r.clients].filter(c=>c!==ws&&c.readyState===1).length});
       }
       persistLog(`HANDSHAKE ${rn} ${m.type} -> ROOM_STATE room-authoritative restore rev=${r.revision}`);send(ws,{type:'ROOM_STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});send(ws,{type:'TURN_STATE',room:rn,from:'SERVER',data:turnPublic3300(r)})}
     else{persistLog(`HANDSHAKE ${rn} ${m.type} -> ROOM_EMPTY new room`);send(ws,{type:'ROOM_EMPTY',room:rn,from:'SERVER',data:null})}
   }
   // 3.32.1: bind this Hero to a persistent campaign rejoin credential.
   const rejoin3321=authorizeHeroRejoin3321(r,rn,requestedHero,m.data?.rejoinToken3321,{fresh:m.type==='NEW_GAME_JOIN'});
   if(!rejoin3321.ok){r.clients.delete(ws);send(ws,{type:'JOIN_DENIED',room:rn,from:'SERVER',data:{reason:rejoin3321.reason}});try{ws.close(4003,'Hero reservation mismatch')}catch{};return}
   syncCampaignAuthority3321(r,rn,r.latestState);if(r.latestState)saveRoomState(rn,r.latestState);
   ws.rejoinToken3321=rejoin3321.token;
   ws.joinReady=true;
   sendRejoinCredential3321(ws,r,rn,rejoin3321.token);
   const heroes=[...new Set([...r.clients].map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}})}
   {const players=[...r.clients].filter(c=>c.readyState===1).map(c=>{let displayName=c.account32716||c.role;try{if(c.account32716)displayName=readAccount(c.account32716).displayName||c.account32716}catch(_){}return {hero:c.role,username:c.account32716,displayName,ready:!!c.ready32716,isHost:c===r.host}});for(const peer of r.clients)send(peer,{type:'PARTY_LOBBY',room:rn,from:'SERVER',data:{players,hostRole:r.host?.role||null}})}
   // 3.27.23: a player returning to a room whose adventure already started resumes gameplay.
   // They do NOT need to Ready and cannot be blocked by the host-only Start Adventure button.
   if(r.adventureStarted===true&&m.type!=='NEW_GAME_JOIN'&&r.latestState){
    send(ws,{type:'ADVENTURE_RESUME',room:rn,from:'SERVER',revision:r.revision,data:{started:true,game:r.latestState}});
    send(ws,{type:'TURN_STATE',room:rn,from:'SERVER',data:turnPublic3300(r)});
    persistLog(`ADVENTURE RESUME ${rn} hero=${ws.role} rev=${r.revision}`);
    debugEvent('ADVENTURE_RESUME',{room:rn,hero:ws.role,revision:r.revision});
   }
   return;
  }
  if(ws.room!==rn||!ws.joinReady){persistLog(`REJECT ${rn} ${m.type} -> join handshake incomplete`);return}
  const r=room(rn);
  const broadcastLobby32716=()=>{const players=[...r.clients].filter(c=>c.readyState===1).map(c=>{let displayName=c.account32716||c.role;try{if(c.account32716)displayName=readAccount(c.account32716).displayName||c.account32716}catch(_){}return {hero:c.role,username:c.account32716,displayName,ready:!!c.ready32716,isHost:c===r.host}});for(const peer of r.clients)send(peer,{type:'PARTY_LOBBY',room:rn,from:'SERVER',data:{players,hostRole:r.host?.role||null}})};
  if(m.type==='MECHANICS_COMMAND'){
   const cmd=m.data||{},id=String(cmd.id||''),hero=String(cmd.hero||''),g=gameFromRoom3300(r),t=ensureTurnAuthority3300(r);
   const reject=reason=>send(ws,{type:'MECHANICS_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason}});
   if(!id||id.length>200||hero!==ws.role||!party3300(g).includes(hero)){reject('A command id and your own Hero are required.');return}
   if(!r.adventureStarted||!t||t.resolving||t.phase!=='Hero Phase'||Number(cmd.round)!==t.round||t.turnHero!==hero||t.passed[hero]||heroDefeated3300(g,hero)){reject('Only the living current Hero may use this action during their turn.');return}
   r.mechanicsCommands33621??=new Set(g.mechanicsProcessed33621||[]);if(r.mechanicsCommands33621.has(id)){send(ws,{type:'MECHANICS_COMMAND_ACK',room:rn,from:'SERVER',data:{id,duplicate:true}});return}
   if(r.explorePending3305?.[hero]&&!['STANCE','REFRESH'].includes(cmd.op)){reject('Resolve the current prompt before taking another Action.');return}
   if(g.mechanics33621?.heroes?.[hero]?.rapidPendingId&&cmd.op!=='FINISH_RAPID'){reject('Finish the pending Rapid Fire action first.');return}
   let result;
   if(cmd.op==='EXTRA_TURN')result=beginExtraTurn33621(r,hero,'LT150');
   else if(cmd.op==='FINISH_RAPID'){const ms=mechanics33621.hero(g,hero);if(!ms.rapidPendingId)result={error:'No Rapid Fire action is pending.'};else{delete ms.rapidPendingId;t.pendingByHero[hero]=false;result={finished:true}}}
   else{
    const trial=clone3301(g);setHeroActions3300(trial,hero,t.actions[hero]);
    if(cmd.op==='RAPID_FIRE'){
     const b=mechanics33621.body(trial,hero),st=mechanics33621.hero(trial,hero);
     result=!mechanics33621.equipped(trial,hero,'EQ055')?{error:'Equip Repeating Crossbow first.'}:b.actions<1?{error:'Rapid Fire needs 1 Action.'}:(st.rapidUses||0)>=3?{error:'Reload the magazine first.'}:null;
     if(!result){b.actions--;st.rapidUses=(st.rapidUses||0)+1;st.rapidPendingId=id;t.pendingByHero[hero]=true;result={shots:2,cost:1}}
    }else result=mechanics33621.action(trial,hero,String(cmd.op||''),{stance:cmd.stance,key:cmd.key,kind:cmd.kind});
    if(!result.error){
     r.latestState.game=trial;
     if(result.search){const p=mechanics33621.pos(trial,hero),draw=drawSearch3305(r,hero,{free:true,source:'Lockpick Set',tileKey:`${p.x},${p.y}`,eligibleCardIds:cmd.eligibleCardIds});if(draw.error||!draw.pending){r.latestState.game=g;result={error:draw.error||'No eligible Search card.'}}else result.pending=draw.pending}
     if(!result.error){t.actions[hero]=getHeroActions3300(trial,hero);if(result.draw)drawHeroStartCards33621(trial,hero,result.draw);t.seq++;applyTurnAuthorityToGame3300(r)}
    }
   }
   if(result.error){reject(result.error);return}
   r.mechanicsCommands33621.add(id);while(r.mechanicsCommands33621.size>1000)r.mechanicsCommands33621.delete(r.mechanicsCommands33621.values().next().value);
   r.latestState.game.mechanicsProcessed33621=[...r.mechanicsCommands33621];
   r.resourceSeq3310=Number(r.resourceSeq3310||0)+1;r.latestState.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};r.latestState.game.resourceAuthority3310={...r.latestState.resourceAuthority3310};r.heroSeq3303=Number(r.heroSeq3303||0)+1;r.revision=(r.revision||0)+1;
   saveRoomState(rn,r.latestState);
   for(const peer of r.clients)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   broadcastTurn3300(r,rn,{reason:'mechanics-action'});broadcastResources3310(r,rn);broadcastHero3303(r,rn);if(result.pending){bumpExplore3305(r);broadcastExploration3305(r,rn)}
   send(ws,{type:'MECHANICS_COMMAND_ACK',room:rn,from:'SERVER',data:{id,result,turn:turnPublic3300(r)}});maybeRequestRoundResolution3300(r,rn,'mechanics-action');return;
  }
  if(m.type==='LOBBY_READY'){ws.ready32716=!!m.data?.ready;send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'LOBBY_READY_RECEIVED',role:ws.role,ready:ws.ready32716,isHost:ws===r.host}});broadcastLobby32716();return}
  if(m.type==='START_ADVENTURE'){
    const live=[...r.clients].filter(c=>c.readyState===1), roles=live.map(c=>c.role).filter(Boolean);
    send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'START_RECEIVED',role:ws.role,isHost:ws===r.host,hostRole:r.host?.role||null,players:live.map(c=>({role:c.role,ready:!!c.ready32716,isHost:c===r.host})),revision:r.revision}});
    if(ws!==r.host){send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'START_DENIED_NOT_HOST'}});send(ws,{type:'START_DENIED',room:rn,from:'SERVER',data:{reason:'Only the host can start the adventure.'}});return}
    if(!live.length||live.some(c=>!c.ready32716)){send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'START_DENIED_NOT_READY',players:live.map(c=>({role:c.role,ready:!!c.ready32716}))}});send(ws,{type:'START_DENIED',room:rn,from:'SERVER',data:{reason:'Every connected player must be Ready.'}});return}
    // 3.29.18: host submits the board initialized from the final ready roster. Never broadcast a stale solo pre-lobby snapshot.
    const submitted=m.data?.authoritativeGame;
    if(submitted&&typeof submitted==='object'&&submitted.game&&typeof submitted.game==='object'){
      const snap=JSON.parse(JSON.stringify(submitted));
      snap.game.partyHeroes=[...roles];
      if(!roles.includes(snap.game.activeHero))snap.game.activeHero=roles[0]||snap.game.activeHero||'Aldric';
      snap.adventureStarted32723=true;
      r.latestState=snap;ensureEnemyIds3301(r.latestState.game,r);r.turnAuthority3300=buildTurnAuthority3300(r,r.turnAuthority3300?.seq||0);applyTurnAuthorityToGame3300(r);r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
      send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'AUTHORITATIVE_START_STATE_ACCEPTED',players:roles,revision:r.revision,openingEnemies:snap.game?.tiles?.['0,0']?.enemies?.length??null}});
    }
    r.adventureStarted=true;
    if(r.latestState&&typeof r.latestState==='object'){r.latestState.adventureStarted32723=true;ensureEnemyIds3301(r.latestState.game,r);if(!r.turnAuthority3300)r.turnAuthority3300=buildTurnAuthority3300(r);applyTurnAuthorityToGame3300(r);saveRoomState(rn,r.latestState)}
    for(const peer of live){send(peer,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'ADVENTURE_START_SENDING',to:peer.role,revision:r.revision}});send(peer,{type:'ADVENTURE_START',room:rn,from:'SERVER',revision:r.revision,data:{started:true,game:r.latestState,heroes:[...roles]}})}
    broadcastTurn3300(r,rn,{reason:'adventure-start'});
    persistLog(`ADVENTURE START ${rn} host=${ws.role} players=${live.length}`);return
  }
  if(m.type==='REQUEST_PARTY_LOBBY'){send(ws,{type:'PARTY_DEBUG',room:rn,from:'SERVER',data:{stage:'LOBBY_REQUEST_RECEIVED',role:ws.role,isHost:ws===r.host}});broadcastLobby32716();return}
  if(m.type==='LEAVE_GAME'){
   const target=String(ws.role||'');
   if(target&&(!r.heroOwners32724?.[target]||r.heroOwners32724[target]===ws.account32716))delete r.heroOwners32724[target];
   if(r.latestState?.game){
     r.latestState.game.partyHeroes=(r.latestState.game.partyHeroes||[]).filter(h=>h!==target);
     if(r.latestState.game.activeHero===target)r.latestState.game.activeHero=r.latestState.game.partyHeroes[0]||null;
     r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};
     r.latestState.heroOwners32724={...(r.heroOwners32724||{})};
     const t=ensureTurnAuthority3300(r);if(t){
       if(t.turnHero===target){t.turnHero=null;t.activationSeq=Number(t.activationSeq||0)+1;debugEvent('ROOM_TURN_RELEASE_33618',{room:rn,hero:target,reason:'player-left',activationSeq:t.activationSeq})}
       delete t.actions[target];delete t.passed[target];delete t.pendingByHero[target];t.seq++;applyTurnAuthorityToGame3300(r)
     }
     r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   }
   send(ws,{type:'LEFT_GAME',room:rn,from:'SERVER',data:{hero:target,released:true}});
   for(const peer of r.clients)if(peer!==ws&&peer.readyState===1){send(peer,{type:'PLAYER_LEFT_GAME',room:rn,from:'SERVER',data:{hero:target}});if(r.latestState)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState})}
   broadcastTurn3300(r,rn,{reason:'player-left'});maybeRequestRoundResolution3300(r,rn,'player-left');
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
   // 3.30.0: removing a Hero from the active party must also remove that Hero from
   // the room-owned turn ledger. Otherwise an Away Hero can leave stale Actions/Pass/Pending
   // entries behind and block (or falsely trigger) round completion.
   if(r.latestState?.game){
     const t=ensureTurnAuthority3300(r);
     if(t){
       if(t.turnHero===target){t.turnHero=null;t.activationSeq=Number(t.activationSeq||0)+1;debugEvent('ROOM_TURN_RELEASE_33618',{room:rn,hero:target,reason:'player-away',activationSeq:t.activationSeq})}
       delete t.actions[target];delete t.passed[target];delete t.pendingByHero[target];t.seq++;applyTurnAuthorityToGame3300(r)
     }
     r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   }
   const victims=[...r.clients].filter(c=>c.role===target);
   for(const peer of r.clients)if(!victims.includes(peer)){send(peer,{type:'SET_AWAY_NOTICE',room:rn,from:'SERVER',data:{hero:target}});if(r.latestState)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState})}
   for(const v of victims){send(v,{type:'LEFT_PARTY',room:rn,from:'SERVER',data:{hero:target,away:true}});try{v.close(4002,'Hero set Away')}catch{}}
   const heroes=[...new Set([...r.clients].filter(c=>!victims.includes(c)).map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients)if(!victims.includes(peer))send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});
   broadcastTurn3300(r,rn,{reason:'player-away'});maybeRequestRoundResolution3300(r,rn,'player-away');
   persistLog(`AWAY ${rn} by=${ws.role} target=${target} sockets=${victims.length}`);return;
  }
  if(m.type==='KICK_PLAYER'){
   if(ws!==r.host){send(ws,{type:'KICK_DENIED',room:rn,from:'SERVER',data:{reason:'Only the room host can remove players.'}});return}
   const target=String(m.data?.hero||'');
   if(!target||target===ws.role){send(ws,{type:'KICK_DENIED',room:rn,from:'SERVER',data:{reason:'The host cannot remove their own Hero.'}});return}
   const victims=[...r.clients].filter(c=>c.role===target);
   if(r.heroOwners32724)delete r.heroOwners32724[target];if(r.rejoinClaims3321)delete r.rejoinClaims3321[target];
   if(r.latestState?.game&&Array.isArray(r.latestState.game.partyHeroes)){
     r.latestState.game.partyHeroes=r.latestState.game.partyHeroes.filter(h=>h!==target);
     if(r.latestState.game.activeHero===target)r.latestState.game.activeHero=r.latestState.game.partyHeroes[0]||ws.role;
     r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};r.latestState.heroOwners32724={...(r.heroOwners32724||{})};
     const t=ensureTurnAuthority3300(r);if(t){
       if(t.turnHero===target){t.turnHero=null;t.activationSeq=Number(t.activationSeq||0)+1;debugEvent('ROOM_TURN_RELEASE_33618',{room:rn,hero:target,reason:'player-kicked',activationSeq:t.activationSeq})}
       delete t.actions[target];delete t.passed[target];delete t.pendingByHero[target];t.seq++;applyTurnAuthorityToGame3300(r)
     }
     r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   }
   for(const v of victims){send(v,{type:'KICKED',room:rn,from:'SERVER',data:{hero:target,by:ws.role}});try{v.close(4001,'Removed by host')}catch{}}
   const heroes=[...new Set([...r.clients].filter(c=>!victims.includes(c)).map(c=>c.role).filter(Boolean))];
   for(const peer of r.clients)if(!victims.includes(peer)){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions:Object.fromEntries([...r.clients].filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]))}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}});if(r.latestState)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState})}
   broadcastTurn3300(r,rn,{reason:'player-kicked'});maybeRequestRoundResolution3300(r,rn,'player-kicked');
   persistLog(`KICK ${rn} host=${ws.role} target=${target} sockets=${victims.length}`);return;
  }
  if(m.type==='REQUEST_TURN_STATE'){
   if(r.latestState&&!r.turnAuthority3300)r.turnAuthority3300=buildTurnAuthority3300(r);
   send(ws,{type:'TURN_STATE',room:rn,from:'SERVER',data:turnPublic3300(r)});return;
  }
  if(m.type==='TURN_COMMAND'){
   const cmd=m.data||{},id=String(cmd.id||''),op=String(cmd.op||''),hero=String(cmd.hero||ws.role||'');
   const t=ensureTurnAuthority3300(r),g=gameFromRoom3300(r);
   if(!r.adventureStarted||!t||!g){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Adventure is not active.',turn:turnPublic3300(r)}});return}
   if(id&&commandSeen3300(r,id)){send(ws,{type:'TURN_COMMAND_ACK',room:rn,from:'SERVER',data:{id,duplicate:true,turn:turnPublic3300(r)}});return}
   if(!id){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Missing command id.',turn:turnPublic3300(r)}});return}
   if(hero!==String(ws.role||'')||!party3300(g).includes(hero)){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'A player may only command their own Hero.',turn:turnPublic3300(r)}});return}
   if(Number(cmd.round)!==Number(t.round)){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:`Round mismatch. Room is on Round ${t.round}.`,turn:turnPublic3300(r)}});return}
   if(t.resolving||t.phase!=='Hero Phase'){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'The room is already resolving the round.',turn:turnPublic3300(r)}});return}
   let changed=false;
   if(heroDefeated3300(g,hero)&&op!=='STATUS'){
     send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Downed Heroes cannot take Hero Phase Actions.',turn:turnPublic3300(r)}});return
   }
   let lifecycleStarted33621=false;
   if(op==='CLAIM_TURN'){
     if(t.passed?.[hero]){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'That Hero already completed their turn this Round.',turn:turnPublic3300(r)}});return}
     if(t.turnHero&&t.turnHero!==hero){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:`It is ${t.turnHero}'s turn.`,turn:turnPublic3300(r)}});return}
     if(!t.turnHero){const life=startHeroTurn33621(r,hero);lifecycleStarted33621=!!life.started;t.turnHero=hero;t.activationSeq=Number(t.activationSeq||0)+1;changed=true;debugEvent('ROOM_TURN_CLAIM_33621',{room:rn,hero,round:t.round,activationSeq:t.activationSeq,id,firstStart:lifecycleStarted33621,drawn:life.drawn})}
   }else if(op==='ADJUST_ACTIONS'){
     const delta=Number(cmd.delta);
     if(!Number.isInteger(delta)||delta===0||Math.abs(delta)>6){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Invalid Action adjustment.',turn:turnPublic3300(r)}});return}
     const reactionSpend=delta<0&&cmd.reaction===true&&t.pendingByHero?.[hero]===true;
     if(t.turnHero!==hero&&!reactionSpend){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:t.turnHero?`It is ${t.turnHero}'s turn.`:"Start this Hero's turn before spending Actions.",turn:turnPublic3300(r)}});return}
     if(t.passed[hero]&&delta<0&&!reactionSpend){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Passed Heroes may only spend held Actions during a Reaction window.',turn:turnPublic3300(r)}});return}
     if(delta>0&&t.turnHero!==hero){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Only the Hero taking the current turn may gain Hero Phase Actions.',turn:turnPublic3300(r)}});return}
     const before=Number(t.actions[hero]||0),after=before+delta;
     if(after<0||after>6){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Action total would be out of range.',turn:turnPublic3300(r)}});return}
     if(delta<0&&cmd.combatPending33621===true){mechanics33621.hero(g,hero).combatPending=true;t.pendingByHero[hero]=true}
     t.actions[hero]=after;setHeroActions3300(g,hero,after);changed=true;
     debugEvent('ROOM_ACTION_COMMAND_3300',{room:rn,hero,delta,before,after,id,round:t.round});
   }else if(op==='PASS'){
     if(g.mechanics33621?.heroes?.[hero]?.rapidPendingId){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Finish Rapid Fire before ending the turn.',turn:turnPublic3300(r)}});return}
     if(!t.started?.[hero]){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:"Start this Hero's turn before ending it.",turn:turnPublic3300(r)}});return}
     if(t.turnHero&&t.turnHero!==hero){send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:`It is ${t.turnHero}'s turn.`,turn:turnPublic3300(r)}});return}
     if(g.mechanics33621?.heroes?.[hero]?.combatPending){delete g.mechanics33621.heroes[hero].combatPending;t.pendingByHero[hero]=false}
     if(g.extraTurns33621?.active)delete g.extraTurns33621.active[hero];
     if(!t.passed[hero]){t.passed[hero]=true;g.passedHeroes32521=g.passedHeroes32521||{};g.passedHeroes32521[hero]=true;changed=true}
     if(t.turnHero===hero){t.turnHero=null;t.activationSeq=Number(t.activationSeq||0)+1;changed=true}
     debugEvent('ROOM_PASS_COMMAND_3300',{room:rn,hero,actions:t.actions[hero],id,round:t.round,nextTurnHero:t.turnHero,activationSeq:t.activationSeq});
   }else if(op==='STATUS'){
     const pending=!!cmd.pending||!!g.mechanics33621?.heroes?.[hero]?.rapidPendingId||!!g.mechanics33621?.heroes?.[hero]?.combatPending;if(!!t.pendingByHero[hero]!==pending){t.pendingByHero[hero]=pending;changed=true}
   }else{
     send(ws,{type:'TURN_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Unknown room command.',turn:turnPublic3300(r)}});return
   }
   rememberCommand3300(r,id,{op,hero,round:t.round});
   if(changed){t.seq++;applyTurnAuthorityToGame3300(r);saveRoomState(rn,r.latestState)}
   if(lifecycleStarted33621){broadcastResources3310(r,rn,{reason:'hero-turn-start',by:hero});broadcastHero3303(r,rn,{reason:'hero-turn-start',by:hero})}
   send(ws,{type:'TURN_COMMAND_ACK',room:rn,from:'SERVER',data:{id,op,hero,turn:turnPublic3300(r),heroTurnStarted:lifecycleStarted33621}});
   if(changed)broadcastTurn3300(r,rn,{reason:op.toLowerCase()});
   maybeRequestRoundResolution3300(r,rn,op.toLowerCase());return;
  }
  if(m.type==='REQUEST_HERO_STATE'){
   send(ws,{type:'HERO_STATE',room:rn,from:'SERVER',data:heroPublic3303(r)});return;
  }
  if(m.type==='HERO_COMMAND'){
   const cmd=m.data||{},id=String(cmd.id||''),hero=String(cmd.hero||ws.role||''),round=Number(cmd.round);
   ensureHeroStore3303(r);const g=gameFromRoom3300(r),t=ensureTurnAuthority3300(r);
   if(!r.adventureStarted||!g){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Adventure is not active.',heroState:heroPublic3303(r)}});return}
   if(!id){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Missing Hero command id.',heroState:heroPublic3303(r)}});return}
   if(r.processedHero3303.has(id)){send(ws,{type:'HERO_COMMAND_ACK',room:rn,from:'SERVER',data:{id,duplicate:true,heroState:heroPublic3303(r)}});return}
   if(hero!==String(ws.role||'')||!party3300(g).includes(hero)){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'A player may only originate Hero-state commands from their own connected Hero.',heroState:heroPublic3303(r)}});return}
   if(heroDefeated3300(g,hero)){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Downed Heroes cannot originate Hero-state Actions or Reactions.',heroState:heroPublic3303(r)}});return}
   if(Number.isFinite(round)&&t&&round!==Number(t.round)){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:`Round mismatch. Room is on Round ${t.round}.`,heroState:heroPublic3303(r)}});return}
   const heroReaction33621=t?.pendingByHero?.[hero]===true;
   if(t&&!t.resolving&&String(g.phase||'')==='Hero Phase'&&t.turnHero!==hero&&!heroReaction33621){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:t.turnHero?`It is ${t.turnHero}'s turn.`:"Start this Hero's turn before changing Hero state.",heroState:heroPublic3303(r)}});return}
   if(t?.resolving||String(g.phase||'')!=='Hero Phase'){send(ws,{type:'HERO_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Hero-state commands are committed during Hero Phase; round resolution owns later phase effects.',heroState:heroPublic3303(r)}});return}
   const result=applyHeroChanges3303(r,cmd.changes);rememberHeroCommand3303(r,id);
   if(result.changed){r.heroSeq3303=Number(r.heroSeq3303||0)+1;saveRoomState(rn,r.latestState)}
   debugEvent('ROOM_HERO_COMMAND_3303',{room:rn,hero,id,round,heroSeq:r.heroSeq3303,changes:Array.isArray(cmd.changes)?cmd.changes.length:0,applied:result.applied});
   send(ws,{type:'HERO_COMMAND_ACK',room:rn,from:'SERVER',data:{id,heroSeq:r.heroSeq3303,heroState:heroPublic3303(r),applied:result.applied}});
   if(result.changed){
     broadcastHero3303(r,rn,{reason:'hero-command',by:hero});
     if(normalizeTurnHero3300(r)){r.turnAuthority3300.seq++;applyTurnAuthorityToGame3300(r);saveRoomState(rn,r.latestState);broadcastTurn3300(r,rn,{reason:'turn-owner-defeated'})}
     // HP 0 Heroes are excluded from Hero-phase completion. If this was the last living
     // Hero, resolve the round so the normal death/Defeat rules can run.
     setTimeout(()=>maybeRequestRoundResolution3300(r,rn,'hero-state-changed'),0);
   }
   return;
  }
  if(m.type==='REQUEST_COMBAT_STATE'){
   send(ws,{type:'COMBAT_STATE',room:rn,from:'SERVER',data:combatPublic3301(r)});return;
  }
  if(m.type==='COMBAT_COMMAND'){
   const cmd=m.data||{},id=String(cmd.id||''),hero=String(cmd.hero||ws.role||''),round=Number(cmd.round);
   ensureCombatStore3301(r);const g=gameFromRoom3300(r),t=ensureTurnAuthority3300(r);
   if(!r.adventureStarted||!g){send(ws,{type:'COMBAT_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Adventure is not active.',combat:combatPublic3301(r)}});return}
   if(!id){send(ws,{type:'COMBAT_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Missing combat command id.',combat:combatPublic3301(r)}});return}
   if(r.processedCombat3301.has(id)){send(ws,{type:'COMBAT_COMMAND_ACK',room:rn,from:'SERVER',data:{id,duplicate:true,combat:combatPublic3301(r)}});return}
   if(hero!==String(ws.role||'')||!party3300(g).includes(hero)){send(ws,{type:'COMBAT_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'A player may only commit their own combat resolution.',combat:combatPublic3301(r)}});return}
   if(heroDefeated3300(g,hero)){send(ws,{type:'COMBAT_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:'Downed Heroes cannot Attack or use combat Reactions.',combat:combatPublic3301(r)}});return}
   if(Number.isFinite(round)&&t&&round!==Number(t.round)){send(ws,{type:'COMBAT_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:`Round mismatch. Room is on Round ${t.round}.`,combat:combatPublic3301(r)}});return}
   const combatReaction33621=t?.pendingByHero?.[hero]===true;
   if(t&&!t.resolving&&String(g.phase||'')==='Hero Phase'&&t.turnHero!==hero&&!combatReaction33621){send(ws,{type:'COMBAT_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason:t.turnHero?`It is ${t.turnHero}'s turn.`:"Start this Hero's turn before committing combat.",combat:combatPublic3301(r)}});return}
   const mechanicsState=mechanics33621.hero(g,hero);if(mechanicsState.combatPending){delete mechanicsState.combatPending;t.pendingByHero[hero]=!!mechanicsState.rapidPendingId}
   const result=applyCombatChanges3301(r,cmd.changes);
   if(cmd.weaponAttack33621&&(enemyMap3301(g).has(String(cmd.weaponAttack33621.enemyId||''))||result.applied.some(x=>x.hpBefore>x.hpAfter))){
    result.changed=true;
    const ms=mechanics33621.hero(g,hero);ms.lastAttackTurn=mechanics33621.turn(g,hero);if(mechanics33621.equipped(g,hero,'EQ044'))ms.nightFirstEncounter=mechanics33621.encounter(g);
    if(result.applied.some(x=>x.hpBefore>x.hpAfter)&&mechanics33621.equipped(g,hero,'EQ025')&&ms.staggerTurn!==mechanics33621.turn(g,hero)){ms.staggerTurn=mechanics33621.turn(g,hero);const target=enemyMap3301(g).get(String(cmd.weaponAttack33621.enemyId||''));const die=crypto.randomInt(1,7);if(target&&die<4&&!target.enemy.conditions.includes('Stunned'))target.enemy.conditions.push('Stunned')}
   }
   if(cmd.weaponAttack33621&&result.applied.some(x=>x.hpBefore>0&&x.hpAfter===0)&&mechanics33621.equipped(g,hero,'EQ044')){const extra=beginExtraTurn33621(r,hero,'EQ044');if(!extra.error){broadcastTurn3300(r,rn,{reason:'deaths-dance'});broadcastResources3310(r,rn)}}
   rememberCombatCommand3301(r,id);
   if(result.changed){r.combatSeq3301=Number(r.combatSeq3301||0)+1;saveRoomState(rn,r.latestState)}
   debugEvent('ROOM_COMBAT_COMMAND_3301',{room:rn,hero,id,round,combatSeq:r.combatSeq3301,changes:Array.isArray(cmd.changes)?cmd.changes.length:0,applied:result.applied});
   send(ws,{type:'COMBAT_COMMAND_ACK',room:rn,from:'SERVER',data:{id,combatSeq:r.combatSeq3301,combat:combatPublic3301(r),applied:result.applied}});
   if(result.changed)broadcastCombat3301(r,rn,{reason:'combat-command',by:hero});
   maybeRequestRoundResolution3300(r,rn,'combat-command',hero);return;
  }

  if(m.type==='REQUEST_RESOURCE_STATE'){
   send(ws,{type:'RESOURCE_STATE',room:rn,from:'SERVER',data:resourcePublic3310(r)});return;
  }
  if(m.type==='RESOURCE_COMMAND'){
   const cmd=m.data||{},id=String(cmd.id||''),hero=String(cmd.hero||ws.role||''),round=Number(cmd.round),baseSeq=Number(cmd.baseSeq);
   ensureResourceStore3310(r);const g=gameFromRoom3300(r),t=ensureTurnAuthority3300(r);
   const reject=reason=>send(ws,{type:'RESOURCE_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,reason,resource:resourcePublic3310(r)}});
   if(!r.adventureStarted||!g){reject('Adventure is not active.');return}
   if(!id){reject('Missing resource command id.');return}
   if(r.processedResource3310.has(id)){send(ws,{type:'RESOURCE_COMMAND_ACK',room:rn,from:'SERVER',data:{id,duplicate:true,resource:resourcePublic3310(r)}});return}
   if(hero!==String(ws.role||'')||!party3300(g).includes(hero)){reject('A player may only originate resource changes from their own connected Hero.');return}
   if(heroDefeated3300(g,hero)){reject('Downed Heroes cannot use cards, Equipment, Consumables, or resource Actions.');return}
   if(t?.resolving){reject('Resource commands are locked while the room is resolving Enemy/World/End phases.');return}
   if(Number.isFinite(round)&&round!==Number(t?.round||g.round)){reject(`Round mismatch. Room is on Round ${t?.round||g.round}.`);return}
   const resourceReaction33621=t?.pendingByHero?.[hero]===true;
   if(t&&String(g.phase||'')==='Hero Phase'&&t.turnHero!==hero&&!resourceReaction33621){reject(t.turnHero?`It is ${t.turnHero}'s turn.`:"Start this Hero's turn before changing cards, inventory, or other Hero resources.");return}
   if(!Number.isInteger(baseSeq)||baseSeq!==Number(r.resourceSeq3310||0)){reject(`Resource state changed in the room. Expected sequence ${r.resourceSeq3310}.`);return}
   const err=validateResources3310(g,cmd.resources);if(err){reject(err);return}
   applyResources3310(g,cmd.resources,hero);rememberResource3310(r,id);r.resourceSeq3310++;
   r.latestState.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};if(r.latestState.game)r.latestState.game.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};
   saveRoomState(rn,r.latestState);debugEvent('ROOM_RESOURCE_COMMAND_3310',{room:rn,hero,id,round,resourceSeq:r.resourceSeq3310,reason:String(cmd.reason||'sync')});
   send(ws,{type:'RESOURCE_COMMAND_ACK',room:rn,from:'SERVER',data:{id,resourceSeq:r.resourceSeq3310,resource:resourcePublic3310(r)}});broadcastResources3310(r,rn,{reason:'resource-command',by:hero});return;
  }
  if(m.type==='REQUEST_PHASE_STATE'){send(ws,{type:'PHASE_STATE',room:rn,from:'SERVER',data:phasePublic3311(r)});return}
  if(m.type==='REQUEST_EXPLORATION_STATE'){
   send(ws,{type:'EXPLORATION_STATE',room:rn,from:'SERVER',data:explorationPublic3305(r)});return;
  }
  if(m.type==='EXPLORATION_COMMAND'){
   const cmd=m.data||{},id=String(cmd.id||''),op=String(cmd.op||''),hero=String(cmd.hero||ws.role||''),round=Number(cmd.round);
   ensureExploreStore3305(r);const g=gameFromRoom3300(r),t=ensureTurnAuthority3300(r);
   const reject=reason=>send(ws,{type:'EXPLORATION_COMMAND_REJECTED',room:rn,from:'SERVER',data:{id,op,reason,exploration:explorationPublic3305(r)}});
   if(!r.adventureStarted||!g){reject('Adventure is not active.');return}
   if(!id){reject('Missing exploration command id.');return}
   if(r.processedExplore3305.has(id)){send(ws,{type:'EXPLORATION_COMMAND_ACK',room:rn,from:'SERVER',data:{id,op,duplicate:true,exploration:explorationPublic3305(r)}});return}
   if(hero!==String(ws.role||'')||!party3300(g).includes(hero)){reject('A player may only resolve exploration prompts for their own Hero.');return}
   if(Number.isFinite(round)&&t&&round!==Number(t.round)){reject(`Round mismatch. Room is on Round ${t.round}.`);return}
   if(t?.resolving||String(g.phase||'')!=='Hero Phase'){reject('Exploration/Search/Encounter commands are only accepted during Hero Phase.');return}
   if(t?.turnHero!==hero){reject(t?.turnHero?`It is ${t.turnHero}'s turn.`:"Start this Hero's turn before Exploring, Searching, or resolving a Hero-phase exploration action.");return}
   if(heroDefeated3300(g,hero)){if(t){t.actions[hero]=0;setHeroActions3300(g,hero,0)}reject('Downed Heroes cannot Explore, Search, or resolve Hero-phase exploration actions.');return}
   if(t?.passed?.[hero]&&['EXPLORE_DRAW','SEARCH_DRAW'].includes(op)){reject('A Hero who has Passed cannot take another Hero Phase Action this round.');return}
   const costsAction33010=(op==='EXPLORE_DRAW')||(op==='SEARCH_DRAW'&&cmd.free!==true);
   if(costsAction33010&&Number(t?.actions?.[hero]||0)<1){reject('No Actions remain for this Hero.');return}
   const pendingBefore33010=clone3301(r.explorePending3305?.[hero]||null);
   let result;
   if(op==='EXPLORE_DRAW')result=drawLocation3305(r,hero,cmd);
   else if(op==='EXPLORE_REPLACE')result=replaceLocation3305(r,hero,cmd);
   else if(op==='EXPLORE_PLACE')result=placeLocation3305(r,hero,cmd,false);
   else if(op==='EXPLORE_DIRECT_PLACE')result=placeLocation3305(r,hero,cmd,true);
   else if(op==='EXPLORE_REORDER_POOL')result=reorderPool3305(r,cmd);
   else if(op==='EXPLORE_REORDER_ENCOUNTER')result=reorderEncounter3305(r,cmd);
   else if(op==='SEARCH_DRAW')result=drawSearch3305(r,hero,cmd);
   else if(op==='SEARCH_RESOLVE')result=finishSearch3305(r,hero,false);
   else if(op==='SEARCH_CANCEL')result=finishSearch3305(r,hero,true);
   else if(op==='ENCOUNTER_DRAW')result=drawEncounter3305(r,hero,cmd);
   else if(op==='ENCOUNTER_REROLL'||op==='ENCOUNTER_KEEP')result=truePaths33621(r,hero,cmd);
   else if(op==='ENCOUNTER_RESOLVE')result=finishEncounter3305(r,hero,cmd);
   else if(op==='FIRST_VISIT')result=firstVisit3305(r,cmd);
   else {reject('Unknown exploration command.');return}
   if(result?.error){reject(result.error);return}
   let turnChanged33010=false;
   // Action cost is committed atomically with the room draw, not inferred later from a client snapshot.
   if(costsAction33010&&result?.pending){t.actions[hero]=Math.max(0,Number(t.actions[hero]||0)-1);setHeroActions3300(g,hero,t.actions[hero]);turnChanged33010=true}
   // Cancelling a paid Search returns the Action exactly once.
   if(op==='SEARCH_CANCEL'&&pendingBefore33010?.kind==='search'&&!pendingBefore33010.free){t.actions[hero]=Math.min(6,Number(t.actions[hero]||0)+1);setHeroActions3300(g,hero,t.actions[hero]);turnChanged33010=true}
   rememberExploreCommand3305(r,id);
   if(result?.combatChanged){r.combatSeq3301=Number(r.combatSeq3301||0)+1}
   if(turnChanged33010){t.seq++;applyTurnAuthorityToGame3300(r)}
   if(result?.changed||turnChanged33010){if(result?.changed)bumpExplore3305(r);saveRoomState(rn,r.latestState)}
   debugEvent('ROOM_EXPLORATION_COMMAND_3305',{room:rn,hero,id,op,round,exploreSeq:r.exploreSeq3305,result,actions:t?.actions?.[hero]});
   send(ws,{type:'EXPLORATION_COMMAND_ACK',room:rn,from:'SERVER',data:{id,op,exploreSeq:r.exploreSeq3305,result,exploration:explorationPublic3305(r),turn:turnPublic3300(r)}});
   if(result?.changed)broadcastExploration3305(r,rn,{reason:op.toLowerCase(),by:hero});
   if(turnChanged33010)broadcastTurn3300(r,rn,{reason:'exploration-action'});
   if(result?.combatChanged)broadcastCombat3301(r,rn,{reason:'encounter-resolve',by:hero});
   // If resolving/cancelling/placing this prompt was the final blocker, immediately re-check the room.
   if(['EXPLORE_PLACE','EXPLORE_DIRECT_PLACE','SEARCH_RESOLVE','SEARCH_CANCEL','ENCOUNTER_RESOLVE'].includes(op))setTimeout(()=>maybeRequestRoundResolution3300(r,rn,'exploration-prompt-cleared'),0);
   return;
  }
  if(m.type==='REQUEST_CAMPAIGN_AUTH'){restoreClaims3321(r);send(ws,{type:'CAMPAIGN_AUTH_STATE',room:rn,from:'SERVER',data:syncCampaignAuthority3321(r,rn,r.latestState)||null});return}
  if(m.type==='REQUEST_PHASE_JOB'){send(ws,{type:'PHASE_JOB_STATE',room:rn,from:'SERVER',data:phaseJobPublic3320(r)});return}
  if(m.type==='ROUND_RESOLVE_ERROR'){
   const t=ensureTurnAuthority3300(r),token=String(m.data?.token||'');
   if(t?.resolving&&token&&token===t.resolveToken&&String(ws.role||'')===String(t.resolverRole||'')){
     debugEvent('ROOM_ROUND_RESOLVE_ERROR_3300',{room:rn,round:t.round,resolverRole:t.resolverRole,error:String(m.data?.error||'unknown')});
     t.resolving=false;t.phase='Hero Phase';t.resolveToken=null;t.resolverRole=null;t.resolveRequestedAt=0;t.seq++;r.phaseTxn3320=null;applyTurnAuthorityToGame3300(r);broadcastTurn3300(r,rn,{reason:'resolver-error'});setTimeout(()=>maybeRequestRoundResolution3300(r,rn,'resolver-error'),100)
   }
   return;
  }
  if(m.type==='ROUND_RESOLVE_RESULT'){
   const t=ensureTurnAuthority3300(r),token=String(m.data?.token||''),state=m.data?.state;
   if(!t?.resolving||!token||token!==t.resolveToken||String(ws.role||'')!==String(t.resolverRole||'')){
     send(ws,{type:'ROUND_RESOLVE_REJECTED',room:rn,from:'SERVER',data:{reason:'Resolution token is no longer valid.',turn:turnPublic3300(r)}});return
   }
   if(!state?.game||typeof state.game!=='object'){
     send(ws,{type:'ROUND_RESOLVE_REJECTED',room:rn,from:'SERVER',data:{reason:'Resolver did not return a valid game state.',turn:turnPublic3300(r)}});return
   }
   const resolvedGame=state.game,resolvedPhase=String(state.game.phase||'');
   const phaseJobErr3320=validatePhaseJobResult3320(r,m,state);if(phaseJobErr3320){send(ws,{type:'ROUND_RESOLVE_REJECTED',room:rn,from:'SERVER',data:{reason:phaseJobErr3320,turn:turnPublic3300(r),phaseJob:phaseJobPublic3320(r)}});return}
   const failedQuestReset3302=failedQuestResetResolution3302(state,t,m.data?.fromRound);
   const phaseErr3311=validateRoundResult3311(r,state,t,failedQuestReset3302);if(phaseErr3311){send(ws,{type:'ROUND_RESOLVE_REJECTED',room:rn,from:'SERVER',data:{reason:phaseErr3311,turn:turnPublic3300(r)}});return}
   if((Number(resolvedGame.round||0)<Number(t.round||0)&&!failedQuestReset3302)||['World Phase','End Phase'].includes(resolvedPhase)){
     send(ws,{type:'ROUND_RESOLVE_REJECTED',room:rn,from:'SERVER',data:{reason:'Resolved state stopped in the middle of round resolution.',turn:turnPublic3300(r)}});return
   }
   if(failedQuestReset3302){
     ensureCombatStore3301(r);r.processedCombat3301.clear();r.enemyTombstones3301.clear();r.combatSeq3301=Number(r.combatSeq3301||0)+1;
     debugEvent('ROOM_QUEST_FAILURE_RESET_ACCEPTED_3302',{room:rn,fromRound:Number(t.round||0),toRound:Number(resolvedGame.round||0),quest:resolvedGame.campaign?.currentQuest||null});
   }
   state.game.extraTurns33621=clone3301(r.latestState?.game?.extraTurns33621||{used:{},active:{}});state.game.extraTurns33621.active={};state.game.mechanicsProcessed33621=clone3301(r.latestState?.game?.mechanicsProcessed33621||[]);
   r.latestState=state;r.latestState.adventureStarted32723=true;ensureEnemyIds3301(r.latestState.game,r);ensureHeroStore3303(r);r.heroSeq3303=Number(r.heroSeq3303||0)+1;resetExplorationAfterRound3305(r);
   // The designated room resolver is the only source allowed to commit Enemy/World/End effects.
   // Its completed transaction also becomes the new canonical card/inventory/loot baseline.
   ensureResourceStore3310(r);r.resourceSeq3310=Number(r.resourceSeq3310||0)+1;r.latestState.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};r.latestState.game.resourceAuthority3310={version:ROOM_RESOURCE_VERSION_3310,seq:r.resourceSeq3310};
   r.phaseSeq3311=Number(r.phaseSeq3311||0)+1;r.latestState.phaseAuthority3311={version:ROOM_PHASE_VERSION_3311,seq:r.phaseSeq3311,fromRound:Number(t.round||0),toRound:Number(resolvedGame.round||0),resolverRole:String(ws.role||'')};
   r.latestState.heroOwners32724={...(r.heroOwners32724||{})};if(r.latestState.game)r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};
   const committedPhaseJob3320=r.phaseTxn3320;r.phaseTxn3320=null;
   const oldRound=t.round,oldSeq=t.seq;r.turnAuthority3300=buildTurnAuthority3300(r,oldSeq+1);applyTurnAuthorityToGame3300(r);
   r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   debugEvent('ROOM_ROUND_RESOLVE_COMMIT_3300',{room:rn,fromRound:oldRound,toRound:r.turnAuthority3300?.round,resolverRole:ws.role,revision:r.revision,seq:r.turnAuthority3300?.seq});
   persistLog(`ROOM AUTH ${rn} resolver=${ws.role} committed round ${oldRound} -> ${r.turnAuthority3300?.round} rev=${r.revision}`);
   for(const peer of r.clients)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   broadcastTurn3300(r,rn,{reason:'round-resolved'});
   broadcastHero3303(r,rn,{reason:'round-resolved'});
   broadcastExploration3305(r,rn,{reason:'round-resolved'});
   broadcastResources3310(r,rn,{reason:'round-resolved'});broadcastPhase3311(r,rn,{reason:'round-resolved'});
   send(ws,{type:'ROUND_RESOLVE_ACK',room:rn,from:'SERVER',revision:r.revision,data:{fromRound:oldRound,toRound:r.turnAuthority3300?.round,seq:r.turnAuthority3300?.seq}});return;
  }
  if(m.type==='GAME_PATCH_3322'&&m.data?.state){
   const result=commitCompatibilityPatch3322(r,rn,ws,Number(m.data?.baseRevision),m.data.state);
   if(!result.ok){if(result.reason==='stale')send(ws,{type:'STATE_REJECTED',room:rn,from:'SERVER',revision:r.revision,data:result.state});else send(ws,{type:'GAME_PATCH_REJECTED_3322',room:rn,from:'SERVER',revision:r.revision,data:{reason:result.reason}});return}
   persistLog(`PATCH ${rn} rev=${r.revision} seq=${r.legacyPatchSeq3322} from=${ws.role}`);
   for(const peer of r.clients)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   broadcastTurn3300(r,rn,{reason:'compatibility-patch'});broadcastHero3303(r,rn,{reason:'compatibility-patch'});broadcastResources3310(r,rn,{reason:'compatibility-patch'});broadcastExploration3305(r,rn,{reason:'compatibility-patch'});
   return;
  }
  if(m.type==='STATE'&&m.data){
   // 3.32.2: direct whole-state mutation is retired. New clients send GAME_PATCH_3322.
   send(ws,{type:'STATE_WRITE_DEPRECATED_3322',room:rn,from:'SERVER',revision:r.revision,data:{reason:'Whole STATE writes are retired; upgrade this client.',state:r.latestState}});return;
  }
  /*
   // 3.30.0: whole-game snapshots still carry gameplay effects during migration, but
   // Actions / Pass / Round / Phase are server-owned and can never be overwritten here.
   if(r.turnAuthority3300?.resolving){send(ws,{type:'STATE_IGNORED_RESOLVING',room:rn,from:'SERVER',data:{turn:turnPublic3300(r)}});return}
   // 3.27.0: the ROOM owns the canonical snapshot. A client may propose a new snapshot
   // only from the revision it most recently received. Stale whole-game snapshots are
   // rejected instead of overwriting newer Hero/deck/position state from another player.
   const base=Number(m.baseRevision);
   if(r.latestState && (!Number.isInteger(base) || base!==r.revision)){
     persistLog(`REJECT STALE STATE ${rn} from=${ws.role} base=${m.baseRevision} roomRev=${r.revision}`);
     send(ws,{type:'STATE_REJECTED',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
     return;
   }
   const owner32729=null;
   r.latestState=mergeCanonicalEnemies3301(r,mergeCanonicalHeroes3303(r,mergeCanonicalExploration3305(r,mergeCanonicalResources3310(r,preserveServerTurnFields3300(r,m.data)))));
   if(owner32729){r.latestState.campaignOwner32729=owner32729;if(r.latestState.game)r.latestState.game.campaignOwner32729=owner32729}
   // Never let a client snapshot erase or forge server-owned Hero reservations.
   r.latestState.heroOwners32724={...(r.heroOwners32724||{})};
   if(r.latestState.game)r.latestState.game.heroOwners32724={...(r.heroOwners32724||{})};
   r.revision=(r.revision||0)+1;saveRoomState(rn,r.latestState);
   persistLog(`COMMIT ${rn} rev=${r.revision} from=${ws.role}`);
   // Server broadcasts the committed canonical snapshot to EVERY client, including sender.
   for(const peer of r.clients)send(peer,{type:'STATE',room:rn,from:'SERVER',revision:r.revision,data:r.latestState});
   broadcastTurn3300(r,rn,{reason:'snapshot-commit'});
   broadcastHero3303(r,rn,{reason:'snapshot-commit'});broadcastResources3310(r,rn,{reason:'snapshot-patch'});
   return;
  */
  // Legacy request remains supported only after JOIN; disk remains authoritative.
  if(m.type==='REQUEST_STATE'){
   const diskState=loadRoomState(rn);if(diskState){r.latestState=diskState;if(!r.revision)r.revision=1}
   send(ws,{type:r.latestState?'ROOM_STATE':'ROOM_EMPTY',room:rn,from:'SERVER',revision:r.revision||0,data:r.latestState||null});if(r.latestState){send(ws,{type:'TURN_STATE',room:rn,from:'SERVER',data:turnPublic3300(r)});send(ws,{type:'HERO_STATE',room:rn,from:'SERVER',data:heroPublic3303(r)});send(ws,{type:'EXPLORATION_STATE',room:rn,from:'SERVER',data:explorationPublic3305(r)});send(ws,{type:'RESOURCE_STATE',room:rn,from:'SERVER',data:resourcePublic3310(r)});send(ws,{type:'PHASE_STATE',room:rn,from:'SERVER',data:phasePublic3311(r)});send(ws,{type:'CAMPAIGN_AUTH_STATE',room:rn,from:'SERVER',data:syncCampaignAuthority3321(r,rn,r.latestState)});send(ws,{type:'PHASE_JOB_STATE',room:rn,from:'SERVER',data:phaseJobPublic3320(r)})}return;
  }
  for(const peer of r.clients)if(peer!==ws)send(peer,m);
 });
 ws.on('close',()=>{if(ws.room&&rooms.has(ws.room)){const rn=ws.room,r=rooms.get(rn),oldHost=r.host,oldHostRole=r.host?.role||null;resetResolverIfGone3300(r,rn,ws.role);r.clients.delete(ws);
   const turn33618=ensureTurnAuthority3300(r);
   if(turn33618?.turnHero===ws.role&&!r.explorePending3305?.[ws.role]){
     turn33618.turnHero=null;turn33618.activationSeq=Number(turn33618.activationSeq||0)+1;turn33618.seq++;
     applyTurnAuthorityToGame3300(r);saveRoomState(rn,r.latestState);
     debugEvent('ROOM_TURN_RELEASE_33618',{room:rn,hero:ws.role||null,reason:'disconnect',activationSeq:turn33618.activationSeq});
     broadcastTurn3300(r,rn,{reason:'turn-owner-disconnected'});
   }
   const live=[...r.clients].filter(c=>c.readyState===1);if(r.host===ws||!r.host||r.host.readyState!==1)r.host=live[0]||null;const hostMigrated=oldHost!==r.host&&!!r.host;const heroes=[...new Set(live.map(c=>c.role).filter(Boolean))];const customHeroDefinitions=Object.fromEntries(live.filter(c=>c.heroDefinition?.id).map(c=>[c.role,c.heroDefinition]));const players=live.map(c=>{let displayName=c.account32716||c.role;try{if(c.account32716)displayName=readAccount(c.account32716).displayName||c.account32716}catch(_){}return {hero:c.role,username:c.account32716,displayName,ready:!!c.ready32716,isHost:c===r.host}});for(const peer of live){send(peer,{type:'PARTY_ROSTER',room:rn,from:'SERVER',data:{heroes,customHeroDefinitions}});send(peer,{type:'HOST_STATUS',room:rn,from:'SERVER',data:{isHost:peer===r.host,hostRole:r.host?.role||null}});send(peer,{type:'PARTY_LOBBY',room:rn,from:'SERVER',data:{players,hostRole:r.host?.role||null}});if(hostMigrated)send(peer,{type:'HOST_MIGRATED',room:rn,from:'SERVER',data:{previousHostRole:oldHostRole,hostRole:r.host?.role||null,isHost:peer===r.host,adventureStarted:!!r.adventureStarted}})}if(hostMigrated)persistLog(`HOST MIGRATED ${rn} ${oldHostRole||'none'} -> ${r.host?.role||'none'}`);persistLog(`DISCONNECT ${rn} hero=${ws.role||'?'} remaining=${live.length} host=${r.host?.role||'none'}`);debugEvent('PLAYER_DISCONNECTED',{room:rn,hero:ws.role||null,remaining:heroes,hostRole:r.host?.role||null});if(!r.clients.size)setTimeout(()=>{const current=rooms.get(rn);if(current?.clients.size===0)rooms.delete(rn)},3600000)}});
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>{console.log(`Ascendance 3.36.21 STABILITY / REGRESSION FOUNDATION running on port ${PORT}; persistent saves ${persistenceEnabled?'ENABLED':'DISABLED'} at ${DATA_DIR}`);persistLog(`START directory=${DATA_DIR} exists=${fs.existsSync(DATA_DIR)}`);if(persistenceEnabled){try{persistLog(`START files=${fs.readdirSync(DATA_DIR).join(',')||'(none)'}`)}catch(e){console.warn(`[PERSIST] START directory listing error: ${e.message}`)}}});
