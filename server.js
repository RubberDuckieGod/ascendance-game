const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');
const fs=require('fs');

const app=express();
app.use(express.static(path.join(__dirname,'public')));
const server=http.createServer(app);
const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();

const DATA_DIR=process.env.ASCENDANCE_DATA_DIR || '/var/data/ascendance';
const persistenceEnabled=(()=>{
  try{fs.mkdirSync(DATA_DIR,{recursive:true});fs.accessSync(DATA_DIR,fs.constants.W_OK);return true}
  catch(e){console.warn(`Persistent room saves unavailable at ${DATA_DIR}: ${e.message}`);return false}
})();

function safeRoomName(name){return String(name).trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,64)}
function roomFile(name){return path.join(DATA_DIR,`${safeRoomName(name)}.json`)}
function loadRoomState(name){
  if(!persistenceEnabled)return null;
  try{
    const f=roomFile(name);
    if(!fs.existsSync(f))return null;
    const saved=JSON.parse(fs.readFileSync(f,'utf8'));
    return saved && saved.state ? saved.state : null;
  }catch(e){console.warn(`Could not load room ${name}: ${e.message}`);return null}
}
function saveRoomState(name,state){
  if(!persistenceEnabled||!state)return;
  try{
    const f=roomFile(name),tmp=f+'.tmp';
    fs.writeFileSync(tmp,JSON.stringify({room:name,savedAt:new Date().toISOString(),state}));
    fs.renameSync(tmp,f);
  }catch(e){console.warn(`Could not save room ${name}: ${e.message}`)}
}
function room(name){
  if(!rooms.has(name)) rooms.set(name,{clients:new Set(),latestState:loadRoomState(name)});
  return rooms.get(name);
}
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj));}

app.get('/health',(req,res)=>res.json({ok:true,version:'2.8.1',persistence:persistenceEnabled}));

wss.on('connection',ws=>{
  ws.room=null;
  ws.on('message',raw=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    if(!m.room||!m.type)return;
    const rn=safeRoomName(m.room);
    if(!rn)return;
    if(ws.room!==rn){
      if(ws.room&&rooms.has(ws.room)) rooms.get(ws.room).clients.delete(ws);
      ws.room=rn; room(rn).clients.add(ws);
    }
    const r=room(rn);
    if(m.type==='STATE'&&m.data){
      r.latestState=m.data;
      saveRoomState(rn,m.data);
    }
    if(m.type==='REQUEST_STATE'&&r.latestState){
      send(ws,{type:'STATE',room:rn,from:'SERVER',data:r.latestState});
      return;
    }
    for(const peer of r.clients) if(peer!==ws) send(peer,m);
  });
  ws.on('close',()=>{
    if(ws.room&&rooms.has(ws.room)){
      const rn=ws.room,r=rooms.get(rn);r.clients.delete(ws);
      if(!r.clients.size) setTimeout(()=>{
        const current=rooms.get(rn);
        if(current?.clients.size===0)rooms.delete(rn);
      },3600000);
    }
  });
});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Ascendance 2.8.1 running on port ${PORT}; persistent saves ${persistenceEnabled?'ENABLED':'DISABLED'} at ${DATA_DIR}`));
