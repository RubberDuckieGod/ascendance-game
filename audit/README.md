# Mechanics audit

Run `npm ci`, `npx playwright install --with-deps chromium`, then `npm run audit:mechanics`. In the onboarding container Chromium is already available: `CHROMIUM_PATH=/usr/bin/chromium npm run audit:mechanics`.

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

The current Downtime/Snare follow-up is described in [DOWNTIME_SNARE_33622.md](DOWNTIME_SNARE_33622.md), with final local totals in [VALIDATION.md](VALIDATION.md). Its 208 browser scenarios and 117 Node checks pass; the 657-record strict coverage backlog remains open.

The ordinary-action Gold rollback correction is in [RESOURCE_ROLLBACK_33623.md](RESOURCE_ROLLBACK_33623.md): bounded authored round tracking, 147 Node checks and 215 browser scenarios. The current strict effect backlog remains 657; player balances are not automatically backpaid.
