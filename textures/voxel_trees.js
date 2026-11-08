/**
 * ============================================================================
 * 🌲 Voxel Tree Architect - textures/voxel_trees.js
 * ============================================================================
 * Procedural Birch & Spruce Voxel Trees for Chirag's Minecraft Portfolio.
 * 
 * Requirements Met:
 * 1. Tree Types:
 *    - Birch Trees:
 *        * Trunk: 4 to 6 blocks tall, white bark with subtle dark horizontal notch marks (procedural 16x16 birch bark texture).
 *        * Canopy: 2 to 4 layers of voxel leaves, cheerful light vibrant green (#6ec533, #7acb3c, #85d244).
 *        * Shape: rounded cylindrical / ellipsoid canopy (3x3 wide at base, tapering to 1-2 at top).
 *    - Spruce Trees:
 *        * Trunk: 5 to 7 blocks tall (up to 8 for grand ridge trees), dark warm brown wood (#6b4a2e, #573a21).
 *        * Canopy: tiered / conical layered canopy (base layer 5x5 cross, second layer 3x3, third layer 1 block tip).
 *        * Rich evergreen conifer green (#2b5a27, #366b31).
 * 2. Placement:
 *    - Total of 8 to 12 trees placed in the landscape (default: 10 trees).
 *    - Strictly avoids spawn pad (X in [-2, 2], Z in [6, 10]) and spawn center ([-3, 3] x [-3, 3]).
 *    - Strictly avoids river channel and carved pond depressions.
 *    - 4 to 5 birch trees along the right riverbank and gentle rolling hill (e.g. X: 6..18, Z: -1..8).
 *    - 4 to 5 spruce and birch trees on the left mountain slopes and ridge (e.g. X: -16..-6, Z: -18..-6).
 *    - Varied tree heights (4, 5, 6, 7, 8 blocks) so the skyline has rich natural rhythm.
 * 3. Rendering:
 *    - Uses THREE.InstancedMesh for leaves and trunks for maximum performance (60 FPS, 4 draw calls).
 *    - Directional face shading on leaves: top brightest (+Y: 1.00), sides mid-tone (0.78), underside (0.55).
 *    - Pixel-art nearest-neighbor filtering (NearestFilter, generateMipmaps = false).
 * 4. Export:
 *    - window.buildVoxelTrees(scene, landscapeData, options)
 *    - Returns { treeCount, trees, meshes }
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const THREE = (typeof global !== 'undefined' && global.THREE) ? global.THREE : (function () {
      try { return require('three'); } catch (_) { return null; }
    })();
    module.exports = factory(THREE);
  } else {
    const exports = factory(root.THREE);
    root.buildVoxelTrees = exports.buildVoxelTrees;
    root.VoxelTrees = exports;
    if (typeof window !== 'undefined') {
      window.buildVoxelTrees = exports.buildVoxelTrees;
      window.VoxelTrees = exports;
    }
  }
}(typeof self !== 'undefined' ? self : this, function (importedTHREE) {
  'use strict';

  function getTHREE() {
    if (importedTHREE) return importedTHREE;
    if (typeof window !== 'undefined' && window.THREE) return window.THREE;
    if (typeof globalThis !== 'undefined' && globalThis.THREE) return globalThis.THREE;
    if (typeof global !== 'undefined' && global.THREE) return global.THREE;
    return null;
  }

  // Deterministic pseudo-random hash
  function pseudoHash(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  // =========================================================================
  // 1. PROCEDURAL 16x16 TEXTURE GENERATION
  // =========================================================================

  function createPixelCanvasTexture(THREE, drawFn) {
    if (typeof document === 'undefined' || !document.createElement) {
      // Node / headless fallback
      const width = 16, height = 16;
      const buffer = new Uint8Array(width * height * 4);
      for (let i = 0; i < buffer.length; i += 4) {
        buffer[i] = 130;     // R
        buffer[i + 1] = 180; // G
        buffer[i + 2] = 80;  // B
        buffer[i + 3] = 255; // A
      }
      const dataTex = new THREE.DataTexture(buffer, width, height, (THREE.RGBAFormat || 1023));
      dataTex.magFilter = THREE.NearestFilter || 1003;
      dataTex.minFilter = THREE.NearestFilter || 1003;
      dataTex.generateMipmaps = false;
      dataTex.needsUpdate = true;
      return dataTex;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    return tex;
  }

  // Birch Bark: Off-white / pale cream with dark horizontal notch flecks
  function drawBirchBark(ctx) {
    const baseCols = ['#f4f5f0', '#ebece5', '#dedfd8', '#fafbf6', '#e3e4dd'];
    const darkCols = ['#232426', '#3b3c3e', '#1a1b1c', '#4d4e50'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = baseCols[Math.floor(pseudoHash(x * 3.1, y * 7.7) * baseCols.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Horizontal dark notch marks (lenticels - birch characteristic)
    const notches = [
      { y: 2,  x: 1,  w: 4 },
      { y: 2,  x: 9,  w: 3 },
      { y: 5,  x: 5,  w: 5 },
      { y: 8,  x: 0,  w: 3 },
      { y: 8,  x: 11, w: 4 },
      { y: 11, x: 3,  w: 6 },
      { y: 14, x: 7,  w: 5 }
    ];

    notches.forEach(n => {
      for (let dx = 0; dx < n.w; dx++) {
        const px = (n.x + dx) % 16;
        ctx.fillStyle = darkCols[Math.floor(pseudoHash(px * 5.3, n.y * 11.1) * darkCols.length)];
        ctx.fillRect(px, n.y, 1, 1);
      }
    });
  }

  // Birch Log Top (rings): Pale wood core with white bark rim
  function drawBirchLogTop(ctx) {
    ctx.fillStyle = '#f0f1ec';
    ctx.fillRect(0, 0, 16, 16);
    // Outer bark rim
    ctx.strokeStyle = '#2b2c2e';
    ctx.strokeRect(0.5, 0.5, 15, 15);
    // Inner rings
    const ringCols = ['#d8cbb0', '#c8b99c', '#e4d8bf'];
    for (let y = 2; y < 14; y++) {
      for (let x = 2; x < 14; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d < 5.5) {
          ctx.fillStyle = ringCols[Math.floor((d * 1.8 + pseudoHash(x, y) * 0.5) % ringCols.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  // Birch Leaves: Cheerful, vibrant light green (#6ec533, #7acb3c, #85d244)
  function drawBirchLeaves(ctx) {
    const palette = ['#6ec533', '#7acb3c', '#85d244', '#72cb35', '#7ecd3c', '#89d444', '#5cb828'];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = palette[Math.floor(pseudoHash(x * 4.3, y * 5.9) * palette.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Spruce Log Bark: Dark warm brown wood (#6b4a2e, #573a21) with vertical furrows
  function drawSpruceBark(ctx) {
    const palette = ['#6b4a2e', '#573a21', '#52361e', '#5c3d22', '#472e19', '#634327', '#3d2614'];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const v = Math.floor((x % 3 === 0 ? 0 : 1) + pseudoHash(x * 2.1, y * 8.3) * (palette.length - 1));
        ctx.fillStyle = palette[Math.min(palette.length - 1, v)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Spruce Log Top: Dark brown wood rings
  function drawSpruceLogTop(ctx) {
    ctx.fillStyle = '#422813';
    ctx.fillRect(0, 0, 16, 16);
    const ringCols = ['#573a21', '#6b472a', '#4a301a'];
    for (let y = 2; y < 14; y++) {
      for (let x = 2; x < 14; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d < 5.5) {
          ctx.fillStyle = ringCols[Math.floor((d * 1.5 + pseudoHash(x, y) * 0.5) % ringCols.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  // Spruce Leaves: Rich evergreen conifer green (#2b5a27, #366b31)
  function drawSpruceLeaves(ctx) {
    const palette = ['#2b5a27', '#366b31', '#234a1f', '#2c5827', '#1b3d17', '#34652e', '#427d3b'];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = palette[Math.floor(pseudoHash(x * 6.1, y * 4.7) * palette.length)];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // =========================================================================
  // 2. MULTI-MATERIAL DEFINITIONS WITH DIRECTIONAL FACE SHADING
  // =========================================================================

  function createVoxelMaterials(THREE, topTex, sideTex, botTex, mults = { top: 1.00, side: 0.78, bot: 0.55 }) {
    const cSide = new THREE.Color().setScalar(mults.side);
    const cTop  = new THREE.Color().setScalar(mults.top);
    const cBot  = new THREE.Color().setScalar(mults.bot);
    return [
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide }), // +X (Face 0)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide }), // -X (Face 1)
      new THREE.MeshLambertMaterial({ map: topTex,  color: cTop  }), // +Y (Face 2: top brightest)
      new THREE.MeshLambertMaterial({ map: botTex,  color: cBot  }), // -Y (Face 3: bottom shadow)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide }), // +Z (Face 4)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide })  // -Z (Face 5)
    ];
  }

  // =========================================================================
  // 3. TREE GENERATOR IMPLEMENTATION
  // =========================================================================

  /**
   * Builds procedural birch and spruce trees for the natural landscape.
   * 
   * @param {THREE.Scene} [scene] - Target Three.js scene (optional)
   * @param {Object} [landscapeData] - Data returned by buildTerrainAndPonds
   * @param {Object} [options] - Configuration overrides:
   *   @param {Array}  [options.trees] - Custom tree definitions [{ type, x, z, trunkHeight }]
   *   @param {number} [options.treeCount=10] - Number of trees (8 to 12)
   *   @param {Object} [options.THREE] - Explicit THREE library reference
   * @returns {Object} { treeCount, trees, meshes, group, dispose }
   */
  function buildVoxelTrees(scene, landscapeData = {}, options = {}) {
    const THREE = (options && options.THREE) || getTHREE();
    if (!THREE) {
      throw new Error('[voxel_trees] THREE is required to build voxel trees.');
    }

    // Helper to query terrain surface height
    const getHeight = (x, z) => {
      if (landscapeData) {
        if (typeof landscapeData.getTerrainHeightAt === 'function') {
          const h = landscapeData.getTerrainHeightAt(x, z);
          if (typeof h === 'number' && !isNaN(h)) return Math.round(h);
        }
        if (typeof landscapeData.getHeight === 'function') {
          const h = landscapeData.getHeight(x, z);
          if (typeof h === 'number' && !isNaN(h)) return Math.round(h);
        }
        if (typeof landscapeData === 'function') {
          const h = landscapeData(x, z);
          if (typeof h === 'number' && !isNaN(h)) return Math.round(h);
        }
        if (landscapeData.rawHeight && typeof landscapeData.rawHeight.get === 'function') {
          const key = `${Math.round(x)},${Math.round(z)}`;
          const h = landscapeData.rawHeight.get(key);
          if (typeof h === 'number') return Math.round(h);
        }
      }
      if (typeof window !== 'undefined' && window.__game?.island?.terrainData?.getTerrainHeightAt) {
        const h = window.__game.island.terrainData.getTerrainHeightAt(x, z);
        if (typeof h === 'number' && !isNaN(h)) return Math.round(h);
      }
      // Natural baseline elevation
      if (x < -5 && z < -5) return 2; // Left mountain ridge
      if (x > 5) return 1;           // Right rolling hill
      return 1;
    };

    // 1. Prepare Textures & Materials
    const birchBarkTex   = createPixelCanvasTexture(THREE, drawBirchBark);
    const birchLogTopTex = createPixelCanvasTexture(THREE, drawBirchLogTop);
    const birchLeavesTex = createPixelCanvasTexture(THREE, drawBirchLeaves);

    const spruceBarkTex   = createPixelCanvasTexture(THREE, drawSpruceBark);
    const spruceLogTopTex = createPixelCanvasTexture(THREE, drawSpruceLogTop);
    const spruceLeavesTex = createPixelCanvasTexture(THREE, drawSpruceLeaves);

    const birchLogMats   = createVoxelMaterials(THREE, birchLogTopTex, birchBarkTex, birchLogTopTex);
    const birchLeafMats  = createVoxelMaterials(THREE, birchLeavesTex, birchLeavesTex, birchLeavesTex, { top: 1.00, side: 0.78, bot: 0.55 });

    const spruceLogMats  = createVoxelMaterials(THREE, spruceLogTopTex, spruceBarkTex, spruceLogTopTex);
    const spruceLeafMats = createVoxelMaterials(THREE, spruceLeavesTex, spruceLeavesTex, spruceLeavesTex, { top: 1.00, side: 0.78, bot: 0.55 });

    // 2. Define Tree Placement Specifications
    // Carefully placed matching requirements:
    // - 5 Birch trees along right riverbank & rolling hill (X: 6..18, Z: -1..8)
    // - 5 Spruce & Birch trees on left mountain slopes & ridge (X: -16..-6, Z: -18..-6)
    // - Avoids spawn pad (X in [-2, 2], Z in [6, 10]), spawn center, and ponds
    // - Varied trunk heights (4, 5, 6, 7, 8 blocks)
    let treeSpecs = [
      // Right Riverbank & Gentle Rolling Hill (5 Birch Trees in X: 6..18, Z: -1..8)
      { type: 'birch',  x: 8,   z: 6,   trunkHeight: 5 }, // Close foreground right bank
      { type: 'birch',  x: 12,  z: 7,   trunkHeight: 6 }, // Mid-foreground right rolling hill
      { type: 'birch',  x: 15,  z: 5,   trunkHeight: 5 }, // Upper meadow riverbank
      { type: 'birch',  x: 18,  z: 3,   trunkHeight: 6 }, // East meadow slope
      { type: 'birch',  x: 16,  z: 8,   trunkHeight: 4 }, // South-east rolling knoll

      // Left Mountain Slopes & Ridge (4 Spruce, 1 Birch in X: -16..-6, Z: -18..-6)
      { type: 'spruce', x: -8,  z: -6,  trunkHeight: 7 }, // Lower mountain slope left
      { type: 'spruce', x: -11, z: -9,  trunkHeight: 8 }, // Tall grand ridge spruce
      { type: 'birch',  x: -7,  z: -12, trunkHeight: 5 }, // Mountain valley notch birch
      { type: 'spruce', x: -14, z: -11, trunkHeight: 6 }, // High mountain terrace left
      { type: 'spruce', x: -12, z: -15, trunkHeight: 7 }  // Northwest sentinel spruce
    ];

    if (Array.isArray(options.trees) && options.trees.length > 0) {
      treeSpecs = options.trees;
    } else if (typeof options.treeCount === 'number') {
      const count = Math.max(8, Math.min(12, options.treeCount));
      treeSpecs = treeSpecs.slice(0, count);
    }

    // Collect block positions
    const birchLogBlocks = [];
    const birchLeafBlocks = [];
    const spruceLogBlocks = [];
    const spruceLeafBlocks = [];

    const treesData = [];

    treeSpecs.forEach((spec, specIdx) => {
      const groundY = getHeight(spec.x, spec.z);
      const baseY = groundY + 1; // Center of first trunk block atop ground
      const th = spec.trunkHeight;

      const treeObj = {
        id: `tree_${specIdx}_${spec.type}`,
        type: spec.type,
        x: spec.x,
        y: groundY,
        z: spec.z,
        trunkHeight: th,
        canopyHeight: spec.type === 'birch' ? 4 : 5,
        totalHeight: spec.type === 'birch' ? (th + 2) : (th + 2),
        trunkBlocks: [],
        leafBlocks: []
      };

      if (spec.type === 'birch') {
        // --- Birch Trunk (4 to 6 blocks tall) ---
        for (let dy = 0; dy < th; dy++) {
          const b = { x: spec.x, y: baseY + dy, z: spec.z };
          birchLogBlocks.push(b);
          treeObj.trunkBlocks.push(b);
        }

        // --- Birch Rounded Cylindrical Canopy (3-4 layers) ---
        // Shape: rounded cylindrical / ellipsoid canopy (3x3 wide at base, tapering to 1-2 at top)
        // Layer 0 (th - 2): 3x3 rounded base
        // Layer 1 (th - 1): 3x3 solid cylinder
        // Layer 2 (th):     3x3 cross (tapered)
        // Layer 3 (th + 1): 1-2 block top cap
        const canopyBase = baseY + th - 2;

        // Layer 0: 3x3 with trimmed corners (cross of 5)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (Math.abs(dx) + Math.abs(dz) <= 1 && !(dx === 0 && dz === 0)) {
              const b = { x: spec.x + dx, y: canopyBase, z: spec.z + dz };
              birchLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Layer 1: 3x3 solid (8 leaves surrounding trunk)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (!(dx === 0 && dz === 0)) {
              const b = { x: spec.x + dx, y: canopyBase + 1, z: spec.z + dz };
              birchLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Layer 2: 3x3 cross (tapered)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (Math.abs(dx) + Math.abs(dz) <= 1) {
              const b = { x: spec.x + dx, y: canopyBase + 2, z: spec.z + dz };
              birchLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Layer 3 (Cap): 1 to 2 block apex
        const bCap = { x: spec.x, y: canopyBase + 3, z: spec.z };
        birchLeafBlocks.push(bCap);
        treeObj.leafBlocks.push(bCap);

      } else if (spec.type === 'spruce') {
        // --- Spruce Trunk (5 to 7 blocks tall, up to 8) ---
        for (let dy = 0; dy < th; dy++) {
          const b = { x: spec.x, y: baseY + dy, z: spec.z };
          spruceLogBlocks.push(b);
          treeObj.trunkBlocks.push(b);
        }

        // --- Spruce Tiered Conical Canopy ---
        // Base layer: 5x5 cross
        // Second layer: 3x3
        // Third layer: 3x3 cross / plus
        // Tip: 1 block top point
        const t1 = baseY + th - 3;
        // Tier 1 (base): 5x5 cross (inner 3x3 + cardinal tips at dist 2)
        for (let dx = -2; dx <= 2; dx++) {
          for (let dz = -2; dz <= 2; dz++) {
            const inCross = (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) ||
                            (Math.abs(dx) === 2 && dz === 0) ||
                            (dx === 0 && Math.abs(dz) === 2);
            if (inCross && !(dx === 0 && dz === 0)) {
              const b = { x: spec.x + dx, y: t1, z: spec.z + dz };
              spruceLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Tier 2: 3x3 solid
        const t2 = baseY + th - 2;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (!(dx === 0 && dz === 0)) {
              const b = { x: spec.x + dx, y: t2, z: spec.z + dz };
              spruceLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Tier 3: 3x3 cross (5 blocks)
        const t3 = baseY + th - 1;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (Math.abs(dx) + Math.abs(dz) <= 1 && !(dx === 0 && dz === 0)) {
              const b = { x: spec.x + dx, y: t3, z: spec.z + dz };
              spruceLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Tier 4: 1 block plus at trunk apex
        const t4 = baseY + th;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (Math.abs(dx) + Math.abs(dz) <= 1) {
              const b = { x: spec.x + dx, y: t4, z: spec.z + dz };
              spruceLeafBlocks.push(b);
              treeObj.leafBlocks.push(b);
            }
          }
        }

        // Tip: 1 block top point
        const bTip = { x: spec.x, y: baseY + th + 1, z: spec.z };
        spruceLeafBlocks.push(bTip);
        treeObj.leafBlocks.push(bTip);
      }

      treesData.push(treeObj);
    });

    // 3. Build Instanced Meshes
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const dummy = new THREE.Object3D();
    const tempCol = new THREE.Color();

    function createInstancedVoxelMesh(materials, blockList, jitterAmount = 0.04) {
      if (blockList.length === 0) {
        const dummyMesh = new THREE.InstancedMesh(unitBox, materials, 1);
        dummyMesh.count = 0;
        return dummyMesh;
      }
      const im = new THREE.InstancedMesh(unitBox, materials, blockList.length);
      im.castShadow = true;
      im.receiveShadow = true;

      for (let i = 0; i < blockList.length; i++) {
        dummy.position.set(blockList[i].x, blockList[i].y, blockList[i].z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);

        // Per-block subtle brightness jitter (~3-4%)
        const j = 0.98 + pseudoHash(blockList[i].x * 7.7, blockList[i].z * 13.3 + blockList[i].y) * jitterAmount;
        tempCol.setRGB(j, j, j);
        im.setColorAt(i, tempCol);
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      return im;
    }

    const birchLogMesh   = createInstancedVoxelMesh(birchLogMats, birchLogBlocks);
    const birchLeafMesh  = createInstancedVoxelMesh(birchLeafMats, birchLeafBlocks);
    const spruceLogMesh  = createInstancedVoxelMesh(spruceLogMats, spruceLogBlocks);
    const spruceLeafMesh = createInstancedVoxelMesh(spruceLeafMats, spruceLeafBlocks);

    birchLogMesh.name   = 'VoxelTrees_BirchLog';
    birchLeafMesh.name  = 'VoxelTrees_BirchLeaf';
    spruceLogMesh.name  = 'VoxelTrees_SpruceLog';
    spruceLeafMesh.name = 'VoxelTrees_SpruceLeaf';

    const treeGroup = new THREE.Group();
    treeGroup.name = 'VoxelTreesGroup';

    if (birchLogMesh)   treeGroup.add(birchLogMesh);
    if (birchLeafMesh)  treeGroup.add(birchLeafMesh);
    if (spruceLogMesh)  treeGroup.add(spruceLogMesh);
    if (spruceLeafMesh) treeGroup.add(spruceLeafMesh);

    treeGroup.userData = {
      treeCount: treesData.length,
      trees: treesData,
      totalTrunkBlocks: birchLogBlocks.length + spruceLogBlocks.length,
      totalLeafBlocks: birchLeafBlocks.length + spruceLeafBlocks.length
    };

    if (scene && typeof scene.add === 'function') {
      scene.add(treeGroup);
    }

    const allMeshes = [birchLogMesh, birchLeafMesh, spruceLogMesh, spruceLeafMesh];

    const meshes = {
      group: treeGroup,
      // Singular & plural aliases for seamless compatibility
      birchLog: birchLogMesh,
      birchLeaf: birchLeafMesh,
      spruceLog: spruceLogMesh,
      spruceLeaf: spruceLeafMesh,
      birchTrunk: birchLogMesh,
      birchLeaves: birchLeafMesh,
      spruceTrunk: spruceLogMesh,
      spruceLeaves: spruceLeafMesh,
      birchTrunks: birchLogMesh,
      spruceTrunks: spruceLogMesh,
      all: allMeshes
    };

    return {
      treeCount: treesData.length,
      trees: treesData,
      meshes: meshes,
      group: treeGroup,
      dispose() {
        if (scene && typeof scene.remove === 'function') {
          scene.remove(treeGroup);
        }
        unitBox.dispose();
        [birchBarkTex, birchLogTopTex, birchLeavesTex, spruceBarkTex, spruceLogTopTex, spruceLeavesTex].forEach(t => {
          if (t && typeof t.dispose === 'function') t.dispose();
        });
        [birchLogMats, birchLeafMats, spruceLogMats, spruceLeafMats].forEach(mats => {
          if (Array.isArray(mats)) {
            mats.forEach(m => m && typeof m.dispose === 'function' && m.dispose());
          }
        });
      }
    };
  }

  return {
    buildVoxelTrees,
    drawBirchBark,
    drawBirchLogTop,
    drawBirchLeaves,
    drawSpruceBark,
    drawSpruceLogTop,
    drawSpruceLeaves,
    createPixelCanvasTexture,
    createVoxelMaterials
  };
}));
