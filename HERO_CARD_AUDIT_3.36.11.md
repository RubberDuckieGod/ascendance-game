# Ascendance 3.36.11 — Hero Card Functionality Audit

## Scope

- Authoritative Hero-card records reviewed: **323** across **16 Heroes**.
- Production dispatcher sweep: **323/323** records reached the live dispatcher without an exception.
- Existing H001–H010 contract simulation: **438/438** tests passing.
- Expanded-Hero runtime/ability regression suite: **PASS**.
- New 3.36.11 production-browser Hero-card regressions: **10/10 PASS**.

## Confirmed failures repaired

### Shared combat / trigger engine

1. **Basic Attack skipped Hero-card attack modifiers.** This was the root cause of Battle Roar appearing to resolve but not changing Garruk's Basic Attack. Basic Attack now consumes the same Hero-card/runtime modifier pipeline as card Attacks.
2. **Damage sources did not all use the shared damage hook.** Search/Encounter direct damage now routes through `damageHeroBy`, allowing printed "would suffer damage" reactions and damage-driven abilities such as Bloodrage to trigger consistently.
3. **One-shot / next-Attack modifiers were split across several incompatible state systems.** Basic and card Attacks now consume the authoritative modifier once.
4. **Enemy non-Attack abilities were not exposed to reaction cards.** Authored Enemy ability hooks now feed appropriate Spell Reflection / Counter Melody windows.

### Garruk Stoneblood

- **H012-011 Battle Roar** — fixed. +1 applies to Basic and card Attacks until end of turn.
- **Bloodrage innate** — fixed shared trigger/consumer. Damage creates the bonus once per Round; the next Basic/card Attack consumes it.
- **H012-017 Challenge the Strongest** — +2 is now locked to the selected Marked Enemy and cannot be stolen by an unrelated target.
- **H012-020 Avatar of Rage** — +3 duration corrected and the "cannot be reduced below 1 Health" clause is enforced.
- **H012-013 Ignore the Pain / H012-014 Refuse to Fall** — non-Attack damage windows are supported where the printed trigger applies.
- Removed the duplicate legacy Bloodrage implementation so only one authoritative trigger remains.

### Other high-risk repairs

- **Kael:** Crane Stance range consumer, Perfect Form 0-Action minimum + draw flow, Counter Strike location/0-damage trigger.
- **Rowan:** Scout Ahead free Explore, Master's Hunt free Attack-card consumer, shared next-Attack handling.
- **Mira:** Field Workshop Equipment discount, Tactical Upgrade chosen-Hero bonus, Master Engineer free Consumable.
- **Elara / Vaelis:** lethal-save reaction paths and timing hooks.
- **Thorne:** Protective Roots forced-movement prevention.
- **Cassian:** Standing Ovation kill trigger and Counter Melody enemy-ability window.
- **Mordren:** Bone Servant placement/max handling; cards are not wasted on impossible placement.
- **Asha:** Spirit Totem placement/max handling; cards are not wasted on impossible placement.
- Additional target-specific, temporary, summon, and direct-damage effects across H011–H016 were repaired in the 3.36.11 parity layer.

## Explicit 3.36.11 repair set

56 card IDs are explicitly patched by the new parity layer:

`H003-009, H003-010, H003-020, H004-009, H004-011, H004-021, H005-002, H005-011, H005-013, H005-019, H007-016, H007-018, H008-017, H008-018, H009-010, H009-018, H009-020, H010-012, H010-013, H010-019, H011-007, H011-009, H011-011, H011-012, H011-014, H011-015, H011-016, H011-020, H012-011, H012-013, H012-014, H012-015, H012-017, H012-018, H012-020, H013-006, H013-008, H013-015, H013-018, H014-005, H014-006, H014-009, H014-012, H014-013, H014-014, H014-019, H014-020, H015-015, H015-016, H015-019, H015-020, H016-007, H016-009, H016-014, H016-015, H016-019`.

## Targeted live regression results

- Battle Roar: **PASS** — log shows `Base/Equipment Attack 6 · Hero Card +1 = Total Attack 7`.
- Bloodrage: **PASS** — log shows `Hero Card +2 = Total Attack 8`, then the Bloodrage buff clears.
- Bloodrage from Search-style direct damage: **PASS**.
- Challenge the Strongest target lock: **PASS**.
- Avatar of Rage 1-Health floor: **PASS**.
- Perfect Form 1-Action Attack → 0 Actions: **PASS**.
- Field Workshop Equipment-card discount: **PASS**.

## What the audit does and does not claim

The build now has full **record/dispatcher coverage** and effect-level regression coverage for the shared systems and defects uncovered in this pass. Some Hero cards are intentionally highly situational—specific enemy abilities, forced movement, summon-cap edge cases, multiplayer reaction timing, and exact board geometry. Those paths are wired and regression-tested at the engine level, but a 323-card no-crash sweep is not represented as proof of every possible board-state combination. Continued campaign playtesting should report any card whose printed outcome differs from the log/state change; the new shared hooks make those failures much easier to isolate.
