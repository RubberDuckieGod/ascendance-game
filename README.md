# Ascendance 2.8.2 — Persistent Reconnect Fix

Fixes the 2.8.1 reconnect race discovered during the SAVE-TEST restart test.

## What changed
- A remote client is blocked from broadcasting its fresh local state while joining.
- `REQUEST_STATE` now gets one authoritative server response:
  - `ROOM_STATE` if the room has a persisted snapshot.
  - `ROOM_EMPTY` if no persisted snapshot exists.
- Only after that response may the client begin sending state.
- Existing-room reconnect therefore restores the disk snapshot before any local state can overwrite it.

Persistent disk remains mounted at `/var/data`.
Health endpoint should report version 2.8.2 and persistence true.
