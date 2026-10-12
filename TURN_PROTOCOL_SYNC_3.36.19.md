# 3.36.19 Turn Owner Protocol Sync

## Live 3.36.18 failure
The browser emitted a valid `TURN_COMMAND` with `op: CLAIM_TURN`, but the deployed backend returned `TURN_COMMAND_REJECTED` with `Unknown room command`. The returned turn state also lacked `turnHero`, proving the browser and backend were on different room-turn protocols.

## Fix
- Server build/version is explicit as 3.36.19.
- `turnPublic3300()` now includes `serverBuild`, `turnProtocol`, `turnHero`, and `activationSeq`.
- `CLAIM_TURN` is handled server-side and remains race-safe.
- Normal Action spending still requires the current `turnHero`; valid Reaction spending remains the exception.
- Browser detects an old/mismatched backend and blocks Start My Turn with `SERVER UPDATE REQUIRED`.
- `/health` reports the exact backend build and turn protocol.
- PWA cache bumped to 3.36.19 and the turn-owner script renamed to force a fresh fetch.
