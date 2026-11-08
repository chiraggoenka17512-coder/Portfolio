import os
import json
import base64
from io import BytesIO
from PIL import Image

tiles_data = {
    "beacon": {
        "palette": {
            "H": (120, 166, 200, 255),
            "M": (45, 64, 89, 255),
            "D": (20, 27, 36, 255),
            "C": (0, 180, 216, 255),
            "W": (224, 251, 252, 255),
        },
        "grid": [
            "HHHHHHHHHHHHHHHM",
            "HMMMMMMMMMMMMMMD",
            "HMMDDDDDDDDDDMMD",
            "HMDDCCCCCCCCDDMD",
            "HMDCCWWWWWWCCDMD",
            "HMDCWWCCCCWWCDMD",
            "HMDCWCCWWCCWCDMD",
            "HMDCWCWWWWWCWCMD",
            "HMDCWCWWWWWCWCMD",
            "HMDCWCCWWCCWCDMD",
            "HMDCWWCCCCWWCDMD",
            "HMDCCWWWWWWCCDMD",
            "HMDDCCCCCCCCDDMD",
            "HMMDDDDDDDDDDMMD",
            "HMMMMMMMMMMMMMMD",
            "MDDDDDDDDDDDDDDD",
        ]
    },
    "compass": {
        "palette": {
            "S": (122, 136, 155, 255),
            "B": (27, 30, 35, 255),
            "F": (237, 242, 247, 255),
            "R": (230, 57, 70, 255),
            "N": (43, 76, 126, 255),
        },
        "grid": [
            "SSSSSSSSSSSSSSSS",
            "SSSSBBBBBBBBBBBB",
            "SSBBFFFBBIFFBBBB".replace("I", "B"),
            "SBFFFFFRRFFFFFBB",
            "SBFFFFRRRRFFFFBB",
            "SBFFFRRRRRRFFFBB",
            "SBFFRRRRRRRRFFBB",
            "SBBFRRRSSRRRFBBB",
            "SBBFNNNSSNNNFBBB",
            "SBFFNNNNNNNNFFBB",
            "SBFFFNNNNNNFFFBB",
            "SBFFFFNNNNFFFFBB",
            "SBFFFFFNNFFFFFBB",
            "SBBBFFFBBIFFBBBB".replace("I", "B"),
            "SBBBBBBBBBBBBBBB",
            "BBBBBBBBBBBBBBBB",
        ]
    },
    "scaffolding": {
        "palette": {
            ".": (0, 0, 0, 0),
            "H": (176, 137, 104, 255),
            "D": (67, 40, 28, 255),
            "J": (35, 25, 20, 255),
        },
        "grid": [
            "JHHHHHHHHHHHHHHJ",
            "HDDDDDDDDDDDDDDD",
            "HD.HD......HD.HD",
            "HD..HD....HD..HD",
            "HD...HD..HD...HD",
            "HD....HDHD....HD",
            "HD.....JJ.....HD",
            "HD....JJJJ....HD",
            "HD....JJJJ....HD",
            "HD.....JJ.....HD",
            "HD....HDHD....HD",
            "HD...HD..HD...HD",
            "HD..HD....HD..HD",
            "HD.HD......HD.HD",
            "HDHHHHHHHHHHHHHD",
            "JDDDDDDDDDDDDDDJ",
        ]
    },
    "gauge_face": {
        "palette": {
            "P": (30, 34, 39, 255),
            "B": (61, 68, 77, 255),
            "W": (220, 225, 232, 255),
            "G": (46, 196, 182, 255),
            "R": (231, 29, 54, 255),
        },
        "grid": [
            "PPPPPPPPPPPPPPPP",
            "PPPBBAABBBBBAPPP".replace("A", "B"),
            "PPBBWWWWWWWWBBPP",
            "PBBWGWWWWWWWRWBP",
            "PBWGWWWRRWWWRWBP",
            "PBWWWWWRRWWWWWBP",
            "PBWWWWWRRWWWWWBP",
            "PBWWWWWRRWWWWWBP",
            "PBWWWWBBBBWWWWBP",
            "PBWWWWBBBBWWWWBP",
            "PBWWWWWWWWWWWWBP",
            "PBWWWWWWWWWWWWBP",
            "PPBBWWWWWWWWBBPP",
            "PPPBBAABBBBBAPPP".replace("A", "B"),
            "PPPPPPPPPPPPPPPP",
            "PPPPPPPPPPPPPPPP",
        ]
    },
    "command_block": {
        "palette": {
            "H": (68, 76, 86, 255),
            "S": (34, 39, 46, 255),
            "K": (18, 20, 23, 255),
            "A": (255, 159, 28, 255),
            "Y": (255, 228, 158, 255),
        },
        "grid": [
            "HHHHHHHHHHHHHHHS",
            "HSSSSSSSSSSSSSSK",
            "HSKKKKKKKKKKKKSK",
            "HSKSSSSSSSSSSKSK",
            "HSKSSSAAAASSSKSK",
            "HSKSSAAYYAASSKSK",
            "HSKSSAYYYYASSKSK",
            "HSKSSAYYYYASSKSK",
            "HSKSSAAYYAASSKSK",
            "HSKSSSAAAASSSKSK",
            "HSKSSSSKKSSSSKSK",
            "HSKSKKKKKKKKSKSK",
            "HSKSSSSSSSSSSKSK",
            "HSKKKKKKKKKKKKSK",
            "HSSSSSSSSSSSSSSK",
            "SKKKKKKKKKKKKKKK",
        ]
    }
}

out_dir_png = r"d:\Portfolio\textures\primary_16x16_block_set"
out_dir_piskel = r"d:\Portfolio\textures\piskel_projects"
out_dir_preview = r"d:\Portfolio\textures\previews_upscaled"

os.makedirs(out_dir_png, exist_ok=True)
os.makedirs(out_dir_piskel, exist_ok=True)
os.makedirs(out_dir_preview, exist_ok=True)

for name, data in tiles_data.items():
    palette = data["palette"]
    grid = data["grid"]
    
    img = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    for y in range(16):
        row = grid[y]
        if len(row) != 16:
            raise ValueError(f"Tile {name} row {y} has length {len(row)} != 16: '{row}'")
        for x in range(16):
            char = row[x]
            color = palette[char]
            img.putpixel((x, y), color)
            
    # Save standard 16x16 PNG
    png_path = os.path.join(out_dir_png, f"{name}.png")
    img.save(png_path)
    
    # Save 160x160 upscaled preview
    preview_path = os.path.join(out_dir_preview, f"{name}_10x.png")
    img.resize((160, 160), Image.NEAREST).save(preview_path)
    
    # Create Piskel project (.piskel JSON file)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_b64 = "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    layer_obj = {
        "name": "Layer 1",
        "opacity": 1,
        "frameCount": 1,
        "chunks": [
            {
                "layout": [[0]],
                "base64PNG": img_b64
            }
        ]
    }
    
    piskel_json = {
        "modelVersion": 2,
        "piskel": {
            "name": name,
            "description": f"Original 16x16 voxel tile: {name}",
            "fps": 12,
            "height": 16,
            "width": 16,
            "layers": [
                json.dumps(layer_obj)
            ]
        }
    }
    
    piskel_path = os.path.join(out_dir_piskel, f"{name}.piskel")
    with open(piskel_path, "w", encoding="utf-8") as pf:
        json.dump(piskel_json, pf, indent=2)
        
    print(f"Generated {name}: PNG, 10x Preview, and .piskel file.")

print("All tiles successfully rendered!")
