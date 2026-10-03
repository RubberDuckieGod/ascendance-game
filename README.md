Ascendance 3.27.61 — Campaign-wide Scenario Instance Player Scaling

- Player-count scaling is now scoped to a fresh scenario instance.
- The party roster is re-locked at every Quest start/restart and World Event boundary.
- Q001, Q002, Q003, and generic Q004-Q011 opening enemy setups consume scaling once.
- Later reinforcements/objective waves, synchronization, loading, and enemy defeats do not re-run opening scaling.
- Added a reusable opening-scaling hook for future Quest/World Event content.
- Preserves 3.27.60 Scout Ahead and Arrow Storm fixes.
