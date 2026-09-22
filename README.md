# Ascendance 3.0.11 — Remote Hero Ownership UI

Built directly from working 3.0.10.

## Remote multiplayer presentation
- The Hero selected when connecting/loading a server game is the player's Hero.
- Control Aldric / Control Lyra switching buttons are hidden while connected in Remote mode.
- Only the connected player's Hero hand/deck panel is displayed.
- The other Hero's hand is hidden.
- The Party panel remains visible, preserving public Hero information such as HP, Armor, Attack, Actions, and statuses.
- The player's selected Hero is marked YOU in the Party panel.
- Solo/local presentation remains unchanged.

## Important
This is an incremental UI/privacy pass. It does not redesign the existing multiplayer state protocol. Existing action-ownership guards remain the gameplay enforcement layer.

## Test
Open two browsers:
1. Load/join the same server game as Aldric in one and Lyra in the other.
2. Aldric should see Aldric's hand but not Lyra's hand.
3. Lyra should see Lyra's hand but not Aldric's hand.
4. Both should still see both Heroes' public Party stats.
5. Neither remote player should see Control Aldric / Control Lyra buttons.
