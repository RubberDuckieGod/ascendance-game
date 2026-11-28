'use strict';
// All balance changes and card choices are derived from canonical room state.
const R=require('../public/party-resources-v1058.js');
const S=require('../public/party-resource-sources-v1058.js');
const C=require('../public/party-resource-extras-v1058.js');
const crypto=require('node:crypto');
const clone=v=>JSON.parse(JSON.stringify(v));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
const fail=error=>({error});
function handle(room,cmd,env){
 const g=room.latestState?.game,t=env.turn,actor=env.actor;
 if(!g||!room.adventureStarted||!Array.isArray(g.partyHeroes)||!g.partyHeroes.includes(actor)||cmd.hero!==actor)return fail('Only a connected assigned Hero may use party resources.');
 if(typeof cmd.id!=='string'||!cmd.id||cmd.id.length>200||['__proto__','constructor','prototype'].includes(cmd.id))return fail('Invalid command ID.');
 const use=cmd.use,supply=own(R.SUPPLY_USES,use),lore=own(R.LORE_USES,use);
 const witness=g.partyResourceSources1058?.scope===R.scope(g)?g.partyResourceSources1058.witness:null;
 const witnessUse=use==='WITNESS_KEEP'||use==='SECOND_INTERPRETATION'&&witness&&!witness.resolved;
 const question=use==='QUESTION_SUSPECT',hazard=C.pending(g),hazardUse=use==='HAZARD_KEEP'||use==='SECOND_INTERPRETATION'&&hazard?.actor===actor,attune=use==='ATTUNE_TONE',pacify=use==='PACIFY_SPIRIT';
 if(!supply&&!lore&&!witnessUse&&!question&&!hazardUse&&!attune&&!pacify)return fail('Unknown resource ability.');
 const prior=g.partyResourceCommands1058?.[cmd.id];
 if(own(g.partyResourceCommands1058,cmd.id))return prior.actor===actor&&prior.scope===R.scope(g)&&prior.use===use?{...prior.result,duplicate:true}:fail('Command ID belongs to another request.');
 if(R.terminal(g)||!t||t.resolving||room.phaseTxn3320||Number(cmd.round)!==Number(g.round)||cmd.scope!==R.scope(g))return fail('The Quest or round changed. Review the current board.');
 if(hazardUse||attune||pacify){
  if(cmd.op!=='COMMIT'||t.phase!=='Hero Phase')return fail('A Hero-phase resource command is required.');
  if(hazardUse&&(!hazard||hazard.actor!==actor||hazard.round!==Number(g.round)))return fail('No unresolved authored roll for this Hero.');
  if((attune||pacify||use==='SECOND_INTERPRETATION')&&(t.turnHero!==actor||t.passed?.[actor]||env.downed(g,actor)||env.stunned?.(g,actor)))return fail('Use this ability during your living Hero’s active turn.');
  if((attune||pacify)&&(hazard||witness&&!witness.resolved||room.explorePending3305?.[actor]||env.otherPending?.(g,actor)||Number(t.actions?.[actor]||0)<1))return fail('Resolve pending effects and have one Action available.');
  const trial=clone(g);let outcome,spend={};
  if(attune)outcome=C.attune(trial,actor,env.roll);
  else if(pacify)outcome=C.pacify(trial,actor,String(cmd.enemyId||''));
  else{if(use==='SECOND_INTERPRETATION'){spend=R.execute(trial,cmd,{actor,pending:C.pending(trial),roll:env.roll});if(spend.error||spend.duplicate)return spend;}outcome=C.finishRoll(trial,actor,env);}
  if(!outcome||outcome.error)return outcome||fail('No valid authored resource effect.');
  const result={...spend,...outcome,changed:true,actionsSpent:attune||pacify?1:0};
  trial.partyResourceCommands1058??={};trial.partyResourceCommands1058[cmd.id]={scope:R.scope(trial),actor,use,result:{...result,changed:false}};room.latestState.game=trial;return result;
 }
 if(witnessUse||question){
  if(cmd.op!=='COMMIT'||t.phase!=='Hero Phase')return fail('An active Hero-phase resource command is required.');
  if(question&&(t.turnHero!==actor||t.passed?.[actor]||env.downed(g,actor)||env.stunned?.(g,actor)||env.otherPending?.(g,actor)||room.explorePending3305?.[actor]||Number(t.actions?.[actor]||0)<1))return fail('Question Suspect requires your active Hero, one Action, and no unresolved prompt.');
  if(witnessUse&&(!witness||witness.resolved||witness.actor!==actor||witness.round!==Number(g.round)))return fail('No unresolved Witness roll for this Hero.');
  if(use==='SECOND_INTERPRETATION'&&(t.turnHero!==actor||t.passed?.[actor]||env.downed(g,actor)||env.stunned?.(g,actor)))return fail('Only the living active witness carrier may reroll.');
  const trial=clone(g);let spend={};
  if(use==='SECOND_INTERPRETATION'){spend=R.execute(trial,cmd,{actor,pending:trial.partyResourceSources1058.witness,roll:env.roll});if(spend.error||spend.duplicate)return spend;}
  const outcome=question?S.question(trial,actor):S.witnessResolve(trial,actor);if(outcome.error)return outcome;
  const result={...spend,...outcome,changed:true,combatChanged:outcome.spawned>0,actionsSpent:question?1:0};
  trial.partyResourceCommands1058??={};trial.partyResourceCommands1058[cmd.id]={scope:R.scope(trial),actor,use,result:{...result,changed:false}};
  room.latestState.game=trial;return result;
 }
 if(hazard)return fail('Resolve the pending hazard or Quest roll first.');
 if(env.downed(g,actor))return fail('Downed Heroes cannot use resources.');
 const pending=room.explorePending3305?.[actor];
 if(supply){if(g.partyResourceSetupOpen1058!==true||Number(g.round)!==1||Object.values(t.started||{}).some(Boolean)||t.turnHero||Object.keys(room.explorePending3305||{}).length)return fail('Supply preparation closes when the first Hero turn begins.');}
 else{
  if(t.phase!=='Hero Phase'||t.turnHero!==actor||t.passed?.[actor])return fail('Use Lore during your active Hero turn.');
  if(env.stunned?.(g,actor))return fail('Stunned Heroes cannot use this Lore ability.');
  if(env.otherPending?.(g,actor))return fail('Resolve the current card effect first.');
  if(pending&&!['FOREWARNED','SECOND_INTERPRETATION'].includes(use))return fail('Resolve the current Exploration prompt first.');
 }
 const previews=room.partyResourcePreviews1058??=new Map();
 if(cmd.op==='CANCEL'){const p=previews.get(actor);if(p?.token===cmd.token)previews.delete(actor);return {cancelled:true};}
 const sequence=JSON.stringify([R.scope(g),g.round,t.activationSeq,room.resourceSeq3310,room.exploreSeq3305]);
 if(cmd.op==='PEEK'){
  // Preserve the existing Read Ahead preview/commit behavior. The server, not
  // the client, selects cards; no balance changes until a valid commit.
  const p=R.preview(g,cmd,{shuffle:env.shuffle});if(p.error)return p;
  const token=crypto.randomUUID();previews.set(actor,{...p,token,sequence,use});return {pending:true,token,cards:p.cards};
 }
 if(cmd.op!=='COMMIT')return fail('Unsupported resource command.');
 const previewed=['READ_AHEAD','DECIPHER','ARCHIVE_RECALL','PREPARED_PACK'].includes(use);
 const peek=previews.get(actor);
 if(previewed&&(!peek||peek.token!==cmd.token||peek.use!==use||peek.sequence!==sequence))return fail('The room or preview changed. Open a fresh preview.');
 const trial=clone(g),trialPending=pending?clone(pending):null;
 const result=R.execute(trial,cmd,{actor,peek, pending:trialPending,maxHealth:env.maxHealth,roll:env.roll});
 if(result.error||result.duplicate)return result;
 // The caller publishes/saves all affected ledgers together, then acknowledges.
 room.latestState.game=trial;
 const exploration=['READ_AHEAD','DECIPHER','FOREWARNED','SECOND_INTERPRETATION'].includes(use);
 if(exploration&&trialPending)room.explorePending3305[actor]=trialPending;
 previews.delete(actor);
 return {...result,changed:true,exploration,heroChanged:['FIELD_DRESSING','SHARED_PROVISIONS'].includes(use)};
}
module.exports={handle};
