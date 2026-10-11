Ascendance 3.34.0 — Campaigns III & IV + Hero Levels 9–12

BASELINE
- Built directly on Ascendance 3.33.0 Campaign II.
- Preserves the 3.32.2 room/server-authoritative protocol and Campaign II runtime.
- Campaigns III and IV are added as a final-loaded content/runtime module.

SOURCE OF TRUTH
- Ascendance v10.46 Campaign IV Complete — Dashboard Fixed.

CONTENT ADDED
- WE009–WE012 / Q025–Q036 — Campaign III: Heart of the Mountain.
- L088–L124, E051–E068, EN046–EN060, LT167–LT172.
- Ironhaven hub; persistent Mountain Stability / Instability 0–8.
- WE013–WE016 / Q037–Q048 — Campaign IV: The Withering Wilds.
- L125–L161, E069–E087, EN061–EN075, LT173–LT178.
- Eldergrove hub; persistent Blight 0–8.
- Hero progression thresholds: Level 9 4400 XP, Level 10 5400 XP, Level 11 6500 XP, Level 12 7700 XP.
- Workbook Hero progression rows for all 16 Heroes at Levels 9–12 are loaded into the website workbook database.

STANDALONE ENTRY
- Direct Q025: Level 7 / 2700 XP, 150 Gold per Hero, Rare/Epic/Legendary equipment package, Blacksmithing/Artificing mastery defaults.
- Direct Q037: Level 9 / 4400 XP, 200 Gold per Hero, Rare/Epic/Legendary/Mythic equipment package, Alchemy/Enchanting mastery defaults.

RUNTIME
- Campaign III/IV use the existing generic map, combat, inventory, quest, campaign, room-authority, and server-phase systems.
- Quest-specific objective counters, boss floors/transitions, end-phase timers, campaign rewards, final no-retreat rules, regional encounter isolation, Instability/Blight persistence, and campaign victory state are handled by campaign34-3340.js.
- Root and /public copies of the expansion module and index are identical.

STATUS
- Campaigns III and IV remain Playtest, not Print Lock.
- Q036 and Q048 remain critical live-playtest balance gates, particularly small-party floor and 4-Hero completionist ceiling.
