Ascendance 3.36.7 — iPhone Cards + Adventure Log UX

Built directly on 3.36.6 Hero Ability Trigger Feedback.

3.36.7 changes:
- Replaces the old iPhone Cards horizontal drawer with a dedicated full-screen card reader.
- Shows one Hero card at a time with full rules text, cost, speed/category/target metadata, card selector, Previous/Next, swipe navigation, and a Play button that uses the original legal card-play path.
- Reaction cards remain trigger-based and are labeled accordingly rather than pretending they are directly playable.
- Replaces the mobile Log drawer/scroll-to-panel behavior with a true full-screen Adventure Log overlay.
- Log stays above the dock, Actions, map controls, debug button, and other mobile chrome, and updates live while open.
- Portrait and landscape mobile views are constrained to the viewport with no horizontal page overflow.
- PWA cache remains on sw-3365.js but is bumped to ascendance-3.36.7 and pre-caches the new mobile files for clean iPhone updates.
- No gameplay rules were changed.
- No server.js change from 3.36.6.

Validation:
- Core simulation: 438 / 438 passed.
- Hero runtime parity regression: PASS.
- Existing mobile polish regression: PASS.
- Dedicated iPhone Cards/Log browser regression: PASS in portrait and landscape.
- Cards: full rules readable, one card at a time, no horizontal page overflow.
- Log: full-screen, z-index 22000, dock/actions hidden, live log updates confirmed.
- Room authority: PASS.
- Rowan Armor Piercer regression: PASS.

See DEPLOY_3.36.7.txt for deployment instructions.
