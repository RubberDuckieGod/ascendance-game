# Mechanics audit

Run `npm ci`, `npx playwright install --with-deps chromium`, then `npm run audit:mechanics`. In the onboarding container Chromium is already available: `CHROMIUM_PATH=/usr/bin/chromium npm run audit:mechanics`.

Tests start an isolated local server on port 3101. The persistence test uses a second isolated server on port 3102. Both use newly created temporary data directories. Never point these tests at production. No hosted URL override is provided. The staging health request is read-only; it is not gameplay validation.

`npm run audit:report` generates REPORT.md from the current Playwright JSON and inventory artifacts. `npm run audit:coverage` writes the record-level coverage backlog and deliberately returns failure while full-effect certification is outstanding. CI keeps legacy, mechanics, and coverage failures visible, uploads evidence even after failure, and has no deployment or merge step.

The original `npm test` and `npm run stability:33621` scripts still reference absent files. They have not been replaced by weaker checks. The repository owner must supply the original suites to reproduce the documented historical release results.

The suite distinguishes:

- Shared damage/healing/stat/XP behavior verified with numeric assertions.
- Individual card and item scenarios verified against printed effects.
- Protocol tests using two isolated Chromium contexts connected to the real local WebSocket server. These bypass UI controls and do not certify UI synchronization.
- Generic card dispatcher observations, which never certify full card effects.
- Unverified or unsupported behavior, recorded as a coverage gap rather than passing.

No application files have been fixed during this audit. A failing regression is retained as evidence for a separate reviewable fix. See REPORT.md and DEFECTS.md for current outcomes and reproduction.
