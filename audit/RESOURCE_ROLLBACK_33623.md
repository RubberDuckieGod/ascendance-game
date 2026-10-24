# Gold and loot rollback after normal actions

Baseline: `1e40be010b19a26510da886c1c19c7c9d66e62a3`, after the previous Render deployment. Branch: `fix/resource-cooldown-rollback`.

The supplied diagnostic contains 13 resource rejections, all `Invalid level Ability cooldown.` The server repeatedly restores its canonical Gold after those rejected updates. A recorded reveal reward and a later Search both travel through this path. The diagnostic does not record the exact 20-Gold Search card or its optimistic balance; those details must not be inferred from the debugging schema version. Player names, room codes, credentials and the raw diagnostic are excluded from this repository.

## Cause and correction

Ordinary movement/card/action tracking writes arrays to `campaign.levelRuntime3360.hero[hero].round.actionTypes`, even at level 1. Other authored fields in that object include a Spell name, hit-count maps and per-Hero retaliation flags. `cooldownSnapshot` exports that object in the legacy `levelRound` wire field. The server incorrectly required every value to be an integer cooldown timestamp, rejecting the entire resource update, including Gold, loot or item consumption.

The shared validator now checks the actual authored shapes with explicit bounds. Actual cooldown timestamps still must be integers between 0 and the current round. Unknown nested objects, invalid owners, unsafe keys, malformed counters and forged future cooldowns remain rejected. Existing client payloads and restored saves can retain their legitimate tracking data; the fix does not discard it to make validation pass.

Snapshot/apply now copy nested tracking data without aliases and preserve actor ownership. Retaliation history can retain an authored Hero who has left the active party; active owner records still require current party membership. A party departure must not make a valid historical flag reject the next resource update. Tracking fields, including the numeric `firstSpellRound` helper, are excluded from Worldheart's selectable cooldowns; real Ability cooldowns remain refreshable. This preserves the data needed by Perfect Sequence, Parallel Casting, Chain Reaction and Legendary Bastion. The state-contract tests do not claim independent full-effect certification of those abilities.

## Reproduction and expected results

The native regression uses isolated servers and synthetic room codes. Its restored-game fixture contains legitimate existing `actionTypes` metadata, then performs real movement and resolves the authored SD004 Search through the actual UI. This is a representative 20-Gold fixture, not a claim that the user's unidentified card was SD004.

| Scenario | Expected and measured assertion |
|---|---|
| Baseline restored online game | Actual Move records tracking data. Resolving the 20-Gold Search should produce 25 → 45 Gold; baseline canonical state instead remains 25 and rejects the update with `Invalid level Ability cooldown.` |
| Offline solo, mid-turn/final Action | 25 → 45 Gold, exact Search/Action costs, preserved through the next round. |
| One-Hero online game, mid-turn/final Action | Both local display and a fresh canonical room read show 45, with no resource rejection; still 45 after round transition and a new browser page rejoins. |
| Two connected clients, mid-turn/final Action | Both clients agree on 45; the Search is used once and its Action is spent once; the room and rejoining client retain 45 after the round. |
| Fresh-round online control | No preexisting action history; real movement creates the tracking array, the server retains it, and the subsequent Search retains 45 through round/rejoin. |
| All 16 Heroes' round-state contract | Authored action arrays and real cooldown stamps survive synchronization and remain distinguishable. |
| Additional authored metadata | Spell name/round, hit-count maps and retaliation flags survive JSON round trips without aliasing or overwriting another Hero's state/Quest flags. |
| Invalid or forged state | Wrong owner, future/negative/fractional cooldowns, unknown nested data, malformed arrays/counters/flags and unsafe keys reject without mutation. |
| Worldheart refresh | Tracking metadata is not an Ability choice; a real cooldown refresh still works and preserves Spell/Quest state. |

Reproduce with `npm test` and `CHROMIUM_PATH=/usr/bin/chromium npx playwright test tests/audit/gold-after-actions.spec.cjs`. The complete checked-in suite remains `npm run stability:33621`. The new Node file is `tests/resource-round-state-rules.test.cjs` and is included in the existing rules glob.

## Verification and limits

The baseline regression reproduced canonical Gold 25 instead of the expected 45. The final complete browser run passed **215/215**, with zero failed, skipped or flaky outcomes, in 728.1 seconds; all seven new Gold scenarios passed together. **147/147 Node checks** passed (43 foundation and 104 focused rules, including 30 new typed-round-state/history checks). The selected existing Work, craft, shop, Crystal and Worldheart scenarios also passed in a focused run. Expected/actual measurements are preserved in REPORT.md and execution.json; individual Node outcomes are in node-results.json. The strict full-effect coverage gate still exits 1 for 657 uncertified records.

No live player account, room or balance was edited to reproduce or fix this. The code accepts subsequent legitimate updates; it does not infer or backpay historical rewards. The exact user's missing award cannot be reconstructed from a debug log that omits its card and resource payload. Exhaustive card, item, Ability and campaign effect certification remains incomplete; the strict 657-record coverage backlog is unchanged.
