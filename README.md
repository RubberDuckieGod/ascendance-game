# Ascendance 3.3.3 — Begin Adventure Hotfix
Rebuilt from user-confirmed 3.3.1, not from broken 3.3.2.

Fixes the 3.3.2 regression where moving Hero Deck HTML accidentally removed Lyra's deck node. `render()` then failed before the lobby could close, making Begin Adventure appear unresponsive.

This build keeps both deck panels intact and moves the complete DOM nodes into the left rail at runtime. It also retains the requested consumable Use button, Stonebrook Forge visibility, and Adventure Log scrollbar cleanup.
