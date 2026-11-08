/**
 * terrain_ponds.js
 * -------------------------------------------------------------
 * Procedural Simplex-Noise Terrain & Carved Ponds Module
 * for the 3D Voxel Floating Island Portfolio.
 *
 * Requirements Met:
 * 1. Simplex Noise Elevation:
 *    - Deterministic algorithm with fixed seed (1337).
 *    - Island dimensions: ~40x16 blocks along X/Z plane (x: -10..29, z: -8..7).
 *    - Surface elevation varies between 1 and 3 blocks above baseline (y in [0, 3],
 *      with 4 distinct heights: 0, 1, 2, 3).
 *    - Step height changes by at most 1 block between neighbors, with occasional 2-block steps.
 *    - Slopes down to lower elevation at island perimeter edges.
 * 2. Surface Block Mixing:
 *    - Flat/gentle tops: grass.
 *    - Low depressions: dirt.
 *    - Steep 2-block drops: stone.
 *    - Near spawn (x in [-2, 2], z in [-2, 2]): sand or pathway blocks.
 *    - Per-block color jitter (~3% brightness variation).
 *    - Vertex AO in crevice dips (ambient occlusion in depressions/troughs).
 * 3. Alpha-tested Swaying Vegetation Sprites:
 *    - Cross-quad sprites for tall grass, flowers, bushes using THREE.InstancedMesh.
 *    - In organic clusters of 3 to 6 on grass blocks.
 *    - Random Y-rotation, subtle sway in render loop.
 * 4. Carved Ponds:
 *    - Exactly 3 small ponds placed in lower areas away from spawn and central path.
 *    - Shallow circular depressions 3 to 6 blocks across, 1 to 2 blocks deep.
 *    - Carved from height map before block placement so terrain slopes down cleanly.
 *    - Pond bed: sand center, ring of gravel blocks around rim.
 *    - Flat water plane 1 block below surrounding grass lip with transparency
 *      (opacity ~0.72) and subtle animated ripple.
 *    - Water plane contained inside rim. 1 to 2 tall grass clusters on rim; water clear.
 *    - 100% deterministic (fixed seed).
 * 5. Exports:
 *    - buildTerrainAndPonds(scene, materials, options)
 *    - updateWaterAndSway(time)
 * -------------------------------------------------------------
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const THREE = (typeof global !== 'undefined' && global.THREE) ? global.THREE : null;
    module.exports = factory(THREE);
  } else {
    const exported = factory(root.THREE);
    root.TerrainPonds = exported;
    root.buildTerrainAndPonds = exported.buildTerrainAndPonds;
    root.updateWaterAndSway = exported.updateWaterAndSway;
  }
}(typeof self !== 'undefined' ? self : this, function (importedTHREE) {
  'use strict';

  // Resolve THREE from argument, global window, or globalThis
  function getTHREE() {
    if (importedTHREE) return importedTHREE;
    if (typeof window !== 'undefined' && window.THREE) return window.THREE;
    if (typeof globalThis !== 'undefined' && globalThis.THREE) return globalThis.THREE;
    return null;
  }

  // =============================================================
  // 1. DETERMINISTIC PRNG & 2D SIMPLEX NOISE (Fixed Seed 1337)
  // =============================================================

  class SimplexNoise {
    constructor(seed = 1337) {
      this.seed = seed;
      this.perm = new Uint8Array(512);
      this.permMod8 = new Uint8Array(512);
      this.init(seed);
    }

    init(seed) {
      let s = (seed >>> 0) || 1337;
      function nextRand() {
        let t = (s += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }

      const p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) p[i] = i;
      for (let i = 255; i > 0; i--) {
        const r = Math.floor(nextRand() * (i + 1));
        const tmp = p[i];
        p[i] = p[r];
        p[r] = tmp;
      }
      for (let i = 0; i < 512; i++) {
        this.perm[i] = p[i & 255];
        this.permMod8[i] = p[i & 255] % 8;
      }
    }

    noise2D(xin, yin) {
      const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
      const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;

      let i1 = 0, j1 = 0;
      if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }

      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1.0 + 2.0 * G2;
      const y2 = y0 - 1.0 + 2.0 * G2;

      const ii = i & 255;
      const jj = j & 255;

      const grad = [
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ];

      let n0 = 0, n1 = 0, n2 = 0;

      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 > 0) {
        const g = grad[this.permMod8[ii + this.perm[jj]]];
        t0 *= t0;
        n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
      }

      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) {
        const g = grad[this.permMod8[ii + i1 + this.perm[jj + j1]]];
        t1 *= t1;
        n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
      }

      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) {
        const g = grad[this.permMod8[ii + 1 + this.perm[jj + 1]]];
        t2 *= t2;
        n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
      }

      return 70.0 * (n0 + n1 + n2);
    }
  }

  // Deterministic pseudo-random hash for color jitter & placement
  function pseudoHash(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  // =============================================================
  // 2. PIXEL-ART TEXTURE UTILITIES & PROCEDURAL CANVAS FALLBACKS
  // =============================================================

  // Procedural Pixel Art Fallbacks (16x16 authentic pixel art matching Minecraft aesthetic)
  const PixelFallbacks = {
    grassTop(ctx) {
      const palette = ['#5fa83b', '#67b340', '#569b35', '#73bc4a', '#4e8e2e', '#88cf5d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[Math.floor(pseudoHash(x * 3.1, y * 5.7) * palette.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    grassSide(ctx) {
      const grassCols = ['#5fa83b', '#67b340', '#569b35', '#73bc4a'];
      const dirtCols  = ['#79553a', '#6f4e34', '#845d40', '#5c4028', '#8f6542'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          // Top rows solid grass
          if (y < 2) {
            ctx.fillStyle = grassCols[Math.floor(pseudoHash(x * 2.3, y * 7.1) * grassCols.length)];
          } else if (y < 6) {
            // Jagged dripping teeth into dirt
            const drip = 2 + Math.floor(pseudoHash(x * 5.7, 13.3) * 4);
            if (y <= drip) {
              ctx.fillStyle = grassCols[Math.floor(pseudoHash(x * 2.3, y * 7.1) * grassCols.length)];
            } else {
              ctx.fillStyle = dirtCols[Math.floor(pseudoHash(x * 3.7, y * 4.9) * dirtCols.length)];
            }
          } else {
            // Loam dirt underside
            ctx.fillStyle = dirtCols[Math.floor(pseudoHash(x * 3.7, y * 4.9) * dirtCols.length)];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    dirt(ctx) {
      const palette = ['#79553a', '#6f4e34', '#845d40', '#5c4028', '#8f6542', '#543d2b'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[Math.floor(pseudoHash(x * 4.1, y * 6.3) * palette.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    stoneGeneric(ctx) {
      const palette = ['#6b7280', '#5a6270', '#7a8190', '#4b5563', '#878e9c', '#374151'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[Math.floor(pseudoHash(x * 5.3, y * 8.1) * palette.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    cobblestone(ctx) {
      const stoneCols = ['#6b7280', '#7a8190', '#5a6270', '#88909f'];
      const mortarCols= ['#374151', '#2f3743', '#434b57'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const isMortar = (x % 5 === 0 && (y < 8 || x % 10 === 0)) || (y % 4 === 0);
          if (isMortar) {
            ctx.fillStyle = mortarCols[Math.floor(pseudoHash(x * 2.7, y * 3.9) * mortarCols.length)];
          } else {
            ctx.fillStyle = stoneCols[Math.floor(pseudoHash(x * 4.3, y * 5.1) * stoneCols.length)];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    sandstone(ctx) {
      const palette = ['#d8c89d', '#c4b486', '#e4d8b5', '#b9a877', '#dfd0a5'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[Math.floor(pseudoHash(x * 2.9, y * 6.7) * palette.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    sand(ctx) {
      const palette = ['#e2d6a7', '#dbcfa3', '#ede3bc', '#c8bc8f', '#b5a97d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[Math.floor(pseudoHash(x * 1.7, y * 3.3) * palette.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    gravel(ctx) {
      const palette = ['#7b7677', '#827c7d', '#696465', '#9a9495', '#5a5556', '#aba5a6'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          ctx.fillStyle = palette[Math.floor(pseudoHash(x * 2.1, y * 4.7) * palette.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    water(ctx) {
      const palette = ['#3d85c6', '#3b7ebc', '#468ecf', '#3676b3'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = Math.sin(x * 0.4 + y * 0.3) * 0.5 + 0.5;
          ctx.fillStyle = palette[Math.floor(v * palette.length) % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },
    tallGrass(ctx) {
      ctx.clearRect(0, 0, 16, 16);
      const cols = {
        D: '#2e551a',
        M: '#558e2d',
        L: '#7ec850',
        H: '#a0e15f'
      };
      const grid = [
        '................',
        '.....L..........',
        '....LM....L.....',
        '....MD...LM.....',
        '..L.MD...MD..L..',
        '..MLMM..LMM.ML..',
        '..MMMD..MMD.MD..',
        '..MDMD.LMMD.MD..',
        '..MDMM.MMMDLMM..',
        '..MDMD.MDMDMMM..',
        '.LMMMD.MDMDMMD..',
        '.MMDMD.MDMDMMD..',
        '.MMDMDDMDMDMMMD.',
        'DMMDMDDMDMDMMMDD',
        'DMDDMDDMDMDDMMDD',
        'DDDDDDDDDDDDDDDD'
      ];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const c = grid[y][x];
          if (cols[c]) {
            ctx.fillStyle = cols[c];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    flowerRed(ctx) {
      ctx.clearRect(0, 0, 16, 16);
      const cols = {
        S: '#2e551a', G: '#4b8228', R: '#dc2626',
        D: '#991b1b', B: '#fecaca', C: '#1e0f0f', Y: '#eab308'
      };
      const grid = [
        '................', '................',
        '.....RR..RR.....', '....RBRRRRBR....',
        '...RBRRCCRRBR...', '...RRRRCYCRRR...',
        '...RRRCCCCRRR...', '....DRRDDDDR....',
        '.....DDDDDD.....', '.......GG.......',
        '.......GS.......', '.....GGGS.......',
        '....GSSGS.......', '.......GSSG.....',
        '.......GS.......', '......SSS.......'
      ];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const c = grid[y][x];
          if (cols[c]) {
            ctx.fillStyle = cols[c];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    flowerYellow(ctx) {
      ctx.clearRect(0, 0, 16, 16);
      const cols = {
        S: '#2e551a', G: '#4b8228', Y: '#fac215',
        O: '#ea8c0a', L: '#fef08a', D: '#a16207'
      };
      const grid = [
        '................', '................',
        '......YYYY......', '....YYLYYLYY....',
        '...YLYYYYYYLY...', '...YYYYOODYYYY...',
        '...YYYDDODYYYY...', '...YLYYYYYYLY...',
        '....YYOYYOYY....', '......ODDO......',
        '.......GG.......', '.....GGGS.......',
        '....GSSGS.GG....', '.......GSSGS....',
        '.......GS.......', '......SSS.......'
      ];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const c = grid[y][x];
          if (cols[c]) {
            ctx.fillStyle = cols[c];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    },
    bush(ctx) {
      ctx.clearRect(0, 0, 16, 16);
      const cols = {
        D: '#234114', M: '#3c7323', L: '#5fa832', H: '#87cd4b'
      };
      const grid = [
        '................', '..L..........L..',
        '.LML........LML.', 'LMHML..LL..LMHML',
        '.MHMD.LMMD.DMHM.', '.DMMD.MMHML.DMD.',
        '..DMDLMHHMD.DMD.', '..DMDMMHMMLDMDD.',
        '.LMMMMDMDMMMMD..', 'LMMHMMDMDMMMHML.',
        'MMHHMMDMDMMHHMM.', '.DMHMMLDMMHMML..',
        '..DMMMDDMDMMMD..', '..DDMDDMDDMDDD..',
        '...DDDDMDDDDD...', '.....DDDDDD.....'
      ];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const c = grid[y][x];
          if (cols[c]) {
            ctx.fillStyle = cols[c];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  };

  // Helper to load file texture with guaranteed immediate canvas pixel art fallback
  function getOrLoadPixelTexture(THREE, path, fallbackDrawFn) {
    if (typeof document === 'undefined') return null;

    // Draw procedural canvas first so texture is NEVER blank/black on frame 0
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (fallbackDrawFn) {
      fallbackDrawFn(ctx, 16, 16);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;

    // If Image loader available, load PNG and swap in when loaded
    if (typeof Image !== 'undefined' && path) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        tex.image = img;
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
      };
      img.src = path;
    }

    return tex;
  }

  // Directional Face Shading Materials:
  // Top (+Y): 1.00 (brightest)
  // Sides (+-X, +-Z): 0.75 (medium tone)
  // Bottom (-Y): 0.45 (deep shadowed underbelly tone)
  function createVoxelMaterials(THREE, topTex, sideTex, botTex) {
    const cSide = new THREE.Color().setScalar(0.75);
    const cTop  = new THREE.Color().setScalar(1.00);
    const cBot  = new THREE.Color().setScalar(0.45);
    return [
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide }), // +X (Face 0)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide }), // -X (Face 1)
      new THREE.MeshLambertMaterial({ map: topTex,  color: cTop  }), // +Y (Face 2)
      new THREE.MeshLambertMaterial({ map: botTex,  color: cBot  }), // -Y (Face 3)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide }), // +Z (Face 4)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSide })  // -Z (Face 5)
    ];
  }

  // Cross-Quad Sprite Geometry for Vegetation (intersects at 45 degrees)
  function createCrossQuadGeometry(THREE, width = 0.8, height = 0.8) {
    const hw = width * 0.5;
    const d = hw * 0.7071; // 45 degree diagonal offset
    const geom = new THREE.BufferGeometry();

    const positions = new Float32Array([
      // Quad 1: (-d, 0, -d) to (d, h, d)
      -d, 0, -d,
       d, 0,  d,
       d, height,  d,
      -d, height, -d,
      // Quad 2: (-d, 0, d) to (d, h, -d)
      -d, 0,  d,
       d, 0, -d,
       d, height, -d,
      -d, height,  d
    ]);

    const uvs = new Float32Array([
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1
    ]);

    const normals = new Float32Array([
      -0.7071, 0, 0.7071,   -0.7071, 0, 0.7071,   -0.7071, 0, 0.7071,   -0.7071, 0, 0.7071,
       0.7071, 0, 0.7071,    0.7071, 0, 0.7071,    0.7071, 0, 0.7071,    0.7071, 0, 0.7071
    ]);

    const indices = [
      0, 1, 2,  0, 2, 3,
      4, 5, 6,  4, 6, 7
    ];

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    return geom;
  }

  // =============================================================
  // 3. INTERNAL ANIMATION STATE FOR WATER & VEGETATION SWAY
  // =============================================================

  const activeAnimationState = {
    waterMeshes: [],
    waterTextures: [],
    vegetationItems: [], // array of { mesh, index, x, y, z, baseRotY, scale, phase }
    sharedDummy: null
  };

  /**
   * updateWaterAndSway(time)
   * Render loop hook that animates:
   * 1. Water ripple (UV offset scrolling & subtle vertical bobbing).
   * 2. Vegetation swaying in wind with zero heap allocations.
   */
  function updateWaterAndSway(time) {
    if (!activeAnimationState.sharedDummy) {
      const THREE = getTHREE();
      if (!THREE) return;
      activeAnimationState.sharedDummy = new THREE.Object3D();
    }
    const dummy = activeAnimationState.sharedDummy;

    // 1. Water Ripple Animation
    for (let i = 0; i < activeAnimationState.waterTextures.length; i++) {
      const tex = activeAnimationState.waterTextures[i];
      if (tex) {
        tex.offset.x = (time * 0.022) % 1.0;
        tex.offset.y = (time * 0.016) % 1.0;
      }
    }
    for (let i = 0; i < activeAnimationState.waterMeshes.length; i++) {
      const wm = activeAnimationState.waterMeshes[i];
      if (wm && wm.userData.baseY !== undefined) {
        wm.position.y = wm.userData.baseY + Math.sin(time * 2.4 + i * 1.8) * 0.012;
      }
    }

    // 2. Vegetation Sway in Wind
    const items = activeAnimationState.vegetationItems;
    const len = items.length;
    const meshesToUpdate = new Set();

    for (let i = 0; i < len; i++) {
      const item = items[i];
      // Gentle travelling wind wave across island
      const wind = Math.sin(time * 2.2 + item.x * 0.40 + item.z * 0.30 + item.phase);
      const swayAngle = wind * 0.075; // ~4.3 degrees subtle sway

      dummy.position.set(item.x, item.y, item.z);
      // Lean predominantly along wind direction while preserving random base rotation
      dummy.rotation.set(swayAngle * 0.5, item.baseRotY, swayAngle);
      dummy.scale.set(item.scale, item.scale, item.scale);
      dummy.updateMatrix();

      item.mesh.setMatrixAt(item.index, dummy.matrix);
      meshesToUpdate.add(item.mesh);
    }

    for (const m of meshesToUpdate) {
      m.instanceMatrix.needsUpdate = true;
    }
  }

  // =============================================================
  // 4. TERRAIN & CARVED PONDS GENERATOR
  // =============================================================

  /**
   * buildTerrainAndPonds(scene, materials, options)
   * Generates procedural Simplex-noise terrain and carved ponds for the floating island.
   *
   * @param {THREE.Scene} scene - Target Three.js scene
   * @param {Object} [materials] - Optional user material overrides
   * @param {Object} [options] - Options { seed: 1337 }
   * @returns {Object} Metadata, block counts, pond definitions, and height lookup
   */
  function buildTerrainAndPonds(scene, materials, options = {}) {
    const THREE = getTHREE();
    if (!THREE) {
      throw new Error('Three.js (THREE) is required to build terrain and ponds.');
    }

    const seed = options.seed !== undefined ? options.seed : 1337;
    const noise = new SimplexNoise(seed);

    // Island Geometry Parameters (Matching 40x16 natural floating island)
    const cx = 10;
    const cz = 0;
    const rx = 19.5;
    const rz = 7.5;

    // Reset previous animation registration
    activeAnimationState.waterMeshes = [];
    activeAnimationState.waterTextures = [];
    activeAnimationState.vegetationItems = [];
    if (!activeAnimationState.sharedDummy) {
      activeAnimationState.sharedDummy = new THREE.Object3D();
    }

    // Default Materials Preparation with Instant Canvas Fallback & Async PNG Loading
    const texPath = 'textures/primary_16x16_block_set/';
    const grassTopTex     = getOrLoadPixelTexture(THREE, texPath + 'grass_top.png', PixelFallbacks.grassTop);
    const grassSideTex    = getOrLoadPixelTexture(THREE, texPath + 'grass_side.png', PixelFallbacks.grassSide);
    const dirtTex         = getOrLoadPixelTexture(THREE, texPath + 'dirt.png', PixelFallbacks.dirt);
    const stoneGenericTex = getOrLoadPixelTexture(THREE, texPath + 'stone_generic.png', PixelFallbacks.stoneGeneric);
    const sandstoneTex    = getOrLoadPixelTexture(THREE, texPath + 'sandstone.png', PixelFallbacks.sandstone);
    const cobblestoneTex  = getOrLoadPixelTexture(THREE, texPath + 'cobblestone.png', PixelFallbacks.cobblestone);

    const sandTex         = getOrLoadPixelTexture(THREE, texPath + 'sand.png', PixelFallbacks.sand);
    const gravelTex       = getOrLoadPixelTexture(THREE, texPath + 'gravel.png', PixelFallbacks.gravel);
    const waterTex        = getOrLoadPixelTexture(THREE, 'textures/kenney_voxel_pack/water.png', PixelFallbacks.water);
    waterTex.wrapS = THREE.RepeatWrapping;
    waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(2, 2);

    const tallGrassTex    = getOrLoadPixelTexture(THREE, texPath + 'tall_grass.png', PixelFallbacks.tallGrass);
    const flowerRedTex    = getOrLoadPixelTexture(THREE, texPath + 'flower_red.png', PixelFallbacks.flowerRed);
    const flowerYellowTex = getOrLoadPixelTexture(THREE, texPath + 'flower_yellow.png', PixelFallbacks.flowerYellow);
    const bushTex         = getOrLoadPixelTexture(THREE, texPath + 'bush.png', PixelFallbacks.bush);

    // Normalize materials input
    const mats = materials || {};
    const grassMaterials = mats.grass || createVoxelMaterials(THREE, grassTopTex, grassSideTex, dirtTex);
    const dirtMaterials  = mats.dirt  || createVoxelMaterials(THREE, dirtTex, dirtTex, dirtTex);
    const stoneMaterials = mats.stone || createVoxelMaterials(THREE, stoneGenericTex, stoneGenericTex, stoneGenericTex);
    const sandMaterials  = mats.sand  || createVoxelMaterials(THREE, sandTex, sandTex, sandstoneTex);
    const gravelMaterials= mats.gravel|| createVoxelMaterials(THREE, gravelTex, gravelTex, cobblestoneTex);
    const pathMaterials  = mats.pathway || createVoxelMaterials(THREE, cobblestoneTex, cobblestoneTex, dirtTex);

    const waterMat = mats.water || new THREE.MeshLambertMaterial({
      map: waterTex,
      color: 0x3d85c6,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const tallGrassMat = mats.tallGrass || new THREE.MeshLambertMaterial({
      map: tallGrassTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const flowerRedMat = mats.flowerRed || new THREE.MeshLambertMaterial({
      map: flowerRedTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const flowerYellowMat = mats.flowerYellow || new THREE.MeshLambertMaterial({
      map: flowerYellowTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const bushMat = mats.bush || new THREE.MeshLambertMaterial({
      map: bushTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    // -------------------------------------------------------------
    // POND DEFINITIONS (Requirement 4: 2 to 4 small ponds placed in lower
    // areas away from spawn and central path, 3 to 6 blocks across,
    // 1 to 2 blocks deep)
    // -------------------------------------------------------------
    const ponds = [
      {
        id: 'pond_east_north',
        x: 18.5,
        z: 4.0,
        radius: 2.3, // ~4.6 blocks diameter
        depth: 1.2
      },
      {
        id: 'pond_west_south',
        x: -5.0,
        z: -4.2,
        radius: 2.0, // ~4.0 blocks diameter
        depth: 1.2
      },
      {
        id: 'pond_far_east_south',
        x: 22.5,
        z: -3.2,
        radius: 2.2, // ~4.4 blocks diameter
        depth: 1.2
      }
    ];

    // -------------------------------------------------------------
    // PASS 1: PROCEDURAL SIMPLEX NOISE ELEVATION & POND CARVING
    // -------------------------------------------------------------
    const rawHeight = new Map();
    const isIslandColumn = new Map();

    for (let x = -10; x <= 29; x++) {
      for (let z = -8; z <= 7; z++) {
        const dx = (x - cx) / rx;
        const dz = (z - cz) / rz;

        // Organic edge noise
        const edgeNoise = Math.sin(x * 0.45) * Math.cos(z * 0.65) * 0.12 + Math.sin(x * 0.9 + z * 0.7) * 0.08;
        const dist = Math.hypot(dx, dz) + edgeNoise;

        const isExtent = (x === -10 && z === 0) || (x === 29 && z === 0) || (x === 10 && z === -8) || (x === 10 && z === 7);
        const isCore = (x >= -4 && x <= 16 && z >= -4 && z <= 4);

        if (dist <= 1.02 || isExtent || isCore) {
          const key = `${x},${z}`;
          isIslandColumn.set(key, { x, z, dist });

          // Multi-octave Simplex Noise
          const n1 = noise.noise2D(x * 0.08, z * 0.15);
          const n2 = noise.noise2D(x * 0.18 + 7.5, z * 0.28 + 3.2) * 0.45;
          const nTot = (n1 + n2) / 1.45; // approx in [-1, 1]

          // Slopes down to lower elevation at island perimeter edges
          let edgeFactor = 1.0;
          if (dist > 0.55) {
            edgeFactor = Math.max(0.0, 1.0 - (dist - 0.55) / 0.45);
          }

          // Elevation mapping: baseline 0, reaches 1, 2, 3 blocks above baseline
          let hVal = 0.5 + (nTot * 0.5 + 0.5) * 2.85 * edgeFactor;

          // Scenic rocky bluff feature with 2-block drops
          const bluffDist = Math.hypot(x - 8, z - (-4.5));
          if (bluffDist <= 2.2 && dist <= 0.75) {
            hVal = Math.max(hVal, 2.85);
          }

          // Flat gentle spawn plateau at baseline y = 0 near (0, 0)
          const spawnDist = Math.hypot(x, z);
          if (spawnDist <= 2.6) {
            hVal = 0.0;
          }

          // Carved from height map BEFORE block placement so terrain slopes down cleanly
          for (const p of ponds) {
            const pd = Math.hypot(x - p.x, z - p.z);
            if (pd <= p.radius) {
              const carve = (1.0 - pd / (p.radius * 1.08)) * p.depth;
              hVal -= carve;
            }
          }

          // Quantize to integer heights in [0, 3]
          let h = Math.round(hVal);
          if (h < 0) h = 0;
          if (h > 3) h = 3;

          rawHeight.set(key, h);
        }
      }
    }

    // Enforce neighbor constraint: step height changes by at most 1 block
    // between neighbors, with occasional 2-block steps (never > 2)
    for (let iter = 0; iter < 4; iter++) {
      for (const [key, h] of rawHeight.entries()) {
        const [x, z] = key.split(',').map(Number);
        for (const [nx, nz] of [[x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]]) {
          const nkey = `${nx},${nz}`;
          if (rawHeight.has(nkey)) {
            const nh = rawHeight.get(nkey);
            if (h - nh > 2) {
              rawHeight.set(key, nh + 2);
            } else if (nh - h > 2) {
              rawHeight.set(nkey, h + 2);
            }
          }
        }
      }
    }

    // Helper height getter
    function getTerrainHeightAt(x, z) {
      const rx = Math.round(x);
      const rz = Math.round(z);
      const key = `${rx},${rz}`;
      if (rawHeight.has(key)) return rawHeight.get(key);
      return 0;
    }

    // -------------------------------------------------------------
    // PASS 2: SURFACE BLOCK MIXING & UNDERBELLY KEEL VOXELS
    // -------------------------------------------------------------
    const islandBlocks = {
      grass: [],
      dirt: [],
      stone: [],
      sand: [],
      gravel: [],
      pathway: []
    };

    const surfaceDataMap = new Map();

    for (const [key, { x, z, dist }] of isIslandColumn.entries()) {
      const topY = rawHeight.get(key);

      // Determine surface block type according to rules:
      let surfaceType = 'grass';
      let inPond = false;
      let pondRef = null;

      // 1. Carved Pond Bed Check
      for (const p of ponds) {
        const pd = Math.hypot(x - p.x, z - p.z);
        if (pd <= p.radius) {
          inPond = true;
          pondRef = p;
          if (pd <= p.radius * 0.55) {
            surfaceType = 'sand'; // Sand center
          } else {
            surfaceType = 'gravel'; // Ring of gravel around rim
          }
          break;
        }
      }

      if (!inPond) {
        // 2. Near spawn (x in [-2, 2], z in [-2, 2]): sand or pathway blocks
        if (x >= -2 && x <= 2 && z >= -2 && z <= 2) {
          if (Math.abs(x) <= 1 && Math.abs(z) <= 1) {
            surfaceType = 'pathway';
          } else {
            surfaceType = 'sand';
          }
        } else {
          // 3. Steep 2-block drops: stone
          let isSteep = false;
          for (const [nx, nz] of [[x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]]) {
            const nkey = `${nx},${nz}`;
            if (rawHeight.has(nkey)) {
              if (Math.abs(topY - rawHeight.get(nkey)) >= 2) {
                isSteep = true;
                break;
              }
            }
          }

          if (isSteep) {
            surfaceType = 'stone';
          } else if (topY === 0) {
            // 4. Low depressions: dirt
            surfaceType = 'dirt';
          } else {
            // 5. Flat/gentle tops: grass
            surfaceType = 'grass';
          }
        }
      }

      // Add surface block
      islandBlocks[surfaceType].push({ x, y: topY, z });
      surfaceDataMap.set(key, { surfaceType, topY, inPond, pondRef });

      // Sub-surface columns: solid dirt/stone from topY down to 0
      for (let sy = topY - 1; sy >= 0; sy--) {
        if (surfaceType === 'stone') {
          islandBlocks.stone.push({ x, y: sy, z });
        } else {
          islandBlocks.dirt.push({ x, y: sy, z });
        }
      }

      // Sub-layer (y = -1): Dirt
      const isExtent = (x === -10 && z === 0) || (x === 29 && z === 0) || (x === 10 && z === -8) || (x === 10 && z === 7);
      const isCore = (x >= -4 && x <= 16 && z >= -4 && z <= 4);
      if (dist <= 0.98 || isExtent || isCore) {
        islandBlocks.dirt.push({ x, y: -1, z });
      }

      // Keel layers (y = -2 to -4): Stone tapering inward naturally
      if (dist <= 0.76 || (isCore && dist <= 0.85)) {
        islandBlocks.stone.push({ x, y: -2, z });
      }
      if (dist <= 0.52) {
        islandBlocks.stone.push({ x, y: -3, z });
      }
      if (dist <= 0.30) {
        islandBlocks.stone.push({ x, y: -4, z });
      }
    }

    // -------------------------------------------------------------
    // PASS 3: BUILD THREE.InstancedMesh & APPLY VERTEX AO / JITTER
    // -------------------------------------------------------------
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const dummyObj = new THREE.Object3D();
    const tempCol = new THREE.Color();

    function buildVoxelInstancedMesh(materialsList, blockList) {
      const im = new THREE.InstancedMesh(unitBox, materialsList, blockList.length);
      for (let i = 0; i < blockList.length; i++) {
        dummyObj.position.set(blockList[i].x, blockList[i].y, blockList[i].z);
        dummyObj.updateMatrix();
        im.setMatrixAt(i, dummyObj.matrix);

        // Ambient Occlusion in crevice dips + Color Jitter
        const bx = blockList[i].x;
        const by = blockList[i].y;
        const bz = blockList[i].z;

        // Count higher neighbors for crevice AO
        let higherCount = 0;
        for (const [nx, nz] of [[bx + 1, bz], [bx - 1, bz], [bx, bz + 1], [bx, bz - 1]]) {
          const nh = rawHeight.get(`${nx},${nz}`);
          if (nh !== undefined && nh > by) higherCount++;
        }
        for (const [nx, nz] of [[bx + 1, bz + 1], [bx - 1, bz + 1], [bx + 1, bz - 1], [bx - 1, bz - 1]]) {
          const nh = rawHeight.get(`${nx},${nz}`);
          if (nh !== undefined && nh > by) higherCount += 0.5;
        }

        // Crevice AO factor (occluded crevices are naturally darker)
        const aoFactor = Math.max(0.70, 1.0 - higherCount * 0.08);

        // Per-block color jitter (~3% brightness variation)
        const jitter = 0.97 + pseudoHash(bx * 13.1 + by * 5.3, bz * 19.7) * 0.06;
        const brightness = aoFactor * jitter;

        tempCol.setRGB(brightness, brightness, brightness);
        im.setColorAt(i, tempCol);
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      return im;
    }

    const grassMesh   = buildVoxelInstancedMesh(grassMaterials, islandBlocks.grass);
    const dirtMesh    = buildVoxelInstancedMesh(dirtMaterials, islandBlocks.dirt);
    const stoneMesh   = buildVoxelInstancedMesh(stoneMaterials, islandBlocks.stone);
    const sandMesh    = buildVoxelInstancedMesh(sandMaterials, islandBlocks.sand);
    const gravelMesh  = buildVoxelInstancedMesh(gravelMaterials, islandBlocks.gravel);
    const pathwayMesh = buildVoxelInstancedMesh(pathMaterials, islandBlocks.pathway);

    scene.add(grassMesh);
    scene.add(dirtMesh);
    scene.add(stoneMesh);
    scene.add(sandMesh);
    scene.add(gravelMesh);
    scene.add(pathwayMesh);

    // -------------------------------------------------------------
    // PASS 4: CARVED WATER PLANES (Flat water plane 1 block below lip)
    // -------------------------------------------------------------
    const waterGroup = new THREE.Group();
    waterGroup.name = 'PondWaterGroup';
    activeAnimationState.waterTextures.push(waterTex);

    const pondMeta = [];

    for (let pIdx = 0; pIdx < ponds.length; pIdx++) {
      const p = ponds[pIdx];

      // Surrounding lip elevation sampled at pond center
      const lipY = Math.max(1, rawHeight.get(`${Math.round(p.x)},${Math.round(p.z)}`) || 0);

      // Flat water plane 1 block below surrounding grass lip
      // Grass lip top surface is at lipY + 0.5; water surface is ~0.15 below lip top
      const waterY = lipY - 0.15;
      const waterRadius = p.radius * 0.96;

      const waterGeo = new THREE.CircleGeometry(waterRadius, 24);
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.set(p.x, waterY, p.z);
      waterMesh.userData.baseY = waterY;

      waterGroup.add(waterMesh);
      activeAnimationState.waterMeshes.push(waterMesh);

      pondMeta.push({
        id: p.id,
        x: p.x,
        z: p.z,
        radius: p.radius,
        waterY: waterY,
        mesh: waterMesh
      });
    }
    scene.add(waterGroup);

    // -------------------------------------------------------------
    // PASS 5: ALPHA-TESTED SWAYING VEGETATION SPRITES
    // -------------------------------------------------------------
    const crossQuadGeo = createCrossQuadGeometry(THREE, 0.82, 0.82);

    const vegetationLists = {
      tallGrass: [],
      flowerRed: [],
      flowerYellow: [],
      bush: []
    };

    // Find candidate grass blocks for organic clusters
    const candidateGrassBlocks = [];
    for (const b of islandBlocks.grass) {
      // Must not be near spawn path
      if (Math.abs(b.x) <= 2 && Math.abs(b.z) <= 2) continue;
      candidateGrassBlocks.push(b);
    }

    // Select organic cluster centers on grass
    const clusterCenters = [];
    const usedBlocks = new Set();
    const desiredClusterCount = 14;

    for (let i = 0; i < candidateGrassBlocks.length && clusterCenters.length < desiredClusterCount; i++) {
      const idx = Math.floor(pseudoHash(i * 17.3, seed) * candidateGrassBlocks.length);
      const b = candidateGrassBlocks[idx];
      const key = `${b.x},${b.z}`;
      if (!usedBlocks.has(key)) {
        clusterCenters.push(b);
        usedBlocks.add(key);
      }
    }

    // Add 1 to 2 tall grass clusters on the rim of each carved pond
    for (const p of ponds) {
      let rimCount = 0;
      for (const b of islandBlocks.grass) {
        const pd = Math.hypot(b.x - p.x, b.z - p.z);
        if (pd >= p.radius && pd <= p.radius + 1.25) {
          clusterCenters.push(b);
          rimCount++;
          if (rimCount >= 2) break;
        }
      }
    }

    // Populate vegetation instances in clusters of 3 to 6
    for (let cIdx = 0; cIdx < clusterCenters.length; cIdx++) {
      const center = clusterCenters[cIdx];
      const clusterSize = 3 + Math.floor(pseudoHash(center.x * 7.1, center.z * 11.3) * 4); // 3 to 6

      for (let sIdx = 0; sIdx < clusterSize; sIdx++) {
        const ox = (pseudoHash(center.x + sIdx * 3.7, center.z + 1.1) - 0.5) * 0.70;
        const oz = (pseudoHash(center.x + 2.2, center.z + sIdx * 4.9) - 0.5) * 0.70;
        const rotY = pseudoHash(center.x * 3.3 + sIdx, center.z * 7.7) * Math.PI * 2;
        const scale = 0.85 + pseudoHash(center.x * 9.1, center.z * 5.5 + sIdx) * 0.30;
        const phase = pseudoHash(center.x * 2.1, center.z * 3.7 + sIdx) * Math.PI * 2;

        const posX = center.x + ox;
        const posY = center.y + 0.5; // Sitting atop grass top surface
        const posZ = center.z + oz;

        // Type selection: tall grass (~65%), flowers (~25%), bush (~10%)
        const typeRoll = pseudoHash(center.x * 4.1 + sIdx * 5.3, center.z * 9.9);
        let vegType = 'tallGrass';
        if (typeRoll > 0.90) {
          vegType = 'bush';
        } else if (typeRoll > 0.78) {
          vegType = 'flowerYellow';
        } else if (typeRoll > 0.65) {
          vegType = 'flowerRed';
        }

        vegetationLists[vegType].push({
          x: posX,
          y: posY,
          z: posZ,
          rotY,
          scale,
          phase
        });
      }
    }

    // Build Instanced Meshes for Vegetation
    function buildVegetationMesh(geo, mat, list) {
      if (list.length === 0) return null;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        dummyObj.position.set(item.x, item.y, item.z);
        dummyObj.rotation.set(0, item.rotY, 0);
        dummyObj.scale.set(item.scale, item.scale, item.scale);
        dummyObj.updateMatrix();
        im.setMatrixAt(i, dummyObj.matrix);

        // Register for sway animation
        activeAnimationState.vegetationItems.push({
          mesh: im,
          index: i,
          x: item.x,
          y: item.y,
          z: item.z,
          baseRotY: item.rotY,
          scale: item.scale,
          phase: item.phase
        });
      }
      im.instanceMatrix.needsUpdate = true;
      return im;
    }

    const tallGrassMesh    = buildVegetationMesh(crossQuadGeo, tallGrassMat, vegetationLists.tallGrass);
    const flowerRedMesh    = buildVegetationMesh(crossQuadGeo, flowerRedMat, vegetationLists.flowerRed);
    const flowerYellowMesh = buildVegetationMesh(crossQuadGeo, flowerYellowMat, vegetationLists.flowerYellow);
    const bushMesh         = buildVegetationMesh(crossQuadGeo, bushMat, vegetationLists.bush);

    if (tallGrassMesh) scene.add(tallGrassMesh);
    if (flowerRedMesh) scene.add(flowerRedMesh);
    if (flowerYellowMesh) scene.add(flowerYellowMesh);
    if (bushMesh) scene.add(bushMesh);

    // Total block count
    const totalBlockCount =
      islandBlocks.grass.length +
      islandBlocks.dirt.length +
      islandBlocks.stone.length +
      islandBlocks.sand.length +
      islandBlocks.gravel.length +
      islandBlocks.pathway.length;

    // Return detailed metadata and accessors
    return {
      meshes: {
        grass: grassMesh,
        dirt: dirtMesh,
        stone: stoneMesh,
        sand: sandMesh,
        gravel: gravelMesh,
        pathway: pathwayMesh,
        waterGroup,
        tallGrass: tallGrassMesh,
        flowerRed: flowerRedMesh,
        flowerYellow: flowerYellowMesh,
        bush: bushMesh
      },
      ponds: pondMeta,
      blockCount: totalBlockCount,
      islandBlocks,
      getTerrainHeightAt,
      spawnPoint: { x: 0, y: 1.0, z: 0 },
      dimensions: { x: 40, z: 16 },
      update: updateWaterAndSway,
      dispose() {
        // Clean up geometries
        unitBox.dispose();
        crossQuadGeo.dispose();
      }
    };
  }

  // Exported API
  return {
    buildTerrainAndPonds,
    updateWaterAndSway,
    SimplexNoise,
    createVoxelMaterials,
    createCrossQuadGeometry
  };
}));
