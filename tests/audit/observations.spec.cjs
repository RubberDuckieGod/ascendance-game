const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
for(let heroIndex=1;heroIndex<=16;heroIndex++)test(`Hero H${String(heroIndex).padStart(3,'0')}: capture every card observation (not effect certification)`,async({page},info)=>{
 test.setTimeout(180000);page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');
 const results=await page.evaluate(heroIndex=>{
 const names=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'];
 return WORKBOOK_DATABASE['Hero Deck Cards'].filter(row=>Number(row['Card ID'].slice(1,4))===heroIndex).map(row=>{
 const h=names[Number(row['Card ID'].slice(1,4))-1];
 try{
 init('Q001',[h]);g.activeHero=h;const s=searchHeroState(h);s.actions=6;
 let deck=h==='Aldric'?[...g.heroHand,...g.heroDeck,...g.heroDiscard]:h==='Lyra'?[...g.lyraHand,...g.lyraDeck,...g.lyraDiscard]:h==='Seraphine'?[...g.seraphineHand,...g.seraphineDeck,...g.seraphineDiscard]:buildHeroRuntimeDeck(h);
 let card=deck.find(c=>c.id===row['Card ID']||c.name===row.Name);if(!card)return {id:row['Card ID'],status:'UNVERIFIED',error:'No runtime card mapping found'};
 const t=g.tiles['0,0'];t.enemies=[{id:'E001',name:'Audit target',hp:100,maxHp:100,armor:0,attack:1,conditions:[],traits:[]}];
 if(h==='Aldric'){g.actions=6;g.heroHand=[card]}else if(h==='Lyra')g.lyraHand=[card];else if(h==='Seraphine')g.seraphineHand=[card];else s.hand=[card];
 const before={hp:heroCurrentHp(h),enemyHP:t.enemies[0].hp,actions:heroActionCount(h)};
 if(row.Speed==='Reaction')return {id:row['Card ID'],status:'UNVERIFIED',expected:row['Rules Text'],reason:'Requires its authored trigger and reaction timing fixture; not dispatched as an Action.'};
 if(h==='Aldric')playHandCard(card);else if(h==='Lyra')playLyraCard(card);else if(h==='Seraphine')playSeraphineCard(card);else playExtraCard(card);
 return {id:row['Card ID'],status:'OBSERVED_UNVERIFIED',expected:row['Rules Text'],before,actual:{hp:heroCurrentHp(h),enemyHP:t.enemies[0]?.hp??0,actions:heroActionCount(h),conditions:s.conditions,log:g.adventureLog.slice(-5)},reason:'Single generic board; neither an independent effect oracle nor full timing/target coverage.'};
 }catch(e){return {id:row['Card ID'],status:'ERROR',expected:row['Rules Text'],error:String(e.stack||e)}}
 });
 },heroIndex);const previous=fs.existsSync('audit/card-observations.json')?JSON.parse(fs.readFileSync('audit/card-observations.json')):[];const current=[...previous.filter(r=>Number(r.id.slice(1,4))!==heroIndex),...results];fs.writeFileSync('audit/card-observations.json',JSON.stringify(current,null,2));await info.attach('all-card-observations',{body:JSON.stringify(results,null,2),contentType:'application/json'});
 expect(results.length).toBeGreaterThanOrEqual(20);expect(new Set(results.map(r=>r.id)).size).toBe(results.length);
 // Errors are data in this inventory test; effect tests separately fail on defects.
});
test('runtime equipment and loot catalog includes expanded roster additions',async({page},info)=>{
 await page.goto('/');const r=await page.evaluate(()=>({equipment:EQUIPMENT_CARDS,loot:LOOT_CARDS}));fs.writeFileSync('audit/runtime-items.json',JSON.stringify(r,null,2));await info.attach('runtime-items',{body:JSON.stringify(r,null,2),contentType:'application/json'});expect(r.equipment.length).toBeGreaterThanOrEqual(144);
});
