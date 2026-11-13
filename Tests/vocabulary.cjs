const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'../MaxForLive');let outs=[],tasks=[],files={},draws=[];
const stub={framecount:()=>441,length:()=>10,channelcount:()=>1,peek:(c,s,n)=>n?Array(n).fill(.1):.1,send(){}};
const ctx={mgraphics:{init(){},redraw(){},set_source_rgba(){},rectangle(...a){draws.push(a)},fill(){},select_font_face(){},set_font_size(){},move_to(){},show_text(){}},Task:function(fn){this.fn=fn;this.schedule=()=>{tasks.push(this)};this.cancel=this.repeat=()=>{}},outlet:(...a)=>outs.push(a),arrayfromargs:x=>Array.from(x),Buffer:function(){return stub},File:function(p){let f=files[p]={bytes:[],text:''};this.isopen=true;this.writebytes=b=>f.bytes.push(...b);this.writestring=s=>f.text+=s;this.close=()=>{};},box:{rect:[0,0,1080,880]},patcher:{getnamed:()=>({message(){}}),parentpatcher:{getnamed:()=>({message(){}}),newdefault:()=>({message(){}}),remove(){}}}};
vm.createContext(ctx);ctx.include=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);ctx.include('recast-native.js');const c=ctx,clone=x=>JSON.parse(JSON.stringify(x));

const initial=clone(c.state);
function reset(family,bars=4){c.stop();c.state=c.defaults(clone(initial));c.state.rhythmFamily=family;c.state.bars=bars;c.state.events=[];c.state.original=[];c.state.ranges=[];c.state.roleLocks=Array(6).fill(false);c.state.paths=['','kick.wav','snare.wav','hat.wav','perc.wav','texture.wav','bass.wav'];c.state.scope=0;c.state.detailDensity=.5;c.state.seed=1801;c.uid=100;c.undoStack=[];c.workflowTarget=-1;c.selection=null;c.workflowSelection=[];c.selected=-1;}
function musical(events){return JSON.stringify(events.map(e=>[e.role,e.beat,e.velocity,e.durationBeats,e.foundation]));}
assert.equal(c.rhythmVocabulary.length,13);
const summary=[];
for(let family=0;family<c.rhythmVocabulary.length;family++){
 reset(family);const positions=new Set();let count=0,ghosts=0,shifted=0;
 for(let n=0;n<80;n++){
  c.composeRhythm(-1);const events=clone(c.state.events),v=c.rhythmVocabulary[family],backbeats=v.grammar?v.grammar.snare:family===1?[8]:[4,12],core=v.grammar?v.grammar.core:[0];
  for(let bar=0;bar<4;bar++){
   for(let s of core)assert(events.some(e=>e.role===0&&e.foundation&&Math.abs(e.beat-(bar*4+s/4))<1e-8),v.name+' core kick');
   for(let s of backbeats)assert(events.some(e=>e.role===1&&e.foundation&&Math.abs(e.beat-(bar*4+s/4))<1e-8),v.name+' backbeat');
  }
  assert(events.some(e=>e.role===2),v.name+' hats');assert(events.every(e=>e.beat>=0&&e.beat<16&&e.velocity>=1&&e.velocity<=127));
  positions.add(JSON.stringify(events.map(e=>[e.role,e.beat])));count+=events.length;ghosts+=events.filter(e=>e.role===1&&!e.foundation).length;shifted+=events.filter(e=>!e.rollId&&Math.abs(e.beat*4-Math.round(e.beat*4))>.001).length;
  c.state.damage=.9;c.state.drunkenness=.9;const anchors=events.filter(e=>e.foundation);c.transformSection('damage');for(let a of anchors)assert(c.state.events.some(e=>e.id===a.id&&e.beat===a.beat&&e.velocity===a.velocity));
  assert(c.state.events.length<=1024);assert(c.state.events.every(e=>e.beat>=0&&e.beat<16));
 }
 assert(positions.size>20,c.rhythmVocabulary[family].name+' needs actual placement variety');summary.push({name:c.rhythmVocabulary[family].name,unique:positions.size,averageHits:count/80,ghosts,shifted});
}
assert(summary.find(x=>x.name==='Breakbeat').ghosts>summary.find(x=>x.name==='Dub space').ghosts);
assert(summary.find(x=>x.name==='Motor pulse').averageHits>summary.find(x=>x.name==='Dub space').averageHits);
assert(summary.find(x=>x.name==='Shuffle').shifted>0);assert(summary.filter(x=>x.name!=='Shuffle').every(x=>x.shifted===0));
console.log('PASS: all 13 foundations retain distinct cores/backbeats across 1040 takes, refresh note placements, preserve anchors under damage and distinguish sparse, dense, ghosted and shuffled grammars.');
for(let family=3;family<13;family++)for(let bars of [1,2,4,8,12,16]){
 reset(family,bars);c.composeRhythm(-1);const before=clone(c.state.events);c.state.events[0].locked=true;const lock=clone(c.state.events[0]);c.state.ranges=[[1.5,2]];c.composeRhythm(-1);assert(c.state.events.some(e=>JSON.stringify(e)===JSON.stringify(lock)));assert(c.state.events.filter(e=>e.beat>=1.5&&e.beat<2).every(e=>before.some(n=>n.id===e.id)));const other=musical(c.state.events.filter(e=>e.role!==3));c.composeRhythm(3);assert.equal(musical(c.state.events.filter(e=>e.role!==3)),other);assert(c.state.events.length<=1024);
}
console.log('PASS: all new grammars support every phrase length, per-role generation, hit locks and protected silence.');
for(let family=3;family<13;family++){
 reset(family);c.composeRhythm(-1);const one=musical(c.state.events);reset(family);c.composeRhythm(-1);assert.equal(musical(c.state.events),one);c.composeRhythm(-1);c.action('undo');assert.equal(musical(c.state.events),one);
 c.state.rhythmFamily=family;c.state.bars=4;c.composeRhythm(-1);const midi=c.kitMidiNotes();assert(midi.every((n,i)=>n.pitch===c.kitNotes[c.state.events[i].role]&&n.start_time===c.state.events[i].beat));
}
console.log('PASS: seeded replay, undo and separate-note MIDI preserve every new foundation including shuffled timing.');
reset(0);c.composeRhythm(-1);const keep=musical(c.state.events);c.view=0;c.action('familyCycle');c.paint();const menu=c.buttons.filter(b=>/^chooseStyle/.test(b.id));assert.equal(menu.length,13);for(let b of menu){assert(b.x>=0&&b.y>=0&&b.x+b.w<=1080&&b.y+b.h<=880);c.onidle(b.x+5,b.y+4);assert(c.visualHints[c.visualHover].includes('Generate'));}
let last=menu[12];c.onclick(last.x+400,last.y+8);assert.equal(c.state.rhythmFamily,12);assert.equal(musical(c.state.events),keep);assert(!c.styleMenuOpen);
c.action('familyCycle');c.paint();c.onclick(15,20);assert(!c.styleMenuOpen);
console.log('PASS: expanded dropdown fits, describes all 13 choices, selects from the whole row and never replaces the current groove.');
fs.writeFileSync(path.join(__dirname,'vocabulary-analysis.json'),JSON.stringify(summary,null,2));
