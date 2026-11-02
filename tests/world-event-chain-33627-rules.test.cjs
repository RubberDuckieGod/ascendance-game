'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rules=require('../world-event-chain-rules-33627.js');
function fixture(){
 const g={partyHeroes:['Rowan','Lyra'],round:10,phase:'Hero Phase',gold:37,reputation:4,xp:{Rowan:200,Lyra:300},levels:{Rowan:2,Lyra:2},heroRuntimeStates:{Rowan:{hp:5,x:1,y:0}},lyra:{hp:0,x:0,y:0},inventory:{Rowan:[],Lyra:[]},partyQuestItems:[],tiles:{'0,0':{id:'L000'},'1,0':{id:'L006'}},pool:[{id:'L019'}],questTransitionAuthority33626:{epoch:3,commands:{previous:{quest:'Q003'}}},campaign:{instanceId32537:'UNIT-ISOLATED',activeEvent:'WE001',currentQuest:'Q003',day:4,downtime:true,questStatus:{Q001:'Completed',Q002:'Completed',Q003:'Completed'},effects:[],lastQuestOutcome:{quest:'Q003',outcome:'Completed',day:3},history:[{event:'WE001',quest:'Q003',outcome:'Completed',day:3}]}};
 return {g,cmd:{id:'ADVANCE-UNIT',baseRevision:7,fromEvent:'WE001',fromQuest:'Q003',questEpoch33626:3},options:{actor:'Rowan',isHost:true,revision:7}};
}
test('World Event canonical advance keeps Downtime and old board, awards living-Hero WE001 XP once, and increments the Quest epoch',()=>{
 const {g,cmd,options}=fixture(),untouched=structuredClone(g),out=rules.advance(g,cmd,options);assert.equal(out.error,undefined);assert.deepEqual(g,untouched);
 assert.deepEqual(out.game.tiles,g.tiles);assert.deepEqual(out.game.pool,g.pool);assert.equal(out.game.round,10);assert.deepEqual(out.game.campaign.history,g.campaign.history);assert.equal(out.game.campaign.currentQuest,'Q004');assert.equal(out.game.campaign.activeEvent,'WE002');assert.equal(out.game.campaign.day,1);assert.equal(out.game.campaign.downtime,true);assert.equal(out.game.gold,37);assert.equal(out.game.reputation,4);assert.equal(out.game.xp.Rowan,250);assert.equal(out.game.xp.Lyra,300);assert.equal(out.game.questTransitionAuthority33626.epoch,4);assert.deepEqual(out.game.questTransitionAuthority33626.commands,g.questTransitionAuthority33626.commands);
 assert.ok(out.game.campaign.effects.includes('WE001: +1 Party Morale.'));assert.ok(out.game.campaign.effects.includes('WE001: remove one Goblin Scout from Q004.'));
 const repeat=rules.advance(out.game,cmd,{...options,revision:8});assert.equal(repeat.duplicate,true);assert.deepEqual(repeat.receipt,out.receipt);assert.equal(out.game.xp.Rowan,250);assert.equal(out.game.questTransitionAuthority33626.epoch,4);
});
test('World Event authorization rejects stale revision/event/Quest/epoch, foreign actor, forged host and unfinished Quest without mutating input',()=>{
 for(const change of [f=>f.options.isHost=false,f=>f.options.actor='Mira',f=>f.cmd.baseRevision=6,f=>f.cmd.fromEvent='WE002',f=>f.cmd.fromQuest='Q002',f=>f.cmd.questEpoch33626=2,f=>f.g.campaign.downtime=false,f=>f.g.campaign.campaignEnded=true,f=>f.cmd.id='__proto__',f=>f.options.resolving=true]){
  const f=fixture();change(f);const before=structuredClone(f.g);assert.ok(rules.advance(f.g,f.cmd,f.options).error);assert.deepEqual(f.g,before);
 }
 const f=fixture(),out=rules.advance(f.g,f.cmd,f.options);assert.ok(rules.advance(out.game,{...f.cmd,fromQuest:'Q001'},{...f.options,revision:8}).error);assert.ok(rules.advance(out.game,f.cmd,{...f.options,actor:'Lyra',revision:8}).error);
});
test('Q003 Optional completion never substitutes for Q001/Q002 Main requirements, and required-only completion grants no all-three bonus',()=>{
 const f=fixture();f.g.campaign.questStatus.Q002='Available';assert.match(rules.advance(f.g,f.cmd,f.options).error,/required Main Quests/);f.cmd.forced=true;assert.ok(rules.advance(f.g,f.cmd,f.options).error);
 f.g.campaign.questStatus.Q002='Completed';f.g.campaign.questStatus.Q003='Available';f.g.campaign.currentQuest='Q002';f.cmd.fromQuest='Q002';const out=rules.advance(f.g,f.cmd,f.options);assert.equal(out.error,undefined);assert.equal(out.game.xp.Rowan,200);assert.deepEqual(out.receipt.settlement.xpByHero,{});
});
test('forced day-limit advancement requires the actual final-day attempt history and applies the existing WE001 penalty once',()=>{
 const f=fixture();f.g.campaign.questStatus={Q001:'Available',Q002:'Available',Q003:'Available'};f.g.campaign.day=5;assert.ok(rules.advance(f.g,f.cmd,f.options).error);
 f.g.campaign.lastQuestOutcome={quest:'Q003',outcome:'Retreated',day:5};f.g.campaign.history.push({event:'WE001',quest:'Q003',outcome:'Retreated',day:5});const out=rules.advance(f.g,f.cmd,f.options);assert.equal(out.error,undefined);assert.equal(out.receipt.forced,true);assert.equal(out.game.campaign.questStatus.Q001,'Failed');assert.equal(out.game.campaign.questStatus.Q002,'Failed');assert.equal(out.game.campaign.questStatus.Q003,'Unavailable');assert.equal(out.game.reputation,3);assert.equal(out.game.xp.Rowan,200);assert.equal(out.game.campaign.currentQuest,'Q004');
});
test('all 24 event groups retain authored explicit Main/Optional requirements and next-event identity',()=>{
 const source=fs.readFileSync('index.html','utf8'),start=source.indexOf('const WORLD_EVENTS='),end=source.indexOf('\nfunction ensureCampaign',start),events=vm.runInNewContext(source.slice(start,end)+';WORLD_EVENTS');
 for(const [file,prefix]of [['campaign2-3330.js','C2'],['campaign34-3340.js','C34'],['campaign56-3350.js','C56']])Object.assign(events,JSON.parse(fs.readFileSync(file,'utf8').match(new RegExp('const '+prefix+'_WORLD_EVENTS=(.*?);\\n'))[1]));
 assert.equal(Object.keys(events).length,24);for(const [id,row]of Object.entries(events)){const actual=rules.event(id);assert.deepEqual(actual.required,Array.from(row.required),id);assert.equal(actual.next,row.next,id);assert.equal(actual.dayLimit,row.dayLimit,id);assert.deepEqual(actual.quests,JSON.parse(JSON.stringify(row.quests.map(q=>({id:q.id,type:q.type})))),id)}
 assert.deepEqual(rules.event('WE006').required,['Q016','Q018']);assert.deepEqual(rules.event('WE009').required,['Q025','Q027']);
});
test('regional completionist rewards retain existing XP, track, faction and item hooks using canonical values',()=>{
 for(const [event,quest,xp,track]of [['WE005','Q015',50,null],['WE009','Q027',75,'c3Instability'],['WE014','Q042',125,'c4Blight'],['WE018','Q054',150,'c5Doomtide'],['WE023','Q069',200,'c6Sunfall']]){
  const f=fixture(),ev=rules.event(event);f.g.campaign.activeEvent=event;f.g.campaign.currentQuest=quest;f.g.campaign.questStatus=Object.fromEntries(ev.quests.map(q=>[q.id,'Completed']));if(track)f.g.campaign[track]=3;f.cmd.fromEvent=event;f.cmd.fromQuest=quest;
  const out=rules.advance(f.g,f.cmd,f.options);assert.equal(out.error,undefined);assert.equal(out.game.xp.Rowan,200+xp);assert.equal(out.game.xp.Lyra,300);if(track)assert.equal(out.game.campaign[track],2);if(event==='WE005')assert.ok(out.game.partyQuestItems.includes('LT162'));
 }
});
