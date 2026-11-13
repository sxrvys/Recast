# Rhythm generation and rerolls

Recast is a rule-based generator, not a trained audio model or an automatic drum transcription system.

## Construction

A 4/4 foundation is assembled in sixteenth-note positions. A kick motif establishes the downbeat, subsequent placements favor characteristic positions, crowded kick runs are discouraged, and competing snare backbeats reduce kick placement weight. The answer changes part of the motif while retaining its identity. Snares keep a normal or half-time backbeat; quieter ghosts complement it. Hats establish a recurring subdivision with lighter intervening detail. Phrase endings can introduce a pickup.

Position profiles aggregate instrument rows from selected sections of Paul Wenzel’s *Pocket Operations*, revision 3.1. The original three families use 370, 132 and 83 extracted instrument rows respectively; these overlap and are not counts of unique patterns. Profiles use smoothed position frequencies, not named pattern transcriptions. The half-time backbeat, density limits, spacing and answering rules are explicit design choices rather than claims inferred automatically from those statistics.

The scanned *260 Drum Machine Patterns* and Roland *Drum Machine Rhythm Dictionary* were inspected visually for notation, instrumentation, accents and fill development. Their entire pattern catalogs have not been digitized. Their grid examples reinforce the distinction between hit placement, sound assignment, accents, rests and embellishments. PDFs and scanned pages are not distributed with Recast.

This is a limited starting grammar, not a claim to model every style represented by the books. Statistical plausibility and test coverage do not establish musical quality; listening and adjustment remain essential.

## Pocket and damage

Pocket makes correlated timing and accent changes. Damage chooses fresh windows, early/late motion, gates, reversals and shaped ratchets. Off-grid positions remain floating-point beat positions and carry into MIDI.

Consecutive clicks on Pocket or Damage reroll the input preceding that treatment. They do not repeatedly transform generated output. An event edit or change of target, scope or protection establishes a new input. Snapshots include the reroll input so Undo and save/recall retain this behavior. Comparison generates alternatives without changing it.

Damage-generated repeats are marked and cannot recursively spawn more repeats. Additions have a local density budget and the overall event budget remains 1,024. Existing manual hits are not deleted merely to satisfy a generated-repeat budget. A pre-existing runaway pattern is best repaired with Undo, Restore base or Generate, rather than guessing which of its notes the user intended to keep.

Develop phrase keeps the opening bar and constructs later variations, answers and fills. It does not repeatedly subdivide the previous ending. Sample assignments, protected hits and protected silence survive generation.

## Expanded foundations

Ten authored grammars supplement the original three profiles; they are not additional book transcriptions. Straight backbeat centers kick pulses and 2/4; Four to the floor and Motor pulse retain quarter-note kick cores but use different hat behavior. Electro breaks and Two-step favor different angular/skipped kick choices. Dub space centers kick/snare on beat three with sparse hats; Slow crush keeps a heavy downbeat against a beat-three snare. Tresillo retains the 3+3+2 eighth-note kick cycle. Shuffle delays the second eighth of each beat by a generated consistent amount. Breakbeat uses a larger syncopated kick vocabulary, more snare ghosts and accented hat detail. Names describe starting tendencies, not comprehensive models of their genres.

Each grammar builds a motif and complementary answer. Optional kick notes vary within permitted positions; crowding and snare collisions reduce candidate weights. Ghost notes are quieter than backbeats and less likely beside kick attacks. Hats have their own pulse, optional subdivisions, accents and gates. Phrase-ending pickups and hat gaps are restrained before the separate damage engine is applied. Density changes optional activity; fixed cores remain. Protected hits/lanes and protected silence override generation. Existing style indices 0–2 retain their meaning for saved sessions.

All new foundations remain 4/4. A limited rule-based grammar cannot replace a drummer's judgment or guarantee a compelling take. It generates editable proposals without training, network access or style-specific audio.

## Additional reference review

A user-supplied 20-page excerpt of Mike Adamo's *The Breakbeat Bible* was reviewed as text, with representative notation pages inspected visually. It includes prefatory material and a chapter excerpt on consecutive snare sixteenths, ghost/ghost pairs, accented-to-quiet control strokes, quiet-to-accented pull-outs, and eight-bar phrase development. This is not the complete book and its catalog has not been transcribed into Recast. These paired-accent and phrase concepts are useful candidates for a later refinement; this review does not claim that beta 6 implements them. The PDF is not distributed.
