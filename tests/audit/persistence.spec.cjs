const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process'),{once}=require('node:events');
test('temporary server: account save/load and room restore after process restart',async({page})=>{
 test.setTimeout(45000);const dir=fs.mkdtempSync(path.join(os.tmpdir(),'asc-restart-'));let child;
 async function start(){child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'3102',ASCENDANCE_DATA_DIR:dir},stdio:'ignore'});for(let i=0;i<100;i++){if(child.exitCode!==null)throw Error('Temporary server exited');try{if((await fetch('http://127.0.0.1:3102/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,100))}throw Error('Temporary server not ready')}
 async function stop(){if(child&&child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await ended}}
 const req=async(route,method='GET',body,token)=>{const r=await fetch('http://127.0.0.1:3102'+route,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});expect(r.ok).toBe(true);return r.json()};
 try{await start();const account=await req('/api/auth/register','POST',{username:'isolated_audit',password:'temporary-audit-only-password'});const characters=[{id:'CH001',name:'Isolated Audit Hero',level:3}];await req('/api/account/characters','PUT',{characters},account.token);
 await page.goto('http://127.0.0.1:3102/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{init('Q001',['Aldric']);g.gold=137;window.restartMessages=[];window.restartSocket=new WebSocket(`ws://${location.host}/ws`);restartSocket.onmessage=e=>restartMessages.push(JSON.parse(e.data));await new Promise(r=>restartSocket.onopen=r);restartSocket.send(JSON.stringify({type:'NEW_GAME_JOIN',room:'ISOLATED_RESTART',from:'Aldric',data:{game:g}}))});
 await page.waitForFunction(()=>restartMessages.some(m=>m.type==='REJOIN_CREDENTIAL'));const credential=await page.evaluate(()=>restartMessages.find(m=>m.type==='REJOIN_CREDENTIAL').data.token);
 await page.evaluate(()=>restartSocket.close());await stop();await start();
 const restored=await req('/api/account/characters','GET',null,account.token);expect(restored.characters).toEqual(characters);
 await page.evaluate(async token=>{window.restartMessages=[];window.restartSocket=new WebSocket(`ws://${location.host}/ws`);restartSocket.onmessage=e=>restartMessages.push(JSON.parse(e.data));await new Promise(r=>restartSocket.onopen=r);restartSocket.send(JSON.stringify({type:'JOIN',room:'ISOLATED_RESTART',from:'Aldric',data:{rejoinToken3321:token}}))},credential);
 await page.waitForFunction(()=>restartMessages.some(m=>m.type==='ROOM_STATE'));const state=await page.evaluate(()=>restartMessages.find(m=>m.type==='ROOM_STATE').data.game);expect(state.gold).toBe(137);expect(state.partyHeroes).toContain('Aldric');await page.evaluate(()=>restartSocket.close());
 }finally{await stop();fs.rmSync(dir,{recursive:true,force:true})}
});
