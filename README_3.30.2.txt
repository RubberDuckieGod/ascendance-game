Ascendance 3.30.2 — Room-Authoritative Quest Failure Reset

Fixes a multiplayer deadlock when a Quest fails during the server-owned round-resolution transaction.

Observed failure:
- Room begins resolving Round 6.
- Q001 reaches 5 Fire and fails.
- Existing game logic intentionally resets Q001 to a clean Round 1 retry in Campaign Downtime.
- 3.30.1 server rejected Round 1 as a round regression, leaving every client stuck on "ROOM AUTHORITY · RESOLVING ROUND 6".

3.30.2:
- Server recognizes a verified failed-Quest reset as a legal terminal round-resolution result.
- Requires lastQuestOutcome=Failed, downtime=true, same current Quest, Hero Phase, and reset to Round 1.
- Commits the clean retry snapshot atomically and rebuilds room turn authority from it.
- Clears stale combat tombstones/command history for the new scenario instance while preserving monotonic Enemy IDs.
- Ordinary older-round snapshots are still rejected.
