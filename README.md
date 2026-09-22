# Ascendance 2.8.4 — Restore Authority Fix

Remote room joins are now server-authoritative. A client sends `JOIN`, the server loads the persistent room snapshot, and the client cannot publish gameplay state until it receives `ROOM_STATE` or `ROOM_EMPTY`. The client mutation watcher starts only after that handshake.

Use the existing Render persistent disk mounted at `/var/data`.

Test with `PERSIST-283`: after deployment, connect to that room. The UI should show `RESTORED <checksum>` and the persisted board should appear.
