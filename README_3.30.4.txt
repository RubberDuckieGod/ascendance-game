Ascendance 3.30.4 — Relic + Quest Item Audit

Baseline: 3.30.3 Room-Authoritative Hero State.

RELICS LT136-LT145
- Relics remain carried items; they are not equipped into Equipment slots.
- LT136 Explorer's Compass: once/round may discard a valid Location draw and draw the next valid Location.
- LT137 Lantern of the First Watch: Dark immunity + first-Ambush-ignore hooks are wired. Current implemented Quest set has no separate numeric Dark/Ambush resolver, so no unsupported modifier is invented.
- LT138 Cartographer's Journal: first new Location revealed each Scenario grants 10 Gold.
- LT139 Crown of the Forgotten King: +1 Reputation after completing a Main Quest that actually awards Reputation.
- LT140 Ring of the Pathfinder: first voluntary Move each round costs 0 Actions if not Engaged. Difficult Terrain surcharge is still paid.
- LT141 Chalice of Renewal: +1 Health when a Hero at the bearer's Location Rests; wired to the current Quiet Road Rest and future explicit Rest hooks.
- LT142 Banner of Unity: first Attack each round by each Hero sharing the bearer's Location gains +1 Attack.
- LT143 Priest's Reliquary: bearer deals +1 post-Armor damage to Undead/Corrupted enemies.
- LT144 Saint's Icon: once per Scenario, remove all negative Conditions from one Hero at the bearer's Location.
- LT145 Tome of Forgotten Lore: after Explore, inspect the top Location card and leave it or place it on the bottom.

QUEST ITEMS
- Quest Items remain excluded from random Loot draws.
- LT118 Watchtower Vault Key: Q003 Goblin Raider defeat -> gain key. Hero at Fallen Watchtower may spend 1 Action, return LT118, and draw 1 Equipment card from the sealed armory.
- Q003 Watchtower Reinforcements now match source: every unlit Enemy Phase adds 1 Scout; waves 1/2/3 additionally add Raider/Archer/Raider.
- LT119 Merchant Strongbox Key: existing Q002 Captain award/strongbox interaction preserved.
- LT121 Scout's Journal: first Goblin Scout defeated during Q004 -> gain Journal; 2 Trail Markers instead of 3; returned when War Camp is revealed or Q004 ends.
- Q004 now spawns the printed 2 Goblin Scouts in the first revealed non-Stonebrook Location, with existing player-scaling behavior preserved.
- LT123 Caravan Manifest: existing Q002 first-Caravan-Search award preserved.
- Quest Item inventory now shows acquisition/use guidance. Quest Items with no trigger in the currently implemented Quest source remain quest-only and are not randomly injected.

TESTS
- npm simulation: 438/438 PASS
- production browser runtime: 16/16 PASS
- dedicated Relic/Quest Item browser tests: 14/14 PASS
- room authority, combat authority, quest-failure reset, and Hero authority unit tests: PASS
- index.html and public/index.html are byte-identical
- final 3.30.4 JavaScript syntax check: PASS
