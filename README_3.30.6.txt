ASCENDANCE 3.30.6 — PERSISTENT SEARCH + FIRST VISIT ENCOUNTER FIX

Built from the confirmed-working 3.30.5 baseline.

FIXED FROM LIVE MULTIPLAYER REPORT
- Search completion is now committed through the room-authoritative Search ledger before local reward resolution.
- Search count remains consumed after sync/reconnect; the server rejects a new Search when a Location has already reached its Search limit.
- Legacy DOM buttons are rebound to the final room-authority handlers, so Explore/Search/Resolve Search/Cancel Search/Resolve Encounter no longer bypass 3.30.5 authority wrappers.
- A room-owned Explore/Search/Encounter prompt is now a hard server-side round blocker independent of client STATUS timing.
- First Visit encounters are NOT consumed when the prompt opens. The Location is marked visited only after that Encounter is actually resolved.
- Pending First Visit encounters survive normal sync/reconnect and cannot disappear because another Hero finishes the round.
- Encounter-created enemies are committed to the room before the Encounter prompt is cleared. Client spawn nonces are mapped to canonical room Enemy IDs to prevent stale snapshots from losing or duplicating them.
- When resolving/cancelling the final shared prompt, the room immediately re-checks whether the round can advance.

PRESERVED
- 3.30.0 room-authoritative Actions/Pass/round progression.
- 3.30.1 Enemy combat ledger.
- 3.30.2 failed-Quest resolution reset.
- 3.30.3 Hero HP/conditions/movement ledger.
- 3.30.4 Relic + Quest Item audit.
- 3.30.5 Location/Search/Encounter deck authority and pending prompt persistence.

TARGET REGRESSIONS
1. Search Stonebrook once -> resolves to 1/1 -> room sync/reconnect still shows 1/1 and Search remains disabled.
2. Hero triggers a First Visit Encounter and reaches 0 Actions -> round cannot advance while the Encounter prompt is pending.
3. Reconnect during that Encounter -> exact Encounter card/severity remains pending for that Hero.
4. Resolve an Encounter that spawns enemies -> enemies are in canonical room combat state before First Visit is consumed and prompt clears.
