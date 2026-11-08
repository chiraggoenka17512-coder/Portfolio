import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update Script Tags
old_script = '<script src="textures/terrain_ponds.js"></script>'
new_script = """<script src="textures/natural_landscape.js"></script>
  <script src="textures/voxel_trees.js"></script>
  <script src="textures/landscape_camera_haze.js"></script>"""

if old_script in html:
    html = html.replace(old_script, new_script)
    print("Updated script tags for natural landscape, trees, and camera haze")
else:
    print("Warning: old_script not found directly, checking...")

# 2. Update Contract Object Player Spawn & Cinematic Settings
old_player_spawn = """    // 1. Contract State Object
    window.__game = {
      player: {
        position: { x: 0, y: 1, z: 0 },
        yaw: 0,
        isGrounded: true,
        screenHeightRatio: 0.20
      },
      island: {
        blockCount: 0,
        dimensions: { x: 40, z: 16 }
      },
      cinematic: {
        introPlaying: true,
        cameraY: 18.0,
        fov: 40,
        pitchDegrees: 28.5,"""

new_player_spawn = """    // 1. Contract State Object
    window.__game = {
      player: {
        position: { x: 0, y: 3.0, z: 8.0 },
        yaw: 0,
        isGrounded: true,
        screenHeightRatio: 0.20
      },
      island: {
        blockCount: 0,
        dimensions: { x: 50, z: 36 }
      },
      trees: [],
      cinematic: {
        introPlaying: true,
        cameraY: 7.5,
        fov: 60,
        pitchDegrees: 20.0,"""

if old_player_spawn in html:
    html = html.replace(old_player_spawn, new_player_spawn)
    print("Updated window.__game contract object")
else:
    print("Warning: old_player_spawn not found directly, checking...")

# 3. Update Camera Default Parameters (FOV 60, Pitch 20 deg, Distance 9.5)
old_cam_params = """    let cameraPitch = 28.5 * (Math.PI / 180); // ~28.5 degrees downward
    let cameraDistance = 6.85;"""

new_cam_params = """    let cameraPitch = 20.0 * (Math.PI / 180); // ~20.0 degrees downward (horizon in upper third)
    let cameraDistance = 9.5; // 8 to 10 blocks behind player"""

if old_cam_params in html:
    html = html.replace(old_cam_params, new_cam_params)
    print("Updated camera pitch and distance")

# Update camera FOV creation
old_camera_fov = """    const camera = new THREE.PerspectiveCamera(
      40,"""

new_camera_fov = """    const camera = new THREE.PerspectiveCamera(
      60,"""

if old_camera_fov in html:
    html = html.replace(old_camera_fov, new_camera_fov)
    print("Updated camera FOV to 60")

# Update camera intro start position
old_intro_pos = """    const introStartPos = new THREE.Vector3(0, 18, 22);
    const introStartLook = new THREE.Vector3(0, 1.2, 0);"""

new_intro_pos = """    const introStartPos = new THREE.Vector3(0, 12, 24);
    const introStartLook = new THREE.Vector3(0, 3.0, 0);"""

if old_intro_pos in html:
    html = html.replace(old_intro_pos, new_intro_pos)
    print("Updated intro camera start coordinates")

# 4. Replace Terrain Generation with Natural Landscape, Voxel Trees, and Camera Haze
old_terrain_section = """    // 6. Procedural Simplex-Noise Terrain & Carved Ponds Module
    let terrainData = null;
    if (window.buildTerrainAndPonds) {
      terrainData = window.buildTerrainAndPonds(scene, {
        grass: grassMaterials,
        dirt: dirtMaterials,
        stone: stoneMaterials
      }, { seed: 1337 });

      window.__game.island.blockCount = terrainData.blockCount;
      window.__game.island.dimensions = terrainData.dimensions;
      window.__game.island.terrainData = terrainData;
      console.log(`[TERRAIN] Simplex terrain generated: ${terrainData.blockCount} blocks, ${terrainData.ponds.length} ponds`);
    }

    // Distant background satellite rock silhouettes in the haze for parallax depth
    const satelliteGroup = new THREE.Group();
    const satStoneMat = new THREE.MeshLambertMaterial({
      color: 0x5a6372,
      map: stoneGenericTex
    });
    const satGrassMat = new THREE.MeshLambertMaterial({
      color: 0x5fa83b,
      map: grassTopTex
    });

    const satIsletData = [
      { x: -38, y: -4, z: -36, scale: 1.1 },
      { x: 42,  y: 3,  z: -38, scale: 1.3 },
      { x: -36, y: 5,  z: 32,  scale: 0.9 },
      { x: 38,  y: -2, z: 30,  scale: 1.0 },
      { x: 6,   y: -7, z: -48, scale: 1.4 }
    ];

    const unitBox = new THREE.BoxGeometry(1, 1, 1);

    satIsletData.forEach((isl) => {
      const g = new THREE.Group();
      for (let ix = -1; ix <= 1; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (Math.abs(ix) + Math.abs(iz) <= 2) {
            const topM = new THREE.Mesh(unitBox, grassMaterials);
            topM.position.set(ix, 0, iz);
            g.add(topM);
            const subM = new THREE.Mesh(unitBox, dirtMaterials);
            subM.position.set(ix, -1, iz);
            g.add(subM);
          }
        }
      }
      const k1 = new THREE.Mesh(unitBox, stoneMaterials);
      k1.position.set(0, -2, 0);
      g.add(k1);
      const k2 = new THREE.Mesh(unitBox, stoneMaterials);
      k2.position.set(0, -3, 0);
      k2.scale.set(0.7, 0.7, 0.7);
      g.add(k2);

      g.scale.setScalar(isl.scale);
      g.position.set(isl.x, isl.y, isl.z);
      satelliteGroup.add(g);
    });
    scene.add(satelliteGroup);"""

new_terrain_section = """    // 6. Natural Voxel Landscape & River Valley Module
    let landscapeData = null;
    if (window.buildNaturalLandscape) {
      landscapeData = window.buildNaturalLandscape(scene, {
        grass: grassMaterials,
        dirt: dirtMaterials,
        stone: stoneMaterials
      }, { seed: 1337 });

      window.__game.island.blockCount = landscapeData.blockCount;
      window.__game.island.dimensions = landscapeData.dimensions;
      window.__game.island.landscapeData = landscapeData;
      window.__game.island.terrainData = landscapeData; // backwards compatibility
      console.log(`[LANDSCAPE] Natural landscape generated: ${landscapeData.blockCount} blocks`);
    }

    // 7. Procedural Birch & Spruce Trees
    let treeData = null;
    if (window.buildVoxelTrees) {
      treeData = window.buildVoxelTrees(scene, landscapeData);
      window.__game.island.treeData = treeData;
      window.__game.trees = treeData.trees;
      console.log(`[TREES] Voxel trees generated: ${treeData.treeCount} trees`);
    }

    // 8. Landscape Camera, Dual-Tone Lighting & Atmospheric Aerial Haze
    let cameraHazeController = null;
    if (window.setupLandscapeCameraAndHaze) {
      cameraHazeController = window.setupLandscapeCameraAndHaze(scene, camera, renderer, window.__game.player);
      window.__game.cinematic.cameraController = cameraHazeController;
      console.log('[HAZE] Camera framing, warm lighting & blue haze initialized');
    }"""

if old_terrain_section in html:
    html = html.replace(old_terrain_section, new_terrain_section)
    print("Replaced terrain section with natural landscape, trees, and camera haze")
else:
    print("Warning: old_terrain_section not found directly, checking...")

# 5. Update animate loop: call landscapeData.update and player height follow
old_animate_terrain = """      // Update terrain water ripples & vegetation wind sway
      if (terrainData && terrainData.update) {
        terrainData.update(currentTime * 0.001);
      }"""

new_animate_terrain = """      // Update river water ripples & wildflower wind sway
      if (landscapeData && landscapeData.update) {
        landscapeData.update(currentTime * 0.001);
      }"""

if old_animate_terrain in html:
    html = html.replace(old_animate_terrain, new_animate_terrain)
    print("Updated animation update call to landscapeData.update")

# Update player height tracking in movement
old_height_track = """          if (terrainData && terrainData.getTerrainHeightAt) {
            const gh = terrainData.getTerrainHeightAt(newX, newZ);
            window.__game.player.position.y = (gh !== null ? gh : 0) + 1.0;
          }"""

new_height_track = """          if (landscapeData && landscapeData.getTerrainHeightAt) {
            const gh = landscapeData.getTerrainHeightAt(newX, newZ);
            window.__game.player.position.y = (gh !== null ? gh : 2) + 1.0;
          }"""

if old_height_track in html:
    html = html.replace(old_height_track, new_height_track)
    print("Updated player movement height tracking to landscapeData")

# Save file
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Updated index.html for natural landscape successfully.")
