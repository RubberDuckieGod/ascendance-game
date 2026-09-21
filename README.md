# Ascendance 2.8.1 — Persistent Multiplayer

This build keeps the proven 2.8.0 remote multiplayer gameplay and adds persistent room snapshots.

## Render setup
Your web service must be on a paid compute plan to attach a persistent disk.

1. In Render, open the `ascendance-game` web service.
2. Add a Persistent Disk.
3. Mount path: `/var/data`
4. Use the smallest disk size Render permits.
5. Deploy this 2.8.1 code.
6. Open `/health` on the deployed site. It should report `"persistence": true`.

Room snapshots are stored under `/var/data/ascendance`.

## Recovery behavior
Whenever the server receives a synchronized `STATE`, it atomically writes the latest room snapshot to disk.
After a restart/redeploy, the first player reconnecting to the same room code receives that saved snapshot.

## Important
Anyone who knows a room code can currently join that room. Private-hand filtering and room passwords/authentication are separate future milestones.
