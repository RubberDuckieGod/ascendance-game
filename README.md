# Ascendance 3.3.5 — Explore Draw Left

Built directly from 3.3.4.

- The existing RANDOM LOCATION DRAW / Explore placement panel is moved from the right sidebar to the left side of the Quest Map.
- It appears directly below the controlled Hero Deck.
- The same `locDraw` DOM node and all existing placement buttons/handlers are preserved; only its runtime parent changes.
- World Event remains below Connection/status and above the gameplay row.
- Inventory remains inside the Hero block.
- Adventure Log remains far right.

No Explore draw logic, placement legality, rotation logic, map logic, multiplayer, save/load, crafting, inventory, combat, Search, or campaign resolution logic was rewritten.
