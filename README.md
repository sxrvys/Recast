# Recast

**A free, open-source smart sequencer and sampler for Ableton Live.**

Recast turns recordings into layered phrases and generates drum grooves you can reshape by hand. Drop in a song, a field recording or a few foley samples; build a collage from fragments, reroll its rhythm, change the cuts, or shuffle which sounds land where. Keep a promising phrase and pull it apart in the step editor.

It also builds recognizable drum foundations, with pocket, drunken timing, ratchets, chokes, gates and interruptions. Your metal door can still be the kick. Your voice recording can become the machinery around it.

**[Download Recast](https://github.com/sxrvys/Recast/releases)** · [User guide](MaxForLive/README.txt) · [Report a problem](https://github.com/sxrvys/Recast/issues)

Recast is an experimental Max for Live instrument. It has automated regression tests and has been exercised inside Live, but it is still being tested in real musical use. Feedback, fixes and contributions are welcome.

## What it does

### Build a sample collage

The opening workshop now puts **Play, Generate, source layers and four main controls** together. Its circular view shows event starts as dots and their gates as arcs; rings are layers, not individual voices.

- Load recordings onto up to **24 layers**, with up to **16 source files per layer**. New instances include a small generated starter kit so you can play immediately.
- **Library draw setup** lets each layer draw from its own local folder, with sound-type filename hints, independent measured sound-character filters and Industrial, Voices/Atmosphere or Percussion recipes. Keep a layer's discovery while replacing the others. New sounds avoids active recordings and prefers files outside its saved recent history; small pools may reuse earlier draws. No subscription, online sample service or upload is involved.
- Choose a phrase style, from short rhythmic hits to sparse fragments, microglitch and longer drifting material. Type a BPM or tap it, and choose a phrase length up to 32 bars.
- **New rhythm** changes placements, **New cuts** changes source regions, and **Shuffle fragments** changes which region plays at each event. Those decisions use independent random streams.
- Shape density, fragment size, movement and damage. Focused Audio, Cut, Envelope, Rhythm, Structure, FX and Pitch pages expose recording-length filters, cut-duration ranges, playback-gate ranges, fades, repeating periods, probability, gain and choking. Collage processing includes flutter, low/high-pass filters, bit reduction, drive, flanging, echo and reverb, with separate probability and strength controls. Mute, solo or lock layers.
- Keep four source-aware phrases. Compatible source-aware Keeps prepare in the background while the current phrase plays, then switch at the next ready bar without stopping the engine. Changed kits and cold sources may still need preparation. **Commit take** fixes the current probability and voice-limit realization before export.
- **Loop WAV** produces the full stereo loop. **Layer stems** exports aligned stereo WAVs plus the same full mix and an export manifest. Every file has the same start and length; one shared gain preserves the balance when you recombine the stems. Rendering runs in cancellable chunks. Partial WAVs remain at the destination if you cancel.
- Rendered-sound MIDI handoff creates a clip with distinct processed fragments mapped to notes in this Recast instance. Ordinary kit MIDI remains a separate role-based export and cannot encode every fragment decision.
- **Source pools** have an explicit recording list with audition, removal and weights. Weighted random chooses a recording before choosing one of its cuts, so a longer cut list does not automatically give that file more influence. Cycle visits enabled cuts in order; Shuffle uses every enabled cut before starting another shuffled bag.
- **Recording key sync** analyses spectral chroma across several windows of each recording. Confident estimates can transpose whole recordings into a shared major/minor key family, preserving chord intervals. Auto chooses a target from confident audible sources; Manual uses your root and scale. Uncertain sources stay unchanged. Per-recording key overrides and an untuned bypass let you correct the estimate.
- Independent straight and triplet timing grids, phrase rotation, attack preference/sensitivity, and a pitch-only reroll.
- Per-layer stereo balance and fragment stereo spread. Pan is retained in playback, rendered-sound MIDI and audio exports.
- A stereo-linked output compressor with threshold, ratio, attack, release and makeup gain. Stems receive the full mix's compression envelope, so they remain additive. The internal metronome is excluded from exports.

WAV, AIFF, MP3 and FLAC source loading has been checked inside Live. Other formats offered by the browser depend on Max's decoder support. Whole recordings are decoded into memory: start with a modest collection of reasonably short files. Audio settings can release unused decoded buffers; saved Keep sources reload when recalled. Library indexing is capped at 50,000 files. WAV/AIFF recording lengths are checked from bounded header reads before decoding when possible. Other formats need the decoder; rejected newly loaded buffers are released. Type hints use filenames/folders. Independent sound-character filters measure low energy, brightness, sparse attacks, sustain and roughness from bounded audio windows; these are approximate physical descriptors, not semantic recognition. Avoid copied files compares candidate bytes against active recordings in cancellable chunks, catching renamed byte-identical copies without deleting files. Different encodings or edited copies are not recognized as duplicates. Rescan refreshes the metadata cache. Audio remains linked to its original paths; saving a phrase does not copy your recordings into the project.

The collage voice budget reserves space for tails across repeated loop boundaries. Reservations are conservative: a probability skip does not immediately reallocate that voice to another event. The instrument still has a physical 32-voice pool shared with MIDI interventions. Offline WAV rendering includes Recast's processing, not effects placed after it in Live. This is an experimental independently written collage engine, with its own behavior and limitations. Key estimates can be wrong on sparse, noisy, ambiguous or changing-key material; they are not source separation or harmonic resynthesis. See the [parity status](docs/PARITY.md) for remaining differences.

Use **Step editor** to return to the detailed smart-sequencer workflow below.

### Refine without losing the useful part

**Groove / develop…** opens the Foundation controls. Assign each layer a job—Pulse (1 + 3), Backbeat (2 + 4), Ticks (eighth notes), or Free—independently of its recording. **Coherence** gradually favors recurring rhythmic placements; at zero, the existing collage placement stays unchanged. **Wildness** controls the existing episode-based damage engine separately, with the same gentle response as the main slider. At full Coherence, foundation anchors stay steady while detail layers can stutter, choke, reverse and drift. Changes apply on **Generate with these settings**, respect the current target and locks, and stay in saved sessions. Sounds remain loaded.

- **Target** chooses Whole Pattern, Selected Layer, This Bar or a passage selected in the Step editor. Protected hits and locked layers remain protected. Layer-only generation also leaves other layers' fragment pools alone.
- **Generate** and the optional rhythm-only variation use recurring motifs, answering bars and occasional end fills. Structure → Phrase development sets the strength; zero returns to independent layer placement. Use two or more bars to hear phrase development.
- **More variations → Shuffle fragments only** preserves timing, pitch, gates and treatment. **More variations → Change fragments only** rebuilds source regions while keeping the hit pattern. Library draw setup also has **Keep rhythm**: on by default, it places newly drawn recordings onto existing hits; turn it off to build a new phrase from them.
- **More variations → Change damage only** proposes episodes of accelerating bursts, late answers, gaps, reversals, short chokes, dragging and rushing/recovery. Drum-aware foundation hits stay protected, with more disruption available around them. Rerolls use a base rather than recursively multiplying the previous burst. Manual source-region edits survive damage rerolls.
- While playing, proposals prepare in an isolated state and switch at the next ready bar. The current phrase stays available during preparation. Stop cancels a pending proposal; editing the working phrase invalidates a stale one. Cold decoding and individual processing jobs can still delay the shared JavaScript scheduler, so this is not a guarantee of glitch-free real-time operation on every source.
- **Hear previous / Hear generated** compares the last proposal with the preceding phrase. Playing comparisons switch at a bar boundary and use approximate, down-only energy matching for audition. That matching is not LUFS normalization and is not baked into exports.
- **Edit / audition fragments** exposes the chosen hit's source region, alternative cuts and immediate audition. The waveform opens zoomed around the region; Zoom In, Zoom Out and Whole Source change the view. Drag a boundary, then Apply to change only that hit. Cyan wheel markers and a change summary show which events changed.
- Fragment gain estimates inspect both channels. Output → **Safety ceiling** defaults to a stereo-linked −1 dB sample-peak ceiling with a short release. Live output and offline stems use the same gain calculation; stems remain additive. It is not a true-peak or look-ahead mastering limiter and can be disabled.

Local draw folders can be remembered in an optional `LibraryPreferences.json` beside the installed device. This machine-specific file is excluded from downloads and source packaging. Recordings remain linked to their original paths.

### Generate a foundation

- Coordinated kick, snare and hat patterns, with **13 starting foundations**: Broken funk, Half-time weight, Driving syncopation, Straight backbeat, Four to the floor, Electro breaks, Two-step, Dub space, Slow crush, Motor pulse, Tresillo, Shuffle and Breakbeat.
- Quick pattern lengths of **1, 2, 4, 8, 12 or 16 bars**.
- Each Generate click constructs a kick motif, complementary answer, hat subdivision and supporting ghost-note placement within the selected style. The original three families combine musical constraints with aggregate position tendencies from reference examples; the ten additional foundations use authored rules for kick cores, backbeats, hat articulation, ghost-note space and phrase endings. Shuffle adds long/short timing directly to the generated notes. It does not select named patterns from a bundled book library. See [the rhythm design notes](docs/RHYTHM.md).
- Regenerate an individual instrument from the Edit menu while keeping the others.
- Build replies, fills, related variations and developing phrases.
- Enter a BPM directly or use tap tempo.

### Keep the groove; change its behavior

**Pocket** adjusts timing and accents. **Drunkenness** controls shared timing drags and recoveries; **Glitch** controls structural disruption. **Glitch** introduces episodes of stumbles, missing footsteps, uneven bursts, choked interruptions, displaced fragments and breakdowns, with occasional reversals. You can target an instrument or passage, protect your foundation, and preserve empty space as deliberately as the hits.

**New variation** rerolls its preceding input with the current Pocket, Drunkenness and Glitch settings while you explore consecutive takes. They do not repeatedly process their own output. Editing the notes or switching the target/passage establishes a new input. Undo compares takes; generated damage repeats cannot spawn further rolls. **Develop phrase** retains the opening bar and creates fresh later variations, answers and fills.

The **Glitch settings** panel starts with four sliders: Drunkenness, Glitch, detail-lane bias and anchor protection. Expand the behavior mix to favor or disable specific disruptions and tighten their gates. The **Feel / instability** panel uses direct sliders for timing sway, late lean, uneven repeats and tail cutting; additional controls expand when needed. Hover a setting for a plain-language explanation in the footer. Changes take effect when you generate a new take. A phrase-wide tension curve lets disruption build and release across the pattern. Hold **Malfunction** during playback to push the details further, then recover at the next beat or bar; its control movement can be recorded for later passes.

### Use your own sounds

Browse a familiar folder tree beside a scrolling sample list and a separate waveform preview. Back, Forward, Up, breadcrumbs, Favorites and library search keep navigation direct. Single-click to preview; double-click or press Assign to commit. In-groove audition is temporary until you assign the sound.

Assign WAV or AIFF samples to the six core roles, or add up to six more foley lanes. Each instrument has its own MIDI note.

Each lane can also hold a **pool of up to 16 samples**:

| Selection | Behavior |
| --- | --- |
| Round robin | Cycle through the enabled samples in order. |
| Weighted chance | Draw according to relative weights; 300 is three times as likely as 100. |
| Use all / no repeat | Use every enabled sound before another shuffled bag, avoiding immediate boundary repeats. |

Weight **0** excludes a sample. A lane can play directly from its pool without a separate base one-shot. Freeze a realization or recover a heard passage when you want to retain the exact choices.

The **built-in sample browser** remembers your library folder, navigates folders, searches filenames recursively in small background batches, shows waveforms and favorites, and previews before assigning. **In groove** temporarily auditions a candidate on the selected lane during Recast playback. Assign commits it; leaving the browser cancels that temporary audition. The library index is session-local, limited to 50,000 audio files and 12 folder levels.

Sample tools include preparation and trim, gain, tape-style pitch, reverse, envelopes, looped sustain, flutter, filtering, candidate folders and estimated level matching for auditioning replacements.

### Make instruments interact

Create up to four relationships between lanes:

- **Duck:** one instrument suppresses another instrument’s tail during a chosen window.
- **Answer:** a trigger produces a quieter, delayed response on another lane.
- **Interrupt:** a hit cuts off an existing tail.

Drawn interruption regions can also apply mute/duck, filtering, bit reduction, drive, flanging, delay or a short feedback reverb over a passage.

### Edit it by hand

Recast is a step sequencer as well as a generator. Add and remove hits, select groups, paint velocity, drag gates, move or copy steps, and stretch or compress a burst. Repeats cycle through one, two, three or four hits within a step.

Per-hit and group controls cover velocity, pitch, gate, reverse and choke. Gate choices are expressed in sixteenth-note **steps**, including 1, 3 and 16 steps. A gate limits a long sample’s playback; it does not extend a short sample unless sustain is enabled. Choke relationships can cut a gate shorter. Fixed-role MIDI retriggers the lane, so overlapping tails should use rendered audio or rendered-sound MIDI.

**Lane pockets** independently set early/late offset, swing, timing spread and accent. Lock a lane there to preserve it during generation. **Another take** develops your existing base; **Generate** constructs a fresh foundation. **New malfunction** targets a selected passage, or a 4/8/16-step window in the current bar, and retains the surrounding groove. Adjacent notes and protected foundations remain intact. Copy/paste, bar duplication, small timing nudges, undo/redo and visible protection support deliberate editing after generation.

### Keep what works

Compare your working pattern with **Pocket, Broken and Space** alternatives. Switch at the next bar, then commit a version or return to the working groove. Preview level matching is an estimate and only attenuates louder alternatives.

**Recover** keeps recently triggered bars—including their chosen pool samples and movement—as editable notes. **Freeze performance** commits the current realization. The temporary recovery history holds up to 32 bars or 4,096 hits while the device is loaded.

## Requirements

- Ableton Live with **Max for Live** available and authorized.
- Developed and tested on **macOS with Live 12 Suite**. Windows and other Live versions have not been verified.
- Your own WAV or AIFF samples. No commercial sample libraries or personal recordings are included.

You do **not** need Python, Node.js, a terminal or external download tools to use the release ZIP. Python and Node.js are only needed to build and test the source.

## Install

1. Download the ZIP from [Releases](https://github.com/sxrvys/Recast/releases) and extract it.
2. Copy the **entire `Recast` folder** into your Ableton User Library. A convenient location is `Presets/Instruments/Max Instrument/`.
3. Keep `Recast.amxd`, the JavaScript files, the voice patcher and the `Rendered` folder together. The device is distributed as a folder, not a self-contained single file.
4. In Live’s browser, find **Recast.amxd** and drag it onto a MIDI track.
5. Click **Open Recast** in its compact device panel.

Keep the bundled **Starter Kit** folder beside `Recast.amxd`; it supplies the default sounds. These original synthesized one-shots are included under the project’s MIT license. Recalled projects retain their assignments, including deliberately empty lanes.

The `Rendered` folder must be writable: Recast stores generated processing audio there. If Live reports a missing JavaScript or voice file, check that you copied the whole folder rather than only the `.amxd`.

## Your first groove

1. Choose a style, a pattern length and a BPM, then click **Generate**.
2. New instances already have a small **starter kit** assigned: kick, snare, hat, metallic percussion, relay texture and bass. You can press Play immediately. Browse to replace a sound, or open **Pools** to add alternatives.
3. Click the prominent **Play / Stop** button directly above the grid. This auditions Recast’s pattern using its internal tempo.
4. Adjust **Pocket**, **Drunkenness** and **Glitch**, then choose **New variation**. Use a target or selected passage to keep the changes focused.
5. Protect something you like, edit individual steps, or try **Compare**.
6. The Tools screen groups deeper controls into **Rhythm**, **Selected hit**, **Sounds**, and **Keep / export**.
7. Use **Freeze performance** for the current realization or **Recover** for completed bars you actually heard.
8. Open **Send / Export** to take it into Live or render audio.

Recast’s preview transport is separate from Live’s clip transport. For host-controlled playback and arrangement, send a MIDI clip to Live and set Live to the intended BPM. Recast does not change the Set’s tempo automatically.

## Choose the right output

| Output | Best for | What to expect |
| --- | --- | --- |
| **Editable MIDI → Live** | Editing rhythms in Live or driving another kit | One note per instrument, with timing, velocity and length. Does not encode arbitrary audio processing or frozen pool choices. Live pools may choose again. |
| **Rendered-sound MIDI → Live** | Keeping a specific processed sound while retaining MIDI arrangement | Distinct frozen sounds get additional notes on the same Recast track. Save the Set to retain the sound bank. |
| **Stereo WAV / role stems** | Resampling, chopping or taking the result elsewhere | Recast’s internal processing is included. Downstream Live effects are not. |
| **Drum Rack ready kit + MIDI** | Moving the editable role kit to Drum Rack | Ordered WAVs and empty placeholders preserve note positions. Creating/loading the Drum Rack is manual. |

For an evolving performance, recover the heard bars before exporting. For the current live setup, freeze its realization first; the export controls direct you to that step when needed.

## Save and move projects

Save your Live Set to retain device state. Recast also provides JSON session save/open and collection/relinking tools.

Audio is linked to files; it is not embedded in the JSON. Use collection/relinking when moving a session between folders or computers. Keep the installed device folder and generated `Rendered` audio available to existing projects.

## Current limits

- Thirteen starting foundations; up to 12 instruments and 1,024 hits per pattern.
- Rendered-sound MIDI has a finite note bank: up to 122 distinct sounds, reduced by additional instrument lanes. Older mappings retain their MIDI note numbers as instrument reservations change; conflicting Keep layouts are refused instead of reassigning an exported note. Bank exhaustion is reported.
- Recovery history is temporary and clears on a new playback or session load. Recorded malfunction controls use quarter-beat segments, up to 64 segments.
- Level matching estimates RMS/peak energy; it is not perceptual loudness matching.
- New or dense processing combinations can require preparation. There is no hard real-time timing guarantee.
- The primary workflow generates patterns from scratch. Automatic transcription of a reference recording is not the intended starting point.
- Custom mouse gestures and overall musical usability still benefit from hands-on feedback. Passing automated tests is not a guarantee that every combination is flawless.

## Build from source

The source uses Max’s JavaScript/JSUI, LiveAPI and a polyphonic voice patcher. There is no browser application or network service to run.

With Python 3 and Node.js 18 or later installed:

```sh
npm test
python3 tools/build.py --zip
```

There are no npm or Python package dependencies to install. The build creates `dist/Recast/Recast.amxd` with its support files and a distributable ZIP. Generated files use a source-derived prefix so Max can distinguish builds in its script cache. The patcher starts with an empty pattern and an automatically assigned starter kit. The build synthesizes the original one-shots deterministically using Python’s standard library; no third-party samples, local QA callbacks or personal media are included.

You can also inspect the editable source patcher at `MaxForLive/Recast.maxpat`. See [the architecture notes](docs/ARCHITECTURE.md) for the module layout.

GitHub Actions runs the portable regression suites and produces a build artifact. Audio playback and LiveAPI behavior also require testing inside Ableton; CI does not launch Live.

## Contribute or report a problem

Open an [issue](https://github.com/sxrvys/Recast/issues) with your Live version, Max version, operating system, the steps to reproduce, and what you expected to happen. A small reproducible session is useful; share audio only when you have permission to distribute it.

For changes, explain the musical or workflow problem being solved, run the tests and describe any Live testing performed. Recast aims to make experimental rhythm immediate: recognizable foundations, useful accidents, and direct manual control.

## License

Recast’s source is released under the [MIT License](LICENSE). Use it, change it, share it and build on it. Ableton Live and Max for Live remain separately licensed products; the code license does not grant rights to samples you load.

Created by **Scott Rogers**.

### Browser and selection improvements (beta 7)

- Browse folders and samples in flat lists, preview a waveform, then explicitly use the sound for the entire lane or selected hits. Lane replacement clears frozen old samples, including on rhythmically protected hits; selected-hit overrides are labelled.
- Select empty grid spaces as well as notes. Generate and vary within the chosen lanes and time area, or select the whole visible bar.
- New groove and New variation share Pocket, Drunkenness and Glitch settings. Consecutive variations reroll from their input rather than multiplying repeats.
- Natural ghost doubles and true triplets supplement the foundation vocabulary. Grid marks follow actual note timing; 3T brackets identify triplet groups.
- Playing / Viewing and optional Follow distinguish the sounding bar from the bar being edited.

Portable regressions and a native Live check cover scoped edits, sample replacement, note timing and nonzero audio output. This remains a beta: musical usefulness and every physical interaction still benefit from hands-on testing.

### One generation workflow
Adjust Density, Fragment size, Movement and Damage, then click **Generate**. It applies all four controls together using the loaded sounds. Style choices populate the controls once; Generate preserves your adjustments. An amber reminder marks unapplied changes. While playing, proposals switch at the next ready bar. **Develop / explore → Change rhythm / cuts / damage only…** holds the optional narrow rerolls. Each layer has **New sound**: draw one replacement from your library while retaining its rhythm and the other layers. **Browse** chooses manually; **Layer / advanced → Audio → Manage selected layer sources** expands the pool.

Density, Movement and Damage use a gentler nonlinear slider response: half the travel gives one-quarter of the available amount. Existing saved amounts stay unchanged, and full-strength extremes remain available at the far right.

Send audio to Live offers Full loop (one new audio track) or Layer stems (one new track per layer). WAVs render into Recast’s Rendered folder and are inserted together in Arrangement at the beginning of the current playhead bar. Tracks are appended without replacing existing clips. Audio remains unwarped, retaining Recast’s timing; match Live’s BPM to Recast for bar-grid alignment. Use Live’s Collect All and Save to collect the linked WAVs into the Set. Editable rendered-sound MIDI remains available from the same menu.

Fragment editing includes a reverse switch, Keep this hit, and Apply + hear in pattern. Each layer’s Keep button protects its sound from library draws while allowing rhythm generation; Lock layer freezes the whole layer. Layer / sound → Material filter chooses short impacts, sustained machinery, voices, low drones, textures or drums using filename hints and approximate sound measurements. New sound applies that search. More variations includes Keep selected passage (all layers, including silence) and Release passage locks; kept hits appear green on the circular view.

### A clearer listening and editing workflow

- **Slider readouts follow the handles.** Density, Movement and Damage retain gentle internal curves; visible 0–100% values describe the controls consistently. Pending settings, current playback and next-bar proposals have separate feedback. Layer numbers run from the outer ring inward; click a hit dot to edit its fragment.
- **Direct replacement or manual audition.** A layer’s New sound draws immediately from its named palette or the whole collection without opening another screen. Browse offers a reversible in-groove preview with Original/Candidate, Keep and Cancel. Library folder switches directly among configured roots.
- **Develop tension deliberately.** Develop / explore → Change rhythm / cuts / damage only… → Phrase tension offers Steady, Build, Waves and Rupture. These shape non-foundation activity, accents and damage across the phrase while retaining recurring motifs and protected material.
- **Edit what was generated.** The focused Step editor shows the sounding/viewed bar, lets you drag hits in time or drag blank space/Shift-drag to select, and exposes velocity, gate, pitch, reverse and 1/2/3/4/8 repeats for the full selection. Source regions are editable through the waveform. Protected hits and gaps remain visible.
- **Recover good accidents.** Recent takes retains the last eight source-aware takes in the current device instance. Hear alternatives at the next ready bar, return to the working phrase, or save a take into a persistent Keep slot. Save the Recast session or Live Set to retain Keeps after reopening; transient recent history is not a saved project archive.
- **Spend less time waiting.** Library replacement now prepares an isolated proposal over the running phrase instead of issuing Stop. Local index/descriptor caches warm later draws, expire after a day and are bypassed by Rescan. Cached source decoding, fragment measurements and waveform views are reused. Cold audio decoding and very large files can still delay the JavaScript scheduler.

Local `LibraryPreferences.json` and `LibraryCache.json` belong to the installed device folder and are excluded from release archives. Keep your linked audio available, and use Live’s Collect All and Save for exported WAVs.

### Replacement and display fixes in beta 10

Each layer’s **New sound** button targets that layer and replaces directly. Manual browser auditions remain reversible; use Cancel before switching if you want to restore the original. **New sounds from library** exits an old single-layer audition and refills the unlocked layers, respecting the configured refill count and sound locks. It does not inherit the generation target.

The collage display updates native overlays only when their layout changes. Playback animation is capped near 30 frames per second while audio scheduling retains its 5 ms interval.

### Keep a useful idea and develop it

- **New sound stays on the collage.** It immediately replaces only that layer, preserving its timing and treatment. Use Undo or Recent takes to recover the previous choice. Manual Browse retains its explicit reversible audition workflow.
- **Named palettes** collect folders under names such as Drums, Foley or Voices. Open Palettes / draw setup, type a name and press Enter, click Create palette, then Add folder. Assign a palette globally or per layer; Follow global and Whole collection are explicit choices. Definitions are included in saved sessions and remembered privately on the local machine. These are folder collections, not automatic semantic classifications.
- **More like this** generates nearby alternatives around a stable home phrase. Develop / explore controls Distance and Use current phrase as home. Existing foundations, protected hits and protected silence remain fixed; nearby variations change detail timing, accents, gates, occasional reversals and short replies. Repeated clicks do not accumulate ratchets. Hand edits, deletions and protection changes establish a fresh home so an older variation cannot undo your manual work.
- **Favor strong moments** weights measured energy/onset regions when making random or transient cuts. Explore anywhere keeps the original selection behavior. A layer can override the project preference. Explicit whole-recording and equal-division modes remain exact. No speech/instrument recognition is claimed.
- **Layer interactions** let detail layers answer heavy hits, leave their attacks clear, or end tails at the next heavy hit. Set the amount in Develop / explore, then Generate. Off preserves existing independent behavior.
- **Develop four-part section** uses the first 1–8 bars of the keeper for Introduction, Main phrase, Breakdown and Ending, yielding 4–32 editable bars. It preserves source regions and protected material, varies activity/accents, and adds ending treatment. Dense unprotected material is thinned evenly to respect the 1,024-event limit; development refuses a source with too many protected hits rather than dropping them. The existing Loop WAV, Layer stems and Send audio to Live actions export the full section with aligned starts and lengths.
- **Selected-layer feedback** shows its current fragment waveform and direction in the center of the wheel. Layer / sound opens a larger waveform, source bounds, gate and direct access to fragment editing, palettes and material filters.

Save the Recast session to retain the home phrase, named palettes, section labels, sounds and edits. Audio remains linked to its original paths. Recent takes is temporary; save keepers before closing.
