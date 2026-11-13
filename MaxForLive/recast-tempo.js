// Tempo hypotheses, not a claim of a unique beat interpretation.
function estimateRhythmTempo(frames,hopSeconds){
 frames=frames.slice(0,Math.ceil(12/hopSeconds));
 if(frames.length<8)return {tempo:0,confidence:0,candidates:[]};
 var peaks=[0,0,0,0],env=[],i,b;
 for(i=0;i<frames.length;i++)for(b=0;b<4;b++)peaks[b]=Math.max(peaks[b],frames[i].rise[b]);
 var total=0;for(i=0;i<frames.length;i++){var v=0;for(b=0;b<4;b++)if(peaks[b]>1e-6)v+=frames[i].rise[b]/peaks[b];env.push(v);total+=v*v;}
 if(total<1e-8)return {tempo:0,confidence:0,candidates:[]};
 function correlation(lag){if(lag>env.length*.5)return 0;var dot=0,aa=0,bb=0;for(var n=Math.ceil(lag);n<env.length-1;n++){var at=n-lag,k=Math.floor(at),fraction=at-k,x=env[n],y=env[k]*(1-fraction)+env[k+1]*fraction;dot+=x*y;aa+=x*x;bb+=y*y;}return aa&&bb?dot/Math.sqrt(aa*bb):0;}
 var scores=[];for(var bpm=40;bpm<=220;bpm+=.25){var lag=60/bpm/hopSeconds;var score=(correlation(lag)+.5*correlation(lag*2)+.25*correlation(lag*4))/1.75;score*=Math.sqrt(Math.max(0,1-lag/env.length));scores.push({bpm:bpm,score:score});}
 scores.sort(function(a,b){return b.score-a.score;});var choices=[];
 for(i=0;i<scores.length&&choices.length<5;i++){var separate=true;for(var j=0;j<choices.length;j++)if(Math.abs(Math.log(scores[i].bpm/choices[j].bpm))<.035)separate=false;if(separate)choices.push(scores[i]);}
 var best=choices[0],margin=choices.length>1?(best.score-choices[1].score)/Math.max(.001,best.score):0;
 return {tempo:best.bpm,confidence:margin,candidates:choices};
}
