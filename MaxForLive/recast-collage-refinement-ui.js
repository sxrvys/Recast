// Main decisions stay beside transport; detailed source editing is one click away.
var refineMenu='';
function refineScopeLabel(){var kind=state.collage.editScope||'pattern';return kind==='layer'?'Layer '+(collageSelectedLane+1):kind==='bar'?'Bar '+(state.page+1):kind==='selection'?'Selected passage':'Whole pattern';}
function refineButton(id,label,x,y,w,active){buttons=buttons.filter(function(b){return b.id!==id;});button(id,label,x,y,w,active);}
var refineUiPaint=paint;paint=function(){refineUiPaint();if(view===26&&!collageMenu){rawDraw=true;
    refineButton('collagePlay',playing||preparing||collageJob||refineJob||refineReady||collageLibraryPending||collageExportJob?'■ Stop':'▶ Play',20,65,100,true);
    refineButton('collagePhrase',refineJob?'Preparing…':'Generate',135,65,190,true);
    refineButton('collageCommit','Send audio to Live ▾',665,65,160);
    button('refineScope','Target: '+refineScopeLabel()+' ▾',635,155,290);
    if(state.collage.editScope==='bar'){button('refineBarPrev','‹',935,155,40);button('refineBarNext','›',985,155,40);}
    buttons=buttons.filter(function(b){return ['collageRhythm','collageCuts','collageOrder','collageDamage'].indexOf(b.id)<0;});
    rect(630,467,410,78,[.07,.085,.1,1]);
    button('collagePhrase',refineJob?'Preparing…':'Generate · apply all four controls',635,472,390,true);
    button('refineMore','More variations ▾',635,510,390);
    rect(635,600,415,14,[.07,.085,.1,1]);text(state.collage.controlsPending?'Settings changed · click Generate to hear them':'All four sliders shape the next Generate · sounds stay loaded',635,609,10,state.collage.controlsPending?[.95,.73,.42,1]:[.56,.67,.69,1]);
    rect(635,586,390,28,[.07,.085,.1,1]);button('refineCompare',refineCompareSide?'Hear previous':'Hear generated',635,586,185);button('refineFragments','Edit / audition fragments',835,586,190);
    rawDraw=false;
}
    if(view===27&&collageSection==='structure'&&!collageMenu){rawDraw=true;button('refinePhrasing','Phrase development: '+Math.round((state.collage.phraseDevelopment===undefined?.65:state.collage.phraseDevelopment)*100)+'% ▾',585,600,390);rawDraw=false;}
    if(view===27&&collageSection==='output'&&!collageMenu){rawDraw=true;button('refineSafeOutput','Safety ceiling: '+(collageDynamicsSettings().safeOutput?'On · −1 dB':'Off'),585,570,390,collageDynamicsSettings().safeOutput);rawDraw=false;}
    if(refineMenu){rawDraw=true;var rows=refineMenu.indexOf('sound:')===0?[['anything','Anything'],['impacts','Short impacts / sharp hits'],['machinery','Sustained machinery'],['voices','Voices / speech'],['drones','Low drones / bass'],['textures','Atmosphere / textures'],['drums','Drums / breaks']]:refineMenu==='send'?[['loop','Full loop → one audio track'],['stems','Layer stems → separate audio tracks'],['midi','Editable rendered-sound MIDI']]:refineMenu==='variations'?[['rhythm','Change rhythm only'],['cuts','Change fragments only'],['order','Shuffle fragments only'],['damage','Change damage only'],['protect','Keep selected passage (all layers)'],['release','Release passage locks']]:refineMenu==='scope'?[['pattern','Whole pattern'],['layer','Selected layer'],['bar','This bar'],['selection','Selected passage from Step editor']]:[[0,'Off · independent layers'],[.35,'Subtle recurring motifs'],[.65,'Motifs, replies and end fills'],[1,'Strong phrase development']];rect(245,205,600,rows.length*48+65,[.04,.055,.07,1]);buttons=[];text(refineMenu.indexOf('sound:')===0?'FIND MATERIAL FOR LAYER '+(Number(refineMenu.split(':')[1])+1):refineMenu==='send'?'SEND CURRENT TAKE TO LIVE':refineMenu==='variations'?'CHANGE JUST ONE PART':refineMenu==='scope'?'CHOOSE THE TARGET':'PHRASE DEVELOPMENT',265,235,15);for(var i=0;i<rows.length;i++)button((refineMenu.indexOf('sound:')===0?'refineSoundChoice:'+refineMenu.split(':')[1]+':':refineMenu==='send'?'refineSend:':refineMenu==='variations'?'refineOnly:':refineMenu==='scope'?'refineScope:':'refinePhrasing:')+rows[i][0],rows[i][1],255,255+i*48,580);rawDraw=false;}
};
var refineUiAction=action;action=function(id){
    if(/^refineSoundKind:/.test(id)){refineMenu='sound:'+id.split(':')[1];redraw();return;}
    if(/^refineKeepSound:/.test(id)){saveundo();var l=collageLane(Number(id.split(':')[1]));l.soundLocked=!l.soundLocked;say(l.soundLocked?'Sound kept. Generate can still change its rhythm.':'Sound released for library draws.');return;}
    if(/^refineSoundChoice:/.test(id)){var args=id.split(':'),l=collageLane(Number(args[1])),recipes={anything:['any','any'],impacts:['impact','transient',.01,10],machinery:['mechanical','sustained'],voices:['voice','any'],drones:['bass','low'],textures:['texture','sustained'],drums:['drums','any']},recipe=recipes[args[2]];if(!recipe)return;saveundo();l.libraryType=recipe[0];l.libraryCharacter=recipe[1];l.drawLabel=args[2];delete l.libraryMinSeconds;delete l.libraryMaxSeconds;if(recipe.length>2){l.libraryMinSeconds=recipe[2];l.libraryMaxSeconds=recipe[3];}refineMenu='';say('Next New sound for layer '+(Number(args[1])+1)+' looks for '+args[2]+'. Name hints and measured sound traits are approximate.');return;}
    if(id==='collageCommit'){refineMenu=refineMenu==='send'?'':'send';redraw();return;}
    if(/^refineSend:/.test(id)){refineMenu='';if(id==='refineSend:midi')writeRenderedMidi();else collageSendAudioToLive(id==='refineSend:stems');return;}
    if(id==='refineMore'){refineMenu=refineMenu==='variations'?'':'variations';redraw();return;}
    if(/^refineOnly:/.test(id)){var mode=id.split(':')[1];refineMenu='';if(mode==='protect'){if(!selection){say('Select a passage in Step editor first.');return;}saveundo();state.ranges.push(selection.slice());say('Passage kept across all layers, including silence. Green hits stay protected.');return;}if(mode==='release'){saveundo();state.ranges=[];say('Passage locks released. Individual hit and layer locks remain.');return;}if(!state.events.length){say('Generate a phrase first.');return;}refineGenerate(mode,false,null,true);return;}
    if(/^collageStyle:/.test(id)){saveundo();state.collage.style=id.split(':')[1];collageMenu='';collageApplyStyle();state.collage.controlsPending=true;say('Style loaded into the controls. Adjust them, then click Generate.');return;}
    if(/^collageNewSound:/.test(id)){var role=Number(id.split(':')[1]);if(refineJob||refineReady)refineCancel();collageDrawLibrary(role);return;}
    if(id!=='refineScope'&&id!=='refinePhrasing'&&!/^refine(Scope|Phrasing):/.test(id))refineMenu='';
    if(collageExportJob&&id!=='collagePlay'&&id!=='play'){say('Stop the export before editing.');return;}
    if((refineJob||refineReady)&&id==='collagePlay'){stop();say('Playback and pending proposal stopped.');return;}
    if((refineJob||refineReady)&&id!=='refineScope'){refineCancel();}
    if(id==='refineScope'||id==='refinePhrasing'){refineMenu=refineMenu===(id==='refineScope'?'scope':'phrasing')?'':id==='refineScope'?'scope':'phrasing';redraw();return;}
    if(/^refineScope:/.test(id)){state.collage.editScope=id.split(':')[1];refineMenu='';say('Generation target: '+refineScopeLabel()+'. Locked hits and layers stay protected.');return;}
    if(/^refinePhrasing:/.test(id)){saveundo();state.collage.phraseDevelopment=Number(id.split(':')[1]);refineMenu='';say('Phrase development set. New phrase or Rebuild rhythm applies it.');return;}
    if(id==='refineBarPrev'||id==='refineBarNext'){state.page=(state.page+(id==='refineBarNext'?1:-1)+state.bars)%state.bars;redraw();return;}
    if(id==='refineSafeOutput'){saveundo();var cfg=collageDynamicsSettings();cfg.safeOutput=!cfg.safeOutput;collageSendDynamics();redraw();return;}
    if(id==='collagePlay'&&!playing&&!preparing&&!state.events.length){refineGenerate('phrase',true,null,true);return;}
    if(id==='refineCompare'){refineCompareStart();return;}
    var modes={collagePhrase:'phrase',collageRhythm:'rhythm',collageCuts:'cuts',collageOrder:'order',collageDamage:'damage',collagePitchReroll:'pitch'};
    if(modes[id]){if(modes[id]!=='phrase'&&!state.events.length){say('Generate a phrase first, then change its rhythm, fragments or damage.');return;}refineGenerate(modes[id],false,null,true);return;}
    if(id==='collageLibraryRefresh'){collageFragmentGainCache={};refineFragmentWaveCache={};}
    if(id!=='refineCompare'&&id!=='collagePlay'&&id!=='play')refinePreviewGain=1;
    if(id==='collageCommit'){refineCompare=null;refinePreviewGain=1;}
    if(/^collageSelect:/.test(id))selected=-1;
    refineUiAction(id);
};
var refineUiClick=onclick;onclick=function(x,y){if(refineMenu){if(!workflowButtons(x,y)){refineMenu='';redraw();}return;}var priorLayer=collageSelectedLane;refineUiClick.apply(this,arguments);if(view===26&&priorLayer!==collageSelectedLane)selected=-1;};
var refineSafetyDefaults=collageDynamicsSettings;collageDynamicsSettings=function(){var cfg=refineSafetyDefaults();if(cfg.safeOutput===undefined)cfg.safeOutput=true;if(cfg.ceilingDb===undefined)cfg.ceilingDb=-1;return cfg;};

var refineControlBefore=collageSetControl;collageSetControl=function(s,x){refineControlBefore(s,x);if(['density','size','movement','damage'].indexOf(s.field)>=0)state.collage.controlsPending=true;};
