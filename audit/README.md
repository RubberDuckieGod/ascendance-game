# Mechanics audit

The current Quest setup, Garruk Search and Encounter Reputation follow-up is documented in [QUEST_TRANSITIONS_33626.md](QUEST_TRANSITIONS_33626.md). It includes actual solo and connected-browser measurements, all 16 Hero replacement paths and the remaining certification/save-repair limits. Latest source `e71fc877` passes 240 Node checks and 29 focused browser cases locally and on GitHub; its final 322-case hosted audit is pending. The complete generated report/card observations retain the preceding 9c89 checkpoint's 320-browser/238-Node attribution. The strict full-effect backlog remains 657 records and its gate still fails. See [current outcomes](quest-transition-current-results.json), [VALIDATION.md](VALIDATION.md) and [run provenance](quest-transition-validation.json) for the separate source and attempt records.

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
