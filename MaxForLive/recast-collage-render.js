// Chunked stereo rendering: one frozen event list, one gain for mix and every layer.
var collageExportJob=null,collageExportIntent='',collageExportLast=null;
function collageWavHeader(file,frames){file.position=0;file.writebytes(bytestring('RIFF').concat(le(36+frames*4,4),bytestring('WAVEfmt '),le(16,4),le(1,2),le(2,2),le(44100,4),le(176400,4),le(4,2),le(16,2),bytestring('data'),le(frames*4,4)));}
function collageWavBytes(left,right,gain){var out=[];for(var i=0;i<left.length;i++)for(var ch=0;ch<2;ch++){var value=Math.round(clamp((ch?right[i]:left[i])*gain,-1,1)*32767);out.push(value&255,(value>>8)&255);}return out;}
function collageRenderBlock(job,start,count) {
    var layers={},mix=[[],[]];for(var ch=0;ch<2;ch++)for(var i=0;i<count;i++)mix[ch][i]=0;
    for(var r=0;r<job.layers.length;r++){var pcm=[[],[]];for(var ch=0;ch<2;ch++)for(var i=0;i<count;i++)pcm[ch][i]=0;layers[job.layers[r]]=pcm;}
    for(var n=0;n<job.sounds.length;n++){
        var d=job.sounds[n],from=Math.max(start,d.offset),to=Math.min(start+count,d.offset+d.length,job.frames);if(to<=from)continue;
        var first=from-d.offset,last=to-d.offset-1,s=d.sound,b=buffer(s.index),a=(s.a+(s.z-s.a)*first/d.length)*d.native/1000,z=(s.a+(s.z-s.a)*last/d.length)*d.native/1000;
        var range=audioRange(b,Math.min(a,z)*1000/d.native,Math.max(a,z)*1000/d.native,d.native),dest=layers[d.role];
        for(var k=from;k<to;k++){
            var p=k-d.offset,pos=(s.a+(s.z-s.a)*p/d.length)*d.native/1000,ix=Math.floor(pos),frac=pos-ix,env=Math.min(1,p/88,(d.length-1-p)/88)*s.gain;
            for(var ch=1;ch<=2;ch++){var value=(rangeSample(range,ch,ix)*(1-frac)+rangeSample(range,ch,ix+1)*frac)*env;value*=collagePanGains(s.pan||0)[ch-1];dest[ch-1][k-start]+=value;mix[ch-1][k-start]+=value;}
        }
    }
    return {layers:layers,mix:mix};
}
function collageExportManifest(job,complete,error) {
    if(!job.manifestPath)return;
    var data={complete:complete,error:error||null,sampleRate:44100,bitDepth:16,channels:2,tempo:job.tempo,bars:job.bars,frames:complete?job.frames:job.written,sharedGain:job.gain,outputDynamics:job.outputDynamics||null,mix:job.mixName,layers:job.layerFiles.map(function(row){return {layer:row.role+1,file:row.name};}),processing:'Recast processing included. Downstream Live effects are not included.',tails:'Exact loop length; tails beyond the end are truncated.'};
    var file=new File(job.manifestPath,'write');if(file.isopen){file.eof=0;file.writestring(JSON.stringify(data));file.close();}
}
function collageExportClose(job,cancelled,error){
    for(var i=0;i<job.files.length;i++){try{if(cancelled){collageWavHeader(job.files[i].file,job.written);job.files[i].file.eof=44+job.written*4;}job.files[i].file.close();}catch(err){}}
    collageExportManifest(job,!cancelled,error);collageExportLast={ok:!cancelled,frames:job.written,gain:job.gain,path:job.path,layers:job.layers.length,error:error||null};
    if(job.task)job.task.cancel();collageExportJob=null;
    say(cancelled?'Export stopped. Partial WAVs remain in the chosen destination.':'Exported '+(job.stems?job.layers.length+' aligned layer stems + full loop':'full stereo loop')+' · 16-bit / 44.1 kHz.');
}
function collageRenderStart(path,stems) {
    if(collageExportJob){say('An export is already running. Stop cancels it.');return false;}
    var events=copy(auditionEvents());if(!events.length){say('This take has no audible events. Adjust mute/probability or generate a phrase.');return false;}
    stop();var tag='Recast-'+Date.now(),job={events:events,sounds:[],layers:[],files:[],layerFiles:[],path:path,stems:stems,tempo:state.tempo,bars:state.bars,frames:Math.ceil(beats()*60/state.tempo*44100),position:0,written:0,phase:'prepare',peak:0,gain:1,index:0};
    if(stems){job.layers=collageActiveRoles();job.mixName=tag+'-Mix.wav';job.mixPath=path+'/'+job.mixName;job.manifestPath=path+'/'+tag+'-Export.json';for(var r=0;r<job.layers.length;r++){var role=job.layers[r],name=tag+'-Layer-'+('0'+(role+1)).slice(-2)+'.wav';job.layerFiles.push({role:role,name:name,path:path+'/'+name});}}
    else job.mixPath=path;
    for(var i=0;i<events.length;i++)if(job.layers.indexOf(events[i].role)<0)job.layers.push(events[i].role);
    if(stems)for(var i=0;i<job.layers.length;i++)if(!job.layerFiles.some(function(row){return row.role===job.layers[i];})){var role=job.layers[i],name=tag+'-Layer-'+('0'+(role+1)).slice(-2)+'.wav';job.layerFiles.push({role:role,name:name,path:path+'/'+name});}
    collageExportJob=job;
    job.task=new Task(function(){
        var previous=renderEventContext;renderEventContext=job.events;
        try{
            if(job.phase==='prepare'){
                if(job.index<job.events.length){var e=job.events[job.index++],s=typeof mxExportSound==='function'?mxExportSound(e,sound(e)):copy(sound(e)),b=buffer(s.index);job.sounds.push({role:e.role,sound:s,native:b.framecount()*1000/b.length(),offset:Math.round(e.beat*60/job.tempo*44100),length:Math.max(1,Math.round(s.dur*44.1))});}
                else{job.phase='measure';job.position=0;}
            }else {
                var count=Math.min(4096,job.frames-job.position),block=collageRenderBlock(job,job.position,count);
                if(job.phase==='measure'){
                    for(var ch=0;ch<2;ch++)for(var i=0;i<count;i++)job.peak=Math.max(job.peak,Math.abs(block.mix[ch][i]));
                    for(var r=0;r<job.layers.length;r++)for(var ch=0;ch<2;ch++)for(var i=0;i<count;i++)job.peak=Math.max(job.peak,Math.abs(block.layers[job.layers[r]][ch][i]));
                }else{
                    for(var f=0;f<job.files.length;f++){var row=job.files[f],pcm=row.role<0?block.mix:block.layers[row.role];row.file.writebytes(collageWavBytes(pcm[0],pcm[1],job.gain));}job.written+=count;
                }
                job.position+=count;
                if(job.position>=job.frames){
                    if(job.phase==='measure'){
                        job.gain=job.peak>.98?.98/job.peak:1;var destinations=[{role:-1,path:job.mixPath}].concat(job.layerFiles);
                        for(var f=0;f<destinations.length;f++){var row=destinations[f],file=new File(row.path,'write');if(!file.isopen)throw Error('Cannot write '+shortName(row.path));file.eof=0;collageWavHeader(file,job.frames);job.files.push({role:row.role,file:file});}job.position=0;job.phase='write';
                    }else{collageExportClose(job,false);return;}
                }
            }
            status='Export: '+job.phase+' '+(job.phase==='prepare'?job.index+' / '+job.events.length:Math.round(job.position/job.frames*100)+'%')+' · Stop cancels';mgraphics.redraw();job.task.schedule(1);
        }catch(err){collageExportClose(job,true,err.message);say('Export: '+err.message+' · partial files may remain.');}
        finally{renderEventContext=previous;}
    },this);job.task.schedule(1);return true;
}
var collageRenderStop=stop;stop=function(){if(collageExportJob)collageExportClose(collageExportJob,true,'Cancelled by user');collageRenderStop();};
var collageRenderBounced=bounced;bounced=function(){if(collageExportIntent==='wav'){collageExportIntent='';collageRenderStart(arrayfromargs(arguments).join(' '),false);return;}collageRenderBounced.apply(this,arguments);};
var collageRenderFolder=exportfolder;exportfolder=function(){if(collageExportIntent==='stems'){collageExportIntent='';collageRenderStart(arrayfromargs(arguments).join(' ').replace(/\/$/,''),true);return;}collageRenderFolder.apply(this,arguments);};
var collageRenderAction=action;action=function(id){
    if(collageExportJob){if(id==='collagePlay'||id==='play'){stop();return;}say('Export is running. Press Stop to cancel before editing.');return;}
    if(id==='collageExport'||id==='collageStems'){clearPickerIntent();if(!state.events.length){say('Generate a phrase first.');return;}collageCommit();collageExportIntent=id==='collageStems'?'stems':'wav';outlet(0,id==='collageStems'?'folder':'bounce');return;}
    collageExportIntent='';collageRenderAction(id);
};
var collageRenderDelete=notifydeleted;notifydeleted=function(){if(collageExportJob)collageExportClose(collageExportJob,true,'Device closed');collageRenderDelete();};

// Render first, then append new audio tracks. Existing tracks and clips are never overwritten.
var collageLiveRequest=null,collageLiveJob=null,collageLiveLast=null;
function collageSendAudioToLive(stems){
    if(collageExportJob||collageLiveJob){say('Finish the current audio transfer first.');return false;}
    if(!state.events.length){say('Generate a phrase first.');return false;}
    try{
        var song=new LiveAPI(null,'live_set'),track=new LiveAPI(null,'this_device canonical_parent');
        if(String(track.info).indexOf('create_audio_clip')<0)throw Error('This Live version does not expose audio-clip insertion. Use Loop WAV / Layer stems and drag the files into Live.');
        var at=Math.max(0,Math.floor(Number(song.get('current_song_time'))/4)*4),tempo=Number(song.get('tempo'));
        collageCommit();var root=defaultRenderDirectory(),path=stems?root:root+'/Recast-Live-'+Date.now()+'.wav';
        if(!collageRenderStart(path,stems))return false;
        collageLiveRequest={position:at,hostTempo:tempo,sourceTempo:state.tempo,stems:!!stems};
        say('Rendering '+(stems?'layer stems':'full loop')+' for new audio tracks in Live…');return true;
    }catch(err){say('Send audio to Live: '+err.message);return false;}
}
function collageLivePath(path){var match=String(path).match(/^([^/:]{2,}):\/(.*)$/);return match?'/Volumes/'+match[1]+'/'+match[2]:path;}
function collageInsertAudio(job,request){
    var rows=request.stems?job.layerFiles:[{role:-1,path:job.mixPath}],at=0,pending=null;
    var report={ok:false,position:request.position,sourceTempo:request.sourceTempo,hostTempo:request.hostTempo,tracks:[],files:rows.map(function(r){return r.path;})};collageLiveLast=report;
    collageLiveJob=new Task(function(){
        try{
            var song=new LiveAPI(null,'live_set'),row=rows[at],index=song.get('tracks').length/2,name=row.role<0?'Recast loop':'Recast layer '+(row.role+1);
            if(!pending){song.call('create_audio_track',-1);var track=new LiveAPI(null,'live_set tracks '+index);report.tracks.push({id:Number(track.id),path:track.unquotedpath,file:row.path});track.set('name',name);track.call('create_audio_clip',collageLivePath(row.path),request.position);pending={path:track.unquotedpath,tries:0};collageLiveJob.schedule(20);return;}
            var clip=new LiveAPI(null,pending.path+' arrangement_clips 0');if(!Number(clip.id)){if(++pending.tries<20){collageLiveJob.schedule(20);return;}throw Error('Live did not create the expected audio clip.');}
            clip.set('warping',0);clip.set('looping',0);clip.set('name',name);
            if(Math.abs(Number(clip.get('start_time'))-request.position)>.001)throw Error('Live placed a stem at an unexpected time.');
            pending=null;at++;if(at<rows.length){say('Adding audio tracks · '+at+' / '+rows.length);collageLiveJob.schedule(20);return;}
            collageLiveJob=null;report.ok=true;try{new LiveAPI(null,'live_app view').call('show_view','Arranger');}catch(ignore){}
            say('Added '+rows.length+' audio track'+(rows.length===1?'':'s')+' at bar '+(request.position/4+1)+' · WAV timing retained'+(Math.abs(request.hostTempo-request.sourceTempo)>.01?' · Live / Recast BPM differ':''));
        }catch(err){collageLiveJob=null;report.error=err.message;say('Audio transfer: '+err.message+' Rendered WAVs remain in '+job.path);}
    },this);collageLiveJob.schedule(1);
}
var collageLiveClose=collageExportClose;collageExportClose=function(job,cancelled,error){var request=collageLiveRequest;collageLiveRequest=null;collageLiveClose(job,cancelled,error);if(request&&!cancelled&&!error)collageInsertAudio(job,request);};
var collageLiveStop=stop;stop=function(){if(collageLiveJob){collageLiveJob.cancel();collageLiveJob=null;if(collageLiveLast)collageLiveLast.error='Transfer stopped; already-created tracks and WAVs retained.';}collageLiveStop();};
var collageLiveDelete=notifydeleted;notifydeleted=function(){if(collageLiveJob)collageLiveJob.cancel();collageLiveJob=null;collageLiveDelete();};
