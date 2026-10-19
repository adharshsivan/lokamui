/**
 * Lokam Mini — GameEngine
 * Minimal, high-performance Three.js engine wrapper.
 * Manages Scene, Camera, Renderer, Resize observer, and Frame Loop.
 * Does NOT contain game logic.
 */

import * as THREE from 'three';
import type { GlobalSettings } from '../config/GlobalSettings';
import type { EventBus } from '../events/EventBus';
import { OrbitCameraController } from './OrbitCameraController';

export interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  settings: GlobalSettings;
  eventBus: EventBus;
}

export type RenderCallback = (delta: number, elapsed: number) => void;

export class GameEngine {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly cameraController: OrbitCameraController;
  readonly renderer: THREE.WebGLRenderer;
  private readonly canvas: HTMLCanvasElement;
  private readonly settings: GlobalSettings;
  private readonly eventBus: EventBus;

  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private totalElapsed = 0;
  private resizeObserver: ResizeObserver | null = null;
  private updateCallbacks: Set<RenderCallback> = new Set();
  private settingsUnsubscribe: (() => void) | null = null;

  constructor(options: GameEngineOptions) {
    this.canvas = options.canvas;
    this.settings = options.settings;
    this.eventBus = options.eventBus;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = null; // Dynamic atmospheric SkyDome renders scene background

    // 2. Camera setup (Third-person waterfront exploration perspective)
    const aspect = this.canvas.clientWidth / Math.max(this.canvas.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.1, this.settings.graphics.viewDistance);
    this.cameraController = new OrbitCameraController({
      canvas: this.canvas,
      camera: this.camera,
      initialTarget: new THREE.Vector3(0, 1.2, 10),
      initialDistance: 7.5,
      initialAzimuth: Math.PI,
      initialElevation: 1.15,
    });

    // 3. WebGLRenderer setup
    const gSettings = this.settings.graphics;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: gSettings.antialias,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      preserveDrawingBuffer: true,
    });

    this.applyGraphicsSettings();

    // 4. Setup Resize handling
    this.setupResizeObserver();

    // 5. Listen to settings changes
    this.settingsUnsubscribe = this.settings.subscribe(() => {
      this.applyGraphicsSettings();
    });
  }

  private applyGraphicsSettings(): void {
    const g = this.settings.graphics;
    this.renderer.setPixelRatio(g.pixelRatio);
    this.renderer.shadowMap.enabled = g.shadows;
    if (g.shadows) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.camera.far = g.viewDistance;
    this.camera.updateProjectionMatrix();

    this.resize();
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.canvas);
  }

  resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.eventBus.emit('engine:resized', {
      width,
      height,
      pixelRatio: this.renderer.getPixelRatio(),
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  onUpdate(callback: RenderCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.eventBus.emit('engine:resumed');

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const rawDelta = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Clamp delta to prevent huge jumps on tab switch / lag spikes
      const delta = Math.min(rawDelta, 0.1);
      this.totalElapsed += delta;

      // Invoke frame listeners
      for (const callback of this.updateCallbacks) {
        try {
          callback(delta, this.totalElapsed);
        } catch (err) {
          console.error('[GameEngine] Error in update callback:', err);
        }
      }

      // Update orbit camera controls
      this.cameraController.update(delta);

      // Render Three.js frame
      this.renderer.render(this.scene, this.camera);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  pause(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.eventBus.emit('engine:paused');
  }

  dispose(): void {
    this.pause();

    if (this.settingsUnsubscribe) {
      this.settingsUnsubscribe();
      this.settingsUnsubscribe = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.updateCallbacks.clear();
    this.cameraController.dispose();

    // Dispose renderer and WebGL context
    this.renderer.dispose();
  }
}
