# Ascendance 3.5.2 — Modified Encounter Severity

Built from 3.5.1 after correcting Encounter Severity handling.

- Encounter starts with a base d6.
- Unless an Encounter explicitly supplies a fixed Severity, the active World Event's Encounter Severity modifier is applied.
- WE001 Goblin Raids now has a structured +1 Encounter Severity modifier, matching its existing '+1 Travel Encounter rolls' effect.
- Encounter card result bands are resolved using the FINAL modified Severity, not the raw d6.
- EN029 Traveling Merchant uses the FINAL modified Severity.
- The encounter panel/log shows base d6, World Event modifier, and final Severity.
- The 7+ Traveling Merchant tier is therefore reachable when modifiers raise final Severity to 7+.
- Pending encounter save/load retains base roll/final Severity/modifier through the existing serialized pending state.

No multiplayer, save/load serializer, movement, Engagement, Search, First Visit, Inventory, trading, Crafting, or layout logic was rewritten.
