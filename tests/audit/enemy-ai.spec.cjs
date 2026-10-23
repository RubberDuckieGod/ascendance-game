const {test,expect}=require('@playwright/test');
for(const rooted of [false,true])test(`Enemy AI: ${rooted?'Rooted blocks pursuit':'pursues adjacent Hero and attacks with deterministic d6'}`,async({page},info)=>{
 page.on('dialog',d=>d.dismiss());await page.goto('/');const r=await page.evaluate(async rooted=>{
 init('Q003',['Aldric']);g.heroHand=[];g.equipped.Aldric={Weapon:null,Armor:null,Shield:null,Accessory:[]};const t=g.tiles['0,0'];t.enemies=[];t.edges={N:true,E:true,S:true,W:true};t.traits=[];t.special='None';t.ongoing='None';g.tiles['1,0']={...structuredClone(t),id:'AUDIT',name:'Audit road',enemies:[],edges:{N:true,E:true,S:true,W:true}};
 const en=encounterEnemy320('E001');en.hp=30;en.max=30;en.attack=2;en.move=1;en.range=0;en.conditions=rooted?['Rooted']:[];g.tiles['1,0'].enemies=[en];const beforeHP=g.hp,armor=aldricArmor(),oldRandom=Math.random;
 const decline=setInterval(()=>{const el=document.querySelector('#declineReaction');if(el&&!document.querySelector('#reactionOverlay').classList.contains('hidden'))el.click()},10);
 try{Math.random=()=>0;await endTurn()}finally{Math.random=oldRandom;clearInterval(decline)}const pos=findE(en);return {beforeHP,hp:g.hp,armor,pos:pos?{x:pos.x,y:pos.y}:null,log:g.adventureLog.slice(0,12)};
 },rooted);await info.attach('ai-measurement',{body:JSON.stringify(r),contentType:'application/json'});
 expect(r.pos).toEqual({x:rooted?1:0,y:0});expect(r.beforeHP-r.hp).toBe(rooted?0:Math.max(1,3-r.armor));
});
