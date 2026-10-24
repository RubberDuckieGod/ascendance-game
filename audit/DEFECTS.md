# Reproducible baseline findings

The new Gold/loot rollback root cause and reproduction are in [RESOURCE_ROLLBACK_33623.md](RESOURCE_ROLLBACK_33623.md).

The new Downtime, Snare, quest-payout and restart findings are in [DOWNTIME_SNARE_33622.md](DOWNTIME_SNARE_33622.md). The findings below retain the original audit baseline.

The findings below describe the original audit baseline. The fix branch repairs D001, D003, D004 and D005 and implements the ten missing item mechanics. D002 now has clearly identified replacement runners; the historical sources were not recovered. See [IMPLEMENTED_RULES.md](IMPLEMENTED_RULES.md) and the current [REPORT.md](REPORT.md) for validation and remaining coverage limits.

Baseline: `10873435402f9ac02075c85bbc76c603e7b93fa3`, package 3.36.21. The original audit changed no application implementation; this remediation branch does.

## D001 — Mordren cannot resolve ordinary non-Attack damage

Severity: high. Confirmed on the local served production browser code.

Reproduce: `CHROMIUM_PATH=/usr/bin/chromium npx playwright test mechanics --grep 'Mordren: damage'`.

The fixture runs `init('Q001', ['Mordren'])`, records Health, then calls the real `damageHeroBy('Mordren', 2, 'audit')` without accepting any Reaction. Expected: lose 2 Health, then permit normal healing. Actual: `TypeError: globalThis.key is not a function` at `public/hero-card-parity-33611.js:179` before the ordinary damage completes. The protection wrapper attempts `globalThis.key(pos(h).x,pos(h).y)` while the core `key` binding is not a Window property. This reproduces even without a Bone Servant. Other callers of this global helper need separate regression fixtures; their coverage must not be inferred from this failure.

## D002 — Documented regression gates are absent from the repository

Severity: high for release validation; not an application behavior defect.

Reproduce: `npm test` and `npm run stability:33621` from the repository root.

Expected: run the documented simulator and stability suite. Actual: Node reports `MODULE_NOT_FOUND` for `tests/ascendance-sim.js`; Python reports missing `tests/run-stability-33621.py`. Git contains neither runner nor the other historical regression suites described in release notes. Historical 438/438 and stress results cannot be reproduced from this checkout. The new replacement runners exercise the checked-in tests; they do not reproduce the unavailable historical suites.

## D003 — Equipment coverage diagnostic is stale for EQ116

Severity: low for diagnostics; the dedicated gameplay test passes.

`public/equipment-loot-parity-33612.js:329` still lists `EQ116 Hero attack-die reroll` in `knownRuleBlocks`. The later 3.36.13 patch replaces that rule with deterministic Channel. The authored-card test verifies normal +1, Arcane +2, and once-per-round behavior. Do not count the old diagnostic as proof that the current item is blocked.

## Unsupported printed rules

**At the baseline**, EQ013, EQ025, EQ044, EQ055, EQ068, EQ103, LT012, LT026, LT150, and LT159 were unsupported or dependent on missing foundational rules according to runtime diagnostics and source inspection. The fix branch implements these ten mechanics with explicit rule definitions and positive/negative regression scenarios. The two consumable preservation tests only verify safe refusal; they do not make Rest or Lockpick gameplay operational. See REPORT.md for each missing rule. Separate rule decisions and implementation work are needed before those effects can be certified.

## D004 — Summon cards throw instead of creating legal tokens

Severity: high. Confirmed using fresh valid empty-tile fixtures with enough Actions, the authored card in hand, and zero tokens already in play.

Reproduce: `CHROMIUM_PATH=/usr/bin/chromium npx playwright test summons`.

Affected cards verified by these fixtures: H014-009 Raise Bone Servant, H014-019 Army of Bones, H016-009 Place Spirit Totem, and H016-019 Grand Totem. Expected: create at least one corresponding token at the Hero's Location, within the ordinary limit (Grand Totem also permits an exception). Actual: `TypeError: globalThis.key is not a function`, originating in `hero-card-parity-33611.js`'s manual-card resolver. These are the same missing-global-helper family as D001. A generic observation also records the error for H014-005 Servant Assault, but that observation lacks a valid Bone Servant prerequisite and is not separately certified as a valid gameplay defect.

## D005 — Repeated completed-Quest resolution deducts Gold again

Severity: medium. Confirmed at the campaign reward API boundary; a normal UI sequence that calls it twice is not established.

Reproduce: `CHROMIUM_PATH=/usr/bin/chromium npx playwright test world --grep 'solo completion'`.

For a solo Q001 run without the all-villagers bonus, the printed 75 Gold scales to 55 Gold (75 × 0.75 rounded to a multiple of 5). After the first completion, record Gold, XP and Day, then call `resolveQuestAttempt('Completed')` again. Expected: completed-Quest guard preserves all rewards and Day. Actual: the party-size reward wrapper subtracts another 20 Gold despite the inner completed-Quest guard refusing another reward. The wrapper at `public/index.html:8281` applies its delta without checking whether a new completion reward occurred.

The initial campaign fixture expected unscaled Gold and immediate downtime. Those assumptions were corrected after source inspection: solo rewards scale, and completion intentionally leaves free exploration active before proceeding to downtime. Those two behaviors are not reported as defects.

## Additional defects found during remediation

- **Rapid Fire synchronization:** the new native two-client scenario initially left shared Enemy Health at 100 after a volley: the finish command caused a server snapshot before debounced combat changes were sent. The fix flushes the combat ledger before finishing the Action and keeps turn ownership pending through both shots, including the final Action. Reproduce with `npx playwright test native-rapid`.
- **SE033 Staggered:** equipment could apply the Condition, but neither the Enemy Attack calculation nor Hero Attack hooks consumed its documented -1 Attack penalty. The fix applies the penalty for exactly one Attack. Reproduce with `npx playwright test unsupported --grep SE033`; the assertions include actual Enemy-phase Health loss and all 16 Hero Attack paths.
- **Runtime Hero Attack lookup:** `heroAttackValueFor()` used Aldric’s Attack as its fallback for the 13 runtime Heroes. This also gave strongest-Hero Enemy targeting the wrong ranking. It now reads `extraAttack(hero)` for those Heroes. Reproduce with `npx playwright test unsupported --grep strongest-Hero`.

- **Native client snapshot feedback:** a normal Attack sent the correct -5 Enemy Health delta, then a stale room snapshot was interpreted as a local +5 heal and sent back. Rest could likewise be applied again by the Hero ledger (10 → 13 → 16 instead of 10 → 13). Full room snapshots now apply without scheduling outgoing mutations and rebase the affected ledgers; pending server mechanics commands suppress speculative client ledger flushes. Reproduce with `npx playwright test native`.
- **Premature local Enemy Phase:** legacy automatic-round checks treated unstarted multiplayer Heroes’ 0 Actions as completed turns before the adventure had started, opening a local Reaction overlay. Remote shared phases now require the server’s resolution token even during lobby/startup. The native button scenarios assert that the Reaction overlay stays hidden before a Hero Attack.
- **Remove-only lethal combat diffs:** the browser removes a defeated Enemy from its tile rather than sending a separate Health delta. The server removed it but reported `hpAfter` as its previous positive Health, so Night’s Whisper did not recognize a lethal weapon Attack. The ledger now records removed combat targets at 0 Health. Normal Action transactions flush combat immediately after their Action cost and retain turn authority until the committed Attack settles.

- **Obsolete remote snapshot watcher:** `mpStartWatcher()` still ran after remote connects even though the consolidated protocol only intended explicit Action ledgers to submit changes. Every incoming state could schedule another large compatibility snapshot and more state requests, delaying command acknowledgements and exposing stale state races. The watcher is now restricted to local broadcast play. The four native-client cases pass with remote gameplay using the explicit ledgers.

- **Startup dependency ordering on fast runners:** GitHub Actions reached gameplay functions before the delayed Hero Ability layer had installed. Bloodrage then missed its damage trigger; an Orb extra turn could also lack a turn counter and leave Rest marked used. The mechanics runtime now waits for the Ability, card parity and equipment pipelines before publishing its API, and local extra turns can initialize their counter independently. Gameplay fixtures wait for that readiness point rather than relying on machine speed. The original numeric assertions are unchanged. The workflow retains separate suite JSON files, the foundation log and command outcomes so CI failures remain reviewable.
