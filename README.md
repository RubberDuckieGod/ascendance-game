# Ascendance 3.27.27 — Account-Owned Custom Heroes

Built from 3.27.26 and preserves the Main Menu leave/host-migration fix plus custom Hero availability in New/Join/Load.

## Fixes
- Custom Heroes are private to the signed-in account that created them.
- Switching accounts clears the prior account's browser-side custom-Hero cache before showing menus.
- Account character data from `/api/account/characters` is authoritative; an empty account can no longer inherit/upload another login's local character cache.
- New Game, Join Game, Load Game, and Create Character refresh the current account's Hero list.
- Server validates every `CH###` multiplayer selection against the authenticated account and rejects custom Heroes not owned by that login.
- Server ignores browser-supplied custom Hero definitions and uses the owner's saved account definition.

DEBUG remains enabled.
