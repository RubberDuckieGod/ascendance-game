Ascendance 3.27.20 — Party Lobby Visibility Fix

Fixes the diagnosed New Game -> Party Lobby display failure. The legacy gameLobby overlay uses z-index 20000 while the new Party Lobby used z-index 10050, so the Party Lobby existed and synchronized but was rendered behind the visible menu. The Party Lobby now renders at z-index 30000 and hides the menu overlay once the server lobby arrives. Debug logging remains enabled.
