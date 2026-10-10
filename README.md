# Ascendance 3.30.3 — Room-Authoritative Hero State

This build extends the room-authoritative multiplayer migration to Hero Health, core Conditions, and Hero movement/position. Whole-game snapshots can no longer overwrite those fields. Hero changes are submitted as idempotent room commands; HP uses additive deltas, Conditions use add/remove deltas, and movement uses canonical coordinates. Quest/round resolution still owns Enemy/World phase Hero changes and commits them atomically.

3.30.2 quest-failure reset authority and 3.30.1 Enemy combat authority remain intact.

Ascendance 3.30.2 — room-authoritative quest failure reset fix.
