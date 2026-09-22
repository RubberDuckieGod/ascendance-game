# Ascendance 3.0.0 — Game Lobby

Built directly from the locked, confirmed-working Ascendance 2.9.0 Save Games package.

## New in 3.0.0
- ASCENDANCE opening lobby / main menu.
- **New Game**
  - Q003 — Clear the Abandoned Watchtower
  - Aldric or Lyra selection
  - Solo / Local or Remote Multiplayer
  - Room-code creation for remote play
- **Load Game**
  - Loads the proven 2.9.0 `.ascendance.json` save format.
- **Join Game**
  - Room code + Hero selection
  - Uses the existing server-authoritative multiplayer restore handshake.
- **Main Menu** button from the game screen.

## Locked foundation preserved
The 2.9.0 save/load, WebSocket synchronization, authoritative reconnect/restore, Render persistent storage, combat, Hero cards, enemy AI, and map rules were not redesigned. 3.0 is a shell around that working game.

## Test order
1. Open the game and confirm the lobby appears before the board.
2. New Game → Solo / Local → Q003 → Aldric or Lyra → Begin Adventure.
3. Main Menu → Load Game → load a known 2.9.0 save.
4. Main Menu → Join Game → enter an existing room and Hero → confirm RESTORED status and board state.
5. New Game → Remote Multiplayer → enter a new room code → Begin Adventure; connect the second player through Join Game.
6. Save and load once more after multiplayer synchronization to verify the locked 2.9.0 systems remain intact.
