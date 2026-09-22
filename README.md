# Ascendance 3.0.13 — Remote Hero Ownership

Rebuilt from the clean working 3.0.10 baseline.

Remote multiplayer now separates the browser's controlled Hero from the shared saved activeHero field. Aldric's browser controls Aldric and Lyra's browser controls Lyra without either browser changing a shared Hero-selection value.

Remote mode:
- no Control Aldric / Control Lyra switching;
- only your Hero Deck/hand is visible;
- both Heroes' public HP, Armor, Attack, Actions, and statuses remain visible;
- your Hero is marked YOU;
- generic Explore / Attack / Search actions resolve against your selected Hero;
- New Game, Join Game, and Load Server Game use the same ownership rule.

The 3.0.10 save picker, persistence, reconnect, Manage Games/delete, Adventure Log, map, and server architecture remain intact.

Critical test: open the same NEW remote room in two browsers, one Aldric and one Lyra. Each player should be able to act without switching Heroes. Then repeat with a loaded server game.
