# Ascendance 3.36.12 — Equipment, Consumable, Relic & Treasure Parity Audit

Baseline: **3.36.11 Hero Card Parity Audit**. This pass audits the workbook-authored Equipment and Loot systems against the executable digital game.

## Audit result

- **144 Equipment cards reviewed.** **137** now have a runtime path or are enforced by a shared/generic rule. **7** are intentionally blocked because their printed effect depends on a foundational rule the digital game does not currently define.
- **30 Consumables reviewed.** **28** are executable across the full Hero roster. **LT012 Traveler’s Rations** and **LT026 Lockpick Set** are preserved rather than consumed because the required Rest / Locked-or-simple-Trap interaction does not exist as a general action.
- **Relics and Legendary Treasures reviewed.** Existing LT136–LT149 / LT151–LT158 behavior was preserved and extended where needed. **LT150 Orb of Ages** and **LT159 Crystal of Creation** remain intentionally blocked pending authoritative extra-turn / crafting-substitution rules.
- Campaign reward sigils and future-content unlock treasures whose workbook text is explicitly a marker/unlock remain marker/unlock items; they are not treated as missing combat effects.

### Important interpretation

**Runtime-covered does not mean every rare board-state combination was manually played.** It means the printed effect has an executable consumer/hook (or a generic engine rule) and is no longer merely text in the database. The browser suite directly exercises high-risk shared paths; situational effects remain playtest targets.

## Major 3.36.12 repairs

- Full-roster Consumable ownership/targeting: item use no longer falls back to Aldric for expanded Heroes.
- Basic Attack now has a separate Equipment modifier channel, so Equipment bonuses/Armor ignore are applied and logged without being mislabeled as Hero-card bonuses.
- Legacy Aldric/Lyra/Seraphine damage is routed through the same shared damage-prevention pipeline used by expanded Heroes.
- Smoke Bomb, Torch/Lantern visibility, Guarded, healing riders, damage prevention, defeat prevention, movement limits, forced-movement immunity, enemy-entry reactions, status riders, and once-per-round/encounter state now use shared hooks.
- EQ121–EQ144 starting-equipment effects are wired into live attack/movement/damage/card-cost paths.
- **Worldsplitter (EQ020), Starfall Longbow (EQ051), and Starfall Staff (EQ120)** now receive visible **Use Ability** controls while equipped.
- **Twinfang Blades (EQ041)** and **Recurve Bow (EQ048)** now execute their printed free second attacks with the printed **−1 Damage** modifier.
- Knight’s Plate Protector, Band of Recovery, Goblinbreaker Mail, Steel Longsword Riposte, Spiked Shield, Shadowleather Fade Away, Iron Plate Heavy movement cap, Steel Spear Brace, and other late-audit gaps were connected to live event hooks.
- Crystal of Creation is deliberately **not** fake-wired: the game will not claim the material substitution succeeded while still consuming the wrong recipe materials.

## Foundational rule blockers

These are the Equipment cards that should **not** be called complete until their underlying game rule exists:

- **EQ013 — Woodcutter's Axe**: Needs a defined terrain/structure adjacency target model.
- **EQ025 — Skullcrusher**: Printed effect calls for a Stagger Save; the digital rules have no Stagger Save resolver.
- **EQ044 — Night's Whisper**: Printed effect needs Advantage plus an immediate extra full Hero turn; Hero attacks are deterministic and extra-turn semantics are not defined.
- **EQ055 — Repeating Crossbow**: Rapid Fire / Magazine / Reload needs an authoritative weapon-mode and reload action model; not safe to infer.
- **EQ068 — Worldheart Staff**: Harmony of Creation needs encounter-start stance selection plus a generic Ability cooldown/refresh system.
- **EQ103 — Lantern of True Paths**: True Paths rerolls Travel Encounter Severity, which is room/server-authoritative; no safe client-only reroll hook exists.
- **EQ116 — Arcane Channeling Staff**: Channel explicitly rerolls a Hero attack die; current Hero attacks do not roll an attack die.

Additional non-Equipment blockers:
- **LT012 — Traveler’s Rations:** requires a general Rest action.
- **LT026 — Lockpick Set:** requires a Locked/simple-Trap Interact/Search hook.
- **LT150 — Orb of Ages:** requires authoritative extra Hero-turn semantics.
- **LT159 — Crystal of Creation:** requires one authoritative crafting-material substitution path shared by eligibility and consumption.

## Equipment card-by-card coverage

| ID | Equipment | Status | Printed special rules |
|---|---|---|---|
| EQ001 | Rusted Shortsword | **WIRED** | Worn Edge — first attack each encounter gains +1 attack. |
| EQ002 | Iron Shortsword | **WIRED** | Quick Strike — once per turn after defeating an Enemy, move 1 space/Location-equivalent without reactions. |
| EQ003 | Iron Longsword | **WIRED** | Parry — once per round when hit by melee attack, reduce damage by 1. |
| EQ004 | Steel Longsword | **WIRED** | Riposte — once per round after successfully defending against melee attack, immediately make a free melee attack. |
| EQ005 | Knight's Longsword | **WIRED** | Defender of the Realm — while with at least one allied Hero, gain +1 armor. · Hold the Line — once per encounter, when allied Hero in your Location would suffer damage, you may become target instead. |
| EQ006 | Flaming Longsword | **WIRED** | Blazing Strike — once each turn when you deal damage, deal +1 Fire Damage. · Ignite — once per encounter, after an Attack with this weapon deals 4 or more Damage to an Enemy, that Enemy gains Burning. |
| EQ007 | Vampiric Longsword | **WIRED** | Life Drain — first time each turn you deal damage, recover 1 Health. · Blood Hunger — if target is defeated, gain +1 Attack until end of next turn. |
| EQ008 | Dragonsteel Longsword | **WIRED** | Dragon's Might — ignore 2 Armor when dealing damage. · Legendary Blade — once per encounter, when declaring an Attack with this weapon, declare Dragon Strike. That Attack gains +3 Attack and ignores all Armor. |
| EQ009 | Defender's Bastard Sword | **WIRED** | Versatile Grip — one-handed: +1 armor while shield equipped; two-handed: +1 Damage on melee attacks. |
| EQ010 | Duelist's Rapier | **WIRED** | Precise Strike — once per turn, when attacking the only Enemy in your Location, gain +1 Attack. · Riposte Master — once per Round after a melee Enemy Attack against you resolves, you may spend 1 Action to make a Basic Attack against that Enemy if it is a legal target. |
| EQ011 | Greatsword of the Vanguard | **WIRED** | Cleave — after defeating an Enemy in your Location, make one additional attack against another Enemy there. · Heavy Swing — cannot benefit from effects granting free Move Actions immediately before or after attacking. |
| EQ012 | Blade of Ascendance | **WIRED** | Hero's Resolve — once per encounter, if reduced to 0 Health, remain at 1 instead. · Ascendant Strike — once per encounter, when declaring an Attack with this weapon, that Attack ignores all Armor and Resistance. |
| EQ013 | Woodcutter's Axe | **BLOCKED — foundational rule** | Chopping Blow — when attacking an enemy adjacent to terrain/structure, deal +1 Damage. |
| EQ014 | Iron Hand Axe | **WIRED** | Cleaving Edge — if you defeat an enemy, next attack this turn gains +1 Attack. |
| EQ015 | Steel Battle Axe | **WIRED** | Sundering Blow — first time you damage an enemy each encounter, reduce its Armor by 1 for rest of encounter. |
| EQ016 | Berserker's Greataxe | **WIRED** | Reckless Assault — before attack, suffer 1 damage to deal +2 Damage. · Heavy Weapon — cannot equip Shield. |
| EQ017 | Executioner's Axe | **WIRED** | Execution — against enemy at 25% Health or less, deal +3 Damage. · Terrifying Presence — first enemy defeated each encounter causes adjacent enemies to become Shaken. |
| EQ018 | Stormcleaver | **WIRED** | Chain Lightning — once each turn after dealing damage, deal 1 Lightning Damage to different enemy in target's Location. · Thunder Crash — once per encounter after defeating enemy, nearby enemies become Staggered. |
| EQ019 | Bloodletter Axe | **WIRED** | Deep Wounds — whenever you deal damage, target gains 1 Bleed Token. · Blood Frenzy — when attacking Bleeding enemy, gain +1 Attack. |
| EQ020 | Worldsplitter | **WIRED — active UI** | Earthshatter — once per encounter, all enemies in your Location suffer 4 Physical Damage and become Knocked Down. · Titan's Strength — ignore Heavy penalty on two-handed weapons. |
| EQ021 | Iron Mace | **WIRED** | Crushing Blow — ignore 1 Armor when attacking armored enemies. |
| EQ022 | Steel Warhammer | **WIRED** | Concussive Strike — first enemy damaged each encounter becomes Staggered. |
| EQ023 | Maul of the Mountain | **WIRED** | Earthbreaker — after damaging enemy, may Push it 1 Location if legal. · Heavy Impact — if enemy cannot be pushed, it instead suffers +1 Damage. |
| EQ024 | Blessed Morningstar | **WIRED** | Holy Strike — Undead and Demons suffer +2 Damage. · Divine Resolve — once per encounter after defeating Undead/Demon, recover 2 Health. |
| EQ025 | Skullcrusher | **BLOCKED — foundational rule** | Stunning Blow — once each turn after damage, target makes Stagger Save; failure becomes Stunned until end of next activation. · Heavy Swing — cannot benefit from effects granting free Move Actions before attacking. |
| EQ026 | Hammer of Justice | **WIRED** | Judgment — against Armor 3+, ignore all Armor. · Protector's Oath — allied Heroes in your Location gain +1 armor while you are not Exhausted. |
| EQ027 | Titan's Maul | **WIRED** | Earthquake — once per encounter, all enemies in your Location and connected Locations suffer 3 Physical Damage and are Knocked Down. · Unstoppable — cannot be Pushed, Pulled, or Knocked Down while wielding. |
| EQ028 | Relic of the First Forge | **WIRED** | Forgefire — attacks deal +1 Fire Damage. · Master's Craft — at the start of an encounter choose +1 Attack, +1 armor, or Swift Craft. Swift Craft: once during each of your turns this encounter, perform 1 Move Action without spending an Action. |
| EQ029 | Iron Spear | **WIRED** | Long Reach — may attack enemies at your Location or a connected Location. |
| EQ030 | Steel Spear | **WIRED** | Brace — if an enemy moves into your Location from a connected Location, may immediately make a melee attack against it. |
| EQ031 | Pike of the Watch | **WIRED** | Phalanx — while with another Hero wielding Spear/Polearm, both gain +1 armor. · Brace — enemies moving into your reach provoke an Opportunity Attack. |
| EQ032 | Halberd of the Vanguard | **WIRED** | Sweeping Strike — once each turn after damaging enemy, deal 1 damage to another enemy in target's Location. · Hook — instead of damage, Pull target to your Location from connected Location if legal. |
| EQ033 | Dragon Lance | **WIRED** | Charge — if move 2+ Locations before attacking, deal +2 Damage. · Skewer — once per turn, if this attack defeats an Enemy, you may immediately perform 1 Move Action without spending an Action, if legally able to Move. |
| EQ034 | Trident of the Tides | **WIRED** | Tidal Pull — once each turn after damaging enemy, Push or Pull it 1 Location if legal. · Flowing armor — if no enemies in your Location at end of turn, gain +1 armor until next turn. |
| EQ035 | Glaive of the Eclipse | **WIRED** | Sweeping Arc — when attacking, may also deal 2 Damage to one other enemy in target's Location. · Zone of Control — an Enemy leaving your Location must spend 1 additional Movement. |
| EQ036 | Spear of the First King | **WIRED** | Rally — allied Heroes in your Location gain +1 Attack while you are not Exhausted. · King's Command — once per encounter after your turn, one allied Hero in your Location may Move to connected Location and make one basic attack. |
| EQ037 | Iron Dagger | **WIRED** | Quick Draw — during first round, first attack gains +2 attack. |
| EQ038 | Steel Dagger | **WIRED** | Backstab — if target shares Location with one of your allies, deal +2 Damage. |
| EQ039 | Assassin's Dirk | **WIRED** | Critical Precision — the first Attack you make each turn against an Enemy that has a Status gains +1 Attack. · Silent Killer — if you defeat an enemy, immediately move up to 2 connected Locations as allowed. |
| EQ040 | Venomfang | **WIRED** | Envenomed Blade — when you deal damage, target gains 1 Poison Token. · Toxic Wounds — Poisoned enemies suffer -1 armor. |
| EQ041 | Twinfang Blades | **WIRED** | Twin Strike — once each turn after successful attack, make second attack against same target; second deals -1 Damage. · Flurry — if both attacks hit, you may immediately perform 1 Move Action without spending an Action, if legally able to Move. |
| EQ042 | Shadowfang | **WIRED** | Fade Away — after dealing damage, move up to 2 connected Locations as allowed without reactions. · Strike from Darkness — if target has not activated this round, deal +2 Damage. |
| EQ043 | King's Mercy | **WIRED** | Royal Execution — against enemies below 50% Health, attacks ignore all Armor. · Precise Finish — if this weapon defeats enemy, refresh one Hero Ability on cooldown. |
| EQ044 | Night's Whisper | **BLOCKED — foundational rule** | Invisible Death — first attack each encounter automatically gains Advantage. · Death's Dance — once per encounter after defeating enemy, immediately take another full turn. |
| EQ045 | Hunting Bow | **WIRED** | Hunter's Eye — attacks against Beasts gain +1 Damage. |
| EQ046 | Longbow | **WIRED** | Deadly Aim — if you did not Move this turn, gain +1 Attack. |
| EQ047 | Elven Longbow | **WIRED** | Graceful Shot — after attacking, move to a connected Location if legal. · Eagle Eye — ignore Cover when making ranged attacks. |
| EQ048 | Recurve Bow | **WIRED** | Rapid Shot — once each turn, make second ranged attack against a different target; second deals -1 Damage. · Mobile Archer — may move before attacking normally. |
| EQ049 | Storm Bow | **WIRED** | Chain Shot — once each turn after damage, deal 1 Lightning Damage to another enemy in target's Location. · Static Charge — if same enemy is hit on consecutive turns, it becomes Staggered. |
| EQ050 | Phoenix Bow | **WIRED** | Flaming Arrow — attacks deal +1 Fire Damage. · Rebirth — once per encounter if reduced to 0 Health, remain at 1. |
| EQ051 | Starfall Longbow | **WIRED — active UI** | Falling Star — once per encounter, choose a Location within range; every enemy there suffers 4 Radiant Damage. · Celestial Aim — ignore all Cover and Line-of-Sight penalties. |
| EQ052 | Bow of the World Tree | **WIRED** | Living Arrow — start of turn choose Vine (Root target), Bloom (ally in target Location recovers 2 Health), or Thorn (+2 Damage). · Ancient Wisdom — +1 Range and +1 attack. |
| EQ053 | Light Crossbow | **WIRED** | Armor Piercer — ignore 1 Armor. |
| EQ054 | Heavy Crossbow | **WIRED** | Powerful Shot — ignore 2 Armor. · Reload — after attacking, cannot use again until spending 1 Action to reload. |
| EQ055 | Repeating Crossbow | **BLOCKED — foundational rule** | Rapid Fire — make two attacks against same or different targets; each deals -1 Damage. · Magazine — may use Rapid Fire for three attacks before reloading; reload costs 1 Action. |
| EQ056 | Sniper Crossbow | **WIRED** | Deadeye — if you did not Move this turn, gain +2 attack. · Heartseeker — once per turn, if you did not Move this turn, an Attack with this weapon ignores 2 Armor. |
| EQ057 | Explosive Crossbow | **WIRED** | Explosive Bolt — target one enemy; normal damage; all other enemies in that Location suffer 2 Fire Damage. · Reload — after Explosive Bolt, reload before firing again. |
| EQ058 | Arcane Ballista | **WIRED** | Arcane Bolt — ignore all Armor and Magical Barriers. · Arcane Recharge — after attacking becomes Exhausted; readies automatically at start of next turn. |
| EQ059 | Dragonkiller Crossbow | **WIRED** | Slayer Bolt — against Boss or Elite enemies, deal +3 Damage. · Crippling Shot — once per encounter, after an Attack with this weapon deals Damage, the target's Movement becomes 0 until the end of its next activation. |
| EQ060 | Heaven's Judgment | **WIRED** | Divine Bolt — attacks ignore all Cover and Armor. · Judgment — once per encounter, when declaring an Attack with this weapon, declare Judgment. After that Attack deals Damage, the target cannot use Reactions until the end of its next activation and suffers +3 Radiant Damage. |
| EQ061 | Apprentice's Staff | **WIRED** | Arcane Focus — the first Arcane Hero Deck card you play each encounter costs 1 fewer Action (minimum 0). |
| EQ062 | Staff of Embers | **WIRED** | Firebolt — basic attacks deal +1 Fire Damage. · Kindling Flame — enemies damaged by Fire abilities gain 1 Burn Token. |
| EQ063 | Staff of Frost | **WIRED** | Frostbolt — basic attacks reduce target Movement by 1 until end of next activation. · Ice Prison — once per encounter when damaging with Cold ability, Root target until end of next activation. |
| EQ064 | Stormcaller's Staff | **WIRED** | Chain Lightning — first time each turn you deal Lightning damage, another enemy in target's Location suffers 1 Lightning Damage. · Charged Focus — after Lightning ability, gain +1 attack on next attack/spell this round. |
| EQ065 | Staff of Renewal | **WIRED** | Healing Surge — whenever you restore Health to an ally, they recover +2 additional Health. · Blessed Aura — allied Heroes in your Location gain +1 Magic Resistance. |
| EQ066 | Staff of the Ancient Grove | **WIRED** | Grasping Vines — once each turn when damaging with Nature ability, may Root target. · Nature's Blessing — start of turn recover 1 Health if in natural terrain. |
| EQ067 | Archmage's Staff | **WIRED** | Arcane Mastery — the first Arcane Hero Deck card you play each round costs 1 fewer Action (minimum 0). · Spell Echo — once per encounter, after you resolve an Arcane Hero Deck card, you may play a different Arcane Hero Deck card from your hand with printed Action Cost 1 or less without spending an Action. |
| EQ068 | Worldheart Staff | **BLOCKED — foundational rule** | Harmony of Creation — start encounter choose Flame (+2 Fire Damage), Frost (Cold Slows), Storm (Lightning chains), or Life (+2 Healing). · Worldheart's Gift — once per encounter refresh one Ability on cooldown. |
| EQ069 | Apprentice's Wand | **WIRED** | Quick Cast — first spell each round gains +1 attack. |
| EQ070 | Wand of Sparks | **WIRED** | Arc Lightning — whenever you deal Lightning damage, one other enemy in target's Location suffers 1 Lightning Damage. |
| EQ071 | Wand of Illusions | **WIRED** | Mirror Image — once per encounter when targeted, force attacker to reroll attack. · Distracting Glamour — enemies damaged by Arcane abilities suffer -1 attack until end of next activation. |
| EQ072 | Wand of Shadows | **WIRED** | Shadow Step — after casting a spell, move to a connected Location without reactions. · Dark Hex — first enemy damaged each round suffers -1 armor until start of your next turn. |
| EQ073 | Wand of Curses | **WIRED** | Hex — first enemy damaged each round suffers one chosen effect until end of next activation: -2 Attack, -2 armor, or -2 Movement. · Lingering Curse — Bosses and Elites cannot ignore your debuffs. |
| EQ074 | Wand of Time | **WIRED** | Temporal Shift — once per encounter after any Hero finishes turn, choose: they immediately Move up to one connected Location, or make one basic Attack. · Accelerate — the first Arcane Hero Deck card you play each encounter costs 0 Actions. |
| EQ075 | Wand of the Phoenix | **WIRED** | Phoenix Flame — whenever Fire abilities deal damage, recover 1 Health. · Rebirth — once per campaign if defeated, discard this Equipment; recover to 50% Health, remove all negative Conditions, stand if Knocked Down. |
| EQ076 | Scepter of Ascendance | **WIRED** | Master of Magic — start encounter choose two Magic Schools; abilities from them gain +2 Damage or +2 Healing. · Arcane Conduit — once per round, after you resolve an Arcane Hero Deck card, you may play a different Arcane Hero Deck card from your hand with printed Action Cost 1 or less without spending an Action. Ascendant Will — immune to Silenced and Disarmed. |
| EQ077 | Wooden Buckler | **WIRED** | Quick Block — once per round reduce damage from one attack by 1. |
| EQ078 | Iron Shield | **WIRED** | Shield Wall — allied Heroes in your Location gain +1 armor against ranged attacks. |
| EQ079 | Tower Shield | **WIRED** | Fortress — cannot be Pushed or Knocked Down. · Cover — allied Heroes in your Location gain Cover against ranged attacks. Bulky — your first Move Action each turn costs 1 additional Action. |
| EQ080 | Spiked Shield | **WIRED** | Shield Bash — once each turn after blocking attack, deal 1 Physical Damage to attacker. · Brutal Counter — if attacker is in your Location, may Push it to a connected Location if legal. |
| EQ081 | Padded Gambeson | **WIRED** | Layered Padding — reduce the first Physical damage you suffer each round by 1. |
| EQ082 | Leather Jerkin | **WIRED** | Flexible Fit — this Armor never increases the Action cost of your Move Actions. |
| EQ083 | Studded Leather | **WIRED** | Reinforced — once per round when damage would be exactly 1, reduce it to 0. |
| EQ084 | Shadowleather Coat | **WIRED** | Fade Away — after you defeat an Enemy, gain Hidden until you attack or become Engaged. |
| EQ085 | Warden's Hide | **WIRED** | Trailwise — ignore the first Hazard damage you would suffer each encounter. · Beast-Touched — +1 damage against Beasts. |
| EQ086 | Chain Shirt | **WIRED** | Reliable Mail — no additional effect. |
| EQ087 | Scale Mail | **WIRED** | Overlapping Plates — once per round reduce damage from a ranged Attack by 1. |
| EQ088 | Goblinbreaker Mail | **WIRED** | Goblinbreaker — Goblin Attacks against you suffer -1 Attack. · Stand Firm — you cannot be Pushed by Common Goblins. |
| EQ089 | Blessed Chain | **WIRED** | Blessed Links — when you Rest, remove one additional harmful Condition. · Consecrated Guard — while in a Consecrated Location, gain +1 Armor. |
| EQ090 | Stormwoven Mail | **WIRED** | Grounded — reduce Lightning damage by 2. · Static Reprisal — first Enemy each round that damages you suffers 1 Lightning damage. |
| EQ091 | Iron Plate | **WIRED** | Heavy — you may perform no more than 2 Move Actions during your turn unless an effect specifically ignores Heavy Armor. |
| EQ092 | Knight's Plate | **WIRED** | Protector — once per round when another Hero in your Location suffers damage, reduce that damage by 1. · Heavy — you may perform no more than 2 Move Actions during your turn unless an effect specifically ignores Heavy Armor. |
| EQ093 | Fortress Plate | **WIRED** | Immovable — you cannot be Pushed or Pulled. · Fortress — while Engaged with 2 or more Enemies, gain +1 Armor. |
| EQ094 | Dragonhide Cuirass | **WIRED** | Dragonhide — reduce Fire damage by 2. · Ancient Scales — once per encounter, when you would be defeated, remain at 1 Health instead. |
| EQ095 | Robes of the Adept | **WIRED** | Focused Mind — the first Arcane Hero card you play each round may ignore one negative modifier affecting its damage or healing. |
| EQ096 | Runed Battlerobes | **WIRED** | Runic Ward — once per round reduce damage from a Magical or elemental source by 2. · Arcane Thread — while in an Arcane Location, gain +1 Armor. |
| EQ097 | Amulet of Vigor | **WIRED** | Vigor — increase Maximum Health by 2. |
| EQ098 | Traveler's Charm | **WIRED** | Sure Footing — once per Round, ignore the additional Move Action required to leave Difficult Terrain. |
| EQ099 | Band of Recovery | **WIRED** | Second Wind — when you Rest, recover +1 Health. |
| EQ100 | Scout's Compass | **WIRED** | Pathfinder — once per round after entering a Location, you may look at the top card of the Encounter Deck and leave it or place it on the bottom. |
| EQ101 | Goblin Fang Talisman | **WIRED** | Trophy Hunter — the first Goblin you defeat each encounter grants +5 Gold. |
| EQ102 | Ring of Guarding | **WIRED** | Guarding — gain +1 Armor while you have 5 or fewer Health. |
| EQ103 | Lantern of True Paths | **BLOCKED — foundational rule** | True Paths — once per Travel Encounter, after rolling Encounter Severity, reroll the die and keep either result. |
| EQ104 | Hunter's Quiver | **WIRED** | Deep Quiver — your ranged Weapon gains +1 Weapon Bonus on the first Attack you make each round. |
| EQ105 | Consecrated Rosary | **WIRED** | Prayer of Shelter — when you create or enter a Consecrated Location, recover 1 Health. Limit once per round. |
| EQ106 | Arcane Lens | **WIRED** | Arcane Focus — while in an Arcane Location, your damaging Hero cards gain +1 damage. |
| EQ107 | Belt of the Vanguard | **WIRED** | Vanguard — after you Move into a Location containing an Enemy, your first Attack there gains +2 Attack. |
| EQ108 | Cloak of Vanishing | **WIRED** | Vanish — once per encounter after you suffer damage, gain Hidden and may move to a connected revealed Location if not prevented by a Scenario rule. |
| EQ109 | Crown of Resolve | **WIRED** | Unbroken — you are immune to Weakened. · Rallying Presence — once per encounter, all Heroes in your Location recover 2 Health. |
| EQ110 | Relic of Ascendance | **WIRED** | Ascendant Ward — gain +1 Armor. · Ascendant Will — once per round after you play a Hero card costing 2 Actions, recover 1 Action. This cannot raise you above 3 Actions. |
| EQ111 | Militia Spear | **WIRED** | Brace — if an Enemy moves into your Location during its activation, your next Attack against it gains +1 Attack. |
| EQ112 | Goblin-Cleaver Falchion | **WIRED** | Goblin Cleaver — when your Attack damages a Goblin, deal +1 damage. |
| EQ113 | Watchtower Longbow | **WIRED** | High Ground — while in a Location with Watchtower, Ridge, Cliff, or Tower traits, gain +1 Weapon Bonus. |
| EQ114 | Warg-Hunter Crossbow | **WIRED** | Beast Bolt — your Attacks ignore 1 Armor against Beasts. · Slow Reload — after attacking twice in the same turn, you cannot make another Attack that turn. |
| EQ115 | Sunhammer | **WIRED** | Radiant Impact — the first time each round you damage an Enemy, remove Guarded from it if present. · Consecrated Blow — while in a Consecrated Location, deal +1 damage. |
| EQ116 | Arcane Channeling Staff | **BLOCKED — foundational rule** | Channel — when a damaging Hero card uses your Weapon Bonus, you may reroll the attack die once per round. · Arcane Location — while in an Arcane Location, the reroll gains +1 Attack. |
| EQ117 | Captain's Warblade | **WIRED** | Commanding Strike — after you defeat an Enemy, one allied Hero in your Location may move to a connected revealed Location. · Hold Formation — while another Hero is in your Location, gain +1 Armor. |
| EQ118 | Nightglass Daggers | **WIRED** | Opening Cut — if you began the turn Hidden, your first Attack gains +3 Attack. · Fade — after defeating an isolated Enemy, gain Hidden. |
| EQ119 | Ashen Wardblade | **WIRED** | Cinder Edge — ignore 1 Armor. · Last Ember — once per encounter, after rolling a 1 on an Attack die, treat the die as a 6 instead. |
| EQ120 | Starfall Staff | **WIRED — active UI** | Starfall — once per encounter choose a Location within Range; each Enemy there suffers 1d6 + your Weapon Bonus, reduced by its Armor. · Afterglow — create an Arcane Location there until the end of the next round. |
| EQ121 | Ember Wand | **WIRED** | Kindled Focus — once per Round, the first Fire Hero card you play that deals damage gains +1 damage. |
| EQ122 | Storm Wand | **WIRED** | Static Focus — once per Round, after you damage an Enemy with a Lightning Hero card, another Enemy in that Location suffers 1 Lightning damage. |
| EQ123 | Hexwood Wand | **WIRED** | Hex Focus — once per Round, your first Attack against an Enemy with a negative Status Effect gains +1 Attack. |
| EQ124 | Oak Quarterstaff | **WIRED** | Rooted Stance — if you did not Move this turn, your first melee Attack gains +1 Attack. |
| EQ125 | Initiate's Scepter | **WIRED** | Guiding Light — once per Round after you damage an Enemy, the next allied Hero to Attack that Enemy this Round gains +1 Attack. |
| EQ126 | Hunter's Shortbow | **WIRED** | Skirmish Shot — once per Round, if you Moved before this Attack, gain +1 Attack. |
| EQ127 | Longbow | **WIRED** | Steady Aim — if you did not Move this turn, your first Attack gains +1 Attack. |
| EQ128 | Scout's Crossbow | **WIRED** | Prepared Bolt — the first Attack you make each encounter ignores 1 Armor. |
| EQ129 | Iron Greatsword | **GENERIC ENGINE RULE** | Heavy Weapon — you cannot equip a Shield while this weapon is equipped. |
| EQ130 | Raider's Greataxe | **WIRED** | Desperate Swing — while at half your Maximum Health or less, your first Attack each turn gains +1 Attack. · Heavy Weapon — you cannot equip a Shield while this weapon is equipped. |
| EQ131 | Smith's Hammer | **WIRED** | Crushing Weight — your first Attack each encounter against an Enemy with Armor 2 or higher ignores 1 Armor. |
| EQ132 | Fighting Spear | **WIRED** | Keep Back — once per Round after you damage an Enemy that entered your Location this Round, you may Push it to a connected revealed Location if legal. |
| EQ133 | Duelist's Foil | **WIRED** | Single Combat — once per Round, if exactly one Enemy is in your Location, your first Attack against it gains +1 Attack. |
| EQ134 | Balanced Daggers | **WIRED** | Opening Cut — once per Round, your first Attack against an Enemy with no other Hero in its Location gains +1 Attack. |
| EQ135 | Initiate's Robes | **WIRED** | Spellguard — once per Round, reduce damage you suffer from a Magical or elemental source by 1. |
| EQ136 | Channeler's Robes | **WIRED** | Open Channel — once per Round, your first damaging Hero card with Range gains +1 Attack. |
| EQ137 | Hardened Hide | **WIRED** | Weathered — once per Round, reduce damage from an Environmental Hazard or Beast by 1. |
| EQ138 | Brigandine Vest | **WIRED** | Close Guard — the first time each encounter an Enemy enters your Location, gain +1 Armor against that Enemy's next Attack this Round. |
| EQ139 | Apprentice Focus | **WIRED** | Focused Casting — once per Round, your first damaging Arcane Hero card gains +1 Attack. |
| EQ140 | Ember Charm | **WIRED** | Heat Sink — once per Round, when one of your own effects would cause you to suffer damage, reduce that damage by 1. |
| EQ141 | Carved Totem | **WIRED** | Spirit Mark — once per Round after you apply a Status Effect to an Enemy, gain +1 Attack on your next Attack against that Enemy this Round. |
| EQ142 | Pilgrim's Holy Symbol | **WIRED** | Steadfast Prayer — once per Round when you restore Health to another Hero, that Hero gains +1 Armor against the next source of damage this Round. |
| EQ143 | Duelist's Token | **WIRED** | Tempo — once per Round after you Move, your next melee Attack that turn gains +1 Attack. |
| EQ144 | Field Toolkit | **WIRED** | Prepared Hands — once per Round, when you use an Equipment or Hero card effect that places, repairs, or interacts with a device or object, reduce its Action Cost by 1, minimum 0. |

## Consumable coverage

| ID | Consumable | Status | Effect |
|---|---|---|---|
| LT001 | Minor Healing Potion | **OPERATIONAL — full roster** | Recover 2 Health; discard. |
| LT002 | Healing Potion | **OPERATIONAL — full roster** | Recover 4 Health; discard. |
| LT003 | Greater Healing Potion | **OPERATIONAL — full roster** | Recover 6 Health; discard. |
| LT004 | Bandage Roll | **OPERATIONAL — full roster** | Remove Bleeding from a Hero at your Location; discard. |
| LT005 | Antidote | **OPERATIONAL — full roster** | Remove Poisoned from a Hero at your Location; discard. |
| LT006 | Burn Salve | **OPERATIONAL — full roster** | Remove Burning from a Hero at your Location; discard. |
| LT007 | Restorative Tonic | **OPERATIONAL — full roster** | Remove Weakened from a Hero and recover 1 Health; discard. |
| LT008 | Smelling Salts | **OPERATIONAL — full roster** | Remove Stunned from a Hero at your Location; discard. |
| LT009 | Focus Tonic | **OPERATIONAL — full roster** | Gain Inspired until the end of your next turn; discard. |
| LT010 | Guarding Draught | **OPERATIONAL — full roster** | Gain Guard; discard. |
| LT011 | Stamina Draught | **OPERATIONAL — full roster** | Gain 1 Action this turn; discard. |
| LT012 | Traveler's Rations | **BLOCKED — foundational rule** | When you Rest, recover 1 additional Health; discard after resolving the Rest. |
| LT013 | Herbal Poultice | **OPERATIONAL — full roster** | Recover 1 Health and remove Bleeding; discard. |
| LT014 | Purifying Herbs | **OPERATIONAL — full roster** | Choose Poisoned or Burning; remove that Condition from a Hero at your Location; discard. |
| LT015 | Smoke Bomb | **OPERATIONAL — full roster** | Choose your Location. Until the end of the turn, Heroes there may voluntarily Move while Engaged; discard. |
| LT016 | Fire Flask | **OPERATIONAL — full roster** | Choose an enemy at your Location or a connected Location. It suffers 2 damage and gains Burning; discard. |
| LT017 | Frost Flask | **OPERATIONAL — full roster** | Choose an enemy at your Location or a connected Location. It gains Slowed until the end of its next activation; discard. |
| LT018 | Thunderstone | **OPERATIONAL — full roster** | Choose an enemy at your Location. It gains Stunned; discard. |
| LT019 | Throwing Knife | **OPERATIONAL — full roster** | Choose an enemy at your Location or a connected Location. It suffers 2 damage; discard. |
| LT020 | Heavy Throwing Axe | **OPERATIONAL — full roster** | Choose an enemy at your Location. It suffers 3 damage; discard. |
| LT021 | Caltrops | **OPERATIONAL — full roster** | Place a Caltrops token at your Location. The next enemy that enters suffers 1 damage and ends its movement; then remove the token. |
| LT022 | Hunting Trap | **OPERATIONAL — full roster** | Place a Trap token at your Location. The next enemy that enters gains Rooted until the end of its activation; then remove the token. |
| LT023 | Torch | **OPERATIONAL — full roster** | Ignore one Dark or visibility restriction affecting you until the end of the round; discard. |
| LT024 | Lantern Oil | **OPERATIONAL — full roster** | Choose: extend a Torch effect through the end of your next turn, or remove Burning from a Location/object if the effect can reasonably be extinguished; discard. |
| LT025 | Rope & Grapnel | **OPERATIONAL — full roster** | Move to one connected revealed Location. Ignore Difficult Terrain, climbing, rubble, and similar terrain-based movement restrictions during this movement. Discard. |
| LT026 | Lockpick Set | **BLOCKED — foundational rule** | Bypass one Locked or simple Trap restriction at your Location without paying its additional Action cost. Then immediately perform the associated Interact or Search without spending an additional Action. Discard. |
| LT027 | Scout's Kit | **OPERATIONAL — full roster** | When you Explore, draw 2 valid Exploration cards. Choose 1 to resolve and discard the other; discard this card after use. |
| LT028 | Whetstone | **OPERATIONAL — full roster** | Choose your equipped Weapon. It gains +1 Weapon for your next Attack this turn; discard. |
| LT029 | Emergency Supplies | **OPERATIONAL — full roster** | Recover 2 Health and draw 1 Hero card; discard. |
| LT030 | Phoenix Ash | **OPERATIONAL — full roster** | Remove all negative Conditions from one Hero and recover 3 Health; discard. |

## Relic / Legendary notes

- LT136–LT145: existing relic controllers preserved (exploration redraw, Dark/Ambush protection, Gold/Reputation, movement, Rest, attack aura, anti-Undead/Corrupted damage, cleanse activation, deck look/reorder).
- LT146/LT147: existing armor / post-hit damage behavior preserved.
- LT148/LT152: existing active relic healing paths preserved.
- LT149: Main Quest start effect wired in 3.36.12.
- LT151/LT153/LT154/LT155/LT158: acquisition/unlock/crafting progression behavior preserved.
- LT157: once-per-Campaign defeat prevention is routed through the shared damage/defeat pipeline.
- LT156/LT160 and campaign sigils LT165/LT166/LT172/LT178/LT184/LT190 are workbook-authored future-content/title markers; no immediate combat handler is required by their printed text.
- LT150 and LT159 remain blocked as described above.

## Validation

- Core simulation: **438 / 438 passed**.
- 3.36.11 Hero-card production browser regression: **PASS**.
- 3.36.12 Equipment/Loot browser regression: **PASS (20 tests)**.
- Browser checks include expanded-Hero Healing Potion ownership, Guarding Draught/Guarded armor, Torch visibility, Smoke Bomb movement, Equipment Attack/Armor-ignore math, magical damage reduction, legacy damage routing, two-handed Shield restriction, Worldsplitter, Starfall Longbow, Starfall Staff + Arcane Location creation, Twinfang Twin Strike, Recurve Rapid Shot, Knight’s Plate Protector, Band of Recovery, and active Equipment UI.

## Stable-baseline recommendation

Use **3.36.12** as the Equipment/Loot parity baseline. Do not change the seven blocked Equipment effects by approximation; implement the missing foundational rule first, then enable the card against that authoritative rule.
