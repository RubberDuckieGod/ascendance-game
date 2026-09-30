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
