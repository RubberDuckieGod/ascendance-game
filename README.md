# Ascendance 3.27.33 — Authenticated Campaign Handshake Fix

Built from 3.27.32.

## Fix
- New Game multiplayer handshakes now attach the current signed-in account token at the final `mpSend` layer.
- Fixes the server incorrectly reporting `Sign in to create a campaign` even though the player is visibly signed in.
- Preserves 3.27.32 event-driven account-owned Hero selectors and the no-MutationObserver OOM fix.
- Preserves account-owned custom Heroes and account-owned campaign saves.

DEBUG remains enabled.
