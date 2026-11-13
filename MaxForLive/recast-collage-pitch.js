// Optional monophonic pitch estimation. No claim of key separation for chords/noise.
var collagePitchBuildBefore=collageBuildLane,collagePitchDecorateBefore=collageDecorate;
var collagePitchCache={};
function collagePitchEstimate(index,start,end) {
    var b=buffer(index),native=b.framecount()*1000/b.length(),stride=Math.max(1,Math.floor(native/8000));
    var rate=native/stride,n=Math.min(1024,Math.floor((end-start)*native/1000/stride));
    if(n<256)return null;
    var offset=Math.floor(start*native/1000),x=[],mean=0;
    for(var i=0;i<n;i++){var v=b.peek(1,offset+i*stride);x.push(v);mean+=v;}
    mean/=n;var energy=0;for(var i=0;i<n;i++){x[i]-=mean;energy+=x[i]*x[i];}
    if(energy/n<.00002)return null;
    var low=Math.max(3,Math.floor(rate/1100)),high=Math.min(Math.floor(rate/45),Math.floor(n/3)),corr=[];
    for(var lag=low;lag<=high;lag++){var cross=0,a=0,z=0;for(var i=0;i<n-lag;i++){cross+=x[i]*x[i+lag];a+=x[i]*x[i];z+=x[i+lag]*x[i+lag];}corr[lag]=cross/Math.sqrt(Math.max(1e-20,a*z));}
    var best=-1,score=-Infinity;
    for(var lag=low+1;lag<high;lag++)if(corr[lag]>=corr[lag-1]&&corr[lag]>=corr[lag+1]){var s=corr[lag]-.0002*lag;if(s>score){score=s;best=lag;}}
    if(best<0||corr[best]<.78)return null;
    var l=corr[best-1],m=corr[best],r=corr[best+1],den=l-2*m+r,delta=den?clamp(.5*(l-r)/den,-.5,.5):0;
    var hz=rate/(best+delta);return {midi:69+12*Math.log(hz/440)/Math.LN2,confidence:m};
}
collageBuildLane=function(role){
    collagePitchBuildBefore(role);if(!state.collage.tuneSources)return;
    var cuts=collageLane(role).cuts;
    for(var i=0;i<cuts.length;i++){var f=cuts[i],key=f.path+'|'+f.a.toFixed(2)+'|'+f.z.toFixed(2);if(collagePitchCache[key]===undefined)collagePitchCache[key]=collagePitchEstimate(f.index,f.a,f.z);f.tonal=collagePitchCache[key];}
};
function collageNearestNote(midi,root,mode){var scale=mode==='major'?[0,2,4,5,7,9,11]:mode==='minor'?[0,2,3,5,7,8,10]:[0,1,2,3,4,5,6,7,8,9,10,11],best=Math.round(midi),distance=Infinity;for(var note=Math.floor(midi)-12;note<=Math.ceil(midi)+12;note++)if(scale.indexOf(((note-root)%12+12)%12)>=0&&Math.abs(note-midi)<distance){best=note;distance=Math.abs(note-midi);}return best;}
collageDecorate=function(base){
    var out=collagePitchDecorateBefore(base),c=state.collage;
    for(var i=0;i<out.length;i++){
        var e=out[i];if(!e.collage||!collageEligible(e))continue;
        var f=collageLane(e.role).cuts[e.collagePick],oldPitch=e.pitch||0;
        if(c.tuneSources&&f&&f.tonal&&f.tonal.confidence>=.78)e.pitch=collageNearestNote(f.tonal.midi+oldPitch,c.root||0,c.intervalMode)-f.tonal.midi;
        e.pitch=clamp((e.pitch||0)+(c.globalPitch||0),-48,48);
        if(e.durationBeats)e.durationBeats*=Math.pow(2,(oldPitch-e.pitch)/12);
    }
    return out;
};
function collageSuggestRoot(){var counts=Array(12).fill?Array(12).fill(0):[0,0,0,0,0,0,0,0,0,0,0,0];for(var r=0;r<state.collage.lanes.length;r++){var cuts=collageLane(r).cuts;for(var i=0;i<cuts.length;i++)if(cuts[i].tonal){var pc=((Math.round(cuts[i].tonal.midi)%12)+12)%12;counts[pc]+=cuts[i].tonal.confidence;}}var maximum=Math.max.apply(Math,counts);if(!maximum){say('No confident tonal estimates. Enable pitch correction, make New cuts, or choose a root manually.');return;}saveundo();state.collage.root=counts.indexOf(maximum);say('Root suggested from the most common confidently estimated note. This is not full-song key recognition.');}
var collagePitchActionBefore=action;action=function(id){
    if(id==='collageRoot'){collageMenu=collageMenu==='root'?'':'root';redraw();return;}
    if(/^collageRoot:\d+$/.test(id)){saveundo();state.collage.root=Number(id.split(':')[1]);collageMenu='';redraw();return;}
    if(id==='collageTune'){saveundo();state.collage.tuneSources=!state.collage.tuneSources;for(var i=0;i<state.collage.lanes.length;i++)collageLane(i).dirty=true;redraw();return;}
    if(id==='collagePitchDown'||id==='collagePitchUp'){saveundo();state.collage.globalPitch=clamp((state.collage.globalPitch||0)+(id==='collagePitchUp'?1:-1),-24,24);redraw();return;}
    if(id==='collageSuggestRoot'){collageSuggestRoot();return;}
    collagePitchActionBefore(id);
};
var collagePitchMenusBefore=collageMenuItems;collageMenuItems=function(){if(collageMenu==='root')return ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'].map(function(n,i){return {id:'collageRoot:'+i,label:n};});return collagePitchMenusBefore();};
var collagePitchDrawMenuBefore=collageDrawMenu;collageDrawMenu=function(){if(collageMenu!=='root'){collagePitchDrawMenuBefore();return;}var rows=collageMenuItems();rect(25,558,400,72,[.055,.07,.08,1]);buttons=buttons.filter(function(b){return !(b.x<425&&b.x+b.w>25&&b.y<630&&b.y+b.h>558);});for(var i=0;i<12;i++)button(rows[i].id,rows[i].label,30+i%6*65,562+Math.floor(i/6)*32,59,(state.collage.root||0)===i);};
