# Ascendance 3.27.34 — Unified Account Character Store

Built directly from the uploaded 3.27.33 deployment.

## Fix
- One authenticated account character snapshot now drives Create Character, New Game, Join Game, and Load Game.
- Saving, editing, or deleting a custom Hero publishes the new list immediately to every Hero selector and the Saved Custom Characters panel.
- Opening any character-dependent menu refreshes the account snapshot from `/api/account/characters`.
- Switching accounts clears the previous account snapshot before loading the new account.
- No MutationObserver is used.
- 3.27.33 authenticated multiplayer handshake and account-owned campaign saves are preserved.

DEBUG remains enabled.
