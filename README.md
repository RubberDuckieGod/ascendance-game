# Ascendance 3.27.17 — Party Start Fix

Fixes the 3.27.16 Party Lobby Start/Begin Adventure transition.

- Host Start Adventure now sends a server start request and visibly enters a starting state.
- Server broadcasts ADVENTURE_START to every connected ready player.
- Every client explicitly closes both the Party Lobby and main game menu before rendering gameplay.
- Server start message includes the authoritative room state/revision metadata.
- Account authentication, account-owned characters, multiplayer lobby, and 3.27.13 stabilization are preserved.
# Ascendance 3.27.16 — Account Characters + Party Lobby

Stable base: 3.27.15 real account authentication.

## Added
- Custom characters are synchronized to the signed-in Ascendance account.
- Existing browser characters are migrated into the account when the account has no characters yet.
- New character saves/deletes synchronize back to the account.
- Multiplayer handshake associates the authenticated player account separately from the selected Hero.
- New Game, Join Game, and server Load Game now stop at a Party Lobby before gameplay.
- Party Lobby shows player display name, selected Hero, Host/Player badge, Ready state, and room code.
- Host can Start Adventure only when every connected player is Ready.
- Start Adventure opens gameplay simultaneously for all connected clients.

## Files changed
- server.js
- public/index.html
- index.html
