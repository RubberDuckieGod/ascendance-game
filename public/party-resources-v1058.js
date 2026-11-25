/* Ascendance v10.58 playtest — shared party resource rules.
   The live room owns balances; UI clients must not mint Lore or Evidence.
   Ordinary quest Evidence never substitutes for a persistent LT Quest Item. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ascPartyResources1058 = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const CAPS = Object.freeze({ lore: 12, supply: 9 });
  const LORE_USES = Object.freeze({
    READ_AHEAD: { cost: 1, label: 'Read Ahead', frequency: 'once per party per Quest', effect: 'Inspect the top 2 Encounter cards and return them in any order.' },
    DECIPHER: { cost: 2, label: 'Decipher', frequency: 'once per party per Quest', effect: 'Inspect the top 3 cards of the Search Deck or Location stack, and return them in any order.' },
    SECOND_INTERPRETATION: { cost: 2, label: 'Second Interpretation', frequency: 'once per party per Quest', effect: 'Reroll one noncombat hazard check or Quest die roll; keep the new result.' },
    FOREWARNED: { cost: 3, label: 'Forewarned', frequency: 'once per party per Quest', effect: 'Reduce an ordinary random Encounter Severity roll by 1.' },
    ARCHIVE_RECALL: { cost: 3, label: 'Archive Recall', frequency: 'once per party per Quest', effect: 'One Hero retrieves a non-Spell, non-Ultimate Hero card from their discard pile.' }
  });
  const SUPPLY_USES = Object.freeze({
    FIELD_DRESSING: { cost: 1, label: 'Field Dressing', timing: 'Quest setup', effect: 'One Hero recovers up to 2 Health.' },
    PREPARED_PACK: { cost: 1, label: 'Prepared Pack', timing: 'Quest setup', effect: 'One Hero draws a Hero card then discards a Hero card.' },
    SHARED_PROVISIONS: { cost: 2, label: 'Shared Provisions', timing: 'Quest setup', effect: 'Up to 2 different Heroes each recover 1 Health.' }
  });
  function number(n) { const v = Number(n); return Number.isSafeInteger(v) && v >= 0 ? v : 0; }
  function balances(g) {
    return { lore: number(g?.partyLore1058), evidence: number(g?.partyEvidence1058), supply: number(g?.partySupplies33615) };
  }
  function currentQuest(g) { return String(g?.campaign?.currentQuest || ''); }
  function questChange(g, questId) {
    if (!g || typeof g !== 'object') return { error: 'Missing game.' };
    const id = String(questId || currentQuest(g));
    const next = id + ':' + String(g?.campaign?.instanceId32537 || g?.campaign?.questAttempt || '');
    if (!id) return { error: 'Quest ID is required.' };
    // A receipt is saved with the room; reloads cannot reset the same Quest.
    if (!g.partyResourceQuest1058) { g.partyResourceQuest1058 = next; return { changed: false }; }
    if (String(g.partyResourceQuest1058) === next) return { changed: false };
    g.partyResourceQuest1058 = next;
    g.partyEvidence1058 = 0;
    g.partyResourceSpent1058 = {};
    g.partySupplySetupSpent1058 = 0;
    g.partyResourceSetupOpen1058 = false;
    return { changed: true, evidenceCleared: true };
  }
  function grant(g, type, amount, receipt) {
    if (!g || !['lore', 'evidence', 'supply'].includes(type) || !Number.isSafeInteger(amount) || amount <= 0) return { error: 'Invalid resource grant.' };
    if (typeof receipt !== 'string' || !/^[A-Za-z0-9:_-]{1,150}$/.test(receipt) || ['__proto__','constructor','prototype'].includes(receipt)) return { error: 'A unique source receipt is required.' };
    g.partyResourceReceipts1058 = g.partyResourceReceipts1058 || {};
    if (Object.prototype.hasOwnProperty.call(g.partyResourceReceipts1058, receipt)) return { granted: 0, duplicate: true, balance: balances(g)[type] };
    const key = type === 'lore' ? 'partyLore1058' : type === 'evidence' ? 'partyEvidence1058' : 'partySupplies33615';
    const prior = balances(g)[type], maximum = type === 'evidence' ? Number.MAX_SAFE_INTEGER : limit(g,type);
    const granted = Math.max(0, Math.min(amount, maximum - prior)); // Never shrink legacy balances above the new cap.
    g[key] = prior + granted;
    g.partyResourceReceipts1058[receipt] = true;
    return { granted, balance: g[key] };
  }
  function checkLore(g, use) {
    const spec = Object.prototype.hasOwnProperty.call(LORE_USES, use) ? LORE_USES[use] : null;
    if (!spec) return { error: 'Unknown Lore use.' };
    if (balances(g).lore < spec.cost) return { error: 'Not enough Lore.' };
    const scope = String(g?.campaign?.instanceId32537 || currentQuest(g));
    if (!currentQuest(g) || !scope || g.campaign?.downtime || ['Completed','Failed'].includes(g.campaign?.questStatus?.[currentQuest(g)])) return { error: 'An active Quest is required.' };
    const key = scope + ':' + use;
    if (Object.prototype.hasOwnProperty.call(g?.partyResourceSpent1058 || {}, key)) return { error: 'This Lore use is already spent for this Quest.' };
    return { cost: spec.cost, key, spec };
  }
  // A caller must first resolve the actual card/deck/hazard effect. Never charge
  // Lore for an unimplemented action or a failed/dismissed prompt.
  function commitLore(g, use, receipt, effectSucceeded) {
    const quote = checkLore(g, use);
    if (quote.error) return quote;
    if (effectSucceeded !== true || !receipt) return { error: 'The Lore effect must succeed before it is charged.' };
    g.partyResourceSpent1058 = g.partyResourceSpent1058 || {};
    g.partyResourceSpent1058[quote.key] = String(receipt);
    g.partyLore1058 = balances(g).lore - quote.cost;
    return { spent: quote.cost, balance: g.partyLore1058 };
  }
  function canUseSupplyAtSetup(g, use) {
    const spec = Object.prototype.hasOwnProperty.call(SUPPLY_USES, use) ? SUPPLY_USES[use] : null;
    if (!spec) return { error: 'Unknown Supply use.' };
    if (g?.partyResourceSetupOpen1058 !== true || !currentQuest(g) || g.campaign?.downtime || ['Completed','Failed'].includes(g.campaign?.questStatus?.[currentQuest(g)])) return { error: 'Supply preparation is only available during Quest setup.' };
    if (balances(g).supply < spec.cost) return { error: 'Not enough Supply.' };
    if (number(g?.partySupplySetupSpent1058) + spec.cost > setupLimit(g)) return { error: 'The party has reached its Quest setup Supply limit.' };
    return { cost: spec.cost, spec };
  }
  function commitSupply(g, use, effectSucceeded) {
    const quote = canUseSupplyAtSetup(g, use);
    if (quote.error) return quote;
    if (effectSucceeded !== true) return { error: 'The preparation effect must succeed before Supply is charged.' };
    g.partySupplies33615 = balances(g).supply - quote.cost;
    g.partySupplySetupSpent1058 = number(g.partySupplySetupSpent1058) + quote.cost;
    return { spent: quote.cost, balance: g.partySupplies33615 };
  }
  const copy = v => v == null ? v : JSON.parse(JSON.stringify(v));
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o || {},k);
  const FIELDS = ['partyLore1058','partyEvidence1058','partySupplies33615','partyResourceQuest1058','partyResourceSpent1058','partySupplySetupSpent1058','partyResourceReceipts1058','partyResourceSetupOpen1058','partyResourceEnded1058','partyResourceEpoch1058','partyResourceCommands1058','partyResourceLimits1058'];
  const integer = n => Number.isSafeInteger(n) && n >= 0;
  function limit(g,type) { const n=g?.partyResourceLimits1058?.[type]; return integer(n) ? n : CAPS[type]; }
  function setupLimit(g) { const n=g?.partyResourceLimits1058?.setup; return integer(n) ? n : 2; }
  function scope(g) { return `${currentQuest(g)}:${g?.campaign?.instanceId32537 || g?.campaign?.questAttempt || ''}:${g?.partyResourceEpoch1058 ?? g?.questTransitionAuthority33626?.epoch ?? 0}`; }
  function terminal(g) { return g?.campaign?.downtime===true || ['Completed','Failed'].includes(g?.campaign?.questStatus?.[currentQuest(g)]); }
  function endQuest(g,retain=0) {
    if (!g || !currentQuest(g) || g.partyResourceEnded1058===scope(g)) return false;
    if (!integer(retain) || retain>balances(g).evidence) throw new Error('Invalid authored Evidence retention.');
    g.partyEvidence1058=retain;g.partyResourceSetupOpen1058=false;g.partyResourceEnded1058=scope(g);return true;
  }
  // Called only at a canonical setup transition (not when reconnecting or loading a save).
  function beginQuest(g,epoch,{retain=0,limits={}}={}) {
    if (!g || !currentQuest(g) || !integer(epoch) || !integer(retain) || retain>balances(g).evidence) throw new Error('Invalid Quest setup.');
    if (g.partyResourceEpoch1058===epoch && g.partyResourceQuest1058===currentQuest(g)+':'+String(g.campaign?.instanceId32537||g.campaign?.questAttempt||'')) return false;
    g.partyResourceEpoch1058=epoch;g.partyResourceQuest1058=currentQuest(g)+':'+String(g.campaign?.instanceId32537||g.campaign?.questAttempt||'');
    g.partyEvidence1058=retain;g.partyResourceSpent1058={};g.partySupplySetupSpent1058=0;g.partyResourceSetupOpen1058=true;g.partyResourceEnded1058=null;g.partyResourceLimits1058=copy(limits);return true;
  }
  function reconcile(g) { if (!g || !currentQuest(g)) return false; const q=questChange(g);return terminal(g)?endQuest(g)||q.changed:q.changed; }
  // Preserve authority through legacy client state snapshots, including replay receipts.
  function preserve(prior,next) {
    if(!prior||!next)return;
    for(const f of FIELDS){if(own(prior,f))next[f]=copy(prior[f]);else delete next[f];}
    questChange(next);if(terminal(next))endQuest(next);
  }
  function snapshot(g) {
    const b=balances(g);return {lore:b.lore,evidence:b.evidence,supplies:b.supply,partyResources1058:{scope:scope(g),spent:copy(g.partyResourceSpent1058||{}),setupOpen:g.partyResourceSetupOpen1058===true,setupSpent:number(g.partySupplySetupSpent1058),limits:{lore:limit(g,'lore'),supply:limit(g,'supply'),setup:setupLimit(g)}}};
  }
  // RESOURCE_STATE already has sequence checking in the browser ledger. Never apply
  // an omitted legacy field or a queued client resource edit as a new balance.
  function applySnapshot(g,r) {
    for(const [src,dst] of [['lore','partyLore1058'],['evidence','partyEvidence1058'],['supplies','partySupplies33615']])if(own(r,src)&&integer(r[src]))g[dst]=r[src];
    const m=r?.partyResources1058;if(m){g.partyResourceSpent1058=copy(m.spent||{});g.partyResourceSetupOpen1058=m.setupOpen===true;g.partySupplySetupSpent1058=number(m.setupSpent);g.partyResourceLimits1058=copy(m.limits||{});if(typeof m.scope==='string')g.partyResourceEpoch1058=number(m.scope.split(':').at(-1));}
  }
  function sourceReceipt(g,kind,id) { return `${kind}:${scope(g)}:${id}`.replace(/[^A-Za-z0-9:_-]/g,'_'); }
  function award(g,type,amount,kind,id) { if(type==='evidence'&&(!currentQuest(g)||terminal(g)))return {error:'Evidence requires an active Quest.'};return grant(g,type,amount,sourceReceipt(g,kind,id)); }
  // Only authored server-side reducers may call this; no generic player Evidence spend command.
  function spendEvidence(g,amount,receipt,authorized=false) {
    if(authorized!==true||!currentQuest(g)||terminal(g)||!Number.isSafeInteger(amount)||amount<=0||typeof receipt!=='string'||!receipt)return {error:'Evidence may only be spent by an authorized printed effect.'};
    const key=sourceReceipt(g,'evidence-spend',receipt);g.partyResourceReceipts1058??={};if(own(g.partyResourceReceipts1058,key))return {duplicate:true,spent:0};if(balances(g).evidence<amount)return {error:'Not enough Evidence.'};g.partyEvidence1058=balances(g).evidence-amount;g.partyResourceReceipts1058[key]=true;return {spent:amount,balance:g.partyEvidence1058};
  }
  function zones(g,h) {
    if(h==='Aldric')return {deck:g.heroDeck,hand:g.heroHand,discard:g.heroDiscard};
    if(h==='Lyra')return {deck:g.lyraDeck,hand:g.lyraHand,discard:g.lyraDiscard};
    if(h==='Seraphine')return {deck:g.seraphineDeck,hand:g.seraphineHand,discard:g.seraphineDiscard};
    return g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];
  }
  const body=(g,h)=>h==='Aldric'?g:h==='Lyra'?g.lyra:h==='Seraphine'?g.seraphine:g.heroRuntimeStates?.[h]||g.extraHeroes?.[h];
  const party=(g,h)=>Array.isArray(g.partyHeroes)&&g.partyHeroes.includes(h)&&!!body(g,h);
  const cardZones=(g,h)=>{const z=party(g,h)&&zones(g,h);return z&&['deck','hand','discard'].every(k=>Array.isArray(z[k]))?z:null};
  function recallable(c) {
    if(!c||typeof c!=='object')return false;
    const tags=[c.type,c.cardType,c.kind,c.category,c.class,c.actionType,c.tags,c.keywords].flat().filter(Boolean).join(' ');
    return !c.ultimate&&!c.isUltimate&&!c.spell&&!c.isSpell&&!/\b(?:spell|ultimate)\b/i.test(tags);
  }
  const describe=(c,i)=>({index:i,id:String(c?.id||''),name:String(c?.name||c?.id||'Card'),recallable:recallable(c)});
  const deckFor=(g,use,deck)=>use==='READ_AHEAD'?g.encDeck:deck==='search'?g.searchDeck:deck==='location'?g.pool:null;
  const permutation=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(x=>Number.isInteger(x)&&x>=0&&x<n)&&new Set(a).size===n;
  function preview(g,cmd,env={}) {
    const use=cmd.use;const q=use==='PREPARED_PACK'?canUseSupplyAtSetup(g,use):checkLore(g,use);if(q.error)return q;
    if(use==='READ_AHEAD'||use==='DECIPHER') {
      const d=deckFor(g,use,cmd.deck),n=use==='READ_AHEAD'?2:3;if(!Array.isArray(d)||d.length<n)return {error:`Requires ${n} cards in the selected stack.`};
      const cards=d.slice(0,n);return {cards:cards.map(describe),fingerprint:JSON.stringify([scope(g),use,cmd.deck||'',cards])};
    }
    if(use==='ARCHIVE_RECALL') {
      const z=cardZones(g,cmd.target);if(!z)return {error:'Choose a party Hero.'};const cards=z.discard.map(describe).filter(c=>c.recallable);if(!cards.length)return {error:'No eligible discard cards.'};return {cards,fingerprint:JSON.stringify([scope(g),use,cmd.target,z.discard])};
    }
    if(use==='PREPARED_PACK') {
      const z=cardZones(g,cmd.target);if(!z||(!z.deck.length&&!z.discard.length))return {error:'Choose a Hero with a card available to draw.'};
      // The shuffle is made once by the authority and held in the preview token.
      const deck=z.deck.length?z.deck.slice():env.shuffle?.(z.discard.slice());if(!Array.isArray(deck)||!deck.length)return {error:'No Hero card available.'};
      return {cards:[...z.hand,deck[0]].map(describe),drawDeck:deck,fingerprint:JSON.stringify([scope(g),use,cmd.target,z.deck,z.hand,z.discard])};
    }
    return {error:'No choice preview is required for this ability.'};
  }
  function execute(g,cmd,env={}) {
    const use=cmd.use,receipt=cmd.id;
    if(typeof receipt!=='string'||!receipt||receipt.length>200||['__proto__','constructor','prototype'].includes(receipt))return {error:'Invalid command ID.'};
    const records=g.partyResourceCommands1058||{};if(own(records,receipt)){const p=records[receipt];return p.scope===scope(g)&&p.actor===env.actor&&p.use===use?{...p.result,duplicate:true}:{error:'Command ID belongs to another request.'};}
    const supply=own(SUPPLY_USES,use),q=supply?canUseSupplyAtSetup(g,use):checkLore(g,use);if(q.error)return q;
    const target=cmd.target, pending=env.pending, peek=env.peek;
    if(['READ_AHEAD','DECIPHER','ARCHIVE_RECALL','PREPARED_PACK'].includes(use)){
      const check=preview(g,cmd,{shuffle:()=>peek?.drawDeck});if(check.error)return check;
      if(!peek||peek.fingerprint!==check.fingerprint)return {error:'Choice changed. Open a fresh preview.'};
      if(use==='READ_AHEAD'||use==='DECIPHER'){
        const d=deckFor(g,use,cmd.deck),n=use==='READ_AHEAD'?2:3;if(!permutation(cmd.order,n))return {error:'Invalid stack order.'};const top=d.slice(0,n);d.splice(0,n,...cmd.order.map(i=>top[i]));
      }else if(use==='ARCHIVE_RECALL'){
        const z=cardZones(g,target);if(!Number.isInteger(cmd.index)||!recallable(z.discard[cmd.index]))return {error:'Choose an eligible non-Spell, non-Ultimate Hero card.'};z.hand.push(z.discard.splice(cmd.index,1)[0]);
      }else{
        const z=cardZones(g,target),drawn=peek.drawDeck[0];if(!Number.isInteger(cmd.index)||cmd.index<0||cmd.index>z.hand.length||!drawn)return {error:'Choose a Hero card to discard.'};
        if(!z.deck.length){z.deck.push(...peek.drawDeck);z.discard.splice(0);}
        z.hand.push(z.deck.shift());z.discard.push(z.hand.splice(cmd.index,1)[0]);
      }
    }else if(use==='FOREWARNED'){
      if(!pending||pending.kind!=='encounter'||pending.severityMode!=='rolled'||!Number.isInteger(pending.baseRoll)||!Number.isInteger(pending.severity)||pending.severity<1||pending.truePaths33621?.chosen===null||pending.forewarned1058)return {error:'Forewarned requires an unresolved ordinary rolled Encounter Severity.'};
      pending.forewarned1058=true;pending.severity=Math.max(1,pending.severity-1);pending.text=pending.severity<=2?pending.card.a:pending.severity<=4?pending.card.b:pending.severity<=6?pending.card.c:pending.card.d;
    }else if(use==='SECOND_INTERPRETATION'){
      // Only an authored authoritative roll producer may construct this pending object.
      if(!pending||!['hazard','quest-roll'].includes(pending.kind)||pending.combat===true||pending.resolved||pending.rerolled1058||!Number.isInteger(pending.result)||!Number.isInteger(pending.sides)||pending.sides<2||!env.roll)return {error:'Requires an unresolved noncombat hazard or Quest roll.'};
      const result=env.roll(pending.sides);if(!Number.isInteger(result)||result<1||result>pending.sides)return {error:'Invalid authoritative reroll.'};pending.result=result;pending.rerolled1058=true;
    }else if(use==='FIELD_DRESSING'||use==='SHARED_PROVISIONS'){
      const targets=use==='FIELD_DRESSING'?[target]:cmd.targets;if(!Array.isArray(targets)||targets.length<1||targets.length>(use==='FIELD_DRESSING'?1:2)||new Set(targets).size!==targets.length||!targets.every(h=>party(g,h)&&Number(body(g,h).hp)>0))return {error:'Choose distinct living party Heroes.'};
      const n=use==='FIELD_DRESSING'?2:1;const heals=targets.map(h=>{const b=body(g,h),cap=env.maxHealth?.(g,h)??Number(b.maxHp);return [h,Math.max(0,Math.min(n,cap-Number(b.hp)))];});if(heals.some(([,v])=>!Number.isFinite(v)))return {error:'Invalid Hero Health.'};
      for(const [h,v] of heals){const b=body(g,h);b.hp+=v;}
    }else return {error:'Unsupported resource action.'};
    const result=supply?commitSupply(g,use,true):commitLore(g,use,receipt,true);if(result.error)return result;
    g.partyResourceCommands1058??={};g.partyResourceCommands1058[receipt]={scope:scope(g),actor:env.actor,use,result:copy(result)};return result;
  }
  return { CAPS, LORE_USES, SUPPLY_USES, FIELDS, balances, questChange, grant, checkLore, commitLore, canUseSupplyAtSetup, commitSupply, limit, setupLimit, scope, terminal, beginQuest, endQuest, reconcile, preserve, snapshot, applySnapshot, sourceReceipt, award, spendEvidence, zones, recallable, preview, execute };

});
