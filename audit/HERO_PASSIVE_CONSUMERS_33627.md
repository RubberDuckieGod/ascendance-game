# Hero passive consumer matrix 3.36.27

`tests/audit/hero-passive-consumers-33627.spec.cjs` adds twelve paired scenarios with twenty-four XP-boundary samples, plus three explicit Elara Level 1/2/3 scenarios. They invoke real production consumers and attach the authored ability/Hero reference with expected and actual values. This extends ability-effect coverage beyond XP-to-Level lookup. It does not certify complete Heroes or all card effects.

**Execution status: 12/12 passed in the complete 37-scenario corrected follow-up.** The run also includes 25 card-effect cases and finished in 45.9 seconds with no failures, skips or flaky results. [Preserved validation](card-effect-oracle-validation-33627.json) records actual values, source hashes and separate before/after attempts. The original corrected-fixture baseline passed six passive cases and failed four; the two added Cassian cases then both failed in a separate pre-correction run. They are never represented as a single combined baseline execution.

The three later Elara Bless cases and their narrow legacy-heal gate correction are **UNRUN pending the root agent's next focused/full run**. The preserved 37-case result is the preceding source checkpoint, not evidence for those three additional cases.

| Ability | Unlock | Real consumer and fixed expected outcome at unlock | Below-unlock control |
|---|---:|---|---|
| Garruk, Greater Bloodrage | 4 | Suffer 1 damage at 12 Health, then actual Attacks deal 6 and 3 to Armor 0. The bonus applies once. | Level 3 retains ordinary Bloodrage: damage 5 then 3. |
| Lucien, Single Combat | 3 | Two actual Attacks against one isolated Enemy deal 6 then 4. | Level 2 deals 4 then 4. |
| Veyra, Greater Malefic Hex | 4 | Apply Rooted to one Enemy; unrelated target takes 2, selected target takes 5, selected target takes 2 again. | Level 3 ordinary Hex gives selected-target damage 4. |
| Malachar, Elemental Dominion | 13 | An actual Fire Attack with base Attack 2 against Armor 2 deals 1, proving the one-point Armor ignore is consumed. | Level 12 deals 0. |
| Veyra, Doom Script | 14 | Base Attack 2 against Armor 2 deals 0 with one harmful Status, then 1 with two. | Level 13 deals 0 in both cases. |
| Asha, Ancestor's Shelter | 14 | At a Totem, Rooted is blocked, the next same-Round Weakened applies, and next-Round Burning is blocked. | Level 13 receives all three harmful Status Effects. |
| Asha, Ancestral Aid | 3 | A Level 1 allied Rowan at 5 Health gains Inspired and recovers to 6; a second beneficial Status in the Round grants no second heal. | Level 2 Asha grants no heal. |
| Thorne, Elder Canopy | 11 | A Level 1 allied Rowan on Vine Terrain starts at 9 Health; successive 3-point Enemy Attack damage leaves 7 then 4. | Level 10 Thorne leaves Rowan at 6 then 3. |
| Asha, Totemic Presence | 2 | A Level 1 allied Rowan at the Totem makes actual Attacks for 4 then 3 against Armor 0. | Level 1 Asha supplies no attack bonus: 3 then 3. |
| Elara, Mercy Unbound | 13 | Healing Elara from 1→2 Health draws exactly one real UID card (deck 5→4); the next heal 2→3 draws none. | Level 12 draws none. |
| Cassian, Improved Rousing Verse | 3 | The chosen ally draws two known UIDs and discards the explicitly selected UID. A second Support card that Round repeats neither the choice nor the draw/discard. | Level 2 grants Inspired without the upgrade's card draws. |
| Cassian, Maestro | 5 | Cassian draws one known UID only after an Inspired ally resolves a real Attack; a second Attack that Round draws none; the next Round permits one more. | Level 4 grants no Maestro draw. |
| Elara, Divine Grace / Blessed Presence | 1 / 2 / 3 | Play H003-012 Bless twice with a distinct Bless target and Divine Grace recipient. Divine Grace heals that recipient by 1 at Level 1/2, by 2 at Level 3; only Level 2+ adds Inspired and stamps the shared Blessed Presence receipt. The second Support card repeats no Divine Grace reward. | Explicit Level 1 and Level 2 controls separate the two upgrade gates. |

The test fixtures remove Equipment, unrelated Location modifiers and Reaction cards. Passive Attack tests use the real `runtimeHeroAttackEnemy` resolver with fixed authored base Attack values, not an imitation damage engine. Defensive tests use `damageHeroBy` with an Enemy Attack label, so their assertion covers the Health consumer rather than a logged reduction flag. Card tests track actual hand/deck counts and UID uniqueness. Every scenario collects browser exceptions.

The browser confirmed and the shared Hero runtime correction repaired these defects:

- Ancestral Aid and Elder Canopy checked the receiving Hero's Level. They now use Asha's/Thorne's progression, so the measured Level 1 allies receive the printed heal/reduction.
- Totemic Presence only modified Asha's own Attacks. Its Level 2+ modifier now applies to each eligible Hero's first Attack at a Totem.
- Mercy Unbound had separate healing hooks with separate once-per-Round state and drew two cards. The Level 13 healing hook now owns the single grant.
- Cassian received the later card-draw upgrade at Level 1, repeated it for every Support card, omitted the mandatory discard and drew his own Maestro card at the wrong trigger. The upgrade now starts at Level 3, reuses the acting player's original recipient and selected discard UID once per Round. Level 5 Maestro separately observes an Inspired Hero's actual Attack/ability resolution.

The additional Elara source correction applies the Level 3 Divine Grace amount before core healing and removes the old post-heal top-up. Blessed Presence now requires Level 2, another Hero and one shared `Elara::Blessed Presence` receipt per Round. Its new native Bless measurements remain pending as stated above.

The remaining six original passive scenarios passed their actual numerical outcomes as well. These are controlled solo consumer fixtures; explicit Round counters test the once-per-Round boundary. Full phase timing, durations, every enemy type, reactions, connected canonical state and complete ability branches remain unverified unless separately asserted by named tests.
