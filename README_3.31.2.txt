ASCENDANCE 3.31.2 — ROOM AUTHORITY CONSOLIDATION

Built from 3.30.10 Normal Post-Quest Rules.

3.31.0 — Cards / Decks / Inventory / Loot Authority
- The room now keeps a canonical resource ledger for each participating Hero's Deck, Hand, and Discard.
- Inventory quantities, equipped items, Quest Items, Loot Deck/Discard, Equipment decks, Party Gold, Reputation, XP, Levels, professions, and crafting state are included in the room ledger.
- Resource changes use a monotonically increasing sequence and one-command-at-a-time optimistic commit.
- A stale resource command is rejected and refreshed from the canonical room state.
- Old whole-game snapshots cannot restore a played/discarded card, used consumable, spent Gold, consumed Quest Item, or older Loot/Equipment deck state.
- Reconnect explicitly requests the room resource ledger.

3.31.1 — Enemy / World / End Phase Transaction Authority
- Only the room-issued resolver token may commit a phase-resolution result.
- The server validates that the resolution cannot change the party roster, skip rounds, or regress a round except for the verified failed-Quest retry reset.
- A committed phase transaction updates the canonical room baselines atomically and broadcasts Turn, Hero, Combat, Exploration, Resource, and Phase state.
- IMPORTANT: authored Enemy/World rule calculations are still evaluated by the single designated resolver client; the room/server owns authorization, validation, and the only legal commit. This keeps one authoritative phase result without duplicating the large authored rules engine on both client and server.

3.31.2 — Legacy Snapshot Demotion
- Whole-client STATE snapshots are compatibility patches only.
- Server-owned ledgers overwrite every migrated domain before a snapshot may commit:
  Turn / Actions / Pass / Round / Phase
  Enemy HP / movement / conditions / defeat tombstones
  Hero HP / movement / conditions / core flags
  Exploration / Search / Encounter / First Visit / pending prompts
  Cards / decks / inventory / equipment / Loot / Gold / progression resources
- The old remote mutation watcher is not an authority source.
- Reconnect asks each canonical ledger for the current state.

Preserved from 3.30.10
- After a completed Quest, play continues under normal rules until Proceed to Downtime.
- Normal rounds, Actions, Draw Step, Enemy/World phases, Downed/death rules, Explore/Search costs, and room Action validation remain active.

Verification
- npm simulation suite: 438 / 438 PASS
- Room authority 3.30.0 unit: PASS
- Combat authority 3.30.1 unit: PASS
- Quest failure reset 3.30.2 unit: PASS
- Hero authority 3.30.3 unit: PASS
- Search terminal commit 3.30.7 unit: PASS
- Post-Quest rules 3.30.10 unit: PASS
- Resource + Phase authority 3.31.2 unit: PASS
- Targeted Chromium checks: 5 / 5 PASS
- server.js syntax: PASS
- index.html and public/index.html must remain byte-identical.
