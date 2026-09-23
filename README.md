# Ascendance 3.12.0 — Q001 Defend Stonebrook

Built from the user-confirmed 3.10.0 baseline.

Q001 source: Ascendance_v10.10(10).xlsx. Implements the 8-location Q001 pool, starting Stonebrook enemies and 4 Villagers, Goblin Lookout Captain/Scout spawn, Fire and Villager objective actions, Goblin Villager priority, end-of-Enemy-Phase reinforcements, automatic win/fail, rewards, Campaign Day integration, and Q001 lobby selection.

Source ambiguity note: the quest says a Hero may spend 1 Action to “escort 1 Villager Token” but does not define a destination or Villager combat stats. The prototype operationalizes that action at Stonebrook as moving one Villager to safety/rescued, and a Goblin attack against an unrescued Villager removes one token. This is isolated to Q001 and can be revised if the tabletop rule is clarified.

Equipment reward note: Q001 says “draw 1 Equipment Card” without rarity. The prototype draws one Common Equipment card because the current digital inventory uses rarity-separated Equipment decks; this is isolated to the Q001 reward handler.

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

## 3.10.0 — Reveal / First Visit Rules Fix
- Audited Q003 location-pool Reveal Effects against Ascendance_v10.10(10).xlsx.
- L002 Dense Woods Concealing Brush now grants Hidden to the revealing Hero using the real status system.
- First Visit Travel Encounters now use each Location's printed Encounter Level as a fixed level.
- Fixed Encounter Levels do not roll 1d6 and do not receive the World Event severity modifier.
- L043 Foggy Meadow therefore resolves its First Visit Travel Encounter at fixed Encounter Level 2.
- Reveal Effects remain separate from First Visit Effects; revealing a Location does not trigger its First Visit encounter.


## 3.10.0 Encounter System Completion
- Centralized Encounter Severity resolution.
- Fixed Severity/Encounter Level: no d6 Severity Roll and no Severity Roll modifier.
- Unspecified Severity (including Search cards that only say Draw an Encounter): roll 1d6 and apply the active World Event Severity Roll modifier.
- Search-generated Encounters forward any explicit fixed severity instead of forcing a roll.
- Existing 3.9.4 Location First Visit fixed Encounter Levels are preserved.


## 3.12.0 — Q002 Rescue the Merchant Caravan
Adds Q002 location pool, caravan reveal setup, two Wagon/Supply tracks, escort movement, unattended-Wagon supply loss, reinforcement escalation, Captain/Strongbox quest items, automatic win/loss, rewards, and campaign-day integration.

## 3.13.0 — Seraphine Oathkeeper / Paladin
- Adds H006 Seraphine Oathkeeper as a third playable Hero.
- Level 1: 11 Health, Base Attack 1, Base Armor 1.
- Starting equipment: EQ003 Iron Longsword, EQ078 Iron Shield, EQ086 Chain Shirt, EQ105 Consecrated Rosary.
- Equipment capacity: 1 Weapon, 1 Shield, 1 Armor, 1 Accessory.
- Adds Seraphine's 20-card H006 Hero Deck with workbook copy counts.
- Adds Oathbound, core Paladin action-card play, movement, party display, map marker, inventory/equipment state, XP state, draw/discard/reshuffle, and local/remote ownership selection.
- Reaction cards remain trigger-based and are not exposed as normal Action buttons.
- Built from the corrected 3.12.0 Q002 package; 3.11.0 remains the last user-confirmed baseline until this branch is tested.


## 3.13.1 — Seraphine Remote UI Fix
- Remote Seraphine ownership now activates the remote-owned UI state, hiding local Hero control buttons.
- Remote Seraphine now displays Seraphine Oathkeeper in the Hero summary card with her HP, Armor, Attack, Actions, Range, and equipment instead of Sir Aldric.
- Added remoteSeraphine body state so only Seraphine Hero Deck is shown to her remote client.
- No gameplay, persistence, quest, or network protocol changes.
