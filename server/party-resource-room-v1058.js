'use strict';
// All balance changes and card choices are derived from canonical room state.
const R=require('../public/party-resources-v1058.js');
const crypto=require('node:crypto');
const clone=v=>JSON.parse(JSON.stringify(v));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
const fail=error=>({error});
function handle(room,cmd,env){
 const g=room.latestState?.game,t=env.turn,actor=env.actor;
 if(!g||!room.adventureStarted||!Array.isArray(g.partyHeroes)||!g.partyHeroes.includes(actor)||cmd.hero!==actor)return fail('Only a connected assigned Hero may use party resources.');
 if(typeof cmd.id!=='string'||!cmd.id||cmd.id.length>200||['__proto__','constructor','prototype'].includes(cmd.id))return fail('Invalid command ID.');
 const use=cmd.use,supply=own(R.SUPPLY_USES,use),lore=own(R.LORE_USES,use);
 if(!supply&&!lore)return fail('Unknown resource ability.');
 const prior=g.partyResourceCommands1058?.[cmd.id];
 if(own(g.partyResourceCommands1058,cmd.id))return prior.actor===actor&&prior.scope===R.scope(g)&&prior.use===use?{...prior.result,duplicate:true}:fail('Command ID belongs to another request.');
 if(R.terminal(g)||!t||t.resolving||room.phaseTxn3320||Number(cmd.round)!==Number(g.round)||cmd.scope!==R.scope(g))return fail('The Quest or round changed. Review the current board.');
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
