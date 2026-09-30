# Ascendance 3.27.31 — Custom Hero Join Memory Fix

Built from 3.27.30.

## Fix
- Fixes the browser out-of-memory/freeze when a custom Hero joins or Begin Adventure is clicked.
- 3.27.30's selector-isolation MutationObserver could react to its own remove/re-add operations forever.
- The observer now compares the current custom-Hero option IDs against the authenticated account snapshot and only repairs a selector when it is actually wrong.
- Preserves authoritative account-only custom Hero selectors and 3.27.29 account-owned campaign saves.

DEBUG remains enabled.
