# Ascendance 3.25.19 — Locked Baseline Consolidation

Full multiplayer project. This build treats every previously shipped fix as baseline behavior rather than an optional patch.

## Consolidated in this build
- All ten Heroes H001-H010 remain first-class party/multiplayer Heroes.
- A genuinely new late-joining Hero receives exactly five opening Hero cards once; reconnecting Heroes retain their existing hand.
- Hero-caused enemy defeats use idempotent per-Hero kill attribution across legacy basic attacks, expanded-Hero attacks, card attacks, direct damage, granted attacks, and counters.
- Preserves 3.25.18 failed-Quest five-card reset and Adventure Log preservation.
- Preserves the Q001, Vaelis, Rally, Healing Potion, auto-round, targeting, and ten-Hero fixes from prior builds.

Run with `npm install` then `npm start`.
