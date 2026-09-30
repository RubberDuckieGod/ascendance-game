# Ascendance 3.27.24 — Account-Bound Hero Ownership & Player Management

Built on the confirmed-working 3.27.23 active-adventure rejoin baseline.

- Prevents two different players/accounts from controlling the same Hero.
- Reserves a disconnected Hero to the account that owns it, allowing safe reconnects.
- Same account can replace its own stale duplicate browser/session.
- Party Lobby host gets Kick controls for other players.
- Kick releases the Hero reservation and prevents automatic reconnect.
- Leave Game releases the player's Hero reservation and returns to the menu.
- Existing temporary Away behavior remains available for campaign-preserving absence.
- Hero ownership is server-authoritative and persisted with the room save.
- DEBUG remains enabled.

## 3.27.25 — Host Migration + Custom Character Edit
- Active multiplayer rooms automatically promote a remaining connected player when the host disconnects.
- Promoted host receives host/admin controls immediately; a returning former host rejoins as a normal player unless no host remains.
- Active rooms cannot have host authority stolen by a NEW_GAME_JOIN reconnect path.
- Saved custom characters now have Edit and Delete controls.
- Edit reopens the full Character Creator with the saved archetype, stats, deck, and starting equipment and preserves the character ID/account ownership when saved.
- DEBUG remains enabled.
