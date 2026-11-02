# First Reveal and Q003 sealed armory audit

Source baseline: `main` `63ae60b`. Website only; isolated local fixtures and temporary room persistence.

## Authored behavior and confirmed source gaps

- **Reveal** is a placement event. `resolveLocationReveal` already checks `tile.revealResolved`; the Hero-entry functions do not call it. The Location panel nevertheless reprints the full Reveal Effect on every entry without saying it has been consumed. This audit does not equate redisplayed rules text with a repeated resource effect.
- **First Visit** is separate and shared by the Location: `tile.visited`. An Encounter-backed First Visit remains unconsumed until its Encounter resolves successfully. A Location containing a living Enemy postpones First Visit.
- **Ongoing entry effects** remain separate. For example, L043 Foggy Meadow explicitly has Hidden Movement for the first Hero entering each activation. These hooks are preserved.
- **Q003 / L017 / E001 / LT118:** defeating a Goblin Raider awards the unique Watchtower Vault Key. At Fallen Watchtower, a Hero spends 1 Action, returns LT118 to the Loot Deck, and draws 1 Equipment Card.
- The old armory implementation requires `questStatus('Q003') === 'Available'` for both execution and button display. Automatic victory therefore blocks the optional armory during Victory Exploration, even with the key and remaining Actions.
- The old opener removes LT118 from `partyQuestItems` but does not return it to `lootDeck`. Its equipment draw logs the item but provides no persistent acquisition notice beside the quest action.
- Kill-credit hooks are layered. Some historical closures call their private `recordKill32521`; other paths use global `creditKill3259`. Static inspection alone does **not** prove that the current shared Basic Attack misses the old award, because its `typeof recordKill32521` fallback normally selects `creditKill3259`.

## New implementation contract

`location-quest-rules-33627.js` supplies shared rules for an idempotent Raider key award, atomic armory transaction, canonical receipt preservation, quest-key resource constraints, and monotonic first-Reveal receipts. `location-quest-runtime-33627.js` supplies persistent key/reward text, the armory button throughout Q003 and its Victory Exploration, and an Inventory shortcut. It leaves movement and existing entry hooks intact.

Remote armory opening uses `MECHANICS_COMMAND / OPEN_Q003_ARMORY`. It validates the current living Hero, Location, key, general Action, available Equipment, and unopened armory before consuming anything. The same transaction commits the 1 Action cost, returned key, inventory item, deck removal, and receipt. Ordinary client patches cannot forge or erase the armory flags. Ordinary resource updates cannot acquire, duplicate, lose, or consume LT118 behind this transaction.

Remote first-Reveal resolution uses `EXPLORATION_COMMAND / REVEAL_RESOLVE` after the existing effect executes. Placement records the revealing Hero and round; only that Hero can commit the receipt. This receipt-only command remains permitted after placement spends the Hero's final Action and auto-passes them. It does not loosen gameplay action guards or grant a resource reward. Canonical tile receipts survive stale snapshots and reconnects.

## Verification

- `tests/location-quest-33627-rules.test.cjs`: **13/13 passed**. Covers actual key/inventory state, duplicate protection, local historical kill closures, phase/trap reconciliation, Victory Exploration eligibility, refusal without partial consumption, receipt preservation, and rejected forged flags.
- `tests/location-quest-33627-server-rules.test.cjs`: **2/2 passed against an isolated scratch copy with the proposed integration patch**. Exercises actual WebSocket room commands in an active Quest and Victory Exploration, real disk restart, foreign actor refusal, duplicate command IDs, stale q/reveal patches, and the first-Reveal receipt boundary after final-Action placement.
- The server test initially found that the ordinary turn guard rejected the receipt after placement auto-passed the Hero. The bounded receipt authorization fixes that failure; the updated tests pass.
- Root's baseline browser run against unchanged `63ae60b`: the **two once-only L006 Gold cases pass**, including two clients/re-entry/reconnect. A repeated resource effect was not reproduced. The **six armory cases fail**: the three active-Quest cases at missing key/usability text in the quest panel; the three victory cases at the hidden armory button. The preceding real Basic Attack/key-state assertions pass in all six, establishing that this current Basic Attack path already acquires LT118.
- `tests/audit/reveal-armory-33627.spec.cjs` has eight scenarios. Active/victory armory cases cover offline solo, online one Hero and two clients; once-only L006 Gold cases cover offline solo and two clients/reconnect. Assertions require actual key/inventory/deck/Action/receipt state and visible usability/reward text. Post-integration browser execution is coordinated by the root agent; this file does not claim those cases have passed after the fix.

Integration proposal: `/tmp/asc-location-33627/location-quest-integration.patch`. The source audit agent did not directly edit shared `index.html` or `server.js`.

## Separate source discrepancy

L003's current printed Reveal says "Each Hero here may recover 1 Health", while the historical handler offers healing only to the revealing Hero, who normally remains on the preceding tile. This recipient discrepancy is separate from once-only semantics and has not been changed by this patch.
