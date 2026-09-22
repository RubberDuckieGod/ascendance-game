# Ascendance 3.0.1 — Manage Games

Built directly from Ascendance 3.0.0, which was built from the locked 2.9.0 golden build.

## New
The opening lobby now has **Manage Games**.

It requests the server's persisted multiplayer room saves and displays each room with its saved timestamp. Each room has a **Delete** button with a permanent-delete confirmation.

Server endpoints added:
- `GET /api/saves` — list persisted multiplayer rooms.
- `DELETE /api/saves/:room` — delete one persisted room save and clear its in-memory authoritative state if the room is currently loaded.

Deleting a room does **not** delete downloaded `.ascendance.json` files from a player's computer.

## Important
The existing save/load, WebSocket synchronization, reconnect/restore, room persistence, combat, cards, enemy AI, and map logic were left intact. This build only adds server-save management around the locked foundation.

## Test
1. Deploy 3.0.1 with the same persistent disk.
2. Open **Manage Games**.
3. Confirm existing room names appear.
4. Delete an old/test room and confirm the warning.
5. Refresh Manage Games and verify it is gone.
6. Do **not** delete a room you still need unless you also have a downloaded Save Game file.
