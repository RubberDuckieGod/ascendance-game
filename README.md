# Ascendance 3.0.4 — Delete Game Fix

The 3.0.3 diagnostic exposed the exact server error:

`cleanRoom is not defined`

That helper does not exist in the locked server. The delete endpoint now normalizes the room name directly with the same convention used by the existing multiplayer server:

`String(room).trim().toUpperCase()`

No persistence, reconnect, save/load, synchronization, combat, or other gameplay logic was changed.

## Test
Deploy 3.0.4, open Manage Games, and delete SAVE-TEST or PERSIST-TEST first.
