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
