const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const outputDir = path.join(__dirname, 'validation-improved-screenshots');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  try {
    console.log('🌐 Opening mirror-site (improved modes)...');
    await page.goto('http://localhost:8889', { waitUntil: 'networkidle' });
    
    // Open field command
    await page.focus('#cmd-input');
    await page.type('#cmd-input', 'field', { delay: 50 });
    await page.press('#cmd-input', 'Enter');
    await page.waitForSelector('#visualizer-modal.show', { timeout: 3000 });
    console.log('✅ Visualizer opened');
    
    await page.waitForTimeout(500);
    
    // Screenshot: Field mode (IMPROVED - now has central "Being" attractor)
    await page.screenshot({ path: path.join(outputDir, '01-field-improved.png') });
    console.log('✅ Field mode (now with central Being attractor)');
    
    // Switch to density mode
    const densityBtn = await page.$('[data-mode="density"]');
    await densityBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '02-density-improved.png') });
    console.log('✅ Density mode (now starts with central attractor)');
    
    // Switch to fragmentation mode
    const fragBtn = await page.$('[data-mode="fragmentation"]');
    await fragBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '03-fragmentation-improved.png') });
    console.log('✅ Fragmentation mode (larger basins, clearer split)');
    
    // Switch to delay mode
    const delayBtn = await page.$('[data-mode="delay"]');
    await delayBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '04-delay-mode.png') });
    console.log('✅ Tech/ontology delay mode');
    
    // Switch to amplification mode
    const ampBtn = await page.$('[data-mode="amplification"]');
    await ampBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '05-amplification-mode.png') });
    console.log('✅ Amplification mode');
    
    // Switch to collapse mode
    const collapseBtn = await page.$('[data-mode="collapse"]');
    await collapseBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outputDir, '06-collapse-mode.png') });
    console.log('✅ Civilization spiral mode');
    
    // Check for grid flicker - take multiple frames to see if it's stable
    console.log('📊 Checking grid stability (3 consecutive frames)...');
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(outputDir, '07-grid-frame-1.png') });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(outputDir, '08-grid-frame-2.png') });
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(outputDir, '09-grid-frame-3.png') });
    console.log('✅ Grid stability captured (compare frames for flicker)');
    
    console.log(`\n✅ Improved validation complete. Screenshots saved to ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
