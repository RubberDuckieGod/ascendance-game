# Ascendance 3.1.0 — Campaign Days & World Events

Built from 3.0.18.

This build adds the campaign-layer foundation from Ascendance Design Bible v2.8 and Ascendance_v10.10(10).xlsx.

## Campaign Days
- Each World Event begins on Campaign Day 1.
- A Quest attempt consumes one Campaign Day whether Completed, Failed, or Retreated.
- Normal Travel does not advance the Campaign Day.
- The Quest resolves before the final-day limit is checked.
- Required Main Quest completion advances the World Event immediately.
- If the day limit is reached first, forced World Event progression resolves.
- A new World Event resets its own clock to Day 1.

Current limits:
- WE001 Goblin Raids: 5
- WE002 Goblin Warbands: 6
- WE003 Siege of Stonebrook: 6
- WE004 The Goblin King: no limit

## World Events
All four Goblin Campaign World Events and their three associated Quests are represented in campaign state.
The campaign panel shows the active event, day track, active effects, Quest statuses, and current Quest.

Because Q003 is still the only fully playable prototype Quest, this build includes explicit Complete / Fail / Retreat controls for the current Q003 attempt so Campaign Day and World Event progression can be tested without inventing unfinished Quest gameplay.

World Event resolution records the applicable reward/result/penalty in persistent campaign effects.

## Persistence
Campaign state lives inside `g`, so the existing 2.9 save/load and multiplayer STATE persistence automatically carry:
- active World Event
- Campaign Day
- Quest statuses
- current Quest
- campaign history
- persistent campaign effects
- campaign-ended state

No Loot or Crafting implementation is included yet.
