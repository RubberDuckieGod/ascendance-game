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

## Independent regression measurements

| Scenario | Expected | Measured corrected result |
|---|---|---|
| SD049 Rotten Floorboards, three play modes | Search 3 → 2 Actions; printed loss 2 → 1; Health 9 → 8 | Exact Actions/Health, one Search consumed, server/peer/reconnect agree |
| SD044 Lucky Break, three play modes | Search 3 → 2 Actions; printed reward 2 → 3 | Exact server/peer/reconnect totals; only one +1 adjustment |
| Paid Search cancellation, three play modes | 3 → 2 → 3 Actions; Search count stays 0 | One refund, no duplicate adjustment or warning |
| Explore draw and placement, three play modes | 3 → 2 Actions; placement remains 2 | One tile placed; canonical and peer totals match |
| Real Enemy activation, one and two native clients | Die + Attack − Armor damage and Burning damage/expiry survive refreshes | Exact Health, Enemy Health/conditions, cards and resources preserved through commit and reconnect |
| Fatal Enemy activation | 0 Health survives refresh; normal Failed-Quest reset commits | Failed outcome, Campaign Downtime, Round 1; accepted canonical state |
| Completed worker awaiting commit; late Resource ACK | Refresh cannot undo effects; next-turn resources remain usable | Unchanged completed worker, accepted result; real Potion heals 4, consumes 1, retains 38 Gold |

The 12 exploration regressions also assert zero false authorization warnings/rejections, exactly the printed Action adjustment, and no residual authorization. The four phase regressions intentionally request pre-commit state during real asynchronous gameplay. The unprotected baseline demonstrably restored Hero Health 5 → 9, Enemy Health 9 → 10 and Burning; the original SD049 baseline retained 2 Actions instead of 1.

## Cache-test readiness correction

The first full run passed 292 scenarios and failed the cache test while its instrumentation contacted the previous worker. A separate minimal reproduction showed that this installed Playwright version resolves `waitForFunction(async () => false)` immediately with `false`; it does not poll the eventual boolean. The test's asynchronous activation predicate therefore finished before the new worker activated. Cache creation alone occurs earlier in installation.

The fixture now captures the exact installing/waiting worker, waits synchronously for that worker to activate and control the page, and checks cache changes with `expect.poll`. It retains the same reply timeout and every online, blocked-storage, unsaved-game and offline assertion. This corrects test readiness without changing the application worker or relaxing gameplay checks.

After deployment, every participant should save and reload the game to load the updated client. An already-open unsaved window is intentionally not reloaded automatically. These fixes prevent future synchronization rollbacks; no historical player save totals are rewritten.

## Final validation

The application source is `999212d9ee734e7b6cfb0a28ff8575c59d25b8ef`; the corrected cache-test harness is in `1a7505a`. The final full run passed **293/293 browser scenarios** in **442.2 seconds**, using Playwright's bundled Chromium 156, with zero failures, skips or flaky results. **223/223 Node checks** passed (43 foundation and 180 shared rules). The detailed report records all 293 outcomes and the actual measurements for each of the 16 added gameplay regressions.

The corrected cache fixture independently passed **10/10 repeats** in 54.0 seconds. Before that fixture correction, GitHub's [focused native-client workflow](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/40153698009) passed all 16 phase/exploration cases, and its [cache-upgrade workflow](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/40153698011) passed three repeats. These focused hosted results are separate from the full local run and are not presented as a completed hosted full audit.

The strict certification gate still exits 1 for **657 records without complete effect certification**. Generic observations remain 274 `OBSERVED_UNVERIFIED` and 49 `UNVERIFIED`, not passes. Forced worker errors/rejected-job recovery and general coroutine cancellation on room changes remain outside the four new phase scenarios. No production accounts, rooms or saves were used for functional testing.
