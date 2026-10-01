# Ascendance 3.27.38 — Multiplayer Explore Placement Persistence

Built from confirmed-working 3.27.37.

## Fix
- Explore Location placement no longer disappears when the multiplayer server echoes/applies a STATE update while a player is choosing the tile position/rotation.
- The locally drawn Location, skipped Locations, exploring Hero identity, and placement choices survive incoming state application until the player commits the placement.
- Applies to built-in and custom Heroes.
- Preserves 3.27.37 custom-Hero starting equipment fix and prior multiplayer/account fixes.

DEBUG remains enabled.
