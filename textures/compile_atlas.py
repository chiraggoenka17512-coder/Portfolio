import os
import json
from PIL import Image

tex_dir = os.path.dirname(os.path.abspath(__file__))
primary_dir = os.path.join(tex_dir, "primary_16x16_block_set")
kenney_dir = os.path.join(tex_dir, "kenney_voxel_pack")

# Texture catalog mapping block IDs to their source files
# 16x16 grid: 16 tiles wide x 16 tiles high = 256x256 px
texture_manifest = [
    # Row 0: Terrain & Basics (indices 0 - 15)
    ("grass_top", os.path.join(primary_dir, "grass_top.png")),
    ("grass_side", os.path.join(primary_dir, "grass_side.png")),
    ("dirt", os.path.join(primary_dir, "dirt.png")),
    ("stone", os.path.join(primary_dir, "stone_generic.png")),
    ("cobblestone", os.path.join(primary_dir, "cobblestone.png")),
    ("stone_brick", os.path.join(primary_dir, "cobblestone_bricks.png")),
    ("oak_planks", os.path.join(primary_dir, "oak_planks.png")),
    ("pine_planks", os.path.join(primary_dir, "pine_planks.png")),
    ("oak_log_side", os.path.join(primary_dir, "oak_log_side.png")),
    ("oak_log_top", os.path.join(primary_dir, "oak_log_top.png")),
    ("pine_log_side", os.path.join(primary_dir, "pine_log_side.png")),
    ("glass", os.path.join(primary_dir, "glass.png")),
    ("obsidian", os.path.join(primary_dir, "obsidian.png")),
    ("quartz", os.path.join(primary_dir, "marble.png")),
    ("quartz_brick", os.path.join(primary_dir, "marble_bricks.png")),
    ("slate", os.path.join(primary_dir, "slate.png")),
    
    # Row 1: Interactive & Accent Blocks (indices 16 - 31)
    ("slate_tiles", os.path.join(primary_dir, "slate_tiles.png")),
    ("sandstone", os.path.join(primary_dir, "sandstone.png")),
    ("mud_bricks", os.path.join(primary_dir, "mud_bricks.png")),
    ("oak_leaves", os.path.join(primary_dir, "oak_leaves.png")),
    ("chest_front", os.path.join(primary_dir, "chest_front.png")),
    ("barrel_side", os.path.join(primary_dir, "barrel_side.png")),
    ("lectern_top", os.path.join(primary_dir, "lectern_top.png")),
    ("lantern", os.path.join(primary_dir, "lantern.png")),
    ("water", os.path.join(kenney_dir, "water.png")),
    ("ice", os.path.join(kenney_dir, "ice.png")),
    ("lava", os.path.join(kenney_dir, "lava.png")),
    ("cotton_blue", os.path.join(kenney_dir, "cotton_blue.png")),
    ("cotton_green", os.path.join(kenney_dir, "cotton_green.png")),
    ("cotton_red", os.path.join(kenney_dir, "cotton_red.png")),
    ("cotton_tan", os.path.join(kenney_dir, "cotton_tan.png")),
    ("metal_iron", os.path.join(kenney_dir, "stone_iron.png")),
    
    # Row 2: Specialty & Custom Station Tiles (indices 32 - 40)
    ("metal_silver", os.path.join(kenney_dir, "stone_silver.png")),
    ("crafting_table", os.path.join(kenney_dir, "table.png")),
    ("furnace", os.path.join(kenney_dir, "oven.png")),
    ("redstone", os.path.join(kenney_dir, "redstone.png")),
    ("beacon", os.path.join(primary_dir, "beacon.png")),
    ("compass", os.path.join(primary_dir, "compass.png")),
    ("scaffolding", os.path.join(primary_dir, "scaffolding.png")),
    ("gauge_face", os.path.join(primary_dir, "gauge_face.png")),
    ("command_block", os.path.join(primary_dir, "command_block.png")),
]

ATLAS_SIZE = 256
TILE_SIZE = 16
TILES_PER_ROW = ATLAS_SIZE // TILE_SIZE

atlas_img = Image.new("RGBA", (ATLAS_SIZE, ATLAS_SIZE), (0, 0, 0, 0))
atlas_meta = {}

for idx, (name, fpath) in enumerate(texture_manifest):
    row = idx // TILES_PER_ROW
    col = idx % TILES_PER_ROW
    x = col * TILE_SIZE
    y = row * TILE_SIZE
    
    tile = Image.open(fpath).convert("RGBA").resize((TILE_SIZE, TILE_SIZE), Image.NEAREST)
    atlas_img.paste(tile, (x, y))
    
    u0 = x / ATLAS_SIZE
    v0 = (ATLAS_SIZE - y - TILE_SIZE) / ATLAS_SIZE  # OpenGL UV convention
    u1 = (x + TILE_SIZE) / ATLAS_SIZE
    v1 = (ATLAS_SIZE - y) / ATLAS_SIZE
    
    atlas_meta[name] = {
        "index": idx,
        "col": col,
        "row": row,
        "x": x,
        "y": y,
        "uv": [u0, v0, u1, v1]
    }

atlas_path = os.path.join(tex_dir, "atlas.png")
meta_path = os.path.join(tex_dir, "atlas.json")

atlas_img.save(atlas_path)
with open(meta_path, "w", encoding="utf-8") as f:
    json.dump(atlas_meta, f, indent=2)

print(f"Atlas compiled successfully: {atlas_path} ({len(texture_manifest)} tiles, 256x256 px).")
