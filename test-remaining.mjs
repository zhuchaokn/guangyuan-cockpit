import { chromium } from 'playwright';

async function testRemainingModules() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174/');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Get all navigation links
  console.log('\nFinding all navigation tabs...');
  const navLinks = await page.$$('nav a, header a, [role="tab"]');
  console.log(`Found ${navLinks.length} navigation elements`);

  // Get text of all nav links
  for (let i = 0; i < navLinks.length; i++) {
    const text = await navLinks[i].textContent();
    console.log(`  ${i}: "${text}"`);
  }

  // Try clicking by index for the remaining modules
  const modulesToTest = [
    { name: '四色预警', index: 3 },
    { name: '道路流量', index: 4 },
    { name: '车辆数据', index: 5 },
    { name: '布控预警', index: 6 }
  ];

  for (const module of modulesToTest) {
    console.log(`\n=== Testing Module: ${module.name} (index ${module.index}) ===`);
    
    try {
      // Navigate back to home first
      await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Get all nav links again
      const links = await page.$$('nav a, header a');
      
      if (module.index < links.length) {
        console.log(`Clicking link at index ${module.index}`);
        await links[module.index].click();
        
        // Wait for rendering
        console.log('Waiting 2 seconds for rendering...');
        await page.waitForTimeout(2000);
        
        // Take screenshot
        const screenshotPath = `/tmp/module-${module.index + 1}-${module.name}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`✓ Screenshot saved: ${screenshotPath}`);
        
        // Check content
        const hasContent = await page.evaluate(() => document.body.innerText.length > 100);
        console.log(`  Has content: ${hasContent}`);
      } else {
        console.log(`✗ Index ${module.index} out of range`);
      }
      
    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\n=== Testing complete ===');
}

testRemainingModules().catch(console.error);
