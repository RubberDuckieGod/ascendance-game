// Mechanics updates stay fresh online and retain a playable offline cache.
const CACHE='ascendance-3.36.24-mechanics-1';
const CORE=["./","./index.html","./mobile-3361.css","./hero-abilities-3360.js","./hero-ability-runtime-3361.js","./level-progression-3360.js","./level-parity-3360.js","./parity-3360.js","./reputation-3360.js","./campaign56-3350.js","./campaign34-3340.js","./campaign2-3330.js","./quest-narratives-3350.js","./world-map-3342.js","./world-map-3343.js","./world-map-3344.js","./manifest.webmanifest","./assets/ascendance-icon-192.png","./assets/ascendance-icon-512.png","./mechanics-rules-33621.js?v=33624","./mechanics-runtime-33621.js?v=33624","./encounter-deck-rules-33624.js","./encounter-deck-runtime-33624.js","./blight-encounter-rules-33624.js","./blight-encounter-runtime-33624.js","./blight-patch-runtime-33624.js","./core-locations-3363.js","./reputation-3350.js","./hero-runtime-parity-3362.js","./mobile-3367.js","./mobile-3368.js","./mobile-3369.js","./mobile-33610.js","./hero-card-parity-33611.js","./equipment-loot-parity-33612.js","./equipment-autohit-33613.js","./content-sync-33614.js","./reveal-runtime-33615.js","./audio-33617.js","./turn-owner-33619.js","./stability-33621.js","./downtime-rules-33622.js","./downtime-runtime-33622.js","./quest-rewards-runtime-33622.js","./snare-rules-33622.js","./snare-runtime-33622.js","./mobile-3365.css","./mobile-3367.css","./mobile-3368.css","./mobile-3369.css","./mobile-33610.css","./mobile-3361.js?v=33624","./mobile-3365.js?v=33624"];

async function store(cache,request,response){
 if(response.ok)try{await cache.put(request,response.clone())}catch(_){}
 return response;
}
async function networkFirst(event,navigation=false){
 const request=event.request;
 const cache=await caches.open(CACHE);
 try{
  const response=await fetch(request,{cache:'no-store'});
  if(response.ok){
   const writes=[store(cache,request,response)];
   if(navigation)writes.push(store(cache,'./index.html',response));
   // Return the response immediately; keep cache writes alive independently so
   // saving a large game document cannot delay its first byte or script parsing.
   event.waitUntil(Promise.all(writes));
  }else if(response.status>=500){
   const fallback=await cache.match(request)||(navigation?await cache.match('./index.html'):null);
   if(fallback)return fallback;
  }
  return response;
 }catch(error){
  const fallback=await cache.match(request)||(navigation?await cache.match('./index.html'):null);
  if(fallback)return fallback;
  throw error;
 }
}
async function cachedMedia(request){
 const cache=await caches.open(CACHE),hit=await cache.match(request);
 return hit||store(cache,request,await fetch(request));
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // A missing optional audio/image must not cancel the playable offline shell.
 await Promise.all(CORE.map(async url=>{try{await store(cache,url,await fetch(url,{cache:'no-store'}))}catch(_){}}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>name!==CACHE&&name.startsWith('ascendance-')).map(name=>caches.delete(name)));
 // Claim clients without reloading their in-progress, potentially unsaved game.
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 const destination=event.request.destination;
 if(event.request.mode==='navigate'){event.respondWith(networkFirst(event,true));return}
 // These URLs are mutable across mechanics releases, including unversioned
 // URLs retained by older tabs. Prefer the network and retain offline fallback.
 if(['script','style','manifest'].includes(destination)||/\.(?:js|css|webmanifest)$/i.test(url.pathname)){
  event.respondWith(networkFirst(event));return;
 }
 if(['image','font','audio'].includes(destination))event.respondWith(cachedMedia(event.request));
});
