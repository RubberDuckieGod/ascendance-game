# Ascendance 3.0.10 — Server Save Picker

Built directly from working 3.0.9.

## New
- Main Menu → Load Game now lists saved multiplayer games already on the server.
- Choose Aldric or Lyra, then click Load beside the saved game.
- No room-code typing is required.
- The selected room is loaded using the existing server-authoritative JOIN/ROOM_STATE restore handshake.
- Portable JSON save files are still supported through **Load Save File** in the Load Game screen.
- Join Game remains available for manually entering a room code when needed.

## Unchanged
Server persistence, reconnect behavior, save format, WebSocket protocol, Manage Games/delete, Adventure Log dock, combat, cards, map, enemies, search, explore, and turn logic are unchanged.
