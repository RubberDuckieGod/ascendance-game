const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../public/party-resources-v1058.js');
const fresh=()=>({campaign:{currentQuest:'Q013',instanceId32537:'attempt-1'},partySupplies33615:0});

test('Lore starts at zero, caps at 12, and source receipts are idempotent',()=>{
 const g=fresh();
 assert.deepEqual(R.balances(g),{lore:0,evidence:0,supply:0});
 assert.equal(R.grant(g,'lore',5,'story:1').granted,5);
 assert.equal(R.grant(g,'lore',5,'story:1').duplicate,true);
 assert.equal(R.grant(g,'lore',20,'story:2').granted,7);
 assert.equal(R.balances(g).lore,12);
});
test('Lore must be spent after a successful effect and is limited once per Quest',()=>{
 const g=fresh();R.grant(g,'lore',4,'story:5');
 assert.equal(R.commitLore(g,'READ_AHEAD','receipt-1',false).error.includes('succeed'),true);
 assert.equal(R.balances(g).lore,4);
 assert.equal(R.commitLore(g,'READ_AHEAD','receipt-1',true).spent,1);
 assert.equal(R.balances(g).lore,3);
 assert.ok(R.commitLore(g,'READ_AHEAD','receipt-2',true).error);
 assert.equal(R.commitLore(g,'FOREWARNED','receipt-3',true).spent,3);
 assert.equal(R.balances(g).lore,0);
});
test('Quest Evidence clears on Quest transition but Lore and Supply remain',()=>{
 const g=fresh();R.grant(g,'lore',3,'lore:1');R.grant(g,'evidence',2,'search:1');R.grant(g,'supply',2,'supply:1');
 R.questChange(g,'Q013');g.campaign.currentQuest='Q014';g.campaign.instanceId32537='attempt-2';
 assert.equal(R.questChange(g,'Q014').evidenceCleared,true);
 assert.deepEqual(R.balances(g),{lore:3,evidence:0,supply:2});
});
test('A second Quest attempt is a fresh one-time-use window',()=>{
 const g=fresh();R.grant(g,'lore',2,'story:1');R.questChange(g,'Q013');
 assert.equal(R.commitLore(g,'READ_AHEAD','read:1',true).spent,1);
 g.campaign.instanceId32537='attempt-2';R.questChange(g,'Q013');
 assert.equal(R.checkLore(g,'READ_AHEAD').cost,1);
});
test('Legacy Supply above the new playtest cap is not erased',()=>{
 const g=fresh();g.partySupplies33615=17;
 assert.equal(R.balances(g).supply,17);
 const result=R.grant(g,'supply',3,'legacy:no-extra');
 assert.equal(result.granted,0);assert.equal(g.partySupplies33615,17);
});
test('Normal Quest setup Supply use requires an explicit open setup window and a two-Supply limit',()=>{
 const g=fresh();R.grant(g,'supply',3,'supply:1');
 assert.ok(R.canUseSupplyAtSetup(g,'FIELD_DRESSING').error);
 g.partyResourceSetupOpen1058=true;
 assert.equal(R.commitSupply(g,'SHARED_PROVISIONS',true).spent,2);
 assert.ok(R.canUseSupplyAtSetup(g,'FIELD_DRESSING').error);
});
test('Malformed and duplicate grant receipts cannot mint resources',()=>{
 const g=fresh();
 assert.ok(R.grant(g,'evidence',1,'invalid/receipt').error);
 assert.ok(R.grant(g,'evidence',-1,'valid:1').error);
 assert.equal(R.grant(g,'evidence',2,'valid:1').granted,2);
 assert.equal(R.grant(g,'evidence',2,'valid:1').duplicate,true);
 assert.equal(R.balances(g).evidence,2);
});
