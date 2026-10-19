/**
 * Lokam Mini — World Module Scaffold
 * Manages overarching day-night cycle, global weather hints, and ocean tides.
 */

import { BaseModule } from '../core/lifecycle/BaseModule';
import type { EngineContext } from '../core/lifecycle/types';

export class WorldModule extends BaseModule {
  private timeOfDay = 14.0; // 2:00 PM tropical afternoon

  protected async onInit(context: EngineContext): Promise<void> {
    const { eventBus } = context.services;

    const unbind = eventBus.on('world:ready', ({ locationId }) => {
      // Sync world ambient systems to active location
    });

    this.registerDisposable(unbind);
  }

  protected onStart(): void {}

  protected onUpdate(delta: number, _elapsed: number): void {
    // Subtle time progression
    this.timeOfDay = (this.timeOfDay + delta * 0.01) % 24.0;
  }

  protected onDispose(): void {}
}
