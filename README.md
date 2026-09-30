

## 3.27.21
Restores the confirmed Party Lobby visibility fix on top of the server-authoritative built-in Hero join build. Party Lobby now renders above the legacy lobby overlay and explicitly hides the legacy lobby whenever PARTY_LOBBY is received. DEBUG remains enabled.

## 3.27.22 — Multiplayer Disconnect / Rejoin Reliability
- Preserves the authoritative room snapshot when a browser disconnects.
- Unexpected WebSocket drops automatically reconnect to the same room and Hero with bounded backoff.
- Rejoining restores the existing canonical Hero state instead of creating/resetting that Hero.
- Disconnects immediately refresh Party Lobby/roster presence for remaining players.
- If the host disconnects, server host authority transfers to a remaining connected player so the room is not stranded.
- Intentional Leave/Disconnect does not trigger automatic reconnection.
- Preserves the confirmed 3.27.21 lobby visibility + server-authoritative Hero join behavior.
