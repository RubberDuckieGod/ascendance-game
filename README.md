# Ascendance 3.4.1 — Starting Equipment Fix

Fixes the 3.4.0 starting-equipment migration.

- Aldric starts actually equipped with Iron Longsword, Iron Shield, and Chain Shirt.
- Lyra starts actually equipped with two Iron Daggers, Leather Jerkin, and Traveler's Charm.
- Starting equipment appears in the Hero equipment line and in Inventory > Equipped.
- Starting equipment now supplies the existing Attack/Armor totals instead of those totals being baked into the Hero base stats.
- Unequipping starting gear removes its modifiers and places it into carried Inventory.
- Existing saved games with an empty equipment state are migrated once.
- Existing games that already have equipment are not overwritten.
- Shield and Lyra's starting offhand are supported as existing starting-loadout slots without changing normal loot equip rules.

No movement, multiplayer, persistence, Search, First Visit, Campaign, Loot, Crafting, Consumable, or layout systems were rewritten.
