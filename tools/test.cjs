const {spawnSync}=require('node:child_process');
const path=require('node:path');
for(const suite of ['workflow','redesign','workbench','performance','damage']){
 const result=spawnSync(process.execPath,[path.join(__dirname,'../Tests',suite+'.cjs')],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
