# Ascendance 2.8.7 — Restart / Reconnect Fix

Builds directly on 2.8.6.

## What changed
- Remote client installs its WebSocket message handler before the open/connect handler.
- After JOIN, the client retries `REQUEST_STATE` every 500 ms until it actually receives `ROOM_STATE` or `ROOM_EMPTY`.
- Gameplay `STATE` uploads remain blocked during this restore gate, so the default Stonebrook state cannot overwrite a persisted room while waiting.
- Retry stops immediately after authoritative restore succeeds.
- Server persistence/save format is unchanged.

## Test
1. Deploy 2.8.7.
2. Join `PERSIST-283` and confirm the saved board restores.
3. Restart the Render service.
4. Reload/reconnect to `PERSIST-283`.
5. Status should change from `requesting saved state` to `RESTORED <checksum>` and the saved board should reappear.
