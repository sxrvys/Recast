// A focused collage face. The existing step editor remains a second view of the same events.
var collagePaintBefore=paint,collageActionBefore=action,collageClickBefore=onclick,collageDragBefore=ondrag;
var collageFileBefore=file,collageDropBefore=drop,collageBrowserAssignBefore=browserAssign;
var collageStyles=[['keep','Current settings'],['balanced','Balanced collage'],['groove','Grounded groove'],
    ['sparse','Sparse fragments'],['glitch','Microglitch'],['drift','Slow drift'],['raw','Untamed']];
function collageApplyStyle() {
    var c=state.collage,style=c.style||'keep';if(style==='keep')return;
    var rnd=collageRandom(c.seedCounter),ranges={balanced:[.15,.38,.2,.6,.15,.5,.1,.4],
        groove:[.15,.35,.05,.28,.02,.2,.1,.35],sparse:[.04,.13,.12,.45,.15,.5,.05,.25],
        glitch:[.18,.48,.01,.15,.3,.8,.65,1],drift:[.06,.22,.65,1,.08,.4,.02,.2],raw:[.08,.5,.02,.9,.1,1,.15,.9]}[style];
    var fields=['density','size','movement','damage'];
    for(var i=0;i<fields.length;i++)c[fields[i]]=ranges[i*2]+rnd()*(ranges[i*2+1]-ranges[i*2]);
    c.breaks=style==='glitch'?.25:style==='groove'?.04:.1;
    for(var r=0;r<roles.length;r++)if(!collageLane(r).locked&&(typeof refineTargetsRole!=='function'||refineTargetsRole(r))) {
        var lane=collageLane(r);lane.mode=style==='groove'?'transient':'random';
        lane.structure=style==='groove'?'drums':style==='glitch'?'cluster':style==='balanced'?'spread':'random';lane.dirty=true;
    }
}
var collageGenerateBefore=collageGenerate;
collageGenerate=function(mode,autoPlay){collageGenerateBefore(mode,autoPlay);};
function collageMenuItems() {
    var l=collageLane(collageSelectedLane);
    if(collageMenu==='style')return collageStyles.map(function(a){return {id:'collageStyle:'+a[0],label:a[1]};});
    if(collageMenu==='cuts')return ['oneshot','random','divide','transient'].map(function(a){return {id:'collageMode:'+a,label:{oneshot:'Whole recording / one-shot',random:'Overlapping random windows',divide:'Equal divisions',transient:'Energy-onset cuts'}[a]};});
    if(collageMenu==='structure')return ['spread','random','cluster','drums'].map(function(a){return {id:'collageStructure:'+a,label:{spread:'Evenly spread',random:'Scattered',cluster:'Clustered episodes',drums:'Drum-aware foundation'}[a]};});
    if(collageMenu==='repeat')return [1,2,4,8,16,32].map(function(a){return {id:'collageRepeat:'+a,label:a+' bar'+(a===1?'':'s')};});
    if(collageMenu==='voices')return [4,8,12,16,24,32].map(function(a){return {id:'collageVoices:'+a,label:a+' simultaneous voices'};});
    if(collageMenu==='tuning')return ['free','major','minor'].map(function(a){return {id:'collageTuning:'+a,label:a==='free'?'Free intervals':a==='major'?'Major-scale intervals':'Minor-scale intervals'};});
    return [];
}
function collageArc(x,y,r,a,z,width,color) {
    if(typeof mgraphics.arc!=='function'||typeof mgraphics.stroke!=='function')return;
    mgraphics.set_source_rgba(color);mgraphics.set_line_width(width);mgraphics.arc(x,y,r,a,z);mgraphics.stroke();
}
function collageWheelRows(){var active=collageActiveRoles();return active.length?active:[0,1,2,3,4,5];}
function collageDrawWheel() {
    var rows=collageWheelRows(),cx=298,cy=391,outer=210,gap=Math.min(19,142/Math.max(1,rows.length-1));
    var events=state.events,phase=playing?currentBeat()/beats():0;
    for(var row=0;row<rows.length;row++) {
        var role=rows[row],radius=outer-row*gap,lane=collageLane(role);
        collageArc(cx,cy,radius,0,Math.PI*2,1,[.24,.28,.3,1]);text(String(role+1),cx+radius-4,cy-5,10,role===collageSelectedLane?[1,.78,.43,1]:[.7,.78,.8,1]);
        for(var i=0;i<events.length;i++) {
            var e=events[i];if(e.role!==role)continue;
            var start=e.beat/beats()*Math.PI*2-Math.PI/2,gate=e.durationBeats||.25;
            if(lane.choke)for(var k=i+1;k<events.length;k++)if(events[k].role===role){gate=Math.min(gate,events[k].beat-e.beat);break;}
            var end=start+Math.min(gate/beats(),.98)*Math.PI*2;
            var color=protectedHit(e)||lane.locked?[.53,.85,.61,1]:lane.mute?[.29,.31,.33,1]:role===collageSelectedLane?[.94,.65,.31,1]:[.47,.67,.71,1];
            collageArc(cx,cy,radius,start,end,role===collageSelectedLane?4:2.5,color);
            var changed=state.collage.changedIds&&state.collage.changedIds[e.id];rect(cx+Math.cos(start)*radius-1.5,cy+Math.sin(start)*radius-1.5,changed?4:3,changed?4:3,changed&&!lane.mute?[.45,.9,.85,1]:color);
        }
    }
    text(rows.length+' layers',cx-39,cy-7,13,[.8,.83,.84,1]);
    text(state.collage.voices+' voices max',cx-51,cy+17,11,[.52,.62,.65,1]);
    if(playing){var a=phase*Math.PI*2-Math.PI/2;for(var r=58;r<=215;r+=5)rect(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2,2,[.93,.8,.54,1]);}
    text('Layers: outside → inside · dots = hits · arcs = gates · cyan = changed',40,159,10,[.52,.62,.65,1]);
}
function collageSliders() {
    if(view===26)return [{field:'density',label:'Density',x:635,y:204,min:0,max:.65,curve:2},
        {field:'size',label:'Fragment size',x:635,y:274,min:0,max:1},
        {field:'movement',label:'Movement',x:635,y:344,min:0,max:1,curve:2},
        {field:'damage',label:'Damage',x:635,y:414,min:0,max:1,curve:2}];
    if(view===27)return [{field:'breaks',label:'Breaks / empty regions',x:30,y:160,min:0,max:1},
        {field:'pulse',label:'Pull toward strong beats',x:30,y:230,min:0,max:1},
        {field:'fadeIn',label:'Fade in (ms)',x:30,y:300,min:2,max:500},
        {field:'fadeOut',label:'Fade out (ms)',x:30,y:370,min:2,max:1000},
        {field:'gain',label:'Mix level',x:30,y:440,min:0,max:1},
        {field:'laneDensity',label:'Layer density',x:585,y:160,min:0,max:2},
        {field:'laneChance',label:'Layer probability',x:585,y:230,min:0,max:1},
        {field:'laneGain',label:'Layer level',x:585,y:300,min:0,max:2}];
    return [];
}
function collageControlValue(s) {
    var l=collageLane(collageSelectedLane);
    return s.field==='laneDensity'?l.density:s.field==='laneChance'?l.chance:s.field==='laneGain'?l.gain:state.collage[s.field];
}
function collageSetControl(s,x) {
    var v=s.min+Math.pow(clamp((x-s.x)/390,0,1),s.curve||1)*(s.max-s.min),l=collageLane(collageSelectedLane);
    if(s.field==='laneDensity')l.density=v;else if(s.field==='laneChance')l.chance=v;else if(s.field==='laneGain')l.gain=v;
    else state.collage[s.field]=v;
    if(s.field==='size')for(var r=0;r<state.collage.lanes.length;r++)if(!collageLane(r).locked)collageLane(r).dirty=true;
    collagePlanCache=null;redraw();
}
function collageDrawSliders(){var sliders=collageSliders();for(var i=0;i<sliders.length;i++){var s=sliders[i],v=collageControlValue(s),portion=Math.pow(clamp((v-s.min)/(s.max-s.min),0,1),1/(s.curve||1));text(s.label,s.x,s.y,13);text(collageFormatControl(s,v),s.x+328,s.y,11,[.71,.77,.78,1]);rect(s.x,s.y+18,390,5,[.22,.27,.29,1]);rect(s.x,s.y+18,390*portion,5,[.88,.61,.31,1]);rect(s.x+390*portion-3,s.y+13,6,15,[.94,.77,.53,1]);}}
function collageHideFields() {
    var tempo=this.patcher.getnamed('instrumentTempo'),search=this.patcher.getnamed('librarySearch');
    if(search)search.hidden=1;
    if(tempo){tempo.hidden=view!==26?1:0;if(view===26){tempo.message('presentation_rect',64,112,80,28);if(tempoEntryLast!==state.tempo){tempo.message('set',state.tempo);tempoEntryLast=state.tempo;}if(this.patcher.bringtofront)this.patcher.bringtofront(tempo);}}
}
function collageDrawMenu() {
    if(!collageMenu)return;
    var items=collageMenuItems(),x=collageMenu==='style'?340:collageMenu==='voices'?635:collageMenu==='tuning'?30:585;
    var y=collageMenu==='style'?98:collageMenu==='voices'?524:collageMenu==='tuning'?560:460,w=collageMenu==='style'?285:390;
    rect(x-3,y-4,w+6,items.length*31+8,[.055,.07,.08,1]);
    buttons=buttons.filter(function(b){return !(b.x<x+w&&b.x+b.w>x&&b.y<y+items.length*31&&b.y+b.h>y);});
    for(var i=0;i<items.length;i++)button(items[i].id,items[i].label,x,y+i*31,w);
}
paint=function() {
    if(view!==26&&view!==27){collagePaintBefore();return;}
    buttons=[];rawDraw=true;simpleDrops();collageHideFields();
    rect(0,0,1080,880,[.07,.085,.10,1]);text('RECAST',20,40,29,[.95,.73,.42,1]);
    text('SAMPLE COLLAGE',210,35,12,[.53,.66,.69,1]);button('collageGrid','Step editor',650,14,130);button('save','Save',795,14,80);button('open','Open',890,14,80);button('view14','Tools',985,14,75);
    if(view===27) {
        text('SHAPE + LAYER SETTINGS',30,105,22);button('collageOpen','Back to collage',815,75,245);
        text('Changes apply to the next reroll. Probability / mute / solo affect playback immediately.',30,131,12);
        collageDrawSliders();var l=collageLane(collageSelectedLane);
        text('LAYER '+(collageSelectedLane+1),585,105,18);
        button('collageMode','Cuts: '+l.mode+' ▾',585,365,390);button('collageStructure','Rhythm: '+l.structure+' ▾',585,405,390);
        button('collageRepeat','Repeat: '+l.repeat+' bars ▾',585,445,390);button('collageChoke',l.choke?'Choke: next hit cuts tail':'Polyphonic tails',585,485,390,l.choke);
        button('collageTuning','Pitch: '+state.collage.intervalMode+' intervals ▾',30,525,390);
        button('collageDivisionsDown','Fewer divisions',585,535,185);button('collageDivisionsUp','More divisions',785,535,190);text('Equal divisions: '+l.divisions,585,588,12);
        button('collageRoot','Root: '+['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][state.collage.root||0]+' ▾',30,565,185);button('collageSuggestRoot','Suggest root',230,565,190);button('collageTune','Source pitch correction: '+(state.collage.tuneSources?'On':'Off'),30,605,390,state.collage.tuneSources);button('collagePitchDown','Pitch '+(state.collage.globalPitch||0)+' st −',30,645,185);button('collagePitchUp','Pitch +',230,645,190);button('collageLibraryAdd','Add draw folder…',30,705,220);button('collageLibraryRefresh','Rescan library',265,705,155);button('collageLaneClear','Clear this layer',585,635,185);button('collageSeedReset','Reset shape controls',790,635,235);
        text('Pitch correction estimates tonal fragments only. Chords, distorted voices and noise may remain untuned.',30,780,12,[.58,.68,.7,1]);
        text('Energy-onset cuts detect changes in level. Dense recordings can still need random or equal cuts.',30,802,12,[.58,.68,.7,1]);
        text('Long fades, sustain and FX use pre-rendered audio. Preparation happens before playback starts.',30,824,12,[.58,.68,.7,1]);
    } else {
        button('collagePlay',playing||preparing||collageJob||collageLibraryPending||collageExportJob?'■ Stop':'▶ Play',20,65,100,true);
        button('collagePhrase','New phrase',135,65,190,true);var style=state.collage.style||'keep';
        button('collageStyle',collageStyles.filter(function(a){return a[0]===style;})[0][1]+' ▾',340,65,220);
        button('undo','Undo',575,65,75);button('collageCommit','Commit take',665,65,160);button('collageExport','Loop WAV',840,65,103);button('collageStems','Layer stems',953,65,107);
        text('BPM',20,132,12);button('instrumentTap','Tap',160,112,60);text('Bars',250,132,12);
        var lengths=[1,2,4,8,16,32];for(var i=0;i<lengths.length;i++)button('collageBars:'+lengths[i],String(lengths[i]),290+i*47,112,41,state.bars===lengths[i]);
        button('collageLibraryDraw',collageLibraryPending?'Scanning library…':collageJob?'Loading new sounds…':'New sounds from library',605,112,250);button('collageLibrarySetup','Library draw setup…',870,112,190);
        collageDrawWheel();collageDrawSliders();
        button('collageRhythm','New rhythm',635,472,185);button('collageCuts','New cuts',835,472,190);
        button('collageOrder','Shuffle fragments',635,510,185);button('collageDamage','New damage',835,510,190);
        button('collageVoices','Voices: '+state.collage.voices+' ▾',635,548,185);button('collageDetails','Layer / advanced',835,548,190);
        text('Shape controls apply on the next phrase or reroll.',635,608,10,[.56,.67,.69,1]);
        var first=collageLanePage*6;for(var i=0;i<6;i++) {
            var role=first+i;if(role>=roles.length)continue;var lane=collageLane(role),x=20+i*175,y=646;
            visualRound(x,y,160,134,role===collageSelectedLane?[.16,.23,.25,1]:[.115,.14,.16,1],5);
            button('collageSelect:'+role,'Layer '+(role+1),x,y,99,role===collageSelectedLane);
            text(lane.sources.length?shortName(lane.sources[0],21):'Drop WAV / AIFF here',x+6,y+47,10,[.67,.76,.78,1]);
            button('refineSoundKind:'+role,'Find: '+(lane.drawLabel||lane.libraryType||'anything')+' ▾',x,y+53,160);
            button('collageBrowse:'+role,'Browse',x,y+84,70);button('collageNewSound:'+role,'New sound',x+76,y+84,84);button('refineKeepSound:'+role,lane.soundLocked?'Kept':'Keep',x+105,y,55,lane.soundLocked);
        }
        button('collageLanePagePrev','‹ Layers',20,615,100);button('collageLanePageNext','Layers ›',130,615,100);button('collageAddLane','+ Layer',245,615,100);
        var l=collageLane(collageSelectedLane);
        button('collageMute','Mute',365,615,65,l.mute);button('collageSolo','Solo',440,615,65,l.solo);button('collageLock','Lock layer',515,615,105,l.locked);
        for(var k=0;k<4;k++){var x=20+k*265,keep=state.collage.keeps[k];button('collageRecall:'+k,keep?'Phrase '+(k+1)+(collageQueuedKeep===k?' · queued':''):'Empty '+(k+1),x,781,170,!!keep);button('collageKeep:'+k,'Keep',x+178,781,72);}
        text(state.events.length+' events · '+collageActiveRoles().length+' source layers · '+(playing?'bar '+(Math.floor(currentBeat()/4)+1)+' / '+state.bars:'stopped'),20,835,11,[.54,.65,.68,1]);
    }
    text(status.slice(0,140),20,860,11,[.65,.79,.74,1]);collageDrawMenu();rawDraw=false;
};
function collageBrowse(role,append) {
    collageBrowserRole=role;collageBrowserAppend=append;collageSelectedLane=role;
    soundAssignHits=false;browserOpen(role,false);
    say('Choose a recording for layer '+(role+1)+'. '+(append?'Adds to its source pool.':'Replaces its source pool.'));
}
browserAssign=function(pool) {
    if(collageBrowserRole<0)return collageBrowserAssignBefore(pool);
    if(!browserSelected||!browserSource){say('Select a readable sample first.');return false;}
    var ok=collageUseFile(collageBrowserRole,browserSelected,collageBrowserAppend);
    if(ok){browserPreview=false;outlet(0,'stopvoice',33);view=26;}
    return ok;
};
var collageBrowserButtonBefore=button;
button=function(id,label,x,y,w,active){
    if(view===0&&id==='performancePools'){id='collageOpen';label='Collage';}
    if(view===8&&collageBrowserRole>=0){if(id==='browserAssign')label=(collageBrowserAppend?'Add source to':'Use as source for')+' layer '+(collageBrowserRole+1);if(id==='view0')label='Back to collage';}
    collageBrowserButtonBefore(id,label,x,y,w,active);
};
file=function(){
    if(collagePendingRole<0){collageFileBefore.apply(this,arguments);return;}
    var role=collagePendingRole,append=collageAppend;collagePendingRole=-1;
    if(collageUseFile(role,arrayfromargs(arguments).join(' '),append))view=26;
};
var collageDropsBefore=simpleDrops;
simpleDrops=function(){
    collageDropsBefore();if(view!==26)return;
    var names=['dropLoop','dropWave','dropSound','dropTone'];for(var i=0;i<names.length;i++){var o=this.patcher.getnamed(names[i]);if(o)o.hidden=1;}
    for(var i=0;i<6;i++){var o=this.patcher.getnamed('dropPad'+i);if(o){o.hidden=collageLanePage*6+i>=roles.length?1:0;o.message('presentation_rect',26+i*175,687,148,30);o.message('ignoreclick',1);}}
};
drop=function(){if(view!==26){collageDropBefore.apply(this,arguments);return;}var args=arrayfromargs(arguments),slot=Number(args.shift()),role=collageLanePage*6+slot-1;if(slot<1||slot>6)return;collageUseFile(role,args.join(' '),false);};
action=function(id) {
    var m=id.match(/^collage(Bars|Select|Browse|Append|Keep|Recall|Style|Mode|Structure|Repeat|Voices|Tuning):(.+)$/);
    if(m){var type=m[1],value=m[2],c=state.collage,l=collageLane(collageSelectedLane);collageMenu='';
        if(type==='Bars'){setPatternLength(Number(value));c.base=[];c.lastResult='';}
        else if(type==='Select'){collageSelectedLane=Number(value);state.pad=collageSelectedLane;}
        else if(type==='Browse'||type==='Append'){collageBrowse(Number(value),type==='Append');return;}
        else if(type==='Keep')collageKeep(Number(value));
        else if(type==='Recall'){if(!c.keeps[Number(value)]){say('This Keep slot is empty.');return;}if(playing){collageQueuedKeep=Number(value);say('Phrase '+(Number(value)+1)+' queued for next bar.');}else collageRecall(Number(value));}
        else if(type==='Style')c.style=value;
        else if(type==='Mode'){saveundo();l.mode=value;l.dirty=true;}
        else if(type==='Structure'){saveundo();l.structure=value;}
        else if(type==='Repeat'){saveundo();l.repeat=Number(value);}
        else if(type==='Voices'){saveundo();c.voices=Number(value);}
        else if(type==='Tuning'){saveundo();c.intervalMode=value;}
        redraw();return;
    }
    var kind={collagePhrase:'phrase',collageRhythm:'rhythm',collageCuts:'cuts',collageOrder:'order',collageDamage:'damage'}[id];
    if(kind){collageGenerate(kind);return;}
    var menu={collageStyle:'style',collageMode:'cuts',collageStructure:'structure',collageRepeat:'repeat',collageVoices:'voices',collageTuning:'tuning'}[id];
    if(menu){collageMenu=collageMenu===menu?'':menu;redraw();return;}
    if(id==='collageOpen'){collageBrowserRole=-1;collageAdoptKit();view=26;redraw();return;}
    if(id==='collageGrid'){collageBrowserRole=-1;view=0;redraw();return;}
    if(id==='view0'&&collageBrowserRole>=0){collageBrowserRole=-1;browserPreview=false;outlet(0,'stopvoice',33);view=26;redraw();return;}
    if(id==='browserFile'&&collageBrowserRole>=0){clearPickerIntent();collagePendingRole=collageBrowserRole;collageAppend=collageBrowserAppend;outlet(0,'choose');return;}
    if(id==='collagePlay'){if(playing||preparing||collageJob||collageLibraryPending)stop();else if(!state.events.length)collageGenerate('phrase',true);else play();return;}
    if(id==='collageDetails'){view=27;redraw();return;}
    if(id==='collageCommit'){collageCommit();return;}
    if(id==='collageExport'){if(!state.events.length){say('Generate a phrase first.');return;}collageCommit();outlet(0,'bounce');return;}
    if(id==='collageLibraryRoot'){collageBrowserRole=-1;browserOpen(collageSelectedLane,false);action('browserRoot');return;}
    if(id==='collageLibraryDraw'){collageDrawLibrary();return;}
    if(id==='collageLanePagePrev'||id==='collageLanePageNext'){collageLanePage=(collageLanePage+(id==='collageLanePageNext'?1:-1)+Math.ceil(roles.length/6))%Math.ceil(roles.length/6);redraw();return;}
    if(id==='collageAddLane'){if(roles.length>=24){say('Twenty-four layers are available.');return;}stop();saveundo();var role=roles.length;if(collageEnsureRole(role)){collageLane(role).ignoreKit=true;collageSelectedLane=role;collageLanePage=Math.floor(role/6);say('Added layer '+(role+1)+'. Drop a recording or Browse.');}return;}
    if(/^collage(Mute|Solo|Lock|Choke)$/.test(id)){saveundo();var field={collageMute:'mute',collageSolo:'solo',collageLock:'locked',collageChoke:'choke'}[id],l=collageLane(collageSelectedLane);l[field]=!l[field];collagePlanCache=null;redraw();return;}
    if(id==='collageLaneClear'){stop();saveundo();var l=collageLane(collageSelectedLane);l.sources=[];l.cuts=[];l.ignoreKit=true;state.events=state.events.filter(function(e){return e.role!==collageSelectedLane||protectedHit(e);});state.collage.base=[];redraw();return;}
    if(id==='collageDivisionsDown'||id==='collageDivisionsUp'){saveundo();var l=collageLane(collageSelectedLane);l.divisions=clamp(l.divisions*(id==='collageDivisionsUp'?2:.5),2,64);l.dirty=true;redraw();return;}
    if(id==='collageSeedReset'){saveundo();var d=collageSettings(),fields=['density','size','movement','damage','breaks','pulse','gain','fadeIn','fadeOut'];for(var i=0;i<fields.length;i++)state.collage[fields[i]]=d[fields[i]];redraw();return;}
    if(id==='instrumentBank'&&roles.length>12){workflowBank=(workflowBank+1)%Math.ceil(roles.length/6);state.pad=workflowBank*6;redraw();return;}
    if(id!=='browserAssign'&&id!=='browserFile'&&id.indexOf('browser')!==0&&id.indexOf('nav')!==0)collagePendingRole=-1;
    collageActionBefore(id);
};
onclick=function(x,y,b,cmd,shift) {
    if(view!==26&&view!==27){collageClickBefore.apply(this,arguments);return;}
    if(collageMenu){if(!workflowButtons(x,y)){collageMenu='';redraw();}return;}
    var sliders=collageSliders();for(var i=0;i<sliders.length;i++){var s=sliders[i];if(x>=s.x&&x<=s.x+390&&y>=s.y+7&&y<=s.y+34){saveundo();collageDrag=s;collageSetControl(s,x);return;}}
    if(view===26&&x>=70&&x<=530&&y>=170&&y<=610){var dx=x-298,dy=y-391,r=Math.sqrt(dx*dx+dy*dy),rows=collageWheelRows(),gap=Math.min(19,142/Math.max(1,rows.length-1)),index=Math.round((210-r)/gap);if(index>=0&&index<rows.length&&Math.abs(210-index*gap-r)<Math.max(5,gap/2)){collageSelectedLane=rows[index];collageLanePage=Math.floor(collageSelectedLane/6);state.pad=collageSelectedLane;redraw();return;}}
    workflowButtons(x,y);
};
ondrag=function(x,y,b){if((view===26||view===27)&&collageDrag){if(b)collageSetControl(collageDrag,x);else collageDrag=null;return;}collageDragBefore.apply(this,arguments);};
function collageDrawLibrary() {
    var c=state.collage,root=state.sampleBrowser.root;
    if(!root){say('Choose your sample library folder first.');action('collageLibraryRoot');return;}
    if(browserBusy){say('Library search is still indexing. Try New sounds when it finishes.');return;}
    if(browserIndexRoot!==root){browserStartScan();say('Indexing your library locally. Press New sounds again when indexing finishes.');return;}
    var files=browserIndex.filter(function(e){return !e.folder&&/\.(wav|aiff?)$/i.test(e.path);});
    if(!files.length){say('No WAV / AIFF files found in this library.');return;}
    stop();saveundo();collageNextSeed('order');var bag=collageShuffle(files,collageRandom(c.seeds.order)),at=0,targets=[];
    for(var r=0;r<roles.length;r++)if(!collageLane(r).locked&&!state.roleLocks[r])targets.push(r);
    if(!targets.length){say('Unlock a layer before drawing new sounds.');return;}
    collageJob=new Task(function(){
        if(at>=targets.length){collageJob=null;collageGenerate('phrase');return;}
        var role=targets[at++],l=collageLane(role),chosen=bag[(at-1)%bag.length];
        try{archivePath(chosen.path);l.sources=[chosen.path];l.cuts=[];l.dirty=true;l.ignoreKit=true;}catch(err){status='Skipped unreadable source: '+shortName(chosen.path);}
        status='Drawing local sounds '+at+' / '+targets.length;mgraphics.redraw();collageJob.schedule(5);
    },this);collageJob.schedule(1);
}
var collageLoadBefore=loadbang,collageFaceTask=null,collageFaceStarted=false;
loadbang=function(){collageLoadBefore();if(collageFaceStarted)return;collageFaceStarted=true;collageFaceTask=new Task(function(){view=26;collageAdoptKit();redraw();},this);collageFaceTask.schedule(1200);};
var collageDeleteBefore=notifydeleted;notifydeleted=function(){if(collageJob)collageJob.cancel();if(collageFaceTask)collageFaceTask.cancel();collageDeleteBefore();};
// Tooltips describe the action rather than requiring a visit to a manual.
visualHints.collagePhrase='Generate a new arrangement of your source recordings. The style chooses parameter ranges; locked layers and protected notes remain.';
visualHints.collageRhythm='Change when fragments trigger. Cut boundaries and sound-order seed stay unchanged.';
visualHints.collageCuts='Rebuild sample cuts with a fresh cut seed; preserve event timing and ordering decisions.';
visualHints.collageOrder='Choose different fragments for the existing trigger positions. Rhythm and cut boundaries stay fixed.';
visualHints.collageDamage='Reroll gates, reversals, bursts and interruptions from the same phrase input. Does not recursively multiply repeats.';
visualHints.collageCommit='Commit the current cycle’s probability and voice-limit choices before exporting. Undo restores the generative phrase.';
visualHints.collageLibraryDraw='Draw WAV / AIFF sources from your selected local library. Locked layers retain their files. No online sound service is used.';
visualHints.collageLock='Keep this entire layer, its sound and events when generating new phrases.';
