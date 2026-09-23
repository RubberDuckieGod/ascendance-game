# Ascendance 3.7.0 — Equipment Range & Core Abilities

Built from user-confirmed 3.6.2.

Implemented:
- Weapon Range terminology: Melee 0, Ranged 1 connected Location, Long Range 2.
- Basic Attack target selection across connected Locations.
- L017 Broken High Ground +1 Range.
- L043 Dense Fog caps ranged targeting to adjacent unless Torch visibility bypass is active.
- L002 Dense Woods ranged Attack Value -1.
- L003 Woodland Clearing ranged Attack Value +1.
- Iron Longsword / EQ003 Parry: once per round when hit by a melee attack, optionally reduce damage by 1.
- Iron Shield / EQ078 Shield Wall: allied Hero in same Location gets +1 Armor against ranged enemy attacks.
- Traveler's Charm / EQ098 Sure Footing remains the existing once-per-round Difficult Terrain departure benefit.
- Chain Shirt / EQ086 Reliable Mail has no extra effect.
- Leather Jerkin / EQ082 Flexible Fit is represented by having no armor movement surcharge in the current movement system.
- Lyra Iron Dagger Quick Draw now counts currently equipped EQ037 daggers instead of static HERO_BUILD.
- Offhand restriction: Lyra may only place Light weapons into the current special Offhand slot.
- Two-Handed weapons automatically clear Shield/Offhand.
- Shields can now be equipped from Inventory and cannot coexist with a Two-Handed primary weapon.

Scope note:
Basic Attack uses weapon Range. Existing Hero-card attacks retain their own current targeting restrictions unless their card text explicitly says otherwise; this avoids silently changing card behavior.
No generic English-text equipment parser was added.
All 3.6.2 Location/Loot/Explore-left behavior is preserved.
