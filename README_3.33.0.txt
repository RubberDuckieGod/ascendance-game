Ascendance 3.33.0 — Campaign II: Shadows Over Valewatch

Built directly on Ascendance 3.32.2 SERVER_PHASE_CAMPAIGN_AUTHORITY.
The 3.32.2 room-authoritative/server-phase architecture is preserved; Campaign II is added as a final-loaded content/runtime module.

SOURCE OF TRUTH
- Ascendance workbook v10.42 Q024 Benchmark Simulation

CONTENT ADDED
- WE005–WE008: Campaign II — Shadows Over Valewatch
- Q013–Q024 digital scenario data and objective runtime
- L051–L087 Crownlands / Valewatch / Underways / Buried Valewatch Locations
- E033–E050 Campaign II enemies, including E048 Ysara Keld, E049 Severin Hale, and E050 The Veiled Sovereign
- EN031–EN045 Valewatch encounters; Campaign II quests use this 15-card regional Encounter deck
- LT161–LT166 Campaign II quest items / campaign rewards
- Level 7 at 2700 XP and Level 8 at 3500 XP for H001–H016 workbook progression rows
- Q013 standalone Level-5 entry support: 1400 XP, 100 Gold per Hero, Rare/Epic/Legendary Equipment per Hero, and a playtest profession-mastery default

RULES / BALANCE PORTED
- Party Gold scaling: 0.75x / 1.00x / 1.25x / 1.50x for 1–4 Heroes
- Party Equipment scaling for single-card party rewards
- Q013 Survivor loss tracking
- Q015 Witness Harm and solo Harm threshold
- Q016 Suspicion 3/5 escalation and 4-Hero third-Cult scaling
- Q017 cache timer and party-size reinforcement scaling
- Q019 Waystone party-size scaling
- Q021 Q017 Ledger setup benefit separated from the WE006 completionist Focus-spawn cancellation
- Q022 Crisis scaling and legal finale-aid maximums
- Q023 v10.39 Black Cathedral guaranteed guard fix and Collapse blocking
- Q024 v10.42 current E049/E050 values, Crown Ward action economy, E049 Strain/half-Health transformation, E050 half-Health surge, Royal Seal, and saved-District aids
- WE007 underground rolled-Encounter severity modifier
- WE008 no random Travel Encounters and Elite Cult/Undead/Veil +1 Health

AUTHORITY / INTEGRATION
- The Campaign II runtime installs after the final 3.32.2 DOM/runtime wrappers so server/room authority is not bypassed by an older client layer.
- Root and /public builds contain the same index and Campaign II module.
- 3.32.2 remains the underlying server authority protocol/version; the browser/game build is 3.33.0.

VALIDATION
- Campaign II static content/runtime audit: PASS
- Campaign II combined-browser boot/runtime test: PASS
- Q013 direct start: PASS (Valewatch start, 10-tile pool, 15-card regional Encounter deck, standalone package)
- Q013–Q024 direct-start smoke test: PASS
- Q024 Royal Seal + legal District-aid setup test: PASS
- Existing gameplay simulation suite: 438/438 PASS
- 3.32.2 architecture/server authority tests: 9/9 PASS
- Room authority, Hero authority, resource/phase authority: PASS
- Existing 3.32.2 browser regression suite: PASS

IMPORTANT
- Campaign II remains Playtest, not Print Lock.
- The v10.42 Q024 results were analytical simulations; live browser / tabletop validation remains authoritative for final tuning.
- Level 7–8 progression data and XP thresholds are loaded into the same progression system used by the current site. The existing site progression contract still logs/applies Hero progression from Hero data rather than implementing every level-up ability as a separate new engine subsystem.
- The standalone profession package uses a playtest default because v10.42 specifies one Profession at 2 Mastery and a second at 1 without prescribing which two.
