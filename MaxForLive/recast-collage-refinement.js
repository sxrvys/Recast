// Phrase refinement, scoped decisions and isolated preparation over the running player.
var refineJob=null,refineReady=null,refineContext=null,refineMode='',refineBefore=[],refineSourceLanes=[],refineCompare=null,refineCompareSide=1,refinePreviewGain=1;
function refineScope(){var kind=state.collage.editScope||'pattern';return {kind:kind,role:collageSelectedLane,bar:state.page||0,range:selection?selection.slice():null,cells:spaceActive()?spaceCells.slice():[]};}
function refineTargetsRole(role){if(!refineContext)return true;if(refineContext.kind==='draw')return refineContext.roles.indexOf(role)>=0;if(refineContext.kind==='layer')return role===refineContext.role;if(refineContext.kind==='selection'&&refineContext.cells.length)return refineContext.cells.some(function(cell){return Number(cell.split(':')[0])===role;});return true;}
function refineContains(e,scope){scope=scope||refineContext;if(!scope)return true;if(scope.kind==='draw')return scope.roles.indexOf(e.role)>=0;if(scope.kind==='layer')return e.role===scope.role;if(scope.kind==='bar')return e.beat>=scope.bar*4&&e.beat<(scope.bar+1)*4;if(scope.kind==='selection')return !!scope.range&&e.beat>=scope.range[0]&&e.beat<scope.range[1]&&(!scope.cells.length||scope.cells.indexOf(spaceKey(e.role,Math.floor((e.beat+1e-8)*4)))>=0);return true;}
var refineEligibleBefore=collageEligible;collageEligible=function(e){if(!refineContext)return refineEligibleBefore(e);return !protectedHit(e)&&!collageLane(e.role).locked&&!state.roleLocks[e.role]&&refineContains(e);};
var refineRhythmBefore=collageNewRhythm;collageNewRhythm=function(){
    var events=refineRhythmBefore(),amount=state.collage.phraseDevelopment||0;if(!amount||state.bars<2)return refineScopedRhythm(events);
    var out=[],res=state.collage.resolution||4,active=collageActiveRoles();
    for(var r=0;r<active.length;r++){
        var role=active[r],all=events.filter(function(e){return e.role===role;}),motif=all.filter(function(e){return e.beat<4;});if(!motif.length){out=out.concat(all);continue;}
        for(var bar=0;bar<state.bars;bar++){
            var rnd=collageRandom(collageSeed(state.collage.seeds.rhythm,role,bar+709)),answer=bar%2===1,fill=bar===state.bars-1&&state.bars>1;
            if(bar>0&&rnd()>amount){out=out.concat(all.filter(function(e){return e.beat>=bar*4&&e.beat<(bar+1)*4;}).map(function(e){var n=copy(e);n.collagePhrase='variation';return n;}));continue;}
            for(var i=0;i<motif.length;i++){
                var e=copy(motif[i]);e.id=++uid;e.beat+=bar*4;e.collagePhrase=fill?'fill':answer?'answer':'motif';
                if(answer&&!e.foundation&&rnd()<amount*.18)continue;
                if(answer&&!e.foundation&&rnd()<amount*.32)e.beat=Math.min(bar*4+4-1/res,e.beat+1/res);
                if(fill&&e.beat%4>=3&&!e.foundation&&rnd()<amount*.5)continue;
                e.velocity=clamp(e.velocity+(answer?-6:0),1,127);out.push(e);
            }
            if(fill&&role>=2&&rnd()<amount){var last=copy(motif[motif.length-1]);last.id=++uid;last.beat=bar*4+3+1/res;last.velocity=65;last.foundation=false;last.collagePhrase='fill';out.push(last);}
        }
    }
    return refineScopedRhythm(bounded(out.sort(function(a,b){return a.beat-b.beat;})));
};
function refineScopedRhythm(events){
    if(!refineContext||state.collage.density<=0||refineContext.kind==='pattern')return events;var scope=refineContext,res=state.collage.resolution||4;
    for(var r=0;r<roles.length;r++){if(!collageLane(r).sources.length||collageLane(r).locked||state.roleLocks[r]||events.some(function(e){return e.role===r&&refineContains(e);}))continue;
        for(var t=0;t<beats();t+=1/res){var e={id:uid+1,role:r,beat:t,slice:0,velocity:88,pitch:0,reverse:false,collage:true};if(refineContains(e)&&!locked(t)){e.id=++uid;events.push(e);break;}}
    }return bounded(events.sort(function(a,b){return a.beat-b.beat;}));
}
function refineTreatmentState(e){var fields=['beat','velocity','pitch','reverse','durationBeats','collageFX','collageFxDepth'],out={};for(var i=0;i<fields.length;i++)if(e[fields[i]]!==undefined)out[fields[i]]=e[fields[i]];return out;}
function refineDamage(events){
    var c=state.collage,baseAmount=c.damage,out=[],episodes={},behaviors=['burst','drag','gap','reverse','choke','late answer','rush'];
    for(var i=0;i<events.length;i++){
        var e=copy(events[i]),amount=baseAmount*(typeof wbTension==='function'?wbTension(e.beat):1);if(!collageEligible(e)){out.push(e);continue;}delete e.collageBehavior;delete e.refineBaseline;delete e.refineLast;var baseline=refineTreatmentState(e);e.refineBaseline=baseline;if(e.foundation||!amount){e.refineLast=refineTreatmentState(e);out.push(e);continue;}
        var bar=Math.floor(e.beat/4),key=e.role+':'+bar,rnd=collageRandom(collageSeed(c.seeds.damage,e.role,bar+911));
        if(!episodes[key])episodes[key]={start:bar*4+Math.floor(rnd()*3),length:.5+rnd()*1.5,type:behaviors[Math.floor(rnd()*behaviors.length)],drag:(.03+rnd()*.15)*amount,active:rnd()<Math.min(1,amount*(e.role<2?.7:1.7))};
        var episode=episodes[key];if(!episode.active||e.beat<episode.start||e.beat>=episode.start+episode.length){e.refineLast=refineTreatmentState(e);out.push(e);continue;}
        var motion=collageRandom(collageSeed(c.seeds.damage,e.id%100000,1901));e.collageBehavior=episode.type;
        if(episode.type==='gap'&&motion()<.7)continue;
        if(episode.type==='reverse')e.reverse=!e.reverse;
        if(episode.type==='choke')e.durationBeats=Math.min(e.durationBeats||1,.04+motion()*.14);
        if(episode.type==='drag'||episode.type==='rush'){
            var dest=e.beat+(episode.type==='drag'?1:-1)*episode.drag*(1-clamp((e.beat-episode.start)/episode.length,0,1));
            if(dest>=bar*4&&dest<(bar+1)*4&&refineContains({role:e.role,beat:dest})&&!locked(dest))e.beat=dest;
        }
        e.refineLast=refineTreatmentState(e);out.push(e);
        if(episode.type==='burst'||episode.type==='late answer'){
            var count=episode.type==='late answer'?2:(motion()<.5?2:3),span=episode.type==='late answer'?.2+.2*motion():.125+.375*motion();
            for(var k=1;k<count;k++){var h=copy(e);h.id=++uid;h.beat=e.beat+(episode.type==='late answer'?span:span*(1-Math.pow(.45,k))/(1-.45));if(h.beat>=beats()||!refineContains(h)||locked(h.beat))continue;h.collageRepeat=true;h.damageRepeat=true;h.collageParentId=e.id;h.velocity=Math.max(1,Math.round(e.velocity*Math.pow(.67,k)));h.durationBeats=Math.min(h.durationBeats||1,span*.6);h.refineBaseline=refineTreatmentState(h);h.refineLast=refineTreatmentState(h);out.push(h);}
        }
    }
    return bounded(out.sort(function(a,b){return a.beat-b.beat;}));
}
var refineDecorateBefore=collageDecorate;collageDecorate=function(base){
    if(!refineMode)return refineDecorateBefore(base);
    var c=state.collage,damage=c.damage;c.damage=0;var decorated;try{decorated=refineDecorateBefore(base);}finally{c.damage=damage;}
    if(refineMode==='order'||refineMode==='cuts'){
        var counts={};return refineBefore.map(function(original){var e=copy(original);if(!collageEligible(e))return e;var ordinal=counts[e.role]||0;counts[e.role]=ordinal+1;var choice=collageChooseCut(e.role,ordinal),fragment=collageLane(e.role).cuts[choice];if(!fragment)return e;
            var old=refineBefore.filter(function(o){return o.id===e.id;})[0],gain=old&&old.source?old.source.gain:1,previous=((refineSourceLanes[e.role]||{}).cuts||[])[e.collagePick],ratio=e.collageLevelGain!==undefined?e.collageLevelGain:previous&&previous.gain?gain/previous.gain:Math.min(1,gain);
            e.source={index:fragment.index,a:fragment.a,z:fragment.z,dur:fragment.dur,gain:fragment.gain*ratio};e.collagePath=fragment.path;e.collagePick=choice;delete e.manualFragment;delete e.frozen;return e;});
    }
    var beforeById={},decoratedById={},sourceBaseById={};for(var i=0;i<base.length;i++)sourceBaseById[base[i].id]=base[i];for(var i=0;i<refineBefore.length;i++)beforeById[refineBefore[i].id]=refineBefore[i];for(var i=0;i<decorated.length;i++)decoratedById[decorated[i].id]=decorated[i];
    if(refineMode==='pitch')return refineBefore.map(function(original){var e=copy(original);if(!collageEligible(e))return e;var candidate=decoratedById[e.id],parent=beforeById[e.collageParentId],parentCandidate=decoratedById[e.collageParentId];if(candidate)e.pitch=candidate.pitch;else if(parent&&parentCandidate)e.pitch=clamp(e.pitch+parentCandidate.pitch-parent.pitch,-48,48);if(e.refineBaseline)e.refineBaseline.pitch=e.pitch;if(e.refineLast)e.refineLast.pitch=e.pitch;delete e.frozen;return e;});
    if(refineMode==='damage')decorated=decorated.map(function(candidate){var old=beforeById[candidate.id]||(sourceBaseById[candidate.id]&&sourceBaseById[candidate.id].source?sourceBaseById[candidate.id]:null);if(!old||!collageEligible(candidate))return candidate;var e=copy(old),baseline=e.refineBaseline,last=e.refineLast;if(baseline&&last){var fields=['beat','velocity','pitch','reverse','durationBeats','collageFX','collageFxDepth'];for(var k=0;k<fields.length;k++){var field=fields[k];if(e[field]===last[field]){if(baseline[field]===undefined)delete e[field];else e[field]=baseline[field];}}}delete e.frozen;return e;});
    var byId={};for(var i=0;i<base.length;i++)byId[base[i].id]=base[i];

    for(var i=0;i<decorated.length;i++){var e=decorated[i],old=byId[e.id];if(old&&!refineContains(e)){e.beat=old.beat;} }
    return refineMode==='phrase'||refineMode==='damage'?refineDamage(decorated):decorated;
};
function refineRevision(){var c=state.collage,controls={},skip={lanes:1,base:1,lastResult:1,keeps:1,sourceKeys:1,detectedTarget:1,changeSummary:1,changedIds:1};for(var field in c)if(c.hasOwnProperty(field)&&!skip[field])controls[field]=c[field];var lanes=c.lanes.map(function(l){var row={};for(var key in l)if(l.hasOwnProperty(key)&&key!=='cuts'&&key!=='dirty')row[key]=l[key];return row;});return JSON.stringify([state.events,state.tempo,state.bars,state.paths,lanes,controls]);}
function refineWithState(job,fn){
    var old=state,oldPlaying=playing,oldPreparing=preparing,oldView=view,oldSelected=selected,oldWorkflow=workflowSelection,oldTarget=workflowTarget,oldSelection=selection,oldCells=spaceCells,oldRef=spaceSelectionRef,oldContext=renderEventContext,oldReserve=collageReservations,oldPlan=collagePlanCache,oldStop=stop,oldSave=saveundo,oldPlay=play,oldPrepare=collagePrepare,oldMode=refineMode,oldBefore=refineBefore,oldSourceLanes=refineSourceLanes,oldScope=refineContext,oldRedraw=redraw,oldCompare=workflowCompare,oldQueued=workflowQueued;
    try{state=job.state;playing=false;preparing=false;view=26;workflowTarget=-1;selection=null;spaceCells=[];spaceSelectionRef=null;state.scope=0;renderEventContext=state.events;refineMode=job.mode;refineBefore=job.before;refineSourceLanes=job.original.collage.lanes;refineContext=job.scope;stop=function(){};saveundo=function(){};play=function(){};collagePrepare=function(callback){job.finish=callback;};redraw=function(){mgraphics.redraw();};return fn();}
    finally{state=old;playing=oldPlaying;preparing=oldPreparing;view=oldView;selected=oldSelected;workflowSelection=oldWorkflow;workflowTarget=oldTarget;selection=oldSelection;spaceCells=oldCells;spaceSelectionRef=oldRef;renderEventContext=oldContext;collageReservations=oldReserve;collagePlanCache=oldPlan;stop=oldStop;saveundo=oldSave;play=oldPlay;collagePrepare=oldPrepare;refineMode=oldMode;refineBefore=oldBefore;refineSourceLanes=oldSourceLanes;refineContext=oldScope;redraw=oldRedraw;workflowCompare=oldCompare;workflowQueued=oldQueued;}
}
function refineKeyStep(job){
    var c=state.collage;if(!c.keySync||job.keyAt>=job.keys.length)return true;if(!c.sourceKeys)c.sourceKeys={};var path=job.keys[job.keyAt],index=collageSourceBuffer(path),fingerprint=collageKeyFingerprint(path,index);
    if(c.sourceKeys[path]&&c.sourceKeys[path].fingerprint===fingerprint){job.keyAt++;return false;}
    if(!job.keyWork)job.keyWork={window:0,chroma:[0,0,0,0,0,0,0,0,0,0,0,0],count:0};var work=job.keyWork,frame=collageChromaFrame(index,work.window*Math.max(0,buffer(index).length()-420)/11);if(frame){work.count++;for(var k=0;k<12;k++)work.chroma[k]+=frame[k];}work.window++;
    if(work.window>=12){var result=collageClassifyKey(work.chroma);result.fingerprint=fingerprint;result.frames=work.count;if(!work.count)result.confident=false;c.sourceKeys[path]=result;job.keyWork=null;job.keyAt++;}return false;
}
function refineCancel(){if(refineJob&&refineJob.task)refineJob.task.cancel();refineJob=null;if(refineReady){collageWarmReady=null;collageQueuedKeep=-1;}refineReady=null;}
function refineChanges(before,after){var old={},changes={};for(var i=0;i<before.length;i++)old[before[i].id]=before[i];for(var i=0;i<after.length;i++){var e=after[i],p=old[e.id];if(!p||JSON.stringify(p)!==JSON.stringify(e))changes[e.id]=true;}return changes;}
function refineSummary(before,after){var old={},added=0,removed=0,moved=0,sounds=0,treated=0;for(var i=0;i<before.length;i++)old[before[i].id]=before[i];var seen={};for(var i=0;i<after.length;i++){var e=after[i],p=old[e.id];seen[e.id]=true;if(!p){added++;continue;}if(Math.abs(e.beat-p.beat)>1e-8)moved++;if(JSON.stringify(e.source)!==JSON.stringify(p.source))sounds++;if(e.reverse!==p.reverse||e.durationBeats!==p.durationBeats||e.collageBehavior!==p.collageBehavior)treated++;}for(var id in old)if(!seen[id])removed++;return added+' added · '+removed+' removed · '+moved+' moved · '+sounds+' fragments changed · '+treated+' treatments';}
function refineEnergy(snapshot){var sum=0;for(var i=0;i<snapshot.events.length;i++){var e=snapshot.events[i],s=e.frozen||e.source;if(s){var measured=buffer(s.index).framecount()>0?collageFragmentGain(s.index,Math.min(s.a,s.z),Math.max(s.a,s.z)).rms:.18;sum+=Math.pow(measured*(s.gain||0)*(e.velocity||100)/127,2)*Math.min(4000,s.dur||100);}}return Math.sqrt(sum/Math.max(1,snapshot.bars*4));}
function refineInstall(job){
    var before=state,prepared=job.state;if(!job.skipUndo)saveundo();prepared.archivePaths=before.archivePaths;prepared.renderedNotes=before.renderedNotes;prepared.renderedBankPitches=before.renderedBankPitches;prepared.collage.keeps=before.collage.keeps;state=prepared;syncInstruments();performanceCache=null;performanceLastPlan=null;collageReservations=null;collagePlanCache=null;selected=-1;workflowSelection=[];state.collage.changedIds=refineChanges(job.before,state.events);state.collage.changeSummary=refineSummary(job.before,state.events);if(job.comparing){refineCompareSide=job.side;refinePreviewGain=job.previewGain||1;}else{refineCompare={before:job.original,after:copy(state)};refineCompareSide=1;refinePreviewGain=1;}say(state.collage.changeSummary);if(job.autoPlay)play();if(job.comparing)refinePreviewGain=job.previewGain||1;
}
function refineGenerate(mode,autoPlay,scopeOverride,keepControls,preparedState){
    if(refineJob||refineReady){say('A proposal is preparing or queued. Stop cancels it.');return;}
    if(collageJob||collageLibraryPending||collageExportJob||preparing){say('Finish or stop the current preparation first.');return;}
    var scope=scopeOverride||refineScope();if(scope.kind==='selection'&&!scope.range){say('Select a passage in Step editor first, including empty cells if needed.');return;}
    collageAdoptKit();if(!collageActiveRoles().length){say('Load a source recording first.');return;}
    var prepared=copy(preparedState||state);prepared.archivePaths=state.archivePaths;prepared.collage.phraseDevelopment=prepared.collage.phraseDevelopment===undefined?.65:prepared.collage.phraseDevelopment;
    var job={mode:mode,keepControls:!!keepControls,state:prepared,before:copy(state.events),original:copy(state),scope:scope,revision:refineRevision(),currentEvents:state.events,autoPlay:!!autoPlay,skipUndo:!!scopeOverride,wbKind:scopeOverride&&scopeOverride.wbKind,phase:'start',at:0,eventAt:0};refineJob=job;
    job.task=new Task(function(){
        try{
            if(state.events!==job.currentEvents||(job.phase==='ready'||job.phase==='finish')&&refineRevision()!==job.revision){refineCancel();say('Proposal cancelled because the working phrase changed.');return;}
            refineWithState(job,function(){
                if(job.phase==='start'){var savedStyle=collageApplyStyle;try{if(job.keepControls)collageApplyStyle=function(){};collageGenerate(mode,false);}finally{collageApplyStyle=savedStyle;}job.roles=collageActiveRoles().filter(function(r){return refineTargetsRole(r)&&(collageLane(r).dirty||!collageLane(r).cuts.length);});job.keys=[];job.keyAt=0;for(var r=0;r<roles.length;r++)for(var k=0;k<collageLane(r).sources.length;k++)if(job.keys.indexOf(collageLane(r).sources[k])<0)job.keys.push(collageLane(r).sources[k]);job.phase='keys';}
                else if(job.phase==='keys'){if(refineKeyStep(job))job.phase='cuts';}
                else if(job.phase==='cuts'){if(job.at<job.roles.length)collageBuildLane(job.roles[job.at++]);else{job.phase='finish';}}
                else if(job.phase==='finish'){if(!job.finish)throw Error('No generation callback was prepared.');job.finish();job.phase='audio';}
                else if(job.phase==='audio'){if(job.eventAt<state.events.length)sound(state.events[job.eventAt++]);else{collageReserveVoices(state.events);job.phase='ready';}}
            });
            if(job.phase==='ready'){
                if(refineRevision()!==job.revision){refineCancel();say('Proposal cancelled because the working phrase changed.');return;}refineJob=null;if(mode==='phrase')job.state.collage.controlsPending=false;job.state.collage.changedIds=refineChanges(job.before,job.state.events);job.state.collage.changeSummary=refineSummary(job.before,job.state.events);
                if(playing){refineReady=job;collageWarmReady={index:4,state:job.state};collageQueuedKeep=4;say('Proposal ready · switches at the next bar · '+job.state.collage.changeSummary);}
                else refineInstall(job);return;
            }
            status='Preparing '+mode+' separately · '+(playing?'current phrase keeps playing':'stopped')+' · '+job.phase;mgraphics.redraw();job.task.schedule(2);
        }catch(err){refineCancel();say('Proposal preparation: '+err.message);}
    },this);job.task.schedule(1);say('Preparing a new '+mode+' proposal.');
}
var refineRecallBefore=collageRecall;collageRecall=function(index){var job=index===4&&refineReady;if(!job)return refineRecallBefore(index);if(refineRevision()!==job.revision){refineCancel();say('Queued proposal cancelled because the phrase changed.');return false;}var result=refineRecallBefore(index);if(result){refineReady=null;if(job.comparing){refineCompareSide=job.side;refinePreviewGain=job.previewGain||1;}else{refineCompare={before:job.original,after:copy(state)};refineCompareSide=1;refinePreviewGain=1;}state.collage.changedIds=refineChanges(job.before,state.events);state.collage.changeSummary=refineSummary(job.before,state.events);say(state.collage.changeSummary);}return result;};
var refineStopBefore=stop;stop=function(){refineCancel();refineStopBefore();};
var refineDeleteBefore=notifydeleted;notifydeleted=function(){refineCancel();refineDeleteBefore();};
var refineTriggerBefore=trigger;trigger=function(e){if(refinePreviewGain>=.999){refineTriggerBefore(e);return;}var n=copy(e);n.velocity=Math.max(1,Math.round(n.velocity*refinePreviewGain));refineTriggerBefore(n);};

function refineCompareStart(){
    if(!refineCompare){say('Generate a proposal first, then compare it with the previous phrase.');return;}
    if(refineJob||refineReady||collageJob||collageExportJob||preparing){say('Finish or stop preparation before comparing.');return;}
    var side=refineCompareSide?0:1,snapshot=copy(side?refineCompare.after:refineCompare.before);if(!snapshot.events.length){say('The previous phrase was empty.');return;}
    var a=refineEnergy(refineCompare.before),b=refineEnergy(refineCompare.after),target=side?b:a,scale=target>0?Math.min(1,Math.min(a,b)/target):1;
    snapshot.archivePaths=state.archivePaths;var refs=Object.keys(collageArchiveReferences({events:snapshot.events})).map(Number),at=0,eventAt=0;
    var job={mode:'compare',state:snapshot,before:copy(state.events),original:copy(state),scope:refineScope(),revision:refineRevision(),currentEvents:state.events,comparing:true,side:side,previewGain:scale,autoPlay:false};refineJob=job;
    job.task=new Task(function(){try{if(state.events!==job.currentEvents){refineCancel();say('Comparison cancelled because the phrase changed.');return;}
        refineWithState(job,function(){if(at<refs.length){var path=state.archivePaths[refs[at++]];if(path)collageSourceBuffer(path);}else if(eventAt<state.events.length)sound(state.events[eventAt++]);});
        if(at>=refs.length&&eventAt>=job.state.events.length){if(refineRevision()!==job.revision){refineCancel();return;}refineJob=null;if(playing){refineReady=job;collageWarmReady={index:4,state:job.state};collageQueuedKeep=4;say('Comparison ready · switches at the next bar.');}else refineInstall(job);return;}job.task.schedule(2);
    }catch(err){refineCancel();say('Comparison: '+err.message);}},this);job.task.schedule(1);say('Preparing '+(side?'generated':'previous')+' phrase for comparison.');
}

var refineTickBefore=tick;tick=function(){var boundary=playing&&Math.floor(((Date.now()-playTime)*state.tempo/60000)/4)>Math.floor(Math.max(0,lastBeat)/4);if(refineReady&&(state.events!==refineReady.currentEvents||boundary&&refineRevision()!==refineReady.revision)){refineCancel();say('Queued proposal cancelled because the working phrase changed.');}refineTickBefore();};
