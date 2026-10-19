/**
 * Lokam Mini — AssetRegistry
 * Central gateway for accessing game assets via stable dot-separated identifiers.
 * Prevents duplicated network requests and enables location-scoped asset unloading.
 */

import type * as THREE from 'three';
import { AssetCache } from './AssetCache';
import { AssetLoader } from './AssetLoader';
import { MaterialRegistry } from './MaterialRegistry';
import { SHARED_ASSETS_MANIFEST } from './manifests/shared.manifest';
import type { AssetDefinition, AssetScope, LoadedAsset, MaterialFamilyId } from './types';

export class AssetRegistry {
  private definitions = new Map<string, AssetDefinition>();
  private cache: AssetCache;
  private loader: AssetLoader;
  private materials: MaterialRegistry;

  constructor(materials?: MaterialRegistry) {
    this.cache = new AssetCache();
    this.loader = new AssetLoader();
    this.materials = materials || new MaterialRegistry();

    // Register all default shared assets
    this.registerManifest(SHARED_ASSETS_MANIFEST);
  }

  /**
   * Register a collection of asset definitions.
   */
  registerManifest(manifest: AssetDefinition[]): void {
    for (const def of manifest) {
      this.definitions.set(def.id, def);
    }
  }

  /**
   * Register an individual asset definition.
   */
  register(def: AssetDefinition): void {
    this.definitions.set(def.id, def);
  }

  /**
   * Query asset definition metadata without loading.
   */
  getDefinition(id: string): AssetDefinition | undefined {
    return this.definitions.get(id);
  }

  /**
   * Retrieve an asset by its stable ID.
   * If already loaded, returns cached copy.
   * If not loaded, loads, caches, and returns.
   */
  async get<T = unknown>(id: string): Promise<T> {
    // 1. Check cache first
    const cached = this.cache.get<T>(id);
    if (cached) {
      return this.cloneIfRequired(cached.data) as T;
    }

    // 2. Lookup definition
    const def = this.definitions.get(id);
    if (!def) {
      throw new Error(`[AssetRegistry] Asset ID "${id}" is not registered in any manifest.`);
    }

    // 3. Load via AssetLoader
    const loadedData = await this.loader.load<T>(def);

    // 4. Cache entry
    const entry: LoadedAsset<T> = {
      id: def.id,
      data: loadedData,
      type: def.type,
      scope: def.scope,
      loadedAt: Date.now(),
      refCount: 1,
    };
    this.cache.set(entry);

    return this.cloneIfRequired(loadedData) as T;
  }

  /**
   * Access a shared material family directly.
   */
  getMaterial(id: MaterialFamilyId | string): THREE.Material {
    return this.materials.get(id);
  }

  /**
   * Preload all assets flagged with preload in a given scope (e.g. "global")
   */
  async preloadScope(scope: AssetScope): Promise<void> {
    const promises: Promise<unknown>[] = [];
    for (const def of this.definitions.values()) {
      if (def.scope === scope && def.preload && !this.cache.has(def.id)) {
        promises.push(this.get(def.id));
      }
    }
    await Promise.all(promises);
  }

  /**
   * Unload all assets belonging to a specific location scope
   * when player transitions between locations.
   */
  unloadLocation(locationId: string): number {
    const scope: AssetScope = `location:${locationId}`;
    return this.cache.unloadScope(scope);
  }

  getCacheSize(): number {
    return this.cache.size();
  }

  getRegisteredIds(): string[] {
    return Array.from(this.definitions.keys());
  }

  dispose(): void {
    this.cache.clearAll();
    this.materials.dispose();
  }

  /**
   * Three.js Object3Ds (models) should be cloned so callers can transform
   * individual instances independently without altering the cached original.
   */
  private cloneIfRequired<T>(data: T): T {
    if (data && typeof (data as any).clone === 'function') {
      return (data as any).clone(true);
    }
    return data;
  }
}
