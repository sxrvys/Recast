// Original FFT chroma estimator. Key profiles are published numeric research data, not a copied app engine.
// Background: Napoles Lopez et al., Key-Finding Based on a Hidden Markov Model and Key Profiles (2019).
function collageFFT(real,imag){var n=real.length;for(var i=1,j=0;i<n;i++){var bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){var t=real[i];real[i]=real[j];real[j]=t;t=imag[i];imag[i]=imag[j];imag[j]=t;}}
    for(var span=2;span<=n;span*=2){var a=-2*Math.PI/span,wr=Math.cos(a),wi=Math.sin(a);for(var base=0;base<n;base+=span){var r=1,z=0;for(var k=0;k<span/2;k++){var u=base+k,v=u+span/2,tr=r*real[v]-z*imag[v],ti=r*imag[v]+z*real[v];real[v]=real[u]-tr;imag[v]=imag[u]-ti;real[u]+=tr;imag[u]+=ti;var next=r*wr-z*wi;z=r*wi+z*wr;r=next;}}}}
function collageChromaFrame(index,ms){
    var b=buffer(index),rate=b.framecount()*1000/b.length(),stride=Math.max(1,Math.floor(rate/11025)),sampleRate=rate/stride,n=4096,offset=Math.max(0,Math.floor(ms*rate/1000)),available=Math.min(n*stride,b.framecount()-offset);
    if(available<n/2*stride)return null;var raw=b.peek(1,offset,available);if(typeof raw==='number')return null;
    var real=[],imag=[],mean=0,energy=0;
    for(var i=0;i<n;i++){var sum=0,count=0;for(var j=0;j<stride&&i*stride+j<raw.length;j++){sum+=raw[i*stride+j];count++;}var value=count?sum/count:0;real.push(value);imag.push(0);mean+=value;}
    mean/=n;for(var i=0;i<n;i++){real[i]=(real[i]-mean)*(.5-.5*Math.cos(2*Math.PI*i/(n-1)));energy+=real[i]*real[i];}if(energy/n<.000002)return null;
    collageFFT(real,imag);var power=[],chroma=[0,0,0,0,0,0,0,0,0,0,0,0],total=0;
    for(var i=0;i<n/2;i++)power.push(Math.sqrt(real[i]*real[i]+imag[i]*imag[i]));
    for(var bin=Math.ceil(45*n/sampleRate);bin<Math.min(n/2-1,Math.floor(4000*n/sampleRate));bin++){
        if(power[bin]<power[bin-1]||power[bin]<power[bin+1])continue;
        var before=power[bin-1],peak=power[bin],after=power[bin+1],den=before-2*peak+after,delta=den?clamp(.5*(before-after)/den,-.5,.5):0,hz=(bin+delta)*sampleRate/n,midi=69+12*Math.log(hz/440)/Math.LN2,note=Math.round(midi),distance=Math.abs(midi-note);
        if(distance>.48)continue;var weight=Math.pow(peak,.8)*(1-distance)*1/Math.pow(hz/100,.15),pc=((note%12)+12)%12;chroma[pc]+=weight;total+=weight;
    }
    if(total<=0)return null;return chroma.map(function(v){return v/total;});
}
function collageCorrelation(a,b){var am=0,bm=0;for(var i=0;i<12;i++){am+=a[i];bm+=b[i];}am/=12;bm/=12;var cross=0,aa=0,bb=0;for(var i=0;i<12;i++){var x=a[i]-am,y=b[i]-bm;cross+=x*y;aa+=x*x;bb+=y*y;}return cross/Math.sqrt(Math.max(1e-20,aa*bb));}
function collageClassifyKey(chroma){
    var major=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],minor=[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17],candidates=[],maximum=Math.max.apply(Math,chroma),active=chroma.filter(function(v){return v>maximum*.25;}).length;
    for(var root=0;root<12;root++)for(var mode=0;mode<2;mode++){var profile=mode?minor:major,rotated=[];for(var pc=0;pc<12;pc++)rotated.push(profile[(pc-root+12)%12]);candidates.push({root:root,mode:mode?'minor':'major',score:collageCorrelation(chroma,rotated)});}
    candidates.sort(function(a,b){return b.score-a.score;});var best=candidates[0],margin=best.score-candidates[1].score,total=chroma.reduce(function(a,b){return a+b;},0),contrast=maximum/Math.max(.000001,total);
    return {root:best.root,mode:best.mode,confidence:Math.max(0,best.score),margin:margin,confident:best.score>=.55&&margin>=.025&&active>=3&&contrast>.13,chroma:chroma};
}
function collageKeyFingerprint(path,index){var b=buffer(index);return path+'|'+b.framecount()+'|'+b.length();}
function collageKeyResult(path){var c=state.collage,override=(c.sourceKeyOverrides||{})[path];if(override==='skip')return {confident:false,skipped:true};if(override)return {root:override.root,mode:override.mode,confident:true,confidence:1,margin:1,manual:true};var keys=c.sourceKeys||{};return keys[path]||null;}
function collageKeyName(result){return result&&result.confident?['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][result.root]+' '+result.mode:'Uncertain / left untuned';}
function collageResolveTarget(){var c=state.collage;if(c.keyTarget==='manual')return {root:c.root||0,mode:c.intervalMode==='minor'?'minor':'major',manual:true};var best=null;
    var solo=c.lanes.some(function(l){return l.solo;});
    for(var r=0;r<roles.length;r++){var lane=collageLane(r);if(lane.mute||lane.chance<=0||solo&&!lane.solo)continue;var paths=lane.sources;for(var i=0;i<paths.length;i++){if(lane.sourceWeights&&lane.sourceWeights[paths[i]]===0)continue;var key=collageKeyResult(paths[i]);if(key&&key.confident&&(!best||key.confidence*key.margin>best.confidence*best.margin))best=key;}}
    return best?{root:best.root,mode:best.mode}:null;
}
function collageKeyTranspose(source,target){var root=source.root;if(source.mode!==target.mode)root=(root+(source.mode==='major'?9:3))%12;var shift=((target.root-root+18)%12)-6;return shift;}
var collageKeyPrepareBefore=collagePrepare;
function collageAnalyseKeys(done){
    var c=state.collage;if(!c.sourceKeys)c.sourceKeys={};var paths=[],at=0,current=null,windows=12;
    for(var r=0;r<roles.length;r++)for(var i=0;i<collageLane(r).sources.length;i++){var path=collageLane(r).sources[i];if(paths.indexOf(path)<0)paths.push(path);}
    if(collageJob){say('Finish or stop the current preparation first.');return;}
    collageJob=new Task(function(){try{
        if(!current&&at<paths.length){var path=paths[at++],index=collageSourceBuffer(path),fingerprint=collageKeyFingerprint(path,index);if(c.sourceKeys[path]&&c.sourceKeys[path].fingerprint===fingerprint){collageJob.schedule(1);return;}current={path:path,index:index,fingerprint:fingerprint,window:0,count:0,chroma:[0,0,0,0,0,0,0,0,0,0,0,0]};}
        if(current){var duration=buffer(current.index).length(),maxStart=Math.max(0,duration-420),time=windows>1?current.window*maxStart/(windows-1):0,frame=collageChromaFrame(current.index,time);if(frame){current.count++;for(var i=0;i<12;i++)current.chroma[i]+=frame[i];}current.window++;
            if(current.window>=windows){var result=collageClassifyKey(current.chroma);result.fingerprint=current.fingerprint;result.frames=current.count;if(!current.count)result.confident=false;c.sourceKeys[current.path]=result;current=null;}
        }
        if(!current&&at>=paths.length){collageJob=null;c.detectedTarget=collageResolveTarget();if(done)done();else say('Key analysis complete. Target: '+collageKeyName(c.detectedTarget&&{root:c.detectedTarget.root,mode:c.detectedTarget.mode,confident:true})+'. Ambiguous sources stay untuned.');return;}
        status='Analysing source keys · '+at+' / '+paths.length;mgraphics.redraw();collageJob.schedule(1);
    }catch(err){collageJob=null;say('Key analysis: '+err.message);}},this);collageJob.schedule(1);
}
collagePrepare=function(done){if(!state.collage.keySync){collageKeyPrepareBefore(done);return;}collageAnalyseKeys(function(){collageKeyPrepareBefore(done);});};
var collageKeyDecorate=collageDecorate;collageDecorate=function(base){var events=collageKeyDecorate(base),c=state.collage;if(!c.keySync)return events;var target=collageResolveTarget();c.detectedTarget=target;if(!target)return events;
    for(var i=0;i<events.length;i++){var e=events[i],source=collageKeyResult(e.collagePath);if(!e.collage||!collageEligible(e)||!source||!source.confident)continue;var before=e.pitch||0,shift=collageKeyTranspose(source,target),global=c.globalPitch||0;e.pitch=clamp(Math.round((before-global)/12)*12+shift+global,-48,48);e.collageKeyShift=shift;e.collageSourceKey={root:source.root,mode:source.mode};if(e.durationBeats&&!c.useGateRange)e.durationBeats*=Math.pow(2,(before-e.pitch)/12);}
    return events;
};
var collageKeyPaint=paint;paint=function(){collageKeyPaint();if(view===27&&collageSection==='pitch'&&!collageMenu){rawDraw=true;var c=state.collage,target=collageResolveTarget();button('collageKeySync','Recording key sync: '+(c.keySync?'On':'Off'),585,170,390,c.keySync);button('collageKeyTarget','Target: '+(c.keyTarget==='manual'?'Manual root / scale':'Auto from confident sources'),585,230,390);button('collageAnalyseKeys','Analyse source keys',585,420,390);text('Target estimate: '+(target?['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][target.root]+' '+target.mode:'uncertain'),585,490,13);text('Whole-recording key sync preserves chord intervals; uncertain recordings are left unchanged.',30,715,13);text('Relative major/minor families are aligned. Pitch motion uses octaves on key-synced sources.',30,745,13);rawDraw=false;}
    if(view===28&&!collageMenu){rawDraw=true;var paths=collageLane(collageSelectedLane).sources;for(var i=0;i<paths.length;i++){var result=collageKeyResult(paths[i]);button('collageSourceKey:'+i,result&&result.manual?collageKeyName(result)+' *':result&&result.skipped?'Key sync: skip':result&&result.confident?collageKeyName(result):'Set source key…',20+Math.floor(i/8)*530+235,248+(i%8)*64+28,160);}rawDraw=false;}
    if(view===28&&collageMenu==='sourceKey')collageDrawSourceKey();
};
var collageKeyAction=action;action=function(id){if(id==='collageKeySync'){stop();saveundo();state.collage.keySync=!state.collage.keySync;redraw();return;}if(id==='collageKeyTarget'){saveundo();state.collage.keyTarget=state.collage.keyTarget==='manual'?'auto':'manual';if(state.collage.keyTarget==='manual'&&state.collage.intervalMode==='free')state.collage.intervalMode='major';redraw();return;}if(id==='collageAnalyseKeys'){if(collageJob){say('Preparation is running. Stop cancels it.');return;}stop();saveundo();state.collage.sourceKeys={};collageAnalyseKeys();return;}collageKeyAction(id);};

var collageKeySourcePath='',collageKeySourceMode='major';
function collageDrawSourceKey(){rawDraw=true;rect(245,275,600,265,[.055,.07,.08,1]);buttons=buttons.filter(function(b){return !(b.x<845&&b.x+b.w>245&&b.y<540&&b.y+b.h>275);});text('KEY OF '+shortName(collageKeySourcePath,35),265,310,15);button('collageSourceKeyMode:major','Major',265,328,260,collageKeySourceMode==='major');button('collageSourceKeyMode:minor','Minor',545,328,260,collageKeySourceMode==='minor');var names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];for(var i=0;i<12;i++)button('collageSourceKeyRoot:'+i,names[i],265+i%6*90,380+Math.floor(i/6)*40,80);button('collageSourceKeyAuto','Use analysis',265,480,160);button('collageSourceKeySkip','Leave untuned',435,480,170);button('collageSourceKeyClose','Cancel',615,480,190);rawDraw=false;}
var collageManualKeyAction=action;action=function(id){
    if(/^collageSourceKey:\d+$/.test(id)){var path=collageLane(collageSelectedLane).sources[Number(id.split(':')[1])];if(!path)return;collageKeySourcePath=path;var result=collageKeyResult(path);collageKeySourceMode=result&&result.mode||'major';collageMenu='sourceKey';redraw();return;}
    if(/^collageSourceKeyMode:/.test(id)){collageKeySourceMode=id.split(':')[1];redraw();return;}
    if(id==='collageSourceKeyClose'){collageMenu='';redraw();return;}
    if(/^collageSourceKeyRoot:/.test(id)||id==='collageSourceKeyAuto'||id==='collageSourceKeySkip'){saveundo();var c=state.collage;if(!c.sourceKeyOverrides)c.sourceKeyOverrides={};if(id==='collageSourceKeyAuto')delete c.sourceKeyOverrides[collageKeySourcePath];else c.sourceKeyOverrides[collageKeySourcePath]=id==='collageSourceKeySkip'?'skip':{root:Number(id.split(':')[1]),mode:collageKeySourceMode};collageMenu='';say('Source-key choice saved. New phrase or Reroll pitch applies it.');return;}collageManualKeyAction(id);};
var collageManualKeyClick=onclick;onclick=function(x,y){if(view===28&&collageMenu==='sourceKey'){for(var i=0;i<buttons.length;i++){var b=buttons[i];if(b.id.indexOf('collageSourceKey')===0&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h){action(b.id);return;}}collageMenu='';redraw();return;}collageManualKeyClick.apply(this,arguments);};
