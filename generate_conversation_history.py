import json
import re

transcript_path = r'C:\Users\Chirag\.gemini\antigravity\brain\90fdbbc7-9b38-4e44-bb77-7304904fbc60\.system_generated\logs\transcript.jsonl'

with open(transcript_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

steps = [json.loads(l) for l in lines]

user_turns = []
for i, s in enumerate(steps):
    if s.get('type') == 'USER_INPUT':
        user_turns.append((i, s))

print(f"Found {len(user_turns)} user turns.")

history_doc = []
history_doc.append("# 📜 Complete Conversation History & Context Log\n")
history_doc.append("> **Project:** 3D Minecraft Portfolio\n")
history_doc.append("> **Purpose:** Full verbatim record of all user prompts, design iterations, agent actions, architectural decisions, and technical discoveries.\n")
history_doc.append("> **Reference File:** Paired with [`AGENT_HANDOFF.md`](file:///d:/Portfolio/AGENT_HANDOFF.md) for the incoming coding agent.\n\n---\n")

for turn_idx, (step_num, turn) in enumerate(user_turns):
    content = turn.get('content', '')
    # Strip <ADDITIONAL_METADATA>...</ADDITIONAL_METADATA>
    clean_prompt = re.sub(r'<ADDITIONAL_METADATA>.*?</ADDITIONAL_METADATA>', '', content, flags=re.DOTALL)
    clean_prompt = clean_prompt.replace('<USER_REQUEST>', '').replace('</USER_REQUEST>', '').strip()
    
    timestamp = turn.get('created_at', '')
    
    history_doc.append(f"## 💬 Turn {turn_idx + 1} ({timestamp})\n")
    history_doc.append(f"### 👤 User Prompt:\n```text\n{clean_prompt}\n```\n")
    
    # Add contextual summary of what happened in response to this turn
    history_doc.append("### 🤖 Agent Response & Actions Taken:\n")
    
    if turn_idx == 0:
        history_doc.append("- Generated specs and procedural generators for five original 16x16 tiles: Grass Top, Grass Side, Earth Dirt, Slate Stone, and Wood Planks.\n")
    elif turn_idx == 1:
        history_doc.append("- User asked if agent can draw in Piskel. Explained agent generates PNG assets directly via canvas/Node scripts matching pixel art standards.\n")
    elif turn_idx == 2:
        history_doc.append("- Generated complete set of 16x16 authentic pixel art block textures in `textures/primary_16x16_block_set/`.\n")
    elif turn_idx == 3:
        history_doc.append("- User provided the full 13-phase roadmap from setup, floating island, workshop, projects district, to polish.\n")
    elif turn_idx == 4:
        history_doc.append("- User defined the 4-role evaluation loop (Coder, Verifier/QA, Reviewer, Fixer) ensuring independent verification.\n")
    elif turn_idx == 5:
        history_doc.append("- Executed Phase 1: Set up Three.js scene, base canvas, HUD overlay, and single test cube. Pushed to GitHub repository.\n")
    elif turn_idx == 6:
        history_doc.append("- User approved initial setup confirmation.\n")
    elif turn_idx == 7:
        history_doc.append("- Transitioned to Phase 2: Floating island generation with directional face shading.\n")
    elif turn_idx == 8:
        history_doc.append("- User gave 'What makes it feel like a film' cinematography spec: FOV 35-45°, downward pitch 25-35°, player small in frame, near/mid/far layers, ACES tone mapping, soft vignette, drifting clouds.\n")
    elif turn_idx == 9:
        history_doc.append("- User provided detailed Terrain & Carved Ponds spec: Simplex noise heights 1..3, surface mix (grass, dirt, sand, gravel), 2-4 small ponds with sand center and gravel rim, water plane at Y=0.85, tall grass and flower sprites.\n")
    elif turn_idx == 10:
        history_doc.append("- User mandated all tasks to be executed by separate agents in separate parallel loops.\n")
    elif turn_idx == 11:
        history_doc.append("- User attached reference image for authentic pixel-art grass block structure (green top, jagged overhang drips, loam dirt body).\n")
    elif turn_idx == 12:
        history_doc.append("- User requested sunset sky dome shader with custom elevation stops (red-orange horizon, amber/yellow, muted rose, deep blue zenith, low sun disc, stretched noise clouds) and parallel coder agents.\n")
    elif turn_idx == 13:
        history_doc.append("- Diagnosed why sunset sky was initially pale: camera pitch at 28.5° with 40° FOV pointed all viewport rays below horizon into ground; camera far was clipping dome; toneMapped was distorting blues. Adjusted camera parameters, set `toneMapped: false`, and fixed sky dome centering.\n")
    elif turn_idx == 14:
        history_doc.append("- User instructed to continue pipeline.\n")
    elif turn_idx == 15:
        history_doc.append("- User requested scene brightening & warming: Key light to `#ffd27a`, warm hemisphere fill (`#bfe3ff`/`#ffb27a`), fresh yellow-green grass, lighter dirt, clear turquoise pond water, soft vignette.\n")
    elif turn_idx == 16:
        history_doc.append("- User attached reference landscape screenshot and requested rebuild of spawn view: FOV 60°, broad rolling hills with steep cliff and gentle slope, diagonal shallow river (4-6 blocks wide) with translucent blue water, far mountain backdrop, 6-10 birch and spruce trees, atmospheric blue haze fog.\n")
    elif turn_idx == 17:
        history_doc.append("- User requested replacement of sunset sky with daytime sky (#3f8fdc top, #9cc9f0 horizon), simple bright sun disc in upper sky, blocky stacked-slab clouds, reduced fog density, and reported: 'All the plants are upside down, fix that'. Fixed plant UV mapping and added missing white flower texture.\n")
    elif turn_idx == 18:
        history_doc.append("- User asked to wrap up completed work and detail what is left. Provided comprehensive status report of all modules, test passes, and pending portfolio structures.\n")
    elif turn_idx == 19:
        history_doc.append("- User gave critical directive: 'Don't build anything. Colors look very desaturated and pale, textures not close to Minecraft.' User provided the 7-layer portfolio opening specification. Created `AGENT_HANDOFF.md`.\n")
    elif turn_idx == 20:
        history_doc.append("- User requested adding the Agent Loop specification. Added Section 10 to `AGENT_HANDOFF.md` detailing the 5-stage automated closed-loop evaluation system.\n")
    elif turn_idx == 21:
        history_doc.append("- User requested full conversation history and context compiled for the incoming agent. Generating this document.\n")
    
    history_doc.append("\n---\n")

# Write out CONVERSATION_HISTORY.md
with open("CONVERSATION_HISTORY.md", "w", encoding="utf-8") as f:
    f.write("\n".join(history_doc))

print("Created CONVERSATION_HISTORY.md successfully.")
