// Authored rhythmic grammars, not additional transcriptions from the reference books.
// Original three family indices remain stable for saved sessions.
var grammarStyles=[
 {name:'Straight backbeat',hint:'Firm 2 / 4; steady hats and kick answers.',core:[0,8],choices:[2,6,10,14],extras:[0,2],snare:[4,12],hats:'eighth',ghost:.25,fill:.35},
 {name:'Four to the floor',hint:'Four kick pulses; offbeat hat lift.',core:[0,4,8,12],choices:[7,14,15],extras:[0,1],snare:[4,12],hats:'offbeat',ghost:.12,fill:.25},
 {name:'Electro breaks',hint:'Angular kicks; clipped hats and backbeats.',core:[0],choices:[3,6,7,10,11,14],extras:[2,4],snare:[4,12],hats:'electro',ghost:.35,fill:.55},
 {name:'Two-step',hint:'Skipped kicks; syncopation around 2 / 4.',core:[0],choices:[3,6,7,10,11,14,15],extras:[1,3],snare:[4,12],hats:'skip',ghost:.3,fill:.5},
 {name:'Dub space',hint:'Beat-three weight, sparse hats and air.',core:[8],choices:[0,6,14],extras:[0,1],snare:[8],hats:'sparse',ghost:.08,fill:.15},
 {name:'Slow crush',hint:'Heavy downbeat; slow snare and wide gaps.',core:[0],choices:[6,10,14],extras:[0,2],snare:[8],hats:'quarter',ghost:.12,fill:.3},
 {name:'Motor pulse',hint:'Steady quarter kicks; continuous hat motion.',core:[0,4,8,12],choices:[6,14],extras:[0,1],snare:[4,12],hats:'motor',ghost:.15,fill:.3},
 {name:'Tresillo',hint:'Recurring 3 + 3 + 2 eighth-note kick cycle.',core:[0,6,12],choices:[3,10,14,15],extras:[0,2],snare:[4,12],hats:'clave',ghost:.25,fill:.4},
 {name:'Shuffle',hint:'Long / short hats; backbeat and ghost pickups.',core:[0,8],choices:[2,6,10,14],extras:[0,2],snare:[4,12],hats:'shuffle',ghost:.55,fill:.5,shuffle:true},
 {name:'Breakbeat',hint:'Syncopated kicks, snare ghosts and hat accents.',core:[0],choices:[2,3,6,7,9,10,11,14,15],extras:[2,4],snare:[4,12],hats:'break',ghost:.85,fill:.8}
];
for(var grammarI=0;grammarI<grammarStyles.length;grammarI++)rhythmVocabulary.push({name:grammarStyles[grammarI].name,grammar:grammarStyles[grammarI],snare:[grammarStyles[grammarI].snare,grammarStyles[grammarI].snare]});
var vocabularyDefaults=defaults;defaults=function(n){n=vocabularyDefaults(n);var f=Number(n.rhythmFamily);n.rhythmFamily=isFinite(f)&&f>=0&&f<rhythmVocabulary.length?Math.floor(f):0;return n;};state=defaults(state);
var grammarHints=['Syncopated kick motifs; snare on 2 / 4.','Snare on beat 3; a slower foundation.','Driving kick placement; snare on 2 / 4.'];
function grammarHint(index){var v=rhythmVocabulary[index];return v&&v.grammar?v.grammar.hint:grammarHints[index]||'';}
function grammarStepWeights(g){var w=[];for(var i=0;i<16;i++)w.push(g.choices.indexOf(i)>=0?(i%2?.65:1):0);return w;}
function grammarMotif(g){var steps=g.core.slice(),weights=grammarStepWeights(g),n=g.extras[0]+Math.floor(nextRandom()*(1+Math.round((g.extras[1]-g.extras[0])*state.detailDensity)));for(var i=0;i<n;i++){var st=rhythmWeightedStep(weights,steps,g.snare);if(st>=0)steps.push(st);}return steps.sort(function(a,b){return a-b;});}
function grammarAnswer(g,motif){var a=motif.slice(),optional=a.filter(function(st){return g.core.indexOf(st)<0;});if(optional.length){var remove=optional[Math.floor(nextRandom()*optional.length)];a.splice(a.indexOf(remove),1);}var st=rhythmWeightedStep(grammarStepWeights(g),a,g.snare);if(st>=0&&nextRandom()<.55+.4*state.detailDensity)a.push(st);return a.sort(function(a,b){return a-b;});}
function grammarHats(g,mode){
 var out=[],d=state.detailDensity;
 for(var s=0;s<16;s++){
  var on=false;
  if(g.hats==='eighth')on=s%2===0||mode>1&&s%4===3&&nextRandom()<d*.5;
  else if(g.hats==='offbeat')on=s%4===2||mode>1&&s%4===0&&nextRandom()<d*.5;
  else if(g.hats==='electro')on=s%4===2||s%4===3&&nextRandom()<.3+d*.5||mode%2===0&&s%4===0;
  else if(g.hats==='skip')on=s%4===2||s%4===3&&nextRandom()<.2+d*.55||s%4===0&&nextRandom()<.25;
  else if(g.hats==='sparse')on=s%4===2&&(s===2||nextRandom()<.3+d*.3);
  else if(g.hats==='quarter')on=s%4===0||mode>1&&s%4===2&&nextRandom()<d*.35;
  else if(g.hats==='motor')on=s%2===0||mode>1&&nextRandom()<d*.65;
  else if(g.hats==='clave')on=s%2===0||[3,9,15].indexOf(s)>=0&&mode>0&&nextRandom()<d*.6;
  else if(g.hats==='shuffle')on=s%2===0;
  else if(g.hats==='break')on=s%2===0||s%4===3&&nextRandom()<.25+d*.55||s%4===1&&mode>1&&nextRandom()<d*.35;
  if(on)out.push(s);
 }return out;
}
var grammarCompose=composeRhythm;
composeRhythm=function(roleOnly){
 var index=Math.round(Number(state.rhythmFamily));if(!isFinite(index)||index<0||index>=rhythmVocabulary.length){state.rhythmFamily=0;index=0;}
 var g=rhythmVocabulary[index].grammar;if(!g){grammarCompose(roleOnly);return;}
 stop();saveundo();var previous=copy(state.events),out=previous.filter(function(e){return protectedHit(e)||(roleOnly>=0&&e.role!==roleOnly)||roleOnly<0&&e.role>=6;});
 var active=roleOnly>=0?[roleOnly]:[0,1,2],motif=grammarMotif(g),answer=grammarAnswer(g,motif),mode=Math.floor(nextRandom()*4),hats=grammarHats(g,mode),swing=g.shuffle?.12+nextRandom()*.07:0;
 function position(st){return st+ (g.shuffle&&Math.round(st)%4===2?swing*4:0);}
 function add(r,st,bar,vel,anchor,gate){var beat=bar*4+position(st)/4;if(beat<0||beat>=beats()||state.roleLocks[r]||locked(beat))return;for(var j=0;j<out.length;j++)if(out[j].role===r&&Math.abs(out[j].beat-beat)<.028)return;var e={id:++uid,role:r,beat:beat,velocity:Math.round(clamp(vel,1,127)),slice:0,pitch:0,reverse:false,locked:false,foundation:!!anchor};if(gate)e.durationBeats=gate;out.push(e);}
 for(var b=0;b<state.bars;b++){
  // Keep a two-bar identity. Later bars answer it; phrase endings add a restrained pickup.
  var response=b%2===1,ending=(b+1)%4===0,ks=response?answer:motif;
  for(var ai=0;ai<active.length;ai++){
   var r=active[ai];
   if(r===0){for(var k=0;k<ks.length;k++)add(r,ks[k],b,g.core.indexOf(ks[k])>=0?112:80+nextRandom()*23,g.core.indexOf(ks[k])>=0);}
   else if(r===1){for(var n=0;n<g.snare.length;n++)add(r,g.snare[n],b,108+nextRandom()*10,true);
    var ghosts=g.shuffle?[2,6,10,14]:[3,7,10,11,15];for(var j=0;j<ghosts.length;j++){var st=ghosts[j];if(g.snare.indexOf(st)>=0)continue;var kickNear=ks.some(function(k){return Math.abs(k-st)<=1;});if(nextRandom()<g.ghost*state.detailDensity*(response?1.15:.8)*(kickNear?.45:1))add(r,st,b,35+nextRandom()*23,false,.12);}
   }else if(r===2){for(var h=0;h<hats.length;h++){var st=hats[h];if(ending&&st>=14&&mode===3)continue;var accent=g.hats==='offbeat'||g.hats==='skip'?st%4===2:st%4===0,vel=accent?78+nextRandom()*12:st%2?43+nextRandom()*15:58+nextRandom()*14;add(r,st,b,vel,false,g.hats==='break'||g.hats==='electro'?.16:undefined);}}
   else if(r===3){for(var st=0;st<16;st++)if(euclideanHit(st,3+Math.round(state.detailDensity*3),16,response?3:0)&&ks.indexOf(st)<0&&g.snare.indexOf(st)<0)add(r,st,b,52+nextRandom()*25,false,.2);}
   else if(r===4){add(r,response?13:5,b,62+nextRandom()*12,false,response?.75:.25);}
   else if(r===5){for(var k=0;k<ks.length;k++)if(g.core.indexOf(ks[k])>=0||response&&k===1)add(r,ks[k],b,k?75:96,k===0,.5);}
   if(ending&&r===1&&nextRandom()<state.detailDensity*g.fill){var pickup=g.shuffle?14:15;if(g.snare.indexOf(pickup)<0)add(r,pickup,b,50+nextRandom()*20,false,.12);}
  }
 }
 state.events=bounded(out);state.damageTake=null;state.pocketTake=null;state.slices=state.slices.length?state.slices:[[0,.1]];state.mode=0;state.original=copy(state.events);state.feelBase=copy(state.events);state.family=[];state.options=[];workflowSelection=[];selected=-1;gridTool='edit';state.grooveInput='generated';state.grooveName=rhythmVocabulary[index].name;say('New '+state.grooveName+' motif, answer and accents. '+grammarHint(index));
};
// One dropdown, with a visible musical description for each family.
function drawRhythmStyleMenu(){
 var x=185,y=98,w=650,height=rhythmVocabulary.length*34+8;rect(x,y,w,height,[.10,.12,.14,1]);buttons=buttons.filter(function(b){return !(b.x<x+w&&b.x+b.w>x&&b.y<y+height&&b.y+b.h>y);});
 for(var i=0;i<rhythmVocabulary.length;i++){var yy=y+4+i*34;button('chooseStyle'+i,(i===state.rhythmFamily?'✓ ':'')+rhythmVocabulary[i].name,x+4,yy,w-8,i===state.rhythmFamily);text(grammarHint(i),x+245,yy+19,11,[.71,.75,.78,1]);}
}
var grammarAction=action;action=function(id){if(/^chooseStyle\d+$/.test(id)){var n=Number(id.slice(11));if(n>=0&&n<rhythmVocabulary.length){state.rhythmFamily=n;styleMenuOpen=false;say(rhythmVocabulary[n].name+': '+grammarHint(n)+' Click Generate when ready.');}return;}grammarAction(id);};
var grammarClick=onclick;onclick=function(x,y,b,cmd,shift){if(view===0&&styleMenuOpen){var chosen=null;for(var i=buttons.length-1;i>=0;i--){var a=buttons[i];if(a.id.indexOf('chooseStyle')===0&&x>=a.x&&x<a.x+a.w&&y>=a.y&&y<a.y+a.h){chosen=a.id;break;}}if(chosen)action(chosen);else{styleMenuOpen=false;redraw();}return;}grammarClick.apply(this,arguments);};
visualHints.familyCycle='Choose the musical foundation for the next Generate click. Current notes and sound assignments stay unchanged.';
var grammarIdle=onidle;onidle=function(x,y){grammarIdle.apply(this,arguments);if(/^chooseStyle\d+$/.test(visualHover))visualHints[visualHover]=grammarHint(Number(visualHover.slice(11)))+' Select, then Generate; glitch and drunkenness remain independent.';};

// Draw above grid overlays and waveform embellishments.
var grammarPaint=paint;paint=function(){grammarPaint();if(view===0&&styleMenuOpen){rawDraw=true;drawRhythmStyleMenu();rawDraw=false;}};
