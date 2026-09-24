# Ascendance 3.25.0 — Professions & Crafting Progression

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
