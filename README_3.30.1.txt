# Ascendance 3.30.1 — Room-Authoritative Combat

This build fixes multiplayer attacks being lost or Enemy Health snapping back upward.

## What changed
- The room/server now assigns every Enemy a persistent room combat ID.
- Enemy HP changes are sent as additive combat commands instead of trusting whole client snapshots.
- Defeats are tombstoned so stale client snapshots cannot resurrect defeated Enemies.
- Rooted/Burning/etc. Enemy condition changes and forced Enemy movement use the same combat ledger.
- Ordinary STATE snapshots are merged with canonical Enemy state, preventing one player's stale board from restoring another player's damage.
- Existing 3.30.0 room-owned Actions, Pass, and round-resolution authority remains in place.

## Verification
- Main simulation suite: 438/438 passed.
- Browser runtime suite: 16/16 passed.
- 3.30.1 combat authority unit: 6 -> 4 -> 2 -> defeated; stale hp=6 snapshots cannot restore Health.
