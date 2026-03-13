import { chromium } from 'playwright';

async function testAllTabs() {
  const modules = [
    { name: '地图总览', icon: '🗺' },
    { name: '运行态势', icon: '📊' },
    { name: '交通安全', icon: '🛡' },
    { name: '四色预警', icon: '⚠' },
    { name: '道路流量', icon: '🚦' },
    { name: '车辆数据', icon: '🚗' },
    { name: '布控预警', icon: '🔔' }
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
    console.log(`\n=== Testing Module ${i + 1}/7: ${module.name} ===`);

    try {
      // Click the button using the nav-label text
      console.log(`Clicking tab: ${module.name}`);
      await page.click(`.nav-btn:has(.nav-label:text("${module.name}"))`);

      // Wait for rendering
      console.log('Waiting 1 second for rendering...');
      await page.waitForTimeout(1000);

      // Take screenshot
      const screenshotPath = `/tmp/module-${i + 1}-${module.name}.png`;
      await page.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved: ${screenshotPath}`);

      // Check if content is visible
      const contentCheck = await page.evaluate(() => {
        const body = document.body;
        const main = document.querySelector('main') || body;
        const textLength = body.innerText.length;
        
        // Check for error elements
        const errors = document.querySelectorAll('.error, [class*="error"], [class*="Error"]');
        
        // Check for empty state
        const mainContent = main.querySelector('.content, [class*="content"]');
        const isEmpty = mainContent ? mainContent.children.length === 0 : false;
        
        return {
          textLength,
          hasErrors: errors.length > 0,
          isEmpty,
          bodyHTML: body.innerHTML.length
        };
      });

      const status = contentCheck.textLength > 200 && !contentCheck.isEmpty ? 'working' : 'issue';

      results.push({
        module: module.name,
        status: status,
        textLength: contentCheck.textLength,
        hasErrors: contentCheck.hasErrors,
        isEmpty: contentCheck.isEmpty,
        screenshot: screenshotPath
      });

      console.log(`✓ Module ${module.name} tested`);
      console.log(`  Text length: ${contentCheck.textLength}`);
      console.log(`  Has errors: ${contentCheck.hasErrors}`);
      console.log(`  Status: ${status.toUpperCase()}`);

    } catch (error) {
      console.error(`✗ Error testing module ${module.name}:`, error.message);
      results.push({
        module: module.name,
        status: 'error',
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TESTING SUMMARY');
  console.log('='.repeat(60));
  
  let workingCount = 0;
  let issueCount = 0;
  let errorCount = 0;

  results.forEach((result, index) => {
    const num = index + 1;
    console.log(`\n${num}. ${result.module}`);
    console.log(`   Status: ${result.status.toUpperCase()}`);
    
    if (result.status === 'working') {
      console.log('   ✓ Module is working properly');
      workingCount++;
    } else if (result.status === 'issue') {
      console.log('   ⚠️  Module has issues (empty or minimal content)');
      issueCount++;
    } else {
      console.log(`   ✗ Error: ${result.error}`);
      errorCount++;
    }
    
    if (result.textLength !== undefined) {
      console.log(`   Content length: ${result.textLength} characters`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Working: ${workingCount} | Issues: ${issueCount} | Errors: ${errorCount}`);
  console.log('='.repeat(60));

  await browser.close();
}

testAllTabs().catch(console.error);
