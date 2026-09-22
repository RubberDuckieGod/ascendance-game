# Ascendance 2.8.3 — Persistence Diagnostics & Load Fix

Built from 2.8.2 after the PERSIST-TEST restart returned the default Stonebrook board.

Changes:
- Logs every persistent SAVE and exact path.
- Logs every LOAD as FOUND, NOT FOUND, INVALID, or ERROR.
- Logs ROOM_STATE / ROOM_EMPTY responses.
- Re-reads `/var/data/ascendance/<ROOM>.json` on every REQUEST_STATE.
- Retains atomic save and the 2.8.2 reconnect join gate.

Expected Render logs:
`[PERSIST] SAVE PERSIST-283 -> /var/data/ascendance/PERSIST-283.json (...)`
`[PERSIST] LOAD PERSIST-283 -> FOUND (...)`
`[PERSIST] ROOM_STATE PERSIST-283 -> sending saved state`
