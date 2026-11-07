# Q003 → Q004 findings

Investigation baseline: `63ae60b` (`main` at the start of this work). No live rooms, accounts or saves were used.

The authored WE001 advance condition is **Q001 and Q002 completed, or five Campaign Days used**. Q003 is Optional. Completing Q003 alone does not permit starting Q004. With all three complete, WE001 additionally grants each surviving Hero 50 XP, records +1 Party Morale, and records removal of one Goblin Scout from Q004. The latter two recorded effects need their own real consumer assertions before certification.

## Confirmed source defects

1. `advanceWorldEvent` in `index.html` changes `activeEvent` to WE002, `currentQuest` to Q004 and Day to 1, then only calls `render()`. It never schedules or sends campaign persistence. The removed remote mutation watcher no longer supplies an implicit write.
2. `startCampaignQuest` is wrapped by `quest-transition-runtime-33626.js`. Its remote command copies the **local** current Quest into `fromQuest`. After the unsaved advance this is Q004; the server's canonical current Quest is still Q003. `quest-transition-rules-33626.js` correctly rejects the mismatched source Quest. A later unrelated snapshot can also restore the previous World Event metadata.
3. Adding a delayed `mpScheduleState()` alone leaves a race between the 35 ms compatibility-patch timer and the next Begin command. It also does not establish an independent canonical World Event reward contract. The generic compatibility route preserves canonical resources, while its `worldEventAdvance` exception validates only event/Quest/day identity, unchanged history and completed required Quests.
4. The base downtime renderer lists only Q001–Q003 as playable, but the installed Campaign II wrapper adds all available Quests from the current World Event. Thus the base renderer's filter is not, by itself, proof that Q004's Begin control is absent in the served game.

A bounded VM execution extracted the native `advanceWorldEvent` function unchanged and supplied mock render/log/event lookup functions. Given WE001/Q003/Day 4 with Q001, Q002 and Q003 Completed, it produced WE002/Q004/Day 1 and **zero calls to `mpScheduleState`**. This source-level result does not substitute for the connected regression below.

## Integrated correction

The new `world-event-chain-rules-33627.js` and `world-event-chain-runtime-33627.js` implement a separate confirmed advancement step. The original Advance and Begin labels keep their separate meaning: advancing retains the completed Quest board in Downtime; Begin then uses the existing atomic Quest setup to construct fresh Q004 at Round 1.

The command sends only a durable ID, expected revision, source event, source Quest and Quest epoch. The server derives the next authored event, Day 1, available Quests and settlement from canonical data. It checks host/participation, unchanged source identity, complete required Main Quests or an actual final-day outcome in Quest history, and no active phase. The typed 24-event table preserves explicit Main/Optional ordering, including the Optional middle Quests in later campaigns.

For all-three WE001 it adds exactly 50 XP to each living Hero, preserves resources/history/board, records the existing Morale/Q004 effect strings and saves a settlement receipt. Existing regional completionist XP/track/item/faction hooks have typed canonical values. Other printed event clauses without independent consumers are not certified by recording their text.

The integrated server adapter increments the Quest epoch, advances all ledger sequence baselines, persists before acknowledgment, broadcasts canonical snapshots and preserves World Event receipts across compatibility patches and the subsequent Quest setup. Ordinary client snapshots cannot perform a manual World Event advance. Repeated commands return the existing receipt and current canonical game, including after the separate Q004 setup and process restart.

The runtime keeps the old campaign until confirmation, disables Begin/Advance while pending and retries the same request ID at most four times. It rebases every domain on confirmation. A normal final-day Hero completion queues the World Event step until its Quest reward save confirms; the host can then settle it from the saved outcome. The pre-existing phase worker still owns forced advancement inside its established atomic phase result. Its separate World Event settlement/epoch adoption is outside the new tests and must not be inferred from them.

## Regression execution

`tests/audit/quest-chain-33627.spec.cjs` covers the Optional gate, solo all-three settlement, one connected Hero, and two native clients. It uses the real Advance and Begin controls and introduces no arbitrary timing delay between them. It checks fresh Q004/WE002/Day 1/Round 1, exact +50 Rowan XP, unchanged resources/history, no source-Quest rejection, peer agreement, and reload/rejoin persistence. Its readiness check includes the new World Event runtime when loaded. All four scenarios pass within the complete ca4a216 hosted run's 420 scenarios. Current source/run identity and the separate earlier focused checkpoints are recorded in [VALIDATION.md](VALIDATION.md).

Seven Node checks are included in the integrated `npm test`: six pure rules checks plus an actual isolated HTTP/WebSocket test against `server.js`. The server test checks a foreign peer, stale revision/source, exact settlement, durable duplicate handling, old-epoch write rejection, stripping protection, separate Q004 setup, disk persistence and process restart. Reproduce with `node --test tests/world-event-chain-33627-rules.test.cjs tests/world-event-chain-server-rules.test.cjs`. Current outcomes and source identity are in [VALIDATION.md](VALIDATION.md); these server assertions remain distinct from the native browser scenarios.

Full effect certification remains incomplete. The separate [Hero-card inventory](HERO_CARD_EFFECT_INVENTORY_33627.md) enumerates all 323 Hero cards and distinguishes the nine original simple-Attack assertions and the additional scoped card oracles from complete printed-clause coverage; generic dispatcher runs do not certify the other printed clauses.
