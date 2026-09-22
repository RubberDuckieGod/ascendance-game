# Ascendance 3.0.14 — UI Syntax Fix

3.0.13 contained a JavaScript parse error in the edited `switchHero()` function. That prevented the browser from initializing the page scripts, which is why New Game, Load Game, Manage Games, and the other lobby buttons did nothing.

3.0.14 repairs that parse error while preserving the intended 3.0.13 remote Hero ownership changes.

No gameplay-rule changes are included in this emergency repair. The separate Search-while-Engaged and First Visit fixes are still pending so we can verify the lobby/ownership build first.
