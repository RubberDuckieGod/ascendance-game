Ascendance 3.27.18 — Final Party Start Transition Fix

Fixes the Party Lobby Start Adventure button being overwritten by the later 3.27.16 lobby script.
The final override now loads at true EOF, validates Ready/Host state, sends START_ADVENTURE,
and immediately transitions the host into gameplay while the server broadcast transitions peers.

Changed:
- public/index.html
- index.html

Unchanged:
- server.js
- package.json
