ASCENDANCE 3.36.10 — COMPLETE IPHONE GAMEPLAY PARITY

Purpose:
Hunt down remaining gameplay/management surfaces that could still be stranded behind desktop rails or covered by mobile UI.

ADDED
- Full-screen mobile Quest / Objectives view.
- Full-screen mobile Game Menu with Quest, Inventory, Merchant, Crafting, Downtime, World Map, Campaign Hub, World Event / Quests, Campaign Saves, Hero Profile, and Main Menu.
- Persistent Quest Update button for post-Quest / Downtime transitions.
- Full-screen Reaction presentation using the original authoritative reaction controls.
- Live Enemy panel portal to the mobile viewport.

FIXED
- Campaign/save nested .actions rows no longer inherit the fixed combat Action-bar layout.
- Campaign Hub / Saves / Quest Board / Hero Profile / Journal mobile viewport handling.
- World Map uses the real #worldMapOverlay3342 selector, including dock suppression while open.
- Management/reaction/enemy overlays suppress dock/map/debug/install chrome while active.

PRESERVED
- 3.36.7 Cards + Log UX.
- 3.36.8 Explore placement UX.
- 3.36.9 Search + Encounter UX.
- All 3.36.5+ persistence/server authority behavior.
- Custom Hero Creator remains absent by design.

TESTS
- 438/438 core simulation PASS.
- tests/mobile-parity-33610.py PASS.
- Cards/Log PASS.
- Explore PASS.
- Search/Encounter PASS.
- Hero runtime parity PASS.
- Room authority PASS.
- Resource/phase authority PASS.
- Reputation authority PASS.
- Encounter/post-Quest PASS.
- Rowan Armor Piercer PASS.
