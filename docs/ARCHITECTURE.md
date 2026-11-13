# Architecture

`MaxForLive/Recast.maxpat` is the editable device patcher. `recast-native.js` is the JavaScript entry point; it includes the other modules in order. These scripts share Max’s JSUI global scope, so include order and wrappers around existing functions matter.

| Area | Modules |
| --- | --- |
| State, transport, voice dispatch and file I/O | `recast-native.js`, `recast-workbench.js` |
| Pattern vocabulary and kit MIDI | `recast-generator.js`, `recast-instrument.js` |
| Timing, phrases and sound development | `recast-instability.js`, `recast-phrases.js`, `recast-ideas.js`, `recast-tones.js` |
| Envelopes, preparation and drawn processing | `recast-articulation.js`, `recast-tools.js`, `recast-regions.js`, `recast-finish.js` |
| Live handoff and file dialogs | `recast-export.js`, `recast-dialogs.js` |
| Selection, expandable lanes, comparison and manual editing | `recast-workflow.js`, `recast-compare.js`, `recast-edit.js` |
| Pools, performance realization, relationships and recovery | `recast-performance.js`, `recast-performance-ui.js` |
| Direct grid expression and common appearance | `recast-grid-expression.js`, `recast-visual.js` |
| Supporting/legacy utilities | `recast-analysis.js`, `recast-tempo.js`, `recast-source.js`, `recast-midi.js`, `recast-simple.js`, `recast-explore.js` |

`recast-voice.maxpat` supplies 32 sequencer voices and one reserved browser-preview voice. Preview stop/replace targets voice 33 without stopping the groove. The build emits an AMXD container from the JSON source patcher, copies its include graph and voice, and gives those files a source-derived prefix. Development hot reload is disabled in the generated device.

## State and audio

Working notes live in `state.events`. Musical snapshots support undo and related operations; Live state storage and JSON sessions serialize the broader state. Native Dict values and dictionary-name messages are both accepted on recall. Audio buffer restoration waits for patcher initialization.

Live performance realization is separate from the working notes. Pools choose sources, relationships generate responses or tail processing, and tension/malfunction changes eligible details. Freeze commits a realization; recovery retains the events actually triggered with their sources. Explicitly frozen events must not regenerate replies or reroll their source on later playback.

Paths and generated processing audio are part of session recovery. Do not replace explicit per-hit/frozen sources with current lane samples during unrelated edits. Preserve timing, gates, reverse, source metadata and per-hit regions when moving or duplicating notes.

The default processing directory is resolved from the owning device’s [patcher path](https://docs.cycling74.com/apiref/js/patcher/#filepath), walking past embedded patchers with empty paths, then `Rendered/`. Distributions must retain that writable folder alongside the scripts.

The final `recast-browser.js` layer handles folder navigation, incremental filename indexing and transient playback audition. It changes a lane only on explicit assignment. `recast-pocket.js` supplies per-lane feel, step-unit gate menus and scoped malfunction actions.

## Tests

`Tests/workflow.cjs`, `redesign.cjs`, `workbench.cjs` and `performance.cjs` run the scripts in mocked Max contexts. They cover editing transactions, protections, pattern transformations, MIDI mapping, DSP operations, file routing, pool choices and recovery behavior. Some tests generate diagnostic JSON in `Tests/`; those files are ignored.

These are useful regression checks, not substitutes for Live. Validate actual audio, MIDI insertion, save/reopen, dialogs and physical gestures in the host before declaring a change verified there.
