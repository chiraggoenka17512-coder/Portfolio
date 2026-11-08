# 🌿 Subagent Loop 1 Specification: Pixel-Perfect Voxel Grass Block

## Goal
Replace the blurry procedural canvas textures with authentic 16×16 pixel art textures matching the user's reference image: crisp 16×16 nearest-neighbor pixels, a rich green top, side faces with green grass jaggedly dripping down into warm loam dirt, and solid earth dirt underside.

## Requirements

### 1. Texture Integration Matching Reference Image
- Load the authentic 16×16 textures from `textures/primary_16x16_block_set/`:
  - `grass_top.png` — Rich green organic pixel grid.
  - `grass_side.png` — Green grass cap on the upper rows with jagged, irregular drip fringe hanging into the warm dirt below.
  - `dirt.png` — Earth loam with warm brown and pebble flecks.
  - `stone_generic.png` — Slate stone for the island keel.
- **Pixel-Art Sharpness:**
  - All textures must be configured with:
    ```javascript
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    ```
  - Zero blur or bilinear interpolation; pixels must be crisp and readable.

### 2. Multi-Material Voxel Definition
- For Grass Blocks:
  - Face 0 (+X), Face 1 (-X), Face 4 (+Z), Face 5 (-Z): `grass_side.png`
  - Face 2 (+Y, Top): `grass_top.png`
  - Face 3 (-Y, Bottom): `dirt.png`
- For Dirt Blocks: `dirt.png` on all 6 faces.
- For Stone Blocks: `stone_generic.png` on all 6 faces.

### 3. Lighting & Directional Shading
- Retain the cinematic dual-tone lighting:
  - Directional warm sunlight from `[-18, 28, 16]` (`#fff2db`, intensity 1.15).
  - Cool hemisphere skylight (`#9ec5fe` sky, `#4a3f35` ground, intensity 0.50).
  - Directional face multipliers applied to materials:
    - Top face (+Y): 1.00
    - Side faces ($\pm X, \pm Z$): 0.75
    - Bottom face (-Y): 0.45

### 4. Camera & Cinematic Staging
- Maintain 40° FOV, downward pitch ~28°, camera distance ~6.85, smooth damping, and intro glide.
- Player character scaled to < 25% screen height.

### 5. Contract Hooks
- `window.__game.cinematic`: `introPlaying`, `fov = 40`, `pitchDegrees`, `textureMode = "pixel_art_16x16"`.
- `window.__game.player` and stable DOM IDs (`#hud`, `#panel`, etc.).

## Done Criteria
1. Grass blocks exhibit the exact visual structure from the reference image: rich green top, jagged green teeth hanging into brown dirt on the sides, and dirt on the bottom.
2. Textures render with crisp `NearestFilter` pixel edges (no blur).
3. All automated Playwright checks pass with 0 errors.
4. Screenshot `01_pixel_grass_baseline.png` captured for Reviewer audit.
