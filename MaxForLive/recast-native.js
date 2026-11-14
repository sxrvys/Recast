autowatch = 1;
inlets=1;outlets=1;
mgraphics.init();mgraphics.relative_coords=0;mgraphics.autofill=0;
var ns='recast'+new Date().getTime()+'_'+Math.floor(Math.random()*1000000),roles=['KICK','SNARE','HAT','PERC','TEXTURE','BASS'];
var state={tempo:60,bars:2,start:0,sensitivity:1,amount:.4,mode:0,style:0,page:0,pad:0,paths:['','','','','','',''],padGain:[1,1,1,1,1,1],padPitch:[0,0,0,0,0,0],roleLocks:[false,false,false,false,false,false],slices:[],events:[],original:[],ranges:[],noteMap:[],archivePaths:[],family:[],change:0,scope:0,weight:.5,nerves:.5};
var renderEventContext=null;function soundPatternEvents(){return renderEventContext||state.events;}
var restoring=false;var undoStack=[],selected=-1,rangeAnchor=-1,selection=null,pending=0,status='Load a loop. Set its BPM and region, then detect hits.',wave=[],duration=0,sr=44100,playing=false,playTime=0,lastBeat=-.001,cycle=0,voice=0,uid=0,buttons=[],editDrag=null;
var clock=new Task(tick,this);clock.interval=5;var setupTask=new Task(function(){refresh();},this);
function copy(x){return JSON.parse(JSON.stringify(x));}function clamp(x,a,b){return Math.max(a,Math.min(b,x));}function beats(){return state.bars*4;}function buffer(i){return new Buffer(ns+'-b'+i);}var syncingStore=false;var sessionDict=null;var stateReady=false;var lastStored='';function redraw(){if(playing||(typeof preparing!=='undefined'&&preparing)||(typeof libraryBusy!=='undefined'&&libraryBusy)){mgraphics.redraw();return;}var now=JSON.stringify(state);if(stateReady&&now!==lastStored){lastStored=now;var store=this.patcher.getnamed('recastSession');if(store){if(!sessionDict)sessionDict=new Dict(ns+'-session');sessionDict.parse(now);syncingStore=true;store.message('dictionary',sessionDict.name);syncingStore=false;}}mgraphics.redraw();}function say(s){status=s;outlet(0,'status',s);redraw();}function saveundo(){undoStack.push(copy({events:state.events,ranges:state.ranges,bars:state.bars,family:state.family}));if(undoStack.length>40)undoStack.shift();}function locked(t){for(var i=0;i<state.ranges.length;i++)if(t>=state.ranges[i][0]&&t<state.ranges[i][1])return true;return false;}
function rect(x,y,w,h,c){if(!rawDraw&&y>=285)y+=100;mgraphics.set_source_rgba(c);mgraphics.rectangle(x,y,w,h);mgraphics.fill();}function text(s,x,y,size,c){if(!rawDraw&&y>=285)y+=100;mgraphics.set_source_rgba(c||[.9,.91,.87,1]);mgraphics.select_font_face('Arial');mgraphics.set_font_size(size||12);mgraphics.move_to(x,y);mgraphics.show_text(String(s));}
function button(id,label,x,y,w,active){rect(x,y,w,28,active?[.65,.46,.24,1]:[.18,.22,.20,1]);text(label,x+8,y+19,12);buttons.push({id:id,x:x,y:y,w:w,h:28});}
function oldPaint(){buttons=[];var W=box.rect[2]-box.rect[0],H=box.rect[3]-box.rect[1];rect(0,0,W,H,[.065,.08,.075,1]);text('RECAST',20,35,28,[.88,.68,.39,1]);text('RHYTHM WORKSHOP / MAX FOR LIVE',180,32,11,[.58,.66,.61,1]);button('source','Load loop',700,14,100);button('save','Save session',810,14,120);button('open','Open session',940,14,120);
text(state.paths[0]?state.paths[0].split('/').pop()+'  — drop another WAV / AIFF here':'DROP A WAV / AIFF LOOP HERE TO START',20,65,13);text('SOURCE BPM '+state.tempo+'    BARS '+state.bars+'    START '+state.start.toFixed(2)+'s',20,89,12);button('bpm-','− BPM',460,66,65);button('bpm+','+ BPM',530,66,65);button('bars','Bars: '+state.bars,600,66,80);button('start-','− Start',690,66,80);button('start+','+ Start',780,66,80);button('detect','Detect hits',870,66,90);button('grid','1/16 slices',970,66,90);
rect(20,105,1040,100,[.10,.13,.115,1]);for(var w=0;w<wave.length;w++){var amp=wave[w];rect(20+w*1040/wave.length,155-amp*44,Math.max(1,1040/wave.length),amp*88,[.40,.56,.46,1]);}var len=regionLength();for(var j=0;j<state.slices.length;j++){var xx=20+(state.slices[j][0]-state.start)/Math.max(.01,len)*1040;rect(xx,105,1,100,[.87,.64,.35,1]);text(j+1,xx+3,118,9);}text('Waveform: click to add a boundary; shift-click to remove. Reslicing rebuilds the rhythm.',20,222,11,[.6,.67,.62,1]);
button('play',playing?'STOP':'PLAY',20,238,85,playing);button('mode',state.mode?'Using slices':'Using role kit',115,238,145);button('undo','Undo',270,238,65);button('reset','Original',345,238,80);button('write','Write MIDI to Live',435,238,160);button('export','Export kit + MIDI',605,238,160);button('bounce','Bounce loop',775,238,130);button('help','How to use',915,238,145);
for(var r=0;r<6;r++){var px=20+r*175;rect(px,285,165,92,state.pad===r?[.23,.26,.21,1]:[.12,.15,.13,1]);text(roles[r],px+9,304,12,[.87,.68,.42,1]);text(state.paths[r+1]?state.paths[r+1].split('/').pop().slice(0,21):'Original slices',px+9,324,10);button('pad'+r,'Load / select',px+6,338,91);button('role'+r,state.roleLocks[r]?'Locked':'Lock',px+102,338,57,state.roleLocks[r]);}
text('Shift-click two grid cells to select a time stretch. Lock it to preserve hits AND empty space.',20,399,12);button('lock','Lock selection',700,383,120);button('unlock','Clear time locks',830,383,130);button('page','Bar '+(state.page+1)+' / '+state.bars,970,383,90);
for(var rr=0;rr<6;rr++){text(roles[rr],20,445+rr*30,11);for(var st=0;st<16;st++){var beat=state.page*4+st/4,count=0,sel=false,ind=-1;for(var ee=0;ee<state.events.length;ee++){var ev=state.events[ee];if(ev.role===rr&&Math.floor((ev.beat+1e-6)*4)===state.page*16+st){count++;ind=ee;if(ee===selected)sel=true;}}var x=110+st*59,y=425+rr*30;rect(x,y,54,25,sel?[.91,.72,.43,1]:count?[.50,.39,.24,1]:[.16,.20,.17,1]);if(locked(beat))rect(x,y,54,3,[.5,.83,.64,1]);if(selection&&beat>=selection[0]&&beat<selection[1])rect(x,y+22,54,3,[.95,.95,.8,1]);if(count>1)text(count,x+24,y+18,11);if(playing&&Math.floor(currentBeat()*4)===state.page*16+st)rect(x,y+22,54,3,[1,.3,.2,1]);}}
var ev=state.events[selected];if(ev){text('HIT '+(selected+1)+'  '+roles[ev.role]+'  slice '+(ev.slice+1)+'  beat '+(ev.beat+1).toFixed(3)+'  velocity '+ev.velocity+'  pitch '+ev.pitch,20,632,12);button('hit','Hear',20,644,55);button('erole','Role →',85,644,70);button('eslice','Slice →',165,644,75);button('earlier','← 10ms',250,644,85);button('later','10ms →',345,644,85);button('pitch-','− Pitch',440,644,75);button('pitch+','+ Pitch',525,644,75);button('reverse',ev.reverse?'Reversed':'Reverse',610,644,85,ev.reverse);button('elock',ev.locked?'Locked':'Lock hit',705,644,85,ev.locked);button('delete','Delete',800,644,75);}else text('Click a hit to edit. Click an empty cell to add. Double-click a pad to audition.',20,645,12);
text(status.slice(0,145),20,756,12,[.64,.80,.68,1]);}
function baseClick(x,y,but,cmd,shift){if(y>=425&&y<605&&x>=110&&x<1054){var col=Math.floor((x-110)/59),role=Math.floor((y-425)/30),beat=state.page*4+col/4;if(shift){if(rangeAnchor<0){rangeAnchor=beat;selection=[beat,beat+.25];}else{selection=[Math.min(beat,rangeAnchor),Math.max(beat,rangeAnchor)+.25];rangeAnchor=-1;}redraw();return;}var found=[];for(var k=0;k<state.events.length;k++)if(state.events[k].role===role&&Math.floor((state.events[k].beat+1e-6)*4)===state.page*16+col)found.push(k);if(found.length){var pos=found.indexOf(selected);selected=found[(pos+1)%found.length];}else if(state.slices.length&&!locked(beat)){saveundo();var sl=0;for(var f=0;f<state.events.length;f++)if(state.events[f].role===role){sl=state.events[f].slice;break;}state.events.push({id:++uid,slice:sl,role:role,beat:beat,velocity:100,pitch:0,reverse:false,locked:false});selected=state.events.length-1;}redraw();return;}
if(y>=105&&y<=205&&x>=20&&x<=1060&&state.slices.length){var t=state.start+(x-20)/1040*regionLength(),points=[];for(var s=0;s<state.slices.length;s++)points.push(state.slices[s][0]);if(shift){var nearest=0;for(var n=1;n<points.length;n++)if(Math.abs(points[n]-t)<Math.abs(points[nearest]-t))nearest=n;if(nearest>0)points.splice(nearest,1);}else{if(points.length>=64){say('64 slices maximum.');return;}points.push(t);}rebuild(points);return;}
for(var i=0;i<buttons.length;i++){var b=buttons[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){action(b.id);return;}}}
function baseDoubleClick(x,y){if(y>=285&&y<377){var r=Math.floor((x-20)/175);if(r>=0&&r<6)auditionRole(r);}}
function baseAction(id){var e=state.events[selected];if(id==='source'){restoring=false;pending=0;outlet(0,'choose');}else if(id==='save')outlet(0,'save');else if(id==='open')outlet(0,'open');else if(id.indexOf('pad')===0){state.pad=Number(id.slice(3));pending=state.pad+1;outlet(0,'choose');}else if(id.indexOf('role')===0){var r=Number(id.slice(4));state.roleLocks[r]=!state.roleLocks[r];}else if(id==='bpm-'||id==='bpm+'){stop();state.tempo=clamp(state.tempo+(id==='bpm+'?1:-1),20,300);refresh();}else if(id==='bars'){stop();resizeBars();}else if(id==='start-'||id==='start+'){stop();state.start=clamp(state.start+(id==='start+'?1:-1)*60/state.tempo,0,Math.max(0,duration-.1));detect();}else if(id==='detect')detect();else if(id==='grid'){var p=[],len=regionLength(),step=60/state.tempo/4;for(var t=0;t<len&&p.length<64;t+=step)p.push(state.start+t);rebuild(p);}else if(id==='play'){if(playing)stop();else play();}else if(id==='mode'){stop();state.mode=1-state.mode;}else if(id==='style')state.style=(state.style+1)%4;else if(id==='amount-'||id==='amount+')state.amount=clamp(state.amount+(id==='amount+'?.1:-.1),0,1);else if(id==='vary')vary();else if(id==='undo'){if(undoStack.length){stop();var u=undoStack.pop();state.events=u.events;state.ranges=u.ranges;state.bars=u.bars||state.bars;state.family=u.family||[];state.page=Math.min(state.page,state.bars-1);selected=-1;}}else if(id==='reset'){stop();saveundo();state.events=copy(state.original);state.ranges=[];}else if(id==='lock'){if(selection){saveundo();state.ranges.push(selection);selection=null;say('Selected stretch protected, including silence.');}}else if(id==='unlock'){saveundo();state.ranges=[];}else if(id==='page')state.page=(state.page+1)%state.bars;else if(id==='write')writeLive();else if(id==='export')outlet(0,'folder');else if(e){if(id==='hit')trigger(e);else if(!locked(e.beat)){stop();saveundo();if(id==='erole')e.role=(e.role+1)%6;if(id==='eslice')e.slice=(e.slice+1)%state.slices.length;if(id==='earlier'||id==='later'){var dest=clamp(e.beat+(id==='later'?1:-1)*.01*state.tempo/60,0,beats()-.001);if(!locked(dest))e.beat=dest;}if(id==='pitch-')e.pitch=clamp(e.pitch-1,-24,12);if(id==='pitch+')e.pitch=clamp(e.pitch+1,-24,12);if(id==='reverse')e.reverse=!e.reverse;if(id==='elock')e.locked=!e.locked;if(id==='delete'){state.events.splice(selected,1);selected=-1;}}else say('Clear time locks to edit this protected hit.');}redraw();}
function file(){var path=arrayfromargs(arguments).join(' ');restoring=false;stop();say('Loading '+path.split('/').pop()+'…');state.paths[pending]=path;buffer(pending).send('replace',path);}
function loaded(i){if(restoring){refresh();return;}if(i===0){duration=buffer(0).length()/1000;sr=(buffer(0).framecount()*1000/buffer(0).length());detect();}else say(roles[i-1]+' replacement ready.');}
function regionLength(){return Math.max(0,Math.min(duration-state.start,beats()*60/state.tempo));}
function refresh(){var b=buffer(0);if(b.framecount()<=0||b.length()<=0)return;duration=b.length()/1000;sr=(b.framecount()*1000/b.length());var len=regionLength();wave=[];for(var i=0;i<520;i++){var f=Math.floor((state.start+i*len/520)*sr),n=Math.max(1,Math.floor(len*sr/520)),d=b.peek(1,f,Math.min(n,b.framecount()-f)),peak=0;if(typeof d==='number')d=[d];for(var k=0;k<d.length;k++)peak=Math.max(peak,Math.abs(d[k]));wave.push(peak);}redraw();}
function detect(){stop();var b=buffer(0);if(b.framecount()<=0){say('Load source audio first.');return;}duration=b.length()/1000;sr=(b.framecount()*1000/b.length());var start=state.start,end=start+regionLength(),hop=Math.round(sr*.005),frames=[],prev=0,peak=0;for(var f=Math.floor(start*sr);f<end*sr;f+=hop){var d=b.peek(1,f,Math.min(hop,b.framecount()-f));if(typeof d==='number')d=[d];var sum=0;for(var k=0;k<d.length;k++)sum+=d[k]*d[k];var rms=Math.sqrt(sum/Math.max(1,d.length));frames.push([f/sr,rms,Math.max(0,rms-prev)]);prev=rms;peak=Math.max(peak,rms);}var pts=[start];for(var j=2;j<frames.length-2;j++){var local=0;for(var q=Math.max(0,j-20);q<j;q++)local+=frames[q][2];local/=Math.min(j,20);if(frames[j][2]>Math.max(peak*.025,local*2.8)&&frames[j][2]>=frames[j-1][2]&&frames[j][2]>frames[j+1][2]&&frames[j][0]-pts[pts.length-1]>.08&&frames[j][0]<end-.03)pts.push(frames[j][0]);if(pts.length>=64)break;}rebuild(pts);}
function classify(a,b){var buf=buffer(0),d=buf.peek(1,Math.floor(a*sr),Math.max(1,Math.floor((Math.min(b,a+.18)-a)*sr)));if(typeof d==='number')d=[d];var low=0,lo=0,hi=0,sum=0,prev=0,alpha=1-Math.exp(-2*Math.PI*180/sr);for(var i=0;i<d.length;i++){var x=d[i];low+=alpha*(x-low);lo+=low*low;hi+=(x-prev)*(x-prev);sum+=x*x;prev=x;}if(sum<1e-9)return 4;if(lo/sum>.55)return b-a>.5?5:0;if(hi/sum>.75)return 2;if(hi/sum>.18)return 1;return b-a>.6?4:3;}
function rebuild(points){stop();if(!duration)return;points.sort(function(a,b){return a-b;});var clean=[];for(var p=0;p<points.length;p++)if(points[p]>=state.start&&points[p]<state.start+regionLength()&&(!clean.length||points[p]-clean[clean.length-1]>.025))clean.push(points[p]);state.slices=[];state.events=[];for(var i=0;i<clean.length;i++){var end=clean[i+1]||state.start+regionLength();state.slices.push([clean[i],end]);state.events.push({id:++uid,slice:i,role:classify(clean[i],end),beat:(clean[i]-state.start)*state.tempo/60,velocity:100,pitch:0,reverse:false,locked:false});}state.original=copy(state.events);state.ranges=[];selected=-1;undoStack=[];refresh();say(state.slices.length+' slices. Role suggestions are editable. Select a stretch to protect before generating.');}
function legacyVary(){if(!state.events.length)return;stop();saveundo();var protectedEvents=[],others=[],a=state.amount;for(var i=0;i<state.events.length;i++){var old=state.events[i],e=copy(old);if(e.locked||state.roleLocks[e.role]||locked(e.beat)){protectedEvents.push(e);continue;}if((state.style===0&&nextRandom()<a*.15)||(state.style===2&&nextRandom()<a*.65))continue;if((state.style===0||state.style===1)&&nextRandom()<a){var dest=((e.beat+(nextRandom()<.5?-1:1)*Math.ceil(nextRandom()*3)/4)%beats()+beats())%beats();if(!locked(dest))e.beat=dest;}if(state.style===0){if(nextRandom()<a*.3)e.reverse=!e.reverse;if(nextRandom()<a*.3)e.pitch=clamp(e.pitch+(nextRandom()<.5?-5:3),-24,12);}others.push(e);if((state.style===3&&nextRandom()<a)||(state.style===0&&nextRandom()<a*.2)){var dupe=copy(e);dupe.id=++uid;dupe.beat=(e.beat+.25)%beats();dupe.velocity=Math.max(30,e.velocity-18);if(!locked(dupe.beat))others.push(dupe);}}state.events=protectedEvents.concat(others.slice(0,Math.max(0,1024-protectedEvents.length)));state.events.sort(function(a,b){return a.beat-b.beat;});selected=-1;say('New variation. Locked hits, roles and time stretches preserved. Undo is available.');}
function sound(e){var use=state.mode===0&&state.paths[e.role+1],idx=use?e.role+1:0,b=buffer(idx),s=state.slices[e.slice],a=use?0:s[0]*1000,z=use?b.length():s[1]*1000,pitch=e.pitch+(use?state.padPitch[e.role]:0);return {index:idx,a:e.reverse?z:a,z:e.reverse?a:z,dur:Math.abs(z-a)/Math.pow(2,pitch/12),gain:e.velocity/127*(use?state.padGain[e.role]:1)*.6};}
function trigger(e){if(!state.slices.length&&!e.source&&!e.frozen&&!(typeof instrumentPath==='function'?instrumentPath(e.role):state.paths[e.role+1]))return;var s=e.frozen||sound(e);if(e.frozen){s=copy(s);s.gain*=e.velocity/127;}voice=(voice%32)+1;outlet(0,'voice',voice,ns+'-b'+s.index,s.a,s.z,s.dur,s.gain,Math.min(2,buffer(s.index).channelcount()),s.pan||0);}
function auditionRole(r){for(var i=0;i<state.events.length;i++)if(state.events[i].role===r){trigger(state.events[i]);return;}if(state.slices.length)trigger({role:r,slice:0,pitch:0,reverse:false,velocity:100});}
function play(){if(!state.events.length)return;stop();playing=true;playTime=new Date().getTime();lastBeat=-.001;cycle=0;clock.repeat();redraw();}function currentBeat(){return ((new Date().getTime()-playTime)*state.tempo/60000)%beats();}function tick(){var absolute=(new Date().getTime()-playTime)*state.tempo/60000;
var playbackEvents=typeof auditionEvents==='function'?auditionEvents():state.events;var from=Math.max(lastBeat,absolute-beats());for(var c=Math.max(0,Math.floor(from/beats()));c<=Math.floor(absolute/beats());c++)for(var i=0;i<playbackEvents.length;i++){var e=playbackEvents[i],target=c*beats()+e.beat;if(target>from&&target<=absolute){if(e.collage){var scheduled=copy(e);scheduled.performanceCycle=c;trigger(scheduled);}else trigger(e);}}lastBeat=absolute;redraw();}function stop(){playing=false;clock.cancel();outlet(0,'stop');redraw();}
function key(e){var n=copy(e);n.velocity=127;var s=sound(n);return JSON.stringify(s)+'_'+(s.index<7?state.paths[s.index]:state.archivePaths[s.index-7]);}
function mappings(){var map={},notes=[],templates=copy(state.noteMap);for(var z=0;z<templates.length;z++)map[templates[z].mapKey]=36+z;for(var i=0;i<state.events.length;i++){var e=state.events[i],k=key(e);if(map[k]===undefined){if(templates.length>=92)throw Error('Too many unique pads: reduce pitch/reverse variations.');map[k]=36+templates.length;var frozen=copy(e);frozen.velocity=127;frozen.frozen=sound(frozen);frozen.frozen.index=archiveBuffer(frozen.frozen.index);frozen.mapKey=k;templates.push(frozen);}notes.push({pitch:map[k],start_time:e.beat,duration:Math.max(.001,Math.min(beats()-e.beat,sound(e).dur*state.tempo/60000)),velocity:e.velocity,mute:false});}return {notes:notes,templates:templates};}
function midin(note,vel){if(vel<=0)return;var e=state.noteMap[note-36];if(e){e=copy(e);e.velocity=vel;trigger(e);}}
function writeLive(label){try{if(!state.events.length)throw Error('Load a loop or add hits first.');stop();var m=mappings(),track=new LiveAPI(this.patcher,'this_device canonical_parent');if(track.type!=='Track'){say('Place Recast directly on a MIDI track, outside a Rack.');return;}var path=track.unquotedpath,slots=track.get('clip_slots'),count=slots.length/2,index=-1;for(var i=0;i<count;i++){var slot=new LiveAPI(null,path+' clip_slots '+i);if(Number(slot.get('has_clip'))===0){index=i;break;}}if(index<0){say('Add an empty Session scene first; Recast will not overwrite a clip.');return;}var target=new LiveAPI(null,path+' clip_slots '+index);target.call('create_clip',beats());if(Number(target.get('has_clip'))!==1)throw Error('Live did not create the clip.');var clip=new LiveAPI(null,path+' clip_slots '+index+' clip');clip.set('name','Recast '+(label||'variation'));clip.call('add_new_notes',JSON.stringify({notes:m.notes}));state.noteMap=m.templates;say('MIDI written to empty Session slot '+(index+1)+'. Play through Recast; suggested tempo '+state.tempo+' BPM.');return true;}catch(err){say('MIDI write: '+err.message);return false;}}
function saved(){try{var path=arrayfromargs(arguments).join(' '),f=new File(path,'write','TEXT');if(!f.isopen)throw Error('Cannot write session.');f.eof=0;f.position=0;var json=JSON.stringify(state);for(var off=0;off<json.length;off+=16000)f.writestring(json.slice(off,off+16000));f.close();say('Session saved. Keep the source audio files in their current locations.');}catch(e){say(e.message);}}
function opened(){try{var path=arrayfromargs(arguments).join(' '),f=new File(path,'read'),s='';while(f.position<f.eof)s+=f.readstring(Math.min(32000,f.eof-f.position));f.close();var n=JSON.parse(s);if(!n.paths||n.paths.length!==7||!n.events||!n.slices||n.events.length>1024)throw Error('Invalid session');stop();state=defaults(n);restoring=true;for(var i=0;i<7;i++)if(state.paths[i])loadSessionBuffer(i,state.paths[i]);undoStack=[];selected=-1;restoreArchives();uid=new Date().getTime();setupTask.schedule(1000);say('Session opened. Audio is linked to its original paths.');}catch(e){say('Open failed: '+e.message);}}

function notifydeleted(){clock.cancel();setupTask.cancel();restoreTask.cancel();readyTask.cancel();recallTask.cancel();if(typeof prepareTask!=='undefined'&&prepareTask)prepareTask.cancel();if(typeof libraryTask!=='undefined'&&libraryTask)libraryTask.cancel();}
var readyTask=new Task(function(){stateReady=true;refresh();},this);var recallTask=new Task(function(){var p=this.patcher.getnamed('recastSession');if(p){var v=p.getvalueof();if(v instanceof Array)restore.apply(this,v);else restore(v);}readyTask.schedule(400);},this);function sessionFileExists(path){if(!path||typeof path!=='string')return false;try{var f=new File(path,'read'),ok=f.isopen;f.close();return !!ok;}catch(e){return false;}}
function loadSessionBuffer(index,path){if(!sessionFileExists(path))return false;buffer(index).send('import',path);return true;}
function loadbang(){initBuffers();recallTask.schedule(100);}

var restorePayload=null;var restoreTask=new Task(function(){restoreNow(restorePayload);},this);function restore(){if(syncingStore)return;var args=arrayfromargs(arguments),s=args.join(' ');if(args[0]==='dictionary'){try{s=new Dict(args[1]).stringify();}catch(e){return;}}else if(args[0]&&typeof args[0]==='object'){try{var value=args[0];if(typeof value.stringify==='function')s=value.stringify();else if(value.name)s=new Dict(value.name).stringify();else s=JSON.stringify(value);}catch(e){return;}}if(s.indexOf('set ')===0)s=s.slice(4);if(s.charAt(0)!=='{'||s==='{}'||s===JSON.stringify(state))return;try{var n=JSON.parse(s);if(!n.paths||!n.events)return;state=defaults(n);restoring=true;lastStored=JSON.stringify(state);restorePayload=lastStored;restoreTask.schedule(200);}catch(e){say('Restore failed: '+e.message);}}function restoreNow(s){try {initBuffers();var n=JSON.parse(s);if(!n.paths||!n.events)return;state=defaults(n);restoring=true;for(var i=0;i<7;i++)if(state.paths[i])loadSessionBuffer(i,state.paths[i]);restoreArchives();uid=new Date().getTime();setupTask.schedule(500);}catch(e){say('Restore: '+e.message);}}
function save(){embedmessage('restore',JSON.stringify(state));}
function bytestring(s){var a=[];for(var i=0;i<s.length;i++)a.push(s.charCodeAt(i));return a;}
function le(n,k){var a=[];while(k--){a.push(n&255);n=Math.floor(n/256);}return a;}
function be(n,k){return le(n,k).reverse();}
function vlq(n){var a=[n&127];while(n>>=7)a.unshift((n&127)|128);return a;}
function exportfolder(){var path=arrayfromargs(arguments).join(' ').replace(/\/$/,'');try{stop();var m=mappings(),prefix='Recast-'+new Date().getTime()+'-',msgs=[],body=[],tempo=Math.round(60000000/state.tempo);body=[0,255,81,3].concat(be(tempo,3));for(var i=0;i<m.notes.length;i++){var n=m.notes[i],t=Math.round(n.start_time*960);msgs.push({t:t,b:[144,n.pitch,n.velocity]});msgs.push({t:Math.min(beats()*960,t+Math.max(1,Math.round(n.duration*960))),b:[128,n.pitch,0]});}msgs.sort(function(a,b){return a.t-b.t||a.b[0]-b.b[0];});var prev=0;for(var j=0;j<msgs.length;j++){body=body.concat(vlq(msgs[j].t-prev),msgs[j].b);prev=msgs[j].t;}body=body.concat(vlq(Math.max(0,beats()*960-prev)),[255,47,0]);var mf=new File(path+'/'+prefix+'variation.mid','write');mf.writebytes(bytestring('MThd').concat([0,0,0,6,0,0,0,1,3,192],bytestring('MTrk'),be(body.length,4),body));mf.close();
for(var k=0;k<m.templates.length;k++){var e=copy(m.templates[k]);e.velocity=127;var snd=e.frozen||sound(e),buf=buffer(snd.index),rate=44100,ch=Math.min(2,buf.channelcount()),frames=Math.max(1,Math.round(snd.dur*rate/1000)),nativeRate=(buf.framecount()*1000/buf.length()),cached=audioRange(buf,snd.a,snd.z,nativeRate),f=new File(path+'/'+prefix+('00'+k).slice(-3)+'-'+roles[e.role]+'.wav','write');if(!f.isopen)throw Error('Cannot write audio');f.eof=0;f.position=0;f.writebytes(bytestring('RIFF').concat(le(36+frames*ch*2,4),bytestring('WAVEfmt '),le(16,4),le(1,2),le(ch,2),le(rate,4),le(rate*ch*2,4),le(ch*2,2),le(16,2),bytestring('data'),le(frames*ch*2,4)));var data=[];for(var a=0;a<frames;a++){var pos=(snd.a+(snd.z-snd.a)*a/frames)*nativeRate/1000,ix=Math.floor(pos),frac=pos-ix,env=Math.min(1,a/88,(frames-1-a)/88);for(var c=1;c<=ch;c++){var v=rangeSample(cached,c,ix),v2=rangeSample(cached,c,ix+1),val=Math.round(clamp((v+(v2-v)*frac)*env*snd.gain,-1,1)*32767);data=data.concat(le(val<0?val+65536:val,2));}if(data.length>=8192){f.writebytes(data);data=[];}}if(data.length)f.writebytes(data);f.close();}say('Exported MIDI + '+m.templates.length+' 16-bit WAV pads. Drop ordered WAVs onto Drum Rack C1.');}catch(e){say('Export: '+e.message);}}

var rawDraw=false,initialized=false;
function initBuffers(){if(initialized)return true;var parent=this.patcher.parentpatcher,found=0;if(!parent)return false;for(var i=0;i<7;i++){var obj=parent.getnamed('recastbuffer'+i);if(obj){obj.message('name',ns+'-b'+i);found++;}}initialized=found===7;return initialized;}
function defaults(n){if(!n.archivePaths)n.archivePaths=[];if(!n.family)n.family=[];if(n.change===undefined)n.change=0;if(n.scope===undefined)n.scope=0;if(n.weight===undefined)n.weight=.5;if(n.nerves===undefined)n.nerves=.5;return n;}
function paint(){oldPaint();rawDraw=true;
text('CHANGE',20,300,11);button('change',['Timing + sounds','Timing only','Sounds only','Pitch / reverse','Space / density'][state.change],85,280,170);
button('scope',['Whole loop','Last beat only','Selected stretch'][state.scope],265,280,155);
button('amount-','−',430,280,28);text(Math.round(state.amount*100)+'%',468,300,12);button('amount+','+',510,280,28);
button('vary','GENERATE',550,280,130,true);button('reply','Reply',690,280,95);button('fill','Groove fill',795,280,120);button('family','5 variations',925,280,135);
text('SLOW WEIGHT',20,350,11);button('weight-','−',125,330,28);text(Math.round(state.weight*100)+'%',162,350,12);button('weight+','+',205,330,28);
text('FAST NERVES',265,350,11);button('nerves-','−',365,330,28);text(Math.round(state.nerves*100)+'%',402,350,12);button('nerves+','+',445,330,28);
button('groove','Build weight + nerves',500,330,210);text('Reply preserves bar 1. Locks always win.',730,350,12);
if(state.family.length){text('VARIATIONS',20,805,11);for(var i=0;i<state.family.length;i++)button('family'+i,state.family[i].name,120+i*145,785,135);button('writefamily','Write all',855,785,110);}
rawDraw=false;}
function onclick(x,y,but,cmd,shift){if(y>=280&&y<365||y>=785&&y<820){for(var i=0;i<buttons.length;i++){var b=buttons[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){action(b.id);return;}}return;}baseClick(x,y>=385?y-100:y,but,cmd,shift);}
function ondblclick(x,y){baseDoubleClick(x,y>=385?y-100:y);}
function protectedHit(e){return e.locked||state.roleLocks[e.role]||locked(e.beat);}
function inScope(t){return state.scope===0||state.scope===1&&t>=beats()-1||state.scope===2&&selection&&t>=selection[0]&&t<selection[1];}
function candidate(e){var options=[];for(var i=0;i<state.original.length;i++)if(state.original[i].role===e.role&&options.indexOf(state.original[i].slice)<0)options.push(state.original[i].slice);return options.length?options[Math.floor(nextRandom()*options.length)]:e.slice;}
function transform(events,kind,reply){var out=[],a=state.amount;for(var i=0;i<events.length;i++){var old=events[i],e=copy(old),editable=!protectedHit(e)&&inScope(e.beat)&&(!reply||e.beat>=4);if(!editable){out.push(e);continue;}
if(kind==='sparse'||kind==='breakdown'){if(nextRandom()<a*(kind==='breakdown'?.8:.55))continue;}
else if(kind==='space'&&nextRandom()<a*.45)continue;
if(kind==='timing'||kind==='mixed'||kind==='unstable'||kind==='fill'){if(nextRandom()<a){var dest=e.beat+(nextRandom()<.5?-1:1)*(kind==='fill'?.125:.25)*(1+Math.floor(nextRandom()*3));if(dest>=0&&dest<beats()&&inScope(dest)&&!locked(dest)&&(!reply||dest>=4))e.beat=dest;}}
if(kind==='sounds'||kind==='mixed'||kind==='unstable'){if(nextRandom()<a)e.slice=candidate(e);}
if(kind==='pitch'||kind==='unstable'){if(nextRandom()<a){e.reverse=!e.reverse;e.pitch=clamp(e.pitch+(nextRandom()<.5?-5:3),-24,12);}}
out.push(e);
if((kind==='full'||kind==='fill'||kind==='unstable')&&nextRandom()<a){var n=copy(e);n.id=++uid;n.beat+=kind==='fill'?.125:.25;n.velocity=Math.max(25,e.velocity-20);if(n.beat<beats()&&inScope(n.beat)&&!locked(n.beat))out.push(n);}}
// Never trim protected material when limiting density.
var fixed=[],other=[];for(var j=0;j<out.length;j++)(protectedHit(out[j])?fixed:other).push(out[j]);return fixed.concat(other.slice(0,Math.max(0,1024-fixed.length))).sort(function(a,b){return a.beat-b.beat;});}
function vary(){if(!state.events.length)return;if(state.scope===2&&!selection){say('Shift-click two cells to select a stretch first.');return;}stop();saveundo();state.events=transform(state.events,['mixed','timing','sounds','pitch','space'][state.change],false);selected=-1;say('Variation ready. Locks and selected change scope preserved.');}
function reply(){if(state.bars<2){say('Choose at least 2 bars for call and response.');return;}if(!state.events.length)return;stop();saveundo();var first=state.events.filter(function(e){return e.beat<4;}),result=state.events.filter(function(e){return e.beat<4||protectedHit(e);});for(var b=1;b<state.bars;b++)for(var i=0;i<first.length;i++){var n=copy(first[i]);n.beat+=b*4;n.id=++uid;n.locked=false;if(!locked(n.beat)&&!state.roleLocks[n.role])result.push(n);}state.events=transform(result,'mixed',true);selected=-1;say('Bar 1 kept intact. Later bars answer it; protected material stays intact.');}
function buildFamily(){if(!state.events.length)return;stop();state.family=[];var names=['Sparse','Full','Unstable','Breakdown','Fill'],kinds=['sparse','full','unstable','breakdown','fill'];for(var i=0;i<5;i++)state.family.push({name:names[i],events:transform(state.events,kinds[i],false)});say('Five alternatives saved below. Click one to try it; Undo returns to your previous loop.');}
function groove(){if(!state.events.length)return;stop();saveundo();var out=[];for(var i=0;i<state.events.length;i++){var e=copy(state.events[i]);if(protectedHit(e)||!inScope(e.beat)){out.push(e);continue;}if(e.role===0||e.role===1||e.role===5){e.velocity=Math.round(65+62*state.weight);out.push(e);}else{if(nextRandom()>.7*(1-state.nerves))out.push(e);if(nextRandom()<state.nerves){var n=copy(e);n.id=++uid;n.beat+=.125;n.velocity=Math.max(25,e.velocity-25);if(n.beat<beats()&&inScope(n.beat)&&!locked(n.beat))out.push(n);}}}var f=out.filter(protectedHit),o=out.filter(function(e){return !protectedHit(e);});state.events=f.concat(o.slice(0,1024-f.length)).sort(function(a,b){return a.beat-b.beat;});say('Heavy anchors with quicker texture replies. Timing of kick, snare and bass preserved.');}
function action(id){if(id==='change')state.change=(state.change+1)%5;else if(id==='scope')state.scope=(state.scope+1)%3;else if(id==='reply')reply();else if(id==='family')buildFamily();else if(id==='fill')makeFill();else if(/^family[0-4]$/.test(id)){stop();saveundo();state.events=copy(state.family[Number(id.slice(6))].events);selected=-1;say(state.family[Number(id.slice(6))].name+' selected.');}else if(id==='groove')groove();else if(id==='weight-'||id==='weight+')state.weight=clamp(state.weight+(id==='weight+'?.1:-.1),0,1);else if(id==='nerves-'||id==='nerves+')state.nerves=clamp(state.nerves+(id==='nerves+'?.1:-.1),0,1);else if(id==='writefamily')writeFamily();else if(id==='bounce')outlet(0,'bounce');else if(id==='help')say('1 Load loop / set BPM. 2 Lock a stretch. 3 Generate or reply. 4 Write MIDI. Bounce through Live FX, then load that audio to recast again.');else baseAction(id);redraw();}
function writeFamily(){if(!state.family.length)return;var original=copy(state.events),oldMap=copy(state.noteMap),preflight=true;try{var track=new LiveAPI(this.patcher,'this_device canonical_parent');if(track.type!=='Track')throw Error('Place Recast directly on a MIDI track.');var slots=track.get('clip_slots'),free=0;for(var i=0;i<slots.length/2;i++)if(Number(new LiveAPI(null,track.unquotedpath+' clip_slots '+i).get('has_clip'))===0)free++;if(free<state.family.length)throw Error('Add '+state.family.length+' empty Session slots first.');for(var j=0;j<state.family.length;j++){state.events=copy(state.family[j].events);state.noteMap=mappings().templates;}state.noteMap=oldMap;preflight=false;for(var k=0;k<state.family.length;k++){state.events=copy(state.family[k].events);if(!writeLive(state.family[k].name))throw Error('Stopped at '+state.family[k].name+'. Earlier clips are preserved.');}say('Five variation clips written to Live. They share this Recast instrument.');}catch(e){if(preflight)state.noteMap=oldMap;say('Family: '+e.message);}state.events=original;redraw();}
function bounced(){var path=arrayfromargs(arguments).join(' ');try{if(!state.events.length)throw Error('Generate a groove first.');stop();var rate=44100,frames=Math.ceil(beats()*60/state.tempo*rate),L=[],R=[];for(var i=0;i<frames;i++){L[i]=0;R[i]=0;}for(var j=0;j<state.events.length;j++){var e=state.events[j],s=sound(e),b=buffer(s.index),native=b.framecount()*1000/b.length(),offset=Math.round(e.beat*60/state.tempo*rate),len=Math.round(s.dur*rate/1000),cached=audioRange(b,s.a,s.z,native);for(var k=0;k<len&&offset+k<frames;k++){var pos=(s.a+(s.z-s.a)*k/len)*native/1000,ix=Math.floor(pos),frac=pos-ix,env=Math.min(1,k/88,(len-1-k)/88)*s.gain;for(var c=1;c<=2;c++){var ch=Math.min(c,b.channelcount()),v=rangeSample(cached,ch,ix),v2=rangeSample(cached,ch,ix+1);(c===1?L:R)[offset+k]+=(v+(v2-v)*frac)*env*collagePanGains(s.pan||0)[c-1];}}}var peak=0;for(var z=0;z<frames;z++)peak=Math.max(peak,Math.abs(L[z]),Math.abs(R[z]));var gain=peak>.98?.98/peak:1,f=new File(path,'write');if(!f.isopen)throw Error('Cannot write bounce.');f.eof=0;f.position=0;f.writebytes(bytestring('RIFF').concat(le(36+frames*4,4),bytestring('WAVEfmt '),le(16,4),le(1,2),le(2,2),le(rate,4),le(rate*4,4),le(4,2),le(16,2),bytestring('data'),le(frames*4,4)));var bytes=[];for(var n=0;n<frames;n++){for(var cc=0;cc<2;cc++){var val=Math.round((cc?R[n]:L[n])*gain*32767);bytes=bytes.concat(le(val<0?val+65536:val,2));}if(bytes.length>=8192){f.writebytes(bytes);bytes=[];}}if(bytes.length)f.writebytes(bytes);f.close();say('Loop bounced as 16-bit WAV. Recast processing included; downstream Live FX are not included.');}catch(e){say('Bounce: '+e.message);}}

function resizeBars(){var lengths=[1,2,4,8,12,16],old=beats(),next=lengths[(lengths.indexOf(state.bars)+1)%lengths.length];stop();saveundo();var original=copy(state.events);state.bars=next;state.page=0;state.events=original.filter(function(e){return e.beat<beats();});if(beats()>old)for(var off=old;off<beats();off+=old)for(var i=0;i<original.length;i++){var e=copy(original[i]);e.beat+=off;e.id=++uid;e.locked=false;if(e.beat<beats()&&!locked(e.beat))state.events.push(e);}state.ranges=state.ranges.filter(function(r){return r[0]<beats();}).map(function(r){return [r[0],Math.min(r[1],beats())];});state.family=[];selected=-1;refresh();say(next+' bars. Existing groove repeated to fill the length; Generate develops it. Reslice only when you want new source boundaries.');}
function makeFill(){if(!state.events.length)return;stop();saveundo();var start=selection?selection[0]:beats()-1,end=selection?selection[1]:beats(),pool=state.events.filter(function(e){return !state.roleLocks[e.role];}),anchors=state.events.filter(function(e){return e.beat<start||e.beat>=end||protectedHit(e);});if(!pool.length){say('Unlock a role to build a fill.');return;}var step=state.nerves>.65?.125:.25;for(var t=start;t<end;t+=step){if(locked(t))continue;var original=pool[Math.floor(nextRandom()*pool.length)],e=copy(original);e.id=++uid;e.beat=t;e.locked=false;e.velocity=Math.round(clamp(original.velocity*(.65+.35*(t-start)/Math.max(.25,end-start)),35,127));if(nextRandom()<state.amount*.3)e.reverse=!e.reverse;if(nextRandom()<state.amount*.25)e.pitch=clamp(e.pitch-5,-24,12);anchors.push(e);}state.events=anchors.sort(function(a,b){return a.beat-b.beat;});selected=-1;say('Fill built from this groove in '+(selection?'your selected stretch':'the last beat')+'. Everything outside it and all locks preserved.');}

function getvalueof(){return JSON.stringify(state);}
function setvalueof(){var args=arrayfromargs(arguments);if(args.length)restore.apply(this,args);}

var archivedObjects=[];
function archiveBuffer(index){if(index>=7)return index;var path=state.paths[index],found=state.archivePaths.indexOf(path);if(found>=0&&buffer(7+found).framecount()>0)return 7+found;if(found<0){found=state.archivePaths.length;state.archivePaths.push(path);}var obj=archivedObjects[found];if(!obj){obj=this.patcher.parentpatcher.newdefault(20,1000+found*25,'buffer~',ns+'-b'+(7+found));archivedObjects[found]=obj;}obj.message('import',path);if(buffer(7+found).framecount()<=0)throw Error('Cannot load archived audio: '+path);return 7+found;}
function restoreArchives(){for(var i=0;i<archivedObjects.length;i++)if(archivedObjects[i])this.patcher.parentpatcher.remove(archivedObjects[i]);archivedObjects=[];for(var n=0;n<state.archivePaths.length;n++){var obj=this.patcher.parentpatcher.newdefault(20,1000+n*25,'buffer~',ns+'-b'+(7+n));archivedObjects[n]=obj;if(sessionFileExists(state.archivePaths[n]))obj.message('import',state.archivePaths[n]);}}
function drop(){var args=arrayfromargs(arguments),target=Number(args.shift()),path=args.join(' ');if(!/\.(wav|aif|aiff)$/i.test(path)){say('Drop a WAV or AIFF audio file. Export Live clips to audio first.');return;}if(target<0||target>6||target!==Math.floor(target))return;pending=target;restoring=false;if(typeof toolPurpose!=='undefined')toolPurpose='';file(path);}

include("recast-workbench.js");

include("recast-tones.js");

function audioRange(b,a,z,rate){var start=Math.max(0,Math.floor(Math.min(a,z)*rate/1000)),end=Math.min(b.framecount(),Math.ceil(Math.max(a,z)*rate/1000)+2),v={start:start,data:[]};if(end<=start)throw Error('Audio is missing or empty. Relink its source file.');for(var c=1;c<=Math.min(2,b.channelcount());c++){var d=b.peek(c,start,end-start);v.data.push(typeof d==='number'?[d]:d);}return v;}
function rangeSample(v,c,index){var d=v.data[Math.min(c-1,v.data.length-1)];return d[clamp(index-v.start,0,d.length-1)]||0;}

function nextRandom(){if(state.seed===undefined)state.seed=123456789;state.seed=(1664525*state.seed+1013904223)%4294967296;return state.seed/4294967296;}

include("recast-instability.js");

include("recast-ideas.js");

include("recast-articulation.js");

include("recast-phrases.js");

include("recast-tools.js");

include("recast-regions.js");

include("recast-finish.js");

include("recast-explore.js");

include("recast-tempo.js");
include("recast-analysis.js");
include("recast-simple.js");

include("recast-source.js");

include("recast-midi.js");

include("recast-generator.js");

include("recast-instrument.js");

include("recast-export.js");
include("recast-dialogs.js");

include("recast-workflow.js");

include("recast-visual.js");

include("recast-compare.js");

include("recast-edit.js");

include("recast-performance.js");
include("recast-performance-ui.js");
include("recast-grid-expression.js");

include("recast-browser.js");

include("recast-pocket.js");

include("recast-damage.js");

include("recast-browser-nav.js");
include("recast-feel-ui.js");

include("recast-vocabulary.js");

include("recast-starter.js");

include("recast-space.js");

include("recast-rolls.js");

include("recast-shaping.js");

include("recast-sound-target.js");

include("recast-collage.js");
include("recast-collage-ui.js");

include("recast-collage-library.js");

include("recast-collage-pitch.js");

include("recast-collage-refine.js");

include("recast-collage-shape.js");

include("recast-collage-render.js");

include("recast-collage-output.js");

include("recast-collage-keys.js");

include("recast-collage-placement.js");

include("recast-collage-clock.js");

include("recast-collage-keeps.js");

include("recast-bank-stability.js");

include("recast-collage-discovery.js");

include("recast-collage-draw-ui.js");

include("recast-collage-refinement.js");

include("recast-collage-fragments.js");

include("recast-collage-refinement-ui.js");

include("recast-usability-pass.js");
