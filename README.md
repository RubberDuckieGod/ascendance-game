# Ascendance 3.36.0 — Full Parity Pass (No Custom Hero Creator)

This build brings the current browser game into parity with the major executable systems authored through Ascendance v10.49 while deliberately leaving the Custom Hero Creator out.

## Major additions
- Campaign V — The Drowned Tide (Q049–Q060): bespoke objectives, Doomtide, route hazards, bosses, finale phases, saved-site aids, and solo scaling.
- Campaign VI — Crown of the Fallen Sun (Q061–Q072): bespoke objectives, Sunfall, Mirage/Eclipse hazards, bosses, finale phases, saved-site aids, and solo scaling.
- Campaign III/IV track-increase hooks updated for Reputation mitigation.
- Level 13–16 Hero progression runtime and controls for all 16 authored Heroes.
- Hero Ability panel now covers the Hero’s complete current innate/progression kit from **Level 1 through Level 16**. Level 1 starting abilities are labeled **STARTING INNATE**, upgraded abilities keep their original unlock level, and Asha correctly shows both Level 1 starting abilities.
- Every displayed ability carries an activation class/status: PASSIVE, QUEST START, TRIGGERED, or ACTIVATED, with live PASSIVE / READY / ACTIVE THIS QUEST / USED THIS ROUND / USED THIS QUEST state. Existing runtime fields and ability log events feed the live state; direct Level 13–16 activated abilities retain explicit activation buttons and Action costs.
- Executable Reputation service/tactical perks integrated where the trigger is deterministic. Story-only/choice-only perks remain represented as permissions/options rather than invented automatic effects.
- Campaign Saves button restored and visible.
- 16 Hero portrait PNGs plus 16 separate showcase PNG files.
- Custom Hero Creator remains disabled/absent by design.

## Important fixes
- Fixed Campaign V/VI shared Action-spend helper: 1-Action objective interactions could spend the Action and then abort because the lower-level action function returned undefined.
- Q052 Breakwater Watch now repairs damaged Sections; enemies can damage Sections; simultaneous structural loss can fail the Quest.
- Fixed Aldric Level 15 Aegis Eternal as a true triggered once-per-Quest ability: when the same effect damages 2+ Heroes, the game prompts at the legal trigger window and the panel flips to USED THIS QUEST after resolution.
- Campaign V/VI custom Encounter resolution is installed before the room-authority wrapper so multiplayer state remains authoritative.
- Deferred Search-card rewards now survive custom Encounter resolution.
- Preserves 3.35.x First Visit generic spawning, Encounter Guarded/Inspired handling, Merchant search/filtering, post-Quest round rules, and Rowan Armor Piercer crash fix.

## Verification
- Core simulation: 438/438 passing.
- Full-parity browser smoke: PASS.
- Dedicated Level 1–16 ability-panel test: PASS.
- 16-Hero Level 1/Level 16 ability sweep: PASS.
- Room authority: PASS.
- Resource/phase authority: PASS.
- First Visit server spawn guard: PASS.
- Reputation authority: PASS.
- Generic First Visit spawn regression: PASS.
- Campaign V/VI Q049–Q072 direct-start/finale regression: PASS.
- Rowan Armor Piercer regression: PASS.
- 32/32 portrait assets present.

See `DEPLOY_3.36.0.txt` for deployment instructions and `tests/verification-3360.txt` for the combined verification output.
