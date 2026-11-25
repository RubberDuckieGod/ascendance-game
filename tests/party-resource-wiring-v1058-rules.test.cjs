'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../public/party-resources-v1058.js'),Room=require('../server/party-resource-room-v1058.js');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const g0=()=>({round:1,phase:'Hero Phase',partyHeroes:['Aldric','Lyra'],campaign:{currentQuest:'Q013',instanceId32537:'a'},partyLore1058:6,partyEvidence1058:2,partySupplies33615:4,hp:8,maxHp:12,lyra:{hp:6,maxHp:8},encDeck:[{id:'EN001'},{id:'EN002'}]});
// Extract the actual message branch, not a reimplemented handler. Socket I/O,
// persistence and unrelated ledgers are mocked, so this is not a live WS test.
test('actual patched WebSocket branch publishes canonical resources and exploration to both peers',()=>{
 const s=read('server.js'),start=s.indexOf("if(m.type==='PARTY_LORE_COMMAND'){"),end=s.indexOf("if(m.type==='REQUEST_RESOURCE_STATE'){",start);assert.ok(start>=0&&end>start);
 const peers=[{role:'Aldric'},{role:'Lyra'}],messages=[],saves=[],room={adventureStarted:true,latestState:{game:g0()},resourceSeq3310:0,exploreSeq3305:0,heroSeq3303:0,revision:0,explorePending3305:{},clients:peers};
 const turn={phase:'Hero Phase',turnHero:'Aldric',started:{Aldric:true},passed:{},activationSeq:1};
 const send=(peer,packet)=>messages.push({to:peer.role,packet:JSON.parse(JSON.stringify(packet))});
 const sandbox={r:room,rn:'unit-room',ws:peers[0],send,ensureTurnAuthority3300:()=>turn,ensureResourceStore3310:()=>{},ensureExploreStore3305:()=>{},ensureHeroStore3303:()=>{},partyResourceRoom1058:Room,heroDefeated3300:()=>false,statusRules33627:{has:()=>false,body:()=>({})},healingSummons33627:{hasPending:()=>false},questTransition33626:{maxHealth:()=>12},shuffleHeroCards33621:a=>a,crypto:require('node:crypto'),ROOM_RESOURCE_VERSION_3310:'resource',ROOM_HERO_VERSION_3303:'hero',bumpExplore3305:r=>r.exploreSeq3305++,saveRoomState:(n,s)=>saves.push(JSON.parse(JSON.stringify(s))),broadcastResources3310:(r,n)=>r.clients.forEach(p=>send(p,{type:'RESOURCE_STATE',data:{seq:r.resourceSeq3310,resources:R.snapshot(r.latestState.game)}})),broadcastExploration3305:(r,n)=>r.clients.forEach(p=>send(p,{type:'EXPLORATION_STATE',data:{seq:r.exploreSeq3305,encDeck:r.latestState.game.encDeck}})),broadcastHero3303:()=>{}};
 const dispatch=vm.runInNewContext(`(function(m){${s.slice(start,end)} })`,sandbox);
 const cmd={hero:'Aldric',scope:R.scope(room.latestState.game),round:1,use:'READ_AHEAD'};
 dispatch({type:'PARTY_LORE_COMMAND',data:{...cmd,id:'peek',op:'PEEK'}});const token=messages.at(-1).packet.data.token;assert.ok(token);
 dispatch({type:'PARTY_LORE_COMMAND',data:{...cmd,id:'commit',op:'COMMIT',token,order:[1,0]}});
 assert.equal(saves.length,1);assert.equal(saves[0].game.partyLore1058,5);assert.equal(room.resourceSeq3310,1);assert.equal(room.exploreSeq3305,1);
 for(const p of peers){const packets=messages.filter(m=>m.to===p.role).map(m=>m.packet);assert.ok(packets.some(m=>m.type==='STATE'&&m.data.game.partyLore1058===5));assert.ok(packets.some(m=>m.type==='RESOURCE_STATE'&&m.data.resources.lore===5));assert.ok(packets.some(m=>m.type==='EXPLORATION_STATE'&&m.data.encDeck[0].id==='EN002'));}
 dispatch({type:'PARTY_LORE_COMMAND',data:{...cmd,id:'commit',op:'COMMIT',token,order:[1,0]}});assert.equal(saves.length,1);assert.equal(room.latestState.game.partyLore1058,5);assert.equal(messages.at(-1).packet.data.duplicate,true);
});
test('actual browser resource packet gate applies only current sequence and preserves omitted fields',()=>{
 const s=read('public/index.html'),line=s.split('\n').find(l=>l.includes('function applyPacket(packet,reason)')&&l.includes('RESOURCE_STATE_OLD_IGNORED_3310'));assert.ok(line);
 const g=g0(),sandbox={g,resourceSeq:0,window:{ascPartyResources1058:R},diag:()=>{},applyResources:()=>true};
 const dispatch=vm.runInNewContext(`(${line.trim()})`,sandbox);
 assert.equal(dispatch({seq:5,resources:{lore:3,evidence:4,supplies:2}},'test'),true);assert.equal(g.partyLore1058,3);assert.equal(g.partyEvidence1058,4);
 assert.equal(dispatch({seq:4,resources:{lore:12,evidence:9,supplies:9}},'stale'),false);assert.deepEqual(R.balances(g),{lore:3,evidence:4,supply:2});
 assert.equal(dispatch({seq:6,resources:{supplies:1}},'legacy'),true);assert.deepEqual(R.balances(g),{lore:3,evidence:4,supply:1});
});
test('actual browser Encounter refresh gate notices Forewarned without a changed die roll',()=>{
 const line=read('public/index.html').split('\n').find(l=>l.includes("p.kind==='encounter'&&!resolvingEncounter3306"));assert.ok(line);
 const cond=line.slice(line.indexOf('if(')+3,line.lastIndexOf('){'));
 const p={kind:'encounter',card:{id:'EN001'},encounterSerial33621:1,baseRoll:3,severity:3,text:'before',forewarned1058:false};
 const sandbox={p,pEnc:{...p,roomAuthority3305:true,roomHero3300:'Aldric'},mpRole:'Aldric',resolvingEncounter3306:false,cardKey:c=>c.id};
 assert.equal(vm.runInNewContext(cond,sandbox),false);
 p.severity=2;p.text='after';p.forewarned1058=true;
 assert.equal(vm.runInNewContext(cond,sandbox),true);
});
