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
    SECOND_INTERPRETATION: { cost: 2, label: 'Second Interpretation', frequency: 'once per party per Quest', effect: 'Reroll one noncombat hazard check; keep the new result.' },
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
    const next = String(questId || currentQuest(g)) + ':' + String(g?.campaign?.instanceId32537 || g?.campaign?.questAttempt || '');
    if (!next) return { error: 'Quest ID is required.' };
    // A receipt is saved with the room; reloads cannot reset the same Quest.
    if (!g.partyResourceQuest1058) { g.partyResourceQuest1058 = next; return { changed: false }; }
    if (String(g.partyResourceQuest1058) === next) return { changed: false };
    g.partyResourceQuest1058 = next;
    g.partyEvidence1058 = 0;
    g.partyResourceSpent1058 = {};
    g.partySupplySetupSpent1058 = 0;
    return { changed: true, evidenceCleared: true };
  }
  function grant(g, type, amount, receipt) {
    if (!g || !['lore', 'evidence', 'supply'].includes(type) || !Number.isSafeInteger(amount) || amount <= 0) return { error: 'Invalid resource grant.' };
    if (!receipt || !/^[A-Za-z0-9:_-]{1,150}$/.test(String(receipt))) return { error: 'A unique source receipt is required.' };
    g.partyResourceReceipts1058 = g.partyResourceReceipts1058 || {};
    if (g.partyResourceReceipts1058[receipt]) return { granted: 0, duplicate: true, balance: balances(g)[type] };
    const key = type === 'lore' ? 'partyLore1058' : type === 'evidence' ? 'partyEvidence1058' : 'partySupplies33615';
    const prior = balances(g)[type], maximum = type === 'evidence' ? Number.MAX_SAFE_INTEGER : CAPS[type];
    const granted = Math.max(0, Math.min(amount, maximum - prior)); // Never shrink legacy balances above the new cap.
    g[key] = prior + granted;
    g.partyResourceReceipts1058[receipt] = true;
    return { granted, balance: g[key] };
  }
  function checkLore(g, use) {
    const spec = LORE_USES[use];
    if (!spec) return { error: 'Unknown Lore use.' };
    if (balances(g).lore < spec.cost) return { error: 'Not enough Lore.' };
    const scope = String(g?.campaign?.instanceId32537 || currentQuest(g));
    if (!scope) return { error: 'An active Quest is required.' };
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
    const spec = SUPPLY_USES[use];
    if (!spec) return { error: 'Unknown Supply use.' };
    if (g?.partyResourceSetupOpen1058 !== true) return { error: 'Supply preparation is only available during Quest setup.' };
    if (balances(g).supply < spec.cost) return { error: 'Not enough Supply.' };
    if (number(g?.partySupplySetupSpent1058) + spec.cost > 2) return { error: 'The party can spend at most 2 Supply during normal Quest setup.' };
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
  return { CAPS, LORE_USES, SUPPLY_USES, balances, questChange, grant, checkLore, commitLore, canUseSupplyAtSetup, commitSupply };
});
