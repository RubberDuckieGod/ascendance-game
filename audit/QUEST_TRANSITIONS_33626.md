# Quest setup, Search recovery and Encounter Reputation

This follow-up addresses the reported Q002 board reset, Lost Hero replacement, Garruk Search stall and missing Encounter Reputation. It changes the website and local HTTP/WebSocket server. It does not update the separate Unity game.

Functional tests use isolated local servers, temporary save directories and fresh browser contexts. No production or staging player accounts, rooms or saves are used. The private uploaded diagnostic is not included in the repository.

## Confirmed defects and reproductions

| Defect | Reproduction before the fix | Expected | Observed before the fix |
|---|---|---|---|
| Q002 contains the previous Quest's board and dead Hero | Complete Q001 with a Lost participating host, enter Downtime and begin available Q002 in a connected room | One new-Quest setup: Round 1, fresh Stonebrook board and normal replacement Hero | Local setup emitted ordinary Hero, Combat and Resource changes against the previous server ledgers. The downed actor's changes were refused, and subsequent replies restored the previous board, round and Health beneath Q002 campaign metadata. |
| Cardless or foreign Encounter prompt blocks Search | At Round 10, let Garruk's paid Search open an Encounter; delay its authoritative draw or restore the waiting prompt on the other participant | A waiting placeholder cannot resolve, and only the owning Hero resolves the actual canonical card | The placeholder could reach `encounterText320` without its card, throwing while reading `d`. Stale waiting prompts and resolver locks could remain active. |
| EN008/EN019 combat resolution omits Reputation | Resolve EN008 Refugees or EN019 Lost Child at Severity 5–6 or 7+, then defeat the spawned Encounter enemies | Award the selected outcome's +1 or +2 Reputation exactly once | The reward parser looked for a literal Reputation amount in the generic card reward field, missing amounts in these authored combat outcome bands. |
| Combat setup log appears to mean victory | Resolve EN004 Wolf Pack at Severity 1 while its spawned wolf remains alive | Identify the start of Encounter combat; award the printed Loot on completion, with no Reputation | A generic “Encounter resolved” message appeared when combat was only being set up. The supplied Wolf Pack sequence does not establish an unpaid Reputation reward. |

The Quest setup correction uses `QUEST_TRANSITION_33626`, an explicit server transaction with an exact source Quest, target Quest, expected room revision and durable request ID. Ordinary compatibility patches cannot start another Quest. The server validates the party, campaign identity, World Event, Day, target availability, fresh board shape and carried resources before replacing all Quest ledgers together. A Lost participating host may request this setup without gaining permission to perform normal downed-Hero actions.

The committed result includes canonical Turn, Hero, Combat, Exploration, Resource and Phase snapshots. Their sequence numbers advance together; every participating browser applies that baseline without sending setup mutations back. Quest epochs reject delayed writes from the old Quest, including an old Round 1 packet after the new Quest also starts at Round 1. Receipts and epochs survive compatibility updates and save/reload.

The server identifies this path through the health field `questTransitionEngine: atomic-setup-33626`. That marker identifies installed code; gameplay correctness is established by the effect assertions below.

## Gameplay measurements

The normal next-Quest setup rules set every participating Hero to maximum Health. Lost Heroes receive a normal Level 1 replacement; surviving Heroes keep progression, equipment and carried inventory. A surviving Hero's spent starting Potion is not replenished. These expectations follow the rulebook's Hero death/replacement rule and scenario setup step; they do not infer a new reward for starting a Quest.

| Scenario | Expected | Measured corrected result |
|---|---|---|
| Solo Lost replacement, every authored Hero | Level 1, 0 XP, authored starting equipment, one LT002, maximum starting Health, fresh board and opening hand | All 16 Hero paths match those values; no old board tile remains. Card-zone totals match each Hero's existing normal starter baseline. |
| Solo Downed survivor | Retain XP, level, equipment and inventory; recover setup maximum Health; no replacement Potion | Progression and gear unchanged; EQ097's +2 maximum Health retained; no extra Potion. |
| One online Hero and two native browser clients | Q001 → Q002 atomically; Round 1; only Stonebrook revealed; Lost Rowan restarts at 9 Health; carried Gold 37 and Reputation 4 | Canonical server and all clients agree; surviving Lyra retains XP/inventory and starts at 8 Health. Reads, page reload and rejoin preserve the new state. |
| First multiplayer turn after setup | All Heroes unstarted with 0 Actions until a legal claim, then current Hero has 3 Actions | Server ledger starts at 0; the first legal claim supplies 3. A newly joined built-in Hero also remains unstarted at 0. |
| Stale, forged and foreign setup requests | Refuse wrong host, stale revision, changed party/campaign/World Event/Day, invalid board and minted persistent rewards | Refused before mutation. Canonical Gold, Reputation, XP, equipment, inventory, Quest Items and persistent decks remain unchanged except authored Lost replacement. |
| Duplicate accepted request and restart | Return the latest canonical state without resetting play or awarding setup again | The same request ID is idempotent during the next turn and after process restart; domain sequences do not regress. |
| Connection closes after server commit but before setup confirmation is applied | Rejoin and resend the exact original request; do not generate a new request or award setup twice | Repeated submissions have identical payload/ID; the server returns its existing receipt. Both clients reach Q002/Round 1 with one receipt, epoch 1 and Tokens 4 → 5 exactly once. |
| Every specialized setup confirmation is lost | Stop bounded retries, block unsafe writes and offer a canonical room refresh | Exactly four submissions use one ID. An actionable “Refresh room” control appears; the canonical read recovers the single committed Q002/epoch 1 and releases the write guard. Gold 37, Reputation 4, replacement inventory and 4 existing Tokens remain canonical. The next legal turn has 3 Actions at Round 1 and 9 Health. |
| Delayed old-Quest state or command | Preserve the new Quest and reject old writes | Old snapshots do not replace the client board; old Hero/Resource commands are refused even for Round 1 → Round 1. Stripping epoch/receipt metadata in a compatibility patch does not disable this protection. |
| Retained-level setup abilities | Restore progression before applying fresh Quest-start abilities | Aldric's Level 2+ Battle Ready starts Guarded; old per-Quest cooldown flags clear. Mira's Masterwork selection is requested once and retained. |
| LT149 with an Ascendance Token system | One retained owned Shard grants exactly one Token; the card alternative does not also apply | Two-client fixture: 4 → 5 Tokens, normal 5-card opening hand, still 5 Tokens after reload/rejoin. Repeated preparation derives the same count. Lost ownership, zero quantity and non-Loot entries grant no Token. |
| LT149 without a Token system | Existing one-card alternative, without a Token award | Opening hand has 6 cards and the existing receipt is set; no Token is added. |
| Existing Exalted faction opening blessings | Use canonical faction score, correct region/Quest gate, one allowed Spirit Court choice and unspent start-perk receipt | Q043 Spirit Court applies the chosen Inspired once; Q049 Beacon Order applies Guarded; Q067 First Dawn applies Inspired. Lower scores, wrong gates and already-consumed receipts grant no new blessing. |
| Sanctified Vanguard trigger/setup follow-up | Only Seraphine herself gaining Guarded at Level 11+ can propagate to another eligible Hero; one chosen target and one use per Round | New isolated cases pass: Level 10 does not propagate; Level 11 does; Aldric gaining Guarded alone does not trigger it. A three-Hero choice occurs once, does not recurse/repeat in the same Round and becomes available in the next Round. Two native clients preserve Q049's propagated Guarded and round-use marker through duplicate submission and rejoin. Printed duration is separately unverified. |
| Regional starting Location identity | Validate the authored regional starting Location rather than requiring Stonebrook for every campaign | Q049 starts at its existing authored L162 in the native two-client follow-up. The Q002 regressions retain Stonebrook/L000. Opening enemy-group correctness is outside this identity check. |
| Garruk paid Search in solo, one-Hero online and two-client play | One Action and one Search consumed; SD057 plus EN030 Severity 2 grants +10 Gold and +1 Health once | 3 → 2 Actions, Gold 23 → 33, Health +1, Search count 1 and EN030 discarded once; server and peer agree. Repeated Resolve calls add nothing. |
| Delayed Encounter draw and foreign restored placeholder | Keep the real draw pending; refuse cardless resolution; clear foreign waiting UI | No exception or premature cost/reward. The canonical card later resolves once; the observing client can continue. |
| Local Encounter resolver failure and stale card identity | Release the local lock on error; retain retryable pending state; replace a mismatched restored card even at the same Severity | Injected failure changes no Gold/Health/discard, restores scheduling and permits one retry. Canonical EN030 replaces stale EN029. |

The all-Hero replacement measurement covers Aldric, Lyra, Elara, Vaelis, Rowan, Seraphine, Thorne, Cassian, Kael, Mira, Malachar, Garruk, Veyra, Mordren, Lucien and Asha. It verifies replacement/setup behavior, not every card or level ability for those Heroes.

## Encounter reward measurements

Each row is exercised offline and with two connected native browser clients. Combat variants defeat the actual spawned enemies through attacks. Assertions include the exact reward, canonical state, both browsers, repeated completion and reconnect.

| Encounter / selected Severity | Expected reward on completion | Corrected result |
|---|---|---|
| EN019 Lost Child, 5 | +1 Reputation | +1 once; no added Gold or Loot |
| EN019 Lost Child, 7 | +2 Reputation | +2 once; no added Gold or Loot |
| EN008 Refugees, 5 | +1 Reputation, 15 Gold | +1 once; Gold 37 → 52 |
| EN008 Refugees, 7 | +2 Reputation, 15 Gold | +2 once; Gold 37 → 52 |
| EN004 Wolf Pack, 1 | 1 Loot, 0 Reputation | Wolf remains active after setup; defeating it awards 1 Loot once and keeps Reputation at 0 |
| EN019 Lost Child, 1 | +1 Reputation without combat | +1 once; no enemies spawned |

No Reputation backpayment is inferred from the private Wolf Pack trace. A remaining live enemy is not a completed Encounter, and the selected EN004 outcome does not promise Reputation.

## Reproduce and review

Run from the repository root with Node 24 and Chromium installed:

```sh
npm ci
npx playwright install --with-deps chromium
npm test
npx playwright test --config=playwright.quest-transition.config.cjs
npm run audit:mechanics
npm run audit:report
npm run audit:coverage
```

The focused browser configuration includes `quest-transition.spec.cjs`, `pending-encounter.spec.cjs` and `encounter-reputation.spec.cjs`. Shared contract tests are in `quest-transition-rules.test.cjs`; `quest-transition-server-rules.test.cjs` launches the real HTTP/WebSocket server, checks two connections and restarts it against temporary persisted data. The focused GitHub Actions workflow runs Node and connected-browser regressions and uploads their evidence even after failure. It contains no merge or deployment step.

The current frozen application/test source is `e71fc8773c575cf3667ef387e8b18cbd812def09`. Its full `npm test` run passed **240/240 Node checks**: 43 foundation checks and 197 shared-rule checks. The complete focused local browser configuration passed **29/29 cases in 302.5 seconds**, with zero failures, skips or flaky results: 10 Quest setup cases, 7 Search prompt cases and 12 Encounter Reputation cases. The two added Vanguard cases cover the printed trigger/setup correction and regional starting-Location identity; they are included in those 29, not additional cases. The final complete hosted browser run for this later source is pending.

The current [focused Quest/Encounter workflow](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/41159829826) completed successfully: **240 Node checks and 29/29 browser cases passed**, with zero browser failures, skips or flaky cases; browser duration was **168.5 seconds**. The separate [cache-upgrade workflow](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/41159829803) and [phase workflow](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/41159829829) also completed successfully. The current [322-case full audit](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/41159829828) remains pending; the earlier 320-case run below is not substituted for that result.

[quest-transition-current-results.json](quest-transition-current-results.json) contains the latest source's 29 browser measurements and 240 Node outcomes. The complete [REPORT.md](REPORT.md), [card-observations.json](card-observations.json) and [node-results.json](node-results.json) retain the preceding 9c89 checkpoint's 320-browser/238-Node attribution. They do not claim a completed e71 full audit. [quest-transition-validation.json](quest-transition-validation.json) records both source revisions and run provenance.

### Completed preceding checkpoint

The preceding application/test source was `9c89ea2441dde5b6689479e5faf9e815e411fcee`. GitHub tested that head merged with the PR base in synthetic merge `84abd049c46009db107472e23122899d4f178fbe`; this was a review test commit, not a merge into main. That checkpoint's full `npm test` run passed **238/238 Node checks**: 43 foundation checks and 195 shared-rule checks, with no failures, skips or cancellations.

The review branch is published as draft [PR #7](https://github.com/RubberDuckieGod/ascendance-game/pull/7). The [full hosted audit](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/41156645878) passed **320/320 browser cases in 1,353.0 seconds**, with zero failures, skips or flaky results. Its preserved outcomes record `foundation`, `stability` and `mechanics` as successful. The strict full-effect coverage step failed for 657 incomplete records, and the workflow deliberately retained that failure as its overall red conclusion. It is not an entirely green workflow.

The separate [focused Quest/Encounter workflow](https://github.com/RubberDuckieGod/ascendance-game/actions/runs/41156645833) completed successfully: **238 Node checks and 27/27 browser cases passed**, with zero browser failures, skips or flaky cases; browser duration was 113.3 seconds. Those 27 cases are a subset of the full 320, not additional unique coverage.

[quest-transition-validation.json](quest-transition-validation.json) records the source revision, run provenance, browser selections and separate attempt outcomes. It does not combine partial-run observations with final evidence.

Those preceding full and focused runs include 7 Search prompt cases, 12 Reputation cases and 8 Quest setup cases. The eight Quest cases include lost-confirmation reconnect and bounded four-attempt recovery; the final recovery assertion verifies that the next legal turn supplies 3 Actions at Round 1 with 9 Health. The 15 new focused Node contract/server checks are included in that checkpoint's 238 total. The two later Vanguard browser cases are not included in its 320-case count.

### Interrupted local browser attempt

The first local complete-suite attempt used the stability wrapper's automatically selected system Chromium **154.0.8037.57**, although direct focused runs used the bundled **156.0.8078.4** browser. It was interrupted and preserved after **96 passed, 5 failed, 1 interrupted and 218 unrun cases**; it is not a 320-case pass. Two cases exceeded their existing 60-second case limit and three exceeded existing 5-second polling limits:

| Case | Actual result in the interrupted attempt | Explicit bundled-browser follow-up |
|---|---|---|
| Lethal LT020 cost before Q001 rewards, two clients | 60-second case timeout | Passed, 25.6 seconds |
| Rejected Downtime requests preserve choices/resources | 60-second case timeout | Passed, 26.7 seconds |
| Off-turn native shopping/equipping/trading/selling | 5-second polling timeout | Passed, 26.2 seconds |
| EN008 Severity 7, two-client Reputation | 5-second polling timeout | Passed, 27.2 seconds, including rejoin |
| EN004 Severity 1, two-client Loot/zero Reputation | 5-second polling timeout | Passed, 34.8 seconds, including rejoin |

These failures are retained as failures of that attempt. The exact five-case follow-up passed **5/5 in 151.6 seconds**, with no skips or flaky results, using the explicitly selected bundled browser and the original timeouts. No application or test source was changed for that rerun. The partial run's generic observations are not merged into final certification evidence. The completed 320-case hosted run supplies the primary complete-suite evidence.

## Limits and remaining work

- The strict full-effect certification gate remains incomplete for **657 records**. Passing named scenarios and generic dispatcher observations do not certify every card, item, Hero ability, encounter or combination.
- Seraphine's existing clean website starter baseline contains **28 cards**. The replacement regression preserves that baseline; it does not certify a 30-card deck or silently add missing cards.
- Shuffled Quest pool/card contents and scenario objective setup still use the existing scenario builder. The transaction validates the fresh board contract and persistent state; it is not an independent implementation of every Quest setup or an exhaustive advanced-status synergy audit.
- **PARTIAL — Sanctified Vanguard duration:** the bounded follow-up tests its printed trigger (Seraphine herself gains Guarded), Level 11 threshold, target choice, once-per-Round use and setup synchronization. Its printed “until the end of their next turn” duration remains unverified. Guarded is stored as a bare condition with the generic “until removed” default, and no reusable exact per-Hero next-turn expiry API was found. No new duration engine is included; this record is not fully certified.
- A previously mixed Q002 save is not automatically reconstructed. The safe intended board and progress cannot be inferred from its current metadata alone. No live save reset, automatic heal, reward backfill or campaign restart is performed by this change.
- Tests establish local behavior. Production deployment and main-branch merge are separate review actions. Existing participants need the updated client after an eventual deployment; an unsaved open window is not forcibly reloaded.
