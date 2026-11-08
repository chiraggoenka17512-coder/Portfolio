/**
 * ============================================================================
 * natural_landscape.js
 * ----------------------------------------------------------------------------
 * Standalone Procedural Natural Voxel Landscape & River Valley Module
 * for the 3D Minecraft Portfolio.
 *
 * Requirements Met:
 * 1. Landscape Grid:
 *    - Island dimensions approx 50x36 blocks: X in [-22, 28], Z in [-22, 14].
 *    - Player spawn at (0, groundY + 1, 8), facing forward towards -Z
 *      (camera behind looking across the river valley).
 * 2. Foreground (Z in [4, 12]):
 *    - Gentle grassy meadow at Y in [2, 3].
 *    - Sand beach bank sloping down towards the river edge.
 *    - Wildflower patches with yellow and white flowers in tall grass near spawn.
 * 3. Midground River (Z in [-2, 4]):
 *    - Shallow river running diagonally through the view:
 *      from X = -22, Z = 1 to X = 28, Z = -3, width 4 to 6 blocks.
 *    - Riverbed at Y = 0 (1 to 2 blocks below surrounding grass banks at Y = 2).
 *    - Riverbed composition: sand in center, gravel at water rim/edge.
 *    - Water surface: flat plane at Y = 0.85 with translucent blue material
 *      (color #3a88d4, opacity ~0.72) and subtle animated ripples.
 * 4. Background & Rising Mountain (Z in [-22, -2]):
 *    - Left side (X in [-22, -2], Z in [-22, -4]):
 *      Scenic rising mountain / steep hill reaching Y in [6, 10] blocks high.
 *      Steep slopes expose stone and dirt faces.
 *      Stepped terraces and summit ridge covered in grass.
 *    - Right side (X in [0, 28], Z in [-22, -4]):
 *      Gentle rolling grassy hill rising to Y in [3, 5].
 * 5. Surface Block Mixing:
 *    - Flat/gentle tops: lush grass (grass_top.png and grass_side.png).
 *    - River banks: sand and gravel.
 *    - Steep slopes (>= 2 block drop): stone and dirt.
 *    - Natural organic noise with fixed seed for 100% deterministic reproducibility.
 * 6. Export:
 *    - Export window.buildNaturalLandscape(scene, materials, options) returning:
 *      { islandBlocks, blockCount, riverWaterMesh, spawnPoint, getTerrainHeightAt(x, z), update(time) }
 *    - Standalone fallback textures so it renders immediately even before
 *      textures finish loading.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const THREE = (typeof global !== 'undefined' && global.THREE) ? global.THREE : null;
    module.exports = factory(THREE);
  } else {
    const exported = factory(root.THREE);
    root.NaturalLandscape = exported;
    root.buildNaturalLandscape = exported.buildNaturalLandscape;
    if (typeof window !== 'undefined') {
      window.buildNaturalLandscape = exported.buildNaturalLandscape;
      window.NaturalLandscape = exported;
    }
  }
}(typeof self !== 'undefined' ? self : this, function (importedTHREE) {
  'use strict';

  // Resolve THREE from argument, global window, or globalThis
  function getTHREE() {
    if (importedTHREE) return importedTHREE;
    if (typeof window !== 'undefined' && window.THREE) return window.THREE;
    if (typeof globalThis !== 'undefined' && globalThis.THREE) return globalThis.THREE;
    if (typeof global !== 'undefined' && global.THREE) return global.THREE;
    return null;
  }

  // ==========================================================================
  // 1. DETERMINISTIC PRNG & 2D SIMPLEX NOISE (Fixed Seed 1337)
  // ==========================================================================

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

  // Deterministic float hash in [0, 1] for jitter, orientation, and flower selection
  function pseudoHash(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  // ==========================================================================
  // 2. PROCEDURAL 16x16 PIXEL-ART FALLBACK TEXTURES
  // ==========================================================================

  const PixelFallbacks = {
    grassTop(ctx) {
      const palette = ['#5c8e32', '#6ca238', '#507c2a', '#79b442', '#466e24', '#88cf5d'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = Math.floor(pseudoHash(x * 3.1 + 0.5, y * 5.7 + 0.3) * palette.length);
          ctx.fillStyle = palette[idx % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    grassSide(ctx) {
      const grassCols = ['#5c8e32', '#6ca238', '#507c2a', '#79b442'];
      const dirtCols  = ['#866043', '#724f35', '#5c3e28', '#966c4c', '#684730'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (y < 2) {
            // Solid green top cap
            const idx = Math.floor(pseudoHash(x * 2.3, y * 7.1) * grassCols.length);
            ctx.fillStyle = grassCols[idx % grassCols.length];
          } else if (y < 6) {
            // Jagged dripping blades into rich loam
            const drip = 2 + Math.floor(pseudoHash(x * 5.7, 13.3) * 4);
            if (y <= drip) {
              const idx = Math.floor(pseudoHash(x * 2.3, y * 7.1) * grassCols.length);
              ctx.fillStyle = grassCols[idx % grassCols.length];
            } else {
              const idx = Math.floor(pseudoHash(x * 3.7, y * 4.9) * dirtCols.length);
              ctx.fillStyle = dirtCols[idx % dirtCols.length];
            }
          } else {
            // Subsoil dirt
            const idx = Math.floor(pseudoHash(x * 3.7, y * 4.9) * dirtCols.length);
            ctx.fillStyle = dirtCols[idx % dirtCols.length];
          }
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    dirt(ctx) {
      const palette = ['#866043', '#724f35', '#5c3e28', '#966c4c', '#684730', '#4e3321'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = Math.floor(pseudoHash(x * 4.1 + 1.2, y * 6.3 + 0.8) * palette.length);
          ctx.fillStyle = palette[idx % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    stoneGeneric(ctx) {
      const palette = ['#686868', '#747474', '#5a5a5a', '#828282', '#4e4e4e', '#909090'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = Math.floor(pseudoHash(x * 5.3 + 0.9, y * 8.1 + 0.4) * palette.length);
          ctx.fillStyle = palette[idx % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    sand(ctx) {
      const palette = ['#dbce9b', '#d2c48f', '#e4d7a7', '#c6b882', '#e9ddb2', '#b8a975'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = Math.floor(pseudoHash(x * 2.7 + 0.3, y * 4.1 + 1.7) * palette.length);
          ctx.fillStyle = palette[idx % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    sandstone(ctx) {
      const palette = ['#d8c89d', '#cbb886', '#e4d8b5', '#beaa76', '#decfa2'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = Math.floor(pseudoHash(x * 3.3, y * 7.5) * palette.length);
          ctx.fillStyle = palette[idx % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    gravel(ctx) {
      const palette = ['#797677', '#686466', '#8d898b', '#5a5758', '#9e9a9b', '#625f61'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const idx = Math.floor(pseudoHash(x * 3.9 + 2.1, y * 5.5 + 1.1) * palette.length);
          ctx.fillStyle = palette[idx % palette.length];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    },

    cobblestone(ctx) {
      const stoneCols = ['#686868', '#787878', '#5e5e5e', '#888888'];
      const mortarCols= ['#3f3f3f', '#333333', '#494949'];
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

    water(ctx) {
      const palette = ['#3a88d4', '#347ec8', '#4293df', '#2e74bd', '#4e9fe8'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const v = Math.sin(x * 0.45 + y * 0.35) * 0.5 + 0.5;
          const idx = Math.floor((v + pseudoHash(x * 2.3, y * 3.7) * 0.25) * palette.length) % palette.length;
          ctx.fillStyle = palette[idx];
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

    flowerYellow(ctx) {
      ctx.clearRect(0, 0, 16, 16);
      const cols = {
        S: '#2e551a',
        G: '#4b8228',
        Y: '#fac215',
        O: '#ea8c0a',
        L: '#fef08a',
        D: '#a16207'
      };
      const grid = [
        '................',
        '......YYYY......',
        '....YYLYYLYY....',
        '...YLYYYYYYLY...',
        '...YYYYOODYYYY..',
        '...YYYDDODYYYY..',
        '...YLYYYYYYLY...',
        '....YYOYYOYY....',
        '......ODDO......',
        '.......GG.......',
        '.......GS.......',
        '.....GGGS.......',
        '....GSSGS.GG....',
        '.......GSSGS....',
        '.......GS.......',
        '......SSS.......'
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

    flowerWhite(ctx) {
      ctx.clearRect(0, 0, 16, 16);
      const cols = {
        S: '#365314', // dark stem
        G: '#4d7c0f', // green stem/leaf
        L: '#65a30d', // light green leaf
        W: '#ffffff', // pure white petal
        H: '#f8fafc', // bright petal highlight
        T: '#e2e8f0', // soft white shadow
        Y: '#facc15', // yellow center
        O: '#ca8a04'  // golden center shadow
      };
      const grid = [
        '................',
        '.....WH.HW......',
        '....WWTTWWTT....',
        '...WHTYYYYTHW...',
        '...WTTYOODYTW...',
        '...WTTDOODTTW...',
        '...WHTYYYYTHW...',
        '....TTWWTTWW....',
        '.....TTH.TT.....',
        '.......GG.......',
        '.......GS.......',
        '.....GGGS.......',
        '...LGSSGS.GL....',
        '......GSSGS.....',
        '.......GS.......',
        '......SSS.......'
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

  // Immediate 16x16 canvas texture generation with async PNG loading fallback
  function getOrLoadPixelTexture(THREE, path, fallbackDrawFn) {
    if (typeof document === 'undefined') return null;

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

    // Asynchronously upgrade with PNG if available
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

  // Multi-material cube mapping with Three.js BoxGeometry face index order:
  // Face 0 (+X): Right side, color = 0.75
  // Face 1 (-X): Left side,  color = 0.75
  // Face 2 (+Y): Top face,   color = 1.05 (direct daytime sunlight)
  // Face 3 (-Y): Bottom,     color = 0.38 (underbelly shadow)
  // Face 4 (+Z): Front lit,  color = 0.78
  // Face 1 (-X) & Face 5 (-Z): Shadow side, color = 0.60 (darkened shadow side)
  function createVoxelMaterials(THREE, topTex, sideTex, botTex) {
    const cSideLit = new THREE.Color().setScalar(0.78);
    const cSideShadow = new THREE.Color().setScalar(0.60);
    const cTop  = new THREE.Color().setScalar(1.05);
    const cBot  = new THREE.Color().setScalar(0.38);
    return [
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSideLit }),    // +X (Face 0)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSideShadow }), // -X (Face 1: Shadow)
      new THREE.MeshLambertMaterial({ map: topTex,  color: cTop  }),        // +Y (Face 2: Top)
      new THREE.MeshLambertMaterial({ map: botTex,  color: cBot  }),        // -Y (Face 3: Bottom)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSideLit }),    // +Z (Face 4: Front lit)
      new THREE.MeshLambertMaterial({ map: sideTex, color: cSideShadow })  // -Z (Face 5: Shadow)
    ];
  }

  // Cross-Quad Sprite Geometry for Vegetation (intersecting at 45 degrees)
  function createCrossQuadGeometry(THREE, width = 0.82, height = 0.85) {
    const hw = width * 0.5;
    const d = hw * 0.7071; // 45 degree diagonal offset
    const geom = new THREE.BufferGeometry();

    const positions = new Float32Array([
      // Quad 1: (-d, 0, -d) to (d, height, d)
      -d, 0, -d,
       d, 0,  d,
       d, height,  d,
      -d, height, -d,

      // Quad 2: (-d, 0, d) to (d, height, -d)
      -d, 0,  d,
       d, 0, -d,
       d, height, -d,
      -d, height,  d
    ]);

    const normals = new Float32Array([
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
      0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0
    ]);

    const uvs = new Float32Array([
      0, 0,  1, 0,  1, 1,  0, 1,
      0, 0,  1, 0,  1, 1,  0, 1
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

  // ==========================================================================
  // 3. MAIN EXPORT: buildNaturalLandscape(scene, materials, options)
  // ==========================================================================

  // Animation registration state across frames
  const activeAnimationState = {
    waterMesh: null,
    waterTexture: null,
    vegetationItems: [],
    vegetationMeshes: [],
    sharedDummy: null
  };

  /**
   * Updates water ripples and vegetation wind sway.
   * Call inside the requestAnimationFrame loop: update(timeInSeconds)
   */
  function updateNaturalLandscape(time = 0) {
    // 1. Water ripple shimmer and flow
    if (activeAnimationState.waterTexture) {
      activeAnimationState.waterTexture.offset.x = (time * 0.05) % 1.0;
      activeAnimationState.waterTexture.offset.y = (Math.sin(time * 0.35) * 0.02) % 1.0;
    }

    if (activeAnimationState.waterMesh && activeAnimationState.waterMesh.geometry) {
      const posAttr = activeAnimationState.waterMesh.geometry.attributes.position;
      if (posAttr) {
        const arr = posAttr.array;
        for (let i = 0; i < arr.length; i += 3) {
          const vx = arr[i];
          const vz = arr[i + 2];
          const wave = Math.sin(vx * 0.65 + time * 2.2) * 0.022 + Math.cos(vz * 0.95 + time * 1.7) * 0.018;
          arr[i + 1] = 0.85 + wave;
        }
        posAttr.needsUpdate = true;
      }
    }

    // 2. Vegetation subtle wind sway
    if (activeAnimationState.vegetationItems.length > 0 && activeAnimationState.sharedDummy) {
      const dummy = activeAnimationState.sharedDummy;
      for (let i = 0; i < activeAnimationState.vegetationItems.length; i++) {
        const item = activeAnimationState.vegetationItems[i];
        const swayAngle = Math.sin(time * 2.2 + item.phase) * 0.07;
        const swayTilt  = Math.cos(time * 1.7 + item.phase) * 0.04;

        dummy.position.set(item.x, item.y, item.z);
        dummy.rotation.set(swayTilt, item.baseRotY + swayAngle, 0);
        dummy.scale.set(item.scale, item.scale, item.scale);
        dummy.updateMatrix();

        item.mesh.setMatrixAt(item.index, dummy.matrix);
      }

      for (let m = 0; m < activeAnimationState.vegetationMeshes.length; m++) {
        activeAnimationState.vegetationMeshes[m].instanceMatrix.needsUpdate = true;
      }
    }
  }

  /**
   * Builds the natural voxel landscape matching the reference Minecraft valley:
   * 50x36 floating island, diagonal river, foreground meadow with wildflowers,
   * background mountain with stepped terraces on the left, rolling hills on the right.
   *
   * @param {THREE.Scene} scene
   * @param {Object} [materials]
   * @param {Object} [options]
   * @returns {Object} { islandBlocks, blockCount, riverWaterMesh, spawnPoint, getTerrainHeightAt, update, meshes, dispose }
   */
  function buildNaturalLandscape(scene, materials = {}, options = {}) {
    const THREE = getTHREE();
    if (!THREE) {
      throw new Error('Three.js (THREE) is required to build the natural landscape.');
    }

    const seed = options.seed !== undefined ? options.seed : 1337;
    const noise = new SimplexNoise(seed);

    // Reset animation state
    activeAnimationState.waterMesh = null;
    activeAnimationState.waterTexture = null;
    activeAnimationState.vegetationItems = [];
    activeAnimationState.vegetationMeshes = [];
    if (!activeAnimationState.sharedDummy) {
      activeAnimationState.sharedDummy = new THREE.Object3D();
    }

    // ------------------------------------------------------------------------
    // A. TEXTURES & MATERIALS PREPARATION
    // ------------------------------------------------------------------------
    const texPath = 'textures/primary_16x16_block_set/';
    const grassTopTex     = getOrLoadPixelTexture(THREE, texPath + 'grass_top.png', PixelFallbacks.grassTop);
    const grassSideTex    = getOrLoadPixelTexture(THREE, texPath + 'grass_side.png', PixelFallbacks.grassSide);
    const dirtTex         = getOrLoadPixelTexture(THREE, texPath + 'dirt.png', PixelFallbacks.dirt);
    const stoneGenericTex = getOrLoadPixelTexture(THREE, texPath + 'stone_generic.png', PixelFallbacks.stoneGeneric);
    const sandstoneTex    = getOrLoadPixelTexture(THREE, texPath + 'sandstone.png', PixelFallbacks.sandstone);
    const cobblestoneTex  = getOrLoadPixelTexture(THREE, texPath + 'cobblestone.png', PixelFallbacks.cobblestone);
    const sandTex         = getOrLoadPixelTexture(THREE, texPath + 'sand.png', PixelFallbacks.sand);
    const gravelTex       = getOrLoadPixelTexture(THREE, texPath + 'gravel.png', PixelFallbacks.gravel);

    const waterTex = getOrLoadPixelTexture(THREE, 'textures/kenney_voxel_pack/water.png', PixelFallbacks.water);
    if (waterTex) {
      waterTex.wrapS = THREE.RepeatWrapping;
      waterTex.wrapT = THREE.RepeatWrapping;
      waterTex.repeat.set(3, 3);
      activeAnimationState.waterTexture = waterTex;
    }

    const tallGrassTex    = getOrLoadPixelTexture(THREE, texPath + 'tall_grass.png', PixelFallbacks.tallGrass);
    const flowerYellowTex = getOrLoadPixelTexture(THREE, texPath + 'flower_yellow.png', PixelFallbacks.flowerYellow);
    const flowerWhiteTex  = getOrLoadPixelTexture(THREE, texPath + 'flower_white.png', PixelFallbacks.flowerWhite);
    const flowerRedTex    = getOrLoadPixelTexture(THREE, texPath + 'flower_red.png', PixelFallbacks.flowerRed);
    const bushTex         = getOrLoadPixelTexture(THREE, texPath + 'bush.png', PixelFallbacks.bush);

    const grassMaterials = materials.grass || createVoxelMaterials(THREE, grassTopTex, grassSideTex, dirtTex);
    const dirtMaterials  = materials.dirt  || createVoxelMaterials(THREE, dirtTex, dirtTex, dirtTex);
    const stoneMaterials = materials.stone || createVoxelMaterials(THREE, stoneGenericTex, stoneGenericTex, stoneGenericTex);
    const sandMaterials  = materials.sand  || createVoxelMaterials(THREE, sandTex, sandTex, sandstoneTex);
    const gravelMaterials= materials.gravel|| createVoxelMaterials(THREE, gravelTex, gravelTex, cobblestoneTex);

    // Requirement 3: Flat water plane at Y = 0.85 with translucent saturated blue material
    const waterMat = materials.water || new THREE.MeshLambertMaterial({
      color: 0x1860c4,
      emissive: 0x082858,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Vegetation Materials (alpha-tested with DoubleSide)
    const tallGrassMat = materials.tallGrass || new THREE.MeshLambertMaterial({
      map: tallGrassTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const flowerYellowMat = materials.flowerYellow || new THREE.MeshLambertMaterial({
      map: flowerYellowTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const flowerWhiteMat = materials.flowerWhite || new THREE.MeshLambertMaterial({
      map: flowerWhiteTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const flowerRedMat = materials.flowerRed || new THREE.MeshLambertMaterial({
      map: flowerRedTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    const bushMat = materials.bush || new THREE.MeshLambertMaterial({
      map: bushTex,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    // ------------------------------------------------------------------------
    // B. GRID DIMENSIONS & RIVER TRAJECTORY
    // ------------------------------------------------------------------------
    // Grid: approx 50x36 blocks: X in [-22, 28], Z in [-22, 14]
    const minX = -22;
    const maxX = 28;
    const minZ = -22;
    const maxZ = 14;

    const cx = (minX + maxX) * 0.5; // 3.0
    const cz = (minZ + maxZ) * 0.5; // -4.0
    const rx = (maxX - minX) * 0.5; // 25.0
    const rz = (maxZ - minZ) * 0.5; // 18.0

    // Requirement 3: River runs diagonally through the view:
    // From X = -22, Z = 1 to X = 28, Z = -3, width 4 to 6 blocks.
    function getRiverCenterlineZ(x) {
      const t = (x - minX) / (maxX - minX); // 0 at x = -22, 1 at x = 28
      const baseZ = 1.0 + t * (-4.0); // 1.0 down to -3.0
      // Subtle organic meander that tapers to 0 at the island edges
      const taper = Math.sin(t * Math.PI);
      const meander = taper * (Math.sin(x * 0.14) * 1.25 + Math.sin(x * 0.31 + 0.5) * 0.45);
      return baseZ + meander;
    }

    function getRiverWidth(x) {
      // River width 4 to 6 blocks (halfWidth in [2.1, 2.8])
      return 4.8 + Math.sin(x * 0.17 + 1.0) * 0.7;
    }

    // ------------------------------------------------------------------------
    // C. PASS 1: PROCEDURAL HEIGHT & SURFACE DETERMINATION
    // ------------------------------------------------------------------------
    const heightMap = new Map();
    const surfaceTypeMap = new Map();
    const islandColumns = new Map();
    const riverColumns = new Map();

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const nx = (x - cx) / rx;
        const nz = (z - cz) / rz;

        // Super-elliptical island boundary with organic noise
        const distSuper = Math.pow(Math.abs(nx), 3.2) + Math.pow(Math.abs(nz), 3.2);
        const bNoise = noise.noise2D(x * 0.15 + 7.3, z * 0.15 + 1.9) * 0.12;
        const effectiveDist = distSuper + bNoise;

        // Ensure key features (spawn, river ends, mountain peaks) stay inside island
        const isRiverExtent = (x === minX && Math.abs(z - 1) <= 3) || (x === maxX && Math.abs(z - (-3)) <= 3);
        const isCore = (Math.abs(x) <= 12 && z >= 2 && z <= 10);
        const isLeftMtn = (x >= -20 && x <= -4 && z >= -20 && z <= -6);
        const isRightHill = (x >= 4 && x <= 24 && z >= -20 && z <= -6);

        if (effectiveDist <= 1.05 || isRiverExtent || isCore || isLeftMtn || isRightHill) {
          const colKey = `${x},${z}`;
          islandColumns.set(colKey, { x, z, distSuper });

          const rCenterZ = getRiverCenterlineZ(x);
          const rWidth = getRiverWidth(x);
          const halfW = rWidth * 0.5;
          const dz = z - rCenterZ;
          const absDz = Math.abs(dz);

          let topY = 2;
          let surfaceType = 'grass';

          if (absDz <= halfW) {
            // ================================================================
            // ZONE 1: RIVERBED (Y = 0)
            // ================================================================
            topY = 0;
            // Center is sand, outer rim is gravel
            if (absDz <= halfW * 0.52) {
              surfaceType = 'sand';
            } else {
              surfaceType = 'gravel';
            }
            riverColumns.set(colKey, { x, z });
          } else if (dz > halfW) {
            // ================================================================
            // ZONE 2: FOREGROUND MEADOW & BEACH BANK (Z in [4, 12])
            // ================================================================
            const distBank = absDz - halfW;
            if (distBank <= 1.35) {
              // Sand beach bank sloping down towards the river edge
              topY = 1;
              surfaceType = 'sand';
            } else if (distBank <= 2.5) {
              // Transition from beach to meadow
              topY = 2;
              surfaceType = (distBank <= 1.9) ? 'sand' : 'grass';
            } else {
              // Gentle grassy meadow at Y in [2, 3]
              topY = 2;
              surfaceType = 'grass';

              // Gentle 1-block rise towards southern perimeter (Z >= 10)
              const meadowNoise = noise.noise2D(x * 0.12, z * 0.14);
              if (z >= 10 && meadowNoise > 0.28 && Math.abs(x) > 2) {
                topY = 3;
              }

              // Keep spawn area (0, 8) flat at baseline Y = 2
              const dSpawn = Math.hypot(x - 0, z - 8);
              if (dSpawn <= 3.2) {
                topY = 2;
              }
            }
          } else {
            // ================================================================
            // ZONE 3: BACKGROUND MOUNTAIN & ROLLING HILL (Z in [-22, -2])
            // ================================================================
            const distBank = absDz - halfW;
            if (distBank <= 1.25) {
              // Sloping river bank (north edge)
              topY = 1;
              surfaceType = 'gravel';
            } else if (distBank <= 2.2) {
              topY = 2;
              surfaceType = 'grass';
            } else {
              // Background terrain: Left Mountain vs Right Rolling Hill
              if (x <= -2) {
                // Left Mountain: reaching Y in [6, 10]
                const d1 = Math.hypot((x - (-14)) / 7.8, (z - (-14)) / 6.5);
                const d2 = Math.hypot((x - (-8)) / 6.0,  (z - (-10)) / 5.2);
                const d3 = Math.hypot((x - (-19)) / 6.0, (z - (-16)) / 5.2);

                const peak1 = Math.max(0, 1.0 - d1) * 7.8; // reaches ~9.8
                const peak2 = Math.max(0, 1.0 - d2) * 5.2; // reaches ~7.2
                const peak3 = Math.max(0, 1.0 - d3) * 6.5; // reaches ~8.5
                const mtnRaw = Math.max(peak1, peak2, peak3);

                const mNoise = noise.noise2D(x * 0.14, z * 0.16) * 1.5 +
                               noise.noise2D(x * 0.32 + 4.1, z * 0.35 + 2.7) * 0.6;
                const hVal = 2.0 + mtnRaw + mNoise;

                // Terraced steps
                topY = Math.min(10, Math.max(2, Math.round(hVal)));
                surfaceType = 'grass';
              } else if (x >= 0) {
                // Right Rolling Hill: rising to Y in [3, 5]
                const dHill = Math.hypot((x - 14) / 11.5, (z - (-13)) / 8.5);
                const hillRaw = Math.max(0, 1.0 - dHill) * 2.8;
                const hNoise = noise.noise2D(x * 0.12, z * 0.14) * 0.75;
                const hVal = 2.0 + hillRaw + hNoise;

                topY = Math.min(5, Math.max(2, Math.round(hVal)));
                surfaceType = 'grass';
              } else {
                // Valley pass / gap between mountain and hill
                topY = 2;
                surfaceType = 'grass';
              }
            }
          }

          heightMap.set(colKey, topY);
          surfaceTypeMap.set(colKey, surfaceType);
        }
      }
    }

    // ------------------------------------------------------------------------
    // D. PASS 2: CLIFF EXPOSURE & SURFACE BLOCK MIXING
    // ------------------------------------------------------------------------
    // Requirement 5: Steep slopes (>= 2 block drop): stone and dirt.
    // Stepped terraces and summit ridge covered in grass.
    for (const [colKey, topY] of heightMap.entries()) {
      const { x, z } = islandColumns.get(colKey);
      let minNeighbor = topY;
      let flatNeighbors = 0;

      for (const [nx, nz] of [[x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]]) {
        const nkey = `${nx},${nz}`;
        if (heightMap.has(nkey)) {
          const nh = heightMap.get(nkey);
          if (nh < minNeighbor) minNeighbor = nh;
          if (nh === topY) flatNeighbors++;
        } else {
          // Island boundary drop
          if (minNeighbor > 0) minNeighbor = 0;
        }
      }

      const drop = topY - minNeighbor;
      const currentSurf = surfaceTypeMap.get(colKey);

      // On steep mountain drop (drop >= 2):
      // If flat top/terrace or summit ridge (flatNeighbors >= 2), keep grass.
      // If narrow cliff rim or drop >= 3, expose stone or dirt.
      if (drop >= 2 && currentSurf === 'grass') {
        if (drop >= 3 || flatNeighbors <= 1) {
          const jitter = pseudoHash(x * 7.1, z * 9.3);
          surfaceTypeMap.set(colKey, jitter > 0.35 ? 'stone' : 'dirt');
        }
      }
    }

    // Height lookup helper
    function getTerrainHeightAt(x, z) {
      const rx = Math.round(x);
      const rz = Math.round(z);
      const key = `${rx},${rz}`;
      if (heightMap.has(key)) {
        return heightMap.get(key);
      }
      return 2;
    }

    // ------------------------------------------------------------------------
    // E. PASS 3: VOXEL COLUMNS & UNDERBELLY KEEL GENERATION
    // ------------------------------------------------------------------------
    const islandBlocks = {
      grass: [],
      dirt: [],
      stone: [],
      sand: [],
      gravel: []
    };

    for (const [colKey, { x, z, distSuper }] of islandColumns.entries()) {
      const topY = heightMap.get(colKey);
      const surfaceType = surfaceTypeMap.get(colKey);

      // 1. Surface block
      islandBlocks[surfaceType].push({ x, y: topY, z });

      // 2. Sub-surface vertical column down to Y = 0
      for (let sy = topY - 1; sy >= 0; sy--) {
        if (surfaceType === 'stone') {
          islandBlocks.stone.push({ x, y: sy, z });
        } else if (surfaceType === 'sand') {
          islandBlocks.sand.push({ x, y: sy, z });
        } else if (surfaceType === 'gravel') {
          islandBlocks.gravel.push({ x, y: sy, z });
        } else {
          // Under grass: top 1-2 blocks dirt, then stone bedrock
          if (sy >= topY - 2) {
            islandBlocks.dirt.push({ x, y: sy, z });
          } else {
            islandBlocks.stone.push({ x, y: sy, z });
          }
        }
      }

      // 3. Floating island underbelly keel below Y = 0
      // Tapers inward toward center for classic floating island profile
      if (distSuper <= 0.96) {
        islandBlocks.dirt.push({ x, y: -1, z });
      }
      if (distSuper <= 0.74) {
        islandBlocks.stone.push({ x, y: -2, z });
      }
      if (distSuper <= 0.50) {
        islandBlocks.stone.push({ x, y: -3, z });
      }
      if (distSuper <= 0.28) {
        islandBlocks.stone.push({ x, y: -4, z });
      }
    }

    // ------------------------------------------------------------------------
    // F. PASS 4: BUILD THREE.InstancedMesh FOR ALL VOXEL BLOCKS
    // ------------------------------------------------------------------------
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const dummyObj = new THREE.Object3D();
    const tempCol = new THREE.Color();

    function buildVoxelInstancedMesh(materialsList, blockList) {
      if (!blockList || blockList.length === 0) return null;
      const im = new THREE.InstancedMesh(unitBox, materialsList, blockList.length);
      for (let i = 0; i < blockList.length; i++) {
        const b = blockList[i];
        dummyObj.position.set(b.x, b.y, b.z);
        dummyObj.rotation.set(0, 0, 0);
        dummyObj.scale.set(1, 1, 1);
        dummyObj.updateMatrix();
        im.setMatrixAt(i, dummyObj.matrix);

        // Ambient Occlusion in crevice dips + Color Jitter
        let higherCount = 0;
        for (const [nx, nz] of [[b.x + 1, b.z], [b.x - 1, b.z], [b.x, b.z + 1], [b.x, b.z - 1]]) {
          const nh = heightMap.get(`${nx},${nz}`);
          if (nh !== undefined && nh > b.y) higherCount++;
        }
        for (const [nx, nz] of [[b.x + 1, b.z + 1], [b.x - 1, b.z + 1], [b.x + 1, b.z - 1], [b.x - 1, b.z - 1]]) {
          const nh = heightMap.get(`${nx},${nz}`);
          if (nh !== undefined && nh > b.y) higherCount += 0.5;
        }

        const aoFactor = Math.max(0.68, 1.0 - higherCount * 0.08);
        const jitter = 0.97 + pseudoHash(b.x * 13.1 + b.y * 5.3, b.z * 19.7) * 0.06;
        const brightness = aoFactor * jitter;

        tempCol.setRGB(brightness, brightness, brightness);
        im.setColorAt(i, tempCol);
      }
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      return im;
    }

    const grassMesh  = buildVoxelInstancedMesh(grassMaterials, islandBlocks.grass);
    const dirtMesh   = buildVoxelInstancedMesh(dirtMaterials,  islandBlocks.dirt);
    const stoneMesh  = buildVoxelInstancedMesh(stoneMaterials, islandBlocks.stone);
    const sandMesh   = buildVoxelInstancedMesh(sandMaterials,  islandBlocks.sand);
    const gravelMesh = buildVoxelInstancedMesh(gravelMaterials,islandBlocks.gravel);

    if (grassMesh)  scene.add(grassMesh);
    if (dirtMesh)   scene.add(dirtMesh);
    if (stoneMesh)  scene.add(stoneMesh);
    if (sandMesh)   scene.add(sandMesh);
    if (gravelMesh) scene.add(gravelMesh);

    // ------------------------------------------------------------------------
    // G. PASS 5: RIVER WATER SURFACE MESH (Y = 0.85)
    // ------------------------------------------------------------------------
    // Requirement 3: Flat plane at Y = 0.85 with translucent blue material
    // (color #3a88d4, opacity ~0.72) and subtle animated ripples.
    const waterQuadPositions = [];
    const waterQuadNormals = [];
    const waterQuadUvs = [];
    const waterIndices = [];

    for (const [key, col] of riverColumns.entries()) {
      const { x, z } = col;
      const baseIdx = waterQuadPositions.length / 3;

      // Horizontal quad covering cell [x - 0.5, x + 0.5] x [z - 0.5, z + 0.5] at Y = 0.85
      waterQuadPositions.push(
        x - 0.5, 0.85, z - 0.5,
        x + 0.5, 0.85, z - 0.5,
        x + 0.5, 0.85, z + 0.5,
        x - 0.5, 0.85, z + 0.5
      );

      waterQuadNormals.push(
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
      );

      const u0 = (x - 0.5 + 25) * 0.35;
      const u1 = (x + 0.5 + 25) * 0.35;
      const v0 = (z - 0.5 + 25) * 0.35;
      const v1 = (z + 0.5 + 25) * 0.35;

      waterQuadUvs.push(
        u0, v0,
        u1, v0,
        u1, v1,
        u0, v1
      );

      waterIndices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx, baseIdx + 2, baseIdx + 3
      );
    }

    const waterGeo = new THREE.BufferGeometry();
    waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waterQuadPositions, 3));
    waterGeo.setAttribute('normal', new THREE.Float32BufferAttribute(waterQuadNormals, 3));
    waterGeo.setAttribute('uv', new THREE.Float32BufferAttribute(waterQuadUvs, 2));
    waterGeo.setIndex(waterIndices);

    const riverWaterMesh = new THREE.Mesh(waterGeo, waterMat);
    riverWaterMesh.name = 'RiverWaterMesh';
    scene.add(riverWaterMesh);
    activeAnimationState.waterMesh = riverWaterMesh;

    // ------------------------------------------------------------------------
    // H. PASS 6: WILDFLOWER PATCHES & TALL GRASS NEAR SPAWN
    // ------------------------------------------------------------------------
    // Requirement 2: Wildflower patches with yellow and white flowers in tall grass near spawn.
    const crossQuadGeo = createCrossQuadGeometry(THREE, 0.82, 0.85);

    const vegetationLists = {
      tallGrass: [],
      flowerYellow: [],
      flowerWhite: [],
      flowerRed: [],
      bush: []
    };

    // Candidate grass blocks in foreground meadow (Z in [5, 12], X in [-14, 18])
    const foregroundGrassBlocks = [];
    for (const b of islandBlocks.grass) {
      if (b.z >= 5 && b.z <= 12 && b.x >= -14 && b.x <= 18) {
        foregroundGrassBlocks.push(b);
      }
    }

    // Five organic wildflower patch hubs surrounding the spawn area (0, 8)
    const wildflowerHubs = [
      { x: -2.5, z: 6.8, radius: 2.5, bias: 'flowerYellow' },
      { x:  2.5, z: 7.2, radius: 2.5, bias: 'flowerWhite' },
      { x: -3.2, z: 9.5, radius: 2.8, bias: 'mixed' },
      { x:  3.0, z: 9.2, radius: 2.6, bias: 'flowerWhite' },
      { x:  0.0, z: 10.6, radius: 2.4, bias: 'mixed' }
    ];

    for (let i = 0; i < foregroundGrassBlocks.length; i++) {
      const gb = foregroundGrassBlocks[i];
      const dSpawn = Math.hypot(gb.x - 0, gb.z - 8);

      // Keep 1-block clear clearance right on player spawn point
      if (dSpawn < 1.1) continue;

      // Check proximity to wildflower patch hubs
      let inHub = false;
      let hubBias = 'tallGrass';
      for (const hub of wildflowerHubs) {
        const dHub = Math.hypot(gb.x - hub.x, gb.z - hub.z);
        if (dHub <= hub.radius) {
          inHub = true;
          hubBias = hub.bias;
          break;
        }
      }

      const placeChance = inHub ? 0.72 : (dSpawn <= 6.5 ? 0.38 : 0.18);
      const hVal = pseudoHash(gb.x * 8.3 + 1.1, gb.z * 11.7 + 3.4);

      if (hVal < placeChance) {
        // Determine vegetation species
        let vType = 'tallGrass';
        const typeHash = pseudoHash(gb.x * 17.1, gb.z * 23.3);

        if (inHub) {
          if (hubBias === 'flowerYellow') {
            vType = typeHash < 0.50 ? 'flowerYellow' : (typeHash < 0.72 ? 'flowerWhite' : 'tallGrass');
          } else if (hubBias === 'flowerWhite') {
            vType = typeHash < 0.50 ? 'flowerWhite' : (typeHash < 0.72 ? 'flowerYellow' : 'tallGrass');
          } else {
            // Mixed hub: yellow and white flowers with tall grass
            if (typeHash < 0.35) vType = 'flowerYellow';
            else if (typeHash < 0.70) vType = 'flowerWhite';
            else if (typeHash < 0.88) vType = 'tallGrass';
            else vType = 'flowerRed';
          }
        } else {
          // Scattered meadow vegetation
          if (typeHash < 0.55) vType = 'tallGrass';
          else if (typeHash < 0.75) vType = 'flowerYellow';
          else if (typeHash < 0.90) vType = 'flowerWhite';
          else vType = 'bush';
        }

        const rotY = pseudoHash(gb.x * 5.9, gb.z * 7.7) * Math.PI * 2;
        const scale = 0.78 + pseudoHash(gb.x * 9.1, gb.z * 3.3) * 0.22;
        const phase = pseudoHash(gb.x * 12.3, gb.z * 4.7) * Math.PI * 2;

        vegetationLists[vType].push({
          x: gb.x,
          y: gb.y + 0.5, // Base resting cleanly on top of grass block
          z: gb.z,
          rotY,
          scale,
          phase
        });
      }
    }

    // Build Instanced Meshes for vegetation
    function buildVegetationMesh(geo, mat, list) {
      if (!list || list.length === 0) return null;
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        dummyObj.position.set(item.x, item.y, item.z);
        dummyObj.rotation.set(0, item.rotY, 0);
        dummyObj.scale.set(item.scale, item.scale, item.scale);
        dummyObj.updateMatrix();
        im.setMatrixAt(i, dummyObj.matrix);

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
      activeAnimationState.vegetationMeshes.push(im);
      scene.add(im);
      return im;
    }

    const tallGrassMesh    = buildVegetationMesh(crossQuadGeo, tallGrassMat,    vegetationLists.tallGrass);
    const flowerYellowMesh = buildVegetationMesh(crossQuadGeo, flowerYellowMat, vegetationLists.flowerYellow);
    const flowerWhiteMesh  = buildVegetationMesh(crossQuadGeo, flowerWhiteMat,  vegetationLists.flowerWhite);
    const flowerRedMesh    = buildVegetationMesh(crossQuadGeo, flowerRedMat,    vegetationLists.flowerRed);
    const bushMesh         = buildVegetationMesh(crossQuadGeo, bushMat,         vegetationLists.bush);

    // ------------------------------------------------------------------------
    // I. METRICS & RETURN CONTRACT
    // ------------------------------------------------------------------------
    const totalBlockCount =
      islandBlocks.grass.length +
      islandBlocks.dirt.length +
      islandBlocks.stone.length +
      islandBlocks.sand.length +
      islandBlocks.gravel.length;

    // Player spawn: (0, groundY + 1, 8), facing forward towards -Z
    const groundYAtSpawn = getTerrainHeightAt(0, 8); // 2
    const spawnPoint = {
      x: 0,
      y: groundYAtSpawn + 1.0, // 3.0
      z: 8,
      facing: { x: 0, y: 0, z: -1 },
      yaw: 0
    };

    return {
      islandBlocks,
      blockCount: totalBlockCount,
      riverWaterMesh,
      spawnPoint,
      getTerrainHeightAt,
      update: updateNaturalLandscape,
      meshes: {
        grass: grassMesh,
        dirt: dirtMesh,
        stone: stoneMesh,
        sand: sandMesh,
        gravel: gravelMesh,
        riverWater: riverWaterMesh,
        tallGrass: tallGrassMesh,
        flowerYellow: flowerYellowMesh,
        flowerWhite: flowerWhiteMesh,
        flowerRed: flowerRedMesh,
        bush: bushMesh
      },
      dimensions: {
        minX,
        maxX,
        minZ,
        maxZ,
        width: maxX - minX,
        depth: maxZ - minZ
      },
      dispose() {
        unitBox.dispose();
        crossQuadGeo.dispose();
        waterGeo.dispose();
      }
    };
  }

  // Exported Module Definition
  return {
    buildNaturalLandscape,
    updateNaturalLandscape,
    SimplexNoise,
    PixelFallbacks,
    createVoxelMaterials,
    createCrossQuadGeometry
  };
}));
