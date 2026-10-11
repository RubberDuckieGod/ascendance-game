Ascendance 3.34.2 — World Map Interface

Built from 3.34.1. Adds a world-level campaign navigation screen without changing quest mechanics or server authority.

WORLD MAP
- Six visible regions: Stonebrook Marches, Crownlands, Ironspine Mountains, Verdant Reach, Storm Coast, Sunscar Expanse.
- Playable Campaigns I-IV show hub, campaign title, Quest/World Event range, level band, persistent system, progress, and current Quest.
- Campaign V (The Drowned Tide / Ashenport) and Campaign VI (Crown of the Fallen Sun / Sunspire) are visible as locked future regions.
- Relative geography follows the approved first-pass v10.47 layout: Stonebrook west, Crownlands center, Ironspine north, Verdant east, Sunscar south, Storm Coast southeast.

NAVIGATION
- World Map button on the Main Menu, top gameplay bar, and Hero quick-access buttons.
- Start Campaign routes the Main Menu to the region's opening Quest and triggers the existing 3.34.1 narrative briefing.
- Continue Current closes the map and returns to the active adventure.
- Available Quests expands all twelve Quests for a playable region with current campaign status.
- During Downtime, an Available Quest preview can still use the 3.34.1 Begin Quest confirmation path.

WORLD STATE
- Campaign III displays current Instability 0-8.
- Campaign IV displays current Blight 0-8.
- Campaign I displays campaign day when state exists.
- Campaign II displays the active World Event / investigation state.
- Campaign completion titles are surfaced when present.

FACTION REPUTATION UI
- Region panels list General plus regional factions.
- Standing badges support Hostile, Distrusted, Neutral, Friendly, Trusted, Exalted.
- Clicking a faction reveals its v10.47 Friendly/Trusted/Exalted benefit ladder.
- Named-faction scores read campaign factionReputation3342/reputation3342 state when present. General Reputation falls back to the existing g.reputation value for legacy saves.
- This release is the world-map/reputation DISPLAY layer; full v10.47 reputation reward/perk enforcement can be implemented as the next gameplay-system pass.

AUTHORITY
- No server.js protocol change.
- Existing 3.32.2 room/server authority, 3.33.0 Campaign II, 3.34.0 Campaign III/IV, and 3.34.1 narrative systems are preserved.
