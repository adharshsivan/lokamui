/**
 * Lokam Mini — OrbitCameraController
 * High-performance, tactile 3D third-person orbit camera.
 * Features:
 * - Touch pan (1 finger): Smoothly orbits camera around player/target.
 * - Touch pinch (2 fingers): Zooms in and out.
 * - Mouse drag (left/right button): Smoothly orbits camera.
 * - Mouse wheel: Zooms distance.
 * - Inertial damping: Weighted, buttery smooth camera easing.
 * - Camera-relative orientation vectors for player locomotion.
 */

import * as THREE from 'three';

export interface OrbitCameraOptions {
  canvas: HTMLCanvasElement;
  camera: THREE.PerspectiveCamera;
  initialTarget?: THREE.Vector3;
  initialDistance?: number;
  initialAzimuth?: number;
  initialElevation?: number;
}

export class OrbitCameraController {
  readonly camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;

  // Orbit target (player focus point)
  target = new THREE.Vector3(0, 1.2, 10);
  private currentLookTarget = new THREE.Vector3(0, 1.2, 10);

  // Spherical coordinates
  distance = 7.5;
  private targetDistance = 7.5;
  private minDistance = 2.8;
  private maxDistance = 24.0;

  // Azimuth (horizontal angle in radians)
  azimuth = Math.PI; // Looking along +Z towards south promenade
  private targetAzimuth = Math.PI;

  // Elevation (pitch angle in radians from vertical zenith)
  elevation = 1.25; // (~71 degrees default pleasant view)
  private targetElevation = 1.25;
  private minElevation = 0.05; // (~3 degrees: allows bird's-eye overhead view)
  private maxElevation = 2.45; // (~140 degrees: allows full upward gaze into the sky, sun, moon & stars)

  // Interaction tracking
  private isPointerDown = false;
  private activePointers = new Map<number, { x: number; y: number }>();
  private initialPinchDistance = 0;
  private initialPinchTargetDistance = 7.5;

  // FPV Mode state
  private isFPV = false;
  private savedDistance = 7.5;

  private unbindEvents: Array<() => void> = [];

  constructor(options: OrbitCameraOptions) {
    this.canvas = options.canvas;
    this.camera = options.camera;

    if (options.initialTarget) {
      this.target.copy(options.initialTarget);
      this.currentLookTarget.copy(options.initialTarget);
    }
    if (options.initialDistance !== undefined) {
      this.distance = options.initialDistance;
      this.targetDistance = options.initialDistance;
    }
    if (options.initialAzimuth !== undefined) {
      this.azimuth = options.initialAzimuth;
      this.targetAzimuth = options.initialAzimuth;
    }
    if (options.initialElevation !== undefined) {
      this.elevation = options.initialElevation;
      this.targetElevation = options.initialElevation;
    }

    this.bindEvents();
    this.updateTransform(1.0);
  }

  private bindEvents(): void {
    const onPointerDown = (e: PointerEvent) => {
      // Ignore if interaction is on UI overlay buttons or interactive elements
      const target = e.target as HTMLElement;
      if (target && target !== this.canvas) {
        if (
          target.closest?.('button, [role="button"], a, input, select, textarea, .pointer-events-auto') ||
          !target.classList.contains('pointer-events-none')
        ) {
          return;
        }
      }

      this.isPointerDown = true;
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.activePointers.size === 2) {
        const [p1, p2] = Array.from(this.activePointers.values());
        this.initialPinchDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        this.initialPinchTargetDistance = this.targetDistance;
      }
    };

    // 2. Pointer Move (Orbit & Pinch)
    const onPointerMove = (e: PointerEvent) => {
      if (!this.activePointers.has(e.pointerId)) return;

      const prev = this.activePointers.get(e.pointerId)!;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this.activePointers.size === 1) {
        // Single finger / mouse drag: Orbit rotation
        const sensitivity = 0.0055;
        this.targetAzimuth -= dx * sensitivity;
        this.targetElevation = Math.max(
          this.minElevation,
          Math.min(this.maxElevation, this.targetElevation - dy * sensitivity)
        );
      } else if (this.activePointers.size === 2) {
        // Two finger pinch: Zoom
        const [p1, p2] = Array.from(this.activePointers.values());
        const currentPinch = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (this.initialPinchDistance > 10) {
          const ratio = this.initialPinchDistance / Math.max(currentPinch, 1);
          this.targetDistance = Math.max(
            this.minDistance,
            Math.min(this.maxDistance, this.initialPinchTargetDistance * ratio)
          );
        }
      }
    };

    // 3. Pointer Up & Cancel
    const onPointerUp = (e: PointerEvent) => {
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size === 0) {
        this.isPointerDown = false;
      }
    };

    // 4. Mouse Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      const zoomFactor = 0.0025;
      this.targetDistance = Math.max(
        this.minDistance,
        Math.min(this.maxDistance, this.targetDistance + e.deltaY * zoomFactor * (this.targetDistance * 0.4))
      );
    };

    // Pointer down must only be captured on canvas, never on window
    this.canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
    this.canvas.addEventListener('wheel', onWheel, { passive: true });

    this.unbindEvents.push(() => {
      this.canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      this.canvas.removeEventListener('wheel', onWheel);
    });
  }

  /**
   * Updates camera transform with smooth damping physics.
   */
  update(delta: number): void {
    const dampFactor = 1 - Math.exp(-14 * delta);

    // Smooth spherical coordinates
    this.azimuth += (this.targetAzimuth - this.azimuth) * dampFactor;
    this.elevation += (this.targetElevation - this.elevation) * dampFactor;
    this.distance += (this.targetDistance - this.distance) * dampFactor;

    // Smooth target follow
    this.currentLookTarget.lerp(this.target, dampFactor);

    this.updateTransform();
  }

  setFPVMode(enabled: boolean): void {
    if (this.isFPV === enabled) return;
    this.isFPV = enabled;
    if (enabled) {
      this.savedDistance = this.targetDistance > 1.0 ? this.targetDistance : 7.5;
      this.minDistance = 0.01;
      this.targetDistance = 0.05;
      this.distance = 0.05;
    } else {
      this.minDistance = 2.8;
      this.targetDistance = this.savedDistance;
    }
  }

  getIsFPV(): boolean {
    return this.isFPV;
  }

  private updateTransform(_immediateFactor = 1.0): void {
    if (this.isFPV) {
      // First Person View (FPV) at character eye level (~1.55m)
      const eyeX = this.currentLookTarget.x;
      const eyeY = this.currentLookTarget.y + 0.35;
      const eyeZ = this.currentLookTarget.z;

      // In FPV, elevation acts as vertical pitch (elevation = PI/2 is horizontal, < PI/2 looks up, > PI/2 looks down)
      // We map elevation so that elevation > PI/2 pitches down, and elevation < PI/2 pitches up into the sky
      const pitch = (Math.PI * 0.5 - this.elevation);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const sinAzimuth = Math.sin(this.azimuth);
      const cosAzimuth = Math.cos(this.azimuth);

      const forwardX = -sinAzimuth * cosPitch;
      const forwardY = sinPitch;
      const forwardZ = -cosAzimuth * cosPitch;

      this.camera.position.set(eyeX, eyeY, eyeZ);
      this.camera.lookAt(
        eyeX + forwardX * 20,
        eyeY + forwardY * 20,
        eyeZ + forwardZ * 20
      );
      return;
    }

    // Standard Third-Person Orbit View
    const sinElevation = Math.sin(this.elevation);
    const cosElevation = Math.cos(this.elevation);
    const sinAzimuth = Math.sin(this.azimuth);
    const cosAzimuth = Math.cos(this.azimuth);

    // Look target tilts upward when player pitches camera up to view celestial sky
    const skyTiltOffset = Math.max(0, (this.elevation - 1.35) * 5.5);
    const lookPoint = new THREE.Vector3(
      this.currentLookTarget.x,
      this.currentLookTarget.y + skyTiltOffset,
      this.currentLookTarget.z
    );

    const x = this.currentLookTarget.x + this.distance * sinElevation * sinAzimuth;
    const y = Math.max(0.3, this.currentLookTarget.y + this.distance * cosElevation);
    const z = this.currentLookTarget.z + this.distance * sinElevation * cosAzimuth;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(lookPoint);
  }

  /**
   * Returns camera forward direction vector projected on the horizontal XZ plane.
   */
  getForwardVector(): THREE.Vector3 {
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  /**
   * Returns camera right direction vector projected on the horizontal XZ plane.
   */
  getRightVector(): THREE.Vector3 {
    const forward = this.getForwardVector();
    return new THREE.Vector3(-forward.z, 0, forward.x);
  }

  dispose(): void {
    for (const unbind of this.unbindEvents) {
      unbind();
    }
    this.unbindEvents = [];
    this.activePointers.clear();
  }
}
