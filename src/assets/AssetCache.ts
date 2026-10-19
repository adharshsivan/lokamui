/**
 * Lokam Mini — AssetCache
 * Manages asset in-memory retention, prevents memory leaks,
 * and purges location-scoped assets while preserving global shared assets.
 */

import type { AssetScope, LoadedAsset } from './types';

export class AssetCache {
  private cache = new Map<string, LoadedAsset>();

  has(id: string): boolean {
    return this.cache.has(id);
  }

  get<T = unknown>(id: string): LoadedAsset<T> | undefined {
    const entry = this.cache.get(id);
    if (entry) {
      entry.refCount++;
      return entry as LoadedAsset<T>;
    }
    return undefined;
  }

  set<T = unknown>(entry: LoadedAsset<T>): void {
    this.cache.set(entry.id, entry as LoadedAsset<unknown>);
  }

  release(id: string): void {
    const entry = this.cache.get(id);
    if (entry) {
      entry.refCount = Math.max(0, entry.refCount - 1);
    }
  }

  /**
   * Unload all assets belonging to a specific location scope.
   * Truly shared/global assets are strictly preserved.
   */
  unloadScope(scope: AssetScope): number {
    if (scope === 'global') {
      console.warn('[AssetCache] Attempted to unload global scope. Skipping.');
      return 0;
    }

    let purgedCount = 0;
    for (const [id, entry] of this.cache.entries()) {
      if (entry.scope === scope) {
        this.disposeAsset(entry);
        this.cache.delete(id);
        purgedCount++;
      }
    }

    return purgedCount;
  }

  clearAll(): void {
    for (const entry of this.cache.values()) {
      this.disposeAsset(entry);
    }
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getEntries(): ReadonlyArray<LoadedAsset> {
    return Array.from(this.cache.values());
  }

  private disposeAsset(entry: LoadedAsset): void {
    const data = entry.data as any;
    if (!data) return;

    try {
      // Three.js object disposal
      if (typeof data.dispose === 'function') {
        data.dispose();
      } else if (data.geometry && typeof data.geometry.dispose === 'function') {
        data.geometry.dispose();
      }

      // If it's a Three.js scene/group, traverse and dispose
      if (data.traverse && typeof data.traverse === 'function') {
        data.traverse((child: any) => {
          if (child.geometry && typeof child.geometry.dispose === 'function') {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose && m.dispose());
            } else if (typeof child.material.dispose === 'function') {
              child.material.dispose();
            }
          }
        });
      }
    } catch (err) {
      console.warn(`[AssetCache] Error disposing asset "${entry.id}":`, err);
    }
  }
}
