const {test,expect}=require('@playwright/test');
for(const permanent of [false,true])test('ordinary Move Wild Growth lifetime in the loaded game; permanent='+permanent,async({page})=>{
 page.on('dialog',d=>d.message().includes('Wild Growth')?d.accept():d.dismiss());
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascHeroRuntime3362&&window.ascStatusRules33627);
 const result=await page.evaluate(permanent=>{
  init('Q003',['Elara','Thorne']);lobbyClose();g.activeHero='Elara';g.round=1;
  const b=runtimeHeroState('Elara'),thorne=runtimeHeroState('Thorne');
  Object.assign(b,{x:0,y:0,hp:5,maxHp:10,actions:3,conditions:permanent?['Regenerating']:[],statusActivation33627:{start:'current'}});
  Object.assign(thorne,{x:1,y:0,hp:9,conditions:[]});g.levels.Thorne=1;g.xp.Thorne=0;g.equipped.Elara={Accessory:[]};
  const origin=g.tiles['0,0'];origin.enemies=[];origin.edges={N:true,E:true,S:true,W:true};origin.enc=false;origin.visited=true;origin.firstVisitUsed=true;origin.firstVisitTriggered=true;origin.reveal=origin.ongoing=origin.special='None.';origin.traits=[];
  g.tiles['1,0']={...structuredClone(origin),id:'L006',name:'Movement expiry test'};
  render();runtimeHeroMove(1,0);
  const S=window.ascStatusRules33627,applied={x:b.x,actions:b.actions,has:S.has(b,'Regenerating'),metadata:!!b.wildGrowthRegenerating33627};
  S.heroEnd(g,'Elara',{token:'current'});const same=S.has(b,'Regenerating');
  S.heroStart(g,'Elara',{token:'next'});const hp=b.hp;S.heroEnd(g,'Elara',{token:'next'});
  return {applied,same,hp,expired:!S.has(b,'Regenerating')};
 },permanent);
 expect(result.applied).toEqual({x:1,actions:2,has:true,metadata:!permanent});expect(result.same).toBe(true);expect(result.hp).toBe(6);expect(result.expired).toBe(!permanent);expect(errors).toEqual([]);
});
