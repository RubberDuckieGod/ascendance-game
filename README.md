# Ascendance 3.0.6 — Gameplay UI Safe

3.0.5 changed too much of the gameplay DOM and interfered with starting/joining games.

This build is rebuilt directly from the confirmed-working 3.0.4 package.

## Changes
- Hides the giant development changelog from the player gameplay screen.
- Replaces the technical Q003 test-pool paragraph with a player-facing objective.

## Not changed
The 3.0.4 lobby HTML, New Game flow, Join Game flow, Load Game flow, Manage Games flow, multiplayer controls, WebSocket code, save/load code, persistence, reconnect logic, map/gameplay DOM, and render logic are preserved.

This is intentionally a smaller UI step so we can verify the player can start and join games before making further layout changes.
