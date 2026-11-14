const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const suite of ['device','workflow','redesign','workbench','performance','damage','vocabulary','starter','usability','collage']){
 const result=spawnSync(process.execPath,[path.join(__dirname,'../Tests',suite+'.cjs')],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}

const audio=spawnSync('python3',[path.join(__dirname,'../Tests/starter_audio.py')],{stdio:'inherit'});if(audio.status!==0)process.exit(audio.status||1);
