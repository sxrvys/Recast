// Independent rhythmic resolution, phrase rotation, attack choices and pitch rerolls.
function collageRotatePhrase(delta){stop();saveundo();var c=state.collage;
    function rotate(list){return list.map(function(original){var e=copy(original);if(!collageEligible(e))return e;var dest=((e.beat+delta)%beats()+beats())%beats();if(locked(dest)||!inScope(dest)||!spaceContains(e.role,dest))return e;var shift=dest-e.beat;e.beat=dest;delete e.stepCell;if(e.performanceRegions)for(var i=0;i<e.performanceRegions.length;i++){e.performanceRegions[i].start+=shift;e.performanceRegions[i].end+=shift;}return e;}).sort(function(a,b){return a.beat-b.beat;});}
    state.events=rotate(state.events);c.base=rotate(c.base||[]);state.original=rotate(state.original||[]);state.feelBase=rotate(state.feelBase||[]);c.phraseOffset=(((c.phraseOffset||0)+delta)%beats()+beats())%beats();c.lastResult=JSON.stringify(state.events);invalidateOptions();say('Phrase rotated '+delta+' beat(s). Protected hits and protected destinations remain fixed.');
}
var collagePlacementSliders=collageSliders;collageSliders=function(){var rows=collagePlacementSliders();if(view!==27)return rows;
    if(collageSection==='cut')return rows.concat([{field:'attackBias',label:'Prefer detected attacks',x:585,y:430,min:0,max:1},{field:'attackSensitivity',label:'Attack detection sensitivity',x:585,y:540,min:0,max:1}]);
    if(collageSection==='rhythm')return rows.concat([{field:'timingJitter',label:'Off-grid timing movement',x:585,y:520,min:0,max:1}]);
    if(collageSection==='pitch')return rows.concat([{field:'pitchMotion',label:'Pitch-motion range',x:30,y:480,min:0,max:1}]);return rows;
};
var collagePlacementValue=collageControlValue;collageControlValue=function(s){var c=state.collage;if((s.field==='attackBias'||s.field==='attackSensitivity')&&c[s.field]===undefined)return .65;if((s.field==='timingJitter'||s.field==='pitchMotion')&&c[s.field]===undefined)return c.movement;return collagePlacementValue(s);};
var collagePlacementSet=collageSetControl;collageSetControl=function(s,x){collagePlacementSet(s,x);if(s.field==='attackBias'||s.field==='attackSensitivity'){for(var r=0;r<roles.length;r++)if(!collageLane(r).locked)collageLane(r).dirty=true;}};
var collagePlacementMenu=collageMenuItems;collageMenuItems=function(){if(collageMenu==='resolution')return [[2,'1/8'],[4,'1/16'],[8,'1/32'],[3,'1/8 triplets'],[6,'1/16 triplets']].map(function(a){return {id:'collageResolution:'+a[0],label:a[1]};});return collagePlacementMenu();};
var collagePlacementDrawMenu=collageDrawMenu;collageDrawMenu=function(){if(collageMenu!=='resolution'){collagePlacementDrawMenu();return;}var rows=collageMenuItems();rect(582,451,396,rows.length*31+8,[.055,.07,.08,1]);buttons=buttons.filter(function(b){return !(b.x<975&&b.x+b.w>585&&b.y<455+rows.length*31&&b.y+b.h>451);});for(var i=0;i<rows.length;i++)button(rows[i].id,rows[i].label,585,455+i*31,390);};
var collagePlacementPaint=paint;paint=function(){collagePlacementPaint();if(view!==27||collageMenu)return;rawDraw=true;
    if(collageSection==='rhythm'){var labels={2:'1/8',4:'1/16',8:'1/32',3:'1/8 triplets',6:'1/16 triplets'};button('collageResolution','Timing grid: '+labels[state.collage.resolution||4]+' ▾',585,410,390);}
    if(collageSection==='pitch')button('collagePitchReroll','Reroll pitch only',585,565,390,true);
    if(collageSection==='structure'){button('collagePhaseBack','Rotate −1 step',30,650,185);button('collagePhaseForward','Rotate +1 step',230,650,190);text('Phrase offset: '+((state.collage.phraseOffset||0).toFixed(3))+' beats',30,730,13);}
    rawDraw=false;
};
var collagePlacementAction=action;action=function(id){if(id==='collagePhaseBack'||id==='collagePhaseForward'){collageRotatePhrase((id==='collagePhaseBack'?-1:1)/(state.collage.resolution||4));return;}if(id==='collagePitchReroll'){collageGenerate('pitch');return;}if(id==='collageResolution'){collageMenu=collageMenu==='resolution'?'':'resolution';redraw();return;}if(/^collageResolution:/.test(id)){stop();saveundo();state.collage.resolution=Number(id.split(':')[1]);collageMenu='';redraw();say('Grid selected. New rhythm generates on that subdivision; current events stay put.');return;}collagePlacementAction(id);};

// Export takes own frozen settings. Keep editing and memory actions out of its preparation pass.
var collageExportGuardAction=action,collageExportGuardClick=onclick,collageExportGuardDrag=ondrag;
action=function(id){if(collageExportJob&&id!=='play'&&id!=='collagePlay'){say('Export is running. Press Stop to cancel before editing.');return;}collageExportGuardAction(id);};
onclick=function(x,y){if(collageExportJob){var stopButton=buttons.filter(function(b){return b.id==='collagePlay'&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;})[0];if(stopButton)stop();else say('Export is running. Stop cancels it.');return;}collageExportGuardClick.apply(this,arguments);};
ondrag=function(){if(collageExportJob)return;collageExportGuardDrag.apply(this,arguments);};
