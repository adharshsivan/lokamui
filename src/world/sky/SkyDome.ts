/**
 * Lokam Mini — SkyDome Mesh & Shader Controller
 * Creates a Three.js background Sky Dome with dynamic uniforms management.
 */

import * as THREE from 'three';
import { SKY_VERTEX_SHADER, SKY_FRAGMENT_SHADER } from './skyShaders';
import type { SkyAstro } from './astro';
import type { Palette } from './palette';
import type { EnvParams } from './weather';
import type { LightningSystem } from './lightning';

export class SkyDome {
  readonly mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private cloudTime = 0;
  private totalTime = 0;

  constructor() {
    const geometry = new THREE.SphereGeometry(120, 48, 24);

    this.material = new THREE.ShaderMaterial({
      vertexShader: SKY_VERTEX_SHADER,
      fragmentShader: SKY_FRAGMENT_SHADER,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      fog: false,
      toneMapped: false,
      uniforms: {
        uRW: { value: new THREE.Vector4(window.innerWidth, window.innerHeight, 0.4, 0.2) },
        uP0: { value: new THREE.Vector4(0, 0, 0, 2) },
        uP1: { value: new THREE.Vector4(1, 1, 1, 1) },
        uP2: { value: new THREE.Vector4(0.4, 0.5, 0.2, 1.2) },
        uW0: { value: new THREE.Vector4(0, 0, 0, 0) },
        uW1: { value: new THREE.Vector4(0, 0.3, 0, 0) },
        uW2: { value: new THREE.Vector4(0, 0, 0, 0) },
        uL0: { value: new THREE.Vector4(0, 0, 0, 0.25) },
        uL1: { value: new THREE.Vector4(0, 1, 0.008, 1) },
        uSun: { value: new THREE.Vector3(0, 1, 0) },
        uMoon: { value: new THREE.Vector3(0, -1, 0) },
        uSunCol: { value: new THREE.Vector3(1, 0.95, 0.9) },
        uZen: { value: new THREE.Vector3(0.2, 0.4, 0.8) },
        uHor: { value: new THREE.Vector3(0.7, 0.8, 0.95) },
        uFlashDir: { value: new THREE.Vector3(0, 0.3, 0.95) },
      },
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.renderOrder = -999999;
    this.mesh.frustumCulled = false;
  }

  update(
    camera: THREE.Camera,
    delta: number,
    astro: SkyAstro,
    palette: Palette,
    env: EnvParams,
    lightning: LightningSystem,
    rainbowStrength = 0
  ): void {
    // Keep Sky Dome centered on camera
    this.mesh.position.copy(camera.position);

    this.totalTime += delta;
    this.cloudTime += delta * env.cloudSpeed * 0.05;

    const u = this.material.uniforms;

    // Wind direction
    const windAngle = (env.windDir * Math.PI) / 180;
    const windX = Math.cos(windAngle);
    const windY = Math.sin(windAngle);
    u.uRW.value.set(window.innerWidth, window.innerHeight, windX, windY);

    // Astronomical timings
    u.uP0.value.set(this.totalTime, this.cloudTime, astro.sidereal, camera.position.y);

    // Sun, Moon & Stars illumination
    u.uP1.value.set(env.sunI, env.moonI, env.stars, astro.moonIllum);

    // Atmospheric cover, haze, exposure
    u.uP2.value.set(env.cover, env.wave, env.haze, palette.exposure);

    // Weather components
    u.uW0.value.set(env.overcast, env.storm, env.rain, env.rain > 0.1 ? 0.6 : 0);
    u.uW1.value.set(env.fog, env.wind, 0, 0);
    u.uW2.value.set(env.fog > 0.3 ? 0.5 : 0, 0, env.storm > 0.2 ? 0.7 : 0, env.gust);

    // Lightning
    u.uL0.value.set(lightning.flash, lightning.bolt, lightning.seed, lightning.top);
    u.uL1.value.set(lightning.az[0], lightning.az[1], 0.008, lightning.leader);

    // Astronomical directions
    u.uSun.value.set(astro.sunDir[0], astro.sunDir[1], astro.sunDir[2]).normalize();
    u.uMoon.value.set(astro.moonDir[0], astro.moonDir[1], astro.moonDir[2]).normalize();

    // Palette Colors
    u.uSunCol.value.set(palette.sun[0], palette.sun[1], palette.sun[2]);
    u.uZen.value.set(palette.zenith[0], palette.zenith[1], palette.zenith[2]);
    u.uHor.value.set(palette.horizon[0], palette.horizon[1], palette.horizon[2]);
    u.uFlashDir.value.set(lightning.dir[0], lightning.dir[1], lightning.dir[2]);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  get geometry(): THREE.BufferGeometry {
    return this.mesh.geometry;
  }
}
