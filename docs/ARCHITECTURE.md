# Architecture

`MaxForLive/Recast.maxpat` is the editable device patcher. `recast-native.js` is the JavaScript entry point; it includes the other modules in order. These scripts share Max’s JSUI global scope, so include order and wrappers around existing functions matter.

| Area | Modules |
| Sample collage generation, circular workshop, local-library draw and optional tonal estimates | `recast-collage.js`, `recast-collage-ui.js`, `recast-collage-library.js`, `recast-collage-discovery.js`, `recast-collage-draw-ui.js`, `recast-collage-pitch.js`, `recast-collage-refine.js`, `recast-collage-shape.js`, `recast-collage-render.js`, `recast-collage-output.js`, `recast-collage-keys.js`, `recast-collage-placement.js`, `recast-collage-clock.js`, `recast-collage-keeps.js`, `recast-bank-stability.js`, `recast-collage-refinement.js`, `recast-collage-fragments.js`, `recast-collage-refinement-ui.js`, `recast-usability-pass.js` |
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

## Episode damage and browsing UI

`recast-damage.js` builds seeded disruption episodes over an immutable reroll input. Explicit locks, scope, destination protection, detail bias and anchor protection constrain the generated notes. Results are fixed events; playback does not reroll them. Generated repeats cannot parent additional rolls. `recast-browser-nav.js` adds bounded folder history, a cached folder tree, file-list scrolling and separate audition/assignment to the existing browser engine. `recast-feel-ui.js` replaces cycling settings with direct sliders and extends the shared footer help to settings and navigation. Native JSUI remains the host; no browser UI is used.

`recast-vocabulary.js` adds ten authored rhythmic grammars while preserving the original three style indices. Each new grammar defines a kick core/candidate set, backbeat, hat behavior, ghost-note density and fill tendency. It constructs a recurring motif plus answer, retains explicit protections, and feeds ordinary events into the unchanged damage, sampler and MIDI engines. The shared style dropdown displays descriptions and keeps selection separate from regeneration.

`recast-starter.js` delays default-kit initialization until native session recall has had time to arrive. Valid recall prevents auto-fill, even for an intentionally empty saved kit. Only pristine new instances receive the six bundled sounds. Original synthesized assets are produced deterministically by `tools/make_starter_kit.py` during the build, included in the source hash and packaged manifest. Recorded starter-path metadata permits relocation without replacing custom sound choices.

Automatic session-buffer loading checks for a nonempty, readable file and uses explicit import. Missing source/archive paths are reported through recovery status instead of issuing an empty import that can open a native picker. Starter asset paths normalize native Mac volume syntax to absolute paths.


Beta 7: `recast-space.js` owns an explicit role/cell generation mask and viewed/playing-bar distinction. `recast-rolls.js` adds bounded ghost doubles and true triplets and renders actual event positions. `recast-shaping.js` exposes shared treatment settings with fresh-groove and stable-input variation actions. `recast-sound-target.js` distinguishes explicit lane-wide replacement from per-hit overrides and invalidates old render/generation sources. Browser rows retain ordinary navigation IDs but use flat list drawing.

## Collage state and generation

`state.collage` stores independent random streams for cuts, rhythm, ordering, motion and damage, plus per-layer source paths, cut pools and four non-recursive Keep snapshots. Events retain explicit archived-buffer regions. Cut preparation is scheduled by layer; source decoding is cached. Local-library indexing yields between batches and never calls an online sample service. Whole source files still consume decoded memory.

Generation reuses a saved base for treatment rerolls, respects protected events and selected regions, and caps output through the shared event bound. Playback resolves per-loop layer probability and within-phrase voice admissions; Commit take records that realization. Periodic occupancy reservations account for long tails across loop boundaries before probability thinning, and native dispatch searches for a free voice rather than blindly wrapping its voice index. Ordinary MIDI still shares the physical voice pool. The optional pitch module estimates monophonic periodicity and does not implement polyphonic key recognition.

The collage renderer takes one fixed event list, resolves processing against the whole list, and renders in 4096-frame blocks. A measurement pass finds a common headroom gain for the mix and stems; a writing pass applies it to all files. Output is stereo 16-bit / 44.1 kHz at exact loop length. Cancellation finalizes partial-file headers, closes handles and marks the stem manifest incomplete. No per-stem normalization changes the relative balance.

Collage archive restoration imports referenced paths and defers inactive Keep sources. Snapshot restoration reloads archives, preventing a reused buffer slot from returning the wrong recording. An explicit memory-release action removes unreferenced decoded buffers, without deleting source files or Keep metadata.

## Stereo, output dynamics and source-key estimates

Voices accept an optional stereo-balance value. Parent dispatch pads legacy messages with a zero, so older centred dispatches keep working. MSP balance and offline WAV/pad rendering use the same centre-unity balance law. Frozen rendered-note mappings retain pan.

The embedded original gen~ compressor follows the stereo-linked absolute peak with separate attack/release coefficients, then applies a threshold/ratio gain law and makeup gain. The offline renderer implements the same equations with sample-rate-specific coefficients and preserves envelope state across blocks. Both measurement and writing passes start from the same detector state. Stems receive the mix-derived envelope; they are not compressed independently. The metronome has its own oscillator/envelope path outside the musical export renderer.

Source-key estimation uses an independently written radix-2 FFT, Hann windows, peak-weighted chroma and correlation with published Krumhansl-Schmuckler numeric key profiles. Background: [Napoles Lopez et al., 2019](https://napulen.github.io/media/justkeydding/napoles19key.pdf). Work yields between analysis windows. Results include correlation, runner-up margin and a confidence decision; sparse/flat evidence is rejected. This is approximate analysis, not source separation. Key sync transposes roots or relative key families; octave motion preserves the estimated pitch-class family. Manual source-key overrides and bypass are stored separately from estimates.

Compatible collage Keeps are prepared under a temporary prospective state between clock callbacks, while the current native voices continue. Their archived-source registry remains shared, but the playing state is restored after each preparation step. At the next ready bar, the prepared musical state replaces the current state without sending Stop or restarting playback preparation. Changed core-kit paths fall back to the existing recall path. MIDI rendered-note pitches are pinned independently of the visible instrument reservations; conflicting Keep layouts are rejected rather than silently changing exported clips.

## Local sound discovery

The library draw state machine inspects one candidate at a time, skips known out-of-range WAV/AIFF recordings before decode and retains the original source on failure. Filename/folder hints and a separately chosen physical sound-character filter both apply. Audio descriptors inspect up to 24 windows of 1024 samples per channel (at most two channels), measuring energy, a 180 Hz one-pole low band, first-difference brightness, crest and window occupancy. This is not semantic voice/instrument recognition.

Copied-file avoidance compares a candidate to active source paths of equal byte length. It compares all file bytes in at most eight 4096-byte blocks per Task tick, with no content hash collisions and no deletion. The 4096-byte read is intentional: native testing showed legacy Max JS returns an empty array for a 65536-byte read while still advancing the file position. Stop/deletion close comparison handles. Bounded caches avoid repeating work; Rescan clears them after in-place file changes. Different containers, metadata or encodings are not audio-content duplicates for this check. Whole-file decoding remains necessary before physical descriptors on unknown candidates.

## Refinement proposals

UI generation creates an isolated prospective state, sharing only the append-only archived-buffer registry with the active state. Each Task builds one layer, analyses one key window, or prewarms one event. Temporary scope, render context, selection, transport functions, persistence/redraw and undo functions are restored in finally. Prospective state must never be sent to the device's session dictionary. Compatible proposals reuse the warm Keep handoff with an internal index outside the four saved slots; they do not consume or overwrite a user Keep. Deep revision checks happen at completion and handoff; the clock avoids serializing the whole phrase on every tick.

Generation has explicit target descriptors, including role-specific selected empty cells. Source-only rerolls copy the complete current event layout and replace source regions only. Damage stores a small per-event baseline and last treatment, so manual changes can be distinguished from generated offsets/gates; generated repeats are not recursively reused. Phrase development builds motifs, replies and fills with seeded decisions. Last-pair comparison is ephemeral, with down-only measured-energy audition gain at trigger dispatch; export does not include that preview compensation.

The fragment editor caches bounded local waveform windows and marks source ranges in milliseconds. Applying a region updates one event, preserving other events and playback timing. Gain analysis uses both channels and bounded contiguous windows, with a bounded region cache. Rescan clears that cache. Optional local library preferences are read/written alongside the installed device and are not package inputs.

The output DSP and offline renderer share an instantaneous stereo-linked sample-peak gain reduction with a 50 ms release, enabled by default at -1 dB. Every layer receives the full mix's gain envelope, preserving stem additivity. This is not intersample/true-peak protection or a look-ahead limiter.

## Usability pass and proposal ownership

`recast-usability-pass.js` supplies the focused grid (view 31), transient recent takes (32), reversible sound audition (33), normalized readouts and local cache lifecycle. It wraps the existing generator, selection editing and source-aware handoff; it does not introduce a second audio engine. Eight bounded history snapshots exclude Keep nesting and source-analysis caches. Archive reference collection includes the history/working/audition snapshots so memory cleanup cannot invalidate an active comparison.

Library draws clone working state and share only the append-only archive path registry. Candidate decoding and filtering occur in small Task steps. A final revision check rejects stale draws; accepted candidates enter the existing refined proposal queue. Sound auditions retain an independent original snapshot. Original/Candidate listening does not mutate that stored candidate. Cancel can discard pending work without issuing transport Stop. UI state distinguishes the audible take from the queued one.

LibraryCache.json contains a root-keyed, bounded index plus bounded metadata/character descriptors. It is written in small Task chunks, expires after 24 hours, and Rescan bypasses it. It is an optional local file, never a release input. Cold decoder calls and initial cache parsing still run in Max’s JavaScript context and cannot guarantee uninterrupted scheduling.

## Keeper workflow

`recast-keeper-workflow.js` adds final UI/action adapters after the usability pass. Direct single-layer draws use the existing isolated draw pipeline with `wbKind: draw`; manual browser auditions retain their separate reversible flow. Palette definitions live in `state.collage.palettes`, with explicit global/lane IDs and a private preferences mirror. Scanning indexes all configured palette roots; selection filters candidate paths by complete folder boundaries, so similarly prefixed folders are not accidentally included.

Nearby development retains a nonrecursive `keeperHome` event snapshot. It prepares fixed nearby events through the existing warm/bar-boundary handoff, never recursively mutating its last output. Home references participate in archive retention. Section development copies a bounded motif into four named sections, preserving source regions and explicit protection, and shares existing audio/MIDI export code. Generation interactions run only for phrase/rhythm modes. Strong-region weighting is a bounded physical energy/onset heuristic, not semantic classification. Selected-fragment waveforms read already-decoded buffers and use a bounded cache; native palette name controls update on layout transitions.
