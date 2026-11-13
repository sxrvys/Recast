// Per-layer local library drawing. No network service or uploaded audio.

var collageRecipeMenu=false,collageTypeMenu=false,collageLibraryReturnView=26;
var collageLibrarySmartPaint=paint;paint=function(){
    if(view!==29){collageLibrarySmartPaint();return;}buttons=[];rawDraw=true;simpleDrops();collageHideFields();rect(0,0,1080,880,[.07,.085,.1,1]);
    text('LOCAL SOUND DRAW',25,45,25);button('collageOpen','Back to collage',820,18,230);
    text('Choose where each layer finds its material. Lock a layer to keep a discovery.',25,90,14);
    button('collageLibraryRecipe','Draw recipe ▾',25,115,310);button('collageLibraryDraw','Draw new sounds',350,115,330,true);button('collageLibraryHistory','Forget recent draws',695,115,355);
    var start=collageLanePage*6;
    for(var i=start;i<Math.min(roles.length,start+6);i++){var l=collageLane(i),isKept=l.locked||state.roleLocks[i],y=200+(i-start)*80;button('collageLibraryFocus:'+i,'Layer '+(i+1)+(isKept?' · kept':''),25,y,150);button('collageLibraryLayerRoot:'+i,l.libraryRoot?shortName(l.libraryRoot,30):'All library folders…',190,y,340);button('collageLibraryLayerClear:'+i,'All folders',540,y,135);button('collageLibraryType:'+i,(l.libraryType||'any')+' ▾',685,y,175);button('collageLibraryKeep:'+i,isKept?'Unlock':'Keep sound',870,y,180,isKept);}
    button('collageLibraryRoot','Choose library folder…',25,660,335);button('collageLibraryAdd','Add library folder…',375,660,330);text(collageLibraryRoots().length+' global folders',725,680,13);
    button('collageLibraryPrev','Previous layers',25,715,245);button('collageLibraryNext','Next layers',285,715,245);button('collageLibraryRefresh','Rescan / refresh metadata',545,715,505);
    text('Types are filename / folder hints, not an audio-content classifier. No matches keeps your sound.',25,795,13);
    text('Fresh files come first; small pools may reuse earlier draws. Active recordings are not reused.',25,825,13);
    if(collageRecipeMenu||collageTypeMenu){var choices=collageRecipeMenu?['anything','industrial','voices and atmosphere','percussion']:collageLibraryTypes;rect(245,175,600,choices.length*48+20,[.04,.05,.06,1]);buttons=buttons.filter(function(b){return b.y>=715||b.y<115;});for(var j=0;j<choices.length;j++)button((collageRecipeMenu?'collageLibraryRecipe:':'collageLibrarySetType:')+choices[j],choices[j],255,185+j*48,580);}
};
var collageLibrarySmartFolder=exportfolder;exportfolder=function(){if(collageFolderIntent.indexOf('lane:')!==0){var back=collageLibraryReturnView;collageLibraryReturnView=26;collageLibrarySmartFolder.apply(this,arguments);if(back===29){view=29;redraw();}return;}var role=Number(collageFolderIntent.split(':')[1]);collageFolderIntent='';var path=browserPath(arrayfromargs(arguments).join(' '));if(!path)return;saveundo();collageLane(role).libraryRoot=path;collageLibraryKey='';view=29;redraw();};
var collageLibrarySmartAction=action;action=function(id){
    if(typeof collageExportJob!=='undefined'&&collageExportJob&&id.indexOf('collageLibrary')===0){say('Finish or stop the export before changing library draws.');return;}
    if(id==='collageLibraryRoot'||id==='collageLibraryAdd')collageLibraryReturnView=view===29?29:26;
    if(id==='collageLibrarySetup'){collageMenu='';view=29;collageRecipeMenu=collageTypeMenu=false;redraw();return;}
    if(id==='collageLibraryRecipe'){collageRecipeMenu=!collageRecipeMenu;collageTypeMenu=false;redraw();return;}
    if(id.indexOf('collageLibraryRecipe:')===0){saveundo();var recipe=id.split(':')[1],types=recipe==='industrial'?['impact','mechanical','mechanical','voice','texture','bass']:recipe==='voices and atmosphere'?['voice','voice','texture','texture','mechanical','bass']:recipe==='percussion'?['impact','drums','drums','mechanical','texture','bass']:['any'];for(var i=0;i<roles.length;i++)if(!collageLane(i).locked&&!state.roleLocks[i])collageLane(i).libraryType=types[i%types.length];collageRecipeMenu=false;redraw();return;}
    if(id==='collageLibraryHistory'){saveundo();state.collage.libraryRecent=[];say('Recent-draw history cleared. Current recordings still stay out of draws.');return;}
    if(id==='collageLibraryPrev'||id==='collageLibraryNext'){collageLanePage=Math.max(0,Math.min(Math.ceil(roles.length/6)-1,collageLanePage+(id==='collageLibraryPrev'?-1:1)));redraw();return;}
    if(/^collageLibrary(Focus|LayerRoot|LayerClear|Type|Keep):/.test(id)){var r=Number(id.split(':')[1]);collageSelectedLane=r;
        if(id.indexOf('LayerRoot')>=0){clearPickerIntent();collagePendingRole=-1;collageFolderIntent='lane:'+r;outlet(0,'folder');return;}
        if(id.indexOf('LayerClear')>=0){saveundo();collageLane(r).libraryRoot='';collageLibraryKey='';}
        if(id.indexOf('Keep:')>=0){saveundo();var kept=collageLane(r).locked||state.roleLocks[r];collageLane(r).locked=!kept;if(kept)state.roleLocks[r]=false;}
        if(id.indexOf('Type:')>=0){collageTypeMenu=true;collageRecipeMenu=false;}
        redraw();return;
    }
    if(id.indexOf('collageLibrarySetType:')===0){saveundo();collageLane(collageSelectedLane).libraryType=id.split(':')[1];collageTypeMenu=false;redraw();return;}
    if(id==='collageLibraryRefresh')collageLibraryMetaCache={};
    collageLibrarySmartAction(id);
};

var collageLibrarySmartClick=onclick;onclick=function(x,y){if(view!==29){collageLibrarySmartClick.apply(this,arguments);return;}if(!workflowButtons(x,y)&&(collageRecipeMenu||collageTypeMenu)){collageRecipeMenu=collageTypeMenu=false;redraw();}};
