// Standalone rhythm generation. Existing mutation and articulation engines operate on these events.
function euclideanHit(step,pulses,length,rotation){return ((step+(rotation||0))%length)*pulses%length<pulses;}
function generateFreshRole(target){
 stop();saveundo();var previous=copy(state.events),out=previous.filter(function(e){return protectedHit(e)||(target>=0&&e.role!==target);});var active=target>=0?[target]:[0,1,2];
 function occupied(t){for(var k=0;k<out.length;k++)if(Math.abs(out[k].beat-t)<.10)return true;return false;}
 function add(role,t,v,gate){if(t<0||t>=beats()||locked(t)||state.roleLocks[role])return;for(var k=0;k<out.length;k++)if(out[k].role===role&&Math.abs(out[k].beat-t)<.03)return;var e={id:++uid,slice:0,role:role,beat:t,velocity:Math.round(v),pitch:0,reverse:false,locked:false};if(gate)e.durationBeats=gate;if(role===2||role===4)e.chokeGroup=role+1;out.push(e);}
 for(var a=0;a<active.length;a++){var role=active[a];for(var bar=0;bar<state.bars;bar++){var base=bar*4;
 if(role===0){add(role,base,112);add(role,base+2,100);if(nextRandom()<.45)add(role,base+2.75,78);}
 else if(role===1){add(role,base+1,108);add(role,base+3,116);if(nextRandom()<.35)add(role,base+2.75,48,.12);}
 else if(role===2){for(var h=0;h<8;h++){if(h%2===0&&nextRandom()<.18)continue;add(role,base+h*.5,h%2?72:54,h%2?.18:.08);}}
 else if(role===3){var rotation=Math.floor(nextRandom()*16);for(var p=0;p<16;p++)if(euclideanHit(p,5,16,rotation)&&!occupied(base+p*.25))add(role,base+p*.25,55+nextRandom()*35,.20);}
 else if(role===4){for(var f=0;f<2;f++){var t=base+1.375+f*2;if(!occupied(t)){add(role,t,60+nextRandom()*30);var e=out[out.length-1];if(e&&e.role===role&&e.beat===t){if(nextRandom()<.5)e.durationBeats=.0625;else {e.art=articulation();e.art.sustain=.5;e.art.flutter=8;}}}}}
 else if(role===5){add(role,base,90,1.5);if(nextRandom()<.5)add(role,base+2.5,75,.5);}
 }}
 state.events=bounded(out);state.slices=state.slices.length?state.slices:[[0,.1]];state.mode=0;state.original=copy(state.events);state.feelBase=copy(state.events);state.family=[];state.grooveInput='generated';state.grooveName='Generated rhythm';selected=-1;gridTool='edit';say(target<0?'New kick / snare / hat groove. Protected hits and gaps retained. Load sounds, then play.':'Generated '+roles[target]+' around the other roles. Protected hits and gaps retained.');
}
var generatorPaint=paint;paint=function(){generatorPaint();if(view!==0)return;rawDraw=true;buttons=buttons.filter(function(b){return b.y>=238||b.id==='save'||b.id==='open'||b.id==='view14';});rect(175,8,525,44,[.065,.08,.075,1]);rect(0,48,1080,188,[.065,.08,.075,1]);button('freshBeat','Generate new beat',190,14,210);text('BUILD A RHYTHM — assign your sounds below, then play and reshape it.',20,76,16);text('4/4 • '+Number(state.tempo.toFixed(2))+' BPM • '+state.bars+' bars • '+state.events.length+' hits',20,103,12);button('bpm-','BPM −',630,83,85);button('bpm+','BPM +',725,83,85);text('Generate just one role; keep the others:',20,131,13);for(var r=0;r<6;r++)button('freshRole'+r,roles[r],20+r*175,143,160);button('previousMidiHit','Previous hit',20,177,135);button('nextMidiHit','Next hit',165,177,135);button('view4','Glitch / choke',320,177,160);button('view7','Gate / sustain',490,177,160);var e=state.events[selected];text(e?'Selected '+roles[e.role]+' — assign its role in the inspector below.':'Select a step or use Next hit. Protect keeps hits safe during generation.',20,230,12);rawDraw=false;};
var generatorAction=action;action=function(id){if(id==='freshBeat'){generateFreshRole(-1);return;}if(/^freshRole[0-5]$/.test(id)){generateFreshRole(Number(id.slice(9)));return;}generatorAction(id);};
// Main variations are fresh interpretations of the foundation, not mutations of mutations.
function foundationHit(e){return e.role===0&&Math.abs(e.beat/2-Math.round(e.beat/2))<.00001||e.role===1&&Math.abs((e.beat-1)/2-Math.round((e.beat-1)/2))<.00001;}
function structuredVariation(fillOnly){
 if(!state.events.length){say('Generate a new beat first.');return;}stop();saveundo();
 var source=copy(fillOnly?state.events:(state.original.length?state.original:state.events)),out=state.events.filter(protectedHit).map(copy),amount=state.amount,fillStart=beats()-1;
 function room(e){if(e.beat<0||e.beat>=beats()||locked(e.beat)||state.roleLocks[e.role])return false;for(var i=0;i<out.length;i++)if(out[i].role===e.role&&Math.abs(out[i].beat-e.beat)<.06)return false;return true;}
 for(var i=0;i<source.length;i++){var e=copy(source[i]);if(protectedHit(e))continue;
 var anchor=foundationHit(e),eligible=!fillOnly||e.beat>=fillStart;
 if(!anchor&&eligible){if(nextRandom()<amount*.15)continue;if(e.role>=2){if(nextRandom()<amount*.45)e.beat+=.015+nextRandom()*.035; e.velocity=Math.round(clamp(e.velocity+(nextRandom()-.5)*amount*24,25,120));}}
 if(room(e))out.push(e);
 }
 // One bounded burst at a phrase ending, with descending accents and short gates.
 for(var bar=0;bar<state.bars;bar++){if(fillOnly&&bar!==state.bars-1)continue;if(!fillOnly&&((bar+1)%4!==0&&bar!==state.bars-1))continue;if(!fillOnly&&nextRandom()>amount)continue;
 var role=2;for(var r=3;r<=4;r++)if(source.some(function(e){return e.role===r;})&&nextRandom()<.5)role=r;
 var start=bar*4+3.5,count=fillOnly?3:2;for(var n=0;n<count;n++){var hit={id:++uid,role:role,slice:0,beat:start+n*.125,velocity:Math.round(82-n*15),pitch:0,reverse:false,locked:false,durationBeats:.075,chokeGroup:role+1};if(room(hit))out.push(hit);}}
 state.events=bounded(out);selected=-1;say(fillOnly?'Phrase-ending fill added. Kick/snare foundation and protected hits retained.':'New take from the base groove. Kick/snare foundation retained; detail changes do not accumulate.');
}
var structuredAction=action;action=function(id){if(id==='newRhythm'){structuredVariation(false);return;}if(id==='fill'){structuredVariation(true);return;}structuredAction(id);};
var baseChoicePaint=paint;paint=function(){baseChoicePaint();if(view!==0)return;rawDraw=true;button('useCurrentBase','Use current as base',410,14,200);rawDraw=false;};
var baseChoiceAction=action;action=function(id){if(id==='useCurrentBase'){stop();saveundo();state.original=copy(state.events);state.feelBase=copy(state.events);say('Current rhythm is the base for future variations. Undo restores the previous base.');return;}baseChoiceAction(id);};
// Correlated feel: repeatable offsets by musical position, with short phrase-ending disruption.
function grooveTreatment(kind){
 if(!state.events.length){say('Generate a beat first.');return;}stop();saveundo();var source=copy(state.original.length?state.original:state.events),out=state.events.filter(protectedHit).map(copy),amount=state.amount;
 function place(e){if(e.beat<0||e.beat>=beats()||locked(e.beat)||state.roleLocks[e.role])return;for(var j=0;j<out.length;j++)if(out[j].role===e.role&&Math.abs(out[j].beat-e.beat)<.035)return;out.push(e);}
 for(var i=0;i<source.length;i++){var e=copy(source[i]);if(protectedHit(e))continue;var original=e.beat,local=original%4,bar=Math.floor(original/4),ending=(bar+1)%4===0||bar===state.bars-1;
 if(kind==='pocket'){
  // Kick anchors remain fixed; snare lays back, offbeat hats swing consistently.
  if(e.role===1)e.beat+=.065*amount;
  if(e.role>=2){var off=Math.round(local*2)%2;e.beat+=(off?.18:-.015)*amount;e.velocity=Math.round(clamp(e.velocity*(off?1:1-.2*amount),20,127));}
 }else if(kind==='stumble'&&amount>0&&ending&&local>=2.5&&e.role>=2){
  // Drag the first detail, then catch up before the next downbeat.
  e.beat+=(local<3?.16:local<3.5?.09:.025)*amount;
  e.durationBeats=.08+(1-amount)*.12;
 }else if(kind==='glitch'&&amount>0&&ending&&local>=3&&e.role>=2){
  e.durationBeats=.04+(1-amount)*.08;e.chokeGroup=e.role+1;
 }
 if(locked(e.beat))e.beat=original;place(e);
 if(amount>0&&ending&&e.role>=2&&local>=3.5&&(kind==='glitch'||kind==='stumble')){
  var count=kind==='glitch'?2+Math.floor(amount*3):2;
  for(var n=1;n<count;n++){var hit=copy(e);hit.id=++uid;hit.beat=e.beat+(kind==='glitch'?.25*Math.pow(n/count,.7):n*.125);hit.velocity=Math.round(clamp(e.velocity*(1-.65*n/count),20,127));hit.durationBeats=kind==='glitch'?.035:.07;hit.chokeGroup=e.role+1;hit.pitch=kind==='glitch'?-n*2:0;place(hit);}
 }
 }
 state.events=bounded(out);selected=-1;say(kind==='pocket'?'Pocket: laid-back snare, swung hats and repeating accents. Kick anchors stay fixed.':kind==='stumble'?'Stumble: phrase-ending details drag and catch up; kick/snare anchors remain.':'Glitch fill: short pitched bursts and choked tails at phrase endings; foundation retained.');
}
var treatmentPaint=paint;paint=function(){treatmentPaint();if(view!==0)return;rawDraw=true;rect(0,207,1080,29,[.065,.08,.075,1]);button('treatpocket','Swing / laid-back',20,207,190);button('treatstumble','Stumble / recover',225,207,190);button('treatglitch','Glitch fill',430,207,160);text('Uses Change amount below. Each starts from your base.',610,226,11);rawDraw=false;};
var treatmentAction=action;action=function(id){if(id==='treatpocket'||id==='treatstumble'||id==='treatglitch'){grooveTreatment(id.slice(5));return;}treatmentAction(id);};
