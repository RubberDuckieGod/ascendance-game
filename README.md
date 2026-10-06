# Ascendance 3.29.19 — Ranged Connection Targeting + Warpath Choice

- Fixes generic Hero-card range parsing so `Within 2 Connections`, `Within 3 Connections`, etc. use actual graph distance instead of collapsing to Range 0. This directly fixes Mordren's Grave Bolt (H014-001).
- Garruk's Warpath (H012-015) now always presents a destination choice before moving and allows Cancel to keep the card unspent.
- Warpath retains its +1 Attack bonus when Garruk enters a Location containing an Enemy.
- Preserves all fixes from 3.29.18: authoritative multiplayer start, Aldric Iron Shield, Sweeping Cleave two-target behavior, Pass/Hold objective lockout, and Woodland Clearing explorer-only healing.
- Regression tests: 438/438 passed. Targeted static checks: 5/5 passed. Live browser tests for Grave Bolt range-2 targeting and Warpath destination choice both passed.
