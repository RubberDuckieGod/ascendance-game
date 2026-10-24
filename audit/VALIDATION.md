# Mechanics remediation validation

Validated locally on 2026-10-23 with Node 24.19.0, Playwright 1.64.1 and system Chromium 154.0.8037.57. Branch: `fix/mechanics-audit-33621`, based on audit commit `7ae34362fb884d177896a4ab566ea20566c7934d`.

| Check | Actual result | Meaning |
|---|---|---|
| `npm test` | 43 passed, 0 failed | Shared rules, all 16 Heroes’ Rest behavior and refusals, crafting substitution, cooldown ownership, paid/free interactions, served JavaScript compilation and root/public parity. |
| `CHROMIUM_PATH=/usr/bin/chromium AUDIT_RESULTS=test-results/final-startup.json npm run stability:33621` | 183 passed, 0 failed, 0 skipped | Complete checked-in browser suite, including original failing regressions, new item scenarios, four native-client cases, two-client authority, reconnect and isolated persistence/restart. Some tests are explicitly inventory/observation tests. |
| `npm run audit:coverage` | Exit 1: 657 records remain without complete effect certification | Expected incomplete-coverage result. Scenario success does not certify all effects of a record. CI retains this failing gate. |
| `node tests/audit/report.cjs test-results/final-startup.json` | 183 current scenario outcomes, all 323 Hero cards enumerated | Expected/actual measurements, test names and source locations are in [REPORT.md](REPORT.md) and [execution.json](execution.json). |
| Workflow YAML parsing, `node --check server.js`, `git diff --check` | Passed | Syntax and change integrity checks. GitHub-hosted workflow execution is unverified. |

The card sweep has **274 OBSERVED_UNVERIFIED**, **49 UNVERIFIED** (trigger-specific fixtures still needed), and **0 ERROR** rows. These are observations, never 323 gameplay-effect passes. All 144 runtime Equipment and 190 Loot records are included in the inventory. Every original audit failure now passes, and all ten previously blocked item mechanics have positive scenario coverage. EQ116’s existing normal/Arcane/once-per-round Channel behavior also passes.

The four native scenarios exercise the complete game clients: three Basic Attacks reduce shared target Health 100 → 95 → 90 → 85 and release the turn at 0 Actions; Rapid Fire reduces it 100 → 92 → 84 → 76 across three uses and releases after both final shots; Rest changes Health 10 → 13 with Actions 3 → 1 and consumes one Ration; a Night’s Whisper lethal Attack grants exactly 3 Actions and 2 cards with the same turn sequence on both clients. Protocol scenarios independently check rejection, duplicate use, normal versus extra turns and saved roll choices.

All functional requests target localhost servers with fresh temporary persistence and isolated synthetic accounts/rooms. No production or staging player data was mutated, and no game deployment or merge was performed. The original historical suites were absent from Git; the two restored command paths are clearly identified replacement runners. Exhaustive card branches, every level Ability effect and every campaign remain outside the completed certification scope. See [IMPLEMENTED_RULES.md](IMPLEMENTED_RULES.md) for reviewable rule defaults and [DEFECTS.md](DEFECTS.md) for reproduced defects and fixes.

The first hosted run, [39902285675](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/39902285675), recorded 181 passing browser scenarios and 2 startup-order failures in its final browser pass. Its Bloodrage and Orb/Rest failures are fixed in the follow-up readiness change. The new local full rerun has 183 passes; hosted revalidation of that follow-up is pending. CI now keeps separate `stability.json` and `results.json` files, `foundation.log` and `check-outcomes.json` in its artifact so the complete outcomes remain visible even though the exhaustive coverage gate intentionally fails.
