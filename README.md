Ascendance 3.26.29 — Unified Custom Hero Runtime Initialization

Custom Heroes now use one final runtime initialization contract for new games and multiplayer joins:
- campaign/party membership
- runtime state
- Stonebrook starting position for a genuinely new participant
- saved starting equipment
- inventory + Common Healing Potion
- saved Character Creator Hero deck
- shuffled 5-card opening hand
- XP/level/kill state

Existing live position/deck state is preserved during render and multiplayer state application.

Test: join an existing Rowan Q001 campaign with a newly created custom Hero. The custom Hero should appear at Stonebrook with 5 cards in hand and 25 in the draw pile for a 30-card saved deck.
