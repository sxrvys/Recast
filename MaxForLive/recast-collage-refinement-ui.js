// Main decisions stay beside transport; detailed source editing is one click away.
var refineMenu='';
function refineScopeLabel(){var kind=state.collage.editScope||'pattern';return kind==='layer'?'Layer '+(collageSelectedLane+1):kind==='bar'?'Bar '+(state.page+1):kind==='selection'?'Selected passage':'Whole pattern';}
function refineButton(id,label,x,y,w,active){buttons=buttons.filter(function(b){return b.id!==id;});button(id,label,x,y,w,active);}
var refineUiPaint=paint;paint=function(){refineUiPaint();if(view===26&&!collageMenu){rawDraw=true;
    refineButton('collagePlay',playing||preparing||collageJob||refineJob||refineReady||collageLibraryPending||collageExportJob?'■ Stop':'▶ Play',20,65,100,true);
    refineButton('collagePhrase',refineJob?'Preparing proposal…':'New phrase',135,65,190,true);
    button('refineScope','Target: '+refineScopeLabel()+' ▾',635,155,290);
    if(state.collage.editScope==='bar'){button('refineBarPrev','‹',935,155,40);button('refineBarNext','›',985,155,40);}
    refineButton('collageRhythm','Rebuild rhythm',635,472,185);refineButton('collageCuts','Find new fragments',835,472,190);
    refineButton('collageOrder','Swap fragments',635,510,185);refineButton('collageDamage','New damage treatment',835,510,190);
    rect(635,586,390,28,[.07,.085,.1,1]);button('refineCompare',refineCompareSide?'Hear previous':'Hear generated',635,586,185);button('refineFragments','Edit / audition fragments',835,586,190);
    rawDraw=false;
}
    if(view===27&&collageSection==='structure'&&!collageMenu){rawDraw=true;button('refinePhrasing','Phrase development: '+Math.round((state.collage.phraseDevelopment===undefined?.65:state.collage.phraseDevelopment)*100)+'% ▾',585,600,390);rawDraw=false;}
    if(view===27&&collageSection==='output'&&!collageMenu){rawDraw=true;button('refineSafeOutput','Safety ceiling: '+(collageDynamicsSettings().safeOutput?'On · −1 dB':'Off'),585,570,390,collageDynamicsSettings().safeOutput);rawDraw=false;}
    if(refineMenu){rawDraw=true;var rows=refineMenu==='scope'?[['pattern','Whole pattern'],['layer','Selected layer'],['bar','This bar'],['selection','Selected passage from Step editor']]:[[0,'Off · independent layers'],[.35,'Subtle recurring motifs'],[.65,'Motifs, replies and end fills'],[1,'Strong phrase development']];rect(245,205,600,rows.length*48+65,[.04,.055,.07,1]);buttons=[];text(refineMenu==='scope'?'CHOOSE THE TARGET':'PHRASE DEVELOPMENT',265,235,15);for(var i=0;i<rows.length;i++)button((refineMenu==='scope'?'refineScope:':'refinePhrasing:')+rows[i][0],rows[i][1],255,255+i*48,580);rawDraw=false;}
};
var refineUiAction=action;action=function(id){
    if(id!=='refineScope'&&id!=='refinePhrasing'&&!/^refine(Scope|Phrasing):/.test(id))refineMenu='';
    if(collageExportJob&&id!=='collagePlay'&&id!=='play'){say('Stop the export before editing.');return;}
    if((refineJob||refineReady)&&id==='collagePlay'){stop();say('Playback and pending proposal stopped.');return;}
    if((refineJob||refineReady)&&id!=='refineScope'){refineCancel();}
    if(id==='refineScope'||id==='refinePhrasing'){refineMenu=refineMenu===(id==='refineScope'?'scope':'phrasing')?'':id==='refineScope'?'scope':'phrasing';redraw();return;}
    if(/^refineScope:/.test(id)){state.collage.editScope=id.split(':')[1];refineMenu='';say('Generation target: '+refineScopeLabel()+'. Locked hits and layers stay protected.');return;}
    if(/^refinePhrasing:/.test(id)){saveundo();state.collage.phraseDevelopment=Number(id.split(':')[1]);refineMenu='';say('Phrase development set. New phrase or Rebuild rhythm applies it.');return;}
    if(id==='refineBarPrev'||id==='refineBarNext'){state.page=(state.page+(id==='refineBarNext'?1:-1)+state.bars)%state.bars;redraw();return;}
    if(id==='refineSafeOutput'){saveundo();var cfg=collageDynamicsSettings();cfg.safeOutput=!cfg.safeOutput;collageSendDynamics();redraw();return;}
    if(id==='collagePlay'&&!playing&&!preparing&&!state.events.length){refineGenerate('phrase',true);return;}
    if(id==='refineCompare'){refineCompareStart();return;}
    var modes={collagePhrase:'phrase',collageRhythm:'rhythm',collageCuts:'cuts',collageOrder:'order',collageDamage:'damage',collagePitchReroll:'pitch'};
    if(modes[id]){if(modes[id]!=='phrase'&&!state.events.length){say('Generate a phrase first, then change its rhythm, fragments or damage.');return;}refineGenerate(modes[id]);return;}
    if(id==='collageLibraryRefresh'){collageFragmentGainCache={};refineFragmentWaveCache={};}
    if(id!=='refineCompare'&&id!=='collagePlay'&&id!=='play')refinePreviewGain=1;
    if(id==='collageCommit'){refineCompare=null;refinePreviewGain=1;}
    if(/^collageSelect:/.test(id))selected=-1;
    refineUiAction(id);
};
var refineUiClick=onclick;onclick=function(x,y){if(refineMenu){if(!workflowButtons(x,y)){refineMenu='';redraw();}return;}var priorLayer=collageSelectedLane;refineUiClick.apply(this,arguments);if(view===26&&priorLayer!==collageSelectedLane)selected=-1;};
var refineSafetyDefaults=collageDynamicsSettings;collageDynamicsSettings=function(){var cfg=refineSafetyDefaults();if(cfg.safeOutput===undefined)cfg.safeOutput=true;if(cfg.ceilingDb===undefined)cfg.ceilingDb=-1;return cfg;};
