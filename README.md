# Ascendance 3.30.7

Room-authoritative exploration terminal-commit fix.

3.30.7 fixes the live Search duplication bug where clearing the last pending Search immediately rehydrated that same prompt from saved exploration metadata, allowing Search 1/1 to become 2/1 and duplicating returned Search cards. Pending exploration prompts now hydrate only once on room load and stay cleared after a legitimate terminal resolution.

See `README_3.30.7.txt` for details.
