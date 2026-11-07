'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../public/location-quest-rules-33627.js');

function oldAttempt({opened=true}={}){
 return {round:7,phase:'Hero Phase',partyHeroes:['Rowan'],heroRuntimeStates:{Rowan:{hp:9,actions:0,x:0,y:0}},partyQuestItems:opened?[]:['LT118'],lootDeck:opened?['LT118']:[],lootDiscard:[],inventory:{Rowan:opened?[{key:'equipment:EQ001',kind:'equipment',id:'EQ001',qty:1}]:[]},tiles:{'0,0':{id:'L000',enemies:[],revealResolved:true,firstReveal33627:{location:'L000',hero:'Rowan',round:1},revealingHero33627:'Rowan',revealedRound33627:1},'1,0':{id:'L017',enemies:[{type:'Raider',roomEnemyId3301:'old-attempt-raider',hp:2}]}},campaign:{instanceId32537:'ISOLATED-RESET',currentQuest:'Q003',day:1,questStatus:{Q003:'Available'},q003:{watchtowerRevealed:true,vaultKeyClaimed3304:true,armoryOpened3304:opened,vaultKeyReceipt33627:{item:'LT118',hero:'Rowan',enemy:'earlier-raider',round:2},...(opened?{armoryReward33627:{hero:'Rowan',item:'EQ001',round:3,cost:1}}:{})}}};
}
function freshAttempt(before){
 const next=structuredClone(before);next.round=1;next.campaign.day=2;next.campaign.downtime=true;next.campaign.lastQuestOutcome={quest:'Q003',outcome:'Failed',day:1};
 next.campaign.q003={watchtowerRevealed:false,spawned:false,beaconLit:false,emptyRounds:0,resolved:false};next.tiles={'0,0':{id:'L000',enemies:[]}};
 return next;
}

test('validated fresh Q003 attempt keeps the reset armory and Reveal state instead of restoring old receipts',()=>{
 const before=oldAttempt(),next=freshAttempt(before),expected=structuredClone(next);
 assert.equal(R.preserve(before,next,{phaseResult:true,freshAttempt:true}),next);
 assert.deepEqual(next,expected,'the validated fresh setup is unchanged, including retained campaign equipment and the returned key deck');
 assert.equal(next.campaign.q003.armoryOpened3304,undefined);assert.equal(next.campaign.q003.vaultKeyReceipt33627,undefined);assert.equal(next.tiles['0,0'].revealResolved,undefined);
 assert.deepEqual(next.inventory.Rowan,[{key:'equipment:EQ001',kind:'equipment',id:'EQ001',qty:1}]);assert.deepEqual(next.lootDeck,['LT118']);
});
test('validated fresh attempt preserves an unspent carried key exactly as supplied by campaign persistence',()=>{
 const before=oldAttempt({opened:false}),next=freshAttempt(before),expected=structuredClone(next);
 R.preserve(before,next,{phaseResult:true,freshAttempt:true});assert.deepEqual(next,expected);assert.deepEqual(next.partyQuestItems,['LT118']);assert.equal(next.campaign.q003.vaultKeyClaimed3304,undefined);
});
test('a later resource proposal cannot erase the canonical carried key after a fresh-attempt reset',()=>{
 const before=oldAttempt({opened:false}),next=freshAttempt(before);R.preserve(before,next,{phaseResult:true,freshAttempt:true});
 const staleResources={partyQuestItems:[],lootDeck:['LT118'],lootDiscard:['LT118']};R.constrainKeyResources(next,staleResources);
 assert.deepEqual(staleResources,{partyQuestItems:['LT118'],lootDeck:[],lootDiscard:[]});assert.equal(next.campaign.q003.vaultKeyClaimed3304,undefined,'the persistent key is sufficient without restoring a previous attempt receipt');
});
test('resource-only key claims cannot forge a key or resurrect a key returned by an opened armory',()=>{
 const missing=freshAttempt(oldAttempt());missing.lootDeck=[];const forged={partyQuestItems:['LT118'],lootDeck:['LT118'],lootDiscard:['LT118']};R.constrainKeyResources(missing,forged);assert.deepEqual(forged,{partyQuestItems:[],lootDeck:[],lootDiscard:[]});
 const opened=oldAttempt();opened.partyQuestItems=['LT118'];const replay={partyQuestItems:['LT118'],lootDeck:[],lootDiscard:['LT118']};R.constrainKeyResources(opened,replay);assert.deepEqual(replay,{partyQuestItems:[],lootDeck:['LT118'],lootDiscard:[]},'the canonical opened receipt overrides even an inconsistent carried copy');
});
test('fresh-attempt cleanup cannot be mistaken for a new Raider defeat',()=>{
 const before=oldAttempt({opened:false}),next=freshAttempt(before);next.partyQuestItems=[];next.campaign.downtime=false;const expected=structuredClone(next);
 R.preserve(before,next,{phaseResult:true,freshAttempt:true});assert.deepEqual(next,expected);assert.deepEqual(next.partyQuestItems,[]);
});
test('ordinary Day advancement at quest completion still preserves canonical armory and Reveal receipts',()=>{
 const before=oldAttempt(),next=freshAttempt(before);next.campaign.lastQuestOutcome.outcome='Completed';next.campaign.questStatus.Q003='Completed';next.campaign.downtime=false;next.campaign.afterQuestExplore32920={active:true,quest:'Q003'};
 R.preserve(before,next,{phaseResult:true});assert.equal(next.campaign.q003.armoryOpened3304,true);assert.deepEqual(next.campaign.q003.armoryReward33627,before.campaign.q003.armoryReward33627);assert.equal(next.tiles['0,0'].revealResolved,true);assert.deepEqual(next.tiles['0,0'].firstReveal33627,before.tiles['0,0'].firstReveal33627);
});
