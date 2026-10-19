/**
 * Lokam Mini — Building Module Scaffold
 * Manages modular architectural kits and exterior-to-interior scene streaming.
 */

import { BaseModule } from '../core/lifecycle/BaseModule';
import type { EngineContext } from '../core/lifecycle/types';

export class BuildingModule extends BaseModule {
  protected async onInit(context: EngineContext): Promise<void> {
    const { eventBus } = context.services;

    const unbind = eventBus.on('interior:enter', ({ buildingId, interiorId }) => {
      // Stream interior scene and adjust exterior LOD
    });

    this.registerDisposable(unbind);
  }

  protected onStart(): void {}

  protected onUpdate(_delta: number, _elapsed: number): void {}

  protected onDispose(): void {
    // Teardown buildings
  }
}
