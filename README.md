# Ascendance 3.25.36 — Campaign Instances

Full multiplayer project.

## 3.25.36
- Every **New Game** creates a unique campaign instance ID.
- New Game includes an optional **Campaign Name**.
- The same Hero can now be used in multiple campaigns without sharing or overwriting progression.
- Campaign identity is stored inside the authoritative game state and persisted by the multiplayer server.
- **Restart** preserves the current campaign identity rather than creating a new campaign.
- **Away / Returning Hero** state remains scoped to that campaign instance.
- Party UI displays the campaign name and ID for verification.
- Existing saves without an ID are migrated when loaded; their existing progression is retained.

## Preserved baseline
Includes 3.25.34 Away/Returning Heroes, 3.25.33 host player management, 3.25.32 Elara/Rowan Q001 fixes, 3.25.31 left-rail encounter UI, and the confirmed 3.25.30 authoritative roster / phantom-Aldric fix.
