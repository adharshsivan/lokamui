/**
 * Lokam Mini — High-Fidelity 3D Fractal Lightning Strike
 * Features:
 * - Continuous Mitered Polyline Ribbon Strips (Zero gaps, zero broken joints, seamless connectivity).
 * - Physical Dielectric Gradient: downward flow with realistic acute branching (22°–32° divergence).
 * - Smooth quadratic windowing (`window = (1 - d^2)^2`): strictly zero edge artifacts/quad borders.
 * - Multi-tier HDR plasma core: blinding white core + cyan ionization corona + indigo atmospheric aura.
 * - Dynamic scene PointLight illuminating the ocean, island, and player in real time.
 */

import * as THREE from 'three';
import type { LightningSystem } from './lightning';

interface PolylineStrip {
  points: THREE.Vector3[];
  widths: number[];
  intensities: number[];
  progresses: number[];
}

export class LightningMesh {
  private group: THREE.Group;
  private mesh: THREE.Mesh;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private pointLight: THREE.PointLight;

  private currentSeed = -1;
  private maxVertices = 1200;
  private maxIndices = 3600;
  private positions: Float32Array;
  private uvs: Float32Array;
  private colors: Float32Array;
  private indices: Uint16Array;
  private strips: PolylineStrip[] = [];
  private time = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'RealisticLightning';

    this.positions = new Float32Array(this.maxVertices * 3);
    this.uvs = new Float32Array(this.maxVertices * 2);
    this.colors = new Float32Array(this.maxVertices * 4);
    this.indices = new Uint16Array(this.maxIndices);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(this.uvs, 2));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 4));
    this.geometry.setIndex(new THREE.BufferAttribute(this.indices, 1));
    this.geometry.setDrawRange(0, 0);

    // High-performance photorealistic lightning shader
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uIntensity: { value: 0 },
        uLeader: { value: 1 },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec4 color;
        varying vec2 vUv;
        varying vec4 vColor;
        void main() {
          vUv = uv;
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        varying vec4 vColor;
        uniform float uIntensity;
        uniform float uLeader;
        uniform float uTime;

        void main() {
          float leaderT = vColor.a;
          if (leaderT > uLeader) {
            discard;
          }

          // Distance across the ribbon (-1.0 to 1.0)
          float d = abs(vUv.y * 2.0 - 1.0);

          // Smooth quadratic window function: strictly drops to 0.0 at quad boundary
          float wInner = clamp(1.0 - d * d, 0.0, 1.0);
          float window = wInner * wInner;

          // Electric crackle micro-pulse
          float crackle = 1.0 + 0.14 * sin(uTime * 120.0 + leaderT * 28.0);

          // 1. Ultra-hot plasma core (razor-sharp blinding white)
          float core = exp(-d * d * 38.0) * 4.2;

          // 2. Inner cyan-blue ionization corona
          float corona = exp(-d * 6.0) * 1.8;

          // 3. Outer atmospheric Rayleigh/Mie scattering halo
          float halo = exp(-d * 2.0) * 0.65;

          vec3 coreCol = vec3(1.0, 1.0, 1.0) * core;
          vec3 coronaCol = vec3(0.42, 0.82, 1.0) * corona;
          vec3 haloCol = vec3(0.28, 0.44, 0.95) * halo;

          vec3 finalColor = (coreCol + coronaCol + haloCol) * vColor.rgb * (uIntensity * crackle) * window;
          float alpha = clamp(core * 0.9 + corona * 0.7 + halo * 0.4, 0.0, 1.0) * window * min(uIntensity, 1.0);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.renderOrder = 300;
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);

    // Dynamic 3D Point Light for physical scene illumination
    this.pointLight = new THREE.PointLight(0x88ccff, 0, 320, 1.2);
    this.pointLight.castShadow = false;
    this.group.add(this.pointLight);

    scene.add(this.group);
  }

  update(camera: THREE.Camera, lightning: LightningSystem) {
    if (lightning.bolt <= 0.005 || lightning.kind !== 'bolt') {
      this.mesh.visible = false;
      this.pointLight.intensity = 0;
      return;
    }

    this.time += 0.016;
    this.mesh.visible = true;

    // Check if new strike needs procedural fractal regeneration
    if (this.currentSeed !== lightning.seed) {
      this.currentSeed = lightning.seed;
      this.generateContinuousStrips(camera, lightning);
    }

    // Update uniform intensity, leader progression, and time
    this.material.uniforms.uIntensity.value = lightning.bolt * 2.0;
    this.material.uniforms.uLeader.value = lightning.leader;
    this.material.uniforms.uTime.value = this.time;

    // Orient ribbon quads towards camera with continuous miter joints
    this.updateContinuousRibbonGeometry(camera);

    // Scene PointLight flash intensity
    this.pointLight.intensity = Math.min(24.0, lightning.bolt * 18.0 + lightning.flash * 8.0);
  }

  private generateContinuousStrips(camera: THREE.Camera, lightning: LightningSystem) {
    this.strips = [];

    // Seeded PRNG for reproducible strike shape
    let s = lightning.seed;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const camPos = camera.position;

    // Position strike 75m to 88m in front of camera
    const strikeDist = 76 + rng() * 12;
    const az = lightning.az; // [sin(yaw), cos(yaw)]

    const targetX = camPos.x + az[0] * strikeDist + (rng() - 0.5) * 8;
    const targetZ = camPos.z + az[1] * strikeDist + (rng() - 0.5) * 8;
    const groundY = 0.5; // Sea / terrain impact

    // Cloud origin (top of the lightning strike, 52m to 65m above camera)
    const cloudY = camPos.y + 52 + rng() * 14;
    const cloudX = targetX + (rng() - 0.5) * 16;
    const cloudZ = targetZ + (rng() - 0.5) * 16;

    // Position point light at mid-strike altitude
    this.pointLight.position.set(
      (cloudX + targetX) * 0.5,
      (cloudY + groundY) * 0.45,
      (cloudZ + targetZ) * 0.5
    );

    // ── MAIN TRUNK GENERATION (CONTINUOUS STEPPED-LEADER CHANNEL) ──
    const trunkSteps = 32;
    const trunkPts: THREE.Vector3[] = [];
    const trunkWidths: number[] = [];
    const trunkIntensities: number[] = [];
    const trunkProgs: number[] = [];

    let cur = new THREE.Vector3(cloudX, cloudY, cloudZ);
    trunkPts.push(cur.clone());
    trunkWidths.push(1.65);
    trunkIntensities.push(1.0);
    trunkProgs.push(0.0);

    const dY = (cloudY - groundY) / trunkSteps;
    const dX = (targetX - cloudX) / trunkSteps;
    const dZ = (targetZ - cloudZ) / trunkSteps;

    let driftX = 0;
    let driftZ = 0;

    for (let i = 1; i <= trunkSteps; i++) {
      const prog = i / trunkSteps;
      const targetStepY = cloudY - dY * i;

      // Natural electrical channel tortuosity
      driftX += (rng() - 0.5) * 1.1;
      driftZ += (rng() - 0.5) * 1.1;
      driftX *= 0.82;
      driftZ *= 0.82;

      // Crisp angular kinks every 2-3 steps
      const isKink = i % 2 === 0;
      const kinkMag = isKink ? 1.2 + rng() * 1.6 : 0.35 + rng() * 0.5;
      const kinkAngle = rng() * Math.PI * 2;
      const kX = Math.cos(kinkAngle) * kinkMag;
      const kZ = Math.sin(kinkAngle) * kinkMag;

      const ptX = (i === trunkSteps) ? targetX : (cloudX + dX * i + driftX + kX);
      const ptZ = (i === trunkSteps) ? targetZ : (cloudZ + dZ * i + driftZ + kZ);
      const ptY = (i === trunkSteps) ? groundY : (targetStepY + (rng() - 0.5) * (dY * 0.15));

      trunkPts.push(new THREE.Vector3(ptX, ptY, ptZ));

      // Natural tapering from 1.65m at cloud down to 0.85m at impact
      const w = THREE.MathUtils.lerp(1.65, 0.85, prog);
      trunkWidths.push(w);
      trunkIntensities.push(1.0);
      trunkProgs.push(prog);
    }

    this.strips.push({
      points: trunkPts,
      widths: trunkWidths,
      intensities: trunkIntensities,
      progresses: trunkProgs,
    });

    // ── ELEGANT PRIMARY FORKING BRANCHES (NATURAL ACUTE DIVERGENCE) ──
    const forkIndices = [
      Math.floor(trunkSteps * 0.28), // Upper fork
      Math.floor(trunkSteps * 0.44), // Mid-upper fork
      Math.floor(trunkSteps * 0.58), // Mid fork
      Math.floor(trunkSteps * 0.72), // Lower fork
    ];

    let sideToggle = rng() > 0.5 ? 1 : -1;

    for (const forkIdx of forkIndices) {
      if (forkIdx >= trunkPts.length - 2) continue;
      sideToggle *= -1;

      const forkStart = trunkPts[forkIdx];
      const forkProg = forkIdx / trunkSteps;

      // Natural acute divergence angle: 22° to 32° from trunk downward direction
      const perpAngle = Math.atan2(az[0], az[1]) + Math.PI * 0.5 * sideToggle;
      const branchOutwardX = Math.sin(perpAngle);
      const branchOutwardZ = Math.cos(perpAngle);

      // Strictly downward flow (Y = -0.88, no upward or backward lines!)
      const branchDir = new THREE.Vector3(
        branchOutwardX * 0.42 + (rng() - 0.5) * 0.12,
        -0.88,
        branchOutwardZ * 0.42 + (rng() - 0.5) * 0.12
      ).normalize();

      const branchLength = (12 + rng() * 12) * (1.05 - forkProg * 0.25);
      const branchSteps = 8 + Math.floor(rng() * 4);
      const stepLen = branchLength / branchSteps;

      const bPts: THREE.Vector3[] = [forkStart.clone()];
      const bWidths: number[] = [0.75 * (1.0 - forkProg * 0.3)];
      const bIntensities: number[] = [0.85];
      const bProgs: number[] = [forkProg];

      let bCur = forkStart.clone();

      for (let j = 1; j <= branchSteps; j++) {
        const jProg = j / branchSteps;

        // Subtle natural zig-zag (small angles, downward flow)
        const jKinkAngle = rng() * Math.PI * 2;
        const jKinkMag = 0.35 + rng() * 0.5;
        const jKink = new THREE.Vector3(
          Math.cos(jKinkAngle) * jKinkMag,
          -0.15 - rng() * 0.15,
          Math.sin(jKinkAngle) * jKinkMag
        );

        const nextPt = bCur.clone().addScaledVector(branchDir, stepLen).add(jKink);
        nextPt.y = Math.max(groundY + 0.6, nextPt.y);

        bPts.push(nextPt);

        // Smooth tapering to fine tip
        const w = THREE.MathUtils.lerp(0.68, 0.14, jProg);
        const intensity = THREE.MathUtils.lerp(0.85, 0.2, jProg);
        bWidths.push(w);
        bIntensities.push(intensity);
        bProgs.push(Math.min(1.0, forkProg + jProg * 0.25));

        bCur = nextPt;
      }

      this.strips.push({
        points: bPts,
        widths: bWidths,
        intensities: bIntensities,
        progresses: bProgs,
      });
    }
  }

  private updateContinuousRibbonGeometry(camera: THREE.Camera) {
    const camPos = camera.position;
    let vOffset = 0;
    let iOffset = 0;

    const toCam = new THREE.Vector3();
    const dPrev = new THREE.Vector3();
    const dNext = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const normal = new THREE.Vector3();

    for (const strip of this.strips) {
      const pts = strip.points;
      const N = pts.length;
      if (N < 2) continue;

      if (vOffset + N * 2 > this.maxVertices || iOffset + (N - 1) * 6 > this.maxIndices) {
        break;
      }

      const stripBaseVertex = vOffset;

      for (let i = 0; i < N; i++) {
        const pt = pts[i];
        const halfW = strip.widths[i] * 0.5;
        const intensity = strip.intensities[i];
        const prog = strip.progresses[i];

        // Continuous miter direction at vertex
        if (i > 0) dPrev.subVectors(pt, pts[i - 1]).normalize();
        if (i < N - 1) dNext.subVectors(pts[i + 1], pt).normalize();

        if (i === 0) {
          dir.copy(dNext);
        } else if (i === N - 1) {
          dir.copy(dPrev);
        } else {
          dir.addVectors(dPrev, dNext).normalize();
        }

        // Camera-facing billboard normal
        toCam.subVectors(camPos, pt).normalize();
        normal.crossVectors(dir, toCam).normalize();

        const vIdx = (vOffset + i * 2);
        const posIdx = vIdx * 3;
        const uvIdx = vIdx * 2;
        const colIdx = vIdx * 4;

        // Vertex left (UV.y = 0.0)
        this.positions[posIdx] = pt.x - normal.x * halfW;
        this.positions[posIdx + 1] = pt.y - normal.y * halfW;
        this.positions[posIdx + 2] = pt.z - normal.z * halfW;
        this.uvs[uvIdx] = 0;
        this.uvs[uvIdx + 1] = 0;
        this.colors[colIdx] = intensity;
        this.colors[colIdx + 1] = intensity;
        this.colors[colIdx + 2] = intensity;
        this.colors[colIdx + 3] = prog;

        // Vertex right (UV.y = 1.0)
        this.positions[posIdx + 3] = pt.x + normal.x * halfW;
        this.positions[posIdx + 4] = pt.y + normal.y * halfW;
        this.positions[posIdx + 5] = pt.z + normal.z * halfW;
        this.uvs[uvIdx + 2] = 0;
        this.uvs[uvIdx + 3] = 1;
        this.colors[colIdx + 4] = intensity;
        this.colors[colIdx + 5] = intensity;
        this.colors[colIdx + 6] = intensity;
        this.colors[colIdx + 7] = prog;
      }

      // Continuous quad indices along strip
      for (let i = 0; i < N - 1; i++) {
        const v0 = stripBaseVertex + i * 2;
        const v1 = stripBaseVertex + i * 2 + 1;
        const v2 = stripBaseVertex + (i + 1) * 2;
        const v3 = stripBaseVertex + (i + 1) * 2 + 1;

        this.indices[iOffset++] = v0;
        this.indices[iOffset++] = v1;
        this.indices[iOffset++] = v2;
        this.indices[iOffset++] = v2;
        this.indices[iOffset++] = v1;
        this.indices[iOffset++] = v3;
      }

      vOffset += N * 2;
    }

    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const uvAttr = this.geometry.attributes.uv as THREE.BufferAttribute;
    const colAttr = this.geometry.attributes.color as THREE.BufferAttribute;
    const indexAttr = this.geometry.index as THREE.BufferAttribute;

    posAttr.needsUpdate = true;
    uvAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    indexAttr.needsUpdate = true;

    this.geometry.setDrawRange(0, iOffset);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.pointLight.dispose();
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
