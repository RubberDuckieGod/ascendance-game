# Ascendance 3.28.3 — Quest Transaction + 16-Hero Multiplayer Canonical Join

- Terminal Quest resolution now increments a transaction epoch. Any in-flight `endTurn()` immediately aborts after a failure/completion/reset even when the game object is reset in place.
- Server canonical join now supports all authored H001-H016 Heroes, including runtime Hero state/opening hands for H003-H016.
- Retains the 3.28.2 roster/UI and prior game content.

# Ascendance 3.28.2 — Full H001–H016 Hero Roster

Adds H011 Malachar, H012 Garruk, H013 Veyra, H014 Mordren, H015 Lucien, and H016 Asha directly from Ascendance v10.35, including their Level-1 chassis, starting Equipment, and complete 30-card decks. Server/lobby/scenario roster validation now accepts all sixteen authored Heroes.

Ascendance 3.27.61 — Campaign-wide Scenario Instance Player Scaling

- Player-count scaling is now scoped to a fresh scenario instance.
- The party roster is re-locked at every Quest start/restart and World Event boundary.
- Q001, Q002, Q003, and generic Q004-Q011 opening enemy setups consume scaling once.
- Later reinforcements/objective waves, synchronization, loading, and enemy defeats do not re-run opening scaling.
- Added a reusable opening-scaling hook for future Quest/World Event content.
- Preserves 3.27.60 Scout Ahead and Arrow Storm fixes.


3.28.2: aborts stale Enemy/World/End phase execution immediately when Quest resolution replaces the scenario during failure/retry. Also corrects the final diagnostic build marker to 3.28.2.
