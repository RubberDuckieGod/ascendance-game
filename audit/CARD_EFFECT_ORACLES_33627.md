# Additional Hero-card effect oracles

`tests/audit/card-effect-oracles-33627.spec.cjs` adds **25 actual-effect scenarios across 22 unique Hero cards** beyond the existing nine simple-Attack rows. The fixture invokes production `playExtraCard` and, for temporary modifiers, the real `attack()` Basic Attack path. It does not count dispatch, logging, successful return or absence of an exception as an effect pass.

Every scenario checks the production cost against the independent printed catalog, exact Action spending, the played card UID leaving hand and entering discard once, and no uncaught browser error. Card-zone scenarios use distinct known UIDs and verify actual hand/deck/discard contents. Healing and cleansing scenarios measure Health/Conditions on the selected recipient and exclude adjacent/unselected Heroes. Buff scenarios consume the effect with three real Basic Attacks, including an unrelated target for target-specific bonuses, rather than checking stored flags.

At the preserved checkpoint, browser results were **25/25 passing** in the complete 37-scenario follow-up, which finished in 45.9 seconds with no failures, skips or flaky results. The other twelve cases measure Hero passives. [Preserved validation](card-effect-oracle-validation-33627.json) records exact actual outcomes, source hashes and the separate baseline/corrected attempts. These named passes do not certify complete cards.

The first fixture attempt used fake card IDs, which the production deck audit correctly replaced, and Round 1, which replenishes opening hands. Those fixture exceptions were not card defects. The corrected fixture uses valid owner card IDs, distinct UIDs and Round 2. Its pre-correction 35-case run passed 29 and failed six: four passive consumers plus Song of Rest/Rallying Chorus receiving unearned Cassian progression draws. Two added Cassian upgrade scenarios separately failed before the runtime correction; the final complete 37-case run passed after it.

| Card IDs | Actual assertions | Cases |
|---|---|---:|
| H009-009, H010-014 | Draw exactly two known cards, discard the chosen existing UID, pay/discard played card once | 2 |
| H011-019 | Both optional self-damage branches: normal two draws or three with exactly one Health lost | 2 |
| H012-012, H013-012 | Exact self-damage, two/three draws and one selected discard | 2 |
| H013-016 | Afflicted-enemy branch keeps all drawn cards; ordinary branch discards exactly one | 2 |
| H007-014 | Chosen co-located ally alone draws two known UIDs; adjacent Hero excluded | 1 |
| H008-012, H008-013 | Every living co-located Hero recovers one Health / draws one card; adjacent Hero excluded | 2 |
| H008-011 | Recover only the chosen ally's Support UID; leave Attack discard untouched | 1 |
| H016-010, H007-012 | Selected ally recovers exactly two/one Health; Nature's Blessing also removes its eligible Burning without removing Inspired | 2 |
| H016-012, H012-016 | Eligible harmful status removed; beneficial/unlisted statuses retained | 2 |
| H012-016 | With no printed removable status, preserve card, Health and Actions | 1 |
| H010-013, H009-011, H011-011 | Chosen Hero/self next actual Basic Attack gains exactly +2; later attacks receive no bonus | 3 |
| H011-015 | Next actual Basic Attack gains exactly +3; one self-damage after that attack; no repeated bonus or self-damage | 1 |
| H011-016, H012-017, H013-018, H015-015 | Actual Attack bonus only against selected Enemy, preserved through an unrelated attack and consumed once; printed Marked/heal clauses measured where applicable | 4 |

The attack tests compare the exact printed modifier against the pre-card neutral Basic Attack value. They test modifier application and consumption; the independent baseline Hero-stat correctness remains a separate contract. These are solo mechanic scenarios. Range rejection, every timing/expiry boundary, cancellation branches and authoritative connected behavior are separately unverified unless another individually named scenario measures them.

Failures attach `card-effect-oracle-runtime` even when an assertion fails. Successful measurements additionally attach `card-effect-oracle`, containing the verbatim independent printed row and actual outcomes. Source references and generated inventory coverage remain separate from execution outcomes.

The companion [passive-consumer matrix](HERO_PASSIVE_CONSUMERS_33627.md) adds twelve progression scenarios, each immediately below and at its unlock XP, plus three explicit Elara Level 1/2/3 cases. A later focused browser run passed all fifteen passive cases. These tests cover ability activation rather than only XP-to-Level calculation; the final full-suite result remains separate in [REPORT.md](REPORT.md).
