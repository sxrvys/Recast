// Direct sliders for the existing feel engine; common controls first.
var feelUiPaint=paint,feelUiAction=action,feelUiClick=onclick,feelUiDrag=ondrag;
var feelUiAdvanced=false,feelUiGesture=null;
function feelUiControls(){var items=[['stagger','Timing sway'],['drag','Late lean'],['sputter','Uneven repeats'],['strangle','Tail cutting']];if(feelUiAdvanced)items=items.concat([['trip','Missing / late hits'],['recovery','Return speed'],['clustering','Group glitches'],['anchors','Anchor protection'],['contrast','Overall amount'],['answer','Late answers']]);return items.map(function(a,i){return {field:a[0],label:a[1],x:20+i%2*545,y:260+Math.floor(i/2)*80};});}
function feelUiSet(c,x){state.feel[c.field]=Math.round(clamp((x-c.x)/480,0,1)*100)/100;invalidateOptions();redraw();}
paint=function(){if(view!==4){feelUiPaint();return;}buttons=[];rawDraw=true;simpleDrops();var f=this.patcher.getnamed('instrumentTempo');if(f)f.hidden=1;f=this.patcher.getnamed('librarySearch');if(f)f.hidden=1;rect(0,0,1080,880,[.08,.09,.1,1]);text('FEEL / INSTABILITY',20,42,25);button('view0','Back to pattern',840,14,220);text('Shape a new take around your anchors. Drag a slider, then generate. Notes remain editable.',20,95,13);button('feelnear','Generate a new take',20,125,250,true);button('feelbase','Use current as input',285,125,245);button('feelspace','Make space',545,125,185);button('play',playing||preparing?'Stop':'Play',745,125,135);button('damageSettings','Glitch mix',895,125,165);text('KEEP THESE LANES STEADY',20,185,12);for(var r=0;r<6;r++){var role=workflowBank*6+r;if(role<roles.length)button('feelUiAnchor'+role,roles[role],20+r*175,205,160,!!state.feelAnchors[role]);}var controls=feelUiControls();for(var i=0;i<controls.length;i++){var c=controls[i],v=state.feel[c.field];text(c.label,c.x,c.y+15,14);text(Math.round(v*100)+'%',c.x+435,c.y+15,12);rect(c.x,c.y+34,480,5,[.25,.28,.31,1]);rect(c.x,c.y+34,480*v,5,[.83,.60,.31,1]);}button('feelUiMore',feelUiAdvanced?'Fewer controls ▴':'More feel controls ▾',20,feelUiAdvanced?700:450,310,feelUiAdvanced);if(!feelUiAdvanced){text('Timing sway: drag and catch up. Late lean: make the details hang behind.',20,535,13);text('Uneven repeats: create short bursts. Tail cutting: make hits cramped and abrupt.',20,570,13);text('Choose Glitch mix for gaps, displaced fragments and breakdowns.',20,605,13);}text('Target: '+(workflowTarget<0?'All lanes':roles[workflowTarget])+'. Scope: '+['Pattern','Last beat','Selected passage'][state.scope]+'. Explicit locks always remain.',20,785,12);text(status.slice(0,145),20,856,11);rawDraw=false;};
action=function(id){if(id==='feelUiMore'){feelUiAdvanced=!feelUiAdvanced;redraw();return;}if(/^feelUiAnchor\d+$/.test(id)){var r=Number(id.slice(12));saveundo();state.feelAnchors[r]=!state.feelAnchors[r];redraw();return;}feelUiAction(id);};
onclick=function(x,y){if(view!==4){feelUiClick.apply(this,arguments);return;}var controls=feelUiControls();for(var i=0;i<controls.length;i++){var c=controls[i];if(x>=c.x&&x<=c.x+480&&y>=c.y+20&&y<=c.y+52){saveundo();feelUiGesture=c;feelUiSet(c,x);return;}}workflowButtons(x,y);};
ondrag=function(x,y,b){if(view===4&&feelUiGesture){if(b)feelUiSet(feelUiGesture,x);else feelUiGesture=null;return;}feelUiDrag.apply(this,arguments);};
var feelUiMovable=movable;movable=function(e){return feelUiMovable(e)&&(workflowTarget<0||workflowTarget===e.role);};
// The footer is shared by every page. Settings get the same help as buttons.
var settingHelp={
 drunkenness:'Bend timing into shared drags and recoveries. 0 = steady timing. Click Apply damage to generate a new take.',
 damage:'Set structural disruption: gaps, bursts, cuts and shifted fragments. 0 = none. Click Apply damage to hear a new take.',
 detailDensity:'Set how busy the generated detail lanes are. Click Generate groove to use this amount.',
 pocket:'Set timing and accent variation without adding hits or cuts. Click Apply pocket to hear a new take.',
 detailBias:'Favor hats, percussion and textures over kick and snare. Explicitly targeting a lane overrides this bias.',
 foundationProtection:'Protect generated kick/snare anchors. 100% keeps them exact; lower values allow movement. Explicit locks always win.',
 gateDepth:'Tighten the short gates used by generated damage. Higher values cut tails sooner. Generate a new damage take to hear it.',
 stumble:'Favor a passage that drags, catches up and recovers, with short and held responses. 0 disables this behavior.',
 missing:'Favor missing hits followed by quieter late answers. 0 disables this behavior.',
 ratchet:'Favor accelerating or decelerating bursts with changing pitch and accents. 0 disables this behavior.',
 interrupt:'Favor abrupt tail cuts and held sounds interrupted by the next hit. 0 disables this behavior.',
 displace:'Favor shifting a fragment together while retaining its internal rhythm. 0 disables this behavior.',
 breakdown:'Favor a patch of missing hits followed by a clustered recovery. 0 disables this behavior.'
};
var feelHelp={
 stagger:'Timing sway: related hits drag and catch up instead of jittering independently. Click Generate a new take to hear changes.',
 drag:'Late lean: delay eligible hits and pitch some down, like machinery struggling. Click Generate a new take.',
 sputter:'Uneven repeats: break eligible hits into shaped bursts. Higher values make bursts more likely. Click Generate a new take.',
 strangle:'Tail cutting: shorten gates and add choking for a cramped feel. Higher values cut more. Click Generate a new take.',
 trip:'Missing / late hits: omit an expected hit or answer it late. Click Generate a new take to hear changes.',
 recovery:'Return speed: higher values pull displaced timing back toward the pulse sooner. Click Generate a new take.',
 clustering:'Group glitches: higher values concentrate disruption into short episodes. Click Generate a new take.',
 anchors:'Anchor protection: preserve the lanes selected above. At 100% they stay exact; explicit locks always remain.',
 contrast:'Overall amount: scale the feel engine treatment. 0 leaves the input unchanged. Click Generate a new take.',
 answer:'Late answers: add quieter responses after eligible hits. Click Generate a new take.'
};
var helpButtons={
 navBack:'Return to the previous folder without assigning a sample.',navForward:'Go forward through your folder history.',
 browserUp:'Go up one folder, staying inside your library.',browserRoot:'Choose the top folder of your sample library. Existing sample assignments stay intact.',
 navRefresh:'Reread folders and files after adding or moving samples on disk.',navHome:'Return to the library root and clear search and Favorites filters.',
 navFavorites:'Show your favorited samples within this library.',browserClear:'Clear the search and return to the current folder.',
 browserRole:'Choose the instrument that receives a sample when you press Assign or double-click a file.',
 browserContext:'While the pattern plays, audition this candidate on the chosen lane. It stays temporary until you press Assign.',
 browserHear:'Preview the selected sample on its own without assigning it.',browserPreviewStop:'Stop the standalone preview; the pattern can keep playing.',
 browserAssign:'Assign the selected sample to the chosen lane, or add it to the pool when pool mode is selected.',
 browserPool:'Switch between replacing the lane one-shot and adding samples to its pool.',browserFavorite:'Add or remove the selected sample from Favorites.',
 navPreviousSample:'Preview the previous sample in this file list.',navNextSample:'Preview the next sample in this file list.',
 browserFile:'Use the system file picker for a sample outside your current library.',browserLegacy:'Open the optional library analysis tools.',
 feelnear:'Generate another fixed feel variation from the stored input, using these sliders and your current target and scope.',
 feelbase:'Use the current notes as the input for future feel variations. This deliberately starts a new generation.',
 feelspace:'Generate a sparser variation around your anchors, retaining protected hits and protected silence.',
 feelUiMore:'Show or hide the detailed feel controls. Hiding controls does not reset their settings.',
 damageAdvanced:'Show or hide the behavior mix and gate tightness. Hiding controls does not reset their settings.',
 damageReset:'Restore the default timing, glitch amount, detail bias, anchor protection and behavior mix.',
 view4:'Open the feel engine: timing sway, late lean, uneven repeats and tail cutting, with optional detailed controls.',
 view0:'Return to the sequencer grid. Your settings and generated notes remain.'
};
for(var helpId in helpButtons)visualHints[helpId]=helpButtons[helpId];
var settingIdle=onidle;
onidle=function(x,y){
 var id='',controls=view===25?damageSliders():view===4?feelUiControls():[];
 for(var i=0;i<controls.length;i++){var c=controls[i];if(x>=c.x&&x<=c.x+480&&y>=c.y-5&&y<=c.y+55){id=(view===4?'feelHelp:':'settingHelp:')+(c.behavior||c.field);break;}}
 if(view===0&&y>=153&&y<=200)for(var i=0;i<4;i++)if(x>=20+i*265&&x<=245+i*265)id='settingHelp:'+['detailDensity','pocket','drunkenness','damage'][i];
 if(!id){settingIdle.apply(this,arguments);id=visualHover;
  if(/^navSample/.test(id))visualHints[id]='Single-click to preview this sample; double-click to assign it to the chosen lane.';
  else if(/^navToggle/.test(id))visualHints[id]='Expand or collapse this folder in the tree. Use its name to open it.';
  else if(/^navFolder/.test(id))visualHints[id]='Open this folder. Navigation never replaces your assigned sounds.';
  else if(/^navCrumb/.test(id))visualHints[id]='Jump directly to this parent folder.';
  else if(/^feelUiAnchor/.test(id))visualHints[id]='Keep this lane steady in the feel engine. Anchor protection sets how strongly; explicit locks always win.';
 }else{visualHints[id]=id.indexOf('feelHelp:')===0?feelHelp[id.slice(9)]:settingHelp[id.slice(12)];if(visualHover!==id){visualHover=id;mgraphics.redraw();}}
};
