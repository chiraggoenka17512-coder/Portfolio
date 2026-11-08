# 🧱 Minecraft Builder Principles & Architectural Design Guide
**Compiled for:** Three.js Minecraft-Style 3D Portfolio  
**Research Source:** Top Minecraft master builders (BdoubleO100, Grian, fWhip, MythicalSausage, GeminiTay, GoodTimesWithScar, BlockWorks, Minecraft Wiki)

---

## 1. Top 5 Core Principles for Three.js Voxel Portfolios

1. **Macro-Depth Before Micro-Detail:**  
   Never build flat planar walls. Push framing columns forward by one voxel and recess windows by one block. In Three.js, geometry-level depth creates natural self-shadows that flat textured planes cannot replicate.
2. **The 60-30-10 Palette & Value Gradients:**  
   Limit each structure to 3–5 block types: 60% dominant base material, 30% structural framing/roof, and 10% high-contrast accent. Transition values vertically (darker, heavier blocks at the foundation, transitioning lighter toward the sky) to anchor structures to the island.
3. **The Rule of Odds for Proportions:**  
   Always design structural footprints with odd block dimensions (e.g., $5 \times 5$, $7 \times 9$, $11 \times 11$). This guarantees a true 1-block center for doorways, roof peaks, and interactive focal points.
4. **Hardcoded Directional Face Shading:**  
   Minecraft’s iconic voxel readability does not rely on heavy dynamic lights; it uses directional face dimming (Top: 100%, North/South: 80%, East/West: 60%, Bottom: 50%) and ambient occlusion in concave corners. Baking these multipliers into vertex colors keeps Three.js rendering lightning-fast at 60 FPS on mobile.
5. **Low FOV / Telephoto Camera Framing:**  
   Default wide camera lenses ($70^\circ$–$90^\circ$ FOV) stretch cubes at the screen edges into distorted prisms. Dialing the camera down to $35^\circ$–$45^\circ$ FOV compresses depth, preserves $90^\circ$ block proportions, and provides that crisp, isometric diorama feel.

---

## 2. Topic Breakdown & Rules

### Topic 1: Color Palettes & Block Combinations
- **60-30-10 Palette Hierarchy:** Primary body (60%), secondary trim (30%), focal accent (10%). (e.g. 60% Stone Bricks, 30% Spruce Wood, 10% Gold/Lantern).
- **Vertical Value Gradients:** Foundation of Deepslate/Cobblestone bleeding upward into Stone Bricks, Andesite, and smooth light stone at the parapet.
- **Material Triad Pairing:** Pair one neutral stone, one warm timber, and one colored highlight; avoid combining blocks with clashing visual noise.
- **Noise-Clustering Over Checkerboarding:** When adding texture variation, cluster blocks in organic patches rather than alternating 1:1 checkers.

### Topic 2: Proportion, Scale & Dimensions
- **Rule of Odds:** Odd block dimensions (3, 5, 7, 9) allow a centered 1-block door with equal framing.
- **Human-Scale Story Height:** Keep interior story heights between 3 and 5 blocks high.
- **Roof-to-Wall Ratio (1:1 to 1:1.5):** Vertical height of a pitched roof should equal or exceed wall height to prevent squished looks.
- **Broken Footprints (L & T Shapes):** Intersect rectangular volumes to create visual depth and natural room zoning.

### Topic 3: Lighting & Shading
- **Directional Face Dimming:** Top: 1.0, N/S: 0.8, E/W: 0.6, Bottom: 0.5.
- **Corner Ambient Occlusion:** Darken vertices where walls meet floors or overhangs by 20–30%.
- **Recessed Warm Light Wells:** Enclose lanterns inside alcoves or behind stairs for soft warm pools of light.
- **Baked False Shadows:** Place darker stone or wood variants under eaves to simulate cast shadows without dynamic shadow maps.

### Topic 4: Detailing & Greebling
- **Macro-Depth First:** Pull corner log pillars outward by 1 block relative to the wall face.
- **Functional Greebling Only:** Inverted stairs as structural corbels, slabs as lintels, fences as railings.
- **The Squint Test:** Blur your vision from 15 blocks away. If windows blur into static, remove 30% of small detail blocks.
- **Overhanging Bargeboards:** Roofs should overhang walls by at least 1 block horizontally and drop 1 block down.

### Topic 5: Silhouette & Readability
- **The 20-Block Silhouette Test:** A structure must be recognizable purely by its outline against the sky from a distance.
- **Contrasting Roof Ridge:** Use stone-brick stairs for outer gable edges and spruce stairs for the inner slope.
- **Cantilevered Floors:** Project second floors 1 block outward past stone foundations.

### Topic 6: Landscaping & Island Topography
- **Pathway Gradients:** Path blocks at center, coarse dirt/rooted dirt on edges, blending into grass with stone pebbles.
- **Foundation Foliage:** Cushion 90° wall-to-grass seams with leaf bushes, moss carpets, and vines.
- **Island Under-Belly Tapering:** Floating island steps down from grass to dirt to jagged deepslate stalactites into the void.

### Topic 7: Three.js Camera & Showcase Presentation
- **Perspective Camera FOV:** Use 35°–45° FOV to prevent spherical corner stretching.
- **Isometric-Adjacent Showcase Pitch:** 45° horizontal azimuth, 30° vertical elevation showing top, front, and side faces simultaneously.
- **Exponential Distance Fog:** `scene.fog = new THREE.FogExp2('#38bdf8', 0.025)` softens the void edge seamlessly.

---

## 3. Top Master Builders Referenced
1. **BdoubleO100 (Hermitcraft):** Pioneer of vertical value gradients and atmospheric light wells.
2. **fWhip:** Pioneer of broken footprints, 60-30-10 palette discipline, and multi-tier pathways.
3. **Grian:** Master of 1:1 human-scale proportions, recessed depth, and avoiding common builder pitfalls.
4. **MythicalSausage:** Master of roof pitches, gables, dormers, and functional greebling.
5. **GeminiTay:** Specialist in organic terraforming, curved tree trunks, and foundation foliage softening.
6. **GoodTimesWithScar:** King of silhouette verticality, steampunk spires, and whimsical architectural character.
7. **BlockWorks:** Architectural voxel studio behind institutional museum-grade and educational Minecraft worlds.
