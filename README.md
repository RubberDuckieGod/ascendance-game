# Ascendance 3.3.0 — Crafting

Built directly from the user-confirmed 3.2.0 Loot & Inventory build.

- Embeds all 200 Crafting Recipes from Ascendance_v10.10(10).
- Crafting is inside Inventory.
- Filter by Profession/Tier or search by recipe/result.
- Checks exact recipe materials, Gold, Craft Time (Actions), Required Tool/current Location, Hero Phase, Engagement, ownership, and supported Unlock Requirements.
- Materials and Gold are consumed only after all checks pass.
- Equipment results enter that Hero's inventory.
- Loot results enter inventory; Quest Item results enter party Quest Items.
- Other Campaign/Upgrade/special results are persisted as craftedSpecials rather than silently discarded.
- Unsupported unlock conditions remain locked instead of being bypassed.
- Crafting state remains inside g and therefore uses the existing save/load and multiplayer persistence path.
