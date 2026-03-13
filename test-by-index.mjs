import { chromium } from 'playwright';

async function testByIndex() {
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

  console.log('Navigating to http://localhost:5174/');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const results = [];

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i];
    console.log(`\n=== Testing Module ${i + 1}/7: ${module} ===`);

    try {
      // Get all nav buttons
      const buttons = await page.$$('.nav-btn');
      console.log(`Found ${buttons.length} nav buttons`);

      if (i < buttons.length) {
        console.log(`Clicking button at index ${i}`);
        await buttons[i].click();

        // Wait for rendering
        console.log('Waiting 1 second for rendering...');
        await page.waitForTimeout(1000);

        // Take screenshot
        const screenshotPath = `/tmp/module-${i + 1}-${module}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`Screenshot saved: ${screenshotPath}`);

        // Check content
        const contentCheck = await page.evaluate(() => {
          const textLength = document.body.innerText.length;
          const main = document.querySelector('main') || document.body;
          const isEmpty = textLength < 100;
          
          return {
            textLength,
            isEmpty
          };
        });

        const status = !contentCheck.isEmpty ? 'working' : 'issue';

        results.push({
          module: module,
          status: status,
          textLength: contentCheck.textLength,
          screenshot: screenshotPath
        });

        console.log(`✓ Module ${module} tested - Status: ${status.toUpperCase()}`);
        console.log(`  Text length: ${contentCheck.textLength}`);

      } else {
        throw new Error(`Button index ${i} out of range`);
      }

    } catch (error) {
      console.error(`✗ Error testing module ${module}:`, error.message);
      results.push({
        module: module,
        status: 'error',
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));

  results.forEach((result, index) => {
    const num = index + 1;
    console.log(`\n${num}. ${result.module}`);
    
    if (result.status === 'working') {
      console.log('   ✓ WORKING - Content displayed properly');
    } else if (result.status === 'issue') {
      console.log('   ⚠️  ISSUE - Empty or minimal content');
    } else {
      console.log(`   ✗ ERROR - ${result.error}`);
    }
    
    if (result.textLength !== undefined) {
      console.log(`   Content: ${result.textLength} characters`);
    }
  });

  console.log('\n' + '='.repeat(60));

  await browser.close();
}

testByIndex().catch(console.error);
