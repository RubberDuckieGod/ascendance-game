# Ascendance 3.3.1 — Crafting Facilities

Built directly from user-confirmed 3.3.0.

## Facility behavior
- Crafting now checks an explicit Location facility registry instead of guessing from terrain/type/name.
- Stonebrook (L000) provides `Forge` because its workbook Points of Interest explicitly includes `Blacksmith`.
- Stonebrook displays its Forge directly on the map.
- Crafting UI shows the Hero's current Location, available facilities, and `Available Here` / `Requires ...` status.
- `Master Forge`, `Arcane Forge`, `Legendary Forge`, `Sacred Forge`, Workbenches, Alchemy, Looms, etc. remain unavailable until a Location or Campaign effect explicitly provides them.
- Exact recipe requirements that are Location names (`Stonebrook`, `Fallen Watchtower`, `Merchant Caravan`, `Ancient Portal`, `Ancient Crypt`) require the Hero to physically occupy that named Location.
- Forge does NOT satisfy Master Forge or any other higher/specialized facility.

## Campaign-ready
`g.campaign.facilityChanges` can later add or disable facilities per Location, allowing Quests and World Events to unlock, damage, restore, or upgrade crafting sites without rewriting Crafting.

No combat, multiplayer ownership, save/load, Loot, Inventory, or server persistence logic was rewritten.
