# Ascendance 3.25.10 — Begin Adventure Hotfix

Hotfix for the 3.25.9 regression where Begin Adventure could fail/hang.

- Auto-round checks do not run while the game lobby is open.
- Auto-round can resolve only once per round, preventing startup/sync loops.
- Removed the forced startup render from the 3.25.9 patch.
- Preserves the 3.25.9 Q001/Vaelis fixes.


Full multiplayer package rebuilt from 3.25.9; server.js, package.json, public/, and deployment/server files preserved.
