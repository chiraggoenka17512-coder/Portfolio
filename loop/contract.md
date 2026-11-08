# 📜 Test Contract: Minecraft Portfolio Verification

All phases must expose the following internal state and stable DOM element IDs so the automated browser agent can objectively verify execution.

## 1. JavaScript Window Object (`window.__game`)
The engine must attach a global `__game` object to `window`:

```javascript
window.__game = {
  // Player state
  player: {
    position: { x: 0, y: 0, z: 0 },
    yaw: 0,
    isGrounded: true
  },
  // Active buildings currently placed in the scene
  buildings: [
    { id: "workshop", name: "The Workshop", position: { x: 0, y: 0, z: 0 } },
    // ... additional buildings as phases progress
  ],
  // Active UI modal panel: "workshop", "labelsense", etc., or null when closed
  activePanel: null
};
```

## 2. Stable Element IDs
The HTML overlay and UI system must provide the following IDs:
* `#hud` – Container for the player hotbar, hearts, food, and crosshair overlay.
* `#panel` – Active project modal window container.
* `#panel-title` – The title element inside the active modal window.
* `#panel-close` – The clickable close button (`[X]`) of the active modal window.
* `#nametag-{id}` – Floating name billboard element for a building (e.g., `#nametag-workshop`).

## 3. Engine Sign-Off Event
When Three.js finishes initializing, all initial textures are loaded, and the game loop has rendered its first frame:
* The engine must log the exact string `"READY"` to the browser console:
  ```javascript
  console.log("READY");
  ```
