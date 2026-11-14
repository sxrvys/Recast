# Recast

**A free, open-source smart sequencer and sample collage instrument for Ableton Live.**

Turn a folder of recordings into a phrase worth building a track around. Recast pulls fragments from your samples, music and foley, arranges them across independent layers, and lets you reshape the result with repetition, movement, silence and damage. Keep a heavy pulse underneath or let the whole thing drift apart.

Generate an idea, replace a sound, protect the part you like, then edit everything else by hand. Recast is built for making discoveries you can keep—not just listening to an unpredictable loop you cannot recover.

**[Download Recast](https://github.com/sxrvys/Recast/releases)** · [User guide](MaxForLive/README.txt) · [Changelog](CHANGELOG.md) · [Report a problem](https://github.com/sxrvys/Recast/issues)

## Start making something

1. Open Recast on a MIDI track and click **Open Recast**.
2. Choose a phrase style, length and BPM. A bundled starter kit lets you generate and play immediately.
3. Adjust **Density**, **Fragment size**, **Movement** and **Wildness**, then click **Generate**. These controls shape the next generation; they do not continuously rewrite the playing phrase.
4. Point **Palettes / draw setup…** at your audio folders. **New sounds from library** refills eligible layers; a layer's **New sound** replaces just that layer while retaining its rhythm.
5. Keep a useful result, edit it in the **Step editor**, or send the loop or stems directly into Live.

The circular view shows layers from **outside inward**: Layer 1 is the outermost ring. Dots mark event starts; arcs show playback gates. The center shows the selected layer's current fragment and direction.

## Turn your library into material

Use up to **24 collage layers**, with up to **16 recordings per layer**. Load your own files, browse and audition manually, or draw replacements from named folder palettes such as Drums, Foley, Voices or Machinery. A layer can follow the global palette or use its own.

- Preview a candidate before committing it, or use **New sound** for a direct replacement inside the playing phrase.
- Filter draws by recording length, filename hints and measured sound character, including low energy, brightness, attacks, sustain and roughness.
- Prefer strong source moments using measured energy and onsets, or explore throughout the recording.
- Use random fragments, detected attacks, equal divisions or the whole recording.
- Choose weighted source selection, ordered cycling or a shuffled bag that uses every enabled cut before reshuffling.
- Keep a layer's sound while changing its rhythm, or lock the entire layer.
- Avoid active recordings, prefer files outside recent draw history, and optionally reject byte-identical copied files without deleting anything.

Everything runs locally. There is no account, sample subscription or upload service. Sound filters are practical hints and measurements, not speech recognition or instrument separation.

## Give the chaos a foundation

Open **Groove / develop…** and give each layer a rhythmic job, independent of its sound:

| Job | Placement it favors |
| --- | --- |
| **Pulse** | Beats 1 and 3 |
| **Backbeat** | Beats 2 and 4 |
| **Ticks** | Eighth-note pulse |
| **Free** | Collage placement |

**Coherence** favors recurring accents and recognizable placement. At zero it leaves the collage placement independent; at full strength, foundation anchors stay steady while the surrounding detail can misbehave. **Wildness** independently controls episodes of stutters, chokes, gaps, reversals, late answers and rushing or dragging motion.

Click **Generate with these settings** to apply the choices. The loaded sounds stay available, and generation respects the selected target and explicit locks. A door slam can carry the pulse, a voice can become the backbeat, and relay clicks can provide the nervous detail.

You can also place the foundation yourself. In the **Step editor**, click **+ Layer**, choose its sound through the layer label, and add hits wherever you want them. Protect the hits or lock their layer before generating around them.

## Generate, keep and develop

Choose short rhythmic hits, sparse fragments, microglitch or long drifting material. Enter a tempo or tap it, then build phrases up to **32 bars**.

- **Generate** makes a fresh phrase using the current controls. Optional focused actions change only rhythm, source regions, fragment order, pitch or damage.
- **Target** limits generation to the whole pattern, selected layer, current bar or selected passage. Empty space can be selected and protected too.
- **More like this** explores nearby variations around a home phrase. Distance controls how far the details move; repeated clicks do not recursively multiply rolls.
- **Develop four-part section** builds Introduction, Main phrase, Breakdown and Ending from a keeper, producing 4–32 editable bars.
- Layer relationships can leave room for heavy attacks, answer them, or end tails at the next anchor. Phrase tension can build, ebb or rupture across the pattern.
- **Recent takes** holds eight source-aware takes in the current device instance. Compare, return to the working phrase, or store a result in one of four persistent Keep slots.

During playback, prepared proposals switch at the next ready bar. Cold decoding and dense processing can still cause delays; the engine does not guarantee uninterrupted real-time performance with every source.

## Edit it like a sequencer

The Step editor exposes the generated phrase as an editable grid. Add or remove hits, drag them in time, select several hits or empty cells, and protect a passage—including its silence.

Per-hit and group controls include **velocity, gate, pitch, reverse and repeats**. Gates are expressed in sixteenth-note steps; repeats include doubles, triplets and short rolls. A waveform editor lets you trim the chosen source region and audition it in context. Follow mode distinguishes the sounding bar from the bar you are viewing.

Recast also includes a drum-pattern workspace with **13 rhythmic foundations**: Broken funk, Half-time weight, Driving syncopation, Straight backbeat, Four to the floor, Electro breaks, Two-step, Dub space, Slow crush, Motor pulse, Tresillo, Shuffle and Breakbeat. It constructs fresh motifs, supporting subdivisions, ghost notes, replies and fills. Pocket, Drunkenness and Glitch reshape timing, accents and interruptions, with targets and protection for deliberate control. Each instrument has a separate MIDI note; sample pools support round robin, weighted chance and use-all selection.

## Shape the sound

Use fragment duration ranges, per-hit gates, fades, pitch, reverse, probability, stereo balance and choking to turn the same source into very different material. Available processing includes flutter, filtering, bit reduction, drive, flanging, echo and reverb.

Optional source-key estimation and manual overrides can transpose recordings toward a shared major/minor key family. Noisy, sparse or changing-key recordings can produce uncertain estimates; untuned playback remains available.

Output controls include stereo-linked compression and an optional sample-peak safety ceiling. Preview level matching estimates energy and only turns louder candidates down. It is not perceptual loudness normalization or a true-peak mastering limiter.

## Bring it into Live

| Output | What you get |
| --- | --- |
| **Send audio to Live → Full loop** | One new audio track containing the rendered stereo loop |
| **Send audio to Live → Layer stems** | One new audio track per layer, with aligned starts and lengths |
| **Loop WAV** | One stereo WAV for resampling or sharing |
| **Layer stems** | Aligned stereo WAVs, the full mix and an export manifest |
| **Rendered-sound MIDI** | A MIDI clip with distinct processed fragments mapped to notes in this Recast instance |
| **Role MIDI / kit export** | Editable instrument-note rhythms and an ordered kit for further work; loading a Drum Rack is manual |

Audio exports are **16-bit / 44.1 kHz stereo** and include Recast's internal processing. Effects after Recast in Live are not included. Exported stems share the mix's gain and dynamics envelope so their balance is retained when recombined.

Audio handoff appends tracks in Arrangement at the beginning of the current playhead bar. WAVs remain unwarped; match Live's BPM to Recast for bar alignment. Recast's preview transport uses its own tempo and does not change the Live Set's tempo. Use Live's **Collect All and Save** to collect linked exports into your Set.

## Save your work

Save the Live Set for device recall, or use Recast's **Save / Open** for a JSON session containing the phrase, source choices, settings, edits, palettes and Keep slots. Audio remains linked to its files; saving a session does not copy or embed the recordings. Collection and relinking tools help when moving material.

Recent takes is temporary. Save a session or Keep a phrase you want to revisit. Retain the installed support files and generated `Rendered` audio used by your projects.

## Install

Recast requires **Ableton Live with Max for Live available and authorized**. Development and native testing use macOS and Live 12 Suite; Windows and other Live versions are unverified.

1. Download and extract the ZIP from [Releases](https://github.com/sxrvys/Recast/releases).
2. Copy the **entire Recast folder** into your Ableton User Library, for example `Presets/Instruments/Max Instrument/`.
3. Keep `Recast.amxd`, its JavaScript support files, voice patcher, **Starter Kit** and writable **Rendered** folder together.
4. Find **Recast.amxd** in Live's browser and drag it onto a MIDI track. Click **Open Recast** in the compact device panel.

No terminal, Python, Node.js or external download tools are required to use the release. For updates, preserve your own rendered audio and private library settings while replacing the distributed support files.

The bundled one-shots are original synthesized sounds included under the MIT license. Your samples and commercial libraries are not distributed with Recast.

## Practical limits

- Collage supports up to 24 layers and 1,024 events per pattern. The role-based drum workspace supports six core instruments and up to six additional instruments.
- Simultaneous voices are a separate playback budget from layers. Long tails and overlapping loop boundaries consume voices; the physical voice pool is 32.
- Library indexing is bounded at 50,000 files. Whole recordings decode into memory, so shorter recordings and sensible draw limits help responsiveness.
- WAV, AIFF, MP3 and FLAC loading has been exercised inside Live. Other formats depend on Max's decoder support.
- Rendered-sound MIDI has a finite note bank shared with instrument reservations. It reports exhaustion rather than silently replacing exported sound mappings.
- Audio remains linked to source paths. Renamed files, disconnected drives and moved folders may require relinking.

Recast is an experimental instrument. Automated checks and native Live testing cover core workflows; musical results and unusual combinations still benefit from hands-on feedback.

## Build and contribute

The instrument uses Max JavaScript/JSUI, LiveAPI and a polyphonic voice patcher. With Python 3 and Node.js 18 or later:

```sh
npm test
python3 tools/build.py --zip
```

No npm or Python package dependencies are required. The build creates `dist/Recast/Recast.amxd`, support files and a release ZIP. Starter sounds are generated deterministically; private library preferences, caches, personal media and test callbacks are excluded.

See the [architecture notes](docs/ARCHITECTURE.md) and [rhythm design notes](docs/RHYTHM.md). GitHub Actions runs portable tests and builds the device; native playback and LiveAPI checks require Ableton Live.

For [bug reports](https://github.com/sxrvys/Recast/issues), include your Live and Max versions, operating system, reproduction steps and expected behavior. Contributions should explain the musical or workflow problem, include relevant tests, and describe Live testing performed.

## License

Recast's source and bundled starter sounds use the [MIT License](LICENSE). Use, modify and share them. Ableton Live and Max for Live are separately licensed; samples you load retain their own rights and licenses.

Created by **Scott Rogers**.
