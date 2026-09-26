# Ascendance 3.25.4 — Hero Deck Identity + Class Labels

- Audited Hero deck identity handling for all ten Heroes.
- Added automatic repair for H003–H010 loaded/synced deck state if cards belong to the wrong Hero.
- Only the currently controlled Hero deck panel is displayed.
- New Game, Load Game, and Join Game selectors show Hero name and class.
- Preserves all 3.25.3 systems.

# Ascendance 3.25.3 — Downtime Activities

Built from the locked, confirmed-working 3.24.0 Crafting Mechanics baseline.

## Four persistent Hero professions
- Blacksmithing — workbook Blacksmithing, Leatherworking, Tailoring, and Woodworking disciplines.
- Alchemy — workbook Alchemy recipes.
- Enchanting — workbook Enchanting, Sacred Crafting, Artifact Restoration, Legendary Crafting, and Jewelry disciplines.
- Artificing — workbook Campcraft, Tinkering, Settlement Crafting, and Trophy Crafting disciplines.

The workbook's original Profession/discipline value is preserved and displayed on every recipe; the four core professions are the new progression tracks.

## Advancement
Heroes start at Tier I in all four professions and advance only through successful crafting at their current tier:
- Tier I -> II: 2 successful Tier-I crafts
- Tier II -> III: 3 successful Tier-II crafts
- Tier III -> IV: 4 successful Tier-III crafts
- Tier IV -> V: 5 successful Tier-IV crafts

Lower-tier crafting remains allowed but does not advance a higher-tier profession. Hero XP is not granted by Downtime or profession progression.

Recipe Tier, materials, Gold, facility requirements, and recipe-specific Quest/campaign unlocks remain independent gates. Profession state is stored in the shared game state and therefore persists with normal saves/multiplayer state.


## 3.25.1
Merchant and Crafting now have dedicated screens within the management overlay, with direct access buttons from the Hero summary and persistent tabs for Inventory, Merchant / Shop, and Crafting. This is a UI/navigation change only; existing gameplay systems are preserved.


3.25.3 adds a dedicated Downtime Activities screen with one post-success activity per Hero: Craft, Gather, Research, or Work. Failure/retry downtime grants services only.


## 3.25.3 — Downtime After Every Quest Attempt
- Each Hero receives one Downtime Activity after every Quest attempt, successful or failed.
- Failure/retry Downtime now permits Craft, Gather, Research, or Work.
- Free Shop/Sell/Trade/Equip/Inventory services remain unchanged.
- No Hero XP is granted through Downtime.
