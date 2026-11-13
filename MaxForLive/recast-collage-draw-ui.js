// Per-layer local library drawing. No network service or uploaded audio.

var collageRecipeMenu=false,collageTypeMenu=false,collageCharacterMenu=false,collageLibraryReturnView=26;
var collageLibrarySmartPaint=paint;paint=function(){
    if(view!==29){collageLibrarySmartPaint();return;}buttons=[];rawDraw=true;simpleDrops();collageHideFields();rect(0,0,1080,880,[.07,.085,.1,1]);
    text('LOCAL SOUND DRAW',25,45,25);button('collageOpen','Back to collage',820,18,230);
    text('Choose where each layer finds its material. Lock a layer to keep a discovery.',25,90,14);
    button('collageLibraryRecipe','Draw recipe ▾',25,115,310);button('collageLibraryDraw',(collageJob||collageLibraryPending)?'Stop drawing / preparation':'Draw new sounds',350,115,330,true);button('collageLibraryHistory','Forget recent draws',695,115,355);
    button('collageLibraryCopies','Avoid copied files: '+(state.collage.avoidCopies===false?'Off':'On'),25,157,310,state.collage.avoidCopies!==false);text('Name hint above; analysed sound character below. Both filters apply.',350,177,13);
    var start=collageLanePage*6;
    for(var i=start;i<Math.min(roles.length,start+6);i++){var l=collageLane(i),isKept=l.locked||state.roleLocks[i],y=200+(i-start)*80;button('collageLibraryFocus:'+i,'Layer '+(i+1)+(isKept?' · kept':''),25,y,150);button('collageLibraryLayerRoot:'+i,l.libraryRoot?shortName(l.libraryRoot,30):'All library folders…',190,y,340);button('collageLibraryLayerClear:'+i,'All folders',540,y,135);button('collageLibraryType:'+i,(l.libraryType||'any')+' ▾',685,y,175);button('collageLibraryKeep:'+i,isKept?'Unlock':'Keep sound',870,y,180,isKept);button('collageLibraryCharacter:'+i,'Sound: '+(l.libraryCharacter||'any')+' ▾',540,y+34,320);text(l.sources.length?shortName(l.sources[0],42):'No sound assigned',190,y+53,11);button('collageLibraryHear:'+i,'Hear source',870,y+34,180);}
    button('collageLibraryRoot','Choose library folder…',25,675,335);button('collageLibraryAdd','Add library folder…',375,675,330);text(collageLibraryRoots().length+' global folders',725,695,13);
    button('collageLibraryPrev','Previous layers',25,715,245);button('collageLibraryNext','Next layers',285,715,245);button('collageLibraryRefresh','Rescan / refresh metadata',545,715,505);
    text('Sound characters are approximate audio measurements. Voice/machine hints still use names.',25,795,13);
    text('Fresh files come first. Copied files are skipped during draws, never deleted. No match keeps your sound.',25,825,13);
    text(status.slice(0,140),25,860,12,[.65,.79,.74,1]);
    if(collageRecipeMenu||collageTypeMenu||collageCharacterMenu){var choices=collageRecipeMenu?['anything','industrial','voices and atmosphere','percussion']:collageCharacterMenu?collageCharacters:collageLibraryTypes;rect(245,175,600,choices.length*48+20,[.04,.05,.06,1]);buttons=buttons.filter(function(b){return b.y>=715||b.y<115;});for(var j=0;j<choices.length;j++)button((collageRecipeMenu?'collageLibraryRecipe:':collageCharacterMenu?'collageLibrarySetCharacter:':'collageLibrarySetType:')+choices[j],(collageCharacterMenu?{any:'Any sound',low:'Low / bass-heavy',bright:'Bright / high-frequency',transient:'Sharp hits / sparse attacks',sustained:'Sustained / continuous',rough:'Rough / noisy'}[choices[j]]:choices[j]),255,185+j*48,580);}
};
var collageLibrarySmartFolder=exportfolder;exportfolder=function(){if(collageFolderIntent.indexOf('lane:')!==0){var back=collageLibraryReturnView;collageLibraryReturnView=26;collageLibrarySmartFolder.apply(this,arguments);if(back===29){view=29;redraw();}return;}var role=Number(collageFolderIntent.split(':')[1]);collageFolderIntent='';var path=browserPath(arrayfromargs(arguments).join(' '));if(!path)return;saveundo();collageLane(role).libraryRoot=path;collageLibraryKey='';view=29;redraw();};
var collageLibrarySmartAction=action;action=function(id){
    if(typeof collageExportJob!=='undefined'&&collageExportJob&&id.indexOf('collageLibrary')===0){say('Finish or stop the export before changing library draws.');return;}
    if((collageJob||collageLibraryPending)&&id==='collageLibraryDraw'){stop();say('Stopped drawing. Assigned sounds retained; New phrase applies them. Undo restores the prior setup.');return;}
    if((collageJob||collageLibraryPending)&&id.indexOf('collageLibrary')===0&&id!=='collageLibrarySetup'){say('Stop drawing / preparation before changing draw settings.');return;}
    if(id==='collageLibraryRoot'||id==='collageLibraryAdd')collageLibraryReturnView=view===29?29:26;
    if(id==='collageLibrarySetup'){collageMenu='';view=29;collageRecipeMenu=collageTypeMenu=collageCharacterMenu=false;redraw();return;}
    if(id==='collageLibraryRecipe'){collageRecipeMenu=!collageRecipeMenu;collageTypeMenu=collageCharacterMenu=false;redraw();return;}
    if(id.indexOf('collageLibraryRecipe:')===0){saveundo();var recipe=id.split(':')[1],types=recipe==='industrial'?['impact','mechanical','mechanical','voice','texture','bass']:recipe==='voices and atmosphere'?['voice','voice','texture','texture','mechanical','bass']:recipe==='percussion'?['impact','drums','drums','mechanical','texture','bass']:['any'];for(var i=0;i<roles.length;i++)if(!collageLane(i).locked&&!state.roleLocks[i])collageLane(i).libraryType=types[i%types.length];collageRecipeMenu=false;redraw();return;}
    if(id==='collageLibraryCopies'){saveundo();state.collage.avoidCopies=state.collage.avoidCopies===false;redraw();return;}
    if(id==='collageLibraryHistory'){saveundo();state.collage.libraryRecent=[];say('Recent-draw history cleared. Current recordings still stay out of draws.');return;}
    if(id==='collageLibraryPrev'||id==='collageLibraryNext'){collageLanePage=Math.max(0,Math.min(Math.ceil(roles.length/6)-1,collageLanePage+(id==='collageLibraryPrev'?-1:1)));redraw();return;}
    if(/^collageLibrary(Focus|LayerRoot|LayerClear|Type|Character|Keep|Hear):/.test(id)){var r=Number(id.split(':')[1]);collageSelectedLane=r;
        if(id.indexOf('Hear:')>=0){collageHearSource(0);return;}
        if(id.indexOf('Focus:')>=0){view=28;collageMenu='';redraw();return;}
        if(id.indexOf('LayerRoot')>=0){clearPickerIntent();collagePendingRole=-1;collageFolderIntent='lane:'+r;outlet(0,'folder');return;}
        if(id.indexOf('LayerClear')>=0){saveundo();collageLane(r).libraryRoot='';collageLibraryKey='';}
        if(id.indexOf('Keep:')>=0){saveundo();var kept=collageLane(r).locked||state.roleLocks[r];collageLane(r).locked=!kept;if(kept)state.roleLocks[r]=false;}
        if(id.indexOf('Type:')>=0){collageTypeMenu=true;collageRecipeMenu=collageCharacterMenu=false;}
        if(id.indexOf('Character:')>=0){collageCharacterMenu=true;collageTypeMenu=collageRecipeMenu=false;}
        redraw();return;
    }
    if(id.indexOf('collageLibrarySetType:')===0){saveundo();collageLane(collageSelectedLane).libraryType=id.split(':')[1];collageTypeMenu=false;redraw();return;}
    if(id.indexOf('collageLibrarySetCharacter:')===0){saveundo();collageLane(collageSelectedLane).libraryCharacter=id.split(':')[1];collageCharacterMenu=false;redraw();return;}
    if(id==='collageLibraryRefresh'){collageLibraryMetaCache={};collageCopyCache={};collageCharacterCache={};}
    collageLibrarySmartAction(id);
};

var collageLibrarySmartClick=onclick;onclick=function(x,y){if(view!==29){collageLibrarySmartClick.apply(this,arguments);return;}if(!workflowButtons(x,y)&&(collageRecipeMenu||collageTypeMenu||collageCharacterMenu)){collageRecipeMenu=collageTypeMenu=collageCharacterMenu=false;redraw();}};
