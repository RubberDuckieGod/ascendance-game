# Gold resource rollback correction

Branch: `fix/resource-cooldown-rollback`, based on main `1e40be0`. This follow-up repairs legitimate Gold/loot/item updates being rejected because authored round tracking was interpreted as integer cooldowns. See [RESOURCE_ROLLBACK_33623.md](RESOURCE_ROLLBACK_33623.md).

| Check | Actual result | Scope |
|---|---|---|
| `npm test` | **147 passed**, 0 failed | 43 foundation +104 focused rules, including 30 typed-state/history checks. |
| `CHROMIUM_PATH=/usr/bin/chromium npm run stability:33621` | **215 passed**, 0 failed/skipped/flaky; 728.1 seconds | Complete browser suite, including all 7 new actual Gold scenarios. |
| Representative baseline reproduction | **Failed as expected: canonical 25 instead of 45** | Restored valid action history, real movement and an authored 20-Gold SD004 UI Search. The user's diagnostic does not identify their exact card. |
| Corrected Gold scenarios | **7/7 passed together** | Offline solo, one-Hero online, two-client multiplayer, mid/final Action, fresh/restored tracking, round and reconnect persistence. |
| Selected prior Work/craft/shop/Crystal/Worldheart regressions | **6/6 passed** | Relevant positive existing behavior retained. |
| Strict coverage gate | **Exit 1 / 657 incomplete effect records** | Remains a failing gate; named scenario passes are not exhaustive certification. |

The reports list all 215 browser and 147 Node outcomes. Raw player diagnostics, identity and room codes are excluded. No production player account/save/balance was edited; historical rewards are not inferred or backpaid. Pre-deployment tests use isolated localhost services and temporary data. Live deployment verification is recorded separately in PR #4 after activation. These current results supersede the earlier diagnostic runs.

The entries below retain the preceding audit history.

---

# Downtime and Snare follow-up validation

Validated locally on 2026-10-24 with Node 24.19.0, Playwright 1.64.1 and Chromium 154.0.8037.57. Branch: `fix/downtime-snare-sync`; gameplay/scenario source at `f3cb75d` over main `c4406b3`.

| Check | Actual result | Meaning |
|---|---|---|
| `npm test` | 43 foundation + 74 focused rules = **117 passed**, 0 failed | Individual named outcomes are in [node-results.json](node-results.json) and REPORT.md. Includes static integrity and pure rules, not only gameplay scenarios. |
| `CHROMIUM_PATH=/usr/bin/chromium npm run stability:33621` | **208 passed**, 0 failed, 0 skipped, 0 flaky; 538.4 seconds | Final complete browser run. Native clients cover downtime, costs, rewards, shops, save/restart/rejoin, Snare damage/movement/graphic and quest completion, plus the earlier regression suites. |
| Native Snare/Captain regression repeated independently | **3/3 passed** | Two clients complete Q001 and receive exactly one authored payout after the final Captain dies to Snare; no extra Enemy/World phase is needed. |
| `npm run audit:coverage` | **Exit 1**, 657 records lack full effect certification | Deliberate incomplete-coverage failure, retained by CI. Scenario success is not every-clause certification. |
| `node tests/audit/report.cjs test-results/results.json` | 208 browser outcomes, 117 Node outcomes, 323 enumerated Hero cards | Expected/actual assertions, measurements, reproduction files and remaining gaps are in REPORT.md and execution.json. |
| Root/public parity, JavaScript/YAML parsing, `git diff --check` | Passed | Syntax and artifact integrity only. |

All 323 card observations remain conservatively classified: 274 OBSERVED_UNVERIFIED and 49 UNVERIFIED, with no dispatcher ERROR rows. The inventory contains 144 Equipment and 190 Loot records. The report does not turn these inventories into effect passes. Functional requests used localhost and new temporary data only; production Render was checked through read-only health metadata and remains on the prior deployment. No production accounts, player balances or saves were modified. The new PR is [#3](https://github.com/RubberDuckieGod/ascendance-game/pull/3); no merge or deployment is included.

The final complete run follows an explicit solo-mode correction in the existing LT159 crafting fixture, matching the actual Solo Begin Adventure path; its numeric gameplay assertions were retained. The Snare objective regression also prompted canonical-state retry handling so a stale completion snapshot cannot leave a valid quest stuck. The final 208-case result supersedes earlier diagnostic runs.

CI now uses one full runner for the stability/mechanics aliases, runs all Node checks, preserves failures/artifacts and retains the strict coverage failure. Hosted validation of the final evidence commit must be assessed separately from these local results.

See [the follow-up report](DOWNTIME_SNARE_33622.md) for reproduced defects, numeric expectations, local-only test boundaries and remaining gaps. Production has not been updated. The record below describes the previous audit and is retained as history.

## Prior mechanics remediation validation

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
