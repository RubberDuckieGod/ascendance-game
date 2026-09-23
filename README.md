# Ascendance 3.9.3 — Hidden Status Display Fix

Built from 3.9.2.

Targeted fix:
- Aldric's persistent Hero condition array is now included in the Party block STATUS display, matching Lyra.
- Hidden therefore appears as a normal status chip for Aldric when Foggy Meadow grants it.
- Added Hidden hover rules text.
- No targeting, movement, quest, save/load, multiplayer, or other gameplay systems were rewritten.

# Ascendance 3.9.2 — Quest & Campaign Integration
Built from user-confirmed 3.8.0.

Q003 is now objective-driven:
- Revealing L017 Fallen Watchtower automatically places 2 Goblin Scouts, 1 Goblin Archer, and the Beacon Token.
- A Hero in Fallen Watchtower spends 2 Actions to light the Beacon.
- While unlit, Goblin Scouts gain +1 Range.
- Once lit, Goblin Scouts lose 1 Movement for the remainder of Q003.
- Success resolves automatically when the Beacon is lit and all enemies occupying Fallen Watchtower are defeated.
- Failure resolves automatically if all Heroes are defeated, or after reveal if 3 consecutive rounds pass with no Hero occupying Fallen Watchtower.
- Live Quest panel tracks Watchtower, enemies, Beacon, and failure clock.
- Developer Complete/Fail buttons are removed.
- Retreat remains deliberate and consumes the Campaign Day.

Q003 reward resolves once: each surviving Hero +75 XP; Party +50 Gold; +1 Reputation; records WE002 first Travel Encounter reduction by 1 Goblin Scout.

Campaign rules remain persistent: every quest attempt consumes a Campaign Day; quest resolution occurs before final-day forced progression; unresolved required quests fail and unresolved optional quests become unavailable at forced progression; new World Events reset to Day 1.

Only Q003 has complete playable scenario automation in this build. Other campaign quests remain tracked; missing scenario maps/tokens/rules are not fabricated.

## 3.9.2 Location fixes
- Foggy Meadow Hidden Movement now applies through both Hero movement paths and explicitly records/synchronizes Hidden.
- Forgotten Remains now immediately opens a real Search against Ancient Ruins at the revealed remote Location without charging an Action.

## 3.9.4 — Reveal / First Visit Rules Fix
- Audited Q003 location-pool Reveal Effects against Ascendance_v10.10(10).xlsx.
- L002 Dense Woods Concealing Brush now grants Hidden to the revealing Hero using the real status system.
- First Visit Travel Encounters now use each Location's printed Encounter Level as a fixed level.
- Fixed Encounter Levels do not roll 1d6 and do not receive the World Event severity modifier.
- L043 Foggy Meadow therefore resolves its First Visit Travel Encounter at fixed Encounter Level 2.
- Reveal Effects remain separate from First Visit Effects; revealing a Location does not trigger its First Visit encounter.
