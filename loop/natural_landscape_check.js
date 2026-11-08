// loop/natural_landscape_check.js
/**
 * Standalone automated Playwright test runner for the 3D Minecraft Portfolio
 * Natural Landscape Rebuild.
 *
 * Verifies 6 objective criteria:
 * 1. Depth Layers Check:
 *    - Screenshot has at least three distinct depth layers (foreground y in [450, 650],
 *      midground y in [300, 450], background y in [120, 280]), detectable by brightness
 *      and saturation falling with distance into the haze.
 * 2. Distinct Surface Heights:
 *    - Terrain shows at least 3 distinct surface heights (e.g. riverbed Y=0,
 *      riverbank/meadow Y=2..3, mountain Y=6..9).
 * 3. River Water in Midground:
 *    - Midground region contains blue river water pixels (hue 190..230 deg, saturation > 35%).
 * 4. Tree Count:
 *    - At least 6 trees are visible in the frame (birch with white trunks and
 *      spruce with conifer canopies).
 * 5. Distant Haze Check:
 *    - Distant background terrain is measurably paler (higher blue/red ratio or desaturated)
 *      than foreground terrain.
 * 6. Frame Brightness:
 *    - Average brightness of the frame is higher than the reference baseline (> 22.3%).
 * 7. Screenshot:
 *    - Captured and saved to loop/shots/01_natural_landscape_spawn.png.
 * 8. Output Report:
 *    - Written to loop/report.json.
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

    // 0. Wait for canvas element and scene initialization
    try {
      await page.waitForSelector('canvas', { timeout: 15000 });
      check('canvas renders', true, 'WebGL canvas mounted in DOM');
    } catch {
      check('canvas renders', false, 'canvas element not found within 15s');
      throw new Error('Canvas failed to render');
    }

    // Wait for intro camera animation to complete and rendering to settle
    console.log('Waiting for camera intro glide to settle ...');
    await page.waitForFunction(() => {
      const g = window.__game;
      return g && g.cinematic && !g.cinematic.introPlaying;
    }, { timeout: 12000 }).catch(() => {
      // Fallback timeout if introPlaying flag is not used
    });
    await page.waitForTimeout(3500);

    // 7. Save baseline screenshot
    const shotRelativePath = 'loop/shots/01_natural_landscape_spawn.png';
    const shotFullPath = path.join(__dirname, 'shots', '01_natural_landscape_spawn.png');
    const screenshotBuffer = await page.screenshot({ path: shotFullPath });
    report.screenshots.push(shotRelativePath);
    console.log(`Saved screenshot to ${shotRelativePath}`);

    // Execute in-browser analysis of screenshot pixels and 3D scene data
    const analysis = await page.evaluate(async (base64) => {
      // 1. Decode captured PNG into an HTML5 Canvas for pixel access
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

      // Color conversion utilities
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

      // Compute statistics for horizontal pixel bands
      function getBandStats(yStart, yEnd) {
        let sumR = 0, sumG = 0, sumB = 0, sumLum = 0, sumSat = 0, count = 0;
        for (let y = yStart; y <= yEnd; y++) {
          for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = d[idx], g = d[idx + 1], b = d[idx + 2];
            const hsl = rgbToHsl(r, g, b);
            sumR += r;
            sumG += g;
            sumB += b;
            sumLum += hsl.l;
            sumSat += hsl.s;
            count++;
          }
        }
        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        return {
          count,
          avgR,
          avgG,
          avgB,
          avgLum: sumLum / count,
          avgSat: sumSat / count,
          blueRedRatio: (avgB + 1e-4) / (avgR + 1e-4)
        };
      }

      // Band 1: Foreground y in [450, 650]
      const fgStats = getBandStats(450, 650);
      // Band 2: Midground y in [300, 450]
      const mgStats = getBandStats(300, 450);
      // Band 3: Background y in [120, 280]
      const bgStats = getBandStats(120, 280);

      // Midground River Water Pixels:
      // Midground y in [300, 450]: blue river water pixels (hue 190..230 deg, saturation > 35%)
      let riverWaterPixels = 0;
      const sampleWaterPixels = [];
      for (let y = 300; y <= 450; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);
          const hsl = rgbToHsl(r, g, b);
          const sat = Math.max(hsv.s, hsl.s);
          if (hsv.h >= 190 && hsv.h <= 230 && sat >= 0.35 && hsv.v >= 0.15) {
            riverWaterPixels++;
            if (sampleWaterPixels.length < 5) {
              sampleWaterPixels.push({ x, y, r, g, b, hue: Math.round(hsv.h), sat: Number(sat.toFixed(3)) });
            }
          }
        }
      }

      // Overall Frame Brightness:
      let totalLuminance = 0;
      for (let i = 0; i < d.length; i += 4) {
        totalLuminance += (d[i] + d[i + 1] + d[i + 2]) / 3;
      }
      const frameBrightness = (totalLuminance / (width * height * 255)) * 100;

      // Surface Heights Analysis:
      // Checks terrain surface elevation: riverbed Y=0, riverbank/meadow Y=2..3, mountain Y=6..9
      const columnSurfaceHeights = new Map();

      // Check window.__game terrain blocks
      const island = window.__game?.island;
      const islandBlocks = island?.terrainData?.islandBlocks || island?.blocks;
      if (islandBlocks) {
        for (const cat of Object.keys(islandBlocks)) {
          const blocks = islandBlocks[cat] || [];
          for (const b of blocks) {
            const key = Math.round(b.x) + ',' + Math.round(b.z);
            const y = Math.round(b.y);
            if (!columnSurfaceHeights.has(key) || columnSurfaceHeights.get(key) < y) {
              columnSurfaceHeights.set(key, y);
            }
          }
        }
      }

      // Check Three.js scene instanced meshes if available
      const scene = island?.terrainData?.meshes?.grass?.parent;
      if (scene) {
        const dummyMatrix = (typeof THREE !== 'undefined' && THREE.Matrix4) ? new THREE.Matrix4() : null;
        scene.traverse(obj => {
          if (obj.isInstancedMesh && dummyMatrix) {
            const name = (obj.name || '').toLowerCase();
            // Exclude small vegetation sprites
            if (!name.includes('grass') && !name.includes('flower') && !name.includes('bush')) {
              for (let i = 0; i < obj.count; i++) {
                obj.getMatrixAt(i, dummyMatrix);
                const x = Math.round(dummyMatrix.elements[12]);
                const y = Math.round(dummyMatrix.elements[13]);
                const z = Math.round(dummyMatrix.elements[14]);
                const key = x + ',' + z;
                if (!columnSurfaceHeights.has(key) || columnSurfaceHeights.get(key) < y) {
                  columnSurfaceHeights.set(key, y);
                }
              }
            }
          }
        });
      }

      // Count frequency of surface heights
      const heightFrequency = {};
      for (const y of columnSurfaceHeights.values()) {
        heightFrequency[y] = (heightFrequency[y] || 0) + 1;
      }
      // Keep heights with significant presence (>= 3 columns)
      const distinctSurfaceHeights = Object.keys(heightFrequency)
        .map(Number)
        .filter(y => heightFrequency[y] >= 3)
        .sort((a, b) => a - b);

      // Trees Analysis:
      // At least 6 trees visible in frame (birch with white trunks & spruce with conifer canopies)
      let birchCount = 0;
      let spruceCount = 0;
      let otherTreesCount = 0;
      const treeDetails = [];

      // 1. Explicit tree list on window.__game
      const gameTrees = window.__game?.trees ||
                        island?.trees ||
                        window.__game?.vegetation?.trees ||
                        island?.terrainData?.trees;
      if (Array.isArray(gameTrees) && gameTrees.length > 0) {
        for (const t of gameTrees) {
          const type = (t.type || t.species || t.name || '').toLowerCase();
          const isBirch = type.includes('birch') || t.trunkColor === 'white';
          const isSpruce = type.includes('spruce') || type.includes('conifer') || type.includes('pine');
          if (isBirch) birchCount++;
          else if (isSpruce) spruceCount++;
          else otherTreesCount++;
          treeDetails.push({ type: isBirch ? 'birch' : isSpruce ? 'spruce' : 'generic', position: t.position || t });
        }
      }

      // 2. islandBlocks check for birch/spruce tree log blocks
      if (islandBlocks && (birchCount + spruceCount === 0)) {
        const birchTrunkColumns = new Set();
        const spruceTrunkColumns = new Set();
        for (const [key, blocks] of Object.entries(islandBlocks)) {
          const lower = key.toLowerCase();
          if (lower.includes('birch') && (lower.includes('log') || lower.includes('wood') || lower.includes('trunk'))) {
            for (const b of blocks) birchTrunkColumns.add(`${Math.round(b.x)},${Math.round(b.z)}`);
          }
          if ((lower.includes('spruce') || lower.includes('pine') || lower.includes('conifer')) &&
              (lower.includes('log') || lower.includes('wood') || lower.includes('trunk'))) {
            for (const b of blocks) spruceTrunkColumns.add(`${Math.round(b.x)},${Math.round(b.z)}`);
          }
        }
        if (birchTrunkColumns.size > 0) birchCount = birchTrunkColumns.size;
        if (spruceTrunkColumns.size > 0) spruceCount = spruceTrunkColumns.size;
      }

      // 3. Scene graph search for tree meshes/groups
      if (scene && (birchCount + spruceCount === 0)) {
        const seenTreeRoots = new Set();
        scene.traverse(obj => {
          const name = (obj.name || '').toLowerCase();
          const isBirch = name.includes('birch');
          const isSpruce = name.includes('spruce') || name.includes('conifer') || name.includes('pine');
          const isTree = name.includes('tree') || obj.userData?.isTree;
          if (isBirch || isSpruce || isTree) {
            const root = obj.parent?.name?.toLowerCase().includes('tree') ? obj.parent : obj;
            if (!seenTreeRoots.has(root)) {
              seenTreeRoots.add(root);
              if (isBirch) birchCount++;
              else if (isSpruce) spruceCount++;
              else otherTreesCount++;
            }
          }
        });
      }

      // 4. Pixel-level tree feature analysis on screenshot
      // Scan for Birch white trunk columns (vertical lines of pale/white wood)
      let birchTrunkPixelClusters = 0;
      let lastBirchCol = -99;
      // Scan for Spruce dark conifer foliage (clusters of pine-green needles)
      let spruceCanopyPixelClusters = 0;
      let lastSpruceCol = -99;

      for (let x = 30; x < width - 30; x += 3) {
        let whiteTrunkRun = 0;
        let maxWhiteRun = 0;
        let coniferFoliageCount = 0;

        for (let y = 220; y <= 580; y++) {
          const idx = (y * width + x) * 4;
          const r = d[idx], g = d[idx + 1], b = d[idx + 2];
          const hsv = rgbToHsv(r, g, b);

          // Birch trunk: pale/white wood pixel with low saturation
          if (r > 175 && g > 175 && b > 175 &&
              Math.abs(r - g) < 25 && Math.abs(g - b) < 25 &&
              hsv.s < 0.18 && hsv.v > 0.68) {
            whiteTrunkRun++;
            if (whiteTrunkRun > maxWhiteRun) maxWhiteRun = whiteTrunkRun;
          } else {
            whiteTrunkRun = 0;
          }

          // Spruce canopy: dark conifer pine-green
          if (hsv.h >= 95 && hsv.h <= 165 && hsv.s >= 0.22 && hsv.v <= 0.52) {
            coniferFoliageCount++;
          }
        }

        if (maxWhiteRun >= 7 && (x - lastBirchCol) > 16) {
          birchTrunkPixelClusters++;
          lastBirchCol = x;
        }
        if (coniferFoliageCount >= 18 && (x - lastSpruceCol) > 20) {
          spruceCanopyPixelClusters++;
          lastSpruceCol = x;
        }
      }

      return {
        fgStats,
        mgStats,
        bgStats,
        riverWaterPixels,
        sampleWaterPixels,
        frameBrightness,
        distinctSurfaceHeights,
        heightFrequency,
        trees: {
          birchCount,
          spruceCount,
          otherTreesCount,
          totalTrees: birchCount + spruceCount + otherTreesCount,
          birchTrunkPixelClusters,
          spruceCanopyPixelClusters
        }
      };
    }, screenshotBuffer.toString('base64'));

    const { fgStats, mgStats, bgStats, riverWaterPixels, frameBrightness, distinctSurfaceHeights, trees } = analysis;

    // =========================================================================
    // 1. Depth Layers Check
    // Screenshot has at least three distinct depth layers (foreground y in [450, 650],
    // midground y in [300, 450], background y in [120, 280]), detectable by brightness
    // and saturation falling with distance into the haze.
    // =========================================================================
    const hasLayerDistinction = (
      (Math.abs(fgStats.avgLum - mgStats.avgLum) > 0.015 || Math.abs(fgStats.avgSat - mgStats.avgSat) > 0.015) &&
      (Math.abs(mgStats.avgLum - bgStats.avgLum) > 0.015 || Math.abs(mgStats.avgSat - bgStats.avgSat) > 0.015)
    );
    const fallsIntoHaze = (
      (fgStats.avgSat > bgStats.avgSat) ||
      (fgStats.avgLum > bgStats.avgLum) ||
      (fgStats.avgSat > mgStats.avgSat && mgStats.avgSat >= bgStats.avgSat)
    );
    const depthPass = hasLayerDistinction && fallsIntoHaze;
    check(
      'depth layers check (foreground, midground, background)',
      depthPass,
      `FG: lum ${(fgStats.avgLum * 100).toFixed(1)}%, sat ${(fgStats.avgSat * 100).toFixed(1)}% | ` +
      `MG: lum ${(mgStats.avgLum * 100).toFixed(1)}%, sat ${(mgStats.avgSat * 100).toFixed(1)}% | ` +
      `BG: lum ${(bgStats.avgLum * 100).toFixed(1)}%, sat ${(bgStats.avgSat * 100).toFixed(1)}%`
    );

    // =========================================================================
    // 2. Distinct Surface Heights
    // Terrain shows at least 3 distinct surface heights (e.g. riverbed Y=0,
    // riverbank/meadow Y=2..3, mountain Y=6..9).
    // =========================================================================
    const surfaceHeightsPass = distinctSurfaceHeights.length >= 3;
    check(
      'distinct surface heights (at least 3 heights)',
      surfaceHeightsPass,
      `Detected ${distinctSurfaceHeights.length} surface heights: [${distinctSurfaceHeights.join(', ')}] ` +
      `(e.g. riverbed Y=0, meadow Y=2..3, mountain Y=6..9)`
    );

    // =========================================================================
    // 3. River Water in Midground
    // Midground region contains blue river water pixels (hue 190..230 deg, saturation > 35%).
    // =========================================================================
    const waterPass = riverWaterPixels >= 50;
    check(
      'river water in midground (hue 190-230, sat > 35%)',
      waterPass,
      `Found ${riverWaterPixels} blue river water pixels in midground (y: 300..450)`
    );

    // =========================================================================
    // 4. Tree Count
    // At least 6 trees are visible in the frame (birch with white trunks and spruce with conifer canopies).
    // =========================================================================
    const effectiveBirch = Math.max(trees.birchCount, trees.birchTrunkPixelClusters);
    const effectiveSpruce = Math.max(trees.spruceCount, trees.spruceCanopyPixelClusters);
    const effectiveTotal = Math.max(trees.totalTrees, effectiveBirch + effectiveSpruce);
    const treePass = (effectiveTotal >= 6) && (effectiveBirch >= 1) && (effectiveSpruce >= 1);
    check(
      'tree count (at least 6 visible trees: birch & spruce)',
      treePass,
      `Visible trees: ${effectiveTotal} (Birch: ${effectiveBirch}, Spruce: ${effectiveSpruce})`
    );

    // =========================================================================
    // 5. Distant Haze Check
    // Distant background terrain is measurably paler (higher blue/red ratio or desaturated)
    // than foreground terrain.
    // =========================================================================
    const isPaler = (bgStats.blueRedRatio > fgStats.blueRedRatio) || (bgStats.avgSat < fgStats.avgSat);
    check(
      'distant haze check (background paler / desaturated vs foreground)',
      isPaler,
      `Background B/R: ${bgStats.blueRedRatio.toFixed(3)} vs Foreground B/R: ${fgStats.blueRedRatio.toFixed(3)} | ` +
      `Background Sat: ${(bgStats.avgSat * 100).toFixed(1)}% vs Foreground Sat: ${(fgStats.avgSat * 100).toFixed(1)}%`
    );

    // =========================================================================
    // 6. Frame Brightness
    // Average brightness of the frame is higher than the reference baseline (> 22.3%).
    // =========================================================================
    const brightnessPass = frameBrightness > 22.3;
    check(
      'frame brightness (average frame brightness > 22.3%)',
      brightnessPass,
      `Frame brightness: ${frameBrightness.toFixed(2)}% (threshold: > 22.3%, baseline: 18.73%)`
    );

    // 8. Console errors check
    check(
      'no console errors',
      report.consoleErrors.length === 0,
      report.consoleErrors.length === 0 ? 'No console errors detected' : report.consoleErrors.slice(0, 5).join(' | ')
    );

  } catch (err) {
    check('test runner execution', false, err.message);
  } finally {
    report.passed = report.checks.every(c => c.pass);
    const reportPath = path.join(__dirname, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n============================================================');
    console.log(`NATURAL LANDSCAPE QA REPORT: ${report.passed ? 'PASS' : 'FAIL'}`);
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
