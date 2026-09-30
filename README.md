# Ascendance 3.27.32 — Custom Hero Lobby OOM Fix

Built from 3.27.31.

## Fix
- Removed the account-Hero selector MutationObserver entirely. The observer could enter a ping-pong loop with older selector compatibility code and exhaust browser memory while a custom Hero joined the lobby.
- Custom-Hero selectors are now refreshed only at explicit account/menu lifecycle events.
- Replaced the legacy public custom-Hero selector refresh hook with the authenticated account-owned renderer, so older compatibility layers cannot reinsert a foreign custom Hero.
- Preserves account-owned custom Heroes, server-side Hero ownership, account-owned campaign saves, party lobby, Ready, Begin Adventure, rejoin, and host migration.

DEBUG remains enabled.
