// A focused listening/editing workflow. All proposal and history snapshots use the existing audio engine.
var wbTakes=[],wbTakeCounter=0,wbHearing='',wbReturn=null,wbAudition=null,wbGesture=null,wbSliderDrag=null,wbFollow=true;
var wbCacheLoaded=false,wbCacheWrite=null,wbCacheFile=null,wbForceScan=false;
function wbBusy(){return !!(refineJob||refineReady||collageJob||collageLibraryPending||preparing||collageExportJob||collageLiveJob);}
function wbPhase(){if(collageLiveJob)return 'Adding audio tracks to Live';if(collageExportJob)return 'Rendering audio';if(collageLibraryPending)return 'Scanning library · '+collageLibraryFiles.length+' files';if(collageJob)return 'Finding replacement audio · current phrase retained';if(refineJob)return 'Preparing '+(refineJob.wbLabel||refineJob.mode)+' · '+refineJob.phase;if(refineReady)return 'Ready · '+(refineReady.wbLabel||'new phrase')+' switches next bar';if(preparing)return 'Preparing playback';return playing?'Playing bar '+(Math.floor(currentBeat()/4)+1)+' / '+state.bars:'Stopped';}
function wbSnapshot(n){var c=copy(n.collage);c.keeps=[null,null,null,null];delete c.sourceKeys;return {tempo:n.tempo,bars:n.bars,events:copy(n.events),original:copy(n.original||n.events),feelBase:copy(n.feelBase||n.events),ranges:copy(n.ranges||[]),roleLocks:copy(n.roleLocks),extraInstruments:copy(n.extraInstruments||[]),paths:copy(n.paths),collage:c};}
function wbSignature(n){return JSON.stringify([n.tempo,n.bars,n.events]);}
function wbRemember(n,label){if(!n.events.length)return;var signature=wbSignature(n);for(var i=0;i<wbTakes.length;i++)if(wbTakes[i].signature===signature){wbHearing=wbTakes[i].label;return;}var row={number:++wbTakeCounter,label:label||'Take '+wbTakeCounter,snapshot:wbSnapshot(n),signature:signature};wbTakes.push(row);if(wbTakes.length>8)wbTakes.shift();wbHearing=row.label;}
function wbInstalled(job,previousView){if(previousView===31&&!job.wbKind)view=31;if(job.wbKind==='history'||job.wbKind==='working')view=32;else if(job.wbKind==='audition'||job.wbKind==='auditionOriginal'||job.wbKind==='auditionHear')view=33;if(job.wbLabel)wbHearing=job.wbLabel;if(wbAudition&&(job.wbKind==='auditionOriginal'||job.wbKind==='auditionHear'))wbAudition.hearingOriginal=job.wbKind==='auditionOriginal';if(job.wbKind==='audition'){if(wbAudition){wbAudition.phase='ready';wbAudition.hearingOriginal=false;wbAudition.candidate=wbSnapshot(state);wbAudition.path=collageLane(wbAudition.role).sources[0];if(wbAudition.tried.indexOf(wbAudition.path)<0)wbAudition.tried.push(wbAudition.path);}return;}if(job.wbKind==='history'||job.wbKind==='cancel'||job.wbKind==='working')return;if(job.comparing)return;wbRemember(job.original);wbRemember(state);wbPersistCache();}
var wbInstallBefore=refineInstall;refineInstall=function(job){var previousView=view;wbInstallBefore(job);wbInstalled(job,previousView);};
var wbRecallBefore=collageRecall;collageRecall=function(index){var previousView=view,job=index===4?refineReady:null,result=wbRecallBefore(index);if(result&&job)wbInstalled(job,previousView);return result;};
function wbQueueSnapshot(snapshot,kind,label){
    if(wbBusy()){say('Finish preparation or press Stop before switching takes.');return false;}if(!snapshot||!snapshot.events.length){say('This take has no events.');return false;}
    var prepared=copy(state);for(var key in snapshot)if(snapshot.hasOwnProperty(key))prepared[key]=copy(snapshot[key]);prepared.archivePaths=state.archivePaths;prepared.collage.keeps=state.collage.keeps;
    var a=refineEnergy(state),b=refineEnergy(prepared),gain=b>0?Math.min(1,a/b):1;
    var job={mode:kind,state:prepared,before:copy(state.events),original:copy(state),scope:refineScope(),revision:refineRevision(),currentEvents:state.events,comparing:true,side:1,previewGain:gain,autoPlay:false,wbKind:kind,wbLabel:label,phase:'sources'};
    var refs=Object.keys(collageArchiveReferences({events:prepared.events})).map(Number),at=0,eventAt=0;refineJob=job;
    job.task=new Task(function(){try{
        if(state.events!==job.currentEvents){refineCancel();say('Take switch cancelled because the working phrase changed.');return;}
        refineWithState(job,function(){if(at<refs.length){var path=state.archivePaths[refs[at++]];if(path)collageSourceBuffer(path);}else if(eventAt<state.events.length){job.phase='audio';sound(state.events[eventAt++]);}});
        if(at>=refs.length&&eventAt>=job.state.events.length){if(refineRevision()!==job.revision){refineCancel();say('Take switch cancelled because settings changed.');return;}refineJob=null;if(playing){refineReady=job;collageWarmReady={index:4,state:job.state};collageQueuedKeep=4;}else refineInstall(job);redraw();return;}job.task.schedule(2);
    }catch(err){refineCancel();say('Take switch: '+err.message);}},this);job.task.schedule(1);say('Preparing '+label+'; current audio stays in place.');return true;
}
// A fresh explicit sound request supersedes the previous audition target.
// Retain the currently heard choice; Undo/history still contain the earlier phrase.
function wbFinishSoundRequest(){
    if(wbBusy()){say('Sound preparation is in progress. Wait or press Stop to cancel.');return false;}
    if(wbAudition){wbRemember(wbAudition.original);wbRemember(state);wbAudition=null;wbReturn=null;refinePreviewGain=1;}
    return true;
}
// Source-only auditions remain reversible until the user keeps the candidate.
function wbNewSound(role){
    if(wbBusy()){say('Sound preparation is in progress. Wait or press Stop to cancel.');return;}
    if(collageLane(role).locked||collageLane(role).soundLocked||state.roleLocks[role]){say('Release Keep sound / Lock layer before trying a replacement.');return;}
    if(wbAudition&&wbAudition.role!==role&&!wbFinishSoundRequest())return;
    if(!wbAudition)wbAudition={role:role,original:wbSnapshot(state),phase:'finding',path:'',tried:[]};else wbAudition.phase='finding';
    collageSelectedLane=role;collageLanePage=Math.floor(role/6);view=33;collageDrawLibrary(role,true);
}
function wbAuditionDone(keep){
    if(!wbAudition)return;var audition=wbAudition;
    if(keep){if(wbBusy()){say('Wait for the candidate to finish switching before keeping it.');return;}if(audition.hearingOriginal){say('Hear the candidate before keeping its sound.');return;}if(audition.phase!=='ready'){say('Wait for a candidate before keeping it.');return;}wbRemember(audition.original);wbRemember(state);wbAudition=null;wbReturn=null;refinePreviewGain=1;view=26;say('Replacement kept. Rhythm and other layers retained.');wbPersistCache();return;}
    if(refineJob||refineReady)refineCancel();if(collageJob){collageJob.cancel();collageJob=null;collageCopyClose();}if(collageLibraryPending)collageLibraryCancel();if(preparing)stop();
    if(!audition.original.events.length){stop();saveundo();for(var key in audition.original)state[key]=copy(audition.original[key]);syncInstruments();wbAudition=null;view=26;redraw();return;}
    if(wbSignature(state)===wbSignature(audition.original)){wbAudition=null;view=26;redraw();return;}
    if(wbQueueSnapshot(audition.original,'cancel','Working phrase')){wbAudition=null;view=26;}
}
function wbTension(beat){var mode=state.collage.phraseContour||'steady',bar=Math.floor(beat/4),last=Math.max(1,state.bars-1);if(mode==='build')return .25+.75*bar/last;if(mode==='waves')return bar%4===0?.3:bar%4===1?.6:bar%4===2?1:.2;if(mode==='rupture')return bar===state.bars-1&&beat%4>=2?1:.18;return 1;}
var wbRhythmBefore=collageNewRhythm;collageNewRhythm=function(){var events=wbRhythmBefore(),mode=state.collage.phraseContour||'steady';if(mode==='steady'||state.bars<2)return events;return events.filter(function(e){if(!collageEligible(e)||e.foundation)return true;var rnd=collageRandom(collageSeed(state.collage.seeds.rhythm,e.id,6331));return rnd()<.35+.65*wbTension(e.beat);}).map(function(e){if(!collageEligible(e)||e.foundation)return e;var h=copy(e);h.velocity=Math.max(1,Math.round(h.velocity*(.72+.28*wbTension(e.beat))));return h;});};
// Readouts describe knob position. The response curve stays internal and saved DSP values are unchanged.
var wbFormatBefore=collageFormatControl;collageFormatControl=function(s,v){if((view===26||view===27)&&['density','size','movement','damage'].indexOf(s.field)>=0)return Math.round(100*Math.pow(clamp((v-s.min)/(s.max-s.min),0,1),1/(s.curve||1)))+'%';return wbFormatBefore(s,v);};
// Local-only warm caches. Explicit Rescan always bypasses disk and rebuilds descriptors.
function wbCachePath(){return defaultRenderDirectory().replace(/\/Rendered$/,'')+'/LibraryCache.json';}
function wbReadCache(){if(wbCacheLoaded)return false;wbCacheLoaded=true;var f=null;try{f=new File(wbCachePath(),'read');if(!f.isopen||typeof f.readstring!=='function'||!f.eof||f.eof>12000000)return false;var body='';while(f.position<f.eof)body+=f.readstring(Math.min(4096,f.eof-f.position));var data=JSON.parse(body),key=JSON.stringify(collageLibraryScanRoots());if(data.version!==1||data.key!==key||!data.files||data.files.length>50000||Date.now()-data.time>86400000)return false;collageLibraryFiles=data.files.filter(function(p){return typeof p==='string'&&collageAudioFile(p);});collageLibraryKey=key;collageLibraryMetaCache=data.metadata||{};collageCharacterCache=data.characters||{};return true;}catch(err){return false;}finally{if(f)f.close();}}
function wbPersistCache(){
    if(!collageLibraryKey||collageLibraryPending||!collageLibraryFiles.length)return;if(wbCacheWrite)wbCacheWrite.cancel();if(wbCacheFile)wbCacheFile.close();wbCacheFile=null;
    var body=JSON.stringify({version:1,time:Date.now(),key:collageLibraryKey,files:collageLibraryFiles.slice(0,50000),metadata:collageLibraryMetaCache,characters:collageCharacterCache}),at=0;if(body.length>12000000)return;
    wbCacheWrite=new Task(function(){try{if(!wbCacheFile){wbCacheFile=new File(wbCachePath(),'write');if(!wbCacheFile.isopen)throw Error('Cache unavailable');wbCacheFile.eof=0;}wbCacheFile.writestring(body.slice(at,at+4096));at+=4096;if(at<body.length)wbCacheWrite.schedule(5);else{wbCacheFile.close();wbCacheFile=null;wbCacheWrite=null;}}catch(err){if(wbCacheFile)wbCacheFile.close();wbCacheFile=null;wbCacheWrite=null;}},this);wbCacheWrite.schedule(20);
}
var wbIndexBefore=collageLibraryIndex;collageLibraryIndex=function(done){if(!wbForceScan&&wbReadCache()){say('Using cached library · '+collageLibraryFiles.length+' files');done();return;}wbForceScan=false;wbIndexBefore(function(){wbPersistCache();done();});};
var wbReferencesBefore=collageArchiveReferences;collageArchiveReferences=function(n){var refs=wbReferencesBefore(n);if(n===state){var snapshots=wbTakes.map(function(t){return t.snapshot;});if(wbAudition)snapshots.push(wbAudition.original);if(wbReturn)snapshots.push(wbReturn);for(var i=0;i<snapshots.length;i++){var more=wbReferencesBefore(snapshots[i]);for(var k in more)refs[k]=true;}}return refs;};
function wbGridCell(x,y){if(x<140||x>=1036||y<220||y>=460)return null;var role=workflowBank*6+Math.floor((y-220)/40),col=Math.floor((x-140)/56);return role<roles.length&&((x-140)%56)<51&&((y-220)%40)<34?{role:role,col:col,cell:state.page*16+col}:null;}
function wbHits(cell){return state.events.filter(function(e){return e.role===cell.role&&Math.floor((e.beat+1e-8)*4)===cell.cell;});}
function wbAddRemove(cell){
    if(wbBusy())return;var hits=wbHits(cell),allowed=hits.filter(function(e){return !protectedHit(e)&&!collageLane(e.role).locked;});
    if(hits.length){if(!allowed.length){say('This step is protected.');return;}stop();saveundo();var ids=allowed.map(function(e){return e.id;});state.events=state.events.filter(function(e){return ids.indexOf(e.id)<0;});manualBase();chooseManualEvents([]);redraw();return;}
    if(locked(cell.cell/4)||state.roleLocks[cell.role]||collageLane(cell.role).locked){say('This space is protected.');return;}var cuts=collageLane(cell.role).cuts;if(!cuts.length){say('Generate once to prepare fragments for this layer.');return;}stop();saveundo();var cut=cuts[0],e={id:++uid,role:cell.role,beat:cell.cell/4,velocity:100,pitch:0,reverse:false,slice:0,collage:true,collagePath:cut.path,collagePick:0,source:{index:cut.index,a:cut.a,z:cut.z,dur:cut.dur,gain:cut.gain*.75}};state.events.push(e);manualBase();chooseManualEvents([e]);redraw();
}
function wbEdit(field,value,relative){if(wbBusy()){say('Finish preparation before editing.');return;}var hits=selectedEvents().filter(function(e){return !protectedHit(e)&&!collageLane(e.role).locked;});if(!hits.length){say('Select editable hits first.');return;}var oldIds=workflowSelection.slice(),oldSelected=selected;chooseManualEvents(hits);var undoBefore=saveundo;try{if(wbSliderDrag&&wbSliderDrag.saved)saveundo=function(){};editSelection(field,value,relative);if(wbSliderDrag)wbSliderDrag.saved=true;}finally{saveundo=undoBefore;}workflowSelection=oldIds;selected=oldSelected;for(var i=0;i<hits.length;i++)delete hits[i].frozen;state.collage.lastResult='';collagePlanCache=null;redraw();}
function wbRepeats(count){
    if(wbBusy())return;var hits=selectedEvents().filter(function(e){return !protectedHit(e)&&!collageLane(e.role).locked;}),groups={};for(var i=0;i<hits.length;i++){var e=hits[i],key=e.role+':'+Math.floor((e.beat+1e-8)*4);if(!groups[key])groups[key]=[];groups[key].push(e);}if(!hits.length)return;var total=Object.keys(groups).length*count;if(state.events.length-hits.length+total>1024){say('Pattern limit reached.');return;}stop();saveundo();var remove=hits.map(function(e){return e.id;}),out=[];for(var key in groups){var rows=groups[key].sort(function(a,b){return a.beat-b.beat;}),base=rows[0],start=Math.floor((base.beat+1e-8)*4)/4;for(var n=0;n<count;n++){var h=copy(base);h.id=n?++uid:base.id;h.beat=start+n*.25/count;h.durationBeats=Math.min(h.durationBeats||.25,.25/count);delete h.frozen;delete h.stepCell;out.push(h);}}state.events=state.events.filter(function(e){return remove.indexOf(e.id)<0;}).concat(out).sort(function(a,b){return a.beat-b.beat;});manualBase();chooseManualEvents(out);redraw();
}
function wbGridChosen(cell,hits){return !!(spaceActive()&&spaceCells.indexOf(spaceKey(cell.role,cell.cell))>=0||hits.some(function(e){return workflowSelection.indexOf(e.id)>=0||state.events[selected]&&state.events[selected].id===e.id;}));}
function wbPaintGrid(){
    buttons=[];rawDraw=true;simpleDrops();collageHideFields();rect(0,0,1080,880,[.07,.085,.1,1]);text('STEP EDITOR',20,40,25);button('wbMain','Back to collage',850,18,210);button('collagePlay',playing?'■ Stop':'▶ Play',20,65,130,true);button('collagePhrase','Generate in target',165,65,210,true);button('wbHistory','Recent takes',390,65,160);button('undo','Undo',565,65,100);button('wbTarget','Target: '+refineScopeLabel()+' ▾',680,65,380);
    button('wbBarPrev','‹ Bar',20,110,100);text('Viewing '+(state.page+1)+' / '+state.bars+(playing?' · playing '+(Math.floor(currentBeat()/4)+1):''),140,130,14);button('wbBarNext','Bar ›',410,110,100);button('wbFollow','Follow: '+(wbFollow?'On':'Off'),525,110,155,wbFollow);button('wbBankPrev','‹ Layers',695,110,170);button('wbBankNext','Layers ›',880,110,180);
    var tools=[['edit','Select'],['toggle','Add / remove'],['move','Move'],['protect','Protect']];for(var t=0;t<tools.length;t++)button('wbTool:'+tools[t][0],tools[t][1],20+t*170,155,155,gridTool===tools[t][0]);button('wbSelectBar','Select whole bar',710,155,180);button('wbClearSelection','Clear selection',905,155,155);
    for(var col=0;col<16;col++)text(col%4===0?String(col/4+1):['','e','&','a'][col%4],145+col*56,211,11);
    for(var row=0;row<6;row++){var role=workflowBank*6+row;if(role>=roles.length)continue;var y=220+row*40;text('Layer '+(role+1),20,y+23,12);for(var col=0;col<16;col++){var cell={role:role,col:col,cell:state.page*16+col},hits=wbHits(cell),x=140+col*56,chosen=wbGridChosen(cell,hits),guard=locked(cell.cell/4)||state.roleLocks[role]||collageLane(role).locked||hits.some(protectedHit);rect(x,y,51,34,chosen?[.16,.32,.37,1]:[.18,.22,.24,1]);if(hits.length)drawTimedStepHits(x,y,hits.map(function(e){return state.events.indexOf(e);}),col);if(guard){text('L',x+38,y+12,10,[.6,.9,.69,1]);rect(x+2,y+29,47,2,[.5,.8,.59,1]);}if(chosen){rect(x,y,51,2,[.5,.86,.9,1]);rect(x,y+32,51,2,[.5,.86,.9,1]);}if(playing&&Math.floor(currentBeat()/4)===state.page&&Math.floor(currentBeat()*4)%16===col)rect(x,y+34,51,3,[1,.77,.4,1]);}}
    var selectedHits=selectedEvents(),e=selectedHits[0];text('Drag hits to move · drag blank space / Shift-drag to select · Cmd-click adds · green = protected',20,490,12,[.65,.75,.77,1]);text(selectedHits.length+' selected hit'+(selectedHits.length===1?'':'s')+(spaceActive()?' · '+spaceCells.length+' selected cells':''),20,530,17);
    if(e){text(shortName(e.collagePath||'',75)+' · beat '+(e.beat+1).toFixed(3),20,560,13);if(e.source)text('Fragment '+(e.source.a/1000).toFixed(3)+'–'+(e.source.z/1000).toFixed(3)+' s · '+(e.reverse?'reverse':'forward')+(protectedHit(e)?' · protected':''),20,580,11);var specs=wbEditSliders();for(var i=0;i<specs.length;i++){var s=specs[i],v=s.field==='velocity'?e.velocity:s.field==='gate'?(e.durationBeats||.25):(e.pitch||0);text(s.label+': '+(s.field==='gate'?(v*4).toFixed(2)+' steps':Math.round(v)),s.x,600,13);rect(s.x,620,290,5,[.23,.28,.3,1]);rect(s.x,620,290*clamp((v-s.min)/(s.max-s.min),0,1),5,[.89,.62,.31,1]);}
        button('wbReverse',selectedHits.every(function(e){return e.reverse;})?'← Reverse: On':'Reverse',20,660,170);button('wbKeepHits',selectedHits.every(function(e){return e.locked;})?'Release hits':'Keep hits',205,660,170);button('refineFragments','Edit fragment / waveform',390,660,300);button('wbDelete','Delete selected hits',705,660,355);
        text('Repeats per selected step',20,725,13);var repeats=[1,2,3,4,8];for(var i=0;i<repeats.length;i++)button('wbRepeats:'+repeats[i],repeats[i]===3?'3 · triplet':String(repeats[i]),20+i*130,745,115);text('Velocity, gate, pitch, reverse and repeats apply to the whole selection.',20,810,12);
    }else{text('Select a hit to reveal its sound, velocity, gate, pitch, reverse and repeats here.',20,600,15);button('wbKeepSpace','Keep selected passage + silence',20,660,440);}
    text(wbPhase(),20,850,12,[.65,.8,.74,1]);rawDraw=false;
}
function wbEditSliders(){return [{field:'velocity',label:'Velocity',x:20,min:1,max:127},{field:'gate',label:'Gate',x:380,min:.0625,max:4},{field:'pitch',label:'Pitch (semitones)',x:740,min:-24,max:24}];}
function wbPaintHistory(){
    buttons=[];rawDraw=true;simpleDrops();collageHideFields();rect(0,0,1080,880,[.07,.085,.1,1]);text('RECENT TAKES',20,42,25);button('wbMain','Back to collage',850,18,210);button('collagePlay',playing?'■ Stop':'▶ Play',20,70,140,true);button('wbHistoryWorking','Return to working phrase',175,70,330);button('wbHistoryUse','Use heard take as working',520,70,330,true);text('Last eight takes in this instance · switches on the next ready bar · saved Keeps remain below the collage.',20,135,13);
    for(var i=0;i<wbTakes.length;i++){var row=wbTakes[wbTakes.length-1-i],y=170+i*70;button('wbHearTake:'+row.number,row.label+' · '+row.snapshot.bars+' bars · '+row.snapshot.events.length+' hits',20,y,460,wbHearing===row.label);text(row.snapshot.tempo+' BPM',505,y+20,13);button('wbSaveTake:'+row.number,'Save to a Keep slot…',680,y,380);}
    text('Hearing: '+(wbHearing||'Working phrase')+' · '+wbPhase(),20,790,13,[.76,.84,.79,1]);text('History is session-local. Keep slots and Save retain a phrase for later sessions.',20,825,12);text(status.slice(0,140),20,860,11);rawDraw=false;
}
function wbPaintAudition(){
    buttons=[];rawDraw=true;simpleDrops();collageHideFields();rect(0,0,1080,880,[.07,.085,.1,1]);var a=wbAudition;button('wbMain','Back to collage',850,18,210);text('SOUND AUDITION'+(a?' / LAYER '+(a.role+1):''),20,42,25);
    if(!a){text('Choose New sound on a layer to audition a replacement.',20,150,17);rawDraw=false;return;}
    text(a.phase==='ready'?(playing?'Auditioning in your existing pattern':'Candidate ready · press Hear in pattern'):'Finding and preparing a candidate · original phrase stays intact',20,115,17);text('Your other layers and timing are retained. Keep commits this sound; Cancel restores the original.',20,155,13);
    var path=a.path||collageLane(a.role).sources[0]||'',event=state.events.filter(function(e){return e.role===a.role;})[0],d=event&&event.source?{path:path,index:event.source.index,a:event.source.a,z:event.source.z}:null;
    text(shortName(path,90),20,210,18);text('Folder: '+path.slice(0,path.lastIndexOf('/')).slice(-120),20,245,12,[.66,.76,.78,1]);rect(20,280,1040,165,[.1,.14,.16,1]);
    if(d){d.viewStart=Math.max(0,d.a-100);d.viewEnd=Math.min(buffer(d.index).length(),Math.max(d.viewStart+1000,d.z+100));var wave=refineFragmentWave(d);for(var i=0;i<wave.bins.length;i++){var value=wave.bins[i]/Math.max(.0001,wave.peak);rect(20+i*1040/wave.bins.length,362-value*70,1.5,value*140,[.61,.73,.74,1]);}text('Source '+(buffer(d.index).length()/1000).toFixed(2)+' s · first triggered fragment '+(d.a/1000).toFixed(3)+'–'+(d.z/1000).toFixed(3)+' s',20,485,13);}
    button('collagePlay',playing?'Stop pattern':'Hear in pattern',20,530,240,true);button('wbCandidateKeep','Keep sound',275,530,250,true);button('wbCandidateNext','Try another',540,530,250);button('wbCandidateCancel','Cancel / original',805,530,255);button('wbCandidateOriginal','Hear original',20,590,240);button('wbCandidateHear','Hear candidate',275,590,250);
    text('Hearing: '+(a.hearingOriginal?'original':'candidate')+' · '+wbPhase(),20,690,14,[.7,.83,.77,1]);text('Candidate levels are measured for auditioning. Final processing and the output ceiling remain active.',20,735,12);text(status.slice(0,140),20,850,12);rawDraw=false;
}
var wbPaintBefore=paint;paint=function(){
    if(view===31){if(playing&&wbFollow)state.page=Math.min(state.bars-1,Math.floor(currentBeat()/4));wbPaintGrid();return;}
    if(view===32){wbPaintHistory();return;}if(view===33){wbPaintAudition();return;}
    wbPaintBefore();if(view===26&&!collageMenu&&!refineMenu){rawDraw=true;refineButton('refineCompare','Recent takes ('+wbTakes.length+')',635,586,185);rect(20,820,1040,27,[.07,.085,.1,1]);text('Hearing: '+(wbHearing||'Working phrase')+' · '+wbPhase()+(wbAudition?' · SOUND AUDITION: Keep / Try / Cancel':''),20,837,12,[.68,.82,.76,1]);rect(20,849,1040,26,[.07,.085,.1,1]);text((visualHints[visualHover]||status).slice(0,145),20,866,11,[.65,.78,.75,1]);if(wbAudition){refineButton('refineCompare','Finish sound audition…',635,586,185,true);}rawDraw=false;}
    if(view===27&&collageSection==='structure'&&!collageMenu&&!refineMenu){rawDraw=true;button('wbContour','Tension: '+(state.collage.phraseContour||'steady')+' ▾',585,650,390);rawDraw=false;}
    if(wbContourMenu){rawDraw=true;rect(245,205,600,265,[.04,.055,.07,1]);buttons=[];text('PHRASE TENSION',265,235,16);var modes=['steady','build','waves','rupture'];for(var i=0;i<modes.length;i++)button('wbContour:'+modes[i],{steady:'Steady · consistent activity',build:'Build · calmer start, heavier ending',waves:'Waves · tension and recovery',rupture:'Rupture · hold back, then break'}[modes[i]],255,255+i*48,580);rawDraw=false;}
};
var wbContourMenu=false;
var wbActionBefore=action;action=function(id){
    if((collageExportJob||collageLiveJob)&&id!=='play'&&id!=='collagePlay'){say('Finish or stop the audio export before changing this.');return;}
    if(id==='wbMain'){view=26;redraw();return;}
    if(id==='refineOnly:contour'){refineMenu='';wbContourMenu=true;redraw();return;}
    if(id==='wbContour'){wbContourMenu=!wbContourMenu;redraw();return;}
    if(/^wbContour:/.test(id)){saveundo();state.collage.phraseContour=id.split(':')[1];state.collage.controlsPending=true;wbContourMenu=false;say('Phrase tension set. Generate applies it.');return;}
    if(id==='collageGrid'){view=31;wbFollow=true;gridTool='edit';redraw();return;}
    if(id==='refineCompare'||id==='wbHistory'){if(wbAudition){view=33;redraw();return;}wbRemember(state,'Working '+(wbTakeCounter+1));view=32;redraw();return;}
    if(/^wbHearTake:/.test(id)){var number=Number(id.split(':')[1]),take=wbTakes.filter(function(t){return t.number===number;})[0];if(take){if(!wbReturn)wbReturn=wbSnapshot(state);wbQueueSnapshot(take.snapshot,'history',take.label);}return;}
    if(id==='wbHistoryWorking'){if(wbReturn&&wbQueueSnapshot(wbReturn,'working','Working phrase'))wbReturn=null;return;}
    if(id==='wbHistoryUse'){if(wbBusy()){say('Wait for the heard take to finish switching.');return;}wbReturn=null;refinePreviewGain=1;wbRemember(state);view=26;say('Heard take is now the working phrase.');return;}
    if(/^wbSaveTake:/.test(id)){var number=Number(id.split(':')[1]);wbSaveTakeNumber=number;refineMenu='';wbKeepMenu=true;redraw();return;}
    if(/^wbKeepSlot:/.test(id)){var take=wbTakes.filter(function(t){return t.number===wbSaveTakeNumber;})[0];if(take){saveundo();var snapshot=copy(state);for(var key in take.snapshot)snapshot[key]=copy(take.snapshot[key]);snapshot.collage.keeps=[null,null,null,null];snapshot.archivePaths=state.archivePaths.slice();state.collage.keeps[Number(id.split(':')[1])]=snapshot;say(take.label+' saved to Keep '+(Number(id.split(':')[1])+1)+'.');}wbKeepMenu=false;redraw();return;}
    if(id==='collageLibraryDraw'){if(collageJob||collageLibraryPending){wbActionBefore(id);return;}if(!wbFinishSoundRequest())return;view=26;collageMenu='';refineMenu='';collageBrowserRole=-1;collageDrawLibrary();return;}
    if(/^collageNewSound:/.test(id)){wbNewSound(Number(id.split(':')[1]));return;}
    if(id==='wbCandidateKeep'){wbAuditionDone(true);return;}if(id==='wbCandidateCancel'){wbAuditionDone(false);return;}if(id==='wbCandidateNext'){if(wbAudition)wbNewSound(wbAudition.role);return;}
    if(id==='wbCandidateOriginal'||id==='wbCandidateHear'){if(!wbAudition)return;var original=id==='wbCandidateOriginal',snapshot=original?wbAudition.original:wbAudition.candidate;if(snapshot)wbQueueSnapshot(snapshot,original?'auditionOriginal':'auditionHear',original?'Original sound':'Candidate sound');return;}
    if(wbAudition&&['collagePhrase','collageLibraryDraw','refineOnly:rhythm','refineOnly:cuts','refineOnly:damage','refineOnly:order'].indexOf(id)>=0){view=33;say('Keep or cancel the sound audition before generating another phrase.');return;}
    if(id==='wbBarPrev'||id==='wbBarNext'){state.page=(state.page+(id==='wbBarNext'?1:-1)+state.bars)%state.bars;wbFollow=false;redraw();return;}
    if(id==='wbFollow'){wbFollow=!wbFollow;redraw();return;}
    if(id==='wbBankPrev'||id==='wbBankNext'){workflowBank=clamp(workflowBank+(id==='wbBankNext'?1:-1),0,Math.max(0,Math.ceil(roles.length/6)-1));redraw();return;}
    if(/^wbTool:/.test(id)){gridTool=id.split(':')[1];redraw();return;}
    if(id==='wbTarget'){view=26;wbActionBefore('refineScope');return;}
    if(id==='wbSelectBar'){spaceBar();state.collage.editScope='selection';view=31;return;}
    if(id==='wbClearSelection'){spaceSet([]);state.collage.editScope='pattern';view=31;return;}
    if(id==='wbReverse'){wbEdit('reverse',!selectedEvents().every(function(e){return e.reverse;}));return;}
    if(id==='wbKeepHits'){wbActionBefore('selectionLock');view=31;return;}
    if(id==='wbDelete'){wbActionBefore('selectedDelete');view=31;return;}
    if(id==='wbKeepSpace'){wbActionBefore('refineOnly:protect');view=31;return;}
    if(/^wbRepeats:/.test(id)){wbRepeats(Number(id.split(':')[1]));return;}
    if(id==='collageLibraryRefresh'){wbForceScan=true;wbCacheLoaded=true;}
    if(id==='collagePhrase'&&wbReturn){wbReturn=null;refinePreviewGain=1;}
    wbActionBefore(id);
};
var wbKeepMenu=false,wbSaveTakeNumber=0,wbKeepPaint=paint;paint=function(){wbKeepPaint();if(wbKeepMenu){rawDraw=true;rect(245,205,600,265,[.04,.055,.07,1]);buttons=[];text('SAVE TAKE TO KEEP',265,235,16);for(var i=0;i<4;i++)button('wbKeepSlot:'+i,'Keep '+(i+1)+(state.collage.keeps[i]?' · replace existing phrase':' · empty'),255,255+i*48,580);rawDraw=false;}};
var wbClickBefore=onclick;onclick=function(x,y,b,cmd,shift){
    if(wbContourMenu||wbKeepMenu){if(!workflowButtons(x,y)){wbContourMenu=wbKeepMenu=false;redraw();}return;}
    if(view===31){if(wbBusy()){if(!workflowButtons(x,y))say('Finish or stop preparation before editing.');return;}var cell=wbGridCell(x,y);if(cell){if(gridTool==='toggle'){wbAddRemove(cell);return;}if(gridTool==='protect'){var hits=wbHits(cell);if(hits.length){chooseManualEvents(hits);wbActionBefore('selectionLock');view=31;}else{saveundo();var start=cell.cell/4,found=-1;for(var i=0;i<state.ranges.length;i++)if(state.ranges[i][0]===start&&state.ranges[i][1]===start+.25)found=i;if(found>=0)state.ranges.splice(found,1);else state.ranges.push([start,start+.25]);redraw();}return;}if(gridTool==='move'){if(collageLane(cell.role).locked){say('Unlock this layer before moving its hits.');return;}if(!wbHits(cell).some(function(e){return workflowSelection.indexOf(e.id)>=0;}))chooseManualEvents(wbHits(cell));wbGesture={type:'move',start:cell,current:cell,duplicate:!!cmd};return;}if(!cmd&&!shift&&wbHits(cell).length){if(!wbHits(cell).some(function(e){return workflowSelection.indexOf(e.id)>=0;}))spaceSet([spaceKey(cell.role,cell.cell)]);wbGesture={type:'move',start:cell,current:cell,duplicate:false};state.collage.editScope='selection';redraw();return;}var base=cmd?spaceCells.slice():[],key=spaceKey(cell.role,cell.cell);if(cmd&&base.indexOf(key)>=0){base.splice(base.indexOf(key),1);spaceSet(base);return;}wbGesture={type:'select',start:cell,base:base};spaceRectangle({role:cell.role,cell:cell.cell},{role:cell.role,cell:cell.cell},base);state.collage.editScope='selection';return;}
        var specs=wbEditSliders();for(var i=0;i<specs.length;i++){var s=specs[i];if(x>=s.x&&x<=s.x+290&&y>=608&&y<=636){wbSliderDrag=s;wbEdit(s.field,s.min+clamp((x-s.x)/290,0,1)*(s.max-s.min),false);return;}}workflowButtons(x,y);return;}
    if(view===32||view===33){workflowButtons(x,y);return;}
    if(view===26&&!collageMenu&&!refineMenu){var rows=collageWheelRows(),gap=Math.min(19,142/Math.max(1,rows.length-1));for(var i=0;i<state.events.length;i++){var e=state.events[i],row=rows.indexOf(e.role);if(row<0)continue;var angle=e.beat/beats()*Math.PI*2-Math.PI/2,radius=210-row*gap,px=298+Math.cos(angle)*radius,py=391+Math.sin(angle)*radius;if(Math.pow(x-px,2)+Math.pow(y-py,2)<=64){selected=i;workflowSelection=[e.id];collageSelectedLane=e.role;action('refineFragments');return;}}}
    wbClickBefore.apply(this,arguments);
};
var wbDragBefore=ondrag;ondrag=function(x,y,b){
    if(view===31&&wbSliderDrag){if(b)wbEdit(wbSliderDrag.field,wbSliderDrag.min+clamp((x-wbSliderDrag.x)/290,0,1)*(wbSliderDrag.max-wbSliderDrag.min),false);else wbSliderDrag=null;return;}
    if(view===31&&wbGesture){var gesture=wbGesture,cell=wbGridCell(x,y);if(b){if(cell){gesture.current=cell;if(gesture.type==='select'){spaceRectangle({role:gesture.start.role,cell:gesture.start.cell},{role:cell.role,cell:cell.cell},gesture.base);state.collage.editScope='selection';}}return;}wbGesture=null;if(gesture.type==='move'&&gesture.current){moveManualSelection((gesture.current.cell-gesture.start.cell)/4,0,gesture.duplicate);spaceCells=[];selection=null;state.scope=0;state.collage.editScope='pattern';view=31;}return;}
    wbDragBefore.apply(this,arguments);
};
var wbIdleBefore=onidle;onidle=function(x,y){if(view===26){var rows=collageSliders(),hints={density:'Density: fewer or more fragments per phrase. Generate applies it.',size:'Fragment size: shorter cuts or longer source windows. Generate applies it.',movement:'Movement: timing offsets, pitch changes and reverse chances. Generate applies it.',damage:'Damage: clustered interruptions, repeats, reversals and short gates. Generate applies it.'};for(var i=0;i<rows.length;i++){var s=rows[i];if(x>=s.x&&x<=s.x+390&&y>=s.y-15&&y<=s.y+35){var id='wbSlider:'+s.field;visualHints[id]=hints[s.field];if(visualHover!==id){visualHover=id;mgraphics.redraw();}return;}}}wbIdleBefore(x,y);};
var wbDeleteBefore=notifydeleted;notifydeleted=function(){if(wbCacheWrite)wbCacheWrite.cancel();if(wbCacheFile)wbCacheFile.close();wbCacheWrite=null;wbCacheFile=null;wbDeleteBefore();};

var wbCandidatesBefore=collageLibraryCandidates;collageLibraryCandidates=function(role,used,recent){var rows=wbCandidatesBefore(role,used,recent);return wbAudition&&wbAudition.role===role?rows.filter(function(p){return wbAudition.tried.indexOf(p)<0;}):rows;};

var wbBrowserAssignBefore=browserAssign;browserAssign=function(pool){
    if(collageBrowserRole<0||pool)return wbBrowserAssignBefore(pool);var role=collageBrowserRole,path=browserSelected;
    if(!path||!browserSource){say('Select a readable sample first.');return false;}
    if(wbBusy()){say('Wait for the current preparation before auditioning.');return false;}
    if(collageLane(role).locked||collageLane(role).soundLocked){say('Release Keep sound / Lock layer first.');return false;}
    if(wbAudition&&wbAudition.role!==role){say('Finish the current audition first.');return false;}
    if(!wbAudition)wbAudition={role:role,original:wbSnapshot(state),phase:'finding',path:'',tried:[]};else wbAudition.phase='finding';
    var prepared=copy(state),lane=prepared.collage.lanes[role];lane.sources=[path];lane.cuts=[];lane.dirty=true;lane.ignoreKit=true;browserPreview=false;browserContext=false;outlet(0,'stopvoice',33);view=33;
    refineGenerate(state.events.length?'order':'phrase',playing,{kind:'draw',roles:[role],wbKind:'audition'},true,prepared);return true;
};
var wbButtonBefore=button;button=function(id,label,x,y,w,active){if(view===8&&collageBrowserRole>=0&&id==='browserAssign')label='Preview in groove → Keep / Cancel';wbButtonBefore(id,label,x,y,w,active);};

var wbBrowseBefore=collageBrowse;collageBrowse=function(role,append){if(!state.sampleBrowser.root){var roots=collageLibraryRoots();if(roots.length)browserSetRoot(roots[0]);}wbBrowseBefore(role,append);say('Click to hear a sample. Preview in groove offers Keep / Try another / Cancel.');};
var wbRootMenu=false,wbRootPaint=paint;paint=function(){wbRootPaint();if(view===8&&collageBrowserRole>=0){rawDraw=true;buttons=buttons.filter(function(b){return b.id!=='browserRoot';});refineButton('wbBrowserRoots','Library folder ▾',20,70,250);if(wbRootMenu){var roots=collageLibraryRoots();rect(20,105,650,roots.length*40+65,[.04,.055,.07,1]);buttons=[];for(var i=0;i<roots.length;i++)button('wbBrowserRoot:'+i,roots[i].slice(-85),30,115+i*40,630);button('wbBrowserChoose','Choose another folder…',30,125+roots.length*40,630);}rawDraw=false;}};
var wbRootAction=action;action=function(id){if(id==='wbBrowserRoots'){wbRootMenu=!wbRootMenu;redraw();return;}if(/^wbBrowserRoot:/.test(id)){var path=collageLibraryRoots()[Number(id.split(':')[1])];if(path)browserSetRoot(path);wbRootMenu=false;view=8;redraw();return;}if(id==='wbBrowserChoose'){wbRootMenu=false;wbRootAction('browserRoot');return;}if(id.indexOf('browser')!==0&&id.indexOf('wbBrowser')!==0)wbRootMenu=false;wbRootAction(id);};
var wbRootClick=onclick;onclick=function(x,y){if(view===8&&wbRootMenu){if(!workflowButtons(x,y)){wbRootMenu=false;redraw();}return;}wbRootClick.apply(this,arguments);};

var wbSlidersBefore=collageSliders;collageSliders=function(){var rows=wbSlidersBefore();for(var i=0;i<rows.length;i++)if(['density','movement','damage'].indexOf(rows[i].field)>=0)rows[i].curve=2;return rows;};

// Configure native overlays once per layout transition, never hide/show or move
// the same controls repeatedly inside a paint. The 5 ms audio clock is unchanged.
function wbNativeHidden(o,value){if(o&&Number(o.hidden)!==value)o.hidden=value;}
var wbNativeRects={};
function wbNativeRect(o,name,values){if(!o)return;var key=values.join(',');if(wbNativeRects[name]!==key){o.message('presentation_rect',values[0],values[1],values[2],values[3]);wbNativeRects[name]=key;}}
var wbDropLayout='';
simpleDrops=function(){
    var key=[view,workflowBank,collageLanePage,roles.length].join(':');if(key===wbDropLayout)return;wbDropLayout=key;wbNativeRects={};
    var ids=['dropLoop','dropWave','dropSound','dropTone'];for(var i=0;i<ids.length;i++)wbNativeHidden(this.patcher.getnamed(ids[i]),(i<2|| (i===2?view!==1:view!==3))?1:0);
    for(var r=0;r<6;r++){var o=this.patcher.getnamed('dropPad'+r),collage=view===26,visible=collage?collageLanePage*6+r<roles.length:view===0&&workflowBank*6+r<roles.length;wbNativeHidden(o,visible?0:1);wbNativeRect(o,'dropPad'+r,collage?[26+r*175,687,148,30]:[20+r*175,612,158,25]);if(o)o.message('ignoreclick',1);}
};
collageHideFields=function(){
    var tempo=this.patcher.getnamed('instrumentTempo'),search=this.patcher.getnamed('librarySearch');wbNativeHidden(search,1);var showing=tempo&&view===26;
    if(showing){var entered=Number(tempo.hidden)!==0;wbNativeHidden(tempo,0);wbNativeRect(tempo,'instrumentTempo',[64,112,80,28]);if(tempoEntryLast!==state.tempo){tempo.message('set',state.tempo);tempoEntryLast=state.tempo;}if(entered&&this.patcher.bringtofront)this.patcher.bringtofront(tempo);}else wbNativeHidden(tempo,1);
};
var wbDrawBefore=redraw,wbLastPlaybackDraw=0;redraw=function(){if(playing){var now=Date.now();if(now-wbLastPlaybackDraw<33)return;wbLastPlaybackDraw=now;}else wbLastPlaybackDraw=0;wbDrawBefore.apply(this,arguments);};
