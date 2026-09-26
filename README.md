# Ascendance 3.25.12 — Opening Hand Fix

Full multiplayer project based on 3.25.11.

## Fix
- Every selected Hero begins a fresh game with a 5-card opening Hero hand.
- Expanded Heroes H003–H010, including Vaelis, are repaired on multiplayer join/restore when their opening state is pristine but their hand is missing.
- Does not refill a legitimately spent hand after cards have entered the discard pile.
- Preserves the 3.25.9 Q001/Vaelis fixes and 3.25.11 Begin Adventure fix.

## Full project
Includes server.js, package.json, root index.html, public/index.html, and README.md.
