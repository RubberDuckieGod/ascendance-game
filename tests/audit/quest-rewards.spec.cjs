const {test,expect}=require('@playwright/test');
for(const [qid,xp,gold,rarity,count,rep]of [['Q010',225,200,'Epic',1,0],['Q012',300,0,'Legendary',2,3]])test(`Quest rewards: solo ${qid} pays printed XP, Gold, Equipment and Reputation once`,async({page},info)=>{
 page.on('dialog',d=>d.dismiss());await page.goto('/');await page.waitForFunction(()=>window.ascDowntime33622);
 const actual=await page.evaluate(({qid,rarity})=>{
  init(qid,['Aldric','Lyra']);lobbyClose();g.campaign.day=1;g.campaign.activeEvent='WE004';g.campaign.currentQuest=qid;g.campaign.questStatus[qid]='Available';g.campaign.campaignEnded=false;
  const snapshot=()=>({gold:g.gold,reputation:g.reputation,xp:{...g.xp},inventory:JSON.parse(JSON.stringify(g.inventory)),deck:g.equipmentDecks[rarity].slice(),status:questStatus(qid)});
  const before=snapshot();resolveQuestAttempt('Completed');const first=snapshot();resolveQuestAttempt('Completed');return {before,first,replay:snapshot()};
 },{qid,rarity});
 await info.attach('reward-measurement',{body:JSON.stringify({expected:{xpEach:xp,gold,equipmentCount:count,rarity,reputation:rep},actual}),contentType:'application/json'});
 expect(actual.first.gold-actual.before.gold).toBe(gold);expect(actual.first.reputation-actual.before.reputation).toBe(rep);
 for(const h of ['Aldric','Lyra'])expect(actual.first.xp[h]-actual.before.xp[h]).toBe(xp);
 expect(actual.before.deck.length-actual.first.deck.length).toBe(count);expect(actual.first.status).toBe('Completed');expect(actual.replay).toEqual(actual.first);
 const added=['Aldric','Lyra'].map(h=>(actual.first.inventory[h]||[]).reduce((n,x)=>n+x.qty,0)-(actual.before.inventory[h]||[]).reduce((n,x)=>n+x.qty,0));
 expect(added.reduce((a,b)=>a+b,0)).toBe(count);if(count===2)expect(added).toEqual([1,1]);

});
