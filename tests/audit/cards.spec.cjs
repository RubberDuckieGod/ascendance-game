const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const catalog=JSON.parse(fs.readFileSync('audit/catalog.json'))['Hero Deck Cards'];
// Only complete, unambiguous single-target attack clauses are eligible here.
// Other cards remain explicitly UNVERIFIED in the coverage ledger.
const candidates=catalog.filter(c=>!['H001','H002','H006'].includes(c['Card ID'].slice(0,4))&&c.Speed==='Action'&&c.Category==='Attack'&&/^Make an Attack(?: with \+\d+ Attack)?(?: against one Enemy (?:in your Location|within \d+ connections))?\.(?: This Attack gains \+\d+ Attack\.)?$/i.test(c['Rules Text']));
for(const row of candidates)test(`${row['Card ID']}: ${row.Name} exact damage and cost`,async({page},info)=>{
 page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');
 const r=await page.evaluate(row=>{
 const roster=['Aldric','Lyra','Elara','Vaelis','Rowan','Seraphine','Thorne','Cassian','Kael','Mira','Malachar','Garruk','Veyra','Mordren','Lucien','Asha'],h=roster[Number(row['Card ID'].slice(1,4))-1];
 init('Q001',[h]);g.equipped[h]={Weapon:null,Armor:null,Accessory:[]};const s=searchHeroState(h);s.actions=6;s.hand=[];const card={...HERO_RUNTIME_CARDS[h].find(c=>c.id===row['Card ID']),uid:'audit-card'};s.hand.push(card);
 const t=g.tiles['0,0'],en={id:'E001',name:'Audit target',hp:100,maxHp:100,armor:0,conditions:[],traits:[]};t.enemies=[en];
 const base=extraAttack(h);playExtraCard(card);return {base,damage:100-en.hp,actions:s.actions,discarded:s.discard.some(c=>c.uid==='audit-card'),hand:s.hand.map(c=>c.id),log:g.adventureLog.slice(-8)};
 },row);
 const bonus=Number((row['Rules Text'].match(/\+(\d+) Attack/)||[])[1]||0);
 await info.attach('expected-and-actual',{body:JSON.stringify({expected:{damage:r.base+bonus,cost:row.Cost},actual:r}),contentType:'application/json'});
 expect(r.damage).toBe(r.base+bonus);const cost=row['Card ID'].startsWith('H004')&&/Spell/.test(row.Traits)?Math.max(1,row.Cost-1):Number(row.Cost);expect(r.actions).toBe(6-cost);expect(r.discarded).toBe(true);
});
