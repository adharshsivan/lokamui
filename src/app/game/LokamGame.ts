/**
 * Lokam Mini — LokamGame
 * High-level project orchestrator.
 * Connects GameEngine, ServiceRegistry, and LifecycleManager without bloated gameplay logic.
 */

import { GameEngine } from '../../core/engine/GameEngine';
import { EventBus } from '../../core/events/EventBus';
import { GlobalSettings } from '../../core/config/GlobalSettings';
import { ServiceRegistry } from '../../core/services/ServiceRegistry';
import { LifecycleManager } from '../../core/lifecycle/LifecycleManager';
import { AssetRegistry } from '../../assets/AssetRegistry';
import { MaterialRegistry } from '../../assets/MaterialRegistry';
import { LocationRegistry } from '../../locations/registry/LocationRegistry';
import { AudioService } from '../../audio/AudioService';
import { InputService } from '../../input/InputService';
import { KochiIslandPackage } from '../../locations/kochi-island';
import { CharacterModule } from '../../characters/CharacterModule';
import { SkyService } from '../../world/sky/SkyService';
import { SkyModule } from '../../world/sky/SkyModule';
import { PerformanceMonitor } from '../../performance/PerformanceMonitor';
import type { EngineContext } from '../../core/lifecycle/types';

export interface LokamGameOptions {
  canvas: HTMLCanvasElement;
  onPerformanceUpdate?: (stats: any) => void;
}

export class LokamGame {
  readonly services: ServiceRegistry;
  readonly lifecycle: LifecycleManager;
  readonly perfMonitor: PerformanceMonitor;
  private engine: GameEngine;
  private context: EngineContext;
  private isDestroyed = false;

  constructor(options: LokamGameOptions) {
    // 1. Initialize isolated services
    const eventBus = new EventBus();
    const settings = new GlobalSettings();
    const materials = new MaterialRegistry();
    const assets = new AssetRegistry(materials);
    const locations = new LocationRegistry();
    const audio = new AudioService(settings);
    const input = new InputService(eventBus);
    const sky = new SkyService(eventBus);

    this.services = new ServiceRegistry();
    this.services.register('eventBus', eventBus);
    this.services.register('settings', settings);
    this.services.register('materials', materials);
    this.services.register('assets', assets);
    this.services.register('locations', locations);
    this.services.register('audio', audio);
    this.services.register('input', input);
    this.services.register('sky', sky);

    this.lifecycle = new LifecycleManager();
    this.lifecycle.register('sky', new SkyModule(), 100);
    this.lifecycle.register('character', new CharacterModule(), 10);
    this.perfMonitor = new PerformanceMonitor();

    // 2. Initialize Game Engine
    this.engine = new GameEngine({
      canvas: options.canvas,
      settings,
      eventBus,
    });

    // Initialize Sky Dome, Celestial Lighting, and 3D RainFX
    sky.initSkyDome(this.engine.scene);
    sky.initRain(this.engine.getCanvas());

    this.context = {
      engine: this.engine,
      services: this.services,
    };

    locations.setContext(this.context);

    // 3. Register standard Kochi Island location
    locations.register(new KochiIslandPackage());

    // 4. Hook up per-frame update loop
    this.engine.onUpdate((delta, elapsed) => {
      if (this.isDestroyed) return;
      sky.update(this.engine.camera, delta);
      locations.update(delta, elapsed);
      this.lifecycle.updateAll(delta, elapsed);

      const stats = this.perfMonitor.update(this.engine.renderer);
      if (options.onPerformanceUpdate) {
        options.onPerformanceUpdate(stats);
      }
    });
  }

  async start(): Promise<void> {
    if (this.isDestroyed) return;

    // Preload global scope assets (palms, benches, animations)
    await this.services.assets.preloadScope('global');

    // Initialize all registered lifecycle modules
    await this.lifecycle.initAll(this.context);

    // Load initial location (Fort Kochi)
    await this.services.locations.switchLocation('kochi-island');

    // Start lifecycle modules and render loop
    this.lifecycle.startAll();
    this.engine.start();
  }

  getEngine(): GameEngine {
    return this.engine;
  }

  getContext(): EngineContext {
    return this.context;
  }

  dispose(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.lifecycle.disposeAll();
    this.services.dispose();
    this.engine.dispose();
  }
}
