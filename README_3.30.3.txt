ASCENDANCE 3.30.3 — ROOM-AUTHORITATIVE HERO STATE

Changes
- Server/room now owns Hero Health for all 16 built-in Heroes.
- Server/room now owns Hero map position/movement coordinates.
- Server/room now owns core Hero Conditions via additive add/remove commands.
- Room also protects movement/status flags used by the current engine: Difficult Terrain preparation, Inspired, Stealth, and Vanish untargetability where those legacy fields exist.
- Whole-game client snapshots are merged behind the canonical Hero ledger, so stale snapshots cannot heal/damage a Hero, move them backward, or restore/remove Conditions.
- Hero HP changes are additive, so concurrent damage/healing stacks instead of last-snapshot-wins.
- Quest Enemy/World/End resolution still commits Hero changes atomically in the ROUND_RESOLVE_RESULT, preserving enemy-phase damage and quest-failure resets.
- 3.30.2 quest-failure reset authority and 3.30.1 Enemy combat authority remain intact.

Diagnostics
- HERO_BASELINE_3303
- HERO_COMMAND_SENT_3303
- HERO_COMMAND_ACK_3303
- HERO_COMMAND_REJECTED_3303
- HERO_STATE_APPLIED_3303
- HERO_STATE_OLD_IGNORED_3303
- Server: ROOM_HERO_COMMAND_3303
- Browser console helper: ascendance3303()

Validation
- npm simulation: 438/438 passed
- browser runtime: 16/16 passed
- room authority unit: PASS
- combat authority unit: PASS
- quest failure reset unit: PASS
- Hero authority unit: PASS (HP, Conditions, status flags, movement survive stale snapshots)
- server.js syntax: PASS
- 79 inline scripts syntax: PASS
- index.html and public/index.html byte-identical
