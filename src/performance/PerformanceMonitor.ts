/**
 * Lokam Mini — Performance Monitor
 * Continuously samples frame rendering stats and dispatches performance telemetry.
 */

import type * as THREE from 'three';
import type { FramePerformanceStats } from './types';

export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private stats: FramePerformanceStats = {
    fps: 60,
    frameTimeMs: 16.6,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
  };

  update(renderer?: THREE.WebGLRenderer): FramePerformanceStats {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 500) {
      this.stats.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.stats.frameTimeMs = parseFloat((elapsed / this.frameCount).toFixed(1));
      this.frameCount = 0;
      this.lastTime = now;

      if (renderer) {
        const renderInfo = renderer.info;
        this.stats.drawCalls = renderInfo.render.calls;
        this.stats.triangles = renderInfo.render.triangles;
        this.stats.geometries = renderInfo.memory.geometries;
        this.stats.textures = renderInfo.memory.textures;
      }
    }

    return this.stats;
  }

  get currentStats(): Readonly<FramePerformanceStats> {
    return this.stats;
  }
}
