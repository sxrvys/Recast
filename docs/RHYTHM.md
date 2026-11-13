# Rhythm generation and rerolls

Recast is a rule-based generator, not a trained audio model or an automatic drum transcription system.

## Construction

A 4/4 foundation is assembled in sixteenth-note positions. A kick motif establishes the downbeat, subsequent placements favor characteristic positions, crowded kick runs are discouraged, and competing snare backbeats reduce kick placement weight. The answer changes part of the motif while retaining its identity. Snares keep a normal or half-time backbeat; quieter ghosts complement it. Hats establish a recurring subdivision with lighter intervening detail. Phrase endings can introduce a pickup.

Position profiles aggregate instrument rows from selected sections of Paul Wenzel’s *Pocket Operations*, revision 3.1. The three families use 370, 132 and 83 extracted instrument rows respectively; these overlap and are not counts of unique patterns. Profiles use smoothed position frequencies, not named pattern transcriptions. The half-time backbeat, density limits, spacing and answering rules are explicit design choices rather than claims inferred automatically from those statistics.

The scanned *260 Drum Machine Patterns* and Roland *Drum Machine Rhythm Dictionary* were inspected visually for notation, instrumentation, accents and fill development. Their entire pattern catalogs have not been digitized. Their grid examples reinforce the distinction between hit placement, sound assignment, accents, rests and embellishments. PDFs and scanned pages are not distributed with Recast.

This is a limited starting grammar, not a claim to model every style represented by the books. Statistical plausibility and test coverage do not establish musical quality; listening and adjustment remain essential.

## Pocket and damage

Pocket makes correlated timing and accent changes. Damage chooses fresh windows, early/late motion, gates, reversals and shaped ratchets. Off-grid positions remain floating-point beat positions and carry into MIDI.

Consecutive clicks on Pocket or Damage reroll the input preceding that treatment. They do not repeatedly transform generated output. An event edit or change of target, scope or protection establishes a new input. Snapshots include the reroll input so Undo and save/recall retain this behavior. Comparison generates alternatives without changing it.

Damage-generated repeats are marked and cannot recursively spawn more repeats. Additions have a local density budget and the overall event budget remains 1,024. Existing manual hits are not deleted merely to satisfy a generated-repeat budget. A pre-existing runaway pattern is best repaired with Undo, Restore base or Generate, rather than guessing which of its notes the user intended to keep.

Develop phrase keeps the opening bar and constructs later variations, answers and fills. It does not repeatedly subdivide the previous ending. Sample assignments, protected hits and protected silence survive generation.
