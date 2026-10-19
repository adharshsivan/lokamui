/**
 * Lokam Mini — Multiplayer Module Scaffold
 * Manages peer connection lifecycle and entity state replication.
 */

import { BaseModule } from '../core/lifecycle/BaseModule';
import type { EngineContext } from '../core/lifecycle/types';

export class MultiplayerModule extends BaseModule {
  protected async onInit(context: EngineContext): Promise<void> {
    const { eventBus } = context.services;

    const unbind = eventBus.on('player:spawned', ({ playerId, position }) => {
      // Announce local player position to peer network
    });

    this.registerDisposable(unbind);
  }

  protected onStart(): void {}

  protected onUpdate(_delta: number, _elapsed: number): void {
    // Interpolate remote players
  }

  protected onDispose(): void {
    // Disconnect peers
  }
}
