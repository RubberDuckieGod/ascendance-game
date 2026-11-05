# Mechanics audit

The current website gameplay-effects follow-up is documented in [WEBSITE_EFFECTS_33627.md](WEBSITE_EFFECTS_33627.md), [VALIDATION.md](VALIDATION.md) and [PR #8](https://github.com/RubberDuckieGod/ascendance-game/pull/8). Application/test source `70038618` passed **435 Node tests**. The complete hosted browser run recorded **418 passed /1 failed**, with zero skips/flaky cases. Its stale-revision fixture failure was investigated: strict server rejection was correct; the corrected fixture and a separate deterministic guard case then passed **6/6 repeated focused runs** without application changes. The new 420-case complete rerun is pending. The focused 98-case gameplay workflow, Quest/reward, multiplayer phase and cache workflows passed on the completed source. These are overlapping scenario checks, not complete card or ability certification.

The strict full-effect backlog remains **657 incomplete records**, leaving the complete workflow intentionally red. This is not a count of 657 broken mechanics. The 323-card and 100-status inventories retain unverified branches and source gaps. See [REPORT.md](REPORT.md) for per-scenario expected/actual results and [exact run provenance](website-effects-validation-33627.json). No production deployment, player-save repair or main merge is included.

Run `npm ci`, `npx playwright install --with-deps chromium`, then `npx playwright test` with `CHROMIUM_PATH` unset to use Playwright's installed browser. In the onboarding container, use `env -u CHROMIUM_PATH PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright test` to select that bundle. The `stability:33621` Python wrapper can automatically select a different system Chromium when present; record the actual browser version or set `CHROMIUM_PATH` explicitly when comparing runs.

Tests start an isolated local server on port 3101. The persistence test uses a second isolated server on port 3102. Both use newly created temporary data directories. Never point these tests at production. No hosted URL override is provided. The staging health request is read-only; it is not gameplay validation.

`npm run audit:report` generates REPORT.md from the current Playwright JSON, current test-results/foundation.log and inventory artifacts. Keep run JSON outside test-results while doing filtered diagnostics: Playwright clears its output directory, and filtered runs clear generated card/item observations. A final full run regenerates all evidence. `npm run audit:coverage` writes the record-level coverage backlog and deliberately returns failure while full-effect certification is outstanding. CI keeps legacy, mechanics, and coverage failures visible, uploads evidence even after failure, and has no deployment or merge step.

The original historical runners were not present anywhere in Git history. This fix branch supplies explicit replacement runners: `npm test` executes the shared foundation simulator and focused rule tests; `npm run stability:33621` executes the full checked-in Playwright suite. Historical release counts are not claimed. See IMPLEMENTED_RULES.md for newly completed item mechanics.

The suite distinguishes:

- Shared damage/healing/stat/XP behavior verified with numeric assertions.
- Individual card and item scenarios verified against printed effects.
- Protocol tests using two isolated Chromium contexts connected to the real local WebSocket server, plus full native-client scenarios for Rest, ordinary Basic Attacks, Rapid Fire and Night’s Whisper. The native scenarios check synchronized Health, Actions, card draws and turn ownership. They do not certify every other UI interaction.
- Generic card dispatcher observations, which never certify full card effects.
- Unverified or unsupported behavior, recorded as a coverage gap rather than passing.

The fix branch repairs the confirmed gameplay regressions and completes the ten previously unsupported item mechanics. Baseline findings remain in DEFECTS.md; REPORT.md contains current outcomes. Exhaustive effect coverage remains unverified outside the named scenarios, and the strict coverage gate deliberately stays visible.

The earlier Downtime/Snare follow-up is described in [DOWNTIME_SNARE_33622.md](DOWNTIME_SNARE_33622.md), with historical local totals retained in [VALIDATION.md](VALIDATION.md). Its run passed 208 browser scenarios and 117 Node checks; those are historical counts, not the current complete-suite totals.

The ordinary-action Gold rollback correction is in [RESOURCE_ROLLBACK_33623.md](RESOURCE_ROLLBACK_33623.md): bounded authored round tracking, 147 Node checks and 215 browser scenarios. The current strict effect backlog remains 657; player balances are not automatically backpaid.
