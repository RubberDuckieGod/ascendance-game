# Ascendance 3.30.6

Room-authoritative multiplayer build with persistent Search resolution and First Visit Encounter prompts.

The 3.30.6 fix prevents legacy UI handlers from bypassing the room exploration ledger, keeps completed Search counts authoritative through reconnects, blocks round progression while any room-owned Explore/Search/Encounter prompt is unresolved, and commits Encounter-spawned enemies before consuming First Visit.

See `README_3.30.6.txt` for details.
