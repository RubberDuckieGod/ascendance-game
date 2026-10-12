# Ascendance 3.36.17 — Bundled Fantasy Audio & Regional Ambience

## What changed

3.36.17 upgrades the 3.36.16 Web Audio foundation from live procedural cues to bundled game audio assets. The files are stored under `audio/` and mirrored under `public/audio/` so the Render deployment serves the same assets as the local project.

### Bundled SFX

The game now loads dedicated OGG assets for:

- UI click
- card draw
- card discard
- Hero attack
- Enemy attack
- damage impact
- healing
- Location reveal
- Explore
- Search
- rewards / loot / gold / Supply
- phase transition
- defeat / downed cue
- Quest victory
- Quest failure
- Status effect
- warning / alert

The existing Adventure Log event classifier remains the source of gameplay SFX triggers. If an audio asset cannot load or decode, the 3.36.16 procedural cue remains available as a fallback instead of failing silently.

### Regional ambience

Seven looping soundscapes are bundled:

1. Stonebrook Marches — forest wind, leaves, distant birds, warm low tones
2. Crownlands / Valewatch — distant city murmur, footsteps, bells
3. Ironspine Mountains — mountain wind, deep stone rumble, distant forge strikes
4. Verdant Reach — dense leaves, wildlife, spirit-like chimes
5. Storm Coast — surf, wind, distant thunder
6. Sunscar Expanse — desert wind and sparse glass-like chimes
7. Underground — cavern air, low resonance, water drips

In **Auto** mode, ambience follows the controlled Hero's current Location. Location ID ranges follow the six-campaign workbook geography, while caves, mines, crypts, sewers, tunnels, and similar subterranean Locations use the Underground soundscape. Ambience crossfades when the Hero moves between regions.

### Sound settings

The Sound panel now includes:

- Sound enabled
- UI click toggle
- Regional ambience toggle
- Ambience region: Auto or manual regional selection
- Current ambience / now-playing label
- Master volume
- SFX volume
- Ambience volume
- SFX test
- Current-region preview
- Mute and reset controls

Sound settings remain device-local and do not enter multiplayer game state.

## Asset ownership

The 3.36.17 audio files are custom-generated for the Ascendance prototype and do not depend on third-party stock-audio downloads or external runtime URLs.

## Browser behavior

Browsers and iOS still require a user gesture before audio playback is unlocked. The first pointer interaction unlocks the AudioContext and preloads SFX. Ambience begins after unlock if Regional Ambience is enabled.

## Validation

- Core simulation: 438 / 438 passed.
- 24 bundled OGG assets registered: 17 SFX + 7 ambience tracks.
- Dedicated Chromium audio regression: PASS.
- Bundled OGG assets decoded through Web Audio: PASS.
- Regional ambience start and cross-region switching: PASS.
- Auto routing by Hero Location and Underground override: PASS.
- Adventure Log SFX bridge preserved: PASS.
- Delayed legacy build writers remain pinned to 3.36.17: PASS.
- No browser page errors in the dedicated audio regression.
