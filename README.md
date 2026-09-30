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
