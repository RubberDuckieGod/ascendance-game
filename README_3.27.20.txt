Ascendance 3.27.20 — Server-Authoritative Built-In Hero Join

Fixes the multiplayer split where the joining browser could show Aldric + Lyra while the host/server canonical game state still contained only Aldric.

Server change:
- JOIN/HELLO now commits built-in Heroes (Aldric/Lyra/Seraphine) into the canonical room game state, just like custom Heroes.
- The room revision increments when a new built-in Hero joins.
- The updated canonical STATE is broadcast to players already in the room before the joiner receives ROOM_STATE.
- The joining built-in Hero receives an opening hand and campaign-start Healing Potion when applicable.

Changed:
- server.js
- public/index.html
- index.html

Unchanged:
- package.json

Expected test:
1. Aldric creates room QA.
2. Lyra joins QA.
3. Both clients should show Aldric + Lyra in the actual game-state party before Ready/Start Adventure.
4. Both Ready -> host Start Adventure.
