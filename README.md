# Ascendance 3.0.2 — Manage Games Fix

This is a surgical fix to 3.0.1.

## Fixed
The **Manage Games** panel was accidentally nested inside the hidden **Join Game** panel in the HTML. Clicking Manage Games ran the function, but the parent Join panel remained hidden, so nothing appeared.

3.0.2 makes New Game, Join Game, and Manage Games sibling panels as intended.

## Preserved
No save/load, WebSocket, reconnect, server persistence, synchronization, combat, card, enemy, or map behavior was redesigned.

## Test
1. Deploy 3.0.2.
2. Open the lobby.
3. Click **Manage Games**.
4. The Manage Multiplayer Games panel should immediately appear.
5. Existing persisted rooms should populate from the server.
6. Test Delete on an expendable/test room first.
