const fs=require('node:fs');
const catalog=JSON.parse(fs.readFileSync('audit/catalog.json'));
const runtime=fs.existsSync('audit/runtime-items.json')?JSON.parse(fs.readFileSync('audit/runtime-items.json')):{};
const rows=[...(catalog['Hero Deck Cards']||[]).map(c=>({id:c['Card ID'],kind:'Hero card',name:c.Name,status:'UNVERIFIED',note:'See named scenario tests and observations; complete independent effect coverage is outstanding.'})),...(runtime.equipment||catalog.Equipment||[]).map(c=>({id:c.id||c['Card ID'],kind:'Equipment',name:c.name||c.Name,status:'UNVERIFIED'})),...(runtime.loot||catalog['Loot Deck']||[]).map(c=>({id:c.id||c['Card ID'],kind:'Loot',name:c.name||c.Name,status:'UNVERIFIED'}))];
fs.writeFileSync('audit/coverage.json',JSON.stringify(rows,null,2));
console.error(`Audit incomplete: ${rows.length} records lack complete effect certification. Passing scenario tests must not certify these records.`);
process.exitCode=1;
