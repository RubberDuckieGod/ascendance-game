# Ascendance 3.0.7 — Compact Header + Connection

Built directly from confirmed-working 3.0.6.

## Changes
- Compact gameplay header labeled ASCENDANCE.
- Existing multiplayer diagnostics are collapsed behind Connection → Details.
- The compact Connection line mirrors the existing multiplayer status text.

## Preserved
The map, sidebar, Hero panels, hands, action buttons, lobby, New Game, Join Game, Load Game, Manage Games, save/load, persistence, reconnect, WebSocket synchronization, combat, cards, and enemy logic are unchanged.

## Test
1. New Game.
2. Join an existing server game and confirm RESTORED.
3. Click Connection → Details and confirm the original multiplayer controls appear.
4. Save and Load once.
