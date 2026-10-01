# Ascendance 3.27.36 — Custom Hero Out-of-Memory Fix

Built from 3.27.35.

## Fix
- Fixed the custom-Hero lobby out-of-memory crash.
- The legacy 3.27.5 diagnostic wrapper was recording a SERIALIZE_BOUNDARY event every 100 ms whenever CH001 was in the party, even when nothing changed.
- Render/serializer/ensure tracing now records only actual party mutations.
- All debug-event writes, including old direct `.push()` instrumentation, are globally capped at 300 events.
- Preserves 3.27.35 persistent authentication and account-owned custom Hero behavior.

DEBUG remains enabled, but bounded.
