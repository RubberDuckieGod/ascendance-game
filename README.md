# Ascendance 3.0.9 — Collapsible Adventure Log

Built directly from confirmed-working 3.0.8.

## Changes
- Adventure Log is docked in the unused right-side desktop space.
- Log has its own vertical scrolling.
- Collapse button reduces it to a small Adventure Log control.
- Expanding restores the full log.
- New log entries automatically scroll the log to the latest entry while open.
- On narrower screens the log returns to normal page flow.
- Cleaned the stale gameplay title so it displays ASCENDANCE instead of the old 3.0.4 Delete Game Fix label.

## Preserved
No New Game, Join Game, Load Game, Manage Games, Save Game, persistence, reconnect, WebSocket synchronization, map, cards, combat, enemy AI, search, explore, or turn logic was changed.

## Test
1. New Game.
2. Join a saved server game and confirm RESTORED.
3. Confirm Adventure Log appears on the right on a wide desktop.
4. Collapse and reopen it.
5. Perform an action and confirm the newest log entry is visible.
