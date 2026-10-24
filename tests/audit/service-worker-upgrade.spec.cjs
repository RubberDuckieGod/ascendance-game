const {test,expect,chromium}=require('@playwright/test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const express=require('express');

const ROOT=path.resolve(__dirname,'../..'),CACHE='ascendance-3.36.24-mechanics-1',OLD_CACHE='ascendance-3.36.21-mechanics-1';
// The deployed worker's original navigation/network and asset/cache-first policy.
// Keep this fixture independent of the implementation being tested.
const LEGACY_WORKER=`const CACHE=${JSON.stringify(OLD_CACHE)};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).then(async response=>{const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());return response}).catch(()=>caches.match('./index.html')));return}
 event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(async response=>{if(response.ok&&['script','style','image','font','manifest'].includes(event.request.destination)){const cache=await caches.open(CACHE);await cache.put(event.request,response.clone())}return response})));
});`;

async function server(){
 const app=express(),state={legacy:true,assetVersion:'A',requests:[]};
 app.use((req,res,next)=>{res.set('Cache-Control','no-store');state.requests.push(req.originalUrl);next()});
 for(const name of ['sw-3361.js','sw-3365.js'])app.get('/'+name,(_req,res)=>res.type('application/javascript').send(state.legacy?LEGACY_WORKER:fs.readFileSync(path.join(ROOT,'public',name),'utf8')));
 app.get('/pwa-upgrade-fixture.js',(_req,res)=>res.type('application/javascript').send(`globalThis.pwaFixtureRuns33624??=[];globalThis.pwaFixtureRuns33624.push(${JSON.stringify(state.assetVersion)});`));
 app.get('/pwa-upgrade-fixture.css',(_req,res)=>res.type('text/css').send(`.pwa-upgrade-probe{color:${state.assetVersion==='A'?'rgb(10, 20, 30)':'rgb(40, 50, 60)'}}`));
 app.get('/',(req,res,next)=>{
  if(req.query.pwaFixture!=='1')return next();
  const html=fs.readFileSync(path.join(ROOT,'public/index.html'),'utf8').replace('</head>','<link rel="stylesheet" href="./pwa-upgrade-fixture.css"><script src="./pwa-upgrade-fixture.js"></script></head>').replace(/<body\b[^>]*>/,'$&<div class="pwa-upgrade-probe">Cache upgrade fixture</div>');
  res.type('html').send(html);
 });
 app.use('/assets',express.static(path.join(ROOT,'assets')));app.use('/audio',express.static(path.join(ROOT,'audio')));app.use(express.static(path.join(ROOT,'public')));
 const http=await new Promise(resolve=>{const instance=app.listen(0,'127.0.0.1',()=>resolve(instance))});
 return {state,url:`http://127.0.0.1:${http.address().port}/`,close:()=>new Promise(resolve=>http.close(resolve))};
}
test('PWA upgrade: an existing persistent profile bypasses old mechanics, updates mutable assets, and retains an offline game shell without reloading a live game',async({},info)=>{
 test.setTimeout(90000);const host=await server(),profile=fs.mkdtempSync(path.join(os.tmpdir(),'asc-pwa-upgrade-')),measurements={};let context;
 const launch={headless:true,...info.project.use.launchOptions};
 const mark=phase=>{measurements.phase=phase;if(process.env.ASC_PWA_DEBUG)console.log('PWA upgrade:',phase)};
 try{
  mark('initial legacy worker');context=await chromium.launchPersistentContext(profile,launch);context.setDefaultTimeout(15000);context.setDefaultNavigationTimeout(15000);let page=context.pages()[0]||await context.newPage();page.on('dialog',dialog=>dialog.dismiss());
  await page.goto(host.url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascBlightPatch33624?.ready&&navigator.serviceWorker.controller);
  const oldRules='globalThis.ascStaleRules33624=true;\n'+fs.readFileSync(path.join(ROOT,'mechanics-rules-33621.js'),'utf8').replace(',validateCooldownSnapshot,',',');
  const oldRuntime='globalThis.ascStaleRuntime33624=true;\n'+fs.readFileSync(path.join(ROOT,'mechanics-runtime-33621.js'),'utf8').replace('globalThis.ascBlightPatch33624?.render?.();','');
  await page.evaluate(async({oldRules,oldRuntime,cacheName})=>{
   const cache=await caches.open(cacheName);
   for(const [url,source]of [['./mechanics-rules-33621.js',oldRules],['./mechanics-runtime-33621.js',oldRuntime]])await cache.put(url,new Response(source,{headers:{'Content-Type':'application/javascript'}}));
  },{oldRules,oldRuntime,cacheName:OLD_CACHE});
  // Demonstrate that the old active worker really serves the stale, bare URL.
  expect(await page.evaluate(async()=> (await(await fetch('./mechanics-runtime-33621.js')).text()).includes('ascStaleRuntime33624=true'))).toBe(true);
  mark('first reload under old worker');await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascBlightPatch33624?.ready);
  measurements.firstReload=await page.evaluate(()=>{
   init('Q001',['Rowan']);lobbySetMultiplayerControls('local','PWA-UPGRADE-ISOLATED','Rowan');lobbyClose();
   const tracking=g.campaign.levelRuntime3360||(g.campaign.levelRuntime3360={quest:g.campaign.currentQuest,hero:{}});tracking.hero.Rowan??={round:{}};tracking.hero.Rowan.round.actionTypes=['Move'];
   const validation=ascMechanicsRules33621.validateCooldownSnapshot(g,ascMechanicsRules33621.cooldownSnapshot(g));
   g.tiles['0,0'].blightPatches33624=1;render();ascMechanics33621.render();
   return {staleRules:!!globalThis.ascStaleRules33624,staleRuntime:!!globalThis.ascStaleRuntime33624,validation,cleanseVisible:!!document.querySelector('#cleanseBlight33624'),scriptUrls:[...document.scripts].map(script=>script.src).filter(url=>/mechanics-(?:rules|runtime)-33621/.test(url))};
  });
  expect(measurements.firstReload).toMatchObject({staleRules:false,staleRuntime:false,validation:null,cleanseVisible:true});
  expect(measurements.firstReload.scriptUrls).toHaveLength(2);expect(measurements.firstReload.scriptUrls.every(url=>new URL(url).searchParams.get('v')==='33624')).toBe(true);
  // Activate the new worker while an intentionally unsaved game is running.
  await page.evaluate(()=>{g.gold=777;globalThis.pwaUnsavedGuard33624='retain-this-window';localStorage.setItem('asc-pwa-upgrade-proof','persistent-profile');render()});
  mark('activate current worker');host.state.legacy=false;await page.evaluate(async()=>{globalThis.pwaPreviousController33624=navigator.serviceWorker.controller;const registration=await navigator.serviceWorker.getRegistration();await registration.update()});
  await page.waitForFunction(async({current,old})=>{const names=await caches.keys();return navigator.serviceWorker.controller!==globalThis.pwaPreviousController33624&&navigator.serviceWorker.controller?.state==='activated'&&names.includes(current)&&!names.includes(old)},{current:CACHE,old:OLD_CACHE});
  measurements.unsaved=await page.evaluate(()=>({gold:g.gold,guard:globalThis.pwaUnsavedGuard33624,hero:controlledHero()}));
  expect(measurements.unsaved).toEqual({gold:777,guard:'retain-this-window',hero:'Rowan'});
  mark('online mutable assets');
  // Reload a separate tab so the browser requests mutable URLs for a fresh
  // document, while the original unsaved game remains running untouched.
  const assetPage=await context.newPage();assetPage.on('dialog',dialog=>dialog.dismiss());
  await assetPage.goto(host.url+'?pwaFixture=1',{waitUntil:'domcontentloaded'});await assetPage.waitForFunction(()=>window.ascBlightPatch33624?.ready&&window.pwaFixtureRuns33624);
  expect(await assetPage.evaluate(()=>pwaFixtureRuns33624)).toEqual(['A']);expect(await assetPage.locator('.pwa-upgrade-probe').evaluate(element=>getComputedStyle(element).color)).toBe('rgb(10, 20, 30)');
  host.state.assetVersion='B';await assetPage.reload({waitUntil:'domcontentloaded'});await assetPage.waitForFunction(()=>window.ascBlightPatch33624?.ready&&window.pwaFixtureRuns33624);
  expect(await assetPage.evaluate(()=>pwaFixtureRuns33624)).toEqual(['B']);expect(await assetPage.locator('.pwa-upgrade-probe').evaluate(element=>getComputedStyle(element).color)).toBe('rgb(40, 50, 60)');
  // Cache writes run independently of document parsing; wait for the real
  // updated responses to be durable before intentionally disconnecting.
  await expect.poll(()=>assetPage.evaluate(async cacheName=>{
   const cache=await caches.open(cacheName),html=await cache.match(location.href),script=await cache.match('./pwa-upgrade-fixture.js'),css=await cache.match('./pwa-upgrade-fixture.css');
   return {html:!!html&&(await html.text()).includes('pwa-upgrade-fixture.js'),script:!!script&&(await script.text()).includes('push("B")'),css:!!css&&(await css.text()).includes('rgb(40, 50, 60)')};
  },CACHE)).toEqual({html:true,script:true,css:true});
  mark('offline mutable assets');await context.setOffline(true);await assetPage.reload({waitUntil:'domcontentloaded'});await assetPage.waitForFunction(()=>window.ascBlightPatch33624?.ready&&window.pwaFixtureRuns33624);
  measurements.offlineAssets=await assetPage.evaluate(()=>({runs:pwaFixtureRuns33624,color:getComputedStyle(document.querySelector('.pwa-upgrade-probe')).color,hasDowntime:!!window.ascDowntime33622}));
  expect(measurements.offlineAssets).toEqual({runs:['B'],color:'rgb(40, 50, 60)',hasDowntime:true});
  expect(await page.evaluate(()=>({gold:g.gold,guard:globalThis.pwaUnsavedGuard33624}))).toEqual({gold:777,guard:'retain-this-window'});
  // Close/reopen the same on-disk profile, then load entirely offline. This is
  // an explicit user navigation; worker activation itself never reloaded it.
  mark('reopen persistent profile offline');await context.close();context=await chromium.launchPersistentContext(profile,launch);context.setDefaultTimeout(15000);context.setDefaultNavigationTimeout(15000);await context.setOffline(true);page=context.pages()[0]||await context.newPage();
  await page.goto(host.url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.ascBlightPatch33624?.ready&&window.ascMechanicsRules33621?.validateCooldownSnapshot);
  measurements.reopenedOffline=await page.evaluate(async()=>({proof:localStorage.getItem('asc-pwa-upgrade-proof'),caches:await caches.keys(),hasMechanics:!!ascMechanics33621,hasBlight:!!ascBlightEncounter33624,hasDowntime:!!window.ascDowntime33622}));
  expect(measurements.reopenedOffline).toMatchObject({proof:'persistent-profile',hasMechanics:true,hasBlight:true,hasDowntime:true});expect(measurements.reopenedOffline.caches).toContain(CACHE);expect(measurements.reopenedOffline.caches).not.toContain(OLD_CACHE);
  mark('complete');
 }finally{
  await info.attach('service-worker-upgrade-measurement',{body:JSON.stringify(measurements),contentType:'application/json'});if(context)await context.close();await host.close();fs.rmSync(profile,{recursive:true,force:true});
 }
});
