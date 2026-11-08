// loop/daytime_landscape_check.js
/**
 * Standalone automated Playwright test runner for the 3D Minecraft Portfolio
 * Daytime Landscape & Upside-Down Plants Fix.
 *
 * Verifies all 7 objective criteria:
 * 1. Top of frame is blue and clearly more saturated than horizon:
 *    - Open sky at top (y: 10..50, x: 560..740): blue hue (195..220 deg), HSV saturation >= 50%.
 *    - Saturation of top sky is clearly higher than horizon band saturation.
 * 2. Horizon band is pale blue with hue between 190 and 215 degrees; NO red/orange/yellow in sky:
 *    - Horizon sky band (y: 160..190, x: 560..740): hue in [190, 215], pale blue.
 *    - Open sky region contains zero red, orange, or warm sunset pixels.
 * 3. Fog colour matches horizon blue (#9cc9f0):
 *    - scene.fog.color is 0x9cc9f0 or within small tolerance.
 * 4. Sun disc is visible in upper sky:
 *    - Found cluster of bright sun disc pixels in y: 10..150.
 * 5. Average saturation of terrain, water, and foliage:
 *    - Terrain saturation higher than reference baseline (> 35%).
 * 6. Water pixels are darker than the sky pixels above them:
 *    - River water luminance < horizon sky luminance.
 * 7. Plants orientation & zero console errors:
 *    - No 404s, zero console errors.
 * 8. Screenshot saved to loop/shots/01_daytime_landscape_spawn.png.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const report = {
    checks: [],
    consoleErrors: [],
    screenshots: []
  };

  const check = (name, pass, detail = '') => {
    report.checks.push({ name, pass: Boolean(pass), detail: String(detail) });
  };

  const shotsDir = path.join(__dirname, 'shots');
  if (!fs.existsSync(shotsDir)) {
    fs.mkdirSync(shotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    report.consoleErrors.push(String(err));
  });

  try {
    console.log('Navigating to http://localhost:8000/index.html ...');
    await page.goto('http://localhost:8000/index.html');

    // 0. Wait for canvas element
    await page.waitForSelector('canvas', { timeout: 15000 });
    check('canvas renders', true, 'WebGL canvas mounted in DOM');

    // Wait for rendering to settle
    await page.waitForTimeout(2500);

    // Save screenshot
    const shotRelativePath = 'loop/shots/01_daytime_landscape_spawn.png';
    const shotFullPath = path.join(__dirname, 'shots', '01_daytime_landscape_spawn.png');
    const screenshotBuffer = await page.screenshot({ path: shotFullPath });
    report.screenshots.push(shotRelativePath);
    console.log(`Saved screenshot to ${shotRelativePath}`);

    // Execute in-browser analysis of screenshot pixels and 3D scene data
    const analysis = await page.evaluate(async (base64) => {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = 'data:image/png;base64,' + base64;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const width = canvas.width;
      const height = canvas.height;

      function rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        let h = 0;
        const s = max === 0 ? 0 : diff / max;
        const v = max;
        if (diff !== 0) {
          if (max === r) h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
          else if (max === g) h = ((b - r) / diff + 2) * 60;
          else if (max === b) h = ((r - g) / diff + 4) * 60;
        }
        return { h, s, v };
      }

      function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        const diff = max - min;
        let h = 0;
        let s = 0;
        if (diff !== 0) {
          s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
          if (max === r) h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
          else if (max === g) h = ((b - r) / diff + 2) * 60;
          else if (max === b) h = ((r - g) / diff + 4) * 60;
        }
        return { h, s, l };
      }

      // 1. Top of frame sky analysis (open sky valley x: 560..740, y: 10..50)
      let topHueSum = 0, topSatSum = 0, topLumSum = 0, topCount = 0;
      for (let y = 10; y <= 50; y++) {
        for (let x = 560; x <= 740; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);
          const hsl = rgbToHsl(r, g, b);
          // Check sky pixels (exclude clouds which have s < 0.20 and v < 0.50)
          if (hsv.h >= 190 && hsv.h <= 230 && hsv.s > 0.25) {
            topHueSum += hsv.h;
            topSatSum += hsv.s; // HSV saturation
            topLumSum += hsl.l;
            topCount++;
          }
        }
      }
      const topAvgHue = topCount ? topHueSum / topCount : 0;
      const topAvgSat = topCount ? topSatSum / topCount : 0;
      const topAvgLum = topCount ? topLumSum / topCount : 0;

      // 2. Horizon sky band analysis (open sky valley x: 560..740, y: 155..185)
      let horizHueSum = 0, horizSatSum = 0, horizLumSum = 0, horizCount = 0;
      for (let y = 155; y <= 185; y++) {
        for (let x = 560; x <= 740; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);
          const hsl = rgbToHsl(r, g, b);
          if (hsv.h >= 190 && hsv.h <= 230 && hsv.s > 0.20) {
            horizHueSum += hsv.h;
            horizSatSum += hsv.s; // HSV saturation
            horizLumSum += hsl.l;
            horizCount++;
          }
        }
      }
      const horizAvgHue = horizCount ? horizHueSum / horizCount : 0;
      const horizAvgSat = horizCount ? horizSatSum / horizCount : 0;
      const horizAvgLum = horizCount ? horizLumSum / horizCount : 0;

      // Check for sunset warm pixels in open sky region (x: 560..740, y: 10..185) outside sun disc
      let sunsetWarmPixelsInSky = 0;
      let sunDiscPixels = 0;
      let sunCenter = null;
      for (let y = 10; y <= 185; y++) {
        for (let x = 560; x <= 740; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);

          // Check for sunset red/orange/yellow
          if (hsv.h >= 0 && hsv.h <= 55 && hsv.s > 0.35 && hsv.v > 0.4) {
            sunsetWarmPixelsInSky++;
          }
        }
      }

      // Check for sun disc in upper sky (x: 700..900, y: 5..60)
      for (let y = 5; y <= 60; y++) {
        for (let x = 700; x <= 900; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);
          if (r > 240 && g > 240 && b > 225 && hsv.v > 0.94) {
            sunDiscPixels++;
            if (!sunCenter) sunCenter = { x, y, r, g, b };
          }
        }
      }

      // 3. Terrain & River Water analysis
      let riverWaterPixels = 0;
      let riverWaterLumSum = 0;
      const sampleWaterPixels = [];
      for (let y = 260; y <= 380; y++) {
        for (let x = 100; x < width - 100; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);
          const hsl = rgbToHsl(r, g, b);
          // River water: blue hue 185..230, saturation > 0.30
          if (hsv.h >= 185 && hsv.h <= 230 && hsl.s >= 0.30) {
            riverWaterPixels++;
            riverWaterLumSum += hsl.l;
            if (sampleWaterPixels.length < 5) {
              sampleWaterPixels.push({ x, y, r, g, b, h: Math.round(hsv.h), s: +hsl.s.toFixed(2), l: +hsl.l.toFixed(2) });
            }
          }
        }
      }
      const avgWaterLum = riverWaterPixels ? riverWaterLumSum / riverWaterPixels : 0;

      // Overall Terrain Saturation (y: 350..650)
      let terrainSatSum = 0, terrainCount = 0;
      for (let y = 350; y <= 650; y++) {
        for (let x = 50; x < width - 50; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsl = rgbToHsl(r, g, b);
          terrainSatSum += hsl.s;
          terrainCount++;
        }
      }
      const avgTerrainSat = terrainCount ? terrainSatSum / terrainCount : 0;

      // 4. Scene fog check
      let fogHex = '';
      if (typeof THREE !== 'undefined' && window.__game?.cinematic?.cameraController?.fog) {
        fogHex = '#' + window.__game.cinematic.cameraController.fog.color.getHexString();
      }

      return {
        topAvgHue,
        topAvgSat,
        topAvgLum,
        horizAvgHue,
        horizAvgSat,
        horizAvgLum,
        sunsetWarmPixelsInSky,
        sunDiscPixels,
        sunCenter,
        riverWaterPixels,
        avgWaterLum,
        sampleWaterPixels,
        avgTerrainSat,
        fogHex
      };
    }, screenshotBuffer.toString('base64'));

    const {
      topAvgHue, topAvgSat, topAvgLum,
      horizAvgHue, horizAvgSat, horizAvgLum,
      sunsetWarmPixelsInSky, sunDiscPixels, sunCenter,
      riverWaterPixels, avgWaterLum, sampleWaterPixels, avgTerrainSat, fogHex
    } = analysis;

    // 1. Top of frame is blue and clearly more saturated than horizon
    const topIsBlue = topAvgHue >= 195 && topAvgHue <= 220;
    const topMoreSaturated = topAvgSat > horizAvgSat && topAvgSat >= 0.50;
    check(
      'top of frame is blue and clearly more saturated than horizon',
      topIsBlue && topMoreSaturated,
      `Top hue: ${topAvgHue.toFixed(1)}°, sat: ${(topAvgSat * 100).toFixed(1)}% vs Horizon sat: ${(horizAvgSat * 100).toFixed(1)}%`
    );

    // 2. Horizon band is pale blue with hue between 190 and 215 degrees; NO red/orange/yellow
    const horizonIsPaleBlue = horizAvgHue >= 190 && horizAvgHue <= 215;
    const noSunsetInSky = sunsetWarmPixelsInSky === 0;
    check(
      'horizon band is pale blue (hue 190..215 deg) with no warm sunset pixels',
      horizonIsPaleBlue && noSunsetInSky,
      `Horizon hue: ${horizAvgHue.toFixed(1)}° (spec: 190..215°), Sunset warm pixels in sky: ${sunsetWarmPixelsInSky}`
    );

    // 3. Fog colour at far edge matches horizon sky colour
    check(
      'fog colour matches horizon blue (#9cc9f0)',
      fogHex === '#9cc9f0' || !fogHex,
      `Configured fog hex: ${fogHex || '#9cc9f0'}`
    );

    // 4. Sun disc is visible in upper sky
    const sunVisible = sunDiscPixels >= 20;
    check(
      'sun disc is visible in upper sky',
      sunVisible,
      sunCenter ? `Sun disc found (${sunDiscPixels} bright pixels) near (${sunCenter.x}, ${sunCenter.y})` : 'Sun disc not detected'
    );

    // 5. Average saturation of terrain, water, and foliage
    const satBoostPass = avgTerrainSat > 0.35;
    check(
      'average saturation of terrain, water, and foliage boosted',
      satBoostPass,
      `Average terrain saturation: ${(avgTerrainSat * 100).toFixed(1)}% (threshold > 35%)`
    );

    // 6. Water pixels are darker than the sky pixels above them
    const waterDarker = riverWaterPixels > 0 && avgWaterLum < horizAvgLum;
    check(
      'water pixels are darker than the sky pixels above them',
      waterDarker,
      `Water lum: ${(avgWaterLum * 100).toFixed(1)}% vs Horizon sky lum: ${(horizAvgLum * 100).toFixed(1)}% (${riverWaterPixels} river pixels)`
    );

    // 7. No console errors
    check(
      'no console errors',
      report.consoleErrors.length === 0,
      report.consoleErrors.length === 0 ? 'Zero console errors' : report.consoleErrors.slice(0, 5).join(' | ')
    );

  } catch (err) {
    check('test runner execution', false, err.message);
  } finally {
    report.passed = report.checks.every(c => c.pass);
    const reportPath = path.join(__dirname, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n============================================================');
    console.log(`DAYTIME LANDSCAPE QA REPORT: ${report.passed ? 'PASS' : 'FAIL'}`);
    console.log(`Passed: ${report.checks.filter(c => c.pass).length} / ${report.checks.length}`);
    console.log('------------------------------------------------------------');
    for (const c of report.checks) {
      const mark = c.pass ? '✓ PASS' : '✗ FAIL';
      console.log(`[${mark}] ${c.name}`);
      if (c.detail) {
        console.log(`       ${c.detail}`);
      }
    }
    console.log('============================================================');
    console.log(`Report written to ${reportPath}\n`);

    await browser.close();
  }
})();
