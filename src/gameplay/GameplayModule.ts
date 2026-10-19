/**
 * Lokam Mini — Gameplay Module Scaffold
 * Handles spatial interaction detection, prompt announcements, and camera triggers.
 */

import { BaseModule } from '../core/lifecycle/BaseModule';
import type { EngineContext } from '../core/lifecycle/types';

export class GameplayModule extends BaseModule {
  protected async onInit(context: EngineContext): Promise<void> {
    const { eventBus } = context.services;

    const unbind = eventBus.on('interaction:started', ({ interactionId, type }) => {
      // Coordinate interaction flow (seating, fast travel)
    });

    this.registerDisposable(unbind);
  }

  protected onStart(): void {}

  protected onUpdate(_delta: number, _elapsed: number): void {
    // Proximity check for nearest interactable
  }

  protected onDispose(): void {}
}
