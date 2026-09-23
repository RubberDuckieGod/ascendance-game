# Ascendance 3.2.0 — Loot & Inventory

Built from 3.1.1 gameplay and the locked 3.0.10 deployment/server package.

## Source of truth
Loot and Equipment data are imported from Ascendance_v10.10(10).xlsx.
Rules follow Design Bible v2.8 System 012 — Equipment & Inventory and System 021 — Loot & Rewards.

## Added
- Personal inventory for Aldric and Lyra.
- Party Gold, Reputation, and party-controlled Quest Item storage.
- Normal Loot deck built from workbook Loot Deck copies.
- Quest Items are excluded from normal Loot draws.
- Drop Tag eligibility for normal Loot.
- Search card `Hidden Cache` exercises the real `Draw 1 Loot card` flow.
- Crafting Materials are separated visually in Inventory but remain normal carried items.
- Equipment reward decks by rarity are initialized from the workbook Equipment sheet.
- Equip/unequip foundation for 1 Weapon, 1 Armor, and 2 Accessories.
- Remote ownership prevents a player from managing the other Hero's inventory.
- Q003 completion now awards its workbook reward once: 75 XP to each Hero, 50 party Gold, +1 Reputation.
- Inventory/loot/equipment state is inside `g`, so existing save/load and multiplayer state persistence carries it.

## Intentionally not in 3.2.0
- Consumable effect execution.
- Automatic enemy loot (System 021 says rewards are gained only when an effect instructs it; enemy rows do not define automatic loot drops).
- Crafting recipe execution. That is the next subsystem.
- Equipment passive/attack/armor modifiers are stored/displayed but are not yet wired into combat calculations. Existing proven combat values are preserved until Equipment integration is implemented deliberately.
