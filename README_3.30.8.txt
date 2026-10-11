ASCENDANCE 3.30.8 — CONSUMABLE DEPLETION / STARTING POTION PERSISTENCE FIX

Fixes the multiplayer bug where consuming the starting Common Healing Potion (LT002) removed it locally, but the historical gameplay-integrity sync wrapper treated a missing starting potion as corruption and recreated it after every authoritative state apply.

Behavior now:
- Each Hero still receives exactly one starting LT002 when first added to a campaign.
- Using LT002 consumes one inventory copy.
- STATE sync, reconnect, render, Hero/combat/exploration authority refreshes, and ordinary room updates do not recreate a consumed potion.
- Extra Healing Potions legitimately gained later remain usable one copy at a time.
- Existing room/server join behavior is preserved.

Built from the confirmed-working Ascendance 3.30.7 baseline.
