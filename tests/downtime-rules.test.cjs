const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const rules=require('../downtime-rules-33622.js');

function game(){
 return {gold:10,phase:'End Phase',partyHeroes:['Rowan','Lyra'],inventory:{Rowan:[]},campaign:{downtime:true,currentQuest:'Q003',day:4,lastQuestOutcome:{quest:'Q003',day:4,outcome:'Failed'}}};
}
function unchangedAfterError(g,act){
 const before=structuredClone(g);assert.ok(act().error);assert.deepEqual(g,before);
}

test('Work grants exactly 25 shared Gold once per Hero and downtime token',()=>{
 const g=game();assert.equal(rules.act(g,'Rowan','Work').gold,25);assert.equal(g.gold,35);
 unchangedAfterError(g,()=>rules.act(g,'Rowan','Work'));
 assert.equal(rules.act(g,'Lyra','Work').error,undefined);assert.equal(g.gold,60);
 g.campaign.lastQuestOutcome.day=5;
 assert.equal(rules.act(g,'Rowan','Work').error,undefined);assert.equal(g.gold,85);
 assert.deepEqual(Object.keys(rules.state(g).activities),['Rowan']);
});

test('Gather grants exactly two authored materials in the existing inventory row format',()=>{
 const g=game(),result=rules.act(g,'Rowan','Gather','Blacksmithing',{random:()=>0});
 assert.deepEqual(result.materialIds,['LT031','LT031']);assert.deepEqual(result.gained,['Iron Ore','Iron Ore']);
 assert.deepEqual(g.inventory.Rowan,[{key:'loot:LT031',kind:'loot',id:'LT031',qty:2}]);
 assert.deepEqual(g.campaign.downtimeActivities3252.Rowan.gained,['Iron Ore','Iron Ore']);
 assert.equal(g.gold,10);
});

test('Gather respects the authored loot stack limit and existing per-call stack behavior',()=>{
 const g=game();g.inventory.Rowan=[{key:'loot:LT031',kind:'loot',id:'LT031',qty:9}];
 rules.act(g,'Rowan','Gather','Blacksmithing',{random:()=>0});
 assert.deepEqual(g.inventory.Rowan.map(row=>row.qty),[10,1]);
 assert.ok(g.inventory.Rowan.every(row=>row.qty<=10));
 const full=game();full.inventory.Rowan=[{key:'loot:LT031',kind:'loot',id:'LT031',qty:10}];
 rules.act(full,'Rowan','Gather','Blacksmithing',{random:()=>0});
 assert.deepEqual(full.inventory.Rowan.map(row=>row.qty),[10,1,1]);
});

test('Gather eligibility and weighting match final authored recipe order at every party Mastery tier',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
 const recipes=JSON.parse(html.match(/const CR3280=(\[.*?\]);/)[1]);
 const disciplines={Blacksmithing:['Blacksmithing','Leatherworking','Tailoring','Woodworking'],Alchemy:['Alchemy'],Enchanting:['Enchanting','Sacred Crafting','Artifact Restoration','Legendary Crafting','Jewelry'],Artificing:['Campcraft','Tinkering','Settlement Crafting','Trophy Crafting']};
 const tiers=['I','II','III','IV','V'];
 for(const profession of rules.professions)for(const [mastery,tier]of [[0,'I'],[1,'I'],[2,'II'],[3,'II'],[4,'III'],[6,'III'],[7,'IV'],[9,'IV'],[10,'V']]){
  const g=game();g.campaign.professionMastery3280={[profession]:mastery};
  // Obsolete per-Hero tier state must not override the authored party Mastery rule.
  g.heroProfessions={Rowan:{[profession]:{tier:'V',progress:99}}};
  const expected=recipes.filter(recipe=>{
   const core=Object.entries(disciplines).find(([,values])=>values.includes(recipe.profession))?.[0]||'Artificing';
   return core===profession&&tiers.indexOf(recipe.tier)<=tiers.indexOf(tier);
  }).flatMap(recipe=>recipe.materials.map(material=>material.id));
  assert.equal(rules.tier(g,profession),tier);assert.deepEqual(rules.gatherPool(g,profession),expected);
 }
});

test('Research grants one profession credit and preserves it across downtime changes',()=>{
 const g=game(),result=rules.act(g,'Rowan','Research','Alchemy');
 assert.equal(result.researchCredits,1);assert.equal(result.discount,25);
 assert.equal(g.campaign.researchPrep3252.Rowan.Alchemy,1);assert.equal(g.gold,10);
 g.campaign.lastQuestOutcome.day=5;
 rules.act(g,'Rowan','Research','Alchemy');assert.equal(g.campaign.researchPrep3252.Rowan.Alchemy,2);
 g.campaign.lastQuestOutcome.day=6;
 rules.act(g,'Rowan','Work');assert.equal(g.campaign.researchPrep3252.Rowan.Alchemy,2);
});

test('Craft records the activity without awarding resources or profession progress',()=>{
 const g=game(),beforeInventory=structuredClone(g.inventory);
 assert.equal(rules.act(g,'Rowan','Craft').error,undefined);
 assert.equal(g.campaign.downtimeActivities3252.Rowan.type,'Craft');
 assert.equal(g.gold,10);assert.deepEqual(g.inventory,beforeInventory);
 assert.equal(g.campaign.professionMastery3280,undefined);
 unchangedAfterError(g,()=>rules.act(g,'Rowan','Work'));
});

test('Invalid type, profession, and Hero reject without initializing or consuming choices',()=>{
 for(const [hero,type,profession]of [['Other','Work',''],['Aldric','Work',''],['Rowan','Invalid',''],['Rowan','Gather','Invalid'],['Rowan','Research','Invalid'],['Rowan','Work','Alchemy'],['Rowan','Craft','Alchemy']]){
  const g=game();unchangedAfterError(g,()=>rules.act(g,hero,type,profession));
 }
});

test('Activities reject outside downtime and cannot be earned by a truthy nonboolean flag',()=>{
 for(const flag of [false,undefined,'true',1]){
  const g=game();g.campaign.downtime=flag;unchangedAfterError(g,()=>rules.act(g,'Rowan','Work'));
 }
});

test('Failed or invalid RNG leaves inventory and the once-per-downtime choice unchanged',()=>{
 for(const random of [()=>1,()=>-0.1,()=>NaN,()=>{throw new Error('entropy unavailable')},(()=>{let count=0;return()=>count++?1:0})()]){
  const g=game();unchangedAfterError(g,()=>rules.act(g,'Rowan','Gather','Alchemy',{random}));
 }
});

test('Legacy downtime saves retain the established token fallback without requiring an outcome',()=>{
 const g=game();delete g.campaign.lastQuestOutcome;
 assert.equal(rules.token(g),'Q003:4:NONE');assert.equal(rules.act(g,'Rowan','Work').error,undefined);
});

test('Downtime eligibility preserves authored party membership and does not invent combat HP restrictions',()=>{
 for(const status of ['Downed','Dead']){
  const g=game();g.campaign.heroFates={Rowan:{status}};
  assert.equal(rules.act(g,'Rowan','Work').error,undefined);assert.equal(g.gold,35);
 }
});

test('Root and browser shared modules stay byte-identical',()=>{
 assert.equal(fs.readFileSync(path.join(__dirname,'../downtime-rules-33622.js'),'utf8'),fs.readFileSync(path.join(__dirname,'../public/downtime-rules-33622.js'),'utf8'));
});

function crafter(recipeId='CR001'){
 const g=game(),row=rules.recipe(recipeId);g.gold=1000;
 rules.act(g,'Rowan','Craft');
 g.inventory.Rowan=row.materials.map(material=>({key:'loot:'+material.id,kind:'loot',id:material.id,qty:material.qty}));
 return g;
}

test('Actual Craft spends materials and Gold atomically and creates the authored Equipment',()=>{
 const g=crafter(),choice=structuredClone(g.campaign.downtimeActivities3252.Rowan),preview=rules.craftState(g,'Rowan','CR001');
 assert.equal(preview.error,undefined);assert.equal(preview.goldSpent,10);
 const result=rules.craft(g,'Rowan','CR001');
 assert.equal(result.type,'CraftRecipe');assert.equal(result.resultName,'Iron Shortsword');assert.equal(g.gold,990);
 assert.deepEqual(g.inventory.Rowan,[{key:'equipment:EQ002',kind:'equipment',id:'EQ002',qty:1}]);
 assert.equal(g.campaign.professionCraftedThisDowntime3280.Blacksmithing,true);
 assert.deepEqual(g.campaign.downtimeActivities3252.Rowan,choice);
 assert.equal(g.campaign.professionMastery3280,undefined);
 unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR001'));
});

test('Craft failure for materials, Gold, unknown recipe, no Craft choice, or changed downtime never spends',()=>{
 for(const configure of [g=>{g.inventory.Rowan=[]},g=>{g.gold=9},g=>{delete g.campaign.downtimeActivities3252.Rowan},g=>{g.campaign.downtime=false},g=>{g.campaign.lastQuestOutcome.day++}]){
  const g=crafter();configure(g);unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR001'));
 }
 const g=crafter();unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR-UNKNOWN'));
 unchangedAfterError(g,()=>rules.craft(g,'Other','CR001'));
});

test('Craft preview is pure and profession mastery is the final authored tier unlock rule',()=>{
 const g=crafter('CR010');unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR010'));
 g.campaign.professionMastery3280={Blacksmithing:2};
 assert.equal(g.campaign.craftingTiers,undefined);
 const before=structuredClone(g),preview=rules.craftState(g,'Rowan','CR010');assert.equal(preview.error,undefined);assert.deepEqual(g,before);
 assert.equal(rules.craft(g,'Rowan','CR010').error,undefined);
 assert.equal(g.inventory.Rowan.some(row=>row.id==='EQ004'),true);
});

test('Research reduces the next matching craft by up to 25 and consumes exactly one credit on success',()=>{
 const g=crafter('CR010');g.campaign.professionMastery3280={Blacksmithing:2};g.campaign.researchPrep3252.Rowan={Blacksmithing:1,Alchemy:1};
 g.gold=4;unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR010'));
 assert.equal(g.campaign.researchPrep3252.Rowan.Blacksmithing,1);
 g.gold=5;const result=rules.craft(g,'Rowan','CR010');assert.equal(result.researchDiscount,25);assert.equal(result.goldSpent,5);assert.equal(g.gold,0);
 assert.equal(g.campaign.researchPrep3252.Rowan.Blacksmithing,0);assert.equal(g.campaign.researchPrep3252.Rowan.Alchemy,1);
 g.inventory.Rowan.push(...rules.recipe('CR010').materials.map(material=>({key:'loot:'+material.id,kind:'loot',id:material.id,qty:material.qty})));
 g.gold=29;unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR010'));
 g.gold=30;assert.equal(rules.craft(g,'Rowan','CR010').goldSpent,30);assert.equal(g.gold,0);
});

test('Research can cover a low-cost craft without charging or consuming an unrelated profession credit',()=>{
 const g=crafter();g.gold=0;g.campaign.researchPrep3252.Rowan={Blacksmithing:1,Alchemy:1};
 const result=rules.craft(g,'Rowan','CR001');assert.equal(result.researchDiscount,10);assert.equal(result.goldSpent,0);
 assert.equal(g.campaign.researchPrep3252.Rowan.Blacksmithing,0);assert.equal(g.campaign.researchPrep3252.Rowan.Alchemy,1);
});

test('Crystal of Creation substitutes one missing Rare material and remains reusable under current recipe text',()=>{
 const g=crafter('CR069');g.campaign.professionMastery3280={Alchemy:2};g.inventory.Rowan=g.inventory.Rowan.filter(row=>row.id!=='LT067');
 unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR069'));
 g.inventory.Rowan.push({key:'loot:LT159',kind:'loot',id:'LT159',qty:1});
 const result=rules.craft(g,'Rowan','CR069');assert.deepEqual(result.materialSubstitution,{id:'LT067',qty:1});assert.equal(result.consumeCrystal,false);
 assert.equal(g.inventory.Rowan.find(row=>row.id==='LT159').qty,1);assert.equal(g.inventory.Rowan.some(row=>row.id===rules.recipe('CR069').resultId),true);
});

test('Crystal cannot replace two missing units or a missing Common material',()=>{
 const g=crafter('CR071');g.campaign.professionMastery3280={Alchemy:4};g.inventory.Rowan=g.inventory.Rowan.filter(row=>row.id!=='LT067');
 g.inventory.Rowan.push({key:'loot:LT159',kind:'loot',id:'LT159',qty:1});unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR071'));
 const common=crafter();common.inventory.Rowan=common.inventory.Rowan.filter(row=>row.id!=='LT031');common.inventory.Rowan.push({key:'loot:LT159',kind:'loot',id:'LT159',qty:1});unchangedAfterError(common,()=>rules.craft(common,'Rowan','CR001'));
});

test('Facilities honor standard downtime services and require tracked advanced facility additions',()=>{
 const g=crafter('CR124');g.campaign.professionMastery3280={Enchanting:7};
 assert.match(rules.craftState(g,'Rowan','CR124').error,/Requires Arcane Forge/);
 g.campaign.facilityChanges={L000:{added:['Arcane Forge']}};
 assert.equal(rules.craft(g,'Rowan','CR124').error,undefined);
 const standard=crafter();standard.tiles={'0,0':{id:'L999',name:'Remote Outpost'}};assert.equal(rules.craft(standard,'Rowan','CR001').error,undefined);
});

test('Tracked defeat and revealed-location unlocks create special and party Quest Item results',()=>{
 const special=crafter('CR181');special.campaign.professionMastery3280={Blacksmithing:4};
 unchangedAfterError(special,()=>rules.craft(special,'Rowan','CR181'));
 special.campaign.defeatedEnemyNames=['Ancient Cave Bear'];assert.equal(rules.craft(special,'Rowan','CR181',{now:'2026-10-24T00:00:00.000Z'}).error,undefined);
 assert.deepEqual(special.craftedSpecials,[{recipeId:'CR181',resultId:'Upgrade',name:rules.recipe('CR181').result,owner:'Rowan',at:'2026-10-24T00:00:00.000Z'}]);
 const quest=crafter('CR168');quest.campaign.professionMastery3280={Alchemy:4};quest.tiles={'1,0':{name:'Goblin War Camp'}};
 assert.equal(rules.craft(quest,'Rowan','CR168').error,undefined);assert.deepEqual(quest.partyQuestItems,['CRAFT:CR168:Sabotage Charges']);
});

test('Untracked authored campaign unlocks remain locked even with all materials and a matching facility',()=>{
 const g=crafter('CR131');g.campaign.professionMastery3280={Enchanting:10};g.campaign.facilityChanges={L000:{added:['Legendary Forge']}};
 assert.match(rules.craftState(g,'Rowan','CR131').error,/not tracked/);unchangedAfterError(g,()=>rules.craft(g,'Rowan','CR131'));
});

test('Regional craft discounts apply once on success and retain canonical reputation perk markers',()=>{
 const g=crafter('CR010');g.campaign.currentQuest='Q025';g.campaign.professionMastery3280={Blacksmithing:2};g.campaign.factionReputation3342={forgeCouncil:3};
 const result=rules.craft(g,'Rowan','CR010');assert.equal(result.regionalDiscount,15);assert.equal(result.goldSpent,15);
 const marks=g.campaign.repPerks3360.downtime[result.discountKey];assert.equal(marks.forgeFriendly,true);assert.equal(marks.forgeTrusted,true);
 g.inventory.Rowan.push(...rules.recipe('CR010').materials.map(material=>({key:'loot:'+material.id,kind:'loot',id:material.id,qty:material.qty})));
 assert.equal(rules.craft(g,'Rowan','CR010').goldSpent,30);
 assert.deepEqual(rules.state(g).repPerks,g.campaign.repPerks3360);
});
