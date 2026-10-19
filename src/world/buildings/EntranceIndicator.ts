/**
 * Lokam Mini — Ultra-Premium Chromatic Building Entrance Corona
 * Pure silky volumetric light cylinder with fluid fractal noise (FBM) aurora ribbons
 * and holographic Fresnel rim illumination. Zero particles.
 * Features:
 * - Fluid Simplex / FBM noise for organic, liquid aurora light currents.
 * - Exact chromatic palette matching Ride button & Joystick: Soft Rose, Coral Sunset, Radiant Gold, Fresh Mint, Sky Cyan, Soft Violet.
 * - Holographic Fresnel rim illumination for glowing translucent edges without center wash-out.
 * - Perfectly feathered base dissolving cleanly into the sandstone pavement with zero hard rings.
 * - Clean minimal presence (no particles, no bottom disc, no floating diamond, no harsh point light).
 */

import * as THREE from 'three';

export interface BuildingEntranceConfig {
  id: string;
  name: string;
  category: string;
  position: [number, number, number]; // [x, y, z] in world space
  colorHex?: string;
  radius?: number;
  height?: number;
  subtitle?: string;
  interiorStory?: string;
}

export class EntranceBeacon {
  readonly group = new THREE.Group();
  readonly config: BuildingEntranceConfig;

  private cylinderMesh: THREE.Mesh;
  private cylinderMat: THREE.ShaderMaterial;

  private isPlayerInside = false;
  private activeBlend = 0.0;
  private radius: number;
  private height: number;

  constructor(config: BuildingEntranceConfig) {
    this.config = config;
    this.radius = config.radius || 1.6;
    this.height = config.height || 2.9;

    this.group.name = `entrance_beacon_${config.id}`;
    this.group.position.set(config.position[0], config.position[1], config.position[2]);

    // Single Clean, Luxurious Chromatic Cylinder (No particles, no bottom disc, no diamond)
    this.cylinderMat = this.createCylinderShader();
    const cylinderGeo = new THREE.CylinderGeometry(
      this.radius * 0.98,
      this.radius,
      this.height,
      64,
      12,
      true
    );
    this.cylinderMesh = new THREE.Mesh(cylinderGeo, this.cylinderMat);
    this.cylinderMesh.position.y = this.height / 2;
    this.group.add(this.cylinderMesh);
  }

  private createCylinderShader(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActive: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform float uTime;
        uniform float uActive;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        // GLSL Simplex Noise for organic liquid light
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ; m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        float fbm(vec2 p) {
          float total = 0.0;
          float amp = 0.55;
          for (int i = 0; i < 3; i++) {
            total += snoise(p) * amp;
            p = p * 2.08;
            amp *= 0.48;
          }
          return total;
        }

        // Exact chromatic conic gradient from Ride button & Joystick .glimmer-border-glow
        vec3 getGlimmerColor(float t) {
          float phase = fract(t);
          vec3 cRose   = vec3(0.957, 0.447, 0.714); // #f472b6 Soft Rose
          vec3 cSunset = vec3(0.984, 0.573, 0.235); // #fb923c Coral Sunset
          vec3 cGold   = vec3(0.980, 0.800, 0.082); // #facc15 Radiant Gold
          vec3 cMint   = vec3(0.290, 0.871, 0.502); // #4ade80 Fresh Mint
          vec3 cCyan   = vec3(0.220, 0.741, 0.973); // #38bdf8 Sky Cyan
          vec3 cViolet = vec3(0.659, 0.333, 0.969); // #a855f7 Soft Violet

          if (phase < 0.166) return mix(cRose, cSunset, phase / 0.166);
          if (phase < 0.333) return mix(cSunset, cGold, (phase - 0.166) / 0.167);
          if (phase < 0.500) return mix(cGold, cMint, (phase - 0.333) / 0.167);
          if (phase < 0.666) return mix(cMint, cCyan, (phase - 0.500) / 0.166);
          if (phase < 0.833) return mix(cCyan, cViolet, (phase - 0.666) / 0.167);
          return mix(cViolet, cRose, (phase - 0.833) / 0.167);
        }

        void main() {
          // 1. Double-feathered vertical envelope:
          // Dissolves softly into the pavement at the bottom (0.0 to 0.22) - zero hard edge!
          // Dissolves softly into the sky at the top (0.70 to 1.0)
          float bottomFade = smoothstep(0.0, 0.22, vUv.y);
          float topFade = smoothstep(1.0, 0.30, vUv.y);
          float verticalEnvelope = bottomFade * topFade;

          // 2. Fluid FBM Noise Aurora Flow
          // Ascending, swirling liquid coordinates
          vec2 noiseCoord1 = vec2(vUv.x * 2.8, vUv.y * 1.5 - uTime * 0.12);
          vec2 noiseCoord2 = vec2(vUv.x * 5.2 - uTime * 0.08, vUv.y * 2.8 - uTime * 0.22);

          float n1 = fbm(noiseCoord1);
          float n2 = fbm(noiseCoord2);
          float fluidRibbon = (n1 * 0.65 + n2 * 0.35);

          // Flowing chromatic color coordinate modulated by organic noise
          float colorCoord = vUv.x + vUv.y * 0.3 + uTime * 0.065 + fluidRibbon * 0.22;
          vec3 baseColor = getGlimmerColor(colorCoord);

          // Second counter-swirling chromatic accent for iridescent depth
          float accentCoord = vUv.x * 1.8 - vUv.y * 0.4 - uTime * 0.05 + n2 * 0.18;
          vec3 accentColor = getGlimmerColor(accentCoord);
          vec3 mixedColor = mix(baseColor, accentColor, 0.32);

          // 3. Holographic Fresnel Rim Glow (Glowing translucent edges)
          float NdotV = abs(dot(vNormal, vViewDir));
          float fresnel = pow(1.0 - NdotV, 2.0);
          vec3 rimColor = getGlimmerColor(colorCoord + 0.5) * fresnel * 0.6;

          // 4. Luminous Caustic Ribbons (Without bleaching to white)
          float causticGlow = pow(abs(fluidRibbon), 1.8) * 0.45;
          vec3 finalColor = mixedColor * (0.92 + causticGlow) + rimColor;

          // 5. Breathing and transparency
          float pulse = 0.95 + 0.05 * sin(uTime * 2.0);
          float baseAlpha = 0.26 + fresnel * 0.38 + abs(fluidRibbon) * 0.22;
          float alpha = verticalEnvelope * baseAlpha * pulse;

          // Smooth richness boost on player presence
          if (uActive > 0.01) {
            finalColor *= (1.0 + 0.28 * uActive);
            alpha = min(0.92, alpha * (1.0 + 0.3 * uActive));
          }

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
  }

  update(delta: number, elapsed: number, playerPos?: THREE.Vector3): boolean {
    // 1. Advance shader time uniform
    this.cylinderMat.uniforms.uTime.value = elapsed;

    // 2. Slow, graceful rotation of the light cylinder
    this.cylinderMesh.rotation.y += delta * 0.08;

    // 3. Proximity Check with player
    let enteredNow = false;
    if (playerPos) {
      const dx = playerPos.x - this.group.position.x;
      const dz = playerPos.z - this.group.position.z;
      const distance = Math.hypot(dx, dz);
      const isInside = distance < this.radius * 1.2;

      if (isInside && !this.isPlayerInside) {
        enteredNow = true;
      }
      this.isPlayerInside = isInside;
    }

    // Smooth active blend transition
    const targetBlend = this.isPlayerInside ? 1.0 : 0.0;
    this.activeBlend += (targetBlend - this.activeBlend) * Math.min(1, delta * 8);
    this.cylinderMat.uniforms.uActive.value = this.activeBlend;

    return enteredNow;
  }

  dispose(): void {
    this.cylinderMat.dispose();
    this.cylinderMesh.geometry.dispose();
  }
}
