// Prepare compatible source-aware Keeps off the running clock, then swap at a bar boundary.
var collageWarmJob=null,collageWarmReady=null,collageWarmJustSwitched=false,collageWarmSwitchCount=0;
function collageWarmCancel(){if(collageWarmJob)collageWarmJob.cancel();collageWarmJob=null;collageWarmReady=null;collageQueuedKeep=-1;}
function collageWarmCompatible(snapshot){return snapshot&&snapshot.collage&&snapshot.events&&snapshot.events.length&&JSON.stringify(snapshot.paths)===JSON.stringify(state.paths)&&snapshot.events.every(function(e){var source=e.frozen||e.source;return e.collage&&source&&source.index>=7;});}
function collageWarmStart(index){
    var snapshot=state.collage.keeps[index];collageWarmCancel();if(!collageWarmCompatible(snapshot))return false;
    var current=state,prepared=copy(state);for(var field in snapshot)if(snapshot.hasOwnProperty(field))prepared[field]=copy(snapshot[field]);prepared=defaults(prepared);prepared.archivePaths=current.archivePaths;prepared.renderedNotes=current.renderedNotes;
    var refs=collageArchiveReferences({events:snapshot.events}),indices=Object.keys(refs).map(Number),bufferAt=0,eventAt=0;
    collageWarmJob=new Task(function(){var old=state,context=renderEventContext,reservations=collageReservations,plan=collagePlanCache;
        try{
            state=prepared;renderEventContext=prepared.events;
            if(bufferAt<indices.length){var slot=indices[bufferAt++],path=prepared.archivePaths[slot];if(!path)throw Error('Keep source is not registered.');collageSourceBuffer(path);}
            else if(eventAt<prepared.events.length)sound(prepared.events[eventAt++]);
            else {collageReserveVoices(prepared.events);collageWarmReady={index:index,state:prepared};collageQueuedKeep=index;collageWarmJob=null;status='Phrase '+(index+1)+' ready · switching at the next bar';mgraphics.redraw();return;}
            status='Preparing phrase '+(index+1)+' while the current phrase plays';mgraphics.redraw();collageWarmJob.schedule(1);
        }catch(err){collageWarmCancel();status='Keep preparation: '+err.message;mgraphics.redraw();}
        finally{state=old;renderEventContext=context;collageReservations=reservations;collagePlanCache=plan;}
    },this);collageWarmJob.schedule(1);say('Preparing phrase '+(index+1)+' for the next ready bar.');return true;
}
var collageWarmRecall=collageRecall;
collageRecall=function(index){
    if(!playing||!collageWarmReady||collageWarmReady.index!==index)return collageWarmRecall(index);
    var old=state,slots=old.collage.keeps,absolute=(Date.now()-playTime)*old.tempo/60000,boundary=playTime+Math.floor(absolute/4)*4*60000/old.tempo,prepared=collageWarmReady.state;
    saveundo();prepared.archivePaths=old.archivePaths;prepared.renderedNotes=old.renderedNotes;if(old.renderedBankPitches)prepared.renderedBankPitches=old.renderedBankPitches;prepared.collage.keeps=slots;state=prepared;syncInstruments();
    collageSelectedLane=Math.min(collageSelectedLane,roles.length-1);collageLanePage=Math.floor(collageSelectedLane/6);workflowSelection=[];selected=-1;workflowCompare=-1;
    playTime=boundary;lastBeat=-.001;cycle=0;performanceCache=null;performanceLastPlan=null;performanceHistory=[];performanceHistoryEnd=0;performanceHistoryTempo=state.tempo;collageReservations=null;collagePlanCache=null;
    collageWarmReady=null;collageQueuedKeep=-1;collageWarmJustSwitched=true;collageWarmSwitchCount++;collageSendDynamics();view=26;say('Phrase '+(index+1)+' switched on the bar; the audio engine kept running.');return true;
};
var collageWarmPlay=play;play=function(){if(collageWarmJustSwitched){collageWarmJustSwitched=false;return;}collageWarmPlay();};
var collageWarmStop=stop;stop=function(){collageWarmCancel();collageWarmJustSwitched=false;collageWarmStop();};
var collageWarmAction=action;action=function(id){if(collageExportJob&&id!=='play'&&id!=='collagePlay'){say('Export is running. Stop cancels it.');return;}if(/^collageRecall:\d+$/.test(id)&&playing){var index=Number(id.split(':')[1]);if(collageWarmStart(index))return;}collageWarmAction(id);};
var collageWarmDelete=notifydeleted;notifydeleted=function(){collageWarmCancel();collageWarmDelete();};
