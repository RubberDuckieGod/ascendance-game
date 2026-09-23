# Ascendance 3.8.0 — Location Mechanics
Built from user-confirmed 3.7.0.

Implemented:
- Hidden condition uses the database rule: cannot be targeted by attacks unless attacker is in the same Location; attacking removes Hidden.
- L043 Foggy Meadow Hidden Movement now offers Hide or +1 Armor on entry; Dense Fog targeting from 3.7.0 remains.
- L005 Ancient Ruins Unstable Masonry prevents the first Push/Knockback each round; wired into current Aldric forced-movement attacks.
- L036 Hunter's Lodge Well-Stocked Cabin: first Hero to Search draws one additional Item/Consumable.
- L017 Fallen Watchtower has a reusable Heavy-attack resolution hook: first explicitly Heavy attack each round rolls d6; on 6 all figures there suffer 1 damage. Current basic attacks are not silently classified Heavy.
- Cover-bearing Q003 Locations are recognized (L005/L009/L036); L003 blocks Cover.

Important source constraint:
The current source material retrieved for Cover calls it a standardized defensive effect but does not provide a numeric Cover modifier in that definition. This build therefore recognizes/displays/logs Cover but does NOT invent +Armor/-Attack. When the authoritative numeric Cover rule is available, the hook is ready to apply it.

Preserved: all confirmed 3.7.0 equipment range/abilities, 3.6.x location reveal/loot/explore-left, multiplayer, persistence, save/load, merchants, crafting, campaign, and Encounter Severity.
