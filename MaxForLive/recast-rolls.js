// Short, musically placed doubles and triplets are part of the foundation vocabulary.
function addMusicalRolls(input,eligible,target){
 var out=copy(input),density=state.detailDensity,family=state.rhythmFamily;
 for(var bar=0;bar<state.bars;bar++)for(var role=0;role<4;role++){
  if(target>=0&&role!==target)continue;
  var scale=family===12?1.25:family===7?.3:family===8?.6:1,chance=(role===1?.8:role===0?.48:.26)*(.3+.7*density)*scale;
  if(nextRandom()>chance)continue;
  var candidates=out.filter(function(e){return e.role===role&&e.beat>=bar*4&&e.beat<(bar+1)*4&&!e.rollId&&!protectedHit(e)&&eligible(e);});
  if(!candidates.length)continue;
  candidates.sort(function(a,b){return a.beat-b.beat;});var anchor=candidates[Math.floor(nextRandom()*candidates.length)],count=nextRandom()<.62?2:3,span=.5,spacing=span/count,before=role===1?nextRandom()<.75:nextRandom()<.5,start=anchor.beat-(before?(count-1)*spacing:0),times=[];
  if(start<bar*4-.000001||start+span>(bar+1)*4+.000001)continue;
  var valid=true;for(var n=0;n<count;n++){var at=start+n*spacing,probe={role:role,beat:at};times.push(at);if(!eligible(probe)||locked(at)||out.some(function(e){return e.role===role&&e.id!==anchor.id&&Math.abs(e.beat-at)<.075;}))valid=false;}
  if(!valid||out.length+count-1>1024)continue;
  var group='roll-'+(++uid),kind=count===3?'triplet':role===1?(before?'quiet → accent':'accent → quiet'):'double';
  anchor.rollId=group;anchor.rollCount=count;anchor.rollSpan=span;anchor.rollStart=start;anchor.rollKind=kind;
  for(var n=0;n<count;n++){if(Math.abs(times[n]-anchor.beat)<.000001)continue;var e=copy(anchor);e.id=++uid;e.beat=times[n];delete e.stepCell;e.foundation=false;e.velocity=Math.round(clamp(role===1?38+nextRandom()*20:anchor.velocity*(.5+nextRandom()*.25),20,105));e.durationBeats=spacing*.8;e.damageRepeat=true;out.push(e);}
 }
 return bounded(out);
}
function rollGroups(){var groups={},result=[];for(var i=0;i<state.events.length;i++){var e=state.events[i];if(e.rollId){if(!groups[e.rollId])groups[e.rollId]=[];groups[e.rollId].push(e);}}for(var k in groups){var a=groups[k].sort(function(x,y){return x.beat-y.beat;}),count=a[0].rollCount,span=a[0].rollSpan;if(a.length!==count)continue;var equal=true;for(var j=1;j<a.length;j++)if(Math.abs(a[j].beat-a[j-1].beat-span/count)>.00001)equal=false;result.push({hits:a,start:a[0].beat,end:a[0].beat+span,count:count,label:count===3&&equal?'3T':count+'×',equal:equal,role:a[0].role,span:span});}return result;}
function drawTimedStepHits(xx,yy,hits,col){
 var entries=hits.map(function(i){return state.events[i];}).sort(function(a,b){return a.beat-b.beat;}),cell=(state.page*16+col)/4;
 for(var h=0;h<entries.length;h++){var e=entries[h],fraction=clamp((e.beat-cell)*4,0,.999),left=xx+3+fraction*47,next=h+1<entries.length?clamp((entries[h+1].beat-cell)*4,0,1)*47:47,width=Math.max(2,Math.min(next-fraction*47-2,(e.durationBeats||.25)*188,47-fraction*47)),height=5+16*e.velocity/127;rect(left,yy+23-height,width,height,[.79,.55,.27,1]);if(e.reverse)text('←',left,yy+11,9);}
 if(entries.length>1){var label=entries.length+'×';if(entries.length===3&&Math.abs(entries[1].beat-entries[0].beat-1/12)<.00001&&Math.abs(entries[2].beat-entries[1].beat-1/12)<.00001)label='3T';text(label,xx+2,yy+9,8,[.68,.86,.92,1]);}
}
var rollPaint=paint;paint=function(){rollPaint();if(view!==0||visualMenu||styleMenuOpen)return;rawDraw=true;var groups=rollGroups();for(var i=0;i<groups.length;i++){var g=groups[i];if(g.role<workflowBank*6||g.role>=workflowBank*6+6||g.start<state.page*4||g.start>=(state.page+1)*4)continue;var x=140+(g.start-state.page*4)*224,y=355+(g.role-workflowBank*6)*32,w=Math.min(1036-x,g.span*224);visualBaseRect(x,y+26,w,1,[.45,.78,.87,1]);text(g.label,x+2,y+8,8,[.68,.86,.92,1]);}rawDraw=false;};
var rollIdle=onidle;onidle=function(x,y){rollIdle.apply(this,arguments);if(view!==0||visualMenu||styleMenuOpen)return;var cell=gridCell(x,y);if(!cell)return;var hits=stepHits(cell.role,cell.col).map(function(i){return state.events[i];}),g=rollGroups().filter(function(g){return g.role===cell.role&&g.start<(state.page*16+cell.col+1)/4&&g.end>(state.page*16+cell.col)/4;})[0];if(g){visualHints.rollInfo=g.count+' hits over '+g.span+' beat'+(g.span===1?'':'s')+(g.equal&&g.count===3?' · evenly spaced triplet.':' · '+g.hits[0].rollKind+'.')+' Bars show their actual timing; height shows velocity.';visualHover='rollInfo';mgraphics.redraw();}};
