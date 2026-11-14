// Local library draw: user-selected roots only; incremental scanning and cancellable loading.
var collageLibraryFiles=[],collageLibraryKey='',collageLibraryScan=null,collageLibraryQueue=[];
var collageLibraryVisited={},collageLibraryFolder=null,collageLibraryDepth=0,collageLibraryPath='';
var collageFolderIntent='',collageLibraryPending=false;
function collageAudioFile(path){return /\.(wav|aiff?|mp3|flac|ogg|m4a|aac|caf)$/i.test(path);}
var collageSourceArchive=archivePath;
function collageSourceBuffer(path){var at=state.archivePaths.indexOf(path);return at>=0&&buffer(at+7).framecount()>0?at+7:collageSourceArchive(path);}
// Source decoding is cached; changing cut boundaries must not reload whole recordings.
archivePath=function(path){if(state.collage&&state.collage.enabled&&collageAudioFile(path))return collageSourceBuffer(path);return collageSourceArchive(path);};
var collageLibraryReadBefore=browserRead;
browserRead=function(path){
    if(collageBrowserRole<0)return collageLibraryReadBefore(path);
    var out=[],f=null;try{f=new Folder(path);while(!f.end&&out.length<20000){var n=f.filename;if(n&&n.charAt(0)!=='.'&&(f.filetype==='fold'||collageAudioFile(n)))out.push({path:browserJoin(path,n),name:n,folder:f.filetype==='fold'});f.next();}}
    finally{if(f)f.close();}
    return out.sort(function(a,b){return a.folder!==b.folder?(a.folder?-1:1):a.name.toLowerCase()<b.name.toLowerCase()?-1:1;});
};
function collageLibraryCancel(){if(collageLibraryScan)collageLibraryScan.cancel();if(collageLibraryFolder)collageLibraryFolder.close();collageLibraryFolder=null;collageLibraryScan=null;collageLibraryPending=false;}
function collageLibraryRoots(){var c=state.collage;if(!c.libraryRoots)c.libraryRoots=[];if(!c.libraryRoots.length&&state.sampleBrowser.root)c.libraryRoots=[state.sampleBrowser.root];return c.libraryRoots;}
function collageLibraryIndex(done){
    collageLibraryCancel();var roots=collageLibraryScanRoots();collageLibraryKey='';collageLibraryFiles=[];collageLibraryVisited={};collageLibraryQueue=roots.map(function(p){return {path:p,depth:0};});
    collageLibraryPending=true;collageLibraryScan=new Task(function(){
        try{
            var steps=0;while(steps++<100&&collageLibraryFiles.length<50000){
                if(!collageLibraryFolder){if(!collageLibraryQueue.length)break;var next=collageLibraryQueue.shift();if(collageLibraryVisited[next.path])continue;collageLibraryVisited[next.path]=true;collageLibraryFolder=new Folder(next.path);collageLibraryPath=next.path;collageLibraryDepth=next.depth;}
                if(collageLibraryFolder.end){collageLibraryFolder.close();collageLibraryFolder=null;continue;}
                var n=collageLibraryFolder.filename,p=browserJoin(collageLibraryPath,n);
                if(n&&n.charAt(0)!=='.'){
                    if(collageLibraryFolder.filetype==='fold'&&collageLibraryDepth<16&&collageLibraryQueue.length<5000)collageLibraryQueue.push({path:p,depth:collageLibraryDepth+1});
                    else if(collageAudioFile(n))collageLibraryFiles.push(p);
                }
                collageLibraryFolder.next();
            }
            status='Indexing local library · '+collageLibraryFiles.length+' audio files';mgraphics.redraw();
            if(collageLibraryFiles.length>=50000||!collageLibraryFolder&&!collageLibraryQueue.length){if(collageLibraryFolder)collageLibraryFolder.close();collageLibraryFolder=null;collageLibraryScan=null;collageLibraryPending=false;collageLibraryKey=JSON.stringify(roots);done();}
            else collageLibraryScan.schedule(4);
        }catch(err){collageLibraryCancel();say('Library: '+err.message);}
    },this);collageLibraryScan.schedule(1);
}
collageDrawLibrary=function(singleRole,preview){
    var single=typeof singleRole==='number'&&singleRole>=0&&singleRole<roles.length;
    var roots=collageLibraryScanRoots();if(!roots.length){say('Choose a local sample or music folder first.');action('collageLibraryRoot');return;}
    if(collageLibraryPending){say('Indexing your library. Stop cancels; drawing starts when ready.');return;}
    if(collageLibraryKey!==JSON.stringify(roots)){collageLibraryIndex(function(){collageDrawLibrary(single?singleRole:undefined,preview);});return;}
    if(!collageLibraryFiles.length){say('No supported audio files found in these library folders.');return;}
    var resume=playing,count=single?1:state.collage.libraryDrawCount||roles.length;if(count>roles.length)collageEnsureRole(Math.min(23,count-1));var working=state,drawState=copy(state);drawState.archivePaths=state.archivePaths;var workingEvents=state.events;var revision=typeof refineRevision==='function'?refineRevision():'',c=drawState.collage;try{state=drawState;collageNextSeed('order');}finally{state=working;}
    var at=0,targets=[],used={},recent=(c.libraryRecent||[]).slice(),pending=null;
    for(var r=0;r<roles.length;r++)if((!single||r===singleRole)&&!collageLane(r).locked&&!collageLane(r).soundLocked&&!state.roleLocks[r]&&targets.length<count)targets.push(r);
    if(!targets.length){say('Release Keep sound or unlock the layer before drawing new sounds.');return;}
    for(var i=0;i<roles.length;i++)for(var j=0;j<collageLane(i).sources.length;j++)used[collageLane(i).sources[j]]=true;
    var failures=[],loadedRoles=[],relaxed=0,copies=0;
    collageJob=new Task(function(){
        var live=state;try{
            if(live!==working||live.events!==workingEvents){collageCopyClose();collageJob=null;say('Sound draw cancelled because the working phrase changed.');return;}state=drawState;
            if(at>=targets.length){
                state=working;if(typeof refineRevision==='function'&&refineRevision()!==revision){collageCopyClose();collageJob=null;say('Sound draw cancelled because settings changed.');return;}state=drawState;
                collageCopyClose();collageJob=null;c.libraryRecent=recent.slice(-256);c.lastDrawReport={total:targets.length,matched:loadedRoles.length,failed:failures.slice(),copies:copies,reused:relaxed};
                if(!loadedRoles.length){state=working;state.collage.lastDrawReport=c.lastDrawReport;say('No new matching sounds. Kept the phrase. Try Anything or widen the duration filter.');return;}
                var drawMode=(single||c.drawPreserveRhythm!==false)&&state.events.length?'order':'phrase';
                if(typeof refineGenerate==='function'){state=working;saveundo();refineGenerate(drawMode,resume,{kind:'draw',roles:loadedRoles.slice(),wbKind:preview?'audition':'draw'},true,drawState);}
                else{var savedUndo=saveundo;saveundo=function(){};try{collageGenerate(drawMode,resume);}finally{saveundo=savedUndo;}}
                if(failures.length)say('Kept layers '+failures.join(', ')+': no unused matching sounds. Skipped '+copies+' copied file(s).');
                else if(relaxed||copies)say('New sounds drawn · '+copies+' copied file(s) skipped · '+relaxed+' recent reuse(s).');return;
            }
            if(!pending){var nextRole=targets[at];pending={role:nextRole,bag:collageLibraryCandidates(nextRole,used,recent),cursor:0,candidate:null};}
            var role=pending.role,lane=collageLane(role),loaded=false;
            if(!pending.candidate&&pending.cursor<pending.bag.length){
                var path=pending.bag[pending.cursor++],meta=collageLibraryMetadata(path);
                if(meta.seconds===undefined||collageLibraryDurationOK(meta.seconds,nextRole))pending.candidate={path:path,copy:collageCopyBegin(path,used)};
            }
            var candidate=pending.candidate;
            if(candidate&&collageCopyStep(candidate.copy)){
                var path=candidate.path;
                if(candidate.copy.duplicate)copies++;
                else{
                    var priorIndex=state.archivePaths.indexOf(path),wasDecoded=priorIndex>=0&&buffer(priorIndex+7).framecount()>0,index=-1;
                    try{
                        index=collageSourceBuffer(path);
                        if(buffer(index).framecount()>0&&collageLibraryDurationOK(buffer(index).length()/1000,role)&&collageCharacterMatches(path,index,lane.libraryCharacter)){
                            if(recent.indexOf(path)>=0)relaxed++;lane.sources=[path];lane.cuts=[];lane.dirty=true;lane.ignoreKit=true;loaded=true;loadedRoles.push(role);used[path]=true;
                            recent=recent.filter(function(p){return p!==path;});recent.push(path);
                        }
                    }catch(err){}
                    if(!loaded&&!wasDecoded&&index>=7&&archivedObjects[index-7]){this.patcher.parentpatcher.remove(archivedObjects[index-7]);archivedObjects[index-7]=null;}
                }
                collageCopyClose();pending.candidate=null;
            }
            if(loaded||!pending.candidate&&pending.cursor>=pending.bag.length){if(!loaded)failures.push(role+1);at++;pending=null;}
            status='Drawing layer '+(role+1)+' · '+at+' / '+targets.length+' · '+copies+' copies skipped';mgraphics.redraw();collageJob.schedule(4);
        }catch(err){state=live;collageCopyClose();collageJob=null;say('Library draw: '+err.message);}finally{state=live;}
    },this);say(single?'Finding a new sound for layer '+(singleRole+1)+'…':'Finding new library sounds…');collageJob.schedule(1);
};
var collageLibraryExportFolder=exportfolder;
exportfolder=function(){if(!collageFolderIntent){collageLibraryExportFolder.apply(this,arguments);return;}var intent=collageFolderIntent;collageFolderIntent='';var path=browserPath(arrayfromargs(arguments).join(' '));if(!path)return;saveundo();var c=state.collage,roots=collageLibraryRoots();c.libraryRoots=intent==='append'?roots.filter(function(p){return p!==path;}).concat([path]):[path];browserSetRoot(path);collageLibraryKey='';view=26;say(c.libraryRoots.length+' local library folder'+(c.libraryRoots.length===1?'':'s')+' selected. New sounds draws from these folders.');};
var collageLibraryAction=action;action=function(id){
    if(id==='collageLibraryRoot'||id==='collageLibraryAdd'){clearPickerIntent();collagePendingRole=-1;collageFolderIntent=id==='collageLibraryAdd'?'append':'replace';outlet(0,'folder');return;}
    if(id==='collageLibraryRefresh'){collageLibraryKey='';say('Library index cleared. New sounds will rescan your folders.');return;}
    if(id!=='collageLibraryDraw')collageFolderIntent='';
    collageLibraryAction(id);
};
var collageLibraryStop=stop;stop=function(){collageLibraryCancel();collageLibraryStop();};
var collageLibraryDelete=notifydeleted;notifydeleted=function(){collageLibraryCancel();collageLibraryDelete();};

// Header inspection is bounded and never decodes the recording. Unknown formats fall back to the decoder.
var collageLibraryMetaCache={};
function collageLibraryMetadata(path){
    if(collageLibraryMetaCache[path])return collageLibraryMetaCache[path];
    var f=null,out={};
    function uint(a,i,big){return big?((a[i]*16777216+a[i+1]*65536+a[i+2]*256+a[i+3])>>>0):((a[i+3]*16777216+a[i+2]*65536+a[i+1]*256+a[i])>>>0);}
    function str(a,i){return String.fromCharCode(a[i],a[i+1],a[i+2],a[i+3]);}
    try{f=new File(path,'read');if(!f.isopen||typeof f.readbytes!=='function')return out;out.bytes=f.eof;
        var h=f.readbytes(12),wav=str(h,0)==='RIFF'&&str(h,8)==='WAVE',aiff=str(h,0)==='FORM'&&(str(h,8)==='AIFF'||str(h,8)==='AIFC');
        if(wav||aiff){var pos=12,rate=0,data=0;
            for(var n=0;n<128&&pos+8<=f.eof;n++){f.position=pos;var chunk=f.readbytes(8),len=uint(chunk,4,aiff),id=str(chunk,0);if(len>f.eof-pos-8)break;
                if(wav&&id==='fmt '&&len>=16){var fmt=f.readbytes(16);rate=uint(fmt,8,false);out.channels=fmt[2]+fmt[3]*256;out.sampleRate=uint(fmt,4,false);}
                if(wav&&id==='data')data=len;
                if(aiff&&id==='COMM'&&len>=18){var comm=f.readbytes(18),ex=((comm[8]&127)*256+comm[9])-16383,man=uint(comm,10,true)+uint(comm,14,true)/4294967296;var sr=man*Math.pow(2,ex-31);if(sr>0&&isFinite(sr)){out.sampleRate=sr;out.channels=comm[0]*256+comm[1];out.seconds=uint(comm,2,true)/sr;}}
                if(rate&&data){out.seconds=data/rate;break;}pos+=8+len+(len%2);
            }
        }
    }catch(err){}finally{if(f)f.close();}
    if(Object.keys(collageLibraryMetaCache).length>=4096)collageLibraryMetaCache={};collageLibraryMetaCache[path]=out;return out;
}
function collageLibraryDurationOK(seconds,role){var c=state.collage,l=typeof role==='number'?collageLane(role):{},lo=l.libraryMinSeconds,hi=l.libraryMaxSeconds;if(lo!==undefined&&seconds<lo||hi!==undefined&&seconds>hi)return false;return !c.libraryDurationFilter||(seconds>=(c.libraryMinSeconds===undefined?.3:c.libraryMinSeconds)&&seconds<=(c.libraryMaxSeconds===undefined?30:c.libraryMaxSeconds));}
function collageLibraryScanRoots(){var roots=collageLibraryRoots().slice();for(var i=0;i<roles.length;i++){var p=collageLane(i).libraryRoot;if(p&&roots.indexOf(p)<0)roots.push(p);}return roots;}
var collageLibraryTypes=['any','impact','mechanical','voice','texture','bass','drums'];
function collageLibraryMatches(path,type){
    if(!type||type==='any')return true;
    var patterns={impact:/impact|boom|slam|hit|crash|thud|door|explosion|kick/i,mechanical:/mechan|machine|robot|gear|relay|motor|metal|industrial|engine|clank/i,voice:/vocal|voice|speech|whisper|breath|moan|talk|chant|scream/i,texture:/texture|drone|ambient|noise|wind|rain|atmos|sustain|pad/i,bass:/bass|sub|808|low|boom|kick/i,drums:/drum|kick|snare|hat|clap|cymbal|tom|perc|break/i};
    var name=path.split('/').pop();if(!patterns[type])return true;if(patterns[type].test(name))return true;for(var key in patterns)if(patterns[key].test(name))return false;return patterns[type].test(path);
}
function collageLibraryCandidates(role,used,recent){
    var lane=collageLane(role),root=lane.libraryRoot,type=lane.libraryType||'any';
    var pool=collageLibraryFiles.filter(function(p){return (!root||p.indexOf(root.replace(/\/$/,'')+'/')===0)&&collageLibraryMatches(p,type);});
    pool=collageShuffle(pool,collageRandom(state.collage.seeds.order+role*7919));var fresh=[],old=[],current=[];
    for(var i=0;i<pool.length;i++){var p=pool[i];if(used[p])current.push(p);else if(recent.indexOf(p)>=0)old.push(p);else fresh.push(p);}
    // Never reuse an active recording across layers. Recent history relaxes only after unused choices.
    return fresh.concat(old);
}
