import { chromium } from 'playwright';

async function testModules() {
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
    console.log(`\n=== Testing Module ${i + 1}: ${module} ===`);

    try {
      // Click the tab
      console.log(`Clicking tab: ${module}`);
      await page.getByText(module, { exact: true }).click();

      // Wait for rendering
      console.log('Waiting 1 second for rendering...');
      await page.waitForTimeout(1000);

      // Take screenshot
      const screenshotPath = `/tmp/module-${i + 1}-${module}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved: ${screenshotPath}`);

      // Check if content is visible
      const hasContent = await page.evaluate(() => {
        return document.body.innerText.length > 100;
      });

      // Check for any error messages in the page
      const errorElements = await page.$$('.error, [class*="error"], [class*="Error"]');
      const hasErrors = errorElements.length > 0;

      // Check if main content area is empty
      const isEmpty = await page.evaluate(() => {
        const main = document.querySelector('main') || document.querySelector('.content');
        if (!main) return true;
        const text = main.innerText.trim();
        return text.length < 50;
      });

      results.push({
        module: module,
        status: 'success',
        hasContent: hasContent,
        hasErrors: hasErrors,
        isEmpty: isEmpty,
        screenshot: screenshotPath
      });

      console.log(`✓ Module ${module} tested successfully`);
      console.log(`  Has content: ${hasContent}`);
      console.log(`  Has errors: ${hasErrors}`);
      console.log(`  Is empty: ${isEmpty}`);

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
  console.log('\n=== SUMMARY ===');
  results.forEach((result, index) => {
    const num = index + 1;
    console.log(`\n${num}. ${result.module}: ${result.status.toUpperCase()}`);
    if (result.hasContent !== undefined) {
      console.log(`   Content visible: ${result.hasContent}`);
      console.log(`   Has errors: ${result.hasErrors}`);
      console.log(`   Is empty: ${result.isEmpty}`);
      
      if (result.isEmpty || result.hasErrors) {
        console.log(`   ⚠️  ISSUE DETECTED`);
      } else {
        console.log(`   ✓ Working properly`);
      }
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  await browser.close();
}

testModules().catch(console.error);
