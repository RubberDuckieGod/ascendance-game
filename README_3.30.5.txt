ASCENDANCE 3.30.5 — ROOM-AUTHORITATIVE EXPLORATION & PROMPTS

Built from the confirmed-working 3.30.4 baseline.

ROOM AUTHORITY ADDED
- Shared Location pool / draw order.
- Standard Explore draw selection and skipped-tile handling.
- Exact Location placement / orientation on the canonical room map.
- Search deck draw order, skipped Search cards, Search count, resolve/cancel.
- Encounter deck draw/discard plus server-owned d6 Severity rolls / fixed Severity.
- First Visit consumed state.
- Per-Hero pending Explore / Search / Encounter prompts, persisted in room state and recoverable after reconnect.
- Stale whole-game snapshots can no longer restore a consumed Location, undo a placement, reset Search count / First Visit, or replace room-owned Search/Encounter decks.

COMPATIBILITY
- Scout's Kit choice is preserved; the room validates/commits the chosen draw.
- Explorer's Compass replacement is committed to the room ledger.
- Tome / pool reordering is committed to the room ledger.
- Special/card-driven Location reveals use the same room placement commit path.
- Existing 3.30.0–3.30.4 turn, combat, Hero-state, quest-failure, Relic, and Quest Item systems are preserved.
- index.html and public/index.html remain byte-identical.

TESTS
- Simulation: 438 / 438 passed.
- Production browser runtime: 16 / 16 passed.
- 3.30.5 exploration authority unit: passed.
- 3.30.0 turn authority unit: passed.
- 3.30.1 combat authority unit: passed.
- 3.30.2 quest failure reset unit: passed.
- 3.30.3 Hero-state authority unit: passed.
- 3.30.4 Relic / Quest Item browser suite: 14 / 14 passed.
- All 81 inline scripts pass node --check.

NOTE
A live websocket integration test was not run in this container because runtime npm dependencies are not installed here. Server command handling and canonical stale-snapshot protection are covered by the dedicated 3.30.5 server-engine unit test plus browser/runtime regression suites.
