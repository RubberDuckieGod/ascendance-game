const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const S=require('../public/status-rules-33627.js');
function fixture(hero='Elara',{permanent=false,accept=true}={}){
 const g={round:1,phase:'Hero Phase',partyHeroes:[hero,'Thorne'],hp:5,maxHp:10,actions:3,hero:{x:0,y:0},conditions:[],levels:{Thorne:1},heroRuntimeStates:{},equipped:{},campaign:{currentQuest:'Q003'},tiles:{'0,0':{enemies:[]},'1,0':{enemies:[]}}};
 for(const h of [hero,'Thorne'])if(h!=='Aldric'){const b={x:h==='Thorne'?1:0,y:0,hp:5,maxHp:10,actions:3,conditions:[]};if(h==='Lyra')g.lyra=b;else if(h==='Seraphine')g.seraphine=b;else g.heroRuntimeStates[h]=b}
 const body=h=>S.body(g,h),pos=h=>h==='Aldric'?g.hero:body(h);
 body(hero).statusActivation33627={start:'current'};if(permanent)body(hero).conditions=['Regenerating'];
 let prompts=0;
 const ctx={g,ascStatusDefinitions33628:S.definitions,ascStatusRules33627:S,window:null,document:{readyState:'complete',querySelector:()=>null},setTimeout:fn=>fn(),console,log:()=>{},
 runtimeHeroState:body,heroPos:pos,heroDisplayName:h=>h,isPartyHero:h=>g.partyHeroes.includes(h),
 heroHasCondition:(h,n)=>S.has(body(h),n),addHeroCondition:(h,n)=>{if(!S.has(body(h),n))body(h).conditions.push(n)},
 key:(x,y)=>x+','+y,confirm:()=>{prompts++;return accept},
 enterHeroLocation:(h,x,y)=>{Object.assign(pos(h),{x,y});return true}};
 ctx.window=ctx;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/hero-runtime-parity-3362.js'),'utf8'),ctx);
 return {g,body:body(hero),ctx,prompts:()=>prompts};
}
for(const hero of ['Aldric','Lyra','Seraphine','Elara'])test('ordinary movement Wild Growth expires after next distinct activation: '+hero,()=>{
 const {g,body,ctx}=fixture(hero);ctx.enterHeroLocation(hero,1,0,'Move');
 assert.equal(S.has(body,'Regenerating'),true);
 S.heroEnd(g,hero,{token:'current'});assert.equal(S.has(body,'Regenerating'),true);
 S.heroStart(g,hero,{token:'next'});assert.equal(body.hp,6);
 S.heroEnd(g,hero,{token:'next'});assert.equal(S.has(body,'Regenerating'),false);
 assert.equal(body.wildGrowthRegenerating33627,undefined);
 assert.equal(g.heroAbilityRuntime3362.flags[hero+'::Wild Growth Boost'],undefined);
});
test('ordinary movement preserves permanent Regenerating',()=>{
 const {g,body,ctx}=fixture('Elara',{permanent:true});ctx.enterHeroLocation('Elara',1,0,'Move');
 assert.equal(body.wildGrowthRegenerating33627,undefined);S.heroEnd(g,'Elara',{token:'next'});assert.equal(S.has(body,'Regenerating'),true);
});
test('declined Wild Growth grants nothing and does not consume its Round use',()=>{
 const {g,body,ctx}=fixture('Elara',{accept:false});ctx.enterHeroLocation('Elara',1,0,'Move');
 assert.equal(S.has(body,'Regenerating'),false);assert.equal(body.wildGrowthRegenerating33627,undefined);assert.equal(g.heroAbilityRuntime3362.round['Thorne::Wild Growth'],undefined);
});
test('ordinary movement can refresh temporary Regenerating and cannot trigger twice per Round',()=>{
 const {g,body,ctx,prompts}=fixture();body.conditions=['Regenerating'];body.wildGrowthRegenerating33627={appliedToken:'old',owner:'Thorne'};
 ctx.enterHeroLocation('Elara',1,0,'Move');assert.equal(body.wildGrowthRegenerating33627.appliedToken,'current');
 ctx.enterHeroLocation('Elara',0,0,'Move');ctx.enterHeroLocation('Elara',1,0,'Move');assert.equal(prompts(),1);
 S.heroEnd(g,'Elara',{token:'current'});assert.equal(S.has(body,'Regenerating'),true);
 S.heroEnd(g,'Elara',{token:'next'});assert.equal(S.has(body,'Regenerating'),false);
});
