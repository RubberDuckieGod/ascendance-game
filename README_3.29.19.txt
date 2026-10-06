Ascendance 3.29.19 — Ranged Connection Targeting + Warpath Destination Choice

Fixes:
- Grave Bolt (H014-001) and other generic Hero cards with printed ranges such as "Within 2 Connections" now correctly parse and use their numeric graph range. A double-escaped digit regex had been treating those generic ranged cards as Range 0.
- Warpath (H012-015) now always asks Garruk's player to choose a connected revealed Location before moving, even when only one legal destination is currently detected. Cancel leaves the card unspent.
- Warpath still grants +1 Attack to Garruk's next Attack this turn when he moves into a Location containing an Enemy.
- Preserves all 3.29.18 multiplayer/start, Aldric equipment, Sweeping Cleave, Pass/Hold, and Woodland Clearing fixes.

Validation:
- Existing regression suite: 438 / 438 passed.
- 3.29.19 targeted static checks: 5 / 5 passed.
- 3.29.19 live browser checks: Grave Bolt at exactly 2 connections PASS; Warpath explicit destination selection PASS.
