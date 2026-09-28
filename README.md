# Ascendance 3.26.20 — Host-Authoritative Multiplayer Party Merge

Live failure confirmed:
- Dennis could host custom CH003.
- Rowan joining overwrote Dennis's room state.
- When Rowan hosted, Dennis could not reliably appear.

Root cause:
The server accepted `STATE` from every connected client. The legacy join flow also immediately added the joiner's Hero locally and scheduled a full-state upload. Therefore the newest joiner could replace the host's entire authoritative game. The server's PARTY_ROSTER additionally filtered roles to the ten built-in Hero IDs, excluding CH### custom Heroes.

Architecture fix:
- Room creator/host is authoritative for whole-game STATE.
- Server ignores full STATE writes from non-host clients and returns authoritative host state instead.
- PARTY_ROSTER now carries any connected Hero ID, including custom CH### IDs.
- JOIN carries the joiner's custom Hero definition when applicable.
- Server forwards `HERO_JOIN_REQUEST` to the host.
- Host registers the custom definition, initializes the joining Hero if new, adds it to the existing party at Stonebrook, and broadcasts the merged authoritative state.
- Built-in joiners use the same host merge principle.
- Reconnect does not reset an existing Hero's live deck/position/equipment.
- Non-host state watcher/scheduler can no longer overwrite the room.
- Host state continues to persist on the server.

This directly addresses Rowan overwriting Dennis and Dennis failing to appear when Rowan hosts.

# Ascendance 3.26.19 — Remote Custom Hero Definition Sync

Live 3.26.18 remote-game screenshot confirmed the host had Dennis's correct stats, equipment, deck initialization, and Stonebrook placement, but the map rendered the custom runtime ID `CH003`.

Root cause:
Remote peers/game-state consumers could receive `partyHeroes: ["CH003"]` before they had the Character Creator definition that says `CH003 = Dennis`. UI post-processing alone is insufficient because custom identity is needed by validation, rendering, deck/equipment lookup, reconnects, and ownership.

Fix:
- Every serialized multiplayer/game-state payload now includes full custom definitions for custom Heroes in the active party.
- Definitions include custom ID, display name, class/archetype, stats, saved starting equipment, innate text, and saved Hero Deck definition.
- Incoming definitions are merged into local custom-Hero storage and registered with runtime Hero/deck tables BEFORE legacy state application sees the party IDs.
- Party roster is restored after state application using the newly registered IDs.
- `heroDisplayName()` resolves synchronized custom definitions.
- Map marks convert `CH###` runtime IDs to the synchronized Hero name.
- Remote room creation schedules an immediate state broadcast containing the definition.
- Subsequent state broadcasts refresh the live custom-definition bundle for reconnect recovery.
- Earlier `customHeroDefinitions32615/32616` fields remain readable for compatibility.
- Added `ascendanceRemoteCustomAudit32619()` for live inspection.

Preserves 3.26.18 equipment normalization, 3.26.17 custom deck repair, and all earlier fixes.

# Ascendance 3.26.18 — Custom Hero Map Name + Equipment Normalization

Live screenshot from 3.26.17 confirmed:
- Dennis custom identity works in Hero summary.
- Dennis is at Stonebrook.
- repeated undefined deck-repair spam is gone.
- Remaining defects: map mark displayed archetype/runtime `Rowan`; Hero summary displayed `Weapon None`.

Fix:
- Map's expanded-Hero mark now resolves custom runtime IDs through Character Creator display name after core map rendering.
- Starting equipment normalization now reads both normalized runtime equipment fields and raw workbook fields (`Type`, `Slot`, `Family`, `Name`).
- Weapon, Shield, Armor/Robe, Focus/Accessory mappings are normalized for custom Heroes.
- If a custom Hero has saved starting equipment but its runtime equipment is completely empty, the game repairs it from the saved Character Creator record.
- It does NOT overwrite equipment after the Hero starts changing gear.
- Custom summary name/stats/actions/equipment are reasserted after legacy render.
- Existing affected game state can self-repair on render; fresh game is not required for this specific display/equipment repair.
- Added `ascendanceCustomAudit32618()`.

Preserves 3.26.17 custom deck validation and all prior fixes.

# Ascendance 3.26.17 — Custom Hero Identity / Deck / Stonebrook Fix

Observed live symptom:
- Custom Hero Dennis generated repeated `HERO DECK REPAIR ... undefined source cards` log entries.
- UI/control fell back to Rowan Greenward.
- Custom Hero placement/identity was not reliably Stonebrook.

Root cause:
The 3.25.4 deck integrity audit validates expanded-Hero cards by `HERO_ID_3254[hero]`. That table only contains the ten built-in Heroes. A custom runtime ID therefore resolves to `undefined`, causing every legitimate saved card to fail validation on every render. The repair loop rebuilt the deck repeatedly and logged `undefined source cards`. Separately, legacy controlled-Hero fallbacks could display/control a built-in archetype rather than the custom runtime identity.

Fix:
- Custom deck validation now checks cards against the exact card IDs saved in that Character Creator record.
- Custom deck repair rebuilds from the saved Character Creator 30-card definition, never an undefined built-in source.
- Custom New Game explicitly restores the exact saved 30-card deck and draws exactly 5.
- Custom Hero identity is authoritative in controlledHero for local/remote play.
- Custom Hero position/action paths use the custom extraHero state.
- New custom Hero starts at x=0,y=0 (Stonebrook).
- Incoming multiplayer state preserves live custom deck and position; it does not reset them every sync.
- Added `ascendanceCustomAudit32617()` for runtime inspection.

Preserves all earlier fixes.

# Ascendance 3.26.16 — True-End Custom Hero Runtime Authority

Root cause found after 3.26.15:
The historical index file contains several 3.25.x runtime scripts physically after the document's closing `</html>` tag. Browsers still execute them. The earlier 3.26.13-15 custom-Hero integration patches were inserted before `</body>`, so legacy 3.25.33/3.25.34 and related fixed-ten-Hero closures executed afterward and could reclaim/filter runtime behavior.

3.26.16 intentionally installs its custom-Hero authority at the TRUE END OF FILE, after every legacy script.

- Final Hero validator accepts H001-H010 and saved custom IDs.
- Final New Game path initializes scenario systems through the proven legacy seed, then installs the selected custom Hero only after all old init wrappers return.
- Final Join path preserves the custom ID through mpRole/mpConnect.
- Final synchronized Load/state application restores embedded custom definitions and authoritative custom rosters after old fixed-ten filters finish.
- Final serializer embeds custom definitions for save/sync.
- Custom Hero receives saved stats, deck, 5-card hand, equipment, progression containers, and Healing Potion.
- Built-in New Game/Join continues through the existing proven path unchanged.
- Runtime errors in custom Create/Join now surface an explicit alert instead of silently appearing to do nothing.

Static validation: root/public byte-identical, combined JavaScript syntax passes Node check, server syntax passes, full multiplayer ZIP integrity passes, required server/package/root/public files present, forbidden 3.25.36 startup regression string absent.

# Ascendance 3.26.15 — Custom Hero Create / Load / Join Boundary Fix

Root cause:
3.26.13/14 added saved custom Heroes to the UI and general validation, but older 3.25.28 and 3.25.30 multiplayer/startup closures still contain fixed arrays of the ten built-in Heroes. Those later runtime paths stripped custom IDs during Create, synchronized Load, and Join.

Fix:
- New Game custom selection now survives all legacy fixed-roster wrappers and becomes the actual sole starting party Hero.
- Custom Hero starts with saved stats, saved 30-card deck, 5-card opening hand, saved starting equipment, and LT002.
- Serialized game state now embeds the custom Hero definition for every custom Hero in the party.
- Remote Join imports those definitions before applying the synchronized state, so another player's browser can reconstruct a custom Hero it did not create locally.
- Incoming synchronized party rosters accept built-in or registered custom Hero IDs.
- Multiplayer ownership recognizes custom IDs before connection.
- File saves produced after this build carry the custom definitions through serializable game state, allowing Load to reconstruct them.
- Built-in Hero behavior and the proven 3.25.37 standard startup path remain unchanged.

Includes console helper `ascendanceCustomBoundaryAudit32615()` for live verification.

# Ascendance 3.26.14 — Custom Character Delete Manager

Character Creator now includes a Saved Custom Characters manager.

- Lists every locally saved custom character with class, HP, Attack, Armor, deck size, and starting-equipment count.
- Delete button requires confirmation with the character's name.
- Deleting removes the Character Creator record and immediately removes that Hero from New Game, Join Multiplayer Game, and multiplayer Player selectors.
- Built-in H001-H010 Heroes cannot be deleted.
- Campaign save files are not deleted.
- If the deleted Hero is already in the currently loaded campaign, its current campaign state is left intact so deleting the reusable creator template cannot corrupt an active game.
- Newly saved custom characters immediately appear in the manager.

Preserves 3.26.13 custom-Hero game integration, 3.26.12 equipment audit, and earlier fixes.

# Ascendance 3.26.13 — Custom Hero Save + Game Integration

Fixes the two missing Character Creator bridges:

1. Equipment persistence
- Save Character now copies the exact equipment selected by the 3.26.9 equipment UI into the saved custom-Hero record.
- The save confirmation reports how many starting equipment items were saved.
- Custom Robe maps into the runtime Armor slot and Arcane Focus maps into the runtime Accessory collection so their effects remain discoverable by equipment mechanics.

2. Playable saved custom characters
- Saved custom Heroes are automatically added to the Your Hero selector on New Game.
- They are also added to Join Multiplayer Game and the multiplayer Player selector.
- Selecting a custom Hero registers its saved name, stats, 30-card deck, class, and starting equipment with the existing expanded-Hero runtime.
- New Game initializes the custom Hero with its saved max Health/base Attack/base Armor, saved deck, saved equipment, 5-card opening hand, and LT002 Healing Potion.
- Multiplayer local ownership recognizes the custom Hero ID before connecting.

This is an integration patch around the existing proven Begin Adventure function; the 3.25.37 startup path itself is not replaced.
Preserves 3.26.12 equipment action-economy audit and all earlier fixes.

# Ascendance 3.26.12 — Legacy Mana Equipment Action-Economy Audit

Audited every Equipment card whose rules referenced Mana. There were exactly three: EQ067 Archmage's Staff, EQ074 Wand of Time, and EQ076 Scepter of Ascendance.

Converted rules:
- EQ067 Arcane Mastery: first Spell each round costs 2 fewer Actions (minimum 0).
- EQ067 Spell Echo: once per Encounter, after a Spell, resolve that same Spell one additional time without spending Actions.
- EQ074 Accelerate: first Spell each Encounter costs 0 Actions.
- EQ076 Arcane Conduit: once per round after a Spell, optionally play a different Spell with printed Action Cost 2 or less from hand for 0 Actions.
- EQ076 Ascendant Will: immunity to Silenced and Disarmed is enforced through the shared condition helper.

Runtime implementation:
- Discounts are calculated in the actual extra/custom Hero card cost path and shown in the hand UI.
- Uses are consumed only after successful card resolution.
- Encounter-limited effects key off the tracked active Encounter token.
- Round-limited effects key off the current round.
- Spell Echo and Arcane Conduit create explicit follow-up choices and do not charge Actions.
- Existing EQ061 Apprentice's Staff functionality remains.

Note: LT062 Mana Crystal remains unchanged because it is the proper name of a crafting material, not a Mana resource mechanic.

# Ascendance 3.26.11 — Apprentice's Staff Runtime Functionality

EQ061 Apprentice's Staff now implements its printed Arcane Focus ability in gameplay.

- While Apprentice's Staff is equipped, the first Action-speed Hero Ability/card actually played during a tracked Encounter costs 1 less Action.
- Minimum cost is 0.
- The discount is consumed only after the card successfully resolves and enters discard; cancelled/illegal attempts do not waste it.
- The used state is keyed to the active Encounter token, so a new Encounter makes the staff available again automatically.
- The hand button displays the discounted Action cost before play.
- Vaelis's existing first-Spell-per-round discount remains intact and stacks with the staff; the staff can take the final cost to 0.
- The Adventure Log records when Arcane Focus is consumed.
- The staff does not reset every round and does not apply outside the game's tracked Encounter system.

Preserves 3.26.10 wording, 3.26.9 equipment rendering, 3.26.8 stat/loadout rules, and 3.26.7 Q002/Snare fixes.

# Ascendance 3.26.10 — Apprentice's Staff Action Wording

Apprentice's Staff now reads:
"Arcane Focus — The first Ability you use each encounter costs 1 less Action (minimum 0)."

Replaced the old Mana wording in all embedded copies used by the runtime and Character Creator.

# Ascendance 3.26.9 — Starting Equipment Render Fix

- Restores the Starting Equipment card list in Create Character.
- Uses the embedded workbook Equipment table directly (120 equipment rows).
- Common equipment plus the selected archetype's listed starter pieces are rendered.
- Wizard correctly exposes Weapon, Robe, Focus, and Accessory capacities.
- Wizard canonical starter pieces include Apprentice's Staff (EQ061), Robes of the Adept (EQ095), and Arcane Lens (EQ106).
- Equipment selection persists across stat/name changes and resets only when archetype changes.
- Preserves the 12-point stat-budget enforcement from 3.26.8 and Q002/Snare fixes from 3.26.7.

# Ascendance 3.26.8 — Character Creator Stat Budget & Caster Loadout Fix

Character Creator fixes:
- Removes arbitrary individual caps of Health 12, Attack 4, and Armor 3.
- Keeps the shared 12-point creation budget authoritative at all times.
- Dynamic maxima are derived from remaining points, so the creator cannot build above 12 total points.
- Wizard/Druid caster capacities now understand Robe and Focus slots instead of dropping them.
- Robes of the Adept is treated as a Robe; Arcane Lens is treated as a Focus.
- Starting equipment shows Common equipment plus the selected archetype's canonical workbook starter pieces, so Wizard can fill Weapon, Robe, Arcane Focus, and Accessory capacities.
- Preserves 3.26.7 Q002/Snare fixes and all prior confirmed gameplay fixes.

# Ascendance 3.26.7 — Q002 & Snare Runtime Fix

- Repairs missing L010 Goblin Encampment and L047 Merchant Caravan in active Q002 pools before reveal.
- Prevents Q002 from exhausting its objective pool without the Merchant Caravan.
- Q002 reinforcement and encounter spawn entry now triggers Rowan's Set Snare: 2 damage + Rooted, then remove Snare.
- Existing movement-based Snare trigger remains.
- Current quest is visually labeled Active in the World Event strip while internal campaign status remains unchanged.
- Preserves Character Creator 3.26.2–3.26.6 and confirmed 3.25.65 gameplay fixes.

# Ascendance 3.26.6 — Unified Equipment Capacity

Fixes the mismatch where the UI showed Weapon 0/1 but clicking a Weapon reported no Weapon slot. The equipment display, add/remove handler, and save validation now all use the same 3.26.5 archetype-capacity authority.

# Ascendance 3.26.5 — Equipment Slot Capacity Fix

Fixes all equipment + buttons becoming disabled. Equipment eligibility is now calculated only from the selected archetype's actual Equipment Capacity and current equipment selections; name/stats/deck fields do not affect it.

# Ascendance 3.26.4 — Equipment Persistence Fix

Changing Health, Attack, or Armor no longer clears/replaces selected Starting Equipment. Archetype changes still intentionally reset equipment because capacity can change.

# Ascendance 3.26.3 — Equipment Builder

Keeps the confirmed 3.26.2 creator-open behavior and replaces the Starting Equipment picker.

- Uses the complete Common Equipment pool from Ascendance's embedded workbook database.
- Filters/searches by Weapon, Shield, Armor, and Accessory.
- Shows Family, Hands, Attack bonus, rarity, and Ability 1.
- Parses the selected archetype's actual Equipment Capacity.
- Live requirement tracker (for example Weapon 0/1, Armor 1/1, Accessory 0/2).
- Prevents selecting more items than a slot allows.
- Save Character is rejected until every required equipment slot is filled exactly.
- Saved CH### startingEquipment uses the validated selection.

No confirmed gameplay/startup path was wrapped or changed.

# Ascendance 3.26.2 — Character Creator Rebuild

Rebuilt cleanly from confirmed 3.25.65 after the 3.26.0/3.26.1 creator-open failure.

Create Character now has an independent head-level open/close handler. Opening the creator does not depend on game initialization or custom-Hero registration. Creator data is embedded from the existing workbook database.

This build deliberately does not wrap Begin Adventure or init.

Creator includes archetype/species, 12-point Health/Attack/Armor, Common starting equipment, exactly 30 cards from all Level-1 H001–H010 Hero Deck cards, printed copy limits, filters/search, and CH001+ local saves.

# Ascendance 3.25.65 — Q002 Missing Runtime Locations

Root-cause correction for the Q002 pool showing 5 instead of 8. The Q002 scenario pool already named all eight intended tiles, but the live `LOCS` runtime catalog did not contain L004 River Crossing, L010 Goblin Encampment, or L013 Ancient Stone Bridge. Because `init()` filters the scenario pool through `LOCS`, those three IDs were silently discarded.

This build adds those three workbook-backed Location definitions to `LOCS`. Q002 can therefore build all 8 exploration tiles plus starting Stonebrook. The 3.25.64 repair remains as a migration safety net for restored/current Q002 state.

All 3.25.61–3.25.64 fixes are preserved.

# Ascendance 3.25.64 — Q002 Expanded Location Pool Repair

Q002 is locked to the expanded quest-location design: L001 Forest Path, L003 Woodland Clearing, L004 River Crossing, L007 Abandoned Campsite, L010 Goblin Encampment, L013 Ancient Stone Bridge, L043 Foggy Meadow, and L047 Merchant Caravan, plus starting L000 Stonebrook.

The base init already listed this pool, but this build adds a final scenario-authority repair so campaign transitions/restored saves cannot leave Q002 with the obsolete four-card pool. Missing Q002 tiles are restored without duplicating already revealed or pooled Locations.

3.25.63 Secret Footpath, 3.25.62 Old Ranger Signal, Campaign Saves, Q002 Wagon behavior, revival/party-defeat, Downed lockout, multiplayer, and locked startup behavior are preserved.

# Ascendance 3.25.63 — Secret Footpath Free Move Fix

Fixes SD022 Secret Footpath. The card's printed immediate free Move no longer relies on the normal Move/action handler. After the reveal/Search effect resolves, the exploring Hero is offered one connected revealed Location and may immediately move there for 0 Actions if not Engaged. The move preserves the Hero's current Action count and uses normal Location-entry / First Visit handling.

3.25.62 Old Ranger Signal placement, Campaign Saves, Q002 Wagon behavior, revival/party-defeat, Downed lockout, multiplayer, and startup behavior are preserved.

# Ascendance 3.25.62 — Old Ranger Signal Placement Fix

Fixes SD021 Old Ranger Signal when the effect triggers but the player cannot place the Location. The previous implementation called normal `explore()`, which immediately exits whenever the Explore action button is disabled. SD021 now opens the normal legal Location placement interface directly after the Search closes, draws/skips Locations using the existing legal-placement rules, and spends 0 Actions.

Existing Campaign Saves restoration, action-button styling, Q002 Wagon AI/supply display, revival/party-defeat fix, Downed lockout, multiplayer, and startup behavior are preserved.

# Ascendance 3.25.61 — Restore Campaign Saves

Restores the existing Campaign Saves button to the gameplay header. The 3.25.53 layout CSS accidentally hid `#campaignSavesBtn32542`; the underlying confirmed 3.25.42 save manager was still present. No campaign-save logic or gameplay logic was rewritten. Save Current Campaign, New Campaign, Continue, Rename, Duplicate, and Delete remain the existing implementation.

# Ascendance 3.25.60 — Action Button State Polish

Presentation-only correction to the bottom action bar. Enabled actions use readable parchment/gold text and stronger gold borders. Disabled actions use a neutral charcoal treatment with readable muted text instead of the muddy brown/low-contrast state. Gameplay logic is unchanged.

# Ascendance 3.25.59 — Q002 Wagon Supply & Goblin Priority

- Q002 Wagons now begin with 4 Supply each.
- Each active Wagon is visibly represented on its Location tile with Wagon number and four Supply pips / remaining count.
- During Q002, Goblins select an active Wagon as their primary objective before selecting Heroes.
- Goblins move toward the nearest active Wagon. If they reach an unattended Wagon, the existing raid removes 1 Supply. If a Hero is guarding that Wagon, the Goblin can fight the guard instead.
- A Goblin that cannot reach the Wagon during its activation continues pursuing it rather than abandoning the objective to attack another Hero.
- Existing Q002 destroyed-Wagon failure, revive/party-defeat fix, Downed lockout, Downtime, UI, multiplayer and startup behavior preserved.

# Ascendance 3.25.58 — Revive & Party Defeat Fix

Fixes false all-Hero defeat after a Hero has been revived. Party defeat now reads the authoritative current party roster and each Hero's live HP directly. Healing a 0-HP Hero above 0 explicitly clears stale Downed/Lost fate state without resetting or stripping Level, XP, Equipment, Inventory, deck, hand, or discard. Includes a final guard preventing an all-Hero defeat resolution while any current party Hero has HP above 0.

# Ascendance 3.25.57 — Final Downed Hero Gate

Installs a final runtime action gate after legacy wrappers. A controlled Hero at 0 HP cannot Attack, Move, Explore, Search, Pass/Hold, or play Hero cards. Extra-Hero card buttons are also disabled. Built on 3.25.56; prior UI, Downtime, Q002, multiplayer, and startup behavior preserved.

# Ascendance 3.25.56 — Downed Hero Lockout

Fixes expanded Heroes (H004–H010) incorrectly inheriting Aldric's HP check in `heroDefeated()`. This allowed a 0-HP Hero such as Rowan to remain actionable whenever Aldric was alive.

- `heroDefeated()` now reads each Hero's actual state, including `extraHeroes`.
- Direct Basic Attack and Hero-card entry points now hard-block Downed Heroes as a safety layer.
- Existing UI/action availability that relies on `heroDefeated()` now receives the correct state for Rowan, Elara, Vaelis, Thorne, Cassian, Kael, and Mira.
- 3.25.55 tabletop UI, 3.25.54 Downtime access, and 3.25.51 Q002 failure behavior preserved.

# Ascendance 3.25.55 — Tabletop Polish

Presentation-only polish built on the confirmed 3.25.54 baseline.

- Stronger physical-board treatment for the map and Location tiles.
- Clearer tile hover/selection/occupancy cues.
- Enemy pieces have a distinct threat treatment.
- Hero command panel and combat stats have stronger visual hierarchy.
- Hero cards look more like playable cards and less like form controls.
- Core action bar is visually separated from secondary UI.
- Quest progress, Location information, and Adventure Log are easier to scan.
- Consistent button hover/press feedback.
- 3.25.54 Downtime access fix and 3.25.51 Q002 failure logic preserved.
- No gameplay formulas, Quest rules, multiplayer startup, campaign progression, or card effects intentionally changed.

# Ascendance 3.25.54 — Downtime Access Fix

Fixes the 3.25.53 UI layering regression where the Between Adventures / Campaign Downtime transition modal sat above Inventory & Equipment and prevented access to the actual Downtime tab.

- Between Adventures is now a compact in-page transition panel.
- The existing Inventory & Equipment overlay remains the dedicated Merchant / Crafting / Downtime screen.
- Inventory overlay is explicitly above normal gameplay chrome.
- No gameplay rules or formulas changed.
- 3.25.51 Q002 impossible-victory failure behavior remains intact.

# Ascendance 3.25.53 — Gameplay Layout

Presentation-only follow-up to the confirmed 3.25.51 gameplay baseline and 3.25.52 visual foundation.

## UI changes
- Reserves a dedicated right rail for Adventure Log so it no longer covers gameplay.
- Compacts the Quest objective area and Campaign/World Event strip.
- Moves Quest-transition/Downtime content into a centered dedicated overlay.
- Hides the giant on-page development history from the play surface.
- Reduces top navigation clutter while keeping player-facing Campaign/Quest/Profile/Journal controls.
- Gives the map the majority of the viewport and keeps primary actions attached to it.
- Makes Hero/Location and left card rails independently scrollable on desktop.
- Adds responsive fallbacks for narrower screens.

No combat, Quest, campaign, multiplayer, card, inventory, or startup rules were intentionally changed.

# Ascendance 3.25.52 — Gameplay UI Foundation

Presentation-only first polish pass built on the confirmed 3.25.51 baseline. Adds a cohesive high-fantasy visual system, stronger Quest/Campaign hierarchy, improved map tiles/enemies, Hero command card, action bar, Adventure Log readability, lobby/overlay polish, and responsive cleanup. No gameplay formulas, Quest logic, multiplayer startup, or campaign lifecycle behavior were intentionally changed.

# Ascendance 3.25.51 — Q002 Impossible Victory Fail

Preserves the original Q002 Wagon raid rule and victory requirement. When either Wagon reaches 0 Supply and is destroyed, Q002 now immediately resolves as Failed because rescuing both Wagons is no longer possible. Combat Feedback from 3.25.50 is unchanged.

# Ascendance 3.25.50 — Combat Feedback

Adds detailed Adventure Log breakdowns to the actual Basic Attack and Enemy Attack runtime paths without changing combat formulas. Hero logs show attack components, total, enemy armor, and damage. Enemy logs show d6, attack, effective armor, and pre-reaction damage; existing post-reaction resolution logs remain authoritative.

# Ascendance 3.25.49 — Inventory Display Names

Hero Profile inventory now resolves Loot/Consumable IDs through the existing lootById() data before falling back to equipment IDs. Internal IDs remain unchanged; LT002 displays as Healing Potion.

# Ascendance 3.25.48 — Campaign Journal

Adds a read-only Campaign Journal over the game's existing campaign.history. New Quest outcome records also snapshot participating Hero names and persistent kill totals. No Quest resolution/startup wrappers were added.

# Ascendance 3.25.47 — Hero Profile Roster Cleanup

Preserves the working 3.25.46 Hero Profile body. Profile tabs now come only from the live Active Party plus Heroes explicitly marked Away, preventing stale legacy Aldric campaignRoster entries from appearing.

# Ascendance 3.25.46 — Hero Profile Authoritative Roster

Rebased from confirmed 3.25.43. Hero Profile uses campaignRoster32534 as the authoritative roster, never mpRole/default Aldric, and reads awayHeroes32534 as the object map it actually is.

# Ascendance 3.25.43 — World Event / Quest Selection

Adds a campaign progression board for World Events and Quest selection, preserving the confirmed startup, save manager, and multiplayer paths.

# Ascendance 3.25.42 — Campaign Save Manager

Adds local multi-campaign Save/Continue/Rename/Duplicate/Delete management without changing the confirmed Begin Adventure path.

# Ascendance 3.25.41 — Quest Briefing Data

Quest Briefing now reads the active quest panel/runtime data for objective, victory/failure, Campaign Day, and available special/world-event text. Begin Adventure remains untouched.

# Ascendance 3.25.40 — Campaign Hub Data Fix

Defensive campaign snapshot/rendering and visible runtime diagnostics. Begin Adventure path remains unchanged.

# Ascendance 3.25.39 — Campaign Hub Render Fix

Fixes the blank Campaign Hub while preserving the confirmed 3.25.37 Begin Adventure path.

# Ascendance 3.25.38 — Campaign UX Phase 1

Adds a non-invasive Campaign Hub, Session Lobby, and Quest Briefing UI on top of the confirmed 3.25.37 startup baseline. Does not wrap init() or lobbyBeginNew().

# Ascendance 3.25.37 — Begin Adventure Recovery

# Ascendance 3.25.34 — Campaign Roster / Away + Returning Heroes

Adds a persistent campaign roster separate from the active Quest party. Players can leave for now without deleting Hero progression; hosts can set another player Away; returning Heroes rejoin their existing campaign identity. If the campaign has advanced to a different Quest while they were Away, the returning Hero receives a fresh 5-card Quest hand and is placed with the party when together, otherwise at the Quest start. Kick remains available as a separate host moderation action.

# Ascendance 3.25.33 — Host Party Management

Host-only Remove Player controls are available in the Party panel during Remote Multiplayer. Removing a player closes that Hero connection, removes the Hero from the authoritative active-party roster, broadcasts the corrected state, and prevents the removed socket from continuing to send state. The player may intentionally reconnect later.

## 3.25.32
Elara/Rowan Q001 playtest fixes: Consecrated marker, Bless targeting, Beacon targeting, Predator's Mark attack bonus, expanded attack logging.

Ascendance 3.25.32 — Left-Rail Encounter UI

Travel Encounter and Search Deck (SD) resolution panels are now docked in the left rail beside the Quest Map. Full multiplayer project preserved from 3.25.30.

# Ascendance 3.25.30 — Authoritative Multiplayer Roster / Restart Fix

- Fixes the actual 3.25.6 merge that preserved a joining client’s pre-sync legacy Aldric party.
- Incoming multiplayer snapshots now define the authoritative party; only the client’s selected `mpRole` may be added as a legitimate new joiner.
- Restart snapshots and rebuilds only `g.partyHeroes`, so a non-party compatibility Aldric cannot be promoted by Restart.
- Preserves 3.25.29 and all earlier Q001/Q002, Hero, kill-persistence, and multiplayer fixes.

Validation: client/server JavaScript syntax, root/public parity, and ZIP integrity. Live multiplayer interaction still requires playtest.

# Ascendance 3.25.29 — Fresh-Room Authority Fix

New Game in remote multiplayer now explicitly replaces any persisted snapshot for the chosen room before normal joining/restoration. This prevents a stale/default Aldric from being restored into an Elara + Rowan campaign. Join Game still restores saved room state normally. Built from the full 3.25.28 multiplayer project.

# Ascendance 3.25.28 — Q001 Playtest Fixes

Built from the complete 3.25.26 multiplayer project.

## Fixes
- Longsword Strike and the legacy Aldric attack-card path now credit Aldric's persistent individual kill ledger before enemy removal.
- Shield Escort now discovers eligible allies from the synchronized H001-H010 party positions, including Vaelis.
- Phoenix Ash now prompts for one living Hero at the user's Location, including self, then removes all negative Conditions and heals that selected Hero by 3.
- Arcane Ward now has tile-backed state plus shared global state and a final enemy-entry trigger, preserving its Arcane Location status, first-entry-per-round damage, three-trigger removal, and Vaelis kill credit.
- Q001 completion behavior, Q002 Merchant Caravan fixes, persistent kills, and previous multiplayer files are preserved.

## Validation
Static JavaScript/server syntax, root/public parity, and ZIP integrity are checked. Browser-driven multiplayer playtesting is still required for interaction/timing verification.

# Ascendance 3.25.23 — Q002 Caravan + Arcane Ward Fix

Built from the full 3.25.22 multiplayer project.

- Fixed Merchant Caravan placement calling a nonexistent `setupQ002Caravan()` function. The tile had already been committed/synced, which caused peers to see it while the exploring client threw an error and appeared frozen. Placement now calls the real `q002SetupCaravan()` function.
- Q002 `Caravan Revealed` now updates from that same authoritative placement path and initializes the two Wagons/enemies as intended.
- Added a final centralized Arcane Ward enemy-entry trigger so Q002 enemy movement into a warded Stonebrook resolves the Ward reliably and synchronizes it.
- Preserves the 3.25.22 kill-ledger fix and all prior full-multiplayer files.


## 3.25.24 — Persistent Hero Kill Counts
- Hero kill totals for H001-H010 now persist across Quest completion, failure/retry, and starting a new Quest.
- Kill totals reset only when starting a completely new game/campaign.
- Built on the full 3.25.23 multiplayer project; Q002 Caravan and Arcane Ward fixes are preserved.

## 3.25.25 — Q001 Aldric + Vaelis Audit Fixes
Built from the complete 3.25.24 multiplayer project. Preserves the 3.25.23 Q002 Merchant Caravan / Arcane Ward fixes and 3.25.24 campaign-persistent Hero kill totals.

Q001 audit fixes in this build:
- Time Stop now has a dedicated runtime path: once-per-campaign tracking, Enemy movement suppression through the next Enemy Phase, +1 Attack to each living allied Hero's first Attack that round, immediate additional Hero-card play without Action cost, and Arcane-location draw 2.
- Ethereal Passage now moves Vaelis up to 2 revealed connections and applies the printed Arcane destination heal/draw or creates temporary Arcane at the destination.
- Dimension Door now moves Vaelis plus one allied Hero together and resolves its Arcane heal / temporary Arcane destination effect.
- Arcane Intellect now honors its Arcane-location no-discard clause for Vaelis.
- Arcane Infusion now applies its +1 Attack setup and grants Inspired when cast from an Arcane Location.

Static validation is performed on the shipped client/server JavaScript. Browser-driven multiplayer playtesting is still required for interaction timing and peer synchronization.


## 3.25.26 — Complete Hero Mechanics Pass
- Consolidated H003-H010 workbook-driven runtime completion pass while preserving H001/H002/H006 legacy engines.
- Added missing Elara utility/movement resolution, Rowan mark/snare/scout/movement/signature follow-ups, Thorne Spirit Wolf/Vines/Animal Speech/Avatar behavior, Cassian Encore/Stage Presence/signature follow-ups, Kael Twin Strike follow-up, and Mira Field Workshop/Master Engineer/Grand Invention follow-ups.
- Routed expanded-Hero enemy defeats through the persistent individual Hero kill ledger.
- Added shared temporary attack/armor modifiers and enemy-entry terrain triggers used by the completed cards.
- Preserves Q002 Caravan/Arcane Ward fixes and campaign-persistent Hero kill totals.

Static syntax validation is performed on shipped JavaScript. Browser-driven multiplayer interaction testing is still required.


## 3.25.28 Phantom Aldric Multiplayer Fix
- Expanded-Hero-only New Game initialization is now atomic for multiplayer sync.
- The temporary Aldric compatibility seed used by legacy initialization can no longer be broadcast before the requested party is restored.
- If Aldric was not selected, compatibility-only Aldric opening-hand/log state is cleared before the first authoritative state broadcast.
- Elara + Rowan now initializes/synchronizes as Elara + Rowan; H001 is added only when actually selected or when a real Aldric player joins.
