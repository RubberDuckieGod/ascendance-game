Ascendance 3.27.23 — Active Adventure Rejoin

Built on the confirmed 3.27.21 lobby/join baseline and 3.27.22 disconnect reliability work.

Fix:
- A Hero rejoining a room after the adventure has already started now resumes gameplay directly.
- Rejoining players do not Ready-up again and do not need the host-only Start Adventure button.
- The server persists an adventure-started marker with the room state, so active-room status survives normal room-state persistence.
- Existing authoritative Hero state is restored before ADVENTURE_RESUME is sent.
- Initial party-lobby flow for a brand-new game is unchanged.
