# Ascendance 3.3.2 — Consumables, Layout & Forge Visibility

Built directly from user-confirmed 3.3.1.

Changes:
- Consumables now show a Use button in Inventory.
- Smelling Salts removes Stunned from a legal Hero at the user's Location and is then discarded.
- Consumables with simple `Recover N Health` effects are usable and discarded after resolution.
- Unsupported consumable effects are never silently consumed; the log reports that their effect still needs implementation.
- The controlled Hero's deck panel is moved to a dedicated left rail beside the map on desktop.
- Adventure Log scrollbar is kept inside the log body with stable gutter spacing.
- Stonebrook's Forge is now prominently shown both on the Stonebrook map tile and in Current Location as `Crafting: Forge`.
- Existing explicit facility system remains intact; Forge does not satisfy higher/specialized Forge requirements.

No multiplayer persistence, save/load, First Visit, movement, Search, Loot, Campaign Day, or Crafting recipe logic was rewritten.
