// Clear only generated observations so a failed/filtered run cannot reuse stale
// gameplay evidence. catalog.json is the checked-in reference corpus used to
// collect card scenarios; the catalog test refreshes it from the served game.
const fs=require('node:fs');
module.exports=async()=>{for(const file of ['audit/card-observations.json','audit/runtime-items.json'])fs.rmSync(file,{force:true})};
