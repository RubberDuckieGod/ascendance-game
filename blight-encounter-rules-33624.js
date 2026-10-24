// EN061: authored workbook v10.52, Encounter Deck row 62; System Rules row 88.
// Browser/Node shared transition. Damage reactions belong to the supplied callback.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ascBlightEncounterRules33624=api;})(typeof globalThis==='object'?globalThis:this,function(){
'use strict';
const HERB_ID='LT055'; // Moonleaf is an authored Common herb crafting material.
const HERB_STACK=10;
const clone=x=>JSON.parse(JSON.stringify(x));
const finite=x=>Number.isFinite(Number(x));
const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];
function position(g,h){const st=h==='Aldric'?g.hero:body(g,h);return st&&finite(st.x)&&finite(st.y)?{x:Number(st.x),y:Number(st.y)}:null;}
function zones(g,h){if(h==='Aldric')return {hand:g.heroHand||[],discard:g.heroDiscard||[],discardKey:'heroDiscard',owner:g};if(h==='Lyra')return {hand:g.lyraHand||[],discard:g.lyraDiscard||[],discardKey:'lyraDiscard',owner:g};if(h==='Seraphine')return {hand:g.seraphineHand||[],discard:g.seraphineDiscard||[],discardKey:'seraphineDiscard',owner:g};const st=body(g,h);return {hand:st?.hand||[],discard:st?.discard||[],discardKey:'discard',owner:st};}
function hand(g,h){return zones(g,h).hand;}
function actor(g,p){return p?.roomHero3300||p?.hero||p?.origin?.hero||g.activeHero||g.partyHeroes?.[0]||'Aldric';}
function origin(g,p){const o=p?.origin||(finite(p?.x)&&finite(p?.y)?p:position(g,actor(g,p)));return o&&finite(o.x)&&finite(o.y)?{x:Number(o.x),y:Number(o.y)}:null;}
function targets(g,p){const o=origin(g,p);if(!o)return [];return (g.partyHeroes||[]).filter(h=>{const st=body(g,h),v=position(g,h);return st&&Number(st.hp)>0&&!st.lost&&!st.removed&&v&&v.x===o.x&&v.y===o.y;});}
function questFlags(g,create=false){const q=g.campaign?.c34Quest;if(q&&q.id===g.campaign?.currentQuest){if(create)q.flags??={};return q.flags||{};}if(create)g.blightEncounters33624??={};return g.blightEncounters33624||{};}
function scope(g){return String(g.campaign?.currentQuest||g.scenario||'standalone')+':'+String(g.campaign?.day||0)+':'+String(g.campaign?.questAttempt||0);}
function token(g,p){return [g.campaign?.instanceId32537||'',scope(g),String(p?.encounterSerial33621??p?.serial??g.mechanics33621?.encounterSerial??['EN061',g.round||0,origin(g,p)?.x,origin(g,p)?.y].join(':'))].join(':');}
function ledger(g,create=false){if(create){g.blightEncounters33624??={};g.blightEncounters33624.resolved??={};}return g.blightEncounters33624?.resolved||{};}
function fail(reason,plan){return {ok:false,error:reason,reason,...(plan?{plan}:{})};}
function preview(g,p,choice){
 if(!g||!p||p.card?.id!=='EN061')return fail('This transition supports EN061 Blight Spores only.');
 const h=actor(g,p),o=origin(g,p),st=body(g,h);
 if(!st||(g.partyHeroes||[]).indexOf(h)<0||Number(st.hp)<=0)return fail('The resolving Hero must be a living party Hero.');
 if(!o||!g.tiles?.[o.x+','+o.y])return fail('Blight Spores needs its revealed origin Location.');
 const raw=Number(p.severity??p.roll??p.fixedSeverity??p.origin?.fixedSeverity);
 if(!Number.isFinite(raw)||raw<1)return fail('Blight Spores has no valid Severity.');
 const rawBand=raw<=2?0:raw<=4?1:raw<=6?2:3,flags=questFlags(g),quest=scope(g);
 const blight=Number(g.campaign?.c4Blight||0),first=flags.firstSporeHazard33624!==quest;
 // The 6–7 tier inherits the 3–5 hazard pressure and adds a separate enemy-group bonus.
 const scaled=blight>=3&&blight<=7&&first;
 const band=Math.min(3,rawBand+(scaled?1:0));
 const severity=scaled?[1,3,5,7][band]:raw;
 const cure=String(g.campaign?.currentQuest||'')==='Q039'&&g.campaign?.c4FirstCureDistilled===true&&flags.firstCureHazard33624!==quest;
 const k=o.x+','+o.y,t=g.tiles[k],hs=targets(g,p);
 // EN061 does not author a terrain restriction or a global/token stacking cap.
 const patchEligible=!!t&&!t.unrevealed&&t.revealed!==false&&!t.blightPatchForbidden;
 const plan={actor:h,origin:o,originKey:k,rawSeverity:raw,severity,rawBand,band,scaled,first,quest,token:token(g,p),cureIgnored:cure,hand:clone(hand(g,h)),requiresChoice:!cure&&band===0&&hand(g,h).length>0,targets:cure?[]:band<2?[h]:hs,damage:cure||band===0?0:1,unavoidable:band===3,patchEligible:!cure&&band>=2&&patchEligible,herbId:HERB_ID};
 if(ledger(g)[plan.token])return fail('This Blight Spores encounter was already resolved.',plan);
 if(plan.requiresChoice&&!choice?.noEffect&&!choice?.discardUid)return fail('Choose a card to discard, or choose no effect.',plan);
 if(choice?.noEffect&&choice?.discardUid)return fail('Choose one Blight Spores option.',plan);
 if(choice?.discardUid){
  if(cure||band!==0)return fail('This Severity does not discard a card.',plan);
  if(!hand(g,h).some(c=>String(c.uid)===String(choice.discardUid)))return fail('The chosen card is no longer in the active Hero’s hand.',plan);
 }
 if(band!==0&&choice?.noEffect&&!cure)return fail('No effect is an option only at Severity 1–2.',plan);
 return {ok:true,plan};
}
function gainHerb(g,h){g.inventory??={};const a=g.inventory[h]??=[],key='loot:'+HERB_ID,row=a.find(x=>x.id===HERB_ID&&x.kind==='loot'&&Number(x.qty)<HERB_STACK);if(row)row.qty=Number(row.qty||0)+1;else a.push({key,kind:'loot',id:HERB_ID,qty:1});}
function apply(g,p,choice={},options={}){
 const pre=preview(g,p,choice);if(!pre.ok)return pre;
 const plan=pre.plan;
 if(plan.damage&&typeof options.damage!=='function')return fail('A gameplay damage resolver is required for this Severity.',plan);
 const log=typeof options.log==='function'?options.log:()=>{},dealt=[];
 if(plan.scaled)log('Blight pressure: the first Spore Hazard this Quest resolves one Severity band stronger.');
 if(plan.cureIgnored)log('First Cure Distilled: the first Spore/Poison Hazard in Q039 is ignored.');
 let discarded=null;
 if(choice.discardUid){const z=zones(g,plan.actor),i=z.hand.findIndex(c=>String(c.uid)===String(choice.discardUid));discarded=z.hand.splice(i,1)[0];z.owner[z.discardKey]??=[];z.owner[z.discardKey].push(discarded);log(`Blight Spores: ${plan.actor} discards ${discarded.name||discarded.id}.`);}
 else if(plan.band===0&&!plan.cureIgnored)log('Blight Spores: the active Hero chooses no effect.');
 if(plan.damage)for(const h of plan.targets){const n=Number(options.damage(h,plan.damage,plan.unavoidable));dealt.push({hero:h,damage:Number.isFinite(n)?n:null});}
 if(plan.patchEligible){const t=g.tiles[plan.originKey];t.blightPatches33624=Math.max(0,Number(t.blightPatches33624)||0)+1;log(`Blight Spores: place 1 Blight Patch at ${t.name||plan.originKey}.`);}
 gainHerb(g,plan.actor);log(`Blight Spores reward: ${plan.actor} gains 1 Moonleaf (Herb material).`);
 const flags=questFlags(g,true);flags.firstSporeHazard33624=plan.quest;if(plan.cureIgnored)flags.firstCureHazard33624=plan.quest;
 ledger(g,true)[plan.token]=true;
 return {ok:true,plan,discarded:discarded?clone(discarded):null,damage:dealt,herbId:HERB_ID,patchPlaced:plan.patchEligible};
}
function reduceHealing(g,h,n){const amount=Math.max(0,Number(n)||0),o=position(g,h),t=o&&g.tiles?.[o.x+','+o.y];if(!amount||!t||g.campaign?.activeEvent!=='WE014'||(Number(t.blightPatches33624)||0)<=0)return amount;const r=String(g.round??0);if(t.blightHealingSuppressedRound33624===r)return amount;t.blightHealingSuppressedRound33624=r;return Math.max(0,amount-1);}
function cleanse(g,h,options={}){const o=position(g,h),st=body(g,h),t=o&&g.tiles?.[o.x+','+o.y];if(!st||!(g.partyHeroes||[]).includes(h)||Number(st.hp)<=0||!t||(Number(t.blightPatches33624)||0)<=0)return fail('No Blight Patch can be cleansed here.');if((t.enemies||[]).some(e=>Number(e.hp)>0))return fail('Defeat the Enemies here before cleansing a Blight Patch.');if(Number(st.actions||0)-Number(st.attackOnlyActions||0)<1)return fail('Cleansing a Blight Patch costs 1 general Action.');st.actions-=1;t.blightPatches33624=Math.max(0,Number(t.blightPatches33624)-1);if(typeof options.log==='function')options.log(`${h} spends 1 Action to cleanse 1 Blight Patch.`);return {ok:true,hero:h,originKey:o.x+','+o.y,patches:t.blightPatches33624};}
return {version:'3.36.24',HERB_ID,HERB_STACK,preview,apply,hand,heroState:body,body,position,targets,token,reduceHealing,cleanse};
});
