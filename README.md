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


## 3.27.28 — Account Selector Isolation
Fixes stale custom-Hero options surviving an account switch. All CH### options are purged immediately before account characters are fetched, then only the authenticated account's returned characters are inserted. If the account request fails or there is no authenticated session, no custom Hero options are shown. Server ownership validation remains enabled.

## 3.27.29 — Account-Owned Campaign Saves
- Server campaign saves are now owned by the authenticated account that creates the multiplayer campaign.
- Load Game and Manage Games only list campaigns owned by the currently signed-in account.
- Delete is authenticated and owner-only.
- Room codes remain shareable invite keys: other accounts can still Join Game by code without seeing the campaign in their own Load Game list.
- Campaign ownership is server-controlled and preserved across state commits.
- Existing unowned legacy room files are not exposed in account Load Game lists; starting a new campaign creates an owned save.
- DEBUG remains enabled.
