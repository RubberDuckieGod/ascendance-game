# Ascendance 3.27.37 — Custom Hero Starting Equipment Fix

Built from the confirmed-working 3.27.36 baseline.

## Fix
- When a custom Hero joins a campaign for the first time, the runtime equipment is now forcibly initialized from that Hero's saved Character Creator `startingEquipment` selection.
- Prevents generic expanded-Hero defaults from replacing a custom Hero's chosen weapon/armor/accessories before the custom join path finishes.
- Preserves later equipment changes: the correction runs only when the custom Hero is newly added to the party.
- For the reported CH001 definition, the saved IDs remain EQ014 / EQ086 / EQ097 / EQ098 (Iron Hand Axe, Chain Shirt, Amulet of Vigor, Traveler's Charm).

Preserves 3.27.36 custom-Hero OOM fix and all prior authentication/account synchronization fixes. DEBUG remains enabled.
