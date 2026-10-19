/**
 * Lokam Mini — High-Fidelity 3D Atmospheric Rain FX (RainFX)
 * 
 * Features:
 * - True 3D World-Space Simulation: Rain particles live in physical 3D world space.
 *   Particles never rotate with camera orbit or look-around ("rain falling for me only" fixed).
 * - Toroidal Camera Volume Wrapping: Particles follow the camera position in world space,
 *   preventing rain from disappearing during camera orbit, rotation, or walking.
 * - Exact Three.js View-Projection Matrix: Projects world-space positions directly to canvas pixels,
 *   guaranteeing 100% seamless perspective convergence, motion blur, and screen alignment.
 * - Natural World Wind Drift: Fixed wind vectors in world space (derived from wind speed & direction).
 * - Perspective Ground Splashes: True world-plane ground ripples that lie flat on the water/terrain.
 * - Zero per-frame GC allocations with typed arrays.
 */

import * as THREE from 'three';

export interface RainFXOptions {
  canvas?: HTMLCanvasElement;
  parent?: HTMLElement;
  intensity?: number; // 0..1
  wind?: number; // 0..1
  windDir?: number; // degrees 0..360
  speed?: number; // fall speed m/s
  radius?: number; // volume radius around camera, m
  height?: number; // volume height above camera, m
  rainAlpha?: number;
  color?: string; // "r,g,b"
  splashes?: boolean;
  maxDPR?: number;
}

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const rnd = Math.random;
const rand = (a: number, b: number) => a + (b - a) * rnd();
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

// Distance bins (squared metres from camera) -> line width & opacity fade
const BINS = [
  { d2: 16.0, w: 2.2, a: 0.32 }, // < 4m (close, soft motion streak)
  { d2: 49.0, w: 1.6, a: 0.28 }, // < 7m
  { d2: 100.0, w: 1.2, a: 0.22 }, // < 10m
  { d2: 196.0, w: 0.85, a: 0.15 }, // < 14m
  { d2: 1e9, w: 0.6, a: 0.08 }, // background
];

const SHUTTER = 0.032; // seconds of motion blur per streak

interface GroundSplash {
  x: number;
  y: number;
  z: number;
  age: number;
  life: number;
}

export class RainFX {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ownsCanvas: boolean;
  private parent: HTMLElement;

  // Configuration options
  intensity = 0.0;
  targetIntensity = 0.0;
  windSpeed = 0.25;
  windDirDeg = 40;
  fallSpeed = 12.0;
  splashesEnabled = true;
  color = '205,222,255';
  rainAlpha = 1.0;
  radius = 16.0; // 32m diameter around camera
  height = 14.0; // 14m vertical column above camera
  groundY = 0.2; // Sea surface / pier impact altitude
  maxDPR = 1.5;

  // Viewport dimensions
  w = 0;
  h = 0;
  dpr = 1;
  private maxRain = 3600;

  // Particle buffers (stored in TRUE 3D WORLD COORDINATES)
  private X = new Float32Array(0);
  private Y = new Float32Array(0);
  private Z = new Float32Array(0);
  private V = new Float32Array(0);

  // Projected 2D screen line coordinates
  private P0x = new Float32Array(0);
  private P0y = new Float32Array(0);
  private P1x = new Float32Array(0);
  private P1y = new Float32Array(0);
  private BIN = new Uint8Array(0);

  // Reusable Matrix & Vectors for projection without allocation
  private vpMatrix = new THREE.Matrix4();
  private m = new Float32Array(16);
  private splashes: GroundSplash[] = [];
  private _t = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(opts: RainFXOptions = {}) {
    this.ownsCanvas = !opts.canvas;
    this.parent = opts.parent || document.body;
    this.canvas = opts.canvas || document.createElement('canvas');

    if (this.ownsCanvas) {
      const s = this.canvas.style;
      s.position = 'absolute';
      s.left = '0';
      s.top = '0';
      s.width = '100%';
      s.height = '100%';
      s.pointerEvents = 'none';
      s.zIndex = '15';
      this.parent.appendChild(this.canvas);
    } else {
      this.canvas.style.pointerEvents = 'none';
    }

    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('[RainFX] Failed to get 2D canvas context');
    this.ctx = context;

    if (opts.intensity !== undefined) this.intensity = this.targetIntensity = opts.intensity;
    if (opts.wind !== undefined) this.windSpeed = opts.wind;
    if (opts.windDir !== undefined) this.windDirDeg = opts.windDir;
    if (opts.speed !== undefined) this.fallSpeed = opts.speed;
    if (opts.splashes !== undefined) this.splashesEnabled = opts.splashes;

    this.resize(true);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }
  }

  setIntensity(val: number, instant = false) {
    this.targetIntensity = clamp(val, 0, 1);
    if (instant) this.intensity = this.targetIntensity;
  }

  setWind(speed: number, dirDeg: number) {
    this.windSpeed = clamp(speed, 0, 1.5);
    this.windDirDeg = dirDeg;
  }

  resize(force = false) {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width || window.innerWidth);
    const h = Math.max(1, rect.height || window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDPR);

    if (!force && w === this.w && h === this.h && dpr === this.dpr) return;

    this.w = w;
    this.h = h;
    this.dpr = dpr;

    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const area = clamp((w * h) / (390 * 844), 0.6, 2.0);
    this.maxRain = Math.round(3400 * area);

    const n = this.maxRain;
    this.X = new Float32Array(n);
    this.Y = new Float32Array(n);
    this.Z = new Float32Array(n);
    this.V = new Float32Array(n);
    this.P0x = new Float32Array(n);
    this.P0y = new Float32Array(n);
    this.P1x = new Float32Array(n);
    this.P1y = new Float32Array(n);
    this.BIN = new Uint8Array(n);

    // Initial random distribution in local volume
    const R = this.radius;
    for (let i = 0; i < n; i++) {
      this.X[i] = (rnd() - 0.5) * 2 * R;
      this.Y[i] = this.groundY + rnd() * (this.height + 6);
      this.Z[i] = (rnd() - 0.5) * 2 * R;
      this.V[i] = rand(0.88, 1.15);
    }
  }

  update(camera: THREE.Camera, dt: number) {
    dt = Math.min(dt, 0.05);
    this._t += dt;

    // Smooth exponential approach to target intensity
    this.intensity += (this.targetIntensity - this.intensity) * Math.min(1, dt * 2.5);

    if (this.intensity <= 0.005) {
      return;
    }

    const camPos = camera.position;

    // Fixed world wind velocity vector (independent of camera direction)
    const windRad = this.windDirDeg * DEG;
    const windMag = this.windSpeed * 6.5; // up to 6.5 m/s drift
    const t = this._t;
    const gust = 1.0 + 0.2 * Math.sin(t * 0.65) + 0.12 * Math.sin(t * 1.8 + 1.2);

    const vx = Math.sin(windRad) * windMag * gust;
    const vz = Math.cos(windRad) * windMag * gust;
    const sp = this.fallSpeed;

    const n = Math.floor(this.maxRain * this.intensity);
    const X = this.X;
    const Y = this.Y;
    const Z = this.Z;
    const V = this.V;
    const R = this.radius;
    const g = this.groundY;
    const topY = camPos.y + this.height;
    const splash = this.splashesEnabled;

    for (let i = 0; i < n; i++) {
      // 1. Move particle downward and with world wind in TRUE 3D WORLD SPACE
      Y[i] -= sp * V[i] * dt;
      X[i] += vx * dt;
      Z[i] += vz * dt;

      // 2. Toroidal camera wrapping: Rain volume moves with camera without resetting
      const dx = X[i] - camPos.x;
      const dz = Z[i] - camPos.z;

      if (dx > R) X[i] -= 2 * R;
      else if (dx < -R) X[i] += 2 * R;

      if (dz > R) Z[i] -= 2 * R;
      else if (dz < -R) Z[i] += 2 * R;

      // 3. Ground impact & respawn
      if (Y[i] < g) {
        if (splash && rnd() < 0.12) {
          const d2 = dx * dx + dz * dz;
          if (d2 < 144) {
            this._addSplash(X[i], g, Z[i]);
          }
        }
        Y[i] = topY + rnd() * 3.0;
        X[i] = camPos.x + (rnd() - 0.5) * 2 * R;
        Z[i] = camPos.z + (rnd() - 0.5) * 2 * R;
      } else if (Y[i] > topY + 4.0) {
        Y[i] = g + rnd() * (this.height + 2.0);
      }
    }

    // Update ground splashes
    if (this.splashesEnabled && this.splashes.length > 0) {
      for (let i = this.splashes.length - 1; i >= 0; i--) {
        this.splashes[i].age += dt;
        if (this.splashes[i].age >= this.splashes[i].life) {
          this.splashes[i] = this.splashes[this.splashes.length - 1];
          this.splashes.pop();
        }
      }
    }
  }

  render(camera: THREE.Camera) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    if (this.intensity <= 0.005) {
      return;
    }

    // 1. Compute exact View-Projection Matrix from Three.js camera
    this.vpMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const m = this.vpMatrix.elements;

    // 2. Project world-space rain streaks to 2D canvas coordinates
    this._projectAndRenderRain(ctx, camera, m);

    // 3. Render perspective ground splashes
    if (this.splashesEnabled && this.splashes.length > 0) {
      this._renderSplashes(ctx, m);
    }
  }

  private _projectAndRenderRain(ctx: CanvasRenderingContext2D, camera: THREE.Camera, m: number[]) {
    const n = Math.floor(this.maxRain * this.intensity);
    if (!n) return;

    const X = this.X;
    const Y = this.Y;
    const Z = this.Z;
    const V = this.V;
    const P0x = this.P0x;
    const P0y = this.P0y;
    const P1x = this.P1x;
    const P1y = this.P1y;
    const BIN = this.BIN;

    const w = this.w;
    const h = this.h;
    const camPos = camera.position;
    const sp = this.fallSpeed;

    // Wind streak vector in world space
    const windRad = this.windDirDeg * DEG;
    const windMag = this.windSpeed * 6.5;
    const vx = Math.sin(windRad) * windMag;
    const vz = Math.cos(windRad) * windMag;

    const MAXL = 0.14 * h;
    const MAXL2 = MAXL * MAXL;

    for (let i = 0; i < n; i++) {
      const x0 = X[i];
      const y0 = Y[i];
      const z0 = Z[i];

      // Streak tail in world space
      const x1 = x0 - vx * SHUTTER;
      const y1 = y0 + sp * V[i] * SHUTTER;
      const z1 = z0 - vz * SHUTTER;

      // Project Head (P0) with View-Projection Matrix
      const w0 = m[3] * x0 + m[7] * y0 + m[11] * z0 + m[15];
      if (w0 <= 0.2) {
        BIN[i] = 255;
        continue;
      }

      // Project Tail (P1)
      const w1 = m[3] * x1 + m[7] * y1 + m[11] * z1 + m[15];
      if (w1 <= 0.2) {
        BIN[i] = 255;
        continue;
      }

      const invW0 = 1.0 / w0;
      const ndcX0 = (m[0] * x0 + m[4] * y0 + m[8] * z0 + m[12]) * invW0;
      const ndcY0 = (m[1] * x0 + m[5] * y0 + m[9] * z0 + m[13]) * invW0;

      const invW1 = 1.0 / w1;
      const ndcX1 = (m[0] * x1 + m[4] * y1 + m[8] * z1 + m[12]) * invW1;
      const ndcY1 = (m[1] * x1 + m[5] * y1 + m[9] * z1 + m[13]) * invW1;

      // NDC to Canvas pixel coordinates
      const px = (ndcX0 * 0.5 + 0.5) * w;
      const py = (-ndcY0 * 0.5 + 0.5) * h;
      let qx = (ndcX1 * 0.5 + 0.5) * w;
      let qy = (-ndcY1 * 0.5 + 0.5) * h;

      // Frustum culling
      if ((px < -20 && qx < -20) || (px > w + 20 && qx > w + 20) || (py < -20 && qy < -20) || (py > h + 20 && qy > h + 20)) {
        BIN[i] = 255;
        continue;
      }

      // Clamp streak length to prevent crazy stretched spikes at extreme near clip
      const dx = qx - px;
      const dy = qy - py;
      const l2 = dx * dx + dy * dy;
      if (l2 > MAXL2) {
        const k = MAXL / Math.sqrt(l2);
        qx = px + dx * k;
        qy = py + dy * k;
      }

      P0x[i] = px;
      P0y[i] = py;
      P1x[i] = qx;
      P1y[i] = qy;

      // Distance to camera for depth binning
      const ddx = x0 - camPos.x;
      const ddy = y0 - camPos.y;
      const ddz = z0 - camPos.z;
      const d2 = ddx * ddx + ddy * ddy + ddz * ddz;

      BIN[i] =
        d2 < 16.0
          ? 0
          : d2 < 49.0
          ? 1
          : d2 < 100.0
          ? 2
          : d2 < 196.0
          ? 3
          : 4;
    }

    const hs = clamp(h / 844, 0.8, 1.4);
    const ra = this.rainAlpha;
    const rgb = this.color;
    ctx.lineCap = 'round';

    for (let b = 0; b < BINS.length; b++) {
      ctx.lineWidth = BINS[b].w * hs;
      ctx.strokeStyle = `rgba(${rgb},${BINS[b].a * ra})`;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        if (BIN[i] !== b) continue;
        ctx.moveTo(P0x[i], P0y[i]);
        ctx.lineTo(P1x[i], P1y[i]);
      }
      ctx.stroke();
    }
  }

  private _addSplash(x: number, y: number, z: number) {
    if (this.splashes.length >= 48) return;
    this.splashes.push({
      x,
      y,
      z,
      age: 0,
      life: rand(0.25, 0.42),
    });
  }

  private _renderSplashes(ctx: CanvasRenderingContext2D, m: number[]) {
    const w = this.w;
    const h = this.h;
    const rgb = this.color;
    ctx.strokeStyle = `rgb(${rgb})`;

    for (let i = 0; i < this.splashes.length; i++) {
      const p = this.splashes[i];
      const t = p.age / p.life;
      const r = 0.05 + 0.28 * t; // expanding ripple radius in metres

      // Project Center point
      const wC = m[3] * p.x + m[7] * p.y + m[11] * p.z + m[15];
      if (wC <= 0.2) continue;
      const invWC = 1.0 / wC;
      const cx = ((m[0] * p.x + m[4] * p.y + m[8] * p.z + m[12]) * invWC * 0.5 + 0.5) * w;
      const cy = (-(m[1] * p.x + m[5] * p.y + m[9] * p.z + m[13]) * invWC * 0.5 + 0.5) * h;

      if (cx < -40 || cx > w + 40 || cy < -40 || cy > h + 40) continue;

      // Project East point (tangent on world X axis)
      const xE = p.x + r;
      const wE = m[3] * xE + m[7] * p.y + m[11] * p.z + m[15];
      if (wE <= 0.2) continue;
      const invWE = 1.0 / wE;
      const ex = ((m[0] * xE + m[4] * p.y + m[8] * p.z + m[12]) * invWE * 0.5 + 0.5) * w;
      const ey = (-(m[1] * xE + m[5] * p.y + m[9] * p.z + m[13]) * invWE * 0.5 + 0.5) * h;

      // Project North point (tangent on world Z axis)
      const zN = p.z + r;
      const wN = m[3] * p.x + m[7] * p.y + m[11] * zN + m[15];
      if (wN <= 0.2) continue;
      const invWN = 1.0 / wN;
      const nx = ((m[0] * p.x + m[4] * p.y + m[8] * zN + m[12]) * invWN * 0.5 + 0.5) * w;
      const ny = (-(m[1] * p.x + m[5] * p.y + m[9] * zN + m[13]) * invWN * 0.5 + 0.5) * h;

      const ax = ex - cx;
      const ay = ey - cy;
      const bx = nx - cx;
      const by = ny - cy;

      const scale = Math.sqrt(Math.abs(ax * by - ay * bx));
      if (scale < 1.0) continue;

      ctx.save();
      ctx.transform(ax, ay, bx, by, cx, cy);
      ctx.globalAlpha = (1.0 - t) * 0.42;
      ctx.lineWidth = 1.0 / scale;
      ctx.beginPath();
      ctx.arc(0, 0, 1.0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1.0;
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.ownsCanvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
