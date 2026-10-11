Ascendance 3.29.22 — Authoritative Multiplayer Round Completion

Fixes the multiplayer stall where both Heroes reach 0 Actions / Pass but the host does not begin Enemy/World/End phases.

Changes:
- Re-check round completion on the authoritative host after every multiplayer STATE/ROOM_STATE/STATE_REJECTED message.
- Adds a 500ms authoritative watchdog so the room cannot depend on which browser spends the final Action.
- Recovers a stale auto-round lock if the game remains in Hero Phase with every living Hero finished.
- Clears impossible foreign pending Search UI on the host; remote Search choices are private per existing 3.28.1 behavior.
- Leaves genuine local Location/Search/Encounter resolution pending and records an explicit debug event instead of silently stalling.
- Adds ascendance32922() diagnostics.
