# Ascendance 3.27.56 — Unified H001–H010 Hero Roster

This build removes the user-created Hero / Character Creator system and its legacy multiplayer/runtime compatibility layers.

Playable roster only:
- H001 Sir Aldric Ironwall
- H002 Lyra Nightshade
- H003 Sister Elara Dawnbringer
- H004 Archmage Vaelis
- H005 Rowan Greenward
- H006 Seraphine Oathkeeper
- H007 Thorne Wildroot
- H008 Cassian Vale
- H009 Kael Windstep
- H010 Mira Gearwright

All ten are treated as the authored Hero roster. No CH### identities, creator storage, creator selectors, creator sync payloads, or creator-specific compatibility patches remain in the browser build.

Validation includes JavaScript syntax checks, exact root/public HTML match, browser runtime checks, Basic Attack DOM regression, Pass action lock regression, and 203 authored H001–H010 card objects surviving the production dispatcher.
