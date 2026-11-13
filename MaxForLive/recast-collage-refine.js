// Source-pool management and periodic voice reservations, independently implemented.
var collageReservations=null,collageOrderCache={};
function collageChooseCut(role,ordinal) {
    var lane=collageLane(role),c=state.collage,cuts=lane.cuts,weights=lane.sourceWeights||{},eligible=[];
    for(var i=0;i<cuts.length;i++)if(weights[cuts[i].path]!==0)eligible.push(i);
    if(!eligible.length)return -1;
    if(lane.orderMode==='cycle')return eligible[ordinal%eligible.length];
    if(lane.orderMode==='shuffle') {
        var cycle=Math.floor(ordinal/eligible.length),key=role+'|'+c.seeds.order+'|'+JSON.stringify(eligible)+'|'+cycle;
        if(!collageOrderCache[key])collageOrderCache[key]=collageShuffle(eligible,collageRandom(collageSeed(c.seeds.order,role,cycle)));
        return collageOrderCache[key][ordinal%eligible.length];
    }
    // Weight recordings, then choose a cut within the selected recording. More cuts do not buy more votes.
    var paths=[],totals=[],total=0;
    for(var i=0;i<eligible.length;i++){var path=cuts[eligible[i]].path;if(paths.indexOf(path)<0){paths.push(path);total+=weights[path]===undefined?1:Math.max(0,weights[path]);totals.push(total);}}
    var rnd=collageRandom(collageSeed(c.seeds.order,role,ordinal)),target=rnd()*total,selected=paths.length-1;
    for(var i=0;i<totals.length;i++)if(target<totals[i]){selected=i;break;}
    var group=eligible.filter(function(i){return cuts[i].path===paths[selected];});
    return group[Math.min(group.length-1,Math.floor(rnd()*group.length))];
}
function collagePeriodicIntervals(event,duration,period) {
    var full=Math.floor(duration/period),rest=duration-full*period,start=((event.beat%period)+period)%period,edges=[];
    if(full)edges.push({at:0,delta:full},{at:period,delta:-full});
    if(rest>.0000001){var end=start+rest;edges.push({at:start,delta:1},{at:Math.min(period,end),delta:-1});if(end>period)edges.push({at:0,delta:1},{at:end-period,delta:-1});}
    return edges;
}
function collagePeakReservations(edges) {
    var sorted=edges.slice().sort(function(a,b){return a.at-b.at||a.delta-b.delta;}),count=0,peak=0;
    for(var i=0;i<sorted.length;){var at=sorted[i].at,delta=0;while(i<sorted.length&&Math.abs(sorted[i].at-at)<.00000001)delta+=sorted[i++].delta;count+=delta;peak=Math.max(peak,count);}
    return peak;
}
function collageReserveVoices(events) {
    var c=state.collage,period=beats();
    if(collageReservations&&collageReservations.input===events&&collageReservations.voices===c.voices&&collageReservations.period===period&&collageReservations.tempo===state.tempo)return collageReservations.events;
    var sorted=events.slice().sort(function(a,b){return a.beat-b.beat;}),edges=[],out=[],previous=renderEventContext;
    renderEventContext=events;
    try{
        for(var i=0;i<sorted.length;i++){
            var e=sorted[i];if(!e.collage){out.push(e);continue;}
            var duration=sound(e).dur*state.tempo/60000,add=collagePeriodicIntervals(e,Math.max(.00001,duration),period);
            if(collagePeakReservations(edges.concat(add))<=c.voices){out.push(e);edges=edges.concat(add);}
        }
    }finally{renderEventContext=previous;}
    collageReservations={input:events,voices:c.voices,period:period,tempo:state.tempo,events:out};return out;
}
var collageRefineStop=stop;stop=function(){collageReservations=null;collagePlanCache=null;collageOrderCache={};collageRefineStop();};
// Native voice allocation should not steal a still-ringing voice just because its round-robin index came around.
var collageRefineTrigger=trigger,collageVoiceEnds={},collageVoiceDispatchCount=0;
trigger=function(e){
    if(!e.collage){collageRefineTrigger(e);return;}collageVoiceDispatchCount++;
    var now=Date.now();for(var i=1;i<=32;i++)if(!collageVoiceEnds[i]||collageVoiceEnds[i]<=now){voice=i-1;collageRefineTrigger(e);var started=playing&&e.performanceCycle!==undefined?playTime+(e.performanceCycle*beats()+e.beat)*60000/state.tempo:now;collageVoiceEnds[voice]=started+(e.frozen?e.frozen.dur:sound(e).dur);return;}
    // The periodic budget normally prevents this. Preserve existing tails if a live MIDI intervention fills the pool.
};
var collageRefineVoiceStop=stop;stop=function(){collageVoiceEnds={};collageRefineVoiceStop();};
function collageSourceWeight(path){var weights=collageLane(collageSelectedLane).sourceWeights||{};return weights[path]===undefined?1:weights[path];}
function collageHearSource(index) {
    var lane=collageLane(collageSelectedLane),path=lane.sources[index];if(!path)return;
    try{var at=collageSourceBuffer(path),cut=lane.cuts.filter(function(f){return f.path===path;})[0],a=cut?cut.a:0,z=cut?Math.min(cut.z,a+4000):Math.min(buffer(at).length(),4000),gain=collageFragmentGain(at,a,z).gain;
        outlet(0,'stopvoice',33);outlet(0,'voice',33,ns+'-b'+at,a,z,z-a,.35*gain,Math.min(2,buffer(at).channelcount()));say('Previewing '+shortName(path,55)+' · up to four seconds.');
    }catch(err){say('Source preview: '+err.message);}
}
var collageRefinePaint=paint;paint=function(){
    if(view!==28){collageRefinePaint();if(view===27&&!collageMenu){rawDraw=true;button('collageSources','Manage source pool…',585,685,390);rawDraw=false;}return;}
    buttons=[];rawDraw=true;simpleDrops();collageHideFields();rect(0,0,1080,880,[.07,.085,.10,1]);text('RECAST',20,40,29,[.95,.73,.42,1]);text('LAYER '+(collageSelectedLane+1)+' / RECORDINGS',20,105,22);
    button('collageDetails','Back to layer settings',780,65,280);button('collageAppend:'+collageSelectedLane,'Add recording…',20,130,210);button('collageSourceOrder','Order: '+(collageLane(collageSelectedLane).orderMode||'weighted')+' ▾',250,130,290);button('collageSourcePreviewStop','Stop preview',780,130,280);
    text('Weights apply to weighted selection; Cycle and Shuffle visit each enabled cut. Zero disables a source.',20,199,12);
    text('Changes affect the next phrase or fragment shuffle. The current phrase remains intact.',20,222,12);
    var lane=collageLane(collageSelectedLane);
    for(var i=0;i<lane.sources.length;i++){
        var x=20+Math.floor(i/8)*530,y=248+(i%8)*64,path=lane.sources[i],weight=collageSourceWeight(path);
        rect(x,y,510,57,[.115,.14,.16,1]);text(shortName(path,34),x+7,y+20,12,weight?[.78,.83,.84,1]:[.45,.5,.52,1]);
        button('collageSourceHear:'+i,'Hear',x+7,y+28,64);button('collageSourceLess:'+i,'−',x+83,y+28,36);text(Math.round(weight*100)+'%',x+127,y+47,11);button('collageSourceMore:'+i,'+',x+180,y+28,36);button('collageSourceRemove:'+i,'Remove',x+406,y+28,96);
    }
    if(!lane.sources.length)text('No recordings yet. Add one above or drop audio onto the main layer card.',20,290,15);
    if(collageMenu==='sourceOrder'){rect(250,166,290,105,[.055,.07,.08,1]);buttons=buttons.filter(function(b){return !(b.x<540&&b.x+b.w>250&&b.y<271&&b.y+b.h>166);});var modes=[['weighted','Weighted random'],['cycle','Cycle cuts in order'],['shuffle','Use each cut before reshuffling']];for(var i=0;i<modes.length;i++)button('collageSourceOrder:'+modes[i][0],modes[i][1],255,171+i*31,280);}
    text(status.slice(0,140),20,855,11,[.65,.79,.74,1]);rawDraw=false;
};
var collageRefineAction=action;action=function(id){
    if(id==='collageSources'){view=28;collageMenu='';redraw();return;}
    if(id==='collageSourceOrder'){collageMenu=collageMenu==='sourceOrder'?'':'sourceOrder';redraw();return;}
    if(/^collageSourceOrder:(weighted|cycle|shuffle)$/.test(id)){saveundo();collageLane(collageSelectedLane).orderMode=id.split(':')[1];collageOrderCache={};collageMenu='';redraw();return;}
    if(id==='collageSourcePreviewStop'){outlet(0,'stopvoice',33);return;}
    var match=id.match(/^collageSource(Hear|Less|More|Remove):(\d+)$/);
    if(match){var index=Number(match[2]),lane=collageLane(collageSelectedLane),path=lane.sources[index];if(!path)return;if(match[1]==='Hear'){collageHearSource(index);return;}
        stop();saveundo();
        if(match[1]==='Remove'){lane.sources.splice(index,1);lane.cuts=lane.cuts.filter(function(f){return f.path!==path;});lane.ignoreKit=true;lane.dirty=true;}
        else {if(!lane.sourceWeights)lane.sourceWeights={};var choices=[0,.25,.5,1,2,4],current=collageSourceWeight(path),at=choices.indexOf(current);lane.sourceWeights[path]=choices[clamp(at+(match[1]==='More'?1:-1),0,choices.length-1)];}
        say('Source pool updated. Shuffle fragments or make a new phrase to hear the change.');return;
    }
    collageRefineAction(id);
};
var collageRefineClick=onclick;onclick=function(x,y){if(view===28){if(!workflowButtons(x,y)&&collageMenu){collageMenu='';redraw();}return;}collageRefineClick.apply(this,arguments);};
// Keep/Undo can restore a shorter archive table after later sources reused those buffer slots.
// Reload the restored paths instead of trusting whichever recording is currently decoded at an index.
function collageArchiveReferences(n) {
    var used={},byPath={};for(var i=0;i<state.archivePaths.length;i++)byPath[state.archivePaths[i]]=i;
    function visit(value,key){if(key==='archivePaths'||key==='keeps'||key==='keepers'||key==='library'||key==='candidates'||key==='sampleBrowser')return;
        if(typeof value==='string'){if(byPath[value]!==undefined)used[byPath[value]]=true;return;}
        if(!value||typeof value!=='object')return;
        if(typeof value.index==='number'&&value.index>=7)used[value.index-7]=true;
        for(var k in value)if(value.hasOwnProperty(k))visit(value[k],k);
    }
    visit(n,'');return used;
}
var collageRestoreArchivesBefore=restoreArchives;
restoreArchives=function(){
    if(!state.collage||!state.collage.enabled){collageRestoreArchivesBefore();return;}
    var used=collageArchiveReferences(state),parent=this.patcher.parentpatcher;
    for(var i=0;i<archivedObjects.length;i++)if(archivedObjects[i])parent.remove(archivedObjects[i]);archivedObjects=[];
    for(var k in used)if(used.hasOwnProperty(k)&&state.archivePaths[Number(k)]){var n=Number(k),obj=parent.newdefault(20,1000+n*25,'buffer~',ns+'-b'+(7+n));archivedObjects[n]=obj;if(sessionFileExists(state.archivePaths[n]))obj.message('import',state.archivePaths[n]);}
    artCache={};performanceSourceCache={};collageAnalysisCache={};collagePitchCache={};collageReservations=null;collagePlanCache=null;
};
var collageRestoreSnapshotBefore=applySnapshot;applySnapshot=function(n){collageRestoreSnapshotBefore(n);if(state.collage&&state.collage.enabled)restoreArchives();};
function collageReleaseUnused(){
    if(playing||preparing||collageJob||collageExportJob)return 0;
    var used=collageArchiveReferences(state),freed=0;
    for(var i=0;i<archivedObjects.length;i++)if(archivedObjects[i]&&!used[i]){this.patcher.parentpatcher.remove(archivedObjects[i]);archivedObjects[i]=null;freed++;}
    if(freed){artCache={};performanceSourceCache={};collageAnalysisCache={};collagePitchCache={};}
    return freed;
}
var collageMemoryAction=action;action=function(id){if(id==='collageReleaseUnused'){var freed=collageReleaseUnused();say('Released '+freed+' unused decoded buffers. Recordings and saved phrases remain on disk.');return;}collageMemoryAction(id);};
