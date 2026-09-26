# Ascendance 3.25.21 — Consolidated Q001 Playtest Fixes

Full multiplayer project. Built on 3.25.20.

## Changes
- Unified Hero kill attribution across H001-H010 attack paths, including Aldric basic/card attacks and granted attacks.
- Coordinated Strike uses the selected allied Hero’s actual basic attack and optional enemy movement after damage.
- Teleport now offers to make a non-Arcane destination Arcane until the start of Vaelis’s next turn; Arcane destinations draw 1 card.
- Gravity Well now moves up to 2 enemies from connected Locations into the chosen Location, then attacks each moved enemy; +1 Attack when destination is Arcane.
- Arcane Ward is visibly annotated, counts as Arcane, triggers on the first enemy entry each round, and expires after 3 triggers.
- Leyline Convergence temporary Arcane state expires at the start of Vaelis’s next turn.
- Added Pass / Hold Actions: passing ends that Hero’s Hero-phase actions without spending remaining Actions, preserving them for Reactions. The round advances when every living Hero has passed or reached 0 Actions.
- Preserves 3.25.20 Q001 balance: 1 Raider + 1 Archer at scenario start.

Workbook source: Ascendance_v10.10(20260926-022046).xlsx.
