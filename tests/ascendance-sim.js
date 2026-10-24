// New foundation simulator. The historical 438-case suite was never committed;
// this executable runs the independently asserted tests present in this branch.
const {spawnSync}=require('node:child_process');
const run=spawnSync(process.execPath,['--test','tests/mechanics-foundations.test.cjs'],{stdio:'inherit'});
process.exit(run.status??1);
