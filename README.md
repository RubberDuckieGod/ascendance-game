# Ascendance 3.0.12 — Hero Ownership Fix

Built directly from 3.0.11.

3.0.11 used selectors that did not match the actual Party/deck DOM, so the intended remote ownership presentation did not take effect.

## Fixed
- Remote Aldric player: Aldric deck visible, Lyra deck hidden.
- Remote Lyra player: Lyra deck visible, Aldric deck hidden.
- Control Aldric and Control Lyra buttons are hidden in connected Remote mode.
- Both Heroes remain visible in Party with public HP, Armor, Attack, Actions, and statuses.
- Selected Hero receives a YOU marker.
- switchHero retains the existing ownership guard and now explicitly rechecks Remote ownership.

No persistence, server-save picker, reconnect, map, combat, card-effect, or Adventure Log behavior was redesigned.
