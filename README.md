# Ascendance 3.4.2 — Engagement + Dual Wield Fix

Built from 3.4.1.

Fixes:
- Lyra can unequip an Iron Dagger and equip it again.
- When Lyra already has a Weapon and her Offhand is empty, equipping another Weapon fills Offhand rather than replacing the main Weapon.
- Offhand equipment continues to contribute its Attack/Armor modifiers.
- An Enemy sharing a Location with any living hostile Hero is Engaged and cannot voluntarily leave that Location to pursue another Hero.
- Enemy target selection may still select another legal target, but Engagement prevents voluntary movement out of the occupied Location.
- Forced movement or a future explicit Behavior/effect override is not blocked by this generic movement guard.

No persistence, multiplayer ownership, Search, First Visit, Campaign, Loot, Crafting, Consumable, or layout logic was rewritten.
