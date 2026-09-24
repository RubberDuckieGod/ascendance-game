# Ascendance 3.14.6 — Full Hero Card Runtime Audit

Built from the user-confirmed 3.14.4 Q001 baseline through 3.14.5. This pass fixes cross-hero runtime plumbing uncovered by the card audit: party-aware Inspired handling for Seraphine support cards, Divine Blessing on normal basic attacks for every current Hero, Seraphine-specific movement/terrain state, actual-party handling for location damage, and Q001/Shadow Signal kill hooks on normal attacks. Existing reaction-window implementations remain event-driven rather than clickable Action buttons.

# Ascendance 3.14.6 — Hero Card Audit / Rally Fix

Built from user-confirmed 3.14.4. Rally is now party-roster driven, can choose Aldric and/or actual Heroes in his Location, handles Stunned instead of Inspired, and expires Seraphine's Rally-created Inspired at the next round. Generic same-location Hero checks are now Seraphine-aware.

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


## 3.13.3 — Seraphine Remote UI Fix
- Remote Seraphine ownership now activates the remote-owned UI state, hiding local Hero control buttons.
- Remote Seraphine now displays Seraphine Oathkeeper in the Hero summary card with her HP, Armor, Attack, Actions, Range, and equipment instead of Sir Aldric.
- Added remoteSeraphine body state so only Seraphine Hero Deck is shown to her remote client.
- No gameplay, persistence, quest, or network protocol changes.


## 3.13.3 Seraphine Deck + Equipment Fix
- Moves Seraphine Hero Deck into the left Hero Deck rail alongside Aldric/Lyra.
- Remote Seraphine ownership now exposes the Seraphine deck in the correct rail.
- Adds Seraphine to inventory/equipment migration.
- Restores H006 starting equipment for existing saves when her equipment state is empty: EQ003 Iron Longsword, EQ078 Iron Shield, EQ086 Chain Shirt, EQ105 Consecrated Rosary.
- Inventory owner selection now recognizes Seraphine.


## 3.13.3 — Remote Hero Deck Visibility Fix
- Remote clients hide all Hero Deck panels first, then show only the owned Hero's deck.
- Fixes Seraphine's deck appearing under Aldric on Aldric's remote client.
- No gameplay or network transport changes.


## 3.13.4 — Seraphine Parity / Party Quest Fix
- Seraphine now spends her own Actions for Q001 villager/fire actions, Q002 wagon/strongbox actions, and Q003 beacon actions.
- Q001 objective explicitly displays Party Villagers so the rescued count is shared across the party.
- Adventure Log is now part of synchronized game state so remote players see the same gameplay events.
- Seraphine Hero Deck cards now use the same hover tooltip behavior as Aldric and Lyra, with H006 rules text loaded.
- Player summary now displays hoverable status chips for the controlled Hero, including Seraphine.
- Quest defeat/reward survivor checks now include Seraphine.


## 3.13.5 Party Roster / Turn Fix
- Remote games now track which Heroes have actually joined the party.
- Enemies only target Heroes in the saved party roster; absent Lyra will no longer trigger Lyra reaction prompts.
- Party panel only lists Heroes in the party.
- End-of-round draw/action refresh only applies to party Heroes.
- Multiplayer server announces connected Hero roles and the roster is persisted in game state.
- Reverted the 3.13.4 Q001 label-only change from `Party Villagers` back to the prior `Villagers` wording; shared quest counting logic is unchanged.


## 3.13.8 — Actual Party Roster Fix
- New remote games initialize with only the creating player's Hero in the party; additional Heroes are added only when those players join.
- Absent Heroes no longer receive opening hands or opening-hand Adventure Log entries.
- Absent Heroes no longer appear as map markers, Hero Deck panels, or local Control buttons.
- A newly joining Hero receives their opening hand when first added to the party.
- Restart preserves the current party roster.
- Existing turn/target/reward roster filtering from 3.13.5 is retained.


## 3.13.8 — No Hero Control Buttons
- Removed the Party-panel Control Aldric / Control Lyra / Control Seraphine buttons entirely.
- Removed their click bindings so no missing-element error is introduced.
- Remote hero ownership remains determined by the hero selected when joining the room; players cannot switch heroes from the game board.
- Preserves 3.13.6 party-roster initialization and 3.13.4 Seraphine parity fixes.


## 3.13.8 — Seraphine Enemy Defense Fix
- Enemy attacks targeting Seraphine now use `seraphineArmor()` instead of Lyra's Armor.
- Seraphine no longer enters Lyra-only enemy reaction windows when she is attacked.
- Enemy engagement detection now includes Seraphine when she is an active party member.
- Sanctuary damage reduction is applied when Seraphine is the target while Sanctuary is active.
- Existing Aldric and Lyra attack resolution is preserved.


## 3.13.9 — Remote Location Placement Sync Fix
- Location placement is now treated as an immediate committed multiplayer mutation and is pushed to the room as soon as the tile is placed.
- The exact tile coordinates and rotation selected by the exploring player now synchronize immediately to the other remote player.
- Removed the shared Adventure Log mutation that occurred every time a remote STATE snapshot was applied; this could cause a peer to echo a just-restored snapshot back and race a fresh placement. Restore status remains visible in the sync/status UI.
- No location legality, Explore cost, quest, combat, Hero, or server persistence rules changed.


## 3.14.2 — Hero Card Targeting Audit
- Audited active Hero card effects against the current Hero Deck Cards source data.
- Aldric allied-Hero cards no longer hardcode Lyra: Rally, Coordinated Strike, Hold Fast, Shield Escort, Unyielding Stand, Last Bastion, Heroic Charge, and Interpose/protection now target only Heroes actually in the party.
- Rally now applies Inspired/Stunned replacement to the selected present ally (e.g. Seraphine in an Aldric + Seraphine party).
- Seraphine support cards now filter to the actual party roster; absent Lyra is not offered or modified.
- Faithful Advance can move one present allied Hero with Seraphine as written.
- Seraphine can receive Aldric ally Armor effects and Aldric protection reactions when eligible.
- Several generic Hero helpers now recognize Seraphine instead of falling through to Aldric.


## 3.14.2 Coordinated Strike Fix
- Coordinated Strike now routes the chosen ally's granted attack through that Hero's real basic-attack engine instead of a duplicate damage calculation.
- Seraphine therefore uses Seraphine attack/status/equipment logic; Lyra uses Lyra attack/status/equipment logic.
- The optional enemy move is offered only when the granted attack dealt damage and the enemy survived.
- Party/ownership rules from 3.14.0 are preserved.


## 3.14.2 — All Hero Cards Implemented
- Completed Battlefield Assessment reveal option using the live Location placement system.
- Completed Veteran's Resolve condition-removal option.
- Audited Aldric, Lyra, and Seraphine Hero-card controllers against the current Hero Deck Cards source.
- Completed Seraphine card gaps: Cleansing Blow ally targeting, Smite Evil condition, Divine Smite armor ignore, Hammer of Judgment movement, Avenging Light retaliation/armor ignore/heal, Divine Blessing consumption, Divine Intercession reaction, Stand Firm status prevention, Sanctuary party protection, and Oathbound healing trigger.
- Seraphine now receives Aldric team Armor effects when eligible.
- Fixed Search Action refund for Seraphine.
- No multiplayer transport/server persistence rewrite.


## 3.14.3 — Hold Fast + roster-driven reveal fix
- Hold Fast now snapshots only allied Heroes actually in the current party and in Aldric's Location or a connected Location.
- +1 Armor and Inspired remain attached to those chosen Heroes until Aldric's next turn even if they move afterward.
- Added per-Hero first forced-movement protection state for Hold Fast.
- Seraphine's Hold Fast status and temporary Inspired cleanup are handled correctly.
- Special Location reveal ownership is restricted to Heroes actually in the current party; absent Heroes cannot own reveal/First Visit resolution.


## 3.14.4 Q001 Victory + Reinforcement Fix
- Stonebrook pre-Captain reinforcements stop permanently as soon as the Goblin Captain enters play.
- Q001 objective resolution is checked immediately when an enemy is defeated through Aldric, Lyra, or Seraphine attack engines, so defeating the Captain can immediately complete the quest once the villager/fire requirements are met.
- Preserves 3.14.3 Hold Fast and roster-driven reveal fixes.
