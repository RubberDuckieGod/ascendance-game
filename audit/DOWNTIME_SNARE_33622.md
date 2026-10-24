# Downtime, Snare and multiplayer follow-up

Branch: `fix/downtime-snare-sync`, based on main `c4406b3bc50423683de1e4ed172f181df2913e31`. Functional checks use localhost, isolated browser contexts and temporary room/save directories. Production Render, staging player data, accounts and saves were not changed. No merge or deployment is included.

## Reproduced defects and repairs

| Defect | Before | Repair and reproduction |
|---|---|---|
| Work reward rollback | A local +25 Gold and activity choice travelled through separate synchronization paths. The server rejected resource changes outside a combat turn, retaining the choice while restoring the old Gold. | An owned, token-scoped `DOWNTIME_COMMAND` commits the choice and reward together; dedicated server receipts survive restart. `downtime.spec.cjs`, two actual clients. |
| Off-turn downtime interactions rejected | Gather, crafting, shopping, equipment and trade inherited Hero-phase turn guards. | Allow downtime outside combat turn ownership; validate activity/recipe or one legal purchase, sale, trade or equipment change against canonical resources. Invalid commands leave resources unchanged. |
| Purchases rejected for inactive Hero data | The resource scan included saved level cooldowns for Heroes outside the active party; validation rejected a legal purchase as `Invalid Ability owner`. | Only active-party level cooldown records travel in resource snapshots; saved inactive-Hero records remain intact. Unit and two-client shop tests. |
| Quest status without canonical rewards | A compatibility snapshot could retain Completed/history/reward-claimed flags while canonical resource merging discarded the payout. | Derive authored quest rewards in the server completion transition and save a receipt; never accept client-selected amounts or equipment. The browser separates reward fields from ordinary pending card/item costs. Native Q001 checks exact Gold, XP, Reputation, equipment and replay behavior. |
| Missing Q010/Q012 payout branches | Their legacy payout table omitted both quests. | Add the authored Q010 and Q012 branches, including one Legendary per Hero for Q012. `quest-rewards.spec.cjs` checks exact payouts and refusal to pay twice. |
| Active adventure lost after restart | Compatibility snapshots omitted the server's top-level started flag. Data loaded after restart, but clients received no adventure-resume event. | Preserve both started flags on server saves and recognize the legacy game flag when the envelope flag is absent. Restart test stops and starts a real isolated server and requires native resume on both clients. |
| Snare missed spawn paths | Only legacy spawn and selected reinforcement helpers invoked the trap hook. Encounter and quest/campaign insertion paths could bypass it. | Shared enemy-entry rule for solo and room authority, with armed-array insertion hooks for solo/resolver spawns. Named browser tests cover encounter, quest and legacy spawn paths, forced movement and actual multiplayer entry. |
| Snare kill did not finish the quest | A room Snare could remove the final 2-Health Captain and credit the kill while Q001 stayed Available with no payout. | After canonical entry effects, only the active player runs the authored objective checks. `snare-objectives.spec.cjs` verifies immediate Completed status, +75 Gold, +100 XP each, +1 Reputation, one Common draw and one receipt on two clients. |
| Missing/stale Snare graphic | Newly placed snares were not reconciled with map pieces, and consumed traps could leave a ghost. | Derive one map piece per armed location and render an accessible SVG trap marker; remove both after trigger. Save/load and two-client tests check the graphic. |
| Kill credit erased by a stale peer | Room Snare damage credited the owner, then a later compatibility snapshot could replace that total with zero. | Preserve cumulative campaign kill totals across compatibility snapshots. The lethal multiplayer test waits for the server's response and checks owner count, no enemy resurrection and no restored trap. |
| Lethal consumable cost ordering | Fire Flask, Throwing Knife and Holy Water could call quest completion before removing the consumed item; Rope & Grapnel likewise consumed its item after movement callbacks. | Validate the target and spend the Action, then remove the item before lethal-damage callbacks. Final notices render after the effect, without consuming twice. Lethal native tests cover LT016/LT019/LT020; Rope movement completion still needs a quest-specific end-to-end fixture. |

## Expected gameplay assertions

The full execution report and named test sources provide the current pass/fail results; this table states their independent numeric expectations.

| Mechanic | Expected / asserted actual behavior |
|---|---|
| Work, solo and native multiplayer | +25 party Gold per Hero, one activity per downtime; two simultaneous Heroes give +50, not +25 or +100. |
| Ownership, old token, invalid activity/profession | Rejection; no Gold/material/choice change. |
| Replayed activity/craft command | Same receipt, no repeated reward/cost; saved receipts remain after process restart. Recent command history retains 200 receipts. |
| Gather | Exactly two authored, tier-eligible materials; inventory delta totals two. Recipe/material catalog parity is not a gameplay pass for every recipe. |
| Research | One preparation credit for the selected profession; one subsequent craft uses one credit and discounts up to 25 Gold. |
| Craft selection | Enables crafting; awards no item or profession progress by itself. |
| CR001 real crafting | Each craft spends 2 LT031 + 1 LT034 and creates one EQ002; first researched craft costs 0 Gold, second costs 10; combat Actions unchanged. |
| Shop / equip / unequip / trade / sale | Printed/reputation-adjusted price; owned item moves to the correct inventory/slot/recipient; one-item sale pays its calculated value; no downtime activity or combat Action consumed. Forged +999 Gold is rejected. |
| Q001 native completion | At two Heroes: +75 party Gold, +100 XP each living Hero, +1 Reputation, one canonical Common draw; exactly one saved receipt and payout. |
| Q010 reward | +225 XP per living Hero, +200 Gold at two Heroes, one Epic draw. Repeated completion pays nothing. |
| Q012 reward | +300 XP per living Hero, one Legendary per Hero, +3 Reputation, no quest Gold. Repeated completion pays nothing. |
| Resource costs around completion | Pending consumable cost and Action spending remain committed; a stale snapshot cannot restore the item or remove the quest payout. |
| Snare placement | H005-009 spends its printed general Action and moves the owned card from hand to discard once; target must be another connected, revealed location without a Snare. |
| Spawn/entry trigger | First living entering enemy takes exactly 2 direct damage through Armor and gains Rooted; second enemy remains unchanged; trap and marker disappear once. |
| Existing enemy / forced movement | Placement does not retroactively hit an existing occupant. A later genuine entry, including forced movement, triggers it. |
| Rooted from actual Snare | Spawned Raider stays in its location for its next activation, cannot pursue/damage the adjacent Hero, then Rooted expires. |
| Snare completes Q001 | A forced entry kills the final 2-Health Captain; both clients reach Completed immediately with one 75-Gold quest payout, without advancing an Enemy/World phase. |
| Lethal entry | Enemy removed; exactly one kill credited to the trap owner. Save/load and stale peer state do not restore trap/enemy or erase the kill. |
| Save / reconnect / restart | Both native clients resume the active saved adventure with the same Gold, activity and reward receipts; duplicate Work remains refused. |

## Boundaries that remain open

All 72 quest reward records are enumerated and their catalog parity checked. This does not certify every quest objective, event reward, optional branch or full campaign. Quest completion from the designated Enemy/World/End worker retains the existing trusted phase-job boundary; receipt adoption does not independently prove every worker reward amount. Automatic World Event bonuses are separate from the new quest payout hook and need their own end-to-end certification.

Existing Completed saves without a reward receipt are not automatically paid again: flags alone cannot establish whether an older payout already happened. Repairs to actual player balances require a separate, reviewed recovery using evidence; this patch never touches production saves.

When the canonical completion hook cannot draw an authored Equipment reward, it saves that reward as owed and shows it in Downtime. The legacy phase-worker payout path still needs independent unavailable-reward verification; adoption preserves existing owed entries. Q060/Q072 request Mythic Equipment, but the ordinary deck setup defines no Mythic deck policy. No substitute rarity is invented and this behavior is not marked as a successful Equipment award.

Other enemy-array replacement paths, all campaign-specific spawn branches, every card/equipment synergy with Snare and simultaneous reaction timing still need dedicated gameplay fixtures. The strict global coverage gate remains failing for incomplete effect certification. Passing this follow-up suite must not be presented as every game interaction being fixed or certified.
