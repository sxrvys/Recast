# Recast

**A free, open-source smart sequencer and sampler for Ableton Live.**

Recast generates a drum pattern, lets you give it a kit of your own sounds, and gives you ways to pull it apart without losing the groove. A metal door can be the kick. A relay can be the hat. A voice can become a short, choked interruption or a sustained texture.

Start with a recognizable rhythm, change its pocket, add instability, and keep the accidents worth developing. The result can become editable MIDI in Live or rendered audio for further chopping.

**[Download Recast](https://github.com/sxrvys/Recast/releases)** · [User guide](MaxForLive/README.txt) · [Report a problem](https://github.com/sxrvys/Recast/issues)

Recast is an experimental Max for Live instrument. It has automated regression tests and has been exercised inside Live, but it is still being tested in real musical use. Feedback, fixes and contributions are welcome.

## What it does

### Generate a foundation

- Coordinated kick, snare and hat patterns, with **13 starting foundations**: Broken funk, Half-time weight, Driving syncopation, Straight backbeat, Four to the floor, Electro breaks, Two-step, Dub space, Slow crush, Motor pulse, Tresillo, Shuffle and Breakbeat.
- Quick pattern lengths of **1, 2, 4, 8, 12 or 16 bars**.
- Each Generate click constructs a kick motif, complementary answer, hat subdivision and supporting ghost-note placement within the selected style. The original three families combine musical constraints with aggregate position tendencies from reference examples; the ten additional foundations use authored rules for kick cores, backbeats, hat articulation, ghost-note space and phrase endings. Shuffle adds long/short timing directly to the generated notes. It does not select named patterns from a bundled book library. See [the rhythm design notes](docs/RHYTHM.md).
- Regenerate an individual instrument from the Edit menu while keeping the others.
- Build replies, fills, related variations and developing phrases.
- Enter a BPM directly or use tap tempo.

### Keep the groove; change its behavior

**Pocket** adjusts timing and accents. **Drunkenness** controls shared timing drags and recoveries; **Glitch** controls structural disruption. **Apply damage** creates episodes of stumbles, missing footsteps, uneven bursts, choked interruptions, displaced fragments and breakdowns, with occasional reversals. You can target an instrument or passage, protect your foundation, and preserve empty space as deliberately as the hits.

**Apply pocket** and **Apply damage** reroll their preceding input while you explore consecutive takes. They do not repeatedly process their own output. Editing the notes or switching the target/passage establishes a new input. Undo compares takes; generated damage repeats cannot spawn further rolls. **Develop phrase** retains the opening bar and creates fresh later variations, answers and fills.

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
4. Try **Apply pocket** for timing and accents, then **Apply damage** for disruption. Use a target or selected passage to keep the changes focused.
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
- Rendered-sound MIDI has a finite note bank: up to 122 distinct sounds, reduced by additional instrument lanes. Older mappings are retained; bank exhaustion is reported.
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
