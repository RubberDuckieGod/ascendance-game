# Reproducible findings

Baseline: `10873435402f9ac02075c85bbc76c603e7b93fa3`, package 3.36.21. Tests change no application implementation.

## D001 — Mordren cannot resolve ordinary non-Attack damage

Severity: high. Confirmed on the local served production browser code.

Reproduce: `CHROMIUM_PATH=/usr/bin/chromium npx playwright test mechanics --grep 'Mordren: damage'`.

The fixture runs `init('Q001', ['Mordren'])`, records Health, then calls the real `damageHeroBy('Mordren', 2, 'audit')` without accepting any Reaction. Expected: lose 2 Health, then permit normal healing. Actual: `TypeError: globalThis.key is not a function` at `public/hero-card-parity-33611.js:179` before the ordinary damage completes. The protection wrapper attempts `globalThis.key(pos(h).x,pos(h).y)` while the core `key` binding is not a Window property. This reproduces even without a Bone Servant. Other callers of this global helper need separate regression fixtures; their coverage must not be inferred from this failure.

## D002 — Documented regression gates are absent from the repository

Severity: high for release validation; not an application behavior defect.

Reproduce: `npm test` and `npm run stability:33621` from the repository root.

Expected: run the documented simulator and stability suite. Actual: Node reports `MODULE_NOT_FOUND` for `tests/ascendance-sim.js`; Python reports missing `tests/run-stability-33621.py`. Git contains neither runner nor the other historical regression suites described in release notes. Historical 438/438 and stress results cannot be reproduced from this checkout. New tests do not replace those historical suites.

## D003 — Equipment coverage diagnostic is stale for EQ116

Severity: low for diagnostics; the dedicated gameplay test passes.

`public/equipment-loot-parity-33612.js:329` still lists `EQ116 Hero attack-die reroll` in `knownRuleBlocks`. The later 3.36.13 patch replaces that rule with deterministic Channel. The authored-card test verifies normal +1, Arcane +2, and once-per-round behavior. Do not count the old diagnostic as proof that the current item is blocked.

## Unsupported printed rules

EQ013, EQ025, EQ044, EQ055, EQ068, EQ103, LT012, LT026, LT150, and LT159 remain unsupported or dependent on missing foundational rules according to runtime diagnostics and source inspection. The two consumable preservation tests only verify safe refusal; they do not make Rest or Lockpick gameplay operational. See REPORT.md for each missing rule. Separate rule decisions and implementation work are needed before those effects can be certified.

## D004 — Summon cards throw instead of creating legal tokens

Severity: high. Confirmed using fresh valid empty-tile fixtures with enough Actions, the authored card in hand, and zero tokens already in play.

Reproduce: `CHROMIUM_PATH=/usr/bin/chromium npx playwright test summons`.

Affected cards verified by these fixtures: H014-009 Raise Bone Servant, H014-019 Army of Bones, H016-009 Place Spirit Totem, and H016-019 Grand Totem. Expected: create at least one corresponding token at the Hero's Location, within the ordinary limit (Grand Totem also permits an exception). Actual: `TypeError: globalThis.key is not a function`, originating in `hero-card-parity-33611.js`'s manual-card resolver. These are the same missing-global-helper family as D001. A generic observation also records the error for H014-005 Servant Assault, but that observation lacks a valid Bone Servant prerequisite and is not separately certified as a valid gameplay defect.

## D005 — Repeated completed-Quest resolution deducts Gold again

Severity: medium. Confirmed at the campaign reward API boundary; a normal UI sequence that calls it twice is not established.

Reproduce: `CHROMIUM_PATH=/usr/bin/chromium npx playwright test world --grep 'solo completion'`.

For a solo Q001 run without the all-villagers bonus, the printed 75 Gold scales to 55 Gold (75 × 0.75 rounded to a multiple of 5). After the first completion, record Gold, XP and Day, then call `resolveQuestAttempt('Completed')` again. Expected: completed-Quest guard preserves all rewards and Day. Actual: the party-size reward wrapper subtracts another 20 Gold despite the inner completed-Quest guard refusing another reward. The wrapper at `public/index.html:8281` applies its delta without checking whether a new completion reward occurred.

The initial campaign fixture expected unscaled Gold and immediate downtime. Those assumptions were corrected after source inspection: solo rewards scale, and completion intentionally leaves free exploration active before proceeding to downtime. Those two behaviors are not reported as defects.
