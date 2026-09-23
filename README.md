# Ascendance 3.6.1 — Loot Item Functionality

Built from 3.6.0 Location Rules.

Important rules correction:
- Loot cards are not automatically Equipment.
- Only cards from the Equipment system occupy Weapon / Armor / Accessory slots.
- Loot Consumables are used from Inventory.
- Crafting Materials and Monster Parts feed Crafting.
- Trade Goods are inventory/economy items.
- Quest Items follow Quest rules.
- Relics and Legendary Treasures use their printed persistent/campaign effects rather than Equipment slots.

Consumables LT001-LT030 now have explicit item hooks instead of only Healing and Smelling Salts.
Implemented: healing, condition removal, Inspired/Guard, Action gain, Smoke Bomb engagement escape, Fire/Frost flasks, Thunderstone, throwing weapons, Caltrops, Hunting Trap, Torch, Lantern Oil extension, Rope & Grapnel, Scout's Kit, Whetstone, Emergency Supplies, Phoenix Ash.
Conditional items refuse to consume when their printed trigger/target is unavailable. Traveler's Rations waits for Rest; Lockpick Set waits for a Locked/simple Trap interaction.

Per System 012, normal Item use costs 1 Action unless the printed timing/effect says otherwise.

Location Rules/Reveal Effects from 3.6.0 are preserved. Multiplayer/persistence/save-load/Encounter Severity/merchant/trading/crafting were not rewritten.


## 3.6.2 UI regression fix
The Random Location Draw / Explore placement panel is explicitly re-parented into the left Explore Draw rail before every reveal path opens it. This restores the confirmed 3.3.5 layout: Hero Deck on the left, Explore/Random Location Draw directly beneath it.
