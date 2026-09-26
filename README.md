# Ascendance 3.25.23 — Q002 Caravan + Arcane Ward Fix

Built from the full 3.25.22 multiplayer project.

- Fixed Merchant Caravan placement calling a nonexistent `setupQ002Caravan()` function. The tile had already been committed/synced, which caused peers to see it while the exploring client threw an error and appeared frozen. Placement now calls the real `q002SetupCaravan()` function.
- Q002 `Caravan Revealed` now updates from that same authoritative placement path and initializes the two Wagons/enemies as intended.
- Added a final centralized Arcane Ward enemy-entry trigger so Q002 enemy movement into a warded Stonebrook resolves the Ward reliably and synchronizes it.
- Preserves the 3.25.22 kill-ledger fix and all prior full-multiplayer files.
