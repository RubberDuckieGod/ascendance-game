const {test}=require('node:test'),assert=require('node:assert/strict');
const H=require('../public/healing-summons-rules-33627.js');
function fixture(){return {round:1,phase:'Hero Phase',partyHeroes:['Thorne','Elara'],campaign:{currentQuest:'Q003'},levels:{Thorne:1,Elara:1},equipped:{},heroRuntimeStates:{Thorne:{x:0,y:0,hp:9,maxHp:9,actions:3,conditions:[],hand:[{id:'H007-012',uid:'blessing',name:"Nature's Blessing"}],deck:[],discard:[]},Elara:{x:0,y:0,hp:5,maxHp:10,actions:3,conditions:['Bleeding','Burning'],hand:[],deck:[],discard:[]}},tiles:{'0,0':{enemies:[],edges:{}}}}}
for(const condition of ['Bleeding','Burning'])test("Nature's Blessing heals and removes exactly the selected "+condition,()=>{
 const g=fixture(),out=H.playCard(g,'Thorne',{cardId:'H007-012',cardUid:'blessing',targetHero:'Elara',condition});assert.equal(out.error,undefined);assert.equal(g.heroRuntimeStates.Elara.hp,6);assert.deepEqual(g.heroRuntimeStates.Elara.conditions,[condition==='Bleeding'?'Burning':'Bleeding']);assert.equal(g.heroRuntimeStates.Thorne.actions,2);assert.equal(g.heroRuntimeStates.Thorne.discard[0].uid,'blessing');
});
for(const args of [{targetHero:'Unknown',condition:'Burning'},{targetHero:'Elara',condition:'Poisoned'},{targetHero:'Elara'}])test("Nature's Blessing rejects an invalid target/Condition before spending: "+JSON.stringify(args),()=>{
 const g=fixture(),before=structuredClone(g);assert.ok(H.playCard(g,'Thorne',{cardId:'H007-012',cardUid:'blessing',...args}).error);assert.deepEqual(g,before);
});
test("Nature's Blessing still heals when there is no Bleeding or Burning to remove",()=>{
 const g=fixture();g.heroRuntimeStates.Elara.conditions=[];assert.equal(H.playCard(g,'Thorne',{cardId:'H007-012',cardUid:'blessing',targetHero:'Elara'}).error,undefined);assert.equal(g.heroRuntimeStates.Elara.hp,6);
});
test("Nature's Blessing validates named-object Conditions and preserves the unchosen one",()=>{
 const g=fixture();g.heroRuntimeStates.Elara.conditions=[{name:'Bleeding',source:'first'},{name:'Burning',source:'second'}];H.playCard(g,'Thorne',{cardId:'H007-012',cardUid:'blessing',targetHero:'Elara',condition:'Burning'});assert.deepEqual(g.heroRuntimeStates.Elara.conditions,[{name:'Bleeding',source:'first'}]);
});

test("Nature's Blessing cannot bypass the first-Action Stand requirement",()=>{
 const g=fixture();g.heroRuntimeStates.Thorne.conditions=['Knocked Down'];const before=JSON.stringify(g);assert.match(H.playCard(g,'Thorne',{cardId:'H007-012',cardUid:'blessing',targetHero:'Elara',condition:'Burning'}).error,/Stand/);assert.equal(JSON.stringify(g),before);
});
