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
