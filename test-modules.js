import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 监听控制台消息
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text, timestamp: new Date().toISOString() });
    console.log(`[${type.toUpperCase()}] ${text}`);
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({ message: error.message, stack: error.stack, timestamp: new Date().toISOString() });
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  // 导航到页面
  console.log('\n=== 导航到 http://localhost:5175/ ===');
  await page.goto('http://localhost:5175/');
  await page.waitForTimeout(2000);

  // 定义7个模块
  const modules = [
    { name: '地图总览', selector: 'text=地图总览' },
    { name: '运行态势', selector: 'text=运行态势' },
    { name: '交通安全', selector: 'text=交通安全' },
    { name: '四色预警', selector: 'text=四色预警' },
    { name: '道路流量', selector: 'text=道路流量' },
    { name: '车辆数据', selector: 'text=车辆数据' },
    { name: '布控预警', selector: 'text=布控预警' }
  ];

  const results = [];

  for (const module of modules) {
    console.log(`\n=== 测试模块: ${module.name} ===`);
    
    const errorsBefore = pageErrors.length;
    const consoleErrorsBefore = consoleMessages.filter(m => m.type === 'error').length;
    
    try {
      // 点击模块标签
      await page.click(module.selector);
      console.log(`✓ 点击 ${module.name}`);
      
      // 等待2秒
      await page.waitForTimeout(2000);
      
      // 截图
      const screenshotPath = `screenshot-${module.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`✓ 截图保存: ${screenshotPath}`);
      
      // 检查是否有新的错误
      const errorsAfter = pageErrors.length;
      const consoleErrorsAfter = consoleMessages.filter(m => m.type === 'error').length;
      const newErrors = errorsAfter - errorsBefore;
      const newConsoleErrors = consoleErrorsAfter - consoleErrorsBefore;
      
      // 检查页面是否有错误提示
      const errorElements = await page.$$('text=/error|错误|failed|失败/i');
      const hasVisibleError = errorElements.length > 0;
      
      results.push({
        module: module.name,
        status: (newErrors === 0 && newConsoleErrors === 0 && !hasVisibleError) ? '✓ 正常' : '✗ 有问题',
        pageErrors: newErrors,
        consoleErrors: newConsoleErrors,
        visibleErrors: hasVisibleError,
        screenshot: screenshotPath
      });
      
    } catch (error) {
      console.log(`✗ 错误: ${error.message}`);
      results.push({
        module: module.name,
        status: '✗ 点击失败',
        error: error.message
      });
    }
  }

  // 打印总结报告
  console.log('\n\n========================================');
  console.log('          模块测试总结报告');
  console.log('========================================\n');
  
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.module}: ${result.status}`);
    if (result.pageErrors > 0) {
      console.log(`   - 页面错误: ${result.pageErrors} 个`);
    }
    if (result.consoleErrors > 0) {
      console.log(`   - 控制台错误: ${result.consoleErrors} 个`);
    }
    if (result.visibleErrors) {
      console.log(`   - 发现可见错误提示`);
    }
    if (result.error) {
      console.log(`   - 错误信息: ${result.error}`);
    }
    console.log(`   - 截图: ${result.screenshot || '无'}`);
    console.log('');
  });

  console.log('========================================');
  console.log(`总计: ${results.filter(r => r.status.includes('✓')).length}/${results.length} 个模块正常`);
  console.log('========================================\n');

  // 打印所有控制台错误
  const errors = consoleMessages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    console.log('\n控制台错误详情:');
    errors.forEach((err, i) => {
      console.log(`${i + 1}. [${err.timestamp}] ${err.text}`);
    });
  }

  // 打印所有页面错误
  if (pageErrors.length > 0) {
    console.log('\n页面错误详情:');
    pageErrors.forEach((err, i) => {
      console.log(`${i + 1}. [${err.timestamp}] ${err.message}`);
      if (err.stack) {
        console.log(`   堆栈: ${err.stack}`);
      }
    });
  }

  await browser.close();
})();
