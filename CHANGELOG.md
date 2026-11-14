# Changelog

Release notes describe Recast's capabilities and user-facing changes. Download packaged builds from [Releases](https://github.com/sxrvys/Recast/releases).

## 0.2.0-beta.15 — 2026-11-14

- Moved the custom editor from Max's legacy JSUI engine to V8UI. This addresses the reported Live crash when Solo on a layer was followed by New sound; both crash reports entered the legacy JavaScript engine from the UI mouse handler.
- The isolated V8UI build survived 16 Solo/replacement cycles during playback, and the user confirmed the exact mouse sequence changed the sound without crashing. Native checks also passed session recall, typed gate editing, 49-note MIDI insertion and stereo WAV rendering.
- Requires Max 9 or later. Tested in Live 12.4.16 with bundled Max 9.1.5 on macOS. Existing JSON sessions, controls, source paths and audio processing retain their format and behavior.

## 0.2.0-beta.14 — 2026-11-14

- Manual hits retain fixed timing during live variation; loading sessions recognizes existing hand-placed collage hits without changing their chosen source regions.
- New layers added in the Step editor use whole-source playback. A short recording (up to 10 seconds) on an empty layer starts as a whole sound for its first manual hit unless a source mode was explicitly chosen.
- Layer defaults exposes a source-mode dropdown: Whole sound, Random fragments, Detected attacks and Equal divisions. Existing per-hit regions remain independent.
- Use whole sound for manual hits explicitly restores full source bounds for that layer's unprotected manual notes, preserving timing, velocity, pitch, reverse and gates.
- Session saves automatically add `.json`; valid extensionless sessions remain readable.
- Validated the reported session: every snare trigger was dispatched across three loops; differing source offsets were omitting the loud attack on two hits. The original session remains unchanged, with a separate repaired copy available.

## 0.2.0-beta.13 — 2026-11-14

### Layer mixing and sound choices

- Added inline volume, Mute, Solo, Lock and activity indicators beneath each layer's Browse / New sound controls, plus a Master fader above the cards.
- Live volume changes use a short smoothing ramp and affect already-playing voices. Loop and stem exports apply the mixer settings.
- Keep protects sounds from automatic replacement. Intentional per-layer New sound replacement retains the rhythm and Keep state; global replacement still skips kept sources.
- Max fragment size sets only the upper bound, preserving short random cuts at high settings. Explicit advanced ranges, whole-source playback and equal divisions keep their own length rules.

### Precise editing and inheritance

- Gate, Velocity and Pitch have native editable numeric fields and Shift-drag fine adjustment.
- Layer defaults and Selected steps share the existing editor. Layer changes update inherited values; explicit step overrides and protected hits remain independent.
- Selected steps can reset to layer defaults. Gate units are sixteenth-note steps, so 4.0 is exactly four steps.
- Layer-label selection opens its defaults inline; Choose sound opens its sample browser.
- Mixer settings, layer defaults and per-step overrides persist in saved sessions.

### Validation

- Passed 194 automated test groups covering source replacement, fragment bounds, defaults, overrides, selections, live dispatch, export gain and UI layout.
- In Ableton Live, verified kept-source replacement with unchanged rhythm, numeric-field callbacks, overrides, session recall and non-silent WAV rendering.
- An audio probe measured a 0.25 amplitude ratio when lowering an already-playing voice to one-quarter gain, and zero output after muting it.

## 0.2.0-beta.12 — 2026-11-14

### Rhythm and foundation

- Added **Groove / develop…** with explicit Pulse, Backbeat, Ticks and Free jobs for each collage layer, independent of its source recording.
- Added **Coherence** to favor recurring rhythmic placements while keeping a separate **Wildness** amount for episode-based damage.
- Full Coherence keeps generated foundation anchors steady under movement and damage. Zero Coherence leaves independent collage placement available.
- Generation retains loaded sources and respects the active target, locked layers, protected hits and protected silence. Foundation settings persist in saved sessions.

### Manual sequencing

- Added **+ Layer** directly to the Step editor.
- Added clickable layer labels for sound selection.
- Manually placed hits can prepare their source fragments without regenerating the surrounding phrase.

### Current instrument

- Local sample collage with up to 24 layers, source pools, named folder palettes, weighted selection and direct per-layer sound replacement.
- Phrase styles, nearby variations, four-part section development, layer interactions, protected passages, recent takes and persistent Keeps.
- Editable hit timing, velocity, gates, repeats, pitch, reverse, source regions and processing.
- Drum foundations with pocket, drunken timing, glitches, fills and per-instrument MIDI notes.
- Stereo loop and aligned layer-stem rendering, direct audio-track insertion into Live, rendered-sound MIDI and role-kit export.
- JSON session recall, linked-audio collection and relinking, a bundled starter kit, and local library indexing without an online service.

### Documentation and validation

- Reorganized the README around installation, the current collage workflow, manual sequencing, library use, saving and output.
- Passed 187 automated test groups and GitHub validation.
- Checked native Live playback, generation during playback without a Stop call, foundation placement, manual layer/hit creation, session recall, MIDI insertion and non-silent stereo WAV export.

Recast remains a beta. Musical results, performance with large sources and unusual combinations require real-world testing.
