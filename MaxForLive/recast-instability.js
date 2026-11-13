// Offline, seeded rhythmic articulation. Generated events remain ordinary MIDI triggers.
var instabilityDefaults=defaults,instabilityPaint=paint,instabilityAction=action,instabilityClick=onclick;
var instabilitySound=sound,instabilitySnapshot=musicalSnapshot;
var instabilityNames=['stagger','trip','sputter','strangle','drag','recovery','anchors','clustering','contrast','answer'];
var instabilityLabels=['Stagger','Trip','Sputter','Strangle','Drag','Recovery','Anchor strength','Clustering','Contrast','Late answer'];
defaults=function(n){n=instabilityDefaults(n);if(!n.feel)n.feel={stagger:.3,trip:.15,sputter:.25,strangle:.3,drag:.15,recovery:.8,anchors:1,clustering:.6,contrast:.4,answer:.15,burst:.5};if(!n.feelAnchors)n.feelAnchors=[true,true,false,false,false,false];if(!n.feelBase)n.feelBase=[];if(!n.feelLast)n.feelLast='';return n;};state=defaults(state);
musicalSnapshot=function(){var n=instabilitySnapshot();n.feel=copy(state.feel);n.feelAnchors=copy(state.feelAnchors);n.feelBase=copy(state.feelBase);n.feelLast=state.feelLast;return n;};
function anchorHit(e){return state.feelAnchors[e.role]&&state.feel.anchors>=.999;}
function movable(e){return !protectedHit(e)&&!anchorHit(e)&&inScope(e.beat);}
function allowedDestination(t){return t>=0&&t<beats()&&inScope(t)&&!locked(t);}
function feelSignature(){return JSON.stringify([state.events,state.ranges,state.roleLocks]);}
function generateFeel(push,spaceOnly){
 if(!state.events.length){say('Load and slice a loop first.');return;}
 if(state.scope===2&&!selection){say('Select a stretch in Groove first, or choose Whole loop.');return;}
 stop();saveundo();
 if(state.feelLast!==feelSignature()||!state.feelBase.length)state.feelBase=copy(state.events);
 if(push){for(var p=0;p<5;p++)state.feel[instabilityNames[p]]=clamp(state.feel[instabilityNames[p]]+.1,0,1);state.feel.contrast=clamp(state.feel.contrast+.1,0,1);}
 var f=state.feel,src=copy(state.feelBase),out=[],episodes={},strength=f.contrast;
 for(var i=0;i<src.length;i++){
  var e=copy(src[i]);if(!movable(e)){out.push(e);continue;}
  if(state.feelAnchors[e.role]&&nextRandom()<f.anchors){out.push(e);continue;}
  var windowSize=1+3*(1-f.recovery),block=Math.floor(e.beat/windowSize),phase=e.beat/windowSize-block;
  if(!episodes[block])episodes[block]={active:nextRandom()<.55,sign:nextRandom()<.5?-1:1};
  var episode=episodes[block],activity=(1-f.clustering)+f.clustering*(episode.active?1:0),a=strength*activity;
  if(spaceOnly){if(nextRandom()<a*.65)continue;out.push(e);continue;}
  if(nextRandom()<f.trip*a*.35)continue;
  // A related early/late arc returns to zero at the episode boundary.
  var offset=episode.sign*Math.sin(phase*Math.PI)*f.stagger*a*.3;
  offset+=f.drag*a*.16;
  if(nextRandom()<f.trip*a)offset+=.125;
  if(allowedDestination(e.beat+offset))e.beat+=offset;
  if(nextRandom()<f.drag*a)e.pitch=clamp(e.pitch-Math.round(2+5*f.drag),-24,12);
  if(nextRandom()<f.strangle*a){e.durationBeats=.03125+(1-f.strangle)*.21875;e.chokeGroup=1+e.role;}
  out.push(e);
  if(nextRandom()<f.sputter*a){
   var count=2+Math.floor(f.sputter*3),span=f.burst;
   for(var j=1;j<count;j++){var n=copy(e);n.id=++uid;n.beat=e.beat+span*(1-Math.pow(1-j/count,state.ratchetCurve||1.7));n.velocity=Math.round(clamp(e.velocity*(1-.65*j/count),15,127));n.pitch=clamp(e.pitch-j,-24,12);n.durationBeats=Math.min(.125,span/count*.7);if(allowedDestination(n.beat))out.push(n);}
  }
  if(nextRandom()<f.answer*a){var reply=copy(e);reply.id=++uid;reply.beat=e.beat+.25+nextRandom()*.125;reply.velocity=Math.round(e.velocity*.55);reply.durationBeats=.125;if(allowedDestination(reply.beat))out.push(reply);}
 }
 var fixed=out.filter(function(e){return protectedHit(e)||anchorHit(e);}),rest=out.filter(function(e){return !protectedHit(e)&&!anchorHit(e);});state.events=fixed.concat(rest.slice(0,Math.max(0,1024-fixed.length))).sort(function(a,b){return a.beat-b.beat;});state.feelLast=feelSignature();selected=-1;say(spaceOnly?'Made room around your anchors. Undo restores the previous groove.':'Fixed variation ready. Nearby reuses the base; locks, scope and full-strength anchors stay intact.');
}
// A choke group limits a tail to the next group trigger, including the loop seam.
// Frozen MIDI sounds retain this duration; moving MIDI notes later requires rewriting.
sound=function(e){var s=instabilitySound(e);if(e.chokeGroup>0&&!protectedHit(e)){
 var wait=beats(),pattern=soundPatternEvents();for(var i=0;i<pattern.length;i++){var other=pattern[i];if(other.id===e.id||other.chokeGroup!==e.chokeGroup)continue;var delta=(other.beat-e.beat+beats())%beats();if(delta<.000001)continue;wait=Math.min(wait,delta);}
 var limit=wait*60000/state.tempo;if(limit<s.dur){s.z=s.a+(s.z-s.a)*limit/s.dur;s.dur=limit;}
 }return s;};
function editArticulation(kind){var e=state.events[selected];if(!e){say('Select a hit in Groove first.');return;}if(protectedHit(e)){say('Unlock this hit or its time range before editing its articulation.');return;}stop();saveundo();if(kind==='gate'){var values=[0,.03125,.0625,.125,.25,.5,1,2,4];e.durationBeats=values[(values.indexOf(e.durationBeats||0)+1)%values.length];}else e.chokeGroup=((e.chokeGroup||0)+1)%7;say('Hit articulation updated. Gate is in beats; 0 means natural tail.');}
nav=function(){updateDropZones();rawDraw=true;rect(178,10,515,40,[.065,.08,.075,1]);var tabs=['Groove','Sounds','Voices','Keepers','Instability'],ids=[0,1,3,2,4];for(var i=0;i<5;i++)button('view'+ids[i],tabs[i],185+i*101,14,96,view===ids[i]);};
paint=function(){if(view!==4){instabilityPaint();return;}buttons=[];rawDraw=true;rect(0,0,1080,880,[.065,.08,.075,1]);text('RECAST',20,35,28,[.88,.68,.39,1]);nav();button('play',playing?'STOP':'PLAY',710,14,85,playing);button('undo','Undo',805,14,75);button('write','Write MIDI',890,14,170);
 text('INSTABILITY / a pulse with unreliable machinery',20,100,22);text('Select hits or lock a passage in Groove. These settings travel with your saved keepers.',20,133,13);
 for(var i=0;i<instabilityNames.length;i++){var y=165+i*48,key=instabilityNames[i];text(instabilityLabels[i],20,y+19,14);rect(180,y+6,300,14,[.18,.22,.20,1]);rect(180,y+6,300*state.feel[key],14,[.65,.46,.24,1]);text(Math.round(state.feel[key]*100)+'%',495,y+19,12);}
 text('ANCHOR ROLES',580,184,14);for(var r=0;r<6;r++)button('anchor'+r,roles[r],580+(r%3)*155,205+Math.floor(r/3)*38,145,state.feelAnchors[r]);
 text('At 100%, anchor roles are unchanged. Explicit locks always win.',580,300,12);
 button('feelburst','Burst: '+state.feel.burst+' beats',580,330,210);button('scope',['Whole loop','Last beat','Selected stretch'][state.scope],800,330,240);
 button('feelbase','Use current as base',580,380,210);button('feelnear','Generate nearby',800,380,240);
 button('feelpush','Push further',580,425,210);button('feelspace','Make room',800,425,240);
 text('SELECTED HIT / duration and interruption',580,503,15);var e=state.events[selected];text(e?roles[e.role]+' / beat '+(e.beat+1).toFixed(3):'Select a hit in Groove, then return here.',580,536,13);
 button('hitgate',e&&e.durationBeats?'Gate: '+e.durationBeats+' beats':'Gate: natural tail',580,557,215);button('hitchoke','Choke group: '+(e&&e.chokeGroup||'Off'),805,557,235);
 text('Same-group hits cut preceding tails. Locked tails are exempt.',580,611,12);text('Gates shorten samples; they do not synthesize sustain.',580,635,12);
 text('Nearby makes a new take from the base, not an endlessly degraded copy.',20,690,14);text('Recovery shortens the timing disturbance. Clustering groups accidents into episodes.',20,718,13);text('WAV retains all shaping. Role MIDI retains note lengths; render for per-hit processing.',20,746,12);
 button('keep','Keep this groove',20,785,190);button('view0','Back to grid / lock passage',225,785,250);text(status.slice(0,145),20,856,12,[.64,.80,.68,1]);rawDraw=false;};
onclick=function(x,y,but,cmd,shift){if(view===4&&x>=180&&x<=480&&y>=165&&y<645){var row=Math.floor((y-165)/48);if(row<10){saveundo();state.feel[instabilityNames[row]]=Math.round(clamp((x-180)/300,0,1)*100)/100;redraw();return;}}if(y<52&&x>=180&&x<700||view===4){for(var i=0;i<buttons.length;i++){var b=buttons[i];if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){action(b.id);return;}}return;}instabilityClick(x,y,but,cmd,shift);};
action=function(id){if(id==='view4')view=4;else if(/^anchor[0-5]$/.test(id)){saveundo();var r=Number(id.slice(6));state.feelAnchors[r]=!state.feelAnchors[r];}else if(id==='feelbase'){saveundo();state.feelBase=copy(state.events);state.feelLast=feelSignature();say('Current groove is the base for nearby variations.');}else if(id==='feelnear')generateFeel(false,false);else if(id==='feelpush')generateFeel(true,false);else if(id==='feelspace')generateFeel(false,true);else if(id==='feelburst'){saveundo();var b=[.125,.25,.5,1];state.feel.burst=b[(b.indexOf(state.feel.burst)+1)%b.length];}else if(id==='hitgate')editArticulation('gate');else if(id==='hitchoke')editArticulation('choke');else instabilityAction(id);redraw();};
