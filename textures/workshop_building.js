/**
 * 🔨 Workshop Building at Spawn (Multi-Agent Orchestration Meta-Station)
 * Phase 4 Implementation for Chirag's Minecraft Portfolio.
 *
 * Implements:
 * - Layered slice matrix format (Y-layers from ground to roof)
 * - Crafting table room (agent workbenches)
 * - Blueprint table & lecterns (orchestration terminals)
 * - Beacon focal block on roof with vertical luminous cyan sky-beam
 * - Stone brick foundation ('S'), oak plank walls ('W'), glass windows ('G')
 * - Full 3D & 2D collision metadata with AABB and sliding collision helpers
 *
 * Compatible with Three.js r128+, Node.js (CommonJS), and vanilla browser scripts.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const three = (typeof THREE !== 'undefined') ? THREE : (function () {
      try { return require('three'); } catch (e) { return null; }
    })();
    module.exports = factory(three);
  } else {
    const exports = factory(root.THREE);
    root.buildWorkshop = exports.buildWorkshop;
    root.WORKSHOP_SLICES = exports.WORKSHOP_SLICES;
    root.createWorkshopMaterials = exports.createWorkshopMaterials;
    root.WorkshopBuilding = exports;
  }
}(typeof self !== 'undefined' ? self : this, function (THREE) {

  // =========================================================================
  // 1. LAYERED SLICE MATRIX (7x7 footprint, Y-layers from ground to roof apex)
  // =========================================================================
  // Block Character Legend:
  // 'S': Stone brick (cobblestone_bricks)
  // 'W': Oak planks
  // 'G': Glass pane
  // 'C': Crafting table
  // 'L': Lectern
  // 'B': Beacon focal block on roof
  // ' ': Air / open space

  const WORKSHOP_SLICES = [
    // Layer 0 (Y = baseY + 0): Solid Stone Brick Foundation
    [
      "SSSSSSS",
      "SSSSSSS",
      "SSSSSSS",
      "SSSSSSS",
      "SSSSSSS",
      "SSSSSSS",
      "SSSSSSS"
    ],
    // Layer 1 (Y = baseY + 1): Lower walls, workstations, doorways, spawn open space
    [
      "SWGWGWS", // North wall: stone corners, oak planks, glass windows
      "WCC LLW", // West: Crafting tables, East: Lecterns
      "GC   LG", // Windows + workbenches
      "G     ", // West window, open center floor, East doorway to path (+X)
      "GC   LG", // Windows + workbenches
      "W     W", // Spawn area at row 5, col 3 (X = 0, Z = 2)
      "SWW WWWS"  // South wall: stone corners, oak, South doorway at col 3 (+Z)
    ],
    // Layer 2 (Y = baseY + 2): Upper walls, 2-block high windows and doorways
    [
      "SWGWGWS", // North wall: stone corners, oak, glass windows
      "W     W", // Open headroom above crafting & lectern desks
      "G     G", // Glass windows on West and East
      "G      ", // West window, East doorway arch
      "G     G", // Glass windows on West and East
      "W     W", // Oak walls
      "SWW WWWS"  // South doorway arch
    ],
    // Layer 3 (Y = baseY + 3): Wall Crown / Lintel Framing
    [
      "SSSSSSS", // Stone brick lintel capping north wall
      "W     W", // Oak side walls
      "W     W",
      "W     W",
      "W     W",
      "W     W",
      "SSSSSSS"  // Stone brick lintel capping south wall
    ],
    // Layer 4 (Y = baseY + 4): Overhanging Eaves / Ceiling Base
    [
      "SSSSSSS", // Stone brick overhanging eaves
      "SWWWWWS", // Oak plank ceiling
      "SWWWWWS",
      "SWWWWWS",
      "SWWWWWS",
      "SWWWWWS",
      "SSSSSSS"  // Stone brick overhanging eaves
    ],
    // Layer 5 (Y = baseY + 5): Roof Mid Tier (5x5 stepped pyramid)
    [
      "       ",
      " SSSSS ",
      " SWWWS ",
      " SWWWS ",
      " SWWWS ",
      " SSSSS ",
      "       "
    ],
    // Layer 6 (Y = baseY + 6): Roof Pedestal Tier (3x3 stone brick pyramid apex)
    [
      "       ",
      "       ",
      "  SSS  ",
      "  SSS  ",
      "  SSS  ",
      "       ",
      "       "
    ],
    // Layer 7 (Y = baseY + 7): Beacon Focal Block Apex (1x1 at roof center)
    [
      "       ",
      "       ",
      "       ",
      "   B   ",
      "       ",
      "       ",
      "       "
    ]
  ];

  // Block definitions metadata
  const BLOCK_DEFINITIONS = {
    'S': { id: 'stone_brick', name: 'Stone Brick', solid: true, transparent: false, faceShading: true },
    'W': { id: 'oak_planks', name: 'Oak Planks', solid: true, transparent: false, faceShading: true },
    'G': { id: 'glass', name: 'Glass Pane', solid: true, transparent: true, opacity: 0.55, faceShading: false },
    'C': { id: 'crafting_table', name: 'Crafting Table', solid: true, transparent: false, interactive: true, faceShading: true },
    'L': { id: 'lectern', name: 'Blueprint Lectern', solid: true, transparent: false, interactive: true, faceShading: true },
    'B': { id: 'beacon', name: 'Beacon Emitter Block', solid: true, transparent: false, interactive: true, emitsLight: true },
    ' ': { id: 'air', name: 'Air', solid: false, transparent: true }
  };

  // =========================================================================
  // 2. MATERIAL FACTORY & TEXTURE RESOLUTION
  // =========================================================================

  /**
   * Generates a 16x16 pixel fallback canvas data URL for resilient offline rendering.
   */
  function generateFallbackDataUrl(char) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (char === 'S') {
      // Stone brick pattern: gray with mortar lines
      ctx.fillStyle = '#828282';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(7, 0, 1, 8);
      ctx.fillRect(0, 8, 1, 8);
      ctx.fillRect(15, 8, 1, 8);
    } else if (char === 'W') {
      // Oak planks pattern: warm timber with horizontal grain lines
      ctx.fillStyle = '#b88746';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#7a5122';
      ctx.fillRect(0, 0, 16, 1);
      ctx.fillRect(0, 4, 16, 1);
      ctx.fillRect(0, 8, 16, 1);
      ctx.fillRect(0, 12, 16, 1);
    } else if (char === 'G') {
      // Glass pane pattern: light cyan with border and diagonal sheen glint
      ctx.fillStyle = 'rgba(215, 240, 255, 0.35)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#c2e4f7';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(4, 4, 3, 1);
      ctx.fillRect(9, 8, 4, 1);
    } else if (char === 'C') {
      // Crafting table pattern: oak frame with grid lines
      ctx.fillStyle = '#9c6d3d';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#4f3014';
      ctx.strokeRect(1, 1, 14, 14);
      ctx.fillRect(5, 5, 6, 6);
    } else if (char === 'L') {
      // Lectern top pattern: wood pedestal with open parchment book
      ctx.fillStyle = '#9c622b';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#942222';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#f5ecd5';
      ctx.fillRect(4, 4, 8, 8);
    } else if (char === 'B') {
      // Beacon pattern: obsidian base with radiant cyan core
      ctx.fillStyle = '#1c1524';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(3, 3, 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 4, 4);
    }

    return canvas.toDataURL();
  }

  /**
   * Applies directional face shading multipliers matching Minecraft / Builder Guidelines:
   * Top (+Y): 1.00
   * Sides (±X, ±Z): 0.75
   * Bottom (-Y): 0.45
   */
  function applyDirectionalShading(THREE, tex, transparent = false, opacity = 1.0) {
    const cSide = new THREE.Color().setScalar(0.75);
    const cTop  = new THREE.Color().setScalar(1.00);
    const cBot  = new THREE.Color().setScalar(0.45);

    const matOpts = {
      map: tex,
      transparent: !!transparent,
      opacity: opacity
    };

    return [
      new THREE.MeshLambertMaterial({ ...matOpts, color: cSide }), // +X
      new THREE.MeshLambertMaterial({ ...matOpts, color: cSide }), // -X
      new THREE.MeshLambertMaterial({ ...matOpts, color: cTop }),  // +Y
      new THREE.MeshLambertMaterial({ ...matOpts, color: cBot }),  // -Y
      new THREE.MeshLambertMaterial({ ...matOpts, color: cSide }), // +Z
      new THREE.MeshLambertMaterial({ ...matOpts, color: cSide })  // -Z
    ];
  }

  /**
   * Creates or resolves the 6 block materials required for the workshop.
   */
  function createWorkshopMaterials(THREE, options = {}) {
    const _THREE = THREE || (options && options.THREE) ||
                   (typeof window !== 'undefined' && window.THREE) ||
                   (typeof global !== 'undefined' && global.THREE) || null;
    if (!_THREE) return {};

    const basePath = options.basePath || 'textures';
    const textureLoader = options.textureLoader ||
      (_THREE.TextureLoader ? new _THREE.TextureLoader() : { load: () => ({ magFilter: 0, minFilter: 0 }) });

    function loadNearestTexture(relPath, char) {
      const fullPath = `${basePath}/${relPath}`;
      const tex = textureLoader.load(
        fullPath,
        (loaded) => {
          loaded.magFilter = THREE.NearestFilter;
          loaded.minFilter = THREE.NearestFilter;
          loaded.generateMipmaps = false;
          loaded.needsUpdate = true;
        },
        undefined,
        () => {
          // Fallback to procedural canvas texture if file load fails
          const fallbackUrl = generateFallbackDataUrl(char);
          if (fallbackUrl) {
            new THREE.TextureLoader().load(fallbackUrl, (fbTex) => {
              fbTex.magFilter = THREE.NearestFilter;
              fbTex.minFilter = THREE.NearestFilter;
              fbTex.generateMipmaps = false;
              tex.image = fbTex.image;
              tex.needsUpdate = true;
            });
          }
        }
      );
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      return tex;
    }

    // 1. Stone Brick ('S')
    const stoneTex = loadNearestTexture('primary_16x16_block_set/cobblestone_bricks.png', 'S');
    const stoneBrickMaterial = applyDirectionalShading(THREE, stoneTex);

    // 2. Oak Planks ('W')
    const oakTex = loadNearestTexture('primary_16x16_block_set/oak_planks.png', 'W');
    const oakPlanksMaterial = applyDirectionalShading(THREE, oakTex);

    // 3. Glass ('G')
    const glassTex = loadNearestTexture('primary_16x16_block_set/glass.png', 'G');
    const glassMaterial = new THREE.MeshLambertMaterial({
      map: glassTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });

    // 4. Crafting Table ('C')
    const craftTex = loadNearestTexture('kenney_voxel_pack/table.png', 'C');
    const craftMaterial = applyDirectionalShading(THREE, craftTex);

    // 5. Lectern ('L')
    const lecternTopTex = loadNearestTexture('primary_16x16_block_set/lectern_top.png', 'L');
    const lecternSideTex = oakTex;
    const cSide = new THREE.Color().setScalar(0.75);
    const cTop  = new THREE.Color().setScalar(1.00);
    const cBot  = new THREE.Color().setScalar(0.45);
    const lecternMaterial = [
      new THREE.MeshLambertMaterial({ map: lecternSideTex, color: cSide }), // +X
      new THREE.MeshLambertMaterial({ map: lecternSideTex, color: cSide }), // -X
      new THREE.MeshLambertMaterial({ map: lecternTopTex,  color: cTop }),  // +Y (Book cover & pages)
      new THREE.MeshLambertMaterial({ map: lecternSideTex, color: cBot }),  // -Y
      new THREE.MeshLambertMaterial({ map: lecternSideTex, color: cSide }), // +Z
      new THREE.MeshLambertMaterial({ map: lecternSideTex, color: cSide })  // -Z
    ];

    // 6. Beacon ('B')
    const beaconTex = loadNearestTexture('primary_16x16_block_set/beacon.png', 'B');
    const beaconMaterial = new THREE.MeshLambertMaterial({
      map: beaconTex,
      color: 0x99ffff,
      emissive: 0x004455,
      emissiveIntensity: 0.4
    });

    return {
      S: stoneBrickMaterial,
      stone_brick: stoneBrickMaterial,
      cobblestone_bricks: stoneBrickMaterial,

      W: oakPlanksMaterial,
      oak_planks: oakPlanksMaterial,

      G: glassMaterial,
      glass: glassMaterial,

      C: craftMaterial,
      crafting_table: craftMaterial,

      L: lecternMaterial,
      lectern: lecternMaterial,

      B: beaconMaterial,
      beacon: beaconMaterial
    };
  }

  /**
   * Helper to normalize user-supplied materials or fill in missing ones.
   */
  function resolveMaterials(THREE, customMaterials, options) {
    const defaults = createWorkshopMaterials(THREE, options);
    if (!customMaterials) return defaults;

    return {
      S: customMaterials.S || customMaterials.stone_brick || customMaterials.cobblestone_bricks || defaults.S,
      W: customMaterials.W || customMaterials.oak_planks || customMaterials.wood || defaults.W,
      G: customMaterials.G || customMaterials.glass || customMaterials.glass_pane || defaults.G,
      C: customMaterials.C || customMaterials.crafting_table || customMaterials.crafting || defaults.C,
      L: customMaterials.L || customMaterials.lectern || customMaterials.lectern_top || defaults.L,
      B: customMaterials.B || customMaterials.beacon || customMaterials.beacon_block || defaults.B
    };
  }

  // =========================================================================
  // 3. BEACON SKY BEAM BUILDER
  // =========================================================================

  /**
   * Creates a luminous, vertical cyan/light-blue beacon beam reaching into the clouds.
   */
  function buildBeaconBeam(THREE, beaconX, beaconY, beaconZ, beamHeight = 50) {
    const beamGroup = new THREE.Group();
    beamGroup.name = "BeaconBeam";

    // Beam base starts exactly at the top face of the beacon block
    const baseElevation = beaconY + 0.5;
    const centerY = baseElevation + beamHeight / 2;

    // 1. Inner Bright Core Beam (white-cyan glow)
    const innerGeo = new THREE.CylinderGeometry(0.18, 0.18, beamHeight, 16, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xddffff,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const innerBeam = new THREE.Mesh(innerGeo, innerMat);
    innerBeam.position.set(beaconX, centerY, beaconZ);
    beamGroup.add(innerBeam);

    // 2. Outer Translucent Cyan Beam Halo
    const outerGeo = new THREE.CylinderGeometry(0.38, 0.38, beamHeight, 16, 1, true);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff, // Vibrant electric cyan
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const outerBeam = new THREE.Mesh(outerGeo, outerMat);
    outerBeam.position.set(beaconX, centerY, beaconZ);
    beamGroup.add(outerBeam);

    // 3. Floating Nether Star Core inside Beacon Casing
    const starGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0x7feaff,
      transparent: true,
      opacity: 0.90
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.set(beaconX, beaconY, beaconZ);
    beamGroup.add(starMesh);

    // 4. Point light casting soft ambient cyan illumination
    const beamLight = new THREE.PointLight(0x00e5ff, 1.4, 14);
    beamLight.position.set(beaconX, beaconY + 0.8, beaconZ);
    beamGroup.add(beamLight);

    return {
      group: beamGroup,
      innerBeam,
      outerBeam,
      starMesh,
      light: beamLight,
      update: function (dt = 0.016, elapsed = 0) {
        innerBeam.rotation.y += dt * 1.8;
        outerBeam.rotation.y -= dt * 1.0;
        starMesh.rotation.y += dt * 2.2;
        starMesh.rotation.x += dt * 1.4;
        outerMat.opacity = 0.38 + 0.12 * Math.sin(elapsed * 3.5);
      }
    };
  }

  // =========================================================================
  // 4. MAIN EXPORT: buildWorkshop
  // =========================================================================

  /**
   * Builds the Workshop Building at spawn from the layered slice matrix.
   *
   * @param {THREE.Scene} scene - Three.js scene to add the building to (optional)
   * @param {Object} materials - Voxel block materials map (optional)
   * @param {number} worldOffsetX - World X offset (default 0)
   * @param {number} worldOffsetZ - World Z offset (default 0)
   * @param {Object} options - Customization options (baseY, useInstanced, beamHeight, basePath)
   * @returns {Object} Building group and collision metadata
   */
  function buildWorkshop(scene, materials = {}, worldOffsetX = 0, worldOffsetZ = 0, options = {}) {
    const _THREE = (options && options.THREE) ||
                   (typeof THREE !== 'undefined' && THREE) ||
                   (typeof window !== 'undefined' && window.THREE) ||
                   (typeof global !== 'undefined' && global.THREE) ||
                   null;
    if (!_THREE) {
      throw new Error("Three.js (THREE) must be available globally, via options.THREE, or passed in module environment.");
    }

    const baseY = (typeof options.baseY === 'number') ? options.baseY : 1;
    const beamHeight = options.beamHeight || 50;
    const resolvedMats = resolveMaterials(_THREE, materials, options);

    const buildingGroup = new _THREE.Group();
    buildingGroup.name = "WorkshopBuilding_Spawn";

    const unitBox = new _THREE.BoxGeometry(1, 1, 1);
    const dummyObj = new _THREE.Object3D();

    // Collect blocks grouped by character
    const blockBuckets = {
      'S': [],
      'W': [],
      'G': [],
      'C': [],
      'L': [],
      'B': []
    };

    const solidBlocks = [];
    const aabbs = [];
    const grid2D = new Map(); // "x,z" -> block info for walking-height collisions (Y = 2 & 3)

    let beaconCoords = null;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    // Iterate through layers (Y from 0 to top)
    for (let ly = 0; ly < WORKSHOP_SLICES.length; ly++) {
      const layer = WORKSHOP_SLICES[ly];
      const depth = layer.length;
      const width = layer[0].length;

      const centerZ = Math.floor(depth / 2);
      const centerX = Math.floor(width / 2);

      const blockY = baseY + ly;

      for (let rz = 0; rz < depth; rz++) {
        const row = layer[rz];
        const blockZ = worldOffsetZ + (rz - centerZ);

        for (let cx = 0; cx < width; cx++) {
          const char = row[cx];
          if (char === ' ') continue; // Skip air

          const blockX = worldOffsetX + (cx - centerX);

          // Update bounding box
          if (blockX < minX) minX = blockX;
          if (blockX > maxX) maxX = blockX;
          if (blockY < minY) minY = blockY;
          if (blockY > maxY) maxY = blockY;
          if (blockZ < minZ) minZ = blockZ;
          if (blockZ > maxZ) maxZ = blockZ;

          const blockInfo = {
            char,
            type: BLOCK_DEFINITIONS[char] ? BLOCK_DEFINITIONS[char].id : 'unknown',
            x: blockX,
            y: blockY,
            z: blockZ,
            layer: ly
          };

          if (blockBuckets[char]) {
            blockBuckets[char].push(blockInfo);
          }

          // Collision tracking
          if (BLOCK_DEFINITIONS[char] && BLOCK_DEFINITIONS[char].solid) {
            solidBlocks.push(blockInfo);

            aabbs.push({
              min: { x: blockX - 0.5, y: blockY - 0.5, z: blockZ - 0.5 },
              max: { x: blockX + 0.5, y: blockY + 0.5, z: blockZ + 0.5 },
              type: blockInfo.type,
              char: char,
              x: blockX,
              y: blockY,
              z: blockZ
            });

            // Player eye & torso height collision (Y = baseY + 1 and baseY + 2)
            if (ly === 1 || ly === 2) {
              const key = `${blockX},${blockZ}`;
              grid2D.set(key, blockInfo);
            }
          }

          if (char === 'B') {
            beaconCoords = { x: blockX, y: blockY, z: blockZ };
          }
        }
      }
    }

    // Interactive blocks collection
    const interactiveBlocks = {
      craftingTables: [],
      lecterns: [],
      beacon: null
    };

    // Helper: Build instanced mesh for high performance
    function buildInstancedMesh(geo, mat, list, name) {
      if (!list || list.length === 0) return null;
      const im = new _THREE.InstancedMesh(geo, mat, list.length);
      im.name = name;
      for (let i = 0; i < list.length; i++) {
        dummyObj.position.set(list[i].x, list[i].y, list[i].z);
        dummyObj.updateMatrix();
        im.setMatrixAt(i, dummyObj.matrix);
      }
      im.instanceMatrix.needsUpdate = true;
      return im;
    }

    // 1. Structural instanced meshes ('S', 'W', 'G')
    const stoneMesh = buildInstancedMesh(unitBox, resolvedMats.S, blockBuckets['S'], "Workshop_StoneBricks");
    if (stoneMesh) buildingGroup.add(stoneMesh);

    const oakMesh = buildInstancedMesh(unitBox, resolvedMats.W, blockBuckets['W'], "Workshop_OakPlanks");
    if (oakMesh) buildingGroup.add(oakMesh);

    const glassMesh = buildInstancedMesh(unitBox, resolvedMats.G, blockBuckets['G'], "Workshop_GlassPanes");
    if (glassMesh) buildingGroup.add(glassMesh);

    // 2. Interactive Furniture: Crafting Tables ('C')
    blockBuckets['C'].forEach((b, i) => {
      const mesh = new _THREE.Mesh(unitBox, resolvedMats.C);
      mesh.position.set(b.x, b.y, b.z);
      mesh.name = `Workshop_CraftingTable_${i}`;
      mesh.userData = {
        type: 'crafting_table',
        station: 'workshop',
        label: 'Agentic Crafting Bench',
        interactive: true,
        coords: { x: b.x, y: b.y, z: b.z }
      };
      buildingGroup.add(mesh);
      interactiveBlocks.craftingTables.push(mesh);
    });

    // 3. Interactive Furniture: Lecterns ('L')
    blockBuckets['L'].forEach((b, i) => {
      const mesh = new _THREE.Mesh(unitBox, resolvedMats.L);
      mesh.position.set(b.x, b.y, b.z);
      mesh.name = `Workshop_Lectern_${i}`;
      mesh.userData = {
        type: 'lectern',
        station: 'workshop',
        label: 'Multi-Agent Blueprint Lectern',
        interactive: true,
        coords: { x: b.x, y: b.y, z: b.z }
      };
      buildingGroup.add(mesh);
      interactiveBlocks.lecterns.push(mesh);
    });

    // 4. Beacon Focal Block ('B') & Luminous Sky Beam
    let beaconMesh = null;
    let beaconBeamObj = null;

    if (beaconCoords) {
      beaconMesh = new _THREE.Mesh(unitBox, resolvedMats.B);
      beaconMesh.position.set(beaconCoords.x, beaconCoords.y, beaconCoords.z);
      beaconMesh.name = "Workshop_BeaconBlock";
      beaconMesh.userData = {
        type: 'beacon',
        station: 'workshop',
        label: 'Agentic Beacon Emitter',
        interactive: true,
        coords: beaconCoords
      };
      buildingGroup.add(beaconMesh);
      interactiveBlocks.beacon = beaconMesh;

      // Vertical Sky Beam projecting upward into the sky
      beaconBeamObj = buildBeaconBeam(
        _THREE,
        beaconCoords.x,
        beaconCoords.y,
        beaconCoords.z,
        beamHeight
      );
      buildingGroup.add(beaconBeamObj.group);
    }

    // Add building group to scene if provided
    if (scene && typeof scene.add === 'function') {
      scene.add(buildingGroup);
    }

    // Collision query helper
    function isColliding(playerX, playerZ, radius = 0.35) {
      // Check proximity against all 2D obstacle grid blocks at walking height
      const minCheckX = Math.floor(playerX - radius);
      const maxCheckX = Math.ceil(playerX + radius);
      const minCheckZ = Math.floor(playerZ - radius);
      const maxCheckZ = Math.ceil(playerZ + radius);

      for (let x = minCheckX; x <= maxCheckX; x++) {
        for (let z = minCheckZ; z <= maxCheckZ; z++) {
          if (grid2D.has(`${x},${z}`)) {
            const dx = Math.abs(playerX - x);
            const dz = Math.abs(playerZ - z);
            if (dx < (0.5 + radius) && dz < (0.5 + radius)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    // Sliding collision resolution helper
    function resolveCollision(playerX, playerZ, radius = 0.35) {
      let resolvedX = playerX;
      let resolvedZ = playerZ;

      for (const [key, b] of grid2D.entries()) {
        const minX = b.x - 0.5 - radius;
        const maxX = b.x + 0.5 + radius;
        const minZ = b.z - 0.5 - radius;
        const maxZ = b.z + 0.5 + radius;

        if (resolvedX > minX && resolvedX < maxX && resolvedZ > minZ && resolvedZ < maxZ) {
          // Push out along the shallowest penetration axis
          const leftPen = resolvedX - minX;
          const rightPen = maxX - resolvedX;
          const backPen = resolvedZ - minZ;
          const frontPen = maxZ - resolvedZ;

          const minPen = Math.min(leftPen, rightPen, backPen, frontPen);
          if (minPen === leftPen) resolvedX = minX;
          else if (minPen === rightPen) resolvedX = maxX;
          else if (minPen === backPen) resolvedZ = minZ;
          else resolvedZ = maxZ;
        }
      }

      return { x: resolvedX, z: resolvedZ };
    }

    const collisionMetadata = {
      solidBlocks,
      aabbs,
      grid2D,
      isColliding,
      resolveCollision,
      bounds: {
        minX, maxX,
        minY, maxY,
        minZ, maxZ
      },
      blockCounts: {
        stone: blockBuckets['S'].length,
        oak: blockBuckets['W'].length,
        glass: blockBuckets['G'].length,
        craftingTable: blockBuckets['C'].length,
        lectern: blockBuckets['L'].length,
        beacon: blockBuckets['B'].length,
        totalSolid: solidBlocks.length
      }
    };

    // Return contract
    return {
      group: buildingGroup,
      buildingGroup,
      collision: collisionMetadata,
      collisionMetadata,
      slices: WORKSHOP_SLICES,
      matrix: WORKSHOP_SLICES,
      beacon: {
        mesh: beaconMesh,
        beam: beaconBeamObj ? beaconBeamObj.group : null,
        light: beaconBeamObj ? beaconBeamObj.light : null,
        position: beaconCoords
      },
      interactiveBlocks,
      doorways: [
        { x: worldOffsetX, y: baseY + 1, z: worldOffsetZ + 3, name: 'south_door' },
        { x: worldOffsetX + 3, y: baseY + 1, z: worldOffsetZ, name: 'east_door' }
      ],
      spawnPoint: {
        x: worldOffsetX,
        y: baseY + 0.5,
        z: worldOffsetZ + 2
      },
      update: function (dt = 0.016, elapsed = 0) {
        if (beaconBeamObj && typeof beaconBeamObj.update === 'function') {
          beaconBeamObj.update(dt, elapsed);
        }
      }
    };
  }

  // =========================================================================
  // 5. EXPORTS
  // =========================================================================

  return {
    buildWorkshop,
    WORKSHOP_SLICES,
    BLOCK_DEFINITIONS,
    createWorkshopMaterials,
    resolveMaterials,
    buildBeaconBeam
  };
}));
