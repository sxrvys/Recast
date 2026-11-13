// A new instance is playable without browsing. Recalled sessions keep their choices.
var starterFiles=['Kick.wav','Snare.wav','Hat.wav','Metal.wav','Relay.wav','Bass.wav'];
var starterOwner=this.patcher,starterRecallReceived=false,starterStarted=false,starterAttempts=0;
function starterFolder(){var p=starterOwner;for(var i=0;p&&i<8;i++,p=p.parentpatcher)if(p.filepath){var path=String(p.filepath).replace(/\\/g,'/').replace(/\/$/,'');if(/\.(amxd|maxpat)$/i.test(path))path=path.slice(0,path.lastIndexOf('/'));if(path){var drive=path.match(/^([^/:]{2,}):(\/.*)$/);if(drive)path=/^\/(Users|Applications|Library|private)\//.test(drive[2])?drive[2]:'/Volumes/'+drive[1]+drive[2];return path+'/Starter Kit';}}return 'Starter Kit';}
function starterPayload(args){try{var v=args[0],s;if(v==='dictionary')s=new Dict(args[1]).stringify();else if(v&&typeof v==='object'){if(typeof v.stringify==='function')s=v.stringify();else if(v.name)s=new Dict(v.name).stringify();else s=JSON.stringify(v);}else s=args.join(' ').replace(/^set /,'');var n=JSON.parse(s);return !!(n.paths&&n.events);}catch(e){return false;}}
var starterRestore=restore;restore=function(){if(!syncingStore&&starterPayload(arrayfromargs(arguments)))starterRecallReceived=true;starterRestore.apply(this,arguments);};
var starterOpened=opened;opened=function(){starterRecallReceived=true;starterOpened.apply(this,arguments);};
function starterPristine(){if(starterRecallReceived||state.starterKitInitialized||state.archivePaths.length)return false;for(var i=0;i<state.paths.length;i++)if(state.paths[i])return false;for(var j=0;j<(state.extraInstruments||[]).length;j++)if(state.extraInstruments[j].path)return false;return true;}
function initializeStarterKit(){
 if(!starterPristine())return false;
 if(!initBuffers()){if(++starterAttempts<10)starterTask.schedule(200);return false;}
 var folder=starterFolder(),paths=[];
 for(var i=0;i<6;i++){var path=folder+'/'+starterFiles[i],f=new File(path,'read');if(!f.isopen){say('Starter kit is missing. Keep the Starter Kit folder beside Recast.amxd, or Browse your own sounds.');return false;}f.close();paths.push(path);}
 state.starterKitInitialized=true;state.starterKitPaths=paths;state.mode=0;
 for(var i=0;i<6;i++){state.paths[i+1]=paths[i];state.padGain[i]=1;state.padPitch[i]=0;starterPending[i+1]=true;buffer(i+1).send('import',paths[i]);}
 say('Starter kit ready. Choose a style, Generate, then Play. Browse replaces any sound.');return true;
}
var starterTask=new Task(initializeStarterKit,this),starterLoad=loadbang;
loadbang=function(){starterLoad();if(!starterStarted){starterStarted=true;starterTask.schedule(900);}};
var starterDeleted=notifydeleted;notifydeleted=function(){starterTask.cancel();starterDeleted();};
var starterSnapshot=musicalSnapshot;musicalSnapshot=function(){var n=starterSnapshot();n.starterKitInitialized=!!state.starterKitInitialized;n.starterKitPaths=copy(state.starterKitPaths||[]);return n;};
// Do not apply candidate-audition normalization to the already balanced starter kit.
var starterPending=[],starterLoaded=loaded;loaded=function(i){starterLoaded(i);if(starterPending[i]){starterPending[i]=false;if(state.starterKitPaths&&state.paths[i]===state.starterKitPaths[i-1]){state.padGain[i-1]=1;redraw();}}};
// Starter assets are relocatable; custom file references are never substituted.
function starterRelocate(n){if(!n.starterKitPaths||n.starterKitPaths.length!==6)return n;var old=n.starterKitPaths.slice(),paths=starterFiles.map(function(name){return starterFolder()+'/'+name;});if(JSON.stringify(old)===JSON.stringify(paths))return n;var f=new File(paths[0],'read');if(!f.isopen)return n;f.close();function walk(value){if(typeof value==='string'){var at=old.indexOf(value);return at>=0?paths[at]:value;}if(value&&typeof value==='object')for(var key in value)if(value.hasOwnProperty(key))value[key]=walk(value[key]);return value;}return walk(n);}
var starterDefaults=defaults;defaults=function(n){return starterDefaults(starterRelocate(n));};
