Ascendance 3.35.0
=================

Source of truth: Ascendance_v10.49_Campaigns_V_VI_Complete.xlsx

Major additions
- Campaign V — The Drowned Tide: Q049–Q060 / WE017–WE020 / Ashenport / Doomtide 0–8.
- Campaign VI — Crown of the Fallen Sun: Q061–Q072 / WE021–WE024 / Sunspire / Sunfall 0–8.
- Level progression through Level 16 (9000 / 10400 / 11900 / 13500 XP for Levels 13–16).
- Q001–Q072 quest narrative previews.
- Party-shared named Faction Reputation synced through the room resource authority.
- World Map now treats Storm Coast and Sunscar Expanse as playable regions with local Reputation displays.

First Visit / Encounter spawn fix
- Later Encounter cards are no longer limited to the old EN001–EN030 switch.
- Generic E### expressions now spawn automatically, including expressions such as:
  1 E041
  2 E034 + 1 E033
  E090 + E088
  E092 with 3 damage
- If an enemy expression cannot produce an enemy, the local Encounter remains pending.
- The server also refuses to consume an Encounter-backed First Visit when a pure spawn encounter submits no enemy spawns.

Regression results
- Core simulation: 438 / 438.
- Server phase/campaign authority: 9 / 9.
- Campaign II regression: PASS.
- Campaign III/IV finale regression: PASS.
- Campaign V/VI Q049–Q072 direct-start regression: PASS.
- Q060/Q072 phase-transition/floor checks: PASS.
- First Visit generic-spawn regression: PASS.
- First Visit server spawn guard: PASS.
- Faction Reputation room-authority test: PASS.
