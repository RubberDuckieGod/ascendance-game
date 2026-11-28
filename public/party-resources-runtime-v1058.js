/* Compatibility entry point for older cached Ascendance pages.
 * Load the canonical System 031 controls, never a competing read-only HUD.
 */
(()=>{
 'use strict';
 if(window.ascPartyLoreLive1058||window.ascPartyLoreBoot1058)return;
 const base=document.currentScript?.src||location.href;
 const load=(file,ready)=>ready()?Promise.resolve():new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=new URL(file+'?v=1058-lore-live-1',base).href;
  script.onload=()=>ready()?resolve():reject(Error('Missing '+file));script.onerror=()=>reject(Error('Unable to load '+file));
  document.head.appendChild(script);
 });
 window.ascPartyLoreBoot1058=Promise.resolve()
  .then(()=>load('party-resources-v1058.js',()=>!!window.ascPartyResources1058))
  .then(()=>load('party-resource-sources-v1058.js',()=>!!window.ascPartyResourceSources1058))
  .then(()=>load('party-resource-extras-v1058.js',()=>!!window.ascPartyResourceExtras1058))
  .then(()=>load('party-resource-controls-v1058.js',()=>!!window.ascPartyLoreLive1058))
  .catch(error=>{delete window.ascPartyLoreBoot1058;console.error('Ascendance Lore controls:',error);});
})();
