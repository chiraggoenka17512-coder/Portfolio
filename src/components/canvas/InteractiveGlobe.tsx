import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

// Converting Lat/Long to 3D Cartesian Coordinates on a Sphere
export function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Procedural Fibonacci Sphere Points Generation
export const createFibonacciSphere = (samples: number, radius: number): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // Golden angle
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
};

// Procedural Circular Ring Curve Points
const createRingPoints = (radius: number, segments = 120): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  return pts;
};

// Geographic coordinates
const KOLKATA = { lat: 22.5726, lon: 88.3639, name: 'Kolkata, IN' };
const GLOBAL_HUBS = [
  { lat: 37.7749, lon: -122.4194, name: 'San Francisco' },
  { lat: 51.5074, lon: -0.1278, name: 'London' },
  { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
];

// Test WebGL capability on offscreen canvas
const isWebGLAvailable = (): boolean => {
  try {
    const testCanvas = document.createElement('canvas');
    const gl =
      testCanvas.getContext('webgl2') ||
      testCanvas.getContext('webgl') ||
      testCanvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
};

interface InteractiveGlobeProps {
  className?: string;
}

export const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderMode, setRenderMode] = useState<'webgl' | '2d'>(() =>
    isWebGLAvailable() ? 'webgl' : '2d'
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Momentum interaction ref
  const interactionRef = useRef({
    isPointerDown: false,
    prevX: 0,
    prevY: 0,
    velocityX: 0,
    velocityY: 0,
    rotationX: 0.22,
    rotationY: 0,
  });

  // Pointer event handlers with momentum & touch-action: pan-y
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    interactionRef.current.isPointerDown = true;
    interactionRef.current.prevX = e.clientX;
    interactionRef.current.prevY = e.clientY;
    interactionRef.current.velocityX = 0;
    interactionRef.current.velocityY = 0;
    setIsDragging(true);
    // Capture pointer for fluid drag tracking
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if unsupported
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactionRef.current.isPointerDown) return;
    const dx = e.clientX - interactionRef.current.prevX;
    const dy = e.clientY - interactionRef.current.prevY;
    interactionRef.current.prevX = e.clientX;
    interactionRef.current.prevY = e.clientY;

    // Apply immediate sensitivity
    interactionRef.current.velocityX = dx * 0.006;
    interactionRef.current.velocityY = dy * 0.006;
    interactionRef.current.rotationY += interactionRef.current.velocityX;
    interactionRef.current.rotationX = Math.max(
      -Math.PI * 0.35,
      Math.min(Math.PI * 0.35, interactionRef.current.rotationX + interactionRef.current.velocityY)
    );
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    interactionRef.current.isPointerDown = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    let isVisible = !document.hidden;
    let isInViewport = true;

    // Page visibility listener
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && isInViewport) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // IntersectionObserver to halt loop when hero is scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isInViewport = entry.isIntersecting;
        if (isInViewport && isVisible) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let lastTime = performance.now();
    const GLOBE_RADIUS = 2.45;

    // =========================================================================
    // 1. THREE.JS WEBGL RENDER MODE
    // =========================================================================
    if (renderMode === 'webgl') {
      try {
        const scene = new THREE.Scene();

        const initialWidth = container.clientWidth || 400;
        const initialHeight = container.clientHeight || 400;

        const camera = new THREE.PerspectiveCamera(42, initialWidth / initialHeight, 0.1, 100);
        camera.position.set(0, 0, 7.8);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });

        canvas.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault();
            console.warn('WebGL context lost, switching to 2D procedural canvas');
            setRenderMode('2d');
          },
          false
        );

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(initialWidth, initialHeight);

        // Root spatial globe group (controlled by drag & momentum)
        const globeGroup = new THREE.Group();
        globeGroup.rotation.x = interactionRef.current.rotationX;
        globeGroup.rotation.z = -0.08;
        scene.add(globeGroup);

        // A. Procedural Fibonacci Particle Sphere
        const SAMPLE_COUNT = 1200;
        const spherePoints = createFibonacciSphere(SAMPLE_COUNT, GLOBE_RADIUS);

        const pointPositions = new Float32Array(SAMPLE_COUNT * 3);
        const pointColors = new Float32Array(SAMPLE_COUNT * 3);

        const cyanColor = new THREE.Color('#00f2fe');
        const blueColor = new THREE.Color('#4facfe');
        const purpleColor = new THREE.Color('#8a2be2');
        const tempColor = new THREE.Color();

        spherePoints.forEach((pt, i) => {
          pointPositions[i * 3] = pt.x;
          pointPositions[i * 3 + 1] = pt.y;
          pointPositions[i * 3 + 2] = pt.z;

          const heightFactor = (pt.y / GLOBE_RADIUS + 1) * 0.5;
          if (heightFactor > 0.6) {
            tempColor.copy(cyanColor);
          } else if (heightFactor > 0.3) {
            tempColor.lerpColors(cyanColor, blueColor, (0.6 - heightFactor) / 0.3);
          } else {
            tempColor.lerpColors(blueColor, purpleColor, (0.3 - heightFactor) / 0.3);
          }

          pointColors[i * 3] = tempColor.r;
          pointColors[i * 3 + 1] = tempColor.g;
          pointColors[i * 3 + 2] = tempColor.b;
        });

        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
        pointsGeometry.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

        const pCanvas = document.createElement('canvas');
        pCanvas.width = 32;
        pCanvas.height = 32;
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) {
          const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.3, 'rgba(0, 242, 254, 0.9)');
          gradient.addColorStop(0.7, 'rgba(0, 242, 254, 0.25)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          pCtx.fillStyle = gradient;
          pCtx.fillRect(0, 0, 32, 32);
        }
        const particleTexture = new THREE.CanvasTexture(pCanvas);

        const pointsMaterial = new THREE.PointsMaterial({
          size: 0.08,
          vertexColors: true,
          map: particleTexture,
          transparent: true,
          opacity: 0.92,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const globePoints = new THREE.Points(pointsGeometry, pointsMaterial);
        globeGroup.add(globePoints);

        // B. Inner Wireframe Core
        const coreGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 0.96, 20, 20);
        const coreMaterial = new THREE.MeshBasicMaterial({
          color: 0x312e81,
          wireframe: true,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
        });
        const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        globeGroup.add(coreMesh);

        // C. Kolkata Geo-Beacon (Latitude 22.57° N, Longitude 88.36° E)
        const kolkataVec = latLongToVector3(KOLKATA.lat, KOLKATA.lon, GLOBE_RADIUS);

        // Core Beacon Dot
        const beaconGeom = new THREE.SphereGeometry(0.065, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: 0x10b981, // Emerald beacon
          blending: THREE.AdditiveBlending,
        });
        const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
        beaconMesh.position.copy(kolkataVec);
        globeGroup.add(beaconMesh);

        // Pulsating Wave Ring at Kolkata
        const waveGeom = new THREE.RingGeometry(0.04, 0.16, 32);
        const waveMat = new THREE.MeshBasicMaterial({
          color: 0x00f2fe,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });
        const waveMesh = new THREE.Mesh(waveGeom, waveMat);
        waveMesh.position.copy(kolkataVec.clone().multiplyScalar(1.002));
        waveMesh.lookAt(kolkataVec.clone().multiplyScalar(2));
        globeGroup.add(waveMesh);

        // D. Connection Arcs to Global Tech Hubs
        const arcsGroup = new THREE.Group();
        globeGroup.add(arcsGroup);

        const connectionCurves: { curve: THREE.QuadraticBezierCurve3; pulseMesh: THREE.Mesh }[] = [];

        GLOBAL_HUBS.forEach((hub) => {
          const hubVec = latLongToVector3(hub.lat, hub.lon, GLOBE_RADIUS);

          // Hub endpoint node
          const hubNodeGeom = new THREE.SphereGeometry(0.04, 12, 12);
          const hubNodeMat = new THREE.MeshBasicMaterial({
            color: 0x4facfe,
            blending: THREE.AdditiveBlending,
          });
          const hubNode = new THREE.Mesh(hubNodeGeom, hubNodeMat);
          hubNode.position.copy(hubVec);
          arcsGroup.add(hubNode);

          // Quadratic Bezier Arc elevated above the sphere
          const midVec = kolkataVec.clone().add(hubVec).multiplyScalar(0.5);
          midVec.normalize().multiplyScalar(GLOBE_RADIUS * 1.34);

          const curve = new THREE.QuadraticBezierCurve3(kolkataVec, midVec, hubVec);
          const curvePts = curve.getPoints(50);
          const curveGeom = new THREE.BufferGeometry().setFromPoints(curvePts);
          const curveMat = new THREE.LineBasicMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending,
          });
          const curveLine = new THREE.Line(curveGeom, curveMat);
          arcsGroup.add(curveLine);

          // Animated Traveling Pulse along the Arc
          const pulseGeom = new THREE.SphereGeometry(0.045, 10, 10);
          const pulseMat = new THREE.MeshBasicMaterial({
            color: 0x00f2fe,
            blending: THREE.AdditiveBlending,
          });
          const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
          arcsGroup.add(pulseMesh);

          connectionCurves.push({ curve, pulseMesh });
        });

        // E. Orbital Trajectory Rings with Satellites
        const orbitGroup = new THREE.Group();
        scene.add(orbitGroup); // Independent ambient orbital group

        const orbit1Pts = createRingPoints(GLOBE_RADIUS * 1.34, 120);
        const orbit1Geom = new THREE.BufferGeometry().setFromPoints(orbit1Pts);
        const orbit1Mat = new THREE.LineBasicMaterial({
          color: 0x00f2fe,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
        });
        const orbit1Line = new THREE.Line(orbit1Geom, orbit1Mat);
        orbit1Line.rotation.x = Math.PI * 0.38;
        orbit1Line.rotation.y = Math.PI * 0.15;
        orbitGroup.add(orbit1Line);

        const sat1Geom = new THREE.SphereGeometry(0.065, 12, 12);
        const sat1Mat = new THREE.MeshBasicMaterial({
          color: 0x00f2fe,
          blending: THREE.AdditiveBlending,
        });
        const sat1Mesh = new THREE.Mesh(sat1Geom, sat1Mat);
        orbit1Line.add(sat1Mesh);

        const orbit2Pts = createRingPoints(GLOBE_RADIUS * 1.48, 120);
        const orbit2Geom = new THREE.BufferGeometry().setFromPoints(orbit2Pts);
        const orbit2Mat = new THREE.LineBasicMaterial({
          color: 0x8a2be2,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
        });
        const orbit2Line = new THREE.Line(orbit2Geom, orbit2Mat);
        orbit2Line.rotation.x = -Math.PI * 0.32;
        orbit2Line.rotation.y = -Math.PI * 0.2;
        orbitGroup.add(orbit2Line);

        const sat2Geom = new THREE.SphereGeometry(0.06, 12, 12);
        const sat2Mat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          blending: THREE.AdditiveBlending,
        });
        const sat2Mesh = new THREE.Mesh(sat2Geom, sat2Mat);
        orbit2Line.add(sat2Mesh);

        // F. Atmosphere Glow Ring Backdrop
        const haloGeom = new THREE.RingGeometry(GLOBE_RADIUS * 0.98, GLOBE_RADIUS * 1.5, 64);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x00f2fe,
          transparent: true,
          opacity: 0.05,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const haloMesh = new THREE.Mesh(haloGeom, haloMat);
        haloMesh.position.z = -0.5;
        scene.add(haloMesh);

        setIsLoaded(true);

        let orbitAngle1 = 0;
        let orbitAngle2 = Math.PI;

        const render = (time: number) => {
          if (!isVisible || !isInViewport) {
            animationFrameId = requestAnimationFrame(render);
            return;
          }

          const delta = (time - lastTime) * 0.001;
          lastTime = time;

          // Momentum & friction dampening
          if (!interactionRef.current.isPointerDown) {
            interactionRef.current.velocityX *= 0.95;
            interactionRef.current.velocityY *= 0.95;

            // Natural constant auto-rotation
            interactionRef.current.rotationY += delta * 0.16 + interactionRef.current.velocityX;
            interactionRef.current.rotationX = Math.max(
              -Math.PI * 0.35,
              Math.min(
                Math.PI * 0.35,
                interactionRef.current.rotationX + interactionRef.current.velocityY
              )
            );
          }

          globeGroup.rotation.y = interactionRef.current.rotationY;
          globeGroup.rotation.x = interactionRef.current.rotationX;

          // Sine oscillation for Kolkata beacon wave ring
          const wavePhase = (time * 0.003) % 1;
          const waveScale = 1 + wavePhase * 1.8;
          waveMesh.scale.set(waveScale, waveScale, 1);
          waveMat.opacity = Math.max(0, 0.85 * (1 - wavePhase));

          // Animate pulses along connection arcs
          connectionCurves.forEach((item, idx) => {
            const arcProgress = ((time * 0.0004 + idx * 0.33) % 1);
            const pt = item.curve.getPoint(arcProgress);
            item.pulseMesh.position.copy(pt);
          });

          // Orbit satellites
          orbitGroup.rotation.y += delta * 0.06;

          orbitAngle1 += delta * 0.85;
          sat1Mesh.position.x = Math.cos(orbitAngle1) * (GLOBE_RADIUS * 1.34);
          sat1Mesh.position.z = Math.sin(orbitAngle1) * (GLOBE_RADIUS * 1.34);

          orbitAngle2 -= delta * 0.65;
          sat2Mesh.position.x = Math.cos(orbitAngle2) * (GLOBE_RADIUS * 1.48);
          sat2Mesh.position.z = Math.sin(orbitAngle2) * (GLOBE_RADIUS * 1.48);

          renderer.render(scene, camera);
          animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              camera.aspect = width / height;
              camera.updateProjectionMatrix();
              renderer.setSize(width, height);
            }
          }
        });
        resizeObserver.observe(container);

        return () => {
          cancelAnimationFrame(animationFrameId);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          observer.disconnect();
          resizeObserver.disconnect();

          pointsGeometry.dispose();
          coreGeometry.dispose();
          beaconGeom.dispose();
          waveGeom.dispose();
          orbit1Geom.dispose();
          orbit2Geom.dispose();
          sat1Geom.dispose();
          sat2Geom.dispose();
          haloGeom.dispose();

          particleTexture.dispose();
          pointsMaterial.dispose();
          coreMaterial.dispose();
          beaconMat.dispose();
          waveMat.dispose();
          orbit1Mat.dispose();
          sat1Mat.dispose();
          orbit2Mat.dispose();
          sat2Mat.dispose();
          haloMat.dispose();

          renderer.dispose();
          renderer.forceContextLoss();
        };
      } catch (err) {
        console.warn('Three.js WebGL initialization failed, switching to 2D procedural canvas:', err);
        setRenderMode('2d');
        return;
      }
    }

    // =========================================================================
    // 2. PROCEDURAL 2D CANVAS ACCELERATION (PERFECT FALLBACK)
    // =========================================================================
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      width = container.clientWidth || 400;
      height = container.clientHeight || 400;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    const FIB_SAMPLES = 850;
    const spherePts = createFibonacciSphere(FIB_SAMPLES, 1);
    let orbitSat1 = 0;
    let orbitSat2 = Math.PI;

    setIsLoaded(true);

    const render2D = (time: number) => {
      if (!isVisible || !isInViewport) {
        animationFrameId = requestAnimationFrame(render2D);
        return;
      }

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      // Momentum friction
      if (!interactionRef.current.isPointerDown) {
        interactionRef.current.velocityX *= 0.95;
        interactionRef.current.velocityY *= 0.95;
        interactionRef.current.rotationY += delta * 0.22 + interactionRef.current.velocityX;
        interactionRef.current.rotationX = Math.max(
          -Math.PI * 0.35,
          Math.min(
            Math.PI * 0.35,
            interactionRef.current.rotationX + interactionRef.current.velocityY
          )
        );
      }

      orbitSat1 += delta * 0.9;
      orbitSat2 -= delta * 0.7;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.35;

      // Draw Atmospheric Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.7, cx, cy, baseRadius * 1.5);
      glowGrad.addColorStop(0, 'rgba(0, 242, 254, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(138, 43, 226, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw Orbital Ring 1
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.38);
      ctx.scale(1, 0.36);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.34, 0, Math.PI * 2);
      ctx.stroke();

      const sat1X = Math.cos(orbitSat1) * (baseRadius * 1.34);
      const sat1Y = Math.sin(orbitSat1) * (baseRadius * 1.34);
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sat1X, sat1Y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Orbital Ring 2
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.35);
      ctx.scale(1, 0.38);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.48, 0, Math.PI * 2);
      ctx.stroke();

      const sat2X = Math.cos(orbitSat2) * (baseRadius * 1.48);
      const sat2Y = Math.sin(orbitSat2) * (baseRadius * 1.48);
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sat2X, sat2Y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Inner Wireframe Core Sphere
      ctx.strokeStyle = 'rgba(67, 56, 202, 0.15)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.94, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Fibonacci Projected Sphere Points
      const cosY = Math.cos(interactionRef.current.rotationY);
      const sinY = Math.sin(interactionRef.current.rotationY);
      const cosX = Math.cos(interactionRef.current.rotationX);
      const sinX = Math.sin(interactionRef.current.rotationX);

      for (let i = 0; i < FIB_SAMPLES; i++) {
        const pt = spherePts[i];

        // 3D rotation Y and X
        const rx1 = pt.x * cosY + pt.z * sinY;
        const ry1 = pt.y;
        const rz1 = -pt.x * sinY + pt.z * cosY;

        const rx = rx1;
        const ry = ry1 * cosX - rz1 * sinX;
        const rz = ry1 * sinX + rz1 * cosX;

        const fov = 3.2;
        const pz = fov / (fov + rz * 0.7);
        const px = cx + rx * baseRadius * pz;
        const py = cy + ry * baseRadius * pz;

        const depthAlpha = Math.max(0.12, (rz + 1) * 0.44);
        const ptSize = Math.max(0.9, (rz + 1.2) * 1.2);

        if (rz > 0.2) {
          ctx.fillStyle = `rgba(0, 242, 254, ${depthAlpha})`;
        } else if (rz > -0.2) {
          ctx.fillStyle = `rgba(79, 172, 254, ${depthAlpha})`;
        } else {
          ctx.fillStyle = `rgba(138, 43, 226, ${depthAlpha * 0.75})`;
        }

        ctx.beginPath();
        ctx.arc(px, py, ptSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Kolkata Beacon in 2D
      const kRaw = latLongToVector3(KOLKATA.lat, KOLKATA.lon, 1);
      const kx1 = kRaw.x * cosY + kRaw.z * sinY;
      const ky1 = kRaw.y;
      const kz1 = -kRaw.x * sinY + kRaw.z * cosY;
      const kx = kx1;
      const ky = ky1 * cosX - kz1 * sinX;
      const kz = ky1 * sinX + kz1 * cosX;

      if (kz > 0) {
        const fov = 3.2;
        const kpz = fov / (fov + kz * 0.7);
        const kpx = cx + kx * baseRadius * kpz;
        const kpy = cy + ky * baseRadius * kpz;

        // Wave pulse
        const waveProgress = (time * 0.003) % 1;
        const waveRadius = 4 + waveProgress * 12;
        const waveAlpha = Math.max(0, 0.8 * (1 - waveProgress));

        ctx.strokeStyle = `rgba(16, 185, 129, ${waveAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(kpx, kpy, waveRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Beacon dot
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(kpx, kpy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render2D);
    };

    animationFrameId = requestAnimationFrame(render2D);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [renderMode]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-square flex items-center justify-center select-none group',
        className
      )}
      style={{ touchAction: 'pan-y' }}
      aria-label="Interactive 3D Spatial Globe Canvas"
    >
      {/* Ambient Halo Atmosphere Glow Behind Globe */}
      <div className="absolute inset-4 rounded-full glow-cyan-subtle blur-3xl opacity-75 pointer-events-none" />

      {/* Shimmer backdrop placeholder while initializing */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none',
          isLoaded ? 'opacity-0' : 'opacity-100 bg-cyan-500/5 animate-pulse'
        )}
      />

      {/* Floating Kolkata Affiliation Badge / Tooltip */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="glass-pill px-3 py-1 flex items-center gap-1.5 border border-emerald-500/30 bg-[#07080d]/80 text-[11px] font-medium text-emerald-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="flex items-center gap-1 font-sans">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            Lakshmipat Singhania Academy • Kolkata
          </span>
        </div>
      </div>

      {/* Render Target Canvas with non-blocking momentum pointer interactions */}
      <canvas
        key={renderMode}
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'pan-y' }}
        className={cn(
          'w-full h-full block relative z-10 transition-opacity duration-700 select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};

export default InteractiveGlobe;
