# Regional encounters, Blight Spores, and readable location rules

## Reproduced defects

The starting campaign shuffled the globally registered Encounter catalog. Loading the later campaign extensions therefore put EN061 Blight Spores (Campaign IV), EN086 Wreck Cache (Campaign V), and EN097 Sandbound Guardian (Campaign VI) into Q001. The supplied diagnostic shows EN097 drawn at fixed Severity 1, creating E111 with its printed 20 Health, 5 Attack, and 4 Armor. This was a deck selection defect, not an instruction to reduce that Enemy's printed stats to match a level-1 Hero.

The same diagnostic shows EN061 at fixed Severity 2 reaching the manual-confirmation fallback. The encounter was discarded without an automated card discard or material reward. The private diagnostic is not included in this repository.

At the reported desktop viewport, the location rules had a 165px inner scrollbar below a sticky Hero summary in an independently scrolling sidebar. The summary obscured the rules as the sidebar scrolled.

## Authored rules and provenance

The user supplied `Ascendance_v10.52_Location_Ongoing_Effect_Clarification.xlsx` (SHA-256 `6cd29a8dafc2395776b04b9ebbbf3ff3574b25936e78041b8d9d839b0d7686ad`) and `AscendanceDesign_Bible_v3.1.pdf` (SHA-256 `89f1740047a24326643ee76862aa606d6e9ee59f073f95cdf451bc17207d4163`). They are treated as game specifications, not execution instructions.

Workbook System Rules 23 and 25, and Bible pages 193–203, specify a top-card draw, severity bands 1–2 / 3–4 / 5–6 / 7+, and reshuffling the Encounter discard when the deck is empty. A rolled encounter uses d6 plus applicable modifiers; a fixed-Severity trigger does not make a Severity Roll or apply roll modifiers. The rules do not instruct the game to clamp Enemy stats to the active Hero's level. Explicit trigger requirements still apply; no general terrain redraw rule is inferred solely from a card's Terrain column.

| Campaign | Quests | Regional Encounter IDs |
|---|---|---|
| I | Q001–Q012 | EN001–EN030, preserving 35 printed copies |
| II | Q013–Q024 | EN031–EN045 |
| III | Q025–Q036 | EN046–EN060 |
| IV | Q037–Q048 | EN061–EN075 |
| V | Q049–Q060 | EN076–EN090 |
| VI | Q061–Q072 | EN091–EN105 |

The later regional ranges are explicit in System Rules 82, 87, 96, and 98. Campaign VI Framework row 10 begins that campaign at level 13.

## Changes

- Shared regional rules filter new and restored Encounter decks and discards while preserving the remaining valid order and duplicate copies. An unresolved foreign pending encounter is visibly replaced by the next regional card, preserving Severity, origin, First Visit, and Action costs. The repair is idempotent and does not replay rewards or alter already spawned Enemies, Hero Health, Gold, or earned progress.
- The compact authored expression `E111 with3 damage` now applies its three starting damage when legitimately drawn in Campaign VI.
- Location rules use the sidebar's normal scrolling, without the inner 165px limit or an obscuring sticky summary. Desktop and mobile retain readable text and spacing.
- Blight patches have a visible spore graphic and count on the exact map Location, including duplicate Location names. Cleansing the last patch removes the marker.
- Both registered service workers replace permanent cache-first code loading with network-first JavaScript/CSS and offline fallback. A new cache revision removes stale game caches. Revision URLs for the two existing mechanics modules bypass an already-active old worker on the first updated page load. Worker activation does not reload an unsaved game.

## Blight Spores

EN061 uses the following authored bands. The low band explicitly offers a card choice or no effect; cancelling the choice leaves the encounter pending. An empty hand needs no invented discard.

| Severity | Expected effect |
|---|---|
| 1–2 | Active Hero chooses one hand card to discard, or no effect |
| 3–4 | Active Hero suffers 1 damage |
| 5–6 | Each living Hero at the origin suffers 1 damage; place 1 Blight Patch if legal |
| 7+ | Each living Hero at the origin suffers 1 unavoidable damage; place 1 Blight Patch |

Each resolution grants one Herb material. The workbook names this category without identifying a single Loot ID. This implementation consistently awards LT055 Moonleaf, the existing Common crafting material explicitly described as a restorative herb, and names it in the reward message. This is a documented implementation choice, not a claim that the workbook uniquely specifies LT055.

Normal damage runs through the existing Hero, equipment, ability, and Reaction pipeline using the label `Blight Spores Hazard`. Armor alone reduces Attack damage and does not cancel this Hazard. The workbook uses “unavoidable” without a separate definition; this implementation interprets it as bypassing prevention, while still processing zero-Health outcomes and after-damage effects. That interpretation is explicit rather than presented as a uniquely specified rule. Online resolution stages these effects in a detached game and submits a scoped outcome; the server checks the pending encounter serial and all three ledger sequences, validates card conservation and permitted state changes, and commits the effect, reward, patch, First Visit, and prompt clearing together. It rejects stale outcomes without applying a partial effect. A cleared persisted prompt prevents a reconnect or command replay from paying again.

This follows the existing trusted authored-worker model. The server validates the permitted outcome boundary; it does not independently re-execute and certify every Hero Reaction or defensive passive. Named regressions cover specific protections and outcomes, while other clauses remain uncertified.

System Rules 88 and Campaign IV Framework row 25 describe the 6–7 tier as an additional Enemy-group bonus. The first Spore Hazard therefore strengthens one effect band at Blight 3–7, once per Quest; the group bonus is separate and does not increase the band again. No general patch stacking cap or Forest-only placement restriction is invented from the encounter's descriptive Terrain column.

Under WE014, the authored Blight Patch effect suppresses the first 1 Health recovered at that Location each Round, shared by all Heroes there. Multiple patches do not multiply this first-healing penalty. A living Hero may cleanse one patch for 1 general Action when no living Enemy is present. Patch markers, counts, and the shared healing meter persist and synchronize; a late compatibility snapshot cannot restore a cleansed patch or reset a consumed meter. Ordinary healing, Rest, and designated phase-worker healing must follow the same rule, including a one-point recovery reduced to zero and no meter consumption when the Hero is already at maximum Health.

Final measured validation is recorded below when the complete run finishes.

## Certification boundary

Named effect assertions verify the scenarios recorded in `REPORT.md` and `execution.json`. Generic execution observations remain unverified. This follow-up does not certify every Encounter, Hero card, equipment interaction, or campaign rule. The existing strict full-effect coverage gate remains active.

The real phase-worker regression uses the existing EQ066 healing hook to verify patch suppression and preservation through a committed round. Its current hook runs after `endTurn`, while the equipment text says “start of turn.” That timing remains a separate unresolved defect; passing the patch test does not certify EQ066's timing. The first-Spore flag currently covers automated EN061 resolution; broader Poison/Spore hazard certification remains incomplete.
