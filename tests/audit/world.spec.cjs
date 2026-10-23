const {test,expect}=require('@playwright/test');
async function open(page){page.on('dialog',d=>d.type()==='prompt'?d.accept('1'):d.dismiss());await page.goto('/');}
test('campaign Q001: solo completion awards scaled rewards once and consumes one day',async({page},info)=>{
 await open(page);const r=await page.evaluate(()=>{init('Q001',['Aldric']);const before={xp:g.xp.Aldric||0,gold:g.gold,day:g.campaign.day,rep:g.reputation};g.campaign.q001.rescued=0;resolveQuestAttempt('Completed');const after={xp:g.xp.Aldric,gold:g.gold,day:g.campaign.day,rep:g.reputation,status:g.campaign.questStatus.Q001,downtime:g.campaign.downtime};resolveQuestAttempt('Completed');return {before,after,again:{xp:g.xp.Aldric,gold:g.gold,day:g.campaign.day}}});
 await info.attach('reward-measurement',{body:JSON.stringify(r),contentType:'application/json'});
 expect(r.after.xp-r.before.xp).toBe(100);expect(r.after.gold-r.before.gold).toBe(55);expect(r.after.rep-r.before.rep).toBe(1);expect(r.after.day).toBe(r.before.day+1);expect(r.after.status).toBe('Completed');expect(r.after.downtime).toBe(false);expect(r.again).toEqual({xp:r.after.xp,gold:r.after.gold,day:r.after.day});
});
test('voluntary movement: connected destination costs one action; engagement blocks departure',async({page})=>{
 await open(page);const r=await page.evaluate(()=>{
 init('Q003',['Aldric']);const from=g.tiles['0,0'];from.traits=[];from.ongoing='None';from.special='None';from.enemies=[];from.edges={N:true,E:true,S:true,W:true};g.tiles['1,0']={...structuredClone(from),id:'AUDIT',name:'Audit destination',enemies:[],edges:{N:true,E:true,S:true,W:true}};g.actions=3;move(1,0);const moved={...g.hero,actions:g.actions};g.tiles['1,0'].enemies=[{id:'E001',name:'Audit',hp:10,conditions:[]}];move(0,0);return {moved,blocked:{...g.hero,actions:g.actions}}});
 expect(r.moved).toMatchObject({x:1,y:0,actions:2});expect(r.blocked).toEqual(r.moved);
});
test('enemy activation: Burning ticks; Stunned prevents attack; round advances',async({page})=>{
 await open(page);const r=await page.evaluate(async()=>{init('Q003',['Aldric']);g.heroHand=[];g.tiles['0,0'].enemies=[];const en=encounterEnemy320('E001');en.hp=10;en.max=10;en.conditions=['Burning','Stunned'];g.tiles['0,0'].enemies=[en];const hp=g.hp,round=g.round;await endTurn();return {enemyHP:en.hp,conditions:en.conditions,hp:g.hp,beforeHP:hp,round:g.round,beforeRound:round,phase:g.phase}});
 expect(r.enemyHP).toBe(9);expect(r.conditions).not.toContain('Burning');expect(r.conditions).not.toContain('Stunned');expect(r.hp).toBe(r.beforeHP);expect(r.round).toBe(r.beforeRound+1);expect(r.phase).toBe('Hero Phase');
});
for(const [count,scaled]of [[1,55],[2,75],[3,95],[4,115]])for(const rescued of [0,4])test(`Q001 ${count} Heroes / ${rescued} rescued: scaled Gold and fixed bonus are paid exactly once`,async({page})=>{
 await open(page);const r=await page.evaluate(({count,rescued})=>{init('Q001',['Aldric','Lyra','Elara','Vaelis'].slice(0,count));g.campaign.q001.rescued=rescued;const initial=g.gold;resolveQuestAttempt('Completed');const paid=g.gold-initial;resolveQuestAttempt('Completed');return {paid,again:g.gold-initial}},{count,rescued});expect(r.paid).toBe(scaled+(rescued===4?15:0));expect(r.again).toBe(r.paid);
});
test('rejected completion applies no scaling adjustment',async({page})=>{await open(page);const r=await page.evaluate(()=>{init('Q001',['Aldric']);g.gold=100;g.campaign.campaignEnded=true;resolveQuestAttempt('Completed');return g.gold});expect(r).toBe(100)});
