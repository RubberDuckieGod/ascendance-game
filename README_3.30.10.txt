Ascendance 3.30.10 — Normal Post-Quest Rules + Server-Enforced Exploration Actions

Corrects 3.30.9's finite-aftermath interpretation.
After a Quest completes, free exploration remains full normal gameplay until Proceed to Downtime:
- rounds continue normally
- Actions refresh normally each round
- Enemy / World / End phases continue
- Draw Step continues
- damage, Downed/death and revival rules continue
- Explore and Search still cost Actions

Multiplayer hardening:
- room atomically spends 1 Action on normal Explore/Search draw
- no Action is spent when there is no legal/eligible draw
- Search cancel refunds exactly once
- server rejects Explore/Search from a Downed Hero, a Passed Hero, or a Hero with 0 Actions
- Explore placement can trigger round completion when it clears the final pending prompt
- downed Heroes are excluded from round-completion requirements; if all Heroes are down, normal Defeat resolution can run
- client cannot double-spend or spam Explore between room syncs
