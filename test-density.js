const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const outputDir = path.join(__dirname, 'test-density-screenshots');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  try {
    console.log('🌐 Testing Density Collapse mode...');
    await page.goto('http://localhost:8890', { waitUntil: 'networkidle' });
    
    // Open field visualizer
    await page.focus('#cmd-input');
    await page.type('#cmd-input', 'field', { delay: 50 });
    await page.press('#cmd-input', 'Enter');
    await page.waitForSelector('#visualizer-modal.show', { timeout: 3000 });
    
    // Switch to density mode
    const densityBtn = await page.$('[data-mode="density"]');
    await densityBtn.click();
    await page.waitForTimeout(800);
    
    // Screenshot: Initial state with central attractor
    await page.screenshot({ path: path.join(outputDir, '01-density-initial.png') });
    console.log('✅ Density initial state (central attractor visible)');
    
    // Wait for particles to collapse
    await page.waitForTimeout(1500);
    
    // Screenshot: After particles have collapsed
    await page.screenshot({ path: path.join(outputDir, '02-density-after-collapse.png') });
    console.log('✅ Particles collapsing (core should be growing)');
    
    // Get canvas bounds
    const canvas = await page.$('#prf-canvas');
    const bbox = await canvas.boundingBox();
    
    // Click to add first density point
    const click1X = bbox.x + bbox.width * 0.3;
    const click1Y = bbox.y + bbox.height * 0.4;
    await page.click('#prf-canvas', { position: { x: click1X - bbox.x, y: click1Y - bbox.y } });
    await page.waitForTimeout(800);
    
    // Screenshot: After adding one point
    await page.screenshot({ path: path.join(outputDir, '03-density-one-click.png') });
    console.log('✅ One density point added');
    
    // Click to add second density point
    const click2X = bbox.x + bbox.width * 0.7;
    const click2Y = bbox.y + bbox.height * 0.6;
    await page.click('#prf-canvas', { position: { x: click2X - bbox.x, y: click2Y - bbox.y } });
    await page.waitForTimeout(800);
    
    // Screenshot: After adding second point
    await page.screenshot({ path: path.join(outputDir, '04-density-two-clicks.png') });
    console.log('✅ Two density points added');
    
    // Wait for collapse to show
    await page.waitForTimeout(1500);
    
    // Screenshot: Particles collapsing into both points
    await page.screenshot({ path: path.join(outputDir, '05-density-multiple-collapse.png') });
    console.log('✅ Particles collapsing into multiple points');
    
    console.log(`\n✅ Density mode test complete. Screenshots: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
