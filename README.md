# Ascendance 3.36.7

Current stabilized baseline: **3.36.7 — iPhone Cards + Adventure Log UX**, built on the 3.36.6 Hero Ability Trigger Feedback and 3.36.5 full-parity/persistence/PWA baseline.

The mobile Cards and Log workflows are now dedicated full-screen iPhone views. Cards presents one readable card at a time with full rules and legal Play behavior instead of an endless horizontal hand. The Adventure Log is no longer scrolled into the Hero drawer; it opens above all mobile chrome and updates live while visible.

No gameplay rules or server authority behavior changed in 3.36.7. Custom Hero Creator remains intentionally absent.

See `DEPLOY_3.36.7.txt` for deployment instructions and `README_3.36.7.txt` for the validation summary.

## 3.36.8 — iPhone Explore Placement UX
Restores the pending Explore Location placement workflow to iPhone as a dedicated full-screen screen. Hero Cards remains separate. Pending Explore placement automatically opens, may be temporarily closed to inspect the map, and remains reachable through a persistent Place Explore Tile button. Also prevents the install hint from covering the mobile Action bar.
