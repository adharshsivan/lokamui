/**
 * Lokam Mini — Kochi Island Package
 * First location package adhering to independent package lifecycle.
 */

import * as THREE from 'three';
import type { EngineContext } from '../../core/lifecycle/types';
import type { ILocationPackage, InteractionPoint, LocationConfig, SpawnPoint } from '../types';
import { KOCHI_ISLAND_CONFIG } from './config';
import { KochiEnvironment } from './environment';
import { KOCHI_INTERACTIONS } from './interactions';
import { KOCHI_SPAWN_POINTS } from './spawn-points';

export class KochiIslandPackage implements ILocationPackage {
  readonly id = 'kochi-island';
  readonly name = 'Fort Kochi Coastal Isle';
  readonly config: LocationConfig = KOCHI_ISLAND_CONFIG;

  private _isLoaded = false;
  private rootGroup = new THREE.Group();
  private environment: KochiEnvironment | null = null;
  private scene: THREE.Scene | null = null;
  private context: EngineContext | null = null;

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  async load(context: EngineContext): Promise<void> {
    if (this._isLoaded) return;

    this.context = context;
    this.scene = context.engine.scene;
    this.rootGroup.name = 'location_kochi_island_root';

    // 1. Setup Environment & Lighting
    this.environment = new KochiEnvironment(this.config, context.services.materials);
    this.environment.build();
    this.rootGroup.add(this.environment.group);

    // 2. Wire Vice City-Style Chromatic Building Entrance Event
    this.environment.onBuildingEnter((building) => {
      context.services.eventBus.emit('interior:enter', {
        buildingId: building.id,
        interiorId: building.id,
        buildingData: building,
      } as any);
    });

    // 3. Preload location-critical shared assets (e.g. coconut palms, benches)
    const assets = context.services.assets;
    try {
      await assets.get('tree.coconut.01');
      await assets.get('prop.bench.wood.01');
    } catch (err) {
      console.warn('[KochiIslandPackage] Optional asset preload note:', err);
    }

    // 4. Sky & Atmosphere managed by SkyService
    this._isLoaded = true;
  }

  start(): void {
    if (!this._isLoaded || !this.scene) return;
    if (!this.scene.children.includes(this.rootGroup)) {
      this.scene.add(this.rootGroup);
    }
  }

  update(delta: number, elapsed: number): void {
    if (!this._isLoaded) return;
    if (this.environment) {
      const playerPos = this.context?.engine?.cameraController?.target;
      this.environment.update(delta, elapsed, playerPos);
    }
  }

  unload(): void {
    if (!this._isLoaded) return;

    // Detach from Three.js scene
    if (this.scene && this.scene.children.includes(this.rootGroup)) {
      this.scene.remove(this.rootGroup);
      this.scene.fog = null;
    }

    // Dispose environment meshes & lights
    if (this.environment) {
      this.environment.dispose();
      this.environment = null;
    }

    this.rootGroup.clear();
    this._isLoaded = false;
    this.scene = null;
  }

  getSpawnPoint(type: 'player' | 'vehicle' | 'boat' = 'player'): SpawnPoint {
    const found = KOCHI_SPAWN_POINTS.find((sp) => sp.type === type);
    return found || KOCHI_SPAWN_POINTS[0];
  }

  getInteractions(): ReadonlyArray<InteractionPoint> {
    return KOCHI_INTERACTIONS;
  }
}
