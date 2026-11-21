# Ascendance 3.36.15 — Generic Reveal Effect Runtime Parity

Baseline: **3.36.14 — v10.52 Website Content Sync**. Workbook source: **Ascendance v10.52 — Location Ongoing Effect Clarification**.

## Scope

This release makes the generic Reveal Effect text added in v10.52 executable in the browser game instead of display-only.

- Covers **149 Location IDs**: `L000` and `L088`–`L235`.
- Covers **43 distinct printed generic Reveal Effect patterns**.
- Keeps the `Scenario Reveal — ...` suffix owned by the existing Quest/Campaign reveal hooks so scenario setup is not executed twice.
- Existing legacy Location Reveal handlers remain in place for the older Location set.

## Runtime coverage

The new dispatcher handles:

- Health recovery and harmful-Condition removal.
- Inspired and temporary Attack/Armor bonuses.
- Free movement and free Search.
- Search-card rewards that do **not** consume the Location's normal Search limit.
- Search-card + discard effects.
- Gold, Party Supply, and Gold/Supply choices.
- Source-matched Loot.
- Location-stack inspection and top/bottom/reorder choices.
- Encounter-deck inspection and top/bottom/reorder choices.
- Discard-a-Hero-card-or-suffer-damage effects.
- Stonebrook's starting-tile Home Base Reveal Effect.

## Multiplayer authority

- Added **Party Supply** to the synchronized room resource snapshot.
- Added room-authoritative Encounter-deck reorder command support.
- Encounter reorder preserves duplicate Encounter Card IDs.
- Reveal-generated Search transactions persist `consumeSearch`, so room authority does not accidentally consume a Location Search for a Search-card reward.

## Important Search correction

The later workbook Search resolver had been incrementing `searchCount` unconditionally, which overrode the earlier non-consuming Search implementation. 3.36.15 corrects the final resolver so a Reveal Effect such as **Salvageable Cargo — Draw 1 Search card** leaves the Location Search limit unchanged, while **Hidden Seam — immediately Search this Location** consumes the normal Search as printed.

## Validation

- Core simulator: **438 / 438 passed**.
- Chromium Reveal Runtime regression: **PASS** with **0 page errors**.
- Runtime audit: **43/43 patterns mapped; 149/149 new Location IDs handled; 0 unmapped effects**.
- Real Search resolution test: non-consuming Reveal Search remains at Search count `0`; free Search increments to `1`.
- Source-matched Loot test: item added to the revealing Hero's Inventory.
- Build marker remains **3.36.15** after delayed legacy version scripts.
- `server.js`, `content-sync-33614.js`, and `reveal-runtime-33615.js` pass JavaScript syntax checks.
