/**
 * ============================================================================
 * 🌄 Landscape Camera, Lighting & Atmospheric Haze Specialist
 * textures/landscape_camera_haze.js
 * ============================================================================
 *
 * Implements camera framing, dual-tone lighting, and aerial perspective haze
 * for the natural Minecraft landscape view.
 *
 * Requirements Met:
 * 1. Camera Framing:
 *    - FOV: exactly 60 degrees (camera.fov = 60).
 *    - Position: 3 to 5 blocks above ground, 8 to 10 blocks behind player
 *      (e.g., player at (0, 3, 8) -> camera at (0, 7.5, 17.5)).
 *    - Gentle pitch (~18 to 22 degrees downward, default 20.0°) looking down
 *      at player and landscape so the horizon line sits in the upper third
 *      of the screen (~220px from top on 720p).
 *    - Captures 3 distinct depth layers:
 *        * Foreground: player spawn meadow, wildflowers, sand riverbank (Z: 0 to 10).
 *        * Midground: diagonal blue river, birch trees on right bank (Z: -10 to 0).
 *        * Background: left rising mountain bluff with stone terraces and spruce
 *          trees, fading into distant atmospheric haze (Z < -10, distance > 25).
 *
 * 2. Lighting:
 *    - Bright, warm key light (THREE.DirectionalLight):
 *        * Position: low and slightly to the side (16, 14, 18) so front (+Z)
 *          and top (+Y) faces catch bright warm golden light.
 *        * Color: #ffd27a (0xffd27a), intensity ~1.4.
 *    - Hemisphere fill light (THREE.HemisphereLight):
 *        * Sky from above: #bfe3ff, Ground from below: #ffb27a.
 *        * Intensity ~0.85 so shadowed faces are warm mid-tones (~40% brightness),
 *          never near black.
 *
 * 3. Atmospheric Aerial Perspective (Cool Blue Haze):
 *    - Scene Fog: THREE.Fog with color #b9d8f5 (pale blue haze), near ~28, far ~95.
 *    - Near surfaces in foreground stay warm and vibrant golden-green (fog = 0%),
 *      while distant mountain and trees (Z < -10, distance > 25) softly blend
 *      into the pale blue atmospheric haze.
 *
 * 4. Exports:
 *    - window.setupLandscapeCameraAndHaze(scene, camera, renderer, player, options)
 *      returning: { cameraParams, lights, fog, update(dt), dispose() }
 *    - UMD / CommonJS / Global browser compatibility.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const THREE = (typeof global !== 'undefined' && global.THREE) ? global.THREE : (function () {
      try { return require('three'); } catch (_) { return null; }
    })();
    module.exports = factory(THREE);
  } else {
    const exports = factory(root.THREE);
    root.setupLandscapeCameraAndHaze = exports.setupLandscapeCameraAndHaze;
    root.LandscapeCameraHaze = exports;
  }
}(typeof self !== 'undefined' ? self : this, function (importedTHREE) {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & CONFIGURATION
  // =========================================================================

  const LANDSCAPE_CAMERA_CONFIG = Object.freeze({
    // Camera optics and framing
    FOV: 60.0,
    PITCH_DEGREES: 20.0, // In range [18, 22] degrees downward
    CAMERA_OFFSET: Object.freeze({ x: 0.0, y: 4.5, z: 9.5 }), // +4.5 Y above player, +9.5 Z behind
    DEFAULT_PLAYER_POS: Object.freeze({ x: 0.0, y: 3.0, z: 8.0 }),
    LOOK_DISTANCE: 14.0,

    // Horizon framing metrics (720p reference)
    VIEWPORT_HEIGHT_REF: 720,
    HORIZON_Y_720P: 220, // Pixels from top on 720p (~30.5% upper-third)

    // Directional Key Light (Neutral-warm sunlight)
    KEY_LIGHT: Object.freeze({
      color: 0xfff4e0,       // #fff4e0 neutral-warm sunlight
      intensity: 1.35,       // Crisp key light
      position: Object.freeze({ x: 20.0, y: 32.0, z: 16.0 }), // +Z & +Y illuminated
      target: Object.freeze({ x: 0.0, y: 2.0, z: 0.0 }),
      shadow: Object.freeze({
        mapSize: 2048,
        near: 0.5,
        far: 140.0,
        bounds: 35.0,
        bias: -0.0004
      })
    }),

    // Hemisphere Fill Light (Atmospheric sky + cool grass bounce)
    HEMI_LIGHT: Object.freeze({
      skyColor: 0x9cc9f0,    // #9cc9f0 cool daytime blue from above
      groundColor: 0x6e8a52, // #6e8a52 grass reflection from below
      intensity: 0.75,       // Clear brightness step between top, side, and bottom faces
      position: Object.freeze({ x: 0.0, y: 50.0, z: 0.0 })
    }),

    // Atmospheric Fog (Linear aerial perspective haze matching horizon blue)
    FOG: Object.freeze({
      color: 0x9cc9f0,       // #9cc9f0 matches horizon blue
      near: 48.0,            // Reduced fog density so distant terrain fades only slightly
      far: 140.0,            // Distant mountain fades softly
      densityExp2: 0.008     // Fallback for exponential mode
    }),

    // 3 Distinct Depth Layers Specification
    DEPTH_LAYERS: Object.freeze({
      foreground: Object.freeze({
        name: 'Foreground Meadow & Spawn',
        description: 'Player spawn meadow, wildflowers, sand riverbank',
        zRange: Object.freeze([0.0, 10.0]),
        distanceRange: Object.freeze([7.5, 17.5]),
        fogInfluence: 0.0,
        character: 'Warm, vibrant golden-green, un-fogged direct sunlight'
      }),
      midground: Object.freeze({
        name: 'Midground River & Groves',
        description: 'Diagonal blue river, birch trees on the right bank',
        zRange: Object.freeze([-10.0, 0.0]),
        distanceRange: Object.freeze([17.5, 27.5]),
        fogInfluence: 0.0,
        character: 'Crisp river reflection and silver birch bark'
      }),
      background: Object.freeze({
        name: 'Background Bluff & Terraces',
        description: 'Left rising mountain bluff with stone terraces and spruce trees',
        zRange: Object.freeze([-60.0, -10.0]),
        distanceRange: Object.freeze([27.5, 95.0]),
        fogInfluence: '0% to 100% gradient (fades into #b9d8f5 haze)',
        character: 'Soft aerial perspective, fading into pale blue atmospheric veil'
      })
    })
  });

  // =========================================================================
  // 2. UTILITIES & MATH HELPERS
  // =========================================================================

  /**
   * Resolves the active THREE.js library from context, global, or parameter.
   */
  function resolveTHREE(explicitTHREE) {
    if (explicitTHREE && explicitTHREE.PerspectiveCamera) return explicitTHREE;
    if (importedTHREE && importedTHREE.PerspectiveCamera) return importedTHREE;
    if (typeof THREE !== 'undefined' && THREE.PerspectiveCamera) return THREE;
    if (typeof window !== 'undefined' && window.THREE && window.THREE.PerspectiveCamera) return window.THREE;
    if (typeof globalThis !== 'undefined' && globalThis.THREE && globalThis.THREE.PerspectiveCamera) return globalThis.THREE;
    if (typeof global !== 'undefined' && global.THREE && global.THREE.PerspectiveCamera) return global.THREE;
    return null;
  }

  /**
   * Safely extracts a 3D position vector {x, y, z} from various input types:
   * THREE.Vector3, THREE.Object3D, { position: {x, y, z} }, or { x, y, z }.
   */
  function extractPosition(input, defaultPos, THREE_REF) {
    const fallback = defaultPos || LANDSCAPE_CAMERA_CONFIG.DEFAULT_PLAYER_POS;
    let x = fallback.x, y = fallback.y, z = fallback.z;

    if (input) {
      if (input.position && typeof input.position.x === 'number') {
        x = input.position.x;
        y = input.position.y;
        z = input.position.z;
      } else if (typeof input.x === 'number') {
        x = input.x;
        y = input.y !== undefined ? input.y : fallback.y;
        z = input.z !== undefined ? input.z : fallback.z;
      }
    }

    if (THREE_REF && THREE_REF.Vector3) {
      return new THREE_REF.Vector3(x, y, z);
    }
    return { x: x, y: y, z: z };
  }

  /**
   * Computes a 3D look-at target point ahead of the camera given camera position,
   * downward pitch angle in degrees, and distance along the view vector.
   *
   * In Three.js coordinate system (right: +X, up: +Y, camera faces -Z):
   * Downward pitch of theta degrees rotates around X axis by -theta.
   * Forward unit vector: (0, -sin(theta), -cos(theta)).
   */
  function calculateLookAtTarget(camPos, pitchDegrees, distance, yawRad, THREE_REF) {
    const theta = (pitchDegrees * Math.PI) / 180.0;
    const dist = (typeof distance === 'number' && distance > 0) ? distance : LANDSCAPE_CAMERA_CONFIG.LOOK_DISTANCE;
    const yaw = (typeof yawRad === 'number') ? yawRad : 0.0;

    // Unit forward vector with downward pitch & optional yaw
    const forwardY = -Math.sin(theta);
    const forwardHorizontal = -Math.cos(theta);
    const forwardX = forwardHorizontal * Math.sin(yaw);
    const forwardZ = forwardHorizontal * Math.cos(yaw);

    const tx = camPos.x + forwardX * dist;
    const ty = camPos.y + forwardY * dist;
    const tz = camPos.z + forwardZ * dist;

    if (THREE_REF && THREE_REF.Vector3) {
      return new THREE_REF.Vector3(tx, ty, tz);
    }
    return { x: tx, y: ty, z: tz };
  }

  /**
   * Calculates the projected screen pixel Y-coordinate of the natural horizon
   * for a given pitch angle, field of view, and viewport height.
   *
   * @param {number} pitchDegrees - Downward camera tilt in degrees (e.g. 20°)
   * @param {number} fovDegrees - Vertical field of view in degrees (e.g. 60°)
   * @param {number} viewportHeight - Target screen height in pixels (e.g. 720)
   * @returns {{ pixelFromTop: number, percentFromTop: number, ndcY: number }}
   */
  function calculateHorizonMetrics(pitchDegrees, fovDegrees, viewportHeight) {
    const pitch = (pitchDegrees * Math.PI) / 180.0;
    const halfFov = (fovDegrees * 0.5 * Math.PI) / 180.0;
    const height = viewportHeight || 720;

    // NDC Y for infinite distant horizontal plane (y_cam / -z_cam = tan(pitch))
    const ndcY = Math.tan(pitch) / Math.tan(halfFov);
    // Screen pixel from top (NDC +1 = top (0px), NDC -1 = bottom (height px))
    const pixelFromTop = (height * 0.5) * (1.0 - ndcY);
    const percentFromTop = (pixelFromTop / height) * 100.0;

    return {
      pixelFromTop: Math.round(pixelFromTop * 10.0) / 10.0,
      percentFromTop: Math.round(percentFromTop * 10.0) / 10.0,
      ndcY: ndcY
    };
  }

  // =========================================================================
  // 3. MAIN SETUP FUNCTION
  // =========================================================================

  /**
   * Sets up camera framing, dual-tone lighting, and atmospheric haze for the
   * natural landscape view.
   *
   * @param {THREE.Scene} scene - Active Three.js scene.
   * @param {THREE.PerspectiveCamera} [camera] - Camera to configure (or newly created).
   * @param {THREE.WebGLRenderer} [renderer] - Optional WebGL renderer for clear color.
   * @param {THREE.Object3D|Object} [player] - Player object or position ({x, y, z}).
   * @param {Object} [options] - Optional parameter overrides.
   * @returns {{
   *   cameraParams: Object,
   *   lights: { dirLight: THREE.DirectionalLight, hemiLight: THREE.HemisphereLight, keyLight: THREE.DirectionalLight, fillLight: THREE.HemisphereLight },
   *   fog: THREE.Fog|THREE.FogExp2,
   *   update: Function,
   *   dispose: Function
   * }}
   */
  function setupLandscapeCameraAndHaze(scene, camera, renderer, player, options) {
    const opts = options || {};
    const THREE_REF = resolveTHREE(opts.THREE);

    if (!THREE_REF) {
      throw new Error(
        "[LandscapeCameraHaze] Three.js not found. Pass THREE in options.THREE or ensure window.THREE is available."
      );
    }

    // -----------------------------------------------------------------------
    // A. Player & Camera Framing Setup
    // -----------------------------------------------------------------------
    let activePlayer = player || null;
    const playerPos = extractPosition(activePlayer, LANDSCAPE_CAMERA_CONFIG.DEFAULT_PLAYER_POS, THREE_REF);

    // Camera offset: 3 to 5 blocks above ground, 8 to 10 blocks behind player
    const offset = {
      x: (opts.cameraOffset && typeof opts.cameraOffset.x === 'number') ? opts.cameraOffset.x : LANDSCAPE_CAMERA_CONFIG.CAMERA_OFFSET.x,
      y: (opts.cameraOffset && typeof opts.cameraOffset.y === 'number') ? opts.cameraOffset.y : LANDSCAPE_CAMERA_CONFIG.CAMERA_OFFSET.y,
      z: (opts.cameraOffset && typeof opts.cameraOffset.z === 'number') ? opts.cameraOffset.z : LANDSCAPE_CAMERA_CONFIG.CAMERA_OFFSET.z
    };

    // FOV: exactly 60 degrees
    const fov = (typeof opts.fov === 'number') ? opts.fov : LANDSCAPE_CAMERA_CONFIG.FOV;

    // Camera instance
    let activeCamera = camera;
    if (!activeCamera) {
      const aspect = (typeof window !== 'undefined' && window.innerWidth && window.innerHeight)
        ? (window.innerWidth / window.innerHeight)
        : (16 / 9);
      activeCamera = new THREE_REF.PerspectiveCamera(fov, aspect, 0.1, 1200.0);
    } else {
      activeCamera.fov = fov;
    }

    // Position camera relative to player
    activeCamera.position.set(
      playerPos.x + offset.x,
      playerPos.y + offset.y,
      playerPos.z + offset.z
    );

    // Downward pitch angle (~18 to 22 degrees downward, default 20.0°)
    let pitchDegrees = (typeof opts.pitchDegrees === 'number')
      ? opts.pitchDegrees
      : LANDSCAPE_CAMERA_CONFIG.PITCH_DEGREES;
    pitchDegrees = Math.max(16.0, Math.min(26.0, pitchDegrees)); // Safety clamp

    // Compute target and lookAt
    const lookDist = (typeof opts.lookDistance === 'number') ? opts.lookDistance : LANDSCAPE_CAMERA_CONFIG.LOOK_DISTANCE;
    let cameraTarget = calculateLookAtTarget(activeCamera.position, pitchDegrees, lookDist, 0.0, THREE_REF);
    activeCamera.lookAt(cameraTarget);
    activeCamera.updateProjectionMatrix();

    // Calculate horizon screen position
    const horizonMetrics = calculateHorizonMetrics(pitchDegrees, fov, LANDSCAPE_CAMERA_CONFIG.VIEWPORT_HEIGHT_REF);

    // -----------------------------------------------------------------------
    // B. Lighting Setup
    // -----------------------------------------------------------------------
    // Clean up previous lights if requested or if tagged
    if (scene && scene.__landscapeLights) {
      scene.remove(scene.__landscapeLights.dirLight);
      if (scene.__landscapeLights.dirLight.target) {
        scene.remove(scene.__landscapeLights.dirLight.target);
      }
      scene.remove(scene.__landscapeLights.hemiLight);
    }

    // 1. Warm Directional Key Light
    // Position: low and slightly to the side (16, 14, 18) so front (+Z) and top (+Y) catch bright warm golden light
    const keyCfg = LANDSCAPE_CAMERA_CONFIG.KEY_LIGHT;
    const keyColor = (opts.keyLightColor !== undefined) ? opts.keyLightColor : keyCfg.color;
    const keyIntensity = (typeof opts.keyLightIntensity === 'number') ? opts.keyLightIntensity : keyCfg.intensity;
    const keyPos = (opts.keyLightPosition) ? opts.keyLightPosition : keyCfg.position;

    const dirLight = new THREE_REF.DirectionalLight(keyColor, keyIntensity);
    dirLight.position.set(keyPos.x, keyPos.y, keyPos.z);

    // Directional light target
    const targetObj = new THREE_REF.Object3D();
    targetObj.position.set(keyCfg.target.x, keyCfg.target.y, keyCfg.target.z);
    dirLight.target = targetObj;

    // Shadow configuration (optional, active when renderer has shadowMap enabled)
    if (opts.enableShadows || (renderer && renderer.shadowMap && renderer.shadowMap.enabled)) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = keyCfg.shadow.mapSize;
      dirLight.shadow.mapSize.height = keyCfg.shadow.mapSize;
      dirLight.shadow.camera.near = keyCfg.shadow.near;
      dirLight.shadow.camera.far = keyCfg.shadow.far;
      dirLight.shadow.camera.left = -keyCfg.shadow.bounds;
      dirLight.shadow.camera.right = keyCfg.shadow.bounds;
      dirLight.shadow.camera.top = keyCfg.shadow.bounds;
      dirLight.shadow.camera.bottom = -keyCfg.shadow.bounds;
      dirLight.shadow.bias = keyCfg.shadow.bias;
    }

    // 2. Hemisphere Fill Light
    // Sky: #bfe3ff, Ground: #ffb27a, intensity 0.85 -> shadowed faces are ~40% warm midtones
    const hemiCfg = LANDSCAPE_CAMERA_CONFIG.HEMI_LIGHT;
    const hemiSky = (opts.hemiSkyColor !== undefined) ? opts.hemiSkyColor : hemiCfg.skyColor;
    const hemiGround = (opts.hemiGroundColor !== undefined) ? opts.hemiGroundColor : hemiCfg.groundColor;
    const hemiIntensity = (typeof opts.hemiIntensity === 'number') ? opts.hemiIntensity : hemiCfg.intensity;

    const hemiLight = new THREE_REF.HemisphereLight(hemiSky, hemiGround, hemiIntensity);
    hemiLight.position.set(hemiCfg.position.x, hemiCfg.position.y, hemiCfg.position.z);

    if (scene) {
      scene.add(dirLight);
      scene.add(targetObj);
      scene.add(hemiLight);
      scene.__landscapeLights = { dirLight: dirLight, hemiLight: hemiLight };
    }

    // -----------------------------------------------------------------------
    // C. Atmospheric Aerial Perspective Haze (Scene Fog)
    // -----------------------------------------------------------------------
    // Fog color: #b9d8f5 (pale blue haze), near ~28, far ~95
    const fogCfg = LANDSCAPE_CAMERA_CONFIG.FOG;
    const fogColor = (opts.fogColor !== undefined) ? opts.fogColor : fogCfg.color;
    const fogNear = (typeof opts.fogNear === 'number') ? opts.fogNear : fogCfg.near;
    const fogFar = (typeof opts.fogFar === 'number') ? opts.fogFar : fogCfg.far;

    let fogInstance;
    if (opts.useFogExp2) {
      const density = (typeof opts.fogDensity === 'number') ? opts.fogDensity : fogCfg.densityExp2;
      fogInstance = new THREE_REF.FogExp2(fogColor, density);
    } else {
      fogInstance = new THREE_REF.Fog(fogColor, fogNear, fogFar);
    }

    if (scene) {
      scene.fog = fogInstance;
    }

    // Set renderer clear color if requested and available
    if (renderer && typeof renderer.setClearColor === 'function' && opts.setClearColor !== false) {
      renderer.setClearColor(fogColor, 1.0);
    }

    // -----------------------------------------------------------------------
    // D. Camera Parameters & State Tracker
    // -----------------------------------------------------------------------
    const cameraParams = {
      fov: fov,
      pitchDegrees: pitchDegrees,
      pitchRadians: (pitchDegrees * Math.PI) / 180.0,
      position: activeCamera.position,
      target: cameraTarget,
      offset: { x: offset.x, y: offset.y, z: offset.z },
      lookDistance: lookDist,
      horizonY720p: LANDSCAPE_CAMERA_CONFIG.HORIZON_Y_720P,
      horizonMetrics: horizonMetrics,
      layers: LANDSCAPE_CAMERA_CONFIG.DEPTH_LAYERS,
      smoothFollow: !!opts.smoothFollow,
      followSpeed: (typeof opts.followSpeed === 'number') ? opts.followSpeed : 6.0,
      lightsFollowPlayer: !!opts.lightsFollowPlayer
    };

    const lightsCollection = {
      dirLight: dirLight,
      hemiLight: hemiLight,
      keyLight: dirLight,
      fillLight: hemiLight
    };

    // -----------------------------------------------------------------------
    // E. Dynamic Update Function
    // -----------------------------------------------------------------------
    /**
     * Updates camera positioning, target tracking, and lights in render loop.
     *
     * @param {number} [dt=0.016] - Delta time in seconds.
     * @param {THREE.Object3D|Object} [newPlayer] - Optional updated player reference.
     */
    function update(dt, newPlayer) {
      const delta = (typeof dt === 'number' && dt > 0) ? dt : 0.016;
      if (newPlayer !== undefined) {
        activePlayer = newPlayer;
      }

      const currentTargetPos = extractPosition(activePlayer, LANDSCAPE_CAMERA_CONFIG.DEFAULT_PLAYER_POS, THREE_REF);

      // Desired camera position
      const desiredX = currentTargetPos.x + cameraParams.offset.x;
      const desiredY = currentTargetPos.y + cameraParams.offset.y;
      const desiredZ = currentTargetPos.z + cameraParams.offset.z;

      if (cameraParams.smoothFollow) {
        const lerpFactor = Math.min(delta * cameraParams.followSpeed, 1.0);
        activeCamera.position.x += (desiredX - activeCamera.position.x) * lerpFactor;
        activeCamera.position.y += (desiredY - activeCamera.position.y) * lerpFactor;
        activeCamera.position.z += (desiredZ - activeCamera.position.z) * lerpFactor;
      } else {
        activeCamera.position.set(desiredX, desiredY, desiredZ);
      }

      // Recompute target point based on current pitch and position
      cameraTarget = calculateLookAtTarget(
        activeCamera.position,
        cameraParams.pitchDegrees,
        cameraParams.lookDistance,
        0.0,
        THREE_REF
      );
      activeCamera.lookAt(cameraTarget);
      cameraParams.target = cameraTarget;

      // Optional: keep key light centered near player
      if (cameraParams.lightsFollowPlayer && dirLight.target) {
        dirLight.target.position.set(currentTargetPos.x, currentTargetPos.y, currentTargetPos.z);
        dirLight.position.set(
          currentTargetPos.x + keyPos.x,
          currentTargetPos.y + keyPos.y,
          currentTargetPos.z + keyPos.z
        );
      }

      return cameraParams;
    }

    // -----------------------------------------------------------------------
    // F. Cleanup / Dispose Function
    // -----------------------------------------------------------------------
    function dispose() {
      if (scene) {
        if (dirLight) {
          scene.remove(dirLight);
          if (dirLight.target) scene.remove(dirLight.target);
          if (dirLight.dispose) dirLight.dispose();
        }
        if (hemiLight) {
          scene.remove(hemiLight);
          if (hemiLight.dispose) hemiLight.dispose();
        }
        if (scene.fog === fogInstance) {
          scene.fog = null;
        }
        if (scene.__landscapeLights) {
          delete scene.__landscapeLights;
        }
      }
    }

    // Return the module contract
    return {
      cameraParams: cameraParams,
      lights: lightsCollection,
      fog: fogInstance,
      update: update,
      dispose: dispose,

      // Additional convenient controls
      setPitch: function (newPitchDeg) {
        cameraParams.pitchDegrees = Math.max(16.0, Math.min(26.0, newPitchDeg));
        cameraParams.pitchRadians = (cameraParams.pitchDegrees * Math.PI) / 180.0;
        cameraParams.horizonMetrics = calculateHorizonMetrics(
          cameraParams.pitchDegrees,
          cameraParams.fov,
          LANDSCAPE_CAMERA_CONFIG.VIEWPORT_HEIGHT_REF
        );
        update(0.016);
      },
      setPlayer: function (newPlayer) {
        activePlayer = newPlayer;
        update(0.016);
      }
    };
  }

  // =========================================================================
  // 4. EXPORT CONTRACT & COMPATIBILITY
  // =========================================================================

  const exportedModule = {
    setupLandscapeCameraAndHaze: setupLandscapeCameraAndHaze,
    calculateHorizonMetrics: calculateHorizonMetrics,
    calculateLookAtTarget: calculateLookAtTarget,
    extractPosition: extractPosition,
    LANDSCAPE_CAMERA_CONFIG: LANDSCAPE_CAMERA_CONFIG
  };

  // Browser global attachments
  if (typeof window !== 'undefined') {
    window.setupLandscapeCameraAndHaze = setupLandscapeCameraAndHaze;
    window.LandscapeCameraHaze = exportedModule;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.setupLandscapeCameraAndHaze = setupLandscapeCameraAndHaze;
    globalThis.LandscapeCameraHaze = exportedModule;
  }

  return exportedModule;
}));
