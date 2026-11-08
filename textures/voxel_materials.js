/**
 * ============================================================================
 * Voxel Material Specialist - Pixel-Perfect 16x16 Texture & Multi-Material Set
 * ============================================================================
 * 
 * Provides authentic, crisp 16x16 pixel-art Three.js materials matching
 * classic voxel aesthetics and diorama visual rules:
 * 
 * 1. Pixel-Art Sharpness:
 *    - NearestFilter magnification & minification (no bilinear blur).
 *    - generateMipmaps = false (avoids mipmap downsample blurring).
 * 
 * 2. Multi-Material Cube Mapping (Three.js BoxGeometry face index order):
 *    - Face 0 (+X): Right side
 *    - Face 1 (-X): Left side
 *    - Face 2 (+Y): Top face
 *    - Face 3 (-Y): Bottom underside
 *    - Face 4 (+Z): Front side
 *    - Face 5 (-Z): Back side
 * 
 * 3. Directional Face Shading Multipliers:
 *    - Top (+Y): 1.00 (direct sunlight overhead)
 *    - Sides (±X, ±Z): 0.75 (medium bounce lighting)
 *    - Bottom (-Y): 0.45 (underbelly shadow)
 * 
 * 4. Authentic 16x16 Blocks Supported:
 *    - grass:  Top = grass_top.png, Sides = grass_side.png, Bottom = dirt.png
 *    - dirt:   All 6 faces = dirt.png
 *    - stone:  All 6 faces = stone_generic.png
 *    - sand:   All 6 faces = sandstone.png
 *    - gravel: All 6 faces = slate_tiles.png
 * 
 * @module voxel_materials
 */

/**
 * Directional lighting multipliers for Three.js cube faces.
 */
export const SHADING_MULTIPLIERS = Object.freeze({
  TOP: 1.00,     // +Y face (overhead sky/sunlight illumination)
  SIDE: 0.75,    // ±X, ±Z faces (lateral diffuse bounce)
  BOTTOM: 0.45   // -Y face (deep occluded underbelly shadow)
});

/**
 * Mapping of Three.js BoxGeometry face indices to orientation.
 */
export const FACE_INDICES = Object.freeze({
  POS_X: 0, // +X (Right)
  NEG_X: 1, // -X (Left)
  POS_Y: 2, // +Y (Top)
  NEG_Y: 3, // -Y (Bottom)
  POS_Z: 4, // +Z (Front)
  NEG_Z: 5  // -Z (Back)
});

/**
 * Resolves the active THREE instance from options, global scope, or window.
 * 
 * @param {Object} [options]
 * @returns {Object} Three.js library instance
 */
function resolveThree(options) {
  if (options && options.THREE) return options.THREE;
  if (typeof THREE !== 'undefined') return THREE;
  if (typeof window !== 'undefined' && window.THREE) return window.THREE;
  if (typeof globalThis !== 'undefined' && globalThis.THREE) return globalThis.THREE;
  throw new Error(
    '[voxel_materials] Three.js (THREE) is required. Ensure Three.js is loaded globally or pass options.THREE.'
  );
}

/**
 * Configures a Three.js texture with pixel-art nearest-neighbor filtering and no mipmaps.
 * 
 * @param {THREE.Texture} texture - Three.js texture to configure
 * @param {Object} [THREE_INSTANCE] - Optional Three.js reference
 * @returns {THREE.Texture} Configured texture
 */
export function configurePixelArtTexture(texture, THREE_INSTANCE) {
  if (!texture) return texture;
  const T = THREE_INSTANCE || (typeof THREE !== 'undefined' ? THREE : null);
  const nearest = T && T.NearestFilter ? T.NearestFilter : 1003; // THREE.NearestFilter is constant 1003

  texture.magFilter = nearest;
  texture.minFilter = nearest;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a 6-face multi-material array for a Three.js BoxGeometry cube
 * with directional shading multipliers (+Y: 1.00, sides: 0.75, bottom: 0.45).
 * 
 * @param {THREE.Texture} topTex    - Texture for +Y face
 * @param {THREE.Texture} sideTex   - Texture for +X, -X, +Z, -Z faces
 * @param {THREE.Texture} bottomTex - Texture for -Y face
 * @param {Object} [options]        - Optional configuration overrides
 * @returns {Array<THREE.Material>} Array of 6 materials for BoxGeometry
 */
export function createVoxelMaterials(topTex, sideTex, bottomTex, options = {}) {
  const T = resolveThree(options);
  const MaterialClass = options.MaterialClass || T.MeshLambertMaterial;
  const multipliers = Object.assign({}, SHADING_MULTIPLIERS, options.shadingMultipliers || {});

  const cSide   = new T.Color().setScalar(multipliers.SIDE !== undefined ? multipliers.SIDE : 0.75);
  const cTop    = new T.Color().setScalar(multipliers.TOP !== undefined ? multipliers.TOP : 1.00);
  const cBottom = new T.Color().setScalar(multipliers.BOTTOM !== undefined ? multipliers.BOTTOM : 0.45);

  const extraProps = options.materialOptions || {};

  return [
    new MaterialClass(Object.assign({ map: sideTex,   color: cSide.clone() },   extraProps)), // Face 0: +X
    new MaterialClass(Object.assign({ map: sideTex,   color: cSide.clone() },   extraProps)), // Face 1: -X
    new MaterialClass(Object.assign({ map: topTex,    color: cTop.clone() },    extraProps)), // Face 2: +Y
    new MaterialClass(Object.assign({ map: bottomTex, color: cBottom.clone() }, extraProps)), // Face 3: -Y
    new MaterialClass(Object.assign({ map: sideTex,   color: cSide.clone() },   extraProps)), // Face 4: +Z
    new MaterialClass(Object.assign({ map: sideTex,   color: cSide.clone() },   extraProps))  // Face 5: -Z
  ];
}

/**
 * Loads authentic 16x16 voxel textures and builds the directional multi-material
 * sets for grass, dirt, stone, sand, and gravel.
 * 
 * @param {Function} [onLoadCallback] - Optional callback invoked when all textures finish loading: callback(materials, textures)
 * @param {Object}   [options]        - Optional configuration
 * @param {string}   [options.basePath='textures/primary_16x16_block_set/'] - Base directory for texture PNGs
 * @param {Object}   [options.paths] - Override paths for specific block textures
 * @param {THREE.LoadingManager} [options.loadingManager] - Custom loading manager instance
 * @param {Function} [options.MaterialClass=THREE.MeshLambertMaterial] - Material constructor to use
 * @param {Object}   [options.shadingMultipliers] - Custom shading multipliers
 * @param {Object}   [options.materialOptions]    - Additional Three.js material options
 * @param {Object}   [options.THREE]              - Explicit THREE reference
 * 
 * @returns {Object} Dictionary containing:
 *   - grass:  Array of 6 materials (Sides: grass_side, Top: grass_top, Bottom: dirt)
 *   - dirt:   Array of 6 materials (All 6 faces: dirt)
 *   - stone:  Array of 6 materials (All 6 faces: stone_generic)
 *   - sand:   Array of 6 materials (All 6 faces: sandstone)
 *   - gravel: Array of 6 materials (All 6 faces: slate_tiles)
 *   - textures: Dictionary of loaded THREE.Texture objects
 *   - loadingManager: The THREE.LoadingManager used
 *   - ready: Promise resolving to the materials dictionary when assets are loaded
 *   - dispose: Function to cleanly free GPU textures and materials
 */
export function loadVoxelMaterials(onLoadCallback, options = {}) {
  // Allow passing options as the first argument if callback is omitted
  let callback = onLoadCallback;
  let opts = options || {};
  if (typeof onLoadCallback === 'object' && onLoadCallback !== null && !options.basePath && !options.THREE) {
    opts = onLoadCallback;
    callback = opts.onLoad || opts.onLoadCallback || null;
  }

  const T = resolveThree(opts);

  // Normalise base path with trailing slash
  const rawBasePath = opts.basePath || 'textures/primary_16x16_block_set/';
  const basePath = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`;

  // Resolved texture URLs
  const customPaths = opts.paths || {};
  const texturePaths = {
    grassTop:  customPaths.grassTop  || `${basePath}grass_top.png`,
    grassSide: customPaths.grassSide || `${basePath}grass_side.png`,
    dirt:      customPaths.dirt      || `${basePath}dirt.png`,
    stone:     customPaths.stone     || `${basePath}stone_generic.png`,
    sand:      customPaths.sand      || `${basePath}sandstone.png`,
    gravel:    customPaths.gravel    || `${basePath}slate_tiles.png`
  };

  // Loading Manager Setup
  let texturesLoaded = false;
  const manager = opts.loadingManager || new T.LoadingManager();
  const existingOnLoad = manager.onLoad;

  let materialsDict = null;

  const loadPromise = new Promise((resolve) => {
    manager.onLoad = () => {
      texturesLoaded = true;
      if (typeof existingOnLoad === 'function') {
        try { existingOnLoad(); } catch (e) { console.error(e); }
      }
      if (typeof callback === 'function') {
        try {
          callback(materialsDict, textures);
        } catch (cbErr) {
          console.error('[voxel_materials] Error executing onLoadCallback:', cbErr);
        }
      }
      resolve(materialsDict);
    };
  });

  if (!opts.loadingManager && !manager.onError) {
    manager.onError = (url) => {
      console.error('[voxel_materials] Error loading texture asset:', url);
    };
  }

  // Texture Loader with NearestFilter enforcement
  const loader = opts.textureLoader || new T.TextureLoader(manager);

  function loadPixelTexture(url) {
    const tex = loader.load(
      url,
      (loaded) => {
        configurePixelArtTexture(loaded, T);
      },
      undefined,
      (err) => {
        console.error(`[voxel_materials] Failed to load "${url}":`, err);
      }
    );
    // Apply immediately so textures can be assigned synchronously to materials
    configurePixelArtTexture(tex, T);
    return tex;
  }

  // 1. Load textures
  const textures = {
    grassTop:  loadPixelTexture(texturePaths.grassTop),
    grassSide: loadPixelTexture(texturePaths.grassSide),
    dirt:      loadPixelTexture(texturePaths.dirt),
    stone:     loadPixelTexture(texturePaths.stone),
    sand:      loadPixelTexture(texturePaths.sand),
    gravel:    loadPixelTexture(texturePaths.gravel)
  };

  // 2. Build 6-face multi-materials with directional shading
  const createOpts = {
    THREE: T,
    MaterialClass: opts.MaterialClass || T.MeshLambertMaterial,
    shadingMultipliers: opts.shadingMultipliers || SHADING_MULTIPLIERS,
    materialOptions: opts.materialOptions || {}
  };

  const grassMaterials  = createVoxelMaterials(textures.grassTop, textures.grassSide, textures.dirt, createOpts);
  const dirtMaterials   = createVoxelMaterials(textures.dirt,     textures.dirt,      textures.dirt, createOpts);
  const stoneMaterials  = createVoxelMaterials(textures.stone,    textures.stone,     textures.stone, createOpts);
  const sandMaterials   = createVoxelMaterials(textures.sand,     textures.sand,      textures.sand, createOpts);
  const gravelMaterials = createVoxelMaterials(textures.gravel,   textures.gravel,    textures.gravel, createOpts);

  // 3. Assemble and return materials dictionary
  materialsDict = {
    grass:  grassMaterials,
    dirt:   dirtMaterials,
    stone:  stoneMaterials,
    sand:   sandMaterials,
    gravel: gravelMaterials,

    // Raw texture handles
    textures,

    // Manager and promise hooks
    loadingManager: manager,
    ready: loadPromise,
    isLoaded: () => texturesLoaded,

    // Helper utilities
    createVoxelMaterials: (top, side, bottom, o) => createVoxelMaterials(top, side, bottom, Object.assign({}, createOpts, o)),
    shadingMultipliers: createOpts.shadingMultipliers,

    // Disposal helper for clean GPU teardown
    dispose: () => {
      const allSets = [grassMaterials, dirtMaterials, stoneMaterials, sandMaterials, gravelMaterials];
      for (let s = 0; s < allSets.length; s++) {
        const matSet = allSets[s];
        for (let m = 0; m < matSet.length; m++) {
          if (matSet[m] && typeof matSet[m].dispose === 'function') {
            matSet[m].dispose();
          }
        }
      }
      const allTex = Object.values(textures);
      for (let t = 0; t < allTex.length; t++) {
        if (allTex[t] && typeof allTex[t].dispose === 'function') {
          allTex[t].dispose();
        }
      }
    }
  };

  return materialsDict;
}

// Global window attachment for non-module script tag usage
if (typeof window !== 'undefined') {
  window.loadVoxelMaterials = loadVoxelMaterials;
  window.createVoxelMaterials = createVoxelMaterials;
  window.configurePixelArtTexture = configurePixelArtTexture;
  window.VoxelMaterials = {
    loadVoxelMaterials,
    createVoxelMaterials,
    configurePixelArtTexture,
    SHADING_MULTIPLIERS,
    FACE_INDICES
  };
}

export default loadVoxelMaterials;
