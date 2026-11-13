// Episode-based disruption. Generated results are fixed notes, not playback randomness.
var damageDefaults=defaults,damageSnapshot=musicalSnapshot,damageSection=transformSection;
var damagePaint=paint,damageAction=action,damageClick=onclick,damageDrag=ondrag;
var damageKinds=['stumble','missing','ratchet','interrupt','displace','breakdown'];
var damageLabels=['Stumble / recover','Missing footsteps','Uneven bursts','Choked interruptions','Displaced fragments','Breakdowns'];
var damageGesture=null,damageAdvanced=false;
defaults=function(n){
 n=damageDefaults(n);
 if(n.drunkenness===undefined)n.drunkenness=.45;
 if(n.detailBias===undefined)n.detailBias=.8;
 if(n.foundationProtection===undefined)n.foundationProtection=1;
 if(!n.damageBehaviors)n.damageBehaviors={stumble:.8,missing:.65,ratchet:.5,interrupt:.8,displace:.7,breakdown:.6};
 if(!n.lastDamagePlan)n.lastDamagePlan=[];
 return n;
};state=defaults(state);
musicalSnapshot=function(){var n=damageSnapshot();n.drunkenness=state.drunkenness;n.detailBias=state.detailBias;n.foundationProtection=state.foundationProtection;n.damageBehaviors=copy(state.damageBehaviors);n.lastDamagePlan=copy(state.lastDamagePlan);return n;};
function damageRoleWeight(e){
 if(!workflowEligible(e))return 0;
 var weight=workflowTarget>=0?1:e.role<2?1-.8*state.detailBias:.7+.3*state.detailBias;
 if(e.foundation)weight*=1-state.foundationProtection;
 return clamp(weight,0,1);
}
function damageChooseKind(){
 var total=0;for(var i=0;i<damageKinds.length;i++)total+=Math.max(0,state.damageBehaviors[damageKinds[i]]||0);
 if(total<=0||state.damage<=0)return null;
 var value=nextRandom()*total;
 for(var i=0;i<damageKinds.length;i++){value-=Math.max(0,state.damageBehaviors[damageKinds[i]]||0);if(value<=0&&state.damageBehaviors[damageKinds[i]]>0)return damageKinds[i];}
 return null;
}
function damagePickHit(hits){
 var total=0;for(var i=0;i<hits.length;i++)total+=damageRoleWeight(hits[i]);
 if(total<=0)return null;
 var value=nextRandom()*total;for(var i=0;i<hits.length;i++){value-=damageRoleWeight(hits[i]);if(value<=0)return hits[i];}return hits[hits.length-1];
}
function damageMakePlan(source){
 var plan=[],eligible=source.filter(function(e){return damageRoleWeight(e)>0;}),d=state.damage,drunk=state.drunkenness;
 if(!eligible.length||d<=0&&drunk<=0)return plan;
 for(var bar=0;bar<state.bars;bar++){
  var hits=eligible.filter(function(e){return e.beat>=bar*4&&e.beat<(bar+1)*4;});
  if(!hits.length||nextRandom()>.65+.3*Math.max(d,drunk))continue;
  var count=1+Math.floor(nextRandom()*(1+Math.max(d,drunk)*2));
  for(var k=0;k<count;k++){
   var anchor=damagePickHit(hits),kind=damageChooseKind(),longKind=kind==='stumble'||kind==='displace'||kind==='breakdown',length=longKind?[1,2,3.5][Math.min(2,Math.floor(nextRandom()*(1+Math.max(d,drunk)*2.99)))]:[.5,1,2][Math.floor(nextRandom()*3)];
   if(!kind&&drunk<=0)continue;
   var start=Math.max(bar*4,Math.min((bar+1)*4-length,Math.floor(anchor.beat*2)/2)),end=Math.min((bar+1)*4,start+length);
   // Scope and locks are also checked per note/destination; this only describes the episode.
   plan.push({start:start,end:end,kind:kind||'drift',anchor:anchor.id,sign:nextRandom()<.25?-1:1,curve:.4+nextRandom()*2.2,span:[.125,.25,.5][Math.floor(nextRandom()*3)],shift:(nextRandom()<.5?-1:1)*[.25,.5,.75][Math.floor(nextRandom()*3)],mode:Math.floor(nextRandom()*2)});
  }
 }
 if(!plan.length){var e=damagePickHit(eligible),kind=damageChooseKind();if(e&&(kind||drunk>0))plan.push({start:Math.floor(e.beat),end:Math.min(beats(),Math.floor(e.beat)+1),kind:kind||'drift',anchor:e.id,sign:1,curve:1.6,span:.25,shift:.25,mode:0});}
 return plan;
}
function damageEpisode(e,plan){
 var chosen=null;for(var i=0;i<plan.length;i++)if(e.beat>=plan[i].start&&e.beat<plan[i].end)chosen=plan[i];return chosen;
}
function generateDamageEvents(source){
 var plan=damageMakePlan(source),out=[],additions=0,counts={},baseCounts={},d=state.damage,drunk=state.drunkenness;
 function key(e){return e.role+':'+Math.floor((e.beat+.000001)*4);}
 for(var i=0;i<source.length;i++){var k=key(source[i]);baseCounts[k]=(baseCounts[k]||0)+1;}
 function destination(t,episode){return t>=0&&t<beats()&&inScope(t)&&!locked(t)&&(!episode||t>=episode.start&&t<episode.end);}
 function put(e,added){
  if(added){if(additions>=Math.max(0,1024-source.length))return false;var k=key(e);if((counts[k]||0)+(baseCounts[k]||0)>=4)return false;additions++;}
  var k=key(e);counts[k]=(counts[k]||0)+1;out.push(e);return true;
 }
 function move(e,t,episode){if(destination(t,episode)){e.beat=t;delete e.stepCell;return true;}return false;}
 function mark(e,kind,origin){e.damageKind=kind;e.damageOriginId=origin.id;e.damageOriginBeat=origin.beat;}
 function repeat(e,episode,amount,minimum){
  if(e.damageRepeat)return;
  var count=minimum||2+Math.floor(nextRandom()*(1+4*amount));
  for(var n=1;n<count;n++){
   var h=copy(e),at=e.beat+episode.span*Math.pow(n/count,episode.curve);
   if(!destination(at,episode))continue;
   h.id=++uid;h.beat=at;delete h.stepCell;h.damageRepeat=true;h.damageKind=episode.kind;
   h.velocity=Math.round(clamp(e.velocity*(episode.mode?.55+.4*n/count:1-.7*n/count),12,127));
   h.pitch=clamp((e.pitch||0)+(episode.mode?1:-1)*n*(amount>.7?2:1),-36,36);
   h.durationBeats=.02+(1-state.gateDepth)*.06;h.chokeGroup=e.role+1;put(h,true);
  }
 }
 for(var i=0;i<source.length;i++){
  var original=source[i],e=copy(original),weight=damageRoleWeight(e),episode=damageEpisode(e,plan);
  if(!episode||weight<=0){put(e,false);continue;}
  var phase=clamp((original.beat-episode.start)/Math.max(.125,episode.end-episode.start),0,1),forced=episode.anchor===e.id;
  var structural=d>0&&episode.kind!=='drift'&&(forced||nextRandom()<(.3+.7*d)*weight),timing=drunk>0&&(forced||nextRandom()<(.4+.6*drunk)*weight);
  if(timing){
   // A shared drag arc catches up toward the episode end; small residual jitter avoids a rigid swing template.
   var arc=Math.sin(phase*Math.PI),offset=episode.sign*(.035+.28*drunk)*arc*drunk*weight;
   if(episode.kind==='stumble'&&phase>.62)offset=-.13*drunk*weight*(1-phase);
   offset+=(nextRandom()-.5)*.06*drunk*weight;
   if(forced&&Math.abs(offset)<.004)offset=.025*drunk*weight;
   if(move(e,e.beat+offset,episode))mark(e,episode.kind,original);
   e.velocity=Math.round(clamp(e.velocity*(1+Math.sin(phase*2*Math.PI)*drunk*.18*weight),1,127));
  }
  if(!structural){put(e,false);continue;}
  mark(e,episode.kind,original);
  if(episode.kind==='missing'){
   // A displaced, quieter answer makes absence audible instead of merely adding another hit.
   if(forced||nextRandom()<.35+.45*d){
    var h=copy(e),at=original.beat+.125+nextRandom()*(.125+.25*d);
    if(destination(at,episode)){h.id=++uid;h.beat=at;delete h.stepCell;h.damageRepeat=true;h.velocity=Math.round(clamp(e.velocity*.65,12,110));h.durationBeats=.06+(1-state.gateDepth)*.13;h.chokeGroup=e.role+1;put(h,false);}
    continue;
   }
  }else if(episode.kind==='ratchet'){
   e.durationBeats=.025+(1-state.gateDepth)*.10;e.chokeGroup=e.role+1;
   put(e,false);repeat(e,episode,d*weight);continue;
  }else if(episode.kind==='interrupt'){
   var next=episode.end;
   for(var j=0;j<source.length;j++)if(source[j].beat>original.beat&&source[j].beat<next&&damageRoleWeight(source[j])>0)next=source[j].beat;
   if(episode.mode&&phase<.55){
    e.durationBeats=Math.max(.02,Math.min(next-e.beat,.5+1.5*d));
    if(e.role>=2){e.art=e.art||articulation();e.art.sustain=Math.min(2,e.durationBeats);}
   }else e.durationBeats=.025+(1-state.gateDepth)*.16;
   e.chokeGroup=e.role+1;
  }else if(episode.kind==='displace'){
   // The same displacement carries a fragment's internal relationships with it.
   move(e,original.beat+episode.shift*(.4+.6*d),episode);
   e.velocity=Math.round(clamp(e.velocity*(episode.sign<0?.8:1.08),1,127));
  }else if(episode.kind==='breakdown'){
   if(phase<.65&&(forced||nextRandom()<(.3+.5*d)*weight))continue;
   e.durationBeats=.03+(1-state.gateDepth)*.12;e.chokeGroup=e.role+1;
   if(e.role>=2&&phase>=.65&&!e.damageRepeat){put(e,false);repeat(e,episode,d*weight,2+Math.floor(d*2));continue;}
  }else if(episode.kind==='stumble'){
   // Contrast a short stagger with an occasional held response. It is not another ratchet preset.
   e.durationBeats=phase<.55?.06+(1-state.gateDepth)*.14:Math.min(.25+.5*d,Math.max(.03,episode.end-e.beat));
   if(e.role>=2&&phase>.65&&nextRandom()<d*.35&&!e.damageRepeat){var h=copy(e);h.id=++uid;h.beat+=.125+.125*nextRandom();h.damageRepeat=true;h.velocity=Math.round(e.velocity*.55);if(destination(h.beat,episode))put(h,true);}
  }
  if(nextRandom()<d*weight*state.reverseChance)e.reverse=!e.reverse;
  put(e,false);
 }
 if(!out.length&&source.length)out.push(copy(source[0]));
 return {events:bounded(out),plan:plan};
}
function applyEpisodeDamage(){
 if(!state.events.length){say('Generate or program a groove first.');return;}
 if(state.scope===2&&!selection){say('Select a passage first, or choose Pattern scope.');return;}
 stop();saveundo();var context=JSON.stringify([state.bars,workflowTarget,state.scope,selection,state.ranges,state.roleLocks]),take=state.damageTake;
 var source=copy(take&&take.context===context&&take.result===JSON.stringify(state.events)?take.base:state.events),result=generateDamageEvents(source);
 state.events=result.events;state.lastDamagePlan=result.plan;
 state.damageTake={base:source,result:JSON.stringify(state.events),context:context};workflowSelection=[];selected=-1;
 var names=[],seen={};for(var i=0;i<result.plan.length;i++){var name=result.plan[i].kind;if(!seen[name]){seen[name]=true;names.push(name);}}
 say(names.length?'New take: '+names.join(' + ')+'. Click again to reroll; locked hits and gaps remain.':'No eligible disruption: check intensity, target and protection.');
}
transformSection=function(kind){if(kind==='damage'){applyEpisodeDamage();return;}damageSection(kind);};
var damageBuildOptions=buildOptions;buildOptions=function(){var saved=copy(state.lastDamagePlan);damageBuildOptions();state.lastDamagePlan=saved;};
function damageSliders(){
 var controls=[{field:'drunkenness',label:'Drunkenness · timing',x:20,y:205},{field:'damage',label:'Glitch · disruption',x:565,y:205},{field:'detailBias',label:'Favor hats, percussion and textures',x:20,y:300},{field:'foundationProtection',label:'Protect kick / snare anchors',x:565,y:300}];
 if(damageAdvanced){controls.push({field:'gateDepth',label:'Gate tightness',x:565,y:385});for(var i=0;i<6;i++)controls.push({behavior:damageKinds[i],label:damageLabels[i],x:20+i%2*545,y:470+Math.floor(i/2)*80});}
 return controls;
}
function damageControlAt(x,y){var controls=damageSliders();for(var i=0;i<controls.length;i++){var c=controls[i];if(x>=c.x&&x<=c.x+480&&y>=c.y+20&&y<=c.y+52)return c;}return null;}
function damageControlValue(c){return c.behavior?state.damageBehaviors[c.behavior]:state[c.field];}
function setDamageControl(c,x){var value=Math.round(clamp((x-c.x)/480,0,1)*100)/100;if(c.behavior)state.damageBehaviors[c.behavior]=value;else state[c.field]=value;invalidateOptions();redraw();}
paint=function(){
 if(view!==25){damagePaint();return;}
 buttons=[];rawDraw=true;simpleDrops();var f=this.patcher.getnamed('instrumentTempo');if(f)f.hidden=1;f=this.patcher.getnamed('librarySearch');if(f)f.hidden=1;
 rect(0,0,1080,880,[.08,.09,.1,1]);text('GLITCH / DRUNKENNESS',20,42,25);button('view0','Back to pattern',840,14,220);
 text('Drunkenness bends timing. Glitch breaks the rhythm. Each click generates a fixed, editable take.',20,100,13);
 button('applyDamage','Generate damage take',20,135,265,true);button('play',playing||preparing?'Stop':'Play',300,135,150);button('damageReset','Reset defaults',465,135,190);
 var controls=damageSliders();for(var i=0;i<controls.length;i++){var c=controls[i],v=damageControlValue(c);text(c.label,c.x,c.y+15,14);rect(c.x,c.y+34,480,5,[.25,.28,.31,1]);rect(c.x,c.y+34,480*v,5,[.83,.60,.31,1]);text(Math.round(v*100)+'%',c.x+435,c.y+15,12);}
 button('damageAdvanced',damageAdvanced?'Less control ▴':'Behavior mix / gate tightness ▾',20,390,420,damageAdvanced);
 if(!damageAdvanced){text('Automatic mix: stumbles, gaps, uneven bursts, interruptions, displaced fragments and breakdowns.',20,490,13);text('Use the mix controls only when you want to favor or disable particular behaviors.',20,525,13);}
 text('Explicitly locked hits and protected silence are always respected, even at maximum intensity.',20,750,12);
 text('Target: '+(workflowTarget<0?'All lanes':roles[workflowTarget])+'. Scope: '+['Pattern','Last beat','Selected passage'][state.scope]+'.',20,785,12);
 text(status.slice(0,145),20,856,11);rawDraw=false;
};
action=function(id){if(id==='damageAdvanced'){damageAdvanced=!damageAdvanced;redraw();return;}if(id==='damageSettings'){view=25;redraw();return;}if(id==='damageReset'){saveundo();state.drunkenness=.45;state.damage=.35;state.detailBias=.8;state.foundationProtection=1;state.damageBehaviors={stumble:.8,missing:.65,ratchet:.5,interrupt:.8,displace:.7,breakdown:.6};invalidateOptions();redraw();return;}damageAction(id);};
onclick=function(x,y,b){if(view!==25){damageClick.apply(this,arguments);return;}var c=damageControlAt(x,y);if(c){saveundo();damageGesture=c;setDamageControl(c,x);return;}workflowButtons(x,y);};
ondrag=function(x,y,b){if(view===25&&damageGesture){if(b)setDamageControl(damageGesture,x);else damageGesture=null;return;}damageDrag.apply(this,arguments);};
