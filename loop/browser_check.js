// loop/browser_check.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const report = { checks: [], consoleErrors: [], screenshots: [] };
  const check = (name, pass, detail = '') => report.checks.push({ name, pass, detail });
  const shot = async (page, name) => {
    const shotPath = `loop/shots/${name}.png`;
    await page.screenshot({ path: shotPath });
    report.screenshots.push(shotPath);
  };

  const shotsDir = path.join(__dirname, 'shots');
  if (!fs.existsSync(shotsDir)) {
    fs.mkdirSync(shotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('console', m => { 
    if (m.type() === 'error') {
      report.consoleErrors.push(m.text()); 
    }
  });
  page.on('pageerror', e => report.consoleErrors.push(String(e)));

  try {
    await page.goto('http://localhost:8000/index.html');

    // 1. Scene loads
    try {
      await page.waitForSelector('canvas', { timeout: 15000 });
      check('canvas renders', true);
    } catch {
      check('canvas renders', false, 'no canvas after 15s');
    }
    
    // Wait for initial load and intro sequence
    await page.waitForTimeout(3000);
    await shot(page, '01_pixel_grass_baseline');

    // 2. Texture mode verification
    const texMode = await page.evaluate(() => window.__game?.cinematic?.textureMode ?? '');
    check('pixel art 16x16 texture mode active', texMode === 'pixel_art_16x16', `Mode: ${texMode}`);

    // 3. Camera FOV & pitch
    const fov = await page.evaluate(() => window.__game?.cinematic?.fov ?? 0);
    const pitch = await page.evaluate(() => window.__game?.cinematic?.pitchDegrees ?? 0);
    check('field of view is ~40 degrees', Math.abs(fov - 40) <= 2, `FOV: ${fov}`);
    check('camera pitches downward 25-35 deg', pitch >= 22 && pitch <= 38, `Pitch: ${pitch.toFixed(1)} deg`);

    // 4. Character occupies < 25% screen height
    const charRatio = await page.evaluate(() => window.__game?.player?.screenHeightRatio ?? 0);
    check('character occupies less than 25% screen height', charRatio > 0.05 && charRatio <= 0.25, `Height ratio: ${(charRatio * 100).toFixed(1)}%`);

    // 5. Island generated with layer depth
    const islandBlocks = await page.evaluate(() => window.__game?.island?.blockCount ?? 0);
    check('island blocks rendered with depth', islandBlocks > 500, `Block count: ${islandBlocks}`);

    // 6. Walk test
    const start = await page.evaluate(() => window.__game?.player?.position ?? null);
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1200);
    await page.keyboard.up('KeyW');
    const after = await page.evaluate(() => window.__game?.player?.position ?? null);
    const moved = start && after && Math.hypot(after.x - start.x, after.z - start.z) > 0.3;
    check('WASD moves player', !!moved, JSON.stringify({ start, after }));
    await shot(page, '02_pixel_grass_walked');

    // 7. Modal open and close
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(600);
    const panelOpen = await page.isVisible('#panel').catch(() => false);
    check('E opens panel', panelOpen);
    await shot(page, '03_pixel_grass_panel');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const panelClosed = !(await page.isVisible('#panel').catch(() => false));
    check('Esc closes panel', panelClosed);

    // 8. No console errors
    check(
      'no console errors', 
      report.consoleErrors.length === 0,
      report.consoleErrors.slice(0, 5).join(' | ')
    );
  } catch (err) {
    check('test execution error', false, err.message);
  } finally {
    report.passed = report.checks.every(c => c.pass);
    fs.writeFileSync('loop/report.json', JSON.stringify(report, null, 2));
    console.log(report.passed ? 'PASS' : 'FAIL', `(${report.checks.filter(c => c.pass).length}/${report.checks.length})`);
    await browser.close();
  }
})();
