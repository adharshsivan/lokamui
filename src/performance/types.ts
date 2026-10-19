/**
 * Lokam Mini — Performance Monitoring & Optimization Contracts
 */

export interface FramePerformanceStats {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}
