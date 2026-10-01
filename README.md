# Ascendance 3.27.35 — Persistent Authentication Fix

Built from 3.27.34.

## Fix
- Login sessions are now persisted to the Render persistent data directory instead of existing only in server memory.
- A Render deploy/restart no longer forgets valid signed-in sessions and then rejects New Game with “Sign in to create a campaign.”
- Session tokens expire after 30 days and logout removes the persisted session.
- 3.27.34 unified account-owned custom Hero synchronization is preserved.
- 3.27.33 authenticated multiplayer handshake is preserved.

## Deployment note
The first deployment of 3.27.35 cannot recover session tokens that older builds never persisted. If the browser was carrying an old token from 3.27.34, sign in once after deploying 3.27.35. From then on, deploy/restart persistence is retained.

DEBUG remains enabled.
