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
