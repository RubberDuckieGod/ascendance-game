# Fix downtime rewards, Snare entry effects and multiplayer persistence

Work could consume a Hero’s Downtime choice while its 25 Gold was rolled back by combat-turn validation. Snare also missed encounter/quest spawns and could lack a visible map marker. This change commits downtime choices and recipe costs through server transactions, applies one shared Snare entry rule, and renders/removes an accessible trap graphic in solo and multiplayer.

The related interaction review also repairs canonical quest payouts, missing Q010/Q012 reward branches, inactive-Hero cooldown data rejecting purchases, consumable costs around lethal quest completion, stale snapshots erasing kill credit, and lost active-adventure state after a server restart. Durable receipts prevent repeated payouts; malformed, stale, forged and wrong-owner requests are tested. Unavailable equipment is recorded and displayed as owed, rather than silently counted as awarded.

Validation results and expected-versus-actual evidence are in audit/VALIDATION.md, audit/DOWNTIME_SNARE_33622.md, audit/REPORT.md and audit/execution.json. The workflow runs the new rule tests and browser scenarios and uploads evidence. The strict coverage gate intentionally remains failing for incomplete effect certification; passing scenarios do not certify every card, item, ability or campaign branch.

All functional tests used isolated localhost servers, browser contexts and temporary saves. Production Render health was read without accessing players or changing deployment; it still serves the prior build. No merge, deployment or player-save repair is included. Legacy Completed saves without receipts are not automatically paid again because their prior payout cannot be inferred safely.

Validation: **117 Node checks passed; 208 browser scenarios passed, zero failures/skips/flaky cases; native Snare/Captain completion repeated 3/3 successfully.** The strict coverage gate correctly exits 1 for 657 records without full effect certification. Local Node 24.19.0, Playwright 1.64.1, Chromium 154.0.8037.57. Hosted results are separate.
