import { chromium } from 'playwright';

async function inspectPage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174/');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Get the page structure
  const structure = await page.evaluate(() => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    
    let result = {
      hasHeader: !!header,
      hasNav: !!nav,
      headerHTML: header ? header.outerHTML.substring(0, 500) : 'No header',
      navHTML: nav ? nav.outerHTML.substring(0, 500) : 'No nav'
    };
    
    // Try to find all clickable elements in header
    if (header) {
      const clickables = header.querySelectorAll('button, a, [onclick], [role="button"], [role="tab"]');
      result.headerClickables = Array.from(clickables).map(el => ({
        tag: el.tagName,
        text: el.textContent.trim(),
        className: el.className,
        role: el.getAttribute('role')
      }));
    }
    
    return result;
  });

  console.log('\n=== Page Structure ===');
  console.log('Has header:', structure.hasHeader);
  console.log('Has nav:', structure.hasNav);
  console.log('\nHeader HTML:', structure.headerHTML);
  console.log('\nNav HTML:', structure.navHTML);
  
  if (structure.headerClickables) {
    console.log('\n=== Clickable elements in header ===');
    structure.headerClickables.forEach((el, i) => {
      console.log(`${i}: ${el.tag} - "${el.text}" (class: ${el.className}, role: ${el.role})`);
    });
  }

  await browser.close();
}

inspectPage().catch(console.error);
