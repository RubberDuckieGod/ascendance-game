# Ascendance 3.27.50 — Self-Diagnosing Playtest Recorder

Adds a much richer DEBUG REPORT export intended to be pasted directly into ChatGPT. The report now captures the complete party state, each Hero's HP/Actions/Pass state/position/equipment/status/hand, board tiles and living enemies, Search/Encounter/Explore ownership and visibility, quest/spawn flags, recent Adventure Log entries, recent UI button clicks, card-play attempts/results/errors, multiplayer revisions, phase transitions, and automatic anomaly findings.

Use: play until something looks wrong, click DEBUG REPORT, then COPY FULL REPORT and paste/upload it.

All 3.27.48 gameplay fixes are preserved.
# Ascendance 3.27.46 — Custom Hero Card + Location Compatibility Audit

- Audited the full embedded Hero-card database for Custom Hero action compatibility.
- Added Custom Hero adapters for legacy H001/H002/H006 action cards so copied cards use the Custom Hero's own stats, position, hand, conditions, and allies.
- Preserved the existing audited H003-H010 expanded-Hero card engine for Custom Heroes.
- Search Deck SD001-SD100 remains workbook-driven and resolves against the searching Hero, including Custom Heroes.
- Added missing Location Reveal implementations for L004 River Crossing, L010 Goblin Encampment, and L013 Ancient Stone Bridge.
- Location rewards/effects are applied to the revealing Hero, including Custom Heroes.
- Includes all 3.27.45 multiplayer ownership, spawn scaling, deck repair, Overloaded Reactor, and Aldric equipment fixes.

DEBUG remains enabled for playtesting.


## 3.27.47 — Spawn Replacement + Meteor Shard Hotfix
- Q001 player-count scaling is now one-time opening setup only. Killing a scaled Goblin can never cause the scaler to add a replacement.
- Custom Hero Meteor Shard snapshots every enemy in the chosen Location and makes a basic Attack against each one.
- Meteor Shard Burning rider applies only when the caster is in an Arcane Location.


## 3.27.48 Pass / Hold Actions Repair
- Pass state is round-scoped.
- The authoritative client re-evaluates pass completion after synchronized state is applied.
- The Enemy/World/End phase resolves once when every living Hero has either spent all Actions or Passed.
- Stale pass flags cannot carry into the next round.

## 3.27.52 Automated Simulation Suite
Adds `tests/ascendance-sim.js` and `npm test`. The suite extracts the embedded workbook database, verifies all 203 Hero cards have runtime implementation references, checks all 100 Search cards are present, audits multi-target card handlers for multi-target runtime evidence, and runs deterministic state-machine simulations for Pass/action locking, held Reactions, round advancement/reset, Q001 setup-only scaling, and AoE target snapshots. Results are written to `tests/simulation-report.json`.

This is the baseline regression harness. A card reference/coverage PASS proves implementation coverage, not yet full semantic equivalence for every sentence of every card. Behavioral scenario tests are being added mechanic-by-mechanic so future regressions fail automatically instead of relying on manual playtesting.


## 3.27.52 — Per-card behavioral contracts
`npm test` now creates one independent rule-contract scenario for every embedded Hero card in addition to the existing regression suite. The contract report records the printed rules and expected simulated state for each card. This is a semantic oracle layer; cards with complex prompts, reactions, timing windows, or bespoke effects still require production-runtime adapters before they can honestly be called fully behaviorally proven.

## 3.27.53 — Production runtime contract bridge
- Fixes the 3.27.49 debugger wrapper so `playExtraCard` preserves the production one-card argument contract instead of accidentally passing `(hero, card)` into a one-argument runtime handler.
- Adds a true-EOF 3.27.53 runtime marker and browser-runtime audit hook.
- Adds a browser execution test that loads the actual production HTML/JavaScript, verifies the final card dispatcher contract, and executes the real Pass/action-lock path against the live game state.
- The Node contract suite remains the exhaustive 203-card semantic inventory. Browser-runtime execution is now a separate gate so source contracts and actual wrapped production functions cannot silently diverge.
