function navListRow(id,label,x,y,w,active){if(active)rect(x,y,w,28,[.28,.36,.39,1]);text(label,x+7,y+19,12,active?[.96,.97,.98,1]:[.76,.79,.81,1]);buttons.push({id:id,x:x,y:y,w:w,h:28});}
// Familiar folder / file / preview layout. No audio is assigned by navigation.
var navPaint=paint,navAction=action,navClick=onclick,navDouble=ondblclick,navDrag=ondrag,navRefresh=browserRefresh,navQuery=libraryquery;
var navTree=[],navExpanded=[],navCache={},navRoot='',navLastPath='',navHistory=[],navHistoryAt=-1,navFileOffset=0,navTreeOffset=0,navScrollDrag=null;
function navRead(path){if(!navCache[path])navCache[path]=browserRead(path);return navCache[path];}
function navBuildTree(){
 navTree=[];var root=state.sampleBrowser.root;if(!root)return;
 function visit(path,depth){if(navTree.length>=300||depth>8)return;navTree.push({path:path,name:shortName(path,100),depth:depth,expanded:navExpanded.indexOf(path)>=0});if(navExpanded.indexOf(path)<0)return;var rows=navRead(path);for(var i=0;i<rows.length;i++)if(rows[i].folder)visit(rows[i].path,depth+1);}
 visit(root,0);
}
function navResetRoot(){navRoot=state.sampleBrowser.root;navCache={};navExpanded=navRoot?[navRoot]:[];navHistory=[];navHistoryAt=-1;navLastPath='';navTreeOffset=0;navFileOffset=0;}
function navRemember(path){if(navHistory[navHistoryAt]===path)return;navHistory=navHistory.slice(0,navHistoryAt+1);navHistory.push(path);if(navHistory.length>50)navHistory.shift();navHistoryAt=navHistory.length-1;}
function navExpandParents(path){var root=state.sampleBrowser.root;while(path&&browserInside(path,root)){if(navExpanded.indexOf(path)<0)navExpanded.push(path);if(path===root)break;path=path.slice(0,path.lastIndexOf('/'));}}
browserRefresh=function(){
 if(navRoot!==state.sampleBrowser.root)navResetRoot();
 var path=state.sampleBrowser.path;if(path!==navLastPath){navFileOffset=0;navLastPath=path;navRemember(path);}
 navCache[path]=path?browserRead(path):[];navExpandParents(path);navBuildTree();browserRows=navCache[path];browserPage=0;redraw();
};
function navNavigate(path,history){var root=state.sampleBrowser.root;if(!path||!browserInside(path,root))return;browserQueryText='';browserFavoritesOnly=false;var f=this.patcher.getnamed('librarySearch');if(f)f.message('set','');browserSelected='';browserSource=null;browserWave=[];browserPreview=false;outlet(0,'stopvoice',33);state.sampleBrowser.path=path;if(history)navLastPath=path;browserRefresh();navFileOffset=0;redraw();}
function navFiles(){return browserResults().filter(function(r){return !r.folder;});}
function navHistoryMove(delta){var at=navHistoryAt+delta;if(at<0||at>=navHistory.length)return;navHistoryAt=at;navNavigate(navHistory[at],true);}
function navSelectFile(delta){var files=navFiles();if(!files.length)return;var at=-1;for(var i=0;i<files.length;i++)if(files[i].path===browserSelected){at=i;break;}at=clamp(at<0?0:at+delta,0,files.length-1);if(at<navFileOffset)navFileOffset=at;if(at>=navFileOffset+14)navFileOffset=at-13;browserSelect(files[at].path);}
function navScroll(delta,tree){var length=tree?navTree.length:navFiles().length,key=tree?'navTreeOffset':'navFileOffset',value=tree?navTreeOffset:navFileOffset;value=Math.round(clamp(value+delta,0,Math.max(0,length-14)));if(tree)navTreeOffset=value;else navFileOffset=value;redraw();}
function navCrumbs(){var root=state.sampleBrowser.root,path=state.sampleBrowser.path;if(!root)return [];var out=[{path:root,name:shortName(root,22)}],tail=path.slice(root.length).split('/').filter(function(x){return !!x;}),p=root;for(var i=0;i<tail.length;i++){p=browserJoin(p,tail[i]);out.push({path:p,name:tail[i].slice(0,22)});}return out.length>7?[out[0]].concat(out.slice(-6)):out;}
paint=function(){
 if(view!==8){navPaint();return;}
 if(navRoot!==state.sampleBrowser.root){navResetRoot();navExpandParents(state.sampleBrowser.path);navBuildTree();}
 buttons=[];rawDraw=true;simpleDrops();var f=this.patcher.getnamed('instrumentTempo');if(f)f.hidden=1;
 rect(0,0,1080,880,[.08,.09,.1,1]);text('RECAST',20,39,27,[.94,.76,.43,1]);text('SOUNDS',205,35,13);button('view0','Back to pattern',850,14,210);
 button('navBack','‹ Back',20,70,90);button('navForward','Forward ›',120,70,100);button('browserUp','Up',230,70,65);button('browserRoot',state.sampleBrowser.root?'Library folder…':'Choose library…',310,70,220);button('navRefresh','Refresh',545,70,115);button('browserRole','Lane: '+roles[state.pad]+' ▾',730,70,330);
 var crumbs=navCrumbs(),xx=20;for(var i=0;i<crumbs.length;i++){var width=Math.min(145,Math.max(65,crumbs[i].name.length*7+24));button('navCrumb'+i,crumbs[i].name+' ›',xx,115,width);xx+=width+6;}
 button('navHome','Library',20,160,110,!browserFavoritesOnly);button('navFavorites','Favorites',140,160,110,browserFavoritesOnly);
 text('Search library + Enter',275,153,11);var search=this.patcher.getnamed('librarySearch');if(search){search.hidden=0;search.message('presentation_rect',275,160,450,30);search.message('readonly',0);search.message('ignoreclick',0);search.message('bgcolor',.16,.18,.20,1);search.message('textcolor',.9,.92,.94,1);if(this.patcher.bringtofront)this.patcher.bringtofront(search);}button('browserClear','Clear',740,160,80);button('browserContext','In groove: '+(browserContext?'On':'Off'),835,160,225,browserContext);
 rect(20,215,230,455,[.065,.075,.085,1]);rect(270,215,470,455,[.065,.075,.085,1]);
 navTreeOffset=Math.min(navTreeOffset,Math.max(0,navTree.length-14));rect(244,250,6,420,[.16,.18,.21,1]);if(navTree.length>14){var th=Math.max(22,420*14/navTree.length),ty=250+(420-th)*navTreeOffset/(navTree.length-14);rect(244,ty,6,th,[.47,.51,.55,1]);}text('FOLDERS',30,238,12);text(browserFavoritesOnly?'FAVORITES':browserQueryText?'SEARCH RESULTS':'SAMPLES',280,238,12);
 navTreeOffset=Math.min(navTreeOffset,Math.max(0,navTree.length-14));for(var i=0;i<14;i++){var idx=navTreeOffset+i,row=navTree[idx];if(!row)break;var x=25+row.depth*12,y=250+i*30;navListRow('navToggle'+idx,row.expanded?'▾':'▸',x,y,22);navListRow('navFolder'+idx,row.name.slice(0,Math.max(9,Math.floor((175-row.depth*12)/7))),x+23,y,195-row.depth*12,row.path===state.sampleBrowser.path&&!browserFavoritesOnly);}
 var files=navFiles();navFileOffset=Math.min(navFileOffset,Math.max(0,files.length-14));for(var i=0;i<14;i++){var idx=navFileOffset+i,row=files[idx];if(!row)break;navListRow('navSample'+idx,row.name.slice(0,57),280,250+i*30,440,row.path===browserSelected);}
 rect(728,250,7,420,[.16,.18,.21,1]);if(files.length>14){var h=Math.max(22,420*14/files.length),top=250+(420-h)*navFileOffset/(files.length-14);rect(728,top,7,h,[.47,.51,.55,1]);}
 if(!state.sampleBrowser.root){text('Choose your sample library',280,310,19);text('Use Choose library above to browse your folders here.',280,345,11);}text(browserBusy?'Searching… '+browserIndex.length+' files':files.length+' samples',280,694,11);button('navPreviousSample','‹ Previous sample',275,715,215);button('navNextSample','Next sample ›',505,715,215);
 text(browserSelected?shortName(browserSelected,33):'Select a sample',755,230,16);rect(755,265,305,130,[.045,.055,.065,1]);for(var w=0;w<browserWave.length;w++){var h=Math.max(1,Math.min(124,browserWave[w]*124));rect(755+w*305/browserWave.length,330-h/2,1.3,h,[.8,.58,.32,1]);}
 text(browserSource?(browserSource.dur/1000).toFixed(2)+' seconds · level matched':'Preview does not replace your sound.',755,425,11);button('browserHear','Hear',755,455,145);button('browserPreviewStop','Stop preview',915,455,145);if(!browserPoolMode)button('soundScope',soundAssignHits?'Target: selected hits ▾':'Target: entire lane ▾',755,505,305);else text('Target: '+roles[state.pad]+' sample pool',755,525,12);button('browserAssign',browserPoolMode?'Add to '+roles[state.pad]+' pool':soundAssignmentLabel(),755,550,305,true);button('browserFavorite',state.sampleBrowser.favorites.indexOf(browserSelected)>=0?'Remove favorite':'Favorite',755,595,305);
 text('Single-click: preview',755,665,12);text('Double-click: use for current target',755,690,11);text('In groove auditions the chosen lane.',755,725,11);button('play',playing||preparing?'Stop pattern':'Play pattern',20,775,230);button('browserFile','Choose a file manually…',275,775,250);text(status.slice(0,145),20,856,11);
 if(soundScopeMenu){rect(755,537,305,70,[.055,.065,.08,1]);buttons=buttons.filter(function(b){return !(b.x>=755&&b.y>=537&&b.y<607);});button('soundScopeLane','Entire lane (all hits)',760,540,295,!soundAssignHits);button('soundScopeHits','Selected hits only',760,574,295,soundAssignHits);}
 if(browserRoleMenu){rect(725,105,340,roles.length*30+8,[.055,.065,.08,1]);buttons=buttons.filter(function(b){return !(b.x<1065&&b.x+b.w>725&&b.y<113+roles.length*30&&b.y+b.h>105);});for(var r=0;r<roles.length;r++)button('browserTarget'+r,roles[r],730,110+r*30,330,r===state.pad);}rawDraw=false;
};
action=function(id){
 if(id==='navBack')navHistoryMove(-1);else if(id==='navForward')navHistoryMove(1);else if(id==='navHome')navNavigate(state.sampleBrowser.root);else if(id==='navFavorites'){browserFavoritesOnly=true;browserQueryText='';navFileOffset=0;var f=this.patcher.getnamed('librarySearch');if(f)f.message('set','');redraw();}else if(id==='navRefresh'){navCache={};browserIndexRoot='';browserRefresh();if(browserQueryText)browserStartScan();}else if(id==='navPreviousSample')navSelectFile(-1);else if(id==='navNextSample')navSelectFile(1);
 else if(/^navSample\d+$/.test(id)){var row=navFiles()[Number(id.slice(9))];if(row)browserSelect(row.path);}
 else if(/^navFolder\d+$/.test(id)){var row=navTree[Number(id.slice(9))];if(row)navNavigate(row.path);}
 else if(/^navToggle\d+$/.test(id)){var row=navTree[Number(id.slice(9))];if(row){var at=navExpanded.indexOf(row.path);if(at>=0)navExpanded.splice(at,1);else navExpanded.push(row.path);navBuildTree();redraw();}}
 else if(/^navCrumb\d+$/.test(id)){var c=navCrumbs()[Number(id.slice(8))];if(c)navNavigate(c.path);}
 else{navAction(id);return;}redraw();
};
libraryquery=function(){var before=browserQueryText;navQuery.apply(this,arguments);if(view===8&&before!==browserQueryText){navFileOffset=0;redraw();}};
function navDragScroll(y,tree){var length=tree?navTree.length:navFiles().length,value=Math.round(clamp((y-250)/420,0,1)*Math.max(0,length-14));if(tree)navTreeOffset=value;else navFileOffset=value;redraw();}
onclick=function(x,y){if(view!==8){navClick.apply(this,arguments);return;}if(soundScopeMenu){workflowButtons(x,y);return;}if(browserRoleMenu){for(var i=0;i<buttons.length;i++){var b=buttons[i];if(b.id.indexOf('browserTarget')===0&&x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h){action(b.id);return;}}browserRoleMenu=false;redraw();return;}if(((x>=725&&x<=740)||(x>=243&&x<=255))&&y>=250&&y<=670){navScrollDrag={tree:x<260};navDragScroll(y,navScrollDrag.tree);return;}workflowButtons(x,y);};
ondrag=function(x,y,b){if(view===8&&navScrollDrag){if(b)navDragScroll(y,navScrollDrag.tree);else navScrollDrag=null;return;}navDrag.apply(this,arguments);};
ondblclick=function(x,y){if(view!==8){navDouble.apply(this,arguments);return;}if(x>=280&&x<=720&&y>=250&&y<670){var r=navFiles()[navFileOffset+Math.floor((y-250)/30)];if(r){if(browserSelected!==r.path)browserSelect(r.path);browserAssign(browserPoolMode);}}};
var navWheel=typeof onwheel==='function'?onwheel:null;onwheel=function(x,y,sx,sy){if(view===8&&y>=215&&y<=670){navScroll((sy<0?1:-1)*Math.max(1,Math.round(Math.abs(sy)*3)),x<260);return;}if(navWheel)navWheel.apply(this,arguments);};
