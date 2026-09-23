# Ascendance 3.6.0 — Location Rules & Reveal Effects

Built from user-confirmed 3.5.2 (the unconfirmed Equipment Range branch was intentionally not used).

Q003 Location Special Rules / Reveal Effects are embedded from the accessible current Ascendance workbook data for:
L001, L002, L003, L005, L009, L017, L036, L043.

Timing:
Explore -> legal placement -> Reveal Effect immediately. The Hero remains at the origin. First Visit remains a later entry trigger.

Implemented reveal hooks:
- L001 Fresh Tracks: connected Enemy -1 Movement through current round.
- L003 Quiet Respite: adjacent Heroes may recover 1 Health.
- L009 Loose Stones: revealing Hero chooses 1 Damage or movement ends for turn.
- L017 Commanding View: inspect one unrevealed Quest-pool Location without revealing/removing it.
- L036 Hunter's Supplies: source-matched Loot draw.
- L043 Blanketing Fog: +1 Armor until start of next turn.
- L002 Concealing Brush is retained/logged exactly, but Hide is not substituted with an invented mechanic because the prototype does not yet have a complete Hide action/state.
- L005 Forgotten Remains records the free-Search grant without charging an Action; remote-location Search execution is deliberately not faked.

The Current Location panel now displays exact Special Rules, Reveal Effect, and Ongoing Effect text.
Fresh Tracks integrates with Enemy Movement. Blanketing Fog integrates with Hero Armor.

Special Rules that depend on systems not yet implemented (Cover, ranged Attack Value, Push/Knockback per-round prevention, Heavy attack trigger, Hide) are preserved/displayed as exact rules text rather than silently approximated.

No multiplayer, save/load, persistence, Encounter Severity, merchant/trading, Search core, First Visit core, Campaign, Crafting, or layout system was rewritten.
