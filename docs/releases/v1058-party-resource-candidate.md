# v10.58 party resources — uncommitted candidate

Source: Ascendance_v10.58_Resources_Components_Integrated.xlsx, System Rules 031–033, Component Rules 031-001 through 033-037 and STD-058 through STD-062. Base inspected: RubberDuckieGod/ascendance-game main tree 4bc1e835a3a9655d290c22d07dd06027c974813a.

## Implemented candidate scope
- Preserve existing save field names (`partyLore1058`, `partyEvidence1058`, `partySupplies33615`) and legacy balances above newly defined caps. Normal new awards are capped at 12 Lore and 9 Supply; no universal Evidence cap. Explicit trusted rule overrides are supported.
- Server-owned receipts and Quest-attempt scope; cleanup ordinary Evidence on completion/failure/downtime; keep persistent items such as LT161. Explicit retain/spend APIs are for authored reducers only; never accept arbitrary Evidence spends from clients.
- Shared reducers for all five Lore effects and all three normal Supply setup uses. Server room command path and controls for Read Ahead, Decipher, Archive Recall, Forewarned and the three Supply options. Second Interpretation requires an unresolved authoritative noncombat hazard or Quest roll; current runtime does not produce this pending type, so its button is disabled until a producer exists.
- Add a pre-first-turn preparation window on canonical Quest setup; close on first Hero turn. Existing opening setup restores most Heroes to maximum Health, so healing may have no effect at that cap.
- Correct resource-packet ingestion; update all relevant ledgers and broadcast authoritative state to every peer. Receipt replay, stale preview, invalid card/target, and wrong-actor commands are rejected or idempotent.
- Preserve old Q013/Q014 Search award receipts. Add explicitly unconditional low-band Lore Encounter awards from the workbook. Never grant post-combat rewards when an Enemy is merely spawned.

## Not yet release-ready
- No complete Git checkout or Node dependencies were available in the authoring environment. Only retrieved source contexts, the exact existing resource rules/test blobs, the new modules and the extracted patched message branch were executed. No live browser, socket, PWA, full `npm test`, or full Playwright run was performed. Full checkout application and regression validation are required.
- Authored Q015 witness roll/Q016 suspect evidence, all printed Location and conditional or post-combat Encounter rewards, Quest-specific explicit resource spending and retention, and objective-threshold/marker reconciliation still need concrete runtime producers. Existing legacy reveal Supply choices continue through the prior generic resource pathway outside setup; this does not make every legacy Supply award independently server-authoritative. Solo/local spending is not wired. No new art is required for this candidate.
- Setup and Lore preview UI uses prompts consistent with the existing Read Ahead experience. The first successful transaction consumes the use; cancelled or stale previews do not spend. A cached client using the old Read Ahead command protocol should refresh to load the new controls.
- Do not deploy this candidate until the remaining producers and full multiplayer/browser regression suite are verified.
