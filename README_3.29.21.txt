Ascendance 3.29.21 — Multiplayer Round Regression Guard

Fixes the multiplayer round loop/stall where both Heroes reached 0 Actions,
the authoritative client advanced locally, then a newer server revision containing
an older-round peer snapshot rewound the game.

Changes:
- Blocks older-round STATE / ROOM_STATE / STATE_REJECTED snapshots on the authoritative client after a successful round advance.
- Blocks same-round Hero Phase echoes while World/End phase is resolving.
- Commits a completed authoritative round immediately instead of waiting for the normal debounced sender.
- If the server accepted an older peer snapshot first, the authoritative client adopts the new revision number without adopting the old round, then immediately re-sends the newer round so the room self-heals.
- The protection resets when a new quest/scenario is initialized.

Debug events:
ROUND_REGRESSION_BLOCKED_32921
PHASE_REGRESSION_BLOCKED_32921
ROUND_COMMIT_IMMEDIATE_32921
ROUND_RESYNC_32921
