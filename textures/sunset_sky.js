/**
 * sunset_sky.js - Atmospheric Sunset Sky Dome Module for Three.js
 *
 * Implements a physically-inspired sunset sky dome using THREE.ShaderMaterial
 * on a large inverted SphereGeometry(450, 32, 16).
 *
 * Features:
 *  - Non-linear elevation gradient:
 *      * Horizon (0° to 5°): Hot red-orange band (#d9411e to #e65c00)
 *      * Mid-low (5° to 18°): Warm yellow glow fading to pale amber (#f7b733 to #fceabb)
 *      * Mid-high (18° to 45°): Cooler transition through muted rose (#b06ab3) and dusty blue (#4b6584)
 *      * Zenith (> 45°): Deep atmospheric blue (#192a56)
 *  - Low Sun (default dir: normalize(-0.4, 0.12, -0.9)):
 *      * Tight brilliant core disc
 *      * Wide angular Mie scattering glow falling off with angle (dot(viewDir, sunDir))
 *      * Horizon azimuth scattering expansion
 *  - Procedural Drifting Clouds:
 *      * Thin horizontal streaks near horizon (~12:1 stretch ratio)
 *      * Lit from below: warm orange/pink undersides, dim cool dusky tops
 *      * Solar rim highlights and silver-gold edges
 *      * Drifts slowly in animation loop via uniform float uTime
 *  - Screen-Space Dithering:
 *      * Subtle ~1.5/255 (0.6% - 1.2%) noise to eliminate 8-bit color banding
 *
 * Exports:
 *  - createSunsetSky(scene, camera, options)
 *  - updateSky(dt, camera)
 */

// Helper to resolve THREE from global, caller, or environment
function resolveThree(customThree) {
  if (customThree && customThree.SphereGeometry) return customThree;
  if (typeof THREE !== 'undefined' && THREE.SphereGeometry) return THREE;
  if (typeof window !== 'undefined' && window.THREE && window.THREE.SphereGeometry) return window.THREE;
  if (typeof globalThis !== 'undefined' && globalThis.THREE && globalThis.THREE.SphereGeometry) return globalThis.THREE;
  try {
    const reqThree = require('three');
    if (reqThree && reqThree.SphereGeometry) return reqThree;
  } catch (_) {}
  return null;
}

// Vertex Shader
export const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    // Local sphere position directly represents direction vector from sphere center
    vViewDir = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Fragment Shader
export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uSunDirection;
  uniform vec3 uCameraPosition;
  uniform float uCloudSpeed;
  uniform float uCloudDensity;
  uniform float uSunIntensity;
  uniform float uHorizonIntensity;

  varying vec3 vWorldPosition;
  varying vec3 vViewDir;

  // --- Procedural Hash and Noise Functions ---
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // 4-octave fractal Brownian motion for organic cloud streaks
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.52;
    for (int i = 0; i < 4; i++) {
      total += vnoise(p) * amp;
      p = p * vec2(2.05, 1.95) + vec2(1.7, 3.4);
      amp *= 0.48;
    }
    return total;
  }

  // --- Non-linear Elevation Color Stops ---
  //  Horizon (0° to 5°): hot red-orange band (#d9411e to #e65c00)
  //  Mid-low (5° to 18°): warm yellow glow fading to pale amber (#f7b733 to #fceabb)
  //  Mid-high (18° to 45°): cooler transition through muted rose (#b06ab3) and dusty blue (#4b6584)
  //  Zenith (> 45°): deep atmospheric blue (#192a56)
  vec3 getSkyGradient(float elevDeg) {
    vec3 cNadir         = vec3(0.094, 0.035, 0.024); // #180906 deep twilight nadir
    vec3 cHorizonHot    = vec3(0.851, 0.255, 0.118); // #d9411e (0 deg)
    vec3 cHorizonOrange = vec3(0.902, 0.361, 0.000); // #e65c00 (5 deg)
    vec3 cWarmYellow    = vec3(0.969, 0.718, 0.200); // #f7b733 (11 deg)
    vec3 cPaleAmber     = vec3(0.988, 0.918, 0.733); // #fceabb (18 deg)
    vec3 cMutedRose     = vec3(0.690, 0.416, 0.702); // #b06ab3 (30 deg)
    vec3 cDustyBlue     = vec3(0.294, 0.396, 0.518); // #4b6584 (45 deg)
    vec3 cZenithBlue    = vec3(0.098, 0.165, 0.337); // #192a56 (>45-90 deg)

    if (elevDeg < 0.0) {
      float t = clamp(-elevDeg / 20.0, 0.0, 1.0);
      return mix(cHorizonHot, cNadir, smoothstep(0.0, 1.0, t));
    } else if (elevDeg < 5.0) {
      float t = elevDeg / 5.0;
      return mix(cHorizonHot, cHorizonOrange, smoothstep(0.0, 1.0, t));
    } else if (elevDeg < 11.0) {
      float t = (elevDeg - 5.0) / 6.0;
      return mix(cHorizonOrange, cWarmYellow, smoothstep(0.0, 1.0, t));
    } else if (elevDeg < 18.0) {
      float t = (elevDeg - 11.0) / 7.0;
      return mix(cWarmYellow, cPaleAmber, smoothstep(0.0, 1.0, t));
    } else if (elevDeg < 30.0) {
      float t = (elevDeg - 18.0) / 12.0;
      return mix(cPaleAmber, cMutedRose, smoothstep(0.0, 1.0, t));
    } else if (elevDeg < 45.0) {
      float t = (elevDeg - 30.0) / 15.0;
      return mix(cMutedRose, cDustyBlue, smoothstep(0.0, 1.0, t));
    } else {
      float t = clamp((elevDeg - 45.0) / 35.0, 0.0, 1.0);
      return mix(cDustyBlue, cZenithBlue, smoothstep(0.0, 1.0, t));
    }
  }

  void main() {
    // Normalised view direction and sun direction
    vec3 dir = normalize(vViewDir);
    vec3 sunDir = normalize(uSunDirection);

    // Elevation angle in degrees (-90 to +90)
    float elevDeg = degrees(asin(clamp(dir.y, -1.0, 1.0)));

    // 1. Base Atmospheric Elevation Gradient
    vec3 skyColor = getSkyGradient(elevDeg) * uHorizonIntensity;

    // 2. Low Sun Calculation
    float cosTheta = dot(dir, sunDir);
    float maxCos = max(0.0, cosTheta);

    // Tight bright core disc
    float sunDisc = smoothstep(0.99935, 0.99985, cosTheta);
    vec3 sunCoreColor = vec3(1.0, 0.97, 0.90) * 3.2;

    // Intense solar corona
    float sunCorona = pow(maxCos, 320.0) * 1.6 + pow(maxCos, 80.0) * 0.75;
    vec3 sunCoronaColor = vec3(1.0, 0.72, 0.28);

    // Wide angular glow (Mie scatter falloff)
    float wideGlow1 = pow(maxCos, 12.0) * 0.65;
    float wideGlow2 = pow(maxCos, 3.2) * 0.35;
    vec3 wideGlowColor = mix(vec3(0.95, 0.35, 0.12), vec3(1.0, 0.72, 0.25), pow(maxCos, 8.0));

    // Horizon azimuth scatter (Mie twilight expansion along the horizon)
    float horizonBand = exp(-max(0.0, dir.y) * 4.2);
    vec2 dirH = normalize(vec2(dir.x, dir.z));
    vec2 sunH = normalize(vec2(sunDir.x, sunDir.z));
    float hCos = max(0.0, dot(dirH, sunH));
    float horizonGlow = pow(hCos, 3.5) * horizonBand * 0.40;
    vec3 horizonGlowCol = vec3(0.98, 0.42, 0.12);

    vec3 totalSun = (sunCoreColor * sunDisc +
                     sunCoronaColor * sunCorona +
                     wideGlowColor * (wideGlow1 + wideGlow2) +
                     horizonGlowCol * horizonGlow) * uSunIntensity;
    skyColor += totalSun;

    // 3. Clouds: Thin horizontal streaks near horizon, drifting, lit from below
    // Envelope: active between ~2° (0.025) and ~24° (0.42)
    float cloudMask = smoothstep(0.025, 0.08, dir.y) * smoothstep(0.42, 0.18, dir.y);
    if (cloudMask > 0.001) {
      float azimuth = atan(dir.z, dir.x);
      // Stretched horizontal coordinate (azimuth * 3.2 vs dir.y * 38.0 -> ~12x horizontal stretch)
      vec2 cloudUv = vec2(azimuth * 3.2 + uTime * uCloudSpeed, dir.y * 38.0);

      float n = fbm(cloudUv);
      // Sample slightly higher to detect underside vs topside of streaks
      float nAbove = fbm(cloudUv + vec2(0.0, 0.45));
      float verticalSlope = n - nAbove; // Positive on bottom edges

      // Lit from below: warm orange/pink undersides, dim cool tops
      float underLit = clamp(verticalSlope * 3.0 + 0.45, 0.0, 1.0);

      // Underside color: glowing orange/pink/coral, saturated near the sun
      vec3 undersideColor = mix(vec3(0.96, 0.36, 0.45), vec3(0.98, 0.48, 0.20), pow(maxCos, 2.5));
      // Add brilliant warm gold when directly facing sun
      undersideColor = mix(undersideColor, vec3(1.0, 0.72, 0.32), pow(maxCos, 6.0));

      // Dim cool tops: dusky twilight slate
      vec3 topsideColor = vec3(0.18, 0.19, 0.30) * 0.75;

      vec3 cloudColor = mix(topsideColor, undersideColor, underLit);

      // Edge silver/golden rim lighting near sun
      float rimLight = pow(maxCos, 10.0) * smoothstep(0.38, 0.54, n) * (1.0 - smoothstep(0.54, 0.72, n));
      cloudColor += vec3(1.0, 0.88, 0.55) * rimLight * 1.4;

      // Cloud density threshold
      float density = smoothstep(0.46, 0.68, n) * cloudMask * uCloudDensity;
      skyColor = mix(skyColor, cloudColor, clamp(density, 0.0, 0.95));
    }

    // 4. Subtle Dithering (1-2% high-frequency screen-space noise prevents 8-bit banding)
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (1.5 / 255.0);
    skyColor += vec3(dither);

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

// Active sky instance cache for module-level updateSky()
let _activeSky = null;

/**
 * Creates a sunset sky dome and adds it to the scene.
 *
 * @param {THREE.Scene} [scene] - The Three.js scene to add the sky mesh to.
 * @param {THREE.Camera} [camera] - The active camera used to position the dome.
 * @param {Object} [options] - Configuration overrides.
 * @param {THREE.Vector3} [options.sunDirection] - Direction toward the sun (defaults to normalize(-0.4, 0.12, -0.9)).
 * @param {number} [options.radius=450] - Radius of the sky dome sphere geometry.
 * @param {number} [options.cloudSpeed=0.015] - Drift speed of the horizon clouds.
 * @param {number} [options.cloudDensity=0.88] - Opacity / thickness of the clouds.
 * @param {number} [options.sunIntensity=1.0] - Brightness multiplier for the sun disc and glow.
 * @param {number} [options.horizonIntensity=1.0] - Intensity multiplier for the background gradient.
 * @param {Object} [options.three] - Explicit THREE instance (optional).
 * @returns {Object} Sky handle containing mesh, material, uniforms, and helper methods.
 */
export function createSunsetSky(scene, camera, options = {}) {
  const THREE = resolveThree(options.three);
  if (!THREE) {
    throw new Error('[sunset_sky] Three.js not found. Pass options.three or ensure THREE is globally loaded.');
  }

  const radius = options.radius !== undefined ? options.radius : 450;
  const widthSegments = options.widthSegments !== undefined ? options.widthSegments : 32;
  const heightSegments = options.heightSegments !== undefined ? options.heightSegments : 16;

  // Default sun position: low near horizon (normalize(vec3(-0.4, 0.12, -0.9)))
  const rawSunDir = options.sunDirection || new THREE.Vector3(-0.4, 0.12, -0.9);
  const sunDir = rawSunDir.clone().normalize();

  // 1. Inverted sphere geometry: SphereGeometry(450, 32, 16)
  const skyGeo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

  // Uniforms definition
  const uniforms = {
    uTime: { value: 0.0 },
    uSunDirection: { value: sunDir },
    uCameraPosition: { value: new THREE.Vector3() },
    uCloudSpeed: { value: options.cloudSpeed !== undefined ? options.cloudSpeed : 0.015 },
    uCloudDensity: { value: options.cloudDensity !== undefined ? options.cloudDensity : 0.88 },
    uSunIntensity: { value: options.sunIntensity !== undefined ? options.sunIntensity : 1.0 },
    uHorizonIntensity: { value: options.horizonIntensity !== undefined ? options.horizonIntensity : 1.0 }
  };

  // 2. Custom ShaderMaterial with side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false
  const skyMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false
  });

  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  // Explicit render order: -1000 so sky renders as backdrop behind all world geometry
  skyMesh.renderOrder = -1000;
  skyMesh.frustumCulled = false;

  if (camera && camera.position) {
    skyMesh.position.copy(camera.position);
    uniforms.uCameraPosition.value.copy(camera.position);
  }

  if (scene && typeof scene.add === 'function') {
    scene.add(skyMesh);
  }

  const skyInstance = {
    mesh: skyMesh,
    material: skyMat,
    geometry: skyGeo,
    uniforms: uniforms,
    sunDirection: sunDir,
    camera: camera || null,
    scene: scene || null,

    /**
     * Updates the sky dome animation and matches camera position.
     * @param {number} [dt=0.016] Delta time in seconds.
     * @param {THREE.Camera} [cam] Camera override.
     */
    update: function (dt, cam) {
      const delta = (typeof dt === 'number' && !isNaN(dt)) ? dt : 0.016;
      uniforms.uTime.value += delta;

      const targetCam = cam || this.camera;
      if (targetCam && targetCam.position) {
        skyMesh.position.copy(targetCam.position);
        uniforms.uCameraPosition.value.copy(targetCam.position);
      }
    },

    /**
     * Updates the sun direction vector.
     * @param {THREE.Vector3|{x: number, y: number, z: number}} dir
     */
    setSunDirection: function (dir) {
      if (dir && typeof dir.x === 'number') {
        sunDir.set(dir.x, dir.y, dir.z).normalize();
        uniforms.uSunDirection.value.copy(sunDir);
      }
    },

    /**
     * Disposes geometry and material to prevent GPU leaks.
     */
    dispose: function () {
      if (this.scene && this.mesh) {
        this.scene.remove(this.mesh);
      }
      if (this.geometry) this.geometry.dispose();
      if (this.material) this.material.dispose();
      if (_activeSky === this) _activeSky = null;
    }
  };

  _activeSky = skyInstance;
  return skyInstance;
}

/**
 * Module-level update function.
 * Updates the active sky dome's time uniform and aligns it with the camera.
 *
 * @param {number} [dt=0.016] - Delta time in seconds.
 * @param {THREE.Camera} [camera] - The active camera.
 */
export function updateSky(dt, camera) {
  if (_activeSky) {
    _activeSky.update(dt, camera);
  }
}

// Global browser window attachment for non-module script compatibility
if (typeof window !== 'undefined') {
  window.SunsetSky = {
    createSunsetSky,
    updateSky,
    vertexShader,
    fragmentShader
  };
  window.createSunsetSky = createSunsetSky;
  window.updateSky = updateSky;
}

export default {
  createSunsetSky,
  updateSky,
  vertexShader,
  fragmentShader
};
