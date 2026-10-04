# Ascendance 3.29.4 — Unified Hero-Created Piece Rendering

Built from 3.29.2.

Fixes:
- Adds one shared map renderer for every authored Hero-created physical piece currently represented by gameplay state.
- Bone Servant (Mordren), Spirit Totem (Asha), Arcane Ward (Vaelis), Snare (Rowan), Spirit Wolf (Thorne), Vine Terrain (Thorne), Turret (Mira), and Mechanical Trap (Mira) are visibly represented on their Location tile while present.
- Renderer reads the existing authoritative gameplay state; it does not create duplicate mechanics state. Removing/moving a piece changes the marker on the next render.
- Preserves 3.29.2 strict party deck auditing, Mordren defeat triggers, 3.29.1 solo Hero ownership, and 1–4 Hero scaling.

# Ascendance 3.29.2 — Party Deck Audit + Mordren Bone Token Fix

- Strict Hero deck audit: only participating Heroes can be repaired/dealt opening hands.
- Mordren defeat trigger now hooks the shared Basic Attack kill-credit path.
- Raise Servant and Death's Patience create Bone Servant state from Basic Attack defeats.
- Bone Servants render visibly on their Location tile.
- Preserves 3.29.1 solo-Hero round ownership and 1–4 Hero scaling fixes.

# Ascendance 3.29.1 — Solo Hero + 1–4 Player Scaling Fix

Built from 3.29.0.

Fixes:
- Round transitions no longer hard-code Aldric as the active Hero; the first Hero in the actual party remains active.
- Opening enemy scaling now uses the authored 2-Hero baseline: 1 Hero removes 1 ordinary enemy (minimum 1), 2 Heroes unchanged, 3 Heroes +1 ordinary, 4 Heroes +2 ordinary.
- Named, Elite, Boss, Legendary, objective enemies and later reinforcement waves are not intentionally scaled by this rule.
- Preserves 3.29.0 Hero Deck mechanics and 3.28.4 off-party deck-audit fix.

Verification performed:
- npm simulation suite: 438/438 passed.
- browser runtime: 16/16 passed, including solo Mordren remaining active into Round 2 and 3-Hero authoritative roster producing +1 additive setup scaling.
- server.js syntax passed.
- root/public index.html byte match passed.

Known browser harness warning: local file execution reports localStorage access denied; this is the existing harness environment warning.


## 3.29.4
Hero-created pieces now have an authoritative persistent object collection (`g.heroCreatedPieces3294`) with generic create/move/remove helpers and Location rendering. Existing Bone Servant/Spirit Totem state migrates and reconciles into it. Multiplayer Adventure Log restore now merges/deduplicates local and incoming history instead of replacing valid local entries.
