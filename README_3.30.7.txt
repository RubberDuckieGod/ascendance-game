ASCENDANCE 3.30.7 — SEARCH TERMINAL COMMIT + PENDING PROMPT CLEAR FIX

Built from 3.30.6 after live multiplayer Search debugging.

ROOT CAUSE FOUND IN LIVE LOG
- SEARCH_RESOLVE correctly raised Stonebrook to Search 1/1.
- The room then immediately resurrected Aldric's old pending Search from persisted explorationAuthority metadata.
- A second SEARCH_RESOLVE was therefore accepted for the same Search, producing Stonebrook Search 2/1 and returning the same withheld Search cards a second time (deck 104 -> 109).
- The same hydration bug could keep the last Encounter/Explore prompt alive after legitimate resolution.

FIXED
- Persisted exploration prompts hydrate exactly once when a room is loaded/restarted.
- Clearing the final room-owned prompt now stays cleared.
- SEARCH_RESOLVE / SEARCH_CANCEL cannot resurrect after completion.
- A repeated Search resolve is rejected because no Search is pending.
- Search count remains capped/authoritative and Search deck size returns to its pre-draw size exactly once.
- First Visit Encounter completion now clears permanently while still surviving a true reconnect before resolution.
- EXPLORE_PLACE terminal prompt clearing benefits from the same fix.

PRESERVED
- 3.30.0 room-authoritative turn engine.
- 3.30.1 combat ledger.
- 3.30.2 failed-Quest reset.
- 3.30.3 Hero state authority.
- 3.30.4 Relic/Quest Item audit.
- 3.30.5 exploration decks.
- 3.30.6 Search persistence / First Visit blocking and enemy-spawn commit.

VERIFICATION
- Simulation: 438/438 passed.
- Production browser runtime: 16/16 passed.
- Final exploration control binding: 3/3 passed.
- Search terminal commit / one-time hydration regression: PASS.
- Persistent Search + First Visit authority regression: PASS.
- server.js syntax: PASS.
- index.html and public/index.html: byte-identical.
