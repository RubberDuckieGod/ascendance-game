# Ascendance 3.36.20 — Q001 / Downed Potion Regression Fixes

Built on 3.36.19. The Render server turn-owner protocol remains 3.36.19; this is a browser/gameplay regression patch.

- Q001 invalid objective attempts no longer qualify as successful actions and explicitly return false without spending an Action.
- Q001 World Phase reconciles an already-revealed Goblin Lookout (L006) before pre-Captain reinforcement logic, so the Captain/Scout reveal state is restored and Stonebrook pre-Captain reinforcement spawning stops.
- Healing Potions may target a same-Location Downed Hero at 0 Health; only Heroes explicitly marked Dead are excluded.
- Browser product/cache marker bumped to 3.36.20 while requiring the compatible 3.36.19 Render turn-owner server protocol.
