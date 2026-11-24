# Ascendance v10.58 online rules bridge — release scope

Date: 2026-11-24. Status: **Playtest**.

The workbook and searchable Design Bible are maintained separately from the browser game's original v10.52 source workbook. This patch implements the listed *runtime* changes; it **does not claim full card or Location parity with v10.58**.

## Implemented in this release
- **Rest:** 2 Actions, 3 base Health, before specific bonus recovery (e.g. LT012 Traveler's Rations). Cannot Rest with enemies in the current Location; Prepared overrides Action cost; normal Health cap and statuses apply.
- **First Visit safety:** already enforced server-side: if enemies occupy the Location when First Visit begins, the visit and extra Encounter are blocked. Legitimate later entry is required. This release preserves that behavior.
- **Party Lore:** persistent between Quests; new gain cap 12 (preserves previously saved balances above cap). Room authority owns the balance. One fully implemented online spend is **Read Ahead**: spend 1 Lore once per Quest to inspect and choose the order of the top 2 Encounter cards. No payment until the choice is committed.
- **Party Evidence:** temporary shared Quest-specific clues; the first successful Search in the designated Q013 locations (L054/L055/L060) or Q014 locations (L069/L070/L071/L072) grants 1 Evidence, once per qualifying Location per Quest attempt. Evidence clears on Quest transition and never substitutes for LT161 or other persistent story Quest Items.
- **Lore awards:** first immediate noncombat results from EN050, EN053, EN055 grant 1 Lore. Postcombat rewards from higher severity results are **not** automatically granted in this patch.
- **Supply:** preserves the existing party-supply runtime and prevents the new v10.58 resource logic from silently shrinking legacy saved Supply balances. The v10.58 playtest cap of 9 applies to new grants performed by the new resource module. Supply carried by a Wagon is a **separate Quest objective**.
- **Online UI:** a compact shared-resource readout of Lore/Evidence/Supply and the working Read Ahead button.

## Not yet fully implemented in the browser game
- All 235 new named First Visit benefits (rules remain in the workbook/Bible; current server protects eligibility only).
- All five Lore spending abilities in the browser; only Read Ahead is currently actionable.
- Universal Supply setup spending buttons (Field Dressing/Prepared Pack/Shared Provisions are defined but not wired into the Quest setup phase).
- All Lore/Evidence awards from Location reveal/Search text, high-severity or postcombat Encounter resolution, Campaign event and Quest objective progression.
- WE003/Q010 Wound Token maximum-Health modifier and all additional v10.58 component art or 3D models.

## Compatibility and security
- Live rooms and saved parties remain on Render's persistent disk; deploying the rules does not reset stored games.
- Lore and Evidence cannot be minted by ordinary client resource snapshot updates.
- Lore Read Ahead is a server-authoritative two-stage preview/commit transaction with a deck fingerprint; no spending occurs on cancellation or stale preview.
- Existing Quest Evidence remains separate from named persistent LT Quest Items.
- Regression tests cover the Rest base amount, Rations bonus, resource caps and idempotent receipts, Quest/attempt cleanup, and legacy Supply retention.

## Next phase
Reconcile workbook v10.58 Location feature text with the runtime's Reveal, Arrival, Once-clear, and Quest-specific entry timing before enabling automatic Location effects. This must be tested separately to avoid Encounter duplication and multiplayer save regressions.
