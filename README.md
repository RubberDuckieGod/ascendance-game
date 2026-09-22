# Ascendance 2.8.5 — Handshake Fix

Fixes the 2.8.4 reconnect deadlock while preserving server-authoritative restore.

- Accepts both the new `JOIN` handshake and legacy `HELLO` handshake.
- Loads the persistent room snapshot before allowing client state writes.
- Sends `ROOM_STATE` (or `ROOM_EMPTY`) as part of the handshake.
- Keeps `STATE` blocked until the handshake is complete.
- Existing persistent room files such as `PERSIST-283.json` are not modified by deployment.

## Test
1. Deploy this build.
2. Confirm `/health` reports `2.8.5`.
3. Refresh the game page (hard refresh if necessary).
4. Connect to `PERSIST-283` as Lyra. Do not use Force Sync.
5. Expected server log: `HANDSHAKE PERSIST-283 ... -> ROOM_STATE authoritative restore`.
6. Expected client: saved Dense Woods state returns.
