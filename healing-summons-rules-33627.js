// Focused, shared transitions for Shepherd the Faithful and Spirit Wolf.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascHealingSummonsRules33627=api})(globalThis,()=>{
'use strict';
const CARDS={
 'H003-013':{hero:'Elara',name:'Prayer of Restoration',cost:1},'H003-014':{hero:'Elara',name:'Divine Communion',cost:2},
 'H003-015':{hero:'Elara',name:'Guided Path',cost:1},'H003-016':{hero:'Elara',name:'Shepherd the Faithful',cost:1},
 'H003-017':{hero:'Elara',name:'Wings of Mercy',cost:2},'H007-006':{hero:'Thorne',name:'Spirit Wolf',cost:2},'H007-012':{hero:'Thorne',name:"Nature's Blessing",cost:1}
};
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g?.heroRuntimeStates?.[h]||g?.extraHeroes?.[h];
const position=(g,h)=>h==='Aldric'?g?.hero:body(g,h);
const key=p=>p&&`${p.x},${p.y}`;
const conditions=(g,h)=>(h==='Aldric'?g.conditions:body(g,h)?.conditions)||[];
const named=(list,name)=>list.some(c=>(typeof c==='string'?c:c?.name)===name);
const equipped=(g,h,id)=>Object.values(g.equipped?.[h]||{}).flat().includes(id);
function alive(g,h){const b=body(g,h),fate=g.campaign?.heroFates?.[h]?.status;return (g.partyHeroes||[]).includes(h)&&!!b&&Number(b.hp)>0&&!b.lost&&!b.removed&&!['Dead','Removed','Lost'].includes(fate)}
function neighbors(g,h){const p=position(g,h),from=g.tiles?.[key(p)];if(!p||!from)return [];
 return Object.entries(g.tiles||{}).filter(([k,t])=>{const [x,y]=k.split(',').map(Number),dx=x-p.x,dy=y-p.y;if(Math.abs(dx)+Math.abs(dy)!==1||t.revealed===false||t.unrevealed)return false;const d=dx===1?'E':dx===-1?'W':dy===1?'S':'N';return !!from.edges?.[d]&&!!t.edges?.[{N:'S',S:'N',E:'W',W:'E'}[d]]}).map(([key,t])=>({key,t}));
}
const HARMFUL=['Bleeding','Poisoned','Poison','Burning','Stunned','Weakened','Slowed','Rooted','Exposed','Marked','Silenced','Disarmed','Knocked Down','Shaken','Frightened','Shocked'];
const here=(g,k)=>(g.partyHeroes||[]).filter(w=>alive(g,w)&&key(position(g,w))===k);
const harmful=(g,h)=>conditions(g,h).map(c=>typeof c==='string'?c:c?.name).filter(n=>HARMFUL.includes(n));
const removable=(g,h)=>conditions(g,h).map(c=>typeof c==='string'?c:c?.name).filter(n=>typeof n==='string'&&n);
function consecrated(g,k){const t=g.tiles?.[k];return !!t&&(t.consecratedAuthority33627?.active===true||/consecrated/i.test([t.name,...(t.traits||[])].join(' '))||!!t.consecrated32526||Number(t.consecratedUntilRound||0)>=Number(g.round||1))}
function choices(g,h,cardId){const p=position(g,h),t=g.tiles?.[key(p)];return {heroes:here(g,key(p)),allies:(g.partyHeroes||[]).filter(w=>w!==h&&alive(g,w)&&key(position(g,w))===key(p)),locations:neighbors(g,h),enemies:(t?.enemies||[]).map((en,index)=>({en,index})).filter(q=>Number(q.en?.hp)>0),cardId}}
function moveError(g,h,ignoreEngaged=false){const b=body(g,h),c=conditions(g,h),t=g.tiles?.[key(position(g,h))];
 if(named(c,'Stunned'))return `${h} cannot Move while Stunned.`;
 if(named(c,'Frozen')||named(c,'Restrained'))return `${h} cannot Move while Frozen or Restrained.`;
 if(named(c,'Rooted')||named(c,'Knocked Down'))return `${h} cannot Move while Rooted or Knocked Down.`;
 if(b.movementEndedRound===g.round||b.locationMovementEndedRound===g.round||(h==='Aldric'&&g.locationMovementEndedRound===g.round))return `${h}'s movement has ended this turn.`;
 if(!ignoreEngaged&&(t?.enemies||[]).some(e=>Number(e.hp)>0))return `${h} cannot leave while Engaged.`;
 return null;
}
function preview(g,h,args={}){
 if(!record(args)||typeof args.cardId!=='string')return {error:'Provide one card and its structured choices.'};
 if(args.cardUid!=null&&typeof args.cardUid!=='string')return {error:'Choose an actual card UID.'};
 const authored=CARDS[args.cardId],b=body(g,h);
 if(!authored||authored.hero!==h||!alive(g,h)||g.phase!=='Hero Phase'||g.campaign?.downtime)return {error:'Play this card during its living owner’s Hero turn.'};
 if(named(conditions(g,h),'Stunned'))return {error:'Stunned Heroes cannot play cards.'};
 if(hasPending(g,h))return {error:'Resolve the current card entry or passive choice before playing another card.'};
 const hand=Array.isArray(b.hand)?b.hand:[],index=hand.findIndex(c=>c?.id===args.cardId&&(!args.cardUid||String(c.uid||'')===String(args.cardUid)));
 if(index<0)return {error:'The card must be in the acting Hero’s hand.'};
 const cost=Math.max(0,authored.cost-Math.max(0,Number(b.nextCardDiscount)||0));
 if(Number(b.actions||0)-Number(b.attackOnlyActions||0)<cost)return {error:`${authored.name} requires ${cost} general Action${cost===1?'':'s'}.`};
 const options=choices(g,h,args.cardId),originKey=key(position(g,h));
 if(args.cardId==='H007-012'){
  if(!options.heroes.includes(args.targetHero))return {error:"Choose one living Hero in Thorne's Location."};
  const eligible=conditions(g,args.targetHero).map(c=>typeof c==='string'?c:c?.name).filter(n=>['Bleeding','Burning'].includes(n));
  if(eligible.length&&!eligible.includes(args.condition)||!eligible.length&&args.condition!=null)return {error:'Choose exactly one current Bleeding or Burning Condition to remove.'};
  return {card:hand[index],index,cost,originKey,targetHero:args.targetHero,condition:args.condition||null};
 }
 if(['H003-013','H003-014'].includes(args.cardId)){
  const selected=Array.isArray(args.selections)?args.selections:[],isPrayer=args.cardId==='H003-013',holy=consecrated(g,originKey),pool=options.heroes;
  if(!selected.length||selected.length>(isPrayer?2:pool.length))return {error:'Choose the printed number of Heroes for this prayer.'};
  if(selected.some(s=>!record(s)||typeof s.hero!=='string'||!Array.isArray(s.options)||s.options.some(option=>typeof option!=='string')||s.condition!=null&&typeof s.condition!=='string'))return {error:'Provide one structured set of options for each chosen Hero.'};
  if(new Set(selected.map(s=>s.hero)).size!==selected.length||selected.some(s=>!pool.includes(s.hero)))return {error:'Choose different living Heroes in Elara’s Location.'};
  if(!isPrayer&&(selected.length!==pool.length||pool.some(w=>!selected.some(s=>s.hero===w))))return {error:'Divine Communion resolves for every allied Hero here.'};
  let double=0;for(const s of selected){const opts=Array.isArray(s.options)?s.options:[];if(!opts.length||opts.length>(holy?2:1)||new Set(opts).size!==opts.length||opts.some(x=>!(isPrayer?['heal','cleanse']:['heal','cleanse','inspired']).includes(x)))return {error:'Choose the printed different restoration options.'};if(opts.length===2)double++;if(opts.includes('cleanse')&&s.condition&&!removable(g,s.hero).includes(s.condition))return {error:'Choose a Condition actually affecting the selected Hero.'}}
  if(isPrayer&&double>1)return {error:'Only one Prayer of Restoration target may choose both options.'};
  if(b.supportInnateRound!==g.round&&!pool.includes(args.graceHero))return {error:'Choose the Divine Grace recipient in Elara’s Location.'};
  return {card:hand[index],index,cost,originKey,selections:selected,graceHero:args.graceHero};
 }
 if(['H003-015','H003-017'].includes(args.cardId)){
  const destination=options.locations.find(q=>q.key===args.tileKey);if(!destination)return {error:'Choose a connected revealed Location before resolving movement.'};
  const error=moveError(g,h,args.cardId==='H003-017');if(error)return {error};
  if(!['heal','cleanse'].includes(args.mode))return {error:'Choose recovery or Condition removal.'};
  if(args.cardId==='H003-015'&&args.mode==='cleanse'&&args.condition&&!removable(g,h).includes(args.condition))return {error:'Choose one of your current Conditions.'};
  const allies=here(g,destination.key).filter(w=>w!==h);
  if(args.cardId==='H003-017'&&args.mode==='heal'&&!allies.includes(args.healHero))return {error:'Choose an allied Hero in the destination to recover Health.'};
  if(args.cardId==='H003-017'&&args.mode==='cleanse')for(const [who,n]of Object.entries(args.cleanse||{}))if(!allies.includes(who)||!removable(g,who).includes(n))return {error:'Choose one actual Condition for each allied Hero in the destination.'};
  return {card:hand[index],index,cost,originKey,tileKey:destination.key,allies};
 }
 if(args.cardId==='H003-016'){
  if(typeof args.allyHero!=='string'||typeof args.healHero!=='string')return {error:'Choose the allied Hero and recovery recipient by name.'};
  const ally=String(args.allyHero||''),recipient=String(args.healHero||''),destination=options.locations.find(q=>q.key===args.tileKey);
  if(!options.allies.includes(ally))return {error:'Choose another living allied Hero in Elara’s Location.'};
  if(!destination)return {error:'Choose one connected revealed Location for both Heroes.'};
  if(![h,ally].includes(recipient))return {error:'The acting Hero must choose one of the two moving Heroes to recover Health.'};
  const error=moveError(g,h)||moveError(g,ally);if(error)return {error};
  return {card:hand[index],index,cost,originKey,allyHero:ally,healHero:recipient,tileKey:destination.key};
 }
 if(!Number.isSafeInteger(args.enemyIndex)||args.enemyIndex<0||args.enemyId!=null&&typeof args.enemyId!=='string')return {error:'Choose a living Enemy in Thorne’s Location.'};
 const q=options.enemies.find(q=>q.index===Number(args.enemyIndex)&&(!args.enemyId||String(q.en.roomEnemyId3301||q.en.uid||q.en.id||'')===String(args.enemyId)));
 if(!q)return {error:'Choose a living Enemy in Thorne’s Location.'};
 return {card:hand[index],index,cost,originKey,enemy:q.en};
}
function log(g,text,context){if(context.log)context.log(text);else(g.adventureLog??=[]).push(text)}
function runtime(g){if(!record(g.heroAbilityRuntime3362))g.heroAbilityRuntime3362={};const r=g.heroAbilityRuntime3362;for(const k of ['round','quest','turn','buffs','counters','flags'])if(!record(r[k]))r[k]={};return r}
const level=(g,h)=>Number(g.levels?.[h]||1);
function zones(g,h){if(h==='Aldric')return {owner:g,deck:'heroDeck',hand:'heroHand',discard:'heroDiscard'};if(h==='Lyra')return {owner:g,deck:'lyraDeck',hand:'lyraHand',discard:'lyraDiscard'};if(h==='Seraphine')return {owner:g,deck:'seraphineDeck',hand:'seraphineHand',discard:'seraphineDiscard'};return {owner:body(g,h),deck:'deck',hand:'hand',discard:'discard'}}
function draw(g,h,n=1,context={}){
 const z=zones(g,h),o=z.owner;if(!o)return 0;o[z.deck]??=[];o[z.hand]??=[];o[z.discard]??=[];let drawn=0;
 while(drawn<n){if(!o[z.deck].length&&o[z.discard].length){o[z.deck]=o[z.discard].splice(0);for(let i=o[z.deck].length-1;i>0;i--){const j=Math.floor((context.random||Math.random)()*(i+1));[o[z.deck][i],o[z.deck][j]]=[o[z.deck][j],o[z.deck][i]]}}if(!o[z.deck].length)break;o[z.hand].push(o[z.deck].shift());drawn++}
 if(drawn)log(g,`${h} draws ${drawn} card${drawn===1?'':'s'}.`,context);return drawn;
}
function passiveChoices(g,h){return g?.healingPassiveChoices33627?.[h]||[]}
function hasPending(g,h){return !!g.healingEntries33627?.[h]||passiveChoices(g,h).length>0}
function queueChoice(g,actor,spec){
 const r=runtime(g);if(r.round[spec.key]===g.round)return null;
 const queue=(g.healingPassiveChoices33627??={})[actor]??=[];
 if(queue.some(q=>q.key===spec.key&&q.hero===spec.hero&&q.tileKey===spec.tileKey))return null;
 g.healingPassiveSequence33627=Number(g.healingPassiveSequence33627||0)+1;
 const offer={id:`HEAL-CHOICE-${g.healingPassiveSequence33627}`,actor,round:g.round,...spec};queue.push(offer);return offer;
}
function resolveChoice(g,actor,args={},context={}){
 const queue=passiveChoices(g,actor),q=queue[0];if(!q||q.id!==args.choiceId||q.actor!==actor||q.round!==g.round)return {error:'Choose the current healing passive owned by this acting Hero.'};
 const done=result=>{queue.shift();return {...result,pendingChoices:queue.length>0,entryPending:!!g.healingEntries33627?.[actor]}};
 const r=runtime(g);if(q.type!=='discard'&&r.round[q.key]===g.round)return done({skipped:true});
 if(q.type==='discard'){
  const z=zones(g,q.hero),o=z.owner,hand=o[z.hand]||[],index=hand.findIndex(c=>String(c.uid||c.id||'')===String(args.discardUid||''));
  if(index<0)return {error:'Choose a card currently in the affected Hero’s hand.'};(o[z.discard]??=[]).push(hand.splice(index,1)[0]);return done({discarded:true,hero:q.hero});
 }
 if(args.accept===false)return done({declined:true});
 if(q.type==='draw'){
  r.round[q.key]=g.round;return done({draw:draw(g,q.hero,1,context),hero:q.hero});
 }
 if(q.type==='cleanseHero'){
  const candidates=harmful(g,q.hero);if(!candidates.length)return done({skipped:true});if(!candidates.includes(args.condition))return {error:'Choose a harmful Condition currently affecting the healed Hero.'};
  r.round[q.key]=g.round;removeCondition(g,q.hero,args.condition,{...context,actor},q.owner);return done({removed:args.condition,hero:q.hero});
 }
 if(q.type==='drawDiscard'){
  r.round[q.key]=g.round;const count=draw(g,q.hero,1,context);if(!count)return done({draw:0});q.type='discard';return {draw:count,hero:q.hero,pendingChoices:true,entryPending:!!g.healingEntries33627?.[actor]};
 }
 const target=String(args.targetHero||'');if(!here(g,q.tileKey).includes(target)||q.owner==='Seraphine'&&target==='Seraphine')return {error:'Choose another living Hero in the passive’s Location.'};
 if(q.type==='guardedHero'){r.round[q.key]=g.round;grant(g,target,'Guarded',{...context,actor},q.owner);return done({guarded:true,hero:target})}
 if(q.type==='totemAid'){
  if(!['heal','draw'].includes(args.mode))return {error:'Ancestor’s Circle grants either 1 Health or 1 card.'};
  r.round[q.key]=g.round;if(args.mode==='heal')return done({hero:target,heal:heal(g,target,1,{...context,actor},q.owner)});return done({hero:target,draw:draw(g,target,1,context)});
 }
 return {error:'Unknown healing passive choice.'};
}
function removeCondition(g,h,name,context={},actor='Elara'){
 if(!name)return;const b=body(g,h),wasHarmful=harmful(g,h).includes(name);b.conditions=conditions(g,h).filter(c=>(typeof c==='string'?c:c?.name)!==name);if(name==='Inspired')b.inspired=false;if(name==='Regenerating')delete b.wildGrowthRegenerating33627;
 const r=runtime(g);if(wasHarmful&&actor==='Elara'&&level(g,'Elara')>=7&&r.round['Elara::Beacon of Dawn']!==g.round){r.round['Elara::Beacon of Dawn']=g.round;heal(g,h,1,context,'Elara');queueChoice(g,context.actor||actor,{type:'drawDiscard',owner:'Elara',hero:h,tileKey:key(position(g,h)),key:'Elara::Beacon of Dawn Draw',label:'Beacon of Dawn'})}
}
function grant(g,h,status,context={},actor=h){
 const b=body(g,h);if(status==='Inspired')b.inspired=true;b.conditions??=[];if(named(b.conditions,status))return false;b.conditions.push(status);
 const r=runtime(g),kk=key(position(g,h)),ben=['Guarded','Inspired','Regenerating','Stealth','Hidden'].includes(status),stamp=n=>`Asha::${n}`;
 if(ben&&alive(g,'Asha')&&key(position(g,'Asha'))===kk&&level(g,'Asha')>=3&&r.round[stamp('Ancestral Aid')]!==g.round){r.round[stamp('Ancestral Aid')]=g.round;heal(g,h,1,context,'Asha')}
 if(ben&&alive(g,'Asha')&&Number(g.asc329?.totem?.[kk]||0)>0&&level(g,'Asha')>=7&&r.round[`${stamp('Spirit Chorus')}:${h}`]!==g.round){r.round[`${stamp('Spirit Chorus')}:${h}`]=g.round;r.round[stamp('Spirit Chorus')]=g.round;heal(g,h,1,context,'Asha')}
 if(ben&&alive(g,'Asha')&&Number(g.asc329?.totem?.[kk]||0)>0&&level(g,'Asha')>=9)queueChoice(g,context.actor||actor,{type:'drawDiscard',owner:'Asha',hero:h,tileKey:kk,key:stamp('Spirit Conclave'),label:'Spirit Conclave'});
 if(h==='Seraphine'&&status==='Guarded'&&level(g,h)>=11&&here(g,kk).some(w=>w!==h))queueChoice(g,context.actor||actor,{type:'guardedHero',owner:h,tileKey:kk,key:'Seraphine::Sanctified Vanguard',label:'Sanctified Vanguard'});
 return true;
}
function heal(g,h,n,context,actor){const status=typeof module==='object'&&module.exports?require('./status-rules-33627.js'):globalThis.ascStatusRules33627;return status.withRecovery(body(g,h),()=>healCore(g,h,n,context,actor))}
function healCore(g,h,n,context,actor){
 const b=body(g,h);if(b.noHealUntilTurnEnd||b.noHealUntilRound===g.round)return 0;
 g.campaign??={};
 const mechanics=typeof module==='object'&&module.exports?require('./mechanics-rules-33621.js'):globalThis.ascMechanicsRules33621;
 const stance=g.mechanics33621?.heroes?.[actor];if(equipped(g,actor,'EQ068')&&stance?.stance==='Life'&&stance.stanceEncounter===mechanics?.encounter(g))n+=2;
 const blight=typeof module==='object'&&module.exports?require('./blight-encounter-rules-33624.js'):globalThis.ascBlightEncounterRules33624;
 const max=Number(b.maxHp||({Aldric:12,Lyra:8,Seraphine:11}[h])||b.hp)+(equipped(g,h,'EQ097')?2:0),before=Number(b.hp);
 const applyAmount=amount=>{
  const qid=String(g.campaign?.currentQuest||''),questNo=Number(qid.slice(1)),t=g.tiles?.[key(position(g,h))],tags=[t?.name,t?.terrain,t?.type,...(t?.traits||[]),...(t?.keywords||[])].join(' ');
  const rep=g.campaign?.factionReputation3342||{};
  if(questNo>=37&&questNo<=48&&Number(rep.eldergroveCircle||0)>=1){
   const root=(g.campaign.repPerks3360??={quest:{},event:{},downtime:{}});root.quest??={};const q=root.quest[qid]??={};
   if(!q.elderFirstHeal){q.elderFirstHeal=true;amount++}
  }
  if(questNo>=61&&questNo<=72&&Number(rep.firstDawn||0)>=1&&/Solar|Desert/i.test(tags)){
   const root=(g.campaign.repPerks3360??={quest:{},event:{},downtime:{}});root.quest??={};const q=root.quest[qid]??={};
   if(!q.dawnFirstHeal){q.dawnFirstHeal=true;amount++}
  }
  if(amount>0&&Number(b.hp)<max&&consecrated(g,key(position(g,h)))){t.consecratedHealing33627??={};if(t.consecratedHealing33627[h]!==g.round){t.consecratedHealing33627[h]=g.round;amount++}}
  if(amount>0&&Number(b.hp)<max&&alive(g,'Elara')&&level(g,'Elara')>=5&&key(position(g,'Elara'))===key(position(g,h))&&consecrated(g,key(position(g,h))))amount++;
  if((['Q067','Q068','Q069'].includes(qid)&&Number(g.campaign?.c6Sunfall??2)>=6&&/Desert|Solar/i.test(tags))||g.activeEncounter320?.healPenalty){
   const s=(g.campaign.parity3360??={quest:{},round:{},miragePaid:{},tempest:{},encounter:{}});s.round??={};
   if(['Q067','Q068','Q069'].includes(qid)&&Number(g.campaign?.c6Sunfall??2)>=6&&/Desert|Solar/i.test(tags)){
    const stamp=`sunHeal:${g.round}:${h}`;
    if(!s.round[stamp]){s.round[stamp]=true;const prism=(g.partyQuestItems||[]).some(v=>(typeof v==='string'?v:v?.id)==='LT188');if(prism&&!s.round[`prism:${g.round}`])s.round[`prism:${g.round}`]=true;else amount=Math.max(0,amount-1)}
   }
   if(g.activeEncounter320?.healPenalty&&!s.round[`encHeal:${g.activeEncounter320.token}`]){s.round[`encHeal:${g.activeEncounter320.token}`]=true;amount=Math.max(0,amount-1)}
  }
  const status=typeof module==='object'&&module.exports?require('./status-rules-33627.js'):globalThis.ascStatusRules33627;
  const actual=status.recoveryAmount(b,amount,{capacity:max-Number(b.hp),round:g.round}),allowed=blight?blight.reduceHealing(g,h,actual):actual;b.hp=Number(b.hp)+allowed;return allowed;
 };
 const initial=applyAmount(n);
 if(initial>0&&actor!==h&&equipped(g,actor,'EQ065'))applyAmount(2);
 if(initial>0&&actor!==h&&equipped(g,actor,'EQ142')){
  const equipment=body(g,actor).equipmentLoot33612??={};
  if(equipment['eq142:round']!==g.round){equipment['eq142:round']=g.round;(b.equipmentLoot33612??={}).steadfastPrayerRound=g.round}
 }
 if(Number(b.hp)>before&&h!=='Seraphine'&&alive(g,'Seraphine')&&key(position(g,h))===key(position(g,'Seraphine'))){
  const s=body(g,'Seraphine');if(s.oathboundRound!==g.round){s.oathboundRound=g.round;if(named(conditions(g,'Seraphine'),'Guarded'))heal(g,'Seraphine',1,context,'Seraphine');else grant(g,'Seraphine','Guarded',context,actor)}
 }
 if(Number(b.hp)>before&&actor==='Elara'&&alive(g,'Elara')&&key(position(g,h))===key(position(g,'Elara'))){
  const r=runtime(g),dawn="Elara::Dawn's Embrace";
  if(actor==='Elara'&&h!=='Elara'&&level(g,'Elara')>=2&&r.round['Elara::Blessed Presence']!==g.round){r.round['Elara::Blessed Presence']=g.round;grant(g,h,'Inspired',context,actor)}
  if(h!=='Elara'&&level(g,'Elara')>=4&&(level(g,'Elara')<6||consecrated(g,key(position(g,h))))&&harmful(g,h).length)queueChoice(g,context.actor||actor,{type:'cleanseHero',owner:'Elara',hero:h,tileKey:key(position(g,h)),key:'Elara::Purifying Light',label:'Purifying Light'});
  if(h!=='Elara'&&level(g,'Elara')>=9&&Number(b.hp)>=max&&r.round[dawn]!==g.round){r.round[dawn]=g.round;r.round[`${dawn}:${h}`]=g.round;grant(g,h,'Guarded',context,actor);queueChoice(g,context.actor||actor,{type:'draw',owner:'Elara',hero:h,tileKey:key(position(g,h)),key:`${dawn}:Draw`,label:'Dawn’s Embrace'})}
  if(level(g,'Elara')>=13&&Number(b.hp)<=Math.ceil(max/2)&&r.round['Elara::Mercy Unbound']!==g.round){r.round['Elara::Mercy Unbound']=g.round;draw(g,h,1,context)}
 }
 if(Number(b.hp)>before&&alive(g,'Thorne')&&level(g,'Thorne')>=7&&g.tiles?.[key(position(g,h))]?.vineTerrain32526)queueChoice(g,context.actor||actor,{type:'drawDiscard',owner:'Thorne',hero:h,tileKey:key(position(g,h)),key:'Thorne::Verdant Reach',label:'Verdant Reach'});
 if(before<=0&&Number(b.hp)>0&&['Downed','Lost'].includes(g.campaign?.heroFates?.[h]?.status))g.campaign.heroFates[h]={status:'Active',quest:g.campaign.currentQuest,day:g.campaign.day};
 return Math.max(0,Number(b.hp)-before);
}
function entryPassives(g,moved,tileKey,args={},context={},actor=moved[0]){
 const t=g.tiles[tileKey],r=runtime(g),result=[];
 for(const h of moved){
  const b=body(g,h),opts=args.entryChoices?.[h]||{};b.difficultPrepared=false;b.movedTurn=true;
  const e=b.equipmentLoot33612??={};if(e.moveRound!==g.round){e.moveRound=g.round;e.moveCount=0}e.moveCount=Number(e.moveCount||0)+1;
  const auto=g.equipmentAutoHit33613??={lastRound:g.round,encounterUsed:{},roundUsed:{},movedRound:{},lastEmber:{}};(auto.movedRound??={})[h]=g.round;
  if(equipped(g,h,'EQ143'))e.tempoRound=g.round;if(equipped(g,h,'EQ107')&&(t.enemies||[]).some(en=>en.hp>0))e.vanguardRound=g.round;
  if(equipped(g,h,'EQ105')&&consecrated(g,tileKey)&&e['eq105:round']!==g.round){e['eq105:round']=g.round;heal(g,h,1,context,actor)}
  if(t.id==='L043'){
   t.hiddenMovementByHero33627??={};if(t.hiddenMovementByHero33627[h]!==g.round){t.hiddenMovementByHero33627[h]=g.round;t.lastHiddenMovementStamp=`${g.round}:${h}`;
    if(opts.fog==='Hidden')grant(g,h,'Hidden',context,actor);else{b.locationArmorBuff=Number(b.locationArmorBuff||0)+1;b.locationArmorBuffExpiresRound=g.round+1}
   }
  }
  if(h==='Kael'||h==='Lucien'){
   r.counters[`${h}::movesTurn`]=Number(r.counters[`${h}::movesTurn`]||0)+1;
   if(h==='Lucien'){const max=level(g,h)>=4?2:1,count=Number(r.counters['Lucien::Tempo']||0);if(count<max){r.counters['Lucien::Tempo']=count+1;b.nextAttackBonus=Number(b.nextAttackBonus||0)+1}}
  }
  if(alive(g,'Thorne')&&key(position(g,'Thorne'))===tileKey&&opts.wildGrowth===true&&r.round['Thorne::Wild Growth']!==g.round){r.round['Thorne::Wild Growth']=g.round;const refresh=!!b.wildGrowthRegenerating33627,added=grant(g,h,'Regenerating',context,'Thorne');if(added||refresh)b.wildGrowthRegenerating33627={appliedToken:b.statusActivation33627?.start||null,owner:'Thorne'}}
  if(h==='Thorne'&&actor==='Thorne'&&alive(g,'Thorne')&&(t.vineTerrain32526||t.worldroot3362)&&level(g,'Thorne')>=6){const stamp=`${g.round}:${h}:${Number(r.counters['turn:'+h]||0)}`;if(r.turn[`${h}::Living Wilds Draw`]!==stamp){r.turn[`${h}::Living Wilds Draw`]=stamp;draw(g,h,1,context)}}
  if(alive(g,'Thorne')&&t.worldroot3362&&!r.quest[`${h}::Worldroot Entry`]){r.quest[`${h}::Worldroot Entry`]=true;heal(g,h,2,context,actor)}
  if(alive(g,'Asha')&&Number(g.asc329?.totem?.[tileKey]||0)>0&&level(g,'Asha')>=5&&r.round[`Asha::Spirit Passage:${h}`]!==g.round){r.round[`Asha::Spirit Passage:${h}`]=g.round;draw(g,h,1,context)}
  if(alive(g,'Asha')&&Number(g.asc329?.totem?.[tileKey]||0)>0&&level(g,'Asha')>=11)queueChoice(g,actor,{type:'totemAid',owner:'Asha',tileKey,key:"Asha::Ancestor's Circle",label:'Ancestor’s Circle'});
  if(level(g,h)>=13&&['Rowan','Thorne'].includes(h)){
   g.campaign??={};const lr=g.campaign.levelRuntime3360??={quest:g.campaign.currentQuest,hero:{},groupDamage:{},round:0,roundStart:{}};lr.hero??={};const hs=lr.hero[h]??={used:{},round:{},buff:{},turnStart:null};hs.round??={};hs.buff??={};
   if(h==='Rowan'&&hs.round.trailblazer!==g.round&&Object.values(t.edges||{}).some(Boolean)&&neighbors(g,h).length<4){hs.round.trailblazer=g.round;hs.buff.trailblazer=1}
   if(h==='Thorne'&&lr.nature?.[tileKey]){lr.natureHealed??={};if(!lr.natureHealed[`${h}:${tileKey}`]){lr.natureHealed[`${h}:${tileKey}`]=true;heal(g,h,1,context,actor)}}
  }
  const q=g.campaign?.currentQuest;
  if(['Q055','Q056','Q057'].includes(q)&&Number(g.campaign?.c5Doomtide??2)>=6&&/Coast|Sea/i.test([t.name,t.terrain,...(t.traits||[])].join(' '))){
   const parity=g.campaign.parity3360??={quest:{},round:{},miragePaid:{},tempest:{},encounter:{}};parity.tempest??={};
   if(!parity.tempest[`tempest:${g.round}:${h}`]){parity.tempest[`tempest:${g.round}:${h}`]=true;const lens=(g.partyQuestItems||[]).some(v=>(typeof v==='string'?v:v?.id)==='LT182');
    if(lens&&!parity.tempest[`lens:${g.round}`])parity.tempest[`lens:${g.round}`]=true;else{const die=1+Math.floor((context.random||Math.random)()*6);log(g,`Tempest Pressure: ${h} rolls ${die}.`,context);if(die<=2&&!named(conditions(g,h),'Guarded')){b.hp=Math.max(0,Number(b.hp)-1);if(b.hp===0){const status=typeof module==='object'&&module.exports?require('./status-rules-33627.js'):globalThis.ascStatusRules33627;status?.markHeroDefeated(g,h)}}}
   }
  }
  result.push(h);
 }
 return result;
}
function makeEntryReceipt(g,h,tileKey,context={}){
 const t=g.tiles[tileKey];if(!alive(g,h)){if(g.healingPassiveChoices33627)delete g.healingPassiveChoices33627[h];return null}if(t.visited||(t.enemies||[]).some(e=>e.hp>0))return null;
 g.healingEntrySequence33627=Number(g.healingEntrySequence33627||0)+1;
 const receipt={id:context.commandId||`ENTRY-${g.healingEntrySequence33627}`,actor:h,tileKey,round:g.round};(g.healingEntries33627??={})[h]=receipt;return {...receipt};
}
function completeEntry(g,h,args={},context={}){
 const receipt=g.healingEntries33627?.[h];if(!receipt)return {completed:false};
 if(receipt.actor!==h||receipt.round!==g.round||receipt.tileKey!==args.tileKey||args.entryId&&args.entryId!==receipt.id||key(position(g,h))!==receipt.tileKey)return {error:'The entry receipt does not match this Hero and Location.'};
 const t=g.tiles[receipt.tileKey],blocked=(t.enemies||[]).some(e=>e.hp>0),emptyDeck=!(g.encDeck||[]).length&&!(g.encDiscard||[]).length;
 if(!context.authoritativeFirstVisit&&!t.visited&&!blocked&&t.enc&&!emptyDeck)return {error:'Resolve this Location’s First Visit before completing the card entry.'};
 if(!t.enc&&!blocked)t.visited=true;delete g.healingEntries33627[h];return {completed:true,entryId:receipt.id};
}
function expireOnHeroStart(g,h,options={}){
 const b=body(g,h),token=String(options.token||'');if(!b||!token||b.statusActivation33627?.start===token)return {expired:0,duplicate:true};
 let count=0;for(const t of Object.values(g.tiles||{}))if(t.consecratedBy===h&&t.consecratedAuthority33627?.createdToken!==token){
  delete t.consecratedUntilRound;delete t.consecratedBy;if(t.consecratedAuthority33627)t.consecratedAuthority33627={...t.consecratedAuthority33627,active:false,expiredToken:token};count++;
 }
 return {expired:count};
}
function playCard(g,h,args={},context={}){
 const plan=preview(g,h,args);if(plan.error)return plan;
 context={...context,actor:h};
 const b=body(g,h),card=plan.card;b.actions-=plan.cost;b.nextCardDiscount=0;b.hand.splice(plan.index,1);
 const finish=result=>{(b.discard??=[]).push(card);return result};
 if(args.cardId==='H007-012'){
  const recovered=heal(g,plan.targetHero,1,context,h);if(plan.condition)removeCondition(g,plan.targetHero,plan.condition,context,h);
  return finish({cardId:args.cardId,cost:plan.cost,healHero:plan.targetHero,heal:recovered,removed:plan.condition,pendingChoices:passiveChoices(g,h).length>0});
 }
 if(['H003-013','H003-014'].includes(args.cardId)){
  const effects=[];for(const selection of plan.selections){const who=selection.hero,record={hero:who,heal:0,removed:null,inspired:false};
   if(selection.options.includes('heal'))record.heal=heal(g,who,args.cardId==='H003-013'?1:2,context,h);
   if(selection.options.includes('cleanse')){removeCondition(g,who,selection.condition,context,h);record.removed=selection.condition||null}
   if(selection.options.includes('inspired'))record.inspired=grant(g,who,'Inspired',context,h);effects.push(record);
  }
  if(b.supportInnateRound!==g.round){b.supportInnateRound=g.round;heal(g,plan.graceHero,level(g,h)>=3?2:1,context,h)}
  return finish({cardId:args.cardId,cost:plan.cost,effects,graceHero:plan.graceHero||null,pendingChoices:passiveChoices(g,h).length>0});
 }
 if(['H003-015','H003-016','H003-017'].includes(args.cardId)){
  const [x,y]=plan.tileKey.split(',').map(Number);
  const moved=args.cardId==='H003-016'?[h,plan.allyHero]:[h];
  for(const who of moved){Object.assign(position(g,who),{x,y});log(g,`${card.name}: ${who} moves to ${g.tiles[plan.tileKey].name||plan.tileKey}.`,context)}
  entryPassives(g,moved,plan.tileKey,args,context,h);
  let recovered=0,recipient=null;
  if(args.cardId==='H003-016'){recipient=plan.healHero;recovered=heal(g,recipient,1,context,h);log(g,`${card.name}: ${h} chooses ${recipient} to recover ${recovered} Health.`,context)}
  if(args.cardId==='H003-015'){if(args.mode==='heal'){recipient=h;recovered=heal(g,h,1,context,h)}else removeCondition(g,h,args.condition,context,h);if(consecrated(g,plan.tileKey))draw(g,h,1,context)}
  if(args.cardId==='H003-017'){
   if(args.mode==='heal'){recipient=args.healHero;recovered=heal(g,recipient,2,context,h)}else for(const [who,name]of Object.entries(args.cleanse||{}))removeCondition(g,who,name,context,h);
   g.tiles[plan.tileKey].consecratedUntilRound=g.round+1;g.tiles[plan.tileKey].consecratedBy=h;
   g.healingConsecrationSequence33627=Number(g.healingConsecrationSequence33627||0)+1;
   g.tiles[plan.tileKey].consecratedAuthority33627={id:context.commandId||`CONSECRATE-${g.healingConsecrationSequence33627}`,owner:h,active:true,createdToken:b.statusActivation33627?.start||null};
  }
  return finish({cardId:args.cardId,cost:plan.cost,moved,tileKey:plan.tileKey,healHero:recipient,heal:recovered,entryReceipt:makeEntryReceipt(g,h,plan.tileKey,context),pendingChoices:passiveChoices(g,h).length>0});
 }
 const prior=body(g,h).spiritWolf32526,oldId=prior?.pieceId33627;
 g.heroCreatedPieces3294=(g.heroCreatedPieces3294||[]).filter(p=>p.id!==oldId&&!(p.type==='wolf'&&p.owner===h));
 g.healingSummonSequence33627=Number(g.healingSummonSequence33627||0)+1;
 const id=context.commandId?`HCP-${context.commandId}`:`HCP-WOLF-${g.healingSummonSequence33627}`;
 const p={id,type:'wolf',name:'Spirit Wolf',label:'Spirit Wolf',owner:h,locationKey:plan.originKey,hp:3,maxHp:3,armor:0,createdRound:Number(g.round||0),data:{cardId:args.cardId,encounterToken:g.activeEncounter320?.token||null}};
 g.heroCreatedPieces3294.push(p);const [x,y]=plan.originKey.split(',').map(Number);b.spiritWolf32526={x,y,hp:3,damage:2,pieceId33627:id};
 const en=plan.enemy,before=Number(en.hp);en.hp=Math.max(0,before-2);const damage=before-en.hp,killed=en.hp===0;
 if(killed){g.tiles[plan.originKey].enemies=g.tiles[plan.originKey].enemies.filter(e=>e!==en);if(context.kill)context.kill(h,en,card.name);else if(!en._killOwner32521){en._killOwner32521=h;en._heroKillCredited32519=h;g.heroKills3259??={};g.heroKills3259[h]=Number(g.heroKills3259[h]||0)+1}}
 log(g,`Spirit Wolf placed at ${g.tiles[plan.originKey].name||plan.originKey}; ${en.name||'Enemy'} suffers ${damage} damage.`,context);
 return finish({cardId:args.cardId,cost:plan.cost,pieceId:id,tileKey:plan.originKey,damage,killed,enemyId:String(en.roomEnemyId3301||en.uid||en.id||''),...(killed?{defeatedEnemy:JSON.parse(JSON.stringify(en)),beforeHp:before}:{})});
}
function reconcile(g){
 if(!g)return;
 const expired=new Set((g.heroCreatedPieces3294||[]).filter(p=>p.type==='wolf'&&p.data?.encounterToken&&g.activeEncounter320?.token!==p.data.encounterToken).map(p=>p.id));
 if(expired.size){g.heroCreatedPieces3294=g.heroCreatedPieces3294.filter(p=>!expired.has(p.id));const thorne=body(g,'Thorne');if(expired.has(thorne?.spiritWolf32526?.pieceId33627))delete thorne.spiritWolf32526}
 const b=body(g,'Thorne'),legacy=b?.spiritWolf32526;if(!legacy)return;
 g.heroCreatedPieces3294??=[];
 let p=g.heroCreatedPieces3294.find(p=>p.type==='wolf'&&p.owner==='Thorne');
 if(!p&&Number(legacy.hp??3)>0){g.healingSummonSequence33627=Number(g.healingSummonSequence33627||0)+1;p={id:legacy.pieceId33627||`HCP-WOLF-${g.healingSummonSequence33627}`,type:'wolf',name:'Spirit Wolf',label:'Spirit Wolf',owner:'Thorne',locationKey:key(legacy),hp:Number(legacy.hp??3),maxHp:3,armor:0,createdRound:Number(g.round||0),data:{cardId:'H007-006'}};g.heroCreatedPieces3294.push(p)}
 if(p){legacy.pieceId33627=p.id;legacy.hp=p.hp;const [x,y]=p.locationKey.split(',').map(Number);legacy.x=x;legacy.y=y;if(Number(p.hp)<=0){g.heroCreatedPieces3294=g.heroCreatedPieces3294.filter(q=>q.id!==p.id);delete b.spiritWolf32526}}
}
function defeat(g,h,args={}){
 const piece=(g.heroCreatedPieces3294||[]).find(p=>p.id===args.pieceId&&p.owner===h&&p.type==='wolf');
 if(!piece||!alive(g,h)||g.phase!=='Hero Phase')return {error:'Choose your own Spirit Wolf during your Hero turn.'};
 g.heroCreatedPieces3294=g.heroCreatedPieces3294.filter(p=>p.id!==piece.id);delete body(g,h).spiritWolf32526;log(g,'Spirit Wolf is Defeated and removed.',{});return {removed:true,pieceId:piece.id};
}
// Once a Wolf is created by an atomic room command, ordinary compatibility
// snapshots cannot delete it, restore a defeated one, or alter its owner/location.
function preserveCanonical(current,incoming){
 if(!current||!incoming)return incoming;
 const scope=g=>[g.campaign?.instanceId32537,g.campaign?.currentQuest,g.campaign?.day,g.campaign?.questAttempt].join(':');
 if(scope(current)!==scope(incoming))return incoming;
 reconcile(current);
 const canonical=(current.heroCreatedPieces3294||[]).filter(p=>p.type==='wolf');
 incoming.heroCreatedPieces3294=[...(incoming.heroCreatedPieces3294||[]).filter(p=>p.type!=='wolf'),...JSON.parse(JSON.stringify(canonical))];
 const old=body(current,'Thorne'),next=body(incoming,'Thorne');
 if(next){if(old?.spiritWolf32526)next.spiritWolf32526=JSON.parse(JSON.stringify(old.spiritWolf32526));else delete next.spiritWolf32526}
 if(current.healingSummonSequence33627!==undefined)incoming.healingSummonSequence33627=current.healingSummonSequence33627;
 if(current.healingEntries33627)incoming.healingEntries33627=JSON.parse(JSON.stringify(current.healingEntries33627));else delete incoming.healingEntries33627;
 if(current.healingEntrySequence33627!==undefined)incoming.healingEntrySequence33627=current.healingEntrySequence33627;
 if(current.healingPassiveChoices33627)incoming.healingPassiveChoices33627=JSON.parse(JSON.stringify(current.healingPassiveChoices33627));else delete incoming.healingPassiveChoices33627;
 if(current.healingPassiveSequence33627!==undefined)incoming.healingPassiveSequence33627=current.healingPassiveSequence33627;
 if(current.healingConsecrationSequence33627!==undefined)incoming.healingConsecrationSequence33627=current.healingConsecrationSequence33627;
 for(const [k,t]of Object.entries(current.tiles||{})){const next=incoming.tiles?.[k],authority=t.consecratedAuthority33627;if(!next||!authority)continue;const wasStale=next.consecratedAuthority33627?.id===authority.id&&next.consecratedAuthority33627?.active===true;
  next.consecratedAuthority33627=JSON.parse(JSON.stringify(authority));
  if(authority.active){next.consecratedUntilRound=t.consecratedUntilRound;next.consecratedBy=t.consecratedBy}
  else if(wasStale){delete next.consecratedUntilRound;delete next.consecratedBy}
 }
 preserveConsumed(current,incoming);
 return incoming;
}
function preserveConsumed(current,incoming){
 const maxStamps=(old,next,filter=()=>true)=>{if(!old||!next)return;for(const [k,v]of Object.entries(old))if(filter(k)&&Number.isSafeInteger(v)&&v>=0&&(!Number.isSafeInteger(next[k])||next[k]<v))next[k]=v};
 const trueFlags=(old,next,filter=()=>true)=>{if(!old||!next)return;for(const [k,v]of Object.entries(old))if(filter(k)&&v===true)next[k]=true};
 for(const h of current.partyHeroes||[]){const old=body(current,h),next=body(incoming,h);if(!old||!next)continue;
  for(const k of ['supportInnateRound','oathboundRound','natureRenewalRound33627'])if(Number.isSafeInteger(old[k])&&(!Number.isSafeInteger(next[k])||next[k]<old[k]))next[k]=old[k];
  if(old.equipmentLoot33612){if(!record(next.equipmentLoot33612))next.equipmentLoot33612={};maxStamps(old.equipmentLoot33612,next.equipmentLoot33612,k=>['eq142:round','eq105:round'].includes(k))}
 }
 const oldRuntime=current.heroAbilityRuntime3362;
 if(oldRuntime){const next=runtime(incoming);maxStamps(oldRuntime.round,next.round,k=>/^(?:Asha::(?:Ancestral Aid|Spirit Chorus|Spirit Passage:|Spirit Conclave|Ancestor's Circle)|Elara::(?:Blessed Presence|Dawn's Embrace|Mercy Unbound|Purifying Light|Beacon of Dawn)|Thorne::(?:Wild Growth|Verdant Reach|Nature Renewal:)|Seraphine::Sanctified Vanguard)/.test(k));trueFlags(oldRuntime.quest,next.quest,k=>/::Worldroot Entry$/.test(k));for(const [k,v]of Object.entries(oldRuntime.turn||{}))if(/::Living Wilds Draw$/.test(k)&&typeof v==='string')next.turn[k]=v}
 for(const [k,t]of Object.entries(current.tiles||{})){const next=incoming.tiles?.[k];if(!next)continue;
  for(const field of ['consecratedHealing33627','hiddenMovementByHero33627'])if(t[field]){if(!record(next[field]))next[field]={};maxStamps(t[field],next[field])}
 }
 const oldCampaign=current.campaign;if(!oldCampaign)return;if(!record(incoming.campaign))incoming.campaign={};
 if(oldCampaign.repPerks3360?.quest){if(!record(incoming.campaign.repPerks3360))incoming.campaign.repPerks3360={quest:{},event:{},downtime:{}};const perks=incoming.campaign.repPerks3360;if(!record(perks.quest))perks.quest={};for(const [quest,flags]of Object.entries(oldCampaign.repPerks3360.quest)){if(!record(perks.quest[quest]))perks.quest[quest]={};trueFlags(flags,perks.quest[quest],k=>['elderFirstHeal','dawnFirstHeal'].includes(k))}}
 if(oldCampaign.parity3360){if(!record(incoming.campaign.parity3360))incoming.campaign.parity3360={quest:{},round:{},tempest:{},miragePaid:{},encounter:{}};const p=incoming.campaign.parity3360;if(!record(p.round))p.round={};if(!record(p.tempest))p.tempest={};trueFlags(oldCampaign.parity3360.round,p.round,k=>/^(sunHeal:|encHeal:|prism:)/.test(k));trueFlags(oldCampaign.parity3360.tempest,p.tempest,k=>/^(tempest:|lens:)/.test(k))}
 if(oldCampaign.levelRuntime3360?.natureHealed){if(!record(incoming.campaign.levelRuntime3360))incoming.campaign.levelRuntime3360={quest:incoming.campaign.currentQuest,hero:{},groupDamage:{},round:0,roundStart:{}};const level=incoming.campaign.levelRuntime3360;if(!record(level.natureHealed))level.natureHealed={};trueFlags(oldCampaign.levelRuntime3360.natureHealed,level.natureHealed)}
}
return {CARDS,HARMFUL,body,position,alive,neighbors,choices,harmful,removable,consecrated,preview,playCard,entryPassives,makeEntryReceipt,completeEntry,expireOnHeroStart,passiveChoices,hasPending,resolveChoice,heal,draw,grant,reconcile,defeat,preserveCanonical,preserveConsumed};
});
