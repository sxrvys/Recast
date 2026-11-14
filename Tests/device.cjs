const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const patch=JSON.parse(fs.readFileSync(path.join(__dirname,'../MaxForLive/Recast.maxpat'),'utf8')).patcher;
const boxes=[];
function walk(p){for(const row of p.boxes||[]){boxes.push(row.box);if(row.box.patcher)walk(row.box.patcher);}}
walk(patch);
const ui=boxes.filter(b=>b.varname==='RecastState');
assert.equal(ui.length,1);
assert.equal(ui[0].maxclass,'v8ui');
assert.equal(ui[0].filename,'recast-native.js');
assert.deepEqual(ui[0].patching_rect,[0,0,1080,880]);
assert.deepEqual(ui[0].presentation_rect,ui[0].patching_rect);
assert.equal(ui[0].numinlets,1);assert.equal(ui[0].numoutlets,1);
assert(boxes.some(b=>b.text==='pattr recastSession'&&b.varname==='recastSession'));
assert(!boxes.some(b=>b.maxclass==='jsui'));
console.log('PASS: V8UI retains editor dimensions, script entry point, message ports and existing session binding.');
