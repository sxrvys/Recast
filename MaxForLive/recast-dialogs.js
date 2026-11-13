// A canceled native picker has no result callback. Each new intent must supersede it.
function clearPickerIntent(){folderPurpose='';toolPurpose='';handoffFolder='';}
var dialogAction=action;
action=function(id){if(/^(pad[0-5]|folderRole[0-5]|save|open|bounce|source|candidatefolder|indexlibrary|collectsession|rolesexport|export|relinksource|roleKitExport|drumRackKitExport|detailedExport)$/.test(id))clearPickerIntent();if(/^(bounce|detailedExport|rolesexport|roleKitExport|drumRackKitExport)$/.test(id)){if(!state.events.length){say('Generate a groove first.');return;}var missing=missingRoles();if(missing.length){say('Assign sounds before audio export: '+missing.join(', '));return;}}dialogAction(id);};
var dialogDrop=drop;drop=function(){clearPickerIntent();dialogDrop.apply(this,arguments);};
// Reference-waveform drop targets belong to the retired extraction workflow.
// Leaving them over the generator can steal drops from controls and kit slots.
var instrumentOnlyDrops=simpleDrops;
simpleDrops=function(){instrumentOnlyDrops();var names=['dropLoop','dropWave'];for(var i=0;i<names.length;i++){var obj=this.patcher.getnamed(names[i]);if(obj)obj.hidden=1;}};
// A role replacement must update the saved generation bases as well as today's events.
// Otherwise applying feel can silently bring back the previous keeper's audio.
var roleReplaceFile=file;
file=function(){var args=arrayfromargs(arguments),path=args.join(' '),slot=pending,isReplacement=slot>0&&slot<=6&&toolPurpose!=='relink'&&/\.(wav|aif|aiff)$/i.test(path);roleReplaceFile.apply(this,arguments);if(!isReplacement||state.paths[slot]!==path)return;var role=slot-1,preserved={};for(var i=0;i<state.events.length;i++)if(state.events[i].role===role&&protectedHit(state.events[i])&&state.events[i].source)preserved[state.events[i].id]=copy(state.events[i].source);var lists=[state.events,state.original,state.feelBase||[]];for(var n=0;n<lists.length;n++)for(var j=0;j<lists[n].length;j++){var e=lists[n][j];if(e.role!==role)continue;if(protectedHit(e)){if(preserved[e.id])e.source=copy(preserved[e.id]);}else{delete e.source;delete e.frozen;}}state.mode=0;redraw();};
var clearRoleAction=action;action=function(id){clearRoleAction(id);if(id!=='clearrole')return;var role=state.pad,lists=[state.events,state.original,state.feelBase||[]];for(var n=0;n<lists.length;n++)for(var i=0;i<lists[n].length;i++){var e=lists[n][i];if(e.role===role&&!protectedHit(e)){delete e.source;delete e.frozen;}}redraw();};
