// Streaming multiband onset analysis. Role labels are suggestions, not source separation.
function bandFilter(rate,freq,q){var w=2*Math.PI*Math.min(freq,rate*.45)/rate,a=Math.sin(w)/(2*q),d=1+a;return {b0:a/d,b2:-a/d,a1:-2*Math.cos(w)/d,a2:(1-a)/d,x1:0,x2:0,y1:0,y2:0};}
function filterSample(f,x){var y=f.b0*x+f.b2*f.x2-f.a1*f.y1-f.a2*f.y2;f.x2=f.x1;f.x1=x;f.y2=f.y1;f.y1=y;return y;}
function RhythmAnalysis(rate){this.rate=rate;this.hop=Math.max(1,Math.round(rate*.005));this.filters=[bandFilter(rate,90,.8),bandFilter(rate,600,.8),bandFilter(rate,2200,.8),bandFilter(rate,7000,.8)];this.rightFilters=[bandFilter(rate,90,.8),bandFilter(rate,600,.8),bandFilter(rate,2200,.8),bandFilter(rate,7000,.8)];this.energy=[0,0,0,0];this.previous=[0,0,0,0];this.frames=[];this.count=0;this.total=0;}
RhythmAnalysis.prototype.feed=function(samples,right){for(var i=0;i<samples.length;i++){var x=samples[i];for(var b=0;b<4;b++){var y=filterSample(this.filters[b],x);if(right){var yr=filterSample(this.rightFilters[b],right[i]||0);this.energy[b]+=(y*y+yr*yr)*.5;}else this.energy[b]+=y*y;}this.count++;this.total++;if(this.count===this.hop){var row={time:(this.total-this.hop)/this.rate,energy:[],rise:[]};for(var k=0;k<4;k++){var value=Math.sqrt(this.energy[k]/this.hop);row.energy[k]=value;row.rise[k]=Math.max(0,value-this.previous[k]);this.previous[k]=value;this.energy[k]=0;}this.frames.push(row);this.count=0;}}};
RhythmAnalysis.prototype.result=function(sensitivity){
 var frames=[],raw=this.frames;
 for(var f=0;f<raw.length;f++){var smoothed={time:raw[f].time,energy:[],rise:[]};for(var bb=0;bb<4;bb++){var sum=0,count=0;for(var ww=Math.max(0,f-2);ww<=f;ww++){sum+=raw[ww].energy[bb];count++;}smoothed.energy[bb]=sum/count;smoothed.rise[bb]=Math.max(0,smoothed.energy[bb]-(f>=2?frames[f-2].energy[bb]:0));}frames.push(smoothed);}
 var peaks=[0,0,0,0],candidates=[],last=[-1,-1,-1,-1],novelty=[],level=[0,0,0,0];
 for(var i=0;i<frames.length;i++)for(var b=0;b<4;b++)peaks[b]=Math.max(peaks[b],frames[i].energy[b]);
 for(var n=0;n<frames.length-2;n++){
  var row=frames[n],nov=0;
  for(var band=0;band<4;band++){
   var mean=0,energy=0,count=0;for(var j=Math.max(0,n-40);j<n;j++){mean+=frames[j].rise[band];energy+=frames[j].energy[band];count++;}mean/=Math.max(1,count);energy/=Math.max(1,count);
   var rise=row.rise[band],threshold=Math.max(peaks[band]*.025,mean*(3.2/(sensitivity||1))),relative=rise/Math.max(peaks[band]*.03,energy);
   nov+=rise/Math.max(1e-6,peaks[band]);
   if(peaks[band]>.0001&&rise>threshold&&relative>.35&&(n===0||rise>=frames[n-1].rise[band])&&rise>frames[n+1].rise[band]&&row.time-last[band]>(band===0?.16:.09)){candidates.push({time:Math.max(0,row.time-.005),band:band,strength:relative*Math.sqrt(row.energy[band]/Math.max(1e-9,row.energy[0]+row.energy[1]+row.energy[2]+row.energy[3])),level:rise/Math.max(1e-6,peaks[band])});last[band]=row.time;}
  }novelty[n]=nov;
 }
 candidates.sort(function(a,b){return a.time-b.time;});var hits=[];
 for(var c=0;c<candidates.length;){var cluster=[candidates[c++]],first=cluster[0].time;while(c<candidates.length&&candidates[c].time-first<.035)cluster.push(candidates[c++]);cluster.sort(function(a,b){return b.strength-a.strength;});var top=cluster[0],role=top.band===0?0:top.band===3?2:top.band===2?1:3;
  // Integrate the attack spectrum; the single sharpest band is not an instrument.
  var spectrum=[0,0,0,0],frameStart=Math.max(0,Math.floor(first/(this.hop/this.rate)));
  for(var sf=frameStart;sf<Math.min(frames.length,frameStart+8);sf++)for(var sb=0;sb<4;sb++)spectrum[sb]+=frames[sf].energy[sb]*frames[sf].energy[sb];
  var spectralTotal=spectrum[0]+spectrum[1]+spectrum[2]+spectrum[3];
  if(spectralTotal>1e-10){if(spectrum[0]/spectralTotal>.65)role=0;else if(spectrum[3]>spectrum[2]*4)role=2;else if(spectrum[2]>spectrum[1]*1.4)role=1;else if(spectrum[1]>spectrum[2])role=3;}
  var confidence=cluster.length===1?.65:Math.min(.9,top.strength/(top.strength+cluster[1].strength));
  hits.push({time:first,role:role,confidence:confidence,velocity:Math.round(clamp(55+60*Math.sqrt(top.level),35,120))});
  // A distinct low-frequency attack can coexist with an upper-band hit.
  if(role!==0)for(var k=1;k<cluster.length;k++)if(cluster[k].band===0&&cluster[k].strength>top.strength*.8&&cluster[k].level>.12){hits.push({time:first,role:0,confidence:.45,velocity:Math.round(clamp(55+60*Math.sqrt(cluster[k].level),35,120))});break;}
 }
 var estimate=estimateRhythmTempo(raw,this.hop/this.rate);
 return {hits:hits,tempo:estimate.tempo,tempoConfidence:estimate.confidence,tempoCandidates:estimate.candidates,frames:frames.length};
};
var analysisTask=null,analysisBusy=false,analysisGeneration=0;
function cancelAnalysis(){analysisGeneration++;analysisBusy=false;if(analysisTask)analysisTask.cancel();}
var analysisStop=stop;stop=function(){cancelAnalysis();analysisStop();};
detect=function(){stop();var buf=buffer(0);if(buf.framecount()<=0||buf.length()<=0){say('Load a reference WAV / AIFF first.');return;}duration=buf.length()/1000;sr=buf.framecount()/duration;var start=state.start,length=regionLength();if(length<.1){say('Reference region is empty. Move its start earlier.');return;}var engine=new RhythmAnalysis(sr),cursor=Math.floor(start*sr),end=Math.min(buf.framecount(),Math.floor((start+length)*sr)),token=++analysisGeneration;analysisBusy=true;say('Extracting rhythm across low, mid and high frequency bands…');analysisTask=new Task(function(){if(token!==analysisGeneration)return;try{var count=Math.min(8192,end-cursor),data=buf.peek(1,cursor,count);if(typeof data==='number')data=[data];var right=null;if(buf.channelcount()>1){right=buf.peek(2,cursor,count);if(typeof right==='number')right=[right];}
 engine.feed(data,right);cursor+=count;if(cursor<end){analysisTask.schedule(1);return;}var result=engine.result(state.sensitivity);saveundo();state.bars=state.sourceBars||state.bars;state.page=0;state.slices=[];state.events=[];for(var h=0;h<result.hits.length&&h<1024;h++){var hit=result.hits[h],beat=hit.time*state.tempo/60;if(beat>=beats())continue;state.slices.push([start+hit.time,Math.min(start+length,start+hit.time+.15)]);state.events.push({id:++uid,slice:state.slices.length-1,role:hit.role,beat:beat,velocity:hit.velocity,pitch:0,reverse:false,locked:false,confidence:hit.confidence});}state.original=copy(state.events);state.ranges=[];state.family=[];state.mode=0;state.tempoSuggestion=result.tempo;state.tempoConfidence=result.tempoConfidence;state.tempoCandidates=result.tempoCandidates;selected=-1;analysisBusy=false;refresh();say(state.events.length+' suggested hits. Check roles with Edit hit. Tempo estimate '+result.tempo+' BPM (half/double may apply); current BPM kept.');}catch(err){analysisBusy=false;say('Rhythm extraction failed: '+err.message);}},this);analysisTask.schedule(1);};
var analysisDeleted=notifydeleted;notifydeleted=function(){cancelAnalysis();analysisDeleted();};
function generateRhythm(){if(!state.events.length){say('Extract or draw a rhythm first.');return;}stop();saveundo();var out=[],amount=state.amount;for(var i=0;i<state.events.length;i++){var e=copy(state.events[i]);if(protectedHit(e)){out.push(e);continue;}if(nextRandom()<amount*.22)continue;if(nextRandom()<amount){var dest=e.beat+(nextRandom()<.5?-.25:.25)*(1+Math.floor(nextRandom()*2));if(dest>=0&&dest<beats()&&!locked(dest))e.beat=dest;}out.push(e);if(nextRandom()<amount*.35){var reply=copy(e);reply.id=++uid;reply.beat+=nextRandom()<.5?.125:.375;reply.velocity=Math.max(30,e.velocity-20);if(reply.beat<beats()&&!locked(reply.beat))out.push(reply);}}state.events=bounded(out);selected=-1;say('New rhythm: shifted hits, omissions and quieter replies. Sounds and protected hits retained. Undo restores the previous version.');}
