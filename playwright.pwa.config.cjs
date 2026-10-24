const {defineConfig}=require('@playwright/test');
// This regression owns its HTTP server and persistent browser profile. Keep its
// focused feedback independent of the full audit's shared server and artifacts.
module.exports=defineConfig({
 testDir:'./tests/audit',testMatch:'service-worker-upgrade.spec.cjs',workers:1,timeout:90000,
 outputDir:'test-results/pwa-output',
 reporter:[['list'],['json',{outputFile:'test-results/pwa-results.json'}]],
 use:{headless:true,launchOptions:process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}},
});
