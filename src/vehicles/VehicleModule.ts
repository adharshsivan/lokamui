/**
 * Lokam Mini — Vehicle Module Scaffold
 * Manages vehicle spawning, physics attachment, and player enter/exit handling.
 */

import { BaseModule } from '../core/lifecycle/BaseModule';
import type { EngineContext } from '../core/lifecycle/types';

export class VehicleModule extends BaseModule {
  protected async onInit(context: EngineContext): Promise<void> {
    const { eventBus } = context.services;

    const unbind = eventBus.on('player:enteredVehicle', ({ vehicleId, playerId }) => {
      // Handle vehicle mounting without coupling to player internals
    });

    this.registerDisposable(unbind);
  }

  protected onStart(): void {}

  protected onUpdate(_delta: number, _elapsed: number): void {
    // Step vehicle physics
  }

  protected onDispose(): void {
    // Teardown vehicles
  }
}
