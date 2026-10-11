# Ascendance 3.36.10 — Complete iPhone Gameplay Parity

Baseline: **3.36.10**, built directly from the confirmed-working **3.36.9 iPhone Search + Encounter** baseline.

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
