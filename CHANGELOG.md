# Changelog

Release notes describe Recast's capabilities and user-facing changes. Download packaged builds from [Releases](https://github.com/sxrvys/Recast/releases).

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
