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
    collageLibraryCancel();var roots=collageLibraryRoots();collageLibraryKey='';collageLibraryFiles=[];collageLibraryVisited={};collageLibraryQueue=roots.map(function(p){return {path:p,depth:0};});
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
collageDrawLibrary=function(){
    var roots=collageLibraryRoots();if(!roots.length){say('Choose a local sample or music folder first.');action('collageLibraryRoot');return;}
    if(collageLibraryPending){say('Indexing your library. Stop cancels; drawing starts when ready.');return;}
    if(collageLibraryKey!==JSON.stringify(roots)){collageLibraryIndex(collageDrawLibrary);return;}
    if(!collageLibraryFiles.length){say('No supported audio files found in these library folders.');return;}
    var resume=playing,c=state.collage;stop();saveundo();collageNextSeed('order');
    var bag=collageShuffle(collageLibraryFiles,collageRandom(c.seeds.order)),at=0,draw=0,targets=[];
    for(var r=0;r<roles.length;r++)if(!collageLane(r).locked&&!state.roleLocks[r])targets.push(r);
    if(!targets.length){say('Unlock a layer before drawing new sounds.');return;}
    collageJob=new Task(function(){
        if(at>=targets.length){collageJob=null;var savedUndo=saveundo;saveundo=function(){};try{collageGenerate('phrase',resume);}finally{saveundo=savedUndo;}return;}
        var role=targets[at++],lane=collageLane(role),loaded=false;
        for(var attempt=0;attempt<Math.min(8,bag.length);attempt++){
            var path=bag[(draw++)%bag.length];
            try{var index=collageSourceBuffer(path);if(buffer(index).framecount()>0){lane.sources=[path];lane.cuts=[];lane.dirty=true;lane.ignoreKit=true;loaded=true;break;}}catch(err){}
        }
        status=(loaded?'Loaded':'Skipped unreadable files for')+' layer '+(role+1)+' / '+targets.length;mgraphics.redraw();collageJob.schedule(4);
    },this);collageJob.schedule(1);
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
