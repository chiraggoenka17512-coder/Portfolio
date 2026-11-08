import os
from PIL import Image, ImageDraw

tex_dir = os.path.dirname(os.path.abspath(__file__))
primary_dir = os.path.join(tex_dir, "primary_16x16_block_set")
kenney_dir = os.path.join(tex_dir, "kenney_voxel_pack")

# Load oak planks for creating chest & barrel
oak_path = os.path.join(primary_dir, "oak_planks.png")
oak_img = Image.open(oak_path).convert("RGBA").resize((16, 16), Image.NEAREST)

# 1. Chest side / front
chest = oak_img.copy()
draw = ImageDraw.Draw(chest)
# Dark border around chest
draw.rectangle([0, 0, 15, 15], outline=(40, 25, 15, 255))
# Horizontal lid split at y=6
draw.line([(0, 6), (15, 6)], fill=(25, 15, 8, 255))
# Silver/iron latch in center (x=7,8; y=5,6,7)
draw.rectangle([7, 5, 8, 7], fill=(220, 220, 230, 255), outline=(100, 100, 110, 255))
chest.save(os.path.join(primary_dir, "chest_front.png"))

# 2. Barrel side
barrel = oak_img.copy()
draw_b = ImageDraw.Draw(barrel)
# Iron bands at y=3 and y=12
draw_b.line([(0, 3), (15, 3)], fill=(70, 75, 80, 255), width=2)
draw_b.line([(0, 12), (15, 12)], fill=(70, 75, 80, 255), width=2)
# Dark rivets
for rx in [3, 8, 13]:
    draw_b.point((rx, 3), fill=(180, 190, 200, 255))
    draw_b.point((rx, 12), fill=(180, 190, 200, 255))
barrel.save(os.path.join(primary_dir, "barrel_side.png"))

# 3. Lectern top
lectern = oak_img.copy()
draw_l = ImageDraw.Draw(lectern)
# Red book cover spread
draw_l.polygon([(3, 3), (7, 4), (7, 12), (3, 11)], fill=(160, 30, 30, 255))
draw_l.polygon([(8, 4), (12, 3), (12, 11), (8, 12)], fill=(160, 30, 30, 255))
# Book pages (parchment)
draw_l.polygon([(4, 4), (7, 5), (7, 11), (4, 10)], fill=(240, 235, 210, 255))
draw_l.polygon([(8, 5), (11, 4), (11, 10), (8, 11)], fill=(240, 235, 210, 255))
# Spine line
draw_l.line([(7, 4), (8, 4), (8, 12), (7, 12)], fill=(100, 20, 20, 255))
lectern.save(os.path.join(primary_dir, "lectern_top.png"))

# 4. Lantern
lantern = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
draw_lt = ImageDraw.Draw(lantern)
# Dark iron cage
draw_lt.rectangle([3, 4, 12, 14], outline=(45, 50, 55, 255))
# Amber glowing interior
draw_lt.rectangle([4, 5, 11, 13], fill=(255, 180, 40, 240))
# Bright core
draw_lt.rectangle([6, 7, 9, 11], fill=(255, 245, 140, 255))
# Top handle ring
draw_lt.rectangle([6, 1, 9, 3], outline=(60, 65, 70, 255))
lantern.save(os.path.join(primary_dir, "lantern.png"))

print("Synthesized complementary tiles saved.")
