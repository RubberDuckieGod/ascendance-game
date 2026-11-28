// Ascendance v10.59: named First Visit feature registry + bounded shared reducer.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascFirstVisit1061=api})(globalThis,()=>{
'use strict';
const dep=(path,key)=>typeof module==='object'&&module.exports?require(path):globalThis[key];
const catalog=dep('./first-visit-catalog-v1061.js','ascFirstVisitCatalog1061');
const status=()=>dep('./status-rules-33627.js','ascStatusRules33627');
const healRules=()=>dep('./healing-summons-rules-33627.js','ascHealingSummonsRules33627');
const resource=()=>dep('./party-resources-v1058.js','ascPartyResources1058');
const rawPlans={"102":"s:rWeakened/Vulnerable|s:gRegrouped@l","103":"s:gBraced@r|s:gShielded@l","104":"h:h2|h:x1,d2","105":"h:gEntrenched@l","106":"s:gFocused@l|s:gProtected@l","107":"s:gWard@l|s:x1,RMana Burn/Hexed","109":"s:gCountering@l","110":"s:rScorched/Burning|s:x1,h1","111":"s:gElevated@l|s:gShielded@l","112":"h:x1,rCracked Armor|h:d1,x1","114":"h:h2|h:rBurning","116":"h:gShielded@l","118":"s:rDazed|s:gFocused@l","119":"s:x1,gInspired@l|s:x1,gGuarded@l","120":"s:rBleeding/Crippled","121":"s:a1,d1|s:gFocused@l","122":"s:gShielded@l|s:gProtected@l","124":"s:x1,d1,gFocused@l","132":"s:gFocused@l|s:gProtected@l","133":"h:h1|h:rBleeding","134":"h:u1,d2,x1","138":"h:rPoisoned/Weakened","139":"s:b1,d2,x1","140":"h:a1,G10|h:x1,G5","141":"s:rBleeding|s:gProtected@l","144":"h:u1,V1","147":"s:rShaken/Frightened","148":"s:x2,h3","152":"h:x1,rVulnerable/Cracked Armor","153":"s:h2|s:b1,d1","154":"s:rSilenced/Weakened","155":"s:gFocused@l|s:gShielded@l","156":"s:gFortified@l","159":"s:rDazed/Staggered","168":"s:rChilled|s:gEvasive@l","169":"s:gBraced@rl|s:gFocused@l","170":"h:a1,G5|h:u1,G10","171":"h:h2|h:rChilled","174":"s:x1,rChilled|s:h1,gWet@r","175":"s:x1,gSteadfast@l","180":"h:rBurning,gWet@r|h:x1,rCorroded","182":"h:x1,G10|h:p5,rCracked Armor","184":"h:F1|h:G5","186":"s:u1,d2,x1","189":"s:p5,rDisarmed/Cracked Armor/Corroded","190":"s:h2|s:d1,x1","191":"s:x1,gUnstoppable@l","194":"s:t1,h2","195":"h:rChilled/Wet,h1","197":"h:x1,rKnocked Down/Grappled/Restrained","208":"s:oScorched,h2","211":"h:p5,rPoisoned/Burning,gWet@r","212":"h:a1,G10","213":"s:x1,rBleeding|s:x1,gGuarded@l","217":"s:x1,rBlinded|s:x1,gTrue Sight@l","220":"h:gRegrouped@l","222":"s:t1,gProtected@l","223":"s:rInspired,gBarrier@l","225":"h:rBurning/Scorched,gWet@r","231":"s:gEvasive@l|s:rDazed","234":"s:u1,rSilenced|s:x1,rWeakened","001":"s:d1,x1","002":"s:gFocused@l","003":"h:h1|h:d1,x1","004":"s:rBurning/Corroded,gWet@r","005":"h:I2","006":"s:K1","007":"h:x1,h2|h:x1,rBleeding","008":"s:gVenomproof@l","009":"s:gUnstoppable@l","011":"s:rFrightened|s:x1,gWard@l","012":"s:gTrue Sight@l|s:I2","014":"s:gSteadfast@l","015":"s:rBleeding|s:gProtected@l","016":"h:rBurning/Corroded,h1","017":"s:gEvasive@l","018":"h:x1,rCracked Armor/Corroded","019":"s:gBraced@r|s:x1,rMarked","020":"s:gShielded@l","021":"s:x1,gInspired@l","022":"h:rPoisoned|h:h1","023":"h:d1,x1","024":"s:x1,rHexed|s:x1,gWard@l","025":"h:d2,x2","026":"s:x1,gEmpowered@l","027":"s:gColdproof@l","028":"h:x1,rPoisoned/Weakened","030":"s:x1,rPoisoned/Bleeding","031":"h:rCorroded|h:gProtected@n","032":"s:gConsecrated@l","033":"s:gFireproof@l","034":"s:I2","036":"h:F1","037":"s:gProtected@l","039":"h:rShaken|h:gInspired@n","040":"s:gFocused@l|s:gWard@l","041":"h:K2","042":"s:x1,gGuarded@l","043":"s:b1,d1","044":"s:gEntrenched@l","045":"h:gRegrouped@n","046":"s:b1,d2,x1","048":"h:x1,RBleeding/Burning","050":"s:x1,gSteadfast@l,gProtected@l","053":"s:K1|s:rShaken","054":"h:p5,RCracked Armor/Corroded|h:p5,gShielded@n","056":"s:u1,d2,x1","057":"s:rBurning/Corroded,gWet@r","058":"h:p5,h3|h:x1,h1","059":"s:p5,gSteadfast@l|s:p5,gConsecrated@l","060":"h:a1,G10|h:x1,h2","061":"s:gElevated@l|s:gEvasive@l","062":"h:p10,h2,d1","063":"s:rSilenced|s:gBlessed@l","064":"s:x1,RMarked/Exposed|s:gBraced@r","066":"s:b1,d1|s:rShaken","076":"s:p5,rPoisoned|s:gVenomproof@l","077":"s:gWet@rl,gEvasive@rl","078":"h:p5,Z0/0/5/5/5/15","080":"s:gSteadfast@l|s:gTrue Sight@l","081":"s:gUnstoppable@l","085":"s:rFrightened/Shaken|s:gInspired@l","092":"s:rSilenced/Mana Burn|s:gConsecrated@l","094":"s:x1,rSlowed|s:gProtected@l","096":"s:gCountering@l|s:gEvasive@l","098":"s:K2","099":"s:rChilled/Frozen|s:gRegenerating@l"};
const plans=Object.fromEntries(Object.entries(rawPlans).map(([id,raw])=>['L'+id,raw.split('|').map(s=>({target:s[0],steps:s.slice(2).split(',')}))]));
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const live=(g,h)=>(g?.partyHeroes||[]).includes(h)&&Number(status().body(g,h)?.hp)>0;
const keyOf=(g,h)=>{const p=status().position(g,h);return p?String(p.x)+','+String(p.y):null};
const here=(g,k)=>(g?.partyHeroes||[]).filter(h=>live(g,h)&&keyOf(g,h)===k);
const clear=t=>!!t&&!(t.enemies||[]).some(e=>Number(e.hp)>0);
const scope=g=>resource().scope(g);
const terminal=g=>!g?.campaign?.currentQuest||g.campaign.campaignEnded||resource().terminal(g);
function store(g){const id=scope(g);if(g.firstVisit1061?.scope!==id)g.firstVisit1061={scope:id,entries:{}};return g.firstVisit1061}
function rows(g){return g?.firstVisit1061?.scope===scope(g)?g.firstVisit1061.entries||{}:{}}
function entry(g,k,h,{waiting=false,starting=false}={}){
 const t=g?.tiles?.[k],f=catalog[t?.id];
 if(!f?.title||!plans[t.id]||f.campaign||terminal(g)||!clear(t)||!live(g,h)||keyOf(g,h)!==k)return false;
 // A legacy save with visited=true must never retroactively award a new benefit.
 if(t.visited&&!starting)return false;
 const all=store(g).entries;if(all[t.id])return false;
 all[t.id]={id:t.id,key:k,hero:h,stage:waiting?'waiting':'ready',round:Number(g.round||1),starting:!!starting};return true
}
function finish(g,k){const t=g?.tiles?.[k],row=rows(g)[t?.id];if(row?.stage==='waiting'){row.stage='ready';return true}return false}
function seed(g){if(!g||terminal(g)||Number(g.round)!==1)return false;const k='0,0',h=here(g,k)[0];return h?entry(g,k,h,{starting:true}):false}
function log(g,text){g.adventureLog??=[];g.adventureLog.unshift(text);if(g.adventureLog.length>1000)g.adventureLog.length=1000}
function z(g,h){return resource().zones(g,h)}
function cards(a){return Array.isArray(a)?a:[]}
const cardLabel=c=>String(c?.name||c?.Name||c?.title||c?.id||c||'Hero card');
const handCount=(g,h)=>cards(z(g,h)?.hand).length;
const drawCount=(g,h)=>cards(z(g,h)?.deck).length+cards(z(g,h)?.discard).length;
const flag=(u,n)=>status().has(u,n);
const split=s=>s.split('/');
function duration(s){return s==='r'||s==='rl'?'Until end of round.':'Until the end of your next turn.'}
function grant(g,h,token,rec,env){
 const [n,d]=token.split('@'),b=status().body(g,h),was=flag(b,n),a=status().application(b,n,{random:env.random});
 if(!a.allowed)return false;
 if(!was)healRules().grant(g,h,n,{actor:rec.owner,random:env.random},rec.owner);
 if(!flag(b,n))return false;
 const source='FirstVisit1061:'+scope(g)+':'+rec.id;
 status().recordTemporaryApplication(b,n,{source,wasPresent:was,round:g.round,duration:duration(d)});
 if(d==='l'||d==='rl'){
  const meta=b.statusDurations33628?.[n];for(const s of meta?.sources||[])if(s.source===source)s.firstVisitLocation1061=rec.key;
 }
 return true
}
// Expire only the temporary source, preserving unrelated permanent grants.
function expireLocation(g){let changed=false;for(const h of g?.partyHeroes||[]){const b=status().body(g,h);for(const [n,m] of Object.entries(b?.statusDurations33628||{})){if(!Array.isArray(m.sources))continue;const remain=m.sources.filter(s=>!s.firstVisitLocation1061||live(g,h)&&keyOf(g,h)===s.firstVisitLocation1061);if(remain.length===m.sources.length)continue;changed=true;if(remain.length)b.statusDurations33628[n]={...remain[remain.length-1],sources:remain};else status().remove(b,n)}}return changed}
function reconcile(g){
 if(!g)return false;let changed=expireLocation(g);
 const rs=rows(g);for(const rec of Object.values(rs)){
  if(['used','expired'].includes(rec.stage))continue;
  if(terminal(g)){rec.stage='expired';delete rec.steps;changed=true;continue}
  if(rec.stage==='reserved'&&(!live(g,rec.target)||keyOf(g,rec.target)!==rec.key||Number(g.round)>Number(rec.reserveRound)+1)){rec.stage='expired';changed=true}
  if(rec.stage==='ready'&&catalog[rec.id].timing==='arrival'&&!rec.starting&&(!live(g,rec.hero)||keyOf(g,rec.hero)!==rec.key)){rec.stage='expired';changed=true}
 }
 return changed
}
function expireReserved(g,h){for(const row of Object.values(rows(g)))if(row.stage==='reserved'&&row.target===h&&Number(g.round)>Number(row.reserveRound)){row.stage='expired';delete row.steps}}
function preserve(before,next){if(!before||!next)return;if(scope(before)===scope(next)&&before.firstVisit1061?.scope===scope(before))next.firstVisit1061=clone(before.firstVisit1061);else delete next.firstVisit1061}
function ready(g,rec){
 if(!rec||terminal(g)||!plans[rec.id]||!g.tiles?.[rec.key]||g.tiles[rec.key].id!==rec.id)return false;
 const f=catalog[rec.id];
 if(f.timing==='clear'&&!clear(g.tiles[rec.key]))return false;
 return rec.starting||f.timing==='clear'?here(g,rec.key).length>0:live(g,rec.hero)&&keyOf(g,rec.hero)===rec.key
}
function recipient(g,rec,opt,actor,target){
 if(!live(g,actor)||!live(g,target)||keyOf(g,target)!==rec.key)return false;
 const f=catalog[rec.id];
 // Arrival actor owns the choice; Once clear can be settled by a living Hero here.
 if(rec.stage==='reserved'||rec.stage==='steps')return actor===rec.owner&&target===rec.target;
 if(f.timing==='arrival'&&!rec.starting&&actor!==rec.hero)return false;
 if(f.timing==='clear'&&keyOf(g,actor)!==rec.key)return false;
 if(opt.target==='s'&&!rec.starting&&target!==rec.hero)return false;
 return true
}
function canInspect(g,kind){
 const d=kind==='K'?g.encDeck:kind==='P'?g.pool:g.searchDeck;
 if(!Array.isArray(d)||!d.length)return false;
 // Never expose explicitly fixed, scripted, sealed cards or a suppressed stack.
 if(kind==='K'&&g.campaign?.activeEvent==='WE008')return false;
 return !d.some(c=>c?.sealed||c?.scripted||c?.fixed===true||c?.fixedSeverity!=null&&c.fixedSeverity!==''||c?.fixedOrder===true)&&!g.fixedEncounterDeck&&!g.sealedEncounterDeck&&!g.scriptedEncounterDeck
}
function label(s){const c=s[0],v=s.slice(1);switch(c){case'd':return 'Draw '+v+' Hero card(s)';case'x':return 'Discard '+v+' Hero card(s)';case'b':return 'Put '+v+' hand card(s) on bottom';case't':return 'Put '+v+' hand card(s) on top';case'r':return 'Remove '+v.replaceAll('/',' or ');case'R':return 'Remove '+v.replaceAll('/',' and ');case'o':return 'Optionally remove '+v.replaceAll('/',' or ');case'g':return 'Gain '+v.split('@')[0];case'h':return 'Recover '+v+' Health';case'p':return 'Pay '+v+' Gold';case'G':return 'Gain '+v+' Gold';case'a':return 'Spend '+v+' Action';case'u':return 'Pay '+v+' Health';case'I':return 'Inspect/reorder up to '+v+' Hero cards';case'K':return 'Inspect '+v+' Encounter card(s) without moving them';case'F':return 'Put a card from discard on top of Hero deck';case'V':return 'Return a card from discard to hand';case'Z':return 'Roll 1d6 for the printed result';default:return s}}
function available(g,rec,opt,h,env={}){
 const b=status().body(g,h),zs=z(g,h)||{},actions=Number(b?.actions||0)-Number(b?.attackOnlyActions||0);let hand=cards(zs.hand).length,deck=cards(zs.deck).length,discard=cards(zs.discard).length,gold=Number(g.gold||0),hp=Number(b?.hp||0);
 if(!live(g,h))return false;
 for(const step of opt.steps){
  const c=step[0],v=step.slice(1),n=Number(v);
  if(c==='d'){if(deck+discard<n)return false;if(deck<n){deck+=discard;discard=0}deck-=n;hand+=n}
  else if(['x','b','t'].includes(c)){if(hand<n)return false;hand-=n;if(c==='x')discard+=n;else deck+=n}
  else if(c==='h'){const max=status().maxHp(g,h);if(hp>=max&&opt.steps.length===1||b.noHealUntilTurnEnd||b.noHealUntilRound===g.round)return false}
  else if(c==='p'){if(gold<n)return false;gold-=n}
  else if(c==='u'){if(hp<=n)return false;hp-=n}
  else if(c==='r'||c==='R'){if(!split(v).some(n=>flag(b,n)))return false}
  else if(c==='a'){if(status().actionError(b))return false;if(!env.allowReservation&&((env.turnHero&&env.turnHero!==h)||actions<n))return false}
  else if(c==='I'&&deck<1||c==='K'&&!canInspect(g,'K'))return false;
  else if((c==='F'||c==='V')&&discard<1)return false;
  else if(c==='g'&&!status().definitions.byName[v.split('@')[0]])return false;
  else if(!['d','x','b','t','h','p','u','r','R','o','a','I','K','F','V','g','G','Z'].includes(c))return false;
 }
 return true
}
function offers(g,actor,env={}){
 reconcile(g);const out=[];
 for(const rec of Object.values(rows(g))){
  if(!['ready','reserved','steps'].includes(rec.stage)||!ready(g,rec))continue;
  if(rec.stage==='steps'||rec.stage==='reserved'){if(rec.owner===actor)out.push({id:rec.id,key:rec.key,stage:rec.stage,target:rec.target,title:catalog[rec.id].title,pending:clone(rec.pending),option:rec.option,description:catalog[rec.id].description});continue}
  const options=[];plans[rec.id].forEach((opt,index)=>{for(const target of here(g,rec.key)){if(!recipient(g,rec,opt,actor,target)||!available(g,rec,opt,target,{...env,allowReservation:true}))continue;options.push({index,target,label:opt.steps.map(label).join(' · ')})}});
  if((catalog[rec.id].timing==='arrival'&&(rec.hero===actor||rec.starting&&here(g,rec.key).includes(actor)))||catalog[rec.id].timing==='clear'&&here(g,rec.key).includes(actor))out.push({id:rec.id,key:rec.key,stage:'ready',title:catalog[rec.id].title,description:catalog[rec.id].description,options})
 }
 return out
}
function promptFor(rec,kind,options,extra={}){rec.pending={kind,options,...extra};return {pending:clone(rec.pending)}}
function advance(g,rec,env={}){
 const h=rec.target,b=status().body(g,h),zs=z(g,h)||{};
 while(rec.steps.length){
  const step=rec.steps[0],c=step[0],v=step.slice(1),n=Number(v);
  if(['x','b','t'].includes(c))return promptFor(rec,c,cards(zs.hand).map(cardLabel),{count:n});
  if(c==='F'||c==='V')return promptFor(rec,c,cards(zs.discard).map(cardLabel),{count:1});
  if(c==='I'){const list=cards(zs.deck).slice(0,n);if(list.length)return promptFor(rec,'I',list.map(cardLabel),{count:list.length});}
  if(c==='K'){const list=cards(g.encDeck).slice(0,n);if(list.length)return promptFor(rec,'K',list.map(cardLabel),{count:0});}
  if(c==='r'||c==='o'){const list=split(v).filter(n=>flag(b,n));if(list.length>1)return promptFor(rec,c,list,{count:1,optional:c==='o'});if(list.length===1){if(c==='o')return promptFor(rec,c,list,{count:1,optional:true});status().remove(b,list[0]);}}
  if(c==='R')for(const x of split(v))status().remove(b,x);
  if(c==='d')healRules().draw(g,h,n,{random:env.random});
  if(c==='h')healRules().heal(g,h,n,{random:env.random},rec.owner);
  if(c==='p')g.gold=Number(g.gold||0)-n;
  if(c==='G')g.gold=Number(g.gold||0)+n;
  if(c==='a')b.actions=Number(b.actions||0)-n;
  if(c==='u')b.hp=Number(b.hp)-n;
  if(c==='g')grant(g,h,v,rec,env);
  if(c==='Z'){const die=1+Math.floor((env.random||Math.random)()*6),amount=Number(split(v)[die-1])||0;g.gold=Number(g.gold||0)+amount;log(g,'FIRST VISIT: rolled '+die+'; gained '+amount+' Gold.')}
  rec.steps.shift()
 }
 rec.stage='used';delete rec.pending;delete rec.steps;log(g,'FIRST VISIT — '+catalog[rec.id].title+' resolved by '+h+'.');return {resolved:true}
}
function execute(g,actor,cmd={},env={}){
 reconcile(g);
 const rec=rows(g)[String(cmd.feature||'')];if(!rec||!ready(g,rec))return {error:'This First Visit feature is not available.'};
 const opt=plans[rec.id]?.[Number(cmd.option)],operation=String(cmd.action||'');
 if(rec.stage==='ready'){
  const offer=offers(g,actor,env).find(x=>x.id===rec.id);
  if(!offer)return {error:'Only an eligible Hero may choose this feature.'};
  if(operation==='decline'){rec.stage='used';log(g,'FIRST VISIT — '+catalog[rec.id].title+' declined.');return {resolved:true,declined:true}}
  if(operation!=='choose'||!Number.isInteger(cmd.option)||!offer.options.some(x=>x.index===cmd.option&&x.target===cmd.target)||!opt)return {error:'Choose an available printed option.'};
  const target=cmd.target;
  rec.option=cmd.option;rec.owner=actor;rec.target=target;rec.steps=opt.steps.slice();
  if(!available(g,rec,opt,target,env)){
   if(!opt.steps.some(x=>x.startsWith('a')))return {error:'The option is no longer legal.'};
   rec.stage='reserved';rec.reserveRound=Number(g.round);return {reserved:true}
  }
  rec.stage='steps';return advance(g,rec,env)
 }
 if(rec.owner!==actor)return {error:'Another Hero owns this First Visit choice.'};
 if(rec.stage==='reserved'){
  if(operation!=='resume')return {error:'Resume the reserved printed Action on its Hero turn.'};
  const option=plans[rec.id][rec.option];if(!available(g,rec,option,rec.target,env))return {error:'Reserved option is not yet legal or affordable.'};
  rec.stage='steps';return advance(g,rec,env)
 }
 if(rec.stage!=='steps'||operation!=='pick'||!rec.pending)return {error:'The First Visit choice is already resolved.'};
 const p=rec.pending,step=rec.steps[0],v=step.slice(1),idx=cmd.indices,source=rec.target,zs=z(g,source),b=status().body(g,source);
 if(!Array.isArray(idx)||idx.some(i=>!Number.isInteger(i)||i<0||i>=p.options.length)||new Set(idx).size!==idx.length||(!p.optional&&idx.length!==p.count)||(p.optional&&![0,p.count].includes(idx.length)))return {error:'Select the required number of distinct cards or conditions.'};
 if(['x','b','t'].includes(p.kind)){
  const selected=idx.map(i=>zs.hand[i]);if(selected.some(x=>x===undefined))return {error:'The hand changed.'};for(const i of [...idx].sort((a,b)=>b-a))zs.hand.splice(i,1);
  if(p.kind==='x')zs.discard.push(...selected);else if(p.kind==='b')zs.deck.push(...selected);else zs.deck.unshift(...selected)
 }else if(p.kind==='F'||p.kind==='V'){
  const chosen=zs.discard[idx[0]];if(chosen===undefined)return {error:'The discard pile changed.'};zs.discard.splice(idx[0],1);(p.kind==='F'?zs.deck:zs.hand)[p.kind==='F'?'unshift':'push'](chosen)
 }else if(p.kind==='I'){const original=zs.deck.slice(0,p.count);if(original.length!==p.count)return {error:'The deck changed.'};zs.deck.splice(0,p.count,...idx.map(i=>original[i]))}
 else if(p.kind==='r'||p.kind==='o'){if(idx.length)status().remove(b,p.options[idx[0]])}
 rec.steps.shift();delete rec.pending;return advance(g,rec,env)
}
function audit(){return {catalog:Object.keys(catalog).length,named:Object.values(catalog).filter(x=>x.title).length,automated:Object.keys(plans).length,referenceOnly:Object.values(catalog).filter(x=>x.title&&!plans[x.id]).map(x=>x.id)}}
return {catalog,plans,scope,rows,store,entry,finish,seed,reconcile,expireReserved,expireLocation,preserve,offers,execute,audit,clear,here};
});
