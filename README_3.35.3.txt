ASCENDANCE 3.35.3 — ROWAN ARMOR PIERCER CRASH FIX

- Fixes ReferenceError: hname is not defined in the 3.27.9 action-cost / Armor Piercer wrapper.
- The failure occurred after Armor Piercer had already resolved combat, killed the target, spent Actions, and discarded the card, causing a browser error while writing the completion log.
- The wrapper now uses its own locally scoped hero-name helper and no longer depends on hname() from a different IIFE/script scope.
- Also fixes the same undefined-name path in the insufficient-Actions message for expanded Hero Action cards.
- No card balance or Armor Piercer rules changed.
- Preserves 3.35.2 Encounter status resolution, post-Quest rules, First Visit fixes, Campaigns V/VI, Reputation, and Merchant search/filters.
