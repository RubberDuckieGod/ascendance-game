const {mkdtempSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const {join}=require('node:path');
const {spawn}=require('node:child_process');
const dir=mkdtempSync(join(tmpdir(),'ascendance-mechanics-'));
const child=spawn(process.execPath,['server.js'],{stdio:'inherit',env:{...process.env,PORT:'3101',ASCENDANCE_DATA_DIR:dir}});
let stopping=false;
function stop(){if(stopping)return;stopping=true;child.kill('SIGTERM')}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
child.on('exit',code=>{rmSync(dir,{recursive:true,force:true});process.exit(code||0)});
