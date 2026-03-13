import { chromium } from 'playwright';

async function testEachModule() {
  const modules = [
    '地图总览',
    '运行态势',
    '交通安全',
    '四色预警',
    '道路流量',
    '车辆数据',
    '布控预警'
  ];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const results = [];

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    console.log(`\n=== Testing Module ${i + 1}/7: ${module} ===`);

    try {
      // Reload page for each module
      console.log('Loading fresh page...');
      await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      // Get all nav buttons
      const buttons = await page.$$('.nav-btn');
      console.log(`Found ${buttons.length} nav buttons`);

      if (i < buttons.length) {
        console.log(`Clicking button at index ${i} for ${module}`);
        await buttons[i].click();

        // Wait for rendering
        console.log('Waiting 1.5 seconds for rendering...');
        await page.waitForTimeout(1500);

        // Take screenshot
        const screenshotPath = `/tmp/module-${i + 1}-${module}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved: ${screenshotPath}`);

        // Check content and errors
        const contentCheck = await page.evaluate(() => {
          const textLength = document.body.innerText.length;
          const hasHeader = !!document.querySelector('header');
          const hasNav = !!document.querySelector('nav');
          const errors = document.querySelectorAll('.error, [class*="error"]');
          
          // Check console errors
          const consoleErrors = [];
          
          return {
            textLength,
            hasHeader,
            hasNav,
            errorCount: errors.length,
            isEmpty: textLength < 100
          };
        });

        const status = contentCheck.textLength > 100 && !contentCheck.isEmpty ? 'working' : 'issue';

        results.push({
          module: module,
          status: status,
          textLength: contentCheck.textLength,
          hasHeader: contentCheck.hasHeader,
          hasNav: contentCheck.hasNav,
          errorCount: contentCheck.errorCount,
          screenshot: screenshotPath
        });

        console.log(`✓ Module ${module} tested`);
        console.log(`  Status: ${status.toUpperCase()}`);
        console.log(`  Text length: ${contentCheck.textLength}`);
        console.log(`  Has header: ${contentCheck.hasHeader}`);
        console.log(`  Has nav: ${contentCheck.hasNav}`);

      } else {
        throw new Error(`Button index ${i} out of range (found ${buttons.length} buttons)`);
      }

    } catch (error) {
      console.error(`✗ Error testing module ${module}:`, error.message);
      
      // Try to take screenshot anyway
      try {
        const errorScreenshotPath = `/tmp/module-${i + 1}-${module}-error.png`;
        await page.screenshot({ path: errorScreenshotPath });
        console.log(`Error screenshot saved: ${errorScreenshotPath}`);
      } catch (e) {
        // Ignore screenshot error
      }
      
      results.push({
        module: module,
        status: 'error',
        error: error.message
      });
    }
  }

  // Print detailed summary
  console.log('\n' + '='.repeat(70));
  console.log('COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(70));

  let workingCount = 0;
  let issueCount = 0;
  let errorCount = 0;

  results.forEach((result, index) => {
    const num = index + 1;
    console.log(`\n${num}. ${result.module}`);
    console.log('   ' + '-'.repeat(60));
    
    if (result.status === 'working') {
      console.log('   Status: ✓ WORKING');
      console.log('   Content: Properly displayed');
      workingCount++;
    } else if (result.status === 'issue') {
      console.log('   Status: ⚠️  HAS ISSUES');
      console.log('   Problem: Empty or minimal content');
      issueCount++;
    } else {
      console.log('   Status: ✗ ERROR');
      console.log(`   Error: ${result.error}`);
      errorCount++;
    }
    
    if (result.textLength !== undefined) {
      console.log(`   Text length: ${result.textLength} characters`);
    }
    if (result.hasHeader !== undefined) {
      console.log(`   Header present: ${result.hasHeader}`);
    }
    if (result.hasNav !== undefined) {
      console.log(`   Navigation present: ${result.hasNav}`);
    }
    if (result.screenshot) {
      console.log(`   Screenshot: ${result.screenshot}`);
    }
  });

  console.log('\n' + '='.repeat(70));
  console.log(`TOTALS: ${workingCount} Working | ${issueCount} Issues | ${errorCount} Errors`);
  console.log('='.repeat(70));

  await browser.close();
}

testEachModule().catch(console.error);
