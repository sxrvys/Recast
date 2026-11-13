// One visible area selection governs generation, damage and pocket, including empty cells.
var spaceCells=[],spaceGesture=null,followPlayhead=false,spaceSelectionRef=null;
function spaceActive(){return state.scope===2&&selection===spaceSelectionRef&&selection&&spaceCells.length>0;}
function spaceKey(role,cell){return role+':'+cell;}
function spaceContains(role,t){if(!spaceActive())return true;return spaceCells.indexOf(spaceKey(role,Math.floor((t+.00000001)*4)))>=0;}
function spaceChosen(role,col){return spaceActive()&&spaceCells.indexOf(spaceKey(role,state.page*16+col))>=0;}
function spaceSet(cells){spaceCells=cells.slice();if(!cells.length){selection=null;state.scope=0;workflowSelection=[];selected=-1;redraw();return;}var start=Infinity,end=0;for(var i=0;i<cells.length;i++){var cell=Number(cells[i].split(':')[1]);start=Math.min(start,cell/4);end=Math.max(end,(cell+1)/4);}selection=[start,end];spaceSelectionRef=selection;state.scope=2;workflowTarget=-1;state.damageTake=null;state.pocketTake=null;spaceSyncHits();redraw();}
function spaceSyncHits(){if(!spaceActive())return;workflowSelection=state.events.filter(function(e){return spaceContains(e.role,e.beat);}).map(function(e){return e.id;});selected=workflowSelection.length?state.events.map(function(e){return e.id;}).indexOf(workflowSelection[0]):-1;}
function spaceRectangle(a,b,base){var cells=(base||[]).slice();for(var r=Math.min(a.role,b.role);r<=Math.max(a.role,b.role);r++)for(var c=Math.min(a.cell,b.cell);c<=Math.max(a.cell,b.cell);c++){var k=spaceKey(r,c);if(cells.indexOf(k)<0)cells.push(k);}spaceSet(cells);}
function spaceBar(){var cells=[];for(var r=0;r<roles.length;r++)for(var c=0;c<16;c++)cells.push(spaceKey(r,state.page*16+c));spaceSet(cells);gridTool='edit';say('Bar '+(state.page+1)+' selected, including empty space. Generate, Damage and Pocket stay inside it.');}
function spaceSelectionHint(){return spaceActive()?spaceCells.length+' selected spaces / '+selectedEvents().length+' hits. Generate, Damage and Pocket affect only the cyan area.':gridTool==='move'?'Drag moves the selection. Option-drag copies. Cyan = ready; red = blocked.':'Select/edit: drag cells, including empty space. Cmd-click adds. Cyan = target.';}
var spaceEligible=workflowEligible;workflowEligible=function(e){return spaceEligible(e)&&spaceContains(e.role,e.beat);};
var spaceMovable=movable;movable=function(e){return spaceMovable(e)&&spaceContains(e.role,e.beat);};
var spaceCompose=composeRhythm,spaceExtra=composeExtra;
function spaceGenerate(fn,role){
 if(state.scope===2&&!selection){say('Select an area first, or choose Whole pattern.');return;}
 var before=copy(state.events),target=role>=0?role:workflowTarget;
 function affected(e){return inScope(e.beat)&&(target<0||e.role===target)&&spaceContains(e.role,e.beat);}
 fn(target);var generated=state.events;
 if(typeof addMusicalRolls==='function')generated=addMusicalRolls(generated,affected,target);
 var fixed=before.filter(function(e){return !affected(e)||protectedHit(e);}),ids=fixed.map(function(e){return e.id;});
 state.events=bounded(fixed.concat(generated.filter(function(e){return affected(e)&&ids.indexOf(e.id)<0;})));
 state.original=copy(state.events);state.feelBase=copy(state.events);state.damageTake=null;state.pocketTake=null;invalidateOptions();spaceSyncHits();
 if(state.scope!==0||target>=0)say('New '+(target>=0?roles[target]+' ':'')+'idea inside the chosen area. Outside notes and protected space are unchanged.');redraw();
}
composeRhythm=function(role){var target=role>=0?role:workflowTarget;spaceGenerate(target>=6?spaceExtra:spaceCompose,target);};
composeExtra=function(role){if(role<6){composeRhythm(role);return;}spaceGenerate(spaceExtra,role);};
var spaceSection=transformSection;transformSection=function(kind){spaceSection(kind);spaceSyncHits();};
var spaceMenu=visualMenuItems;visualMenuItems=function(){var rows=spaceMenu();if(visualMenu==='scope')rows.push({id:'visualScopeBar',label:'Current bar (all lanes)'});return rows;};
var spaceAction=action;action=function(id){if(id==='visualScopeBar'||id==='spaceBar'){visualMenu='';spaceBar();return;}if(id==='spaceClear'||id==='selectionClear'||id==='clearselection'){spaceCells=[];selection=null;state.scope=0;spaceGesture=null;spaceAction('selectionClear');redraw();return;}if(/^visualScope[012]$/.test(id)){spaceCells=[];if(id!=='visualScope2')selection=null;}if(id==='visualEditBar'){visualMenu='';spaceBar();return;}if(id==='spaceFollow'){followPlayhead=!followPlayhead;if(playing&&followPlayhead)state.page=Math.floor(currentBeat()/4);redraw();return;}if(id==='prevbar'||id==='nextbar')followPlayhead=false;spaceAction(id);};
var spaceClick=onclick;onclick=function(x,y,b,cmd,shift){
 if(view===0&&!visualMenu&&!styleMenuOpen){var cell=gridCell(x,y);
  if(cell&&shift){spaceCells=[];spaceGesture=null;spaceClick.apply(this,arguments);state.scope=2;redraw();return;}
  if(cell&&gridTool==='edit'){
   var point={role:cell.role,cell:state.page*16+cell.col},key=spaceKey(point.role,point.cell),base=cmd?spaceCells.slice():[];state.pad=cell.role;
   if(cmd&&base.indexOf(key)>=0){base.splice(base.indexOf(key),1);spaceSet(base);spaceGesture=null;return;}
   spaceGesture={start:point,base:base};spaceRectangle(point,point,base);return;
  }
  if(y>=286&&y<=305&&x>=620&&x<620+state.bars*27){state.page=Math.floor((x-620)/27);followPlayhead=false;redraw();return;}
 }
 spaceClick.apply(this,arguments);
};
var spaceDrag=ondrag;ondrag=function(x,y,b){if(spaceGesture){if(!b){spaceGesture=null;redraw();return;}var cell=moveGridCell(x,y);if(cell)spaceRectangle(spaceGesture.start,{role:cell.role,cell:state.page*16+cell.col},spaceGesture.base);return;}spaceDrag.apply(this,arguments);};
function spacePlayingBar(){return playing?Math.min(state.bars-1,Math.max(0,Math.floor(currentBeat()/4))):-1;}
var spacePaint=paint;paint=function(){
 if(view===0&&playing&&followPlayhead)state.page=spacePlayingBar();spacePaint();if(view!==0||visualMenu||styleMenuOpen)return;rawDraw=true;
 visualBaseRect(135,286,420,19,[.10,.115,.125,1]);var pb=spacePlayingBar();text((pb>=0?'Playing '+(pb+1)+' / '+state.bars:'Stopped')+' · Viewing '+(state.page+1)+' / '+state.bars,140,301,11,pb>=0?[.64,.85,.72,1]:[.65,.70,.73,1]);
 visualRound(445,286,108,18,followPlayhead?[.32,.38,.29,1]:[.20,.23,.26,1],3);text('Follow: '+(followPlayhead?'On':'Off'),451,299,10);buttons.push({id:'spaceFollow',x:445,y:286,w:108,h:18});
 if(pb>=0)visualBaseRect(620+pb*27,303,22,2,[.55,.85,.64,1]);
 if(spaceActive()&&!selectedEvents().length){text(spaceCells.length+' selected spaces · no existing hits. Generate will create material here.',20,742,13);button('spaceClear','Clear area',615,722,165);}
 rawDraw=false;
};
visualHints.spaceBar='Select the whole visible bar, including empty cells and all lanes. Generate, Damage and Pocket use this area.';
visualHints.visualScopeBar=visualHints.spaceBar;visualHints.spaceClear='Clear the area selection and return generation to the whole pattern.';
visualHints.spaceFollow='Follow switches the grid to the sounding bar. Browsing another bar turns Follow off; its notes keep playing.';
visualHints.tooledit='Click or drag to select grid space, including empty cells. Cmd-click adds/removes cells. Cyan shows the generation area.';
visualHints.compose='Generate a fresh rhythm inside the selected area, or across the pattern when no area is selected. Explicit protection remains.';
visualHints.targetScope='Choose Whole pattern, Final beat, a marked passage, or the current bar. Cyan cells show the active area.';

// Legacy fill/shaping also preserves the exact role-and-time mask, including destination boundaries.
var spaceShape=shapeRhythm;shapeRhythm=function(fill){var before=copy(state.events),active=spaceActive(),target=workflowTarget;if(!active&&target<0){spaceShape(fill);return;}function affected(e){return inScope(e.beat)&&spaceContains(e.role,e.beat)&&(target<0||e.role===target);}var fixed=before.filter(function(e){return !affected(e)||protectedHit(e);}),ids=fixed.map(function(e){return e.id;});spaceShape(fill);state.events=bounded(fixed.concat(state.events.filter(function(e){return affected(e)&&ids.indexOf(e.id)<0;})));spaceSyncHits();};
