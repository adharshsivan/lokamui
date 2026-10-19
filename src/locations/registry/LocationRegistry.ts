/**
 * Lokam Mini — LocationRegistry
 * Manages registered location packages and orchestrates zero-leak location transitions.
 */

import type { EngineContext } from '../../core/lifecycle/types';
import type { ILocationPackage } from '../types';

export class LocationRegistry {
  private locations = new Map<string, ILocationPackage>();
  private activeLocation: ILocationPackage | null = null;
  private context: EngineContext | null = null;

  setContext(context: EngineContext): void {
    this.context = context;
  }

  register(location: ILocationPackage): void {
    this.locations.set(location.id, location);
  }

  get(id: string): ILocationPackage | undefined {
    return this.locations.get(id);
  }

  getActiveLocation(): ILocationPackage | null {
    return this.activeLocation;
  }

  getAll(): ILocationPackage[] {
    return Array.from(this.locations.values());
  }

  /**
   * Switch the active location.
   * Gracefully unloads the current location, purges location-scoped assets,
   * loads the target location, and starts its environment.
   */
  async switchLocation(targetLocationId: string): Promise<ILocationPackage> {
    if (!this.context) {
      throw new Error('[LocationRegistry] Cannot switch location: context is not set.');
    }

    const target = this.locations.get(targetLocationId);
    if (!target) {
      throw new Error(`[LocationRegistry] Target location "${targetLocationId}" is not registered.`);
    }

    const { services } = this.context;
    const eventBus = services.eventBus;
    const assetRegistry = services.assets;

    // 1. Unload current location if present
    if (this.activeLocation) {
      const prevId = this.activeLocation.id;
      this.activeLocation.unload();
      assetRegistry.unloadLocation(prevId);
      eventBus.emit('location:unloaded', { locationId: prevId });
      this.activeLocation = null;
    }

    // 2. Announce loading progress
    eventBus.emit('location:loading', { locationId: target.id, progress: 0.1 });

    // 3. Load target location package
    await target.load(this.context);
    eventBus.emit('location:loading', { locationId: target.id, progress: 0.8 });

    // 4. Activate in scene
    target.start();
    this.activeLocation = target;

    // 5. Emit completed events
    eventBus.emit('location:loaded', { locationId: target.id, name: target.name });
    eventBus.emit('world:ready', { locationId: target.id });

    return target;
  }

  update(delta: number, elapsed: number): void {
    if (this.activeLocation && this.activeLocation.isLoaded) {
      this.activeLocation.update(delta, elapsed);
    }
  }

  dispose(): void {
    if (this.activeLocation) {
      this.activeLocation.unload();
      this.activeLocation = null;
    }
    this.locations.clear();
    this.context = null;
  }
}
