# Ascendance 3.0.3 — Delete Game Fix

The Manage Games list works in 3.0.2, but Delete returned HTTP 500.

## Cause fixed
The delete route was using a room-file helper that was not part of the locked persistence path. 3.0.3 now deletes using the exact same filename convention already proven by the save/load system:

`path.join(DATA_DIR, ROOM + '.json')`

It also removes an abandoned `.tmp` file if present and clears the room's in-memory authoritative state.

If deletion fails, the server now logs the real exception and sends the actual error message back to the browser instead of only saying "Could not delete saved game."

## Preserved
The working 2.9.0 persistence/reconnect/save/load foundation and all gameplay systems are unchanged.
