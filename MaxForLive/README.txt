RECAST — SMART SEQUENCER / SAMPLER

START
Load Recast on one MIDI track in Live. Its compact 200px device strip opens the instrument with Open Recast. The editor does not open automatically.
Choose a style, choose a pattern length, then Generate. Browse a WAV/AIFF for each active kit role, or drop a file onto its sample name. Play auditions the generated pattern, never a hidden reference recording.

GROOVE
The three starting styles use coordinated kick, snare and hat phrases with complementary bars. New KICK / SNARE / HAT / PERC / TEXTURE / BASS changes that role independently. Lengths are 1, 2, 4, 8, 12 or 16 bars. Type BPM in the number field or use Tap.
Detail controls ghost-note generation. Apply pocket changes timing and accents only. Apply damage adds interruptions, ratchets, reversals, gates and choking. Target chooses the affected lane; Scope chooses the pattern, last beat or Shift-selected passage. Keep as base makes the current rhythm the starting point for subsequent shaping; Restore base returns to it. New fill works at the phrase ending or selected passage. Develop phrase builds a recurring main idea, an answer and a fill across four-bar sections. Undo restores the previous pattern.
Tools → Develop patterns offers replies, five variation families, scope and role protection. Tools → Instability offers stagger, trip, sputter, strangle, drag, recovery, clustering and anchor strength.

EDIT
Choose Add/remove for one-click note on/off. Edit hit selects without altering a note; Previous/Next hit reaches overlapping hits. Choose Repeats and click a step to cycle 1 → 2 → 3 → 4 → 1. Three means a triplet burst inside that sixteenth-note cell. Numbers in cells count their hits, including non-grid hits grouped for display; they do not indicate velocity or MIDI pitch.
Select/edit opens the inspector without changing notes. Cmd-click adds or removes steps from a selection; dragging selects a rectangle of steps. The velocity strip sets all selected hits to a value from 1–127; +/− changes them relative to their existing accents. Pitch, gate, reverse and choke edits apply to the full selection, excluding protected hits. Move to lane reassigns the selection. The grid shows velocity height, repeat subdivisions, gate lengths, reverse arrows and protection marks. Reverse changes that hit, not the lane sample. Tools → Develop patterns → Reverse chance lets generated damage reverse unprotected non-anchor hits. It starts at 0%.
Move lets you drag selected hits together; Option-drag copies them. Their velocity, microtiming, pitch, gate, reverse, choke, envelope and sample overrides travel with them. Protected, occupied or out-of-range destinations cancel the whole move. Cyan outlines preview valid destinations; red outlines indicate a blocked move. The inspector’s −5 ms / +5 ms buttons nudge the full selection.
Edit menu offers an empty pattern (keeping the kit), select bar/all, copy, cut, paste, duplicate selection, duplicate bar, clear bar and redo. For paste, click the destination grid cell first, then Paste. Duplicate selection places its copy immediately afterward; Duplicate bar inserts a bar and shifts later notes, drawn regions and protected gaps together. Clear bar keeps protected material. Undo/Redo restores musical edits; a new edit clears redo history.
Protect locks hits or an empty step. Shift-click the first and last steps of a passage, then protect it in Develop patterns. Protection includes silence. Variation scope also applies to the main damage controls.

SOUND / INTERRUPTION
Tools → Hit envelope has attack/release, looped sustain, flutter, drawn gate levels and low/high-pass filtering. Sustain loops the chosen sample region with short crossfades; it is limited to 16 seconds per hit.
Tools → Draw interruptions provides per-role and whole-kit regions independent of note timing. Draw a region, drag either edge, then set depth, attack, release, curve and effect. Effects: mute/duck, low-pass, high-pass, bit crush, drive, flanger, delay and a short feedback reverberation. These are original lightweight processing algorithms, not copies of another plugin. Effects operate inside the existing tail; draw/sustain enough audio to hear them. Explicit locks are exempt; kick/snare attack protection is optional.
Click an instrument card to choose the target for the shared Browse, Hear, Candidate folder and Previous/Next controls. Candidate replacement keeps the pattern playing; Level match compensates using a short RMS/peak estimate rather than a perceptual loudness model.

+ Instrument adds up to six extra foley lanes (12 instruments total), each with its own sample and MIDI note. Core/Extra instruments switches the visible bank. Extra lanes use MIDI 127 downwards; Recast refuses to take a note already used by a saved rendered sound. New-lane generation uses an alternating percussion phrase.

Samples support gain, pitch, preparation/trim, normalization, candidate folders, in-context replacement, saved sound sets and library filtering. Pitch is tape-style; changing it changes speed/duration. Separate granular stretching is a texture tool, not transparent time correction.

COMPARE
Compare keeps your working groove alongside Pocket, Broken and Space alternatives. Choosing a version queues it for the next bar during playback. Preview matching only turns louder estimates down. Keep commits the chosen version; Undo returns to the preceding groove. Regenerate changes one alternative while retaining the others. Your working pattern is the export source until you Keep a comparison.

IDEAS
Tools also contains saved grooves, saved fragments, A/B comparison, alternative takes, voice/bass phrases, arrangement, collection and relinking. Saved grooves retain sounds and settings. Use selected-passage protection to preserve an idea while developing its surroundings.

MIDI / AUDIO
Send / Export → Editable MIDI to Live creates a clip in an empty Session slot on the same track; it does not overwrite existing clips. Six fixed role notes: kick 36, snare 38, hat 42, perc 39, texture 46, bass 43. Variation-family clips use the same mapping. Set Live to the intended BPM for host playback.
Ordinary role MIDI carries timing, velocity and note length. It does NOT encode reverse, per-hit pitch, drawn filters, audio interruption envelopes or other rendered processing. Render audio to retain the complete sound. Recast audition/WAV includes its internal processing, not downstream effects in Live. Use Live recording/freezing for those.
Send / Export also offers Rendered-sound MIDI to Live. This freezes each distinct processed sound onto an additional MIDI note in the same Recast instrument. These notes avoid the six role pitches, so ordinary and rendered-sound clips coexist. Reverse, pitch, envelopes and drawn interruption processing are baked into these sounds. Changing a MIDI note changes which frozen sound plays; edit a sound in Recast and write a new clip to change its processing. The bank holds 122 distinct rendered sounds per instance and keeps older clips available. Save your Live Set or Recast session to retain that bank.
Editable kit export writes six role samples with the matching fixed-note MIDI and a note-map JSON; sample filenames include their actual note numbers. Load each sample onto that named Drum Rack note. Detailed pad export instead uses individual rendered sound combinations and its accompanying sequential MIDI mapping; it is separate from the six fixed-note handoff. Drum Rack import is manual, not automatic. Pitched phrase export intentionally creates a separate MIDI track for another instrument.

SAVE
Save the Live Set to retain device state. Save/Open also provides JSON session backups. Audio is linked to its file paths; it is not embedded. Collect/relink copies referenced audio with a session for relocation. Keep source files available until collection is complete.

VERIFICATION / LIMITS
Generated playback and fixed-role MIDI playback have produced real audio in Live. MIDI note timing, velocity and durations have been read back and compared. A host save/open test restored the kit, events, reverse probability and interruption regions; WAV tests confirmed a drawn mute becomes silence. Regression suites cover timing bounds, locks, repeats, scoped generation, DSP effects and editing.
This is a test build. Not every advanced UI combination or dialog has had a complete interactive pass. There are three starting style families, six fixed roles and a 1024-hit pattern limit. No claim is made of complete parity with Choke or of a subjective guarantee that every generated rhythm will be musical.

HANDOFF CHECKPOINT
Rendered-sound MIDI uses a separate persistent note bank rather than clip-ID guessing. Ordinary kit clips keep their original role notes. This avoids first-note races when starting a clip and does not depend on the currently selected clip.
The Live handoff test captured repeated note playback with the rendered bank active for every note, including the first. The gate region was silent in both bounce and MIDI-driven capture. Editable kit export was checked for six correctly mapped, 44.1 kHz / 16-bit WAVs.

DRUM RACK READY EXPORT
Send / Export → Drum Rack ready kit + MIDI writes eleven WAV pads for notes 36 through 46, plus fixed-role MIDI and a note-map JSON. Select only that export's WAVs, sort by filename, and drop them together onto C1 in an empty Drum Rack. Silent EMPTY files fill unused notes so the six role assignments line up without placing sounds individually. Do not hold Command while dropping; Live uses that modifier for layering. Creating/loading the empty Drum Rack is still manual. This exports the editable role kit; use rendered-sound MIDI or WAV for per-hit processing.
Reference: https://www.ableton.com/en/manual/instrument-drum-and-effect-racks/#pad-view

RELIABILITY CHECKPOINT
Installed builds disable development hot reload. A new native picker action clears any canceled relink, collect or candidate-folder destination before opening. Audio exports check for a groove and assigned sounds before opening a destination picker. Replacing a role's sample updates both the playing pattern and its generation bases while retaining protected sounds. The retired reference-waveform drop areas are hidden.

RECALL
Live Set recall accepts native Dict objects and dictionary-name messages. Sampler initialization retries while parent buffers are loading; unavailable audio is reported for relinking. The current rebuild has passed a read-only save/unload/reopen check for event state, extra instruments, comparison options, rendered-note bank and loaded sample buffers.

INTERFACE
The shared interface uses charcoal panels, restrained amber highlights, DIN/Helvetica typography, cached kit waveform thumbnails and hover explanations. Instrument target, time scope, gate duration and choke group use explicit menus. Full sample removes a gate-length override. The compact Open Recast control is exposed to Live accessibility; zero/initialization messages do not open the workshop.

DETAILED COMPARISON
The comparison cards show the same bar across all four versions, with bar navigation and a whole-phrase overview. Gray reference ticks show Current; hit height shows velocity; horizontal tails show explicit gates; blue lines show timing shifts; < marks reverse. Six core roles have separate rows, with extra instruments grouped under +FOLEY. Change summaries count additions/removals, timing moves, accents, gates, direction and pitch across the full pattern. Matching is an estimate. Protected material is reconciled during audition as well as Keep. Broken adds non-timing disruption when the target permits it; Space removes detail while preserving the foundation. Zero controls or a fully protected target can correctly produce an unchanged alternative.

ACCEPTANCE FIXES
Assigned samples no longer require legacy reference-slice data to play, including a new extra lane created before main-kit generation. Level match Off survives session recall. Editable MIDI uses processed sample duration for extra instruments, retains short gates and applies cross-lane choke limits. Role MIDI still cannot reproduce arbitrary audio processing; use rendered-sound MIDI or WAV for that.

SAMPLE POOLS
Click Pools in the main header. Choose a lane and Add sample (WAV / AIFF); up to 16 sounds belong to each lane. Add current lane sound includes the existing one-shot. Round robin cycles in order. Weighted chance draws independently with relative weights: 300 is three times as likely as 100; 0 excludes a sound. Use all / no repeat consumes every enabled sound before another shuffled bag and avoids immediate repeats across bag boundaries. Pool-only lanes can play without a separate base sample. Each lane still has its own MIDI note. Disabled/all-zero pools fall back to the lane sample, if one is assigned.
Replacing/removing pool entries does not delete audio. Pools, weights and modes are saved with the session and participate in undo. Existing explicit per-hit sources and frozen sounds retain their source; protected pool-only notes use an available fixed choice.

TENSION / RELATIONSHIPS
Movement opens a 16-point phrase-wide tension curve. Draw to build and release pressure; depth and target are independent. Tension shortens gates, shifts timing, introduces omissions, bursts and occasional reverse while retaining foundation/locked hits and protected gaps. It reshapes playback without rewriting the working grid.
Up to four relationships connect a trigger lane with another lane: Duck shapes its tails during a chosen window; Answer adds a quieter delayed reply; Interrupt cuts a tail at the trigger. Source, target and behavior use visible menus. An answering lane needs a sample or pool. Changes can be frozen into editable notes.

MALFUNCTION
While playing, hold HOLD: MALFUNCTION on the Movement screen. The effect grows while held; release recovers on the next beat or bar. Choose its target there. Record gesture stores quarter-beat control segments for subsequent passes (up to 64 segments); Clear recorded gestures removes them. Heavy anchors and explicit protections remain intact. The exact triggered result can be kept through recovery. It is not a recording of downstream Live FX.

RECOVER / FREEZE
Recover retains up to 32 bars / 4096 triggered hits while the device is loaded. Last bar / 2 / 4 / 8 recovers completed bars on their original grid; if fewer complete bars exist, the available passage is retained. Recovered notes include chosen sources, movement and interruption settings; they are editable and undoable. This rolling history is temporary and clears on a new playback or session load.
Freeze performance keeps the current realization’s sample choices and movement as fixed notes. For an evolving live gesture, Recover is the way to retain what was actually heard. Freeze uses the current pass, not a freshly randomized export. Exports direct you to Freeze first whenever live pools/movement are active; Send / Export also has a Freeze button. Undo restores the live setup. Frozen notes do not follow subsequent pool changes; regenerate or undo the freeze to return to live choices.
Rendered-sound MIDI or WAV retains the exact frozen sound. Editable role MIDI retains rhythm and one note per lane; a live pool can choose new samples when those notes play. Editable base-kit export does not encode an entire multi-sample pool.

DIRECT GRID EXPRESSION
Edit menu → Tool: drag gate lengths: drag a filled step horizontally; the selection changes together. Gate tails appear on the grid. Tool: paint velocity: vertical position within a row sets the selected accents; drag through filled cells to paint others. Tool: stretch selected burst: select hits first, then drag horizontally to compress/expand their relative timing and explicit gates. Each gesture is one undo. Protected/occupied/out-of-bounds destinations block stretching. Frozen interruption regions travel with moved, copied and stretched hits.

The main grid adds beat dividers, a moving playhead and a small per-bar density overview. The new functions use dedicated Pools, Movement and Recover screens to keep the editor focused. Dense DSP and newly encountered sample/effect combinations can still require preparation; no hard real-time timing guarantee is made.

BETA 3 WORKFLOW
Browse now opens the integrated sample browser. Choose your library folder once; then browse folders or search filenames. A single file click previews it. Assign commits to the chosen lane; Add to pool adds a candidate to its sample pool. In groove auditions a candidate temporarily while the pattern plays. Returning to the pattern cancels that audition.

Generate creates a new foundation; Another take develops the existing base. Pocket and Damage reroll a treatment instead of accumulating more subdivisions. Lane pockets sets independent offset, swing, timing spread and accents. Lock the kick there to regenerate around it. New malfunction changes a selected passage or a 4/8/16-step window and leaves the surrounding groove alone.

Select one or several steps and open Gate. One step is a sixteenth note; choices include 1, 3 and 16 steps. Full sample removes the gate. Gates limit playback; short samples need sustain to play longer. Choke rules can shorten a tail. Fixed-role MIDI retriggers one voice per lane; use rendered audio or rendered-sound MIDI for overlapping tails.

BETA 4: BROWSING AND INSTABILITY
The sample browser has folders on the left, a scrolling file list in the middle, and preview/assignment on the right. Back/Forward remember folder visits; Up and the path buttons navigate parents. Single-click previews, double-click assigns; neither changing folders nor previewing changes your kit. Favorites are limited to your chosen library. Search scans WAV/AIFF filenames within that library; very large libraries can take time to index. Scrollbars and mouse/trackpad scrolling move through the lists.

Main Drunkenness controls timing; Glitch controls structural disruption. Apply damage generates variable-length episodes of stumble/recovery, missing hits and late answers, shaped bursts, interruptions, shifted fragments and breakdowns. Settings opens four common sliders; expand Behavior mix for relative behavior likelihoods (zero disables a family) and gate tightness. Detail bias favors hats/perc/textures; anchor protection preserves generated kick/snare anchors. Explicit locks and protected silence always win. Consecutive Apply clicks reroll from the same input instead of recursively multiplying repeats.

Feel / instability now uses direct sliders: Timing sway, Late lean, Uneven repeats and Tail cutting. More feel controls expands the detailed settings. Select which lanes should stay steady, adjust controls, then Generate a new take. Use current as input deliberately establishes a new base; Make space generates a sparser result. These are settings for generating fixed editable notes, not live automation knobs.

Hover buttons or slider labels/tracks for explanations in the bottom-left footer. Leaving a control restores the ordinary status message.

BETA 5: MUSICAL FOUNDATIONS
The style dropdown now has 13 foundations, each with a short description: Broken funk, Half-time weight, Driving syncopation, Straight backbeat, Four to the floor, Electro breaks, Two-step, Dub space, Slow crush, Motor pulse, Tresillo, Shuffle and Breakbeat. Selecting one does not replace your notes; Generate creates a new foundation. All remain 4/4.

The added grammars coordinate fixed kick cores, optional syncopated kick choices, backbeats, quieter snare ghosts, hat subdivisions/accents and restrained phrase endings. A main motif recurs with an answering bar. Shuffle writes its long/short timing into the notes; it is not only a label or an audio effect. Breakbeat favors syncopated kicks, more ghosts and accented hat detail. Detail scales optional activity. Drunkenness, Glitch, step editing, sample pools and MIDI output work on every foundation. Use protection to retain the foundation while damaging the details.

These are authored musical rules, not a trained AI or a comprehensive representation of each named genre. The original three saved style indices are unchanged.
