const {defineConfig}=require('@playwright/test');

// These native-client regressions each own a temporary server and data directory.
// A focused run must not erase the full audit's generated evidence.
module.exports=defineConfig({
 testDir:'./tests/audit',
 testMatch:['**/exploration-actions.spec.cjs','**/phase-sync.spec.cjs'],
 workers:1,
 timeout:75000,
 outputDir:'test-results/phase-sync',
 reporter:[['list'],['json',{outputFile:process.env.AUDIT_RESULTS||'test-results/phase-sync-results.json'}]],
 use:{headless:true,launchOptions:process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}}
});
