# Ascendance 3.0.15 — Lyra Remote Control Fix

The screenshot exposed two remaining places that still used the old shared-Aldric/activeHero assumptions.

Fixes:
- Clicking a connected map tile now routes movement through `controlledHero()`. A Lyra client calls `moveLyra()` instead of the Aldric-only `move()`.
- The main Hero summary panel now displays the locally controlled Hero. Lyra clients show Lyra Nightshade with Lyra HP, Armor, Attack, and Actions; Aldric clients show Sir Aldric.
- Remote ownership/hand filtering from 3.0.14 remains intact.
- Party public information remains visible for both Heroes.

The Search-while-Engaged and revised First Visit rule are intentionally not included yet; this build isolates the remote-control repair.
