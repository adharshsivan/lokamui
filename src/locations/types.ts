/**
 * Lokam Mini — Location Package Types
 */

import type { EngineContext } from '../core/lifecycle/types';

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface SpawnPoint {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  type: 'player' | 'vehicle' | 'boat' | 'npc';
}

export interface InteractionPoint {
  id: string;
  type: 'seating' | 'fast_travel' | 'door_interior' | 'inspect' | 'dialogue';
  position: [number, number, number];
  radius: number;
  label: string;
  data?: Record<string, unknown>;
}

export interface LocationConfig {
  id: string;
  name: string;
  displayName: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  lighting: {
    ambientColor: number;
    ambientIntensity: number;
    sunColor: number;
    sunIntensity: number;
    sunPosition: [number, number, number];
    fogColor: number;
    fogNear: number;
    fogFar: number;
  };
  waterLevel: number;
}

export interface ILocationPackage {
  readonly id: string;
  readonly name: string;
  readonly config: LocationConfig;
  readonly isLoaded: boolean;

  /**
   * Load terrain, spawn points, environmental lighting, and location-scoped assets.
   */
  load(context: EngineContext): Promise<void>;

  /**
   * Activate the location in the active Three.js scene.
   */
  start(): void;

  /**
   * Per-frame simulation for water waves, animated props, dynamic lighting.
   */
  update(delta: number, elapsed: number): void;

  /**
   * Cleanly detach from scene graph, dispose Three.js meshes, and release location assets.
   */
  unload(): void;

  /**
   * Query spawn point by ID or type.
   */
  getSpawnPoint(type?: 'player' | 'vehicle' | 'boat'): SpawnPoint;

  /**
   * Get all registered interactive trigger points in this location.
   */
  getInteractions(): ReadonlyArray<InteractionPoint>;
}
