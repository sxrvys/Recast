// Original stereo balance and linked peak-envelope compression, shared with offline exports.
function collagePanGains(pan){pan=clamp(Number(pan)||0,-1,1);return [Math.cos(Math.max(0,pan)*Math.PI/2),Math.cos(Math.max(0,-pan)*Math.PI/2)];}
function collageDynamicsSettings(){var c=state.collage;if(!c.outputDynamics)c.outputDynamics={enabled:false,thresholdDb:-12,ratio:3,attackMs:10,releaseMs:120,makeupDb:0};return c.outputDynamics;}
function collageSendDynamics(){try{var object=this.patcher.parentpatcher.getnamed('recastOutputDynamics'),c=collageDynamicsSettings();if(object)for(var field in c)if(c.hasOwnProperty(field))object.message(field,field==='enabled'?(c[field]?1:0):c[field]);}catch(err){say('Output compressor: '+err.message);}}
function collageCompressBlock(block,cfg,memory,rate){
    if(!cfg.enabled)return block;
    var env=memory.envelope||0,a=Math.exp(-1/(Math.max(.1,cfg.attackMs)*.001*rate)),r=Math.exp(-1/(Math.max(1,cfg.releaseMs)*.001*rate)),rows=[];
    for(var role in block.layers)if(block.layers.hasOwnProperty(role))rows.push(block.layers[role]);
    for(var i=0;i<block.mix[0].length;i++){
        var peak=Math.max(Math.abs(block.mix[0][i]),Math.abs(block.mix[1][i])),k=peak>env?a:r;env=peak+(env-peak)*k;
        var db=20*Math.log(Math.max(1e-9,env))/Math.LN10,reduction=Math.max(0,db-cfg.thresholdDb)*(1-1/Math.max(1,cfg.ratio)),gain=Math.pow(10,(cfg.makeupDb-reduction)/20);
        block.mix[0][i]*=gain;block.mix[1][i]*=gain;
        for(var row=0;row<rows.length;row++){rows[row][0][i]*=gain;rows[row][1][i]*=gain;}
    }
    memory.envelope=env;return block;
}
var collageOutputSound=sound;sound=function(e){var s=collageOutputSound(e);if(e.collagePan!==undefined)s.pan=clamp(e.collagePan,-1,1);return s;};
var collageOutputDecorate=collageDecorate;collageDecorate=function(base){var out=collageOutputDecorate(base),c=state.collage;for(var i=0;i<out.length;i++){var e=out[i];if(!e.collage||!collageEligible(e))continue;var l=collageLane(e.role),rnd=collageRandom(collageSeed(c.seeds.motion,e.role,e.collageOrdinal||i));e.collagePan=clamp((l.pan||0)+(rnd()-.5)*2*(c.stereoSpread===undefined?.35:c.stereoSpread),-1,1);}return out;};
var collageOutputRenderStart=collageRenderStart;collageRenderStart=function(path,stems){var yes=collageOutputRenderStart(path,stems);if(yes&&collageExportJob)collageExportJob.outputDynamics=copy(collageDynamicsSettings());return yes;};
var collageOutputRenderBlock=collageRenderBlock;collageRenderBlock=function(job,start,count){var block=collageOutputRenderBlock(job,start,count);if(!start)job.dynamicMemory={envelope:0};return collageCompressBlock(block,job.outputDynamics||collageDynamicsSettings(),job.dynamicMemory||(job.dynamicMemory={envelope:0}),44100);};
var collageOutputStop=stop;stop=function(){collageOutputStop();try{var obj=this.patcher.parentpatcher.getnamed('recastOutputDynamics');if(obj)obj.message('detector',0);}catch(err){}};
var collageOutputRestore=restoreArchives;restoreArchives=function(){collageOutputRestore();collageSendDynamics();};
var collageOutputLoad=loadbang,collageOutputTask=null;loadbang=function(){collageOutputLoad();if(collageOutputTask)collageOutputTask.cancel();collageOutputTask=new Task(function(){collageSendDynamics();},this);collageOutputTask.schedule(1400);};
var collageOutputDelete=notifydeleted;notifydeleted=function(){if(collageOutputTask)collageOutputTask.cancel();collageOutputDelete();};
function collageFormatControl(s,v){if(s.field.indexOf('dyn')===0){if(s.field==='dynRatio')return v.toFixed(1)+':1';if(/Ms$/.test(s.field))return Math.round(v)+' ms';return v.toFixed(1)+' dB';}if(s.field==='lanePan')return v===0?'Centre':Math.round(Math.abs(v)*100)+'% '+(v<0?'L':'R');return s.max>2?Math.round(v)+' ms':Math.round(v*100)+'%';}
var collageOutputSliders=collageSliders;collageSliders=function(){
    if(view===27&&collageSection==='output')return [{field:'dynThresholdDb',label:'Threshold',x:30,y:180,min:-48,max:0},{field:'dynRatio',label:'Ratio',x:585,y:180,min:1,max:20},{field:'dynAttackMs',label:'Attack',x:30,y:310,min:.1,max:100},{field:'dynReleaseMs',label:'Release',x:585,y:310,min:10,max:1000},{field:'dynMakeupDb',label:'Makeup gain',x:30,y:440,min:-12,max:12}];
    var rows=collageOutputSliders();if(view===27&&collageSection==='structure')rows=rows.concat([{field:'lanePan',label:'Selected layer stereo balance',x:30,y:430,min:-1,max:1},{field:'stereoSpread',label:'Random fragment stereo spread',x:585,y:430,min:0,max:1}]);return rows;
};
function collageDynamicsField(field){return field.slice(3,4).toLowerCase()+field.slice(4);}
var collageOutputValue=collageControlValue;collageControlValue=function(s){if(s.field.indexOf('dyn')===0)return collageDynamicsSettings()[collageDynamicsField(s.field)];if(s.field==='lanePan')return collageLane(collageSelectedLane).pan||0;if(s.field==='stereoSpread'&&state.collage.stereoSpread===undefined)return .35;return collageOutputValue(s);};
var collageOutputSet=collageSetControl;collageSetControl=function(s,x){var v=s.min+clamp((x-s.x)/390,0,1)*(s.max-s.min);if(s.field.indexOf('dyn')===0){collageDynamicsSettings()[collageDynamicsField(s.field)]=v;collageSendDynamics();redraw();return;}if(s.field==='lanePan'){collageLane(collageSelectedLane).pan=v;redraw();return;}collageOutputSet(s,x);};
var collageOutputPaint=paint;paint=function(){collageOutputPaint();if(view===27&&!collageMenu){rawDraw=true;if(collageSection==='output'){rect(20,770,1040,35,[.07,.085,.1,1]);text('Output compression changes apply immediately. Exports use these same settings.',30,790,12,[.6,.7,.72,1]);button('collageDynamicsToggle','Compressor: '+(collageDynamicsSettings().enabled?'On':'Off'),30,570,390,collageDynamicsSettings().enabled);text('Stereo-linked envelope compression. Changes affect live output and loop / stem exports.',30,680,13);text('Stem exports share the full mix’s gain envelope, so they still add back together.',30,715,13);}rawDraw=false;}};
var collageOutputAction=action;action=function(id){if(id==='collageDynamicsToggle'){saveundo();collageDynamicsSettings().enabled=!collageDynamicsSettings().enabled;collageSendDynamics();redraw();return;}collageOutputAction(id);};
