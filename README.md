# Ascendance 3.25.11 — Begin Adventure Fix

Full multiplayer project built from 3.25.10/3.25.9 lineage. Fixes the Begin Adventure crash caused by removing the legacy End Turn DOM element while core render code still referenced it. The control remains hidden, automatic round advancement remains enabled, and server/package/public files are preserved.
