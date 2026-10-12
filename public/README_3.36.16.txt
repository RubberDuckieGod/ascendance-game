Ascendance 3.36.16 — Sound Foundation

Adds procedural Web Audio sound effects and optional ambience to the 3.36.15 website baseline.

Highlights:
- UI click, card, attack, enemy attack, damage, heal, Explore, Reveal, Search, reward, status, warning, phase, defeat, victory, and failure cues.
- Sound settings panel with Master/SFX/Ambience levels, mute, UI clicks, ambience toggle, reset, and test sequence.
- Mobile/browser audio unlock on first user gesture.
- No external audio assets required.
- Device-local settings only; no multiplayer/game-state mutation.

Validation:
- Core simulator 438/438 PASS.
- Audio Chromium regression PASS, 0 page errors.
- 3.36.15 Reveal Runtime regression preserved under 3.36.16 PASS.
