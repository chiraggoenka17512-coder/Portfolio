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

  // Ensure screenshots directory exists
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
    await page.waitForTimeout(2000);
    await shot(page, '01_spawn');

    // 2. Spawn state
    const start = await page.evaluate(() => window.__game?.player?.position ?? null);
    check('game hook exposed', start !== null);

    // 3. Island generated & rendered
    const islandBlocks = await page.evaluate(() => window.__game?.island?.blockCount ?? 0);
    check('island blocks rendered', islandBlocks > 100, `Block count: ${islandBlocks}`);

    // 4. Walk forward
    await page.keyboard.down('KeyW');
    await page.waitForTimeout(1500);
    await page.keyboard.up('KeyW');
    const after = await page.evaluate(() => window.__game?.player?.position ?? null);
    const moved = start && after && Math.hypot(after.x - start.x, after.z - start.z) > 0.5;
    check('WASD moves player', !!moved, JSON.stringify({ start, after }));
    await shot(page, '02_walked');

    // 5. Orbit camera via mouse drag
    const camBefore = await page.evaluate(() => window.__game?.player?.yaw ?? 0);
    await page.mouse.move(640, 360);
    await page.mouse.down();
    await page.mouse.move(440, 300, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const camAfter = await page.evaluate(() => window.__game?.player?.yaw ?? 0);
    check('mouse drag orbits camera', Math.abs(camAfter - camBefore) > 0.05, `Angle delta: ${camAfter - camBefore}`);
    await shot(page, '04_orbit_angle');

    // 6. Open the nearest project panel with E
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(800);
    const panelOpen = await page.isVisible('#panel').catch(() => false);
    check('E opens panel', panelOpen);
    await shot(page, '03_panel');

    // 7. Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const panelClosed = !(await page.isVisible('#panel').catch(() => false));
    check('Esc closes panel', panelClosed);

    // 8. Click-driven check: the close button works too
    await page.keyboard.press('KeyE');
    await page.waitForTimeout(800);
    await page.click('#panel-close').catch(() => {});
    await page.waitForTimeout(500);
    check('close button works', !(await page.isVisible('#panel').catch(() => false)));

    // 9. No errors during the run
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
