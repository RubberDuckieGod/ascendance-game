# Workbook review and confirmed repairs

Reference: `Ascendance_v10.52_Location_Ongoing_Effect_Clarification.xlsx`, Git blob `5478c63304af7a5c87740c488162dec2cce4738a`. The normalized reference is [workbook-reference-v10.52.json](workbook-reference-v10.52.json).

## Confirmed owner decisions

- Bleeding deals 1 damage at activation start and remains until removed.
- Garruk Attack stays 2; Lucien Attack stays 3.
- Lyra's Thieves' Tools retains Hero-deck inspection. Feint and Uncanny Reflexes retain the documented 1-damage triggers. Card text uses those rules.

## Repairs

- Ordinary movement into Thorne's Wild Growth creates a real next-activation Regenerating expiry. Permanent Regenerating is preserved; declines, refreshes, extra activations and stale snapshots are covered.
- Nature's Blessing heals the chosen Hero and removes exactly one selected Bleeding/Burning condition, with cancellation before spending.
- Status IDs and named condition objects share application, immunity, lookup and removal. Wet/elemental immunities, Ward, Unstoppable, Consecrated, Steadfast and Sanctified have shared application rules.
- Vulnerable, Cracked Armor, Berserk, Restrained, Enraged, Corroded and Disarmed reach actual combat/equipment consumers. Disarmed disables Weapon bonuses, abilities and range, preserving Armor.
- Duration receipts distinguish actual activations, same-round extra turns and round boundaries. Hasted, Exhausted, Shocked and Confused affect Action grants.
- Recovery respects Diseased, Scorched and a per-effect Withered cap, including equipment healing riders.
- Protected, Barrier and Resolute resolve before defeat. Barrier stores remaining prevention in its serialized condition. Typed elemental damage handles Fireproof, Arcane Shield and Electrified. Enemy on-damage riders use actual Health loss after prevention.
- Knocked Down requires a one-Action Stand, including a native room command, instead of substituting Stunned.
- Blessed, Shaken, Empowered, Focused and Rallied reach actual Attack consumption. Frenzied/Bloodthirsty have scoped Attack/kill hooks. Attacking removes Hidden/Camouflaged.
- Card copy counts, costs and printed targets match the workbook. Frost Nova/Firestorm select at most three Enemies. Perfect Form preserves a one-Action minimum. All Hero base-stat rows use the workbook plus confirmed overrides.
- Spirit Wolf has 3 Health and 0 Armor and expires with its source encounter. Turret has 4 Health and 1 Armor, fires once per distinct Mira turn, and expires at encounter end. Emergency Repair supports Heroes and Constructs. Master Engineer boosts Construct Health and Turret damage until Mira's next actual activation.
- Spawned Enemy identity resolves workbookId/type as well as cardId/id. Wolf Rider charges add Attack rather than Armor ignore; Bodyguard and Forest Spirit grant Armor rather than Attack; Scout uses melee 1/ranged 2; War Chief's Crushing Blow forces movement.

## Verification boundaries

The review compares all 323 Hero card definitions, 144 Equipment, 190 Loot, 125 Enemy chassis, 256 Hero level rows and 102 status definitions. Tests build all 16 Hero decks and exercise the named consumers above. Metadata parity is not independent proof of every printed clause.

Relevant suites are `tests/audit/workbook-consumers-33628.spec.cjs`, `generic-status-consumers-33627.spec.cjs`, `healing-status-33628.spec.cjs`, `healing-summons-33627.spec.cjs`, and the shared-rule/native WebSocket tests.

The pre-existing strict full-effect certification gate remains enabled. Its 657 unverified Hero/Equipment/Loot records are not converted into passes by this review. Source-defined statuses and scenarios still require their own complete effect oracles before exhaustive certification can be claimed.

Quest retry assertions retain the same four requests, single commit and reward checks; their wait now covers the application's existing 45-second recovery deadline. Garruk/Lucien passive and Aldric equipment-Health expectations use the confirmed balance rules.

After merging, the production verifier compares every top-level public script and index.html against merged main, waiting for Render's automatic deployment without opening player rooms or changing saved games.
