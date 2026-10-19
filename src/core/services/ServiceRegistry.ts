/**
 * Lokam Mini — Service Registry
 * Lightweight Inversion of Control (IoC) locator for essential shared services.
 * Eliminates random window globals and enforces clear dependency access.
 */

import type { EventBus } from '../events/EventBus';
import type { GlobalSettings } from '../config/GlobalSettings';
import type { AssetRegistry } from '../../assets/AssetRegistry';
import type { MaterialRegistry } from '../../assets/MaterialRegistry';
import type { LocationRegistry } from '../../locations/registry/LocationRegistry';
import type { AudioService } from '../../audio/AudioService';
import type { InputService } from '../../input/InputService';
import type { SkyService } from '../../world/sky/SkyService';

export interface KnownServices {
  eventBus: EventBus;
  settings: GlobalSettings;
  assets: AssetRegistry;
  materials: MaterialRegistry;
  locations: LocationRegistry;
  audio: AudioService;
  input: InputService;
  sky: SkyService;
}

export class ServiceRegistry {
  private services = new Map<string, unknown>();

  register<K extends keyof KnownServices>(name: K, service: KnownServices[K]): void;
  register<T>(name: string, service: T): void;
  register(name: string, service: unknown): void {
    if (this.services.has(name)) {
      console.warn(`[ServiceRegistry] Service "${name}" is being overwritten.`);
    }
    this.services.set(name, service);
  }

  get<K extends keyof KnownServices>(name: K): KnownServices[K];
  get<T>(name: string): T;
  get(name: string): unknown {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`[ServiceRegistry] Requested service "${name}" is not registered.`);
    }
    return service;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  get eventBus(): EventBus {
    return this.get('eventBus');
  }

  get settings(): GlobalSettings {
    return this.get('settings');
  }

  get assets(): AssetRegistry {
    return this.get('assets');
  }

  get materials(): MaterialRegistry {
    return this.get('materials');
  }

  get locations(): LocationRegistry {
    return this.get('locations');
  }

  get audio(): AudioService {
    return this.get('audio');
  }

  get input(): InputService {
    return this.get('input');
  }

  get sky(): SkyService {
    return this.get('sky');
  }

  dispose(): void {
    for (const [name, service] of this.services.entries()) {
      if (service && typeof (service as any).dispose === 'function') {
        try {
          (service as any).dispose();
        } catch (err) {
          console.error(`[ServiceRegistry] Error disposing service "${name}":`, err);
        }
      }
    }
    this.services.clear();
  }
}
