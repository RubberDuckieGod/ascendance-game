# Ascendance 3.0.8 — Map / Sidebar UI

Built directly from confirmed-working 3.0.7.

This is intentionally another incremental presentation-only pass.

## Changes
- Wider desktop gameplay canvas.
- Quest Map receives more horizontal space.
- Right sidebar is tightened to about 330px.
- Panel padding and action-button spacing are reduced.
- Aldric/Lyra deck-reference panels are visually compacted.
- No panels were moved or removed from the DOM.

## Preserved
New Game, Join Game, Load Game, Manage Games, Save Game, multiplayer connection/reconnect, server persistence, authoritative restore, map rendering, Hero state, cards, combat, enemies, search, explore, and turn logic are unchanged.

## Test
1. New Game.
2. Join an existing server game and confirm RESTORED.
3. Confirm map/sidebar layout looks better.
4. Play a few actions and confirm Hero hand/action controls still behave normally.
