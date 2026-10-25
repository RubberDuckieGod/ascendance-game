# Phase damage and exploration Action synchronization

## Reproduced failures

The supplied private diagnostic contains several sessions. Its latest session uses the regional Encounter deck repair from the previous release; older Blight/Guardian events in that export are not evidence that those fixes regressed. No private diagnostic, account, room identifier, or save is included here.

In the latest session, Goblin Captain and Scout attacks reduced Rowan from 9 Health to 3 and then 0, recording `HERO LOST`. A `REQUEST_STATE` during the asynchronous Enemy phase returned the server's pre-phase `ROOM_STATE`. Applying that reply replaced the in-progress game with its earlier 9 Health and Enemy state. The phase then continued and committed the restored Health rather than the damage/death it had just resolved.

Explore and Search acknowledgments also updated local Actions before updating the browser's authoritative turn baseline. A render in between compared those two different transaction stages and emitted `UNAUTHORIZED_ACTION_DELTA`, temporarily restoring the previous Action count. Search resolution had a separate defect: printed Action gains or losses were not registered as authorized card effects. The independent baseline regression for SD049 Rotten Floorboards expected 3 → 2 for the Search draw, then 2 → 1 for its additional Action loss. It actually retained 2 Actions, while its 1 damage and Location Search count were applied.

## Corrected behavior

- A room phase worker is protected from pre-commit whole snapshots and Hero, Combat, Resource, Exploration, Phase, and Turn replies. Protection continues after the asynchronous worker finishes while the result awaits server acceptance. A newer server `STATE` with a matching committed phase receipt becomes the canonical state; normal synchronization then resumes.
- Suppressed Resource command completions release their matching in-flight bookkeeping without applying their outdated resource bodies. This prevents a late acknowledgment from blocking the next turn's inventory or Gold changes.
- The guard installs synchronously, and the delayed mechanics wrapper consults it before applying or rebasing a packet. Its diagnostic marker is `phase-and-exploration-33625`.
- Room/game changes prevent an old worker from submitting into a different game. Authored failed-Quest resets are allowed to replace the game during phase resolution. Rejection/error recovery requests canonical state.
- Exploration acknowledgments apply their included authoritative Turn state before any local callback can render. The paid draw/refund and Action total are observed together.
- Search resolution uses an explicit Action transaction. The server owns the draw cost; the transaction commits only the Search card's separate printed Action gain/loss. Cancellation retains the server's single refund.
- The offline cache revision and mutable script revision URLs are updated. Worker activation preserves an unsaved open game; the refreshed page and reopened offline profile receive the new synchronization module.

## Validation boundary

Tests exercise native browser clients against isolated local HTTP/WebSocket servers with temporary data. Production verification uses public health/static-asset reads only. These regressions verify the named phase and Search scenarios; they do not certify every printed mechanic. The pre-existing strict full-effect certification backlog remains visible.

The room/game identity check prevents cross-game result submission. General cancellation of every asynchronous legacy coroutine when a player abandons a room remains outside this fix's certification boundary.
