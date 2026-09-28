Ascendance 3.27.12 — Final Session Diagnostic

Changes from 3.27.11:
- Server immediately broadcasts the new canonical room revision/state to already-connected players when a custom Hero joins. Existing players should no longer need to reconnect to see the joining Hero.
- DEBUG history persists in localStorage across reload/reconnect (up to 1500 events).
- DEBUG report role/custom snapshot corrected and now includes phase + round.
- Explicit phase-transition, endTurn entry/exit/error, enemy-attack, and join state receive/apply traces.
- Retains 3.27.10 card audit and all 3.27.11 gameplay code.

Test this build for one session, then DEBUG > Copy Report and upload it to ChatGPT.
