// Local, bounded audio descriptors and cancellable byte-for-byte copy checks.
// These describe physical sound characteristics, not semantic classes such as speech.
var collageCharacterCache={},collageCopyCache={},collageCopyActive=null;
var collageCharacters=['any','low','bright','transient','sustained','rough'];
function collageSoundCharacter(path,index){
    var b=buffer(index),frames=b.framecount(),duration=b.length(),channels=Math.min(2,b.channelcount()),key=JSON.stringify([path,frames,duration]);
    if(collageCharacterCache[key])return collageCharacterCache[key];
    if(!frames||!duration||!channels)return {available:false};
    var rate=frames*1000/duration,alpha=1-Math.exp(-2*Math.PI*180/rate),sum=0,low=0,diff=0,peak=0,count=0,windows=[];
    var size=Math.min(1024,frames),steps=Math.min(24,Math.max(1,Math.ceil(frames/size)));
    for(var w=0;w<steps;w++){
        var start=Math.floor((frames-size)*w/Math.max(1,steps-1)),energy=0,windowCount=0;
        for(var ch=1;ch<=channels;ch++){
            var samples=b.peek(ch,start,size),lp=0,previous=0;
            if(typeof samples==='number')samples=[samples];
            for(var i=0;i<samples.length;i++){
                var x=samples[i];if(!isFinite(x))continue;
                lp+=alpha*(x-lp);sum+=x*x;energy+=x*x;peak=Math.max(peak,Math.abs(x));count++;windowCount++;
                if(i>255){low+=lp*lp;diff+=(x-previous)*(x-previous);}previous=x;
            }
        }
        windows.push(Math.sqrt(energy/Math.max(1,windowCount)));
    }
    var rms=Math.sqrt(sum/Math.max(1,count)),max=0,active=0;for(var i=0;i<windows.length;i++)max=Math.max(max,windows[i]);for(var i=0;i<windows.length;i++)if(windows[i]>max*.15&&windows[i]>1e-5)active++;
    var evidence=Math.max(1,count-steps*channels*Math.min(256,size)),mean=sum/Math.max(1,count),bass=low/evidence/Math.max(1e-12,mean),brightness=diff/evidence/Math.max(1e-12,mean),crest=peak/Math.max(1e-12,rms),occupancy=active/Math.max(1,windows.length),tags=[];
    if(rms>1e-5){if(bass>.5)tags.push('low');if(brightness>.35)tags.push('bright');if(crest>3.5||occupancy<.5)tags.push('transient');if(crest<3.5&&occupancy>.65)tags.push('sustained');if(brightness>.8&&crest>2)tags.push('rough');}
    var result={available:true,rms:rms,peak:peak,lowRatio:bass,brightness:brightness,crest:crest,occupancy:occupancy,tags:tags};
    if(Object.keys(collageCharacterCache).length>=256)collageCharacterCache={};collageCharacterCache[key]=result;return result;
}
function collageCharacterMatches(path,index,type){if(!type||type==='any')return true;var result=collageSoundCharacter(path,index);return result.available&&result.tags.indexOf(type)>=0;}
function collageCopyClose(){if(collageCopyActive){if(collageCopyActive.a)collageCopyActive.a.close();if(collageCopyActive.b)collageCopyActive.b.close();}collageCopyActive=null;}
function collageCopyBegin(path,used){
    collageCopyClose();var bytes=collageLibraryMetadata(path).bytes,refs=[];
    if(state.collage.avoidCopies!==false&&bytes>0)for(var p in used)if(used.hasOwnProperty(p)&&used[p]&&p!==path&&collageLibraryMetadata(p).bytes===bytes)refs.push(p);
    var check={path:path,bytes:bytes,refs:refs,at:0,a:null,b:null,done:!refs.length,duplicate:false};collageCopyActive=check;return check;
}
function collageCopyStep(check){
    if(check.done)return true;
    var other=check.refs[check.at],key=JSON.stringify([check.path,other,check.bytes]);
    function finishPair(identical){if(check.a)check.a.close();if(check.b)check.b.close();check.a=check.b=null;if(Object.keys(collageCopyCache).length>=4096)collageCopyCache={};collageCopyCache[key]=identical;check.at++;if(identical){check.duplicate=true;check.done=true;}else if(check.at>=check.refs.length)check.done=true;}
    if(collageCopyCache.hasOwnProperty(key)){finishPair(collageCopyCache[key]);return check.done;}
    try{
        if(!check.a){check.a=new File(check.path,'read');check.b=new File(other,'read');if(!check.a.isopen||!check.b.isopen||typeof check.a.readbytes!=='function'||typeof check.b.readbytes!=='function'||check.a.eof!==check.bytes||check.b.eof!==check.bytes){finishPair(false);return check.done;}}
        // Max's legacy JS File returns an empty array for a 65536-byte read,
        // even though its position advances. Keep individual reads safely small.
        for(var block=0;block<8&&!check.done;block++){
            var a=check.a.readbytes(4096),b=check.b.readbytes(4096),same=a.length===b.length;
            for(var i=0;same&&i<a.length;i++)if(a[i]!==b[i])same=false;
            if(!same){finishPair(false);break;}
            else if(check.a.position>=check.bytes){finishPair(true);break;}
            else if(!a.length){finishPair(false);break;}
        }
    }catch(err){finishPair(false);}
    return check.done;
}
var collageDiscoveryStop=stop;stop=function(){collageCopyClose();collageDiscoveryStop();};
var collageDiscoveryDelete=notifydeleted;notifydeleted=function(){collageCopyClose();collageDiscoveryDelete();};
