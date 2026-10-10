# Ascendance Remote Multiplayer

## Current build: 3.30.5

3.30.5 keeps the confirmed 3.30.4 Relic / Quest Item baseline and moves shared exploration state under room authority.

Highlights:
- Room owns Location pool draws and exact map placement/orientation.
- Room owns Search deck draws, skipped cards, Search counts, resolve/cancel state.
- Room owns Encounter draws/discards and Severity rolls.
- Room owns First Visit state.
- Pending Explore/Search/Encounter prompts are per-Hero and recoverable after reconnect.
- Stale client snapshots cannot restore used tiles/cards or undo shared exploration progress.
- Scout's Kit, Explorer's Compass, Tome reordering, and special Location reveals remain supported.
- Existing 3.30.0–3.30.4 room authority, combat, Hero state, Quest failure, Relic, and Quest Item behavior is preserved.

See `README_3.30.5.txt` for the full change list and test results.
