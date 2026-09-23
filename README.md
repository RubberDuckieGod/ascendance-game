# Ascendance 3.4.0 — Equipment Integration

Built directly from user-confirmed 3.3.5.

Equipment integration:
- Equipped inventory Weapon/Armor/Accessories now contribute their workbook Attack and Armor modifiers to live Hero combat stats.
- Hero and Party panels update immediately on Equip/Unequip.
- Equipped weapon Range is displayed and tracked.
- Inventory/Equipped cards display Attack, Armor, Range, Ability 1 and Ability 2 from the embedded workbook Equipment data.
- Equip/Unequip log reports the resulting Attack, Armor and Range.
- Existing starting combat values are preserved as the prototype's intrinsic starting-gear baseline so this build does not silently nerf Aldric or Lyra before the starting equipment migration is explicitly designed.
- Only items in `g.equipped` add new equipment modifiers; carried inventory items do not.

Important scope:
- This build integrates numeric Attack/Armor and exposes Range.
- It does NOT yet execute arbitrary free-text Equipment abilities/reactions/keywords. Those require effect-by-effect implementation.
- It does NOT rewrite the current same-Location enemy targeting system yet; Range is surfaced and ready for the ranged-combat pass rather than changing map targeting without a complete rule implementation.

No multiplayer ownership, persistence, movement, First Visit, Search, Campaign, Loot, Crafting, Consumable, or layout logic was rewritten.
