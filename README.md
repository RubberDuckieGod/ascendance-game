# Ascendance 3.0.18 — First Visit + Lyra Hero Cards

Built from 3.0.17, which preserved the user-confirmed 3.0.15 remote ownership baseline and fixed Lyra's map movement eligibility.

## First Visit
First Visit is shared per tile.

When either Hero enters an unvisited tile:
- If a living Enemy is already on that tile, First Visit does NOT trigger.
- The tile is NOT marked visited, so its First Visit remains available.
- Later, either Hero can enter it with no living Enemy present and trigger the tile's one First Visit.
- Once triggered, it is consumed for the party.

Aldric and Lyra now use the same First Visit helper.

## Lyra Hero cards
The hand renderer already enabled Lyra cards based on `controlledHero()`, but `playLyraCard()` still rejected the click unless the old shared `g.activeHero` was Lyra. That made cards look playable but do nothing.

`playLyraCard()` now checks `controlledHero()` too, so a remote Lyra player can actually execute her Action cards.

No Search change is included.
