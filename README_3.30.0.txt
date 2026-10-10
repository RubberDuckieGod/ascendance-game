Ascendance 3.30.0 — Room-Authoritative Multiplayer Engine (Stage 1)

This build replaces client/host round-completion authority with a server-owned room turn engine.

Room/server now owns:
- Hero Action totals during the Hero Phase
- Pass / Hold Actions state
- Pending-resolution blockers per player
- The decision that all Heroes are finished
- A single idempotent round-resolution token
- Acceptance/commit of the completed Enemy/World/End-phase result

Protocol changes:
- TURN_COMMAND with unique command IDs (Action adjustments, Pass, pending status)
- TURN_STATE broadcasts canonical Actions/Pass/round-resolution state
- ROUND_RESOLVE grants exactly one connected resolver a one-time token
- ROUND_RESOLVE_RESULT is the only legal multiplayer path that may advance the round
- Ordinary STATE snapshots can no longer overwrite Actions, Pass, Round, or Phase
- Whole-game STATE updates are ignored while a round resolution token is active

Client changes:
- Removed the 3.29.21 round-regression patch and 3.29.22 host watchdog.
- Multiplayer clients report Action/Pass changes to the room instead of deciding when to end the round.
- Direct client endTurn() calls are blocked in remote multiplayer unless accompanied by the server-issued resolution token.
- Existing single-player/local multiplayer behavior remains unchanged.

Migration note:
This is Stage 1. Movement/combat/search/explore still use the existing snapshot model. Later stages can move those actions into validated server commands without changing the new room-owned turn engine.
