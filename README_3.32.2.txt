ASCENDANCE 3.32.2 — SERVER PHASE + CAMPAIGN AUTHORITY
=======================================================

Built from Ascendance 3.31.2 and preserves the confirmed 3.30.10 rule that a completed Quest may continue as normal gameplay until the party chooses Proceed to Downtime. Normal Actions, rounds, Enemy/World/End phases, Draw Step, Encounters, damage, Downed/revival/death, Explore, and Search rules continue to apply.

3.32.0 — Server-Owned Phase Job
--------------------------------
• The room/server owns the Enemy/World/End phase transaction lifecycle.
• When all Heroes finish, the server creates a unique phase transaction ID, server-generated random seed, authoritative pre-phase digest, and one designated resolver.
• ROUND_RESOLVE_RESULT must match the active transaction ID and pre-phase digest before the room accepts it.
• Only one legal result may commit; stale or mismatched phase results are rejected.
• Phase ownership is cleared safely if the resolver disconnects/errors so the room can recover.
• Random rolls made during the authored phase resolution use the server-issued seed.

IMPORTANT ARCHITECTURE NOTE:
The server owns phase identity, entropy, authorization, validation, and the canonical commit. The existing authored browser rules/reaction UI still executes on the single designated resolver client because many Enemy/Card reactions require interactive prompts. This build does not pretend that every authored reaction has been duplicated into a second headless rules implementation.

3.32.1 — Campaign Save / Rejoin Authority
------------------------------------------
• Room persistence now carries campaign authority metadata: roster, current Quest, Campaign Day, downtime state, and Hero rejoin claims.
• Each occupied Hero receives a cryptographically random rejoin credential.
• The same browser automatically presents that credential when rejoining.
• A disconnected Hero can be reclaimed if browser storage was lost; the credential rotates on successful recovery.
• A live duplicate Hero is still rejected.
• Voluntary leave/disconnect preserves the Hero claim; Host Kick releases it.
• Campaign save metadata includes roster + authority version so persisted rooms can restore exact campaign membership.
• New authority requests expose Campaign Save and active phase-job state for reconnect diagnostics.

3.32.2 — Legacy Write-Path Retirement
--------------------------------------
• New clients no longer transmit direct whole-game STATE writes.
• Historical internal STATE calls are converted at the transport boundary into GAME_PATCH_3322 compatibility patches.
• The server overlays canonical Turn, Combat, Hero, Exploration/Search/First Visit, and Resource ledgers before any compatibility patch can commit.
• Direct STATE mutation requests from old clients are deprecated/rejected instead of becoming room authority.
• Dead custom-Hero multiplayer join helpers were removed. Multiplayer remains the exact built-in H001–H016 roster.
• Existing compatibility/render wrappers that do not author canonical state remain in place to preserve authored gameplay behavior while the dangerous legacy write path is retired.

Authority stack now includes
----------------------------
• Turn / Actions / Pass / round progression — room authority
• Enemy HP / defeat / conditions — room combat ledger
• Hero HP / position / conditions — room Hero ledger
• Exploration pool / Search / Encounter / First Visit — room exploration ledger
• Cards / deck / hand / discard / inventory / equipment / Loot / consumables / Gold / progression — room resource ledger
• Enemy/World/End phase lifecycle + randomness + final commit — room phase job
• Campaign persistence / Hero membership / rejoin — room campaign authority
• Whole-game STATE writes — retired as an authority source

Verification
------------
• npm simulation: 438/438 PASS
• Full browser runtime regression: 19/19 PASS
• Targeted 3.32.2 browser authority regression: 6/6 PASS
• 3.32.2 architecture unit tests: 9/9 PASS
• 3.30.0 room turn authority unit: PASS
• 3.30.1 combat authority unit: PASS
• 3.30.2 Quest failure reset unit: PASS
• 3.30.3 Hero authority unit: PASS
• 3.30.7 Search terminal commit unit: PASS
• 3.30.10 post-Quest normal rules unit: PASS
• 3.31.2 resource/phase authority unit: PASS
• server.js syntax: PASS
• 85 inline browser scripts syntax: PASS
• index.html and public/index.html: byte-identical

The Playwright set_content harness reports its expected localStorage access-denied page error because the test page has no normal site origin. Functional browser checks pass.
