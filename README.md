# Ascendance 3.29.18 — Multiplayer Start + Playtest Fixes

- Multiplayer Begin Adventure now sends the host's freshly initialized final-roster state to the server before ADVENTURE_START is broadcast. This prevents a stale solo Q001 snapshot from replacing the 3-Hero opening enemy setup.
- Restores Sir Aldric Ironwall's established starting Iron Shield (EQ078) alongside EQ003 Iron Longsword and EQ086 Chain Shirt.
- Garruk Stoneblood's Sweeping Cleave (H012-004) can attack up to two different Enemies in his Location with +1 Attack each.
- Pass / Hold Actions now hard-blocks Q001 Extinguish Fire and Escort Villager before objective state can mutate; held Actions remain available only for Reactions.
- Woodland Clearing (L003) Quiet Respite now offers the 1 Health recovery only to the Hero who performed the Explore/reveal.
- Includes diagnostic `ascendance32918()` for roster, pass state, Aldric gear, Q001 state, and Stonebrook enemies.
