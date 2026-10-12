# Ascendance 3.36.18 — Server-Authoritative Hero Turn Ownership

## Why this release exists

Remote rooms previously synchronized round, phase, Actions, passed state, pending reactions, and resolver state, but did not have a single authoritative owner for the Hero turn itself. Two connected clients could therefore both consider normal Hero Phase controls usable and submit overlapping state changes. Stale revisions were safely rejected by the room server, but that contention could make the game feel inconsistent or appear to undo an action.

3.36.18 adds an explicit server-owned `turnHero` without changing Ascendance's player-chosen activation-order rule.

## Locked turn rule

- A new Hero Phase begins with **no Hero preselected**.
- Any unfinished, non-Defeated Hero with Actions may choose **Start My Turn**.
- The server claims that Hero as `turnHero`.
- That Hero completes the entire normal turn before another Hero may perform normal Hero Phase Actions.
- **End Turn / Hold Actions** marks that Hero complete and releases `turnHero` back to `null`.
- The server does **not** automatically choose the next Hero.
- Another unfinished Hero then chooses **Start My Turn**.
- Once every eligible Hero has completed a turn, existing room phase-resolution logic continues normally.

## Reactions are intentionally different

Saved Actions still belong to the Hero after their normal turn ends. A Hero who is not `turnHero` may still spend held Actions when the room has an authoritative pending Reaction window for that Hero.

3.36.18 therefore blocks normal off-turn Action spending while allowing an Action decrease tagged as a Reaction when `pendingByHero[hero] === true`.

## Server authority

The room's authoritative turn object now includes:

- `round`
- `phase`
- `actions`
- `passed`
- `pendingByHero`
- `turnHero`
- `activationSeq`
- `seq`
- `resolving`
- `resolverRole`

New command:

- `CLAIM_TURN` — claims an unowned Hero turn for the requesting Hero.

Updated enforcement:

- `PASS` / End Turn is legal only for the current `turnHero`.
- Normal Action changes require the Hero to be `turnHero`.
- Explore/Search room commands require the Hero to be `turnHero`.
- A valid pending Reaction may spend saved Actions without becoming `turnHero`.
- Defeat, leave, kick, away state, or a clean disconnect can release the current owner so a room cannot remain locked indefinitely.

## Browser UX

A fixed turn badge now reports one of the following states:

- `ROUND N · CHOOSE NEXT HERO · START MY TURN`
- `YOUR TURN · <HERO> · N ACTIONS`
- `<HERO>'S TURN · WAIT FOR YOUR TURN`
- resolving / non-Hero-Phase state

The existing Pass button is now labeled **End Turn / Hold Actions** and a **Start My Turn** control appears when the room has no current owner.

Normal off-turn controls are disabled locally for clarity, while Reaction controls remain interactive.

## Diagnostics

The copied diagnostic report now adds:

- `productBuild: "3.36.18"`
- `turnAuthority33618`

The older diagnostic subsystem may retain a historical module version internally; use `productBuild` for the deployed product version.

## Preserved systems

- v10.52 content sync
- 3.36.15 generic Reveal Effect runtime parity
- 3.36.17 bundled fantasy SFX and regional ambience
- room-authoritative Action / phase / combat / exploration / resource systems
- player-selected Hero activation order
- held Actions for Reactions

## Validation

- Core simulation: **438 / 438 passed**
- Room authority 3.36.18 unit: **PASS**
- Turn ownership 3.36.18 unit: **PASS**
- Chromium two-Hero turn-ownership regression: **PASS**, **0 page errors**
- Non-current Hero Reaction control regression: **PASS**
- 3.36.17 bundled-audio regression under 3.36.18: **PASS**, **0 page errors**
- 3.36.15 Reveal runtime regression under 3.36.18: **PASS**, **0 page errors**
- Post-Quest rules 3.30.10 regression: **PASS**

The browser test simulates remote-room client state. A deployed Render room with two real clients remains the final live authority check.
