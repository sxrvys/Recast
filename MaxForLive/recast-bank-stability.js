// Exported MIDI notes keep their sound even when the visible instrument layout changes.
function recastInstrumentNotes(n){return [36,38,42,39,46,43].concat((n.extraInstruments||[]).map(function(row){return row.note;}));}
function recastPinRenderedBank(n){var count=(n.renderedNotes||[]).length,pins=(n.renderedBankPitches||[]).slice(0,count),notes=recastInstrumentNotes(n);if(pins.length<count){var available=[];for(var note=0;note<128;note++)if(notes.indexOf(note)<0)available.push(note);for(var i=pins.length;i<count;i++)pins.push(available[i]);}n.renderedBankPitches=pins;return pins;}
var recastBankDefaults=defaults;defaults=function(n){n=recastBankDefaults(n);recastPinRenderedBank(n);return n;};state=defaults(state);
var recastBankSync=syncInstruments;syncInstruments=function(){recastBankSync();var pinned=recastPinRenderedBank(state);renderedPitches=pinned.concat(renderedPitches.filter(function(note){return pinned.indexOf(note)<0;}));};syncInstruments();
var recastBankWrite=writeRenderedMidi;writeRenderedMidi=function(){var result=recastBankWrite();if(result)state.renderedBankPitches=renderedPitches.slice(0,state.renderedNotes.length);return result;};
function recastBankConflict(snapshot){if(!snapshot)return false;var pins=recastPinRenderedBank(state),desired=recastInstrumentNotes(snapshot);return desired.some(function(note){return pins.indexOf(note)>=0;});}
function recastBankConflictMessage(){say('This instrument layout uses a note reserved by an exported MIDI sound. Load that Keep in a new Recast instance.');}
var recastBankSnapshot=applySnapshot;applySnapshot=function(n){if(recastBankConflict(n)){recastBankConflictMessage();return;}recastBankSnapshot(n);};
var recastBankWarmStart=collageWarmStart;collageWarmStart=function(index){if(recastBankConflict(state.collage.keeps[index])){recastBankConflictMessage();return false;}return recastBankWarmStart(index);};
var recastBankRecall=collageRecall;collageRecall=function(index){if(recastBankConflict(state.collage.keeps[index])){recastBankConflictMessage();return false;}return recastBankRecall(index);};
var recastBankAction=action;action=function(id){if(/^collageRecall:\d+$/.test(id)&&recastBankConflict(state.collage.keeps[Number(id.split(':')[1])])){recastBankConflictMessage();return;}recastBankAction(id);};
