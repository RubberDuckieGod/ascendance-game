const {test,expect}=require('@playwright/test');

for(const viewport of [{width:1386,height:800},{width:1100,height:720},{width:390,height:844}]){
 test(`Location rules stay readable without nested scrolling at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);page.on('dialog',dialog=>dialog.dismiss());
  await page.goto('/');await page.waitForFunction(()=>window.ascMechanics33621);
  const text=await page.evaluate(()=>{
   init('Q001',['Rowan']);lobbySetMultiplayerControls('local','','Rowan');lobbyClose();
   const location=LOCS.find(card=>card.name==='Merchant Caravan');
   if(!location)throw Error('Authored Merchant Caravan location is missing');
   Object.assign(g.tiles['0,0'],structuredClone(location),{enemies:[],searchCount:0});
   render();return {special:location.special||'None.',reveal:location.reveal||'None.',ongoing:location.ongoing||'None.'};
  });
  if(viewport.width<=760){
   await page.locator('#ascMobileDock3361 [data-pane="hero"]').click();
   await expect(page.locator('.side')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  }
  const panel=page.locator('#locPanel');
  await expect(panel.getByRole('heading',{name:'Merchant Caravan',exact:true})).toBeVisible();
  const boxes=panel.locator('.locationRuleText33614');
  await expect(boxes).toHaveText([text.special,text.reveal,text.ongoing]);
  const layout=await panel.evaluate(node=>{
   const css=getComputedStyle(node),hero=getComputedStyle(node.parentElement.firstElementChild);
   return {clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,overflowY:css.overflowY,fontSize:parseFloat(css.fontSize),heroPosition:hero.position};
  });
  expect(layout.scrollHeight).toBeLessThanOrEqual(layout.clientHeight+1);
  expect(layout.overflowY).toBe('visible');expect(layout.fontSize).toBeGreaterThanOrEqual(12);
  expect(layout.heroPosition).toBe('static');
  // Scroll each actual rules section into the rail/document viewport. The
  // Hero summary previously stuck over these sections, leaving a narrow slit.
  for(const section of await boxes.all()){
   await section.scrollIntoViewIfNeeded();
   const visible=await section.evaluate(node=>{
    const rect=node.getBoundingClientRect(),rail=node.closest('.side'),railRect=rail.getBoundingClientRect();
    const railScrolls=['auto','scroll'].includes(getComputedStyle(rail).overflowY);
    const top=Math.max(0,railScrolls?railRect.top:0),bottom=Math.min(innerHeight,railScrolls?railRect.bottom:innerHeight);
    const x=Math.min(innerWidth-1,Math.max(0,rect.left+rect.width/2)),y=(Math.max(top,rect.top)+Math.min(bottom,rect.bottom))/2;
    return {height:Math.min(bottom,rect.bottom)-Math.max(top,rect.top),unobscured:node.contains(document.elementFromPoint(x,y))};
   });
   expect(visible.height).toBeGreaterThan(20);expect(visible.unobscured).toBe(true);
  }
 });
}
