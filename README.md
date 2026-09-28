Ascendance 3.27.11 — Amulet of Vigor Fix

Based on 3.27.10 Card Audit Debug.

Fixes:
- EQ097 Amulet of Vigor now increases effective Maximum Health by 2 everywhere custom-Hero health is displayed and healed.
- A Hero who begins at full printed Health with Amulet of Vigor equipped begins at the increased full Health (e.g. 14 -> 16).
- Healing can restore the wearer up to the increased maximum.
- The fix does not heal an already-injured Hero merely because the amulet is equipped.
- Card audit DEBUG instrumentation remains enabled for the next clean-game test.

Deploy the full package to Render.
