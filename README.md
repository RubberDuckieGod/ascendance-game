# Ascendance 3.25.17 — Q001 Playtest Consolidated Fixes

Full multiplayer project. Built from 3.25.16.

Fixes: Unyielding Stand ally +1 Armor; Rally selects up to two Heroes; Leyline Convergence applies its Arcane Location, first-card discount, and already-Arcane draw; direct Hero-card damage credits kills; Frost Nova explicitly auto-attacks all enemies and only prompts for its post-damage move choice; failed Quest resets preserve the Adventure Log.

# Ascendance 3.25.16 — Q001 Villager Failure Fix

Full multiplayer project.

## Fix
- Q001 now fails immediately when 3 Villagers have been lost.
- The check occurs as soon as the third Villager loss is recorded.
- Preserves the 3.25.15 Healing Potion ally-targeting rule and all prior ten-Hero/multiplayer fixes.

## 3.25.18 — Failed Quest Hand Reset
- On a failed Quest, every participating Hero H001–H010 now has their Hero deck rebuilt/shuffled and draws exactly 5 cards for the retry.
- The failed attempt's hand and discard do not carry into the retry.
- Preserves the 3.25.17 Adventure Log failure history and Q001 playtest fixes.
