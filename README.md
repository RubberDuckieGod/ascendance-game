# Ascendance 2.9.0 — Save Games

Builds directly on the confirmed 2.8.7 restart/reconnect build.

## What changed
- Added **Save Game** and **Load Game** player controls.
- Save Game downloads a named `.ascendance.json` file.
- Saves include format/version metadata, app/state version, save name, timestamp, multiplayer room (when connected), checksum, and the complete serialized gameplay state.
- Load Game restores the complete snapshot.
- Legacy exported state JSON remains loadable.
- In multiplayer, loading a save immediately broadcasts it to the connected room; the existing server persistence system then stores it normally.
- Combat, cards, map rules, enemy AI, multiplayer transport, and Render persistence are otherwise unchanged.
- Root `index.html` and `public/index.html` are identical.

## Test
1. Start or restore a game and make several moves.
2. Click **Save Game**, name the save, and confirm the `.ascendance.json` file downloads.
3. Change the game or restart it.
4. Click **Load Game** and choose the save.
5. Confirm round, heroes, map, enemies, decks/hands/discards, conditions, and Encounter/Search state restore.
6. In multiplayer, load a save on one client and confirm the other client receives the loaded state.
7. Restart/reconnect Render and confirm the room restores the newly loaded state from persistent storage.
