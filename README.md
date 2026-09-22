# Ascendance 3.0.17 — Lyra Map Movement Fix

Built directly from the user-confirmed working 3.0.15 baseline.

## Bug found
3.0.15 correctly routed a clicked tile to `moveLyra()`, but the board renderer still decided which adjacent tiles were clickable using the old shared `g.activeHero`.

That meant a Lyra client could move once in some layouts, then the board could continue calculating clickable destinations from Aldric's position/actions instead of Lyra's current position.

## Fix
The board's movement eligibility calculation now uses `controlledHero()` for:
- current X/Y position;
- remaining Actions;
- Engaged state.

The click itself already used `controlledHero()` in 3.0.15 and is preserved.

No First Visit change is included. No Search change is included. Remote ownership, save/load, persistence, reconnect, and the rest of the confirmed 3.0.15 behavior are otherwise unchanged.
