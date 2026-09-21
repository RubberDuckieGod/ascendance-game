const express=require('express');
const http=require('http');
const {WebSocketServer}=require('ws');
const path=require('path');

const app=express();
app.use(express.static(path.join(__dirname,'public')));
const server=http.createServer(app);
const wss=new WebSocketServer({server,path:'/ws'});
const rooms=new Map();

function room(name){
  if(!rooms.has(name)) rooms.set(name,{clients:new Set(),latestState:null});
  return rooms.get(name);
}
function send(ws,obj){if(ws.readyState===1)ws.send(JSON.stringify(obj));}

wss.on('connection',ws=>{
  ws.room=null;
  ws.on('message',raw=>{
    let m; try{m=JSON.parse(raw)}catch{return}
    if(!m.room||!m.type)return;
    const rn=String(m.room).trim().toUpperCase();
    if(ws.room!==rn){
      if(ws.room&&rooms.has(ws.room)) rooms.get(ws.room).clients.delete(ws);
      ws.room=rn; room(rn).clients.add(ws);
    }
    const r=room(rn);
    if(m.type==='STATE'&&m.data) r.latestState=m.data;
    if(m.type==='REQUEST_STATE'&&r.latestState){
      send(ws,{type:'STATE',room:rn,from:'SERVER',data:r.latestState});
      return;
    }
    for(const peer of r.clients) if(peer!==ws) send(peer,m);
  });
  ws.on('close',()=>{
    if(ws.room&&rooms.has(ws.room)){
      const r=rooms.get(ws.room);r.clients.delete(ws);
      if(!r.clients.size) setTimeout(()=>{if(rooms.get(ws.room)?.clients.size===0)rooms.delete(ws.room)},3600000);
    }
  });
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`Ascendance 2.8.0 running on http://localhost:${PORT}`));
