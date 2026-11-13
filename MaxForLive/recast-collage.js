// Original sample-collage engine. No third-party application code is bundled.
// Sources/cuts, rhythm, ordering and damage have independent random streams.
var collageDefaultsBefore = defaults, collageSnapshotBefore = musicalSnapshot;
var collageJob = null, collagePendingRole = -1, collageAppend = false;
var collageBrowserRole = -1, collageBrowserAppend = false, collageMenu = '';
var collageSelectedLane = 0, collageLanePage = 0, collageQueuedKeep = -1;
var collageAnalysisCache = {}, collageDrag = null;

function collageSettings() {
    return {version:1, enabled:false, density:.22, size:.38, movement:.25,
        damage:.25, breaks:.08, pulse:.7, fadeIn:2, fadeOut:2, voices:24,
        intervalMode:'free', gain:.75, seedCounter:781237,
        seeds:{cuts:101, rhythm:203, order:307, motion:409, damage:503},
        lanes:[], base:[], lastResult:'', keeps:[null,null,null,null]};
}
defaults = function(n) {
    n = collageDefaultsBefore(n);
    if (!n.collage || n.collage.version !== 1) n.collage = collageSettings();
    return n;
};
state = defaults(state);
musicalSnapshot = function() {
    var n = collageSnapshotBefore(); n.collage = copy(state.collage); return n;
};
function collageLane(role) {
    var c = state.collage;
    while (c.lanes.length <= role) c.lanes.push({sources:[], cuts:[], mode:'random',
        structure:'spread', density:1, chance:1, repeat:4, mute:false, solo:false,
        locked:false, choke:false, gain:1, divisions:16, dirty:true});
    return c.lanes[role];
}
function collageRandom(seed) {
    var x = (Number(seed) >>> 0) || 734123;
    return function() { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
}
function collageSeed(seed, a, b) {
    var x = (seed ^ ((a + 1) * 2654435761) ^ ((b + 1) * 1597334677)) >>> 0;
    return x || 314159;
}
function collageNextSeed(name) {
    var c = state.collage; c.seedCounter = (c.seedCounter + 104729) >>> 0;
    c.seeds[name] = collageSeed(c.seedCounter, c.seeds[name], 31);
}
function collageEnsureRole(role) {
    if (role < 0 || role >= 24) return false;
    while (roles.length <= role) {
        var note = 127 - state.extraInstruments.length;
        if (state.renderedNotes.length > renderedPitches.indexOf(note)) {
            say('That lane note belongs to a saved rendered sound. Use a new Recast instance for more lanes.'); return false;
        }
        state.extraInstruments.push({name:'LAYER '+(roles.length+1),note:note,path:'',gain:1});
        syncInstruments();
    }
    return true;
}
function collageAdoptKit() {
    for (var r = 0; r < roles.length; r++) {
        var lane = collageLane(r), path = instrumentPath(r);
        if (!lane.ignoreKit && !lane.sources.length && path) { lane.sources = [path]; lane.dirty = true; }
    }
}
function collageUseFile(role, path, append) {
    if (!collageAudioFile(path)) { say('Choose a supported audio recording.'); return false; }
    if (!collageEnsureRole(role)) return false;
    try {
        var index = archivePath(path);
        if (!buffer(index).framecount()) throw Error('Audio has not loaded.');
        var lane = collageLane(role);
        if (append && lane.sources.indexOf(path) >= 0) { say('This file is already on the lane.'); return false; }
        if (append && lane.sources.length >= 16) { say('A lane holds up to sixteen source files.'); return false; }
        stop(); saveundo();
        lane.sources = append ? lane.sources.concat([path]) : [path];
        lane.cuts = []; lane.dirty = true; state.collage.enabled = true;
        collageSelectedLane = role; state.pad = role;
        say(shortName(path,45)+' loaded on layer '+(role+1)+'. New phrase builds material; New cuts keeps existing timing.');
        return true;
    } catch (err) { say('Source: '+err.message); return false; }
}
// Bounded envelope analysis: useful energy onsets, never a claim of instrument separation.
function collageAnalyse(index, path) {
    var b = buffer(index), frames = b.framecount(), ms = b.length();
    if (!(frames > 0 && ms > 0)) throw Error('Missing audio: '+shortName(path));
    var key = path+'|'+frames+'|'+ms;
    if (collageAnalysisCache[key]) return collageAnalysisCache[key];
    var count = Math.min(6000, Math.max(1, Math.ceil(ms/8))), bins = [], largest = 0;
    for (var i=0; i<count; i++) {
        var at = Math.floor(i*frames/count), n = Math.max(1,Math.min(96,frames-at)), data=b.peek(1,at,n);
        if (typeof data === 'number') data=[data];
        var sum=0; for (var j=0;j<data.length;j++) sum+=data[j]*data[j];
        var rms=Math.sqrt(sum/Math.max(1,data.length)); bins.push(rms); largest=Math.max(largest,rms);
    }
    var attacks=[0], average=0;
    for (var i=1;i<bins.length-1;i++) {
        average = average*.87 + bins[i-1]*.13;
        var t=i*ms/count;
        if (bins[i] > Math.max(largest*.06, average*1.7) && bins[i]>=bins[i-1] && bins[i]>=bins[i+1]
            && t-attacks[attacks.length-1]>35) attacks.push(t);
    }
    var result={duration:ms, attacks:attacks, envelope:bins, peakRms:largest};
    collageAnalysisCache[key]=result; return result;
}
function collageFragmentGain(index, start, end) {
    var b=buffer(index), frames=b.framecount(), ms=b.length(), from=Math.floor(start*frames/ms);
    var to=Math.min(frames,Math.ceil(end*frames/ms)), total=0, peak=0, n=Math.min(128,to-from);
    for(var i=0;i<n;i++) {
        var value=b.peek(1,from+Math.floor(i*(to-from)/n));
        if (!isFinite(value)) value=0;
        total+=value*value; peak=Math.max(peak,Math.abs(value));
    }
    var rms=Math.sqrt(total/Math.max(1,n));
    return {rms:rms,gain:rms>.00001?Math.min(2,.18/rms,.8/Math.max(.001,peak)):1};
}
function collageCutSource(role, path, sourceNumber) {
    var c=state.collage,lane=collageLane(role),index=archivePath(path),a=collageAnalyse(index,path);
    var rnd=collageRandom(collageSeed(c.seeds.cuts,role,sourceNumber)),out=[];
    var min=35+Math.pow(c.size,2)*600, max=Math.min(a.duration,100+Math.pow(c.size,1.6)*5000);
    max=Math.max(Math.min(min,a.duration),max);
    function add(start,end) {
        start=clamp(start,0,Math.max(0,a.duration-1));end=clamp(end,start+1,a.duration);
        var g=collageFragmentGain(index,start,end);
        if(g.rms<.0002&&out.length) return;
        out.push({path:path,index:index,a:start,z:end,dur:end-start,gain:g.gain,rms:g.rms});
    }
    if(lane.mode==='oneshot') add(0,a.duration);
    else if(lane.mode==='divide') {
        var n=clamp(Math.round(lane.divisions),2,64);
        for(var i=0;i<n;i++) add(i*a.duration/n,(i+1)*a.duration/n);
    } else if(lane.mode==='transient') {
        for(var i=0;i<a.attacks.length&&out.length<64;i++) {
            var start=Math.max(0,a.attacks[i]-3),end=i+1<a.attacks.length?a.attacks[i+1]:a.duration;
            add(start,Math.min(end,start+max));
        }
    } else {
        for(var i=0;i<32;i++) {
            var len=Math.min(a.duration,min+rnd()*Math.max(0,max-min)),start=rnd()*Math.max(0,a.duration-len);
            if(a.attacks.length>1&&rnd()<.65) start=clamp(a.attacks[Math.floor(rnd()*a.attacks.length)]-3,0,Math.max(0,a.duration-len));
            add(start,start+len);
        }
    }
    if(!out.length) add(0,Math.min(a.duration,max));
    return out;
}
function collageBuildLane(role) {
    var lane=collageLane(role),out=[];
    var perSource=Math.max(1,Math.floor(256/Math.max(1,lane.sources.length)));
    for(var i=0;i<lane.sources.length;i++) {
        var cuts=collageCutSource(role,lane.sources[i],i);
        if(cuts.length>perSource){var chosen=[];for(var k=0;k<perSource;k++)chosen.push(cuts[Math.floor(k*cuts.length/perSource)]);cuts=chosen;}
        out=out.concat(cuts);
    }
    lane.cuts=out.slice(0,256); lane.dirty=false;
}
function collageActiveRoles() {
    var out=[];for(var r=0;r<roles.length;r++) if(collageLane(r).sources.length)out.push(r);return out;
}
function collagePrepare(callback) {
    if(collageJob)collageJob.cancel();
    var rolesToBuild=collageActiveRoles().filter(function(r){return collageLane(r).dirty||!collageLane(r).cuts.length;}),at=0;
    if(!rolesToBuild.length){callback();return;}
    collageJob=new Task(function(){
        try {
            if(at<rolesToBuild.length){var role=rolesToBuild[at++];status='Preparing fragments '+at+' / '+rolesToBuild.length;mgraphics.redraw();collageBuildLane(role);collageJob.schedule(2);}
            else {collageJob=null;callback();}
        }catch(err){collageJob=null;say('Fragment preparation: '+err.message);}
    },this);collageJob.schedule(1);
}
function collageShuffle(a,rnd) {
    a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;
}
// Choose a fixed set of positions. Repeating cells reuse the same ordering.
function collagePositions(role, length, count) {
    var lane=collageLane(role),c=state.collage,rnd=collageRandom(collageSeed(c.seeds.rhythm,role,0));
    var positions=[],scores=[],centers=[rnd()*length,rnd()*length];
    if(lane.structure==='spread') {
        var rotate=Math.floor(rnd()*length);
        for(var i=0;i<count;i++) positions.push((Math.floor(i*length/count)+rotate)%length);
        return positions.sort(function(a,b){return a-b;});
    }
    for(var i=0;i<length;i++) {
        var strength=i%16===0?1:i%4===0?.75:i%2===0?.3:0;
        var score=rnd()*(1-c.pulse*.65)+strength*c.pulse;
        if(lane.structure==='cluster') {
            var d=Math.min(Math.abs(i-centers[0]),Math.abs(i-centers[1]));
            score+=1-Math.min(d,length-d)/Math.max(1,length/3);
        }
        if(lane.structure==='drums') {
            var step=i%16;
            if(role===0)score+=step===0||step===8?4:step===10?1:0;
            else if(role===1)score+=step===4||step===12?4:step===3||step===11?.3:0;
            else score+=step%2===0?1:.1;
        }
        scores.push({cell:i,score:score});
    }
    scores.sort(function(a,b){return b.score-a.score;});
    for(var i=0;i<count;i++) positions.push(scores[i].cell);
    return positions.sort(function(a,b){return a-b;});
}
function collageNewRhythm() {
    var c=state.collage,active=collageActiveRoles(),out=[];
    var budget=Math.max(1,Math.floor(760/Math.max(1,active.length)));
    for(var j=0;j<active.length;j++) {
        var role=active[j],lane=collageLane(role),period=Math.min(beats(),lane.repeat*4),cells=Math.max(1,Math.round(period*4));
        var repeats=Math.ceil(beats()/period),count=Math.min(Math.max(0,Math.round(cells*c.density*lane.density)),Math.max(1,Math.floor(budget/repeats)),cells);
        var positions=collagePositions(role,cells,count),rnd=collageRandom(collageSeed(c.seeds.rhythm,role,1));
        for(var off=0;off<beats();off+=period)for(var i=0;i<positions.length;i++) {
            var beat=off+positions[i]/4;
            if(beat>=beats()) continue;
            out.push({id:++uid,role:role,beat:beat,slice:0,velocity:Math.round(62+rnd()*45),pitch:0,reverse:false,
                collage:true,collageOrdinal:out.length,foundation:lane.structure==='drums'&&role<2&&positions[i]%4===0});
        }
    }
    return out.sort(function(a,b){return a.beat-b.beat;});
}
function collageEligible(e) {
    return !protectedHit(e)&&!collageLane(e.role).locked&&inScope(e.beat)&&spaceContains(e.role,e.beat)&&(workflowTarget<0||workflowTarget===e.role);
}
function collageDecorate(base) {
    var c=state.collage,out=[],counts={},scale=c.intervalMode==='minor'?[0,2,3,5,7,8,10]:c.intervalMode==='major'?[0,2,4,5,7,9,11]:null;
    var total=collageActiveRoles().length,volume=.58*c.gain/Math.sqrt(Math.max(1,total/3));
    for(var i=0;i<base.length;i++) {
        var e=copy(base[i]),lane=collageLane(e.role);
        if(!collageEligible(e)){out.push(e);continue;}
        if(!lane.cuts.length)continue;
        var ordinal=counts[e.role]||0;counts[e.role]=ordinal+1;
        var order=collageRandom(collageSeed(c.seeds.order,e.role,ordinal)),motion=collageRandom(collageSeed(c.seeds.motion,e.role,ordinal)),damage=collageRandom(collageSeed(c.seeds.damage,e.role,ordinal));
        var pick=Math.floor(order()*lane.cuts.length),fragment=lane.cuts[pick];
        // Avoid the same fragment three times in a row without hiding all short repetitions.
        if(ordinal>1&&lane.cuts.length>1&&out.length>1&&out[out.length-1].collagePick===pick&&out[out.length-2].collagePick===pick)pick=(pick+1)%lane.cuts.length;
        fragment=lane.cuts[pick];e.collagePick=pick;
        if(!e.hitSamplePath) {
            e.source={index:fragment.index,a:fragment.a,z:fragment.z,dur:fragment.dur,gain:fragment.gain*volume*lane.gain};
            e.collagePath=fragment.path;
        }
        e.collage=true;e.performanceFixed=true;e.collageChance=lane.chance;
        e.chokeGroup=lane.choke?e.role+1:0;
        var shift=(motion()-.5)*c.movement*.22,dest=e.beat+shift;
        if(dest>=0&&dest<beats()&&!locked(dest)&&inScope(dest)&&spaceContains(e.role,dest))e.beat=dest;
        var degree=Math.round((motion()-.5)*c.movement*14);
        e.pitch=(e.pitch||0)+(scale?(degree<0?-1:1)*scale[Math.abs(degree)%7]+Math.floor(Math.abs(degree)/7)*12*(degree<0?-1:1):degree);
        e.reverse=!!e.reverse !== (motion()<c.movement*.3);
        // Space is generated in short regions rather than uniform thinning.
        var bar=Math.floor(e.beat/4),gap=collageRandom(collageSeed(c.seeds.rhythm,bar,199));
        var gapStart=gap()*3,gapLength=.25+gap()*1.25;
        if(gap()<c.breaks&&e.beat%4>=gapStart&&e.beat%4<gapStart+gapLength&&!e.foundation)continue;
        var rough=damage()<c.damage,rate=Math.pow(2,e.pitch/12),natural=e.source?e.source.dur/rate*state.tempo/60000:.25;
        if(!e.durationBeats)e.durationBeats=Math.max(.025,Math.min(16,natural));
        if(rough&&!e.foundation) {
            e.reverse=damage()<.35?!e.reverse:e.reverse;
            if(damage()<.65)e.durationBeats=Math.min(e.durationBeats,.035+damage()*.22);
            if(damage()<.2){e.collageFX=damage()<.5?'crush':'echo';}
        }
        e.collageFadeIn=c.fadeIn;e.collageFadeOut=c.fadeOut;
        out.push(e);
        if(rough&&!e.foundation&&damage()<.4&&!e.collageRepeat) {
            var n=damage()<.55?2:3,span=damage()<.5?.25:.5;
            for(var k=1;k<n;k++) {
                var h=copy(e);h.id=++uid;h.beat=e.beat+span*k/n;
                if(h.beat>=beats()||!inScope(h.beat)||!spaceContains(h.role,h.beat)||locked(h.beat))continue;
                h.velocity=Math.round(e.velocity*(1-.6*k/n));h.durationBeats=Math.min(h.durationBeats,span/n*.8);h.collageRepeat=true;h.damageRepeat=true;h.pitch-=k;out.push(h);
            }
        }
    }
    return bounded(out);
}
function collageGenerate(mode, autoPlay) {
    if(collageJob){say('Preparing fragments; wait or press Stop to cancel.');return;}
    collageAdoptKit();
    if(!collageActiveRoles().length){say('Drop a recording onto a layer, or choose Browse.');return;}
    if(state.scope===2&&!selection){say('Select an area, or choose Whole pattern in the grid.');return;}
    var resumeAfter=!!autoPlay||playing;
    stop();saveundo();if(mode==='phrase'&&typeof collageApplyStyle==='function')collageApplyStyle();state.collage.enabled=true;
    var c=state.collage;
    if(mode==='phrase'||mode==='cuts') {
        collageNextSeed('cuts');for(var r=0;r<roles.length;r++)if(!collageLane(r).locked)collageLane(r).dirty=true;
    }
    if(mode==='phrase'||mode==='rhythm')collageNextSeed('rhythm');
    if(mode==='phrase'||mode==='order')collageNextSeed('order');
    if(mode==='phrase'||mode==='movement')collageNextSeed('motion');
    if(mode==='phrase'||mode==='damage')collageNextSeed('damage');
    collagePrepare(function(){
        try {
            var before=copy(state.events),base;
            if(mode==='phrase'||mode==='rhythm'||!c.base.length)base=collageNewRhythm();
            else base=copy(c.lastResult===JSON.stringify(state.events)?c.base:state.events);
            var fixed=before.filter(function(e){return !collageEligible(e);}),ids=fixed.map(function(e){return e.id;});
            base=fixed.concat(base.filter(function(e){return collageEligible(e)&&ids.indexOf(e.id)<0;}));
            c.base=copy(base);state.events=collageDecorate(base);state.original=copy(base);state.feelBase=copy(base);
            c.lastResult=JSON.stringify(state.events);state.mode=0;invalidateOptions();workflowSelection=[];selected=-1;
            say('New '+mode+' · '+state.events.length+' events. Other decisions and protected material retained.');
            if(resumeAfter)play();
        }catch(err){say('Collage: '+err.message);}
    });
}
// Current-cycle probability is resolved once, shared by preparation, view and export.
var collagePlanCache=null,collageAuditionBefore=auditionEvents;
function collagePlan(cycleNumber,events) {
    var c=state.collage,key=JSON.stringify([cycleNumber,events,c.voices,c.lanes.map(function(l){return [l.mute,l.solo,l.chance];})]);
    if(collagePlanCache&&collagePlanCache.key===key)return collagePlanCache.events;
    var solo=c.lanes.some(function(l){return l.solo;}),out=[];
    for(var i=0;i<events.length;i++) {
        var e=events[i],l=collageLane(e.role);
        if(e.collage&&(l.mute||solo&&!l.solo))continue;
        if(e.collage&&!e.collageCommitted) {
            var rnd=collageRandom(collageSeed(c.seeds.rhythm,e.id%100000,cycleNumber));
            if(rnd()>l.chance)continue;
        }
        out.push(e);
    }
    // Voice limiting is explicit, based on gates and pitch-adjusted duration.
    var active=[],limited=[];
    out.sort(function(a,b){return a.beat-b.beat;});
    for(var i=0;i<out.length;i++) {
        var e=out[i];active=active.filter(function(a){return a.end>e.beat&&!(e.chokeGroup>0&&a.group===e.chokeGroup);});
        if(active.length>=c.voices)continue;
        limited.push(e);active.push({end:e.beat+(e.durationBeats||.25),group:e.chokeGroup||0});
    }
    collagePlanCache={key:key,events:limited};return limited;
}
auditionEvents=function(){
    var events=collageAuditionBefore();
    return state.collage.enabled?collagePlan(performanceCycleNow(),events):events;
};
function collageCommit() {
    if(!state.collage.enabled)return;
    var plan=copy(auditionEvents());stop();saveundo();
    for(var i=0;i<plan.length;i++){plan[i].collageCommitted=true;plan[i].performanceFixed=true;}
    state.events=plan;state.collage.base=copy(plan);state.collage.lastResult=JSON.stringify(plan);
    say('Committed this probability / voice-limit realization. Export now uses these exact events.');
}
var collageSoundBefore=sound;
sound=function(e) {
    if(!e.collage)return collageSoundBefore(e);
    var n=copy(e),lane=collageLane(e.role);
    if(e.collageFX) {
        n.art=n.art||articulation();
        if(e.collageFX==='crush'){n.art.flutter=16;n.art.duty=.4;}
        else {delete n.art;n.performanceRegions=(n.performanceRegions||[]).concat([{start:e.beat,end:e.beat+(e.durationBeats||.5),role:e.role,type:6,depth:.4,attack:0,release:.02,curve:1}]);}
    }
    // Envelopes longer than the native 2ms fade use the existing shared renderer.
    if(e.collageFadeIn>2||e.collageFadeOut>2) {
        n.art=n.art||articulation();n.art.attack=e.collageFadeIn;n.art.release=e.collageFadeOut;
    }
    return collageSoundBefore(n);
};
function collageKeep(index) {
    if(!state.events.length){say('Generate a phrase first.');return;}
    var old=copy(state.collage.keeps),snap=musicalSnapshot();
    // Keep slots never recursively contain previous keep slots.
    snap.collage.keeps=[null,null,null,null];snap.options=[];snap.family=[];
    old[index]=snap;state.collage.keeps=old;say('Phrase '+(index+1)+' kept with sources, cuts and settings.');
}
function collageRecall(index) {
    var kept=state.collage.keeps[index];if(!kept){say('This Keep slot is empty.');return false;}
    var slots=copy(state.collage.keeps);saveundo();applySnapshot(copy(kept));state.collage.keeps=slots;
    collagePlanCache=null;view=26;say('Recalled phrase '+(index+1)+'.');return true;
}
var collageStopBefore=stop;stop=function(){if(collageJob){collageJob.cancel();collageJob=null;}collageStopBefore();};
var collageTickBefore=tick;tick=function(){
    if(collageQueuedKeep>=0&&playing){var absolute=(Date.now()-playTime)*state.tempo/60000;if(Math.floor(absolute/4)>Math.floor(Math.max(0,lastBeat)/4)){var index=collageQueuedKeep;collageQueuedKeep=-1;collageRecall(index);play();return;}}
    collageTickBefore();
};
clock.cancel();clock=new Task(function(){tick();},this);clock.interval=5;
