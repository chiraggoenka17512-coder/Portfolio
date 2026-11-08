import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update title and console version
html = re.sub(
    r'<title>.*?</title>',
    '<title>Minecraft Portfolio - Daytime Landscape</title>',
    html
)
html = html.replace(
    '[VERSION] v3.3-sunset-calibrated-sky-active',
    '[VERSION] v4.0-daytime-calibrated-sky-active'
)

# 2. Update CSS for 20% saturation lift and 15% midtone contrast, and subtle daytime vignette
css_needle = """    #canvas-container canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Cinematic Vignette Overlay */
    #vignette {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      background: radial-gradient(ellipse at center, transparent 60%, rgba(14, 20, 32, 0.40) 100%);
    }"""

css_replace = """    #canvas-container canvas {
      display: block;
      width: 100%;
      height: 100%;
      filter: saturate(1.20) contrast(1.15);
    }

    /* Soft Daytime Vignette Overlay */
    #vignette {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      background: radial-gradient(ellipse at center, transparent 75%, rgba(20, 45, 80, 0.16) 100%);
    }"""

if css_needle in html:
    html = html.replace(css_needle, css_replace)
    print("Updated CSS filter and vignette")
else:
    print("Warning: css_needle not found directly")

# 3. Update window.__game cinematic state
cinematic_needle = """      cinematic: {
        introPlaying: true,
        cameraY: 7.5,
        fov: 60,
        pitchDegrees: 20.0,
        textureMode: 'pixel_art_16x16',
        faceLuminance: { top: 1.0, side: 0.75, bottom: 0.45 }
      },"""

cinematic_replace = """      cinematic: {
        introPlaying: false,
        cameraY: 7.2,
        fov: 60,
        pitchDegrees: 20.0,
        textureMode: 'pixel_art_16x16',
        faceLuminance: { top: 1.05, side: 0.78, shadow: 0.60, bottom: 0.38 }
      },"""

if cinematic_needle in html:
    html = html.replace(cinematic_needle, cinematic_replace)
    print("Updated window.__game cinematic state")
else:
    print("Warning: cinematic_needle not found directly")

# 4. Update scene background, fog, and lights
lights_needle = """    // scene.background MUST be null so the custom sky dome shader renders
    scene.background = null;
    // Atmospheric fog sampled from the warm red-orange sunset horizon band (#d9411e)
    scene.fog = new THREE.Fog(0xd9411e, 25, 95);

    // camera.far set to 1200 (well over 2x the 450 dome radius)
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Warm directional sun light (#ff9e42, intensity 1.25) aligned with the low sun
    const dirLight = new THREE.DirectionalLight(0xff9e42, 1.25);
    dirLight.position.set(-18, 6, -38);
    scene.add(dirLight);

    // Hemisphere light: cool twilight blue above (#4b6584), warm earth bounce below (#4a1e0d)
    const hemiLight = new THREE.HemisphereLight(0x4b6584, 0x4a1e0d, 0.55);
    scene.add(hemiLight);"""

lights_replace = """    // scene.background MUST be null so the custom sky dome shader renders
    scene.background = null;
    // Atmospheric daytime fog matching the horizon blue (#9cc9f0) with reduced density
    scene.fog = new THREE.Fog(0x9cc9f0, 48, 140);

    // camera.far set to 1200 (well over 2x the 450 dome radius)
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x9cc9f0, 1.0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // Neutral-warm key light (close to #fff4e0)
    const dirLight = new THREE.DirectionalLight(0xfff4e0, 1.35);
    dirLight.position.set(20, 32, 16);
    scene.add(dirLight);

    // Cool blue hemisphere fill from sky (#9cc9f0) with warm grass bounce (#6e8a52)
    const hemiLight = new THREE.HemisphereLight(0x9cc9f0, 0x6e8a52, 0.75);
    scene.add(hemiLight);"""

if lights_needle in html:
    html = html.replace(lights_needle, lights_replace)
    print("Updated scene fog and daytime lights")
else:
    print("Warning: lights_needle not found directly")

# 5. Replace Sky Dome and Voxel Clouds with Daytime Sky Dome & Stacked Slab Clouds
sky_start = "    // Sunset Sky Dome (Inverted Sphere radius 450 with Custom ShaderMaterial)"
sky_end = "    // 5. Procedural 16x16 Textures with Hand-Painted Organic Feel"

idx1 = html.find(sky_start)
idx2 = html.find(sky_end)

if idx1 != -1 and idx2 != -1:
    daytime_sky_section = """    // Daytime Sky Dome (Inverted Sphere radius 450 with Custom ShaderMaterial)
    // Gradient: mid blue at top (#3f8fdc) to lighter blue at horizon (#9cc9f0). Saturated, not pale.
    // Simple bright sun disc in the upper sky with a small soft edge and no wide glow.
    const skyGeo = new THREE.SphereGeometry(450, 32, 16);
    // Sun placed in upper sky in forward view direction (elevation ~8 deg, azimuth ~14 deg)
    const sunAzimuth = 14.0 * Math.PI / 180.0;
    const sunElevation = 8.0 * Math.PI / 180.0;
    const sunDirVec = new THREE.Vector3(
      Math.sin(sunAzimuth) * Math.cos(sunElevation),
      Math.sin(sunElevation),
      -Math.cos(sunAzimuth) * Math.cos(sunElevation)
    ).normalize();

    const skyUniforms = {
      uTime: { value: 0.0 },
      uSunDirection: { value: sunDirVec }
    };

    const skyVertexShader = `
      varying vec3 vViewDir;

      void main() {
        vViewDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const skyFragmentShader = `
      precision highp float;

      uniform float uTime;
      uniform vec3 uSunDirection;

      varying vec3 vViewDir;

      // Daytime palette: mid blue at top (#3f8fdc), lighter saturated blue at horizon (#9cc9f0)
      const vec3 cSkyTop     = vec3(0.247, 0.561, 0.863); // #3f8fdc (hue ~208 deg, sat ~71%)
      const vec3 cSkyHorizon = vec3(0.612, 0.788, 0.941); // #9cc9f0 (hue ~208 deg, sat ~35%)
      const vec3 cSkyNadir   = vec3(0.550, 0.735, 0.900); // nadir base blend

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec3 dir = normalize(vViewDir);

        // 1. Elevation gradient
        float t = clamp(dir.y * 2.2, 0.0, 1.0);
        t = pow(t, 0.85);

        vec3 skyColor;
        if (dir.y >= 0.0) {
          skyColor = mix(cSkyHorizon, cSkyTop, t);
        } else {
          float tb = clamp(-dir.y * 2.0, 0.0, 1.0);
          skyColor = mix(cSkyHorizon, cSkyNadir, tb);
        }

        // 2. Simple bright sun disc in the upper sky with a small soft edge and NO wide glow
        vec3 sunDir = normalize(uSunDirection);
        float cosTheta = dot(dir, sunDir);
        // Sun disc: angular radius ~2.8 degrees with small soft edge
        float sunDisc = smoothstep(0.9982, 0.9994, cosTheta);
        vec3 sunDiscColor = vec3(1.0, 1.0, 0.96) * 1.6;
        skyColor = mix(skyColor, sunDiscColor, sunDisc);

        // 3. Triangular dithering noise (1%) to eliminate banding
        float dither = (hash(gl_FragCoord.xy) - 0.5) * (1.2 / 255.0);
        skyColor += vec3(dither);

        gl_FragColor = vec4(clamp(skyColor, 0.0, 1.0), 1.0);
      }
    `;

    const skyMat = new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
      toneMapped: false // Tone mapping disabled so the blues stay true
    });

    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.renderOrder = -1000;
    skyMesh.frustumCulled = false;
    scene.add(skyMesh);

    // Drifting Voxel Clouds: Stacked slabs with pure white tops and slightly darker light-grey undersides
    const cloudsGroup = new THREE.Group();
    const cloudTopMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    });
    const cloudBottomMat = new THREE.MeshLambertMaterial({
      color: 0xd6e2ee,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    });

    const cloudPuffs = [];
    const cloudSpecs = [
      { x: -50, y: 32, z: -35, w: 18, h: 1.0, d: 8 },
      { x: -15, y: 34, z: -18, w: 22, h: 1.0, d: 10 },
      { x: 25,  y: 33, z: -40, w: 20, h: 1.0, d: 9 },
      { x: 55,  y: 35, z: -15, w: 24, h: 1.0, d: 11 },
      { x: -28, y: 31, z: 25,  w: 16, h: 1.0, d: 8 },
      { x: 30,  y: 32, z: 30,  w: 18, h: 1.0, d: 9 }
    ];

    for (let i = 0; i < cloudSpecs.length; i++) {
      const s = cloudSpecs[i];
      const cg = new THREE.Group();

      // Lower slab: slightly darker light-grey underside
      const botMesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.h, s.d), cloudBottomMat);
      botMesh.position.set(0, -s.h * 0.5, 0);
      cg.add(botMesh);

      // Upper slab: pure white top stepped in
      const topMesh = new THREE.Mesh(new THREE.BoxGeometry(s.w * 0.72, s.h, s.d * 0.72), cloudTopMat);
      topMesh.position.set((i % 2 === 0 ? 1 : -1) * (s.w * 0.08), s.h * 0.5, (i % 3 === 0 ? 1 : -1) * (s.d * 0.08));
      cg.add(topMesh);

      cg.position.set(s.x, s.y, s.z);
      cloudsGroup.add(cg);
      cloudPuffs.push(cg);
    }
    scene.add(cloudsGroup);

"""
    html = html[:idx1] + daytime_sky_section + html[idx2:]
    print("Replaced sky dome with daytime shader and stacked slab clouds")
else:
    print(f"Warning: could not find sky indices: {idx1}, {idx2}")

# 6. Update camera follow logic: start directly at spawn vantage point without intro delay
cam_needle = """    // Camera follow and orbit parameters
    let isIntro = true;
    const introDuration = 2.5;
    let introElapsed = 0.0;"""

cam_replace = """    // Camera follow and orbit parameters
    let isIntro = false; // Immediately at spawn framing
    const introDuration = 0.0;
    let introElapsed = 0.0;"""

if cam_needle in html:
    html = html.replace(cam_needle, cam_replace)
    print("Updated isIntro to false")
else:
    print("Warning: cam_needle not found directly")

# 7. Update initial camera position coordinates
intro_coords_needle = """    // 8. Intro Cinematic & Smooth Follow Camera
    const introStartPos = new THREE.Vector3(0, 18.0, 24.0);
    const introStartLook = new THREE.Vector3(0, 0.5, 0.0);

    const currentCamPos = new THREE.Vector3().copy(introStartPos);
    const currentLookAt = new THREE.Vector3().copy(introStartLook);
    const desiredCamPos = new THREE.Vector3().copy(introStartPos);
    const desiredLookAt = new THREE.Vector3().copy(introStartLook);"""

intro_coords_replace = """    // 8. Natural Landscape Spawn View Camera
    const introStartPos = new THREE.Vector3(0, 7.2, 17.5);
    const introStartLook = new THREE.Vector3(0, 3.35, 8.0);

    const currentCamPos = new THREE.Vector3().copy(introStartPos);
    const currentLookAt = new THREE.Vector3().copy(introStartLook);
    const desiredCamPos = new THREE.Vector3().copy(introStartPos);
    const desiredLookAt = new THREE.Vector3().copy(introStartLook);"""

if intro_coords_needle in html:
    html = html.replace(intro_coords_needle, intro_coords_replace)
    print("Updated initial camera coordinates")
else:
    print("Warning: intro_coords_needle not found directly")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("index.html daytime conversion completed.")
