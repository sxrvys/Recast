# Audio parity status

Reference: [PHRZ's public feature comparison](https://nokbeats.com/tools/phrz), checked November 13, 2026. This records functional coverage, not equivalent algorithms, sound or performance. Recast is independently implemented.

| Area | Recast status |
| --- | --- |
| Layered sample collage | Implemented: up to 24 layers, multiple recordings per layer. |
| Independent cuts / rhythm / fragment ordering | Implemented with separate seeded decisions. |
| Cut modes and ranges | Random windows, equal divisions, energy-onset cuts, whole-source mode; attack preference and sensitivity. |
| Envelopes and gates | Fades, playback-gate ranges, choking and detailed per-hit articulation. |
| Phrase length / grid / offset | Up to 32 bars, straight/triplet grids and source-preserving rotation. |
| Layer density / structure / chance | Implemented; separate mute, solo, lock, gain and stereo balance. |
| Four phrase keeps | Compatible source-aware Keeps prefetch while playing and switch at the next ready bar without stopping the engine. Cold files and changed kits can still require preparation. |
| Key sync | Approximate multi-window recording-key estimates, automatic/manual targets and source-key overrides. Uncertain recordings are left unchanged. |
| Output dynamics | Linked peak-envelope compressor; matching equations in live DSP and offline export. |
| Metronome | Separate internal synthesized click, excluded from musical exports. |
| WAV and stems | Full loop and aligned layer WAVs with shared gain/compression and an export manifest. |
| Local project recall | JSON and Live-device state. Source recordings remain linked to their paths. |
| Random source retrieval | User-selected local folders, per-layer roots, filename-hint recipes, preserved discoveries, active-file exclusion and saved recent-history preference. WAV/AIFF duration preflight. Online CC0 retrieval is intentionally omitted for this workflow. |
| Image/video collage and MP4 | Explicitly excluded from this audio-only project scope. |
| VST3/AU portability | Recast remains a Max for Live instrument. |

## Material limits

Whole recordings decode into memory. Key confidence is a heuristic; testing on controlled chord progressions does not establish accuracy for arbitrary music. Pitch changes use tape-style speed changes. Exports truncate tails at the selected loop boundary and omit effects placed after Recast in Live. Voice reservations are conservative. New phrases, cold-source loading and some processing require preparation, so responsiveness differs from an audio engine designed for continuous regeneration.

The existing smart drum sequencer, MIDI handoff, manual grid editing, Foley pools, gates, ratchets and instability tools remain available beside the collage workflow.

## Local draw limits

Type hints use filenames and folder names; they do not identify a voice or machine from sound. No-match layers retain their current sound. Recent history stores up to 256 paths in device/session state. Exact path repeats are avoided within the active collage; renamed or copied duplicates are not yet detected by content. Duration preflight covers RIFF WAV and AIFF/AIFC common chunks, with decoder fallback for unknown containers. Header parsing is bounded to 128 chunks. Rescan clears cached metadata. Drawing stops playback while preparing replacements; it is not a seamless live file-streaming engine.
