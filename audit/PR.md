# Add 3.36.21 mechanics audit, isolated Playwright tests and CI

Adds effect-level browser regressions, local HTTP/WebSocket authority tests with two isolated Chromium contexts, temporary account/room persistence and process-restart tests, and a per-record audit report. All functional testing uses fresh local data directories; production and staging are not mutated. No application fixes, deployment steps, or merge automation are included.

The current test set has 130 passing and 6 failing scenario/inventory tests. Reproduced behavior failures cover Mordren's non-Attack damage, four summon-card placements, and duplicate Q001 completion deducting an additional 20 Gold. Both original npm regression commands also fail because their referenced runners are absent from the baseline repository.

The report enumerates all 323 Hero cards, 144 runtime Equipment records, and 190 Loot records. Generic dispatcher observations are explicitly not full-effect passes. Full mechanics certification remains incomplete, including most card branches, level Ability effects, remaining equipment/loot effects, all campaign scenarios, and concurrent Reaction/UI synchronization. An explicit failing coverage gate prevents a green CI result from implying exhaustive certification. Ten known unresolved item rules remain unsupported; EQ116's replacement Channel mechanic passes its normal/Arcane/once-per-round regression.

Validation: Node 24.19.0, Playwright 1.64.1, system Chromium 154; frozen installation via npm ci; isolated Chromium tests; JavaScript syntax checks; workflow YAML parsing; git diff --check. Detailed expected/actual observations and reproduction steps are in audit/REPORT.md, audit/DEFECTS.md, and audit/execution.json. GitHub-hosted workflow execution is not yet verified.

This PR intentionally retains failing regression assertions. Review the findings and coverage gaps before any release decision. Restore the original regression sources and implement reviewed fixes in separate work; do not merge or deploy automatically.
