# Ascendance 3.36.21 — Stability / Regression Foundation

3.36.21 freezes feature work and hardens the browser multiplayer rules engine around the current Ascendance rules. The purpose of this release is to stop fixed rules from silently regressing when a later compatibility layer, sync path, or old handler runs.

## Authority changes

- The room server is the single authority for Hero turn ownership and Hero Action totals in remote multiplayer.
- Hero Phase begins with no selected turn owner. Players choose activation order each Round.
- A living, unfinished Hero claims their turn with `CLAIM_TURN`.
- On that Hero's first claim that Round, the server performs the Start-of-Turn lifecycle exactly once: **draw 2 Hero cards, then grant exactly 3 Actions**.
- A Hero cannot claim a second normal turn after completing their turn.
- Ending a turn preserves unused Actions for valid Reactions for the rest of that Round.
- End Phase removes held Actions. The next Round starts every Hero at 0 room Actions until that Hero starts their turn.
- Off-turn Hero, Combat, Resource, Explore, and Search mutations are rejected by the server unless the Hero is resolving a valid server-known Reaction window.
- A Hero at 0 Health cannot claim a turn or originate Hero-state, Combat, Resource, Explore, Search, or Reaction commands.

Protocol: `room-turn-owner-v2`  
Server build: `3.36.21`

## Action transaction guard

`stability-33621.js` is loaded last and adds an Action transaction guard. Normal Action changes are expected to occur inside a known gameplay transaction. In remote multiplayer, an unexplained local Action delta is restored to the current room-authoritative Action total rather than being uploaded to the server.

Diagnostic event: `STATE_INVARIANT_FAILED_33621`  
Audit helper: `ascendanceStability33621.audit()`

The invariant audit checks Action range, Downed/Dead HP consistency, server protocol/build, valid turn owner, unstarted-Hero Action state, room/local Action synchronization, Q001 Goblin Lookout reconciliation, and duplicate Hero-card UIDs.

## Rules explicitly protected by the permanent regression gate

- Player-chosen Hero activation order; no preselected Hero between turns.
- Start of Turn grants exactly 3 Actions and draws exactly 2 cards once.
- No double Start-of-Turn grant/draw.
- Held Actions survive End Turn for Reactions and are removed at the next Round boundary.
- Off-turn normal Actions are locked.
- Invalid Q001 objective actions do not spend Actions.
- A conscious Hero may use their own Common Healing Potion on a same-Location Downed Hero; the potion heals 4, costs 1 Action, consumes the item, and restores the Hero from Downed state.
- Goblin Lookout (`L006`) is authoritative from the revealed map. If it is in play, stale Q001 flags are reconciled, Captain/Scout setup is restored if necessary, and pre-Captain Stonebrook reinforcement spawning is stopped.
- Difficult Terrain costs two Move Actions to leave: the first prepares/overcomes the terrain without movement, the second moves.
- First Visit remains eligible when a Hero first enters while a hostile Enemy is present and triggers later only when entered without a hostile Enemy.
- Hero basic/granted attacks automatically hit and do not consume a random attack roll.
- All 16 authored Heroes receive opening hands and starting potion state in the stress matrix.

## Deep-dive defects found while building the stability gate

The stress suite found defects that were not part of the three live reports and they were fixed before packaging:

1. The internal room client still stamped outgoing commands as `3.36.19` even when the visible build was newer. It now stamps `3.36.21`.
2. Action-transaction authorization could survive a local-mode test/session and incorrectly authorize a later remote Action delta. Transaction state is now reset on game initialization and is only created while remote authority is active.
3. Expanded Heroes' granted/basic attack helper passed the wrong enemy-target object shape to `runtimeHeroAttackEnemy`, causing some H004–H016 basic/granted attacks to deal no damage. The canonical helper now passes the required enemy reference and the auto-hit regression passes for the expanded roster.
4. Server-side Downed gates were expanded to Hero, Combat, and Resource ledgers so a stale or modified client cannot make a 0-Health Hero act or react through a lower-level command path.
5. The server startup banner still identified the old 3.36.19 build; it now reports 3.36.21 so deploy diagnostics match the actual protocol.

## 50-run server stress result

**PASS — 50 / 50 simulations** across all 16 Heroes.

- 123 total Hero instances / Hero turn starts.
- 50 / 50 Rounds began with no turn owner.
- 123 / 123 first turn starts drew 2 and granted exactly 3 Actions.
- 123 / 123 double-start attempts did not grant/draw twice.
- 123 / 123 completed turns preserved held Actions.
- 123 / 123 next-Round resets removed held Actions.
- 50 / 50 pending-work cases prevented premature auto-completion.
- 50 / 50 zero-Action/no-pending cases auto-completed correctly.

Hero turn-start coverage: Aldric 10, Lyra 7, Elara 9, Vaelis 6, Rowan 9, Seraphine 6, Thorne 10, Cassian 6, Kael 9, Mira 6, Malachar 9, Garruk 6, Veyra 9, Mordren 6, Lucien 9, Asha 6.

## 50-run Chromium stress result

**PASS — 50 / 50 runs, 510 / 510 checks, 0 page errors.**

149 total Hero appearances across all 16 Heroes: Aldric 10, Seraphine 10, Lyra 10, Thorne 10, Malachar 10, and each of Elara, Cassian, Garruk, Asha, Vaelis, Kael, Rowan, Mira, Mordren, Lucien, and Veyra 9.

Coverage in the 50-run browser matrix:

- 50 fresh-room authority checks.
- 149 opening-hand + starting-potion instances.
- 50 claims from 0 unstarted Actions.
- 50 exact grant-3 checks.
- 50 off-turn normal-action lock checks.
- 50 unauthorized Action rollback checks.
- 50 authorized Action transaction checks.
- 50 held-Action + next-Hero claim checks.
- 10 invalid Q001 action checks.
- 10 First Visit hostile-enemy checks.
- 10 Downed Healing Potion checks.
- 10 Goblin Lookout reinforcement-suppression checks.
- 10 Difficult Terrain two-step exit checks.
- 10 automatic-hit Hero attack checks.

Late build markers remained `3.36.21`; audio remained `3.36.17`; Reveal runtime remained `3.36.15`.

## Additional release gates

- Core simulator: **438 / 438 PASS**.
- V2 turn-owner browser regression: **PASS**, 0 page errors.
- 3.36.20 reported-regression suite: **PASS**, 0 page errors.
- v10.52 Reveal runtime suite: **PASS**.
- v10.52 content-sync suite: **PASS**.
- bundled fantasy audio/regional ambience suite: **PASS**.
- Node syntax checks: **PASS**.

The permanent runner is `tests/run-stability-33621.py`, exposed as `npm run stability:33621`. Future website builds should not be packaged until this gate passes or its expectations are deliberately versioned with an explained rules change.

## Compatibility boundary

The exact per-Hero Start-of-Turn lifecycle above is authoritative for **remote multiplayer**, which is the current Render architecture. Local/offline compatibility mode still retains some older round-refresh behavior. It is intentionally not allowed to overwrite remote room authority. A later cleanup can migrate local mode onto the same turn engine, but that is separate from this stabilization release.
