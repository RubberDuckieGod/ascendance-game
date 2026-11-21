# Ascendance 3.36.16 — Sound Foundation

## Runtime design

`audio-33616.js` adds one browser-local audio manager. It does not alter game state, card rules, Quest authority, room authority, or save data. Sound settings are device-local and stored under the stable key `ascendance-audio-settings-v1`.

The engine uses the Web Audio API so the deployment does not depend on licensed or bundled sound files. iOS and desktop browsers unlock the AudioContext from the first pointer gesture.

## Event cues

- UI button/tab click — light click
- Hero card draw — card swish/chime
- Hero card discard — downward swish
- Hero attack — impact/swing
- Enemy attack — heavier low attack cue
- Damage — impact thump
- Healing — rising three-note chime
- Location Reveal — discovery chord
- Explore — travel/discovery cue
- Search — search/swish cue
- Loot / Gold / Supply / rewards — reward chime
- Status gained / changed — status cue
- Warning / alert — double warning pulse
- Hero/Enemy defeat — low defeat impact
- Quest victory — four-note victory chord
- Quest failure — descending failure cue
- Round / phase transition — restrained phase chord

## Controls

The **Sound** button opens device-local controls for:

- Sound enabled / muted
- UI click sounds
- Optional ambient drone
- Master volume
- Sound Effects volume
- Ambience volume
- Test Sound sequence
- Reset levels

The optional ambience is disabled by default.

## Validation

- `npm test`: 438/438 core tests passed.
- `tests/audio-33616-browser.py`: Chromium PASS, no page errors.
- Web Audio API available and unlockable after user gesture.
- Event classifier tested for Hero Attack, Enemy Attack, damage, healing, Search, rewards, victory, and failure.
- Adventure Log wrapper preserves original log entries.
- Mute prevents event playback requests.
- UI click sound and settings overlay work.
- Optional ambience starts/stops without browser errors.
- 3.36.16 remains the visible/authoritative build after older delayed build writers.
