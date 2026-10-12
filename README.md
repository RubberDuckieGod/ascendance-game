# Ascendance 3.36.16 — Sound Foundation

Baseline: **3.36.15 Generic Reveal Effect Runtime Parity**. Workbook source remains **Ascendance v10.52**.

## 3.36.16 changes

- Added a centralized **Web Audio API** sound engine that requires no external audio files.
- Added distinct procedural cues for UI clicks, card draw/discard, Hero attacks, Enemy attacks, damage, healing, Explore, Reveal, Search, rewards, statuses, warnings, phase changes, defeats, Quest victory, and Quest failure.
- Added an optional low fantasy ambient drone, disabled by default.
- Added a **Sound** settings button with persistent Master, Sound Effects, and Ambience volume controls, plus mute, UI-click, ambience, reset, and test controls.
- Added mobile-safe audio unlocking on the first user gesture to comply with iPhone/Chrome autoplay rules.
- Wrapped the existing Adventure Log non-destructively so gameplay events can drive SFX without changing game rules or multiplayer authority.
- Preserved all 3.36.15 Reveal Effect runtime parity and room-authoritative gameplay systems.
- Bumped the PWA cache and authoritative build marker to **3.36.16**.
- Validation: core simulator **438/438**; dedicated Chromium audio regression **PASS** with **0 page errors**; 3.36.15 Reveal Runtime regression preserved under 3.36.16 **PASS**.

See `AUDIO_3.36.16.md` for the sound-event map and test notes.

---

# Ascendance 3.36.15 — Generic Reveal Effect Runtime Parity

Baseline: **3.36.14 v10.52 Website Content Sync**. Workbook source: **Ascendance v10.52**.

## 3.36.15 changes

- Added executable runtime coverage for all **43 generic Reveal Effect patterns** introduced across **149 v10.52 Locations** (`L000`, `L088`–`L235`).
- Preserved existing `Scenario Reveal — ...` Quest/Campaign hooks so scenario setup is not double-resolved.
- Added Party Supply as a synchronized multiplayer resource.
- Added room-authoritative Encounter-deck reorder support with duplicate-card-safe ordering.
- Added non-consuming Reveal Search transactions; Search-card rewards no longer spend a Location's normal Search use.
- Added Stonebrook Home Base reveal execution, temporary Reveal Attack/Armor bonuses, Search/Loot rewards, deck inspection/reorder, healing/cleansing, Inspired, movement, and choice effects.
- Bumped the PWA cache and authoritative build marker to **3.36.15**.
- Validation: core simulator **438/438**; dedicated Chromium runtime regression **PASS**, **0 page errors**, **149/149 new Location IDs handled**.

See `REVEAL_RUNTIME_3.36.15.md` for the full runtime and multiplayer audit.

---

# Ascendance 3.36.14 — v10.52 Website Content Sync

Baseline: **3.36.13 Automatic-Hit Equipment Alignment**. Workbook source: **Ascendance v10.52 — Location Ongoing Effect Clarification**.

## 3.36.14 changes

- Synced **323 Hero Deck Flavor Text** entries and exposed Flavor Text in desktop and mobile card views.
- Synced **236 Location** Special Rules, Reveal Effects, and Ongoing Effects from v10.52.
- Expanded the Location panel into readable Special / Reveal / Ongoing rule sections.
- Fixed the 3.36.13 Render deployment gap where `equipment-autohit-33613.js` was absent from `public/`.
- Fixed the 3.36.13 equipment state lookup (`window.g`) so automatic-hit equipment can bind to the actual game state.
- Bumped the PWA cache and authoritative build marker to **3.36.14**.
- Validation: core simulator **438/438**, dedicated Chromium/Playwright 3.36.14 regression **PASS** with no page errors.

**Runtime boundary:** the website now has the correct v10.52 Reveal Effect text everywhere, while the older generic Reveal resolver still has executable handlers for only a subset of generic effects. Quest-specific reveal hooks remain preserved.

---

# Ascendance 3.36.13 — Automatic-Hit Equipment Alignment

Baseline: **3.36.12 Equipment + Loot Parity Audit**.

This release removes the remaining Hero attack-roll, critical-hit, miss, and pre-roll dependencies from the six audited weapons while preserving Ascendance's locked automatic-hit Hero combat rule.

## 3.36.13 changes

- **EQ006 Flaming Longsword** — Ignite now triggers after an Attack deals 4+ Damage; no critical hit.
- **EQ008 Dragonsteel Longsword** — Dragon Strike is declared when attacking and grants +3 Attack while ignoring all Armor; no roll window.
- **EQ010 Duelist's Rapier** — deterministic Precise Strike and post-Enemy-Attack Riposte Master.
- **EQ056 Sniper Crossbow** — deterministic Deadeye and Heartseeker based on whether the Hero moved.
- **EQ116 Arcane Channeling Staff** — once per Round a damaging Hero Card using Weapon Bonus gains +1 Attack, or +2 in an Arcane Location.
- **EQ119 Ashen Wardblade** — once per encounter, damage that leaves the wielder at half Health or less arms +3 Attack for the next Attack before the end of the next turn.
- Updated embedded Equipment data, runtime mechanics, build marker, and PWA service-worker cache to **3.36.13**.
- Core simulator remains **438/438 passing**.

The matching workbook revision is **Ascendance v10.50 — Automatic-Hit Equipment Alignment**.

---

# Ascendance 3.36.12 — Equipment + Loot Parity Audit

Baseline: **3.36.11 Hero Card Parity**, preserving the confirmed-working **3.36.10 Complete iPhone Gameplay Parity** baseline.


## What 3.36.12 changes

- Audits all 144 Equipment cards, 30 Consumables, Relics, and Legendary Treasures against executable runtime consumers.
- 137/144 Equipment cards now have runtime coverage or a generic engine rule; seven remain intentionally rule-blocked rather than being falsely implemented.
- 28/30 Consumables now run across the full Hero roster; Traveler's Rations and Lockpick Set remain preserved until their required core actions exist.
- Adds full-roster item targeting, shared Equipment attack/damage/healing hooks, active Equipment buttons for Worldsplitter / Starfall Longbow / Starfall Staff, and fixes multi-attack, movement, reaction, protection, and once-per-round/encounter effects found during the audit.
- Preserves all 3.36.11 Hero-card parity fixes and all 3.36.10 iPhone gameplay-parity workflows.
- Core simulation remains 438/438; Hero-card browser regression PASS; Equipment/Loot browser regression PASS.

See `EQUIPMENT_LOOT_AUDIT_3.36.12.md` for the card-by-card matrix and foundational blockers.

## What 3.36.10 changes

This release performs a dedicated phone-sized parity sweep so gameplay surfaces are not left behind in desktop rails or covered by mobile chrome.

### New mobile Quest / Objective screen
- The mobile **Menu** now opens a real in-game menu instead of jumping directly to Main Menu.
- **Quest & Objectives** opens the live Quest title, story, objective state, and currently legal Quest actions in a full-screen iPhone view.
- Mobile Quest action buttons proxy to the existing authoritative desktop/gameplay controls; no duplicate Quest rules were created.
- Post-Quest / Campaign Downtime content is mirrored into the same screen.
- If a Quest transition appears while the player is on the map, a persistent **Quest Update** button remains until the player reviews it.

### Reaction parity
- Reaction windows are true full-screen mobile modals above Cards, Log, Explore, Search, map controls, Action bar, and dock.
- Reaction text is readable at phone size and the original **Use Reaction / Decline** controls remain authoritative.

### Enemy details parity
- Enemy details are no longer trapped inside the transformed desktop side rail.
- On mobile, the live Enemy panel is temporarily portaled to the viewport, then restored to its original desktop parent when mobile mode ends.

### Mobile Game Menu
The iPhone Menu provides direct access to the existing game systems:
- Quest & Objectives
- Inventory
- Merchant
- Crafting
- Downtime
- World Map / Faction Reputation
- Campaign Hub
- World Event / Quests
- Campaign Saves
- Hero Profile
- Main Menu

### Management / campaign overlay fixes
- Campaign Hub, Campaign Saves, World Event / Quests, Hero Profile, Campaign Journal, World Map, and Inventory management occupy the phone viewport cleanly.
- The global desktop `.actions` class no longer turns Save/Campaign action rows into the fixed combat Action bar on iPhone.
- The phone dock/map/debug/install controls hide while a true management modal is open.
- The actual `#worldMapOverlay3342` is now recognized by the mobile layer, so the dock no longer sits over World Map / Reputation.

## Preserved 3.36.7–3.36.9 mobile workflows
- Full-screen Hero Card reader
- Full-screen live Adventure Log
- Full-screen Explore Location placement with View Map / return-to-pending flow
- Full-screen Search card resolver
- Full-screen Search-launched Travel Encounter resolver
- Portrait / landscape safe-area behavior
- PWA Add to Home Screen support

## Native choice dialogs
Some older Hero cards, movement selections, and target selections use synchronous browser `prompt()` / `confirm()` dialogs. Those are not desktop rail panels and remain usable on iPhone. They were intentionally left intact in 3.36.10 rather than rewriting synchronous rules controllers during a UI-stability release.

## Validation
- Core simulation: **438 / 438 passed**
- 3.36.10 dedicated mobile parity test: **PASS**
- Cards / Log mobile regression: **PASS**
- Explore mobile regression: **PASS**
- Search / Encounter mobile regression: **PASS**
- Hero runtime parity: **PASS**
- Room authority: **PASS**
- Resource / phase authority: **PASS**
- Faction Reputation authority: **PASS**
- Encounter + post-Quest rules: **PASS**
- Rowan Armor Piercer regression: **PASS**
- Campaign Hub / Hero Profile / World Map phone overlay checks: **PASS**
- Portrait and landscape horizontal overflow checks: **PASS**

Custom Hero Creator remains intentionally absent.
